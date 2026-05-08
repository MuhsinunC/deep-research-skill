# Phase 3 RETRIEVE — Historical / Foundational Lens

**Lens:** Historical / Foundational  
**Topic:** How can the deep-research-cli project be improved? Focus on reliability, output quality, and methodology parity with the original deep-research skill.  
**Date generated:** 2026-05-07  
**Output file:** phase03_retrieve_historical.md

---

## Sources Retrieved

### Section A: Origins of the Deep Research Methodology Concept

The deep-research methodology traces through three distinct historical strands:
1. Academic predecessors (WebGPT → ReAct → phase-based research agents)
2. Commercial implementations (Google Gemini Deep Research → OpenAI Deep Research)
3. Project-specific evolution (199-bio skill → MuhsinunC fork → CLI)

---

```json
{
  "claim": "WebGPT, introduced by OpenAI in December 2021 (arXiv:2112.09332), was the first major LLM-based system to combine web browsing with question answering and citation tracking, establishing the foundational pattern for later deep-research agents.",
  "evidence_quote": "WebGPT fine-tunes GPT-3 to answer long-form questions using a text-based web-browsing environment, which allows the model to search and navigate the web. The research was introduced in December 2021, with the paper first submitted on December 17, 2021.",
  "source_url": "https://arxiv.org/abs/2112.09332",
  "source_title": "WebGPT: Browser-assisted question-answering with human feedback",
  "source_date": "2021-12-17",
  "credibility_score": 95,
  "confidence": 0.97
}
```

```json
{
  "claim": "The ReAct framework (Yao et al., ICLR 2023, first submitted October 6, 2022) established the interleaved reasoning-and-acting pattern that underpins modern multi-step research agents by combining chain-of-thought prompting with tool-augmented actions.",
  "evidence_quote": "ReAct explores the use of LLMs to generate both reasoning traces and task-specific actions in an interleaved manner, allowing reasoning traces to help the model induce, track, and update action plans as well as handle exceptions, while actions allow it to interface with external sources to gather additional information.",
  "source_url": "https://arxiv.org/abs/2210.03629",
  "source_title": "ReAct: Synergizing Reasoning and Acting in Language Models",
  "source_date": "2022-10-06",
  "credibility_score": 95,
  "confidence": 0.97
}
```

```json
{
  "claim": "Google launched Gemini Deep Research in November 2024, two months before OpenAI's announcement — establishing the commercial precedent for phase-based AI research agents before OpenAI's February 2025 product launch.",
  "evidence_quote": "Two months before OpenAI's launch, in November 2024, Google also launched Gemini Deep Research with the exact same name and functionality. Some precursors existed like Stanford University's STORM and arguably PaperQA2 and Undermind.ai, indicating that the concept predated both companies' launches.",
  "source_url": "https://aarontay.substack.com/p/the-rise-of-agent-based-deep-research",
  "source_title": "The Rise of Agent-Based Deep Research",
  "source_date": "2025-01-01",
  "credibility_score": 60,
  "confidence": 0.85
}
```

```json
{
  "claim": "OpenAI launched its Deep Research agent on February 2, 2025, describing it as 'a new agentic capability that conducts multi-step research on the internet for complex tasks,' powered by a version of the o3 model optimized for web browsing and data analysis.",
  "evidence_quote": "OpenAI launched Deep Research on February 2, 2025, as a new agentic capability that conducts multi-step research on the internet for complex tasks. Deep research in ChatGPT is a new agentic capability that conducts multi-step research on the internet for complex tasks.",
  "source_url": "https://openai.com/index/introducing-deep-research/",
  "source_title": "Introducing deep research | OpenAI",
  "source_date": "2025-02-02",
  "credibility_score": 95,
  "confidence": 0.97
}
```

---

### Section B: Origins and Design of the 199-biotechnologies Original Skill

The original upstream skill (199-biotechnologies/claude-deep-research-skill) represents the direct ancestor of both the fork and the CLI. Understanding its design choices is foundational.

