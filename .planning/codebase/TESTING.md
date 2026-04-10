# Testing Patterns

**Analysis Date:** 2026-04-10

## Test Framework

**Runner:**
- None. No automated test runner is configured.
- No `pytest.ini`, `setup.cfg`, `pyproject.toml`, or `tox.ini` present.
- No `pytest`, `unittest`, or `nose` test files found anywhere in the repo.

**Testing is entirely manual and integration-based.** See "Manual Test Runs" section below.

**Run Commands:**
```bash
# Validate a report (structural + quality checks)
python skill/scripts/validate_report.py --report [path/to/report.md]

# Verify citations in a report (DOI + URL checks)
python skill/scripts/verify_citations.py --report [path/to/report.md]

# Verify HTML output matches its markdown source
python skill/scripts/verify_html.py --html [path.html] --md [path.md]

# Run both validators in sequence (required before any report delivery)
python skill/scripts/validate_report.py --report [path] && python skill/scripts/verify_citations.py --report [path]

# Full integration test: invoke the skill end-to-end
# (requires Claude Code session with the skill loaded)
```

## Test File Organization

**Location:**
- Fixtures: `tests/fixtures/` (2 files currently)
- No co-located test files alongside source scripts in `skill/scripts/`
- No `tests/test_*.py` files — fixtures are standalone markdown documents used for manual invocation of validators

**Naming:**
- `valid_report.md` — a complete, passing report that satisfies all validator checks
- `invalid_report.md` — a deliberately broken report that triggers validator errors

**Structure:**
```
tests/
└── fixtures/
    ├── valid_report.md     # Complete 10-section report with 10 citations
    └── invalid_report.md   # Truncated 4-section report with placeholder text and bad citation [99]
```

## Validation Script Behavior (Primary Test Mechanism)

The Python scripts in `skill/scripts/` function as self-contained validators that are run against real report output. They are both the test tooling and the production quality gate.

**`validate_report.py` — 9 structural checks:**
```
ReportValidator.validate() runs checks in order:
  1. Executive Summary — exists and ≥50 words (warning if >400)
  2. Required Sections — 8 mandatory headings present
  3. Citations — [N] format exists, ≥10 unique (warning if fewer)
  4. Bibliography — complete, no truncation placeholders, consecutive numbering
  5. Placeholder Text — no TBD, TODO, FIXME, [citation needed]
  6. Content Truncation — no "Due to length", "[Sections X-Y]" patterns
  7. Word Count — warning if <500
  8. Source Count — warning if bibliography has <10 entries
  9. Broken Links — internal relative links resolve on disk
```

**`verify_citations.py` — 4-step per-citation verification:**
```
CitationVerifier.verify_entry() for each bibliography entry:
  1. Hallucination pattern detection (regex on title)
  2. DOI resolution via doi.org content negotiation API
  3. URL HEAD request accessibility check
  4. Fallback: "no DOI or URL — cannot verify" → suspicious
```

**`verify_html.py` — 6 cross-checks between .md and .html:**
```
HTMLVerifier.verify() checks:
  1. All markdown ## sections present in HTML as <h2> tags
  2. No unreplaced template placeholders ({{TITLE}}, etc.)
  3. No emojis in output HTML
  4. Required HTML structural elements present
  5. Citation count in HTML body vs. markdown
  6. Bibliography section present and formatted with .bib-entry divs
```

## Manual Test Runs (Primary Test Strategy)

Full end-to-end skill validation is done by invoking the deep-research skill and observing output. All runs are logged in `notes/test-run-log.md`.

**Canonical test topic:** "How can the current state of the skill be improved?" — doubles as a real research query and a regression test.

**Test run output location:** `notes/test-runs/v{N}-<short-name>/`

**Required output artifacts per run:**
- `scope.md` — Phase 1 SCOPE output
- `plan.md` — Phase 2 PLAN output
- `research_agent_1.md` ... `research_agent_N.md` — Phase 3 RETRIEVE sub-agent outputs
- `research_notes_main.md` — main session notes
- `_checkpoint.json` — pipeline state checkpoint
- `research_report.md` — final report (when run reaches Phase 8 PACKAGE)

