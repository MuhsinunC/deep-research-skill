#!/usr/bin/env bash
# Deploy the deep-research-cli launcher skill to the live skill dir.
#
# Source:      cli/launcher-skill/
# Destination: ~/.claude/skills/deep-research-cli/
#
# Pattern mirrors tools/deploy-to-live.sh (which deploys the existing
# prompt-driven skill). Both can run side-by-side — the new launcher
# triggers narrowly per its SKILL.md frontmatter.
#
# IMPORTANT: run `npm run build` from cli/ first to refresh
# launcher-skill/scripts/cli.js. The deploy script does NOT auto-build.
# Committing a built artifact is required (per I3 in PLAN.md) so a fresh
# clone can deploy without npm install.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="$REPO_ROOT/cli/launcher-skill"
DEST_DIR="$HOME/.claude/skills/deep-research-cli"

DRY_RUN=""
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN="--dry-run"
  echo "=== DRY RUN — no files will be changed ==="
fi

echo "Source:      $SOURCE_DIR"
echo "Destination: $DEST_DIR"
echo

if [ ! -d "$SOURCE_DIR" ]; then
  echo "ERROR: source directory does not exist: $SOURCE_DIR" >&2
  exit 1
fi

if [ ! -f "$SOURCE_DIR/SKILL.md" ]; then
  echo "ERROR: $SOURCE_DIR does not contain a SKILL.md" >&2
  exit 1
fi

if [ ! -f "$SOURCE_DIR/scripts/cli.js" ]; then
  echo "ERROR: $SOURCE_DIR/scripts/cli.js is missing." >&2
  echo "Run 'npm run build' from cli/ to produce the bundle, then retry." >&2
  exit 1
fi

mkdir -p "$DEST_DIR"

rsync -av --delete $DRY_RUN \
  --exclude '.git' \
  --exclude '.gitignore' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  "$SOURCE_DIR/" "$DEST_DIR/"

if [ -z "$DRY_RUN" ]; then
  echo
  echo "=== Deploy complete ==="
  echo
  echo "Next Claude Code session will load the skill from: $DEST_DIR"
fi
