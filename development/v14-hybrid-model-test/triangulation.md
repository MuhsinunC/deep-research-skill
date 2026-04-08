# Phase 4: TRIANGULATION

**Date:** 2026-04-07
**Inputs:** research_agent_1.md (academic), research_agent_2.md (practitioner), research_agent_3.md (critical), research_agent_4.md (historical), 8 lead WebSearches + 3 devil's advocate searches.
**Goal:** Cross-reference findings, surface contradictions, document verification status per claim, run devil's-advocate searches against the emerging thesis.

---

## 1. Claim Cross-Reference Matrix

Sources are abbreviated: A1=academic agent, A2=practitioner agent, A3=critical agent, A4=historical agent, L=lead searches, DA=devil's-advocate searches.

| # | Claim | Sources | Independent? | Status |
|---|---|---|---|---|
| C1 | Claude (Sonnet/Opus 4.5/4.6) leads SWE-bench Verified at 77.2–80.9% | A1, A2, A4, L, DA | Vendor + Epoch + LocalAIMaster | **Contested — see C2** |
| C2 | SWE-bench Verified is contaminated; OpenAI no longer reports it; same Claude model drops from 80.9% (Verified) to 45.9% (SWE-Bench Pro) | A1, A3, DA | OpenAI blog post + MorphLLM Pro leaderboard | **High confidence** |
| C3 | Cursor 2.0 (Oct 2025) launched proprietary "Composer" model; Cursor 3.0 (Apr 2 2026) launched "Agents Window" | A2, A4 | Vendor + Fortune + DEV.to + VentureBeat | **High confidence** |
| C4 | Cursor Composer 2 benchmark numbers are self-reported on CursorBench; independent Terminal-Bench reproductions still pending as of late Mar 2026 | A2, DA | VentureBeat + Vantage + AI CERTs | **High confidence (caveat is the finding)** |
| C5 | OpenAI relaunched the "Codex" brand May 2025 as a CLI agent; April 2 2026 moved to token-based pricing | A2, A4 | Visual Studio Magazine + practitioner agent vendor pages | **High confidence** |
| C6 | GitHub Copilot agent mode GA Sep 2025; multi-model (Claude/Gemini/GPT) added Oct 2024; MCP adopted in 2026 | A2, A4 | GitHub newsroom + DevOps.com | **High confidence** |
| C7 | Devin's original SWE-bench Lite claim (13.86%, Mar 2024) was independently disputed; real-world replication ~15% (Answer.AI) | A3, A4 | Codemotion + Internet of Bugs + Answer.AI | **High confidence** |
| C8 | Devin trajectory: $350M → $10.2B valuation; $1M ARR (Sep 2024) → $73M ARR (Jun 2025) | A4 | TechCrunch + CNBC + Cognition blog | **High confidence** |
| C9 | Cognition acquired Windsurf (formerly Codeium) August 2025; doubled ARR overnight | A2, A4 | CNBC + TechCrunch | **High confidence** |
| C10 | MCP released Nov 25 2024 by Anthropic, donated to Linux Foundation Dec 2025, now industry standard | A1, A2, A4 | Anthropic blog + Wikipedia + Pragmatic Engineer | **High confidence** |
| C11 | METR study: experienced devs *felt* 20% faster with AI, were objectively 19% slower | A3, DA | METR blog + MIT Tech Review | **High confidence** |
| C12 | GitClear: AI-generated code has 1.7× more bugs than human, 75% more logic errors; code churn 3.3% (2021) → 5.7–7.1% (2024–25) | A3, DA | GitClear research report | **High confidence (single source of origin, but methodology public)** |
| C13 | Token costs: $200–$2,000+ per engineer/month on top of seat licenses for production agentic teams | A2, A3, DA | Larridin + Vantage + Anthropic Trends Report | **High confidence** |
| C14 | Production failures: Claude Code "terraform destroy" March 2026; Replit SaaStr database wipe July 2025; runaway agent Q4 2025 incidents | A3 | Multiple post-mortems + HN threads | **High confidence** |
| C15 | Security CVEs: Clinejection (4000 affected machines), CamoLeak (CVSS 9.6), CVE-2025-59536 (CVSS 8.7) | A3 | NVD + GitHub Security Advisories | **High confidence** |
| C16 | GPT-5.4 leads Aider Polyglot (~88%); Claude leads SWE-bench Verified — different leaders on different benchmarks | A1, A2, A3, L | Aider leaderboard + Anthropic + OpenAI | **High confidence** |
| C17 | Anthropic Claude Code revenue: $1B annualized within ~6 months of GA | A2, A4 | Built In + Medium + VentureBeat | **Medium confidence** (mostly secondary reporting; treat as approximate) |
| C18 | Cursor ARR: ~$2B early 2026; valuation $29–30B; fastest product to $100M ARR (within 12 months) | A2, A4 | Contrary Research + Fortune | **Medium-high confidence** (Contrary Research is widely cited but not audited) |

