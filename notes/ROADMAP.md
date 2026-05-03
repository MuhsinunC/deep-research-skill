# Deep Research Skill — Development Roadmap

Tracks all completed and planned work across the project. Checkboxes show
status: checked = done, unchecked = pending/in-progress.

Last updated: 2026-05-03

---

## Stream C1: Deterministic CLI Engine (M0-M17 complete; M18-M21 user-driven — 2026-05-03)

Source: 2026-05-03 user request to invert the architecture from "Claude
Code worker reads prompt-driven skill, AI orchestrates everything" to
"deterministic TypeScript CLI orchestrates, AI is called only for
genuinely open-ended judgment." Motivation: AI orchestration is
unreliable; runs cost real money; no visibility into whether a phase
actually executed; need provider abstraction for benchmarking different
models (Claude SDK vs OpenRouter via OpenCode CLI).

Plan at `cli/PLAN.md` (632 lines, 23 milestones, locked decisions per
two review iterations).

**Architecture delivered:**
- New top-level `cli/` directory parallel to `skill/`, `tools/`, `notes/`
- TypeScript + Node 22 + ESM, strict mode + noUncheckedIndexedAccess +
  exactOptionalPropertyTypes
- Builds to single 1.6MB bundle via esbuild → committed to
  `cli/launcher-skill/scripts/cli.js` per skill-creator convention
- New launcher skill `deep-research-cli` deployed to
  `~/.claude/skills/deep-research-cli/` (does NOT touch existing
  `deep-research` skill — both run side-by-side; new skill triggers
  narrowly on explicit "cli" / "deterministic" phrasing)
- Provider abstraction: Claude Agent SDK (default) and OpenCode CLI (for
  OpenRouter / any OpenAI-compatible endpoint). Same orchestrator runs
  against either provider via `--provider` flag.

**Locked design decisions (from two review iterations on PLAN.md):**

- **C1**: root `.gitignore` carve-outs for `cli/*.json` (the existing
  blanket `*.json` rule was silently blocking all TypeScript configs)
- **C2**: `_DONE` schema locked at `uuid8`/`finished_at`/`phase_completed`/
  `cli_version`. Foreign `_DONE` files (e.g., from old Python skill)
  rejected with exit code 3. New CLI uses fresh OUTPUT_DIRs only.
- **C3**: Phase 7.5 Step 5 (Temporal Supersession) and Step 6 (Verifier-
  Guided Retry) explicitly deferred to v2; provenance records
  `skipped: "v2-deferred"`.
- **C4**: `SubAgentSpec.outputFile` REQUIRED. Provider contract: each
  sub-agent's text MUST be written atomically to `outputFile` BEFORE
  `fanOut` resolves. Preserves Granularity 2 resume.
- **C5**: `src/cli.ts` is a 1-line shim; testable impl in `cli-impl.ts`.
  Coverage exclusion limited to the shim only.
- **I1**: Phase 8 HTML/PDF generation calls
  `~/.claude/skills/deep-research/scripts/md_to_html.py` (deployed
  canonical path). Hard runtime dependency on existing skill being
  deployed. Markdown report still produced if Python tooling missing.
