# Community Discussion: Deep Research in Claude Code

> Research date: 2026-03-21
> Sources: Reddit, Hacker News, GitHub, blogs, Substacks, dev forums

---

## Table of Contents

1. [Reddit Discussions](#1-reddit-discussions)
2. [Blog Posts & Tutorials](#2-blog-posts--tutorials)
3. [Power User Setups & Recommendations](#3-power-user-setups--recommendations)
4. [Common Complaints](#4-common-complaints)
5. [Publicly Shared Deep Research Skills/Plugins](#5-publicly-shared-deep-research-skillsplugins)
6. [Workarounds for Deep Research-Like Behavior](#6-workarounds-for-deep-research-like-behavior)
7. [Hacker News Discussion Highlights](#7-hacker-news-discussion-highlights)
8. [Key Takeaways](#8-key-takeaways)

---

## 1. Reddit Discussions

### General Sentiment

Reddit's developer community views Claude Code as the best AI for code quality (67% win rate in blind tests per community surveys), but with significant friction around usage limits and sustained research sessions.

> "Claude Code leads in speed of response compared to alternatives, with developers preferring it for small tasks and fast iteration pair coding experiences rather than waiting for deep autonomous runs."
> -- [AI Tool Discovery: Claude Code Reddit roundup (2026)](https://www.aitooldiscovery.com/guides/claude-code-reddit)

### Usage Limits as Primary Pain Point

An August 28, 2025 change adding weekly caps triggered the widely-cited "Claude Is Dead" Reddit thread. Developers paying $200/month on Claude Max reported hitting weekly caps before end of working week.

> "Max 20 user: Usage limits make sustained research work inaccessible -- data-backed feedback from community"
> -- [GitHub Issue #27310 on anthropics/claude-code](https://github.com/anthropics/claude-code/issues/27310)

The Register reported on these complaints:

> "Claude devs complain about surprise usage limits"
> -- [The Register (Jan 5, 2026)](https://www.theregister.com/2026/01/05/claude_devs_usage_limits/)

### Reddit Workarounds

Community members share strategies including:
- Pairing Claude with Perplexity for real-time research
- Switching between free and paid tiers strategically
- Using the Anthropic API directly for programmatic access without interface rate limits
- Running tmux panes with Claude Code and Codex CLI simultaneously

Source: [AI Tool Discovery: Claude AI Reddit (2026)](https://www.aitooldiscovery.com/guides/claude-reddit)

### Claude Code vs Codex on Reddit

> "Claude Code has better code quality (67% win rate in blind tests) but hits usage limits too quickly to be a daily driver."
> -- [DEV Community: Claude Code vs Codex 2026 -- What 500+ Reddit Developers Really Think](https://dev.to/_46ea277e677b888e0cd13/claude-code-vs-codex-2026-what-500-reddit-developers-really-think-31pb)

---

## 2. Blog Posts & Tutorials

### "Three Ways to Build Deep Research with Claude" (paddo.dev)

The most comprehensive guide, presenting three approaches from simple to production:

1. **DIY Recursive Spawning** (~20 lines of shell, zero dependencies)
   - Key trick: `--allowedTools "Bash(claude:*)"` lets Claude spawn more Claude instances
2. **MCP Servers** (plug-and-play tools)
   - Claude-Deep-Research integrates DuckDuckGo and Semantic Scholar
   - Structured prompts guide through: initial exploration -> preliminary synthesis -> follow-up research -> comprehensive analysis -> citations (APA style)
3. **Full Production Apps** (multi-source verification, progress UX, cost tracking)
   - Core pipeline: scrape sources -> extract claims -> verify across databases -> score confidence -> surface discrepancies

> "Deep research isn't 'search and summarize' -- it's claim verification across multiple sources with reasoning. Claude's extended thinking makes this actually work."

> "30-90 seconds of analysis feels like forever without progress feedback."

Source: [paddo.dev - Three Ways to Build Deep Research with Claude](https://paddo.dev/blog/three-ways-deep-research-claude/)

### Boris Tane's Research-Plan-Implement Workflow

Boris Tane (creator of Claude Code) published his personal workflow:

> "Never let Claude write code until you've reviewed and approved a written plan. This separation of planning and execution is the single most important thing I do."

**Research Phase**: Ask Claude to thoroughly understand the relevant codebase. Always write findings into a persistent markdown file, never just a verbal summary. Use words like "deeply," "in great details," "intricacies," and "go through everything" to prevent the model from skimming.

**Planning Phase**: Detailed implementation plan in a separate markdown file including approach explanation, code snippets, file paths, and trade-offs.

**Implementation**: Let Claude run uninterrupted once every decision has been made.

Source: [Boris Tane - How I Use Claude Code](https://boristane.com/blog/how-i-use-claude-code/)

### "How to Use Claude.ai's Research Toggle Inside Claude Code" (DEV Community)

A creative workaround: use Claude Code to control Chrome, open Claude.ai, toggle the Research feature, run a query, and extract results.

> "Research takes 5 to 30 minutes, so if run as a normal task, Claude Code would block and wait, wasting your time. The solution is background agents -- spawning a dedicated agent that runs the Research automation while your main Claude Code session continues working on other tasks."

Prerequisites: Claude in Chrome Extension, Claude Code v2.0.60+, paid Claude subscription, Chrome running.

Usage: `claude --chrome`, then "Spawn a background agent to research via Claude.ai: 'Your query here'" and Ctrl+Shift+B if not automatically backgrounded.

Source: [DEV Community - Bhaidar (Jan 27, 2026)](https://dev.to/bhaidar/how-to-use-claudeais-research-toggle-inside-claude-code-469d)

### "How I Turned Claude Code Into My Personal AI Agent Operating System" (AI Maker Substack)

Author pointed Claude Code at a research folder and it read everything, connected dots, suggested article structures based on past posts, and caught contradictions between sources.

> "All of my newsletter work lives inside Claude Code -- it knows my audience, which posts performed well, my other projects, priorities, and writing voice."

Three key advantages: agentic context understanding, terminal speed, and direct file access.

Source: [AI Maker Substack](https://aimaker.substack.com/p/how-i-turned-claude-code-into-personal-ai-agent-operating-system-for-writing-research-complete-guide)

### "I Built 5 Research Subagents using Claude Code" (GenAI Unplugged Substack)

Detailed guide to building specialized research subagents:

> "Research agents work like hiring 5 specialized assistants who work in your office. Each agent uses the same directory structure, same MCP tools, and same context profiles but different specializations."

> "Context profiles teach agents about your business before they research. Don't skip this step."

Foundation setup takes ~25 minutes. Demonstrates structured, relevant results in ~15 minutes vs 90 minutes of manual research.

Source: [GenAI Unplugged Substack](https://genaiunplugged.substack.com/p/build-research-ai-agents-automation-claude-code)

### Automate Lead Research with Claude Code (MarketBetter)

Step-by-step tutorial for prospect research automation:

Pipeline: New Lead -> Basic Enrichment (company size, industry) -> ICP Scoring (1-100) -> Deep Research (if score > 70, full prospect brief) -> Routing (hot/warm/cold).

> "This used to take 10-15 minutes per prospect. Now it takes seconds."

Source: [MarketBetter Blog](https://marketbetter.ai/blog/automate-lead-research-claude-code/)

### Claude Code for Empirical Research (Scott Cunningham / causalinf Substack)

Multi-part series on using Claude Code for quantitative social science research:
- Diff-in-diff and synthetic control methodologies
- Event study graphs, parallel trends tests
- Text reclassification with gpt4o-mini
- Developing conjectures and chasing them down efficiently

Source: [causalinf Substack](https://causalinf.substack.com/p/claude-code-part-12-how-i-use-claude)

### GSD (Spec-Driven Development) Workflow

> "GSD is currently among the most well-known tools for this approach, with 23k stars on GitHub as of March 2026. The system relies entirely on native Claude Code features -- no proprietary runtime or framework -- just ~50 Markdown files, a Node.js CLI helper, and a few hooks orchestrating a complete software development cycle."

Source: [codecentric.de - GSD for Claude Code: A Deep Dive](https://www.codecentric.de/en/knowledge-hub/blog/the-anatomy-of-claude-code-workflows-turning-slash-commands-into-an-ai-development-system)

---

## 3. Power User Setups & Recommendations

### Anthropic's Official Best Practices

From Anthropic's own documentation:

> "Delegate research with 'use subagents to investigate X,' allowing them to explore in separate contexts while keeping your main conversation clean for implementation. Context is a fundamental constraint and subagents are one of the most powerful tools available."

> "Separate research and planning from implementation to avoid solving the wrong problem. Use Plan Mode to separate exploration from execution."

Source: [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)

### Subagent-Based Research Architecture

Power users on Reddit run Claude Code instances in tmux panes as parallel subagents:

> "Subagents explore their areas independently with Claude synthesizing the findings. Tasks are ideal for parallelization when each sub-agent can complete its work without needing results from the others."

Practical example: one subagent analyzing frontend, another digging into backend APIs, a third reviewing database schema -- all at once.

For research specifically: launching a subagent to conduct searches keeps all search results in the subagent's context window. The subagent reports back a summary, keeping the main agent's context clean.

> "For a complex task, three parallel subagents give you an effective 600K tokens of total context without polluting the main session."

Sources:
- [Tim Dietrich - Claude Code Parallel Subagents](https://timdietrich.me/blog/claude-code-parallel-subagents/)
- [RichSnapp - Context Management with Subagents](https://www.richsnapp.com/article/2025/10-05-context-management-with-subagents-in-claude-code)
- [Claude Code Docs - Sub-agents](https://code.claude.com/docs/en/sub-agents)

### CLAUDE.md Configuration for Research

Key tips from community guides:

- Run `/init` to generate a starter CLAUDE.md, then refine over time
- Keep it concise -- ask "Would removing this cause Claude to make mistakes?" for each line
- Customize compaction behavior: "When compacting, always preserve the full list of modified files and any test commands"
- Use Plan Mode (Shift+Tab twice) -- Claude becomes a research and analysis machine that cannot change files
- Use `/btw` for quick questions that don't enter conversation history
- Use `/compact` with custom preservation instructions after completing each research phase

Sources:
- [UX Planet - CLAUDE.md Best Practices (Mar 2026)](https://uxplanet.org/claude-md-best-practices-1ef4f861ce7c)
- [ykdojo/claude-code-tips on GitHub](https://github.com/ykdojo/claude-code-tips)

---

## 4. Common Complaints

### Usage Limits

The single biggest complaint. Developers on Max ($200/month) report:
- Hitting weekly caps before end of working week
- Research-intensive tasks burning through quota faster than coding tasks
- No clear visibility into remaining quota

Source: [GitHub Issue #27310](https://github.com/anthropics/claude-code/issues/27310), [The Register (Jan 2026)](https://www.theregister.com/2026/01/05/claude_devs_usage_limits/)

### Context Window Degradation

> "Most developers working with Claude Code don't monitor their context window until outputs start contradicting earlier decisions or hallucinating file paths that don't exist."

> "The effective context window feels much smaller than the official limit."

Symptoms of degradation:
- Repetition of previous suggestions
- Drift from established patterns
- Hallucination uptick: wrong function names, file paths, invented APIs
- Claude claiming tasks are complete when they aren't

Source: [SitePoint - Claude Code Context Management Guide](https://www.sitepoint.com/claude-code-context-management/)

### Hallucination After Compaction

> "Claude Code Plan Mode consistently creates plans that will cause Claude Code to hallucinate during implementation, with implementation hallucinations occurring 100% of the time after a mid-task context compaction."

Source: [GitHub Issue #20051 - Plan Mode Hallucination Prevention](https://github.com/anthropics/claude-code/issues/20051)

### Subagent Reliability

Mixed opinions from Hacker News:

> "The main problem I have is that the agents just aren't used. For example, I set up a code reviewer agent today and then asked Claude to review code, and it went off and did it by itself without using the agent."

> Some called subagents "more theatre than utility."

Known issue: subagent output files are lost after context compaction if the agents completed before compaction occurred.

Sources:
- [HN: Claude Code introduces specialized sub-agents](https://news.ycombinator.com/item?id=44686726)
- [GitHub Issue #23821 - Subagent output files lost after context compaction](https://github.com/anthropics/claude-code/issues/23821)

### Perceived Quality Degradation

> "Multiple threads describe projects that 'previously worked smoothly now resemble a standard chat conversation.'"

Anthropic responded on their subreddit acknowledging bugs that hurt performance for some users while denying intentionally degrading the model.

Source: [UCStrategies - Why Developers Are Suddenly Turning Against Claude Code](https://ucstrategies.com/news/why-developers-are-suddenly-turning-against-claude-code/)

---

## 5. Publicly Shared Deep Research Skills/Plugins

### Enterprise-Grade: 199-biotechnologies/claude-deep-research-skill

8-phase pipeline: **Scope -> Plan -> Retrieve -> Triangulate -> Synthesize -> Critique -> Refine -> Package**

Key features:
- 15-30 sources retrieved per research task with parallel agent spawning
- Cross-verifies 3+ sources per claim (Triangulate phase)
- 9-check structure validator, DOI/URL/hallucination checker
- Source credibility scoring and citation tracking
- Multiple modes: standard (6 phases, 5-10 min), quick (3 phases, 2-5 min), ultradeep (8+ phases, 20-45 min)
- No dependencies beyond Python standard library for basic usage

Updated as recently as March 2026.

Source: [GitHub - 199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill)

### Structured: Weizhena/Deep-Research-skills

Two-phase research: outline generation and deep investigation. Human-in-the-loop design.

Supports: academic research, technical research, market research, due diligence.

Includes a web researcher agent that excels at creative search strategies, thorough investigation, and compilation from multiple sources.

Source: [GitHub - Weizhena/Deep-Research-skills](https://github.com/Weizhena/Deep-Research-skills)

### Config-Based: willccbb/claude-deep-research

Lightweight config for Claude Code using MCP tools (brave-search, e2b, filesystem). Set environment variables in the `claude-dr` script and run `./claude-dr`. Treats all user queries as research requests.

Source: [GitHub - willccbb/claude-deep-research](https://github.com/willccbb/claude-deep-research)

### Deep Research with ChatGPT Prompt Generation: AnkitClassicVision/Claude-Code-Deep-Research

7-phase deep research playbook inspired by OpenAI and Google Gemini. Uses ChatGPT to generate optimized prompts, then Claude Code to execute research with Graph-of-Thoughts integration.

> "Large Language Models excel at single queries but struggle with complex, multi-step research requiring iterative querying, source verification, and citations. Anthropic's Claude Code can achieve the same results, provided the right instructions."

Source: [GitHub - AnkitClassicVision/Claude-Code-Deep-Research](https://github.com/AnkitClassicVision/Claude-Code-Deep-Research)

### Autonomous ML Research: wanshuiyin/Auto-claude-code-research-in-sleep (ARIS)

Lightweight Markdown-only skills for autonomous ML research. Cross-model collaboration: Claude Code executes, external LLM reviews adversarially.

> "In a real overnight 4-round run on an ML research project, the loop autonomously ran 20+ GPU experiments, rewrote the paper's narrative framing, and killed claims that didn't hold up -- all without human intervention."

Source: [GitHub - wanshuiyin/Auto-claude-code-research-in-sleep](https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep)

### Real-Time Research: mvanhorn/last30days-skill

Searches Reddit, X, YouTube, Hacker News, Polymarket, and web from last 30 days. Results scored by engagement metrics (upvotes, likes, reposts), deduplicated, synthesized.

> Greg Isenberg: "I sat down with Matt Van Horn and watched him turn Claude Code into a real-time research engine with his /last30days Claude Code skill. He 'fixes' Claude Code in 30 seconds."

Takes 2-8 minutes. Up to 10 sources searched in parallel.

Source: [GitHub - mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)

### Reddit Fetch: ykdojo/claude-code-tips (reddit-fetch skill)

Fetches Reddit content using Gemini CLI or curl JSON API fallback. Useful when Reddit returns 403/blocked errors.

Source: [GitHub - ykdojo/claude-code-tips/skills/reddit-fetch](https://github.com/ykdojo/claude-code-tips/blob/main/skills/reddit-fetch/SKILL.md)

### Custom Deep Research Prompt (GitHub Gist)

XInTheDark's custom prompt for Claude projects. Recommended setup:
- Create a "Deep Research" project
- Add prompt as custom instructions
- Enable MCP servers: Brave Search, Fetch, optionally Puppeteer
- Use Sonnet 4 with Thinking

> "Do not enable Claude's built-in web search feature. The quality difference is significant -- the built-in system prompt limits Claude to only running one or a few searches and contains counterproductive instructions."

Source: [GitHub Gist - XInTheDark](https://gist.github.com/XInTheDark/6fef041cb3edfe054b507813a03cb47d)

### MCP Server: mcherukara/Claude-Deep-Research

MCP server integrating DuckDuckGo and Semantic Scholar. Provides structured prompts guiding through initial exploration, preliminary synthesis, follow-up research, comprehensive analysis, and proper APA citations.

Source: [GitHub - mcherukara/Claude-Deep-Research](https://github.com/mcherukara/Claude-Deep-Research)

### Curated Skill Collections

| Collection | Size | Link |
|-----------|------|------|
| alirezarezvani/claude-skills | 192+ skills | [GitHub](https://github.com/alirezarezvani/claude-skills) |
| jeremylongshore/claude-code-plugins-plus-skills | 346 plugins, 1900+ skills | [GitHub](https://github.com/jeremylongshore/claude-code-plugins-plus-skills) |
| K-Dense-AI/claude-scientific-skills | 170+ scientific skills | [GitHub](https://github.com/K-Dense-AI/claude-scientific-skills) |
| ComposioHQ/awesome-claude-skills | Curated list | [GitHub](https://github.com/ComposioHQ/awesome-claude-skills) |
| travisvn/awesome-claude-skills | Curated list | [GitHub](https://github.com/travisvn/awesome-claude-skills) |
| hesreallyhim/awesome-claude-code | Skills, hooks, commands, agents | [GitHub](https://github.com/hesreallyhim/awesome-claude-code) |
| Orchestra-Research/AI-Research-SKILLs | AI research skills library | [GitHub](https://github.com/Orchestra-Research/AI-Research-SKILLs) |

---

## 6. Workarounds for Deep Research-Like Behavior

### Approach 1: Recursive Claude Spawning

The simplest approach -- ~20 lines of shell:

Key flag: `--allowedTools "Bash(claude:*)"` lets Claude spawn more Claude instances. Each sub-instance explores a research branch and reports back.

Source: [paddo.dev](https://paddo.dev/blog/three-ways-deep-research-claude/)

### Approach 2: Background Agent via Claude.ai Research Toggle

Use Claude Code to control Chrome, open Claude.ai, toggle Research, and extract results as a background agent. Main session continues working while research runs.

Source: [DEV Community - Bhaidar](https://dev.to/bhaidar/how-to-use-claudeais-research-toggle-inside-claude-code-469d)

### Approach 3: Pairing with External Tools

- **Claude + Perplexity**: Use Perplexity for real-time web research, pipe results to Claude for analysis
- **Claude + Gemini CLI**: Hybrid workflows spawning Gemini from Claude Code for second opinions
- **Claude + DuckDuckGo/Semantic Scholar MCP**: Add search capabilities directly via MCP servers

Sources:
- [paddo.dev - Hybrid AI Workflows: Spawning Gemini from Claude Code](https://paddo.dev/blog/gemini-claude-code-hybrid-workflow/)
- [AI Tool Discovery](https://www.aitooldiscovery.com/guides/claude-reddit)

### Approach 4: Spec-Driven / Plan-First Workflow

Stop hallucinations by separating research from implementation:

1. Write all findings to persistent markdown files
2. Use Plan Mode (Shift+Tab twice) for analysis without file changes
3. Review plan before allowing implementation
4. Use `/compact` with custom preservation instructions between phases

> "How I stopped Claude Code from hallucinating on Day 4 (The 'Spec-Driven' Workflow)"

Source: [DEV Community - samhath03](https://dev.to/samhath03/how-i-stopped-claude-code-from-hallucinating-on-day-4-the-spec-driven-workflow-3lim)

### Approach 5: Subagent Parallelization for Research

Spawn multiple subagents for independent research tasks. Each operates in its own context window (effectively multiplying available context by number of agents).

> "Three parallel subagents give you an effective 600K tokens of total context without polluting the main session."

Caveat: subagent output files lost after context compaction if agents completed before compaction.

Sources:
- [HN: How to use Claude Code subagents to parallelize development](https://news.ycombinator.com/item?id=45181577)
- [claudefa.st - Sub-Agent Best Practices](https://claudefa.st/blog/guide/agents/sub-agent-best-practices)

### Approach 6: Open-Source Agent Orchestrators

Multi-agent orchestrators for handling long-running research tasks, built because single agents tend to stall, loop, or produce degraded output over time.

Source: [HN: 20+ Claude Code agents coordinating on real work](https://news.ycombinator.com/item?id=46990733)

---

## 7. Hacker News Discussion Highlights

### Key Threads

| Thread | Date | Topic |
|--------|------|-------|
| [Claude Code introduces specialized sub-agents](https://news.ycombinator.com/item?id=44686726) | Aug 2025 | Sub-agent capabilities |
| [How to use Claude Code subagents to parallelize development](https://news.ycombinator.com/item?id=45181577) | Sep 2025 | Parallel research patterns |
| [Claude Code Subagents -- 100 domain-expert helpers](https://news.ycombinator.com/item?id=45066110) | Aug 2025 | Specialized subagent collections |
| [How I use every Claude Code feature](https://news.ycombinator.com/item?id=45786738) | Nov 2025 | Feature walkthrough |
| [Deep Agents](https://news.ycombinator.com/item?id=44761299) | Aug 2025 | Long-horizon agent execution |
| [Claude Code as my co-founder and COO](https://news.ycombinator.com/item?id=46511225) | Jan 2026 | Research, content, monitoring squads |
| [20+ Claude Code agents coordinating on real work](https://news.ycombinator.com/item?id=46990733) | Feb 2026 | Multi-agent orchestration |
| [Turn Claude Code into proactive, autonomous 24/7 AI agents](https://news.ycombinator.com/item?id=47054100) | Feb 2026 | Competitive research while idle |
| [iherb-CLI -- agent-optimized CLI for AI-driven supplement research](https://news.ycombinator.com/item?id=47026434) | Feb 2026 | Research skill as CLI |
| [Claude Code: An agentic cleanroom analysis](https://news.ycombinator.com/item?id=44153053) | Jun 2025 | Technical architecture analysis |

### Community Sentiment on HN

- Generally more technically skeptical than Reddit
- Praise for subagent architecture and extensibility
- Concerns about subagent reliability ("more theatre than utility" -- one commenter)
- Interest in multi-agent orchestration for research tasks that exceed single-agent capability
- Recognition that Claude Code among agents that "execute tasks over longer time horizons particularly well"

---

## 8. Key Takeaways

### What Works

1. **Subagent parallelization** is the most recommended approach for research -- isolates context, multiplies effective context window
2. **Plan-first workflows** (Boris Tane pattern) dramatically reduce hallucination and wasted tokens
3. **Persistent markdown files** for research findings survive context compaction
4. **MCP server integration** (Brave Search, DuckDuckGo, Semantic Scholar) adds research capabilities without workflow changes
5. **The /last30days skill** is the most viral community skill for real-time research

### What Does Not Work Well

1. **Long single-session research** -- context degradation and hallucination after compaction
2. **Built-in web search alone** -- community consensus is that custom prompts significantly outperform the default
3. **Relying on subagent output persistence** -- files lost after compaction
4. **Ignoring usage limits** -- research tasks burn through quota faster than coding

### The State of the Ecosystem (March 2026)

The community has built a rich ecosystem of deep research tools around Claude Code, ranging from 20-line shell scripts to enterprise 8-phase pipelines. The gap between Claude Code's built-in capabilities and what power users achieve with custom skills is enormous. The most active areas of development are:

- Multi-agent research orchestration
- Cross-model verification (Claude + Gemini, Claude + GPT)
- Real-time community intelligence gathering (Reddit, X, HN)
- Autonomous overnight research loops (ARIS pattern)

The clear trend: Claude Code is being used less as a coding tool and more as a general-purpose research agent OS, with coding being just one of many capabilities layered on top.
