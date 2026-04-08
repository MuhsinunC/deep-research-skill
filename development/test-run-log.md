# Deep Research Skill — Test Run Log

**Purpose:** Single source of truth for every deep research test run. Tracks duration, configuration, and outcome metrics so we can compare runs objectively over time and detect performance regressions.

**Time zone:** All timestamps are in the user's local machine time (Eastern Time, EDT/EST as appropriate). Convert from any UTC checkpoint timestamps before logging.

**Maintenance rule:** Append to the bottom of the runs table after every test run completes (or fails). Never modify historical entries except to correct factual errors. If you correct an entry, note the correction in the "Notes" column.

---

## Schema (each run = one row)

| Field | Description |
|---|---|
| **Version** | Test version label (v5, v7, ..., v14, v15, ...) |
| **UUID8** | First 8 chars of the task UUID, if registered |
| **Date** | YYYY-MM-DD of the run |
| **Skill commit** | Git short SHA of `claude-deep-research-skill` at run time |
| **Mode** | quick / standard / deep / ultradeep |
| **Lead model** | Model + effort level used by the spawned `claude -p` lead agent |
| **Sub-agent model** | Model + effort level used by Task tool sub-agents |
| **Topic** | Research topic (≤120 chars; full topic in linked output dir) |
| **Start** | Wall-clock start time (HH:MM local) |
| **End** | Wall-clock end time (HH:MM local) |
| **Duration** | End − Start (mm:ss or h:mm) |
| **Sources** | Total unique sources gathered |
| **Claims verified** | VERIFIED count / total atomic claims (Phase 7.5) |
| **Loop-backs** | VERIFY loop-back cycles used / budget |
| **Step 6** | yes/no — was Verifier-Guided Retry triggered? |
| **Word count** | Final research_report.md word count |
| **Status** | complete / partial / killed / failed |
| **Output dir** | Relative path to output directory |
| **Notes** | Test purpose, observations, salient findings, deviations |

---

## Runs

