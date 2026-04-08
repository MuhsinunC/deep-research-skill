# Retrieval Findings (Opus)
Started: 2026-04-07 08:48 EDT
Topic: Production deployment patterns for LLM agents in 2025-2026
Lens: Academic / Practitioner hybrid

## Source 1
- Title: Where LLM Agents Fail and How They Can Learn From Failures
- URL: https://arxiv.org/abs/2509.25370
- Date: 2025-09-29
- Type: Academic paper (arXiv)
- Credibility: 92/100
- Key finding: The paper formalizes "cascading failures, where a single root-cause error propagates through subsequent decisions, leading to task failure," and introduces AgentErrorTaxonomy plus AgentDebug, a framework that "isolates root-cause failures and provides corrective feedback, enabling agents to recover and iteratively improve" — achieving up to 26% relative improvement in task success. Authors: Zhu, Liu, Li et al. (Stanford, UIUC, AMD).

## Source 2
- Title: Why Do Multi-Agent LLM Systems Fail?
- URL: https://arxiv.org/abs/2503.13657
- Date: 2025-03-17 (latest revision 2025-10-26)
- Type: Academic paper (arXiv) — UC Berkeley team incl. Matei Zaharia, Ion Stoica, Joseph Gonzalez
- Credibility: 95/100
- Key finding: Introduces MAST (Multi-Agent System failure Taxonomy) covering "14 unique modes" across three clusters: system design issues, inter-agent misalignment, and task verification. Validated on 1,600+ annotated traces with kappa = 0.88. Concludes that "identified failures require more sophisticated solutions" — current orchestration approaches inadequately address multi-agent failures across GPT-4, Claude 3, Qwen2.5, and CodeLlama.

## Source 3
- Title: How Do LLMs Fail In Agentic Scenarios? A Qualitative Analysis of Success and Failure Scenarios
- URL: https://arxiv.org/abs/2512.07497
- Date: 2025-12-08
- Type: Academic paper (arXiv)
- Credibility: 85/100
- Key finding: Identifies four recurring failure archetypes from 900 execution traces: "premature action without grounding, over-helpfulness that substitutes missing entities, vulnerability to distractor-induced context pollution, and fragile execution under load." Concludes "reliable enterprise deployment requires not just stronger models but deliberate training and design choices that reinforce verification, constraint discovery, and adherence to source-of-truth data."

## Source 4
- Title: Measuring Agents in Production
- URL: https://arxiv.org/abs/2512.04123
- Date: 2025-12-02 (revised 2026-02-03)
- Type: Academic paper (arXiv) — 25 authors, large-scale practitioner survey
- Credibility: 93/100
- Key finding: Survey of 306 practitioners across 26 domains plus 20 case studies. Concrete numbers: "68% execute at most 10 steps before human intervention," "70% rely on prompting off-the-shelf models instead of weight tuning," "74% depend primarily on human evaluation." Headline: "Reliability (consistent correct behavior over time) remains the top development challenge, which practitioners currently address through systems-level design."

## Source 5
- Title: AI Agent Observability — Evolving Standards and Best Practices
- URL: https://opentelemetry.io/blog/2025/ai-agent-observability/
- Date: 2025-03-06
- Type: Open-source standards documentation (OpenTelemetry blog) — authors at IBM and Google
- Credibility: 95/100
- Key finding: Documents two formal semantic convention initiatives now in flight: the finalized Agent Application Convention and the in-development Agent Framework Convention designed to establish "standardized metrics, traces, and logs, making it easier to integrate observability solutions" across CrewAI, AutoGen, LangGraph and others. Identifies built-in vs external instrumentation paths and warns of "version lock-in if the framework's OpenTelemetry dependencies lag behind upstream updates."

## Source 6
- Title: Datadog LLM Observability Natively Supports OpenTelemetry GenAI Semantic Conventions
- URL: https://www.datadoghq.com/blog/llm-otel-semantic-convention/
- Date: 2025-12-01
- Type: Vendor engineering blog (Datadog)
- Credibility: 82/100
- Key finding: Datadog "natively supports OpenTelemetry GenAI Semantic Conventions (v1.37 and up)," letting teams "send GenAI spans directly into Datadog LLM Observability without duplicating instrumentation" via OTel Collector or direct OTLP export. Adds enterprise governance: "apply processors for redaction, sampling, enrichment, and routing so your data policies are enforced before telemetry data leaves your network." Marks the GenAI semantic conventions transitioning from spec to vendor-shipped reality.

## Source 7
- Title: AI Agents Observability with OpenTelemetry and the VictoriaMetrics Stack
- URL: https://victoriametrics.com/blog/ai-agents-observability/
- Date: 2025-11-07
- Type: Vendor engineering blog (VictoriaMetrics)
- Credibility: 78/100
- Key finding: Argues that "the large number of interactions, with an emphasis on speed and cost, makes distributed tracing the primary observability signal for understanding an agent's 'thought process'" — a notable inversion of traditional metrics-first observability. Identifies a "Developer Experience Gap" because AI practitioners come from data science rather than distributed systems backgrounds. Compares OpenLLMetry, OpenInference, and OpenLIT auto-instrumentation across 35+ frameworks.

