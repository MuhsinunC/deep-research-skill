# Phase 1: SCOPE — Agentic Coding Assistants 2026

**Topic:** Comparison of agentic coding assistants in 2026: capabilities, benchmarks, IDE integrations, and production deployment tradeoffs (Claude Code, Cursor, Codex, Copilot, Aider, Cline, others)

**Date anchor:** 2026-04-07
**Mode:** deep
**Task UUID:** A664CE38

---

## Decomposed Sub-Questions

1. **Q1 — Landscape & Architecture:** What are the leading agentic coding assistants as of April 2026, and how do their core architectures differ?
   - Sub-Q1a: Which tools belong in the "agentic" category vs. plain autocomplete (must have agent loop, tool use, multi-step planning)?
   - Sub-Q1b: CLI vs. IDE-native vs. browser-based — what does each form factor enable/prevent?
   - Sub-Q1c: Single-shot vs. persistent agent loops — which tools maintain state, which restart per turn?

2. **Q2 — Benchmarks:** How do they compare on standard coding benchmarks (SWE-bench Verified, LiveCodeBench, HumanEval+, Terminal-Bench)?
   - Sub-Q2a: What are the latest publicly reported numbers (vendor-claimed) per tool?
   - Sub-Q2b: Independent reproductions and third-party leaderboards — do they match vendor claims?
   - Sub-Q2c: Known benchmark gaming / contamination concerns

3. **Q3 — Capabilities & Tool Use:** What is the state of multi-file editing, tool use, and agent autonomy?
   - Sub-Q3a: Filesystem access patterns (read/write/execute permissions)
   - Sub-Q3b: Browser control, shell execution, code execution sandboxes
   - Sub-Q3c: MCP (Model Context Protocol) adoption status across tools
   - Sub-Q3d: Multi-file refactoring depth and reliability

4. **Q4 — Cost & Production Failure Modes:** What are the cost structures, rate limits, and production failure modes per tool?
   - Sub-Q4a: Pricing tiers and per-task / per-token economics
   - Sub-Q4b: Rate limits and quota structures
   - Sub-Q4c: Documented production failures (catastrophic edits, data loss, runaway agents)
   - Sub-Q4d: Security posture (code exfil, prompt injection, sandbox escapes)

5. **Q5 — Gaps:** What gaps remain that current tools don't address?
   - Sub-Q5a: Long-horizon tasks (multi-day, multi-PR)
   - Sub-Q5b: Repo-wide reasoning vs. file-window-bound reasoning
   - Sub-Q5c: Verification, self-correction, and grounding
   - Sub-Q5d: Cost efficiency at scale

---

## Stakeholder Perspectives

- **Solo developer / hobbyist** — cost-sensitive, single-machine setup, IDE-first
- **Engineering team lead** — production deployment, security, audit trails
- **Platform engineering / DevEx** — fleet rollout, MCP server integration
- **Security / compliance** — sandbox isolation, prompt injection, supply-chain risk
- **Researcher / benchmark evaluator** — reproducibility, contamination, fair comparison

---

## Scope Boundaries

**IN SCOPE:**
- Tools released or significantly updated in 2025–2026 with public documentation
- Vendor blogs, third-party benchmarks (SWE-bench Verified leaderboard, Terminal-Bench, LiveCodeBench)
- GitHub issue trackers (failure mode evidence)
- Practitioner case studies and post-mortems
- The named tools: **Claude Code, Cursor, OpenAI Codex (Codex CLI / Codex agents), GitHub Copilot (incl. Copilot Workspace / Copilot agents), Aider, Cline, Continue, Roo Code, Devin, OpenHands, Plandex**, plus any other agentic tool that surfaces in retrieval

**OUT OF SCOPE:**
- General-purpose chat LLMs without agent loops (raw ChatGPT, raw Claude.ai)
- IDE plugins that just call an API without any agent logic (basic autocomplete-only)
- Marketing-only content without technical details
- Tools with no public documentation

**PRIORITY:**
1. Independent benchmarks > vendor-reported numbers
2. Concrete capability comparisons > qualitative descriptions
3. Quantitative cost/limit data > vague pricing tiers

---

## Topic-Specific Acceptance Criteria

These are concrete, checkable criteria specific to THIS research, not global quality gates:

