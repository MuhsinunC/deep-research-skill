# Phase 7.5 — Citation Verification (Sub-lens: citation_1)

**Verifier:** Sonnet sub-agent
**Date:** 2026-05-08
**Claims batch:** C1, C4, C7, C10, C13, C16

---

## Sources Fetched

- CLAUDE.md from MuhsinunC/deep-research-skill (GitHub API)
- notes/test-run-log.md (GitHub API)
- cli/test-runs/v1-baseline/phase03_retrieve_academic.md (GitHub API)
- cli/test-runs/v1-baseline/phase04_triangulate.md (GitHub API)
- cli/test-runs/v1-baseline/phase05_synthesize.md (GitHub API)
- cli/test-runs/v1-baseline/phase06_critique.md (GitHub API)
- cli/src/providers/opencode.ts (GitHub API)
- cli/src/providers/claude.ts (GitHub API)
- arXiv:2603.05912 abstract (Playwright, DeepFact paper)
- arXiv:2409.12941 abstract (Playwright, FRAMES paper)
- WebSearch: DeepFact 60.8 90.9 accuracy
- WebSearch: FRAMES 0.40 0.66 retrieval pipeline

---

## C1 — Deep-research mode hang failure rate ~20%

**Claim:** "The deep-research skill's deep-research mode exhibits a documented hang failure mode at a reported approximately 20 percent rate per run."

**Source fetched:** CLAUDE.md (GitHub API)

**Evidence quote from source:**
"Task tool sub-agents can hang at 0% CPU indefinitely, blocking the parent. This failure mode hits roughly 20% of deep-mode runs. See notes/adr/001-task-tool-vs-claude-p-subagents.md for the decision to switch to claude -p subprocesses; the switch is planned but not yet implemented."

**Additional corroboration:** phase06_critique.md from v1-baseline confirms: "the synthesis itself acknowledges in CLAUDE.md the figure is 'roughly 20%' — a hedged estimate, not a measurement."

**Check 1 (Source Verification):** VERIFIED — CLAUDE.md directly states "hits roughly 20% of deep-mode runs."

**DRA Check 2:**
- G4 (numbers accurate): "approximately 20 percent" matches "roughly 20%." G4 NOT triggered.
- G5 (fabrication): Not fabricated — directly in CLAUDE.md. G5 NOT triggered.

**STATUS: VERIFIED**
**DRA flags observed: []**

---

## C4 — CLI v1-baseline 17 citations vs. 70-80 skill baseline

**Claim:** "A single CLI v1-baseline end-to-end run produced 17 citations against a skill baseline reported as 70 to 80 citations."

**Sources fetched:**
- notes/test-run-log.md → v12: 80 sources; v13: 70 sources
- cli/test-runs/v1-baseline/phase05_synthesize.md → uses references [1]-[15] = 15 numbered sources
- cli/test-runs/v1-baseline/phase03_retrieve_academic.md → 13 sources listed at bottom
- cli/test-runs/v1-baseline/phase04_triangulate.md → "13-15 sources per lens"

**Evidence for "70-80 citations" baseline:**
From notes/test-run-log.md: v12 = 80 sources; v13 = 70 sources. This range is confirmed.

**Evidence for "17 citations" in v1-baseline:**
- phase05_synthesize.md numbered references go from [1] to [15] = 15 unique numbered sources
- phase03_retrieve_academic.md lists exactly 13 sources at its Sources section
- phase04_triangulate.md says "13-15 sources per lens" with 4 lenses (significant overlap across lenses)
- No file explicitly states "17 citations" — the number 17 does not appear in any checked file
- The final research report (52KB) was not fully fetched; citation count in the final packaged report is uncertain

**Check 1 (Source Verification):** QUESTIONABLE — the "70-80" baseline is confirmed from test-run-log; the "17 citations" number is not confirmed and conflicts with the synthesis's 15 numbered references.

**DRA Check 2:**
- G4 (numbers accurate): "17" claimed vs. 15 in synthesis — concrete numerical discrepancy. G4 TRIGGERED.
- T2 (misaligned evidence): Comparing CLI v1-baseline (new CLI tool, specific topic: CLI improvement) to skill v12/v13 (different codebase, different topics: vector DBs, agent observability). These are different systems on different topics. T2 TRIGGERED.

