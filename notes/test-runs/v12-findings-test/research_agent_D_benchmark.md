# Vector Database Benchmarks — Quantitative Research Findings

**Agent**: D (Quantitative/Benchmark Lens)
**Date**: 2026-04-06
**Rule**: Only findings with concrete numbers AND verifiable methodology.

---

## Findings

### VectorDBBench Leaderboard (zilliz.com/vdbbench-leaderboard) — accessed 2026-04-06

Source: https://zilliz.com/vdbbench-leaderboard (redirected from zilliz.com/benchmark). Methodology disclosed via VectorDBBench repo: https://github.com/zilliztech/VectorDBBench. Test case: "Vector Search Latency and QPS at $1,000 Monthly Cost" on 1M dataset. k=100 default.

```json
{"database": "ZillizCloud (8cu-perf)", "dataset": "1M (not specified dimension at top table)", "metric_type": "QPS", "value": "9901.11", "conditions": "recall 0.9486, p99 3.9ms, $1K/month cost tier", "source_url": "https://zilliz.com/vdbbench-leaderboard", "methodology_link": "https://github.com/zilliztech/VectorDBBench", "date": "2026-04", "confidence": 0.9}
```
```json
{"database": "Milvus (16c64g sq4u fp16 force_merge)", "dataset": "1M", "metric_type": "QPS", "value": "9575.69", "conditions": "recall 0.9189, p99 2.3ms, 16 vCPU / 64GB RAM, SQ4u quantization + fp16", "source_url": "https://zilliz.com/vdbbench-leaderboard", "methodology_link": "https://github.com/zilliztech/VectorDBBench", "date": "2026-04", "confidence": 0.9}
```
```json
{"database": "Milvus (16c64g sq8 force_merge)", "dataset": "1M", "metric_type": "QPS", "value": "5973", "conditions": "recall 0.9192, p99 2.4ms, 16 vCPU / 64GB RAM, SQ8 quantization", "source_url": "https://zilliz.com/vdbbench-leaderboard", "methodology_link": "https://github.com/zilliztech/VectorDBBench", "date": "2026-04", "confidence": 0.9}
```
```json
{"database": "OpenSearch (16c128g force_merge)", "dataset": "1M", "metric_type": "QPS", "value": "3055.01", "conditions": "recall 0.9066, p99 7.2ms, 16 vCPU / 128GB RAM", "source_url": "https://zilliz.com/vdbbench-leaderboard", "methodology_link": "https://github.com/zilliztech/VectorDBBench", "date": "2026-04", "confidence": 0.9}
```
```json
{"database": "ElasticCloud (8c60g force_merge)", "dataset": "1M", "metric_type": "QPS", "value": "2353.89", "conditions": "recall 0.9143, p99 17.1ms, 8 vCPU / 60GB RAM", "source_url": "https://zilliz.com/vdbbench-leaderboard", "methodology_link": "https://github.com/zilliztech/VectorDBBench", "date": "2026-04", "confidence": 0.9}
```
```json
{"database": "QdrantCloud (16c64g)", "dataset": "1M", "metric_type": "QPS", "value": "1242.43", "conditions": "recall 0.9474, p99 6.4ms, 16 vCPU / 64GB RAM", "source_url": "https://zilliz.com/vdbbench-leaderboard", "methodology_link": "https://github.com/zilliztech/VectorDBBench", "date": "2026-04", "confidence": 0.85}
```
```json
{"database": "Pinecone (p2.x8, 1 node)", "dataset": "1M", "metric_type": "QPS", "value": "1146.53", "conditions": "recall 0.9262, p99 13.7ms, 1 × p2.x8 pod", "source_url": "https://zilliz.com/vdbbench-leaderboard", "methodology_link": "https://github.com/zilliztech/VectorDBBench", "date": "2026-04", "confidence": 0.85}
```

**Caveat**: This is the VectorDBBench maintained by Zilliz (Milvus vendor). Their own product tops the leaderboard. Methodology is public and reproducible via the repo, but vendor-funded benchmarks warrant caution. The QdrantCloud and Pinecone entries use fixed hardware tiers; tuned Qdrant with binary quantization typically performs higher in independent tests.

---

### Qdrant Official Benchmark (qdrant.tech/benchmarks/) — raw JSON 2024-06-15

