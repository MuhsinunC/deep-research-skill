#!/usr/bin/env bash
#
# deploy-to-live.sh — Copy the skill/ directory into your local Claude Code
# skills directory so Claude Code loads the latest version at next invocation.
#
# Source:      <repo>/skill/
# Destination: ~/.claude/skills/deep-research/
#
# Uses rsync with --delete so stale files in the destination are removed.
# Excludes .git and .gitignore from the copy (the live skill dir should never
# be a git checkout — it's a plain deployment target).
#
# Usage:
#   ./tools/deploy-to-live.sh           normal run
#   ./tools/deploy-to-live.sh --dry-run preview without making any changes
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC_DIR="$REPO_DIR/skill"
DEST_DIR="$HOME/.claude/skills/deep-research"

DRY_RUN_FLAG=""
if [ "${1:-}" = "--dry-run" ]; then
    DRY_RUN_FLAG="--dry-run"
    echo "=== DRY RUN — no files will be changed ==="
fi

if [ ! -d "$SRC_DIR" ]; then
    echo "ERROR: source directory does not exist: $SRC_DIR" >&2
    exit 1
fi

if [ ! -f "$SRC_DIR/SKILL.md" ]; then
    echo "ERROR: $SRC_DIR does not contain SKILL.md — refusing to deploy" >&2
    exit 1
fi

echo "Source:      $SRC_DIR"
echo "Destination: $DEST_DIR"
echo ""

mkdir -p "$DEST_DIR"

rsync -av --delete $DRY_RUN_FLAG \
    --exclude='.git' \
    --exclude='.gitignore' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    "$SRC_DIR/" "$DEST_DIR/"

echo ""
if [ -n "$DRY_RUN_FLAG" ]; then
    echo "=== DRY RUN complete — no files changed ==="
else
    echo "=== Deploy complete ==="
    echo ""
    echo "Next Claude Code session will load the skill from: $DEST_DIR"
fi
