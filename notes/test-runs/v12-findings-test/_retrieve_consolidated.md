# Phase 3: RETRIEVE — Consolidated Findings

**Total findings**: ~120 across 4 sub-agents + main thread
**Unique sources**: ~80
**Sub-questions covered**: All 5 (SQ1-SQ5)

## Source Tier Breakdown

### Tier 1 — Academic / Primary
- arXiv 2507.00379 (Wang et al., Jul 2025) — "Towards Robustness: A Critique of Current Vector Database Assessments" — methodology critique of VectorDBBench/ANN-Benchmarks
- arXiv 2509.07789 — "Filtered ANN Search: A Unified Benchmark and Systematic Experimental Study"
- arXiv 2602.11443 — "Filtered Approximate Nearest Neighbor Search in Vector Databases" (Amanbayev et al., Feb 2026)
- arXiv 2507.11907 — SIEVE (PVLDB 2025, vol 18 issue 11 pp 4723-4736)
- arXiv 2510.27141 — Compass general filtered search
- arXiv 2405.12497 — RaBitQ (SIGMOD 2024, Gao & Long)
- arXiv 2403.06789 — SPLADE-v3 (NAVER Labs)
- arXiv 2505.07621 — Bang for the Buck (Kuffo & Boncz, CWI, May 2025)
- IISWC 2025 atlarge-research — partition vs graph indexes for downstream Q&A
- DiskANN (NeurIPS 2019)
- HNSW original paper (Malkov & Yashunin, 2016)

### Tier 1 — Official documentation / release notes
- qdrant.tech/blog/qdrant-1.15.x/ (July 2025)
- qdrant.tech/blog/qdrant-1.16.x/ (Nov 2025) — Tiered Multitenancy, Inline Storage, ACORN
- qdrant.tech/blog/2025-recap/
- weaviate.io/blog/weaviate-1-29-release/ — BlockMax WAND
- weaviate.io/pricing/serverless and weaviate.io/blog/weaviate-cloud-pricing-update
- milvus.io/blog/introduce-milvus-2-5-full-text-search-powerful-metadata-filtering-and-more.md (Dec 2024)
- milvus.io/blog/introduce-milvus-2-6-built-for-scale-designed-to-reduce-costs.md (2025)
- milvus.io/docs/release_notes.md
- pinecone.io/pricing
- pinecone.io/blog/serverless/
- pinecone.io/blog/cascading-retrieval/
- pinecone.io/learn/hybrid-search-intro/
- github.com/pgvector/pgvector (README)

### Tier 1 — Vendor benchmark data with disclosed methodology
- qdrant.tech/benchmarks/ (raw JSON, 2024-06-15)
- zilliz.com/vdbbench-leaderboard
- github.com/zilliztech/VectorDBBench
- github.com/weaviate/weaviate-BEIR-benchmarks

### Tier 2 — Independent expert blogs
- jkatz05.com/post/postgres/pgvector-hnsw-performance/ — Jonathan Katz (Postgres PM at EDB)
- alex-jacobs.com/posts/the-case-against-pgvector/ — Alex Jacobs
- simonwillison.net/2025/Nov/3/the-case-against-pgvector/
- yudhiesh.github.io/2025/05/09/the-achilles-heel-of-vector-search-filters/
- jxnl.co/writing/2025/09/11/turbopuffer-object-storage-first-vector-database-architecture/ (Jason Liu)
- 567-labs.github.io/systematically-improving-rag/talks/turbopuffer-engine/

### Tier 2 — Engineering blogs from real companies
- notion.com/blog/two-years-of-vector-search-at-notion (10B+ vectors, 90% cost reduction)
- milvus.io/blog/choosing-a-vector-database-for-ann-search-at-reddit.md (~340M vectors)
- turbopuffer.com/customers/notion
- mastra.ai/blog/pgvector-perf
- maxrohde.com/2025/08/09/pinecone-price-increase-is-chroma-cloud-the-best-alternative/

### Tier 2 — Production status / incident records
- status.pinecone.io/history
- statusgator.com/services/pinecone (9 incidents in 90 days, median 4h5min)
- status.qdrant.io/

### Tier 2 — Cloud provider engineering posts
- aws.amazon.com/blogs/database/supercharging-vector-search-performance-and-relevance-with-pgvector-0-8-0-on-amazon-aurora-postgresql/
- aws.amazon.com/blogs/database/load-vector-embeddings-up-to-67x-faster-with-pgvector-and-amazon-aurora/
- aws.amazon.com/blogs/database/accelerate-hnsw-indexing-and-searching-with-pgvector
- cloud.google.com/blog/products/databases/faster-similarity-search-performance-with-pgvector-indexes/
- supabase.com/blog/increase-performance-pgvector-hnsw

### Tier 2 — Pricing analysts
- withorb.com/blog/pinecone-pricing
- metacto.com/blogs/the-true-cost-of-pinecone
- rahulkolekar.com/vector-db-pricing-comparison-pinecone-weaviate-2026/
- pecollective.com/tools/weaviate-pricing/
- saasworthy.com/product/pinecone-io/pricing
- benchant.com (Cohere-10M cost benchmark)

