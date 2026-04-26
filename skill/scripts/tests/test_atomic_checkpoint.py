"""Unit tests for atomic_checkpoint.py.

Scope: behavior of the atomic-write helper. NOT end-to-end pipeline tests
(those are out of scope per user direction).

Each test runs in <1 second; full suite under 5 seconds.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

# Ensure the script directory is on sys.path so `import atomic_checkpoint` works.
SCRIPT_DIR = Path(__file__).resolve().parent.parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import atomic_checkpoint  # noqa: E402


class TestAtomicCheckpoint(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.tmp_path = Path(self._tmp.name)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    # --- Test 1 ---
    def test_atomic_write_creates_target(self) -> None:
        target = atomic_checkpoint.write_checkpoint(
            self.tmp_path,
            phase_completed="RETRIEVE",
            next_phase="TRIANGULATE",
        )
        self.assertTrue(target.exists())
        data = json.loads(target.read_text())
        self.assertEqual(data["phase_completed"], "RETRIEVE")
        self.assertEqual(data["next_phase"], "TRIANGULATE")
        self.assertIn("timestamp", data)
        # Timestamp is RFC3339-ish UTC
        self.assertRegex(data["timestamp"], r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")

    # --- Test 2 ---
    def test_atomic_write_no_partial_on_replace_failure(self) -> None:
        """Simulate a kill at the worst possible moment: after the .tmp is
        written but before os.replace. Verify the prior _checkpoint.json
        (if any) is still intact, and the .tmp file remains as evidence
        for cleanup_tmp_files to handle.
        """
        # First, write a valid prior checkpoint.
        atomic_checkpoint.write_checkpoint(
            self.tmp_path, phase_completed="SCOPE", next_phase="PLAN",
        )
        prior_target = self.tmp_path / "_checkpoint.json"
        prior_data = json.loads(prior_target.read_text())

        # Now simulate a kill mid-write by patching os.replace to raise.
        with mock.patch.object(
            atomic_checkpoint.os,
            "replace",
            side_effect=OSError("simulated kill before rename"),
        ):
            with self.assertRaises(OSError):
                atomic_checkpoint.write_checkpoint(
                    self.tmp_path,
                    phase_completed="PLAN",
                    next_phase="RETRIEVE",
                )

        # Prior checkpoint must be intact (atomic guarantee).
        post_data = json.loads(prior_target.read_text())
        self.assertEqual(post_data, prior_data)
        # The .tmp file may exist (kill happened after json.dump) — that's
        # expected and cleanup_tmp_files handles it.
        tmp_files = list(self.tmp_path.glob("*.tmp"))
        # Either tmp exists (kill point after dump, before replace) or
        # doesn't (kill before dump completed) — both acceptable.
        # Either way, _checkpoint.json itself is the prior valid version.
        self.assertTrue(prior_target.exists())
        # Cleanup tmp explicitly to confirm it doesn't blow up.
        deleted = atomic_checkpoint.cleanup_tmp_files(self.tmp_path)
        if tmp_files:
            self.assertEqual(len(deleted), len(tmp_files))

    # --- Test 3 ---
    def test_subagent_progress_schema(self) -> None:
        target = atomic_checkpoint.write_subagent_progress(
            self.tmp_path,
            phase="RETRIEVE",
            expected_subagents=["academic", "practitioner", "critical", "historical"],
            completed_subagents=["academic", "practitioner"],
        )
        self.assertTrue(target.exists())
        data = json.loads(target.read_text())
        self.assertEqual(data["phase"], "RETRIEVE")
        self.assertEqual(
            data["expected_subagents"],
            ["academic", "practitioner", "critical", "historical"],
        )
        self.assertEqual(data["completed_subagents"], ["academic", "practitioner"])
        self.assertRegex(data["last_updated"], r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")

    # --- Test 4 ---
    def test_done_sentinel_atomic(self) -> None:
        target = atomic_checkpoint.write_done(self.tmp_path, uuid8="a1b2c3d4")
        self.assertTrue(target.exists())
        self.assertEqual(target.name, "_DONE")
        text = target.read_text()
        self.assertIn("uuid=a1b2c3d4", text)
        self.assertIn("phase=PACKAGE", text)
        self.assertIn("status=complete", text)
        self.assertRegex(text, r"completed_at=\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z")
        # No .tmp left behind
        self.assertFalse((self.tmp_path / "_DONE.tmp").exists())

    # --- Test 5 ---
    def test_done_sentinel_idempotent(self) -> None:
        first = atomic_checkpoint.write_done(self.tmp_path, uuid8="a1b2c3d4")
        first_text = first.read_text()
        second = atomic_checkpoint.write_done(self.tmp_path, uuid8="a1b2c3d4")
        second_text = second.read_text()
        self.assertEqual(first, second)
        # Both calls produce uuid=a1b2c3d4 (timestamps may differ)
        self.assertIn("uuid=a1b2c3d4", first_text)
        self.assertIn("uuid=a1b2c3d4", second_text)
        # Only one _DONE file exists; no .tmp lingering
        self.assertEqual(len(list(self.tmp_path.glob("_DONE*"))), 1)

    # --- Test 6 ---
    def test_cleanup_tmp_files(self) -> None:
        # Create three tmp files and one non-tmp file
        (self.tmp_path / "_checkpoint.json.tmp").write_text("{}")
        (self.tmp_path / "_DONE.tmp").write_text("incomplete")
        (self.tmp_path / "scope.md.tmp").write_text("partial")
        (self.tmp_path / "REPORT.md").write_text("# real report")

        deleted = atomic_checkpoint.cleanup_tmp_files(self.tmp_path)

        self.assertEqual(len(deleted), 3)
        self.assertEqual(len(list(self.tmp_path.glob("*.tmp"))), 0)
        # Non-tmp file untouched
        self.assertTrue((self.tmp_path / "REPORT.md").exists())

    # --- Test 6b ---
    def test_cleanup_tmp_returns_empty_for_missing_dir(self) -> None:
        nonexistent = self.tmp_path / "does_not_exist"
        deleted = atomic_checkpoint.cleanup_tmp_files(nonexistent)
        self.assertEqual(deleted, [])

    # --- Test 7 ---
    def test_extra_field_merge(self) -> None:
        target = atomic_checkpoint.write_checkpoint(
            self.tmp_path,
            phase_completed="RETRIEVE",
            next_phase="TRIANGULATE",
            extra={"sources_gathered": 24, "completed_subagents": ["academic"]},
        )
        data = json.loads(target.read_text())
        self.assertEqual(data["sources_gathered"], 24)
        self.assertEqual(data["completed_subagents"], ["academic"])
        self.assertEqual(data["phase_completed"], "RETRIEVE")

    # --- Test 8 ---
    def test_invalid_extra_json_exits_2(self) -> None:
        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPT_DIR / "atomic_checkpoint.py"),
                "--output-dir",
                str(self.tmp_path),
                "--phase-completed",
                "SCOPE",
                "--extra",
                "not valid json",
            ],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 2)
        self.assertIn("--extra is not valid JSON", result.stderr)

    # --- Test 8b ---
    def test_extra_json_array_rejected(self) -> None:
        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPT_DIR / "atomic_checkpoint.py"),
                "--output-dir",
                str(self.tmp_path),
                "--phase-completed",
                "SCOPE",
                "--extra",
                "[1, 2, 3]",
            ],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 2)
        self.assertIn("--extra must be a JSON object", result.stderr)

    # --- Test 8c ---
    def test_cli_default_writes_checkpoint(self) -> None:
        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPT_DIR / "atomic_checkpoint.py"),
                "--output-dir",
                str(self.tmp_path),
                "--phase-completed",
                "RETRIEVE",
                "--next-phase",
                "TRIANGULATE",
                "--extra",
                '{"sources_gathered": 24}',
            ],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0, msg=result.stderr)
        target = self.tmp_path / "_checkpoint.json"
        self.assertTrue(target.exists())
        data = json.loads(target.read_text())
        self.assertEqual(data["sources_gathered"], 24)


class TestSkillMdConsistency(unittest.TestCase):
    """Static checks on SKILL.md and methodology.md that prevent
    silent regression of bug fixes when those docs are edited.
    """

    @classmethod
    def setUpClass(cls) -> None:
        # Locate the deployed/dev skill files relative to this test file.
        # Tests live at skill/scripts/tests/, so skill root is two parents up.
        cls.skill_dir = Path(__file__).resolve().parent.parent.parent
        cls.skill_md = cls.skill_dir / "SKILL.md"
        cls.methodology = cls.skill_dir / "reference" / "methodology.md"

    # --- Test 9 ---
    def test_skill_md_has_worker_envvar(self) -> None:
        """Bug 1: env-var must appear BOTH in spawn template and role-check directive."""
        content = self.skill_md.read_text()
        # Spawn template (export or inline-prepend form) — accept either prefix
        spawn_pattern = re.compile(r"CLAUDE_CODE_DEEP_RESEARCH_WORKER\s*=\s*1")
        matches = spawn_pattern.findall(content)
        # Expect at least 2 occurrences: spawn template + role-check directive
        self.assertGreaterEqual(
            len(matches), 2,
            f"Expected ≥2 occurrences of CLAUDE_CODE_DEEP_RESEARCH_WORKER=1 in SKILL.md, found {len(matches)}",
        )

    # --- Test 10 ---
    def test_skill_md_has_stdin_redirect(self) -> None:
        """Bug 3: spawn template must redirect stdin from /dev/null."""
        content = self.skill_md.read_text()
        self.assertIn("< /dev/null", content,
                      "SKILL.md spawn template must include `< /dev/null`")

    # --- Test 11 ---
    def test_skill_md_writes_starting_before_claude(self) -> None:
        """Bug 4: spawn template must write _starting.txt BEFORE invoking
        the actual `claude -p` spawn.

        Earlier prose mentions of `claude -p` in role-check warnings, brief
        templates, and explanatory paragraphs are NOT spawn invocations.
        Anchor the check to the actual spawn block, marked by either
        `tmux new-session` (default) or `nohup bash -c` (fallback).
        """
        content = self.skill_md.read_text()
        starting_pos = content.find("_starting.txt")
        # Find the first ACTUAL spawn block (not a doc reference)
        tmux_pos = content.find("tmux new-session")
        nohup_pos = content.find("nohup bash -c")
        spawn_positions = [p for p in (tmux_pos, nohup_pos) if p != -1]
        self.assertNotEqual(starting_pos, -1, "SKILL.md must mention _starting.txt")
        self.assertTrue(
            spawn_positions,
            "SKILL.md must contain at least one spawn block (tmux new-session or nohup bash -c)",
        )
        first_spawn = min(spawn_positions)
        self.assertLess(
            starting_pos, first_spawn,
            "SKILL.md must write _starting.txt BEFORE the first actual spawn block",
        )

    # --- Test 12 ---
    def test_methodology_references_done_subcommand(self) -> None:
        """Bug 7 Layer 2: methodology.md Phase 8 must reference the `done` subcommand."""
        content = self.methodology.read_text()
        self.assertIn(
            "atomic_checkpoint.py done",
            content,
            "methodology.md Phase 8 must reference `atomic_checkpoint.py done`",
        )

    # --- Test 12b ---
    def test_methodology_has_phase_0_section(self) -> None:
        """Bug 2: methodology.md must have a Phase 0 RESUME DETECTION section."""
        content = self.methodology.read_text()
        self.assertRegex(
            content,
            r"##\s+Phase\s+0",
            "methodology.md must define a Phase 0 section (RESUME DETECTION)",
        )

    # --- Test 12c ---
    def test_skill_md_has_concurrency_section(self) -> None:
        """Bug 5: SKILL.md must have a Concurrency Guidelines section."""
        content = self.skill_md.read_text()
        self.assertRegex(
            content,
            r"##\s+Concurrency Guidelines",
            "SKILL.md must define a Concurrency Guidelines section",
        )

    # --- Test 12d ---
    def test_skill_md_has_resume_section(self) -> None:
        """Bug 2: SKILL.md must have a Resume After Interruption section."""
        content = self.skill_md.read_text()
        self.assertRegex(
            content,
            r"##\s+Resume",
            "SKILL.md must document the resume protocol",
        )

    # --- Test 12e ---
    def test_skill_md_has_pause_section(self) -> None:
        """Bug 6: SKILL.md must have a Graceful Pause section."""
        content = self.skill_md.read_text()
        self.assertRegex(
            content,
            r"##\s+Graceful Pause",
            "SKILL.md must document the graceful pause protocol",
        )

    # --- Test 12f ---
    def test_skill_md_has_completion_section(self) -> None:
        """Bug 7 Layer 1: SKILL.md must document how to detect completion."""
        content = self.skill_md.read_text()
        self.assertRegex(
            content,
            r"##\s+Detecting Completion",
            "SKILL.md must define a Detecting Completion section",
        )


if __name__ == "__main__":
    unittest.main()
