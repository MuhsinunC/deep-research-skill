---
name: deep-research
description: Deep research expert. ALWAYS invoke for deep research, research reports, comprehensive analysis, or multi-source investigation. Do not attempt research directly -- use this skill first. NOT for simple lookups or debugging.
effort: max
---

# Deep Research

## Core Purpose

Deliver citation-backed, verified research reports through a structured pipeline with source credibility scoring, evidence persistence, and progressive context management.

**Autonomy Principle:** Operate independently. Infer assumptions from context. Only stop for critical errors or incomprehensible queries.

---

## Decision Tree

```
Request Analysis
+-- Simple lookup? --> STOP: Use WebSearch
+-- Debugging? --> STOP: Use standard tools
+-- Complex analysis needed? --> CONTINUE

Mode Selection
+-- Initial exploration --> quick (3 phases, 2-5 min)
+-- Standard research --> standard (7 phases, 5-10 min) [DEFAULT]
+-- Critical decision --> deep (10 phases, 10-20 min)
+-- Comprehensive review --> ultradeep (10 phases, 20-45 min)
```

**Default assumptions:** Technical query = technical audience. Comparison = balanced perspective. Trend = recent 1-2 years.

---

## Workflow Overview

| Phase | Name | Quick | Standard | Deep | UltraDeep |
|-------|------|-------|----------|------|-----------|
| 0 | RESUME DETECTION | Y | Y | Y | Y |
| 1 | SCOPE | Y | Y | Y | Y |
| 2 | PLAN | - | Y | Y | Y |
| 3 | RETRIEVE | Y | Y | Y | Y |
| 4 | TRIANGULATE | - | Y | Y | Y |
| 4.5 | OUTLINE REFINEMENT | - | Y | Y | Y |
| 5 | SYNTHESIZE | - | Y | Y | Y |
| 6 | CRITIQUE | - | - | Y | Y |
| 7 | REFINE | - | - | Y | Y |
| 7.5 | VERIFY | - | - | Y | Y |
| 8 | PACKAGE | Y | Y | Y | Y |

**Cross-cutting requirements (all phases):**
- **Progress reporting:** Output a `[Phase NAME]` status line at the start of each phase (use phase name, not numbers)
- **Checkpoint/resume:** Save `_checkpoint.json` at the end of each phase via the atomic helper at `~/.claude/skills/deep-research/scripts/atomic_checkpoint.py`
- **Sub-agent progress:** During Phase 3/6/7.5 fan-outs, write `_subagent_progress.json` after each Task batch
- **Pause-flag checks:** Check for `_STOP_REQUESTED` and `_STOP_NOW` at every safe boundary (see `## Graceful Pause`)
- **Source preferences:** Prioritize primary/authoritative sources, deprioritize SEO content farms

---

## Execution

**On invocation, load relevant reference files:**

1. **Phase 0 (resume detection):** Load [resume.md](./reference/resume.md) for the resume protocol
2. **Phase 1-7:** Load [methodology.md](./reference/methodology.md) for detailed phase instructions
3. **Phase 8 (Report):** Load [report-assembly.md](./reference/report-assembly.md) for progressive generation
4. **HTML/PDF output:** Load [html-generation.md](./reference/html-generation.md)
5. **Quality checks:** Load [quality-gates.md](./reference/quality-gates.md)
6. **Long reports (>18K words):** Load [continuation.md](./reference/continuation.md)

**Templates:**
- Report structure: [report_template.md](./templates/report_template.md)
- HTML styling: [mckinsey_report_template.html](./templates/mckinsey_report_template.html)

**Scripts (always referenced via the deployed canonical path):**
- `python ~/.claude/skills/deep-research/scripts/atomic_checkpoint.py ...` — atomic checkpoint, sub-agent progress, `_DONE` sentinel
- `python ~/.claude/skills/deep-research/scripts/validate_report.py --report [path]`
- `python ~/.claude/skills/deep-research/scripts/verify_citations.py --report [path]`
- `python ~/.claude/skills/deep-research/scripts/md_to_html.py [markdown_path]`

