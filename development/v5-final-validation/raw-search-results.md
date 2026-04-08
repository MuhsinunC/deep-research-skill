# Raw Search Results — v5 Final Validation Research

## Search 1: AI agent factual accuracy improvement techniques 2026

### Key Findings:
1. **Multi-Agent Debate/Collaboration (MIT)** — Multiple agents critique each other's responses through rounds of generation+critique, final majority vote. Goes beyond single-agent self-correction.
2. **Anti-Hallucination Deep Research frameworks** — Multi-source cross-verification, reasoning validation, domain-specific evidence weighting, hallucination suppression layers.
3. **Four dimensions of AI agent reliability** (arxiv 2602.16666) — consistency, robustness, predictability (calibrated confidence), safety.

### Sources:
- https://news.mit.edu/2023/multi-ai-collaboration-helps-reasoning-factual-accuracy-language-models-0918
- https://arxiv.org/html/2602.16666v1 — "Towards a Science of AI Agent Reliability"
- https://arxiv.org/abs/2506.22485 — "AI Agents-as-Judge"

## Search 2: Multi-source verification beyond retrieve-verify

### Key Findings:
1. **Specialized agent roles** — Indexer, Classifier, Extractor, Corrector, Verification agent (complete misinformation lifecycle)
2. **Model-arbitrated reasoning pipelines** — AI systems debate amongst themselves before giving final answer
3. **Modular cognitive systems** — Separate agents for generation, verification, safety, reasoning, planning

### Sources:
- https://arxiv.org/pdf/2505.17511 — Multi-agent misinformation framework
- https://arxiv.org/html/2509.01398v1 — "The Need for Verification in AI-Driven Scientific Discovery"

## Search 3: LLM self-correction factual grounding 2026

### Key Findings:
1. **MARCH** (Multi-Agent Reinforced Self-Check, arxiv 2603.24579) — Reinforcement-learned multi-agent hallucination checking. +11% accuracy on Qwen3-8B.
2. **Think2** (arxiv 2602.18806) — Metacognitive framework: Planning→Monitoring→Evaluation cycle. 3x improvement in successful self-correction. Based on Ann Brown's regulatory cycle.
3. **CoVe (Chain of Verification)** — Plan verifications, execute independently, revise based on results.
4. **FactNet** (arxiv 2602.03417) — 1.7 billion atomic assertions with 3.01B evidence pointers, 92.1% grounding precision.

### Sources:
- https://arxiv.org/html/2603.24579 — MARCH
- https://arxiv.org/html/2602.18806v1 — Think2
- https://arxiv.org/html/2602.03417 — FactNet
- https://arxiv.org/html/2510.16062v1 — Self-Correction Benchmark

## Search 4: Reliability calibration confidence estimation

### Key Findings:
1. **Capability Calibration Framework (March 2026)** — Shifts from single-response confidence to model's expected success rate for a given query type. More practical than per-response confidence.
2. **Reflexive Calibration Score** — Flags hallucinations by checking if model's confidence aligns with tool interaction success.
3. **Four-dimensional reliability decomposition** — consistency, robustness, predictability, safety. Claude models show stronger calibration but discrimination (knowing when wrong) still lags.

### Sources:
- https://arxiv.org/html/2602.16666v1 — "Towards a Science of AI Agent Reliability"
- https://www.manilatimes.net/2026/03/24/tmt-newswire/pr-newswire/stop-ai-from-guessing-appier-enables-agents-to-assess-confidence-before-acting/2306115

## Search 5: RAG accuracy improvements 2026

### Key Findings:
1. **SELF-RAG** — 270% improvement over raw LLM on PopQA via self-reflective retrieval.
2. **RQ-RAG** — Decomposes multi-hop queries into latent sub-questions.
3. **RAG-Fusion** — Reciprocal rank fusion across multiple reformulated queries.
4. **Hallucination-Aware Decoding Constraints** — Decoding-time constraints enforcing grounding.
5. **SC-RAG** — Combines semantic + unsupervised aspect retrievers without extra training.

### Sources:
- https://arxiv.org/html/2506.00054v1 — RAG Comprehensive Survey
- https://www.sciencedirect.com/science/article/abs/pii/S0306457325003103 — SC-RAG

## Search 6: Claim verification + evidence aggregation papers

### Key Findings:
1. **GLEAN** (arxiv 2603.02798) — Guideline-grounded evidence accumulation. Bayesian logistic regression calibrates step-wise guideline alignment into correctness probabilities. +12% AUROC, 50% Brier score reduction.
2. **AgentAuditor** (arxiv 2602.09341) — Audits reasoning tree branches, selects correct minority answer via evidence-based adjudication (not frequency-based).
3. **QBAF-based argumentation** (arxiv 2510.24303) — Agents bring evidence for/against claims as quantitative bipolar argumentation frameworks.
4. **DelphiAgent** — Multi-agent Delphi method: distinct agent personalities make independent judgments, reach consensus through multiple feedback rounds.

### Sources:
- https://arxiv.org/html/2603.02798v1 — GLEAN
- https://arxiv.org/pdf/2602.09341 — AgentAuditor
- https://arxiv.org/abs/2510.24303 — QBAF argumentation
- https://www.sciencedirect.com/science/article/abs/pii/S0306457325001827 — DelphiAgent

## Follow-Up Search Details

### Think2 (arxiv 2602.18806, Feb 2026)
- Operationalizes Ann Brown's regulatory cycle: Planning → Monitoring → Evaluation
- Structured prompting architecture + lightweight dual-process MetaController for adaptive effort allocation
- 3x improvement in successful self-correction on GSM8K, CRUXEval, MBPP, AIME, CorrectBench, TruthfulQA
- 84% human preference for trustworthiness over standard CoT baselines
- Key insight: Explicit regulatory structuring substantially improves error diagnosis

### GLEAN (arxiv 2603.02798, March 2026)
- Compiles expert-curated protocols into trajectory-informed correctness signals
- Step-wise guideline alignment → surrogate features → Bayesian logistic regression → calibrated correctness probabilities
- Active verification triggered by estimated uncertainty — selectively collects more evidence for uncertain cases
- AUROC >0.94, Brier scores <0.10 with active verification
- Novel: uncertainty-triggered active verification (collect more evidence when uncertain)

### DelphiAgent (ScienceDirect, 2025)
- Dual-system: evidence mining module + Delphi decision-making module
- Multiple LLM agents with distinct personalities make independent factuality judgments
- Anonymous multi-round consensus through feedback and synthesis
- Up to 6.84% macF1 improvement on RAWFC
- Key: distinct agent personalities + anonymity prevents groupthink

### Chain of Verification (CoVe) (Meta, 2023-2024, ACL Findings)
- Draft → Plan verification questions → Answer independently → Revise
- FactScore: 55.9 → 71.4 on longform biography
- Limitation: relies on model finding its own inaccuracies
- Already partially covered by our inline verification, but the "answer independently" step is novel
