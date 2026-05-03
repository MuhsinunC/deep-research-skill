---

# Deep Research CLI Improvement Findings
**Lens:** Practitioner
**Date:** 2026-05-03
**Topic:** Reliability · Observability · Provider Portability · Prompt Quality

---

## Sources

---

### Source 1

**Title:** ADR-001: Task Tool vs `claude -p` Subprocess — Empirical Hang Evidence
**URL:** `notes/adr/001-task-tool-vs-claude-p-subagents.md` (internal)
**Date:** 2026-04-07 (updated same day after v15 run)
**Credibility:** 98 — First-party codebase record, timestamped with run UUID, written by the authors during the incident

**Key findings:**
- In run v15 (UUID E72ABA74), 2 of 4 Task tool retrieval sub-agents hung indefinitely at 0% CPU for 35+ minutes; the parent was blocked with no timeout or watchdog. This is the first empirically confirmed hang in this project's history (the failure mode was previously only theorized from GitHub issues #17147 and #37521).
- Estimated hang rate is now ~20% per deep-mode run based on the run table (1 confirmed hang in 5 deep-mode runs), which the ADR explicitly calls "a reliability problem that cannot be ignored."
- The root cause is architectural: the Task tool's synchronous parallel spawn has no timeout parameter and no process isolation. The recommended fix — switching sub-agents to `claude -p` subprocess spawns — adds ~15–18 s of wall-clock overhead per run but provides process-level `timeout` signals, per-agent log files, and crash isolation so one hung agent does not block the others.
- The ADR also identifies a subtler failure: effort env-var inheritance is fragile because `zsh -c` (the Bash tool's shell) does not source `~/.zshrc`. Pre-v15 runs silently ran at Opus default-medium effort despite the user's intent to run at max.

---

### Source 2

**Title:** Test Run Log — Full run history v2–v15
**URL:** `notes/test-run-log.md` (internal)
**Date:** 2026-04-07 (last entry)
**Credibility:** 97 — Primary observational record; entries have UUIDs, wall-clock timestamps, and linked output directories

**Key findings:**
- Across 15 runs, status breakdown is: 8 complete, 2 partial, 3 killed, 2 partial-killed. The 3 "killed" runs trace to distinct root causes — effort misconfiguration (v14), sub-agent hang (v15), and early smoke tests (v2–v4) — rather than a single systemic bug.
- All pre-v15 runs used Opus at default-medium effort despite the user's intent. Token spend estimates (~18.5 M total tokens) were never measured against actual billing; the log explicitly notes "Approximate, before 82% discount — no actual usage data from Claude Code stats or API billing."
- The log schema captures Sources, Claims verified, Loop-backs, Step 6 (retry), and Word count per run, but records nothing about phase timing, per-phase token use, error classification, or which tool calls failed — making post-hoc diagnosis require re-reading the full output directory rather than the log alone.

---

### Source 3

**Title:** `skill/SKILL.md` — Background Mode, Completion Detection, Concurrency Guidelines
**URL:** `skill/SKILL.md` (internal)
**Date:** Current (last deployed version)
**Credibility:** 96 — Authoritative operational specification for the deployed skill

**Key findings:**
- The skill implements a four-layer completion-detection protocol (`_DONE` sentinel, process exit, `research-tasks.json` status, tmux session enumeration), which was explicitly added after prior sessions lost track of running dispatches. Each layer addresses a different failure mode.
- The 2026-04-25 incident (14 parallel dispatches hitting quota mid-pipeline, 8–10 losing meaningful work) produced the concurrency caps now documented: ≤10 general dispatches, ≤5 web-scrape-heavy dispatches per quota window. This is empirical upper-bound data, not a theoretical estimate.
- The spawn template bundles five distinct bug fixes into every `claude -p` invocation (`< /dev/null` redirect, `_starting.txt` written before spawn, `CLAUDE_CODE_DEEP_RESEARCH_WORKER` env guard, `[ROLE-CHECK-WRAPPER]` echo, tmux named sessions). Each was added reactively after a real failure, none were designed-in from the start — a strong signal that the architecture needs a formal reliability model rather than accumulating one-off fixes.

---

### Source 4

**Title:** `skill/reference/methodology.md` and `skill/reference/resume.md` — Phase contracts, Disk-Truth Reconciliation
**URL:** `skill/reference/methodology.md`, `skill/reference/resume.md` (internal)
**Date:** Current
**Credibility:** 95 — Normative specification for phase behavior; directly governs what workers do

**Key findings:**
- The Disk-Truth Reconciliation rule ("trust disk over checkpoint") is the correct inversion of a naive "trust the log" approach, because the Phase 8 ordering writes artifacts before updating the checkpoint. Any kill between those two actions produces a benign recoverable state that disk-truth handles — but this means the checkpoint is at best a hint, not an authoritative record, making it unsuitable as the sole telemetry source for post-mortems.
- The `research_engine.py` script (in `skill/scripts/`) implements a parallel but non-integrated phase model: it enumerates `ResearchPhase` and `ResearchMode` enums and a `ResearchState` dataclass but has no checkpoint integration with `atomic_checkpoint.py`, no hybrid-model support, and no phase-numbering alignment with the current 10-phase methodology. It appears to be a legacy scaffold that has drifted from the live skill and is not invoked by any current pipeline path — a latent maintenance burden.
- Budget awareness is implemented via observable proxy signals (context compaction count, sub-agent retry rate) rather than actual token counters, because the skill cannot read its own token usage from inside a `claude -p` session. This is a fundamental observability gap: the skill can only infer cost from indirect signals, not measure it.

---

### Source 5

**Title:** `skill/scripts/atomic_checkpoint.py` — Atomic checkpoint writer implementation
**URL:** `skill/scripts/atomic_checkpoint.py` (internal)
**Date:** Current
**Credibility:** 94 — Production code; well-documented, tested (`tests/test_atomic_checkpoint.py` exists)

**Key findings:**
- Uses `os.replace()` after `fsync()` — correct POSIX atomicity; the `tmp` file is in the same directory as the target to avoid cross-filesystem rename failures. This is a textbook implementation of atomic file replacement.
- The checkpoint schema is deliberately minimal: `phase_completed`, `next_phase`, `timestamp`, and an untyped `extra` dict. The `extra` dict is where all context-specific fields live (`sources_gathered`, `status`, `paused_reason`, etc.). This flexibility comes at a cost: there is no schema validation on `extra`, so any reader (resume logic, monitoring scripts, diagnostics) must defensively handle missing keys. A typed Pydantic model for the `extra` payload would simultaneously enable validation, IDE autocomplete, and structured diff-ability when comparing checkpoints across runs.
- The `cleanup-tmp` subcommand (called by Phase 0) deletes `*.tmp` files silently if permissions fail (`except OSError: pass`). While documented as "best-effort," a silent cleanup failure on a stale corrupted `.tmp` file from a prior kill would leave the checkpoint in an ambiguous state on the next resume. The missing action is logging the cleanup failure to stderr before continuing.

---

### Source 6

**Title:** Consistency Hardening Research — Skill Activation 650-Trial Study
**URL:** `notes/research/consistency-hardening-research.md` (internal)
**Date:** 2026-03-25
**Credibility:** 88 — Cites an external study (650 automated trials with JSONL log verification); findings are statistically grounded

**Key findings:**
- Directive SKILL.md description wording ("ALWAYS invoke... do not attempt directly") achieves 100% skill activation in bare conditions, a 20.6× odds ratio over passive descriptions. The current SKILL.md description uses this exact pattern, which is why activation is reliable. Any provider porting that changes the SKILL.md format would need to preserve this property.
- Prompt-level instruction following (whether the worker executes all phases) is a separate concern from skill activation and is not covered by this study. The study measures whether the skill is invoked, not whether its instructions are followed once invoked — a distinction critical for evaluating prompt quality.
- Cross-provider activation rates are unknown. The 650-trial study was conducted entirely on Claude Code. A Gemini or GPT-4o backend would need its own activation study, since the Skill tool mechanism is Claude Code-specific.

---

### Source 7

**Title:** "How we built our multi-agent research system" — Anthropic Engineering Blog
**URL:** https://www.anthropic.com/engineering/multi-agent-research-system
**Date:** 2026 (published this year)
**Credibility:** 95 — First-party engineering post-mortem from Anthropic on their production system

**Key findings:**
- Anthropic's production system uses "retry logic and regular checkpoints" as the primary reliability primitive — not circuit breakers or dead-letter queues. State is saved to memory before context windows fill (the 200K-token compaction boundary), which is conceptually similar to the `atomic_checkpoint.py` approach but managed by the infrastructure rather than the application.
- Observability is "full production tracing" that monitors agent decision patterns and interaction *structures* without monitoring conversation *contents* (privacy-preserving). This produced a concrete operational discovery: agents defaulted to SEO-optimized content over authoritative sources, which was only detectable from decision-pattern traces — not from output quality alone.
- Their failure-to-root-cause table maps vague prompts → excessive subagent spawning, poor delegation guidance → duplicate work, and missing source-quality heuristics → low-credibility results. All three failures manifest in the deep-research skill too but are handled in prompts today rather than in infrastructure — meaning a prompt regression would silently reintroduce them.

---

### Source 8

**Title:** GitHub Issue #49150 — Task() tool has no timeout; subagent hang leaves orchestrator stuck indefinitely
**URL:** https://github.com/anthropics/claude-code/issues/49150
**Date:** 2026-04-16 (issue filed)
**Credibility:** 92 — Primary source; filed by external developer with concrete reproduction (UUID, timestamps, subagent output files on disk), corroborated by ADR-001 v15 findings

**Key findings:**
- The issue was **closed as "not planned"** by Anthropic, meaning there is currently no roadmap item to add a `timeout_ms` parameter to the Task tool. Any reliability fix for the 20% hang rate must be implemented at the application layer (e.g., subprocess architecture) rather than waiting for a platform fix.
- The failure is indistinguishable from "subagent is still working" from inside the orchestrator: the task state JSON shows `status: in_progress` forever, and 35K tokens were burned during the hang with no productive output. This is a silent failure, not a noisy one — making it especially dangerous for long-running unmonitored dispatches.
- The feature request specified exactly what is needed: `timeout_ms` option on `Task()`, structured `"subagent timed out"` error return, SIGTERM of the subagent process tree, and metadata about last-stdout-timestamp and created files for recovery. These are the same requirements the `claude -p` subprocess architecture would satisfy by design.

---

### Source 9

**Title:** "AI Agent Circuit Breakers: The Reliability Pattern Production Teams Are Missing"
**URL:** https://dev.to/waxell/ai-agent-circuit-breakers-the-reliability-pattern-production-teams-are-missing-5bpg
**Date:** 2026 (post-mortem of a $437 API-bill incident)
**Credibility:** 65 — Practitioner blog, well-researched post-mortem; not peer-reviewed but corroborated by multiple independent accounts

**Key findings:**
- The article identifies four circuit breaker triggers applicable to the deep-research skill: (1) same tool call with near-identical arguments 2–3 consecutive times → stuck-loop termination; (2) cost velocity exceeding a $/hour threshold → stop regardless of step count; (3) three consecutive failures at the same operation without recovery; (4) scope violation (tool call outside permission boundaries).
- Circuit breakers are most valuable as **infrastructure-layer controls** (enforced outside the prompt, not inside it), because prompt-level instructions can be overridden by the model under certain conditions. The deep-research skill's current "pause at `_STOP_REQUESTED` flag" is a manual stop signal, not an automatic circuit breaker — it requires operator intervention rather than firing autonomously.
- The "2026 is the year of the harness" framing is relevant: assuming each of 20 pipeline steps succeeds at 95%, the compound end-to-end success rate is only 36%. At 99% per step it rises to 82%. This math is why the ~20% hang rate on the Task tool (which reduces Phase 3 sub-agent success to ~80%) has an outsized compounding effect on overall run success rates.

---

### Source 10

**Title:** "The Complete Guide to LLM Observability" — Portkey
**URL:** https://portkey.ai/blog/the-complete-guide-to-llm-observability/
**Date:** 2026 (updated for current year)
**Credibility:** 72 — Vendor-authored guide (Portkey sells observability tooling) but technically accurate; findings corroborated by OpenTelemetry GenAI semantic conventions

**Key findings:**
- For multi-agent trace correlation, each agent run should become a **root trace** with tool calls, LLM invocations, and retrieval steps as child spans. Every span needs: `trace_id` (shared across the full reasoning chain), `span_name`, iteration order, latency, token counts (input + output), cost estimate, and status. The deep-research skill currently has no trace IDs — `UUID8` serves as a dispatch ID but there is no span-level granularity within a dispatch.
- The minimum telemetry for post-mortem diagnosis of a failed run (without re-running it) requires: unique request/sub-operation IDs, error codes with retry reasons, latency per span, input/output token counts, tool execution records (which tool, duration, failure mode), and per-phase status. The current `_checkpoint.json` captures phase name and timestamp but omits all token, latency, and error data.
- Storing prompts as span **events** (filterable at collection time) rather than **attributes** (always indexed, always exported) is the recommended pattern for PII/compliance-safe observability. The deep-research skill's current `.log` files capture full LLM output, which could include user data — a gap if the skill is ever used in a team or logged-to-cloud setting.

---

### Source 11

**Title:** "Evaluate Coding Agents" — Promptfoo Documentation
**URL:** https://www.promptfoo.dev/docs/guides/evaluate-coding-agents/
**Date:** 2025–2026 (actively maintained)
**Credibility:** 88 — Official documentation for an evaluation framework used by OpenAI and Anthropic (per GitHub README); methodologically rigorous

**Key findings:**
- The recommended approach for building agent golden sets is **concrete, measurable test cases** (e.g., "find the 3 intentional bugs in this file" is testable; "review this code for quality" is not). For a research pipeline, this translates to: supply a topic with a known ground-truth answer set, then assert that the report contains those facts, not that it is "good."
- Three quantifiable dimensions for prompt regression testing: (1) token/cost patterns (high input tokens + low output = reading; reversed = generation — useful for detecting if Phase 3 started retrieval), (2) cost/latency threshold assertions (catch regressions where a prompt change causes 3× more searching), (3) non-determinism measurement via `--repeat 3` runs to surface unreliable prompts. The deep-research skill has none of these measurement primitives today.
- Trajectory assertions — verifying that the agent *took the expected actions*, not just produced the expected output — are the key addition that distinguishes eval-for-agents from eval-for-LLMs. For the deep-research pipeline, this means asserting that `scope.md` was written, that `_subagent_progress.json` shows 4/4 sub-agents complete, and that `_DONE` was written before the run completed — not just that the final report contains the right words.

---

### Source 12

**Title:** LiteLLM — Provider Portability Gateway (Python SDK + Proxy)
**URL:** https://docs.litellm.ai/docs/ and https://github.com/BerriAI/litellm
**Date:** Actively maintained (2025–2026)
**Credibility:** 90 — Open-source, 100K+ GitHub stars, production deployments at major enterprises; well-documented capability negotiation

**Key findings:**
- LiteLLM provides a single OpenAI-compatible interface over 100+ providers (Anthropic, Gemini, Bedrock, Azure, Ollama, etc.) with automatic **capability detection** — tool-call support, streaming, vision, context length — and silently routes to a compatible model variant when a capability is unavailable. This is exactly the provider-abstraction layer the deep-research skill lacks.
- The tool-use shim challenge is real: Gemini's function-calling schema differs from Anthropic's (`function_declarations` vs `tools`); Ollama's tool-calling requires a model whose chat template explicitly supports it (which is separate from whether Ollama itself supports tool routing). LiteLLM handles these translations transparently, but only for *API-level* tool calls — it cannot abstract away Claude Code's `Task` tool, which is a harness-level primitive with no equivalent in other providers.
- For the deep-research skill, a realistic two-tier portability strategy would be: (1) LiteLLM at the API layer for model switching (Opus → Gemini 2.5 Pro → local Llama), which is achievable in 1–2 days of engineering; (2) harness-level portability (replacing `Task` tool with subprocess spawns, replacing `WebSearch`/`WebFetch` with portable HTTP calls) — which requires the subprocess architecture switch and is a separate, larger effort.

---

### Source 13

**Title:** OpenCode — Model-Neutral AI Coding Assistant for OpenShift
**URL:** https://developers.redhat.com/articles/2026/04/22/opencode-model-neutral-ai-coding-assistant-openshift-dev-spaces
**Date:** 2026-04-22
**Credibility:** 70 — Red Hat engineering blog; describes a shipping product but is primarily a product announcement rather than a deep technical reference

**Key findings:**
- OpenCode demonstrates that model-neutrality (75+ providers including Anthropic, Gemini, Ollama) is achievable for *coding* agents by avoiding harness-specific primitives (Task tool, MCP servers, WebSearch) and relying on OpenAI-compatible chat completions with tool calls. This is the portability ceiling for the current deep-research architecture: any tool or phase that requires a Claude Code harness primitive creates a portability floor that OpenCode-style approaches cannot abstract over.
- The key design choice enabling model-neutrality is keeping the agent loop in user-space code (not inside a provider's CLI), so the loop can be parameterized over providers. The deep-research skill's `claude -p` approach embeds the agent loop inside Claude Code's harness — portable in a different direction (any compute that runs Claude Code) but not provider-portable.
- Effort/reasoning-level control is the hardest portability gap: Claude has `--effort max/high/medium/low`; Gemini 2.5 has "thinking" as a boolean flag; Ollama has temperature only (no dedicated reasoning mode); GPT-4o has no effort concept at all. Any provider-portability layer must either normalize these (lossy) or expose provider-specific overrides per-provider (config-heavy).

---

### Source 14

**Title:** "Cross-Provider Skill File Portability Shim for Behavioral Constraint Preservation Across AI Tool Frameworks" — Technical Disclosure
**URL:** https://www.tdcommons.org/dpubs_series/9913/
**Date:** April 2026
**Credibility:** 65 — Technical disclosure (defensive publication), not peer-reviewed, but methodologically specific; describes a concrete mapping-table approach rather than vague aspiration

**Key findings:**
- Proposes authoring a skill instruction file in a **single canonical format** containing capability entries with execution parameters and behavioral constraints, then translating it to provider-specific adapter definitions (OpenAI function-calling JSON, Anthropic tool-use schema, LangChain Tool class stub, MCP capability manifest). Constraints with no direct target-framework equivalent are emitted as standardized annotation blocks rather than silently dropped.
- This is directly applicable to the deep-research skill's prompts: the behavioral constraints embedded in `methodology.md` (e.g., "write checkpoint after every phase," "prefer primary sources over SEO content," "check `_STOP_REQUESTED` at phase boundaries") have no machine-readable representation. They are natural-language instructions that a different provider might interpret differently or ignore. A canonical constraint schema would make cross-provider drift measurable.
- The mapping-table approach means that adding a new provider (e.g., Gemini) requires only adding a mapping entry, not rewriting methodology.md. Combined with a per-provider eval run to detect instruction-following gaps on the new provider, this gives a principled migration path.

---

### Source 15

**Title:** OpenTelemetry for AI Systems: LLM and Agent Observability (2026)
**URL:** https://uptrace.dev/blog/opentelemetry-ai-systems
**Date:** 2026
**Credibility:** 75 — Technical blog from an OpenTelemetry-aligned vendor; well-aligned with OTel GenAI semantic conventions specification

**Key findings:**
- The OpenTelemetry GenAI semantic conventions define standard span attributes: `gen_ai.system` (provider name), `gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.response.finish_reasons`. These are the minimum schema for a structured trace that any OTel-compatible backend can ingest — no vendor lock-in.
- For multi-agent pipelines, the recommended pattern is a root span per dispatch with child spans per phase and per tool call. The child span for a sub-agent Task includes: its own `trace_id` (inherited from parent for correlation), `span_name` (e.g., `retrieve.academic_lens`), `latency_ms`, `input_tokens`, `output_tokens`, and a `status` tag (`OK`, `TIMEOUT`, `ERROR`). The deep-research skill's current JSON checkpoint could emit a compatible subset of this schema with minimal changes.
- Token-cost telemetry requires provider-specific per-token pricing tables (Anthropic publishes these at `anthropic.com/pricing`; the skill currently uses rough per-run estimates). Even without an OTel backend, emitting `input_tokens` and `output_tokens` to the checkpoint's `extra` dict would allow offline cost reconstruction using the pricing table — a zero-dependency approach that does not require any external observability infrastructure.

---

## Cross-Cutting Themes

### 1. The architecture's Achilles heel is the Task tool's untimeoutability — and Anthropic has declined to fix it

Every reliability concern for runs longer than ~15 minutes traces back to the Task tool's missing `timeout` parameter (GitHub #49150, ADR-001, v15 run). The issue was closed as "not planned." This means **the subprocess architecture switch is not optional** for reaching production-grade run-success rates — it is the only available path to per-agent timeouts, crash isolation, and independent logging. The ~15–18 s overhead per run is the correct engineering trade-off, not a reason to delay.

### 2. Observability and telemetry are structurally absent — the current artifact model is a detective tool, not a diagnostic instrument

The skill has good artifact hygiene (`_checkpoint.json`, `_subagent_progress.json`, `_DONE`, `.log`/`.err` files) but these are forensic artifacts, not live telemetry. There is no `trace_id` hierarchy, no per-phase timing, no token/cost accounting, and no structured error log. Diagnosing a failed run today requires reading multiple files and mentally reconstructing the timeline. Adding OTel-compatible structured spans to `_checkpoint.json` (three new fields: `phase_latency_ms`, `token_estimate`, `error_log[]`) would make failed-run diagnosis self-contained without requiring external infrastructure.

### 3. Provider portability is blocked at two distinct layers with different effort/impact ratios

The API layer (which model is called) is abstractable via LiteLLM in ~1–2 days of engineering. The harness layer (Task tool for sub-agents, WebSearch/WebFetch/Chrome MCP for retrieval) has no portable equivalent across providers — it is Claude Code-specific by design. Any provider portability goal must first implement the subprocess architecture (replacing Task tool with `claude -p`/`subprocess.run`) and replace browser MCP with portable HTTP libraries. The effort estimate for full provider portability is 3–6 weeks, not days — and the subprocess switch (already recommended for reliability) is the prerequisite for all portability work.

### 4. Prompt quality today is measured structurally but not semantically — drift is invisible until a test run fails

`validate_report.py` and `verify_citations.py` check structure and citation format, not whether the model followed the phase instructions, produced valid phase-artifact JSON schemas, or produced factually consistent output across providers. Observed defects (fabricated stats in v14, contradicted claims in v11/v13, wrong entity relationships) were caught by the VERIFY phase — an LLM-as-judge, not a deterministic test. Adding a promptfoo-style golden dataset (10–15 topics with known ground-truth claims), trajectory assertions (did scope.md get written? did all sub-agents complete?), and cost/latency thresholds would make prompt changes *measurable* rather than vibes-based, and would catch regressions before they enter a live test run.

### 5. The subprocess architecture switch is a compounding win across all four improvement axes simultaneously

Switching sub-agents from Task tool to `claude -p` subprocess spawns is the single change with the highest cross-axis leverage:
- **Reliability:** Enables `timeout` per sub-agent, isolates crashes, eliminates the 20% hang rate.
- **Observability:** Each subprocess gets its own stdout/stderr log file, enabling per-agent token-stream inspection and structured span emission.
- **Provider portability:** `subprocess.run(["claude", "-p", ...])` is replaceable with `subprocess.run(["gemini-cli", "-p", ...])` or an API call — the subprocess contract is provider-agnostic, unlike the Task tool which is Claude Code-only.
- **Prompt quality / evaluation:** Per-subprocess output files can be fed to an eval harness independently, enabling per-lens quality scoring across providers without running a full end-to-end pipeline.

No other single change touches all four axes. Sequencing recommendation: subprocess switch first (ADR-001 already recommends it and the empirical trigger has been met), then structured telemetry additions to `_checkpoint.json` (backward-compatible), then promptfoo golden set (independent), then provider abstraction via LiteLLM (builds on subprocess work).

---

*Sources referenced: internal codebase documents (Sources 1–6) are the highest-credibility primary sources for project-specific failure modes and design decisions. External sources (7–15) provide the industry baseline against which the skill's current design can be benchmarked.*

Sources:
- [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/engineering/multi-agent-research-system)
- [GitHub Issue #49150 — Task() tool has no timeout](https://github.com/anthropics/claude-code/issues/49150)
- [AI Agent Circuit Breakers: The Reliability Pattern Production Teams Are Missing](https://dev.to/waxell/ai-agent-circuit-breakers-the-reliability-pattern-production-teams-are-missing-5bpg)
- [The Complete Guide to LLM Observability (Portkey)](https://portkey.ai/blog/the-complete-guide-to-llm-observability/)
- [Evaluate Coding Agents (Promptfoo)](https://www.promptfoo.dev/docs/guides/evaluate-coding-agents/)
- [LiteLLM — Provider Portability Gateway](https://docs.litellm.ai/docs/)
- [OpenCode: Model-Neutral AI Coding Assistant (Red Hat)](https://developers.redhat.com/articles/2026/04/22/opencode-model-neutral-ai-coding-assistant-openshift-dev-spaces)
- [Cross-Provider Skill File Portability Shim — Technical Disclosure](https://www.tdcommons.org/dpubs_series/9913/)
- [OpenTelemetry for AI Systems: LLM and Agent Observability](https://uptrace.dev/blog/opentelemetry-ai-systems)
- [GitHub — BerriAI/litellm](https://github.com/BerriAI/litellm)
- [Idempotent AI Agents: Retry-Safe Patterns for Production](https://www.buildmvpfast.com/blog/idempotent-ai-agent-retry-safe-patterns-production-workflow-2026)
- [Checkpointing Strategies for AI Systems (Medium)](https://medium.com/@arajsinha.ars/checkpointing-strategies-for-ai-systems-that-wont-blow-up-later-resumable-agents-part-4-d7a0688e6939)
- [Datadog State of AI Engineering](https://www.datadoghq.com/state-of-ai-engineering/)
- [GitHub #4744 — Agent Execution Timeout: Persistent Hanging During Complex Tasks](https://github.com/anthropics/claude-code/issues/4744)
- [GitHub #19045 — Task tool subagent processes not terminated after parent session ends](https://github.com/anthropics/claude-code/issues/19045)