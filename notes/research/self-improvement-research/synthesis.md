# Potential Improvements to the Deep Research Skill

**Research date:** 2026-03-22
**Mode:** Standard (6 phases)
**Subject:** 199-biotechnologies/claude-deep-research-skill improvement opportunities

---

## Executive Summary

After analyzing Anthropic's internal multi-agent research system architecture, competing community skills, platform constraints, and the single user report, we identified 8 actionable improvements ranked by expected impact on research quality. The highest-impact improvements are: (1) adding an LLM-as-judge self-evaluation phase, (2) implementing progress reporting, and (3) adding source preference heuristics to deprioritize SEO content farms. These three changes address the most significant quality gaps between the 199-bio skill and Anthropic's production research system.

---

## Ranked Improvements

### 1. Add LLM-as-Judge Self-Evaluation Phase (HIGH IMPACT)

**What:** After Phase 7 (REFINE) and before Phase 8 (PACKAGE), add a self-evaluation step where the model scores its own research output against a structured rubric.

**Evidence:**
- Anthropic's multi-agent research system uses an explicit rubric scoring factual accuracy, citation accuracy, completeness, source quality, and tool efficiency on a 0.0-1.0 scale [1]
- Research on rubric-based evaluation shows calibrated LLM-as-judge approaches targeting 0.80+ Spearman correlation with human judgment are the current best practice [2]
- The 199-bio skill currently has quality gates (quality-gates.md) but these are structural checks (section presence, word counts, citation formatting) — not semantic quality evaluation [3]

**Implementation:** Add a Phase 7.5 (SELF-EVALUATE) that scores the draft report on 5 dimensions:
- Factual accuracy: Are claims supported by cited evidence?
- Citation accuracy: Do citations actually support the claims they're attached to?
- Completeness: Are all aspects of the research question addressed?
- Source quality: Is the source mix diverse and authoritative?
- Coherence: Does the argument flow logically?

If any dimension scores below 0.6, loop back to the relevant phase (e.g., low source quality → back to RETRIEVE for targeted gap-filling).

