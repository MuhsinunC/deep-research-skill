# Community Reviews: Claude Code Deep Research Skills

**Date:** 2026-03-21
**Skills Compared:**
1. `199-biotechnologies/claude-deep-research-skill` — 8-phase pipeline with source scoring
2. `altmbr/claude-research-skill` — multi-agent orchestrator with parallel workstreams

**Platforms Checked:** GitHub (repos, issues, stars, contributors), Shyft.ai, agent-skills.cc, skills.pawgrammer.com, ComposioHQ/awesome-claude-skills, travisvn/awesome-claude-skills, VoltAgent/awesome-agent-skills, hesreallyhim/awesome-claude-code, OpenAIToolsHub, Firecrawl blog, Composio blog, Smithery.ai, MCPMarket.com, SkillHub.club, SkillsMP.com, Indie Hackers, Hacker News, DEV.to, Medium, vc.ru, paddo.dev, Anthropic engineering blog

---

## 1. 199-biotechnologies/claude-deep-research-skill

### GitHub Stats (as of 2026-03-21)

| Metric | Value |
|---|---|
| Stars | 205 |
| Forks | 27 |
| Open Issues | 1 |
| Total Issues (all time) | 1 |
| Contributors | 1 (Boris Djordjevic, 23 commits) |
| Created | 2025-11-04 |
| Last Pushed | 2026-03-19 |
| Language | Python (88.2%), HTML (11.8%) |
| License | Not specified in API (MIT per README) |
| Star growth | +9 in last 7 days, +21 in last 30 days (per Shyft) |

### Author Background

Boris Djordjevic is the founder and CEO of 199 Biotechnologies, a Singapore-based biotech company focused on human longevity research (cellular reprogramming, senolytics, AI diagnostics). He also publishes Claude skills for SEO/GEO optimization. The deep research skill appears to be a side project from his AI tooling work, not a dedicated dev tool company.

