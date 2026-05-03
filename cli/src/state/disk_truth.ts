// Disk-Truth Reconciliation.
//
// Scan OUTPUT_DIR for canonical phase artifact filenames. The presence of a
// canonical artifact on disk means that phase completed; the absence means it
// did not, regardless of what the checkpoint claims. Disk wins.
//
// Per C2 in PLAN.md: this CLI ships canonical names only — no legacy aliases
// from the old Python skill. The new CLI uses fresh OUTPUT_DIRs only.

import { promises as fs } from "node:fs";

/** Phase identifier as it appears in checkpoints + filenames. */
export type PhaseName =
  | "RESUME_DETECTION"
  | "SCOPE"
  | "PLAN"
  | "RETRIEVE"
  | "TRIANGULATE"
  | "OUTLINE_REFINEMENT"
  | "SYNTHESIZE"
  | "CRITIQUE"
  | "REFINE"
  | "VERIFY"
  | "PACKAGE";

/** Map from canonical phase name to a glob-ish predicate.
 *  We use prefix matching since some phases have multiple artifacts
 *  (e.g., Phase 3's `phase03_retrieve_<lens>.md` × N). */
const CANONICAL_ARTIFACT_PREDICATES: Record<PhaseName, (name: string) => boolean> = {
  RESUME_DETECTION: () => false, // Phase 0 produces no artifacts of its own
  SCOPE: (n) => n === "phase01_scope.md",
  PLAN: (n) => n === "phase02_plan.md",
  RETRIEVE: (n) => n.startsWith("phase03_retrieve_") && n.endsWith(".md"),
  TRIANGULATE: (n) => n === "phase04_triangulate.md",
  OUTLINE_REFINEMENT: (n) => n === "phase04_5_outline.md",
  SYNTHESIZE: (n) => n === "phase05_synthesize.md",
  CRITIQUE: (n) => n === "phase06_critique.md",
  REFINE: (n) => n === "phase07_refine.md",
  VERIFY: (n) => n.startsWith("phase07_5_verify_") && n.endsWith(".md"),
  PACKAGE: (n) => n.startsWith("research_report_") && n.endsWith(".md"),
};

export interface DiskTruth {
  /** Phases for which at least one canonical artifact is present on disk. */
  completedPhases: Set<PhaseName>;
  /** All filenames found in OUTPUT_DIR (excluding hidden/_*-prefixed control files
   *  — those are handled separately by checkpoint / done / pause helpers). */
  artifacts: string[];
}

export async function scanDiskTruth(outputDir: string): Promise<DiskTruth> {
  const completedPhases = new Set<PhaseName>();
  const artifacts: string[] = [];
  let entries: string[];
  try {
    entries = await fs.readdir(outputDir);
  } catch (err: unknown) {
    if (isNotFoundError(err)) {
      return { completedPhases, artifacts };
    }
    throw err;
  }
  for (const name of entries) {
    if (name.startsWith("_") || name.startsWith(".")) continue;
    artifacts.push(name);
    for (const [phase, predicate] of Object.entries(CANONICAL_ARTIFACT_PREDICATES)) {
      if (predicate(name)) {
        completedPhases.add(phase as PhaseName);
      }
    }
  }
  return { completedPhases, artifacts };
}

function isNotFoundError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "ENOENT"
  );
}
