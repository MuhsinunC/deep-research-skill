# Claude Code Sub-Agent Architecture for Deep Research Workflows

**Research Date:** 2026-03-21
**Status:** Complete

---

## Table of Contents

1. [How the Agent Tool Works](#1-how-the-agent-tool-works)
2. [Parallel Sub-Agent Patterns for Research](#2-parallel-sub-agent-patterns-for-research)
3. [Deep Research Workflow Patterns](#3-deep-research-workflow-patterns)
4. [Custom Research Skills (SKILL.md System)](#4-custom-research-skills-skillmd-system)
5. [Multi-Agent Research Best Practices](#5-multi-agent-research-best-practices)
6. [Built-in Research-Oriented Agent Types](#6-built-in-research-oriented-agent-types)
7. [Agent Teams (Experimental)](#7-agent-teams-experimental)
8. [Notable Open-Source Research Skills](#8-notable-open-source-research-skills)
9. [Key Takeaways and Recommendations](#9-key-takeaways-and-recommendations)

---

## 1. How the Agent Tool Works

### Core Mechanism

When the parent agent uses the **Agent tool** (formerly called the Task tool), it spawns a subagent -- a separate Claude instance with its own context window. The flow works like this:

1. The parent agent calls the Agent tool with a **prompt string** -- this is the only data channel from parent to subagent
2. The subagent receives a fresh context window (no parent conversation history)
3. The subagent performs its work: reads files, runs searches, makes tool calls
4. All intermediate tool calls and results **stay inside the subagent** -- they are not visible to the parent
5. Only the subagent's **final message** returns to the parent

### Context Isolation

This is the most important architectural detail: subagents start with a clean slate. The only information they receive is:

- Their **system prompt** (from the subagent's markdown definition or the Agent tool invocation)
- Basic **environment details** (working directory, etc.)
- They do **not** receive the full Claude Code system prompt or the parent's conversation context

This means any file paths, error messages, decisions, or context the subagent needs must be **explicitly included in the prompt string**. Nothing is implicit.

### Subagent Limitations

- Subagents **cannot spawn other subagents** (no nesting). This keeps the architecture manageable.
- Each subagent inherits the parent conversation's permissions but can have **additional tool restrictions** applied.
- Subagents run on potentially different models (haiku for speed, opus for quality, sonnet for balance).

### Automatic Delegation

When custom subagents are defined, Claude determines whether to invoke them based on each subagent's `description` field. Clear, specific descriptions enable Claude to automatically route appropriate tasks to the right subagent without explicit user instructions.

---

## 2. Parallel Sub-Agent Patterns for Research

### When to Use Parallel Sub-Agents

Parallel dispatch is appropriate when **all** of these conditions are met:

- **3+ unrelated tasks** or independent domains to research
- **No shared state** between tasks (each subagent can complete its work without results from others)
- **Clear boundaries** -- work is self-contained and can be summarized usefully when complete
- **Volume justifies it** -- the parallelism saves meaningful time

### The Fan-Out / Fan-In Pattern

This is the primary pattern for research:

```
Parent Agent
  |
  |-- spawn subagent A (research topic 1) --\
  |-- spawn subagent B (research topic 2) ----> All run in parallel
  |-- spawn subagent C (research topic 3) --/
  |
  v
Parent synthesizes all results into unified output
```

Each subagent explores its area independently. The parent collects all final outputs and synthesizes them. This works best when the research paths have no dependencies.

### Prompting for Maximum Parallelization

To get Claude to actually parallelize, be explicit:

- **Specific count:** "Use 5 parallel sub-agents" is clearer than "parallelize this"
- **Define scope per agent:** Clear boundaries prevent overlap and ensure comprehensive coverage
- **Name what each agent should focus on:** "Research company A" / "Research company B" / etc.

### Background Execution

Use `run_in_background: true` for research sub-agents that don't need immediate results. This lets the parent continue working while research happens in parallel. Monitor background tasks with `/tasks` to see all running processes.

Press `Ctrl+B` to background a currently running task.

### Sequential When Necessary

Use sequential dispatch when tasks have dependencies:

```
Step 1: Identify the top 5 vendors (must complete first)
Step 2: Deep-dive each vendor in parallel (depends on step 1 results)
Step 3: Synthesize comparison (depends on step 2 results)
```

---

## 3. Deep Research Workflow Patterns

### Anthropic's Own Multi-Agent Research Architecture

Anthropic published details about their internal multi-agent research system. Key findings:

**Architecture:** Orchestrator-worker pattern. A lead agent (Claude Opus 4) coordinates the process, while specialized subagents (Claude Sonnet 4) operate in parallel.

**How it works:**
1. User submits a query
2. Lead agent uses **extended thinking** to analyze the query, assess complexity, determine how many subagents to spawn, and define each subagent's role
3. Lead agent spawns 3-5 subagents in parallel
4. Each subagent acts as an **intelligent filter** -- iteratively using search tools to gather information
5. Subagents return findings to the lead agent
6. Lead agent synthesizes into a final report with citations

**Performance:** Multi-agent system outperformed single-agent Claude Opus 4 by **90.2%** on internal research evaluations. Example: identifying all board members of S&P 500 Information Technology companies -- multi-agent decomposed into parallel tasks and found answers, while single-agent failed with sequential searches.

**Cost trade-off:** Multi-agent systems use about 15x more tokens than single chat interactions (agents alone use ~4x more than chats). Worth it for complex research; overkill for simple queries.

**Early mistakes they encountered:**
- Spawning 50 subagents for simple queries
- Scouring the web endlessly for nonexistent sources
- Agents distracting each other with excessive updates
- Fix: Prompt engineering was the primary lever for improvement

### Two-Phase Research Pattern

A common pattern used by community deep research skills:

**Phase 1 -- Outline Generation:**
- Analyze the research question
- Generate an extensible outline of subtopics
- Human reviews and refines the outline before proceeding

**Phase 2 -- Deep Investigation:**
- Each subtopic is assigned to a subagent
- Subagents research in parallel using WebSearch, WebFetch, and file tools
- Results are synthesized into a structured report

### Eight-Phase Enterprise Pipeline

The most comprehensive pattern (from 199-biotechnologies/claude-deep-research-skill):

1. **Scope** -- Define research boundaries and success criteria
2. **Plan** -- Generate query set and research strategy
3. **Retrieve** -- Parallel search using subagents and web tools
4. **Triangulate** -- Cross-reference sources, minimum 3 for major claims
5. **Outline Refinement** -- Structure findings into a coherent framework
6. **Synthesize** -- Multi-pass drafting with parallel subagents
7. **Critique** -- Automated review with loop-back for issues found
8. **Refine and Package** -- Final formatting and citation verification

### Result Synthesis

The synthesizer constructs a narrative outline for the final document, choosing the structure that best fits the material (chronological, thematic, problem/solution). Redundant information from multiple subagents is merged into single, clean statements. Each claim is connected to its source, with some implementations using a **dedicated citation agent** that reviews the draft and inserts citations in the correct locations.

---

## 4. Custom Research Skills (SKILL.md System)

### What Skills Are

Skills are reusable instruction sets that extend Claude Code with domain-specific capabilities. Every skill consists of a directory containing at minimum a `SKILL.md` file.

**Skill = Prompt Template + Conversation Context Injection + Execution Context Modification + Optional data files and scripts**

### SKILL.md Structure

Every SKILL.md must start with YAML frontmatter:

```yaml
---
name: deep-research
description: "Conducts comprehensive multi-source research with parallel subagents and source verification. Invoke for any research task requiring multiple sources."
---

# Deep Research Skill

## Instructions

When invoked, follow this process:

1. Analyze the research question
2. Generate subtopics for parallel investigation
3. Dispatch subagents for each subtopic
4. Synthesize findings with source citations
5. Present structured report to user

## Tools Available

- WebSearch for finding sources
- WebFetch for extracting specific information from URLs
- Read, Grep, Glob for codebase/file analysis

## Output Format

Use markdown with tables for comparisons.
Always include source URLs.
```

### Key SKILL.md Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique skill identifier |
| `description` | Yes | Max 200 chars. Claude uses this to determine when to invoke the skill |
| `context` | No | `fork` to run in isolated subagent, `inherit` for parent context |
| `agent` | No | Which agent type executes: `Explore`, `Plan`, `general-purpose`, or custom |

### Supporting Files

Skills can include additional files beyond SKILL.md:

- **Templates** -- for Claude to fill in (e.g., report templates)
- **Example outputs** -- showing the expected format
- **Scripts** -- executable scripts Claude can run
- **Reference docs** -- detailed reference material

Reference these from your SKILL.md so Claude knows what they contain. Best practice: keep SKILL.md under 500 lines and move detailed reference material to separate files.

### Context: Fork for Research

With `context: fork`, the skill runs in an isolated subagent. Combined with `agent: Explore`, this creates a read-only research agent:

```yaml
---
name: research-explorer
description: "Read-only research agent for codebase analysis"
context: fork
agent: Explore
---
```

**Important caveat:** As of early 2026, there is an open issue (anthropics/claude-code#17283) where `context: fork` and `agent:` fields are not honored when skills are invoked through the Skill tool. This limits automatic delegation to specialized subagents.

### Skill Storage Locations

- **Project-level:** `.claude/skills/` (takes precedence)
- **User-level:** `~/.claude/skills/` (available across all projects)

---

## 5. Multi-Agent Research Best Practices

### Prompt Engineering is the Primary Lever

Anthropic's own engineering team found that prompt engineering was the single most effective way to improve multi-agent research quality. Key strategies:

- **Be specific about subagent count and roles** -- don't let the system guess
- **Define clear scope boundaries** for each subagent to prevent overlap
- **Include success criteria** in each subagent's prompt
- **Specify the output format** each subagent should return

### Result Aggregation

| Strategy | When to Use |
|----------|-------------|
| **Simple concatenation** | Results are already well-structured and non-overlapping |
| **Deduplication + merge** | Multiple agents found overlapping information |
| **Narrative synthesis** | Final output needs to be a coherent document |
| **Structured extraction** | Results need to populate a table or database |

The parent agent should choose the structure that best fits the material: chronological, thematic, or problem/solution.

### Accuracy Verification

1. **Source triangulation:** Require minimum 3 independent sources for major claims. Cross-reference verification catches hallucinated or misattributed facts.

2. **Citation agents:** Some pipelines use a dedicated citation agent that reviews the draft and inserts citations, connecting every claim to its source. This prevents hallucinations by ensuring every assertion is traceable.

3. **Source credibility scoring:** Score each source 0-100 based on domain authority, recency, expertise, and bias. Filter out low-quality sources.

4. **Critique loops:** After synthesis, run a separate critique agent that challenges claims and checks for logical consistency. Loop back to research if gaps are found.

5. **Independent verification subagent:** Dispatch a subagent that has no access to the original research context to verify key claims from scratch. This prevents confirmation bias.

### Performance Optimization

- **Use Haiku for exploration** -- fast and cheap for broad searches
- **Use Sonnet for research** -- good balance of quality and speed for substantive work
- **Use Opus for synthesis** -- highest quality for the final integration step
- **Parallel tool calling** -- subagents should use 3+ tools in parallel where possible
- **Background execution** -- use `run_in_background` for non-blocking research

### Error Handling

- **Blocked sites:** When a site blocks scraping (Cloudflare, 403), fall back to browser automation or skip gracefully
- **Empty results:** Subagents should report "no results found" rather than hallucinating
- **Timeout management:** Set reasonable timeouts for web searches; research can take long
- **Scope creep:** Prevent agents from "scouring the web endlessly" by defining clear stopping criteria

---

## 6. Built-in Research-Oriented Agent Types

Claude Code ships with three built-in subagent types:

### Explore Agent

- **Purpose:** Read-only file discovery and codebase search
- **Default model:** Haiku (for speed and cost)
- **Tools:** Read, Grep, Glob (read-only tools)
- **Use case:** When Claude needs to search or understand a codebase without making changes
- **Thoroughness levels:** `quick` (targeted lookups), `medium` (balanced), `very thorough` (comprehensive analysis)
- **Context:** Starts with a fresh slate (no parent context), which makes sense since search tasks are often independent

### Plan Agent

- **Purpose:** Gathers context before presenting a strategy
- **Use case:** When you enter plan mode (`/plan`), Claude delegates research to the Plan agent
- **Behavior:** Explores the codebase, understands patterns, and returns findings so Claude can propose a coherent strategy

### General-Purpose Agent

- **Purpose:** Handles anything involving both exploration and modification
- **Context:** Inherits full context from the parent
- **Use case:** Tasks requiring reasoning across multiple dependent steps

### Relevance to Research

While none of these are specifically "research agents," the **Explore** agent is the closest to a built-in research tool. It handles read-only information gathering at low cost. For web research specifically, you need to define custom subagents with WebSearch and WebFetch tool access.

---

## 7. Agent Teams (Experimental)

### What Agent Teams Are

Released February 5, 2026 alongside Claude Opus 4.6, Agent Teams is an experimental feature that goes beyond simple subagents. Instead of a parent spawning workers, you get **multiple Claude Code sessions** working together on a shared project.

### Architecture

- One session acts as the **team lead** to coordinate work and assign tasks
- Teammates work **independently in their own context windows**
- Teammates **communicate directly with each other** (not just through the lead)
- Coordination happens through a **shared task list** and **direct messaging**

### Enabling Agent Teams

Add `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` to your settings.json or environment. Then tell Claude to create an agent team and describe the task/structure in natural language.

### Use Cases for Research

- **Competing hypotheses:** Teammates test different theories in parallel and converge on the answer faster
- **Cross-domain research:** Each teammate owns a different research domain
- **Research + writing:** One teammate researches while another drafts, with coordination on findings

### Key Difference from Subagents

| Feature | Subagents | Agent Teams |
|---------|-----------|-------------|
| Communication | One-way (parent sends prompt, child returns result) | Multi-directional (teammates message each other) |
| Coordination | Parent orchestrates | Team lead coordinates; teammates self-organize |
| Context | Isolated per subagent | Shared project context |
| Nesting | Cannot spawn sub-subagents | Teammates can coordinate complex multi-step work |
| Availability | Stable | Experimental |

---

## 8. Notable Open-Source Research Skills

### 199-biotechnologies/claude-deep-research-skill

- **Pipeline:** 8-phase (Scope, Plan, Retrieve, Triangulate, Outline, Synthesize, Critique, Refine)
- **Features:** Source credibility scoring (0-100), multiple research modes (quick/standard/deep/ultradeep), triangulation (min 3 sources per major claim)
- **Install:** `git clone https://github.com/199-biotechnologies/claude-deep-research-skill.git ~/.claude/skills/deep-research`
- **Dependencies:** Python standard library only (no pip install needed for basic usage)
- **URL:** https://github.com/199-biotechnologies/claude-deep-research-skill

### Weizhena/Deep-Research-skills

- **Pipeline:** Two-phase (outline generation + deep investigation)
- **Features:** Human-in-the-loop control, extensible outline system
- **Compatible with:** Claude Code, OpenCode, and Codex
- **URL:** https://github.com/Weizhena/Deep-Research-skills

### daymade/claude-code-skills (deep-research)

- **Location:** `deep-research/SKILL.md`
- **URL:** https://github.com/daymade/claude-code-skills/blob/main/deep-research/SKILL.md

### Imbad0202/academic-research-skills

- **Pipeline:** research, write, review, revise, finalize
- **Focus:** Academic research with paper-quality output
- **URL:** https://github.com/Imbad0202/academic-research-skills

### VoltAgent/awesome-claude-code-subagents

- **Collection:** 100+ specialized subagents across many domains
- **Includes:** Research analyst subagent definition
- **URL:** https://github.com/VoltAgent/awesome-claude-code-subagents

---

## 9. Key Takeaways and Recommendations

### For Building Research Workflows in Claude Code

1. **Use the orchestrator-worker pattern.** Have a lead agent (Opus) plan the research, spawn parallel subagents (Sonnet) for investigation, then synthesize results. This is the pattern Anthropic uses internally and it outperforms single-agent by 90%.

2. **Define custom subagents with explicit tool access.** Create `.claude/agents/research-analyst.md` with WebSearch, WebFetch, Read, Grep, and Glob tools. Give it a clear description so Claude auto-delegates.

3. **Save incrementally.** Research subagents should write findings to disk after each step, not accumulate in memory. Context windows have limits.

4. **Use source triangulation.** Require 3+ independent sources per major claim. Cross-reference to catch errors.

5. **Employ critique loops.** After synthesis, run a separate review pass. The critique agent should challenge claims and check for gaps.

6. **Match model to task.** Haiku for broad exploration, Sonnet for substantive research, Opus for final synthesis.

7. **Be explicit about parallelism.** Tell Claude exactly how many subagents to use and what each should focus on. Vague instructions lead to sequential execution.

8. **Consider Agent Teams for large-scale research.** If you need multiple agents communicating with each other (not just reporting to a parent), the experimental Agent Teams feature enables true collaboration.

### What Works vs. What's Still Maturing

| What Works Well | What's Still Maturing |
|-----------------|----------------------|
| Parallel subagent dispatch for independent research | `context: fork` + `agent:` in skills (not fully honored) |
| WebSearch + WebFetch for web research | Agent Teams (still experimental) |
| Custom subagent definitions with YAML frontmatter | Automatic subagent count optimization |
| Source credibility scoring (via community skills) | Built-in research agent type (none exists natively) |
| Incremental file writing for persistence | Cross-subagent communication |

---

## Sources

- [Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [How we built our multi-agent research system - Anthropic](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Orchestrate teams of Claude Code sessions - Claude Code Docs](https://code.claude.com/docs/en/agent-teams)
- [Extend Claude with skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Building agents with the Claude Agent SDK - Anthropic](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Building a C compiler with a team of parallel Claudes - Anthropic](https://www.anthropic.com/engineering/building-c-compiler)
- [Claude Code Sub-Agents: Parallel vs Sequential Patterns](https://claudefa.st/blog/guide/agents/sub-agent-best-practices)
- [Claude Code Agent Teams: The Complete Guide 2026](https://claudefa.st/blog/guide/agents/agent-teams)
- [How to Use Claude Code Sub-Agents for Parallel Work - Tim Dietrich](https://timdietrich.me/blog/claude-code-parallel-subagents/)
- [VoltAgent/awesome-claude-code-subagents - GitHub](https://github.com/VoltAgent/awesome-claude-code-subagents)
- [199-biotechnologies/claude-deep-research-skill - GitHub](https://github.com/199-biotechnologies/claude-deep-research-skill)
- [Weizhena/Deep-Research-skills - GitHub](https://github.com/Weizhena/Deep-Research-skills)
- [daymade/claude-code-skills - GitHub](https://github.com/daymade/claude-code-skills/blob/main/deep-research/SKILL.md)
- [Imbad0202/academic-research-skills - GitHub](https://github.com/Imbad0202/academic-research-skills)
- [Inside Claude Code's Web Tools: WebFetch vs WebSearch](https://mikhail.io/2025/10/claude-code-web-tools/)
- [Subagents in the SDK - Claude API Docs](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [Skill authoring best practices - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [How Anthropic Built a Multi-Agent Research System - ByteByteGo](https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent)
- [Claude Code multiple agent systems: Complete 2026 guide - eesel.ai](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide)
- [Claude Skills vs Sub-agents - Sandeep Satya](https://medium.com/@SandeepTnvs/claude-skills-vs-sub-agents-architecture-use-cases-and-effective-patterns-3e535c9e0122)
- [Claude Agent Skills: A First Principles Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Claude Code Swarm Orchestration Skill - GitHub Gist](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea)