**STATUS: QUESTIONABLE**
**DRA flags observed: [G4, T2]**

---

## C7 — DeepFact PhD expert accuracy 60.8% rising to 90.9%

**Claim:** "PhD-level domain experts achieve 60.8 percent accuracy on deep-research factuality tasks unassisted, rising to 90.9 percent with iterative audit cycles per the DeepFact preprint."

**Source fetched:** arXiv:2603.05912 abstract (Playwright)

**Evidence quote (direct from arXiv abstract):**
"in a controlled study with PhD-level specialists, unassisted experts achieve only 60.8% accuracy on a hidden micro-gold set of verifiable claims. We propose Evolving Benchmarking via Audit-then-Score (AtS), where benchmark labels and rationales are explicitly revisable: when a verifier disagrees with the current benchmark, it must submit evidence; an auditor adjudicates the dispute; and accepted revisions update the benchmark before models are scored. Across four AtS rounds, expert micro-gold accuracy rises to 90.9%, indicating experts are substantially more reliable as auditors than as one-shot labelers."

**Check 1 (Source Verification):** VERIFIED — exact numbers (60.8%, 90.9%) match paper abstract verbatim. Paper specifically addresses Deep Research Reports (DRRs) factuality, matching "deep-research factuality tasks."

**DRA Check 2:**
- G4: 60.8% and 90.9% are exact. G4 NOT triggered.
- T2: "deep-research factuality tasks" matches paper's focus on DRR factuality. T2 NOT triggered.

**STATUS: VERIFIED**
**DRA flags observed: []**

---

## C10 — FRAMES benchmark 0.40 to 0.66 accuracy

**Claim:** "FRAMES shows that for fact-retrieval tasks, retrieval pipelines raise accuracy from 0.40 to 0.66."

**Source fetched:** arXiv:2409.12941 abstract (Playwright)

**Evidence quote (direct from arXiv abstract):**
"Our dataset comprises challenging multi-hop questions that require the integration of information from multiple sources. We present baseline results demonstrating that even state-of-the-art LLMs struggle with this task, achieving 0.40 accuracy with no retrieval. The accuracy is significantly improved with our proposed multi-step retrieval pipeline, achieving an accuracy of 0.66 (>50% improvement)."

**Full paper name:** FRAMES = Factuality, Retrieval, And **reasoning** MEasurement Set

**Check 1 (Source Verification):** VERIFIED for the numbers — 0.40 and 0.66 exactly match the abstract.

**DRA Check 2:**
- R2 (oversimplification): TRIGGERED — The claim says "fact-retrieval tasks" but FRAMES tests "multi-hop questions that require the integration of information from multiple sources" with **reasoning** as a primary component. The 'R' in FRAMES stands for "reasoning." The benchmark specifically tests end-to-end RAG scenarios requiring multi-hop synthesis, not simple fact retrieval. Dropping "reasoning" from the characterization is a concrete oversimplification.
- T3 (conflation of sources): Only one source cited. T3 NOT triggered.

**STATUS: QUESTIONABLE** (numbers correct; "fact-retrieval tasks" drops the crucial "reasoning" component of what FRAMES measures)
**DRA flags observed: [R2]**

---

## C13 — OpenCode provider not E2E tested with real OpenRouter key

**Claim:** "The OpenCode provider in cli/src/providers/opencode.ts has not been run end-to-end against a real OpenRouter key per a self-disclosed code comment in that file."

**Source fetched:** cli/src/providers/opencode.ts (GitHub API)

**Evidence quote (direct from file header):**
"Honest scope note: I (Claude Opus, the implementer) cannot end-to-end test this provider — that requires a real OpenRouter key and the opencode binary on the user's machine. The unit tests mock spawn() and verify the contract up to the network boundary. The user's first real run with --provider opencode is the integration test."

**Check 1 (Source Verification):** VERIFIED — file explicitly self-discloses that it has not been end-to-end tested with a real OpenRouter key.

**DRA Check 2:**
- T4 (lack of verification): NOT triggered — source alone verifies this claim.
- G5 (fabrication): NOT triggered — comment exists exactly as described.

