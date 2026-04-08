# Phase 4.5: Refined Outline

**Date:** 2026-04-07
**Inputs:** scope.md (acceptance criteria), plan.md (5 sub-questions), 4 lens files, triangulation.md
**Goal:** Adapt the original outline to the *evidence actually gathered*. The original plan assumed 5 vendor-comparison questions; the evidence demands extra weight on benchmark contamination, productivity-paradox findings, and the security/failure mode story.

---

## Outline Adjustments vs Original Plan

| Original Plan Section | Adjustment | Reason |
|---|---|---|
| Q2 Benchmarks | **Promote to its own major finding** with two sub-sections (Verified vs Pro) | C2 contamination is the single biggest finding |
| Q4 Cost / Failure Modes | **Split into two findings:** one for cost economics, one for security/failures | A3 produced enough material that they need separate treatment |
| (No section) | **Add a new finding on the Productivity Paradox** | METR + GitClear evidence is too important to bury in caveats |
| Q3 Multi-file/agency | Keep but compress | Practitioner agent A2 covered this well in tabular form |
| Q5 Gaps | Keep, expand with 3 specific gaps each backed by 2+ sources (matches AC7) | Acceptance criterion |

---

## Final Report Outline (8 Findings)

### Executive Summary (200–400 words)
Three-paragraph framing:
1. Landscape snapshot (9+ tools across 4 form factors)
2. The benchmark contamination story + multi-leader market
3. The productivity paradox + recommendations preview

### Introduction (scope, methodology, assumptions)
- Topic, time anchor (Apr 7 2026), 5 sub-questions
- Methodology: deep-research pipeline, 4 lens sub-agents, triangulated against independent and adversarial sources
- Explicit assumption list (e.g., excluding general LLMs, focusing on tools with public docs)

### Finding 1: Tool Landscape & Architecture Taxonomy *(addresses Q1, AC1, AC3)*
- 9 named tools surveyed: Claude Code, Cursor, OpenAI Codex CLI, GitHub Copilot, Aider, Cline, Continue, Devin, OpenHands
- Form-factor taxonomy: CLI agents (Claude Code, Codex CLI, Aider) / IDE-native (Cursor, Cline, Copilot, Continue) / Cloud platform agents (Devin, OpenHands)
- Agent loop type: ReAct-style (most), Plan-execute-verify (Devin), Multi-agent orchestration (Cursor 3 Agents Window, Claude Code sub-agents)
- Architecture summary table: Tool | Form Factor | Default Model | Loop Type | MCP Support
- *Source weight:* A2 (vendor docs), A4 (history), A1 (academic loop characterization)

### Finding 2: The SWE-bench Verified Contamination Story *(addresses Q2, AC2)*
**This is the single most important finding in the report.**
- Background: SWE-bench Verified launched Aug 2024 by OpenAI as the trusted 500-issue subset
- 2026 reality: OpenAI itself stopped reporting Verified scores; their audit found every frontier model could reproduce verbatim gold patches for some Verified tasks
- The 35-point gap: Same Claude Opus 4.5 model scores 80.9% on Verified vs 45.9% on SWE-Bench Pro
- SWE-Bench Pro now the contamination-corrected gold standard
- Comparison table — *all scores must be flagged Vendor or Independent*:

| Tool | Best Verified score | Pro score (where available) | Aider Polyglot | Source flag |
| --- | --- | --- | --- | --- |
| Claude Opus 4.5/4.6 | 77.2–80.9% | 45.9% | (lower) | Vendor + Local AI Master |
| GPT-5.4 | ~72.1% (last reported) | n/a | ~88% (leader) | Vendor (no longer reported by OpenAI) |
| Cursor Composer 2 | "beats Opus, trails GPT-5.4" | ~58% (claim) / 46% (Scale) | n/a | Vendor only — no independent reproduction yet |
| Devin | 13.86% (Lite, 2024 launch) | n/a | n/a | Vendor + independent ~15% |
| Aider | (model-dependent) | n/a | (depends on model) | n/a — Aider is tool, not model |

- *Source weight:* A1, A3, DA1, lead searches

### Finding 3: Multi-Leader Market — Different Leaders for Different Benchmarks *(addresses Q2, Q3)*
- No single leader: Claude leads SWE-bench Verified, GPT-5.4 leads Aider Polyglot, Cursor Composer 2 sits between, all collapse on SWE-Bench Pro
- Implication: **the question "which is best?" depends entirely on what task you care about**
- Multi-file editing capability is now table-stakes; the differentiator is *long-horizon agentic coherence* (where Claude Code's sub-agent architecture and Cursor 3's Agents Window are the two leading bets)
- *Source weight:* A2, A4, lead searches

