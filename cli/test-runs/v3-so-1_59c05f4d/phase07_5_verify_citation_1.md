# Phase 7.5 — Citation Verification (Sub-lens: citation_1)

**Verifier:** Sonnet sub-agent
**Date:** 2026-05-08
**Claims batch:** C1, C4, C7, C10, C13, C16

---

## Sources Fetched (in order of retrieval)

1. WebSearch: "DeepFact preprint PhD expert accuracy 60.8 percent" → found arXiv:2603.05912
2. WebSearch: "FRAMES benchmark fact-retrieval accuracy 0.40 0.66 retrieval pipeline" → found arXiv:2409.12941
3. GitHub API: MuhsinunC/deep-research-skill CLAUDE.md
4. GitHub API: notes/test-run-log.md
5. GitHub API: cli/test-runs/v1-baseline/ directory listing
6. GitHub API: cli/src/providers/ directory listing → found opencode.ts
7. GitHub API: cli/src/providers/opencode.ts
8. GitHub API: cli/src/providers/claude.ts
9. GitHub API: cli/src/orchestrator.ts
10. GitHub API: cli/test-runs/v1-baseline/phase03_retrieve_academic.md
11. GitHub API: cli/test-runs/v1-baseline/phase04_triangulate.md
12. GitHub API: cli/test-runs/v1-baseline/phase05_synthesize.md
13. GitHub API: cli/test-runs/v1-baseline/phase06_critique.md
14. GitHub API: cli/test-runs/v1-baseline/phase07_refine.md
15. GitHub API: cli/test-runs/v1-baseline/_checkpoint.json
16. GitHub API: cli/test-runs/v1-baseline/_subagent_progress.json
17. Playwright: arXiv:2603.05912 (DeepFact paper abstract)
18. Playwright: arXiv:2409.12941 (FRAMES paper abstract)
19. WebSearch: "arxiv 2603.05912 DeepFact PhD expert 60.8 90.9 accuracy" (confirmation)
20. WebSearch: "FRAMES benchmark arxiv 2409.12941 accuracy 0.40 0.66 retrieval pipeline results" (confirmation)

---

## C1 — Deep-research mode hang failure rate ~20%

**Claim:** "The deep-research skill's deep-research mode exhibits a documented hang failure mode at a reported approximately 20 percent rate per run."

**Source type:** Internal project documentation (CLAUDE.md)

**Evidence quote (verbatim from CLAUDE.md):**
> "Task tool sub-agents can hang at 0% CPU indefinitely, blocking the parent. This failure mode hits roughly 20% of deep-mode runs. See notes/adr/001-task-tool-vs-claude-p-subagents.md for the decision to switch to claude -p subprocesses; the switch is planned but not yet implemented."

**Additional corroboration:**
- phase06_critique.md (v1-baseline): "the synthesis itself acknowledges in CLAUDE.md the figure is 'roughly 20%' — a hedged estimate, not a measurement"
- phase07_refine.md (v1-baseline): "one fully-characterized empirical case (v15 run UUID E72ABA74) and a hedged ~20% rate-of-occurrence estimate from the project's own CLAUDE.md"

**Check 1 (Source Verification):** VERIFIED — CLAUDE.md directly states "hits roughly 20% of deep-mode runs." The claim's "approximately 20 percent" is an accurate paraphrase.

**DRA Check 2:**
- **G4 (numbers accurate):** Claim says "approximately 20 percent" vs. source's "roughly 20%." These are equivalent hedged formulations. G4 NOT triggered.
- **G5 (fabrication):** Claim is directly sourced from CLAUDE.md. G5 NOT triggered.

**STATUS: VERIFIED**
**DRA flags observed: []**

---

## C4 — CLI v1-baseline 17 citations vs. 70-80 skill baseline

**Claim:** "A single CLI v1-baseline end-to-end run produced 17 citations against a skill baseline reported as 70 to 80 citations."

**Sources fetched:**
- notes/test-run-log.md → v12: 80 sources; v13: 70 sources
- cli/test-runs/v1-baseline/phase05_synthesize.md → numbered refs [1]-[15] = 15 unique references
- cli/test-runs/v1-baseline/phase07_refine.md → same refs [1]-[15], no new sources added
- cli/test-runs/v1-baseline/phase03_retrieve_academic.md → 13 sources in explicit sources list
- cli/test-runs/v1-baseline/phase04_triangulate.md → "13-15 sources per lens" (4 lenses, overlapping)

