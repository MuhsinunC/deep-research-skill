# Phase 4.5: OUTLINE REFINEMENT

## Original Outline (from PLAN)
1. Executive Summary
2. Introduction
3. Finding 1: Performance benchmarks (SQ1)
4. Finding 2: Cost tradeoffs at scale (SQ2)
5. Finding 3: Hybrid search (SQ3)
6. Finding 4: Production failure modes (SQ4)
7. Finding 5: Filtered search (SQ5)
8. Synthesis
9. Limitations
10. Recommendations
11. Bibliography
12. Methodology

## Evidence-Driven Adaptations

### Adaptation 1: Add Finding 6 — "The Methodology Crisis in Vector DB Benchmarking"
**Rationale**: arXiv 2507.00379 ("Towards Robustness") plus the Qdrant-vs-Milvus benchmark dispute showed that **how you measure** is as important as **what you measure**. This is not just a limitation note — it's a substantive finding that changes how readers should interpret all the other numbers in the report. Without this section, the reader would walk away with a false sense of precision.
**Evidence base**: arxiv 2507.00379 + Zilliz vs Qdrant methodology dispute + the benchmark divergence patterns + Robustness-δ@K proposal.

### Adaptation 2: Add Finding 7 — "The Top-End Migration Story (Why Notion/Cursor/Spotify/Perplexity left the named 5)"
**Rationale**: This was NOT in the original SCOPE because the SCOPE focused on the 5 named databases. But the evidence is loud: Notion (10B vectors, 90% cost reduction) and Cursor (>1M writes/sec, 95% cost cut) chose Turbopuffer; Perplexity and Spotify chose Vespa. These are the exact RAG-at-scale users the named 5 want to serve, and they collectively voted with their feet. Omitting this would be misleading by omission.
**Evidence base**: notion.com/blog/two-years-of-vector-search-at-notion + turbopuffer.com/customers/notion + Jason Liu writeup + multiple practitioner sources
**Scope check**: Stays within "vector databases for RAG" — just acknowledges that the answer to "which of the 5" is sometimes "none of them at this scale".

### Adaptation 3: Restructure Finding 2 (Cost) into 3 explicit scale tiers
**Rationale**: Cost data clusters very differently at <10M, 10M-100M, and >100M. The original "single section" framing would obscure the crossover point. Sub-section explicitly:
- 2a: Small scale (<10M) — managed wins
- 2b: Medium scale (10M-100M) — crossover zone
- 2c: Large scale (>100M) — self-hosted dominates economically (but operational cost rises)

### Adaptation 4: Add per-database "production maturity" mini-summary inside Finding 4
**Rationale**: Reader needs an at-a-glance take per DB, not just a list of bugs. Each subsection of Finding 4 should end with a 2-line "what this means for production deployment" verdict.

### Adaptation 5: Demote nothing
- All 5 original findings remain. None of the SCOPE sub-questions turned out to be uninteresting or unanswerable.

## Refined Outline (Final)

1. **Executive Summary** (~350 words)
2. **Introduction** (~600 words)
   - Research question, scope, methodology
3. **Finding 1: Performance Benchmarks — What the Numbers Say (and Don't)** (~1500 words)
   - Standard 1M HNSW workloads (vendor benchmarks)
   - Filtered & scale-up workloads
   - The "all within 2x" reality
   - Per-database snapshot
4. **Finding 2: Cost Tradeoffs Across Three Scale Tiers** (~1500 words)
   - 2a: <10M vectors (small)
   - 2b: 10M-100M (medium / crossover)
   - 2c: >100M (large)
   - Hidden costs (DevOps, egress, lock-in, migration)
5. **Finding 3: Hybrid Search Quality and Implementation** (~1300 words)
   - Native support matrix
   - BEIR evidence (Weaviate's data)
   - Pinecone cascading retrieval evidence
   - When hybrid wins / when it doesn't
6. **Finding 4: Production Failure Modes and Reliability** (~1700 words)
   - Per-database section, each with critical bugs + maturity verdict
   - Pinecone outage record vs SLA marketing
   - The CVE / data loss / correctness bug landscape
7. **Finding 5: Filtered Vector Search — The Achilles Heel** (~1300 words)
   - The HNSW "performance cliff"
   - Per-database approach (planner vs in-graph vs post-filter)
   - The pgvector correctness problem
   - Academic alternatives (ACORN, SIEVE, Compass)
8. **Finding 6: The Benchmark Methodology Crisis** (~900 words)
   - "Towards Robustness" critique
   - Robustness-δ@K
   - Vendor benchmark divergence pattern
   - How to read any vector DB benchmark in 2026
9. **Finding 7: The Top-End Migration Pattern (and What It Means for the 5)** (~900 words)
   - Notion → Turbopuffer (10B vectors)
   - Cursor → Turbopuffer (1M writes/sec)
   - Perplexity / Spotify → Vespa (hybrid-first)
   - Implications for the 5 named databases
10. **Synthesis & Insights** (~1100 words)
    - Patterns across findings
    - Novel insights
    - Decision framework by scale tier and use case
11. **Limitations & Caveats** (~700 words)
12. **Recommendations** (~1000 words)
    - Per scale tier
    - Per workload type
    - Migration considerations
13. **Bibliography** (full, ~50+ entries)
14. **Methodology Appendix** (~500 words)

**Estimated total**: 13,000-15,000 words, well within deep mode target

## Adaptation Documentation
- 2 new findings added (#6 methodology crisis, #7 top-end migration)
- Finding 2 restructured into 3 tiers
- Per-database mini-verdicts added inside Finding 4
- 0 sections removed
- Total restructuring: ~25% (within the 50% limit)
- Original research question core preserved

## Think2 EVALUATE
- All evidence-driven adaptations are tied to specific sources
- New sections (Findings 6 and 7) have strong existing evidence — no thin sections
- Outline now better reflects what the evidence actually says, not just what the questions assumed
- Flag for SYNTHESIZE: prepare to write Finding 6 carefully — "benchmark methodology crisis" risks sounding like nihilism. Frame as "here's how to read benchmarks intelligently", not "all numbers are lies".
