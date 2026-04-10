# Codebase Concerns

**Analysis Date:** 2026-04-10

---

## Tech Debt

**Task tool sub-agent architecture (unimplemented ADR-001 recommendation):**
- Issue: The pipeline spawns 4-6 sub-agents per deep-mode run using the synchronous Task tool. ADR-001 recommends switching to `claude -p` subprocess sub-agents for crash isolation and timeout control. This switch was approved in writing after v15 empirically hit the documented failure mode, but the implementation has not yet happened. The current code in `skill/reference/methodology.md` still uses the Task tool in Phases 3, 6, and 7.5.
- Files: `skill/reference/methodology.md` (Phases 3, 6, 7.5 sub-agent spawn sections), `notes/adr/001-task-tool-vs-claude-p-subagents.md`
- Impact: ~20% of deep-mode runs hang indefinitely with no recovery path. When all 4 Phase 3 sub-agents are spawned in one synchronous message and any one hangs, the parent process is blocked at 0% CPU with no timeout mechanism. The only recovery is killing the parent process and losing the session.
- Fix approach: Per ADR-001's updated recommendation, replace every Task tool sub-agent spawn with `claude -p "$(cat prompt_file)" --model sonnet --effort high` background processes. Parent waits via Bash `wait` or polls for output files. Each subprocess gets its own `timeout` wrapper. This adds ~15-18s spawn overhead per deep run but eliminates the indefinite-hang failure mode.

**`research_engine.py` is a stub, not a real orchestrator:**
- Issue: `skill/scripts/research_engine.py` presents itself as "the research orchestration engine" but `execute_phase()` only prints instructions and returns `{status: "instructions_displayed"}`. It does not actually call Claude or any tool. The real pipeline runs from natural language instructions in `skill/reference/methodology.md` interpreted by the lead agent at runtime.
- Files: `skill/scripts/research_engine.py` (lines 442-459)
- Impact: Confusion for anyone reading the code expecting a functional orchestrator. The file exists but is non-operational as an engine. It is, however, a useful standalone CLI for displaying phase instructions.
- Fix approach: Either (a) add a prominent docstring clarifying it is a reference/documentation tool, not a live pipeline driver, or (b) implement a real subprocess harness aligned with the ADR-001 `claude -p` subprocess architecture.

**Phase count mismatch between `research_engine.py` and `SKILL.md`:**
- Issue: `ResearchPhase` enum in `skill/scripts/research_engine.py` defines 8 phases (SCOPE, PLAN, RETRIEVE, TRIANGULATE, SYNTHESIZE, CRITIQUE, REFINE, PACKAGE) and does not include the two half-phases (4.5 OUTLINE REFINEMENT and 7.5 VERIFY). The real pipeline in `skill/reference/methodology.md` has 10 phases. The standard-mode phase list in `_get_phases_for_mode()` also omits CRITIQUE and REFINE, making it a 6-phase list, not matching the SKILL.md workflow table.
- Files: `skill/scripts/research_engine.py` (lines 18-27, 495-518)
- Impact: If anyone runs `research_engine.py` expecting it to reflect the real pipeline, the displayed phase sequence will be wrong. Confusion for contributors or debugging sessions.
- Fix approach: Update `ResearchPhase` enum and `_get_phases_for_mode()` to match `SKILL.md` workflow table exactly, including OUTLINE_REFINEMENT and VERIFY half-phases.

**`continuation.md` uses Task tool for continuation agents:**
- Issue: `skill/reference/continuation.md` spawns continuation agents via `Task(subagent_type="general-purpose", ...)` with no `model` parameter specified (defaults to whatever parent inherits). This is inconsistent with the hybrid architecture requirement that every Task spawn explicitly sets `model="sonnet"`. It also lacks the EFFORT REINFORCEMENT clause required by methodology.md.
- Files: `skill/reference/continuation.md` (lines 74-108)
- Impact: Continuation agents may silently run on Opus instead of Sonnet, breaking cost/speed assumptions. Same hang risk as any other Task tool spawn.
- Fix approach: Add `model="sonnet"` to the continuation Task tool call and add the EFFORT REINFORCEMENT clause to the continuation agent's prompt.

---

## Known Bugs

