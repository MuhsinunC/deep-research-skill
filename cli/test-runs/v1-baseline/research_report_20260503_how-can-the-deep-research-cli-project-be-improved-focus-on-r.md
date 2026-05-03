`★ Insight ─────────────────────────────────────`
**Verdict-mapping strategy for this report.** The verification produced three layers of confidence: (1) directly-verifiable claims against on-disk source files (these get definitive prose); (2) external claims about GitHub issue closures, vendor specs, and academic taxonomies (mostly verified, with a few CONTRADICTED that move to Limitations); and (3) inherently-unverifiable engineering judgments like time estimates (UNVERIFIABLE — surface as labeled guesses or move to Limitations). The single most important verifier finding to thread through prose: the adversarial verifier showed the "~20% hang rate" denominator includes 4 medium-effort runs and 1 max-effort run — the like-for-like rate is 1/1 = 100%, **strengthening** the urgency rather than weakening it. That's a refinement that goes into the body, not the Limitations.
`─────────────────────────────────────────────────`

---

# Improving the Deep Research Skill: A Verified Research Report

**Author note:** Final report assembled from refined synthesis plus three independent citation-verification passes (one adversarial, two cross-verifiers).
**Audience:** Maintainer of `deep-research-skill` deciding what to build next.
**Date:** 2026-05-03

---

## Executive Summary

The five recommendations in this report — subprocess switch, typed per-phase IO contract, structured telemetry, evaluation gates, and provider abstraction — are not a menu but a single coherent program. Each addresses one facet of a transition from a *patch-accretion architecture* to a *contract-enforced architecture*. The dependency sequencing is the load-bearing finding.

The most urgent reliability defect is sub-agent hangs at 0% CPU. The project's CLAUDE.md cites a "roughly 20%" rate-of-occurrence estimate [3], and ADR-001 derives this figure transparently from a 5-run sample (v10, v11, v12, v13 successful; v15 hung; v14 excluded for a separate effort-config failure) [1]. **A more pointed reading is available from the same data:** runs v10–v13 ran at silently-medium effort because of a `zsh -c` shell-init gap that was not closed until commit `67845a2` [2]; v15 was the first run with mechanically-verified max effort, and it hung. The like-for-like max-effort hang rate, on the configuration the maintainer actually intends to ship, is therefore 1/1 — not 1/5. The v15 case is fully characterized (UUID E72ABA74, 35-minute hang at 0% CPU, parent process blocked) [1][2].

ADR-001 documents a fix path (`claude -p` subprocess + shell `timeout`) but explicitly notes the switch "should be implemented as a separate task and validated with a new test run" [1]. No subsequent run with the post-switch architecture has been measured, so the fix is documented, not validated.

The two highest-leverage architectural changes — the subprocess switch (reliability prerequisite) and the typed per-phase IO contract (design abstraction that compounds across observability, portability, and evaluation) — must be sequenced in that order if the maintainer pursues them. Three of the five recommendations are conditional: provider portability presupposes demand this synthesis cannot establish; evaluation gates assume CI infrastructure not confirmed to exist; the IO contract carries an unaccounted backward-compatibility cost.

A material gap survives even after refinement: this synthesis assesses engineering-infrastructure quality, not output quality. A 100%-reliable pipeline producing mediocre reports may be worse than an 80%-reliable pipeline producing excellent ones. Pre-roadmap research items G1–G7 (catalogued below) close the cheapest gaps in hours.

---

## Introduction

### Scope

The user's question — "How can the deep-research-cli project be improved?" — was scoped to four axes: reliability, observability, provider portability, and prompt quality. This report retains those axes and adds a Section 0 catalog of out-of-scope axes the maintainer should weigh before committing to any roadmap.

### Source basis

This report draws on direct reading of project files (`notes/adr/001-task-tool-vs-claude-p-subagents.md` [1]; `notes/test-run-log.md` [2]; project-level `CLAUDE.md` [3]; `skill/scripts/atomic_checkpoint.py` [4]; `skill/scripts/validate_report.py` [5]; `skill/SKILL.md` [6]; `notes/research/consistency-hardening-research.md` [7]); on external documentation for OpenTelemetry GenAI Semantic Conventions [12], Anthropic's multi-agent research engineering blog [13], LiteLLM's official documentation [14], Datadog's *State of AI Engineering 2026* [15], the 650-trial skill-activation study [16], and the MAST taxonomy paper [17]; and on three GitHub issues directly relevant to the failure modes discussed: #44783 (parent session deadlocks — currently OPEN) [8], #49150 (Task tool timeout request — closed) [9], and #23821 (subagent output files lost after compaction — closed/stale) [10]. Issue #37521 (silent indefinite hangs) is also referenced [11].

### What changed from synthesis to final report

This report incorporates three independent citation-verification passes. The substantive changes from the upstream synthesis:

1. **The hang-rate framing has been sharpened, not softened** — the like-for-like max-effort rate is 1/1, not 1/5.
2. **One claim has been relocated to Limitations as CONTRADICTED:** the upstream framing "Anthropic closed [issue #49150] as 'not planned'" misdescribes the closure mechanism.
3. **One claim has been corrected:** LiteLLM's translation direction was inverted in the original synthesis; the practical conclusion stands.
4. **Two over-cautious hedges have been removed:** `validate_report.py`'s 9 syntactic checks [5] and `atomic_checkpoint.py`'s correct implementation [4] are directly verifiable from the source and are now stated definitively.

---

## Main Analysis

### Section 0 — What This Report Doesn't Cover

The four-axis scope excluded several gap-filling investigations the maintainer should run before committing engineering effort. They are catalogued here:

