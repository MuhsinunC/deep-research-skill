`★ Insight ─────────────────────────────────────`
**Red-teaming a research synthesis is different from reviewing a paper.** The goal isn't to find typos or weak prose — it's to find load-bearing claims that would collapse if a smart skeptic pushed on them, and to find perspectives the synthesizer didn't even know they were missing. I'll prioritize the kind of critiques that would change the *recommendations*, not just the wording.
`─────────────────────────────────────────────────`

# Red-Team Critique: Deep Research Skill Synthesis

## Weak Claims

### 1. The "~20% hang rate" is presented as established statistic but rests on thin evidence
The synthesis treats "1 in 5 runs" as a load-bearing fact in its **opening sentence of Section 1** and uses it as the foundation for sequencing the entire roadmap. But the citations are: [1] ADR-001 (descriptive document), [2] a closed GitHub issue (not a measurement), and [4] a single empirical run (v15 UUID E72ABA74). One observed instance plus a project README estimate is not "the modal failure mode." The synthesis itself acknowledges in CLAUDE.md the figure is "roughly 20%" — a hedged estimate, not a measurement. **Sample size, denominator, and observation period are never stated.**

### 2. The MAST 41–87% comparison is non-comparable without justification
Citing the MAST multi-agent failure taxonomy [3] to argue deep-research is "on the better end of the distribution" requires that MAST measure the *same kind of failure* (hangs at 0% CPU) over comparable systems. It almost certainly measures broader failure categories. As cited, this is rhetorical framing, not evidence.

### 3. Time estimates are fabricated with no provenance
"1–2 days" for LiteLLM, "3–6 weeks" for harness portability, "hours of work" for CI wiring, "1–2 weeks" for the IO contract — none of these are sourced or scoped. They feel like reasonable engineer-intuition guesses, but they're presented as confident scoping in the roadmap, which is the most action-shaping section of the synthesis.

### 4. The Anthropic "90.2% improvement" architectural validation [8] is cross-domain
Anthropic's production multi-agent research system is for product use cases at Anthropic scale. Treating its 90.2% improvement as validation of *this* skill's architecture conflates "architecture pattern matches" with "results transfer." The improvement number applies to their benchmark, not necessarily to deep-research-skill's outputs.

### 5. "All 9 checks in validate_report.py are syntactic, not semantic" — unverified
The synthesis doesn't enumerate the 9 checks. If even 1 of them does some semantic work (e.g., fuzzy citation cross-check), the "0% semantic coverage" framing collapses. This is load-bearing for Section 5's argument.

### 6. "atomic_checkpoint.py is already correctly implemented" — unverified
Section 2 leans on this as a reason the IO contract is low-friction. The cited primitive (`os.replace()` after `fsync()` on same-filesystem `.tmp` sibling) is *described* correctly, but the synthesis never confirms the file exists in the repo or that this is the actual implementation. If it doesn't exist as described, Section 2's effort estimate changes.

### 7. The "five distinct bug fixes" reactive-accumulation pattern in Section 7 is asserted, not demonstrated
The synthesis names the five (`< /dev/null`, `_starting.txt`, env-guard, `[ROLE-CHECK-WRAPPER]`, named tmux) but never shows the git history demonstrating reactive vs. proactive addition, nor that the rate of accretion is increasing. The thesis ("architecture being patched reactively") could be true, but it's not evidenced.

### 8. Section 5's "false signal of quality" claim overstates the risk
"Wiring the gate without semantic checks creates a false signal of quality" — this assumes someone trusts CI green as quality validation. For a single-maintainer skill repo with no external consumers, the gate's purpose may be regression detection on infrastructure correctness, not quality. The synthesis adopts a production-software framing without justifying it.

### 9. Provider portability demand is assumed, not validated
Section 4 spends significant space on the two-layer abstraction problem, but never asks: **does anyone actually want to run this on Gemini or Bedrock?** If the answer is "no users have requested it," then steps 5a/5b drop to the bottom of the priority list regardless of technical complexity.

### 10. "Pre-v14 baselines are unusable" — but post-v14 baselines aren't shown either
The synthesis correctly invalidates pre-v14 data (medium-effort masquerading as max), but doesn't establish that *post-v14* benchmarks exist in measurable form. The implicit claim is "we now have valid data," but no numbers are produced.

---

## Missing Perspectives

