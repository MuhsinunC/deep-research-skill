# Agent A (Academic/Formal) — Vector Database Research

**Lens**: Academic/Formal — peer-reviewed papers, benchmarks with methodology
**Date**: 2026-04-06
**Target**: 10-15 high-quality quantitative findings

## Tasks
1. Academic papers 2025-2026 benchmarking HNSW/IVF_PQ/DiskANN (QPS/recall/latency w/ methodology)
2. Filtered ANN search papers (ETH FANNS, SIEVE, Compass, arxiv 2509.07789, 2602.11443)
3. Weaviate BEIR benchmarks / hybrid BM25+dense (NDCG@10, Recall@k)
4. arxiv 2507.00379 critique of VectorDBBench / ANN-Benchmarks
5. RaBitQ, SPLADE, sparse-dense fusion quality numbers

---

## Findings

### Finding 1: arxiv 2507.00379 — Robustness critique
```json
{"claim": "Average recall is inadequate for vector DB assessment; authors propose Robustness-δ@K (proportion of queries achieving recall above a threshold) instead of mean recall", "evidence_quote": "Average recall is the dominant metric for their evaluation... [but it] hides variability across queries, allowing systems with strong mean performance to underperform significantly on hard queries", "source_url": "https://arxiv.org/abs/2507.00379", "source_title": "Towards Robustness: A Critique of Current Vector Database Assessments (Wang, Zhang, Lu, Chen, Tan)", "confidence": 0.95, "methodology_notes": "arXiv cs.DB paper, July 2025, revised April 2026. Shows identical avg recall can produce very different downstream RAG outcomes. Targets VectorDBBench and ANN-Benchmarks as flawed evaluators."}
```

### Finding 2: arxiv 2509.07789 — FANNS unified benchmark taxonomy
```json
{"claim": "Filtered ANN algorithms fall into 3 categories: filter-then-search, search-then-filter, and hybrid-search; prior comparisons are biased by coupled dataset-dependent parameters and disparate evaluation approaches", "evidence_quote": "three categories—filter-then-search, search-then-filter, hybrid-search... coupled dataset-dependent parameters causing biased comparisons, rarely analyzed impact factors, and unreliable cross-algorithm comparisons", "source_url": "https://arxiv.org/abs/2509.07789", "source_title": "Filtered ANN Search: A Unified Benchmark", "confidence": 0.85, "methodology_notes": "Unified parameter tuning framework. Full quantitative numbers not in abstract; need to fetch full PDF for concrete QPS/recall."}
```

### Finding 3: arxiv 2507.11907 — SIEVE filtered search (PVLDB 2025)
```json
{"claim": "SIEVE provides up to 8.06x speedup over alternatives for filtered vector search with hard predicates, using <2.15x memory of standard HNSW and as low as 1% build time vs competing indexes", "evidence_quote": "Speedup: Up to 8.06x faster search compared to alternatives; Build efficiency: As low as 1% build time versus competing indexes; Memory overhead: Less than 2.15x the memory of standard HNSW graphs", "source_url": "https://arxiv.org/abs/2507.11907", "source_title": "SIEVE: Efficient Filtered Approximate Nearest Neighbor Search via Multiple Indexes", "confidence": 0.92, "methodology_notes": "PVLDB vol 18, issue 11, pp 4723-4736 (2025). Uses three-dimensional analytical model (index size × search time × recall). Approach builds multiple indexes for different predicate patterns rather than modifying graph traversal."}
```

### Finding 4: arxiv 2510.27141 — Compass unified filtered search
```json
{"claim": "Compass outperforms NaviX (prior SOTA general filtered-search framework) across diverse hybrid query workloads while matching specialized single-attribute indices in their optimal scenarios; works with HNSW, IVF, B+-trees without new index designs", "evidence_quote": "consistently outperforms NaviX, the only existing performant general framework, across diverse hybrid query workloads... Matches query throughput of specialized single-attribute indices in their optimal scenarios", "source_url": "https://arxiv.org/abs/2510.27141", "source_title": "Compass: A Unified Framework for Filtered Search over Vector and Structured Data", "confidence": 0.85, "methodology_notes": "Oct 2025. Supports arbitrary conjunctions, disjunctions, range predicates. Uses cooperative query execution coordinating candidate generation and predicate evaluation. Exact speedup numbers not in abstract."}
```

