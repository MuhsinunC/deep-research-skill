# Novel Techniques for Improving AI Research Agent Accuracy: A Quick Research Report

**Date:** 2026-03-29
**Mode:** Quick
**Task UUID:** F1150688

---

## Executive Summary

This report identifies six novel academic techniques from 2025-2026 that could improve the accuracy and reliability of a Claude Code deep research skill, beyond what is already implemented. The skill already employs tool-grounded verification (CRITIC-style), source preference heuristics, contradiction resolution, anchoring bias countermeasures, atomic claim screening, inline verification, replanning on contradiction, and write-after-search protocols. We focus exclusively on techniques that are (a) not already implemented, (b) backed by academic research, and (c) expressible as natural-language skill instructions without external API dependencies.

The nine most promising techniques are: **(1) Metacognitive Regulatory Cycling** (Think2), **(2) Uncertainty-Triggered Active Verification** (GLEAN), **(3) Delphi Consensus Verification** (DelphiAgent), **(4) Evidence-Based Minority Selection** (AgentAuditor), **(5) Argumentation-Framework Claim Assessment** (QBAF), **(6) Capability Calibration for Query Routing**, **(7) Redundancy-Aware Source Independence Detection** (IMRRF), **(8) High-Confidence Hallucination Vigilance**, and **(9) Contrastive Question Generation** (KG-CRAFT). Each could be encoded as skill instructions and would address different failure modes in the current pipeline.

---

## Introduction

### Scope and Methodology

This research was prompted by the need to identify the next generation of accuracy improvements for a deep research skill that has already reached v4 maturity. The skill runs as a background `claude -p` instance with full sub-agent capabilities, prioritizing accuracy over speed.

**Research questions:**
1. What academic techniques for improving AI agent factual accuracy have emerged in early 2026 that could be adopted as skill instructions?
2. Are there new approaches to multi-source verification that go beyond the current Decompose-Retrieve-Verify pattern?

**Method:** Parallel web searches across 6 query vectors (factual accuracy techniques, multi-source verification, self-correction methods, calibration/confidence, RAG improvements, claim verification papers), supplemented by 2 background sub-agents for academic deep-dives. Sources prioritized: arxiv papers, ACL/EMNLP proceedings, established research institutions.

