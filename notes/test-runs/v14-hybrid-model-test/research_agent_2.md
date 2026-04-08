# Agentic Coding Assistants 2026: Practitioner / Applied Lens
**Agent:** research_agent_2 — PRACTITIONER / APPLIED  
**Date:** 2026-04-07  
**Scope:** Claude Code, Cursor, OpenAI Codex, GitHub Copilot, Aider, Cline, Continue, Devin, OpenHands

---

## T_a: Claude Code

**Primary Source:** https://code.claude.com/docs/en/overview (official docs, fetched 2026-04-07)  
**Supporting Source:** https://docs.anthropic.com/en/docs/claude-code/sub-agents  
**Webinar:** https://www.anthropic.com/webinars/claude-code-advanced-patterns  
**Pricing/Limits:** https://northflank.com/blog/claude-rate-limits-claude-code-pricing-cost

### Form Factor
Claude Code is a hybrid: CLI-first, but available across **five surfaces**:
- **Terminal CLI** — install via `curl -fsSL https://claude.ai/install.sh | bash` (macOS/Linux/WSL) or WinGet/Homebrew; runs locally, no backend server required; third-party provider support
- **VS Code extension** — inline diffs, @-mentions, plan review, conversation history
- **JetBrains plugin** — IntelliJ IDEA, PyCharm, WebStorm, others; interactive diff viewing
- **Desktop app** — standalone (macOS/Windows); visual diff review, multiple parallel sessions, scheduled tasks, cloud sessions
- **Web/Browser** — claude.ai/code; no local setup; long-running tasks, parallel tasks; available on Claude iOS app

> exact_quote: "Claude Code is an agentic coding tool that reads your codebase, edits files, runs commands, and integrates with your development tools. Available in your terminal, IDE, desktop app, and browser."
> source_url: https://code.claude.com/docs/en/overview

### Capability Matrix

| Feature | Supported | Notes |
|---|---|---|
| Multi-file edit | Yes | Plans across multiple files, verifies changes work |
| Shell execution | Yes | Runs commands directly from CLI |
| MCP support | Yes | Full MCP integration; connects to Google Drive, Jira, Slack, custom tools |
| Custom commands | Yes | Slash commands (e.g., `/review-pr`, `/deploy-staging`); shareable via plugins |
| Sub-agents | Yes | Spawn multiple Claude Code agents simultaneously; lead agent coordinates subtasks |
| Browser control | Yes | Chrome integration for debugging live web apps |
| CI/CD integration | Yes | GitHub Actions, GitLab CI/CD |
| Scheduled tasks | Yes | Cloud scheduled tasks (Anthropic infra) + Desktop scheduled tasks |
| Git operations | Yes | Stage, commit, branch, open PRs |
| Slack integration | Yes | Mention @Claude in Slack, get a PR back |
| Hooks | Yes | Shell commands before/after Claude Code actions (e.g., auto-format on save, lint before commit) |
| Plugins | Yes | Package/share slash commands, subagents, MCP servers, hooks |
| Remote control | Yes | Continue local sessions from phone/any browser |
| Channels | Yes | Push events from Telegram, Discord, iMessage, webhooks |
| Code review (auto) | Yes | GitHub Code Review — automated PR review on every PR |
| Voice/mobile | Yes | Claude iOS app integration; Dispatch from phone |

### Sub-agents Detail
> exact_quote: "Custom subagents in Claude Code are specialized AI assistants that can be invoked to handle specific types of tasks. They enable more efficient problem-solving by providing task-specific configurations with customized system prompts, tools and a separate context window."
> source_url: https://docs.anthropic.com/en/docs/claude-code/sub-agents

The Agent SDK (platform.claude.com) allows building fully custom agents powered by Claude Code's tools with full control over orchestration and permissions. Apple Xcode now supports the Claude Agent SDK (announced 2026).

### Pricing

| Plan | Cost | Notes |
|---|---|---|
| Pro | ~$20/month | ~45 messages per 5-hour rolling window |
| Max 5x | $100/month | 5x Pro usage |
| Max 20x | $200/month | 20x Pro usage |
| Team | $30/user/month | Min 5 users; premium seats with Claude Code |
| Enterprise | Custom (~$50K+/year) | Advanced admin controls, security |
| API (Console) | Standard token rates | Claude 4 Opus: $15/$75 per M tokens; Sonnet: $3/$15; Haiku 3.5: $0.80/$4.00 |

- Third-party provider support available for Terminal CLI and VS Code
- Models: Claude Opus 4.6, Sonnet 4.6, Haiku 4.5

### Rate Limits (Critical — March/April 2026 Context)

