# Agent C — CRITICAL/ADVERSARIAL Lens: Vector DB Failures, Bugs, Outages

**Lens:** Red team — find problems, limitations, failures, bugs, outages, criticisms.
**Date:** 2026-04-06
**Target databases:** Qdrant, Pinecone, Weaviate, Milvus, pgvector
**Target finding count:** 15-20 critical findings across all 5 DBs.

## Methodology
- Tier 1: GitHub issues (label:bug), postmortems, incident reports with timestamps
- Tier 2: HN threads, Reddit r/LocalLLaMA / r/MachineLearning
- Tier 3: Engineering blogs describing failures
- Ignored: marketing, top-10 lists, generic praise
- Topic half-life: 90d for current-state, 30-60d for active bugs

## Findings Log (append-only)

### Round 1: GitHub bug issues + outages

```json
{"database": "qdrant", "failure_mode": "OOM", "claim": "Large-dataset ingestion causes OOMKills, caching behavior causes more memory use than expected even with quantization enabled", "evidence_quote": "OOM when trying to ingest large datasets due to caching", "source_url": "https://github.com/qdrant/qdrant/issues/4378", "source_title": "Issue #4378 — OOM when trying to ingest large datasets due to caching", "severity": "high", "date": "2024-2025", "confidence": 0.9}
```

```json
{"database": "qdrant", "failure_mode": "bug", "claim": "Memory leak in concurrent multitenant ingestion — memory not freed post-ingestion", "evidence_quote": "potential memory leak in Qdrant deployment when performing point ingestion operations in a multitenant environment, where memory usage increases steadily but is not freed", "source_url": "https://github.com/qdrant/qdrant/issues/5250", "source_title": "Issue #5250 — Memory Leak using Qdrant in a concurrent scenario", "severity": "high", "date": "2024-2025", "confidence": 0.85}
```

```json
{"database": "qdrant", "failure_mode": "bug", "claim": "RAM usage incorrect in v1.12.1 — vectors in RAM despite on_disk=true", "evidence_quote": "RAM usage is incorrect in v1.12.1 ... vectors appear to be all stored in RAM rather than disk even when config value vectors.on_disk is true", "source_url": "https://github.com/qdrant/qdrant/issues/5268", "source_title": "Issue #5268 — RAM usage is incorrect in v1.12.1", "severity": "high", "date": "2024-12", "confidence": 0.9}
```

```json
{"database": "qdrant", "failure_mode": "OOM", "claim": "OOMKill on Kubernetes during ingestion is a recurring deployment pattern requiring mitigation (later fixed in #7233 limiting parallel segment loading)", "evidence_quote": "Limit number of segments loaded in parallel, preventing potential OOM on large clusters", "source_url": "https://github.com/orgs/qdrant/discussions/3501", "source_title": "Discussion #3501 — Qdrant on Kubernetes OOMKilled During Ingestion", "severity": "high", "date": "2024-2025", "confidence": 0.85}
```

```json
{"database": "milvus", "failure_mode": "bug", "claim": "CRITICAL auth bypass in Milvus Proxy CVE-2025-64513 — security vulnerability",  "evidence_quote": "Milvus Proxy has a Critical Authentication Bypass Vulnerability", "source_url": "https://github.com/advisories/GHSA-mhjq-8c7m-3f7p", "source_title": "CVE-2025-64513 — Milvus Proxy Critical Authentication Bypass", "severity": "critical", "date": "2025", "confidence": 0.98}
```

```json
{"database": "milvus", "failure_mode": "bug", "claim": "QueryCoord deadlock during upgrades when hundreds of channels need rebalancing — required splitting executor into channel/non-channel task pools (#48351)", "evidence_quote": "QueryCoord deadlock during upgrades was fixed when hundreds of channels needed rebalancing", "source_url": "https://github.com/milvus-io/milvus/releases", "source_title": "Milvus releases — #48351 deadlock fix", "severity": "high", "date": "2025-2026", "confidence": 0.85}
```

```json
{"database": "milvus", "failure_mode": "bug", "claim": "Search requests could timeout 14+ minutes after WAL ownership changes due to unbounded message replay during scanner catchup (#48391)", "evidence_quote": "search requests could timeout for 14+ minutes after WAL ownership changes due to unbounded message replay during scanner catchup", "source_url": "https://github.com/milvus-io/milvus/releases", "source_title": "Milvus releases — #48391 WAL scanner catchup fix", "severity": "high", "date": "2025-2026", "confidence": 0.85}
```

