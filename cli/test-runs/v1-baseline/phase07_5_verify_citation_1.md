I now have sufficient data to render verdicts on all 20 claims. Let me compile the complete report:

---

# Citation Verification Report

## Methodology

Local files consulted: `notes/adr/001-task-tool-vs-claude-p-subagents.md`, `notes/test-run-log.md`, `notes/test-runs/v15-effort-fix-test/_checkpoint.json`, `skill/scripts/validate_report.py`, `skill/scripts/atomic_checkpoint.py`, `skill/SKILL.md`, `notes/research/consistency-hardening-research.md`.

External sources consulted: GitHub issues #49150, #44783, #37521, #23821 (anthropics/claude-code); OpenTelemetry GenAI Semantic Conventions spec; Anthropic engineering blog on multi-agent research; Datadog *State of AI Engineering 2026*; LiteLLM documentation; MAST benchmark paper (NeurIPS 2025).

---

## Claim 1

> "The pipeline's documented hang failure mode is the most visible reliability defect, with one fully-characterized empirical case (v15, UUID E72ABA74) and a hedged ~20% rate-of-occurrence estimate from the project's own CLAUDE.md. The fix path (`claude -p` subprocess + shell `timeout`) is documented in ADR-001, but documented is not the same as validated."

### **VERIFIED**

**Evidence:**

- **v15 UUID E72ABA74**: Confirmed in both `notes/test-run-log.md` (row entry) and `notes/test-runs/v15-effort-fix-test/_checkpoint.json` (`"uuid": "E72ABA74"`). The log records that sub-agents 3 and 4 hung indefinitely at Phase 3 RETRIEVE, CPU dropped to 0%, and the run was killed.

- **~20% rate from CLAUDE.md**: Confirmed. ADR-001 independently derives the same figure: "v10, v11, v12, v13: successful (4/5) … v15: killed for sub-agent hang (1/5) → Estimated hang rate: ~20% per deep mode run." The CLAUDE.md text reproduces this estimate verbatim.

- **ADR-001 documents the fix path**: Confirmed. ADR-001's 2026-04-07 UPDATE section explicitly states "Updated recommendation: PROCEED with architecture switch to `claude -p` subprocess sub-agents" with numbered reasoning. The `timeout` mechanism is cited as item 3.

- **"Documented is not validated"**: Confirmed. ADR-001 closes with: "The switch should be implemented as a separate task … and validated with a new test run. Until then, the Task tool architecture … remains in place." The git log shows no subsequent commit that implements or measures the switch.

---

## Claim 2

> *Table of eight measurement gaps* (output quality, cost, alternative comparisons, maintainer capacity, security, alternative architectures, non-hang failure modes, backward compatibility).

### **VERIFIED**

**Evidence (gap by gap):**

| Gap | Evidence |
|---|---|
| **Output quality unmeasured** | `notes/test-run-log.md` has no "spot-check" or accuracy column; "Claims verified" column exists but only tracks VERIFY-phase verdicts, not external-accuracy audits of those verdicts. |
| **Cost per run unmeasured** | The log's "Total token spend" section is self-described as "rough estimates based on report sizes … not measured. Update with actual usage data when available." No per-run cost column exists. |
| **No alternative comparison** | No GPT Researcher, Perplexity, or Gemini comparison appears in any `notes/` file examined. |
| **Maintainer capacity unscoped** | CLAUDE.md describes this as a "personal-fork side project." No capacity estimate appears in any artifact. |
| **Security absent** | No security discussion found in ADR-001, SKILL.md, or methodology files for prompt injection or web-content poisoning. |
| **Alternative architectures** | ADR-001 evaluates Task vs. `claude -p`, but a single-phase 1M-context approach is not evaluated anywhere in the notes. |
| **Only hangs systematically tracked** | `notes/test-run-log.md` has dedicated hang documentation. Silent quality failures, rate-limit timeouts, and empty sections are not enumerated. |
| **Backward-compat cost** | Breaking IO contracts for existing `notes/test-runs/` artifacts is a real migration cost not quantified anywhere. |

---

## Claim 3

> "The mechanism is well-characterized in ADR-001 and confirmed by one fully-documented empirical case (v15 run UUID E72ABA74). External corroboration: GitHub issue #49150, where Anthropic closed the request for a `Task` timeout flag as 'not planned'."

### **CONTRADICTED**

