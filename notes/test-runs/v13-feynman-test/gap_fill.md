# Gap Fill Research — v13 Feynman Test

Date: 2026-04-07
Three targeted lookups for the AI agent observability deep research report.

---

## T_a — Microsoft Agent Framework GA Status

**Status: ANSWERED — MSAF 1.0 GA shipped April 3, 2026.**

### Source 1 (primary)
- **URL:** https://devblogs.microsoft.com/agent-framework/
- **Title:** "Microsoft Agent Framework Version 1.0"
- **Date:** April 3, 2026
- **Publisher:** Microsoft DevBlogs (Agent Framework team blog)
- **Key claim (direct quote):** "thrilled to announce that Microsoft Agent Framework has reached version 1.0 for both .NET and Python. This is the production-ready release: stable APIs, and a commitment to long-term support."

### Source 2 (background)
- **URL:** https://devblogs.microsoft.com/foundry/microsoft-agent-framework-reaches-release-candidate/
- **Title:** "Microsoft Agent Framework Reaches Release Candidate"
- **Date:** February 19, 2026 (RC 1.0)
- **Note:** Confirms the prior milestone — RC 1.0 on Feb 19, 2026, with GA targeted for end of Q1 2026. Actual GA slipped about 3 days past quarter end, landing April 3, 2026.

### Answer to question
GA HAS shipped. Microsoft Agent Framework 1.0 was released April 3, 2026, four days after the original end-of-Q1 target. Both .NET and Python are GA with stable APIs and long-term support commitments. The framework is now production-ready for the AutoGen + Semantic Kernel convergence path.

---

## T_b — Claude Agent SDK Release Date Verification

**Status: ANSWERED — but the prior assumption ("March 2025") is FALSIFIED. The actual announcement date is September 29, 2025.**

### Source 1 (primary — Anthropic official news)
- **URL:** https://www.anthropic.com/news/claude-sonnet-4-5
- **Title:** "Introducing Claude Sonnet 4.5"
- **Date:** September 29, 2025
- **Publisher:** Anthropic (anthropic.com/news, primary)
- **Key claim (direct quote):** "We're calling this the Claude Agent SDK. The infrastructure that powers our frontier products—and allows them to reach their full potential—is now yours to build with."
- **Context:** The Claude Agent SDK was introduced alongside Claude Sonnet 4.5 on Sep 29, 2025. It is the rebranded/expanded version of the prior "Claude Code SDK" and exposes the same infrastructure that powers Claude Code for general agent-building.

### Source 2 (corroborating — GitHub releases ground truth)
- **URL:** https://github.com/anthropics/claude-agent-sdk-python/releases
- **Verification method:** Pulled all release tags via `gh api repos/anthropics/claude-agent-sdk-python/releases --paginate`
- **Earliest tag under the new name:** `v0.1.0` published `2025-09-28T23:49:07Z` (matches the Sep 29, 2025 news announcement, accounting for timezone)
- **Earlier tags under the same repo (v0.0.16 — v0.0.23, July 21, 2025 to Sep 18, 2025):** These are pre-rename releases. The repository was originally `claude-code-sdk-python` and was renamed to `claude-agent-sdk-python` at v0.1.0.
- **Note:** There is NO release in the GitHub history dated March 2025. The "March 2025" hypothesis in the original deep research report is wrong.

### Source 3 (corroborating — third party)
- **URL:** https://www.pymnts.com/artificial-intelligence-2/2025/anthropic-claude-sonnet-4-5-introduces-claude-agent-sdk/
- **Title:** "Anthropic Launches Claude Sonnet 4.5 and Introduces Claude Agent SDK"
- **Date:** September 2025
- **Note:** Independent press confirmation of the Sep 29, 2025 launch.

### Answer to question
The Claude Agent SDK was officially announced on **September 29, 2025**, NOT March 2025. The deep research report's "March 2025" date is incorrect and must be corrected. Recommended primary citation: https://www.anthropic.com/news/claude-sonnet-4-5 (Sep 29, 2025).