**Evidence for "70-80 citations" baseline (CONFIRMED):**
From notes/test-run-log.md:
- v12: "80" sources (vector databases topic)
- v13: "70" sources (AI agent observability topic)

**Evidence for "17 citations" in CLI v1-baseline (NOT CONFIRMED):**
- phase05_synthesize.md numbered references: [1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12], [13], [14], [15] = **15 unique references**
- phase07_refine.md: same [1]-[15] reference set; explicitly states "I'll avoid inventing new numbers to replace softened ones" — no new sources were added in the refine phase
- phase03_retrieve_academic.md: 13 sources listed explicitly at bottom
- **No file in v1-baseline explicitly states "17 citations"**
- The final research report (52KB) was not fully fetched; however, given that neither synthesis nor refine added sources beyond [1]-[15], 15 is the strongly likely total

**Analysis:** The claim says 17 citations. The synthesis and refine files together show 15 unique numbered references [1]-[15], with no sources added in the refine phase. The research report (final packaged output) is based on the refined synthesis, making 17 sources unlikely unless the package phase added 2 more — which is architecturally unexpected (Package phase is about formatting, not new retrieval).

**Check 1 (Source Verification):** QUESTIONABLE — "70-80" confirmed; "17 citations" contradicts the evidence showing 15 unique numbered sources through synthesis and refine phases.

**DRA Check 2:**
- **G4 (numbers accurate):** "17 citations" vs. 15 confirmed references in synthesis and refine. This is a concrete numerical discrepancy of 2. G4 TRIGGERED.
- **T2 (misaligned evidence):** Comparing CLI v1-baseline (CLI tool implementation, topic: CLI improvement) against skill v12/v13 (different codebase, different topics: vector DBs and AI observability). Different tools, different topics, different run configurations. The comparison applies evidence from different contexts. T2 TRIGGERED.

**STATUS: QUESTIONABLE**
**DRA flags observed: [G4, T2]**

---

## C7 — DeepFact PhD expert accuracy 60.8% rising to 90.9%

**Claim:** "PhD-level domain experts achieve 60.8 percent accuracy on deep-research factuality tasks unassisted, rising to 90.9 percent with iterative audit cycles per the DeepFact preprint."

**Source:** arXiv:2603.05912 (Playwright fetch of abstract page)

**Evidence quote (verbatim from arXiv:2603.05912 abstract):**
> "in a controlled study with PhD-level specialists, unassisted experts achieve only 60.8% accuracy on a hidden micro-gold set of verifiable claims. We propose Evolving Benchmarking via Audit-then-Score (AtS), where benchmark labels and rationales are explicitly revisable: when a verifier disagrees with the current benchmark, it must submit evidence; an auditor adjudicates the dispute; and accepted revisions update the benchmark before models are scored. Across four AtS rounds, expert micro-gold accuracy rises to 90.9%, indicating experts are substantially more reliable as auditors than as one-shot labelers."

**Paper context:** "Search-augmented LLM agents can produce deep research reports (DRRs), but verifying claim-level factuality remains challenging." Paper is specifically about DRR (Deep Research Report) factuality — directly matching the claim's "deep-research factuality tasks."

**Check 1 (Source Verification):** VERIFIED — exact numbers (60.8%, 90.9%) appear verbatim in the paper abstract. "Deep-research factuality tasks" correctly characterizes the paper's DRR focus. "Iterative audit cycles" accurately paraphrases "Audit-then-Score (AtS)" rounds.

**DRA Check 2:**
- **G4 (numbers accurate):** 60.8% and 90.9% are exact. G4 NOT triggered.
- **T2 (misaligned evidence):** The paper is specifically about DRR factuality — the same domain as the claim. T2 NOT triggered.

**STATUS: VERIFIED**
**DRA flags observed: []**

---

## C10 — FRAMES benchmark 0.40 to 0.66 accuracy

**Claim:** "FRAMES shows that for fact-retrieval tasks, retrieval pipelines raise accuracy from 0.40 to 0.66."

**Source:** arXiv:2409.12941 (Playwright fetch of abstract page)

