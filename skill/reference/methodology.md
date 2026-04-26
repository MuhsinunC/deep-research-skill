# Deep Research Methodology: 10-Phase Pipeline

## Overview

This document contains the detailed methodology for conducting deep research. The 10 phases (including sub-phases 4.5 and 7.5) represent a comprehensive approach to gathering, verifying, and synthesizing information from multiple sources.

## Inline Verification Principle (Inspired by MiroThinker)

**Verification is NOT just a post-hoc phase.** The highest-accuracy research framework (MiroThinker, 88.2% BrowseComp) builds verification INTO every reasoning step, not just at the end. Apply this principle throughout:

- **During RETRIEVE:** After each search result arrives, immediately assess: does this source look credible? Does the claim match what other sources say? Flag contradictions in real-time, don't wait for TRIANGULATE.
- **During SYNTHESIZE:** As you build arguments, check: is this conclusion supported by the evidence I screened, or am I extrapolating beyond what the sources actually say?
- **During REFINE:** When fixing critique findings, verify the fix doesn't introduce new inconsistencies (the "fake fix" problem — MiroThinker's ChainChecker catches these).

This does NOT replace the dedicated TRIANGULATE and VERIFY phases. It supplements them with continuous vigilance.

## High-Confidence Hallucination Vigilance

LLMs produce their most confident-sounding output on claims that are most likely to be hallucinated — a calibration inversion where surface fluency masks factual unreliability. Specific, detailed, authoritative-sounding claims (exact numbers, precise dates, named entities, causal mechanisms) are higher hallucination risk than vague or hedged claims. The model can fluently reproduce the *pattern* of confidence without having verified the *content*.

**Counter-intuitive rule: Be MORE skeptical of claims you're most confident about.**

**High-risk claim categories (ranked by severity-if-wrong, in descending order):**
1. **Causal claims** ("X causes Y because Z") — verify the causal mechanism, not just the correlation
2. **Precise quantitative claims** ("costs $Y/month," "achieves 94.3% accuracy") — require source verification even if they feel "obviously correct"
3. **Named-entity relationships** ("Company X acquired Company Y in 2024") — verify the specific relationship, not just that both entities exist
4. **Temporal claims** ("introduced in March 2025") — exact dates are frequently hallucinated
5. **Comparative claims** ("X is faster than Y") — verify the comparison was measured, not assumed

**Application across phases:**
- **RETRIEVE:** Don't skip searching for claims you think you already know. Training data may be outdated or wrong.
- **TRIANGULATE:** Give extra verification attention to claims where confidence is highest — these are the claims most likely to have subtle errors that pass unnoticed.
- **SYNTHESIZE:** When screening claims, flag any that feel "obviously true" for additional scrutiny. Obvious-feeling claims are where hallucination hides.
- **VERIFY:** Prioritize high-confidence claims for tool-grounded verification — they are the most dangerous if wrong because readers won't question them either.
- **PACKAGE:** When writing report prose, verify that confidence language ("research shows," "clearly," "demonstrates") is warranted by the evidence status from VERIFY. Do not upgrade hedged or single-source findings to definitive claims during report writing.

This principle augments the Inline Verification Principle above by targeting verification effort where it is most needed — on claims where confidence is highest and verification instinct is weakest.

## Replanning on Contradiction

When evidence at ANY phase contradicts the current research direction or a key assumption from Phase 1 (SCOPE):
1. **Stop and acknowledge** the contradiction explicitly
2. **Assess severity:** Does this invalidate a minor detail, or does it undermine the research question's framing?
3. **If minor:** Note the contradiction, continue with adjusted claim
4. **If major:** Return to OUTLINE REFINEMENT (Phase 4.5) to restructure. Do NOT continue building on a foundation that the evidence has undermined.

This selective rollback approach prevents the sunk-cost fallacy of continuing research in a direction the evidence no longer supports.

## Budget Awareness and Emergency Synthesis

The pipeline runs in a `claude -p` session with **no `--max-turns` limit** (removed deliberately — see rationale below). Claude Code terminates naturally when the pipeline completes; any turn cap would cut research off mid-pipeline and leave claims unverified, retries incomplete, or Phase 8 PACKAGE unfinished. The risk of infinite loops is negligible in this well-defined 10-phase pipeline, so the cost of a max-turns limit (cutting off real research) exceeds its benefit (preventing hypothetical loops).

Budget awareness in this skill is NOT about token/turn caps — the spawned subprocess is allowed to run as long as it needs. Instead, "budget awareness" here refers to graceful degradation when the pipeline detects it is approaching fundamental resource limits (context compaction threshold, sub-agent retry exhaustion, VERIFY loop-back budget exhausted). Context compaction, sub-agent spawning, retry loops, and Step 6 can consume turns unpredictably, so budget awareness uses observable proxy signals rather than a turn counter.

**Positive-path guard (MUST NOT trigger):** If the pipeline has NOT experienced ANY of the following, emergency synthesis MUST NOT be triggered — the pipeline is operating within normal parameters:
- Context compaction has NOT occurred
- No sub-agent retries were needed (all Phase 3 sub-agents succeeded on first attempt)
- No browser fallbacks were invoked for blocked sites
- VERIFY loop-back cycles have NOT been exhausted

This guard prevents false budget exhaustion from degrading report quality on normal runs.

**Pre-SYNTHESIZE budget signal:** After RETRIEVE completes, record in the checkpoint whether the phase required retries or browser fallbacks for more than half of its sub-agents. If yes, proceed with heightened budget awareness for remaining phases: reduce CRITIQUE's gap-filling sub-agent count to 1 (not 1-2), cap VERIFY loop-backs at 1 (not 2), and skip Step 5 (temporal supersession) and Step 6 (retry). This is a dial-down signal, not an emergency — the pipeline continues all phases but at reduced depth.

**Emergency synthesis trigger:** From SYNTHESIZE onward, check these concrete proxy conditions at each phase's Think2 MONITOR step:

- **Level 1 — Skip optional VERIFY steps:** Trigger if context compaction has occurred 3+ times in this session, OR if the VERIFY loop-back budget is exhausted and PACKAGE has not started. Execute VERIFY Steps 1-3 (core claim verification) but skip Step 5 (temporal supersession) and Step 6 (retry). This implicitly bypasses Step 6, which requires VERIFY Step 3 results to trigger. Document skipped steps in Limitations.
- **Level 2 — Skip VERIFY entirely:** Trigger if SYNTHESIZE has just completed AND both (a) context compaction has occurred 3+ times AND (b) RETRIEVE required retries for >50% of sub-agents. Proceed directly to PACKAGE with a prominent "Unverified — emergency synthesis" note. This bypasses Step 6 entirely — document in Limitations that neither VERIFY nor Step 6 was executed. Run `validate_report.py` (structural check) but skip `verify_citations.py` (which depends on VERIFY output).
- **Level 3 — Checkpoint and exit:** If PACKAGE itself cannot be completed (the session is about to terminate), save a detailed checkpoint and any partial files. The checkpoint protocol ensures partial work is recoverable in a subsequent session.

**Minimum viable report:** The minimum useful output requires both SYNTHESIZE (connected analysis, not raw source notes) and PACKAGE (formatted report). If SYNTHESIZE is not yet complete when budget pressure is detected, complete SYNTHESIZE first, then proceed directly to PACKAGE. Never skip SYNTHESIZE to jump to PACKAGE — a PACKAGE of raw TRIANGULATE output is worse than a checkpoint.

**Priority order when budget is constrained:** SYNTHESIZE + PACKAGE (minimum viable) > VERIFY Steps 1-3 (core verification) > CRITIQUE/REFINE > VERIFY Steps 4-6 (optional verification). Never sacrifice having a complete report for more verification passes.

**This is a safety net, not a normal operating mode.** With no turn cap, emergency synthesis should rarely trigger — it's only intended for worst-case scenarios (excessive context compaction, multiple sub-agent retries, unexpected API slowness). Its purpose is to guarantee output even when fundamental resource limits are hit.

---

## Metacognitive Cycling Protocol (Think2)

Academic research on LLM self-correction shows that unstructured "think step-by-step" prompting underperforms structured metacognitive cycling. Studies on 8B-parameter models (Llama-3, Qwen-3) found ~3x improvement in successful self-correction rate when reasoning is structured into Planning, Monitoring, and Evaluation layers rather than freeform chain-of-thought. The Think2 approach structures each phase's reasoning into three layers:

**Before executing a phase (PLAN):**
- What is the specific goal of this phase?
- What inputs do I have, and what outputs must I produce?
- What are the most likely failure modes for this phase?

**During execution (MONITOR):**
- Am I making progress toward the phase goal, or am I stuck/drifting?
- Am I following the methodology, or have I deviated?
- Have I encountered any of the predicted failure modes?

**After completing a phase (EVALUATE):**
- Did I achieve the phase goal? What evidence confirms this?
- What was the quality of my output? (Be specific — count claims, sources, gaps)
- What should the next phase be especially careful about, given what I found?

**Application:** Each phase already has an Extended Thinking Task that provides phase-specific reasoning prompts. Wrap those within this Plan→Monitor→Evaluate cycle: the Extended Thinking Task becomes the PLAN step. After executing the phase's activities, run MONITOR (mid-phase self-check) and EVALUATE (post-phase quality check) as brief internal assessments before saving the checkpoint.

This is NOT additional time — it's structuring the thinking that already happens into a more effective pattern. The EVALUATE step's output feeds directly into the next phase's PLAN step, creating a continuous improvement loop across the pipeline.

**Note on MONITOR:** Unlike PLAN and EVALUATE (which have explicit checkpoints), MONITOR operates continuously during execution. Check against phase goals and predicted failure modes whenever you complete a sub-step. The most valuable MONITOR points are: during RETRIEVE when collecting parallel results (are sub-agents producing output?), during TRIANGULATE when resolving contradictions (am I anchoring on the first source?), during SYNTHESIZE when building arguments (am I extrapolating beyond the evidence?), during REFINE when applying fixes (is this fix introducing new inconsistencies?), during VERIFY when processing sub-agent results (is confirmation bias affecting my interpretation?), during VERIFY Step 5 when running supersession searches (am I spending the budget on the most important claims?), and from SYNTHESIZE onward when assessing budget (see Budget Awareness and Emergency Synthesis — should optional steps be skipped to guarantee output?).

---

## Progress Reporting

**At the start of each phase, output a brief progress line to the user.** Long research sessions (5-45 minutes) with no visible progress feel broken. Format:

```
[Phase NAME] Brief description of what's happening...
[Phase NAME] Key metric update (e.g., "15/20 sources gathered, avg credibility 72/100")...
```

Use the phase name (e.g., `SCOPE`, `RETRIEVE`, `TRIANGULATE`), not a numeric index. This avoids ambiguity around half-phases (4.5, 7.5) and mode-dependent phase counts.

This applies to every phase. It is not optional.

---

## Phase 0: RESUME DETECTION (NEW — runs FIRST, before Task Registration)

**Objective:** Detect whether OUTPUT_DIR contains prior-dispatch artifacts and decide whether to resume or start fresh. This phase must run FIRST — before Task Registration creates a fresh `research-tasks.json` entry, before Phase 1 starts. If the worker is being respawned to resume a killed dispatch, Phase 0 takes that branch; otherwise it falls through to Task Registration.

**Progress:** `[Phase RESUME-DETECTION] Checking for prior artifacts...`

**Inputs available at Phase 0 startup:** `$OUTPUT_DIR` is provided in the brief (the spawn template substitutes the absolute path before passing the brief to `claude -p`). `$UUID8` is also in the brief AND in the `CLAUDE_CODE_DEEP_RESEARCH_UUID8` env var. The worker MUST use these as concrete values, not as placeholders. If the brief literally contains `[OUTPUT_DIR]`, that's a bug in the spawn template — abort with an error.

**Activities:**

1. **Check for pause flag.** If `_STOP_REQUESTED` or `_STOP_NOW` is present in `OUTPUT_DIR`, refuse to start. Print: `Found _STOP_REQUESTED in OUTPUT_DIR. Remove it before resuming, or this dispatch will pause again immediately at the first phase boundary.` and **end the worker turn — do not invoke any further tools** (the bash subshell `exit 2` exits the subshell only; the worker LLM must also stop processing).

2. **Check for `_DONE` sentinel.** If present, the prior dispatch is COMPLETE. Print: `Dispatch <UUID8> already complete; report at <OUTPUT_DIR>/research_report_*.md` and **end the worker turn — do not re-run any phases or invoke any further tools**.

3. **Cleanup leftover `*.tmp` files** from a kill mid-write:
   ```bash
   python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \
       cleanup-tmp --output-dir "$OUTPUT_DIR"
   ```

