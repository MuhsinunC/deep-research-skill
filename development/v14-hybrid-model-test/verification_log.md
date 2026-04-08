# Phase 7.5: Consolidated Verification Log

**Date:** 2026-04-07
**Inputs:** verify_citation_1.md, verify_citation_2.md, verify_citation_3.md, verify_adversarial.md
**Summary:** 4 sonnet sub-agents (3 verifiers + 1 adversarial) ran against the atomic_claims.md decomposition.

---

## Top-Line Tally

| Batch | PASS | SOFT-PASS | FAIL | UNVERIFIABLE | Total |
|---|---|---|---|---|---|
| V1 (benchmarks) | 2 | 5 | 3 | 0 | 10 |
| V2 (vendor/historical) | 8 | 5 | 1 | 0 | 14 |
| V3 (productivity/cost/security) | 4 | 7 | 1 | 0 | 12 |
| **Total** | **14** | **17** | **5** | **0** | **36** |
| V4 (adversarial) | — | — | — | — | Claim 1: SURVIVED, Claim 2: **WEAKENED**, Claim 3: SURVIVED w/ correction |

Overall PASS or SOFT-PASS rate: 86% (31/36). Five hard FAILs must be corrected before PACKAGE.

---

## Critical Corrections Required (Hard FAILs)

### CORR-1: FABRICATED — Anthropic "1.6× productivity multiplier"
**Claim:** AC-4.4 (Finding 4, Finding 4 sub-paragraph, Recommendations)
**Verdict:** **FAIL — Anthropic 2026 Trends Report does not contain this figure.** V3 fetched the PDF twice and searched; no "1.6×" appears. No secondary coverage cites it either.
**Action:** **REMOVE** the specific 1.6× number from synthesis. Replace with a hedged framing: "Anthropic's own Trends Report acknowledges productivity gains are more modest than the 10× marketing claims suggest, without committing to a specific multiplier."

### CORR-2: WRONG DATE — Cognition/Windsurf acquisition was July 2025
**Claim:** AC-7.1 (Finding 1, Finding 7)
**Verdict:** **FAIL — Definitive agreement was signed July 14, 2025, not August 2025.** The CNBC article dated September 8 explicitly says "two months" prior.
**Action:** Change all references from "August 2025" to "July 2025."

### CORR-3: arXiv IDs Swapped — SWE-rebench / SWE-Bench Illusion
**Claim:** AC-2.4, AC-2.5 (Finding 2)
**Verdict:** **FAIL — citations are cross-wired.**
- arXiv 2506.12286 is actually the "SWE-Bench Illusion" paper (not a SWE-rebench reproduction)
- arXiv 2512.10218 is "Does SWE-Bench-Verified Test Agent Ability or Model Memory?"
- The 65.3% Claude score comes from the **live swe-rebench.com leaderboard**, not from arXiv 2506.12286
- The 47-point drop from SWE-Bench Illusion is for **out-of-distribution repository testing (language mismatch)**, not "problem statement rephrasing"
**Action:**
- Cite swe-rebench.com leaderboard (not arXiv) for the 65.3% number
- Correct the arXiv ID mapping: SWE-Bench Illusion → 2506.12286
- Correct the description of the 47-point drop to "out-of-distribution repo testing"
- Cite arXiv 2512.10218 as a separate "benchmark memory" paper if used at all

### CORR-4: WRONG MODEL NAME — Aider Polyglot leader
**Claim:** AC-3.1 (Finding 3, Tool Selection Cheat Sheet)
**Verdict:** **FAIL — The Aider Polyglot leader is "GPT-5 (high)" at 88%, not "GPT-5.4".**
**Action:** Replace all "GPT-5.4 leads Aider Polyglot" with "GPT-5 (high) leads Aider Polyglot" throughout the report. Check all five occurrences.

### CORR-5: FACTUAL ERROR — Cursor leads Terminal-Bench 2.0
**Claim:** Finding 3 prose: "Cursor leads no major public benchmark"
**Verdict:** **REFUTED by adversarial V4.** Cursor Composer 2 scores 61.7 vs Claude Opus 4.6's 58.0 on **Terminal-Bench 2.0** (independently run by the Laude Institute). GPT-5.4 leads Terminal-Bench at 75.1.
**Action:** Remove the "Cursor leads no public benchmark" claim. Replace with: "Cursor Composer 2 leads Claude on Terminal-Bench 2.0 (61.7 vs 58.0) but trails GPT-5.4 (75.1). Cursor does not lead on SWE-bench or Aider Polyglot."

---

## Significant Corrections (Adversarial + SOFT-PASS hedging)

### CORR-6: SWE-bench Pro is also legitimately harder
**Source:** Adversarial V4
**Correction:** The current report frames the full ~35pt Verified→Pro gap as contamination. The adversarial agent found that SWE-bench Pro's tasks are genuinely harder (107.4 lines avg, 4.1 files, architecture-level reasoning). Evidence: Claude drops further from Pro public (22.7%) to Pro private (17.8%), suggesting task difficulty alone, not contamination, accounts for part of the gap.
**Action:** In Finding 2, add a sentence: "The ~35-point gap is not pure contamination — SWE-bench Pro tasks are also genuinely harder (average 107.4 lines across 4.1 files, architecture-level codebase reasoning), and Claude's further drop from Pro's public to private subset (22.7% → 17.8%) suggests task difficulty accounts for a meaningful fraction of the gap alongside contamination."