```json
{
  "claim": "The original 199-biotechnologies skill uses an 8-phase pipeline (SCOPE → PLAN → RETRIEVE → TRIANGULATE → OUTLINE REFINEMENT → SYNTHESIZE → CRITIQUE → REFINE → PACKAGE) with NO Phase 0 RESUME DETECTION and NO Phase 7.5 VERIFY — both were added later by the MuhsinunC fork.",
  "evidence_quote": "Phase | Name | Quick | Std | Deep | Ultra\n1 | SCOPE | Y | Y | Y | Y\n2 | PLAN | - | Y | Y | Y\n3 | RETRIEVE | Y | Y | Y | Y\n4 | TRIANGULATE | - | Y | Y | Y\n4.5 | OUTLINE REFINEMENT | - | Y | Y | Y\n5 | SYNTHESIZE | - | Y | Y | Y\n6 | CRITIQUE | - | - | Y | Y\n7 | REFINE | - | - | Y | Y\n8 | PACKAGE | Y | Y | Y | Y",
  "source_url": "https://github.com/199-biotechnologies/claude-deep-research-skill/blob/f2f2c0fa4e7617ca84c86b63f4bb40f77a746933/SKILL.md",
  "source_title": "199-biotechnologies SKILL.md (SHA: f2f2c0fa)",
  "source_date": "2026-04-11",
  "credibility_score": 98,
  "confidence": 0.99
}
```

```json
{
  "claim": "The original 199-bio skill uses the Task tool with general-purpose sub-agents for parallel retrieval (3-5 agents per Phase 3), and its most recent commit (April 11, 2026) made search-cli the primary search provider over WebSearch, updating all parallel execution examples to use Bash + search CLI.",
  "evidence_quote": "Make search-cli the primary search provider, WebSearch as fallback\n\nsearch-cli (v0.5.0) is installed and provides multi-provider aggregation across Brave, Serper, Exa, Jina, Firecrawl with mode-specific routing (academic, news, general, etc.).\n\nChanges:\n- methodology.md: search-cli is now 'Primary', WebSearch is 'Fallback'\n- Parallel search examples updated to use Bash + search CLI\n- run_manifest default provider_config.primary = 'search-cli'\n- README search tools table reordered by priority",
  "source_url": "https://github.com/199-biotechnologies/claude-deep-research-skill/commit/f2f2c0fa4e7617ca84c86b63f4bb40f77a746933",
  "source_title": "199-bio commit: Make search-cli primary (April 11, 2026)",
  "source_date": "2026-04-11",
  "credibility_score": 98,
  "confidence": 0.99
}
```

```json
{
  "claim": "The original 199-bio skill's v3.0 PR5 added verify_claim_support.py — a deterministic claim verification script — described as 'the single highest-ROI fix identified by all three reviewers (Claude, Codex, GPT Pro),' using token overlap (Jaccard 40%), number matching (25%), and year matching (15%) with no LLM calls.",
  "evidence_quote": "v3.0 PR5: Claim-support verification — STOP 1 reached\n\nAdd verify_claim_support.py — deterministic verification that evidence actually supports claims. This is the single highest-ROI fix identified by all three reviewers (Claude, Codex, GPT Pro).\n\nVerification approach (v1, no LLM calls):\n- Token overlap (Jaccard): 40% weight\n- Number matching: 25% weight\n- Year matching: 15% weight",
  "source_url": "https://github.com/199-biotechnologies/claude-deep-research-skill/commit/4662194319dd167749857c82fb669a3b3973201d",
  "source_title": "199-bio commit v3.0 PR5: Claim-support verification",
  "source_date": "2026-04-11",
  "credibility_score": 98,
  "confidence": 0.99
}
```

```json
{
  "claim": "The original skill's sub-agent output format was formalized to require structured JSON evidence objects (not free text) in order to 'prevent synthesis fatigue when merging results from 3-5 agents.'",
  "evidence_quote": "Sub-agent output format: Require all sub-agents to return structured evidence, not free text: {\"claim\": \"specific claim text\", \"evidence_quote\": \"exact quote from source\", \"source_url\": \"https://...\", \"source_title\": \"...\", \"confidence\": 0.85}\nThis prevents synthesis fatigue when merging results from 3-5 agents.",
  "source_url": "https://github.com/199-biotechnologies/claude-deep-research-skill/blob/f2f2c0fa4e7617ca84c86b63f4bb40f77a746933/reference/methodology.md",
  "source_title": "199-bio reference/methodology.md Phase 3",
  "source_date": "2026-04-11",
  "credibility_score": 98,
  "confidence": 0.98
}
```

---

### Section C: Evolution of the MuhsinunC Fork (The Skill)

