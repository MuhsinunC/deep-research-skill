`★ Insight ─────────────────────────────────────`
**Refinement strategy:** The critique identifies a single systematic blind spot — the synthesis is internally well-organized but treats engineering-infrastructure as the whole problem space. Two structural moves address most critiques: (1) add a Section 0 that explicitly enumerates what the synthesis *doesn't* cover (output quality, cost, alternatives, capacity), and (2) thread epistemic hedges through load-bearing claims (mark unverified primitives as unverified, label time estimates as engineering guesses, distinguish "documented" from "validated"). I'll avoid inventing new numbers to replace softened ones — when a claim weakens, it stays weakened rather than getting a new spurious statistic.
`─────────────────────────────────────────────────`

# Improving the Deep Research Skill: A Synthesized Analysis (Refined)

**Audience:** Maintainer of `deep-research-skill` deciding what to build next.
**Date:** 2026-05-03
**Status:** Refined per red-team critique. See "Changes Applied" at the bottom for a per-finding response log.

---

## Executive Summary

1. **The recommendations form one coherent program, not a menu.** Subprocess switch, typed IO contract, structured telemetry, evaluation gates, and provider abstraction each address one facet of a single underlying transition: from a *patch-accretion architecture* to a *contract-enforced architecture*. The dependency sequencing is the load-bearing finding — read past the executive summary primarily to understand *why this order*.

2. **The pipeline's documented hang failure mode** [1][2][4] is the most visible reliability defect, with one fully-characterized empirical case (v15, UUID E72ABA74) and a hedged ~20% rate-of-occurrence estimate from the project's own CLAUDE.md. The fix path (`claude -p` subprocess + shell `timeout`) is documented in ADR-001 [1], but **documented is not the same as validated** — the synthesis is unaware of any branch in which the post-fix rate has been measured. The subprocess switch is plausibly the reliability prerequisite, but its effectiveness is itself a research question.

3. **The two highest-leverage architectural changes are complementary, not competing:** the subprocess switch (reliability prerequisite) and the typed per-phase IO contract (design abstraction that compounds across observability, portability, and evaluation). They must be sequenced in that order if the project pursues them.

4. **Several recommendations are conditional on demand that the synthesis cannot establish.** Provider portability presupposes that someone wants to run this on Gemini or Bedrock; this synthesis has no evidence of such demand. Evaluation gates presuppose CI infrastructure that may not exist. Each conditional recommendation is now flagged at the top of its section.

5. **A material gap in this synthesis: it does not assess whether deep-research outputs are actually good.** All five recommendations target engineering-infrastructure quality, not output quality. A 100%-reliable pipeline producing mediocre reports may be worse than an 80%-reliable pipeline producing excellent ones. **Section 0 below catalogs this and other gaps the maintainer should weigh before acting on the roadmap.**

---

## Section 0 — What This Synthesis Doesn't Cover

The original synthesis was scoped to four axes: reliability, observability, portability, and evaluation. The red-team critique correctly identified that several other axes were treated as out-of-scope without justification. They are catalogued here, with pointers to the gap-filling research the maintainer should do *before* committing to the roadmap below.

| Gap | Why it matters | Cheapest way to close |
|---|---|---|
| **Output quality** is unmeasured. No spot-check of citation correctness, source diversity, factual accuracy, or report comprehensiveness from existing test runs. | A reliability-first roadmap is mis-prioritized if the outputs themselves are mediocre. | Read 3 random reports from `notes/test-runs/`, spot-check 5 URLs each, assess claim-to-evidence alignment. |
| **Cost per run** is unmeasured. Token counts, runtime, and dollar cost (Max plan vs. API-billed) are not characterized for current runs or for proposed additions (LLM-as-judge factuality, retry-with-validation). | Several recommendations *increase* per-run cost; without baseline cost, the trade-off is invisible. | Pull token counts from any run with telemetry; project the percentage increase from each proposed addition. |
| **Comparison to alternatives** is absent. GPT Researcher, Perplexity Deep Research, Gemini Deep Research, OpenAI Deep Research, ChatGPT Deep Research all exist with public benchmarks. | Establishes the bar. If alternatives produce comparable output for substantially less cost or time, the design space is wider than this synthesis acknowledges. | One web-research pass on published benchmarks for the named alternatives. |
| **Maintainer capacity** is unscoped. The roadmap totals weeks-to-months of focused engineering work; CLAUDE.md establishes this as a personal-fork side project. | A roadmap requiring 6 weeks of focused work when capacity is 4 hours/week is fictional regardless of technical merit. | Maintainer self-estimate; defer steps that exceed realistic budget. |
| **Security and safety** are largely absent. Prompt injection from retrieved web content, tool poisoning via malicious sources, PII in saved test outputs, secret leakage in `.remember/` notes — none discussed. | The skill fetches arbitrary web content and runs in unattended mode with `--dangerously-skip-permissions`. | A separate security-review pass; not a roadmap item, but a pre-roadmap audit. |
| **Alternative architectures** were not considered. The multi-phase orchestrator-sub-agent pattern is treated as correct because Anthropic's production system uses something similar [8]. A single-phase Opus-1M-context approach with a long prompt is not evaluated. | The complexity may be self-justifying; a simpler architecture might produce comparable results with fewer failure modes. | A single test run with a "long-prompt single-pass" variant on the same topic; compare outputs. |
| **Failure modes beyond hangs** are not catalogued. Incomplete reports, fabricated citations, rate-limit timeouts, research-loop traps, stale/cached data, silent empty sections — all plausible failure modes; only "hang at 0% CPU" is treated as the modal failure type. | Survivor bias: hangs are loud; silent quality failures are quiet and may be more common. | Categorize failures from the last N runs in `notes/test-run-log.md`. |
| **Backward compatibility / migration cost.** The IO contract proposed in Section 2 is a breaking change; existing `notes/test-runs/` outputs will not match the new schema. | The synthesis presents the contract as pure upside; the migration cost is real. | Decide upfront: re-run a comparison set under the new contract, or accept a clean break. |

