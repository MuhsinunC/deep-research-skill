// AgentProvider — the interface that abstracts away the choice of LLM backend.
//
// Two production implementations: ClaudeAgentSdkProvider (default; uses the
// user's Claude Code subscription quota) and OpenCodeCliProvider (spawns
// opencode as a child process; routes through OpenRouter / any
// OpenAI-compatible endpoint). One test implementation: MockProvider.
//
// The orchestrator and phase handlers depend ONLY on this interface. They
// have zero direct knowledge of which backend is actually executing. This
// is what makes the per-phase model-selection benchmarking the user wants
// possible: change `--provider` and the entire pipeline runs against a
// different backend without touching any phase logic.

import { z } from "zod/v4";

export type Mode = "quick" | "standard" | "deep" | "ultradeep";
export type EffortHint = "low" | "medium" | "high" | "max";

export interface AgentProvider {
  /** One-shot judgment call: prompt → text response.
   *  Used for SCOPE, PLAN, TRIANGULATE, OUTLINE_REFINEMENT, SYNTHESIZE,
   *  CRITIQUE, REFINE, and PACKAGE — every phase whose AI work is a single
   *  open-ended reasoning turn rather than a parallel fan-out. */
  callJudgment(req: JudgmentRequest): Promise<JudgmentResponse>;

  /** Fan-out call: spawn N sub-agents in parallel.
   *  Used for Phase 3 RETRIEVE, Phase 6 CRITIQUE gap-fill, Phase 7.5 VERIFY.
   *
   *  PER-SUB-AGENT DISK-WRITE CONTRACT (mandatory, per C4 in PLAN.md):
   *  the provider MUST atomically write each sub-agent's text result to its
   *  `spec.outputFile` BEFORE the returned promise resolves. If the parent
   *  is SIGKILLed mid-batch, all completed sub-agents have their files on
   *  disk; only in-flight sub-agents' work is lost. This is the contract
   *  the orchestrator's Phase 0 RESUME DETECTION + Disk-Truth Reconciliation
   *  depends on. A provider that returns text-only results (without writing
   *  to disk) is non-conformant and will silently break Granularity 2 resume. */
  fanOut(req: FanOutRequest): Promise<FanOutResponse>;

  /** Cleanup hook: close subprocesses, flush logs, release any handles.
   *  Always called at the end of an orchestrator run, even on error paths. */
  close(): Promise<void>;
}

export interface JudgmentRequest {
  /** System prompt (instructions, methodology, constraints). */
  systemPrompt: string;
  /** User prompt (the topic / inputs / specific task). */
  userPrompt: string;
  /** Specific model name. Provider-defined values:
   *  - claude:   "opus" | "sonnet" | "haiku" | full ID like "claude-opus-4-7"
   *  - opencode: full OpenRouter model ID like "deepseek/deepseek-chat-v4"
   *  Required (no provider default — the orchestrator chooses per phase
   *  per the user's benchmarking goals). */
  model: string;
  /** Hard cap on output tokens. Provider chooses sane default if omitted. */
  maxTokens?: number;
  /** Effort hint. Provider may map to its own scale or ignore. */
  effort?: EffortHint;
  /** Allowed tool names (web search, file read, etc.). Empty / undefined =
   *  no tools (judgment is pure-text reasoning). */
  tools?: readonly string[];
  /** Optional zod schema. If provided, the response text is parsed against
   *  it; on parse failure the provider retries once (per I8 in PLAN.md);
   *  second failure throws ProviderParseError. */
  responseSchema?: z.ZodType<unknown>;
}

export interface JudgmentResponse {
  /** Raw text response from the model. */
  text: string;
  /** Pre-validated structured payload (only present if responseSchema was
   *  provided AND parsing succeeded). */
  parsed?: unknown;
  /** Tokens consumed. Provider should fill both fields where available;
   *  if the underlying API only reports total, set input=0 and output=total. */
  usage: { input: number; output: number };
  /** Wall-clock duration in ms. */
  durationMs: number;
  /** Number of retries that happened during this call (0 = first try succeeded;
   *  1 = first parse failed, retry succeeded). Used for provenance. */
  retries: number;
}

export interface FanOutRequest {
  /** One sub-agent spec per agent. Length = number of parallel calls. */
  agents: readonly SubAgentSpec[];
  /** Max wall-clock per sub-agent (slowest one bounds the whole batch).
   *  Sub-agents that exceed timeout return status="timeout" with no file. */
  timeoutMs: number;
}

export interface SubAgentSpec {
  /** Stable identifier; appears in output filename and progress JSON. */
  name: string;
  systemPrompt: string;
  userPrompt: string;
  /** Per-sub-agent model selection (per I4 in PLAN.md). */
  model: string;
  /** Tools the sub-agent may use during its turn. */
  tools?: readonly string[];
  /** REQUIRED — provider MUST write this sub-agent's text result to this
   *  ABSOLUTE path atomically BEFORE fanOut's promise resolves (per C4). */
  outputFile: string;
  /** Optional zod schema for response validation (per I7/I8). */
  responseSchema?: z.ZodType<unknown>;
  /** Hard cap on output tokens for this sub-agent. */
  maxTokens?: number;
  /** Effort hint for this sub-agent. */
  effort?: EffortHint;
}

export interface FanOutResponse {
  /** One result per spec, in the same order as the request's `agents`. */
  results: readonly SubAgentResult[];
}

export interface SubAgentResult {
  /** Matches spec.name. */
  name: string;
  status: "ok" | "error" | "timeout";
  /** Path that was written (matches the input outputFile). */
  outputFile: string;
  /** True iff outputFile exists on disk and is non-empty after this call.
   *  Phase 3/6/7.5 handlers check this BEFORE marking a sub-agent complete. */
  fileWritten: boolean;
  /** Empty string if status != "ok". */
  text: string;
  /** Pre-validated structured payload (when spec.responseSchema is present). */
  parsed?: unknown;
  /** Error message when status != "ok". */
  error?: string;
  /** Tokens consumed. Always present, even on error/timeout (may be partial). */
  usage?: { input: number; output: number };
  durationMs: number;
}

/** Thrown by callJudgment / sub-agent calls when responseSchema parsing
 *  fails twice (initial + one retry). Phase handlers catch this and surface
 *  it via Limitations / provenance — they do NOT re-throw, because a
 *  parse-failed phase result is recoverable for the rest of the pipeline. */
export class ProviderParseError extends Error {
  constructor(
    message: string,
    readonly raw: string,
    readonly retries: number,
    readonly cause: unknown,
  ) {
    super(message);
    this.name = "ProviderParseError";
  }
}

/** Thrown by sub-agent calls when the per-agent timeout is exceeded.
 *  fanOut catches this internally and returns status="timeout" — phase
 *  handlers don't see ProviderTimeoutError directly. */
export class ProviderTimeoutError extends Error {
  constructor(
    message: string,
    readonly elapsedMs: number,
  ) {
    super(message);
    this.name = "ProviderTimeoutError";
  }
}

/** Provider-construction error: missing binary, missing API key, bad config.
 *  Thrown synchronously from the provider's constructor or from the factory. */
export class ProviderConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderConfigError";
  }
}