### 1. **The user-facing output quality perspective is entirely absent**
The synthesis treats "improving the skill" almost entirely as an engineering-infrastructure question (reliability, observability, portability, evaluation). It never asks: **are deep-research outputs actually good?** Citation hallucinations, source diversity, factual drift, comprehensiveness vs. brevity, readability — none of these are surfaced. A 100% reliable pipeline that produces mediocre reports is worse than an 80%-reliable pipeline that produces excellent reports.

### 2. **Cost analysis is missing**
Every recommendation adds cost: LLM-as-judge factuality checks (more API calls), retry-with-validation (more tokens on failures), telemetry (storage + processing), golden test sets (recurring runs). The synthesis never quantifies token/dollar/time cost of either current runs or proposed additions. For a Max-plan user this matters less; for API-billed users it's first-order.

### 3. **No comparison to alternative deep-research tools**
GPT Researcher (open-source), Perplexity Deep Research, Gemini Deep Research, OpenAI Deep Research, ChatGPT Deep Research — these all exist and have public benchmarks. The synthesis treats deep-research-skill as the only system in the design space. **What is the bar?** If Perplexity does this in 30 seconds for $0.05, the bar is different than if there's no public alternative.

### 4. **The maintainer-as-single-person reality is ignored**
The roadmap recommends 5 sequenced steps totaling weeks-to-months of work. CLAUDE.md establishes this is a personal fork maintained by one person on the side. **Realistic capacity is never addressed.** A roadmap that requires 6 weeks of focused engineering when the maintainer has 4 hours/week is fictional.

### 5. **Security and safety considerations are absent**
`--dangerously-skip-permissions` is mentioned once. Prompt injection from retrieved web content, tool poisoning via malicious sources, PII leakage in saved test outputs, secret scanning of `.remember/` notes — all unmentioned. For a tool that fetches arbitrary web content and runs in an unattended pipeline, this is a notable gap.

### 6. **The "simpler alternative" perspective is missing**
The synthesis assumes the multi-phase orchestrator-sub-agent architecture is correct (validated by Anthropic comparison [8]) and proposes improving it. **It never asks whether a single-phase Opus-1M-context approach with a long prompt would produce comparable results at lower complexity.** The complexity may be self-justifying.

### 7. **Failure modes beyond hangs are not catalogued**
Section 1 frames reliability as "hangs at 0% CPU." But pipelines can fail in many ways: produce incomplete reports, fabricate citations, timeout on rate limits, get stuck in research loops, return cached/stale data, fail silently with empty sections. The synthesis treats "hang" as the only meaningful failure type because it's the most visible one — survivor bias.

### 8. **The user's actual research goals**
Who uses this skill? For what topics? Does the pipeline serve "compare 5 cloud providers for X workload" equally well as "what is the latest research on Y disease"? Domain coverage variance matters and is invisible.

### 9. **Backward compatibility / migration cost**
The IO contract (Section 2) is a breaking change. Existing `notes/test-runs/` outputs won't match the new schema. Comparison across versions becomes harder, not easier. The synthesis presents the contract as pure upside.

### 10. **The reverse-causality angle on the hang rate**
"Task tool hangs at 0% CPU" — but **why**? Is it certain prompt patterns? Specific sub-agent counts? Network conditions? The synthesis treats the cause as opaque and jumps to the workaround (subprocess switch). If the root cause is something the workaround doesn't address (e.g., a deadlock pattern that re-emerges in `claude -p` under different conditions), the fix is incomplete.

### 11. **Test infrastructure assumptions**
"Wire `validate_report.py` to a CI regression gate" — does this project have CI? `.github/workflows/`? Is the maintainer running runs locally? The synthesis assumes infrastructure that may not exist.

### 12. **Domain-research validity vs. infrastructure quality**
The synthesis equates "good skill" with "reliable + observable + portable + evaluated infrastructure." A separate dimension is whether the *research methodology* (Phase 1 plan → Phase 7.5 verification) is actually well-designed for producing accurate research. This is unexamined.

---

## Gaps Requiring Further Retrieval

These are concrete sub-questions to fan out into a gap-fill sub-agent. Each is scoped tightly enough to be answered by reading specific files or running specific queries.

### G1. Empirical hang-rate measurement
**Question:** Read `notes/test-run-log.md` and `notes/test-runs/` directory listing. Count: total deep-mode runs, runs with hang status, runs with completion status. Compute observed hang rate with sample size. Compare to the asserted "20%."
**Why it matters:** Section 1 is the foundation of the entire roadmap. A measured 5% rate or 40% rate would change priorities.

