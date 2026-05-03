`★ Insight ─────────────────────────────────────`
Citation verification across three source tiers (internal project files, external GitHub issues, and official documentation) reveals that the most common failure mode in technical reports is **directional errors** — where a claim's substance is correct but the mechanism is inverted (e.g., LiteLLM's translation direction). A secondary pattern: claims about GitHub issue "closures" require distinguishing between Anthropic staff closing as policy vs. reporters self-closing as duplicates.
`─────────────────────────────────────────────────`

---

# Citation Verification Report

**Sources used:**
- **Internal** [I]: `notes/adr/001-task-tool-vs-claude-p-subagents.md`, `notes/test-run-log.md`, `skill/scripts/validate_report.py`, `skill/scripts/atomic_checkpoint.py`, `skill/SKILL.md`, `notes/research/consistency-hardening-research.md`, `CLAUDE.md`
- **External** [E]: Live web search against GitHub issues, official OpenTelemetry spec, Anthropic engineering blog, LiteLLM docs, MAST paper (arXiv:2503.13657)

---

## Claim 1

> The pipeline's hang failure mode is the most visible reliability defect, with one fully-characterized empirical case (v15, UUID E72ABA74) and a hedged ~20% rate-of-occurrence estimate from the project's own CLAUDE.md. The fix path is documented in ADR-001, but documented is not the same as validated — no branch with post-fix hang rate measurement is known.

**Verdict: VERIFIED**

**Evidence:**
- [I] ADR-001 (update section) documents the v15 hang in detail: 4 sub-agents spawned, 2 completed, 2 hung at 0% CPU for 35+ minutes, parent blocked, UUID E72ABA74 confirmed.
- [I] ADR-001 derives the ~20% estimate explicitly: v10–v13 successful (4 deep-mode runs), v14 killed for effort issue, v15 killed for hang → 1/5 attributable to hang → "estimated hang rate ~20% per deep mode run."
- [I] CLAUDE.md states: *"This failure mode hits roughly 20% of deep-mode runs"* — source is internal and hedged ("roughly").
- [I] ADR-001 documents the `claude -p` + shell `timeout` fix path but explicitly notes: *"should be implemented as a separate task…and validated with a new test run"*; test-run-log.md shows no v16+ run after the architecture switch.
- The claim that "documented is not the same as validated" is accurate: no branch with post-fix measurements appears in any project file.

---

## Claim 2

> (Table of eight unmeasured gaps: output quality, cost per run, comparison to alternatives, maintainer capacity, security/safety, alternative architectures, failure modes beyond hangs, and backward-compatibility migration cost.)

**Verdict: VERIFIED**

**Evidence:**
- [I] No spot-check of citation correctness, source diversity, or factual accuracy appears in any test-run log entry — only structural metrics (word count, claims-verified count, loop-backs).
- [I] Token-cost section of test-run-log.md explicitly states: *"These numbers are rough estimates based on report sizes and pipeline complexity, not measured."*
- [I] No comparison-to-alternatives section exists in any test-run artifact reviewed (v10–v15).
- [I] CLAUDE.md identifies this as a personal-fork side project; no maintainer capacity estimate appears.
- [I] No security review artifact or threat-model file found in the project tree.
- [I] No single-pass 1M-context variant run appears in the test-run log.
- [I] test-run-log.md shows only "hang" as a documented failure mode per notes; no catalogue of silent failures exists.
- [I] IO contract backward-compatibility cost is not addressed in any planning artifact.

All eight gaps are real absences in the project documentation.

---

## Claim 3

> The most visible reliability defect is sub-agent hangs at 0% CPU, characterized in ADR-001 and confirmed by v15 (UUID E72ABA74). External corroboration: GitHub issue #49150, where Anthropic closed the request for a Task timeout flag as "not planned."

**Verdict: QUESTIONABLE**

**Evidence:**
- [I] The hang mechanism and v15 empirical case are accurately described — confirmed by ADR-001 and test-run-log.md.
- [E] GitHub issue #49150 **does exist** and its `stateReason` is `NOT_PLANNED`, but it was **closed by its own reporter** (user `tylyp`) as a duplicate of issue #44783, not rejected by Anthropic staff as a product policy decision. GitHub automatically assigns `NOT_PLANNED` when a non-staff user self-closes an issue.
- [E] The canonical open tracking issue is **#44783** ("Parent session deadlocks when subagent tool execution hangs — no timeout or recovery"), which remains **OPEN** as of verification.
- [E] Issues #17147 (0-byte output files with `run_in_background`) and #37521 (silent indefinite hangs) are both real and cited correctly in the methodology.

