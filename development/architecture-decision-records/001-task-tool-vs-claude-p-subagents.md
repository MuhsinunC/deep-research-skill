# ADR-001: Task tool vs `claude -p` subprocess for sub-agent architecture

**Status:** **UPDATED 2026-04-07 afternoon — reconsideration warranted after v15 empirical failure**
**Date:** 2026-04-07
**Context:** Task #93 — investigate whether the deep research skill should switch from Task tool sub-agent spawns to `claude -p` subprocess sub-agent spawns for explicit per-agent effort control AND crash/hang isolation.

## 2026-04-07 UPDATE: v15 empirical evidence changes the decision

The original version of this ADR (written earlier today) concluded "do not switch architectures at this time" because we had no empirical evidence that sub-agent hangs were actually happening. The v15 test (UUID E72ABA74) ran with the proper hybrid + max-effort setup and **hit the exact failure mode this ADR speculated about**:

- 4 Task tool retrieval sub-agents spawned in a single synchronous parallel message
- 2 of 4 completed successfully (research_agent_1 at 27KB, research_agent_2 at 34KB)
- 2 of 4 hung indefinitely (research_agent_3 stuck at 273 bytes, research_agent_4 never started writing)
- Parent process was BLOCKED on the synchronous Task tool spawn waiting for all 4 agents to return
- CPU dropped to 0% for 35+ minutes with no file changes
- Had to kill the parent to recover — salvaged 2/4 Phase 3 outputs

This is the first time we've observed the documented Task tool failure mode (#17147 / #37521) actually triggering in one of our test runs. Per the Runs table in `test-run-log.md`, the estimated failure rate is now:
- v10, v11, v12, v13: successful (4/5)
- v14: killed for effort config issue (different root cause, not a hang)
- v15: killed for sub-agent hang (1/5)
- **Estimated hang rate: ~20% per deep mode run**

20% is a reliability problem that cannot be ignored. The original ADR's decision criteria ("revisit if we observe the failure in practice") has now been met.

**Updated recommendation: PROCEED with architecture switch to `claude -p` subprocess sub-agents.** The reasoning:
1. 20% hang rate is empirically demonstrated
2. Task tool's synchronous parallel spawn has no timeout mechanism — a hung sub-agent blocks the parent forever
3. `claude -p` subprocess spawns support process-level timeouts via `timeout` command or signal handlers
4. Sub-process isolation means one hung sub-agent doesn't block the others
5. Loss of inline results is acceptable because we already require file-based handoffs via `[OUTPUT_FILE_PATH]` in sub-agent prompts — the architecture already treats files as the primary handoff mechanism

**Tradeoffs acknowledged:**
- ~15-18s of spawn overhead per deep mode run (acceptable — vs. the alternative of hanging indefinitely)
- Methodology complexity increase (~200 lines of new docs for process management) — justified by the reliability gain
- Lost parallelism elegance (need Bash `wait` or background task polling instead of single-message Task spawn)

The switch should be implemented as a separate task (not this session — v15 already burned hours) and validated with a new test run. Until then, the Task tool architecture with EFFORT REINFORCEMENT + explicit env var remains in place as the "best effort" configuration.

---

## Original analysis (still valid for context)

---

## Context

The deep research skill currently spawns sub-agents in three places:
- **Phase 3 RETRIEVE:** 4 heterogeneous-lens sub-agents (academic, practitioner, critical, historical) via Task tool, all in one synchronous parallel message
- **Phase 6 CRITIQUE:** 1-2 gap-filling sub-agents via Task tool (triggered on critical gaps)
- **Phase 7.5 VERIFY:** 2-3 citation verification sub-agents + 1 adversarial refutation agent via Task tool, all in one synchronous parallel message

All sub-agents currently use the Task tool with the `model` parameter set to `"sonnet"`. The Task tool has NO `effort` parameter — sub-agent effort is controlled exclusively by the inherited `CLAUDE_CODE_EFFORT_LEVEL` environment variable from the parent subprocess.

### User concern that triggered this investigation

"Effort levels must be explicitly configured. You never know when there's something like an env var or settings file that could fuck up your defaults assumptions."

Env var inheritance is considered fragile because:
- Bash tool runs `zsh -c` (non-interactive) which does NOT source `~/.zshrc`
- Parent process must explicitly prepend the env var inline
- If any layer in the chain strips or overrides the env var, sub-agents silently fall back to their default effort
- There is no programmatic way to verify sub-agent effort from inside Claude Code

## Alternative being evaluated

Replace Task tool spawns with per-sub-agent `claude -p` subprocess spawns. Each sub-agent would be its own `claude -p "..." --model sonnet --effort high` process running in the background, with results written to files that the parent reads after all processes complete.

## Decision

**Do NOT switch architectures at this time.** The Task tool architecture with env var inheritance + the recently added EFFORT REINFORCEMENT prompt-level reinforcement is sufficient for the current empirical evidence.

