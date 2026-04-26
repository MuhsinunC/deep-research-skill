# Resume Protocol

Detailed protocol for resuming a deep-research dispatch that was killed mid-pipeline (operator kill, OS OOM, Anthropic quota window exhaustion, machine reboot, network failure).

This file is consumed by the worker via the `Phase 0: RESUME DETECTION` step in `methodology.md`. It is referenced from `SKILL.md`'s `## Resume After Interruption` section.

---

## Goals

- Preserve all phase artifacts the prior dispatch wrote to disk
- Avoid re-doing completed work
- Detect and recover from kills at any point in the pipeline
- Handle the case where checkpoint and disk-truth disagree

---

## Two Operator Workflows

### Path A — Brief-prefix resume (explicit)

The operator prepends an explicit RESUME header to the brief. Useful when the operator wants to be deliberate about the resume choice.

```
*** RESUME FROM CHECKPOINT ***

OUTPUT_DIR contains phase artifacts from a prior dispatch that was
interrupted. Read OUTPUT_DIR/_checkpoint.json to determine
`phase_completed`. Read all existing phase artifacts in OUTPUT_DIR and
treat them as authoritative.

Reconcile against disk per the Disk-Truth Reconciliation rule below: if
a phase artifact exists on disk but the checkpoint disagrees, trust the
disk and proceed.

Resume from the phase AFTER `phase_completed`. For Phase 3 RETRIEVE / 6
CRITIQUE / 7.5 VERIFY, also read OUTPUT_DIR/_subagent_progress.json (if
present) and skip sub-agents whose output files already exist on disk.

Do NOT re-do completed phases. Do NOT overwrite existing artifacts. If
a partial artifact exists for the in-flight phase (e.g., scope.md from
a Phase 1 that got killed mid-write), DELETE it and redo only that one
phase.

If `phase_completed` is "PACKAGE" and `_DONE` exists in OUTPUT_DIR, the
dispatch is COMPLETE — exit immediately and confirm the existing
REPORT.md.

*** END RESUME HEADER ***

[Original brief content here]
```

### Path B — Auto-detect (transparent)

If the spawn command targets an `OUTPUT_DIR` that already exists and contains either `_checkpoint.json` OR any `phase*.md` artifact, the worker's Phase 0 step auto-detects this and follows the same logic as Path A. No special header required.

To force a fresh start when artifacts exist, the operator must explicitly remove the directory:

```bash
rm -rf "$OUTPUT_DIR" && mkdir -p "$OUTPUT_DIR"
```

---

## Disk-Truth Reconciliation Rule

When `_checkpoint.json` and the on-disk artifacts disagree, **disk wins**. The checkpoint is a hint about progress; the actual files written to disk are authoritative evidence of what completed.

### Rationale

The Phase 8 ordering (see methodology.md) writes artifacts BEFORE updating the checkpoint at the end of each phase. So a kill between artifact-write and checkpoint-update produces a state where disk has more progress than the checkpoint claims. This is a benign, recoverable state — disk-truth reconciliation handles it.

### Reconciliation algorithm

