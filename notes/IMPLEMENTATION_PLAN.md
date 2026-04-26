# Implementation Plan — Deep Research Skill Bug Fixes

**Source bug report:** `/Users/user/Documents/Muhsinun/Projects/GitHub/peptides-research/.local/deep-research-skill-bugs-2026-04-25.md`

**Date:** 2026-04-26

**Scope:** All 7 bugs (Bug 1-7) + 4 cross-cutting suggestions (A-D). End-to-end pipeline tests are explicitly out of scope per user direction; small unit tests only.

---

## Skill State Reference (read before reading the plan)

The deep-research skill has this structure:

| Path | Purpose | Lines |
|---|---|---|
| `skill/SKILL.md` | Top-level skill doc; spawn command at Step 2 (~line 157-181); Background Mode section at line 114 | 234 |
| `skill/reference/methodology.md` | 10-phase pipeline detail; checkpoint protocol at line 152; Phase 0 stub absent; Phase 8 PACKAGE at line 1390 | 1487 |
| `skill/reference/continuation.md` | Long-report continuation patterns | (already exists) |
| `skill/scripts/*.py` | Worker-invokable Python helpers (5 existing scripts) | (already exists) |
| `skill/templates/report_template.md` | Final report layout | (already exists) |

The skill is a **prompt-driven instruction doc**, not a long-running daemon. "Workers" are spawned `claude -p` instances that read SKILL.md and execute the methodology. Bug fixes are mostly:

1. **Prose / instruction changes** to `SKILL.md` and `methodology.md` so workers behave correctly
2. **Shell-template changes** in the spawn command (env vars, redirects, sentinel writes, tmux wrapper)
3. **Python helpers** in `skill/scripts/` that workers can shell out to for atomic operations

Everything below maps to one of those three categories.

---

## Anchor Conventions

To avoid line-number drift across edits, this plan references **section anchors** (Markdown headings) in source files. Anchors named below:

- `SKILL.md ## Background Mode (Default)` — current line 114
- `SKILL.md ### Step 2: Generate UUID and Spawn` — current line 157
- `SKILL.md ### Requirements` — current line 224
- `methodology.md ## Task Registration and Output Directory` — current line 121
- `methodology.md ## Checkpoint/Resume Protocol` — current line 152
- `methodology.md ## Phase 1: SCOPE` — current line 174
- `methodology.md ## Phase 3: RETRIEVE` — current line 298
- `methodology.md ## Phase 8: PACKAGE` — current line 1390

When the plan says "edit [Anchor X]," locate the anchor by Markdown heading text, not line number.

---

## Skill-Script Path Resolution (Critical Convention)

**Why this matters:** Workers are LLM-driven Claude Code instances that issue `Bash(...)` tool calls. Each Bash call is a fresh `zsh -c '<command>'` invocation by the harness. Inside such a one-off invocation:

