# Research Agent A — Academic/Formal Lens
## Topic: State of AI Agent Observability Tools (April 2026)

Lens: Academic/formal, peer-reviewed and standards body sources. Prioritizes arXiv, OpenTelemetry specs, W3C, NeurIPS/ICML/EMNLP proceedings.

Date of research: 2026-04-07

---

## Semantic Conventions for GenAI Agent and Framework Spans (OpenTelemetry)
- URL: https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/
- Date: 2026 (current spec as of search)
- Source type: standards
- Credibility: 98
- Key claim: OTel GenAI agent span conventions define operation names such as `create_agent` and `invoke_agent`, specify span naming like `invoke_agent {gen_ai.agent.name}`, and prescribe span kind CLIENT (MAY be INTERNAL for in-process agents). These extend the base GenAI span conventions for agent-specific operations.
- Direct quote: "The gen_ai.operation.name SHOULD be invoke_agent, and the span name SHOULD be invoke_agent {gen_ai.agent.name} if gen_ai.agent.name is readily available. Span kind SHOULD be CLIENT and MAY be set to INTERNAL on spans representing invocation of agents running in the same process."
- Relevance: SQ1 — direct OTel GenAI conventions for agent spans; defines the formal span model for agent invocation and sub-agent fan-out semantics.
---

## Semantic Conventions for Generative AI Systems (OpenTelemetry landing)
- URL: https://opentelemetry.io/docs/specs/semconv/gen-ai/
- Date: 2026-current
- Source type: standards
- Credibility: 98
- Key claim: OTel GenAI Semantic Conventions are split across spans, metrics, events, and agent/framework spans — covering attributes, metric names, span names, span kinds, and units of measure for LLM/agent workloads.
- Direct quote: "Conventions include attributes, metric, span and event names, span kind and unit of measure."
- Relevance: SQ1, SQ4 — establishes the scoped structure (spans vs metrics vs events) of the standard for agent observability.
---

## Datadog LLM Observability natively supports OpenTelemetry GenAI Semantic Conventions (Datadog blog)
- URL: https://www.datadoghq.com/blog/llm-otel-semantic-convention/
- Date: 2026-03 (vicinity)
- Source type: vendor docs
- Credibility: 80
- Key claim: Datadog v1.37+ natively supports OTel GenAI Semantic Conventions, which is used as evidence that the conventions — though still experimental — have crossed into production-vendor conformance.
- Direct quote: "OpenTelemetry has released experimental GenAI Semantic Conventions to standardize how LLM spans are named and attributed across different tools."
- Relevance: SQ1 — indicates conformance status as of 2026: conventions are marked experimental but commercial vendors are aligning.
---

## AgentOps: Enabling Observability of LLM Agents (Dong et al.)
- URL: https://arxiv.org/html/2411.05285v2
- Date: 2024-11 (v2 revision)
- Source type: academic
- Credibility: 90
- Key claim: Proposes a DevOps-style paradigm ("AgentOps") that systematically traces agent artifacts — prompts, tool calls, plans, memory, feedback — and associates evaluation feedback directly with agent spans. Introduces explicit taxonomies of agent artifacts for observability.
- Direct quote: "keeping track of monitoring metrics like latency and cost, and associating feedback with agent spans"
- Relevance: SQ2, SQ3 — foundational academic treatment of what should be captured in an agent trace and how spans should be annotated with eval signals (eval-while-tracing precursor).
---

## XAgen: An Explainability Tool for Identifying and Correcting Failures in Multi-Agent Workflows
- URL: https://arxiv.org/html/2512.17896
- Date: 2025-12
- Source type: academic
- Credibility: 85
- Key claim: Identifies multi-agent observability as an open challenge distinct from single-LLM explainability — highlights that multi-agent systems generate "overwhelming amounts of text" from diverse roles, tool use, and inter-agent messages, and existing explainability approaches do not scale.
- Direct quote: "While early work has pioneered explainability for individual LLMs, it remains an open challenge for multi-agent systems, which are inherently more complex with multiple agents performing diverse roles, triggering tool use, and exchanging messages, generating overwhelming amounts of text."
- Relevance: SQ2, SQ5 — an academic critique motivating the need for richer span models that encode sub-agent fan-out and cross-agent message flows.
---

