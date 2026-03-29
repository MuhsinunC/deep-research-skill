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

## Background Mode (Non-Blocking)

To run deep research without blocking the main chat, spawn it as a background Claude Code instance:

**Step 1: Generate UUID and set up variables:**
```bash
UUID8=$(uuidgen | cut -c1-8)
DATE=$(date +%Y%m%d)
TOPIC_SLUG="Topic_Name_Here"  # clean, underscored
OUTPUT_DIR=~/Documents/Research/${TOPIC_SLUG}_${DATE}_${UUID8}
```

**Step 2: Spawn the background research instance:**
```
Bash(run_in_background: true):
claude -p "You are running a deep research task. Topic: ${TOPIC}. Save all output to ${OUTPUT_DIR}/. Follow the deep-research skill methodology completely. Register this task in ~/.claude/research-tasks.json with UUID ${UUID8}." --max-turns 50 --output-format stream-json 2>&1 | tee /tmp/research-${UUID8}.log
```

**How it works:**
1. A background subagent runs the `claude -p` command via Bash
2. The spawned Claude Code instance is a full session with its own sub-agent capabilities
3. It loads the deep-research skill from `~/.claude/skills/deep-research/`
4. Results are written to a unique directory (UUID-tagged)
5. When the process exits, the background subagent returns, notifying the main session

**Limitations:**
- Separate API session (no shared context with main chat)
- No cross-session prompt caching (irrelevant — research is independent)
- Runs non-interactively (won't ask questions — uses Autonomy Principle)
