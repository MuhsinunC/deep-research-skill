# Practitioner/Applied Research: Vector Databases for RAG (2025-2026)

Lens: PRACTITIONER/APPLIED
Date: 2026-04-06
Target: 12-18 production-grounded findings

## Findings

### F1: Reddit evaluated Milvus v2.4 vs Qdrant v1.12 at 340M vectors
```json
{"claim": "Reddit evaluated Milvus v2.4 and Qdrant v1.12 using ~340M Reddit post vectors (384-dim) with HNSW (M=16, efConstruction=100). Adding filters hurt Milvus latency more than Qdrant; but Qdrant had more interaction between ingestion and query load than Milvus.", "evidence_quote": "Reddit's engineering team tested Milvus v2.4 and Qdrant v1.12 for their ANN search needs. The evaluation used approximately 340M Reddit post vectors of 384 dimensions each, with HNSW index configuration (M=16, efConstruction=100)... adding filtering affected Milvus latency more than Qdrant. However, there was far more interaction between ingestion and query load on Qdrant than on Milvus.", "source_url": "https://milvus.io/blog/choosing-a-vector-database-for-ann-search-at-reddit.md", "source_title": "Choosing a vector database for ANN search at Reddit", "company_or_author": "Reddit engineering (posted to Milvus blog)", "scale_tier": ">100M", "confidence": 0.9}
```

### F2: Reddit's prior state — no single vector DB, used Vertex AI + FAISS + Solr ANN
```json
{"claim": "Before evaluating Milvus/Qdrant, Reddit teams used a grab-bag of solutions: Google Vertex AI Vector Search, Apache Solr ANN, and FAISS for smaller datasets. They wanted one unified, cost-effective, Reddit-scale solution.", "evidence_quote": "In 2024, Reddit teams used a variety of solutions to perform approximate nearest neighbour (ANN) vector search, from Google's Vertex AI Vector Search and experimenting with Apache Solr's ANN vector search for larger datasets, to Facebook's FAISS library for smaller datasets.", "source_url": "https://milvus.io/blog/choosing-a-vector-database-for-ann-search-at-reddit.md", "source_title": "Choosing a vector database for ANN search at Reddit", "company_or_author": "Reddit engineering", "scale_tier": ">100M", "confidence": 0.9}
```

### F3: Notion migrated to turbopuffer (NOT Pinecone/Qdrant/Weaviate)
```json
{"claim": "Notion migrated its multi-billion object vector workload from a dedicated-hardware pod-based vector DB to turbopuffer in late 2024/early 2025, achieving 60% reduction in search engine spend and 35% reduction in AWS EMR compute.", "evidence_quote": "Notion migrated from a dedicated-hardware 'pod' architecture vector database to turbopuffer in late 2024... Search engine spend: 60% reduction; AWS EMR compute: 35% reduction", "source_url": "https://www.notion.com/blog/two-years-of-vector-search-at-notion", "source_title": "Two years of vector search at Notion: 10x scale, 1/10th cost", "company_or_author": "Notion engineering", "scale_tier": ">100M", "confidence": 0.95}
```

### F4: Notion query latency improvement post-migration
```json
{"claim": "Notion p50 query latency improved from 70-100ms to 50-70ms post-turbopuffer migration, while supporting 15x growth in active workspaces and 8x vector DB capacity expansion.", "evidence_quote": "Query latency: Improved from 70-100ms (p50) to 50-70ms (p50) post-turbopuffer migration... Workspaces onboarded: Cleared multi-million waitlist by April 2024... Active workspaces: 15x growth, Vector database capacity: 8x expansion", "source_url": "https://www.notion.com/blog/two-years-of-vector-search-at-notion", "source_title": "Two years of vector search at Notion", "company_or_author": "Notion engineering", "scale_tier": ">100M", "confidence": 0.95}
```

### F5: Notion May 2024 serverless migration saved millions annually
```json
{"claim": "Notion's May 2024 migration to serverless vector DB architecture delivered 50% cost reduction from peak usage, saving several millions of dollars annually.", "evidence_quote": "In May 2024, Notion migrated their entire embeddings workload from a dedicated-hardware 'pod' architecture to a serverless architecture, achieving a 50 percent cost reduction from peak usage, resulting in several millions of dollars saved annually.", "source_url": "https://www.notion.com/blog/two-years-of-vector-search-at-notion", "source_title": "Two years of vector search at Notion", "company_or_author": "Notion engineering", "scale_tier": ">100M", "confidence": 0.9}
```

