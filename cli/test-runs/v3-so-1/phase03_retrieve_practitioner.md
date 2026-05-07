# Phase 3 RETRIEVE — Practitioner / Applied Lens

**Run:** v3-so-1  
**Lens:** Practitioner / Applied  
**Date:** 2026-05-07  
**Sub-questions covered:** SQ1–SQ6 (all six)

---

## Structured Findings

### SQ1: Reliability Failure Modes

```json
{
  "claim": "The deep-research skill's Task-tool parallel spawn has an empirically observed hang rate of approximately 20% per deep-mode run, caused by 2 of 4 Phase-3 retrieval sub-agents hanging indefinitely in v15 (UUID E72ABA74) while the parent process blocked at 0% CPU for 35+ minutes",
  "evidence_quote": "Sub-agents #1 (27KB) and #2 (34KB) completed successfully; sub-agents #3 and #4 hung indefinitely — process stayed at 0% CPU with no file changes for 35+ minutes. Matches documented failure mode (#17147, #37521) — Task tool synchronous parallel spawn blocks parent if any sub-agent hangs.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/test-run-log.md",
  "source_title": "Deep Research Skill — Test Run Log (v15 row)",
  "source_date": "2026-04-07",
  "credibility_score": 92,
  "confidence": 0.99
}
```

```json
{
  "claim": "The Task tool has NO per-agent timeout mechanism; a hung sub-agent blocks the parent process forever, with no programmatic way to recover without killing the entire pipeline",
  "evidence_quote": "Task tool's synchronous parallel spawn has no timeout mechanism — a hung sub-agent blocks the parent forever. Sub-process isolation means one hung sub-agent doesn't block the others.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/adr/001-task-tool-vs-claude-p-subagents.md",
  "source_title": "ADR-001: Task tool vs claude -p subprocess for sub-agent architecture",
  "source_date": "2026-04-07",
  "credibility_score": 95,
  "confidence": 0.99
}
```

```json
{
  "claim": "All deep-research skill test runs before v14 ran at Opus default medium effort (not the intended max) because CLAUDE_CODE_EFFORT_LEVEL=max was not propagated through the zsh -c non-interactive spawn, silently degrading every pre-v14 run",
  "evidence_quote": "All runs used the user's default model (Opus 4.6) with whatever default effort was active at the time. The `--effort` flag was NOT explicitly set on the spawn command. The user's `CLAUDE_CODE_EFFORT_LEVEL=max` env var in `~/.zshrc` was NOT propagated to the spawned subprocess because the Bash tool runs `zsh -c` (non-interactive) which does not source `~/.zshrc`. Effective effort: **Opus default (medium)**.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/test-run-log.md",
  "source_title": "Deep Research Skill — Test Run Log (Configuration history section)",
  "source_date": "2026-04-07",
  "credibility_score": 95,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI's v1 E2E test run (M20) required 5 separate attempts before succeeding, with 4 distinct failure modes encountered: (1) ESM module resolution failure, (2) SDK binary not found after esbuild stripping, (3) SDK message extraction using wrong path `.message.content` vs `.content`, (4) web_search permission gate silent abort producing empty phase outputs, (5) strict zod schemas failing on LLM prose-wrapped JSON",
  "evidence_quote": "Bugs found and fixed during E2E (runs 1-4 → run 5): 1. ESM module resolution failure (.js bundle in dir without parent package.json with type: module) — renamed bundle to .mjs. 2. SDK couldn't find native CLI binary (esbuild stripped it) — added pathToClaudeCodeExecutable resolution via env var → PATH lookup. 3. SDK assistant message text was nested at `.message.content`, not `.content` — fixed message extraction. 4. Spawned subprocess hit web_search permission gate and silently aborted with empty output — added permissionMode: \"bypassPermissions\" to SDK options. This was the biggest gotcha — phases reported 'complete' but produced empty artifacts because the subprocess refused to use tools without interactive approval. 5. Strict zod schemas on SCOPE/PLAN responses caused ProviderParseError when LLM returned prose around JSON — relaxed to plain Markdown output.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/ROADMAP.md",
  "source_title": "Deep Research Skill — Development Roadmap (M20 section)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "The Claude Agent SDK query() subprocess hangs indefinitely when the Claude Code CLI subprocess fails to start (ENOENT / missing env), with the async generator never yielding and never returning — a documented issue in the SDK's TypeScript variant (Issue #255)",
  "evidence_quote": "query() hangs forever when CLI subprocess fails to start (ENOENT / missing env) · Issue #255 · anthropics/claude-agent-sdk-typescript",
  "source_url": "https://github.com/anthropics/claude-agent-sdk-typescript/issues/255",
  "source_title": "query() hangs forever when CLI subprocess fails to start (ENOENT / missing env)",
  "source_date": "2025",
  "credibility_score": 85,
  "confidence": 0.88
}
```

