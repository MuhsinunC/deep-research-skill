# Competing Deep Research Architectures vs. 199-biotechnologies/claude-deep-research-skill

**Date:** 2026-03-22
**Purpose:** Identify architectural features from competing deep research skills that 199-bio lacks and would benefit from adopting.

---

## Baseline: 199-biotechnologies/claude-deep-research-skill

**Repo:** https://github.com/199-biotechnologies/claude-deep-research-skill

The 199-bio skill runs an 8-phase pipeline (Scope, Plan, Retrieve, Triangulate, Outline Refinement, Synthesize, Critique/loop-back, Refine, Package) with parallel retrieval (5-10 concurrent searches + 2-3 focused sub-agents). It features source credibility scoring (0-100), automated validation (validate_report.py with 9 checks, verify_citations.py for DOI/URL/hallucination detection), and multiple research modes (quick/standard/deep/ultra-deep). Reports over 18K words auto-continue via recursive agent spawning with context preservation. The skill is designed for fully autonomous operation -- it announces its plan and proceeds without mid-research user checkpoints.

**Key architectural gaps identified below.**

---

## Competitor 1: altmbr/claude-research-skill (Multi-Agent Orchestrator)

**Repo:** https://github.com/altmbr/claude-research-skill

### Architecture Summary

Decomposes any research question into parallel agent workstreams using Claude Code's built-in Task tool. Each agent follows a strict write protocol: it must write findings to its assigned file after every single search (no two searches in a row without writing). Output is organized as separate files per workstream plus a synthesis file.

### Features 199-bio Lacks

**1. Escalating-interval agent health monitoring with automatic kill-and-relaunch.**
The orchestrator monitors all agents at escalating intervals (30s, 2min, 5min, then every 5min). If an agent's output file line count is unchanged between check-ins, the agent is automatically killed and relaunched with its previously-written data pre-loaded. This is a concrete stuck-agent recovery mechanism. 199-bio has "explicit stop rules and error gates" but no documented heartbeat monitoring or automatic agent restart -- if a sub-agent stalls during the Retrieve phase, there is no described mechanism to detect the stall and recover.

**2. Mandatory write-after-every-search protocol with file-based progress tracking.**
Each agent must write to its output file after every single web search -- never two searches in a row without persisting results. This makes progress monitoring trivial (just check line counts) and guarantees zero data loss if an agent crashes. 199-bio's sub-agents return "structured evidence objects" at the end, but there is no documented incremental-write mandate. If a 199-bio sub-agent crashes mid-retrieval, all its unsaved intermediate findings could be lost.

---

## Competitor 2: Weizhena/Deep-Research-skills (Human-in-the-Loop)

**Repo:** https://github.com/Weizhena/Deep-Research-skills

### Architecture Summary

Two-phase research workflow: (1) outline generation (extensible by user) and (2) deep investigation. Human-in-the-loop design with checkpoints at every stage. Supports Claude Code, OpenCode, and Codex. Use cases span academic, technical, market, and due-diligence research.

### Features 199-bio Lacks

**1. User-approval checkpoints between phases.**
Weizhena's system pauses after outline generation and lets the user modify, extend, or redirect the research plan before the deep investigation phase begins. Users can add sections, remove irrelevant ones, or change emphasis. 199-bio explicitly avoids this -- it announces the plan and proceeds immediately. For high-stakes or ambiguous research topics, this means 199-bio can waste significant compute pursuing directions the user would have redirected if asked. An optional checkpoint mode (off by default for autonomy, on when users want control) would give 199-bio the best of both worlds.

**2. Cross-platform agent compatibility (Claude Code + OpenCode + Codex).**
Weizhena's skill runs on Claude Code, OpenCode, and Codex out of the box. 199-bio is Claude Code-specific. While not an architectural feature per se, the multi-platform design forces cleaner abstraction boundaries that make the skill more portable and testable. For 199-bio, designing the pipeline to be agent-runtime-agnostic would improve maintainability and expand reach.

---

## Competitor 3: Orchestra-Research/AI-Research-SKILLs (83 Lifecycle Skills)

**Repo:** https://github.com/Orchestra-Research/AI-Research-SKILLs

### Architecture Summary

Library of 86 composable skills spanning the full AI research lifecycle, organized into 22 numbered categories (model architectures, tokenization, fine-tuning, mechanistic interpretability, data processing, post-training, safety, distributed systems, optimization, evaluation, inference, agents, RAG, multimodal, and more). A central "autoresearch" orchestrator manages the full lifecycle from literature survey to paper writing using a two-loop architecture (inner optimization + outer synthesis) that routes to domain-specific skills as needed. Each skill follows a standardized SKILL_TEMPLATE.md with YAML frontmatter, dependencies, and bundled reference documentation.

### Features 199-bio Lacks

