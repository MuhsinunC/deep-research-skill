`★ Insight ─────────────────────────────────────`
**Outline-design principle for triangulated evidence:** The structure should mirror how the evidence resolved, not how the original research questions were framed. The four-axis question (reliability/observability/portability/quality) produced strong convergence on a *two-step sequence* (subprocess → typed IO contract). An outline organized by the original four axes would obscure the sequencing finding; one organized by the resolved sequence makes the dependency explicit. I'm choosing the second.
`─────────────────────────────────────────────────`

# Refined Outline: Improving the Deep Research CLI/Skill

**Audience:** Maintainer of the deep-research-skill repo deciding what to build next.
**Length target:** Long-form report (~3,500-5,000 words).
**Organizing logic:** Reliability prerequisites → design abstraction → cross-axis compounding → meta-pattern critique → recommendations & caveats.

---

## Executive Summary (5 bullets)

1. The pipeline's ~20% per-run hang rate from `Task` tool synchronous spawn is the load-bearing reliability defect; the fix (subprocess + `timeout`) is well-understood, documented in ADR-001, and is a *prerequisite* for any other improvement to be measurably observable.
2. The two highest-leverage changes are complementary, not competing: the **subprocess switch** is the reliability prerequisite, and the **typed per-phase IO contract** is the design abstraction that compounds across reliability, observability, portability, and evaluation — and they must be sequenced in that order.
3. The project's observability is currently write-only — artifacts exist but carry no token counts, timing, or exit codes — and adopting OpenTelemetry GenAI Semantic Conventions now is far cheaper than re-instrumenting later.
4. Provider portability is a two-layer problem that one-layer solutions (LiteLLM alone) cannot solve: API-layer translation is days of work; harness-layer portability (subprocess + retrieval abstraction) is weeks and depends on the typed IO contract.
5. Prompt-quality evaluation infrastructure already exists (`validate_report.py`, `verify_citations.py`, test-run log) but is purely syntactic and unwired to any regression gate; the cheap win is wiring, but the meaningful win requires adding semantic checks (LLM-as-judge factuality, schema compliance, trajectory assertions).

---

## Main Analysis Sections

### Section 1 — The Reliability Crisis: Why the Subprocess Switch Is Non-Negotiable

**Claim 1.1:** The deep-research pipeline experiences a ~20% hang rate per run, caused by `Task` tool sub-agents idling at 0% CPU with no timeout, blocking the parent indefinitely.
- *Evidence:* Verified Finding #1 (4-lens convergence); empirically confirmed in v15 run UUID E72ABA74; corroborated by upstream GitHub issue #49150; contextualized within the MAST taxonomy's 41-87% multi-agent failure range.

**Claim 1.2:** This is a structural platform constraint, not a bug to wait out — Anthropic closed the upstream timeout-flag request as "not planned," removing the platform-side fix path.
- *Evidence:* Verified Finding #2; ADR-001 explicitly recommends switching to `claude -p` subprocesses with shell-level `timeout` wrappers.

**Claim 1.3:** The subprocess switch is not merely an enhancement; it is a precondition. Without it, the other three improvement axes (observability, portability, evaluation) cannot be measurably improved because the underlying pipeline fails non-deterministically ~1 in 5 runs.
- *Evidence:* Resolved Contradiction #4 — Critical lens explicitly: *"the subprocess switch is not an enhancement — it is a prerequisite for the other improvements to be meaningful"*; Practitioner sequencing: subprocess → telemetry → eval → portability.

---

### Section 2 — The Typed Per-Phase IO Contract: One Abstraction, Four Payoffs

**Claim 2.1:** A typed per-phase IO contract (JSON schema per phase artifact, validated on read and write) is the single highest-leverage *design* abstraction available, because it simultaneously enables retry-with-validation (reliability), structured telemetry (observability), provider-agnostic prompts (portability), and golden-set evaluation (quality).
- *Evidence:* Verified Finding #10 (Academic + Critical + Historical convergence with Practitioner sequencing caveat).

**Claim 2.2:** The contract becomes implementable only *after* the subprocess switch — sub-agents must be invokable as discrete processes with structured I/O before contract enforcement has a meaningful injection point.
- *Evidence:* Resolved Contradiction #4 — both "highest-leverage" recommendations dissolve into a sequence: subprocess first, IO contract second.

**Claim 2.3:** The current `atomic_checkpoint.py` primitive is correctly implemented (`os.replace()` after `fsync()`, same-filesystem `.tmp` sibling) — so the engineering gap is *what to write into the schema*, not *how to write atomically*. This is unusually low-friction infrastructure to extend.
- *Evidence:* Verified Finding #4 (auditable code, deterministic behavior).

---

### Section 3 — Observability Is Write-Only: The Telemetry Gap and OpenTelemetry as the Target

