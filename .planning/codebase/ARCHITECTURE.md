# Architecture

**Analysis Date:** 2026-04-10

## Pattern Overview

**Overall:** Markdown-defined AI pipeline skill — a methodology encoded as structured Markdown documents that drive a Claude Code agent session. Not conventional software architecture; the "code" is primarily LLM instructions, with Python scripts as post-processing validators.

**Key Characteristics:**
- Pipeline orchestration via natural language instructions loaded into an LLM context at runtime
- Two-tier agent execution: a lead Opus 4.6 agent orchestrates multiple Sonnet 4.6 sub-agents via Task tool spawns
- Skill definition lives in `skill/SKILL.md` and its reference files; runtime behavior is shaped entirely by what gets loaded into context
- Output is file-based: reports written incrementally to `~/Documents/Research/[Topic]_[YYYYMMDD]_[UUID8]/` during pipeline execution
- Checkpoint/resume: each phase writes `_checkpoint.json` to the output directory so a crashed pipeline can resume

## Layers

**Skill Definition Layer:**
- Purpose: Defines the entire pipeline in human-readable Markdown instruction documents
- Location: `skill/`
- Contains: `SKILL.md` (entry point), `reference/` (phase-by-phase methodology), `templates/` (output scaffolding)
- Depends on: Nothing at load time; loaded into Claude Code context at invocation
- Used by: The LLM agent that runs the research pipeline

**Pipeline Orchestration Layer (Lead Agent):**
- Purpose: The spawned `claude -p` subprocess that executes the 10-phase research pipeline end-to-end
- Location: Runs at `~/.claude/skills/deep-research/` (deployed copy of `skill/`)
- Contains: Phase execution logic defined in `skill/reference/methodology.md`
- Depends on: `SKILL.md` loaded at invocation, `reference/` files loaded on demand per phase
- Used by: The parent Claude Code session that invoked the skill

**Sub-Agent Execution Layer (Retrieval / Verification Agents):**
- Purpose: Parallel focused-task agents spawned from the lead agent via Task tool calls
- Location: Spawned in-process within the lead agent's session (Task tool, synchronous parallel)
- Contains: Heterogeneous lens assignments (academic / practitioner / critical / historical) for Phase 3; citation verifiers and adversarial agent for Phase 7.5
- Depends on: Lead agent's file-based handoff paths; output files at `[OUTPUT_DIR]/research_agent_N.md`
- Used by: Lead agent reads and synthesizes sub-agent output files after all agents complete

**Python Validation Layer:**
- Purpose: Automated post-generation quality checks on produced Markdown/HTML reports
- Location: `skill/scripts/`
- Contains: `validate_report.py`, `verify_citations.py`, `source_evaluator.py`, `citation_manager.py`, `md_to_html.py`, `verify_html.py`
- Depends on: A completed Markdown report file; no external API keys required (uses free DOI resolver and heuristics)
- Used by: Lead agent in Phase 8 PACKAGE after report is written

**Deploy/Dev Tooling Layer:**
- Purpose: Maintain single source of truth between repo and live Claude Code install
- Location: `tools/`
- Contains: `deploy-to-live.sh` — rsync from `skill/` to `~/.claude/skills/deep-research/`
- Depends on: `skill/` directory in repo
- Used by: Developer when shipping a new version to the local Claude Code install

## Data Flow

**Standard Research Run (Deep/UltraDeep mode):**

1. User invokes `/deep-research` or references the skill in a Claude Code session
2. Parent session loads `skill/SKILL.md` as its driving instruction document
3. Parent session prepares a self-contained Research Brief (resolves all conversation context)
4. Parent spawns `claude -p "$(cat research-brief.txt)" --model opus --effort max --dangerously-skip-permissions` as a background Bash process
5. Spawned subprocess loads deep-research skill from `~/.claude/skills/deep-research/`, generates UUID8, creates output directory at `~/Documents/Research/[Topic]_[YYYYMMDD]_[UUID8]/`
6. Subprocess registers task in `~/.claude/research-tasks.json`, writes `_checkpoint.json` at end of each phase
7. Phase 1 SCOPE: Lead agent defines research boundaries, acceptance criteria, saves checkpoint
8. Phase 2 PLAN: Lead agent writes living `plan.md` to output directory with Task Ledger, Verification Log, Decision Log
9. Phase 3 RETRIEVE: Lead agent launches all searches in a single parallel message; simultaneously spawns 3-4 Sonnet sub-agents (academic / practitioner / critical / optional historical lens) each writing to their own `research_agent_N.md` file. Lead blocks until all agents complete (synchronous spawn — no `run_in_background`)
10. Phase 4 TRIANGULATE: Lead agent cross-references all retrieved evidence, resolves contradictions, runs devil's advocate searches
11. Phase 4.5 OUTLINE REFINEMENT: Lead agent adapts outline structure based on actual evidence discovered; fills gaps with targeted searches
12. Phase 5 SYNTHESIZE: Lead agent constructs arguments from verified, triangulated evidence
13. Phase 6 CRITIQUE: Lead agent red-teams the synthesis; spawns 1-2 Sonnet gap-filling sub-agents if critical gaps are found
14. Phase 7 REFINE: Lead agent applies critique fixes, verifies no new inconsistencies introduced
15. Phase 7.5 VERIFY: Lead agent decomposes claims, spawns Sonnet citation verifiers and one adversarial agent; populates Verification Log in `plan.md` with per-claim VERIFIED/QUESTIONABLE/UNVERIFIABLE/CONTRADICTED status
16. Phase 8 PACKAGE: Lead agent generates Markdown report section-by-section using Write/Edit tool calls (progressive assembly — each call ≤ 2,000 words), converts to HTML via `python scripts/md_to_html.py`, generates PDF via WeasyPrint; runs `validate_report.py` and `verify_citations.py` validation loop; auto-opens HTML and PDF
17. Spawned subprocess exits; background subagent in parent session returns; parent reads output files and summarizes to user