**What is correct:** The v15 empirical case (E72ABA74) and ADR-001 documentation are both verified (see Claim 1). GitHub issue #49150 is real, describes the identical hang failure (Task tool has no timeout, orchestrator blocked 30+ minutes on Windows), and directly references related issues #28126 and #37521.

**What is wrong:** The characterization of the closure is factually incorrect in two distinct ways:

1. **Anthropic did not close it.** Issue #49150 was closed by its *own author* (tylyp), who wrote: "Consolidating on #44783 which is the same failure mode on Linux … Closing this as a duplicate of #44783." The bot had flagged it as a possible duplicate; the author then closed it manually.

2. **It was not labeled or marked "not planned."** The issue labels are `area:agents`, `bug`, `platform:windows`. There is no `not planned`, `wontfix`, or equivalent label anywhere in the issue history. The canonical issue, #44783 ("Parent session deadlocks when subagent tool execution hangs"), is currently **OPEN** with `area:agents`, `bug`, `has repro`, `platform:linux` labels — meaning Anthropic has neither fixed it nor declined to fix it as of the date of verification.

The phrase "Anthropic closed the request … as 'not planned'" is not supported by the evidence.

---

## Claim 4

> "The denominator is unknown (20% from CLAUDE.md is hedged), other failure modes are unranked, the proposed fix's effectiveness is unvalidated, and ADR-001 documents the decision rather than a measured post-fix rate."

### **VERIFIED**

**Evidence:**

- **Denominator unknown**: ADR-001 acknowledges the 20% derives from 5 eligible runs (v10–v15, minus v14 which failed for a different reason). 5 runs is an acknowledged small sample.

- **Other failure modes unranked**: `notes/test-run-log.md` does not record rates for silent-empty-section, fabricated citation, or rate-limit-timeout failure modes. Only the hang (v15) and effort misconfiguration (v14) are explicitly categorized.

- **Fix effectiveness unvalidated**: ADR-001 (final paragraph): "The switch should be implemented … and validated with a new test run." The git log shows no subsequent commit implementing the subprocess switch. The claim is correct.

- **ADR-001 documents the decision, not measurements**: The ADR is structured as a decision record — it concludes with "PROCEED with architecture switch" but contains no post-switch empirical data, because the switch hasn't been made.

---

## Claim 5

> "The MAST 41–87% comparison was removed. MAST measures broader multi-agent failure categories; without verification that 'hang at 0% CPU' maps to MAST's failure taxonomy, the comparison was rhetorical framing rather than evidence."

### **VERIFIED**

**Evidence:**

- **MAST is real**: Confirmed by ArXiv 2503.13657 (NeurIPS 2025 Datasets and Benchmarks track). The failure rate range across 7 SOTA open-source multi-agent systems is reported as 41% to 86.7% — matching "41–87%."

- **MAST taxonomy is broader**: MAST defines 14 failure modes clustered into 3 categories: (i) system design issues, (ii) inter-agent misalignment, and (iii) task verification. "Hang at 0% CPU" due to IPC channel failure is not one of these named failure modes; it would need to be mapped into the taxonomy (likely "system design issues → inter-process communication failure") with justification that the synthesis did not provide.

- **Removal is justified**: The editorial decision to remove the comparison is epistemically sound. Citing MAST's general failure rate as context for a specific IPC-hang failure without confirming the taxonomic mapping would be rhetorical (it frames the problem as large without establishing that the specific failure belongs in the cited figure).

---

## Claim 6

> "The platform-side fix path is closed [citing issue #49150], so the only available lever is harness-level."

### **QUESTIONABLE**

**Evidence:**

The premise "platform-side fix path is closed" is not supported by the evidence. As established under Claim 3, issue #49150 was closed as a duplicate (by the author) and the canonical issue #44783 is **currently OPEN**. Anthropic has not closed the bug, has not labeled it "not planned," and has not stated they will not add a timeout mechanism.

The *logical argument* — that harness-level timeout is the only lever currently *available* in production code — is still valid: no timeout API exists today regardless of whether one will eventually be added. But "closed" implies a rejection that has not occurred. The claim should say "no platform-level fix exists today and no timeline is committed" rather than "the fix path is closed."

The three numbered sub-arguments (item 1 depends on the incorrect "closed" premise; items 2 and 3 stand independently) are otherwise sound.

---

## Claim 7

