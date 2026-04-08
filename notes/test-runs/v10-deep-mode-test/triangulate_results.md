# Phase 4 TRIANGULATE — Cross-Reference Results
## Written: 2026-04-01

## Claim Verification Summary

| # | Claim | Effective Sources | Status | Notes |
|---|-------|-------------------|--------|-------|
| 1 | MiroThinker-H1 = 88.2 on BrowseComp | 1 (self-reported) | Single-source | MiroMindAI only; no independent reproduction |
| 2 | DeepAgent = 91.69% on GAIA | 1 (questionable) | QUESTIONABLE | Contradicts GAIA leaderboard showing 44.8% top. Likely different eval methodology |
| 3 | DRA Failure Taxonomy: 5 categories, 13 sub-categories | 2 | VERIFIED | Original paper + citing paper |
| 4 | CATTS: 9.1% improvement, 2.3x efficiency | 1 | Single-source | Self-reported, no reproduction |
| 5 | Tool-MAD: 35.5% over standard MAD | 1 | Single-source | Self-reported |
| 6 | SMTL: 70.7% reasoning reduction, BrowseComp 48.6% | 1 | Single-source, plausible | Results in plausible range |
| 7 | Rubric verification: 8-11% gains on GAIA/XBench | 1 + artifact | Single-source with artifact | DeepVerifier-4K released |
| 8 | BATS: pushes Pareto frontier | 1 | Single-source, high-cred | Google Research |
| 9 | WebWeaver: SOTA on DeepResearch Bench | 1 | Single-source | Sep 2025, borderline validity |
| 10 | Tongyi: BrowseComp 43.4, first open-source on par | 1 + model | Single-source with model | Apache 2.0, model on HuggingFace |

## Contradiction Analysis

### Contradiction 1: DeepAgent 91.69% on GAIA vs GAIA leaderboard 44.8%
- **Source A:** 36kr article claims 91.69% "on the GAIA list"
- **Source B:** GAIA leaderboard (huggingface.co/spaces/gaia-benchmark/leaderboard) shows 44.8% top
- **Resolution:** The 91.69% likely refers to a DIFFERENT benchmark/evaluation (possibly BrowseComp-Plus or a custom evaluation), NOT the standard GAIA benchmark. The 36kr article is a Chinese tech media outlet that may have conflated benchmarks. **DeepAgent's GAIA score is unverified.**
- **Status: CONTESTED** — will report with caveat

### Contradiction 2: "More agents = better" vs diminishing returns research
- **Source A:** Multiple framework papers claim multi-agent approaches improve accuracy
- **Source B:** Google Research paper shows diminishing returns beyond 45% single-agent accuracy, 2-6x efficiency penalty in tool-heavy environments
- **Resolution:** Both are correct but context-dependent. Multi-agent debate helps MOST when single-agent accuracy is below ~45%. Above that threshold, overhead dominates. For research agents (where single-agent accuracy is typically above 45%), the benefit is narrower — concentrated on specific verification tasks, not general research.
- **Status: RESOLVED** — both positions valid, context-dependent

### Contradiction 3: BrowseComp as valid benchmark vs criticism
- **Source A:** Many papers report BrowseComp as primary benchmark
- **Source B:** BrowseComp-Plus paper (NeurIPS 2025) explicitly criticizes BrowseComp for fairness/reproducibility issues
- **Resolution:** BrowseComp is useful for relative comparison but has documented issues: dynamic web APIs, non-reproducibility, doesn't isolate retrieval from reasoning. BrowseComp-Plus addresses some issues with fixed corpus. Papers using BrowseComp should be read with this limitation in mind.
- **Status: RESOLVED** — BrowseComp useful but limited; BrowseComp-Plus is more reliable

## Devil's Advocate Findings

### Finding 1: Benchmark Gaming Concerns
- DeepResearch Bench uses LLM-as-a-judge grading → subject to systematic biases
- DeepResearch Bench II (Feb 2026) uses 9,430 fine-grained binary rubrics — more robust but still LLM-graded
- Self-reported benchmark results without independent reproduction are common across ALL frameworks

### Finding 2: Multi-Agent Cost Reality
- 3 agents × 5 rounds = 101× token cost for 50%→98% accuracy improvement (arithmetic task)
- 4 agents × 5 rounds = 90× token cost for 76%→88% accuracy (GSM8K)
- Diminishing returns beyond 5 agents; 2 rounds capture most gains
- **Critical for prompt-based skill:** Adding multi-agent debate for EVERY claim would be cost-prohibitive. Should be selective.

### Finding 3: Single-Agent Ceiling
- Research shows ~45% accuracy threshold where adding agents helps
- Above this threshold, single-agent optimization (better prompting, better verification) is more cost-effective
- Implication: For a Claude-based skill (already strong single-agent), focus on verification quality over agent quantity

## Independence Assessment
- Most benchmark claims are single-source (self-reported by framework authors)
- Only DRA Failure Taxonomy has truly independent verification (2 separate papers)
- The field lacks independent benchmark reproduction — a systemic weakness
- Open-source release of models/code provides some verification (code can be inspected)

## Consensus Areas
1. **Verification-centric approaches improve accuracy** — confirmed across Marco, Inference-Time Scaling, DRA taxonomy
2. **BrowseComp has fairness issues** — acknowledged by both users and critics
3. **Multi-agent approaches have diminishing returns at scale** — consistent finding
4. **Process rewards outperform outcome rewards for search agents** — multiple papers agree
5. **Context management is a bottleneck for long research** — Self-Manager, ReSum, WebWeaver all address this

## Debate Areas
1. **Search breadth vs reasoning depth** — SMTL says more search, less thinking; Think2 says more structured thinking. Context-dependent.
2. **Self-verification vs independent verification** — Marco uses self-as-verifier; CRITIC research says self-reflection can decrease accuracy. Context-dependent (self-verification works better with tool grounding).
3. **Training-based vs prompting-based** — Most SOTA results use training. Prompt-based approaches are competitive but lower ceiling.
