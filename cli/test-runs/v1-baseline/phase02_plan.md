# Phase 2: PLAN

## Strategies

### Strategy for: What are the actual failure modes of `deep-research-cli` today, and which reliability primitives yield the biggest run-success-rate uplift per unit of engineering effort?

- Search queries to try:
  - `site:github.com deep-research-cli issues failure timeout` and direct `gh issue list` / `gh pr list` against the repo plus the parent fork
  - `notes/test-run-log.md "Status" "failed"` (local repo grep across `notes/test-runs/` for `Status`, `error`, `partial`, `loop-back`, `Step 6`)
  - `claude -p subprocess hang stderr exit code` and `OpenRouter 429 retry-after exponential backoff Python`
  - `LLM agent pipeline checkpoint resume idempotent phase contract` and `dead-letter queue LLM workflow`
- Key entities / authors / organizations to investigate:
  - Repo maintainers (199-biotechnologies fork lineage, current `deep-research-cli` author) and ADR `notes/adr/001-task-tool-vs-claude-p-subagents.md` author
  - Anthropic Claude Agent SDK team (subprocess/streaming behavior, exit-code semantics)
  - OpenRouter platform team (rate-limit headers, partial-content semantics) and OpenCode maintainers
  - Temporal.io / Restate / Inngest engineering blogs (durable-execution patterns transferable to agent pipelines)
  - dlt-hub, Dagster, and Prefect docs (idempotent step contracts, retry-with-validation)
  - Eugene Yan and Hamel Husain (essays on LLM-pipeline reliability and "evals over uptime")

### Strategy for: What phase-level artifacts, structured logs, token/cost telemetry, and trace correlation does the CLI emit now, and what is the minimum addition to fully diagnose a failed run from artifacts alone?

- Search queries to try:
  - Local repo grep: `logger`, `print(`, `json.dump`, `artifact`, `phase_`, `usage`, `token`, `cost`, `trace_id` across `skill/scripts/` and any CLI source modules
  - `OpenTelemetry GenAI semantic conventions LLM span attributes` and `gen_ai.usage.input_tokens`
  - `Langfuse self-hosted vs Helicone vs Phoenix Arize comparison 2025` and `OpenLLMetry instrumentation Python`
  - `structured logging multi-phase pipeline correlation id JSONL`
- Key entities / authors / organizations to investigate:
  - OpenTelemetry GenAI working group (semantic conventions for LLM spans, tool-use spans, embedding spans)
  - Langfuse (Marc Klingen et al.), Helicone, Phoenix/Arize AI, Honeycomb (Charity Majors on observability primitives), Braintrust
  - Traceloop / OpenLLMetry maintainers
  - Sentry, Datadog LLM observability product teams (commercial reference designs)
  - Anthropic engineering blog posts on token-usage reporting in streaming responses
  - Authors of `aiconfig`, `dspy` instrumentation hooks (alternative artifact patterns)

### Strategy for: Where does the provider abstraction leak Claude-Agent-SDK or OpenCode/OpenRouter assumptions into shared code, and what would a clean provider interface look like?

- Search queries to try:
  - Local repo grep: `anthropic`, `claude`, `opencode`, `openrouter`, `model=`, `tool_use`, `system=`, `messages=` across `skill/scripts/` and any provider-dispatch module; identify every conditional on provider name
  - `LiteLLM provider abstraction architecture capability map` and `aisuite Andrew Ng provider interface design`
  - `Vercel AI SDK provider adapter pattern tool-use translation`
  - `Gemini function calling vs Anthropic tool use vs OpenAI tools schema differences` and `Ollama OpenAI-compatible endpoint limitations`
