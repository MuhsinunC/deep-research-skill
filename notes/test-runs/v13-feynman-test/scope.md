# Phase 1: SCOPE — AI Agent Observability Tools (April 2026)

## Research Question (canonical)
What is the state of AI agent observability tools as of April 2026 — specifically for tracing, evaluation, debugging, and production monitoring of LLM-based agents (single-agent, multi-agent, and tool-calling workflows)?

## Sub-Questions
1. **SQ1 (Platform Comparison):** Which platforms lead in agent observability (LangSmith, LangFuse, Arize Phoenix, Helicone, Braintrust, others), and how do their tracing capabilities compare on dimensions like span model, OpenTelemetry/OTel support, sampling, ingest performance, and SDK breadth?
2. **SQ2 (Multi-Agent / Tool Calling):** How do these tools represent multi-agent and tool-calling workflows specifically, vs. generic LLM-call observability? What span models do they use for sub-agent spawns, hand-offs, tool invocations, and parallel branches?
3. **SQ3 (Eval Integration):** What evaluation frameworks integrate with these observability tools (DeepEval, Ragas, OpenAI Evals, custom rubrics, LLM-as-judge)? How tightly coupled vs. plug-in?
4. **SQ4 (Production Monitoring):** What production capabilities exist — alerting, drift detection, cost tracking, latency SLOs, PII/safety monitoring? How do they compare quantitatively (sampling overhead, ingest cost, latency budgets)?
5. **SQ5 (Gaps):** What gaps remain unaddressed in the agent observability landscape?

## Stakeholder Perspectives
- **AI engineers** building production agents — need accurate cost/latency/error attribution per tool call
- **ML platform teams** — need OTel-compatible signals for unified observability
- **Eval engineers / ML researchers** — need offline eval that ties to traced runs
- **SREs / on-call** — need alerting and SLOs, not just retrospective analysis
- **Compliance / safety teams** — need PII redaction, prompt-injection detection, audit trails

## Scope Boundaries

### IN SCOPE
- Open-source and commercial **agent-aware** observability platforms with documented production usage in 2025-2026
- Tracing, span/trace models, eval framework integration, alerting, drift, cost tracking, latency SLOs
- OpenTelemetry GenAI semantic conventions and how each platform conforms
- Direct comparison with quantitative metrics where available (overhead %, ingest p99, pricing)
- Multi-agent specifics: sub-agent spans, hand-offs, tool-call observability

### OUT OF SCOPE
- General APM tools (Datadog, New Relic) **unless** they have explicit GenAI/LLM features documented in 2025-2026
- Pure prompt-management tools without trace/eval coverage
- Toy/demo projects without production users
- Speculative roadmap features not yet shipped

### PRIORITY ORDER
1. Real production capabilities and known limitations (verified from primary docs)
2. Quantitative comparisons (overhead, throughput, cost) over qualitative descriptions
3. Recent (last 90 days, given tech half-life) over older signals — but use 2025 anchors for foundational architecture

## Assumptions to Validate
- Assumption A1: LangSmith, Langfuse, Arize Phoenix, Helicone, Braintrust are still the dominant agent observability platforms in April 2026 (vs being superseded by newer entrants like Logfire, Langtrace, Lunary, OpenLLMetry, Weights & Biases Weave).
- Assumption A2: OpenTelemetry GenAI semantic conventions have been released or significantly evolved through 2025-2026 and platforms claim conformance.
- Assumption A3: Eval frameworks (Ragas, DeepEval, etc.) integrate via SDK calls/adapters, not as platform-native primitives — except where the platform offers its own eval primitives (Braintrust, LangSmith).
- Assumption A4: Multi-agent observability is genuinely a distinct technical problem (not just generic LLM tracing) due to sub-agent fan-out, hand-off semantics, and concurrent tool calls.
- Assumption A5: Cost and overhead numbers are publishable (not all are — many vendors hide).

## Topic Domain Classification
- **Domain:** Technology / software (AI/ML observability)
- **Half-life:** 90 days (fast-moving — tools ship features monthly)
- **Implication:** Sources from January-April 2026 are gold; July-December 2025 are still relevant for architecture; pre-July 2025 are foundational only
- **Step 5 Supersession Check:** REQUIRED (90d half-life ≤ 90d gate)

## Topic-Specific Acceptance Criteria
These are checked at Phase 7.5 (VERIFY Step 4) and Phase 8 (PACKAGE).

- [ ] **AC1:** Comparison must explicitly cover at least 6 named platforms — including LangSmith, Langfuse, Arize Phoenix, Helicone, Braintrust, and at least one additional 2025-2026 entrant (e.g., Logfire, Weave, Langtrace, Lunary, Openlit/OpenLLMetry).
- [ ] **AC2:** Each named platform's tracing approach must cite the platform's own documentation (or published architecture/blog post) as a primary source — not third-party listicles.
- [ ] **AC3:** Multi-agent / tool-calling workflow handling must be explicitly addressed for at least 4 platforms with concrete details about span models or hand-off representation, not generic "supports agents" language.
- [ ] **AC4:** OpenTelemetry GenAI semantic conventions must be addressed: status as of April 2026, which platforms emit conformant signals, and known divergences.
- [ ] **AC5:** Evaluation framework integration must specifically address Ragas and DeepEval integration patterns for at least 3 observability platforms (named adapters or native support).
- [ ] **AC6:** Production monitoring must cover all four sub-dimensions (alerting, drift detection, cost tracking, latency SLOs) with concrete examples per platform — not just "supports alerts".
- [ ] **AC7:** Quantitative metrics (sampling overhead %, p99 ingest latency, free-tier limits, paid-tier $/M spans, etc.) must be cited for at least 3 platforms — preferring vendor-published or third-party benchmark numbers.
- [ ] **AC8:** Gaps section must identify at least 4 specific gaps, each tied to a concrete capability (e.g., "no platform offers in-trace evaluation triggering with feedback to live agents" — not "more work needed").

## Key Failure Modes to Watch
- **F1 (vendor marketing bias):** Vendor docs overstate capabilities; cross-reference with practitioner blog posts and GitHub issues.
- **F2 (stale snapshots):** A 6-month-old comparison post is already 2 half-lives stale. Apply temporal decay aggressively.
- **F3 (LangChain ecosystem bias):** LangSmith dominates web SEO due to LangChain's ecosystem. Actively seek non-LangChain perspectives (LlamaIndex, OpenAI Agents SDK, raw OpenTelemetry).
- **F4 (open-source vs hosted confusion):** Several tools (Phoenix, Langfuse) have free OSS + paid cloud tiers — must distinguish.
- **F5 (eval/observability conflation):** "Eval framework integration" can mean (a) adapter library, (b) native eval feature, (c) score storage. Must distinguish.

## Think2 EVALUATE
- **Sub-question count:** 5 well-formed sub-questions
- **Assumptions to validate:** 5 (all testable via primary sources)
- **Acceptance criteria:** 8 topic-specific items, all checkable
- **Failure modes identified:** 5 (vendor bias, staleness, LangChain bias, OSS/hosted confusion, eval conflation)
- **Coverage signal:** All four pillars from the question (tracing, eval, debugging, monitoring) addressed in sub-questions
- **Flag for PLAN:** When generating Phase 3 sub-agent assignments, ensure at least one lens explicitly looks at non-LangChain ecosystem tools (LlamaIndex, AutoGen, Anthropic's native SDK, OpenAI Agents SDK) to combat F3.
