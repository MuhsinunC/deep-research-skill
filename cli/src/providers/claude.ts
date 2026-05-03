// ClaudeAgentSdkProvider — production provider using @anthropic-ai/claude-agent-sdk.
//
// This is the default provider. It uses the Claude Code TypeScript SDK
// which routes through the user's Claude Code subscription quota (no
// separate API key needed; the SDK uses the Claude Code OAuth token).
//
// IMPORTANT: this is a v1 implementation focused on contract compliance.
// The SDK's `query()` is wrapped to fit our AgentProvider contract:
//   - callJudgment → single query() call, full response collected, token
//     usage captured from the result message
//   - fanOut → parallel query() calls (one per SubAgentSpec), each writing
//     to its outputFile atomically before its promise resolves
//
// The SDK supports richer features (sub-agent orchestration via
// AgentDefinition, MCP servers, hooks) that we do not use in v1 — the
// orchestrator is the deterministic state machine, not the SDK's
// agent-loop. Sub-agents are just parallel one-shot queries.

import { query } from "@anthropic-ai/claude-agent-sdk";
import { writeAtomicText } from "../state/atomic.js";
import type {
  AgentProvider,
  EffortHint,
  FanOutRequest,
  FanOutResponse,
  JudgmentRequest,
  JudgmentResponse,
  SubAgentResult,
  SubAgentSpec,
} from "./types.js";
import { ProviderParseError } from "./types.js";

export class ClaudeAgentSdkProvider implements AgentProvider {
  async callJudgment(req: JudgmentRequest): Promise<JudgmentResponse> {
    const startedAt = performance.now();
    const baseQueryOpts = buildQueryOpts(req.systemPrompt, req.userPrompt, req);
    const { text, usage } = await this.runQuery(baseQueryOpts);
    const durationMs = Math.max(1, Math.round(performance.now() - startedAt));

    let retries = 0;
    let parsed: unknown;
    if (req.responseSchema !== undefined) {
      const tried = req.responseSchema.safeParse(tryParseJsonOrText(text));
      if (!tried.success) {
        // One retry with the same prompt + an explicit "previous reply was
        // malformed; return only valid output" suffix.
        retries = 1;
        const retryUserPrompt = `${req.userPrompt}\n\n[NOTE: prior response did not match the expected schema. Please return only output that satisfies the schema, with no preamble or commentary.]`;
        const retried = await this.runQuery(
          buildQueryOpts(req.systemPrompt, retryUserPrompt, req),
        );
        const retriedParse = req.responseSchema.safeParse(tryParseJsonOrText(retried.text));
        if (!retriedParse.success) {
          throw new ProviderParseError(
            "Claude judgment response did not match responseSchema after retry",
            retried.text,
            1,
            retriedParse.error,
          );
        }
        parsed = retriedParse.data;
        const response: JudgmentResponse = {
          text: retried.text,
          usage: retried.usage,
          durationMs: Math.max(1, Math.round(performance.now() - startedAt)),
          retries,
        };
        if (parsed !== undefined) response.parsed = parsed;
        return response;
      }
      parsed = tried.data;
    }
    const response: JudgmentResponse = { text, usage, durationMs, retries };
    if (parsed !== undefined) response.parsed = parsed;
    return response;
  }

  async fanOut(req: FanOutRequest): Promise<FanOutResponse> {
    // Parallel: one Promise per sub-agent, all dispatched in one tick, then
    // Promise.all waits for the slowest. Per C4, each sub-agent writes its
    // outputFile BEFORE its individual promise resolves.
    const results = await Promise.all(
      req.agents.map((spec) => this.runSubAgent(spec, req.timeoutMs)),
    );
    return { results };
  }