- **I5**: New CLI uses `~/.claude/research-tasks-cli.json` (separate
  from old skill's registry).

**Milestones M0-M17 (complete):**
- [x] M0 — project skeleton (package.json, tsconfig, vitest, esbuild)
- [x] M0.5 — root `.gitignore` carve-outs + `src/util/deps.ts` placeholder
- [x] M1 — `cli/PLAN.md` written + 2 code-review iterations (5 Critical +
  9 Important + 6 Minor first round; 1 Important + 3 Minor + 2
  Suggestions second round; all addressed)
- [x] M2 — state helpers (atomic write, checkpoint, sub-agent progress,
  `_DONE` sentinel, pause flag, disk-truth reconciliation, tasks
  registry). Code-reviewed: 1 Important (registry crash on malformed
  JSON) + 4 Minor; all fixed inline. 55 tests pass.
- [x] M3 — provider abstraction (`AgentProvider` interface,
  `JudgmentRequest`/`JudgmentResponse`, `SubAgentSpec` with required
  `outputFile`, `ProviderParseError`/`ProviderTimeoutError`/
  `ProviderConfigError`, factory + MockProvider)
- [x] M4 — Claude Agent SDK provider (uses `query()` API; per-sub-agent
  disk-write contract per C4; retry-on-parse-failure per I8)
- [x] M5 — OpenCode CLI provider (spawns `opencode` binary as child
  process; same retry policy; surfaces ENOENT loud)
- [x] M6 — phase orchestrator (deterministic state machine; mode→phase
  mapping; loop-back budget enforcement; recoverable/fatal error
  classification)
- [x] M7 — Phase 0 RESUME DETECTION (pure code: pause flag + `_DONE`
  schema validation + `*.tmp` cleanup + Disk-Truth Reconciliation +
  completion-but-missing-sentinel reconciliation + tasks-registry
  registration)
- [x] M8 — Phases 1-2 (SCOPE + PLAN with zod-validated structured outputs)
- [x] M9 — Phase 3 RETRIEVE (parallel fan-out, 4 lenses in deep, 6 in
  ultradeep; Granularity 2 resume via on-disk lens detection)
- [x] M10 — Phase 4 + 4.5 (TRIANGULATE + OUTLINE REFINEMENT)
- [x] M11 — Phase 5 SYNTHESIZE
- [x] M12 — Phase 6 + 7 (CRITIQUE + REFINE)
- [x] M13 — Phase 7.5 VERIFY (verifier fan-out + adversarial; Steps 5/6
  deferred to v2 per C3)
- [x] M14 — Phase 8 PACKAGE with strict ordering: report → provenance →
  HTML/PDF → tasks-registry → checkpoint → `_DONE` LAST. `_DONE` has
  most-recent mtime by construction.
- [x] M15 — CLI entry + arg parsing (yargs-based; `--mode`/`--provider`/
  `--output-dir`/`--brief-file`/`--resume`)
- [x] M16 — launcher skill (`deep-research-cli` SKILL.md with narrow
  trigger boundary per I9; `references/usage.md` with full flag
  reference + OpenCode setup + failure-mode recovery)
- [x] M17 — build pipeline (`scripts/build.mjs`: tsc lint + esbuild
  bundle + copy to `launcher-skill/scripts/cli.js`) + deploy script
  (`tools/deploy-cli-to-live.sh`: rsync to `~/.claude/skills/
  deep-research-cli/`)
- [x] M18 — full unit test suite passes (84 tests in 714ms; tsc clean)

**Verification of skeleton:**
- `npm run build` produces 1.6MB bundle
- `node launcher-skill/scripts/cli.js --help` outputs full flag reference
- `./tools/deploy-cli-to-live.sh` deploys cleanly to live skill dir
- `deep-research-cli` skill visible in live Claude Code skills list

**Remaining (M19-M21, user-driven):**
- [ ] **M19** — final whole-project code review with
  `superpowers:code-reviewer` on cross-cutting concerns (per-milestone
  reviews from M3 onward were batched into this final pass to stay
  within context budget; documented in commit messages
  `c4c9447`/`ff02fef`/`25aa205`)
- [ ] **M20** — end-to-end test: `deep` mode on "How can the
  deep-research-cli project be improved?" → output to
  `cli/test-runs/v1-baseline/`. Estimated cost: $3-7. **User-initiated**
  because it spends real Claude API tokens; agent should not
  unilaterally consume that budget.
- [ ] **M21** — final wrap-up commit + push + roadmap update

**Out of scope for v1 (deferred to v2):**
- Phase 7.5 Step 5 (Temporal Supersession) — provenance flagged
- Phase 7.5 Step 6 (Verifier-Guided Retry) — provenance flagged
- Granularity 3 (mid-LLM-stream resume)
- Browser-MCP retrieval (Cloudflare-blocked sources unreachable in v1)
- Prompt quality refinement — placeholders in `src/prompts/index.ts`
  produce runnable but un-optimized output. Refinement is M19 work
  ahead of the M20 E2E test if quality issues are observed.
- End-to-end validation against real Anthropic API (deferred to M20)

**Stream commits (chronological):**
1. `1cf493b` — M0-M2: scaffold + plan + state helpers (55 tests pass)
2. `c4c9447` — M3-M5: provider abstraction (Claude SDK + OpenCode CLI)
3. `ff02fef` — M6-M7: orchestrator + Phase 0 RESUME DETECTION
4. `25aa205` — M8-M17: phase handlers + CLI entry + launcher skill +
   build + deploy

---

## Stream B1: Operational Reliability Bug Fixes (complete — 2026-04-26)

Source: comprehensive bug report from 2026-04-25 peptide-knowledge-base
session that ran ~14 parallel deep-research dispatches and observed 7
distinct operational failure modes. Bug report at
`/Users/user/Documents/Muhsinun/Projects/GitHub/peptides-research/.local/deep-research-skill-bugs-2026-04-25.md`.

Plan at `notes/IMPLEMENTATION_PLAN.md`. Plan was code-reviewed (4 Critical + 6 Important findings, all addressed in the revised plan and implementation). Implementation was code-reviewed (0 Critical, 1 Important, 7 Minor). Important finding I1 plus Minor findings M1, M4, M5, M7 were folded in; M2 (full canonical-name migration in methodology.md prompts) deferred to a follow-up because resume back-compat handles legacy names; M3 (ADR-002 file vs in-line rationale) consolidated in `reference/resume.md`; M6 (test count divergence) is non-defect.

- [x] Bug 1 fix — recursive-spawn env-var guard (`CLAUDE_CODE_DEEP_RESEARCH_WORKER=1` plus role-check directive at top of Background Mode in SKILL.md plus wrapper-side `[ROLE-CHECK-WRAPPER]` echo)
- [x] Bug 2 fix — resume capability (Path A brief-prefix + Path B auto-detect + Disk-Truth Reconciliation + Phase 0 RESUME DETECTION + atomic checkpoint helper at `skill/scripts/atomic_checkpoint.py`)
- [x] Bug 3 fix — `< /dev/null` redirect on its own line with prominent warning above the spawn block
- [x] Bug 4 fix — `_starting.txt` liveness signal written by the bash wrapper BEFORE invoking `claude -p`
- [x] Bug 5 fix — Concurrency Guidelines section in SKILL.md (tab isolation, concurrency caps, session-aware sites, failure modes)
- [x] Bug 6 fix — Graceful Pause via `_STOP_REQUESTED` / `_STOP_NOW` flag files with Policy A (worker doesn't delete the flag)
- [x] Bug 7 fix — completion signal: Layer 1 (process exit + `_DONE`) docs, Layer 2 (`_DONE` sentinel via atomic helper), Layer 3 (`research-tasks.json` status), Layer 4 (tmux as the DEFAULT spawn pattern)
- [x] Cross-Cutting A — `CLAUDE_CODE_DEEP_RESEARCH_UUID8` env var on the lead worker for `ps eww | grep <UUID8>` visibility
- [x] Cross-Cutting B — partial: backwards-compatible filename aliases documented in `reference/resume.md`. Full canonical-name migration in methodology.md prompt examples is deferred (follow-up task — resume back-compat handles legacy names).
- [x] Cross-Cutting C — `research-tasks.json` registration enforced as part of Phase 0 (after RESUME DETECTION); status updated to `complete` in Phase 8 ordering rule
- [x] Cross-Cutting D — Cost forecast block in SKILL.md Step 2, printed before spawning
- [x] Phase 0 RESUME DETECTION section added in `methodology.md` (runs FIRST, before Task Registration)
- [x] Phase 8 Strict Ordering Rule added (Activities 1-7 → 8 → 9 → 9.5 HTML/PDF → 9.7 research-tasks complete → 9.8 final checkpoint → 10 `_DONE` LAST)
- [x] Atomic checkpoint Python helper (`skill/scripts/atomic_checkpoint.py`, 270 lines) with subcommands for default checkpoint, sub-agent progress, `_DONE` sentinel, and `cleanup-tmp`
- [x] Resume protocol reference (`skill/reference/resume.md`, 217 lines) — Path A header template, Disk-Truth Reconciliation algorithm, standardized output filenames table, atomic checkpoint usage, pause compatibility, Granularity 3 deferral rationale
- [x] Unit tests (`skill/scripts/tests/test_atomic_checkpoint.py`, 20 tests) covering atomic-write behavior, kill-mid-write simulation, JSON validation, sub-agent progress schema, `_DONE` idempotency, cleanup, plus 9 static consistency checks against SKILL.md and methodology.md
- [x] Test runner script (`skill/scripts/run_tests.sh`)
- [x] All 20 unit tests pass in 138ms

**Out of scope for this Stream (deferred to follow-ups):**
- End-to-end pipeline tests (per user direction — token budget constraint)
- Granularity 3 mid-LLM-turn resume (rationale documented in `reference/resume.md`)
- Path C `claude -p --resume <output_dir>` CLI mode (would require changes to claude binary itself)
- Token-budget self-pause (Bug 6 Trigger 4) — defer per bug report's own recommendation
- Long-term Bug 3 fix in claude CLI (auto-redirect stdin)
- Full canonical-name migration in methodology.md prompt examples (back-compat handles legacy)

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
