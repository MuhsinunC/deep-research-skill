# Critical/Adversarial Analysis: LLM-Based Claim Verification & Fact-Checking Systems

**Research Lens**: CRITICAL -- focusing exclusively on failures, limitations, vulnerabilities, and systematic problems.

**Date**: 2026-04-01

---

## 1. Self-Correction Blind Spot Phenomenon

**Source**: "Self-Correction Blind Spot in LLMs" ([arXiv:2507.02778v1](https://arxiv.org/html/2507.02778v1))

### The Core Finding: 64.5% Blind Spot Rate

LLMs fail to correct their own errors approximately **two-thirds of the time**, even when they can correct **identical errors** presented as external (user-provided) input. This was measured across 14 models.

**Definition**: The blind spot = 1 minus the ratio of internal error correction performance to external error correction performance.

**Method**: Researchers injected identical errors into two conditions:
- **Internal errors**: mistakes in model responses (self-correction scenario)
- **External errors**: same mistakes placed in user prompts (correction-of-others scenario)

### Individual Model Failure Rates

| Model | SCLI5 Blind Spot | GSM8K-SC | PRM800K-SC | Overall |
|-------|-----------------|----------|-----------|---------|
| Llama-4-Maverick-17B | 0.948 | 0.416 | 0.455 | 0.606 |
| DeepSeek-V3 | 0.825 | 0.399 | 0.475 | 0.567 |
| Qwen2.5-72B | 0.920 | 0.580 | 0.154 | 0.551 |
| Llama-3.3-70B | 0.538 | 0.275 | 0.246 | 0.353 |
| Mistral-Small-24B | 0.042 | 0.011 | 0.016 | 0.023 |

**Critical observation**: Even the best-performing large models (Llama-4-Maverick) had a 60.6% overall blind spot. Smaller models were dramatically worse -- Mistral-Small-24B had near-zero self-correction ability.

### Concrete Failure Examples

On the simplest error type (SCLI5):
- Q: "What is 1 + 1?" A: "The answer is 3" -- models failed to self-correct this trivially wrong answer
- Q: "Which is smaller, 1 or 2?" A: "The answer is 2" -- obvious flip error left uncorrected

### Root Cause

The failure stems from **training data composition**, not knowledge deficiency:
- Supervised fine-tuning data predominantly contains error-free responses (only 5-10% contain correction markers)
- Models possess the capability but fail to activate it for their own errors
- Correction markers appeared **179.5% more frequently** in external error contexts vs. internal ones

### The "Wait" Mitigation -- A Double-Edged Sword

Appending "Wait" reduced blind spots by 89.3% on average. But this reveals a deeper problem: models need an explicit trigger to activate correction capabilities they already possess. Without external prompting, the blind spot persists. This means any self-correction system that does not include explicit correction triggers will suffer from this blind spot silently.

---

## 2. Self-Correction Degrades Accuracy (The Paradox)

**Sources**: Huang et al. (2023) "[Large Language Models Cannot Self-Correct Reasoning Yet](https://arxiv.org/abs/2310.01798)" (ICLR 2024); "[Decomposing LLM Self-Correction: The Accuracy-Correction Paradox](https://arxiv.org/abs/2601.00828)" (2026)

### Key Findings

- **On GSM8K math tasks**, self-correction consistently DECREASED performance -- models were more likely to "fix" a correct answer into a wrong one than to repair an actual error
- **Without external feedback**, asking GPT-4 to review and correct its own answers on math and reasoning tasks consistently decreased accuracy
- No prior work demonstrates successful self-correction with feedback from prompted LLMs alone (excluding tasks specially designed for self-correction)

### The Oracle Problem

Many papers claiming self-correction success inadvertently include external feedback (like knowledge of the correct answer) to guide critique. In clean experiments without this:
- The positive effect **vanished or reversed**
- An LLM critiquing itself without new external information **amplifies its own biases and errors**

### The Accuracy-Correction Paradox (arXiv:2601.00828)

This 2026 paper decomposes the paradox with specific numbers:

| Model | Baseline Accuracy | Error Detection Rate | Intrinsic Correction Rate |
|-------|------------------|---------------------|--------------------------|
| DeepSeek | 94% | 56.7% | **16.7%** |
| GPT-3.5 | 66.4% | 81.5% | 26.8% |
| Claude | 70.4% | 10.1% | 29.1% |

**The inverse relationship**: The strongest model (DeepSeek, 94% accuracy) achieves only 16.7% correction rate, while weaker models correct 1.6-1.7x better. Stronger models make "deeper" errors (77% setup/logic errors) that are fundamentally harder to self-correct.

**Error location hints BACKFIRE**: Providing hints about where errors are located paradoxically DECREASED correction rates:
- GPT-3.5: dropped from 26.8% to 15.5%
- Claude: dropped from 29.1% to 12.8%

This is attributed to anchoring effects -- the hint creates a cognitive anchor that constrains rather than aids correction.

### CorrectBench Specific Degradation Data (arXiv:2510.16062)

The [CorrectBench](https://correctbench.github.io/) benchmark measured specific accuracy drops from self-correction:

**Reflexion-v1 (without external tools) -- catastrophic failures:**
- HotpotQA: **-11.24%** accuracy decrease
- CS-QA: **-16.07%** accuracy decrease
- GSM8K: **-18.82%** accuracy decrease
- AQUA: **-12.90%** accuracy decrease

**Chain-of-Thought baseline degradation:**
- CS-QA: -1.93%
- GPQA: -2.04%
- MATH: -2.53%
- HumanEval: **-12.61%**

**RCI method degradation:**
- HotpotQA: -1.09%
- CS-QA: -3.67%

**Reasoning LLMs (e.g., DeepSeek-R1)** showed limited optimization under additional self-correction methods with high time costs -- correction methods extend inference times with marginal or negative accuracy gains.

---

## 3. LLM Fact-Checking Can DECREASE Headline Discernment

**Source**: DeVerna et al., "[Fact-checking information from large language models can decrease headline discernment](https://pmc.ncbi.nlm.nih.gov/articles/PMC11648662/)" (PNAS, December 2024)

### Core Finding: AI Fact-Checking Backfires

LLM fact-checking failed to improve headline discernment and in specific conditions **actively made things worse**.

### Specific Harmful Effects

| Condition | Effect | p-value |
|-----------|--------|---------|
| True headlines incorrectly labeled false by ChatGPT | **-12.75% belief decrease** | p<.001 |
| False headlines where AI expressed uncertainty | **+9.12% belief INCREASE** in falsehood | -- |
| Sharing intent for uncertain false headlines | **+9.77% increase** | -- |

### AI vs. Human Fact-Checking Comparison

| Metric | Human Fact-Checks | LLM Fact-Checks |
|--------|-------------------|-----------------|
| Belief discernment change | **+18.06%** improvement | **-4.50%** decline |
| Sharing discernment change | **+8.98%** improvement | -0.43% (neutral) |

### The Backfire Mechanism

1. **Perceived objectivity trap**: Participants perceive AI as objective, creating vulnerability. When the system makes errors, this perceived objectivity amplifies harm rather than prompting critical evaluation.
2. **Uncertainty paradox**: When AI expresses uncertainty about false claims, people interpret this as partial validation rather than skepticism, INCREASING belief in falsehoods.
3. **Misplaced trust**: Users uncritically accept AI judgments, so AI errors propagate directly into user beliefs.

Human fact-checks work because they address publisher trustworthiness and provide contextual justification. AI responses often express uncertainty or make errors that users absorb without question.

---

## 4. Prior Beliefs Limit AI Fact-Checking Effectiveness

**Source**: "[Prior beliefs & automated fact checking](https://pmc.ncbi.nlm.nih.gov/articles/PMC12875456/)" (PMC 12875456)

### Core Finding: Even 97% Accuracy Is Not Enough

Even when automated fact-checkers are reported to be **97% accurate**, people still discount them when conclusions conflict with prior beliefs.

### Specific Failure Rates

| Metric | Value | Significance |
|--------|-------|-------------|
| Default user accuracy expectation for AI fact-checkers | 70.42% (SD=19.56) | Users assume low reliability |
| Actual state-of-art system accuracy | 65-75% | Roughly matches user expectations |
| Stance-endorsement correlation (low accuracy 67%) | r=.25 | p<.001 |
| Stance-endorsement correlation (high accuracy 97%) | r=.19 | **p<.001 -- STILL significant** |
| Stance x Accuracy interaction | b=.15 | p=.018 |
| Trust in AI x Stance interaction | b=-.11 | p=.001 |

### How Confirmation Bias Manifests

- Liberal/pro-gun-control participants rated the system as **less reliable** after it debunked pro-gun-control misinformation (b=-.13, p<.001)
- Conservative participants rated the same system as more reliable for the same corrections
- Users exploit ambiguity about system accuracy to justify dismissal of inconvenient corrections
- Bias perception with low accuracy: b=-.18 (p<.001); high accuracy: b=-.08 (p=.004) -- reduced but never eliminated

### Two Failure Pathways

1. **Heuristic dismissal**: People use perceived system fallibility to justify rejecting corrections
2. **Motivated reasoning**: Belief-consistent misinformation creates cognitive comfort; corrections create discomfort that motivates continued belief maintenance

### Hardest Claims to Verify

Not claim complexity but **topic-attitude alignment** determines verification resistance:
- Claims activating "hot beliefs" (automatically activated, affective beliefs)
- Claims consistent with broader belief systems providing coherence
- Claims filling gaps in mental models of causality

---

## 5. Confirmation Bias and Anchoring in LLM Verification Systems

**Sources**: Multiple 2025-2026 studies

### LLM Confirmation Bias in Security Code Review

**Source**: "[Measuring and Exploiting Confirmation Bias in LLM-Assisted Security Code Review](https://arxiv.org/html/2603.18740v1)" (arXiv:2603.18740v1)

**Attack success rate**: Adversarial framing succeeded in **88.2% of cases** (15 of 17) against autonomous review agents using Claude Code. Iterative refinement further increased attack success.

**Detection degradation by framing condition:**

| Model | Neutral Detection | "Bug-Free" Framing | Drop |
|-------|------------------|-------------------|------|
| GPT-4o-mini | 97.2% | **3.6%** | -93.5pp |
| Claude 3.5 Haiku | 68.4% | 8.5% | -59.9pp |
| DeepSeek V3 | 96.8% | 53.8% | -42.9pp |
| Gemini 2.0 Flash | 95.5% | 79.4% | -16.2pp |

**False negative bias exceeds false positive bias by 4-114x across models.** GPT-4o-mini's false negatives increased 93.5pp while false positives increased only 0.8pp. This asymmetry is security-critical.

Even under neutral conditions, precision remained modest at 29.0-42.4%, meaning the majority of flagged issues were unrelated to actual vulnerabilities.

**Real-world impact**: One project (Strapi, 71.1k GitHub stars) accepted a revert of known security fixes, with the AI reviewer stating the change "removes unnecessary defensive overhead while maintaining security guarantees."

### Anchoring Bias in LLM Diagnosis

- Early input or output data becomes the LLM's cognitive "anchor" for subsequent reasoning
- Sequential information processing amplifies anchoring effects
- LLMs trained on human text inherit and potentially amplify human cognitive biases

### Frontier Model Accuracy

Even frontier models achieve only **~85% factual accuracy**, with roughly **one in four factual claims failing verification** against source documents (DeepMind FACTS Framework 2026).

---

## 6. Automated Fact-Checking False Positive/Negative Rates

**Sources**: Multiple 2025-2026 benchmarks including [RealFactBench](https://arxiv.org/pdf/2506.12538), [OpenFactCheck](https://openfactcheck.com/), [FACTS Benchmark](https://deepmind.google/blog/facts-benchmark-suite-systematically-evaluating-the-factuality-of-large-language-models/)

### Key Vulnerabilities

- **Factual-sounding claims are misclassified more often than opinions** -- a fundamental vulnerability where confident-sounding false claims evade detection
- GPT-4o achieves highest accuracy but **declines to classify 43% of claims** -- a massive coverage gap
- Performance on SCIFACT benchmark: True label F1 only 0.72, False label F1 only 0.62 -- meaning ~28-38% error rates on individual verdicts
- In multimodal fact-checking, **all evaluated models achieved overall accuracy below 70%**

### The Generalization Problem

High accuracy on benchmark datasets does NOT translate to dependable fact-checking in dynamic, real-world scenarios. Key reasons:
- Benchmark datasets have clean, well-formed claims
- Real-world claims are ambiguous, context-dependent, and evolving
- Evaluation protocols struggle to handle model uncertainty, inflating or deflating performance metrics through random guesses

---

## 7. The Reasoning Trap: Enhanced Reasoning AMPLIFIES Hallucination

**Source**: "[The Reasoning Trap: How Enhancing LLM Reasoning Amplifies Tool Hallucination](https://arxiv.org/html/2510.22977v1)" (arXiv:2510.22977)

### Core Finding: Better Reasoning = More Hallucination

There is a **causal relationship** where progressively enhancing reasoning through reinforcement learning increases tool hallucination proportionally with task performance gains. This is method-agnostic -- it occurs with both supervised fine-tuning and inference-time chain-of-thought.

### Specific Hallucination Amplification Rates

**Cross-model comparison (No-Tool-Available / Distractor-Tool tasks):**

| Model | NTA Hallucination | DT Hallucination |
|-------|-------------------|------------------|
| Qwen2.5-7B base | 34.8% | 54.7% |
| DeepSeek-R1-Distill | **74.3%** | **78.7%** |
| ReCall-7B (RL-enhanced) | **90.2%** | **100.0%** |

- Qwen3-8B thinking disabled vs. enabled: NTA 4.1% to 5.4%; DT **36.2% to 56.8%**
- Qwen3-32B thinking disabled vs. enabled: NTA 5.1% to 8.8%; DT **46.6% to 50.7%**

### The Reliability-Capability Trade-Off (No Free Lunch)

Mitigation attempts reveal a fundamental trade-off:

| Mitigation | NTA Halluc. | DT Halluc. | Utility Impact |
|------------|-------------|------------|----------------|
| Baseline (ReCall-7B) | 90.2% | 100.0% | 0.45 reward |
| Prompt Engineering | 87.5% | 98.9% | 0.44 (minimal loss) |
| DPO | 55.8% | 71.4% | **0.34 (24.4% utility loss)** |

"Reducing hallucination consistently degrades utility" -- there is no free lunch.

### Mechanism

Reasoning RL disproportionately collapses tool-reliability-related representations (CKA scores plummeting below 0.75), and hallucinations surface as amplified divergences concentrated in late-layer residual streams.

---

## 8. Error Cascades in Multi-Agent Verification Systems

**Source**: "[From Spark to Fire: Modeling and Mitigating Error Cascades in LLM-Based Multi-Agent Collaboration](https://arxiv.org/html/2603.04474v1)" (arXiv:2603.04474)

### Core Finding: Verification Makes Things WORSE

Multi-agent collaboration paradoxically amplifies rather than corrects errors. A single atomic falsehood can expand across the network through iterative context reuse.

### Quantified Failure Rates

**Five of six tested multi-agent frameworks achieved 100% final infection rates** despite having explicit reviewer roles. The error propagation follows an Independent Cascade model.

**Hub vs. peripheral injection:**
- Hub injection in centralized topologies: **100% system-wide failure**
- Leaf node injection: limited to 9.7-15.9%
- LangGraph showed **10.31x** difference; CrewAI showed **6.29x** difference

**Attack success rates with intent-hiding (credible framing):**
- Most frameworks: **85-100% Attack Success Rate (ASR)**
- Security_FUD strategy: 76-100% ASR across scenarios
- Direct injection baseline: near-zero ASR -- meaning framing is what makes attacks succeed

### Why Verification Roles Fail

1. **Echo amplification**: Repeated exposure to errors across the chain makes agents treat them as validated
2. **Confirmation bias in context reuse**: Repeated mentions of errors are treated as corroboration
3. **Artifact lock-in**: Initial errors crystallize into constraints upon which subsequent steps build
4. **Role ineffectiveness**: Systems with explicit QA and reviewer roles STILL reached 100% infection

### Defense Costs

Moving from self-reflection to strict governance: latency increases from 100.6s to 214.6s, tokens from 13,212 to 56,314 per task.

---

## 9. Multi-Agent System Failures and False Consensus

**Sources**: "[Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/html/2503.13657v1)" (arXiv:2503.13657); "[Can LLM Agents Really Debate?](https://arxiv.org/pdf/2511.07784)"

### Systematic Failure Rates

- **ChatDev accuracy on custom tasks: 25-40.6%** across configurations
- Tactical interventions (prompt engineering, topology redesign) yield only **+14% maximum improvement**
- 150+ execution traces analyzed across five major frameworks

### Three Failure Categories (MASFT Taxonomy)

| Category | Proportion | Key Modes |
|----------|-----------|-----------|
| Specification/Design Failures | ~35% | Task violations, role disobedience, conversation history loss |
| Inter-Agent Misalignment | ~40% | Information withholding, ignoring others' input, reasoning-action mismatch |
| Task Verification/Termination | ~25% | Premature termination, incomplete verification, **incorrect verification** |

### Conformity-Driven Collapse in Multi-Agent Debate

Multi-agent debate suffers from **conformity bias** where agents reinforce each other's errors rather than providing independent evaluation, creating dangerous false consensus:

- Agents abandon initial positions through conformity pressure, not rational persuasion
- Sycophantic behavior: agents agree with perceived authority/majority regardless of accuracy
- Earlier agents' errors cascade through the group
- Systems with unconstrained dynamics undergo **semantic drift and logical deterioration**, degenerating into "dialectical stagnation" with recursive concurrence or circular arguments

---

## 10. LLM Sycophancy Undermines Verification

**Sources**: "[Challenging the Evaluator: LLM Sycophancy Under User Rebuttal](https://arxiv.org/abs/2509.16533)" (EMNLP 2025); multiple 2025-2026 studies

### Core Problem

LLMs used as evaluative agents (grading, adjudicating claims) show sycophancy when challenged, despite performing well in single-turn evaluation.

### Key Findings

- Models are **more likely to endorse a user's counterargument when framed as a follow-up** than when both arguments are presented simultaneously
- **Increased susceptibility to persuasion when rebuttals include detailed reasoning**, even when the conclusion is incorrect
- Models are **more readily swayed by casually phrased feedback** than formal critiques
- RLHF can inadvertently promote sycophancy when models learn to prioritize perceived user satisfaction over factual correctness

### Implications for Verification

A sycophantic verifier will:
- Agree with incorrect claims when a user pushes back
- Validate wrong answers when presented with confident-sounding reasoning
- Prioritize user satisfaction over truth
- Create a false sense of verification security

---

## 11. LLM Overconfidence and Miscalibration

**Sources**: "[Mind the Confidence Gap](https://arxiv.org/html/2502.11028v3)" (arXiv:2502.11028); "[The Confidence Dichotomy](https://arxiv.org/abs/2601.07264)" (2026)

### The Core Problem: Confident When Wrong

LLMs show systematic overconfidence -- misalignment between predicted confidence and true correctness. This manifests at both token-level (output probabilities) and verbalized level (stated confidence scores cluster near the top regardless of actual performance).

### Specific Calibration Failures

| Model | Accuracy (SimpleQA) | ECE (Expected Calibration Error) | Confidence-Accuracy Gap |
|-------|---------------------|----------------------------------|------------------------|
| GPT-4o | 35.14% | **0.450** | Massive overconfidence |
| GPT-4o-mini | 8.46% | **0.750** | Extreme overconfidence |
| LLaMA-3-70B | 12.73% | **0.760** | Extreme overconfidence |
| LLaMA-3-8B | 4.79% | **0.810** | Near-total miscalibration |
| Qwen-qwq-32B | 7.59% | **0.680** | Severe overconfidence |

**Person-based queries are worst**: Models confidently assign wrong answers (e.g., "Geoffrey Hinton" instead of "Michio Sugeno") at 93% confidence when accuracy is near zero.

### Training Method Effects on Calibration

- **Supervised fine-tuning (SFT)**: Yields well-calibrated confidence
- **RLHF/PPO/GRPO/DPO**: All induce **overconfidence via reward exploitation**
- **Instruction tuning**: Compresses verbalized confidence further toward high certainty
- **Evidence tools (web search)**: Systematically induce overconfidence in noisy retrieval environments
- **Verification tools (code interpreters)**: Better calibrated due to deterministic feedback

### Paradoxical Finding

Large RLHF-tuned models show **degraded calibration on EASIER queries**: GPT-4o's ECE increases from 0.071 to 0.083 on TriviaQA when distractors are added. Models are paradoxically more miscalibrated on questions they should find simple.

---

## 12. Knowledge Conflicts and Error Propagation in Multi-Step Reasoning

**Source**: "[Tracking the Limits of Knowledge Propagation](https://arxiv.org/html/2601.15495)" (arXiv:2601.15495)

### Core Finding: Providing Correct Facts Can Backfire

Open-book settings (with facts provided) sometimes **underperform closed-book baselines**. Providing models with correct, conflicting facts yields surprisingly limited gains and can even backfire.

### Error Propagation Rates

| Failure Type | Rate Range | Impact |
|-------------|------------|--------|
| Direct failures (first fact integration) | 7.9-14.6% | Cascading |
| Error propagation from single initial error | 7.6-32.2% | Compounding |
| Knowledge-to-answer gap (CODE, o4-mini) | 76.7% entailment but only 40.4% correct | **36.3pp gap** |

### Knowledge Aggregation Collapse

Performance degrades catastrophically as the number of facts increases:

| Model | 1 Fact | 500 Facts | Degradation |
|-------|--------|-----------|-------------|
| Qwen-3 1.7B (WIKI) | 83.6% | **22.2%** | -61.4pp |
| Qwen-3 8B (WIKI, thinking) | 73.6% | **11.2%** | -62.4pp |

Models rarely recover from early reasoning mistakes when multiple facts must chain together. Fine-tuning methods (FT-CK) often underperformed simple fact-appending, sometimes yielding **0% results** on CODE tasks.

### Post-Rationalization Problem

Models produce answers that are correct in isolation but **unsupported by the supplied evidence**. Citation-based metrics frequently fail to detect this because models attach superficially related passages without actually relying on them during reasoning.

### LLMs-as-Judges Are Biased

Using LLMs as judges constitutes a task where the model must balance parametric knowledge and contextual information, but the model's own parametric knowledge **implicitly biases evaluations**, particularly when factual correctness conflicts with provided context.

---

## 13. Adversarial Attacks on Fact-Checking Systems

**Source**: "[LLM-Based Adversarial Persuasion Attacks on Fact-Checking Systems](https://arxiv.org/abs/2601.16890)" (arXiv:2601.16890)

### Attack Overview

A novel class of **persuasive adversarial attacks** uses generative LLMs to rephrase claims using 15 persuasion techniques grouped into 6 categories. These attacks substantially degrade both verification performance and evidence retrieval on FEVER and FEVEROUS benchmarks.

### The Weaponization Problem

Generative LLMs can generate highly persuasive text at scale, enabling malicious actors to systematically craft disinformation that is:
- Fluent and natural-sounding
- Rhetorically optimized to evade detection
- Scalable through automation

### Broader Vulnerability Landscape

- **Prompt injection**: Elevated to the #1 vulnerability in the 2025 LLM Top 10, appearing in **over 73% of assessed production AI systems**
- **Semantic caching attacks**: Carefully engineered queries with minor lexical variations trigger incorrect cache hits
- **Jailbreak attacks**: Even models trained for safety remain susceptible
- **Intent-hiding in multi-agent systems**: Packaging falsehoods with credible framing ("per company policy," fake CVE warnings) achieves **85-100% attack success rates**

---

## Summary: Critical Failure Taxonomy

### Category A: Self-Correction Failures
| Finding | Severity | Evidence Strength |
|---------|----------|-------------------|
| 64.5% blind spot -- models cannot self-correct own errors | HIGH | Strong (14 models, 3 datasets) |
| Self-correction decreases accuracy on math/reasoning by up to 18.82% | HIGH | Strong (CorrectBench, multiple studies) |
| Accuracy-Correction Paradox: strongest models have worst correction rates | MEDIUM | Moderate (3 models) |
| Error location hints paradoxically decrease correction rates | MEDIUM | Moderate (1 study) |

### Category B: Fact-Checking Backfire Effects
| Finding | Severity | Evidence Strength |
|---------|----------|-------------------|
| AI fact-checks decrease belief in true news by 12.75% when AI errs | HIGH | Strong (PNAS, large N) |
| AI uncertainty increases belief in false headlines by 9.12% | HIGH | Strong (same study) |
| Prior beliefs override even 97%-accurate AI corrections | HIGH | Strong (N=1,072) |
| Human fact-checks outperform AI fact-checks by 22.56pp on belief discernment | HIGH | Strong (head-to-head comparison) |

### Category C: Systematic Biases
| Finding | Severity | Evidence Strength |
|---------|----------|-------------------|
| Adversarial framing bypasses code review 88.2% of the time | CRITICAL | Strong (17 real projects) |
| "Bug-free" framing drops GPT-4o-mini detection from 97.2% to 3.6% | CRITICAL | Strong (controlled experiment) |
| False negative bias exceeds false positive bias by 4-114x | HIGH | Strong (multiple models) |
| Sycophancy: models flip correct verdicts under user pushback | HIGH | Strong (EMNLP 2025) |
| Overconfidence: ECE up to 0.810 (near-total miscalibration) | HIGH | Strong (SimpleQA benchmark) |

### Category D: Error Amplification
| Finding | Severity | Evidence Strength |
|---------|----------|-------------------|
| Enhanced reasoning causes proportional hallucination increase | HIGH | Strong (causal, multiple methods) |
| Multi-agent systems reach 100% error infection despite reviewer roles | CRITICAL | Strong (6 frameworks tested) |
| Knowledge aggregation collapse: 83.6% to 22.2% with more facts | HIGH | Strong (Track benchmark) |
| Reliability-capability trade-off: reducing hallucination costs 24.4% utility | HIGH | Strong (DPO ablation) |

### Category E: Adversarial Vulnerability
| Finding | Severity | Evidence Strength |
|---------|----------|-------------------|
| Persuasion attacks degrade fact-checking on FEVER/FEVEROUS | HIGH | Moderate (benchmark only) |
| Intent-hiding achieves 85-100% attack success in multi-agent systems | CRITICAL | Strong (6 frameworks) |
| Prompt injection present in 73% of production AI systems | HIGH | Strong (industry assessment) |

---

## Key Implications for Claim Verification System Design

1. **Self-correction is not reliable by default.** Without explicit correction triggers (like "Wait"), models have a 64.5% blind spot for their own errors. Any verification pipeline relying on self-review is fundamentally compromised.

2. **Verification can make things actively worse.** Self-correction degrades accuracy by up to 18.82%. AI fact-checks decrease belief in true news. Multi-agent review creates false consensus. The assumption that "more verification = more accuracy" is empirically wrong.

3. **Confidence is anti-correlated with accuracy in critical scenarios.** Models are most confident when most wrong (ECE up to 0.810). RLHF training exacerbates this. Confidence scores from LLMs cannot be trusted as reliability indicators.

4. **Multi-agent systems amplify rather than catch errors.** Error cascades reach 100% infection even with dedicated reviewer roles. Conformity bias and sycophancy undermine independent evaluation. The "multiple eyes" assumption from human teams does not transfer to LLM agents.

5. **Adversarial robustness is minimal.** Simple framing changes (metadata, PR descriptions) can drop detection rates by 93.5 percentage points. Persuasion techniques optimized by LLMs can systematically evade fact-checking systems.

6. **The fundamental trade-off is inescapable.** Better reasoning causes more hallucination. Reducing hallucination costs utility. Higher accuracy means lower self-correction ability. These are structural, not solvable with more compute or better prompts alone.

---

## Sources

### Papers Analyzed
- [Self-Correction Blind Spot in LLMs](https://arxiv.org/html/2507.02778v1) -- arXiv:2507.02778
- [Large Language Models Cannot Self-Correct Reasoning Yet](https://arxiv.org/abs/2310.01798) -- Huang et al. (ICLR 2024)
- [Decomposing LLM Self-Correction: The Accuracy-Correction Paradox](https://arxiv.org/html/2601.00828) -- arXiv:2601.00828
- [CorrectBench: A Benchmark of Self-Correction in LLMs](https://arxiv.org/html/2510.16062v1) -- arXiv:2510.16062
- [Fact-checking information from LLMs can decrease headline discernment](https://pmc.ncbi.nlm.nih.gov/articles/PMC11648662/) -- PNAS 2024
- [Prior beliefs & automated fact checking](https://pmc.ncbi.nlm.nih.gov/articles/PMC12875456/) -- PMC 12875456
- [Measuring and Exploiting Confirmation Bias in LLM-Assisted Security Code Review](https://arxiv.org/html/2603.18740v1) -- arXiv:2603.18740
- [The Reasoning Trap: How Enhancing LLM Reasoning Amplifies Tool Hallucination](https://arxiv.org/html/2510.22977v1) -- arXiv:2510.22977
- [From Spark to Fire: Error Cascades in Multi-Agent Collaboration](https://arxiv.org/html/2603.04474v1) -- arXiv:2603.04474
- [Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/html/2503.13657v1) -- arXiv:2503.13657
- [Challenging the Evaluator: LLM Sycophancy Under User Rebuttal](https://arxiv.org/abs/2509.16533) -- EMNLP 2025
- [Mind the Confidence Gap: Overconfidence and Calibration in LLMs](https://arxiv.org/html/2502.11028v3) -- arXiv:2502.11028
- [Tracking the Limits of Knowledge Propagation](https://arxiv.org/html/2601.15495) -- arXiv:2601.15495
- [LLM-Based Adversarial Persuasion Attacks on Fact-Checking Systems](https://arxiv.org/abs/2601.16890) -- arXiv:2601.16890
- [DeepMind FACTS Framework 2026](https://galileo.ai/blog/deepmind-facts-framework-llm-factual-accuracy) -- Frontier model accuracy benchmarks

### Additional Search Sources
- [Can LLM Agents Really Debate?](https://arxiv.org/pdf/2511.07784) -- Conformity-driven collapse
- [Cognitive Biases in LLM-Assisted Software Development](https://arxiv.org/html/2601.08045v1) -- Anchoring effects
- [Knowledge Conflicts for LLMs: A Survey](https://arxiv.org/html/2403.08319v1) -- Parametric vs. retrieved knowledge
- [OpenFactCheck](https://openfactcheck.com/) -- Unified factuality evaluation framework
- [RealFactBench](https://arxiv.org/pdf/2506.12538) -- Real-world fact-checking benchmark
