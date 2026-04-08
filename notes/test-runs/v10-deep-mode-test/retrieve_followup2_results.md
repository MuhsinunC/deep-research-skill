# Phase 3 RETRIEVE — Follow-up Batch 2 Results
## Written: 2026-04-01

### BATS: Budget-Aware Test-Time Scaling (arXiv:2511.17006, Nov 2025)
- **Key Innovation:** Budget Tracker plug-in gives agents continuous budget awareness + BATS framework
- **Technique:** Dynamic adaptation of planning and verification based on remaining resources
- **Decision pattern:** "dig deeper" on promising leads vs. "pivot" to new paths based on budget
- **Key Finding:** Simply granting more tool calls fails without budget awareness — agents hit performance ceiling
- **Prompting-based:** YES (lightweight plug-in, no training)
- **NOVEL for skill:** The skill uses fixed budgets (e.g., 10 supersession searches, 2 loop-back cycles). BATS provides dynamic reallocation. Budget Tracker pattern is directly implementable via prompt injection.
- **Credibility:** 82/100 (Nov 2025, Google Research, systematic study, formalized cost metric)

### WebWeaver: Dynamic Outlines (arXiv:2509.13312, Sep 2025)
- **Key Innovation:** Dual-agent framework (Planner + Writer) with iterative outline optimization
- **Architecture:** Planner interleaves evidence acquisition with outline refinement, creates evidence-linked outline with memory bank. Writer performs hierarchical section-by-section synthesis.
- **Problem solved:** Static research pipelines decouple planning from evidence; monolithic generation includes redundant/irrelevant evidence
- **Results:** SOTA on DeepResearch Bench, DeepConsult, DeepResearchGym
- **NOVEL for skill:** The skill's Phase 4.5 OUTLINE REFINEMENT already does dynamic outline adaptation. But WebWeaver's innovation is the evidence-linked memory bank (each outline section explicitly links to specific evidence) + hierarchical writer that retrieves only relevant evidence per section. The skill doesn't have evidence-section linkage.
- **Credibility:** 80/100 (Sep 2025, strong benchmark results, clear methodology, recent enough for tech domain)

### ReSum: Context Summarization for Long-Horizon Search (arXiv:2509.13313, Sep 2025)
- **Key Innovation:** Periodic context summarization via external tool to enable unbounded exploration
- **Technique:** Convert growing interaction histories into compact reasoning states while maintaining awareness
- **Results:** 4.5% improvement over ReAct in training-free settings; ReSum-GRPO adds 8.2% more
- **Plug-and-play:** YES (lightweight paradigm, works without training)
- **NOVEL for skill:** The skill's context management relies on Claude Code's built-in context compaction. ReSum's explicit periodic summarization is an intentional strategy vs. the skill's passive reliance on system compaction. Could be implemented as explicit checkpoint summaries.
- **Credibility:** 78/100 (Sep 2025, arxiv, concrete improvement numbers)

### HiPRAG: Hierarchical Process Rewards (arXiv:2510.07794, Oct 2025)
- **Key Innovation:** Fine-grained process rewards that decompose agent reasoning into discrete steps
- **Problem addressed:** Over-search (retrieval when unnecessary) and under-search (failing to search when needed)
- **Results:** Over-search rate: from 27%+ → 2.3%. Accuracy: 65.4% (3B), 67.2% (7B)
- **Training-based:** YES (RL training with PPO/GRPO)
- **Insight applicable to prompting:** The CONCEPT of identifying over-search and under-search as failure modes, and making search decisions explicitly reasoned, is applicable. A prompt-based skill could add metacognitive checks: "Should I search again or do I already have enough?"
- **NOVEL for skill:** The skill doesn't explicitly address over-search (wasting budget on redundant retrieval) or under-search (moving forward without enough evidence). This metacognitive dimension is new.
- **Credibility:** 80/100 (Oct 2025, tested on multiple model families and sizes)

### Tool-MAD: Multi-Agent Debate for Fact Verification (arXiv:2601.04742, Jan 2026)
- Iterative retrieval + dynamic multi-agent interactions
- Up to 35.5% improvement over MAD (standard multi-agent debate)
- Diverse tool augmentation across agents
- **NOVEL for skill:** Adversarial debate between verification agents (one affirming, one refuting) is a new pattern beyond the skill's single-perspective verification
- **Credibility:** 75/100 (Jan 2026, arxiv, concrete comparisons to baselines)
