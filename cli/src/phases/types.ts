// Phase handler interface — the orchestrator calls these.

import type { Logger } from "../util/log.js";
import type { AgentProvider } from "../providers/types.js";
import type { Mode, ModeIntensity } from "../types/mode.js";
import type { PhaseName } from "../state/disk_truth.js";

export interface PhaseContext {
  /** Absolute path to the run's OUTPUT_DIR. */
  outputDir: string;
  /** UUID8 of the run. */
  uuid8: string;
  /** The original research topic (post-brief-resolution). */
  topic: string;
  /** Run mode (quick/standard/deep/ultradeep). */
  mode: Mode;
  /** Per-mode intensity knobs (lens count, loop-back budget, etc.). */
  intensity: ModeIntensity;
  /** Provider abstraction. Phase handlers call this for AI work. */
  provider: AgentProvider;
  /** Logger scoped to this phase (`[Phase NAME]` prefix). */
  log: Logger;
  /** CLI version string (for provenance + _DONE schema). */
  cliVersion: string;
}

export interface PhaseResult {
  /** Phase that just completed. */
  phase: PhaseName;
  /** True if the phase requests an immediate loop-back to a prior phase
   *  (used by Phase 7.5 VERIFY → Phase 7 REFINE on contradicted claims). */
  loopBackTo?: PhaseName;
  /** Free-form metadata to merge into the next checkpoint write. */
  checkpointExtra?: Record<string, unknown>;
}

export type PhaseHandler = (ctx: PhaseContext) => Promise<PhaseResult>;
