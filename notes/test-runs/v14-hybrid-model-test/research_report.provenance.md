# Provenance Sidecar — Agentic Coding Assistants in 2026

**Feynman-style verification record**

---

## Run Metadata

| Field | Value |
|---|---|
| Task UUID | A664CE38 |
| Date | 2026-04-07 |
| Mode | deep |
| Output dir | `/research/deep-research-skill/v14-hybrid-model-test/` |
| Lead model | Claude Opus 4.6 (TAINTED — see effort note below) |
| Sub-agent model | Claude Sonnet 4.6 |
| PACKAGE salvage agent | Claude Sonnet 4.6 (this agent) |

---

## Verification Status

**PASS WITH NOTES**

- 5 hard FAILs corrected (CORR-1 through CORR-5)
- 12 SOFT-PASS hedges applied
- 3 adversarial corrections applied (CORR-6, CORR-7, CORR-8)
- 0 corrections skipped or partially applied

---

## CRITICAL METADATA — TAINTED EFFORT BASELINE

This run was launched WITHOUT the `--effort max` flag and WITHOUT `CLAUDE_CODE_EFFORT_LEVEL=max` env var propagation. The lead Opus 4.6 agent therefore ran at **default effort (medium)**, not max. Sub-agents (Sonnet 4.6) ran at their default effort (high), which is the correct setting for sub-agents.

This run is therefore classified as a **tainted-effort baseline**:
- Useful as a comparison point against future runs with max effort
- NOT representative of the skill's intended quality ceiling
- The productivity paradox and benchmark correction findings appear structurally sound, but depth of synthesis and edge-case coverage may be lower than a properly configured max-effort run would produce
- Future v14+ runs should set `CLAUDE_CODE_EFFORT_LEVEL=max` before launch

**Additionally:** The PACKAGE phase was killed mid-run after the lead Opus 4.6 agent began writing but did not complete the final report. This report was salvaged and completed by a Sonnet 4.6 sub-agent dispatched by the orchestrating agent. The synthesis and all upstream phases (SCOPE through VERIFY) were produced by the normal pipeline; only PACKAGE was affected by the mid-run kill.

---

## Sources Consulted

From the synthesis bibliography (55 sources total):

**Accepted (used in final report):**
- [1] Anthropic SWE-Bench performance page
- [2] Aider Polyglot Leaderboard 2026
- [3] VentureBeat — Cursor Composer 2 launch
- [4] Local AI Master — SWE-Bench 2026 leaderboard
- [5] OpenAI — "Why we no longer evaluate SWE-bench Verified"
- [6] OpenAI — "Introducing SWE-bench Verified"
- [7] MorphLLM — SWE-Bench Pro Leaderboard
- [8] Anthropic — Introducing MCP
- [9] Anthropic — Donating MCP to Linux Foundation
- [10] METR — Developer productivity experiment update (Feb 2026)
- [11] GitClear — AI Copilot Code Quality 2025
- [12] NVD — CVE-2025-59536
- [13] Vantage — Cursor Composer 2 cost analysis
- [14] Built In — Claude Code tool overview
- [15] Cognition AI — Introducing Devin
- [16] OpenHands — One year of OpenHands
- [17] VentureBeat — Claude Code 2.1.0
- [18] Medium — Evolution of Claude Code 2025
- [19] Anthropic — Claude Code documentation
- [20] Visual Studio Magazine — Return of Codex as Agent
- [21] Aider HISTORY.md
- [22] Fortune — Cursor crossroads March 2026
- [23] Contrary Research — Cursor business breakdown
- [24] DEV Community — Cursor 3 Agents Window
- [25] GitHub Newsroom — Copilot Agent Mode
- [26] VS Marketplace — Cline extension
- [27] Codemotion — Is Devin Fake?
- [28] SitePoint — Devin in production
- [29] TechCrunch — Cognition $400M raise at $10.2B
- [30] arXiv 2407.16741 — OpenHands paper
- [31] arXiv 2210.03629 — ReAct paper
- [32] OpenAI — Codex CLI
- [33] swe-rebench.com leaderboard (CORRECTED from arXiv 2506.12286 per CORR-3)
- [34] Cognition AI — Introducing Devin (March 2024)
- [35] Answer.AI — Devin practitioner replication
- [36] arXiv 2506.12286 — SWE-Bench Illusion (CORRECTED per CORR-3)
- [37] Epoch AI — SWE-bench Verified leaderboard
- [38] Anthropic — Claude Code Sub-agents
- [39] MIT Technology Review — AI coding developers 2026
- [40] Stack Overflow Blog — Bugs and incidents with AI coding agents
- [41] Anthropic — 2026 Agentic Coding Trends Report (vendor; productivity multiplier number REMOVED per CORR-1)
- [42] Larridin — Developer Productivity Benchmarks 2026
- [43] Addy Osmani — The 80% Problem in Agentic Coding
- [44] research_agent_3.md — Claude Code terraform destroy incident (primary URL not located)
- [45] research_agent_3.md — Replit SaaStr database wipe incident (primary URL not located)
- [46] research_agent_3.md — 19-minute quota burn case study (primary URL not located)
- [47] NVD — CVE-2025-59536 (trust dialog bypass / premature code execution per CORR-3 analogous correction)
- [48] GitHub Security Advisories — Clinejection
- [49] GitHub Security Advisories — CamoLeak
- [50] CNBC — Cognition $10.2B valuation two months after Windsurf acquisition
- [51] Built In — Cognition $400M raise
- [52] Cognition AI — Funding, growth, next frontier
- [53] GitHub Next — Copilot Workspace
- [54] arXiv 2303.11366 — Reflexion paper
- [55] arXiv 2512.10218 — Does SWE-Bench-Verified Test Agent Ability or Model Memory? (ADDED per CORR-3)