> "The original synthesis claimed the contract is low-friction to implement because the underlying atomic-write primitive is 'already correctly implemented' — `os.replace()` after `fsync()` on a same-filesystem `.tmp` sibling, attributed to `atomic_checkpoint.py`."

### **VERIFIED**

**Evidence:** `skill/scripts/atomic_checkpoint.py` exists and the implementation precisely matches the attributed description:

```python
tmp = target.with_suffix(target.suffix + ".tmp")   # .tmp sibling in same directory
with open(tmp, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, sort_keys=True)
    f.flush()
    os.fsync(f.fileno())                            # fsync before rename
os.replace(tmp, target)                             # atomic rename, not os.rename
```

The inline code comment explicitly documents the cross-filesystem precondition: "tmp file MUST be in the same directory as target (cross-filesystem rename via /tmp/ would defeat atomicity on Linux)." The choice of `os.replace` over `os.rename` (which fails on Windows if target exists) is also correctly noted in the comment. The synthesis's attribution of this specific pattern is accurate.

---

## Claim 8

> "The pipeline artifacts (_checkpoint.json, _subagent_progress.json, _DONE markers, .log/.err streams) are diagnostic write-only logs that record that things happened but not duration, token counts, sub-agent exit codes, or trace correlation. Diagnosing a failed run requires manual file archaeology."

### **VERIFIED**

**Evidence:**

From `atomic_checkpoint.py`:
- `_checkpoint.json` fields: `phase_completed`, `next_phase`, `timestamp`, plus optional `extra` dict. No token-count, wall-clock-duration, or exit-code fields exist in the schema.
- `_subagent_progress.json` fields: `phase`, `expected_subagents`, `completed_subagents`, `last_updated`. No duration or exit code.
- `_DONE` fields: `completed_at`, `phase`, `status`, `uuid`. No aggregated metrics.

The claim's description of what is *absent* (duration, token counts, exit codes, trace IDs) is confirmed by code inspection. The "manual file archaeology" characterization is accurate — diagnosing a v15-style partial failure requires `ls -lt` (to see last writes), `cat` of output files (to gauge partial completion), and checkpoint reading (to determine last completed phase).

---

## Claim 9

> "OpenTelemetry's GenAI Semantic Conventions: `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.request.model`, `gen_ai.provider.name`, `gen_ai.operation.name`, plus span timing. Adopting these now means future migration to any vendor is a configuration change rather than re-instrumentation."

### **VERIFIED**

**Evidence:** Confirmed against the live OpenTelemetry GenAI Semantic Conventions specification (opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/):

| Attribute | Status |
|---|---|
| `gen_ai.usage.input_tokens` | ✅ Defined — "The number of tokens used in the GenAI input (prompt)" |
| `gen_ai.usage.output_tokens` | ✅ Defined — "The number of tokens used in the GenAI response (completion)" |
| `gen_ai.request.model` | ✅ Defined — "The name of the GenAI model a request is being made to" |
| `gen_ai.provider.name` | ✅ Defined — "The Generative AI provider as identified by the client or server instrumentation" |
| `gen_ai.operation.name` | ✅ Defined — "The name of the operation being performed" |

Span timing is a core OTel primitive (all spans carry `startTime`/`endTime`). The named vendors (Datadog, Honeycomb, Phoenix, Langfuse) are all active OTel receivers. The "configuration change rather than re-instrumentation" claim is standard OTel value proposition and is accurate.

*Note:* As of the specification's current status page, most GenAI attributes remain in **experimental** stability. This does not affect the attribute existence but means names could change before stabilization — a caveat the claim does not mention.

---

## Claim 10

> "The original synthesis cited Datadog's *State of AI Engineering 2026* for production-error-rate context. Two figures were transcribed inconsistently across upstream lenses (5% vs. 2% error rate; 60% vs. 33% rate-limit share). Until the primary source is re-checked, those figures should not be cited downstream."

### **VERIFIED**

**Evidence:** Confirmed against the primary Datadog source and press release (datadoghq.com/about/latest-news/press-releases/datadog-state-of-ai-engineering-report-2026/):

The report itself contains both data points representing *different time periods within the same report:*

- **February 2026 snapshot**: "5% of all LLM call spans reported an error and 60% of those errors were caused by exceeded rate limits."
- **March 2026 snapshot**: "2% of all LLM spans in our dataset returned an error and rate limit errors accounted for almost a third of them."