**Already implemented (excluded from findings):** Tool-grounded verification, source preference heuristics, contradiction resolution protocol, anchoring bias countermeasures (devil's advocate searches), atomic claim screening (Spark-to-Fire), inline verification (MiroThinker-inspired), replanning on contradiction, progress reporting, checkpoints, write-after-search protocol.

---

## Finding 1: Metacognitive Regulatory Cycling (Think2)

**Source:** "Think²: Grounded Metacognitive Reasoning in Large Language Models" (arxiv 2602.18806, February 2026) [1]

**Technique:** Think2 operationalizes Ann Brown's metacognitive regulatory cycle — **Planning → Monitoring → Evaluation** — as a structured prompting architecture. Unlike standard chain-of-thought which is purely forward-reasoning, Think2 adds a dual-process MetaController that adaptively allocates effort: simple tasks get fast processing while complex/uncertain tasks trigger deeper regulatory cycles.

**Results:** 3x improvement in successful self-correction across GSM8K, CRUXEval, MBPP, AIME, CorrectBench, and TruthfulQA using Llama-3 and Qwen-3 (8B). 84% human preference for trustworthiness over standard CoT baselines in blinded evaluation of 580 query pairs.

**Why it's novel for the skill:** The current skill has inline verification (checking claims as they arrive) but lacks a structured metacognitive layer that monitors the *quality of the reasoning process itself*. Think2's key insight is that error diagnosis — understanding *why* something is wrong — is more important than error detection. The Planning phase previews likely failure modes before execution, the Monitoring phase watches for them during execution, and the Evaluation phase assesses whether the monitoring caught what it should have.

**Skill instruction translation:**
```
Before each major synthesis step, explicitly:
1. PLAN: "What are the likely error modes for this synthesis?
   (anchoring on first source, conflating correlation/causation,
   overgeneralizing from single domain)"
2. MONITOR: During synthesis, check against planned error modes.
   If any trigger fires, stop and re-examine the specific claim.
3. EVALUATE: After synthesis, assess: "Did my monitoring catch
   anything? If not, is that because the synthesis was clean,
   or because I missed a failure mode?"
```

**Addresses failure mode:** Synthesis-level errors that pass atomic claim screening because individual claims are correct but their combination is misleading.

---

## Finding 2: Uncertainty-Triggered Active Verification (GLEAN)

**Source:** "Guideline-Grounded Evidence Accumulation for High-Stakes Agent Verification" (arxiv 2603.02798, March 2026) [2]

**Technique:** GLEAN introduces *uncertainty-triggered active verification*: rather than verifying all claims equally (current approach), it estimates uncertainty per claim using Bayesian logistic regression on step-wise guideline alignment, then **selectively collects additional evidence only for uncertain cases**. This expands guideline coverage and performs differential checks specifically where the model is least confident.

**Results:** AUROC >0.94 and Brier scores <0.10 with active verification across three clinical diagnosis tasks on MIMIC-IV. Surpasses best baseline by 12% AUROC and 50% Brier score reduction.

**Why it's novel for the skill:** The current VERIFY phase (7.5) treats all claims with equal verification effort — it decomposes the report into 10-20 claims and verifies each. GLEAN suggests a more efficient and accurate approach: use initial verification to *estimate uncertainty*, then spend additional verification budget on the claims that are most uncertain. This is both more efficient (less work on obvious claims) and more accurate (more work on shaky claims).

**Skill instruction translation:**
```
In Phase 7.5 VERIFY, after the first pass of claim verification:
1. Score each claim's uncertainty (VERIFIED=low, QUESTIONABLE=medium,
   UNVERIFIABLE/CONTRADICTED=high)
2. For HIGH uncertainty claims: launch targeted sub-agents to find
   2-3 ADDITIONAL sources specifically for that claim (not just
   re-checking the original source)
3. For LOW uncertainty claims: accept and move on
4. This replaces the current uniform treatment where all claims
   get equal verification effort
```

**Addresses failure mode:** Wasted verification budget on obvious claims while under-verifying the shaky ones.

---

## Finding 3: Delphi Consensus Verification (DelphiAgent)

**Source:** "DelphiAgent: A trustworthy multi-agent verification framework for automated fact verification" (ScienceDirect, Information Processing & Management, 2025) [3]

**Technique:** Inspired by the Delphi method from social science, DelphiAgent creates multiple LLM-based agents with **distinct personalities** who make independent factuality judgments on the same claim. Critically, agents are "anonymous" to each other (preventing groupthink), and consensus is reached through multiple rounds of feedback and synthesis — not majority vote.

**Results:** Up to 6.84% macF1 improvement on RAWFC dataset over existing LLM approaches. Comparable to supervised baselines without requiring training.

**Why it's novel for the skill:** The current skill uses a single verification pathway (decompose → fetch source → check entailment). DelphiAgent suggests that verification can be improved by having multiple "perspectives" assess the same claim independently. This is different from the existing devil's advocate searches (which seek contradictory evidence) — it's about having multiple *reasoning approaches* assess the same evidence.

**Skill instruction translation:**
```
For the 5 most critical claims in the report (conclusions,
quantitative claims, causal claims), apply Delphi verification:
1. Assess the claim from 3 distinct perspectives:
   - "Skeptical Practitioner": Would someone doing this daily trust this?
   - "Methodological Critic": Is the evidence methodology sound?
   - "Domain Expert": Does this align with established domain knowledge?
2. Each perspective makes an independent judgment (Supported/Unsupported/Uncertain)
3. If all 3 agree: high confidence
4. If 2/3 agree: medium confidence, note the dissent
5. If no majority: flag as contested, present all perspectives in report
```

**Note:** The skill already has persona-based critique in Phase 6 (CRITIQUE), but that's for evaluating the *report as a whole*. This is for verifying *individual claims*. The two are complementary.

**Addresses failure mode:** Single-perspective verification bias — a claim can pass tool-grounded verification but still be misleading from a domain-expert perspective.

---

## Finding 4: Evidence-Based Minority Selection (AgentAuditor)

**Source:** "Auditing Multi-Agent LLM Reasoning Trees" (arxiv 2602.09341, February 2026) [4]

**Technique:** AgentAuditor addresses a specific failure mode of majority-vote systems: when the *correct answer is held by the minority*. Instead of frequency-based selection (pick the most common answer), it audits localized branch evidence on a reasoning tree to select the answer with the **strongest supporting evidence**, even if fewer agents reached it.

**Why it's novel for the skill:** When multiple sub-agents return conflicting findings during retrieval (Phase 3), the current contradiction resolution protocol uses source credibility + recency + tiebreaker to resolve. AgentAuditor adds the principle that *evidence quality trumps evidence quantity*. Two sources with strong direct evidence should outweigh five sources with indirect/circumstantial evidence.

**Skill instruction translation:**
```
When resolving contradictions in Phase 4 TRIANGULATE:
- Do NOT default to majority position
- Audit the EVIDENCE QUALITY behind each position:
  * Direct measurement/observation > Indirect inference
  * Primary source > Secondary source citing primary
  * Specific claim with methodology > General assertion
- The position with stronger evidence wins, even if fewer
  sources hold it
- Document: "Position A held by 4 sources with indirect evidence;
  Position B held by 2 sources with direct measurement.
  Position B adopted based on evidence quality."
```

**Addresses failure mode:** Majority-rules bias in contradiction resolution, where more sources doesn't mean better evidence.

---

## Finding 5: Argumentation-Framework Claim Assessment (QBAF)

**Source:** "Retrieval- and Argumentation-Enhanced Multi-Agent LLMs for Judgmental Forecasting" (arxiv 2510.24303, 2025) [5]

**Technique:** Different agents bring evidence FOR and AGAINST claims, structured as **Quantitative Bipolar Argumentation Frameworks (QBAFs)**. Each piece of evidence is assigned a numerical strength, and the framework formally computes the resulting support/attack balance. This is more rigorous than informal "weighing" of evidence because the aggregation follows formal argumentation semantics.

**Why it's novel for the skill:** The current skill resolves contradictions informally (compare credibility, check recency, seek tiebreaker). QBAF suggests formalizing this: explicitly list evidence FOR and AGAINST each contested claim with numeric weights, then compute the balance. This makes the reasoning transparent and auditable.

**Skill instruction translation:**
```
For contested claims (where contradiction resolution finds
genuine disagreement):
1. List all evidence FOR the claim with weight (0-1 based on
   source credibility score / 100)
2. List all evidence AGAINST with weight
3. Sum weighted FOR vs weighted AGAINST
4. If FOR > AGAINST by >0.3: adopt the claim
5. If difference < 0.3: label as genuinely contested
6. Include the for/against table in the report's methodology appendix
```

**Addresses failure mode:** Opaque contradiction resolution where the reader can't see why one position was favored.

---

## Finding 6: Capability Calibration for Query Routing

**Source:** Capability Calibration Framework (March 2026), reported via Appier research [6]; supported by "Towards a Science of AI Agent Reliability" (arxiv 2602.16666) [7]

**Technique:** Rather than assessing confidence per individual response, Capability Calibration evaluates the model's expected success rate for a given *query type*. This enables routing: queries the model is likely to handle poorly can be flagged for extra verification upfront, rather than discovering the failure during post-hoc verification.

**Why it's novel for the skill:** The current skill applies uniform rigor to all research questions. Capability Calibration suggests that some query types (quantitative claims about recent events, niche technical details, claims about non-English sources) are systematically more error-prone and should trigger enhanced verification from the start — not just when errors are found later.

**Skill instruction translation:**
```
At the start of Phase 1 SCOPE, classify the research question's
difficulty profile:
- HIGH error risk: Recent quantitative data, rapidly-evolving topics,
  niche technical claims, non-English primary sources
- MEDIUM error risk: Established technology comparisons, well-documented
  topics with active debate
- LOW error risk: Historical facts, widely-documented standards,
  well-established consensus

For HIGH risk topics: automatically upgrade verification depth
(e.g., quick mode → standard verification rigor; standard → deep)
For LOW risk topics: can streamline verification without accuracy loss
```

**Addresses failure mode:** Uniform verification effort regardless of topic difficulty, leading to under-verification of hard topics and over-verification of easy ones.

---

## Finding 7: Redundancy-Aware Source Independence Detection (IMRRF)

**Source:** "IMRRF: Integrating Multi-Source Retrieval and Redundancy Filtering for LLM-based Fake News Detection." Li et al., NAACL 2025. [13]

**Technique:** IMRRF identifies a critical blind spot in multi-source verification: **redundant sources that merely restate the same upstream claim are not independent confirmations**. The framework retrieves from multiple knowledge sources, then applies a Redundant Information Filtering strategy to strip out repetitive evidence before reasoning. This prevents the "echo chamber" effect where the same original claim, repeated across 5 derivative sources, creates false confidence.

**Why it's novel for the skill:** The current atomic claim screening requires "2+ INDEPENDENT sources" but provides no guidance on how to detect independence. Three blog posts all citing the same press release are not three independent confirmations — they're one. IMRRF provides the principle: filter redundant evidence before counting confirmations.

**Skill instruction translation:**
```
When counting independent source confirmations in Phase 4
TRIANGULATE and Phase 5 SYNTHESIZE:
1. Check whether sources cite EACH OTHER or a common upstream source
2. If Source B quotes/paraphrases Source A, count them as ONE
   confirmation, not two
3. Look for: identical phrasing, matching unique details, explicit
   citations between sources
4. Only count sources as independent if they appear to have
   gathered information separately (different methodology,
   different dates, different primary data)
5. Update the atomic claim screening threshold accordingly:
   "2+ independent sources" means 2+ sources with independent
   evidence chains, not 2+ URLs
```

**Addresses failure mode:** False confidence from echo-chamber evidence where derivative sources all trace to one original.

---

## Finding 8: High-Confidence Hallucination Vigilance

**Source:** "Hallucination Detection and Mitigation in Large Language Models." arxiv 2601.09929, 2026. [14] Supported by SUScore (Springer, 2025) [15] and behaviorally calibrated RL (arxiv 2512.19920, 2025) [16].

**Technique:** A 2026 survey establishes that **high-confidence hallucinations are the hardest failure mode** — when the model generates specific, detailed claims with no hedging, but the claims are wrong. Traditional entropy-based uncertainty detection fails here because the model *is* confident. SUScore (Substantive-Word Uncertainty Score) addresses this by quantifying uncertainty specifically over semantically important tokens (names, numbers, dates, causal claims) rather than function words, then performing targeted re-verification of those high-risk spans.

**Why it's novel for the skill:** The current skill has no mechanism for detecting high-confidence hallucinations. The inline verification catches claims that *seem* wrong, and the VERIFY phase checks claims against cited sources. But a confidently-stated claim that was never retrieved from any source — generated purely from training data — can slip through both gates. The antidote is specifically flagging detailed/specific claims that lack a corresponding source citation.

**Skill instruction translation:**
```
During Phase 5 SYNTHESIZE and Phase 7.5 VERIFY:
1. Identify claims that are SPECIFIC and DETAILED (exact numbers,
   dates, names, percentages, causal mechanisms)
2. For each, check: does this claim have a CITED SOURCE?
3. If a specific/detailed claim has NO citation: this is a
   HIGH-CONFIDENCE HALLUCINATION RISK. Either:
   a. Find a source and add it, OR
   b. Soften to a general statement, OR
   c. Remove entirely
4. The more specific and confident a claim feels, the MORE
   suspicious you should be if it lacks a source
```

**Addresses failure mode:** Confidently-stated fabrications that feel true but were generated from training data rather than retrieved evidence.

---

## Finding 9: Contrastive Question Generation (KG-CRAFT)

**Source:** "KG-CRAFT: Knowledge Graph-based Contrastive Reasoning with LLMs for Enhancing Automated Fact-checking." Lourenço et al., arxiv 2601.19447, 2026. [17]

**Technique:** For each claim, KG-CRAFT generates a **contrastive question**: "What would be true if this claim were false?" This inverts the claim and searches for evidence of the negation. The method achieves new SOTA on LIAR-RAW and RAWFC benchmarks. The insight is that searching for evidence *against* a claim (not just *for* it) is more effective at catching errors than searching for additional confirming evidence.

**Why it's novel for the skill:** The current skill has devil's advocate searches that look for general criticism of the topic. KG-CRAFT is more targeted: for each *specific claim*, it generates the negation and searches for that. "The API supports 10K requests/second" → search for "API rate limit lower than 10000" or "API throughput limitations." This is more precise than the current "topic + criticism" searches.

**Skill instruction translation:**
```
During Phase 4 TRIANGULATE, for each quantitative or causal claim:
1. Generate the NEGATION: "What if [claim] is wrong? What would
   the alternative be?"
2. Search specifically for the negation/alternative
3. If negation evidence is found: apply contradiction resolution
4. If no negation evidence found: increased confidence in claim
This is MORE TARGETED than devil's advocate searches — it inverts
specific claims rather than searching for general criticism.
```

**Addresses failure mode:** Claims that survive general criticism searches because the criticism targets the topic broadly, not the specific claim.

---

## Synthesis: How These Techniques Layer Together

These six techniques address different stages of the research pipeline and different failure modes:

| # | Technique | Pipeline Stage | Failure Mode Addressed |
|---|-----------|---------------|----------------------|
| 7 | Redundancy Detection (IMRRF) | TRIANGULATE | Echo-chamber false confidence |
| 8 | High-Confidence Hallucination Vigilance | SYNTHESIZE, VERIFY | Specific fabrications without sources |
| 9 | Contrastive Question Generation (KG-CRAFT) | TRIANGULATE | Claims surviving general criticism |
| 6 | Capability Calibration | SCOPE | Uniform rigor regardless of difficulty |
| 2 | Active Verification (GLEAN) | VERIFY | Uniform verification wastes budget |
| 4 | Minority Selection (AgentAuditor) | TRIANGULATE | Majority-rules contradiction resolution |
| 1 | Metacognitive Cycling (Think2) | SYNTHESIZE | Synthesis-level errors from correct components |
| 5 | QBAF Argumentation | TRIANGULATE | Opaque evidence weighing |
| 3 | Delphi Consensus | VERIFY | Single-perspective verification bias |

**Recommended implementation priority (reordered by impact/effort ratio):**

1. **Redundancy-Aware Source Independence** (IMRRF) — Zero-cost instruction addition to existing atomic claim screening. Fixes a blind spot in "2+ independent sources" requirement.
2. **High-Confidence Hallucination Vigilance** — Zero-cost addition to SYNTHESIZE/VERIFY. Catches the failure mode that existing verification misses entirely.
3. **Contrastive Question Generation** (KG-CRAFT) — Low-cost upgrade to devil's advocate searches. More targeted, more effective.
4. **Capability Calibration** (SCOPE) — A few lines at phase start to modulate verification depth by topic difficulty.
5. **Active Verification** (GLEAN) — Directly improves VERIFY phase efficiency and accuracy.
6. **Evidence-Based Minority Selection** (AgentAuditor) — Enhances contradiction resolution with clear principle.
7. **Metacognitive Cycling** (Think2) — Addresses hardest-to-catch synthesis errors but requires complex instructions.
8. **QBAF Argumentation** — Makes contested claims transparent, useful for report quality in deep/ultradeep modes.
9. **Delphi Consensus** — Most expensive (3x verification for critical claims), save for ultradeep mode.

---

## Supplementary Findings (from sub-agent deep-dives)

Three additional techniques emerged from the background sub-agents that are worth noting as future candidates:

### S1: Abductive Inference for Missing Premise Detection

**Source:** arxiv 2511.04020, November 2025 [23]

Detects when a synthesized conclusion requires an **unstated bridge premise** not present in the evidence. Example: if the report says "X causes Y" but the evidence only shows "X correlates with Y" and "Y follows X temporally," the missing premise is "correlation + temporal sequence = causation" — which is a logical gap. Uses NLI (RoBERTa-MNLI) to check if cited evidence actually entails the conclusion.

**Skill instruction:** "After synthesis, for each causal or comparative conclusion, ask: does this conclusion follow from the cited evidence alone, or does it require an unstated assumption? If an assumption is required, either find evidence for it, state it explicitly, or soften the conclusion."

### S2: Temporal Decay Weighting for Source Conflicts

**Source:** MemOS (2025) [24]; Epistemic Calibration surveys (2025)

When two sources disagree, the disagreement may reflect **temporal drift** (information became outdated) rather than a genuine factual dispute. A 2023 source saying "Company X has 500 employees" and a 2025 source saying "Company X has 800 employees" are not contradicting each other — both may be correct for their time.

**Skill instruction:** "When sources conflict, check publication dates. If the conflict could be explained by the information changing over time (employee counts, prices, feature sets, API versions), treat the most recent source as current truth and the older source as historical. Only flag as a genuine contradiction when temporal drift cannot explain the disagreement."

### S3: Confidence × Consistency Claim Routing

**Source:** "Fact-Checking with LLMs" (arxiv 2601.02574, January 2026) [25]. Up to +12 macro-F1.

A more granular version of GLEAN's uncertainty-triggered verification. Routes claims based on a 2×2 matrix:

| | High Consistency | Low Consistency |
|---|---|---|
| **High Certainty** | Skip (likely correct) | Targeted search (internal conflict) |
| **Low Certainty** | Deep search (uncertain but coherent) | Full multi-source verification |

**Skill instruction:** "In VERIFY phase, classify each claim by certainty (how confident is the evidence?) and consistency (do multiple sources agree?). High-certainty + high-consistency claims need minimal checking. Low-certainty OR low-consistency claims need proportionally more verification."

---

## Limitations & Caveats

- **Quick mode research:** This report used 10 parallel searches and 2 sub-agents over ~5 minutes. A standard/deep mode pass would likely uncover additional techniques.
- **No empirical validation:** These techniques are proposed as skill instructions based on academic results. Their effectiveness when translated to natural-language prompting (rather than the specialized architectures in the papers) is unverified.
- **Overlap with existing features:** Some techniques partially overlap with existing skill features (e.g., Delphi consensus overlaps with persona-based critique). The distinctions are noted but may be smaller in practice than on paper.
- **Publication bias:** Academic papers report positive results. The actual improvement when applied to a Claude-based research agent may differ from reported benchmarks.

---

## Recommendations

**Tier 1 — Implement immediately (zero-cost instruction additions):**
1. **Add source independence detection** to Phase 4/5 atomic claim screening — define what "independent" means (different evidence chains, not just different URLs). [IMRRF]
2. **Add high-confidence hallucination flag** to Phase 5/7.5 — specific/detailed claims without citations are the highest-risk failure mode. [SUScore + Hallucination Survey]
3. **Upgrade devil's advocate searches** with contrastive question generation — negate specific claims and search for the negation, not just general criticism. [KG-CRAFT]

**Tier 2 — Implement next (modest instruction changes):**
4. **Add capability calibration** to Phase 1 SCOPE — classify topic difficulty and modulate verification depth accordingly.
5. **Add uncertainty-triggered active verification** to Phase 7.5 VERIFY — spend more effort on uncertain claims, less on obvious ones. [GLEAN]
6. **Add evidence quality > evidence quantity** principle to Phase 4 contradiction resolution. [AgentAuditor]

**Tier 3 — Implement for deep/ultradeep modes:**
7. **Add metacognitive cycling** to Phase 5 SYNTHESIZE — plan error modes, monitor during synthesis, evaluate after. [Think2]
8. **Add QBAF for/against tables** for contested claims in methodology appendix.
9. **Add Delphi consensus verification** for ultradeep mode's 5 most critical claims.

---

## Bibliography

[1] "Think²: Grounded Metacognitive Reasoning in Large Language Models." arxiv 2602.18806, February 2026. https://arxiv.org/abs/2602.18806

[2] "Guideline-Grounded Evidence Accumulation for High-Stakes Agent Verification (GLEAN)." arxiv 2603.02798, March 2026. https://arxiv.org/abs/2603.02798

[3] "DelphiAgent: A trustworthy multi-agent verification framework for automated fact verification." Information Processing & Management, ScienceDirect, 2025. https://www.sciencedirect.com/science/article/abs/pii/S0306457325001827

[4] "Auditing Multi-Agent LLM Reasoning Trees (AgentAuditor)." arxiv 2602.09341, February 2026. https://arxiv.org/abs/2602.09341

[5] "Retrieval- and Argumentation-Enhanced Multi-Agent LLMs for Judgmental Forecasting." arxiv 2510.24303, 2025. https://arxiv.org/abs/2510.24303

[6] Capability Calibration Framework. Appier, March 2026. https://www.manilatimes.net/2026/03/24/tmt-newswire/pr-newswire/stop-ai-from-guessing-appier-enables-agents-to-assess-confidence-before-acting/2306115

[7] "Towards a Science of AI Agent Reliability." arxiv 2602.16666, February 2026. https://arxiv.org/html/2602.16666v1

[8] "MARCH: Multi-Agent Reinforced Self-Check for LLM Hallucination." arxiv 2603.24579, March 2026. https://arxiv.org/html/2603.24579

[9] "Chain-of-Verification Reduces Hallucination in Large Language Models." ACL Findings 2024. https://arxiv.org/abs/2309.11495

[10] "Multi-LLM Agents Architecture for Claim Verification." CEUR Workshop Proceedings Vol. 3962, 2025. https://ceur-ws.org/Vol-3962/paper20.pdf

[11] "Can LLMs Correct Themselves? A Benchmark of Self-Correction in LLMs." arxiv 2510.16062, 2025. https://arxiv.org/abs/2510.16062

[12] "FactNet: A Billion-Scale Knowledge Graph for Multilingual Factual Grounding." arxiv 2602.03417, February 2026. https://arxiv.org/abs/2602.03417

[13] "IMRRF: Integrating Multi-Source Retrieval and Redundancy Filtering for LLM-based Fake News Detection." Li et al., NAACL 2025. https://aclanthology.org/2025.naacl-long.461

[14] "Hallucination Detection and Mitigation in Large Language Models." arxiv 2601.09929, 2026. https://arxiv.org/abs/2601.09929

[15] "Detecting and Correcting Hallucinations in LLMs via Substantive Uncertainty and Iterative Validation (SUScore)." Springer, 2025. https://link.springer.com/chapter/10.1007/978-981-95-3352-7_14

[16] "Mitigating LLM Hallucination via Behaviorally Calibrated Reinforcement Learning." arxiv 2512.19920, 2025. https://arxiv.org/abs/2512.19920

[17] "KG-CRAFT: Knowledge Graph-based Contrastive Reasoning with LLMs for Enhancing Automated Fact-checking." Lourenço et al., arxiv 2601.19447, 2026. https://arxiv.org/abs/2601.19447

[18] "PrefixNLI: Detecting Factual Inconsistencies as Soon as They Arise." arxiv 2511.01359, 2025. https://arxiv.org/abs/2511.01359

[19] "Tool-MAD: Multi-Agent Debate Framework for Fact Verification with Diverse Tool Augmentation." arxiv 2601.04742, 2026. https://arxiv.org/abs/2601.04742

[20] "MAD-Fact: Multi-Agent Debate Framework for Long-Form Factuality Evaluation." arxiv 2510.22967, 2025. https://arxiv.org/abs/2510.22967

[21] "GraphCheck: Breaking Long-Term Text Barriers with Extracted Knowledge Graph-Powered Fact-Checking." Chen et al., ACL 2025. https://arxiv.org/abs/2502.16514

[22] "ClaimCheck: Real-Time Fact-Checking with Small Language Models." Putta et al., arxiv 2510.01226, 2025. https://arxiv.org/abs/2510.01226

[23] "Abductive Inference for Missing Premise Detection." arxiv 2511.04020, November 2025. https://arxiv.org/abs/2511.04020

[24] "MemOS: An Operating System for LLM Memory." MemTensor, July 2025. https://statics.memtensor.com.cn/files/MemOS_0707.pdf

[25] "Fact-Checking with Large Language Models (Confidence-Guided Search)." arxiv 2601.02574, January 2026. https://arxiv.org/abs/2601.02574

[26] "GhostCite: Citation Validity at Scale." arxiv 2602.06718, February 2026. https://arxiv.org/abs/2602.06718

[27] "CARE-RAG: Conflict-Aware and Reliable Evidence for RAG." arxiv 2507.01281, July 2025. https://arxiv.org/abs/2507.01281

[28] "EvidenceRL: Reinforcement Learning for Evidence Consistency." arxiv 2603.19532, March 2026. https://arxiv.org/abs/2603.19532

---

## Methodology Appendix

**Mode:** Quick (3 phases: SCOPE → RETRIEVE → PACKAGE)
**Duration:** ~8 minutes
**Search vectors:** 6 parallel web searches + 4 targeted follow-ups + 2 background sub-agents
**Sources gathered:** 28 unique academic sources
**Source types:** arxiv preprints (19), journal articles (4), conference proceedings (3), industry research (2)
**Avg credibility:** ~78/100 (majority arxiv + peer-reviewed)
**Coverage:** Factual accuracy, multi-source verification, self-correction, calibration, RAG improvements, claim verification, redundancy detection, evidence graphs, adversarial debate