- **5-hour rolling window** for message/session limits; real trigger is total tokens processed (system prompts, file references, tool integrations, repeated context all count)
- **Weekly caps** introduced August 28, 2025: separate limits for overall usage and Claude Opus 4 specifically
- **Caching regression** reported March 23, 2026: users burning through 5-hour quota in under 90 minutes
- **Intentional throttle** announced March 26, 2026: during peak hours (5am–11am PT weekdays), users move through limits faster
- Anthropic acknowledged users "hitting usage limits in Claude Code way faster than expected" (The Register, 2026-03-31)

**API Tier Limits (TPM):**

| Tier | Input TPM | Output TPM | RPM | Unlock condition |
|---|---|---|---|---|
| Tier 1 | ~30,000 | — | 50 | After $5 credit purchase |
| Tier 2 | 40,000 | 8,000 | — | — |
| Tier 3 | 80,000 | 16,000 | — | — |
| Tier 4 | 2,000,000 | — | 4,000 | After $400 cumulative |

Source: https://platform.claude.com/docs/en/api/rate-limits

### Q1 2026 Notable Features
- **Auto mode**: Safer alternative to `--dangerously-skip-permissions` for long-running operations
- **Plugins system**: Package/share slash commands, subagents, MCP servers, hooks
- **Cloud scheduled tasks**: Run on Anthropic-managed infrastructure (keeps running when laptop is off)
- **Remote Control**: Continue local terminal sessions from phone or browser
- **Channels**: Accept events from Telegram, Discord, iMessage, webhooks
- **`claude --teleport`**: Teleport web/iOS session into terminal
- **`/schedule` command**: Create scheduled tasks from within CLI
- **Apple Xcode + Agent SDK**: Announced 2026

---

## T_b: Cursor

**Primary Source:** https://cursor.com/changelog/3-0 (Cursor 3.0 release notes, fetched 2026-04-07)  
**Pricing Source:** https://cursor.com/pricing (fetched 2026-04-07)  
**CLI Source:** https://cursor.com/changelog/cli-jan-16-2026  
**Search Sources:** markaicode.com/cursor-beta-features-2026/, cursor.com/blog/agent-best-practices

### Form Factor
- **IDE-native** (primary): Fork of VS Code; full development environment
- **CLI** (added January 2026): `cursor-agent` command; same tools as IDE agent
- **Cloud agents**: Run in cloud sandbox; access via cursor.com/agents (web + mobile)
- **Remote SSH**: Agents can run on remote machines
- **JetBrains** (added 2026): Plugin integration

### Capability Matrix

| Feature | Supported | Notes |
|---|---|---|
| Multi-file edit | Yes | Core Composer/agent capability; edits across entire codebase |
| Shell execution | Yes | Agent runs terminal commands autonomously |
| MCP support | Yes | Full MCP integration; 30+ plugins (Atlassian, Datadog, GitLab, Glean, Hugging Face, monday.com, PlanetScale, more) |
| Custom commands | Yes | Rules, prompts, shared across team |
| Sub-agents | Yes | Parallel agents in tabs; `/best-of-n` runs same task across multiple models in isolated worktrees |
| Browser control | Yes | Design Mode: annotate + target UI elements in browser; agent takes screenshots, tests apps |
| Automations | Yes | Always-on agents triggered by Slack, Linear, GitHub, PagerDuty, webhooks, or schedule |
| Cloud agents | Yes | Self-hosted or Cursor-hosted cloud sandbox |
| Git worktrees | Yes | `/worktree` command for isolated git branches |
| Await tool | Yes | Agent waits for background shell commands/subagents to complete |

> exact_quote: "Cursor now supports automations for building always-on agents that run based on triggers and instructions you define, running on schedules or triggered by events from Slack, Linear, GitHub, PagerDuty, and webhooks."
> source_url: https://cursor.com/changelog/3-0

### Pricing

| Plan | Cost | Notes |
|---|---|---|
| Hobby (Free) | $0 | Limited agent requests, limited Tab completions |
| Pro | $20/month | Extended limits; access to frontier models; MCPs, skills, hooks; cloud agents; ~225 Claude Sonnet requests |
| Pro+ | $60/month | 3x usage on all OpenAI, Claude, Gemini models |
| Ultra | $200/month | 20x usage; priority access to new features |
| Teams | $40/user/month | Shared chats/commands/rules; centralized billing; SAML/OIDC SSO; RBAC; usage analytics |
| Enterprise | Custom | Pooled usage; invoice/PO; SCIM; AI code tracking API; audit logs; granular model controls |
| BugBot Pro | $40/user/month | Up to 200 PR reviews/month |
| BugBot Teams | $40/user/month | Unlimited PR reviews |

**Free Hobby tier includes:** 50 premium agent requests/month  
**Pro $20/month:** ~$20 credit pool (roughly 225 Claude Sonnet requests per month)

### Q1 2026 Features