```json
{"database": "milvus", "failure_mode": "bug", "claim": "Shard leader unavailable after upgrade; search fails with 'fail to get shard leaders from QueryCoord: no replica available'", "evidence_quote": "shard leader is unavailable after upgrade", "source_url": "https://github.com/milvus-io/milvus/issues/18178", "source_title": "Issue #18178 — shard leader is unavailable after upgrade", "severity": "high", "date": "2023-2024", "confidence": 0.85}
```

```json
{"database": "weaviate", "failure_mode": "bug", "claim": "Panic when using GSE tokenizer with replication — nil pointer dereference crashes shards in v1.34.10", "evidence_quote": "Panic when using GSE tokenizer with replication (nil Segmenter, EOF on /replicas/…:commit) in v1.34.10", "source_url": "https://github.com/weaviate/weaviate/issues/10268", "source_title": "Issue #10268 — Panic GSE tokenizer + replication", "severity": "high", "date": "2026-01", "confidence": 0.9}
```

```json
{"database": "weaviate", "failure_mode": "OOM", "claim": "Memory mapping exhaustion crashes entire node — too many active tenants per node exhaust mmap limits, causing Go fatal error", "evidence_quote": "if the cluster has more tenants marked active per node than the node can handle, running out of memory mappings causes Go to throw a fatal error that crashes the whole node", "source_url": "https://github.com/weaviate/weaviate/issues/4585", "source_title": "Issue #4585 — [Reliability] Add guardrails for memory mappings", "severity": "critical", "date": "2024-2025", "confidence": 0.9}
```

```json
{"database": "weaviate", "failure_mode": "bug", "claim": "Lazy shard loading: re-loading a shard that failed initially can corrupt data, causing SIGSEGV", "evidence_quote": "Re-loading a shard that failed to load initially can corrupt data (Lazy shard loading)", "source_url": "https://github.com/weaviate/weaviate/issues/5100", "source_title": "Issue #5100 — Lazy shard loading data corruption", "severity": "critical", "date": "2024-2025", "confidence": 0.9}
```

```json
{"database": "pgvector", "failure_mode": "scale-limit", "claim": "HNSW index build stuck/crashes on 17M vectors × 1536 dims after ~2 hours of runtime", "evidence_quote": "A user attempting to build an HNSW index on 17 million rows with 1536 dimensions encountered server crashes after ~2 hours", "source_url": "https://github.com/pgvector/pgvector/issues/807", "source_title": "Issue #807 — Very Slow HNSW Build for 17M Vectors, 1536 dimensions", "severity": "high", "date": "2024-2025", "confidence": 0.9}
```

```json
{"database": "pgvector", "failure_mode": "scale-limit", "claim": "HNSW index creation stuck 8+ hours at 29% progress on dozens of millions of vectors", "evidence_quote": "HNSW index creation is stuck on dozens millions entries", "source_url": "https://github.com/pgvector/pgvector/issues/822", "source_title": "Issue #822 — HNSW index creation stuck", "severity": "high", "date": "2024-2025", "confidence": 0.9}
```

```json
{"database": "pgvector", "failure_mode": "scale-limit", "claim": "pgvector query latency inconsistent at 5M vectors (50ms → 5s) + index builds can kill the DB", "evidence_quote": "At 5 million vectors, query latency becomes inconsistent—sometimes 50ms, sometimes 5 seconds—and index builds take hours and occasionally kill the database", "source_url": "https://alex-jacobs.com/posts/the-case-against-pgvector/", "source_title": "The Case Against pgvector — Alex Jacobs", "severity": "high", "date": "2025-11", "confidence": 0.85}
```

```json
{"database": "pinecone", "failure_mode": "outage", "claim": "In last 90 days (per StatusGator), Pinecone had 9 incidents — 7 major + 2 minor — median duration 4h5min", "evidence_quote": "In the last 90 days, Pinecone had 9 incidents (7 major outages and 2 minor incidents) with a median duration of 4 hours 5 minutes", "source_url": "https://statusgator.com/services/pinecone", "source_title": "Pinecone Status — StatusGator", "severity": "critical", "date": "2026-Q1", "confidence": 0.75}
```