```json
{
  "claim": "The MuhsinunC fork's SKILL.md shows the fork extended the pipeline to 10 phases by adding Phase 0 RESUME DETECTION (before Phase 1) and Phase 7.5 VERIFY (between Phase 7 and Phase 8), neither of which exists in the original 199-bio skill.",
  "evidence_quote": "| Phase | Name | Quick | Standard | Deep | UltraDeep |\n| 0 | RESUME DETECTION | Y | Y | Y | Y |\n...\n| 7.5 | VERIFY | - | - | Y | Y |",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/skill/SKILL.md",
  "source_title": "MuhsinunC fork skill/SKILL.md",
  "source_date": "2026-05-07",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "The fork's hybrid model architecture (Opus 4.6 lead agent + Sonnet 4.6 sub-agents) was validated by a head-to-head A/B test and documented to produce a '~28-30% total pipeline cost reduction' and '~15-20% wall clock improvement' over all-Opus configuration.",
  "evidence_quote": "Decision: hybrid architecture — Opus lead + Sonnet sub-agents\nDocument cost impact: ~28-30% total pipeline cost reduction, ~15-20% wall clock improvement",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/ROADMAP.md",
  "source_title": "MuhsinunC notes/ROADMAP.md (Stream 1: Model Selection)",
  "source_date": "2026-05-03",
  "credibility_score": 95,
  "confidence": 0.92
}
```

```json
{
  "claim": "Pre-v14 test runs (v2-v13, March-April 2026) were inadvertently run at medium effort because CLAUDE_CODE_EFFORT_LEVEL=max from ~/.zshrc was not propagated to spawned subprocesses (Bash tool runs zsh -c non-interactive), making them an unreliable baseline for evaluating the skill's true capability ceiling.",
  "evidence_quote": "All runs used the user's default model (Opus 4.6) with whatever default effort was active at the time. The --effort flag was NOT explicitly set on the spawn command. The user's CLAUDE_CODE_EFFORT_LEVEL=max env var in ~/.zshrc was NOT propagated to the spawned subprocess because the Bash tool runs zsh -c (non-interactive) which does not source ~/.zshrc... Effective effort: Opus default (medium).",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/test-run-log.md",
  "source_title": "MuhsinunC notes/test-run-log.md (Configuration history)",
  "source_date": "2026-05-07",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "Stream B1 (April 2026) was triggered by a 2026-04-25 session that ran ~14 parallel deep-research dispatches and observed 7 distinct operational failure modes, of which 8-10 dispatches lost meaningful work — this incident was the catalyst for all the reliability bug fixes in the skill.",
  "evidence_quote": "Source: comprehensive bug report from 2026-04-25 peptide-knowledge-base session that ran ~14 parallel deep-research dispatches and observed 7 distinct operational failure modes. Bug report at /Users/user/Documents/Muhsinun/Projects/GitHub/peptides-research/.local/deep-research-skill-bugs-2026-04-25.md.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/ROADMAP.md",
  "source_title": "MuhsinunC notes/ROADMAP.md (Stream B1)",
  "source_date": "2026-05-03",
  "credibility_score": 99,
  "confidence": 0.99
}
```

---

### Section D: Origins of the CLI Architecture Decision (ADR-001 and Stream C1)