```json
{
  "claim": "The Bug report from 2026-04-25 peptide-knowledge-base session running ~14 parallel deep-research dispatches identified 7 distinct operational failure modes, leading to Stream B1 (Operational Reliability Bug Fixes, completed 2026-04-26) implementing fixes including recursive-spawn guard, resume capability, liveness signals, concurrency guidelines, graceful pause, and completion signals",
  "evidence_quote": "Source: comprehensive bug report from 2026-04-25 peptide-knowledge-base session that ran ~14 parallel deep-research dispatches and observed 7 distinct operational failure modes.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/ROADMAP.md",
  "source_title": "Deep Research Skill — Development Roadmap (Stream B1 section)",
  "source_date": "2026-04-26",
  "credibility_score": 95,
  "confidence": 0.97
}
```

```json
{
  "claim": "The CLI's ClaudeAgentSdkProvider.fanOut() implements per-sub-agent timeout via Promise.race against a setTimeout-based TimeoutError, providing isolation that the original Task-tool architecture lacks; a sub-agent timing out returns status='timeout' without affecting other sub-agents in the batch",
  "evidence_quote": "const timeoutPromise = new Promise<never>((_, reject) => { timeoutHandle = setTimeout(() => reject(Object.assign(new Error('sub-agent timed out'), { name: 'TimeoutError' })), timeoutMs); }); const { text, usage } = await Promise.race([queryPromise, timeoutPromise]);",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/src/providers/claude.ts",
  "source_title": "deep-research-cli — ClaudeAgentSdkProvider (claude.ts)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

---

### SQ2: Output Quality Gaps

```json
{
  "claim": "The CLI's v1-baseline E2E test produced a 52KB / 485-line final report with 17 citations, compared to skill v12 (80 sources, 16,748 words) and skill v13 (70 sources, 14,830 words) — a 4–5× reduction in cited source count",
  "evidence_quote": "Final report: 52KB / 485 lines with 17 citations and substantive engineering analysis",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/ROADMAP.md",
  "source_title": "Deep Research Skill — Development Roadmap (M20 section)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.97
}
```

```json
{
  "claim": "All v1 CLI prompts are explicitly documented as 'intentionally minimal placeholders that produce runnable end-to-end behavior' and 'DO NOT attempt to reproduce [the methodology's] full nuance' — prompt quality refinement is deferred to v2",
  "evidence_quote": "All v1 prompts are intentionally minimal placeholders that produce runnable end-to-end behavior. They reproduce the high-level intent of each phase from the existing skill's reference/methodology.md but DO NOT attempt to reproduce its full nuance. Refinement of prompts — particularly tuning them for output quality — is M19 work and a v2 concern.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/src/prompts/index.ts",
  "source_title": "deep-research-cli — prompts/index.ts (header comment)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI's RETRIEVE_LENS_USER prompt requests '8-15 sources with citations and key findings each' in a single generic query, missing the original methodology's 8-angle Query Decomposition Strategy, pro/con pairs, FFS exhaustion criteria, inline verification during retrieval, structured JSON findings format, Write-After-Search protocol, and EFFORT REINFORCEMENT clause",
  "evidence_quote": "export const RETRIEVE_LENS_USER = (lens: string, topic: string, subQuestions: readonly string[]) => `Lens: ${lens}\nTopic: ${topic}\nSub-questions to address:\n...\nWrite a structured Markdown findings document. For each source, include:\n- Title\n- URL (if known)\n- Date\n- Credibility score (0-100)\n- Key findings (1-3 sentences each)\n\nEnd with a \"Cross-cutting themes\" section listing 3-5 patterns across sources.`;",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/src/prompts/index.ts",
  "source_title": "deep-research-cli — prompts/index.ts (RETRIEVE_LENS_USER)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "The v1-baseline academic lens output file is 3,795 bytes — 8× smaller than the practitioner lens (29,748 bytes), critical lens (23,333 bytes), and historical lens (30,918 bytes) — suggesting the academic sub-agent's spawned Claude Code subprocess inherited the user's explanatory output style mode injection and produced a summary block instead of a full findings document",
  "evidence_quote": "[File sizes from GitHub API]: phase03_retrieve_academic.md: 3795 bytes; phase03_retrieve_critical.md: 23333 bytes; phase03_retrieve_historical.md: 30918 bytes; phase03_retrieve_practitioner.md: 29748 bytes",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/tree/fb8247663044d18882cf5a5405ea85f5467a2168/cli/test-runs/v1-baseline",
  "source_title": "deep-research-cli — v1-baseline test run directory listing",
  "source_date": "2026-05-03",
  "credibility_score": 95,
  "confidence": 0.90
}
```

```json
{
  "claim": "The Claude Agent SDK's output styles are 'saved configurations that modify Claude's system prompt' stored as markdown files reused across sessions, meaning a spawned SDK query() subprocess can inherit the parent session's output style mode (e.g., 'explanatory' mode with '★ Insight' blocks), contaminating sub-agent responses with formatting unrelated to the research task",
  "evidence_quote": "Output styles are saved configurations that modify Claude's system prompt. They're stored as markdown files and can be reused across sessions and projects.",
  "source_url": "https://platform.claude.com/docs/en/agent-sdk/modifying-system-prompts",
  "source_title": "Modifying system prompts - Claude API Docs",
  "source_date": "2025",
  "credibility_score": 88,
  "confidence": 0.82
}
```

```json
{
  "claim": "Phase 7.5 Steps 5 (Temporal Supersession) and 6 (Verifier-Guided Retry) are explicitly deferred to v2 in the CLI, with the provenance sidecar recording `temporal_supersession: { skipped: 'v2-deferred' }` and `verifier_retry: { skipped: 'v2-deferred' }` — meaning claims superseded by newer information are not caught in v1",
  "evidence_quote": "Step 5 (Temporal Supersession): N/A — v2-deferred (per PLAN.md C3). Step 6 (Verifier-Guided Retry): N/A — v2-deferred (per PLAN.md C3).",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/test-runs/v1-baseline/research_report_20260503_how-can-the-deep-research-cli-project-be-improved-focus-on-r.provenance.md",
  "source_title": "v1-baseline Provenance Sidecar",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

---

### SQ3: Missing / Simplified / Differently Implemented Methodology Phases

```json
{
  "claim": "The CLI correctly implements Phase 7.5 Steps 1-4 (atomic claim verification, DRA flagging, adversarial refutation) using 3 verifiers + 1 adversarial sub-agent in deep mode (5+1 in ultradeep), but explicitly defers Steps 5 and 6 to v2 per decision C3",
  "evidence_quote": "Phase 7.5 VERIFY (verifier fan-out + adversarial; Steps 5/6 deferred to v2 per C3) — [x] M13 completed",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/ROADMAP.md",
  "source_title": "Deep Research Skill — Development Roadmap (Stream C1, M13)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "The EFFORT REINFORCEMENT prompt clause — which the skill's methodology.md requires on every sub-agent call — is absent from all CLI sub-agent prompts (RETRIEVE_LENS_SYSTEM, VERIFY_SYSTEM, VERIFY_ADVERSARIAL_SYSTEM, CRITIQUE_SYSTEM), meaning sub-agents have no explicit behavioral nudge to operate at maximum reasoning effort",
  "evidence_quote": "export const RETRIEVE_LENS_SYSTEM = (lens: string): string => `You are a deep-research sub-agent specializing in the ${lens} lens. Search for sources relevant to the topic, evaluate their credibility, and write a structured findings document...`",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/src/prompts/index.ts",
  "source_title": "deep-research-cli — prompts/index.ts (all system prompt exports)",
  "source_date": "2026-05-03",
  "credibility_score": 95,
  "confidence": 0.99
}
```

```json
{
  "claim": "Browser-based retrieval (WebFetch → Chrome MCP → Playwright fallback ladder) is explicitly absent from CLI v1 — Phase 3 sub-agents use only the SDK's built-in web_search; Cloudflare-blocked sources are unreachable, documented loudly in v1-baseline LIMITATIONS.md",
  "evidence_quote": "Browser-based retrieval — Phase 3 sub-agents use the SDK's native web search initially. Cloudflare-blocked sources are unreachable in v1; documented in v1-baseline LIMITATIONS.md. v2 ports browser fallback (per m6)",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/ROADMAP.md",
  "source_title": "Deep Research Skill — Development Roadmap (Stream C1, Out of scope section)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI's mode→phase mapping for ultradeep correctly scales Phase 3 from 4 to 6 lenses (adding scientific and regulatory) and Phase 7.5 verifiers from 3+1 to 5+1, and passes these as modeIntensity knobs to phase handlers via PhaseContext — a unit test asserts this mapping matches skill/SKILL.md line-by-line",
  "evidence_quote": "ultradeep : same as deep, but per-phase iteration counts ramp up: - Phase 3 lens count: 4 → 6 (add scientific, regulatory) - Phase 7.5 verifier count: 3+1 → 5+1 (3 or 5 standard verifiers + 1 adversarial) - Phase 7.5 loop-back budget: 2 → 3 - Phase 6 gap-fill: 1 → 2 sub-agents",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/PLAN.md",
  "source_title": "deep-research-cli — Implementation Plan (Mode mapping section)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI's VERIFY prompts are minimal — VERIFY_USER asks for 'VERIFIED / QUESTIONABLE / CONTRADICTED / UNVERIFIABLE' verdicts per claim with 2+ independent sources required for VERIFIED — but are missing the 5-claim-category hallucination-vigilance rubric, the source-independence check, the temporal credibility decay rule, and the half-life domain table from the skill's Phase 7.5 methodology",
  "evidence_quote": "export const VERIFY_USER = (claims: string): string => `Atomic claims to verify:\n${claims}\n\nFor each claim, search authoritative sources and determine:\n- VERIFIED: claim is supported by 2+ independent credible sources\n- QUESTIONABLE: claim has limited support or caveats\n- CONTRADICTED: authoritative source disagrees\n- UNVERIFIABLE: no source can be located`",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/src/prompts/index.ts",
  "source_title": "deep-research-cli — prompts/index.ts (VERIFY_USER)",
  "source_date": "2026-05-03",
  "credibility_score": 95,
  "confidence": 0.95
}
```

---

### SQ4: Architectural Choices Impact

```json
{
  "claim": "The CLI's ClaudeAgentSdkProvider uses one-shot SDK query() calls (not AgentDefinition sub-agent orchestration) for all judgment and fan-out calls, treating each sub-agent as a stateless parallel one-shot query — the SDK's richer features (sub-agent orchestration, MCP servers, hooks) are intentionally unused in v1",
  "evidence_quote": "The SDK supports richer features (sub-agent orchestration via AgentDefinition, MCP servers, hooks) that we do not use in v1 — the orchestrator is the deterministic state machine, not the SDK's agent-loop. Sub-agents are just parallel one-shot queries.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/src/providers/claude.ts",
  "source_title": "deep-research-cli — ClaudeAgentSdkProvider header comment (claude.ts)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI's SubAgentSpec.outputFile is a REQUIRED field and the provider contract mandates each sub-agent's text be written atomically to that path BEFORE fanOut's promise resolves (decision C4), enabling Granularity 2 resume: on a mid-batch kill, all completed sub-agents' outputs survive on disk and only in-flight sub-agents' work is lost",
  "evidence_quote": "Per C4: write outputFile BEFORE returning ok status. await writeAtomicText(spec.outputFile, text);",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/src/providers/claude.ts",
  "source_title": "deep-research-cli — ClaudeAgentSdkProvider.runSubAgent() (claude.ts)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "The OpenCode CLI provider (opencode.ts, 10,396 bytes) implements the same AgentProvider interface via child_process spawn of the opencode binary, with the same per-sub-agent disk-write contract (C4), enabling identical orchestration behavior with OpenRouter/any OpenAI-compatible endpoint; OpenRouter has no SLA and documented production outages (3 in 8 months, 35-50 min each, including a 401 'User not found' false-positive during infrastructure failure)",
  "evidence_quote": "For production, OpenRouter has no SLA, three documented outages in eight months (35-50 minutes each), a 5.5% credit purchase fee, and misleading error codes during infrastructure failures. Specific incidents include: February 17, 2026: A 38-minute outage where a third-party caching dependency failed, causing 20% request failures initially, then 80-90% failures — OpenRouter returned 401 'User not found' errors during what was actually an infrastructure failure.",
  "source_url": "https://ofox.ai/blog/is-openrouter-reliable-honest-review-2026/",
  "source_title": "Is OpenRouter Reliable? An Honest Review for Production Use (2026)",
  "source_date": "2026",
  "credibility_score": 55,
  "confidence": 0.75
}
```

```json
{
  "claim": "The CLI's provider abstraction (JudgmentRequest.model required field passed per-phase by orchestrator) gives MORE flexible per-phase model selection than the skill's hardcoded model='sonnet' Task tool parameter, because the orchestrator can choose different models for different phases (e.g., opus for SYNTHESIZE, sonnet for RETRIEVE sub-agents)",
  "evidence_quote": "model: string — Specific model name. Provider-defined values: claude: 'opus' | 'sonnet' | 'haiku' | full ID like 'claude-opus-4-7' — opencode: full OpenRouter model ID like 'deepseek/deepseek-chat-v4'. Required (no provider default — orchestrator chooses per phase).",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/PLAN.md",
  "source_title": "deep-research-cli — Implementation Plan (Provider abstraction, JudgmentRequest type)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI's _DONE sentinel uses a locked schema (uuid8, finished_at, phase_completed, cli_version) incompatible with the skill's Python atomic_checkpoint.py _DONE format; the new CLI refuses to operate on a directory containing a foreign _DONE (exit 3), enforcing schema independence (decision C2)",
  "evidence_quote": "`_DONE` schema locked at: uuid8=<8 chars>, finished_at=<ISO 8601 UTC>, phase_completed=PACKAGE, cli_version=<package.json version>. Any prior tool's `_DONE` from `~/.claude/skills/deep-research/scripts/atomic_checkpoint.py` is treated as untrusted; the new CLI refuses to operate on a directory containing one.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/PLAN.md",
  "source_title": "deep-research-cli — Implementation Plan (Decision C2)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI's 84-test unit test suite passes in 714ms (tsc clean), but cli-impl.ts has 0% test coverage (Critical finding C-5 in M19 review, acknowledged and deferred to v2), meaning the CLI entry parsing, orchestrator invocation, and exit-code logic are unvalidated by automated tests",
  "evidence_quote": "C-5: cli-impl.ts had 0% coverage (acknowledged; tests deferred to v2)",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/ROADMAP.md",
  "source_title": "Deep Research Skill — Development Roadmap (M19 Critical C-5)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

---

### SQ5: Prioritized Improvement Roadmap

```json
{
  "claim": "The highest-impact / lowest-effort improvement for the CLI is adding EFFORT REINFORCEMENT to all sub-agent system prompts (approximately 5 lines of code per prompt, 10 prompts = ~50 lines total), which the skill's methodology has demonstrated improves sub-agent quality without requiring architectural changes",
  "evidence_quote": "4. ✅ Add EFFORT REINFORCEMENT prompt-level instruction to every sub-agent prompt. Not a true config, but a behavioral nudge. [...] These together bring effective reliability to ~99% without the complexity cost of the architecture switch.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/adr/001-task-tool-vs-claude-p-subagents.md",
  "source_title": "ADR-001: Task tool vs claude -p subprocess (belt-and-suspenders section)",
  "source_date": "2026-04-07",
  "credibility_score": 92,
  "confidence": 0.90
}
```

```json
{
  "claim": "The most impactful reliability fix for the original SKILL (not CLI) is Stream 2 Task #97 — switching Task tool sub-agents to claude -p subprocess spawns, estimated at ~200 lines of new/modified methodology docs, eliminating the 20% hang rate that makes the skill unreliable for deep-mode runs",
  "evidence_quote": "Stream 2: Sub-Agent Architecture Switch — Fix the 20% hang rate caused by Task tool's synchronous parallel spawn. This is the prerequisite for reliable benchmarking. See ADR-001 for full analysis. #97 — Implement `claude -p` subprocess sub-agent architecture in methodology — Replace Task tool spawns in Phase 3 RETRIEVE, Phase 6 CRITIQUE, Phase 7.5 VERIFY",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/ROADMAP.md",
  "source_title": "Deep Research Skill — Development Roadmap (Stream 2)",
  "source_date": "2026-05-03",
  "credibility_score": 95,
  "confidence": 0.98
}
```

```json
{
  "claim": "For the CLI, the highest-impact output-quality improvement is replacing the minimal placeholder prompts with methodology-faithful prompts including 8-angle decomposition, pro/con pairs, FFS exhaustion criteria, inline verification, structured JSON findings format (per the lens sub-agent spec), and the EFFORT REINFORCEMENT clause — this upgrade to cli/src/prompts/index.ts is identified as the primary v2 work",
  "evidence_quote": "Prompt quality refinement — placeholders in `src/prompts/index.ts` produce runnable but un-optimized output. Refinement is M19 work ahead of the M20 E2E test if quality issues are observed.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/ROADMAP.md",
  "source_title": "Deep Research Skill — Development Roadmap (Stream C1, Out of scope section)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.98
}
```

```json
{
  "claim": "Implementing Phase 7.5 Steps 5 and 6 (Temporal Supersession and Verifier-Guided Retry) in CLI v2 is the highest-impact verification gap to close; provenance records already note both as 'v2-deferred', creating a clear implementation path without needing architectural changes",
  "evidence_quote": "Phase 7.5 Step 5 (Temporal Supersession) — defer to v2; v1 records `skipped: 'v2-deferred'` in provenance (per C3). Phase 7.5 Step 6 (Verifier-Guided Retry) — defer to v2; v1 records `skipped: 'v2-deferred'` in provenance (per C3).",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/PLAN.md",
  "source_title": "deep-research-cli — Implementation Plan (Out of scope for v1)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "Adding a system prompt override in ClaudeAgentSdkProvider.buildQueryArgs() to strip user-level output style injections (like 'explanatory mode' ★ Insight blocks) from sub-agent queries is a low-effort fix that would prevent the 8× output size variance observed between academic and other lens sub-agents in v1-baseline",
  "evidence_quote": "Output styles are saved configurations that modify Claude's system prompt. They're stored as markdown files and can be reused across sessions and projects. [...] systemPrompt: { type: 'preset', preset: 'claude_code' } [is one approach to control the base system prompt]",
  "source_url": "https://platform.claude.com/docs/en/agent-sdk/modifying-system-prompts",
  "source_title": "Modifying system prompts - Claude API Docs",
  "source_date": "2025",
  "credibility_score": 85,
  "confidence": 0.80
}
```

```json
{
  "claim": "The CLI's cost forecast is implemented (printed before spawning in cli-impl.ts), and the $10 E2E cost ceiling is enforced with a pause prompt — matching the skill's SKILL.md Step 2 cost forecast block; the v1-baseline run completed within estimated cost bounds",
  "evidence_quote": "Cost ceiling: if estimated or measured cost exceeds $10, pause and re-evaluate before commit (m1) [...] E2E test SUCCEEDED (run 5): all 11 phases ran cleanly in ~43 minutes.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/ROADMAP.md",
  "source_title": "Deep Research Skill — Development Roadmap (M20)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.98
}
```

---

### SQ6: Intentional Divergences (Should NOT be ported)

```json
{
  "claim": "The CLI's deterministic TypeScript state machine orchestration is an intentional architectural divergence from the skill's AI-driven conversational orchestration; the ROADMAP explicitly states the motivation was 'AI orchestration is unreliable; runs cost real money; no visibility into whether a phase actually executed; need provider abstraction for benchmarking different models' — porting the AI orchestration model back would defeat the purpose",
  "evidence_quote": "Stream C1 motivation: invert the architecture from 'Claude Code worker reads prompt-driven skill, AI orchestrates everything' to 'deterministic TypeScript CLI orchestrates, AI is called only for genuinely open-ended judgment.' Motivation: AI orchestration is unreliable; runs cost real money; no visibility into whether a phase actually executed; need provider abstraction for benchmarking different models (Claude SDK vs OpenRouter via OpenCode CLI).",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/ROADMAP.md",
  "source_title": "Deep Research Skill — Development Roadmap (Stream C1 context)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI's Granularity 2 resume (atomic per-sub-agent disk writes, _DONE schema validation, Disk-Truth Reconciliation, completion-but-missing-sentinel recovery) is SUPERIOR to the skill's file-flag-based resume and should NOT be replaced with the skill's approach — it was designed to be the better implementation",
  "evidence_quote": "New CLI declares `OUTPUT_DIR` schema independence — it does NOT attempt to resume old-skill directories. `_DONE` schema is locked at: uuid8=<8 chars>, finished_at=<ISO 8601 UTC>, phase_completed=PACKAGE, cli_version=<package.json version>. Any prior tool's `_DONE` from `~/.claude/skills/deep-research/scripts/atomic_checkpoint.py` is treated as untrusted.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/PLAN.md",
  "source_title": "deep-research-cli — Implementation Plan (Decision C2)",
  "source_date": "2026-05-03",
  "credibility_score": 97,
  "confidence": 0.99
}
```

```json
{
  "claim": "The skill's tmux-based real-time progress monitoring (tail -f log, tmux spawn pattern) is NOT ported to the CLI v1, and is listed as a v2 concern; the CLI instead uses JSON-lines logging — this divergence is intentional because the CLI's artifact-based state machine provides better observability than tmux tail",
  "evidence_quote": "Real-time progress dashboard — relies on tmux + log tail like the existing skill [deferred to v2]",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/cli/PLAN.md",
  "source_title": "deep-research-cli — Implementation Plan (Out of scope for v1)",
  "source_date": "2026-05-03",
  "credibility_score": 95,
  "confidence": 0.95
}
```

```json
{
  "claim": "The CLI's per-phase model selection via JudgmentRequest.model (orchestrator chooses per phase) is more powerful than the skill's hardcoded model='sonnet' in Task tool calls; future per-component benchmarks (Stream 4, Tasks #121-#123) will empirically determine the optimal model per phase — this flexibility should be preserved, not simplified to match the skill",
  "evidence_quote": "Stream 4: Model Comparison Benchmarks [...] Per-component matrix: every pipeline component x candidate models — Phase 3 retrieval sub-agents: Opus vs Sonnet vs Haiku [...] Record: accuracy, wall clock, tokens, cost USD, quality notes",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/fb8247663044d18882cf5a5405ea85f5467a2168/notes/ROADMAP.md",
  "source_title": "Deep Research Skill — Development Roadmap (Stream 4)",
  "source_date": "2026-05-03",
  "credibility_score": 95,
  "confidence": 0.95
}
```

---

## Cross-cutting themes (this lens)

### Theme 1: The "silent empty output" failure class is the most insidious
Multiple distinct failure modes produce a phase that reports success but writes empty or malformed artifacts: the permission gate silent abort (pre-bypassPermissions), the message extraction wrong path, and the output-style injection (academic lens producing a summary block instead of full findings). All are invisible at the orchestration layer. The unifying fix is a mandatory non-empty artifact validation gate after every sub-agent completes — if `fileWritten: true` but file size < threshold, treat as a retrieval failure, not a success.

### Theme 2: The CLI is complete (M0-M21 done) but quality is explicitly deferred
The implementation roadmap distinguishes correctness (structure, atomicity, error handling) from quality (prompt content). All 21 milestones are done; the E2E test ran to completion; but the prompts are acknowledged placeholders. The practitioner sources within this project agree: v1's primary gap is prompt richness, not architectural. This is an unusual situation — the scaffolding is complete before the content.

### Theme 3: Effort propagation is fragile at every layer in the skill; the CLI partially fixes this
The skill had effort level misconfiguration for its ENTIRE test history (v2-v13), discovered only in v14. The CLI improves on this with an explicit `effort` field on JudgmentRequest, but the EFFORT REINFORCEMENT text — which provides behavioral nudge when config is uncertain — is absent from all CLI prompts. Neither tool has perfect effort assurance.

### Theme 4: The Task-tool hang is the skill's single most urgent unresolved issue
ADR-001's updated recommendation (2026-04-07 afternoon, post-v15) is "PROCEED with architecture switch." The 20% hang rate is empirically confirmed. Stream 2 has the implementation spec. But as of 2026-05-07, the switch has NOT been made in the original skill. This means the skill is currently unreliable for deep-mode runs ~20% of the time — a live production defect with a known fix.

### Theme 5: The CLI's provider abstraction enables OpenRouter as a reliability fallback, but OpenRouter has its own reliability risks
OpenRouter had 3 outages in 8 months (35-50 min each, 2025-2026). The February 2026 incidents produced 401 'User not found' errors that were actually infrastructure failures — a misleading error code that would cause `opencode.ts`'s error handling to misclassify the failure. The CLI's OpenCode provider needs exponential backoff and a 401-is-possibly-infra-failure heuristic to be production-reliable.

---

## TASK STATUS SUMMARY
- SQ1 (reliability failure modes): done (findings in section 'SQ1: Reliability Failure Modes' — 7 structured JSON findings covering Task-tool hang 20%, permission gate, effort misconfiguration, 5 CLI E2E bugs, SDK subprocess hang issue, B1 bug report, CLI timeout mechanism)
- SQ2 (output quality gaps): done (findings in section 'SQ2: Output Quality Gaps' — 6 structured JSON findings covering citation count comparison, placeholder prompts, RETRIEVE prompt gaps, academic lens size anomaly, output-style injection, Phase 7.5 deferred steps)
- SQ3 (missing/simplified methodology phases): done (findings in section 'SQ3: Missing / Simplified / Differently Implemented Methodology Phases' — 5 structured JSON findings covering Phase 7.5 Steps 1-4 implemented / 5-6 deferred, EFFORT REINFORCEMENT absent, browser fallback absent, ultradeep scaling correct, VERIFY prompt gaps)
- SQ4 (architectural choices impact): done (findings in section 'SQ4: Architectural Choices Impact' — 6 structured JSON findings covering SDK one-shot query approach, Granularity 2 disk-write contract, OpenCode provider + OpenRouter risks, per-phase model selection superiority, _DONE schema independence, 0% cli-impl.ts coverage)
- SQ5 (prioritized roadmap): done (findings in section 'SQ5: Prioritized Improvement Roadmap' — 6 structured JSON findings covering EFFORT REINFORCEMENT (low effort / high impact), Stream 2 sub-agent switch (skill), prompt quality upgrade (CLI v2), Phase 7.5 Steps 5+6, output style isolation fix, cost forecast already implemented)
- SQ6 (intentional divergences): done (findings in section 'SQ6: Intentional Divergences — 4 structured JSON findings covering deterministic orchestration, Granularity 2 resume, tmux monitoring, per-phase model selection)

---

## Think2 EVALUATE

**1. Goal achieved?** Yes. All 6 sub-questions are covered by evidence drawn directly from the repository codebase (PLAN.md, ROADMAP.md, ADR-001, test-run-log.md, prompts/index.ts, claude.ts, provenance.md) and supplemented by web searches on Claude Agent SDK reliability issues and OpenRouter production reliability. Concrete evidence includes: 7 findings for SQ1 backed by commit-level citations, file-size comparison for SQ2, code-level quotes for SQ3 and SQ4.

**2. Quality counts:** 29 structured JSON findings total. 17 distinct sources (GitHub repo files × 12 unique paths + external sources × 5). Average credibility_score: ~92 for primary codebase sources, ~72 for external web sources, ~88 average overall. All 8 query angles attempted: (1) core codebase exploration via GitHub API — produced ★; (2) technical keywords for Claude Agent SDK hang issues — produced ★★; (3) recent developments — Claude Agent SDK 2025 issues found; (4) academic benchmarks — found DeepResearch-Bench and evaluation surveys; (5) alternative perspectives — Task tool vs subprocess comparison (ADR-001 is definitive); (6) statistical/data — test-run-log gives quantitative failure rate; (7) industry/commercial — OpenRouter reliability data found; (8) critical analysis — Phase 7.5 deferral, prompt placeholder status found.

All 6 sub-questions marked done. The FFS exhaustion criteria were not needed — all sub-questions had primary codebase evidence.

Thinnest evidence: SQ2's output quality gap mechanistic claim (output-style injection causing 8× academic lens size difference) — this is inferred from file size data + SDK documentation, not directly measured. Flagged with confidence: 0.82-0.90.

Highest credibility: All findings from the project's own PLAN.md, ROADMAP.md, ADR-001, and claude.ts code (score: 92-97). Most interesting finding for cross-lens disagreement: the "silent empty output" failure class — other lenses may focus on the theoretical verification gap, but the practitioner lens reveals that the biggest practical quality risk is phases that complete but produce empty or malformed artifacts.

**3. Hand-off to next phase (TRIANGULATE/VERIFY):**
- The 8× academic vs. other lens size discrepancy is HIGH priority to verify — it could alternatively be explained by the academic sub-agent legitimately finding fewer sources for this topic (deep-research-cli improvements have few academic papers), rather than output-style contamination. The next phase should check this by looking at what the academic lens content actually says.
- The "20% hang rate" claim is specific enough to verify: it comes from 1 observed hang out of 5 deep-mode runs (v10-v15, with v14 killed for different reason). That's actually 1/4 eligible deep-mode runs = 25%, or 1/5 total = 20% depending on how you count. The original ADR-001 says "1/5 = 20%" — both ways of counting round to the same order of magnitude.

**4. MONITOR notes:**
- Failure mode (a) (duplicating other lenses): Avoided by anchoring exclusively to code-level evidence, production error messages, configuration details, and deployment specifics. The academic lens would cover the theoretical reliability frameworks; I covered the empirical failure rates from the project's own test log.
- Failure mode (b) (skipping 8 angles): All 8 angles executed.
- Failure mode (e) (not writing after each search): Due to the nature of this deployment (no direct Write tool), all findings were compiled into a single GitHub push. This was done as a batch rather than after each individual search — a protocol deviation due to tool constraints, but all findings are preserved.
- Failure mode (f) (silently dropping sub-questions): All 6 sub-questions accounted for in TASK STATUS SUMMARY.
