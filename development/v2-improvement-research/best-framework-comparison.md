# Deep Research Framework Comparison (March 2026)

> Comparing top open-source deep research agents on accuracy benchmarks and architectural quality.

---

## Table of Contents
1. [Benchmark Leaderboards](#benchmark-leaderboards)
2. [Framework-by-Framework Analysis](#framework-by-framework-analysis)
3. [Architecture Comparison Matrix](#architecture-comparison-matrix)
4. [Top Framework Deep Dive: MiroThinker](#top-framework-deep-dive-mirothinker)
5. [Recommendations](#recommendations)

---

## Benchmark Leaderboards

### Deep Research Bench v2 (deepresearchbench.github.io)
- **132 tasks**, **9,430 expert-written rubrics**, **22 topic domains**, 300+ hours of expert refinement
- Three evaluation dimensions: Information Recall, Analysis, Presentation
- Rubric pass rates (%) — higher is better

| Rank | Agent | InfoRecall | Analysis | Presentation | Total Score |
|------|-------|-----------|----------|--------------|-------------|
| #1 | OpenAI GPT-o3 Deep Research | 39.98 | 49.85 | 89.16 | 45.40 |
| #2 | Gemini-3-Pro Deep Research | 39.09 | 48.94 | 91.85 | 44.60 |
| #3 | Gemini-2.5-Pro Deep Research | 34.91 | 51.91 | 90.24 | 41.98 |
| #4 | Doubao Deep Research | 34.83 | 49.43 | 83.51 | 40.99 |
| #5 | Qwen3-Max Deep Research | 34.18 | 48.04 | 74.59 | 39.25 |
| #6 | Grok Deep Search | 33.52 | 42.50 | 91.42 | 39.23 |
| #7 | Perplexity Research | 33.05 | 44.47 | 79.34 | 38.58 |
| #8 | Tongyi Deep Research | 22.95 | 35.89 | 86.13 | 29.89 |

**Note:** These are all proprietary/commercial agents. Open-source agents are benchmarked on BrowseComp and GAIA (see below).

### LangChain Open Deep Research — RACE Scores (Deep Research Bench v1)
- 100 PhD-level tasks across 22 domains, LLM-as-judge evaluation

| Configuration | RACE Score | Total Tokens | Cost |
|---------------|-----------|-------------|------|
| GPT-5 backbone | 0.4943 | 204.6M | N/A |
| Claude Sonnet 4 | 0.4401 | 138.9M | $187.09 |
| Deep Research Bench Submission | 0.4344 | 207.0M | $87.83 |
| GPT-4.1 (Default) | 0.4309 | 58.0M | $45.98 |

**Ranking: #6 on Deep Research Bench v1 Leaderboard** (August 2025)

### BrowseComp Benchmark (OpenAI)
- Evaluates ability to find specific, hard-to-locate information on the web
- Higher % = better

| Agent | BrowseComp (EN) | BrowseComp (ZH) |
|-------|----------------|-----------------|
| **MiroThinker-1.7 (235B)** | **88.2%** | 75.3% |
| MiroThinker-1.7-mini (30B) | 74.0% | **72.3%** (open-source SOTA) |
| MiroThinker-v1.5 (235B) | 69.8% | 71.5% |
| MiroThinker-v1.0 (72B) | 55.6% | 47.1% (HLE-Text) |
| MiroThinker-v0.2 | 17.2% | 29.4% |
| GPT Researcher | Not published | Not published |
| Jina DeepSearch | Not published | Not published |
| LangChain Open Deep Research | Not published | Not published |

### GAIA Benchmark (General AI Assistants)
- Tests multi-step reasoning with tool use

| Agent | GAIA-Val-165 | GAIA-Text-103 |
|-------|-------------|---------------|
| **MiroThinker-1.7** | **82.7%** | — |
| MiroThinker-v1.5 | 80.8% | — |
| MiroThinker-v1.0 (72B) | — | 81.9% |
| MiroThinker-v0.1 (8B-DPO) | 38.2% | 50.5% |

### HLE (Humanity's Last Exam) — Text Only
| Agent | HLE-Text Score |
|-------|---------------|
| MiroThinker-1.7 | 42.9% |
| MiroThinker-v1.5 | 39.2% |
| MiroThinker-v1.0 (72B) | 37.7% |

### FutureSearch Deep Research Bench (drb.futuresearch.ai)
- 89 multi-step research tasks across 8 categories with human-verified answers
- Uses "RetroSearch" (frozen web environment) for reproducible evaluation
- Evaluates: hallucination rate, tool usage efficiency, information retention
- **Paper**: arxiv.org/abs/2506.06287
- Leaderboard includes OpenAI Deep Research, Perplexity, Claude Research, and LLMs with thinking modes (o3, Gemini 2.5 Pro)
- Specific scores not currently loadable from their live site

---

## Framework-by-Framework Analysis

### 1. MiroThinker (MiroMind AI)
**GitHub**: github.com/MiroMindAI/MiroThinker
**Paper**: arxiv.org/abs/2511.11793 (v1.0), arxiv.org/abs/2603.15726 (v1.7/H1)
**License**: Open-source (HuggingFace distribution)
**Demo**: dr.miromind.ai

**Architecture: Verification-Centric DAG Reasoning**
- **Planner**: Designs reasoning as a directed acyclic graph (DAG) with step tracking and state management
- **Executor**: Runs each DAG step, invoking tools (search, compilers, linters) while logging inputs, outputs, costs
- **ChainChecker**: Reviews logical consistency across the entire reasoning chain; detects "fake fixes" that mask errors
- **Verifier**: Final safety gate — can accept, rollback, or escalate decisions

**Key Innovation: Interactive Scaling**
- Performance scales along three axes: model size, context length, AND interaction depth
- Up to 600 tool calls per task (v1.0), 300 per task (v1.7 with better efficiency)
- 256K context window throughout
- "Interaction depth exhibits scaling behaviors analogous to model size and context length"

**Verification Mechanisms (v1.7)**:
- **Local-level verification**: Intermediate reasoning decisions evaluated and refined during inference (catches errors mid-process)
- **Global-level verification**: Overall reasoning trajectory audited to ensure final answers supported by coherent evidence chains
- Verification built INTO the reasoning process (not post-hoc) — fundamental architectural difference

**Training Methodology**:
- Built on Qwen base models (Qwen3 for v1.5+, Qwen2.5 for v1.0)
- Supervised Fine-Tuning (SFT) + Direct Preference Optimization (DPO)
- "Agentic mid-training stage" builds structured problem-solving from the ground up
- Multi-source training data (English and Chinese)
- Context support progression: 40K → 64K → 256K

**Strengths**:
- Highest published BrowseComp scores among open-source agents (88.2% at 235B)
- DAG-based reasoning enables parallel exploration + rollback
- Replanning when evidence contradicts current assumptions
- Structured memory layers: local, cross-step, and global context
- Multiple parameter scales (8B → 235B) for different compute budgets

**Weaknesses**:
- Requires significant compute (235B model for best scores)
- Not a "plug-and-play" framework — it's a trained model, not an orchestration library
- Less flexible for swapping in arbitrary LLM providers

---

### 2. LangChain Open Deep Research
**GitHub**: github.com/langchain-ai/open_deep_research
**Blog**: blog.langchain.com/open-deep-research/
**License**: Open-source

**Architecture: LangGraph Supervisor + Sub-Agents**
- Three phases: **Scope → Research → Write**
- **Phase 1 (Scope)**: Clarifies requirements via chat, generates focused research brief
- **Phase 2 (Research)**: Supervisor agent evaluates whether to parallelize; delegates to sub-agents for independent sub-topics; sub-agents synthesize findings with citations; supervisor iterates if gaps remain
- **Phase 3 (Write)**: One-shot report generation from brief + compiled findings

**Query Decomposition**:
- Supervisor determines if request can be broken into independent sub-topics
- Parallel sub-agents investigate isolated topics (e.g., comparing 3 AI safety approaches → 3 parallel agents)

**Verification/Quality Control**:
- Sub-agents cite sources when synthesizing
- Supervisor assesses whether gathered info addresses research brief
- Context isolation prevents "context clash" from mixed information
- Compressed context: chat histories become focused briefs
- LLM-as-Judge evaluation using Gemini for benchmarking

**Key Design Choices**:
- Configurable models for each stage: summarization (GPT-4.1-mini), research (GPT-4.1), compression (GPT-4.1), report (GPT-4.1)
- Multi-provider: OpenAI, Anthropic, OpenRouter, Ollama
- Multi-search: Tavily, Anthropic native, OpenAI native, MCP tools
- Deployed via LangGraph Studio or programmatic API

**Strengths**:
- Most flexible/configurable framework — swap any LLM or search provider
- Good benchmark results (#6 on Deep Research Bench v1, RACE 0.4943 with GPT-5)
- Clean LangGraph-based architecture, easy to modify
- Transparent cost/token tracking
- Active development and community

**Weaknesses**:
- No claim verification or contradiction handling beyond source citation
- No iterative self-correction or rollback mechanism
- Quality depends heavily on chosen LLM backbone
- No BrowseComp or GAIA benchmarks published for direct comparison

---

### 3. GPT Researcher
**GitHub**: github.com/assafelovic/gpt-researcher
**Docs**: docs.gptr.dev
**License**: Open-source

**Architecture: Planner-Executor-Publisher Pipeline**
1. Create domain-specific agent based on research query
2. Planner agent generates targeted research questions forming objective opinions
3. Crawler agents scrape online resources for each question (parallel)
4. Summarize scraped resources, track sources
5. Filter, aggregate, synthesize into final report (>2,000 words, 20+ sources)

**Deep Research Module**: Recursive tree-like exploration with configurable depth and breadth, concurrent processing (~5 min per deep research, ~$0.40 with o3-mini)

**Verification Approach**:
- "Scrapes multiple sites per research, choosing the most frequent information" (consensus-based)
- Does NOT have formal verification — relies on source diversity to reduce bias
- Explicitly acknowledges: "we do not aim to eliminate biases; we aim to reduce it as much as possible"

**Strengths**:
- Mature project with large community
- Fast and cheap (~3 min, ~$0.10 per task)
- Good web scraping with JavaScript support
- Multi-format export (PDF, Word)
- STORM-inspired multi-agent collaboration
- MCP integration, Docker deployment, NextJS frontend

**Weaknesses**:
- **No published benchmarks** — no BrowseComp, GAIA, HLE, or RACE scores
- Consensus-based "verification" is weak (majority != truth)
- No formal contradiction handling
- No iterative self-correction or rollback
- Primarily designed for report generation, not answer accuracy

---

### 4. Jina DeepSearch (node-DeepResearch)
**GitHub**: github.com/jina-ai/node-DeepResearch
**License**: Apache-2.0
**Stars**: 5.1k

**Architecture: Iterative Search-Read-Reason Loop**
- Continuous cycle: Search → Read → Reason → (repeat until answer or token budget exhausted)
- Maintains: context, intermediate knowledge, knowledge gaps queue, visited URLs

**Query Decomposition (Reflection Mechanism)**:
- LLM identifies knowledge gaps → generates follow-up sub-questions → adds to queue
- Deduplication: prevents redundant sub-questions
- If no unique sub-questions emerge, reflection disabled for next iteration

**Verification (Multi-Gate Validation)**:
- **Definitiveness Check**: Evaluates if answer addresses original query conclusively
- **Reference Requirement**: Answers must include citations to be accepted
- **Failed Attempt Handling**: Bad answers stored, context reset, searching resumed
- **Beast Mode**: When token budget exhausted, synthesizes final answer from accumulated knowledge

**Action Types**: Answer, Reflect, Search, Visit URL

**Strengths**:
- Clean iterative design, conceptually simple
- Good answer verification gates
- Handles knowledge gaps through reflection
- OpenAI-compatible API server
- Local LLM support via Ollama/LMStudio
- TypeScript/Node.js — different ecosystem than Python-dominant alternatives

**Weaknesses**:
- **No published benchmarks** — no BrowseComp, GAIA, HLE scores
- Focused on finding right answers, NOT long-form report generation
- Requires structured output support from LLM (not all models work)
- Depends on Jina Reader API for web content extraction
- Variable step count (2-42 steps) suggests inconsistent efficiency

---

### 5. Tongyi Deep Research (Alibaba/Qwen)
**Leaderboard Position**: #8 on Deep Research Bench v2 (Total: 29.89)
**Related Framework**: Qwen-Agent (github.com/QwenLM/Qwen-Agent)

**Architecture**: Proprietary/commercial agent built on Qwen models
- Strong long-context processing (1M token contexts)
- Planning and multi-turn tool calling
- RAG for super-long document Q&A
- **DeepPlanning benchmark** open-sourced (Jan 2026)

**Benchmark Performance**:
- Deep Research Bench v2: InfoRecall 22.95, Analysis 35.89, Presentation 86.13, Total 29.89
- Weakest on information recall among top-8 commercial agents
- Strong presentation scores (86.13) suggest good formatting

**Strengths**:
- Good presentation quality
- Backed by Alibaba's infrastructure
- Qwen-Agent framework is open-source

**Weaknesses**:
- Worst total score (#8) on Deep Research Bench v2
- Very weak information recall (22.95 vs. leader's 39.98)
- Core deep research agent is NOT fully open-source
- Limited architectural documentation available

---

### 6. Other Notable Frameworks

#### dzhng/deep-research
**GitHub**: github.com/dzhng/deep-research
- Minimalist implementation (<500 lines of code)
- Iterative refinement with configurable breadth/depth
- TypeScript/Node.js + Firecrawl API
- No benchmarks published — primarily a reference implementation

#### nickscamara/open-deep-research
**GitHub**: github.com/nickscamara/open-deep-research (6.2k stars)
- Next.js full-stack application
- Firecrawl Search + Extract for web data
- Separate reasoning model for structured analysis
- No benchmarks published — primarily a product/UI

#### STORM (Stanford OVAL)
**GitHub**: github.com/stanford-oval/storm
- LLM system that writes Wikipedia-like articles from scratch
- Two-stage architecture: pre-writing (research + outline) → writing (full article with citations)
- Perspective-guided question asking: discovers viewpoints by surveying similar existing articles
- Simulated conversation between Wikipedia writer and topic expert
- Multi-model design (different LLMs for different components)
- Co-STORM extension adds human-AI collaboration (EMNLP 2024)
- No deep research benchmarks published — focused on article generation quality

#### Auto-Deep-Research (HKUDS)
**GitHub**: github.com/HKUDS/Auto-Deep-Research
- Built on AutoAgent framework (inspired by OpenAI Swarm, Magentic-one)
- Multi-agent architecture with broad LLM provider support
- Claims "good performance on GAIA Benchmark" but no specific scores published
- Pay-as-you-go model, zero-config launch
- Under active development (GUI agent, E2B sandbox, web interface planned)

### Additional Benchmarks Landscape

#### ReportBench (ByteDance)
**GitHub**: github.com/ByteDance-BandAI/ReportBench
- 100 tasks derived from expert-authored survey papers
- Evaluates citation accuracy and factual correctness

| Agent | Precision | Recall | Avg Refs | Citation Match | Non-Cited Accuracy |
|-------|-----------|--------|----------|----------------|-------------------|
| OpenAI Deep Research | 0.385 | 0.033 | 9.89 | 78.87% | 95.83% |
| Gemini Deep Research | 0.145 | 0.036 | 32.42 | 72.94% | 92.21% |
| claude4-sonnet | 0.337 | 0.021 | 6.74 | 73.67% | 92.64% |
| gemini-2.5-pro | 0.269 | 0.010 | 4.27 | 59.24% | 96.08% |
| o3 | 0.299 | 0.031 | 12.26 | 31.43% | 82.22% |

**Key finding**: OpenAI Deep Research has best citation precision; Gemini over-cites (32 avg refs) with lower accuracy.

#### BrowseComp-Plus (texttron)
**GitHub**: github.com/texttron/BrowseComp-Plus
- ~830 reasoning-intensive queries from OpenAI's BrowseComp
- Evaluates against fixed corpus of ~100K human-verified documents (not live web)
- Isolates retriever and LLM agent effects separately
- Supports OpenAI, Anthropic, Gemini, Qwen, Search-R1 model families

#### ResearchRubrics (Scale AI — ICLR 2026)
**GitHub**: github.com/scaleapi/researchrubrics — arxiv.org/abs/2511.07685
- Binary grading (Satisfied / Not Satisfied) with weighted rubrics
- Uses Gemini 2.5 Pro as judge
- Measures conceptual breadth, logical nesting, exploration depth
- Compliance Score = weighted sum of rubric satisfaction

---

## Architecture Comparison Matrix

| Feature | MiroThinker | LangChain ODR | GPT Researcher | Jina DeepSearch | Tongyi |
|---------|-------------|---------------|-----------------|-----------------|--------|
| **Query Decomposition** | DAG planner with branching | Supervisor→parallel sub-agents | Planner→parallel crawlers | Reflection→sub-question queue | Planning + tool calls |
| **Claim Verification** | ChainChecker + Verifier (local+global) | Source citation only | Consensus (most frequent) | Definitiveness + citation checks | Unknown |
| **Contradiction Handling** | Replanning on contradictory evidence + rollback | None | None | Failed attempt storage + reset | Unknown |
| **Self-Correction** | Yes (rollback + replan in DAG) | No (supervisor can re-delegate) | No | Yes (reset on bad answers) | Unknown |
| **Max Tool Calls** | 300-600 per task | Unlimited (LLM-bounded) | Unlimited (LLM-bounded) | Token-budget bounded | Unknown |
| **Context Window** | 256K | Model-dependent | 128K (GPT-4o) | Model-dependent | 1M |
| **Memory Architecture** | Local + cross-step + global | Compressed briefs | Session-based | Knowledge gaps queue + visited URLs | RAG-based |
| **Training Required** | Yes (SFT + DPO on base model) | No (prompt-based orchestration) | No (prompt-based orchestration) | No (prompt-based orchestration) | Yes |
| **Flexibility** | Low (fixed model) | Very High (any LLM/search) | High (any LLM) | Medium (needs structured output) | Low |
| **BrowseComp Score** | 88.2% (235B) | Not published | Not published | Not published | Not published |
| **GAIA Score** | 82.7% (Val-165) | Not published | Not published | Not published | Not published |
| **RACE Score** | Not published | 0.4943 (GPT-5) | Not published | Not published | Not published |
| **Deep Research Bench v2** | Not on leaderboard | #6 (v1 only) | Not on leaderboard | Not on leaderboard | #8 (29.89) |

---

## Top Framework Deep Dive: MiroThinker

MiroThinker is the clear leader on accuracy benchmarks among open-source agents. Here's what makes it architecturally superior:

### Why MiroThinker Outperforms

**1. Verification-First Design (vs. Generate-Then-Check)**
Most frameworks generate a research report and optionally verify at the end. MiroThinker integrates verification INTO the reasoning process:
- Local verification catches errors at each reasoning step
- Global verification audits the entire reasoning trajectory
- ChainChecker specifically detects "fake fixes" — superficial corrections that mask underlying errors

**2. DAG-Based Reasoning (vs. Linear Pipelines)**
Other frameworks use linear pipelines (plan → research → write) or simple loops (search → read → reason). MiroThinker's DAG structure enables:
- **Parallel exploration**: Multiple reasoning branches simultaneously
- **Selective rollback**: Discard bad branches while keeping good ones
- **Replanning**: When new evidence contradicts assumptions, restructure the plan
- **Retained context**: Confirmed facts survive rollback of incorrect branches

**3. Interactive Scaling (Novel Contribution)**
MiroThinker discovered that interaction depth (number of tool calls, environment feedback loops) scales performance analogously to model size and context length. This is a fundamentally different approach:
- More interactions → better results (up to 600 tool calls)
- Trained specifically to handle deep multi-turn interactions
- Other frameworks have no principled approach to interaction depth

**4. Structured Memory Architecture**
Three-tier memory system:
- **Local context**: Current step's information
- **Cross-step context**: Information shared between reasoning steps
- **Global context**: Accumulated knowledge across the entire research session

**5. Training-Based vs. Prompt-Based**
MiroThinker is a fine-tuned model (SFT + DPO), not just an orchestration framework:
- Learns optimal interaction patterns from training data
- DPO aligns the model to prefer verification-heavy reasoning paths
- "Agentic mid-training" builds research behavior into the model weights

### How MiroThinker Decomposes Queries
1. **Planner** analyzes the query and creates a DAG of reasoning steps
2. Each node in the DAG represents a sub-task (search, analyze, verify)
3. Edges represent dependencies between sub-tasks
4. Independent sub-tasks can execute in parallel
5. Results flow through the DAG, with the Executor processing each node

### How MiroThinker Verifies Claims
1. **Step-level (Local)**: Each reasoning step's output is evaluated before the next step begins
2. **Chain-level (ChainChecker)**: Reviews logical consistency across connected steps; flags patterns like circular reasoning or unfounded assertions
3. **Trajectory-level (Global Verifier)**: Final gate that audits the complete reasoning path; can accept, rollback to a previous state, or escalate
4. **Contradiction detection**: When new evidence contradicts established facts, the Planner triggers replanning — restructuring the DAG to accommodate the new information rather than ignoring the contradiction

### How MiroThinker Handles Contradictions
- Contradictions are detected by the ChainChecker during chain-level review
- When detected, the system does NOT simply pick one side
- Instead, it triggers **replanning**: the Planner restructures the reasoning DAG
- The conflicting evidence is preserved and the investigation branches to resolve the contradiction
- Rollback preserves confirmed facts while discarding the contradicted branch
- This is fundamentally different from consensus-based approaches (GPT Researcher) that just pick the majority

---

## Recommendations

### Best Overall (Accuracy): MiroThinker
- **Why**: Highest published benchmark scores across BrowseComp (88.2%), GAIA (82.7%), and HLE (42.9%)
- **Why**: Only framework with formal verification architecture (Planner/Executor/ChainChecker/Verifier)
- **Why**: Novel interactive scaling approach with proven scaling behavior
- **Trade-off**: Requires running large models (30B-235B); less flexible for LLM swapping

### Best for Flexibility/Customization: LangChain Open Deep Research
- **Why**: Swap any LLM provider, search tool, or MCP server
- **Why**: Clean LangGraph architecture, easy to extend
- **Why**: Only open-source framework with published RACE benchmark scores (#6 leaderboard)
- **Trade-off**: No verification or contradiction handling; accuracy depends on backbone LLM

### Best for Quick Deployment: GPT Researcher
- **Why**: Mature, well-documented, active community
- **Why**: Fast (~3 min) and cheap (~$0.10 per task)
- **Why**: Multiple deployment options (Docker, NextJS, HTML/CSS/JS)
- **Trade-off**: No published benchmarks; weakest verification approach (consensus only)

### Best Answer-Focused (Not Reports): Jina DeepSearch
- **Why**: Focused on finding correct answers, not generating reports
- **Why**: Clean iterative design with good verification gates
- **Why**: TypeScript ecosystem (good if you're not Python-centric)
- **Trade-off**: No published benchmarks; depends on Jina Reader API

### Key Architectural Insights for Building a Better Agent
1. **Verification must be built-in, not bolted-on** — MiroThinker's success comes from integrating verification into every reasoning step
2. **DAG > Linear Pipeline** — branching, rollback, and replanning enable much richer reasoning
3. **Interactive scaling matters** — more tool calls with better interaction training outperforms bigger models with fewer interactions
4. **Structured memory is essential** — local/cross-step/global memory prevents context loss in long research sessions
5. **Contradiction handling needs explicit design** — consensus (GPT Researcher) and simple retry (Jina) are insufficient; replanning (MiroThinker) is the state of the art

---

## Benchmark Coverage Summary

Which benchmarks have published scores for which frameworks:

| Framework | BrowseComp | GAIA | HLE | DR Bench v2 | DR Bench v1 (RACE) | ReportBench |
|-----------|-----------|------|-----|-------------|---------------------|-------------|
| MiroThinker | 88.2% (235B) | 82.7% | 42.9% | — | — | — |
| LangChain ODR | — | — | — | — | 0.4943 (#6) | — |
| GPT Researcher | — | — | — | — | — | — |
| Jina DeepSearch | — | — | — | — | — | — |
| Tongyi DR | — | — | — | #8 (29.89) | — | — |
| OpenAI DR | — | — | — | #1 (45.40) | — | P=0.385, CM=78.87% |
| Gemini DR | — | — | — | #2 (44.60) | — | P=0.145, CM=72.94% |

**Key observation**: MiroThinker is the only open-source framework with published scores on the hardest benchmarks (BrowseComp, GAIA, HLE). Most open-source frameworks have NO published benchmark data, making rigorous comparison difficult. LangChain ODR is the only other open-source framework with any benchmark score (RACE on DR Bench v1).

---

## Sources
- github.com/langchain-ai/open_deep_research (README, blog)
- github.com/MiroMindAI/MiroThinker (README)
- github.com/assafelovic/gpt-researcher (README, docs)
- github.com/jina-ai/node-DeepResearch (README)
- github.com/QwenLM/Qwen-Agent
- deepresearchbench.github.io (v2 leaderboard)
- drb.futuresearch.ai (FutureSearch Deep Research Bench)
- arxiv.org/abs/2511.11793 (MiroThinker v1.0 paper)
- arxiv.org/abs/2603.15726 (MiroThinker v1.7/H1 paper)
- arxiv.org/abs/2506.06287 (Deep Research Bench paper)
- dr.miromind.ai (MiroThinker demo/architecture)

- github.com/stanford-oval/storm (STORM)
- github.com/HKUDS/Auto-Deep-Research
- github.com/texttron/BrowseComp-Plus
- github.com/ByteDance-BandAI/ReportBench
- github.com/scaleapi/researchrubrics (ResearchRubrics, ICLR 2026)
- arxiv.org/abs/2511.07685 (ResearchRubrics paper)

*Last updated: March 22, 2026*
