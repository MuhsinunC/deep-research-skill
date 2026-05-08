# Phase 7.5 Citation Verification — Sub-agent 2

**Sub-lens:** citation_2  
**Date:** 2026-05-07  
**Claims assigned:** C2, C5, C8, C11, C14, C17

---

## Preflight PLAN

1. **Goal:** Verify 6 atomic claims against their actual sources; assess DRA failure modes for each.
2. **Inputs:** Claim text + DRA tags only — zero source URLs provided.
3. **Outputs:** Per-claim status (VERIFIED/QUESTIONABLE/UNVERIFIABLE/CONTRADICTED), exact evidence quotes, DRA flags observed, source URLs fetched.
4. **Key risks:** All claims lack source URLs, so I must search and fetch. Five involve academic papers or news articles with specific numbers. One (C8) references a specific codebase file.
5. **Approach:** Search first → fetch primary sources → read exact text → assess Check 1 + Check 2 in order.

---

## Claim C8 — OpenCode Provider Header Comment

**Claim:** "The OpenCode provider in cli/src/providers/opencode.ts has never been run end-to-end against a real OpenRouter key, per the file's own header comment."

**DRA tags:** T4 (lack of verification), G3 (specification deviation)

### Verification

**Source fetched:** `MuhsinunC/deep-research-skill` → `cli/src/providers/opencode.ts` (SHA: 7725ccae1f46f5198191b1c67b1344b57b599178)  
URL: https://github.com/MuhsinunC/deep-research-skill/blob/222684cec2a3c67684feb955b1843d287c14b774/cli/src/providers/opencode.ts

**File header comment (exact quote):**
```
// Honest scope note: I (Claude Opus, the implementer) cannot end-to-end
// test this provider — that requires a real OpenRouter key and the
// opencode binary on the user's machine. The unit tests mock spawn() and
// verify the contract up to the network boundary. The user's first
// real run with `--provider opencode` is the integration test.
```

**Check 1 — Source Verification:** VERIFIED. The file exists at the exact path claimed, and the header comment explicitly states the implementer "cannot end-to-end test this provider — that requires a real OpenRouter key." This directly supports the claim that the provider "has never been run end-to-end against a real OpenRouter key, per the file's own header comment."