1. **AC1 — Tool coverage:** Report MUST cover at least 7 of the named tools (Claude Code, Cursor, OpenAI Codex, GitHub Copilot, Aider, Cline, plus at least one of Devin/OpenHands/Continue) with technical details on each
2. **AC2 — Benchmark table:** Report MUST contain a comparison table showing SWE-bench Verified scores for each tool with citation per row, distinguishing vendor-reported from independent
3. **AC3 — Architecture taxonomy:** Each covered tool MUST be classified by form factor (CLI / IDE-native / browser-based / hybrid) and agent loop type (single-shot / persistent / hierarchical)
4. **AC4 — Cost data:** Pricing data MUST be present for each covered tool (USD or token-based) with citation, anchored to a known date (since pricing changes fast)
5. **AC5 — MCP adoption:** Report MUST explicitly state which tools support Model Context Protocol as of April 2026 with citation per claim
6. **AC6 — Failure modes:** At least 3 documented production failure modes (with source — GitHub issue, post-mortem, or news report) MUST be cited
7. **AC7 — Gap analysis:** Report MUST identify at least 3 concrete gaps with evidence from at least 2 sources each

---

## Key Assumptions to Validate

1. SWE-bench Verified is still the dominant benchmark for agent coding eval in 2026 (validate during retrieve)
2. Anthropic, OpenAI, Microsoft, and Cursor are still the dominant vendors
3. MCP has achieved meaningful cross-tool adoption (or has not — this needs evidence)
4. Pricing is dominated by token-based + flat-tier hybrid models
5. Devin / Cognition is still active in 2026 (or has pivoted/shut down)
6. GitHub Copilot has evolved beyond autocomplete into a true agent
7. Claude Code remains CLI-first (or has expanded to GUI)

---

## Topic Time Domain Classification (Per Sub-Question)

This is a fast-moving technology topic. Per the temporal credibility decay rules:

| Sub-Question | Domain | Half-Life | Notes |
|---|---|---|---|
| Q1 (architecture) | Technology / software | 90 days | Tool architectures evolve quarterly |
| Q2 (benchmarks) | Technology / software | 90 days | New scores posted monthly |
| Q3 (capabilities) | Technology / software | 90 days | Feature parity changes monthly |
| Q4a (pricing) | Business / market data | 180 days | Pricing changes 1-2x/year typically |
| Q4b-d (failures) | Technology / software | 90 days | Recent failures most relevant |
| Q5 (gaps) | Technology / software | 90 days | What's missing today != yesterday |

**Implication:** Sources older than ~180 days (Oct 2025) for Q1-Q3 and Q4b-d should be deprioritized unless foundational. For pricing (Q4a), sources older than ~360 days (April 2025) should be deprioritized. Apply during retrieval.

---

## Predicted Failure Modes (Think2 PLAN)

1. **Vendor marketing inflation:** Vendors report inflated SWE-bench scores; need to favor independent leaderboard (swebench.com) over vendor blogs
2. **Tool definition drift:** "Agentic" is a marketing term — must apply consistent technical criteria (tool use + multi-step planning + persistent state) to filter
3. **Stale benchmarks:** SWE-bench Verified results from 2024 reflect 2024-era models, not 2026 systems with much higher scores
4. **Closed-source tools (Devin, Cursor agent):** Architecture details may be unavailable; rely on inference from public behavior + interviews
5. **Pricing opacity:** Some tools have usage-based pricing without published per-token rates
6. **Recency anchoring:** Most recent vendor announcement may dominate the narrative without representing the steady state

---

## Think2 EVALUATE

**Sub-questions identified:** 5 primary, 18 sub-questions across them
**Assumptions to validate:** 7
**Topic-specific acceptance criteria:** 7 (within 3-7 target)
**Time domain assigned:** Per-sub-question (not single global) — critical for fast-moving topic
**Most fragile aspect:** Vendor benchmark claims (Q2) — need independent corroboration; will allocate adversarial agent specifically to check this

**Next phase warnings:** PLAN must allocate at least one sub-agent lens to "critical/adversarial" specifically for benchmark/marketing contradiction discovery, and must include pro/con query pairs for the central thesis ("X is the best agentic coding assistant").
