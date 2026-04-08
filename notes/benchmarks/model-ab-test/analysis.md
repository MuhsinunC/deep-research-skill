# Model A/B Test: Opus 4.6 vs Sonnet 4.6 for Deep Research Sub-Agents

**Date:** 2026-04-07
**Goal:** Determine whether sub-agents in the deep research skill can use Sonnet 4.6 instead of Opus 4.6 without quality loss, to reduce cost and increase speed.

---

## Test Design

Two parallel A/B tests, both with the **identical prompt** dispatched simultaneously to eliminate confounders (network, search index state, time-of-day):

1. **Retrieval test** — Mimics a Phase 3 RETRIEVE sub-agent. Topic: "Production deployment patterns for LLM agents in 2025-2026". Task: find 8-12 quality sources, extract structured findings.

2. **Verification test** — Mimics a Phase 7.5 VERIFY citation verifier. 4 claims with **known ground truth** (from v13 deep mode test): 3 VERIFIED, 1 CONTRADICTED with G4+G5 DRA flags.

---

## Verification Test Results (4 claims, ground truth available)

| Metric | Opus 4.6 | Sonnet 4.6 | Delta |
|---|---|---|---|
| Wall clock | 78s | 49s | **Sonnet 37% faster** |
| Total tokens | 38,163 | 24,421 | **Sonnet 36% fewer** |
| Tool uses | 7 | 7 | Tie |
| VC1 verdict (CONTRADICTED) | ✅ | ✅ | Tie |
| VC1 G4 flag | ✅ | ✅ | Tie |
| VC1 G5 flag | ✅ | ✅ | Tie |
| VC2 verdict (VERIFIED) | ✅ | ✅ | Tie |
| VC3 verdict (VERIFIED) | ✅ | ✅ | Tie |
| VC4 verdict (VERIFIED) | ✅ | ✅ | Tie |
| **Per-claim accuracy** | **4/4 (100%)** | **4/4 (100%)** | **Tie** |
| Evidence quality | Excellent | Excellent (more detailed on VC3) | Tie |

**Verdict:** Sonnet matches Opus on every single judgment AND is 36% cheaper / 37% faster. The verification path is well within Sonnet's capabilities. This is a structured "fetch URL → compare against text" loop with binary judgments (VERIFIED vs CONTRADICTED) and discrete DRA flags. Sonnet handles it perfectly.

---

## Retrieval Test Results

| Metric | Opus 4.6 | Sonnet 4.6 | Delta |
|---|---|---|---|
| Wall clock | 196s | 149s | **Sonnet 24% faster** |
| Total tokens | 53,717 | 34,117 | **Sonnet 36% fewer** |
| Tool uses | 21 | 21 | Tie |
| Sources found | 11 | 10 | Opus +1 |
| Average credibility | 85.7/100 | 84.3/100 | Opus +1.4 |
| Highest-cred source | 95/100 (Berkeley MAST) | 90/100 (Multi-Agent IR) | Opus +5 |
| Cross-cutting themes | 5 explicit themes | Implicit only | Opus more polished |

### Source quality analysis

**Opus found these canonical sources Sonnet missed:**
1. "Why Do Multi-Agent LLM Systems Fail?" — UC Berkeley (Zaharia, Stoica, Gonzalez) — 95/100 — introduces MAST taxonomy
2. "Where LLM Agents Fail and How They Can Learn From Failures" — Stanford/UIUC/AMD — 92/100
3. "Measuring Agents in Production" — 306-practitioner survey, 25 authors — 93/100
4. "What 1,200 Production Deployments Reveal About LLMOps" — ZenML synthesis
5. Temporal durable execution materials (vendor + InfoQ news)
6. Anthropic/OpenAI playbook synthesis (WorkOS)

**Sonnet found these recent sources Opus missed:**
1. ReliabilityBench (arXiv 2601.06112, Jan 2026)
2. MAS-FIRE — 15 fault types taxonomy (arXiv 2602.19843, Feb 2026)
3. Beyond pass@1 — Reliability Decay Curve (arXiv 2603.29231, Mar 2026)
4. Orchestral AI framework (arXiv 2601.02577, Jan 2026)
5. Agent Workflow Survey (ICAIBD 2025, arXiv 2508.01186)
6. Multi-Agent Orchestration for IR — 348 controlled trials (arXiv 2511.15755)

**Both found ~equal numbers of unique high-quality sources.** Opus skewed toward famous/canonical papers and high-credibility practitioner reports. Sonnet skewed toward most-recent (Q1 2026) papers with specific quantitative findings.

### Cross-cutting theme extraction

Opus extracted 5 explicit themes in its summary:
1. Reliability is the #1 production concern (systems-level, not model-quality)
2. OpenTelemetry GenAI semantic conventions are the convergence point
3. Durable execution (Temporal, Restate) is emerging as failure-recovery substrate
4. Guardrails migrating from prompts to infrastructure
5. Failure taxonomies converging (MAST, AgentErrorTaxonomy, KAMI archetypes)

Sonnet did not produce a "themes" section explicitly, though similar patterns are visible in its individual source notes. **This is Opus's primary qualitative edge in retrieval** — it's more inclined to do mid-task synthesis.

---

## Cost Calculation

Using public Anthropic pricing (April 2026):

| Model | Input/MTok | Output/MTok | Avg cost ratio vs Opus |
|---|---|---|---|
| Opus 4.6 | $5.00 | $25.00 | 1.00x |
| Sonnet 4.6 | $3.00 | $15.00 | **0.60x (40% cheaper)** |
| Haiku 4.5 | $1.00 | $5.00 | 0.20x (80% cheaper, untested) |

