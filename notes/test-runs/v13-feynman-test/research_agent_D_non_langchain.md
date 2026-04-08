# Research Agent D — Non-LangChain Ecosystem Observability

**Lens:** Non-LangChain ecosystem (combat LangChain SEO bias)
**Topic:** AI agent observability tools as of April 2026
**Date started:** 2026-04-07

---

## LlamaIndex
- Source URL: https://developers.llamaindex.ai/python/framework/module_guides/observability/instrumentation/
- Source URL: https://signoz.io/docs/llamaindex-observability/
- Source URL: https://www.llamaindex.ai/blog/observability-in-agentic-document-workflows
- Date: 2026-04-07
- Native observability features: LlamaIndex ships an **instrumentation module** (added in v0.10.20) that replaces the older `callbacks` module. It emits events and tracks spans for LLM calls, agents, RAG pipeline components, and tool calls. Callbacks module is deprecated during transition.
- Recommended observability platforms: Arize Phoenix (OpenInference, first-class integration), Langfuse, MLflow Tracing (one-click instrumentation), SigNoz (native OTel), Agenta.
- OTel support: **Native via OpenInference / OTel bridges**. SigNoz docs describe OTel-based tracing of all LlamaIndex events. MLflow Tracing is OpenTelemetry-based with "one-click instrumentation for LlamaIndex".
- Multi-agent support: Event-based spans cover agents, tools, and handoffs; RAG retrieval steps are captured as child spans.
- Direct quotes: "The new instrumentation module allows for the instrumentation of llama-index applications... is meant to replace the legacy callbacks module." "OpenTelemetry integration traces all the events produced by pieces of LlamaIndex code, including LLMs, Agents, RAG pipeline components and many more."
- Limitations: Callback module still supported in parallel during deprecation window, causing documentation fragmentation. Native UI/dashboard = none; requires third-party backend.
---

## OpenAI Agents SDK
- Source URL: https://openai.github.io/openai-agents-python/tracing/
- Source URL: https://grafana.com/blog/observing-agentic-ai-workflows-with-grafana-cloud-opentelemetry-and-the-openai-agents-sdk/
- Source URL: https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/monitor-openai-agents-sdk-with-application-insights/4393949
- Date: 2026-04-07
- Native observability features: **Built-in tracing is enabled by default**, capturing LLM generations, tool calls, handoffs, guardrails, and custom events. Traces are sent to OpenAI's backend where they can be viewed in a built-in traces dashboard. Supports `add_trace_processor()` (additional processors) and `set_trace_processors()` (replace default, stop sending to OpenAI).
- Recommended observability platforms: Langfuse (cookbook example), Grafana Cloud (OTel-bridge blog), Arize AX, Microsoft Azure Application Insights / Azure AI Foundry, Logfire.
- OTel support: **Adapter pattern** — Agents SDK emits its own trace format; third-party `openinference-instrumentation-openai-agents` package (and the Azure/Grafana integrations) converts and exports as OTel spans. Not natively OTel yet but pluggable.
- Multi-agent support: First-class — tracing explicitly captures **handoffs** between agents, tool calls, and guardrails. Microsoft is adding new OTel semantic conventions specifically for multi-agent observability.
- Direct quotes: "The Agents SDK includes built-in tracing, collecting a comprehensive record of events during an agent run: LLM generations, tool calls, handoffs, guardrails, and even custom events." "By default, tracing is enabled and sent to OpenAI's backend... You can add additional trace processors... set_trace_processors() lets you replace the default processors."
- Limitations: Default backend is OpenAI's proprietary traces dashboard; to use OSS you must replace processors. OTel export is via third-party adapter, not natively wired.
---

