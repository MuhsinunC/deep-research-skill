# V2 Deep Research Skill: Further Improvement Research

**Date:** 2026-03-22
**Mode:** Standard (7 phases)
**Status:** Complete — both sub-agents finished before synthesis (completion gate honored)

---

## Executive Summary

After analyzing recent academic research on LLM self-correction, multi-agent verification patterns, and Claude Code platform failure modes, we identified 3 high-priority improvements to the current deep-research skill. The most critical finding: **our Phase 7.5 SELF-EVALUATE relies on pure self-reflection, which research shows can actually decrease accuracy.** It should be replaced with tool-grounded verification (decompose claims → retrieve evidence → verify entailment). Additionally, the skill should support Agent Teams orchestration to avoid blocking the main thread, and should add anchoring bias countermeasures.

---

## Finding 1: Replace Self-Reflection with Tool-Grounded Verification (CRITICAL)

**The problem:** Phase 7.5 (SELF-EVALUATE) asks Claude to score its own research on 5 dimensions (factual accuracy, citation accuracy, completeness, source quality, coherence). This is pure self-reflection — the model re-reads its own output and judges it.

**What research says:**
- Huang et al. found pure self-correction **decreases accuracy** — models change correct answers to wrong ones more often than they fix errors [1]
- The CRITIC framework showed that removing tool verification eliminated most accuracy gains — tool grounding is the critical factor, not self-reflection [2]
- CorrectBench found self-correction methods achieve only ~5.2% accuracy gains on complex reasoning, while hybrid approaches (tool + self) do much better [3]
- The "self-correction blind spot": models are good at correcting errors pointed out externally, but poor at catching their own reasoning mistakes [3]

**What should replace it:**
The **Decompose-Retrieve-Verify** pattern:
1. Decompose the draft report into atomic claims
2. For each major claim, use WebFetch to re-retrieve the cited source
3. Verify that the source actually supports the specific claim (entailment check)
4. Flag claims where the source doesn't match or is ambiguous

This is tool-grounded — it uses external evidence to verify, not just internal re-reading. It directly addresses the citation accuracy dimension, which self-reflection is worst at.

