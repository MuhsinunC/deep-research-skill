# deep-research-cli

Deterministic CLI engine for the deep-research pipeline.

## Why this exists

The sister `skill/` directory in this repo contains an excellent research
methodology — but running it as a Claude Code worker depends on the LLM
following every step reliably. AI alone is not consistent enough for a
multi-phase pipeline that costs real money per run.

This CLI inverts the architecture: a deterministic state machine (TypeScript)
orchestrates the pipeline, calling AI only for the steps that genuinely
need open-ended judgment. Everything else — file I/O, atomic checkpoints,
phase transitions, fan-out coordination, claim parsing, format validation —
is plain code.

The result: predictable execution, explicit failure modes, real visibility,
and the same methodological depth as the existing skill.

## Status

In active development. See `PLAN.md` for the granular checklist and current
progress.

## Project layout

```
cli/
├── src/                  TypeScript source
│   ├── cli.ts            Entry point + arg parsing
│   ├── orchestrator.ts   Phase state machine
│   ├── providers/        AgentProvider interface + impls (claude, opencode)
│   ├── phases/           Per-phase logic (deterministic + AI calls)
│   ├── state/            Atomic checkpoint, sub-agent progress, _DONE
│   ├── prompts/          Phase prompt templates (loaded at runtime)
│   ├── types/            Shared TS types
│   └── util/             Logging, paths, errors
├── tests/                vitest unit tests
├── scripts/              Build script
├── launcher-skill/       Claude Code skill that invokes this CLI
│   ├── SKILL.md          Skill metadata + instructions
│   ├── scripts/          Bundled CLI lands here (cli.js after build)
│   └── references/       Optional reference docs loaded by Claude
├── test-runs/            E2E test outputs (most gitignored except baseline)
├── PLAN.md               Granular implementation checklist (kept current)
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Build & deploy

```
npm install               # one-time
npm run build             # type-check + bundle to dist/cli.js + copy to launcher-skill/scripts/cli.js
npm test                  # vitest unit tests
../tools/deploy-cli-to-live.sh  # rsync launcher-skill/ -> ~/.claude/skills/deep-research-cli/
```

After deploy, the launcher skill is loaded by any new Claude Code session.

## Providers

The CLI uses a provider abstraction so the same orchestrator runs against
different AI backends:

- **`claude`** — Claude Agent SDK (TypeScript). Uses your Claude Code
  subscription quota. Default.
- **`opencode`** — OpenCode CLI invoked as a child process. Lets you run
  the pipeline against any OpenAI-compatible endpoint (e.g., OpenRouter
  → DeepSeek v4 / GPT-4o / etc.).

Selected via `--provider claude|opencode`.

## License

Same as the parent repo (no license file — all rights reserved).