## Beyond Task Completion: An Assessment Framework for Evaluating Agentic AI Systems
- URL: https://arxiv.org/html/2512.12791v2
- Date: 2025-12
- Source type: academic
- Credibility: 85
- Key claim: Proposes telemetry modules that evaluate agents at runtime by capturing traces and metadata across multiple spans throughout the execution lifecycle, improving explainability by making decision-making interpretable.
- Direct quote: "telemetry modules that evaluate agents at runtime by capturing traces and metadata across multiple spans throughout the execution lifecycle"
- Relevance: SQ2, SQ3 — eval-while-tracing academic framing; ties spans to runtime evaluation signals.
---

## Evaluation and Benchmarking of LLM Agents: A Survey
- URL: https://arxiv.org/html/2507.21504v1
- Date: 2025-07
- Source type: academic
- Credibility: 85
- Key claim: Provides a taxonomy of LLM agent evaluation covering evaluation objectives and processes — useful as a bridge between eval methodology and observability instrumentation.
- Direct quote: (abstract summary) "a taxonomy of LLM agent evaluation covering evaluation objectives and processes"
- Relevance: SQ2 — structures the eval dimension that observability tools must capture.
---

## OTel GenAI Agent Spans — Primary Spec Extraction (WebFetch)
- URL: https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/
- Date: 2026-04 (current)
- Source type: standards (primary)
- Credibility: 99
- Key claim: Three GenAI agent operation names are formally defined — `create_agent`, `invoke_agent`, `execute_tool` — each currently at "Development" stability. Invoke agent spans are CLIENT (or INTERNAL for in-process) and carry attributes including `gen_ai.agent.name`, `gen_ai.agent.id`, `gen_ai.conversation.id`, `gen_ai.request.model`, `gen_ai.response.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`. Opt-in attributes include `gen_ai.input.messages`, `gen_ai.output.messages`, `gen_ai.tool.definitions`, `gen_ai.system_instructions`.
- Direct quote: "Instrumentations SHOULD populate conversation id when they have it readily available"
- Additional quote: "Stability status: All agent span conventions are marked Development."
- Relevance: SQ1 — authoritative conformance status. As of April 2026, the GenAI agent span conventions are still "Development" (not yet Stable), meaning production vendors align but the spec itself is not frozen. This directly answers the conformance question for T_a.
---

## Microsoft + Outshift Cisco OTel Multi-Agent Semantic Conventions (via AG2 blog summary)
- URL: https://docs.ag2.ai/latest/docs/blog/2026/02/08/AG2-OpenTelemetry-Tracing/
- Date: 2026-02-08
- Source type: vendor docs (secondary reporting of standards activity)
- Credibility: 78
- Key claim: Microsoft and Cisco/Outshift jointly proposed new OTel semantic conventions for multi-agent observability in early 2026, built on OTel and W3C Trace Context. These target standardized tracing of agent-to-agent (A2A) calls with shared trace IDs across HTTP boundaries.
- Direct quote: "AG2 propagates W3C Trace Context headers across HTTP calls in multi-agent systems using the Agent-to-Agent (A2A) protocol, so that client-side and server-side spans share a single trace ID."
- Relevance: SQ1, SQ3, SQ4 — indicates active GenAI Working Group activity on multi-agent extensions and directly addresses the "sub-agent fan-out" span model question.
---

## AgentOps Paper — Formal Span Model Extraction (WebFetch primary)
- URL: https://arxiv.org/html/2411.05285v2
- Date: 2024-11 (v2)
- Authors: Liming Dong, Qinghua Lu, Liming Zhu (Data61, CSIRO)
- Source type: academic (primary extraction)
- Credibility: 92
- Key claim: Dong et al. define an "agent trace" formally as "the entire process from the moment a user submits a goal achieving request to the point when the final result is delivered. This includes the reasoning process, the plan generated, the workflow along with its associated tasks, the knowledge retrieved, the tools invoked, the evaluation and guardrails applied, and multiple LLM calls." They propose a nine-span taxonomy: Agent, Reasoning, Planning, Workflow, Task, Tool, LLM, Evaluation, Guardrail. A systematic mapping study of 17 observability tools found only 5/17 support guardrail instrumentation and only 4/17 support customization.
- Direct quote (trace definition): "the entire process from the moment a user submits a goal achieving request to the point when the final result is delivered... the reasoning process, the plan generated, the workflow along with its associated tasks, the knowledge retrieved, the tools invoked, the evaluation and guardrails applied, and multiple LLM calls."
- Direct quote (gaps): authors note "Incomplete guardrails implementation (only 5 of 17 tools support this)" and "Missing data attributes regarding trace links and interactions between different steps."
- Relevance: SQ3, SQ5 — directly provides a formal definition of agent trace (SQ3), a nine-span academic taxonomy distinguishing tool/LLM/sub-agent operations, and an explicit academic critique (SQ5) of observability tool coverage. This is the single most load-bearing paper for the academic lens.
---

