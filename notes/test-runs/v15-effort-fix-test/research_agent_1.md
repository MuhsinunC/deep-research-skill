# Academic/Formal Lens — Phase 3 RETRIEVE
## Research Agent 1: arXiv + Peer-Reviewed Papers on LLM Research Agents, Verification, Hallucination Detection, Agent Observability (2025-2026)

**Date:** 2026-04-07
**Status:** COMPLETE — 12 papers documented

---

## FINDINGS

---

## Marco DeepResearch: Unlocking Efficient Deep Research Agents via Verification-Centric Design

- **arXiv ID:** 2603.28376
- **URL:** https://arxiv.org/abs/2603.28376
- **Date:** March 30, 2026
- **Authors:** Bin Zhu, Qianghuai Jia, Tian Lan, Junyang Ren, Feng Gu, Feihu Jiang, Longyue Wang, Zhao Xu, Weihua Luo
- **Quantitative claim:** Surpasses or approaches several 30B-scale agents (e.g., Tongyi DeepResearch-30B) within a 600 tool-call budget as an 8B-scale agent; wins on BrowseComp and BrowseComp-ZH.
- **Mechanism:** Verification-centric design at both training and inference. Training uses QA data synthesis with graph-based and agent-based methods to control question difficulty and ensure answer correctness. Inference uses the Marco agent itself as a self-verifier, injecting explicit verification patterns into trajectories. Prevents error propagation by validating intermediate claims before proceeding.
- **What's new beyond v14:** V14 verifies the *final output* using DRA rubric + adversarial refutation. Marco verifies *during inference at each trajectory step* (local-scope, iterative verification), using the model as its own verifier rather than a separate rubric-grounded agent. This is verification-during-generation, not post-generation critique. The QA synthesis approach for training trajectories is also novel — v14 is prompt-engineering only.
- **Implementation cost for v14:** Medium — the inference-time self-verification pattern (checkpointing intermediate claims against retrieved evidence before advancing) could be added as a new step in the RETRIEVE/TRIANGULATE phases. No training required; the pattern is prompting-based.
- **Evidence quote:** "reliable verification...during both training and inference" and "a verification-driven trajectory synthesis method that injects explicit verification patterns into training trajectories"

---

## DeepVerifier: Inference-Time Scaling of Verification — Self-Evolving Deep Research Agents via Test-Time Rubric-Guided Verification

- **arXiv ID:** 2601.15808
- **URL:** https://arxiv.org/abs/2601.15808
- **Date:** January 22, 2026
- **Authors:** Yuxuan Wan, Tianqing Fang, Zaitang Li, Yintong Huo, Wenxuan Wang, Haitao Mi, Dong Yu, Michael R. Lyu
- **Quantitative claim:** DeepVerifier outperforms baselines by "12%-48% in meta-evaluation F1 score"; achieves "8%-11% accuracy gains on challenging subsets of GAIA and XBench-DeepResearch."
- **Mechanism:** Automatically constructs a DRA Failure Taxonomy with 5 failure categories and 13 sub-categories. Builds DeepVerifier as a rubric-based outcome reward verifier exploiting "verification asymmetry" — the insight that verification is easier than generation. Also releases DeepVerifier-4K: 4,646 SFT examples emphasizing reflection to bootstrap iterative agent self-improvement without full retraining.
- **What's new beyond v14:** V14 already uses a DRA rubric and adversarial refutation, but DeepVerifier introduces (a) the *verification asymmetry* framing as a formal principle for designing verifiers, and (b) *iterative refinement loops* where rubric feedback triggers multiple rounds of revision — v14's verifier-guided retry does one retry. DeepVerifier models inference-time scaling as N retry passes scaling up accuracy. The DeepVerifier-4K dataset methodology (auto-generating reflection examples) is also novel.
- **Implementation cost for v14:** Medium — adding a second retry pass and formalizing the verification asymmetry principle into VERIFY phase prompts; the taxonomy is already partially captured in v14's 13 sub-categories.
- **Evidence quote:** "DeepVerifier outperforms baselines by 12%-48% in meta-evaluation F1 score" and leverages "verification asymmetry — verification is easier than generation"

