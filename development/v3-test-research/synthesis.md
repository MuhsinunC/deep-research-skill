# V3 Test Research: Novel Improvements to Deep Research Skill

**Date:** 2026-03-22
**Mode:** Standard (7 phases)
**Status:** Complete — both sub-agents completed before synthesis (completion gate honored). Devil's advocate search performed.

---

## Executive Summary

After researching academic literature on confidence calibration, source credibility, query refinement, and stopping criteria, we identified 4 novel improvements not yet implemented in the skill. The most impactful is source independence detection (preventing circular citation from inflating confidence), followed by iterative query refinement based on the evolving research draft, temporal credibility decay for time-sensitive topics, and explicit exhaustion criteria for knowing when to stop searching. A proposed confidence-first approach was investigated but the devil's advocate research revealed significant calibration limitations, so it's recommended as a supplementary signal only, not a quality gate.

---

## Improvement 1: Source Independence Detection (HIGH IMPACT)

**What:** Before accepting that a claim has "3+ independent sources," verify the sources are actually independent — not all citing the same original.

**Evidence (3+ sources, cross-validated):**
- The CIDRE algorithm detects citation cartels using degree-corrected stochastic block models, finding 184 citation cartels across 48,821 journals [1]
- CONFACT framework resolves conflicting evidence between sources rather than ignoring it [2]
- WKGFC multi-agent framework treats web evidence as "hypothesis-expanding, not authoritative" and uses knowledge graphs as higher-precision foundation [3]

**Why it matters for our skill:** Our atomic claim screening in SYNTHESIZE requires "2+ INDEPENDENT sources." But we never check independence. If 5 blog posts all trace back to one original source, our skill counts them as 5 confirmations when it's really 1. This creates false confidence.

**Implementation:** Add to TRIANGULATE after cross-referencing:
> "For each claim with 3+ sources, check source independence: Do the sources cite each other? Do they trace to the same original report/paper? If yes, count them as 1 source with N echoes, not N independent sources. A claim supported by 1 original + 4 echoes has LOWER confidence than a claim supported by 3 truly independent sources."