### Finding 4: The Productivity Paradox *(addresses Q3, Q5)*
- METR study: experienced devs *believed* they were 20% faster with AI; objective tests showed they were 19% *slower* on familiar real codebases
- GitClear: AI-generated code has 1.7× more bugs, 75% more logic errors; code churn rose from 3.3% (2021) to 5.7–7.1% (2024–25)
- Why both can be true: Vendor multipliers measure typing/short-task velocity; METR/GitClear measure end-to-end production code quality
- Anthropic's own 2026 Trends Report acknowledges 1.6× as a more honest median (vs the marketed 10×)
- *Source weight:* A3, DA3, lead searches

### Finding 5: Cost Economics & Production Failure Modes *(addresses Q4, AC4, AC6)*
- Pricing matrix (per-tool: free tier / pro / enterprise / per-token if applicable)
- Token economics: $200–$2,000+/engineer/month is the typical real-world cost on top of seat licenses
- Documented production failures (need ≥3 per AC6):
  - Claude Code "terraform destroy" incident (Mar 2026)
  - Replit SaaStr database wipe (Jul 2025)
  - Runaway agent quota exhaustion in 19 minutes
  - Devin demo replication failures (the original 2024 controversy)
- Failure-mode taxonomy: tool-misuse / context-window collapse / runaway loops / unverified destructive ops
- *Source weight:* A2 (pricing), A3 (incidents)

### Finding 6: Security Vulnerabilities *(addresses Q4, AC6)*
- CVE-2025-59536 (CVSS 8.7) — Claude Code arbitrary command injection
- Clinejection (Cline) — affected ~4,000 dev machines via prompt injection
- CamoLeak (CVSS 9.6) — image-rendering SSRF in Copilot Chat
- Pattern: prompt injection is the dominant attack surface; MCP servers introduce fresh CVE classes by exposing tools the agent didn't anticipate
- Defense posture: most vendors offer permission gating, but few enforce by default
- *Source weight:* A3, NVD, GitHub Security Advisories

### Finding 7: Platform Consolidation & Protocol Standardization *(addresses Q1, Q5)*
- MCP timeline: Nov 25 2024 (Anthropic release) → 2025 (universal adoption) → Dec 2025 (Linux Foundation donation)
- Cognition + Windsurf merger (Aug 2025) — first major platform consolidation
- Cursor 2.0 → 3.0: from VS Code fork to "agent orchestration IDE"
- The "agentic coding = new IDE" thesis: traced from Devin (Mar 2024) → Copilot Workspace (Apr 2024) → mainstream consensus 2025–26
- *Source weight:* A2, A4

### Finding 8: Gaps in the Landscape *(addresses Q5, AC7)*
At least 3 gaps, each with 2+ sources:
- **Gap 1: Long-horizon coherence** — agents still degrade beyond ~10 sequential tool calls (multiple sources from A1, A3)
- **Gap 2: Verifiable reasoning over benchmarks** — SWE-bench Pro is a band-aid; the field needs tasks that *cannot* be memorized (A1, DA1, OpenAI's own retirement post)
- **Gap 3: Cost predictability** — token-based pricing makes budget forecasting impossible for enterprise teams (A2, A3, DA3)
- *Source weight:* A1, A3, lead + DA searches

### Synthesis & Insights
- The category has matured into a contested multi-leader market
- The most important shifts of the last 12 months are *not* model improvements — they're (a) the contamination story, (b) MCP standardization, and (c) the platform consolidation around Cursor and Cognition
- Strategic implication: tool choice now matters less than workflow design and verification discipline

### Limitations & Caveats
- Vendor benchmark inflation acknowledged in every metric
- METR/GitClear are well-cited but represent a small evidence base relative to the size of the deployment universe
- This snapshot is dated April 2026; the field moves on a ~3-month half-life

### Recommendations
- For individual developers: pick by workflow fit (CLI vs IDE), not by benchmark
- For teams: invest in verification discipline; the productivity gain comes from how you *use* the tool, not which tool you pick
- For enterprises: price-anchor on token costs ($200–$2,000+/eng/mo) and demand SWE-Bench Pro numbers from vendors

### Bibliography
Complete list, every citation [N], no placeholders. Tier-1/2 anchors prioritized.

### Methodology Appendix
- Pipeline phases used (10-phase deep mode)
- Sub-agent lens allocations (4 sonnet sub-agents)
- Devil's advocate search log
- Verification log

---

## Outline Coverage Check (Acceptance Criteria)

| AC | Where covered |
|---|---|
| AC1: 7+ tools w/ technical details | Finding 1 |
| AC2: SWE-bench Verified table w/ vendor vs independent flags | Finding 2 |
| AC3: Architecture taxonomy | Finding 1 |
| AC4: Cost data per tool with citations + dates | Finding 5 |
| AC5: MCP support status per tool | Finding 1 (table) + Finding 7 (timeline) |
| AC6: 3+ documented failure modes | Findings 5 + 6 |
| AC7: 3+ gaps with 2+ sources each | Finding 8 |

All 7 acceptance criteria mapped. Ready for SYNTHESIZE.
