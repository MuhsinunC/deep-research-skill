# Anthropic Deep Research: Official Features, API Access, and Claude Code Integration

**Research date:** 2026-03-21

---

## 1. What Is Claude.ai's "Research" Mode?

Claude.ai offers a **Research** feature (sometimes called "deep research") that enables Claude to conduct autonomous, multi-step web research on behalf of the user. It was launched in 2025 and has been expanded since.

### How It Works

- Claude operates **agentically**, conducting multiple searches that build on each other.
- It breaks the user's query into sub-tasks, executes them concurrently, and refines queries as it goes.
- The interface shows a "chain of thought" log -- how Claude decomposed the problem, which search terms it used, and how it evaluated results.
- It explores different angles of a question automatically and works through open questions systematically.
- Results are delivered as structured, citation-backed reports.

### Two Tiers of Research

| Tier | Scope | Duration | Availability |
|------|-------|----------|-------------|
| **Research** | Multiple connected searches, synthesized into a report with citations | 1-3 minutes, 5+ tool calls | Pro, Max, Team, Enterprise |
| **Advanced Research** | Autonomous investigation across hundreds of sources, breaks down complex tasks | Up to 45 minutes | Beta for Max, Team, Enterprise (U.S., Japan, Brazil). Coming to Pro. |

### Requirements

- A paid Claude plan (Pro, Max, Team, or Enterprise).
- Available on Claude web, Claude Desktop, and Claude Mobile.
- Web search must be toggled ON for Research to function.
- By default, enabling Research also enables extended thinking.

### What Model Powers It?

Anthropic has **not publicly disclosed** the specific model that runs under the Research feature's hood. The Research toggle is available to Pro subscribers who also have access to Opus-class models, and it leverages extended thinking, but Anthropic does not specify whether Research internally uses Sonnet, Opus, or a specialized variant. The feature is best understood as a product-level capability layered on top of Claude's model infrastructure rather than a single model designation.