## Anthropic Claude Agent SDK
- Source URL: https://langfuse.com/integrations/frameworks/claude-agent-sdk
- Source URL: https://platform.claude.com/docs/en/agent-sdk/overview
- Source URL: https://github.com/anthropics/claude-agent-sdk-python
- Source URL: https://github.com/TechNickAI/claude_telemetry
- Date: 2026-04-07
- Native observability features: Claude Agent SDK (released March 2025) lists "Tracing" as a first-party feature alongside Tool Use, Orchestration Loops, and Guardrails. The SDK respects standard OTEL environment variables (`OTEL_LOGS_EXPORTER`, `OTEL_METRICS_EXPORTER`, `OTEL_TRACES_EXPORTER`) — an April 2026 release note references a crash fix for when these are set to `none`, confirming built-in OTel emitter.
- Recommended observability platforms: **Langfuse** (notebook explicitly captures Claude Agent SDK traces via OTel, including tool calls and model I/O), LangSmith (`configure_claude_agent_sdk()` helper), Portkey (cost/token/latency), Logfire / Sentry / Honeycomb / Datadog (via `claude_telemetry` drop-in CLI wrapper).
- OTel support: **Native** — uses OTEL_* env vars directly. The `claude_telemetry` project is an OTel wrapper for Claude Code CLI specifically; the Python SDK itself emits OTel spans when configured.
- Multi-agent support: Tool use and orchestration loops are first-class; sub-agent spans appear under parent agent. Todo-tracking is a documented feature that traces hierarchical task lists.
- Direct quotes: "A notebook demonstrates how to capture detailed traces from the Claude Agent SDK with Langfuse using OpenTelemetry. Traces include all tool calls and model inputs/outputs." "Recent fixes in April 2026 addressed a crash when OTEL_LOGS_EXPORTER, OTEL_METRICS_EXPORTER, or OTEL_TRACES_EXPORTER environment variables are set to none."
- Limitations: No Anthropic-hosted trace UI (unlike OpenAI's traces dashboard) — users must bring their own OTel backend. Documentation lives primarily with third-party integrators (Langfuse, Portkey), not Anthropic's own docs.
---

## Microsoft AutoGen / AG2
- Source URL: https://docs.ag2.ai/latest/docs/blog/2026/02/08/AG2-OpenTelemetry-Tracing/
- Source URL: https://microsoft.github.io/autogen/stable/user-guide/core-user-guide/framework/telemetry.html
- Source URL: https://signoz.io/docs/autogen-observability/
- Source URL: https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/
- Date: 2026-04-07
- Native observability features: **AG2 has built-in OpenTelemetry tracing as of Feb 2026** — every conversation, agent turn, LLM call, tool execution, and speaker selection is captured as a structured span connected by a shared trace ID. Four instrumentation functions: (1) single `ConversableAgent`, (2) global LLM calls, (3) group-chat Patterns (`AutoPattern`, `RoundRobinPattern`), (4) `A2aAgentServer` for distributed tracing across services.
- Recommended observability platforms: Any OTel-compatible backend — SigNoz has specific AutoGen docs; Phoenix, Langfuse, Grafana, Jaeger, Honeycomb all work via OTel protocol.
- OTel support: **Native** — AG2 emits spans directly using **OpenTelemetry GenAI Semantic Conventions**. No adapter required.
- Multi-agent support: Best-in-class — the group-chat Pattern instrumenter automatically instruments all agents in the pattern, the GroupChatManager, and speaker selection. A2A server instrumentation handles distributed multi-agent deployments across service boundaries.
- Direct quotes: "AG2 now has built-in OpenTelemetry tracing that gives you full visibility into your multi-agent workflows, with every conversation, agent turn, LLM call, tool execution, and speaker selection captured as a structured span connected by a shared trace ID." "Spans carry rich attributes following the OpenTelemetry GenAI Semantic Conventions: model name, provider, token usage, cost, temperature, tool call arguments and results."
- Limitations: AutoGen has fragmented into two lineages — (1) AG2 (community fork, best OTel story) and (2) Microsoft Agent Framework (convergence of old AutoGen + Semantic Kernel, production-ready). Users face migration decisions; telemetry APIs differ between the two.
---

## CrewAI
- Source URL: https://docs.crewai.com/en/observability/openlit
- Source URL: https://pypi.org/project/opentelemetry-instrumentation-crewai/
- Source URL: https://signoz.io/docs/crewai-observability/
- Source URL: https://www.langtrace.ai/blog/crewai-tracing-with-ibm-instana-and-langtrace
- Date: 2026-04-07
- Native observability features: CrewAI follows a pattern of built-in instrumentation that emits telemetry using OpenTelemetry semantic conventions. The `opentelemetry-instrumentation-crewai` PyPI package provides auto-instrumentation. CrewAI official docs include an "Observability" section with first-class OpenLIT integration guide.
- Recommended observability platforms: **OpenLIT** (first-class, one-line integration in CrewAI docs), Langtrace (IBM Instana partnership), SigNoz (OTel backend), Arize Phoenix (via OpenInference instrumentors), Braintrust (via `BraintrustSpanProcessor`), Grafana Cloud.
- OTel support: **Native + adapter** — CrewAI emits OTel spans via `opentelemetry-instrumentation-crewai`; OpenLIT auto-instruments with no manual span creation.
- Multi-agent support: Captures crew-level spans (role assignments, task delegation, agent conversations). LLM provider needs its own OpenInference instrumentor installed alongside CrewAI instrumentor.
- Direct quotes: "OpenLIT is an OpenTelemetry-native SDK for instrumenting GenAI workloads and supports dozens of frameworks, including CrewAI. The SDK automatically instruments supported libraries with no manual span creation required and can be added with a single line of code." "Depending on which LLM provider you're using with CrewAI, you'll need to install the corresponding OpenInference instrumentor to track LLM-related traces."
- Limitations: User must combine CrewAI instrumentor + LLM-provider instrumentor (double install). Semantic conventions for multi-agent handoffs still evolving — GenAI semconv group is actively iterating.
---

## Raw OTel GenAI Emitters (OpenInference, OpenLLMetry, OpenLIT)
- Source URL: https://github.com/Arize-ai/openinference
- Source URL: https://github.com/traceloop/openllmetry
- Source URL: https://openlit.io
- Source URL: https://opentelemetry.io/docs/specs/semconv/gen-ai/
- Date: 2026-04-07
- Native observability features:
  - **OpenInference (Arize)**: Set of conventions + plugins complementary to OpenTelemetry for tracing AI apps. Emits spans for LLM invocations, vector-store retrieval, tools, and external APIs. Umbrella project shipping separate `openinference-instrumentation-<framework>` packages (LlamaIndex, OpenAI Agents SDK, CrewAI, DSPy, Haystack, Anthropic SDK, Bedrock, etc.).
  - **OpenLLMetry (Traceloop)**: Apache-2.0 extensions on top of OpenTelemetry for "complete observability over LLM applications". Ships instrumentations for OpenAI, Anthropic, Cohere, LlamaIndex, LangChain, and vector DBs. Exports to any OTel backend (Datadog, Honeycomb, etc.).
  - **OpenLIT**: Open-source OTel-native platform with unified traces + metrics UI, single-line auto-instrumentation for "dozens of frameworks". Also ships its own web UI.
- Recommended observability platforms: All three emit standard OTLP, so they work with Jaeger, Tempo, SigNoz, Honeycomb, Datadog, New Relic, Grafana, Dynatrace, Arize Phoenix, Langfuse.
- OTel support: **These ARE the OTel layer** — they exist precisely to emit OTel-compliant spans for GenAI workloads. They adopt/contribute to the official [OpenTelemetry GenAI Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) (still experimental but actively adopted).
- Multi-agent support: Varies — OpenInference has per-framework instrumentors that capture agent handoffs where the framework exposes them (OpenAI Agents SDK handoffs, CrewAI task delegation). OpenLLMetry is more LLM-call-centric. OpenLIT covers the broadest catalog but has less deep multi-agent semantic modeling.
- Direct quotes: "OpenLLMetry is a set of extensions built on top of OpenTelemetry that gives you complete observability over your LLM application... it uses OpenTelemetry under the hood, it can be connected to your existing observability solutions — Datadog, Honeycomb, and others." "OpenInference is a set of conventions and plugins that is complimentary to OpenTelemetry to enable tracing of AI applications." "OpenLLMetry has just shipped two innovations... Hub, an LLM gateway that centralizes standardized OpenTelemetry spans for LLM traffic, and an MCP server that bridges production telemetry into developer tooling."
- Limitations: GenAI semantic conventions are still marked experimental in OTel spec — projects have diverged slightly. OpenInference and OpenLLMetry sometimes emit overlapping but not identical attributes, creating portability friction. Requires picking one (or living with double instrumentation).
---

## Multi-Framework Observability Platforms (MLflow Tracing, Comet Opik, Phoenix, Langfuse)
- Source URL: https://github.com/comet-ml/opik
- Source URL: https://www.comet.com/docs/opik/
- Source URL: https://github.com/Arize-ai/phoenix
- Source URL: https://langfuse.com/faq/all/best-phoenix-arize-alternatives
- Source URL: https://developers.llamaindex.ai/python/framework/module_guides/observability/ (MLflow mention)
- Date: 2026-04-07
- Native observability features:
  - **MLflow Tracing**: OpenTelemetry-based tracing built into the MLflow OSS platform. "One-click instrumentation" for LlamaIndex; also auto-instruments OpenAI, LangChain, DSPy, AutoGen. Traces are persisted in the MLflow tracking backend alongside experiments/runs, making it useful for teams already on MLflow for classical ML.
  - **Comet Opik** (Apache 2.0): "Debug, evaluate, and monitor your LLM applications, RAG systems, and agentic workflows." Multiple SDKs (Python, TypeScript), OTel support, REST API. Feature set: tracing with cost tracking, built-in eval metrics (hallucination, moderation, relevance), prompt management with version control, and an agent optimizer SDK for automated prompt tuning. Claims "enterprise features from day one".
  - **Arize Phoenix** (open-source): Vendor/language agnostic. Out-of-the-box support for **OpenAI Agents SDK, Claude Agent SDK, LangGraph, Vercel AI SDK, Mastra, CrewAI, LlamaIndex, DSPy**. Ships 10 span kinds: CHAIN, LLM, TOOL, RETRIEVER, EMBEDDING, AGENT, RERANKER, GUARDRAIL, EVALUATOR (plus others). Managed sibling is Arize AX.
  - **Langfuse** (open-source): Framework-agnostic, OTel-compliant. Has one of the broadest integration ecosystems — native integrations for LlamaIndex, Claude Agent SDK, OpenAI Agents SDK, AutoGen/AG2, CrewAI, and more. Captures prompts, tool calls, tokens, latency, cost.
- Recommended observability platforms: These ARE the platforms. Interoperate via OTLP so teams can switch without re-instrumenting.
- OTel support:
  - MLflow Tracing → **Native OTel**
  - Opik → **Native OTel + proprietary SDK**
  - Phoenix → **Native OTel via OpenInference**
  - Langfuse → **Native OTel**
- Multi-agent support:
  - Phoenix has explicit AGENT span kind + GUARDRAIL span + tool spans (best modeling for agent hierarchies, including handoffs)
  - Opik has "agentic workflows" as a first-class concept with a dedicated agent optimizer SDK
  - Langfuse supports nested spans for agent trees and has cookbooks for OpenAI Agents SDK handoffs + AG2 group chats
  - MLflow Tracing relies on underlying framework instrumentation; multi-agent modeling depends on the emitter (e.g., OpenInference for Agents SDK)
- Direct quotes: "Phoenix is vendor and language agnostic with out-of-the-box support for popular frameworks including OpenAI Agents SDK, Claude Agent SDK, LangGraph, Vercel AI SDK, Mastra, CrewAI, LlamaIndex, and DSPy." "Opik is an open-source platform designed to streamline the entire lifecycle of LLM applications... with a feature set covering the full stack: tracing with cost tracking, built-in evaluation metrics (hallucination, moderation, relevance), prompt management with version control, and even an agent optimizer SDK." "MLflow Tracing is an OpenTelemetry-based tracing capability and supports one-click instrumentation for LlamaIndex applications." "The platform processes over 40 million traces daily."
- Limitations:
  - MLflow Tracing is still second-class to MLflow's classical ML experiment tracking; agent-specific features trail Phoenix/Opik.
  - Opik is the newest entrant — smaller community, fewer third-party cookbooks than Phoenix or Langfuse.
  - Phoenix OSS multi-project quota / scale limits push teams to paid Arize AX.
  - Langfuse evaluation story is thinner than Phoenix for complex agent-eval tasks ("Phoenix provides deeper support for agent evaluation compared with other open-source evaluation and tracing tools such as Langfuse").
---

## TASK STATUS SUMMARY
- T_a (LlamaIndex): done
- T_b (Anthropic SDK): done
- T_c (OpenAI Agents SDK): done
- T_d (AutoGen): done
- T_e (CrewAI): done
- T_f (Raw OTel emitters): done
- T_g (Multi-framework platforms): done
