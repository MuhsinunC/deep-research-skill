# Deep Research Skill — Development Roadmap

Tracks all completed and planned work across the project. Checkboxes show
status: checked = done, unchecked = pending/in-progress.

Last updated: 2026-04-10

---

## Stream 0: Repository Foundation (complete)

All repo setup, consolidation, and documentation work.

- [x] Investigate effort level dropping from max to high (root cause: `ultrathink` keyword cosmetic injection, documented in CLAUDE.md)
- [x] Discover and audit all 3 source locations (fork clone, live skill dir clone, random-web-research notes repo)
- [x] Verify byte-identical content across locations via MD5 hashes
- [x] Consolidate dev notes from `random-web-research` into fork repo
- [x] Restructure repo: `skill/`, `notes/`, `tools/` hierarchy
- [x] Rename `notes/development/` subdirs to `research/`, `benchmarks/`, `adr/`, `test-runs/`
- [x] Write `tools/deploy-to-live.sh` (rsync-based deploy script with `--dry-run`)
- [x] Clean live skill dir: remove `.git/`, `.gitignore`, `development/`
- [x] Write `CLAUDE.md` — cardinal rule, workflow, gotchas, conventions
- [x] Code-review `CLAUDE.md` to zero complaints (2 passes with superpowers:code-reviewer)
- [x] Write `README.md` (repo-level overview)
- [x] Rewrite `skill/README.md` with standalone project identity and accurate stats
- [x] Code-review `skill/README.md` to zero complaints
- [x] Create standalone GitHub repo `MuhsinunC/deep-research-skill` (not a fork)
- [x] Push all history to new repo, verify SHA match local = remote
- [x] Delete old fork `MuhsinunC/claude-deep-research-skill`
- [x] Rename local folder `claude-deep-research-skill/` to `deep-research-skill/`
- [x] Migrate Claude Code session storage to new encoded path
- [x] Clean up stale remotes, backup files, obsolete scripts
- [x] Add `.remember/` and `.playwright-mcp/` to `.gitignore`
- [x] Write `notes/README.md` documenting subcategory conventions
- [x] Final 10-point verification: clean tree, synced remote, live dir matched
- [x] Map codebase with GSD mapper agents (`.planning/codebase/`, 7 docs, 1188 lines)

---

## Stream 1: Model Selection — Initial Investigation (complete)

A/B testing to determine which models can handle which pipeline components.

- [x] Design A/B test methodology: identical prompts, simultaneous dispatch, controlled confounders
- [x] Run retrieval A/B test: Opus 4.6 vs Sonnet 4.6 on Phase 3 RETRIEVE task
- [x] Run verification A/B test: Opus 4.6 vs Sonnet 4.6 on Phase 7.5 VERIFY task (4 claims, known ground truth)
- [x] Analyze results and write `notes/benchmarks/model-ab-test/analysis.md`
- [x] Decision: hybrid architecture — Opus lead + Sonnet sub-agents
- [x] Implement hybrid model config in `skill/reference/methodology.md` (all Task tool calls specify `model: "sonnet"`)
- [x] Document cost impact: ~28-30% total pipeline cost reduction, ~15-20% wall clock improvement
- [x] Validate hybrid setup in v14 test run (partial — tainted effort baseline, but sub-agent model selection confirmed working)
- [x] Write ADR-001: Task tool vs `claude -p` subprocess sub-agents (`notes/adr/001-task-tool-vs-claude-p-subagents.md`)

**Not yet done from this stream (moved to Streams 2-4):**
- Haiku evaluation (never tested)
- Full end-to-end validated hybrid test (v15 hung before completion)
- Per-component benchmarks beyond retrieval and verification

---

## Stream 2: Sub-Agent Architecture Switch

Fix the 20% hang rate caused by Task tool's synchronous parallel spawn. This
is the prerequisite for reliable benchmarking. See ADR-001 for full analysis.

- [ ] **#97** — Implement `claude -p` subprocess sub-agent architecture in methodology
  - Replace Task tool spawns in Phase 3 RETRIEVE, Phase 6 CRITIQUE, Phase 7.5 VERIFY
  - Each sub-agent becomes `claude -p "..." --model sonnet --effort high` with process-level timeout
  - Add Bash `wait` or background task polling for parallelism
  - Update `skill/reference/methodology.md` with new spawn templates
  - Update `skill/SKILL.md` if spawn command format changes
  - ~200 lines of new/modified methodology docs
- [ ] **#116** — Validate with end-to-end test run (v16)
  - Run full deep-mode test with new architecture
  - Verify: no hangs, timeouts work, crash isolation works, file handoffs work
  - Compare output quality to v13 baseline
  - Log in `notes/test-run-log.md`

---

## Stream 3: Benchmarking Infrastructure

Standardize how we benchmark before running more experiments. Without this,
results are not reproducible or comparable.