**The maintainer should treat Section 0 as a pre-roadmap checklist.** None of the recommendations in Sections 1–7 are wrong, but they are sized to a problem space that excludes everything in this table.

---

## Section 1 — The Reliability Question

### What is documented vs. what is measured

The deep-research pipeline's most visible reliability defect is sub-agent hangs at 0% CPU. The mechanism is well-characterized in ADR-001 [1] and confirmed by one fully-documented empirical case (v15 run UUID E72ABA74) [4]. External corroboration: GitHub issue #49150, where Anthropic closed the request for a `Task` timeout flag as "not planned" [2].

**What the synthesis does *not* know:**
- The denominator. The "roughly 20%" estimate comes from the project's own CLAUDE.md and is hedged in the source. Sample size, observation window, and counting methodology are not stated. It may be substantially higher or lower; it is the maintainer's working estimate, not a measurement.
- Whether other failure modes are at comparable or higher rates. Rate-limit timeouts, silent empty sections, fabricated citations, and incomplete reports are all plausible silent failures. The synthesis cannot rank them against the visible hang failure.
- Whether the proposed fix actually fixes it. ADR-001 [1] *documents the decision* to switch to `claude -p` subprocesses with shell `timeout`. The synthesis is unaware of any branch where the post-switch hang rate has been measured. It is plausible that the underlying deadlock pattern re-emerges in `claude -p` under different conditions.

**Removed from this section:** The MAST 41–87% comparison [3], retained in the original synthesis, has been removed. MAST measures broader multi-agent failure categories; without verification that "hang at 0% CPU" maps to MAST's failure taxonomy, the comparison was rhetorical framing rather than evidence.

### Why subprocess-first is still plausibly correct

Even with the above caveats, the subprocess switch is plausibly the right first step *because*:
1. The platform-side fix path is closed [2], so the only available lever is harness-level.
2. Adding telemetry, evaluation gates, or provider abstractions on top of a non-deterministically-failing pipeline produces noise that contaminates downstream measurement. This logical argument does not depend on the precise failure rate.
3. The subprocess boundary is itself a portability move: it forces the spawn mechanism into a substitutable form, paying down debt that Section 4 will revisit.

### What needs to happen before the roadmap commits to step 1

Two cheap research moves should precede committing engineering effort:
- Read `notes/test-run-log.md` and count runs by status (hang/complete/error). Compute the observed hang rate with a stated sample size. (Critique gap G1.)
- Investigate the v15 hang (UUID E72ABA74): tool call dumps, process tree, network state at hang time. Determine whether the hang is deterministic on certain inputs or random. If it has a reproducible trigger, that may be patchable without the subprocess switch — and conversely, the subprocess switch may not address it. (Critique gap G6.)

Connection to subsequent sections: If those investigations reveal that the dominant failure mode is *not* hangs, the entire sequencing of this roadmap may need to change.

---

## Section 2 — The Typed Per-Phase IO Contract

### The case for the contract

If subprocess-switch lands and stabilizes the pipeline, a typed per-phase IO contract is the next-highest-leverage *design* abstraction. JSON schema per phase artifact, validated on read and write, with retry-with-validation as the failure-handling primitive. It simultaneously enables four downstream improvements:

- **Reliability** — schema-validated outputs make malformed sub-agent responses recoverable rather than silently corrupted.
- **Observability** — typed boundaries are the natural injection point for structured telemetry events (Section 3).
- **Portability** — provider-agnostic prompts become possible because the contract specifies output shape independent of model identity (Section 4).
- **Evaluation** — schema compliance is itself a semantic check, and the contract gives evaluation harnesses a stable target (Section 5).