| Version | UUID8 | Date | Skill commit | Mode | Lead model | Sub-agent model | Topic | Start | End | Duration | Sources | Claims verified | Loop-backs | Step 6 | Words | Status | Output dir | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v2 | — | 2026-03-22 | (early) | standard | Opus 4.6 (effort unknown) | inherit | v2 deep research skill improvements | 16:28 | 16:52 | 0:24 | 0 | n/a | n/a | n/a | — | partial | `v2-improvement-research/` | Early test, no proper sources gathered. Not a real research run. |
| v3 | — | 2026-03-22 | (early) | standard | Opus 4.6 (effort unknown) | inherit | v3 novel improvements to deep-research skill | 17:15 | 17:19 | 0:04 | 0 | n/a | n/a | n/a | — | partial | `v3-test-research/` | Early test, no real sources. |
| v4 | BF5E203A | 2026-03-29 | (early) | quick | Opus 4.6 (effort unknown) | inherit | v4 validation test - novel skill improvements | 00:11 | 00:12 | 0:01 | 0 | n/a | n/a | n/a | — | partial | `v4-validation-test/` | Sanity check only. |
| v5 | — | 2026-03-29 | 8963f4c | quick | Opus 4.6 (effort unknown) | inherit | Novel AI agent accuracy techniques for deep research skill v5 | 00:46 | 00:52 | 0:06 | 22 | n/a (quick mode skips VERIFY) | n/a | n/a | 4095 | complete | `v5-final-validation/` | First "real" quick mode validation. Sources used to build v5 features. |
| v6 | — | 2026-03-29 | 8963f4c | quick | Opus 4.6 (effort unknown) | inherit | Multi-agent hallucination reduction best practices | 01:11 | 01:14 | 0:03 | 22 | n/a | n/a | n/a | 2918 | complete | `v6-final-test/` | Quick mode with focused hallucination topic. |
| v7 | — | 2026-03-29 | 08b56b7 | quick | Opus 4.6 (effort unknown) | inherit | Server-Side WebAssembly Adoption | 01:22 | 01:22 | 0:00 | 7 | n/a | n/a | n/a | 689 | complete | `v7-wrapper-fix-test/` | Wrapper fix smoke test. Off-topic from skill improvement. |
| v8 | — | 2026-03-29 | 08b56b7 | quick | Opus 4.6 (effort unknown) | inherit | Rust backend web development market share | 01:24 | 01:24 | 0:00 | — | n/a | n/a | n/a | 549 | complete | `v8-stderr-fix-test/` | stderr fix smoke test. Off-topic from skill improvement. |
| v9 | 4FE2FBF2 | 2026-03-29 | 08b56b7 | quick | Opus 4.6 (effort unknown) | inherit | Novel improvements to AI deep research agent accuracy | 12:00 | 12:08 | 0:08 | 14 | n/a | n/a | n/a | 3473 | complete | `v9-final-test/` | Quick mode skill-improvement query. |
| v10 | F9E7CB02 | 2026-04-01 | 5292162 | deep | Opus 4.6 (effort unknown) | inherit | Current state of AI deep research agent frameworks and techniques (March-April 2026) | 09:36 | 13:05 | 3:29 | 50 | 8/11 | 0/2 | no | 7081 | complete | `v10-deep-mode-test/` | First full deep mode run. 1 CONTRADICTED claim, supersession check ran. |
| v11 | — | 2026-04-01 | 0213b80 | deep | Opus 4.6 (effort unknown) | inherit | Current best practices and emerging techniques for LLM-based claim verification and fact-checking systems (January-April 2026) | 21:59 | 22:41 | 0:42 | 42 | 11/12 | 0/2 | no | 6219 | complete | `v11-all-features-test/` | Tested DRA rubrics, adversarial agent, pro/con pairs, budget awareness all together. 4 adversarial WEAKENED claims. |
| v12 | B52444FA | 2026-04-06 | 29ed9b4 | deep | Opus 4.6 (effort unknown) | inherit | Modern vector databases for RAG comparison (April 2026) | 18:59 | 19:52 | 0:53 | 80 | 14/14 | 1/2 | no | 16748 | complete | `v12-findings-test/` | Validated v11 findings (adaptive decomposition, knowledge agg cap, verdict phrasing) end-to-end. 5 adversarial claims tested, 1 REFINE loop-back. |
| v13 | F9FA7E1D | 2026-04-07 | 69a107d | deep | Opus 4.6 (effort unknown) | inherit | State of AI agent observability tools as of April 2026: tracing, evaluation, debugging, and production monitoring for LLM-based agents | 00:46 | 02:40 | 1:54 | 70 | 9/12 | 1/2 | no | 14830 | complete | `v13-feynman-test/` | Validated 4 Feynman improvements end-to-end. Living plan artifact + no-silent-skip + acceptance criteria + provenance sidecar all working. 2 CONTRADICTED claims fixed in REFINE loop-back. |
| v14 | A664CE38 | 2026-04-07 | 4461179 | deep | Opus 4.6 (DEFAULT MEDIUM — env var not propagated) | Sonnet 4.6 (default high) | Comparison of agentic coding assistants in 2026: capabilities, benchmarks, IDE integrations, production deployment tradeoffs | 09:08 | 10:08* | 1:00* | ~70 | 14/36 PASS, 17 SOFT-PASS, 5 FAIL | n/a (killed mid-VERIFY) | n/a | salvaged | partial-killed-then-salvaged | `v14-hybrid-model-test/` | **TAINTED EFFORT BASELINE.** First hybrid model test (Opus lead + Sonnet sub-agents). Killed mid-PACKAGE at 10:15 by main session as defensive precaution after discovering effort env var wasn't propagated to subprocess. Salvaged via Sonnet sub-agent applying 5 hard FAILs + 12 SOFT-PASS hedges + 3 adversarial corrections. Verification correctly caught fabricated "1.6× productivity" number, wrong dates, swapped arXiv IDs, wrong model names. Useful as Opus-medium baseline for comparison against v15 (Opus-max). |
| v15 | E72ABA74 | 2026-04-07 | df7db85 | deep | Opus 4.6 max effort (env var + --effort max both explicit) | Sonnet 4.6 (default high + EFFORT REINFORCEMENT in prompt) | How can the current state of the deep-research skill be improved? Self-improvement research (accuracy/reliability/completeness/efficiency) | 10:40 | 12:40** | ~2:00** | 2 retrieval agents completed | n/a (killed mid-Phase 3) | n/a | n/a | — | partial-killed | `v15-effort-fix-test/` | **FIRST TRUE MAX-EFFORT RUN.** `CLAUDE_CODE_EFFORT_LEVEL=max` + `--effort max` verified in subprocess env. Reached Phase 3 RETRIEVE with 4 parallel sub-agents spawned via Task tool. Sub-agents #1 (27KB) and #2 (34KB) completed successfully; sub-agents #3 and #4 hung indefinitely — process stayed at 0% CPU with no file changes for 35+ minutes. Matches documented failure mode (#17147, #37521) — Task tool synchronous parallel spawn blocks parent if any sub-agent hangs. Methodology recovery says "no action within this session, checkpoint ensures partial recovery." Killed after confirming hang. Demonstrates the architecture's Achilles heel and strengthens the case for ADR-001 reconsideration (Task tool → claude -p subprocess sub-agents for crash isolation + timeouts). |