Sources:
- [199 Biotechnologies](https://www.199.bio/)
- [Boris Djordjevic on GitHub](https://github.com/199-bio)
- [Crunchbase profile](https://www.crunchbase.com/person/boris-djordjevic-85a3)

### Commit History

The repo had a burst of activity on 2025-11-05 (10+ commits covering v2.0-2.2 features like auto-continuation, bibliography fixes, and HTML report generation), then went dormant until 2026-03-19 when v2.3 landed with template harmonization and structured evidence/critique schemas.

```
2026-03-19  fix: Clean up requirements.txt — remove unused packages, add search-cli
2026-03-19  chore: Remove 6 orphaned meta-docs, rewrite README (v2.3.2)
2026-03-19  fix: Harmonize template/validator contracts, add structured evidence + critique
2026-03-19  fix: Harmonize contracts, add search-cli, fix stale year refs (v2.3)
2025-11-05  fix: Complete HTML report generation with proper MD conversion and verification
2025-11-05  feat: Auto-Continuation System for TRUE unlimited length (v2.2)
2025-11-05  fix: Respect Claude Code 32K output token limit (v2.1.1)
2025-11-05  feat: Progressive File Assembly for unlimited report lengths (v2.1)
2025-11-05  fix: Critical bibliography fixes + HTML typography improvements
2025-11-05  fix: Correct syntax error and enhance citation validation logic
```

### Real User Feedback

#### GitHub Issue #1 (OPEN) — "dynamic parts of skill don't appear to be implemented"
**Filed by:** rba100 on 2026-03-03 | 0 comments, no response from maintainer

> "There's a dynamic section at the end of the skill markdown that does not seem to have any mechanism to update it. The research engine script creates a json file but it's not clear how to integrate this."

> "I run the script in automation for users and they notice the system falls back to 'the output was truncated, I'll just write the html' and then a massive LLM call that often times out."

> "I've found the workflow outlined in SKILL.md to be pretty good for deep research, even as is. Many thanks for sharing!"

**Analysis:** This is the only user issue ever filed. The user is running the skill programmatically via the Claude Code SDK and hits a timeout/truncation problem with the HTML report generation. The maintainer has not responded (18 days and counting). The user still gives a partial endorsement of the SKILL.md workflow itself.

Source: [GitHub Issue #1](https://github.com/199-biotechnologies/claude-deep-research-skill/issues/1)

### Marketplace Listings

#### Shyft.ai
- **Rating:** Silver tier, 3/5 stars (1 rating only)
- **Quality Score:** 39/100
- **AI Readiness Score:** 60/100
- **Installs:** 0 weekly, 0 total (newly listed)
- **Popularity Score:** 3/10
- **Page views:** 1 in last 7 days

Source: [Shyft listing](https://shyft.ai/skills/claude-deep-research-skill)

#### agent-skills.cc
Listed but no specific download counts or ratings found for the deep research skill. Their SEO/GEO optimizer skill has a 5.0 star rating with 12 reviews on that platform.

Source: [agent-skills.cc SEO skill](https://agent-skills.cc/skills/199-biotechnologies-claude-skill-seo-geo-optimizer)

### Awesome Lists & Curated Collections

**NOT listed in any of the major awesome lists checked:**
- ComposioHQ/awesome-claude-skills — absent
- travisvn/awesome-claude-skills — absent
- VoltAgent/awesome-agent-skills — absent
- hesreallyhim/awesome-claude-code — absent
- karanb192/awesome-claude-skills — absent
- OpenAIToolsHub "349 Agent Skills Ranked" — absent
- Firecrawl "Best Claude Code Skills" — absent
- Composio "Top 10 Claude Code Skills" — absent

**Listed in:**
- vc.ru Russian-language guide on Claude Skills — mentioned as "community-реализация Deep Research для Claude Code с 8-фазным пайплайном" with architecture details and installation instructions

Source: [vc.ru guide](https://vc.ru/ai/2804382-claude-skills-gajd-po-skill-md-deep-research-i-instrumentam)

### Competitive Claims (Unverified)

The repo title claims it "Outperforms OpenAI, Gemini, and Claude Desktop in quality and verification." The repo includes a COMPETITIVE_ANALYSIS.md file, but:
- No external benchmarks have been published
- No third-party verification exists
- No comparative test results are available publicly
- The analysis appears to be self-authored by the maintainer

### Known Limitations & Red Flags

1. **Single contributor** — all 23 commits are from Boris Djordjevic. No community PRs accepted.
2. **Unresponsive to issues** — the only filed issue (18 days old) has zero comments from the maintainer.
3. **HTML report timeout** — user rba100 reports the system "falls back to 'the output was truncated, I'll just write the html' and then a massive LLM call that often times out."
4. **Dynamic sections not functional** — the SKILL.md has dynamic template sections that lack implementation per the only issue report.
5. **Zero installs on Shyft** — despite 205 stars, the Shyft marketplace shows 0 installs and minimal visibility.
6. **Quality score of 39/100 on Shyft** — well below average.
7. **Complex installation** — requires git clone of entire repo into `~/.claude/skills/deep-research`, with optional Python dependencies for validation scripts.
8. **No test suite** — repo has test fixtures but no runnable test suite visible.
9. **Gap between v2.2 (Nov 2025) and v2.3 (Mar 2026)** — 4.5 months of inactivity.

### Positive Signals

1. **205 stars** — meaningful traction for a niche Claude Code skill.
2. **27 forks** — some community interest in building on it.
3. **Active maintenance** — v2.3 update in March 2026 shows ongoing development.
4. **Comprehensive architecture** — 8-phase pipeline, source scoring, multiple output formats (MD/HTML/PDF).
5. **Citation validation** — includes verify_citations.py for DOI/URL/hallucination detection.
6. **Multiple research modes** — Quick (3 phases, 2-5 min), Standard (6), Deep (8), UltraDeep (8+).
7. **rba100 partial endorsement** — "the workflow outlined in SKILL.md [is] pretty good for deep research, even as is."

---

## 2. altmbr/claude-research-skill

### GitHub Stats (as of 2026-03-21)

| Metric | Value |
|---|---|
| Stars | 8 |
| Forks | 0 |
| Open Issues | 0 |
| Total Issues (all time) | 0 |
| Contributors | 1 (Bryan Altman, 3 commits) |
| Created | 2026-03-06 |
| Last Pushed | 2026-03-06 |
| Language | None (pure Markdown skill) |
| License | MIT |
| Topics | ai-agent, ai-research, claude-code, claude-skills, multi-agent, research, skill-md |

### Author Background

Bryan Altman is a San Francisco-based angel investor and startup builder. Previous experience includes Setter (backed by Sequoia, acquired by Thumbtack), Chainvine (backed by Slow Ventures), and McKinsey. He has 23 public repos on GitHub but 0 followers, suggesting this is a recent/side project profile.

Source: [GitHub profile](https://github.com/altmbr)

### Commit History

The repo has exactly 3 commits, all on 2026-03-06:

```
2026-03-06  Resolve merge conflict, keep MIT license
2026-03-06  Initial release: Multi-agent research orchestrator for Claude Code
2026-03-06  Initial commit
```

**No updates since initial release (15 days ago).**

### Real User Feedback

**No user feedback exists anywhere:**
- 0 issues filed on GitHub
- 0 pull requests
- Not listed on any marketplace (Shyft, Smithery, agent-skills.cc, MCPMarket, SkillHub, SkillsMP)
- Not mentioned in any awesome list
- No blog posts reviewing it
- No Hacker News discussion
- No Reddit/community mentions found

### Marketplace Listings

**Not listed on any marketplace checked.**

### Awesome Lists & Curated Collections

**Not listed in any of the major awesome lists checked** (same set as above).

### Architecture Assessment

The skill is a single SKILL.md file (~single page) that uses Claude Code's built-in Task tool to:
1. Decompose a question into 2-4 parallel workstreams
2. Create skeleton files with section headers
3. Launch subagents simultaneously
4. Monitor at escalating intervals (30s, 2min, 5min, then every 5min)
5. Kill and relaunch stuck agents with recovered data
6. Synthesize results into a unified document

**Claimed output:** ~1,700+ lines across 4 markdown files in ~10 minutes (based on a single dating psychology example from README).

### Known Limitations & Red Flags

1. **Brand new** — created 15 days ago, only 3 commits, no updates.
2. **Zero community validation** — 8 stars, 0 forks, 0 issues, 0 user reports.
3. **No marketplace presence** — not indexed anywhere.
4. **Single example** — only one documented output (dating psychology query).
5. **No citation validation** — relies on agents citing sources inline, but no automated verification.
6. **No error handling documentation** — what happens when agents fail beyond the stuck-agent recovery?
7. **No test fixtures or validation scripts** — pure prompt-based approach.
8. **Author has 0 GitHub followers** — limited community trust signals.
9. **No response to community** — though no issues have been filed, there's also no README discussion, no changelog, no roadmap.

### Positive Signals

1. **Zero dependencies** — pure SKILL.md, no API keys, no Python, no external services.
2. **Clever architecture** — stuck-agent detection via line count monitoring is elegant.
3. **Write-after-search protocol** — enforces alternating search/write to prevent research loops.
4. **User approval gate** — shows decomposition plan before launching.
5. **MIT license** — clearly permissive.
6. **Lightweight** — single file install, works immediately.
7. **Author has legitimate background** — McKinsey + startup experience suggests practical orientation.

---

## 3. Head-to-Head Comparison

| Dimension | 199-biotechnologies | altmbr |
|---|---|---|
| **Stars** | 205 | 8 |
| **Forks** | 27 | 0 |
| **Age** | ~5 months | ~15 days |
| **Last update** | 2026-03-19 | 2026-03-06 |
| **Commits** | 23 | 3 |
| **Contributors** | 1 | 1 |
| **Issues filed** | 1 (open, unresponded) | 0 |
| **Dependencies** | Python (optional), git clone | None (single file) |
| **Installation** | Clone repo to skills dir | Copy one file |
| **Research approach** | 8-phase sequential pipeline | 2-4 parallel agents |
| **Output formats** | MD, HTML, PDF | MD only |
| **Citation validation** | Automated (verify_citations.py) | Agent self-citation only |
| **Source scoring** | Yes (0-100 credibility) | No |
| **Marketplace presence** | Shyft (39/100 quality), agent-skills.cc | None |
| **Awesome list presence** | None | None |
| **User testimonials** | 1 (partial positive, with bug) | 0 |
| **External reviews** | 0 | 0 |
| **Blog mentions** | 1 (vc.ru Russian guide) | 0 |
| **Hacker News** | Not directly discussed | Not discussed |
| **Token cost** | Higher (8-phase pipeline, validation) | Lower (parallel but shorter) |
| **Risk of timeout** | Known issue (HTML generation) | Unknown (no reports) |

---

## 4. Community Ecosystem Context

### How These Skills Rank in the Broader Landscape

As of March 2026, the Claude Code skill ecosystem has 85,000+ indexed skills across platforms. The top 5 most-installed skills have 100K-418K installs each (find-skills, vercel-react-best-practices, web-design-guidelines, remotion-best-practices, frontend-design). Deep research skills are a niche category.

Neither skill appears in any "best of" or "top skills" list from major curators (Composio, Firecrawl, OpenAIToolsHub, or any awesome-claude-skills repo).

Source: [OpenAIToolsHub ranking](https://www.openaitoolshub.org/en/blog/best-claude-code-skills-2026)

### Competing Deep Research Skills

Other deep research skills exist in the ecosystem:
- **Weizhena/Deep-Research-skills** — structured two-phase research with human-in-the-loop control (Claude Code/Open Code/Codex compatible)
- **Imbad0202/academic-research-skills** — academic workflow: research, write, review, revise, finalize
- **K-Dense-AI/claude-scientific-skills** — 170+ scientific research skills
- **mcherukara/Claude-Deep-Research** — MCP server for research capabilities
- **uditgoenka/autoresearch** — self-improving research inspired by Karpathy

Sources:
- [Weizhena/Deep-Research-skills](https://github.com/Weizhena/Deep-Research-skills)
- [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills)
- [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills)

### Anthropic's Own Multi-Agent Research

Anthropic published details of their internal multi-agent research system (powering Claude's built-in Research feature), which uses an orchestrator-worker pattern with Claude Opus 4 as lead agent and Sonnet 4 subagents. It achieved a **90.2% improvement** over single-agent Claude Opus 4 on internal research evaluations.

> "Multi-agent systems use about 15x more tokens than basic chat interactions."

This is the architecture both community skills are trying to approximate.

Source: [Anthropic Engineering Blog](https://www.anthropic.com/engineering/multi-agent-research-system)

---

## 5. General Claude Code Skills Reliability Issues

These platform-level problems affect ALL Claude Code skills, including both research skills:

1. **Skills don't auto-activate reliably** — Claude often doesn't discover or use available skills despite being able to list them when asked explicitly.
   Source: [Scott Spence blog](https://scottspence.com/posts/claude-code-skills-dont-auto-activate)

2. **Skills truncated at 30** — if you have more than 30 skills installed, additional ones are invisible to Claude.
   Source: [GitHub Issue #13343](https://github.com/anthropics/claude-code/issues/13343)

3. **Context compaction destroys skill context** — mid-task compaction causes hallucinations in Plan Mode "100% of the time."
   Source: [GitHub Issue #20051](https://github.com/anthropics/claude-code/issues/20051)

4. **Bash timeout at 2 minutes** — Claude Code kills bash commands after 120 seconds, which can break long-running research operations.
   Source: [GitHub Issue #5615](https://github.com/anthropics/claude-code/issues/5615)

5. **Web fetch hangs** — "When Claude Code is asked to conduct deep research over the web, it will very often get stuck fetching a web page, and doesn't understand the concept of a timeout."
   Source: [GitHub Issue #27554](https://github.com/anthropics/claude-code/issues/27554)

6. **30% inconsistency rate** — "About 70% of the time, skills produce exactly what's wanted, but the other 30% yields inconsistent, off-format, or wrong output."

7. **Skill description mismatch** — "Claude sometimes reads a skill description, decides it understands what the skill does, and never opens the full file—instead improvising based on the description alone."

---

## 6. Verdict: What Real Users Actually Think

### The Hard Truth

**Neither skill has meaningful community validation.** Despite 205 stars, the 199-biotechnologies skill has exactly ONE user who filed an issue, and that issue is unresolved. The altmbr skill has zero external users on record.

No independent benchmarks, no comparative tests, no user reviews on any marketplace, no blog reviews, no Reddit discussions, no Hacker News threads specifically about either skill.

### 199-biotechnologies Assessment

**What the single real user said:** The SKILL.md workflow is "pretty good for deep research, even as is," but the Python scripts and HTML generation path has integration problems and timeouts. The dynamic skill sections appear non-functional. Running it via the Claude Code SDK for automated use cases is problematic.

**Stars vs. usage gap:** 205 stars but 0 Shyft installs and a 39/100 quality score suggests many people starred it as interesting/aspirational but few actually use it in production. The 27 forks could indicate people customizing it, but no community PRs have been submitted.

### altmbr Assessment

**No user data exists.** The skill is 15 days old with 8 stars and zero community interaction. The architecture is sound on paper (parallel agents, stuck-agent recovery, write-after-search protocol), but there's no evidence anyone beyond the author has used it successfully. The single documented example (dating psychology) is insufficient to assess real-world reliability.

### Bottom Line

Both skills are **unproven in the wild**. The 199-biotechnologies skill has more features and more social proof (stars/forks), but its only user report describes integration problems. The altmbr skill is simpler and easier to install, but has no community signal at all.

For anyone choosing between them: the 199-bio skill is the safer bet due to more maturity and at least one partial user endorsement, but expect to troubleshoot. The altmbr skill is worth watching if you want a lightweight, zero-dependency approach — but wait for community validation before relying on it.

---

## Sources

### GitHub Repositories
- [199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill)
- [altmbr/claude-research-skill](https://github.com/altmbr/claude-research-skill)
- [GitHub Issue #1 — 199-biotechnologies](https://github.com/199-biotechnologies/claude-deep-research-skill/issues/1)

### Marketplace Listings
- [Shyft.ai — claude-deep-research-skill](https://shyft.ai/skills/claude-deep-research-skill)
- [agent-skills.cc — 199-biotechnologies SEO skill](https://agent-skills.cc/skills/199-biotechnologies-claude-skill-seo-geo-optimizer)

### Blog Posts & Articles
- [vc.ru — Claude Skills guide (Russian)](https://vc.ru/ai/2804382-claude-skills-gajd-po-skill-md-deep-research-i-instrumentam)
- [paddo.dev — Three Ways to Build Deep Research with Claude](https://paddo.dev/blog/three-ways-deep-research-claude/)
- [Anthropic — How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Scott Spence — Claude Code Skills Don't Auto-Activate](https://scottspence.com/posts/claude-code-skills-dont-auto-activate)

### Skills Ecosystem
- [OpenAIToolsHub — 349 Agent Skills Ranked](https://www.openaitoolshub.org/en/blog/best-claude-code-skills-2026)
- [Composio — Top 10 Claude Code Skills](https://composio.dev/content/top-claude-skills)
- [Firecrawl — Best Claude Code Skills 2026](https://www.firecrawl.dev/blog/best-claude-code-skills)
- [Indie Hackers — 200 Claude Code Skills Tested](https://www.indiehackers.com/post/i-tested-200-claude-code-skills-so-you-dont-have-to-here-are-the-20-that-actually-changed-how-i-work-b383a23ce3)

### Hacker News Discussions
- [Show HN: Deep research with Claude Code and Obsidian](https://news.ycombinator.com/item?id=47246516)
- [Claude skills documentation concerns](https://news.ycombinator.com/item?id=45611559)

### Claude Code Platform Issues
- [GitHub #13343 — Skills truncated at 30](https://github.com/anthropics/claude-code/issues/13343)
- [GitHub #20051 — Plan Mode hallucination after compaction](https://github.com/anthropics/claude-code/issues/20051)
- [GitHub #5615 — Timeout configuration](https://github.com/anthropics/claude-code/issues/5615)
- [GitHub #27554 — Web fetch hangs during deep research](https://github.com/anthropics/claude-code/issues/27554)

### Author Profiles
- [Boris Djordjevic — 199 Biotechnologies](https://www.199.bio/about/team)
- [Bryan Altman — GitHub](https://github.com/altmbr)
