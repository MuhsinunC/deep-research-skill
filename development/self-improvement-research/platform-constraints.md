# Claude Code Platform Constraints & Limitations Affecting Deep Research Skills

**Research Date:** 2026-03-22
**Purpose:** Identify platform-level issues that degrade research skill quality, and document workarounds.

---

## 1. Context Compaction / Memory Loss

### The Problem
- Auto-compaction triggers at ~83.5% of total context window (~167K tokens for a 200K window).
- During compaction, specific variable names, exact error messages, nuanced decisions, and earlier research findings are compressed into lossy summaries.
- After compaction, Claude loses track of earlier decisions and sometimes contradicts its own prior findings.
- Extended research sessions (15-20+ tool calls) routinely trigger compaction, after which Claude "forgets" earlier schema decisions and implementation choices.
- The compaction threshold is hardcoded -- not configurable by users or skills.
- By the time compaction triggers at 80%+, Claude has already spent 20-30% of the session generating degraded output.
- The gap between marketed capability ("1M context window") and reliable usage (~200-256K with progressive degradation) is a documented defect.
- **Sub-agent output files are deleted during compaction.** When compaction triggers, output files for sub-agents that completed *before* compaction are permanently lost. In one documented case, only 4 out of 14+ sub-agent output files survived compaction. System reminders reference task IDs whose files no longer exist on disk.
- **MCP connector auth lost after compaction.** Custom MCP connectors in Cowork mode lose their authenticated session state after context compaction (not just server restarts).
- **Working memory not proactively applied.** After auto-compact, Claude loses working memory completely. It can read memory when explicitly prompted but doesn't proactively apply previously established context, project settings, or environment configurations.
- **Compaction can fail entirely.** When the context window reaches its limit, running `/compact` fails with "Conversation too long" -- the very scenario where compaction is most needed. Reported at as low as 48% context usage with Opus 4.6.

