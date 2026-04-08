# Research Agent B — Practitioner/Applied Lens
## Topic: State of AI Agent Observability Tools (April 2026)

Lens: Practitioner/Applied — official platform documentation, customer case studies, engineering blog posts from production users.
Date: 2026-04-07

---

## LangSmith
- Docs URL: https://docs.langchain.com/langsmith/observability
- OTel docs: https://docs.langchain.com/langsmith/trace-with-opentelemetry
- Pricing: https://www.langchain.com/pricing-langsmith
- Last verified: 2026-04-07
- Tracing model: Primarily SDK-based (native langsmith Python/JS SDK with LangChain/LangGraph auto-instrumentation), AND native OTLP HTTP ingestion at `https://api.smith.langchain.com/otel`. Supports GenAI semantic convention attributes mapped to LangSmith run fields. EU endpoint: `eu.api.smith.langchain.com`.
- Multi-agent support: LangGraph framework integration first-class. Session-level tracing via `langsmith.trace.session_id` / `langsmith.trace.session_name` supports multi-turn/multi-agent grouping. Explicit agent-handoff span type not documented on OTel page. Framework integrations include CrewAI, Vercel AI SDK, Pydantic AI, OpenAI, Anthropic.
- Eval integration: Native evaluation framework with online evaluators, dashboards, rules, webhooks, feedback queues and annotation. New AI assistant "Polly" for trace analysis.
- Production monitoring: alerting=yes (dashboards + alerts + webhooks), drift=partial (via online evals/rules), cost=yes (token/usage attributes), SLO=not explicitly documented but enterprise SLA available.
- Pricing as of April 2026:
  - Developer: $0/seat/month, 5,000 base traces/mo included, 1 seat, 1 fleet agent, 50 fleet runs/mo, community support
  - Plus: $39/seat/mo, 10,000 base traces/mo included, unlimited seats, 1 dev-sized agent deployment, 500 fleet runs/mo, $0.05/fleet run overage, email support
  - Enterprise: custom pricing, hybrid/self-hosted available, SSO/RBAC/SLA
  - Base traces: $2.50 per 1,000 (14-day retention); Extended traces: $5.00 per 1,000 (400-day retention)
- Quantitative metrics: 5k free traces/mo Developer tier; 400-day extended retention tier documented.
- OTel GenAI conformance: Claimed — explicitly maps `gen_ai.operation.name`, `gen_ai.prompt.{n}.role`, `gen_ai.prompt.{n}.content`, `gen_ai.system`, `gen_ai.usage.*` to LangSmith fields. Also ingests TraceLoop, OpenInference, Logfire attributes.
- Direct quotes:
  - "When sending traces to LangSmith via OpenTelemetry, the following attributes are mapped to LangSmith fields." — https://docs.langchain.com/langsmith/trace-with-opentelemetry
  - "LangSmith works with many frameworks and providers" — https://docs.langchain.com/langsmith/observability
  - "$39 / seat per month then pay as you go" (Plus plan) — https://www.langchain.com/pricing-langsmith
- Notable caveats:
  - Multi-agent handoff representation not explicitly modeled; relies on session IDs.
  - "Fleet" concept (deployed agent runs) priced separately from traces — can be confusing.
  - Polly AI trace-analysis assistant is new as of 2026.
---

## Langfuse
- Docs URL: https://langfuse.com/docs/tracing
- OTel docs: https://langfuse.com/docs/opentelemetry/get-started
- Pricing: https://langfuse.com/pricing (Hobby/Core/Pro/Enterprise)
- Last verified: 2026-04-07
- Tracing model: SDK-first (Python, JS/TS, LangChain, LlamaIndex, OpenAI wrappers) with asynchronous batching ("Trace events are queued locally and flushed in batches, so your application's response time is not affected"). Also operates as a first-class OpenTelemetry backend via OTLP HTTP at `/api/public/otel` with Basic Auth. EU: `https://cloud.langfuse.com/api/public/otel`, US: `https://us.cloud.langfuse.com/api/public/otel`.
- Multi-agent support: Explicit guides for AutoGen, Semantic Kernel, CrewAI, LangGraph. Grouping via Sessions ("Group traces into sessions for multi-turn applications"). Distributed tracing via custom trace IDs. OpenInference and OpenLLMetry span attributes ingested and mapped to observation input/output. Agent spans can leverage `gen_ai.operation.name=agent` per GenAI semconv.
- Eval integration: Native LLM-as-a-Judge evaluators + datasets/experiments. First-party Ragas and DeepEval integration guides. Scores API for external evaluator results.
- Production monitoring: alerting=yes (webhooks, integrations), drift=partial (via scheduled evaluators), cost=yes (native token/cost tracking), SLO=support SLA included at Core tier and above.
- Pricing as of April 2026:
  - Hobby: $0/mo, 50k units/mo, 30-day retention, 2 users max, community support
  - Core: $29/mo, 100k units/mo, 90-day retention, unlimited users, in-app support, 48h SLO
  - Pro: $199/mo, unlimited units, unlimited history, SOC2/ISO27001
  - Enterprise: $2,499/mo, custom features, unlimited users
  - Overage: $8 per 100k units above included
