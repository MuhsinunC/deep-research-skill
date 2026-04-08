# Research Plan: AI Agent Observability Tools (April 2026)

## Questions

1. **Primary:** What is the state of AI agent observability tools as of April 2026 — across tracing, evaluation, debugging, and production monitoring?
2. **SQ1 (Platforms):** Leading agent observability platforms — comparison of tracing capabilities (LangSmith, Langfuse, Arize Phoenix, Helicone, Braintrust, others)
3. **SQ2 (Multi-Agent):** Multi-agent / tool-calling workflow representation vs generic LLM observability
4. **SQ3 (Eval):** Evaluation framework integration (Ragas, DeepEval, custom rubrics, LLM-as-judge)
5. **SQ4 (Production):** Production monitoring — alerting, drift detection, cost tracking, latency SLOs
6. **SQ5 (Gaps):** Unaddressed gaps in production LLM agent observability

## Strategy

### Heterogeneous sub-agent lens allocation (4 agents — Deep mode)
- **Agent A — Academic / Formal:** Searches arXiv, OpenTelemetry standards body docs, conference papers, NeurIPS/ICML observability work, formal definitions of agent tracing, GenAI semantic conventions
- **Agent B — Practitioner / Applied:** Searches platform docs (LangSmith, Langfuse, Phoenix, Helicone, Braintrust, Logfire, Weave, Langtrace, Lunary), GitHub issue trackers, eng blogs (Anthropic, OpenAI, Pinecone, etc.), real customer case studies
- **Agent C — Critical / Adversarial:** Searches HackerNews, Reddit r/LocalLLaMA r/MachineLearning, Twitter/X complaints, "X vs Y" comparison posts, GitHub issues filed with `bug` label, "limitations of [tool]" pages
- **Agent D — Non-LangChain Ecosystem:** Specifically targets LlamaIndex observability, Anthropic SDK tracing, OpenAI Agents SDK telemetry, AutoGen logging, CrewAI tracing — combats LangChain SEO bias (Failure mode F3)

### Search query decomposition (8 angles + pro/con pairs for top sub-questions)

**Initial parallel burst (Step 1):**
1. `"AI agent observability platforms 2026 comparison"` (SEMANTIC angle)
2. `"LangSmith Langfuse Arize Phoenix Helicone Braintrust comparison"` (DIRECT angle)
3. `"OpenTelemetry GenAI semantic conventions 2026"` (STANDARDS angle)
4. `"multi-agent tracing observability span model"` (SQ2 angle)
5. `"Ragas DeepEval observability integration"` (SQ3 angle)
6. `"LLM agent production monitoring alerting drift"` (SQ4 angle)
7. `"LLM observability cost tracking pricing comparison"` (QUANT angle)
8. `"agent observability gaps limitations problems 2026"` (CRITICAL angle)

**Pro/Con pairs (3 most central sub-questions):**
- SQ1: PRO `"LangSmith production usage benefits"` / CON `"LangSmith problems lock-in alternatives"`
- SQ2: PRO `"multi-agent observability tools support hand-off"` / CON `"multi-agent observability fails missing features"`
- SQ4: PRO `"LLM observability drift detection works"` / CON `"LLM monitoring drift detection false positives noise"`

**Expected:** 8 + 6 = 14 searches in initial burst, +4 sub-agents in same single message.

### Triangulation approach
- Each platform claim must be backed by primary source (vendor doc) AND at least one secondary (practitioner blog / GitHub / academic)
- Pricing claims must include date stamp (vendor sites change pricing without notice)
- OTel conformance claims must reference both vendor and the OTel GenAI WG
- Multi-agent claims need a code sample or screenshot in the source — "supports agents" alone is marketing

## Acceptance Criteria (copied from SCOPE Activity 4)

