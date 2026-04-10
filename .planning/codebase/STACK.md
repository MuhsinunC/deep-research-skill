# Technology Stack

**Analysis Date:** 2026-04-10

## Languages

**Primary:**
- Python 3.9+ - All validation and conversion scripts in `skill/scripts/`
- Markdown - All methodology documentation, skill definition, templates, report outputs

**Secondary:**
- Bash/Shell - Deployment tooling in `tools/deploy-to-live.sh`
- HTML/CSS - Report template in `skill/templates/mckinsey_report_template.html`

## Runtime

**Environment:**
- Python 3.14.3 (verified on dev machine; skill requires 3.9+ minimum per `skill/requirements.txt`)
- macOS (primary dev platform; `open` command used in HTML/PDF generation steps assumes macOS)
- No virtual environment — all scripts use stdlib only; no `pip install` needed for core functionality

**Package Manager:**
- Homebrew — used for optional tool installs (`search-cli`, `weasyprint`)
- No `pyproject.toml`, `setup.py`, or `requirements.txt` with pip-managed packages (the `skill/requirements.txt` is a comments-only documentation file, not an installable manifest)

**Claude Code Runtime:**
- Claude Code 2.1.100 (CLI) — the host platform; scripts are called by Claude Code, not run standalone
- Spawned subprocesses use `claude -p` (headless, non-interactive) with `--dangerously-skip-permissions`
- Skill loads from `~/.claude/skills/deep-research/` at invocation time

## Frameworks

**Core:**
- No frameworks — `skill/scripts/` uses Python standard library only: `argparse`, `re`, `json`, `sys`, `pathlib`, `urllib`, `dataclasses`, `hashlib`, `time`, `datetime`, `enum`

**Testing:**
- No automated test runner — `tests/fixtures/` contains report fixtures for manual validation script testing

**Build/Dev:**
- rsync — deployment mechanism in `tools/deploy-to-live.sh` (syncs `skill/` → `~/.claude/skills/deep-research/`)

## Key Dependencies

**Critical (stdlib — always available):**
- `urllib.request` — HTTP HEAD/GET requests for DOI resolution and URL verification in `skill/scripts/verify_citations.py`
- `pathlib.Path` — file I/O throughout all scripts
- `json` — checkpoint state serialization in `skill/scripts/research_engine.py` and `~/.claude/research-tasks.json` task registry

**Optional (must be installed separately):**
- `weasyprint` — PDF generation from HTML (`pip install weasyprint`); invoked via CLI as `weasyprint [html] [pdf]` in Phase 8 per `skill/reference/html-generation.md`. Verified installed at `/opt/homebrew/bin/weasyprint`.
- `search-cli` — multi-provider search aggregation (Brave, Serper, Exa, Jina, Firecrawl); install via `brew tap 199-biotechnologies/tap && brew install search-cli`. NOT currently installed.
- `requests` 2.32.5 — present in environment but not used by any skill script directly; likely a transitive dependency of weasyprint

## Configuration

**Environment Variables:**
- `CLAUDE_CODE_EFFORT_LEVEL=max` — set in user's `~/.zshrc`; must be prepended inline on `claude -p` spawn commands because `zsh -c` (non-interactive) does not source `~/.zshrc`
- No `.env` files; no application-level secrets configuration

**Skill Configuration:**
- `skill/SKILL.md` frontmatter: `effort: max` — instructs the parent Claude Code session to run at max effort
- `~/.claude/research-tasks.json` — task registry JSON file written at research start, updated at completion
- `~/.claude/skills/deep-research/` — live deployment target, populated by `tools/deploy-to-live.sh`
- `.claude/settings.local.json` — Claude Code permission allowlist for specific bash commands (shell safety gates)

**Build:**
- No build step; deployment is a direct rsync copy
- `tools/deploy-to-live.sh` excludes `.git`, `.gitignore`, `__pycache__`, `*.pyc` from the rsync

## Platform Requirements

**Development:**
- macOS (darwin) with Homebrew
- Python 3.9+
- Claude Code CLI (for running research sessions)
- Optional: `weasyprint` for PDF output, `search-cli` for multi-provider search

**Production (live deployment):**
- Deployment target: `~/.claude/skills/deep-research/` on the user's local machine
- No server, no container, no cloud deployment
- Skill is invoked locally by Claude Code sessions

---

*Stack analysis: 2026-04-10*