If the report needs to reference an earlier date for the underlying technology, the lineage is:
- Claude Code (CLI) — Feb 2025 era
- Claude Code SDK (predecessor library) — released earlier in 2025; first GitHub release v0.0.16 on July 21, 2025
- Claude Agent SDK (rename / general-purpose repositioning) — September 29, 2025 (v0.1.0)

---

## T_c — OpenTelemetry GenAI Semantic Conventions Stability Roadmap

**Status: ANSWERED — partially. GenAI core-set stabilization is on the 2026 roadmap as an "Unconfirmed" candidate, with no firm date.**

### Source 1 (primary — OTel official 2026 roadmap)
- **URL:** https://github.com/open-telemetry/semantic-conventions/issues/3330
- **Title:** "Semantic Conventions 2026 Roadmap"
- **Created:** 2026-01-25
- **Last updated:** 2026-03-18
- **State:** Open
- **Author/maintainers:** OpenTelemetry semconv project leads
- **Key claim (direct quote):** "[Unconfirmed] Stabilize conventions: ... GenAI (core set) ..."
- **Context:** The 2026 roadmap explicitly distinguishes "Confirmed plans" for stabilization (rpc, system/process, K8s, error/exception) from "Unconfirmed" candidates which include "GenAI (core set)", feature-flags, messaging, and service. GenAI is therefore on the radar for 2026 stabilization but NOT yet committed. The roadmap also still asks sub-SIGs: "Are there areas you're ready to stabilize in 2026?"
- **Other quote:** "This is work in progress, not a final roadmap. We're looking for input from all semconv sub-SIGs!"

### Source 2 (corroborating — current spec page)
- **URL:** https://opentelemetry.io/docs/specs/semconv/gen-ai/
- **Date:** Current (as of 2026-04-07)
- **Key claim (direct quote):** "This transition plan will be updated to include stable version before the GenAI conventions are marked as stable."
- **Context:** The spec page itself confirms GenAI semconv is still in **Development** status, explicitly acknowledges that a transition plan toward stable will be added later, and gives no target date. The `OTEL_SEMCONV_STABILITY_OPT_IN` env var (gen_ai_latest_experimental) is the current breaking-change management mechanism.

### Source 3 (background — stabilization process)
- **URL:** https://opentelemetry.io/blog/2025/stability-proposal-announcement/
- **Title:** "Evolving OpenTelemetry's Stabilization and Release Practices"
- **Date:** 2025
- **Note:** Establishes the general OTel semconv stabilization framework but does not specifically commit GenAI to a date.

### Answer to question
PARTIAL. The OpenTelemetry project does have a public 2026 roadmap (issue #3330, opened Jan 25 2026, updated Mar 18 2026) and GenAI core-set stabilization IS listed on it — but only under "Unconfirmed" candidates, not "Confirmed plans". As of April 7, 2026:
- No specific date for GenAI semconv stable release exists
- GenAI is grouped with feature-flags, messaging, and service as 2026 *aspirations* not commitments
- The roadmap is explicitly marked "work in progress"
- The spec page still labels GenAI semconv as "Development" status
- The project is actively soliciting sub-SIG input on what they can ship in 2026

Practical implication for the deep research report: GenAI semconv will remain in Development/Experimental for at least the near-term (next 1-2 quarters), and any "stable by X date" claim should be avoided. The most defensible statement is: "On OTel's 2026 roadmap as an unconfirmed stabilization candidate; no firm date as of April 2026."

---

## TASK STATUS SUMMARY
- T_a (MSAF GA status): done — MSAF 1.0 GA shipped April 3, 2026, confirmed via primary source on devblogs.microsoft.com/agent-framework/
- T_b (Claude Agent SDK release date): done — Sep 29, 2025 (NOT March 2025); the report's prior assumption is FALSIFIED. Primary cite: anthropic.com/news/claude-sonnet-4-5; corroborated by GitHub release history (v0.1.0 on 2025-09-28).
- T_c (OTel GenAI semconv stability roadmap): done — On 2026 roadmap (issue #3330) under "Unconfirmed" stabilization candidates; no firm date; GenAI semconv remains in Development status as of April 2026.