## OpenTelemetry Blog — AI Agent Observability: Evolving Standards and Best Practices
- URL: https://opentelemetry.io/blog/2025/ai-agent-observability/
- Date: 2025 (as labeled in URL)
- Source type: standards (OTel project blog)
- Credibility: 93
- Key claim: OTel project itself frames agent observability as an evolving area with "more robust semantic conventions to cover edge cases and emerging AI agent frameworks." Acknowledges that agent spans are an area of active WG development.
- Direct quote: "More robust semantic conventions to cover edge cases and emerging AI agent frameworks are expected to evolve in the coming period."
- Relevance: SQ1 — official OTel project confirmation that agent conventions remain experimental with active evolution.
---

## OTel Logs vs Traces for LLM Observability (Langfuse + OTel intro blog)
- URL: https://opentelemetry.io/blog/2024/llm-observability/
- Date: 2024 (OTel blog, still canonical)
- Source type: standards (OTel project blog)
- Credibility: 90
- Key claim: OTel community settled on a hybrid model: traces capture request-flow structure, logs (correlated by trace_id/span_id) capture raw prompt/response content, and events mark in-span state changes. Some conventions save LLM inputs/outputs as events rather than attributes — a consequential design decision because event-based I/O storage allows stable span cardinality while keeping large payloads accessible.
- Direct quote: "Some libraries/semantic conventions save LLM inputs and outputs as events rather than attributes."
- Relevance: SQ4 — primary standards-body position on the three-signal (trace/log/event) split for LLM observability. Key for SQ4 on OTel-Logs vs OTel-Traces.
---

## W3C Trace Context + OTel Propagation for MCP Agents (Glama)
- URL: https://glama.ai/blog/2025-11-29-open-telemetry-for-model-context-protocol-mcp-analytics-and-agent-observability
- Date: 2025-11-29
- Source type: blog (technical)
- Credibility: 70
- Key claim: W3C Trace Context is used as transport-agnostic carrier across MCP transports (stdio, HTTP, SSE). Tool calls must propagate parent Trace ID via W3C-standard headers (traceparent/tracestate) for end-to-end tracing.
- Direct quote: "The W3C Trace Context specification enables transport-agnostic context propagation that works with any MCP transport (stdio, HTTP, SSE), allowing distributed tracing across multiple processes."
- Relevance: SQ4 — shows W3C Trace Context as the foundational standard underlying MCP and A2A agent tracing in 2026.
---

## A Survey on AgentOps: Categorization, Challenges, and Future Directions (Wang et al.)
- URL: https://arxiv.org/html/2508.02121v1
- Date: 2025-08
- Authors: Zexin Wang, Jingjing Li, Quan Zhou, Haotian Si, Yuanhao Liu, Jianhui Li, Gaogang Xie, Fei Sun, Dan Pei, Changhua Pei
- Source type: academic (primary extraction via WebFetch)
- Credibility: 92
- Key claim: Formal definition of AgentOps as a four-phase framework (monitoring, anomaly detection, root cause analysis, resolution) with a three-category observability data model: Traditional (metrics/logs/traces per OTel), Model data (white-box: attention maps, token logits), and Checkpoint data (state snapshots for rollback). Establishes a two-dimensional anomaly taxonomy: 5 intra-agent (Reasoning, Planning, Action, Memory, Environment) and 6 inter-agent (Task Specification, Security, Communication, Trust, Emergent Behavioral, Termination). Reviewed 16+ tools including Langfuse, LangDB, Helicone, Phoenix, LangWatch, TruLens, HoneyHive.
- Direct quote (definition): "a comprehensive operational framework that encompasses the pre-execution, execution, and post-execution stages"
- Direct quote (differentiation): "agent systems differ significantly from traditional systems"
- Direct quote (state of tools): "Langfuse...the most active observability tool in the open-source community"
- Direct quote (gaps): identifies "Insufficient diversity in monitoring data collection", "No effective detection for emergent behavioral anomalies", and "Lack of termination anomaly mitigation strategies"
- Relevance: SQ2, SQ5 — most comprehensive academic critique of the 2025-2026 agent observability tool landscape. Directly answers T_e (critiques) and T_b (academic literature). Proposes that multi-agent observability requires extending beyond OTel's three signals with "Model data" and "Checkpoint data" categories — a concrete academic argument for gaps in current OTel GenAI conventions.
---

