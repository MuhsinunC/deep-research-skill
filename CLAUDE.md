# CLAUDE.md

Source repo for the **Deep Research** skill for Claude Code. Fork of
`199-biotechnologies/claude-deep-research-skill` with additional reliability,
verification, and hybrid-model improvements.

**Read this file before making any changes.** It documents rules that exist
because we've already made these mistakes once.

## Repository layout

| Path | Purpose | Deployed? |
|---|---|---|
| `skill/` | The actual skill: `SKILL.md`, `reference/`, `scripts/`, `templates/`, `requirements.txt`, `README.md`. | **Yes** — rsynced into `~/.claude/skills/deep-research/` |
| `tools/` | Repo-level dev scripts (`deploy-to-live.sh` is the shipping entry point). | No |
| `notes/` | Development history: `research/`, `benchmarks/`, `adr/`, `test-runs/`, `test-run-log.md`. See `notes/README.md`. | No |
| `tests/` | Standalone report fixtures used when iterating on `skill/scripts/`'s Python validators. No automated test runner. | No |
| `CLAUDE.md`, `README.md`, `.gitignore` | Repo metadata. | No |

## The cardinal rule: single source of truth

All edits happen **in this repo**. Period. The live skill at
`~/.claude/skills/deep-research/` is a **deploy target**, not a development
checkout — it has no `.git/`, no `.gitignore`, and no `notes/`. Never edit
files directly in the live dir; always edit here and redeploy.

**Why this rule exists:** Previously `~/.claude/skills/deep-research/` was a
separate clone of the same fork. The two clones silently drifted for weeks
because the live dir was never `git fetch`ed. We're not doing that again.

## Development workflow

1. Edit files under `skill/` (runtime) or `notes/` (dev history).
2. Commit and push to the current working branch
   (`git branch --show-current` to check).
3. When ready to ship a version to your local Claude Code install:
   `./tools/deploy-to-live.sh`
4. Restart Claude Code (or start a new session) to pick up the new version.

## Deploy to live

```bash
./tools/deploy-to-live.sh            # sync skill/ → ~/.claude/skills/deep-research/
./tools/deploy-to-live.sh --dry-run  # preview changes (run this first whenever in doubt)
```

The script uses `rsync -av --delete` so stale files in the live dir that
aren't in `skill/` get removed. It excludes `.git`, `.gitignore`,
`__pycache__`, and `*.pyc` from the source.

**Because `.git` and `.gitignore` are on the rsync exclude list, `--delete`
will never touch them in the destination either.** If the live dir was
originally set up as a clone (the pattern we're migrating away from) or
contains stale directories from a previous mismatched state, they will
persist silently across deploys. Clean them up explicitly once before your
first deploy on any machine:

```bash
rm -rf ~/.claude/skills/deep-research/.git \
       ~/.claude/skills/deep-research/.gitignore \
       ~/.claude/skills/deep-research/development
./tools/deploy-to-live.sh
```

After this one-time cleanup, subsequent deploys are idempotent and safe.

## Test run conventions

Deep-research test outputs go in `notes/test-runs/v{N}-<short-name>/`. Every
run also gets a row in `notes/test-run-log.md` with columns:

`Version | UUID8 | Date | Skill commit | Mode | Lead model | Sub-agent model | Topic | Start | End | Duration | Sources | Claims verified | Loop-backs | Step 6 | Words | Status | Output dir | Notes`

When invoking a deep-research test, use the self-improvement query as the
default topic: *"how do I improve the current state of the skill?"* — it
doubles as a test run and as a source of skill improvement ideas.

## Effort level configuration (critical)

- The parent Claude Code session must start with `CLAUDE_CODE_EFFORT_LEVEL=max`
  in its environment (typically set via `~/.zshrc`). Verify with
  `env | grep CLAUDE_CODE_EFFORT_LEVEL` inside Claude Code.
- `skill/SKILL.md` frontmatter declares `effort: max` for the session that
  invokes the skill.
- The skill cannot rely on `~/.zshrc` being sourced in non-interactive shells
  (e.g., `zsh -c`), so spawn commands for sub-sessions explicitly prepend
  `CLAUDE_CODE_EFFORT_LEVEL=max` and pass `--effort max` inline as redundant
  safety.
- **Only Opus 4.6 supports `max` effort.** Sonnet caps at `high`. Haiku has
  no effort parameter. If the model gets downgraded, max silently maps to high.
- **Ground truth for current effort:** run `/model` inside Claude Code. It
  reads the resolver directly and prints `...with X effort`. Do not trust
  toast notifications or status badges alone.

## Known gotchas

- **`ultrathink` keyword** triggers a per-turn text injection saying
  *"requested reasoning effort level: high"* whenever the literal word
  appears anywhere in the message stream (including inside loaded skill
  content). This is **cosmetic prompt injection only**, not a real API-level
  downgrade. Avoid using the word in comments or docs that might get loaded
  into context.
- **Do NOT add `--max-turns` to `claude -p` spawns.** It cuts research off
  mid-pipeline. We removed it in commit `a883a38` and must not add it back.
  If you hit a runaway, fix the cause, don't cap turns.
- **Task tool sub-agents can hang** at 0% CPU indefinitely, blocking the
  parent. This failure mode hits roughly 20% of deep-mode runs. See
  `notes/adr/001-task-tool-vs-claude-p-subagents.md` for the decision to
  switch to `claude -p` subprocesses; the switch is planned but not yet
  implemented.
- **`SKILL.md` uses relative paths** (`./reference/`, `./templates/`,
  `scripts/`) that resolve from its own location. Never separate `SKILL.md`
  from its sibling directories when moving things.
- **Sub-agent model selection** is hybrid: Opus lead + Sonnet sub-agents.
  Every Task tool spawn in the methodology must include `model="sonnet"` on
  sub-agents and an **EFFORT REINFORCEMENT** clause in the prompt text. See
  `skill/reference/methodology.md` Phase 3 and Phase 7.5 for verbatim templates.
- **Blocked site fallback order:** `WebFetch` → Chrome MCP extension →
  Playwright MCP. Don't skip tiers. Full rules in
  `skill/reference/methodology.md` ("Blocked Site Handling").

## What NOT to do

- Don't create a second clone of this repo in any location.
- Don't edit files directly in `~/.claude/skills/deep-research/`.
- Don't put runtime skill files anywhere outside `skill/`.
- Don't put dev notes, ADRs, or test outputs anywhere outside `notes/`.
- Don't commit `.remember/` or `.playwright-mcp/` — they're gitignored
  because they can contain private session notes or browser caches.
- Don't run deep-research test runs with the output directory anywhere
  except `notes/test-runs/`.

## Common commands

```bash
git log --oneline -10                                         # recent work
git push origin $(git branch --show-current)                  # push current branch
cat notes/test-run-log.md                                     # see past test runs
diff <(ls skill/) <(ls ~/.claude/skills/deep-research/)       # compare repo vs live
```

(Deploy commands are already documented under "Deploy to live" above.)