### What needs verification before this is "low-friction"

The original synthesis claimed the contract is low-friction to implement because the underlying atomic-write primitive is "already correctly implemented" — `os.replace()` after `fsync()` on a same-filesystem `.tmp` sibling, attributed to `atomic_checkpoint.py` [6].

**This synthesis cannot independently verify that claim.** The implementation description matches a textbook crash-safe-write pattern, and the file is referenced in upstream sources, but neither its existence nor its actual implementation has been read in this synthesis. Before the effort estimate ("1–2 weeks") below is treated as confident scoping, the maintainer should:

- Verify `skill/scripts/atomic_checkpoint.py` (or equivalent) exists.
- Verify the implementation matches the description.
- Verify it is actually used by the pipeline rather than being a leftover utility. (Critique gap G3.)

If any of those is false, Section 2's effort estimate revises upward.

### Migration cost (newly acknowledged)

The IO contract is a *breaking change*. Existing artifacts in `notes/test-runs/` will not match the new schema. Cross-version comparison becomes harder until either (a) old runs are re-executed under the new contract, or (b) the maintainer accepts a clean break. Neither option is free. The original synthesis presented the contract as pure upside; this is a correction.

### Time estimate (engineering guess, not source-derived)

"1–2 weeks of focused engineering work" — labeled as a rough engineering guess based on similar typed-IO-contract migrations elsewhere, not from a sourced or scoped task breakdown. A maintainer with 4 hours/week of capacity should multiply accordingly.

Connection backward to Section 1: the contract becomes implementable only *after* subprocess-switch — sub-agents must be invokable as discrete processes with structured I/O before contract enforcement has a meaningful injection point. Connection forward to Sections 3–5: each subsequent section's recommendations depend on or compound with the contract.

---

## Section 3 — Observability: The Telemetry Gap and OpenTelemetry as the Target

This section's substance is largely intact from the original; the corrections are scoped to cost and contradiction-flagging.

### The current state

The pipeline produces several artifacts — `_checkpoint.json`, `_subagent_progress.json`, `_DONE` markers, `.log`/`.err` streams [6] — but they are diagnostic write-only logs. They record that things happened. They do not record how long things took, how many tokens they consumed, what the sub-agent exit code was, or which trace correlates with which phase. Diagnosing a failed run requires manual file archaeology: `ls -lt`, `tail`, `grep`, and inference.

### The instrumentation target

OpenTelemetry's GenAI Semantic Conventions [7]: `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.request.model`, `gen_ai.provider.name`, `gen_ai.operation.name`, plus span timing. Adopting these conventions now — even without a backend collector — means future migration to any vendor (Datadog, Honeycomb, Phoenix, Langfuse) is a configuration change rather than re-instrumentation.

### Cost note (newly added)

Telemetry has a cost: per-event storage, per-request overhead, and (for hosted vendors) per-month subscription. For a single-maintainer repo running on a Max plan, the dominant cost is engineering time to instrument, not runtime overhead. Token-count instrumentation specifically is essentially free at runtime. Vendor selection (Datadog/Honeycomb/Phoenix/Langfuse) has highly variable pricing and should be deferred until usage volume is known.

### Unreconciled external statistics

The original synthesis cited Datadog's *State of AI Engineering 2026* [12] for production-error-rate context. Two figures from that source were transcribed inconsistently across upstream lenses (5% vs. 2% error rate; 60% vs. 33% rate-limit share). **Until the primary source is re-checked, those figures should not be cited downstream.** The qualitative point — rate limits are a top-N production error class — survives the contradiction. The numbers do not.

Connection to Section 2: telemetry additions can be made backward-compatible by extending `_checkpoint.json` with optional fields, which the typed IO contract turns into typed-optional fields. Connection forward to Section 5: structured telemetry is itself a precondition for meaningful evaluation regression gates.

---

## Section 4 — Provider Portability Is Two Layers, Not One — And the Demand Is Unverified

### Demand-validation gate (new)

**This recommendation is conditional.** The synthesis has no evidence that any user of `deep-research-skill` wants to run it on Gemini, Bedrock, or Ollama. The maintainer's own usage is presumably Claude Code. **If no user has requested provider portability, defer Section 4 indefinitely** regardless of the technical analysis below. The remaining content of this section assumes demand has been validated.

### The two-layer framing

The most common framing error in this problem space is conflating "swap the model" with "swap the provider." LiteLLM [9] solves the first cleanly: it translates Anthropic-format API calls into OpenAI, Gemini, Bedrock, or local-Ollama equivalents. What it cannot do is swap the *harness*. The Claude Code CLI flags `--effort max` and `--dangerously-skip-permissions` are not API parameters — they are agent-runtime flags that LiteLLM has no way to intercept. A `claude -p` spawn is still a Claude Code spawn, regardless of which model serves the underlying inference requests.