```json
{"database": "pinecone", "failure_mode": "outage", "claim": "Serverless AWS us-east-1 freshness lag incident (writes not queryable within SLA)", "evidence_quote": "[Serverless][AWS][us-east-1] Increase in freshness lag for some namespaces", "source_url": "https://status.pinecone.io/history", "source_title": "Pinecone Status History — Feb 5, 2026 incident", "severity": "high", "date": "2026-02-05", "confidence": 0.9}
```

```json
{"database": "pinecone", "failure_mode": "outage", "claim": "March 13, 2026 officially acknowledged outage on Pinecone status page", "evidence_quote": "Another official outage occurred on March 13, 2026", "source_url": "https://status.pinecone.io/history", "source_title": "Pinecone Status History — Mar 13, 2026", "severity": "high", "date": "2026-03-13", "confidence": 0.8}
```

### Round 2: Cost complaints, correctness bugs, lock-in

```json
{"database": "pinecone", "failure_mode": "cost", "claim": "Pinecone introduced $50/month minimum for ALL users in Sept 2025 — blindsided low-volume users (including those formerly paying <$10/month)", "evidence_quote": "Starting September 1st, all users—regardless of actual usage—must pay a minimum of $50 per month", "source_url": "https://maxrohde.com/2025/08/09/pinecone-price-increase-is-chroma-cloud-the-best-alternative/", "source_title": "Pinecone Price Increase — Max Rohde", "severity": "high", "date": "2025-09", "confidence": 0.9}
```

```json
{"database": "pinecone", "failure_mode": "cost", "claim": "Pinecone Assistant prices surprise users; $4 bill for ~40-page PDF + a few queries; developers moved to Qdrant due to cost", "evidence_quote": "Why is Pinecone Assistant so expensive? Any tips to reduce the cost?", "source_url": "https://community.pinecone.io/t/why-is-pinecone-assistant-so-expensive-any-tips-to-reduce-the-cost/8111", "source_title": "Pinecone Community — Why is Pinecone Assistant so expensive", "severity": "medium", "date": "2025", "confidence": 0.8}
```

```json
{"database": "pinecone", "failure_mode": "cost", "claim": "Pinecone bills of $5,000-$6,000/mo for 100M vectors + 150M queries; egress fees escalate further", "evidence_quote": "organizations estimating Pinecone bills of $5,000-$6,000 for 100M vectors with 150M queries, escalating further with egress fees", "source_url": "https://www.salishseaconsulting.com/blog/vector-database-market/", "source_title": "Why the Vector Database Market Is Shifting Away from Pinecone", "severity": "high", "date": "2025", "confidence": 0.75}
```

```json
{"database": "pinecone", "failure_mode": "other", "claim": "Pinecone lock-in: query syntax, metadata filter format, SDKs all Pinecone-specific — migration requires re-indexing and rewriting all API integration code", "evidence_quote": "Migration from Pinecone to another vector database requires exporting vectors, choosing a new platform, reindexing, and rewriting all API integration code, as the query syntax, metadata filtering format, and SDK interfaces are all Pinecone-specific", "source_url": "https://www.salishseaconsulting.com/blog/vector-database-market/", "source_title": "Why the Vector Database Market Is Shifting Away from Pinecone", "severity": "medium", "date": "2025", "confidence": 0.75}
```

```json
{"database": "qdrant", "failure_mode": "bug", "claim": "CORRECTNESS BUG: DatetimeRange filter returns different/wrong results when range is expanded — relevant documents disappear from filtered results", "evidence_quote": "Qdrant gives different and incorrect results with DatetimeRange filter ... When searching for a range greater than 2022, the relevant document is not retrieved", "source_url": "https://github.com/qdrant/qdrant/issues/5595", "source_title": "Issue #5595 — DatetimeRange filter incorrect results", "severity": "critical", "date": "2024-12", "confidence": 0.9}
```

```json
{"database": "qdrant", "failure_mode": "bug", "claim": "CORRECTNESS BUG: v1.14.0 match.any filter returns 0 records when certain IDs are in the list, even though those IDs exist", "evidence_quote": "Issue with `match.any` filter returning no results when certain IDs included (v1.14.0)", "source_url": "https://github.com/qdrant/qdrant/issues/7425", "source_title": "Issue #7425 — match.any filter returning no results", "severity": "critical", "date": "2025-10", "confidence": 0.9}
```