- `$BASH_SOURCE` is **EMPTY** (no script file is being sourced)
- `$0` is the shell name (`zsh`), not a path
- The CWD is whatever the harness happens to have set (typically the user's repo or `~`, NOT the skill dir)

So `python "$(dirname "$BASH_SOURCE")/scripts/atomic_checkpoint.py"` would resolve to `python "./scripts/atomic_checkpoint.py"` and fail.

**Convention used throughout this plan:** All references to skill scripts use the deployed canonical path:

```
~/.claude/skills/deep-research/scripts/atomic_checkpoint.py
```

This works because `tools/deploy-to-live.sh` always rsyncs into that location, and Claude Code reads the skill from that path. The path is stable and survives across sessions, dispatches, and project directories.

**Helper alias for instructions:** Throughout the plan, expressions of the form `<SKILL_SCRIPTS>` mean exactly:
```
~/.claude/skills/deep-research/scripts
```

In every snippet, `<SKILL_SCRIPTS>` MUST be expanded literally to that path (no variable substitution; the placeholder is just a documentation convenience).

---

## Bug 1 Fix: Recursive-Spawn Env-Var Guard

### Files to modify

- `skill/SKILL.md`

### Changes

**Change 1.1** — Modify the spawn command in `### Step 2: Generate UUID and Spawn` to set the worker env var:

**FROM** (current spawn line):
```bash
CLAUDE_CODE_EFFORT_LEVEL=max claude -p "$(cat /tmp/research-brief-${UUID8}.txt)" --model opus --effort max --dangerously-skip-permissions < /dev/null 2>/tmp/research-${UUID8}.err | tee /tmp/research-${UUID8}.log
```

**TO** (multi-line for clarity):
```bash
CLAUDE_CODE_DEEP_RESEARCH_WORKER=1 \
CLAUDE_CODE_DEEP_RESEARCH_UUID8=${UUID8} \
CLAUDE_CODE_EFFORT_LEVEL=max \
  claude -p "$(cat /tmp/research-brief-${UUID8}.txt)" \
  --model opus --effort max \
  --dangerously-skip-permissions \
  < /dev/null \
  2>/tmp/research-${UUID8}.err \
  | tee /tmp/research-${UUID8}.log
```

(Note: `CLAUDE_CODE_DEEP_RESEARCH_UUID8` covers cross-cutting suggestion A simultaneously.)

**Change 1.2** — Modify `## Background Mode (Default)` section to begin with a role check directive:

**Insert at the very top of the section, just below the heading:**

```markdown
## Background Mode (Default)

> **STOP — role check before proceeding.**
>
> Before reading any further in this section, check the environment variable
> `CLAUDE_CODE_DEEP_RESEARCH_WORKER`. The instructions in this section are for
> the **CALLER** (the parent session preparing a research brief and spawning a
> worker), NOT for the worker itself.
>
> - If `CLAUDE_CODE_DEEP_RESEARCH_WORKER=1` is set in your environment, you ARE
>   the worker. **Skip this entire `Background Mode` section** and proceed to
>   the `## Execution` section above. Run the 10-phase pipeline directly. Do
>   NOT spawn another `claude -p` instance — that is recursion. You are
>   already the spawned instance.
> - If the env var is unset or empty, you are the caller. Continue reading
>   this section to learn how to prepare a brief and spawn the worker.
>
> Verify with: `echo $CLAUDE_CODE_DEEP_RESEARCH_WORKER` (should print `1` if
> you are the worker; empty/unset if you are the caller).
>
> Workers MUST emit this log line within the first 30 seconds of starting:
> `[ROLE-CHECK] CLAUDE_CODE_DEEP_RESEARCH_WORKER=1 detected — proceeding as worker`
> so operators can confirm the role check fired (Bug 1 acceptance test).
```

**Change 1.3** — Add a brief-template prefix recommendation. Append to `### Step 1: Prepare the Research Brief` (or as a new sub-section after the Research Brief Template):

```markdown
**Recommended brief-template prefix (defense-in-depth against Bug 1):**

In addition to the env-var guard, prepend the following to the brief content
itself. This way, even if the env-var check fails, the brief steers the worker
correctly:

\`\`\`
*** YOU ARE THE WORKER ***
You are the spawned `claude -p` worker, NOT the parent session. Do NOT spawn
another `claude -p` instance. Run the 10-phase pipeline against the topic
below directly. Skip the `## Background Mode` section of SKILL.md entirely.
*** END WORKER NOTICE ***
\`\`\`
```

### Acceptance criteria (per bug report)

1. Spawn 5 simultaneous dispatches with the env-var guard. `ps -ef | grep "claude -p" | awk '$3 != "1" {print}'` returns empty (no claude -p has a non-init parent PPID).
2. Worker emits `[ROLE-CHECK]` log line within 30 sec of start.
3. Without the env-var guard, recursion still occurs in some non-trivial fraction (negative control). This is a manual smoke test, not a unit test — documented but not automated.

### Unit test scope

- Static check: `skill/scripts/tests/test_skill_md_consistency.py` greps SKILL.md for the env-var name in BOTH the spawn template AND the role-check directive. If only one is present, test fails.

---

## Bug 2 Fix: Resume Capability (Path A + Granularity 1+2 + Atomic Checkpoint)

### Files to modify / create

- `skill/SKILL.md` (add resume-protocol section)
- `skill/reference/methodology.md` (add Phase 0 resume detection; document atomic checkpoint pattern; document sub-agent progress tracking)
- `skill/reference/resume.md` **(NEW)** — dedicated resume reference
- `skill/scripts/atomic_checkpoint.py` **(NEW)** — Python helper for atomic checkpoint writes
- `skill/scripts/tests/test_atomic_checkpoint.py` **(NEW)** — unit tests

### Changes

**Change 2.1** — Add a new section to `SKILL.md` after `## Background Mode (Default)`:

```markdown
## Resume After Interruption

When a dispatch is killed mid-pipeline (operator kill, OS OOM, quota
exhaustion, machine reboot), all phase artifacts written so far remain on
disk in OUTPUT_DIR. The pipeline supports resume from the last completed
phase boundary or the last completed sub-agent inside Phase 3 RETRIEVE / 6
CRITIQUE / 7.5 VERIFY.

### Operator workflow (Path A — brief-prefix resume)

To resume a killed dispatch, re-spawn `claude -p` with the SAME `OUTPUT_DIR`
and prepend a RESUME header to the brief. The worker reads the existing
`_checkpoint.json` and existing artifacts as authoritative and re-runs only
the missing work.

\`\`\`
*** RESUME FROM CHECKPOINT ***

OUTPUT_DIR contains phase artifacts from a prior dispatch that was
interrupted. Read OUTPUT_DIR/_checkpoint.json to determine `phase_completed`.
Read all existing phase artifacts in OUTPUT_DIR and treat them as
authoritative. Reconcile against disk per the resume protocol in
reference/resume.md (Disk-Truth Reconciliation rule): if a phase artifact
exists on disk but the checkpoint disagrees, trust the disk and proceed.

Resume from the phase AFTER `phase_completed`. For Phase 3 RETRIEVE / 6
CRITIQUE / 7.5 VERIFY, also read OUTPUT_DIR/_subagent_progress.json (if
present) and skip sub-agents whose output files already exist on disk.

Do NOT re-do completed phases. Do NOT overwrite existing artifacts. If a
partial artifact exists for the in-flight phase (e.g., scope.md from a Phase
1 that got killed mid-write), DELETE it and redo only that one phase.

If `phase_completed` is "PACKAGE" and `_DONE` exists in OUTPUT_DIR, the
dispatch is COMPLETE — exit immediately and confirm the existing REPORT.md.

*** END RESUME HEADER ***

[Original brief content here]
\`\`\`

### Operator workflow (Path B — auto-detect, optional)

If the spawn command targets an OUTPUT_DIR that already exists AND contains
`_checkpoint.json`, the worker's Phase 0 (see methodology.md) auto-detects
this and runs the same resume logic without needing the explicit header.
Path B is a convenience layer over Path A — they share the same logic.

To force a fresh restart even when artifacts exist, the operator must
explicitly remove the directory: `rm -rf $OUTPUT_DIR && mkdir -p $OUTPUT_DIR`.

### Granularity

The skill supports two resume granularities (Granularity 3 mid-LLM-turn
resume is intentionally NOT implemented — see ADR-002 for rationale):

- **Granularity 1 (phase-boundary):** resume at the phase boundary AFTER the
  last completed phase. All complete-phase artifacts are read from disk;
  the first incomplete phase runs fresh.
- **Granularity 2 (sub-agent-boundary):** within Phase 3 / 6 / 7.5, resume
  at the sub-agent boundary. Existing sub-agent output files are
  preserved; only missing sub-agents are re-spawned.

For full mechanics see `reference/resume.md`.
```

**Change 2.2** — Add a new methodology section just before `## Phase 1: SCOPE`:

```markdown
## Phase 0: RESUME DETECTION (NEW, mandatory)

**Objective:** Detect whether OUTPUT_DIR contains prior-dispatch artifacts
and decide whether to resume or start fresh.

**Progress:** `[Phase RESUME-DETECTION] Checking for prior artifacts...`

**Activities:**

1. Run `ls "$OUTPUT_DIR"` — if the directory does not exist or is empty
   (only `.` and `..`), proceed to Phase 1 normally.

2. Look for `$OUTPUT_DIR/_DONE`. If present, the prior dispatch is
   COMPLETE. Read `$OUTPUT_DIR/REPORT.md` and exit successfully — do not
   re-run any phases. (See Bug 7 below for `_DONE` semantics.)

3. Look for `$OUTPUT_DIR/_checkpoint.json`. If absent, but other phase
   artifacts exist (e.g., `phase01_scope.md`, `phase02_plan.md`), this is
   a "checkpoint missing but disk-truth present" case. Use the
   Disk-Truth Reconciliation rule below to infer phase status from disk
   alone, then synthesize a checkpoint and proceed to resume.

4. If `_checkpoint.json` is present, read its `phase_completed` field.
   Then run Disk-Truth Reconciliation: scan OUTPUT_DIR for the canonical
   per-phase artifact filenames (see "Standardized Output Filenames" in
   `reference/resume.md`). For any phase whose canonical artifact exists
   on disk but is NOT marked complete in the checkpoint, treat that phase
   as complete and update the checkpoint accordingly. **Disk is the
   source of truth; the checkpoint is a hint.**

5. After reconciliation, identify the first incomplete phase and proceed
   from there. For Phase 3 / 6 / 7.5 fan-outs, also read
   `_subagent_progress.json` (if present) and skip sub-agents whose
   output files already exist.

6. Clean up any leftover `*.tmp` files in OUTPUT_DIR (these are
   half-written atomic-replace temp files from a kill mid-write — see
   atomic checkpoint protocol below). Delete them.

**Output:** Either (a) exit because `_DONE` exists, or (b) a reconciled
checkpoint plus a clear "first incomplete phase" decision. Save the
reconciled checkpoint atomically before proceeding.
```

**Change 2.3** — Update `## Checkpoint/Resume Protocol` to require atomic writes and per-artifact updates. Add to the existing section:

```markdown
**Atomic checkpoint writes (mandatory):** Use the atomic-replace pattern to
avoid corruption when killed mid-write. The skill provides a Python helper
that workers MUST use. **Path resolution — always use the deployed canonical
path** (per "Skill-Script Path Resolution" convention at the top of this
plan; `$BASH_SOURCE` is empty in worker Bash tool calls):

\`\`\`bash
python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \
  --output-dir "$OUTPUT_DIR" \
  --phase-completed "RETRIEVE" \
  --next-phase "TRIANGULATE" \
  --extra '{"sources_gathered": 24}'
\`\`\`

The helper writes `_checkpoint.json.tmp` first, fsync's it, then
`os.replace()` to the final name. Result: even if killed mid-write, the
prior checkpoint is preserved and the half-written `.tmp` can be safely
deleted on resume (handled by Phase 0).

**Update the checkpoint at every artifact write (not just phase
boundaries):** When Phase 3 RETRIEVE writes `phase03_retrieve_academic.md`,
update `_checkpoint.json` immediately to reflect `phase_in_progress:
RETRIEVE, completed_subagents: ["academic"]`. Same pattern for Phase 6
gap-fillers and Phase 7.5 verifiers. This eliminates the drift window
where artifacts exist on disk but the checkpoint claims they don't.

**Sub-agent progress tracking — Task tool batched-spawn caveat:** Phase 3
RETRIEVE / 6 CRITIQUE / 7.5 VERIFY use the **Task tool**, which spawns
sub-agents as in-process synchronous calls. The Task tool returns when ALL
parallel sub-agents in a single batch complete; the lead does NOT receive
per-sub-agent completion events. Therefore:

- The lead can update `_subagent_progress.json` reliably AFTER each Task
  batch returns (and after each sub-agent's file is on disk).
- Granularity 2 sub-agent-boundary resume protects against kills BETWEEN
  Task batches, NOT within a single batched fan-out. If killed mid-batch,
  Phase 0 RESUME DETECTION falls back to file-presence-on-disk: it scans
  for sub-agent output files directly and treats `_subagent_progress.json`
  as a hint, not authority. Sub-agents whose files exist on disk are
  treated as complete; sub-agents whose files don't exist are re-spawned.
- The disk-truth fallback eliminates the drift-window concern. Plan-test
  acceptance criterion 2 from the bug report (kill exactly after 2 of 4
  sub-agents) is achievable today via the disk-truth fallback even though
  the lead cannot itself induce the kill point. Full per-sub-agent
  granularity within a batch requires the planned subprocess switch from
  ADR-001 / Stream 2 (out of scope for this plan).

For phases that fan out to multiple sub-agents, write
`$OUTPUT_DIR/_subagent_progress.json` after each Task batch returns.
Format:

\`\`\`json
{
  "phase": "RETRIEVE",
  "expected_subagents": ["academic", "practitioner", "critical", "historical"],
  "completed_subagents": ["academic", "practitioner"],
  "last_updated": "2026-04-26T12:34:56Z"
}
\`\`\`

This is what Phase 0's resume protocol reads to skip already-completed
sub-agents.
```

**Change 2.4** — Create `skill/reference/resume.md` (new file). Contains:

- Complete resume protocol (Path A header template, Path B auto-detect logic)
- Disk-Truth Reconciliation rule with examples
- Standardized Output Filenames table (phase01_scope.md, phase02_plan.md, etc.) — **with backwards-compat alias table** for cross-cutting suggestion B
- Atomic checkpoint write helper usage
- Sub-agent progress tracking schema
- Checkpoint schema reference

**Change 2.5** — Create `skill/scripts/atomic_checkpoint.py`:

```python
#!/usr/bin/env python3
"""Atomic checkpoint writer for the deep-research skill.

Writes _checkpoint.json atomically using temp-file-then-os.replace pattern.
Same approach extends to _subagent_progress.json and _DONE sentinel.

Why atomic: SIGKILL mid-write of a JSON file leaves a half-written file
that can't be parsed. Writing to a .tmp file first and atomically renaming
ensures the destination file is either the prior valid state or the new
valid state — never half-written.

Usage from a worker (bash):
    python scripts/atomic_checkpoint.py \\
        --output-dir "$OUTPUT_DIR" \\
        --phase-completed RETRIEVE \\
        --next-phase TRIANGULATE \\
        --extra '{"sources_gathered": 24}'

Or programmatically:
    from atomic_checkpoint import write_checkpoint, write_subagent_progress, write_done
    write_checkpoint(output_dir, phase_completed="RETRIEVE", ...)
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _atomic_write_json(target: Path, data: dict) -> None:
    """Write JSON atomically: tmp file in same dir, then os.replace."""
    tmp = target.with_suffix(target.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, sort_keys=True)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, target)


def write_checkpoint(
    output_dir: str | os.PathLike,
    phase_completed: str,
    next_phase: str | None = None,
    extra: dict | None = None,
) -> Path:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    target = out / "_checkpoint.json"
    data = {
        "phase_completed": phase_completed,
        "next_phase": next_phase,
        "timestamp": _utc_now_iso(),
    }
    if extra:
        data.update(extra)
    _atomic_write_json(target, data)
    return target


def write_subagent_progress(
    output_dir: str | os.PathLike,
    phase: str,
    expected_subagents: list[str],
    completed_subagents: list[str],
) -> Path:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    target = out / "_subagent_progress.json"
    data = {
        "phase": phase,
        "expected_subagents": expected_subagents,
        "completed_subagents": completed_subagents,
        "last_updated": _utc_now_iso(),
    }
    _atomic_write_json(target, data)
    return target


def write_done(
    output_dir: str | os.PathLike,
    uuid8: str,
    extra: dict | None = None,
) -> Path:
    """Write the _DONE sentinel atomically. MUST be the LAST file written."""
    out = Path(output_dir)
    target = out / "_DONE"
    tmp = out / "_DONE.tmp"
    payload = {
        "completed_at": _utc_now_iso(),
        "phase": "PACKAGE",
        "status": "complete",
        "uuid": uuid8,
    }
    if extra:
        payload.update(extra)
    with open(tmp, "w", encoding="utf-8") as f:
        for k, v in payload.items():
            f.write(f"{k}={v}\n")
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, target)
    return target


def cleanup_tmp_files(output_dir: str | os.PathLike) -> list[Path]:
    """Delete any leftover *.tmp files from a kill mid-write.

    Called by Phase 0 RESUME DETECTION before reading checkpoints.
    Returns the list of files deleted.
    """
    out = Path(output_dir)
    if not out.exists():
        return []
    deleted = []
    for f in out.glob("*.tmp"):
        try:
            f.unlink()
            deleted.append(f)
        except OSError:
            pass
    return deleted


def _parse_extra(text: str | None) -> dict | None:
    if not text:
        return None
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as e:
        print(f"ERROR: --extra is not valid JSON: {e}", file=sys.stderr)
        sys.exit(2)
    if not isinstance(parsed, dict):
        print("ERROR: --extra must be a JSON object", file=sys.stderr)
        sys.exit(2)
    return parsed


def main() -> int:
    p = argparse.ArgumentParser(description="Atomic checkpoint writer")
    sub = p.add_subparsers(dest="cmd", required=False)

    # Default behavior: write checkpoint (back-compat with simple invocations)
    p.add_argument("--output-dir", required=False)
    p.add_argument("--phase-completed", required=False)
    p.add_argument("--next-phase", required=False, default=None)
    p.add_argument("--extra", required=False, default=None)

    # Subcommand: subagent-progress
    sa = sub.add_parser("subagent-progress")
    sa.add_argument("--output-dir", required=True)
    sa.add_argument("--phase", required=True)
    sa.add_argument("--expected", required=True, help="comma-separated subagent names")
    sa.add_argument("--completed", required=True, help="comma-separated subagent names")

    # Subcommand: done
    dn = sub.add_parser("done")
    dn.add_argument("--output-dir", required=True)
    dn.add_argument("--uuid8", required=True)

    # Subcommand: cleanup-tmp
    ct = sub.add_parser("cleanup-tmp")
    ct.add_argument("--output-dir", required=True)

    args = p.parse_args()

    if args.cmd == "subagent-progress":
        target = write_subagent_progress(
            args.output_dir,
            phase=args.phase,
            expected_subagents=[s for s in args.expected.split(",") if s],
            completed_subagents=[s for s in args.completed.split(",") if s],
        )
        print(target)
        return 0

    if args.cmd == "done":
        target = write_done(args.output_dir, uuid8=args.uuid8)
        print(target)
        return 0

    if args.cmd == "cleanup-tmp":
        deleted = cleanup_tmp_files(args.output_dir)
        for d in deleted:
            print(f"deleted: {d}")
        return 0

    # Default: write checkpoint
    if not args.output_dir or not args.phase_completed:
        print(
            "ERROR: --output-dir and --phase-completed are required for "
            "default checkpoint write",
            file=sys.stderr,
        )
        return 2
    target = write_checkpoint(
        args.output_dir,
        phase_completed=args.phase_completed,
        next_phase=args.next_phase,
        extra=_parse_extra(args.extra),
    )
    print(target)
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

**Change 2.6** — Create `skill/scripts/tests/test_atomic_checkpoint.py`:

Tests to include:

1. `test_atomic_write_creates_target` — writes a checkpoint, asserts file exists with correct keys
2. `test_atomic_write_no_partial_on_kill_simulation` — simulates kill by writing to .tmp then NOT renaming; asserts the real `_checkpoint.json` is untouched (or absent if first write)
3. `test_subagent_progress_schema` — writes a subagent progress file, validates the JSON schema (phase, expected_subagents list, completed_subagents list, last_updated ISO timestamp)
4. `test_done_sentinel_idempotent` — write_done twice, second call overwrites cleanly
5. `test_cleanup_tmp_files` — create some .tmp files, run cleanup, assert they're gone but non-tmp files remain
6. `test_extra_field_merge` — write_checkpoint with extra={"sources_gathered": 24}, assert it ends up in the JSON
7. `test_invalid_extra_json_exits_nonzero` — CLI with `--extra "not valid json"` exits with code 2

Each test runs in <1 second. Total suite under 5 seconds.

### Acceptance criteria

Per bug report Bug 2 acceptance section. Granularity 1 and 2 acceptance tests are documented but NOT executed end-to-end. The atomic checkpoint test (case 2 above) IS executed as a unit test.

---

## Bug 3 Fix: Stdin Redirect Prominence

### Files to modify

- `skill/SKILL.md`

### Changes

**Change 3.1** — In `### Step 2: Generate UUID and Spawn`, restructure the spawn command to put `< /dev/null` on its own line and add a prominent warning. The new spawn command was already covered in Bug 1 fix Change 1.1.

**Change 3.2** — Add a heading and warning block above the spawn command:

```markdown
### Spawn Command — STDIN REDIRECT IS REQUIRED

> **The `< /dev/null` redirect is NOT optional.** Without it, the worker
> process hangs at startup with no clear error, despite a misleading
> "proceeding without it" warning in stderr. This has wasted hours of
> debugging in past sessions. Always include the redirect.

[spawn command goes here, with `< /dev/null` on its own line]
```

### Acceptance criteria

- Manual smoke test: spawn without the redirect and verify the silent hang is documented (not an automated test — would require killing claude after 30+ min).
- Static check: `skill/scripts/tests/test_skill_md_consistency.py` greps the spawn template for `< /dev/null`. If absent, test fails.

### Long-term claude CLI fix

Out of scope for this skill — would require changes to the `claude` binary itself. Documented as future work in `notes/ROADMAP.md`.

---

## Bug 4 Fix: Phase 0 Liveness Signal via Wrapper

### Files to modify

- `skill/SKILL.md`
- `skill/reference/methodology.md`

### Changes

**Change 4.1** — There is ONE unified spawn template that combines:
- Bug 1's env-var guard (CLAUDE_CODE_DEEP_RESEARCH_WORKER=1)
- Bug 1's role-check wrapper-side echo (operator-visible signal independent of LLM compliance — addresses reviewer I4)
- Cross-cutting A's UUID env-var (CLAUDE_CODE_DEEP_RESEARCH_UUID8)
- Bug 3's mandatory `< /dev/null` redirect on its own line
- Bug 4's `_starting.txt` write BEFORE `claude -p` is invoked
- Bug 7 Layer 4's tmux-based session wrapper

The single canonical spawn template replaces the entire content of
`### Step 2: Generate UUID and Spawn` (everything after the UUID8/DATE/TOPIC_SLUG/OUTPUT_DIR setup and after the brief is written to `/tmp/research-brief-${UUID8}.txt`):

```bash
# 1. Liveness signal (Bug 4): write_starting.txt BEFORE claude -p so its
#    presence proves the bash wrapper itself ran successfully.
mkdir -p "$OUTPUT_DIR"
echo "started=$(date -u +%Y-%m-%dT%H:%M:%SZ) uuid=${UUID8} mode=${MODE} pid=$$" \
    > "${OUTPUT_DIR}/_starting.txt"

# 2. Wrapper-side role-check echo (Bug 1, addresses reviewer I4): operator-
#    visible signal that the wrapper fired, independent of any LLM behavior.
echo "[ROLE-CHECK-WRAPPER] dispatched ${UUID8} as worker at $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    >> "/tmp/research-${UUID8}.log"

# 3. Spawn via tmux (Bug 7 Layer 4): named session enables live monitoring,
#    cross-dispatch enumeration, and clean kill semantics. Use plain
#    `nohup bash -c "..." &` as a fallback only on environments without tmux.
tmux new-session -d -s "research-${UUID8}" \
  "CLAUDE_CODE_DEEP_RESEARCH_WORKER=1 \
   CLAUDE_CODE_DEEP_RESEARCH_UUID8=${UUID8} \
   CLAUDE_CODE_EFFORT_LEVEL=max \
   claude -p \"\$(cat /tmp/research-brief-${UUID8}.txt)\" \
     --model opus --effort max \
     --dangerously-skip-permissions \
     < /dev/null \
     2>/tmp/research-${UUID8}.err \
     | tee -a /tmp/research-${UUID8}.log"
```

**Why this exact ordering matters:**

- `_starting.txt` is written OUTSIDE the tmux session by the wrapper itself,
  before `tmux new-session` is invoked. If `_starting.txt` is absent 60 sec
  after dispatch, the bash wrapper failed (wrong path, filesystem issue, etc.)
- `[ROLE-CHECK-WRAPPER]` is appended to the log file by the wrapper directly,
  before tmux fires. This proves "the wrapper ran" without depending on the
  LLM emitting its own `[ROLE-CHECK]` line.
- `tee -a` (append) is used inside the tmux session because the wrapper-side
  echo already wrote to the log. Using `tee` (overwrite) would clobber the
  wrapper-side `[ROLE-CHECK-WRAPPER]` line.

**Fallback for environments without tmux** (rare on macOS/Linux dev workstations; possible on minimal CI containers):

```bash
mkdir -p "$OUTPUT_DIR"
echo "started=$(date -u +%Y-%m-%dT%H:%M:%SZ) uuid=${UUID8} mode=${MODE} pid=$$" \
    > "${OUTPUT_DIR}/_starting.txt"
echo "[ROLE-CHECK-WRAPPER] dispatched ${UUID8} as worker at $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    >> "/tmp/research-${UUID8}.log"
nohup bash -c "CLAUDE_CODE_DEEP_RESEARCH_WORKER=1 \
  CLAUDE_CODE_DEEP_RESEARCH_UUID8=${UUID8} \
  CLAUDE_CODE_EFFORT_LEVEL=max \
  claude -p \"\$(cat /tmp/research-brief-${UUID8}.txt)\" \
    --model opus --effort max \
    --dangerously-skip-permissions \
    < /dev/null \
    2>/tmp/research-${UUID8}.err \
    | tee -a /tmp/research-${UUID8}.log" &
disown
```

This loses tmux's live attach + named-session enumeration but still gives Bug 1, Bug 3, Bug 4, Bug 7 Layer 1 (process-exit gate) coverage.

**For zellij users:** equivalent to tmux:
```bash
zellij action new-tab --name "research-${UUID8}" -- bash -c "..."
```

**Change 4.2** — In `methodology.md`, add a brief note in the new Phase 0 section that explains the dual liveness signal:

```markdown
**Note on liveness:** The bash spawn template writes `_starting.txt` to
OUTPUT_DIR before invoking `claude -p`. If `_starting.txt` does not exist
within 60 seconds of dispatch, the bash wrapper itself failed (filesystem
error, wrong path to claude binary, permission issue) — investigate the
spawn command. If `_starting.txt` exists but no other artifacts appear
within 5 minutes, the worker started but is hung — investigate
`research-${UUID8}.log` and `research-${UUID8}.err` and consider killing.
```

### Acceptance criteria

- Spawn a dispatch normally; verify `_starting.txt` exists within 60 seconds (manual smoke test).
- Static check: `test_skill_md_consistency.py` verifies the spawn template writes `_starting.txt` BEFORE the `claude -p` command.

---

## Bug 5 Fix: Browser/MCP Concurrency Guidelines

### Files to modify

- `skill/SKILL.md` (add `## Concurrency Guidelines` section)
- `skill/reference/methodology.md` (cross-reference from RETRIEVE)

### Changes

**Change 5.1** — Add a new top-level section to `SKILL.md` after `## When to Use / NOT Use`:

```markdown
## Concurrency Guidelines (parallel dispatches)

When the user runs multiple dispatches in parallel (a common workflow for
fan-out research like per-peptide reports, per-vendor scrapes, per-topic
deep-dives), each worker MUST observe the following.

### Tab isolation (browser MCP / Chrome MCP)

- Every web fetch happens in a tab the worker created.
- Workers NEVER touch tabs they didn't create — those belong to other
  workers or the user.
- On startup, call the browser MCP's "list tabs" once and treat all
  existing tab IDs as off-limits. Only operate on tabs created by THIS
  worker (track tab IDs in a local list).

### Concurrency caps (recommended)

- General research: 5-10 concurrent workers is OK on a max-plan account.
- Web-scrape-heavy (Reddit, vendor catalogs, sites with anti-bot):
  cap at 3-5 concurrent to avoid IP-level rate limiting.
- Same-domain rate limit: workers should self-rate-limit to ≤1 request
  per 2-5 sec per domain.

### Session-aware sites

For sites where the user is logged in (Reddit, GitHub, etc.), the worker
uses the user's existing session via Chrome MCP — but never navigates
to URLs that would log out, change password, or trigger account-modifying
actions.

### Failure modes

- If a tab the worker owns disappears (other agent killed it accidentally,
  browser restart), the worker re-creates the tab and retries once. If
  still failing, the worker marks the lookup as `[BROWSER FAILURE — NO
  ACCESS]` and continues.
- If the IP is rate-limited by a site, the worker waits exponentially
  (60s, 120s, 240s) and retries up to 3 times.
```

### Acceptance criteria

- Documentation-only change; no automated test. Future work could add a smoke test that runs 5 concurrent dispatches and audits tab usage logs.

---

## Bug 6 Fix: Graceful Pause via _STOP_REQUESTED / _STOP_NOW Flag Files

### Files to modify

- `skill/SKILL.md` (cross-reference)
- `skill/reference/methodology.md` (add pause-flag check at safe boundaries)
- `skill/reference/resume.md` (already covered in Bug 2 — pause checkpoint compatibility)

### Changes

**Change 6.1** — Add a `## Graceful Pause` section to `SKILL.md` after the new `## Resume After Interruption` section:

```markdown
## Graceful Pause

To pause a running dispatch (e.g., to wait out a quota window), the
operator creates a flag file in OUTPUT_DIR:

| Flag | Pause depth | Boundary checked | Resume requires |
|---|---|---|---|
| `_STOP_REQUESTED` | Soft (finish current PHASE) | End of every phase | Operator removes the flag |
| `_STOP_NOW` | Aggressive (finish current sub-agent or LLM call) | End of every sub-agent + every LLM call | Operator removes the flag |

Workers check for both flags at every safe boundary (between phases,
between sub-agents in fan-out phases). When a flag is detected:

1. Worker writes `_checkpoint.json` with `status: "paused"` and
   `paused_reason: "flag-stop_soft"` (for `_STOP_REQUESTED`) or
   `"flag-stop_now"` (for `_STOP_NOW`)
2. Worker writes a human-readable `_PAUSED_AT_PHASE_<NAME>.txt` in
   OUTPUT_DIR with resume instructions
3. Worker exits cleanly with code 0

**Flag policy (Policy A — worker does NOT delete the flag):** the
operator MUST `rm` the flag before resuming. The Phase 0 RESUME DETECTION
explicitly checks for the flag at startup and refuses to resume if
present, with a clear error message:

\`\`\`
Found _STOP_REQUESTED in OUTPUT_DIR. Remove it before resuming, or this
dispatch will pause again immediately at the first phase boundary.
\`\`\`

**Operator workflows:**

- Pause one dispatch: `touch ~/Documents/Research/peptide_xyz_*/_STOP_REQUESTED`
- Pause all: `for d in ~/Documents/Research/peptide_*; do touch "$d/_STOP_REQUESTED"; done`
- Resume one: `rm ~/Documents/Research/peptide_xyz_*/_STOP_REQUESTED`, then
  re-spawn `claude -p` with the same OUTPUT_DIR (Path A or Path B resume)

The pause checkpoint format is identical to a normal phase-boundary
checkpoint plus the `status` and `paused_reason` fields, so the resume
protocol from Bug 2 handles paused dispatches without special cases.
```

**Change 6.2** — In `methodology.md`, at the top of the `## Phase 1: SCOPE` section (and similar pattern at every phase entry), add the pause-flag check (using the deployed canonical script path, not `$BASH_SOURCE`):

```markdown
**Pause check (every phase entry):** Before starting phase activities,
check for pause flags:

\`\`\`bash
if [ -f "$OUTPUT_DIR/_STOP_REQUESTED" ] || [ -f "$OUTPUT_DIR/_STOP_NOW" ]; then
    # Determine which flag matched (most recent)
    flag_type="stop_soft"
    [ -f "$OUTPUT_DIR/_STOP_NOW" ] && flag_type="stop_now"
    python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \
        --output-dir "$OUTPUT_DIR" \
        --phase-completed "$LAST_COMPLETED_PHASE" \
        --next-phase "$THIS_PHASE" \
        --extra "{\"status\": \"paused\", \"paused_reason\": \"flag-${flag_type}\"}"
    echo "Paused at phase $THIS_PHASE due to flag $flag_type" \
        > "$OUTPUT_DIR/_PAUSED_AT_PHASE_${THIS_PHASE}.txt"
    exit 0
fi
\`\`\`

For Phase 3 RETRIEVE / 6 CRITIQUE / 7.5 VERIFY (fan-out phases), also
check for `_STOP_NOW` between sub-agent spawns. `_STOP_REQUESTED` ONLY
matches at phase boundaries; `_STOP_NOW` matches at every safe boundary
(between phases, between sub-agents).
```

This is prose instruction to the worker, not actual shell code that gets executed by the wrapper. The worker reads the methodology and decides where to insert the check.

### Acceptance criteria

Per bug report Bug 6 acceptance section. Manual smoke tests, not automated.

---

## Bug 7 Fix: Completion Signal — Layers 1+2+3+4

### Files to modify

- `skill/SKILL.md`
- `skill/reference/methodology.md` (PACKAGE phase update)
- `skill/scripts/atomic_checkpoint.py` (already includes `write_done` from Bug 2)

### Changes

**Change 7.1 (Layer 1 — Documentation)** — Add a `## Detecting Completion` section to `SKILL.md` after `## Graceful Pause`:

```markdown
## Detecting Completion

A dispatch is COMPLETE when the bash wrapper process has exited AND the
`_DONE` sentinel file exists in OUTPUT_DIR. Either signal alone is
suggestive but not authoritative; together they're definitive.

### Layer 1 — Process exit

The bash wrapper that invoked `claude -p` exits when the worker exits.
Check via:

\`\`\`bash
if ! ps -p "$wrapper_pid" > /dev/null 2>&1; then
    if [ -f "$OUTPUT_DIR/_DONE" ]; then
        echo "Dispatch $UUID8 complete; REPORT.md ready at $OUTPUT_DIR/REPORT.md"
    elif [ -f "$OUTPUT_DIR/_starting.txt" ]; then
        echo "Dispatch $UUID8 exited without producing _DONE — investigate $OUTPUT_DIR and the .err log"
    else
        echo "Dispatch $UUID8 exited without even writing _starting.txt — bash wrapper failed"
    fi
fi
\`\`\`

### Layer 2 — `_DONE` sentinel

The worker's FINAL action in Phase 8 PACKAGE is to write `_DONE` atomically
(via `scripts/atomic_checkpoint.py done --output-dir $OUTPUT_DIR --uuid8
$UUID8`). Operator gate: `[ -f "$OUTPUT_DIR/_DONE" ]`. Single boolean
check. Exists ⇒ done. Absent ⇒ either still in flight OR exited
mid-pipeline (investigate).

### Layer 3 — `~/.claude/research-tasks.json` status

The worker registers itself in `research-tasks.json` at Phase 0 with
`status: "in_progress"` and updates to `status: "complete"` as part of
Phase 8 PACKAGE. Useful for monitoring multiple parallel dispatches:

\`\`\`bash
# All in-flight:
jq -r '.tasks[] | select(.status == "in_progress") | "\(.uuid)\t\(.topic)"' \
    ~/.claude/research-tasks.json

# All complete in last hour:
jq -r --arg h "$(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ)" \
    '.tasks[] | select(.status == "complete" and .complete_time > $h) | .uuid' \
    ~/.claude/research-tasks.json
\`\`\`

### Layer 4 — tmux as the DEFAULT spawn pattern

Replace the current `Bash(run_in_background: true)` spawn with a tmux
session. Operators get for free:

- Live monitoring: `tmux attach -t research-<UUID8>`
- Cross-dispatch enumeration: `tmux ls | grep ^research-`
- Process-exit-as-done baked in: when the wrapped command exits, the
  tmux session terminates automatically
- Clean kill semantics: `tmux kill-session -t research-<UUID8>`
  sends SIGTERM (compatible with the graceful pause SIGTERM behavior, if
  the worker's pause-flag-check is in effect — see `## Graceful Pause`)
- Survives operator-terminal disconnect

\`\`\`bash
mkdir -p "$OUTPUT_DIR"
echo "started=$(date -u +%Y-%m-%dT%H:%M:%SZ) uuid=${UUID8} mode=${MODE}" \
    > "${OUTPUT_DIR}/_starting.txt"

tmux new-session -d -s "research-${UUID8}" \
  "CLAUDE_CODE_DEEP_RESEARCH_WORKER=1 \
   CLAUDE_CODE_DEEP_RESEARCH_UUID8=${UUID8} \
   CLAUDE_CODE_EFFORT_LEVEL=max \
   claude -p \"\$(cat /tmp/research-brief-${UUID8}.txt)\" \
     --model opus --effort max --dangerously-skip-permissions \
     < /dev/null \
     2>/tmp/research-${UUID8}.err | tee /tmp/research-${UUID8}.log"
```

For environments without tmux, document `nohup bash -c "..." &` as a
fallback (loses live monitoring and named-session tracking but works in
minimal CI containers). For zellij users, the equivalent is `zellij
action new-tab --name "research-${UUID8}" -- bash -c "..."`.
```

**Change 7.2 (Layer 2 — `_DONE` write at end of Phase 8)** — Update `methodology.md` Phase 8 PACKAGE section. The existing Phase 8 has activities 1-9 ending with provenance sidecar. Add a new strict-ordering directive AND new activity 10:

```markdown
**Phase 8 ordering rule (NEW — addresses Bug 7 acceptance criterion #2):**
The bug report requires `_DONE` to be the file with the most-recent mtime
in OUTPUT_DIR. Therefore Phase 8 activities MUST execute in this exact
order:

1. Activities 1-7: write REPORT.md (Markdown source).
2. Activity 8: if Step 6 retry was triggered, run the merge logic.
3. Activity 9 (FIRST half — markdown only): write the provenance sidecar
   `research_report_*.provenance.md`.
4. **NEW Activity 9.5 — HTML/PDF generation MUST happen here, BEFORE
   `_checkpoint.json` final update and BEFORE `_DONE`.** Run
   `md_to_html.py` and `weasyprint` to produce sibling `.html` and `.pdf`
   files. After this step, ALL non-sentinel artifacts are on disk.
5. **NEW Activity 9.7 — Update `research-tasks.json`** entry to
   `status: "complete"` with `complete_time: <ISO timestamp>` (atomic
   write via the helper script; see Change 7.3).
6. **NEW Activity 9.8 — Update `_checkpoint.json` atomically** to
   `phase_completed: "PACKAGE"`, `status: "complete"`, `next_phase: null`.
7. **NEW Activity 10 — Write `_DONE` sentinel atomically AS THE FINAL
   ACTION.** Use the deployed canonical path (per "Skill-Script Path
   Resolution" convention; `$BASH_SOURCE` is empty in worker Bash calls):

    \`\`\`bash
    python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py done \
        --output-dir "$OUTPUT_DIR" --uuid8 "$UUID8"
    \`\`\`

After Activity 10, NOTHING else is written to OUTPUT_DIR by the worker.
This guarantees `_DONE` has the most-recent mtime, satisfying Bug 7
acceptance criterion #2.

**Failure-mode behavior:** If killed between Activity 9.5 (HTML/PDF) and
Activity 10 (_DONE), Phase 0 RESUME DETECTION on the next invocation
sees:
- REPORT.md exists → main artifact intact
- HTML/PDF exists → ancillary artifacts intact
- `_checkpoint.json` says `status: "complete"` (Activity 9.8 ran)
- `_DONE` absent (Activity 10 didn't run)

In this state, Phase 0 reconciles by detecting `status: "complete"` in
the checkpoint AND REPORT.md present AND `_DONE` absent: the dispatch is
treated as "completed but missing sentinel." Phase 0 simply writes the
missing `_DONE` and exits, no re-run.

If killed between Activity 9.7 (research-tasks.json complete) and
Activity 9.8 (checkpoint complete): the `research-tasks.json` says
complete but the checkpoint disagrees. Disk-Truth Reconciliation prefers
the checkpoint update OR re-runs the final activities — both are safe
because they're idempotent (atomic-write-replaces always produce the same
end state).
```

**Change 7.3 (Layer 3 — research-tasks.json enforcement)** — Update `methodology.md` Task Registration section. Replace the current bullet "`Update the task status to "completed" in Phase 8 (PACKAGE) after the report is written.`" with:

```markdown
**Phase 0 registration:** Workers MUST write a `research-tasks.json` entry
with `status: "in_progress"` as part of Phase 0 (after RESUME DETECTION,
before Phase 1). This is part of the cross-cutting Phase 0 work, not
optional.

**Phase 8 update:** Workers MUST update the entry to `status: "complete"`
with `complete_time: <ISO timestamp>` as the second-to-last action of
Phase 8 PACKAGE (immediately before writing `_DONE`).
```

### Acceptance criteria

- `_DONE` exists exactly when REPORT.md is fully written and complete (manual smoke test).
- `_DONE` is the last file written (mtime is the most recent in OUTPUT_DIR).
- Static check: `test_skill_md_consistency.py` verifies the methodology Phase 8 instructions reference the `done` subcommand.
- Atomic write of `_DONE` is unit-tested in `test_atomic_checkpoint.py`.

---

## Cross-Cutting Fixes A-D

### Cross-Cutting A — Sub-Agent Process Tree Inspectable

**Files:** `skill/SKILL.md` (covered by Bug 1 fix Change 1.1 — `CLAUDE_CODE_DEEP_RESEARCH_UUID8`), `skill/reference/methodology.md`.

**Change A.1** — In `methodology.md` Phase 3 RETRIEVE section, add a note about env-var propagation to Task tool sub-agents:

```markdown
**Process-tree visibility:** The lead worker has
`CLAUDE_CODE_DEEP_RESEARCH_UUID8=<UUID8>` set in its environment. Task
tool sub-agents may or may not inherit this env var (Task tool internals
not documented). For external visibility (`ps eww | grep <UUID8>`),
include the UUID in each sub-agent's prompt prefix — e.g.,
`"DISPATCH UUID: <UUID8>. LENS: ACADEMIC..."` — so even if env-var
inheritance fails, the UUID appears in the sub-agent's command-line
arguments / displayed prompt.
```

### Cross-Cutting B — Standardized Output Filenames

**Files:** `skill/reference/methodology.md`, `skill/reference/resume.md` (new).

**Change B.1** — Add a "Standardized Output Filenames" section to `resume.md`:

```markdown
## Standardized Output Filenames

The skill writes phase artifacts under canonical names. Resume protocol
recognizes both the canonical names AND legacy names from older
dispatches.

| Phase | Canonical name | Legacy aliases (for resume back-compat) |
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
| 8 | `phase08_REPORT.md` (and link `REPORT.md` → `phase08_REPORT.md`) | `research_report.md`, `research_report_<date>_<topic>.md` |

**Resume back-compat:** Phase 0 RESUME DETECTION recognizes both canonical
and legacy names when reconciling disk truth against checkpoints. New
artifacts written by the current pipeline use canonical names. Legacy
names are accepted on read but never written.
```

**Change B.2** — Update `methodology.md` Phase 3 RETRIEVE prompt examples (currently lines 515-517) to use canonical names instead of `research_agent_1.md` etc. Old examples become misleading.

### Cross-Cutting C — research-tasks.json Enforcement

Already covered in Bug 7 Change 7.3.

### Cross-Cutting D — Cost Forecasting Before Dispatch

**Files:** `skill/SKILL.md`.

**Change D.1** — Add to `### Step 2: Generate UUID and Spawn`, just before the spawn command:

```markdown
**Cost forecast (print before spawning):**

\`\`\`
Estimated cost for ${MODE} mode on this topic:
- Phase 1-2:  ~30K tokens   (lead, Opus)
- Phase 3 RETRIEVE: ~400K tokens   (4 Sonnet sub-agents)
- Phase 4-7:  ~150K tokens   (lead, Opus)
- Phase 7.5 VERIFY: ~200K tokens   (verification sub-agents)
- Phase 8 PACKAGE: ~50K tokens   (lead, Opus)
- TOTAL: ~830K tokens (single-dispatch ultradeep estimate)
- At max-plan rates: roughly 1-2% of 5-hour quota window per dispatch
- For 10 parallel dispatches: ~10-20% of 5-hour window
\`\`\`

These are upper-bound estimates from heavy historical dispatches; actual
usage is typically lower. Use as a sanity check before spawning N>3
parallel dispatches on a constrained quota window.
```

(Estimates from the bug report — not measured against current pipeline. Documented as illustrative; refinement deferred.)

---

## Unit Test Suite

**File:** `skill/scripts/tests/test_atomic_checkpoint.py` and `skill/scripts/tests/test_skill_md_consistency.py`.

### Test inventory

| # | Test | What it asserts | File |
|---|---|---|---|
| 1 | `test_atomic_write_creates_target` | write_checkpoint creates `_checkpoint.json` with required keys | test_atomic_checkpoint.py |
| 2 | `test_atomic_write_uses_tmp_then_replace` | tmp file is created and renamed (verified via mock or by intercepting after-write filesystem state) | test_atomic_checkpoint.py |
| 3 | `test_subagent_progress_schema` | write_subagent_progress emits valid JSON with phase, expected, completed, last_updated | test_atomic_checkpoint.py |
| 4 | `test_done_sentinel_atomic` | write_done creates `_DONE` with required key=value lines, atomically | test_atomic_checkpoint.py |
| 5 | `test_done_sentinel_idempotent` | Calling write_done twice overwrites cleanly | test_atomic_checkpoint.py |
| 6 | `test_cleanup_tmp_files` | Creates several .tmp files, runs cleanup, asserts they're gone but non-tmp files remain | test_atomic_checkpoint.py |
| 7 | `test_extra_field_merge` | write_checkpoint with extra={"x": 1} produces a checkpoint containing "x": 1 | test_atomic_checkpoint.py |
| 8 | `test_invalid_extra_json_exits_2` | CLI invocation with --extra "not json" exits code 2 | test_atomic_checkpoint.py |
| 9 | `test_skill_md_has_worker_envvar` | SKILL.md references CLAUDE_CODE_DEEP_RESEARCH_WORKER in BOTH the spawn template AND the role-check directive | test_skill_md_consistency.py |
| 10 | `test_skill_md_has_stdin_redirect` | SKILL.md spawn template contains `< /dev/null` | test_skill_md_consistency.py |
| 11 | `test_skill_md_writes_starting_before_claude` | SKILL.md spawn template echoes _starting.txt BEFORE invoking `claude -p` | test_skill_md_consistency.py |
| 12 | `test_skill_md_references_done_subcommand` | methodology.md Phase 8 references `atomic_checkpoint.py done` | test_skill_md_consistency.py |

All tests use stdlib only (`unittest`, `tempfile`, `pathlib`, `subprocess`). No external dependencies.

Total expected runtime: <5 seconds for the full suite.

### Test execution

```bash
cd skill && python -m unittest discover scripts/tests -v
```

Add this command to a test runner script `skill/scripts/run_tests.sh` that:
1. Runs the unittest discovery
2. Exits 0 if all pass, non-zero otherwise

---

## Order of Implementation

Tasks #127-134 in the task list, executable in parallel since they touch mostly disjoint sections, BUT for safety and clean commits I'll execute sequentially in this order:

1. Create the new files first (`atomic_checkpoint.py`, `resume.md`, test files) — additive only, no risk to existing behavior
2. Edit `SKILL.md` cumulatively for Bugs 1+3+4+5+6+7+CC-A+CC-D (one file, related changes)
3. Edit `methodology.md` cumulatively for Bugs 2+6+7+CC-A+CC-B (one file, related changes)
4. Run unit tests, fix any failures
5. Code review the result
6. Iterate until clean
7. Deploy + commit + push

---

## Acceptance Tests Run Inline (Unit-Test-Sized)

What's automated and runs in CI-style fashion:

- All 12 unit tests above (atomic_checkpoint behavior + SKILL.md consistency)

What's documented as manual smoke tests but NOT executed:

- Full pipeline end-to-end resume (would require a real dispatch — out of scope per user direction)
- 5-concurrent-dispatch tab isolation
- Recursion negative control (without env-var guard)
- Silent stdin hang reproduction
- Pause/resume cycle

These manual tests are documented in the bug report's acceptance criteria sections and remain as future verification work.

---

## Out of Scope

- **Granularity 3** mid-LLM-turn resume (per bug report recommendation; documented in `notes/adr/002-resume-granularity.md` as deliberately deferred)
- **Path C** explicit `claude -p --resume <output_dir>` CLI mode (would require changes to claude binary itself; deferred)
- **Long-term Bug 3 fix** in claude CLI itself (auto-redirect stdin); deferred
- **End-to-end pipeline tests**; explicitly out of scope per user direction
- **Token-budget self-pause** (Bug 6 Trigger 4) — defer per bug report's own recommendation
- **`mtime` tightening** for stale-checkpoint detection beyond what reconciliation already provides

---

## Risk Register

| Risk | Mitigation |
|---|---|
| Existing dispatches in flight or completed use legacy filenames | Resume protocol accepts both legacy and canonical names (CC-B back-compat) |
| Workers may not honor pause flags reliably (LLM ignoring instructions) | Flag check is documented at every safe boundary; manual smoke tests confirm; future work could add a Python wrapper that intercepts at OS level |
| Atomic checkpoint helper's fsync may be slow on some filesystems | fsync is conditional (only when guarding against power loss); SIGKILL alone doesn't need it |
| Tab-isolation guidance is prose-only — no enforcement | Documented as a recommended pattern; full enforcement would require a Python tab-broker, deferred |
| Cost forecast is illustrative, not measured | Documented as approximate; refine in a future task |

---

## Definition of Done

- All file changes from this plan applied
- Unit tests pass (all 12)
- `superpowers:code-reviewer` returns zero Critical and zero Important findings on both the plan AND the implementation (or any remaining Important findings explicitly deferred with rationale documented in the commit message)
- `tools/deploy-to-live.sh --dry-run` shows expected file changes; then real deploy succeeds
- Changes committed and pushed to `origin/main`
- ROADMAP.md updated to reflect Bug-Fix Stream completion

End of plan.