**Partially accepted with caveats:**
- [41] Anthropic 2026 Trends Report — document fetched twice by V3; 1.6× specific figure NOT found in the report. All content from this source now carries explicit vendor caveat, specific multiplier figure removed.
- [44]–[46] — Internal evidence file references for incidents; primary URLs not located during verification but the underlying incidents are well-attested by multiple secondary sources in the critical-lens agent output.

**Rejected / corrected:**
- "arXiv 2506.12286 = SWE-rebench" — REJECTED per CORR-3; 2506.12286 is SWE-Bench Illusion, not SWE-rebench
- "August 2025" for Cognition/Windsurf acquisition — REJECTED per CORR-2; corrected to July 2025
- "1.6× Anthropic productivity multiplier" as a specific cited figure — REJECTED per CORR-1; not found in source document
- "GPT-5.4 leads Aider Polyglot" — REJECTED per CORR-4; correct model designation is "GPT-5 (high)"
- "Cursor leads no major public benchmark" — REJECTED per CORR-5; Cursor leads Terminal-Bench 2.0

---

## Acceptance Criteria Status

| Criterion | Status |
|---|---|
| AC1: 7+ tools covered with technical details | PASS — 9 tools |
| AC2: Benchmark table with vendor/independent flags | PASS |
| AC3: Architecture taxonomy per tool | PASS — Finding 1 table |
| AC4: Cost data per tool with citation and date | PASS — Finding 5 table |
| AC5: MCP support status per tool | PASS — Finding 1 table + Finding 7 |
| AC6: 3+ documented failure modes with sources | PASS — 5 failure modes in Finding 5 |
| AC7: 3+ gaps with 2+ sources each | PASS — 3 gaps in Finding 8 |

---

## Hard FAILs Corrected

| ID | Claim | Correction |
|---|---|---|
| CORR-1 | Anthropic "1.6× productivity multiplier" cited as fact | Removed specific figure; replaced with hedged framing: "acknowledges productivity gains are more modest than 10× claims without committing to a specific multiplier" |
| CORR-2 | Cognition/Windsurf acquisition "August 2025" | Changed to "July 2025" in all occurrences (Finding 1, Finding 7, bibliography [50]) |
| CORR-3 | arXiv IDs swapped; 65.3% attributed to wrong source | 65.3% now cited to swe-rebench.com leaderboard [33]; 2506.12286 correctly labeled as SWE-Bench Illusion [36]; 2512.10218 added as separate [55]; 47-point drop corrected to "out-of-distribution repo testing" |
| CORR-4 | "GPT-5.4 leads Aider Polyglot" (5 occurrences) | Changed to "GPT-5 (high)" throughout (Executive Summary, Finding 3 ×2, Tool Selection Cheat Sheet, Verification Appendix) |
| CORR-5 | "Cursor leads no major public benchmark" | Replaced with: "Cursor Composer 2 leads Claude on Terminal-Bench 2.0 (61.7 vs 58.0) but trails GPT-5 (75.1). Cursor does not lead on SWE-bench or Aider Polyglot." |