**Evidence quote (verbatim from arXiv:2409.12941 abstract):**
> "Our dataset comprises challenging multi-hop questions that require the integration of information from multiple sources. We present baseline results demonstrating that even state-of-the-art LLMs struggle with this task, achieving 0.40 accuracy with no retrieval. The accuracy is significantly improved with our proposed multi-step retrieval pipeline, achieving an accuracy of 0.66 (>50% improvement)."

**Paper name and acronym:** FRAMES = **F**actuality, **R**etrieval, **A**nd **r**easoning **ME**asurement **S**et. The 'r' in the acronym stands for *reasoning* — the benchmark explicitly tests reasoning over multi-hop integration, not just fact retrieval.

**From the abstract:** "Our dataset comprises challenging **multi-hop questions that require the integration of information from multiple sources**" — not simple fact-lookup tasks.

**Check 1 (Source Verification):** The numbers 0.40 and 0.66 exactly match the abstract. The causal direction (retrieval raises accuracy) is correctly stated.

**DRA Check 2:**
- **R2 (oversimplification):** TRIGGERED. The claim says "for fact-retrieval tasks" but FRAMES explicitly tests "multi-hop questions that require the integration of information from multiple sources" — with REASONING as a primary, named component. The benchmark is designed around end-to-end RAG performance including reasoning chains. Characterizing this as "fact-retrieval tasks" drops the crucial reasoning requirement and mischaracterizes the benchmark's core test construct.
- **T3 (conflation of sources):** Only one source cited; T3 NOT triggered.

**STATUS: QUESTIONABLE** (numbers 0.40 and 0.66 are exact; but "fact-retrieval tasks" materially mischaracterizes FRAMES as a reasoning benchmark)
**DRA flags observed: [R2]**

---

## C13 — OpenCode provider not E2E tested with real OpenRouter key

**Claim:** "The OpenCode provider in cli/src/providers/opencode.ts has not been run end-to-end against a real OpenRouter key per a self-disclosed code comment in that file."

**Source:** cli/src/providers/opencode.ts (GitHub API, blob SHA: 7725ccae1f46f5198191b1c67b1344b57b599178)

**Evidence quote (verbatim from file header comment block):**
> "Honest scope note: I (Claude Opus, the implementer) cannot end-to-end test this provider — that requires a real OpenRouter key and the opencode binary on the user's machine. The unit tests mock spawn() and verify the contract up to the network boundary. The user's first real run with `--provider opencode` is the integration test."

**Check 1 (Source Verification):** VERIFIED — the file explicitly and directly states it has not been end-to-end tested with a real OpenRouter key. The claim accurately quotes the scope and limitation.

**DRA Check 2:**
- **T4 (lack of verification):** The source alone verifies this claim. T4 NOT triggered.
- **G5 (fabrication):** The code comment exists exactly as the claim describes. G5 NOT triggered.

**STATUS: VERIFIED**
**DRA flags observed: []**

---

## C16 — CLI sub-agents are one-shot SDK query calls

**Claim:** "CLI sub-agents are one-shot SDK query calls rather than multi-turn agent loops, capping retrieval depth regardless of prompt richness."

**Source:** cli/src/providers/claude.ts (GitHub API, blob SHA: 01671e2cf496d11c3b4e0bf58c41226679e09098)

**Evidence quote (verbatim from file header comment block):**
> "IMPORTANT: this is a v1 implementation focused on contract compliance. The SDK's query() is wrapped to fit our AgentProvider contract:
>   - callJudgment → single query() call, full response collected, token usage captured from the result message
>   - fanOut → parallel query() calls (one per SubAgentSpec), each writing to its outputFile atomically before its promise resolves
>
> The SDK supports richer features (sub-agent orchestration via AgentDefinition, MCP servers, hooks) that we do not use in v1 — the orchestrator is the deterministic state machine, not the SDK's agent-loop. Sub-agents are just parallel one-shot queries."

**Additional code context:** The provider uses `permissionMode: "bypassPermissions"` which enables Claude Code agents (spawned by each query() call) to internally use tools (web search, file reads, multi-step retrieval) without per-call permission gates. Each "one-shot query" at the API level spawns a full agentic Claude Code session internally.

**Check 1 (Source Verification):** VERIFIED for the core claim — "Sub-agents are just parallel one-shot queries" and the "one-shot" vs. "agent-loop" distinction are directly from the source.

