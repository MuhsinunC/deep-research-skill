`★ Insight ─────────────────────────────────────`
**Triangulation methodology note:** The most diagnostic contradictions aren't disagreements on facts — they're disagreements on what counts as "the same thing." Three of the four contradictions I found below are framing collisions (e.g., "near-complete harness" vs "near-complete coverage" — both true under different definitions). Real factual contradictions usually resolve cleanly once you check primary evidence; framing collisions require renaming the question.
`─────────────────────────────────────────────────`

# Triangulation: Deep Research CLI Improvement Findings

**Date:** 2026-05-03
**Lenses triangulated:** Academic · Critical · Historical · Practitioner
**Method:** Pairwise claim comparison across all 13–15 sources per lens; resolution by primary-evidence weight where possible.

---

## Contradictions Resolved

### 1. Is LiteLLM sufficient for provider portability?

**Conflicting claims:**
- **Historical (Source 11):** "LiteLLM ... would replace the hardcoded `claude -p` spawn with a provider-agnostic process invocation — the key blocker for Gemini or local Ollama backend support."
- **Critical (Source 11):** "LiteLLM's translation preserves the Anthropic *format* but not Anthropic-specific parameters: `--effort max` and `--dangerously-skip-permissions` are Claude Code CLI flags that the proxy cannot intercept. The spawned `claude -p` process is still Claude Code; only the model serving the requests changes. ... Genuine provider portability ... requires replacing the spawn mechanism itself."
- **Practitioner (Source 12 + Theme 3):** Two-tier view — LiteLLM solves the *API layer* (1–2 days work) but harness-level portability requires the subprocess architecture switch and is "a separate, larger effort" of 3–6 weeks.

**Resolution: Historical is incorrect.** Critical and Practitioner converge on the technically accurate read: LiteLLM is a model-routing proxy, not a harness replacement. It cannot intercept Claude Code CLI flags or substitute for the Claude Code agent loop. Historical's claim conflates "swapping the model serving requests" with "replacing the runtime that issues those requests." The two-tier framing in Practitioner is the most accurate: LiteLLM solves layer 1; subprocess + portable retrieval libraries solve layer 2.

---

### 2. Is the current SKILL.md description directive or passive?

**Conflicting claims:**
- **Historical (Source 5):** "The current SKILL.md description is of the 'passive' variety and likely achieves ~77% activation."
- **Practitioner (Source 6):** "The current SKILL.md description uses this exact pattern [directive 'ALWAYS invoke ... do not attempt directly'], which is why activation is reliable."

**Resolution: Practitioner is correct, verified against ground truth.** The current deployed description visible in this session's skill list reads: *"Deep research expert. ALWAYS invoke for deep research, research reports, comprehensive analysis, or multi-source investigation. Do not attempt research directly -- use this skill first. NOT for simple lookups or debugging."* This contains both elements of the directive pattern (an "ALWAYS invoke" affirmative + a "do not attempt directly — use this skill first" negative constraint). Historical's claim of "passive" wording is incorrect — possibly out-of-date or reading a different file. Activation should be near the 100% bare-condition rate from the 650-trial study, not the ~77% passive rate.

---

### 3. Is `validate_report.py` a near-complete eval harness or only syntactic?

**Conflicting claims:**
- **Academic (insight):** "`validate_report.py`'s 9 existing checks are already a near-complete evaluation harness — the missing piece is wiring them to a regression gate, not writing new evaluation logic. This is an unusually low-effort path to measurable prompt quality."
- **Critical (Source 6):** "All checks are syntactic — none are semantic. A report can pass all 9 checks while containing 100% fabricated citations to non-existent URLs."
- **Practitioner (Theme 4):** "[Validators] check structure and citation format, not whether the model followed the phase instructions, produced valid phase-artifact JSON schemas, or produced factually consistent output."

**Resolution: Critical and Practitioner are correct on coverage; Academic is correct on harness mechanism — they're answering different questions.** The harness mechanism (loading the report, iterating checks, emitting pass/fail) is indeed near-complete and could be wired to CI cheaply. But the *evaluation coverage* (what the checks actually verify) is structural-only and would let major semantic failures pass. The Academic lens conflates these. Operationally, the conclusion stands: regression-gate wiring IS low-effort, but it must be paired with semantic checks (LLM-as-judge factuality, trajectory assertions, schema compliance per phase) before "measurable prompt quality" actually means anything.

---

### 4. What is the single highest-leverage change?

**Conflicting claims:**
- **Academic, Critical (Theme 5), Historical (Theme 5):** A typed per-phase IO contract — "the highest-leverage single change across all four improvement axes."
- **Practitioner (Theme 5):** The subprocess architecture switch — "the single change with the highest cross-axis leverage."

