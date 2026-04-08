# Deep Research Skill for Claude Code: Comprehensive Synthesis

**Date:** 2026-03-21
**Status:** Complete
**Research scope:** 6 parallel agents, 17+ web searches each, covering official Anthropic features, GitHub community, sub-agent patterns, third-party tools, community discussion, and gap analysis

---

## TL;DR

**There is no official Anthropic deep research skill for Claude Code.** However, the community has built a rich ecosystem of options. After evaluating 20+ tools and skills, here are the top 3 ranked recommendations:

| Rank | Option | What It Is | Best For |
|------|--------|------------|----------|
| **#1** | **199-biotechnologies/claude-deep-research-skill** | 8-phase SKILL.md pipeline with source scoring, triangulation, and critique loops | Most users — best balance of quality, control, and simplicity |
| **#2** | **Exa MCP Server + custom skill** | Semantic search MCP with built-in deep research agent, paired with a research orchestration skill | Users wanting the best search quality with minimal setup |
| **#3** | **altmbr/claude-research-skill** | Multi-agent orchestrator that decomposes questions into parallel workstreams with agent monitoring | Users who want maximum parallelization and speed |

---

## The Landscape

### What Claude.ai Deep Research Does (The Gold Standard)

Claude.ai's browser-based "Research" mode is a managed multi-agent pipeline:
- **Zero setup** — toggle on, ask a question, get a report
- Searches **100+ sources** over **5-45 minutes**
- Parallel sub-agents each explore different angles
- Automatic **contradiction resolution** between sources
- Inline **citations** with chain-of-thought transparency
- Available on Pro ($20/mo), Max ($100-200/mo), Team, Enterprise plans

**There is no API to access this.** It's a product-level feature locked to the web/desktop/mobile UI. The Messages API only exposes single web searches (`web_search` tool), not the orchestrated pipeline.

### What Claude Code Has Natively

- **WebSearch** — returns links only (no page content)
- **WebFetch** — fetches pages, processes with Haiku (small model)
- **Agent tool** — spawns sub-agents with isolated context
- **MCP integrations** — extensible tool servers
- **File persistence** — saves to disk, survives context compaction
- **Bash** — full local compute

**Gap:** No built-in research pipeline. WebSearch+WebFetch alone typically covers 5-15 sources. No orchestration, no triangulation, no critique loop.

**Advantage:** Persistence (git-tracked files), sub-agent control (model, tools, count), browser automation, local compute, custom pipelines, cost transparency, and development workflow integration.

---

## Top Recommendations (Ranked)

### #1: 199-biotechnologies/claude-deep-research-skill

**Why it's #1:** Most comprehensive community skill. 8-phase pipeline that closely mirrors Claude.ai's Research architecture, but with full user control and file persistence.

| Feature | Details |
|---------|---------|
| **URL** | https://github.com/199-biotechnologies/claude-deep-research-skill |
| **Type** | SKILL.md (pure instructions, no code dependencies) |
| **Pipeline** | Scope → Plan → Retrieve (parallel) → Triangulate → Outline → Synthesize → Critique → Package |
| **Source scoring** | 0-100 credibility score per source |
| **Modes** | Quick (3 phases, 2-5 min), Standard (6 phases, 5-10 min), Ultradeep (8+ phases, 20-45 min) |
| **Citations** | Automatic bibliography with inline citations |
| **Critique loop** | Built-in red-team analysis with loop-back correction |
| **Graph-of-Thoughts** | Non-linear, branching reasoning paths |
| **Install** | Copy SKILL.md to `~/.claude/skills/deep-research/` |

**Installation:**
```bash
# Clone and install the skill
git clone https://github.com/199-biotechnologies/claude-deep-research-skill.git /tmp/deep-research-skill
mkdir -p ~/.claude/skills/deep-research
cp /tmp/deep-research-skill/SKILL.md ~/.claude/skills/deep-research/SKILL.md
```

