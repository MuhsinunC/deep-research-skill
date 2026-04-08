# Development Notes

This directory holds the development history of the deep-research skill —
research notes, benchmarks, architecture decisions, and test run outputs. It
is **not** part of the deployed skill (`tools/deploy-to-live.sh` excludes it).

## Structure

| Path | What lives here |
|---|---|
| [`test-run-log.md`](./test-run-log.md) | Master log of every deep-research test run (v2 through v15). Update this row-by-row when you kick off a new run. |
| [`research/`](./research/) | Exploration notes, design research, related papers, and deep investigations into sub-topics (e.g., subagent patterns, third-party tools, skill-vs-framework comparison, paper analyses). |
| [`benchmarks/`](./benchmarks/) | Head-to-head comparisons and quantitative tests (model A/B tests, search-API provider benchmarks). |
| [`adr/`](./adr/) | Architecture decision records. Numbered `NNN-short-title.md`. Each ADR captures a decision, the alternatives considered, and the rationale. |
| [`test-runs/`](./test-runs/) | Full output of each versioned deep-research test run. Each `v{N}-<name>/` directory contains the scope, plan, sub-agent outputs, triangulation, critique, verification logs, and the final research report for that run. |

## Conventions

- **New test run:** create `test-runs/v{N}-<short-name>/` and add a row to
  `test-run-log.md` with version, UUID8, date, mode, topic, duration, sources,
  and status.
- **New research topic:** add a markdown file or subdirectory under `research/`.
  Avoid flat clutter — if a topic has more than 2 files, group them in a
  subdirectory.
- **New ADR:** copy the format of `adr/001-*.md`, increment the number, keep the
  title short.
- **Benchmarks:** put the raw output *and* an `analysis.md` summary in a
  per-benchmark subdirectory under `benchmarks/`.

## What does NOT belong here

- Skill code (goes in [`../skill/`](../skill/))
- Repo-level dev tools like the deploy script (goes in [`../tools/`](../tools/))
- Test fixtures for the skill's Python scripts (goes in [`../tests/`](../tests/))
