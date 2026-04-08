# Main Search Findings: Deep Research Skill Improvements

## From Anthropic's Multi-Agent Research System (Primary Source)

Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

### Key Architectural Lessons the 199-bio Skill Could Adopt

1. **CitationAgent layer** — Anthropic uses a dedicated agent that processes documents to verify claims match their sources. 199-bio has citation verification scripts but no dedicated citation-checking agent running during synthesis.

2. **Explicit scaling rules** — Anthropic embeds explicit rules: "simple queries: 1 agent with 3-10 calls; complex: 10+ subagents." 199-bio has mode tiers (Quick/Standard/Deep/UltraDeep) but no dynamic agent-count scaling based on query complexity.

3. **Source preference heuristics** — Anthropic learned to "prefer specialized tools over generic ones and authoritative sources over SEO-optimized content farms." 199-bio's source_evaluator.py exists but the methodology doesn't explicitly deprioritize SEO content farms.

4. **LLM-as-judge evaluation rubric** — Anthropic evaluates outcomes on: factual accuracy, citation accuracy, completeness, source quality, tool efficiency (0.0-1.0). 199-bio has quality gates but no post-completion LLM self-evaluation rubric.

5. **Extended thinking as planning scratchpad** — Anthropic uses Claude's extended thinking (not just for output) as a controllable planning layer. 199-bio mentions "Ultrathink" but doesn't structure how extended thinking should be used in each phase.

6. **Stateful error recovery** — Resume from checkpoints rather than restart. 199-bio has continuation protocol for long reports but no checkpoint/resume for interrupted research.

### Performance Metrics
- 90.2% improvement with multi-agent vs single-agent
- Token usage explains 80% of performance variance
- Multi-agent uses ~15x more tokens than chat

## From Community Feedback (Previously Researched)

Source: [GitHub Issue #1](https://github.com/199-biotechnologies/claude-deep-research-skill/issues/1)

1. **HTML generation path times out** — the only user report says the system falls back to truncated output and massive LLM calls that time out
2. **Dynamic skill sections appear non-functional** — "dynamic section at the end of the skill markdown that does not seem to have any mechanism to update it"

## From Claude.ai Deep Research Gap Analysis

Source: [Using Research on Claude](https://support.claude.com/en/articles/11088861-using-research-on-claude)

Features Claude.ai has that the skill lacks:
1. **Automatic contradiction resolution** — orchestrator identifies and resolves contradictions before presenting findings
2. **Google Workspace integration** — can search Gmail, Calendar, Docs
3. **Chain-of-thought transparency log** — expandable UI showing search terms, sources evaluated, reasoning
4. **Source volume (100+)** — skill typically covers 20-50 sources

## From Research Pipeline Design Literature

Source: [Three Ways to Build Deep Research with Claude](https://paddo.dev/blog/three-ways-deep-research-claude/)

1. **Claim verification across sources** — "Deep research isn't 'search and summarize' — it's claim verification across multiple sources with reasoning"
2. **Progress feedback** — "30-90 seconds of analysis feels like forever without progress feedback"
3. **Multi-provider search** — Using multiple search backends (DuckDuckGo + Semantic Scholar + Brave) for source diversity

## From Self-Evaluation Research

Sources:
- [Demystifying evals for AI agents (Anthropic)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Rubric-Based Evaluation for Agentic Systems](https://medium.com/@aiforhuman/rubric-based-evaluation-for-agentic-systems-db6cb14d8526)
- [Agent Evaluation Framework 2026 (Galileo)](https://galileo.ai/blog/agent-evaluation-framework-metrics-rubrics-benchmarks)

1. **LLM-as-judge with calibrated rubrics** — design judge prompts with explicit rubrics, few-shot examples, and structured JSON outputs requiring evidence before scoring. Target 0.80+ Spearman correlation with human expert judgment.
2. **Question-specific rubrics** — generic "is this good?" rubrics underperform vs topic-specific criteria
3. **Post-hoc calibration** — align automated scores with human judgment through calibration rounds

## From Progress Reporting Research

Sources:
- [Skill authoring best practices (Anthropic)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [altmbr/claude-research-skill](https://github.com/altmbr/claude-research-skill)

1. **Checklist-based progress** — provide a checklist that Claude copies into its response and checks off
2. **Skeleton-file progress monitoring** — create output files with section headers before launching agents, making progress trivially checkable via wc -l
3. **Progress summaries every N iterations** — print summary every 10 iterations with baseline-to-current comparison
