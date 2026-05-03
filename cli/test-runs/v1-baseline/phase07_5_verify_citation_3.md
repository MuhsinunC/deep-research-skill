Now I have enough information to write the full verification report. Let me compile all findings.

---

# Citation Verification Report

**Verifier:** citation_3 sub-lens  
**Date:** 2026-05-03  
**Sources examined:** ADR-001, test-run-log.md, atomic_checkpoint.py, validate_report.py, SKILL.md, GitHub issue #49150, GitHub issue #23821, OpenTelemetry GenAI spec, Anthropic engineering blog, Datadog State of AI Engineering 2026, MAST paper (arXiv 2503.13657), LiteLLM docs, 650-trial activation study (Ivan Seleznov / Medium)

---

## Claim 1

> *The pipeline's documented hang failure mode is the most visible reliability defect, with one fully-characterized empirical case (v15, UUID E72ABA74) and a hedged ~20% rate-of-occurrence estimate from the project's own CLAUDE.md. The fix path (claude -p subprocess + shell timeout) is documented in ADR-001, but documented is not the same as validated — the synthesis is unaware of any branch in which the post-fix rate has been measured.*

### Verdict: **VERIFIED**

**Evidence:**
- **ADR-001** (`notes/adr/001-task-tool-vs-claude-p-subagents.md`): confirms the hang failure mode, the recommendation to switch architectures, and the explicit note that "the switch should be implemented as a separate task (not this session) and validated with a new test run." Directly confirms "documented is not the same as validated."
- **test-run-log.md**: v15, UUID `E72ABA74`, 2026-04-07 — fully documented: "2 of 4 hung indefinitely... CPU dropped to 0% for 35+ minutes."
- **CLAUDE.md (project)**: "This failure mode hits roughly 20% of deep-mode runs" (hedged with "roughly").
- **ADR-001 derivation**: 1 hang in 5 deep-mode runs (v10, v11, v12, v13 succeeded; v15 hung; v14 killed for separate reason). Rate calculation stated explicitly.
- **GitHub issue #49150**: closed "not planned" — confirms platform-side fix unavailable. [Source](https://github.com/anthropics/claude-code/issues/49150)

**Caveat:** ADR-001 *does* state the sample size (5 runs), observation window (v10–v15), and counting methodology. Later claims suggesting these are unstated are slightly inaccurate with respect to ADR-001, though the CLAUDE.md line alone omits them.

---

## Claim 2

> *The gap table listing eight unmeasured/absent dimensions (output quality, cost per run, comparison to alternatives, maintainer capacity, security/safety, alternative architectures, failure modes beyond hangs, backward compatibility / migration cost).*

### Verdict: **QUESTIONABLE**

**Evidence (what can be cross-checked):**

| Gap row | Check | Finding |
|---|---|---|
| Output quality unmeasured | test-run-log.md has no spot-checks of citation correctness | CONFIRMED: log tracks status/word count but no quality rubric |
| Cost per run unmeasured | test-run-log.md token section | CONFIRMED: "rough estimates based on report sizes and pipeline complexity, not measured" |
| Comparison to alternatives | project files | CONFIRMED: no comparison file found in notes/ |
| Maintainer capacity | project files | CONFIRMED: no capacity estimate anywhere in project |
| Security/safety | project CLAUDE.md | CONFIRMED: not addressed in any project doc |
| Alternative architectures | project files | CONFIRMED: no single-pass alternative tested |
| Failure modes beyond hangs | test-run-log.md | CONFIRMED: only hangs and effort-config failures catalogued |
| Migration cost for IO contract | unverifiable | UNVERIFIABLE without knowing the proposed new contract |

**Why QUESTIONABLE rather than VERIFIED:** The gap table presents itself as empirical observation, but several cells rely on absence-of-evidence in the project repo. I have confirmed the absence for 7 of 8 rows; the 8th (migration cost) cannot be verified without reading the report's Section 2 proposal in full.

---

## Claim 3

> *The most visible reliability defect is sub-agent hangs at 0% CPU. Well-characterized in ADR-001 and confirmed by empirical case (v15, E72ABA74). External corroboration: GitHub issue #49150, where Anthropic closed the request for a Task timeout flag as "not planned."*