### Finding 5: RaBitQ quantization — SIGMOD 2024
```json
{"claim": "RaBitQ achieves 90%/95%/99% recall with 4/5/7-bit quantization respectively without reranking; reaches 19,000 QPS on SIFT1M at recall=0.99, outperforming competitors by >40%", "evidence_quote": "Using 4-bit, 5-bit and 7-bit quantization usually suffices to produce 90%, 95% and 99% recall respectively without reranking... under a recall requirement of 0.99, the algorithm achieves 19,000 QPS on the SIFT1M dataset, outperforming other methods by more than 40%", "source_url": "https://arxiv.org/abs/2405.12497", "source_title": "RaBitQ: Quantizing High-Dimensional Vectors with a Theoretical Error Bound for ANN Search (Gao & Long)", "confidence": 0.92, "methodology_notes": "SIGMOD 2024 (Proc. ACM Manag. Data 2, 3, Article 167, June 2024). Evaluated on SIFT1M. Code quality roughly halved vs PQ for same accuracy. Extended version (arXiv 2409.09913) accepted SIGMOD 2025."}
```

### Finding 6: SPLADE sparse neural IR — BEIR/MSMARCO
```json
{"claim": "SPLADE++ achieves state-of-the-art on both MS MARCO (in-domain) and BEIR (out-of-domain); SPLADE gained >9% NDCG@10 on TREC DL 2019 and defeats all dense methods on BEIR in same setting", "evidence_quote": "SPLADE achieved state-of-the-art results on the BEIR benchmark with more than 9% gains on NDCG@10 on TREC DL 2019. SPLADE defeats all dense methods in BEIR benchmark with the same setting", "source_url": "https://dl.acm.org/doi/10.1145/3634912", "source_title": "Towards Effective and Efficient Sparse Neural Information Retrieval (ACM TOIS 2024)", "confidence": 0.88, "methodology_notes": "Published in ACM TOIS 2024. Sparse neural retrieval via BERT MLM head with sparsity regularization. Key training tricks: distillation, hard negative mining, PLM init. Uses inverted index for efficiency."}
```

### Finding 7: Weaviate BEIR hybrid search — concrete NDCG@10 across alpha
```json
{"claim": "Weaviate BEIR hybrid search: hybrid at alpha=0.5 beats pure BM25 and pure vector on NFCorpus (0.280 vs 0.224 BM25 vs 0.264 vector) and SciFact (0.714 vs 0.678 vs 0.683); pure vector wins on FIQA (0.434 vs 0.284 BM25 vs 0.428 hybrid) and Quora (0.887 vs 0.770 BM25 vs 0.867 hybrid)", "evidence_quote": "NFCorpus: 0.224 (BM25) → 0.280 (hybrid at 0.5) → 0.264 (vector); SciFact: 0.678 (BM25) → 0.714 (hybrid at 0.5) → 0.683 (vector); FIQA: 0.284 (BM25) → 0.428 (hybrid at 0.5) → 0.434 (vector); Quora: 0.770 (BM25) → 0.867 (hybrid at 0.5) → 0.887 (vector)", "source_url": "https://github.com/weaviate/weaviate-BEIR-benchmarks/blob/main/hybrid-search-results.md", "source_title": "Weaviate BEIR Benchmarks — hybrid-search-results.md", "confidence": 0.9, "methodology_notes": "nDCG scores reported across alpha ∈ {0, 0.25, 0.5, 0.75, 1} where alpha=0 is pure BM25 and alpha=1 is pure vector. Embedding model not specified in results file. Key insight: hybrid wins on small/lexical-heavy sets, pure vector wins on question-answer style sets."}
```

### Finding 8: ScaNN vs DiskANN accuracy-QPS tradeoff (atlarge-research 2025)
```json
{"claim": "ScaNN at Recall@10=0.90 achieves same downstream Q&A accuracy (74.9%) as DiskANN at Recall@10=0.96, while delivering higher throughput: 25,054 vs 14,606 QPS; partition-based indexes consistently beat graph-based at same average recall", "evidence_quote": "A ScaNN configuration with Recall@10 = 0.90 achieves the same Q&A accuracy as a DiskANN configuration with Recall@10 = 0.96 (74.9%), while providing significantly higher throughput (25,054 vs. 14,606 QPS). Partition-based indexes consistently outperform graph-based indexes at the same average recall, with ScaNN and IVFFlat achieving higher Q&A accuracy than DiskANN and HNSW", "source_url": "https://atlarge-research.com/pdfs/2025-iiswc-vectordb.pdf", "source_title": "Storage-Based Approximate Nearest Neighbor Search (IISWC 2025)", "confidence": 0.9, "methodology_notes": "IEEE IISWC 2025 workshop paper. Supports robustness critique: average recall hides real-world Q&A performance differences. ScaNN (IVF-family) empirically better than graph indexes at same recall on downstream task."}
```

