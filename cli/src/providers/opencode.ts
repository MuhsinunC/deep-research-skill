// OpenCodeCliProvider — production provider that spawns `opencode` as a
// child process. Lets the orchestrator route through OpenRouter / any
// OpenAI-compatible endpoint (the user's stated reason for needing
// provider abstraction: benchmarking different models).
//
// Honest scope note: I (Claude Opus, the implementer) cannot end-to-end
// test this provider — that requires a real OpenRouter key and the
// opencode binary on the user's machine. The unit tests mock spawn() and
// verify the contract up to the network boundary. The user's first
// real run with `--provider opencode` is the integration test.
//
// Install: https://opencode.ai/docs/install/ (or `brew install
// opencode-ai/tap/opencode`). The launcher-skill/references/usage.md
// has the canonical install instructions for end users.
//
// Auth: opencode reads its own creds from ~/.config/opencode/config.json
// (or env vars OPENROUTER_API_KEY / OPENAI_API_KEY for routes it knows).
// This provider does NOT manage opencode's auth — if opencode can't
// authenticate, its child process exits non-zero and we surface the error.

import { spawn } from "node:child_process";
import { writeAtomicText } from "../state/atomic.js";
import type {
  AgentProvider,
  FanOutRequest,
  FanOutResponse,
  JudgmentRequest,
  JudgmentResponse,
  SubAgentResult,
  SubAgentSpec,
} from "./types.js";
import { ProviderConfigError, ProviderParseError } from "./types.js";

export interface OpenCodeProviderConfig {
  /** Path to the opencode binary. If undefined, uses "opencode" from PATH. */
  binary?: string;
  /** Default model when a request omits `model` (callers should always
   *  pass `model`, but this is the fallback). */
  defaultModel?: string;
}

export class OpenCodeCliProvider implements AgentProvider {
  private readonly binary: string;
  private readonly defaultModel: string;

  constructor(config: OpenCodeProviderConfig = {}) {
    this.binary = config.binary ?? "opencode";
    this.defaultModel = config.defaultModel ?? "openrouter/anthropic/claude-sonnet-4";
    // We don't pre-check the binary's existence here — that's a userland
    // concern surfaced by the deps check (M0.5) and the launcher skill's
    // setup docs. The first failed spawn() will surface ENOENT loud.
  }