**Check 2 — DRA Rubric:**
- **T4 (lack of verification):** NOT triggered. The claim is fully verifiable from the single cited source (the file's header comment). The evidence is direct and unambiguous.
- **G3 (specification deviation):** NOT triggered. The file exists and the claim accurately describes its header comment.

**Status:** VERIFIED  
**DRA flags observed:** None

---

## Claim C17 — Hybrid LLM ICLR 2024 "40 percent"

**Claim:** "Hybrid LLM routing reduces large-model API calls by up to 40 percent with no quality drop, per ICLR 2024."

**DRA tags:** G4 (numbers accuracy), T2 (misaligned evidence)

### Verification

**Sources searched:** WebSearch for "Hybrid LLM ICLR 2024 Cost-Efficient routing 40 percent"  
**Paper found:** "Hybrid LLM: Cost-Efficient and Quality-Aware Query Routing" — ICLR 2024  
URL: https://proceedings.iclr.cc/paper_files/paper/2024/file/b47d93c99fa22ac0b377578af0a1f63a-Paper-Conference.pdf  
Also: https://arxiv.org/abs/2404.14618

**Evidence from search results (abstract quote):**
> "In experiments our approach allows us to make up to 40% fewer calls to the large model, with no drop in response quality."

**Check 1 — Source Verification:** VERIFIED. The abstract matches the claim precisely: "up to 40% fewer calls to the large model, with no drop in response quality."

**Check 2 — DRA Rubric:**
- **G4 (numbers accuracy):** NOT triggered. The number "40 percent" matches the abstract exactly ("up to 40% fewer calls").
- **T2 (misaligned evidence):** NOT triggered. The evidence is from the paper directly cited and describes query routing between small and large models, exactly the context the claim describes.

**Status:** VERIFIED  
**DRA flags observed:** None

---

## Claim C5 — MAST Taxonomy NeurIPS 2025

**Claim:** "The MAST taxonomy measured 41 to 86.7 percent failure rates across 7 collaborative multi-agent system frameworks including AutoGen, MetaGPT, and ChatDev, based on a corpus of more than 1,600 traces, and was published at NeurIPS 2025."

**DRA tags:** G4 (numbers accuracy), T2 (misaligned evidence)

### Verification

**Sources searched:** arxiv.org/abs/2503.13657  
**Paper found:** "Why Do Multi-Agent LLM Systems Fail?" — NeurIPS 2025 Track on Datasets and Benchmarks  
URL: https://arxiv.org/abs/2503.13657  
NeurIPS page: https://neurips.cc/virtual/2025/poster/121528

**Evidence from multiple search summaries:**
- "MAST-Data is a comprehensive dataset of 1,642 annotated traces from seven popular MAS frameworks"
- "The analysis reveals a 41% to 86.7% failure rate on 7 state-of-the-art (SOTA) open-source MAS"
- Frameworks listed in one search: "HyperAgent, AppWorld, AG2, ChatDev, MetaGPT" + 2 others
- Note: "AG2" is the rebrand of "AutoGen" — need to verify this assertion
- NeurIPS 2025 confirmed via neurips.cc poster page

**Check 1 — Source Verification:** VERIFIED for numbers (41%, 86.7%, 7 frameworks, 1642 traces, NeurIPS 2025). However, one search result listed frameworks as "HyperAgent, AppWorld, AG2, ChatDev, MetaGPT" — AutoGen was rebranded to AG2. The claim says "AutoGen" which is the prior name. Need direct paper fetch to confirm exact frameworks.

**Check 2 — DRA Rubric:**
- **G4 (numbers accuracy):** NOT triggered. The numbers match: "41% to 86.7%", "7 frameworks", "more than 1,600 traces" (actual: 1,642). 
- **T2 (misaligned evidence):** Requires further investigation. The claim says "collaborative multi-agent system frameworks" — need to confirm the paper is specifically about collaborative frameworks as opposed to general MAS.

**Status:** VERIFIED (pending deeper paper fetch to confirm exact framework names including AutoGen vs AG2)  
**DRA flags observed:** None (pending final confirmation)

---

## Claim C11 — FRAMES Benchmark 0.40 to 0.66

**Claim:** "On the FRAMES benchmark, retrieval pipelines raise factual accuracy from 0.40 to 0.66, indicating that citation density does correlate with accuracy for fact-retrieval tasks."

**DRA tags:** G4 (numbers accuracy), T2 (misaligned evidence)

### Verification

**Sources searched:** arxiv.org/abs/2409.12941  
**Paper found:** "Fact, Fetch, and Reason: A Unified Evaluation of Retrieval-Augmented Generation"  
URL: https://arxiv.org/abs/2409.12941

**Evidence from search summaries:**
- "State-of-the-art LLMs achieve 0.40 accuracy with no retrieval"
- "The accuracy is significantly improved with a proposed multi-step retrieval pipeline, achieving an accuracy of 0.66"
- More precise: "accuracy of 0.408 with single-step inference to 0.66 with multi-step retrievals"

**Check 1 — Source Verification:** VERIFIED for numbers. The 0.40 → 0.66 range matches the paper's findings (with 0.40 being a rounded figure for 0.408 baseline).

**Check 2 — DRA Rubric:**
- **G4 (numbers accuracy):** NOT triggered for the key numbers (0.40, 0.66). These match the paper. Note that 0.40 is the rounded form of 0.408.
- **T2 (misaligned evidence):** Potentially triggered. The claim concludes "citation density does correlate with accuracy for fact-retrieval tasks" — this is an INFERENCE the claim makes from the numbers, but the FRAMES paper is about retrieval pipeline accuracy, not specifically citation density. The leap from "retrieval pipeline accuracy" to "citation density correlates with accuracy" may be overreaching. The paper tests retrieval, not citation density directly.

**Status:** QUESTIONABLE (numbers are verified; but the second part "citation density does correlate with accuracy" is an inference the source doesn't directly support)  
**DRA flags observed:** [T2] — The claim adds a causal interpretation ("citation density does correlate with accuracy") that the FRAMES paper doesn't explicitly test or state. The source measures retrieval pipeline accuracy, not citation density.

---

## Claim C14 — Cloudflare Blocks 20% of Public Web Pages

**Claim:** "Cloudflare blocks approximately 20 percent of public web pages, per single-source SecurityWeek reporting on a 2025-07-01 policy change."

**DRA tags:** G4 (numbers accuracy), T1 (deficient acquisition)

### Verification

**Source found:** SecurityWeek article "Cloudflare Puts a Default Block on AI Web Scraping"  
URL: https://www.securityweek.com/cloudflare-puts-a-default-block-on-ai-web-scraping/

**Critical finding from search results:**
The "20%" figure refers to Cloudflare's market share — Cloudflare serves traffic for approximately 20% of all websites. The July 1, 2025 policy change was that **new Cloudflare domains now block AI crawlers by default** — it does NOT mean Cloudflare "blocks approximately 20 percent of public web pages."

The claim's wording is materially misleading:
- **What is true:** Cloudflare (which serves ~20% of web traffic) changed its default policy to block AI crawlers for new domains as of 2025-07-01
- **What the claim says:** "Cloudflare blocks approximately 20 percent of public web pages" — this is a category error. The 20% is Cloudflare's market share, not the percentage of web pages blocked.

**Check 1 — Source Verification:** CONTRADICTED. The SecurityWeek article (and the Cloudflare press release it covers) report a policy change that affects AI crawlers on Cloudflare-served sites. The "20 percent" refers to Cloudflare's share of web infrastructure, NOT to 20% of pages being blocked. The claim conflates infrastructure share with blocking rate.

**Check 2 — DRA Rubric:**
- **G4 (numbers accuracy):** TRIGGERED. The "20 percent" figure is misapplied. The source says Cloudflare manages/serves 20% of the web. The claim says Cloudflare "blocks 20 percent of public web pages" — these are different facts. The policy change blocks AI crawlers by default on new domains, not 20% of pages.
- **T1 (deficient acquisition):** The SecurityWeek article is a secondary source reporting on Cloudflare's own press release. A stronger primary source would be the official Cloudflare press release (https://www.cloudflare.com/press/press-releases/2025/cloudflare-just-changed-how-ai-crawlers-scrape-the-internet-at-large/), which is the original source. T1 is potentially triggered — the claim notes "single-source SecurityWeek reporting" but Cloudflare's own announcement is the primary source.

**Status:** CONTRADICTED  
**DRA flags observed:** [G4, T1]

---

## Claim C2 — Claude Agent SDK Task Tool Timeout

**Claim:** "The Claude Agent SDK's Task tool exposes no per-agent timeout mechanism, which causes a hung sub-agent to block its parent indefinitely."

**DRA tags:** R2 (oversimplification), T3 (conflating sources)

### Verification Status: In progress (see below)

**Sources found:**
- Anthropic docs: https://code.claude.com/docs/en/agent-sdk/overview
- GitHub issue #4744: https://github.com/anthropics/claude-code/issues/4744 (agent execution timeout)
- GitHub issue #42 on claude-agent-sdk-typescript: 30-second hardcoded timeout bug report
- GitHub issue #9905: Feature request for background/async Task tool support
- Anthropic blog: https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk

**Preliminary findings from search:**
- The Task tool (in Claude Code / Claude Agent SDK) calls a sub-agent synchronously. Multiple GitHub issues confirm hung sub-agents blocking parent sessions.
- One search result states: "The Task tool calls SessionPrompt.prompt() and awaits the entire subagent run with no timeout wrapper."
- The TypeScript SDK had a hardcoded 30-second TOOL timeout (separate from the Task tool itself).
- The claim describes the Task tool specifically in the Claude Agent SDK context.

**Needs direct page fetch:** The Anthropic Agent SDK documentation needs to be fetched to confirm whether per-agent timeout is or was present.

---

*[Intermediate save — continuing to fetch remaining sources]*
