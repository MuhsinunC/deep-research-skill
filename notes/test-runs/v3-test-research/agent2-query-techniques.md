# Query Reformulation & Search Strategy Optimization for AI Research Agents

**Research Date:** 2026-03-22
**Status:** Complete

## Purpose

Document advanced query reformulation and search strategy techniques that go BEYOND simple multi-angle decomposition. Focus on iterative refinement, negative search, citation chaining, and query expansion. Prioritize primary sources (papers, official docs).

---

## 1. Iterative Query Refinement

### Core Concept
Rather than a single search pass, iterative refinement treats search as a loop: search -> read results -> generate better queries -> search again. The system learns from each iteration what terminology, framing, and specificity yields the best results.

### 1.1 Reward-Guided Reformulation (RL-Based)

Three major 2025 papers establish reinforcement learning as the frontier for query reformulation:

**ConvSearch-R1** (EMNLP 2025) - [arxiv.org/html/2505.15776v1](https://arxiv.org/html/2505.15776v1)
- First framework that completely eliminates dependency on external rewrite supervision
- Two-stage approach:
  1. **Self-Driven Policy Warm-Up**: Generates initial rewrites via few-shot prompting, filters to retain only samples that rank gold passage at position 1, then fine-tunes on these self-distilled examples
  2. **Retrieval-Guided RL**: Uses GRPO (Group Relative Policy Optimization) with a novel Rank-Incentive Reward Shaping (RIRS):
     - Positions 1-10: reward range [1, 2] (strong positive signal)
     - Positions 10-100: reward range [0, 1] (moderate signal)
     - Format violations: penalty of -0.1
  - This addresses reward sparsity -- traditional binary "found/not found" rewards give too little signal
- Achieves >10% improvement over SOTA on TopiOCQA with only 3B parameter models

**Search-R1** - [github.com/PeterGriffinJin/Search-R1](https://github.com/PeterGriffinJin/Search-R1)
- Trains LLMs to interleave reasoning with search engine calls via RL
- Enforces strict format templates: `<think>`, `<search>`, `<information>`, `<answer>`
- Uses PPO/GRPO optimization to learn WHEN and HOW to search

**R1-Searcher** - [github.com/RUCAIBox/R1-Searcher](https://github.com/RUCAIBox/R1-Searcher)
- Two-stage outcome-supervision RL:
  1. Learn HOW to invoke web search (format/timing)
  2. Learn HOW to effectively USE search results
- Extended version (R1-Searcher++) adds "knowledge boundary awareness" -- the model learns when to use internal knowledge vs. when to search

### 1.2 Draft-Based Iterative Refinement

**Google's TTD-DR (Test-Time Diffusion for Deep Research)** - [arxiv.org/html/2507.16075v1](https://arxiv.org/html/2507.16075v1)
- Algorithm (from paper's Algorithm 1):
  1. LLM generates preliminary report from internal knowledge alone
  2. Current draft informs generation of next search query (gap identification)
  3. Search results retrieved and synthesized into structured answers
  4. Retrieved information updates and refines the draft
  5. Steps 2-4 repeat up to N iterations
- Key innovation: "the denoised draft, along with the research plan, guide the downstream research direction" -- search queries are dynamically adjusted based on gaps in the evolving draft
- Self-evolution enhancement: each component (plans, questions, answers) undergoes independent optimization via LLM-as-a-judge evaluation

### 1.3 ReAct-Style Search Loops

**OpenAI Deep Research** (via [blog.promptlayer.com analysis](https://blog.promptlayer.com/how-deep-research-works/))
- Uses Plan-Act-Observe loop (ReAct pattern):
  1. Decomposes initial question into subtopics/sub-questions
  2. After each search, analyzes results and decides next query based on discoveries
  3. Pivots strategically when hitting obstacles (e.g., paywalls -> search for public summaries)
- Stopping criteria (two-tier):
  - **Coverage-based**: stops when novelty exhausts (recent searches don't find new info) and threshold met (2+ independent sources per sub-question)
  - **Hard budget**: 20-30 min wall-clock, 30-60 searches, 120-150 max pages
- Search quality evaluation: checks source count per sub-question, novelty of new results, contradiction resolution

**dzhng/deep-research** (open source reference) - [github.com/dzhng/deep-research](https://github.com/dzhng/deep-research)
- Core loop: Generate queries -> Process results -> Check depth -> Follow-up or compile
- Depth parameter (1-5 levels) controls recursion
- Breadth parameter (3-10, default 4) controls parallel search angles per iteration
- Each iteration builds on previous learnings with full context carry-forward

### 1.4 Specific Systems from the Survey

From "Deep Research: A Survey of Autonomous Research Agents" - [arxiv.org/html/2508.12752v1](https://arxiv.org/html/2508.12752v1):

- **Search-in-the-Chain** (Xu et al., 2024b): Dynamically updates action choices based on intermediate search results -- closes the loop between retrieval and planning
- **Simulate Before Act** (Gu et al., 2025): Explicit simulation phase where agents mentally roll out candidate action trajectories and evaluate feasibility before executing
- **Meta-Plan Optimization (MPO)** (Xiong et al., 2025): Adaptively tunes planning strategies across diverse web environments
- **Avatar** (Wu et al., 2024): Trains agents to recognize WHEN and HOW to invoke external resources
- **IKEA** (Huang et al., 2025c): Knowledge boundary-aware reward -- gives positive feedback for using internal knowledge when sufficient, and for searching when not
- **ReasonRAG** (Zhang et al., 2025a): Monte Carlo Tree Search (MCTS) to explore reasoning trajectories + DPO to rank them
- **ManuSearch** (Huang et al., 2025b): Separate agents for planning subquestions, conducting search, and extracting structured evidence

### 1.5 Technique Taxonomy

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Gap-based refinement** | Read results, identify unanswered questions, search for those | Default iterative approach |
| **Reward-guided reformulation** | Use retrieval quality metrics (rank position) as RL reward | Training query reformulation models |
| **Draft-based refinement** | Maintain running draft, find weak/unsupported sections | Long-form research synthesis |
| **Contextual carry-forward** | Include relevant prior context in new queries | Multi-turn conversational search |
| **Simulate-then-act** | Mentally evaluate candidate queries before executing | Resource-constrained settings |
| **Knowledge boundary detection** | Determine if internal knowledge suffices before searching | Reducing unnecessary searches |
| **Obstacle pivoting** | When blocked (paywall, 403), reformulate to find alternative sources | Web scraping failures |

---

## 2. Negative Search Strategies

### Core Concept
Searching for what DOESN'T exist to confirm absence, verify claims, or find counterevidence. Fundamentally different from positive search.

### 2.1 The Closed World Assumption (CWA) vs. Open World Assumption (OWA)

**Theoretical Foundation** - Raymond Reiter, 1978 ([Springer](https://link.springer.com/chapter/10.1007/978-1-4684-3384-5_3))
- **CWA**: If a statement cannot be deduced as true from the knowledge base, it is assumed false. Absence of evidence IS evidence of absence.
- **OWA**: A proposition is false only if it is INCONSISTENT with existing knowledge. Absence of evidence is NOT evidence of absence.
- **For AI research agents**: Web search operates under OWA -- not finding something doesn't mean it doesn't exist. BUT you can systematically narrow the gap by exhaustively searching authoritative sources.

### 2.2 Fact Verification via IR-Based In-Context Learning

**"The Absence of Evidence is Not the Evidence of Absence"** - [ACM/Springer](https://dl.acm.org/doi/10.1007/978-3-031-68323-7_34)
- Uses 0-shot or k-shot in-context learning for unsupervised fact verification
- Key insight: verifying a NEGATIVE claim requires different retrieval strategies than verifying a positive one
- Results competitive with supervised fine-tuned methods

### 2.3 Conflict Detection in Multi-Source Research

From the Deep Research survey:
- **DRAGged** (Cattan et al., 2025): Identifies and mitigates inter-source conflicts using detection and intervention models
- **Entropy-based decoding** (Yuan et al., 2024): Adaptively adjusts to evidence uncertainty, promoting reliable generation under ambiguous input
- **BRIDGE** (Dai et al., 2025): Verification layer between retrieval and generation to assess factual adequacy
- **FaithfulRAG** (Zhang et al., 2025c): Fact-level conflict modeling to align with consistent retrieved facts

### 2.4 Practical Negative Search Techniques for AI Agents

| Technique | Description | Implementation |
|-----------|-------------|----------------|
| **Exhaustive source enumeration** | List ALL places where evidence SHOULD appear if claim is true, verify absence in each | Define authoritative source list per domain, check each systematically |
| **Counterexample search** | Actively search for contradicting evidence | Negate the claim and search for the negation |
| **Coverage gap analysis** | Identify what sources DON'T cover to avoid false negatives | Map source coverage, note blind spots |
| **Search documentation** | Log every query and result to prove thoroughness | Maintain search audit trail |
| **Multi-source conflict detection** | Cross-reference claims across independent sources | Flag disagreements, investigate root cause |
| **Confidence calibration** | Adjust confidence based on source quality and coverage | Weight authoritative sources higher |
| **Temporal verification** | Check if absence is due to recency (not yet indexed) vs. genuinely not existing | Note index freshness per source |

---

## 3. Citation Chain Following

### Core Concept
Using references in found papers/sources to discover upstream (backward) and downstream (forward) sources. Creates discovery chains that surface searches would miss.

### 3.1 Backward Chaining (Reference Following)

- Extract reference lists from found papers
- Prioritize: most-cited references, references that appear across multiple found papers, seminal/foundational works
- Implementation: parse bibliography, search for each promising reference by title

### 3.2 Forward Chaining (Citation Tracking)

- Find papers that CITE a known key paper
- Reveals: how ideas evolved, who built on the work, recent applications
- Tools: Google Scholar "Cited by", Semantic Scholar API, Web of Science

### 3.3 Snowballing Method

Source: [Oxbridge Essays](https://www.oxbridgeessays.com/blog/snowballing-in-research-a-complete-guide-to-citation-chaining/)
- Systematic approach combining backward and forward chaining
- Start with seed papers, alternate between backward and forward passes
- Each pass expands the frontier of known relevant papers

### 3.4 Systematic Review Standard

Source: [PMC/8474097](https://pmc.ncbi.nlm.nih.gov/articles/PMC8474097/)
- Citation tracking recognized as formal methodology for systematic literature searching
- Standard practice in medical and academic systematic reviews

### 3.5 Semantic Scholar API for Automated Citation Traversal

**API**: [api.semanticscholar.org](https://api.semanticscholar.org/api-docs/)

Key endpoints for AI agent citation chaining:
- `GET /graph/v1/paper/search/bulk` - Find seed papers by keyword
  - Supports phrase matching, year filtering, field selection
- `GET /graph/v1/paper/{paperId}` - Get paper details including references and citations
  - `fields` parameter can request `references`, `citations`, `citationCount`
- `POST /graph/v1/paper/batch` - Fetch multiple papers efficiently for batch traversal

**MCP Server available**: [github.com/alperenkocyigit/semantic-scholar-graph-api](https://github.com/alperenkocyigit/semantic-scholar-graph-api) - MCP server bridging AI assistants with Semantic Scholar for citation network exploration

**Database scale**: 205M+ publications, 121M+ authors, 2.5B+ citation edges

**Rate limits**: 1 request/second with API key; shared pool without key

### 3.6 Agent Implementation Pattern

```
1. Search for seed papers on topic
2. For each promising seed paper:
   a. GET paper details with references and citations
   b. Score references by relevance (title/abstract match)
   c. Score citing papers by recency and relevance
3. Add top-scored papers to frontier queue
4. Repeat from step 2 with frontier papers
5. Stop when: no new relevant papers found OR depth limit reached
```

---

## 4. Query Expansion Techniques

### Core Concept
Augmenting search queries with synonyms, related terms, domain jargon, and alternative phrasings to find sources using different terminology for the same concepts.

### 4.1 Comprehensive Taxonomy (LLM Era)

From "Query Expansion in the Age of Pre-trained and Large Language Models: A Comprehensive Survey" - [arxiv.org/html/2509.07794v1](https://arxiv.org/html/2509.07794v1):

#### A. Zero-Grounding, Non-Interactive (LLM knowledge only, single pass)

| Method | Technique | Source |
|--------|-----------|--------|
| **Query2Doc** | LLM generates "few-shot pseudo-documents" as expansion | Wang et al., 2023c |
| **HyDE** | Hypothetical Document Embeddings -- LLM generates what an ideal answer document would look like, embeds that | Gao et al., 2023 |
| **CoT-QE** | Chain-of-thought reasoning then expansion -- "reason-then-expand" | Jagerman et al., 2023 |
| **GAR** | Generation-Augmented Retrieval | Mao et al., 2020 |
| **GRF** | Generative Relevance Feedback without initial retrieval | Mackie et al., 2023b |

#### B. Grounding-Only, Non-Interactive (Uses corpus evidence, single pass)

| Method | Technique | Source |
|--------|-----------|--------|
| **GenPRF** | Generative pseudo-relevance feedback | Wang et al., 2023a |
| **AGR** | Analyze-Generate-Refine framework | Chen et al., 2024 |
| **EAR** | Expand-Rerank-Retrieve pipeline | Chuang et al., 2023 |
| **CSQE** | Corpus-Steered Query Expansion | Lei et al., 2024 |
| **PromptPRF** | Feature-based PRF enabling small models to match large ones | Li et al., 2025b |
| **MUGI** | Multi-Text Generation Integration | Zhang et al., 2024b |

#### C. Grounding-Aware Interactive (Multi-round retrieve-expand loops)

| Method | Technique | Source |
|--------|-----------|--------|
| **InteR** | Refinement through RM-LLM synergy | Feng et al., 2023 |
| **ProQE** | Progressive Query Expansion | Rashid et al., 2024 |
| **ThinkQE** | Iterative thinking with corpus interaction | Lei et al., 2025 |
| **LameR** | Language Model as Retriever | Shen et al., 2023 |

#### D. Knowledge Graph-Augmented

| Method | Technique | Source |
|--------|-----------|--------|
| **KGQE** | Entity-aware text injection from KGs | Perna, 2025 |
| **KAR** | KG-guided generation and retrieval | Xia et al., 2025 |
| **QSKG** | Query-Specific KG construction | Mackie & Dalton, 2022 |

#### E. Embedding-Based (Implicit, no surface terms)

| Method | Technique | Source |
|--------|-----------|--------|
| **ANCE-PRF** | Re-encodes query with feedback docs to refine vector | Yu et al., 2021 |
| **ColBERT-PRF** | Adds discriminative token centroids from pseudo-relevant set | Wang et al., 2023b |
| **LLM-VPRF** | Vector PRF for LLM-based retrievers | Li et al., 2025c |

### 4.2 Key Distinction: LLM-Era vs. Traditional QE

Traditional QE relied on surface-level lexical statistics or static knowledge. LLM-era approaches enable:
1. **Contextual disambiguation** through bidirectional encoders
2. **Generative reformulation** without fixed vocabularies
3. **Reasoning-guided expansion** via chain-of-thought prompts
4. **Corpus grounding** to mitigate hallucination in expansions
5. **Interactive refinement** through multi-stage retrieve-expand cycles

### 4.3 Pseudo-Relevance Feedback (PRF) with LLMs

Recent 2025 advances (from [arxiv.org/html/2603.11008v1](https://arxiv.org/html/2603.11008v1) and related):

- **LLM-based PRF** is NOT restricted to the initial retrieved document set -- can generate expansion terms from parametric knowledge
- **RFG Framework** ([scitepress.org](https://www.scitepress.org/Papers/2025/138369/138369.pdf)): Combines RAG with PRF -- uses initial retrieval as grounding context for LLM to generate diverse pseudo-queries while mitigating hallucination
- **PRF closes the gap**: Even small dense retrievers with PRF can match much larger models (arxiv 2503.14887)
- Best results combine corpus evidence WITH LLM-generated expansions (hybrid approach)

### 4.4 Thesaurus and Ontology Methods (from Stanford NLP IR Book)

Source: [Stanford NLP](https://nlp.stanford.edu/IR-book/html/htmledition/query-expansion-1.html)

Four approaches to building expansion resources:
1. **Controlled vocabulary** (e.g., UMLS for biomedicine) -- canonical terms with automatic expansion
2. **Manual thesaurus** -- human-curated synonym sets with broader/narrower terms
3. **Automatically derived thesaurus** -- word co-occurrence statistics over domain corpus
4. **Query log mining** -- exploit reformulations made by other users as expansion suggestions

Important: expansion terms may be weighted LESS than original query terms to maintain precision.

### 4.5 Practical Expansion Strategies for AI Research Agents

| Strategy | Example | When to Use |
|----------|---------|-------------|
| **Synonym OR-expansion** | "LLM" OR "large language model" | Always -- catches terminology variants |
| **Domain jargon bridging** | "query reformulation" -> also search "query rewriting" | When results are sparse |
| **Acronym expansion** | "PRF" -> "pseudo-relevance feedback" | Technical domains |
| **HyDE-style expansion** | Generate hypothetical ideal answer, extract key terms | When initial queries return poor results |
| **Cross-lingual expansion** | Search in multiple languages for the same concept | International research topics |
| **Temporal expansion** | Add year ranges: "2024 OR 2025 OR 2026" | Finding recent work |
| **Venue-specific search** | Add conference/journal names: "EMNLP" "ACL" "NeurIPS" | Academic paper search |
| **Negative term filtering** | Exclude irrelevant homonyms: "query expansion -SQL -database" | When terms are ambiguous |

---

## 5. Multi-Hop Query Decomposition

### Core Concept
Breaking complex questions into structured sub-questions that each target a distinct factual unit, then chaining retrieval across them.

### 5.1 PRISM Framework

Source: [arxiv.org/html/2510.14278v1](https://arxiv.org/html/2510.14278v1) - "Agentic Retrieval with LLMs for Multi-Hop Question Answering"

Architecture (3 specialized agents):
1. **Question Analyzer Agent**: Decomposes complex questions by identifying key entities (persons, organizations, locations, dates) and logical/temporal relationships. Produces ordered list of sub-questions representing the reasoning path.
2. **Selector Agent**: Focuses on PRECISION -- filters candidates to those directly supporting each sub-question
3. **Adder Agent**: Focuses on RECALL -- examines excluded documents to fill logical gaps and recover bridging facts

The Selector-Adder cycle runs up to 3 iterations. Results are merged and de-duplicated into a compact evidence set.

### 5.2 Other Decomposition Approaches

- **ReAgent**: Dedicated Question-Decomposer Agent breaks queries into manageable sub-questions
- **RT-RAG**: Decomposes into consensus-validated tree structure with explicit entity analysis, retrieves via bottom-up traversal
- **ManuSearch** (from Deep Research survey): Separate agents for planning subquestions, conducting search, and extracting structured evidence

### 5.3 Benefits of Decomposition
- Reduces chance of missing critical reasoning hops
- Prevents downstream retrieval from being overwhelmed with loosely relevant results
- Makes evidence requirements explicit and auditable
- Enables parallel retrieval across independent sub-questions

---

## 6. Synthesis: Actionable Techniques Beyond Multi-Angle Decomposition

### What We Already Do
- Decompose question into 5-10 search angles
- Launch searches in parallel
- Combine results

### What's BEYOND That (ordered by implementation priority)

#### Tier 1: High Impact, Moderate Implementation Effort

1. **Gap-Based Iterative Refinement**
   - After initial parallel searches complete, analyze ALL results collectively
   - Identify specific questions that remain unanswered
   - Generate targeted follow-up queries for those gaps
   - Repeat until convergence (no new information found) or budget exhausted

2. **Query Expansion via HyDE/CoT**
   - Before searching, generate a hypothetical ideal answer document
   - Extract key terms/phrases from it as expansion terms
   - Use chain-of-thought reasoning to identify alternative terminology

3. **Pseudo-Relevance Feedback**
   - After initial results, extract key terms from top results
   - Use those terms to expand subsequent queries
   - Combines corpus grounding with breadth

4. **Obstacle Pivoting**
   - When a source blocks access (paywall, 403, Cloudflare), automatically reformulate to find the same information from alternative sources
   - Example: paywall on IEEE -> search for public preprint on arXiv

#### Tier 2: High Impact, Higher Implementation Effort

5. **Citation Chain Following**
   - Extract references from found papers
   - Use Semantic Scholar API to traverse citation graph
   - Forward chain from seminal papers to find latest work
   - Backward chain from recent papers to find foundational work

6. **Multi-Hop Decomposition with Chained Retrieval**
   - PRISM-style: decompose -> retrieve per sub-question -> combine with precision/recall agents
   - Use output of one retrieval step as input for the next

7. **Negative/Absence Verification**
   - For verification tasks: enumerate authoritative sources, confirm presence or document absence in each
   - For conflict detection: cross-reference claims across independent sources
   - Maintain search audit trail for reproducibility

#### Tier 3: Cutting-Edge, Research-Grade

8. **RL-Trained Query Reformulation**
   - ConvSearch-R1 / Search-R1 style: train models with retrieval quality as reward signal
   - Requires training infrastructure but produces significantly better queries

9. **Knowledge Boundary Detection**
   - R1-Searcher++ approach: determine when internal knowledge suffices vs. when external search is needed
   - Reduces unnecessary searches, improves efficiency

10. **Draft-Based Denoising (TTD-DR)**
    - Maintain evolving draft throughout research process
    - Each search iteration is guided by gaps in the current draft
    - Produces more coherent final output than ad-hoc result combination

---

## Sources (Primary)

### Papers
- [Deep Research: A Survey of Autonomous Research Agents](https://arxiv.org/html/2508.12752v1) - comprehensive survey
- [ConvSearch-R1: Query Reformulation via RL](https://arxiv.org/html/2505.15776v1) - EMNLP 2025
- [Deep Researcher with Test-Time Diffusion (TTD-DR)](https://arxiv.org/html/2507.16075v1) - Google Research
- [DeepResearcher with Sequential Plan Reflection](https://arxiv.org/pdf/2601.20843) - RL for deep research
- [PRISM: Agentic Retrieval for Multi-Hop QA](https://arxiv.org/html/2510.14278v1)
- [Query Expansion in the Age of LLMs: Comprehensive Survey](https://arxiv.org/html/2509.07794v1)
- [Systematic Study of PRF with LLMs](https://arxiv.org/html/2603.11008v1)
- [PRF Closes the Gap Between Small and Large Models](https://arxiv.org/abs/2503.14887)
- [Absence of Evidence: Fact Verification via IR-Based ICL](https://dl.acm.org/doi/10.1007/978-3-031-68323-7_34)
- [IterCQR: Iterative Conversational Query Reformulation](https://www.aimodels.fyi/papers/arxiv/itercqr-iterative-conversational-query-reformulation-retrieval-guidance)
- [RFG Framework: Retrieval-Feedback-Grounded Multi-Query Expansion](https://www.scitepress.org/Papers/2025/138369/138369.pdf)
- [Citation Tracking for Systematic Literature Searching](https://pmc.ncbi.nlm.nih.gov/articles/PMC8474097/)

### Implementations
- [Search-R1](https://github.com/PeterGriffinJin/Search-R1) - RL training for reasoning + search
- [R1-Searcher](https://github.com/RUCAIBox/R1-Searcher) - RL-based search invocation
- [dzhng/deep-research](https://github.com/dzhng/deep-research) - reference deep research agent
- [qx-labs/agents-deep-research](https://github.com/qx-labs/agents-deep-research) - OpenAI Agents SDK implementation
- [langchain-ai/open_deep_research](https://github.com/langchain-ai/open_deep_research) - LangChain implementation
- [Semantic Scholar MCP Server](https://github.com/alperenkocyigit/semantic-scholar-graph-api) - citation graph access for AI agents

### Reference Materials
- [Stanford NLP IR Book: Query Expansion](https://nlp.stanford.edu/IR-book/html/htmledition/query-expansion-1.html)
- [Semantic Scholar API Tutorial](https://www.semanticscholar.org/product/api/tutorial)
- [Semantic Scholar API Docs](https://api.semanticscholar.org/api-docs/)
- [How OpenAI Deep Research Works](https://blog.promptlayer.com/how-deep-research-works/)
- [Snowballing/Citation Chaining Guide](https://www.oxbridgeessays.com/blog/snowballing-in-research-a-complete-guide-to-citation-chaining/)
- [HKUST Citation Chaining LibGuide](https://libguides.hkust.edu.hk/citation-chaining)
- [Closed World Assumption - Wikipedia](https://en.wikipedia.org/wiki/Closed-world_assumption)

---

## Platforms Checked
- Google Search (10 queries across 2 rounds)
- arxiv.org (8 papers fetched and analyzed)
- GitHub (6 repositories examined)
- ACM Digital Library
- PMC/PubMed
- Springer Nature
- Stanford NLP resources
- Microsoft Learn
- ScienceDirect
- Semantic Scholar (API docs + tutorial)
- PromptLayer blog
- Milvus documentation (blocked - 403)