**1. Composable domain-skill routing with standardized skill interfaces.**
Orchestra's autoresearch orchestrator doesn't try to be one monolithic pipeline. Instead, it routes to specialized domain skills (e.g., "mechanistic interpretability," "tokenization," "safety alignment") that each have deep domain-specific knowledge, examples, and reference material (300KB+ per skill). 199-bio is a single monolithic SKILL.md -- it handles all domains through the same generic pipeline. For domain-heavy research (e.g., molecular biology, chip design), a monolithic skill can't match the depth of a skill that carries domain-specific API references, common patterns, and known pitfalls. Adding a plugin/routing system where domain packs can be loaded on demand would make 199-bio dramatically more capable in specialized fields.

**2. Standardized skill template with versioning, dependency declarations, and bundled reference docs.**
Every Orchestra skill uses a consistent SKILL_TEMPLATE.md with semantic versioning, explicit dependency constraints, tags, and a references/ folder containing deep docs (API references, tutorials, GitHub issues with solutions). This makes skills composable, versionable, and independently testable. 199-bio has no equivalent modular structure -- it can't declare dependencies on other skills or version its components independently. Adopting a standardized skill interface would enable community contributions and mix-and-match skill composition.

---

## Competitor 4: mvanhorn/last30days-skill (Real-Time Research)

**Repo:** https://github.com/mvanhorn/last30days-skill

### Architecture Summary

Researches any topic across Reddit, X/Twitter, Bluesky, YouTube, TikTok, Instagram, Hacker News, Polymarket, and the web with a strict 30-day recency window. Uses platform-specific APIs (OpenAI Responses API for Reddit, xAI Responses API for X, ScrapeCreators for Reddit/TikTok/Instagram, vendored Bird client for Twitter GraphQL). Includes popularity-aware ranking, engagement-weighted scoring, and comparative "X vs Y" mode with 3 parallel research passes. Every run auto-saves a topic-named .md file to build a personal research library.

### Features 199-bio Lacks

**1. Temporal recency enforcement and platform-specific source adapters.**
last30days enforces a strict 30-day recency window and uses dedicated adapters for each platform (Reddit, X, YouTube, Polymarket, etc.), each with platform-appropriate scoring. Polymarket scoring, for example, uses a 5-factor weighted composite (text relevance 30%, 24h volume 30%, liquidity depth 15%, price movement velocity 15%, outcome competitiveness 10%). 199-bio uses generic web search providers (Brave, Serper, Exa, Jina, Firecrawl) with no temporal filtering or platform-specific scoring. For time-sensitive research (trending topics, recent developments, breaking news), 199-bio has no mechanism to enforce recency or weight recent sources more heavily. Adding a recency mode with configurable time windows and platform-specific adapters would fill a real gap.

**2. Built-in comparative "X vs Y" research mode with parallel structured comparison.**
last30days supports a first-class comparative mode where users can ask "X vs Y" questions that spawn 3 parallel research passes and produce a side-by-side comparison. 199-bio has no equivalent structured comparison mode. While users can phrase comparison questions in natural language, 199-bio has no architectural support for decomposing comparisons into parallel "research each side independently, then synthesize differences" workflows. A built-in comparison template would produce more balanced, systematic comparative reports.

---

## Competitor 5: LangChain Open Deep Research (Supervisor + Sub-Agents)

**Repo:** https://github.com/langchain-ai/open_deep_research
**Blog:** https://blog.langchain.com/open-deep-research/

### Architecture Summary

Built on LangGraph with a supervisor-researcher architecture. The supervisor decomposes research briefs into sub-topics, spawns parallel sub-agents with isolated context windows, and reflects on whether findings sufficiently address the brief. Each sub-agent operates as a tool-calling loop with search tools and/or user-configured MCP servers. The supervisor can spawn follow-up sub-agents to fill identified gaps. Supports pluggable LLMs, tools, and MCP servers.

### Features 199-bio Lacks

**1. Iterative gap-identification and follow-up spawning by a reflecting supervisor.**
LangChain's supervisor uses a think_tool to reason about whether sub-agent findings sufficiently address the research brief. If gaps are identified, the supervisor spawns additional sub-agents specifically targeting those gaps. This is different from 199-bio's Critique phase (which loops back within the same agent) -- LangChain's approach can dynamically expand the research scope by spawning new parallel workers to chase down identified deficiencies, rather than retrying within a fixed pipeline. 199-bio's critique loop is internal; it can flag problems but can only ask the same pipeline to try harder, not spin up targeted new investigations.

**2. Pluggable tool and MCP server configuration per research task.**
LangChain's system lets users configure which search tools and MCP servers each sub-agent uses, making it trivial to swap in domain-specific tools (e.g., a PubMed MCP server for biomedical research, a patent search API for IP research). 199-bio supports multiple search providers (Brave, Serper, Exa, Jina, Firecrawl) but the tool configuration is static and skill-level, not per-task or per-sub-agent. The ability to configure tools per research topic would make 199-bio dramatically more flexible for specialized domains.

