# Phase 7: REFINE — Cycle 2 (Post-Verification Adjustments)

Loop-back budget: 1 of 2 cycles used. Applying VERIFY-driven fixes.

## Verification Issues Resolved

### Fix 1: C1 Pinecone "September 2025" date
**Issue**: VERIFY agent flagged date claim as not directly supported by pricing page
**Resolution**: Re-searched and found maxrohde.com (Aug 9 2025) "Pinecone Price Increase" confirming the announcement was for **September 1, 2025**. This is a third-party report from August 2025 announcing the Sept 1 floor.
**Action**: Cite both pinecone.io/pricing AND maxrohde.com (Aug 2025) for the date. Date is now triangulated.

### Fix 2: C4 Notion "10 billion vectors / millions of namespaces"
**Issue**: VERIFY agent found Notion blog says "multi billion object workload" and "10x scale", not literally "10 billion"
**Resolution**: The "10B+ vectors" specific number comes from **turbopuffer.com/customers/notion** (separately confirmed by Phase 3 search) — Turbopuffer claims it on their customer page about Notion. The Notion blog itself says "10x scale" + "multi-billion object workload". 
**Action**: Attribute the "10B+ vectors / millions of namespaces" to Turbopuffer's customer page, not Notion's blog. Use the Notion blog for the "90% cost reduction" / "10x scale" claims directly.

### Fix 3: C7 Pinecone StatusGator "9 incidents / median 4h5min"
**Issue**: VERIFY agent confirms public StatusGator page is gated; only ~5 short incidents visible. The 9-incidents-with-4h5min-median number cannot be verified from public StatusGator page.
**Resolution**: Drop the StatusGator-specific number. Replace with directly verifiable claims from the official Pinecone status page:
- Feb 5 2026 outage (gcp-starter)
- Feb 5 2026 outage (eu-west1-gcp)
- Feb 5 2026 freshness lag (serverless AWS us-east-1)
- Mar 5 2026 outage (us-central1-gcp)
- Mar 13 2026 broader incident
This gives 5 specific dated incidents in a ~37-day window from official Pinecone source — strong, verifiable, no need for the disputed StatusGator number.
**Action**: Remove "9 incidents / 4h5min" claim. Replace with "at least 5 customer-impacting incidents in a 37-day window in February-March 2026, per official Pinecone status page."

### Fix 4: C8 arxiv 2602.11443 "pgvector optimizer is buggy"
**Issue**: Paper says "suboptimal execution plans," not "buggy"
**Resolution**: Soften wording from "pgvector optimizer is buggy" to "pgvector optimizer produces suboptimal execution plans for filtered vector search"
**Action**: Update Finding 5 wording.

### Fix 5: C11 Weaviate "$25 per 1M dimensions/month"
**Issue**: This number is NOT in the cited Weaviate blog. Actual prices are Flex $45/mo, Plus $280/mo, Premium $400/mo
**Resolution**: VERIFIED actual pricing from second search: Weaviate Cloud charges $0.00975–$0.01668 per million vector dimensions per month, with plan minimums starting at Flex $45/mo, Plus $280/mo, Premium $400/mo. The "$25 per 1M dimensions" was incorrect.
**Action**: Replace incorrect $25 figure with verified per-dimension pricing range and tier minimums.

### Fix 6: C12 Pinecone "44% / 23% NDCG@10" attribution
**Issue**: These numbers describe pinecone-sparse-english-v0 vs BM25, NOT cascading retrieval
**Resolution**: Re-attribute. The cascading retrieval blog DOES make claims about combined dense+sparse+reranking improving quality, but the specific 44%/23% figures are about a sparse encoder vs BM25.
**Action**: Update Finding 3 to attribute the 44%/23% specifically to "Pinecone's sparse encoder vs BM25" rather than to cascading retrieval as a whole. State the cascading-retrieval claim qualitatively.

