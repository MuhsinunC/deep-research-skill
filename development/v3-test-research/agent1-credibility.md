# Advanced Source Credibility Assessment Techniques for AI Research Agents

**Research Date:** 2026-03-22
**Status:** Complete
**Scope:** Cross-source corroboration, source independence detection, temporal credibility decay, domain-specific credibility markers
**Focus:** Techniques BEYOND basic source scoring (0-100) and source preference heuristics

---

## 1. Cross-Source Corroboration Networks

### The Core Problem
When an AI research agent finds 5 sources agreeing on a claim, it needs to determine whether those 5 sources represent 5 independent confirmations or 1 original claim echoed 4 times. Basic source scoring (0-100) cannot distinguish these cases.

### 1.1 Credibility Signal Taxonomy (arXiv Survey, Oct 2024)

The most comprehensive taxonomy (Molina et al., extended in arXiv 2410.21360v2) groups credibility signals into four levels:

1. **Message and linguistic** -- textual features of the claim itself (writing quality, hedging language, specificity)
2. **Sources and intentions** -- who is making the claim and why (author credentials, organizational backing, declared conflicts)
3. **Structural** -- how the claim relates to other claims (citation patterns, placement, editorial context)
4. **Network** -- the citation/sharing graph topology (who links to whom, propagation patterns, cluster structure)

The survey identifies **9 textual credibility signals** that can be automatically assessed:
- Factuality, subjectivity and bias
- Persuasion techniques and logical fallacies
- Check-worthy and fact-checked claims
- Text quality
- References and citations
- Clickbaits and title representativeness
- Originality and content reuse
- Offensive language
- Machine-generated text

**Key gap:** The survey notes that while scoring approaches exist (ordinal classification and regression), no unified framework combines all signal types into a single credibility score.

### 1.2 Multi-Source Heterogeneous Information Fusion (PMC, 2021)

A credibility measurement method that goes beyond individual source scoring:

- Combines **correlation between data sources** and fusion algorithms
- Uses **spatio-temporal relationships** between sources and temporal correlation between time series data
- Employs ARIMA and neural network models to calculate combined credibility
- **Key insight for AI agents:** The method uses relationships *between* sources as a signal, not just individual source quality. Two sources that always agree might be echoing each other; two sources with partial overlap are more likely independent.

### 1.3 Multi-Agent Evidence Retrieval (WKGFC, arXiv March 2026)

The most recent work on multi-source fact-checking uses a hierarchical evidence strategy:

- **Primary layer:** Structured knowledge graphs (Wikidata) via SPARQL queries with expand-and-prune
- **Secondary layer:** Open web content, triggered only when KG coverage is insufficient
- Web information is treated as **"hypothesis-expanding, not authoritative"** -- KG evidence is the higher-precision foundation
- Contradictory evidence between KG and web sources is not treated as noise; contradictions are **explicitly surfaced in self-critiques**
- Achieved **74.3% balanced accuracy**, outperforming the best baseline (FIRE, 68.9%) by +5.4 points
- Operates as a **reasoning agent within a POMDP** (Partially Observable Markov Decision Process)

### 1.4 Conflicting Evidence Resolution (CONFACT, arXiv May 2025)

When sources disagree, CONFACT provides a systematic framework:

- Processes multiple retrieved documents that may contradict each other
- Requires the LLM to **weigh and synthesize** conflicting information rather than selecting a single "correct" source
- Evaluates source reliability based on **domain authority and historical accuracy patterns**
- Analyzes whether conflicts stem from **different interpretations, temporal changes, or factual disagreement**
- Trains models with specialized prompting and reasoning chains that force explicit conflict acknowledgment

