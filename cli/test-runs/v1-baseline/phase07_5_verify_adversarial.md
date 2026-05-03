I now have all the primary sources needed. Let me deliver the adversarial verdict.

---

## Adversarial Verification Report

I searched directly against the five primary sources the report relies on: `notes/adr/001-task-tool-vs-claude-p-subagents.md`, `notes/test-run-log.md`, `skill/scripts/atomic_checkpoint.py`, `skill/scripts/validate_report.py`, and `skill/SKILL.md`. Here are the five most consequential claims, each stress-tested against those sources.

---

### Claim 1 — "Sample size, observation window, and counting methodology are not stated" for the ~20% hang rate

**Report says (Executive Summary §2 and Section 1):** The "~20% rate-of-occurrence estimate" is "from the project's own CLAUDE.md … sample size, observation window, and counting methodology are not stated."

**Counter-evidence found in ADR-001 (lines 18–24):**

> v10, v11, v12, v13: successful (4/5)
> v14: killed for effort config issue (different root cause, not a hang)
> v15: killed for sub-agent hang (1/5)
> **Estimated hang rate: ~20% per deep mode run**

All three things the report claims are "not stated" are explicitly stated:
- **Sample size:** 5 deep-mode runs (v10–v13 + v15)
- **Window:** v10 (2026-04-01) through v15 (2026-04-07)
- **Counting methodology:** exclude different-root-cause kills (v14 excluded)

**But the actual flaw is worse than the report acknowledges.** The test-run log reveals that v10–v13 (the four "successes" in the denominator) ran at **medium effort** (env-var not propagated), while v15 — the hang — was the **first true max-effort run** (SKILL.md labels it: "FIRST TRUE MAX-EFFORT RUN"). The 4 successful denominator runs and the 1 hung run were in materially different configurations. A like-for-like max-effort hang rate would be **1/1 = 100%**, not 1/5 = 20%.

**VERDICT: REFUTED.** The methodology IS stated in ADR-001; the report's hedge is factually incorrect. Additionally, the report understates the severity — by conflating effort-mismatched runs into a single denominator, the 20% figure actually *softens* a worse signal.

---

### Claim 2 — "`atomic_checkpoint.py`: this synthesis cannot independently verify its existence or correct implementation"

**Report says (Section 2):** "This synthesis cannot independently verify that claim … Before the effort estimate ('1–2 weeks') is treated as confident scoping, the maintainer should: Verify `skill/scripts/atomic_checkpoint.py` (or equivalent) exists; verify the implementation matches the description; verify it is actually used by the pipeline."

**Counter-evidence:**

- **File exists:** `Glob("**/atomic_checkpoint.py")` returns `skill/scripts/atomic_checkpoint.py`. ✓
- **Implementation matches the description exactly** (lines 50–67):
  - `.with_suffix(target.suffix + ".tmp")` — same-directory temp file ✓
  - `f.flush()` + `os.fsync(f.fileno())` before `os.replace(tmp, target)` ✓
  - Code comments even explain *why* same-dir is required: "cross-filesystem rename via /tmp/ would defeat atomicity on Linux" ✓
- **SKILL.md mandates its use** (cross-cutting requirement, line 54): *"Save `_checkpoint.json` at the end of each phase via the atomic helper at `~/.claude/skills/deep-research/scripts/atomic_checkpoint.py`"* ✓

The original synthesis's claim that the primitive is "already correctly implemented" was correct. The refined report's gap item G3 was redundant scaffolding around a verifiable fact.

**VERDICT: REFUTED.** The file exists, matches the description precisely, and is not a dead utility — it is explicitly mandated by the pipeline's cross-cutting requirements.

---

### Claim 3 — "`validate_report.py`: cannot verify either the count (9) or the syntactic-vs-semantic classification"

**Report says (Section 5):** "The original synthesis claimed all 9 checks in `validate_report.py` [13] are syntactic, not semantic. **This synthesis has not read `validate_report.py` and cannot verify either the count or the classification.**"

**Counter-evidence** (lines 38–48 of `validate_report.py`):

```python
checks = [
    ("Executive Summary",   self._check_executive_summary),     # 1
    ("Required Sections",   self._check_required_sections),     # 2
    ("Citations",           self._check_citations),             # 3
    ("Bibliography",        self._check_bibliography),          # 4
    ("Placeholder Text",    self._check_placeholders),          # 5
    ("Content Truncation",  self._check_content_truncation),    # 6
    ("Word Count",          self._check_word_count),            # 7
    ("Source Count",        self._check_source_count),          # 8
    ("Broken Links",        self._check_broken_references),     # 9
]
```

Count: **exactly 9**. Classification: every check operates on regex pattern matching, structural markers (`## Section Name`), or file-path existence. None retrieves a cited URL, none cross-checks a claim against its source, none performs factual accuracy assessment. The original synthesis's description of all 9 as syntactic/structural is **accurate**.

The report's hedge — "cannot verify" — was a false statement of epistemic inability. The file is a 355-line Python script with no obfuscation.