### Sources
- [How Claude Code Got Better by Protecting More Context](https://hyperdev.matsuoka.com/p/how-claude-code-got-better-by-protecting)
- [Context Compaction Research: Claude Code, Codex CLI, OpenCode, Amp (GitHub Gist)](https://gist.github.com/badlogic/cd2ef65b0697c4dbe2d13fbecb0a0a5f)
- [Persistent Context Compaction Preventing Workflow Completion - Issue #4878](https://github.com/anthropics/claude-code/issues/4878)
- [Claude Code Context Buffer: The 33K-45K Token Problem](https://claudefa.st/blog/guide/mechanics/context-buffer-management)
- [Increase effective context window / reduce compaction overhead - Issue #28984](https://github.com/anthropics/claude-code/issues/28984)
- [1M Context Window Does Not Work as Marketed - Issue #35296](https://github.com/anthropics/claude-code/issues/35296)
- [Subagent output files lost after context compaction - Issue #23821](https://github.com/anthropics/claude-code/issues/23821)
- [Cowork MCP connectors lose auth after context compaction - Issue #34832](https://github.com/anthropics/claude-code/issues/34832)
- [Memory Loss After Auto-compact - Issue #1534](https://github.com/anthropics/claude-code/issues/1534)
- [Compaction fails with 'Conversation too long' at 48% context usage (Opus 4.6) - Issue #23751](https://github.com/anthropics/claude-code/issues/23751)
- [Auto-backup Task outputs before context compaction - Issue #31420](https://github.com/anthropics/claude-code/issues/31420)

### Workarounds for a Deep Research Skill
1. **Write findings to disk after every major step.** Never accumulate research in memory -- always persist to the markdown file incrementally. This way, even if compaction wipes the context, the file on disk is the source of truth.
2. **Re-read the research file after compaction.** If the skill detects it's in a long session, proactively re-read the output file to restore context.
3. **Keep individual research sub-tasks small.** Dispatch sub-agents for each independent research thread so no single agent accumulates enough context to trigger compaction.
4. **Use structured file formats.** Markdown with clear headers, tables, and numbered sections makes it easy to re-parse after context loss.
5. **Include a "Current State" section** at the top of the research file that summarizes what has been done and what remains, so any agent (or post-compaction Claude) can pick up where things left off.
6. **Save sub-agent outputs to project files immediately** after each agent completes, before compaction can delete them. Do not rely on the default output file mechanism -- it is unreliable and files are deleted during compaction.
7. **Use the Write tool explicitly in sub-agent prompts** to persist results to named files. The default conversational output mechanism silently drops output for background agents (~30% success rate vs 100% for explicit Write).

---

## 2. Skill Auto-Activation Unreliability

### The Problem
- Skills are supposed to activate autonomously based on their `description` field in SKILL.md frontmatter.
- In practice, activation rate is approximately 50% -- essentially a coin flip.
- Claude often ignores skills entirely and proceeds with base knowledge, even when the skill perfectly matches the task.
- Vague descriptions, unclear instructions, or overly clever setups exacerbate the problem.
- If two skills have overlapping descriptions, Claude can't pick either one -- it may pick the wrong skill, loop between them, or fall back to base knowledge.

### Sources
- [How to Activate Claude Skills Automatically: 2 Fixes for 95% Activation](https://dev.to/oluwawunmiadesewa/claude-code-skills-not-triggering-2-fixes-for-100-activation-3b57)
- [How to Make Claude Code Skills Activate Reliably - Scott Spence](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably)
- [Claude Code Skills Don't Auto-Activate (a workaround) - Scott Spence](https://scottspence.com/posts/claude-code-skills-dont-auto-activate)
- [How to Make Claude Code Skills Actually Activate (650 Trials)](https://medium.com/@ivan.seleznov1/why-claude-code-skills-dont-activate-and-how-to-fix-it-86f679409af1)
- [Skill activation is extremely unstable - GitHub Discussion #182117](https://github.com/orgs/community/discussions/182117)
- [Skills Auto-Activation via Hooks](https://paddo.dev/blog/claude-skills-hooks-solution/)
- [AI in Testing #9: The Invisible Limitations of Claude Code Skills](https://medium.com/@cheparsky/ai-in-testing-9-the-invisible-limitations-of-claude-code-skills-you-didnt-know-f3adbdcf3680)

### Workarounds for a Deep Research Skill
1. **Use a UserPromptSubmit hook** to inject skill activation instructions into every prompt. This runs before Claude responds and gives reliable control.
2. **Use aggressive, unambiguous trigger language** in the skill description. Words like "MANDATORY", "CRITICAL" make it harder for Claude to ignore.
3. **Make skill descriptions highly specific** -- not "helps with research" but "activates when user requests web research on products, prices, or comparisons."
4. **Avoid overlapping descriptions** between skills. If you have multiple research-related skills, make their trigger conditions mutually exclusive.
5. **Reference the skill by name in CLAUDE.md** with explicit instructions like "When the user asks for deep research, ALWAYS use the /deep-research skill."
6. **Consider a forced eval hook** -- a hook that requires Claude to evaluate each skill explicitly (YES/NO) before proceeding, creating a commitment mechanism.

---

## 3. WebSearch and WebFetch Tool Limitations

### The Problem
- **WebFetch never returns raw content.** It processes content through a small, fast model and returns a summary/answer, not the original HTML or markdown. This means the research skill cannot get verbatim data -- only model-interpreted summaries.
- **Content truncation.** Fetched content is truncated to 100KB of text. Large pages lose data silently.
- **Max content size is ~10MB** at fetch time, with further truncation during processing.
- **WebSearch discards useful fields.** Claude Code's implementation only extracts `title` and `url` from search results, discarding `page_age` and `encrypted_content` fields.
- **403 errors on common sites.** Wikipedia, documentation sites, and others frequently return 403 errors despite allowing bot access.
- **No "Always Allow" option for WebSearch.** Users must manually approve every single search request -- no session-level or persistent approval.
- **Permission configuration bugs.** Adding WebSearch/WebFetch to `settings.json` under `permissions.allow` doesn't take effect until restart. Deny patterns also have bugs specific to these tools.
- **Sub-agents (marketplace plugins) can't access WebSearch/WebFetch.** This is a documented bug -- plugin agents lack access to these tools entirely.
- **Site blocking.** Cloudflare-protected sites, B&H Photo, and many others block automated access.

### Sources
- [Inside Claude Code's Web Tools: WebFetch vs WebSearch](https://mikhail.io/2025/10/claude-code-web-tools/)
- [WebFetch unable to access external documentation sites - Issue #8331](https://github.com/anthropics/claude-code/issues/8331)
- [WebFetch/WebSearch in permissions.deny Breaks Plugin Loading - Issue #11812](https://github.com/anthropics/claude-code/issues/11812)
- [WebSearch permission cannot be persistently allowed - Issue #27862](https://github.com/anthropics/claude-code/issues/27862)
- [Plugin agents lack access to WebSearch and WebFetch - Issue #21318](https://github.com/anthropics/claude-code/issues/21318)
- [WebFetch returns 403 on Wikipedia and other sites - Issue #22846](https://github.com/anthropics/claude-code/issues/22846)
- [Auto-approve WebSearch tool via permissions configuration - Issue #11799](https://github.com/anthropics/claude-code/issues/11799)

### Workarounds for a Deep Research Skill
1. **Use browser automation (MCP tools) as fallback** when WebFetch returns 403 or fails. The `mcp__claude-in-chrome` tools can navigate to pages that block automated fetching.
2. **Ask targeted questions in WebFetch prompts.** Since WebFetch returns model-interpreted answers rather than raw content, craft specific extraction prompts: "Extract all prices, product names, and seller ratings from this page" rather than generic "summarize this page."
3. **Make multiple targeted WebFetch calls** to the same URL with different prompts to extract different facets of information, working around the summarization limitation.
4. **Pre-approve WebSearch in settings.json and restart** before starting research sessions, to avoid per-search approval prompts.
5. **Avoid relying on sub-agents for web searches** when using marketplace plugins -- route web search tasks through the main agent or use Bash tool with `curl` as a fallback.
6. **Maintain a list of known-blocked sites** (B&H Photo, Cloudflare-heavy sites) and skip them proactively rather than wasting tokens on failed fetches.

---

## 4. Sub-Agent Limitations

### The Problem
- Sub-agents report results in isolation -- they **cannot share findings, challenge assumptions, or coordinate** with each other directly.
- Practical limit of 3-4 sub-agents maximum. More than that and the orchestrating agent spends too much time deciding which agent to invoke, reducing productivity.
- **Name inference bug:** Claude Code infers a sub-agent's function based on its name and applies pre-defined, generic rules, silently overriding custom instructions. A sub-agent named "code-reviewer" gets generic code review behavior imposed regardless of what the custom instructions say.
- **Systematic instruction-ignoring:** Claude Code exhibits patterns of doing the opposite of explicit instructions while claiming compliance. These patterns persist across sessions, models, and task types.
- **Token consumption bugs:** Some versions exhibit heightened token consumption with sub-agents.

### Sources
- [Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [A practical guide to the Claude Code sub-agent for 2025](https://www.eesel.ai/blog/claude-code-sub-agent)
- [Fix Common Claude Code Sub-Agent Setup Problems](https://www.arsturn.com/blog/fixing-common-claude-code-sub-agent-problems)
- [Unified Bug Report: Claude Code Agent Systematic Failure Patterns - Issue #19739](https://github.com/anthropics/claude-code/issues/19739)
- [Claude Code multiple agent systems: Complete 2026 guide](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide)

### Workarounds for a Deep Research Skill
1. **Use non-descriptive names for sub-agents** to prevent Claude from overriding custom instructions with inferred generic behavior. Name them "worker-1", "task-alpha" instead of "researcher" or "reviewer."
2. **Limit to 3-4 parallel sub-agents** per research task. If more parallelism is needed, batch them in waves.
3. **Design sub-agents to be fully independent.** Each sub-agent should have all the context it needs in its prompt -- no reliance on shared state or cross-agent communication.
4. **Have the orchestrator merge results explicitly.** After all sub-agents complete, the main agent should read all outputs and synthesize, rather than expecting sub-agents to coordinate.
5. **Include verification instructions in each sub-agent prompt.** Since sub-agents can ignore instructions, add redundant verification steps: "After completing research, re-read your findings and verify each claim has a source URL."
6. **Write sub-agent results to separate files**, then have the orchestrator merge them. This prevents context overload in the main agent.

---

## 5. Skill Character Budget Constraints

### The Problem
- Skills have a character budget that scales dynamically at **2% of the context window**, with a fallback of 16,000 characters.
- Each skill in the metadata block takes its description length plus ~109 characters of XML overhead.
- Typical capacity: 42 skills (with 263-char descriptions) to 67 skills (with 130-char descriptions).
- Discovery is **not recursive** -- skills in nested folders won't be found.
- **Symlinks are ignored** -- can't use them to organize skills across directories.
- Once Claude reads a skill's full content mid-session, that content stays in conversation history until compaction or restart.

### Sources
- [Extend Claude with skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [AI in Testing #9: The Invisible Limitations of Claude Code Skills](https://medium.com/@cheparsky/ai-in-testing-9-the-invisible-limitations-of-claude-code-skills-you-didnt-know-f3adbdcf3680)

### Workarounds for a Deep Research Skill
1. **Keep skill descriptions concise** -- under 200 characters. Front-load the most important trigger words.
2. **Don't nest skill files in subdirectories** -- keep them at the expected discovery level.
3. **Use the skill file itself as a dispatcher** -- keep the SKILL.md small and have it reference external instruction files that get read on-demand.
4. **Avoid loading large skill content early in sessions** to preserve context budget for actual research work.

---

## 6. Research-First Protocol Violations

### The Problem
- Claude Code defaults to "running commands and making progress" even when the user has specifically instructed it to stop and research first.
- After researching, Claude rushes back into action without fully reviewing what it found.
- Claude skips searching for known issues/bugs before executing potentially destructive actions.
- Claude systematically ignores CLAUDE.md instructions related to knowledge retrieval and resource evaluation.
- Auto-retrieval from knowledge bases doesn't work reliably -- Claude defaults to "we already have X" without deeply evaluating resources.

### Sources
- [Claude Code repeatedly ignores explicit user instructions to stop and research - Issue #28868](https://github.com/anthropics/claude-code/issues/28868)
- [Claude Code systematically ignores CLAUDE.md knowledge retrieval rules - Issue #32161](https://github.com/anthropics/claude-code/issues/32161)
- [Massive quality regression - Issue #21431](https://github.com/anthropics/claude-code/issues/21431)

### Workarounds for a Deep Research Skill
1. **Structure the skill as explicit phases** with gates between them. Phase 1: Plan. Phase 2: Research. Phase 3: Synthesize. Each phase must complete and write outputs before the next begins.
2. **Use a verification sub-agent** that independently checks whether the research phase was actually thorough before allowing synthesis.
3. **Include explicit "STOP and review" instructions** at transition points in the skill. Use strong language: "DO NOT proceed to synthesis until all research sources have been written to the file."
4. **Write a research plan to disk first**, then execute against that plan, checking off items as they complete. This creates an audit trail that prevents skipping steps.
5. **Add redundant reminders** throughout the skill instructions. Due to the instruction-ignoring bug, a single mention is insufficient -- repeat critical directives.

---

## 7. Background Agent Output Loss (`run_in_background`)

### The Problem
- When spawning Task agents with `run_in_background=true`, agent responses are **silently discarded** after completion. The output file exists but remains empty (0 bytes).
- In testing, 5 parallel background agents all completed with zero output -- 100% data loss rate for conversational responses.
- Default output file reliability is ~30%. External tool calls (Write, Bash with `gh`, MCP tools) are 100% reliable.
- Adding explicit instructions like "You MUST use the Write tool" does not reliably fix the problem -- agents in background mode don't follow them consistently.
- **Session freeze:** Launching multiple background agents and calling TaskOutput with `block: true` can cause sessions to become completely unresponsive -- never recovering, even with 60-second timeouts.
- **TaskOutput hanging:** Even when an agent completes, TaskOutput can hang indefinitely waiting for it.
- **On Claude Code Web:** Background agents fail entirely because sandbox recycling kills all agents and deletes their files between turns.
- This is a widespread issue with 8+ duplicate reports: #15083, #16958, #15138, #17147, #19295, #20164, #20261, #21352.

### Sources
- [run_in_background=true Task agents silently lose all output - Issue #17011](https://github.com/anthropics/claude-code/issues/17011)
- [Session freezes with multiple background agents + blocking TaskOutput - Issue #17540](https://github.com/anthropics/claude-code/issues/17540)
- [TaskOutput hangs after background agent completes - Issue #20236](https://github.com/anthropics/claude-code/issues/20236)
- [Background Task agents fail on Claude Code Web - Issue #23707](https://github.com/anthropics/claude-code/issues/23707)
- [Claude Code Async: Background Agents & Parallel Tasks](https://claudefa.st/blog/guide/agents/async-workflows)

### Workarounds for a Deep Research Skill
1. **Always include explicit Write tool instructions** in background agent prompts: "Write your complete findings to `/path/to/output-{agent-id}.md` using the Write tool. Your conversational output WILL BE LOST."
2. **Use a two-file strategy:** Each background agent writes to a unique output file AND a shared status file that the orchestrator monitors.
3. **Prefer foreground execution for critical research.** If the results are essential, don't use `run_in_background=true`. Use blocking execution.
4. **Cap background agents at 3 concurrent** to avoid session freezes.
5. **Don't use `block: true` in TaskOutput** -- poll periodically instead, or use the task notification system.
6. **For GitHub-integrated workflows,** have agents post findings as GitHub issue comments using `gh issue comment` -- this is 100% reliable.

---

## 8. WebSearch Permission Approval Fatigue

### The Problem
- Every single WebSearch invocation requires manual user approval via a popup with no "Always Allow" option.
- Research tasks requiring 15-20+ web searches force users to click "approve" 15-20+ times.
- If Claude sends 4 parallel searches, users see 4 popups in rapid succession -- error-prone, as users accidentally deny when they meant to approve.
- Adding WebSearch to `settings.json` under `permissions.allow` doesn't take effect in the running session -- requires restart.
- Wildcard permissions (like `WebSearch(*)`) are not supported, unlike virtually all other tools.
- "Approval fatigue" causes users to stop evaluating and start clicking through automatically, defeating the security purpose.
- Even "permissionless mode" blocks WebSearch in some configurations.

### Sources
- [WebSearch permission cannot be persistently allowed - Issue #27862](https://github.com/anthropics/claude-code/issues/27862)
- [Auto-approve WebSearch tool without prompts - Issue #11799](https://github.com/anthropics/claude-code/issues/11799)
- [Allow wildcard permissions for WebSearch tool - Issue #26530](https://github.com/anthropics/claude-code/issues/26530)
- [WebSearch Tool Blocked Despite Permissionless Mode - Issue #21091](https://github.com/anthropics/claude-code/issues/21091)
- [Stop Clicking "Approve": How I Killed Approval Fatigue with Claude Code 2.1](https://medium.com/@richardhightower/stop-clicking-approve-how-i-killed-approval-fatigue-with-claude-code-2-1-60962946d101)
- [Claude Code Sandboxing: Permission Fatigue Problem](https://alirezarezvani.medium.com/claude-code-sandboxing-ai-coding-tools-have-a-permission-fatigue-problem-5409d2689ce3)
- [Allow permanent auto-approval of read-only MCP tools - Issue #25966](https://github.com/anthropics/claude-code/issues/25966)

### Workarounds for a Deep Research Skill
1. **Pre-configure permissions and restart before research sessions.** Add `WebSearch` to `permissions.allow` in `settings.json`, then restart Claude Code.
2. **Batch search queries** to minimize the total number of approval prompts. Plan all queries upfront and execute them in a concentrated burst rather than intermittently.
3. **Use WebFetch as a secondary path** for known URLs -- WebFetch approval is more flexible than WebSearch approval.
4. **Document the permission setup in the skill's README** so users know to configure it before starting.
5. **Use browser automation (MCP) as an alternative** when WebSearch approval is too disruptive -- browser tools have different permission models.

---

## 9. Hallucination and Verification Failures in Research

### The Problem
- Claude can reference files, functions, APIs, and code that don't exist -- output "looks perfect on screen but fails when executed."
- Multi-source verification reduces hallucinations but does not eliminate them.
- Key hallucination drivers: insufficient context verification, pattern matching over actual documentation, and missing validation workflows.
- **If sources are wrong, verification just confirms the wrong answer with citations.** This is a fundamental limitation of source-based verification.
- Claude can get stuck in infinite loops on failed approaches, retrying the same strategy multiple times without trying alternatives.
- "Context rot" occurs over long sessions where instructions from earlier get forgotten and quality degrades progressively.
- Claude has hallucinated fake user input mid-response, then compounded the error by treating the hallucination as real.

### Sources
- [Claude hallucinated fake user input mid-response - Issue #10628](https://github.com/anthropics/claude-code/issues/10628)
- [Why Does Claude Code Hallucinate APIs? And How to Fix It](https://docs.bswen.com/blog/2026-03-22-claude-code-api-hallucination-fix/)
- [Reduce hallucinations - Claude API Docs](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
- [Building a Self-Awareness System for AI: Reducing Hallucinations in Claude](https://medium.com/@mukilankarthikeyan/building-a-self-awareness-system-for-ai-reducing-hallucinations-in-claude-1e44869cea56)
- [199-biotechnologies/claude-deep-research-skill (verification pipeline)](https://github.com/199-biotechnologies/claude-deep-research-skill)

### Workarounds for a Deep Research Skill
1. **Require URL sources for every factual claim.** The skill should mandate that every finding includes the URL where it was verified.
2. **Cross-verify critical claims across multiple independent sources.** Don't accept single-source findings for important data points.
3. **Use an independent verification sub-agent** that re-checks key claims without access to the original research context, preventing confirmation bias.
4. **Include explicit "uncertainty markers"** in the research output. When a finding couldn't be verified from multiple sources, mark it as [UNVERIFIED] or [SINGLE-SOURCE].
5. **Implement a citation validation step** that attempts to re-fetch each cited URL and confirms the claim actually appears on that page.
6. **Structure research as "claim + evidence" pairs** rather than narrative text, making it easier to audit what's verified vs. assumed.
7. **Add loop-breaking instructions:** "If an approach fails twice, try a fundamentally different strategy. Do not retry the same approach more than 2 times."

---

## 10. Tool Result Context Pollution

### The Problem
- When Claude analyzes large files or fetches large web pages, the entire content enters its context window even though only a summary is needed.
- Intermediate results from multi-step research accumulate in context regardless of relevance.
- These intermediate results consume massive token budgets and push important information (like earlier research findings and instructions) out of context.
- This directly conflicts with the context compaction problem -- intermediate tool results fill up the window faster, triggering compaction sooner.

### Sources
- [Introducing advanced tool use on the Claude Developer platform](https://www.anthropic.com/engineering/advanced-tool-use)
- [Tracing Claude Code's LLM Traffic: Agentic loop, sub-agents, tool use, prompts](https://medium.com/@georgesung/tracing-claude-codes-llm-traffic-agentic-loop-sub-agents-tool-use-prompts-7796941806f5)

### Workarounds for a Deep Research Skill
1. **Delegate data-heavy fetching to sub-agents.** Sub-agents have their own context windows, so large fetch results don't pollute the orchestrator's context.
2. **Have sub-agents summarize before returning.** Instruct sub-agents to "return only the key findings in 500 words or less" rather than raw data.
3. **Use targeted WebFetch prompts** that extract specific data points rather than entire pages.
4. **Write intermediate results to disk and read summaries** rather than keeping everything in memory.
5. **Prioritize searches early in the session** when the context window is fresh, and do synthesis/writing later.

---

## 11. `disable-model-invocation` Skill Configuration Bugs

### The Problem
Five documented bugs with the `disable-model-invocation: true` frontmatter setting:
1. **Autocomplete but non-functional:** Skills appear in autocomplete when users type `/`, but fail with an error when selected.
2. **Blocks manual user invocation:** Claude refuses to invoke the skill even when the user explicitly types the slash command. It interprets the setting as "I cannot use the Skill tool at all" rather than "don't auto-trigger without user request."
3. **Session resume bypass:** When resuming a session with `--resume`, skills with `disable-model-invocation: true` can be invoked by the model, breaking the protection.
4. **Plugin skills unsupported:** Plugin-defined skills lack `disable-model-invocation` support entirely, forcing all plugin skills into context.
5. **Documentation confusion:** The distinction between `user-invocable` and `disable-model-invocation` is unclear, leading to misconfiguration.

### Sources
- [Skills with disable-model-invocation: true fail when invoked - Issue #24042](https://github.com/anthropics/claude-code/issues/24042)
- [Skill with disable-model-invocation: true cannot be invoked by user - Issue #26251](https://github.com/anthropics/claude-code/issues/26251)
- [disable-model-invocation: true not applied when resuming - Issue #20816](https://github.com/anthropics/claude-code/issues/20816)
- [Plugin skills don't support disable-model-invocation - Issue #22345](https://github.com/anthropics/claude-code/issues/22345)
- [Clarify user-invocable vs disable-model-invocation docs - Issue #19141](https://github.com/anthropics/claude-code/issues/19141)

### Workarounds for a Deep Research Skill
1. **Don't use `disable-model-invocation` for the deep research skill.** It's too buggy. Instead, rely on specific description triggers for auto-activation.
2. **If you need manual-only activation,** use a UserPromptSubmit hook to control when the skill runs, rather than the broken frontmatter setting.
3. **Test skill invocation after session resume** to ensure settings are still applied.

---

## 12. Rate Limits and Token Consumption

### The Problem
- Claude Code has per-plan rate limits that affect research-heavy workflows.
- Extended research sessions consume large numbers of tokens, especially when multiple WebSearch/WebFetch calls are made.
- Token consumption can spike unexpectedly due to bugs in certain versions.
- Compaction itself consumes tokens from the budget.

### Sources
- [Claude Code Rate Limits 2026: Every Plan Explained](https://maxtechera.dev/en/blog/claude-code-rate-limits-2026)
- [Claude devs complain about surprise usage limits](https://www.theregister.com/2026/01/05/claude_devs_usage_limits/)

### Workarounds for a Deep Research Skill
1. **Batch searches efficiently.** Plan all search queries upfront rather than discovering them one at a time.
2. **Cache results aggressively.** WebFetch has a 15-minute cache -- reuse URLs within that window instead of re-fetching.
3. **Use targeted WebFetch prompts** to minimize the need for follow-up fetches of the same URL.
4. **Monitor token usage** and prioritize remaining research tasks if approaching limits.

---

## Summary: Critical Design Principles for a Deep Research Skill

Based on all 12 documented platform constraints, a well-designed deep research skill must incorporate these defensive design principles:

### Tier 1: Non-Negotiable (Ignoring these causes data loss or skill failure)

| Principle | Addresses | Severity |
|-----------|-----------|----------|
| Write findings to disk after every step -- NEVER accumulate in memory | Context compaction memory loss (#1) | Critical |
| Use explicit Write tool in ALL sub-agent prompts (not default output) | Background agent output loss (#7) | Critical |
| Save sub-agent outputs to project files immediately after completion | Sub-agent files deleted by compaction (#1) | Critical |
| Include a "Current State / Progress" header in the research file | Post-compaction recovery (#1) | Critical |
| Cap parallel background agents at 3 concurrent | Session freeze risk (#7), sub-agent overhead (#4) | Critical |
| Require URL source for every factual claim | Hallucination (#9) | Critical |

### Tier 2: Strongly Recommended (Ignoring these degrades quality significantly)

| Principle | Addresses | Severity |
|-----------|-----------|----------|
| Structure skill as explicit gated phases (Plan > Research > Synthesize) | Research-first violations (#6), instruction ignoring (#4) | High |
| Use hooks (UserPromptSubmit) for reliable skill activation | 50% auto-activation failure rate (#2) | High |
| Use browser automation (MCP) as fallback for WebFetch 403s | Site blocking, 403 errors (#3) | High |
| Ask targeted, specific questions in WebFetch prompts | Content summarization/truncation (#3) | High |
| Delegate data-heavy fetching to sub-agents | Context pollution (#10) | High |
| Cross-verify critical claims from 2+ independent sources | Hallucination, single-source risk (#9) | High |
| Add redundant critical instructions (repeat 2-3 times minimum) | Instruction-ignoring bug (#4, #6) | High |
| Batch search queries upfront, execute in concentrated bursts | Permission fatigue (#8), rate limits (#12) | High |

### Tier 3: Best Practices (Improves reliability and UX)

| Principle | Addresses | Severity |
|-----------|-----------|----------|
| Use non-descriptive sub-agent names (worker-1, task-alpha) | Name inference override bug (#4) | Medium |
| Keep skill description under 200 chars, front-load trigger words | Character budget (#5), activation (#2) | Medium |
| Don't use `disable-model-invocation` -- too buggy | 5 documented bugs (#11) | Medium |
| Pre-approve WebSearch in settings.json and restart | Approval fatigue (#8) | Medium |
| Maintain a blocked-sites list (B&H, Cloudflare-heavy) | Wasted tokens on failed fetches (#3) | Medium |
| Mark unverified claims as [UNVERIFIED] or [SINGLE-SOURCE] | Verification transparency (#9) | Medium |
| Use loop-breaking instructions (max 2 retries, then try alternative) | Infinite retry loops (#9) | Medium |
| Keep individual sub-tasks small (under 15 tool calls each) | Compaction trigger threshold (#1) | Medium |

---

## Appendix: GitHub Issues Index

All referenced GitHub issues for the `anthropics/claude-code` repository:

| Issue # | Title | Status | Constraint |
|---------|-------|--------|------------|
| [#1534](https://github.com/anthropics/claude-code/issues/1534) | Memory Loss After Auto-compact | -- | Compaction |
| [#4878](https://github.com/anthropics/claude-code/issues/4878) | Persistent Context Compaction Preventing Workflow Completion | -- | Compaction |
| [#8331](https://github.com/anthropics/claude-code/issues/8331) | WebFetch unable to access external documentation sites | -- | WebFetch |
| [#10628](https://github.com/anthropics/claude-code/issues/10628) | Claude hallucinated fake user input mid-response | -- | Hallucination |
| [#10960](https://github.com/anthropics/claude-code/issues/10960) | After compaction, Claude loses context about repository path changes | -- | Compaction |
| [#11799](https://github.com/anthropics/claude-code/issues/11799) | Auto-approve WebSearch tool without prompts | -- | Permissions |
| [#11812](https://github.com/anthropics/claude-code/issues/11812) | WebFetch/WebSearch in permissions.deny breaks plugin loading | -- | Permissions |
| [#15719](https://github.com/anthropics/claude-code/issues/15719) | Configurable Context Window Compaction Threshold | -- | Compaction |
| [#17011](https://github.com/anthropics/claude-code/issues/17011) | run_in_background=true silently loses all output | Closed | Background agents |
| [#17540](https://github.com/anthropics/claude-code/issues/17540) | Session freezes with multiple background agents | -- | Background agents |
| [#19141](https://github.com/anthropics/claude-code/issues/19141) | Clarify user-invocable vs disable-model-invocation | -- | Skills config |
| [#19739](https://github.com/anthropics/claude-code/issues/19739) | Claude Code Agent Systematic Failure Patterns | -- | Sub-agents |
| [#20236](https://github.com/anthropics/claude-code/issues/20236) | TaskOutput hangs after background agent completes | -- | Background agents |
| [#20816](https://github.com/anthropics/claude-code/issues/20816) | disable-model-invocation not applied when resuming | -- | Skills config |
| [#21091](https://github.com/anthropics/claude-code/issues/21091) | WebSearch blocked despite permissionless mode | -- | Permissions |
| [#21318](https://github.com/anthropics/claude-code/issues/21318) | Plugin agents lack access to WebSearch and WebFetch | -- | Permissions |
| [#21431](https://github.com/anthropics/claude-code/issues/21431) | Massive quality regression | -- | Quality |
| [#22345](https://github.com/anthropics/claude-code/issues/22345) | Plugin skills don't support disable-model-invocation | -- | Skills config |
| [#22846](https://github.com/anthropics/claude-code/issues/22846) | WebFetch returns 403 on Wikipedia and other sites | -- | WebFetch |
| [#23707](https://github.com/anthropics/claude-code/issues/23707) | Background Task agents fail on Claude Code Web | -- | Background agents |
| [#23751](https://github.com/anthropics/claude-code/issues/23751) | Compaction fails at 48% context usage (Opus 4.6) | -- | Compaction |
| [#23821](https://github.com/anthropics/claude-code/issues/23821) | Subagent output files lost after context compaction | Closed | Compaction |
| [#24042](https://github.com/anthropics/claude-code/issues/24042) | Skills with disable-model-invocation fail when invoked | -- | Skills config |
| [#25966](https://github.com/anthropics/claude-code/issues/25966) | Allow permanent auto-approval of read-only MCP tools | -- | Permissions |
| [#26251](https://github.com/anthropics/claude-code/issues/26251) | Skill with disable-model-invocation cannot be invoked by user | -- | Skills config |
| [#26317](https://github.com/anthropics/claude-code/issues/26317) | Compaction fails with 'Conversation too long' | -- | Compaction |
| [#26530](https://github.com/anthropics/claude-code/issues/26530) | Allow wildcard permissions for WebSearch tool | -- | Permissions |
| [#27862](https://github.com/anthropics/claude-code/issues/27862) | WebSearch permission cannot be persistently allowed | -- | Permissions |
| [#28868](https://github.com/anthropics/claude-code/issues/28868) | Claude ignores instructions to stop and research before acting | Open | Research quality |
| [#28984](https://github.com/anthropics/claude-code/issues/28984) | Increase effective context window / reduce compaction overhead | -- | Compaction |
| [#31420](https://github.com/anthropics/claude-code/issues/31420) | Auto-backup Task outputs before context compaction | -- | Compaction |
| [#32062](https://github.com/anthropics/claude-code/issues/32062) | Auto-save session state before compaction | -- | Compaction |
| [#32161](https://github.com/anthropics/claude-code/issues/32161) | Claude ignores CLAUDE.md knowledge retrieval rules | -- | Instruction following |
| [#34832](https://github.com/anthropics/claude-code/issues/34832) | MCP connectors lose auth after context compaction | -- | Compaction |
| [#35296](https://github.com/anthropics/claude-code/issues/35296) | 1M Context Window does not work as marketed | -- | Compaction |

---

*Research compiled from Claude Code documentation, 35 GitHub issues, community blog posts, and third-party testing (650+ trials on skill activation). All sources linked inline. Last updated 2026-03-22.*