**Resolution: Both are correct under different framings; the apparent contradiction dissolves with sequencing.** The Practitioner explicitly orders: *"subprocess switch first ... then structured telemetry additions to `_checkpoint.json` (backward-compatible), then promptfoo golden set (independent), then provider abstraction via LiteLLM."* The Critical lens (Theme 1) actually agrees: *"the subprocess switch is not an enhancement — it is a prerequisite for the other improvements to be meaningful."* The reframing:

- **Subprocess switch** = highest-leverage *reliability prerequisite*. Without it, the other axes cannot be measurably improved because the pipeline hangs ~20% of the time.
- **Typed IO contract** = highest-leverage *design abstraction*. Once sub-agents are subprocesses, the IO contract simultaneously enables retry-with-validation, structured telemetry, provider-agnostic prompts, and golden-set evaluation.

The two recommendations are complementary, not competing. Sequence: subprocess first → typed IO contract second → telemetry/eval/portability follow.

---

## Contradictions Unresolved

### 1. Datadog State of AI Engineering 2026 — error rate statistics

**Conflicting claims:**
- **Critical (Source 12):** "5% of all LLM call spans report an error; 60% of those errors are caused by exceeded rate limits" (cited as Feb 2026).
- **Historical (Source 12):** "In March 2026, 2% of all LLM spans returned errors; rate limits accounted for nearly one-third of those (~8.4 million rate limit errors during the measurement period)."

Both lenses cite the same Datadog *State of AI Engineering 2026* report. The numbers differ by a factor of 2.5× on overall error rate and ~2× on rate-limit share. Possible explanations: (a) different time-window snapshots within the same report, (b) different sub-populations ("LLM call spans" vs "LLM spans"), (c) one lens transcribed the figure incorrectly.

**Status: UNRESOLVED.** Cannot adjudicate without direct access to the Datadog report at the cited snapshot timestamps. **What is verified across both:** rate limits are a top-N production error class for multi-agent LLM systems, and a research pipeline making 50–100 LLM calls per deep run faces a non-trivial rate-limit-induced failure probability. The qualitative finding holds; the specific quantitative claims should not be cited downstream until reconciled with the primary source.

---

### 2. UserPromptSubmit hook regression — passive-description activation rate

**Conflicting claims:**
- **Critical (Source 9):** "A `UserPromptSubmit` hook without CLAUDE.md reinforcement actually *hurts* passive descriptions (87.5% → 37%)."
- **Historical (Source 5):** "Claude began ignoring `UserPromptSubmit` hook instructions after a model update, dropping hook-only activation to ~50%."

Both reference the same consistency-hardening research synthesis. The post-regression activation rate is reported as 37% (Critical) vs ~50% (Historical) — a 13-point gap that's larger than measurement noise on a 650-trial study would predict.

**Status: UNRESOLVED.** Cannot adjudicate without re-reading the underlying study at `notes/research/consistency-hardening-research.md`. **What is verified across both:** UserPromptSubmit hooks suffered a real regression in March 2026; hook-only activation degrades meaningfully for passive descriptions; the dual-mechanism (directive description + CLAUDE.md reinforcement) is required for robust activation. The qualitative finding is reliable; the specific percentages should be re-verified against the source before being used as planning inputs.

---

## Verified Cross-Cutting Findings

These claims appear in 3+ lenses without material disagreement and constitute the high-confidence triangulated baseline.