## AgentTrace: A Structured Logging Framework for Agent System Observability (AlSayyad, Huang, Pal)
- URL: https://arxiv.org/html/2602.10133
- Date: 2026-02-07
- Authors: Adam AlSayyad, Kelvin Yuxiang Huang, Richik Pal (equal contribution)
- Source type: academic (primary extraction via WebFetch)
- Credibility: 90
- Key claim: Proposes a schema-based logging formalization: L(S:E:C)→R, where S is surface (cognitive/operational/contextual), E is event content, C is metadata context, and R is the structured record. Four required properties: consistency, causality, fidelity, interoperability. Three instrumentation surfaces: Operational (method calls, args, returns, timing), Cognitive (LLM interactions, chain-of-thought, reasoning extraction), Contextual (HTTP, SQL, vector stores). AgentTrace exports to an OTel backend but argues for a richer schema beyond standard OTel spans.
- Direct quote (schema): "L(S:E:C)→R, where S denotes the surface (cognitive, operational, or contextual), E is the event content, C represents metadata context"
- Direct quote (properties): "consistency (schema-compliant representation), causality (temporal fidelity), fidelity (faithful to the agent's internal and external behavior), and interoperability (analysis-ready, framework-agnostic)"
- Direct quote (critique of AgentOps-style tools): "AgentOps... systems primarily target single-surface traces and lack a schema that unifies cognitive artifacts"
- Direct quote (critique of APM): "these methods are largely semantics-agnostic to agent intent and internal reasoning, offering limited causal linkage"
- Relevance: SQ3, SQ5 — provides a rigorous formal schema (SQ3) explicitly intended to be interoperable with OTel, and critiques both agent-specific and traditional APM tools (SQ5). The L(S:E:C)→R formalism is the most mathematically precise "agent trace" definition found.
---

## Evaluation-Driven Development and Operations of LLM Agents (arXiv 2411.13768v3)
- URL: https://arxiv.org/html/2411.13768v3
- Date: 2024-11 (v3 revision late 2025)
- Source type: academic
- Credibility: 88
- Key claim: Introduces "Evaluation-Driven Development and Operations" (EDDOps), a process model that unifies offline and online evaluation within a closed feedback loop. Argues that agent observability infrastructure must capture logs, metrics, traces, and events continuously and feed real-time insights back into offline redevelopment — formalizing "eval-while-tracing" as a first-class lifecycle concept rather than a post-hoc add-on.
- Direct quote: "The AgentOps Infrastructure underpins continuous evaluation by capturing logs, metrics, traces, and events across the agent's lifecycle, enabling dynamic performance diagnostics and retrospective analysis"
- Direct quote: "Online real-time monitoring mechanisms track user interactions, decision logs, and performance fluctuations, automatically flagging anomalies indicative of drift, hallucinations, or systemic failures"
- Relevance: SQ2 — formalizes the eval-while-tracing angle and argues for tight coupling between online telemetry and offline eval pipelines.
---

## Where LLM Agents Fail and How They Can Learn From Failures (arXiv 2509.25370)
- URL: https://arxiv.org/pdf/2509.25370
- Date: 2025-09
- Source type: academic
- Credibility: 88
- Key claim: Introduces AgentErrorTaxonomy, a modular classification of failure modes across four agent operational modules (memory, reflection, planning, action) plus system-level operations. Analyzes "hundreds of trajectories" decomposed into these modules to identify cascading failures where a single root-cause error propagates.
- Direct quote: "a modular classification of failure modes spanning memory, reflection, planning, action, and system-level operations, addressing the vulnerability to cascading failures where a single root-cause error propagates through subsequent decisions"
- Relevance: SQ2, SQ5 — provides an empirical failure taxonomy that observability tools must capture. Complements AgentOps survey by being trajectory-centric rather than tool-centric.
---

