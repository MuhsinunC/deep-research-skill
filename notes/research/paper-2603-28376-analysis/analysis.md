# Marco DeepResearch Paper Analysis
## Relevance to Our Deep Research Skill

**Paper:** "Marco DeepResearch: Unlocking Efficient Deep Research Agents via Verification-Centric Design"
**Authors:** Alibaba International Digital Commerce (Jia, Lan, Ren, Gu, Jiang, Wang, Xu, Luo)
**Date:** March 30, 2026
**arXiv:** 2603.28376
**GitHub:** https://github.com/AIDC-AI/Marco-DeepResearch

---

## Paper Summary

Marco DeepResearch is an 8B-scale deep research agent built on Qwen3-8B with a verification-centric framework at three levels:

1. **Verified Data Synthesis** — adversarial verification for QA training data (graph-based + agent-based)
2. **Verification-Driven Trajectory Construction** — explicit verification patterns injected into training trajectories
3. **Verifier-Guided Test-Time Scaling** — using the agent itself as a verifier at inference time

**Results:** Outperforms 8B-scale agents on BrowseComp (31.4), BrowseComp-ZH (47.1), and approaches/surpasses 30B-scale agents under 600 tool-call budget.

---

## Applicability Assessment

### NOT Applicable (Training-Time Only)

| Technique | Why Not |
|-----------|---------|
| Adversarial QA data synthesis (Section 3) | Requires training a model; we use Claude via API |
| Verification-driven trajectory construction (Section 4) | Same — training data generation |
| SFT + GRPO reinforcement learning (Section 6) | Model training pipeline |

These are about building a better base model. Our skill is a prompt-based pipeline on top of an existing model (Claude). Not applicable.

### APPLICABLE (Inference-Time Techniques)

#### 1. Verifier-Guided Test-Time Scaling (Section 5) — **HIGH RELEVANCE**

**What it is:** After producing a candidate answer, use the agent as its own verifier. If verification fails and compute budget remains, RETRY with fresh context. If multiple candidates exist, Joint Verify all and pick the best.

**Ablation result:** +12.1 average improvement across benchmarks. This was the single highest-impact technique.

**Two components:**
- **Discard All:** When degeneration signals trigger (max steps, failure to solve), discard ALL accumulated context (tool-call history, intermediate reasoning), keep only the original query + system prompt, restart fresh. Prevents error propagation along a degraded trajectory.
- **Joint Verify:** When multiple candidate answers exist, verify each independently and select the best via a final aggregation step.

**What we currently have:** Our VERIFY phase checks claims and loops back to REFINE (max 2 cycles). But we NEVER:
- Restart from scratch with completely fresh context
- Generate multiple independent research trajectories and compare
- Use a compute budget to determine how many attempts

**What this would add:** A "nuclear option" after VERIFY — if the report has too many CONTRADICTED/QUESTIONABLE claims after 2 REFINE cycles, instead of accepting the flawed report, DISCARD the accumulated state and restart RETRIEVE with different search strategies. This is fundamentally different from patching within the same trajectory.

#### 2. The "Easy to Verify, Hard to Solve" Principle (Section 4)

**Key insight:** "For needle-in-a-haystack tasks, direct solving is difficult while answer verification conditioned on the question is relatively reliable."

This validates our tool-grounded verification approach (VERIFY phase) over self-reflection. It also suggests we could make verification MORE aggressive — verify more claims, verify earlier, verify more frequently — because verification is cheap relative to the research itself.

#### 3. Independent Third-Party Verification Architecture

**What it is:** Three-role framework: main agent (decomposes problems), search sub-agent (executes searches), verifier sub-agent (validates independently). If verification fails, the step is revised and re-executed.

**What we have:** We already have information asymmetry verification (context-stripped verifiers in VERIFY). But Marco DeepResearch applies this pattern to EVERY sub-task, not just the final report — verification happens at each intermediate step, not just at the end.

---

## Implementation Recommendation

### Worth implementing: Verifier-Guided Retry (adapted from Test-Time Scaling)

**Adapt for our skill as a conditional restart in VERIFY:**

After the existing 2 REFINE→VERIFY cycles, if the report still has >3 CONTRADICTED or >5 QUESTIONABLE claims:

1. **Save the current report as "Candidate A"** (it has partial value)
2. **Discard All** — reset to the original SCOPE + PLAN, but NOT the same search queries
3. **Re-run RETRIEVE with deliberately different search strategies** (different query formulations, different sub-agent lens assignments, different source types)
4. **Run through SYNTHESIZE → VERIFY as "Candidate B"**
5. **Joint Verify:** Compare candidates A and B claim-by-claim, merge the strongest evidence from each into a final report

**Trigger condition:** Only activate for Deep/UltraDeep modes when VERIFY reports persistent failures after 2 cycles. Quick/Standard modes skip this (not worth the cost).

**Estimated cost:** Roughly doubles the RETRIEVE→VERIFY portion for reports that fail verification. For reports that pass verification normally, zero additional cost.

### Not worth implementing now:

- **Intermediate step verification** (verifying every sub-agent output, not just the final report) — Would significantly increase the number of verification sub-agents spawned. The marginal accuracy gain doesn't justify the cost for a Claude API-based skill where each sub-agent is a full API call.

---

## Key Takeaway

The paper's central thesis — that **explicit verification at every stage** is what separates good research agents from mediocre ones — strongly validates the direction we've already taken with our VERIFY phase, information asymmetry, tool-grounded verification, and inline verification principle. We're architecturally aligned with the state of the art.

The one technique we're missing is the **retry-with-fresh-context** strategy, which produced +12.1 points in their ablation. Our current pipeline patches within the same trajectory (REFINE loops); Marco DeepResearch shows that sometimes the right move is to throw away the degraded trajectory entirely and start fresh.