\* v14 end time is approximate (process killed at 10:15).
\*\* v15 end time is approximate (killed after 35+ min hang detected around 12:40).

---

## Active runs

(none — v15 killed after sub-agent hang, see Runs table for details)

---

## Configuration history

This section tracks important configuration changes that affect test runs. Cross-reference the "Skill commit" column above against this list to understand what was different between runs.

### Pre-v14 runs (commits before 4461179)
- All runs used the user's default model (Opus 4.6) with whatever default effort was active at the time. The `--effort` flag was NOT explicitly set on the spawn command. The user's `CLAUDE_CODE_EFFORT_LEVEL=max` env var in `~/.zshrc` was NOT propagated to the spawned subprocess because the Bash tool runs `zsh -c` (non-interactive) which does not source `~/.zshrc`. Effective effort: **Opus default (medium)**.
- All sub-agents inherited the parent model (Opus). No hybrid setup. Effective sub-agent effort: also Opus default (medium).
- The user's `~/.claude/settings.json` had `"effortLevel": "high"` which would have applied to the parent Claude Code session but NOT to the spawned subprocess (subprocess loads its own settings.json fresh, which had the same value). Effective: **all runs ran at medium effort**, despite the user's intent to be at max.

### v14 (commit 4461179) — first hybrid model test
- Hybrid model architecture introduced: lead Opus, sub-agents Sonnet
- Spawn command: `claude -p ... --model opus --max-turns 200 ...`
- Effort: still NOT explicit. Opus ran at default medium.
- Sub-agents (Sonnet) ran at Sonnet default (high) — which is also Sonnet's max.
- This is the **tainted effort baseline** because the lead agent should have been on max but was on medium.

### v15+ (commit 67845a2 onward)
- Effort propagation fixed:
  - SKILL.md frontmatter: `effort: max` (applies to PARENT session that invokes the skill, NOT the spawned subprocess)
  - Spawn command: `CLAUDE_CODE_EFFORT_LEVEL=max claude -p ... --model opus --effort max --max-turns 200 ...` (env var prepended inline AND --effort CLI flag — both required because zsh -c doesn't source ~/.zshrc)
  - Step 6 retry spawn: same dual mechanism applied
- `~/.claude/settings.json`: `"effortLevel"` field removed entirely so the env var (max) always wins for the parent session
- Hybrid model setup unchanged: Opus lead, Sonnet sub-agents
- Sub-agents inherit env var max → maps to Sonnet's high (Sonnet doesn't support max)

---

## How to use this log

**When starting a test run:**
1. Add a new row to the "Active runs" section with: version, UUID8, date, skill commit (`git rev-parse --short HEAD`), mode, lead model + effort, sub-agent model + effort, topic, start time
2. Begin the test

**When the test completes (or is killed):**
1. Move the row from "Active runs" to the bottom of the main "Runs" table
2. Fill in: end time, duration, sources, claims verified, loop-backs, Step 6, word count, status, notes
3. If killed or failed, mark status accordingly and explain in Notes
4. Commit the log update along with the test output directory

**When configuration changes:**
1. Add a new entry to "Configuration history" before running the next test
2. Reference the new commit SHA and what changed
3. Future runs reference this section via the "Skill commit" column

---

## Total token spend (rough)

This section tracks approximate token costs. Updated at the end of each session. Note: user has 82% Anthropic API discount but the underlying model costs are still tracked at standard rates here.

| Period | Runs | Approx total tokens (input + output) | Notes |
|---|---|---|---|
| 2026-03-22 (v2-v3) | 2 | <50K total | Smoke tests, no real research |
| 2026-03-29 (v4-v9) | 6 | ~500K total | Quick mode tests, mostly smoke + early validation |
| 2026-04-01 (v10-v11) | 2 | ~3M total | First two deep mode runs |
| 2026-04-06 (v12) | 1 | ~5M | First post-v11-improvements deep mode test |
| 2026-04-07 (v13-v14) | 2 | ~10M total | Feynman test + tainted-effort hybrid test (killed and salvaged) |
| **Total** | **13 completed + 1 partial** | **~18.5M tokens** | Approximate, before 82% discount |

(These numbers are rough estimates based on report sizes and pipeline complexity, not measured. Update with actual usage data when available from Claude Code stats or API billing.)