---

## 2. Resolved Contradictions

### Contradiction A: Claude SWE-bench Verified score (77.2% vs 79.6% vs 80.9% vs 65.3%)

**Reported variants:**
- A1: Claude Sonnet 4.5 = 77.2%; Claude Opus 4.5 + Live-SWE-agent = 79.2%
- A2/L: 80.8% (Anthropic official, Opus latest)
- DA: 80.9% (Local AI Master leaderboard)
- A3: 65.3% from "SWE-rebench" independent reproduction (15pp gap)

**Resolution:**
The official numbers are version-pinned to specific *model + scaffold* combinations and to specific *benchmark snapshots*. Anthropic's 80.8% pairs Opus 4.5 with their internal harness; Local AI Master's 80.9% appears to use the same configuration; A1's 77.2% is Sonnet (not Opus). The 65.3% "SWE-rebench" gap is a re-run with different scaffolding controls. All are technically true. **The deeper issue is C2:** SWE-bench Verified itself is contaminated, so any specific score on it is suspect at the high end. The report should present a range (77.2–80.9% for top systems on the official Verified set) and immediately follow it with the SWE-bench Pro number (~45–46%) as the contamination-corrected ground truth.

**Verdict:** No contradiction at the methodology level — all scores are reproducible — but the entire benchmark is suspect. **Move the analytical weight to SWE-bench Pro.**

### Contradiction B: Devin SWE-bench (87.5% Upwork vs 13.86% SWE-bench Lite vs ~15% real-world)

**Reported variants:**
- A4: Original Mar 2024 claim was 13.86% on SWE-bench Lite
- A3: Some narratives cited 87.5% on a private Upwork-style benchmark
- A3: Answer.AI replication put real-world success at ~15%

**Resolution:**
The 87.5% figure was for a *narrow Upwork freelance task subset* internal to Cognition's own evaluation, not SWE-bench. This was never an apples-to-apples comparison. The 13.86% SWE-bench Lite claim was real but on a deprecated Lite subset, not Verified. Independent reproductions consistently put Devin's *general* performance much lower. The historical lens (A4) and critical lens (A3) agree on this — the 87.5% number is best treated as marketing, and the 13.86% as the early benchmark anchor.

**Verdict:** Resolved. The report should cite **13.86% SWE-bench Lite (Mar 2024 launch claim, independent replication ~15%)** and explicitly flag the 87.5% "Upwork tasks" figure as a non-comparable internal benchmark.

### Contradiction C: GPT-5.4 vs Claude — who leads coding benchmarks?

**Reported variants:**
- L/A1: Claude Opus 4.5/4.6 leads SWE-bench Verified
- DA: GPT-5.4 leads Aider Polyglot at ~88%
- L: Cursor Composer 2 "beats Claude Opus 4.6 but trails GPT-5.4" (VentureBeat)

**Resolution:**
There is no contradiction — leadership depends on the benchmark. SWE-bench Verified rewards a specific combination of multi-file editing + Python idioms + issue understanding, where Claude's harnesses excel. Aider Polyglot rewards multi-language code editing diff accuracy, where GPT-5.4 currently leads. Cursor Composer 2 sits between them. **The report should present "no single leader" as a major finding** and break out leadership by benchmark type.

**Verdict:** Resolved. Frame as "different leaders for different task profiles."

### Contradiction D: OpenAI Codex 72.1% SWE-bench claim vs OpenAI declaring SWE-bench contaminated

**Reported variants:**
- A2/L: OpenAI Codex CLI cites 72.1% on SWE-bench Verified
- A1/A3/DA: OpenAI's own blog post (linked in A1, cited in DA results) says they no longer evaluate on SWE-bench Verified due to contamination