### F6: Notion metadata-only updates save 70% data volume
```json
{"claim": "Notion detects metadata-only changes (e.g., permissions updates) and issues PATCH commands rather than re-embedding, cutting 70% of vector DB data volume processed.", "evidence_quote": "Notion achieved a 70% reduction in data volume by detecting when only metadata changes (like permissions updates), allowing them to skip embeddings entirely and issue cheaper PATCH commands to update just the metadata in the vector database", "source_url": "https://www.notion.com/blog/two-years-of-vector-search-at-notion", "source_title": "Two years of vector search at Notion", "company_or_author": "Notion engineering", "scale_tier": ">100M", "confidence": 0.9}
```

### F7: Pinecone serverless pricing (2025 Standard plan)
```json
{"claim": "Pinecone Standard plan pricing as of 2025: $50/month minimum + $15 usage credit. Storage $0.33/GB/mo; writes $4.00/M units; reads $16.00/M units. Enterprise plan has $500/mo minimum and higher unit costs ($6/M writes, $24/M reads).", "evidence_quote": "Standard Plan: Base Cost: $50/month minimum commitment... Storage: $0.33 / GB / month, Write Units: $4.00 per million units, Read Units: $16.00 per million units. Enterprise Plan: Base Cost: $500/month minimum commitment", "source_url": "https://www.metacto.com/blogs/the-true-cost-of-pinecone-a-deep-dive-into-pricing-integration-and-maintenance", "source_title": "The True Cost of Pinecone - MetaCTO", "company_or_author": "MetaCTO", "scale_tier": "unspecified", "confidence": 0.9}
```

### F8: Mastra pgvector benchmark p95 latency by scale
```json
{"claim": "Mastra benchmark shows pgvector IVFFlat p95 latency at 1M vectors (64-dim): 141-219ms (fixed) vs 125-161ms (adaptive). At 500K vectors: 66-70ms (fixed) vs 60-65ms (adaptive). 100% recall maintained above 1K vectors.", "evidence_quote": "Fixed IVFFlat approach: 1M vectors (64 dimensions): 141-219ms... Adaptive IVFFlat approach: 1M vectors (64 dimensions): 125-161ms... Both fixed and adaptive approaches maintained excellent recall (typically 100%) for datasets larger than 1,000 vectors.", "source_url": "https://mastra.ai/blog/pgvector-perf", "source_title": "Benchmarking pgvector RAG performance across different dataset sizes", "company_or_author": "Mastra", "scale_tier": "<10M", "confidence": 0.85}
```

### F9: Lyzr Agent Studio production Qdrant p99 = 20ms @ 1M vectors, 250+ QPS
```json
{"claim": "Lyzr Agent Studio reports Qdrant in production sustained p99 = 20ms at >1M vectors and 250+ QPS across distributed agents.", "evidence_quote": "The system achieved P99 latency of 20ms even with over 1 million vectors in production. Query performance remained consistent during peak workloads... the system sustained handling of 250+ queries per second across distributed agents.", "source_url": "https://www.lyzr.ai/blog/scaling-ai-agents-with-qdrant-with-lyzr-agent-studio/", "source_title": "Scaling AI Agents with Qdrant at Lyzr Agent Studio", "company_or_author": "Lyzr", "scale_tier": "<10M", "confidence": 0.75}
```

### F10: Qdrant customer roster — Tripadvisor billion reviews, OpenTable, HubSpot
```json
{"claim": "Tripadvisor indexed >1B reviews on Qdrant for AI Trip Planner, claiming 2-3x revenue lift from generative experience. OpenTable uses Qdrant sparse embeddings to filter 60K+ restaurants in its AI Concierge. HubSpot selected Qdrant for Breeze AI.", "evidence_quote": "Tripadvisor activated a dataset of over one billion reviews to power its AI Trip Planner, driving 2-3x more revenue from users engaged with the new generative experience. OpenTable built its AI Concierge on Qdrant utilizing sparse embeddings to precisely filter over 60,000 restaurants, and HubSpot selected Qdrant to scale Breeze AI", "source_url": "https://qdrant.tech/blog/2025-recap/", "source_title": "Qdrant 2025 Recap: Powering the Agentic Era", "company_or_author": "Qdrant (vendor)", "scale_tier": ">100M", "confidence": 0.7}
```