- Self-host: Fully open source (MIT for core), self-hostable via Docker/Helm. Separate self-hosted Enterprise Edition with paid license for SSO, audit logs, RBAC.
- Quantitative metrics: 50k free units/mo (most generous OSS-cloud free tier among majors); batched/async ingestion claims no request-path overhead.
- OTel GenAI conformance: Claimed — "Langfuse aims to be compliant with the OpenTelemetry GenAI semantic conventions." Supports OpenInference (`input.value`, `output.value`), OpenLLMetry, and `gen_ai.*` attributes.
- Direct quotes:
  - "Langfuse aims to be compliant with the OpenTelemetry GenAI semantic conventions." — https://langfuse.com/docs/opentelemetry/get-started
  - "Langfuse can receive traces on the `/api/public/otel` (OTLP) endpoint." — https://langfuse.com/docs/opentelemetry/get-started
  - "Trace events are queued locally and flushed in batches, so your application's response time is not affected." — https://langfuse.com/docs/tracing
  - "It's also open source and can be self-hosted." — https://langfuse.com/docs/tracing
- Notable caveats:
  - Unit-based pricing (not trace-based) — one complex trace may consume multiple "units"; worth modeling actual workload.
  - Self-hosted enterprise features require paid commercial license; pure OSS lacks SSO/RBAC.
  - Multi-agent handoff visualization less mature than Phoenix's agent view.
---

