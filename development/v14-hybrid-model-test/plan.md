# Research Plan: Agentic Coding Assistants Comparison 2026

**Date:** 2026-04-07
**Mode:** deep
**UUID:** A664CE38

## Questions

1. What are the leading agentic coding assistants as of April 2026, and how do their core architectures differ?
2. How do they compare on standard coding benchmarks (SWE-bench Verified, LiveCodeBench, HumanEval+, Terminal-Bench)?
3. What is the state of multi-file editing, tool use, and agent autonomy across these tools?
4. What are the cost structures, rate limits, and known production failure modes?
5. What gaps remain in the agentic coding assistant landscape?

## Strategy

### Sub-Agent Lens Allocations

Per the deep-research methodology, deep mode uses 4 lens sub-agents (academic, practitioner, critical, historical). All spawned synchronously in a single message with `model="sonnet"`.

| Agent | Lens | Coverage Focus |
|---|---|---|
| A | Academic / Formal | SWE-bench papers, arxiv on agentic coding evaluation, MCP RFCs, agent loop design papers |
| B | Practitioner / Applied | Vendor docs, IDE comparisons, tool feature matrices, real-world feature reviews from dev blogs |
| C | Critical / Adversarial | Tool failure modes, runaway agents, prompt injection cases, GitHub issues, post-mortems, leaderboard contamination concerns |
| D | Historical / Evolution | How tools evolved 2023→2026, vendor pivots (e.g. Devin, Copilot Workspace), benchmark history |

### Search Query Decomposition (Step 1 parallel burst)

Eight angles + pro/con pairs on the central thesis:

1. **Core topic semantic:** "agentic coding assistants comparison 2026"
2. **SWE-bench leaderboard:** "SWE-bench Verified leaderboard April 2026"
3. **Recent developments:** "Claude Code Cursor Codex Copilot 2026 capabilities"
4. **MCP adoption:** "Model Context Protocol adoption Cursor Cline 2026"
5. **Cost and pricing:** "Cursor Claude Code Copilot pricing per token 2026"
6. **Critical / failures:** "Claude Code Cursor Devin failure modes runaway agent 2026"
7. **Independent benchmarks:** "Terminal-Bench agentic coding tools independent evaluation 2026"
8. **Gaps and limitations:** "agentic coding assistant limitations long horizon tasks 2026"

**Pro/Con pairs for evaluative sub-questions:**
- PRO: "Claude Code best SWE-bench performance 2026" / CON: "Claude Code SWE-bench limitations criticism"
- PRO: "Cursor IDE productivity gains 2026" / CON: "Cursor productivity overhyped 2026"
- PRO: "Devin autonomous engineer working" / CON: "Devin failures benchmark gaming 2026"

### Expected Rounds of RETRIEVE

- **Step 1:** Single parallel burst of 8 WebSearches + 4 sub-agent spawns
- **Step 2:** Sub-agents do their own deep dives, write to per-agent files
- **Step 3:** Lead reviews aggregate, runs 3-5 targeted follow-ups for gaps

### Triangulation Approach

- For each named tool, require 2+ independent sources for key claims (capabilities, benchmark scores, pricing)
- Cross-check vendor claims against independent leaderboard (swebench.com if available)
- Apply temporal credibility decay: prefer Q1 2026 over 2025 sources where pricing/features overlap

## Acceptance Criteria (from Phase 1 SCOPE Activity 4)

- [ ] AC1: Tool coverage — at least 7 of the named tools with technical details
- [ ] AC2: Benchmark table — SWE-bench Verified scores per tool with citation, vendor vs independent flagged
- [ ] AC3: Architecture taxonomy — form factor + agent loop type per tool
- [ ] AC4: Cost data per tool with citation and date anchor
- [ ] AC5: MCP support status per tool with citation
- [ ] AC6: At least 3 documented failure modes with sources
- [ ] AC7: At least 3 gaps with 2+ sources each

## Task Ledger

| ID | Owner | Task | Status | Output |
|---|---|---|---|---|
| T1 | lead | Phase 1 SCOPE | done | scope.md |
| T2 | lead | Phase 2 PLAN | in_progress | plan.md |
| T3 | lead | Phase 3 Step 1 parallel WebSearches | pending | (inline + retrieve_lead_searches.md) |
| T4 | sub-agent A (sonnet) | Phase 3 academic lens retrieval | pending | research_agent_1.md |
| T5 | sub-agent B (sonnet) | Phase 3 practitioner lens retrieval | pending | research_agent_2.md |
| T6 | sub-agent C (sonnet) | Phase 3 critical lens retrieval | pending | research_agent_3.md |
| T7 | sub-agent D (sonnet) | Phase 3 historical lens retrieval | pending | research_agent_4.md |
| T8 | lead | Phase 4 TRIANGULATE | pending | (inline) |
| T9 | lead | Phase 4.5 OUTLINE REFINEMENT | pending | refined_outline.md |
| T10 | lead | Phase 5 SYNTHESIZE | pending | synthesis.md |
| T11 | lead | Phase 6 CRITIQUE | pending | critique.md |
| T12 | lead | Phase 7 REFINE | pending | (inline) |
| T13 | lead | Phase 7.5 VERIFY Step 1 (decompose claims) | pending | atomic_claims.md |
| T14 | sub-agent V1 (sonnet) | Verify citation batch 1 | pending | verify_citation_1.md |
| T15 | sub-agent V2 (sonnet) | Verify citation batch 2 | pending | verify_citation_2.md |
| T16 | sub-agent V3 (sonnet) | Verify citation batch 3 | pending | verify_citation_3.md |
| T17 | sub-agent V4 (sonnet) | Adversarial refutation | pending | verify_adversarial.md |
| T18 | lead | Phase 8 PACKAGE | pending | research_report.md + provenance |

## Verification Log

| Item | Citation Status | Adversarial Status | Supersession Status | Evidence |
|---|---|---|---|---|
| (populated during VERIFY phase) | | | | |

## Decision Log

- 2026-04-07: SCOPE phase set 5 sub-questions, 7 acceptance criteria, per-sub-question time domains. Identified vendor benchmark inflation as the biggest risk → critical/adversarial lens prioritized.
- 2026-04-07: PLAN phase committed to 8-search parallel burst + 4 sub-agents (A-D). Pro/con pairs added on Claude Code, Cursor, and Devin since these are the most contested tools.
- 2026-04-07: Output is markdown only (per user brief) — PACKAGE will skip HTML/PDF generation.
