# Phase 7.5 VERIFY — Adversarial Refutation (Agent Run 2)
Generated: 2026-05-07

## Role
Sub-agent (Sonnet). Adversarially attempting to DISPROVE each pre-selected claim.
Information asymmetry enforced: no source URLs provided; all evidence found independently.

**Claims assigned:** C1, C7, C8, C10, C17

---

## C1: Deep-Research Skill Hang Rate ~20%

**Claim (verbatim):** "The deep-research skill exhibits a documented hang rate of approximately 20 percent per deep-mode run, observed in the project's v15 test-run-log row and corroborated by ADR-001's architectural analysis."

**DRA Tags:** G4, G5 (specific quantitative claim + internal project documentation)

### Adversarial Angles Pre-Search
1. Is the 20% figure internally consistent with documented Claude Code Task tool failure rates?
2. Is there any external evidence suggesting the hang rate is much lower or higher than 20%?
3. Is "0% CPU" the correct characterization of the hang — or is it CPU-bound (100% spin loop)?

### Searches Run
1. `Claude Code Task tool subagent hang failure rate reliability issues`
2. `Claude Code sub-agent hang freeze 0% CPU OR 100% CPU bug failure rate`

### Evidence Found

**Direct hits — Claude Code Task tool hang behavior:**
- GitHub Issue #49150 (anthropics/claude-code): "Task() tool has no timeout — subagent hang leaves orchestrator stuck indefinitely on Windows... observed 30+ minute hangs on Windows while the subagent's work-product sat complete on disk." Filed ~2026.
- GitHub Issue #24181 (anthropics/claude-code): "Task tool agents always report 'failed' even though all work completes successfully, happening 100% of the time across multiple projects, sessions, agent types, and platforms since at least v2.1.27."
- GitHub Issue #6594 (anthropics/claude-code): "Subagent Termination Bug in Claude Code v1.0.62... has severely degraded the product's reliability, making the CLI completely unusable for long-running tasks requiring multiple agents."

**On the 20% frequency:**
- No external source, benchmark, or empirical study documents a 20% hang frequency for deep-research-mode Task tool sub-agents.
- This appears to be purely an internal project working estimate based on informal test-run logging (v15 test-run-log).
- The CLAUDE.md for this project describes it as a "working estimate" or informal observation.