**State Management:**
- Per-phase state: `[OUTPUT_DIR]/_checkpoint.json` written at phase end (resume on session interruption)
- Source provenance: `[OUTPUT_DIR]/sources.json` maintained throughout (survives context compaction)
- Task tracking: `[OUTPUT_DIR]/plan.md` — living document with Task Ledger updated as sub-agents complete
- Sub-agent output: `[OUTPUT_DIR]/research_agent_N.md` per sub-agent (file-based handoff)
- Global task registry: `~/.claude/research-tasks.json` — tracks all research tasks with UUID, status, output_dir
- Continuation state: `~/.claude/research_output/continuation_state_[report_id].json` (for reports > 18K words)

## Key Abstractions

**Research Mode:**
- Purpose: Controls which phases execute and quality thresholds
- Modes: `quick` (3 phases, 2-5 min), `standard` (7 phases, 5-10 min), `deep` (10 phases, 10-20 min), `ultradeep` (10 phases, 20-45 min)
- Defined in: `skill/SKILL.md` workflow table

**Phase:**
- Purpose: Discrete, checkpointed unit of pipeline work with explicit Think2 PLAN/MONITOR/EVALUATE metacognitive structure
- Phase names: SCOPE, PLAN, RETRIEVE, TRIANGULATE, OUTLINE REFINEMENT (4.5), SYNTHESIZE, CRITIQUE, REFINE, VERIFY (7.5), PACKAGE
- Defined in: `skill/reference/methodology.md`

**Research Brief:**
- Purpose: Self-contained prompt that captures all conversation context so the spawned subprocess needs no access to the parent chat
- Contains: Fully resolved TOPIC, QUESTIONS, PRIOR CONTEXT, SCOPE, MODE, OUTPUT FORMAT
- Location: Written to `/tmp/research-brief-[UUID8].txt` before spawn

**Source (Credibility Model):**
- Purpose: Scored 0-100 via `skill/scripts/source_evaluator.py`; drives triangulation decisions and single-source flagging
- Temporal decay: domain-specific half-lives (Tech: 90d, Science: 365d, Legal: 5yr) applied during retrieval

**Hybrid Model Architecture:**
- Lead agent: Opus 4.6 at `max` effort for all phases (reasoning-heavy: SCOPE, PLAN, TRIANGULATE, SYNTHESIZE, VERIFY, PACKAGE)
- Sub-agents: Sonnet 4.6 (Task tool with explicit `model: "sonnet"`) for retrieval, gap-filling, citation verification, adversarial refutation
- Cost/speed rationale: Sonnet matches Opus on verification verdicts (4/4 in A/B test) while running 37% faster and 36% fewer tokens

## Entry Points

**Skill Invocation:**
- Location: `skill/SKILL.md`
- Triggers: User references "deep research" in a Claude Code session with the skill installed at `~/.claude/skills/deep-research/`
- Responsibilities: Decision tree (is this worth full pipeline?), mode selection, Research Brief preparation, subprocess spawn

**Subprocess Start:**
- Location: `~/Documents/Research/` (created on first run)
- Triggers: `claude -p` spawn command with Research Brief as prompt
- Responsibilities: Full 10-phase pipeline execution, all output file creation, task registry update

**Continuation Agent:**
- Location: `~/.claude/research_output/continuation_state_[report_id].json`
- Triggers: Report exceeds 18K words; lead agent spawns continuation via Task tool
- Responsibilities: Read continuation state, extend report from where it left off, chain further continuation agents if needed

## Error Handling

**Strategy:** Graceful degradation with explicit documentation of gaps; never silent failures

**Patterns:**
- Sub-agent failure: ONE replacement attempt with different query formulation; if replacement fails, document coverage gap explicitly in Limitations section and continue
- Blocked sites: Tier escalation ladder (WebFetch → Chrome MCP → Playwright); if all fail, document source as unreachable and continue
- Context compaction: Budget-aware emergency synthesis protocol in `skill/reference/methodology.md` (Level 1: skip optional VERIFY steps; Level 2: skip VERIFY entirely; Level 3: checkpoint and exit)
- Validation failure: Maximum 3 retry cycles on `validate_report.py` + `verify_citations.py`; if still failing, stop and report to user
- Sub-agent hang (known ~20% failure rate in Task tool): Currently unmitigated; architecture switch to `claude -p` subprocess sub-agents is planned but not yet implemented (see `notes/adr/001-task-tool-vs-claude-p-subagents.md`)

## Cross-Cutting Concerns

**Progress Reporting:** Every phase outputs a `[Phase NAME]` status line at start; progress metrics mid-phase (e.g., source count, credibility averages)

**Think2 Metacognitive Cycling:** Every phase wraps execution in PLAN→MONITOR→EVALUATE structure to reduce anchoring bias and catch drift; defined in `skill/reference/methodology.md`

**Inline Verification Principle:** Verification happens continuously throughout all phases (not only in the dedicated VERIFY phase); inspired by MiroThinker's 88.2% BrowseComp benchmark design

**Anti-Hallucination:** High-confidence claims treated as highest hallucination risk; calibration inversion principle requires more skepticism for fluent, authoritative-sounding output; enforced via claim screening in SYNTHESIZE and Verification Log in VERIFY

---

*Architecture analysis: 2026-04-10*
