# Research Plan: Deep-Research Skill Self-Improvement (2025-2026)

## Questions

1. **PRIMARY:** What concrete, evidence-grounded improvements from 2025-2026 research and production deployments would materially raise the deep-research skill's accuracy, reliability, completeness, and efficiency BEYOND its current v14 capabilities?
2. **SQ1 — Accuracy:** What 2025-2026 verification, contradiction-resolution, source-quality, and hallucination-detection techniques does v14 lack?
3. **SQ2 — Reliability:** What 2025-2026 failure-handling, retry, partial-completion, sub-agent coordination patterns are missing?
4. **SQ3 — Completeness:** What 2025-2026 acceptance-criteria, gap-detection, scope-refinement techniques are missing?
5. **SQ4 — Efficiency:** What 2025-2026 cost/latency/parallelism/caching/model-selection improvements are missing?
6. **SQ5 — Architectural patterns:** What patterns from Marco DeepResearch, Feynman, MiroThinker, OpenInference, AgentDebug, Tool-MAD, PROClaim are missing?

## Strategy

### Sub-agent lens allocations (Phase 3 RETRIEVE)

- **Lens A — Academic/Formal:** Search arXiv, NeurIPS, ICLR, ACL, EMNLP papers from 2025-2026 on LLM research agents, agent verification, hallucination detection. Focus on papers with quantitative evaluation.
- **Lens B — Practitioner/Applied:** Search GitHub, project blogs, engineering reports for production research-agent frameworks. Focus on deployment lessons, observability, debuggability.
- **Lens C — Critical/Adversarial:** Search for failure modes, criticism, "what doesn't work" in research-agent deployments. Find evidence that named techniques fail, regress, or have hidden costs.
- **Lens D — Historical/Foundational + Named-Project Deep Dive:** Specifically investigate the 7 named projects in the brief (Marco DeepResearch, Feynman, MiroThinker, OpenInference, AgentDebug, Tool-MAD, PROClaim). Find the original papers, GitHub repos, and architectural decisions.

### Search query decomposition

**Main agent Step 1 parallel searches (8 angles + pro/con pairs for 3 central sub-questions = 14 searches):**

Angles 1-8:
1. **Core (semantic):** "deep research LLM agent improvements 2025 2026"
2. **Technical (keyword):** "claim verification hallucination detection LLM agent 2026"
3. **Recent developments (date-filtered):** "LLM research agent architecture 2026 arxiv"
4. **Academic:** "agent observability self-correction verification 2025 paper"
5. **Alternative perspectives:** "research agent failure modes correlated errors 2025"
6. **Statistical/data:** "deep research benchmark BrowseComp Humanity's Last Exam 2026"
7. **Industry analysis:** "production research agent OpenAI Anthropic Perplexity 2026"
8. **Critical analysis:** "research agent limitations criticism overhyped 2025 2026"

Pro/con pairs (for 3 most central sub-questions):
- SQ1 PRO: "verifier-guided research agent improvement accuracy"
- SQ1 CON: "verifier guided retry diminishing returns failure"
- SQ2 PRO: "sub-agent failure recovery retry patterns 2026"
- SQ2 CON: "sub-agent retries amplify errors correlated failure"
- SQ4 PRO: "deep research cost optimization latency 2026"
- SQ4 CON: "research agent cost optimization tradeoffs quality regression"

### Sub-agent Phase 3 prompts

Each sub-agent gets the v14 baseline list (10 features) so they can avoid rediscovery, plus its specific lens and the EFFORT REINFORCEMENT clause. **All sub-agents use `model="sonnet"`.**

### Expected rounds of RETRIEVE

- Phase 3 Step 1: 14 parallel searches (8 angles + 6 pro/con pairs)
- Phase 3 Step 2: 4 parallel sub-agents (one per lens)
- Phase 3 Step 3: 2-5 follow-up searches if gaps emerge (deferred to after first batch)
- Quality gate: Deep mode = 25+ sources with avg credibility >70/100 OR 10 minutes elapsed

## Acceptance Criteria (copied from SCOPE Activity 4)

- [ ] AC1: At least 3 NAMED 2025-2026 projects/papers must contribute concrete architectural patterns
- [ ] AC2: At least 2 quantitative claims about performance lift (with measurement methodology)
- [ ] AC3: At least 1 actionable recommendation per dimension (accuracy, reliability, completeness, efficiency)
- [ ] AC4: Each recommendation explicitly distinguishes itself from v14's existing features
- [ ] AC5: At least 1 source within 90 days for each runtime-behavior recommendation, OR explicit "mature technique" note
- [ ] AC6: Each recommendation must address known failure modes / interaction with v14 features
- [ ] AC7: Bibliography ≥10 sources, ≥3 citations per major recommendation, NO fabricated URLs

## Task Ledger

| ID | Owner | Task | Status | Output |
|---|---|---|---|---|
| T1 | lead | Phase 1 SCOPE | done | scope.md |
| T2 | lead | Phase 2 PLAN | in_progress | plan.md |
| T3 | lead | Phase 3 Step 1 — 14 parallel main-agent searches | pending | inline + evidence.jsonl |
| T4 | academic-lens sub-agent | Phase 3 academic retrieval (Lens A) | pending | research_agent_1.md |
| T5 | practitioner-lens sub-agent | Phase 3 practitioner retrieval (Lens B) | pending | research_agent_2.md |
| T6 | critical-lens sub-agent | Phase 3 critical retrieval (Lens C) | pending | research_agent_3.md |
| T7 | named-projects sub-agent | Phase 3 named-projects deep dive (Lens D) | pending | research_agent_4.md |
| T8 | lead | Phase 4 TRIANGULATE | pending | triangulate.md |
| T9 | lead | Phase 4.5 OUTLINE REFINEMENT | pending | outline.md |
| T10 | lead | Phase 5 SYNTHESIZE | pending | synthesize.md |
| T11 | lead | Phase 6 CRITIQUE | pending | critique.md |
| T12 | lead | Phase 7 REFINE | pending | refine.md |
| T13 | lead | Phase 7.5 VERIFY decomposition + verification sub-agent spawn | pending | verify_*.md |
| T14 | lead | Phase 8 PACKAGE | pending | research_report.md + provenance |

## Verification Log

| Item | Citation Status | Adversarial Status | Supersession Status | Evidence |
|---|---|---|---|---|
| (populated in Phase 7.5) | | | | |

## Decision Log

- **2026-04-07 10:40** — Task registered (UUID E72ABA74) with deep mode, markdown-only output
- **2026-04-07 10:42** — SCOPE complete with 7 acceptance criteria; failure mode F1 (rediscovery) flagged as biggest risk; will inject v14 baseline into every sub-agent prompt
- **2026-04-07 10:45** — PLAN complete; 4 lens sub-agents allocated, 14 Phase 3 Step 1 searches planned

## Think2 EVALUATE — PLAN phase

- **All sub-questions covered?** Yes — 5 lenses cover all 5 SQs (Lens D handles named projects; Lenses A/B/C distribute the dimensional questions across academic/practical/critical perspectives)
- **Single-source dependencies in plan?** No — every sub-question gets at least 2 searches (one parallel, one sub-agent)
- **Acceptance criteria concrete?** Yes — AC1 (3 named projects), AC2 (2 quantitative claims), AC7 (10+ sources) are all countable
- **Anything next phase should watch?** RETRIEVE must guard against (a) rediscovery of v14 features, (b) hallucinated citations, (c) bias toward training-data knowledge over current sources