**Sub-agent hang at 0% CPU (empirically confirmed):**
- Symptoms: Phase 3 RETRIEVE spawns 4 parallel sub-agents in a single synchronous Task tool message. Sub-agents #3 and #4 in v15 (UUID E72ABA74) produced only placeholder output (273 bytes, "Searches in progress...") and never updated their files. The parent process blocked at 0% CPU for 35+ minutes with no file changes. No error was returned — the synchronous call never resolved.
- Files: `notes/test-runs/v15-effort-fix-test/research_agent_3.md` (confirms 273-byte stuck output), `notes/adr/001-task-tool-vs-claude-p-subagents.md`, `notes/test-run-log.md` (v15 row)
- Trigger: Deep mode with 4 parallel Task tool sub-agents spawned in one message. Estimated frequency: ~20% per deep-mode run (1 confirmed hang in 5 deep-mode attempts v10-v15, where v14 had a different root cause).
- Workaround: Kill parent process. Checkpoint from prior phases is recoverable. No in-session recovery exists.

**Effort env var not propagated in pre-v15 runs (historical, fixed but worth noting):**
- Symptoms: All runs before v15 (v2 through v14) ran the lead agent at Opus default medium effort, not max, despite user intent. The `CLAUDE_CODE_EFFORT_LEVEL=max` in `~/.zshrc` is not sourced by `zsh -c` non-interactive shells used by the Bash tool.
- Files: `skill/SKILL.md` (spawn command), `notes/test-run-log.md` (Configuration history section)
- Status: Fixed in commit `67845a2` — spawn command now prepends `CLAUDE_CODE_EFFORT_LEVEL=max` inline AND passes `--effort max` on the CLI.

**`verify_citations.py` always returns True on <50% verified:**
- Symptoms: When fewer than 50% of citations are verified, the script prints "WARNING: Less than 50% citations verified" but returns `True` (exit code 0), meaning the caller treats this as a PASS. A report where most citations cannot be verified will pass the validation loop.
- Files: `skill/scripts/verify_citations.py` (lines 377-382)
- Trigger: Any report where DOIs are missing or URLs return non-200 responses.
- Fix approach: Change the <50% path to return `False` (or accept a configurable threshold argument). Add a `--min-verified-pct` flag.

---

## Security Considerations

**`--dangerously-skip-permissions` on all spawned subprocesses:**
- Risk: Every `claude -p` subprocess spawned during background research runs with `--dangerously-skip-permissions`. This grants the subprocess (and all its sub-agents) unrestricted file system access and the ability to execute arbitrary shell commands without confirmation. A malicious or hallucinating research query that produces a bash command in the pipeline could execute it.
- Files: `skill/SKILL.md` (spawn command, line 181), `skill/reference/methodology.md` (Step 6 retry spawn)
- Current mitigation: The subprocess executes a well-defined research prompt. Malicious inputs would need to break through the research brief template. No known exploit path.
- Recommendations: Review whether specific tool permissions can be allowlisted instead of skipping all permissions. Until then, treat the research subprocess as having root-equivalent access to the user's home directory.