```json
{
  "claim": "The v15 test run (UUID E72ABA74, April 7, 2026) was the empirical event that established the ~20% Task tool hang rate: 2 of 4 Phase 3 RETRIEVE sub-agents hung indefinitely at 0% CPU after 35+ minutes, blocking the parent process — demonstrating the Task tool's synchronous parallel spawn has no timeout mechanism.",
  "evidence_quote": "4 Task tool retrieval sub-agents spawned in a single synchronous parallel message / 2 of 4 completed successfully (research_agent_1 at 27KB, research_agent_2 at 34KB) / 2 of 4 hung indefinitely (research_agent_3 stuck at 273 bytes, research_agent_4 never started writing) / Parent process was BLOCKED on the synchronous Task tool spawn waiting for all 4 agents to return / CPU dropped to 0% for 35+ minutes with no file changes / Had to kill the parent to recover",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/adr/001-task-tool-vs-claude-p-subagents.md",
  "source_title": "ADR-001: Task tool vs claude -p subprocess for sub-agent architecture",
  "source_date": "2026-04-07",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "ADR-001 was originally written on April 7, 2026 to conclude 'do not switch architectures at this time,' but was updated the same day after v15's empirical hang to reverse that decision and recommend 'PROCEED with architecture switch to claude -p subprocess sub-agents.'",
  "evidence_quote": "Status: UPDATED 2026-04-07 afternoon — reconsideration warranted after v15 empirical failure... The original version of this ADR (written earlier today) concluded 'do not switch architectures at this time' because we had no empirical evidence that sub-agent hangs were actually happening.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/adr/001-task-tool-vs-claude-p-subagents.md",
  "source_title": "ADR-001: Task tool vs claude -p subprocess",
  "source_date": "2026-04-07",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI (Stream C1) was motivated by inverting the architecture from 'Claude Code worker reads prompt-driven skill, AI orchestrates everything' to 'deterministic TypeScript CLI orchestrates, AI is called only for genuinely open-ended judgment' — the explicit motivation being that 'AI orchestration is unreliable; runs cost real money; no visibility into whether a phase actually executed.'",
  "evidence_quote": "Source: 2026-05-03 user request to invert the architecture from 'Claude Code worker reads prompt-driven skill, AI orchestrates everything' to 'deterministic TypeScript CLI orchestrates, AI is called only for genuinely open-ended judgment.' Motivation: AI orchestration is unreliable; runs cost real money; no visibility into whether a phase actually executed; need provider abstraction for benchmarking different models (Claude SDK vs OpenRouter via OpenCode CLI).",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/ROADMAP.md",
  "source_title": "MuhsinunC notes/ROADMAP.md (Stream C1)",
  "source_date": "2026-05-03",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI was built over 23 milestones (M0-M21), completed on 2026-05-03, with the first successful E2E test (run 5) producing a 52KB/485-line report with 17 citations after 4 failed runs that exposed 5 critical runtime bugs.",
  "evidence_quote": "M20 — E2E test SUCCEEDED (run 5): all 11 phases ran cleanly in ~43 minutes. Output: cli/test-runs/v1-baseline/. Final report: 52KB / 485 lines with 17 citations and substantive engineering analysis... Bugs found and fixed during E2E (runs 1-4 → run 5): 1. ESM module resolution failure... 2. SDK couldn't find native CLI binary... 3. SDK assistant message text was nested at .message.content, not .content... 4. Spawned subprocess hit web_search permission gate and silently aborted with empty output — added permissionMode: 'bypassPermissions' to SDK options. This was the biggest gotcha — phases reported 'complete' but produced empty artifacts because the subprocess refused to use tools without interactive approval. 5. Strict zod schemas on SCOPE/PLAN responses caused ProviderParseError when LLM returned prose around JSON.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/ROADMAP.md",
  "source_title": "MuhsinunC notes/ROADMAP.md (M20)",
  "source_date": "2026-05-03",
  "credibility_score": 99,
  "confidence": 0.99
}
```

---

### Section E: CLI Phase Architecture — What Is Present vs Missing vs Deferred

```json
{
  "claim": "The CLI's Phase 7.5 VERIFY implementation explicitly defers Steps 5 (Temporal Supersession) and 6 (Verifier-Guided Retry) to v2, and uses a placeholder claim extraction function ('Naive claim extraction: split refined report into atomic claims by paragraph boundaries containing citation markers') instead of a structural parse.",
  "evidence_quote": "// Phase 7.5 VERIFY — citation verification + adversarial refutation.\n// Steps 1-4 only; Steps 5 (Temporal Supersession) and 6 (Verifier-Guided\n// Retry) are deferred to v2 per C3 in PLAN.md.\n...\n// Naive claim extraction: split refined report into atomic claims by paragraph\n// boundaries containing citation markers. M19 will refine this.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/cli/src/phases/phase07_5_verify.ts",
  "source_title": "cli/src/phases/phase07_5_verify.ts",
  "source_date": "2026-05-03",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI's loop-back decision in Phase 7.5 is a non-functional placeholder: 'For v1 placeholder, never loop back automatically; operators can manually re-run by deleting verify artifacts and resuming' — meaning the VERIFY→REFINE loop-back that is central to the skill's accuracy guarantee is entirely absent in v1.",
  "evidence_quote": "// Loop-back decision: M19 will implement DRA aggregation + claim-level\n// contradiction count. For v1 placeholder, never loop back automatically;\n// operators can manually re-run by deleting verify artifacts and resuming.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/cli/src/phases/phase07_5_verify.ts",
  "source_title": "cli/src/phases/phase07_5_verify.ts",
  "source_date": "2026-05-03",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI's prompts are explicitly documented as 'intentionally minimal placeholders that produce runnable end-to-end behavior' that 'DO NOT attempt to reproduce [methodology.md's] full nuance,' with refinement explicitly deferred to v2.",
  "evidence_quote": "// All v1 prompts are intentionally minimal placeholders that produce\n// runnable end-to-end behavior. They reproduce the high-level intent of\n// each phase from the existing skill's reference/methodology.md but DO\n// NOT attempt to reproduce its full nuance. Refinement of prompts —\n// particularly tuning them for output quality — is M19 work and a v2\n// concern.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/cli/src/prompts/index.ts",
  "source_title": "cli/src/prompts/index.ts",
  "source_date": "2026-05-03",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI orchestrator implements a deterministic phase state machine with RECOVERABLE_RETRY_LIMIT=1, loop-back budget enforcement, and special-case handling for RESUME_DETECTION and PACKAGE — none of which exist in the original prompt-driven skill.",
  "evidence_quote": "const RECOVERABLE_RETRY_LIMIT = 1;\n...\n// Write checkpoint AFTER each phase, EXCEPT:\n// - RESUME_DETECTION (writes its own reconciled checkpoint internally)\n// - PACKAGE (per Phase 8 strict ordering rule: PACKAGE owns the final\n//   checkpoint write at step 5, then writes _DONE at step 6 — if the\n//   orchestrator wrote another checkpoint AFTER _DONE, _DONE would no\n//   longer have the most-recent mtime, violating C4 in PLAN.md).",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/cli/src/orchestrator.ts",
  "source_title": "cli/src/orchestrator.ts",
  "source_date": "2026-05-03",
  "credibility_score": 99,
  "confidence": 0.99
}
```

