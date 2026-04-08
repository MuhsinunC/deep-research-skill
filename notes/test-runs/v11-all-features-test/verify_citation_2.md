# Citation Verification Batch 2 (Claims 7-12)

Claim: "CorrectBench: Reflexion-v1 degrades GSM8K accuracy by -18.82%"
Citation: arXiv 2510.16062
Source: https://arxiv.org/abs/2510.16062
Status: VERIFIED
Evidence: The paper's Table 1 shows Reflexion-v1 scoring 67.64 on GSM8K, representing a -18.82 decline from the baseline of 86.46. The paper states: "Reflexion-v1 denotes reflexion without external tools experiences declines on tasks such as HotpotQA (-11.13%) and AQUA (-12.90%)." The GSM8K degradation of -18.82% is explicitly shown in the results table.
DRA Flags: NONE — G4 (numbers accurate: -18.82% matches Table 1), G5 (no fabrication: source explicitly reports this degradation)
---

Claim: "DeepVerifier achieves 73.17% meta-evaluation F1, 12-48% over baselines"
Citation: arXiv 2601.15808
Source: https://arxiv.org/abs/2601.15808
Status: VERIFIED
Evidence: Table 2 of the paper shows DeepVerifier achieving F1 of 73.17 (with Precision 75.00, Recall 71.43, Accuracy 75.56). The abstract explicitly states DeepVerifier "outperforms vanilla agent-as-judge and LLM judge baselines by 12%-48% in meta-evaluation F1 score."
DRA Flags: NONE — G4 (73.17% F1 confirmed in Table 2; 12-48% improvement confirmed in abstract), G5 (no fabrication: both numbers directly stated in the paper)
---

Claim: "MiniCheck 770M params matches GPT-4 at 400x lower cost"
Citation: arXiv 2404.10774
Source: https://arxiv.org/abs/2404.10774
Status: VERIFIED
Evidence: The abstract states: "Our best system MiniCheck-FT5 (770M parameters) outperforms all systems of comparable size and reaches GPT-4 accuracy." It further states: "we show how to build small fact-checking models that have GPT-4-level performance but for 400x lower cost."
DRA Flags: NONE — G4 (770M params, GPT-4 match, and 400x cost all confirmed verbatim in abstract), T2 (context matches: paper is about fact-checking LLM outputs against grounding documents, directly relevant to verification claims)
---

Claim: "AI fact-checks decrease belief in true news by 12.75% when AI errs"
Citation: PNAS Dec 2024
Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC11648662/
Status: VERIFIED
Evidence: The paper reports: "there was a 12.75% decrease in the belief of true headlines incorrectly judged as false by ChatGPT (U=35,937, P < 0.001, d=-0.38, 95% CI: [-18.67%,-6.89%])." The paper title is "Fact-checking information from large language models can decrease headline discernment."
DRA Flags: NONE — G4 (12.75% figure confirmed with full statistical details including CI and effect size), G5 (no fabrication: the decrease in belief of true news when AI errs is the paper's core finding)
---

Claim: "LLM-Rubric achieves 2x improvement in RMS error over uncalibrated baseline"
Citation: ACL 2024
Source: https://aclanthology.org/2024.acl-long.745/
Status: VERIFIED
Evidence: The abstract states: "LLM-Rubric with 9 questions predicts human judges' assessment of overall user satisfaction, on a scale of 1-4, with RMS error < 0.5, a 2x improvement over the uncalibrated baseline." Paper title: "LLM-Rubric: A Multidimensional, Calibrated Approach to Automated Evaluation of Natural Language Texts."
DRA Flags: NONE — G4 (2x improvement and RMS error < 0.5 confirmed verbatim in abstract), T2 (context matches: paper is about calibrated evaluation of natural language texts, directly relevant to evaluation/rubric claims)
---

Claim: "Half-life recency prior achieves 1.00 accuracy on latest-document retrieval"
Citation: arXiv 2509.19376
Source: https://arxiv.org/html/2509.19376
Status: VERIFIED
Evidence: The paper reports: "the fused score demonstrated a dramatic improvement over the semantic baseline, achieving a perfect Latest@10 accuracy of 1.00 compared to the baseline of 0.00." Table 5 confirms: "Latest@10 Accuracy: Baseline 0.00, Temporal Layer 1.00." On real-world data: "the fused scoring method achieved a perfect accuracy of 1.00" using the "Latest-Set@10" metric. Paper title: "Solving Freshness in RAG: A Simple Recency Prior and the Limits of Heuristic Trend Detection."
DRA Flags: NONE — G4 (1.00 accuracy confirmed in both text and Table 5 for synthetic and real-world data), G5 (no fabrication: paper explicitly reports perfect accuracy on latest-document retrieval task)
---