### F11: pgvectorscale vs Pinecone s1 — 28x lower p95, 16x higher throughput
```json
{"claim": "Tiger Data's pgvectorscale benchmark claims 28x lower p95 latency and 16x higher query throughput than Pinecone storage-optimized (s1) index.", "evidence_quote": "PostgreSQL with pgvector and pgvectorscale achieved a remarkable 28x lower p95 latency and 16x higher query throughput compared to Pinecone's storage-optimized (s1) index.", "source_url": "https://www.tigerdata.com/blog/pgvector-vs-qdrant", "source_title": "Pgvector vs. Qdrant — Tiger Data", "company_or_author": "Tiger Data (Timescale) — vendor", "scale_tier": "10M-100M", "confidence": 0.6}
```

### F12: pgvectorscale vs Qdrant — 11.4x QPS at 99% recall on 50M vectors
```json
{"claim": "Tiger Data May 2025 benchmarks claim pgvectorscale achieves 471 QPS at 99% recall on 50M vectors — 11.4x Qdrant's 41 QPS at the same recall level.", "evidence_quote": "pgvectorscale achieves 471 QPS (Queries Per Second) at 99% recall on 50M vectors, which is 11.4x better than Qdrant's 41 QPS at the same recall (May 2025 benchmarks).", "source_url": "https://www.tigerdata.com/blog/pgvector-vs-qdrant", "source_title": "Pgvector vs. Qdrant — Tiger Data", "company_or_author": "Tiger Data (vendor, treat skeptically)", "scale_tier": "10M-100M", "confidence": 0.55}
```

### F13: pgvector rule-of-thumb — 5-10M comfortable, 50M worth re-evaluating
```json
{"claim": "Practitioner guidance: most teams run pgvector comfortably up to 5-10M vectors on a well-sized Postgres instance. Beyond ~50M, evaluating a dedicated vector DB is worth the effort.", "evidence_quote": "Most teams run comfortably up to 5-10 million vectors on a well-sized PostgreSQL instance... Beyond ~50M vectors, a dedicated vector database is worth evaluating.", "source_url": "https://medium.com/@dikhyantkrishnadalai/optimizing-vector-search-at-scale-lessons-from-pgvector-supabase-performance-tuning-ce4ada4ba2ed", "source_title": "Optimizing Vector Search at Scale: Lessons from pgvector & Supabase Performance Tuning", "company_or_author": "Dikhyant Krishna Dalai (practitioner blog)", "scale_tier": "10M-100M", "confidence": 0.7}
```

### F14: Cursor saved 95% on semantic search costs by switching to turbopuffer
```json
{"claim": "Cursor uses turbopuffer with each codebase as its own S3 namespace (tens of millions of namespaces). After switching its semantic search pipeline to turbopuffer, Cursor reports 95% savings on data storage/retrieval while supporting >1M writes per second.", "evidence_quote": "Cursor uses TurboPuffer with each codebase as a namespace in S3, with tens of millions of these at any time... This approach allowed Cursor to index much larger repositories than was economically feasible before, while cutting costs by 95%... since switching its semantic search pipeline to TurboPuffer, Cursor has saved 95% on data storage and retrieval while supporting more than one million writes per second.", "source_url": "https://www.pmf.show/blog/how-simon-eskildsen-built-turbopuffer-the-vector-db-powering-cursor-and-notion/", "source_title": "How Simon Eskildsen Built TurboPuffer, the Vector DB Powering Cursor and Notion", "company_or_author": "Cursor / turbopuffer (Simon Eskildsen)", "scale_tier": ">100M", "confidence": 0.85}
```

