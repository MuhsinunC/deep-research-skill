# Citation Verification Batch 1

Claim: "OTel GenAI agent operations create_agent, invoke_agent, and execute_tool are marked Development stability per the OTel specification."
Citation: [2]
Source: https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/
Status: VERIFIED
Evidence: "create_agent: **Status:** ![Development](https://img.shields.io/badge/-development-blue); invoke_agent: **Status:** ![Development](https://img.shields.io/badge/-development-blue); execute_tool is referenced via '/docs/specs/semconv/gen-ai/gen-ai-spans/#execute-tool-span' and is also marked Development."
DRA Flags: NONE
Notes: All three operations confirmed as Development stability. execute_tool is technically defined in gen-ai-spans (not gen-ai-agent-spans), but agent-spans references it directly. Minor T1 nit: the strongest single source for execute_tool would be gen-ai-spans#execute-tool-span, but the cited source does reference it.
---

Claim: "OpenTelemetry semantic-conventions issue #2664 proposes 5 core concepts for multi-agent: Tasks, Actions, Teams, Artifacts, Memory."
Citation: [3]
Source: https://github.com/open-telemetry/semantic-conventions/issues/2664
Status: CONTRADICTED
Evidence: "Issue #2664 proposes SIX core concepts, not five: (1) Tasks - 'Tasks define the minimal trackable units of work in agentic systems'; (2) Actions - 'Actions specify how a task is carried out'; (3) Agents - 'Agents are autonomous, stateful entities that plan, reason, learn, and execute tasks'; (4) Teams - 'Teams are dynamic groups of agents collaborating to achieve shared goals'; (5) Artifacts - 'Artifacts are the tangible inputs and outputs produced or consumed during execution'; (6) Memory - 'Memory provides persistent and scoped storage of knowledge and context'."
DRA Flags: G4 (deficient rigor: number is wrong — 5 instead of 6), G5 (strategic fabrication: claim omits "Agents" as one of the core concepts, which is explicitly listed in the proposal)
---

Claim: "LangSmith Plus tier costs $39/seat/month with 10,000 base traces per month included."
Citation: [13]
Source: https://www.langchain.com/pricing-langsmith
Status: VERIFIED
Evidence: "$39 / seat per month" and "Up to 10k base traces / mo, then pay-as-you-go"
DRA Flags: NONE
---

Claim: "Phoenix's OpenInference defines 10 distinct span kinds via openinference.span.kind: LLM, EMBEDDING, CHAIN, RETRIEVER, RERANKER, TOOL, AGENT, GUARDRAIL, EVALUATOR, and PROMPT."
Citation: [18]
Source: https://github.com/Arize-ai/openinference/blob/main/spec/semantic_conventions.md
Status: VERIFIED
Evidence: "The specification defines 10 total span kinds: 1. LLM, 2. EMBEDDING, 3. CHAIN, 4. RETRIEVER, 5. RERANKER, 6. TOOL, 7. AGENT, 8. GUARDRAIL, 9. EVALUATOR, 10. PROMPT. The openinference.span.kind attribute is mandatory for all OpenInference spans and identifies the operation type being traced."
DRA Flags: NONE
Notes: Attribution to "Phoenix" is a minor stretch — OpenInference is an Arize-ai spec that Phoenix uses, but the spec itself lives in the openinference repo. Not a material error since Phoenix is the reference consumer of OpenInference.
---

Claim: "Pydantic Logfire Personal tier is $0/month with 10 million spans/logs/metrics included monthly. Team is $49/month with 5 seats."
Citation: [25]
Source: https://pydantic.dev/articles/logfire-pricing-change
Status: VERIFIED
Evidence: "The Personal plan remains free, and it's still extremely generous: 10 million logs/spans/metrics per month included" with "1 seat, 3 projects, 2 guests (read-only)" and "30 days retention." "Team Plan ($49/mo): Designed for startups and small teams shipping to production. It includes 5 seats and 5 projects, plus up to 10 project guests."
DRA Flags: NONE
---

Claim: "OpenAI Agents SDK ships dedicated handoff_span() and guardrail_span() functions; handoff spans capture source agent and destination agent."
Citation: [27]
Source: https://openai.github.io/openai-agents-python/tracing/
Status: VERIFIED
Evidence: From the cited tracing page: "Guardrails are wrapped in guardrail_span()" and "Handoffs are wrapped in handoff_span()." From the linked API reference (https://openai.github.io/openai-agents-python/ref/tracing/create/): "handoff_span(from_agent: str | None = None, to_agent: str | None = None, ...) -> Span[HandoffSpanData]" with parameter descriptions "from_agent: The name of the agent that is handing off" and "to_agent: The name of the agent that is receiving the handoff."
DRA Flags: NONE
Notes: The specific from_agent/to_agent signature details are not on the cited tracing page directly, but on the linked ref/tracing/create page. Minor T1: a tighter citation would include the API reference URL alongside the tracing overview URL. The cited page does confirm handoff_span() and guardrail_span() exist.
---

## TASK STATUS SUMMARY
- VC1: done
- VC2: done
- VC3: done
- VC4: done
- VC5: done
- VC6: done
