Now I have enough primary and secondary evidence to write the structured findings document. Let me compose it.

---

# Deep Research CLI — Critical Lens Findings

**Analyst:** Deep-research sub-agent, critical specialization
**Date:** 2026-05-03
**Scope:** Reliability, observability, provider portability, and prompt quality of the `deep-research-cli` project at `/Users/user/Documents/Muhsinun/Projects/GitHub/deep-research-skill/`
**Method:** Full codebase read, test-run log analysis, ADR archaeology, external literature search. Internal artifacts (test logs, ADR, scripts) are treated as primary sources and weighted more heavily than external commentary.

---

## Sources

---

### Source 1 — Internal: Test-Run Log (`notes/test-run-log.md`)

**URL:** `file://notes/test-run-log.md` (local)
**Date:** 2026-04-07 (most recent entry)
**Credibility: 98/100** — primary empirical evidence; each row is a timestamped, reproducible experiment with explicit failure annotations.

**Key findings:**
- v14 (UUID A664CE38) ran at `Opus 4.6 DEFAULT MEDIUM` instead of `max` because the effort env-var was never propagated to the spawned subprocess — a silent misconfiguration that polluted 8 prior runs the same way. All pre-v14 runs implicitly ran at medium effort despite the operator believing they were at max.
- v15 (UUID E72ABA74) was the first true max-effort run. Of 4 parallel Task-tool retrieval sub-agents, 2 completed and 2 hung indefinitely at 0% CPU. The parent blocked for 35+ minutes with no recovery path — confirming the ADR-001 failure hypothesis empirically for the first time.
- The log contains no token-per-phase counts, no per-agent latency, no source-quality distribution histograms, and no cross-run delta comparisons. Every run is independently eyeballed; there is no machine-readable regression signal.

---

### Source 2 — Internal: ADR-001 (`notes/adr/001-task-tool-vs-claude-p-subagents.md`)

**URL:** `file://notes/adr/001-task-tool-vs-claude-p-subagents.md` (local)
**Date:** 2026-04-07 (updated after v15 failure)
**Credibility: 97/100** — architectural decision record with pre- and post-empirical revision; the update explicitly reverses the original conclusion in light of observed data.

**Key findings:**
- The Task tool has no `timeout` parameter and no per-agent heartbeat. A hung sub-agent blocks the entire parent synchronously — there is no escape hatch short of killing the parent process.
- The comparison matrix (10 dimensions) shows `claude -p` subprocess spawns win on every isolation dimension (crash containment, timeout control, rate-limit scope, per-agent logs) but lose on spawn overhead (~15-18s per deep run), "wait for all" elegance, and methodology complexity.
- The ADR explicitly recommends switching to `claude -p` subprocess sub-agents but notes the switch is "planned but not yet implemented" — leaving a 20%-per-run hang risk in production.

---

### Source 3 — Internal: Platform Constraints Research (`notes/research/platform-constraints.md`)

**URL:** `file://notes/research/platform-constraints.md` (local)
**Date:** 2026-03-22
**Credibility: 95/100** — aggregates 35+ documented GitHub issues and third-party test data; internal research memo with cited external primary sources per claim.