- [ ] **AC1:** Compare ≥6 named platforms including LangSmith, Langfuse, Arize Phoenix, Helicone, Braintrust + ≥1 additional 2025-2026 entrant
- [ ] **AC2:** Each platform's tracing approach cites the platform's own documentation as a primary source
- [ ] **AC3:** Multi-agent / tool-calling workflow handling explicitly addressed for ≥4 platforms with concrete span model details
- [ ] **AC4:** OpenTelemetry GenAI semantic conventions addressed: status April 2026, conformance, divergences
- [ ] **AC5:** Ragas + DeepEval integration patterns named for ≥3 observability platforms
- [ ] **AC6:** Production monitoring covers all four sub-dimensions (alerting, drift, cost, latency SLOs) with concrete examples per platform
- [ ] **AC7:** Quantitative metrics cited for ≥3 platforms (overhead %, p99 ingest, free-tier limits, paid pricing)
- [ ] **AC8:** Gaps section identifies ≥4 specific gaps tied to concrete missing capabilities

## Quality Gates
- ≥25 sources gathered (Deep mode FFS threshold)
- Average source credibility ≥70/100
- ≥3 source types (academic / vendor docs / practitioner blogs / GitHub issues)
- ≥3 independent sources for every major comparative claim
- All quantitative claims (numbers, prices) verified at VERIFY phase against the original source

## Task Ledger

