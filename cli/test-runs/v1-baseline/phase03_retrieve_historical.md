I now have sufficient depth across all six sub-questions. Let me synthesize the full findings document.

`★ Insight ─────────────────────────────────────`
The `atomic_checkpoint.py` script uses `os.replace()` (POSIX-atomic rename) with an `fsync` before the rename — a production-grade pattern that protects against mid-write corruption on SIGKILL. The tmp file lives in the same directory as the target (same filesystem) to guarantee the rename is atomic. This is precisely the pattern recommended by the idempotent-retry literature, and the project already has it — the gap is that the checkpoint schema doesn't yet carry enough telemetry (token counts, phase durations, sub-agent exit codes) to support post-mortem diagnosis without re-running.
`─────────────────────────────────────────────────`

---

# Deep Research CLI — Historical Improvement Analysis
**Research date:** 2026-05-03 | **Lens:** Historical | **Mode:** Primary-source-first

---

## Executive Summary

This document evaluates six improvement axes for the `deep-research` skill/CLI through a historical lens: tracing what was built, when, why, what broke, and what those failures imply for the next engineering cycle. Primary sources are the project's own operational artifacts — test-run logs, ADRs, scripts, and internal research notes — supplemented by peer-reviewed benchmarks and authoritative external documentation. The single most consequential finding is that the project's 20 % per-run failure rate (observed empirically in v15) is caused by a single architectural bottleneck — Task-tool synchronous parallel spawn with no timeout — and fixing it unlocks compounding wins across reliability, observability, and provider portability simultaneously.

---

## Sources

---

### Source 1
**Title:** Deep Research Skill — Test Run Log (v2–v15)
**URL:** `/deep-research-skill/notes/test-run-log.md` (project-internal artifact)
**Date:** 2026-03-22 through 2026-04-07 (living document)
**Credibility score:** 97 — First-hand operational record; machine-verifiable fields (UUID8, duration, git SHA, status); no editorial mediation.

**Key findings:**
- Runs v2–v13 (4 consecutive deep-mode completions: v10, v11, v12, v13) recorded a 100 % success rate, masking the ~20 % hang risk that only materialized at v15 when effort was correctly configured for the first time. Prior runs were likely spared because Opus at default-medium effort issued fewer parallel tool calls.
- v14 (killed for a configuration reason unrelated to hangs) and v15 (killed for sub-agent hang at Phase 3 RETRIEVE) establish that the actual failure rate is approximately 1-in-5 for correctly-configured deep-mode runs — a number that cannot be accepted in a production-grade pipeline.
- All pre-v14 runs inadvertently ran Opus at *medium* effort (not max) because `CLAUDE_CODE_EFFORT_LEVEL=max` in `~/.zshrc` is not propagated through non-interactive `zsh -c` subshells. The runs appeared healthy partly because they were running at lower effort than intended, producing faster but potentially lower-quality research.

---

### Source 2
**Title:** ADR-001: Task Tool vs `claude -p` Subprocess for Sub-Agent Architecture
**URL:** `/deep-research-skill/notes/adr/001-task-tool-vs-claude-p-subagents.md` (project-internal)
**Date:** 2026-04-07 (updated same day with v15 empirical evidence)
**Credibility score:** 95 — Architectural decision record written immediately after the confirming failure; contains quantitative cost estimates and an explicit comparison matrix.

**Key findings:**
- The Task tool's synchronous parallel spawn is the confirmed failure mode: when N sub-agents are launched in one message, the parent blocks until *all* return. A single hung sub-agent therefore locks the entire pipeline indefinitely with no timeout mechanism.
- The decision matrix shows the `claude -p` subprocess alternative provides process isolation, per-agent `timeout`-command support, separate log files, and explicit `--effort` flags — at a cost of ~15–18 seconds of spawn overhead per deep-mode run and ~200 lines of additional methodology documentation.
- The ADR was originally written in the morning of 2026-04-07 recommending *against* the switch; it was updated the same afternoon with the opposite recommendation after v15 confirmed the hang. The reversal within one operational cycle is significant: empirical evidence overrode theoretical risk calculus in real time.

