# Claude Code Agent Teams Investigation

**Date:** 2026-03-22
**Purpose:** Determine if Agent Teams can solve the sub-agent nesting limitation for deep research orchestration.
**Verdict:** Partially. Agent Teams solve the inter-agent communication bottleneck but do NOT solve the nesting problem. Teammates cannot spawn sub-agents or nested teams. The architecture is strictly hub-and-spoke.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Q1: Can Team Members Use Tools Independently?](#q1-can-team-members-use-tools-independently)
3. [Q2: Can a Team Member Spawn Sub-Agents?](#q2-can-a-team-member-spawn-sub-agents)
4. [Q3: How Do Team Members Communicate?](#q3-how-do-team-members-communicate)
5. [Q4: Maximum Team Size](#q4-maximum-team-size)
6. [Q5: Stability / Production Readiness](#q5-stability--production-readiness)
7. [Q6: Research Workflow Examples](#q6-research-workflow-examples)
8. [Q7: Known Limitations and Bugs](#q7-known-limitations-and-bugs)
9. [Architecture Deep Dive](#architecture-deep-dive)
10. [Tool Availability Comparison](#tool-availability-comparison)
11. [Token Cost Analysis](#token-cost-analysis)
12. [Implications for Deep Research Skill v2](#implications-for-deep-research-skill-v2)
13. [Open GitHub Issues](#open-github-issues)
14. [Sources](#sources)

---

## Executive Summary

Agent Teams is an **experimental** feature (since Claude Code v2.1.32, Feb 2026) that coordinates multiple independent Claude Code instances. It is enabled via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

**What it solves:** Inter-agent communication. Unlike subagents (which only report upward to the caller), teammates can message each other directly, share a task list, and self-coordinate.

**What it does NOT solve:** Nesting. Teammates cannot spawn sub-agents, sub-teams, or any other agents. They have FEWER tools than standalone subagents (20 vs 25). The Agent tool, TeamCreate, TeamDelete, and CronCreate/Delete/List are all stripped from teammates at spawn time.

**Bottom line for deep research:** Agent Teams can parallelize independent research streams and let researchers share findings laterally. But the lead agent remains the only orchestrator. For hierarchical decomposition (lead -> researcher -> sub-researcher), this architecture does not help.

---

## Q1: Can Team Members Use Tools Independently?

**Yes.** Each teammate is a full, independent Claude Code instance with its own context window. Teammates load project context automatically:
- `CLAUDE.md` files
- MCP servers configured for the project
- Skills

Teammates have access to **20 tools**, including:
- `Read`, `Write`, `Edit`, `MultiEdit`
- `Bash`, `Glob`, `Grep`, `LS`
- `WebFetch`, `WebSearch`
- `NotebookRead`, `NotebookEdit`
- `SendMessage` (for inter-agent communication)

Teammates can independently:
- Search the web (WebSearch, WebFetch)
- Read and write files
- Run bash commands
- Use MCP servers configured in the project

**Source:** [Official docs](https://code.claude.com/docs/en/agent-teams), [GitHub Issue #32731](https://github.com/anthropics/claude-code/issues/32731)

---

## Q2: Can a Team Member Spawn Sub-Agents?

**No. This is the critical limitation.**

Teammates are the **most restricted spawned context type**. The following tools are removed from teammates at spawn time:

| Tool Removed | What It Does |
|---|---|
| `Agent` (formerly `Task`) | Spawns subagents |
| `TeamCreate` | Creates new teams |
| `TeamDelete` | Deletes teams |
| `CronCreate` | Creates scheduled tasks |
| `CronDelete` | Deletes scheduled tasks |
| `CronList` | Lists scheduled tasks |

This means:
- A teammate **cannot** spawn a subagent to do focused sub-research
- A teammate **cannot** create a nested team
- A teammate **cannot** delegate work to any other agent
- All orchestration and delegation **must go through the team lead**

The architecture is strictly **hub-and-spoke**: the lead is the only node that can spawn and manage agents.

Additionally, **subagents themselves cannot spawn sub-subagents** either. This is documented:

> "Subagents cannot spawn other subagents. If your workflow requires nested delegation, use Skills or chain subagents from the main conversation."

**Sources:**
- [Official docs - Limitations section](https://code.claude.com/docs/en/agent-teams)
- [GitHub Issue #32731](https://github.com/anthropics/claude-code/issues/32731) - Documents the exact tool delta (20 vs 25 tools)
- [GitHub Issue #19077](https://github.com/anthropics/claude-code/issues/19077) - "Sub-agents can't create sub-sub-agents"
- [GitHub Issue #4182](https://github.com/anthropics/claude-code/issues/4182) - "Sub-Agent Task Tool Not Exposed When Launching Nested Agents"

---

## Q3: How Do Team Members Communicate?

Communication happens through two channels:

### 1. SendMessage Tool
- **`message`**: Direct message to one specific teammate (by name, not agentId)
- **`broadcast`**: Send to all teammates simultaneously (use sparingly — costs scale with team size)
- **`shutdown_request` / `shutdown_response`**: Graceful teammate shutdown
- **`plan_approval_response`**: Quality gate for plan-then-implement workflows

Messages are delivered automatically as conversation turns. Messages queue during mid-turn operations.

### 2. Shared Task List
- Tasks stored as JSON files under `~/.claude/tasks/{team-name}/`
- Three states: `pending`, `in_progress`, `completed`
- Tasks support dependencies (blocked until dependencies complete)
- File locking prevents race conditions on simultaneous claims
- Any teammate can read task status; lead assigns or teammates self-claim

### Communication Patterns vs Subagents

| | Subagents | Agent Teams |
|---|---|---|
| **Direction** | Report results back to caller only | Lateral peer-to-peer messaging |
| **Visibility** | Only caller sees results | All teammates see shared task list |
| **Bottleneck** | Caller must relay between subagents | Teammates communicate directly |
| **Coordination** | Caller manages everything | Self-coordination via task list |

### Known Communication Gaps
- No shared persistent channel (requested in [Issue #30140](https://github.com/anthropics/claude-code/issues/30140), closed as duplicate)
- Broadcast is noisy and lossy when relayed
- Late joiners lose context when context compresses
- No canonical message ordering across agents

**Source:** [Official docs](https://code.claude.com/docs/en/agent-teams), [TeammateTool system prompt](https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/tool-description-teammatetool.md)

---

## Q4: Maximum Team Size

**There is no hard maximum**, but practical constraints apply:

- **Recommended:** 3-5 teammates for most workflows
- **Task ratio:** 5-6 tasks per teammate keeps everyone productive
- **Token costs scale linearly** — each teammate has its own full context window
- **Coordination overhead increases** with more teammates
- **Diminishing returns** beyond ~5 teammates

A community report noted a 5-teammate QA swarm completed in ~3 minutes. A 4-agent parallel session on a large codebase can hit 300K-500K tokens in under 30 minutes.

**Source:** [Official docs](https://code.claude.com/docs/en/agent-teams), [alexop.dev analysis](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/)

---

## Q5: Stability / Production Readiness

**Experimental. Not production-ready.**

The feature is:
- Disabled by default
- Gated behind `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- Requires Claude Code v2.1.32+
- Explicitly labeled as having "known limitations"

Key stability issues:
- No session resumption for in-process teammates
- `/resume` and `/rewind` break team state
- Task status tracking can lag (teammates forget to mark tasks complete)
- Shutdown can be slow
- tmux display is "finicky"
- Lead may shut down before work is done
- Lead may start doing work itself instead of delegating
- Orphaned tmux sessions after team ends

**Source:** [Official docs - Limitations](https://code.claude.com/docs/en/agent-teams)

---

## Q6: Research Workflow Examples

### Official Examples

1. **Competing Hypotheses Investigation:**
   > "Users report the app exits after one message. Spawn 5 agent teammates to investigate different hypotheses. Have them talk to each other to try to disprove each other's theories, like a scientific debate."

2. **Parallel Code Review:**
   > "Create an agent team to review PR #142. Spawn three reviewers: one focused on security implications, one checking performance impact, one validating test coverage."

3. **Multi-Perspective Research:**
   > "Create an agent team to explore this from different angles: one teammate on UX, one on technical architecture, one playing devil's advocate."

### Community Examples

4. **QA Swarm** (alexop.dev): 5 parallel agents testing pages, posts, links, SEO metadata, and accessibility. Completed in ~3 minutes. Lead ran on Opus, teammates on Sonnet for cost optimization.

5. **Research and Review** is listed as one of the "strongest use cases" in the official docs: "multiple teammates can investigate different aspects of a problem simultaneously, then share and challenge each other's findings."

### Official Recommendation for New Users
> "If you're new to agent teams, start with tasks that have clear boundaries and don't require writing code: reviewing a PR, researching a library, or investigating a bug."

**Source:** [Official docs](https://code.claude.com/docs/en/agent-teams), [alexop.dev](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/)

---

## Q7: Known Limitations and Bugs

### Architectural Limitations
1. **No nested teams** — teammates cannot spawn their own teams or teammates
2. **No sub-agent spawning from teammates** — Agent tool is stripped
3. **One team per session** — must clean up before starting a new team
4. **Lead is fixed** — cannot promote a teammate or transfer leadership
5. **Permissions set at spawn** — all teammates inherit lead's permission mode; can change after but not at spawn time

### Operational Bugs
6. **No session resumption** — `/resume` and `/rewind` do not restore in-process teammates; lead may message non-existent teammates
7. **Task status lag** — teammates sometimes fail to mark tasks completed, blocking dependent tasks
8. **Slow shutdown** — teammates finish current request/tool call before shutting down
9. **Lead premature exit** — lead may decide team is finished before all tasks complete
10. **Lead self-work** — lead may start implementing instead of delegating
11. **File conflicts** — two teammates editing same file causes overwrites (no merge)
12. **Orphaned tmux sessions** — not always cleaned up after team ends

### Platform Limitations
13. **Split panes require tmux or iTerm2** — not supported in VS Code terminal, Windows Terminal, or Ghostty
14. **tmux has known issues** on some OSes; iTerm2 requires `it2` CLI and Python API enabled
15. **Claude Pro rate limiting** — 4-agent session can hit 300K-500K tokens in <30 minutes

### Documentation Bugs (Open Issues)
16. **Tool restrictions understated** — docs say "no nested teams" but actual restriction is broader: 5 additional tool groups removed ([Issue #32731](https://github.com/anthropics/claude-code/issues/32731))
17. **TeamCreate available to standalone subagents** — undocumented; subagents can create empty team shells they can't populate ([Issue #32723](https://github.com/anthropics/claude-code/issues/32723))

**Sources:** [Official docs](https://code.claude.com/docs/en/agent-teams), GitHub Issues [#32731](https://github.com/anthropics/claude-code/issues/32731), [#32723](https://github.com/anthropics/claude-code/issues/32723), [#19077](https://github.com/anthropics/claude-code/issues/19077)

---

## Architecture Deep Dive

### Components

| Component | Role |
|---|---|
| **Team Lead** | Main Claude Code session. Creates team, spawns teammates, coordinates work. Has ALL tools. |
| **Teammates** | Separate Claude Code instances. Work on assigned tasks. Have 20 tools (5 stripped). |
| **Task List** | Shared JSON files under `~/.claude/tasks/{team-name}/`. Three states: pending, in_progress, completed. |
| **Mailbox** | Messaging system. SendMessage tool with message types: message, broadcast, shutdown_request/response, plan_approval_response. |
| **Team Config** | `~/.claude/teams/{team-name}/config.json`. Contains members array with name, agentId, agentType. |

### Seven Core Tools (Lead Perspective)

1. **TeamCreate** — Initializes team namespace and config file
2. **TaskCreate** — Defines work units as JSON files on disk
3. **TaskUpdate** — Changes task status (pending -> in_progress -> completed)
4. **TaskList** — Polls available work and ownership status
5. **Agent** (with team_name parameter) — Spawns a teammate as independent Claude Code session
6. **SendMessage** — Direct communication between any team members
7. **TeamDelete** — Cleanup after shutdown

### Context Model
- Each teammate loads: CLAUDE.md, MCP servers, skills, and the spawn prompt from the lead
- Lead's conversation history does NOT carry over
- No shared memory between teammates (only task list and messages)
- Auto-compaction triggers at ~95% capacity (configurable via `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`)

### Quality Gates
- **Plan approval**: Teammates can be required to plan before implementing; lead reviews and approves/rejects
- **Hooks**: `TeammateIdle` (when teammate about to go idle) and `TaskCompleted` (when task being marked complete) — exit code 2 sends feedback and keeps teammate working

---

## Tool Availability Comparison

| Tool | Main Session | Standalone Subagent (25 tools) | Teammate (20 tools) |
|---|---|---|---|
| Agent (spawner) | YES | NO | NO |
| TeamCreate | YES | YES* | NO |
| TeamDelete | YES | YES* | NO |
| CronCreate | YES | YES | NO |
| CronDelete | YES | YES | NO |
| CronList | YES | YES | NO |
| SendMessage | YES | YES | YES |
| Read/Write/Edit | YES | YES | YES |
| Bash/Glob/Grep | YES | YES | YES |
| WebSearch/WebFetch | YES | YES | YES |
| NotebookRead/Edit | YES | YES | YES |
| AskUserQuestion | YES | NO | NO |
| EnterPlanMode | YES | NO | NO |
| ExitPlanMode | YES | NO | NO |

*TeamCreate/TeamDelete are available to standalone subagents but create empty, non-functional teams (documented bug: [Issue #32723](https://github.com/anthropics/claude-code/issues/32723)).

**Source:** [GitHub Issue #32731](https://github.com/anthropics/claude-code/issues/32731)

---

## Token Cost Analysis

| Configuration | Approximate Token Usage | Relative Cost |
|---|---|---|
| Solo session | ~200K tokens | 1x |
| 3 subagents | ~440K tokens | ~2.2x |
| 3-person team | ~800K tokens | ~4x |
| 5-person team | ~1.2M+ tokens | ~6x+ |

Key facts:
- Each teammate has its own full context window
- Token usage scales linearly with team size
- A 4-agent parallel session can hit 300K-500K tokens in <30 minutes
- Claude Pro users will encounter rate limiting mid-session
- Cost optimization: run lead on Opus, teammates on Sonnet

**Source:** [alexop.dev](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/)

---

## Implications for Deep Research Skill v2

### What Agent Teams CAN Do for Us

1. **Parallel independent research streams** — Each teammate investigates a different aspect (e.g., one on pricing, one on reviews, one on specs)
2. **Lateral information sharing** — Teammates can tell each other about findings without routing through the lead
3. **Competing hypotheses** — Multiple teammates can investigate different theories and debate
4. **Independent tool use** — Each teammate has WebSearch, WebFetch, Read, Write (can search the web and save findings independently)

### What Agent Teams CANNOT Do for Us

1. **Hierarchical decomposition** — A teammate cannot spawn sub-researchers for deeper dives
2. **Dynamic task spawning** — Only the lead can create new tasks and spawn new teammates
3. **Nested orchestration** — Cannot have a "research lead" teammate that manages its own sub-team
4. **Mid-research escalation** — A teammate that discovers a complex sub-topic cannot delegate it; must message the lead and wait

### The Nesting Gap Remains

The core problem for deep research is:

```
DESIRED:
  Lead -> Research Coordinator -> [Sub-Researcher A, Sub-Researcher B, Sub-Researcher C]
                                  (each can spawn their own focused sub-agents)

ACTUAL (Agent Teams):
  Lead -> [Teammate A, Teammate B, Teammate C]
          (none can spawn anything; all coordination goes through lead)

ACTUAL (Subagents):
  Main -> [Subagent A, Subagent B, Subagent C]
          (none can talk to each other; all results funnel through main)
```

### Possible Workarounds

1. **Lead as active orchestrator**: The lead monitors teammate progress and dynamically creates new tasks/teammates when sub-topics emerge. Adds latency but keeps the lead in control.

2. **Pre-decompose aggressively**: Before spawning the team, the lead does a planning phase to break research into fine-grained tasks. This front-loads the orchestration.

3. **Hybrid approach**: Use Agent Teams for the top-level parallel streams, but have each teammate use the `claude -p` bash workaround (spawn CLI instances) for sub-research. Loss of visibility and structured output, but technically enables nesting.

4. **File-based coordination**: Teammates write findings to shared markdown files. The lead periodically reads these files and spawns new tasks based on discoveries. Simulates dynamic orchestration without actual nesting.

### Recommendation

Agent Teams is **worth using for v2** as the top-level parallelization layer, replacing our current subagent approach. The lateral communication between teammates is genuinely valuable for research where findings in one area affect another.

However, it **does not solve the nesting problem**. For hierarchical research decomposition, we still need one of:
- The `claude -p` bash hack (fragile, no visibility)
- Anthropic to implement depth-limited nested spawning (requested in Issue #19077, no timeline)
- A custom orchestration layer outside Claude Code (e.g., claude-flow, AgentCrow)

---

## Open GitHub Issues

| Issue | Title | Status | Relevance |
|---|---|---|---|
| [#32731](https://github.com/anthropics/claude-code/issues/32731) | Teammates have fewer tools than subagents — restriction broader than documented | OPEN | Documents exact tool delta |
| [#32723](https://github.com/anthropics/claude-code/issues/32723) | TeamCreate/TeamDelete available to standalone subagents — undocumented | OPEN | Bug: subagents can create empty teams |
| [#19077](https://github.com/anthropics/claude-code/issues/19077) | Sub-agents can't create sub-sub-agents, even with Task tool access | OPEN | Core nesting limitation |
| [#4182](https://github.com/anthropics/claude-code/issues/4182) | Sub-Agent Task Tool Not Exposed When Launching Nested Agents | CLOSED (dup) | Earlier report of nesting limitation |
| [#24316](https://github.com/anthropics/claude-code/issues/24316) | Allow custom .claude/agents/ definitions as team teammates | OPEN (26 upvotes) | Would enable specialized teammates |
| [#30140](https://github.com/anthropics/claude-code/issues/30140) | Shared channel for agent teams | CLOSED (dup) | Would improve coordination |
| [#26265](https://github.com/anthropics/claude-code/issues/26265) | Support resume for Agent Team teammates | OPEN | Session persistence gap |
| [#23506](https://github.com/anthropics/claude-code/issues/23506) | Custom agents (--agent) cannot spawn subagents into teams | OPEN | Blocks custom agent + teams |
| [#28175](https://github.com/anthropics/claude-code/issues/28175) | Agent teams don't create agents on own worktree | OPEN | Isolation gap |
| [#25148](https://github.com/anthropics/claude-code/issues/25148) | Enable Agent Teams on all plans | OPEN | Access limitation |

---

## Sources

### Official Documentation
- [Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams) — Primary reference
- [Create custom subagents](https://code.claude.com/docs/en/sub-agents.md) — Subagent documentation with nesting limitations

### GitHub Issues (anthropics/claude-code)
- [Issue #32731: Tool restrictions understated](https://github.com/anthropics/claude-code/issues/32731)
- [Issue #32723: TeamCreate available to standalone subagents](https://github.com/anthropics/claude-code/issues/32723)
- [Issue #19077: Sub-agents can't create sub-sub-agents](https://github.com/anthropics/claude-code/issues/19077)
- [Issue #4182: Nested agent Task tool not exposed](https://github.com/anthropics/claude-code/issues/4182)
- [Issue #24316: Custom agents as team teammates](https://github.com/anthropics/claude-code/issues/24316)
- [Issue #30140: Shared channel for agent teams](https://github.com/anthropics/claude-code/issues/30140)

### Community Analysis
- [From Tasks to Swarms: Agent Teams in Claude Code](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/) — Token cost data, practical examples
- [Claude Code Agent Teams Can Spawn Agents. It Just Doesn't Know Which Ones to Use.](https://dev.to/ji_ai/claude-code-agent-teams-can-spawn-agents-it-just-doesnt-know-which-ones-to-use-1h54) — AgentCrow solution
- [TeammateTool system prompt](https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/tool-description-teammatetool.md) — Internal tool parameters
- [Claude Code Agent Teams: The Complete Guide 2026](https://claudefa.st/blog/guide/agents/agent-teams)
- [Claude Code Swarm Orchestration Skill](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea)