## Source 8
- Title: What 1,200 Production Deployments Reveal About LLMOps in 2025
- URL: https://www.zenml.io/blog/what-1200-production-deployments-reveal-about-llmops-in-2025
- Date: 2025-12-19
- Type: Practitioner analysis / engineering blog (ZenML, Alex Strick van Linschoten)
- Credibility: 88/100
- Key finding: Synthesis of 1,200 production case studies. Key patterns: "Leaner contexts make models smarter, not just faster and cheaper"; safety logic is being moved out of prompts and into infrastructure ("session tainting protocols, dual-layer permission systems, and API-based authorization"); the most common failure pattern is infinite agent loops (cites GetOnStack's $47,000 cost spike from undetected recursion); evals have become "the new unit tests." Bottom line: "The experimentation phase has ended. The engineering phase has begun."

## Source 9
- Title: Durable Execution Meets AI: Why Temporal Is the Perfect Foundation for AI Agents
- URL: https://temporal.io/blog/durable-execution-meets-ai-why-temporal-is-the-perfect-foundation-for-ai
- Date: 2025-07-10
- Type: Vendor engineering blog (Temporal — Cornelia Davis, Sr. Staff Developer Advocate)
- Credibility: 80/100
- Key finding: Frames AI agents as "distributed systems on steroids" due to remote API dependencies. Core failure-recovery argument: "Activities automatically retry those requests until conditions allow for completion...you don't write the retry logic; that behavior is handled by Temporal." Temporal records "a full Event History — every single time code in the Workflow is run, every single time an Activity is called," which lets agents "pick up where it left off" after a crash without manual checkpointing. Captures the durable-execution pattern that's reshaping how production agents handle long-horizon failures.

## Source 10
- Title: Temporal and OpenAI Launch AI Agent Durability with Public Preview Integration
- URL: https://www.infoq.com/news/2025/09/temporal-aiagent/
- Date: 2025-09-18
- Type: Engineering news (InfoQ)
- Credibility: 83/100
- Key finding: Documents Temporal's public preview integration with the OpenAI Agents SDK, providing "built-in retry logic, state persistence, and crash recovery" for agent workflows. The integration "captures every agent interaction — including LLM calls and tool executions — within deterministic workflows" and allows the system to "automatically replay and restore the agent's exact state after a crash, timeout, or network failure." Significant because it represents a major framework vendor (OpenAI) officially endorsing durable-execution as the production substrate.

## Source 11
- Title: Enterprise AI Agent Playbook: What Anthropic and OpenAI Reveal About Building Production-Ready Systems
- URL: https://workos.com/blog/enterprise-ai-agent-playbook-what-anthropic-and-openai-reveal-about-building-production-ready-systems
- Date: 2025 (engineering blog)
- Type: Vendor/practitioner engineering blog (WorkOS)
- Credibility: 72/100
- Key finding: Synthesizes Anthropic's and OpenAI's published agent guidance into deployment patterns: routing, parallelization, orchestrator-workers, evaluator-optimizer. Reinforces Anthropic's official stance that "the most successful agent implementations use simple, composable patterns rather than complex frameworks" and that production deployments require explicit guardrails because of agents' "potential for higher costs and compounding errors."

## Summary
- Total sources: 11
- Average credibility: 85.7/100
- Source type breakdown: 4 academic (arXiv), 1 open-source standards doc (OpenTelemetry), 4 vendor engineering blogs (Datadog, VictoriaMetrics, Temporal, WorkOS), 1 engineering news (InfoQ), 1 practitioner deployment analysis (ZenML)
- Date distribution: all sources 2025-03 through 2026-02 — well-anchored to the 2025-2026 window
- Coverage gaps:
  - Limited material on cost-control patterns specifically (token budgets, circuit breakers) beyond anecdotes
  - Few primary sources on multi-cloud / sovereign-deployment patterns
  - Anthropic's "Building Effective Agents" canonical post is technically Dec 2024 (excluded from in-window count) but its patterns are referenced via Source 11
  - Sparse academic coverage on the orchestrator-as-code vs orchestrator-as-graph debate (Temporal's "fallacy of the graph" thesis surfaces only in vendor material)
  - No deep coverage of security/threat-model papers for tool-calling agents in production

## Cross-cutting themes (lens synthesis)
1. **Reliability is the #1 production concern** (Sources 1, 2, 3, 4, 8) — and academia and practitioners agree it's a systems-level problem, not a model-quality problem.
2. **OpenTelemetry GenAI semantic conventions are the convergence point** for observability (Sources 5, 6, 7) — moving from draft to vendor-shipped reality during 2025.
3. **Durable execution (Temporal, Restate) is emerging as the dominant failure-recovery substrate** (Sources 9, 10) — endorsed by OpenAI's official Agents SDK integration.
4. **Guardrails are migrating from prompts to infrastructure** (Sources 8, 11) — session tainting, permission systems, API-level authorization replacing prompt-based safety.
5. **Failure taxonomies are converging** (Sources 1, 2, 3) — academic taxonomies (MAST, AgentErrorTaxonomy, the four KAMI archetypes) all point to root-cause propagation, inter-agent misalignment, and grounding failures as the dominant production failure modes.

## TASK STATUS SUMMARY
- T1: done (found 11 sources, all 2025-2026, average credibility 85.7/100)