---

### Source 3
**Title:** SKILL.md — Deep Research Skill (v15+, commit df7db85 and later)
**URL:** `/deep-research-skill/skill/SKILL.md` (primary implementation artifact)
**Date:** 2026-04-07 and ongoing
**Credibility score:** 100 — The canonical source of truth for what the pipeline actually does.

**Key findings:**
- The skill already encodes several production-grade reliability primitives: dual-mechanism effort propagation (`CLAUDE_CODE_EFFORT_LEVEL=max` env-var + `--effort max` CLI flag), four-layer completion detection (`_DONE` sentinel + process exit + `research-tasks.json` + tmux session enumeration), graceful pause via `_STOP_REQUESTED` / `_STOP_NOW` flag files, and both Path A (explicit header) and Path B (auto-detect) resume paths.
- Provider abstraction is entirely absent: the skill hardcodes `claude -p`, `--model opus`, `--model sonnet`, and `--dangerously-skip-permissions` throughout. Every provider-specific assumption is baked into prose instructions and bash spawn templates, with no interface layer that could be swapped.
- Token/cost telemetry exists only as a static per-mode *estimate* block printed at spawn time (upper-bound numbers calibrated against historical runs). No actual token counts are measured, logged, or persisted during a run. This means the "~830K tokens / ultradeep" estimate cannot be validated or refined without external billing queries.

---

### Source 4
**Title:** `atomic_checkpoint.py` — Atomic Checkpoint Writer
**URL:** `/deep-research-skill/skill/scripts/atomic_checkpoint.py`
**Date:** 2026-04-07 (introduced during consistency hardening work)
**Credibility score:** 100 — Executable code; behavior is deterministic and auditable.

**Key findings:**
- Uses `os.replace()` (atomic POSIX rename) with `fsync()` before rename: writes to a `.tmp` sidecar in the same directory (same filesystem, avoiding cross-mount rename failures), then atomically promotes. This correctly handles SIGKILL mid-write — a real failure mode documented in the v15 run.
- The checkpoint schema is minimal: `phase_completed`, `next_phase`, `timestamp`, and an open-ended `extra` dict. It carries *no* timing data (phase wall-clock duration), *no* token counts, *no* sub-agent exit codes, and *no* error records. An operator diagnosing a failed run from artifacts alone cannot determine which phase was slow, which sub-agent hung, or what the error was — they must re-run.
- The `cleanup-tmp` subcommand is called by Phase 0 RESUME DETECTION to remove any `.tmp` leftovers from a kill mid-write before reading the checkpoint — preventing a stale `.tmp` from being mistaken for a valid checkpoint in a future resume.

---

### Source 5
**Title:** Consistency Hardening Research — Skill Activation & Phase Compliance
**URL:** `/deep-research-skill/notes/research/consistency-hardening-research.md`
**Date:** 2026-03-25
**Credibility score:** 88 — Synthesizes a cited 650-trial quantitative study (Ivan Seleznov, Medium) plus official Anthropic docs; the underlying study is the primary evidence.

**Key findings:**
- A 650-trial automated study across three SKILL description variants found that **directive descriptions** ("ALWAYS invoke…Do not attempt X directly — use this skill first") achieve 100 % activation rate in bare conditions (no hooks, no CLAUDE.md), versus ~88 % overall across all variants. The current SKILL.md description is of the "passive" variety and likely achieves ~77 % activation.
- A critical regression was documented in March 2026: Claude began ignoring UserPromptSubmit hook instructions after a model update, dropping hook-only activation to ~50 %. The fix — CLAUDE.md reinforcement of hook compliance — restored 100 % activation in the triple-mechanism configuration (directive description + hook + CLAUDE.md).
- The Stop hook with `decision: block` and a file-based phase-marker pattern provides a machine-verifiable gate against silent phase skipping — a failure mode where the skill loads correctly but Claude omits one or more phases without signaling the omission. This is distinct from the hang failure mode (process level) and represents a *prompt compliance* failure mode that the current test-run log does not track.

---

