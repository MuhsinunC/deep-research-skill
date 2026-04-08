# SKILL.md Prompt-Based Approaches vs External Frameworks for Deep Research

**Research Date**: 2026-03-23
**Focus**: Specific advantages of SKILL.md approaches, native Claude Code capabilities, hybrid patterns, failure modes, and practitioner experiences

---

## 1. Advantages of SKILL.md Over External Frameworks

### 1.1 Zero Dependencies

The most fundamental advantage is elimination of the entire dependency stack. A SKILL.md file is a markdown document with YAML frontmatter -- no package manager, no runtime, no version pinning, no transitive dependency resolution.

Cranot's deep-research implementation demonstrates this starkly: approximately 20 lines of shell script with zero dependencies achieves recursive multi-agent research via a single flag (`--allowedTools "Bash(claude:*)"`) that lets Claude spawn additional Claude instances. ([Source: paddo.dev](https://paddo.dev/blog/three-ways-deep-research-claude/))

By contrast, external frameworks carry substantial dependency overhead. Agent stacks typically span Python packages, native libraries, vendor SDKs, CLI tools, and sometimes JavaScript or JVM components. Core dependency management practices include pinning and resolving transitive dependencies, aligning type systems and serialization layers, selecting compatible client SDKs, and keeping environment definitions reproducible across developer machines, CI, and production. ([Source: arxiv.org/pdf/2510.25423](https://arxiv.org/pdf/2510.25423))

### 1.2 Progressive Disclosure (Token Efficiency)

Claude Code's skill system implements a three-tier progressive disclosure model that external frameworks cannot replicate:

1. **Metadata level**: Skill name and description loaded at startup (~100 tokens per skill, scanning only YAML frontmatter)
2. **Content level**: Full SKILL.md loaded only when Claude determines relevance (under 5k tokens)
3. **Execution level**: Referenced files and embedded code scripts loaded only when explicitly needed

This means dozens of skills can coexist without impacting performance on unrelated tasks. The skill description budget scales dynamically at 2% of the context window, with a fallback of 16,000 characters. ([Source: code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills))

External frameworks take the opposite approach. GitHub's MCP definition alone consumes "tens of thousands of tokens," reducing available prompt space. MCP research servers with 10+ tools consume 5-10k tokens before a single question is asked, though Claude Code now supports on-demand tool loading via `ENABLE_TOOL_SEARCH` to partially address this. ([Source: intuitionlabs.ai](https://intuitionlabs.ai/articles/claude-skills-vs-mcp))

### 1.3 Native Claude Code Integration

Skills execute entirely within Claude's sandbox environment. They have direct access to all of Claude Code's 18+ built-in tools (Bash, Read, Write, Edit, Grep, Glob, WebFetch, WebSearch, etc.) without any integration layer, API translation, or protocol overhead. ([Source: code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents))

Skills can also:
- Pre-approve specific tools via `allowed-tools` frontmatter, reducing permission friction
- Restrict tool access for safety (e.g., read-only skills)
- Bundle and execute scripts in any language alongside the skill instructions
- Use string substitutions (`$ARGUMENTS`, `${CLAUDE_SESSION_ID}`, `${CLAUDE_SKILL_DIR}`) for dynamic behavior
- Inject live data via shell command preprocessing (`` !`command` `` syntax)

([Source: code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills))

### 1.4 Sub-Agent Access and Orchestration

Skills have native access to Claude Code's sub-agent system, which includes three built-in sub-agents:

| Sub-agent | Model | Purpose | Tools |
|-----------|-------|---------|-------|
| **Explore** | Haiku (fast) | File discovery, code search, codebase exploration | Read-only |
| **Plan** | Inherits | Codebase research for planning | Read-only |
| **General-purpose** | Inherits | Complex research, multi-step operations, code modifications | All tools |

Skills can run in a forked sub-agent context via `context: fork`, specifying which agent type to use. The skill content becomes the task prompt, and the agent provides the execution environment. Sub-agents run in isolated context windows and return only relevant summaries to the orchestrator, preventing context bloat. ([Source: code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents))

External frameworks must build this orchestration from scratch. LangGraph requires graph-based state machine definitions. CrewAI uses role/task metaphors with agent teams. Both require explicit plumbing for context isolation, result aggregation, and parallel execution.

### 1.5 Portability Across Surfaces

Skills are supported across Claude.ai, Claude Code, the Claude Agent SDK, and the Claude Developer Platform. They follow the Agent Skills open standard (agentskills.io), which works across multiple AI tools. Claude Code extends the standard with additional features like invocation control, sub-agent execution, and dynamic context injection. ([Source: claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills))

### 1.6 Code Bundling for Deterministic Operations

Skills can embed executable code alongside prompt instructions. Anthropic's design rationale: "Large language models excel at many tasks, but certain operations are better suited for traditional code execution. Sorting a list via token generation is far more expensive than simply running a sorting algorithm. Beyond efficiency concerns, many applications require the deterministic reliability that only code can provide." Claude "can run this script without loading either the script or the PDF into context," demonstrating loose coupling between instructions and executable operations. ([Source: claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills))

---

## 2. What Claude Code Provides Natively That Frameworks Must Re-Implement

### 2.1 Prompt Caching (92-97% Prefix Reuse)

Claude Code leverages Anthropic's native prompt caching through a deliberately prefix-heavy architecture. A traced 92-step execution revealed:

| Phase | Total Tokens | Prefix Reuse % |
|-------|-------------|----------------|
| Warm-up/Initial | 47,177 | 0.22% |
| Explore sub-agent | 546,104 | 92.06% |
| Plan sub-agent | 528,286 | 93.23% |
| Main execution | 827,411 | 97.83% |

**Overall: 92% prefix reuse rate across all phases.**

Cost impact: Processing 2M input tokens without caching costs $6.00; with prefix caching, it drops to $1.15 -- an **81% reduction**. Cache reads cost only 10% of base input token price, while cache writes cost 25% more (for 5-minute TTL). An active session sending messages every minute or two keeps the cache warm indefinitely. ([Source: blog.lmcache.ai](https://blog.lmcache.ai/en/2025/12/23/context-engineering-reuse-pattern-under-the-hood-of-claude-code/))

Real-world sessions hit 96% cache hit rates. Without prompt caching, a long Opus coding session (100 turns with compaction cycles) costs $50-100 in input tokens; with it, $10-19. ([Source: claudecodecamp.com](https://www.claudecodecamp.com/p/how-prompt-caching-actually-works-in-claude-code))

**Warm-up optimization**: Claude Code makes preliminary LLM calls that load tool specifications and sub-agent system prompts into cache before executing actual tasks. Sub-agent tool lists are subsets of the main agent's tool list, enabling cache reuse of tool descriptions. This warm-up approach "drastically accelerates subsequent sub-agent invocations." ([Source: blog.lmcache.ai](https://blog.lmcache.ai/en/2025/12/23/context-engineering-reuse-pattern-under-the-hood-of-claude-code/))

External frameworks must implement their own caching layer or rely on separate infrastructure (vLLM's PagedAttention, SGLang RadixAttention, LMCache's distributed KV cache). None achieve the seamless integration of Claude Code's approach.

### 2.2 File Persistence and Git Integration

Claude Code provides native:
- **File read/write/edit** with atomic operations
- **Git operations** via Bash (status, diff, commit, branch, merge)
- **GitHub CLI integration** (gh pr, gh issue, gh api)
- **Working directory persistence** across tool calls within a session
- **Git worktree isolation** for parallel agent execution (each agent gets its own copy of the repository)

Skills can save findings to disk incrementally, commit to git after each significant update, and survive context window collapse by persisting state to files. The `/batch` bundled skill demonstrates this at scale: it decomposes work into 5-30 independent units, spawns one background agent per unit in an isolated git worktree, and each agent implements its unit, runs tests, and opens a pull request. ([Source: code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills))

### 2.3 Browser Automation

Claude Code provides WebFetch and WebSearch as built-in tools, plus MCP integration for Playwright browser automation. Skills can access any of these without additional setup.

### 2.4 Permission and Security Model

Claude Code implements a layered permission system:
- **Permission modes**: default, acceptEdits, dontAsk, bypassPermissions, plan
- **Tool-level restrictions**: allowlist and denylist per skill/sub-agent
- **Hook-based validation**: PreToolUse hooks can validate operations before execution (e.g., blocking SQL write operations)
- **Plugin security**: plugin sub-agents cannot use hooks, mcpServers, or permissionMode fields

External frameworks must build equivalent security from scratch.

### 2.5 Context Management and Auto-Compaction

Claude Code handles context window management automatically:
- **Auto-compaction** triggers at ~95% capacity (configurable via `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`)
- **Sub-agent context isolation**: each sub-agent runs in its own context window; only summaries return to the orchestrator
- **Persistent memory**: sub-agents can maintain persistent memory directories (`user`, `project`, `local` scope) that survive across conversations
- **Session resumption**: sub-agent transcripts persist and can be resumed after restarting Claude Code

([Source: code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents))

---

## 3. Hybrid Approaches: Skills Calling External Frameworks

### 3.1 Skills as MCP Orchestrators

The most common hybrid pattern uses skills to provide procedural knowledge while MCP servers provide external data access. Anthropic's official position: "MCP connects Claude to external services and data sources. Skills provide procedural knowledge -- instructions for how to complete specific tasks or workflows." They are "complementary technologies" that should "be treated as independent." ([Source: subramanya.ai](https://subramanya.ai/2025/10/30/claude-skills-vs-mcp-a-tale-of-two-ai-customization-philosophies/))

**Concrete hybrid patterns**:

| Pattern | Skill Role | MCP/Framework Role | Example |
|---------|-----------|-------------------|---------|
| **Orchestration** | Directs workflow | Supplies data | "Deploy and Notify" skill orchestrating GitHub MCP, CI/CD MCP, Slack MCP |
| **Standardization** | Encodes governance | Executes operations | "GitHub Workflow Standards" skill ensuring branch naming + PR conventions before GitHub MCP operations |
| **Hybrid** | Processes and synthesizes | Fetches raw data | Skill generates trend analysis from data fetched by MCP metrics servers |
| **Sales workflow** | Maps fields consistently | Triggers API writes | Skill maps call transcript fields to CRM schema, MCP triggers CRM API |

([Source: intuitionlabs.ai](https://intuitionlabs.ai/articles/claude-skills-vs-mcp), [Source: subramanya.ai](https://subramanya.ai/2025/10/30/claude-skills-vs-mcp-a-tale-of-two-ai-customization-philosophies/))

### 3.2 MCP Servers Scoped to Sub-Agents

Claude Code allows MCP servers to be defined inline within a sub-agent's frontmatter, keeping them out of the main conversation context entirely. This enables hybrid architectures where:
- The main conversation uses skills for domain logic
- Sub-agents connect to specialized MCP servers only when needed
- MCP tool descriptions don't consume context in the parent session

```yaml
---
name: browser-tester
mcpServers:
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  - github  # reuses already-configured server
---
```

([Source: code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents))

### 3.3 Deep Research Hybrid: 199-Biotechnologies Example

The claude-deep-research-skill (199-biotechnologies) demonstrates a production hybrid approach with an 8-phase pipeline:

**Scope -> Plan -> Retrieve (parallel search + agents) -> Triangulate -> Outline Refinement -> Synthesize -> Critique (with loop-back) -> Refine -> Package**

- Uses SKILL.md as the orchestration layer
- Supports multiple search providers (Brave, Serper, Exa, Jina, Firecrawl) via MCP or CLI
- Bundles Python scripts for source evaluation, citation management, and validation
- Critique phase can loop back to retrieval for delta-queries if gaps are identified
- Sources persist to `sources.json` surviving context compaction across continuation agents

Modes: Quick (2-5 min, 3 phases), Standard (5-10 min, 6 phases), Deep (10-20 min, 8 phases), UltraDeep (20-45 min, 8+ phases with multi-persona red teaming). ([Source: github.com/199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill))

### 3.4 Claude-Deep-Research MCP Server

The mcherukara/Claude-Deep-Research project takes the opposite approach: an MCP server providing research capabilities to Claude. It integrates DuckDuckGo and Semantic Scholar with structured prompts guiding through initial exploration, preliminary synthesis, follow-up research, comprehensive analysis, and APA citations. This runs as an external server but is invoked from within skills or Claude Code sessions. ([Source: github.com/mcherukara/Claude-Deep-Research](https://github.com/mcherukara/Claude-Deep-Research))

---

## 4. Failure Modes Unique to Each Approach

### 4.1 SKILL.md Failure Modes

#### Prompt Drift and Inconsistency

**The core problem**: When procedural instructions lack quality criteria, the LLM fills gaps with its own judgment. "When you hand a 100%-procedural skill to five agents, you'll get five interpretations." ([Source: dev.to/akari_iku](https://dev.to/akari_iku/how-to-stop-claude-code-skills-from-drifting-with-per-step-constraint-design-2ogd))

Three concrete anti-patterns:

1. **100% Procedural, Zero Criteria**: "Calculate ROI" produces different formats, timeframes, and precision levels each invocation
2. **Selection Without Criteria**: "Recommend the optimal tool" without defining "optimal" -- rationale varies unpredictably
3. **Volume Without Quality**: "Roughly 5 pages" constrains length but not substance -- output passes surface inspection while remaining hollow

**Mitigation**: Per-step constraint design assigns different constraint types to each step:
- **Procedural** (HOW): Sequential tasks where divergence is acceptable
- **Criteria** (WHAT): Quality-dependent steps requiring explicit evaluation axes
- **Template**: Fixed output structures with flexible content
- **Guardrail**: Boundaries defined by prohibitions

No quantitative inconsistency data exists in the literature -- all analysis is qualitative. ([Source: dev.to/akari_iku](https://dev.to/akari_iku/how-to-stop-claude-code-skills-from-drifting-with-per-step-constraint-design-2ogd))

#### Skill Activation Instability (RAG Routing)

The runtime uses a Retrieval Step (RAG) to score available skills against the current user prompt. The runtime router often overrules static prompt instructions to prevent context saturation, resulting in inconsistent skill loading behavior. One practitioner reported that despite explicitly instructing the system to use five skills, only 0 to 3 would actually load during execution. ([Source: github.com/orgs/community/discussions/182117](https://github.com/orgs/community/discussions/182117))

**Root cause**: Deterministic instructions ("Always use these 5 skills") clash with probabilistic retrieval (RAG scoring).

**Workarounds**: Consolidate micro-skills into macro-skills, add "CRITICAL" or "MANDATORY" markers to descriptions, use explicit forcing instructions.

#### Cross-Platform Silent Failures

- VS Code requires `name` to match the parent directory name exactly; mismatch causes silent failure with zero indication
- `allowed-tools` frontmatter is only respected by Claude Code CLI and is **silently ignored by the Agent SDK**, creating a security escalation risk where skills gain broader permissions than intended
- Claude-specific frontmatter extensions (`model`, `mode`, `disable-model-invocation`, `hooks`) are ignored or cause errors in other agents
- A `skillcheck` validation tool was built by the community to catch these issues before deployment

([Source: dev.to/moonrunnerkc](https://dev.to/moonrunnerkc/your-skillmd-works-in-claude-code-but-silently-fails-in-vs-code-k9b), [Source: github.com/anthropics/claude-code/issues/18737](https://github.com/anthropics/claude-code/issues/18737))

#### Context Window Pressure

Many skills installed simultaneously can exceed the description character budget (2% of context window). Skills beyond the budget are silently excluded. Run `/context` to check for warnings. ([Source: code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills))

### 4.2 External Framework Failure Modes

#### Dependency Hell

Installation and dependency conflicts are "frequent but relatively easy to resolve," while orchestration and RAG engineering are "more difficult despite being less discussed." Agent stacks regularly span Python packages, native libraries, vendor SDKs, CLI tools, and sometimes JavaScript or JVM components. ([Source: arxiv.org/pdf/2510.25423](https://arxiv.org/pdf/2510.25423))

#### API Failures and Version Incompatibility

- MCP servers require running/deploying servers, writing JSON configs, managing runtime dependencies
- "Complex setup" with a "steep learning curve" -- developers report "widespread confusion about MCP's broad feature set"
- Discovered RCE (Remote Code Execution) flaws in popular MCP servers require careful permission configuration
- Adding one MCP tool changes the cached prefix, invalidating the cache for the entire conversation history

([Source: intuitionlabs.ai](https://intuitionlabs.ai/articles/claude-skills-vs-mcp))

#### High Context Cost

GitHub's MCP definition alone consumes "tens of thousands of tokens." MCP research servers with 10+ tools consume 5-10k tokens before asking the first question. This directly reduces available space for actual research content. ([Source: paddo.dev](https://paddo.dev/blog/three-ways-deep-research-claude/))

#### Orchestration Gaps

MCP and external frameworks struggle with "long sequences, app-specific data models, real-time triggers, human-in-the-loop scenarios." Production systems must handle constant breakage: "scraping breaks constantly" due to rate limiting, structural changes, and blocking -- requiring substantial engineering for fallback paths. ([Source: paddo.dev](https://paddo.dev/blog/three-ways-deep-research-claude/))

#### Deep Research Agent-Specific Failures

The FINDER/DEFT evaluation framework found that retrieval-related failures -- "insufficient evidence integration and fact-checking issues" -- account for **over 32% of errors** in deep research agents, regardless of architecture. This highlights that core challenges involve "deeper issues in evidence verification and reasoning resilience rather than simple task comprehension." ([Source: arxiv.org/pdf/2512.01948](https://arxiv.org/pdf/2512.01948))

#### Token Cost Spiraling

DIY recursive spawning: $1-5 per deep research query. Production pipeline: $0.20-0.60 per request. Token costs scale non-linearly with recursion depth. ([Source: paddo.dev](https://paddo.dev/blog/three-ways-deep-research-claude/))

---

## 5. Practitioner Experiences

### 5.1 Bozhidar Batsov (batsov.com) -- Skills Practitioner

Initially "mostly ignored the built-in skills" and created custom ones. Discovered value after accidentally using `/review` and `/simplify`. Identifies `/simplify` as "the skill I use most often" -- its three parallel review agents examine changes from different angles. Chains `/review` for correctness with `/simplify` for code cleanliness. Notes `/batch` works for uniform patterns but fails for complex redesigns. Recommends proactive `/compact` usage between logical work phases. ([Source: batsov.com](https://batsov.com/articles/2026/03/11/essential-claude-code-skills-and-commands/))

### 5.2 paddo.dev -- Three Approaches Compared

Describes a spectrum from minimal overhead (DIY shell scripts) through workflow integration (MCP servers) to full production systems. Key observations:

- **DIY (skill/prompt approach)**: "No framework or configuration overhead. High flexibility for exploration. Low initial investment." But "token costs spiral with depth recursion. No progress visibility. No session persistence. Quality depends entirely on prompt quality."
- **MCP approach**: "Integrates seamlessly into existing Claude Code workflows. Maintains current user habits." But "limited to MCP server-exposed capabilities. Single-session operation only. Upfront context token consumption."
- **Production frameworks**: Enable multi-source verification with confidence scoring. But require "significant engineering investment, infrastructure and API costs, constant maintenance burden."

Recommends starting with DIY to understand agent patterns, adding MCP to daily workflows, then graduating to production systems for specific domains. ([Source: paddo.dev](https://paddo.dev/blog/three-ways-deep-research-claude/))

### 5.3 Framework Comparison Practitioners

**Claude Agent SDK**: "If your entire stack runs on Anthropic, the Claude Agent SDK gives you the tightest integration. Permission modes like acceptEdits speed iteration when you trust the agent, while default mode keeps changes reviewable. Fewer accidents mean fewer retries."

**LangGraph**: "Leads on production maturity and persistence" but medium-to-high learning curve requiring "graph-based thinking."

**CrewAI**: "Fastest-growing agent framework." Low learning curve with role/task metaphor. "If that fits your mental model, you'll be productive in minutes."

**Practical recommendation**: "If your prototype edits files, runs bash, or needs strict approvals: start with Claude Agent SDK, wire up permissions and hooks, then add MCP tools as you go." ([Source: letsdatascience.com](https://letsdatascience.com/blog/ai-agent-frameworks-compared))

### 5.4 Simon Willison (via IntuitionLabs)

"One can write context markdown, ask Claude to do something, and iterate in minutes." Skills for non-technical teams enable rapid deployment of repeatable business processes. ([Source: intuitionlabs.ai](https://intuitionlabs.ai/articles/claude-skills-vs-mcp))

### 5.5 Rakuten Finance Team (via IntuitionLabs)

Reduced reporting tasks by 87.5% (day-long process to one hour) using skills. ([Source: intuitionlabs.ai](https://intuitionlabs.ai/articles/claude-skills-vs-mcp))

### 5.6 Community Feedback on Failures

Darshan Joshi (EMA.ai) advocates MCP for system integration, noting it "standardizes how LLMs interact with external applications," replacing brittle one-off integrations. However, IntuitionLabs notes that "high context cost" (GitHub MCP: tens of thousands of tokens), "complex setup," and "security concerns" (RCE flaws discovered) are real barriers. ([Source: intuitionlabs.ai](https://intuitionlabs.ai/articles/claude-skills-vs-mcp))

---

## 6. Summary: Decision Framework

| Dimension | SKILL.md Approach | External Framework | Hybrid |
|-----------|------------------|-------------------|--------|
| **Dependencies** | Zero (markdown only) | Heavy (Python packages, SDKs, runtime) | Moderate (skill + targeted MCP) |
| **Setup time** | Minutes | Hours to days | Hours |
| **Token efficiency** | Progressive disclosure (~100 tokens idle) | 5-10k+ tokens upfront per MCP server | Scoped MCP in sub-agents reduces main context cost |
| **Caching** | Native 92-97% prefix reuse, 81% cost reduction | Must implement separately or not at all | Inherits native caching for skill portions |
| **Context isolation** | Native sub-agent contexts | Must architect explicitly | Sub-agents with scoped MCP servers |
| **Reliability** | Prompt drift, RAG activation instability | API failures, version conflicts, dependency hell | Combined failure modes but more fallback options |
| **Determinism** | Low for prompt-only; high when bundling scripts | High for coded logic; low for LLM reasoning | Best of both -- scripts for deterministic, prompts for reasoning |
| **External data access** | Limited to WebFetch/WebSearch | Full API/database/service access | Full access via scoped MCP |
| **Portability** | Cross-surface (Claude.ai, CLI, SDK, API) | Framework-locked | Skill portable, MCP portions framework-dependent |
| **Production readiness** | Good for defined workflows; fragile at scale | Mature (LangGraph 1.0 GA) but complex | Most production-suitable for complex research |

### When to Use Each

- **SKILL.md alone**: Defined research workflows, single-model pipelines, rapid iteration, personal tooling, contexts where zero dependencies matter
- **External framework alone**: Multi-model orchestration, production systems requiring explicit state machines, teams with existing framework investment
- **Hybrid**: Production deep research, multi-source verification, workflows requiring both domain logic and external data access

---

## Sources

- [Anthropic: Equipping agents for the real world with Agent Skills](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Claude Code Sub-agents Documentation](https://code.claude.com/docs/en/sub-agents)
- [Claude Skills vs. MCP: A Tale of Two AI Customization Philosophies (subramanya.ai)](https://subramanya.ai/2025/10/30/claude-skills-vs-mcp-a-tale-of-two-ai-customization-philosophies/)
- [Claude Skills vs. MCP: A Technical Comparison (IntuitionLabs)](https://intuitionlabs.ai/articles/claude-skills-vs-mcp)
- [Three Ways to Build Deep Research with Claude (paddo.dev)](https://paddo.dev/blog/three-ways-deep-research-claude/)
- [Context Engineering & Reuse Pattern Under the Hood of Claude Code (LMCache Blog)](https://blog.lmcache.ai/en/2025/12/23/context-engineering-reuse-pattern-under-the-hood-of-claude-code/)
- [How to Stop Claude Code Skills from Drifting (dev.to/akari_iku)](https://dev.to/akari_iku/how-to-stop-claude-code-skills-from-drifting-with-per-step-constraint-design-2ogd)
- [Your SKILL.md Works in Claude Code but Silently Fails in VS Code (dev.to/moonrunnerkc)](https://dev.to/moonrunnerkc/your-skillmd-works-in-claude-code-but-silently-fails-in-vs-code-k9b)
- [allowed-tools Inconsistency Issue #18737 (GitHub)](https://github.com/anthropics/claude-code/issues/18737)
- [Skill Activation Instability Discussion #182117 (GitHub)](https://github.com/orgs/community/discussions/182117)
- [Essential Claude Code Skills and Commands (batsov.com)](https://batsov.com/articles/2026/03/11/essential-claude-code-skills-and-commands/)
- [claude-deep-research-skill (199-biotechnologies)](https://github.com/199-biotechnologies/claude-deep-research-skill)
- [Claude-Deep-Research MCP Server (mcherukara)](https://github.com/mcherukara/Claude-Deep-Research)
- [Cranot/deep-research](https://github.com/Cranot/deep-research)
- [How Prompt Caching Actually Works in Claude Code (claudecodecamp.com)](https://www.claudecodecamp.com/p/how-prompt-caching-actually-works-in-claude-code)
- [Claude Agent Skills Deep Dive (leehanchung)](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [AI Agent Frameworks Compared (letsdatascience.com)](https://letsdatascience.com/blog/ai-agent-frameworks-compared)
- [Challenges in AI Agent Systems (arxiv.org)](https://arxiv.org/pdf/2510.25423)
- [How Far Are We from Genuinely Useful Deep Research Agents (arxiv.org)](https://arxiv.org/pdf/2512.01948)
- [Prompt Caching - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

---

## Platforms Checked

- Anthropic official documentation (code.claude.com, claude.com/blog, platform.claude.com)
- GitHub (anthropics/claude-code issues, community discussions, open-source skill repositories)
- Independent practitioner blogs (paddo.dev, batsov.com, subramanya.ai, leehanchung.github.io)
- Technical analysis sites (intuitionlabs.ai, blog.lmcache.ai, dev.to)
- Academic papers (arxiv.org)
- Framework documentation sites (letsdatascience.com, langflow.org)