---

## Competitor 6: Anthropic's Own Multi-Agent Research System

**Source:** https://www.anthropic.com/engineering/multi-agent-research-system

### Architecture Summary

Hierarchical orchestrator-worker pattern. A LeadResearcher (Claude Opus 4) plans the research, saves its plan to Memory for context persistence, and spawns Subagents (Claude Sonnet 4) that search, reason, and cite independently in parallel. After research, a dedicated CitationAgent processes all documents and the research report to identify specific source locations for every claim. Memory system persists context when conversations exceed 200K tokens. Multi-agent with Opus 4 lead + Sonnet 4 workers outperformed single-agent Opus 4 by 90.2% on internal evals.

### Features 199-bio Lacks

**1. Dedicated CitationAgent as a separate specialized post-processing stage.**
Anthropic's system uses a standalone CitationAgent that receives all collected documents and the draft research report, then systematically identifies the specific location in source documents for every claim in the report. This is architecturally different from 199-bio's verify_citations.py, which checks DOI/URL validity and hallucination detection. Anthropic's CitationAgent does deep semantic matching -- finding exactly where in a source document a claim is supported, not just whether a URL resolves. This produces reports where every claim has a precise, verifiable attribution to a specific passage, not just a link to a page. Adding a dedicated citation-verification agent (rather than a script-based checker) would significantly improve 199-bio's citation quality.

**2. Explicit memory/state persistence for long-running research across context window boundaries.**
Anthropic's LeadResearcher saves its plan and accumulated state to Memory at the start of research, specifically because if the context window exceeds 200K tokens it will be truncated. This ensures the research plan and key findings survive context window truncation. 199-bio handles long reports via "recursive agent spawning with context preservation," but its approach to context window management is not as explicitly architectural. An explicit memory layer that persists research state (plan, key findings, source inventory) to disk or a memory tool would make 199-bio more robust for ultra-deep research runs that push context limits.

---

## Summary: Priority Features to Adopt

| Priority | Feature | Source Competitor | Effort | Impact |
|----------|---------|-------------------|--------|--------|
| **High** | Iterative gap-identification with follow-up sub-agent spawning | LangChain Open Deep Research | Medium | Deeper, more complete research coverage |
| **High** | Escalating-interval agent health monitoring + auto-restart | altmbr/claude-research-skill | Low | Prevents silent stalls in long research runs |
| **High** | Dedicated CitationAgent for semantic source-claim matching | Anthropic multi-agent system | Medium | Much stronger citation quality |
| **Medium** | Optional human-approval checkpoints between phases | Weizhena/Deep-Research-skills | Low | Prevents wasted compute on misdirected research |
| **Medium** | Temporal recency enforcement + platform-specific adapters | mvanhorn/last30days-skill | Medium | Enables time-sensitive research use cases |
| **Medium** | Composable domain-skill routing with standardized interfaces | Orchestra-Research/AI-Research-SKILLs | High | Deep domain expertise without monolithic bloat |
| **Lower** | Pluggable MCP server/tool config per research task | LangChain Open Deep Research | Medium | Flexibility for specialized domains |
| **Lower** | Explicit memory persistence across context window boundaries | Anthropic multi-agent system | Low | Robustness for ultra-deep research |
| **Lower** | Mandatory write-after-every-search protocol | altmbr/claude-research-skill | Low | Zero data loss on agent crashes |
| **Lower** | Built-in comparative "X vs Y" mode | mvanhorn/last30days-skill | Low | Better structured comparison reports |
| **Lower** | Cross-platform compatibility (OpenCode, Codex) | Weizhena/Deep-Research-skills | Medium | Broader adoption |
| **Lower** | Standardized skill template with versioning | Orchestra-Research/AI-Research-SKILLs | Medium | Community contributions, composability |

---

## Sources

- [199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill)
- [altmbr/claude-research-skill](https://github.com/altmbr/claude-research-skill)
- [Weizhena/Deep-Research-skills](https://github.com/Weizhena/Deep-Research-skills)
- [Orchestra-Research/AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs)
- [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)
- [LangChain Open Deep Research](https://github.com/langchain-ai/open_deep_research)
- [LangChain Blog: Open Deep Research](https://blog.langchain.com/open-deep-research/)
- [Anthropic: How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [ByteByteGo: How Anthropic Built a Multi-Agent Research System](https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent)
- [Orchestra Research: AI Research Engineering Skills](https://www.orchestra-research.com/perspectives/ai-research-skills)
- [Deep Research Skills on Shyft](https://shyft.ai/skills/deep-research-skills)
- [Open Deep Research Internals](https://www.bolshchikov.com/p/open-deep-research-internals-a-step)