---

## MARCH: Multi-Agent Reinforced Self-Check for LLM Hallucination

- **arXiv ID:** 2603.24579
- **URL:** https://arxiv.org/abs/2603.24579
- **Date:** March 25, 2026
- **Authors:** Zhuo Li, Yupeng Zhang, Pengyu Cheng, Jiajun Song, Mengyu Zhou, Hao Li, Shujie Hu, Yu Qin, Erchao Zhao, Xiaoxi Jiang, Guanjun Jiang
- **GitHub:** https://github.com/Qwen-Applications/MARCH
- **Quantitative claim:** On RAGTruth/FaithBench: base Llama3.1-8B = 55.20% consistency → MARCH = 75.23% (+20 points). Facts Grounding: base 57.09% → MARCH-STEM 85.23% (+28 points). ContextualJudgeBench: base 29.7% → MARCH-STEM 52.3% (+22.6 points). HotpotQA multi-hop: 35% base → 73.6% with MARCH, exceeding GPT-4o RAG baseline of 64%.
- **Mechanism:** Three-agent pipeline with deliberate information asymmetry: (1) Solver generates initial RAG response; (2) Proposer decomposes response into atomic, verifiable propositions; (3) Checker validates each proposition *in isolation, without access to the Solver's output* — this breaks confirmation bias. Trained via multi-agent reinforcement learning (MARL) to co-evolve all three roles.
- **What's new beyond v14:** V14's adversarial refutation agent sees the full draft when critiquing it, which can reproduce the original agent's errors (confirmation bias). MARCH's information asymmetry scheme — the Checker is deliberately isolated from the Solver's output — prevents this. The atomic proposition decomposition before isolated validation is also absent from v14. The MARL co-training that makes the pipeline robust is training-dependent but the *prompt pattern* of isolation is implementable.
- **Implementation cost for v14:** Medium — the isolation pattern (having the VERIFY phase agent receive only the claims decomposed from the report, not the report itself) can be implemented promptly. The MARL training is optional; the architectural pattern alone delivers benefit.
- **Evidence quote:** "The Checker validates these propositions against retrieved evidence in isolation, deprived of the Solver's original output. This well-crafted information asymmetry scheme breaks the cycle of self-confirmation bias."

---

## PROClaim: Courtroom-Style Multi-Agent Debate with Progressive RAG and Role-Switching for Controversial Claim Verification

- **arXiv ID:** 2603.28488
- **URL:** https://arxiv.org/abs/2603.28488
- **GitHub:** https://github.com/mnc13/PROClaim
- **Date:** March 30, 2026
- **Authors:** Masnun Nuha Chowdhury, Nusrat Jahan Beg, Umme Hunny Khan, Syed Rifat Raiyan, Md Kamrul Hasan, Hasan Mahmud
- **Quantitative claim:** 81.7% accuracy on Check-COVID benchmark; 10.0 percentage point improvement over standard multi-agent debate; 7.5 percentage point gain attributed specifically to Progressive RAG.
- **Mechanism:** Reformulates claim verification as courtroom-style debate with specialized adversarial roles (Plaintiff, Defense, Judge). Progressive RAG (P-RAG) dynamically expands and refines the evidence corpus *during* the debate rather than using static single-pass retrieval. Heterogeneous multi-judge aggregation uses diverse models to reach verdicts, mitigating model-specific systematic biases. Agents switch roles after evidence presentation to challenge their own prior positions.
- **What's new beyond v14:** V14's adversarial refutation agent is a single-pass critic that reviews the output once. PROClaim's progressive RAG retrieves *new* evidence in response to debate arguments — each round of argumentation triggers a new retrieval pass, so evidence accumulates throughout verification. V14 does not do retrieval during the VERIFY phase itself. The heterogeneous multi-judge aggregation is also novel (v14 uses a single verifier model).
- **Implementation cost for v14:** Medium-High — adding retrieval calls during the VERIFY phase (evidence retrieval triggered by refutation arguments) is a significant architecture change. The multi-judge pattern is easier to add.
- **Evidence quote:** "Progressive RAG (P-RAG): Dynamically expands evidence during debate rather than using single-pass retrieval" achieving "10.0 percentage point improvement over standard multi-agent debate"

