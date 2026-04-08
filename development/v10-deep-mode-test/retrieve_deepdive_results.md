# Phase 3 RETRIEVE — Deep Dive Results
## Written: 2026-04-01

### Paper 1: Self-Manager (arXiv:2601.17879, Jan 2026)
- **Key Innovation:** Thread Control Blocks (TCBs) for managing parallel agent subthreads with isolated contexts
- **Architecture:** Main thread creates multiple subthreads, each with own isolated context, managed iteratively via TCBs
- **Problem Solved:** Sequential execution causes mutual interference and blocking in long-form research
- **Results:** Outperforms single-agent loop baselines across all metrics on DeepResearch Bench
- **Applicability to Prompt-Based:** YES — the parallel subthread with isolated context pattern is directly implementable via agent spawning
- **NOVEL vs existing skill:** The skill already uses heterogeneous sub-agents, but Self-Manager's TCB pattern adds: (1) iterative management of subthreads (not fire-and-forget), (2) explicit context isolation as a design principle, (3) async/concurrent execution model
- **Credibility:** 70/100 (arxiv preprint, Jan 2026, no conference acceptance mentioned)

### Paper 2: Inference-Time Scaling of Verification (arXiv:2601.15808, Jan 2026)
- **Key Innovation:** DRA Failure Taxonomy (5 major categories, 13 sub-categories) + rubric-guided verification + DeepVerifier
- **Architecture:** Test-time plug-and-play module. Verifier produces rubric-based feedback → agent iteratively bootstraps/refines without training
- **Results:** 8-11% accuracy gains on GAIA and XBench-DeepResearch challenging subsets. DeepVerifier outperforms vanilla agent-as-judge by 12-48% in F1.
- **Key Concept: Verification Asymmetry** — verification is easier than generation, so scaling verification compute is more efficient
- **Resource:** DeepVerifier-4K dataset (4,646 high-quality agent steps)
- **Applicability to Prompt-Based:** YES — rubric-guided verification is purely prompt-based. The failure taxonomy can be encoded as verification rubrics.
- **NOVEL vs existing skill:** Skill has tool-grounded verification and inline verification, but NOT rubric-guided verification with a structured failure taxonomy. The DRA Failure Taxonomy (5 categories, 13 sub-categories) is a new systematic framework. Also: verification asymmetry as a scaling principle (scale verification compute, not generation compute) is new.
- **Credibility:** 80/100 (concrete benchmark numbers, released dataset, clear methodology)

### Paper 3: Why Your Deep Research Agent Fails (arXiv:2601.22984, Jan 2026)
- **Key Innovation:** PIES Taxonomy for hallucination classification + DeepHalluBench (100 hallucination-prone tasks)
- **PIES Taxonomy:** Two dimensions: (1) Functional: Planning vs Summarization, (2) Error Properties: Explicit vs Implicit
- **Key Finding:** None of 6 SOTA systems achieved robust reliability. Failures traced to hallucination propagation and cognitive biases.
- **Process-Aware Evaluation:** Shift from outcome-based to process-aware (auditing complete trajectories, not just final answers)
- **Applicability to Prompt-Based:** YES — PIES taxonomy can inform verification rubrics. Process-aware evaluation is applicable.
- **NOVEL vs existing skill:** Skill doesn't have process-aware trajectory auditing or the PIES taxonomy for classifying hallucination types during verification. The distinction between Planning hallucinations and Summarization hallucinations is actionable.
- **Credibility:** 75/100 (arxiv preprint, concrete benchmark, tested 6 SOTA systems)

### Paper 4: CATTS — Confidence-Aware Test-Time Scaling (arXiv:2602.12276, Feb 2026)
- **Key Innovation:** Dynamic compute allocation based on decision uncertainty (entropy + top-1/top-2 margin)
- **Architecture:** Vote-derived metrics signal when additional sampling is needed vs. when consensus is sufficient
- **Results:** Up to 9.1% improvement over ReAct baseline, up to 2.3x token efficiency vs. uniform scaling
- **Arbiter approach:** LLM arbiter outperforms naive voting BUT can overrule high-consensus decisions (reliability concern)
- **Applicability to Prompt-Based:** YES — confidence-aware compute allocation is an orchestration pattern
- **NOVEL vs existing skill:** Skill doesn't have confidence-aware dynamic compute scaling. Currently uses fixed verification budgets (e.g., 10 supersession searches). CATTS principle: spend more compute on uncertain claims, less on confident ones.
- **Credibility:** 75/100 (arxiv preprint, concrete benchmark numbers on WebArena-Lite and GoBrowse)

### Paper 5: Search More, Think Less (SMTL) (arXiv:2602.22675, Feb 2026)
- **Key Insight:** Parallel evidence acquisition beats deep sequential reasoning for search-intensive tasks
- **Counter-intuitive:** Reducing reasoning steps by 70.7% on BrowseComp while IMPROVING accuracy
- **Results:** BrowseComp 48.6%, GAIA 75.7%, Xbench 82.0%, DeepResearch Bench 45.9%
- **Technique:** Replace sequential reasoning chains with parallel evidence gathering under constrained context budgets
- **Training component:** Uses SFT + RL (training-based), BUT the architectural insight (favor search breadth over reasoning depth) is applicable to prompt-based systems
- **NOVEL vs existing skill:** Skill already uses parallel retrieval, but SMTL's insight is more radical: actively reduce reasoning in favor of more searches. The skill's Think2 metacognitive cycling adds reasoning overhead — SMTL suggests this may be counterproductive for retrieval-heavy phases.
- **Credibility:** 78/100 (strong benchmark results across 4 benchmarks, Feb 2026)

### Paper 6: Marco DeepResearch (arXiv:2603.28376, Mar 2026)
- **Key Innovations:**
  1. Verified QA Synthesis — graph-based and agent-based pipelines with explicit verification to control question difficulty and ensure answer uniqueness
  2. Verification-Driven Trajectory Construction — injecting explicit verification patterns into training data
  3. Self-as-Verifier Test-Time Scaling — using the agent itself as verifier at inference time
- **Results:** 8B model surpasses/approaches 30B agents on BrowseComp-ZH under 600 tool call constraint
- **Training-based components:** QA synthesis and trajectory construction are training-time. Self-as-verifier is inference-time.
- **NOVEL vs existing skill:** The self-as-verifier at test time is related to but distinct from verifier-guided retry (which spawns a fresh subprocess). Marco's approach uses the SAME agent as verifier in-context, which is simpler but potentially subject to confirmation bias.
- **Credibility:** 82/100 (March 2026, concrete benchmark comparisons, clear methodology)
