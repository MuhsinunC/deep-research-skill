---
name: deep-research
description: Deep research expert. ALWAYS invoke for deep research, research reports, comprehensive analysis, or multi-source investigation. Do not attempt research directly -- use this skill first. NOT for simple lookups or debugging.
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

Deep research ALWAYS runs in the background via a spawned Claude Code instance, keeping the main chat free. The main thread's job is to prepare a self-contained Research Brief, then spawn.

### Step 1: Prepare the Research Brief

**Before spawning, the main thread MUST resolve all conversation context into a self-contained brief.** The spawned instance has NO access to the current conversation — it only knows what's in the prompt.

**Context Resolution Rules:**
- Replace ALL pronouns and references: "this", "the above", "what we discussed", "the approach from earlier" → explicit descriptions
- Include relevant prior findings: if the conversation produced data, decisions, or constraints that affect the research, state them explicitly
- If the user's request is vague ("look into databases"), ask ONE clarifying question before spawning — don't spawn with an ambiguous topic

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
```

### Step 2: Generate UUID and Spawn

```bash
UUID8=$(uuidgen | cut -c1-8)
DATE=$(date +%Y%m%d)
TOPIC_SLUG="[Clean_Topic_Name]"
OUTPUT_DIR=~/Documents/Research/${TOPIC_SLUG}_${DATE}_${UUID8}
```

```
Bash(run_in_background: true):
claude -p "[PASTE RESEARCH BRIEF HERE]. Save all output to ${OUTPUT_DIR}/. Follow the deep-research skill methodology completely. Run all phases for the selected mode. Register this task in ~/.claude/research-tasks.json with UUID ${UUID8}." --max-turns 50 --dangerously-skip-permissions --output-format stream-json 2>&1 | tee /tmp/research-${UUID8}.log
```

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