### F15: Notion 10B+ vectors on turbopuffer, 80% overall cost reduction
```json
{"claim": "Notion runs >10B vectors across millions of namespaces on turbopuffer. The workload shows power-law access patterns — only a subset of workspaces are active — making object-storage-first architecture a fit. Notion removed all per-user AI charges after migrating and reports ~80% cost reduction.", "evidence_quote": "With more than 10 billion vectors across millions of namespaces, Notion's workload is perfect for this approach since only a subset of workspaces are active at once. After migrating, Notion removed all per-user AI charges. ... Since migrating to TurboPuffer, Notion has seen an 80% reduction in costs.", "source_url": "https://www.pmf.show/blog/how-simon-eskildsen-built-turbopuffer-the-vector-db-powering-cursor-and-notion/", "source_title": "How Simon Eskildsen Built TurboPuffer, the Vector DB Powering Cursor and Notion", "company_or_author": "turbopuffer / Notion", "scale_tier": ">100M", "confidence": 0.85}
```

### F16: Perplexity chose Vespa over a standalone vector DB for unified hybrid search
```json
{"claim": "Perplexity selected Vespa to serve real-time hybrid RAG (lexical + semantic + filters + learned ranking) in a single engine — explicitly to avoid stitching a standalone vector DB to a separate keyword engine at consumer-facing scale.", "evidence_quote": "Perplexity selected Vespa as their platform for delivering real-time, large-scale RAG with high performance, low latency, and reliability for a consumer-facing application serving millions of users. Vespa integrates vector search for semantic understanding, lexical search for precision, structured filtering, and machine-learned ranking into a single engine, eliminating the engineering overhead of stitching together multiple disparate systems like a standalone vector database with a separate keyword search engine.", "source_url": "https://blog.vespa.ai/perplexity-show-what-great-rag-takes/", "source_title": "How Perplexity beat Google on AI Search with Vespa.ai", "company_or_author": "Perplexity / Vespa", "scale_tier": ">100M", "confidence": 0.85}
```

### F17: Milvus production scale — sub-50ms at billions, sub-10ms on Zilliz Cloud
```json
{"claim": "Milvus is reported in production with sub-50ms retrieval latency across billions of vectors (self-managed), and sub-10ms on Zilliz Cloud managed service. Named users include NVIDIA, Salesforce, eBay, Airbnb, and DoorDash.", "evidence_quote": "Organizations running Milvus in production report sub-50ms retrieval latency across billions of vectors... Milvus supports billion-scale workloads with sub-10ms latency when using Zilliz Cloud, its managed service. More than 10,000 enterprise teams are using Milvus in live AI systems—including NVIDIA, Salesforce, eBay, Airbnb, and DoorDash.", "source_url": "https://milvus.io/blog/introduce-milvus-2-6-built-for-scale-designed-to-reduce-costs.md", "source_title": "Introducing Milvus 2.6: Affordable Vector Search at Billion Scale", "company_or_author": "Milvus / Zilliz (vendor)", "scale_tier": ">100M", "confidence": 0.6}
```

### F18: 10M-vector cost example — Pinecone serverless ~$64/mo vs Qdrant self-host ~$660/mo (DevOps included)
```json
{"claim": "Worked example at 10M vectors: Pinecone serverless ~$64/mo (storage $23 + reads $41 + writes $20). Weaviate Cloud ~$85/mo. Self-hosted Qdrant on AWS ~$660/mo when you include $500/mo DevOps allocation (r6g.xlarge $150 + EBS $10 + DevOps $500). Implication: under 50M vectors managed SaaS is drastically cheaper than self-hosting once you price in operations.", "evidence_quote": "10M Vector Example: ~$64 monthly (storage $23 + reads $41 + writes $20)... Weaviate Cloud — 10M Vector Example: ~$85 monthly... Self-Hosted Qdrant (AWS): EC2 instance (r6g.xlarge): $150/month, EBS storage: $10/month, DevOps allocation: $500/month — 10M Vector Example: ~$660 monthly... For datasets under 50M vectors, the analysis concludes that managed SaaS (Pinecone/Weaviate) is drastically cheaper than self-hosting due to the hidden cost of DevOps.", "source_url": "https://rahulkolekar.com/vector-db-pricing-comparison-pinecone-weaviate-2026/", "source_title": "Top 5 Vector Databases for Enterprise RAG: Pinecone vs. Weaviate Cost Comparison (2026)", "company_or_author": "Rahul Kolekar (practitioner)", "scale_tier": "<10M", "confidence": 0.7}
```