### Engineering-guess time estimates (newly labeled)

- LiteLLM API-layer translation: "1–2 days" — engineering guess, based on LiteLLM's own integration documentation and similar single-layer adapter migrations. Not sourced from a scoped task breakdown.
- Harness-level portability (replace `claude -p` and Task spawn with provider-agnostic equivalent): "3–6 weeks" — engineering guess, based on the breadth of provider assumptions identified (`claude -p`, `--model opus`, `--effort max`, `--dangerously-skip-permissions`, the `Task` tool, the `CLAUDE_CODE_DEEP_RESEARCH_WORKER` env-var, tmux session naming). Not sourced.

A maintainer should treat these as order-of-magnitude estimates, not committed scoping.

Connection backward to Section 2: the typed IO contract is the connective tissue that makes layer-2 portability tractable. Without it, sub-agent prompts and outputs are entangled with Claude-Code-specific assumptions. Connection backward to Section 1: the subprocess switch is itself the first concrete portability move — `claude -p` is a process; once the harness boundary is "any process that conforms to the IO contract," other harnesses become substitutable.

---

## Section 5 — Prompt Quality: Cheap Wiring vs. Meaningful Coverage

### The unverified premise

The original synthesis claimed all 9 checks in `validate_report.py` [13] are syntactic, not semantic. **This synthesis has not read `validate_report.py` and cannot verify either the count or the syntactic-vs-semantic classification.** If even one of the checks performs semantic work (e.g., fuzzy citation cross-check, claim-extraction validation), the gap-size argument shrinks. The maintainer should verify before committing to the recommendations below. (Critique gap G2.)

The wiring claim — `validate_report.py` exists, loads reports, iterates checks, emits pass/fail [13] — survives independently of the syntactic-vs-semantic classification.

### The CI-infrastructure assumption

The recommendation "wire the harness to a CI-triggerable regression gate" assumes CI infrastructure exists. **This synthesis has not confirmed that the project has CI** (`.github/workflows/`, Makefile-based runners, or equivalent). If CI does not exist, the wiring step requires building it first, which changes the effort estimate from "hours" to "days or more." (Critique gap G7.)

### Reframing "false signal of quality"

The original synthesis claimed wiring the gate without semantic checks creates a "false signal of quality." The critique correctly observed this assumes a production-software framing — that someone treats CI green as quality validation.

For a single-maintainer skill repo with no external consumers, a more accurate framing is: **a CI gate that only checks syntactic invariants gives the maintainer regression detection on infrastructure correctness, not on output quality.** That is a useful but limited signal. The synthesis no longer claims it produces a *false* signal; it claims it produces a *narrow* one.

### Possible additions (still recommended, but with caveats)

If output-quality regression detection is wanted, the minimum viable additions are:

1. **LLM-as-judge factuality checks** against retrieved sources (per phase artifact). *Cost note: increases per-run token consumption substantially. Quantifying that cost is a critical gap (G11).*
2. **Schema compliance validation** per phase output (made trivial by Section 2's IO contract).
3. **Trajectory assertions** — did the sub-agent follow phase instructions, or improvise?
4. **Prompt-version identifiers** in artifacts, enabling A/B comparison across runs.
5. **A golden test set** of input topics with reference outputs, run on every prompt change. *Recurring runtime cost: meaningful at API pricing; near-zero on Max plan.*

Connection to Sections 2 and 3: schema compliance becomes free once the IO contract exists; trajectory assertions become tractable once telemetry captures per-phase tool calls.

---

## Section 6 — Architectural Validation, Misleading Baselines, and Alternative Architectures Not Considered

### Architectural pattern match (softened)

The hybrid Opus-orchestrator + Sonnet-sub-agent design that the skill independently converged on matches the architectural *pattern* used by Anthropic's production multi-agent research system, which reported a 90.2% improvement over single-agent Opus on internal benchmarks [8]. **This is pattern-match validation, not result-transfer.** Anthropic's number is from their benchmarks at their scale on their use cases. It does not establish that deep-research-skill outputs are 90.2% better than a single-agent Opus alternative — that would require running deep-research-skill's own benchmark, which is a separate research question.

This is a strong qualitative signal that the architectural pattern has independent professional adoption. It is not a quantitative claim about this skill's outputs.

### Activation pattern (intact)

The current `SKILL.md` description was once flagged as "passive," but ground-truth verification against the live skill list shows it contains *both* directive elements: an "ALWAYS invoke for deep research..." affirmative *and* a "Do not attempt research directly — use this skill first" negative constraint [15]. This puts activation behavior near the ~100% bare-condition rate observed in the 650-trial consistency-hardening study [10], not the ~77% passive-description rate. The "passive description" critique was either out-of-date or referenced a different file.

### Pre-v14 baselines unusable; post-v14 also unmeasured (newly explicit)

Pre-v14 quality benchmarks should not be used as max-effort baselines. The `zsh -c` shell-init gap meant the operator-intended `CLAUDE_CODE_EFFORT_LEVEL=max` was silently absent in pre-v14 sub-process spawns — they ran at default-medium effort [1][5]. All historical "success" data prior to v14 reflects medium-effort behavior, not max.

**Equally important and previously implicit: post-v14 baselines also have no documented measurement.** The synthesis is unaware of any benchmark suite that has been run against post-v14 builds with mechanically-verified effort levels. The current state is *neither* "we have valid old data" *nor* "we have valid new data" — it is "the data we had is invalidated, and replacement data has not been generated."

Future A/B comparison or regression detection requires (a) post-v14 baselines, (b) mechanical verification of effort level inside the spawned process before recording results.

### Alternative architectures not considered (new subsection)

The original synthesis assumed the multi-phase orchestrator-sub-agent architecture is correct and proposed improving it. It did not consider:

- **Single-phase Opus-1M-context approach.** A long, well-structured prompt running in a single 1M-token Claude session may produce comparable research outputs without sub-agent coordination, hangs, or cross-phase IO contracts. The complexity tax of multi-phase orchestration may be self-justifying.
- **Fewer-phase pipelines.** If the current 7.5-phase methodology is over-decomposed, collapsing to 3–4 phases may eliminate failure surface area without losing quality.
- **Existing agentic frameworks (LangGraph, CrewAI, etc.).** These come with built-in IO contracts, telemetry hooks, and provider abstraction. Migrating to one of them addresses Sections 2, 3, and 4 simultaneously, at the cost of project identity and maintainer-control over harness behavior.

The synthesis does *not* recommend any of these alternatives — it has not evaluated them. **It flags that the current architecture's correctness is implicitly assumed throughout the rest of the synthesis, and a one-paragraph "considered and rejected because X" section would strengthen the rest of the recommendations.** This is a pre-roadmap research item.

### Survivor bias on failure modes (newly explicit)

Section 1's framing centered on hangs at 0% CPU because hangs are observable, time-bounded, and produce empirical evidence. **Silent quality failures** — fabricated citations in completed reports, partial coverage masquerading as comprehensive coverage, confident wrong answers — produce no obvious signal and may be substantially more common than hangs. The synthesis's failure-mode catalog is biased toward what the existing instrumentation can see.

---

## Section 7 — The Reactive-Accumulation Hypothesis (Softened)

The original synthesis presented the spawn template's bundled fixes (`< /dev/null`, `_starting.txt` pre-spawn marker, env-guard, `[ROLE-CHECK-WRAPPER]` echo, named tmux sessions) as evidence of a "reactive-accumulation" pattern indicating architectural debt.

**This synthesis cannot demonstrate the pattern; it can only hypothesize it.** Demonstrating it would require git archaeology: for each of the five fixes, find the introducing commit, the failure mode it addressed, and whether it was added reactively (after a test failure) or proactively (during refactor). (Critique gap G5.)

The hypothesis is plausible — small fixes accreting around a brittle interface is a recognizable software-engineering antipattern — but it is not evidenced in this synthesis. The maintainer should either (a) verify the pattern by running the git archaeology, or (b) treat Section 7 as motivation rather than evidence.

The compaction-induced output-file deletion case (Issue #23821) is real and documented [11]. **Whether the "10 of 14 lost" outcome is representative or extreme is unmeasured** — the rate of this failure across runs has not been counted in this synthesis. (Critique gap G10.)

The deeper thesis — that the proposed roadmap converts the architecture from a *patch-accretion pattern* to a *contract-enforced pattern* — survives independently of the specific historical evidence. It is the load-bearing argumentative thread in the synthesis and now anchors the Executive Summary.

---

## Section 8 — Cost-Value Matrix and Maintainer Capacity (New)

The original roadmap was sequenced by dependency. A maintainer with limited capacity needs a separate cost-vs.-value view.

| # | Step | Cost (eng hours, rough guess) | Value (failure modes addressed) | Token-cost impact per run | Conditional on |
|---|---|---|---|---|---|
| 1 | Subprocess switch (`Task` → `claude -p` + `timeout`) | Hours to days | Hangs at 0% CPU (rate unmeasured) | None | Validating the fix actually works (G6) |
| 2 | Backward-compat telemetry in `_checkpoint.json` | Days | Diagnostic clarity, future eval enablement | Negligible | None |
| 3 | Typed per-phase IO contract | 1–2 weeks (engineering guess) | Schema corruption, cross-phase coupling, breaking-change migration cost | Slight increase from validation retries | Atomic-write primitive verified (G3) |
| 4 | Wire `validate_report.py` + add semantic checks | Days for wiring; ongoing for golden set | Quality regression detection (narrow signal without semantic checks) | Significant increase if LLM-as-judge added | CI infrastructure existing (G7) |
| 5a | LiteLLM API-layer abstraction | 1–2 days (engineering guess) | Model swapping | None directly; depends on chosen model | Demand validated (Section 4 gate) |
| 5b | Harness-level portability | 3–6 weeks (engineering guess) | Provider swapping | None directly | Demand validated; IO contract complete |

### Rough capacity scoping

For a maintainer with ~4 hours/week:
- **Steps 1 and 2 are realistic in 1–2 calendar months.**
- **Step 3 is realistic in 3–4 calendar months** if no other work intervenes.
- **Step 4 is realistic in another 2 calendar months** if it requires building CI from scratch.
- **Step 5 is realistic only at the multi-quarter horizon, and is gated on demand validation.**

For a maintainer with full-time capacity, the entire roadmap is plausibly 2–3 months of focused work — but full-time capacity is contrary to the project's stated single-maintainer-side-project status.

### What could break this roadmap

- **Subprocess switch may not actually fix the hang.** Pending G6 investigation. If the underlying deadlock pattern re-emerges in `claude -p`, step 1 needs redesign.
- **IO contract migration breaks existing test outputs.** `notes/test-runs/` history becomes incomparable across the boundary.
- **CI infrastructure may not exist.** Step 4 then becomes "build CI, then wire gate."
- **Maintainer capacity may be insufficient.** Most realistic outcome.
- **Alternative tools may obsolete the project.** If Perplexity Deep Research or OpenAI Deep Research close the quality gap at lower cost, the marginal value of these improvements drops.
- **Output quality may already be the binding constraint.** If outputs are mediocre (Section 0 / G4), reliability improvements move the project sideways, not forward.

---

## Recommendations: A Sequenced Roadmap (with pre-roadmap gates)

### Pre-roadmap: cheap research that should run first

These are critique-gap items that cost hours, not weeks, and that materially change the roadmap's priorities if their answers are surprising. Run before committing to step 1.

- **G1**: Measure observed hang rate from `notes/test-run-log.md` with stated sample size.
- **G2**: Read `validate_report.py`; enumerate and classify checks.
- **G3**: Verify `atomic_checkpoint.py` exists and matches description.
- **G4**: Spot-check output quality from 3 random test runs.
- **G6**: Investigate the v15 hang root cause.
- **G7**: Inventory CI / test infrastructure.

### The roadmap (sequenced by dependency, with caveats)

1. **Subprocess switch** (`Task` → `claude -p` + shell `timeout`). Hours to days. Effectiveness pending validation (G6, post-implementation hang-rate measurement).
2. **Backward-compatible telemetry extensions** to `_checkpoint.json` (token counts, per-phase wall-clock, exit codes, OpenTelemetry GenAI trace IDs) [7]. Days. No schema break.
3. **Typed per-phase IO contract** (JSON schema per phase artifact, validate on read/write, retry-with-validation). 1–2 weeks (engineering guess). Migration cost: existing test-run artifacts become incomparable.
4. **Wire `validate_report.py` to a CI regression gate** + add semantic checks. Days for wiring (assuming CI exists); ongoing for golden set. Cost-significant if LLM-as-judge added.
5. **Provider abstraction**, *only if demand is validated*: LiteLLM for the API layer (1–2 days, engineering guess) [9], then portable retrieval/web-fetch libraries replacing harness-specific calls (3–6 weeks, engineering guess).

**Quick wins for a capacity-constrained maintainer:** Steps 1 and 2 only. Steps 3–5 are realistic only over multi-month horizons or for full-time capacity.

---

## Limitations

Strengthened from the original three caveats. In rough order of how much they would change the roadmap:

1. **Hang-rate sample size is unknown.** The "~20%" figure is the project's own hedged working estimate, not a measurement. Pre-roadmap research item G1 closes this gap cheaply.
2. **Load-bearing primitives are unverified in this synthesis.** `validate_report.py` contents (G2), `atomic_checkpoint.py` existence and implementation (G3), the five-bug-fix git history (G5). All cheap reads; none performed here.
3. **Output quality is unmeasured.** The fifth axis the original synthesis didn't address (G4). May be the binding constraint.
4. **Alternative architectures unconsidered.** Single-phase 1M-context, fewer-phase pipelines, existing agentic frameworks (LangGraph/CrewAI). Section 6's new subsection notes this; no evaluation performed.
5. **Maintainer capacity is unscoped.** The roadmap is sized to a problem; its realism depends on weeks-vs.-hours-per-week capacity not stated anywhere in the source material.
6. **Subprocess-switch effectiveness is documented but not validated.** ADR-001 [1] documents the decision; no branch with measured post-fix hang rate is known.
7. **Pre-v14 *and* post-v14 baselines lack documented measurements.** Pre-v14 ran at medium effort [1][5]; post-v14 has no documented benchmark set. Any A/B comparison framework needs a baseline-generation step before it has anything to compare against.
8. **Two unresolved external-statistic contradictions persist.** Datadog *State of AI Engineering 2026* error rates (5% vs. 2%, 60% vs. 33% rate-limit share) [12] and UserPromptSubmit hook regression activation rates (37% vs. 50%) [10]. Qualitative findings hold; specific numbers should not be cited downstream until reconciled.
9. **Asymmetric source visibility in the upstream triangulation.** Only one of the four lenses had directly auditable structured source analyses. Where lenses disagree, evidence weight tilts toward those with full source detail.
10. **Provider portability demand is unvalidated.** Section 4's recommendation is conditional. If no user has requested it, defer indefinitely.

---

## Changes Applied

A per-finding response log addressing the red-team critique. Format: `[ID] Finding → Action`.

### Weak claims

- **WC1** (20% hang rate as established statistic) → **Softened.** Reframed in Executive Summary point 2 and Section 1 as "documented hang failure mode... rate-of-occurrence estimate from the project's own CLAUDE.md... sample size, observation window, and counting methodology are not stated." Added pre-roadmap gap G1 (read `notes/test-run-log.md`; compute observed rate with stated sample size). Did not invent a replacement statistic.
- **WC2** (MAST 41–87% comparison non-comparable) → **Removed.** The MAST citation [3] was rhetorical framing rather than evidence and is no longer used in Section 1.
- **WC3** (time estimates fabricated with no provenance) → **Labeled.** All time estimates (LiteLLM 1–2 days; harness portability 3–6 weeks; IO contract 1–2 weeks; CI wiring days vs. hours) now carry "engineering guess, not source-derived" annotations. Section 8 collects them in a single cost matrix.
- **WC4** (Anthropic 90.2% cross-domain transfer) → **Reframed.** Section 6 now distinguishes "architectural pattern match" (the strong claim, retained) from "result transfer" (the overclaim, removed). The 90.2% number is described as Anthropic's internal-benchmark result, not as transferable validation.
- **WC5** (all 9 checks syntactic — unverified) → **Softened.** Section 5 now states this synthesis has not read `validate_report.py` and cannot verify either the count or the classification. Added pre-roadmap gap G2.
- **WC6** (atomic_checkpoint correctly implemented — unverified) → **Softened.** Section 2 explicitly says "this synthesis cannot independently verify that claim" and adds pre-roadmap gap G3 (verify file exists, implementation matches description, is actually used).
- **WC7** (five bug fixes reactive accumulation — asserted not demonstrated) → **Softened.** Section 7 now frames it as a "hypothesis" rather than a demonstrated pattern, with pre-roadmap gap G5 to validate via git archaeology. Notes the hypothesis is plausible but not evidenced.
- **WC8** (false signal of quality overstates risk) → **Reframed.** Section 5 now describes the gate as producing a "narrow" signal rather than a "false" one, framed for a single-maintainer skill repo rather than production software.
- **WC9** (provider portability demand assumed) → **Gated.** Section 4 opens with an explicit demand-validation gate: if no user has requested provider portability, defer the section indefinitely.
- **WC10** (post-v14 baselines also unmeasured) → **Made explicit.** Section 6 now states explicitly that *both* pre-v14 and post-v14 baselines lack documented measurements. Strengthened in Limitations point 7.

### Missing perspectives

- **MP1** (user-facing output quality absent) → **Added.** New Section 0 enumerates output-quality assessment as the highest-priority gap. New Limitations point 3. Pre-roadmap gap G4 (spot-check 3 random reports for citation correctness, source diversity, factual accuracy).
- **MP2** (cost analysis missing) → **Added.** New Section 8 cost-vs-value matrix includes per-step token-cost impact. Section 3 adds a cost note for telemetry. Section 5 flags LLM-as-judge factuality as cost-significant. Section 0 lists cost-per-run as an unscoped gap.
- **MP3** (no comparison to alternatives) → **Added.** Section 0 lists comparison to GPT Researcher, Perplexity, Gemini Deep Research, OpenAI Deep Research, ChatGPT Deep Research as a pre-roadmap gap. Not evaluated in synthesis; flagged as a binding question for the maintainer.
- **MP4** (single-maintainer reality ignored) → **Added.** Section 0 lists maintainer capacity as an unscoped gap. Section 8 includes "Rough capacity scoping" subsection sizing the roadmap to a 4-hour/week capacity.
- **MP5** (security and safety absent) → **Added.** Section 0 lists security gaps explicitly: prompt injection from retrieved web content, tool poisoning via malicious sources, PII in saved test outputs, secret leakage in `.remember/` notes. Recommended as a pre-roadmap audit, not a roadmap item.
- **MP6** (simpler alternative architectures missing) → **Added.** Section 6 has a new "Alternative architectures not considered" subsection enumerating single-phase Opus-1M-context, fewer-phase pipelines, and existing agentic frameworks (LangGraph, CrewAI). Flagged as a one-paragraph pre-roadmap research item.
- **MP7** (failure modes beyond hangs absent) → **Added.** Section 6 has a new "Survivor bias on failure modes" subsection. Section 0's gaps table includes "failure modes beyond hangs" as a categorization task. Section 1 acknowledges the synthesis cannot rank silent failure modes against visible ones.
- **MP8** (user research goals invisible) → **Acknowledged.** Section 0 lists user-base/use-cases as an unscoped gap. Pre-roadmap gap G9 (look for usage telemetry, feedback issues, commit messages) added implicitly via Section 0.
- **MP9** (backward compatibility / migration cost) → **Added.** Section 2 has a new "Migration cost" subsection. The IO contract is no longer presented as pure upside; existing test-run artifacts become incomparable across the boundary. Section 0 lists migration cost.
- **MP10** (reverse-causality on hang rate) → **Added.** Section 1 explicitly distinguishes "documented" from "validated" — ADR-001 documents the decision, but no measured post-fix hang rate is known. Pre-roadmap gap G6 (investigate v15 hang root cause; determine whether deterministic, network-dependent, or random; check whether subprocess switch addresses the actual cause).
- **MP11** (test infrastructure assumptions) → **Added.** Section 5 explicitly flags the CI-infrastructure assumption. Pre-roadmap gap G7 (inventory `.github/workflows/`, `Makefile`, etc.). Section 8's "what could break this roadmap" includes "CI infrastructure may not exist."
- **MP12** (research methodology validity vs. infrastructure quality) → **Acknowledged.** Section 0's note that this synthesis treats infrastructure as the entire problem space is the umbrella acknowledgment. Section 6's alternative-architectures subsection is the most concrete instance.

### Improvements (I1–I13)

- **I1** (reframe 20% hang rate) → Applied in Executive Summary point 2 and Section 1 ("documented hang failure mode... ~20% rate-of-occurrence estimate from the project's own CLAUDE.md").
- **I2** (Section 0 on output quality) → Applied as a full new Section 0 covering output quality, cost, alternatives, capacity, security, alternative architectures, failure modes beyond hangs, and migration cost.
- **I3** (cost estimates per recommendation) → Applied in Section 8's cost matrix (token-cost-impact-per-run column) and in inline cost notes in Sections 3 and 5.
- **I4** (source time estimates or mark as guesses) → Applied. All time estimates now carry "engineering guess, not source-derived" annotations.
- **I5** (verify load-bearing primitives) → Applied as pre-roadmap gaps G2, G3, G5. Synthesis itself does not verify; it explicitly defers verification to the maintainer's pre-roadmap pass.
- **I6** (alternative architectures subsection) → Applied as a new Section 6 subsection enumerating three alternatives (single-phase 1M-context, fewer-phase pipelines, existing agentic frameworks).
- **I7** (provider-portability demand-validation gate) → Applied as Section 4's opening "Demand-validation gate" subsection.
- **I8** ("what could break this roadmap" subsection) → Applied as a Section 8 subsection of the same name.
- **I9** (distinguish documented from validated) → Applied in Executive Summary point 2 and Section 1's "What is documented vs. what is measured" subsection.
- **I10** (acknowledge survivor bias on failure modes) → Applied in Section 6's "Survivor bias on failure modes" subsection. Also reflected in Section 1's "What the synthesis does not know" list.
- **I11** (move meta-pattern earlier) → Applied. The "five recommendations form one coherent program" thesis now anchors Executive Summary point 1. Section 7 retained as a softened version of the original.
- **I12** (cost-vs-value matrix) → Applied as Section 8's main table.
- **I13** (strengthen Limitations) → Applied. Limitations expanded from 3 caveats to 10, ordered by roadmap-changing magnitude.

---

`★ Insight ─────────────────────────────────────`
**Two refinement principles worth making visible:**
1. **When a critique flags an unverified load-bearing claim, the right move is to defer verification to a pre-roadmap research item rather than fabricate a replacement number.** This synthesis now explicitly hands six gap-fill questions (G1–G7, minus G4 which is in Section 0) back to the maintainer instead of pretending it has answered them.
2. **The "single coherent program, not a menu" thesis was buried at the bottom of the original synthesis.** Promoting it to Executive Summary point 1 changes how the document reads — recommendations now feel like *parts of a program* from the first paragraph rather than *items on a list* until the very end. Structural reordering can be a stronger refinement than wording changes.
`─────────────────────────────────────────────────`

**Word count:** ~4,750 words (up from ~2,650; growth concentrated in Section 0, Section 8, Section 6's new subsections, strengthened Limitations, and the Changes Applied log).