**Research brief written to `/tmp` unencrypted:**
- Risk: The Research Brief (which may contain the user's research topic, prior context, and any sensitive constraints) is written to `/tmp/research-brief-${UUID8}.txt` before spawning. `/tmp` on macOS is world-readable to other processes running as the same user.
- Files: `skill/SKILL.md` (lines 169-175)
- Current mitigation: UUID8 in the filename makes it non-guessable. macOS `/tmp` is per-user in practice (`/private/var/folders/.../T/`), reducing but not eliminating exposure.
- Recommendations: Write to a tempfile created with `mktemp` and mode 600, or pass the brief via stdin instead of a temp file.

---

## Performance Bottlenecks

**Synchronous parallel sub-agent spawn blocks entire pipeline:**
- Problem: All 4 Phase 3 retrieval sub-agents are spawned in a single synchronous Task tool message. The parent blocks until ALL complete. The slowest agent sets wall-clock time for the entire phase.
- Files: `skill/reference/methodology.md` (Phase 3 Step 2)
- Cause: Task tool's synchronous parallel path has no individual agent timeout. One slow agent (network latency, difficult site, or hang) delays all downstream phases.
- Improvement path: The ADR-001 `claude -p` subprocess architecture resolves this — each subprocess gets an individual `timeout` wrapper and the parent polls for output files, allowing partial results to flow through even if one agent fails.

**`verify_citations.py` makes sequential HTTP requests with 0.5s sleep between each:**
- Problem: Citation verification processes each bibliography entry one at a time with a mandatory `time.sleep(0.5)` between requests. For a 40-source report (v12 had 80 sources), this means 40+ seconds of wall-clock time just for rate-limiting sleep, plus actual HTTP latency.
- Files: `skill/scripts/verify_citations.py` (line 331)
- Cause: Sequential processing with conservative rate limiting.
- Improvement path: Use `concurrent.futures.ThreadPoolExecutor` for parallel HTTP requests with a shared rate limiter. The 0.5s sleep could be removed or reduced to a per-domain limiter rather than a global one.

---

## Fragile Areas

**Effort propagation chain — three independent failure points:**
- Files: `skill/SKILL.md` (spawn command), `skill/reference/methodology.md` (EFFORT REINFORCEMENT clauses), `notes/adr/001-task-tool-vs-claude-p-subagents.md`
- Why fragile: The lead agent's max effort requires three mechanisms to work simultaneously: (1) `CLAUDE_CODE_EFFORT_LEVEL=max` prepended inline on the spawn command, (2) `--effort max` CLI flag on the spawn command, and (3) EFFORT REINFORCEMENT prompt-level clauses in every sub-agent prompt. If any one of these changes (e.g., a future Claude Code version changes env var precedence, or a sub-agent prompt is modified without the EFFORT REINFORCEMENT clause), effort silently degrades with no error. The SKILL.md comment on line 202 explicitly notes that Sonnet's behavior with `effort=max` (mapping to `high`) has "not been independently verified against an official Anthropic doc."
- Safe modification: Whenever editing sub-agent prompts in `skill/reference/methodology.md` (Phases 3, 6, 7.5) or `skill/reference/continuation.md`, verify the EFFORT REINFORCEMENT clause is present at the end. Never remove the inline env var or `--effort max` from spawn commands.
- Test coverage: No automated test. Only observable at runtime via `/model` inside Claude Code.

**"ultrathink" keyword triggers cosmetic prompt injection:**
- Files: `skill/SKILL.md`, `skill/reference/methodology.md` (any file loaded into session context)
- Why fragile: The literal word "ultrathink" in any loaded file triggers a system-level text injection ("requested reasoning effort level: high") whenever it appears in the message stream. This is cosmetic and does not downgrade actual effort, but it pollutes the output stream and can confuse log parsing that looks for effort-level markers.
- Safe modification: Do not use the word "ultrathink" in any comments, docstrings, documentation, or log messages in files that get loaded into session context. If referencing the phenomenon, use a different spelling (e.g., "ultra-think" or "the banned keyword").

**Relative paths in SKILL.md break if skill directory structure changes:**
- Files: `skill/SKILL.md` (lines 61-75), `skill/reference/methodology.md`, `skill/reference/report-assembly.md`, `skill/reference/html-generation.md`, `skill/reference/quality-gates.md`, `skill/reference/continuation.md`
- Why fragile: SKILL.md uses relative paths like `./reference/methodology.md`, `./templates/report_template.md`, and `scripts/validate_report.py`. These resolve from SKILL.md's own location (`~/.claude/skills/deep-research/`). Moving any referenced file without updating SKILL.md breaks all phase instruction loading silently — the skill proceeds with no methodology reference.
- Safe modification: Never move files within `skill/` without updating all cross-references in SKILL.md. The `tools/deploy-to-live.sh` rsync preserves directory structure, but manual file reorganizations would not trigger any warning.

**`research-tasks.json` registry lacks schema enforcement:**
- Files: `skill/reference/methodology.md` (Task Registration section, lines 122-148)
- Why fragile: The pipeline is instructed to write task registration entries to `~/.claude/research-tasks.json`, but there is no schema validation, no deduplication check, and no cleanup of old `in_progress` entries from interrupted runs. A killed pipeline leaves orphaned `in_progress` entries. Over time this file accumulates stale entries with no maintenance instruction.
- Safe modification: Manually inspect `~/.claude/research-tasks.json` to clean up stale entries after killed runs. There is no automated cleanup.

---

## Scaling Limits

**Context compaction as an uncontrolled variable:**
- Current capacity: The pipeline runs in a single `claude -p` session with no `--max-turns` limit. Each phase adds to the session's context.
- Limit: Context compaction can trigger mid-pipeline, destroying unsaved intermediate results. Compaction frequency increases with session length (deep mode: 10 phases, UltraDeep: 10+ phases with extended iterations).
- Scaling path: The checkpoint/resume protocol (`_checkpoint.json`) provides the main defense. Emergency synthesis protocol (Level 1-3 in methodology.md) provides graceful degradation. Neither fully prevents data loss if compaction hits between a search result arriving and the write-after-search file write.

**No parallelism between pipeline phases:**
- Current capacity: Phases execute sequentially. UltraDeep mode (10+ phases) runs as a single linear pipeline.
- Limit: No mechanism to parallelize independent phases (e.g., CRITIQUE and initial PACKAGE generation could theoretically overlap).
- Scaling path: Not planned. Sequential execution is intentional to maintain context continuity across phases.

---

## Dependencies at Risk

**Task tool hang bug (upstream Claude Code issues #17147, #37521):**
- Risk: The known Task tool synchronous parallel spawn hang is an upstream Claude Code bug, not something fixable in this skill. It has no ETA for resolution.
- Impact: Until ADR-001's architecture switch is implemented, every deep-mode run has ~20% chance of hanging.
- Migration plan: Implement ADR-001's `claude -p` subprocess architecture. This is the currently approved plan (see `notes/adr/001-task-tool-vs-claude-p-subagents.md` update section).

**`substack.com` classified as LOW authority in `source_evaluator.py`:**
- Risk: `source_evaluator.py` `LOW_AUTHORITY_INDICATORS` list includes `substack.com`, which incorrectly treats high-quality expert newsletters (e.g., academic researchers publishing on Substack) as low authority. Many credible technical authors publish primarily on Substack.
- Files: `skill/scripts/source_evaluator.py` (line 67)
- Impact: Expert Substack sources receive domain_score=40 (same as blogspot.com), pulling their overall credibility score down materially, potentially causing them to be deprioritized or flagged for extra verification.
- Migration plan: Move `substack.com` from `LOW_AUTHORITY_INDICATORS` to a neutral "unknown domain" path (score=55), or adopt a URL-path-based heuristic to distinguish author-named subdomain Substacks from spammy ones.

**WeasyPrint PDF generation dependency undocumented in requirements.txt:**
- Risk: `skill/reference/html-generation.md` and `skill/reference/weasyprint_guidelines.md` assume WeasyPrint is installed and functional. `skill/requirements.txt` lists only Python packages for the validation scripts, not WeasyPrint. WeasyPrint requires native system libraries (Pango, Cairo, GDK-PixBuf) that are not managed by pip.
- Files: `skill/reference/weasyprint_guidelines.md`, `skill/requirements.txt`
- Impact: A user on a fresh machine who runs `pip install -r requirements.txt` will have the Python scripts working but PDF generation will silently fail when `md_to_html.py` or the pipeline attempts WeasyPrint conversion.
- Migration plan: Document WeasyPrint installation requirements in the skill README or in `html-generation.md`; add an optional `weasyprint` entry to `requirements.txt`.

---

## Missing Critical Features

**No timeout mechanism for sub-agents (current architecture):**
- Problem: Phase 3, 6, and 7.5 sub-agents have no timeout. A hung sub-agent blocks the parent indefinitely. The only recovery is external kill signal.
- Blocks: Reliable deep-mode operation. Until ADR-001's subprocess architecture is implemented, the ~20% hang rate is unavoidable.

**No automated test suite:**
- Problem: `tests/` contains only fixtures (sample report files). There is no test runner, no CI configuration, and no automated test for any of the Python scripts in `skill/scripts/`. The README confirms "No automated test runner."
- Files: `tests/` directory, `CLAUDE.md` (tests section)
- Blocks: Confident refactoring of `validate_report.py`, `verify_citations.py`, `source_evaluator.py`, or `md_to_html.py`. Any change risks silent regression.

---

## Test Coverage Gaps

**Python validation scripts (`validate_report.py`, `verify_citations.py`):**
- What's not tested: All validation logic — bibliography parsing, citation gap detection, truncation pattern detection, DOI resolution, URL accessibility checks, hallucination pattern detection.
- Files: `skill/scripts/validate_report.py`, `skill/scripts/verify_citations.py`
- Risk: A regex change in `_check_bibliography()` or `_check_citations()` that introduces a false-positive or false-negative would go undetected until it silently passes a bad report.
- Priority: High — these scripts are the quality gate for every delivered report.

**`source_evaluator.py` domain classification:**
- What's not tested: Domain authority tier lookup, recency scoring curve, bias detection heuristics.
- Files: `skill/scripts/source_evaluator.py`
- Risk: The credibility scoring directly affects which sources the pipeline prioritizes. An incorrect domain tier (e.g., substack misclassification noted above) would silently bias source selection across all research runs.
- Priority: Medium.

**End-to-end pipeline test:**
- What's not tested: A full quick-mode or standard-mode run from spawn to final report with known-good fixtures, validating that all phases complete and the output passes `validate_report.py` and `verify_citations.py`.
- Risk: Integration bugs between phases (e.g., checkpoint format change breaking resume, bibliography extraction regex failing on a new report format) would only be caught in real research runs.
- Priority: High — the test-run-log.md is the current substitute for this, but it requires manual execution.

---

*Concerns audit: 2026-04-10*