### F19: 1B-vector cost example — Pinecone $3,500/mo vs Qdrant self-host $600/mo+ops
```json
{"claim": "At 1B-vector scale, third-party cost analysis quotes Pinecone $3,500/mo managed, Weaviate Cloud $2,200/mo, Weaviate self-hosted $800/mo+ops, Qdrant self-hosted $600/mo+ops. Tipping point for self-hosting cited at ~60-80M queries/month or ~100M vectors with high query volume, or when cloud costs exceed $500/mo.", "evidence_quote": "For billion vectors, the cost comparison shows: Pinecone $3,500/mo managed, Weaviate Cloud $2,200/mo, Weaviate self-hosted $800/mo+ops, Qdrant self-hosted $600/mo+ops... The tipping point for self-hosting is approximately 60-80 million queries per month, or 100 million vectors with high query volume... Typical migration to self-hosted occurs at 50-100M vectors or $500+/month cloud costs.", "source_url": "https://openmetal.io/resources/blog/when-self-hosting-vector-databases-becomes-cheaper-than-saas/", "source_title": "When Self Hosting Vector Databases Becomes Cheaper Than SaaS", "company_or_author": "OpenMetal blog (practitioner)", "scale_tier": ">100M", "confidence": 0.55}
```

### F20: AI startup sticker shock — Pinecone bills jump from $50 → $3,000/mo
```json
{"claim": "Practitioner observation: AI startups commonly experience sudden sticker shock when Pinecone bills jump from $50/mo to $3,000/mo as query volume grows, motivating migration to self-hosted Qdrant/Weaviate/Milvus.", "evidence_quote": "AI startups experience sticker shock when Pinecone bills jump from $50 to $3,000/month, and analysis shows the exact tipping point where self-hosting vector databases becomes cheaper than SaaS, including cost comparisons and migration guides for Qdrant/Weaviate/Milvus.", "source_url": "https://openmetal.io/resources/blog/when-self-hosting-vector-databases-becomes-cheaper-than-saas/", "source_title": "When Self Hosting Vector Databases Becomes Cheaper Than SaaS", "company_or_author": "OpenMetal blog", "scale_tier": "10M-100M", "confidence": 0.5}
```

### F21: Spotify uses Vespa dense retrieval (not a standalone vector DB) for podcast/episode search
```json
{"claim": "Spotify Search uses Vespa with dense retrieval producing query and episode vectors in a shared embedding space, alongside the CoSeRNN sequence model for context-dependent recommendations. Same pattern as Perplexity: chose Vespa unified hybrid engine over a standalone vector DB.", "evidence_quote": "Vespa has been instrumental in enabling Search at Spotify, using a machine learning technique called Dense Retrieval that produces query and episode vectors in a shared embedding space. A key advancement in their recommendation engine is the implementation of the CoSeRNN architecture, which models user preferences as a sequence of context-dependent embeddings", "source_url": "https://vespa.ai/case-studies/", "source_title": "Vespa.ai Case Studies", "company_or_author": "Spotify / Vespa", "scale_tier": ">100M", "confidence": 0.7}
```

### F22: Mastra observational memory benchmark — 10x token cost reduction vs RAG baseline
```json
{"claim": "Mastra's observational memory architecture (text-based, no vector DB required) scored 84.23% on long-context benchmarks vs Mastra's own RAG implementation at 80.05% — and cuts token costs by ~10x because it preserves prompt-cache hit rates that RAG breaks by injecting fresh retrieved context every turn.", "evidence_quote": "On the standard GPT-4o model, observational memory scored 84.23% compared to Mastra's own RAG implementation at 80.05%. Mastra's observational memory system is outperforming a RAG baseline while cutting token costs by up to 10x... most memory systems can't take advantage of prompt caching because they change the prompt every turn by injecting dynamically retrieved context.", "source_url": "https://venturebeat.com/data/observational-memory-cuts-ai-agent-costs-10x-and-outscores-rag-on-long", "source_title": "'Observational memory' cuts AI agent costs 10x and outscores RAG on long-context benchmarks", "company_or_author": "Mastra (via VentureBeat)", "scale_tier": "unspecified", "confidence": 0.65}
```

## Summary of Top Themes

1. **The "Notion + Cursor + turbopuffer" story is THE 2025-2026 vector DB story** — both customers achieved massive cost reductions (60-95%) by moving off pod-based vector DBs onto turbopuffer's object-storage-first architecture. Notion: 10B+ vectors, 80% cost cut. Cursor: 95% data cost cut, >1M writes/sec. (F3, F4, F5, F6, F14, F15)

