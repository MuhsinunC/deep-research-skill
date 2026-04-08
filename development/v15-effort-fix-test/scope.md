# Phase 1: SCOPE — Self-Improvement Research for Deep-Research Skill

**Date:** 2026-04-07
**UUID:** E72ABA74
**Mode:** deep
**Topic:** Improvements to claude-deep-research-skill (branch feat/altmbr-reliability-improvements, df7db85) NOT yet implemented

## 1. Question Decomposition

**Primary research question:** What concrete, evidence-grounded improvements from 2025-2026 research and production deployments would materially raise the deep-research skill's accuracy, reliability, completeness, and efficiency BEYOND its current v14 capabilities?

**Sub-questions (mapped to brief):**
1. **SQ1 — Accuracy:** What specific accuracy techniques (verification, contradiction resolution, source quality assessment, hallucination detection) appeared in 2025-2026 that the skill doesn't yet implement?
2. **SQ2 — Reliability:** What new failure-handling, retry, partial-completion, sub-agent coordination, and blocked-site fallback patterns have been published or productionized in 2025-2026?
3. **SQ3 — Completeness:** What new acceptance-criteria, gap-detection, scope-refinement, and claim-coverage techniques exist beyond the current acceptance criteria + Step 4 completeness check?
4. **SQ4 — Efficiency:** What 2025-2026 cost-reduction, latency, parallel-execution, caching, and model-selection improvements exist that the current hybrid architecture doesn't yet capture?
5. **SQ5 — Architectural patterns:** Which specific patterns from named 2025-2026 projects (Marco DeepResearch, Feynman, MiroThinker, OpenInference/AgentDebug, Tool-MAD, PROClaim, others) are NOT in the skill?

## 2. Stakeholder Perspectives

- **Skill maintainer (primary user):** Wants concrete, drop-in improvements with quantitative evidence. Cares about implementation cost, breakage risk, and measurable quality lift.
- **Skill end-users:** Want better reports — fewer hallucinations, more complete coverage, lower latency, cheaper runs. Don't care about internal mechanics.
- **Academic researchers:** Care about whether techniques are reproducible and benchmarked, not anecdotal.
- **Production deployers:** Care about reliability under adverse conditions (rate limits, stalls, blocked sites), observability, debuggability.

## 3. Scope Boundaries

**IN scope:**
- arXiv papers from 2025-2026 on LLM research agents, claim verification, agent observability, hallucination detection
- Open-source projects (GitHub) released or significantly updated in 2025-2026 with documented architectural decisions
- Production deployment case studies from 2025-2026
- Specific named projects called out in brief: Marco DeepResearch, Feynman, MiroThinker, OpenInference, AgentDebug, Tool-MAD, PROClaim

**OUT of scope:**
- Marketing content without technical details
- Pre-2025 papers unless foundational
- Vague "best practices" without concrete implementation details
- Improvements ALREADY in v14 (those listed in the brief context)

**PRIORITY:** Actionable recommendations with quantitative evidence > qualitative observations. Improvements NOT already implemented > rediscoveries.

## 4. Topic-Specific Acceptance Criteria

These are CHECKED at Phase 7.5 VERIFY Step 4 and Phase 8 PACKAGE:

1. **At least 3 NAMED 2025-2026 projects/papers** must contribute concrete architectural patterns the skill could adopt (drawn from Marco DeepResearch, Feynman, MiroThinker, OpenInference, AgentDebug, Tool-MAD, PROClaim, or equivalents).
2. **At least 2 quantitative claims** about performance lift (accuracy %, latency %, cost %, etc.) must each have a specific source citation with the measurement methodology described.
3. **At least 1 recommendation per dimension** (accuracy, reliability, completeness, efficiency) must be present and actionable — not vague.
4. **Each recommendation must explicitly distinguish itself** from what v14 already implements (the brief lists v14's current capabilities — recommendations that duplicate those are rejected).
5. **At least 1 source within the last 90 days** (Tech/software half-life) for each major recommendation about agent runtime behavior, OR an explicit note that the technique is mature enough that older sources still apply.
6. **The report must explicitly address** whether each recommendation has a known failure mode or interaction with existing v14 features.
7. **Bibliography must contain ≥10 sources, with ≥3 citations per major recommendation**, NO fabricated URLs (every URL must be tool-fetched at VERIFY stage).

## 5. Key Assumptions to Validate

- **A1:** That 2025-2026 has produced novel research-agent techniques worth porting (vs. consolidation of 2024 work)
- **A2:** That the named projects in the brief (Marco DeepResearch, Feynman, MiroThinker, etc.) are real and have the properties the user expects
- **A3:** That the v14 baseline as described in the brief is accurate (the brief lists 10 features — these are assumed to be in place)
- **A4:** That arXiv and GitHub remain accessible for primary source verification
- **A5:** That improvements are findable via standard search infrastructure (not gated to a private corpus)

## 6. Topic Time Domain Classification

This is a **fast-moving Tech/software topic** with two sub-domains:
- **Academic research papers (arXiv):** Science/academic half-life = 365 days. A 2025 paper is still relevant.
- **Production agent frameworks (GitHub):** Tech/software half-life = 90 days. A 6-month-old release may already be superseded.
- **Named project architectures:** Technology half-life = 90 days for the API/implementation specifics, but design principles travel further.

**Application:** During RETRIEVE, prioritize sources from 2025-Q4 to 2026-Q1 for production techniques. For academic papers, accept 2025 work without recency penalty. Flag any arXiv paper >18 months old as needing recency scrutiny.

## 7. Think2 PLAN — Alternative Framings Considered

**Framing A (chosen):** "What specific NEW techniques exist that v14 lacks?" — focused on actionable improvements
**Framing B (rejected):** "What's the ideal deep-research agent in 2026?" — too aspirational, would yield generic best practices
**Framing C (rejected):** "Which named projects beat the current skill on benchmark X?" — assumes a benchmark exists; would require evaluation infrastructure not available

**Likely failure modes:**
- F1: Recommendations duplicate v14 features because the searcher missed the brief's "what's already there" list — MITIGATION: explicit cross-check in CRITIQUE
- F2: Findings drift toward generic LLM agent advice rather than RESEARCH-specific patterns — MITIGATION: anchor every recommendation to a named source
- F3: Citation hallucination — fake arXiv numbers, fake GitHub URLs — MITIGATION: VERIFY phase will WebFetch every cited URL
- F4: Time bias — relying on training-data knowledge rather than searching for 2026 work — MITIGATION: explicit date filtering, devil's advocate searches for "what's new since X"

## 8. Think2 EVALUATE

- **Sub-questions identified:** 5
- **Assumptions to validate:** 5
- **Acceptance criteria:** 7 (within 3-7 target)
- **Failure modes anticipated:** 4
- **Domain time classification:** Mixed (academic 365d / production 90d) — apply per sub-question

**For PLAN phase to handle:** The 5 named projects in the brief give a concrete starting point for retrieval — PLAN should allocate explicit search queries to each. The "what's already in v14" list must be re-read by every sub-agent so they don't surface duplicates.
