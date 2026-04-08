# Phase 3 RETRIEVE — Main Agent Notes (Step 1 Parallel Searches)

**Date:** 2026-04-07
**Searches executed:** 14 (8 angles + 6 pro/con pairs)

## Initial Findings (Step 1 Burst Results)

### Verification & Accuracy

**[S1] DeepVerifier — Inference-Time Scaling of Verification (arXiv:2601.15808)**
- URL: https://arxiv.org/abs/2601.15808
- Key claim: "Inference-Time Scaling of Verification: Self-Evolving Deep Research Agents via Test-Time Rubric-Guided Verification"
- Performance: "8%-11% accuracy gains on challenging subsets of GAIA and XBench-DeepResearch when powered by capable closed-source LLMs"
- Mechanism: "agents self-improve by iteratively verifying the policy model's outputs, guided by meticulously crafted rubrics"
- Outperforms baselines: "12%-48% in meta-evaluation F1 score" over agent-as-judge and LLM judge
- **Relevance to v14:** v14 uses DRA rubric (13 sub-categories) but does NOT do test-time iterative self-evolving rubric verification. This is a candidate accuracy improvement.

**[S2] Marco DeepResearch — Verification-Centric Design (arXiv:2603.28376)**
- URL: https://arxiv.org/abs/2603.28376
- Submitted: 2026-03-30, Alibaba International Digital Commerce, Longyue Wang corresponding author
- Three-level verification: (1) QA Data Synthesis with verification mechanisms, (2) Trajectory Construction with verification-driven synthesis, (3) Test-time scaling where Marco serves as a verifier at inference time
- Outperforms 8B-scale agents on BrowseComp/BrowseComp-ZH, approaches 30B-scale agents under 600 tool call budget
- **Relevance to v14:** v14 already cites this paper for Step 6 verifier-guided retry. The "verification-driven trajectory" technique is NOT in v14 (v14 only does test-time retry, not training-time or trajectory-time verification injection).

**[S3] MiroThinker (arXiv:2511.11793 + 2603.15726)**
- URL: https://arxiv.org/abs/2511.11793 (v1.0), https://arxiv.org/pdf/2603.15726 (1.7 & H1)
- Performance: MiroThinker-1.7 = 74.0 on BrowseComp, MiroThinker-H1 = 88.2 on BrowseComp
- Architecture: 256K context window, 600 tool calls per task, modular tool interface with Linux sandbox
- Innovation: "Interactive scaling" — a third dimension of performance (alongside model size and context length). Systematically trains the model to handle deeper interactions
- Three-stage training: SFT, agentic preference optimization with DPO, RL with GRPO
- **Relevance to v14:** v14 already references MiroThinker for the inline verification principle. The "interactive scaling" trained behavior is NOT directly portable (it's a training technique), but the implication for skill design is: more iterations / more tool calls per task = better quality (suggests v14's max-turns 200 is conservative for hard topics).

### Failure Modes & Reliability

**[S4] Why Do Multi-Agent LLM Systems Fail? (arXiv:2503.13657)**
- URL: https://arxiv.org/pdf/2503.13657
- MAST (Multi-Agent System Failure Taxonomy): 14 failure modes across 7 frameworks
- MAST-Data: 1,642 annotated traces
- Findings: "42% of failures come from bad specifications, 37% from coordination breakdowns, 21% from weak verification"
- Correlation analysis: 0.17-0.32 between main categories (distinct), max 0.63 within categories (some overlap)
- **Relevance to v14:** v14 does not have a structured failure mode taxonomy at the sub-agent level. Adopting MAST as a sub-agent diagnostic vocabulary would let post-hoc analysis classify what went wrong.

**[S5] Systematic Failures in Collective Reasoning (arXiv:2505.11556)**
- URL: https://arxiv.org/html/2505.11556v3
- Key finding: "Multi-agent LLMs consistently underperform single agents with complete information, failing to surface and integrate critical unshared evidence"
- Pattern: "collective reasoning failures persist across prompting strategies and systematically worsen as the number of agents increases"
- **Relevance to v14:** This is a CRITICAL finding for v14. v14 spawns 4 lens sub-agents in Phase 3 — if they don't share information effectively, the lead agent must aggressively integrate evidence rather than treating each lens as a black box. v14 already does this somewhat (the lead reads all sub-agent outputs), but the paper suggests the pattern is fragile.

**[S6] Multi-Agent Retry Patterns (industry, 2026)**
- Source: Future AGI Substack, Maxim AI, Augment Code
- Pattern: Retry → Replan → Decompose (failure recovery escalation)
- Concrete: "maximum of 3 retries per agent per workflow execution, exponential backoff between retries, dead-letter queues for tasks that fail past the retry limit"
- AWS jitter: "exponential backoff with jitter reduces retry storms by 60-80%"
- Circuit breakers: Closed/Open/Half-Open states for agent dependencies
- **Relevance to v14:** v14 has a flat "max 1 retry per failed sub-agent" rule. The escalation pattern (Retry → Replan → Decompose) and jittered backoff are NOT in v14. v14 also lacks circuit breakers for blocked sites — currently it just gives up after one attempt.

### Hallucination Detection