| # | Finding | Lens coverage | Confidence |
|---|---|---|---|
| 1 | **~20% per-deep-run hang rate** caused by Task tool synchronous parallel spawn with no timeout. | Academic + Critical + Historical + Practitioner | Very high — empirically confirmed in v15 (UUID E72ABA74), corroborated by GitHub #49150, contextualized by MAST 41–87% taxonomy range. |
| 2 | **Subprocess switch (`Task` → `claude -p` with `timeout`) is the load-bearing reliability fix.** Anthropic closed the upstream timeout request "not planned." | Academic + Critical + Historical + Practitioner | Very high — ADR-001 explicitly recommends; GitHub #49150 closed-not-planned removes the platform-fix path. |
| 3 | **Pre-v14 runs ran at default-medium effort despite operator intent**, because `zsh -c` does not source `~/.zshrc`. All historical "success" data prior to v14 reflects medium-effort behavior, not max. | Critical + Historical + Practitioner | Very high — explicitly documented in test-run log and ADR-001. Implication: pre-v14 quality benchmarks should not be used as max-effort baselines. |
| 4 | **`atomic_checkpoint.py` primitive is correctly implemented** (`os.replace()` after `fsync()`, same-filesystem `.tmp` sibling). The gap is schema content, not mechanism. | Academic + Critical + Historical + Practitioner | Very high — code is auditable; behavior is deterministic. |
| 5 | **Observability is write-only.** Artifacts exist (`_checkpoint.json`, `_subagent_progress.json`, `_DONE`, `.log`/`.err`) but carry no token counts, per-phase wall-clock timing, sub-agent exit codes, or trace IDs. Diagnosing a failed run requires manual file archaeology. | Critical + Historical + Practitioner | Very high — directly observable in the schema. |
| 6 | **Provider assumptions are pervasive and unabstracted** — `claude -p`, `--model opus`, `--effort max`, `--dangerously-skip-permissions`, `Task` tool, `CLAUDE_CODE_DEEP_RESEARCH_WORKER` env-var, tmux session naming. No interface boundary exists. | Critical + Historical + Practitioner | Very high — direct grep-confirmable in SKILL.md and methodology.md. |
| 7 | **Hybrid Opus orchestrator + Sonnet sub-agents architecture is validated by Anthropic's production system** (90.2% improvement over single-agent Opus per Anthropic engineering blog). The deep-research skill converged on this independently. | Critical + Historical + Practitioner | High — corroborated by first-party Anthropic source. |
| 8 | **OpenTelemetry GenAI Semantic Conventions are the right target for telemetry instrumentation** (`gen_ai.usage.input_tokens`, `gen_ai.request.model`, `gen_ai.provider.name`, etc.) — adopting them now avoids re-instrumentation cost later. | Critical + Historical + Practitioner | High — official spec, broadly adopted, multi-vendor backend support. |
| 9 | **Prompt quality is currently measured manually and retrospectively.** No golden test set, no prompt-version identifier, no A/B harness, no trajectory assertions. The infrastructure components exist (`validate_report.py`, `verify_citations.py`, test-run log) but are not wired into a CI-triggerable regression gate. | Academic + Critical + Historical + Practitioner | Very high — gap is observable in repo structure. |
| 10 | **Typed per-phase IO contract is the highest-leverage *design* abstraction** (compounds across reliability, observability, portability, eval). Independent of #2 above, which is the highest-leverage *reliability prerequisite*. | Academic + Critical + Historical (+ Practitioner with sequencing caveat) | High — convergent recommendation across four lenses. |
| 11 | **The reactive accumulation pattern is itself a risk signal.** The spawn template bundles 5+ distinct bug fixes (`< /dev/null` redirect, `_starting.txt` pre-spawn, env-guard, `[ROLE-CHECK-WRAPPER]` echo, named tmux sessions), each added after a real failure. The architecture needs a formal reliability model rather than continued one-off accretion. | Practitioner (explicit) + Historical (implicit via ADR reversal pattern) | Medium-high — meta-pattern across multiple sources. |
| 12 | **The compaction-induced output-file deletion failure mode is real** (Issue #23821; one documented case lost 10 of 14 output files). The current disk-based handoff model is the correct mitigation, but `--dangerously-skip-permissions` in nohup mode means there is no graceful pause as compaction approaches. | Critical (Source 3) + Historical (Source 8) | High — corroborated by external GitHub issue and platform-constraints internal research. |

---

## Triangulation Notes & Caveats

- **Asymmetric source visibility:** Only the Academic lens's *insight summary* and *orientation paragraph* were available in the concatenation; its 13 structured source analyses were referenced but not visible. Several findings could only be triangulated against Academic's bullet-level claims, not its full evidence chains. Where Academic disagrees with the other three lenses (#3 above), the evidence weight tilts heavily toward the lenses with full source detail.
- **Internal-vs-external evidence weighting:** All four lenses correctly prioritize the project's own test-run log, ADR-001, and `atomic_checkpoint.py` source code as the highest-credibility primary evidence. External sources (Anthropic engineering blog, OpenTelemetry conventions, Datadog survey, GitHub issues) function as corroborating context. The Datadog statistical contradiction (Unresolved #1) is the one place where external-source disagreement exposed itself — primary code/log evidence had no such conflicts.
- **Convergence signal:** The four-axis question structure (reliability, observability, provider portability, prompt quality) produced striking convergence on two recommendations (subprocess switch + typed IO contract) across lenses with very different methodologies. This convergence is itself a triangulation signal: independent paths arrived at the same architectural conclusions.

`★ Insight ─────────────────────────────────────`
**Two takeaways for downstream planning:**
1. The lens-disagreements that *resolved* (LiteLLM scope, SKILL.md wording, validator coverage, "highest leverage" framing) all turned on definitions or out-of-date snapshots — none required new research to settle. The lens-disagreements that *didn't resolve* (Datadog stats, hook regression percentages) all turned on inability to re-access an external numerical claim. **Downstream lesson:** when citing external survey statistics in planning docs, capture the snapshot date and direct-page URL — not just the report URL — or the number becomes unverifiable within months.
2. The verified findings table is dominated by *primary-source-confirmed* items (project artifacts, code, test logs). The unresolved items are dominated by *external-survey-stat* items. This suggests the project's own internal observability discipline is producing higher-quality knowledge than its external-literature scanning. The proposed structured telemetry additions (Verified #5, #8) would compound this advantage — primary evidence is already the most reliable layer of the project's epistemics.
`─────────────────────────────────────────────────`