**January 2026 (CLI release — cursor.com/changelog/cli-jan-16-2026):**
- `cursor-agent` CLI command: agent modes (Plan and Ask) in terminal
- Cloud handoff: push CLI chats to cloud agents, pick up on web/mobile at cursor.com/agents
- One-click MCP auth
- Plan mode via `/plan` or `--mode=plan`: Cursor asks clarifying questions before acting

**Cursor 3.0 (Q1 2026 — cursor.com/changelog/3-0):**
- New Agents Window: run many agents in parallel across local, worktrees, cloud, remote SSH
- Agent Tabs: view multiple chats side-by-side or in grid
- Design Mode: annotate and target UI elements directly in browser
- `/worktree` command: isolated git worktrees
- `/best-of-n` command: run same task across multiple models, compare outcomes
- Self-hosted cloud agents: code/builds/secrets stay on internal machines
- MCP Apps structured content: richer tool outputs
- 30+ new plugins from Atlassian, Datadog, GitLab, Glean, Hugging Face, monday.com, PlanetScale
- Await tool: agents wait for background processes
- JetBrains plugin introduced
- Composer 2 model: frontier-level coding performance
- Enterprise: admin controls restrict cloud agent secrets to admins; disable "Made with Cursor" attribution

---

## T_c: OpenAI Codex

**Primary Sources:**  
- https://developers.openai.com/codex/pricing (fetched 2026-04-07)  
- https://openai.com/index/introducing-the-codex-app/ (403 blocked; search-supplemented)  
- Search results from getaiperks.com, uibakery.io, help.openai.com/en/articles/20001106-codex-rate-card

### Form Factor
- **Cloud agent** (primary): Browser-based task management; multiple parallel agents
- **CLI**: Open-source command-line tool; runs locally; uses GPT-5 by default; multimodal (screenshots, diagrams)
- **IDE extension**: Available for Plus and Pro subscribers (VS Code confirmed)
- **iOS app**: Available on Plus and Pro

> exact_quote: "Codex is included in your ChatGPT Free, Go, Plus, Pro, Business, Edu, or Enterprise plan."
> source_url: https://developers.openai.com/codex/pricing

### Capability Matrix

| Feature | Supported | Notes |
|---|---|---|
| Multi-file edit | Yes | Tested on 8-file migrations with type checking |
| Shell execution | Yes | Runs test harnesses, linters, commits changes autonomously |
| MCP support | Not confirmed | No explicit MCP documentation found |
| Sub-agents | Yes | Multiple parallel agents; manage from web app |
| Browser control | Not confirmed | Cloud tasks involve external API calls; no explicit browser automation |
| CI integration | Yes | Code review automation included |
| Multimodal input | Yes | Accepts screenshots and diagrams as input |
| Git operations | Yes | Reads/edits files, runs tests, commits, opens PRs autonomously |

Task completion range: **1–30 minutes** depending on complexity.

### Pricing (Updated April 2, 2026 — token-based pricing)

**ChatGPT Plan Inclusions:**

| Plan | Cost | Codex Usage (5-hour window) |
|---|---|---|
| Free | $0 | Basic exploration (limited) |
| Go | $8/month | Lightweight tasks |
| Plus | $20/month | 33–168 GPT-5.4 local messages; 45–225 GPT-5.3-Codex messages; 10 code reviews/week |
| Pro | $200/month | 223–1,120 GPT-5.4 local messages; 300–1,500 GPT-5.3-Codex messages; 100 code reviews/week; 6x vs. Plus |
| Business | Seat-based | 15–60 GPT-5.4 messages; 20–90 GPT-5.3-Codex messages; 15 code reviews/week |
| Enterprise/Edu | Custom | Unlimited/custom allocation |

**API Token Rates (Business/Enterprise, effective April 2, 2026):**

| Model | Input (per M tokens) | Output (per M tokens) |
|---|---|---|
| GPT-5.4 | 62.50 credits | 375 credits |
| GPT-5.3-Codex | 43.75 credits | 350 credits |
| codex-mini-latest (API) | $1.50 | $6.00 |
| GPT-5 (API) | $1.25 | $10.00 |

- Legacy message-based rates available for existing customers pending migration
- No standalone Codex subscription; bundled with ChatGPT plans
- For a limited time: Codex included with Free and Go; Plus/Pro/Business/Enterprise/Edu rate limits doubled

### Rate Limits
- Usage limit shared across local and cloud tasks within same **5-hour window**
- Pro gets priority processing vs. Plus

### Q1 2026 Features
- Codex app announced: browser-based multi-agent management interface
- Flexible pricing updated April 2, 2026: per-token billing replaces per-message for Business/Enterprise
- GPT-5.4 and GPT-5.3-Codex model availability
- Multimodal input (screenshots, diagrams) in CLI

---

## T_d: GitHub Copilot

