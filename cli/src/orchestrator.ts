// Orchestrator — deterministic state machine that walks the 11-phase
// pipeline. NO LLM calls in this file (those live in phase handlers).
//
// The orchestrator's job is purely flow control: pick the next phase
// from the mode mapping, look up its handler in the registry, run it,
// catch errors, write checkpoints, handle loop-backs, and exit cleanly.

import type { Logger } from "./util/log.js";
import type { AgentProvider } from "./providers/types.js";
import type { Mode } from "./types/mode.js";
import { PHASES_BY_MODE, INTENSITY_BY_MODE } from "./types/mode.js";
import type { PhaseContext, PhaseResult } from "./phases/types.js";
import type { PhaseRegistry } from "./phases/registry.js";
import { defaultRegistry } from "./phases/registry.js";
import { writeCheckpoint } from "./state/checkpoint.js";
import {
  PauseRequestedError,
  DispatchAlreadyCompleteError,
  ForeignOutputDirError,
  FatalError,
  RecoverableError,
} from "./util/errors.js";
import type { PhaseName } from "./state/disk_truth.js";

export interface OrchestratorConfig {
  outputDir: string;
  uuid8: string;
  topic: string;
  mode: Mode;
  provider: AgentProvider;
  log: Logger;
  cliVersion: string;
  /** Override the registry for tests. Production uses defaultRegistry. */
  registry?: PhaseRegistry;
}

export interface OrchestratorResult {
  status: "complete" | "paused" | "already-complete" | "error" | "not-implemented";
  exitCode: number;
  /** Last phase that ran successfully. Useful for reporting. */
  lastPhase?: PhaseName;
  /** Error message when status === "error". */
  errorMessage?: string;
}

const RECOVERABLE_RETRY_LIMIT = 1;

export async function runOrchestrator(
  config: OrchestratorConfig,
): Promise<OrchestratorResult> {
  const registry = config.registry ?? defaultRegistry;
  const phases = PHASES_BY_MODE[config.mode];
  const intensity = INTENSITY_BY_MODE[config.mode];
  let lastCompletedPhase: PhaseName | undefined;

  // Loop-back state: when a phase returns loopBackTo, jump there for one
  // additional pass. The Phase 7.5 → Phase 7 loop-back is the main use case;
  // budget enforcement is the phase handler's responsibility (we just hop).
  let loopBackBudget = intensity.verifyLoopBackBudget;

  let i = 0;
  while (i < phases.length) {
    const phase = phases[i];
    if (phase === undefined) break; // Defensive — shouldn't happen given length check above.
    const handler = registry.get(phase);
    if (handler === undefined) {
      config.log.warn(
        `No handler registered for phase ${phase} — exiting at this milestone boundary.`,
      );
      const result: OrchestratorResult = {
        status: "not-implemented",
        exitCode: 0,
      };
      if (lastCompletedPhase !== undefined) result.lastPhase = lastCompletedPhase;
      return result;
    }

    const phaseLog = config.log.withPhase(phase);
    const ctx: PhaseContext = {
      outputDir: config.outputDir,
      uuid8: config.uuid8,
      topic: config.topic,
      mode: config.mode,
      intensity,
      provider: config.provider,
      log: phaseLog,
      cliVersion: config.cliVersion,
    };

    let attempt = 0;
    let phaseResult: PhaseResult | undefined;
    while (attempt <= RECOVERABLE_RETRY_LIMIT) {
      try {
        phaseLog.info("Phase starting");
        phaseResult = await handler(ctx);
        phaseLog.info("Phase complete");
        break;
      } catch (err: unknown) {
        // Phase 0 special exits: bubble up cleanly.
        if (err instanceof PauseRequestedError) {
          await writeCheckpoint({
            outputDir: config.outputDir,
            phaseCompleted: lastCompletedPhase ?? "RESUME_DETECTION",
            nextPhase: phase,
            extra: { status: "paused", paused_reason: `flag-${err.flagKind}` },
          });
          const result: OrchestratorResult = {
            status: "paused",
            exitCode: 0,
          };
          if (lastCompletedPhase !== undefined) result.lastPhase = lastCompletedPhase;
          return result;
        }
        if (err instanceof DispatchAlreadyCompleteError) {
          return { status: "already-complete", exitCode: 0, lastPhase: "PACKAGE" };
        }
        if (err instanceof ForeignOutputDirError) {
          phaseLog.error(err.message);
          return { status: "error", exitCode: 3, errorMessage: err.message };
        }
        if (err instanceof RecoverableError && attempt < RECOVERABLE_RETRY_LIMIT) {
          phaseLog.warn(`Recoverable error; retrying once: ${err.message}`);
          attempt++;
          continue;
        }
        // FatalError or any other unhandled error.
        const message = err instanceof Error ? err.message : String(err);
        phaseLog.error(`Phase failed: ${message}`);
        const isFatal = err instanceof FatalError || !(err instanceof RecoverableError);
        const exitCode = isFatal ? 1 : 1;
        const result: OrchestratorResult = {
          status: "error",
          exitCode,
          errorMessage: message,
        };
        if (lastCompletedPhase !== undefined) result.lastPhase = lastCompletedPhase;
        return result;
      }
    }
    if (phaseResult === undefined) {
      const errResult: OrchestratorResult = {
        status: "error",
        exitCode: 1,
        errorMessage: `Phase ${phase} did not produce a result after retries`,
      };
      if (lastCompletedPhase !== undefined) errResult.lastPhase = lastCompletedPhase;
      return errResult;
    }

    lastCompletedPhase = phase;

    // Write checkpoint AFTER each phase, EXCEPT:
    // - RESUME_DETECTION (writes its own reconciled checkpoint internally)
    // - PACKAGE (per Phase 8 strict ordering rule: PACKAGE owns the final
    //   checkpoint write at step 5, then writes _DONE at step 6 — if the
    //   orchestrator wrote another checkpoint AFTER _DONE, _DONE would no
    //   longer have the most-recent mtime, violating C4 in PLAN.md).
    if (phase !== "RESUME_DETECTION" && phase !== "PACKAGE") {
      const nextPhase =
        phaseResult.loopBackTo !== undefined
          ? phaseResult.loopBackTo
          : i + 1 < phases.length
            ? phases[i + 1] ?? null
            : null;
      await writeCheckpoint({
        outputDir: config.outputDir,
        phaseCompleted: phase,
        nextPhase,
        extra: phaseResult.checkpointExtra ?? {},
      });
    }

    // Loop-back handling.
    if (phaseResult.loopBackTo !== undefined) {
      if (loopBackBudget <= 0) {
        phaseLog.warn(
          `Loop-back to ${phaseResult.loopBackTo} requested but budget exhausted; continuing forward`,
        );
        i++;
        continue;
      }
      loopBackBudget--;
      const loopTargetIdx = phases.indexOf(phaseResult.loopBackTo);
      if (loopTargetIdx === -1) {
        phaseLog.warn(
          `Loop-back target ${phaseResult.loopBackTo} not in mode's phase list; continuing forward`,
        );
        i++;
        continue;
      }
      phaseLog.info(
        `Looping back to ${phaseResult.loopBackTo} (budget remaining: ${loopBackBudget})`,
      );
      i = loopTargetIdx;
      continue;
    }

    i++;
  }

  return {
    status: "complete",
    exitCode: 0,
    ...(lastCompletedPhase !== undefined && { lastPhase: lastCompletedPhase }),
  };
}