### G2. validate_report.py contents
**Question:** Read `skill/scripts/validate_report.py` (or wherever it lives). Enumerate all checks. Classify each as syntactic vs. semantic vs. mixed. Verify "9 checks, all syntactic" claim.
**Why it matters:** Section 5's recommendations are sized to the gap. If 3 of 9 are already semantic, the gap is smaller.

### G3. atomic_checkpoint.py existence and implementation
**Question:** Read `skill/scripts/atomic_checkpoint.py` (or equivalent). Verify it exists, verify the implementation matches the description (`os.replace()` after `fsync()` on same-filesystem `.tmp` sibling), verify it's actually used in the pipeline.
**Why it matters:** Section 2's effort estimate ("contract is low-friction because the primitive is solved") depends on this being true.

### G4. Output quality assessment from existing test runs
**Question:** Read 3 random test-run output reports from `notes/test-runs/`. Assess: citation correctness (spot-check 5 URLs per report), source diversity, claim-to-evidence alignment, factual accuracy on items where ground truth is checkable.
**Why it matters:** Surfaces the missing user-quality perspective. If outputs are excellent, infrastructure is the right priority. If outputs have problems, infrastructure-first is mis-prioritized.

### G5. The five bug fixes — provenance and timeline
**Question:** Run `git log -p -- skill/` filtered to commits adding/touching the spawn template. For each of the five bundled fixes (`< /dev/null`, `_starting.txt`, env-guard, `[ROLE-CHECK-WRAPPER]`, named tmux), find the commit that introduced it and the failure mode it addressed. Check whether they were added reactively (after a test failure) or proactively (during refactor).
**Why it matters:** Section 7's reactive-accumulation thesis depends on this pattern being real.

### G6. Hang root cause investigation
**Question:** In the v15 hang case (UUID E72ABA74), dump tool calls, system state, and process tree at hang time. Determine whether the hang is deterministic on certain inputs, network-dependent, or random. Search GitHub issues for similar 0% CPU hang patterns and their reported causes.
**Why it matters:** If the hang has a reproducible trigger, that may be patchable without the subprocess switch — or the subprocess switch may not actually fix it.

### G7. CI / test infrastructure inventory
**Question:** Check `.github/workflows/`, `Makefile`, `package.json`, `pyproject.toml`, any `pytest.ini` or `tox.ini`. Determine: is there CI? How are tests run? What's the existing automation?
**Why it matters:** Sections 3 and 5 assume infrastructure that may need to be built first.

### G8. Comparison to alternative deep-research solutions
**Question:** Find published benchmarks, blog posts, or evaluations of GPT Researcher, Perplexity Deep Research, OpenAI Deep Research (Mar 2025+), Gemini Deep Research. Compare on: cost per run, time per run, output length, citation density, reported quality. Identify what those projects' reliability/observability/eval stacks look like.
**Why it matters:** Establishes the bar. Provides architectural reference points.

### G9. User base and use cases
**Question:** Look for any usage telemetry, feedback issues, or commit messages indicating who uses this skill and for what. Failing that, query the maintainer's research-related commits in adjacent repos.
**Why it matters:** Provider-portability priority and research-domain quality concerns depend on this.

### G10. Issue #23821 recurrence rate
**Question:** Read the original issue, search test-run-log.md for instances of compaction-induced file deletion, count occurrences across runs. Determine whether the "10 of 14 lost" case is representative or extreme.
**Why it matters:** Section 7's framing of compaction as a major risk depends on rate, not anecdote.

### G11. Token cost per run
**Question:** From any run that has token-count data captured, estimate: input tokens, output tokens, total cost at current Claude pricing for both Opus orchestrator and Sonnet sub-agents. Project the cost increase from adding LLM-as-judge factuality checks per phase.
**Why it matters:** Cost analysis is missing entirely from the synthesis.

### G12. Reconcile the contradicted statistics
**Question:** For each of: Datadog 5%-vs-2% error rate, 60%-vs-33% rate-limit share, UserPromptSubmit 37%-vs-50% — locate the primary source and timestamp the figure. The synthesis's Limitations section flags this but doesn't resolve it.
**Why it matters:** Two of these numbers underpin claims in Sections 3 and 6. Unresolved contradictions mean those claims are either citation-broken or wrong.

---

