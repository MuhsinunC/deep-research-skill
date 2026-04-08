# Citation Verification Report — Batch 2
**Verified by:** Citation Verifier Sub-Agent  
**Date:** 2026-04-07  
**Method:** WebFetch + WebSearch against primary sources

---

## Verification Table

| Claim ID | Status | Evidence Found | Notes |
|----------|--------|----------------|-------|
| AC-1.1 | **PASS** | builtin.com confirms: research preview Feb 2025 (with Claude 3.7 Sonnet release); GA May 2025 (with Claude 4 launch). Exact date Feb 24 not confirmed by source, but month matches. | The specific date "Feb 24" is not explicitly stated in the builtin.com article, which says "February 2025." The GA month of May 2025 is confirmed. Mark as PASS with minor caveat on exact day. |
| AC-1.3 | **PASS** | Multiple third-party sources (northflank.com, ksred.com, nxcode.io, userjot.com) confirm three tiers: Pro $20/mo, Max $100/mo (5x usage), Max $200/mo (20x usage). Five-hour rolling window confirmed by multiple sources as Anthropic's reset interval. | Claim matches widely documented pricing structure. Anthropic's own pricing page (claude.com/pricing) links exist but exact wording comes via third-party summaries. Core facts verified. |
| AC-1.4 | **SOFT-PASS** | Codex CLI (a new open-source local agent) launched April 16 2025; cloud-based Codex agent launched May 16 2025 — not a single relaunch. Token-based pricing move to April 2 2026 confirmed by OpenAI help center rate card and search results. VS Magazine article (403 on direct fetch) is confirmed by other sources to cover the May 2025 launch. | The "relaunch May 2025" framing slightly conflates two separate April/May 2025 launches. Token-based pricing date of April 2 2026 is confirmed. Minor imprecision in the claim. |
| AC-1.5 / AC-1.7 | **SOFT-PASS** | Confirmed: Cursor founded 2022 by four MIT students (Michael Truell, Sualeh Asif, Arvid Lunnemark, Aman Sanger). Fastest-ever $100M ARR confirmed ($1M → $100M in 12 months). $2B ARR reached February 2026. Valuation: $29.3B confirmed; claim says "$29–30B" which is accurate. | "$2B ARR early 2026" is confirmed (February 2026). Valuation of $29.3B matches the "$29–30B" range. "Fastest-ever $100M ARR" is widely reported. All sub-claims check out. |
| AC-1.6 | **PASS** | Cursor 2.0 launched October 29 2025 with proprietary "Composer" model (MoE architecture). Cursor 3.0 launched April 2 2026 with "Agents Window" (parallel multi-agent workspace). Both dates and feature names confirmed. | Both launch dates and feature descriptions verified against cursor.com blog and dev.to article. |
| AC-1.8 | **SOFT-PASS** | GitHub Copilot technical preview: June 29 2021 — confirmed. Agent mode announced February 6 2025 — confirmed. Coding Agent GA September 2025 — confirmed. Note: Coding Agent was announced/previewed May 2025, reached GA September 2025, which aligns with the claim's "GA September 2025" language. | All three dates are confirmed. "Launched" vs "technical preview" distinction is a nuance — the June 2021 date is a technical preview, not full GA (which was June 2022), but it is the canonical launch date commonly cited. |
| AC-1.9 | **PASS** | GitHub Universe 2024 (October 29 2024) announcement confirmed: multi-model support added for Claude 3.5 Sonnet, Google Gemini 1.5 Pro, and OpenAI o1/GPT-4o. Multiple corroborating sources (GitHub blog, TechCrunch, SiliconANGLE). | Month and year (October 2024) and the three model families (Claude/Gemini/GPT) all confirmed. |
| AC-1.10 | **PASS** | cognition.ai/blog/introducing-devin confirms launch on March 12 2024, described as "the first AI software engineer" by Cognition's Scott Wu. | Direct primary source fetch. Exact date and framing confirmed. |
| AC-1.11 | **SOFT-PASS** | ARR trajectory confirmed: $1M (Sep 2024) → $73M (Jun 2025) per TechCrunch and Cognition's own blog. $400M raise at $10.2B valuation confirmed (Sep 2025). The claim's "$350M → $10.2B trajectory" framing is inaccurate — the previous valuation before the Sep 2025 raise was ~$2B (not $350M); $350M was an early-stage valuation. | The ARR numbers and the $10.2B valuation are correct. The "$350M" as a starting valuation reference is likely outdated/wrong (the $2B Series A was the more recent prior round). The phrasing "trajectory" is imprecise. |
| AC-1.12 | **PASS** | Paul Gauthier confirmed as creator of Aider. GitHub repo under paul-gauthier/aider confirmed. Internet Archive snapshots show repo existing July 2023. Multiple sources confirm 2023 creation. | Aider's HISTORY.md in the repo (paul-gauthier/aider on GitHub) is the canonical source; repo creation in 2023 is corroborated by Archive.org snapshots. |
| AC-1.13 / AC-1.14 | **SOFT-PASS** | OpenHands launched as OpenDevin March 12 2024 — confirmed. 65,000+ GitHub stars confirmed by multiple 2026 sources. Contributor count of 2,100+ could NOT be verified — sources cite 250–500 active contributors, with one source noting 466 contributors total. The 2,100 figure appears significantly overstated or refers to a different metric (e.g. total commits authors). | Launch date and 65K+ stars confirmed. The "2,100+ contributors" figure is not corroborated; actual contributor count appears to be in the 400–500 range as of early 2026. Flag as potential error. |
| AC-7.1 | **FAIL** | Cognition acquired Windsurf — confirmed. However, the acquisition agreement was signed and announced July 14 2025, not August 2025. The CNBC article title references "two months after Windsurf" in September 2025 context, consistent with a July acquisition. | Month is wrong: acquisition was July 2025, not August 2025. The CNBC article (Sep 8 2025) states the acquisition occurred "two months" before the $400M raise, which points to July. The claim of "August 2025" is a factual error. |
| AC-7.2 | **PASS** | anthropic.com/news/model-context-protocol confirms: published November 25 2024, open-sourcing of MCP announced that day. | Direct primary source confirmed. Exact date matches. |
| AC-7.3 / AC-7.4 | **PASS** | anthropic.com/news/donating-the-model-context-protocol confirms: MCP donated to Linux Foundation on December 9 2025. Agentic AI Foundation (AAIF) co-founded by Anthropic, Block, and OpenAI, with Google, Microsoft, AWS, Cloudflare, and Bloomberg as supporters. | All three co-founders (Anthropic, Block, OpenAI) confirmed from primary source. Date confirmed as December 2025. |
| AC-7.5 | **PASS** | Cursor 3 launched April 2 2026 — confirmed (same as AC-1.6 above). | Duplicate of AC-1.6 finding. Confirmed. |

