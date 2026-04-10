# Coding Conventions

**Analysis Date:** 2026-04-10

## Naming Patterns

**Files:**
- Python scripts: `snake_case.py` (e.g., `validate_report.py`, `verify_citations.py`, `source_evaluator.py`)
- Shell scripts: `kebab-case.sh` (e.g., `deploy-to-live.sh`)
- Markdown docs: `kebab-case.md` (e.g., `quality-gates.md`, `html-generation.md`)
- Test fixtures: `snake_case.md` (e.g., `valid_report.md`, `invalid_report.md`)

**Classes:**
- PascalCase throughout: `ReportValidator`, `CitationManager`, `SourceEvaluator`, `ResearchEngine`, `CitationVerifier`, `HTMLVerifier`
- Class names describe the agent/role, not the action: `Validator` not `Validate`

**Functions/Methods:**
- `snake_case` throughout
- Private methods prefixed with `_`: `_read_report()`, `_check_citations()`, `_evaluate_domain_authority()`
- Public methods describe the primary action: `validate()`, `verify()`, `evaluate_source()`
- `get_` prefix for accessors that compute/retrieve a value: `get_citation_number()`, `get_inline_citation()`, `get_phase_instructions()`
- `generate_` prefix for output-producing methods: `generate_bibliography()`, `generate_recommendation()`
- Check methods that return bool prefixed with `_check_`: `_check_citations()`, `_check_bibliography()`, `_check_placeholders()`

**Variables:**
- `snake_case` throughout
- Instance collections use plural: `self.errors`, `self.warnings`, `self.citations`
- Typed lists declared at `__init__` with explicit type hints: `self.errors: List[str] = []`
- Constants (class-level sets/dicts): `SCREAMING_SNAKE_CASE` — `HIGH_AUTHORITY_DOMAINS`, `MODERATE_AUTHORITY_DOMAINS`, `LOW_AUTHORITY_INDICATORS`
- Enum members: `SCREAMING_SNAKE_CASE` — `ResearchPhase.SCOPE`, `ResearchMode.QUICK`

**Types:**
- `PascalCase` for dataclasses: `Citation`, `CredibilityScore`, `Source`, `ResearchState`
- `PascalCase` for enums: `ResearchPhase`, `ResearchMode`
- Type aliases are not used; stdlib `typing` imports are used directly

## Code Style

**Formatting:**
- No formatter config file present (no `.ruff.toml`, `.black`, `.flake8`)
- 4-space indentation throughout
- Lines do not exceed ~100 characters (observed max: ~100)
- One blank line between methods within a class
- Two blank lines between top-level definitions
- No trailing whitespace observed

**Linting:**
- No linting config present (no `pyproject.toml`, `setup.cfg`, `.flake8`)
- Code follows PEP 8 conventions by convention, not enforcement
- Type hints used consistently in function signatures but not enforced by mypy

**Type Annotations:**
- All public method signatures annotate parameters and return types:
  ```python
  def evaluate_source(self, url: str, title: str, content: Optional[str] = None, ...) -> CredibilityScore:
  def verify_doi(self, doi: str) -> Tuple[bool, Dict]:
  def get_statistics(self) -> Dict[str, any]:
  ```
- `Optional[X]` used for nullable parameters; default `None` provided
- Return type `bool` used consistently on validation check methods

## Import Organization

**Order (observed pattern):**
1. Standard library imports
2. (No third-party imports — all scripts use stdlib only; see `requirements.txt`)
3. No internal imports across scripts (scripts are standalone)

**Example from `verify_citations.py`:**
```python
import sys
import argparse
import re
from pathlib import Path
from typing import List, Dict, Tuple
from urllib import request, error
from urllib.parse import quote
import json
import time
from datetime import datetime
```

Note: Ordering is not strictly alphabetical; `from X import Y` style used for specific names, `import X` for modules used by attribute access.

**Path Aliases:**
- None. Scripts use `pathlib.Path` for all filesystem operations; no `sys.path` manipulation.

## Error Handling

**Patterns:**

File I/O operations catch broad `Exception` and call `sys.exit(1)`:
```python
def _read_report(self) -> str:
    try:
        with open(self.report_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"ERROR: Cannot read report: {e}")
        sys.exit(1)
```