**STATUS: VERIFIED**
**DRA flags observed: []**

---

## C16 — CLI sub-agents are one-shot SDK query calls

**Claim:** "CLI sub-agents are one-shot SDK query calls rather than multi-turn agent loops, capping retrieval depth regardless of prompt richness."

**Source fetched:** cli/src/providers/claude.ts (GitHub API)

**Evidence quote (direct from file header):**
"IMPORTANT: this is a v1 implementation focused on contract compliance. The SDK's query() is wrapped to fit our AgentProvider contract:
  - callJudgment -> single query() call, full response collected, token usage captured from the result message
  - fanOut -> parallel query() calls (one per SubAgentSpec), each writing to its outputFile atomically before its promise resolves

The SDK supports richer features (sub-agent orchestration via AgentDefinition, MCP servers, hooks) that we do not use in v1 — the orchestrator is the deterministic state machine, not the SDK's agent-loop. Sub-agents are just parallel one-shot queries."

**Check 1 (Source Verification):** VERIFIED for the core claim — "Sub-agents are just parallel one-shot queries" directly from the source.

**Additional nuance:** The code uses permissionMode: "bypassPermissions" which enables the SDK agent to use tools internally (web search, etc.). So "one-shot" describes the API-level call count (one query() per sub-agent), not the agent's internal behavior.

**DRA Check 2:**
- G3 (specification deviation): NOT triggered — within research scope.
- R2 (oversimplification): TRIGGERED — "capping retrieval depth regardless of prompt richness" is an editorial inference not directly stated in the source. The code says sub-agents make one query() call each, but each query() enables a full Claude Code agent with bypassPermissions that can internally perform multi-step web searches and tool calls. The inference that this "caps retrieval depth" oversimplifies the actual behavior.

**STATUS: VERIFIED** (core claim confirmed; R2 flag for the editorial "capping" inference)
**DRA flags observed: [R2]**

---

## Summary Table

| Claim | Status | Key Evidence Quote | DRA Flags Triggered |
|---|---|---|---|
| C1 | VERIFIED | "hits roughly 20% of deep-mode runs" (CLAUDE.md) | None |
| C4 | QUESTIONABLE | synthesis has [1]-[15]=15 refs not 17; 70-80 confirmed | G4, T2 |
| C7 | VERIFIED | "60.8% accuracy...rises to 90.9%" (arXiv:2603.05912) | None |
| C10 | QUESTIONABLE | 0.40/0.66 correct; "fact-retrieval" drops "reasoning" | R2 |
| C13 | VERIFIED | "cannot end-to-end test this provider" (opencode.ts) | None |
| C16 | VERIFIED | "Sub-agents are just parallel one-shot queries" (claude.ts) | R2 |

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

**1. Goal achieved?** Yes — all 6 claims verified against primary sources fetched during this session. No training data relied upon.

**2. Quality counts:**
- VERIFIED: 4 (C1, C7, C13, C16)
- QUESTIONABLE: 2 (C4, C10)
- UNVERIFIABLE: 0
- CONTRADICTED: 0
- DRA flags actually triggered: R2 for C10 and C16; G4+T2 for C4 = 4 flags across 3 claims
- All sources directly fetched: YES
- Quotes exact: YES
- G5 flags detected: NONE
- Pattern: R2 (oversimplification) appears in 2 claims (C10, C16)

**3. Hand-off to next phase — watch for:**
- C4: "17 citations" unconfirmed — the final research report was not fully fetched. The synthesis shows 15 numbered references. The lead agent may wish to fetch the 52KB report to count exact citations.
- R2 pattern on C10: if the downstream synthesis relies on FRAMES to argue about "fact-retrieval" capabilities, this characterization misleads.

**4. MONITOR notes:**
- Predicted failure (a): Avoided — all sources fetched from GitHub API and arXiv, NOT from training data.
- Predicted failure (b): Avoided — read full abstracts and whole code files.
- Predicted failure (c): N/A — no UNVERIFIABLE results.
- Correctly handled failure (e): G4/G5 on C1 and C13 were tagged but not triggered — correctly reported empty DRA flags.
- Newly found issue on C4: "17 citations" appears unconfirmed. This is the most uncertain finding.