- Key entities / authors / organizations to investigate:
  - LiteLLM (BerriAI, Krrish Dholakia, Ishaan Jaffer) — most-cited cross-provider router
  - aisuite (Andrew Ng's team) — minimalist provider interface
  - Vercel AI SDK provider package authors (`@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai`)
  - Continue.dev and Cline maintainers (live cross-provider agent abstractions)
  - Anthropic Claude Agent SDK and OpenAI Agents SDK design docs (capability surfaces to compare)
  - Google Gemini API team, Ollama maintainers, AWS Bedrock team (third-provider candidates named in scope)
  - Authors of Outlines, Instructor, Pydantic AI (provider-agnostic structured-output libraries)

### Strategy for: How are per-phase prompts authored, versioned, parameterized, and evaluated, and what evaluation harness would make prompt changes measurable?

- Search queries to try:
  - Local repo grep: `prompt`, `PROMPT`, `phase`, `template`, `f"`, `Template(`, `jinja`, `instructions=`, `system_prompt` across `skill/`, `tools/`, and any prompt-asset directories; cross-reference with `notes/test-runs/` outputs for instruction-following defects
  - `Promptfoo CI golden dataset LLM regression` and `DeepEval pytest LLM assertions`
  - `Inspect AI UK AISI evaluation framework agent tasks` and `LangSmith dataset versioning prompt diff`
  - `LLM-as-judge reliability cross-provider rubric calibration`
- Key entities / authors / organizations to investigate:
  - Promptfoo (Ian Webster), DeepEval (Confident AI / Jeffrey Ip), Inspect AI (UK AI Safety Institute), Braintrust, LangSmith, OpenAI Evals, Ragas, TruLens
  - Hamel Husain and Shreya Shankar (essays on practical LLM evaluation and rubric design)
  - Anthropic prompt-engineering docs and Anthropic Cookbook (prompt structure conventions)
  - PromptLayer and Humanloop (prompt versioning / registry products)
  - Authors of `evalplus` and HELM (academic eval harness patterns)
  - DSPy team (Omar Khattab) — declarative prompt programming as an alternative to hand-written templates

### Strategy for: Which proposed changes are compounding wins across all four axes versus single-axis point fixes, and how should they be sequenced?

- Search queries to try:
  - `typed IO contract LLM pipeline Pydantic schema retry validation` and `Instructor library response_model retry`
  - `phase contract design durable workflow versioning` and `interface segregation LLM agent`
  - `sequencing platform refactors compounding leverage engineering` (Will Larson, Lethain.com archives)
  - `dependency graph release planning roadmap technique`
- Key entities / authors / organizations to investigate:
  - Pydantic AI team (Samuel Colvin) and Instructor (Jason Liu) — typed-IO patterns that simultaneously enable validation, retries, evals, and provider-agnostic prompts
  - Will Larson (`lethain.com`) on platform-engineering sequencing
  - Camille Fournier on tech-debt prioritization
  - Modal Labs and Replicate engineering (deployment patterns for LLM pipelines that thread reliability + observability + portability together)
  - The `deep-research` sibling skill in this repo's parent ecosystem (transferable abstractions called out in scope)
  - DSPy (compounding-wins case study: typed signatures unlock optimization, evals, and portability simultaneously)

### Strategy for: Which recommendations are backwards-compatible drop-ins vs. require a major version bump, and what is a sensible release sequence?

- Search queries to try:
  - `semantic versioning CLI breaking change deprecation policy Python`
  - `feature flag rollout CLI tool experimental subcommand`
  - `Click Typer deprecation warning pattern` and `argparse subcommand deprecation`
  - `pip install extras optional dependency provider plugin pattern`
- Key entities / authors / organizations to investigate:
  - Semantic Versioning spec authors (Tom Preston-Werner) and Keep a Changelog (Olivier Lacan)
  - Click maintainers (Pallets / Armin Ronacher) and Typer (Sebastián Ramírez / Tiangolo) — idiomatic deprecation paths
  - Hatch / Hatchling (Ofek Lev) and `python-semantic-release` maintainers
  - Major Python CLIs that have done clean v1→v2 transitions (Poetry, Ruff, uv by Astral) — case studies in migration notes and deprecation windows
  - PEP 387 (Python backwards compatibility policy) and PEP 602 (Python release cadence) as reference frameworks
  - OpenTelemetry SDK stability guarantees and LangChain v0.1→v0.2 migration retrospectives (cautionary tale of stranding users)

## Expected source types

- This repository's own source code under `skill/scripts/`, any `deep-research-cli` package modules, and the ADR set in `notes/adr/` — primary ground truth for current behavior and failure modes.
- This repository's `notes/test-runs/v*/` directories and `notes/test-run-log.md` — observed empirical failure frequency and severity, the only legitimate source for AC-1.
- GitHub issue trackers and PR histories for `deep-research-cli`, the parent `199-biotechnologies/claude-deep-research-skill` fork, the Claude Agent SDK, OpenCode, and OpenRouter — bug reports, edge cases, planned roadmap items.
- Official SDK and API documentation: Anthropic Claude Agent SDK docs, OpenRouter API reference, OpenCode docs, Gemini API and Ollama docs (for the third-provider question).
- LLM observability platform documentation and architecture posts: Langfuse, Helicone, Phoenix/Arize, OpenLLMetry/Traceloop, Braintrust, Honeycomb GenAI guides.
- OpenTelemetry GenAI semantic conventions specification — the de facto standard for LLM span attributes; required for any portable observability story.
- Provider abstraction library source and design docs: LiteLLM, aisuite, Vercel AI SDK, Continue.dev — concrete reference designs for AC-3.
- Prompt evaluation framework documentation and example test suites: Promptfoo, DeepEval, Inspect AI (UK AISI), LangSmith, OpenAI Evals, Ragas, TruLens — required for AC-4 and AC-6.
- Engineering essays from practitioners with operational LLM experience: Hamel Husain, Eugene Yan, Shreya Shankar, Simon Willison, Will Larson, Charity Majors.
- Vendor engineering blogs that publish concrete reliability numbers: Anthropic, OpenAI, Modal Labs, Replicate, Sentry, Datadog.
- Standards and policy documents: SemVer 2.0.0, Keep a Changelog, PEP 387 (Python backwards compatibility), PEP 602 (release cadence) — frame the AC-7 release-sequencing analysis.
- Migration retrospectives from comparable Python CLIs and SDKs: Poetry, Ruff, uv, LangChain v0.1→v0.2 — case studies in non-breaking vs. breaking transitions.
- Selected academic and lab papers on LLM evaluation, structured-output reliability, and agent-pipeline robustness (HELM, evalplus, DSPy, Inspect AI publications) — only when they map directly to a concrete recommendation.
- Curated community signal: AI Engineer Summit talks, well-cited HN/Reddit threads on agent reliability, Latent Space podcast episodes on LLM observability and prompt evaluation — used to triangulate, not as primary evidence.