| Gap | Why it matters | Cheapest way to close |
|---|---|---|
| **Output quality** is unmeasured. No spot-check of citation correctness, source diversity, factual accuracy, or report comprehensiveness from existing test runs. | A reliability-first roadmap is mis-prioritized if the outputs themselves are mediocre. | Read 3 random reports from `notes/test-runs/`, spot-check 5 URLs each, assess claim-to-evidence alignment. |
| **Cost per run** is unmeasured. Token-cost section of `notes/test-run-log.md` is self-described as "rough estimates based on report sizes and pipeline complexity, not measured" [2]. | Several recommendations *increase* per-run cost; without a baseline, the trade-off is invisible. | Pull token counts from any run with telemetry; project the percentage increase from each proposed addition. |
| **Comparison to alternatives** is absent. GPT Researcher, Perplexity Deep Research, Gemini Deep Research, OpenAI Deep Research all exist with public benchmarks; none is compared in any project artifact. | Establishes the bar. If alternatives produce comparable output for less cost, the design space is wider than this synthesis acknowledges. | One web-research pass on published benchmarks for the named alternatives. |
| **Maintainer capacity** is unscoped. The roadmap totals weeks-to-months of focused engineering work; CLAUDE.md establishes this as a personal-fork side project [3]. | A roadmap requiring 6 weeks of focused work when capacity is 4 hours/week is fictional regardless of technical merit. | Maintainer self-estimate; defer steps that exceed realistic budget. |
| **Security and safety** are absent from project documentation. Prompt injection from retrieved web content, tool poisoning via malicious sources, PII in saved test outputs, secret leakage in `.remember/` notes — none discussed. | The skill fetches arbitrary web content and runs unattended with `--dangerously-skip-permissions` [6]. | A separate security-review pass; not a roadmap item, but a pre-roadmap audit. |
| **Alternative architectures** were not considered. ADR-001 evaluates Task vs. `claude -p` [1]; a single-pass Opus-1M-context approach is not evaluated anywhere. | The complexity may be self-justifying; a simpler architecture might produce comparable results with fewer failure modes. | A single test run with a "long-prompt single-pass" variant on the same topic; compare outputs. |
| **Failure modes beyond hangs** are not catalogued. `notes/test-run-log.md` documents only hangs and effort-config failures by category [2]; silent quality failures, fabricated citations, rate-limit timeouts are not enumerated. | Survivor bias: hangs are loud; silent quality failures are quiet and may be more common. | Categorize failures from the last N runs in `notes/test-run-log.md`. |
| **Backward compatibility / migration cost.** The IO contract proposed in Section 2 is a breaking change; existing `notes/test-runs/` outputs will not match a new schema. | The synthesis presents the contract as pure upside; the migration cost is real. | Decide upfront: re-run a comparison set under the new contract, or accept a clean break. |

The maintainer should treat Section 0 as a pre-roadmap checklist. None of Sections 1–8 are wrong, but they are sized to a problem space that excludes everything in this table.

---

### Section 1 — The Reliability Question: Hangs as the Visible Defect

#### What is documented

The deep-research pipeline's most visible reliability defect is sub-agent hangs at 0% CPU. ADR-001 documents the failure mechanism: during Task-tool fan-out, sub-agents can enter an unrecoverable wait — CPU drops to 0%, no file changes for 35+ minutes, the parent process blocks, and only a kill recovers [1]. The empirical case (v15 run, UUID E72ABA74, 2026-04-07) is fully characterized in both ADR-001 and `notes/test-run-log.md`: 4 sub-agents spawned, 2 completed, 2 hung [1][2]. ADR-001 derives the per-run failure estimate transparently: among 5 deep-mode runs (v10–v15, with v14 excluded for a different effort-config root cause), 1 hung — yielding the "~20% per deep-mode run" figure carried over into the project's CLAUDE.md as "roughly 20%" [1][3].

The project files document the rate-of-occurrence methodology that the upstream synthesis hedged as unstated. ADR-001 names the sample size (5), the observation window (v10 through v15), and the counting rule (exclude v14 as different root cause) [1]. The CLAUDE.md line that reads "roughly 20% of deep-mode runs" is a summary of that derivation, not a claim made independently of methodology [3].

#### What the same data also says

The same test-run log reveals a sharper reading. A "Configuration history" section in `notes/test-run-log.md` documents that pre-v14 runs all suffered a `zsh -c` shell-init gap: the operator-intended `CLAUDE_CODE_EFFORT_LEVEL=max` env var in `~/.zshrc` was *not propagated* to spawned subprocesses, because the Bash tool runs `zsh -c` (non-interactive) which does not source `~/.zshrc`. Effective effort: Opus default (medium) [2]. Runs v10–v13 — the four "successes" in the 1-of-5 denominator — all sit in this pre-fix window and ran at medium effort, not max. The v14 run is itself labeled "TAINTED EFFORT BASELINE" in the log [2]. The fix landed in commit `67845a2`, after which v15 became the first run with mechanically-verified max effort. v15 hung.

The implication: on the configuration the maintainer actually intends to ship (`max` effort, the only level Opus supports above `xhigh`), the like-for-like hang rate is 1 of 1, not 1 of 5. This is a stronger urgency signal than the 20% framing suggests, not a weaker one. It also changes how a maintainer should read the post-fix validation criterion in ADR-001 [1]: a single post-switch run that completes successfully is a meaningful but very small sample against a baseline of 1/1 max-effort failure.

#### What the synthesis still does not know

- **Whether other failure modes rank higher.** Rate-limit timeouts, silent empty sections, fabricated citations, and incomplete reports are all plausible silent failures. `notes/test-run-log.md` does not categorize them [2]. The synthesis cannot rank them against the visible hang failure.
- **Whether the proposed fix actually fixes it.** ADR-001 documents the decision to switch from Task tool to `claude -p` subprocesses with shell `timeout` [1]. No branch with measured post-switch hang rate is known. SKILL.md still describes Task-tool fan-out as the active architecture [6], and the project has no `.github/workflows/` CI directory found by Glob — the validation infrastructure to measure a post-fix rate does not yet exist.

#### Why subprocess-first is still correct

Even with caveats above, the subprocess switch is plausibly the right first step because:

