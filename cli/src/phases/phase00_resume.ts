// Phase 0: RESUME DETECTION.
//
// Pure code, zero LLM calls. Determines whether the current invocation
// should resume a prior dispatch or start fresh.
//
// Activities (per methodology.md Phase 0):
// 1. Detect pause flag → throw PauseRequestedError
// 2. Detect _DONE matching our schema → throw DispatchAlreadyCompleteError
// 3. Detect _DONE with foreign schema (e.g., old Python skill) → throw
//    ForeignOutputDirError
// 4. Cleanup *.tmp files
// 5. Reconcile checkpoint vs disk-truth (per Disk-Truth Reconciliation)
// 6. Completion-but-missing-sentinel reconciliation (per the strict
//    Phase 8 ordering rule)
// 7. Update or create research-tasks-cli.json entry

import { ZodError } from "zod/v4";
import type { PhaseContext, PhaseResult } from "./types.js";
import { detectPauseFlag } from "../state/pause.js";
import { doneFileExists, readDoneStrict, writeDone } from "../state/done.js";
import { cleanupTmpFiles } from "../state/atomic.js";
import { readCheckpoint, writeCheckpoint } from "../state/checkpoint.js";
import { scanDiskTruth } from "../state/disk_truth.js";
import {
  registerTask,
  markTaskResumed,
  ensureTaskRegistered,
} from "../state/tasks_registry.js";
import {
  PauseRequestedError,
  DispatchAlreadyCompleteError,
  ForeignOutputDirError,
} from "../util/errors.js";