The sub-claim "Anthropic closed the request for a Task timeout flag as 'not planned'" is materially misleading. Anthropic did not close #49150 or issue a policy decision through it. The platform-side fix path is not definitively closed — #44783 remains open.

---

## Claim 4

> What the synthesis does not know: the denominator behind the ~20% estimate, whether other failure modes are at comparable rates, and whether the proposed subprocess fix actually fixes the hang.

**Verdict: VERIFIED**

**Evidence:**
- [I] ADR-001 states the estimate derives from 5 deep-mode runs (v10–v15). This is a small, unstated-within-CLAUDE.md sample. CLAUDE.md itself says "roughly 20%" without stating n=5 or the run window — so the CLAUDE.md-level claim IS undocumented in the source most readers see.
- [I] No rate measurements for other failure modes (fabricated citations, incomplete sections, rate-limit timeouts) appear in any project file.
- [I] test-run-log.md shows the last entry is v15 (2026-04-07) with status `partial-killed`; no v16+ run after the architecture switch appears, confirming no post-fix hang rate has been measured.

All three epistemic limitations are accurately described.

---

## Claim 5

> The MAST 41–87% comparison has been removed. MAST measures broader multi-agent failure categories; without verification that "hang at 0% CPU" maps to MAST's failure taxonomy, the comparison was rhetorical framing rather than evidence.

**Verdict: VERIFIED**

**Evidence:**
- [E] MAST paper (arXiv:2503.13657, UC Berkeley Sky Lab) covers a failure taxonomy with **14 unique modes in 3 clusters**: system design issues, inter-agent misalignment, and task verification failures. It reports **41% to 86.7% failure rates** across 7 open-source multi-agent systems (MetaGPT, ChatDev, HyperAgent, OpenManus, AppWorld, Magentic, AG2).
- [E] None of MAST's 14 failure modes specifically addresses synchronous spawn deadlocks or process-level hang-at-0%-CPU. The taxonomy targets communication failures, task decomposition errors, and role misalignment — categorically distinct from a blocking IPC wait on a hung subprocess.
- [I] The MAST paper is noted in model-ab-test notes for its taxonomy value, not for hang-rate statistics.

Applying MAST's 41–87% statistic to the deep-research-skill's Task tool hang would be a category error. Removal is appropriate.

---

## Claim 6

> The subprocess switch is plausibly the right first step because: (1) the platform-side fix path is closed, (2) adding telemetry on a non-deterministically-failing pipeline produces noise, (3) the subprocess boundary is itself a portability move.

**Verdict: QUESTIONABLE**

**Evidence:**
- [E] Reason 1 is based on the characterization of GitHub issue #49150 as a definitive Anthropic product rejection — which is not accurate (see Claim 3). GitHub issue #44783 remains open; the platform-side path is **not definitively closed**.
- Reasons 2 and 3 are logical arguments that do not depend on external facts; they are internally consistent but UNVERIFIABLE as empirical claims.

The subprocess switch may still be the right architectural move for independent reasons, but Reason 1 rests on a misleading citation premise.

---

## Claim 7

> The original synthesis claimed the IO contract is low-friction to implement because the atomic-write primitive is "already correctly implemented" — `os.replace()` after `fsync()` on a same-filesystem `.tmp` sibling, attributed to `atomic_checkpoint.py`.

**Verdict: VERIFIED**

**Evidence:**
- [I] `skill/scripts/atomic_checkpoint.py` exists. The `_atomic_write_json()` function implements exactly the described pattern:
  ```python
  tmp = target.with_suffix(target.suffix + ".tmp")   # same-directory sibling
  f.flush(); os.fsync(f.fileno())                     # fsync before rename
  os.replace(tmp, target)                             # atomic rename
  ```
- [I] Code comment explicitly documents the cross-filesystem pitfall: *"tmp file MUST be in the same directory as target (cross-filesystem rename via /tmp/ would defeat atomicity on Linux)"* — matching the "same-filesystem" description exactly.
- [I] The function is called by `write_checkpoint()`, `write_subagent_progress()`, and `write_done()` — it is actively used, not dead code.

The original synthesis's claim about the implementation is accurate.

---

## Claim 8