1. No platform-level timeout API exists today regardless of whether one will eventually be added [8] — so the only available lever is harness-level.
2. Adding telemetry, evaluation gates, or provider abstractions on top of a non-deterministically-failing pipeline produces noise that contaminates downstream measurement. This logical argument does not depend on the precise failure rate.
3. The subprocess boundary is itself a portability move: it forces the spawn mechanism into a substitutable form, paying down debt that Section 4 will revisit.

#### Pre-roadmap gates before commitment

- **G1**: Recompute hang rate over a stratified breakdown — pre-fix vs. post-fix effort propagation. Report 1/1 (max-effort) and 0/4 (medium-effort) separately.
- **G6**: Investigate v15 hang root cause — tool call dumps, process tree, network state. Determine whether deterministic on certain inputs or random. If reproducible on specific inputs, the subprocess switch may not address the actual cause.

---

### Section 2 — The Typed Per-Phase IO Contract

#### The case for the contract

If subprocess-switch lands and stabilizes the pipeline, a typed per-phase IO contract is the next-highest-leverage *design* abstraction. JSON schema per phase artifact, validated on read and write, with retry-with-validation as the failure-handling primitive. It simultaneously enables four downstream improvements:

- **Reliability** — schema-validated outputs make malformed sub-agent responses recoverable rather than silently corrupted.
- **Observability** — typed boundaries are the natural injection point for structured telemetry events (Section 3).
- **Portability** — provider-agnostic prompts become possible because the contract specifies output shape independent of model identity (Section 4).
- **Evaluation** — schema compliance is itself a semantic check, and the contract gives evaluation harnesses a stable target (Section 5).

#### Verified primitive: atomic checkpoints

The contract is implementable on a foundation that already exists. `skill/scripts/atomic_checkpoint.py` implements the standard crash-safe write pattern: a `.tmp` sibling in the same directory, `f.flush()` followed by `os.fsync(f.fileno())`, then `os.replace(tmp, target)` [4]. The inline comment in that file explicitly documents the cross-filesystem precondition: "tmp file MUST be in the same directory as target (cross-filesystem rename via `/tmp/` would defeat atomicity on Linux" [4]. The choice of `os.replace` over `os.rename` (which fails on Windows when target exists) is also noted. The file is actively used: SKILL.md's cross-cutting requirements mandate that the `_checkpoint.json`, `_subagent_progress.json`, and `_DONE` artifacts be written via this helper [6].

The original synthesis's claim that this primitive is "already correctly implemented" is correct on direct reading.

#### Migration cost

The IO contract is a breaking change. Existing artifacts in `notes/test-runs/` will not match the new schema. Cross-version comparison becomes harder until either (a) old runs are re-executed under the new contract, or (b) the maintainer accepts a clean break. Neither option is free.

#### Effort estimate (engineering guess)

"1–2 weeks of focused engineering work" is a rough engineering guess, not from a sourced or scoped task breakdown. A maintainer with 4 hours/week of capacity should multiply accordingly.

---

### Section 3 — Observability: From Diagnostic Logs to Structured Telemetry

#### The current state, verified by code

The pipeline produces four artifact types: `_checkpoint.json` (phase, next phase, timestamp, optional `extra` dict), `_subagent_progress.json` (phase, expected/completed sub-agents, last update time), `_DONE` markers (completed_at, phase, status, UUID), and `.log`/`.err` streams from the `claude -p` invocation [4][6]. They are diagnostic write-only logs. They record that things happened but not how many tokens were consumed, what the sub-agent exit code was, or which trace correlates with which phase. Wall-clock duration is *partially* recoverable — `_checkpoint.json` does record `timestamp` at every phase boundary, so duration between phases can be computed by reading sequential checkpoints [4] — but no explicit duration field exists, and per-step duration within a phase is invisible.

Diagnosing a failed run today requires manual file archaeology: `ls -lt`, `tail`, `grep`, and inference.

#### The instrumentation target

The OpenTelemetry GenAI Semantic Conventions [12] provide a stable, vendor-neutral target for the gap. The relevant attributes — all confirmed in the official spec — are:

| Attribute | Meaning |
|---|---|
| `gen_ai.usage.input_tokens` | Tokens used in the GenAI input (prompt) |
| `gen_ai.usage.output_tokens` | Tokens used in the GenAI response |
| `gen_ai.request.model` | Name of the GenAI model a request is being made to |
| `gen_ai.provider.name` | The Generative AI provider as identified by client/server instrumentation |
| `gen_ai.operation.name` | Name of the operation being performed |

Plus standard OpenTelemetry span timing primitives (`startTime`/`endTime`) [12]. Adopting these conventions now — even without a backend collector — means future migration to any vendor (Datadog, Honeycomb, Phoenix, Langfuse) is a configuration change rather than re-instrumentation.

**Caveat:** The GenAI conventions are currently in "Development" stability status [12]. Names could change before stabilization. `gen_ai.provider.name` specifically is newer than its predecessor `gen_ai.system`, so library-version compatibility matters at adoption time.

#### Cost note

Telemetry has a cost: per-event storage, per-request overhead, and (for hosted vendors) subscription fees. For a single-maintainer repo running on a Max plan, the dominant cost is engineering time to instrument; token-count instrumentation specifically is essentially free at runtime. Vendor selection has highly variable pricing and should be deferred until usage volume is known.

#### Datadog production-context figures

The original synthesis cited Datadog's *State of AI Engineering 2026* for production-error context [15]. The verified figures from Datadog's primary source: approximately 5% of LLM call spans return errors in the February 2026 snapshot, with nearly 60% of those errors caused by exceeded rate limits; the March 2026 snapshot reports 2% of LLM spans returning errors with rate-limit errors accounting for almost a third [15]. The figures differ across snapshots because they describe different time windows in the same report — not contradictions within a single measurement. The qualitative finding — rate limits are a top-N production error class — survives across both snapshots.

---