export const phase00_resume = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info("Checking for prior artifacts and pause flags");

  // Step 1: pause flag check.
  const pauseFlag = await detectPauseFlag(ctx.outputDir);
  if (pauseFlag !== undefined) {
    ctx.log.warn(`Pause flag detected: ${pauseFlag.filename}`, {
      kind: pauseFlag.kind,
    });
    throw new PauseRequestedError(pauseFlag.kind, pauseFlag.filename);
  }

  // Step 2/3: _DONE check (validate against locked schema).
  if (await doneFileExists(ctx.outputDir)) {
    try {
      const done = await readDoneStrict(ctx.outputDir);
      if (done !== undefined) {
        ctx.log.info("Dispatch already complete (matching _DONE schema found)", {
          uuid8: done.uuid8,
          finished_at: done.finished_at,
        });
        throw new DispatchAlreadyCompleteError(ctx.outputDir);
      }
    } catch (err: unknown) {
      if (err instanceof DispatchAlreadyCompleteError) throw err;
      // Schema mismatch → foreign tool's _DONE.
      if (err instanceof ZodError) {
        throw new ForeignOutputDirError(
          ctx.outputDir,
          "_DONE file does not match this CLI's schema (likely written by " +
            "a different tool — e.g., the old Python skill). " +
            "Per PLAN.md C2, the new CLI uses fresh OUTPUT_DIRs only.",
        );
      }
      throw err;
    }
  }

  // Step 4: cleanup *.tmp files (defensive against kill mid-rename).
  const deletedTmp = await cleanupTmpFiles(ctx.outputDir);
  if (deletedTmp.length > 0) {
    ctx.log.info(`Cleaned up ${deletedTmp.length} stale *.tmp file(s)`);
  }

  // Step 5: read checkpoint (may be absent — that's OK).
  let checkpoint;
  try {
    checkpoint = await readCheckpoint(ctx.outputDir);
  } catch (err: unknown) {
    // Malformed checkpoint → treat as no checkpoint, fall through to disk-truth.
    ctx.log.warn("Checkpoint exists but is malformed; falling back to disk-truth", {
      error: err instanceof Error ? err.message : String(err),
    });
    checkpoint = undefined;
  }

  // Step 5b: Disk-Truth Reconciliation.
  const truth = await scanDiskTruth(ctx.outputDir);
  const completedFromDisk = Array.from(truth.completedPhases);

  // Step 6: completion-but-missing-sentinel reconciliation.
  // If checkpoint says PACKAGE complete AND a research_report_*.md exists
  // on disk AND _DONE is absent, the prior run reached the end of Phase 8
  // but was killed between Activity 9.8 and Activity 10. Write the missing
  // _DONE and exit.
  const reportPresent = truth.completedPhases.has("PACKAGE");
  const checkpointSaysComplete =
    checkpoint?.phase_completed === "PACKAGE" && checkpoint?.status === "complete";
  if (checkpointSaysComplete && reportPresent) {
    ctx.log.info(
      "Detected completion-but-missing-sentinel state — writing _DONE and exiting",
    );
    await writeDone({
      outputDir: ctx.outputDir,
      uuid8: ctx.uuid8,
      cliVersion: ctx.cliVersion,
    });
    throw new DispatchAlreadyCompleteError(ctx.outputDir);
  }

  // Step 7: research-tasks-cli.json entry.
  // If artifacts exist on disk OR a checkpoint exists, this is a resume.
  // Otherwise, fresh dispatch.
  const isResume = checkpoint !== undefined || completedFromDisk.length > 0;
  if (isResume) {
    ctx.log.info(
      `Resuming dispatch — completed phases on disk: [${completedFromDisk.join(", ")}]`,
    );
    // markTaskResumed is idempotent and a no-op if the task isn't yet
    // registered. We avoid calling registerTask on the resume path because
    // that would clobber start_time, status, and any prior `notes` /
    // `complete_time` (per C-3 in M19 review). If the task isn't registered
    // (operator started a fresh run with --output-dir pointing at a partial
    // dir from outside the CLI), then markTaskResumed gracefully no-ops and
    // we register fresh once — but with start_time = now, which is the
    // correct semantics for "first time we're seeing this task".
    await markTaskResumed(ctx.uuid8);
    await ensureRegistered(ctx);
  } else {
    ctx.log.info("Fresh dispatch — no prior artifacts");
    await registerTask({
      uuid: ctx.uuid8,
      topic: ctx.topic,
      outputDir: ctx.outputDir,
      mode: ctx.mode,
      cliVersion: ctx.cliVersion,
    });
  }

  // Persist the reconciled checkpoint atomically. The orchestrator uses
  // this to decide which phase to start at.
  const checkpointExtra: Record<string, unknown> = {
    completed_phases: completedFromDisk,
    is_resume: isResume,
  };
  await writeCheckpoint({
    outputDir: ctx.outputDir,
    phaseCompleted: "RESUME_DETECTION",
    nextPhase: nextIncompletePhase(completedFromDisk),
    extra: checkpointExtra,
  });

  return {
    phase: "RESUME_DETECTION",
    checkpointExtra,
  };
};

/** Idempotent wrapper around ensureTaskRegistered — only adds a fresh
 *  entry if the uuid isn't already registered. Critical on the resume
 *  path where overwriting an existing entry would corrupt start_time
 *  and complete_time (per C-3 in M19 review). */
async function ensureRegistered(ctx: PhaseContext): Promise<void> {
  await ensureTaskRegistered({
    uuid: ctx.uuid8,
    topic: ctx.topic,
    outputDir: ctx.outputDir,
    mode: ctx.mode,
    cliVersion: ctx.cliVersion,
  });
}

/** Given the set of phases marked complete on disk, return the name of
 *  the next phase that the orchestrator should run. The orchestrator's
 *  state machine knows the per-mode phase order; here we just compute a
 *  generic "first not-yet-done phase" hint. */
function nextIncompletePhase(completedFromDisk: readonly string[]): string | null {
  const allPhases: readonly string[] = [
    "SCOPE",
    "PLAN",
    "RETRIEVE",
    "TRIANGULATE",
    "OUTLINE_REFINEMENT",
    "SYNTHESIZE",
    "CRITIQUE",
    "REFINE",
    "VERIFY",
    "PACKAGE",
  ];
  for (const phase of allPhases) {
    if (!completedFromDisk.includes(phase)) return phase;
  }
  return null;
}
