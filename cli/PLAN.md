# deep-research-cli — Implementation Plan

**Status:** living checklist. Update boxes as work progresses.

**Last updated:** 2026-05-03

**Plan version:** v2 (revised after first review pass; addresses 5 Critical + 9 Important + 6 Minor findings — see `notes/PLAN-REVIEW-1.md` if archived)

---

## Context-compaction-recovery note (READ FIRST after any compaction)

If you are picking this up post-compaction, here is the minimum context to resume safely:

- The user wants a deterministic CLI engine that reproduces the deep-research methodology from `../skill/` but with code as the orchestrator and AI calls only for genuinely open-ended judgment. The existing `../skill/` directory MUST NOT be modified — this is a separate, parallel artifact.
- The CLI is invoked stateless: `deep-research <topic> --mode deep ...`, runs to completion, exits. State persists to disk between invocations (resumable).
- Two providers must work: Claude Agent SDK (default; uses Claude Code subscription quota) and OpenCode CLI (for OpenRouter / any OpenAI-compatible endpoint). The provider abstraction is mandatory from day 1.
- After EVERY non-trivial feature change, dispatch `superpowers:code-reviewer` and iterate to zero Critical/Important findings before moving on. This rule lives both here and in `~/.claude/CLAUDE.md` § Mandatory Review Gates. Do NOT skip the gate to save time — context will compact and the next future-self needs the gate to ensure quality compounded over many sessions.
- E2E test runs ONCE at the very end: deep mode on "how to improve this deep-research-cli project," output saved to `cli/test-runs/v1-baseline/`, committed.
- Reviewer choice is locked to **`superpowers:code-reviewer`** for the whole project. Do NOT switch reviewers mid-stream.
- The new CLI uses **fresh OUTPUT_DIRs only** — it does not resume directories created by the old skill (avoids cross-tool schema drift; see C2 resolution under "Decisions locked from review-1").

To resume: `cat cli/PLAN.md` → find the first unchecked box in the Milestones section → continue from there.

---

## Goals

1. **Reliability:** every phase runs in code; AI calls are scoped, atomic, and verified; nothing hidden behind LLM "trust me" claims.
2. **Visibility:** every state transition logged; every artifact written atomically with explicit ordering.
3. **Universal model support:** Claude Agent SDK (default) and OpenCode CLI (OpenRouter) interchangeable via `--provider` flag.
4. **Methodology preserved within v1 scope:** all 11 phases (0, 1, 2, 3, 4, 4.5, 5, 6, 7, 7.5, 8) implemented. Phase 7.5 covers Steps 1-4 (atomic claim verification, DRA flagging, adversarial refutation). **Phase 7.5 Steps 5 (Temporal Supersession) and Step 6 (Verifier-Guided Retry) are deferred to v2** — see "Out of scope for v1."
5. **No-touch on existing skill:** `../skill/` and `~/.claude/skills/deep-research/` stay exactly as they are.

---

## Decisions locked from review-1 (do not re-litigate)

These are the explicit decisions made in response to review-1 findings:

- **C1 (root .gitignore carve-outs):** Done — root `.gitignore` carves out `cli/*.json`, `cli/launcher-skill/**/*.json`, and `cli/test-runs/v1-baseline/**/*.json`. Verify before any `git add`.
- **C2 (`_DONE` schema + cross-tool compat):** New CLI declares `OUTPUT_DIR` schema independence — it does NOT attempt to resume old-skill directories. `_DONE` schema is locked at:
  ```
  uuid8=<8 chars>
  finished_at=<ISO 8601 UTC>
  phase_completed=PACKAGE
  cli_version=<package.json version>
  ```
  Any prior tool's `_DONE` from `~/.claude/skills/deep-research/scripts/atomic_checkpoint.py` is treated as untrusted; the new CLI refuses to operate on a directory containing one.
- **C3 (Phase 7.5 Step 5/6 deferral):** Step 5 (Temporal Supersession) and Step 6 (Verifier-Guided Retry) are out of v1 scope; documented in v1-baseline E2E `Limitations` section. Goal #4 reflects this scoping.
- **C4 (`fanOut` per-sub-agent disk writes):** `SubAgentSpec.outputFile` is required; the provider MUST write each sub-agent's text result to that path BEFORE the `fanOut` promise resolves. This preserves Granularity 2 resume.
- **C5 (cli.ts coverage):** `src/cli.ts` is a 1-line shim that calls `runCli(argv)` from `src/cli-impl.ts`. Coverage exclusion only applies to the shim; `cli-impl.ts` is fully tested.
- **I1 (Python tooling path):** HTML/PDF generation calls `~/.claude/skills/deep-research/scripts/md_to_html.py` (deployed canonical path). The new CLI documents a hard runtime dependency on the existing skill being deployed.
- **I2 (mode-mapping consistency):** M6 includes a unit test that asserts our mode→phase mapping matches the table in `../skill/SKILL.md` line-by-line.
- **I3 (build freshness in M21):** M21 begins with `npm run build` and `git diff cli/launcher-skill/scripts/cli.js`; the bundle MUST be current at commit time.
- **I4 (OpenCode model + creds):** `JudgmentRequest.model: string` is required (the orchestrator passes the per-phase model name). OpenCode provider reads `OPENROUTER_API_KEY` (or whatever provider key OpenCode is configured for) from env.
- **I5 (registry path collision):** New CLI writes to `~/.claude/research-tasks-cli.json`, separate from the old skill's `~/.claude/research-tasks.json`. No mutex coordination required between tools.
- **I6 (smoke-test gating):** Single env var `DEEP_RESEARCH_LIVE_TESTS=1` enables both Claude and OpenCode smoke tests. Smoke tests are bounded (single tiny prompt; documented cost ≤ $0.01 per smoke).
- **I7 (zod-based parsing):** All structured outputs from AI calls and all parsed claim data go through zod schemas with `.parse()` (throws on malformed). No defensive `as` casts.
- **I8 (provider response validation):** `callJudgment` results are validated via zod where structure is expected. Parse failure → retry once; second failure → typed error logged into provenance + bubbled to orchestrator.
- **I9 (launcher skill triggering boundary):** New launcher skill name = `deep-research-cli`. Trigger phrasing requires explicit signal: "deterministic deep research", "cli deep research", "use the deep-research cli skill", or operator typing the slash command. The existing `deep-research` skill remains the default for ambiguous "deep research" requests.

