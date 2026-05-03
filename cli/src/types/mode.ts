// Mode enumeration + per-mode phase list mapping.
//
// The mapping is asserted line-by-line against ../skill/SKILL.md's Workflow
// Overview table by a unit test (per I2 in PLAN.md). If the existing skill
// adds a phase, the test fails and we update both files in lockstep.

import type { PhaseName } from "../state/disk_truth.js";

export const MODES = ["quick", "standard", "deep", "ultradeep"] as const;
export type Mode = (typeof MODES)[number];

/** Runtime intensity knobs for ultradeep mode. */
export interface ModeIntensity {
  /** Phase 3 RETRIEVE lens count (4 in deep, 6 in ultradeep). */
  retrieveLensCount: number;
  /** Phase 7.5 VERIFY citation verifier count (3 in deep, 5 in ultradeep). */
  verifyVerifierCount: number;
  /** Phase 7.5 loop-back budget (2 in deep, 3 in ultradeep). */
  verifyLoopBackBudget: number;
  /** Phase 6 CRITIQUE gap-fill sub-agent count (1 in deep, 2 in ultradeep). */
  critiqueGapFillCount: number;
}

/** Phases run by each mode, in execution order. Phase 0 RESUME_DETECTION
 *  always runs first. */
export const PHASES_BY_MODE: Record<Mode, readonly PhaseName[]> = {
  quick: ["RESUME_DETECTION", "SCOPE", "RETRIEVE", "PACKAGE"],
  standard: [
    "RESUME_DETECTION",
    "SCOPE",
    "PLAN",
    "RETRIEVE",
    "TRIANGULATE",
    "OUTLINE_REFINEMENT",
    "SYNTHESIZE",
    "PACKAGE",
  ],
  deep: [
    "RESUME_DETECTION",
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
  ],
  ultradeep: [
    "RESUME_DETECTION",
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
  ],
};

export const INTENSITY_BY_MODE: Record<Mode, ModeIntensity> = {
  quick: {
    retrieveLensCount: 2,
    verifyVerifierCount: 0, // VERIFY skipped in quick
    verifyLoopBackBudget: 0,
    critiqueGapFillCount: 0, // CRITIQUE skipped in quick
  },
  standard: {
    retrieveLensCount: 3,
    verifyVerifierCount: 0, // VERIFY skipped in standard
    verifyLoopBackBudget: 0,
    critiqueGapFillCount: 0, // CRITIQUE skipped in standard
  },
  deep: {
    retrieveLensCount: 4,
    verifyVerifierCount: 3,
    verifyLoopBackBudget: 2,
    critiqueGapFillCount: 1,
  },
  ultradeep: {
    retrieveLensCount: 6,
    verifyVerifierCount: 5,
    verifyLoopBackBudget: 3,
    critiqueGapFillCount: 2,
  },
};