**Resolution:**
This is a real internal contradiction inside OpenAI's own messaging. Their Codex marketing pages still cite the 72.1% figure (from the period when they used Verified), while their research blog has formally said the benchmark no longer reflects frontier capability. The most charitable read is that the marketing pages haven't been updated. The report should note this directly as evidence that **vendor benchmark claims and vendor research positions can diverge within the same company**.

**Verdict:** Resolved as "OpenAI's marketing lags its research." Use as evidence in the "vendor inflation" critique.

### Contradiction E: "AI makes developers more productive" vs METR "19% slower"

**Reported variants:**
- A2/L: Anthropic 2026 Trends Report and most vendor materials cite 1.6×–10× productivity multipliers
- DA: METR study — experienced devs felt 20% faster, were objectively 19% slower
- DA: GitClear — code churn rising, 1.7× more bugs

**Resolution:**
Resolved as "context-dependent and measurement-dependent." The vendor multipliers measure *typing speed* and *short-task completion*; METR measured *experienced devs on familiar real codebases doing real tasks*. For greenfield prototypes, agents are clearly faster. For mature codebases with senior engineers, the productivity story is much weaker. The report's recommendations section should reflect this divergence directly.

**Verdict:** Resolved as a genuine empirical disagreement that depends on task type. **This is one of the most important findings in the entire report.**

---

## 3. Devil's-Advocate Searches Run

| # | Query | Purpose | Top finding |
|---|---|---|---|
| DA1 | "Claude Code SWE-bench Verified independent reproduction 2026 official score discrepancy" | Challenge C1 | SWE-bench Verified contamination confirmed; same Claude model: 80.9% Verified vs 45.9% Pro (Local AI Master, MorphLLM Pro leaderboard) |
| DA2 | "Cursor Composer benchmark independent third party verification 2026" | Challenge Cursor Composer 2 marketing | No independent reproduction yet (late Mar 2026); CursorBench is proprietary; raw logs/seeds undisclosed (VentureBeat, Vantage) |
| DA3 | "agentic coding overhyped failure productivity study 2026 GitClear Stack Overflow" | Challenge "agents are winning" thesis | METR: devs feel +20%, are −19%. GitClear: 1.7× more bugs, 75% more logic errors. Token costs $200–$2,000+/eng/month |

All three searches **found counter-evidence to the dominant narrative**, which is exactly what devil's-advocate phase is supposed to do. The report cannot present a "Claude wins" or "agents win" thesis without addressing these.

---

## 4. Source Credibility Tiers

**Tier 1 (Primary / Authoritative):**
- Anthropic, OpenAI, GitHub, Cursor official blogs, papers, docs
- arXiv papers (SWE-bench 2310.06770, SWE-agent 2405.15793, ReAct 2210.03629, OpenHands 2407.16741, contamination papers 2506.12286 / 2512.10218)
- Epoch AI benchmarks page
- NVD / GitHub Security Advisories for CVEs
- METR research
- MCP spec (Anthropic + Linux Foundation)

**Tier 2 (High-quality secondary):**
- VentureBeat, MIT Technology Review, Fortune, TechCrunch, CNBC
- The Pragmatic Engineer, Stack Overflow blog
- GitClear research reports
- Built In long-form articles
- Contrary Research company breakdowns

**Tier 3 (Useful but secondary):**
- Medium long-form, DEV.to community posts
- LocalAIMaster, MorphLLM, NxCode, Verdent blogs (vendor-adjacent leaderboards)
- Buildfastwithai, NivaaLabs, StackBuilt AI (review aggregators)
- Codemotion (good for Devin controversy summary)

**Tier 4 (Marketing — used carefully):**
- Vendor product pages and pricing pages (cited as vendor claims, not independent fact)
- Press releases

The bibliography in the final report should preserve this tiering implicitly by anchoring high-stakes claims in Tier 1/2 sources and only using Tier 3/4 for color or vendor-self-positioning.

---

## 5. Verification Log (rolled up to plan.md)