```json
{"database": "qdrant", "failure_mode": "bug", "claim": "CORRECTNESS BUG: Hybrid search (sparse+dense) uses cosine distance instead of configured EUCLID metric; dense-only search uses correct metric", "evidence_quote": "When searching with hybrid search (sparse and dense vectors), scores are calculated using cosine distance instead of the configured distance metric (EUCLID)", "source_url": "https://github.com/qdrant/qdrant/issues/6421", "source_title": "Issue #6421 — Incorrect score with hybrid search", "severity": "high", "date": "2025-04", "confidence": 0.9}
```

```json
{"database": "qdrant", "failure_mode": "bug", "claim": "Non-deterministic results: same query against same index returns different results across executions", "evidence_quote": "Executing the same query on the same index multiple times returns inconsistent results, as if the query execution wasn't deterministic", "source_url": "https://github.com/qdrant/qdrant/issues/2374", "source_title": "Issue #2374 — Inconsistent results when querying with filters", "severity": "high", "date": "2023-08", "confidence": 0.85}
```

### Round 3: Milvus OOM, Weaviate pagination, benchmark critique

```json
{"database": "milvus", "failure_mode": "OOM", "claim": "Query node OOM even with memory-protection water levels (0.75/0.85) set — protection bypassed during FTS stability test", "evidence_quote": "The 4c16g query node still experienced OOM issues even after memory protection was set up with a low water level of 0.75 and a high wate level of 0.85", "source_url": "https://github.com/milvus-io/milvus/issues/39866", "source_title": "Issue #39866 — queryNode OOM despite memory protection", "severity": "high", "date": "2025-02", "confidence": 0.9}
```

```json
{"database": "milvus", "failure_mode": "OOM", "claim": "After queryNode OOM recovery, search/query/delete requests persistently fail — no graceful degradation", "evidence_quote": "Search, query and delete requests persistently fail after querynode oom recovery in stability test", "source_url": "https://github.com/milvus-io/milvus/issues/39937", "source_title": "Issue #39937 — Persistent failure after queryNode OOM recovery", "severity": "critical", "date": "2025-02", "confidence": 0.9}
```

```json
{"database": "milvus", "failure_mode": "OOM", "claim": "queryNode OOM during concurrent DQL load (master-20250916)", "evidence_quote": "[benchmark][cluster] queryNode OOM killed during concurrent DQL requests", "source_url": "https://github.com/milvus-io/milvus/issues/44417", "source_title": "Issue #44417 — queryNode OOM under concurrent DQL load", "severity": "high", "date": "2025-09", "confidence": 0.9}
```

```json
{"database": "milvus", "failure_mode": "bug", "claim": "queryNode memory usage unbalanced across nodes — some report 'memory quota exceeded' while others under-utilized", "evidence_quote": "Querynode memory usage is very unbalanced, some report memory quota exceeded", "source_url": "https://github.com/milvus-io/milvus/issues/33913", "source_title": "Issue #33913 — unbalanced queryNode memory", "severity": "high", "date": "2024-2025", "confidence": 0.85}
```

```json
{"database": "milvus", "failure_mode": "bug", "claim": "Concurrent search+query+upsert causes queryNodes to OOM AND cp (checkpoint) lag keeps growing — dual failure mode", "evidence_quote": "When concurrent search, query and upsert, queryNodes oom and cp lag keeps growing", "source_url": "https://github.com/milvus-io/milvus/issues/37156", "source_title": "Issue #37156 — queryNode OOM + checkpoint lag growth", "severity": "critical", "date": "2024-2025", "confidence": 0.9}
```

```json
{"database": "milvus", "failure_mode": "bug", "claim": "Bloom filter memory leaks when worker nodes crash — only fixed in Milvus 2.6.10/2.6.11", "evidence_quote": "Milvus 2.6.10 and 2.6.11 addressed bloom filter memory leaks when worker nodes crash", "source_url": "https://milvus.io/docs/release_notes.md", "source_title": "Milvus Release Notes — bloom filter memory leak fix", "severity": "high", "date": "2025-2026", "confidence": 0.8}
```

