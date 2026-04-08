# CLI Spawning Research: Bypassing Sub-Agent Nesting via `claude -p`

**Date:** 2026-03-25
**Objective:** Determine whether a Claude Code subagent can spawn a NEW Claude Code CLI instance via Bash to bypass the sub-agent nesting limitation, enabling deep research to run in the background with full sub-agent capabilities.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [CLI Flags Reference](#cli-flags-reference)
3. [Tool Availability in Print Mode](#tool-availability-in-print-mode)
4. [Skills and Context Loading](#skills-and-context-loading)
5. [Monitoring Spawned Instances](#monitoring-spawned-instances)
6. [Cost Implications](#cost-implications)
7. [Community Patterns and Precedent](#community-patterns-and-precedent)
8. [Background Process Support](#background-process-support)
9. [The Nesting Limitation In Detail](#the-nesting-limitation-in-detail)
10. [Feasibility Assessment](#feasibility-assessment)
11. [Recommended Architecture](#recommended-architecture)
12. [Sources](#sources)

---

## Executive Summary

**Yes, it is technically possible** to spawn a new Claude Code CLI instance from within a Bash tool call using `claude -p "prompt"`. This creates an entirely separate process with its own context window, full tool access (Bash, Read, Edit, Write, WebSearch, WebFetch, Agent tool), and the ability to spawn its own subagents. However, this approach has significant trade-offs that must be carefully managed.

### Key Findings

| Question | Answer |
|----------|--------|
| Can `claude -p` run full sessions with tool use? | **Yes** -- all tools available including WebSearch, Bash, file writes, and the Agent tool |
| Does it load skills from ~/.claude/skills/? | **Yes** in normal mode; **No** in `--bare` mode (which skips skills, hooks, MCP, CLAUDE.md) |
| Can a parent monitor the spawned instance? | **Yes** -- via stdout capture, file writes, `--output-format json/stream-json`, and session continuation |
| Is it a separate API session? | **Yes** -- completely separate token usage, rate limits, and billing |
| Has this pattern been documented? | **Yes** -- community project `claude-recursive-spawn` exists; pattern discussed in GitHub issues |
| Are there background/daemon flags? | **No native daemon mode** -- but `--output-format stream-json` enables real-time monitoring, and standard Unix tools (nohup, &) work |

### Bottom Line

This approach **works** but is officially discouraged by Anthropic. The spawned `claude -p` instance is a first-class Claude Code session with full capabilities, making it a viable workaround for the nesting limitation. The main risks are cost amplification, loss of structured error propagation, and no built-in progress visibility from the parent.

---

## CLI Flags Reference

### Complete Flag Inventory (from official docs at code.claude.com)

#### Core Execution Flags

| Flag | Description |
|------|-------------|
| `--print`, `-p` | Run non-interactively: process prompt, print response, exit. This is the key flag for spawning. |
| `--continue`, `-c` | Continue the most recent conversation in the current directory |
| `--resume`, `-r` | Resume a specific session by ID or name |
| `--output-format` | Output format: `text` (default), `json`, `stream-json` |
| `--input-format` | Input format for print mode: `text`, `stream-json` |
| `--include-partial-messages` | Include partial streaming events (requires `-p` + `stream-json`) |
| `--verbose` | Enable verbose logging with full turn-by-turn output |

#### Cost and Safety Controls

| Flag | Description |
|------|-------------|
| `--max-turns` | Limit number of agentic turns (print mode only). No limit by default. |
| `--max-budget-usd` | Maximum dollar spend before stopping (print mode only) |
| `--allowedTools` | Tools that execute without permission prompts. Supports pattern matching (e.g., `"Bash(git log *)"`) |
| `--disallowedTools` | Tools removed from model's context entirely |
| `--tools` | Restrict which built-in tools are available. `""` = none, `"default"` = all, or `"Bash,Edit,Read"` |
| `--dangerously-skip-permissions` | Skip ALL permission prompts (use with extreme caution) |
| `--permission-mode` | Set permission mode: `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |

#### Context and Prompt Customization

| Flag | Description |
|------|-------------|
| `--system-prompt` | Replace the ENTIRE system prompt with custom text |
| `--system-prompt-file` | Replace system prompt from file |
| `--append-system-prompt` | Append custom text to default system prompt (preserves built-in capabilities) |
| `--append-system-prompt-file` | Append file contents to default prompt |
| `--bare` | Skip auto-discovery of hooks, skills, plugins, MCP, auto memory, CLAUDE.md. Only Bash, Read, and Edit tools. Fastest startup. |

#### Session and Configuration

| Flag | Description |
|------|-------------|
| `--model` | Set model: `sonnet`, `opus`, or full model ID like `claude-sonnet-4-6` |
| `--effort` | Effort level: `low`, `medium`, `high`, `max` (Opus 4.6 only) |
| `--session-id` | Use specific UUID for conversation |
| `--no-session-persistence` | Don't save session to disk (print mode only) |
| `--mcp-config` | Load MCP servers from JSON file or string |
| `--strict-mcp-config` | Only use MCP servers from --mcp-config, ignore all other configs |
| `--agents` | Define custom subagents dynamically via JSON (session-only) |
| `--agent` | Run the session AS a specific agent (uses agent's system prompt) |
| `--add-dir` | Add additional working directories for Claude to access |
| `--worktree`, `-w` | Start in isolated git worktree |
| `--json-schema` | Get validated JSON output matching a schema (print mode only) |
| `--fallback-model` | Auto-fallback model when primary is overloaded (print mode only) |
| `--name`, `-n` | Set display name for session |
| `--settings` | Path to additional settings JSON |
| `--setting-sources` | Which setting sources to load: `user`, `project`, `local` |
| `--chrome` / `--no-chrome` | Enable/disable Chrome browser integration |

#### Advanced/Special

| Flag | Description |
|------|-------------|
| `--plugin-dir` | Load plugins from directory for this session |
| `--disable-slash-commands` | Disable all skills and commands |
| `--betas` | Beta headers for API requests |
| `--debug` | Debug mode with optional category filtering |
| `--init` / `--init-only` | Run initialization hooks |
| `--remote` | Create web session on claude.ai |
| `--remote-control`, `--rc` | Start with Remote Control enabled |
| `--teleport` | Resume web session locally |
| `--teammate-mode` | Agent team display: `auto`, `in-process`, `tmux` |
| `--tmux` | Create tmux session (requires `--worktree`) |
| `--fork-session` | Create new session ID when resuming |
| `--from-pr` | Resume sessions linked to a GitHub PR |

---

## Tool Availability in Print Mode

### Full Tool List (from official tools reference)

When running `claude -p` in **normal mode** (not `--bare`), ALL tools are available:

| Tool | Available in `-p` mode? | Notes |
|------|------------------------|-------|
| **Agent** | YES | Can spawn subagents -- this is the key capability |
| **Bash** | YES | Full shell access |
| **Read** | YES | File reading |
| **Edit** | YES | File editing |
| **Write** | YES | File creation/overwrite |
| **Glob** | YES | File pattern matching |
| **Grep** | YES | Content search |
| **WebSearch** | YES | Web search (requires permission) |
| **WebFetch** | YES | URL fetching (requires permission) |
| **NotebookEdit** | YES | Jupyter notebook editing |
| **TodoWrite** | YES | Task checklist (replaces TaskCreate/TaskList/TaskUpdate in non-interactive) |
| **ToolSearch** | YES | Deferred tool loading |
| **Skill** | YES (if not `--bare`) | Skill execution |
| **EnterWorktree/ExitWorktree** | YES | Git worktree management |
| **CronCreate/CronDelete/CronList** | YES | Scheduled tasks within session |
| **LSP** | YES | Code intelligence (if plugin installed) |

### Bare Mode (`--bare`) Tool Restrictions

In `--bare` mode, only these tools are available:
- **Bash** (file read and edit tools)
- **Read**
- **Edit**

Everything else (WebSearch, WebFetch, Agent, Skill, MCP tools, etc.) is disabled. Additional context must be passed via flags:
- `--append-system-prompt` or `--append-system-prompt-file` for instructions
- `--settings` for configuration
- `--mcp-config` for MCP servers
- `--agents` for custom subagents
- `--plugin-dir` for plugins

### Critical Insight: The Agent Tool Works in `-p` Mode

A spawned `claude -p` instance has access to the **Agent tool**, meaning it can spawn its own subagents. This is the fundamental difference from running as a subagent (where the Agent tool is deliberately withheld). A CLI-spawned instance is a first-class session, not a subagent.

---

## Skills and Context Loading

### Normal `-p` Mode (Without `--bare`)

From the official headless documentation:

> Without `--bare`, `claude -p` loads the same context an interactive session would, including anything configured in the working directory or `~/.claude`.

This means in normal `-p` mode:
- **CLAUDE.md** files are loaded (project and user level)
- **Skills** from `~/.claude/skills/` are discoverable and invokable
- **MCP servers** from `.mcp.json` and settings are connected
- **Hooks** are executed (SessionStart, PreToolUse, PostToolUse, etc.)
- **Plugins** are loaded
- **Auto memory** is available
- **Subagent definitions** from `.claude/agents/` and `~/.claude/agents/` are available

### Bare Mode (`--bare`)

From the official docs:

> `--bare` reduces startup time by skipping auto-discovery of hooks, skills, plugins, MCP servers, auto memory, and CLAUDE.md. Only flags you pass explicitly take effect.

- No CLAUDE.md loading
- No skills discovery
- No MCP server connections
- No hooks execution
- No plugin loading
- Only Bash, Read, Edit tools available
- Authentication must come from `ANTHROPIC_API_KEY` or `apiKeyHelper` in `--settings`

**Bare mode is recommended for scripted calls** and will become the default for `-p` in a future release.

### Implications for Deep Research

For deep research, you would want **normal mode (not `--bare`)** to get:
- WebSearch and WebFetch tools
- Agent tool (to spawn sub-subagents)
- Skills loading (for the deep research skill itself)
- CLAUDE.md context (project instructions)

However, normal mode has slower startup due to discovery overhead.

---

## Monitoring Spawned Instances

### Method 1: Capture stdout (simplest)

```bash
# Run and capture output to file
claude -p "Research topic X and write findings to /tmp/research-output.md" \
  --allowedTools "Bash,Read,Write,WebSearch,WebFetch,Agent" \
  --max-budget-usd 2.00 \
  --max-turns 20 \
  > /tmp/claude-session-output.txt 2>&1
```

### Method 2: JSON output with metadata

```bash
# Get structured output with session ID, usage stats
claude -p "Research topic X" \
  --output-format json \
  --allowedTools "Bash,Read,Write,WebSearch,WebFetch,Agent" \
  | jq -r '.result' > /tmp/research-result.txt
```

The JSON output includes:
- `result`: the text response
- `session_id`: for resuming later
- `usage`: token consumption metadata

### Method 3: Real-time streaming

```bash
# Stream tokens as they're generated (NDJSON format)
claude -p "Research topic X" \
  --output-format stream-json \
  --verbose \
  --include-partial-messages \
  | tee /tmp/stream-output.jsonl \
  | jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'
```

Stream events include:
- `assistant`: text generation events
- `tool_use`: when tools are invoked
- `result`: final result
- `system/api_retry`: retry events with delay info

### Method 4: File-based communication (recommended for parent monitoring)

The spawned instance writes to files on disk. The parent can poll these files:

```bash
# Spawned instance writes incrementally to a known path
claude -p "Research X. Write ALL findings to /tmp/research/findings.md after each search. Create /tmp/research/status.txt with 'DONE' when complete." \
  --allowedTools "Bash,Read,Write,WebSearch,WebFetch,Agent" \
  --max-budget-usd 3.00
```

Parent monitors:
```bash
# Check if done
cat /tmp/research/status.txt  # "DONE" or "IN_PROGRESS"
# Read incremental findings
cat /tmp/research/findings.md
```

### Method 5: Session continuation

```bash
# Capture session ID from first run
SESSION_ID=$(claude -p "Start researching X" --output-format json | jq -r '.session_id')

# Continue the same session later
claude -p "Continue the research, focus on Y" --resume "$SESSION_ID"
```

---

## Cost Implications

### Billing Structure

A spawned `claude -p` instance is a **completely separate API session**:

- **Separate token usage**: Its own input/output token counters
- **Separate rate limits**: Consumes from the same org pool but as independent requests
- **Separate context window**: Starts fresh (no shared context with parent)
- **No cross-session caching**: Prompt caching only works within a single session

### Cost Estimates

| Scenario | Approximate Cost |
|----------|-----------------|
| Average Claude Code session per day | ~$6/developer/day |
| 90th percentile daily cost | ~$12/developer/day |
| Average monthly per developer (Sonnet) | ~$100-200/month |
| Agent teams overhead | ~7x standard sessions |
| Background summarization per session | ~$0.04 |

### Cost Control Flags for Spawned Instances

```bash
claude -p "prompt" \
  --max-budget-usd 2.00 \      # Hard dollar limit
  --max-turns 15 \              # Limit reasoning cycles
  --model sonnet \              # Use cheaper model
  --effort medium               # Reduce thinking token budget
```

### Cost Amplification Risk

If a spawned instance also spawns subagents (which it can via the Agent tool), costs multiply:
- Parent session: X tokens
- Spawned CLI instance: Y tokens (separate)
- Sub-subagents of spawned instance: Z tokens each (separate context windows)
- **Total: X + Y + (n * Z)**

This is analogous to agent teams' ~7x token overhead.

### Subscription vs API Billing

- **Claude Max/Pro subscribers**: Token costs included in subscription; `/cost` data not relevant for billing
- **API users**: Pay-per-token; each spawned instance consumes credits independently
- **Workspace tracking**: All Claude Code usage tracked under the "Claude Code" workspace in Console

---

## Community Patterns and Precedent

### claude-recursive-spawn (GitHub: haasonsaas/claude-recursive-spawn)

A community bash script for recursive Claude Code execution:

**Features:**
- Configurable depth control (default max: 4 levels, overridable via `-m` flag)
- Each invocation receives `[DEPTH: n/max]` markers in prompts
- Multiple output modes: standard, JSON-only (`-j`), extracted (`-e`), verbose (`-v`)
- Timestamped outputs saved as `depth-{depth}-{timestamp}.json`
- Automatic session management across recursion levels

**Usage:**
```bash
./claude_spawn [depth] "your prompt here"
./claude_spawn -m 6 0 "Analyze this codebase"
```

**Key insight:** Claude itself decides whether to spawn additional recursive calls based on depth information in the prompt.

### claude-code-mcp (GitHub: steipete/claude-code-mcp)

Exposes Claude Code as an MCP server, enabling "an agent in your agent" pattern:
- Exposes file editing and command execution tools via MCP protocol
- Includes a Task tool that spins off sub-agents with same tool access
- Sub-agents cannot spawn sub-sub-agents (same nesting limitation)
- No MCP passthrough: configured MCP servers of the inner Claude are not exposed to outer clients

### GitHub Issue #4182: Sub-Agent Task Tool Not Exposed

**Status:** Closed as duplicate (August 2025)

Documents the core problem: sub-agents cannot access the Agent (Task) tool. The `claude -p` workaround was explicitly discussed with these documented problems:

1. **Loss of visibility**: No progress tracking or structured output handling
2. **Error handling complexity**: Errors buried in bash output, not propagated through task hierarchy
3. **Resource management**: Each `claude -p` is separate process with own tokens and rate limits
4. **Data flow brittleness**: Information via files/pipes instead of structured results
5. **No context sharing**: Nested instance starts with zero parent context
6. **Crash risk**: One user reported JavaScript heap out-of-memory errors when agents attempted sub-agent creation

**No official Anthropic response or timeline was provided** for addressing the nesting limitation.

### GitHub Issue #19077: Sub-agents Can't Create Sub-Sub-Agents

Further documents the limitation. The architectural constraint is intentional to prevent infinite nesting.

---

## Background Process Support

### No Native Daemon Mode

Claude Code does not have a built-in daemon or background service mode. However, background execution is well-supported through other mechanisms:

### Running `claude -p` in Background

```bash
# Standard Unix background execution
claude -p "Long running research task" \
  --allowedTools "Bash,Read,Write,WebSearch,WebFetch,Agent" \
  --max-budget-usd 5.00 \
  --output-format json \
  > /tmp/research-output.json 2>&1 &

# With nohup for persistence
nohup claude -p "Research task" \
  --output-format json \
  > /tmp/research-output.json 2>&1 &
echo $! > /tmp/claude-pid.txt
```

### Bash Tool's `run_in_background` Parameter

Within a Claude Code session, the Bash tool supports `run_in_background: true`:
- Runs command asynchronously, returns a background task ID immediately
- Output written to a file readable via the Read tool
- Background tasks automatically cleaned up when Claude Code exits
- Can be monitored via task ID

### Real-Time Streaming for Monitoring

```bash
# Stream-json allows real-time monitoring of a spawned instance
claude -p "prompt" \
  --output-format stream-json \
  --verbose \
  --include-partial-messages \
  > /tmp/stream.jsonl &

# Monitor from another process
tail -f /tmp/stream.jsonl | jq 'select(.type == "tool_use")'
```

### Worktree Isolation

For parallel spawned instances that modify files:
```bash
claude -p "prompt" --worktree research-branch-1 &
claude -p "prompt" --worktree research-branch-2 &
```

Each instance gets its own git worktree, preventing file conflicts.

---

## The Nesting Limitation In Detail

### What Exactly Is Restricted

From the official documentation:

> Subagents cannot spawn other subagents. If your workflow requires nested delegation, use Skills or chain subagents from the main conversation.

Specifically:
- A **subagent** (spawned via the Agent tool) does NOT have access to the Agent tool
- A **subagent** has access to: Bash, Glob, Grep, Read, Edit, Write, WebFetch, WebSearch, NotebookEdit, TodoWrite, and more
- The Agent tool is deliberately withheld from subagents to prevent infinite nesting

### Why `claude -p` Bypasses This

A `claude -p` instance spawned via Bash is **not** a subagent. It is a completely independent Claude Code session:

| Property | Subagent | `claude -p` Instance |
|----------|----------|---------------------|
| Spawned by | Agent tool | Bash tool (OS process) |
| Context window | Isolated but managed by parent | Completely independent |
| Has Agent tool | **NO** | **YES** |
| Has WebSearch | YES | YES |
| Has Bash | YES (with restrictions) | YES |
| Loads skills | Only if preloaded via frontmatter | YES (normal mode) |
| Loads CLAUDE.md | NO (gets custom system prompt) | YES (normal mode) |
| Permission inheritance | Inherits from parent | Independent (uses --allowedTools etc.) |
| Cost tracking | Part of parent session | Separate session |
| Error propagation | Structured (returns to parent) | stdout/stderr only |
| Progress visibility | Parent sees status | None (unless via files/streaming) |

### The Trade-Off

The nesting limitation exists for good reasons:
1. Prevents infinite recursion and runaway costs
2. Maintains structured error handling
3. Enables predictable resource management
4. Keeps the parent informed of progress

The `claude -p` workaround bypasses ALL of these safeguards. You regain full capabilities but lose all the guardrails.

---

## Feasibility Assessment

### For Deep Research Skill: VIABLE WITH CAVEATS

#### What Works Well

1. **Full tool access**: The spawned instance has WebSearch, WebFetch, Agent (for its own subagents), Bash, file I/O -- everything needed for deep research
2. **Skills loading**: In normal mode (not `--bare`), skills from `~/.claude/skills/` are discoverable
3. **Context isolation**: Each research thread gets a full, fresh context window (no nesting-related context pollution)
4. **Cost control**: `--max-budget-usd` and `--max-turns` provide hard limits
5. **File-based output**: Research findings can be written incrementally to disk for parent monitoring
6. **Session resumption**: `--output-format json` captures session IDs for `--continue`/`--resume`

#### What Requires Careful Handling

1. **No structured error propagation**: Must parse stdout/stderr or rely on file-based status signaling
2. **No progress visibility**: Parent cannot see intermediate steps unless spawned instance writes to files
3. **Cost amplification**: Each instance is separate billing; sub-subagents multiply further
4. **Authentication**: Must have valid auth (ANTHROPIC_API_KEY or logged-in session)
5. **Rate limits**: Spawned instances compete for same org-level rate limits
6. **Startup latency**: Normal mode (with skills/MCP/hooks loading) has meaningful startup overhead
7. **No cancellation from parent**: Must kill the OS process; no graceful shutdown mechanism

#### What Does NOT Work

1. **Bare mode for research**: `--bare` strips WebSearch/WebFetch/Agent -- unusable for deep research
2. **Real-time bidirectional communication**: No way for parent and spawned instance to exchange messages mid-run
3. **Shared context**: Spawned instance knows nothing about parent's conversation unless passed via prompt/files

---

## Recommended Architecture

### Pattern: File-Based Orchestration from Main Conversation

```
Main Conversation (interactive)
  |
  |-- Bash (run_in_background: true)
  |     |
  |     `-- claude -p "Deep research prompt. Write findings to /path/findings.md.
  |            Create /path/status.json with progress updates."
  |            --allowedTools "Bash,Read,Write,WebSearch,WebFetch,Agent"
  |            --max-budget-usd 3.00
  |            --max-turns 30
  |            --output-format json
  |            > /path/session-output.json 2>&1
  |
  |-- (continues working on other tasks)
  |
  |-- Read /path/status.json        # Check progress
  |-- Read /path/findings.md        # Read incremental results
  |-- Read /path/session-output.json # Get final output + session ID
```

### Implementation Example

```bash
# The command a Bash subagent would run:
claude -p "$(cat <<'PROMPT'
You are a deep research agent. Your task: [RESEARCH TOPIC]

CRITICAL INSTRUCTIONS:
1. After EVERY search or significant finding, append results to: /tmp/research/findings.md
2. Update /tmp/research/status.json with: {"phase": "...", "searches_done": N, "progress": "..."}
3. Use WebSearch for broad queries, WebFetch for specific URLs
4. Spawn subagents (via Agent tool) for parallel investigation of sub-topics
5. When complete, write final synthesis to /tmp/research/final-report.md
6. Update status.json: {"phase": "complete", "total_searches": N}

Research topic: [TOPIC]
PROMPT
)" \
  --allowedTools "Bash,Read,Write,WebSearch,WebFetch,Agent,Glob,Grep" \
  --max-budget-usd 3.00 \
  --max-turns 30 \
  --output-format json \
  --model sonnet \
  > /tmp/research/session.json 2>&1
```

### Monitoring from Parent

```bash
# Check if still running
kill -0 $(cat /tmp/claude-pid.txt) 2>/dev/null && echo "Running" || echo "Done"

# Read progress
cat /tmp/research/status.json

# Read findings so far
cat /tmp/research/findings.md

# Get final results after completion
cat /tmp/research/session.json | jq -r '.result'
```

### Alternative: Use `--agents` for Dynamic Subagent Definition

```bash
claude -p "Research [TOPIC]" \
  --agents '{
    "web-researcher": {
      "description": "Searches the web for specific sub-topics",
      "prompt": "You search the web and summarize findings concisely.",
      "tools": ["WebSearch", "WebFetch", "Read", "Write"],
      "model": "sonnet"
    },
    "synthesizer": {
      "description": "Combines research findings into coherent analysis",
      "prompt": "You synthesize multiple research findings into a coherent report.",
      "tools": ["Read", "Write", "Glob"],
      "model": "sonnet"
    }
  }' \
  --allowedTools "Bash,Read,Write,WebSearch,WebFetch,Agent" \
  --max-budget-usd 5.00
```

This gives the spawned instance its own team of specialized subagents.

---

## Sources

### Official Anthropic Documentation
- [CLI Reference](https://code.claude.com/docs/en/cli-reference) -- Complete flag reference
- [Run Claude Code Programmatically (Headless Mode)](https://code.claude.com/docs/en/headless) -- Print mode, bare mode, output formats, streaming
- [Create Custom Subagents](https://code.claude.com/docs/en/sub-agents) -- Subagent capabilities, nesting limitation, tool access
- [Tools Reference](https://code.claude.com/docs/en/tools-reference) -- Complete tool list with permission requirements
- [Manage Costs Effectively](https://code.claude.com/docs/en/costs) -- Token usage, agent team costs, cost control strategies
- [Extend Claude with Skills](https://code.claude.com/docs/en/skills) -- Skill loading behavior

### GitHub Issues
- [Issue #4182: Sub-Agent Task Tool Not Exposed When Launching Nested Agents](https://github.com/anthropics/claude-code/issues/4182) -- Core nesting limitation, `claude -p` workaround discussion, documented problems
- [Issue #19077: Sub-agents Can't Create Sub-Sub-Agents](https://github.com/anthropics/claude-code/issues/19077) -- Architectural constraint documentation
- [Issue #25526: Subagents Cannot Use Bash Despite Parent Allow Rule](https://github.com/anthropics/claude-code/issues/25526) -- Permission inheritance issues

### Community Projects
- [claude-recursive-spawn (haasonsaas)](https://github.com/haasonsaas/claude-recursive-spawn) -- Bash script for recursive Claude Code execution with depth control
- [claude-code-mcp (steipete)](https://github.com/steipete/claude-code-mcp) -- Claude Code as MCP server ("agent in your agent" pattern)
- [Piebald-AI/claude-code-system-prompts](https://github.com/Piebald-AI/claude-code-system-prompts) -- System prompt documentation including tool definitions

### Third-Party Analysis
- [SFEIR Institute: Headless Mode and CI/CD](https://institute.sfeir.com/en/claude-code/claude-code-headless-mode-and-ci-cd/cheatsheet/) -- Practical headless mode patterns
- [Claude Code Non-Interactive Mode (Pasquale Pillitteri)](https://pasqualepillitteri.it/en/news/220/claude-code-non-interactive-mode-limited-hosting/) -- Non-interactive mode on limited resources
- [Claude Code CLI: The Definitive Technical Reference (Introl)](https://introl.com/blog/claude-code-cli-comprehensive-guide-2025) -- Comprehensive CLI guide
- [Claude Code Async: Background Agents & Parallel Tasks (claudefast)](https://claudefa.st/blog/guide/agents/async-workflows) -- Background execution patterns

---

## Platforms Checked

- code.claude.com (official docs) -- CLI reference, headless mode, subagents, tools, costs, skills
- github.com/anthropics/claude-code (issues) -- #4182, #19077, #25526
- github.com (community projects) -- claude-recursive-spawn, claude-code-mcp
- SFEIR Institute, claudefast, various tech blogs -- Community patterns and analysis