## Why Do Multi-Agent LLM Systems Fail? — MAST dataset (arXiv 2503.13657)
- URL: https://arxiv.org/abs/2503.13657
- Date: 2025-03
- Source type: academic
- Credibility: 88
- Key claim: Introduces MAST-Data (1,600+ annotated execution traces across 7 popular MAS frameworks) and the Multi-Agent System Failure Taxonomy (MAST) containing 14 unique failure modes. This is the first large-scale empirical corpus specifically for multi-agent failure analysis.
- Direct quote: "MAST-Data, a comprehensive dataset of 1600+ annotated traces across 7 popular MAS frameworks, along with the first Multi-Agent System Failure Taxonomy (MAST) containing 14 unique failure modes"
- Relevance: SQ2, SQ5 — empirical grounding for multi-agent observability requirements and explicit recognition that MAS failures are distinct from single-agent failures, requiring richer span models that capture inter-agent messages.
---

## DoVer: Intervention-Driven Auto Debugging for LLM Multi-Agent Systems (arXiv 2512.06749)
- URL: https://arxiv.org/html/2512.06749
- Date: 2025-12 (revised 2026)
- Source type: academic
- Credibility: 85
- Key claim: Frames multi-agent debugging as fundamentally harder than single-agent due to "long, branching interaction traces" and proposes intervention-driven debugging with active verification through targeted perturbations — suggesting passive tracing is insufficient and observability tools should support active intervention primitives.
- Direct quote: "Large language model-based multi-agent systems are challenging to debug because failures arise from long, branching interaction traces"
- Relevance: SQ5 — academic argument that passive OTel-style tracing is inadequate; motivates new capabilities in observability stacks.
---

## TraceCoder: Trace-Driven Multi-Agent Debugging Framework (arXiv 2602.06875)
- URL: https://arxiv.org/html/2602.06875
- Date: 2026-02
- Source type: academic
- Credibility: 82
- Key claim: Instruments code with diagnostic probes to capture fine-grained runtime traces, then conducts causal analysis on these traces to identify failure root cause. Demonstrates that causal analysis atop execution traces outperforms pure static analysis for agent-generated code.
- Direct quote: "instruments code with diagnostic probes to capture fine-grained runtime traces and conducts causal analysis on these traces to accurately identify the root cause of the failure"
- Relevance: SQ2, SQ3 — shows academic trend toward causal analysis layered on top of spans, implying span schemas must preserve causal edges (parent links + timing + content).
---

## How Do LLMs Fail In Agentic Scenarios? (arXiv 2512.07497)
- URL: https://arxiv.org/html/2512.07497v2
- Date: 2025-12
- Source type: academic
- Credibility: 80
- Key claim: Analyzes 900 execution traces from three representative models on the Kamiwaza Agentic Merit Index benchmark with fine-grained per-trial behavioral analysis, surfacing recurrent failure modes — providing empirical data that span content (not just structure) is essential for diagnosis.
- Direct quote: "analyzes 900 execution traces from three representative models... performing fine-grained, per-trial behavioral analysis to surface successful strategies and recurrent failure modes"
- Relevance: SQ2 — empirical support for content-rich span payloads (input/output messages, reasoning chains).
---

## OTel Blog — AI Agent Observability: Evolving Standards (primary extraction via WebFetch)
- URL: https://opentelemetry.io/blog/2025/ai-agent-observability/
- Date: 2025 (OTel project blog)
- Source type: standards (primary)
- Credibility: 96
- Key claim: The GenAI SIG (Special Interest Group) is the active WG within OTel driving three scopes: "LLM or model semantic conventions," "VectorDB semantic conventions," and "AI agent semantic conventions (a critical component within the broader GenAI semantic convention)." The SIG explicitly acknowledges the entire GenAI suite is still experimental as of the blog's writing. No public stability timeline or multi-agent-specific roadmap was published.
- Direct quote: "By establishing these conventions, we ensure that AI agent frameworks can report standardized metrics, traces, and logs, making it easier to integrate observability solutions."
- Direct quote: "continuous improvements to the AI agent semantic convention to refine the initial standard and address new challenges as AI agents evolve."
- Direct quote (status): "Experimental conventions already exist in OpenTelemetry for models at GenAI semantic convention"
- Relevance: SQ1 — authoritative statement on GenAI SIG WG activity and conformance. Confirms that as of April 2026, all agent span conventions remain **experimental/Development stability** and multi-agent conventions specifically have no published roadmap in the primary OTel blog source.
---