**VERDICT: REFUTED.** Both the count (9) and the syntactic-only classification are confirmed by direct inspection. The original synthesis's evaluation-gap argument — that the gate provides only a "narrow" signal — is valid, but the report's meta-claim that this was unverifiable is not.

---

### Claim 4 — "Reactive-accumulation requires git archaeology to demonstrate"

**Report says (Section 7):** "Demonstrating it would require git archaeology: for each of the five fixes, find the introducing commit, the failure mode it addressed, and whether it was added reactively … the hypothesis is plausible but not evidenced in this synthesis."

**Counter-evidence in `skill/SKILL.md` lines 254–260** — the spawn template's own inline comments label each component as a named bug-fix:

```
- **Bug 1 fix** — `CLAUDE_CODE_DEEP_RESEARCH_WORKER=1` env-var guard against recursion
- **Bug 1 + I4 fix** — wrapper-side `[ROLE-CHECK-WRAPPER]` echo
- **Cross-cutting A** — `CLAUDE_CODE_DEEP_RESEARCH_UUID8` for `ps eww` visibility
- **Bug 3 fix** — mandatory `< /dev/null` redirect on its own line
- **Bug 4 fix** — `_starting.txt` written BEFORE the `claude -p` invocation
- **Bug 7 Layer 4** — `tmux new-session -d` for live monitoring
```

The source document does not call these "proactive design decisions." It uses the word "Bug" seven times in the template's annotation block, with explicit bug numbers (1, 3, 4, 7) indicating they were logged and then fixed reactively. Git archaeology would confirm the *commit order*, but the reactive naming convention is already in plain text in the live skill.

Additionally: the SKILL.md's warning box (lines 248–252) for `< /dev/null` states explicitly: *"Without it, the worker process hangs at startup with no clear error, despite a misleading 'proceeding without it' warning in stderr. **This has wasted hours of debugging in past sessions.**"* That is reactive accumulation documented in prose.

**VERDICT: WEAKENED.** The evidence for reactive accumulation is in-file and does not require git archaeology; the report overstates the difficulty of demonstrating this. However, git archaeology would establish the *sequence* and *bug-count continuity* (Bug 1, 3, 4, 7 — what are Bugs 2, 5, 6?), so the hedge is not entirely wrong.

---

### Claim 5 — "The subprocess switch is documented in ADR-001 but not yet implemented or validated"

**Report says (Executive Summary §2, Section 1):** "ADR-001 [1] documents the decision; the synthesis is unaware of any branch in which the post-fix rate has been measured … documented is not the same as validated."

**Counter-evidence:**

- **CLAUDE.md confirms:** *"the switch is planned but not yet implemented"* — exact match to the report's claim.
- **SKILL.md confirms:** Task-tool fan-out is still the current architecture. The cross-cutting requirements still read *"During Phase 3/6/7.5 fan-outs, write `_subagent_progress.json` after each Task batch."* The spawn template launches `claude -p` for the *lead* agent, not for sub-agents — sub-agents remain Task-tool.
- **No CI YAML** exists in the project (Glob of `**/*.yml` returns only `node_modules/` dependencies) — confirming the validation infrastructure to measure a post-fix hang rate does not yet exist.

**VERDICT: WITHSTANDS.** Both prongs are confirmed: the switch exists in ADR-001 as a documented decision, and SKILL.md shows it has not been implemented. The absence of CI infrastructure further corroborates the report's concern that post-fix hang rates cannot currently be measured.

---

## Summary Table

| Claim | Verdict | Dominant source |
|---|---|---|
| "Sample size / methodology not stated" for ~20% hang rate | **REFUTED** — both ARE stated in ADR-001; and the true max-effort rate is 1/1 = 100%, not 1/5 = 20% | ADR-001 lines 18–24; test-run-log v14/v15 config notes |
| "Cannot verify `atomic_checkpoint.py` existence / correctness" | **REFUTED** — file exists, implementation exact, pipeline mandates it | `atomic_checkpoint.py` lines 50–67; `SKILL.md` line 54 |
| "Cannot verify 9-check count or syntactic classification in `validate_report.py`" | **REFUTED** — exactly 9 checks enumerated, all structural-only | `validate_report.py` lines 38–48 |
| "Reactive-accumulation hypothesis requires git archaeology" | **WEAKENED** — SKILL.md inline comments name each component "Bug N fix"; hypothesis is in-file-evidenced, not merely plausible | `SKILL.md` lines 254–260; warning block for `< /dev/null` |
| Subprocess switch "documented but not yet implemented or validated" | **WITHSTANDS** — confirmed by CLAUDE.md, SKILL.md, and absence of CI infrastructure | `CLAUDE.md` §Known gotchas; `SKILL.md` Task-tool cross-cutting requirements; Glob CI scan |

**The sharpest finding the report missed entirely:** the 20% denominator is invalid as a max-effort baseline. The four "successful" runs that make up 4/5 of the denominator ran at *medium effort* — a configuration the project itself labels "tainted." The first and only max-effort deep run hung. The report treats this as a ~20% problem that warrants engineering attention; the corrected read is a 100%-observed failure rate on the configuration that actually matters, backed by n=1. That is a more urgent, not a more hedged, conclusion.