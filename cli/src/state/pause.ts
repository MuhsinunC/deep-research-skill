// Pause-flag detection.
//
// Operator workflow: `touch $OUTPUT_DIR/_STOP_REQUESTED` (soft, end-of-phase)
// or `touch $OUTPUT_DIR/_STOP_NOW` (aggressive, end-of-sub-agent).
// Worker checks at every safe boundary. Per Policy A, the worker does NOT
// delete the flag — operator must `rm` before resuming.

import { promises as fs } from "node:fs";

export type PauseKind = "stop_soft" | "stop_now";

export interface PauseFlag {
  kind: PauseKind;
  filename: string; // "_STOP_REQUESTED" or "_STOP_NOW"
}

export async function detectPauseFlag(outputDir: string): Promise<PauseFlag | undefined> {
  // _STOP_NOW takes priority over _STOP_REQUESTED if both are present —
  // aggressive pause is a deliberate operator escalation.
  if (await fileExists(`${outputDir}/_STOP_NOW`)) {
    return { kind: "stop_now", filename: "_STOP_NOW" };
  }
  if (await fileExists(`${outputDir}/_STOP_REQUESTED`)) {
    return { kind: "stop_soft", filename: "_STOP_REQUESTED" };
  }
  return undefined;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path);
    return stat.isFile();
  } catch {
    return false;
  }
}