| ID | Owner | Task | Status | Output |
|---|---|---|---|---|
| T1 | lead | Phase 1 SCOPE | done | scope.md, _checkpoint.json |
| T2 | lead | Phase 2 PLAN | done | plan.md |
| T3 | Agent A (academic lens) | Phase 3 academic retrieval — OTel GenAI conventions, agent tracing literature | done | research_agent_A_academic.md (5/5 tasks done; 13+ academic sources) |
| T4 | Agent B (practitioner lens) | Phase 3 practitioner retrieval — vendor docs, customer case studies, eng blogs | done | research_agent_B_practitioner.md (7/7 platforms done; verified pricing for all) |
| T5 | Agent C (critical lens) | Phase 3 critical retrieval — limitations, problems, complaints, GitHub bugs | done | research_agent_C_critical.md (4/5 tasks done; T_c Reddit partial — covered via referring blogs) |
| T6 | Agent D (non-LangChain lens) | Phase 3 non-LangChain ecosystem — LlamaIndex, Anthropic SDK, OpenAI Agents SDK, AutoGen, CrewAI | done | research_agent_D_non_langchain.md (7/7 frameworks done) |
| T7 | lead | Phase 3 Step 1 parallel WebSearch burst (14 queries) | done | retrieval_burst.md (20 actual queries: 14 initial + 6 follow-ups) |
| T8 | lead | Phase 4 TRIANGULATE | done | triangulate.md (14 verified claims, 4 contradictions resolved, 3 devil's advocate searches) |
| T9 | lead | Phase 4.5 OUTLINE_REFINEMENT | done | outline_refinement.md (~40% restructure: 4 sections added) |
| T10 | lead | Phase 5 SYNTHESIZE | done | research_report.md draft (14,830 words, 16 sections) |
| T11 | lead | Phase 6 CRITIQUE | done | critique.md + gap_fill.md (3 high-impact corrections from gap-fill subagent) |
| T12 | lead | Phase 7 REFINE | done | research_report.md (10 critique fixes + 5 new bibliography entries applied) |
| T13 | lead + 3 verify sub-agents | Phase 7.5 VERIFY | done | verify_citation_1.md, verify_citation_2.md, verify_adversarial.md (1 REFINE loop-back cycle used) |
| T14 | lead | Phase 8 PACKAGE | done | research_report.md (final), research_report.provenance.md |

## Verification Log
| Item | Citation Status | Adversarial Status | Supersession Status | Evidence |
|---|---|---|---|---|
| (To be populated in Phase 7.5 VERIFY) | | | | |

## Decision Log

(Freeform append-only log of notable decisions.)

- **2026-04-07 00:42** — SCOPE complete. 5 sub-questions, 8 acceptance criteria, 90-day half-life confirms Step 5 supersession check is required.
- **2026-04-07 00:42** — PLAN: chose 4-lens sub-agent dispatch (added Agent D for non-LangChain ecosystem) to combat F3 (LangChain SEO bias). 14-query Step 1 burst + 4 sub-agents in single parallel message.
- **2026-04-07 00:42** — Decision: include Logfire, Weave, Langtrace, Lunary, OpenLLMetry/Openlit as candidate "additional entrants" for AC1 — let RETRIEVE determine which actually have production traction.
- **2026-04-07 01:05** — RETRIEVE complete. 60+ unique sources gathered across 4 lenses + 20 main-thread queries. Avg credibility ~87. All four sub-agents completed without retries. Threshold of 25 sources at >70 credibility comfortably exceeded.
- **2026-04-07 01:05** — Major surfaced facts that will shape the report: (1) ClickHouse acquired Langfuse 2026-01-16 with $400M Series D, no immediate user impact; (2) OTel issue #2664 (multi-agent semconv) is OPEN — no W3C-stable schema for handoffs/tasks/teams/artifacts/memory yet; (3) AG2 shipped native OTel tracing Feb 2026 with the most complete multi-agent instrumentation in the market (4 instrumentation functions including A2A server); (4) Helicone Vault IDOR security issue #5597 is OPEN as of Feb 2026 — multi-tenant credential isolation failure; (5) Langfuse self-host #12576 — traces ingest to ClickHouse but `/api/public/traces` returns empty (silent path divergence, OPEN); (6) LangSmith has a 25k-runs-per-trace HARD ceiling, breaking long-running autonomous agents.
- **2026-04-07 01:05** — Decision: AC1 will name 6 main platforms (LangSmith, Langfuse, Phoenix, Helicone, Braintrust, Logfire) plus tertiary mentions of W&B Weave, MLflow Tracing, Comet Opik, and OpenLLMetry/OpenLIT in the broader landscape section.
- **2026-04-07 01:20** — TRIANGULATE complete. 14 claims verified with effective independent count ≥2; 4 contradictions resolved (LangSmith pricing tier-dependent, Helicone latency mode-dependent, AG2 vs MSAF separate products, Langfuse OTel compliance "experimental conformance"); 3 devil's advocate searches integrated as Limitations; anchoring bias check confirmed Agent D successfully de-anchored from initial LangSmith-centric framing.
- **2026-04-07 01:25** — OUTLINE_REFINEMENT complete. ~40% restructuring: added Standards & Ecosystem State (Section 1), Framework-Native Tracing (Section 2), Critical Risk Profile (Section 7), Decision Framework. Reordered Production Monitoring before Eval. Demoted detailed Ragas/DeepEval explainer to single section.
- **2026-04-07 01:50** — SYNTHESIZE complete. 14,830-word draft report written directly to research_report.md with 16 sections.
- **2026-04-07 02:00** — CRITIQUE complete. 4 critical, 7 important, 7 nuance findings. Gap-fill subagent dispatched and returned 3 critical corrections: (1) Claude Agent SDK release Sep 29 2025 (NOT March 2025 — high-confidence date hallucination caught); (2) Microsoft Agent Framework 1.0 GA shipped April 3 2026; (3) OTel GenAI semconv on 2026 roadmap as Unconfirmed candidate.
- **2026-04-07 02:15** — REFINE complete. Applied 10 critique fixes; added 5 new bibliography entries (3a, 29a, 29b, 56a, 56b); Helicone IDOR section corrected to admin/owner specificity and self-hosted-not-a-fix clarification; Decision Framework gained an OpenAI Agents SDK opt-out path.
- **2026-04-07 02:35** — VERIFY complete. 12 atomic claims through 2 citation verifier batches + 1 adversarial agent. Results: 9 VERIFIED, 1 QUESTIONABLE, 2 CONTRADICTED, 2 WITHSTOOD, 2 WEAKENED, 0 REFUTED, 0 UNVERIFIABLE. Triggered 1-of-2 REFINE loop-back cycles to fix: (a) Issue #2664 has 6 concepts not 5 — added "Agents"; (b) Langfuse stats 23.1M+ SDK installs (not 26M), removed unsupported "2,000+ paying customers"; (c) added [44b] for Series D companion blog; (d) softened AG2 "most complete" superlative across 3 sections; (e) reframed 79% MAST stat with author's own caveat about no dominant cause. Step 6 retry NOT triggered (single REFINE pass sufficient).
- **2026-04-07 02:40** — PACKAGE complete. Provenance sidecar written. Markdown-only output per task brief; HTML and PDF generation explicitly skipped. Acceptance criteria all MET. research-tasks.json status updated to completed.
