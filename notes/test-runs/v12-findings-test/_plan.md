# Phase 2: PLAN — Research Strategy

## Source Priority Map

### Tier 1 (Primary — highest credibility)
- **Official documentation**: qdrant.tech/documentation, docs.pinecone.io, weaviate.io/developers/weaviate, milvus.io/docs, github.com/pgvector/pgvector README + wiki
- **Research papers**: arxiv.org (HNSW, IVF_PQ, SPLADE, BM25 foundations)
- **Benchmark repositories**:
  - github.com/erikbern/ann-benchmarks
  - github.com/zilliztech/VectorDBBench (maintained by Milvus company)
  - github.com/qdrant/vector-db-benchmark (Qdrant's own, must be treated as vendor material)
- **Vendor engineering blogs with methodology**: qdrant.tech/blog, pinecone.io/learn, weaviate.io/blog, milvus.io/blog

### Tier 2 (Third-party analysis)
- Published benchmarks on IEEE, VLDB, SIGMOD
- Independent blog posts from engineers with verifiable credentials (case studies at known companies)
- Conference talks (recorded): PyData, NeurIPS workshops, Data Council
- Open-source issue trackers: github.com/<vendor>/<repo>/issues with label:bug (for production failure modes)

### Tier 3 (Supporting context)
- HackerNews discussions (use to find primary sources, not as primary sources)
- Reddit r/MachineLearning, r/LocalLLaMA (anecdotal, triangulate against Tier 1)
- Stack Overflow production war stories

### Deprioritized
- "Top 10 vector databases" SEO listicles
- AI-generated content farms (Medium articles without author credentials)
- Marketing pages without numbers or methodology
- Comparison posts by vendors comparing themselves favorably to competitors (use for structure, not claims)

## Query Decomposition by Angle

### Angle 1: Core benchmarks (semantic search)
- "vector database benchmark VectorDBBench 2025"
- "ANN-Benchmarks HNSW comparison Qdrant Milvus Weaviate"
- "Pinecone performance benchmark 2025"

### Angle 2: Technical details (keyword search)
- "Qdrant vs Weaviate vs Milvus QPS latency recall"
- "pgvector HNSW IVFFlat performance"
- "Pinecone serverless s1 p1 pod performance"

### Angle 3: Recent developments (date-filtered)
- "vector database 2026 comparison"
- "Qdrant 1.12 release 2025"
- "Weaviate 1.28 1.29 performance"
- "Milvus 2.5 2.6 release"
- "pgvector 0.8 performance improvements"
- "Pinecone serverless architecture 2025"

### Angle 4: Academic/research
- "dense sparse hybrid retrieval BEIR benchmark 2025"
- "SPLADE BM25 vector fusion RRF"
- "filtered vector search HNSW selectivity"

### Angle 5: Alternative perspectives / critical
- "Qdrant production problems issues"
- "Pinecone outage incident 2025"
- "Weaviate memory leak OOM"
- "Milvus sharding rebalance issues"
- "pgvector scalability limits"

### Angle 6: Statistical / quantitative
- "VectorDBBench results Qdrant Pinecone Weaviate Milvus PostgreSQL"
- "vector database p99 latency benchmark table"
- "recall@10 filtered search benchmark"

### Angle 7: Industry case studies
- "vector database production RAG case study"
- "[company name] migrated from [DB] to [DB]"
- "[company] vector database at scale millions"

### Angle 8: Known failure modes (critical analysis lens)
- "Pinecone pricing complaint"
- "Milvus operational burden complexity"
- "pgvector slow million vectors"
- "Weaviate shard rebalance failure"

## Pro/Con Query Pairs (for the 5 central evaluative sub-questions)

### SQ1 — Performance:
- PRO: "Qdrant fastest vector database benchmark 2025"
- CON: "Qdrant slower than Milvus Pinecone benchmark limitations"

### SQ2 — Cost:
- PRO: "self-hosted vector database cheaper than Pinecone"
- CON: "self-hosted vector database hidden costs operational burden"

### SQ3 — Hybrid search:
- PRO: "hybrid search dense sparse outperforms vector RAG"
- CON: "hybrid search overhead latency does not help BEIR"

### SQ4 — Production reliability:
- PRO: "Pinecone managed reliable SLA"
- CON: "Pinecone outage downtime incident"

### SQ5 — Filtered search:
- PRO: "pre-filter filtered HNSW fast selective"
- CON: "filtered vector search performance cliff low selectivity"

## Sub-Agent Lens Assignments (4 agents for deep mode)

### Agent A — Academic / Formal lens
- **Target**: Published benchmarks, arxiv papers, VLDB/SIGMOD work, BEIR dataset literature
- **Queries**: "HNSW filtered search paper", "ANN benchmark methodology", "dense sparse retrieval evaluation"
- **Writes to**: /tmp/research_agent_A_academic.md

### Agent B — Practitioner / Applied lens
- **Target**: Engineering blogs, case studies, production deployment stories, tutorials with numbers
- **Queries**: "[company] vector database case study", "migrated RAG production", "engineering blog RAG scale"
- **Writes to**: /tmp/research_agent_B_practitioner.md

### Agent C — Critical / Adversarial lens
- **Target**: GitHub issues, bug reports, outage reports, pain-point discussions
- **Queries**: "Pinecone 2025 problem", "Qdrant issue memory", "Milvus instability", "pgvector limit", "Weaviate bug"
- **Writes to**: /tmp/research_agent_C_critical.md

### Agent D — Quantitative / Benchmark lens
- **Target**: VectorDBBench results, ANN-Benchmarks tables, vendor benchmark reports with methodology
- **Queries**: "VectorDBBench leaderboard 2025", "ann-benchmarks.com Qdrant Milvus Weaviate", "Pinecone s1 vs p1 benchmark numbers"
- **Writes to**: /tmp/research_agent_D_benchmark.md

## Knowledge Dependencies
1. **Must understand first**: HNSW index structure (affects how filter/recall tradeoffs work); IVF_PQ (affects Pinecone's architecture); BM25 and SPLADE (affects hybrid search); RRF fusion.
2. **Must gather before synthesis**: Per-database current version numbers (as of April 2026) — features change fast.
3. **Must validate**: VectorDBBench results must be dated and versioned (benchmarks evolve).

## Triangulation Approach
- Every quantitative performance claim must be supported by: (a) vendor-published benchmark, (b) third-party benchmark, and (c) a case study or production report. If only vendor benchmarks exist, label as "vendor-only."
- Cost claims must be triangulated across: official pricing page + independent TCO analysis + case study.
- Failure mode claims must be triangulated across: GitHub issue + post-mortem/incident report (if any) + community discussion.

## Quality Gates (per mode: deep)
- **Minimum**: 25+ sources, avg credibility >70/100
- **Coverage**: Each of the 5 sub-questions has at least 5 independent sources
- **Diversity**: Academic + industry + technical docs + engineering blogs represented

## Extended Thinking (Think2 PLAN)
- **Hardest-to-find**: SQ4 (production failure modes with quantitative detail). Issue trackers skew to user error. Must hunt post-mortems and SRE talks.
- **Highest correlation risk**: All 4 sub-agents might converge on the same VectorDBBench + ANN-Benchmarks numbers. Agent A (academic) and Agent C (critical) should be explicitly steered AWAY from those to find alternative benchmarks (VLDB, internal company benchmarks, Turbopuffer benchmarks that compare against incumbents).
- **Most likely query failures**: Vendor-specific pricing queries after Pinecone 2025 pricing changes — must go to web.archive.org as backup. pgvector production scale numbers are sparse.
- **Dead-end warning**: "Managed service SLA" queries often return marketing. Better to search for specific incidents.

## Think2 EVALUATE
- **Coverage check**: Plan covers all 5 sub-questions across 8 angles + 5 pro/con pairs + 4 lens-specialized sub-agents
- **Single-source dependencies**: Pinecone architecture details likely to be single-vendor-source (closed source). Flag for TRIANGULATE.
- **Gaps to watch**: Independent QPS numbers for pgvector (community benchmarks exist but are sparse). Hybrid search quality improvement numbers on RAG-specific datasets (as opposed to BEIR).
- **Flag for RETRIEVE**: Launch Step 1 parallel searches covering angles 1-6 in one burst; launch 4 sub-agents concurrently with lens prompts.