**Sources:**
- [1] [When Can LLMs Actually Correct Their Own Mistakes? (MIT Press/TACL)](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00713/125177/)
- [2] [CRITIC: Self-Correct with Tool-Interactive Critiquing (OpenReview)](https://openreview.net/forum?id=Sx038qxjek)
- [3] [CorrectBench: A Benchmark of Self-Correction in LLMs](https://correctbench.github.io/)

---

## Finding 2: Add Anchoring Bias Countermeasures (HIGH)

**The problem:** Agent2's research found that Claude exhibits **anchoring bias / belief perseverance** — once it forms a conclusion early in research, it maintains that conclusion even when contradictory evidence arrives later. This is a known failure mode in deep research where early search results bias the entire report.

**What research says:**
- Claude "maintains incorrect conclusions even with contradictory evidence" — documented across community research skill implementations [4]
- Authority bias compounds this: Claude fails to detect errors in authoritatively-written content [4]
- Multi-agent debate reduces errors by 4-6% by forcing models to defend positions against challenges [5]

**What should be added:**
1. **Devil's advocate step in TRIANGULATE:** After initial cross-referencing, explicitly search for evidence that CONTRADICTS the emerging thesis. Dedicate 2-3 searches specifically to finding counterevidence.
2. **Source order randomization:** Don't always process sources in the order they were retrieved — later sources get less attention due to context position bias.
3. **"Steelman the opposition" instruction:** When contradictions are found, require the report to present the strongest version of the opposing view, not a strawman.

**Sources:**
- [4] Agent2 research: `/Users/user/Documents/Muhsinun/Projects/GitHub/random-web-research/research/deep-research-skill/v2-improvement-research/agent2-failure-modes.md`
- [5] [Multi-agent debate reduces factual errors (agent1 findings)](agent1-verification-patterns.md)

---

## Finding 3: Investigate Agent Teams for Non-Blocking Orchestration (MEDIUM)

**The problem:** The deep research skill currently blocks the main thread because only the main thread can spawn sub-agents (no nesting allowed). The user wants to run research in the background while continuing other work.

**Current constraint:**
- Sub-agents cannot spawn other sub-agents (documented limitation)
- Running the full pipeline as a single background sub-agent eliminates parallel retrieval

**Potential solution: Agent Teams (experimental, Feb 2026)**
- Agent Teams enable multi-directional peer communication between agents
- If team members can independently use tools (WebSearch, WebFetch, Write), this bypasses nesting
- Architecture: Coordinator agent + Worker agents as team peers, not parent-child

**Status:** Needs dedicated research. This is an architectural change that could fundamentally improve the skill's usability without sacrificing accuracy. The key unknown is whether Agent Teams members can use tools independently.

**Sources:**
- [Claude Agent Teams Explained (Turing College)](https://www.turingcollege.com/blog/claude-agent-teams-explained)
- [Claude Code multiple agent systems guide (eesel.ai)](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide)

---

## Additional Findings

### Multi-Agent Systems Can Amplify Errors

DeepMind's "Spark to Fire" (2026) found that unstructured multi-agent networks amplify errors up to **10.31x**. Star architectures are catastrophically vulnerable — if the hub agent is corrupted, 100% of the system fails. Our current architecture (main thread as hub) has this vulnerability. Mitigation: genealogy-based governance with atomic claim screening achieves 89-94% defense success rate [6].

**Source:** [6] Agent1 research: `agent1-verification-patterns.md`

### LLM-as-Judge Has Known Limitations

LLM-as-judge works for stylistic evaluation and large quality gaps with specific criteria. It fails for expert domains (only 64-68% agreement with subject matter experts). Known biases: position bias, verbosity bias, sycophancy. **Our Phase 7.5 rubric should not be the sole quality gate** — it should be combined with tool-grounded verification [7].

**Source:** [7] Agent1 research: `agent1-verification-patterns.md`

### WebFetch Uses an Intermediate Model That Can Hallucinate

WebFetch processes page content through Claude 3.5 Haiku (a smaller model), not the main conversation model. This intermediate model can hallucinate about page content — meaning even "tool-grounded" verification via WebFetch isn't perfectly reliable. For critical claims, consider using Bash + curl for raw content retrieval [8].

**Source:** [8] Agent2 research: `agent2-failure-modes.md`

---

## Limitations

- Both sub-agents completed and were integrated before synthesis (completion gate honored)
- Source volume: 4 direct searches + 2 sub-agents (8 searches each) = ~20 total searches
- Academic findings are based on published research, not our own benchmarks
- Agent Teams investigation is marked as needing dedicated follow-up research

## Methodology

Standard mode (7 phases: SCOPE → PLAN → RETRIEVE → TRIANGULATE → OUTLINE REFINEMENT → SYNTHESIZE → PACKAGE). Phase 3 completion gate was honored — both sub-agents completed before triangulation began. Write-after-search protocol followed. Checkpoints saved at each phase boundary. Progress reported at each phase transition.

## Sources

- [CorrectBench: A Benchmark of Self-Correction in LLMs](https://correctbench.github.io/)
- [When Can LLMs Actually Correct Their Own Mistakes? (MIT Press)](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00713/125177/)
- [CRITIC: Self-Correct with Tool-Interactive Critiquing (OpenReview)](https://openreview.net/forum?id=Sx038qxjek)
- [S2R: Self-verify and Self-correct via RL (ACL)](https://aclanthology.org/2025.acl-long.1104/)
- [Context Buffer Management (claudefa.st)](https://claudefa.st/blog/guide/mechanics/context-buffer-management)
- [Context Recovery Hook (Medium)](https://medium.com/coding-nexus/context-recovery-hook-for-claude-code-never-lose-work-to-compaction-7ee56261ee8f)
- [Dev Docs Method (chudi.dev)](https://chudi.dev/blog/claude-context-management-dev-docs)
- [Claude Agent Teams Explained (Turing College)](https://www.turingcollege.com/blog/claude-agent-teams-explained)
- [Anthropic: How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