**DRA Check 2:**
- **G3 (specification deviation):** The claim is about the CLI architecture — within research scope. G3 NOT triggered.
- **R2 (oversimplification):** TRIGGERED. The claim adds "capping retrieval depth regardless of prompt richness" which goes beyond what the source states. The source says sub-agents are one-shot at the API level (one `query()` call per sub-agent). However, `query()` in the Claude Agent SDK launches a full Claude Code agent with `bypassPermissions`, which CAN internally perform multi-step web searches, tool calls, and iterative retrieval. The claim's inference that this "caps retrieval depth regardless of prompt richness" is not stated in the source and oversimplifies the actual behavior: retrieval depth within each `query()` call depends on what the agent internally does, which IS affected by prompt richness.

**STATUS: VERIFIED** (core claim matches source; R2 triggered for editorial inference beyond source)
**DRA flags observed: [R2]**

---

## Final Summary Table

| Claim | Status | Key Evidence Quote | Source | DRA Flags |
|---|---|---|---|---|
| C1 | VERIFIED | "hits roughly 20% of deep-mode runs" | CLAUDE.md | None |
| C4 | QUESTIONABLE | synthesis+refine show 15 refs [1]-[15] not 17; 70-80 confirmed | test-run-log, phase05, phase07 | G4, T2 |
| C7 | VERIFIED | "60.8% accuracy...rises to 90.9%" | arXiv:2603.05912 | None |
| C10 | QUESTIONABLE | 0.40/0.66 exact; "fact-retrieval" drops reasoning | arXiv:2409.12941 | R2 |
| C13 | VERIFIED | "cannot end-to-end test this provider" | opencode.ts | None |
| C16 | VERIFIED | "Sub-agents are just parallel one-shot queries" | claude.ts | R2 |

---

## TASK STATUS SUMMARY
- C1: done (findings in section 'C1 — Deep-research mode hang failure rate ~20%')
- C4: done (findings in section 'C4 — CLI v1-baseline 17 citations vs. 70-80 skill baseline')
- C7: done (findings in section 'C7 — DeepFact PhD expert accuracy 60.8% rising to 90.9%')
- C10: done (findings in section 'C10 — FRAMES benchmark 0.40 to 0.66 accuracy')
- C13: done (findings in section 'C13 — OpenCode provider not E2E tested with real OpenRouter key')
- C16: done (findings in section 'C16 — CLI sub-agents are one-shot SDK query calls')

---

## Think2 EVALUATE

**1. Goal achieved?** Yes — all 6 claims verified against primary sources fetched during this session (no training data relied upon). Specific evidence: CLAUDE.md (C1), test-run-log + phase05/07 (C4), arXiv:2603.05912 abstract (C7), arXiv:2409.12941 abstract (C10), opencode.ts (C13), claude.ts (C16).

**2. Quality counts:**
- VERIFIED: 4 (C1, C7, C13, C16)
- QUESTIONABLE: 2 (C4, C10)
- UNVERIFIABLE: 0
- CONTRADICTED: 0
- DRA flags actually triggered: R2 for C10 and C16; G4+T2 for C4 = 4 flags across 3 claims
- All sources directly fetched: YES (GitHub API + Playwright — no training data)
- Quotes exact (verbatim): YES for all evidence quotes
- G5 flags detected: NONE (no fabrication found in any claim)
- Pattern: R2 (oversimplification) in 2 claims (C10, C16)

**3. Hand-off to next phase — watch for:**
- **C4's "17 citations":** The synthesis and refine files both show 15 unique numbered references [1]-[15]. The claim's "17" cannot be confirmed. The final research report (52KB) was not byte-for-byte checked, but the evidence strongly suggests 15, not 17. Lead agent should decide whether to accept QUESTIONABLE or fetch the report's references section to confirm.
- **C10 R2 pattern:** If the downstream report uses FRAMES to argue about "retrieval-only" capability (without acknowledging the reasoning component), the report's conclusions in that area may be systematically understated/distorted.

**4. MONITOR notes:**
- Avoided failure (a): All files fetched from GitHub API and Playwright; system prompt context not used as evidence.
- Avoided failure (b): Read full code files and paper abstracts; did not stop at search result summaries.
- Avoided failure (c): No UNVERIFIABLE results; escalation not needed.
- Correctly handled failure (e): G4/G5 tags on C1 and C13 were NOT triggered (found no concrete problem); correctly reported empty DRA arrays.
- Key discovery on C4: refine-phase check confirmed 15 sources in [1]-[15], not 17. This is the most important factual correction in this verification batch.
