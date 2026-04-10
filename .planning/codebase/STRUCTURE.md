# Codebase Structure

**Analysis Date:** 2026-04-10

## Directory Layout

```
deep-research-skill/           # Repo root
├── skill/                     # The deployable skill (single source of truth)
│   ├── SKILL.md               # Pipeline entry point and Background Mode orchestration
│   ├── reference/             # Phase methodology and reference docs loaded on demand
│   │   ├── methodology.md     # 10-phase pipeline instructions (largest file, ~750 lines)
│   │   ├── report-assembly.md # Progressive section generation protocol
│   │   ├── quality-gates.md   # Validation rules, anti-hallucination, writing standards
│   │   ├── html-generation.md # McKinsey HTML report generation steps
│   │   ├── continuation.md    # Auto-continuation for reports > 18K words
│   │   └── weasyprint_guidelines.md  # PDF generation CSS rules
│   ├── templates/             # Output scaffolding loaded during Phase 8 PACKAGE
│   │   ├── report_template.md # Markdown report structure with inline instructions
│   │   └── mckinsey_report_template.html  # HTML report template with CSS
│   ├── scripts/               # Python post-processing and validation utilities
│   │   ├── validate_report.py # 9-check structural quality validator
│   │   ├── verify_citations.py # DOI/URL citation verifier (no API key required)
│   │   ├── source_evaluator.py # 0-100 credibility scorer with domain tiers
│   │   ├── citation_manager.py # Citation tracking utilities
│   │   ├── research_engine.py  # ResearchPhase/ResearchMode/ResearchState dataclasses
│   │   ├── md_to_html.py      # Markdown → HTML converter for report template
│   │   └── verify_html.py     # HTML output verifier
│   └── requirements.txt       # Python deps for scripts/
├── tools/                     # Repo-level developer scripts (not deployed)
│   └── deploy-to-live.sh      # rsync skill/ → ~/.claude/skills/deep-research/
├── notes/                     # Development history (not deployed)
│   ├── adr/                   # Architecture Decision Records
│   │   └── 001-task-tool-vs-claude-p-subagents.md
│   ├── benchmarks/            # A/B test results and model comparisons
│   │   └── model-ab-test/
│   ├── research/              # Research runs used to improve the skill itself
│   │   ├── paper-2603-28376-analysis/
│   │   ├── self-improvement-research/
│   │   └── skill-vs-framework/
│   └── test-runs/             # Test run outputs (v2 through v15+)
│       ├── test-run-log.md    # Master log of all test runs with metadata
│       └── v{N}-<short-name>/ # Per-run output directories
├── tests/
│   └── fixtures/              # Standalone report fixtures for script testing (no runner)
├── CLAUDE.md                  # Project-level dev rules and known gotchas
├── README.md                  # Project overview
└── .gitignore                 # Excludes .remember/, .playwright-mcp/, __pycache__
```

## Directory Purposes

**`skill/` — Deployable Skill:**
- Purpose: Everything that gets rsynced to `~/.claude/skills/deep-research/` via `tools/deploy-to-live.sh`
- Contains: All runtime files the pipeline agent needs: SKILL.md, reference docs, templates, Python scripts
- Key constraint: `SKILL.md` uses relative paths (`./reference/`, `./templates/`, `scripts/`) that must resolve from its own location. Never separate `SKILL.md` from its sibling directories.
- Key files: `skill/SKILL.md` (pipeline entry point and Background Mode spec)

**`skill/reference/` — On-Demand Methodology Docs:**
- Purpose: Loaded selectively during pipeline execution per SKILL.md's execution table; not all loaded at once
- Load order per SKILL.md:
  - Phases 1-7: `methodology.md`
  - Phase 8 PACKAGE: `report-assembly.md`
  - HTML/PDF output: `html-generation.md`
  - Quality checks: `quality-gates.md`
  - Long reports (>18K words): `continuation.md`
- Key files: `skill/reference/methodology.md` (primary phase instructions, ~750 lines)

**`skill/templates/` — Output Scaffolding:**
- Purpose: Structural templates loaded during Phase 8 report generation
- Key files: `skill/templates/report_template.md` (section-by-section template with inline writing instructions), `skill/templates/mckinsey_report_template.html` (HTML report template with placeholder variables `{{TITLE}}`, `{{CONTENT}}`, `{{BIBLIOGRAPHY}}`)

**`skill/scripts/` — Python Validators:**
- Purpose: Run after report generation to catch structural errors and citation problems
- Key pattern: Called via Bash from within the pipeline (e.g., `python scripts/validate_report.py --report [path]`)
- Key files: `skill/scripts/validate_report.py`, `skill/scripts/verify_citations.py`

**`tools/` — Deploy Tooling:**
- Purpose: Developer-only scripts; never deployed to the live skill
- Key file: `tools/deploy-to-live.sh` — run this whenever shipping changes from repo to local Claude Code install