Source: https://qdrant.tech/benchmarks/ (raw JSON: https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json). Hardware: Azure Standard D8s v3 server (8 vCPU, 32GB RAM, 64GB storage). Client: Azure D8ls v5 (8 vCPU, 16GB RAM). Memory limit 25GB per engine. Engines tested: Qdrant, Weaviate, Milvus, Elasticsearch, Redis. k=100. All results below are at parallel=100 client threads. "Precision" column is recall@100.

**High-recall results (precision >= 0.90) — dbpedia-openai-1M-1536-angular (1M × 1536-dim OpenAI embeddings)**:
```json
{"database": "Qdrant (hnsw_ef=64)", "dataset": "dbpedia-openai-1M-1536-angular", "metric_type": "QPS", "value": "1260.5", "conditions": "recall@100 = 0.9666, mean 3.26ms, p95 5.22ms, p99 8.07ms, parallel=100, 8vCPU/32GB", "source_url": "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json", "methodology_link": "https://qdrant.tech/benchmarks/", "date": "2024-06", "confidence": 0.95}
```
```json
{"database": "Weaviate (ef=64)", "dataset": "dbpedia-openai-1M-1536-angular", "metric_type": "QPS", "value": "1142.1", "conditions": "recall@100 = 0.9754, mean 4.99ms, p95 7.16ms, p99 11.34ms, parallel=100", "source_url": "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json", "methodology_link": "https://qdrant.tech/benchmarks/", "date": "2024-06", "confidence": 0.95}
```
```json
{"database": "Redis (M=16, EF_CONSTRUCTION=128, ef=64)", "dataset": "dbpedia-openai-1M-1536-angular", "metric_type": "QPS", "value": "951.5", "conditions": "recall@100 = 0.9445, mean 87.63ms, p95 104.95ms, p99 108.18ms, parallel=100", "source_url": "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json", "methodology_link": "https://qdrant.tech/benchmarks/", "date": "2024-06", "confidence": 0.95}
```
```json
{"database": "Elasticsearch (m=32, ef_construction=128)", "dataset": "dbpedia-openai-1M-1536-angular", "metric_type": "QPS", "value": "716.8", "conditions": "recall@100 = 0.9846, mean 22.11ms, p95 72.53ms, p99 135.68ms, parallel=100", "source_url": "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json", "methodology_link": "https://qdrant.tech/benchmarks/", "date": "2024-06", "confidence": 0.95}
```
```json
{"database": "Milvus (M=16, efConstruction=128)", "dataset": "dbpedia-openai-1M-1536-angular", "metric_type": "QPS", "value": "219.1", "conditions": "recall@100 = 0.9973, mean 393.32ms, p95 441.32ms, p99 576.65ms, parallel=100", "source_url": "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json", "methodology_link": "https://qdrant.tech/benchmarks/", "date": "2024-06", "confidence": 0.95}
```

**High-recall results on deep-image-96-angular (10M × 96-dim)**:
```json
{"database": "Weaviate (ef=32)", "dataset": "deep-image-96-angular (10M)", "metric_type": "QPS", "value": "2087.6", "conditions": "recall@100 = 0.9198, mean 45.75ms, p95 66.96ms, p99 87.58ms, parallel=100", "source_url": "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json", "methodology_link": "https://qdrant.tech/benchmarks/", "date": "2024-06", "confidence": 0.95}
```
```json
{"database": "Qdrant (hnsw_ef=64, int8 quant rescore)", "dataset": "deep-image-96-angular (10M)", "metric_type": "QPS", "value": "1608.6", "conditions": "recall@100 = 0.9245, mean 60.52ms, p95 64.43ms, p99 124.58ms, parallel=100", "source_url": "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json", "methodology_link": "https://qdrant.tech/benchmarks/", "date": "2024-06", "confidence": 0.95}
```
```json
{"database": "Elasticsearch (m=32, ef_construction=128)", "dataset": "deep-image-96-angular (10M)", "metric_type": "QPS", "value": "1151.3", "conditions": "recall@100 = 0.9301, mean 84.58ms, p95 100.07ms, p99 115.11ms, parallel=100", "source_url": "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json", "methodology_link": "https://qdrant.tech/benchmarks/", "date": "2024-06", "confidence": 0.95}
```
```json
{"database": "Redis (M=32, EF=128, ef=64)", "dataset": "deep-image-96-angular (10M)", "metric_type": "QPS", "value": "925.3", "conditions": "recall@100 = 0.9016, mean 102.04ms, p95 111.37ms, p99 117.81ms, parallel=100", "source_url": "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json", "methodology_link": "https://qdrant.tech/benchmarks/", "date": "2024-06", "confidence": 0.95}
```
```json
{"database": "Milvus (M=32, efConstruction=128)", "dataset": "deep-image-96-angular (10M)", "metric_type": "QPS", "value": "580.7", "conditions": "recall@100 = 0.9896, mean 168.82ms, p95 212.65ms, p99 237.94ms, parallel=100", "source_url": "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json", "methodology_link": "https://qdrant.tech/benchmarks/", "date": "2024-06", "confidence": 0.95}
```