**Strengths:**
- Closes ~70-80% of the gap with Claude.ai Deep Research
- No external API keys needed (uses Claude Code's built-in WebSearch/WebFetch)
- Source credibility scoring catches low-quality sources
- Critique loop catches errors before final output
- File persistence — all findings saved incrementally
- Multiple research modes for speed/depth tradeoff

**Limitations:**
- Still limited by WebSearch/WebFetch source quality
- No Google Workspace integration
- Source volume (~20-50) lower than Claude.ai (~100+)

---

### #2: Exa MCP Server + Research Skill

**Why it's #2:** Best search quality of any available tool (81% on complex retrieval benchmarks). Exa's MCP server includes a built-in deep research agent that autonomously searches, crawls, and synthesizes. Pair with a research skill for orchestration.

| Feature | Details |
|---------|---------|
| **URL** | https://github.com/exa-labs/exa-mcp-server |
| **Type** | MCP server (npm package) |
| **Search quality** | 81% on complex retrieval (vs Tavily 71%, Brave 14.89 benchmark score) |
| **Deep research** | Built-in agentic research tool that autonomously explores and synthesizes |
| **Speed** | 2-3x faster than Tavily on average |
| **Pricing** | Free tier available; paid for production |

**Installation:**
```bash
# Add Exa MCP server to Claude Code
claude mcp add exa -e EXA_API_KEY=YOUR_KEY -- npx -y exa-mcp-server

# Optionally pair with a research skill for orchestration
# (e.g., 199-biotechnologies or altmbr)
```

**Strengths:**
- Highest search quality available
- Semantic/neural search (intent matching, not just keywords)
- Built-in deep research agent capability
- People/company research (LinkedIn data)
- Fast

**Limitations:**
- Requires API key (free tier available)
- External dependency
- Best when paired with an orchestration skill for structure

---

### #3: altmbr/claude-research-skill

**Why it's #3:** Best pure multi-agent orchestrator. Decomposes questions into parallel workstreams, monitors agents at escalating intervals, and auto-recovers stuck agents.

| Feature | Details |
|---------|---------|
| **URL** | https://github.com/altmbr/claude-research-skill |
| **Type** | SKILL.md (slash command) |
| **Pattern** | Orchestrator → parallel workstream agents → synthesis |
| **Monitoring** | Agents checked at 30s, 2min, 5min, then every 5min |
| **Recovery** | Auto-kills stuck agents, relaunches with pre-loaded data |
| **Write protocol** | Agents must save findings to disk after every search |

**Installation:**
```bash
# Install as a slash command
mkdir -p ~/.claude/commands
curl -o ~/.claude/commands/research.md https://raw.githubusercontent.com/altmbr/claude-research-skill/main/SKILL.md
# Then use: /research "Your topic here"
```

**Strengths:**
- Maximum parallelization (multiple agents searching simultaneously)
- Effective 600K+ tokens of context via parallel agents
- Agent monitoring and auto-recovery prevents stalls
- Strict write protocol prevents data loss
- Simple slash command interface

**Limitations:**
- No source credibility scoring
- No built-in critique loop
- Burns through usage quota faster due to multiple agents

---

## Other Notable Options

### For Budget/Simplicity

| Option | Description | Install |
|--------|-------------|---------|
| **willccbb/claude-deep-research** | Lightweight config + Brave Search MCP. ~20 citations per report. | `git clone` + set env vars + `./claude-dr` |
| **Brave Search MCP** | Cheapest search ($3-5/1K requests, free 2K/month). Independent index. | `claude mcp add brave-search -e BRAVE_API_KEY=KEY -- npx -y @modelcontextprotocol/server-brave-search` |

### For Maximum Depth

| Option | Description | Install |
|--------|-------------|---------|
| **GPT Researcher MCP** | Autonomous research agent as MCP server. Full reports with citations. | Python + Docker setup from `github.com/assafelovic/gptr-mcp` |
| **OpenAI Deep Research API** | `o3-deep-research` / `o4-mini-deep-research` models. Sample MCP server available. | `github.com/openai/sample-deep-research-mcp` |
| **Browser bridge to Claude.ai** | Use Chrome MCP to trigger Claude.ai's Research toggle from Claude Code. | `claude --chrome` + background agent (see bhaidar's tutorial) |

### For Academic/Scientific Research

| Option | Description | Install |
|--------|-------------|---------|
| **K-Dense-AI/claude-scientific-skills** | 170+ scientific skills, 250+ database integrations (PubMed, ChEMBL, UniProt, etc.) | `github.com/K-Dense-AI/claude-scientific-skills` |
| **Orchestra-Research/AI-Research-SKILLs** | 83 AI research lifecycle skills (literature survey → paper writing) | `npm install @orchestra-research/ai-research-skills` |
| **Imbad0202/academic-research-skills** | 13-agent research team with PRISMA methodology | `github.com/Imbad0202/academic-research-skills` |

### For Real-Time/Trend Research

