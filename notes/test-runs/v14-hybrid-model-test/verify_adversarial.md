# Adversarial Verification Report
**Date:** 2026-04-07
**Role:** Adversarial verifier — attempting to falsify three central claims in the agentic coding assistants report.
**Method:** Live web search against 2025–2026 sources; findings reported with URLs and verdict.

---

## Central Claim 1: SWE-bench Verified Is Contaminated; OpenAI Stopped Reporting It; The ~35-Point Verified-vs-Pro Gap Indicates Measurement Inflation

### Counter-Evidence Sought
- Sources arguing Verified is NOT contaminated and remains trustworthy
- Alternative explanations for the Verified-vs-Pro score gap (task difficulty, not contamination)
- Evidence that OpenAI is still publishing Verified scores

### Best Counter-Evidence Found

**1. The score drop is partially explained by genuine task difficulty differences, not solely contamination.**

Scale AI's own SWE-bench Pro paper and the MorphLLM analysis both document that Pro tasks are structurally harder: average reference solutions span 107.4 lines across 4.1 files, compared to Verified's shorter, more self-contained fixes. SWE-Bench Pro also deliberately sources problems from codebases requiring "understanding of system architecture, history, and design intentions" — a memory-based challenge that penalizes all models regardless of contamination.
- Source: [SWE-Bench Pro: Raising the Bar for Agentic Coding](https://scale.com/blog/swe-bench-pro)
- Source: [SWE-Bench Pro Leaderboard (2026): Why 46% Beats 81%](https://www.morphllm.com/swe-bench-pro)

**2. The private SWE-bench Pro subset reveals an additional drop even within Pro (Claude Opus 4.1: 22.7% → 17.8%; GPT-5: 23.1% → 14.9%).**

This further drop inside Pro — where contamination is already controlled — shows that task complexity alone can account for a large fraction of the score decline. It does not fully exonerate Verified, but it weakens the "contamination is the only explanation" framing.
- Source: [Scale Labs Leaderboard: SWE-Bench Pro (Private Dataset)](https://labs.scale.com/leaderboard/swe_bench_pro_private)

**3. No 2026 source credibly defends Verified as uncontaminated.**

No peer-reviewed paper, independent benchmark organization, or industry analyst in 2025–2026 published a rebuttal arguing that Verified's contamination claims are overstated. The search for "SWE-bench Verified not contaminated" and "contamination overstated" returned zero results. OpenAI's own retirement notice (February 23, 2026) confirmed contamination: automated red-teaming found frontier models reproducing original solutions from memory, and OpenAI found at least 59.4% of remaining tasks to be flawed or unsolvable under fair evaluation.
- Source: [Why SWE-bench Verified no longer measures frontier coding capabilities](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/)
- Source: [OpenAI Drops SWE-bench Verified: What It Means for AI](https://www.adwaitx.com/openai-swe-bench-verified-retired-ai-benchmarks/)

### Verdict: SURVIVED CHALLENGE (with one nuance weakened)

The contamination story and OpenAI's retirement of Verified both stand. The only legitimate counter-point is that Pro's harder task structure accounts for *some* of the score gap independently of contamination. The report should avoid implying that the entire ~35-point drop is attributable to contamination; some portion reflects genuine task difficulty increase. This is a framing nuance, not a factual refutation.

### Recommendation
Revise: "The same Claude Opus model scores ~35 points lower on SWE-Bench Pro than on Verified, indicating massive measurement inflation" should add a qualifier such as "with the drop driven by a combination of task-complexity increases and confirmed training-data contamination, the relative weight of each being undetermined." This is more accurate and more defensible under scrutiny.

---

## Central Claim 2: Developer Productivity Gains Are Far Smaller Than Vendor 10x Claims; METR Found Experienced Devs 19% Slower; GitClear Found 1.7× More Bugs

### Counter-Evidence Sought
- Controlled studies showing experienced devs ARE significantly faster with AI
- Critiques of METR methodology that invalidate its conclusions
- Evidence that GitClear's churn metric is misleading
- Well-cited sources documenting 5–10× gains for real engineering work

### Best Counter-Evidence Found

**1. METR itself acknowledged critical selection-bias problems and suspended its study design in February 2026.**

In a February 24, 2026 update, METR stated that its data now gives "an unreliable signal of the current productivity effect of AI tools." The cause: 30–50% of developers refused to submit tasks they didn't want to do without AI, systematically excluding high-uplift tasks. The study is therefore biased toward tasks where AI provides the least benefit. METR explicitly said the experiment needed a redesign.
- Source: [We are Changing our Developer Productivity Experiment Design — METR](https://metr.org/blog/2026-02-24-uplift-update/)

**2. METR's 19% slowdown is based on early-2025 model versions (Cursor Pro + Claude 3.5/3.7 Sonnet), not 2026 frontier tools.**

The original METR study used AI tools at the "February–June 2025 frontier." By early 2026, METR itself acknowledged that "developers are likely more sped up from AI tools now — in early 2026." The report's claim that METR's finding characterizes the current state of tools is therefore outdated.
- Source: [METR original study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)

**3. The 2025 DORA report (Google/DORA, published early 2026) found measurable positive productivity effects — including 21% increases in task completion and 98% increases in pull request volume.**

DORA surveyed 90% AI adoption and found >80% of respondents reported enhanced productivity. While DORA is survey-based rather than an RCT, it covers a far larger population than METR's 16 developers.
- Source: [AI Is Amplifying Software Engineering Performance, Says the 2025 DORA Report — InfoQ](https://www.infoq.com/news/2026/03/ai-dora-report/)
- Source: [2025 DORA State of AI Assisted Software Development](https://cloud.google.com/resources/content/2025-dora-ai-assisted-software-development-report)

**4. One aggregated dataset shows "4× to 10× more work authored" for high-frequency AI users — but this is not a controlled comparison.**

One productivity statistics aggregator cites data showing developers who use AI throughout the day "author 4× to 10× more work than AI non-users during the weeks their AI use is highest." However, this is a correlation from an uncontrolled observational study (high AI use weeks vs. low AI use weeks for the same developer), not a randomized comparison of equivalent tasks. This is a weaker form of evidence.
- Source: [Top 100 Developer Productivity Statistics with AI Tools 2026](https://www.index.dev/blog/developer-productivity-statistics-with-ai-tools)

**5. GitClear's code-churn methodology has an acknowledged limitation.**

GitClear founder Bill Harding stated that "thinking about code churn in isolation is inherently flawed," noting that "churn only exists relative to a developer's commit habits." This self-critique suggests the 1.7× bug figure should be treated as a trend indicator, not a precise measurement.
- Source: [Look beyond code churn to minimize technical debt — GitClear](https://www.gitclear.com/blog/minimize_technical_debt_and_churn)

### Verdict: WEAKENED

The 19% slowdown finding is materially weakened by METR's own 2026 retraction of its study design on selection-bias grounds, and by the fact that the study used early-2025 tools. The GitClear churn metric has an acknowledged founder-level limitation. The DORA survey and observational data show positive effects, though neither is a rigorous RCT. The report's claim that productivity gains are "far smaller than vendor claims" survives, but the METR data cannot be cited as a definitive finding without noting METR's own disavowal of that study's current reliability.

### Recommendation
Revise: Cite the METR 19% figure with an explicit caveat that (a) METR itself flagged selection bias and suspended the study in February 2026, and (b) the study reflects early-2025 tool versions. Add the DORA 2025 positive survey data as a counterweight showing that large-sample survey evidence trends positive, even if the only controlled RCT to date trended negative. The core claim — that 10× vendor claims are unsupported — survives and should remain.

---

## Central Claim 3: No Single Tool Dominates — Claude Leads SWE-bench Verified, GPT-5.4 Leads Aider Polyglot, Cursor Leads No Public Benchmark, Field Is Multi-Leader

### Counter-Evidence Sought
- Any single tool achieving clear cross-benchmark dominance in Q1 2026
- Benchmarks where Cursor Composer 2 has been independently shown to lead
- 2026 reports declaring a clear category winner

### Best Counter-Evidence Found

**1. Cursor Composer 2 leads Terminal-Bench 2.0 over Claude Opus 4.6 — and Terminal-Bench is independently run.**

Composer 2 scores 61.7 on Terminal-Bench 2.0 vs. Claude Opus 4.6's 58.0. Terminal-Bench 2.0 is run by the Laude Institute, making it a third-party evaluation. GPT-5.4 still leads at 75.1 on this benchmark, so Cursor does not lead the overall benchmark — but it does lead Claude on it.
- Source: [Cursor's Composer 2 beats Opus 4.6 on coding benchmarks at a fraction of the price — The New Stack](https://thenewstack.io/cursors-composer-2-beats-opus-46-on-coding-benchmarks-at-a-fraction-of-the-price/)
- Source: [Cursor Composer 2: A Frontier Coding Model Built for Long-Horizon Tasks](https://www.adwaitx.com/cursor-composer-2-frontier-coding-model/)

**2. GPT-5.4 leads multiple benchmarks simultaneously: SWE-bench Pro (57.7%), Terminal-Bench (75.1%), and OSWorld (75%).**

One analysis characterizes GPT-5.4 as "the most complete AI model available as of March 2026, with no other single model combining frontier coding, superhuman computer use, and strong knowledge work." While not claiming absolute dominance on any single benchmark, GPT-5.4's breadth of leadership across multiple dimensions is a form of practical dominance that the report may understate.
- Source: [GPT 5.4 Complete Guide 2026](https://www.nxcode.io/resources/news/gpt-5-4-complete-guide-features-pricing-models-2026)
- Source: [Introducing GPT-5.4 | OpenAI](https://openai.com/index/introducing-gpt-5-4/)

**3. No 2026 report declares a single universal winner. Multiple ranking sites confirm multi-leader split.**

Reviews from LogRocket (March 2026), Digital Applied (April 2026), MorphLLM, and NxCode all reach the same multi-leader conclusion: Claude Code leads SWE-bench Verified, GPT-5.4 leads SWE-bench Pro and Terminal-Bench, Composer 2 is competitive on IDE-based tasks. No analyst or benchmark site in Q1 2026 declared one tool the clear overall winner.
- Source: [AI dev tool power rankings & comparison — LogRocket Blog](https://blog.logrocket.com/ai-dev-tool-power-rankings/)
- Source: [AI Coding Assistants April 2026: Rankings and Review](https://www.digitalapplied.com/blog/ai-coding-assistants-april-2026-cursor-copilot-claude)
- Source: [Best AI for Coding (2026): Every Model Ranked by Real Benchmarks — MorphLLM](https://www.morphllm.com/best-ai-model-for-coding)

### Verdict: SURVIVED CHALLENGE (with one specific correction needed)

The multi-leader framing survives strongly. The one correction needed is factual: the report states "Cursor leads no public benchmark" but Cursor Composer 2 does lead Claude Opus 4.6 on the independently administered Terminal-Bench 2.0 (though it trails GPT-5.4 on the same benchmark). The broader claim that no single tool dominates all benchmarks is confirmed by every 2026 source found.

The GPT-5.4 cross-benchmark breadth (SWE-bench Pro + Terminal-Bench + OSWorld) is arguably the closest thing to multi-domain leadership in Q1 2026, but even GPT-5.4 does not lead on SWE-bench Verified, LLM coding contests, or IDE-integrated tasks, so the multi-leader conclusion stands.

### Recommendation
Correct the specific statement about Cursor: change "Cursor leads no public benchmark" to "Cursor Composer 2 leads Claude on Terminal-Bench 2.0 (an independently administered benchmark) but trails GPT-5.4 on the same benchmark, and leads no benchmark outright." Also add a note that GPT-5.4 shows the broadest cross-benchmark leadership of any single model in Q1 2026, which is the closest the field gets to a single leader.

---

## TASK STATUS SUMMARY

| Central Claim | Post-Adversarial Verdict | Required Action |
|---|---|---|
| **Claim 1:** SWE-bench Verified contaminated; OpenAI retired it; ~35pt gap = measurement inflation | **SURVIVED CHALLENGE** | Nuance the attribution: gap is contamination + genuine task difficulty increase; avoid implying 100% of drop is contamination |
| **Claim 2:** Productivity gains far smaller than 10x claims; METR found 19% slowdown; GitClear found 1.7× bugs | **WEAKENED** | Must disclose METR's own February 2026 study-design retraction due to selection bias; note study covers early-2025 tools only; add DORA 2025 positive survey data as counterweight |
| **Claim 3:** No single tool dominates; Claude leads Verified, GPT-5.4 leads Aider Polyglot, Cursor leads no benchmark | **SURVIVED CHALLENGE** | Correct one specific error: Cursor Composer 2 leads Claude on independently run Terminal-Bench 2.0 (though not overall); GPT-5.4's cross-domain breadth is the closest to category leadership |

**Overall assessment:** The report's three central claims are substantially correct, but Claim 2 requires the most significant revision — the METR slowdown figure is the most fragile piece of evidence and the report should not treat it as a settled finding given METR's own 2026 retraction of the study design. Claims 1 and 3 are well-supported and survive adversarial challenge with only minor framing corrections.