**`notes/` — Development History:**
- Purpose: ADRs, benchmark results, test run outputs; reference for understanding why decisions were made
- Key file: `notes/test-run-log.md` — master log with columns: Version, UUID8, Date, Skill commit, Mode, Lead model, Sub-agent model, Topic, Start, End, Duration, Sources, Claims verified, Loop-backs, Step 6, Words, Status, Output dir, Notes
- Naming: test run dirs use `v{N}-<short-name>/` pattern where N is monotonically increasing

## Key File Locations

**Entry Points:**
- `skill/SKILL.md`: Primary pipeline controller; defines modes, Background Mode orchestration, spawn command

**Phase Methodology:**
- `skill/reference/methodology.md`: All 10 phases with detailed instructions, Think2 metacognitive protocol, sub-agent prompts

**Output Quality:**
- `skill/reference/quality-gates.md`: Writing standards, anti-hallucination protocol, bibliography requirements, validation loop

**Report Generation:**
- `skill/reference/report-assembly.md`: Progressive section generation protocol, word count limits per Edit call
- `skill/templates/report_template.md`: Section-by-section Markdown scaffold with inline writing guidance

**Validation Scripts:**
- `skill/scripts/validate_report.py`: Runs 9 structural checks; invoked as `python scripts/validate_report.py --report [path]`
- `skill/scripts/verify_citations.py`: DOI resolution + hallucination pattern detection; invoked as `python scripts/verify_citations.py --report [path]`

**Deploy:**
- `tools/deploy-to-live.sh`: `./tools/deploy-to-live.sh` (normal) or `./tools/deploy-to-live.sh --dry-run` (preview)

**ADRs:**
- `notes/adr/001-task-tool-vs-claude-p-subagents.md`: Decision on Task tool vs `claude -p` subprocess sub-agents (updated 2026-04-07 after v15 hang failure; recommends switch to subprocess architecture)

**Test Run Log:**
- `notes/test-run-log.md`: Every test run row; consult before adding a new run to follow the logging convention

## Naming Conventions

**Files:**
- Methodology docs: `kebab-case.md` (e.g., `report-assembly.md`, `quality-gates.md`)
- Python scripts: `snake_case.py` (e.g., `validate_report.py`, `source_evaluator.py`)
- HTML templates: `snake_case.html` (e.g., `mckinsey_report_template.html`)
- ADRs: `NNN-kebab-description.md` (e.g., `001-task-tool-vs-claude-p-subagents.md`)
- Test run dirs: `v{N}-<short-name>/` (e.g., `v15-effort-fix-test/`)
- Research output dirs (at runtime, outside repo): `[TopicName]_[YYYYMMDD]_[UUID8]/` (e.g., `Cat_Genomes_20260323_a7f3b2c1/`)

**Directories:**
- All lowercase with hyphens for multi-word names in `notes/` (e.g., `self-improvement-research/`)
- Simple lowercase in `skill/` (e.g., `reference/`, `templates/`, `scripts/`)

## Where to Add New Code

**New pipeline phase or sub-phase:**
- Add phase instructions to `skill/reference/methodology.md`
- Add the phase to the workflow table in `skill/SKILL.md`
- If the phase needs a new reference doc: create `skill/reference/[phase-name].md` and add a load instruction to SKILL.md's "On invocation" section

**New output format (beyond Markdown/HTML/PDF):**
- Create `skill/reference/[format]-generation.md` following the pattern of `skill/reference/html-generation.md`
- Add the load instruction to `skill/SKILL.md`

**New validation check:**
- Add to `skill/scripts/validate_report.py` (structural/content checks) or `skill/scripts/verify_citations.py` (citation checks)
- Add the corresponding rule to `skill/reference/quality-gates.md` so the LLM knows what to fix

**New Python utility:**
- Add to `skill/scripts/` with `snake_case.py` naming
- Document the invocation command in whichever reference file instructs its use

**New section in output report template:**
- Edit `skill/templates/report_template.md`
- Update `skill/scripts/validate_report.py`'s `required` section list if the new section is mandatory
- Update `skill/reference/report-assembly.md`'s "Section sequence" if the generation order changes

**Architecture Decision Record:**
- Create `notes/adr/NNN-kebab-description.md` (increment N)
- No other registration needed; ADRs are navigated manually

**Test run:**
- Create output dir in `notes/test-runs/v{N}-<short-name>/`
- Add a row to `notes/test-run-log.md` with all required columns (see file for column spec)

**Dev tooling:**
- Add to `tools/`; these are never deployed and never imported by `skill/`

## Special Directories

**`.planning/` (this directory):**
- Purpose: GSD planning artifacts (codebase maps, phase plans)
- Generated: By GSD commands
- Committed: Yes (planning artifacts are versioned)

**`.remember/`:**
- Purpose: Private session notes and autonomous logs from Claude Code
- Generated: Yes (auto-generated by Claude Code sessions)
- Committed: No (gitignored — may contain private session notes)

**`notes/test-runs/`:**
- Purpose: Actual research pipeline output from test runs; may contain large Markdown/HTML/PDF reports
- Generated: Yes (by test run invocations)
- Committed: Yes (test run outputs are part of the development history per CLAUDE.md)

---

*Structure analysis: 2026-04-10*