### CORR-7: METR study has self-acknowledged selection bias
**Source:** Adversarial V4, V3 verification
**Correction:** METR's February 24 2026 update acknowledged selection bias so severe they suspended the study design: 30–50% of developers refused to submit tasks they wanted to do WITH AI, systematically excluding high-uplift tasks. METR also noted the study used early-2025 tools. 2025 DORA report (90% AI adoption) found >80% reported productivity gains.
**Action:** In Finding 4, add an explicit paragraph noting:
- METR's own methodological acknowledgement of selection bias
- The DORA 2025 counter-evidence (80%+ productivity gains)
- GitClear's founder acknowledging that churn-in-isolation is "inherently flawed"
- Frame the productivity paradox as "a real but contested finding" rather than settled truth.

### CORR-8: GPT-5.4 is closer to a multi-domain leader than the report implies
**Source:** Adversarial V4
**Correction:** GPT-5.4 leads SWE-bench Pro (57.7%), Terminal-Bench 2.0 (75.1), and OSWorld (75%). The report's "no single leader" framing under-acknowledges this.
**Action:** In Finding 3, add a sentence: "GPT-5.4 is the closest approximation to a multi-domain leader in Q1 2026, leading SWE-bench Pro (~57.7%), Terminal-Bench 2.0 (75.1), and OSWorld (~75%); Claude leads the contamination-heavy Verified and retains the strongest scaffolding story; Aider Polyglot goes to GPT-5 (high) at ~88%. The multi-leader structure is real but not symmetric."

---

## SOFT-PASS Hedging (applied in PACKAGE phase wording)

| Claim | Original | Hedged wording to use |
|---|---|---|
| AC-1.4 (Codex relaunch) | "relaunched May 2025" | "relaunched in stages — CLI in April 2025, cloud agent in May 2025" |
| AC-1.8 (Copilot launch) | "launched June 29 2021" | "technical preview June 29 2021; GA June 2022" |
| AC-1.11 (Cognition valuation) | "$350M → $10.2B trajectory" | "$2B Series A valuation (early 2024) → $10.2B (Sep 2025)" — drop the misleading $350M starting point |
| AC-1.13 (OpenHands contributors) | "2,100+ contributors" | "~500 contributors, 65,000+ stars" — correct number |
| AC-2.1 (OpenAI retirement) | "contamination" | "contamination and flawed test cases" |
| AC-2.6 (Devin SWE-bench Lite) | "13.86% on SWE-bench Lite" | "13.86% on a 570-issue random sample of SWE-bench (not the Lite subset)" |
| AC-2.7 (Answer.AI replication) | "replication study" | "practitioner replication (3/20 tasks, ~15%)" |
| AC-2.8 (Claude 77.2% lower bound) | "77.2–80.9%" | "77.2% (Claude Sonnet 4.5) to 80.9% (Claude Opus 4.5)" — differentiate by model |
| AC-4.1 (METR perception) | "devs felt 20% faster" | "devs predicted 20% faster in pre-study estimates; objective result was 19% slower" |
| AC-4.5 (Stack Overflow framing) | "framed bugs as inevitable" | "raised the question of whether bugs and incidents are inevitable in current deployments" |
| AC-5.4 (19-minute burn) | "documented case" | "widely reported March 2026 Claude Code quota bug affecting many users" |
| AC-6.1 (CVE mechanism) | "arbitrary command injection" | "trust dialog bypass enabling premature code execution from project configuration files" |

---

## Claims That Survived Adversarial Challenge

- **Central Claim 1 (Contamination):** SURVIVED. No 2026 source defends Verified as uncontaminated. OpenAI's Feb 23 2026 retirement notice confirmed it.
- **Central Claim 3 (Multi-leader market):** SURVIVED with one factual correction (Cursor does lead Terminal-Bench 2.0). The broader framing holds.

## Claims That Were Weakened

- **Central Claim 2 (Productivity paradox):** WEAKENED. The directional story (agentic coding has a productivity gap) holds, but the specific METR 19% number is fragile due to self-acknowledged selection bias. Must be presented as contested, not settled.

---

## Net Verdict

The report's core argument survives verification with three structural corrections:
1. Remove the fabricated Anthropic 1.6× number.
2. Reframe the productivity paradox as "contested, real at the pessimistic end of a distribution" rather than "proven."
3. Correct the Cursor/benchmark-leadership claim (it does lead Terminal-Bench 2.0).

Five hard FAILs (CORR-1 through CORR-5) must be fixed. Eight SOFT-PASS hedges must be applied. Once these are applied in the PACKAGE phase, the report will be publication-ready.

Phase 7.5 VERIFY complete. Proceeding to Phase 8 PACKAGE.