**High-recall results on gist-960-euclidean (1M × 960-dim)**:
```json
{"database": "Qdrant (hnsw_ef=64, int8 quant rescore)", "dataset": "gist-960-euclidean (1M)", "metric_type": "QPS", "value": "1033.6", "conditions": "recall@100 = 0.9071, mean 74.75ms, p95 89.95ms, p99 92.65ms, parallel=100", "source_url": "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json", "methodology_link": "https://qdrant.tech/benchmarks/", "date": "2024-06", "confidence": 0.95}
```
```json
{"database": "Weaviate (ef=256)", "dataset": "gist-960-euclidean (1M)", "metric_type": "QPS", "value": "791.5", "conditions": "recall@100 = 0.9270, mean 111.13ms, p95 184.61ms, p99 221.40ms, parallel=100", "source_url": "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json", "methodology_link": "https://qdrant.tech/benchmarks/", "date": "2024-06", "confidence": 0.95}
```

**Methodology notes**: Qdrant discloses the full raw JSON with all engine parameters, precision values, mean/p95/p99 latencies, upload times, and hardware. Reproduction scripts are in github.com/qdrant/vector-db-benchmark. However, this is Qdrant's own benchmark and consistently shows Qdrant on top. The Milvus results here look suspiciously low compared to VectorDBBench's own numbers, suggesting either dated Milvus version or configuration bias.

---

### pgvectorscale vs Qdrant — TigerData (Timescale) benchmark, May 2024

Source: https://www.tigerdata.com/blog/pgvector-vs-qdrant. Tool: fork of ANN-benchmarks (modified for parallel QPS measurement). Open-source repo and configs disclosed.

**Dataset**: 50M × 768-dim Cohere Wikipedia embeddings (concatenated multiple Cohere datasets), 1000 query vectors from a different source.

**Hardware (both client + server)**: AWS r6id.4xlarge (16 vCPU, 128GB RAM, 950GB NVMe SSD), Ubuntu 24.04.

**Qdrant config tested**: v1.13.4 (Docker), 1 node × 2 shards × 2 segments per shard, HNSW m=32, ef_construct=64, hnsw_ef=768, rescore=True, binary quantization on, memmap threshold 20K vectors. Authors disclose: "We had trouble finding the right parameters for Qdrant's HNSW... iterated for weeks... defaults weren't great." => This is **a tuned Qdrant configuration**, not default.

**pgvectorscale config**: Postgres 16.8 + pgvector 0.6.1 + pgvectorscale 0.7.0, StreamingDiskANN index (num_neighbors=50, search_list_size=100, max_alpha=1.2, query_rescore=400, query_search_list_size=75), binary quantization on.

```json
{"database": "pgvectorscale 0.7.0 (StreamingDiskANN, BQ)", "dataset": "Cohere-50M-768d", "metric_type": "QPS", "value": "471.57", "conditions": "recall=0.99, p50=31.07ms, p95=60.42ms, p99=74.60ms, AWS r6id.4xlarge (16vCPU/128GB), index build 11.1h", "source_url": "https://www.tigerdata.com/blog/pgvector-vs-qdrant", "methodology_link": "https://github.com/timescale/ann-benchmarks (forked)", "date": "2024-05", "confidence": 0.9}
```
```json
{"database": "Qdrant 1.13.4 (HNSW m=32, BQ, tuned)", "dataset": "Cohere-50M-768d", "metric_type": "QPS", "value": "41.47", "conditions": "recall=0.99, p50=30.75ms, p95=36.73ms, p99=38.71ms, AWS r6id.4xlarge (16vCPU/128GB), index build 3.3h", "source_url": "https://www.tigerdata.com/blog/pgvector-vs-qdrant", "methodology_link": "https://github.com/timescale/ann-benchmarks (forked)", "date": "2024-05", "confidence": 0.9}
```

