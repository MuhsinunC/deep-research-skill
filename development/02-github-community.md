# Community-Built Deep Research Skills, Plugins, and Tools for Claude Code CLI

**Research date:** 2026-03-21
**Scope:** GitHub repos providing deep research capabilities for Claude Code

---

## Table of Contents

1. [Dedicated Deep Research Skills](#1-dedicated-deep-research-skills)
2. [Multi-Agent Research Orchestrators](#2-multi-agent-research-orchestrators)
3. [Scientific and Academic Research Skills](#3-scientific-and-academic-research-skills)
4. [MCP Servers for Research](#4-mcp-servers-for-research)
5. [General Research Skill Collections](#5-general-research-skill-collections)
6. [Awesome Lists and Curated Directories](#6-awesome-lists-and-curated-directories)
7. [Ecosystem Overview](#7-ecosystem-overview)
8. [Sources Searched](#8-sources-searched)

---

## 1. Dedicated Deep Research Skills

These repos provide standalone SKILL.md files or configurations specifically designed to give Claude Code deep research capabilities.

### 199-biotechnologies/claude-deep-research-skill

- **URL:** https://github.com/199-biotechnologies/claude-deep-research-skill
- **Description:** Enterprise-grade deep research skill for Claude Code with 8-phase pipeline, source credibility scoring, and automated validation. Claims to outperform OpenAI, Gemini, and Claude Desktop in quality and verification.
- **Key features:**
  - 8-phase pipeline: Scope -> Plan -> Retrieve (parallel search + agents) -> Triangulate -> Outline Refinement -> Synthesize -> Critique (with loop-back) -> Refine -> Package
  - Multiple research modes (depth vs speed tradeoffs)
  - Source credibility scoring (0-100 scale per source)
  - Graph-of-Thoughts (non-linear, branching reasoning)
  - Automatic citation management and bibliography generation
  - Built-in critique phase with red-team analysis
  - Local file integration (searches codebases and docs)
  - Code execution for analyses and validations
- **Rating:** Silver-tier on Shyft platform (6,550 activity units)
- **License:** Not specified in search results

### Weizhena/Deep-Research-skills

- **URL:** https://github.com/Weizhena/Deep-Research-skills
- **Description:** Structured deep research skill for Claude Code, OpenCode, and Codex with human-in-the-loop control.
- **Key features:**
  - Two-phase research: outline generation (extensible) and deep investigation
  - Human-in-the-loop design (user can guide research direction)
  - Compatible with Claude Code, OpenCode, and Codex
- **Notable:** One of the simpler, more approachable deep research skills

### AnkitClassicVision/Claude-Code-Deep-Research

- **URL:** https://github.com/AnkitClassicVision/Claude-Code-Deep-Research
- **Description:** A Claude Code deep researcher that claims to work better than current deep research models. Supplies instructions and a CLAUDE.md system prompt for Claude Code to conduct deep research.
- **Key features:**
  - 7-phase pipeline: Scope -> Plan -> Retrieve -> Triangulate -> Draft -> Critique -> Package
  - Graph-of-Thoughts integration (branching/merging reasoning paths)
  - CLAUDE.md system prompt for autonomous tool selection and citation embedding
  - ChatGPT-based structured prompt generation (reduces confusion by 50% in tests)
  - MCP automation hooks via `.template_mcp.json`
  - Derived from OpenAI and Gemini deep-research playbooks
- **Demo:** Interactive demo at https://claude-code-deep-research.vercel.app/

### willccbb/claude-deep-research

- **URL:** https://github.com/willccbb/claude-deep-research
- **Description:** Claude Deep Research config for Claude Code. Simple configuration that adds MCP servers (Brave Search, E2B) and generates markdown reports with ~20 citations.
- **Key features:**
  - MCP server integration (brave-search, e2b, filesystem)
  - Parallel search queries for breadth + depth
  - Reports saved as Markdown in `reports/` directory
  - Lightweight approach -- a config rather than a full skill framework
- **Setup:** Set environment variables (BRAVE_API_KEY, E2B_API_KEY) and run `./claude-dr`

### daymade/claude-code-skills (deep-research)

- **URL:** https://github.com/daymade/claude-code-skills/blob/main/deep-research/SKILL.md
- **Description:** A SKILL.md for generating format-controlled research reports with evidence tracking, citations, and iterative review.
- **Key features:**
  - Strict report template and section formatting
  - Evidence tracking and citations
  - Iterative review process
  - Designed for research reports, literature reviews, market/industry analysis, competitive landscapes, policy/technical briefs

### glebis/claude-skills (deep-research)

- **URL:** https://github.com/glebis/claude-skills/tree/main/deep-research
- **Description:** Deep research skill that leverages OpenAI's Deep Research API (o4-mini-deep-research model) for comprehensive internet-enabled research.
- **Key features:**
  - Uses OpenAI's o4-mini-deep-research model under the hood
  - Automated prompt enhancement through clarifying questions
  - Saves research parameters before execution
  - Execution takes 10-20 minutes (synchronous/blocking)
  - Prompt quality assessment (flags prompts < 15 words or too generic)
- **Notable:** Different approach -- uses OpenAI's API rather than Claude's own capabilities
- **Listed on:** Smithery (https://smithery.ai/skills/glebis/deep-research)

---

## 2. Multi-Agent Research Orchestrators

These repos implement multi-agent patterns where multiple Claude Code instances work in parallel on research tasks.

### altmbr/claude-research-skill

- **URL:** https://github.com/altmbr/claude-research-skill
- **Description:** Multi-agent research orchestrator for Claude Code -- decomposes any question into parallel workstreams, monitors agents, and synthesizes results.
- **Key features:**
  - Uses Claude Code's built-in Task tool for parallel subagents
  - Strict write protocol (agents must save findings to disk after every search)
  - Agents work through sections in order, citing every claim with inline source URLs
  - Orchestrator monitors agents at escalating intervals (30s, 2min, 5min, then every 5min)
  - Automatic agent recovery: kills stuck agents and relaunches with pre-loaded data
- **Installation:** Copy `SKILL.md` to `~/.claude/commands/research.md`, then use `/research` in Claude Code

### gtrusler/claude-code-heavy

- **URL:** https://github.com/gtrusler/claude-code-heavy
- **Description:** Multi-agent research orchestration using Claude Code, inspired by make-it-heavy and Grok's heavy mode.
- **Key features:**
  - Intelligent planning (Claude analyzes query and creates optimal strategy)
  - Parallel research with 2-8 deployed agents
  - Dynamic adaptation of questions and roles per query
  - Smart synthesis of multi-agent findings
  - Interactive setup script
  - Timestamped output directories with orchestration prompt, research plan, and individual findings

### weorbitant/claude-code-agentic-research-orchestrator

- **URL:** https://github.com/weorbitant/claude-code-agentic-research-orchestrator
- **Description:** Multi-AI research orchestrator enabling multi-AI perspectives, consensus-based decision making, and specialized expertise for development tasks, code reviews, data analysis, and research.
- **Key features:**
  - Coordinates Gemini and Copilot agents alongside Claude
  - Specialized agents for code review, data analysis, experiment design
  - 50+ reusable context templates
  - Multi-model support (Claude Sonnet 4.5, GPT-5, Gemini 2.5 Pro)
  - Works with Claude Code's Bash and Task tools

### wshobson/agents

- **URL:** https://github.com/wshobson/agents
- **Description:** Intelligent automation and multi-agent orchestration for Claude Code.
- **Key features:**
  - Specialized research agents: research-analyst, search-specialist, trend-analyst, competitive-analyst, market-researcher, data-researcher
  - Full agent orchestration framework

### ruvnet/ruflo

- **URL:** https://github.com/ruvnet/ruflo
- **Description:** Agent orchestration platform for Claude. Deploy intelligent multi-agent swarms, coordinate autonomous workflows, and build conversational AI systems.
- **Key features:**
  - Enterprise-grade architecture
  - Distributed swarm intelligence
  - RAG integration
  - Native Claude Code / Codex integration

---

## 3. Scientific and Academic Research Skills

### K-Dense-AI/claude-scientific-skills

- **URL:** https://github.com/K-Dense-AI/claude-scientific-skills
- **Stars:** ~15.3k
- **Description:** 170+ ready-to-use scientific and research skills for Claude Code. Covers cancer genomics, drug-target binding, molecular dynamics, RNA velocity, geospatial science, time series forecasting, economic data, and more.
- **Key features:**
  - 250+ database/data source integrations (PubMed, ChEMBL, UniProt, COSMIC, ClinicalTrials.gov, SEC EDGAR, Alpha Vantage)
  - Multi-database packages: BioServices (~40 bioinformatics + 30+ PSICQUIC), BioPython (38 NCBI sub-databases via Entrez), gget (20+ genomics databases)
  - Compatible with Cursor, Claude Code, Codex
  - Enterprise-ready with commercial support
- **Notable:** By far the largest scientific skills collection for Claude Code

### Imbad0202/academic-research-skills

- **URL:** https://github.com/Imbad0202/academic-research-skills
- **Description:** Academic Research Skills for Claude Code: research -> write -> review -> revise -> finalize.
- **Key features:**
  - 13-agent research team
  - Socratic guided mode
  - Systematic review / PRISMA methodology for deep research
  - 12-agent paper writing system with LaTeX output
  - Full academic pipeline: research -> write -> review -> revise -> finalize

### Orchestra-Research/AI-Research-SKILLs

- **URL:** https://github.com/Orchestra-Research/AI-Research-SKILLs
- **Description:** Comprehensive open-source library of 83 AI research and engineering skills. Turn any Claude Code/Codex/Gemini agent into an AI research agent.
- **Key features:**
  - End-to-end lifecycle: literature survey -> idea generation -> experiment execution -> paper writing
  - Both research orchestration (autoresearch, ideation, paper writing) and engineering skills (training, evaluation, deployment)
  - Numbered categories representing the AI research lifecycle
  - Quality > Quantity philosophy (200-500 lines per skill, following Anthropic best practices)
  - npm install: `@orchestra-research/ai-research-skills`
  - Synced to Orchestra Research platform for one-click installation

---

## 4. MCP Servers for Research

### mcherukara/Claude-Deep-Research

- **URL:** https://github.com/mcherukara/Claude-Deep-Research
- **Stars:** ~46
- **Description:** An MCP (Model Context Protocol) server that enables comprehensive research capabilities for Claude and other MCP-compatible AI assistants.
- **Key features:**
  - Unified research tool (single interface for web + academic search)
  - Multi-source integration (web pages + scholarly articles)
  - Content extraction from web pages
  - Academic source discovery via Semantic Scholar
  - DuckDuckGo web search integration
  - Multi-stage workflows: exploration -> synthesis -> analysis with citations

### rohunvora/x-research-skill

- **URL:** https://github.com/rohunvora/x-research-skill
- **Description:** General-purpose agentic research over X/Twitter. Decomposes research questions into targeted searches, iteratively refines, follows threads, and synthesizes into sourced briefings.
- **Key features:**
  - X/Twitter-specific research
  - Question decomposition
  - Thread following
  - Sourced briefing synthesis

---

## 5. General Research Skill Collections

### affaan-m/everything-claude-code

- **URL:** https://github.com/affaan-m/everything-claude-code
- **Description:** The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond.
- **Key features:**
  - 997 internal tests passing
  - Includes market-research, article-writing, content-engine skills
  - AgentShield integration (102 security rules, 912 tests)
  - Selective install architecture
  - Cross-harness parity (Claude Code, Cursor, OpenCode, Codex)
  - Evolved over 10+ months of daily use

### alirezarezvani/claude-skills

- **URL:** https://github.com/alirezarezvani/claude-skills
- **Description:** 192+ Claude Code skills & agent plugins spanning engineering, marketing, product, compliance, and C-level advisory.
- **Key features:**
  - 205 production-ready skills across 9 domains
  - 268 Python automation tools, 384 reference guides
  - 16 agents, 19 slash commands
  - Pre-configured agent personas with curated skill loadouts
  - Works natively as Claude Code plugins, Codex skills, Gemini CLI skills
  - Includes competitive-intelligence and UX research skills

### jeremylongshore/claude-code-plugins-plus-skills

- **URL:** https://github.com/jeremylongshore/claude-code-plugins-plus-skills
- **Description:** 340 plugins + 1,367 agent skills for Claude Code. Open-source marketplace with CCPI package manager.
- **Key features:**
  - CCPI package manager (search by keyword, install specific packs)
  - 7 MCP plugins providing 21 tools
  - 346 plugins, 1,900+ skills, 16 community contributors
  - Validated, graded, and ready to install
  - Browse at claudecodeplugins.io

---

## 6. Awesome Lists and Curated Directories

### hesreallyhim/awesome-claude-code

- **URL:** https://github.com/hesreallyhim/awesome-claude-code
- **Stars:** ~21.6k
- **Forks:** ~1.2k
- **Description:** A curated list of awesome skills, hooks, slash-commands, agent orchestrators, applications, and plugins for Claude Code by Anthropic.
- **Research tools listed:** Yes -- includes deep research skills, agent orchestrators, and research workflows
- **License:** CC0-1.0
- **Notable:** The most comprehensive and popular awesome list for Claude Code

### ComposioHQ/awesome-claude-skills

- **URL:** https://github.com/ComposioHQ/awesome-claude-skills
- **Description:** A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows.
- **Research tools listed:** deep-research (Gemini-powered), manus (multi-source research), paper-search (OpenAlex, 250M+ works)

### travisvn/awesome-claude-skills

- **URL:** https://github.com/travisvn/awesome-claude-skills
- **Description:** A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows -- particularly Claude Code.
- **Research tools listed:** Similar research skill coverage to ComposioHQ

### BehiSecc/awesome-claude-skills

- **URL:** https://github.com/BehiSecc/awesome-claude-skills
- **Description:** A curated list of Claude Skills.
- **Research tools listed:** Includes deep-research and scientific skills

### ComposioHQ/awesome-claude-plugins

- **URL:** https://github.com/ComposioHQ/awesome-claude-plugins
- **Description:** A curated list of plugins that let you extend Claude Code with custom commands, agents, hooks, and MCP servers through the plugin system.

### jmanhype/awesome-claude-code

- **URL:** https://github.com/jmanhype/awesome-claude-code
- **Description:** Awesome list of Claude Code plugins, MCP servers, editor integrations, and resources.

### VoltAgent/awesome-claude-code-subagents

- **URL:** https://github.com/VoltAgent/awesome-claude-code-subagents
- **Stars:** ~83.2k (likely inflated or aggregated count)
- **Description:** 100+ specialized Claude Code subagents covering a wide range of development use cases. Markdown files with YAML frontmatter.

### VoltAgent/awesome-agent-skills

- **URL:** https://github.com/VoltAgent/awesome-agent-skills
- **Description:** 500+ agent skills from official dev teams and the community. Compatible with Codex, Antigravity, Gemini CLI, Cursor, and others.

### VoltAgent/awesome-openclaw-skills

- **URL:** https://github.com/VoltAgent/awesome-openclaw-skills
- **Description:** 5,400+ skills filtered and categorized from the official OpenClaw Skills Registry.
- **Research section:** Has a dedicated "search-and-research" category

### quemsah/awesome-claude-plugins

- **URL:** https://github.com/quemsah/awesome-claude-plugins
- **Description:** Automated collection of Claude Code plugin adoption metrics across GitHub repositories using n8n workflows.

---

## 7. Ecosystem Overview

### Key Findings

1. **The ecosystem is massive and growing fast.** As of March 2026, there are 60,000+ published Claude Code skills, with the signal-to-noise ratio described as "rough" by community testers. Multiple awesome lists and marketplaces exist to help navigate this.

2. **Deep research skills are a well-established category.** There are at least 6-8 dedicated deep research SKILL.md implementations on GitHub, ranging from simple configs (willccbb) to enterprise-grade 8-phase pipelines (199-biotechnologies).

3. **Multi-agent research orchestration is a growing pattern.** Several repos (altmbr, gtrusler, weorbitant) implement parallel agent research where a lead agent decomposes questions and dispatches subagents. This pattern became much more viable after Anthropic released Agent Teams in Feb 2026.

4. **Scientific/academic research is well-covered.** K-Dense-AI's 170+ scientific skills with 250+ database integrations is the standout, plus Orchestra-Research's 83 AI research lifecycle skills and Imbad0202's 13-agent academic research team.

5. **Multiple approaches exist:**
   - **Pure SKILL.md** (instructions only, no code): 199-biotechnologies, Weizhena, daymade, altmbr
   - **CLAUDE.md configs** (system prompt + MCP setup): willccbb, AnkitClassicVision
   - **MCP servers** (code-based tool servers): mcherukara
   - **Full frameworks** (agents + skills + hooks): affaan-m, alirezarezvani
   - **External API delegation** (uses OpenAI or Gemini for actual research): glebis, openclaw agent-deep-research

6. **OpenClaw is a parallel skill registry.** The openclaw/skills repo and OpenClaw platform host thousands of skills including research-cog (ranked #1 on DeepResearch Bench, Feb 2026) and agent-deep-research (Gemini-powered).

### Comparison of Top Deep Research Skills

| Repo | Approach | Pipeline | Multi-Agent | Source Scoring | Citations | External API |
|------|----------|----------|-------------|----------------|-----------|--------------|
| 199-biotechnologies | SKILL.md | 8-phase | Yes (retrieve phase) | Yes (0-100) | Auto | No |
| Weizhena | SKILL.md | 2-phase | No | No | Manual | No |
| AnkitClassicVision | CLAUDE.md | 7-phase | No | No | Auto | No |
| willccbb | Config + MCP | Simple | No | No | Yes (~20) | Brave Search |
| altmbr | SKILL.md | Orchestrator | Yes (parallel workstreams) | No | Inline URLs | No |
| glebis | SKILL.md | Delegated | No | No | Yes | OpenAI o4-mini |
| daymade | SKILL.md | Report-focused | No | No | Yes | No |
| gtrusler | Script | Orchestrator | Yes (2-8 agents) | No | No | No |

### Marketplaces and Directories

| Platform | URL | Content |
|----------|-----|---------|
| Awesome Claude Code | https://github.com/hesreallyhim/awesome-claude-code | 21.6k stars, curated list |
| Claude Code Plugins Marketplace | https://claudecodeplugins.io | 346 plugins, 1,900+ skills |
| Shyft | https://shyft.ai | Skill ratings and activity metrics |
| Smithery | https://smithery.ai | Skill discovery and install |
| Agent Skills | https://agent-skills.cc | Skill registry |
| OpenClaw ClawHub | https://github.com/openclaw/clawhub | 5,400+ skills in registry |
| Awesome Claude | https://awesomeclaude.ai | Visual directory |
| Skills.2389.ai | https://skills.2389.ai/ | Plugin marketplace |

---

## 8. Sources Searched

Queries used:
- "claude code deep research skill github"
- "claude code research plugin github 2025 2026"
- "claude code skills deep research" site:github.com
- "awesome claude code plugins research tools list"
- "claude code multi-agent research github workflow"
- "SKILL.md deep research" site:github.com
- "claude code research agent plugin MCP server"
- Individual repo searches for features and star counts

All URLs verified via web search on 2026-03-21. Star counts are approximate and may fluctuate.