**Why the canonical absolute path?** Workers issue `Bash(...)` tool calls that run as one-off `zsh -c '<command>'` invocations. Inside such a call, `$BASH_SOURCE` is **EMPTY** and the CWD is whatever the harness happens to have set (typically the user's repo, NOT the skill dir). The deployed `~/.claude/skills/deep-research/scripts/` path is the only reliable way to find the helpers.

---

## Output Contract

**Required sections:**
- Executive Summary (200-400 words)
- Introduction (scope, methodology, assumptions)
- Main Analysis (4-8 findings, 600-2,000 words each, cited)
- Synthesis & Insights (patterns, implications)
- Limitations & Caveats
- Recommendations
- Bibliography (COMPLETE - every citation, no placeholders)
- Methodology Appendix

**Output files (all to `~/Documents/Research/[Topic]_[YYYYMMDD]_[UUID8]/`):**
- UUID8 = first 8 characters of a UUID, generated at task start via `uuidgen | cut -c1-8`
- Registered in `~/.claude/research-tasks.json` with: uuid, topic, status, output_dir, start_time, mode
- Markdown (primary source — `research_report_<DATE>_<slug>.md`)
- HTML (McKinsey style, auto-opened)
- PDF (professional print, auto-opened)
- `_DONE` sentinel file (FINAL artifact written; presence ⇒ dispatch is complete)

**Quality standards:**
- 10+ sources, 3+ per major claim
- All claims cited immediately [N]
- No placeholders, no fabricated citations
- Prose-first (>=80%), bullets sparingly

---

## When to Use / NOT Use

**Use:** Comprehensive analysis, technology comparisons, state-of-the-art reviews, multi-perspective investigation, market analysis.

**Do NOT use:** Simple lookups, debugging, 1-2 search answers, quick time-sensitive queries.

---

## Background Mode (Default)

> **STOP — role check before proceeding.**
>
> Before reading any further in this section, check the environment variable
> `CLAUDE_CODE_DEEP_RESEARCH_WORKER`. The instructions in this section are
> for the **CALLER** (the parent session preparing a research brief and
> spawning a worker), NOT for the worker itself.
>
> - If `CLAUDE_CODE_DEEP_RESEARCH_WORKER=1` is set in your environment, you
>   ARE the worker. **Skip this entire `Background Mode` section** and
>   proceed to the `## Execution` section above. Run the 10-phase pipeline
>   directly. Do NOT spawn another `claude -p` instance — that is recursion.
>   You are already the spawned instance.
> - If the env var is unset or empty, you are the caller. Continue reading
>   this section to learn how to prepare a brief and spawn the worker.
>
> Verify with: `echo $CLAUDE_CODE_DEEP_RESEARCH_WORKER` (should print `1` if
> you are the worker; empty/unset if you are the caller).
>
> **Workers MUST emit this log line within the first 30 seconds of starting:**
> `[ROLE-CHECK] CLAUDE_CODE_DEEP_RESEARCH_WORKER=1 detected — proceeding as worker`
>
> The wrapper-side spawn template ALSO emits a `[ROLE-CHECK-WRAPPER]` line
> immediately on dispatch (operator-visible signal independent of LLM
> compliance — see Step 2 below).

Deep research runs in the background by default via a spawned Claude Code instance, keeping the main chat free. The main thread's job is to prepare a self-contained Research Brief, then spawn.

**Exception:** For quick mode (2-5 min) or when the user explicitly requests foreground execution, run inline instead — the overhead of spawning, UUID generation, and file-based output exceeds the research time for short tasks.

### Step 1: Prepare the Research Brief

**Before spawning, the main thread MUST resolve all conversation context into a self-contained brief.** The spawned instance has NO access to the current conversation — it only knows what's in the prompt.

**Context Resolution Rules:**
- Replace ALL pronouns and references: "this", "the above", "what we discussed", "the approach from earlier" → explicit descriptions
- Include relevant prior findings: if the conversation produced data, decisions, or constraints that affect the research, state them explicitly
- If the user's request is vague ("look into databases"), ask ONE clarifying question before spawning — don't spawn with an ambiguous topic. If the answer is still ambiguous, proceed with the most reasonable interpretation and note assumptions in the PRIOR CONTEXT section of the Research Brief

**Optional brief-template prefix (defense-in-depth against recursion bug):**

In addition to the env-var role check, prepend the following to the brief content. This way, even if the env-var check fails, the brief content steers the worker correctly:

```
*** YOU ARE THE WORKER ***
You are the spawned `claude -p` worker, NOT the parent session. Do NOT
spawn another `claude -p` instance. Run the 10-phase pipeline against the
topic below directly. Skip the `## Background Mode` section of SKILL.md
entirely.
*** END WORKER NOTICE ***
```

**Optional resume prefix:** When re-spawning to resume a prior killed dispatch (Path A), prepend the `*** RESUME FROM CHECKPOINT ***` block defined in `## Resume After Interruption` below, BEFORE the brief content. The auto-detect path (Path B) doesn't require this prefix — see resume documentation.

**Research Brief Template:**
```
RESEARCH BRIEF
==============
TOPIC: [Fully resolved topic description — no pronouns, no references to conversation context]

QUESTIONS TO ANSWER:
1. [Specific question — not "look into it" but "what are the tradeoffs between X and Y?"]
2. [Additional specific questions]

PRIOR CONTEXT (if any):
- [Any findings, decisions, or constraints from the current conversation that the research should account for]
- [e.g., "We've already ruled out PostgreSQL due to write throughput requirements"]
- [e.g., "The user has 82% discount on Claude API and no budget for external APIs"]
- [Omit this section entirely if the research is standalone with no prior context]

SCOPE:
- IN: [What to cover]
- OUT: [What to exclude]
- PRIORITY: [What matters most — accuracy, breadth, specific domain focus]

MODE: [quick/standard/deep/ultradeep]

OUTPUT FORMAT (optional):
- [Default: Markdown + HTML + PDF]
- [Override if user requested specific formats, e.g., "markdown only, no HTML"]
```

### Step 2: Generate UUID and Spawn

```bash
UUID8=$(uuidgen | cut -c1-8)
DATE=$(date +%Y%m%d)
TOPIC_SLUG="[Clean_Topic_Name]"
MODE="ultradeep"  # one of: quick / standard / deep / ultradeep — must match Research Brief
OUTPUT_DIR=~/Documents/Research/${TOPIC_SLUG}_${DATE}_${UUID8}
```

First, write the Research Brief to a temp file (avoids shell quoting issues with multi-line content):

```bash
cat > /tmp/research-brief-${UUID8}.txt << 'BRIEF'
[Paste the completed Research Brief template here]

Save all output to [OUTPUT_DIR]. Follow the deep-research skill methodology completely.
Run all phases for the selected mode.
Register this task in ~/.claude/research-tasks.json with UUID [UUID8].
BRIEF
```

**Cost forecast (print before spawning, so the operator can decline if budget is tight):**

```
Estimated cost for ${MODE} mode on this topic (UPPER BOUND — actual usage typically lower):
- Phase 1-2:        ~30K tokens   (lead, Opus)
- Phase 3 RETRIEVE: ~400K tokens  (4 Sonnet sub-agents)
- Phase 4-7:        ~150K tokens  (lead, Opus)
- Phase 7.5 VERIFY: ~200K tokens  (verification sub-agents)
- Phase 8 PACKAGE:  ~50K tokens   (lead, Opus)
- TOTAL:            ~830K tokens  (single ultradeep dispatch)
- At max-plan rates: ~1-2% of the 5-hour quota window per dispatch
- For 10 parallel dispatches: ~10-20% of the 5-hour window

These are upper bounds calibrated against historical heavy-mode dispatches.
For deep mode, expect ~50% of the above. For standard, ~25%. For quick, <10%.
Use as a sanity check before spawning N>3 parallel dispatches when quota
is constrained.
```

### Spawn Command — STDIN REDIRECT IS REQUIRED

> **The `< /dev/null` redirect is NOT optional.** Without it, the worker
> process hangs at startup with no clear error, despite a misleading
> "proceeding without it" warning in stderr. This has wasted hours of
> debugging in past sessions. Always include the redirect.

The unified spawn template combines:
- **Bug 1 fix** — `CLAUDE_CODE_DEEP_RESEARCH_WORKER=1` env-var guard against recursion
- **Bug 1 + I4 fix** — wrapper-side `[ROLE-CHECK-WRAPPER]` echo (operator-visible signal independent of LLM compliance)
- **Cross-cutting A** — `CLAUDE_CODE_DEEP_RESEARCH_UUID8` for `ps eww` visibility
- **Bug 3 fix** — mandatory `< /dev/null` redirect on its own line
- **Bug 4 fix** — `_starting.txt` written BEFORE the `claude -p` invocation (proves the bash wrapper itself ran)
- **Bug 7 Layer 4** — `tmux new-session -d` for live monitoring + named-session enumeration

```bash
# 1. Liveness signal (Bug 4): write _starting.txt BEFORE claude -p so its
#    presence proves the bash wrapper itself ran successfully.
mkdir -p "$OUTPUT_DIR"
echo "started=$(date -u +%Y-%m-%dT%H:%M:%SZ) uuid=${UUID8} mode=${MODE} pid=$$" \
    > "${OUTPUT_DIR}/_starting.txt"

# 2. Wrapper-side role-check echo (Bug 1, I4): operator-visible signal
#    that the wrapper fired, independent of any LLM behavior.
echo "[ROLE-CHECK-WRAPPER] dispatched ${UUID8} as worker at $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    >> "/tmp/research-${UUID8}.log"

# 3. Spawn via tmux (Bug 7 Layer 4): named session enables live monitoring,
#    cross-dispatch enumeration, and clean kill semantics. Use the
#    nohup+disown fallback (below) for environments without tmux.
tmux new-session -d -s "research-${UUID8}" \
  "CLAUDE_CODE_DEEP_RESEARCH_WORKER=1 \
   CLAUDE_CODE_DEEP_RESEARCH_UUID8=${UUID8} \
   CLAUDE_CODE_EFFORT_LEVEL=max \
   claude -p \"\$(cat /tmp/research-brief-${UUID8}.txt)\" \
     --model opus --effort max \
     --dangerously-skip-permissions \
     < /dev/null \
     2>/tmp/research-${UUID8}.err \
     | tee -a /tmp/research-${UUID8}.log"
```

**Fallback for environments without tmux** (rare on macOS/Linux dev workstations; possible on minimal CI containers):

```bash
mkdir -p "$OUTPUT_DIR"
echo "started=$(date -u +%Y-%m-%dT%H:%M:%SZ) uuid=${UUID8} mode=${MODE} pid=$$" \
    > "${OUTPUT_DIR}/_starting.txt"
echo "[ROLE-CHECK-WRAPPER] dispatched ${UUID8} as worker at $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    >> "/tmp/research-${UUID8}.log"

nohup bash -c "CLAUDE_CODE_DEEP_RESEARCH_WORKER=1 \
  CLAUDE_CODE_DEEP_RESEARCH_UUID8=${UUID8} \
  CLAUDE_CODE_EFFORT_LEVEL=max \
  claude -p \"\$(cat /tmp/research-brief-${UUID8}.txt)\" \
    --model opus --effort max \
    --dangerously-skip-permissions \
    < /dev/null \
    2>/tmp/research-${UUID8}.err \
    | tee -a /tmp/research-${UUID8}.log" &
disown
```

**For zellij users** (drop-in tmux alternative): same shape with `zellij action new-tab --name "research-${UUID8}" -- bash -c "..."`.

**Why `--model opus --effort max` is explicit (and `CLAUDE_CODE_EFFORT_LEVEL=max` is also set inline):**

**Model — hybrid architecture:** The lead agent (this spawned `claude -p` instance) runs on **Opus 4.6** for ALL phases — the hybrid split is about WHO (lead vs sub-agent) not WHEN (which phase). Sub-agents spawned via the Task tool inside the pipeline (Phase 3 retrieval, Phase 6 gap-filling, Phase 7.5 citation verifiers, Phase 7.5 adversarial agent) run on **Sonnet 4.6**. The methodology file enforces `model="sonnet"` on every Task tool spawn. Hardcoding `--model opus` here ensures the hybrid setup works regardless of the user's default model.

**Effort — max for the lead, high for sub-agents (two distinct execution contexts):**

There are TWO separate Claude Code sessions involved here, each with its own effort configuration:

1. **The PARENT session that invokes this skill** (for example, the user's interactive Claude Code session that triggered `/deep-research` or saw "use the deep-research skill"). The frontmatter `effort: max` on line 4 applies to THIS session — it tells the parent session to run at max effort while it prepares the Research Brief and orchestrates the spawn. The parent loads SKILL.md as its driving skill, so the frontmatter is honored here.

2. **The SPAWNED `claude -p` subprocess that runs the 10-phase pipeline.** This is a brand-new Claude Code session that does NOT load this SKILL.md as its driving skill — it just executes the prompt passed via `-p`. Therefore the frontmatter `effort: max` does NOTHING for the subprocess. The subprocess gets its effort from TWO mechanisms:
   - `CLAUDE_CODE_EFFORT_LEVEL=max` prepended inline on the spawn command
   - `--effort max` flag on the CLI

   Both are required because:
   - The Bash tool runs `zsh -c` (non-interactive), which does NOT source `~/.zshrc`. The user's pinned `CLAUDE_CODE_EFFORT_LEVEL=max` from `~/.zshrc` is therefore NOT propagated from the parent shell to the subprocess automatically. Inline-prepending the env var fixes this.
   - The CLI `--effort max` flag is a redundant safety net — if a future Claude Code version changes env var precedence rules, the explicit CLI flag still wins. It is also self-documenting in the spawn command.

**Sub-agents (Sonnet 4.6 via Task tool) inside the spawned subprocess:** The Task tool has NO `effort` parameter, so sub-agents inherit the env var from the subprocess (which we set to max). Sonnet 4.6 only supports `low` / `medium` / `high` (not `max`); when an unsupported value like `max` is passed, the expected behavior is that Sonnet runs at its highest available level (`high`), which is also Sonnet's default. This has not been independently verified against an official Anthropic doc as of this writing — if the actual fallback turns out to be Sonnet's default `high`, the result is the same. Either way, sub-agents end up at Sonnet's quality ceiling.

**Haiku 4.5** does NOT support effort configuration at all (effort flags are ignored). We don't use Haiku in this pipeline anyway.

**If you do not have Opus access:** Change FOUR things:
1. The frontmatter on line 4 from `effort: max` → `effort: high` (so the parent session that invokes this skill doesn't request an unsupported effort level)
2. `--model opus` → `--model sonnet` on the spawn command
3. `--effort max` → `--effort high` on the spawn command
4. `CLAUDE_CODE_EFFORT_LEVEL=max` → `CLAUDE_CODE_EFFORT_LEVEL=high` on the spawn command

The skill will still function correctly with the Sonnet-only fallback architecture (lead and sub-agents both on Sonnet at high effort), but you will lose the lead-agent quality edge described in the Phase 3 "Why Opus for the lead agent" section. This is a graceful degradation, not a failure mode.

### How It Works

1. The main thread prepares a self-contained Research Brief (resolving all context)
2. The bash wrapper writes `_starting.txt` and emits `[ROLE-CHECK-WRAPPER]` to the log
3. A tmux session runs the `claude -p` command in the background
4. The spawned Claude Code instance loads the deep-research skill from `~/.claude/skills/deep-research/`, sees the env-var role check, and proceeds as a worker (skipping `## Background Mode`)
5. Phase 0 RESUME DETECTION runs first — if OUTPUT_DIR is empty, proceed to Phase 1; if prior artifacts exist, reconcile and resume
6. Results are written to a unique UUID-tagged directory; phase artifacts use canonical filenames (see `reference/resume.md`)
7. Phase 8 PACKAGE writes the report, HTML, PDF, provenance sidecar, then the final checkpoint update, then `_DONE` LAST
8. When the process exits, the tmux session terminates automatically — `tmux ls | grep research-<UUID8>` returning empty proves done

### Requirements

- `--dangerously-skip-permissions` is required — non-interactive mode has no human to approve tool calls
- The Research Brief MUST be self-contained — no references to "the current conversation"
- If the user's request is ambiguous, ask for clarification BEFORE spawning (one question only)
- The `< /dev/null` redirect MUST be present (Bug 3)
- The `_starting.txt` write MUST happen BEFORE invoking `claude -p` (Bug 4)

### Limitations

- Separate API session (no shared context with main chat — this is why the Research Brief must be self-contained)
- Runs non-interactively (won't ask questions mid-run — uses Autonomy Principle)
- If the spawned instance encounters gaps, it documents them in the Limitations section of its report rather than asking for clarification

---

## Concurrency Guidelines

When the user runs multiple dispatches in parallel (a common workflow for fan-out research like per-peptide reports, per-vendor scrapes, per-topic deep-dives), each worker MUST observe the following.

**Source of the guidance:** A 2026-04-25 session ran ~14 parallel deep-research dispatches and hit the 5-hour Anthropic quota window mid-pipeline. Of those, 8-10 lost meaningful work. The caps below are derived from that incident's evidence.

### Tab isolation (browser MCP / Chrome MCP)

- Every web fetch happens in a tab the worker created.
- Workers NEVER touch tabs they didn't create — those belong to other workers or to the user.
- On startup, call the browser MCP's "list tabs" once and treat all existing tab IDs as off-limits. Only operate on tabs created by THIS worker (track tab IDs in a local list).

### Concurrency caps (recommended, derived from the 2026-04-25 incident)

- **General research:** 5-10 concurrent workers is OK on a max-plan account.
- **Web-scrape-heavy** (Reddit, vendor catalogs, sites with anti-bot): cap at 3-5 concurrent to avoid IP-level rate limiting.
- **Above ~14 concurrent:** observed to cause quota exhaustion mid-pipeline.
- **Same-domain rate limit:** workers should self-rate-limit to ≤1 request per 2-5 sec per domain.

### Session-aware sites

For sites where the user is logged in (Reddit, GitHub, etc.), the worker uses the user's existing session via Chrome MCP — but never navigates to URLs that would log out, change password, or trigger account-modifying actions.

### Failure modes

- If a tab the worker owns disappears (other agent killed it accidentally, browser restart), the worker re-creates the tab and retries once. If still failing, the worker marks the lookup as `[BROWSER FAILURE — NO ACCESS]` and continues.
- If the IP is rate-limited by a site, the worker waits exponentially (60s, 120s, 240s) and retries up to 3 times.

---

## Resume After Interruption

When a dispatch is killed mid-pipeline (operator kill, OS OOM, quota exhaustion, machine reboot), all phase artifacts written so far remain on disk in OUTPUT_DIR. The pipeline supports resume from the last completed phase boundary or the last completed sub-agent inside fan-out phases.

For full mechanics see `reference/resume.md`.

### Path A — Brief-prefix resume (explicit)

To resume a killed dispatch, re-spawn `claude -p` with the SAME `OUTPUT_DIR` and prepend a RESUME header to the brief. The worker reads the existing artifacts as authoritative and re-runs only the missing work.

```
*** RESUME FROM CHECKPOINT ***

OUTPUT_DIR contains phase artifacts from a prior dispatch that was
interrupted. Read OUTPUT_DIR/_checkpoint.json to determine `phase_completed`.
Read all existing phase artifacts in OUTPUT_DIR and treat them as
authoritative. Reconcile against disk per the Disk-Truth Reconciliation
rule in reference/resume.md: if a phase artifact exists on disk but the
checkpoint disagrees, trust the disk and proceed.

Resume from the phase AFTER `phase_completed`. For Phase 3 RETRIEVE / 6
CRITIQUE / 7.5 VERIFY, also read OUTPUT_DIR/_subagent_progress.json (if
present) and skip sub-agents whose output files already exist on disk.

Do NOT re-do completed phases. Do NOT overwrite existing artifacts. If a
partial artifact exists for the in-flight phase, DELETE it and redo only
that one phase.

If `phase_completed` is "PACKAGE" and `_DONE` exists in OUTPUT_DIR, the
dispatch is COMPLETE — exit immediately and confirm the existing report.

*** END RESUME HEADER ***

[Original brief content here]
```

### Path B — Auto-detect (transparent)

If the spawn command targets an OUTPUT_DIR that already exists AND contains either `_checkpoint.json` OR any `phase*.md` artifact, the worker's Phase 0 step auto-detects this and runs the same resume logic without needing the explicit header. Path B is a convenience layer over Path A — they share the same logic.

To force a fresh restart even when artifacts exist, the operator must explicitly remove the directory: `rm -rf $OUTPUT_DIR && mkdir -p $OUTPUT_DIR`.

### Granularity

The skill supports two resume granularities (Granularity 3 mid-LLM-turn resume is intentionally NOT implemented — see `reference/resume.md` for rationale):

- **Granularity 1 (phase-boundary):** resume at the phase boundary AFTER the last completed phase. All complete-phase artifacts are read from disk; the first incomplete phase runs fresh.
- **Granularity 2 (sub-agent-boundary):** within Phase 3 / 6 / 7.5, resume at the sub-agent boundary. Existing sub-agent output files are preserved; only missing sub-agents are re-spawned.

---

## Graceful Pause

To pause a running dispatch (e.g., to wait out a quota window), the operator creates a flag file in OUTPUT_DIR:

| Flag | Pause depth | Boundary checked | Resume requires |
|---|---|---|---|
| `_STOP_REQUESTED` | Soft (finish current PHASE) | End of every phase | Operator removes the flag |
| `_STOP_NOW` | Aggressive (finish current sub-agent or LLM call) | End of every sub-agent + every LLM call | Operator removes the flag |

Workers check for both flags at every safe boundary (between phases, between sub-agents in fan-out phases). When a flag is detected:

1. Worker writes `_checkpoint.json` with `status: "paused"` and `paused_reason: "flag-stop_soft"` (for `_STOP_REQUESTED`) or `"flag-stop_now"` (for `_STOP_NOW`)
2. Worker writes a human-readable `_PAUSED_AT_PHASE_<NAME>.txt` in OUTPUT_DIR with resume instructions
3. Worker exits cleanly with code 0

**Flag policy (Policy A — worker does NOT delete the flag):** the operator MUST `rm` the flag before resuming. Phase 0 RESUME DETECTION explicitly checks for the flag at startup and refuses to resume if present, with this error:

```
Found _STOP_REQUESTED in OUTPUT_DIR. Remove it before resuming, or this
dispatch will pause again immediately at the first phase boundary.
```

**Operator workflows:**

- Pause one dispatch: `touch ~/Documents/Research/peptide_xyz_*/_STOP_REQUESTED`
- Pause all: `for d in ~/Documents/Research/peptide_*; do touch "$d/_STOP_REQUESTED"; done`
- Resume one: `rm ~/Documents/Research/peptide_xyz_*/_STOP_REQUESTED`, then re-spawn `claude -p` with the same OUTPUT_DIR (Path A or Path B resume)

The pause checkpoint format is identical to a normal phase-boundary checkpoint plus the `status` and `paused_reason` fields, so the resume protocol handles paused dispatches without special cases.

---

## Detecting Completion

A dispatch is COMPLETE when the bash wrapper process has exited AND the `_DONE` sentinel file exists in OUTPUT_DIR. Either signal alone is suggestive but not authoritative; together they're definitive.

### Layer 1 — Process exit

The bash wrapper that invoked `claude -p` exits when the worker exits. Check via:

```bash
if ! ps -p "$wrapper_pid" > /dev/null 2>&1; then
    if [ -f "$OUTPUT_DIR/_DONE" ]; then
        echo "Dispatch $UUID8 complete; report ready at $OUTPUT_DIR/"
    elif [ -f "$OUTPUT_DIR/_starting.txt" ]; then
        echo "Dispatch $UUID8 exited without producing _DONE — investigate $OUTPUT_DIR and the .err log"
    else
        echo "Dispatch $UUID8 exited without even writing _starting.txt — bash wrapper failed"
    fi
fi
```

### Layer 2 — `_DONE` sentinel

The worker's FINAL action in Phase 8 PACKAGE is to write `_DONE` atomically (via `~/.claude/skills/deep-research/scripts/atomic_checkpoint.py done --output-dir $OUTPUT_DIR --uuid8 $UUID8`). Operator gate: `[ -f "$OUTPUT_DIR/_DONE" ]`. Single boolean check. Exists ⇒ done. Absent ⇒ either still in flight OR exited mid-pipeline (investigate).

The Phase 8 ordering rule guarantees `_DONE` has the most-recent mtime of any file in OUTPUT_DIR — see methodology.md Phase 8 for the strict ordering.

### Layer 3 — `~/.claude/research-tasks.json` status

The worker registers itself in `research-tasks.json` at Phase 0 with `status: "in_progress"` and updates to `status: "complete"` as part of Phase 8 PACKAGE. Useful for monitoring multiple parallel dispatches:

```bash
# All in-flight:
jq -r '.tasks[] | select(.status == "in_progress") | "\(.uuid)\t\(.topic)"' \
    ~/.claude/research-tasks.json

# All complete in last hour (macOS date syntax):
jq -r --arg h "$(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ)" \
    '.tasks[] | select(.status == "complete" and .complete_time > $h) | .uuid' \
    ~/.claude/research-tasks.json
```

### Layer 4 — tmux session enumeration

When the spawn template uses `tmux new-session` (the default), `tmux ls` enumerates all in-flight dispatches in one command:

```bash
tmux ls | grep ^research-
```

When the wrapped command exits, the tmux session terminates automatically. So `tmux ls | grep research-<UUID8>` returning no match = dispatch done. This is the same Layer 1 process-exit signal but with named-session tracking instead of PID bookkeeping.

For `nohup+disown` fallback dispatches, use the PID-based check from Layer 1 instead.

---