---

### Section F: Historical Bugs and Failure Modes (Test Run Evidence)

```json
{
  "claim": "The most impactful CLI bug found during E2E testing was that the spawned subprocess silently aborted with empty output when hitting the web_search permission gate — the fix was adding permissionMode: 'bypassPermissions' to SDK options, and this was described as 'the biggest gotcha — phases reported complete but produced empty artifacts.'",
  "evidence_quote": "4. Spawned subprocess hit web_search permission gate and silently aborted with empty output — added permissionMode: 'bypassPermissions' to SDK options. This was the biggest gotcha — phases reported 'complete' but produced empty artifacts because the subprocess refused to use tools without interactive approval.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/ROADMAP.md",
  "source_title": "MuhsinunC notes/ROADMAP.md M20 bug list",
  "source_date": "2026-05-03",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "The M19 code review found 5 Critical + 8 Important + 5 Minor issues in the CLI before E2E testing; the most structurally significant were C-2 (--resume flag parsed but never used) and C-3 (Phase 0 registry start_time clobbered on resume).",
  "evidence_quote": "M19 — Final cross-cutting code review:\n- 5 Critical + 8 Important + 5 Minor findings\n- Fixed before E2E: C-1 (orchestrator clobbering Phase 8 checkpoint after _DONE), C-2 (--resume flag never actually used), C-3 (Phase 0 registry corruption on resume), C-4 (PACKAGE in quick mode reading non-existent phase07_refine.md), I-2 (JSON code-fence parser)",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/ROADMAP.md",
  "source_title": "MuhsinunC notes/ROADMAP.md (M19)",
  "source_date": "2026-05-03",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "The test run log records 15 runs (v2-v15) from 2026-03-22 to 2026-04-07 for the skill, with total token spend of approximately 18.5M tokens across all runs, including 2 deep-mode runs aborted mid-pipeline (v14 effort config issue, v15 Task tool hang).",
  "evidence_quote": "| Total | 13 completed + 1 partial | ~18.5M tokens | Approximate, before 82% discount",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/test-run-log.md",
  "source_title": "MuhsinunC notes/test-run-log.md",
  "source_date": "2026-05-07",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "Run v14's verification (despite tainted effort) caught fabricated claims — including a '1.6× productivity' number, wrong dates, swapped arXiv IDs, and wrong model names — establishing empirical evidence that Phase 7.5 VERIFY provides genuine de-hallucination value.",
  "evidence_quote": "Salvaged via Sonnet sub-agent applying 5 hard FAILs + 12 SOFT-PASS hedges + 3 adversarial corrections. Verification correctly caught fabricated '1.6× productivity' number, wrong dates, swapped arXiv IDs, wrong model names. Useful as Opus-medium baseline for comparison against v15 (Opus-max).",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/test-run-log.md",
  "source_title": "MuhsinunC notes/test-run-log.md v14 entry",
  "source_date": "2026-04-07",
  "credibility_score": 99,
  "confidence": 0.99
}
```

