# Phase 7.5: Atomic Claim Decomposition

**Date:** 2026-04-07
**Source draft:** synthesis.md (post-REFINE)
**Goal:** Decompose load-bearing claims into atomic, individually verifiable propositions, then assign them to verifier batches.

---

## Decomposition Method

For each finding, list claims that:
1. Cite a specific number, date, or vendor identity
2. Would change the report's argument if shown to be false
3. Have at least one citation in the bibliography

Trivial restatements and high-level interpretations are not decomposed — only the verifiable factual atoms.

---

## Atomic Claims Inventory

### Finding 1 (Tool Landscape)
- AC-1.1: Claude Code launched as research preview Feb 24 2025; GA May 2025. [14] [17]
- AC-1.2: Claude Code spans CLI, VS Code extension, JetBrains extension, web app, iOS. [19]
- AC-1.3: Claude Code pricing tiers are $20/$100/$200 per month with five-hour rolling window. [19]
- AC-1.4: OpenAI Codex CLI relaunched May 2025; moved to token-based pricing April 2 2026. [20]
- AC-1.5: Cursor founded early 2022 by four MIT graduates; reached fastest-ever $100M ARR. [22] [23]
- AC-1.6: Cursor 2.0 (Oct 2025) launched proprietary "Composer" model; Cursor 3.0 (April 2 2026) launched "Agents Window." [22] [24]
- AC-1.7: Cursor reported $2B ARR and $29–30B valuation early 2026. [22] [23] (treat as approximate)
- AC-1.8: GitHub Copilot launched June 29 2021; agent mode announced Feb 6 2025; Coding Agent GA September 2025. [25]
- AC-1.9: GitHub Copilot added multi-model support (Claude/Gemini/GPT) October 2024. [25]
- AC-1.10: Devin launched March 2024; "world's first AI software engineer" framing. [15] [27]
- AC-1.11: Cognition ARR $1M Sep 2024 → $73M Jun 2025; valuation $350M → $10.2B trajectory. [29] [50] [51]
- AC-1.12: Aider created by Paul Gauthier in 2023; open-source CLI. [21]
- AC-1.13: OpenHands launched March 12 2024 as OpenDevin response to Devin. [16] [30]
- AC-1.14: OpenHands has 65,000+ GitHub stars and 2,100+ contributors as of early 2026. [16] [30]

### Finding 2 (SWE-bench Verified Contamination) — HIGHEST PRIORITY
- **AC-2.1: OpenAI publicly stopped reporting on SWE-bench Verified after internal audit found contamination. [5]** [F1, R1]
- **AC-2.2: Same Claude Opus 4.5 model scores 80.9% on Verified vs 45.9% on SWE-Bench Pro. [7]**
- AC-2.3: SWE-bench Verified is a 500-issue subset created by OpenAI in August 2024. [6]
- AC-2.4: SWE-rebench independent reproduction scored Claude at ~65.3% (vs Anthropic's reported 80.8%). [33] [F3]
- AC-2.5: SWE-Bench Illusion paper found 47-point drop when problem statements were rephrased. [36] [F4]
- AC-2.6: Devin's original launch claim was 13.86% on SWE-bench Lite (March 2024). [27]
- AC-2.7: Answer.AI replication of Devin scored ~15% real-world. [35]
- AC-2.8: Anthropic Claude Opus 4.5/4.6 scores 77.2–80.9% on SWE-bench Verified. [1] [4]

### Finding 3 (Multi-Leader Market)
- AC-3.1: GPT-5.4 leads Aider Polyglot at ~88%. [2] [F6]
- AC-3.2: Cursor Composer 2 "beats Claude Opus 4.6 but trails GPT-5.4" per VentureBeat. [3]
- AC-3.3: Cursor Composer 2 numbers are reported on proprietary CursorBench, no independent reproduction yet (as of late March 2026). [DA2]

### Finding 4 (Productivity Paradox)
- **AC-4.1: METR study showed experienced devs felt 20% faster with AI but were objectively 19% slower. [10] [39]**
- AC-4.2: GitClear reports AI-generated code carries 1.7× more bugs and 75% more logic errors. [11]
- AC-4.3: Code churn rose from 3.3% (2021) baseline to 5.7–7.1% (2024–25). [11]
- AC-4.4: Anthropic 2026 Trends Report cites 1.6× as median productivity multiplier. [41] [F7]
- AC-4.5: Stack Overflow blog January 2026 framed bugs/incidents as inevitable in current agentic deployments. [40]

### Finding 5 (Cost & Failures)
- AC-5.1: Token costs $200–$2,000+ per engineer per month on top of seat licenses. [13] [42]
- AC-5.2: Claude Code terraform destroy incident occurred March 2026. [44]
- AC-5.3: Replit SaaStr customer database wipe occurred July 2025. [45]
- AC-5.4: Documented case of agent burning full token quota in 19 minutes. [46]
- AC-5.5: $15K/week typical "bad week" cost reported in 2026 incident logs. [13]

### Finding 6 (Security)
- **AC-6.1: CVE-2025-59536 (CVSS 8.7) — Claude Code arbitrary command injection via file context. [12] [47]**
- AC-6.2: Clinejection prompt injection affected ~4,000 dev machines. [48] [F5]
- AC-6.3: CamoLeak (CVSS 9.6) — image rendering exfiltration in Copilot Chat. [49] [F5]

### Finding 7 (Consolidation & MCP)
- AC-7.1: Cognition acquired Windsurf (formerly Codeium) August 2025. [29] [50]
- AC-7.2: MCP released by Anthropic November 25 2024. [8]
- AC-7.3: MCP donated to Linux Foundation under AAIF in December 2025. [9]
- AC-7.4: Anthropic, Block, and OpenAI co-founded the Agentic AI Foundation. [9]
- AC-7.5: Cursor 3 launched April 2 2026. [24]

### Finding 8 (Gaps)
- AC-8.1: Long-horizon coherence degrades past a moderate (task-dependent) number of sequential calls. [54]
- AC-8.2: SWE-Bench Pro will eventually be contaminated as new training runs complete. [5]

---

## Verifier Batch Allocation

### Verifier Batch 1 (Sonnet sub-agent V1) — Benchmark contamination claims
- AC-2.1, AC-2.2, AC-2.3, AC-2.4, AC-2.5, AC-2.6, AC-2.7, AC-2.8
- AC-3.1, AC-3.2, AC-3.3
- **Why this batch:** All highest-priority claims that depend on the same evidence pool. One agent should verify them together.

### Verifier Batch 2 (Sonnet sub-agent V2) — Vendor/product/historical claims
- AC-1.1 through AC-1.14 (tool landscape)
- AC-7.1 through AC-7.5 (consolidation/MCP)
- **Why this batch:** All factual claims about tool launches, dates, pricing, and corporate events.

### Verifier Batch 3 (Sonnet sub-agent V3) — Productivity/cost/security claims
- AC-4.1, AC-4.2, AC-4.3, AC-4.4, AC-4.5
- AC-5.1, AC-5.2, AC-5.3, AC-5.4, AC-5.5
- AC-6.1, AC-6.2, AC-6.3
- **Why this batch:** All claims that depend on independent research organizations, post-mortem reporting, or CVE databases.

### Adversarial Agent (Sonnet sub-agent V4) — Refutation
- Task: Try to falsify the report's three central claims (contamination story, productivity paradox, multi-leader market) by finding specific counter-evidence.
- Specifically: Look for sources that say SWE-bench Verified is *not* contaminated, that the productivity gain is real and matches vendor claims, or that one tool *clearly* dominates all others.
