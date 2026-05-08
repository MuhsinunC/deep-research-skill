# Phase 7.5 VERIFY — Citation Verifier 2 (Sub-Lens: citation_2)

**Generated:** 2026-05-07  
**Verifier role:** Citation verification sub-agent, Step 2 of Phase 7.5 VERIFY.  
**Claims assigned:** C2, C5, C8, C11, C14, C17

---

## Think2 PLAN

**Goal:** Verify 6 atomic claims (C2, C5, C8, C11, C14, C17) against actual evidence, assess whether tagged DRA failure modes concretely manifest.

**Inputs:** 6 claim texts with DRA tags; NO source URLs provided — must discover sources via search and local codebase inspection.

**Approach:**
- C2: Check Claude Agent SDK docs and Task tool behavior from empirical evidence
- C5: Verify specific GitHub issue numbers (#34, #42, #701, #255) in TypeScript + Python SDK repos
- C8: Verify OpenCode/OpenRouter CLI bugs and SIGHUP/4.7 GB claim
- C11: Inspect local CLI source code (phase07_5_verify.ts + orchestrator.ts)
- C14: Check ROADMAP.md M20 bug documentation vs. claim's four bugs
- C17: Verify FRAMES 0.40/0.66 numbers and ResearcherBench synthesis correlation claim

---

## Evidence Collection

### C2: Claude Agent SDK Task tool — no per-agent timeout

**Sources fetched:**
- Web search: Claude Agent SDK timeout mechanisms documentation
- GitHub issues: claude-agent-sdk-python/issues (v15 empirical hang evidence)
- notes/test-run-log.md (local codebase)
- PLAN.md (local codebase)

**Findings:**

From `notes/test-run-log.md` (v15 row):
> "Sub-agents #1 (27KB) and #2 (34KB) completed successfully; sub-agents #3 and #4 hung indefinitely — process stayed at 0% CPU with no file changes for 35+ minutes. Matches documented failure mode (#17147, #37521) — Task tool synchronous parallel spawn blocks parent if any sub-agent hangs."

From `notes/ROADMAP.md` (Stream C1 context):
> "Task tool sub-agents can hang at 0% CPU indefinitely, blocking the parent. This failure mode hits roughly 20% of deep-mode runs."

From PLAN.md (Known gotchas section in root CLAUDE.md):
> "Task tool sub-agents can hang at 0% CPU indefinitely, blocking the parent. This failure mode hits roughly 20% of deep-mode runs. See notes/adr/001-task-tool-vs-claude-p-subagents.md for the decision to switch to claude -p subprocesses."

The web search found hook timeouts (60s default) and MCP_TOOL_TIMEOUT (30s for MCP tool execution) and BASH_DEFAULT_TIMEOUT_MS — but these apply to different mechanisms than the Task tool's sub-agent spawning.

**Issue #42** (claude-agent-sdk-typescript): "Bug Report: SDK Has Hardcoded 30-Second Tool Timeout" — but this is about MCP tool execution, not Task sub-agent spawning.

**Issue #49150** (claude-code): From the v1-baseline verify file: "Parent session deadlocks when subagent tool execution hangs" — confirms the hang behavior.

**DRA Check:**
- R2 (oversimplification): Does the claim drop important qualifications? The claim says "no per-agent timeout mechanism" and "blocks parent indefinitely." Both are accurate per empirical evidence. There ARE hook timeouts and bash timeouts, but NOT for the Task tool's sub-agent spawning mechanism. R2 does NOT concretely trigger.
- T3 (conflation of different sources): No multiple sources being conflated. T3 does NOT trigger.

**VERDICT: VERIFIED**

Evidence quote: "Sub-agents #3 and #4 hung indefinitely — process stayed at 0% CPU with no file changes for 35+ minutes. Matches documented failure mode (#17147, #37521) — Task tool synchronous parallel spawn blocks parent if any sub-agent hangs."

---

### C5: Claude Agent SDK hang/timeout issues #34, #42, #701, #255

**Sources fetched:**
- GitHub search: anthropics/claude-agent-sdk-typescript issues
- GitHub search: anthropics/claude-agent-sdk-python issues
- Direct issue URL lookups via web search

**Findings per issue:**

**Issue #34 (claude-agent-sdk-typescript):** "[PERFORMANCE] Claude Agent SDK query() has ~12s overhead per call - No hot process reuse"  
- This is a PERFORMANCE overhead issue (12-second cold-start per call), NOT a hang or timeout
- The issue is labeled as "HIGHEST PRIORITY" for production viability
- It reports latency overhead (~12s vs. 1-3s for direct API calls) — NOT indefinite hanging

**Issue #42 (claude-agent-sdk-typescript):** "Bug Report: SDK Has Hardcoded 30-Second Tool Timeout"  
- This IS a timeout issue — tools are marked as timed out after 30 seconds even when they complete successfully
- Correctly characterized as a timeout bug

**Issue #701 (claude-agent-sdk-python):** "Agent SDK CLI hangs indefinitely during synthesis after successful tool calls"  
- This IS a hang issue (confirmed from search results: reported 2026-03-19)
- Correctly characterized as a hang bug

**Issue #255 (claude-agent-sdk-typescript):** "query() hangs forever when CLI subprocess fails to start (ENOENT / missing env)"  
- This IS a hang issue (query() never yields/returns when subprocess fails)
- Correctly characterized as a hang bug

**Assessment of the claim:**  
The claim says issues span "both Python and TypeScript SDK repositories":  
- TypeScript: #34, #42, #255
- Python: #701
This part is correct — both repos have issues.

However, the claim characterizes #34 as a "hang and timeout" issue. Issue #34 is explicitly a **performance overhead** issue (~12s cold-start latency), not a hang or timeout. The process doesn't hang — it completes, just slowly. This mischaracterizes #34.

**DRA Check:**
- T1 (deficient acquisition): Issue #34 is cited as evidence for "hang and timeout" issues, but it's actually a performance issue. The claim would be more accurately supported by citing different issues (e.g., #208, #533) that are genuine hang/timeout cases. T1 TRIGGERS for #34.
- T4 (lack of verification): The claim IS verifiable from GitHub. T4 does NOT trigger.

**VERDICT: QUESTIONABLE**

Evidence quote from issue #34: "[PERFORMANCE] Claude Agent SDK query() has ~12s overhead per call - No hot process reuse. Each query takes approximately 12 seconds regardless of whether it's the first, second, or third query." (This is a performance issue, not a hang/timeout.)

---

### C8: CLI provider-layer failures — OpenCode hang, OpenRouter misclassification, colon crashes, SIGHUP 4.7 GB

**Sources fetched:**
- Web search: OpenCode hang on API error GitHub issues
- Web search: OpenRouter outage misclassification CLI issues
- Web search: SIGHUP handler missing orphan process 4.7 GB

**Findings per failure category:**

1. **OpenCode hang-on-API-error:** Confirmed — Issue #8203 in anomalyco/opencode: "opencode run hangs forever on API errors (breaks CLI/automation integrations). When opencode run encounters an API error (e.g., 429 rate limit), it logs the error but never exits — it hangs indefinitely."

2. **OpenRouter outage misclassification:** Confirmed — Issue #915 in anomalyco/opencode and Issue #45663 in openclaw/openclaw: Provider returns generic "Provider returned error" message; failover classifier returns null; no fallback model attempted. Multiple related issues in opencode's GitHub.

3. **Model-ID colon parse crashes:** Confirmed — Issue #749 in anomalyco/opencode: "Bug: opencode crashes when using OpenRouter models with a colon (:) in their identifier."

4. **Missing SIGHUP handlers causing ~4.7 GB orphan-process leaks:** Confirmed — Issue #14504 in anomalyco/opencode: "Missing SIGHUP handler causes orphaned processes to leak ~4.7 GB each after terminal death." Additionally Issues #12767 and #12913 document the same class of problem.

All four failure categories are confirmed in actual GitHub issues in the opencode repository. The deep-research CLI uses OpenCode as an alternative provider (`--provider opencode`), so these bugs represent genuine failure categories it inherits.

**DRA Check:**
- G4 (deficient rigor): The "approximately 4.7 GB" figure is CONFIRMED from Issue #14504. This is precise and accurate. G4 does NOT trigger.
- G5 (strategic fabrication): All four failure categories exist in actual GitHub issues. G5 does NOT trigger.

**VERDICT: VERIFIED**

Evidence quote: From Issue #14504 (anomalyco/opencode): "Missing SIGHUP handler causes orphaned processes to leak ~4.7 GB each after terminal death." From Issue #8203: "opencode run hangs forever on API errors (breaks CLI/automation integrations)."

---

### C11: Phase 7.5 VERIFY loop-back permanently disabled in CLI source code

**Sources fetched:**
- cli/src/phases/phase07_5_verify.ts (local codebase via GitHub)
- cli/src/orchestrator.ts (local codebase via GitHub)
- cli/PLAN.md (local codebase via GitHub)
- notes/ROADMAP.md (local codebase via GitHub)

**Findings:**

From `cli/src/phases/phase07_5_verify.ts`:
```typescript
// Loop-back decision: M19 will implement DRA aggregation + claim-level
// contradiction count. For v1 placeholder, never loop back automatically;
// operators can manually re-run by deleting verify artifacts and resuming.
return {
  phase: "VERIFY",
  checkpointExtra: {
    verifier_count: ctx.intensity.verifyVerifierCount,
    adversarial_present: true,
    claims_extracted: claims.length,
    temporal_supersession: { skipped: "v2-deferred" },
    verifier_retry: { skipped: "v2-deferred" },
  },
};
```

The phase NEVER returns a `loopBackTo` signal — confirmed that loop-back does NOT happen in v1.

However, from `cli/src/orchestrator.ts`:
```typescript
// Loop-back state: when a phase returns loopBackTo, jump there for one
// additional pass. The Phase 7.5 → Phase 7 loop-back is the main use case;
// budget enforcement is the phase handler's responsibility (we just hop).
let loopBackBudget = intensity.verifyLoopBackBudget;
...
// Loop-back handling.
if (phaseResult.loopBackTo !== undefined) {
  ...
  loopBackBudget--;
  const loopTargetIdx = phases.indexOf(phaseResult.loopBackTo);
  ...
  i = loopTargetIdx;
  continue;
}
```

The orchestrator HAS loop-back infrastructure already implemented. The loop-back mechanism works — it simply isn't triggered because `phase07_5_verify.ts` never sets `loopBackTo`.

From PLAN.md: "Loop-back budget enforced (2 cycles; 3 in ultradeep)" appears in M13 spec (not yet implemented in v1).

From code comment: "M19 will implement DRA aggregation + claim-level contradiction count." This indicates it is DEFERRED to M19/v2, NOT permanently disabled.

From notes/ROADMAP.md M20 section: M19 was completed, but none of the M19 Critical issues fixed involved implementing loop-back. The loop-back remains deferred to v2.

**Key distinction:** The claim says "permanently disabled." The source code says:
1. "For v1 placeholder, never loop back automatically" — explicitly a placeholder
2. "M19 will implement DRA aggregation + claim-level contradiction count" — planned for future
3. The orchestrator already has loop-back infrastructure working
4. PLAN.md describes loop-back budgets (2/3 by mode) — architecture ready

**DRA Check:**
- G3 (specification deviation): "Permanently disabled" is materially inaccurate. The source code explicitly calls this a "v1 placeholder" with "M19 will implement" the logic. The orchestrator has the loop-back infrastructure. "Deferred to v2" ≠ "permanently disabled." G3 TRIGGERS.
- T4 (lack of verification): I CAN verify this from the source code. T4 does NOT trigger.

**VERDICT: QUESTIONABLE**

Evidence quote from phase07_5_verify.ts: "Loop-back decision: M19 will implement DRA aggregation + claim-level contradiction count. For v1 placeholder, never loop back automatically; operators can manually re-run by deleting verify artifacts and resuming."

Additional evidence from orchestrator.ts showing loop-back IS implemented: "Loop-back state: when a phase returns loopBackTo, jump there for one additional pass. The Phase 7.5 → Phase 7 loop-back is the main use case; budget enforcement is the phase handler's responsibility (we just hop)."

---

### C14: CLI v1 M20 testing — four distinct silent-failure bugs

**Sources fetched:**
- notes/ROADMAP.md M20 section (local codebase via GitHub)
- cli/PLAN.md M20 section (local codebase via GitHub)
- cli/test-runs/v1-baseline directory listing (file sizes)

**Claim's four bugs:**
1. A permission gate producing empty output
2. A message extraction bug producing empty artifacts
3. An output-style injection causing failure
4. An academic-lens output 8 times larger than expected without warning

**ROADMAP.md M20 actual bugs documented (5 bugs, runs 1-4):**
1. ESM module resolution failure (.js bundle issue) — renamed to .mjs
2. SDK couldn't find native CLI binary (esbuild stripped it) — `pathToClaudeCodeExecutable` resolution
3. SDK assistant message text nested at `.message.content` not `.content` — fixed message extraction
4. **Spawned subprocess hit web_search permission gate and silently aborted with empty output** — added `permissionMode: "bypassPermissions"` to SDK options
5. Strict zod schemas caused ProviderParseError when LLM returned prose around JSON — relaxed to plain Markdown

**Matching analysis:**
- Bug 1 (claim: permission gate → empty output) → Bug 4 in ROADMAP ✓ ("hit web_search permission gate and silently aborted with empty output")
- Bug 2 (claim: message extraction → empty artifacts) → Bug 3 in ROADMAP ✓ ("SDK assistant message text was nested at .message.content, not .content")
- Bug 3 (claim: output-style injection causing failure) → Bug 5 in ROADMAP ✓ ("Strict zod schemas on SCOPE/PLAN responses caused ProviderParseError when LLM returned prose around JSON")
- Bug 4 (claim: academic-lens output 8× larger than expected) → **NOT IN ROADMAP** ✗

**The "academic-lens output 8 times larger" contradiction:**  
The v1-baseline directory contains:
- `phase03_retrieve_academic.md`: 3,795 bytes
- `phase03_retrieve_critical.md`: 23,333 bytes  
- `phase03_retrieve_historical.md`: 30,918 bytes
- `phase03_retrieve_practitioner.md`: 29,748 bytes

The academic lens produced FAR LESS output (3.7KB vs 23-30KB for others), NOT 8× larger. This directly contradicts the claim's quantitative assertion.

Additional discrepancies:
- The ROADMAP lists FIVE bugs, not four
- Bugs 1-2 in the ROADMAP (ESM module resolution, SDK binary finding) are NOT in the claim's list
- The claim characterizes all four as "silent-failure bugs" — but ESM module resolution and SDK binary not found would NOT be silent failures; they'd cause obvious crashes

**DRA Check:**
- G4 (deficient rigor): The "8 times larger" quantity is inaccurate — the actual file sizes show the academic lens produced LESS output, not more. G4 TRIGGERS.
- T4 (lack of verification): Bug 4 of the claim (academic-lens 8×) is not verifiable from any documented source. T4 TRIGGERS.

**VERDICT: QUESTIONABLE**

Evidence quote from ROADMAP.md: "Bugs found and fixed during E2E (runs 1-4 → run 5): ... 4. Spawned subprocess hit web_search permission gate and silently aborted with empty output — added permissionMode: 'bypassPermissions' to SDK options. This was the biggest gotcha — phases reported 'complete' but produced empty artifacts because the subprocess refused to use tools without interactive approval."

The academic-lens 8× bug is not documented in ROADMAP.md and is contradicted by actual file sizes.

---

### C17: FRAMES 0.40-0.66 retrieval lift vs. ResearcherBench synthesis correlation

**Sources fetched:**
- Web search: FRAMES benchmark accuracy metrics
- Web search: ResearcherBench citation density synthesis correlation
- arxiv.org/abs/2409.12941 (FRAMES paper)
- researcherbench.github.io

**Findings:**

**FRAMES 0.40 → 0.66 numbers:**  
CONFIRMED — The FRAMES paper (arxiv 2409.12941, "Fact, Fetch, and Reason") reports:
- 0.40 accuracy: LLMs with no retrieval
- 0.66 accuracy: Multi-step retrieval pipeline with explicit planning
- This is an improvement from 0.40 to 0.66 — confirmed

**However — what FRAMES actually measures vs. what the claim says:**  
FRAMES measures **retrieval accuracy improvement on a multi-hop QA benchmark** (824 challenging questions requiring integration from multiple sources). The 0.40 and 0.66 figures are model accuracy on factual QA tasks.

The claim says: "Citation density correlates with quality on fact-retrieval tasks per FRAMES showing a 0.40 to 0.66 retrieval lift."

But FRAMES does NOT measure "citation density" as a variable. FRAMES measures whether **retrieval** (access to relevant documents) improves factual accuracy. These are different concepts:
- FRAMES shows: retrieval (fetching relevant documents) helps accuracy (0.40 → 0.66)
- Claim says: citation density correlates with quality

**ResearcherBench claim:**  
The search found ResearcherBench evaluates DARS (Deep AI Research Systems) using both qualitative insight evaluation and quantitative factual assessment. It focuses on "depth of understanding and insight generation rather than breadth of information coverage."

No specific data was found showing that ResearcherBench demonstrates "citation density does not correlate with quality on synthesis or insight tasks." The ResearcherBench paper may distinguish between factual and insight quality, but the specific claim that citation density doesn't correlate with synthesis quality is not confirmed from available sources.

**DRA Check:**
- T2 (misaligned evidence): FRAMES measures retrieval-augmented accuracy, not "citation density" as a predictor. The evidence is from a different context (retrieval vs. no-retrieval accuracy) being applied to a claim about citation density correlation. T2 TRIGGERS.
- R2 (lack of depth): The claim omits that 0.40/0.66 are accuracy numbers on a specific 824-question multi-hop QA benchmark, not a general "citation density vs. quality" measurement. The variable being measured (retrieval access, not citation density) is different from what the claim says. R2 TRIGGERS.

**VERDICT: QUESTIONABLE**

Evidence quote from FRAMES search results: "State-of-the-art LLMs achieve 0.40 accuracy with no retrieval, and the accuracy is significantly improved with the proposed multi-step retrieval pipeline, achieving an accuracy of 0.66."

The 0.40/0.66 numbers are accurate for FRAMES, but FRAMES measures retrieval impact on accuracy (not citation density correlation with quality).

---

## Summary Table

| Claim | Status | DRA Flags Triggered | Key Evidence |
|---|---|---|---|
| C2 | VERIFIED | None | v15 test: Task sub-agents hung 35+ min, parent blocked; no timeout mechanism documented for Task tool |
| C5 | QUESTIONABLE | T1 | Issue #34 is performance overhead, not a hang/timeout; #42/#701/#255 are genuine hang/timeout issues |
| C8 | VERIFIED | None | OpenCode issues #8203, #749, #14504, #915 confirm all four failure categories with correct details |
| C11 | QUESTIONABLE | G3 | Loop-back disabled in v1 code, but NOT permanently — code says "M19 will implement"; orchestrator has loop-back infrastructure ready |
| C14 | QUESTIONABLE | G4, T4 | 3 of 4 bugs match ROADMAP; "academic-lens 8× larger" not documented anywhere; file sizes show academic lens was SMALLER; ROADMAP lists 5 bugs not 4 |
| C17 | QUESTIONABLE | T2, R2 | FRAMES 0.40/0.66 numbers correct but FRAMES measures retrieval accuracy, not citation density correlation; ResearcherBench synthesis claim unverifiable |

---

## Think2 EVALUATE

**1. Goal achieved?**  
Yes. All 6 claims were verified against primary sources (local codebase, GitHub issues, web search). Evidence for each was retrieved from authoritative sources (source code, ROADMAP.md, GitHub issues, academic paper search).

**2. Quality counts:**
- VERIFIED: 2 (C2, C8)
- QUESTIONABLE: 4 (C5, C11, C14, C17)
- UNVERIFIABLE: 0
- CONTRADICTED: 0
- DRA flags actually triggered: T1 (C5), G3 (C11), G4+T4 (C14), T2+R2 (C17) — 5 total flag instances
- Did I fetch every source rather than relying on training data? Yes — fetched actual source files via GitHub MCP and web searches.
- For UNVERIFIABLE results, did I escalate tiers? N/A — no UNVERIFIABLE results.
- Quotes are direct from sources, not paraphrased.
- **No G5 flags** — no outright fabrication detected. However, the "academic-lens 8× larger" in C14 is not supported by any documentation (G4 + T4).
- Pattern: 3 of 4 QUESTIONABLE claims (C11, C14, C17) involve imprecision in quantitative characterization or misattribution of what a source actually measures.

**3. Hand-off to next phase:**
- The lead agent's Step 3 should note that C14's "academic-lens 8× larger" bug cannot be confirmed from any documentation and is contradicted by actual file sizes. This is the most suspicious specific claim.
- C17's FRAMES interpretation needs attention — the 0.40/0.66 numbers are correct but the claim misattributes what FRAMES measures (retrieval accuracy vs. citation density).
- C11 "permanently disabled" language is a significant overstatement — the code explicitly defers to v2, not permanently disabling.

**4. MONITOR notes:**
- Failure mode (a) avoided: I fetched all sources rather than relying on training data
- Failure mode (c) avoided: No UNVERIFIABLE results required escalation
- Failure mode (d) avoided: Both checks (Source Verification + DRA Rubric) were applied to all claims
- Encountered: The Playwright browser was already in use, which prevented direct page navigation. Fell back to Chrome DevTools approach but that also had issues. Used WebSearch + GitHub MCP instead — this was effective and produced authoritative results from primary sources.
- Encountered: For C14, the "academic-lens 8× larger" bug is the most problematic — no documentation supports it and file sizes contradict it. This warrants G4 + T4 flags.

---

## TASK STATUS SUMMARY
- C2: done (findings in section 'C2: Claude Agent SDK Task tool — no per-agent timeout')
- C5: done (findings in section 'C5: Claude Agent SDK hang/timeout issues #34, #42, #701, #255')
- C8: done (findings in section 'C8: CLI provider-layer failures')
- C11: done (findings in section 'C11: Phase 7.5 VERIFY loop-back permanently disabled')
- C14: done (findings in section 'C14: CLI v1 M20 testing — four distinct silent-failure bugs')
- C17: done (findings in section 'C17: FRAMES 0.40-0.66 retrieval lift vs. ResearcherBench')