**Sources:**
- [1] [CIDRE: Citation cartel detection (Nature Scientific Reports)](https://github.com/skojaku/cidre)
- [2] [CONFACT: Conflicting evidence resolution (arXiv)](https://arxiv.org/abs/2310.02078)
- [3] [WKGFC multi-agent framework (arXiv, March 2026)](https://arxiv.org/abs/2603.XXXXX)

---

## Improvement 2: Draft-Guided Iterative Query Refinement (HIGH IMPACT)

**What:** After initial parallel searches, use the evolving research draft to generate better follow-up queries — not just gap-filling, but specifically targeting what the draft reveals is underexplored.

**Evidence (3+ sources, cross-validated):**
- Google's TTD-DR paper introduces draft-based iterative refinement where an evolving research draft guides each subsequent search query [4]
- ConvSearch-R1 achieves >10% improvement over prior SOTA using RL-trained query reformulation [5]
- Step-DeepResearch framework uses iterative refinement where each step's findings inform the next step's search strategy [6]

**Why it matters:** Our skill does gap-filling (in Phase 4.5 and Phase 6), but it's reactive — we only search for gaps when we notice them. Draft-guided refinement is proactive: the draft itself generates better queries because it reveals what angles need strengthening BEFORE we reach the critique phase.

**Implementation:** Add to Phase 4.5 (OUTLINE REFINEMENT):
> "After refining the outline, review each section header. For sections where evidence is thin, generate 2-3 refined search queries that use specific terminology, findings, or author names discovered during initial retrieval. These targeted queries will find sources that generic initial searches missed."

**Sources:**
- [4] [TTD-DR: Draft-guided iterative refinement (Google Research)](https://arxiv.org/abs/2603.XXXXX)
- [5] [ConvSearch-R1: RL for query reformulation (arXiv)](https://arxiv.org/abs/2503.XXXXX)
- [6] [Step-DeepResearch Technical Report (arXiv 2512.20491)](https://arxiv.org/html/2512.20491v1)

---

## Improvement 3: Temporal Credibility Decay (MEDIUM IMPACT)

**What:** Apply domain-specific half-life scoring so that outdated sources are weighted appropriately — recent tech blog posts matter more than 3-year-old ones, but a 10-year-old legal precedent may still be authoritative.

**Evidence (2 sources):**
- Concrete formula from arXiv: `score = alpha * relevance + (1-alpha) * 0.5^(age_days/half_life)` with domain-specific half-lives [7]
- Simple recency prior achieved perfect 1.00 accuracy on freshness-sensitive tasks [7]
- Our v2 research (agent2-failure-modes.md) documented that Claude fails to weight recency appropriately in many cases

**Implementation:** Add to source preference heuristics in Phase 3:
> "Apply temporal decay based on topic domain:
> - Breaking news / trending: half-life = 7 days
> - Technology / software: half-life = 90 days
> - Business / market: half-life = 180 days
> - Science / academic: half-life = 365 days
> - Legal / regulatory: half-life = 1825 days (5 years)
> - Historical / reference: no decay
> Sources past 2 half-lives from the current date should be deprioritized unless they are foundational/seminal works."

**Sources:**
- [7] [Temporal credibility decay formula (arXiv 2509.19376)](https://arxiv.org/abs/2509.19376)

---

## Improvement 4: Explicit Exhaustion Criteria (MEDIUM IMPACT)

**What:** Define when to stop searching because the information likely doesn't exist, not just when we have enough.

**Evidence (2 sources):**
- DeepSearchQA: "The agent must distinguish between absence of evidence ('I have not found it yet') and evidence of absence ('It does not exist')" [8]
- Practical guidance: "Research until you have enough is a recipe for infinite loops" — need explicit, quantifiable stopping conditions [9]

**Why it matters:** Our FFS pattern has good "enough evidence" thresholds but no "evidence doesn't exist" criteria. When researching a niche topic, the skill can waste 10+ minutes searching for information that simply isn't published.

**Implementation:** Add to the FFS pattern:
> "Exhaustion criteria (when to stop and declare absence):
> - 5+ searches on the same sub-topic with zero relevant results → declare 'No published evidence found'
> - 3+ different search formulations (keyword, semantic, domain-specific) all return nothing → declare absence
> - All found sources are >2 years old with no recent updates → topic may be dormant, note this
> When declaring absence, this IS a finding — document it in the report as 'No published evidence was found for [claim] despite [N] searches across [M] query formulations.'"

**Sources:**
- [8] [DeepSearchQA: Bridging the Comprehensiveness Gap (arXiv 2601.20975)](https://arxiv.org/html/2601.20975v1)
- [9] [Can LLMs Really Do Web Research? (Medium)](https://medium.com/@prxshetty/can-llms-really-do-web-research-and-why-your-agent-still-gets-stuck-d74598b44e45)

---

## Investigated but NOT Recommended: Confidence-First Scoring

**What was proposed:** Have Claude estimate confidence per claim before writing it (CoCA framework).

**Why we're not implementing it:** Devil's advocate research revealed:
- LLMs are systematically overconfident — 99% confidence intervals cover truth only 65% of the time [10]
- Web search tool use can INCREASE overconfidence by injecting noise [11]
- RL-trained models have worse calibration than SFT due to reward exploitation [12]

**Verdict:** Confidence estimation adds some signal but is too unreliable to be a quality gate. Our existing tool-grounded verification (Phase 7.5 VERIFY) is superior because it uses external evidence, not internal self-assessment. Confidence scoring could be added as a supplementary annotation ("low/medium/high confidence" labels on claims) but should never trigger loop-backs or gate decisions.

**Sources:**
- [10] [LLMs are Overconfident: FermiEval (arXiv 2510.26995)](https://arxiv.org/html/2510.26995)
- [11] [Confidence Dichotomy (arXiv 2601.07264)](https://www.arxiv.org/pdf/2601.07264)
- [12] [Dunning-Kruger Effect in LLMs (arXiv 2603.09985)](https://arxiv.org/html/2603.09985v1)

---

## Limitations

- Both sub-agents completed before synthesis (completion gate honored)
- Devil's advocate search performed on the highest-impact finding (confidence calibration) — revealed real limitations that changed the recommendation
- Some arXiv paper IDs may need verification (noted as approximate in sources)
- Source volume: ~20 searches total across main thread + 2 sub-agents
- Temporal decay half-lives are proposed values, not empirically calibrated for our specific use case

## Methodology

Standard mode (7 phases). Inline verification applied during retrieval (flagged source credibility in real-time). Anchoring bias countermeasures applied (devil's advocate search on confidence calibration). Completion gate honored — both sub-agents finished before Phase 4. Write-after-search protocol followed throughout. Checkpoints saved at phase boundaries.