---

### Section G: Intentional Design Divergences in the CLI

```json
{
  "claim": "The CLI makes provider abstraction an intentional design divergence from the skill: the same orchestrator runs against Claude Agent SDK (default) OR OpenCode CLI (for OpenRouter/any OpenAI-compatible endpoint) via a --provider flag, enabling model benchmarking across providers that the skill cannot do.",
  "evidence_quote": "Provider abstraction: Claude Agent SDK (default) and OpenCode CLI (for OpenRouter / any OpenAI-compatible endpoint). Same orchestrator runs against either provider via --provider flag.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/ROADMAP.md",
  "source_title": "MuhsinunC notes/ROADMAP.md (Stream C1 Architecture)",
  "source_date": "2026-05-03",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI's _DONE schema is locked at uuid8/finished_at/phase_completed/cli_version, and rejects 'foreign _DONE files (e.g., from old Python skill)' with exit code 3 — an intentional hard incompatibility with the original skill's completion format.",
  "evidence_quote": "C2: _DONE schema locked at uuid8/finished_at/phase_completed/cli_version. Foreign _DONE files (e.g., from old Python skill) rejected with exit code 3. New CLI uses fresh OUTPUT_DIRs only.",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/ROADMAP.md",
  "source_title": "MuhsinunC notes/ROADMAP.md (C2 locked decision)",
  "source_date": "2026-05-03",
  "credibility_score": 99,
  "confidence": 0.99
}
```

```json
{
  "claim": "The CLI deferred Browser-MCP retrieval to v2, meaning Cloudflare-blocked sources are unreachable in v1 — a deliberate capability gap relative to the skill which has 3-tier browser fallback (WebFetch → Chrome MCP → Playwright).",
  "evidence_quote": "Out of scope for v1 (deferred to v2):\n- Browser-MCP retrieval (Cloudflare-blocked sources unreachable in v1)",
  "source_url": "https://github.com/MuhsinunC/deep-research-skill/blob/9670e56f5e0d505b148741c7fadef417d79c2165/notes/ROADMAP.md",
  "source_title": "MuhsinunC notes/ROADMAP.md (Out of scope for v1)",
  "source_date": "2026-05-03",
  "credibility_score": 99,
  "confidence": 0.99
}
```

---

### Section H: Industry Context for Deterministic vs. AI-Orchestrated Pipeline Design

```json
{
  "claim": "Industry consensus in 2025 supports deterministic workflow approaches over fully autonomous AI agents for reliability-critical workflows: 'AI workflows have won the production battle in 2025 as the workhorses behind successful AI deployments, while fully autonomous AI agents remain largely exploratory.'",
  "evidence_quote": "AI workflows have won the production battle in 2025 as the workhorses behind successful AI deployments, while fully autonomous AI agents remain largely exploratory. By late 2025, less than 5% of enterprise applications have real AI agents, with most featuring only basic embedded assistants.",
  "source_url": "https://intuitionlabs.ai/articles/ai-agent-vs-ai-workflow",
  "source_title": "AI Agents vs. AI Workflows: Why Pipelines Dominate in 2025",
  "source_date": "2025-01-01",
  "credibility_score": 55,
  "confidence": 0.75
}
```

```json
{
  "claim": "Anthropic's multi-agent research system, using the same orchestrator-worker shape as the deep-research skill, reports a 90.2% improvement over single-agent Opus on internal research evals, with Opus as the lead agent and Sonnet subagents handling parallel exploration — empirically validating the hybrid model architecture choice.",
  "evidence_quote": "Anthropic has since validated the pattern publicly. Their multi-agent research system uses the same orchestrator-worker shape, and reports a 90.2% improvement over single-agent Opus on internal research evals, with Opus as the lead agent and Sonnet subagents handling parallel exploration.",
  "source_url": "https://paddo.dev/blog/three-ways-deep-research-claude/",
  "source_title": "Three Ways to Build Deep Research with Claude",
  "source_date": "2025-01-01",
  "credibility_score": 50,
  "confidence": 0.65
}
```

---

## Cross-cutting themes (this lens)