2. **Reddit's evaluation is the cleanest published Milvus-vs-Qdrant production comparison.** ~340M vectors, 384-dim, HNSW. Architectural takeaway: Milvus heterogeneous nodes vs Qdrant homogeneous. Filtering hurts Milvus more; ingestion hurts Qdrant more. (F1, F2)

3. **Perplexity and Spotify both bypass standalone vector DBs entirely** — both chose Vespa for unified hybrid (lexical + vector + filter + ranking) rather than stitching Pinecone/Qdrant + a separate keyword engine. This is a recurring "consumer scale → unified engine" pattern. (F16, F21)

4. **Cost crossover for self-hosting is well-documented:** ~50-100M vectors or $500+/mo cloud spend, depending on QPS. At 10M scale managed wins easily once you price in DevOps; at 1B scale self-hosted is roughly 4-6x cheaper. (F18, F19, F20)

5. **pgvector/pgvectorscale has aggressively closed the gap** in vendor benchmarks: 11.4x QPS at 99% recall vs Qdrant on 50M vectors (Tiger Data), 28x lower p95 vs Pinecone s1. Independent practitioner numbers (Mastra) show pgvector p95 ~125-220ms at 1M vectors (64-dim) — still capable for moderate scale. Comfort zone is 5-10M, decision-zone is 50M+. (F8, F11, F12, F13)

6. **Production Qdrant numbers exist but mostly via vendor channels:** Lyzr p99=20ms at 1M vectors / 250+ QPS; Tripadvisor 1B+ reviews; OpenTable; HubSpot. Numbers should be treated cautiously as Qdrant-published. (F9, F10)

7. **Pinecone serverless pricing is well-documented:** $0.33/GB storage, $8.25-16/M reads, $2-4/M writes, $50/mo Standard minimum, $500/mo Enterprise minimum — but the *consumption* model creates the "sticker shock" jump from $50 → $3,000+ when query volume scales. (F7, F20)

8. **An adjacent trend worth flagging:** Mastra's observational-memory paper claims RAG-with-vector-DB can be replaced by long-context memory + prompt caching for agent workloads, with 10x token-cost reduction. This is a frontier challenge to the entire vector-DB-for-RAG premise for agent use cases. (F22)

## Source URLs Index
- https://milvus.io/blog/choosing-a-vector-database-for-ann-search-at-reddit.md (Reddit / Milvus)
- https://www.notion.com/blog/two-years-of-vector-search-at-notion (Notion engineering)
- https://www.pmf.show/blog/how-simon-eskildsen-built-turbopuffer-the-vector-db-powering-cursor-and-notion/ (turbopuffer / Cursor / Notion)
- https://blog.vespa.ai/perplexity-show-what-great-rag-takes/ (Perplexity / Vespa)
- https://vespa.ai/case-studies/ (Spotify / Vespa)
- https://qdrant.tech/blog/2025-recap/ (Tripadvisor, OpenTable, HubSpot via Qdrant)
- https://www.lyzr.ai/blog/scaling-ai-agents-with-qdrant-with-lyzr-agent-studio/ (Lyzr / Qdrant)
- https://mastra.ai/blog/pgvector-perf (Mastra pgvector benchmark)
- https://www.tigerdata.com/blog/pgvector-vs-qdrant (Tiger Data pgvectorscale vs Qdrant)
- https://www.metacto.com/blogs/the-true-cost-of-pinecone-a-deep-dive-into-pricing-integration-and-maintenance (MetaCTO Pinecone TCO)
- https://rahulkolekar.com/vector-db-pricing-comparison-pinecone-weaviate-2026/ (Rahul Kolekar 2026 pricing analysis)
- https://openmetal.io/resources/blog/when-self-hosting-vector-databases-becomes-cheaper-than-saas/ (OpenMetal tipping-point)
- https://milvus.io/blog/introduce-milvus-2-6-built-for-scale-designed-to-reduce-costs.md (Milvus 2.6 enterprise scale)
- https://venturebeat.com/data/observational-memory-cuts-ai-agent-costs-10x-and-outscores-rag-on-long (Mastra observational memory)