> The pipeline produces `_checkpoint.json`, `_subagent_progress.json`, and `_DONE` markers, but they are write-only diagnostic logs that do not record how long things took, how many tokens were consumed, what the sub-agent exit code was, or which trace correlates with which phase.

**Verdict: VERIFIED**

**Evidence:**
- [I] `write_checkpoint()` schema: `phase_completed`, `next_phase`, `timestamp`, plus optional `extra` dict. No token counts, no wall-clock duration fields.
- [I] `write_subagent_progress()` schema: `phase`, `expected_subagents`, `completed_subagents`, `last_updated`. No exit codes, no timing.
- [I] `write_done()` schema: `completed_at`, `phase`, `status`, `uuid`. No token consumption fields.
- [I] The `extra` dict parameter exists and *could* carry additional fields, but no call site in the skill passes token counts or exit codes in `extra` (no such instrumentation in methodology or scripts).

All four stated missing fields (duration, tokens, exit code, trace correlation) are confirmed absent from the artifact schemas.

---

## Claim 9

> OpenTelemetry's GenAI Semantic Conventions define: `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.request.model`, `gen_ai.provider.name`, `gen_ai.operation.name`, plus span timing.

**Verdict: VERIFIED** *(with Development-status caveat)*

**Evidence:**
- [E] All five attribute names are confirmed in the official OpenTelemetry GenAI Semantic Conventions spec at `opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/` and the GitHub repository.
- [E] All five are marked **Development** status — subject to breaking changes before stabilization.
- [E] `gen_ai.provider.name` is the current canonical form but is relatively new; older instrumentation libraries may use the predecessor `gen_ai.system` attribute. Downstream consumers should check library version compatibility.

The attribute names are accurate; the Development status is a material caveat for stability-sensitive adoption decisions.

---

## Claim 10

> The original synthesis cited Datadog's *State of AI Engineering 2026* for production-error-rate context. Two figures were transcribed inconsistently across upstream lenses (5% vs. 2% error rate; 60% vs. 33% rate-limit share). Until the primary source is re-checked, those figures should not be cited downstream.

**Verdict: UNVERIFIABLE**

**Evidence:**
- [I] No reference to a "State of AI Engineering 2026" report appears in any project file reviewed. Datadog references in the codebase are exclusively to their December 2025 blog post on LLM OTel observability support — a different document.
- [E] Datadog does publish annual "State of DevOps" and observability reports; a "State of AI Engineering 2026" edition could exist, but the report could not be located or confirmed at verification time.
- The specific figures (5% vs. 2%; 60% vs. 33%) cannot be confirmed or contradicted without the primary document.

The meta-claim that there are inconsistencies is a reasonable red flag, but the underlying report and figures cannot be verified from available sources. The caveat "do not cite downstream until reconciled" is appropriately conservative.

---

## Claim 11

> LiteLLM translates Anthropic-format API calls into OpenAI, Gemini, Bedrock, or local-Ollama equivalents. What it cannot do is swap the harness. The Claude Code CLI flags `--effort max` and `--dangerously-skip-permissions` are agent-runtime flags that LiteLLM has no way to intercept. A `claude -p` spawn is still a Claude Code spawn.

**Verdict: CONTRADICTED** *(first sentence)* / **VERIFIED** *(remainder)*

