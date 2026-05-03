// _checkpoint.json writer + reader.
//
// Schema is intentionally permissive — phase handlers can stuff arbitrary
// `extra` fields. The locked fields are: phase_completed, next_phase,
// timestamp, status, and (during fan-out phases) phase_in_progress.

import { writeAtomicJson, readJsonOrUndefined } from "./atomic.js";
import { utcNowIso } from "../util/time.js";
import { z } from "zod/v4";

export const PhaseStatusSchema = z.enum(["complete", "paused"]).optional();

export const CheckpointSchema = z.looseObject({
  phase_completed: z.string(),
  next_phase: z.string().nullable(),
  timestamp: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
  status: PhaseStatusSchema,
  phase_in_progress: z.string().optional(),
  paused_reason: z.string().optional(),
});

export type Checkpoint = z.infer<typeof CheckpointSchema>;

export interface WriteCheckpointArgs {
  outputDir: string;
  phaseCompleted: string;
  nextPhase: string | null;
  extra?: Record<string, unknown>;
}

export async function writeCheckpoint(args: WriteCheckpointArgs): Promise<string> {
  const { outputDir, phaseCompleted, nextPhase, extra } = args;
  const target = `${outputDir}/_checkpoint.json`;
  const data: Record<string, unknown> = {
    phase_completed: phaseCompleted,
    next_phase: nextPhase,
    timestamp: utcNowIso(),
    ...extra,
  };
  await writeAtomicJson(target, data);
  return target;
}

export async function readCheckpoint(outputDir: string): Promise<Checkpoint | undefined> {
  const raw = await readJsonOrUndefined<unknown>(`${outputDir}/_checkpoint.json`);
  if (raw === undefined) return undefined;
  // Validate. If the file is malformed (corrupted by a bad actor or older
  // tool), parse will throw — Phase 0 reconciliation treats this as
  // "no checkpoint" and falls back to disk-truth.
  return CheckpointSchema.parse(raw);
}
