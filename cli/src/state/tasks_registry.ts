// ~/.claude/research-tasks-cli.json — task registry for the new CLI.
//
// Per I5 in PLAN.md: separate file from the old skill's research-tasks.json.
// No coordination needed between the two tools — each owns its own file.
//
// Updates are atomic via the writeAtomicJson helper. Concurrent writes from
// multiple parallel CLI dispatches use a per-write read-modify-write cycle;
// the rename-based atomicity means the LAST writer wins, which is acceptable
// because each write is a complete snapshot of the registry state.
//
// For higher-concurrency scenarios (10+ parallel dispatches racing the
// registry), a proper file-lock (e.g., proper-lockfile package) could be
// added later. For v1, the read-modify-write loop with atomic-rename is
// sufficient.

import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { z } from "zod/v4";
import { writeAtomicJson } from "./atomic.js";
import { utcNowIso } from "../util/time.js";

export const TaskEntrySchema = z.looseObject({
  uuid: z.string().regex(/^[0-9a-f]{8}$/i),
  topic: z.string(),
  status: z.enum(["in_progress", "complete", "paused", "failed"]),
  output_dir: z.string(),
  start_time: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
  mode: z.enum(["quick", "standard", "deep", "ultradeep"]),
  provider: z.string().optional(),
  cli_version: z.string().optional(),
  complete_time: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/).optional(),
  last_resumed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/).optional(),
  notes: z.string().optional(),
});

export type TaskEntry = z.infer<typeof TaskEntrySchema>;

export const RegistrySchema = z.object({
  tasks: z.array(TaskEntrySchema),
});

export type Registry = z.infer<typeof RegistrySchema>;

/** Resolve the registry path lazily.
 *
 * Tests inject a path via the `DEEP_RESEARCH_CLI_REGISTRY_PATH` env var so
 * they don't have to mock `homedir()` (which can't be redefined in modern
 * Node ESM). Production callers leave the env var unset and the path
 * resolves to `~/.claude/research-tasks-cli.json` per I5 in PLAN.md.
 */
export function getRegistryPath(): string {
  const override = process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"];
  if (override !== undefined && override.length > 0) return override;
  return join(homedir(), ".claude", "research-tasks-cli.json");
}

async function readRegistry(): Promise<Registry> {
  // We INTENTIONALLY do not use readJsonOrUndefined here because that helper
  // only catches ENOENT (per its contract — checkpoint.ts wants loud failure
  // on parse errors so Phase 0 reconciliation falls back to disk-truth).
  //
  // The registry has a different contract: an empty file, a half-written
  // file (from a SIGKILL mid-rename), or a hand-edited malformed file MUST
  // NOT block subsequent registry updates. Phase 8 step 4 (markTaskComplete)
  // is on the critical path and cannot afford a SyntaxError. Treat any read
  // failure as "empty registry" and overwrite on the next atomic write.
  let text: string;
  try {
    text = await fs.readFile(getRegistryPath(), "utf8");
  } catch (err: unknown) {
    if (isNotFoundError(err)) return { tasks: [] };
    throw err;
  }
  if (text.trim() === "") return { tasks: [] };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    // Malformed JSON: treat as empty. The next atomic write overwrites cleanly.
    return { tasks: [] };
  }
  const result = RegistrySchema.safeParse(raw);
  return result.success ? result.data : { tasks: [] };
}

function isNotFoundError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "ENOENT"
  );
}

export interface RegisterArgs {
  uuid: string;
  topic: string;
  outputDir: string;
  mode: TaskEntry["mode"];
  provider?: string;
  cliVersion?: string;
}

export async function registerTask(args: RegisterArgs): Promise<void> {
  const registry = await readRegistry();
  const idx = registry.tasks.findIndex((t) => t.uuid === args.uuid);
  const entry: TaskEntry = {
    uuid: args.uuid,
    topic: args.topic,
    status: "in_progress",
    output_dir: args.outputDir,
    start_time: utcNowIso(),
    mode: args.mode,
    ...(args.provider !== undefined && { provider: args.provider }),
    ...(args.cliVersion !== undefined && { cli_version: args.cliVersion }),
  };
  if (idx >= 0) {
    registry.tasks[idx] = entry;
  } else {
    registry.tasks.push(entry);
  }
  await writeAtomicJson(getRegistryPath(), registry);
}

export async function markTaskResumed(uuid: string): Promise<void> {
  const registry = await readRegistry();
  const idx = registry.tasks.findIndex((t) => t.uuid === uuid);
  if (idx < 0) return; // Resume of an unregistered task: Phase 0 will register fresh
  const existing = registry.tasks[idx];
  if (existing === undefined) return;
  registry.tasks[idx] = { ...existing, last_resumed_at: utcNowIso() };
  await writeAtomicJson(getRegistryPath(), registry);
}

export async function markTaskComplete(uuid: string): Promise<void> {
  const registry = await readRegistry();
  const idx = registry.tasks.findIndex((t) => t.uuid === uuid);
  if (idx < 0) return; // Complete of an unregistered task is a no-op (best effort).
  const existing = registry.tasks[idx];
  if (existing === undefined) return;
  registry.tasks[idx] = { ...existing, status: "complete", complete_time: utcNowIso() };
  await writeAtomicJson(getRegistryPath(), registry);
}

export async function markTaskPaused(uuid: string, reason: string): Promise<void> {
  const registry = await readRegistry();
  const idx = registry.tasks.findIndex((t) => t.uuid === uuid);
  if (idx < 0) return;
  const existing = registry.tasks[idx];
  if (existing === undefined) return;
  registry.tasks[idx] = {
    ...existing,
    status: "paused",
    notes: reason,
  };
  await writeAtomicJson(getRegistryPath(), registry);
}
