# Triangulation Results

## Verified Claims (3+ independent sources)

### C1: Heterogeneous tool assignment improves accuracy 6-11%
- Tool-MAD ablation: RAG+Search outperforms homogeneous by 5.5-11% (Yonsei Univ)
- PROClaim: +10pp over standard MAD (IUT Bangladesh)
- Guided MAD: four complementary mechanisms (separate group, ScienceDirect)
- **Status: VERIFIED, effective source count = 3**

### C2: Tool-grounded verification outperforms pure self-reflection
- CRITIC: +7.7 F1 on QA (Gou et al.)
- Huang et al. ICLR 2024: self-correction without external feedback fails
- CorrectBench: Reflexion-v1 without tools = -11% to -19% accuracy
- PCC: adaptive routing with search outperforms constant/no search
- **Status: VERIFIED, effective source count = 4**

### C3: Self-correction blind spot rate = 64.5%
- Primary: Self-Correction Blind Spot paper (14 models, 64.5% avg)
- Corroboration: CorrectBench shows accuracy degradation from self-correction
- Corroboration: Huang et al. confirms external feedback is required
- **Status: VERIFIED, effective source count = 1 primary + 2 corroborating**

### C4: Rubric-guided verification achieves significant improvement over uncalibrated baselines
- LLM-Rubric: 2x improvement in RMS error (ACL 2024)
- DRA taxonomy: 12-48% F1 improvement over baselines (CUHK/Tencent)
- "Rubric Is All You Need": largest gains for smaller judges (ICER 2025)
- **Status: VERIFIED with qualification — "2x" is metric-specific (RMS error), not general accuracy doubling**

### C5: Evidence freshness significantly impacts verification accuracy
- Freshness in RAG: half-life recency prior → 1.00 accuracy on latest-doc retrieval
- Temporal Fact Verification: event-level analysis improves multi-event claims
- **Status: VERIFIED, effective source count = 2**

### C6: Decompose-then-verify is dominant but context-dependent
- FactScore: <2% error vs human eval (Min et al.)
- Decomposition Dilemmas: helps weak verifiers, HURTS strong ones
- AFEV: complex claims benefit from atomic decomposition
- FaStFact: 85.3% human agreement with decomposition
- **CONTRADICTION RESOLVED:** Effectiveness depends on verifier strength. Strong verifiers handle holistic claims better; weak verifiers benefit from decomposition. Over-decomposition creates noise.

### C7: AI fact-checking can backfire
- PNAS study: -12.75% belief in true news when AI errs; +9.12% belief in false when AI uncertain
- CorrectBench: self-correction degrades accuracy by up to 18.82%
- **Status: VERIFIED, effective source count = 2 (PNAS study + CorrectBench are independent)**

## Devil's Advocate Findings

### DA1: Multi-agent debate limitations
- Homogeneous agents + majority voting = limited effectiveness
- Misclassification explanations can reinforce misconceptions
- Real-world deployment risks acknowledged even in pro-debate papers

### DA2: Tool-grounded verification limitations
- NLI-based checks struggle with reasoning, temporal claims, negation
- Operational dependencies (curated indices, update pipelines) = new attack surfaces
- LLM critiques of scientific papers poorly grounded compared to human weaknesses

### DA3: Decomposition trade-offs
- Over-decomposition shifts impact from positive to negative
- Simpler inputs: noise from decomposition outweighs benefits
- Stronger verifiers: marginal accuracy gain doesn't offset increased noise

## Contested Claims (no resolution found)

### CC1: Exact magnitude of confirmation bias effect
- Critical agent: "97.2% to 3.6% detection drop when framing as bug-free" — single study on PR review, not specifically fact-checking. May not generalize directly.
- **Status: SINGLE-SOURCE, needs qualification about domain specificity**

### CC2: Multi-agent 100% error infection rate
- Critical agent reports 5/6 frameworks achieved total error propagation
- No contradicting evidence found, but study may use adversarial conditions not representative of normal use
- **Status: SINGLE-SOURCE, adversarial test conditions**