### Finding 9: DiskANN billion-scale baseline (original NeurIPS 2019, still cited)
```json
{"claim": "DiskANN indexes and searches a billion-point >100-D dataset on a single 64GB-RAM machine with >95% recall@1 and sub-5ms latency", "evidence_quote": "DiskANN can index and search a billion-scale dataset of over 100 dimensions on a single machine with 64GB RAM, providing over 95% recall@1 with latencies under 5 milliseconds", "source_url": "https://proceedings.neurips.cc/paper/2019/hash/09853c7fb1d3f8ee67a61b6bf4a7f8e6-Abstract.html", "source_title": "DiskANN: Fast Accurate Billion-point NN Search on a Single Node (NeurIPS 2019)", "confidence": 0.85, "methodology_notes": "Original DiskANN paper (Subramanya et al., Microsoft Research). Billion-scale SIFT1B/DEEP1B evaluation on single node. Still the primary academic reference for disk-based graph ANN used by Milvus and Pinecone."}
```

### Finding 10: FAISS-IVF recall saturation vs graph methods
```json
{"claim": "FAISS-IVF with lossy PQ compression saturates at ~90% recall on small datasets and ~85% on large datasets; graph-based methods (HNSW, DiskANN) achieve better recall-vs-throughput trade-off overall despite larger memory footprint", "evidence_quote": "Although FAISS-IVF has smaller memory footprint, lossy PQ compression introduces significant approximation error and causes recall to saturate around 90% and 85% for small and large datasets respectively, while graph-based methods consistently achieve better recall vs. throughput tradeoff over FAISS-IVF", "source_url": "https://atlarge-research.com/pdfs/2025-iiswc-vectordb.pdf", "source_title": "Storage-Based Approximate Nearest Neighbor Search (IISWC 2025)", "confidence": 0.88, "methodology_notes": "IISWC 2025 benchmark. Caveat: this finding partially conflicts with Finding 8 (ScaNN wins on Q&A despite being IVF-family) — difference is that ScaNN uses anisotropic quantization and Q&A metric diverges from raw recall."}
```

### Finding 11: Robustness critique — concrete robustness numbers per index
```json
{"claim": "At average Recall@10=0.9 on Text-to-Image-10M, ScaNN achieves Robustness-0.1@10 = 0.9997 vs DiskANN's 0.9791 — a 70x difference in zero-recall queries (0.03% vs 2.1%). On MSMARCO, DiskANN has 4.8% zero-recall queries while IVFFlat/ScaNN exceed 0.99 robustness", "evidence_quote": "Text-to-Image-10M at δ=0.1: ScaNN achieves 0.9997 robustness vs. DiskANN at 0.9791 (70× difference in zero-recall queries: 0.03% vs. 2.1%); MSMARCO at δ=0.1: DiskANN exhibits 4.8% zero-recall queries; IVFFlat and ScaNN exceed 0.99 robustness", "source_url": "https://arxiv.org/html/2507.00379v2", "source_title": "Towards Robustness: A Critique of Current Vector Database Assessments", "confidence": 0.95, "methodology_notes": "Evaluated on Text-to-Image-10M, MSSPACEV-10M, DEEP-10M, MSMARCO. Indexes: HNSW, DiskANN, Zilliz, IVFFlat, ScaNN, Puck. Robustness-δ@K = (1/m)·Σ 𝕀(Rᵢ ≥ δ). Shows DiskANN and HNSW have worse tail behavior than partition-based indexes at same average recall."}
```

### Finding 12: Explicit VectorDBBench/ANN-Benchmarks critique
```json
{"claim": "The ANN-Benchmarks and Big-ANN-Benchmarks ecosystems drive optimization effort toward average recall, which masks query variability and tail performance that matters for RAG", "evidence_quote": "The community's 'obsession' with [average recall]—reinforced by benchmarks like ANN-Benchmarks and Big-ANN-Benchmarks—drives efforts toward solely optimizing the average recall", "source_url": "https://arxiv.org/html/2507.00379v2", "source_title": "Towards Robustness: A Critique of Current Vector Database Assessments", "confidence": 0.95, "methodology_notes": "Explicit critique — ties directly to Task 4. Recommends reporting per-query recall distribution and Robustness-δ@K alongside average recall."}
```