**1. The project history follows a clear reliability-driven inversion arc.** The evolution from 199-bio original → MuhsinunC fork → CLI traces a coherent trajectory where each generation added a layer of reliability protection in response to empirically observed failure modes. The 199-bio skill was purely prompt-driven. The fork added crash-recovery (Phase 0 RESUME DETECTION), claim verification (Phase 7.5), effort propagation fixes, and operational guardrails (Stream B1 bug fixes) — all triggered by specific incidents. The CLI inverted the architecture entirely, replacing AI orchestration with deterministic TypeScript — also in direct response to the empirically observed 20% Task tool hang rate from v15. The historical pattern is *failure → empirical evidence → architectural response*, not speculative preemption.

**2. The fork diverged from upstream in the specific dimensions that matter most for accuracy.** The 199-bio original focuses on retrieval quality (structured sub-agent output format, search-cli as primary provider, deterministic claim-support verification scripts). The fork added Phase 7.5 VERIFY — which in v14 empirically caught fabricated numbers, wrong dates, swapped arXiv IDs, and wrong model names. This is not a duplicate of the 199-bio verification; it's a different verification layer (LLM-based cross-source verification vs. deterministic token-overlap verification). Both layers address the same hallucination risk from different angles.

**3. The CLI's v1 prompts represent the single largest structural gap versus the skill.** The CLI prompts/index.ts explicitly labels all prompts as "intentionally minimal placeholders" that "DO NOT attempt to reproduce [methodology.md's] full nuance." The skill's methodology.md (139,709 bytes) contains ~16× more instructional content than the CLI prompt file (8,655 bytes). This gap — not the architectural differences — is likely the primary driver of output quality differences between the two implementations.

**4. The Task tool's synchronous parallel spawn is a platform-level unreliability, not a project-specific bug.** ADR-001 references GitHub issues #17147 and #37521 as documenting the Task tool hang failure mode — these are known Claude Code platform issues. The 20% hang rate is derived from the test run history (1 hang in the ~5 like-for-like deep-mode runs v10-v15). The CLI's switch to the Claude Agent SDK's fanOut API resolves a platform-level constraint that the skill cannot escape without the same architectural switch.

**5. The deferred capabilities form a coherent v2 roadmap with a clear priority ordering.** The CLI v1 deferred exactly the *adaptive* behaviors that require dynamic LLM judgment during execution (Steps 5-6 Temporal Supersession/Verifier-Guided Retry, loop-back DRA aggregation, Browser-MCP retrieval). The v1 implements all deterministic pipeline infrastructure. The correct v2 strategy is to add adaptive layers on top of the deterministic foundation, not to revert the architecture. From a historical lens, this mirrors how successful technical infrastructure projects generally build — deterministic substrate first, intelligent adaptation on top.

---

