# claude-deep-research-skill (fork)

Source repository for the **Deep Research** skill for Claude Code. Fork of
[`199-biotechnologies/claude-deep-research-skill`](https://github.com/199-biotechnologies/claude-deep-research-skill)
with additional reliability, verification, and model-selection improvements.

> **Read [`CLAUDE.md`](./CLAUDE.md) before making any changes** — it documents
> the single-source-of-truth workflow, the deploy process, and the rules that
> keep this repo from drifting out of sync with the live runtime.

## Repository layout

| Path | Purpose |
|---|---|
| [`skill/`](./skill/) | The actual skill — this is what gets copied into `~/.claude/skills/deep-research/` to install. Contains `SKILL.md`, `reference/`, `scripts/`, `templates/`, `requirements.txt`, and the skill's own `README.md`. |
| [`tools/`](./tools/) | Repo-level development tools (deploy script, etc.). Not part of the deployed skill. |
| [`notes/`](./notes/) | Development history — research notes, benchmarks, architecture decision records, and test run outputs from v2 through v15. See [`notes/README.md`](./notes/README.md) for the subcategory map. Not part of the deployed skill. |
| [`tests/`](./tests/) | Test fixtures used by the skill's Python validation scripts. Dev-only, not part of the deployed skill. |
| [`CLAUDE.md`](./CLAUDE.md) | Full development + deployment workflow. |
| [`README.md`](./README.md) | This file. |

## Quick start

```bash
# Clone this repo for development
git clone https://github.com/MuhsinunC/claude-deep-research-skill.git
cd claude-deep-research-skill

# Deploy the skill into your local Claude Code install
./tools/deploy-to-live.sh
```

After the deploy completes, Claude Code will pick up the skill from
`~/.claude/skills/deep-research/` on the next session.

## Development workflow (one-liner)

All edits happen **in this repo**. When ready to ship a version, run
`./tools/deploy-to-live.sh` to sync `skill/` into `~/.claude/skills/deep-research/`.
**Never edit files directly in `~/.claude/skills/deep-research/`** — that directory
is a deployment target, not a development checkout. See [`CLAUDE.md`](./CLAUDE.md)
for the full reasoning and detailed procedures.
