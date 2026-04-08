# Synthesis: Cross-Cutting Insights

## Pattern 1: The Verification Paradox
Multiple independent sources confirm that naive verification can make things WORSE:
- Self-correction without external feedback degrades accuracy by 11-19% (CorrectBench)
- The strongest models (94% accuracy) have the worst self-correction rate (16.7%) — inverse relationship
- AI fact-checks decrease belief in true news by 12.75% when wrong (PNAS)
- Error location hints DECREASE correction rates by 40-56% (anchoring effect)
- Enhanced reasoning INCREASES hallucination proportionally (causal relationship)

**Synthesis**: Verification is not additive by default. It requires external grounding (tools, search, evidence) to be beneficial. Internal self-reflection is actively harmful.

## Pattern 2: Heterogeneity as Architectural Principle
Confirmed across 4+ independent studies:
- Tool-MAD: Heterogeneous tools (RAG+Search) outperform homogeneous by 5.5-11%
- PROClaim: 5 distinct courtroom roles + role-switching outperform standard MAD by 10pp
- Guided MAD: Four distinct mechanisms (guided, knowledgeable, advice, verification)
- Multi-persona debate reduces confirmation bias (arXiv 2412.04629)

**Synthesis**: Diversity of tools, roles, and perspectives is the single most consistently beneficial architectural choice. Homogeneous multi-agent systems fail to capture the ensemble advantage.

## Pattern 3: The Decomposition Spectrum
Not binary (decompose vs. don't) but a spectrum:
- Weak verifiers: Decomposition helps significantly
- Strong verifiers: Decomposition can HURT (noise > benefit)
- Complex claims: Atomic decomposition with reranking helps
- Simple claims: Overhead outweighs benefit
- Dynamic approaches (DyDecomp): +0.12 accuracy by adapting granularity

**Synthesis**: Optimal verification systems need adaptive decomposition that matches granularity to both claim complexity and verifier capability. One-size-fits-all decomposition is suboptimal.

## Pattern 4: External Grounding is Essential
Converging evidence from CRITIC (2023), Huang et al. (2024), CorrectBench (2025), PCC (2026):
- CRITIC: +7.7 F1 from tool interaction
- Huang et al.: "LLMs cannot self-correct reasoning yet" without external feedback
- PCC: Adaptive routing between internal confidence and external search optimizes cost-accuracy
- FIRE: Iterative retrieval achieves $0.63 total cost (766x cheaper than o1-preview) at True F1=0.87

**Synthesis**: The field has converged on external grounding as non-negotiable. The frontier is now about WHEN to invoke tools (adaptive routing) and WHICH tools (heterogeneous assignment), not WHETHER to use them.

## Pattern 5: Cost-Performance Frontier is Shifting
- MiniCheck (770M params) matches GPT-4 at 400x lower cost
- GPT-4o Mini: $1.01/1K evaluations with best accuracy (78x cheaper than GPT-5)
- HaluGate: 76ms P50 latency on CPU for real-time verification
- FIRE: $0.63 total cost for full fact-checking pipeline
- SAFE: 20x cheaper than human annotators, agrees with humans 72%

**Synthesis**: Production-viable verification is now economically feasible. The cost barrier has dropped by 2-3 orders of magnitude in 12 months, making verification a default component rather than an expensive add-on.

## Pattern 6: Confirmation Bias is an Architecture Problem
- Framing code as "bug-free" drops GPT-4o-mini detection from 97.2% to 3.6%
- False negative bias exceeds false positive bias by 4-114x
- LLMs inherit and amplify human cognitive biases
- Even 97% accurate systems are dismissed when contradicting beliefs

**Synthesis**: Confirmation bias cannot be solved by prompting alone. It requires architectural countermeasures: adversarial agents (Tool-MAD), courtroom-style prosecution (PROClaim), information asymmetry protocols (separate claim from context), and heterogeneous tool assignment.

## Pattern 7: Temporal Awareness as Design Requirement
- Half-life recency prior achieves 1.00 accuracy on latest-document retrieval
- Event-level temporal analysis improves multi-event claim verification
- Domain-specific decay rates vary from 7 days (news) to no decay (historical)

**Synthesis**: Verification systems in fast-moving domains MUST incorporate temporal awareness. A half-life recency prior is a simple, effective solution. Without it, systems will verify claims against stale evidence and reach wrong conclusions.

## Novel Insight: The Triple Verification Stack
The evidence suggests an optimal verification architecture combines three independent mechanisms:
1. **Structural verification** (rubric/taxonomy-guided): Catches systematic quality issues (DRA 12-48% F1 improvement)
2. **Evidential verification** (tool-grounded retrieval): Catches factual inaccuracy (CRITIC +7.7 F1)
3. **Adversarial verification** (refutation agents): Catches confirmation bias (catches errors the above two miss)

No single mechanism catches all error types. The combination provides defense-in-depth.

## Claims Accepted into Synthesis
- C1-C7 from TRIANGULATE: All passed screening (2+ independent sources for most, qualified single-source for 2)
- Rejected: None (all major claims had sufficient evidence)
- Qualified: C4 (rubric "2x improvement" is metric-specific), CC1 (confirmation bias numbers from code review, not fact-checking specifically)