**Primary Sources:**  
- https://docs.github.com/en/copilot/get-started/plans (fetched 2026-04-07)  
- https://github.com/features/copilot (fetched 2026-04-07)  
- https://docs.github.com/en/copilot/concepts/rate-limits  

### Form Factor
- **IDE-native** (primary): Extensions for VS Code, Visual Studio, JetBrains suite (IntelliJ, PyCharm, WebStorm, etc.), Neovim, Azure Data Studio
- **GitHub.com** (native): Copilot Chat, Workspace, Copilot agent in issue/PR workflow
- **GitHub Mobile**: Available
- **GitHub CLI**: `gh copilot` commands
- **Windows Terminal** (Canary): Preview integration

### Capability Matrix

| Feature | Supported | Notes |
|---|---|---|
| Multi-file edit | Yes | Copilot Edits; Workspace plans across dozens of files |
| Shell execution | Yes | Agent mode runs terminal commands; Workspace executes tests |
| MCP support | Yes | Added in 2026 |
| Custom commands | Yes | Extensions ecosystem |
| Sub-agents | Partial | Copilot agent assigned to issues works autonomously; no explicit sub-agent spawning |
| Browser control | Not confirmed | No explicit browser control documentation found |
| CI integration | Yes | Code review agent on every PR |
| Issue-to-PR | Yes | Assign issue to Copilot; it writes code, runs tests, opens PR |
| Copilot Spaces | Yes | Team context management for shared repos/docs |
| Copilot Workspace | Yes | Agentic system: reads codebase, plans across files, writes code, runs tests, opens PR |

> exact_quote: "As of March 2026, Copilot's autonomous multi-step coding agent works in both VS Code and JetBrains, determining which files to edit, running terminal commands, and iterating on errors without manual intervention."
> source_url: (search summary from docs.github.com/en/copilot)

> exact_quote: "Copilot Workspace reads entire codebases, plans solutions across dozens of files, writes code, runs tests, and opens pull requests from a single natural language prompt."
> source_url: https://github.com/features/copilot

### Pricing

| Plan | Cost | Premium Requests/Month | Key Features |
|---|---|---|---|
| Free | $0 | 50 | 2,000 completions/month; 50 chat requests; CLI; no credit card |
| Student | $0 (verified) | 300 | Cloud agent; premium models in chat |
| Pro | $10/month | 300 | Unlimited completions; multi-model (Claude, GPT-4, Gemini); code review; cloud agent |
| Pro+ | $39/month | 1,500 | All models; GitHub Spark access; enhanced agent capabilities |
| Business | $19/user/month | 300/user | Centralized management; policy control; SAML SSO; usage metrics |
| Enterprise | $39/user/month | 1,000/user | All Business + Claude Opus 4.6; GitHub Spark; enterprise audit logs; governance |

**Overage:** Extra premium requests cost **$0.04 each**. Allowances reset monthly at 00:00:00 UTC.

**Models available (2026):** Claude Opus 4.6, Gemini 2.5 Pro, o3-mini, GPT-4o, and more across most paid tiers.

### Rate Limits
- 5,000 requests per minute; 1 million tokens per minute (Pro tier)
- Scales to 100,000 RPM on Enterprise
- Preview models: stricter limits due to limited capacity
- "Service-level rate limits should not affect typical Copilot usage" (GitHub docs)

### Q1 2026 Features
- **MCP support** added (2026)
- **Agent mode in JetBrains** (as of March 2026): now matches VS Code parity
- **Copilot Spaces**: Team context management
- **Expanded model access**: Claude Opus 4.6, Gemini 2.5 Pro added to Enterprise
- **Code review agent**: Automated PR review across all paid tiers
- **Extensions ecosystem** expansion

---

## T_e: Aider, Cline, Continue

### Aider

**Primary Sources:**  
- https://aider.chat/ (fetched 2026-04-07)  
- https://aider.chat/docs/leaderboards/ (fetched 2026-04-07)  
- https://aider.chat/docs/usage/modes.html (fetched 2026-04-07)