**[S7] HaluGate — Token-Level Hallucination Detection (vLLM Blog, Dec 2025)**
- URL: https://blog.vllm.ai/2025/12/14/halugate.html
- Mechanism: "conditional, token-level hallucination detection pipeline that catches unsupported claims before they reach users"
- Overhead: 76-162ms (negligible vs typical 5-30s LLM generation)
- **Relevance to v14:** v14 does post-hoc claim verification (Phase 7.5 VERIFY). HaluGate is a streaming approach — not directly applicable but the principle (per-token detection) suggests a finer-grained verification at SYNTHESIZE time rather than just at VERIFY.

**[S8] Span-level verification — REFIND benchmark (SemEval 2025)**
- Mechanism: "each generated claim is matched against retrieved evidence and flagged if unsupported"
- **Relevance to v14:** v14 does claim-level verification with WebFetch. Span-level (sub-claim) is finer-grained but v14's adaptive granularity rule already cautions against over-decomposition.

**[S9] CLAP — Cross-Layer Attention Probing**
- Mechanism: "lightweight classifier on the model's own activations to flag likely hallucinations in real time"
- **Relevance to v14:** Requires model internals access — NOT applicable to v14 (Anthropic API doesn't expose activations).

**[S10] MetaQA (ACM 2025) — Metamorphic Prompt Mutations**
- Mechanism: "slight rewordings of the same prompt to reveal inconsistencies even in closed-source models"
- **Relevance to v14:** v14 has pro/con query pairs but not metamorphic mutation. This is a candidate addition — testing claim stability across prompt rewordings.

### Cost & Efficiency

**[S11] Anthropic Batch API (50% discount)**
- URL: https://www.anthropic.com/engineering/advanced-tool-use
- "processes requests asynchronously within a 24-hour window in exchange for a flat 50% discount on all input and output tokens for every Claude model without exception"
- **Relevance to v14:** v14 cannot use Batch API for the lead agent (interactive), but COULD use it for sub-agents that don't need real-time response. Sub-agent calls could batch.

**[S12] Anthropic Prompt Caching (90% savings)**
- "save up to 90% on cached tokens, cache reads at roughly 10% of standard input rate"
- **Relevance to v14:** v14 could cache the methodology.md, plan.md, sub-agent prompt templates, and SCOPE document across phases. This would dramatically reduce per-phase token cost. The hybrid model architecture already saves ~28-30% — caching would be additive.

**[S13] Advanced Tool Use Token Reduction (37%)**
- "Advanced tool use dropped token usage from 43,588 to 27,297 tokens, a 37% reduction on complex research tasks"
- **Relevance to v14:** Need to investigate what "advanced tool use" specifically means here. Likely refers to tool definitions and tool result formatting.

### Benchmarks (for evaluating skill performance)

**[S14] BrowseComp 2026 leaderboard**
- URL: https://benchlm.ai/benchmarks/browseComp
- As of 2026-04-05: GPT-5.4 Pro = 89.3%, GPT-5.3 Codex = 88%, Gemini 3 Pro Deep Think = 87%
- 90 models evaluated
- **Relevance to v14:** v14 doesn't measure itself against BrowseComp. Benchmark grounding would let future versions show measurable progress.

**[S15] Humanity's Last Exam 2026 leaderboard**
- URL: https://artificialanalysis.ai/evaluations/humanitys-last-exam
- As of 2026-03-24: GPT-5.4 = 41.6%, GPT-5.3 Codex = 39.9%, Gemini 3 Pro Preview = 37.2%
- 235 models evaluated
- 2,500 expert-vetted questions across math, sciences, humanities

### Other Surfaced Items (Lower Confidence — Need Sub-Agent Verification)

**[S16] Step-DeepResearch (arXiv:2512.20491)** — atomic capability data synthesis strategy
**[S17] ResearchRubrics benchmark (arXiv:2511.07685)** — rubrics for evaluating deep research agents
**[S18] Deep Research Agents Roadmap (arXiv:2506.18096)** — systematic examination
**[S19] PALADIN — Self-Correcting Language Model Agents to Cure Tool-Failure Cases**
**[S20] Agentic AI Architecture Survey (arXiv:2601.12560)** — taxonomies, evaluation
**[S21] Multi-Agent Architecture to Reduce Hallucinations (arXiv:2603.07728)**
**[S22] Hierarchical Multi-Agent (arXiv:2603.22651)** — "97.7% of reflexive accuracy at 60.9% of cost"
**[S23] Feynman research agent** (open-source CLI) — multi-agent: researcher, reviewer, writer, verifier
**[S24] Patronus Percival** — LLM debugger, "20+ failure modes" detection
**[S25] DeepResearcher (arXiv:2504.03160)** — RL scaling

## Gaps Identified (for sub-agents to fill)

1. **OpenInference / AgentDebug:** Not surfaced — sub-agent must search specifically
2. **Tool-MAD:** Not surfaced — sub-agent must search specifically
3. **PROClaim:** Not surfaced — sub-agent must search specifically
4. **Anthropic-specific deep research patterns** (not just pricing): need engineering/blog deep dive
5. **Cost-quality tradeoff curves with quantitative data**
6. **Open-source frameworks (not just papers)**: Smolagents, LangGraph, Crew, swarm, etc.
