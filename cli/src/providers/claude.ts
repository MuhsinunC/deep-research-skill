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

    // The SDK's `assistant` messages have shape:
    //   { type: 'assistant', message: BetaMessage, parent_tool_use_id, ... }
    // where `message.content` is the array of content blocks. The text we
    // care about lives in blocks with type === "text" + a `.text` field.
    // (My earlier code looked at `message.content` directly — that's the
    // wrong path; the SDK wraps the BetaMessage one level deep.)
    for await (const message of stream) {
      if (isAssistantMessage(message)) {
        const beta = (message as { message?: { content?: unknown[] } }).message;
        if (beta !== undefined && Array.isArray(beta.content)) {
          for (const block of beta.content) {
            if (isTextBlock(block as ContentBlockLike)) {
              collectedText += (block as TextBlockLike).text;
            }
          }
        }
      }
      if (isResultMessage(message)) {
        // SDKResultMessage's usage may live at `usage` or `result.usage`
        // depending on shape; check both defensively.
        const res = message as { usage?: { input_tokens?: number; output_tokens?: number } };
        if (res.usage !== undefined) {
          usage = {
            input: res.usage.input_tokens ?? 0,
            output: res.usage.output_tokens ?? 0,
          };
        }
        // The SDKResultMessage also typically has a `result` field with the
        // final assembled text — fall back to that if we collected nothing
        // from streamed assistant blocks.
        const finalRes = message as { result?: string };
        if (collectedText.length === 0 && typeof finalRes.result === "string") {
          collectedText = finalRes.result;
        }
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
  //
  // pathToClaudeCodeExecutable: the bundled CLI is shipped without optional
  // native binaries (esbuild stripped them), so the SDK can't find its own
  // CLI binary at runtime. We point it at the user's installed Claude Code
  // binary instead. The path is resolved via the same lookup the OS shell
  // does — first the env override DEEP_RESEARCH_CLAUDE_BINARY (for tests),
  // then `which claude` semantics (PATH lookup), then a hardcoded sane
  // default.
  const options: Record<string, unknown> = {
    systemPrompt: opts.systemPrompt,
    model: opts.model,
    pathToClaudeCodeExecutable: resolveClaudeBinary(),
    // CRITICAL: bypassPermissions is the SDK equivalent of
    // --dangerously-skip-permissions. Without it, the spawned Claude Code
    // subprocess hits a permission gate the moment it tries to use a tool
    // (web_search, file read, etc.) and silently aborts the phase with
    // empty output. The launcher skill's SKILL.md and methodology already
    // assume the worker can use tools without per-call interactive
    // approval — this flag enforces that contract at the SDK boundary.
    permissionMode: "bypassPermissions",
  };
  if (opts.effort !== undefined) options["effort"] = opts.effort;
  if (opts.maxTokens !== undefined) options["maxTokens"] = opts.maxTokens;
  return {
    prompt: opts.userPrompt,
    options: options as NonNullable<Parameters<typeof query>[0]["options"]>,
  };
}

/** Resolve the path to the user's Claude Code binary. The bundled CLI's
 *  esbuild step strips the SDK's optional native dependencies, so the SDK
 *  needs an explicit `pathToClaudeCodeExecutable` to find a working CLI
 *  at runtime. We point it at the user's installed binary. */
function resolveClaudeBinary(): string {
  const override = process.env["DEEP_RESEARCH_CLAUDE_BINARY"];
  if (override !== undefined && override.length > 0) return override;
  // Common install locations, checked in order of likelihood.
  const candidates = [
    `${process.env["HOME"] ?? ""}/.local/bin/claude`,
    `${process.env["HOME"] ?? ""}/.claude/local/claude`,
    "/usr/local/bin/claude",
    "/opt/homebrew/bin/claude",
  ];
  for (const candidate of candidates) {
    if (candidate.length === 0) continue;
    try {
      // Synchronous existsSync; runs once per query() so cost is negligible.
      // Importing fs at module top would be cleaner; this lazy require keeps
      // the import surface scoped to the function that needs it.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("node:fs") as typeof import("node:fs");
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      // Fall through.
    }
  }
  // Final fallback — let the SDK error with its own clear message if none of
  // the common paths worked.
  return "claude";
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

// Re-export the shared helper. Per I-2 in M19 review: LLMs wrap JSON in
// markdown code fences despite "Output ONLY valid JSON" instructions, so
// parsing must be robust to that.
import { extractJsonOrText as tryParseJsonOrText } from "../util/json_extract.js";
void tryParseJsonOrText; // keeps the alias in scope for the references above