### Tier 3 — GitHub issues (critical lens)
- github.com/qdrant/qdrant/issues/4378 — OOM during ingestion
- github.com/qdrant/qdrant/issues/5250 — Memory leak concurrent
- github.com/qdrant/qdrant/issues/5268 — RAM accounting wrong v1.12.1
- github.com/qdrant/qdrant/issues/5595 — DatetimeRange wrong results
- github.com/qdrant/qdrant/issues/7425 — match.any returns 0 records
- github.com/qdrant/qdrant/issues/6421 — Hybrid search wrong metric
- github.com/qdrant/qdrant/issues/2374 — Inconsistent results filters
- github.com/milvus-io/milvus/pull/40976 — Delete data loss fix
- github.com/milvus-io/milvus/issues/39866 — queryNode OOM water-level bypass
- github.com/milvus-io/milvus/issues/39937 — Persistent failure post-OOM
- github.com/milvus-io/milvus/issues/44417 — OOM under DQL
- github.com/milvus-io/milvus/issues/48714 — DataNode panic Arrow FFI
- github.com/milvus-io/milvus/issues/41020 — Compaction stuck
- github.com/milvus-io/milvus/issues/46576 — 2.6 timeout duplication
- github.com/milvus-io/milvus/issues/48391 — 14-min search timeout WAL
- github.com/weaviate/weaviate/issues/10268 — GSE tokenizer + replication panic Jan 2026
- github.com/weaviate/weaviate/issues/4585 — mmap crash
- github.com/weaviate/weaviate/issues/5100 — Lazy shard data corruption
- github.com/weaviate/weaviate/issues/8921 — Datetime > 2500 returns 2024-2025
- github.com/weaviate/weaviate/issues/8790 — Boolean filter silent fail
- github.com/weaviate/weaviate/issues/5432 — Hybrid pagination duplicates
- github.com/pgvector/pgvector/issues/807 — HNSW build crash 17M×1536
- github.com/pgvector/pgvector/issues/822 — HNSW stuck 29% 8hrs
- github.com/pgvector/pgvector/issues/671 — HNSW + filter inconsistent
- github.com/pgvector/pgvector/issues/751 — Zero results with HNSW filter
- github.com/pgvector/pgvector/issues/678 — Iterative index scans (pre-0.8)
- github.com/advisories/GHSA-mhjq-8c7m-3f7p — CVE-2025-64513 Milvus auth bypass

### Tier 3 — Aggregator content (used for pointers, not claims)
- firecrawl.dev/blog/best-vector-databases
- tensorblue.com/blog/vector-database-comparison-pinecone-weaviate-qdrant-milvus-2025
- digitaloneagency.com.au/...
- letsdatascience.com/blog/vector-databases-compared-pinecone-qdrant-weaviate-milvus-and-more

## Sub-Question Coverage Map

### SQ1 — Performance benchmarks
**Coverage**: Strong, ~30 distinct numeric findings
- Qdrant raw JSON benchmark (parallel=100, dbpedia-1M, Azure D8s v3): Qdrant 1,260 QPS p99 8.07ms; Weaviate 1,142 QPS p99 11.34ms; Milvus 219 QPS p99 576ms
- VectorDBBench leaderboard ($1K/mo, 1M dataset): ZillizCloud 9,901 QPS; Milvus 9,575; OpenSearch 3,055; QdrantCloud 1,242; Pinecone p2.x8 1,146
- Tigerdata pgvectorscale 50M Cohere: pgvectorscale 471 QPS p99 74.6ms vs Qdrant 41 QPS p99 38.7ms (Qdrant tuning admitted difficult)
- IISWC 2025: ScaNN 25,054 QPS at 0.90 recall ≈ DiskANN 14,606 QPS at 0.96 recall (matched Q&A 74.9% downstream)
- pgvector 0.7 → 30x faster build with parallel; 67x with compression
- Milvus 2.6 RaBitQ: 236 → 864 QPS @ 0.95 recall (3.66x), memory at 28% original

### SQ2 — Cost tradeoffs at scale
**Coverage**: Strong, multiple data points across all 3 scale tiers
- Pinecone Standard $50/mo min (Sept 2025), Enterprise $500/mo
- Pinecone serverless: $0.33/GB storage, $8.25-16/M reads, $2-4/M writes
- Weaviate Shared Cloud (renamed from Serverless Oct 27 2025): $25/1M dimensions/mo; Flex $45/mo, Premium $400/mo
- Benchant Cohere-10M cost benchmark: Zilliz 8 CU $1,430/mo (highest QPS); Pinecone p2.x4 $5,834/mo; Pinecone p2.x8 $11,668/mo (all 88-91% recall)
- Crossover analysis: at 10M managed wins ($64/mo Pinecone vs $660/mo self-hosted Qdrant w/ DevOps); at 1B self-hosted ~4-6x cheaper
- Pinecone 100M vectors / 150M queries / month ~$5K-6K
- Notion: 90% cost reduction migrating away from prior (to Turbopuffer)

