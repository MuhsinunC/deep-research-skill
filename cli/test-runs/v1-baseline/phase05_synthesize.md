`★ Insight ─────────────────────────────────────`
**Synthesis methodology note:** The outline is organized by *resolved sequence* (reliability prerequisite → design abstraction → cross-axis consequences), not by the original four-axis question. I'm preserving that organization because the dependency structure between findings is itself the load-bearing insight — re-shuffling into the four-axis framing would obscure it. Connection paragraphs are added between sections to make the dependency arrows explicit rather than implicit.
`─────────────────────────────────────────────────`

# Improving the Deep Research Skill: A Synthesized Analysis

**Audience:** Maintainer of `deep-research-skill` deciding what to build next.
**Date:** 2026-05-03

---

## Executive Summary

1. The pipeline's ~20% per-run hang rate from the `Task` tool's synchronous spawn is the load-bearing reliability defect [1][2][4]; the fix (`claude -p` subprocess + shell `timeout`) is well-understood, documented in ADR-001 [1], and is a *prerequisite* for any other improvement to be measurably observable.
2. The two highest-leverage changes are complementary, not competing: the **subprocess switch** is the reliability prerequisite, and the **typed per-phase IO contract** is the design abstraction that compounds across reliability, observability, portability, and evaluation [1][6] — and they must be sequenced in that order.
3. The project's observability is currently write-only — artifacts exist [6] but carry no token counts, timing, or exit codes — and adopting OpenTelemetry GenAI Semantic Conventions [7] now is far cheaper than re-instrumenting later.
4. Provider portability is a two-layer problem that one-layer solutions (LiteLLM alone) cannot solve [9]: API-layer translation is days of work; harness-layer portability is weeks and depends on the typed IO contract.
5. Evaluation infrastructure already exists [13][14] but is purely syntactic and unwired to any regression gate; the cheap win is wiring, but the *meaningful* win requires adding semantic checks (LLM-as-judge factuality, schema compliance, trajectory assertions).

---

## Section 1 — The Reliability Crisis: Why the Subprocess Switch Is Non-Negotiable

The deep-research pipeline today fails non-deterministically about 1 in 5 runs. This isn't a tail-risk — it's the modal failure mode. The mechanism is well-characterized: `Task` tool sub-agents idle at 0% CPU with no platform-level timeout, blocking the parent indefinitely [1][4]. Empirical confirmation came in v15 run UUID E72ABA74 [4]; external corroboration arrived via GitHub issue #49150, where Anthropic closed the request for a `Task` timeout flag as "not planned" [2]. The MAST multi-agent failure taxonomy contextualizes this in the wider 41–87% multi-agent failure-rate band [3] — the deep-research skill is, if anything, on the better end of the distribution, not the worse.

The structural significance follows immediately. With the platform-side fix path closed by Anthropic [2], the only remaining option is harness-level: replace `Task`-tool spawn with `claude -p` subprocesses wrapped in shell `timeout`. ADR-001 already documents this decision and its tradeoffs in detail [1].

What makes this finding *load-bearing* — and the reason it sits in Section 1 rather than later — is its relationship to every other improvement on the table. If telemetry instrumentation, evaluation gates, or provider abstractions are added on top of a pipeline that fails non-deterministically ~20% of the time, those additions cannot be measurably evaluated. A regression gate triggered by hang-induced incompleteness cannot distinguish prompt-quality regressions from infrastructure flakiness. Telemetry over runs that didn't finish produces phantom traces. The Critical lens stated this directly: *"the subprocess switch is not an enhancement — it is a prerequisite for the other improvements to be meaningful."* Each subsequent section in this analysis depends on this one resolving.

---

## Section 2 — The Typed Per-Phase IO Contract: One Abstraction, Four Payoffs

Once Section 1's subprocess switch lands, the next-highest-leverage change is a typed per-phase IO contract: a JSON schema per phase artifact, validated on read and write, with retry-with-validation as the failure-handling primitive. This is the single highest-leverage *design* abstraction available, because it simultaneously enables four downstream improvements that Sections 3–5 will discuss in detail:

- **Reliability** — schema-validated outputs make malformed sub-agent responses recoverable rather than silent corruption.
- **Observability** — typed boundaries are the natural injection point for structured telemetry events (Section 3).
- **Portability** — provider-agnostic prompts become possible because the contract specifies output shape independent of model identity (Section 4).
- **Evaluation** — schema compliance is itself a semantic check, and the contract gives evaluation harnesses a stable target (Section 5).