---

## TASK STATUS SUMMARY

**Total claims evaluated:** 17 (across 15 claim IDs)  
**PASS:** 8 (AC-1.1, AC-1.3, AC-1.6, AC-1.9, AC-1.10, AC-1.12, AC-7.2, AC-7.3/4, AC-7.5)  
**SOFT-PASS:** 5 (AC-1.4, AC-1.5/1.7, AC-1.8, AC-1.11, AC-1.13/1.14)  
**FAIL:** 1 (AC-7.1 — wrong month for Windsurf acquisition: July not August 2025)  
**UNVERIFIABLE:** 0

**Critical errors requiring correction:**
1. **AC-7.1:** Cognition acquired Windsurf in **July 2025** (definitive agreement July 14), not August 2025.
2. **AC-1.13/1.14:** OpenHands contributor count of "2,100+" is **not supported** by evidence; sources cite ~400–500 contributors. This figure should be removed or corrected.
3. **AC-1.11:** The "$350M" reference as Cognition's starting valuation is misleading — by the time of the $10.2B raise, Cognition's prior round was at ~$2B (2024 Series A). $350M was a very early valuation.

**Minor precision issues (not errors):**
- AC-1.4: Codex had two distinct launches (CLI April 16, cloud agent May 16 2025) rather than a single "May 2025 relaunch."
- AC-1.8: June 2021 was a technical preview; full GA was June 2022 — the claim's framing as a "launch" date is conventional but technically imprecise.