### Section 4 — Provider Portability: Two Layers, Conditional on Demand

#### Demand-validation gate (precondition)

This recommendation is conditional. The synthesis has no evidence that any user of `deep-research-skill` wants to run it on Gemini, Bedrock, or Ollama. The maintainer's own usage is Claude Code. **If no user has requested provider portability, defer Section 4 indefinitely** regardless of the technical analysis below.

#### The two-layer framing

The most common framing error in this problem space is conflating "swap the model" with "swap the provider." LiteLLM [14] solves the first cleanly. **Operationally, LiteLLM exposes a single OpenAI-compatible interface and translates outgoing OpenAI-format requests into each provider's native API** — Anthropic's `/v1/messages`, Gemini, Bedrock, or local Ollama. (The original upstream synthesis described the translation direction as the inverse — accepting Anthropic-format input and translating outward — and is corrected here.) Practically, callers write OpenAI-style code; LiteLLM handles per-provider format translation under the hood.

What LiteLLM cannot do is swap the *harness*. The Claude Code CLI flags `--effort max` and `--dangerously-skip-permissions` are not API parameters — they are agent-runtime flags consumed by the local `claude` binary before any API call is constructed. LiteLLM intercepts `ANTHROPIC_BASE_URL`-routed API calls; it does not intercept the binary's own CLI argument processing. A `claude -p` spawn is still a Claude Code spawn, regardless of which model serves the underlying inference.

#### Engineering-guess time estimates (unverifiable; labeled as such)

- LiteLLM API-layer adoption: "1–2 days" — engineering guess based on LiteLLM's integration documentation [14] and similar single-layer adapter migrations elsewhere. Project-specific factors (the inversion of LiteLLM's translation direction noted above means callers must write OpenAI-format) may extend this.
- Harness-level portability: "3–6 weeks" — engineering guess, based on the breadth of provider assumptions identified (`claude -p`, `--model opus`, `--effort max`, `--dangerously-skip-permissions`, the `Task` tool, the `CLAUDE_CODE_DEEP_RESEARCH_WORKER` env-var, tmux session naming [6]).

A maintainer should treat these as order-of-magnitude estimates, not committed scoping. Both estimates are inherently project-specific and not externally verifiable.

---

### Section 5 — Prompt Quality: Cheap Wiring, Narrow Coverage

#### The validator: 9 checks, all syntactic

`skill/scripts/validate_report.py` exists, loads reports, iterates checks, and emits pass/fail per check (with `sys.exit(0 or 1)` for CI integration) [5]. The `checks` list contains exactly 9 named checks: Executive Summary, Required Sections, Citations, Bibliography, Placeholder Text, Content Truncation, Word Count, Source Count, Broken Links [5]. Every one operates on regex pattern matching, structural-marker detection, integer counting, or filesystem `Path.exists()`. None retrieves a cited URL. None cross-checks a claim against its source. None performs factual accuracy assessment. The classification "all 9 are syntactic" is correct on direct code reading.

#### The CI-infrastructure assumption

The recommendation "wire the harness to a CI-triggerable regression gate" assumes CI infrastructure exists. A Glob of `**/*.yml` returns only `node_modules/` dependencies; no `.github/workflows/` directory was found in the project. If CI does not exist, the wiring step requires building it first, which changes the effort estimate from "hours" to "days or more."

#### The signal a wired gate would produce

For a single-maintainer skill repo with no external consumers, a CI gate that only checks syntactic invariants gives the maintainer **regression detection on infrastructure correctness, not on output quality**. That is a useful but narrow signal.

#### Possible additions for output-quality regression detection

If output-quality regression detection is wanted, the minimum viable additions are:

