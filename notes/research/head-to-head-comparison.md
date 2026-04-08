# Head-to-Head Comparison: Deep Research Skills for Claude Code

**Compared:**
- **199-biotechnologies/claude-deep-research-skill** ("199bio") — [GitHub](https://github.com/199-biotechnologies/claude-deep-research-skill)
- **altmbr/claude-research-skill** ("altmbr") — [GitHub](https://github.com/altmbr/claude-research-skill)

**Date:** 2026-03-21

---

## 1. Size and Structure

| Metric | 199bio | altmbr |
|--------|--------|--------|
| SKILL.md lines | 101 | 228 |
| SKILL.md words | 508 | 1,613 |
| Total system (all files) lines | 1,832 | 228 |
| Total system (all files) words | 7,391 | 1,613 |
| Supporting files | 7 reference/template docs + 7 Python scripts + HTML template | None (self-contained) |

The 199bio skill is a **modular system**. The SKILL.md is deliberately lean (~100 lines), serving as an entry point that dynamically loads reference files at runtime:

> "On invocation, load relevant reference files:
> 1. Phase 1-7: Load methodology.md for detailed phase instructions
> 2. Phase 8 (Report): Load report-assembly.md for progressive generation
> 3. HTML/PDF output: Load html-generation.md
> 4. Quality checks: Load quality-gates.md
> 5. Long reports (>18K words): Load continuation.md"

The altmbr skill is **entirely self-contained** in a single 228-line SKILL.md. Everything the orchestrator and its agents need is defined in one file. This is a deliberate design choice for portability -- installation is literally `cp SKILL.md ~/.claude/commands/research.md`.

---

## 2. Pipeline Phases

### 199bio: Up to 8+ Phases (Single-Agent, Tiered Complexity)

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
| 8 | PACKAGE | Y | Y | Y | Y |

Four complexity modes with different phase subsets and time targets:
- **Quick:** 3 phases, 2-5 min
- **Standard:** 6 phases, 5-10 min (default)
- **Deep:** 8 phases, 10-20 min
- **UltraDeep:** 8+ phases, 20-45 min

### altmbr: 5 Phases (Multi-Agent Orchestrator)

| Phase | Name | Description |
|-------|------|-------------|
| 1 | Plan the Research | Decompose, present plan, get user approval |
| 2 | Create Skeleton Files | Pre-create output files with section headers and agent instructions |
| 3 | Launch Research Agents | Parallel background agents via Task tool |
| 4 | Monitor Progress | Escalating check-ins, stuck agent detection, relaunch |
| 5 | Synthesis | Cross-cutting synthesis agent reads all outputs |

Single mode, no tiering. Every research task gets the full pipeline.

### Key Difference

199bio is a **single-agent deep pipeline** -- one agent goes through increasingly rigorous phases of scoping, retrieving, triangulating, critiquing, and refining. Altmbr is a **multi-agent orchestrator** -- it decomposes the question into parallel workstreams, each handled by an independent agent, then synthesizes.

---

## 3. Tools Used

### 199bio

| Tool | Usage |
|------|-------|
| WebSearch | Primary search (always available) |
| Exa MCP (`mcp__Exa__exa_search`) | Optional semantic/neural search |
| search-cli (custom CLI) | Optional multi-provider aggregation (Brave, Serper, Exa, Jina, Firecrawl) |
| WebFetch | Deep dives into specific sources |
| Task (subagents) | 3-5 parallel agents during RETRIEVE phase |
| Grep/Read | Local documentation |
| Bash | Date retrieval, script execution, validation |
| Python scripts | `validate_report.py`, `verify_citations.py`, `source_evaluator.py`, `citation_manager.py`, `md_to_html.py`, `verify_html.py`, `research_engine.py` |
| Write/Edit | Progressive report assembly |

### altmbr

| Tool | Usage |
|------|-------|
| WebSearch | Research agents' primary tool |
| WebFetch | Research agents' secondary tool |
| Task | Agent orchestration (with `run_in_background: true`) |
| Read/Write/Edit | File operations for agents |
| Glob/Grep | File search for agents |
| Bash | `wc -l` for progress monitoring only |

Notable: altmbr explicitly states "Agents cannot run Bash" -- agents are restricted to WebSearch, WebFetch, Read, Write, Edit, Glob, Grep.

### Key Difference

199bio has a significantly larger tool surface: optional Exa MCP integration, a custom `search-cli` brew package for multi-provider search, and 7 Python scripts for validation, citation management, and HTML/PDF conversion. Altmbr uses only Claude Code built-in tools with zero external dependencies.

---

## 4. Parallelization Strategy

### 199bio: Parallel Searches + Sub-Agents During Retrieval

Parallelization happens within Phase 3 (RETRIEVE). The approach:

1. Decompose the research question into 5-10 independent search angles
2. Launch all searches concurrently in a single message with multiple tool calls
3. Spawn 3-5 sub-agents via Task tool for deep dives (academic papers, docs, repos)

Sub-agents return **structured evidence objects**:
```json
{"claim": "specific claim text", "evidence_quote": "exact quote from source", "source_url": "https://...", "source_title": "...", "confidence": 0.85}
```

The main agent still does all synthesis, triangulation, critique, and report writing.

Includes a **First Finish Search (FFS) pattern** with adaptive quality thresholds:
> "Proceed to Phase 4 when FIRST threshold reached:
> - Quick mode: 10+ sources with avg credibility >60/100 OR 2 minutes elapsed
> - Standard mode: 15+ sources with avg credibility >60/100 OR 5 minutes elapsed
> - Deep mode: 25+ sources with avg credibility >70/100 OR 10 minutes elapsed"

### altmbr: Full Multi-Agent Decomposition

Parallelization is the core architecture. The approach:

1. Decompose the entire research question into 2-4 non-overlapping workstreams
2. Each workstream gets its own independent agent running in background
3. Each agent writes to its own markdown file
4. A synthesis agent runs after all complete

The orchestrator monitors via escalating check-ins (30s, 2min, 5min, then every 5min) and implements **stuck agent recovery**:

> "If an agent's line count has NOT increased between two consecutive check-ins, it is stuck. Do NOT wait -- stop it immediately with TaskStop and relaunch."

Relaunched agents get pre-loaded data from the stuck agent's partial output plus stricter protocol language.

### Key Difference

199bio parallelizes at the **search level** (many searches, few sub-agents) while the main agent remains the single brain. Altmbr parallelizes at the **research question level** (each agent owns an entire domain). Altmbr's approach produces more total output faster (multiple agents writing simultaneously) but with less cross-referencing between domains. 199bio's approach allows deeper triangulation since one agent holds all the evidence.

---

## 5. Source Quality and Verification

### 199bio: Multi-Layered Verification System

**Source credibility scoring (0-100):**
- Automated via `source_evaluator.py` script
- Low-credibility sources (<40) flagged for additional verification
- High-credibility sources (>80) prioritized for core claims

**Triangulation (Phase 4):**
- Core claims must have 3+ independent sources
- Single-source information flagged
- Recency of information noted
- Potential biases identified
- Verification status documented per claim

**Source diversity requirements:**
> "Minimum 3 source types (academic, industry, news, technical docs)
> Temporal diversity (mix of recent 12-18 months + foundational older sources)
> Perspective diversity (proponents + critics + neutral analysis)
> Geographic diversity (not just US sources)"

**Critique phase (Phase 6, Deep/UltraDeep):**
- Red team questions: "What's missing? What could be wrong? What alternative explanations exist?"
- Persona-based critique: Skeptical Practitioner, Adversarial Reviewer, Implementation Engineer
- Critical gap loop-back to Phase 3 if blind spots found

**Anti-hallucination protocol:**
> "Source grounding: Every factual claim MUST cite specific source immediately [N]
> Clear boundaries: Distinguish FACTS (from sources) from SYNTHESIS (your analysis)
> No speculation without labeling: Mark inferences as 'This suggests...'"

**Automated validation scripts:**
- `validate_report.py`: 9 automated checks (section presence, citation formatting, word counts, placeholders)
- `verify_citations.py`: DOI resolution, title/year matching, hallucination detection
- Validation loop: validate -> fix -> retry, max 3 cycles

### altmbr: Protocol-Based Integrity

**Write protocol enforces source discipline:**
> "Every quantitative claim needs an inline source URL: [Source Name](https://url.com)
> Do NOT put sources at the bottom. Inline only."

**No automated verification.** Quality depends on:
1. The strict search-write alternation protocol preventing agents from accumulating unsourced claims
2. Inline citation requirement at the agent prompt level
3. The synthesis agent identifying contradictions and gaps across agent outputs

**No credibility scoring, no triangulation phase, no anti-hallucination protocol, no validation scripts.**

### Key Difference

199bio has a dramatically more rigorous verification system: numerical credibility scores, mandatory triangulation, persona-based red teaming, anti-hallucination protocols, and automated Python validation scripts. Altmbr relies entirely on prompt-level instructions and the synthesis agent for quality control. This is the single largest gap between the two systems.

---

## 6. Citation Handling

### 199bio: Numbered References with Full Bibliography

**Format:** Bracketed numbers `[1]`, `[2]`, etc. inline with claims.

**Bibliography requirements (described as "ZERO TOLERANCE"):**
> "Include EVERY citation [N] used in report body
> Format: [N] Author/Org (Year). 'Title'. Publication. URL (Retrieved: Date)
> Each entry on its own line, complete"

Explicitly forbidden:
> "Placeholders: '[8-75] Additional citations', '...continue...', 'etc.'
> Ranges: '[3-50]' instead of individual entries
> Truncation: Stop at 10 when 30 cited"

**Citation persistence:** Citations tracked in `sources.json` on disk, surviving context window compaction and continuation agents.

**Automated citation verification** via `verify_citations.py` (DOI resolution, title/year matching, fabrication detection).

### altmbr: Inline URL Citations

**Format:** Markdown links inline with facts: `[Source Name](https://url.com)`

> "Every number needs a source. Every source needs a clickable URL inline.
> Do NOT collect sources at the end -- put them inline with the facts."

No bibliography section. No citation numbering system. No automated verification.

### Key Difference

199bio produces formal academic-style numbered bibliographies with DOI verification. Altmbr uses inline hyperlinks only -- simpler and more web-native, but lacks the rigor of a verified bibliography. For academic or enterprise use cases, 199bio's approach is significantly stronger. For quick research summaries, altmbr's inline links are more practical.

---

## 7. Output Format

### 199bio: Triple-Format Professional Reports

**Required sections:**
- Executive Summary (200-400 words)
- Introduction (scope, methodology, assumptions)
- Main Analysis (4-8 findings, 600-2,000 words each)
- Synthesis & Insights
- Limitations & Caveats
- Recommendations
- Bibliography (complete, no placeholders)
- Methodology Appendix

**Output formats:**
- Markdown (primary source of truth)
- HTML (McKinsey-style design: navy/gray, sharp corners, 14px base, metrics dashboard)
- PDF (via WeasyPrint, professional print layout)

**Output location:** `~/Documents/[Topic]_Research_[YYYYMMDD]/`

**Length targets by mode:**
| Mode | Target Words |
|------|-------------|
| Quick | 2,000-4,000 |
| Standard | 4,000-8,000 |
| Deep | 8,000-15,000 |
| UltraDeep | 15,000-20,000+ |

Reports >18K words auto-continue via recursive agent spawning with full context preservation (citation state, narrative arc, quality metrics).

### altmbr: Multi-File Markdown

**Per-agent output files** (each a standalone document):
```
research/[topic]/
  agent-1.md
  agent-2.md
  agent-3.md
  synthesis.md
```

**Synthesis document sections:**
- Executive summary (3-5 bullets)
- Key findings organized by theme (not by agent)
- Contradictions or tensions found across agents
- Confidence assessment
- Recommended next steps

**No HTML output. No PDF output. No formal report template.** Output is raw markdown files in the project directory.

### Key Difference

199bio delivers polished, presentation-ready reports in three formats with a McKinsey-style HTML template and professional PDF. Altmbr delivers raw markdown research files. 199bio's output is suitable for sharing with stakeholders directly; altmbr's output is raw research material that would need formatting for external consumption.

However, altmbr's multi-file structure (one per agent) provides natural modularity -- you can read just the regulatory research or just the technical feasibility section independently.

---

## 8. Unique Features

### 199bio Has, altmbr Lacks

1. **Tiered complexity modes** (Quick/Standard/Deep/UltraDeep) -- adjustable depth based on need
2. **Source credibility scoring** (0-100 scale via `source_evaluator.py`)
3. **Triangulation phase** -- dedicated cross-reference verification of claims across 3+ sources
4. **Outline Refinement phase (4.5)** -- dynamically adapts the report structure based on evidence found, not locked into initial plan
5. **Critique phase with persona-based red teaming** -- Skeptical Practitioner, Adversarial Reviewer, Implementation Engineer
6. **Critical gap loop-back** -- Phase 6 can send research back to Phase 3 for targeted "delta-queries"
7. **Anti-hallucination protocol** -- explicit rules for distinguishing facts from synthesis, labeling speculation
8. **Automated validation scripts** -- 9-check structure validator + DOI/URL citation verifier
9. **HTML report generation** -- McKinsey-style template with citation tooltips and metrics dashboard
10. **PDF generation** -- via WeasyPrint with print-optimized CSS
11. **Auto-continuation protocol** -- recursive agent spawning for reports >18K words with full state preservation
12. **Disk-persisted citation tracking** (`sources.json`) surviving context compaction
13. **First Finish Search (FFS) pattern** -- adaptive quality thresholds so retrieval doesn't block on slow sources
14. **Multi-provider search support** -- WebSearch + Exa MCP + custom search-cli (Brave, Serper, Exa, Jina, Firecrawl)
15. **Graph-of-Thoughts reasoning** -- branching into multiple reasoning paths, merging insights
16. **Progressive file assembly** -- section-by-section generation to handle output token limits
17. **Writing standards** with precision examples (e.g., "reduced mortality 23% (p<0.01)" not "significantly improved outcomes")
18. **Anti-fatigue protocol** -- per-section quality checklist preventing late-report quality degradation

### altmbr Has, 199bio Lacks

1. **True multi-agent architecture** -- 2-4 independent research agents working in parallel on different domains, not just parallel searches within one agent
2. **Stuck agent detection and recovery** -- automated monitoring at escalating intervals (30s, 2min, 5min), automatic kill and relaunch with data pre-loading
3. **Strict write protocol** -- the `Search -> Edit -> Search -> Edit` mandate with explicit threat of termination, preventing research loops. This is the most battle-tested part of the skill:
   > "YOU WILL BE STOPPED AND RELAUNCHED IF YOU VIOLATE THIS PROTOCOL. The ONLY acceptable pattern is: Search -> Edit -> Search -> Edit -> Search -> Edit. NEVER: Search -> Search. NO EXCEPTIONS. NOT EVEN ONCE."
4. **Skeleton file pre-creation** -- output files with section headers created before agents launch, enabling trivial progress monitoring via `wc -l`
5. **User approval gate** -- plan presented and approved before any agents launch
6. **403 error handling** -- explicit protocol for agents hitting paywalled sites:
   > "If a web fetch returns a 403 error, do NOT try multiple alternative URLs before writing. Write what you have so far, THEN try another URL, THEN write again."
7. **Agent progress reporting format** -- concise standardized check-in format
8. **Zero dependencies** -- no Python scripts, no brew packages, no MCP servers. Just Claude Code.
9. **Cross-agent contradiction detection** -- synthesis agent specifically identifies tensions between agent findings

---

## 9. Weaknesses and Gaps

### 199bio Weaknesses

1. **Complex setup** -- requires cloning to `~/.claude/skills/deep-research/`, optional brew install of search-cli, optional MCP configuration for Exa. Higher barrier to entry.
2. **Single-agent bottleneck** -- despite parallel searches in RETRIEVE, one agent still does all synthesis, triangulation, critique, and report writing. This limits throughput on large topics.
3. **No stuck agent recovery** -- if the main agent gets confused or stuck, there is no automated recovery mechanism. The skill assumes the single agent will complete.
4. **No user approval gate before execution** -- the Autonomy Principle states "Operate independently. Infer assumptions from context. Only stop for critical errors or incomprehensible queries." This could lead to wasted compute on misunderstood questions.
5. **Python dependency risk** -- validation scripts require Python + dependencies (`requests`, `beautifulsoup4`, etc.). If the environment lacks these, validation silently degrades.
6. **Over-engineering risk** -- the system has 7 reference docs, 7 scripts, 2 templates. This is a lot of surface area for prompt-level bugs and inconsistencies between files.
7. **No explicit 403/blocked-site handling** -- no protocol for what to do when sites block scraping, unlike altmbr's explicit instructions.
8. **Context window pressure** -- loading methodology.md (416 lines) + quality-gates.md (190 lines) + report-assembly.md (115 lines) consumes significant context before research even begins.

### altmbr Weaknesses

1. **No source quality verification** -- no credibility scoring, no triangulation, no automated validation. Quality depends entirely on the LLM following prompt instructions.
2. **No formal output formatting** -- raw markdown only. No HTML, no PDF, no templates. Not suitable for direct stakeholder delivery.
3. **No anti-hallucination safeguards** -- beyond "every number needs a source," there is no systematic approach to preventing fabricated claims or citations.
4. **No citation verification** -- inline URLs are not checked for validity. No DOI resolution, no title matching.
5. **No tiered complexity** -- every research task gets the same treatment regardless of complexity. A simple comparison gets the same multi-agent decomposition as a comprehensive market analysis.
6. **No outline adaptation** -- agents work through pre-defined sections in order. If evidence reveals a more important angle, there is no mechanism to restructure.
7. **No critique or red-teaming** -- no adversarial review of findings before delivery.
8. **No writing quality standards** -- no anti-fatigue protocol, no prose-vs-bullet requirements, no precision examples. Output quality varies by agent.
9. **Cross-agent duplication risk** -- despite "non-overlapping scope" instructions, independent agents may cover the same ground, wasting tokens and producing redundant findings.
10. **Synthesis quality ceiling** -- the synthesis agent must read and integrate multiple large files. With 3 agents producing ~1000 lines each, the synthesis agent faces significant context pressure.
11. **No continuation protocol** -- no mechanism for handling research that exceeds output limits.

---

## 10. Summary Verdict

| Dimension | Winner | Why |
|-----------|--------|-----|
| **Ease of setup** | altmbr | Single file copy, zero dependencies |
| **Research speed** | altmbr | True parallel agents produce more content faster |
| **Source rigor** | 199bio | Credibility scoring, triangulation, automated verification |
| **Citation quality** | 199bio | Numbered refs, full bibliography, DOI verification |
| **Output polish** | 199bio | McKinsey HTML + PDF with templates and validation |
| **Reliability** | altmbr | Stuck agent recovery, write protocol, 403 handling |
| **Scalability** | 199bio | Auto-continuation for 20K+ word reports |
| **Adaptability** | 199bio | 4 complexity modes, outline refinement based on evidence |
| **Simplicity** | altmbr | 228 lines, no moving parts |
| **Enterprise readiness** | 199bio | Validation scripts, professional formatting, methodology appendix |

**Bottom line:**

- **199bio** is an enterprise research engine. It produces polished, validated, publication-ready reports with formal bibliographies and multi-format output. Best for: critical decisions, stakeholder-facing research, academic-quality analysis. Weakness: complexity and single-agent bottleneck.

- **altmbr** is a fast parallel research orchestrator. It produces raw but deeply sourced research quickly by distributing work across multiple agents with robust monitoring. Best for: rapid research, exploratory analysis, first-pass investigation. Weakness: no quality verification beyond prompt instructions.

The two skills solve different problems. 199bio answers "How do I produce a rigorous, verified research report?" Altmbr answers "How do I research a broad topic quickly using parallel agents?" An ideal system would combine altmbr's multi-agent orchestration and stuck-agent recovery with 199bio's verification pipeline and output formatting.