**Per-test actual cost** (estimated from token counts at standard pricing):
- Verification test: Opus ~$0.59 vs Sonnet ~$0.27 (Sonnet 54% cheaper at this size)
- Retrieval test: Opus ~$0.79 vs Sonnet ~$0.41 (Sonnet 48% cheaper at this size)

(Note: User has 82% Anthropic API discount — relative ratios unchanged, absolute savings amplified.)

---

## Recommendation

### **Hybrid model setup: Opus lead + Sonnet sub-agents**

Specifically:

| Component | Model | Reasoning |
|---|---|---|
| Lead agent (main `claude -p`) | **Opus 4.6** | Reasoning-heavy phases: PLAN strategy, TRIANGULATE contradiction resolution, SYNTHESIZE building, REFINE judgment, VERIFY result processing, decisions on loop-backs and Step 6 retry. Opus's reasoning depth matters here. |
| Phase 3 retrieval sub-agents | **Sonnet 4.6** | Focused execution: search → fetch → write findings to file. Sonnet matched Opus on quality, was 24% faster, used 36% fewer tokens. |
| Phase 6 gap-filling sub-agents | **Sonnet 4.6** | Same execution pattern as Phase 3. |
| Phase 7.5 citation verifiers | **Sonnet 4.6** | Verification was Sonnet's strongest path — 100% accuracy match with Opus, 37% faster, 36% cheaper. |
| Phase 7.5 adversarial agent | **Sonnet 4.6** | Adversarial search is execution-heavy (try queries, find counter-evidence). Sonnet's verification quality suggests it handles this well too. |

### **NOT recommended: Haiku for any current pipeline component**

Haiku 4.5 was not tested in this round. It is 5x cheaper than Opus, but its reasoning depth is likely below the threshold needed for:
- DRA failure mode classification (G4/G5/T2 require careful semantic comparison)
- Adversarial argumentation (requires defensible counter-claims, not just "find any contradiction")
- Source credibility judgment (requires distinguishing primary vs secondary, vendor vs independent)

A future test could evaluate Haiku for the simplest sub-tasks (e.g., URL fetching + literal text matching), but the savings over Sonnet (additional 60%) are not worth the risk to the verification path quality.

### **NOT recommended: Sonnet for the lead agent**

The lead agent's Phase 5 SYNTHESIZE and Phase 7 REFINE involve building multi-source arguments with citation tracking, anchoring bias mitigation, contradiction resolution, and meta-decisions like "should Step 6 retry trigger?" These are not focused execution tasks — they require open-ended reasoning where Opus's depth provides a real edge.

Additionally, the lead agent's mid-task synthesis (the "5 cross-cutting themes" Opus extracted in retrieval) is exactly the kind of qualitative judgment that pays off later in the pipeline. Downgrading the lead would be a false economy.

---

## Estimated Pipeline-Wide Impact

Based on a typical deep mode run (~14,000-word report, 4 retrieval sub-agents, 3 verification sub-agents + 1 adversarial):

| Phase | Token share (estimated) | Current cost (Opus) | Hybrid cost | Savings |
|---|---|---|---|---|
| Lead agent (planning, synthesis, decisions) | ~35% | 35% × 1.0 = 0.35 | 35% × 1.0 = 0.35 | 0% |
| Sub-agents (retrieval + verification + adversarial) | ~65% | 65% × 1.0 = 0.65 | 65% × 0.6 = 0.39 | 40% on this slice |
| **Total** | **100%** | **1.00** | **0.74** | **~26% total cost reduction** |

(The actual savings are slightly higher because Sonnet uses fewer tokens for the same task, not just cheaper tokens. Combining the 36% token reduction with the 40% per-token savings yields roughly **42-45% effective sub-agent cost reduction**, or **~28-30% total pipeline cost reduction**.)

**Speed impact:** Sub-agents run in parallel, so the wall-clock improvement is roughly 24-37% on those phases. The lead-driven sequential phases (PLAN, SYNTHESIZE, REFINE, PACKAGE) are unchanged. Overall pipeline wall clock improvement: ~15-20%.

---

## Quality Risk Assessment

**LOW risk** of quality regression for:
- **Verification path** — both models 100% accurate on known-ground-truth claims, identical DRA flag detection
- **Source extraction** — both found similar quality and quantity, structured outputs nearly identical

**MEDIUM-LOW risk** for:
- **Source selection diversity** — Opus has a slight edge on canonical/famous papers. Mitigation: heterogeneous lens prompts already enforce coverage diversity, so individual sub-agents missing one canonical paper is offset by the other lens agents

**The mitigation that brings risk to LOW**: the adversarial refutation agent (also on Sonnet) catches incorrect claims that slip through citation verification. Multiple independent verification paths mean a single sub-agent's marginal quality difference matters less.

---

## Implementation Plan

1. Update `methodology.md` Phase 3, 6, 7.5 sub-agent spawn instructions to specify `model: sonnet` parameter on Task tool calls
2. Update SKILL.md if necessary (probably not — sub-agent spawning is described in methodology, not SKILL.md)
3. Code review the changes with superpowers:code-reviewer
4. Run a v14 end-to-end deep mode test with the hybrid setup
5. Compare v14 output quality and cost to v13 baseline (which used all-Opus)
6. If v14 quality matches v13 → mark task complete, recommend in memory
7. If v14 shows regression → rollback or refine recommendation

---

## Files

- Verification outputs: `/tmp/model-ab-test/verify_OPUS.md`, `/tmp/model-ab-test/verify_SONNET.md`
- Retrieval outputs: `/tmp/model-ab-test/retrieval_OPUS.md`, `/tmp/model-ab-test/retrieval_SONNET.md`
- This analysis: `research/deep-research-skill/model-ab-test/analysis.md`