| Option | Description | Install |
|--------|-------------|---------|
| **mvanhorn/last30days-skill** | Searches Reddit, X, YouTube, HN, Polymarket from last 30 days. Viral community skill. | Copy SKILL.md from GitHub |

---

## Recommended Setup for Your Use Case

Based on your usage pattern (software project research + general deep research online), here's what I'd recommend:

### The Power Stack (Best Overall)

```bash
# 1. Install the deep research skill (the orchestration brain)
git clone https://github.com/199-biotechnologies/claude-deep-research-skill.git /tmp/dr
mkdir -p ~/.claude/skills/deep-research
cp /tmp/dr/SKILL.md ~/.claude/skills/deep-research/SKILL.md

# 2. Add Exa MCP for high-quality semantic search
claude mcp add exa -e EXA_API_KEY=YOUR_KEY -- npx -y exa-mcp-server

# 3. Add Brave Search MCP for budget-friendly breadth
claude mcp add brave-search -e BRAVE_API_KEY=YOUR_KEY -- npx -y @modelcontextprotocol/server-brave-search

# 4. Add Context7 for technical documentation research
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
```

This gives you:
- **Orchestration** via the 8-phase skill pipeline
- **Quality search** via Exa (semantic, 81% accuracy)
- **Volume search** via Brave (cheap, fast, independent index)
- **Tech docs** via Context7 (current library documentation)
- **Persistence** via Claude Code's native file tools
- **Parallelization** via Claude Code's Agent tool

### Minimum Viable Setup (Quick Start)

If you want one thing and one thing only:

```bash
# Just the skill — uses Claude Code's built-in WebSearch/WebFetch
git clone https://github.com/199-biotechnologies/claude-deep-research-skill.git /tmp/dr
mkdir -p ~/.claude/skills/deep-research
cp /tmp/dr/SKILL.md ~/.claude/skills/deep-research/SKILL.md
```

No API keys needed. No MCP servers. Just the skill file that teaches Claude Code how to do structured, multi-phase research.

---

## Key Insights

### What the Community Has Learned

1. **Sub-agent parallelization is the #1 technique** — 3 parallel agents give you 600K+ effective tokens of context without polluting the main session
2. **Always save findings to files** — context compaction will lose unsaved research
3. **Claude Code's built-in web search is mediocre alone** — custom prompts and MCP servers significantly outperform the default
4. **Plan-first workflow matters** — separate research from implementation to reduce hallucination (Boris Tane pattern)
5. **Usage limits are the primary constraint** — research burns through quota faster than coding

### What Doesn't Exist Yet

- **No official Anthropic deep research skill** — despite internal use
- **No API for Claude.ai's Research mode** — the managed pipeline is web-only
- **No built-in research orchestrator in Claude Code** — must use skills or custom setup

### The Ecosystem is Massive

As of March 2026: 60,000+ published Claude Code skills, multiple marketplaces (claudecodeplugins.io, Smithery, Shyft, OpenClaw), and 8+ curated awesome lists. The signal-to-noise ratio is rough — this synthesis cuts through to the options that actually work.

---

## Sources

All findings are sourced from the 6 detailed research files in this directory:
- `01-official-anthropic.md` — Official Anthropic features and API status
- `02-github-community.md` — 20+ GitHub repos with deep research capabilities
- `03-subagent-patterns.md` — Sub-agent architecture and research patterns
- `04-thirdparty-tools.md` — MCP servers, APIs, and open-source agents
- `05-community-discussion.md` — Reddit, HN, blog, and forum recommendations
- `06-comparison-gap-analysis.md` — Feature comparison and gap analysis

Key source URLs:
- [199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill)
- [altmbr/claude-research-skill](https://github.com/altmbr/claude-research-skill)
- [Exa MCP Server](https://github.com/exa-labs/exa-mcp-server)
- [Brave Search MCP](https://github.com/brave/brave-search-mcp-server)
- [Three Ways to Build Deep Research with Claude (paddo.dev)](https://paddo.dev/blog/three-ways-deep-research-claude/)
- [Claude.ai Research Help Center](https://support.claude.com/en/articles/11088861-using-research-on-claude)
- [How to Use Claude.ai's Research Toggle Inside Claude Code (DEV Community)](https://dev.to/bhaidar/how-to-use-claudeais-research-toggle-inside-claude-code-469d)
- [Claude Code Best Practices (Anthropic)](https://code.claude.com/docs/en/best-practices)