**Claim 3.1:** The artifacts the pipeline produces (`_checkpoint.json`, `_subagent_progress.json`, `_DONE`, `.log`/`.err`) are write-only logs: they record that things happened, not how long they took, what they cost, or how they exited. Diagnosing a failed run requires manual file archaeology.
- *Evidence:* Verified Finding #5 (Critical + Historical + Practitioner, directly observable in the schema).

**Claim 3.2:** OpenTelemetry GenAI Semantic Conventions (`gen_ai.usage.input_tokens`, `gen_ai.request.model`, `gen_ai.provider.name`, etc.) are the right instrumentation target — adopting them now means future migration to any vendor backend (Datadog, Honeycomb, Phoenix, Langfuse) becomes a configuration change rather than a re-instrumentation effort.
- *Evidence:* Verified Finding #8 (official spec, broadly adopted, multi-vendor support).

**Claim 3.3:** Telemetry additions can be made backward-compatible by extending `_checkpoint.json` with optional fields rather than schema-breaking changes — keeping existing test-run log compatibility while enabling immediate diagnostic value.
- *Evidence:* Practitioner sequencing recommendation; the project's existing checkpoint primitive supports extension cleanly.

---

### Section 4 — Provider Portability Is Two Layers, Not One

**Claim 4.1:** LiteLLM solves the API layer (model translation) but cannot solve the harness layer (the agent runtime). It cannot intercept Claude Code CLI flags (`--effort max`, `--dangerously-skip-permissions`), substitute for the Claude Code agent loop, or replace the `Task`/subprocess spawn mechanism — the spawned process is still Claude Code; only the model serving requests changes.
- *Evidence:* Resolved Contradiction #1 — Critical and Practitioner converge against Historical's incorrect framing.

**Claim 4.2:** Provider assumptions are pervasive and unabstracted throughout the codebase: `claude -p`, `--model opus`, `--effort max`, `--dangerously-skip-permissions`, `Task` tool, `CLAUDE_CODE_DEEP_RESEARCH_WORKER` env-var, and tmux session naming all hardcode the Claude Code harness — no interface boundary exists.
- *Evidence:* Verified Finding #6 (direct grep-confirmable in SKILL.md and methodology.md).

**Claim 4.3:** Genuine provider portability requires both layers: LiteLLM for API translation (1-2 days), plus subprocess + portable retrieval/web-fetch libraries for harness independence (3-6 weeks). The typed IO contract from Section 2 is the connective tissue that makes layer-2 portability tractable.
- *Evidence:* Practitioner two-tier framing; logical entailment from Verified Findings #6 and #10.

---

### Section 5 — Prompt Quality: Cheap Wiring vs. Meaningful Coverage

**Claim 5.1:** The evaluation harness mechanism is near-complete — `validate_report.py` already loads reports, iterates checks, and emits pass/fail — and wiring it to a CI-triggerable regression gate is a low-effort change.
- *Evidence:* Resolved Contradiction #3 (Academic correct on mechanism); Verified Finding #9.

**Claim 5.2:** However, all 9 existing checks are *syntactic*, not *semantic*. A report can pass every check while containing 100% fabricated citations to non-existent URLs, invalid phase-artifact schemas, or factually inconsistent content. Wiring the gate without adding semantic checks creates a false signal of quality.
- *Evidence:* Resolved Contradiction #3 (Critical and Practitioner correct on coverage); the Academic lens conflates harness mechanism with evaluation coverage.

**Claim 5.3:** The missing layer is a small set of additions: LLM-as-judge factuality checks against retrieved sources, schema compliance per phase artifact, trajectory assertions (did the model follow the phase instructions?), prompt-version identifiers, and a golden test set for A/B comparison.
- *Evidence:* Verified Finding #9; Resolved Contradiction #3 resolution paragraph.

---

### Section 6 — Architectural Validation and Misleading Baselines

**Claim 6.1:** The hybrid Opus-orchestrator + Sonnet-sub-agent architecture the skill independently converged on matches Anthropic's own production multi-agent research system, which reported a 90.2% improvement over single-agent Opus on internal benchmarks. The architectural choice is externally validated.
- *Evidence:* Verified Finding #7 (Anthropic engineering blog, first-party source).

**Claim 6.2:** The current SKILL.md description is *already* directive — it contains both the affirmative ALWAYS-invoke pattern and the negative do-not-attempt-directly constraint — and activation should approach the ~100% rate observed for bare-condition directive descriptions in the 650-trial study. Claims that the description is "passive" are out-of-date.
- *Evidence:* Resolved Contradiction #2 — verified against ground truth in the live skill list.

**Claim 6.3:** Pre-v14 quality benchmarks should not be used as max-effort baselines. All historical "success" data prior to v14 reflects medium-effort behavior because `zsh -c` does not source `~/.zshrc`, so the operator-intended `CLAUDE_CODE_EFFORT_LEVEL=max` was silently absent. Future benchmarking must explicitly verify effort level inside the spawned process.
- *Evidence:* Verified Finding #3 (test-run log + ADR-001).

