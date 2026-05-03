// _DONE sentinel writer + reader.
//
// MUST be the FINAL action of Phase 8 PACKAGE. Presence ⇒ Phase 8 was
// completed and the report set is committed. The schema is locked — see
// PLAN.md "Decisions locked from review-1, C2".
//
// Format: plain key=value text (NOT JSON) so bash can parse with `grep '^uuid8='`.
// Locked keys (in order, all required):
//   uuid8           = 8-character UUID prefix matching --output-dir naming
//   finished_at     = ISO 8601 UTC timestamp (YYYY-MM-DDTHH:MM:SSZ)
//   phase_completed = always "PACKAGE"
//   cli_version     = package.json version string at the time of the run
//
// Foreign _DONE files (e.g., from the old skill's atomic_checkpoint.py)
// are detected by missing-key validation and rejected at Phase 0 with
// exit code 3. The new CLI does NOT resume directories created by other
// tools (per C2 in PLAN.md).

import { promises as fs } from "node:fs";
import { z } from "zod/v4";
import { writeAtomicText, readTextOrUndefined } from "./atomic.js";
import { utcNowIso } from "../util/time.js";

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const UUID8 = /^[0-9a-f]{8}$/i;

export const DoneSchema = z.object({
  uuid8: z.string().regex(UUID8),
  finished_at: z.string().regex(ISO_UTC),
  phase_completed: z.literal("PACKAGE"),
  cli_version: z.string().min(1),
});

export type DoneSentinel = z.infer<typeof DoneSchema>;

export interface WriteDoneArgs {
  outputDir: string;
  uuid8: string;
  cliVersion: string;
}

export async function writeDone(args: WriteDoneArgs): Promise<string> {
  const target = `${args.outputDir}/_DONE`;
  const payload: DoneSentinel = {
    uuid8: args.uuid8,
    finished_at: utcNowIso(),
    phase_completed: "PACKAGE",
    cli_version: args.cliVersion,
  };
  // Validate before writing — defends against a caller passing a malformed
  // uuid8 (e.g., from a botched arg parse) and shipping it to disk.
  DoneSchema.parse(payload);
  const lines = [
    `uuid8=${payload.uuid8}`,
    `finished_at=${payload.finished_at}`,
    `phase_completed=${payload.phase_completed}`,
    `cli_version=${payload.cli_version}`,
  ];
  await writeAtomicText(target, lines.join("\n") + "\n");
  return target;
}

/** Read and validate _DONE. Returns:
 *  - undefined if file is absent
 *  - DoneSentinel if file matches our locked schema
 * Throws if file exists but does NOT match (e.g., foreign tool's _DONE). */
export async function readDoneStrict(outputDir: string): Promise<DoneSentinel | undefined> {
  const text = await readTextOrUndefined(`${outputDir}/_DONE`);
  if (text === undefined) return undefined;
  const parsed: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    parsed[key] = value;
  }
  // DoneSchema.parse throws on missing or wrong-shaped fields (e.g., the old
  // skill's _DONE has different keys → ZodError → caller treats as foreign).
  return DoneSchema.parse(parsed);
}

/** Best-effort detection: does _DONE exist at all (regardless of schema)?
 *  Used by Phase 0 to distinguish "definitely complete (matches schema)" from
 *  "foreign sentinel present (refuse to operate)". */
export async function doneFileExists(outputDir: string): Promise<boolean> {
  try {
    const stat = await fs.stat(`${outputDir}/_DONE`);
    return stat.isFile();
  } catch {
    return false;
  }
}