## Improvements to Apply in REFINE

### I1. Reframe the 20% hang rate with epistemic honesty
Replace "fails non-deterministically about 1 in 5 runs" with "the documented hang failure mode in v15 testing, with rate estimated at ~20% based on [N observed runs]." If N is small, say so. The sequenced roadmap's foundation should not rest on a hedged number presented as confident.

### I2. Add a Section 0: "What we don't know about user-facing quality"
Before infrastructure recommendations, explicitly note that this synthesis treats reliability/observability/portability/evaluation as the four axes — but **output quality** is a fifth axis that wasn't part of the question framing and remains unmeasured. Recommend G4 (output quality assessment) as a pre-roadmap check.

### I3. Add cost estimates per recommendation
Each of the five roadmap steps should have a row: estimated token cost added per run, estimated dollar cost (Max plan vs. API), estimated runtime overhead. Even rough order-of-magnitude estimates beat silence.

### I4. Source the time estimates or mark them as guesses
For "1–2 days," "3–6 weeks," "hours not days" — either cite where the estimate came from (similar past work? maintainer self-estimate?) or label them "rough engineering guess" in the roadmap.

### I5. Verify load-bearing factual claims before publication
Apply G2 (validate_report.py contents), G3 (atomic_checkpoint.py implementation), G5 (bug-fix provenance). These are cheap reads that either confirm or invalidate Sections 2, 5, and 7 respectively. Synthesis should not ship with unverified primitives in load-bearing arguments.

### I6. Add an explicit "alternative architectures" subsection to Section 6
Briefly examine: single-phase Opus-1M-context approach, fewer-phase pipelines, agentic frameworks (LangGraph, etc.). Even a paragraph that says "considered and rejected because X" beats silence — currently the architecture's correctness is implicitly assumed throughout.

### I7. Add provider-portability demand validation as a gate
Section 4's recommendation depends on "is portability wanted?" Add: "If no user has requested provider portability and the maintainer's own usage is Claude Code, defer step 5 indefinitely." Current synthesis treats portability as obvious value-add.

### I8. Add a "what could break this roadmap" subsection
Beyond the existing Limitations: subprocess switch may not actually fix the hang (G6 investigation pending), IO contract migration may break existing test outputs, CI infrastructure may not exist, maintainer capacity may be insufficient, alternative tools (Perplexity etc.) may obsolete the project.

### I9. Distinguish "documented" from "validated"
For the subprocess switch: ADR-001 documents the decision [1], but **has the fix been validated?** Has anyone implemented it in a branch and measured the post-fix hang rate? The synthesis treats "documented in ADR-001" as if it equals "the fix works." These are different claims.

### I10. Acknowledge the survivor bias on failure modes
Section 1 is clear about hangs because hangs are loud. Section 5 hints at silent quality failures. **Make it explicit:** the synthesis's failure-mode catalog is biased toward observable failures because those are the ones with empirical evidence. Quiet failures (bad citations in completed reports) are underrepresented and may be more common than hangs.

### I11. Move Section 7's meta-pattern earlier or fold it into Executive Summary
Currently the "five recommendations form a single coherent program, not a menu" thesis is buried at the end. This is the strongest argumentative thread in the synthesis and should anchor the executive summary, not appear as Section 7.

### I12. Add explicit "rough cost vs. value" matrix to Recommendations
Currently the roadmap is sequenced by dependency. Add a separate axis: rough cost (effort) vs. rough value (failure modes addressed × frequency). A maintainer with 4 hours/week needs the cost-value matrix more than the dependency sequence.

### I13. Strengthen the Limitations section
Currently three caveats are listed. Add: (a) hang rate sample size unknown, (b) load-bearing primitives unverified, (c) output quality unmeasured, (d) alternative architectures unconsidered, (e) maintainer capacity unscoped. These are honest gaps that strengthen, not weaken, the synthesis's credibility.

---

`★ Insight ─────────────────────────────────────`
**Pattern across these critiques:** the synthesis is internally well-structured (the dependency-sequenced organization is genuinely good) but has a *single systematic blind spot* — it treats engineering-infrastructure improvement as the entire problem space, missing the parallel question of whether the outputs are actually good and whether anyone wants the proposed portability features. The strongest REFINE move is not adding more engineering rigor to existing sections; it's **adding the user-facing quality and demand-validation lens that's currently entirely absent**.
`─────────────────────────────────────────────────`