**Sources:**
- [Survey on Automatic Credibility Assessment (arXiv)](https://arxiv.org/html/2410.21360v2)
- [Multi-Source Credibility Assessment (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8038569/)
- [Corroborating Information from Multiple Sources (Rutgers)](https://rucore.libraries.rutgers.edu/rutgers-lib/51498/PDF/1/play/)
- [Credibility-Driven Quality Assessment of Multi-source CTI (Springer)](https://link.springer.com/chapter/10.1007/978-981-95-3456-2_3)
- [Multi-Sourced, Multi-Agent Evidence Retrieval (arXiv)](https://arxiv.org/html/2603.00267v1)
- [Resolving Conflicting Evidence in Fact-Checking (arXiv)](https://arxiv.org/pdf/2505.17762)

---

## 2. Source Independence Detection

### The Circular Citation / Circular Reporting Problem

**Circular reporting** (also called "false confirmation") occurs when a piece of information appears to come from multiple independent sources but in reality comes from only one source. Mechanisms:

1. **Publication A** publishes misinformation
2. **Publication B** reprints it
3. **Publication A** then cites B as the source (classic circular citation)
4. OR: Multiple publications report on the same initial piece, making it appear verified by multiple sources to a later observer

This is a recognized challenge in intelligence analysis, journalism, and scientific research.

### 2.1 CIDRE Algorithm -- Anomalous Citation Group Detection (Nature Scientific Reports, 2021)

The most rigorous algorithmic approach to detecting citation cartels/circular citation groups:

**Null Model:**
Uses a degree-corrected stochastic block model (dcSBM) with Poisson distribution:
```
P_null(w; lambda_ij) = (lambda_ij^w * exp(-lambda_ij)) / w!
```
Where expected citations lambda_ij = (s_i_out * s_j_in * Lambda_gi_gj) / (S_gi_out * S_gj_in)

This accounts for journal citation volumes (out/in-strength) and research field groupings.

**Detection Process:**
1. Identifies excessive citations by comparing observed edges against null model (p < 0.01, Benjamini-Hochberg correction)
2. Calculates donor/recipient scores: fraction of excessive citations provided/received within candidate groups
3. Iteratively removes journals below threshold theta=0.15 and recomputes
4. Partitions remaining nodes into weakly connected components with >=50 within-group citations

**Key Thresholds:**

| Parameter | Value | Purpose |
|-----------|-------|---------|
| theta (donor/recipient threshold) | 0.15 | Minimum fraction of excessive citations within group |
| theta_w (min within-group citations) | 50 | Minimum citation volume for group classification |
| Significance level (alpha) | 0.01 | Statistical confidence for excessive citations |

**Results:**
- Applied to **48,821 journals** from Microsoft Academic Graph (2010-2019)
- Found **184 citation groups** (average size: 4 journals)
- Detected **12 of 22 JCR-suspended groups** (>=50% overlap)
- **10 groups identified BEFORE JCR suspension** (early detection)
- 7 new anomalous groups in 2019 where members received >30% citations internally
- Impact factor inflation ranged **17-130%** through within-group citations
- 93 groups (58%) traced to single-paper citation sources
- 26 groups (16%) involved shared editorial board members
- Algorithm is **deterministic and scalable** to large networks
- Open source: [github.com/skojaku/cidre](https://github.com/skojaku/cidre)

**Adaptation for AI research agents:** The CIDRE approach can be adapted beyond academic journals. For any source network, build a citation/reference graph, compute expected citation rates under a null model accounting for topic proximity and source size, then flag groups with statistically excessive mutual citation.

### 2.2 Information Cascade and Echo Chamber Detection (CIKM 2022 / arXiv 2208.04620)

A complementary approach using information propagation patterns:

- Uses **probabilistic generative models** that explain social media footprints through latent communities with echo-chamber behavior
- Models echo chambers as communities **permeable to ideologically similar information but impermeable to opposed viewpoints**
- Uses **Generalized Expectation Maximization** to optimize joint likelihood of social connections and information propagation
- Validated on real-world polarized debates (Brexit referendum, COVID-19 vaccines)
- Can detect when information spreads through amplification within a closed group vs. genuine cross-community spread

### 2.3 AI-Specific Independence Threats

#### Hallucinated Citations (NeurIPS 2025 Analysis by GPTZero)
- Analyzed 4,000+ NeurIPS 2025 papers; found hundreds of AI-hallucinated citations across 53+ papers
- AI models blend/paraphrase elements from real papers with believable-sounding but fabricated titles
- Some citations had fully fabricated authors, fake journals, or dead URLs
- **Prerequisite for independence checking:** First verify the citation actually exists and says what is claimed

#### AI-Amplified Narrative Bias (FDD Analysis, March 2026)
- LLMs extensively cited Kremlin-aligned outlets (Pravda, TASS) for ~20% of neutral Ukraine-Russia questions
- ChatGPT cited state-aligned sources for geopolitical questions
- **Implication:** Independence detection must account for editorial/political alignment as a clustering dimension

#### Misinformation Amplification Factor (MAF)
- Tracks the ratio between actual engagement a misinformation post gets vs. expected engagement based on creator's historical performance
- Provides a quantitative measure of how much platforms amplify single-source claims

### 2.4 Synthesized Independence Detection Framework

For an AI research agent, source independence should be assessed across **five dimensions:**

| Dimension | Question | Detection Method |
|-----------|----------|-----------------|
| **Citation independence** | Do all sources trace back to a single original? | Backward citation graph traversal; convergence = non-independent |
| **Temporal independence** | Did sources publish after the original without adding new evidence? | Timestamp ordering + content delta analysis |
| **Methodological independence** | Did the source conduct its own analysis/experiment? | Check for original data, methodology sections, new evidence |
| **Organizational independence** | Are sources from different institutions without funding/personnel overlap? | Entity extraction on author affiliations, funding disclosures |
| **Editorial independence** | Are sources from different editorial/political clusters? | Political alignment clustering (FDD approach) |

An "effective source count" could be calculated as: the number of truly independent confirmation paths, weighted by the methodological rigor of each.

**Sources:**
- [CIDRE: Detecting Anomalous Citation Groups (Nature Scientific Reports)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8282695/)
- [CIDRE GitHub Repository](https://github.com/skojaku/cidre)
- [Cascade-based Echo Chamber Detection (arXiv)](https://arxiv.org/abs/2208.04620)
- [NeurIPS AI-Hallucinated Citations (Fortune)](https://fortune.com/2026/01/21/neurips-ai-conferences-research-papers-hallucinations/)
- [AI-Amplified Narratives in LLM Citations (FDD)](https://www.fdd.org/analysis/2026/03/03/ai-amplified-narratives-measuring-propaganda-in-llm-citations/)
- [Circular Reporting (Wikipedia)](https://en.wikipedia.org/wiki/Circular_reporting)
- [Scite.ai Smart Citations](https://scite.ai/)
- [Misinformation Amplification Tracking (Integrity Institute)](https://www.integrityinstitute.org/blog/misinformation-amplification-tracking-dashboard)

---

## 3. Information Provenance Tracking

### 3.1 PROV-AGENT Framework (IEEE e-Science 2025)

The first provenance framework designed specifically for AI agent workflows.

**Authors:** Souza, Gueroudji, DeWitt, Rosendo, Ghosal, Ross, Balaprakash, da Silva (UT-Battelle/DOE)

**Architecture:**
- Extends **W3C PROV** standard with AI-specific abstractions as first-class elements
- Treats agents as subclasses of PROV Agent; maintains backward compatibility
- Leverages **Model Context Protocol (MCP)** and data observability for integration

**Core Classes (Schema):**
- `Campaign`, `Workflow`, `Task` (subclasses of PROV Activity)
- `AIAgent` (subclass of PROV Agent)
- `AgentTool`, `AIModelInvocation` (specialized Activities)
- `DomainData`, `SchedulingData`, `TelemetryData` (subclasses of DataObject/Entity)

**Relationships:** Standard PROV constructs (`used`, `wasGeneratedBy`, `wasAttributedTo`, `wasInformedBy`, `wasAssociatedWith`)

**Agent-Specific Metadata Captured:**
- Tool executions modeled as `AgentTool` activities linked to executing agents
- `AIModelInvocation` instances recording LLM calls with metadata
- Explicit capture of prompts and `ResponseData` objects
- Model metadata: provider, name, temperature settings, parameters
- Infrastructure context: compute node details, GPU IDs, CPU/GPU usage, disk metrics

**Error Propagation Tracking:**
- **Backward tracing:** From erroneous outputs through agent decisions, prompts, model responses, input data
- **Forward impact analysis:** "How did an agent decision influence subsequent workflow activities?"
- **Cyclic dependency recognition:** Handles feedback loops where decisions at iteration i influence iteration i+1

**Implementation:** Built on Flowcept framework using decorator-based instrumentation (`@flowcept_agent_tool`) and LLM wrappers; provenance data streamed to persistent databases.

**Relevance to credibility assessment:** PROV-AGENT provides the infrastructure to track WHERE a claim came from through the entire agent pipeline. If Agent A retrieved a claim from Source X, summarized it, and Agent B used that summary as input, PROV-AGENT can trace the full chain. This is the foundation layer that source independence detection and corroboration analysis build upon.

### 3.2 Knowledge Graph Fact Verification (ACM Computing Surveys, Sept 2025)

Two primary approaches for verifying claims against knowledge graphs:

**Path-based approaches:**
- Validate assertions by analyzing paths (sequences of entities and predicates) connecting subject and object
- Enable **multi-hop and context-rich inference** beyond single-triple patterns
- Explicitly exploit relational graph structure

**Embedding-based approaches:**
- Project KG components into continuous vector space
- Calculate semantic matching scores to verify triples
- More scalable but less interpretable

**Hybrid approaches (arXiv, Nov 2025):**
- Integrate KGs, LLMs, and search-based retrieval agents
- Uses RAG pipeline with consensus between multiple LLM responses
- Leverages individual strengths of each component

### 3.3 Reasoning Paths as Provenance Signals (arXiv, June 2025)

Multi-hop fact verification using structural reasoning progression:

**Architecture:**
- Incrementally constructs reasoning graphs from claims and retrieved evidence
- Edges defined by intra-sentence adjacency and inter-sentence co-occurrence
- Guides next query generation through attention-based message passing
- Builds "progressively growing evidence subgraphs" (not all-at-once processing)

**Graph Structure:**
- Intra-sentence adjacency edges (adjacent tokens)
- Inter-sentence co-reference edges (coreferent mentions across sentences)
- Learned latent edges (dynamically added via similarity-based graph structure learning)
- Processed by GraphFormers (Transformer + graph-structured aggregation)

**Results:**
- FEVER dataset: 80.17% label accuracy, 77.62% FEVER Score
- HoVer complex claims: +1.48-3.09% improvement on 2-4 hop subsets vs. strongest baseline

**Sources:**
- [PROV-AGENT (arXiv)](https://arxiv.org/abs/2508.02866)
- [PROV-AGENT Full Text](https://arxiv.org/html/2508.02866v3)
- [LLM Agents for Interactive Workflow Provenance (ACM)](https://dl.acm.org/doi/10.1145/3731599.3767582)
- [Fact Checking Knowledge Graphs Survey (ACM)](https://dl.acm.org/doi/10.1145/3749838)
- [Hybrid Fact-Checking with KGs and LLMs (arXiv)](https://arxiv.org/html/2511.03217)
- [Reasoning Paths for Multi-Hop Fact Verification (arXiv)](https://arxiv.org/html/2506.07075)
- [Paths-over-Graph for LLM Reasoning (ACM)](https://dl.acm.org/doi/10.1145/3696410.3714892)

---

## 4. Temporal Credibility Decay

### The Freshness Problem
Source credibility is not static. A medical study from 2015 may have been superseded. A tech benchmark from 2023 is likely obsolete. A legal ruling from 1960 might still be binding precedent. Different domains require fundamentally different decay functions.

### 4.1 Fused Semantic-Temporal Scoring (arXiv 2509.19376)

**The Formula:**
```
score(q, d, t) = alpha * cos(q, d) + (1 - alpha) * 0.5^(age_days(t) / h)
```

Where:
- `alpha` = balance parameter (default 0.7 = balanced)
- `cos(q, d)` = cosine similarity between query and document embeddings
- `h` = half-life in days (default 14)
- `age_days(t)` = days between current UTC time and document timestamp

**Alpha Parameter Sensitivity:**

| Alpha Value | Mode | Latest@10 Accuracy |
|-------------|------|-------------------|
| 0.4-0.5 | Recency heavy | 1.00 |
| 0.7 (default) | Balanced | 1.00 |
| >= 0.9 | Semantic dominant | 0.667 |

**Key Result:** Simple recency prior achieved **perfect accuracy (1.00)** on freshness tasks. Cosine-only baseline (no temporal component) scored **0.00** on Latest@10.

**Domain-Specific Tuning Recommendations:**

| Domain | Recommended Half-Life | Rationale |
|--------|----------------------|-----------|
| Breaking news | Short (1-3 days) | Rapid topic obsolescence |
| Security/incident response | Default (14 days) | Balance freshness with multi-week relevance |
| Technical documentation | Long (60-180 days) | Stable, persistent relevance |
| Strategic analysis | Medium (30-60 days) | Weekly granularity appropriate |

### 4.2 Decay Model Comparison

| Model | Formula Pattern | Best For | Weakness |
|-------|----------------|----------|----------|
| **Linear decay** | `1 - (age / max_age)` | General-purpose, predictable | Doesn't model real-world decay well |
| **Half-life (exponential)** | `0.5^(age / h)` | Tech, news, science | Requires tuning h per domain |
| **Exponential decay** | `e^(-lambda * age)` | Breaking news, security | Can discount still-valid sources too aggressively |
| **Step function** | `1 if age < T else 0` | Legal/regulatory (effective dates) | No graceful degradation |
| **Sigmoid decay** | `1 / (1 + e^(k*(age - midpoint)))` | Topics with clear obsolescence point | Requires knowing the midpoint |

### 4.3 Domain-Specific Temporal Credibility Rules

Based on synthesis across all sources:

**Fast-Decay Domains (half-life: days to weeks):**
- Technology benchmarks, pricing data, software versions
- News events, breaking stories
- Security vulnerabilities, CVEs
- Social media sentiment, trending topics

**Medium-Decay Domains (half-life: months):**
- Scientific research (non-medical)
- Market analysis, financial data
- Policy positions, corporate strategies
- Technology tutorials (framework-dependent)

**Slow-Decay Domains (half-life: years):**
- Medical research (unless superseded by meta-analysis)
- Historical facts, biographical data
- Mathematical proofs, fundamental science
- Engineering specifications (hardware tolerances, material properties)

**Near-Zero Decay Domains:**
- Legal precedent (until explicitly overruled)
- Constitutional text, statutes (until amended)
- Mathematical theorems
- Geographical facts (until changed)

### 4.4 Content Decay as Credibility Risk

Content decay -- information becoming outdated, inaccurate, or irrelevant -- is a critical risk because AI systems present decayed content with the **same confidence as current content**. Highest risk: healthcare, law, finance, scientific research. An AI agent that cites a 2019 medical guideline superseded in 2022 does active harm if it presents the old guideline without temporal context.

**Sources:**
- [Solving Freshness in RAG (arXiv)](https://arxiv.org/html/2509.19376)
- [AI Citations and Content Decay (Medium)](https://medium.com/@barrettrestore/ai-citations-and-content-decay-why-source-freshness-matters-24e1488dd057)
- [Temporal Relevance Explained (Airweave)](https://airweave.ai/blog/temporal-relevance-explained)
- [Temporal Consistency in AI-Mediated Trust (Lex Wire)](https://lexwire.org/ai-authority/temporal-consistency/)

---

## 5. Domain-Specific Credibility Markers

### 5.1 The E-E-A-T Framework (Google, 2022-present)

Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) provides the most widely deployed credibility signal framework:

- **Experience:** First-hand knowledge of the subject matter
- **Expertise:** Depth of knowledge demonstrated by author/source
- **Authoritativeness:** Reputation of author, content, and publishing site
- **Trustworthiness:** The most important factor; overall reliability

E-E-A-T is **more important for YMYL (Your Money Your Life) content** -- medical, financial, legal, safety topics. Sites in these categories saw major traffic declines (2018-2020) as Google surfaced only the highest-quality content.

### 5.2 Health/Medical Credibility Markers (PMC, 2021)

A detailed framework from the health information credibility literature identifies three core principles and eight measurable attributes:

**Core Principles:**
1. **Science-Based:** Consistent with best scientific evidence; demonstrates subject-matter expertise through citations, peer review, consensus
2. **Objective:** Minimizes financial and ideological conflicts; separates health messaging from profit motives
3. **Transparent & Accountable:** Discloses limitations, conflicts of interest, errors, correction procedures

**Institutional Credibility Tiers:**

| Tier | Source Type | Credibility Signal |
|------|-----------|-------------------|
| **High** | Accredited organizations (hospitals, universities, health departments) | Pre-existing vetting via accreditation |
| **High** | Government agencies | Constitutional oversight, transparency laws |
| **High** | Academic journals (MEDLINE-indexed) | Peer review standards |
| **Variable** | Professional associations, think tanks, NGOs, patient advocacy | Requires individualized evaluation |
| **Low** | Unaffiliated individuals, commercial entities without credentials | No pre-existing vetting |

**Eight Measurable Quality Attributes:**
1. Date labels and content updates
2. Citations and evidence justification
3. Multiple-source synthesis
4. Consensus and peer review processes
5. Cross-linking with credible sources
6. Knowledge limitation acknowledgment
7. Conflict of interest disclosure
8. Error correction procedures

**Important:** The framework explicitly rejects simple numerical scoring, stating "each attribute is not necessarily of equal weight or importance." Recommends assessing "general alignment" with principles.

### 5.3 Domain-Specific Authority Markers (Synthesized)

| Domain | Primary Authority Markers | Secondary Markers | Red Flags |
|--------|--------------------------|-------------------|-----------|
| **Medical/Health** | Peer review, MEDLINE indexing, institutional accreditation, RCT evidence level | Impact factor, citation count, funding disclosure | No peer review, commercial conflicts, anecdotal evidence only |
| **Technology** | Reproducible benchmarks, open-source code, version-pinned claims, official documentation | GitHub stars, community adoption, conference acceptance | Vague benchmarks, no code, claims without version numbers |
| **Legal** | Court citations (Westlaw/LexisNexis), statutory references, bar association membership | Law review publication, judicial appointment | Non-lawyer opinions on legal matters, outdated case law without Shepardizing |
| **Financial** | SEC filings, audited statements, CFA/CPA credentials | Bloomberg/Reuters data, regulatory compliance | Unaudited claims, no regulatory filing, anonymous sources |
| **Scientific (general)** | Peer review, preregistration, replication status, data availability | h-index, institutional affiliation, funding transparency | No methodology section, cherry-picked results, p-hacking indicators |
| **News/Current Events** | Named sources, editorial standards, corrections policy, press council membership | AP/Reuters wire attribution, byline accountability | Anonymous attribution, no corrections policy, content farm patterns |

### 5.4 Probabilistic Truthfulness Scoring (MDPI Mathematics, May 2025)

A concrete framework for quantifying credibility at the claim level:

- **Decomposes complex claims** into semantically atomic units
- Each atomic unit matched against a curated corpus using binary alignment
- **Truthfulness quantified via composite score** integrating source reliability AND support density
- Multiple aggregation strategies (arithmetic and geometric means) for claim-level veracity indices
- **Performance:** MSE 0.037, Brier Score 0.042, Spearman rank correlation 0.88 vs expert annotations
- Binary classification: Precision 0.82, Recall 0.79, F1 0.805

### 5.5 Authority Signals in AI-Cited Health Sources (medRxiv, Jan 2026)

A framework specifically evaluating source credibility in ChatGPT responses, organized around four questions:
1. "Who wrote it?" (Author Credentials)
2. "Who published it?" (Institutional Affiliation)
3. "How was it vetted?" (Quality Assurance)
4. Digital/technical metrics (secondary to the above three)

**Sources:**
- [E-E-A-T Framework (Lily Ray)](https://lilyray.nyc/e-a-t-expertise-authoritativeness-trustworthiness/)
- [Google Search Quality Guidelines](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Credible Health Sources: Principles and Attributes (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8486420/)
- [Authority Signals in AI Health Sources (medRxiv)](https://www.medrxiv.org/content/10.64898/2026.01.22.26344576v1.full.pdf)
- [Probabilistic Truthfulness Scoring (MDPI)](https://www.mdpi.com/2227-7390/13/11/1778)
- [DecMetrics: Structured Claim Decomposition (arXiv)](https://arxiv.org/abs/2509.04483)

---

## 6. Practical Implementation Recommendations for AI Research Agents

### 6.1 Beyond Basic Source Scoring: A Layered Architecture

```
Layer 1: Source Identity & Base Score (existing 0-100)
    |
Layer 2: Independence Analysis
    - Citation graph traversal (CIDRE-inspired)
    - Temporal ordering check
    - Organizational overlap detection
    - Calculate "effective independent source count"
    |
Layer 3: Corroboration Network Analysis
    - Build claim-evidence graph
    - Classify each source's contribution: original evidence vs echo vs synthesis
    - Weight by methodological independence
    - Apply CONFACT conflict resolution when sources disagree
    |
Layer 4: Temporal Decay Adjustment
    - Apply domain-specific half-life function
    - score = alpha * base_score + (1-alpha) * 0.5^(age/h)
    - Flag sources past domain-appropriate expiry
    |
Layer 5: Domain-Specific Credibility Markers
    - Apply domain authority markers from Section 5.3
    - Check for peer review, institutional backing, credential verification
    - YMYL topics get stricter thresholds
    |
Layer 6: Provenance Tracking (PROV-AGENT inspired)
    - Record full chain: which agent found which source, what prompt, what model
    - Enable backward tracing from any claim to its origin
    - Detect error propagation across agent handoffs
```

### 6.2 Key Metrics to Implement

| Metric | Definition | Formula/Approach |
|--------|-----------|-----------------|
| **Effective Independent Source Count (EISC)** | Number of truly independent confirmation paths | Count sources after removing citation-chain dependencies |
| **Temporal Credibility Score (TCS)** | Time-adjusted source reliability | `base_score * 0.5^(age_days / domain_half_life)` |
| **Corroboration Strength (CS)** | How well sources independently confirm | `EISC * avg_methodological_rigor` |
| **Domain Authority Match (DAM)** | Source's domain-specific credibility markers | Checklist score from Section 5.3 markers |
| **Claim Atomicity Score** | Per-atomic-claim verification status | Probabilistic framework from Section 5.4 |

### 6.3 Critical Open Problems

1. **No unified scoring framework** exists that combines all signal types -- this is acknowledged as a gap in the literature
2. **Automated methodological independence detection** (did a source do original work vs just report?) remains hard and largely manual
3. **Cross-domain credibility transfer** (is a medical journal's tech security advice credible?) is not well-studied
4. **Real-time circular reporting detection** in non-academic contexts (news, social media) lacks the structured citation graphs that CIDRE relies on
5. **Adversarial source credibility gaming** (sources that optimize for appearing credible to automated systems) is an emerging threat

---

## Platforms Checked
- arXiv (8 papers accessed)
- PubMed/PMC (3 papers accessed)
- Nature Scientific Reports (CIDRE paper)
- ACM Digital Library (2 papers)
- AAAI Conference Proceedings
- IEEE Xplore (PROV-AGENT)
- medRxiv (authority signals preprint)
- MDPI Mathematics (truthfulness scoring)
- Fortune (NeurIPS analysis)
- FDD (AI propaganda analysis)
- Springer Nature (credibility frameworks)
- Google Search Quality Rater Guidelines