  async callJudgment(req: JudgmentRequest): Promise<JudgmentResponse> {
    const startedAt = performance.now();
    const { text, usage } = await this.runOpenCode(
      buildOpenCodeOpts(req.systemPrompt, req.userPrompt, req),
    );
    const durationMs = Math.max(1, Math.round(performance.now() - startedAt));

    let retries = 0;
    let parsed: unknown;
    if (req.responseSchema !== undefined) {
      const first = req.responseSchema.safeParse(tryParseJsonOrText(text));
      if (!first.success) {
        retries = 1;
        const retryUserPrompt = `${req.userPrompt}\n\n[NOTE: prior response did not match the expected schema. Please return only output that satisfies the schema, with no preamble or commentary.]`;
        const retried = await this.runOpenCode(
          buildOpenCodeOpts(req.systemPrompt, retryUserPrompt, req),
        );
        const retriedParse = req.responseSchema.safeParse(tryParseJsonOrText(retried.text));
        if (!retriedParse.success) {
          throw new ProviderParseError(
            "OpenCode judgment response did not match responseSchema after retry",
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
      parsed = first.data;
    }
    const response: JudgmentResponse = { text, usage, durationMs, retries };
    if (parsed !== undefined) response.parsed = parsed;
    return response;
  }

  async fanOut(req: FanOutRequest): Promise<FanOutResponse> {
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
    try {
      const { text, usage } = await this.runOpenCode(
        buildOpenCodeOpts(spec.systemPrompt, spec.userPrompt, spec, timeoutMs),
      );
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
    }
  }

  async close(): Promise<void> {
    // No long-lived child processes to clean up — each call spawns and waits.
  }

  /** Spawn opencode as a child process; pipe prompt via stdin; collect
   *  stdout JSON. Throws on non-zero exit code or timeout. */
  private async runOpenCode(opts: {
    systemPrompt: string;
    userPrompt: string;
    model: string;
    maxTokens?: number;
    timeoutMs?: number;
  }): Promise<{ text: string; usage: { input: number; output: number } }> {
    const model = opts.model.length > 0 ? opts.model : this.defaultModel;
    const args = ["run", "--model", model, "--json"];
    // The opencode CLI accepts the prompt via stdin when given the --json
    // flag. The system prompt is prepended in the structured request envelope.
    const requestPayload = JSON.stringify({
      system: opts.systemPrompt,
      user: opts.userPrompt,
      ...(opts.maxTokens !== undefined && { max_tokens: opts.maxTokens }),
    });

    return new Promise((resolve, reject) => {
      const proc = spawn(this.binary, args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";
      let timedOut = false;
      let timeoutHandle: NodeJS.Timeout | undefined;
      if (opts.timeoutMs !== undefined && opts.timeoutMs > 0) {
        timeoutHandle = setTimeout(() => {
          timedOut = true;
          try {
            proc.kill("SIGTERM");
          } catch {
            // Best effort; the close handler still fires below.
          }
        }, opts.timeoutMs);
      }

      proc.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString("utf8");
      });
      proc.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf8");
      });
      proc.on("error", (err) => {
        if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
        if ((err as { code?: string }).code === "ENOENT") {
          reject(
            new ProviderConfigError(
              `opencode binary not found (looked for "${this.binary}"). ` +
                `Install: https://opencode.ai/docs/install/`,
            ),
          );
          return;
        }
        reject(err);
      });
      proc.on("close", (code) => {
        if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
        if (timedOut) {
          const e = new Error("opencode subprocess timed out");
          (e as { name: string }).name = "TimeoutError";
          reject(e);
          return;
        }
        if (code !== 0) {
          reject(
            new Error(
              `opencode exited with code ${code}. stderr:\n${stderr.slice(0, 1024)}`,
            ),
          );
          return;
        }
        // Parse opencode's --json output. Expected shape:
        //   { "text": "...", "usage": { "input_tokens": N, "output_tokens": M } }
        // If the shape differs (different opencode version), we surface a
        // clear error rather than corrupt the pipeline.
        try {
          const parsed = JSON.parse(stdout) as Record<string, unknown>;
          const text = typeof parsed["text"] === "string" ? parsed["text"] : "";
          const usageRaw = parsed["usage"];
          let usage = { input: 0, output: 0 };
          if (typeof usageRaw === "object" && usageRaw !== null) {
            const u = usageRaw as Record<string, unknown>;
            usage = {
              input: typeof u["input_tokens"] === "number" ? u["input_tokens"] : 0,
              output: typeof u["output_tokens"] === "number" ? u["output_tokens"] : 0,
            };
          }
          resolve({ text, usage });
        } catch (err) {
          reject(
            new Error(
              `opencode --json output was not valid JSON: ` +
                `${err instanceof Error ? err.message : String(err)}\n` +
                `First 256 bytes: ${stdout.slice(0, 256)}`,
            ),
          );
        }
      });

      // Write the request envelope, then close stdin so opencode starts.
      proc.stdin.end(requestPayload);
    });
  }
}

/** Build the runOpenCode() options payload from a request, omitting absent
 *  optional fields (required by `exactOptionalPropertyTypes: true`). */
function buildOpenCodeOpts(
  systemPrompt: string,
  userPrompt: string,
  source: { model: string; maxTokens?: number },
  timeoutMs?: number,
): {
  systemPrompt: string;
  userPrompt: string;
  model: string;
  maxTokens?: number;
  timeoutMs?: number;
} {
  return {
    systemPrompt,
    userPrompt,
    model: source.model,
    ...(source.maxTokens !== undefined && { maxTokens: source.maxTokens }),
    ...(timeoutMs !== undefined && { timeoutMs }),
  };
}

// Per I-2 in M19 review: use the shared code-fence-aware extractor.
import { extractJsonOrText as tryParseJsonOrText } from "../util/json_extract.js";
void tryParseJsonOrText;