#### Form Factor
- **Terminal CLI** (primary): Python-based; `pip install aider-chat`; runs in any terminal
- **IDE integration**: VS Code extensions (VSCode Aider, Aider Composer, MattFlower's extension — auto-syncs open files); file-watching mode
- **Web chat compatibility**: Copy/paste with LLM web interfaces

#### Capability Matrix

| Feature | Supported | Notes |
|---|---|---|
| Multi-file edit | Yes | Core feature; codebase mapping for large projects |
| Shell execution | Yes | Auto-runs linters and tests after changes |
| MCP support | Not confirmed | No explicit MCP documentation found |
| Custom commands | Partial | Chat modes switchable via `/code`, `/ask`, `/architect`, `/help` |
| Sub-agents | Partial | Architect mode uses two LLMs (architect proposes, editor implements) |
| Browser control | Not confirmed | Not documented |
| Git integration | Yes | Auto-commits with sensible messages |
| Voice-to-code | Yes | Spoken requests for features/tests/bug fixes |
| Visual context | Yes | Images and web pages accepted as input |
| 100+ languages | Yes | Python, JS, Rust, Ruby, Go, C++, PHP, HTML, CSS, more |
| Codebase mapping | Yes | Repo-map for better large codebase performance |

**Chat Modes:**
1. **Code mode** (default): Makes file edits
2. **Ask mode** (`/ask`): Discusses/answers without changing files
3. **Architect mode** (`/architect`): Two-LLM pipeline — architect proposes, editor implements; best with o1/o3 + Sonnet pairings
4. **Help mode** (`/help`): Answers questions about aider itself

> exact_quote: "A recommended workflow is to bounce back and forth between /ask and /code modes."
> source_url: https://aider.chat/docs/usage/modes.html

#### Pricing
- **Free and open-source** (MIT license; 42K GitHub stars as of 2025)
- No platform cost; pay only underlying LLM API costs
- Community estimates: $10–40/month using Claude Sonnet
- 5.7M pip installations; 15 billion tokens used weekly; 88% of new code in recent releases written by Aider itself

#### Benchmarks (Aider Polyglot Leaderboard — 225 Exercism exercises, 6 languages)

| Model | Pass Rate | Cost |
|---|---|---|
| GPT-5 (high effort) | 88.0% | $29.08 |
| GPT-5 (medium) | 86.7% | $17.69 |
| o3-pro (high) | 84.9% | $146.32 |
| Gemini 2.5 Pro (32k thinking) | 83.1% | $49.88 |
| GPT-5 (low) | 81.3% | $10.37 |
| DeepSeek-V3.2 (Chat) | 70.2% | $0.88 |
| Claude 3.5 Sonnet (architect mode) | 64% | $13.29 |

Source: https://aider.chat/docs/leaderboards/

---

### Cline

**Primary Sources:**  
- https://cline.bot (fetched via search 2026-04-07)  
- https://github.com/cline/cline  
- https://cline.bot/pricing

#### Form Factor
- **VS Code extension** (primary): Open-source, MIT license; free to install
- Model-agnostic BYOK (bring-your-own-key): Claude, GPT-4, Gemini, DeepSeek, Ollama, any OpenAI-compatible endpoint

#### Capability Matrix

| Feature | Supported | Notes |
|---|---|---|
| Multi-file edit | Yes | Create/edit files across project |
| Shell execution | Yes | Terminal commands with user permission at each step |
| MCP support | Yes | MCP Marketplace (curated catalog); CI/CD, cloud monitoring, database, project management tools |
| Custom commands | Partial | Plan/Act mode switching |
| Sub-agents | Not confirmed | Not explicitly documented |
| Browser control | Yes | Headless browser: click, type, scroll, screenshots, console logs |
| Plan/Act modes | Yes | Dual modes for strategy vs. execution |
| Local models | Yes | Ollama support up to 70B parameters |

> exact_quote: "Cline can use the Model Context Protocol (MCP) to create new tools and extend his own capabilities."
> source_url: https://github.com/cline/cline

> exact_quote: "For web development tasks, Cline can launch the site in a headless browser, click, type, scroll, and capture screenshots + console logs."
> source_url: https://cline.bot

#### Pricing
- Cline VS Code extension: **free to install**
- BYOK model: pay AI providers directly (not Cline)
- Community estimates: **$10–40/month** using Claude Sonnet
- **Teams tier free for all team sizes through Q1 2026**
- 5 million+ developers by mid-2025

#### MCP Marketplace (launched v3.4, February 2025)
One-click install of MCP servers; categories: web scraping, file systems, research tools, CI/CD pipelines, cloud monitoring, database connections, project management.

---

### Continue

**Primary Sources:**  
- https://www.continue.dev/pricing (fetched 2026-04-07)  
- https://github.com/continuedev/continue  
- https://blog.continue.dev/

#### Form Factor
- **VS Code extension + JetBrains plugin** (primary): IDE-native
- **CLI**: Included for terminal workflows
- Open-source, Apache-2.0 license

#### Capability Matrix

| Feature | Supported | Notes |
|---|---|---|
| Multi-file edit | Yes | Agent mode across files |
| Shell execution | Not confirmed | Not explicitly documented in available sources |
| MCP support | Yes | Integrates with GitHub, Sentry, Snyk, Linear via MCP tools |
| Custom commands | Yes | Continue Hub: centrally configure models, prompts, rules, MCP tools; enforce allow/block lists |
| Sub-agents | Not confirmed | Not explicitly documented |
| Browser control | Not confirmed | Not documented |
| Chat / Plan / Agent modes | Yes | Three distinct interaction modes |
| Model flexibility | Yes | OpenAI, Anthropic, Mistral, Together, Azure OpenAI, Ollama, LM Studio |
| API key proxying | Yes | Continue Hub proxies keys so devs can use but not view secrets |

#### Pricing

| Plan | Cost | Notes |
|---|---|---|
| Starter (Free) | $0 | Create/run AI agents; connect integrations; purchase credits for frontier models |
| Team | $20/seat/month | $10 in credits per seat; shared private agents; team management; Gmail/GitHub SSO |
| Company | Custom | Custom SSO (SAML/OIDC); BYOK option; commitment plans; SLAs |

- No usage limits specified in available documentation
- Starter: $3/million tokens (pay-as-you-go for credits)

---

## T_f: Devin and OpenHands

### Devin (Cognition AI)

**Primary Sources:**  
- https://devin.ai/pricing/ (fetched 2026-04-07)  
- https://venturebeat.com/programming-development/devin-2-0-is-here-cognition-slashes-price-of-ai-software-engineer-to-20-per-month-from-500  
- https://techcrunch.com/2025/04/03/devin-the-viral-coding-ai-agent-gets-a-new-pay-as-you-go-plan/

#### Form Factor
- **Cloud-based IDE** (primary): Fully browser-based; Devin runs its own terminal, browser, and code editor
- No local installation required; access via devin.ai
- Parallel sessions: multiple Devins running simultaneously (up to 10 on Core; unlimited on Team/Enterprise)

#### Capability Matrix

| Feature | Supported | Notes |
|---|---|---|
| Multi-file edit | Yes | Autonomous across entire codebase |
| Shell execution | Yes | Opens its own terminal; runs tests, linters, deploys |
| MCP support | Not confirmed | Uses its own tool set |
| Custom commands | Partial | Interactive Planning: starts broad, scopes detailed PLAN.md |
| Sub-agents | Partial | Multiple parallel Devin sessions; not true sub-agents |
| Browser control | Yes | Opens its own browser; searches for solutions, navigates docs |
| Devin Wiki | Yes | Knowledge base that Devin builds about your codebase |
| Devin API | Yes | Programmatic task submission |
| Ask Devin | Yes | Chat with Devin about tasks mid-flight |
| Devin IDE | Yes | Users can step in to review/edit/guide progress |

> exact_quote: "Devin distinguishes itself by being an agent that doesn't just write code; it plans, executes, debugs, deploys, and monitors applications."
> source_url: https://aitoolsdevpro.com/ai-tools/devin-guide/

#### Pricing (as of 2026)

| Plan | Cost | ACUs Included | ACU Rate | Concurrent Sessions |
|---|---|---|---|---|
| Core | Pay-as-you-go from $20 | 0 included | $2.25/ACU | Up to 10 |
| Team | $500/month | 250 ACUs/month | $2.00/ACU | Unlimited |
| Enterprise | Custom | Custom | Custom | Unlimited |

**ACU definition:** Agent Compute Unit = normalized measure of computing resources (VM time + model inference + networking bandwidth). Consumption varies by task complexity, codebase size, session duration.

**Devin 2.0 pricing cut:** Original launch price was $500/month; Core plan now starts at $20 (pay-as-you-go), dramatically lowering entry barrier.

**Enterprise extras:** VPC deployment, SAML/OIDC SSO, centralized admin controls, teamspace isolation, dedicated account team, custom terms.

#### Benchmarks
- SWE-bench: 13.86% end-to-end (Cognition internal); independent testing shows 15–30% in practice
- Devin 2.0 vs. 1.x: 83% more junior-level tasks completed per ACU (Cognition internal benchmark)

> exact_quote: "Nubank achieved a 12x efficiency improvement in terms of engineering hours saved, and over 20x cost savings with Devin handling their migrations."
> source_url: https://aitoolsdevpro.com/ai-tools/devin-guide/

Goldman Sachs piloted Devin alongside 12,000 human developers.

**Best fit:** Engineering teams with consistent backlogs of well-defined tasks — migrations, data engineering, repetitive refactoring, infrastructure — with 5+ engineers where 20–30% of ticket queue is addressable by autonomous agent.

---

### OpenHands (formerly OpenDevin — All-Hands-AI)

**Primary Sources:**  
- https://openhands.dev/ (fetched via search)  
- https://openhands.dev/blog/openhands-product-update---march-2026  
- https://openhands.dev/pricing  
- https://openhands.dev/blog/openhands-index (Jan 28, 2026)

#### Form Factor
- **Open-source** (primary): Self-host in Docker sandbox; GitHub repo at All-Hands-AI/OpenHands
- **Cloud platform**: openhands.dev (managed); Team and Enterprise hosted plans
- **Kubernetes**: Added in v1.6.0 (March 30, 2026) with RBAC and multi-user support
- **Local**: AMD workstation support (local AI + AMD hardware guide)

#### Capability Matrix

| Feature | Supported | Notes |
|---|---|---|
| Multi-file edit | Yes | Writes code across entire codebase |
| Shell execution | Yes | Runs terminal commands in sandboxed Docker environment |
| MCP support | Not confirmed | Uses its own tool set; GitHub integration confirmed |
| Custom commands | Partial | Planning Mode (v1.6): generates structured PLAN.md |
| Sub-agents | Not confirmed | Not explicitly documented |
| Browser control | Yes | Browses the web inside sandbox |
| Git/GitHub integration | Yes | Opens pull requests; summarizes PRs; applies feedback |
| Test generation | Yes | Fixes tests, expands test coverage |
| Documentation | Yes | Generates release notes from code changes |
| Planning Mode | Yes (beta) | Added v1.6.0; Plan Mode generates PLAN.md, switches to Code Mode |
| Kubernetes | Yes | Added v1.6.0; multi-user, RBAC |

> exact_quote: "On SWE-bench Verified (the standard test for AI software engineering agents), it resolves 53%+ of real-world GitHub issues when paired with strong models like Claude 4.5."
> source_url: https://openhands.dev/ (search summary)

#### Pricing

| Plan | Cost | Notes |
|---|---|---|
| Open Source (self-host) | Free | Full capabilities; self-managed Docker/Kubernetes |
| Cloud (individual) | Usage-based | ~$0.15–$0.60 per task (50K–200K tokens at Claude 4.5 pricing) |
| Team | Custom | Advanced control, scalability |
| Enterprise | Custom + license | Enterprise self-hosting requires license after evaluation period |

**Token cost estimate:** 50K–200K tokens per session; at Claude 4.5 pricing ≈ $0.15–$0.60/task.

#### Benchmarks
- **SWE-bench Verified:** 53%+ with Claude 4.5 (vs. Devin's ~14% internal benchmark)
- **OpenHands Index** (launched Jan 28, 2026): broader evaluation covering issue resolution, greenfield app dev, frontend tasks, and testing

#### Recent Milestones
- Rebranded from OpenDevin → OpenHands (late 2024)
- Raised $18.8M Series A
- v1.6.0 released March 30, 2026: Kubernetes support + Planning Mode beta
- AMD partnership: local AI on AMD workstations

---

## Master Feature Comparison Matrix

| Tool | Form Factor | Multi-file | Shell | MCP | Browser | Sub-agents | Custom Cmds | Free Tier |
|---|---|---|---|---|---|---|---|---|
| Claude Code | CLI+IDE+Web+Desktop | Yes | Yes | Yes | Yes | Yes | Yes (plugins) | No (sub free on claude.ai has limits) |
| Cursor | IDE-native+CLI | Yes | Yes | Yes | Yes | Yes | Yes | Yes (50 req/mo) |
| OpenAI Codex | Cloud+CLI+IDE ext | Yes | Yes | No (unconfirmed) | No (unconfirmed) | Yes (parallel) | Partial | Yes (Free plan) |
| GitHub Copilot | IDE-native+Web+CLI | Yes | Yes | Yes | No (unconfirmed) | Partial | Yes (extensions) | Yes (50 req/mo) |
| Aider | CLI+IDE (extension) | Yes | Yes (lint/test) | No | No | Partial (architect) | Partial (modes) | Yes (BYOK) |
| Cline | VS Code ext | Yes | Yes | Yes | Yes (headless) | No | Partial | Yes (BYOK) |
| Continue | IDE ext+CLI | Yes | Unconfirmed | Yes | No | No | Yes (Hub) | Yes (free tier) |
| Devin | Cloud IDE | Yes | Yes | No (unconfirmed) | Yes | Partial (parallel) | Partial (planning) | No |
| OpenHands | Self-host+Cloud | Yes | Yes | No (unconfirmed) | Yes | No | Partial (planning) | Yes (self-host) |

---

## Pricing Summary Table

| Tool | Free Tier | Entry Paid | Mid Tier | Power Tier | Enterprise |
|---|---|---|---|---|---|
| Claude Code | No | Pro $20/mo (45 msg/5h) | Max $100–200/mo | — | Team $30/user, Enterprise custom |
| Cursor | Hobby (50 req/mo) | Pro $20/mo | Pro+ $60/mo | Ultra $200/mo | Teams $40/user, Enterprise custom |
| OpenAI Codex | Yes (ChatGPT Free) | Plus $20/mo | Pro $200/mo | — | Business/Enterprise custom |
| GitHub Copilot | Yes (50 req/mo) | Pro $10/mo | Pro+ $39/mo | — | Business $19/user, Enterprise $39/user |
| Aider | Yes (BYOK) | BYOK only | — | — | — |
| Cline | Yes (BYOK) | BYOK; Teams free Q1 2026 | — | — | Custom |
| Continue | Yes (Starter) | Team $20/seat/mo | — | — | Company custom |
| Devin | No | Core PAYG from $20 | Team $500/mo | — | Enterprise custom |
| OpenHands | Yes (self-host) | Cloud usage-based | Team custom | — | Enterprise custom |

---

## Sources Cited

1. https://code.claude.com/docs/en/overview — Claude Code official docs
2. https://docs.anthropic.com/en/docs/claude-code/sub-agents — Claude Code sub-agents docs
3. https://www.anthropic.com/webinars/claude-code-advanced-patterns — Anthropic webinar on sub-agents/MCP
4. https://www.anthropic.com/news/claude-code-plugins — Claude Code plugins announcement
5. https://northflank.com/blog/claude-rate-limits-claude-code-pricing-cost — Claude Code rate limits analysis
6. https://platform.claude.com/docs/en/api/rate-limits — Anthropic API rate limits (official)
7. https://www.theregister.com/2026/03/31/anthropic_claude_code_limits/ — The Register: Claude Code quota issues
8. https://cursor.com/changelog/3-0 — Cursor 3.0 release notes (official)
9. https://cursor.com/changelog/cli-jan-16-2026 — Cursor CLI January 2026 release (official)
10. https://cursor.com/pricing — Cursor pricing page (official)
11. https://developers.openai.com/codex/pricing — OpenAI Codex pricing (official)
12. https://help.openai.com/en/articles/20001106-codex-rate-card — OpenAI Codex rate card (official)
13. https://docs.github.com/en/copilot/get-started/plans — GitHub Copilot plans (official)
14. https://github.com/features/copilot — GitHub Copilot features page (official)
15. https://docs.github.com/en/copilot/concepts/rate-limits — GitHub Copilot rate limits (official)
16. https://aider.chat/ — Aider homepage
17. https://aider.chat/docs/leaderboards/ — Aider polyglot benchmark leaderboard
18. https://aider.chat/docs/usage/modes.html — Aider chat modes docs
19. https://github.com/cline/cline — Cline GitHub repo
20. https://cline.bot — Cline official site
21. https://www.continue.dev/pricing — Continue pricing page (official)
22. https://devin.ai/pricing/ — Devin pricing page (official)
23. https://venturebeat.com/programming-development/devin-2-0-is-here-cognition-slashes-price-of-ai-software-engineer-to-20-per-month-from-500 — Devin 2.0 announcement
24. https://openhands.dev/blog/openhands-product-update---march-2026 — OpenHands March 2026 update (official)
25. https://openhands.dev/blog/openhands-index — OpenHands Index launch (official, Jan 28, 2026)

---

## TASK STATUS SUMMARY

- T_a: done — Claude Code: form factor (5 surfaces), full capability matrix, pricing tiers, rate limits (5-hour window, weekly caps, March 2026 regression), Q1 2026 features (auto mode, plugins, cloud scheduled tasks, remote control, channels, teleport)
- T_b: done — Cursor: form factor (IDE+CLI+cloud), full capability matrix, Q1 2026 features (Cursor 3.0 interface, Automations, cloud agents, MCP Apps, JetBrains plugin, CLI Jan 2026), pricing (Hobby/Pro/Pro+/Ultra/Teams/Enterprise)
- T_c: done — OpenAI Codex: form factor (cloud+CLI+IDE ext), capability matrix, pricing (bundled with ChatGPT plans; April 2, 2026 token-based rate card; per-model token costs), rate limits (5-hour window), Q1 2026 updates (Codex app launch, token-based pricing)
- T_d: done — GitHub Copilot: form factor (IDE-native in 6 IDEs + GitHub.com + CLI), pricing (5 tiers with exact premium request counts), rate limits (5K RPM/1M TPM Pro; 100K RPM Enterprise; $0.04/overage), Q1 2026 (MCP added, JetBrains agent mode parity, Copilot Spaces, expanded models)
- T_e: done — Aider: CLI+IDE extensions, 4 chat modes (architect dual-LLM), BYOK free, polyglot benchmark data (GPT-5 88%, Claude Sonnet 64% architect); Cline: VS Code BYOK, MCP Marketplace, headless browser, Plan/Act modes, Teams free Q1 2026; Continue: VS Code+JetBrains, 3 modes, MCP tools, Hub, pricing tiers ($0/$20/custom)
- T_f: done — Devin: cloud IDE, ACU-based pricing ($2.25/ACU PAYG; $500/mo Team), Devin 2.0 (83% more tasks/ACU), SWE-bench 13.86%, Nubank 12x efficiency case study, Goldman Sachs pilot; OpenHands: open-source self-host + cloud, SWE-bench 53%+ with Claude 4.5, v1.6.0 March 30 2026 (Kubernetes + Planning Mode), $18.8M Series A