### Verdict: **VERIFIED**

**Evidence:**
- **ADR-001**: "CPU dropped to 0% for 35+ minutes with no file changes. Had to kill the parent to recover." ✓
- **test-run-log.md, v15**: "Sub-agents #3 and #4 hung indefinitely — process stayed at 0% CPU with no file changes for 35+ minutes." ✓
- **GitHub issue #49150** (fetched directly): Titled *"[BUG] Task() tool has no timeout — subagent hang leaves orchestrator stuck indefinitely on Windows."* Closed as **"not planned."** The issue requests `Task(..., timeout_ms=N)` — confirms the feature was explicitly rejected. [Source](https://github.com/anthropics/claude-code/issues/49150)

**Note on issue numbers:** ADR-001 references issues #17147 and #37521 as the "documented failure mode." Issue #49150 is a *separate later bug report* (the timeout feature request). Both corroborate the same underlying architecture problem; Claim 3 correctly cites #49150 for the "not planned" closure.

---

## Claim 4

> *What the synthesis does not know: denominator of the ~20% estimate, whether other failure modes rank higher, whether the proposed fix actually eliminates hangs.*

### Verdict: **QUESTIONABLE**

**Evidence:**
- The "~20%" figure appears in both CLAUDE.md ("roughly 20%") and ADR-001. CLAUDE.md presents the number without methodology. ADR-001 *does* provide the full derivation: v10–v13 = 4 successes, v15 = 1 hang = 1/5 = 20%, within the window 2026-04-01 to 2026-04-07.
- The claim that "sample size, observation window, and counting methodology are not stated" is accurate if the reader is looking only at CLAUDE.md in isolation, but **inaccurate** once ADR-001 is consulted — ADR-001 states all three explicitly.
- The other unknowns (whether other failure modes rank higher, whether the fix works) are **correctly identified as unknown** — there is no measured post-fix hang rate in any branch or file.

**Bottom line:** The claim slightly misrepresents epistemic status. The methodology IS stated in ADR-001; the limitation is really that n=5 is small and the single-failure observation has high uncertainty, not that methodology is absent.

---

## Claim 5

> *The MAST 41–87% comparison was removed because MAST measures broader multi-agent failure categories; without verification that "hang at 0% CPU" maps to MAST's taxonomy, the comparison was rhetorical framing.*

### Verdict: **QUESTIONABLE**