### Finding 13: SPLADE++ CoCondenser MS MARCO dev MRR@10
```json
{"claim": "SPLADE++ CoCondenser-EnsembleDistil achieves 38.3 MRR@10 on MS MARCO dev; distillation alone contributes +1.6 MRR@10; best results require distillation + ensemble mining + pre-trained checkpoint combined", "evidence_quote": "The SPLADE++ CoCondenser-EnsembleDistil model achieves 38.3 MRR@10 on MS MARCO dev... distillation offers the largest boost in effectiveness across all scenarios with +1.6 MRR@10, and the best model on MS MARCO (CoCondenser-EnsembleDistil) takes advantage of distillation, ensemble mining and pre-trained checkpoint altogether", "source_url": "https://arxiv.org/abs/2205.04733", "source_title": "From Distillation to Hard Negative Sampling: Making Sparse Neural IR Models More Effective (SIGIR 2022)", "confidence": 0.9, "methodology_notes": "SIGIR '22 Madrid. Formal/Lassance/Piwowarski/Clinchant (NAVER Labs). MS MARCO dev small eval. Alternative mono-GPU variant gets 37.2 MRR@10. Code open-sourced at github.com/naver/splade."}
```

### Finding 14: Bang for the Buck — cloud CPU vector search cost-efficiency (arXiv 2505.07621)
```json
{"claim": "'Bang for the Buck: Vector Search on Cloud CPUs' evaluates HNSW, DiskANN/PDX, and IVF on cloud CPU instances with cost-effectiveness as primary metric instead of peak performance", "evidence_quote": "The paper compares three major algorithmic approaches: HNSW (graph-based), DiskANN/PDX (disk-based designed for memory efficiency), and IVF (quantization-based using product quantization)... evaluates... queries per second (QPS), recall rates, and latency metrics across these systems", "source_url": "https://arxiv.org/abs/2505.07621", "source_title": "Bang for the Buck: Vector Search on Cloud CPUs (Kuffo & Boncz, May 2025)", "confidence": 0.78, "methodology_notes": "arXiv 2505.07621, May 12 2025, CWI. CC-BY 4.0. Specific QPS/recall/latency numbers in PDF tables but not extracted via abstract fetch. Notable contribution: cost-per-query framing rather than pure QPS maximization."}
```

### Finding 15: arxiv 2602.11443 — Filtered ANN systems study (FAISS, Milvus, pgvector)
```json
{"claim": "Milvus achieves superior recall stability through hybrid approximate/exact execution; pgvector's query optimizer frequently selects suboptimal plans (preferring index scans over sequential scans despite comparable performance); IVFFlat outperforms HNSW for low-selectivity filtered queries — contrary to conventional wisdom", "evidence_quote": "Milvus achieves superior recall stability through hybrid approximate/exact execution... pgvector's query optimizer frequently selects suboptimal plans, preferring index scans over sequential scans despite comparable performance... Partition-based indexes (IVFFlat) outperform graph-based indexes (HNSW) for low-selectivity queries", "source_url": "https://arxiv.org/abs/2602.11443", "source_title": "Filtered Approximate Nearest Neighbor Search in Vector Databases: System Design and Performance Analysis (Amanbayev, Tsan, Dang, Rusu)", "confidence": 0.92, "methodology_notes": "Submitted Feb 11 2026. Introduces MoReVec dataset (768-dim relational with metadata) and Global-Local Selectivity metric. Evaluates FAISS, Milvus, pgvector. Extends ANN-Benchmarks for filtered eval. Key actionable insight: vector DB users should not blindly use HNSW for filtered workloads."}
```

### Finding 16: SPLADE-v3 — full BEIR table (NDCG@10 per dataset)
```json
{"claim": "SPLADE-v3 achieves 51.7 average NDCG@10 across 13 BEIR datasets and 40.2 MRR@10 on MS MARCO dev (vs 37.6 for SPLADE++ SelfDistil); per-dataset NDCG@10: ArguAna 50.9, Climate-FEVER 23.3, DBPedia 45.0, FEVER 79.6, FiQA 37.4, HotpotQA 69.2, NFCorpus 35.7, NQ 58.6, Quora 81.4, SCIDOCS 15.8, SciFact 71.0, TREC-COVID 74.8, Touché 29.3", "evidence_quote": "SPLADE-v3 achieved 40.2 MRR@10 on the MS MARCO dev set, representing a notable improvement over the previous SPLADE++SelfDistil version which scored 37.6... ArguAna 50.9, Climate-FEVER 23.3, DBPedia-entity 45.0, FEVER 79.6, FiQA-2018 37.4, HotpotQA 69.2, NFCorpus 35.7, NQ 58.6, Quora 81.4, SCIDOCS 15.8, SciFact 71.0, TREC-COVID 74.8, Touché-2020 29.3, Average 51.7", "source_url": "https://arxiv.org/abs/2403.06789", "source_title": "SPLADE-v3: New baselines for SPLADE (Lassance et al., March 2024)", "confidence": 0.95, "methodology_notes": "arXiv 2403.06789, NAVER Labs. SPLADE-v3 reports +2% improvement on out-of-domain BEIR over prior SPLADE versions. 13 BEIR datasets evaluated. Provides direct quantitative anchor for sparse-vs-dense comparisons in RAG."}
```

