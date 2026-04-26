#!/usr/bin/env python3
"""Atomic checkpoint writer for the deep-research skill.

Writes _checkpoint.json, _subagent_progress.json, and _DONE atomically using
temp-file-then-os.replace. Avoids corruption when killed mid-write.

Usage from a worker (bash):
    # Default checkpoint write:
    python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \\
        --output-dir "$OUTPUT_DIR" \\
        --phase-completed RETRIEVE \\
        --next-phase TRIANGULATE \\
        --extra '{"sources_gathered": 24}'

    # Sub-agent progress:
    python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \\
        subagent-progress --output-dir "$OUTPUT_DIR" \\
        --phase RETRIEVE --expected academic,practitioner,critical,historical \\
        --completed academic,practitioner

    # _DONE sentinel (FINAL action of Phase 8):
    python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py done \\
        --output-dir "$OUTPUT_DIR" --uuid8 "$UUID8"

    # Cleanup leftover .tmp files (called by Phase 0 RESUME DETECTION):
    python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py cleanup-tmp \\
        --output-dir "$OUTPUT_DIR"

Programmatic use:
    from atomic_checkpoint import (
        write_checkpoint, write_subagent_progress, write_done,
        cleanup_tmp_files,
    )
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _atomic_write_json(target: Path, data: dict) -> None:
    """Write JSON atomically: tmp file in same directory, then os.replace.

    Critical preconditions documented in the plan:
    - tmp file MUST be in the same directory as target (cross-filesystem
      rename via /tmp/ would defeat atomicity on Linux)
    - os.replace works correctly on POSIX AND Windows (os.rename does not)
    - fsync ensures the bytes hit disk before the rename, guarding against
      power loss (SIGKILL alone doesn't need this, but it's cheap insurance)
    """
    target = Path(target)
    target.parent.mkdir(parents=True, exist_ok=True)
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
    """Write the main _checkpoint.json atomically.

    `extra` may include keys like `sources_gathered`, `completed_subagents`,
    `status` (e.g., "paused"), `paused_reason`, `phase_in_progress`, etc.
    """
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    target = out / "_checkpoint.json"
    data: dict = {
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
    """Write _subagent_progress.json atomically.

    Used by Phase 3 RETRIEVE / 6 CRITIQUE / 7.5 VERIFY to track which
    fan-out sub-agents have completed. Phase 0 RESUME DETECTION reads this
    on resume to skip already-completed sub-agents (Granularity 2).
    """
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    target = out / "_subagent_progress.json"
    data = {
        "phase": phase,
        "expected_subagents": list(expected_subagents),
        "completed_subagents": list(completed_subagents),
        "last_updated": _utc_now_iso(),
    }
    _atomic_write_json(target, data)
    return target


def write_done(
    output_dir: str | os.PathLike,
    uuid8: str,
    extra: dict | None = None,
) -> Path:
    """Write the _DONE sentinel atomically.

    MUST be the FINAL action of Phase 8 PACKAGE — after REPORT.md, after
    HTML/PDF, after the provenance sidecar, after the final checkpoint
    update, and after the research-tasks.json status update. The presence
    of _DONE is what external monitors use to determine "is this dispatch
    complete?" — see SKILL.md `## Detecting Completion`.

    Format is plain key=value text (not JSON) for trivial bash-side parsing
    via `grep '^uuid=' _DONE`.
    """
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
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
    Returns the list of files deleted (for logging).

    Returns [] if the directory doesn't exist (not an error — fresh dispatch).
    """
    out = Path(output_dir)
    if not out.exists() or not out.is_dir():
        return []
    deleted: list[Path] = []
    for f in out.glob("*.tmp"):
        try:
            f.unlink()
            deleted.append(f)
        except OSError:
            # Best-effort cleanup; if we can't delete a tmp file, the
            # subsequent atomic_write will overwrite it anyway.
            pass
    return deleted


def _parse_extra(text: str | None) -> dict | None:
    """Parse the --extra CLI argument as a JSON object.

    Returns None for empty input; exits with code 2 for malformed JSON or
    non-object JSON (e.g., a JSON array). The non-object check matters
    because the result is `dict.update`'d into the checkpoint payload.
    """
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


def _split_csv(text: str) -> list[str]:
    """Split comma-separated arg into list, dropping empty elements."""
    return [s.strip() for s in text.split(",") if s.strip()]


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(
        description="Atomic checkpoint writer for the deep-research skill",
    )
    sub = p.add_subparsers(dest="cmd", required=False)

    # Default subcommand (no positional): write the main checkpoint.
    p.add_argument("--output-dir", required=False)
    p.add_argument("--phase-completed", required=False)
    p.add_argument("--next-phase", required=False, default=None)
    p.add_argument("--extra", required=False, default=None)

    sa = sub.add_parser("subagent-progress", help="Write _subagent_progress.json")
    sa.add_argument("--output-dir", required=True)
    sa.add_argument("--phase", required=True)
    sa.add_argument("--expected", required=True, help="comma-separated subagent names")
    sa.add_argument("--completed", required=True, help="comma-separated subagent names")

    dn = sub.add_parser("done", help="Write _DONE sentinel (FINAL Phase 8 action)")
    dn.add_argument("--output-dir", required=True)
    dn.add_argument("--uuid8", required=True)
    dn.add_argument("--extra", required=False, default=None)

    ct = sub.add_parser("cleanup-tmp", help="Delete leftover *.tmp files from a kill mid-write")
    ct.add_argument("--output-dir", required=True)

    args = p.parse_args(argv)

    if args.cmd == "subagent-progress":
        target = write_subagent_progress(
            args.output_dir,
            phase=args.phase,
            expected_subagents=_split_csv(args.expected),
            completed_subagents=_split_csv(args.completed),
        )
        print(target)
        return 0

    if args.cmd == "done":
        extra = _parse_extra(args.extra)
        target = write_done(args.output_dir, uuid8=args.uuid8, extra=extra)
        print(target)
        return 0

    if args.cmd == "cleanup-tmp":
        deleted = cleanup_tmp_files(args.output_dir)
        for d in deleted:
            print(f"deleted: {d}")
        return 0

    # Default: write main checkpoint
    if not args.output_dir or not args.phase_completed:
        print(
            "ERROR: --output-dir and --phase-completed are required for "
            "default checkpoint write (or use a subcommand: subagent-progress / "
            "done / cleanup-tmp)",
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
