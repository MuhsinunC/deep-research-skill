# Step 1 Search Results — Initial Burst

## Key Sources Found

### Architecture Sources
1. **Tool-MAD** (arXiv 2601.04742) - Multi-Agent Debate Framework for Fact Verification with Diverse Tool Augmentation and Adaptive Retrieval. Each agent gets distinct external tool (search API, RAG module). https://arxiv.org/abs/2601.04742
2. **LoCal** - Logical and Causal Fact-Checking with LLM-Based Multi-Agents. Decomposing agent + reasoning agents + evaluating agents. https://openreview.net/forum?id=f5FDfChZRS
3. **PCC Framework** (arXiv 2601.02574) - Probabilistic Certainty and Consistency. Adaptive strategy: answer directly when confident, targeted retrieval when uncertain, deep search when ambiguous. https://arxiv.org/abs/2601.02574
4. **Courtroom-Style Multi-Agent Debate** (arXiv 2603.28488) - Progressive RAG and Role-Switching for Controversial Claim Verification. https://arxiv.org/html/2603.28488
5. **Hybrid KG+LLM+Search** (ACL 2025 WiNLP) - Three steps: KG Retrieval, LM classification, Web Search Agent. F1=0.93 on FEVER. https://aclanthology.org/2025.winlp-main.19/
6. **FIRE** (NAACL 2025) - Fact-checking with Iterative Retrieval and Verification. https://aclanthology.org/2025.findings-naacl.158.pdf
7. **CRITIC** - Self-correcting LLMs with tool critiquing. 7.7 F1 improvement on QA. https://www.emergentmind.com/papers/2305.11738
8. **Guided and Knowledgeable Multi-Agent Debate** (Expert Systems with Applications, March 2026) - Four mechanisms: Guided Debate, Knowledgeable Debate, Advanced Advice, Knowledgeable Verification. https://www.sciencedirect.com/science/article/abs/pii/S0957417425037194
9. **DebateCV** - First debate-driven claim verification framework, ACM Web Conf 2026. https://arxiv.org/pdf/2507.19090
10. **AFEV** - Atomic Fact Extraction and Verification. Complex claim → atomic decomposition → evidence reranking → adaptive validation. https://www.sciencedirect.com/science/article/abs/pii/S0957417425041879
11. **VERIFAID** - RAG system with dynamically growing datasets. https://www.sciencedirect.com/science/article/pii/S0045790625006895

### Rubric/Structured Verification Sources
12. **LLM-Rubric** (ACL 2024) - Multidimensional calibrated evaluation. RMS error <0.5, 2x improvement over uncalibrated baseline. https://aclanthology.org/2024.acl-long.745/
13. **RubricRAG** (arXiv 2603.20882) - Domain knowledge retrieval for rubric generation. https://arxiv.org/html/2603.20882
14. **"Rubric Is All You Need"** (ICER 2025) - Question-specific rubrics improve accuracy for every judge size, largest gains for smaller judges. https://dl.acm.org/doi/10.1145/3702652.3744220

### Self-Correction/Failure Mode Sources
15. **CorrectBench** (NeurIPS 2025) - 5.2% accuracy gains on MATH, hybrid approaches ~40% slower. https://arxiv.org/abs/2510.16062
16. **Self-Correction Blind Spot** - 64.5% blind spot rate across 14 open-source models. "Wait" reduces blind spots by 89.3%. https://arxiv.org/html/2507.02778v1
17. **Hallucination to Truth** (AI Review 2025) - Comprehensive survey of fact-checking and factuality evaluation. https://link.springer.com/article/10.1007/s10462-025-11454-w

### Temporal/Freshness Sources
18. **Solving Freshness in RAG** (arXiv 2509.19376) - Half-life recency prior achieves 1.00 accuracy on latest-document retrieval. https://arxiv.org/html/2509.19376
19. **Evidence-Based Temporal Fact Verification** (arXiv 2407.15291) - Event-level analysis, larger improvements for multi-event claims. https://arxiv.org/abs/2407.15291

### Benchmark Sources
20. **FEVER/AVeriTeC** - AVeriTeC winning team 63% (2024), evolved to FEVER9/AVerImaTeC (2026). https://fever.ai/
21. **DeepMind FACTS** - Benchmark for LLM factual accuracy. https://deepmind.google/blog/facts-grounding-a-new-benchmark-for-evaluating-the-factuality-of-large-language-models/

### Adversarial/Attack Sources
22. **Adversarial Attacks Survey** (arXiv 2509.08463) - Survey of adversarial attacks against automated fact-checking. https://arxiv.org/pdf/2509.08463
23. **LLM-Based Adversarial Persuasion Attacks** (arXiv 2601.16890) - Attacks on fact-checking systems. https://arxiv.org/html/2601.16890v1
24. **Prior Beliefs & Automated Fact Checking** (PMC 2025) - Limits on AI-based corrections. https://pmc.ncbi.nlm.nih.gov/articles/PMC12875456/

### Industry/Practitioner Sources
25. **"Show Me the Work"** (CHI 2025) - Fact-checkers' requirements for explainable AFC. https://dl.acm.org/doi/full/10.1145/3706598.3713277
26. **Building a Fact-Checking Agent** (Medium, Feb 2026) - Practitioner experience. https://medium.com/@thierryfigini/building-a-fact-checking-agent-tools-patterns-and-what-actually-went-wrong-b92b364e067e