Network operations catch specific HTTP errors before the broad exception:
```python
except error.HTTPError as e:
    if e.code == 404:
        return False, {'error': 'DOI not found (404)'}
    return False, {'error': f'HTTP {e.code}'}
except Exception as e:
    return False, {'error': str(e)}
```

Retry logic uses manual loop with exponential backoff (not `tenacity` or similar):
```python
max_retries = 3
for attempt in range(max_retries):
    try:
        ...
        return  # Success
    except (IOError, OSError) as e:
        if attempt == max_retries - 1:
            raise IOError(f"Failed to save state after {max_retries} attempts: {e}")
        wait_time = (attempt + 1) * 0.5
        time.sleep(wait_time)
```

Date parsing failures silently return a neutral fallback value rather than propagating:
```python
except Exception:
    return 50.0
```

**Validation errors accumulate** into `self.errors` / `self.warnings` lists rather than raising immediately. Final `len(self.errors) == 0` determines exit code.

## Logging

**Framework:** `print()` only — no logging framework

**Pattern:**
- Emoji prefixes signal severity in terminal output: `✅`, `❌`, `⚠️`, `⏳`
- Section headers use `=` separator lines of fixed width: `{'='*60}`
- Progress lines use `end=" "` to allow same-line pass/fail appending:
  ```python
  print(f"Checking: {check_name}...", end=" ")
  # ... then:
  print("PASS")  # or print("FAIL")
  ```
- Errors printed to stdout (not stderr), exit code signals failure

## Comments

**Module docstrings:**
Every script has a triple-quoted module docstring immediately after the shebang, describing purpose and usage. Example:
```python
#!/usr/bin/env python3
"""
Citation Verification Script

Catches fabricated citations by checking:
1. DOI resolution (via doi.org)
...

Usage:
    python verify_citations.py --report [path]
    python verify_citations.py --report [path] --strict
"""
```

**Inline comments:**
- Used for non-obvious logic, particularly regex patterns and heuristic thresholds
- Year-tagged enhancement comments mark when a feature was added: `# 2025 CiteGuard enhancement`, `# 2025 Progressive Assembly enhancement`
- Algorithm-critical constants documented inline: `# 0-100 (higher = more neutral)`

**Method docstrings:**
- One-line summaries for most methods
- Multi-line docstrings used for public methods with notable parameters or return values:
  ```python
  def verify_doi(self, doi: str) -> Tuple[bool, Dict]:
      """
      Verify DOI exists and get metadata.
      Returns (success, metadata_dict)
      """
  ```

**No JSDoc/TSDoc** — Python only.

## Function Design

**Size:** Methods are kept short (10-30 lines typical); the longest is `_check_bibliography()` at ~50 lines

**Parameters:** 
- `self` as first param for all instance methods
- Keyword arguments with defaults grouped at the end: `style: str = "markdown"`, `strict_mode: bool = False`
- No `*args` or `**kwargs` in any script

**Return Values:**
- Validation/check methods return `bool` (pass/fail)
- Network/lookup methods return `Tuple[bool, Dict]` (success + metadata)
- Score methods return `float` (0-100 scale)
- Factory/generate methods return `str`

## Module Design

**Exports:**
- All scripts are designed as CLI entry points with `if __name__ == '__main__': main()` guard
- Classes can be imported and used programmatically (no `__all__` defined)
- `citation_manager.py` includes an `# Example usage` block at the bottom demonstrating programmatic use

**Standalone modules:**
- Scripts do NOT import from each other — each is fully self-contained
- No shared utility module; common patterns (e.g., reading a report file, parsing bibliography) are duplicated across scripts

**CLI pattern:**
All scripts use `argparse` with:
- `RawDescriptionHelpFormatter` for multi-line epilog examples
- Short and long flags: `--report / -r`, `--query / -q`
- `required=True` for primary inputs
- `action='store_true'` for boolean flags like `--strict`

## Shell Scripting Conventions (`tools/deploy-to-live.sh`)

- `set -euo pipefail` at the top (fail fast, unset variable error, pipe error propagation)
- `SCREAMING_SNAKE_CASE` for all shell variables: `SCRIPT_DIR`, `SRC_DIR`, `DEST_DIR`
- Guard clauses with `>&2` for error output and `exit 1` for failures
- `--dry-run` flag support with a `DRY_RUN_FLAG` variable threaded through
- POSIX-compliant: uses `${1:-}` for optional parameter defaulting

---

*Convention analysis: 2026-04-10*