Two findings make this abstraction unusually low-friction to implement. First, the contract becomes implementable only *after* the subprocess switch — sub-agents must be invokable as discrete processes with structured I/O before contract enforcement has a meaningful injection point. The apparent contradiction in the source material between "subprocess is the highest leverage" and "IO contract is the highest leverage" dissolves into a sequence: subprocess first, contract second. Second, the existing `atomic_checkpoint.py` primitive is already correctly implemented — `os.replace()` after `fsync()` on a same-filesystem `.tmp` sibling [6] — so the engineering question is *what to write into the schema*, not *how to write atomically*. The crash-safe write primitive is solved; only the type contract above it needs design.

This connects to Section 3 because the schema itself is the natural carrier for telemetry fields, to Section 4 because portable prompts require typed outputs, and to Section 5 because schema compliance is the simplest semantic check available.

---

## Section 3 — Observability Is Write-Only: The Telemetry Gap and OpenTelemetry as the Target

Build on Section 2's contract: once you have typed boundaries, the next question is what data flows across them. Today, the answer is: not enough.

The pipeline produces several artifacts — `_checkpoint.json`, `_subagent_progress.json`, `_DONE` markers, `.log`/`.err` streams [6] — but they are write-only logs in the diagnostic sense. They record that things happened. They do not record how long things took, how many tokens they consumed, what the sub-agent exit code was, or which trace correlates with which phase. Diagnosing a failed run requires manual file archaeology: `ls -lt`, `tail`, `grep`, and inference. The Critical, Historical, and Practitioner lenses converged on this without disagreement.

The instrumentation target that follows is OpenTelemetry's GenAI Semantic Conventions [7]: `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.request.model`, `gen_ai.provider.name`, `gen_ai.operation.name`, plus span timing. Adopting these conventions now — even without a backend collector — means future migration to any vendor (Datadog, Honeycomb, Phoenix, Langfuse) becomes a configuration change rather than re-instrumentation work. This is the cheapest form of optionality available: standards adoption today, backend selection later.

Connection to Section 2: telemetry additions can be made backward-compatible by extending `_checkpoint.json` with optional fields rather than schema-breaking changes. The existing checkpoint primitive [6] supports extension cleanly; the typed IO contract from Section 2 turns "optional fields" into "typed optional fields." Connection forward to Section 5: structured telemetry is itself a precondition for meaningful evaluation regression gates — without timing and token data, you cannot detect quality-vs-cost tradeoffs in prompt changes.

---

## Section 4 — Provider Portability Is Two Layers, Not One

The most common framing error in this problem space is conflating "swap the model" with "swap the provider." LiteLLM [9] solves the first cleanly: it translates Anthropic-format API calls into OpenAI, Gemini, Bedrock, or local-Ollama equivalents. What it cannot do is swap the *harness*. The Claude Code CLI flags `--effort max` and `--dangerously-skip-permissions` are not API parameters — they're agent-runtime flags that LiteLLM has no way to intercept. A `claude -p` spawn is still a Claude Code spawn, regardless of which model serves the underlying inference requests.

The Historical lens framed LiteLLM as the portability solution; the Critical and Practitioner lenses corrected this with a two-tier framing: LiteLLM solves layer 1 (API translation) in 1–2 days, while harness-level portability requires replacing the spawn mechanism itself and is a 3–6 week effort. The Critical lens was technically precise here; the Historical framing conflated two distinct abstraction boundaries.

Provider assumptions are pervasive throughout the codebase: `claude -p`, `--model opus`, `--effort max`, `--dangerously-skip-permissions`, the `Task` tool, the `CLAUDE_CODE_DEEP_RESEARCH_WORKER` env-var, and tmux session naming all hardcode the Claude Code harness. No interface boundary currently exists. Genuine portability requires defining one.

Connection backward to Section 2: the typed IO contract is the connective tissue that makes layer-2 portability tractable. Without it, sub-agent prompts and outputs are entangled with Claude-Code-specific assumptions about Task-tool behavior, MCP servers, and effort-level resolution. With it, provider-agnostic prompts have a stable target shape. Connection backward to Section 1: the subprocess switch is itself the first concrete portability move — `claude -p` is a process; once the harness boundary is "any process that conforms to the IO contract," other harnesses become substitutable.

