# Phase 3: RETRIEVE — Raw Findings Log

## Batch 1 Findings (initial parallel burst, 2026-04-06)

### F1 — VectorDBBench benchmark snapshot
- **Claim**: "Redis Vector leads in throughput at 12K QPS and Qdrant achieves 8.5K QPS, while pgvector achieves approximately 1.8K QPS" (on Cohere-1M or comparable)
- Source: Redis blog (Benchmarking results for vector databases), https://redis.io/blog/benchmarking-results-for-vector-databases/
- **Methodology**: 8-core, 32GB host, Intel Xeon Platinum 8375C @ 2.90GHz
- Source credibility: MEDIUM-LOW (vendor Redis self-benchmark — Redis is promoting itself vs competitors, inherent bias. Need third-party triangulation)

### F2 — pgvectorscale performance claim
- **Claim**: "At 50 million vectors, Qdrant achieves 41.47 QPS at 99% recall, compared to pgvectorscale's 471 QPS" (May 2025)
- Source: appears in multiple summaries; originally Timescale/pgvectorscale blog
- **Methodology flag**: pgvectorscale (Timescale's extension) is DIFFERENT from vanilla pgvector. Must clearly distinguish in report.
- **Credibility**: LOW-MEDIUM (vendor-published, comparing their product favorably)

### F3 — Recall numbers
- **Claim**: "Most modern vector databases achieve 95-99% recall at k=10 with HNSW indexes. Qdrant leads at ~98.5%, Zilliz/Milvus at ~97.9%, Weaviate at ~97.2%."
- Source: datastores.ai, aggregated from vendor benchmarks
- **Credibility**: MEDIUM — aggregator, but the numbers are within the known HNSW recall range
- **Verification priority**: HIGH — must find primary source for these specific numbers

### F4 — Pinecone pricing structure (April 2026)
- **Claim**: Standard plan $50/month minimum, Enterprise $500/month, Starter free (2GB, 2M writes/mo, 1M reads/mo, us-east-1 only)
- Source: https://www.pinecone.io/pricing/ (via TechTarget, withorb, SaaSworthy)
- **Billing**: Pinecone Billing Unit = aggregated consumption across reads (RUs), writes (WUs), and storage
- **Inference**: $0.08/million tokens for hosted models
- **Credibility**: HIGH (official)

### F5 — Filtered vector search — performance cliff
- **Claim**: "Existing HNSW-based filtering methods underperform on 'unhappy-middle' selectivities" — SIEVE paper (arXiv 2507.11907)
- **Claim**: "On 100M SIFT with SQ8, throughput 800 QPS at 100% selectivity → 2853 QPS at 1% selectivity; p95 66ms → 17ms"
- Source: arxiv.org/html/2509.07789v1 "Filtered Approximate Nearest Neighbor Search: A Unified Benchmark"
- **Claim**: "If too many vectors are filtered out, the HNSW graph becomes disconnected, and the search becomes unreliable"
- **Credibility**: HIGH (academic)

### F6 — Qdrant filtering architecture
- **Claim**: "Qdrant uses a payload (inverted) index plus filterable HNSW, with a planner that picks brute-force or graph filtering based on selectivity"
- Source: ETH filtered ANN benchmark paper (2025) — http://htor.inf.ethz.ch/publications/img/2025_iff_fanns_benchmark.pdf
- **Credibility**: HIGH (academic, independent of Qdrant)

### F7 — Hybrid search support matrix (2026)
- **Weaviate**: Hybrid-first, BlockMax WAND (technical preview in v1.29), RSF default since v1.24
- **Qdrant**: Sparse+dense via Query API (v1.9+), weighted scoring or RRF
- **Milvus 2.5** (Dec 2024): native full-text search with Sparse-BM25
- **Pinecone**: proprietary sparse encoding
- **pgvector**: NOT native — can combine with PostgreSQL full-text search extensions manually
- Source: Weaviate blog, Qdrant articles, Milvus blog, various 2025 comparisons

### F8 — Milvus 2.6 performance claims (Milvus blog)
- **Claim**: "3-4× higher throughput than Elasticsearch with equivalent recall rates, with specific workloads reaching 7× higher QPS"
- **Claim**: "RaBitQ 1-bit quantization compresses main index to 1/32 original size; with SQ8 refinement maintains 95% recall using 1/4 original memory"
- **Claim**: "Woodpecker WAL local file system mode 450 MB/s (3.5× faster than Kafka); S3 mode 750 MB/s (5.8× Kafka)"
- **Claim**: "100,000 collections per cluster (up from previous limit)"
- Source: milvus.io/blog/introduce-milvus-2-6-built-for-scale-designed-to-reduce-costs.md
- **Credibility**: MEDIUM (vendor blog, unverified methodology for 7× and 3-4× comparisons)

### F9 — Weaviate 1.29 BlockMax WAND
- **Claim**: "BlockMax WAND organizes inverted index in blocks to enable skipping over blocks not relevant to query"
- **Caveat**: "Technical preview in 1.29, not recommended for production, may have breaking changes"
- Source: weaviate.io/blog/weaviate-1-29-release
- **Credibility**: HIGH (official release notes; self-hedged)

### F10 — pgvector characteristics
- **Claim**: "pgvector 0.7.0 supports parallel index builds for HNSW indexes, 30x faster build; with compression 67x faster" (vs 0.5.1)
- **Claim**: "The single biggest factor in pgvector performance is keeping your HNSW index in memory"
- **Claim**: "10M 128-dim vectors: table 5.45 GB, HNSW index 7.75 GB"
- Source: AWS blog; jkatz05.com
- **Credibility**: MEDIUM-HIGH (AWS is vendor; Katz is Postgres PM at EDB — credible practitioner)

### F11 — AWS outage wake-up call for vector DB DR
- **Claim**: Zilliz publicly argued the AWS outage showed vector DBs need cross-region DR
- Source: zilliz.com/blog/the-aws-outage-was-a-wake-up-call-for-vector-database-cross-region-disaster-recovery
- **Credibility**: MEDIUM (vendor perspective, but references real AWS event)

### F12 — "Bad embedding deployment" incident
- **Claim**: "A production outage triggered by a bad embedding deployment led to rebuilding 120 million vectors in about 18 hours"
- Source: mentioned in search results summary but needs primary source
- **Status**: UNVERIFIED — need to find original

## Sources seen so far (credibility notes)

| # | Source | Type | Credibility | Use |
|---|--------|------|-------------|-----|
| 1 | github.com/zilliztech/VectorDBBench | Benchmark repo | HIGH (w/ vendor caveat) | SQ1 |
| 2 | qdrant.tech/benchmarks | Vendor benchmark | MEDIUM (vendor self-bench) | SQ1 |
| 3 | redis.io/blog/benchmarking-results-for-vector-databases | Vendor comparative | LOW-MEDIUM | SQ1 |
| 4 | datastores.ai/benchmarks | Third-party aggregator | MEDIUM | SQ1 |
| 5 | ann-benchmarks.com | Academic benchmark | HIGH | SQ1 |
| 6 | arxiv.org/html/2507.00379v2 "Towards Robustness: A Critique of Current Vector Database Assessments" | Academic critique | HIGH | methodology limitations |
| 7 | arxiv.org/html/2509.07789v1 "Filtered ANN Search: A Unified Benchmark" | Academic | HIGH | SQ5 |
| 8 | arxiv.org/pdf/2510.27141 "Compass: General Filtered Search" | Academic | HIGH | SQ5 |
| 9 | arxiv.org/html/2507.11907 "SIEVE" | Academic | HIGH | SQ5 |
| 10 | htor.inf.ethz.ch/publications/img/2025_iff_fanns_benchmark.pdf | Academic (ETH) | HIGH | SQ5 |
| 11 | pinecone.io/pricing | Official | HIGH | SQ2 |
| 12 | pinecone.io/blog/serverless | Official blog | HIGH (w/ bias caveat) | SQ2 |
| 13 | withorb.com/blog/pinecone-pricing | Third-party analyst | MEDIUM-HIGH | SQ2 |
| 14 | metacto.com/blogs/the-true-cost-of-pinecone | Third-party analysis | MEDIUM | SQ2 |
| 15 | cloudatler.com/blog/pinecone-vs-weaviate-cost-comparison-100m-vectors | Third-party | MEDIUM | SQ2 |
| 16 | milvus.io/docs/release_notes.md | Official docs | HIGH | SQ1 |
| 17 | milvus.io/blog/introduce-milvus-2-6 | Vendor blog | MEDIUM | SQ1 |
| 18 | milvus.io/blog/introduce-milvus-2-5 | Vendor blog | MEDIUM | SQ3 |
| 19 | weaviate.io/blog/weaviate-1-29-release | Vendor blog | HIGH (official) | SQ3 |
| 20 | weaviate.io/blog/hybrid-search-fusion-algorithms | Vendor blog | HIGH | SQ3 |
| 21 | qdrant.tech/articles/hybrid-search | Vendor blog | HIGH | SQ3 |
| 22 | github.com/weaviate/weaviate-BEIR-benchmarks | Vendor benchmark, academic dataset | HIGH | SQ3 |
| 23 | aws.amazon.com/blogs/database/supercharging-vector-search-performance-and-relevance-with-pgvector-0-8-0 | Vendor (AWS) blog | MEDIUM-HIGH | SQ1, SQ2 |
| 24 | jkatz05.com/post/postgres/pgvector-hnsw-performance | Expert blog (Jonathan Katz, Postgres PM) | HIGH | SQ1 |
| 25 | supabase.com/blog/increase-performance-pgvector-hnsw | Vendor blog | MEDIUM-HIGH | SQ1 |
| 26 | zilliz.com/blog/the-aws-outage-was-a-wake-up-call-for-vector-database-cross-region-disaster-recovery | Vendor | MEDIUM | SQ4 |
| 27 | mastra.ai/blog/pgvector-perf | Third-party (Mastra) | MEDIUM | SQ1 |
| 28 | cloud.google.com/blog/products/databases/faster-similarity-search-performance-with-pgvector-indexes | Vendor (GCP) blog | MEDIUM-HIGH | SQ1 |
| 29 | yudhiesh.github.io/2025/05/09/the-achilles-heel-of-vector-search-filters | Expert blog | HIGH | SQ5 |

## Gaps so far
- Need Qdrant official benchmark details with methodology
- Need Pinecone SLA and outage history (no specific Pinecone outages found yet)
- Need Weaviate shard rebalance failure details
- Need Milvus operational complexity real-world data
- Need explicit hybrid search quality improvement on BEIR datasets (NDCG@10)
- Need case studies at specific scale tiers (e.g., >100M vectors)
