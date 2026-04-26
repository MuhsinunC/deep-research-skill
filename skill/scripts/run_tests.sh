#!/usr/bin/env bash
# Run the deep-research skill unit test suite.
#
# Usage:
#     ./skill/scripts/run_tests.sh
#
# Exits 0 if all pass, non-zero otherwise.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
exec python3 -m unittest discover tests -v