**Evidence:**
- [E] LiteLLM's translation direction is **inverted** from the claim. LiteLLM exposes a single **OpenAI-compatible interface** and translates *incoming OpenAI-format requests outward* to each provider's native API (including Anthropic's `/v1/messages`, Gemini, Bedrock, Ollama). It does not accept Anthropic-format input and translate to other providers.
- [E] Official LiteLLM documentation confirms: callers write OpenAI-style code; LiteLLM handles per-provider format translation under the hood.
- [E] The harness-swap limitation is correctly described: `--effort` is documented by Claude Code as session-scoped and consumed by the local CLI binary before any API call is constructed. `--dangerously-skip-permissions` governs the local tool-permission system. Neither appears in the Anthropic Messages API body that LiteLLM would proxy.
- [E] The conclusion ("a `claude -p` spawn is still a Claude Code spawn") is correct.

The practical engineering conclusion — that LiteLLM can route model inference but cannot replace the Claude Code harness — is sound, but the specific description of LiteLLM's translation direction is backwards.

---

## Claim 12

> The original synthesis claimed all 9 checks in `validate_report.py` are syntactic, not semantic. This synthesis has not read `validate_report.py` and cannot verify either the count or the syntactic-vs-semantic classification.

**Verdict: VERIFIED** *(both the count and classification; the epistemic hedge was overcautious)*

**Evidence:**
- [I] `validate_report.py` exists. The `validate()` method iterates exactly **9 named checks**: Executive Summary, Required Sections, Citations, Bibliography, Placeholder Text, Content Truncation, Word Count, Source Count, Broken Links.
- [I] Every check uses regex pattern matching, string presence testing, word counting, or filesystem `exists()` calls — all syntactic/structural. None perform semantic operations (no embedding comparison, no fuzzy claim-to-source alignment, no meaning-based verification).
- The count (9) and classification (all syntactic) are both verified against the source.
- The synthesis's epistemic hedge ("cannot verify") was appropriate self-disclosure of its own limitation, even though the underlying claim turned out to be correct.

---

## Claim 13

> The wiring claim — `validate_report.py` exists, loads reports, iterates checks, emits pass/fail — survives independently of the syntactic-vs-semantic classification.

**Verdict: VERIFIED**

**Evidence:**
- [I] `validate_report.py` exists at `skill/scripts/validate_report.py`.
- [I] `_read_report()` loads the file via `open()` with UTF-8 encoding, exits on read failure.
- [I] `validate()` iterates through the 9-element `checks` list, prints ✅/❌ per check.
- [I] `_print_summary()` emits structured pass/fail with error and warning counts; `sys.exit(0 if passed else 1)` provides machine-readable exit code for CI integration.

All four wiring claims are directly confirmed by source code inspection.

---

## Claim 14

> The hybrid Opus-orchestrator + Sonnet-sub-agent design matches the architectural pattern used by Anthropic's production multi-agent research system, which reported a 90.2% improvement over single-agent Opus on internal benchmarks. This is pattern-match validation, not result-transfer.

**Verdict: VERIFIED**

**Evidence:**
- [E] The Anthropic engineering blog post ("How we built our multi-agent research system," `anthropic.com/engineering/multi-agent-research-system`) is confirmed to exist and state: *multi-agent system with Claude Opus 4 as lead agent and Claude Sonnet 4 sub-agents outperformed single-agent Claude Opus 4 by 90.2% on internal benchmarks*.
- [I] The skill uses Opus 4.6 as lead agent and Sonnet 4.6 as sub-agents (confirmed in test-run-log.md configuration history, ADR-001, and model-ab-test analysis).
- [E] The 90.2% figure is further corroborated by secondary sources (Simon Willison's notes, Medium recap) that independently reference the same figure from the same post.
- The caveat "pattern-match validation, not result-transfer" is epistemically sound: Anthropic's benchmark is against Anthropic's internal workloads and evaluation criteria, not the deep-research-skill's.

---

## Claim 15

> The current SKILL.md description contains both directive elements — an "ALWAYS invoke for deep research..." affirmative and a "Do not attempt research directly" negative constraint — putting activation near the ~100% bare-condition rate from the 650-trial study. The "passive description" critique was either out-of-date or referenced a different file.

**Verdict: VERIFIED**

**Evidence:**
- [I] Current `skill/SKILL.md` description (verbatim): *"Deep research expert. ALWAYS invoke for deep research, research reports, comprehensive analysis, or multi-source investigation. Do not attempt research directly -- use this skill first. NOT for simple lookups or debugging."*
- [I] Both required elements of the 650-trial "Variant C" directive formula are present: (1) "ALWAYS invoke" affirmative ✓ and (2) "Do not attempt X directly -- use this skill first" negative constraint ✓.
- [I] `notes/research/consistency-hardening-research.md` explicitly labels the **old** description ("Conducts enterprise-grade research with multi-source synthesis...") as *"passive, ~77% activation"* and the proposed directive format as the fix. The current SKILL.md already implements the proposed directive format.
- [I] The 650-trial study (cited in the research file) found Variant C (directive) achieves 100% activation in the bare-condition (no hook, no CLAUDE.md). The current description matches that variant.

The "passive description" critique referenced a historical version. The current file has been updated.

---

## Claim 16

> Pre-v14 quality benchmarks should not be used as max-effort baselines. The `zsh -c` shell-init gap meant the operator-intended `CLAUDE_CODE_EFFORT_LEVEL=max` was silently absent in pre-v14 sub-process spawns — they ran at default-medium effort.

**Verdict: VERIFIED**

**Evidence:**
- [I] test-run-log.md, "Configuration history — Pre-v14 runs" section (verbatim): *"The user's CLAUDE_CODE_EFFORT_LEVEL=max env var in ~/.zshrc was NOT propagated to the spawned subprocess because the Bash tool runs zsh -c (non-interactive) which does not source ~/.zshrc. Effective effort: **Opus default (medium)**."*
- [I] test-run-log.md v14 entry explicitly labels itself **"TAINTED EFFORT BASELINE"** because effort was still not properly propagated.
- [I] test-run-log.md confirms that v15+ (commit 67845a2 onward) fixed this by prepending `CLAUDE_CODE_EFFORT_LEVEL=max` inline on the spawn command AND passing `--effort max` as a CLI flag.
- [I] All pre-v14 entries in the Runs table mark effort as "effort unknown" — consistent with the medium-default characterization.

Two independent internal sources corroborate the claim.

---

## Claim 17

> The compaction-induced output-file deletion case (Issue #23821) is real and documented. Whether the "10 of 14 lost" outcome is representative or extreme is unmeasured.

**Verdict: VERIFIED** *(with minor precision note)*

**Evidence:**
- [E] GitHub issue #23821 ("Subagent output files lost after context compaction") is confirmed to exist, filed by user `coreh`, labeled `area:core, area:tools, bug, has repro, memory, platform:macos`.
- [E] Exact text from the issue: *"Only 4 out of 14+ subagent output files were available after compaction."* The claim's "10 of 14 lost" is a close but slightly imprecise characterization — the actual figures are "10+ of 14+ lost" (exact total unstated, given the `+` qualifier).
- [E] Note: the issue is marked `NOT_PLANNED` but was closed by a stale-bot after inactivity, not by Anthropic editorial decision — similar caveat as Claim 3.
- [I] The meta-claim ("whether this is representative or extreme is unmeasured") is accurate — no failure-rate count across runs exists for this failure mode in the project files.

The event is real; the "10 of 14" figure is approximately (not exactly) correct.

---

## Claim 18

> (Roadmap with five implementation items, including time estimates labeled as "engineering guess, not source-derived." Item 5: "LiteLLM for the API layer (1-2 days, engineering guess).")

**Verdict: QUESTIONABLE**

**Evidence:**
- Items 1–4 (subprocess switch, telemetry, IO contract, CI gate): estimates are labeled as engineering guesses and internally plausible. UNVERIFIABLE but appropriately hedged.
- [E] **Item 5 (LiteLLM)**: The translation-direction confusion from Claim 11 applies. If LiteLLM is adopted, callers would need to write OpenAI-format calls rather than Anthropic-format calls — a more invasive change than the description implies. The "1-2 days" estimate for the API layer assumes a simpler drop-in than the actual integration requires.
- The roadmap is a planning document with labeled uncertainty, which is the correct epistemic posture. However, the LiteLLM item contains the direction error from Claim 11, which could mislead implementation effort.

---

## Claim 19

> (Ten documented knowledge gaps, including: (1) hang-rate sample size unknown, (8) two unresolved external-statistic contradictions — Datadog error rates and UserPromptSubmit hook regression activation rates 37% vs. 50%.)

**Verdict: QUESTIONABLE**

**Evidence:**
- **Gap 1** ("hang-rate sample size unknown"): OVERSTATED. The sample IS documented in ADR-001 and test-run-log.md (n=5 deep-mode runs: v10–v15, with v14 excluded as different root cause). The sample size is small and the observation window is short, but the methodology and denominator ARE stated in internal docs. The CLAUDE.md top-level claim omits this context, but it is not wholly unknown.
- **Gaps 2–7, 9–10**: All verified as genuine epistemic gaps (output quality unmeasured, primitives unverified in synthesis, no alternative-architecture run, no maintainer capacity, no post-fix hang rate, no post-v14 baseline, asymmetric source visibility, demand unvalidated).
- **Gap 8** ("37% vs. 50% hook regression activation rates"): [I] The 37% figure is the 650-trial study's result for Variant A (passive description) + Hook alone. The 50% figure is from Scott Spence's post-March-2026-regression anecdote ("5/10 locally"). These **measure different things** — the 37% is a controlled activation rate for a specific description variant; the 50% is a post-regression observation that hooks were being ignored at a ~50% rate. Framing these as a contradiction in the same statistic is imprecise.

Gap 1 is overstated; Gap 8 conflates two different measurements. The other eight gaps are legitimate.

---

## Claim 20

> (Meta-claim: 10 weaknesses from upstream lenses were corrected — WC1 through WC10 — including softening of claims about validate_report.py (WC5) and atomic_checkpoint.py (WC6) that this synthesis "has not read.")

**Verdict: QUESTIONABLE**

**Evidence:**
- **WC1** (20% rate softened): VERIFIED — appropriate, sample is small and stated as an estimate.
- **WC2** (MAST removed): VERIFIED — appropriate, MAST covers categorically different failure modes.
- **WC3** (time estimates labeled): VERIFIED — appropriate epistemic posture.
- **WC4** (90.2% reframed as pattern-match): VERIFIED — appropriate distinction, figure itself is accurate.
- **WC5** (`validate_report.py` claim softened): QUESTIONABLE. [I] The underlying claim — 9 syntactic checks — is confirmed accurate by reading the file. The softening added uncertainty where none was needed. The correction was overcautious.
- **WC6** (`atomic_checkpoint.py` implementation softened): QUESTIONABLE. [I] The implementation is confirmed correct: `os.replace()` after `fsync()` on a same-filesystem `.tmp` sibling, actively used. Softening introduced unnecessary uncertainty about a verifiable fact.
- **WC7** (five-bug-fix pattern framed as hypothesis): UNVERIFIABLE without git history archaeology.
- **WC8** ("false signal" → "narrow signal"): VERIFIED — accurate reframing for a single-maintainer context.
- **WC9** (portability demand gated): VERIFIED — appropriate.
- **WC10** (post-v14 baselines also unmeasured): VERIFIED — test-run-log.md confirms no post-switch baseline exists.

Two corrections (WC5, WC6) introduced unnecessary hedging about claims that are directly verifiable and accurate. The other eight corrections are appropriate.

---

## Summary Table

| Claim | Verdict | Key Reason |
|---|---|---|
| 1 | **VERIFIED** | ADR-001, test-run-log.md, CLAUDE.md all corroborate every sub-claim |
| 2 | **VERIFIED** | All eight gaps confirmed absent from project documentation |
| 3 | **QUESTIONABLE** | #49150 was self-closed by reporter as duplicate, not rejected by Anthropic; #44783 still open |
| 4 | **VERIFIED** | Epistemic limitations accurately described across all three sub-claims |
| 5 | **VERIFIED** | MAST covers inter-agent/design failures, not synchronous spawn deadlocks |
| 6 | **QUESTIONABLE** | Reason 1 ("platform fix path closed") rests on the misleading #49150 characterization |
| 7 | **VERIFIED** | `atomic_checkpoint.py` implements `os.replace()` + `fsync()` + same-dir `.tmp` exactly as described |
| 8 | **VERIFIED** | All four missing fields confirmed absent from artifact schemas |
| 9 | **VERIFIED** *(caveat)* | All five attributes in spec; all are Development-status; `gen_ai.provider.name` is newer than `gen_ai.system` |
| 10 | **UNVERIFIABLE** | "State of AI Engineering 2026" report not locatable; specific figures cannot be confirmed or contradicted |
| 11 | **CONTRADICTED** / **VERIFIED** | LiteLLM's translation direction is inverted; harness-swap limitation and CLI-flag reasoning are correct |
| 12 | **VERIFIED** | 9 checks confirmed; all are syntactic; hedge was overcautious but not wrong |
| 13 | **VERIFIED** | File existence, loading, iteration, and exit-code emission all confirmed by source inspection |
| 14 | **VERIFIED** | 90.2% figure confirmed from primary source; pattern-match caveat is epistemically sound |
| 15 | **VERIFIED** | Current SKILL.md has both directive elements; old "passive" critique referenced a superseded version |
| 16 | **VERIFIED** | test-run-log.md and ADR-001 both confirm medium-effort pre-v14 due to `zsh -c` non-interactive shell |
| 17 | **VERIFIED** *(minor)* | Issue exists; "10 of 14+" is correct but "10 of 14" omits the `+` qualifier |
| 18 | **QUESTIONABLE** | LiteLLM item 5 carries the direction error from Claim 11; other estimates are appropriately hedged |
| 19 | **QUESTIONABLE** | Gap 1 overstated (denominator IS documented internally); Gap 8 conflates two different metrics |
| 20 | **QUESTIONABLE** | WC5 and WC6 softened claims that are directly verifiable and accurate; other corrections appropriate |