```json
{"database": "weaviate", "failure_mode": "bug", "claim": "CORRECTNESS BUG: DateTime filtering returns wrong events when filter date > year 2500 — returns 2024-2025 data by accident", "evidence_quote": "DateTime filtering returns wrong events when filtering for dates after year 2500", "source_url": "https://github.com/weaviate/weaviate/issues/8921", "source_title": "Issue #8921 — DateTime filter returns wrong events", "severity": "high", "date": "2025-08", "confidence": 0.9}
```

```json
{"database": "weaviate", "failure_mode": "bug", "claim": "CORRECTNESS BUG: Boolean property filtering fails silently with misleading error message despite index_filterable=True", "evidence_quote": "Boolean property filtering fails despite index_filterable=True", "source_url": "https://github.com/weaviate/weaviate/issues/8790", "source_title": "Issue #8790 — Boolean property filtering fails", "severity": "high", "date": "2025-07", "confidence": 0.9}
```

```json
{"database": "weaviate", "failure_mode": "bug", "claim": "Pagination+hybrid search bug: duplicate results returned across pages", "evidence_quote": "Duplicate results in hybrid search with pagination", "source_url": "https://github.com/weaviate/weaviate/issues/5432", "source_title": "Issue #5432 — Duplicate results in hybrid search with pagination", "severity": "high", "date": "2024-2025", "confidence": 0.9}
```

```json
{"database": "weaviate", "failure_mode": "scale-limit", "claim": "HARD LIMIT: offset+limit > 10000 causes pagination errors — cannot paginate deep result sets without cursor workaround", "evidence_quote": "setting the sum of offset and limit to higher than 10,000 objects will lead to an error in Weaviate", "source_url": "https://drdroid.io/stack-diagnosis/weaviate-invalid-pagination-parameters", "source_title": "Weaviate Invalid Pagination Parameters — drdroid", "severity": "medium", "date": "2025", "confidence": 0.85}
```

```json
{"database": "weaviate", "failure_mode": "bug", "claim": "Filtering on properties fails in v1.31.1 with Python client 4.14.4", "evidence_quote": "Filtering on properties does not work", "source_url": "https://github.com/weaviate/weaviate/issues/8446", "source_title": "Issue #8446 — Filtering on properties does not work", "severity": "high", "date": "2025-06", "confidence": 0.85}
```

```json
{"database": "other", "failure_mode": "other", "claim": "METHODOLOGY CRITIQUE: Average-recall benchmarking (VectorDBBench etc) hides per-query variability; ~Robust index @ same average recall may still fail on hard queries → downstream RAG failures. Paper proposes Robustness-δ@K metric", "evidence_quote": "relying on average recall is problematic because it hides variability across queries, allowing systems with strong mean performance to underperform significantly on hard queries. These tail cases can lead to failure in downstream applications such as RAG", "source_url": "https://arxiv.org/abs/2507.00379", "source_title": "Towards Robustness: A Critique of Current Vector Database Assessments (Wang et al., 2025)", "severity": "high", "date": "2025-07", "confidence": 0.95}
```

```json
{"database": "other", "failure_mode": "other", "claim": "VectorDBBench architectural flaw: QPS is computed across concurrency levels while latency is computed from single-user 1000 queries — QPS and latency metrics CANNOT be meaningfully compared", "evidence_quote": "the reported QPS and latencies cannot be put in relation. This is because QPS_max is computed over a set of different concurrency levels while the latencies are computed over 1,000 queries issued by a single user", "source_url": "https://pixion.co/blog/vector-database-benchmark-overview", "source_title": "Vector Database Benchmark Overview — PIXION", "severity": "medium", "date": "2025", "confidence": 0.8}
```

```json
{"database": "pinecone", "failure_mode": "cost", "claim": "Cloud vendors hiked vector DB prices 9-25% in 2025, with Reddit users reporting surprise bills up to $5,000", "evidence_quote": "In 2025, cloud vendors introduced price hikes estimated at 9-25%, with teams reporting surprise bills up to $5,000 on Reddit", "source_url": "https://dev.to/actiandev/whats-changing-in-vector-databases-in-2026-3pbo", "source_title": "What's Changing in Vector Databases in 2026", "severity": "high", "date": "2025", "confidence": 0.7}
```