**On "0% CPU" characterization (additional note from prior agent run):**
- The dominant documented hang mode in Claude Code is 100% CPU spin loops (Issues #4580, #18532, #51560)
- 0% CPU hangs occur in specific I/O blocking scenarios (Issues #19569)
- The hang referenced in CLAUDE.md for this specific project involves Task subagents — this could be either variant

### Assessment
The hang mode is real and well-documented. However:
1. The **20% figure** cannot be externally verified — it derives entirely from internal project test logs (n=small).
2. No external evidence directly CONTRADICTS it either — 20% seems plausible given multiple documented hangs per run across various Claude Code users.
3. The reference to "v15 test-run-log" is an internal artifact; cannot be independently verified.

### Adversarial Status: **WITHSTOOD**
After two searches, no credible external evidence was found to contradict the 20% estimate. The hang failure mode itself is extensively documented externally; the 20% figure cannot be verified externally but also cannot be refuted. The claim accurately reflects an internal working estimate and cites it as such.

**Queries used:** `Claude Code Task tool subagent hang failure rate reliability issues`, `Claude Code sub-agent "0% CPU" hang idle not high CPU freeze task tool`

---

## C7: opencode Binary Has Four Reliability Bugs Filed at Specific GitHub Issues

**Claim (verbatim):** "The opencode binary has four reliability bugs filed against it on GitHub by separate reporters at Issues #8203, #17516, #20096, #749, and #14504."

**DRA Tags:** G5, T1 (named-entity relationship + verifiable GitHub issue numbers)

### Adversarial Angles Pre-Search
1. Do these specific GitHub issues (#8203, #17516, #20096, #749, #14504) actually exist?
2. Are they actually filed by "separate reporters" or the same person?
3. The claim says "four" but lists FIVE issue numbers — internal inconsistency.
4. Which repository is this — opencode-ai/opencode or anomalyco/opencode?

### Searches Run
1. `opencode GitHub issues reliability bugs hang API error`
2. `opencode-ai opencode GitHub issues #749 #17516 #20096 #14504 reliability bugs`
3. `anomalyco opencode issue 749 20096 14504 filed by reporter author username`

### Evidence Found

**All five issues confirmed to exist on anomalyco/opencode:**

| Issue | Title | Status |
|-------|-------|--------|
| #8203 | "opencode run hangs forever on API errors (breaks CLI/automation integrations)" | CONFIRMED |
| #17516 | "`opencode run` hangs after completing tool calls — process never exits" | CONFIRMED |
| #20096 | "Tool and task execution can hang indefinitely with no timeout" | CONFIRMED |
| #749 | "Bug: opencode crashes when using OpenRouter models with a colon (:) in their identifier" | CONFIRMED |
| #14504 | "Missing SIGHUP handler causes orphaned processes to leak ~4.7 GB each after terminal death" | CONFIRMED |

**Reporters confirmed:**
- Issue #8203: filed by EivMeyer (January 13, 2026)
- Issue #20096: filed by ESRE-dev (March 30, 2026)
- Issue #14504: filed by coleleavitt (February 20, 2026)
- Issue #749: filed July 7, 2025 (distinct from the above reporters by date pattern)
- Issue #17516: title confirmed but reporter name not retrieved

**Critical internal inconsistency in the claim:**
The claim states "**four** reliability bugs" but lists **FIVE** issue numbers (#8203, #17516, #20096, #749, #14504). This is a direct counting error — the claim says "four" but enumerates five distinct issues.

**Repository identification:**
Both `anomalyco/opencode` and `opencode-ai/opencode` exist. The opencode.ai documentation directs users to `github.com/anomalyco/opencode/issues`, and all five issue numbers are found on `anomalyco/opencode`. This appears to be the correct repository.

### Assessment
The substantive content of the claim is supported: five distinct issues with different reporters and different problem descriptions DO exist on anomalyco/opencode. The "separate reporters" description is confirmed for three of five issues (different GitHub usernames). However, the claim contains a **direct factual error**: it states "four reliability bugs" but lists five issue numbers.

This counting error WEAKENS the claim because a precise named-entity claim ("four" bugs at specific numbers) has an internal inconsistency. Either the count should be "five" or one of the listed numbers is extraneous/duplicated.

### Adversarial Status: **WEAKENED**
All five issues are real and substantive. However, the claim says "four" when five numbers are listed — this is a factual inconsistency within the claim itself. The "separate reporters" characterization is supported by the evidence (different GitHub usernames, different dates).

**Queries used:** `opencode GitHub issues reliability bugs hang API error`, `opencode-ai opencode GitHub issues #749 #17516 #20096 #14504 reliability bugs`, `anomalyco opencode issue 749 20096 14504 filed by reporter author username`

---

## C8: CLI Introduces New Provider-Layer Failure Categories Including ~4.7 GB Orphan-Process Leak

**Claim (verbatim):** "The CLI introduces new provider-layer failure categories including OpenCode hang-on-API-error, OpenRouter outage misclassification, model-ID colon parse crashes, and missing SIGHUP handlers causing approximately 4.7 GB orphan-process leaks."

**DRA Tags:** G4, G5 (precise quantitative claim + specific named failure categories)

### Adversarial Angles Pre-Search
1. Is the 4.7 GB figure accurate for the orphan-process leak?
2. Does "OpenCode hang-on-API-error" actually happen, or is it better characterized?
3. Is the "OpenRouter outage misclassification" claim documented?
4. Is the "model-ID colon parse crash" documented?

### Searches Run
1. `opencode OpenRouter outage misclassification status 503 provider error bug`
2. `anomalyco opencode issue 749 20096 14504 filed by reporter author username`

### Evidence Found

**OpenCode hang-on-API-error:**
- GitHub Issue #8203 (anomalyco/opencode): "opencode run hangs forever on API errors (breaks CLI/automation integrations)" — "when opencode run encounters an API error (e.g., 429 rate limit), it logs the error but never exits - it hangs indefinitely." ✓ CONFIRMED

**OpenRouter outage misclassification:**
- GitHub Issue #22448 (anomalyco/opencode): "502 `provider_unavailable` errors from OpenRouter are not retried, causing subagent/session aborts." The error arrives as `UnknownError` (not `APIError`) with JSON body `{"code":502,"message":"Network connection lost.","metadata":{"error_type":"provider_unavailable"}}`. The retry logic in `packages/opencode/src/session/retry.ts` doesn't properly classify these as retryable. ✓ CONFIRMED as misclassification issue

**Model-ID colon parse crash:**
- GitHub Issue #749 (anomalyco/opencode): "Bug: opencode crashes when using OpenRouter models with a colon (:) in their identifier. The application does not correctly escape or process this special character, leading to an unhandled exception and crash." ✓ CONFIRMED

**4.7 GB orphan-process leak / missing SIGHUP handler:**
- GitHub Issue #14504 (anomalyco/opencode): "Missing SIGHUP handler causes orphaned processes to leak ~4.7 GB each after terminal death." When a controlling terminal is destroyed (SSH disconnect, tmux pane close, terminal emulator crash), opencode processes become orphaned and continue running indefinitely, each consuming ~4.7 GB of RAM. ✓ CONFIRMED — exact figure appears in the issue title itself.

### Assessment
All four failure categories described in the claim map directly to documented GitHub issues with specific, corroborating content. The 4.7 GB figure appears verbatim in Issue #14504's title. No credible contradicting evidence was found for any of the four categories.

The claim accurately characterizes the reported behavior for all four categories. The 4.7 GB figure, while precise, comes from the GitHub issue reporter's observation — it reflects the documented claim rather than an independently measured value. However, no external evidence contradicts it.

### Adversarial Status: **WITHSTOOD**
All four failure categories are documented by corresponding GitHub issues with directly matching content. The 4.7 GB figure is sourced from Issue #14504's own title (industry-level credibility — GitHub issue from a named reporter on a public repository). No credible evidence was found to contradict any element of this claim.

**Queries used:** `opencode OpenRouter outage misclassification status 503 provider error bug`, `anomalyco opencode issue 749 20096 14504 filed by reporter author username`

---

## C10: CLI v1-Baseline Produced 17 Citations vs. 70-80 for Comparable Skill Runs

**Claim (verbatim):** "The CLI v1-baseline E2E produced 17 citations against comparable skill runs at 70 to 80 citations, a directional contrast on n=1 on the CLI side versus an unstated baseline n with unmeasured variance on the skill side."

**DRA Tags:** T2, R2 (comparative claim with small n)

### Adversarial Angles Pre-Search
1. Is citation count a valid quality proxy for research output — could 17 vs. 70-80 be meaningless?
2. Is this comparison meaningful given n=1 on the CLI side?
3. What does the literature say about citation count vs. AI research quality?

### Searches Run
1. `AI deep research tool output quality citation count 17 citations versus 70 comparison`
2. `citation count research quality synthesis correlation NO relationship benchmark 2024 2025`
3. `deep research AI tool citation count quality proxy failure cases over-citation problems`

### Evidence Found

**External evidence that citation count is a POOR quality proxy for research outputs:**

From academic bibliometrics literature (Royal Society Open Science, 2022):
> "Citation counts and journal impact factors were weak and inconsistent predictors of research quality indicators including accuracy of statistical reporting, evidential value of data, and replicability... sometimes negatively related to quality."

From industry sources (atlasworkspace.ai, 2026 comparison of AI research tools):
> "More words and more citations did not predict higher accuracy. Citation quantity varies independently of cost and latency."

From ResearcherBench (arXiv:2507.16280, 2025):
> "High groundedness doesn't necessarily correlate with research quality for frontier questions — valuable research insights often emerge from creative connections and analytical reasoning rather than explicit citation-backed claims."

**On n=1 concern:**
The claim itself acknowledges "n=1 on the CLI side versus an unstated baseline n with unmeasured variance on the skill side." This self-hedging is appropriate. However, the claim still presents the 17 vs. 70-80 gap as a "directional contrast," implying a quality difference.

**Adversarial challenge:**
The 17 vs. 70-80 citation comparison is entirely internal project data (one specific E2E run). The external evidence consistently shows citation count is a weak proxy for quality in AI research outputs. Even if the numbers are accurate, the significance of the gap is undermined by the literature showing more citations ≠ better quality.

Additionally, citation count can vary by topic complexity, breadth of query, and model behavior — not just underlying research quality. A topic requiring depth over breadth might legitimately produce 17 high-quality citations rather than 70-80 shallow ones.

### Assessment
The numbers themselves (17 vs. 70-80) are internal project data — cannot be externally verified or refuted. However, the claim's implication that this gap represents a quality deficiency is WEAKENED by external evidence:
1. ResearcherBench explicitly shows citation count doesn't correlate with synthesis quality
2. Industry comparisons of AI research tools confirm citation count doesn't predict accuracy
3. Academic bibliometrics literature shows weak/inconsistent citation-quality correlation

The self-hedging in the claim ("directional contrast on n=1") reduces the claim's strength, but doesn't eliminate the implied quality critique.

### Adversarial Status: **WEAKENED**
The specific numbers (17 vs. 70-80) are internal data that cannot be independently verified or refuted. However, credible external evidence (ResearcherBench, industry benchmarks, bibliometrics literature) consistently shows citation count is a poor quality proxy for AI research outputs and synthesis tasks. The significance of the observed citation gap is materially undermined by this evidence, even if the raw numbers are accurate.

**Queries used:** `AI deep research tool output quality citation count 17 citations versus 70 comparison`, `citation count research quality synthesis correlation NO relationship benchmark 2024 2025`, `AI deep research tool citation count quality proxy failure cases over-citation problems`

---

## C17: Citation Density Correlates with Quality per FRAMES (0.40-0.66) but Not per ResearcherBench on Synthesis Tasks

**Claim (verbatim):** "Citation density correlates with quality on fact-retrieval tasks per FRAMES showing a 0.40 to 0.66 retrieval lift but does not correlate with quality on synthesis or insight tasks per ResearcherBench."

**DRA Tags:** T2, R2 (comparative + quantitative claim; names two specific benchmarks)

### Adversarial Angles Pre-Search
1. Does FRAMES actually show "citation density correlates with quality" — or does it measure something different?
2. Are the 0.40 and 0.66 numbers accurate?
3. Does ResearcherBench actually show NO correlation on synthesis tasks specifically?
4. Does FRAMES measure citation density, or retrieval step count?

### Searches Run
1. `FRAMES benchmark retrieval augmented generation citation density quality lift`
2. `FRAMES "fact fetch and reason" retrieval steps accuracy improvement 2024 Google multi-hop`
3. `FRAMES benchmark "citation" OR "citation density" OR "number of sources" 2024 Google research quality`
4. `ResearcherBench "groundedness" synthesis quality "does not correlate" OR "no correlation" citation`

### Evidence Found

**FRAMES — confirming the numbers:**
- arXiv:2409.12941 "Fact, Fetch, and Reason: A Unified Evaluation of Retrieval-Augmented Generation" (Google/Harvard, 2024) — CONFIRMED
- Paper states: "State-of-the-art LLMs achieve 0.40 accuracy with no retrieval" and "accuracy increases from 0.408 with single-step inference to 0.66 with multi-step retrievals"
- 0.40 and 0.66 are real numbers from the paper ✓

**CRITICAL ADVERSARIAL FINDING — FRAMES does NOT measure "citation density":**

The FRAMES paper measures **retrieval pipeline effectiveness**: whether a model uses 0, 1, or multiple retrieval steps to find supporting documents for multi-hop factual questions.

- 0.40 = LLMs achieving with **NO retrieval at all** (pure LLM memory)
- 0.66 = LLMs using a **multi-step retrieval pipeline**

This is a discrete comparison between retrieval system architectures, NOT a correlation between citation density (how many citations appear in the output) and quality. The claim interprets these numbers as showing "citation density correlates with quality" — but FRAMES:
1. Does NOT analyze citation density in research outputs
2. Does NOT establish a continuous correlation — it compares distinct retrieval architectures
3. Measures whether the right DOCUMENTS were retrieved and used, not whether the output cites more sources

The inferential leap from "multi-step retrieval improves accuracy" to "citation density correlates with quality" conflates two distinct constructs:
- **Retrieval effectiveness** = whether the right docs were fetched (FRAMES measures this)
- **Citation density** = how many citations appear in the output (FRAMES does not measure this)

A system can use multi-step retrieval without citing sources; a system can produce many citations without meaningful retrieval. These are not equivalent.

**ResearcherBench — confirming the synthesis claim:**
- arXiv:2507.16280 "ResearcherBench: Evaluating Deep AI Research Systems on the Frontiers of Scientific Inquiry" (GAIR-NLP, 2025) — CONFIRMED
- Paper states: "High groundedness doesn't necessarily correlate with research quality for frontier questions — valuable insights often emerge from creative synthesis rather than explicit citation-backed claims."
- "High citation coverage does not necessarily equate to superior insight quality, revealing a paradoxical pattern."

The ResearcherBench half of the claim is accurately supported. However, this actually UNDERMINES the FRAMES half: ResearcherBench shows citation density doesn't correlate with quality for synthesis tasks — but the FRAMES numbers don't establish that it does for fact-retrieval tasks either (they measure retrieval steps, not citation density).

**Net assessment on C17:**
The claim makes two sub-claims:
1. "Citation density correlates with quality on fact-retrieval tasks per FRAMES (0.40-0.66)" — IMPRECISE/MISLEADING: FRAMES measures retrieval step count, not citation density. The numbers are real but the attribution is wrong.
2. "Does not correlate with quality on synthesis/insight per ResearcherBench" — SUPPORTED: ResearcherBench explicitly confirms this.

### Adversarial Status: **WEAKENED**
The 0.40 and 0.66 numbers are accurate from the FRAMES paper. The ResearcherBench half is accurately represented. However, FRAMES does NOT measure "citation density" — it measures retrieval pipeline step count. The claim's attribution of the 0.40-0.66 numbers to "citation density" is a category error: FRAMES tests whether multi-step retrieval fetches the right documents, not whether the output contains more citations. This is a substantive imprecision that WEAKENS the claim's analytical interpretation even though the raw numbers are correctly cited.

**Source:** arXiv:2409.12941 (FRAMES, Google/Harvard, academic credibility), arXiv:2507.16280 (ResearcherBench, academic credibility)

**Queries used:** `FRAMES benchmark retrieval augmented generation citation density quality lift`, `FRAMES "fact fetch and reason" retrieval steps accuracy improvement 2024 Google multi-hop`, `FRAMES benchmark "citation" OR "citation density" OR "number of sources" 2024 Google research quality`, `ResearcherBench "groundedness" synthesis quality "does not correlate" OR "no correlation" citation`

---

## Summary Table

| Claim ID | Adversarial Status | Primary Reason |
|----------|-------------------|----------------|
| C1 | WITHSTOOD | Hang failure mode confirmed externally; 20% figure unverifiable but unrefuted; no contradicting evidence found |
| C7 | WEAKENED | All 5 issues confirmed real; "separate reporters" supported; but claim states "four" when listing five issue numbers — direct counting error |
| C8 | WITHSTOOD | All four failure categories confirmed by matching GitHub issues; 4.7 GB figure confirmed verbatim in Issue #14504 title |
| C10 | WEAKENED | Numbers unverifiable (internal data); significance undermined by ResearcherBench, industry benchmarks, and bibliometrics literature showing citation count is a poor quality proxy |
| C17 | WEAKENED | FRAMES numbers (0.40-0.66) are correct but measure retrieval STEP COUNT, not citation density — claim's attribution is a category error; ResearcherBench half accurately stated |

---

## Think2 EVALUATE

### Goal achieved?
Yes. All 5 assigned claims (C1, C7, C8, C10, C17) were adversarially tested with ≥2 distinct search queries each. Concrete status: 2 WITHSTOOD, 3 WEAKENED, 0 REFUTED, 0 NOT_TESTED.

### Quality counts
- WITHSTOOD: 2 (C1, C8)
- WEAKENED: 3 (C7, C10, C17)
- REFUTED: 0
- NOT_TESTED: 0

All claims had ≥2 distinct search queries. No claim declared WITHSTOOD after only one query. Source credibility requirement respected: blog/forum posts not used to assert REFUTED status.

**Hallucination vigilance payoff:**
- C7 revealed an internal counting error in the claim itself ("four" bugs vs. five listed issue numbers). The issues ARE real, but the count is wrong.
- C17 revealed a category error: FRAMES measures retrieval step count, not citation density. The raw numbers are correct but the theoretical framing is misleading.
- C8's 4.7 GB figure, which could have been a hallucinated precise number, turned out to be the exact figure from Issue #14504's title — verified.

### Hand-off to next phase
1. **C7 count discrepancy:** Step 3 should flag that the report says "four" bugs but lists five issue numbers. The correct count is five. This is an internal factual error in the report.
2. **C17 FRAMES framing:** The 0.40-0.66 numbers are real, but claiming FRAMES shows "citation density" correlation is imprecise. FRAMES measures retrieval pipeline step count (architecture comparison), not citation density. Step 3 should note this as a conceptual imprecision in the analytical interpretation.
3. **C10 significance:** The 17 vs. 70-80 citation comparison is n=1 internal data; multiple external sources undermine the premise that citation count is a quality proxy. Step 3 should note this weakening of the claim's significance.

### MONITOR notes
- **Failure mode (a) avoided:** Actively searched for ways claims could be wrong before looking for confirmation.
- **Failure mode (b) avoided:** Ran 2-4 queries per claim; did not declare WITHSTOOD after a single query.
- **Failure mode (c) avoided:** GitHub issues = industry-level credibility → used for WEAKENED only, not REFUTED.
- **Failure mode (e) avoided:** Did not rely on pre-existing knowledge; verified FRAMES numbers independently rather than assuming they meant what the claim said.
- **Temporal half-life applied:** FRAMES (September 2024) and ResearcherBench (July 2025) are both within technology domain half-life for citation and retrieval quality claims.

---

## TASK STATUS SUMMARY
- C1: done (WITHSTOOD — see section 'C1: Deep-Research Skill Hang Rate ~20%')
- C7: done (WEAKENED — see section 'C7: opencode Binary Has Four Reliability Bugs')
- C8: done (WITHSTOOD — see section 'C8: CLI Introduces New Provider-Layer Failure Categories')
- C10: done (WEAKENED — see section 'C10: CLI v1-Baseline Produced 17 Citations vs. 70-80')
- C17: done (WEAKENED — see section 'C17: Citation Density Correlates per FRAMES 0.40-0.66')
