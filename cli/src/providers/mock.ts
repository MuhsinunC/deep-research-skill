// MockProvider — used in tests of the orchestrator and phase handlers.
//
// Returns canned responses, tracks every call, and (importantly) implements
// the same per-sub-agent disk-write contract as the production providers.
// This makes the orchestrator tests assert against the same disk-truth
// reality that production runs produce.

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
import { ProviderParseError } from "./types.js";

export interface JudgmentCanned {
  /** Text the provider returns. */
  text: string;
  /** Optional usage (default 100 in / 200 out). */
  usage?: { input: number; output: number };
  /** Wall-clock duration ms (default 50). */
  durationMs?: number;
  /** If true and the request has a responseSchema, simulate a parse failure
   *  on the first attempt — provider retries with this same canned text
   *  (i.e., the retry "succeeds" if the canned text actually parses). */
  failOnFirstParse?: boolean;
}

export interface FanOutCanned {
  /** One canned result per sub-agent name. Provider matches by spec.name. */
  byName: Record<string, SubAgentCanned>;
}

export interface SubAgentCanned {
  text: string;
  status?: "ok" | "error" | "timeout";
  error?: string;
  usage?: { input: number; output: number };
  durationMs?: number;
}

export class MockProvider implements AgentProvider {
  readonly judgmentCalls: JudgmentRequest[] = [];
  readonly fanOutCalls: FanOutRequest[] = [];
  readonly closeCount = { calls: 0 };

  constructor(
    /** FIFO queue of canned judgment responses; one consumed per call.
     *  If empty, callJudgment throws a clear error. */
    readonly judgmentQueue: JudgmentCanned[] = [],
    /** FIFO queue of canned fan-out responses; one consumed per fanOut.
     *  If empty, fanOut throws a clear error. */
    readonly fanOutQueue: FanOutCanned[] = [],
  ) {}

  async callJudgment(req: JudgmentRequest): Promise<JudgmentResponse> {
    this.judgmentCalls.push(req);
    const canned = this.judgmentQueue.shift();
    if (canned === undefined) {
      throw new Error(
        `MockProvider.callJudgment: judgmentQueue exhausted. ` +
          `Test may need to add more canned responses.`,
      );
    }
    const usage = canned.usage ?? { input: 100, output: 200 };
    const durationMs = canned.durationMs ?? 50;
    let parsed: unknown;
    let retries = 0;
    if (req.responseSchema !== undefined) {
      // failOnFirstParse semantics: always force a retry, then parse canned.text
      // on the retry. This lets tests assert the retry path even when the
      // canned text itself is valid. (If we only retried when the natural
      // parse fails, "valid canned text + failOnFirstParse" wouldn't exercise
      // the retry — a confusing dead-end for test authors.)
      if (canned.failOnFirstParse === true) {
        retries = 1;
        const retryResult = req.responseSchema.safeParse(tryParseJsonOrText(canned.text));
        if (!retryResult.success) {
          throw new ProviderParseError(
            "Canned response did not match responseSchema after retry",
            canned.text,
            1,
            retryResult.error,
          );
        }
        parsed = retryResult.data;
      } else {
        const result = req.responseSchema.safeParse(tryParseJsonOrText(canned.text));
        if (!result.success) {
          throw new ProviderParseError(
            "Canned response did not match responseSchema",
            canned.text,
            0,
            result.error,
          );
        }
        parsed = result.data;
      }
    }
    const response: JudgmentResponse = {
      text: canned.text,
      usage,
      durationMs,
      retries,
    };
    if (parsed !== undefined) {
      response.parsed = parsed;
    }
    return response;
  }

  async fanOut(req: FanOutRequest): Promise<FanOutResponse> {
    this.fanOutCalls.push(req);
    const canned = this.fanOutQueue.shift();
    if (canned === undefined) {
      throw new Error(
        `MockProvider.fanOut: fanOutQueue exhausted. ` +
          `Test may need to add more canned responses.`,
      );
    }
    // Sub-agents run "in parallel" but we just await sequentially in the mock —
    // the disk-write contract doesn't care about real concurrency, only about
    // the fact that all files are on disk before the promise resolves.
    const results: SubAgentResult[] = [];
    for (const spec of req.agents) {
      results.push(await this.runSubAgent(spec, canned));
    }
    return { results };
  }

  private async runSubAgent(
    spec: SubAgentSpec,
    canned: FanOutCanned,
  ): Promise<SubAgentResult> {
    const cannedResult = canned.byName[spec.name];
    if (cannedResult === undefined) {
      const result: SubAgentResult = {
        name: spec.name,
        status: "error",
        outputFile: spec.outputFile,
        fileWritten: false,
        text: "",
        error: `MockProvider: no canned response for sub-agent "${spec.name}"`,
        durationMs: 0,
      };
      return result;
    }
    const status = cannedResult.status ?? "ok";
    const usage = cannedResult.usage ?? { input: 50, output: 100 };
    const durationMs = cannedResult.durationMs ?? 25;
    if (status !== "ok") {
      const result: SubAgentResult = {
        name: spec.name,
        status,
        outputFile: spec.outputFile,
        fileWritten: false,
        text: "",
        durationMs,
        usage,
      };
      if (cannedResult.error !== undefined) result.error = cannedResult.error;
      return result;
    }
    // Per C4 contract: write to disk BEFORE returning.
    await writeAtomicText(spec.outputFile, cannedResult.text);
    const result: SubAgentResult = {
      name: spec.name,
      status: "ok",
      outputFile: spec.outputFile,
      fileWritten: true,
      text: cannedResult.text,
      durationMs,
      usage,
    };
    return result;
  }

  async close(): Promise<void> {
    this.closeCount.calls++;
  }
}

/** Try to parse text as JSON; if that fails, return the text itself.
 *  Lets canned responses be either structured JSON or plain text without
 *  the test having to know which the schema expects. */
function tryParseJsonOrText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