  private async runSubAgent(
    spec: SubAgentSpec,
    timeoutMs: number,
  ): Promise<SubAgentResult> {
    const startedAt = performance.now();
    let timeoutHandle: NodeJS.Timeout | undefined;
    try {
      const queryPromise = this.runQuery(
        buildQueryOpts(spec.systemPrompt, spec.userPrompt, spec),
      );
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(
          () =>
            reject(
              Object.assign(new Error("sub-agent timed out"), { name: "TimeoutError" }),
            ),
          timeoutMs,
        );
      });
      const { text, usage } = await Promise.race([queryPromise, timeoutPromise]);
      // Per C4: write outputFile BEFORE returning ok status.
      await writeAtomicText(spec.outputFile, text);
      const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
      const result: SubAgentResult = {
        name: spec.name,
        status: "ok",
        outputFile: spec.outputFile,
        fileWritten: true,
        text,
        durationMs,
        usage,
      };
      return result;
    } catch (err: unknown) {
      const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
      const isTimeout =
        err instanceof Error && (err as { name?: string }).name === "TimeoutError";
      const status = isTimeout ? "timeout" : "error";
      const message = err instanceof Error ? err.message : String(err);
      const result: SubAgentResult = {
        name: spec.name,
        status,
        outputFile: spec.outputFile,
        fileWritten: false,
        text: "",
        error: message,
        durationMs,
      };
      return result;
    } finally {
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
    }
  }

  async close(): Promise<void> {
    // The SDK manages its own connection lifecycle per query() call; there
    // are no long-lived handles to clean up.
  }

  /** Internal helper: runs an SDK query() and aggregates the streaming
   *  response into a final text + usage tuple. */
  private async runQuery(opts: {
    systemPrompt: string;
    userPrompt: string;
    model: string;
    maxTokens?: number;
    effort?: EffortHint;
  }): Promise<{ text: string; usage: { input: number; output: number } }> {
    // The SDK's query() returns an async iterable of SDK message objects.
    // We collect text from "text" content blocks and usage from the final
    // result message.
    const queryArgs = buildQueryArgs(opts);
    const stream = query(queryArgs);

    let collectedText = "";
    let usage = { input: 0, output: 0 };

    for await (const message of stream) {
      // Type-narrow against a defensive shape: the SDK may emit several
      // message types we don't care about. We pluck text content and the
      // result-tier usage.
      if (isAssistantMessage(message)) {
        for (const block of message.content) {
          if (isTextBlock(block)) {
            collectedText += block.text;
          }
        }
      }
      if (isResultMessage(message) && message.usage !== undefined) {
        usage = {
          input: message.usage.input_tokens ?? 0,
          output: message.usage.output_tokens ?? 0,
        };
      }
    }

    return { text: collectedText, usage };
  }
}

/** Build the runQuery() options payload from a request, omitting absent
 *  optional fields (required by `exactOptionalPropertyTypes: true`). */
function buildQueryOpts(
  systemPrompt: string,
  userPrompt: string,
  source: { model: string; maxTokens?: number; effort?: EffortHint },
): {
  systemPrompt: string;
  userPrompt: string;
  model: string;
  maxTokens?: number;
  effort?: EffortHint;
} {
  return {
    systemPrompt,
    userPrompt,
    model: source.model,
    ...(source.maxTokens !== undefined && { maxTokens: source.maxTokens }),
    ...(source.effort !== undefined && { effort: source.effort }),
  };
}

function buildQueryArgs(opts: {
  systemPrompt: string;
  userPrompt: string;
  model: string;
  maxTokens?: number;
  effort?: EffortHint;
}): Parameters<typeof query>[0] {
  // The SDK's query() takes { prompt, options } — see sdk.d.ts. We pass the
  // user prompt as the prompt and the system prompt + model + effort via
  // options. Token cap is an SDK-level concern; pass through if specified.
  const options: Record<string, unknown> = {
    systemPrompt: opts.systemPrompt,
    model: opts.model,
  };
  if (opts.effort !== undefined) options["effort"] = opts.effort;
  if (opts.maxTokens !== undefined) options["maxTokens"] = opts.maxTokens;
  return {
    prompt: opts.userPrompt,
    options: options as NonNullable<Parameters<typeof query>[0]["options"]>,
  };
}

// --- Defensive type guards for SDK message shapes ---

interface AssistantLike {
  type: "assistant";
  content: ContentBlockLike[];
}

interface ContentBlockLike {
  type: string;
}

interface TextBlockLike extends ContentBlockLike {
  type: "text";
  text: string;
}

interface ResultMessageLike {
  type: "result";
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

function isAssistantMessage(msg: unknown): msg is AssistantLike {
  return (
    typeof msg === "object" &&
    msg !== null &&
    "type" in msg &&
    (msg as { type: unknown }).type === "assistant" &&
    "content" in msg &&
    Array.isArray((msg as { content: unknown }).content)
  );
}

function isTextBlock(block: ContentBlockLike): block is TextBlockLike {
  return block.type === "text" && "text" in block && typeof (block as { text: unknown }).text === "string";
}

function isResultMessage(msg: unknown): msg is ResultMessageLike {
  return (
    typeof msg === "object" &&
    msg !== null &&
    "type" in msg &&
    (msg as { type: unknown }).type === "result"
  );
}

function tryParseJsonOrText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