- [ ] **#117** — Create `notes/benchmarks/METHODOLOGY.md`
  - Standard benchmark types (per-component, full pipeline, isolation tests)
  - Required measurements: accuracy, wall clock, tokens (in/out), cost USD
  - API pricing reference: Opus $5/$25 MTok, Sonnet $3/$15, Haiku $1/$5
  - Reproducibility: skill commit SHA, exact prompt, model + effort config
  - Statistical validity: when N>1 trials are needed
  - Comparison methodology: how to judge "equivalent quality" vs "degraded"
- [ ] **#118** — Design isolation strategy for parallel benchmark runs
  - Claude Code context gathering can contaminate concurrent runs in same dir
  - Sub-agents of sub-agents compound the risk
  - Strategy: separate working directories, git worktrees, or temp dirs
  - Document which benchmarks can safely parallelize vs must be sequential
- [ ] **#119** — Audit previous benchmarks for cross-contamination
  - Check model A/B test (`notes/benchmarks/model-ab-test/`): did Opus and Sonnet runs share context?
  - Check test runs v10-v15: did residual outputs leak into subsequent runs?
  - Check Phase 3 parallel retrieval: could sub-agents read each other's partial outputs?
  - Write findings to `notes/benchmarks/contamination-audit.md`
- [ ] **#120** — Plan all model comparison benchmarks (`notes/benchmarks/BENCHMARK-PLAN.md`)
  - Requires #117, #118, #119 complete first
  - Per-component matrix: every pipeline component x candidate models
  - Parallelization plan with isolation requirements
  - Cost estimates per benchmark using real API pricing

---

## Stream 4: Model Comparison Benchmarks

The actual experiments. Blocked on Streams 2 and 3.

- [ ] **#121** — Run per-component model head-to-head benchmarks
  - Phase 3 retrieval sub-agents: Opus vs Sonnet vs Haiku
  - Phase 6 gap-fill sub-agents: Opus vs Sonnet vs Haiku
  - Phase 7.5 citation verifiers: Opus vs Sonnet vs Haiku
  - Phase 7.5 adversarial refutation agent: Opus vs Sonnet (Haiku likely too weak)
  - Lead agent PLAN phase: Opus vs Sonnet
  - Lead agent SYNTHESIZE phase: Opus vs Sonnet
  - Lead agent REFINE phase: Opus vs Sonnet
  - Lead agent TRIANGULATE: Opus vs Sonnet
  - Haiku for simplest sub-tasks: literal URL fetching + text matching
  - Record: accuracy, wall clock, tokens, cost USD, quality notes
- [ ] **#122** — Run full end-to-end pipeline comparison tests
  - Config A: All-Opus baseline (everything Opus 4.6, max effort)
  - Config B: Current hybrid (Opus lead + Sonnet sub-agents)
  - Config C: Optimized hybrid (best-per-component from #121, potentially including Haiku)
  - Compare: total cost, wall clock, report quality, accuracy, DRA flags caught
  - Log all runs in `notes/test-run-log.md`
- [ ] **#123** — Create and maintain `notes/benchmarks/RESULTS.md`
  - Per-component comparison tables (model, effort, accuracy, time, tokens, cost)
  - Full pipeline comparison tables (+ sources, claims verified, word count)
  - Cost summary per deep-mode run under each model config
  - Updated incrementally as each benchmark finishes, not just at the end

---

## Dependency Graph

```
Stream 2 (architecture fix)
  #97 ──→ #116 (validate) ──┐
                              ├──→ #121 (per-component) ──→ #122 (E2E tests)
Stream 3 (benchmarking infra) │
  #117 (methodology) ──→ #118 (isolation) ─┤
                    └──→ #123 (results doc) │
  #119 (contamination audit) ──────────────┘
                                      ↑
                                #120 (plan all)
```

**Can start in parallel (day 1):** #97, #117, #119

---

## Reference: Confirmed API Pricing (Anthropic, April 2026)

| Model | Input / MTok | Output / MTok | vs Opus |
|---|---|---|---|
| Opus 4.6 | $5.00 | $25.00 | 1.00x |
| Sonnet 4.6 | $3.00 | $15.00 | 0.60x |
| Haiku 4.5 | $1.00 | $5.00 | 0.20x |

User has 82% Anthropic API discount — relative ratios unchanged, absolute
costs are 18% of the listed prices.

---

## Reference: Test Run History

See `notes/test-run-log.md` for the full test run table (v2-v15).

Key runs for benchmarking context:
- **v13** (all-Opus, effort unknown → actually medium): best quality baseline, 14,830 words, 70 sources, 1 loop-back
- **v14** (hybrid, tainted effort): first Sonnet sub-agent test, killed mid-VERIFY, salvaged
- **v15** (hybrid, proper max effort): hit Task tool hang at Phase 3 — motivates Stream 2
