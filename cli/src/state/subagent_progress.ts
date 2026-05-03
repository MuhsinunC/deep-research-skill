// _subagent_progress.json writer + reader.
//
// Used by Phase 3 RETRIEVE / 6 CRITIQUE gap-fill / 7.5 VERIFY to track
// which fan-out sub-agents have completed. Phase 0 RESUME DETECTION reads
// this on resume to skip already-completed sub-agents (Granularity 2).
// Disk-truth wins over this file's content — we only write it as a hint.

import { writeAtomicJson, readJsonOrUndefined } from "./atomic.js";
import { utcNowIso } from "../util/time.js";
import { z } from "zod/v4";

export const SubAgentProgressSchema = z.object({
  phase: z.string(),
  expected_subagents: z.array(z.string()),
  completed_subagents: z.array(z.string()),
  last_updated: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
});

export type SubAgentProgress = z.infer<typeof SubAgentProgressSchema>;

export interface WriteSubAgentProgressArgs {
  outputDir: string;
  phase: string;
  expectedSubAgents: readonly string[];
  completedSubAgents: readonly string[];
}

export async function writeSubAgentProgress(args: WriteSubAgentProgressArgs): Promise<string> {
  const target = `${args.outputDir}/_subagent_progress.json`;
  const data: SubAgentProgress = {
    phase: args.phase,
    expected_subagents: [...args.expectedSubAgents],
    completed_subagents: [...args.completedSubAgents],
    last_updated: utcNowIso(),
  };
  await writeAtomicJson(target, data);
  return target;
}

export async function readSubAgentProgress(
  outputDir: string,
): Promise<SubAgentProgress | undefined> {
  const raw = await readJsonOrUndefined<unknown>(`${outputDir}/_subagent_progress.json`);
  if (raw === undefined) return undefined;
  return SubAgentProgressSchema.parse(raw);
}
