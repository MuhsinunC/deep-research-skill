# deep-research-skill

Source repository for the **Deep Research** skill for Claude Code — a high-rigor research engine with rubric-guided verification, adversarial refutation, hybrid Opus+Sonnet sub-agents, and a drop-in philosophy (no required external APIs).

Originally started as a fork of [`199-biotechnologies/claude-deep-research-skill`](https://github.com/199-biotechnologies/claude-deep-research-skill) and substantially extended. See [`skill/README.md`](./skill/README.md) for the full project description, pipeline details, and version history.

> **Read [`CLAUDE.md`](./CLAUDE.md) before making any changes** — it documents
> the single-source-of-truth workflow, the deploy process, and the rules that
> keep this repo from drifting out of sync with the live runtime.

## Repository layout

| Path | Purpose |
|---|---|
| [`skill/`](./skill/) | The actual skill — this is what gets copied into `~/.claude/skills/deep-research/` to install. Contains `SKILL.md`, `reference/`, `scripts/`, `templates/`, `requirements.txt`, and the skill's own `README.md`. |
| [`tools/`](./tools/) | Repo-level development tools (`deploy-to-live.sh`, etc.). Not part of the deployed skill. |
| [`notes/`](./notes/) | Development history — research notes, benchmarks, architecture decision records, and test run outputs from v2 through v15. See [`notes/README.md`](./notes/README.md) for the subcategory map. Not part of the deployed skill. |
| [`tests/`](./tests/) | Report fixtures (`valid_report.md`, `invalid_report.md`) used for manual iteration on `skill/scripts/` validators. No automated test runner. Not part of the deployed skill. |
| [`CLAUDE.md`](./CLAUDE.md) | Full development + deployment workflow. |
| [`README.md`](./README.md) | This file. |

## Quick start

```bash
# Clone this repo for development
git clone https://github.com/MuhsinunC/deep-research-skill.git
cd deep-research-skill

# Deploy the skill into your local Claude Code install
./tools/deploy-to-live.sh
```

After the deploy completes, Claude Code will pick up the skill from
`~/.claude/skills/deep-research/` on the next session. Use
`./tools/deploy-to-live.sh --dry-run` to preview changes without touching
anything.

## Development workflow (one-liner)

All edits happen **in this repo**. When ready to ship a version, run
`./tools/deploy-to-live.sh` to sync `skill/` into `~/.claude/skills/deep-research/`.
**Never edit files directly in `~/.claude/skills/deep-research/`** — that
directory is a deployment target, not a development checkout. See
[`CLAUDE.md`](./CLAUDE.md) for the full reasoning and detailed procedures.