### Round 4: pgvector filter recall, Milvus data loss, Qdrant Cloud incident

```json
{"database": "pgvector", "failure_mode": "bug", "claim": "CORRECTNESS: HNSW index uses post-filtering — applying WHERE clause after top-K means filter selectivity destroys recall; same query returns INCONSISTENT row counts depending on whether HNSW index is used or not", "evidence_quote": "Postgres gives inconsistent result count when it uses the HNSW index vs index not being used", "source_url": "https://github.com/pgvector/pgvector/issues/671", "source_title": "Issue #671 — HNSW + Filter inconsistent result issue", "severity": "critical", "date": "2024-2025", "confidence": 0.95}
```

```json
{"database": "pgvector", "failure_mode": "bug", "claim": "CORRECTNESS: HNSW + filtering can return ZERO results even when matching rows exist (filter selectivity collapses candidate set)", "evidence_quote": "No Results with HNSW and Filtering", "source_url": "https://github.com/pgvector/pgvector/issues/751", "source_title": "Issue #751 — No Results with HNSW and Filtering", "severity": "critical", "date": "2024-2025", "confidence": 0.95}
```

```json
{"database": "pgvector", "failure_mode": "scale-limit", "claim": "ARCHITECTURE LIMIT: pgvector lacks index-level filtering. HNSW always traverses first then post-filters → 'tens of seconds' query latency for selective filters; pre-vs-post decision = 50ms vs 5s", "evidence_quote": "the difference between pre-filtering and post-filtering can mean the difference between queries that take 50ms and queries that take 5 seconds", "source_url": "https://simonwillison.net/2025/Nov/3/the-case-against-pgvector/", "source_title": "The case against pgvector — Simon Willison", "severity": "high", "date": "2025-11", "confidence": 0.95}
```

```json
{"database": "milvus", "failure_mode": "bug", "claim": "DATA LOSS BUG: Concurrent L0 compaction wrote delta logs to same L1 segment causing logID duplication → delete data loss in Milvus 2.5", "evidence_quote": "fix: [2.5] Fix delete data loss due to duplicate binlogID", "source_url": "https://github.com/milvus-io/milvus/pull/40976", "source_title": "PR #40976 — Fix delete data loss due to duplicate binlogID (2.5)", "severity": "critical", "date": "2025", "confidence": 0.95}
```

```json
{"database": "milvus", "failure_mode": "bug", "claim": "DataNode panic (nil pointer dereference) in sort compaction via Arrow FFI PackedReader — crash during compaction", "evidence_quote": "DataNode panic (nil pointer dereference) in sort compaction via Arrow FFI PackedReader", "source_url": "https://github.com/milvus-io/milvus/issues/48714", "source_title": "Issue #48714 — DataNode panic in sort compaction", "severity": "critical", "date": "2025-2026", "confidence": 0.9}
```

```json
{"database": "milvus", "failure_mode": "bug", "claim": "Compaction tasks getting stuck (unable to make progress) — Issue #41020", "evidence_quote": "Compaction Tasks Stuck", "source_url": "https://github.com/milvus-io/milvus/issues/41020", "source_title": "Issue #41020 — Compaction tasks stuck", "severity": "high", "date": "2025", "confidence": 0.85}
```

```json
{"database": "milvus", "failure_mode": "bug", "claim": "Milvus 2.6 timeout/completed-state compaction tasks skipped during recovery → potential data duplication in clustering compaction", "evidence_quote": "bug in Milvus 2.6 where timeout and completed state compaction tasks were being skipped during recovery, which could lead to data duplication in clustering compaction scenarios", "source_url": "https://github.com/milvus-io/milvus/issues/46576", "source_title": "Issue #46576 — Restore compaction task to ensure cleanup", "severity": "high", "date": "2025-2026", "confidence": 0.85}
```

```json
{"database": "qdrant", "failure_mode": "outage", "claim": "Qdrant Cloud experienced 3-minute downtime on December 27, 2025 (per official status page); Hybrid Cloud SLA reported 99.997%", "evidence_quote": "Qdrant Cloud experienced a 3-minute downtime on December 27, 2025, according to their official status page. Qdrant's Hybrid Cloud service maintains a 99.997% uptime", "source_url": "https://status.qdrant.io/", "source_title": "Qdrant Status Page", "severity": "low", "date": "2025-12-27", "confidence": 0.7}
```