---

## Adversarial Corrections Applied

| ID | Correction |
|---|---|
| CORR-6 | Added sentence to Finding 2: SWE-bench Pro gap is not pure contamination; task difficulty (107.4 lines, 4.1 files, architecture-level) also accounts for part of the gap; Claude drops further from Pro public to private subset (22.7% → 17.8%) |
| CORR-7 | Added paragraph to Finding 4: METR self-acknowledged selection bias (30–50% of developers refused high-uplift tasks); DORA 2025 counter-evidence (80%+ productivity gains); GitClear founder caveat; reframed as "real but contested" |
| CORR-8 | Added sentence to Finding 3: GPT-5 is the closest multi-domain leader, leading SWE-bench Pro (~57.7%), Terminal-Bench 2.0 (75.1), and OSWorld (~75%); multi-leader structure is real but not symmetric |

---

## SOFT-PASS Hedges Applied

| Claim | Original | Applied wording |
|---|---|---|
| AC-1.4 Codex relaunch | "relaunched May 2025" | "relaunched in stages — CLI in April 2025, cloud agent in May 2025" |
| AC-1.8 Copilot launch | "launched June 29 2021" | "technical preview June 29 2021; GA June 2022" |
| AC-1.11 Cognition valuation | "$350M → $10.2B trajectory" | "$2B Series A valuation (early 2024) → $10.2B (Sep 2025)" |
| AC-1.13 OpenHands contributors | "2,100+ contributors" | "~500 contributors, 65,000+ stars" |
| AC-2.1 OpenAI retirement reason | "contamination" | "contamination and flawed test cases" |
| AC-2.6 Devin SWE-bench Lite | "13.86% on SWE-bench Lite" | "13.86% on a 570-issue random sample of SWE-bench (not the Lite subset)" |
| AC-2.7 Answer.AI replication | "replication study" | "practitioner replication (3/20 tasks, ~15%)" |
| AC-2.8 Claude Verified range | "77.2–80.9%" | "77.2% (Claude Sonnet 4.5) to 80.9% (Claude Opus 4.5)" |
| AC-4.1 METR perception | "devs felt 20% faster" | "devs predicted 20% faster in pre-study estimates; objective result was 19% slower" |
| AC-4.5 Stack Overflow framing | "framed bugs as inevitable" | "raised the question of whether bugs and incidents are inevitable" |
| AC-5.4 19-minute burn | "documented case" | "widely reported March 2026 Claude Code quota bug affecting many users" |
| AC-6.1 CVE mechanism | "arbitrary command injection" | "trust dialog bypass enabling premature code execution from project configuration files" |

---

## Corrections Not Applied

None. All 5 hard FAILs, 3 adversarial corrections, and 12 SOFT-PASS hedges were applied.

---

## Pipeline Phase Completion Record

| Phase | Status | Notes |
|---|---|---|
| SCOPE | Complete | scope.md |
| PLAN | Complete | plan.md |
| RETRIEVE | Complete | research_agent_1–4.md |
| TRIANGULATE | Complete | triangulation.md |
| OUTLINE_REFINEMENT | Complete | refined_outline.md |
| SYNTHESIZE | Complete | synthesis.md |
| CRITIQUE | Complete | critique.md |
| REFINE | Complete | synthesis.md (updated) |
| VERIFY | Complete | verification_log.md, verify_citation_1–3.md, verify_adversarial.md |
| PACKAGE | Complete (salvaged) | research_report.md + this sidecar; completed by Sonnet 4.6 after Opus 4.6 killed mid-run |