**Test run log schema** (`notes/test-run-log.md`):
```
Version | UUID8 | Date | Skill commit | Mode | Lead model | Sub-agent model |
Topic | Start | End | Duration | Sources | Claims verified | Loop-backs |
Step 6 | Words | Status | Output dir | Notes
```

**Status values:** `complete`, `partial`, `killed`, `failed`

**Modes tested:**
- `quick` — 3 phases (SCOPE → RETRIEVE → PACKAGE), 2-5 min
- `standard` — 7 phases, 5-10 min
- `deep` — 10 phases (full pipeline), 10-20 min (primary regression mode)
- `ultradeep` — 10 phases + extended iterations, 20-45 min

## Fixtures

**`tests/fixtures/valid_report.md`** — a minimal but complete 10-source research report that passes all validator checks:
- 8 required sections present (Executive Summary through Appendix: Methodology)
- 10 bibliography entries [1]-[10] with URLs
- All in-text citations [1]-[10] matched to bibliography
- No placeholder text
- Word count above 500

**`tests/fixtures/invalid_report.md`** — a report designed to trigger validation failures:
- Missing sections: Synthesis, Limitations, Recommendations, Bibliography, Methodology
- Contains placeholder text: `TBD`, `TODO`
- Citation [99] in body with no matching bibliography
- No bibliography section at all

**Usage:**
```bash
# Should PASS
python skill/scripts/validate_report.py --report tests/fixtures/valid_report.md

# Should FAIL
python skill/scripts/validate_report.py --report tests/fixtures/invalid_report.md
```

## Mocking

**Framework:** None — no mocking library used.

**Network behavior in tests:**
- `verify_citations.py` makes real HTTP requests to `doi.org` and report URLs when run manually
- `valid_report.md` fixture uses `https://example.com/paper1` through `example.com/paper10` as bibliography URLs — these will fail URL accessibility checks (404) but not crash the script
- Strict mode (`--strict`) is NOT recommended for fixture testing since example.com URLs will return failures

**What to mock (if unit tests are added):**
- `urllib.request.urlopen` calls in `verify_citations.py` — to avoid network dependency
- `datetime.now()` in `citation_manager.py` — the `retrieved_date` default uses live clock
- Filesystem reads in `_read_report()` / `_read_files()` — to test error paths

## Coverage

**Requirements:** None enforced.

**Current state:** No coverage tooling configured. Scripts have no automated tests.

**Implicit coverage via fixtures:**
- `valid_report.md` exercises all "happy path" checks in `validate_report.py`
- `invalid_report.md` exercises several (not all) error paths: missing sections, placeholder text, bad citation numbers
- No fixture exercises `verify_html.py` or `source_evaluator.py`

## Validation Loop Protocol (from `skill/reference/quality-gates.md`)

The skill documentation mandates a two-script validation loop after every report generation:

```bash
# Step 1
python skill/scripts/validate_report.py --report [path]
# Step 2
python skill/scripts/verify_citations.py --report [path]
# If EITHER fails: fix issues, re-run BOTH
# Maximum 3 retry cycles before escalating to user
```

This loop is the only automated QA gate on report output. Both scripts must pass before report delivery.

## Adding New Tests

**To add a fixture:**
- Place `.md` files in `tests/fixtures/`
- Name them descriptively: `valid_<scenario>.md`, `invalid_<scenario>.md`

**To add a validator unit test (if runner is introduced):**
- The natural choice is `pytest` given the existing Python class structure
- Each `_check_*` method on `ReportValidator` maps to one test case
- Suggested location: `tests/test_validate_report.py`, `tests/test_verify_citations.py`
- No shared conftest needed; fixtures are standalone `.md` files

**Test run (if pytest added):**
```bash
pip install pytest
pytest tests/
```

---

*Testing analysis: 2026-04-10*
