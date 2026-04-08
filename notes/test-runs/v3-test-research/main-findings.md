# V3 Test Research: Novel Improvements to Deep Research Skill

## Search 1: LLM Confidence Calibration

Sources:
- [Uncertainty Quantification and Confidence Calibration Survey (arXiv 2503.15850)](https://arxiv.org/abs/2503.15850)
- [CoCA: Confidence Before Answering (arXiv 2603.05881)](https://arxiv.org/html/2603.05881)
- [Know When You're Wrong: Aligning Confidence with Correctness (arXiv 2603.06604)](https://arxiv.org/html/2603.06604)
- [Systematic Evaluation of Uncertainty Methods (arXiv 2510.20460)](https://arxiv.org/html/2510.20460v1)

Key findings:
1. LLMs are often miscalibrated — overconfident even when wrong
2. CoCA framework: verbalize confidence BEFORE generating the answer (not after)
3. Hybrid approaches fusing confidence + consistency outperform single methods
4. Black-box confidence estimation is feasible without model internals

**Implication:** Our skill should ask Claude to estimate confidence per claim BEFORE writing the claim, not as a post-hoc self-evaluation. This "confidence-first" approach has better calibration.

## Search 2: Adaptive Research Depth / Stopping Criteria

Sources:
- [DeepSearchQA: Bridging the Comprehensiveness Gap (arXiv 2601.20975)](https://arxiv.org/html/2601.20975v1)
- [Step-DeepResearch Technical Report (arXiv 2512.20491)](https://arxiv.org/html/2512.20491v1)
- [Can LLMs Really Do Web Research? (Medium)](https://medium.com/@prxshetty/can-llms-really-do-web-research-and-why-your-agent-still-gets-stuck-d74598b44e45)

Key findings:
1. "Research until you have enough" causes infinite loops — need explicit, quantifiable stopping conditions
2. Critical challenge: distinguishing "I haven't found it yet" from "it doesn't exist"
3. Cross-validation against historical context helps determine stopping
4. Even GPT-5 Pro and Gemini struggle with recall vs precision tradeoff

**Implication:** Our FFS pattern has quantifiable thresholds (good), but doesn't address the absence-of-evidence problem. We should add explicit "exhaustion criteria" — when to stop searching because the information likely doesn't exist, not just when we have enough.

## Devil's Advocate: Confidence Calibration Limitations

Sources:
- [Overconfidence in LLM-as-a-Judge (arXiv 2508.06225)](https://arxiv.org/html/2508.06225v2)
- [LLMs are Overconfident: FermiEval (arXiv 2510.26995)](https://arxiv.org/html/2510.26995)
- [Dunning-Kruger Effect in LLMs (arXiv 2603.09985)](https://arxiv.org/html/2603.09985v1)
- [Confidence Dichotomy (arXiv 2601.07264)](https://www.arxiv.org/pdf/2601.07264)

Counter-evidence:
1. LLMs are systematically overconfident — 99% confidence intervals cover truth only 65% of the time
2. Web search tool use can INCREASE overconfidence (evidence tools inject noise)
3. RL-trained models have worse calibration than SFT-trained (reward exploitation)
4. LLM-as-judge exhibits overconfidence that limits risk-aware evaluation

**Resolution:** Confidence estimation IS useful but must NOT be trusted as a sole quality signal. It should be combined with tool-grounded verification (which we already have in Phase 7.5 VERIFY). The confidence estimate adds signal but doesn't replace external checks. This aligns with the CRITIC finding that tool grounding is the critical factor.
