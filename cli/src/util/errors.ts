// Error classes used across the orchestrator and phase handlers.
//
// Distinct classes so the orchestrator's error-handling logic can pattern-
// match: RecoverableError → retry the phase once; FatalError → abort the
// run and exit non-zero; PauseRequestedError → write paused checkpoint
// and exit zero (clean operator-initiated stop).

export class RecoverableError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "RecoverableError";
  }
}

export class FatalError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "FatalError";
  }
}

/** Thrown by Phase 0 when a pause flag is detected. The orchestrator
 *  catches this, writes a paused checkpoint, and exits 0. */
export class PauseRequestedError extends Error {
  constructor(
    readonly flagKind: "stop_soft" | "stop_now",
    readonly flagFilename: string,
  ) {
    super(`Pause flag detected: ${flagFilename}`);
    this.name = "PauseRequestedError";
  }
}

/** Thrown by Phase 0 when an existing _DONE indicates the dispatch is
 *  already complete. The orchestrator catches this and exits 0 without
 *  re-running any phases. */
export class DispatchAlreadyCompleteError extends Error {
  constructor(readonly outputDir: string) {
    super(`Dispatch already complete: ${outputDir}/_DONE exists`);
    this.name = "DispatchAlreadyCompleteError";
  }
}

/** Thrown by Phase 0 when a foreign _DONE file is detected (e.g., from the
 *  old Python skill). Per C2 in PLAN.md the new CLI does not resume
 *  directories created by other tools. */
export class ForeignOutputDirError extends Error {
  constructor(readonly outputDir: string, readonly reason: string) {
    super(
      `OUTPUT_DIR ${outputDir} contains artifacts from another tool: ${reason}. ` +
        `Use a fresh OUTPUT_DIR or remove the existing one.`,
    );
    this.name = "ForeignOutputDirError";
  }
}