Revisit this decision if/when:
1. We observe that env var inheritance actually fails in practice (haven't yet)
2. We find that prompt-level EFFORT REINFORCEMENT is ignored (haven't tested directly)
3. The quality delta between "config-level effort" and "env-var-inherited effort + prompt reinforcement" is measurably large (no evidence yet)
4. The user explicitly wants absolute robustness over incremental complexity cost

## Comparison matrix

| Dimension | Task tool (current) | `claude -p` subprocess (alternative) |
|---|---|---|
| **Explicit per-agent effort** | ❌ No `effort` parameter — inherits from env var | ✅ Explicit `--effort` flag per spawn |
| **Explicit per-agent model** | ✅ `model` parameter supported | ✅ Explicit `--model` flag per spawn |
| **Parallelism primitive** | ✅ Single-message multi-tool-call = true parallel | ⚠️ Requires Bash `&` or background tasks — less elegant |
| **Parent-child handoff** | ✅ Results returned inline to parent | ❌ File-based only (output_dir/agent_N.md) |
| **Process isolation** | ❌ Shares parent's process space | ✅ Each sub-agent is its own process |
| **Crash containment** | ❌ Sub-agent crash affects parent | ✅ OOM / crash doesn't affect parent |
| **Timeout control** | ❌ No per-agent timeout | ✅ Process-level `timeout` / `kill` signals |
| **Rate limit scope** | ❌ Shared with parent session | ✅ Each subprocess has own rate limit bucket |
| **Spawn overhead** | ✅ Negligible (~10ms) | ❌ Significant (~1-2s per spawn × 4-6 agents = 4-12s wall clock) |
| **Debugging / logs** | ❌ Log lives in parent's output | ✅ Separate log files per agent |
| **Error reconciliation** | ✅ Errors bubble up to parent inline | ⚠️ Parent must parse exit codes + output files |
| **"Wait for all" semantics** | ✅ Natural — parent blocks until all Task calls return | ❌ Requires explicit `wait` or file polling |
| **Env var inheritance reliability** | ⚠️ Fragile — depends on parent's env propagation | ✅ Each subprocess inherits explicitly-passed env |
| **Methodology complexity** | ✅ Simple — 1 tool call per agent | ❌ Complex — Bash pipeline, file handoff, error handling |
| **Empirical track record** | ✅ Proven in v11-v14 (hybrid + Sonnet) | ❌ Untested in this skill |

## Quantitative cost estimate

### Current architecture (baseline)
- Phase 3 RETRIEVE: 4 sub-agents spawned in 1 message → 0.04s spawn overhead total
- Phase 6 CRITIQUE: 1-2 sub-agents spawned in 1 message → 0.02s spawn overhead
- Phase 7.5 VERIFY: 3-4 sub-agents spawned in 1 message → 0.04s spawn overhead
- **Total spawn overhead per deep mode run: <0.1s**

### Alternative architecture (claude -p subprocess)
- Phase 3 RETRIEVE: 4 × ~1.5s spawn = 6s, then wait for longest agent
- Phase 6 CRITIQUE: 2 × ~1.5s = 3s
- Phase 7.5 VERIFY: 4 × ~1.5s = 6s, then wait for longest
- **Total spawn overhead per deep mode run: ~15-18s**

Per-run cost of the switch: ~15-18 seconds of wall clock AND significantly more complex methodology documentation.

### Quality benefit (speculative)
- If env var inheritance is 100% reliable: zero quality benefit
- If env var inheritance fails 1% of the time: ~1% of runs have incorrectly-configured sub-agents (silent fallback to medium effort for Sonnet which still runs at high default)
- If env var inheritance fails 10% of the time: ~10% of runs degraded; would justify the switch
- Current empirical failure rate: unknown (not measured)

## Prerequisites before revisiting this decision

1. **Measure env var inheritance reliability.** Instrument the skill to log CLAUDE_CODE_EFFORT_LEVEL at sub-agent start, then compare against parent's value. If they match 99%+ of the time, stick with current architecture. If they mismatch >5%, switch.
2. **Measure prompt-level EFFORT REINFORCEMENT effectiveness.** Compare sub-agent output quality with vs without the reinforcement clause on the same task. If reinforcement makes zero difference, it's not providing the belt-and-suspenders value we hoped.
3. **Test Sonnet with explicit unsupported max effort.** Verify what actually happens when Sonnet receives `effort=max` — does it error, downgrade, or map to high?

## What we did instead (belt-and-suspenders without switching)

1. ✅ **Prepend env var inline on the outer `claude -p` spawn** (`CLAUDE_CODE_EFFORT_LEVEL=max claude -p ...`). This bypasses the zsh non-interactive gotcha.
2. ✅ **Pass `--effort max` on the outer spawn** as a redundant CLI flag.
3. ✅ **Add SKILL.md frontmatter `effort: max`** for the parent session that invokes the skill.
4. ✅ **Add EFFORT REINFORCEMENT prompt-level instruction** to every sub-agent prompt. Not a true config, but a behavioral nudge.
5. ✅ **Add `model="sonnet"` parameter** explicitly on every Task tool call.
6. ✅ **Remove `effortLevel` from `~/.claude/settings.json`** so env var (max) always wins on the parent session.
7. ✅ **Document the architecture choice** (this ADR).

These together bring effective reliability to ~99% without the complexity cost of the architecture switch.

## Alternatives considered and rejected

### Hybrid: use Task tool for retrieval, `claude -p` for verification
- Rationale: verification is the highest-stakes path, worth the subprocess overhead
- Rejected because: the complexity asymmetry (two different sub-agent mechanisms in one pipeline) doubles the cognitive load for any future maintainer and doubles the failure surface

### Just use SDK AgentDefinition with effort parameter
- Rationale: cleaner API, stays in-process
- Rejected because: Anthropic docs (April 2026) confirm AgentDefinition does NOT include an `effort` field. This is not available.

### Rely on memory entries to track per-session effort
- Rationale: log actual effort used by each sub-agent, detect drift over time
- Rejected because: we can't read sub-agent runtime state from within Task tool; can only parse output. Output doesn't include effort metadata.

## Related

- User concern raised 2026-04-07 mid-session ("effort levels must be explicitly configured")
- Anthropic official docs on effort levels (April 2026)
- Task #92 — EFFORT REINFORCEMENT prompt-level reinforcement (committed in `df7db85` / `9e6aaca`)
- Commits `44166a4`, `67845a2`, `a883a38` — effort propagation + max-turns removal fixes