---

## Architecture (one-paragraph summary)

A TypeScript CLI bundles to a single `dist/cli.js`, deployed via build → `launcher-skill/scripts/cli.js`. Invocation: `node ~/.claude/skills/deep-research-cli/scripts/cli.js <topic> --mode deep --provider claude`. The CLI's `Orchestrator` is a deterministic state machine that walks the 11 phases. Each phase is a function that (a) does mechanical work in pure code (read inputs, write outputs, transitions, parsing) and (b) calls into an `AgentProvider.callJudgment()` for the sub-task that requires AI reasoning. State (artifacts, checkpoints, sub-agent progress, sentinels) is persisted to `OUTPUT_DIR` via atomic writes. On kill mid-pipeline, the next invocation runs Phase 0 RESUME DETECTION and resumes from the last completed phase boundary or sub-agent boundary. The provider abstraction means the same orchestrator runs against Claude Agent SDK or OpenCode CLI without any phase-level changes.

---

## Project structure

```
cli/
├── src/
│   ├── cli.ts                   1-line shim → calls runCli(process.argv) from cli-impl.ts
│   ├── cli-impl.ts              Testable runCli(argv): yargs parse → orchestrator
│   ├── orchestrator.ts          Phase state machine (deterministic, no LLM calls)
│   ├── config.ts                Resolved config (mode, provider, paths, flags)
│   ├── providers/
│   │   ├── types.ts             AgentProvider interface, JudgmentRequest, JudgmentResponse, SubAgentSpec, FanOutResponse
│   │   ├── factory.ts           selectProvider(config) → AgentProvider
│   │   ├── claude.ts            ClaudeAgentSdkProvider (uses @anthropic-ai/claude-agent-sdk)
│   │   ├── opencode.ts          OpenCodeCliProvider (spawns opencode binary as child process)
│   │   └── mock.ts              MockProvider for tests
│   ├── phases/
│   │   ├── registry.ts          Map<PhaseName, PhaseHandler>; mode-to-phase-list mapping
│   │   ├── types.ts             PhaseHandler signature, PhaseContext, PhaseResult
│   │   ├── phase00_resume.ts    Phase 0 RESUME DETECTION (no LLM)
│   │   ├── phase01_scope.ts     Phase 1 SCOPE (AI judgment)
│   │   ├── phase02_plan.ts      Phase 2 PLAN (AI judgment)
│   │   ├── phase03_retrieve.ts  Phase 3 RETRIEVE (4-lens fan-out)
│   │   ├── phase04_triangulate.ts
│   │   ├── phase04_5_outline.ts
│   │   ├── phase05_synthesize.ts
│   │   ├── phase06_critique.ts
│   │   ├── phase07_refine.ts
│   │   ├── phase07_5_verify.ts  Phase 7.5 — Steps 1-4 (citation verification + DRA + adversarial)
│   │   └── phase08_package.ts   Phase 8 PACKAGE with strict ordering + _DONE LAST
│   ├── state/
│   │   ├── checkpoint.ts        atomic write of _checkpoint.json
│   │   ├── subagent_progress.ts atomic write of _subagent_progress.json
│   │   ├── done.ts              atomic write of _DONE sentinel (locked schema — see C2)
│   │   ├── tasks_registry.ts    ~/.claude/research-tasks-cli.json updates (atomic)
│   │   ├── pause.ts             _STOP_REQUESTED / _STOP_NOW flag detection
│   │   ├── disk_truth.ts        reconciliation: scan OUTPUT_DIR for canonical artifacts (no legacy aliases — see C2)
│   │   └── atomic.ts            shared atomic-write primitive (tmp → fsync → rename)
│   ├── prompts/                 Markdown prompt templates for AI calls (loaded at runtime)
│   │   ├── phase01_scope.md
│   │   ├── phase02_plan.md
│   │   ├── phase03_retrieve_<lens>.md  (one per lens × 4 in deep, × 6 in ultradeep)
│   │   ├── phase04_triangulate.md
│   │   ├── ... (one per AI-call-bearing phase)
│   ├── types/
│   │   ├── brief.ts             ResearchBrief type + zod schema + parser
│   │   ├── mode.ts              Mode enum (quick/standard/deep/ultradeep) + phase lists + zod schema
│   │   ├── claim.ts             AtomicClaim, DraReason, VerificationStatus + zod schemas
│   │   └── source.ts            Source, CredibilityScore + zod schemas
│   └── util/
│       ├── log.ts               JSON-lines logger + pretty mode
│       ├── paths.ts             OUTPUT_DIR helpers, UUID8 generation
│       ├── errors.ts            error classes (RecoverableError, FatalError, ProviderParseError)
│       ├── slug.ts              topic-slug generator for filenames
│       └── deps.ts              runtime dependency check (resolve & validate ~/.claude/skills/deep-research/scripts/md_to_html.py exists at start)
├── tests/                       vitest unit tests (mirrors src/ layout)
├── scripts/
│   └── build.mjs                tsc lint + esbuild bundle + copy to launcher-skill/scripts/cli.js
├── launcher-skill/              Claude Code skill — invokes the CLI
│   ├── SKILL.md                 Triggers narrowly on explicit "deterministic" / "cli" deep research phrasing (see I9)
│   ├── scripts/
│   │   └── cli.js               COMMITTED. Built artifact, freshness gated by M21
│   └── references/              Optional support docs loaded by Claude
│       └── usage.md
├── test-runs/
│   └── v1-baseline/             E2E test output (committed)
├── PLAN.md                      THIS file
├── README.md
├── package.json
├── tsconfig.json
├── tsconfig.test.json
├── vitest.config.ts
├── .gitignore
└── .prettierrc.json
```