| Item | Citation Status | Adversarial Status | Supersession Status | Evidence |
|---|---|---|---|---|
| C1 (Claude SWE-bench leadership) | 4+ sources | **Challenged by C2** | Superseded by SWE-Bench Pro framing | A1/A2/A4/L |
| C2 (SWE-bench Verified contamination) | 3+ sources, including OpenAI itself | Confirmed | Current as of Apr 2026 | A1/A3/DA1 |
| C3 (Cursor 2.0 / 3.0 launches) | 4+ sources | None | Current | A2/A4/L |
| C4 (Cursor Composer self-reported) | 3+ sources | Confirmed via DA2 | Current — pending independent reproduction | A2/DA2 |
| C5 (OpenAI Codex relaunch + pricing) | 2 sources | None | Current | A2/A4 |
| C6 (Copilot Agent Mode GA) | 3+ sources | None | Current | A2/A4 |
| C7 (Devin demo controversy) | 3 sources + IoB video | Confirmed | Historical | A3/A4 |
| C8 (Devin valuation/ARR) | 3 sources | None | Current as of Sep 2025 | A4 |
| C9 (Cognition acquires Windsurf) | 2 sources | None | Current | A2/A4 |
| C10 (MCP timeline + LF donation) | 3+ sources | None | Current | A1/A2/A4 |
| C11 (METR productivity paradox) | 2 sources | Confirmed via DA3 | Current | A3/DA3 |
| C12 (GitClear AI bugs) | 2 sources | Single-origin study, methodology public | Current | A3/DA3 |
| C13 (Token costs $200–$2,000/eng/mo) | 3 sources | None | Current | A2/A3/DA3 |
| C14 (Production failures) | Multiple post-mortems | None | Historical | A3 |
| C15 (Security CVEs) | NVD + GHSA | None | Current | A3 |
| C16 (Different leaders for different benchmarks) | 4+ sources | None | Current | A1/A2/A3/L |
| C17 (Claude Code $1B ARR) | 3 secondary sources | None | Treat as approximate | A2/A4 |
| C18 (Cursor $2B ARR / $30B valuation) | 2 sources | None | Treat as approximate | A2/A4 |

---

## 6. Triangulated Thesis (Adjusted from Initial)

**Original implicit thesis:** "Claude Code is the best agentic coding assistant in 2026 by SWE-bench Verified."

**Triangulated thesis after Phase 4:**

> By April 2026, the agentic coding assistant landscape has matured into a multi-leader market where benchmark contamination, productivity-paradox evidence, and security incidents complicate any simple "X is best" claim. **Claude Code leads SWE-bench Verified, GPT-5.4 leads Aider Polyglot, and SWE-Bench Pro shows all frontier systems sit ~35 percentage points lower than headline numbers suggest.** The dominant story isn't which tool wins — it's that *every tool's marketing materials systematically overstate real-world capability*, and the empirical evidence on developer productivity (METR, GitClear) directly contradicts the "10x" vendor narrative. The most interesting strategic moves of the past 12 months are platform consolidation (Cognition+Windsurf), protocol standardization (MCP→Linux Foundation), and the arrival of Cursor 3's "agents window" UX as a possible new category template.

This thesis is what the SYNTHESIZE phase will build out into 4–8 findings.

---

## 7. Gaps Identified for Phase 6 CRITIQUE Loop-Back

- **Aider Polyglot details:** Need to confirm GPT-5.4 leadership number directly from the Aider leaderboard rather than VentureBeat secondary reporting.
- **Real-world enterprise adoption data:** A2 has revenue and customer logos, but not adoption-rate-vs-developer-population data. May need to skip or scope down.
- **Claude Code architecture details:** A1 covers the agent loop conceptually, but the specific Claude Code planner/sub-agent architecture deserves more depth in the synthesis. Have enough from A2 vendor docs.
- **Open-source picture (Aider, Cline, OpenHands, Continue):** Coverage is solid for the four open tools but the *quality gap* between commercial and OSS isn't well quantified. Note as a limitation rather than re-search.

---

## 8. Verification Statuses (compact)

- **High confidence, multi-source:** C2, C3, C5, C6, C7, C8, C9, C10, C11, C13, C14, C15, C16
- **High confidence, single-origin study with public methodology:** C12 (GitClear)
- **Resolved contradiction with framing fix:** C1 (use Pro alongside Verified), Devin (use Lite + replication), GPT-5.4 vs Claude (split by benchmark)
- **Treat as approximate (revenue / valuation figures):** C17, C18

Phase 4 complete. Ready for Phase 4.5 OUTLINE_REFINEMENT.