1. Read `_checkpoint.json` if present (may be absent in early-kill scenarios — that's OK).
2. Scan `OUTPUT_DIR` for canonical phase artifact filenames (see "Standardized Output Filenames" below). Also accept legacy aliases.
3. For each phase, set `phase_complete[phase] = TRUE` if the canonical artifact (or a legacy alias) exists on disk.
4. If the checkpoint says a phase is incomplete but the artifact exists on disk, treat the phase as complete.
5. If the checkpoint says a phase is complete but the artifact is missing on disk, treat the phase as INCOMPLETE — the worker may have written the checkpoint out of order, or the file was deleted. Re-run that phase.
6. After reconciliation, atomically write the corrected checkpoint via `atomic_checkpoint.py` and proceed.

### Pseudocode

```python
def reconcile(output_dir):
    cp = read_checkpoint_or_none(output_dir)
    disk = scan_disk_artifacts(output_dir)  # → set of completed-phase names
    # Trust disk where it says "yes"
    completed = set(cp.get("completed_phases", [])) | disk
    # But don't trust the checkpoint if it claims something disk denies
    completed = {p for p in completed if disk_or_legacy_matches(p, output_dir)}
    next_phase = first_incomplete_phase(completed)
    write_checkpoint_atomic(output_dir, completed_phases=list(completed),
                            next_phase=next_phase)
    return next_phase
```

---

## Standardized Output Filenames

The skill writes phase artifacts under canonical names. The resume protocol recognizes both canonical names AND legacy names from older dispatches.

| Phase | Canonical name | Legacy aliases (accepted on read only) |
|---|---|---|
| 1 | `phase01_scope.md` | `scope.md`, `_phase1_scope.md` |
| 2 | `phase02_plan.md` | `plan.md`, `_phase2_plan.md` |
| 3 | `phase03_retrieve_<lens>.md` (one per sub-agent) | `research_agent_N.md`, `agent_<lens>.md`, `stream-<lens>.md` |
| 4 | `phase04_triangulate.md` | `_phase4_triangulate.md` |
| 4.5 | `phase04_5_outline.md` | `refined_outline.md` |
| 5 | `phase05_synthesize.md` | `_phase5_synthesize.md` |
| 6 | `phase06_critique.md` | `critique.md` |
| 7 | `phase07_refine.md` | `refined_report.md` |
| 7.5 | `phase07_5_verify_<sublens>.md` | `verify_citation_N.md`, `verify_adversarial.md` |
| 8 | `research_report_<YYYYMMDD>_<topic-slug>.md` | (no canonical change — see note) |

### Phase 8 naming note

The final report keeps its existing convention `research_report_<DATE>_<SLUG>.md` (per `report-assembly.md`). This is NOT renamed to `phase08_REPORT.md` because:

1. The existing convention is consumer-facing (operators look for it; documentation references it; sibling `.html` and `.pdf` files are derived from it).
2. Renaming would require updating `report-assembly.md`, `templates/report_template.md`, the provenance-sidecar derivation, and `validate_report.py`.
3. Phase 8 completion is signaled by the `_DONE` sentinel, not by the report's filename — there's no operational benefit to renaming.

The resume protocol recognizes Phase 8 as complete when EITHER:
- A `research_report_*.md` file exists (any matching the glob), OR
- `_DONE` exists.

---

## Sub-Agent Progress Tracking (Granularity 2)

For phases that fan out to multiple sub-agents (Phase 3 RETRIEVE, Phase 6 CRITIQUE gap-fill, Phase 7.5 VERIFY), the worker writes `_subagent_progress.json` after each sub-agent's output file lands. Format:

```json
{
  "phase": "RETRIEVE",
  "expected_subagents": ["academic", "practitioner", "critical", "historical"],
  "completed_subagents": ["academic", "practitioner"],
  "last_updated": "2026-04-26T12:34:56Z"
}
```

### Task tool batched-spawn caveat

The skill currently spawns sub-agents via the **Task tool**, which executes them as in-process synchronous calls inside one batch. The lead receives a single batch return; it does NOT receive per-sub-agent completion events.

So `_subagent_progress.json` updates happen:
- After each Task batch returns (the lead reads the on-disk sub-agent files and updates the progress file).
- NOT at fine-grained per-sub-agent granularity within a batch.

If killed mid-batch (one or more sub-agents wrote files but the batch hadn't returned), the prior `_subagent_progress.json` may not reflect every file on disk. **The Disk-Truth Reconciliation rule covers this:** Phase 0 scans `OUTPUT_DIR` directly for sub-agent output files and treats `_subagent_progress.json` as a hint, not authority. Sub-agents whose files exist on disk are treated as complete; sub-agents whose files don't exist are re-spawned.

This means Granularity 2 acceptance (the bug report's test case "kill exactly after 2 of 4 sub-agents") works in practice via the disk-truth fallback even though the lead cannot itself induce the kill point. Full per-sub-agent granularity within a batch (with the lead actively cancelling in-flight Task calls) requires the planned subprocess switch from ADR-001 / Stream 2 — out of scope for the current bug-fix release.

---

## Atomic Checkpoint Writes

All checkpoint and sentinel writes use the helper at:

```
~/.claude/skills/deep-research/scripts/atomic_checkpoint.py
```

Why: workers issue `Bash(...)` tool calls that run as one-off `zsh -c '<cmd>'` invocations. Inside such a call, `$BASH_SOURCE` is **empty** and `$0` is the shell name, NOT the script path. The deployed canonical path is the only reliable way for the worker to find the helper.

### Operations

```bash
# Write _checkpoint.json
python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \
    --output-dir "$OUTPUT_DIR" \
    --phase-completed "RETRIEVE" \
    --next-phase "TRIANGULATE" \
    --extra '{"sources_gathered": 24}'

# Write _subagent_progress.json
python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \
    subagent-progress \
    --output-dir "$OUTPUT_DIR" \
    --phase RETRIEVE \
    --expected academic,practitioner,critical,historical \
    --completed academic,practitioner

# Write _DONE sentinel (FINAL action of Phase 8)
python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \
    done --output-dir "$OUTPUT_DIR" --uuid8 "$UUID8"

# Cleanup leftover *.tmp files (called at start of Phase 0 RESUME DETECTION)
python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \
    cleanup-tmp --output-dir "$OUTPUT_DIR"
```

### Atomicity guarantee

Each call writes to a `.tmp` file in the same directory, then `os.replace`'s it to the final name. `os.replace` is atomic on POSIX and Windows. If killed mid-write:

- Before the rename: the prior valid file (if any) is intact; a `.tmp` may exist and is cleaned up by Phase 0 on next invocation.
- During or after the rename: the new file is intact.

Never a half-written corrupt destination.

---

## Pause Compatibility

The graceful pause mechanism (`_STOP_REQUESTED` and `_STOP_NOW` flag files — see `SKILL.md` `## Graceful Pause`) produces a checkpoint with `status: "paused"` and `paused_reason: "flag-stop_soft"` or `"flag-stop_now"`. The resume protocol treats `status: "paused"` identically to `phase_completed: "<X>"` for resume purposes — pause and resume are two ends of the same protocol.

The operator MUST `rm` the flag file before resuming (Policy A). Phase 0 RESUME DETECTION refuses to start if a flag file is still present, with this error:

```
Found _STOP_REQUESTED in OUTPUT_DIR. Remove it before resuming, or this
dispatch will pause again immediately at the first phase boundary.
```

---

## Granularity 3 (Mid-LLM-Turn) Is Deliberately Not Implemented

The bug report identifies a third, more aggressive granularity: checkpoint mid-LLM-stream by saving partial output every few seconds and resuming with a "continue from this exact partial output" prompt. This is intentionally NOT implemented. Reasons:

1. **Marginal token savings.** LLMs handle "continue from arbitrary mid-sentence" poorly; the resumed turn often re-generates the section anyway, eliminating the savings.
2. **Quality risk.** A resumed turn picking up awkwardly produces worse output than a clean restart of the affected phase.
3. **Implementation cost.** Hooking the streaming API and managing partial-response resume is roughly 1 week of work vs. roughly 2 days for Granularities 1+2 combined.
4. **Coverage.** Granularities 1 and 2 capture an estimated 95% of the value at 30% of the effort. The remaining 5% (kills during a single long LLM turn) is rare in practice and costs ~30K-100K tokens to recover from, which is acceptable.

If a future release of the skill needs Granularity 3, this decision should be revisited with measured data on how often kills occur mid-LLM-turn vs. between turns.

---

## Failure Modes Handled

| Kill timing | What's preserved | What's redone |
|---|---|---|
| Before Phase 1 starts | (nothing) | Full pipeline from Phase 1 |
| Mid-Phase-N artifact write | Phase 1..N-1 (complete on disk) | Phase N from start |
| After Phase-N artifact, before checkpoint | Phase 1..N (disk-truth wins via reconciliation) | Phase N+1 onward |
| After checkpoint, before next phase starts | Phase 1..N (matches checkpoint) | Phase N+1 onward |
| During Phase 3 sub-agent batch (Task tool) | All sub-agents whose files exist on disk | Sub-agents whose files don't exist; the rest of Phase 3 if any |
| Mid-Phase-8 PACKAGE, before _DONE | Everything written so far (REPORT.md, HTML/PDF, provenance, checkpoint) | Final activities (writing _DONE), idempotent on resume |
| After _DONE | Full dispatch | Nothing — exit immediately |

---

## See Also

- `methodology.md` — full pipeline definition; Phase 0 RESUME DETECTION is at the top, Phase 8 PACKAGE ordering at the bottom
- `SKILL.md` — operator-facing resume + pause + completion documentation
- `scripts/atomic_checkpoint.py` — the helper invoked by all checkpoint and sentinel writes
- `scripts/tests/test_atomic_checkpoint.py` — unit tests for the helper