These are genuine values from a single report covering different months; they are not contradictions within the same measurement period. The synthesis is correct that the numbers differ substantially and cannot be cited as a single "the Datadog figure" without specifying the time window. The qualitative finding — rate limits are a dominant production error class — is supported by both snapshots.

---

## Claim 11

> "LiteLLM solves the 'swap the model' problem cleanly … What it cannot do is swap the harness. The Claude Code CLI flags `--effort max` and `--dangerously-skip-permissions` are not API parameters — they are agent-runtime flags that LiteLLM has no way to intercept. A `claude -p` spawn is still a Claude Code spawn."

### **VERIFIED**

**Evidence:**

- LiteLLM operates as an API-level proxy (translating Anthropic-format API calls to other providers). Confirmed by official LiteLLM documentation and community guides for running Claude Code with LiteLLM.

- `--effort max` and `--dangerously-skip-permissions` are Claude Code CLI flags, not Anthropic API parameters. Confirmed by Claude Code changelog and documentation. When Claude Code is invoked as `claude -p "..." --effort max`, these flags configure the *agent runtime* (effort scheduler, permission bypass layer), not the underlying model inference call that LiteLLM would proxy.

- LiteLLM intercepts `ANTHROPIC_BASE_URL`-routed API calls. It does not intercept or modify the `claude` binary's own CLI argument processing. A `claude -p` subprocess will still use Claude Code's agent runtime regardless of how the inference endpoint is routed.

The claim correctly identifies the layer distinction (API vs. harness). The framing is accurate and well-supported.

---

## Claim 12

> "This synthesis has not read `validate_report.py` and cannot verify either the count or the syntactic-vs-semantic classification. If even one of the checks performs semantic work … the gap-size argument shrinks."

### **QUESTIONABLE**

**Evidence:** I *have* read `validate_report.py`. The file is 355 lines and defines a `ReportValidator` class with exactly **9 named checks** (matching the "9 checks" claim):

1. Executive Summary — regex presence + word count
2. Required Sections — regex header search
3. Citations — regex count + pattern
4. Bibliography — regex + truncation-phrase matching + number continuity
5. Placeholder Text — string matching
6. Content Truncation — regex pattern matching
7. Word Count — `len(content.split())`
8. Source Count — regex count
9. Broken References — `Path.exists()` on matched internal links

**All nine checks are syntactic** (structural/pattern/count analysis; no LLM invocation, no fuzzy citation cross-referencing, no claim-extraction). The synthesis's *uncertainty about the classification* was epistemically appropriate, but the uncertainty itself was *unnecessary* — direct code reading resolves it conclusively.

The claim is correct in its epistemic framing (the synthesis should have read the file before asserting); however, it has the downstream effect of introducing caution about a gap that does not exist. The "if even one check is semantic" caveat is vacuous given the implementation.

---

## Claim 13

> "The wiring claim — `validate_report.py` exists, loads reports, iterates checks, emits pass/fail — survives independently of the syntactic-vs-semantic classification."

### **VERIFIED**

**Evidence:** Confirmed by direct code reading:

- **Exists**: `skill/scripts/validate_report.py` is present in the repository.
- **Loads reports**: `_read_report()` method opens the path with `open(self.report_path, 'r', encoding='utf-8')`.
- **Iterates checks**: `validate()` method loops over a `checks` list of `(check_name, check_func)` tuples and calls each.
- **Emits pass/fail**: Prints `"✅ PASS"` / `"❌ FAIL"` per check and returns `len(self.errors) == 0` as the overall result; exits with code 0 or 1 respectively.

This factual claim is robustly correct and is appropriately separated from the more uncertain syntactic-vs-semantic classification.

---

## Claim 14

> "The hybrid Opus-orchestrator + Sonnet-sub-agent design matches the architectural *pattern* used by Anthropic's production multi-agent research system, which reported a 90.2% improvement over single-agent Opus on internal benchmarks. This is pattern-match validation, not result-transfer."

### **VERIFIED**

**Evidence:** Confirmed from Anthropic's engineering blog ("How we built our multi-agent research system"):