---

## Build & deploy convention

- Source repo: `cli/` lives inside `deep-research-skill/` (parallel to existing `skill/`)
- TypeScript build output: `cli/dist/` (gitignored; produced by `npm run build`)
- Skill bundle path: `cli/launcher-skill/scripts/cli.js` — produced by `scripts/build.mjs` copying from `cli/dist/cli.js`. **This file IS committed** so a fresh clone can deploy the skill without running npm install.
- Deployed location: `~/.claude/skills/deep-research-cli/` — populated by `tools/deploy-cli-to-live.sh` (rsync from `cli/launcher-skill/`)
- Worker invocation: `node ~/.claude/skills/deep-research-cli/scripts/cli.js <args>`

Why `scripts/` not `dist/` for the deployed skill: per skill-creator skill conventions, Claude Code skills bundle executable code under `scripts/`. Following the convention keeps the skill reviewable by skill-creator workflows and consistent with user expectations.

**Runtime dependency on the existing skill (per I1):** Phase 8 generates HTML/PDF via subprocess to `~/.claude/skills/deep-research/scripts/md_to_html.py`. The new CLI requires the existing `deep-research` skill to be deployed alongside it. M0.5 adds a startup check; M16's launcher SKILL.md documents the requirement; M20's E2E test asserts both skills are deployed.

---

## Provider abstraction (mandatory v1 contract)

```typescript
// src/providers/types.ts
import { z } from "zod/v4";

export interface AgentProvider {
  /** One-shot call: prompt → text response. Used for SCOPE, PLAN, TRIANGULATE, etc. */
  callJudgment(req: JudgmentRequest): Promise<JudgmentResponse>;

  /** Fan-out call: spawn N sub-agents in parallel.
   *  Per C4 — each sub-agent's text MUST be written to its `outputFile` BEFORE
   *  this promise resolves, so a kill mid-batch leaves Granularity-2-resumable
   *  partial state on disk. */
  fanOut(req: FanOutRequest): Promise<FanOutResponse>;

  /** Cleanup hook (close subprocesses, flush logs). */
  close(): Promise<void>;
}

export interface JudgmentRequest {
  systemPrompt: string;
  userPrompt: string;
  /** Specific model name. Provider-defined values:
   *  - claude: "opus" | "sonnet" | "haiku" | full ID like "claude-opus-4-7"
   *  - opencode: full OpenRouter model ID like "deepseek/deepseek-chat-v4"
   *  Required (no provider default — orchestrator chooses per phase). */
  model: string;
  /** Hard cap on output tokens; provider chooses sane default if omitted. */
  maxTokens?: number;
  /** Effort hint; provider may ignore or map. */
  effort?: "low" | "medium" | "high" | "max";
  /** Allowed tool names (web search, file read, etc.); empty = no tools. */
  tools?: string[];
  /** Optional zod schema. If provided, the response text is parsed against
   *  it; on parse failure the provider retries once (per I8) before throwing
   *  ProviderParseError. */
  responseSchema?: z.ZodType<unknown>;
}

export interface JudgmentResponse {
  text: string;
  /** Pre-validated structured payload if responseSchema was provided. */
  parsed?: unknown;
  /** Tokens consumed. */
  usage: { input: number; output: number };
  /** Wall-clock duration in ms. */
  durationMs: number;
}

export interface FanOutRequest {
  agents: SubAgentSpec[];
  /** Max wall-clock for the slowest agent. */
  timeoutMs: number;
}

export interface SubAgentSpec {
  /** Stable identifier; appears in output filename. */
  name: string;
  systemPrompt: string;
  userPrompt: string;
  /** Per-phase model selection (per I4). */
  model: string;
  /** Tools the sub-agent may use. */
  tools?: string[];
  /** REQUIRED — provider MUST write the sub-agent's text result to this
   *  absolute path atomically BEFORE fanOut's promise resolves. */
  outputFile: string;
  /** Optional zod schema for response validation (per I7/I8). */
  responseSchema?: z.ZodType<unknown>;
}

export interface FanOutResponse {
  results: SubAgentResult[];
}

export interface SubAgentResult {
  name: string;
  status: "ok" | "error" | "timeout";
  /** Path that was written (matches the input outputFile). */
  outputFile: string;
  /** Whether outputFile is on disk and non-empty. */
  fileWritten: boolean;
  /** Empty if status != "ok". */
  text: string;
  parsed?: unknown;
  error?: string;
  usage?: { input: number; output: number };
  durationMs: number;
}
```

The Claude Agent SDK provider implements this via `query()` calls and `AgentDefinition` for sub-agents. The OpenCode CLI provider implements this via child-process invocations. The orchestrator and phase handlers depend ONLY on this interface — they have zero direct knowledge of either backend.

**Per-sub-agent disk-write contract (per C4):** Inside `fanOut`, after each sub-agent finishes, the provider's wrapper code MUST `await writeAtomic(spec.outputFile, result.text)` BEFORE marking that sub-agent done. If the parent process is SIGKILLed mid-batch, all completed sub-agents have their files on disk; only in-flight sub-agents' work is lost. This is the contract the orchestrator's Phase 3/6/7.5 reconciliation logic depends on.

---

## Phase 8 strict ordering rule (mandatory — single canonical sequence)