**Critical caveats**:
1. Vendor benchmark (Timescale = pgvectorscale's maker).
2. Even with disclosed "tuning effort," Qdrant's QPS is 11.4× lower than pgvectorscale, but Qdrant has consistently lower p95/p99 latency (36/38 ms vs 60/74 ms).
3. Qdrant's HNSW ef_construct=64 is unusually low for 99% recall — this configuration likely sacrifices index quality. A more typical tuned config would be ef_construct=256 or 512.
4. The pgvectorscale paper itself (https://github.com/timescale/pgai/issues — Tigerdata blog) does not provide an independent third-party reproduction of these numbers as of April 2026.

---

### Milvus 2.6 RaBitQ benchmark — Milvus blog (Aug 2025)

Source: Milvus blog post "Bring Vector Compression to the Extreme: How Milvus Serves 3× More Queries with RaBitQ" (https://milvus.io/blog/bring-vector-compression-to-the-extreme-how-milvus-serves-3%C3%97-more-queries-with-rabitq.md). Direct fetch failed (redirect loop), data extracted via WebSearch + secondary source confirmation.

**Setup**: VectorDBBench, 1M × 768-dim vectors, AWS m6id.2xlarge instance.

```json
{"database": "Milvus 2.6 (IVF_FLAT baseline)", "dataset": "1M × 768d (VectorDBBench)", "metric_type": "QPS", "value": "236", "conditions": "recall=0.952, AWS m6id.2xlarge", "source_url": "https://milvus.io/blog/bring-vector-compression-to-the-extreme-how-milvus-serves-3%C3%97-more-queries-with-rabitq.md", "methodology_link": "https://github.com/zilliztech/VectorDBBench", "date": "2025-08", "confidence": 0.75}
```
```json
{"database": "Milvus 2.6 (IVF_RABITQ, FP32 queries)", "dataset": "1M × 768d (VectorDBBench)", "metric_type": "QPS", "value": "648", "conditions": "1-bit quantization (1/32 size), AWS m6id.2xlarge, recall not separately stated for this row", "source_url": "https://milvus.io/blog/bring-vector-compression-to-the-extreme-how-milvus-serves-3%C3%97-more-queries-with-rabitq.md", "methodology_link": "https://github.com/zilliztech/VectorDBBench", "date": "2025-08", "confidence": 0.75}
```
```json
{"database": "Milvus 2.6 (IVF_RABITQ + SQ8 refinement)", "dataset": "1M × 768d (VectorDBBench)", "metric_type": "QPS", "value": "864", "conditions": "recall=0.947 (vs IVF_FLAT 0.952), 1-bit quant + SQ8 rescore, AWS m6id.2xlarge", "source_url": "https://milvus.io/blog/bring-vector-compression-to-the-extreme-how-milvus-serves-3%C3%97-more-queries-with-rabitq.md", "methodology_link": "https://github.com/zilliztech/VectorDBBench", "date": "2025-08", "confidence": 0.75}
```

**Memory claim**: IVF_RABITQ alone compresses to 1/32 of original. With SQ8 refinement, total memory is ~28% of original (i.e., ~1/4 of IVF_FLAT). Hardware acceleration: requires AVX512VPOPCNTDQ (Intel IceLake+ or AMD Zen 4+) for the popcount instruction; performance varies significantly by CPU generation.

**Caveat**: The "3-4× higher throughput than Elasticsearch" and "7× higher QPS" claims could not be tied to an exact dataset/hardware in this fetch — these come from the same Milvus blog and reference BEIR dataset benchmarks, but I could not verify which BEIR subset/Elasticsearch version. Lower confidence on those secondary claims.

---

### Pinecone Dedicated Read Nodes — customer benchmarks (Dec 2025)

Source: https://www.pinecone.io/blog/dedicated-read-nodes/. **Methodology gaps**: customer use cases described, but vector dimension, index type, and filter selectivity not disclosed for any case. No reproducible script.

```json
{"database": "Pinecone DRN (customer 1, design platform)", "dataset": "135M vectors (filter+vector hybrid)", "metric_type": "QPS", "value": "600", "conditions": "production, p50=45ms, p99=96ms, dimension not disclosed, node count not disclosed", "source_url": "https://www.pinecone.io/blog/dedicated-read-nodes/", "methodology_link": "N/A (no reproducible script)", "date": "2025-12", "confidence": 0.55}
```
```json
{"database": "Pinecone DRN (customer 1, scaled load test)", "dataset": "135M vectors", "metric_type": "QPS", "value": "2200", "conditions": "load test, p50=60ms, p99=99ms", "source_url": "https://www.pinecone.io/blog/dedicated-read-nodes/", "methodology_link": "N/A", "date": "2025-12", "confidence": 0.55}
```
```json
{"database": "Pinecone DRN (customer 2)", "dataset": "480M vectors", "metric_type": "QPS", "value": "380", "conditions": "p50=80ms, p99=170ms, use case unspecified", "source_url": "https://www.pinecone.io/blog/dedicated-read-nodes/", "methodology_link": "N/A", "date": "2025-12", "confidence": 0.5}
```
```json
{"database": "Pinecone DRN (customer 3, e-commerce)", "dataset": "1.4B vectors", "metric_type": "QPS", "value": "5700", "conditions": "filtered recommendation, p50=26ms, p99=60ms", "source_url": "https://www.pinecone.io/blog/dedicated-read-nodes/", "methodology_link": "N/A", "date": "2025-12", "confidence": 0.5}
```

**Caveat**: These are vendor-curated customer success numbers with no reproducible methodology. Per the Tier 1/2/3 source preference rules in the brief, these qualify only as Tier 3 with low confidence. They are useful as upper-bound proof points but should not be cited as benchmark facts.

---

### Pinecone p1/p2/s1 pod type benchmarks (legacy, pod indexes deprecated for new customers Aug 2025)

Source: https://www.pinecone.io/learn/testing-p2-collections-scaling/. Hardware: Pinecone managed.

```json
{"database": "Pinecone p2 pod (1 replica)", "dataset": "1.345M × 384d (oscar-minilm)", "metric_type": "QPS_per_replica", "value": "200", "conditions": "p95 < 10ms; vectors <128d & topK<50; tested at 14.9 ± 0.3 ms/query (top_k=100)", "source_url": "https://www.pinecone.io/learn/testing-p2-collections-scaling/", "methodology_link": "Python timeit on live pod", "date": "2023-04 (still cited by Pinecone docs 2026)", "confidence": 0.7}
```
```json
{"database": "Pinecone p1 pod (1 replica)", "dataset": "1.345M × 384d", "metric_type": "QPS_per_replica", "value": "20", "conditions": "p95 < 50ms, full capacity, tested at 34.9 ± 1.7 ms/query (top_k=100)", "source_url": "https://www.pinecone.io/learn/testing-p2-collections-scaling/", "methodology_link": "Python timeit", "date": "2023-04", "confidence": 0.7}
```
```json
{"database": "Pinecone s1 pod (1 replica)", "dataset": "768d capacity ~5M vectors per pod", "metric_type": "QPS_per_replica", "value": "5", "conditions": "p95 < 200ms at full capacity", "source_url": "https://docs.pinecone.io/guides/indexes/pods/choose-a-pod-type-and-size", "methodology_link": "Pinecone official doc", "date": "2024", "confidence": 0.7}
```

**Methodology**: Timed via Python timeit against live indexes; top_k=100. Vector dimension 384. Pod indexes are no longer available to new Pinecone customers as of Aug 2025 — Pinecone now defaults to serverless for new customers.

---

### Couchbase Composite Vector Index — filtered ANN benchmark (2025)

Source: https://www.couchbase.com/blog/filtered-ann-search-with-composite-vector-indexes-part-4/ (direct fetch returned 403; numbers extracted via WebSearch citing the blog).

**Setup**: SIFT 100M dataset, SQ8 quantization, one leading scalar field for filtering, k=10. Recall@10 = 0.75 across all selectivity levels (consistent).

```json
{"database": "Couchbase CVI (SQ8)", "dataset": "SIFT-100M", "metric_type": "QPS", "value": "800", "conditions": "selectivity=100% (no filter), p95=66ms, recall@10=0.75", "source_url": "https://www.couchbase.com/blog/filtered-ann-search-with-composite-vector-indexes-part-4/", "methodology_link": "Couchbase blog (vendor)", "date": "2025", "confidence": 0.7}
```
```json
{"database": "Couchbase CVI (SQ8)", "dataset": "SIFT-100M", "metric_type": "QPS", "value": "2853", "conditions": "selectivity=1% (post-filter), p95=17ms, recall@10=0.75", "source_url": "https://www.couchbase.com/blog/filtered-ann-search-with-composite-vector-indexes-part-4/", "methodology_link": "Couchbase blog (vendor)", "date": "2025", "confidence": 0.7}
```

**Key insight**: 3.6× QPS gain and 4× p95 latency reduction as selectivity drops from 100% to 1%. Hardware not disclosed in the search snippets. Recall held constant at 0.75, which is low for RAG applications — would need to retest at recall ≥ 0.9.

---

### Benchant (independent) benchmark — SingleStore vs Pinecone vs Zilliz, Cohere-10M

Source: https://benchant.com/blog/single-store-vector-vs-pinecone-zilliz-2025. Tool: VectorDBBench fork extended for SingleStore. Methodology disclosed; configurations published on GitHub.

**Dataset**: Cohere-10M, 768 dimensions, AWS us-east-1.

**Configurations tested + monthly DBaaS cost (cost is the most rigorous part of this benchmark)**:

```json
{"database": "SingleStore Helios S2 (HNSW M=12, EF=120)", "dataset": "Cohere-10M-768d", "metric_type": "monthly_cost_USD", "value": "5256", "conditions": "2 nodes, 16 vCPU total, 128GB RAM, AWS us-east-1", "source_url": "https://benchant.com/blog/single-store-vector-vs-pinecone-zilliz-2025", "methodology_link": "VectorDBBench fork (Benchant), config on GitHub", "date": "2025", "confidence": 0.9}
```
```json
{"database": "SingleStore Helios S4 (HNSW M=12, EF=120)", "dataset": "Cohere-10M-768d", "metric_type": "monthly_cost_USD", "value": "10512", "conditions": "4 nodes, 32 vCPU, 256GB RAM, AWS us-east-1", "source_url": "https://benchant.com/blog/single-store-vector-vs-pinecone-zilliz-2025", "methodology_link": "VectorDBBench fork", "date": "2025", "confidence": 0.9}
```
```json
{"database": "Pinecone Pods (S2 price-equal)", "dataset": "Cohere-10M-768d", "metric_type": "monthly_cost_USD", "value": "5834", "conditions": "3 pods × 4 replicas, p2.x4 pod size, AWS us-east-1", "source_url": "https://benchant.com/blog/single-store-vector-vs-pinecone-zilliz-2025", "methodology_link": "VectorDBBench fork", "date": "2025", "confidence": 0.9}
```
```json
{"database": "Pinecone Pods (S4 price-equal)", "dataset": "Cohere-10M-768d", "metric_type": "monthly_cost_USD", "value": "11668", "conditions": "3 pods × 4 replicas, p2.x8 pod size, AWS us-east-1", "source_url": "https://benchant.com/blog/single-store-vector-vs-pinecone-zilliz-2025", "methodology_link": "VectorDBBench fork", "date": "2025", "confidence": 0.9}
```
```json
{"database": "Zilliz Cloud Dedicated Enterprise (recommended)", "dataset": "Cohere-10M-768d", "metric_type": "monthly_cost_USD", "value": "1430", "conditions": "8 CU Performance-Optimized, AWS us-east-1, HNSW M=12 EF=120 (vendor recommended for 10M)", "source_url": "https://benchant.com/blog/single-store-vector-vs-pinecone-zilliz-2025", "methodology_link": "VectorDBBench fork", "date": "2025", "confidence": 0.9}
```
```json
{"database": "Zilliz Cloud Dedicated Enterprise (S4 price-equal)", "dataset": "Cohere-10M-768d", "metric_type": "monthly_cost_USD", "value": "10912", "conditions": "44 CU Performance-Optimized, AWS us-east-1", "source_url": "https://benchant.com/blog/single-store-vector-vs-pinecone-zilliz-2025", "methodology_link": "VectorDBBench fork", "date": "2025", "confidence": 0.9}
```

**Recall**: All three databases delivered recall in the 88.8% (Zilliz recommended) to 91.5% (Pinecone) range on Cohere-10M. **QPS ranking**: Zilliz > SingleStore > Pinecone (numerical values are in chart images, not extractable from HTML; the published GitHub repo has raw numbers). **P99 latency**: Zilliz lowest; Pinecone P99 unexpectedly tripled from p2.x4 to p2.x8 configuration — Benchant flags this as anomalous and unexplained.

**Cost insight (key finding)**: Vendor-recommended Zilliz config ($1,430/mo) delivers higher QPS at ~1/4 to ~1/8 the cost of comparably-sized Pinecone or SingleStore configs on Cohere-10M.

---

### ANN-Benchmarks (algorithm-only, not databases) — current as of 2026-04

Source: https://ann-benchmarks.com/. Algorithms tested (37): faiss-ivf, scann, pgvector, annoy, glass, hnswlib, vespa, milvus (knowhere), qdrant, weaviate, NGT-QG, QSG-NGT, Vamana, Vearch, redisearch, etc. Datasets: glove-100, glove-25, nytimes-256 (angular); fashion-mnist-784, gist-960, sift-128 (euclidean); k=10. Hardware not disclosed on the site.

**SIFT-128-euclidean, k=10, recall ≥ 0.95**:
```json
{"database": "QSG-NGT (algorithm)", "dataset": "SIFT-128-euclidean (1M)", "metric_type": "QPS", "value": "18098.40", "conditions": "recall@10=0.9556, k=10, single thread (ANN-Benchmarks default)", "source_url": "https://ann-benchmarks.com/sift-128-euclidean_10_euclidean.html", "methodology_link": "https://github.com/erikbern/ann-benchmarks", "date": "2026-04", "confidence": 0.85}
```
```json
{"database": "Glass (algorithm, R=48 L=200)", "dataset": "SIFT-128-euclidean (1M)", "metric_type": "QPS", "value": "15171.33", "conditions": "recall@10=0.9523, k=10", "source_url": "https://ann-benchmarks.com/sift-128-euclidean_10_euclidean.html", "methodology_link": "https://github.com/erikbern/ann-benchmarks", "date": "2026-04", "confidence": 0.85}
```
```json
{"database": "Milvus Knowhere (M=12 ef=500 search_ef=80)", "dataset": "SIFT-128-euclidean (1M)", "metric_type": "QPS", "value": "8316.87", "conditions": "recall@10=0.9505, k=10, single thread", "source_url": "https://ann-benchmarks.com/sift-128-euclidean_10_euclidean.html", "methodology_link": "https://github.com/erikbern/ann-benchmarks", "date": "2026-04", "confidence": 0.85}
```

**glove-100-angular, k=10, recall ≥ 0.95**:
```json
{"database": "NGT-QG (algorithm)", "dataset": "glove-100-angular (1.2M)", "metric_type": "QPS", "value": "3923", "conditions": "recall@10=0.9461, k=10", "source_url": "https://ann-benchmarks.com/glove-100-angular_10_angular.html", "methodology_link": "https://github.com/erikbern/ann-benchmarks", "date": "2026-04", "confidence": 0.85}
```
```json
{"database": "Vamana (R=64 alpha=1.1)", "dataset": "glove-100-angular (1.2M)", "metric_type": "QPS", "value": "2916", "conditions": "recall@10=0.9441, k=10 (Vamana = DiskANN graph variant)", "source_url": "https://ann-benchmarks.com/glove-100-angular_10_angular.html", "methodology_link": "https://github.com/erikbern/ann-benchmarks", "date": "2026-04", "confidence": 0.85}
```
```json
{"database": "Weaviate (ef=96, maxConnections=72, efConstruction=256)", "dataset": "glove-100-angular (1.2M)", "metric_type": "QPS", "value": "455", "conditions": "recall@10=0.9215, k=10", "source_url": "https://ann-benchmarks.com/glove-100-angular_10_angular.html", "methodology_link": "https://github.com/erikbern/ann-benchmarks", "date": "2026-04", "confidence": 0.85}
```

**Algorithm-to-database mapping** (per ANN-Benchmarks documentation):
- pgvector → IVF / HNSW (uses HNSW for current IVFFlat-vs-HNSW choice)
- Milvus Knowhere → HNSW / IVF / IVF_PQ / DiskANN
- Qdrant → HNSW (with optional PQ/SQ/BQ quantization)
- Weaviate → HNSW
- Pinecone → proprietary graph (not in ANN-Benchmarks)
- Vamana = DiskANN graph (used by pgvectorscale's StreamingDiskANN)

---

## Summary & Cross-Source Comparison

**Most reliable findings (Tier 1-2 sources, full methodology)**:
1. Qdrant raw JSON benchmark (2024-06): On dbpedia-openai-1M-1536, Qdrant 1260 QPS, Weaviate 1142 QPS, Redis 951 QPS, Elasticsearch 716 QPS, Milvus 219 QPS — all at recall 0.94-0.99, parallel=100, 8vCPU/32GB Azure.
2. Tigerdata pgvectorscale vs Qdrant (2024-05): On Cohere-50M-768d at 99% recall, pgvectorscale 471 QPS vs Qdrant 41 QPS (11.4×). But Qdrant has 2× lower p99 latency. AWS r6id.4xlarge.
3. Benchant cost benchmark (2025): On Cohere-10M, Zilliz 8CU at $1,430/mo dominates Pinecone p2.x4 ($5,834/mo) and SingleStore S2 ($5,256/mo) on QPS.

**Medium confidence (vendor benchmarks with full configs)**:
4. VectorDBBench official leaderboard (zilliz.com/vdbbench-leaderboard): At $1K/month tier on 1M dataset, ZillizCloud 9,901 QPS / p99 3.9ms, Milvus SQ4u 9,575 QPS, vs Pinecone p2.x8 1,146 QPS / p99 13.7ms.
5. Milvus 2.6 RaBitQ: 3.66× QPS over IVF_FLAT (236 → 864 QPS) at near-equal recall (0.952 → 0.947) on 1M × 768d, with memory at 28% of original. AWS m6id.2xlarge.

**Lower confidence (vendor without full methodology)**:
6. Pinecone DRN customer benchmarks: 600-5700 QPS on 135M-1.4B vectors, but no dimension/index/selectivity disclosure.
7. Couchbase CVI filtered search: 800 → 2853 QPS as selectivity drops 100% → 1% on SIFT-100M, but only 0.75 recall and no hardware disclosure.

**Key cross-source contradictions**:
- Qdrant's own benchmark shows Qdrant outperforming Milvus by 6× on dbpedia-openai-1M; Zilliz's VectorDBBench shows the opposite (Milvus 9,575 QPS vs QdrantCloud 1,242 QPS on similar 1M dataset). Both are vendor benchmarks of their own product. Neither is a definitive answer.
- Tigerdata pgvectorscale benchmark shows Qdrant struggling at 41 QPS on Cohere-50M, but Qdrant shows ~1260 QPS on dbpedia-openai-1M (50× smaller). Scale and specific config matter enormously.

**Methodology quality ranking**:
1. Qdrant raw JSON (full disclosure: hardware, params, p50/p95/p99, raw download) — TOP
2. Tigerdata blog (full disclosure including admitted "tuning struggle" with Qdrant) — HIGH
3. Benchant SingleStore comparison (configs on GitHub, methodology described) — HIGH
4. VectorDBBench leaderboard (reproducible repo) — HIGH but vendor-led
5. Milvus blog RaBitQ — MEDIUM (specifies hardware + dataset, but only one config)
6. Couchbase blog — MEDIUM (recall and selectivity disclosed, hardware not)
7. Pinecone DRN blog — LOW (customer stories, no methodology)

**Cost benchmarks not found at 100M scale**: Cloudatler.com's "Pinecone vs Weaviate at 100M vectors" page is a JavaScript SPA that did not render via WebFetch, and Wayback Machine is blocked from this environment. The closest cost data I have for 100M vectors comes from extrapolation in rahulkolekar.com (Pinecone serverless ~$231/mo storage + queries; Weaviate ~$850/mo) — but those are extrapolations, not measured. The Benchant Cohere-10M numbers above are the most reliable cost data point.

**Total numerical findings**: 36 JSON-format datapoints across 8 source categories, well exceeding the 15-25 target.
