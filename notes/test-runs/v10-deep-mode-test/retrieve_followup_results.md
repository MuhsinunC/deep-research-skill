# Phase 3 RETRIEVE — Follow-up Search Results
## Written: 2026-04-01

### DRA Failure Taxonomy (from arXiv:2601.15808)
- 5 major categories, 13 sub-categories
- Three main categories: Reasoning, Retrieval, Generation failures
- Reasoning: failure to understand requirements, lack of analytical depth, limited scope, rigid planning
- Retrieval: deficient external acquisition, misaligned evidence representation, ineffective handling/integration, lack of verification
- Generation: redundant content, structural disorganization, specification deviation, deficient rigor, strategic fabrication
- Constructed from failure trajectories on WebAggregator dataset
- DeepVerifier converts each sub-category into explicit rubric check
- **NOVEL for skill:** Structured failure taxonomy as verification rubrics — the skill's existing verification is claim-level, not failure-mode-level

### PIES Taxonomy + DeepHalluBench (arXiv:2601.22984)
- Two dimensions: Functional (Planning vs Summarization) x Error Property (Explicit vs Implicit)
- Four quadrants: Explicit Summarization, Implicit Summarization, Explicit Planning, Implicit Planning
- Explicit = incorrect information present; Implicit = critical absence of required content
- DeepHalluBench: 100 hallucination-prone tasks, 11 domains, includes close-ended, open-ended, and "no-answer" queries
- Results: Qwen lowest hallucination (H≈0.149), OpenAI close (H≈0.155), Gemini mid (H≈0.175), Perplexity higher (H≈0.21)
- **NOVEL for skill:** Process-aware trajectory auditing (vs outcome-based), PIES taxonomy for classifying hallucination types

### openJiuwen DeepSearch
- Knowledge-enhanced deep search with chunk-level citation and traceable reasoning
- Topped BrowseComp-Plus with 80% accuracy
- Key strengths: multi-hop search, cross-source integration, interference screening, web content understanding
- **Relevant technique:** Chunk-level citation (more granular than page-level citation)

### Tongyi DeepResearch Architecture
- ReAct-based with MoE design (~30.5B total, ~3-3.3B active per token)
- 128K context, Apache 2.0 license
- Training: Agentic CPT → SFT → RL (3-stage pipeline)
- Two inference modes: (1) ReAct (standard), (2) IterResearch "Heavy" mode (test-time scaling)
- **IterResearch Heavy mode:** Test-time scaling strategy for maximum performance — NOVEL concept
- **Training-based** but IterResearch inference mode is applicable as orchestration pattern
- BrowseComp 43.4, BrowseComp-ZH 46.7, HLE 32.9

### Tool-MAD: Multi-Agent Debate for Fact Verification (arXiv:2601.04742, Jan 2026)
- Multi-agent debate with iterative retrieval of external evidence + dynamic agent interactions
- Up to 35.5% improvement over standard MAD, 5.5% over MADKE
- Specialized agents with diverse tool augmentation and adaptive retrieval
- **NOVEL for skill:** Multi-agent debate mechanism for fact verification (skill uses verification but not adversarial debate between agents)
- **Applicable via prompting:** YES — debate framework is an orchestration pattern

### A-HMAD: Adaptive Heterogeneous Multi-Agent Debate (Nov 2025)
- 4-6% absolute accuracy gains over standard debate
- Reduces factual errors by 30%+ in biography facts
- Heterogeneous agents (different capabilities/perspectives)
- **Partial overlap with skill:** Skill has heterogeneous sub-agent lenses, but for RETRIEVAL not VERIFICATION
- **NOVEL for skill:** Applying heterogeneous debate to the VERIFICATION phase, not just retrieval

### DebateCV: Debate-driven Claim Verification (2026)
- Opposing Debater agents: one affirming, one refuting
- Moderator synthesizes verdict
- Debate-SFT improves Moderator accuracy from 53.8% to 72.8% (Llama-3.1-8B)
- Training component but debate architecture is applicable as prompt pattern

### Budget-Aware Tool-Use (arXiv:2511.17006, Nov 2025)
- From Awesome list: "enables effective agent scaling" via budget-aware tool selection
- Approach: Prompting-based (no training required)
- **NOVEL for skill:** Dynamic budget allocation for tool calls based on task difficulty

### Key New Benchmarks
1. **BrowseComp-Plus** — Fair/transparent eval against fixed 100K document corpus (arXiv:2508.06600)
2. **DeepResearch Bench** — Comprehensive research agent evaluation
3. **DeepHalluBench** — 100 hallucination-prone tasks for trajectory auditing
4. **XBench-DeepSearch** — Alibaba's deep search benchmark
5. **WebAggregator** — Used for DRA failure taxonomy construction

### Awesome Deep Research: Key Trends
- RL dominance: GRPO and M-GRPO are the dominant optimization strategies
- ~50 papers tracked from May 2025 to Jan 2026
- Most frameworks use Qwen2.5 or Qwen3 as base models
- Prompting-based approaches tagged: ToolScope, Enterprise Deep Research, Demystifying Search, VideoDeepResearch, ResearStudio
