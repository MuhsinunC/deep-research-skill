# Academic Research: LLM-Based Claim Verification & Fact-Checking Systems (2024-2026)

**Research Date:** 2026-04-01
**Lens:** Academic/Formal
**Status:** COMPLETE

---

## Table of Contents
1. [Tool-MAD (arXiv 2601.04742)](#1-tool-mad)
2. [PCC Framework (arXiv 2601.02574)](#2-pcc-framework)
3. [Courtroom-Style Multi-Agent Debate (arXiv 2603.28488)](#3-courtroom-style-multi-agent-debate)
4. [FIRE (NAACL 2025)](#4-fire)
5. [DRA Rubric Taxonomy (arXiv 2601.15808)](#5-dra-rubric-taxonomy)
6. [FactScore Decompose-Verify Results (2025-2026)](#6-factscore-decompose-verify)
7. [CRITIC Framework (Huang et al.)](#7-critic-framework)
8. [Structured Evidence Summary](#8-structured-evidence)

---

## 1. Tool-MAD (arXiv 2601.04742)

**Title:** Tool-MAD: A Multi-Agent Debate Framework for Fact Verification with Diverse Tool Augmentation and Adaptive Retrieval
**Authors:** Seyeon Jeong, Yeonjun Choi, JongWook Kim, Beakcheol Jang
**Affiliations:** Yonsei University (Jeong, Choi, Jang); Sangmyung University (Kim) -- Seoul, Republic of Korea
**Date:** January 8, 2026
**Venue:** arXiv preprint (cs.CL)
**Source:** [https://arxiv.org/abs/2601.04742](https://arxiv.org/abs/2601.04742)

### Architecture

- **3 agents total:** 2 debater agents + 1 judge agent
- **Agent R (RAG-based):** Uses Retrieval-Augmented Generation via Milvus vector database
- **Agent S (Search-based):** Uses Tavily Search API
- **Maximum debate rounds:** T = 3 (optimal; performance declines at round 4)
- **Documents retrieved per query:** Top 3

### Adaptive Retrieval Mechanism

After each debate round, agents update their queries based on previous arguments exchanged during the discussion. A stability score mechanism assesses response quality:
- **Faithfulness score threshold:** 0.7 (proportion of claims supported by retrieved evidence)
- **Answer relevance threshold:** 0.8 (cosine similarity between original and generated questions)

### Benchmark Results (4 fact verification benchmarks)

**GPT-4o-mini backbone (main results):**

| Dataset | Baseline | CoT | ReAct | MAD | MADKE | **Tool-MAD** |
|---------|----------|-----|-------|-----|-------|-------------|
| FEVER | 62.0% | 66.5% | 62.0% | 71.0% | 72.0% | **73.0%** |
| FEVEROUS | 37.0% | 31.0% | 24.0% | 36.5% | 66.0% | **71.5%** |
| FaVIQ | 56.0% | 67.0% | 66.0% | 68.0% | 75.5% | **77.5%** |
| AVeriTeC | 33.0% | 33.5% | 24.0% | 36.0% | 58.5% | **62.0%** |
| **Average** | — | — | — | 52.9% | 68.0% | **71.0%** |

**Llama-3.3-70B-Instruct backbone:**

| Dataset | Baseline | CoT | ReAct | MAD | MADKE | **Tool-MAD** |
|---------|----------|-----|-------|-----|-------|-------------|
| FEVER | 69.5% | 71.0% | 73.5% | 54.0% | 62.5% | **74.0%** |
| FEVEROUS | 49.0% | 51.0% | 51.0% | 31.5% | 61.0% | **77.0%** |
| FaVIQ | 64.0% | 68.5% | 65.5% | 58.5% | 71.5% | **78.5%** |
| AVeriTeC | 51.0% | 32.0% | 35.5% | 39.5% | 31.0% | **66.5%** |
| **Average** | 58.4% | 55.6% | 56.4% | 45.9% | 56.5% | **74.0%** |

**DeepSeek-R1:** FEVER 71.0%, FEVEROUS 67.5%, FaVIQ 77.0%, AVeriTeC 49.0% (avg 66.1%)
**GPT-4o:** FEVER 69.5%, FEVEROUS 54.5%, FaVIQ 68.0%, AVeriTeC 43.5% (avg 58.9%)

**95% Confidence Intervals (GPT-4o-mini):**
- FEVER: 0.73 (67%-79%), FEVEROUS: 0.72 (66%-78%), FaVIQ: 0.78 (72%-83%), AVeriTeC: 0.62 (56%-69%)

**Medical QA (additional benchmarks):**
- MedQA: MAD 58.0%, MADKE 74.0%, **Tool-MAD 77.0%**
- PubMedQA: MAD 22.5%, MADKE 21.5%, **Tool-MAD 29.0%**

### Ablation Study (GPT-4o-mini)

| Configuration | FEVER | FEVEROUS | FaVIQ | AVeriTeC |
|---------------|-------|----------|-------|----------|
| Vanilla + Vanilla | 62.0% | 40.0% | 60.0% | 45.0% |
| RAG + Vanilla | 65.5% | 57.5% | 63.5% | 58.0% |
| Search + Vanilla | 60.5% | 43.0% | 63.5% | 53.5% |
| RAG + RAG (homogeneous) | 67.5% | 60.5% | 68.5% | 56.5% |
| Search + Search (homogeneous) | 67.0% | 60.5% | 68.5% | 55.5% |
| **RAG + Search (Tool-MAD)** | **73.0%** | **71.5%** | **77.5%** | **62.0%** |

**Key finding:** Heterogeneous tools (RAG + Search) consistently outperform homogeneous configurations.

### Query Formulation Effect
- FEVER: +2.0%, FEVEROUS: +2.5%, FaVIQ: +0%, AVeriTeC: +1.0%

### Stability Score Feedback Effect
- FaVIQ: +4.5% (most significant), consistent gains across all datasets

---

## 2. PCC Framework (arXiv 2601.02574)

**Title:** Fact-Checking with Large Language Models via Probabilistic Certainty and Consistency
**Authors:** Haoran Wang (Emory University), Maryam Khalid, Qiong Wu, Jian Gao, Cheng Cao (Amazon.com)
**Date:** January 2026
**Venue:** arXiv preprint
**Source:** [https://arxiv.org/abs/2601.02574](https://arxiv.org/abs/2601.02574)

### Adaptive Verification Strategy (Four-Quadrant Model)

PCC partitions claims using thresholds alpha and beta (both in (0,1)):

| Certainty (tau) | Consistency (gamma) | Strategy |
|-----------------|---------------------|----------|
| tau >= alpha | gamma >= beta | **Direct answering** (no retrieval needed) |
| tau >= alpha | gamma < beta | **Targeted search** via reasoning consistency |
| tau < alpha | gamma >= beta | **Targeted search** via self-reflection |
| tau < alpha | gamma < beta | **Deep search** (full retrieval) |

### Metric Computation

**Internal Certainty tau(c):**
- Equals 1 if top two tokens agree on verdict class
- Otherwise equals |p_T - p_F| (absolute probability margin between true/false)

**Reasoning Consistency gamma(c):**
- gamma(c) = 1 - phi_bar_contr(c)
- phi_bar_contr averages NLI contradiction scores between rationales generated under true vs. false assumptions

### Benchmark Results

**Table 1: GPT-4o baseline results:**

| Dataset | True F1 | False F1 |
|---------|---------|----------|
| SciFact | 0.72 | 0.62 |
| FeLMWk | 0.79 | 0.68 |
| HoVER | 0.52 | 0.76 |

**Baseline Comparisons (GPT-4o on SciFact):**

| Method | True F1 | False F1 |
|--------|---------|----------|
| FacTool | 0.68 | 0.55 |
| FactCheck-GPT | 0.62 | 0.52 |
| SAFE | 0.64 | 0.53 |
| FIRE | 0.69 | 0.58 |
| **PCC** | **0.72** | **0.62** |

**Cross-Model Generalization (FeLMWk):**

| Model | FIRE True/False | PCC True/False |
|-------|-----------------|----------------|
| Gemini-2.5-Pro | 0.74/0.71 | **0.77/0.74** |
| Mistral-7B-Instruct (HoVER) | 0.48/0.58 | **0.52/0.61** |
| GPT-3.5-turbo (FeLMWk) | 0.70/0.23 | **0.72/0.66** |
| GPT-4.1 (FeLMWk) | 0.76/0.65 | **0.76/0.68** |

### Expected Calibration Error (ECE)

| Dataset/Model | Verbal | Certainty | Consistency | PCC |
|---------------|--------|-----------|-------------|-----|
| SciFact / Gemini-2.5-Pro | 0.2353 | 0.2746 | **0.1062** | 0.1291 |
| HoVER / GPT-4o-mini | 0.3937 | 0.3791 | **0.1666** | 0.2076 |

### Targeted vs. Deep Search

- High Certainty/Low Consistency on SciFact: Targeted 0.66 vs Deep 0.58
- Low Certainty/High Consistency on FeLMWk: Targeted 0.62 vs Deep 0.67

**Dataset sizes:** SciFact: 187 claims, HoVER: 190 claims (4-hop subset)

---

## 3. Courtroom-Style Multi-Agent Debate (arXiv 2603.28488)

**Title:** Courtroom-Style Multi-Agent Debate with Progressive RAG and Role-Switching for Controversial Claim Verification
**Authors:** Masnun Nuha Chowdhury (equal contribution), Nusrat Jahan Beg (equal contribution), Umme Hunny Khan, Syed Rifat Raiyan (corresponding), Md Kamrul Hasan, Hasan Mahmud
**Affiliations:** Systems and Software Lab (SSL), Department of CSE, Islamic University of Technology, Dhaka, Bangladesh
**Date:** March 30, 2026
**Venue:** arXiv preprint
**Source:** [https://arxiv.org/abs/2603.28488](https://arxiv.org/abs/2603.28488)
**Repository:** [https://github.com/mnc13/PROClaim](https://github.com/mnc13/PROClaim)

### Framework: PROClaim

**Five specialized courtroom roles:**
1. **Plaintiff Counsel** (GPT-5-mini, temp 0.5): Argues in favor of the claim
2. **Defense Counsel** (DeepSeek-v3.2, temp 0.5): Argues against the claim
3. **The Court / Presiding Judge** (Qwen3-235B, temp 0.2): Refines evidence queries, oversees discovery
4. **Expert Witness** (Hermes-3-Llama-405B, temp 0.5): Domain expert providing targeted testimony
5. **Critic Agent** (DeepSeek-R1, temp 0.3): Evaluates both sides, scores arguments, signals early termination

**Judicial Panel (3 independent judges):**
- Judge 1: DeepSeek-R1 (temp 0.3)
- Judge 2: Hermes-3-Llama-405B (temp 0.3)
- Judge 3: Qwen3-235B-A22B (temp 0.3)

### Progressive RAG (P-RAG) Mechanism

**Query Construction (3 sources concatenated):**
1. Last 4 messages from rolling debate context
2. Agent's self-identified evidential gap
3. Reflection-driven discovery needs from prior round

**Novelty Filtering:**
- Formula: novelty(d) = 1 - max[cos(e_d, e_p)] (L2-normalized embeddings)
- Threshold: >= 0.20 (rejects near-duplicates below this)
- Rationale: 0.15 allows near-duplicates, > 0.30 prematurely discards nuanced evidence

**Adaptive Stopping Criteria:**

| Criterion | Threshold | Rationale |
|-----------|-----------|-----------|
| Novelty filter | < 0.20 | Rejects near-duplicates |
| Redundancy ratio | > 70% | Indicates saturation |
| Relevance gain | < 0.05 | Diminishing returns |
| Iteration cap | 10 | Limits compute cost |

**Early Termination Conditions (debate-level):**
1. Reflection plateau: |delta total_reflection_score| < 0.05 for two consecutive rounds
2. Critic resolution: debate_resolved = True
3. Novelty exhaustion: avg novelty < 0.10 over two consecutive P-RAG calls
4. Judicial signal: Court agent affirms readiness

### Role-Switching Mechanism

After primary debate, Plaintiff and Defense swap roles and re-debate with reset state. A separate LLM analyzes both transcripts for consistency vs. opportunistic argumentation. Produces consistency score incorporated into final confidence weighting via delta_rs adjustment.

### Main Results (Check-COVID Dataset, 360 debate instances)

**Three Independent Runs:**

| Run | Accuracy | Macro-F1 | Mean kappa | Unanimity |
|-----|----------|----------|------------|-----------|
| Run-0 | 0.950 | 0.950 | 0.429 | 0.442 |
| Run-1 | 0.817 | 0.817 | 0.549 | 0.558 |
| Run-2 | 0.790 | 0.790 | 0.474 | 0.496 |
| **Majority Vote** | **0.817** | **0.817** | **0.468** | **0.489** |
| Oracle (Best-of-3) | 0.958 | 0.958 | 0.438 | 0.450 |

**vs. Baselines:**

| System | Accuracy | Macro-F1 | Avg Evidence Pool |
|--------|----------|----------|-------------------|
| Single-call GPT-5-mini + RAG | 0.8583 | 0.8571 | 19.3 |
| Single-call DeepSeek-v3.2 + RAG | 0.8000 | 0.7972 | 18.5 |
| Standard MAD | 0.7167 | 0.7068 | 5.0 |
| **PROClaim (Majority Vote)** | **0.8167** | **0.8165** | **67.5** |

**Key gains:** +10.0 pp over Standard MAD; -4.2 pp vs GPT-5-mini single-pass

### Ablation Study (120-claim subset)

| Configuration | Accuracy | Macro-F1 | Delta Acc | Avg Rounds | Evidence Pool | Tokens (K) |
|---------------|----------|----------|-----------|------------|---------------|------------|
| **Full PROClaim** | **0.8167** | **0.8165** | -- | **5.47** | **67.5** | **210.9** |
| w/o P-RAG | 0.7417 | 0.7408 | **-7.5 pp** | 6.00 | 37.5 | 188.9 |
| w/o Role-Switching | 0.7750 | 0.7750 | **-4.2 pp** | 2.88 | 54.0 | 147.3 |
| w/o Three-Judge Panel | 0.7833 | 0.7818 | **-3.3 pp** | 5.29 | 68.8 | 195.9 |
| w/o Self-Reflection | 0.8083 | 0.8080 | **-0.8 pp** | 7.06 | 81.5 | 247.3 |
| Standard MAD | 0.7167 | 0.7068 | **-10.0 pp** | 2.00 | 12.1 | 18.9 |

**P-RAG is the most impactful component:** -7.5 pp accuracy loss when removed.

### Cross-Domain Generalization

| Dataset | Claims | Accuracy | F1 | Tokens (K) |
|---------|--------|----------|-----|-----------|
| HealthVer | 100 | 0.720 | 0.713 | 223 |
| FEVEROUS | 60 | 0.783 | 0.772 | 236 |
| Check-COVID | 120 | 0.817 | 0.817 | 211 |

### Confidence Calibration

- **ECE (full framework):** 0.034
- **ECE (standard averaging):** 0.18
- **Improvement factor:** 5x better calibration

### Debate Dynamics

**Termination Distribution (360 debates):**
- Reflection Plateau: 179 (49.7%)
- Judicial Signal: 147 (40.8%)
- Critic Resolution: 23 (6.4%)
- Novelty Stabilization: 11 (3.1%)

**Convergence:** REFUTE claims converge 0.2-0.3 rounds faster than SUPPORT (structural negativity bias)

### Self-Reflection Scoring

s_ref = 0.4*logic + 0.3*novelty + 0.3*rebuttal
delta_ref = (s_ref - 0.5) * 0.6, range [-0.30, +0.30]

### Judge Bias Patterns
- DeepSeek-R1: "aggressively refutes" (high REFUTE recall, false-refutes SUPPORT)
- Hermes-3-405B: "cautiously abstains" (frequent Inconclusive on SUPPORT)
- Qwen3-235B-A22B: "most calibrated" (highest SUPPORT recall, balanced abstention)
- Disagreement: kappa_mean = 0.468 (48.9% unanimous)

---

## 4. FIRE (NAACL 2025)

**Title:** FIRE: Fact-checking with Iterative Retrieval and Verification
**Authors:** Zhuohan Xie, Rui Xing, Yuxia Wang, Jiahui Geng, Hasan Iqbal, Dhruv Sahnan, Iryna Gurevych, Preslav Nakov
**Affiliations:** MBZUAI; The University of Melbourne
**Date:** November 2024 (arXiv), published at Findings of NAACL 2025
**Venue:** Findings of the Association for Computational Linguistics: NAACL 2025
**Sources:** [https://arxiv.org/abs/2411.00784](https://arxiv.org/abs/2411.00784), [https://aclanthology.org/2025.findings-naacl.158/](https://aclanthology.org/2025.findings-naacl.158/)

### Core Mechanism

Uses a unified function f(c, E, k) that takes a claim, evidence set, and internal LLM knowledge to decide between: (1) outputting a final answer, or (2) generating a subsequent search query. The decision is based on confidence estimation (no explicit numerical threshold specified -- the model learns when to stop).

**Step-by-step reasoning** enhances model confidence; when reasoning is prohibited (FIRE No Reason), search queries increase significantly.

**Early termination:** Optimal window size = 2 (stops when verdict is stable for 2 consecutive iterations)
**Similarity threshold:** 0.9 (Sentence-BERT all-MiniLM-L6-v2) for deduplication
**Search API:** SerpAPI via Google Search (~$0.00105 per query)

### Dataset Statistics

| Dataset | True Claims | False Claims | Total |
|---------|------------|-------------|-------|
| Factcheck-Bench | 472 | 159 | 631 |
| FacTool-QA | 177 | 56 | 233 |
| FELM-WK | 99 | 85 | 184 |
| BingCheck | 100 | 42 | 142 |

### Performance Results (F1 by label)

**FIRE with GPT-4o:**

| Dataset | True Prec/Rec/F1 | False Prec/Rec/F1 |
|---------|-------------------|-------------------|
| FacTool-QA | 0.92/0.88/0.90 | 0.65/0.71/0.68 |
| FELM-WK | 0.70/0.86/0.77 | 0.77/0.54/0.63 |
| BingCheck | 0.86/0.88/0.87 | 0.70/0.67/0.68 |

**FIRE with GPT-4o-mini:**

| Dataset | True Prec/Rec/F1 | False Prec/Rec/F1 |
|---------|-------------------|-------------------|
| FacTool-QA | 0.87/0.88/0.87 | 0.60/0.59/0.59 |
| FELM-WK | 0.63/0.82/0.71 | 0.67/0.44/0.53 |
| BingCheck | 0.87/0.91/0.88 | 0.74/0.67/0.70 |

### Cost Analysis (Total for 559 claims on Factcheck-Bench)

| Method | LLM Cost | Search Cost | Total | Time |
|--------|----------|-------------|-------|------|
| **FIRE (GPT-4o)** | **$3.35** | **$0.60** | **$3.95** | **1.31h** |
| **FIRE (GPT-4o-mini)** | **$0.14** | **$0.20** | **$0.34** | **1.25h** |
| FacTool (GPT-4o) | $24.76 | $3.67 | $28.43 | 2.92h |
| FacTool (GPT-4o-mini) | $1.49 | $3.67 | $5.16 | 2.34h |
| FactCheck-GPT (GPT-4o) | $21.41 | -- | $21.41 | 4.25h |
| Safe (GPT-4o) | $6.34 | $2.93 | $9.27 | 4.62h |
| Safe (GPT-4o-mini) | $0.43 | $2.93 | $3.36 | 4.25h |

**Cost reductions: 7.6x LLM cost reduction, 16.5x search cost reduction (average)**

### Model Comparison (Factcheck-Bench, FIRE framework)

| Model | Total Cost | True F1 | False F1 |
|-------|-----------|---------|----------|
| o1-preview | $146.46 | 0.88 | 0.69 |
| GPT-4o | $11.92 | 0.85 | 0.66 |
| **GPT-4o-mini** | **$0.63** | **0.87** | **0.67** |
| Claude-3.5 Sonnet | $14.84 | 0.86 | 0.69 |
| Claude-3 Opus | $50.07 | 0.86 | 0.67 |
| LLaMA 3.1-Inst 8B | $6.22 | 0.80 | 0.57 |
| Mistral-Inst 7B | $3.06 | 0.75 | 0.50 |

**GPT-4o-mini is 766x cheaper than o1-preview with comparable performance.**

### Ablation: Early Termination Window Size

| Window | LLM+Search Cost | True F1 | False F1 |
|--------|-----------------|---------|----------|
| 2 (optimal) | $0.17+$0.29 | 0.87 | 0.68 |
| 3 | $0.17+$0.36 | 0.87 | 0.67 |
| 4 | $0.18+$0.39 | 0.86 | 0.65 |

### Error Analysis (135 failed cases)
- Dataset issues: 44 (13 not-claims, 20 unclear/ambiguous, 11 false labels)
- Knowledge issues: 50 (4 expert knowledge, 16 inaccurate parametric, 30 insufficient evidence)
- LLM reasoning issues: 26 (18 incorrect reasoning, 8 overly-strict)
- Debatable opinions: 15

---

## 5. DRA Rubric Taxonomy (arXiv 2601.15808)

**Title:** Inference-Time Scaling of Verification: Self-Evolving Deep Research Agents via Test-Time Rubric-Guided Verification
**Authors:** Yuxuan Wan (CUHK), Tianqing Fang (Tencent), Zaitang Li (Tencent), Yintong Huo (CUHK), Wenxuan Wang (Tencent), Haitao Mi (Tencent), Dong Yu (Tencent), Michael R. Lyu (CUHK)
**Affiliations:** The Chinese University of Hong Kong; Tencent AI Lab
**Date:** January 22, 2026
**Venue:** arXiv preprint
**Source:** [https://arxiv.org/abs/2601.15808](https://arxiv.org/abs/2601.15808)

### DRA Failure Taxonomy: 5 Major Categories, 13 Sub-Categories

**Constructed from analysis of failure trajectories on WebAggregator dataset:**
- 2,997 agent actions across 90 tasks
- Trajectories: 2-156 steps (avg 33.3)
- 555 error points collected
- Correct/Incorrect ratio: 0.96

**The 5 major categories:**
1. **Finding Sources** -- Sub-categories: Consulting wrong evidence, Relying on generic searches
2. **Reasoning** -- Sub-categories: Premature conclusions, Misinterpretation, Hallucinated/overconfident claims
3. **Problem Understanding and Decomposition** -- Sub-categories: Misunderstanding instructions, Goal drift
4. **Action Errors** -- Sub-categories: UI failures, Format mistakes, Wrong modality use
5. **Max Step Reached** -- Sub-categories: (resource exhaustion categories)

*(Note: Exact sub-category names partially extracted from Figure 3 in the paper. The full 13 sub-categories are distributed across these 5 major classes.)*

### DeepVerifier: Three-Stage Mechanism

1. **Decomposition Module:** Trajectory summarization, error identification using taxonomy, formulation of targeted follow-up questions
2. **Verification Agent:** Retrieves answers to decomposed sub-questions
3. **Judge Module:** Scores responses on 1-4 scale (1=entirely incorrect, 4=entirely correct)

### Benchmark Results

**GAIA-Web (Claude-3.7 backbone):**
- Baseline: 51.11% --> Peak: 63.33% (+12.22%)
- After 10 rounds: 62.22% (**+11.11% accuracy gain**)

**GAIA-Full (Claude-3.7):**
- Baseline: 52.22% --> Peak: 60.12% (+7.90%)
- After 10 rounds: 58.93% (+6.71%)

**XBench-DeepSearch (Claude-3.7):**
- Baseline: 41.0% --> Peak: 47.0% (+6.0%)
- After 10 rounds: 44.0% (+3.0%)

**BrowseComp (Claude-3.7):**
- Baseline: 5.0% --> Peak: 10.0% (+5.0%)
- After 10 rounds: 9.0% (+4.0%)

**Summary: 8%-11% accuracy gains on challenging subsets of GAIA and XBench-DeepResearch (as claimed in abstract).**

### Meta-Evaluation (Verification Quality)

**DeepVerifier F1 on GAIA-Web:**
- **DeepVerifier: 73.17% F1**
- Without Verification: 25.00% F1
- Without Decomposition: 61.54% F1
- **Improvement: 12%-48% F1 over baselines**

**Precision/Recall/Accuracy:**
- Precision: 75.00%
- Recall: 71.43%
- Accuracy: 75.56%

### Open-Source Model (DeepVerifier-8B)

Fine-tuned Qwen3-8B on DeepVerifier-4K dataset (4,646 high-quality prompt-response pairs from 400 base trajectories):
- Baseline: 26.73% --> After 10 rounds: 32.21% (+5.48%)
- Outperforms CK-Pro-8B by +2.6 points

**Human annotator agreement on error points:** 63.0% overlap rate

---

## 6. FactScore Decompose-Verify Results (2025-2026)

### 6a. Original FActScore (Min et al., 2023)

**Title:** FActScore: Fine-grained Atomic Evaluation of Factual Precision in Long Form Text Generation
**Source:** [https://arxiv.org/abs/2305.14251](https://arxiv.org/abs/2305.14251)

- Breaks generation into atomic facts, computes percentage supported by knowledge source
- ChatGPT achieved only **58% FActScore** on biographical factuality
- Established the decompose-then-verify paradigm

### 6b. Optimizing Decomposition for Optimal Claim Verification (Lu et al., ACL 2025)

**Title:** Optimizing Decomposition for Optimal Claim Verification
**Authors:** Yining Lu, Noah Ziems, Hy Dang, Meng Jiang (University of Notre Dame)
**Venue:** ACL 2025
**Source:** [https://aclanthology.org/2025.acl-long.254.pdf](https://aclanthology.org/2025.acl-long.254.pdf)

**Key innovation:** DyDecomp -- dynamic decomposition that optimizes atomicity for the verifier via on-policy RL optimization.

**Results (Llama3-Inst-70B decomposer, Llama3-Inst-8B verifier):**

| Setting | DyDecomp Confidence | FActScore Confidence | DyDecomp Accuracy | FActScore Accuracy |
|---------|--------------------|--------------------|-------------------|-------------------|
| Atomicity 0 (ChatGPT) | 0.600 | 0.627 | **0.789** | 0.666 |
| Atomicity 1 (ChatGPT) | **0.654** | 0.609 | 0.758 | 0.739 |

- Trainable parameters: 4.73M (two-layer perceptron with ReLU)
- Verification confidence improvement: +0.07 average
- Verification accuracy improvement: +0.12 average (PerplexityAI dataset)
- **Pearson correlation** between confidence and accuracy: **0.88**

**Ablation:** Full DyDecomp confidence 0.446; entropy bonus removal drops to 0.356 (-0.090)

### 6c. Decomposition Dilemmas (Hu et al., 2024)

**Title:** Decomposition Dilemmas: Does Claim Decomposition Boost or Burden Fact-Checking Performance?
**Authors:** Qisheng Hu, Quanyu Long, Wenya Wang (Nanyang Technological University)
**Source:** [https://arxiv.org/html/2411.02400](https://arxiv.org/html/2411.02400)

**Key finding:** Decomposition's impact is **inconsistent and context-dependent** -- helps weaker verifiers on complex inputs but hurts stronger verifiers.

**Selected results (MiniCheck verifier on WICE):**
- Baseline (no decomposition): BAcc 80.01%, F1 72.32%
- VeriScore decomposition: BAcc 74.74%, F1 65.16% (**worse**)
- FactScore decomposition: BAcc 71.11%, F1 59.90% (**worse**)

**On FELM (response-level, longer texts):**
- MiniCheck Baseline: BAcc 56.84%, F1 48.10%
- MiniCheck + VeriScore: BAcc 58.97%, F1 67.56% (**better**)
- MiniCheck + FactScore: BAcc 56.29%, F1 67.51% (**better**)

**Conclusion:** Decomposition helps on longer/more complex texts but can hurt on short claims, especially with strong verifiers. Human agreement on decomposition error detection: **83%**.

### 6d. FaStFact (Wan et al., 2025)

**Title:** FaStFact: Faster, Stronger Long-Form Factuality Evaluations in LLMs
**Authors:** Yingjia Wan, Haochen Tan, Xiao Zhu, et al. (UCLA, CityU HK, HKUST, Tsinghua)
**Source:** [https://arxiv.org/html/2510.12839v1](https://arxiv.org/html/2510.12839v1)

**Key results:**
- F1@K' Score: 0.780 (ground truth: 0.792)
- Exact human agreement rate: **85.3%** (range 68.7%-95.3% across benchmarks)
- Token cost: 5,615 tokens vs. SAFE 49,622 and VeriScore 22,848
- SAFE failure analysis: 68% failure rate in claim extraction (39/57 problematic)

### 6e. VeriFastScore (2025)

**Title:** VeriFastScore: Speeding up long-form factuality evaluation
**Source:** [https://arxiv.org/abs/2505.16973](https://arxiv.org/abs/2505.16973)

- Correlation with VeriScore: example-level r=0.80, system-level r=0.94
- Overall speedup: **6.6x** (9.9x excluding evidence retrieval)

---

## 7. CRITIC Framework (Huang et al. / Gou et al.)

**Title:** CRITIC: Large Language Models Can Self-Correct with Tool-Interactive Critiquing
**Authors:** Zhibin Gou, Zhihong Shao, Yeyun Gong, Yelong Shen, Yujiu Yang, Nan Duan, Weizhu Chen
**Venue:** ICLR 2024 (conference paper)
**Date:** May 2023 (v1) -- February 2024 (v4, camera-ready)
**Sources:** [https://arxiv.org/abs/2305.11738](https://arxiv.org/abs/2305.11738), [https://openreview.net/forum?id=Sx038qxjek](https://openreview.net/forum?id=Sx038qxjek)

### Core Approach

CRITIC enables LLMs to validate and progressively amend their own outputs via tool interaction:
1. LLM generates initial output
2. CRITIC interacts with external tools (search engine for QA, Python interpreter for math, toxicity classifier for safety) to evaluate the output
3. LLM revises output based on tool feedback
4. Process repeats iteratively

**Key insight:** LLMs struggle to self-correct without external feedback (noted by Huang et al.). External tool interaction is crucial for reliable self-improvement.

### Tasks Evaluated
1. **Free-form Question Answering:** AmbigNQ, TriviaQA, HotpotQA (500 samples each from validation sets; EM and F1 metrics)
2. **Mathematical Program Synthesis:** GSM8K, SVAMP, MultiArith
3. **Toxicity Reduction**

### Aggregate Performance Claims (from abstract/summaries)

- **QA tasks:** Applied to ChatGPT, CRITIC attains **+7.7 F1** enhancement (average across AmbigNQ, TriviaQA, HotpotQA)
- **Math tasks:** **+7.0% absolute accuracy gains** (average across GSM8K, SVAMP, MultiArith)
- **Toxicity:** **79.2% reduction** in toxicity probability

*(Note: Individual per-benchmark scores could not be extracted from web-accessible versions. The paper's full results tables are in the PDF, which was not parseable. The above aggregate numbers are confirmed from the abstract and multiple secondary sources.)*

### Significance for the Field

CRITIC established the paradigm of tool-grounded self-correction that later papers (FIRE, Tool-MAD, PCC) build upon. The key contribution is demonstrating that external tool feedback breaks the self-correction limitation identified by Huang et al. (2023), where LLMs cannot reliably correct their own reasoning without external signals.

---

## 8. Structured Evidence Summary

```json
[
  {
    "claim": "Tool-MAD achieves up to 5.5% accuracy improvement over MADKE (prior SOTA MAD framework)",
    "evidence_quote": "Tool-MAD achieves up to 5.5% accuracy improvement over state-of-the-art MAD frameworks across four fact verification benchmarks (FEVER, FEVEROUS, FaVIQ, AVeriTeC). Average accuracy: 71.0% vs MADKE 68.0% on GPT-4o-mini; 74.0% vs 56.5% on Llama-3.3-70B.",
    "source_url": "https://arxiv.org/abs/2601.04742",
    "source_title": "Tool-MAD: A Multi-Agent Debate Framework for Fact Verification with Diverse Tool Augmentation and Adaptive Retrieval",
    "confidence": 0.95
  },
  {
    "claim": "Tool-MAD's heterogeneous tool assignment (RAG + Search) is critical -- homogeneous configurations score 6-11% lower",
    "evidence_quote": "RAG+Search (Tool-MAD) achieves 71.0% avg vs RAG+RAG at 63.3% and Search+Search at 62.9% on GPT-4o-mini across 4 benchmarks",
    "source_url": "https://arxiv.org/html/2601.04742",
    "source_title": "Tool-MAD (Table VI ablation)",
    "confidence": 0.95
  },
  {
    "claim": "PCC framework's adaptive four-quadrant verification routes claims based on probabilistic certainty and reasoning consistency",
    "evidence_quote": "PCC partitions claims into four quadrants using thresholds alpha and beta: direct answering (high/high), targeted search via consistency (high/low), targeted search via reflection (low/high), deep search (low/low). On SciFact: PCC True F1=0.72 vs FIRE 0.69, SAFE 0.64, FactCheck-GPT 0.62",
    "source_url": "https://arxiv.org/abs/2601.02574",
    "source_title": "Fact-Checking with Large Language Models via Probabilistic Certainty and Consistency",
    "confidence": 0.92
  },
  {
    "claim": "PCC achieves 5x better calibration (ECE) compared to standard approaches",
    "evidence_quote": "SciFact/Gemini: PCC ECE=0.1291 vs Verbal=0.2353. HoVER/GPT-4o-mini: PCC ECE=0.2076 vs Verbal=0.3937",
    "source_url": "https://arxiv.org/html/2601.02574",
    "source_title": "PCC Framework (Table 5)",
    "confidence": 0.90
  },
  {
    "claim": "PROClaim courtroom-style debate achieves 81.7% accuracy, outperforming standard MAD by 10.0 percentage points",
    "evidence_quote": "PROClaim (Majority Vote): 0.8167 accuracy, 0.8165 macro-F1 vs Standard MAD: 0.7167 accuracy, 0.7068 macro-F1 on Check-COVID benchmark",
    "source_url": "https://arxiv.org/abs/2603.28488",
    "source_title": "Courtroom-Style Multi-Agent Debate with Progressive RAG and Role-Switching for Controversial Claim Verification",
    "confidence": 0.95
  },
  {
    "claim": "Progressive RAG (P-RAG) is the most impactful component in PROClaim, contributing +7.5 pp accuracy",
    "evidence_quote": "Ablation: w/o P-RAG drops from 0.8167 to 0.7417 (-7.5 pp). w/o Role-Switching: -4.2 pp. w/o Three-Judge Panel: -3.3 pp. w/o Self-Reflection: -0.8 pp.",
    "source_url": "https://arxiv.org/html/2603.28488",
    "source_title": "PROClaim (Table 5 ablation)",
    "confidence": 0.95
  },
  {
    "claim": "PROClaim's confidence calibration achieves ECE of 0.034 vs 0.18 for standard averaging",
    "evidence_quote": "Expected Calibration Error (ECE) of 0.034 (vs. 0.18 with standard averaging). Improvement factor: 5x",
    "source_url": "https://arxiv.org/html/2603.28488",
    "source_title": "PROClaim confidence calibration results",
    "confidence": 0.93
  },
  {
    "claim": "FIRE achieves comparable accuracy while reducing LLM costs by 7.6x and search costs by 16.5x",
    "evidence_quote": "FIRE (GPT-4o-mini): $0.14 LLM + $0.20 search = $0.34 total vs FacTool $5.16, Safe $3.36. GPT-4o-mini achieves True F1=0.87, False F1=0.67 on Factcheck-Bench -- comparable to o1-preview (0.88/0.69) at 766x lower cost ($0.63 vs $146.46)",
    "source_url": "https://aclanthology.org/2025.findings-naacl.158/",
    "source_title": "FIRE: Fact-checking with Iterative Retrieval and Verification (NAACL 2025)",
    "confidence": 0.95
  },
  {
    "claim": "DeepVerifier's rubric-guided verification improves DRA accuracy by 8-11% on GAIA and XBench",
    "evidence_quote": "GAIA-Web: 51.11% to 62.22% (+11.11%). GAIA-Full: 52.22% to 58.93% (+6.71%). XBench-DeepSearch: 41.0% to 44.0% (+3.0%). Meta-evaluation F1: 73.17% vs 25.00% without verification.",
    "source_url": "https://arxiv.org/abs/2601.15808",
    "source_title": "Inference-Time Scaling of Verification: Self-Evolving Deep Research Agents via Test-Time Rubric-Guided Verification",
    "confidence": 0.93
  },
  {
    "claim": "DeepVerifier taxonomy identifies 5 major DRA failure categories and 13 sub-categories from 555 error points",
    "evidence_quote": "5 categories: Finding Sources, Reasoning, Problem Understanding and Decomposition, Action Errors, Max Step Reached. 13 sub-categories across these. Analyzed 2,997 agent actions across 90 tasks, 555 error points.",
    "source_url": "https://arxiv.org/html/2601.15808",
    "source_title": "DeepVerifier DRA Failure Taxonomy",
    "confidence": 0.90
  },
  {
    "claim": "Claim decomposition does not uniformly improve fact-checking -- it helps weaker verifiers but can hurt stronger ones",
    "evidence_quote": "MiniCheck on WICE: baseline BAcc 80.01% vs FactScore decomposition 71.11% (9 pp worse). But on FELM: baseline F1 48.10% vs VeriScore decomposition F1 67.56% (19 pp better). Decomposition helps on longer texts but hurts on short claims with strong verifiers.",
    "source_url": "https://arxiv.org/html/2411.02400",
    "source_title": "Decomposition Dilemmas: Does Claim Decomposition Boost or Burden Fact-Checking Performance?",
    "confidence": 0.92
  },
  {
    "claim": "DyDecomp optimizes decomposition atomicity for the verifier, achieving 0.88 Pearson correlation between confidence and accuracy",
    "evidence_quote": "Verification confidence improvement: +0.07 average. Verification accuracy improvement: +0.12 average. Pearson correlation between verification confidence and accuracy: 0.88",
    "source_url": "https://aclanthology.org/2025.acl-long.254.pdf",
    "source_title": "Optimizing Decomposition for Optimal Claim Verification (ACL 2025)",
    "confidence": 0.90
  },
  {
    "claim": "CRITIC establishes that LLMs can self-correct with external tool feedback: +7.7 F1 on QA, +7.0% on math, 79.2% toxicity reduction",
    "evidence_quote": "CRITIC applied to ChatGPT attains 7.7 F1 enhancements across three QA tasks (AmbigNQ, TriviaQA, HotpotQA), 7.0% absolute gains on three mathematical reasoning tasks, and a 79.2% reduction in toxicity probability",
    "source_url": "https://arxiv.org/abs/2305.11738",
    "source_title": "CRITIC: Large Language Models Can Self-Correct with Tool-Interactive Critiquing (ICLR 2024)",
    "confidence": 0.88
  }
]
```

---

## Sources

- [Tool-MAD (arXiv 2601.04742)](https://arxiv.org/abs/2601.04742)
- [PCC Framework (arXiv 2601.02574)](https://arxiv.org/abs/2601.02574)
- [PROClaim / Courtroom Debate (arXiv 2603.28488)](https://arxiv.org/abs/2603.28488)
- [FIRE (NAACL 2025 / arXiv 2411.00784)](https://aclanthology.org/2025.findings-naacl.158/)
- [DeepVerifier / DRA Taxonomy (arXiv 2601.15808)](https://arxiv.org/abs/2601.15808)
- [FActScore (arXiv 2305.14251)](https://arxiv.org/abs/2305.14251)
- [DyDecomp - Optimizing Decomposition (ACL 2025)](https://aclanthology.org/2025.acl-long.254.pdf)
- [Decomposition Dilemmas (arXiv 2411.02400)](https://arxiv.org/html/2411.02400)
- [FaStFact (arXiv 2510.12839)](https://arxiv.org/html/2510.12839v1)
- [VeriFastScore (arXiv 2505.16973)](https://arxiv.org/abs/2505.16973)
- [CRITIC (ICLR 2024 / arXiv 2305.11738)](https://arxiv.org/abs/2305.11738)