### Source 6
**Title:** Self-Improvement Research Synthesis — Ranked Improvements (v1 internal report)
**URL:** `/deep-research-skill/notes/research/self-improvement-research/synthesis.md`
**Date:** 2026-03-22
**Credibility score:** 82 — Internal research output; synthesizes Anthropic engineering blog, community skill comparisons, and GitHub issues; predates the v15 failure and therefore underweights the Task-tool hang risk.

**Key findings:**
- The earliest ranking of improvements (pre-v15) placed LLM-as-judge self-evaluation first, progress reporting second, and source-preference heuristics third — all *prompt quality* concerns. Checkpoint/resume was ranked sixth, rated "medium impact." The v15 failure retroactively re-ranks checkpoint/resume and sub-agent architecture as the highest-priority reliability items.
- GitHub Issue #1 on the upstream repo (rba100) documents the HTML generation timeout as the only user-filed bug: "the output was truncated… a massive LLM call that often times out." This is now partially addressed by the progressive report assembly logic in `report-assembly.md`, but the root cause (single large LLM call for HTML) persists.
- The report is historically significant because it represents the knowledge state *before* reliable max-effort runs were achieved. Every improvement it proposes assumes well-behaved sub-agents; none of them work if sub-agents hang.

---

### Source 7
**Title:** Search API Head-to-Head Benchmark (WebSearch vs Brave vs Tavily vs SerpAPI)
**URL:** `/deep-research-skill/notes/benchmarks/search-api-benchmark.md`
**Date:** 2026-03-25
**Credibility score:** 90 — Internally produced with documented methodology (5 queries × 4 APIs, wall-clock timing); limited to 5 test queries.

**Key findings:**
- Claude Code's built-in `WebSearch` tool has a **21× latency disadvantage** vs Brave (15,379 ms average vs 735 ms) but returns 10 results per query versus 5 for the alternatives. At the Phase 3 RETRIEVE scale (4 parallel sub-agents × 5–8 searches each), this latency compounds to a meaningful fraction of total run time.
- Tavily provides per-result relevance scores (e.g., 0.96 for the top result), enabling programmatic filtering that no other tested API offers. This is directly relevant to source quality evaluation — a capability gap in the current skill that relies on LLM-level credibility assessment via `source_evaluator.py`.
- The benchmark pre-dates provider abstraction work and was conducted to inform a potential search-provider swap. The project currently has no mechanism to route to a different search backend; all retrieval is hardwired to `WebSearch` tool calls.

---