**Sources:**
- [Using Research on Claude -- Claude Help Center](https://support.claude.com/en/articles/11088861-using-research-on-claude)
- [When should I use web search, extended thinking, and Research? -- Claude Help Center](https://support.claude.com/en/articles/11095361-when-should-i-use-web-search-extended-thinking-and-research)
- [Claude takes research to new places -- Anthropic](https://www.anthropic.com/news/research)
- [Claude Deep Research Review 2025 -- Second Talent](https://www.secondtalent.com/resources/claude-deep-research-review/)
- [Anthropic Threads post on Advanced Research expansion](https://www.threads.com/@claudeai/post/DJHza7BR_Xm)

---

## 2. Has Anthropic Released an Official Deep Research Skill for Claude Code CLI?

**No.** As of March 2026, Anthropic has **not** released an official "deep research" skill in the `anthropics/skills` GitHub repository or bundled one with Claude Code.

### What Anthropic's Official Skills Repository Contains

The official repository at [github.com/anthropics/skills](https://github.com/anthropics/skills) contains skills demonstrating what is possible with Claude's skills system. The published skills span creative applications (art, music, design), technical tasks (testing web apps, MCP server generation), enterprise workflows (communications, branding), and document handling (docx, pdf, pptx, xlsx). **There is no "deep-research" skill in this repository.**

### What Claude Code Does Have Built-In

Claude Code has built-in tools relevant to research:

- **WebSearch** -- Searches the web and returns results with links. Available as a tool within Claude Code sessions.
- **WebFetch** -- Fetches and reads web page content.
- **Glob / Grep / Read** -- For searching and reading local codebases.
- **Task / subagent spawning** -- Claude Code can spawn background agents for parallel work.

These are general-purpose tools, not a structured "deep research pipeline."

### Community-Built Deep Research Skills Exist

Several third-party / community deep research skills have been built for Claude Code:

| Project | Author | Description |
|---------|--------|-------------|
| [claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill) | 199-biotechnologies | Enterprise-grade 8-phase pipeline with source credibility scoring, automated validation. Claims to outperform OpenAI/Gemini/Claude Desktop in quality. |
| [Claude-Deep-Research](https://github.com/mcherukara/Claude-Deep-Research) | mcherukara | MCP server enabling comprehensive research capabilities for Claude. |
| [claude-web-research-task](https://github.com/bhaidar/claude-web-research-task) | bhaidar | Automates Claude.ai's Research feature via Chrome browser automation as a background agent. |
| [anthropic-deep-research](https://github.com/milkymap/anthropic-deep-research) | milkymap | Open deep iterative research algorithm based on Anthropic and OpenAI. |

**None of these are official Anthropic projects.** They are community-built skills using Claude Code's skill system (SKILL.md format) or MCP protocol.

**Sources:**
- [Anthropic Skills Repository -- GitHub](https://github.com/anthropics/skills)
- [Extend Claude with skills -- Claude Code Docs](https://code.claude.com/docs/en/skills)
- [199-biotechnologies/claude-deep-research-skill -- GitHub](https://github.com/199-biotechnologies/claude-deep-research-skill)
- [bhaidar: How to Use Claude.ai's Research Toggle Inside Claude Code -- DEV Community](https://dev.to/bhaidar/how-to-use-claudeais-research-toggle-inside-claude-code-469d)

---

## 3. Anthropic Announcements About Deep Research in Claude Code

### What Anthropic Has Said

- Anthropic has acknowledged that **internally**, Claude Code has been used for "deep research, video creation, and note-taking -- not just coding." This was mentioned in the context of renaming the "Claude Code SDK" to the **"Claude Agent SDK"** to reflect its broader agentic use cases.
- The Claude Agent SDK announcement framed Claude Code's infrastructure as a general-purpose agent harness, not limited to coding tasks.
- **No specific announcement** has been made about shipping a dedicated deep research feature, skill, or plugin for Claude Code CLI.

### Claude Cowork (Related but Distinct)

In January 2026, Anthropic launched **Claude Cowork** in research preview. Cowork extends Claude's agentic capabilities beyond coding into broader enterprise workflows. It is a separate product from Claude Code, targeting non-coding enterprise tasks.

### Three Approaches to Deep Research with Claude (Community Guide)

A well-known community guide by paddo.dev outlines three approaches:

1. **DIY recursive spawning** -- ~20 lines of shell, zero dependencies. Claude Code spawns sub-agents that search, verify claims across sources, and report back.
2. **MCP servers** -- Plug-and-play tools (like mcherukara's Claude-Deep-Research) that provide structured research capabilities.
3. **Full production apps** -- Multi-source verification, progress UX, cost tracking for domain-specific use cases.

The guide emphasizes that deep research is not just "search and summarize" but genuine claim verification across multiple sources with reasoning.

**Sources:**
- [Building agents with the Claude Agent SDK -- Anthropic](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Anthropic's Explosive Start to 2026 -- Medium](https://fazal-sec.medium.com/anthropics-explosive-start-to-2026-everything-claude-has-launched-and-why-it-s-shaking-up-the-668788c2c9de)
- [Three Ways to Build Deep Research with Claude -- paddo.dev](https://paddo.dev/blog/three-ways-deep-research-claude/)
- [Anthropic says Claude Code transformed programming, now Cowork -- VentureBeat](https://venturebeat.com/orchestration/anthropic-says-claude-code-transformed-programming-now-claude-cowork-is)

---

## 4. What Official Claude Code Documentation Says About Research Capabilities

### Built-In Tools

The official Claude Code documentation at [code.claude.com/docs](https://code.claude.com/docs/en/overview) describes Claude Code as "an agentic coding tool that reads your codebase, edits files, runs commands, and integrates with your development tools." Key research-relevant capabilities documented:

- **WebSearch tool** -- Search the web from within Claude Code sessions.
- **WebFetch tool** -- Fetch and read web page content.
- **Task tool** -- Spawn sub-agents (foreground or background) for parallel work.
- **Skills system** -- Load SKILL.md files that teach Claude specialized workflows.
- **MCP integration** -- Connect external tool servers for additional capabilities.

### Skills Documentation

The skills documentation at [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) explains how to create and use skills. Skills are folders with a SKILL.md file containing YAML frontmatter and markdown instructions. They can be:
- Project-level (in `.claude/skills/` directory)
- User-level (in `~/.claude/skills/` directory)
- Installed from the official `anthropics/skills` repository

### What Is NOT Documented

- There is no official `/research` command in Claude Code.
- There is no built-in deep research pipeline or multi-phase research workflow.
- There is no documented way to access Claude.ai's Research mode from within Claude Code natively.

**Sources:**
- [Claude Code overview -- Claude Code Docs](https://code.claude.com/docs/en/overview)
- [Extend Claude with skills -- Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Inside Claude Code's Web Tools: WebFetch vs WebSearch -- Mikhail Shilkov](https://mikhail.io/2025/10/claude-code-web-tools/)

---

## 5. Is There an API or Programmatic Way to Access Claude.ai's Deep Research Mode?

### Short Answer: No Direct API Endpoint

Claude.ai's Research mode is a **product-level feature** available only in the Claude.ai web interface, Claude Desktop app, and Claude Mobile app. There is **no API endpoint** that replicates the Research toggle's behavior (autonomous multi-step investigation with up to 45 minutes of work).

### What the API Does Offer

The Claude Messages API (`POST /v1/messages`) supports the **web_search tool** (`web_search_20260209`), which gives Claude the ability to search the web during a conversation. Key details:

- Enabled by including a `web_search` tool definition in the API request's `tools` array.
- Claude decides when to search based on the prompt.
- Supports domain filtering (allow/block lists) at individual and organizational levels.
- With the latest tool version, Claude can write and execute code to post-process and dynamically filter search results.
- Available at: `https://api.anthropic.com/v1/messages`

However, the API web_search tool is designed for **quick lookups** (1-2 searches), not the autonomous multi-step research pipeline that the Research toggle provides.

### Workarounds

1. **Build your own research loop via API** -- Use the Messages API with web_search_tool in a loop, letting Claude decide what to search next, accumulating results across multiple API calls. This is the DIY approach described in community guides. You orchestrate the multi-turn loop yourself.

2. **Browser automation** -- Use Claude Code with the Chrome extension (`claude --chrome`) to automate the Claude.ai Research toggle via browser. The bhaidar/claude-web-research-task skill does exactly this: it opens Claude.ai, toggles Research mode, submits a query, waits for results, and extracts them. This runs as a background agent so it does not block your main Claude Code session.

3. **MCP servers** -- Use community-built MCP research servers that implement multi-step research pipelines using Claude's API + web search tool under the hood.

### Key Distinction

| Capability | API Available? | Notes |
|------------|---------------|-------|
| Single web search | Yes | `web_search_20260209` tool in Messages API |
| Extended thinking | Yes | Supported in API |
| Research mode (multi-step autonomous) | No | Claude.ai / Desktop / Mobile only |
| Advanced Research (45-min deep dive) | No | Max/Team/Enterprise on web only |

**Sources:**
- [Web search tool -- Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool)
- [API Overview -- Claude API Docs](https://platform.claude.com/docs/en/api/overview)
- [Anthropic rolls out an API for AI-powered web search -- TechCrunch](https://techcrunch.com/2025/05/07/anthropic-rolls-out-an-api-for-ai-powered-web-search/)
- [How to Use Claude.ai's Research Toggle Inside Claude Code -- DEV Community](https://dev.to/bhaidar/how-to-use-claudeais-research-toggle-inside-claude-code-469d)
- [Three Ways to Build Deep Research with Claude -- paddo.dev](https://paddo.dev/blog/three-ways-deep-research-claude/)

---

## Summary of Key Findings

| Question | Answer |
|----------|--------|
| What is Claude.ai's Research mode? | An agentic, multi-step web research feature that autonomously searches, synthesizes, and cites sources. Available in two tiers: standard (1-3 min) and Advanced (up to 45 min). |
| What model powers it? | Anthropic has not publicly disclosed which specific model runs under Research mode. |
| Official deep research skill for Claude Code? | **No.** Anthropic has not released one. Several community-built alternatives exist. |
| Announcements about bringing it to Claude Code? | Anthropic acknowledged using Claude Code for deep research internally. No public announcement of an official skill/plugin. |
| What does Claude Code docs say? | Documents WebSearch, WebFetch, and skills system. No built-in research pipeline. |
| API access to Research mode? | **No direct API.** The web_search tool is available via API for single searches. Research mode is web/desktop/mobile only. Workarounds exist via browser automation or DIY multi-turn loops. |

---

*Platforms checked: Claude Help Center (support.claude.com), Claude API Docs (platform.claude.com), Claude Code Docs (code.claude.com), Anthropic blog (anthropic.com/news), Anthropic Engineering blog, GitHub (anthropics/skills, anthropics/claude-code), TechCrunch, VentureBeat, DEV Community, Medium, paddo.dev, secondtalent.com, community GitHub repositories.*
