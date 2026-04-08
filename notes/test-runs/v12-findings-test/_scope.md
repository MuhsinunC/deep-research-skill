# Phase 1: SCOPE — Vector Databases for RAG Comparison

## Research Question (Fully Resolved)
Comprehensive comparison of modern vector databases for Retrieval-Augmented Generation (RAG) applications as of April 2026, focusing on measured performance benchmarks, cost tradeoffs across scale tiers, hybrid search capabilities, production failure modes, and filtered search performance. The five databases under evaluation are: **Qdrant, Pinecone, Weaviate, Milvus, and pgvector**.

## Decomposed Sub-Questions

### SQ1: Performance Benchmarks (Latency & Throughput)
- What are p50/p95/p99 query latencies under realistic RAG workloads?
- What is sustained QPS (queries per second) at various recall targets (e.g., 0.95, 0.99)?
- How do these databases perform on standard benchmarks (ANN-Benchmarks, VectorDBBench)?
- What methodologies underlie the reported numbers (hardware, dataset, index type)?

### SQ2: Cost Tradeoffs Across Scale Tiers
- **Small (<10M vectors)**: Monthly cost for self-hosted vs managed deployments
- **Medium (10M-100M)**: Cost structure, infrastructure requirements
- **Large (>100M)**: Operational cost at scale, TCO considerations
- Hidden costs: egress, support, on-call, migration, replication

### SQ3: Hybrid Search (Dense + Sparse)
- Which databases natively support BM25/SPLADE + dense vectors?
- What fusion methods are supported (RRF, linear combination, weighted)?
- Does hybrid search measurably improve NDCG@10, MRR, Recall vs pure vector search?
- What is the latency overhead of hybrid search?

### SQ4: Production Failure Modes
- Index rebuild time and disruption profile
- Memory pressure and OOM behavior
- Replication lag, leader election failures
- Known critical bugs, GitHub issues from late 2025 – April 2026
- Scaling limits, sharding pain points

### SQ5: Filtered Vector Search Performance
- How do databases handle pre-filter vs post-filter vs in-graph filter strategies?
- What is the performance impact of cardinality (low vs high selectivity)?
- Are there documented benchmarks for filtered search?

## Stakeholder Perspectives
1. **Engineering lead** evaluating build vs buy decisions for RAG infrastructure
2. **SRE / platform engineer** worried about operational burden and failure modes
3. **ML/RAG engineer** optimizing retrieval quality metrics
4. **Finance/procurement** comparing TCO at current and projected scales

## Scope Boundaries

### IN scope:
- Official benchmarks from each vendor (with methodology scrutiny)
- Third-party benchmarks: ANN-Benchmarks, VectorDBBench, Qdrant's own benchmark suite
- Production case studies with quantitative outcomes
- Open-source GitHub issues/discussions from late 2025 through April 2026
- Quantitative measurements with verifiable methodology

### OUT of scope:
- Marketing whitepapers without methodology transparency
- Toy synthetic benchmarks (<100K vectors, unless matching established benchmark standards)
- Pre-2025 results, except foundational architecture decisions (HNSW paper, FAISS, etc.)
- Vector databases not in the top-5 list (Chroma, LanceDB, Vespa, Elasticsearch vector, MongoDB Atlas Vector, etc.) except as brief cross-comparisons
- Embedding model quality (this is orthogonal to the DB layer)

## Priority
**Quantitative measurements > qualitative claims.** Every cited number must have verifiable methodology. When two sources conflict on a metric, prefer the source with published methodology over the source that merely cites the number.

## Topic Time Domain (for Temporal Credibility Decay)
- **Primary domain: Technology / software** → **90-day half-life**
- Sub-question SQ4 (production failure modes) leans toward **30-60 day half-life** for "current bugs" sub-topic
- Architectural foundations (HNSW, IVF_PQ, product quantization) are **no-decay** reference material
- Apply: Benchmark results older than 180 days (2 half-lives) from Oct 2025 will be deprioritized unless they represent the canonical published benchmark for a database. GitHub issue threads must be from late 2025 or later to be considered "current state".

## Key Assumptions to Validate
1. **A1**: The five databases represent the dominant options in the RAG ecosystem (as opposed to newer entrants like LanceDB, Turbopuffer, or integrated search engines).
2. **A2**: Benchmarks like ANN-Benchmarks and VectorDBBench are methodologically sound enough to be referenced (they have known limitations around workload realism).
3. **A3**: "Managed" Qdrant Cloud and Weaviate Cloud have meaningful performance parity with self-hosted versions (may not be true due to multi-tenancy).
4. **A4**: Cost data published by vendors is representative of real deployments (hidden costs often dominate).
5. **A5**: GitHub issue volume is a useful proxy for production pain (may reflect user base size, not bug density).

## Success Criteria
- All 5 sub-questions answered with at least 3 independent sources per major claim
- Quantitative data preserved with methodology context, not stripped numbers
- Contradictions between vendor claims and third-party benchmarks explicitly resolved
- Production failure modes grounded in actual GitHub issues, case studies, or post-mortems (not speculation)
- Recommendations tied to scale tier and use case — not a generic "X is best"

## Extended Thinking (Think2 PLAN)

### Alternative framings considered:
1. **Framing A (chosen)**: Database-by-database comparison across 5 dimensions — gives readers a decision matrix
2. **Framing B**: Dimension-first (latency first, then cost, then hybrid, etc.) — better for users optimizing one constraint but hides holistic tradeoffs
3. **Framing C**: Scale-tier-first (small → large) — closest to how engineers actually make decisions, but fragments per-database context

**Decision**: Combine Framing A as primary structure (Findings 1-5 map to sub-questions) with scale-tier sub-sections inside the cost finding. This preserves decision-matrix utility AND addresses the scale-tier question head-on.

### Likely failure modes:
- **F1**: Vendors will publish self-serving benchmarks. Must weight third-party benchmarks (VectorDBBench, ANN-Benchmarks) higher AND inspect methodology.
- **F2**: pgvector is often underrated in marketing because it's "free and boring" but architecturally limited vs HNSW-native engines. Must resist both hype corrections.
- **F3**: Pinecone is closed-source; its internal architecture is opaque. Bias risk: over-trusting their blog posts.
- **F4**: Hybrid search benchmarks are extremely dataset-dependent (BEIR vs MS MARCO vs domain-specific). Must identify dataset alongside numbers.
- **F5**: "Production failure modes" is the most biased category — users who succeed don't post issues, users who fail often do. Selection bias in GitHub issues must be acknowledged.

## Think2 EVALUATE
- **Sub-questions identified**: 5 core + approximately 20 decomposed angles
- **Assumptions to validate**: 5 (A1-A5), all testable during RETRIEVE
- **Failure modes anticipated**: 5 (F1-F5)
- **Scope depth**: Appropriate for deep mode. Target 10,000-15,000 word report.
- **Flag for PLAN**: Must allocate distinct search angles to distinguish vendor vs third-party evidence, and must include adversarial queries targeting each database's known weaknesses.