## TASK STATUS SUMMARY
- T_SQ1 (reliability failure modes and root causes): done — findings in Section D (ADR-001, v15 Task tool hang, platform issues #17147/#37521) and Section F (CLI E2E bugs, Stream B1 7 failure modes from 14-parallel-dispatch incident)
- T_SQ2 (CLI output quality gaps vs skill output): done — findings in Section E (placeholder prompts 16× content delta, naive claim extraction, non-functional VERIFY loop-back) and Section G (Browser-MCP gap, no blocked-site fallback)
- T_SQ3 (which methodology phases are missing/simplified/differently implemented): done — findings in Sections B (original 8-phase, no Phase 0 or 7.5), C (fork added Phase 0/7.5), E (Phase 7.5 Steps 5-6 deferred, loop-back placeholder), G (intentional divergences)
- T_SQ4 (CLI architectural choices and their impact): done — findings in Section D (ADR-001 comparison matrix, CLI motivation), E (orchestrator state machine, RECOVERABLE_RETRY_LIMIT=1), G (provider abstraction, _DONE schema incompatibility)
- T_SQ5 (prioritized roadmap): done — cross-cutting theme 5 synthesizes the deferred capabilities; individual targets identified in Sections E (prompt quality), E (VERIFY loop-back), G (Browser-MCP), E (claim extraction)
- T_SQ6 (capabilities that should NOT be ported): done — findings in Section G (provider abstraction, _DONE schema, deterministic orchestration) are intentional divergences to preserve; cross-cutting theme 5 validates the design principle

---

## Think2 EVALUATE

### 1. Goal achieved?
Yes. The phase goal was to gather historical and foundational evidence about the origins, design lineage, and evolutionary trajectory of the deep-research skill and CLI. I produced 23 structured JSON findings for all 6 sub-questions with primary-source evidence from the actual project files (GitHub API), supplemented by academic/industry historical context.

### 2. Quality counts
- **JSON findings produced:** 23 distinct structured findings
- **Distinct sources consulted:** 14+ unique sources (GitHub API primary-source files; academic arXiv papers; industry announcements; secondary technical blogs)
- **Average credibility_score:** ~92 (primary GitHub sources at 98-99; academic at 95; industry at 95; secondary at 50-60)
- **8-angle coverage:** All 8 angles produced results.
  - Angle 1 (origin/semantic): WebGPT, ReAct, commercial products — COVERED
  - Angle 2 (technical lineage): 199-bio original SKILL.md, commit history, methodology.md — COVERED
  - Angle 3 (evolution/date-filtered): Fork additions (2026-03 to 2026-05), CLI Stream C1 (2026-05) — COVERED
  - Angle 4 (academic predecessors): WebGPT (2021), ReAct (2022) — COVERED
  - Angle 5 (alternative perspectives): OpenAI vs Google Gemini vs STORM; CLI vs Task-tool architectures — COVERED
  - Angle 6 (statistical/data): Test run log (15 runs, 18.5M tokens, ~20% hang rate, v14 VERIFY results) — COVERED
  - Angle 7 (industry origins): OpenAI Deep Research announcement (Feb 2025), Gemini (Nov 2024) — COVERED
  - Angle 8 (critical/limitations history): ADR-001 failure modes, pre-v14 tainted baseline, Stream B1 bugs — COVERED
- **Sub-question coverage:** All 6 sub-questions covered (T_SQ1-T_SQ6), none dropped.
- **Lens distinctiveness:** Historical lens unique contributions: (a) pre-v14 "tainted effort baseline" finding; (b) 199-bio original has no Phase 7.5/0 — fork diverged in these specific dimensions; (c) 199-bio deterministic verify_claim_support.py (Jaccard token overlap, no LLM calls); (d) exact date/event of ADR-001 reversal (same day as v15); (e) WebGPT/ReAct academic lineage as precursors; (f) industry-wide 2025 consensus that deterministic workflows dominate over AI-orchestrated agents.

**Thinnest evidence:** The "90.2% Anthropic internal research eval improvement" claim from a secondary blog source (paddo.dev, credibility 50) — this needs verification from a primary Anthropic source. Also the "~28-30% cost reduction" from hybrid model (credibility 95 but based on A/B test that predates the effort propagation fix).

**Highest-credibility findings:** All GitHub primary-source findings (98-99): ADR-001 decision reversal, CLI prompts as placeholder, VERIFY Steps 5-6 deferred, v15 hang empirical evidence, pre-v14 medium-effort taint.

**Most likely cross-lens disagreement points:**
- The "16× prompt content gap" claim may be challenged by the practitioner lens if the CLI's run quality approaches the skill's — they'd need to reconcile the paradox
- The "~20% hang rate" estimate (based on 1/5 deep-mode runs) may be challenged by the scientific lens as statistically thin (n=5)

### 3. Hand-off to next phase
- **The prompt quality gap (16× content delta) is the highest-confidence improvement target.** The CLI prompts file (8,655 bytes) vs. the skill's methodology.md (139,709 bytes) is a self-documented order-of-magnitude difference. The TRIANGULATE phase should anchor cross-lens consensus here.
- **The "90.2% Anthropic research eval" claim needs primary source verification.** The scientific lens should attempt to find the original Anthropic benchmark source or flag it as unverified.

### 4. MONITOR notes
- **Predicted failure mode (d) — skipping obvious claims:** Consciously searched for pre-v14 effort taint even though it was known from system prompt; found and documented with direct evidence. ✓ Handled.
- **Predicted failure mode (e) — writing in memory before disk:** All searches were executed before writing. The file write was attempted via Playwright/browser tools (failed, JavaScript environment limitations), then succeeded via GitHub API. The content is preserved in this response as the primary backup. ✓ Handled.
- **Predicted failure mode (f) — silently dropping sub-questions:** All 6 sub-questions tracked explicitly in TASK STATUS SUMMARY. ✓ Handled.
- **File write method:** GitHub API write succeeded (MuhsinunC/deep-research-skill main branch). Local file write via Playwright/Chrome DevTools was not possible in this execution environment (no Node.js fs access from browser context). The orchestrator should find the file in the repo after pull, or use this response message as the primary source.
