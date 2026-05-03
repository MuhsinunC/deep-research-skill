---
name: deep-research-cli
description: Deterministic CLI engine for deep research with reliability guarantees and per-phase model selection (Claude Agent SDK or OpenCode/OpenRouter). Triggers narrowly on EXPLICIT phrasing — "deterministic deep research", "cli deep research", "use the deep-research-cli skill", or operator running the slash command. The default `deep-research` skill remains the primary route for ambiguous "deep research" requests; this skill is for users who specifically need the CLI's deterministic orchestration, observable phase artifacts, or non-Claude providers.
---

# Deep Research CLI Launcher

This skill invokes the `deep-research-cli` Node.js engine bundled at
`./scripts/cli.js`. The engine reproduces the deep-research methodology
with code as the orchestrator and AI calls only for genuinely
open-ended judgment — giving you predictable execution, atomic state
persistence, and per-phase model selection.

## When to invoke

Trigger this skill ONLY when the user explicitly asks for one of:

- "deterministic deep research" / "the deep-research CLI"
- "use the deep-research-cli skill" / "run with --provider opencode"
- "research X with [DeepSeek | GPT-4o | OpenRouter | a non-Claude model]"
- The user runs a `/deep-research-cli` slash command

For ambiguous "deep research X" requests, defer to the `deep-research`
skill (the prompt-driven workhorse). This skill exists for users who
specifically want the deterministic guarantees + observability + model
choice that the CLI provides.

## Invocation

```bash
node ~/.claude/skills/deep-research-cli/scripts/cli.js \
  "<topic>" \
  --mode deep \
  --provider claude
```

Flags:
- `--mode quick|standard|deep|ultradeep` (default `deep`)
- `--provider claude|opencode` (default `claude`; `opencode` routes through
  OpenRouter for any OpenAI-compatible model)
- `--output-dir <path>` (default `~/Documents/Research/<slug>_<date>_<uuid8>`)
- `--brief-file <path>` (read a richer brief from a markdown file instead
  of a positional topic)
- `--resume` (resume an existing dispatch — use with `--output-dir`)

Run with `--help` for the full reference.

## Runtime dependencies

- **Node 22+** (the bundle is built for ES2022 + ESM).
- **The `deep-research` skill must also be deployed** — Phase 8 generates
  HTML/PDF via `~/.claude/skills/deep-research/scripts/md_to_html.py`.
  If it's missing, the markdown report is still produced; HTML/PDF are
  skipped with a warning.
- **For `--provider opencode`:** the `opencode` binary must be in PATH,
  and an `OPENROUTER_API_KEY` (or equivalent) env var must be set per
  opencode's config conventions. Install:
  https://opencode.ai/docs/install/

## Output layout

```
$OUTPUT_DIR/
├── _checkpoint.json                 — atomic; phase progress
├── _subagent_progress.json          — atomic; sub-agent fan-out tracking
├── _DONE                            — sentinel; FINAL Phase 8 write
├── phase01_scope.md
├── phase02_plan.md
├── phase03_retrieve_<lens>.md       — one per lens (4 in deep, 6 in ultradeep)
├── phase04_triangulate.md
├── phase04_5_outline.md
├── phase05_synthesize.md
├── phase06_critique.md
├── phase07_refine.md
├── phase07_5_verify_<sublens>.md    — one per verifier + adversarial
├── research_report_<DATE>_<slug>.md — final report
├── research_report_<DATE>_<slug>.provenance.md
├── research_report_<DATE>_<slug>.html (if md_to_html.py available)
└── research_report_<DATE>_<slug>.pdf (if md_to_html.py available)
```

Pause: `touch $OUTPUT_DIR/_STOP_REQUESTED` (soft) or `_STOP_NOW` (hard).
Resume: remove the flag, then re-run with `--resume --output-dir $OUTPUT_DIR`.

## See also

- `references/usage.md` — full flag reference + troubleshooting
- The source repo: `~/Documents/Muhsinun/Projects/GitHub/deep-research-skill/cli/`