### Source 8
**Title:** How We Built Our Multi-Agent Research System (Anthropic Engineering Blog)
**URL:** [https://www.anthropic.com/engineering/multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system)
**Date:** June 2025
**Credibility score:** 95 — Authoritative first-party engineering documentation from the producer of the underlying model and SDK.

**Key findings:**
- Anthropic's production system uses Opus 4 as orchestrator with Sonnet 4 sub-agents — the same hybrid architecture the deep-research skill converged on independently, validating the design direction. The production system **outperforms single-agent Opus 4 by 90.2 %** on internal benchmarks, with token usage explaining 80 % of performance variance.
- Sub-agent task definitions require four elements to avoid duplication and vagueness: explicit objective, output format, tool/source guidance, and clear task boundaries. The skill's current sub-agent prompts are long-form prose that partially satisfies this but lacks a machine-readable output schema — meaning the orchestrator cannot validate sub-agent compliance programmatically.
- The post documents explicit **source preference heuristics** as a hard-won lesson: early agents "gravitated toward highly-ranked but low-quality sources," requiring refinement of source quality criteria in prompts. The current skill's `source_evaluator.py` addresses this at the script level but the Phase 3 RETRIEVE prompt doesn't enumerate *which* source types to deprioritize by name.

---

### Source 9
**Title:** ReliabilityBench: Evaluating LLM Agent Reliability Under Production-Like Stress Conditions
**URL:** [https://arxiv.org/abs/2601.06112](https://arxiv.org/abs/2601.06112)
**Date:** January 2026
**Credibility score:** 88 — Peer-reviewed preprint; chaos-engineering methodology with configurable fault injection; evaluated GPT-4o and Gemini 2.0 Flash across multiple architectures.

**Key findings:**
- Rate limiting is the **most damaging single fault type** in production-like conditions (2.5 % per-run degradation in ablation), exceeding timeout and partial-response faults. The deep-research skill's current rate-limit handling is exponential backoff (60 s / 120 s / 240 s, 3 retries) for browser-tool failures, but *no* structured retry exists for `WebSearch` tool rate limits or API-level 429 responses from the Anthropic API itself.
- ReAct architectures are **more robust than Reflexion** under combined stress conditions (rate limits + timeouts + perturbations), because ReAct's tight observe→act loop degrades gracefully while Reflexion's self-reflection loop can amplify errors. The deep-research skill's Think2 (Plan→Monitor→Evaluate) metacognitive protocol is closer to ReAct than Reflexion and therefore better positioned for stress resilience.
- The benchmark establishes that **perturbations alone** (semantically equivalent task rephrasing) reduce success from 96.9 % (baseline) to 88.1 %, meaning prompt fragility is a measurable, separable risk from infrastructure failure. The skill has no mechanism to test for perturbation sensitivity across prompt variants.

---

### Source 10
**Title:** AI Agent Observability — Evolving Standards and Best Practices (OpenTelemetry Blog)
**URL:** [https://opentelemetry.io/blog/2025/ai-agent-observability/](https://opentelemetry.io/blog/2025/ai-agent-observability/)
**Date:** 2025
**Credibility score:** 87 — From the OpenTelemetry project; authoritative on instrumentation standards; does not cover Claude-Code-specific deployment patterns.

**Key findings:**
- GenAI Semantic Conventions define standardized attributes for telemetry: `gen_ai.system` (provider), `gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.response.finish_reason`, and span-level error codes. Adopting these conventions would make deep-research traces interoperable with Langfuse, Honeycomb, and Datadog's LLM observability products without vendor lock-in.
- Trace ID propagation through all agent-to-subagent boundaries is identified as the **minimum viable observability addition** that enables post-mortem correlation: a single trace ID written to the checkpoint JSON at spawn time, then inherited by each sub-agent, would let an operator reconstruct the full call tree from artifact files alone.
- The 2025 blog notes that most AI agent frameworks now emit OpenTelemetry spans natively — but `claude -p` subprocess spawns do **not** emit OTEL spans automatically. The trace must be initiated by the wrapper and propagated via environment variable or brief-file header.

---

### Source 11
**Title:** LiteLLM — Python SDK for 100+ LLM Provider Unification
**URL:** [https://github.com/BerriAI/litellm](https://github.com/BerriAI/litellm) / [https://docs.litellm.ai/docs/](https://docs.litellm.ai/docs/)
**Date:** Actively maintained; current as of May 2026
**Credibility score:** 82 — Open-source project with significant adoption; not peer-reviewed but operationally validated at scale.

**Key findings:**
- LiteLLM provides a single `completion()` call that routes to Anthropic, OpenAI, Gemini, Bedrock, Azure, Ollama, and 90+ other backends, translating provider-specific parameters (tool_choice, response_format, stream) to and from a unified OpenAI-compatible schema. For the deep-research skill, this would replace the hardcoded `claude -p` spawn with a provider-agnostic process invocation — the key blocker for Gemini or local Ollama backend support.
- The "capability negotiation" gap is real: LiteLLM normalizes the request but does not yet abstract *effort levels* (Claude-specific), *thinking budgets* (Gemini's equivalent), or *tool_choice="required"* semantics uniformly. These require thin shims per provider, not full rewrites.
- LiteLLM's cost tracking middleware emits per-call token counts and USD estimates to a configurable callback (file, database, Langfuse). Adopting LiteLLM as the provider layer would resolve the token telemetry gap as a side-effect of the provider portability work — a compounding win.

---

### Source 12
**Title:** State of AI Engineering 2026 (Datadog)
**URL:** [https://www.datadoghq.com/state-of-ai-engineering/](https://www.datadoghq.com/state-of-ai-engineering/)
**Date:** 2026 (published March 2026)
**Credibility score:** 85 — Datadog instrument billions of spans; production telemetry from real deployments; methodology not fully disclosed.

**Key findings:**
- In March 2026, **2 % of all LLM spans returned errors**; rate limits accounted for nearly one-third of those (~8.4 million rate limit errors during the measurement period). This establishes rate limiting as a systemic production concern, not an edge case — validating the ReliabilityBench finding from a corpus of real deployments rather than synthetic benchmarks.
- AI agent framework adoption (LangChain, Pydantic AI, LangGraph, Vercel AI SDK) nearly doubled year-over-year (9 % of orgs in early 2025 → 18 % by early 2026). This represents a growing ecosystem from which prompt-evaluation tooling (Promptfoo, DeepEval, Braintrust) is being adopted — tooling that the deep-research skill's development workflow does not currently use.
- Multi-agent systems using 15× more tokens than chat interactions is the Datadog finding that validates Anthropic's internal measurement. For the deep-research skill at 82 % discount, an ultradeep run at ~830K tokens costs approximately $1.50–$2.50 at effective rates — economically viable at current pricing but sensitive to model tier changes.

---

### Source 13
**Title:** AI Agent Workflow Checkpointing and Resumability (Zylos Research)
**URL:** [https://zylos.ai/research/2026-03-04-ai-agent-workflow-checkpointing-resumability](https://zylos.ai/research/2026-03-04-ai-agent-workflow-checkpointing-resumability)
**Date:** March 4, 2026
**Credibility score:** 72 — Independent research blog; methodology not disclosed; useful as a survey of industry patterns rather than a primary source.

**Key findings:**
- Node-level checkpointing (recording state before and after each graph node) enables finer-grained resume at the cost of more storage. For the deep-research skill, this maps to the distinction between Granularity 1 (phase-boundary) and Granularity 2 (sub-agent-boundary) resume, both of which are implemented — but Granularity 2 sub-agent progress is only tracked *before* Phase 3 fan-out, not *during* sub-agent execution.
- The article identifies "checkpoint inflation" as a practical problem: if checkpoint writes become expensive relative to the work being checkpointed, the overhead degrades throughput. The current `atomic_checkpoint.py` write is negligible (<1 ms), but if token/cost telemetry fields are added to every checkpoint, the schema must be kept lean.
- LangGraph's checkpointing model (attaching a checkpointer at compile time, resuming by passing the same thread_id) is the closest analogue to the deep-research skill's Path B auto-detect resume. The deep-research implementation predates widespread LangGraph adoption and arrived at a similar design independently.

---

### Source 14
**Title:** Building a "Golden Dataset" for AI Evaluation: A Step-by-Step Guide (Maxim AI)
**URL:** [https://www.getmaxim.ai/articles/building-a-golden-dataset-for-ai-evaluation-a-step-by-step-guide/](https://www.getmaxim.ai/articles/building-a-golden-dataset-for-ai-evaluation-a-step-by-step-guide/)
**Date:** 2025
**Credibility score:** 75 — Commercial vendor blog with educational intent; describes broadly accepted methodology; no original data.

**Key findings:**
- A golden dataset for the deep-research skill would consist of: (a) fixed input topics (the same research queries run across skill versions), (b) expected output schemas (required sections, minimum source counts, citation format), and (c) quality rubrics (claims-verified rate, fabricated-citation rate, word count, prose/bullets ratio). The test-run log already captures most of (c) as manually recorded metadata — the gap is that (a) and (b) are not codified, making cross-version comparison manual.
- The recommended cadence is: random-prompt sampling for surface exploration + lean golden dataset as a deterministic regression gate. For the deep-research skill, the "self-improvement research" topic used in v15 is a natural golden-set candidate because the ground truth (what a good improvement proposal looks like) is partially known.
- Provider cross-validation (running the same golden-set prompt through Claude and a second provider) is the most actionable test for *provider drift* — the failure mode where a prompt produces correct outputs on Claude but diverges on Gemini due to instruction-following differences. Without a golden set, provider drift is invisible until a user reports it.

---

### Source 15
**Title:** Idempotent AI Agents: Retry-Safe Patterns for Production (BuildMVPFast)
**URL:** [https://www.buildmvpfast.com/blog/idempotent-ai-agent-retry-safe-patterns-production-workflow-2026](https://www.buildmvpfast.com/blog/idempotent-ai-agent-retry-safe-patterns-production-workflow-2026)
**Date:** 2026
**Credibility score:** 70 — Practitioner blog; synthesizes known patterns; no original research; useful for framing.

**Key findings:**
- Idempotent phase contracts require that re-running a phase with the same inputs produces semantically equivalent outputs and does not duplicate side effects (duplicate search API calls, duplicate file writes). The deep-research skill partially satisfies this: the resume protocol skips completed phases and existing sub-agent output files are preserved. The gap is that sub-agent retries within Phase 3 may issue duplicate `WebSearch` calls if the retry logic does not track which queries have already been executed.
- Idempotency keys for external calls (unique identifiers that prevent double-execution on retry) are not implemented for `WebSearch` or `WebFetch` calls in the current skill. For most queries this is harmless (search is read-only), but for browser-MCP interactions that may have session side-effects (form submissions, cookie mutations), duplicate execution could corrupt state.
- The "circuit breaker" pattern — failing fast after N consecutive sub-agent failures rather than retrying indefinitely — is identified as the complement to idempotent retry. The skill currently has exponential backoff with a 3-retry ceiling for browser failures, which approximates a circuit breaker, but there is no circuit breaker at the *phase* level (e.g., if all 4 Phase 3 sub-agents fail, the pipeline proceeds to TRIANGULATE on empty inputs).

---

## Cross-Cutting Themes

### Theme 1 — The Sub-Agent Spawn Architecture Is the Load-Bearing Constraint

Every improvement axis ultimately depends on resolving the Task-tool synchronous parallel spawn. Reliability (hang isolation), observability (per-agent log files and exit codes), provider portability (each sub-agent can specify its own provider flags), and prompt evaluation (sub-agents can be run in isolation with golden inputs) all become tractably implementable once sub-agents are `claude -p` subprocesses with process-level semantics. The v15 empirical failure (1 hang in 5 correctly-configured deep-mode runs) is the clearest historical signal in the project's log, and the ADR records the explicit pivot recommendation. This is the highest-leverage, highest-urgency item.

### Theme 2 — The Checkpoint Schema Is Structurally Sound But Telemetrically Thin

`atomic_checkpoint.py` provides the right primitive (POSIX-atomic rename, fsync-before-rename, same-filesystem tmp). The gap is semantic: the schema records *what phase completed* but not *how long it took*, *how many tokens it consumed*, *which sub-agents exited cleanly*, or *what errors occurred*. Extending the schema with five fields — `phase_wall_clock_sec`, `phase_input_tokens`, `phase_output_tokens`, `subagent_exit_codes` (dict), `error_summary` (string|null) — would enable full post-mortem diagnosis from artifacts alone without re-running. This is a backwards-compatible drop-in (the `extra` dict already accommodates arbitrary fields) and qualifies as the minimum observability addition.

### Theme 3 — Provider Assumptions Are Pervasive But Localizable

Claude-specific assumptions appear in: the spawn command (`claude -p`, `--model opus`, `--model sonnet`, `--dangerously-skip-permissions`), the effort system (`CLAUDE_CODE_EFFORT_LEVEL=max`, `--effort max`), the Task tool (Claude-Code-only), and the resume detection logic (which parses checkpoint files written by Claude-Code sessions). A clean provider interface would localize these to a single "provider config" section. The Task→subprocess switch (Theme 1) is a prerequisite, because `claude -p` is itself a provider-specific spawn; once sub-agents are subprocesses, the invocation template can be parameterized. LiteLLM provides a ready-made abstraction layer but requires shims for effort-level translation and sub-process spawning semantics.

### Theme 4 — Prompt Quality Is Measurable But Currently Measured Manually

The test-run log tracks "Claims verified," "Loop-backs," "Words," and "Status" — a reasonable quality proxy but captured by a human after each run. The consistency-hardening research quantified activation rate (650 trials) and the self-improvement synthesis ranked prompt-quality improvements. What is missing is a *repeatable automated eval*: a fixed golden input set, a schema-checked expected output, and a diff-capable runner that surfaces regressions across skill commits. The project has the raw material (test-run log as a golden corpus, validate_report.py as a structural checker, verify_citations.py as a citation checker) but has not connected them into a CI-triggerable harness. The gap between "vibes-based" and "measurable" prompt quality is smaller than it looks — it is primarily an automation and tooling gap, not a conceptual one.

### Theme 5 — The Compounding Win Is a Typed Per-Phase IO Contract

A formal per-phase IO contract — specifying input files consumed, output files produced, schema for each, and success/failure criteria — simultaneously enables: (a) retry-with-validation (re-run only if output schema is violated), (b) structured checkpoint telemetry (the contract defines what to measure), (c) provider-agnostic prompts (the contract is the interface, not the prompt text), (d) golden-set eval (run any phase in isolation against a fixed input and assert against the expected output schema), and (e) circuit breakers (fail fast if the output schema cannot be satisfied after N retries). No single other change provides this breadth of compounding value. The backwards-compatible release path is: define contracts as JSON Schema files in `skill/reference/schemas/`, validate them in `validate_report.py`'s existing loop, and add them to checkpoints incrementally — no major version bump required until provider portability forces a spawn-template change.

---

*Methodology note: Primary sources (Sources 1–7) were read directly from the project repository. External sources (Sources 8–15) were retrieved via live web search on 2026-05-03. Claims marked with uncertainty were cross-referenced against at least one additional source. Historical claims derived from the test-run log are treated as authoritative; external claims are treated as corroborating evidence only.*

Sources:
- [AI Agent Workflow Checkpointing and Resumability | Zylos Research](https://zylos.ai/research/2026-03-04-ai-agent-workflow-checkpointing-resumability)
- [Idempotent AI Agents: Retry-Safe Patterns for Production](https://www.buildmvpfast.com/blog/idempotent-ai-agent-retry-safe-patterns-production-workflow-2026)
- [State of AI Engineering | Datadog](https://www.datadoghq.com/state-of-ai-engineering/)
- [ReliabilityBench: Evaluating LLM Agent Reliability Under Production-Like Stress Conditions](https://arxiv.org/abs/2601.06112)
- [Datasets | DeepEval by Confident AI - The LLM Evaluation Framework](https://deepeval.com/docs/evaluation-datasets)
- [Building a "Golden Dataset" for AI Evaluation: A Step-by-Step Guide](https://www.getmaxim.ai/articles/building-a-golden-dataset-for-ai-evaluation-a-step-by-step-guide/)
- [GitHub - BerriAI/litellm](https://github.com/BerriAI/litellm)
- [Getting Started | liteLLM](https://docs.litellm.ai/docs/)
- [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/engineering/multi-agent-research-system)
- [OpenTelemetry for AI Agents: Implementing Observability in MCP Workflows | MintMCP Blog](https://www.mintmcp.com/blog/opentelemetry-ai-agents)
- [AI Agent Observability — Evolving Standards and Best Practices | OpenTelemetry](https://opentelemetry.io/blog/2025/ai-agent-observability/)
- [The 5 best prompt versioning tools in 2025 - Braintrust](https://www.braintrust.dev/articles/best-prompt-versioning-tools-2025)
- [Promptfoo releases](https://github.com/promptfoo/promptfoo/releases)
- [Future-Proof Your AI: Building a Gateway for Multiple LLM Providers | Medium](https://medium.com/@ritukampani/future-proof-your-ai-building-a-gateway-for-multiple-llm-providers-b746f80cc169)
- [LangGraph vs CrewAI: Multi-Agent Performance and Cost in Production 2026 | Markaicode](https://markaicode.com/vs/langgraph-vs-crewai-multi-agent-production/)