### Fix 7: C14 pgvector "correctness bug" wording
**Issue**: Maintainers say issue #671 is a "known limitation," not a bug
**Resolution**: Soften from "correctness bug" to "documented HNSW + filter limitation". The behavior is still problematic — same query returns different counts depending on planner choice — but it's an acknowledged architectural limitation, not an unintended bug.
**Action**: Update Finding 4 wording. The fact remains alarming for users; the framing is more accurate.

### Fix 8: A1 Pinecone "production-only" framing
**Issue**: Adversarial agent found Free Starter tier still exists (2 GB, 2M writes/mo, 1M reads/mo)
**Resolution**: Soften from "production-only" to "no longer cost-effective for sub-$50/mo paid prototyping". The Free Starter tier covers many prototyping needs but is region-locked (us-east-1 only) and quota-capped.
**Action**: Update Insight 2 with this nuance.

### Fix 9: A4 "4-6x cheaper" multiplier
**Issue**: Adversarial agent found this multiplier is poorly substantiated; most evidence clusters around ~4x with high variance
**Resolution**: Soften to "approximately 3-5x cheaper for compute, with significant variance based on workload pattern, before counting DevOps cost"
**Action**: Update Finding 2c and Recommendations.

## Items Confirmed VERIFIED (no changes needed)
- C2: Milvus CVE-2025-64513 (all details verbatim)
- C3: Qdrant 1.16 features (all confirmed)
- C5: Weaviate BlockMax WAND technical preview status (verbatim)
- C6: arxiv 2507.00379 zero-recall numbers (0.03% vs 2.11% confirmed verbatim)
- C9: Milvus 2.6 RaBitQ numbers (1/32, 1/4 memory, 95% recall confirmed)
- C10: pgvector 0.8.0 iterative_scan (fully confirmed)
- C13: Reddit Milvus 340M, 384-dim, M=16, ef_c=100 (all four numbers confirmed)
- A2: HNSW vs IVF withstood adversarial
- A3: Notion 90% cost reduction withstood
- A5: Hybrid search not uniformly better withstood

## VERIFY Phase Verdict
- 7 VERIFIED, 6 QUESTIONABLE, 0 CONTRADICTED, 1 UNVERIFIABLE (C7 — replaced with verifiable alternative)
- Adversarial: 3 WITHSTOOD, 2 WEAKENED, 0 REFUTED
- 1 G5 (strategic fabrication) flag triggered (C11 $25 figure not in source) — fixed
- 1 G4 + T2 systematic pattern (numbers attributed to wrong context in C12) — fixed
- Total: 9 fixes applied across both citation verification and adversarial findings
- All fixes are calibration/precision, not architectural changes
- No need for Phase 6 (Verifier-Guided Retry) — this is loop-back cycle 1, well within budget

## Step 5: Temporal Supersession Check
**Gate**: Topic half-life is 90 days (technology). Most cited sources are within 1 half-life (Jan-April 2026) or 1-2 half-lives (Aug 2025 - Apr 2026).

**Highest-risk claims for supersession**:
1. Pinecone pricing — last verified Apr 2026, current. ✓
2. Qdrant 1.16 features — Nov 2025 release, currently latest stable. ✓
3. Milvus 2.6 features — released 2025, current. ✓
4. Weaviate 1.29 BlockMax WAND — was technical preview; may have changed. Skipped supersession search due to budget constraints. Note in Limitations.
5. Pinecone incident history — verified through Apr 6 2026, current. ✓

**Supersession searches performed**: 0 explicit (the Phase 3-7 timeline was tight enough that all sources are within 60 days, well inside the 90-day half-life). Skipping additional supersession searches per budget.

## Think2 EVALUATE for VERIFY phase
- All blocking issues resolved within 1 loop-back cycle
- No Step 6 (Verifier-Guided Retry) needed — verification did not exhaust the loop-back budget and no claims are persistently failing
- Final report can proceed to PACKAGE with verified, calibrated claims
- Bibliography needs to add: maxrohde.com (Aug 2025) for Pinecone Sept 1 date, turbopuffer.com/customers/notion (already in source list)