### SQ3 — Hybrid search
**Coverage**: Strong, with concrete BEIR data
- Weaviate BEIR (alpha=0.5 fusion):
  - NFCorpus: 0.224 BM25 → 0.280 hybrid → 0.264 vector (hybrid wins)
  - SciFact: 0.678 → 0.714 → 0.683 (hybrid wins)
  - FIQA: 0.284 → 0.428 → 0.434 (vector wins)
  - Quora: 0.770 → 0.867 → 0.887 (vector wins)
- Pinecone cascading retrieval: up to 44% (avg 23%) better NDCG@10 on TREC DL Tracks
- Pinecone with reranker: avg 12% improvement over dense or sparse alone, 8% better than score fusion
- 26-31% NDCG improvement on high-vocab-mismatch BEIR domains
- Weaviate 1.29 BlockMax WAND (technical preview, not for prod)
- Milvus 2.5 native Sparse-BM25 (Dec 2024)
- Qdrant Query API for hybrid (v1.9+) with weighted/RRF
- pgvector: NO native hybrid; requires manual integration with Postgres tsvector

### SQ4 — Production failure modes
**Coverage**: Strong, ~36 critical findings across all 5 DBs
- Pinecone: 9 incidents in 90 days (StatusGator), median 4h5min; Feb 5 + Mar 13 2026 outages confirmed
- Milvus CVE-2025-64513 critical auth bypass (all 2.5.x users urged upgrade)
- Milvus delete-data-loss bug 2.5 (PR #40976)
- Multiple Milvus OOM bugs bypassing memory protection (#39866, #39937, #44417)
- pgvector HNSW + filter correctness bugs (#671, #751) — wrong row counts based on whether index used
- pgvector scaling wall: 17M×1536 crash (#807), 8h+ stalls (#822), oscillating latency 50ms↔5s
- Weaviate mmap crash (#4585), data corruption from lazy shard reload (#5100), GSE tokenizer panic in v1.34.10 (#10268, Jan 2026)
- Qdrant filter correctness bugs (#5595, #7425, #6421)
- Qdrant memory leak concurrent (#5250)

### SQ5 — Filtered vector search
**Coverage**: Strong, multiple academic + practitioner sources
- HNSW + filter "performance cliff" — graph disconnects at high filter ratios
- IVFFlat outperforms HNSW on low-selectivity queries (multiple papers)
- 100M SIFT SQ8: 800 QPS @ 100% selectivity → 2,853 QPS @ 1% (Couchbase CVI)
- Qdrant uses payload inverted index + filterable HNSW with planner that picks brute-force or graph based on selectivity
- Milvus has best recall stability via hybrid execution (per Amanbayev et al.)
- pgvector 0.8 added iterative_scan to mitigate HNSW + filter "overfiltering" issue
- ACORN algorithm in Qdrant 1.16 (Nov 2025) targets multiple filters with weak selectivity
- arxiv 2507.00379: average recall hides per-query variability — 70x difference in zero-recall queries between ScaNN (0.03%) and DiskANN (2.1%) on Text-to-Image-10M

## Key Cross-Cutting Patterns

1. **Vendor benchmarks contradict each other** — Qdrant's own benchmark vs Zilliz VectorDBBench show inverse rankings (Qdrant > Milvus vs Milvus > Qdrant)
2. **Academic consensus**: HNSW underperforms partition-based on filtered + tail-recall — contradicting common practitioner advice
3. **Robustness-δ@K** is gaining traction as a serious replacement for mean recall (per arxiv 2507.00379)
4. **Notion → Turbopuffer** is the dominant 2025-2026 RAG infrastructure migration story (NOT one of the 5 named DBs — but informs the "should we use these?" question)
5. **pgvector correctness bugs** make it the riskiest choice for filter-heavy RAG workloads despite cost appeal
6. **Pinecone cost-and-lock-in** is the single most-cited reason teams migrate away
7. **Milvus has strong feature velocity** (2.5 → 2.6 with RaBitQ, BM25, JSON indexing) but heaviest operational burden

## Think2 EVALUATE
- **Sources gathered**: 80+ unique (target was 25+ for deep) ✓
- **Avg credibility**: ~75/100 estimate (lots of academic + GitHub primary + expert blogs)
- **Coverage gaps**: Pinecone serverless internal architecture (closed source); independent 100M-scale cost benchmarks (only 10M Benchant exists)
- **Single-source dependencies to flag**: pgvectorscale numbers (Tigerdata only), Pinecone internal QPS/latency (vendor-only), some Milvus 2.6 claims (no third-party benchmark yet)
- **Think2 EVALUATE for next phase**: TRIANGULATE must focus on:
  1. Resolving Qdrant vs Milvus benchmark contradiction (vendor self-serving in opposite directions)
  2. Independence check on pgvectorscale claims
  3. Independence of Notion case study from Turbopuffer marketing
  4. Devil's advocate searches on emerging thesis "managed Pinecone has cost-and-reliability issues"
