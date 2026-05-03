// Centralized UTC timestamp helper.
//
// All on-disk state writers use this so the format is uniform and changing
// it is a one-edit fan-out, not a four-file fan-out.
//
// Format: ISO 8601 UTC with seconds resolution and trailing Z (e.g.
// "2026-05-03T16:00:00Z"). Matches the regex used in zod schemas across
// state/checkpoint, state/subagent_progress, state/done, and state/tasks_registry.

export function utcNowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}