## Synthesis Notes (Academic Lens)

1. **OTel GenAI conformance status (T_a).** All three agent operations (`create_agent`, `invoke_agent`, `execute_tool`) are marked "Development" stability as of April 2026 per the primary spec. Vendors (Datadog v1.37+, Langfuse, Phoenix) align but the spec is not frozen. Microsoft + Cisco/Outshift proposed multi-agent extensions in early 2026, but no public roadmap confirms stability timelines.

2. **Academic literature density (T_b).** The 2024-2026 literature is dominated by (a) Dong et al.'s AgentOps paper (arXiv 2411.05285) as the foundational artifact taxonomy, (b) Wang et al.'s Survey on AgentOps (arXiv 2508.02121) as the most comprehensive tool-comparison, (c) AgentTrace (arXiv 2602.10133) as the most formal schema, and (d) a cluster of empirical failure-trace papers (arXiv 2503.13657, 2509.25370, 2512.07497, 2602.06875) that treat traces as the primary unit of analysis.

3. **Formal definition of "agent trace" (T_c).** Two competing academic formalisms exist:
   - **Dong et al. (2024)**: natural-language definition — a trace is "the entire process from the moment a user submits a goal achieving request to the point when the final result is delivered" instantiated as a nine-span taxonomy (Agent, Reasoning, Planning, Workflow, Task, Tool, LLM, Evaluation, Guardrail).
   - **AlSayyad et al. (2026)**: schema formalism L(S:E:C)→R with four required properties (consistency, causality, fidelity, interoperability) over three surfaces (operational, cognitive, contextual).

   Neither definition has been adopted as a W3C/OTel standard; both are compatible with the OTel span tree model but add semantic structure OTel does not mandate.

4. **Foundational standards (T_d).** W3C Trace Context remains the transport-agnostic propagation carrier (traceparent/tracestate headers) and is unchanged by GenAI conventions. OTel's three-signal model (traces/logs/events) is used differently in LLM contexts: prompts/completions are frequently stored as OTel **events** attached to spans rather than attributes, to keep span cardinality bounded while preserving replay fidelity.

5. **Academic critiques of tools (T_e).** Five lines of critique appear in the literature:
   - **Coverage gaps**: Dong et al. found only 5/17 tools supported guardrails, 4/17 customization.
   - **Single-surface limitation**: AlSayyad et al. critiqued AgentOps-style tools for targeting only operational or cognitive traces, not a unified schema.
   - **Semantics-agnostic APM**: traditional APM tools "offer limited causal linkage" for agent reasoning.
   - **Passive-only tracing**: DoVer and TraceCoder argue that passive observability is insufficient — active intervention primitives are needed.
   - **Multi-agent specifically**: XAgen and the MAST paper argue that existing tools do not capture inter-agent messages as first-class observability objects.

---

## TASK STATUS SUMMARY
- T_a (OTel GenAI conventions status): done — confirmed "Development" stability for all agent spans via primary spec fetch; GenAI SIG active; Microsoft+Cisco multi-agent extensions proposed Feb 2026; no stability timeline published. Sources: opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/, opentelemetry.io/blog/2025/ai-agent-observability/.
- T_b (academic literature on agent observability): done — eight arXiv papers surveyed spanning 2024-11 to 2026-02, including foundational (AgentOps, AgentTrace), survey (Wang 2025), and empirical failure-trace (MAST, AgentErrorTaxonomy, DoVer, TraceCoder).
- T_c (formal definitions of agent traces): done — two competing academic formalisms extracted verbatim (Dong nine-span taxonomy; AlSayyad L(S:E:C)→R schema). Neither is standardized.
- T_d (foundational standards W3C/OTel): done — W3C Trace Context propagation confirmed for MCP/A2A; OTel three-signal split with events-for-payloads pattern documented from primary OTel blog.
- T_e (academic critiques of tools): done — five distinct critique lines identified and sourced from peer-reviewed/primary arXiv papers (coverage gaps, single-surface, semantics-agnostic APM, passive-only tracing, multi-agent message gaps).