**Evidence:**
- **MAST paper** (arXiv 2503.13657, UC Berkeley Sky Computing Lab): confirmed to exist and report "41% to 86.7% failure rate" across 7 state-of-the-art MAS frameworks. [Source](https://arxiv.org/abs/2503.13657)
- MAST's taxonomy catalogues 14 unique failure *modes* grouped into 3 categories: (i) system design issues (41.77%), (ii) inter-agent misalignment (36.94%), (iii) task verification (21.30%).
- **Comparability issue is real:** MAST measures *task-level failure rates* (how often the end task fails across frameworks), not *orchestrator-hang rates* from a specific IPC mechanism. "Hang at 0% CPU due to Task tool IPC failure" is a platform-specific infrastructure failure that would surface in MAST as task failure but is categorically different from MAST's own taxonomy entries.
- However, MAST's FC1 ("system design issues") could plausibly subsume hang-from-IPC-failure. The non-comparability argument is **reasonable but not definitively proven** — it is a defensible editorial judgment, not a clear factual error.

---

## Claim 6

> *The subprocess switch is plausibly the right first step: (1) platform-side fix closed, (2) adding telemetry on a non-deterministically-failing pipeline contaminates measurement, (3) subprocess boundary is a portability move.*

### Verdict: **VERIFIED** (for Point 1); **UNVERIFIABLE** (for Points 2–3)

**Evidence:**
- **Point 1** (platform-side fix closed): GitHub #49150 closed "not planned" ✓ — independently confirmed.
- **Point 2** (telemetry on flaky pipeline contaminates measurement): This is an internal logical argument. No external source is needed; it is coherent and uncontested.
- **Point 3** (subprocess boundary as portability move): Internal design judgment. Consistent with ADR-001's comparison matrix but not externally verifiable.

Points 2 and 3 are sound arguments rather than empirical claims, and neither contradicts any external source.

---

## Claim 7

> *The original synthesis claimed the IO contract is low-friction to implement because os.replace() after fsync() on a same-filesystem .tmp sibling is "already correctly implemented," attributed to atomic_checkpoint.py.*

### Verdict: **VERIFIED**

**Evidence — from `skill/scripts/atomic_checkpoint.py` (read directly):**

```python
def _atomic_write_json(target: Path, data: dict) -> None:
    tmp = target.with_suffix(target.suffix + ".tmp")  # same-filesystem sibling ✓
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, sort_keys=True)
        f.flush()
        os.fsync(f.fileno())   # fsync before rename ✓
    os.replace(tmp, target)    # atomic replace ✓
```

The file exists, is used by the pipeline (referenced in SKILL.md's cross-cutting requirements), and implements exactly the described primitive. The docstring also explicitly notes the cross-filesystem caveat ("tmp file MUST be in the same directory as target").

---

## Claim 8

> *The pipeline produces _checkpoint.json, _subagent_progress.json, _DONE markers, .log/.err streams — diagnostic write-only logs. They do not record how long things took, how many tokens were consumed, what the sub-agent exit code was, or which trace correlates with which phase.*

### Verdict: **QUESTIONABLE**

**Evidence:**
- **Artifact list is correct**: All four artifact types are confirmed — `_checkpoint.json` (from atomic_checkpoint.py), `_subagent_progress.json` (same), `_DONE` (same), `.log`/`.err` streams (from SKILL.md spawn template: `2>/tmp/research-${UUID8}.err | tee -a /tmp/research-${UUID8}.log`). ✓
- **Token counts**: Not recorded in any checkpoint field. ✓
- **Exit codes**: Not recorded. ✓
- **Trace-to-phase mapping**: Not recorded. ✓
- **Duration/timing**: The claim says artifacts do not record "how long things took." This is **partially inaccurate**: `_checkpoint.json` records a `timestamp` field at every phase boundary via `_utc_now_iso()`. Wall-clock duration between phases is computable from sequential checkpoint timestamps. No *explicit* duration field exists, but timing information is present.

The claim overstates the telemetry gap for wall-clock time. The others (tokens, exit codes, traces) are correctly identified as absent.

---

## Claim 9

> *OpenTelemetry's GenAI Semantic Conventions: gen_ai.usage.input_tokens, gen_ai.usage.output_tokens, gen_ai.request.model, gen_ai.provider.name, gen_ai.operation.name, plus span timing.*

### Verdict: **VERIFIED**

**Evidence — from the official OTel GenAI Semantic Conventions spec (fetched directly from opentelemetry.io):**

| Attribute | Status in spec |
|---|---|
| `gen_ai.usage.input_tokens` | ✓ confirmed, defined as "number of tokens used in the GenAI input (prompt)" |
| `gen_ai.usage.output_tokens` | ✓ confirmed, defined as "number of tokens used in the GenAI response" |
| `gen_ai.request.model` | ✓ confirmed, defined as "the name of the GenAI model a request is being made to" |
| `gen_ai.provider.name` | ✓ confirmed, defined as "the Generative AI provider as identified by the client or server instrumentation" |
| `gen_ai.operation.name` | ✓ confirmed, defined as "the name of the operation being performed" |

All five attributes appear consistently across span type definitions (Inference, Embeddings, Retrievals). Span timing is standard in all OTel spans (start/end timestamps are part of the span contract). [Source](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/)

---

## Claim 10

> *The original synthesis cited Datadog's State of AI Engineering 2026 for context. Two figures were transcribed inconsistently (5% vs. 2% error rate; 60% vs. 33% rate-limit share). Until the primary source is re-checked, those figures should not be cited downstream.*

### Verdict: **VERIFIED**

**Evidence — fetched from official Datadog press release and primary source:**
- **Actual Datadog figures**: approximately **5% of AI model requests fail in production**; of those failures, **nearly 60% are caused by capacity limits**. [Source](https://www.datadoghq.com/about/latest-news/press-releases/datadog-state-of-ai-engineering-report-2026/)
- The "2% and 33%" figures cited by some upstream lenses are therefore incorrect. The inconsistency described in the claim is real.
- The qualitative point (rate limits are a top-N production error class) is confirmed: capacity constraints are identified as "the primary bottleneck when organizations attempt to scale AI systems reliably."
- The claim's recommendation ("those figures should not be cited downstream") was appropriate caution given the contradiction. The correct numbers are now resolved: **5% error rate, ~60% from capacity limits**.

---

## Claim 11

> *LiteLLM translates Anthropic-format API calls into other provider formats. What it cannot do is swap the harness — CLI flags --effort max and --dangerously-skip-permissions are not API parameters that LiteLLM can intercept. A claude -p spawn is still a Claude Code spawn.*

### Verdict: **VERIFIED**

**Evidence:**
- **LiteLLM's documented scope**: works as an API proxy/gateway — it intercepts HTTP requests at the API endpoint level and translates them between provider schemas. [Source](https://docs.litellm.ai/docs/tutorials/claude_non_anthropic_models)
- **`--effort max`**: a CLI flag on the `claude` binary, confirmed from SKILL.md spawn template (`claude -p ... --effort max`). Not an API-level parameter.
- **`--dangerously-skip-permissions`**: a Claude Code CLI flag, confirmed from multiple GitHub issues and official Claude Code docs. Not an API parameter.
- **Logical consistency**: LiteLLM rewrites the ANTHROPIC_BASE_URL endpoint so the Claude Code client talks to LiteLLM instead of Anthropic. But the *invocation command* (`claude -p`) and its flags are processed by the Claude Code binary before any API call is made. LiteLLM has no mechanism to inject or modify CLI flag semantics.

No source contradicts this framing.

---

## Claim 12

> *The original synthesis claimed all 9 checks in validate_report.py are syntactic, not semantic. This synthesis has not read validate_report.py and cannot verify either the count or the classification.*

### Verdict: **VERIFIED** (the count and classification are correct; the epistemic hedge was warranted at time of writing but is not needed given ground-truth access)

**Evidence — from `skill/scripts/validate_report.py` (read directly):**

The `checks` list contains exactly **9 items**:
1. Executive Summary (regex + word count)
2. Required Sections (regex presence check)
3. Citations (regex format + count)
4. Bibliography (regex truncation patterns + numbering continuity + cross-reference matching)
5. Placeholder Text (string matching)
6. Content Truncation (regex)
7. Word Count (integer count)
8. Source Count (count bibliography entries)
9. Broken Links (filesystem existence check)

All 9 use exclusively: regex pattern matching, string membership tests, integer counting, and filesystem `Path.exists()` checks. **None perform semantic reasoning** (no embedding comparison, no fuzzy claim-extraction, no LLM-as-judge). The original synthesis's claim that "all 9 are syntactic" is **correct**. The refined synthesis's hedge ("this synthesis has not read validate_report.py") was accurate as a statement of its own epistemic state, but the underlying claim it was hedging was accurate.

---

## Claim 13

> *The wiring claim — validate_report.py exists, loads reports, iterates checks, emits pass/fail — survives independently of the syntactic-vs-semantic classification.*

### Verdict: **VERIFIED**

**Evidence — from `skill/scripts/validate_report.py` (read directly):**
- **Exists**: confirmed ✓
- **Loads reports**: `self.content = self._read_report()` in `__init__`, using `open(self.report_path, 'r')` ✓
- **Iterates checks**: `for check_name, check_func in checks: passed = check_func()` ✓
- **Emits pass/fail**: prints `"✅ PASS"` / `"❌ FAIL"` per check; exits `sys.exit(0 if passed else 1)` ✓

All four wiring assertions are confirmed from code.

---

## Claim 14

> *The hybrid Opus-orchestrator + Sonnet-sub-agent design matches the architectural pattern of Anthropic's production multi-agent research system, which reported a 90.2% improvement over single-agent Opus on internal benchmarks. This is pattern-match validation, not result-transfer.*

### Verdict: **VERIFIED**

**Evidence:**
- **Anthropic's engineering blog** ("How we built our multi-agent research system"): *"We found that a multi-agent system with Claude Opus 4 as the lead agent and Claude Sonnet 4 subagents outperformed single-agent Claude Opus 4 by **90.2%** on our internal research eval."* [Source](https://www.anthropic.com/engineering/multi-agent-research-system)
- The 90.2% figure is correctly attributed to Anthropic's internal benchmark on their use cases ✓
- The caveat ("pattern-match validation, not result-transfer") is explicitly stated and appropriate ✓
- The architectural match (Opus lead + Sonnet sub-agents) is confirmed — both the skill and Anthropic's production system use this configuration ✓

Multiple independent secondary sources also cite this 90.2% figure, all tracing back to the same Anthropic post. [Source 2](https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent)

---

## Claim 15

> *The SKILL.md description contains both directive elements — "ALWAYS invoke for deep research" + "Do not attempt research directly — use this skill first" — putting activation near ~100%, not ~77% passive-description rate. The "passive description" critique was either out-of-date or referenced a different file.*

### Verdict: **QUESTIONABLE**

**Evidence:**
- **SKILL.md description** (read directly, line 3–4): *"Deep research expert. ALWAYS invoke for deep research, research reports, comprehensive analysis, or multi-source investigation. Do not attempt research directly -- use this skill first. NOT for simple lookups or debugging."* — Both directive elements are present ✓
- **650-trial study** (Ivan Seleznov, confirmed published on Medium): exists and has rigorous methodology (automated CLI, ground-truth verification, Fisher's exact test). [Source](https://medium.com/@ivan.seleznov1/why-claude-code-skills-dont-activate-and-how-to-fix-it-86f679409af1)
- **Study findings confirmed**: passive/default descriptions ("Use when…") → ~77% activation; directive descriptions ("ALWAYS invoke… Do not attempt directly") → ~100% activation ✓

**Why QUESTIONABLE:** The phrase "near the ~100% **bare-condition** rate" is terminologically inverted. In the study, the *bare-condition* is the ~77% baseline (no CLAUDE.md, no hook). The ~100% rate is the *directive-description* condition. The synthesis correctly identifies SKILL.md as directive and correctly notes ~100% applies, but mislabels the 100% rate as "bare-condition." This is a terminological error in the claim itself, not an error in the underlying judgment.

---

## Claim 16

> *Pre-v14 quality benchmarks should not be used as max-effort baselines. The zsh -c shell-init gap meant operator-intended CLAUDE_CODE_EFFORT_LEVEL=max was silently absent in pre-v14 subprocess spawns — they ran at default-medium effort.*

### Verdict: **VERIFIED**

**Evidence — from `notes/test-run-log.md`, Configuration History section:**

> "Pre-v14 runs (commits before 4461179): All runs used the user's default model (Opus 4.6) with whatever default effort was active at the time. The `--effort` flag was NOT explicitly set on the spawn command. The user's `CLAUDE_CODE_EFFORT_LEVEL=max` env var in `~/.zshrc` was NOT propagated to the spawned subprocess because the Bash tool runs `zsh -c` (non-interactive) which does not source `~/.zshrc`. **Effective effort: Opus default (medium).**"

Also confirmed by ADR-001: "If env var inheritance is 100% reliable: zero quality benefit" — the ADR acknowledged this was unverified at time of writing. The test-run-log explicitly labels v14 as "TAINTED EFFORT BASELINE" for the same reason. All pre-v14 runs are labeled "effort unknown" in the log, and v15 is labeled "FIRST TRUE MAX-EFFORT RUN." ✓

---

## Claim 17

> *The compaction-induced output-file deletion case (Issue #23821) is real and documented. Whether the "10 of 14 lost" outcome is representative or extreme is unmeasured.*

### Verdict: **VERIFIED**

**Evidence:**
- **GitHub issue #23821** exists, titled *"Subagent output files lost after context compaction"*, opened 2026-02-06, **closed as "not planned"**. [Source](https://github.com/anthropics/claude-code/issues/23821)
- Issue description: "Only 4 out of 14+ subagent output files were available after compaction." → 14 − 4 = **10 files lost** ✓
- Issue explains the mechanism: compaction clears task output directories even though they are on-disk artifacts, not in-context data — unexpected interaction between context management and filesystem cleanup.
- The claim's caveat ("whether representative or extreme is unmeasured — the rate has not been counted in this synthesis") is an accurate epistemic statement. The issue is a single reporter's experience; no population-level rate is documented.

---

## Claim 18

> *Roadmap with 5 items and engineering time estimates (hours to days; days; 1–2 weeks; days; 1–2 days / 3–6 weeks), all labeled as "engineering guesses."*

### Verdict: **UNVERIFIABLE**

Engineering time estimates are inherently project- and person-specific. No authoritative external source can confirm or deny "LiteLLM integration takes 1–2 days" or "harness portability takes 3–6 weeks" for this specific codebase and maintainer. The estimates are labeled "engineering guess, not source-derived" in the synthesis — that self-labeling is appropriate and the only verifiable aspect of this claim. No sources contradict or confirm the specific durations.

---

## Claim 19

> *Limitations list with 10 numbered gaps, covering hang-rate sample size, unverified primitives, unmeasured output quality, unconsidered architectures, unscoped maintainer capacity, unvalidated subprocess fix, unmeasured baselines, two stat contradictions, asymmetric source visibility, and unvalidated portability demand.*

### Verdict: **QUESTIONABLE**

**Checked per sub-item:**

| Point | Finding | Status |
|---|---|---|
| 1. Hang-rate sample size unknown | ADR-001 *does* state n=5 and methodology. CLAUDE.md hedges. Limitation overstated. | QUESTIONABLE |
| 2. Load-bearing primitives unverified | Both validate_report.py and atomic_checkpoint.py exist and are as described. Hedge was warranted; files are verified. | VERIFIED |
| 3. Output quality unmeasured | No quality rubric or spot-check in test-run-log.md | VERIFIED |
| 4. Alternative architectures unconsidered | No alternative-architecture test found in project | VERIFIED |
| 5. Maintainer capacity unscoped | No capacity estimate anywhere in project docs | VERIFIED |
| 6. Subprocess-switch effectiveness unvalidated | ADR-001: "validated with a new test run" pending ✓ | VERIFIED |
| 7. Pre-v14 AND post-v14 baselines unmeasured | Pre-v14: confirmed medium-effort. Post-v14: v15 killed mid-pipeline, no completed run | VERIFIED |
| 8. Datadog contradiction (5% vs. 2%; 60% vs. 33%) | Actual figures are 5% and 60%. Contradiction is real. | VERIFIED |
| 9. Asymmetric source visibility | Requires reading all 4 upstream lenses — cannot verify | UNVERIFIABLE |
| 10. Provider portability demand unvalidated | Cannot verify what users have or haven't requested | UNVERIFIABLE |

---

## Claim 20

> *Change log documenting corrections WC1–WC10 applied to the original synthesis.*

### Verdict: **QUESTIONABLE**

**Selected sub-claim checks:**

| Correction | Claimed action | Verified? |
|---|---|---|
| WC1 (20% rate softened) | Reframed as hedged estimate | ADR-001 *does* state methodology, so hedging is slightly over-cautious, but not wrong |
| WC2 (MAST removed) | Removed 41–87% MAST comparison | MAST exists and is about broader failure rates — removal is editorially defensible |
| WC3 (time estimates labeled) | All estimates labeled "engineering guess" | Appropriate; unverifiable durations are now disclosed |
| WC4 (90.2% reframed) | Described as "pattern-match validation, not result-transfer" | **CORRECT** — the 90.2% number is real but from Anthropic's benchmarks, not this skill's |
| WC5 (9 checks softened) | Synthesis says it "has not read validate_report.py" | The 9-check count and syntactic classification were **actually correct** in the original. The softening was over-cautious. |
| WC6 (atomic_checkpoint softened) | Says "cannot independently verify" | The implementation is **verifiably correct** (os.replace + fsync confirmed). Softening was over-cautious. |
| WC7 (5 bug fixes reactive — hypothesis) | Framed as hypothesis pending git archaeology | APPROPRIATE — requires git log to verify |
| WC10 (post-v14 baselines also unmeasured) | Made explicit | VERIFIED — v15 was killed; no complete max-effort benchmark run exists |

**Summary:** The corrections WC4, WC7, WC10, and WC3 are well-calibrated. WC5 and WC6 are over-cautious — the original claims were actually correct. WC1 is accurate in spirit (the rate is genuinely uncertain) but misidentifies where the methodology detail is missing (it's in ADR-001, not missing from the project).

---

## Summary Table

| Claim | Verdict | Key reason |
|---|---|---|
| 1 | **VERIFIED** | ADR-001, test-run-log, CLAUDE.md, GitHub #49150 all confirm |
| 2 | **QUESTIONABLE** | 7/8 gap rows confirmed; 1 unverifiable without reading full Section 2 |
| 3 | **VERIFIED** | ADR-001, v15 log entry, GitHub #49150 all confirmed independently |
| 4 | **QUESTIONABLE** | Rate IS hedged, but ADR-001 does state methodology; claim slightly overstates the gap |
| 5 | **QUESTIONABLE** | MAST paper and rates confirmed; non-comparability argument defensible but not proven |
| 6 | **VERIFIED** (#49150 closed) / UNVERIFIABLE (Points 2–3) | Platform fix closure confirmed; logical arguments not externally verifiable |
| 7 | **VERIFIED** | atomic_checkpoint.py exists and implements os.replace() + fsync() exactly as described |
| 8 | **QUESTIONABLE** | Artifact list correct; but timestamps ARE recorded (timing is not fully absent) |
| 9 | **VERIFIED** | All 5 OTel attribute names confirmed from official opentelemetry.io spec |
| 10 | **VERIFIED** | Datadog primary source confirms 5% / ~60%; contradiction with other lenses is real |
| 11 | **VERIFIED** | LiteLLM scope (API proxy) confirmed; CLI flags confirmed as non-API parameters |
| 12 | **VERIFIED** | validate_report.py has exactly 9 syntactic checks (confirmed by reading the file) |
| 13 | **VERIFIED** | All four wiring claims confirmed from code |
| 14 | **VERIFIED** | 90.2% figure confirmed from Anthropic engineering blog; caveat is appropriate |
| 15 | **QUESTIONABLE** | Directive elements confirmed; ~100% rate for directive descriptions confirmed; but "bare-condition rate" is terminological error |
| 16 | **VERIFIED** | test-run-log.md Configuration History and ADR-001 confirm zsh non-interactive gap |
| 17 | **VERIFIED** | GitHub #23821 confirmed; "10 of 14 lost" confirmed from issue text |
| 18 | **UNVERIFIABLE** | Engineering time estimates are project-specific; no authoritative source can confirm or deny |
| 19 | **QUESTIONABLE** | 8/10 sub-items verifiable (most confirmed); 2 require unavailable information |
| 20 | **QUESTIONABLE** | Most corrections well-calibrated; WC5 and WC6 are over-cautious (original claims were correct) |

---

**Sources cited:**

- [GitHub issue #49150 — Task() tool has no timeout](https://github.com/anthropics/claude-code/issues/49150)
- [GitHub issue #23821 — Subagent output files lost after context compaction](https://github.com/anthropics/claude-code/issues/23821)
- [OpenTelemetry GenAI Semantic Conventions (spans)](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/)
- [OpenTelemetry GenAI Overview](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- [Datadog State of AI Engineering 2026 (press release)](https://www.datadoghq.com/about/latest-news/press-releases/datadog-state-of-ai-engineering-report-2026/)
- [Anthropic engineering blog — multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [MAST paper — arXiv 2503.13657](https://arxiv.org/abs/2503.13657)
- [650-trial skill activation study (Ivan Seleznov)](https://medium.com/@ivan.seleznov1/why-claude-code-skills-dont-activate-and-how-to-fix-it-86f679409af1)
- [LiteLLM Claude Code docs](https://docs.litellm.ai/docs/tutorials/claude_non_anthropic_models)
- Local project files: `notes/adr/001-task-tool-vs-claude-p-subagents.md`, `notes/test-run-log.md`, `skill/scripts/atomic_checkpoint.py`, `skill/scripts/validate_report.py`, `skill/SKILL.md`