**Key findings:**
- Context compaction silently deletes sub-agent output files when it triggers mid-pipeline (Issue #23821). In one documented case only 4 of 14+ output files survived. The current skill's file-based handoff model is the correct mitigation, but the `--dangerously-skip-permissions` spawn flag in `nohup` mode means there is no graceful stop if the subprocess is approaching compaction.
- Background agents (`run_in_background=true`) lose conversational output at ~70% rate; the skill's explicit Write-tool-in-prompt workaround addresses this but is a band-aid, not a fix.
- The effective reliable context window for Opus 4.6 is ~200-256K, not the marketed 1M; beyond ~300-400K, retrieval degrades measurably. Ultra-deep runs with 4+ sub-agents risk hitting this limit during Phase 5 SYNTHESIZE when all sub-agent outputs are read back.

---

### Source 4 — Internal: SKILL.md + methodology.md (canonical specification)

**URL:** `file://skill/SKILL.md`, `file://skill/reference/methodology.md` (local)
**Date:** Current HEAD
**Credibility: 95/100** — the authoritative specification; gaps in it are the definition of what the skill cannot guarantee.

**Key findings:**
- Provider assumptions are pervasive and un-abstracted. The spawn command hard-codes `claude -p --model opus --effort max --dangerously-skip-permissions`. The env-var `CLAUDE_CODE_DEEP_RESEARCH_WORKER` is a Claude Code–specific runtime contract. The Task tool sub-agent spawn (`model="sonnet"`) is a Claude Agent SDK–only parameter. None of these have provider-agnostic equivalents or shims.
- Phase outputs are specified in natural language (`plan.md`, `phase03_retrieve_<lens>.md`, etc.) with no machine-readable schema. The resume protocol must infer phase completion from filename presence — a heuristic that fails when a phase writes multiple intermediate files before its canonical output.
- The methodology embeds prompts and persona instructions inline (e.g., "think through 3 alternative framings," "produce pro/con query pairs") with no version identifier, no parameterization, and no evaluation rubric. Changes are un-auditable.

---

### Source 5 — Internal: `atomic_checkpoint.py`

**URL:** `file://skill/scripts/atomic_checkpoint.py` (local)
**Date:** Current HEAD
**Credibility: 98/100** — actual implementation; behavior is definitively readable.

**Key findings:**
- Atomicity is correctly implemented: `os.replace()` after `fsync()` on a `.tmp` sibling, which guarantees no torn writes on POSIX. This is the right primitive.
- The checkpoint schema (`phase_completed`, `next_phase`, `timestamp`, optional `extra`) is open-form: the `extra` dict accepts arbitrary keys. This is flexible but means there is no enforced per-phase output contract. A phase could write a checkpoint claiming `phase_completed: RETRIEVE` with zero sources if the LLM chooses to skip the work — the checkpoint will atomically record the lie.
- No token count, no per-phase elapsed time, no source count, no credibility distribution are persisted to the checkpoint by default. All these would require the LLM to self-report into the `extra` dict, which is advisory rather than enforced.

---

### Source 6 — Internal: `validate_report.py`

**URL:** `file://skill/scripts/validate_report.py` (local)
**Date:** Current HEAD
**Credibility: 98/100** — actual implementation.

**Key findings:**
- The validator runs 9 structural checks (section presence, citation formatting, bibliography completeness, placeholder detection, word count). All checks are syntactic — none are semantic. A report can pass all 9 checks while containing 100% fabricated citations to non-existent URLs.
- The bibliography truncation detection (`[8-75]` range patterns, "Additional citations" phrases) is the most valuable check; it catches the most common bibliography corruption pattern observed in practice.
- No cross-run comparison, no source-credibility histogram, no LLM-as-judge semantic check, and no per-claim verification status are part of the validation surface. The `verify_citations.py` script adds DOI resolution, but is a separate invocation and not enforced by the validation loop.

---

### Source 7 — External: Anthropic Engineering Blog — "How We Built Our Multi-Agent Research System"

**URL:** [https://www.anthropic.com/engineering/multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system)
**Date:** 2025
**Credibility: 92/100** — primary source from the system's creator; self-reported, not independently verified, but detail-rich.

**Key findings:**
- Anthropic's production system uses **rainbow deployments** (gradual traffic shifting between versions) and **checkpoint-and-resume** as first-class reliability primitives — not afterthoughts. The current deep-research skill has checkpoint/resume but no deployment versioning or gradual rollout concept.
- Observability focuses on diagnosing *decision patterns* — search query quality, source selection, tool use distribution — not just conversation contents. The current skill's artifact model (phase files + `_DONE`) provides no queryable decision trace.
- A key discovery from production: without explicit source quality heuristics, agents "gravitate toward SEO-optimized content farms over authoritative sources." This failure mode was documented and addressed in methodology.md, confirming the guidance is evidence-based. However, enforcement is prompt-level only — no structural check validates that retrieved sources meet the stated credibility floor.

---

### Source 8 — External: GitHub Issue #49150 — Task() Tool Has No Timeout

**URL:** [https://github.com/anthropics/claude-code/issues/49150](https://github.com/anthropics/claude-code/issues/49150)
**Date:** 2026-04-16
**Credibility: 90/100** — confirmed bug report with reproduction steps and timeline; filed 9 days after v15 confirmed the same failure mode in this project.

**Key findings:**
- The failure manifests as a stdio/IPC deadlock where the sub-agent's tool-call return value never reaches the parent. The parent blocks indefinitely in `status: in_progress` with no timeout, no watchdog, and no heartbeat.
- The hang is not Linux-specific: the issue reports Windows 11, while v15 in this project observed the identical pattern on macOS. This is a cross-platform, fundamental architectural gap in the Task tool.
- 35K+ tokens are consumed during the hang as the agent loop continues generating. The only documented workarounds are (1) breaking work into smaller chunks and (2) manual force-kill and cleanup — neither of which is automatable within the current pipeline architecture.

---

### Source 9 — Internal: Consistency Hardening Research (`notes/research/consistency-hardening-research.md`)

**URL:** `file://notes/research/consistency-hardening-research.md` (local)
**Date:** 2026-03-25
**Credibility: 90/100** — synthesized from a 650-trial empirical study with statistical modeling (logistic regression), plus official Anthropic documentation; quality is unusually high for a secondary research memo.

**Key findings:**
- The 650-trial study (Ivan Seleznov, March 2026) shows that skill description wording is the dominant activation lever: Variant C (directive formula with "ALWAYS invoke" + negative constraint) achieved 100% activation in bare conditions with no hooks, vs. ~50% for passive descriptions.
- A `UserPromptSubmit` hook without CLAUDE.md reinforcement actually *hurts* passive descriptions (87.5% → 37%). The dual-mechanism (hook + CLAUDE.md) is required for robustness against the March 2026 hook-ignoring regression.
- Phase compliance (the skill loads but skips phases) is a distinct problem from activation. Stop hooks with `decision: block` can enforce phase completion but have a 60s execution timeout, which is too tight for full pipeline verification. The recommended approach (checkpoint file + Stop hook + inline markers) addresses this but requires three redundant mechanisms to be reliable.

---

### Source 10 — External: OpenTelemetry GenAI Semantic Conventions

**URL:** [https://opentelemetry.io/docs/specs/semconv/gen-ai/](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
**Date:** Ongoing (v1.37 as of 2026)
**Credibility: 95/100** — official specification from the OpenTelemetry project; experimental status but widely adopted (Datadog, Uptrace, OpenObserve implement it natively).

**Key findings:**
- The GenAI conventions define `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.request.model`, `gen_ai.provider.name`, `gen_ai.operation.name` as span-level attributes, with separate conventions for agents (`gen_ai-agent-spans`), metrics, and events. These are exactly the fields missing from the current skill's checkpoint schema.
- Adopting OTel GenAI conventions in `atomic_checkpoint.py` (writing OTel-compatible JSON events to a per-run JSONL sidecar) would make runs queryable by any OTel-compatible backend without custom tooling.
- The multi-agent extension (task, action, agent-team, memory, artifact tracking) is under active development, which means aligning now avoids a re-instrumentation cost later.

---

### Source 11 — External: LiteLLM — Claude Code with Non-Anthropic Models

**URL:** [https://docs.litellm.ai/docs/tutorials/claude_non_anthropic_models](https://docs.litellm.ai/docs/tutorials/claude_non_anthropic_models)
**Date:** Current (2026)
**Credibility: 88/100** — official product documentation; self-serving but technically accurate for the described capability.

**Key findings:**
- LiteLLM acts as a local proxy that accepts Anthropic Messages API requests from `claude -p` and translates them to any supported provider (Gemini, Ollama, OpenAI, Bedrock). This means the outer spawn command (`claude -p ... --model opus`) can route to a non-Anthropic backend without changing the skill's prompt text.
- However, LiteLLM's translation preserves the Anthropic *format* but not Anthropic-specific parameters: `--effort max` and `--dangerously-skip-permissions` are Claude Code CLI flags that the proxy cannot intercept. The spawned `claude -p` process is still Claude Code; only the model serving the requests changes.
- Genuine provider portability — running the pipeline on Gemini CLI or Ollama as the orchestrating agent — requires replacing the spawn mechanism itself, not just the model endpoint. This is a fundamentally different and larger scope.

---

### Source 12 — External: Datadog State of AI Engineering 2026

**URL:** [https://www.datadoghq.com/state-of-ai-engineering/](https://www.datadoghq.com/state-of-ai-engineering/)
**Date:** 2026
**Credibility: 80/100** — proprietary survey; methodology not fully disclosed; but broad sample (Datadog customer base) and quantitative findings.

**Key findings:**
- As of February 2026, 5% of all LLM call spans report an error; 60% of those errors are caused by exceeded rate limits. For a research pipeline making 50-100 LLM calls per deep run, the expected rate-limit-induced failure probability is ~6-10% per run assuming independent errors — comparable to the observed Task-tool hang rate.
- Production multi-agent systems with >5 concurrent agents show dramatically higher error rates than single-agent systems, driven primarily by rate-limit cascades. This corroborates the 2026-04-25 incident where ~14 parallel dispatches hit the Anthropic quota window mid-pipeline.
- Token cost visibility is identified as the top unmet observability need: 67% of teams lack per-request cost attribution at the level of individual agent actions. The current skill has zero cost telemetry.

---

### Source 13 — Internal: Self-Improvement Research Synthesis (`notes/research/self-improvement-research/synthesis.md`)

**URL:** `file://notes/research/self-improvement-research/synthesis.md` (local)
**Date:** 2026-03-22
**Credibility: 85/100** — internal research report produced by the skill itself on its own improvement; meta-evaluation caveat applies (self-reported), but evidence-linked with specific GitHub issues and Anthropic engineering blog citations.

**Key findings:**
- The highest-impact improvement identified was an LLM-as-judge self-evaluation phase (structured rubric scoring factual accuracy, citation accuracy, completeness, source quality, coherence) targeting 0.80+ Spearman correlation with human judgment.
- Progress reporting (currently implemented), source preference heuristics (currently implemented), and checkpoint/resume (currently implemented) were the top 3 recommendations — all of which have since been built. The v12-v15 generation closed the known gap from the v2-v9 baseline.
- The analysis did not address prompt versioning, evaluation harness, or provider portability — these gaps are new as of this writing.

---

### Source 14 — External: Augment Code — Why Multi-Agent LLM Systems Fail

**URL:** [https://www.augmentcode.com/guides/why-multi-agent-llm-systems-fail-and-how-to-fix-them](https://www.augmentcode.com/guides/why-multi-agent-llm-systems-fail-and-how-to-fix-them)
**Date:** 2026
**Credibility: 72/100** — vendor-authored guide; practical but promotional; findings consistent with primary sources.

**Key findings:**
- Infrastructure issues (rate limits, context overflow, cascading timeouts) cause fewer total failures than specification or coordination issues but produce "the most visible disruptions." This maps directly to the v15 hang and the 2026-04-25 quota incident.
- The guide recommends circuit breakers (provider-level failure detection that opens a breaker after N consecutive failures, preventing further calls until a cooldown) as the highest-ROI reliability primitive for multi-agent pipelines. No equivalent exists in the current skill.
- Dead-letter artifact patterns (saving failed sub-agent work to a named failure directory rather than discarding it) are recommended for post-mortem recovery. The current skill has no dead-letter pattern — a hung sub-agent leaves no recoverable artifact.

---

## Cross-Cutting Themes

### Theme 1: The Reliability Floor Is the Task Tool

Every observed run failure that is not operator-induced traces to one of two Task-tool failure modes: (a) synchronous parallel spawns that block the parent when any sub-agent hangs (v15 empirical, GitHub #49150 confirmed), and (b) context-compaction-induced file deletion when a sub-agent's output is not yet written to disk (platform-constraints §1, §7). The skill has built an excellent disk-based handoff model that addresses (b) in most cases, but (a) requires the ADR-001 architecture switch to `claude -p` subprocesses with per-agent timeouts. All other reliability improvements (retry logic, circuit breakers, dead-letter artifacts) sit on top of a foundation that has a ~20% per-run chance of requiring manual intervention. **The subprocess switch is not an enhancement — it is a prerequisite for the other improvements to be meaningful.**

---

### Theme 2: Observability Is Write-Only; There Is No Read Path

The current skill emits substantial artifacts per run: `_checkpoint.json`, `_subagent_progress.json`, `_DONE`, `_starting.txt`, `research-tasks.json`, `.log`, `.err`, and one markdown file per phase. This is excellent write-side discipline. But the read side — the operator's ability to diagnose a failed run from artifacts alone — is severely limited: no token counts, no per-phase latency, no source-quality distribution, no cross-run regression signal. An operator investigating a v15-style hang must manually inspect `research-tasks.json`, the tmux log, and each phase file's mtime to reconstruct what happened. Adding an OTel-compatible JSONL event sidecar (written atomically alongside `_checkpoint.json` with token counts, phase elapsed time, sub-agent outcome codes) would close this gap without changing the existing artifact schema.

---

### Theme 3: Claude Agent SDK Assumptions Are Everywhere and Invisible

The skill does not declare its provider dependencies — they are scattered throughout SKILL.md, the spawn template, and the methodology in implicit forms: the Task tool (Claude-SDK-only), `--model opus` (Anthropic-only), `--effort max` (Claude Code CLI only), `--dangerously-skip-permissions` (Claude Code CLI only), `CLAUDE_CODE_DEEP_RESEARCH_WORKER` (this project's own env-var contract), tmux session naming, and the `research-tasks.json` registry format. None of these have a clean interface boundary. A Gemini CLI or local Ollama backend cannot satisfy any of these constraints without replacing the spawn mechanism wholesale. LiteLLM can route the model serving but cannot replace Claude Code as the agent runtime. **Provider portability requires defining a capability interface (what the runtime must support) and isolating the provider-specific spawn from the provider-agnostic pipeline. That interface does not currently exist.**

---

### Theme 4: Prompt Quality Is Vibes-Based — No Measurement Exists

The pipeline's per-phase prompts (embedded in methodology.md) have been iteratively improved based on test run observations (v10 found 1 CONTRADICTED claim, v13 found 2 CONTRADICTED claims that triggered loop-backs, v14 caught fabricated productivity numbers and wrong arXiv IDs). These are valuable real-world signal, but the evaluation is entirely manual, retrospective, and undocumented as a rubric. There is no golden test set, no prompt-version identifier, no A/B testing mechanism, and no structural eval that distinguishes "instruction-following gaps" from "model capability limits." The consistency hardening research (Source 9) provides the missing rubric template for skill activation, and the Anthropic production system (Source 7) provides the reference architecture for rubric-based quality scoring — but neither has been applied to the per-phase prompts themselves. A minimum viable eval harness would require: (1) 5-10 golden topics with known-correct answers, (2) per-phase expected output schemas, and (3) an automated scorer for citation accuracy and schema compliance.

---

### Theme 5: The Typed Per-Phase IO Contract Is the Compounding Win

Four of the six sub-questions converge on the same missing primitive: a machine-readable, versioned schema for what each phase must accept as input and produce as output. Such a contract simultaneously enables: (1) **retry-with-validation** — a phase whose output fails schema validation can be retried without re-running prior phases; (2) **structured artifacts** — the checkpoint can include typed counts (sources, claims, verified citations) rather than open-form dicts; (3) **provider-agnostic prompts** — the prompt can reference the IO schema rather than Claude-specific mechanisms; (4) **golden-set evals** — a golden run's per-phase outputs become typed fixtures for regression testing. The current architecture partially achieves this through canonical filenames and the `validate_report.py` structural checker, but both are post-hoc and untyped. Defining Pydantic models (or equivalent) for each phase's output — even informally — is the highest-leverage single change across all four improvement axes. It is also backwards-compatible: the schema can be introduced as validation middleware without changing the pipeline's external interface.

---

*Sources: [Anthropic Engineering Blog](https://www.anthropic.com/engineering/multi-agent-research-system) · [GitHub Issue #49150](https://github.com/anthropics/claude-code/issues/49150) · [OpenTelemetry GenAI Conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) · [LiteLLM Docs](https://docs.litellm.ai/docs/tutorials/claude_non_anthropic_models) · [Datadog State of AI Engineering](https://www.datadoghq.com/state-of-ai-engineering/) · [Augment Code Multi-Agent Failures](https://www.augmentcode.com/guides/why-multi-agent-llm-systems-fail-and-how-to-fix-them) · Internal codebase artifacts (test-run-log, ADR-001, platform-constraints, consistency-hardening-research, SKILL.md, atomic_checkpoint.py, validate_report.py)*