- **90.2% improvement**: Exact figure confirmed — "a multi-agent system with Claude Opus 4 as the lead agent and Claude Sonnet 4 subagents outperformed single-agent Claude Opus 4 by 90.2% on our internal research eval."
- **Benchmark**: BrowseComp evaluation (tests browsing agents' ability to locate hard-to-find information).
- **Model architecture**: Claude Opus 4 lead + Claude Sonnet 4 subagents — the same lead/sub pattern used by the deep-research skill (Opus 4.6 lead + Sonnet 4.6 sub-agents).

The "pattern-match validation, not result-transfer" epistemic framing is sound and accurate: the deep-research skill has not been evaluated on BrowseComp. The 90.2% figure is from Anthropic's internal evaluation at Anthropic's scale. Claiming it transfers to this skill would require running the skill's own benchmark.

---

## Claim 15

> "The live SKILL.md contains both directive elements (an ALWAYS invoke affirmative and a Do not attempt directly negative). This puts activation near the ~100% bare-condition rate, not the ~77% passive-description rate. The 'passive description' critique was either out-of-date or referenced a different file."

### **QUESTIONABLE**

**What is correct:**

- **SKILL.md currently has directive language**: Confirmed. The live description reads: *"Deep research expert. ALWAYS invoke for deep research, research reports, comprehensive analysis, or multi-source investigation. Do not attempt research directly -- use this skill first. NOT for simple lookups or debugging."* Both components are present.

- **The "passive description" critique was out-of-date**: Confirmed. `notes/research/consistency-hardening-research.md` (dated 2026-03-25) quotes the *then-current* description as passive and proposes a directive replacement. The current SKILL.md shows the directive version was adopted.

- **Directive descriptions achieve ~100% in the C1 (bare) condition**: Confirmed from the 650-trial study table in that same file.

**What is imprecise:**

The "~77% passive-description rate" is the **overall average across all four experimental conditions** for the passive variant: (87.5 + 81.5 + 37.0 + 100.0) / 4 ≈ 76.5%. When comparing against the "bare-condition rate" of directive (100%), the appropriate passive comparator is the **C1 bare-condition rate: 87.5%**, not the condition-averaged 77%. The synthesis mixes condition-specific and condition-averaged numbers in the same comparison, which overstates the gap (100% vs 77%) relative to the strictly comparable bare-condition pair (100% vs 87.5%). The core conclusion — directive outperforms passive — stands; the specific numerical framing is imprecise.

---

## Claim 16

> "Pre-v14 quality benchmarks should not be used as max-effort baselines. The `zsh -c` shell-init gap meant the operator-intended `CLAUDE_CODE_EFFORT_LEVEL=max` was silently absent in pre-v14 sub-process spawns — they ran at default-medium effort. All historical 'success' data prior to v14 reflects medium-effort behavior, not max."

### **VERIFIED**

**Evidence:** `notes/test-run-log.md` "Configuration history" section (verbatim):

> "All runs used the user's default model (Opus 4.6) with whatever default effort was active at the time. The `--effort` flag was NOT explicitly set on the spawn command. The user's `CLAUDE_CODE_EFFORT_LEVEL=max` env var in `~/.zshrc` was NOT propagated to the spawned subprocess because the Bash tool runs `zsh -c` (non-interactive) which does not source `~/.zshrc`. Effective effort: **Opus default (medium)**."

The v14 row in the Runs table is labeled "**TAINTED EFFORT BASELINE**" with the notation "Opus 4.6 (DEFAULT MEDIUM — env var not propagated)." Runs v10–v13 are all in the pre-fix window. The effort propagation fix is documented in the v15+ configuration section (commit 67845a2).

---

## Claim 17

> "The compaction-induced output-file deletion case (Issue #23821) is real and documented. Whether the '10 of 14 lost' outcome is representative or extreme is unmeasured."

### **QUESTIONABLE**

**What is confirmed:**

- **Issue #23821 exists and is real**: Confirmed — title "Subagent output files lost after context compaction," authored by user `coreh`, with a detailed reproduction case.
- **"4 out of 14+"**: The issue text states "Only 4 out of 14+ subagent output files were available after compaction." The arithmetic matches "10 of 14 lost."
- **The representativeness is unmeasured**: Correct — the synthesis does not claim to know the base rate, and no other data in the codebase measures it.

**The qualification:**

Issue #23821 is marked **CLOSED** with a **`stale`** label (indicating the bot auto-closed it after prolonged inactivity). "Stale" closures do not confirm the bug was fixed; they indicate no activity for the bot's window. However, the issue may have been addressed in an upstream Claude Code runtime update between filing and now. The synthesis presents it as a live failure mode without noting the closed/stale status, which is an omission. Treating a stale-closed issue as a confirmed current failure mode is an overstatement.

---

## Claim 18

> *Roadmap with five items, all time estimates labeled as "engineering guess, not source-derived."*

### **VERIFIED**

**Evidence:**

- **Subprocess switch**: The approach is correctly described and matches ADR-001's recommendation.
- **Backward-compatible telemetry**: Adding new fields to `_checkpoint.json` is indeed non-breaking (existing consumers ignore unknown keys in JSON). The OTel attribute names are confirmed (see Claim 9).
- **Typed IO contract labeled as breaking**: The claim correctly notes existing `notes/test-runs/` artifacts will not match a new schema — an honest accounting of migration cost.
- **CI gate**: The characterization ("days for wiring if CI exists") is appropriately hedged; `skill/scripts/run_tests.sh` exists but there is no `.github/workflows/` directory visible in the project.
- **Provider abstraction gated on demand**: Correctly marked conditional; fulfills WC9 (see Claim 20).
- **All time estimates labeled "engineering guess"**: Confirmed — this fulfills the WC3 correction documented in Claim 20. No estimate is presented as authoritative.

---

## Claim 19

> *Ten research gaps (G1–G10), including the "37% vs. 50% UserPromptSubmit hook regression activation rates" cited as an unresolved contradiction alongside the Datadog figures.*

### **QUESTIONABLE**

**What is verified:** G1, G3–G7, G9–G10 are all genuine gaps confirmed by codebase examination. G2 (validate_report.py syntactic-vs-semantic) and G4 (output quality) are confirmed gaps. The Datadog contradiction in G8 is **confirmed** (see Claim 10).

**The specific qualification — "37% vs. 50% regression rates":**

From `notes/research/consistency-hardening-research.md`, the numbers come from **different experimental conditions**, not from the same measurement:

- **37%** = Passive description (Variant A) + Hook only (C3 condition), 650-trial study.
- **50%** = "Optimized description only" tier, from the Five-Tier Success Hierarchy table — a different baseline without hooks.

These are not contradictory measurements of the same thing; they describe different experimental setups. Calling them "unresolved contradictions" mischaracterizes the data. The 37% value reflects a specific hook-induced degradation on a passive description; the 50% is a separate baseline for a different description quality level.

The Datadog portion of G8 is a genuine unresolved contradiction; the UserPromptSubmit portion is a comparison of unlike quantities presented as a contradiction.

---

## Claim 20

> *Summary of ten weakness corrections (WC1–WC10) applied to the refined synthesis.*

### **VERIFIED**

**Evidence (correction by correction):**

| Correction | Verification |
|---|---|
| **WC1** (20% softened to "hedged estimate") | Confirmed. ADR-001 and test-run-log.md show this is genuinely a maintainer estimate from a 5-run sample. |
| **WC2** (MAST comparison removed) | Confirmed. MAST is real (NeurIPS 2025) but measures 14 categorized failure modes; mapping "IPC hang" to the taxonomy was never done. Removal is justified. |
| **WC3** (Time estimates labeled as engineering guesses) | Confirmed in Claim 18. All estimates carry explicit uncertainty labels. |
| **WC4** (90.2% reframed as pattern-match, not result-transfer) | Confirmed in Claim 14. Anthropic's figure is from BrowseComp on their system, not this skill. |
| **WC5** (validate_report.py count/classification softened) | Appropriate epistemic humility. The underlying claim ("all 9 syntactic") is actually correct (per my reading), but the synthesis's uncertainty label is an accurate reflection of not having directly verified. |
| **WC6** (atomic_checkpoint.py correctness softened) | The synthesis adds a verification gap. The underlying implementation IS correct (per my reading), but the synthesis appropriately treats unread code as uncertain. |
| **WC7** ("five bug fixes" framed as hypothesis, not demonstrated pattern) | Cannot fully verify without the upstream synthesis document — the git log shows "Fix 7 operational reliability bugs" in commit 40a952d, which relates to this framing, but the "five" figure and "reactive accumulation" pattern remain to be confirmed against the full synthesis artifact. |
| **WC8** ("false signal" → "narrow signal") | Plausible reframe; validate_report.py confirms the signal is indeed narrow (structural only). |
| **WC9** (provider portability gated on demand) | Confirmed in Claim 18 — Section 4 is conditional. |
| **WC10** (both pre-v14 and post-v14 baselines noted as unmeasured) | Confirmed in Claim 16. Pre-v14 = confirmed medium effort. Post-v14 = no benchmark set exists. |

WC7 carries residual uncertainty because the "five bug fixes" narrative requires reading the upstream synthesis document to fully evaluate.

---

## Summary Table

| Claim | Verdict | Key Reason |
|---|---|---|
| 1 | **VERIFIED** | v15 UUID, 20% rate, ADR-001 fix path, and "not yet validated" all confirmed from codebase |
| 2 | **VERIFIED** | All eight gaps are genuinely unmeasured in the existing artifacts |
| 3 | **CONTRADICTED** | #49150 was closed as a *duplicate by its author*, not by Anthropic as "not planned"; canonical #44783 is still **OPEN** |
| 4 | **VERIFIED** | All four stated unknowns are confirmed unknowns from codebase evidence |
| 5 | **VERIFIED** | MAST is real (NeurIPS 2025, 41–86.7%); removal justified — IPC-hang ≠ MAST taxonomy without mapping |
| 6 | **QUESTIONABLE** | "Fix path is closed" is unsupported; #44783 is open; logical argument otherwise valid |
| 7 | **VERIFIED** | `atomic_checkpoint.py` exists with exactly the described pattern (fsync + os.replace, same-dir .tmp) |
| 8 | **VERIFIED** | Checkpoint JSON lacks token counts, wall-clock, exit codes, trace IDs — confirmed by code |
| 9 | **VERIFIED** | All five OTel GenAI attribute names confirmed in official spec; attributes are experimental-status (minor caveat) |
| 10 | **VERIFIED** | Datadog report contains both data points (Feb: 5%/60%; Mar: 2%/~33%); reconciliation guidance sound |
| 11 | **VERIFIED** | LiteLLM operates at API layer; `--effort max`/`--dangerously-skip-permissions` are CLI-harness flags, not API params |
| 12 | **QUESTIONABLE** | Synthesis's epistemic hedging is appropriate, but the "if even one check is semantic" caveat is vacuous — all 9 are syntactic |
| 13 | **VERIFIED** | File exists, loads, iterates 9 checks, emits pass/fail — confirmed by direct code reading |
| 14 | **VERIFIED** | 90.2% BrowseComp improvement confirmed from Anthropic engineering blog; pattern-match caveat is epistemically sound |
| 15 | **QUESTIONABLE** | SKILL.md has directive language (confirmed), but "~77%" conflates condition-averaged (77%) with bare-condition (87.5%) passive rate |
| 16 | **VERIFIED** | test-run-log.md Configuration history explicitly confirms all pre-v14 runs used Opus default (medium) effort |
| 17 | **QUESTIONABLE** | Issue #23821 real and "4 of 14+" confirmed; but issue is closed/stale — current runtime behavior may differ |
| 18 | **VERIFIED** | All roadmap items technically coherent; all time estimates correctly labeled as "engineering guess" |
| 19 | **QUESTIONABLE** | G1–G7, G9–G10 valid; but "37% vs. 50% UserPromptSubmit contradiction" in G8 conflates unlike experimental conditions |
| 20 | **VERIFIED** | WC1–WC10 corrections are substantiated by evidence (WC7 carries minor residual uncertainty) |

---

**Sources:**
- [GitHub issue #49150 (Task timeout — closed as duplicate)](https://github.com/anthropics/claude-code/issues/49150)
- [GitHub issue #44783 (Parent session deadlocks — OPEN)](https://github.com/anthropics/claude-code/issues/44783)
- [GitHub issue #37521 (Agent/subagent freezes indefinitely — OPEN)](https://github.com/anthropics/claude-code/issues/37521)
- [GitHub issue #23821 (Subagent output files lost after compaction — CLOSED/stale)](https://github.com/anthropics/claude-code/issues/23821)
- [OpenTelemetry GenAI Semantic Conventions — spans](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/)
- [Anthropic: How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Datadog: State of AI Engineering 2026 press release](https://www.datadoghq.com/about/latest-news/press-releases/datadog-state-of-ai-engineering-report-2026/)
- [MAST: Why Do Multi-Agent LLM Systems Fail? (ArXiv 2503.13657)](https://arxiv.org/abs/2503.13657)
- [650-Trial Skill Activation Study (Medium)](https://medium.com/@ivan.seleznov1/why-claude-code-skills-dont-activate-and-how-to-fix-it-86f679409af1)
- [LiteLLM: Use Claude Code with Non-Anthropic Models](https://docs.litellm.ai/docs/tutorials/claude_non_anthropic_models)