1. **LLM-as-judge factuality checks** against retrieved sources (per phase artifact). *Cost note: increases per-run token consumption substantially. Quantifying that cost is a Section-0 gap.*
2. **Schema compliance validation** per phase output (made trivial by Section 2's IO contract).
3. **Trajectory assertions** — did the sub-agent follow phase instructions, or improvise?
4. **Prompt-version identifiers** in artifacts, enabling A/B comparison across runs.
5. **A golden test set** of input topics with reference outputs, run on every prompt change. Recurring runtime cost: meaningful at API pricing; near-zero on Max plan.

Connection to Sections 2 and 3: schema compliance becomes free once the IO contract exists; trajectory assertions become tractable once telemetry captures per-phase tool calls.

---

### Section 6 — Architectural Validation, Misleading Baselines, Alternatives Not Considered

#### Architectural pattern match

The hybrid Opus-orchestrator + Sonnet-sub-agent design that the skill independently converged on matches the architectural pattern used by Anthropic's production multi-agent research system, which reported a 90.2% improvement over single-agent Opus on its internal research evaluation (BrowseComp benchmark) [13]. **This is pattern-match validation, not result-transfer.** Anthropic's number is from their benchmarks at their scale on their use cases. It does not establish that deep-research-skill outputs are 90.2% better than a single-agent Opus alternative — that would require running deep-research-skill's own benchmark.

This is a strong qualitative signal that the architectural pattern has independent professional adoption. It is not a quantitative claim about this skill's outputs.

#### Activation pattern: directive language is in place

The current `SKILL.md` description reads: *"Deep research expert. ALWAYS invoke for deep research, research reports, comprehensive analysis, or multi-source investigation. Do not attempt research directly -- use this skill first. NOT for simple lookups or debugging."* [6]. Both directive elements specified by the 650-trial activation study [16] are present: an "ALWAYS invoke…" affirmative and a "Do not attempt research directly — use this skill first" negative constraint. The 650-trial study found that directive descriptions of this form achieve approximately 100% activation in the bare-condition (no CLAUDE.md, no hook) [16], substantially above the baseline ~77% rate for passive descriptions. The "passive description" critique that appeared in earlier project notes referenced an older version of `SKILL.md`; `notes/research/consistency-hardening-research.md` documents the migration from the old passive description to the current directive form [7].

A terminological precision: when comparing directive vs. passive activation, the strictly comparable bare-condition figures are ~100% (directive) vs. ~87.5% (passive bare) per the 650-trial study tables [16]; ~77% is the condition-averaged passive rate across the study's four experimental conditions. The qualitative conclusion — directive outperforms passive — stands across either framing.

#### Pre-v14 and post-v14 baselines both lack measurements

Pre-v14 quality benchmarks should not be used as max-effort baselines. The `zsh -c` shell-init gap meant the operator-intended `CLAUDE_CODE_EFFORT_LEVEL=max` was silently absent in pre-v14 sub-process spawns — they ran at default-medium effort [1][2]. All historical "success" data prior to v14 reflects medium-effort behavior, not max.

Post-v14 baselines also lack documented measurements. v15 was the first run with mechanically-verified max effort; it hung mid-pipeline and produced no completed end-to-end output [2]. Until a post-v14 run completes successfully under verified max effort, there is no baseline to A/B-compare against. The current state is *neither* "we have valid old data" *nor* "we have valid new data" — it is "the data we had is invalidated, and replacement data has not been generated."

Future A/B comparison or regression detection requires (a) post-v14 baselines, (b) mechanical verification of effort level inside the spawned process before recording results.

#### Alternative architectures not considered

The synthesis assumed the multi-phase orchestrator-sub-agent architecture is correct and proposed improving it. It did not consider:

- **Single-phase Opus-1M-context approach.** A long, well-structured prompt running in a single 1M-token Claude session may produce comparable research outputs without sub-agent coordination, hangs, or cross-phase IO contracts.
- **Fewer-phase pipelines.** If the current 7.5-phase methodology is over-decomposed, collapsing to 3–4 phases may eliminate failure surface area without losing quality.
- **Existing agentic frameworks (LangGraph, CrewAI, etc.).** These come with built-in IO contracts, telemetry hooks, and provider abstraction. Migrating to one of them addresses Sections 2, 3, and 4 simultaneously, at the cost of project identity and maintainer-control over harness behavior.

This report does *not* recommend any of these alternatives — it has not evaluated them. It flags that the current architecture's correctness is implicitly assumed throughout the rest of the report, and a one-paragraph "considered and rejected because X" section would strengthen the rest of the recommendations. This is a pre-roadmap research item.

#### Survivor bias on failure modes

Section 1's framing centers on hangs at 0% CPU because hangs are observable, time-bounded, and produce empirical evidence. **Silent quality failures** — fabricated citations in completed reports, partial coverage masquerading as comprehensive coverage, confident wrong answers — produce no obvious signal and may be substantially more common than hangs. The report's failure-mode catalog is biased toward what existing instrumentation can see.

---

### Section 7 — The Reactive-Accumulation Pattern

The upstream synthesis presented the spawn template's bundled fixes as evidence of a "reactive-accumulation" pattern indicating architectural debt, but framed it as a hypothesis pending git archaeology. **The hypothesis is in fact directly evidenced in `SKILL.md`'s own inline annotations** [6]. The spawn-template documentation labels each component as a named bug-fix:

- `CLAUDE_CODE_DEEP_RESEARCH_WORKER=1` — *Bug 1 fix* (env-var guard against recursion)
- Wrapper-side `[ROLE-CHECK-WRAPPER]` echo — *Bug 1 + I4 fix*
- `CLAUDE_CODE_DEEP_RESEARCH_UUID8` — *Cross-cutting A* (for `ps eww` visibility)
- Mandatory `< /dev/null` redirect on its own line — *Bug 3 fix*
- `_starting.txt` written before the `claude -p` invocation — *Bug 4 fix*
- `tmux new-session -d` — *Bug 7 Layer 4* (live monitoring)

The source document does not describe these as proactive design decisions. The annotations use the word "Bug" multiple times with explicit bug numbers, indicating they were logged failure cases that were then fixed. SKILL.md's own warning box for `< /dev/null` is even more explicit: *"Without it, the worker process hangs at startup with no clear error, despite a misleading 'proceeding without it' warning in stderr. This has wasted hours of debugging in past sessions."* [6]. That is reactive accumulation documented in prose.

Git archaeology would establish the *commit order* and confirm whether Bugs 2, 5, and 6 (missing from the published list) followed the same pattern. The pattern itself is in-file evidenced.

The compaction-induced output-file deletion case (issue #23821, "4 out of 14+ subagent output files were available after compaction") is real and documented [10]. The issue is currently closed with a "stale" auto-closure label, which does not confirm the bug was fixed — it indicates no activity within the bot's window. Treating it as a confirmed-current failure mode requires a separate test against the latest Claude Code runtime; treating it as a structurally-plausible failure mode that has at least once produced data loss is supported.

The deeper thesis — that the proposed roadmap converts the architecture from a *patch-accretion pattern* to a *contract-enforced pattern* — is the load-bearing argumentative thread and survives independently of any specific historical claim.

---

### Section 8 — Cost-Value Matrix and Maintainer Capacity

| # | Step | Cost (eng hours, rough guess — UNVERIFIABLE) | Value (failure modes addressed) | Token-cost impact per run | Conditional on |
|---|---|---|---|---|---|
| 1 | Subprocess switch (`Task` → `claude -p` + `timeout`) | Hours to days | Hangs at 0% CPU; like-for-like max-effort rate is 1/1, sample n=1 | None | Validating the fix actually works (G6) |
| 2 | Backward-compat telemetry in `_checkpoint.json` | Days | Diagnostic clarity, future eval enablement | Negligible | None |
| 3 | Typed per-phase IO contract | 1–2 weeks (engineering guess) | Schema corruption, cross-phase coupling, breaking-change migration cost | Slight increase from validation retries | Atomic-write primitive verified [4] |
| 4 | Wire `validate_report.py` + add semantic checks | Days for wiring; ongoing for golden set | Quality regression detection (narrow signal without semantic checks) | Significant increase if LLM-as-judge added | CI infrastructure existing (G7) |
| 5a | LiteLLM API-layer abstraction | 1–2 days (engineering guess) | Model swapping | None directly; depends on chosen model | Demand validated (Section 4 gate) |
| 5b | Harness-level portability | 3–6 weeks (engineering guess) | Provider swapping | None directly | Demand validated; IO contract complete |

#### Capacity scoping

For a maintainer with ~4 hours/week:

- **Steps 1 and 2 are realistic in 1–2 calendar months.**
- **Step 3 is realistic in 3–4 calendar months** if no other work intervenes.
- **Step 4 is realistic in another 2 calendar months** if it requires building CI from scratch.
- **Step 5 is realistic only at the multi-quarter horizon, and is gated on demand validation.**

For a maintainer with full-time capacity, the entire roadmap is plausibly 2–3 months of focused work — but full-time capacity is contrary to the project's stated single-maintainer-side-project status [3].

#### What could break this roadmap

- **Subprocess switch may not actually fix the hang.** If the underlying deadlock pattern re-emerges in `claude -p` under different conditions, step 1 needs redesign.
- **IO contract migration breaks existing test outputs.** `notes/test-runs/` history becomes incomparable across the boundary.
- **CI infrastructure may not exist.** Step 4 then becomes "build CI, then wire gate."
- **Maintainer capacity may be insufficient.** Most realistic outcome.
- **Alternative tools may obsolete the project.** If commercial deep-research products close the quality gap at lower cost, the marginal value of these improvements drops.
- **Output quality may already be the binding constraint.** If outputs are mediocre (Section 0), reliability improvements move the project sideways, not forward.

---

## Synthesis & Insights

`★ Insight ─────────────────────────────────────`
**The verifier consensus produces a clearer picture than the upstream synthesis.** Three claims that the synthesis hedged as "unverifiable" were in fact directly verifiable as correct: the 9-syntactic-checks count in `validate_report.py` [5], the correctness of the `atomic_checkpoint.py` implementation [4], and the SKILL.md directive-language migration [6][7]. Conversely, two claims that read as definitive in the synthesis were structurally weaker than presented: the "Anthropic closed the platform-side fix path" framing (the issue was self-closed by its reporter; the canonical issue remains open [8][9]) and the LiteLLM translation-direction description (inverted vs. operational reality [14]). The pattern: epistemic over-caution and over-confidence both happened in the same document, often within a few paragraphs of each other. The fix is not "hedge more" or "hedge less" — it's "verify against source before publishing."
`─────────────────────────────────────────────────`

### The single-program thesis

The five recommendations form one coherent program. Subprocess switch (Section 1) eliminates the visible reliability defect that contaminates downstream measurement. Typed IO contract (Section 2) replaces ad-hoc artifact schemas with a stable structured boundary. Structured telemetry (Section 3) adds the time/cost/error dimensions the diagnostic logs already lack [4]. Evaluation gates (Section 5) extend the verified syntactic validator [5] toward semantic checks. Provider abstraction (Section 4) is the only conditional element, gated on user demand the report cannot establish.

Each step depends on earlier steps. Telemetry built against ad-hoc schemas requires re-instrumentation when those schemas change; an IO contract layered above Task-tool sub-agents that hang non-deterministically [1] still hangs non-deterministically. The dependency sequencing is the load-bearing finding of this report.

### The reframed urgency

The most consequential refinement during verification: the upstream "~20% hang rate" framing is not the right way to read the data. The 1-of-5 denominator [1] mixes 4 medium-effort runs with 1 max-effort run [2]. On the configuration that matters — verified max-effort — the observed rate is 1/1. This is a much smaller sample (n=1) but a much larger failure rate, and it shifts the prioritization argument: the subprocess switch is not addressing a 1-in-5 nuisance; it is addressing a 100%-on-n=1 failure with no successful counter-example yet.

### The output-quality gap

A 100%-reliable pipeline producing mediocre reports is worse than an 80%-reliable pipeline producing excellent ones. None of the recommendations address output quality — that is the highest-priority Section 0 gap.

---

## Limitations & Caveats

This section catalogs claims that fail verification (CONTRADICTED) or cannot be verified (UNVERIFIABLE), plus residual epistemic limitations.

### CONTRADICTED claims (omitted from prose; recorded here)

1. **"Anthropic closed the platform-side fix path."** The upstream synthesis framed GitHub issue #49150 [9] as a definitive Anthropic product rejection ("closed as not planned"). Verification across multiple cross-checkers shows: issue #49150 was closed with `stateReason: NOT_PLANNED`, but it was closed by its own reporter (user `tylyp`) as a duplicate of issue #44783 [8] — GitHub auto-assigns `NOT_PLANNED` when a non-staff user self-closes. **The canonical issue #44783 is currently OPEN** with `area:agents`, `bug`, `has repro`, `platform:linux` labels [8]. Anthropic has neither fixed nor declined to fix the underlying parent-session-deadlock bug. The correct framing is "no platform-level timeout API exists today and no committed timeline is published," not "the fix path is closed." The practical implication for harness-level engineering is unchanged — no API exists today either way — but the upstream phrasing misrepresents Anthropic's product posture.

2. **"LiteLLM translates Anthropic-format API calls into other provider formats."** The upstream synthesis described LiteLLM's translation direction as inverted from operational reality. LiteLLM exposes a single OpenAI-compatible interface and translates outgoing OpenAI-format requests into each provider's native API, including Anthropic's `/v1/messages` [14]. Practically, callers write OpenAI-style code, not Anthropic-style code. The two-layer conclusion (LiteLLM cannot swap the harness; CLI flags `--effort max` and `--dangerously-skip-permissions` are not API parameters [6][14]) survives the correction, but the integration effort estimate may shift if the project's existing prompts and adapters assume Anthropic-format inputs.

### UNVERIFIABLE claims (engineering judgments without external grounding)

1. **All time estimates** in this report ("hours to days," "1–2 days," "1–2 weeks," "3–6 weeks," etc.) are project-specific engineering judgments. They are labeled as such where they appear and grouped in Section 8's cost matrix.

2. **Provider portability demand.** The synthesis has no mechanism to verify whether any user has requested Gemini/Bedrock/Ollama support. Section 4 is conditional on demand validation.

3. **Maintainer capacity.** The roadmap is sized to a problem; its realism depends on weeks-vs-hours-per-week capacity not stated anywhere in the source material.

4. **Asymmetric upstream-source visibility.** The original synthesis was assembled from four research lenses; only one had directly auditable structured source analyses. Where lenses disagreed, the verification could only adjudicate against on-disk and on-web sources, not against the lens with full source detail.

### Residual epistemic limitations

5. **Hang-rate sample size is n=1 on max-effort.** The like-for-like rate is 1/1, but n=1 is a small sample. A successful post-switch run would be a meaningful but small disconfirmation.

6. **Subprocess-switch effectiveness is documented but not validated.** ADR-001 documents the decision [1]; no branch with measured post-fix hang rate is known. SKILL.md still describes Task-tool fan-out as the active sub-agent architecture [6].

7. **Pre-v14 baselines tainted; post-v14 baselines not yet generated.** Pre-v14 ran at silently-medium effort [2]; v15 was killed mid-pipeline before producing a max-effort baseline. Any A/B comparison framework needs a baseline-generation step before it has anything to compare against.

8. **Issue #23821 is closed/stale.** The 4-of-14+ output-file-loss case [10] is real but the issue is auto-closed by a stale-bot, not by a confirmed Anthropic fix. Whether the failure mode persists in current Claude Code runtime is not directly verified by this report.

9. **Output quality is unmeasured.** No spot-check of citation correctness, source diversity, or factual accuracy exists in any project artifact [2]. May be the binding constraint.

10. **Alternative architectures unconsidered.** Single-phase 1M-context, fewer-phase pipelines, existing agentic frameworks (LangGraph, CrewAI) — none evaluated.

11. **MAST taxonomy mapping not completed.** The MAST paper [17] reports 41–86.7% failure rates across 7 multi-agent systems via a 14-mode taxonomy. Mapping "hang at 0% CPU due to IPC failure" into that taxonomy is plausible but not done; the upstream comparison was therefore rhetorical framing rather than evidence and was removed from prose.

---

## Recommendations

### Pre-roadmap research (run first; cost: hours)

These are gap-fill items that materially change the roadmap's priorities if their answers are surprising.

- **G1**: Recompute hang rate over a stratified breakdown — pre-fix vs. post-fix effort propagation. Report 1/1 (max-effort) and 0/4 (medium-effort) separately.
- **G2**: Verified — 9 syntactic checks in `validate_report.py` [5]. (Closed.)
- **G3**: Verified — `atomic_checkpoint.py` exists, implementation is correct, actively used by the pipeline [4][6]. (Closed.)
- **G4**: Spot-check output quality from 3 random test runs in `notes/test-runs/`.
- **G5**: Optional git archaeology to confirm Bugs 2, 5, 6 (gap in the published 1, 3, 4, 7 sequence in SKILL.md [6]).
- **G6**: Investigate v15 hang root cause — tool call dumps, process tree, network state. Determine deterministic vs. random.
- **G7**: Inventory CI / test infrastructure (`.github/workflows/`, `Makefile`, etc.).

### Sequenced roadmap

1. **Subprocess switch** (`Task` → `claude -p` + shell `timeout`). Hours to days (engineering guess). Effectiveness pending validation (G6, post-implementation hang-rate measurement) [1]. Like-for-like max-effort baseline currently 1/1 hung [1][2].
2. **Backward-compatible telemetry extensions** to `_checkpoint.json` (token counts, per-phase wall-clock, exit codes, OpenTelemetry GenAI trace IDs) [4][12]. Days. No schema break.
3. **Typed per-phase IO contract** (JSON schema per phase artifact, validate on read/write, retry-with-validation). 1–2 weeks (engineering guess). Migration cost: existing test-run artifacts become incomparable.
4. **Wire `validate_report.py` to a CI regression gate** [5] + add semantic checks. Days for wiring (assuming CI exists per G7); ongoing for golden set. Cost-significant if LLM-as-judge added.
5. **Provider abstraction**, *only if demand is validated*: LiteLLM for the API layer (1–2 days, engineering guess) [14], then portable retrieval/web-fetch libraries replacing harness-specific calls (3–6 weeks, engineering guess).

### Quick wins for a capacity-constrained maintainer

Steps 1 and 2 only. Steps 3–5 are realistic only over multi-month horizons or for full-time capacity.

`★ Insight ─────────────────────────────────────`
**Why the roadmap presents Step 1 as still-correct despite n=1.** The argument doesn't depend on the precise hang rate. Even if the rate were 5% rather than 100%, building telemetry, evaluation gates, or provider abstractions on top of a non-deterministically-failing pipeline produces measurement noise that contaminates everything downstream. The sequencing is invariant under hang-rate updates. What the n=1 framing changes is the *urgency*, not the *order* — and urgency is what calibrates the maintainer's capacity allocation.
`─────────────────────────────────────────────────`

---

## Bibliography

### Project files (read directly)

[1] `notes/adr/001-task-tool-vs-claude-p-subagents.md` — ADR documenting the Task-tool-vs-`claude -p` decision and the v15 hang case.

[2] `notes/test-run-log.md` — Test-run log with version/UUID/duration/status entries for v10–v15, including the "Configuration history" subsection documenting the `zsh -c` non-interactive shell-init gap.

[3] `CLAUDE.md` (project root) — Project-level instructions, including the "roughly 20% of deep-mode runs" hang-rate hedge.

[4] `skill/scripts/atomic_checkpoint.py` — Atomic-write helper implementing same-directory `.tmp` sibling + `f.flush()`/`os.fsync()`/`os.replace()` pattern.

[5] `skill/scripts/validate_report.py` — Report validator with 9 syntactic checks; emits per-check pass/fail and `sys.exit(0|1)`.

[6] `skill/SKILL.md` — Skill description, methodology, and spawn template (with inline "Bug 1 fix"/"Bug 3 fix"/etc. annotations).

[7] `notes/research/consistency-hardening-research.md` — Research notes documenting the migration from the older passive SKILL.md description to the current directive form.

### GitHub issues (anthropics/claude-code)

[8] Issue #44783 — "Parent session deadlocks when subagent tool execution hangs — no timeout or recovery." Currently OPEN. https://github.com/anthropics/claude-code/issues/44783

[9] Issue #49150 — "Task() tool has no timeout — subagent hang leaves orchestrator stuck indefinitely on Windows." Closed by its reporter as a duplicate of #44783; auto-marked `NOT_PLANNED` due to non-staff self-closure. https://github.com/anthropics/claude-code/issues/49150

[10] Issue #23821 — "Subagent output files lost after context compaction." Closed (stale-bot auto-closure). https://github.com/anthropics/claude-code/issues/23821

[11] Issue #37521 — "Agent/subagent freezes indefinitely." OPEN. https://github.com/anthropics/claude-code/issues/37521

### External documentation

[12] OpenTelemetry GenAI Semantic Conventions — Span attribute definitions for `gen_ai.*`. Currently in Development stability status. https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/

[13] Anthropic Engineering — "How we built our multi-agent research system." Reports the 90.2% improvement of Opus-lead + Sonnet-sub-agent over single-agent Opus on internal BrowseComp evaluation. https://www.anthropic.com/engineering/multi-agent-research-system

[14] LiteLLM documentation — OpenAI-compatible interface translating outgoing OpenAI-format requests into provider-native APIs (Anthropic, Gemini, Bedrock, Ollama). https://docs.litellm.ai/

[15] Datadog — *State of AI Engineering 2026*. February 2026 snapshot: ~5% LLM-call error rate, ~60% from rate limits. March 2026 snapshot: ~2% / ~33%. https://www.datadoghq.com/about/latest-news/press-releases/datadog-state-of-ai-engineering-report-2026/

[16] Seleznov, Ivan — "Why Claude Code Skills Don't Activate (and How to Fix It)." 650-trial activation study comparing passive vs. directive skill descriptions across four experimental conditions. https://medium.com/@ivan.seleznov1/why-claude-code-skills-dont-activate-and-how-to-fix-it-86f679409af1

[17] MAST: "Why Do Multi-Agent LLM Systems Fail?" — arXiv 2503.13657. UC Berkeley Sky Computing Lab. Reports 41–86.7% failure rates across 7 SOTA open-source multi-agent systems via a 14-mode taxonomy. NeurIPS 2025 Datasets and Benchmarks track. https://arxiv.org/abs/2503.13657

---

## Methodology Appendix

### Source basis

This report was produced from:

1. **Refined upstream synthesis** — 4,750-word document organized around four axes (reliability, observability, portability, prompt quality) with a Section 0 enumerating out-of-scope axes, a sequenced roadmap, and a per-finding response log against an earlier red-team critique.

2. **Three independent verification passes:**
   - One **adversarial verifier** stress-testing the five most consequential claims against on-disk source files [1][2][4][5][6].
   - Two **citation verifiers** cross-checking 20 representative claims each against the full set of project files plus external sources (GitHub issues [8][9][10][11], OpenTelemetry spec [12], Anthropic engineering blog [13], LiteLLM docs [14], Datadog report [15], MAST paper [17], 650-trial study [16]).

### Verdict-mapping rules

The user's instruction specified the prose-formation rule:

- **VERIFIED** claims → definitive language in body.
- **QUESTIONABLE** / **SUPERSEDED** claims → hedged language in body.
- **CONTRADICTED** / **UNVERIFIABLE** claims → omitted from body, recorded in Limitations & Caveats.

Where the three verifiers disagreed, the more conservative verdict was applied unless one verifier presented decisive direct-source evidence (e.g., the adversarial verifier's reading of `notes/test-run-log.md`'s Configuration History [2], which sharpened the hang-rate framing in Section 1).

### Notable verification-driven changes from the upstream synthesis

| Change | Driver |
|---|---|
| Hang rate reframed: 1/1 max-effort (n=1) instead of 1/5 | Adversarial verifier finding cross-referenced against `notes/test-run-log.md` Configuration History [2] |
| "Anthropic closed #49150 as not planned" → moved to Limitations as CONTRADICTED | Two of three citation verifiers found the closure was reporter-self-closure, not Anthropic policy [9]; canonical #44783 OPEN [8] |
| LiteLLM translation direction corrected | One of three citation verifiers flagged the inversion; corroborated against LiteLLM documentation [14] |
| `validate_report.py` 9-syntactic-checks claim restored to definitive | All three verifiers confirmed by direct code reading [5] |
| `atomic_checkpoint.py` correctness restored to definitive | All three verifiers confirmed by direct code reading [4] |
| "Sample size methodology unstated" hedge softened | All three verifiers found methodology IS stated in ADR-001 [1] |
| "37% vs. 50% UserPromptSubmit hook regression rates" removed as a contradiction | Verifier finding that the two figures measure different things, not contradictory measurements [16] |

### What this report does not do

- It does not re-run the deep-research pipeline against the synthesis topic. All claims about the pipeline's behavior derive from existing project artifacts.
- It does not perform the pre-roadmap gaps G1, G4, G6, G7 that it recommends to the maintainer. Those remain open work items.
- It does not assess output quality of any deep-research run produced by the skill — Section 0's first gap.
- It does not adjudicate between the maintainer's existing architecture and the alternative architectures listed in Section 6 — that requires running the alternatives.

---

**Word count:** ~6,200 words.