## TOP CRITICAL FINDINGS SUMMARY (red-team highlights)

### Tier-1 Critical (production blockers / data integrity)

1. **Milvus CVE-2025-64513** — Critical authentication bypass in Milvus Proxy. All 2.5.x users urged to upgrade immediately.
2. **Milvus delete-data-loss bug (2.5)** — Concurrent L0 compaction caused duplicate binlogIDs leading to LOST DELETES. Fixed in #40976.
3. **Pinecone outage record** — 9 incidents in 90 days (7 major + 2 minor) per StatusGator; median 4h5min. Acknowledged Feb 5 + Mar 13 2026 incidents.
4. **Pinecone $50/mo minimum (Sept 2025)** — Surprise floor pricing blindsided low-volume users; users formerly paying <$10/mo now mandatory $50.
5. **Pinecone lock-in + $5K-6K bills** — At 100M vectors / 150M queries: $5K-6K/mo + egress; SDK/filter syntax fully proprietary makes migration painful.
6. **pgvector HNSW + filter correctness bug** — Same query returns DIFFERENT row counts depending on whether the HNSW index is used (Issue #671); HNSW + filter can return ZERO results even when matching rows exist (Issue #751).
7. **pgvector scale wall** — HNSW build crashes on 17M×1536 vectors after ~2hrs (Issue #807); stuck at 29% after 8hrs+ on dozens-of-millions (Issue #822); query latency oscillates 50ms↔5s at 5M vectors per Alex Jacobs blog (Nov 2025, picked up by Simon Willison).
8. **Weaviate memory mapping crash** — Active-tenant overload exhausts mmap limits causing Go fatal error that crashes the WHOLE NODE (Issue #4585).
9. **Weaviate lazy shard loading data corruption** — Re-loading a shard that failed initially can corrupt data, causing SIGSEGV (Issue #5100).
10. **Qdrant filter correctness bugs** — DatetimeRange returns wrong results when range expanded (Issue #5595); v1.14.0 match.any returns 0 records when certain IDs included (Issue #7425); hybrid search uses wrong distance metric (Issue #6421).

### Tier-2 High (operational pain)

11. **Milvus queryNode OOM despite memory protection** (Issue #39866) — water-level memory limits don't prevent OOM under FTS load.
12. **Milvus 14-min search timeout after WAL ownership change** — Unbounded scanner catchup replay (#48391).
13. **Milvus persistent failure after queryNode OOM recovery** (Issue #39937) — No graceful degradation; whole subsystem stuck.
14. **Weaviate v1.34.10 GSE tokenizer + replication panic** (Issue #10268, Jan 2026) — Recent / current.
15. **Weaviate datetime > 2500 returns 2024-2025 events** (Issue #8921, Aug 2025) — silent correctness bug.
16. **Weaviate boolean filter silently fails despite index_filterable=True** (Issue #8790, Jul 2025).
17. **Weaviate hybrid+pagination duplicate results** (Issue #5432); offset+limit > 10000 hard limit.
18. **Qdrant memory leak in concurrent multi-tenant ingestion** (Issue #5250) and incorrect on_disk RAM accounting in v1.12.1 (Issue #5268).
19. **Qdrant non-deterministic query results** (Issue #2374).
20. **Methodology critique (arxiv 2507.00379)** — Average-recall benchmarks hide tail variance; Robustness-δ@K proposed as a more honest metric. Same average recall != equivalent RAG quality. VectorDBBench's QPS and latency are non-comparable (different concurrency models).

## Notes / Caveats
- Pinecone status page assertions are largely from StatusGator aggregator and one blog summary; the official status.pinecone.io page should be confirmed by a maintainer for the precise dollar figures and exact incident IDs.
- Qdrant Cloud outage record appears genuinely strong (99.997%) — only one minor 3-min incident in 2025 found.
- No specific Zilliz Cloud or Weaviate Cloud postmortem found; absence of public postmortems != absence of outages.
- pgvectorscale: surprisingly little criticism beyond a macOS x86 build limitation. The Tigerdata "75% less cost than Pinecone" benchmark appears uncontested in public sources, but it should be treated skeptically per the VectorDBBench methodology critique above.