**Sources:**
- [1] [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/engineering/multi-agent-research-system)
- [2] [Agent Evaluation Framework 2026 (Galileo)](https://galileo.ai/blog/agent-evaluation-framework-metrics-rubrics-benchmarks)
- [3] [199-bio quality-gates.md](https://github.com/199-biotechnologies/claude-deep-research-skill/blob/main/reference/quality-gates.md)

---

### 2. Implement Progress Reporting (HIGH IMPACT)

**What:** Add structured progress feedback during long research sessions so the user knows what's happening.

**Evidence:**
- paddo.dev notes that "30-90 seconds of analysis feels like forever without progress feedback" [4]
- Anthropic's skill authoring best practices recommend providing checklists that Claude copies into its response and checks off as it progresses [5]
- altmbr/claude-research-skill uses skeleton files with section headers pre-created, making progress trivially checkable [6]
- The 199-bio skill currently produces no user-visible progress between invocation and final report

**Implementation:** At the start of each phase, output a brief progress line:
```
[Phase 2/6: PLAN] Creating research strategy...
[Phase 3/6: RETRIEVE] Launching 8 parallel searches + 3 sub-agents...
[Phase 3/6: RETRIEVE] 15/20 sources gathered, avg credibility 72/100...
[Phase 4/6: TRIANGULATE] Cross-referencing 15 sources, 23 claims to verify...
```

This is zero-cost (a single text output per phase) and dramatically improves the user experience during 5-45 minute research sessions.

**Sources:**
- [4] [Three Ways to Build Deep Research with Claude (paddo.dev)](https://paddo.dev/blog/three-ways-deep-research-claude/)
- [5] [Skill authoring best practices (Anthropic)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [6] [altmbr/claude-research-skill](https://github.com/altmbr/claude-research-skill)

---

### 3. Add Source Preference Heuristics (HIGH IMPACT)

**What:** Explicitly deprioritize SEO-optimized content farms and prioritize authoritative sources in the RETRIEVE phase.

**Evidence:**
- Anthropic's engineering team learned this the hard way: "Early agents gravitated toward highly-ranked but low-quality sources, prompting refinement of source quality criteria in prompts" [1]
- Their solution: "prefer specialized tools over generic ones and authoritative sources over SEO-optimized content farms" [1]
- The 199-bio skill has source_evaluator.py for credibility scoring but the methodology.md doesn't explicitly list source types to deprioritize

**Implementation:** Add to the RETRIEVE phase instructions:
```
Source preference order:
1. Primary sources (official docs, research papers, government data)
2. Authoritative analysis (peer-reviewed journals, recognized industry analysts)
3. Quality journalism (established publications with editorial standards)
4. Technical blogs from verified practitioners
DEPRIORITIZE:
- SEO-optimized aggregator sites ("Top 10 best X" listicles)
- AI-generated content farms
- Sites with excessive ads/popups (proxy for low editorial standards)
- Undated content with no author attribution
```

**Sources:**
- [1] [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/engineering/multi-agent-research-system)

---

### 4. Add Explicit Contradiction Resolution (MEDIUM IMPACT)

**What:** Add a dedicated step in Phase 4 (TRIANGULATE) for identifying and resolving contradictions between sources, rather than just flagging them.

**Evidence:**
- Claude.ai's Research mode automatically resolves contradictions before presenting findings [7]
- Anthropic's orchestrator "identifies themes, constructing narrative, and integrating citations" with explicit contradiction handling [8]
- The 199-bio skill's TRIANGULATE phase says to "flag contradictions or uncertainties" but doesn't specify how to RESOLVE them

**Implementation:** Add to TRIANGULATE instructions:
```
For each contradiction found:
1. Identify the specific claim where sources disagree
2. Assess which source is more authoritative (using credibility scores)
3. Check recency — more recent data may supersede older claims
4. Look for a third source that breaks the tie
5. In the report, present the resolved position with reasoning:
   "Source A claims X, while Source B claims Y. Based on [reasoning], X appears more accurate because [evidence]."
6. If unresolvable, present both positions with equal weight and label as "contested"
```

**Sources:**
- [7] [Using Research on Claude (Help Center)](https://support.claude.com/en/articles/11088861-using-research-on-claude)
- [8] [How OpenAI, Gemini, and Claude Use Agents to Power Deep Research (ByteByteGo)](https://blog.bytebytego.com/p/how-openai-gemini-and-claude-use)

---

### 5. Fix HTML Generation Timeout (MEDIUM IMPACT)

**What:** Fix the known timeout issue where HTML report generation produces truncated output.

**Evidence:**
- The only user to file an issue (rba100) reports: "the system falls back to 'the output was truncated, I'll just write the html' and then a massive LLM call that often times out" [9]
- This is related to Claude Code's 32K output token limit and bash 2-minute timeout [10]

**Implementation:** The report-assembly.md already mentions progressive file assembly. The fix should:
1. Generate HTML section-by-section (not in one massive call)
2. Use the md_to_html.py script with chunked input
3. Add a timeout guard: if HTML generation exceeds 90 seconds, save markdown-only and note that HTML was skipped

**Sources:**
- [9] [GitHub Issue #1](https://github.com/199-biotechnologies/claude-deep-research-skill/issues/1)
- [10] [GitHub Issue #5615 — Claude Code bash timeout](https://github.com/anthropics/claude-code/issues/5615)

---

### 6. Add Checkpoint/Resume for Interrupted Research (MEDIUM IMPACT)

**What:** Save research state to disk at phase boundaries so interrupted research can resume.

**Evidence:**
- Anthropic's production system uses "stateful error recovery: resume from checkpoints rather than restart entirely" [1]
- Claude Code's context compaction is known to destroy in-progress skill state, causing hallucination "100% of the time" after mid-task compaction [11]
- The 199-bio skill has no checkpoint mechanism — if context is compacted mid-research, all progress is lost

**Implementation:** At the end of each phase, save a checkpoint file:
```json
{
  "phase_completed": 4,
  "mode": "standard",
  "topic": "quantum computing",
  "sources_gathered": 18,
  "claims_verified": 23,
  "output_file": "/path/to/report.md",
  "next_phase": "OUTLINE_REFINEMENT"
}
```
On invocation, check for an existing checkpoint and offer to resume.

**Sources:**
- [1] [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/engineering/multi-agent-research-system)
- [11] [GitHub Issue #20051 — Plan Mode hallucination after compaction](https://github.com/anthropics/claude-code/issues/20051)

---

### 7. Add Dynamic Agent Count Scaling (LOW IMPACT)

**What:** Automatically adjust the number of sub-agents based on query complexity, rather than always spawning 3-5.

**Evidence:**
- Anthropic embeds explicit scaling rules: "simple queries: 1 agent with 3-10 calls; complex: 10+ subagents" [1]
- The 199-bio skill always spawns 3-5 sub-agents in RETRIEVE regardless of complexity
- Multi-agent systems use ~15x more tokens — unnecessary parallelism wastes quota [1]

**Implementation:** Add to RETRIEVE:
```
Agent scaling:
- Quick mode: 0 sub-agents (main agent only, 5-8 searches)
- Standard mode: 2-3 sub-agents (based on topic breadth)
- Deep mode: 3-5 sub-agents
- UltraDeep mode: 5-8 sub-agents
```

**Sources:**
- [1] [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/engineering/multi-agent-research-system)

---

### 8. Add Structured Extended Thinking Usage (LOW IMPACT)

**What:** Specify when and how to use Claude's extended thinking feature at each phase, rather than mentioning it generically.

**Evidence:**
- Anthropic's team uses "extended thinking as a controllable planning scratchpad" — it's not just for output, it's a structured planning layer [1]
- The 199-bio methodology mentions "Ultrathink Application" in Phase 1 and "Ultrathink Integration" in Phase 5 but doesn't specify HOW to use extended thinking

**Implementation:** Add specific extended thinking prompts per phase:
- Phase 1 (SCOPE): "Think through 3 alternative framings of this question before choosing"
- Phase 3 (RETRIEVE): "After parallel search results arrive, think through which angles are underrepresented"
- Phase 4 (TRIANGULATE): "Think through potential contradictions before checking sources"
- Phase 6 (CRITIQUE): "Think through what a skeptical expert would challenge about these findings"

**Sources:**
- [1] [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/engineering/multi-agent-research-system)

---

## Limitations

- This analysis is based on 10+ web searches, one primary source fetch (Anthropic engineering blog), and two parallel sub-agents. Source volume is lower than a full deep research session.
- The only direct user feedback comes from a single GitHub issue — the skill lacks sufficient community validation for empirical quality assessment.
- Competing skill architectures were analyzed based on documentation, not hands-on testing.
- Anthropic's internal system operates at a scale (100+ sources, dedicated infrastructure) that a SKILL.md file cannot replicate.

## Methodology

Research conducted using the 199-biotechnologies/claude-deep-research-skill in standard mode (6 phases: SCOPE → PLAN → RETRIEVE → TRIANGULATE → OUTLINE REFINEMENT → SYNTHESIZE → PACKAGE). The operational reliability protocol (write-after-search, stuck-agent detection, 403 handling) was active during retrieval.

## Sources

- [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Three Ways to Build Deep Research with Claude (paddo.dev)](https://paddo.dev/blog/three-ways-deep-research-claude/)
- [Using Research on Claude (Help Center)](https://support.claude.com/en/articles/11088861-using-research-on-claude)
- [Demystifying evals for AI agents (Anthropic)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Agent Evaluation Framework 2026 (Galileo)](https://galileo.ai/blog/agent-evaluation-framework-metrics-rubrics-benchmarks)
- [Rubric-Based Evaluation for Agentic Systems (Medium)](https://medium.com/@aiforhuman/rubric-based-evaluation-for-agentic-systems-db6cb14d8526)
- [Skill authoring best practices (Anthropic)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [GitHub Issue #1 — 199-bio](https://github.com/199-biotechnologies/claude-deep-research-skill/issues/1)
- [GitHub Issue #20051 — Plan Mode hallucination after compaction](https://github.com/anthropics/claude-code/issues/20051)
- [GitHub Issue #5615 — Claude Code bash timeout](https://github.com/anthropics/claude-code/issues/5615)
- [How OpenAI, Gemini, and Claude Use Agents to Power Deep Research (ByteByteGo)](https://blog.bytebytego.com/p/how-openai-gemini-and-claude-use)
- [altmbr/claude-research-skill](https://github.com/altmbr/claude-research-skill)
- [199-bio quality-gates.md](https://github.com/199-biotechnologies/claude-deep-research-skill/blob/main/reference/quality-gates.md)