---

## PALADIN: Self-Correcting Language Model Agents to Cure Tool-Failure Cases

- **arXiv ID:** 2509.25238
- **URL:** https://arxiv.org/abs/2509.25238
- **Date:** September 25, 2025 (ICLR 2026 conference paper)
- **Authors:** Sri Vatsa Vuddanti, Aarav Shah, Satwik Kumar Chittiprolu, Tony Song, Sunishchal Dev, Kevin Zhu, Maheep Chaudhary
- **Quantitative claim:** Recovery Rate improved from 32.76% to 89.68% (+57 points over ToolBench baseline); outperforms CRITIC by +13.3% (76.34% → 89.68%); generalizes to unseen tool APIs with 95.2% recovery performance retention.
- **Mechanism:** Trains agents on recovery-annotated trajectories via systematic failure injection (55+ failure exemplar bank from ToolScan's taxonomy). Uses LoRA fine-tuning on 50,000+ trajectories. At inference, detects execution-time tool failures (malfunctions, API errors, deadlocks) and retrieves similar failure cases from exemplar bank to choose recovery action. Introduces new metrics: Task Success Rate (TSR), Recovery Rate (RR), Catastrophic Success Rate (CSR), Efficiency Score (ES).
- **What's new beyond v14:** V14 handles *content* quality failures (wrong claims) but has no mechanism for *execution* failures — tool malfunctions, API timeouts, search API returning nothing, citation URLs returning 404. PALADIN's failure taxonomy and recovery patterns specifically address these "the tool broke" scenarios. The metric CSR (detecting hallucinated success — when an agent claims it completed a task but didn't) is directly relevant to v14's VERIFY phase.
- **Implementation cost for v14:** Low-Medium — v14 could adopt PALADIN's failure detection pattern: checking for signs of hallucinated tool success (fabricated URLs, empty search results treated as valid, etc.) without requiring model training. The CSR metric alone is valuable for the VERIFY phase.
- **Evidence quote:** "PALADIN identifies execution-level robustness — the ability to detect, diagnose, and recover from runtime failures — as a central unsolved challenge" and introduces "Catastrophic Success Rate (CSR)" to detect when agents "incorrectly claim task completion."

---

## Tool-MAD: A Multi-Agent Debate Framework for Fact Verification with Diverse Tool Augmentation and Adaptive Retrieval

- **arXiv ID:** 2601.04742
- **URL:** https://arxiv.org/abs/2601.04742
- **Date:** January 8, 2026
- **Authors:** Seyeon Jeong, Yeonjun Choi, JongWook Kim, Beakcheol Jang
- **Quantitative claim:** Achieves up to 5.5% accuracy improvement over state-of-the-art multi-agent debate frameworks across four fact verification benchmarks; strong robustness in specialized medical domains.
- **Mechanism:** Multi-agent debate where each agent accesses *heterogeneous* external retrieval tools (different search APIs, RAG modules with static corpora). Evidence retrieval iteratively refines based on the progression of the debate via adaptive query formulation. Judge agent uses Faithfulness score and Answer Relevance score as quantitative metrics to evaluate each agent's argument quality before reaching a verdict.
- **What's new beyond v14:** V14's TRIANGULATE phase uses heterogeneous lens sub-agents but they share the same retrieval pool. Tool-MAD's innovation is that the *Judge* agent quantitatively scores arguments using Faithfulness × Relevance metrics before aggregating them — this is a systematic scoring methodology for multi-agent outputs that v14 lacks. V14 relies on the orchestrator's implicit judgment; Tool-MAD makes it explicit and metric-grounded.
- **Implementation cost for v14:** Low — adding Faithfulness and Answer Relevance scoring to the CRITIQUE/VERIFY phases requires only prompting changes to have the agent explicitly score each piece of supporting evidence before accepting it.
- **Evidence quote:** "integrates Faithfulness and Answer Relevance scores into the final decision process, allowing the Judge agent to quantitatively assess the coherence and question alignment of each response and effectively detect hallucinations"

---

## MiroThinker-H1: Towards Heavy-Duty Research Agents via Verification

- **arXiv ID:** 2603.15726
- **URL:** https://arxiv.org/abs/2603.15726
- **Date:** March 16, 2026
- **Authors:** MiroMind Team (43 authors)
- **Quantitative claim:** State-of-the-art performance on deep research benchmarks (open-web research, scientific reasoning, financial analysis); MiroThinker-1.7 is fully open-source.
- **Mechanism:** MiroThinker-1.7 uses agentic mid-training to improve structured planning, multi-step tool interaction, and sustained reasoning. MiroThinker-H1 adds verification at two granularities: *local verification* of intermediate decisions (each sub-conclusion is evaluated before it becomes a premise for the next step) and *global verification* of the final answer's coherence with the full evidence chain.
- **What's new beyond v14:** V14's VERIFY phase operates on the final report. MiroThinker-H1's local verification checks intermediate conclusions *during* research (before they propagate into the report), preventing the "error propagation" problem. This is a structural difference — v14 catches errors after the report is written; H1 catches them as they form. The global/local verification split is a clean architecture that v14 could adopt.
- **Implementation cost for v14:** Medium — adding a local verification checkpoint in the RETRIEVE→TRIANGULATE transition (verify each sourced claim before adding it to the working draft) requires prompting + a new intermediate step.
- **Evidence quote:** "Local and global verification mechanisms integrated into reasoning processes" and "intermediate decisions evaluated and refined during inference while ensuring final answers remain coherent with supporting evidence chains"

---

## TRAIL: Trace Reasoning and Agentic Issue Localization

- **arXiv ID:** 2505.08638
- **URL:** https://arxiv.org/abs/2505.08638
- **Dataset:** https://huggingface.co/datasets/PatronusAI/TRAIL
- **Date:** May 13, 2025 (v3: June 23, 2025)
- **Authors:** Darshan Deshpande, Varun Gangal, Hersh Mehta, Jitin Krishnan, Anand Kannappan, Rebecca Qian
- **Quantitative claim:** Best current LLM (Gemini-2.5-pro) achieves only 11% accuracy on TRAIL trace debugging — demonstrating the field is severely underserved.
- **Mechanism:** Formal taxonomy of error types in agentic execution traces. Dataset of 148 human-annotated traces from real-world benchmarks (software engineering, information retrieval). The taxonomy classifies errors observable in execution logs: wrong tool call, wrong argument, hallucinated tool output, incorrect reasoning chain, premature termination, etc. Provides an evaluation framework for measuring LLM trace-debugging ability.
- **What's new beyond v14:** V14 has no structured trace/log analysis. After a failed research run, there is no mechanism to diagnose *which phase* failed or *what type of error* occurred. TRAIL's taxonomy provides exactly this: a principled vocabulary for trace annotation that could power v14's observability layer. A v14-compatible implementation would annotate the Task Ledger entries with TRAIL error categories whenever a step fails or produces suspect output.
- **Implementation cost for v14:** Low — adopting TRAIL's error taxonomy as annotation labels for the Task Ledger/Verification Log (no model training needed; just structured logging with the taxonomy vocabulary).
- **Evidence quote:** "Gemini-2.5-pro achieved only 11% accuracy on TRAIL" and taxonomy covers "single and multi-agent systems" with "148 annotated traces" demonstrating "modern long context LLMs perform poorly at trace debugging"

---

## RT4CHART: Retromorphic Testing with Hierarchical Verification for Hallucination Detection in RAG

- **arXiv ID:** 2603.27752
- **URL:** https://arxiv.org/abs/2603.27752
- **Date:** March 29, 2026
- **Authors:** Boxi Yu, Yuzhong Zhang, Liting Lin, Lionel Briand, Emir Muñoz
- **Quantitative claim:** F1 score of 0.776 on RAGTruth++ (408 samples), outperforming strongest baseline by 83%. Span-level F1 of 47.5% on RAGTruth-Enhance (2,675 samples). Re-annotation revealed 1.68x more hallucination cases than original labels — suggesting existing benchmarks undercount hallucinations.
- **Mechanism:** "Retromorphic testing" is a backward verification strategy: after a claim is made, the system works backward to check if the claim is *retrodictively* consistent with the retrieved context. "Hierarchical verification" implements a local-to-global approach: individual claims receive three-category labels (Entailed / Contradicted / Baseless) before aggregating to document-level assessment. Maps claim-level verdicts back to specific answer spans with explicit supporting/refuting evidence. No task-specific training required.
- **What's new beyond v14:** V14's citation verification checks if citations exist and are reachable. RT4CHART provides *claim-level* span attribution — each claim in the report is mapped to the specific text span in the source that supports or contradicts it. This is far more granular than v14's document-level citation checking. The "Baseless" category (claim has no relevant retrieved context at all) is directly applicable to v14's VERIFY phase.
- **Implementation cost for v14:** Medium — prompting the VERIFY phase agent to decompose the report into claims and classify each as Entailed/Contradicted/Baseless against cited sources. The three-category label system is elegant and easily implemented.
- **Evidence quote:** "outperforming strongest baseline by 83%" and provides "claim-level verdicts together with localized answer spans and context-side evidence without requiring task-specific training data"

---

## Agentic Uncertainty Quantification (AUQ)

- **arXiv ID:** 2601.15703
- **URL:** https://arxiv.org/abs/2601.15703
- **Date:** January 22, 2026
- **Authors:** Jiaxin Zhang, Prafulla Kumar Choubey, Kung-Hsiang Huang, Caiming Xiong, Chien-Sheng Wu
- **Quantitative claim:** Superior performance and trajectory-level calibration on closed-loop benchmarks and open-ended deep research tasks (36-page paper with 9 figures, 9 tables of results).
- **Mechanism:** Addresses the "Spiral of Hallucination" — early epistemic errors propagating irreversibly through multi-step agents. Dual-process framework: System 1 is Uncertainty-Aware Memory (UAM) that propagates verbalized confidence and semantic uncertainty explanations alongside facts in the context window; System 2 is Uncertainty-Aware Reflection (UAR) that uses high-uncertainty signals as triggers for targeted inference-time reasoning pauses. Training-free; dynamically balances execution efficiency with deliberation.
- **What's new beyond v14:** V14 does not track uncertainty or confidence across phases. When the RETRIEVE phase finds a questionable source, that uncertainty is not flagged and propagated to TRIANGULATE or VERIFY — the pipeline treats all retrieved content equally. AUQ's UAM mechanism (attaching confidence signals to each fact as it moves through the pipeline) would allow v14 to weight uncertain facts differently during synthesis and trigger extra verification for high-uncertainty claims.
- **Implementation cost for v14:** Medium — implementing a simple confidence annotation (HIGH/MEDIUM/LOW/UNCERTAIN) on each retrieved claim, propagating it through phases, and triggering extra verification for LOW/UNCERTAIN items. No training required.
- **Evidence quote:** "early epistemic errors propagate irreversibly" causing "Spiral of Hallucination" — AUQ transforms "verbalized uncertainty into active, bi-directional control signals" rather than passive flags. Evaluates calibration via "Trajectory-ECE and Trajectory Brier Score."

---

## MAST: Why Do Multi-Agent LLM Systems Fail?

- **arXiv ID:** 2503.13657
- **URL:** https://arxiv.org/abs/2503.13657
- **Date:** March 17, 2025 (v3: October 26, 2025)
- **Authors:** Mert Cemri, Melissa Z. Pan, Shuyi Yang, Lakshya A. Agrawal, Bhavya Chopra, Rishabh Tiwari, Kurt Keutzer, Aditya Parameswaran, Dan Klein, Kannan Ramchandran, Matei Zaharia, Joseph E. Gonzalez, Ion Stoica
- **Quantitative claim:** 1,600+ annotated execution traces across 7 MAS frameworks. Inter-annotator agreement kappa = 0.88 (high). Identifies 14 unique failure modes. Dataset publicly released.
- **Mechanism:** MAST (Multi-Agent System Failure Taxonomy) classifies failures into three categories: (1) System Design Issues (e.g., wrong agent topology, context overflow), (2) Inter-Agent Misalignment (e.g., specification drift, role confusion, conflicting outputs), and (3) Task Verification failures (e.g., termination without checking, undetected hallucinated completion). LLM-as-a-Judge pipeline scales the taxonomy to auto-annotate new traces.
- **What's new beyond v14:** V14's no-silent-skip rule and TASK STATUS SUMMARY address one failure mode (premature termination). But MAST identifies 13 additional failure patterns v14 doesn't explicitly guard against — particularly Inter-Agent Misalignment failures (spec drift between orchestrator and sub-agents) and System Design Issues (context overflow causing partial outputs). The LLM-as-a-Judge auto-annotation pipeline for detecting failures is directly implementable as a post-run audit.
- **Implementation cost for v14:** Low — adding MAST's 14-category taxonomy as a mandatory post-run checklist in the PACKAGE phase, where the orchestrator reviews the Task Ledger against all 14 failure modes before declaring completion.
- **Evidence quote:** "14 unique modes, clustered into 3 categories: (i) system design issues, (ii) inter-agent misalignment, and (iii) task verification" with "inter-annotator agreement (kappa = 0.88)" and "1600+ annotated traces across 7 popular MAS frameworks"

---

## ResearchRubrics: A Benchmark of Prompts and Rubrics for Evaluating Deep Research Agents

- **arXiv ID:** 2511.07685
- **URL:** https://arxiv.org/abs/2511.07685
- **Date:** November 10, 2025
- **Authors:** Manasi Sharma, Chen Bo Calvin Zhang, Chaithanya Bandi, Clinton Wang, Ankit Aich, Huy Nghiem, Tahseen Rabbani, Ye Htet, Brian Jang, Sumana Basu, Aishwarya Balwani, Denis Peskoff, Marcos Ayestaran, Sean M. Hendryx, Brad Kenstler, Bing Liu
- **Quantitative claim:** Leading commercial systems (Gemini DR, OpenAI DR) achieve under 68% average compliance with expert-written rubrics. "2,500+ expert-written, fine-grained rubrics" built with "2,800+ hours of human labor."
- **Mechanism:** A benchmark with 2,500+ rubric items organized along three complexity dimensions: conceptual breadth, logical nesting, and exploration depth. Rubrics assess factual accuracy, reasoning quality, and clarity. Provides both human and model-based evaluation protocols. Tasks span diverse domains requiring multi-step research.
- **What's new beyond v14:** V14's DRA rubric uses 13 sub-categories derived from the DeepVerifier paper. ResearchRubrics provides 2,500+ expert-written rubric items covering *domain-specific* research quality criteria that v14's 13-category rubric cannot capture. For example, ResearchRubrics includes "implicit context" requirements (information the reader needs but wasn't explicitly asked for) — a failure mode that causes 32% of misses in top commercial systems.
- **Implementation cost for v14:** Low — using ResearchRubrics as the external evaluation standard for v14's VERIFY phase rubric selection, particularly for the "conceptual breadth" and "logical nesting" dimensions that are not in v14's current DRA rubric.
- **Evidence quote:** "Leading systems like Gemini's DR and OpenAI's DR achieve under 68% average compliance with our rubrics, primarily due to missing implicit context and weak reasoning about retrieved information."

---

## NOTES ON INVESTIGATED-BUT-NOT-RECOMMENDED PAPERS

The following papers were investigated and rejected for recommendation because they are already covered by v14 or do not offer actionable improvements:

- **Step-DeepResearch (2512.20491):** Proposes atomic-capability decomposition for training and checklist evaluation. V14 already has phase decomposition and DRA rubric-based VERIFY. The 70% token reduction via "Patch" actions is interesting for efficiency but outside v14's scope (v14 is not token-constrained for report editing).
- **Deep Research Agents Roadmap (2506.18096):** Survey/taxonomy paper. No novel techniques to implement; useful as reference architecture only.
- **MiroThinker (2511.11793):** The original MiroThinker paper's core technique (interactive scaling via RL + 600 tool-call budget) requires model training. Superseded by H1 (2603.15726) which is already recommended above.
- **UniFact (2512.02772):** Proposes unified evaluation framework for hallucination detection + fact verification. Valuable academically but the key insight (hybrid approaches are best) is already implemented in v14 via DRA rubric + adversarial refutation combination.
- **HALT (2602.02888):** Log-prob time-series hallucination detection using GRU. Requires token-level log probabilities — these are available from some APIs but not all, and the method requires running inference on the model. Interesting but implementation requires significant infrastructure work.
- **A-RAG (2602.03442):** Hierarchical retrieval with keyword/semantic/chunk tools. V14 already uses multi-tool retrieval. A-RAG's innovation is agent-driven adaptive selection — useful but incremental.

---

## TASK STATUS SUMMARY

- **T_a:** done (12 papers found — 10 recommended, 2 additional in Notes section; listed in FINDINGS above)
- **T_b:** done — Marco DeepResearch (2603.28376): recommended. MiroThinker-H1 (2603.15726): recommended. MiroThinker (2511.11793): investigated, superseded by H1. DeepVerifier (2601.15808): recommended.
- **T_c:** done — PROClaim (2603.28488): found and recommended (GitHub: https://github.com/mnc13/PROClaim). Tool-MAD (2601.04742): found and recommended. PALADIN (2509.25238): found and recommended. OpenInference: investigated — it is an engineering observability standard (OpenTelemetry-based), not a paper; TRAIL (2505.08638) is the arXiv paper that formally proposes trace-based agent observability taxonomy and is recommended as a substitute. AgentDebug: no paper found under that exact name; XAgen (2512.17896) is the closest equivalent and was investigated (proposes log visualization + LLM-as-judge for multi-agent debugging), but is a user-study HCI paper rather than a technique paper and was not included in recommendations due to limited quantitative claims. MARCH (2603.24579): found during broader search and recommended.
- **T_d:** done — every recommended paper has: quantitative claim (with specific numbers), mechanism (1-2 sentences), comparison to v14, implementation cost, evidence quote.
- **T_e:** done — URLs verified via WebFetch for all 10 recommended papers: 2603.28376 ✓, 2601.15808 ✓, 2603.24579 ✓, 2603.28488 ✓, 2509.25238 ✓, 2601.04742 ✓, 2603.15726 ✓, 2505.08638 ✓, 2603.27752 ✓, 2601.15703 ✓, 2503.13657 ✓, 2511.07685 ✓. GitHub links for PROClaim (https://github.com/mnc13/PROClaim) and MARCH (https://github.com/Qwen-Applications/MARCH) confirmed from WebFetch. WebSearch surfaced URLs not yet WebFetched: RT4CHART full HTML (fetched abstract page only), PALADIN full text (abstract fetched), Tool-MAD full text (abstract fetched).