## Arize Phoenix
- Docs URL: https://arize.com/docs/phoenix
- Pricing: https://phoenix.arize.com/pricing/
- OpenInference spec: https://github.com/Arize-ai/openinference/blob/main/spec/semantic_conventions.md
- Last verified: 2026-04-07
- Tracing model: Distributed tracing via OpenTelemetry (OTLP) using the **OpenInference** specification (Arize's open convention layered over OTel). Auto-instrumentation libraries cover LlamaIndex, LangChain, DSPy, Mastra, Vercel AI SDK, CrewAI, OpenAI, Bedrock, Anthropic. Client SDKs in Python, TypeScript, Java.
- Multi-agent support: First-class. OpenInference defines 10 span kinds via `openinference.span.kind`: LLM, EMBEDDING, CHAIN, RETRIEVER, RERANKER, TOOL, **AGENT** ("A span that encompasses calls to LLMs and Tools"), GUARDRAIL, EVALUATOR, PROMPT. Dedicated CrewAI auto-instrumentation. Handoff not a distinct kind — modeled as parent AGENT span with nested child AGENT/TOOL spans.
- Eval integration: Native Phoenix evals library — LLM-as-judge (pre-built templates for hallucination, relevance, toxicity, Q&A correctness), code-based evals, human annotations in UI. Third-party integrations: **Ragas, DeepEval, Cleanlab**.
- Production monitoring: alerting=yes (via Arize AX enterprise), drift=yes (Arize core strength — embedding drift, data drift), cost=yes (`llm.cost.*` USD-denominated attributes in OpenInference), SLO=enterprise only.
- Deployment modes: (a) local dev via `phoenix.launch_app()`, (b) Docker/Kubernetes self-host, (c) free Phoenix Cloud, (d) Arize AX enterprise platform.
- Pricing as of April 2026:
  - Phoenix OSS: **Free forever, Elastic License v2, no feature gates**
  - Phoenix Cloud: free hosted instance
  - Self-hosted infra: ~$50–500/mo (user-paid infra)
  - Arize AX (enterprise): ~$50k–100k/year
- Quantitative metrics: 10 span kinds defined in OpenInference; three SDK language targets; OSS GitHub repo `Arize-ai/phoenix` is widely starred.
- OTel GenAI conformance: Partial — Phoenix/OpenInference predates and overlaps with the OTel GenAI semconv. OpenInference uses `llm.*` attributes rather than `gen_ai.*`. Interoperability: Phoenix can ingest OTel GenAI-compliant traces but canonical format is OpenInference.
- Direct quotes:
  - "A span that encompasses calls to LLMs and Tools" (AGENT definition) — https://github.com/Arize-ai/openinference/blob/main/spec/semantic_conventions.md
  - "Phoenix will always remain free, open-source, and built by AI engineers for AI engineers." — https://phoenix.arize.com/pricing/
  - "we'll install both the CrewAI package and the OpenInference CrewAI auto-instrumentation package, which handles tracing for us without requiring manual instrumentation." — https://arize.com/docs/phoenix/tracing/llm-traces-1
- Notable caveats:
  - OpenInference `llm.*` attributes predate OTel GenAI `gen_ai.*` — dual-mapping may be needed when exporting to generic OTel backends.
  - Phoenix (OSS) vs Arize AX (paid) feature split can confuse new users; production alerting/drift dashboards sit in AX, not Phoenix.
  - No handoff-specific span kind; multi-agent topologies inferred from parent-child AGENT nesting.
---

## Helicone
- Docs URL: https://docs.helicone.ai
- Proxy vs Async ref: https://docs.helicone.ai/references/proxy-vs-async
- Pricing: https://www.helicone.ai/pricing
- Last verified: 2026-04-07
- Tracing model: **Two modes** — (1) Proxy/Gateway: `https://oai.helicone.ai/v1` style base URL swap (or Helicone AI Gateway, OSS, "OpenAI-compatible, unified API with access to 100+ models"); (2) Async: SDK-based logging off the critical path (OpenLLMetry-compatible), "0 Propagation Delay" and "Not on critical path." Gateway also exports OpenTelemetry logs/metrics/traces.
- Multi-agent support: Sessions feature — visualize multi-step agent workflows with session tracing. Not as feature-rich as LangSmith/Phoenix for agent graph visualization; emphasis is on gateway-level request capture.
- Eval integration: Native evals via custom properties and scores. Prompts, experiments, and online evaluation supported. No first-party Ragas/DeepEval documented; relies on custom scoring APIs.
- Production monitoring: alerting=yes (Pro+ "Alerts & reports"), drift=partial (via HQL queries), cost=yes (native, per-request cost computed with "no markup"), SLO=partial (uptime tracking, enterprise SLA).
- Pricing as of April 2026:
  - Hobby (Free): 10,000 requests/mo, 1 GB storage, 1 seat, 1 org
  - Pro: $79/mo, unlimited seats, alerts, HQL, usage-based overage
  - Team: $799/mo, 5 orgs, SOC-2 & HIPAA compliance
  - Enterprise: contact sales, custom MSA, SAML SSO, on-prem, bulk discounts
- Quantitative metrics: 10k free requests/mo; gateway claims very low latency overhead (sub-millisecond for non-critical-path async mode).
- OTel GenAI conformance: Partial/claimed via OpenLLMetry async integration and AI Gateway OTLP export. Historically used custom attribute format; migration to `gen_ai.*` in progress as of 2026 per industry-wide SIG adoption.
- Direct quotes:
  - "When you need a quick and easy setup" (proxy mode) — https://docs.helicone.ai/references/proxy-vs-async
  - "If you prefer the logging of events to be off the critical path, ensuring that network issues do not affect your application." (async mode) — https://docs.helicone.ai/references/proxy-vs-async
  - "10,000 free requests" (Hobby tier) — https://www.helicone.ai/pricing
  - "Pay exactly what providers charge, no hidden fees" — https://docs.helicone.ai/getting-started/quick-start
- Notable caveats:
  - Proxy mode adds Helicone as a single point of failure / latency hop on the critical path — use async mode for high-throughput production.
  - Free-tier request cap (10k) much lower than Langfuse's 50k unit cap — may run out quickly for agentic apps.
  - Multi-agent/handoff visualization less sophisticated than Phoenix or LangSmith.
  - AI Gateway is a distinct product from the observability SDK; some features only available with gateway routing.
---

## Braintrust
- Docs URL: https://www.braintrust.dev/docs
- Tracing docs: https://www.braintrust.dev/docs/guides/tracing
- Pricing: https://www.braintrust.dev/pricing
- Last verified: 2026-04-07
- Tracing model: SDK-first with auto-instrumentation ("Braintrust makes it easy to get started with auto-instrumentation, which traces your LLM calls with no per-call code changes."). Six native span types: `eval`, `task`, `llm`, `function`, `tool`, `score`. The `llm` span "shows the model, messages, parameters, token usage, and cost." OTel ingestion supported via the OTLP endpoint.
- Multi-agent support: Native agent framework integrations — "LangChain, LangGraph, CrewAI, Vercel AI SDK, Pydantic AI, DSPy, and many more." Span hierarchy with `task`/`tool`/`llm` nesting models agent workflows. No dedicated handoff span type.
- Eval integration: **Playground + Evals are the core product.** Native scorer framework (LLM-as-judge + code scorers), custom rubrics via Autoevals library, datasets with versioning, side-by-side experiment comparison. First-class prompt playground with multi-model comparison.
- Production monitoring: alerting=yes, drift=partial (via scheduled evals and online scoring), cost=yes (native), SLO=enterprise.
- Pricing as of April 2026:
  - Free: **1M trace spans/mo, unlimited users, 10k scores** — one of the most generous free tiers
  - Pro: $249/mo — unlimited spans, unlimited users, longer retention, best for teams up to ~5
  - Enterprise: custom — self-host/on-prem, advanced RBAC, high-volume data, dedicated support
- Quantitative metrics: 1M free spans/mo (vs Langfuse 50k units, LangSmith 5k traces, Helicone 10k requests) — best-in-class free tier for span volume. 10k free score evaluations/mo.
- OTel GenAI conformance: Partial — OTLP ingestion supported but native format centers on its own span types; GenAI semconv attributes accepted and mapped.
- Direct quotes:
  - "Braintrust makes it easy to get started with auto-instrumentation, which traces your LLM calls with no per-call code changes." — https://www.braintrust.dev/docs/guides/tracing
  - "The `llm` span shows the model, messages, parameters, token usage, and cost." — https://www.braintrust.dev/docs/guides/tracing
  - "Measure and improve AI application quality with playgrounds and evals." — https://www.braintrust.dev/docs
- Notable caveats:
  - Pro tier is per-workspace, not per-seat — cheaper for small teams but doesn't scale linearly with seat count.
  - Positioning is "evals-first, observability-second" — some production monitoring features (drift, SLOs) less mature than Arize AX.
  - Enterprise/on-prem gated behind sales.
---

## Pydantic Logfire (Entrant 1)
- Docs URL: https://pydantic.dev/logfire
- Pricing: https://pydantic.dev/pricing
- Last verified: 2026-04-07
- Tracing model: **OpenTelemetry-native from day one.** OTLP ingestion, vendor-agnostic by design. First-party SDKs for Python, JavaScript/TypeScript, and Rust; compatible with Go, Java, and other OTel-compliant languages. Built by the Pydantic team (of Pydantic data-validation fame).
- Multi-agent support: Tight Pydantic AI integration — "add one line — `logfire.instrument_pydantic_ai()` — to get full agent tracing automatically." Traces agent behavior, API requests, and database queries "in one unified trace." Multi-agent handoff visualization inherits from OTel span hierarchy; no proprietary handoff type.
- Eval integration: Not a core evals product — focus is observability and tracing. Can ingest evaluator results as spans but lacks dedicated dataset/experiment UI like Braintrust/Phoenix.
- Production monitoring: alerting=yes (dashboards, alerts), drift=partial, cost=yes (via OTel GenAI attributes), SLO=partial (uptime dashboards).
- Pricing as of April 2026:
  - Personal (Free): **10M logs/spans/metrics per month** — highest raw volume free tier
  - Team: $49/mo, 5 seats, 10M records included
  - Growth: $249/mo, unlimited seats
  - Enterprise: custom, self-hosting available
- Quantitative metrics: 10M free records/mo (vastly higher than LangSmith 5k, Helicone 10k, Langfuse 50k, Braintrust 1M spans). Leverages general-purpose structured logging at scale.
- OTel GenAI conformance: **Claimed full.** "Logfire is built on OpenTelemetry, giving you a unified view of logs, traces, and metrics with no vendor lock-in." "any framework with OTel instrumentation works automatically. No special Logfire integration needed."
- Direct quotes:
  - "Logfire is built on OpenTelemetry, giving you a unified view of logs, traces, and metrics with no vendor lock-in." — https://pydantic.dev/logfire
  - "add one line — logfire.instrument_pydantic_ai() — to get full agent tracing automatically." — https://pydantic.dev/logfire
  - "any framework with OTel instrumentation works automatically. No special Logfire integration needed." — https://pydantic.dev/logfire
- Notable caveats:
  - Weaker evals story than Braintrust/Phoenix/LangSmith — positioned as observability layer, not eval platform.
  - Unified "logs + traces + metrics" positioning (general-purpose OTel backend) may dilute LLM-specific ergonomics vs specialist tools.
  - Strongest fit if already using Pydantic AI as the agent framework.
---

## W&B Weave (Entrant 2)
- Docs URL: https://weave-docs.wandb.ai/
- Marketing: https://wandb.ai/site/weave
- Pricing: https://wandb.ai/site/pricing/
- GitHub: https://github.com/wandb/weave
- Last verified: 2026-04-07
- Tracing model: SDK-first (`weave.init()` + `@weave.op` decorators auto-trace Python functions and LLM calls). Also supports **OpenTelemetry ingestion** — "W&B now supports OpenTelemetry (OTel), allowing you to log traces via OpenTelemetry" with a Weave OTel endpoint keyed by API token + team + project. Framework integrations: CrewAI, OpenAI Agent SDK, DSPy 2.x, Google genai Python SDK, Google ADK.
- Multi-agent support: Explicit "traces, scorers, guardrails, and a registry" for agentic AI systems. First-class integrations with CrewAI, OpenAI Agent SDK, Google ADK (Agent Development Kit). Span nesting models agent workflows; no dedicated handoff span type.
- Eval integration: Native evaluation framework — scorers (LLM-as-judge + code), datasets, experiment comparison UI. Integrates with W&B Models/Experiments for fine-tuning feedback loops. Compare-with-baseline UI is a differentiator.
- Production monitoring: alerting=yes, drift=yes (inherits W&B strength in experiment tracking and ML drift monitoring), cost=yes (token/cost per op), SLO=enterprise only.
- Pricing as of April 2026:
  - Basic (Free): 1 GB Weave ingestion/mo, free tracked hours limit
  - Pro: 10 Model seats, 500 tracked hours/mo ($1/hr overage), 100 GB storage ($0.03/GB overage), 1.5 GB Weave ingestion/mo
  - Academic: Pro features free, 25 GB/mo Weave ingestion, up to 100 seats
  - Enterprise: custom
  - Weave ingestion billed monthly in arrears by volume
- Quantitative metrics: 1 GB free Weave ingestion (volume-based, not span-count). Academic tier at 25 GB/mo — most generous academic offering.
- OTel GenAI conformance: Claimed. Weave bridges "OpenTelemetry's standardized instrumentation with purpose-built AI tooling, offering unified observability to see service-level traces, LLM calls, and model evaluations in one place."
- Direct quotes:
  - "W&B Weave helps developers evaluate, monitor, and iterate continuously to deliver generative AI applications with confidence." — https://wandb.ai/site/weave
  - "W&B now supports OpenTelemetry (OTel), allowing you to log traces via OpenTelemetry" — per Weave OTel docs (Medium post from W&B)
  - "traces, scorers, guardrails, and a registry" — https://wandb.ai/site/agents/
- Notable caveats:
  - Weave data ingestion is **volume-metered (GB)**, not span-count — one verbose agent run can eat a large fraction of the 1 GB free tier quickly.
  - Pricing tightly coupled with W&B Models pricing; Weave is not sold standalone — teams without existing W&B investment face a larger commitment.
  - Strongest for teams already running W&B for ML experiments who want a unified platform.
---

## TASK STATUS SUMMARY
- T_a (LangSmith): done — core docs, OTel page, pricing page fetched; all fields populated
- T_b (Langfuse): done — tracing, OTel, pricing captured; self-host and cloud differentiated
- T_c (Arize Phoenix): done — docs, OpenInference span kinds spec, pricing; AGENT span kind confirmed
- T_d (Helicone): done — proxy vs async both covered, pricing, OTel notes
- T_e (Braintrust): done — tracing guide, 6 span types, pricing
- T_f (entrant 1, Pydantic Logfire): done — OTel-native positioning, Pydantic AI integration, pricing
- T_g (entrant 2, W&B Weave): done — SDK+OTel, agentic integrations, volume-metered pricing