---

## Section 5 — Prompt Quality: Cheap Wiring vs. Meaningful Coverage

The evaluation harness `validate_report.py` [13] already loads reports, iterates checks, and emits pass/fail. Wiring it to a CI-triggerable regression gate is a low-effort change — hours of work, not days. The Academic lens correctly identified this mechanism as near-complete.

But the Critical and Practitioner lenses correctly identified the coverage gap: all 9 existing checks in `validate_report.py` are *syntactic*, not *semantic*. A report can pass every check while containing 100% fabricated citations to non-existent URLs, invalid phase-artifact schemas, or factually inconsistent content. The Academic lens conflated harness mechanism with evaluation coverage — they're answering different questions.

The operational implication is sharp: wiring the gate without adding semantic checks creates a *false signal of quality*. CI would turn green on regressions that the harness can't see. The minimum viable additions are:

1. **LLM-as-judge factuality checks** against retrieved sources (per phase artifact).
2. **Schema compliance validation** per phase output (made trivial by Section 2's IO contract).
3. **Trajectory assertions** — did the sub-agent follow the phase instructions, or did it improvise?
4. **Prompt-version identifiers** in artifacts, enabling A/B comparison across runs.
5. **A golden test set** of input topics with reference outputs, run on every prompt change.

Connection to Sections 2 and 3: schema compliance becomes free once the IO contract exists; trajectory assertions become tractable once telemetry captures per-phase tool calls. The evaluation problem decomposes cleanly *after* the prerequisites are in place. Without them, semantic eval is custom-built per check; with them, it's a uniform layer over typed events.

---

## Section 6 — Architectural Validation and Misleading Baselines

Three findings in this section sit together because they're three sides of the same coin: what the architecture got right, what's still right today, and what was never actually measured at the configuration the operator believed.

**What the architecture got right:** The hybrid Opus-orchestrator + Sonnet-sub-agent design that the skill independently converged on matches Anthropic's own production multi-agent research system, which reported a 90.2% improvement over single-agent Opus on internal benchmarks [8]. This is first-party external validation of an architectural choice that was made on local reasoning. It's a strong result.

**What's still right today:** The current `SKILL.md` description was once flagged as "passive," but ground-truth verification against the live skill list shows it contains *both* directive elements: an "ALWAYS invoke for deep research..." affirmative *and* a "Do not attempt research directly — use this skill first" negative constraint [15]. This puts activation behavior near the ~100% bare-condition rate observed in the 650-trial consistency-hardening study [10], not the ~77% passive-description rate. The "passive description" critique was either out-of-date or referencing a different file.

**What was never actually measured at the intended configuration:** Pre-v14 quality benchmarks should not be used as max-effort baselines. The `zsh -c` shell-init gap meant the operator-intended `CLAUDE_CODE_EFFORT_LEVEL=max` was silently absent in pre-v14 sub-process spawns — they ran at default-medium effort [1][5]. All historical "success" data prior to v14 reflects medium-effort behavior, not max. Any future A/B comparison or regression detection must use post-v14 baselines exclusively, and benchmarks must mechanically verify effort level inside the spawned process before recording results.

The through-line: external validation alone is insufficient if internal benchmarks were never measured at the intended configuration. The architecture is well-chosen, the activation pattern is well-formed, but the historical performance data is unreliable as a comparison baseline.

---

## Section 7 — The Meta-Pattern: Reactive Accumulation as a Risk Signal

The current spawn template bundles at least five distinct bug fixes — `< /dev/null` stdin redirect, `_starting.txt` pre-spawn marker, env-guard against double-spawning, `[ROLE-CHECK-WRAPPER]` echo for log forensics, and named tmux sessions — each added after a real failure. This is the architecture of a system being patched reactively, not designed proactively. The Practitioner lens flagged this explicitly; the Historical lens implicitly through repeated ADR reversal patterns.

A real, high-impact failure mode that exemplifies the risk: compaction-induced output-file deletion (Issue #23821) caused one documented case to lose 10 of 14 output files [11]. The disk-based handoff model is the correct mitigation, but `--dangerously-skip-permissions` in nohup mode means there's no graceful pause as the compaction window approaches. Each new failure mode produces a new patch; the patches accumulate; eventually the spawn template becomes the most fragile part of the system.

The proposed direction — formal reliability model with subprocess + typed IO contract + structured telemetry — converts the architecture from a *patch-accretion pattern* to a *contract-enforced pattern*. This is a one-time cost that ends recurring one-off cost. The connection to all prior sections: every section's recommendation contributes to this conversion. Subprocess (Section 1) replaces the failure-prone Task spawn. IO contract (Section 2) replaces the implicit coupling between phases. Telemetry (Section 3) replaces post-hoc forensics with first-class diagnostics. Provider abstraction (Section 4) replaces hardcoded harness coupling. Evaluation gates (Section 5) replace manual quality regression detection. The five recommendations form a single coherent program, not a menu.

---

## Recommendations: A Sequenced Roadmap

The sequencing *is* the recommendation. Each step unlocks the next.

1. **Subprocess switch** (`Task` → `claude -p` + shell `timeout`) — *the reliability prerequisite.* Hours-to-days. Eliminates the ~20% hang rate. Without this, every other measurement is noisy.
2. **Backward-compatible telemetry extensions** to `_checkpoint.json` (token counts, per-phase wall-clock, exit codes, OpenTelemetry GenAI trace IDs) [7] — days. No schema break; immediate diagnostic value.
3. **Typed per-phase IO contract** (JSON schema per phase artifact, validate on read/write, retry-with-validation) — 1–2 weeks. Compounds across all four axes.
4. **Wire `validate_report.py` to a CI regression gate** + add semantic checks (LLM-judge factuality, schema compliance, trajectory assertions, prompt-version IDs, golden test set) — 1–2 weeks for the gate, ongoing for the golden set.
5. **Provider abstraction** — LiteLLM for the API layer (1–2 days) [9], then portable retrieval/web-fetch libraries replacing harness-specific calls (3–6 weeks). The IO contract from step 3 is the connective tissue.

**Quick wins (days of work):** Steps 1, 2, and the LiteLLM portion of step 5. **Structural changes (weeks):** Steps 3, 4, and the harness portion of step 5. A maintainer with limited time should do steps 1 and 2 immediately and treat steps 3–5 as a coherent next program.

---

## Limitations

Three caveats apply to this synthesis.

**Two unresolved external-statistic contradictions.** The Datadog *State of AI Engineering 2026* [12] error-rate figures (5% vs 2%, 60% vs 33% rate-limit share) and the UserPromptSubmit hook-regression activation rate (37% vs 50%) [10] both originate from the same primary sources but were transcribed differently across lenses. The qualitative findings hold — rate limits are a top-N production error class; UserPromptSubmit hooks regressed in March 2026 — but the specific numbers should not be cited downstream until reconciled. **Operational lesson:** future research dispatches should capture snapshot dates and direct-page URLs for any external statistic, not just the parent report URL.

**Asymmetric source visibility in the triangulation.** Only the Academic lens's insight summary was directly auditable; its 13 structured source analyses were referenced but not visible in the concatenation. Where Academic disagrees with the other three lenses (notably Resolved Contradictions #1 and #3), evidence weight tilts toward the lenses with full source detail.

**Pre-v14 baselines are unusable as max-effort comparisons.** Any A/B comparison or regression-detection framework must use post-v14 baselines exclusively, and future benchmarks should mechanically verify effort level inside the spawned process before recording results [1][5].

A fourth, softer assumption: this analysis treats deep-research as a Claude-Code-first skill that *also* supports other providers, rather than a provider-neutral library that *also* runs in Claude Code. The two framings produce different prioritizations of step 5. The roadmap above assumes the former. A maintainer who wants the latter should move step 5 earlier and accept a longer timeline before steps 3–4 are realized.

---

`★ Insight ─────────────────────────────────────`
**Two structural choices in this synthesis worth making visible:**
1. **Sections are connected with explicit forward/back references** ("Connection to Section X..."), not just shared topic tags. The dependency arrows are the load-bearing finding — readers who skim section headings still see the sequence.
2. **Section 6 deliberately mixes "validated" and "misleading" findings** under one heading because they share a through-line: external validation alone is insufficient if internal benchmarks were never measured at the intended configuration. Splitting them would lose the lesson.
`─────────────────────────────────────────────────`

**Word count:** ~2,650 words.