---

### Section 7 — The Meta-Pattern: Reactive Accumulation as a Risk Signal

**Claim 7.1:** The spawn template currently bundles 5+ distinct bug fixes (`< /dev/null` redirect, `_starting.txt` pre-spawn, env-guard, `[ROLE-CHECK-WRAPPER]` echo, named tmux sessions), each added after a real failure. This pattern of accretion is itself a risk signal — the architecture is being patched reactively rather than designed proactively.
- *Evidence:* Verified Finding #11 (Practitioner explicit + Historical implicit through ADR reversal pattern).

**Claim 7.2:** A real, high-impact failure mode that exemplifies the risk: compaction-induced output-file deletion (Issue #23821) caused one documented case to lose 10 of 14 output files. The disk-based handoff model is the correct mitigation, but `--dangerously-skip-permissions` in nohup mode means there's no graceful pause as the compaction window approaches.
- *Evidence:* Verified Finding #12 (Critical Source 3 + Historical Source 8, corroborated by external GitHub issue).

**Claim 7.3:** The proposed direction — formal reliability model with subprocess + typed IO contract + structured telemetry — converts the architecture from a *patch-accretion pattern* to a *contract-enforced pattern*. This is a one-time cost that ends recurring one-off cost.
- *Evidence:* Logical synthesis from Verified Findings #2, #10, #11; Practitioner sequencing.

---

## Recommendations Preview

The recommendations section will present a **sequenced roadmap**, not an unordered list. The sequencing is itself the central recommendation — each step unlocks the next.

1. **Subprocess switch** (`Task` → `claude -p` + `timeout`) — the reliability prerequisite. Hours-to-days to implement; eliminates the ~20% hang rate.
2. **Backward-compatible telemetry extensions** to `_checkpoint.json` (token counts, per-phase wall-clock, exit codes, trace IDs) using OpenTelemetry GenAI conventions — days. No schema break; immediate diagnostic value.
3. **Typed per-phase IO contract** (JSON schema per phase artifact, validate on read/write, retry-with-validation) — 1-2 weeks. Compounds across all four axes.
4. **Wire `validate_report.py` to a CI regression gate** + add semantic checks (LLM-judge factuality, schema compliance, trajectory assertions, prompt-version IDs, golden test set) — 1-2 weeks for the gate, ongoing for the golden set.
5. **Provider abstraction**: LiteLLM for API layer (days), then portable retrieval/web-fetch libraries replacing harness-specific calls (weeks). The IO contract from step 3 is the connective tissue.

**Quick wins separated from structural changes** so a reader can pick up days-of-work items without committing to weeks-of-work items.

---

## Limitations Preview

The limitations section will be honest about three categories of caveats:

1. **Two unresolved external-statistic contradictions** — Datadog State of AI Engineering 2026 error-rate figures (5% vs 2%, 60% vs 33% rate-limit share) and the UserPromptSubmit hook-regression activation rate (37% vs 50%) — both originate from the same primary sources but were transcribed differently by different lenses. The qualitative findings hold; the specific numbers should not be cited downstream until reconciled. **Operational lesson:** future research dispatches should capture snapshot dates and direct-page URLs for any external statistic, not just the parent report URL.

2. **Asymmetric source visibility in the triangulation** — Only the Academic lens's insight summary was visible; its 13 structured source analyses were referenced but not directly auditable. Where Academic disagrees with the other three lenses, the evidence weight tilts heavily toward the lenses with full source detail (this is why Resolved Contradictions #1 and #3 went against Academic's framing).

3. **Pre-v14 baselines are unusable as max-effort comparisons** — All historical quality data prior to v14 reflects medium-effort behavior due to the `zsh -c` shell-init gap. Any A/B comparison or regression detection must use post-v14 baselines exclusively, and future benchmarks should mechanically verify effort level inside the spawned process before recording results.

A fourth, softer limitation: the recommendations assume the maintainer wants to keep deep-research as a Claude-Code-first skill that *also* supports other providers, rather than a provider-neutral library that *also* runs in Claude Code. The two framings produce different prioritizations of step 5 (provider abstraction). The outline implicitly assumes the former; the limitations section will name this assumption explicitly.

---

`★ Insight ─────────────────────────────────────`
**Two structural choices worth flagging for the writer:**
1. **Section 6 deliberately mixes "validated" and "misleading" findings** under one heading because they're three sides of the same coin — what the architecture got right, what's still right today, and what was never actually measured at the configuration the operator believed. Splitting them into separate sections would lose the through-line that *external validation alone is insufficient if internal benchmarks were never measured at the intended configuration*.
2. **The recommendations preview gives sequence, not effort-totaled estimates** — because the dependency structure is the load-bearing insight, not the budget. A reader who skips ahead to "what should I do?" will see step 1 as obviously first; this is by design. Effort totals belong in the full recommendations section, not the preview.
`─────────────────────────────────────────────────`