**Rationale:** `_DONE` must be the last file written so that resume detection is reliable — its presence proves Phase 8 completed and the report set is committed. Any phase that writes after `_DONE` would create a window where `_DONE` exists but the report set is incomplete.

This is the single canonical Phase 8 ordering. **M14 implements EXACTLY these six steps in EXACTLY this order**; M19's cross-cutting audit verifies no phase reorders or inserts writes after step 6:

1. Write report markdown (`research_report_<DATE>_<slug>.md`)
2. Write provenance sidecar (`research_report_<DATE>_<slug>.provenance.md`) — provenance is finalized from VERIFY/REFINE outputs and does not depend on HTML/PDF artifacts existing
3. Generate HTML/PDF — subprocess to `~/.claude/skills/deep-research/scripts/md_to_html.py` (deployed canonical path; per I1)
4. Update `~/.claude/research-tasks-cli.json` to `status: complete` (atomic; separate from old skill's registry per I5)
5. Update `_checkpoint.json` to `phase_completed: PACKAGE, status: complete` (atomic)
6. Write `_DONE` sentinel (atomic, FINAL — locked schema per C2)

If killed between 5 and 6, Phase 0 RESUME DETECTION on next invocation detects `status: complete` + `_DONE` absent and writes the missing `_DONE` (no re-run).

If killed between 1 and 2, Phase 0 sees the report markdown but no provenance sidecar; reconciliation re-runs Phase 8 from step 1 (report write is idempotent — the AI-built sections are deterministic given the same Phase 7 output). Same logic applies for kills at any earlier step.

---

## Mode → phase list mapping

```
quick     : [0, 1, 3, 8]
standard  : [0, 1, 2, 3, 4, 4.5, 5, 8]
deep      : [0, 1, 2, 3, 4, 4.5, 5, 6, 7, 7.5, 8]
ultradeep : same as deep, but per-phase iteration counts ramp up:
            - Phase 3 lens count: 4 → 6 (add scientific, regulatory)
            - Phase 7.5 verifier count: 3+1 → 5+1 (3 or 5 standard verifiers + 1 adversarial)
            - Phase 7.5 loop-back budget: 2 → 3
            - Phase 6 gap-fill: 1 → 2 sub-agents
```

Iteration knobs are passed to phase handlers via `PhaseContext.modeIntensity`. **Per I2: M6 includes a unit test asserting this mapping line-by-line against `../skill/SKILL.md` Workflow Overview table.**

---

## Mandatory review gate (embedded — DO NOT SKIP)

After every milestone marked with **🔒 REVIEW GATE** below, dispatch `superpowers:code-reviewer` on the changed files with this prompt template:

```
Review the recent implementation of <milestone name>. Focus on:
- Bug correctness vs. the methodology in ../skill/reference/methodology.md
- Atomicity / concurrency / race conditions in state writes
- Type safety and error-handling completeness
- Test coverage for the unit-testable surface (E2E is out of scope per user direction)
- Cross-references to other modules
- Compliance with the C1-C5 / I1-I9 decisions locked in PLAN.md

Threat model: single-user CLI, accidental misbehavior. Skip adversarial-input
hardening (per ../CLAUDE.md). Use your native severity rubric.
```

Iterate until **zero Critical AND zero Important findings**, OR Important findings explicitly deferred with rationale documented in commit message. Then mark the gate ✅ and proceed to the next milestone.

If the reviewer raises an Important finding that you disagree with, do NOT silently override. Document the reason for rejection in the commit message and tag with the convention `[reviewer-deferred: <one-line reason>]`.

---

## Milestones (granular checklist — keep this current)

### M0 — Project skeleton (✅ done)

- [x] cli/ directory tree created
- [x] package.json with deps (Claude Agent SDK 0.2.126, yargs, zod 4, vitest, esbuild, prettier, typescript). Note: zod ^4.0.0 is required by the SDK's peer-dep declaration; v3 will fail npm install.
- [x] tsconfig.json (strict mode, ESM, Node 22+, NodeNext resolution)
- [x] tsconfig.test.json (extends base for test paths)
- [x] vitest.config.ts (node env, 5s timeout, v8 coverage; exclusion limited to src/cli.ts shim per C5)
- [x] .gitignore (dist/, node_modules/, test-runs/* except v1-baseline)
- [x] .prettierrc.json (semi, trailing commas, double quotes, 100-col)
- [x] scripts/build.mjs (type-check + esbuild bundle + copy to launcher-skill/scripts/)
- [x] README.md
- [x] npm install runs cleanly with zod v4 satisfying SDK peer dep

### M0.5 — Pre-flight gitignore + runtime-dep verification (NEW per C1, I1)

- [x] Root `.gitignore` carve-outs added: `!cli/package.json`, `!cli/package-lock.json`, `!cli/tsconfig.json`, `!cli/tsconfig.test.json`, `!cli/.prettierrc.json`, `!cli/launcher-skill/**/*.json`, `!cli/test-runs/v1-baseline/**/*.json`. Verify with `git check-ignore` before any `git add`.
- [ ] `src/util/deps.ts` — at CLI startup, verify `~/.claude/skills/deep-research/scripts/md_to_html.py` exists. Surface clear error if missing.
- [ ] vitest test that the deps check throws when path is bogus
- [ ] 🔒 REVIEW GATE on .gitignore fix + deps.ts

### M1 — Plan written + reviewed

- [x] PLAN.md drafted (this file, v2)
- [x] Plan reviewed via `superpowers:code-reviewer` (review-1: 5 Critical, 9 Important, 6 Minor)
- [x] Plan revised per review-1 (this v2 document)
- [ ] Plan re-reviewed (review-2) until zero Critical / zero Important 🔒 REVIEW GATE

### M2 — State helpers (atomic_checkpoint TS port)

- [ ] `src/state/atomic.ts` — atomic-write primitive (tmp → fsync → rename via Node fs/promises)
- [ ] `src/state/checkpoint.ts` — write_checkpoint
- [ ] `src/state/subagent_progress.ts` — write_subagent_progress
- [ ] `src/state/done.ts` — write_done with locked schema (per C2): `uuid8`, `finished_at`, `phase_completed`, `cli_version`
- [ ] `src/state/disk_truth.ts` — Disk-Truth Reconciliation (canonical artifacts only — no legacy aliases per C2)
- [ ] `src/state/pause.ts` — pause-flag detection
- [ ] `src/state/tasks_registry.ts` — `~/.claude/research-tasks-cli.json` updates (atomic; mkdir-lock for concurrency between concurrent CLI runs only — no coordination with old skill registry per I5)
- [ ] vitest tests covering: atomic guarantee under simulated kill, idempotency, schema validation, *.tmp cleanup, kill-mid-rename, schema rejection of foreign `_DONE` files (C2 enforcement)
- [ ] `npm run build:tsc` clean (no type errors)
- [ ] `npm test` for state/ — all green
- [ ] 🔒 REVIEW GATE on `src/state/` + `tests/state/`

### M3 — Provider abstraction

- [ ] `src/providers/types.ts` — `AgentProvider` interface + request/response shapes per the locked v2 spec above (includes `model` on requests, `outputFile` on SubAgentSpec, optional `responseSchema` for zod validation)
- [ ] `src/providers/mock.ts` — MockProvider for tests (returns canned responses, tracks calls, supports per-sub-agent disk writes)
- [ ] `src/providers/factory.ts` — `selectProvider(config)` → AgentProvider
- [ ] vitest tests on factory (claude/opencode/mock selection)
- [ ] vitest tests on MockProvider's per-sub-agent disk-write contract (C4 enforcement)
- [ ] 🔒 REVIEW GATE on `src/providers/types.ts`, `factory.ts`, `mock.ts`

### M4 — Claude Agent SDK provider

- [ ] `src/providers/claude.ts` — implements `AgentProvider` via `query()` from @anthropic-ai/claude-agent-sdk
  - [ ] `callJudgment` → single `query()` call, collect text response, capture usage. If `responseSchema` provided, parse; on parse failure retry once (per I8); second failure throws `ProviderParseError`.
  - [ ] `fanOut` → use `AgentDefinition` map for parallel sub-agent dispatch. **For each sub-agent's completion, write its text to `spec.outputFile` atomically BEFORE marking the result done** (per C4). Wait all then return aggregated results.
  - [ ] `close()` → cleanup
  - [ ] Honor `effort` levels (mapping: max → "max", others 1:1)
  - [ ] Honor `model` field (passed to SDK as model alias or full ID)
- [ ] vitest tests with mocked SDK (`vi.mock('@anthropic-ai/claude-agent-sdk')`) covering: callJudgment success, callJudgment with schema parse failure → retry, fanOut writes per-sub-agent file before resolving, fanOut with one timing-out sub-agent (others succeed and get on disk)
- [ ] Smoke test gated behind `DEEP_RESEARCH_LIVE_TESTS=1` (per I6) — single tiny prompt, documented cost ≤ $0.01
- [ ] 🔒 REVIEW GATE on `src/providers/claude.ts` + tests

### M5 — OpenCode CLI provider

- [ ] Document install: `brew install opencode-ai/tap/opencode` or via [their installer](https://opencode.ai/docs/install/). M16's usage.md has the canonical install instructions.
- [ ] Document creds: provider checks env vars in this priority order:
  1. `OPENROUTER_API_KEY` (default; OpenRouter)
  2. `OPENAI_API_KEY` (if user routes through openai/* models)
  3. Whatever opencode binary itself reads from `~/.config/opencode/config.json`
- [ ] `src/providers/opencode.ts` — implements `AgentProvider` via child_process spawn
  - [ ] `callJudgment` → spawn `opencode run --model <model> --json` with prompt via stdin; parse JSON response; honor `responseSchema` retry-once-then-fail policy
  - [ ] `fanOut` → spawn N child processes in parallel via Promise.all. **Each child writes its result to `spec.outputFile` BEFORE Promise.all resolves** (per C4 — same contract as Claude provider).
  - [ ] `close()` → kill any lingering children
  - [ ] Honor `effort` (map to opencode's reasoning flag if available, else log warning)
- [ ] Pin opencode version range in M16 docs (note: untested by me end-to-end since I lack OpenRouter key — gate behind `DEEP_RESEARCH_LIVE_TESTS=1` env var)
- [ ] vitest tests with mocked spawn (`vi.spyOn(child_process, 'spawn')`) covering: success, failure, timeout, missing binary, missing API key
- [ ] 🔒 REVIEW GATE on `src/providers/opencode.ts` + tests

### M6 — Phase orchestrator (no LLM calls)

- [ ] `src/orchestrator.ts` — pure deterministic state machine
  - [ ] Reads phase list from mode mapping
  - [ ] For each phase: pause-check → run handler → write checkpoint → advance
  - [ ] Handles loop-backs (Phase 7.5 → Phase 7) via budget counter
  - [ ] Surfaces phase progress via logger (`[Phase NAME] ...`)
  - [ ] Catches phase errors; classifies as recoverable (retry once) vs. fatal (exit non-zero)
- [ ] `src/phases/registry.ts` — Map<PhaseName, PhaseHandler>
- [ ] `src/phases/types.ts` — PhaseHandler signature + PhaseContext + PhaseResult
- [ ] vitest tests with mocked phase handlers (verify ordering, loop-back, error handling)
- [ ] **Mode-mapping consistency test (per I2):** read `../skill/SKILL.md` at test time, parse the Workflow Overview table, assert our mode→phase mapping matches line-by-line. Fails the suite if `../skill/` evolves and we drift.
- [ ] 🔒 REVIEW GATE on orchestrator + phases/types + registry

### M7 — Phase 0 RESUME DETECTION (no LLM)

- [ ] `src/phases/phase00_resume.ts` — pure code
  - [ ] Detect pause flag → exit 2 if present
  - [ ] Detect `_DONE` → validate locked schema (C2); if matches our schema, exit 0; if foreign (e.g., from old skill), refuse to operate, exit 3 with clear message
  - [ ] Cleanup `*.tmp`
  - [ ] Read `_checkpoint.json` (optional)
  - [ ] Disk-Truth Reconciliation against canonical artifacts (no legacy aliases)
  - [ ] Completion-but-missing-sentinel reconciliation (write missing `_DONE`)
  - [ ] Update or create research-tasks-cli.json entry with `last_resumed_at`
  - [ ] Output: first incomplete phase
- [ ] vitest tests covering all reconciliation paths, including foreign-`_DONE` rejection
- [ ] 🔒 REVIEW GATE on phase 0

### M8 — Phases 1-2 (SCOPE + PLAN) — AI judgment

- [ ] `src/phases/phase01_scope.ts`
  - [ ] Loads `prompts/phase01_scope.md`, fills topic + brief context
  - [ ] Calls `provider.callJudgment(...)` with a `responseSchema` so output is parsed (per I7)
  - [ ] Atomically writes `phase01_scope.md` to OUTPUT_DIR
  - [ ] Updates checkpoint
- [ ] `src/phases/phase02_plan.ts` (analogous, with its own zod schema)
- [ ] `src/types/brief.ts` — ResearchBrief with zod schema
- [ ] `src/prompts/phase01_scope.md`, `src/prompts/phase02_plan.md` — drafted from existing methodology.md
- [ ] vitest tests with MockProvider returning canned outputs, plus malformed-output → retry → success path
- [ ] 🔒 REVIEW GATE on phases 1-2

### M9 — Phase 3 RETRIEVE — fan-out

- [ ] `src/phases/phase03_retrieve.ts`
  - [ ] Builds 4 lens prompts (academic, practitioner, critical, historical) — 6 in ultradeep
  - [ ] Calls `provider.fanOut(...)` with the lens sub-agents, each with its own `outputFile` path
  - [ ] Confirms each result's `fileWritten === true` before treating as complete (per C4)
  - [ ] Updates `_subagent_progress.json` after batch returns
  - [ ] Updates checkpoint
- [ ] `src/prompts/phase03_retrieve_<lens>.md` × 4-6 — drafted from methodology.md Phase 3 examples
- [ ] vitest tests covering: 4-lens dispatch, sub-agent failure handling, partial-batch resume (kill mid-batch → only completed lenses on disk), progress write
- [ ] 🔒 REVIEW GATE on phase 3

### M10 — Phases 4 + 4.5 (TRIANGULATE + OUTLINE REFINEMENT)

- [ ] `src/phases/phase04_triangulate.ts` — AI resolves contradictions
- [ ] `src/phases/phase04_5_outline.ts` — AI refines outline based on evidence
- [ ] Prompts drafted from methodology.md
- [ ] vitest tests
- [ ] 🔒 REVIEW GATE

### M11 — Phase 5 SYNTHESIZE

- [ ] `src/phases/phase05_synthesize.ts` — AI builds connected analysis
- [ ] Prompt drafted
- [ ] vitest tests
- [ ] 🔒 REVIEW GATE

### M12 — Phases 6 + 7 (CRITIQUE + REFINE)

- [ ] `src/phases/phase06_critique.ts` — red-team analysis + optional gap-fill sub-agents (1-2)
- [ ] `src/phases/phase07_refine.ts` — applies fixes
- [ ] Loop-back trigger logic (orchestrator decides; phase handler emits result.shouldLoopBack)
- [ ] vitest tests covering loop-back logic
- [ ] 🔒 REVIEW GATE

### M13 — Phase 7.5 VERIFY (Steps 1-4 only — Steps 5/6 deferred per C3)

- [ ] `src/phases/phase07_5_verify.ts`
  - [ ] Code parses claims from refined report (zod-based, deterministic — per I7)
  - [ ] AI verifies each claim via fan-out (3 verifiers + 1 adversarial; 5+1 in ultradeep)
  - [ ] Code aggregates DRA flags and computes overall verdict
  - [ ] Loop-back budget enforced (2 cycles; 3 in ultradeep)
  - [ ] Step 5 (Temporal Supersession) — **NOT IMPLEMENTED in v1**, recorded as `temporal_supersession: { skipped: "v2-deferred" }` in provenance
  - [ ] Step 6 (Verifier-Guided Retry) — **NOT IMPLEMENTED in v1**, recorded as `verifier_retry: { skipped: "v2-deferred" }` in provenance
- [ ] `src/types/claim.ts` — AtomicClaim, DraReason, VerificationStatus enums + zod schemas
- [ ] vitest tests covering: claim parsing (including malformed-input rejection), DRA aggregation, loop-back gate, deferred-step provenance fields
- [ ] 🔒 REVIEW GATE

### M14 — Phase 8 PACKAGE — strict ordering

- [ ] `src/phases/phase08_package.ts` — **MUST follow the canonical 6-step ordering in `## Phase 8 strict ordering rule` exactly:**
  - [ ] Step 1: AI writes report sections (executive summary, intro, main, synthesis, limitations, recommendations, bibliography, methodology appendix); code assembles final `research_report_<DATE>_<slug>.md` and atomically writes
  - [ ] Step 2: Code writes provenance sidecar (with `temporal_supersession.skipped: "v2-deferred"` and `verifier_retry.skipped: "v2-deferred"` per C3) — BEFORE HTML/PDF generation
  - [ ] Step 3: Code generates HTML+PDF via subprocess to `~/.claude/skills/deep-research/scripts/md_to_html.py` (deployed canonical path per I1; M0.5 deps check ensures this is available)
  - [ ] Step 4: Code updates research-tasks-cli.json → complete (per I5)
  - [ ] Step 5: Code updates `_checkpoint.json` → status: complete (atomic)
  - [ ] Step 6: Code writes `_DONE` LAST (atomic, locked schema per C2)
- [ ] vitest test: ordering invariant (mtime check on a real test directory) — verifies all 6 steps' files exist with monotonically-increasing mtimes ending at `_DONE`
- [ ] 🔒 REVIEW GATE on phase 8

### M15 — CLI entry + arg parsing

- [ ] `src/cli.ts` — 1-line shim (`runCli(process.argv).then(c => process.exit(c))`) — fully testable; coverage exclusion limited to this shim per C5
- [ ] `src/cli-impl.ts` — `runCli(argv: string[]): Promise<number>` — tested directly
  - [ ] yargs-based parser
  - [ ] Required: `<topic>` positional
  - [ ] Flags: `--mode <quick|standard|deep|ultradeep>` (default deep), `--provider <claude|opencode>` (default claude), `--output-dir <path>` (default `~/Documents/Research/<slug>_<date>_<uuid8>`), `--resume`, `--brief-file <path>`, `--model <name>` (default per provider)
  - [ ] Validates args, generates UUID8, prints cost forecast (with $10 ceiling warning per minor m1), invokes orchestrator, returns exit code
- [ ] `src/util/paths.ts`, `src/util/slug.ts`, `src/util/log.ts`, `src/util/errors.ts`
- [ ] vitest tests for arg parsing + slug generation + UUID8 uniqueness
- [ ] 🔒 REVIEW GATE on cli.ts + cli-impl.ts + util/

### M16 — Launcher skill

- [ ] `cli/launcher-skill/SKILL.md` — frontmatter + body
  - [ ] Skill name: `deep-research-cli`
  - [ ] Trigger description (per I9): triggers narrowly on explicit "deterministic deep research", "cli deep research", "use the deep-research-cli skill", or operator typing the slash command. Does NOT compete with the existing `deep-research` skill on default phrasing.
  - [ ] Body explains: skill's job is to invoke the CLI; lists invocation pattern; references usage.md for details
  - [ ] Documents runtime dependency on existing `deep-research` skill being deployed (per I1)
- [ ] `cli/launcher-skill/references/usage.md` — flag reference, examples, troubleshooting, OpenCode install + creds (per I4), cost ceiling warning (m1)
- [ ] `cli/launcher-skill/scripts/cli.js` produced by build pipeline (M17), committed
- [ ] 🔒 REVIEW GATE on launcher skill

### M17 — Build pipeline + deploy script

- [ ] `cli/scripts/build.mjs` — already drafted in M0; verify it works end-to-end
- [ ] `npm run build` produces `cli/dist/cli.js` + copies to `cli/launcher-skill/scripts/cli.js`
- [ ] `cli/launcher-skill/scripts/cli.js` is committed (it's a shipped artifact)
- [ ] `tools/deploy-cli-to-live.sh` — rsync `cli/launcher-skill/` → `~/.claude/skills/deep-research-cli/`
- [ ] Existing `tools/deploy-to-live.sh` is left untouched (it deploys the old skill; both run side-by-side)
- [ ] vitest test: build script exits 0; bundle exists; bundle is executable
- [ ] 🔒 REVIEW GATE on build.mjs + deploy-cli-to-live.sh

### M18 — Full unit test suite

- [ ] `npm test` runs the entire vitest suite cleanly
- [ ] Coverage report: at least 80% line coverage on src/state/, src/providers/factory.ts + mock.ts, src/orchestrator.ts, all phase handlers (with mocked provider). cli.ts shim excluded; cli-impl.ts included.
- [ ] **Coverage sanity check (per review-2 m-B):** assert `cli-impl.ts` appears in the coverage report and `cli.ts` does NOT — confirms M15's testable-shim refactor is wired correctly.
- [ ] No flaky tests (run 3× consecutively, all green)

### M19 — Final cross-cutting audit (per minor m5)

Not a file-by-file review (each milestone already had one). Instead, audit cross-cutting properties:

- [ ] Ordering invariants in Phase 8 across phases that write artifacts (no phase writes after `_DONE`; no phase reorders the strict 1-6 sequence)
- [ ] Error-handling consistency across providers (both surface ProviderParseError; both honor responseSchema retry policy)
- [ ] Prompt drift: every prompt in `src/prompts/` matches the methodology.md guidance for that phase (spot-check 4 prompts; reviewer can dive deeper if drift is found)
- [ ] Disk-Truth Reconciliation correctness across all fan-out phases (phase 3, 6 gap-fill, 7.5 verifiers all use the same outputFile pattern)
- [ ] Logging consistency: every phase emits `[Phase NAME]` start + end + token usage line in the same format
- [ ] No leakage: orchestrator and phase handlers do NOT directly import @anthropic-ai/claude-agent-sdk or invoke opencode subprocess (provider abstraction sealed)
- [ ] 🔒 REVIEW GATE — final

### M20 — End-to-end test

- [ ] Build the latest code: `npm run build`
- [ ] Verify the existing `~/.claude/skills/deep-research/scripts/md_to_html.py` is deployed (M14 prerequisite)
- [ ] Deploy to live: `tools/deploy-cli-to-live.sh`
- [ ] Run E2E:
  ```
  node ~/.claude/skills/deep-research-cli/scripts/cli.js \
    "How can the deep-research-cli project be improved? Focus on reliability, observability, and provider portability." \
    --mode deep \
    --provider claude \
    --output-dir cli/test-runs/v1-baseline
  ```
- [ ] Cost ceiling: if estimated or measured cost exceeds $10, pause and re-evaluate before commit (m1)
- [ ] Verify `_DONE` was written, all 11 phases (minus skipped 7.5 Steps 5/6) ran, report is reasonable
- [ ] Save logs alongside the output
- [ ] **Per review-2 s-B:** if any 7.5 verifier emitted `ProviderParseError` during the run, document specifically which claims were not verified in `LIMITATIONS.md`
- [ ] Document the v1 limitations (skipped 7.5 Steps 5/6, no browser fallback, any verifier parse-failures) in v1-baseline's `LIMITATIONS.md`

### M21 — Commit + push + ROADMAP update

- [ ] `npm run build` AGAIN as the first step (per I3 — ensure committed bundle is fresh)
- [ ] `git diff cli/launcher-skill/scripts/cli.js` — verify bundle reflects latest source
- [ ] Update `notes/ROADMAP.md` — add Stream C1 "Deterministic CLI Engine" with all milestones marked complete
- [ ] Stage all artifacts (cli/, launcher-skill/, test-runs/v1-baseline/, ROADMAP update)
- [ ] Comprehensive commit message including reviewer-deferred notes (any Important findings deliberately rejected during the review loops)
- [ ] `git push origin main`
- [ ] Verify clean tree, local matches remote

---

## Token / cost estimates (planning math)

| Mode | Phases | LLM calls | Estimated tokens | Estimated cost (max-plan) |
|---|---|---|---|---|
| quick | 4 | 4-5 | ~50K | <$1 |
| standard | 8 | 9-12 | ~250K | $1-3 |
| deep | 11 | 15-25 (counting fan-outs) | ~400-700K | $3-7 |
| ultradeep | 11 (deeper) | 25-40 | ~800K-1.4M | $7-14 |

Numbers approximate. **Cost ceiling for E2E (M20): $10 — pause if exceeded.** Validated by E2E test in M20.

---

## Risk register

| Risk | Mitigation |
|---|---|
| Claude Agent SDK API changes between 0.2.x patch versions | Pin to ^0.2.126 in package.json; `npm shrinkwrap` if stability becomes critical |
| OpenCode CLI not available on user's machine | Provider detects missing binary, surfaces install instructions in launcher-skill/references/usage.md (per I4); OpenCode tests gated behind `DEEP_RESEARCH_LIVE_TESTS=1` (per I6) |
| OpenRouter API key not configured | Provider checks env vars at construction, surfaces clear error before any LLM call (per I4) |
| Atomic write fails on networked filesystem | Document: OUTPUT_DIR must be on a local POSIX FS; surfaced via Phase 0 sanity check |
| Phase loop-back budget exhaustion creates infinite loops | Loop-back budget enforced by orchestrator with hard ceiling; tested in unit tests |
| Resume protocol fails on schema drift | New CLI uses fresh OUTPUT_DIRs only (per C2); old-skill `_DONE` files are detected and refused with exit 3 |
| AI hallucinations in synthesis pass through to report | Phase 7.5 VERIFY catches them; documented limitation in M20 if VERIFY itself produces parse-failed responses (handled by retry-once-then-fail per I8) |
| Token cost surprises user | Cost forecast printed before spawning + $10 E2E ceiling (m1) |
| Existing skill's research-tasks.json collides with new tool | New CLI uses separate `~/.claude/research-tasks-cli.json` (per I5); zero coordination needed |
| `cli/launcher-skill/scripts/cli.js` goes stale relative to src/ | M21 rebuilds before commit; `git diff` of bundle verifies freshness (per I3 / m2) |
| Cross-provider response shape mismatch | Both providers return `{ text, parsed?, usage, durationMs }`; provider-specific normalization is internal to each impl (m2) |
| Browser-based retrieval coverage gap | v1 uses only AI-built-in tools (web search via Anthropic API). Cloudflare-blocked sources will be unreachable. Documented loudly in v1-baseline `LIMITATIONS.md` (m6) |

---

## Out of scope for v1 (deferred)

- **Phase 7.5 Step 5 (Temporal Supersession)** — defer to v2; v1 records `skipped: "v2-deferred"` in provenance (per C3)
- **Phase 7.5 Step 6 (Verifier-Guided Retry)** — defer to v2; v1 records `skipped: "v2-deferred"` in provenance (per C3)
- **Granularity 3 (mid-LLM-stream resume)** — same rationale as in `../skill/reference/resume.md`
- **Cross-domain async caching** (e.g., reusing search results across runs)
- **Browser-MCP-based retrieval** — Phase 3 sub-agents use the SDK's native web search initially. Cloudflare-blocked sources are unreachable in v1; documented in v1-baseline `LIMITATIONS.md`. v2 ports browser fallback (per m6)
- **Real-time progress dashboard** — relies on tmux + log tail like the existing skill
- **Auto-retry on Anthropic 5xx errors** — basic single retry; sophisticated retry logic deferred
- **Resume from old-skill OUTPUT_DIRs** — new CLI uses fresh dirs only (per C2)
- **Internationalization**

---

## Definition of Done

- [ ] All M0-M21 milestones checked
- [ ] All 🔒 REVIEW GATEs passed (zero Critical/Important; documented deferrals only)
- [ ] All unit tests pass; no flaky tests
- [ ] E2E test produced a complete REPORT.md, `_DONE` exists with locked schema, all phases (except deferred 7.5 Steps 5/6) ran
- [ ] `~/.claude/skills/deep-research-cli/` deployed and loadable in a fresh Claude Code session
- [ ] notes/ROADMAP.md updated, all changes pushed to origin/main, working tree clean
- [ ] User can run `node ~/.claude/skills/deep-research-cli/scripts/cli.js "topic" --mode deep` (with the existing `deep-research` skill also deployed) and get a real research report