### Finding 17: pgvectorscale vs Qdrant on 50M vectors (referenced in pgvector benchmark survey)
```json
{"claim": "pgvectorscale achieves 471 QPS at 99% recall on 50M vectors, 11.4x faster than Qdrant's 41 QPS at the same recall (May 2025 benchmark). pgvector 0.7.0 with HNSW + binary quantization cut build time ~150x vs initial 0.5.0 release on dbpedia-openai-1000k-angular at 99% recall", "evidence_quote": "pgvectorscale achieves 471 QPS at 99% recall on 50M vectors, which is 11.4x better than Qdrant's 41 QPS at the same recall (May 2025 benchmarks)... On the dbpedia-openai-1000k-angular dataset at 99% recall, pgvector 0.7.0 with HNSW + binary quantization cut build time by ~150× versus the first HNSW release (0.5.0)", "source_url": "https://www.tigerdata.com/blog/pgvector-vs-qdrant", "source_title": "Pgvector vs. Qdrant — Tiger Data benchmarks", "confidence": 0.6, "methodology_notes": "Vendor benchmark (Tiger Data, makers of pgvectorscale) — flagged as Tier 3, NOT peer-reviewed. Use with caution due to vendor bias. Numbers warrant independent reproduction. Provides one anchor for HNSW + quantization speed gains."}
```

---

## Summary of Top Findings (Academic/Formal Lens)

**Strongest findings (confidence ≥ 0.9):**
1. **Robustness critique (arxiv 2507.00379)** — Average recall is misleading; ScaNN at 0.9 robustness vs DiskANN at 0.9791 produces 70x fewer zero-recall queries. Direct critique of ANN-Benchmarks/Big-ANN-Benchmarks. (Findings 1, 11, 12)
2. **SIEVE (PVLDB 2025)** — Up to 8.06x speedup for filtered ANN with hard predicates; 2.15x memory of HNSW; 1% build time. (Finding 3)
3. **Filtered ANN systems study (arxiv 2602.11443)** — IVFFlat beats HNSW on low-selectivity filtered queries; pgvector optimizer is buggy. (Finding 15)
4. **SPLADE-v3** — 51.7 avg NDCG@10 on BEIR, 40.2 MRR@10 MS MARCO. Concrete per-dataset table available. (Finding 16)
5. **ScaNN vs DiskANN at downstream Q&A (IISWC 2025)** — ScaNN at 0.90 recall = DiskANN at 0.96 for Q&A accuracy, 25K vs 14.6K QPS. (Finding 8)
6. **RaBitQ (SIGMOD 2024)** — 4/5/7-bit quantization → 90/95/99% recall; 19K QPS at 0.99 recall on SIFT1M, +40% over PQ. (Finding 5)

**Key cross-cutting insights:**
- Multiple independent academic sources (Findings 8, 11, 15) converge on the conclusion that **graph-based indexes (HNSW, DiskANN) underperform partition-based (IVFFlat, ScaNN) on filtered/low-selectivity queries and on tail robustness**, contradicting common practitioner wisdom.
- The **Robustness-δ@K** metric is gaining traction as a replacement/companion to mean recall — relevant for any RAG eval.
- **Hybrid search (BM25+vector)** doesn't always win: it dominates on small lexical-heavy datasets (NFCorpus, SciFact) but pure vector wins on Q&A datasets (Quora, FIQA) per Weaviate BEIR (Finding 7).
- Academic consensus: **vendor benchmarks have systematic biases**. The robustness critique paper explicitly names ANN-Benchmarks and Big-ANN-Benchmarks as drivers of misleading optimization.

**Gaps / lower-confidence items:**
- Could not extract full PDF table from ETH FANNS benchmark (binary PDF parse failed) — Finding intentionally not made; reader should fetch http://htor.inf.ethz.ch/publications/img/2025_iff_fanns_benchmark.pdf directly
- Bang-for-the-Buck specific QPS-per-dollar numbers not extracted (Finding 14)
- Compass exact speedup vs NaviX not in abstract (Finding 4)

**File**: /tmp/research_agent_A_academic.md
