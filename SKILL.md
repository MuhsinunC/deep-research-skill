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
- **Checkpoint/resume:** Save `_checkpoint.json` at the end of each phase
- **Source preferences:** Prioritize primary/authoritative sources, deprioritize SEO content farms

---

## Execution

**On invocation, load relevant reference files:**

1. **Phase 1-7:** Load [methodology.md](./reference/methodology.md) for detailed phase instructions
2. **Phase 8 (Report):** Load [report-assembly.md](./reference/report-assembly.md) for progressive generation
3. **HTML/PDF output:** Load [html-generation.md](./reference/html-generation.md)
4. **Quality checks:** Load [quality-gates.md](./reference/quality-gates.md)
5. **Long reports (>18K words):** Load [continuation.md](./reference/continuation.md)

**Templates:**
- Report structure: [report_template.md](./templates/report_template.md)
- HTML styling: [mckinsey_report_template.html](./templates/mckinsey_report_template.html)

**Scripts:**
- `python scripts/validate_report.py --report [path]`
- `python scripts/verify_citations.py --report [path]`
- `python scripts/md_to_html.py [markdown_path]`

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
- Markdown (primary source)
- HTML (McKinsey style, auto-opened)
- PDF (professional print, auto-opened)

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

Deep research runs in the background by default via a spawned Claude Code instance, keeping the main chat free. The main thread's job is to prepare a self-contained Research Brief, then spawn.

**Exception:** For quick mode (2-5 min) or when the user explicitly requests foreground execution, run inline instead — the overhead of spawning, UUID generation, and file-based output exceeds the research time for short tasks.

### Step 1: Prepare the Research Brief

**Before spawning, the main thread MUST resolve all conversation context into a self-contained brief.** The spawned instance has NO access to the current conversation — it only knows what's in the prompt.

**Context Resolution Rules:**
- Replace ALL pronouns and references: "this", "the above", "what we discussed", "the approach from earlier" → explicit descriptions
- Include relevant prior findings: if the conversation produced data, decisions, or constraints that affect the research, state them explicitly
- If the user's request is vague ("look into databases"), ask ONE clarifying question before spawning — don't spawn with an ambiguous topic. If the answer is still ambiguous, proceed with the most reasonable interpretation and note assumptions in the PRIOR CONTEXT section of the Research Brief

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

Then spawn:
```
Bash(run_in_background: true):
CLAUDE_CODE_EFFORT_LEVEL=max claude -p "$(cat /tmp/research-brief-${UUID8}.txt)" --model opus --effort max --max-turns 200 --dangerously-skip-permissions < /dev/null 2>/tmp/research-${UUID8}.err | tee /tmp/research-${UUID8}.log
```

**Why `--model opus --effort max` is explicit (and `CLAUDE_CODE_EFFORT_LEVEL=max` is also set inline):**

**Model — hybrid architecture:** The lead agent (this spawned `claude -p` instance) runs on **Opus 4.6** for ALL phases — the hybrid split is about WHO (lead vs sub-agent) not WHEN (which phase). Sub-agents spawned via the Task tool inside the pipeline (Phase 3 retrieval, Phase 6 gap-filling, Phase 7.5 citation verifiers, Phase 7.5 adversarial agent) run on **Sonnet 4.6**. The methodology file enforces `model="sonnet"` on every Task tool spawn. Hardcoding `--model opus` here ensures the hybrid setup works regardless of the user's default model.

**Effort — max for the lead, default high for sub-agents:**
- The lead Opus 4.6 instance MUST run at `max` effort (Opus's highest level, only available on Opus 4.6). The default for Opus is `medium`, which produces materially worse research output. The skill SKILL.md frontmatter sets `effort: max`, but we ALSO pass `--effort max` on the CLI and `CLAUDE_CODE_EFFORT_LEVEL=max` inline because the Bash tool runs `zsh -c` (non-interactive) which does NOT source `~/.zshrc`. Without all three belt-and-suspenders, the spawned subprocess silently falls back to medium effort.
- Sub-agents (Sonnet 4.6 via Task tool) automatically use Sonnet's highest effort `high` (which is also Sonnet's default — Sonnet does NOT support `max`, that level is Opus-only). The Task tool has no `effort` parameter, so sub-agents inherit the env var `CLAUDE_CODE_EFFORT_LEVEL=max` from this spawn — but Sonnet maps `max` → `high` since `max` is not valid for Sonnet. This is the intended behavior.
- Haiku 4.5 does NOT support effort configuration at all, but we don't use Haiku in this pipeline.

**If you do not have Opus access:** Change `--model opus` to `--model sonnet` AND `--effort max` to `--effort high` AND `CLAUDE_CODE_EFFORT_LEVEL=max` to `CLAUDE_CODE_EFFORT_LEVEL=high`. The skill will still function correctly with the Sonnet-only fallback architecture (lead and sub-agents both on Sonnet at high effort), but you will lose the lead-agent quality edge described in the Phase 3 "Why Opus for the lead agent" section. This is a graceful degradation, not a failure mode.

### How It Works

1. The main thread prepares a self-contained Research Brief (resolving all context)
2. A background subagent runs the `claude -p` command via Bash
3. The spawned Claude Code instance is a full session with its own sub-agent capabilities
4. It loads the deep-research skill from `~/.claude/skills/deep-research/`
5. Results are written to a unique UUID-tagged directory
6. When the process exits, the background subagent returns, notifying the main session
7. The main thread reads the output files and presents a summary to the user

### Requirements

- `--dangerously-skip-permissions` is required — non-interactive mode has no human to approve tool calls
- The Research Brief MUST be self-contained — no references to "the current conversation"
- If the user's request is ambiguous, ask for clarification BEFORE spawning (one question only)

### Limitations

- Separate API session (no shared context with main chat — this is why the Research Brief must be self-contained)
- Runs non-interactively (won't ask questions mid-run — uses Autonomy Principle)
- If the spawned instance encounters gaps, it documents them in the Limitations section of its report rather than asking for clarification