4. **Check for `_checkpoint.json`.** If absent AND no other phase artifacts exist (`OUTPUT_DIR` is empty or doesn't exist), proceed to Task Registration normally.

5. **If `_checkpoint.json` is present OR phase artifacts exist on disk** without a checkpoint:
   - Read `_checkpoint.json` (may be missing; that's OK).
   - Run **Disk-Truth Reconciliation:** scan `OUTPUT_DIR` for canonical phase artifact filenames (see `reference/resume.md` "Standardized Output Filenames"). Also accept legacy aliases. For any phase whose artifact exists on disk, treat that phase as complete.
   - If disk-truth disagrees with the checkpoint's `phase_completed`, **trust the disk** and update the checkpoint atomically.
   - Identify the first incomplete phase. Proceed from there.
   - For Phase 3 / 6 / 7.5 fan-outs, also read `_subagent_progress.json` (if present) and skip sub-agents whose output files already exist on disk. Disk-truth wins over `_subagent_progress.json` content.
   - Do NOT create a new `research-tasks.json` entry on resume; instead, update the existing entry's `last_resumed_at` field with the current ISO timestamp. If no entry exists for this UUID, create one with `status: "in_progress"` and a `notes: "resumed without prior registration"` field.
   - Skip Task Registration's mkdir + brand-new-entry logic.

5b. **Completion-but-missing-sentinel reconciliation (mandatory):** If `_checkpoint.json` shows `status: "complete"` AND `phase_completed: "PACKAGE"` AND a `research_report_*.md` file exists on disk AND `_DONE` is absent, the prior dispatch reached the end of Phase 8 but was killed between Activity 9.8 (final checkpoint update) and Activity 10 (`_DONE` write). Write the missing `_DONE` and exit:

   ```bash
   python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py done \
       --output-dir "$OUTPUT_DIR" --uuid8 "$UUID8"
   ```

   Print: `Dispatch <UUID8> reconciled — _DONE was missing but report is complete.` and **end the worker turn — do NOT re-run any phases**. This protects against the narrow window between checkpoint and `_DONE` writes during normal Phase 8 completion.

**Note on liveness:** The bash spawn template writes `_starting.txt` to OUTPUT_DIR BEFORE invoking `claude -p`. If `_starting.txt` does not exist within 60 seconds of dispatch, the bash wrapper itself failed (filesystem error, wrong path to claude binary, permission issue) — investigate the spawn command. If `_starting.txt` exists but no other artifacts appear within 5 minutes, the worker started but is hung — investigate `research-${UUID8}.log` and `research-${UUID8}.err` and consider killing.

**Output:** Either (a) exit because `_DONE` exists / pause flag prevents resume, or (b) a reconciled checkpoint plus a clear "first incomplete phase" decision. Save the reconciled checkpoint atomically before proceeding to the next phase.

For full mechanics (Path A vs Path B, sub-agent progress tracking, Granularity 3 deferral rationale), see `reference/resume.md`.

---

## Task Registration and Output Directory

**Before starting Phase 1** (and only if Phase 0 RESUME DETECTION did NOT take the resume branch), generate a unique task ID and create the output directory:

```bash
UUID8=$(uuidgen | cut -c1-8)
DATE=$(date +%Y%m%d)
OUTPUT_DIR=~/Documents/Research/[Topic_Slug]_${DATE}_${UUID8}
mkdir -p "$OUTPUT_DIR"
```

**Register the task** in `~/.claude/research-tasks.json` (create if doesn't exist). This is **mandatory** — combined with Phase 0's liveness signal, it gives operators a single-file view of all in-flight dispatches:

```json
{
  "tasks": [
    {
      "uuid": "a7f3b2c1",
      "topic": "Cat Genomes Research",
      "status": "in_progress",
      "output_dir": "~/Documents/Research/Cat_Genomes_20260323_a7f3b2c1/",
      "start_time": "2026-03-23T16:00:00Z",
      "mode": "standard"
    }
  ]
}
```

**Phase 8 update:** Workers MUST update the entry to `status: "complete"` with `complete_time: <ISO timestamp>` as part of Phase 8 PACKAGE (immediately before writing `_DONE` — see Phase 8 ordering rule).

**Resume case:** If Phase 0 detected a resume scenario, do NOT overwrite the existing entry; update its `last_resumed_at` field instead.

---

## Checkpoint/Resume Protocol

**At the end of each phase, save a checkpoint file** to the research output directory as `_checkpoint.json`. Use the atomic helper (NOT raw file write — `$BASH_SOURCE` is empty in worker Bash calls, so reference the deployed canonical path):

```bash
python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \
    --output-dir "$OUTPUT_DIR" \
    --phase-completed "TRIANGULATE" \
    --next-phase "OUTLINE_REFINEMENT" \
    --extra '{"sources_gathered": 18, "mode": "standard", "topic": "..."}'
```

The helper writes `_checkpoint.json.tmp` first, fsync's it, then `os.replace()`s it to the final name. Result: even if killed mid-write, the prior checkpoint is preserved and the half-written `.tmp` is cleaned up by Phase 0 RESUME DETECTION on next invocation.

Use the phase name string (e.g., `"SCOPE"`, `"RETRIEVE"`, `"OUTLINE_REFINEMENT"`, `"VERIFY"`) for both `phase_completed` and `next_phase`. This avoids ambiguity with half-phases (4.5, 7.5).

**Update the checkpoint at every artifact write within a phase, not just at phase boundaries.** When Phase 3 RETRIEVE writes `phase03_retrieve_academic.md`, update `_checkpoint.json` immediately to reflect `phase_in_progress: RETRIEVE` (via the `--extra` flag with `{"phase_in_progress": "RETRIEVE", "completed_subagents": ["academic"]}`). This eliminates the drift window where artifacts exist on disk but the checkpoint claims they don't.

**Sub-agent progress tracking:** For phases that fan out to multiple sub-agents (Phase 3 RETRIEVE, Phase 6 CRITIQUE gap-fill, Phase 7.5 VERIFY), also write `$OUTPUT_DIR/_subagent_progress.json` after each Task batch returns:

```bash
python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \
    subagent-progress \
    --output-dir "$OUTPUT_DIR" \
    --phase RETRIEVE \
    --expected academic,practitioner,critical,historical \
    --completed academic,practitioner
```

**Task tool batched-spawn caveat:** Phase 3 / 6 / 7.5 sub-agents are spawned via the **Task tool** as in-process synchronous calls. The lead receives a single batch return, NOT per-sub-agent completion events. So `_subagent_progress.json` updates happen after each Task batch returns. If killed mid-batch (one or more sub-agents wrote files but the batch hadn't returned), Phase 0 RESUME DETECTION falls back to file-presence-on-disk via the Disk-Truth Reconciliation rule. See `reference/resume.md` for the full algorithm.

**On invocation:** Phase 0 (above) handles resume detection automatically. The pre-Phase-0 spawn must point at the SAME OUTPUT_DIR for resume to work — see SKILL.md `## Resume After Interruption`.

---

## Pause-Flag Check (mandatory at every phase entry)

Before starting any phase's activities, the worker MUST check for pause flags:

```bash
if [ -f "$OUTPUT_DIR/_STOP_REQUESTED" ] || [ -f "$OUTPUT_DIR/_STOP_NOW" ]; then
    flag_type="stop_soft"
    [ -f "$OUTPUT_DIR/_STOP_NOW" ] && flag_type="stop_now"
    python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \
        --output-dir "$OUTPUT_DIR" \
        --phase-completed "$LAST_COMPLETED_PHASE" \
        --next-phase "$THIS_PHASE" \
        --extra "{\"status\": \"paused\", \"paused_reason\": \"flag-${flag_type}\"}"
    echo "Paused at phase $THIS_PHASE due to flag $flag_type" \
        > "$OUTPUT_DIR/_PAUSED_AT_PHASE_${THIS_PHASE}.txt"
    exit 0
fi
```

For Phase 3 RETRIEVE / 6 CRITIQUE / 7.5 VERIFY (fan-out phases), additionally check for `_STOP_NOW` between Task batches (`_STOP_REQUESTED` matches at phase boundaries only; `_STOP_NOW` matches at every safe boundary).

The flag policy (Policy A) is that the worker does NOT delete the flag — the operator must `rm` it before resuming. See SKILL.md `## Graceful Pause` for operator workflows.

---

## Phase 1: SCOPE - Research Framing

**Objective:** Define research boundaries and success criteria

**Progress:** `[Phase SCOPE] Framing research question and defining boundaries...`

**Activities:**
1. Decompose the question into core components
2. Identify stakeholder perspectives
3. Define scope boundaries (what's in/out)
4. Establish **concrete topic-specific acceptance criteria** — not generic quality gates, but "what evidence would make the answer 'sufficient' for THIS topic?" These must reference specific entities, numbers, time bounds, or comparisons from the question itself.

   **Topic-specific examples** (note how each names something from the question):
   - "Report must cover both [specific sub-topic A] and [specific sub-topic B] identified as central in SCOPE"
   - "Comparison table of [product X] vs [product Y] on metrics [A, B, C]"
   - "The answer to [specific research question] must cite [a specific regulatory body / specific journal / vendor documentation]"
   - "Resolution of any direct contradictions between source A and source B identified in TRIANGULATE"
   - "At least one source must be dated within the last [domain half-life] days for the [time-sensitive sub-topic]"

   **NOT acceptance criteria** (these are global quality gates and live elsewhere):
   - "At least 3 peer-reviewed sources for every claim" (global FFS threshold)
   - "All claims have primary sources" (Source Preference Heuristics)
   - "No single-source claims on critical findings" (already enforced in Phase 4 TRIANGULATE)

   **Derivation procedure (when domain knowledge is unavailable):** A headless agent on an unfamiliar topic should derive criteria mechanically. For each sub-question identified in Activity 1, ask: "What specific evidence (a specific source type, a specific entity comparison, a specific time-bounded claim) would make THIS sub-question definitively answered?" Convert each answer into one acceptance criterion. **Smell test:** if a criterion could be reused verbatim on an unrelated research topic, it's a global quality gate, not a topic-specific criterion — reword or drop it.

   Acceptance criteria are checked at Phase 7.5 VERIFY (Step 4 Completeness Check) and Phase 8 PACKAGE to determine whether the research is complete. They are distinct from global quality gates (FFS thresholds, credibility scores). Write 3-7 concrete, checkable items.
5. List key assumptions to validate
6. Classify topic time domain for temporal credibility decay (see Source Preference Heuristics). For multi-domain topics, assign per sub-question: e.g., "regulatory aspect = Legal/5yr, tooling aspect = Tech/90d"

**Extended Thinking Task (Think2 PLAN step):** Before committing to scope, think through 3 alternative framings of the research question. Consider: Is the question too broad? Too narrow? Is there a more precise version that would yield more actionable results? Choose the framing that best serves the user's likely intent. Identify likely failure modes: Are any assumptions unverifiable? Is the scope too broad for the selected mode?

**Think2 EVALUATE (after activities):** Did the scope capture all components of the research question? Count: how many sub-questions were identified, how many assumptions need validation? Flag anything the next phase (PLAN) should be especially careful about.

**Output:** Structured scope document with research boundaries. Save checkpoint.

---

## Phase 2: PLAN - Strategy Formulation

**Objective:** Create an intelligent research roadmap

**Progress:** `[Phase PLAN] Creating research strategy and query plan...`

**Activities:**
1. Identify primary and secondary sources
2. Map knowledge dependencies (what must be understood first)
3. Create search query strategy with variants
4. Plan triangulation approach
5. Estimate time/effort per phase
6. Define quality gates
7. Write `plan.md` as a **living artifact** with three tracking sections — two tables (Task Ledger, Verification Log) and one freeform log (Decision Log). See structure below. This file is updated throughout the pipeline — it is not a static document.

**Living plan artifact structure:** Write `plan.md` to the output directory with the following sections:

```markdown
# Research Plan: [topic]

## Questions
1. [Primary research question]
2. [Sub-question 1]
3. [Sub-question 2]
...

## Strategy
- Sub-agent lens allocations (academic/practitioner/critical/historical)
- Search query decomposition (8 angles + pro/con pairs)
- Expected rounds of RETRIEVE

## Acceptance Criteria (copied from Phase 1 SCOPE Activity 4 — topic-specific only)
- [ ] [criterion 1 from SCOPE — must be topic-specific, not a global quality gate]
- [ ] [criterion 2 from SCOPE]
- [ ] [criterion 3 from SCOPE]
- [ ] [...up to 7 items]

(3-7 items. Do NOT restate global quality gates here — those live in Phase 2 Activity 6 and the FFS thresholds. Only topic-specific criteria belong here.)

## Task Ledger
| ID | Owner | Task | Status | Output |
|---|---|---|---|---|
| T1 | lead | Phase 1 SCOPE | done | _checkpoint.json (SCOPE) |
| T2 | lead | Phase 2 PLAN | in_progress | plan.md |
| T3 | academic-lens sub-agent | Phase 3 academic retrieval | pending | ${OUTPUT_DIR}/research_agent_1.md |
| T4 | practitioner-lens sub-agent | Phase 3 practitioner retrieval | pending | ${OUTPUT_DIR}/research_agent_2.md |
| ... | ... | ... | ... | ... |

**Task Status vocabulary:**
- `pending` — assigned but not yet started
- `in_progress` — currently being worked on
- `done` — completed with output written
- `blocked` — could not complete due to a technical obstacle (paywall, no results, tool error). Always include a one-line reason.
- `covered_by` — another task already addressed the same content. Always include a pointer to the covering task ID (e.g., `covered_by T5`). **Note:** This is distinct from VERIFY Step 5's uppercase `SUPERSEDED` status, which means a claim has been superseded by newer evidence — different concept entirely.

## Verification Log
| Item | Citation Status | Adversarial Status | Supersession Status | Evidence |
|---|---|---|---|---|
| [Critical claim / computation / figure] | VERIFIED / QUESTIONABLE / CONTRADICTED / UNVERIFIABLE | WITHSTOOD / WEAKENED / REFUTED / not-tested | OUTDATED / SUPERSEDED / current / not-checked | [path to verification artifact or URL] |

A single claim may have all three statuses simultaneously (e.g., citation=VERIFIED, adversarial=REFUTED, supersession=current). Use `not-tested` or `not-checked` for dimensions that did not apply to a given claim.

## Decision Log
(Freeform append-only log. Captures notable decisions as they happen: scope adjustments, contradictions resolved, claims dropped, supersession findings, Step 6 retry triggered, outline restructurings, etc. NOT a table — preserve expressiveness.)
```

**Extended Thinking Task (Think2 PLAN step):** Review any flagged concerns from SCOPE's evaluation. Then branch into multiple potential research paths — consider which paths are most likely to yield actionable evidence and which are dead ends. Converge on the optimal strategy before proceeding. Predict: which query formulations are most likely to fail? Which source types will be hardest to find? Review and refine the topic-specific acceptance criteria from SCOPE — are they concrete enough to tell "done" from "not done"? Copy them into plan.md's Acceptance Criteria section verbatim.

**Think2 EVALUATE (after activities):** Does the plan cover all sub-questions from SCOPE? Count: how many search angles were identified? Are there any single-source dependencies in the plan? Are topic-specific acceptance criteria concrete enough to tell "done" from "not done"? Flag gaps for RETRIEVE.

**Output:** Living research plan artifact (`plan.md`) with Questions, Strategy, Acceptance Criteria, Task Ledger, Verification Log, and Decision Log (three tracking sections — two tables and one freeform log). Save checkpoint.

**Plan artifact maintenance across phases:** The plan is a **living document**, not a static outline. Every subsequent phase updates the relevant sections:
- **Phase 3 RETRIEVE:** Update Task Ledger rows to `done`, `blocked`, or `covered_by <TaskID>` as sub-agents complete. Never leave pending rows without a status update.
- **Phase 4 TRIANGULATE:** Append resolved contradictions to Decision Log. Add verification entries for claims that were cross-referenced.
- **Phase 4.5 OUTLINE REFINEMENT:** Log outline adaptations to Decision Log with evidence rationale. If sections were added/removed/reordered, note the evidence source that prompted each change.
- **Phase 5 SYNTHESIZE:** Note which claims are load-bearing for conclusions in Decision Log.
- **Phase 6 CRITIQUE:** Add critique findings to Decision Log. Mark any addressed-later items as `blocked` until REFINE.
- **Phase 7 REFINE:** Update Decision Log entries from CRITIQUE with resolution status.
- **Phase 7.5 VERIFY:** Populate Verification Log with per-claim status across the three independent dimensions (citation / adversarial / supersession). Add Step 5 supersession findings and Step 6 retry decisions to Decision Log.
- **Phase 8 PACKAGE:** Final Decision Log entry documenting delivery status and any remaining open issues.

**Step 6 retry subprocess carve-out:** If running as a Phase 7.5 Step 6 Verifier-Guided Retry subprocess, do NOT write `plan.md` or the provenance sidecar — only write `candidate_B.md` and `candidate_B_verification.md` as specified in the Retry Brief. The parent session retains ownership of the plan artifact and provenance file. The subprocess's findings will be merged into the parent's Decision Log at Phase 6C merge time.

---

## Phase 3: RETRIEVE - Parallel Information Gathering

**Objective:** Systematically collect information from multiple sources using parallel execution for maximum speed

**Progress:** `[Phase RETRIEVE] Launching N parallel searches + M sub-agents...`
Update progress after results arrive: `[Phase RETRIEVE] X/Y sources gathered, avg credibility Z/100...`

**Extended Thinking Task (Think2 PLAN step):** Before launching searches, review the query decomposition strategy. Which search angles are highest priority? Which are most likely to return nothing (apply exhaustion criteria proactively)? Plan the sub-agent lens assignments. For the 3-5 most central sub-questions, construct pro/con query pairs — which sub-questions are most likely to have evidence on both sides? Predict: which sources will be hardest to access (paywalls, Cloudflare)? Which sub-topics have the highest risk of correlated results across agents?

**CRITICAL: Execute ALL searches in parallel using a single message with multiple tool calls**

### Source Preference Heuristics

**When evaluating search results and choosing which sources to fetch/read deeply, follow this priority order:**

1. **Primary sources** — official documentation, research papers, government data, original datasets
2. **Authoritative analysis** — peer-reviewed journals, recognized industry analysts, established research organizations
3. **Quality journalism** — established publications with editorial standards and fact-checking processes
4. **Technical content from verified practitioners** — blog posts from recognized experts with verifiable credentials

**DEPRIORITIZE (lower credibility score, use only when primary sources are unavailable):**
- SEO-optimized aggregator sites ("Top 10 best X" listicles, "Ultimate guide to Y")
- AI-generated content farms (repetitive phrasing, no author attribution, thin content)
- Sites with excessive ads/popups (proxy for low editorial standards)
- Undated content with no author attribution
- Paraphrased/rewritten versions of primary sources (find the original instead)

**Temporal Credibility Decay:**
Source freshness matters differently depending on the topic domain. Apply domain-appropriate recency weighting:

| Domain | Half-life | Meaning |
|--------|-----------|---------|
| Breaking news / trending | 7 days | A 2-week-old news article is stale |
| Technology / software | 90 days | A 6-month-old tech review is outdated |
| Business / market data | 180 days | A 1-year-old market report is unreliable |
| Science / academic | 365 days | A 2-year-old paper is still relevant |
| Legal / regulatory | 5 years | A 3-year-old regulation is likely current |
| Historical / reference | No decay | A 10-year-old history source is fine |

**How to apply:** Sources past 2 half-lives from today should be deprioritized unless they are foundational/seminal works. When two sources conflict and one is significantly more recent in a fast-moving domain, favor the newer source (note this in contradiction resolution).

**Determine the domain at SCOPE time** (Activity 6) and apply the appropriate half-life throughout retrieval and triangulation. For research spanning multiple domains, assign the half-life per sub-question or section rather than a single global value.

This heuristic applies to both the main agent's search evaluation and to sub-agent prompts. Include this guidance in sub-agent prompts.

### Query Decomposition Strategy

Before launching searches, decompose the research question into 5-10 independent search angles:

1. **Core topic (semantic search)** - Meaning-based exploration of main concept
2. **Technical details (keyword search)** - Specific terms, APIs, implementations
3. **Recent developments (date-filtered)** - What's new in last 12-18 months (use current date from Step 0)
4. **Academic sources (domain-specific)** - Papers, research, formal analysis
5. **Alternative perspectives (comparison)** - Competing approaches, criticisms
6. **Statistical/data sources** - Quantitative evidence, metrics, benchmarks
7. **Industry analysis** - Commercial applications, market trends
8. **Critical analysis/limitations** - Known problems, failure modes, edge cases

### Pro/Con Query Pairs

**For each major research sub-question (from Phase 1 SCOPE), generate TWO searches — one supporting and one contradicting.** This prevents confirmation bias at retrieval time by ensuring both sides of the evidence base are collected before synthesis begins.

**How to construct pairs:**
- **Supporting query:** Standard formulation seeking evidence FOR the expected answer (e.g., "benefits of X", "X improves Y", "evidence supporting X")
- **Contradicting query:** Explicit negation or alternative formulation seeking evidence AGAINST (e.g., "problems with X", "X fails to improve Y", "X criticism limitations", "alternatives to X outperform")

**Example pairs:**
- Sub-question: "Does RAG improve LLM accuracy?"
  - PRO: `"RAG improves LLM accuracy evidence"`
  - CON: `"RAG limitations failures accuracy problems"`
- Sub-question: "Is Rust faster than Go for web servers?"
  - PRO: `"Rust web server performance benchmark faster"`
  - CON: `"Go outperforms Rust web server" OR "Rust web server overhead problems"`

**Integration with Step 1 parallel searches:** Include both PRO and CON queries in the single-message parallel search burst. Each pair adds 1 extra search to the burst (the PRO query is often already covered by the standard decomposition angles 1-8; the CON query is the new addition). For 3-5 major sub-questions, this adds 3-5 extra searches to the burst.

**Scope:** Apply pro/con pairs to the 3-5 sub-questions most central to the research question's core thesis — prioritize those that are evaluative, comparative, or causal. Deprioritize factual lookups ("When was X founded?") and definitional queries, which don't need pairs.

**Deduplication:** If a CON query substantially overlaps with an existing angle-5 or angle-8 query from the Query Decomposition Strategy, reformulate the CON query to target a different failure mode rather than launching a near-duplicate search. For example, if angle 8 already covers "X limitations problems," the CON query should search for evidence supporting the OPPOSITE conclusion ("Y outperforms X") rather than repeating the same failure terms.

**How this interacts with Phase 4 Devil's Advocate:** Pro/con pairs provide raw evidence from both sides at retrieval time. Phase 4's Devil's Advocate searches are targeted — they search specifically to contradict the EMERGING THESIS after initial cross-referencing. The two mechanisms work at different stages and serve different purposes: pairs prevent one-sided evidence gathering; devil's advocate catches anchoring bias in the analysis.

### Parallel Execution Protocol

**Step 0: Get the current date**

Before ANY searches, retrieve today's date using Bash: `date +%Y-%m-%d`
Use the returned year for all date-filtered queries and recency checks. Do NOT assume a year from training data.

**Step 1: Launch ALL searches concurrently (single message)**

**CRITICAL: Use correct tool and parameters to avoid errors**

Choose ONE search approach per research session:

**Option A: Use WebSearch (built-in, no MCP required)**
- Standard web search with simple query string
- Parameters: `query` (required)
- Optional: `allowed_domains`, `blocked_domains`
- Example: `WebSearch(query="quantum computing 2025")`

**Option B: Use Exa MCP (if available, more powerful)**
- Advanced semantic + keyword search
- Tool name: `mcp__Exa__exa_search`
- Parameters: `query` (required), `type` (auto/neural/keyword), `num_results`, `start_published_date`, `include_domains`
- Example: `mcp__Exa__exa_search(query="quantum computing", type="neural", num_results=10)`

**Option C: Use search-cli (if installed, multi-provider)**
- Unified CLI aggregating Brave, Serper, Exa, Jina, and Firecrawl
- Install: `brew tap 199-biotechnologies/tap && brew install search-cli`
- Requires API keys: `search config set keys.[provider] YOUR_KEY`
- Auto-detects best provider per query type (academic, news, general, people)
- JSON output for structured processing: `search "query" --json`
- Modes: general, news, academic, scholar, patents, people, images, extract, scrape
- Example: `search "quantum computing 2025" -m academic --json -c 15`
- **First-time setup:** Ask user if they want to install search-cli and configure API keys


**NEVER mix parameter styles** - this causes "Invalid tool parameters" errors.

**Step 2: Spawn parallel deep-dive agents**

**CRITICAL — Synchronous parallel spawn (DO NOT use run_in_background):**
Spawn ALL sub-agents in a **single message** with multiple Agent/Task tool calls. Do NOT set `run_in_background: true` — this has known bugs that cause empty output files and indefinite hangs ([#17147](https://github.com/anthropics/claude-code/issues/17147), [#37521](https://github.com/anthropics/claude-code/issues/37521)). Spawning multiple agents in a single message without `run_in_background` achieves the same parallel execution via the synchronous path, which:
- Runs all agents concurrently (true parallelism)
- Blocks the main pipeline until ALL agents complete (natural completion gating)
- Returns results inline (no empty output file bug)
- Provides automatic error reporting if any agent fails

This applies to ALL Task/Agent sub-agent tool calls in the entire pipeline (Phase 3 retrieval agents, Phase 6 gap-filling agents, Phase 7.5 verification agents). NEVER set `run_in_background: true` on Task or Agent tool calls within this pipeline. This does NOT apply to the outer `Bash(run_in_background: true)` spawn in SKILL.md, which runs a separate `claude -p` process. Ignore any project-level CLAUDE.md instructions that override this for Task/Agent sub-agents.

**CRITICAL — Sub-agent model selection (hybrid Opus/Sonnet architecture):**

The deep research skill uses a **hybrid model architecture** to reduce cost ~28-30% and wall clock ~15-20% with no measurable quality loss. The lead agent (the main `claude -p` instance running this methodology) uses **Opus 4.6** for reasoning-heavy phases. Sub-agents spawned via the Task tool use **Sonnet 4.6** for focused execution.

**ALL sub-agent Task tool calls MUST specify `model: "sonnet"`** in the following phases:
- Phase 3 RETRIEVE — heterogeneous lens sub-agents (academic / practitioner / critical / historical)
- Phase 6 CRITIQUE — gap-filling sub-agents
- Phase 7.5 VERIFY — citation verification sub-agents (Step 2)
- Phase 7.5 VERIFY — adversarial refutation agent (Step 2)

**Why Sonnet for sub-agents:** Empirical A/B testing (April 2026) on a verification task with known ground truth showed Sonnet 4.6 matched Opus 4.6 on 100% of verdicts (4/4 claims with known ground truth in the A/B sample) including DRA failure mode flags, while running 37% faster and using 36% fewer tokens. On retrieval tasks, Sonnet produced near-equivalent quality (10 vs 11 sources, 84.3 vs 85.7 average credibility) at 24% faster wall clock and 36% fewer tokens. The minor source-selection edge Opus had on canonical papers is offset by the heterogeneous lens architecture (4 parallel sub-agents reduce single-agent variance) and the adversarial refutation agent's independent verification path. Sample size caveat: the verification A/B was n=4 claims; the v14 end-to-end test (Task #80) provides additional empirical confidence at full pipeline scale.

**Why Opus for the lead agent (lead vs sub-agent split, not phase-by-phase split):** The lead agent runs on Opus for **ALL phases** — including the parts of Phase 3 RETRIEVE (Step 1 parallel searches, Step 3 collect-and-organize), Phase 4.5 OUTLINE REFINEMENT, Phase 6 CRITIQUE (red-team analysis and persona-based critique), and Phase 7.5 VERIFY (claim decomposition, DRA tagging, result processing, loop-back decisions, Step 6 retry decisions) that involve reasoning. Only the Task-tool-spawned sub-agents inside those phases run on Sonnet. **The hybrid split is about WHO (lead vs sub-agent) not WHEN (which phase)** — every phase has Opus-level lead reasoning. Downgrading the lead to Sonnet would be a false economy because the lead's Phase 1 SCOPE decomposition, Phase 2 PLAN strategy, Phase 4 TRIANGULATE contradiction resolution, Phase 5 SYNTHESIZE argument building, Phase 7 REFINE judgment, and Phase 8 PACKAGE writing all involve open-ended reasoning where Opus's depth provides a real edge.

**Lead agent model selection:** The lead agent's model is set by the outer `claude -p --model opus` invocation that SKILL.md dictates at spawn time. Step 6 Verifier-Guided Retry also spawns a fresh `claude -p` subprocess — that subprocess is itself a lead agent of its own mini-pipeline and MUST also be invoked with `--model opus` (see Step 6 spawn command).

**Sub-agent model selection — explicit override REQUIRED:** Task tool calls may inherit the parent's model by default — exact behavior is unspecified in Claude Code documentation as of April 2026, so sub-agents MUST specify `model: "sonnet"` explicitly at every spawn site to guarantee the hybrid architecture works. A missing `model` parameter is a silent correctness bug — both lead and sub-agent could end up on the same model and the cost/speed savings would be lost without any error message.

**Effort level configuration (CRITICAL — Opus only supports `max`, Sonnet maxes at `high`):**

Anthropic's effort levels per model (verified April 2026 from official docs):
- **Opus 4.6:** `low` / `medium` / `high` / `max` — default is `medium`. Only Opus supports `max`.
- **Sonnet 4.6:** `low` / `medium` / `high` — default is `high`. Sonnet does NOT support `max`.
- **Haiku 4.5:** Effort configuration is NOT available. Effort flags are ignored.

The deep research skill MUST run the lead Opus 4.6 instance at `max` effort. Default `medium` produces materially worse synthesis, weaker contradiction resolution, and less rigorous verification reasoning.

There are TWO distinct execution contexts to think about:

1. **The PARENT Claude Code session that invokes this skill.** The frontmatter `effort: max` in `SKILL.md` line 4 applies here — it tells the parent session to run at max while preparing the Research Brief and orchestrating the spawn. The parent loads SKILL.md as its driving skill, so the frontmatter is honored.

2. **The SPAWNED `claude -p` subprocess that runs the 10-phase pipeline.** This is a brand-new Claude Code session that does NOT load SKILL.md as its driving skill — it just executes the prompt passed via `-p`. Therefore the frontmatter has NO effect on the subprocess. The subprocess gets its effort from TWO mechanisms applied at spawn time:
   - `CLAUDE_CODE_EFFORT_LEVEL=max` prepended inline on the spawn command (because the Bash tool runs `zsh -c` which does NOT source `~/.zshrc`, so the user's pinned env var is NOT propagated automatically)
   - `--effort max` flag on the CLI (redundant safety net, also self-documenting)

Both belt-and-suspenders are required for the subprocess — see SKILL.md spawn command and Step 6 retry spawn command for the exact invocation. The same dual mechanism applies to both spawns.

The Task tool has NO `effort` parameter — sub-agent effort is controlled exclusively by the env var inherited from the spawning subprocess. When Sonnet sub-agents inherit `CLAUDE_CODE_EFFORT_LEVEL=max` from the subprocess, the expected behavior is that Sonnet runs at its highest available level (`high`, since `max` is not valid for Sonnet) — this maps to the same level as Sonnet's default `high`. The exact fallback semantics for an unsupported effort value have not been independently verified against an official Anthropic doc as of April 2026; either way, Sonnet sub-agents end up at their quality ceiling.

**NOT recommended: Haiku 4.5 for any sub-agent (untested prior, not empirical conclusion).** Haiku 4.5 was NOT included in the April 2026 A/B test. A priori, its reasoning depth is likely below the threshold needed for DRA failure mode classification (G4/G5/T2 require careful semantic comparison), adversarial argumentation (defensible counter-claims, not just any contradiction), and source credibility judgment. Additionally, Haiku does not support effort configuration at all, so we cannot guarantee its quality ceiling. A future test could evaluate Haiku for the simplest sub-tasks (URL fetching + literal text matching), but the incremental cost savings over Sonnet (additional 60%) are not worth the risk to the verification path until empirically validated. Sonnet captures most of the cost savings (40% vs Opus) without this risk.

Use Task tool with general-purpose agents (3-5 agents) for:
- Academic paper analysis (PDFs, detailed extraction)
- Documentation deep dives (technical specs, API docs)
- Repository analysis (code examples, implementations)
- Specialized domain research (requires multi-step investigation)

**Sub-agent output format:** Require all sub-agents to return structured evidence, not free text:
```json
{"claim": "specific claim text", "evidence_quote": "exact quote from source", "source_url": "https://...", "source_title": "...", "confidence": 0.85}
```
This prevents synthesis fatigue when merging results from 3-5 agents.

### Heterogeneous Tool Assignment for Sub-Agents

**Problem:** When all sub-agents receive similar query formulations, they produce correlated results — the same sources, same perspectives, same blind spots. Correlated errors are the most dangerous failure mode in parallel retrieval because TRIANGULATE cannot catch what every agent missed.

**Solution:** Assign each sub-agent a distinct research lens so they search from different angles:

| Agent | Lens | Query Style | Prioritizes |
|-------|------|-------------|-------------|
| A | Academic/Formal | Technical jargon, author names, DOI, paper titles | Peer-reviewed sources, arxiv, conference proceedings |
| B | Practitioner/Applied | "how to," framework names, case studies, tutorials | Real-world implementations, StackOverflow, dev blogs |
| C | Critical/Adversarial | "[topic] problems," "failures," "criticism," "overhyped" | Limitations, failure modes, negative results |
| D (optional) | Historical/Foundational | "[topic] history," "original paper," "seminal work" | Origin stories, foundational research, evolution of ideas |

Agent D is recommended for topics with significant historical evolution (>5 years of development) or when SCOPE identifies foundational understanding as a prerequisite. For Deep/UltraDeep modes, include all 4 agents.

**Include the assigned lens AND an explicit effort reinforcement in each sub-agent's prompt.** The Task tool has NO `effort` parameter, so sub-agent effort is controlled solely by the inherited `CLAUDE_CODE_EFFORT_LEVEL` env var. Because env var inheritance is fragile (could be disrupted by future Claude Code changes, settings overrides, or unknown bugs), include a prompt-level effort reinforcement as belt-and-suspenders. Example:

> "You are researching [topic] with a CRITICAL/ADVERSARIAL lens. Your job is specifically to find problems, limitations, failures, and criticisms. Do NOT focus on benefits or positive findings — other agents are covering that. Write findings to [OUTPUT_FILE]. After every search, write immediately.
>
> **EFFORT REINFORCEMENT (mandatory):** Operate at MAXIMUM reasoning effort. Do not skip thinking steps. Take time to verify each finding against the source. Prioritize thoroughness and correctness over speed. Use extended thinking for any non-trivial judgment about source credibility, claim accuracy, or contradiction resolution. This skill explicitly requires the highest available reasoning quality from every sub-agent regardless of any default configuration."

**Why this matters:** Like ensemble methods in ML, diversity of approach is what makes parallel agents valuable. If all agents search the same way, the ensemble has no advantage over a single agent. Heterogeneous assignment ensures that at least one agent is looking where the others aren't.

**Relationship to Query Decomposition Strategy:** The query decomposition angles (above) guide the main agent's Step 1 parallel searches for broad coverage. The lens assignments guide Step 2 sub-agents for sustained deep investigation. There is intentional overlap — sub-agents deepen the angles that benefit from multi-step research, while Step 1 searches provide breadth.

**Example parallel execution (using WebSearch):**
```
[Single message with multiple tool calls]
- WebSearch(query="quantum computing 2025 state of the art")
- WebSearch(query="quantum computing limitations challenges")
- WebSearch(query="quantum computing commercial applications [CURRENT_YEAR]")
- WebSearch(query="quantum computing vs classical comparison")
- WebSearch(query="quantum error correction research", allowed_domains=["arxiv.org", "scholar.google.com"])
- Task(subagent_type="general-purpose", model="sonnet", description="Academic deep dive", prompt="LENS: ACADEMIC/FORMAL. Deep dive into quantum computing academic papers from [CURRENT_YEAR]. Use technical jargon, author names, DOI searches. Prioritize peer-reviewed sources, arxiv, conference proceedings. Write findings to [OUTPUT_FILE]. After every search, write immediately. Prioritize primary sources over SEO content. EFFORT REINFORCEMENT: Operate at MAXIMUM reasoning effort. Do not skip thinking steps. Take time to verify each finding against the source. Prioritize thoroughness over speed.")
- Task(subagent_type="general-purpose", model="sonnet", description="Practitioner analysis", prompt="LENS: PRACTITIONER/APPLIED. Analyze quantum computing real-world implementations, industry reports, case studies, and market data. Use practical terms, framework names. Write findings to [OUTPUT_FILE]. After every search, write immediately. Prioritize primary sources over SEO content. EFFORT REINFORCEMENT: Operate at MAXIMUM reasoning effort. Do not skip thinking steps. Take time to verify each finding against the source. Prioritize thoroughness over speed.")
- Task(subagent_type="general-purpose", model="sonnet", description="Critical analysis", prompt="LENS: CRITICAL/ADVERSARIAL. Find problems, limitations, failures, and criticisms of quantum computing. Search for 'quantum computing problems', 'overhyped', 'limitations'. Do NOT focus on benefits. Write findings to [OUTPUT_FILE]. After every search, write immediately. Prioritize primary sources over SEO content. EFFORT REINFORCEMENT: Operate at MAXIMUM reasoning effort. Do not skip thinking steps. Take time to verify each finding against the source. Prioritize thoroughness over speed.")
```

**NOTE:** All Phase 3 retrieval sub-agent prompts MUST include: (1) write-after-search protocol, (2) output file path, (3) source preference heuristics, (4) assigned research lens (see Heterogeneous Tool Assignment), (5) `model="sonnet"` parameter on the Task tool call (see Sub-agent model selection above), (6) **EFFORT REINFORCEMENT** clause inside the prompt text instructing the sub-agent to operate at maximum reasoning effort (belt-and-suspenders against env var inheritance failures). The examples above show the minimum required additions. Phase 6 gap-filling sub-agents and Phase 7.5 verification sub-agents have different requirements — see those phases for their specific prompt instructions, but they ALSO require `model="sonnet"` AND the EFFORT REINFORCEMENT clause.

**Example parallel execution (using Exa MCP - if available):**
```
[Single message with multiple tool calls]
- mcp__Exa__exa_search(query="quantum computing state of the art", type="neural", num_results=10, start_published_date="[use current year from Step 0]")
- mcp__Exa__exa_search(query="quantum computing limitations", type="keyword", num_results=10)
- mcp__Exa__exa_search(query="quantum computing commercial", type="auto", num_results=10, start_published_date="[use current year from Step 0]")
- mcp__Exa__exa_search(query="quantum error correction", type="neural", num_results=10, include_domains=["arxiv.org"])
- Task(subagent_type="general-purpose", model="sonnet", description="Academic deep dive", prompt="LENS: ACADEMIC/FORMAL. Deep dive into quantum computing academic papers. Use technical jargon, author names, DOI searches. Write findings to [OUTPUT_FILE]. After every search, write immediately. Prioritize primary sources over SEO content. EFFORT REINFORCEMENT: Operate at MAXIMUM reasoning effort. Do not skip thinking steps. Take time to verify each finding against the source. Prioritize thoroughness over speed.")
- Task(subagent_type="general-purpose", model="sonnet", description="Practitioner analysis", prompt="LENS: PRACTITIONER/APPLIED. Analyze quantum computing real-world implementations, industry reports, case studies, and market data. Use practical terms, framework names. Write findings to [OUTPUT_FILE]. After every search, write immediately. Prioritize primary sources over SEO content. EFFORT REINFORCEMENT: Operate at MAXIMUM reasoning effort. Do not skip thinking steps. Take time to verify each finding against the source. Prioritize thoroughness over speed.")
- Task(subagent_type="general-purpose", model="sonnet", description="Critical analysis", prompt="LENS: CRITICAL/ADVERSARIAL. Find problems, limitations, failures, and criticisms of quantum computing. Do NOT focus on benefits. Write findings to [OUTPUT_FILE]. After every search, write immediately. Prioritize primary sources over SEO content. EFFORT REINFORCEMENT: Operate at MAXIMUM reasoning effort. Do not skip thinking steps. Take time to verify each finding against the source. Prioritize thoroughness over speed.")
```

**Step 3: Collect and organize results**

Once all results are returned:
1. Extract key passages with source metadata (title, URL, date, credibility)
2. Track information gaps that emerge
3. Follow promising tangents with additional targeted searches
4. Maintain source diversity (mix academic, industry, news, technical docs)
5. Monitor for quality threshold (see FFS pattern below)

### First Finish Search (FFS) Pattern

**Note:** This pattern applies to Step 1 parallel searches only. Sub-agents (Step 2) must ALL complete before Phase 4 — see Phase 3 Completion Gate below.

**Adaptive completion based on quality threshold:**

**Quality gate:** Proceed to Phase 4 when FIRST threshold reached:
- **Quick mode:** 10+ sources with avg credibility >60/100 OR 2 minutes elapsed
- **Standard mode:** 15+ sources with avg credibility >60/100 OR 5 minutes elapsed
- **Deep mode:** 25+ sources with avg credibility >70/100 OR 10 minutes elapsed
- **UltraDeep mode:** 30+ sources with avg credibility >75/100 OR 15 minutes elapsed

**Post-threshold additional searches:**
- If the quality threshold is reached and gaps remain, launch a second batch of targeted follow-up searches (Step 3 tangents) to fill specific holes
- Additional sources used in Phase 5 (SYNTHESIZE) for depth and diversity
- This is sequential (after the initial burst returns), not background — synchronous spawn means all Step 1 searches complete together

**Exhaustion criteria (when to STOP searching):**
The FFS pattern defines when you have ENOUGH. These criteria define when information likely DOESN'T EXIST — preventing endless searching for something that isn't published:

- **5+ searches** on the same sub-topic with zero relevant results → declare "No published evidence found for [sub-topic]"
- **3+ different query formulations** (keyword, semantic, domain-specific) all return nothing → the information likely doesn't exist in searchable form
- **All found sources are beyond 2 half-lives** old with no recent updates → topic may be dormant; note "No recent activity found"

**When declaring absence, this IS a finding.** Document it in the report:
> "No published evidence was found for [claim/topic] despite [N] searches across [M] query formulations. This absence is itself informative — it suggests [the topic is under-researched / the claim is unsupported / the question may be novel]."

Do NOT keep searching past exhaustion criteria hoping something will appear. Absence of evidence, after systematic search, is data.

### Quality Standards

**Source diversity requirements:**
- Minimum 3 source types (academic, industry, news, technical docs)
- Temporal diversity (mix of recent 12-18 months + foundational older sources)
- Perspective diversity (proponents + critics + neutral analysis)
- Geographic diversity (not just US sources)

**Credibility tracking:**
- Score each source 0-100 using source_evaluator.py
- Flag low-credibility sources (<40) for additional verification
- Prioritize high-credibility sources (>80) for core claims

**Techniques:**
- Use WebSearch for current information (primary tool)
- Use search-cli for multi-provider aggregated search (if installed)
- Use WebFetch for deep dives into specific sources (secondary)
- Use Exa search (via WebSearch with type="neural") for semantic exploration
- Use Grep/Read for local documentation
- Execute code for computational analysis (when needed)
- Use Task tool to spawn parallel retrieval agents (3-5 agents)

### Operational Reliability Protocol

**These rules prevent common failure modes during retrieval without affecting research accuracy.** The three protocols work together: the write-after-search pattern creates file artifacts that sub-agent failure handling can use for partial output recovery, and blocked-site handling is a specialized application of write-after-search for error scenarios.

#### 1. Write-After-Search Protocol

The initial parallel search burst (Step 1) launches all searches concurrently in a single message — this is unaffected. The write-after-search protocol applies to what happens **after** the burst results arrive and during **follow-up searches**:

- **After the Step 1 parallel results arrive:** Immediately write ALL results to disk before performing any follow-up searches.
- **All subsequent follow-up searches** (Step 3 tangents, gap-filling queries) must follow the strict pattern:

```
Follow-up Search → Write findings to file → Follow-up Search → Write findings to file
```

**NEVER perform a follow-up search without first writing all pending results to disk.** Context compaction can destroy unsaved search results. Writing before each follow-up ensures no findings are lost, even if the session is interrupted or context is compacted.

**For sub-agents** spawned via the Task tool, the write-after-search pattern applies to every search since sub-agents execute sequentially. Include this instruction in their prompt along with a specific output file path (e.g., `/tmp/research_agent_N.md`):
> "Write all findings to [OUTPUT_FILE_PATH]. After every search or fetch, immediately write your findings to your output file. Never accumulate multiple search results in memory without saving. The pattern is: Search → Edit file → Search → Edit file. No exceptions.
>
> EFFORT REINFORCEMENT (MANDATORY): Operate at MAXIMUM reasoning effort. Do not skip thinking steps. Take time to verify each finding against the source. Prioritize thoroughness over speed."

(The EFFORT REINFORCEMENT clause is required in EVERY sub-agent prompt — see Phase 3 NOTE item #6 and the Heterogeneous Tool Assignment section for full rationale.)

#### 2. Sub-Agent Failure Handling

**With synchronous parallel spawn (the default — see Step 2), sub-agents that fail return errors inline.**

**If a sub-agent returns an error or empty result:**
1. Read any partial output it produced
2. Launch ONE replacement agent with:
   - The failed agent's partial output pre-loaded in the prompt
   - A note about which sections remain incomplete
   - A different query formulation (to avoid correlated failure)
3. If the replacement also fails: document the gap (see Completion Gate below). Maximum 1 retry per failed sub-agent — do not retry a second time.

**If a sub-agent hangs indefinitely** (no response returned after the synchronous call — rare with the synchronous path, but possible due to [API streaming stalls](https://github.com/anthropics/claude-code/issues/25979)):
- No recovery action is available within this session — the pipeline is blocked by the synchronous call. The checkpoint protocol ensures partial work from earlier phases is recoverable in a subsequent session.

#### 3. Blocked Site Handling (403 Errors + Anti-Bot Fallback Ladder)

The browser tool fallback ladder for sites that block WebFetch or Chrome MCP. This extends the user's global `~/.claude/CLAUDE.md` "Browser Tool Fallback Order" rule with research-pipeline-specific guidance.

**Tier 1 — WebFetch:** Default for all fetches. Also: before giving up on a site, check for lightweight alternatives:
- Reddit: try `old.reddit.com` URL rewrite OR append `.json` to the thread URL (public JSON endpoint)
- Hacker News: use the Algolia HN API (`https://hn.algolia.com/api/v1/search?query=...`)
- Blogs: check for `/feed.xml` or `/rss` endpoints
- Documentation sites: check for a raw markdown source on GitHub

**Tier 2 — Chrome MCP (`mcp__claude-in-chrome__*`):** When WebFetch returns 403 / paywall / Cloudflare challenge / login wall, OR when JavaScript rendering is required. Reuses the user's Chrome session cookies.

**Tier 3 — Playwright (`mcp__plugin_playwright_playwright__*`):** FALLBACK when Chrome MCP itself gets blocked by anti-bot detection. Sites commonly requiring Playwright: Reddit (main www.reddit.com, if `old.reddit.com` didn't work), X/Twitter, LinkedIn, Quora, Instagram, Threads. Playwright runs a clean headless browser that bypasses anti-bot fingerprinting the Chrome extension can't.

**Detection criteria for escalating Tier 2 → Tier 3:**
- Page text contains "Just a moment...", "Checking your browser", "Verify you are human", or similar Cloudflare/Turnstile interstitial markers
- Page text is a login wall when an anonymous public page was expected
- `get_page_text` returns substantially less content than expected (e.g., <500 chars on an article page)
- DOM contains DataDome / PerimeterX / hCaptcha / reCAPTCHA challenge widgets
- HTTP 403/429/503 accompanied by bot-detection content (NOT a genuine auth error — Playwright has no credentials either, so if the site legitimately requires login, document the gap and move on)

**Step-by-step protocol when a WebFetch fails:**
1. **Write what you already have** to your output file immediately
2. Try Tier 1 alternatives (old.reddit.com, .json endpoint, RSS feed, archive.org if appropriate) — ONE alternative only
3. If Tier 1 alternatives fail: try Tier 2 Chrome MCP
4. If Chrome MCP returns any of the anti-bot detection markers listed above: try Tier 3 Playwright
5. If Playwright also fails OR Playwright MCP is not available: document the gap in your output file explicitly ("Source X was unreachable via WebFetch, Chrome MCP, and Playwright. Content not captured.") and move on
6. **Write again** after each attempt
7. Move on — do NOT try multiple URLs at the same tier in a row without writing

**Important:** Do NOT attempt to bypass paid paywalls (NYT, WSJ, FT, paid Substack, paid Medium). Those are not bot-detection walls; they are intentional access controls for paid content. Escalating to Playwright for these is both unethical and pointless (Playwright has no subscription credentials).

This prevents the failure mode where an agent enters a retry loop on blocked sites, wasting context and time without producing output. It also prevents the silent-skip failure mode where an agent gives up on a tier-2-blocked site without trying Tier 3.

#### Phase 3 Completion Gate

**MANDATORY — Do NOT proceed to Phase 4 until ALL sub-agents have completed.** This is a hard gate, not a suggestion. Triangulation requires ALL retrieved evidence, not just the first results that arrive. Skipping ahead with incomplete evidence produces reports with systematic blind spots.

**With synchronous parallel spawn (see Step 2), this gate is automatically enforced** — the pipeline blocks until all agents in the single-message spawn complete. No manual monitoring is needed. If any agent fails, its error is returned inline and you MUST launch a replacement before proceeding.

**Retry logic for failed sub-agents:**
1. If a sub-agent returns an error or empty result: launch ONE replacement agent with a different query formulation
2. If the replacement also fails: document the coverage gap explicitly — "The [lens] perspective is underrepresented because sub-agent retrieval failed despite retry. The following research angles were not covered: [list]." Include this in the report's Limitations section.
3. NEVER proceed to Phase 4 with zero results from a sub-agent without either a successful retry OR an explicit documented gap.

**Maximum 1 retry per failed sub-agent.** Do not retry more than once — if two attempts fail, the information may not be available, and further retries waste budget.

**No silent task skipping within a sub-agent's assignment (applies to ALL sub-agent phases — Phase 3 RETRIEVE, Phase 6 CRITIQUE gap-filling, Phase 7.5 VERIFY):** When a sub-agent is assigned multiple tasks (e.g., "cover angles A, B, C" or "research topics X, Y, Z"), it MUST report on every assigned task — not silently drop difficult or redundant ones. If a task cannot be completed, the sub-agent must explicitly mark it as `blocked` (technical obstacle, paywall, no results) or `covered_by <other-task-id>` (another task already addressed the same ground, possibly in another sub-agent) in its output, with a one-line reason.

**Structured detection format (REQUIRED):** Sub-agent prompts MUST require a TASK STATUS SUMMARY block at the end of their output for the lead agent to parse mechanically. Include this verbatim in the sub-agent prompt:

> "Your task list contains [N] items: [list with task IDs T_a, T_b, T_c, ...]. At the end of your output file, append a clearly delimited block:
>
> ```
> ## TASK STATUS SUMMARY
> - T_a: done (findings in section 'X')
> - T_b: blocked (Elsevier paywall, no alternative source found within 2 attempts)
> - T_c: covered_by T_a (same benchmark already addressed in Section X — pointer rather than duplicate)
> ```
>
> Every assigned item MUST appear in this block with status `done`, `blocked`, or `covered_by <other-task-id>`. Do NOT silently skip, merge, or drop any assigned item — the lead agent will parse this block to update the Task Ledger in plan.md. A missing item is treated as a failure and triggers a replacement attempt."

After sub-agents complete, the lead agent parses the TASK STATUS SUMMARY block from each sub-agent output and reconciles against the Task Ledger in `plan.md`. Every pending row from this phase should now be `done`, `blocked`, or `covered_by <task-id>` — never left as `pending`. If a row is still pending or missing from the SUMMARY block, the sub-agent silently skipped it; reassign it or mark it `blocked` with an explicit reason.

**`blocked` does NOT trigger retry:** A `blocked` task counts as a documented coverage gap. It does NOT trigger a full sub-agent retry (retries are at the sub-agent level — see "Maximum 1 retry per failed sub-agent" above). A `blocked` task may trigger a targeted follow-up search in Phase 4.5 Draft-Guided Query Refinement if the gap is material to a load-bearing claim, otherwise it is documented in Limitations.

The FFS (First Finish Search) pattern above applies only to the initial parallel search burst (Step 1). It does NOT grant permission to skip ahead while sub-agents (Step 2) are still running. Sub-agent results are deep-dive evidence that triangulation depends on for cross-referencing.

**Think2 EVALUATE (after activities):** Count sources gathered vs. target. Assess: what percentage of PLAN's search angles yielded results? Which angles came up empty — is that exhaustion or bad queries? What does the next phase (TRIANGULATE) need to watch for?

**Output:** Incrementally-persisted research files with source tracking, credibility scores, and coverage map. Save checkpoint.

---

## Phase 4: TRIANGULATE - Cross-Reference Verification

**Objective:** Validate information across multiple independent sources

**Progress:** `[Phase TRIANGULATE] Cross-referencing X sources, Y claims to verify...`

**Extended Thinking Task (Think2 PLAN step):** Review RETRIEVE's evaluation for coverage gaps and flagged issues. Then think through which claims are most likely to have conflicting evidence. What are the controversial or rapidly-evolving aspects of this topic? Focus verification effort there.

**Activities:**
1. Identify claims requiring verification
2. Cross-reference facts across 3+ sources
3. Identify and **resolve** contradictions (not just flag them — see protocol below)
4. Assess source credibility
5. Note consensus vs. debate areas
6. Document verification status per claim

### Contradiction Resolution Protocol

When sources disagree on a claim, do NOT simply flag "sources disagree" and move on. Resolve each contradiction:

1. **Identify the specific claim** where sources disagree
2. **Compare source authority** — use credibility scores to weight which source is more trustworthy
3. **Check recency** — apply the temporal credibility decay half-life (see Source Preference Heuristics) to determine whether the age difference is material. A source within 1 half-life is still current; beyond 2 half-lives, favor the newer source
4. **Seek a tiebreaker** — look for a third independent source that confirms one position
5. **Present the resolution in the report** with explicit reasoning:
   > "Source A claims X [1], while Source B claims Y [2]. Based on [Source A's higher authority / more recent data / third source C confirming X], X appears more accurate because [specific reasoning]."
6. **If genuinely unresolvable** — present both positions with equal weight and explicitly label as "contested":
   > "This remains contested: Source A claims X [1] while Source B claims Y [2]. No tiebreaking evidence was found."

### Anchoring Bias Countermeasures

Claude exhibits anchoring bias — once a conclusion forms early in research (based on the first few search results), it resists contradictory evidence that arrives later. This is a documented failure mode that corrupts research objectivity. Countermeasures:

**1. Devil's Advocate Searches (mandatory):**
After initial cross-referencing, dedicate 2-3 searches SPECIFICALLY to finding evidence that CONTRADICTS the emerging thesis. Search for:
- "[topic] criticism problems limitations"
- "[topic] wrong overhyped debunked"
- "[main conclusion] counterargument alternative"

If no contradictory evidence is found, that's a data point (strong consensus). If contradictory evidence IS found, it must be integrated via the Contradiction Resolution Protocol above.

**2. Steelman the Opposition:**
When presenting contradictions in the report, always present the STRONGEST version of the opposing view — not a strawman. If Source B disagrees with the emerging thesis, present Source B's argument as compellingly as possible before explaining why the evidence favors a different conclusion (or labeling it as contested).

**3. Recency Awareness:**
Early search results are not inherently more accurate. Explicitly check whether later-discovered sources contain more recent data that supersedes earlier findings. Do not let the first source set an anchor that later sources merely confirm.

### Source Independence Detection

Before accepting that a claim has "3+ independent sources," verify the sources are actually independent — not all citing the same original. This prevents circular citation from inflating confidence.

**For each major claim with 2+ sources, check:**
1. **Do the sources cite each other?** If Source B explicitly references Source A, they are not independent — Source B is an echo of Source A.
2. **Do they trace to the same original?** If three blog posts all summarize the same research paper, that's 1 source with 3 echoes, not 3 independent sources. Look for the original and cite it instead.
3. **Are they from the same organization/author?** Multiple publications from the same research group on the same topic count as 1 perspective, not independent confirmation.

**Independence scoring (affects downstream SYNTHESIZE gate):**
- 3+ truly independent sources → **effective source count = actual count** (proceed normally)
- 1 original + multiple echoes → **effective source count = 1** regardless of echo count (label as "widely reported but single-origin" in the report)
- 1 source only, no echoes → **effective source count = 1** (label as "single-source, unverified" in the report)

The SYNTHESIZE phase's atomic claim screening uses effective source count (not raw count) when checking "2+ independent sources." A claim with 5 blog posts all citing the same study has effective count = 1 and will be flagged as single-source.

**When independence is unclear:** Check the publication dates. If multiple sources appeared within days of each other on the same claim, they likely trace to a common press release or original report. Find the original.

**Quality Standards:**
- Core claims must have 3+ **independent** sources (per independence check above)
- Flag any single-source or single-origin information
- Note recency of information
- Identify potential biases
- Every contradiction must be resolved or labeled "contested" — no silent disagreements
- Devil's advocate searches must be performed — no exceptions

**Think2 EVALUATE (after activities):** Count: how many claims were verified vs. contested vs. single-source? How many contradictions were resolved vs. left contested? Did devil's advocate searches uncover anything that changes the emerging thesis? Flag weak claims for SYNTHESIZE screening.

**Output:** Verified fact base with confidence levels, independence assessments, resolved contradictions, and devil's advocate search results. Save checkpoint.

---

## Phase 4.5: OUTLINE REFINEMENT - Dynamic Evolution (WebWeaver 2025)

**Objective:** Adapt research direction based on evidence discovered

**Progress:** `[Phase OUTLINE REFINEMENT] Comparing initial scope against discovered evidence...`

**Extended Thinking Task (Think2 PLAN step):** Think through whether the evidence gathered actually supports the original outline structure. Are there findings that don't fit any current section? Are there sections with weak evidence that should be demoted? Would a domain expert organize this information differently?

**Problem Solved:** Prevents "locked-in" research when evidence points to different conclusions or uncovers more important angles than initially planned.

**When to Execute:**
- **Standard/Deep/UltraDeep modes only** (Quick mode skips this)
- After Phase 4 (TRIANGULATE) completes
- Before Phase 5 (SYNTHESIZE)

**Activities:**

1. **Review Initial Scope vs. Actual Findings**
   - Compare Phase 1 scope with Phase 3-4 discoveries
   - Identify unexpected patterns or contradictions
   - Note underexplored angles that emerged as critical
   - Flag overexplored areas that proved less important

2. **Evaluate Outline Adaptation Need**

   **Signals for adaptation (ANY triggers refinement):**
   - Major findings contradict initial assumptions
   - Evidence reveals more important angle than originally scoped
   - Critical subtopic emerged that wasn't in original plan
   - Original research question was too broad/narrow based on evidence
   - Sources consistently discuss aspects not in initial outline

   **Signals to keep current outline:**
   - Evidence aligns with initial scope
   - All key angles adequately covered
   - No major gaps or surprises

3. **Refine Outline (if needed)**

   **Update structure to reflect evidence:**
   - Add sections for unexpected but important findings
   - Demote/remove sections with insufficient evidence
   - Reorder sections based on evidence strength and importance
   - Adjust scope boundaries based on what's actually discoverable

   **Example adaptation:**
   ```
   Original outline:
   1. Introduction
   2. Technical Architecture
   3. Performance Benchmarks
   4. Conclusion

   Refined after Phase 4 (evidence revealed security as critical):
   1. Introduction
   2. Technical Architecture
   3. **Security Vulnerabilities (NEW - major finding)**
   4. Performance Benchmarks (demoted - less critical than expected)
   5. **Real-World Failure Modes (NEW - pattern emerged)**
   6. Synthesis & Recommendations
   ```

4. **Draft-Guided Query Refinement and Gap Filling**

   After refining the outline, review each section. For sections where evidence is thin, generate **refined search queries** that use specific terminology, findings, or author names discovered during initial retrieval. These targeted queries find sources that generic initial searches missed.

   **Query refinement technique:** Use knowledge from the draft to construct better queries:
   - If you found a key paper, search for papers that cite it or by the same authors
   - If you found a specific technical term, search for that exact term (initial generic queries may have missed it)
   - If a section has conflicting evidence, search specifically for the unresolved claim
   - If a section covers a niche subtopic, use domain-specific jargon discovered during retrieval

   **Execution:**
   - Launch 2-3 refined searches per weak section
   - Apply Source Preference Heuristics from Phase 3
   - Quick retrieval only (don't restart full Phase 3)
   - Time-box to 2-5 minutes
   - Update triangulation and independence scoring for new evidence only

5. **Document Adaptation Rationale**

   Record in methodology appendix:
   - What changed in outline
   - Why it changed (evidence-driven reasons)
   - What additional research was conducted (if any)

**Quality Standards:**
- Adaptation must be evidence-driven (cite specific sources that prompted change)
- No more than 50% outline restructuring (if more needed, scope was severely mis scoped)
- Retain original research question core (don't drift into different topic entirely)
- New sections must have supporting evidence already gathered

**Think2 EVALUATE (after activities):** Did the outline change? If so, is every change evidence-driven (cite the source)? Count: how many sections were added/removed/reordered? Are any new sections still evidence-thin? Flag remaining gaps for SYNTHESIZE to handle.

**Output:** Refined outline that accurately reflects evidence landscape, ready for synthesis. Save checkpoint.

**Anti-Pattern Warning:**
- ❌ DON'T adapt outline based on speculation or "what would be interesting"
- ❌ DON'T add sections without supporting evidence already in hand
- ❌ DON'T completely abandon original research question
- ✅ DO adapt when evidence clearly indicates better structure
- ✅ DO document rationale for changes
- ✅ DO stay within original topic scope

---

## Phase 5: SYNTHESIZE - Deep Analysis

**Objective:** Connect insights and generate novel understanding

**Progress:** `[Phase SYNTHESIZE] Connecting insights across X verified claims...`

### Atomic Claim Screening (Error Amplification Prevention)

Before synthesizing, screen each major claim for independent verifiability. This prevents the "Spark to Fire" failure mode (DeepMind, 2026) where errors in one part of the evidence base amplify through synthesis into systematically wrong conclusions.

**For each major claim entering synthesis:**
1. Does this claim have an **effective source count** of 2+ (per independence scoring from TRIANGULATE — not raw count, which may include echoes of the same original)?
2. Was this claim verified during TRIANGULATE, or is it an unverified carryover?
3. Is this claim from a high-credibility source (>60/100) or a low-credibility one?

**Screening decision:**
- 2+ independent sources + verified → **ACCEPT into synthesis**
- 1 source only + verified → **ACCEPT but label as "single-source" in the report**
- Unverified + any source count → **DO NOT synthesize** — return to TRIANGULATE for this specific claim, or exclude from synthesis and note in Limitations
- Low-credibility source only → **DO NOT synthesize** — seek a higher-credibility source or exclude

This prevents the hub-corruption failure: if one bad claim is accepted into synthesis, it can distort the entire report's conclusions. Screening catches it before amplification.

**Activities:**
1. Screen claims via atomic claim protocol above
2. Identify patterns across ACCEPTED claims only
3. Map relationships between concepts
4. Generate insights beyond source material
5. Create conceptual frameworks
6. Build argument structures
7. Develop evidence hierarchies

**Extended Thinking Task (Think2 PLAN step):** Think through non-obvious connections and second-order implications. What patterns emerge when you look at the evidence as a whole that aren't visible in any single source? What would a domain expert notice that a generalist might miss? Are any of your emerging conclusions dependent on a single source — if so, how confident should you be?

**Think2 EVALUATE (after activities):** Count: how many claims passed screening vs. were rejected? Are any conclusions dependent on a single source? Do the insights go beyond what any individual source says (genuine synthesis) or are they just summaries? Flag any single-source conclusions for CRITIQUE.

**Output:** Synthesized understanding with insight generation, with claim acceptance/rejection log. Save checkpoint.

---

## Phase 6: CRITIQUE - Quality Assurance

**Objective:** Rigorously evaluate research quality

**Progress:** `[Phase CRITIQUE] Running red-team analysis and identifying gaps...`

**Extended Thinking Task (Think2 PLAN step):** Think through what a skeptical domain expert would challenge about these findings. What claims feel weakest? Where is the evidence thinnest? What alternative explanations haven't been considered?

**Activities:**
1. Review for logical consistency
2. Check citation completeness
3. Identify gaps or weaknesses
4. Assess balance and objectivity
5. Verify claims against sources
6. Test alternative interpretations

**Red Team Questions:**
- What's missing?
- What could be wrong?
- What alternative explanations exist?
- What biases might be present?
- What counterfactuals should be considered?

**Persona-Based Critique (Deep/UltraDeep only):**
Simulate 2-3 specific critic personas relevant to the topic:
- "Skeptical Practitioner" — Would someone doing this daily trust these findings?
- "Adversarial Reviewer" — What would a peer reviewer reject?
- "Implementation Engineer" — Can these recommendations actually be executed?

**Critical Gap Loop-Back with Targeted Sub-Agents:**
If critique identifies a critical knowledge gap (not just a writing issue):
1. **Spawn 1-2 targeted sub-agents** via the Task tool to investigate the specific gap. Each sub-agent gets a focused prompt describing exactly what's missing and where to look. Include Source Preference Heuristics from Phase 3 in the sub-agent prompt. **MANDATORY: Specify `model="sonnet"` on every Task tool call** — gap-filling sub-agents follow the same hybrid model architecture as Phase 3 retrieval sub-agents (see "Sub-agent model selection" in Phase 3). Do NOT use Opus for gap-filling sub-agents — it is wasted cost with no quality gain on focused execution tasks. **MANDATORY: Include the EFFORT REINFORCEMENT clause in the sub-agent prompt** — every gap-filling sub-agent prompt must end with "EFFORT REINFORCEMENT: Operate at MAXIMUM reasoning effort. Do not skip thinking steps. Take time to verify each finding against the source. Prioritize thoroughness over speed." This is belt-and-suspenders protection because the Task tool has no `effort` parameter and env var inheritance is fragile.
2. Sub-agents follow the same write-after-search protocol and output file path requirements as Phase 3 sub-agents.
3. **The no-silent-skip rule from Phase 3 Completion Gate applies here** — gap-filling sub-agent prompts MUST require a TASK STATUS SUMMARY block, and the lead agent MUST reconcile against the Task Ledger in `plan.md` before proceeding.
4. Wait for gap-filling sub-agents to complete (same sub-agent failure handling applies — see Phase 3 Operational Reliability Protocol).
5. Integrate new evidence into the existing research before proceeding to Phase 7.
6. **Time-box to 5 minutes** (sub-agents need startup time, so 3 minutes is too tight). If gaps cannot be filled, document them explicitly as limitations in the final report.

This is more powerful than the original "return to Phase 3" approach because targeted sub-agents can investigate specific deficiencies in parallel without restarting the entire retrieval pipeline.

**Think2 EVALUATE (after activities):** Count: how many critical gaps were found vs. minor issues? Were gap-filling sub-agents needed? Did any critique finding fundamentally challenge a conclusion from SYNTHESIZE? Flag the most damaging findings for REFINE priority.

**Output:** Critique report with improvement recommendations. Save checkpoint.

---

## Phase 7: REFINE - Iterative Improvement

**Objective:** Address gaps and strengthen weak areas

**Progress:** `[Phase REFINE] Addressing critique findings and strengthening weak areas...`

**Extended Thinking Task (Think2 PLAN step):** Review the critique report. Which issues are most damaging to the research's credibility? Prioritize those fixes. Think through whether the proposed fixes might introduce new inconsistencies.

**Activities:**
1. Conduct additional research for gaps
2. Strengthen weak arguments
3. Add missing perspectives
4. Resolve contradictions
5. Enhance clarity
6. Verify revised content

**Think2 EVALUATE (after activities):** Did each critique finding get addressed? Count: how many gaps were filled vs. documented as limitations? Did any fixes introduce new inconsistencies (the "fake fix" problem)? Is the research ready for verification?

**Output:** Strengthened research with addressed deficiencies. Save checkpoint.

---

## Phase 7.5: VERIFY - Tool-Grounded Claim Verification (Deep/UltraDeep only)

**Objective:** Verify the research output using external tool checks, not internal self-reflection. Academic research (Huang et al., CRITIC framework) shows pure self-reflection can DECREASE accuracy — models change correct answers to wrong ones more often than they fix errors. Tool-grounded verification is the only reliable approach.

**Progress:** `[Phase VERIFY] Decomposing report into claims and verifying against sources...`

**Extended Thinking Task (Think2 PLAN step):** Before decomposing, think through which claims in the report are highest-risk for inaccuracy. Quantitative claims, causal claims, and claims that surprised you during research are the most likely to be wrong. Prioritize verifying those. Also: which claims are highest-risk for supersession based on domain half-life and source age? Plan supersession search budget allocation — spend on the most critical claims first. If verification persistently fails, which claims are the weakest and what information would the Retry Brief need to convey about them? (Query formulation is the subprocess's job — focus on characterizing the failures.)

**When to Execute:** Deep and UltraDeep modes only (Quick and Standard skip this).

**WARNING — DO NOT self-score.** Do NOT re-read the report and assign subjective quality scores. This is the "self-correction blind spot" — models are poor at catching their own reasoning mistakes (CorrectBench, 2025). Instead, use the Decompose-Retrieve-Verify pattern below, which uses external tool calls to ground every check.

### Step 1: Decompose Report into Atomic Claims

Extract the 10-20 most important factual claims from the draft report. For each claim, record:
- The exact claim text
- The citation number(s) attached to it
- The source URL(s) from the bibliography

Focus on claims that are:
- Central to the report's conclusions
- Quantitative (numbers, dates, percentages)
- Comparative ("X is better than Y")
- Causal ("X causes Y")

Skip claims that are:
- Common knowledge
- The author's own synthesis/opinion (clearly labeled as such)
- Trivially verifiable definitions

**Adaptive decomposition granularity (NAACL 2025 — Decomposition Dilemmas, arXiv:2411.02400):** Over-decomposition hurts strong verifiers. Claude-class verifiers lose accuracy when claims are broken down below a natural unit, because sub-claim boundaries introduce decontextualization, false independence assumptions, and error accumulation. Apply these rules:
- **Simple factual claims** ("X was released in 2025"): treat as atomic, do NOT decompose further
- **Compound claims with multiple numbers**: decompose only along boundaries of *independently sourceable* facts. If a single source backs all the numbers, do NOT decompose. If numbers come from different sources, create one sub-claim per source. Cap at the smaller of (a) source count or (b) 4 sub-claims — beyond that, the original is overstuffed and should be rewritten in REFINE rather than verified piecemeal.
- **Causal claims with chains** ("X causes Y through mechanism Z"): keep the causal chain intact as ONE claim — but verify the mechanism, not just the endpoints. Decomposing into "X is correlated with Z" and "Z is correlated with Y" loses causal context and yields meaningless verdicts. (This is consistent with the High-Confidence Hallucination Vigilance principle, which ranks causal claims as the highest-risk category.)
- **General rule:** If decomposing a claim requires adding context back in the sub-claim text (e.g., "In the context of X..."), the decomposition is too aggressive. Merge it back into a single claim.

**Budget interpretation:** The 10-20 claim budget above counts atomic units *after* decomposition, not raw extracted claims. If decomposition pushes the count above 20, drop the lowest-priority claims rather than overflowing the budget. The batch-cap math in Step 2 assumes this interpretation.

**DRA Rubric Tagging:** After extracting claims, tag each claim with 1-3 applicable failure sub-categories from the DRA Failure Taxonomy (arXiv:2601.15808). This focuses verification on the most likely failure modes for each claim type.

DRA Failure Taxonomy (5 categories, 13 sub-categories):
- **Reasoning:** (R1) failure to understand requirements, (R2) lack of analytical depth, (R3) limited analytical scope, (R4) rigid planning strategy
- **Retrieval:** (T1) deficient external acquisition, (T2) misaligned evidence representation, (T3) ineffective handling/integration, (T4) lack of verification mechanism
- **Generation:** (G1) redundant content piling, (G2) structural disorganization, (G3) specification deviation, (G4) deficient rigor, (G5) strategic fabrication

**Claim-level vs. structural sub-categories:** Sub-categories R3 (limited scope), R4 (rigid planning), G1 (redundant content), and G2 (structural disorganization) are structural/process concerns that cannot be assessed by a claim-level verifier fetching a single source. These are addressed by Phase 6 CRITIQUE and Phase 7 REFINE, not by VERIFY rubric checks. Only the remaining 9 sub-categories (R1, R2, T1-T4, G3-G5) are used for claim-level tagging.

Tagging heuristics (apply the most specific matches):
- Quantitative claims → G4 (deficient rigor), G5 (strategic fabrication)
- Comparative claims → T2 (misaligned evidence representation), R2 (lack of analytical depth)
- Causal claims → R2 (lack of analytical depth), T3 (ineffective handling/integration)
- Claims with single-source citations → T1 (deficient external acquisition), T4 (lack of verification mechanism)
- Claims that restate the research question's framing → R1 (failure to understand requirements), G3 (specification deviation)
- **Fallback:** If a claim does not match any heuristic above, tag it with G4 (deficient rigor) and G5 (strategic fabrication) as baseline checks — accuracy and fabrication are universally relevant failure modes.

Record the DRA tags alongside each claim for use in the verification prompt.

### Step 2: Spawn Citation Verification Sub-Agents

Spawn 2-3 citation verification sub-agents PLUS 1 adversarial refutation agent in the same synchronous parallel spawn (all in a single message). The citation verifiers check existing sources; the adversarial agent independently searches for contradicting evidence the original retrieval may have missed. **Default to 3 citation verifiers if the atomic claim count exceeds 14**, since the per-verifier batch cap of 5-7 (see Batch composition below) would otherwise be exceeded with only 2 agents.

**ALL verification sub-agents (citation verifiers AND the adversarial refutation agent) MUST be spawned with `model="sonnet"` on the Task tool call.** This is part of the hybrid model architecture (see "Sub-agent model selection" in Phase 3). The verification path was the strongest empirical case for Sonnet — A/B testing showed Sonnet matching Opus on 100% of verdicts including DRA failure mode flags, while running 37% faster and using 36% fewer tokens. Do NOT use Opus for verification sub-agents — it is wasted cost with no quality gain.

**MANDATORY: Every verification sub-agent prompt (citation verifier AND adversarial agent) MUST include the EFFORT REINFORCEMENT clause** at the end of the prompt: "EFFORT REINFORCEMENT: Operate at MAXIMUM reasoning effort. Do not skip thinking steps. Take time to verify each finding against the source. For citation verification, fetch the source before judging — do not rely on training data. For adversarial refutation, try multiple search angles before reporting WITHSTOOD. Prioritize correctness over speed." This is belt-and-suspenders protection because the Task tool has no `effort` parameter and env var inheritance from the parent subprocess is fragile.

**The no-silent-skip rule from Phase 3 Completion Gate applies to all verification sub-agents.** Each verifier prompt MUST require a TASK STATUS SUMMARY block listing every assigned claim by ID with status `done` / `blocked` / `covered_by <claim-id>`. The lead agent reconciles the SUMMARY against the Task Ledger before processing results. A claim with no SUMMARY entry is treated as silently skipped — reassign it to another verifier or mark `blocked` with a reason.

**CRITICAL — Information Asymmetry Protocol:**
Verification sub-agents must receive ONLY the claims and their cited source URLs — NOT the full report, NOT the surrounding analysis, and NOT the report's conclusions. This prevents confirmation bias: a verifier who has read the full report will unconsciously seek to confirm its conclusions rather than genuinely checking the evidence.

**What to include in the verification prompt:**
- The exact claim text (isolated from its surrounding paragraph)
- The citation number and source URL
- The verification instructions below

**What to EXCLUDE from the verification prompt:**
- The full report draft
- The report's conclusions or synthesis
- Other claims (each batch should be verifiable without knowing what else the report says)
- The research question or scope (the verifier doesn't need to know the report's thesis)

**Limitation: claim text as implicit context.** Claim text inherently reveals partial context about the report's subject matter. The asymmetry protocol reduces but does not eliminate confirmation bias. To maximize the effect: (1) strip hedging language and evaluative framing from claims before sending (convert "our analysis shows X is significantly better than Y" to "X outperforms Y by N%"), and (2) accept that the protocol provides partial blinding, not full blinding — it prevents the verifier from knowing the report's overall narrative arc and conclusions, even though the topic domain will be apparent. If a claim contains a contextualizing preamble (e.g., "In the context of X, ..."), include it as-is — stripping it would change the claim's meaning and make verification meaningless.

**Batch composition:** When distributing claims across sub-agents, apply three rules: (1) no batch should contain more than 2 claims from the same report section, (2) mix claim types (quantitative, causal, comparative) across batches rather than concentrating them, and (3) **cap each citation verifier's batch at 5-7 claims maximum** to prevent knowledge aggregation collapse. Batch verifier accuracy degrades as fact count increases — the exact curve depends on the model, but the failure mode is general: errors compound, context blurs, and later claims in a long batch get less attention. The 5-7 cap is a conservative heuristic that keeps each batch within a high-attention window. If claim count exceeds 7 × 2 = 14 at the 2-agent floor, scale up to 3 verifiers (handles up to 21 claims). If claim count exceeds 21 (3 × 7), tighten the Step 1 "most important claim" selection rather than spawning a 4th agent — unbounded verifier spawning strains the turn budget. This cap applies only to citation verifiers; the adversarial refutation agent's separate 3-5 claim workload is already within the high-attention window. If the claim count and agent count make perfect distribution impossible, prioritize rule 1 over rule 2.

**Prompt for each verification sub-agent:**
> "You are a claim verification agent. You have NO context about what report these claims come from or what conclusions the report reaches. Your ONLY job is to check whether each cited source actually supports the claim AND whether the claim exhibits any of the tagged failure modes.
>
> For each claim below, use WebFetch to retrieve the cited source URL. Then perform TWO checks:
>
> **Check 1 — Source Verification:** Does the cited source actually support the claim?
> - VERIFIED: Source content confirms the claim
> - QUESTIONABLE: Source exists but doesn't clearly support the claim, or the claim overstates/distorts what the source says
> - UNVERIFIABLE: Source URL returns 403/404/error, or content doesn't address the claim at all
> - CONTRADICTED: Source actually contradicts the claim
>
> **Check 2 — DRA Rubric Check:** For each tagged failure mode, assess whether the claim actually exhibits that failure. Only report a DRA flag if you find a concrete problem — being tagged for a check is not the same as failing it. Use the rubric descriptions below (ordered by taxonomy):
> - R1 (misunderstood requirements): Does the claim actually address what was asked, or does it answer a different question?
> - R2 (lack of depth): Does the claim oversimplify what the source actually describes? Are important qualifications or conditions dropped?
> - T1 (deficient acquisition): Is this the strongest available source for this claim, or does the source itself reference a more authoritative primary source?
> - T2 (misaligned evidence): Does the source actually address the same comparison/context as the claim? Or is evidence from a different context being applied here?
> - T3 (ineffective integration): If multiple sources are cited, do they actually support the same point, or are they about different things being conflated?
> - T4 (lack of verification): Is the claim verifiable from this source alone, or does it require additional sources that aren't cited?
> - G3 (specification deviation): Does the claim match the stated scope and focus of the research?
> - G4 (deficient rigor): Are numbers, dates, or measurements accurate? Does the source state exactly what the claim states, or has precision been lost/invented?
> - G5 (strategic fabrication): Does the claim assert something the source never mentions? Is any part of the claim invented rather than sourced?
>
> Note: R3, R4, G1, G2 are structural sub-categories assessed by CRITIQUE/REFINE, not by claim-level verification. If a claim is tagged with any of these, report "structural — not assessed at claim level" for those tags.
>
> Do NOT rely on your training data — you MUST fetch and read the source.
>
> Write results to [OUTPUT_FILE_PATH]. After every verification, immediately write to the file. Format:
> Claim: [exact claim text]
> Citation: [N]
> Source: [URL]
> Status: VERIFIED/QUESTIONABLE/UNVERIFIABLE/CONTRADICTED
> Evidence: [direct quote from the source, in quotation marks, with the surrounding sentence for context. Do NOT paraphrase — copy the exact text that supports or contradicts the claim.]
> DRA Flags: [List any triggered failure modes, e.g., 'G4: number differs — source says 15%, claim says 25%' or 'NONE' if no failures detected]
>
> EFFORT REINFORCEMENT (MANDATORY): Operate at MAXIMUM reasoning effort. Do not skip thinking steps. Fetch each source before judging — do not rely on training data even if you think you remember the content. Take time to compare claim text to source text word-by-word for quantitative claims. Prioritize correctness over speed."

**Adversarial Refutation Agent:**

In addition to citation verification sub-agents, spawn ONE adversarial refutation agent in the **same synchronous parallel message**. This agent receives the top 3-5 most important claims (those most central to the report's conclusions) and actively searches for CONTRADICTING evidence. Unlike citation verifiers, the adversarial agent does NOT receive source URLs — it conducts independent web searches.

**Claim selection for adversarial refutation:** From Step 1's extracted claims, select the 3-5 that are (a) most central to the report's conclusions, (b) most contentious or surprising, or (c) highest-risk based on DRA tagging (G5, T2, or R2 tags). If fewer than 3 claims meet these criteria, use the 3 most central.

**What to include in the adversarial prompt:**
- The exact claim text (same as citation verifiers — stripped of hedging/framing)
- The DRA tags for each claim

**What to EXCLUDE:**
- Source URLs (the adversarial agent must find evidence independently)
- The full report, conclusions, or synthesis (information asymmetry applies)
- Any indication of which direction the report leans

**Prompt for the adversarial refutation agent:**
> "You are an adversarial claim refutation agent. Your ONLY job is to try to DISPROVE each claim below by finding credible contradicting evidence. You are NOT trying to verify or support these claims — you are actively looking for reasons they might be wrong.
>
> For each claim, use WebSearch to find evidence that CONTRADICTS it. Try at least 2 different search queries per claim — one direct refutation query (e.g., 'X is NOT better than Y' or 'problems with X') and one alternative-evidence query (e.g., 'Y outperforms X' or 'limitations of X study').
>
> For each claim, report:
> - REFUTED: Found credible evidence that directly contradicts the claim. Include source URL and quote.
> - WEAKENED: Found evidence that partially undermines the claim or adds significant caveats not mentioned. Include source URL and quote.
> - WITHSTOOD: After genuine adversarial search, could not find credible contradicting evidence. The claim appears robust.
>
> Do NOT accept the claim at face value. Assume it might be wrong and search accordingly. If you find yourself agreeing with the claim, search harder for contradictions.
>
> **Source credibility requirement:** Only report REFUTED if the contradicting source is at least as credible as a journalism or industry source (academic papers, official documentation, established news outlets). Blog posts, forums, and user-generated content can support a WEAKENED status but not REFUTED unless corroborated by a second credible source.
>
> Write results to [OUTPUT_FILE_PATH]. After every search, immediately write to the file. Format:
> Claim: [exact claim text]
> Adversarial Status: REFUTED/WEAKENED/WITHSTOOD
> Search Queries Used: [list the queries you tried]
> Contradicting Evidence: [URL and direct quote if REFUTED/WEAKENED, or 'None found after N searches' if WITHSTOOD]
>
> EFFORT REINFORCEMENT (MANDATORY): Operate at MAXIMUM reasoning effort. Do not skip thinking steps. Try multiple search angles before reporting WITHSTOOD — at minimum 3 distinct queries with different framings. The whole point of this agent is to find what the citation verifiers missed; lazy WITHSTOOD reports defeat the purpose of the entire pipeline. Prioritize correctness over speed."

Sub-agents follow the same reliability protocols: write-after-search, designated output file paths.

**Output file naming convention for VERIFY sub-agents:** Use `${OUTPUT_DIR}/verify_citation_N.md` for citation verification agents (N = 1, 2, 3) and `${OUTPUT_DIR}/verify_adversarial.md` for the adversarial refutation agent. This parallels the Phase 3 retrieval agent convention (`/tmp/research_agent_N.md`).

**Note on Phase 3 sub-agent requirements:** Verification sub-agents do not require a research lens (item 4 from Phase 3's NOTE) since they verify specific URLs rather than conducting open research. Source preference heuristics (item 3) apply only if a cited URL is inaccessible and the verifier must find an alternative source — in that case, follow the Source Preference Heuristics from Phase 3 and the Blocked Site Handling protocol.

### Step 3: Process Verification Results

Wait for all sub-agents to complete — both citation verification agents AND the adversarial refutation agent (same sub-agent failure handling applies — see Phase 3 Operational Reliability Protocol). Since all agents are spawned in a single synchronous message, they complete together.

Read all results. Process citation verification results, DRA flags, and adversarial results as three independent checks:

**Standard verification statuses (accuracy check):**
- **All VERIFIED:** No standard-status loop-backs needed. Proceed to the DRA flag analysis below, then to Step 4.
- **Any CONTRADICTED:** This is critical — the report contains a claim that is actively wrong. Return to Phase 7 (REFINE) to fix the specific claim. Remove or correct it with the contradicting evidence.
- **3+ QUESTIONABLE:** The report may be overstating its evidence base. Return to Phase 7 (REFINE) to soften overstated claims or find stronger supporting sources.
- **3+ UNVERIFIABLE:** Too many dead/blocked sources. Return to Phase 3 (RETRIEVE) to find replacement sources for unverifiable citations.

**DRA flag analysis (quality check):** Analyze DRA flags that sub-agents actually triggered (not just tagged — only flags where the sub-agent found a concrete problem):
- **3+ claims where the same DRA sub-category check failed:** This indicates a systematic failure mode, not isolated errors. Address the root cause in REFINE rather than fixing claims individually. For example, 3+ G4 failures suggest systematic imprecision; 3+ T2 failures suggest evidence is being applied out of context.
- **Any G5 (strategic fabrication) flag:** Treat as equivalent to CONTRADICTED — the claim contains invented content. Return to Phase 7 (REFINE) immediately.
- **DRA flags on VERIFIED claims:** A claim can be VERIFIED (source supports it) yet still have DRA flags (e.g., T1 — a stronger primary source exists, or R2 — the claim oversimplifies). These are quality issues, not accuracy failures. Note them for REFINE but do not treat as blocking.

**Adversarial refutation results (robustness check):**
- **Any REFUTED:** The adversarial agent found credible evidence directly contradicting a claim. Treat as equivalent to CONTRADICTED from citation verification — return to Phase 7 (REFINE) to address. Include the adversarial agent's contradicting source in the bibliography.
- **WEAKENED claims:** The claim is not wrong, but the adversarial agent found significant caveats or qualifications. In REFINE, add the caveats to the claim or soften its language. Include the weakening source in the bibliography. WEAKENED results do not count toward the CONTRADICTED threshold for Step 6 trigger — they are quality improvements, not accuracy failures.
- **All WITHSTOOD:** Claims that survived adversarial search are high-confidence. Note this in the report's methodology appendix as an additional validation signal.

**Cross-referencing adversarial and citation results:** If a claim is VERIFIED by citation verification but REFUTED by adversarial search, this means the cited source supports the claim, but other credible sources contradict it — a genuine factual dispute. In REFINE, revise the claim to present both sides: cite the original supporting source and the adversarial contradicting source, and note that credible evidence exists on both sides. For Step 6 threshold counting, treat VERIFIED-but-REFUTED as REFUTED (it is still a factual accuracy problem, even though the original citation is correct).

Before looping back, check the global loop-back budget (see Step 5's shared budget note). If the 2-cycle budget is exhausted, proceed to Step 4 instead of looping back, and document remaining issues in Limitations.

### Step 4: Completeness and Source Quality Check

After claim verification, do three quick tool-grounded checks:

**Completeness check:** Re-read the original research question from Phase 1 SCOPE. List each component of the question. For each component, verify that the report addresses it with at least one finding. If a component is unaddressed, note it as a gap.

**Acceptance criteria check:** Re-read the topic-specific acceptance criteria from Phase 1 SCOPE Activity 4 (mirrored in `plan.md`'s Acceptance Criteria section). For each criterion, mark it `met`, `partial`, or `unmet` based on the report content and verification results. Update the Acceptance Criteria checkboxes in `plan.md` directly. **Unmet criteria on load-bearing claims should trigger a Phase 7 REFINE loop-back** (within the shared 2-cycle budget). Partial criteria should be flagged for the Limitations section. Record the status in `plan.md`'s Acceptance Criteria section so Phase 8 PACKAGE can read it directly into the provenance sidecar without re-deriving.

**Source quality check:** Count sources by type (academic, industry, journalism, blog, SEO). If >30% of sources are blogs/SEO content, note this as a limitation. If <3 source types are represented, note as limitation.

These are structural checks (counting, matching) not subjective quality scoring.

### Step 5: Temporal Supersession Check (conditional)

**Objective:** Actively search for evidence that key claims have been superseded by newer information. Temporal credibility decay (Phase 3) is passive — it down-weights old sources at retrieval time. This step catches claims that were current when retrieved but have since been contradicted, replaced, or rendered obsolete — including cases where new information emerged during a long research session.

**Gate check:** Only execute when the topic domain's half-life (from Phase 1 SCOPE, Activity 6) is **≤90 days** (news/trending = 7d, tech/software = 90d). If domain half-life >90 days for all sub-questions, SKIP this step entirely and proceed to Think2 EVALUATE, then Phase 8 (PACKAGE). For multi-domain topics, apply only to claims in sub-questions with half-life ≤90 days.

**Budget:** Maximum 2 supersession searches per claim, maximum 10 total supersession searches per report. Use **WebSearch** for all supersession searches (these are discovery searches for newer information, not URL verification).

**Claim prioritization:** When eligible claims exceed the search budget, prioritize claims that are (a) central to the report's conclusions and (b) oldest relative to their domain half-life. Skip peripheral claims. Select the top N claims such that estimated search count fits within the 10-search budget, using worst-case estimates (2 searches each for claims beyond 2 half-lives). This prevents budget exhaustion on low-value checks, especially for 7-day half-life domains where nearly every source older than a week would trigger searches.

**For each prioritized claim:**

1. **Identify the claim's source date** — extract the publication date from the cited source. If a claim cites multiple sources, use the oldest source date to determine search effort (conservative — if the oldest supporting source is still current, the claim is likely current). If the source has no identifiable publication date, treat it as being at 2 half-lives old (maximum search effort). Undated sources in fast-moving domains are the highest risk for being outdated.
2. **If the source is within 1 half-life of today** — skip (still current)
3. **If the source is between 1-2 half-lives old** — run ONE supersession search
4. **If the source is beyond 2 half-lives** — run TWO supersession searches (higher risk of being outdated)

**Generating supersession search queries:** For each claim, identify the most specific named entity or metric (benchmark name, product name, framework name, version number) and use that as the primary search term. If the claim contains a quantitative result, search for the current state of that metric. If the claim is about an entity's status, search for the entity name plus the current year.

Query templates by claim type:
- Benchmark claims: `"[benchmark name] state of the art [current year]"` or `"[benchmark name] leaderboard [current year]"`
- Technology claims: `"[technology/framework] [current year] changes OR updates OR deprecated"`
- Market/pricing claims: `"[product/service] pricing [current year]"` or `"[product/service] pricing changes"`
- Research findings: `"[key finding terms] [current year] update OR contradicted OR replicated"`
- Factual claims about entities: `"[entity name] [current year]"` (catches acquisitions, shutdowns, pivots)

**Processing results:** For each supersession search result:
- If newer evidence **contradicts** the claim → mark as **SUPERSEDED** with the newer source
- If newer evidence **updates** the claim (e.g., new pricing, new version) → mark as **OUTDATED** with the current information
- If no newer evidence found → the claim stands (no status change needed — absence of superseding evidence is the default). Only record SUPERSEDED and OUTDATED statuses in the output to avoid noise.

**Output format for supersession results:**
```
Claim: [exact claim text]
Original Source Date: [date or "undated"]
Supersession Status: SUPERSEDED / OUTDATED
Newer Source: [URL]
Evidence: [what changed — brief summary of the superseding information]
---
```

**Step 5 loop-back decision (independent of Step 3):**
- **Any SUPERSEDED:** Return to Phase 7 (REFINE) to replace the claim with current information from the superseding source
- **3+ OUTDATED:** Return to Phase 7 (REFINE) to update the outdated claims with current data (OUTDATED is less severe than SUPERSEDED — individual outdated claims are noted as limitations rather than triggering rework)
- **Fewer than 3 OUTDATED and zero SUPERSEDED:** Proceed to Think2 EVALUATE → Phase 8 (PACKAGE)

**Maximum 2 loop-back cycles (global budget, shared with Step 3):** A single counter tracks total VERIFY → REFINE round-trips regardless of whether Step 3 or Step 5 triggered the loop-back. If the budget is exhausted, check whether Step 6 (Verifier-Guided Retry) should trigger before proceeding to PACKAGE.

### Step 6: Verifier-Guided Retry (conditional — Deep/UltraDeep only, one-shot)

**Objective:** When the loop-back budget is exhausted and persistent verification failures remain, spawn a fresh subprocess with isolated context to generate an independent second candidate, then merge the best evidence from both. Inspired by Marco DeepResearch (arXiv 2603.28376), which showed +12.1 average improvement from verification-guided retry with genuine context isolation.

**Trigger gate (ALL conditions must be met):**
1. Deep or UltraDeep mode
2. The 2-cycle loop-back budget is exhausted
3. Persistent failures remain in the MOST RECENT VERIFY pass (the one that exhausted the budget, not cumulative counts across all cycles): ≥2 CONTRADICTED (from citation verification or adversarial REFUTED — count together), OR ≥3 QUESTIONABLE (from Step 3), OR ≥2 SUPERSEDED (from Step 5). Count each status type independently from its originating step.

If ANY condition is not met, proceed to PACKAGE and document remaining issues in Limitations (existing behavior).

**Note on DRA flags and Step 6:** DRA quality issues (systematic T2, R2, etc.) do not trigger Step 6. DRA flags represent quality degradation (oversimplification, out-of-context evidence) rather than factual inaccuracy, and are addressed through REFINE loop-backs. Step 6's expensive fresh-context retry is reserved for accuracy failures (CONTRADICTED, QUESTIONABLE, SUPERSEDED) that persist after REFINE attempts.

**Key architectural principle:** Genuine context isolation requires spawning a NEW process. Instructing a Claude instance to "ignore prior context" within the same context window does not work — the model will still be influenced by prior searches and reasoning, producing correlated errors. The retry MUST be a subprocess with its own fresh context.

#### Phase 6A — Save Candidate A

**Progress:** `[Phase VERIFY] Step 6 triggered — saving Candidate A and preparing retry...`

1. Save the current report draft as `candidate_A.md` in the output directory
2. Save Candidate A's full verification results (all claim statuses from Steps 2-5) as `candidate_A_verification.md`
3. Record which claims failed and why (the specific CONTRADICTED/QUESTIONABLE/SUPERSEDED claims with their evidence)
4. Save checkpoint: `"phase_completed": "VERIFY_RETRY_STARTED"` with `"candidate_a_path"` and `"candidate_a_verification_path"` fields, so a resumed session can detect a retry was in progress and locate Candidate A

#### Phase 6B — Spawn Fresh Subprocess (Genuine Context Isolation)

**Progress:** `[Phase VERIFY] Spawning retry subprocess with fresh context...`

Prepare a Retry Brief (written to a temp file, then passed to `claude -p`):

```
RETRY BRIEF
============
ORIGINAL SCOPE: [paste the Phase 1 SCOPE output]
ORIGINAL PLAN: [paste the Phase 2 PLAN output]
OUTPUT DIRECTORY: [paste the actual resolved output directory path]
TOPIC DOMAIN HALF-LIFE: [paste the half-life assigned in SCOPE Activity 6]

SOURCE PREFERENCE HEURISTICS: Prioritize primary sources (official docs, research papers,
government data) over aggregator sites, AI-generated content, and SEO listicles. See the
Source Preference Heuristics in the deep-research methodology for the full priority order.

TEMPORAL CREDIBILITY DECAY: Sources past 2 half-lives should be deprioritized unless they
are foundational works. The topic domain half-life is stated above.

FAILED CLAIMS FROM FIRST PASS:
- Claim: [exact text] | Status: CONTRADICTED/REFUTED/QUESTIONABLE/SUPERSEDED | Reason: [brief]
- [repeat for each failed claim]

INSTRUCTIONS:
You are generating Candidate B for a research topic that already has a Candidate A.
Candidate A had persistent verification failures on the claims listed above.

Run a compressed research pipeline (CRITIQUE and REFINE are omitted because Candidate B's
claims will be merged into Candidate A's structure, which already went through the full
CRITIQUE/REFINE cycle — do not attempt additional refinement passes):
1. RETRIEVE: Use DIFFERENT query formulations than typical. Use the same heterogeneous
   sub-agent lenses (Academic/Practitioner/Critical) but with different specific search
   terms — correlated errors come from identical queries, not identical lenses. Pay
   special attention to finding ALTERNATIVE sources for the failed claims listed above.
2. TRIANGULATE: Cross-reference as normal, with special attention to the failed claims.
3. OUTLINE REFINEMENT: Adapt the outline if new evidence warrants it.
4. SYNTHESIZE: Synthesize normally.
5. Lightweight VERIFY: Run Steps 1-3 only (claim decomposition + citation verification).
   Skip Steps 4-6 to limit cost.

Save report to ${OUTPUT_DIRECTORY}/candidate_B.md
Save verification results to ${OUTPUT_DIRECTORY}/candidate_B_verification.md
```

**Spawn command:**
```bash
cat > /tmp/retry-brief-${UUID8}.txt << 'BRIEF'
[Retry Brief content]
BRIEF

# --model opus: Required for the hybrid architecture. The retry subprocess is itself
#   a lead agent of an abbreviated pipeline (SCOPE→PLAN→RETRIEVE→SYNTHESIZE→VERIFY)
#   and must run on Opus for the same reasons as the outer SKILL.md spawn — its
#   sub-agents (which it spawns via Task tool) will use model="sonnet" per the
#   methodology, but the retry's lead reasoning must stay on Opus.
# --effort max: Required for the hybrid architecture. Opus 4.6's default effort is
#   medium, which produces materially worse research output than max. The Bash tool
#   that spawns this command runs zsh -c (non-interactive) which does NOT source
#   ~/.zshrc, so the user's CLAUDE_CODE_EFFORT_LEVEL=max env var is NOT propagated.
#   We must explicitly set both --effort max AND prefix the command with
#   CLAUDE_CODE_EFFORT_LEVEL=max so the spawn AND its sub-agents (Sonnet, which
#   inherits this env var and maps max → its actual max which is "high") get the
#   correct effort level.
# --dangerously-skip-permissions: Required — subprocess has no interactive stdin.
# NOTE: Do NOT add --max-turns. Claude Code terminates naturally when the pipeline
# completes; any max-turns limit will cut off mid-research (possibly leaving claims
# unverified, retries incomplete, or Phase 8 PACKAGE unfinished). The deep research
# pipeline can legitimately require hundreds of turns for max-effort runs with
# verification retries, and a hard cap only exists to prevent infinite loops —
# which are not a risk in this well-defined 10-phase pipeline.
CLAUDE_CODE_EFFORT_LEVEL=max claude -p "$(cat /tmp/retry-brief-${UUID8}.txt)" \
  --model opus --effort max \
  --dangerously-skip-permissions < /dev/null 2>/tmp/retry-${UUID8}.err
```

**Failure detection:** After the subprocess exits, check:
1. Non-zero exit code (crash) → fall back to Candidate A
2. `candidate_B.md` does not exist or is <500 words → empty/incomplete output → fall back
3. `candidate_B_verification.md` does not exist → incomplete VERIFY → fall back

If all three checks pass, proceed to Phase 6C. On any failure, proceed to PACKAGE with Candidate A and document persistent issues in Limitations. Do NOT attempt a second retry.

#### Phase 6C — Joint Verify and Merge

**Progress:** `[Phase VERIFY] Merging Candidate A and Candidate B...`

Wait for the subprocess to complete. Read Candidate B and its verification results from disk.

**Structure:** Use Candidate A's report structure as the skeleton (it went through the full pipeline including CRITIQUE/REFINE). Replace specific claims per the logic below, but keep A's section organization and heading hierarchy.

**For each major claim, compare Candidate A and Candidate B:**
- **Both agree (same conclusion, both verified):** High confidence — keep the better-evidenced version (stronger sources, more citations)
- **A verified, B not present or failed:** Keep A's version
- **B verified, A failed:** Replace with B's version and citation
- **Both failed:** The claim is genuinely unsupported — remove from main analysis, document in Limitations
- **A and B contradict each other:** Apply the Contradiction Resolution Protocol from Phase 4 (compare source authority, check recency, seek tiebreaker, present resolution with reasoning)
- **B introduces a new finding with no counterpart in A:** If the finding is relevant to the original SCOPE and verified, add it as a new subsection or append to the most relevant existing section. Do not add more than 2 new subsections to avoid scope creep.

**After claim-level merge:**
1. Merge bibliographies: deduplicate sources, renumber citations to be sequential
2. Consistency check: re-read the merged report and verify no section references a claim or citation that was removed/replaced during merge
3. Regenerate the executive summary to accurately reflect the merged content
4. If the merged report exceeds Candidate A's length by more than 20%, review for redundancy introduced by the merge — deduplicate overlapping evidence and prefer the more concise formulation when two versions are equivalent in evidence strength

The merged report goes directly to Phase 8 (PACKAGE) — no additional full VERIFY cycles.

**Cost:** Step 6 adds approximately 80-120% of the original research cost when triggered. For reports that pass verification normally (no persistent failures after 2 cycles), Step 6 adds ZERO cost. It is a one-shot retry — runs at most once per research task.

**Think2 EVALUATE (after activities):** Count: how many claims VERIFIED vs. QUESTIONABLE vs. CONTRADICTED vs. UNVERIFIABLE? Were any claims decomposed into more than 3 sub-claims? If so, were they merged back per the adaptive granularity rule, or does the final atomic unit count stay within 10-20? Did per-verifier batch size respect the 5-7 cap? What DRA failure patterns emerged — did any sub-category appear 3+ times (systematic failure)? Were any G5 (fabrication) flags triggered? Adversarial results: how many claims WITHSTOOD vs. WEAKENED vs. REFUTED? Did any VERIFIED-but-REFUTED conflicts reveal genuine factual disputes? How many claims were checked for supersession? How many were SUPERSEDED/OUTDATED? Did the supersession budget allocation target the right claims? Was Step 6 triggered? If so, how many claims improved in Candidate B vs Candidate A? Did the merge produce a stronger report than either candidate alone? What should PACKAGE emphasize in the methodology appendix?

**Output:** Verification results file with per-claim status and evidence. If Step 6 was triggered, also Candidate A, Candidate B, and merged report. Save checkpoint.

---

## Phase 8: PACKAGE - Report Generation

**Objective:** Deliver professional, actionable research

**Progress:** `[Phase PACKAGE] Generating final report with bibliography...`

**Extended Thinking Task (Think2 PLAN step):** Before writing, review the refined outline and verification results. Which findings are most important for the executive summary? Are there any VERIFY results (QUESTIONABLE/CONTRADICTED/SUPERSEDED/OUTDATED) that must be reflected in the limitations section? Does the bibliography need cleanup (duplicates, dead links)?

**Activities:**
1. Structure report with clear hierarchy
2. Write executive summary
3. Develop detailed sections
4. Create visualizations (tables, diagrams)
5. Compile full bibliography
6. Add methodology appendix
7. Include verification results summary (per-claim status from Phase 7.5 VERIFY) in the methodology appendix, including adversarial refutation results (WITHSTOOD/WEAKENED/REFUTED) for the top claims
8. If Step 6 (Verifier-Guided Retry) was triggered, include a methodology note: "A verification-guided retry was performed. The final report merges the strongest evidence from two independent research passes." List which claims were replaced from Candidate B.
9. **Write provenance sidecar** alongside the final report. The sidecar filename matches the report's base filename with `.provenance.md` suffix replacing `.md`. For example, if the report is `research_report_20260406_vector-db-comparison.md`, the sidecar is `research_report_20260406_vector-db-comparison.provenance.md`. This is a separate human-readable audit trail, distinct from the JSON checkpoint.

```markdown
# Provenance: [topic]

- **Verification Status:** [PASS / PASS WITH NOTES — one-line summary, displayed first for quick scanning]
- **Date:** [YYYY-MM-DD]
- **Mode:** [quick/standard/deep/ultradeep]
- **Task UUID:** [UUID8]
- **Sources consulted:** [total unique sources across all research files]
- **Sources accepted:** [sources that survived citation verification]
- **Sources rejected:** [count of dead links, unverifiable, or removed]
- **Questions addressed:** [N met / M total — from Phase 1 SCOPE Activity 1]
- **Acceptance criteria:** [list from Phase 1 SCOPE, each marked met / partial / unmet — read from plan.md's Acceptance Criteria section, NOT re-derived]
- **Plan artifact:** [path to plan.md]
- **Research files:** [list of intermediate research_agent_*.md files from ${OUTPUT_DIR}]
- **Verification files:** [list of verify_*.md files, if written]

### VERIFY-dependent fields (Deep/UltraDeep modes only)
For quick and standard modes, mark these as `N/A — mode does not run VERIFY phase`:

- **Loop-back cycles used:** [0-2]
- **Step 6 retry triggered:** [yes/no — if yes, which claims were replaced from Candidate B]
- **Claims verified:** [VERIFIED count / total atomic claims]
- **Claims contradicted:** [count — remediated or documented in Limitations. A claim that is VERIFIED by citation but REFUTED adversarially counts here, NOT under Claims verified — adopt the harsher status to avoid overstating reliability.]
- **Claims superseded / outdated:** [SUPERSEDED count / OUTDATED count from Step 5 temporal supersession check, if run]
- **Adversarial refutations:** [WITHSTOOD/WEAKENED/REFUTED counts for top 3-5 claims]
- **DRA systematic failures:** [any sub-categories with 3+ actually-failing checks (not just tagged for checking) — see Phase 7.5 Step 3], or "none"
```

The provenance sidecar is NOT the same as `_checkpoint.json` — the checkpoint is machine-readable state for resume. The provenance sidecar is human-readable audit trail for downstream consumers who want to understand what was verified, what was rejected, and how confident the report's claims are.

**Verdict phrasing — clarity over generic hedging:** When presenting verified findings, use definitive language backed by the VERIFY evidence status. When presenting unverified or contradicted claims, state the uncertainty clearly in Limitations rather than hedging throughout the main prose. Generic hedging ("may suggest," "possibly," "it could be that") inserted across both true and false claims fails to differentiate them, making the report's strongest findings sound as tentative as its weakest. (See PNAS 2024 — DeVerna et al. — for narrow evidence in the fact-checking domain that hedged language on true claims and explicit uncertainty on false claims can both backfire under specific conditions. The generalization to research report prose is a design extrapolation, not a directly measured effect.)

**This rule complements the High-Confidence Hallucination Vigilance principle** (see cross-cutting principles at the top of this document): never *upgrade* a single-source or QUESTIONABLE claim to definitive language, AND never *downgrade* a properly VERIFIED claim by inserting generic hedges around it. The verification status from Phase 7.5 dictates the language tier:

- **VERIFIED** → definitive statements ("X achieves 73% accuracy on benchmark Y")
- **QUESTIONABLE / SUPERSEDED** → labeled and softened inline, e.g., "[Note: Source supports this claim but with caveats — see Limitations]" or "[Note: This claim was current as of [date] but may have been superseded]"
- **CONTRADICTED** → omit from main prose, document explicitly in Limitations with the contradicting evidence
- **UNVERIFIABLE** → drop the claim from the main prose entirely. Document the attempted-but-failed verification in the Limitations section, e.g., "Claim X was not included because the cited source returned a 404 and no alternative source could be found within the verification budget." Do NOT keep the claim in main prose with a vague hedge like "some sources suggest" — that combines the worst of both options (the reader sees a claim but cannot trace it).

**Think2 EVALUATE (after activities):** Does the report address every component of the original research question from SCOPE? Count: citations in text vs. bibliography entries — do they match? Are all VERIFY findings represented in the methodology appendix? Are supersession check results (SUPERSEDED/OUTDATED) documented alongside citation verification results? Are adversarial refutation results (WITHSTOOD/WEAKENED/REFUTED) documented for the top claims? Confirm all acceptance criteria from Phase 1 SCOPE are accounted for in the provenance sidecar — no criterion should be omitted or left unchecked. Does the prose follow the verdict-phrasing rule — definitive for VERIFIED, labeled inline for QUESTIONABLE/SUPERSEDED, and omitted from main prose (documented in Limitations instead) for CONTRADICTED/UNVERIFIABLE? Spot-check 3-5 paragraphs against the verification results to confirm the language tier matches the claim status. Is the executive summary accurate and not overstated relative to the evidence?

---

### Phase 8 Strict Ordering Rule (mandatory — Bug 7 acceptance)

The bug report requires `_DONE` to be the file with the most-recent mtime in OUTPUT_DIR. Therefore Phase 8 activities MUST execute in this exact order. Numbering extends Activities 1-9 above with 9.5, 9.7, 9.8, and 10:

1. **Activities 1-7:** Write `research_report_<DATE>_<slug>.md` (the Markdown source).
2. **Activity 8:** If Step 6 retry was triggered, run the merge logic.
3. **Activity 9:** Write the provenance sidecar `research_report_*.provenance.md`.
4. **Activity 9.5 — HTML/PDF generation.** Run `md_to_html.py` and `weasyprint` to produce sibling `.html` and `.pdf` files. After this step, ALL non-sentinel artifacts are on disk.
5. **Activity 9.7 — Update `research-tasks.json`** entry to `status: "complete"` with `complete_time: <ISO timestamp>` (use atomic write).
6. **Activity 9.8 — Update `_checkpoint.json` atomically** to `phase_completed: "PACKAGE"`, `status: "complete"`, `next_phase: null`:

   ```bash
   python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py \
       --output-dir "$OUTPUT_DIR" \
       --phase-completed "PACKAGE" \
       --next-phase "" \
       --extra '{"status": "complete"}'
   ```

7. **Activity 10 — Write `_DONE` sentinel atomically AS THE FINAL ACTION.** Use the deployed canonical path (per the resume convention; `$BASH_SOURCE` is empty in worker Bash calls):

   ```bash
   python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py done \
       --output-dir "$OUTPUT_DIR" --uuid8 "$UUID8"
   ```

After Activity 10, NOTHING else is written to OUTPUT_DIR by the worker. This guarantees `_DONE` has the most-recent mtime.

**Failure-mode behavior:** If killed between Activity 9.5 (HTML/PDF) and Activity 10 (`_DONE`), Phase 0 RESUME DETECTION on the next invocation sees:
- `research_report_*.md` exists → main artifact intact
- HTML/PDF exists → ancillary artifacts intact
- `_checkpoint.json` says `status: "complete"` (Activity 9.8 ran)
- `_DONE` absent (Activity 10 didn't run)

In this state, Phase 0 detects the inconsistency, simply writes the missing `_DONE`, and exits — no re-run of phases. If killed between 9.7 and 9.8, the `research-tasks.json` says `complete` but checkpoint disagrees; Disk-Truth Reconciliation re-runs the final activities (idempotent — atomic-replaces always produce the same end state).

**Output:** Complete research report ready for use, with `_DONE` sentinel proving the final state.

---

## Advanced Features

### Graph-of-Thoughts Reasoning

Rather than linear thinking, branch into multiple reasoning paths:
- Explore alternative framings in parallel
- Pursue tangential leads that might be relevant
- Merge insights from different branches
- Backtrack and revise as new information emerges

### Parallel Agent Deployment

Use Task tool to spawn sub-agents for:
- Parallel source retrieval
- Independent verification paths
- Competing hypothesis evaluation
- Specialized domain analysis

### Adaptive Depth Control

Automatically adjust research depth based on:
- Information complexity
- Source availability
- Time constraints
- Confidence levels

### Citation Intelligence

Smart citation management:
- Track provenance of every claim
- Link to original sources
- Assess source credibility
- Handle conflicting sources
- Generate proper bibliographies
