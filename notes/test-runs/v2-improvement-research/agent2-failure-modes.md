# Deep Research Skill Failure Modes & Fixes

> Research conducted 2026-03-22. Prioritized primary sources (Anthropic docs, GitHub issues, peer research repos) over SEO content.

---

## 1. Top Reasons Deep Research Skills Produce Inaccurate Results

### 1.1 Belief Perseverance / Anchoring Bias
- Claude Code exhibits **anchoring bias**: once it forms an initial conclusion, it tends to maintain that conclusion even when presented with contradictory evidence.
- Documented example: Claude Code kept insisting test failures were "unrelated" even after empirical evidence showed they were connected. This is a form of **belief perseverance** -- the tendency to maintain initial conclusions despite contradictory evidence.
- Source: [Why Claude Code kept saying "The Test Failures Are Unrelated"](https://medium.com/@karishmababu/why-claude-code-kept-saying-the-test-failures-are-unrelated-742cc73bf76f) (Jan 2026)

### 1.2 Authority Bias in Source Evaluation
- When content is written in an authoritative tone, Claude fails to detect factual errors -- even when explicitly asked to find them.
- In one test, Claude failed to detect a single actual error in a flawed paper because the draft was "too well-written in too authoritative a manner."
- Anthropic's own multi-agent research team discovered agents **"consistently chose SEO-optimized content farms over authoritative sources like academic PDFs."** This was corrected by embedding source quality heuristics into prompts.
- Source: [Can Claude spot a fundamentally flawed paper?](https://medium.com/@janedoe314/can-claude-spot-a-fundamentally-flawed-paper-7e138de7e52b) (Feb 2026)
- Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) (Anthropic)

### 1.3 Inconsistent Output Quality (~30% Failure Rate)
- Approximately 70% of the time Claude Code produces correct results; the other 30% the output is "inconsistent, off-format, or just wrong in ways that are hard to pin down."
- This is not a binary works/doesn't-work -- it is a stochastic quality problem that makes research unreliable without verification loops.
- Source: [Claude Code Skills: The One Feature That Finally Stopped Me From Repeating Myself](https://medium.com/write-a-catalyst/claude-code-skills-the-one-feature-that-finally-stopped-me-from-repeating-myself-7189df272b1f) (Mar 2026)

### 1.4 Quality Regression (Jan 2026)
- Users reported a significant quality regression starting around January 26, 2026.
- Symptoms: Claude Code started "making multiple broken attempts instead of thinking through problems" and "started to think much less."
- Source: [Massive quality regression - Issue #21431](https://github.com/anthropics/claude-code/issues/21431)

### 1.5 Skill Activation Is Probabilistic, Not Deterministic
- Skills sit in a list that Claude sees in its system prompt. When a request arrives, the model decides whether to consult a skill by pattern-matching words against the skill's description. **There is no guarantee a skill fires.**
- Claude sometimes reads a skill description, decides it already understands what the skill does, and **never opens the SKILL.md file** -- instead improvising based on the description alone.
- A hallucinated `CLAUDE_CODE_MAX_SKILLS` environment variable has been circulating online -- it does not exist, but keeps getting copied into skill configs.
- Source: [The Invisible Limitations of Claude Code Skills](https://medium.com/@cheparsky/ai-in-testing-9-the-invisible-limitations-of-claude-code-skills-you-didnt-know-f3adbdcf3680)

### 1.6 Context Window Degradation Before Hitting the Limit
- Quality degrades at **250k-500k tokens** despite the 1M capacity. The degradation manifests as the "Actually... Actually..." pattern -- Claude starts second-guessing itself.
- After compaction, Claude retains roughly **20-30% of original detail**. Summaries focus on "what happened" and lose "why" and subtle details.
- If the model is already confused before compaction, the summarized context preserves and compresses that confusion.
- Source: [Claude Code Context Buffer: The 33K-45K Token Problem](https://claudefa.st/blog/guide/mechanics/context-buffer-management)
- Source: [Why Claude Loses Context After Compaction](https://docs.bswen.com/blog/2026-02-09-claude-context-loss-compaction/)

### 1.7 WebFetch Intermediate Model Hallucination
- WebFetch does NOT return raw page content. It uses a **separate, smaller model** to answer a question about the fetched content.
- This is a hallucination vector: the extraction model may provide inaccurate answers about the page content, and the main model treats those answers as ground truth.
- Source: [Inside Claude Code's Web Tools: WebFetch vs WebSearch](https://mikhail.io/2025/10/claude-code-web-tools/)

---

## 2. Claude Code Platform Bugs Affecting Research Quality (as of March 2026)

### 2.1 WebFetch 403 Errors on Major Sites
- WebFetch returns HTTP 403 on Wikipedia and other major sites, even though preflight checks succeed and direct curl access returns 200.
- This means research skills silently fail to retrieve content from key reference sources.
- Source: [BUG: WebFetch returns 403 on Wikipedia - Issue #22846](https://github.com/anthropics/claude-code/issues/22846) (Feb 2026)

### 2.2 WebFetch Tool Permission Bypass
- When users select "No" to deny WebFetch permission, the tool executes anyway and returns results that Claude then uses.
- Source: [BUG: Tool permission denial not enforced - Issue #35544](https://github.com/anthropics/claude-code/issues/35544)

### 2.3 WebFetch Hangs / Freezes (No Timeout)
- WebFetch enters a "Fetching..." state and never returns -- no timeout, no error. Users report waiting over an hour.
- This causes complete research task stalls with no way to interrupt besides exiting and losing all context.
- Source: [BUG: WebFetch freezes Claude Code - Issue #11650](https://github.com/anthropics/claude-code/issues/11650)
- Source: [BUG: WebFetch tool hangs when site not accessible - Issue #8980](https://github.com/anthropics/claude-code/issues/8980)

### 2.4 WebFetch Fails in Cloud/Remote Environments
- WebFetch does not work reliably in cloud-hosted Claude Code instances.
- Source: [BUG: WebFetch not working in cloud version - Issue #13718](https://github.com/anthropics/claude-code/issues/13718)

### 2.5 Sub-Agent Auto-Selection Unreliable
- Auto-selection of custom agents remains unreliable. Claude frequently handles tasks in the main session rather than delegating to a defined agent, even when the agent description matches the task.
- The only reliable trigger is **explicit invocation** (@-mention or natural language naming).
- Source: [Fix Common Claude Code Sub-Agent Setup Problems](https://www.arsturn.com/blog/fixing-common-claude-code-sub-agent-problems)

### 2.6 Opus Over-Spawns Sub-Agents
- Claude Opus 4.6 has a known tendency to over-spawn subagents. Anthropic's own prompt engineering documentation flags that Opus will delegate to agents in situations where a direct approach would be faster and cheaper.
- Source: [Everything Claude Code: Inside the 82K-Star Agent Harness](https://medium.com/@tentenco/everything-claude-code-inside-the-82k-star-agent-harness-thats-dividing-the-developer-community-4fe54feccbc1) (Mar 2026)

### 2.7 Context Compaction Loses Tool Schemas
- Deferred tools lose their input schemas after conversation compaction, causing array and number parameters to be rejected with type errors. This was recently patched.
- Token estimation over-counted for thinking and tool_use blocks, causing **premature** context compaction. Also recently patched.
- Source: [Claude Code Release Notes - March 2026](https://releasebot.io/updates/anthropic/claude-code)

### 2.8 1M Context Doesn't Deliver Advertised Performance
- Multiple users report that the 1M context window does not work as marketed. Quality degrades well before the limit.
- Source: [BUG: Claude 1M Context Window Does Not Work as Marketed - Issue #35296](https://github.com/anthropics/claude-code/issues/35296)

### 2.9 Out-of-Memory Crashes with Heavy Sub-Agent Usage
- Fixed in v2.1.17: out-of-memory crashes when resuming sessions with heavy subagent usage.
- Fixed in v2.1.19: processes hanging when terminal closes; now catches EIO errors with SIGKILL fallback.
- Source: [Claude Code Release Notes](https://releasebot.io/updates/anthropic/claude-code)

---

## 3. Community-Discovered Workarounds That Improve Research Reliability

### 3.1 Save-to-Disk Incrementally (Never Accumulate in Memory)
- The single most important pattern: **write findings to a file after every major search**, not at the end.
- Context compaction retains only 20-30% of detail. If findings exist only in conversation history, they will be lost or degraded.
- Disk-persisted artifacts (JSON, markdown) survive compaction and agent handoffs.
- Source: [199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill) -- uses `sources.json` that "survives context compaction and continuation agents."

### 3.2 Proactive Manual Compaction at 60% Utilization
- Auto-compaction fires at ~95% capacity, but at that point the model is already in a degraded state.
- **Intervene at 60% context utilization.** The model still has clear recall, producing better summaries.
- If past 40,000 tokens and quality drops, reset the session entirely.
- Source: [Claude Code Context Management Guide](https://www.sitepoint.com/claude-code-context-management/)

### 3.3 Validation Loops (Validate -> Fix -> Retry, Max 3 Cycles)
- Multiple community research skills implement structured validation:
  - **Citation verification**: Run DOI/URL/hallucination detection scripts before finalizing.
  - **9-check validators**: Enforce structural correctness (bibliography completeness, citation format, word counts).
  - **Critique loop-back**: If critical gaps found during validation, return to the retrieval phase with delta-queries.
- Source: [199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill)

### 3.4 Human-in-the-Loop Checkpoints
- Most effective placement: **after outline generation, before deep investigation begins.**
- Users review and approve research structure before data collection starts.
- Additional checkpoint: after compilation, before report generation.
- Source: [Weizhena/Deep-Research-skills](https://github.com/Weizhena/Deep-Research-skills)

### 3.5 Multi-Provider Search Redundancy
- Use multiple search providers (Brave, Serper, Exa, Jina, Firecrawl) to reduce reliance on single-provider bias.
- Require minimum citation density: **10+ sources, 3+ per major claim.**
- Source: [199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill)

### 3.6 Structured Evidence Objects Instead of Prose
- Sub-agents should return structured JSON evidence objects (with source, quote, confidence) rather than prose summaries.
- This enforces fact-checkability at the point of collection, not after synthesis.
- Source: [199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill)

### 3.7 Direct Quote Extraction Before Analysis
- For tasks involving long documents (>20k tokens), extract word-for-word quotes first, then analyze.
- This grounds responses in actual text and drastically reduces hallucination.
- Have Claude verify each claim by finding a supporting quote after generating a response. If it cannot find one, **retract the claim**.
- Source: [Reduce hallucinations - Anthropic API Docs](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)

### 3.8 Explicit "I Don't Know" Permission
- Give Claude explicit permission to say "I don't know" or "I don't have enough information to confidently assess this."
- This simple technique drastically reduces false information.
- Source: [Reduce hallucinations - Anthropic API Docs](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)

### 3.9 Best-of-N Verification
- Run Claude through the same prompt multiple times and compare outputs. Inconsistencies across outputs indicate hallucinations.
- Source: [Reduce hallucinations - Anthropic API Docs](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)

### 3.10 Auto-Research / Self-Improving Skills
- Skills that evaluate and improve themselves through iterative testing cycles (modify -> verify -> keep/discard -> repeat).
- Source: [uditgoenka/autoresearch](https://github.com/uditgoenka/autoresearch)
- Source: [How to Make Your Claude Code Skills Self-Improving](https://medium.com/@shubhjain191/how-to-make-your-claude-code-skills-self-improving-using-auto-research-803ff97d5483) (Mar 2026)

### 3.11 Limit Skills to 20-30 High-Quality, Focused Skills
- Quality and focused scope matter more than number of skills installed.
- Keep SKILL.md body under 500 lines. Use progressive disclosure (reference files loaded on demand).
- Source: [Skill authoring best practices - Anthropic API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- Source: [Claude Code Skills Best Practices: Why 20-30 Beats 1,000](https://www.geeky-gadgets.com/claude-code-skills-best-practices/)

### 3.12 Test Skills Across All Target Models
- What works for Opus may need more detail for Haiku. Test with all models you plan to use.
- Write third-person descriptions (not "I can help you..." or "You can use this to...") to avoid discovery problems.
- Source: [Skill authoring best practices - Anthropic API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

---

## 4. Anthropic's Own Multi-Agent Patterns That Prevent Common Failures

### 4.1 Source Quality Heuristics in Prompts
- Anthropic discovered agents prefer SEO content farms over authoritative sources. They fixed this by embedding **source quality heuristics** directly into prompts -- teaching agents to prefer specialized tools and primary sources.
- Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

### 4.2 Artifact Storage Pattern (Prevent Information Loss)
- Rather than routing all outputs through the lead agent, **subagents call tools to store their work in external systems, then pass lightweight references back.**
- This prevents information loss during multi-stage processing and reduces token overhead.
- When context limits approach, agents spawn fresh subagents with clean contexts while maintaining continuity through careful handoffs.
- Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

### 4.3 Scaling Rules to Prevent Over-Spawning
- Simple queries need 1 agent; complex research needs 10+. These rules are embedded directly in prompts.
- Each subagent gets detailed task descriptions with: **objective, output format, tool guidance, and clear task boundaries** to prevent work duplication.
- Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

### 4.4 Parallel Tool Use (Up to 90% Time Reduction)
- Lead agent spins up 3-5 subagents in parallel; each subagent uses 3+ tools in parallel.
- Cut research time by up to 90%.
- Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

### 4.5 Dedicated Citation Agent
- A separate CitationAgent processes documents and research reports to identify specific locations for citations, ensuring all claims are properly attributed.
- Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

### 4.6 LLM-as-Judge Evaluation
- Uses a single LLM call outputting scores from 0.0-1.0 and a pass-fail grade against five criteria: **factual accuracy, citation accuracy, completeness, source quality, and tool efficiency.**
- Scales to hundreds of outputs while remaining "most consistent and aligned with human judgements."
- Human testing remains essential for catching SEO bias and edge cases automation misses.
- Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

### 4.7 Memory Persistence for Long Research
- Lead agent saves its plan to Memory when context window exceeds 200,000 tokens.
- Ensures plan retention across compaction boundaries.
- Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

### 4.8 Graceful Degradation on Tool Failure
- Rather than restarting failed processes, the system resumes from where the error occurred.
- Agents are informed of tool failures so they can adapt automatically, rather than cascading failures.
- Implements retry logic and regular checkpoints to combine AI adaptability with deterministic safeguards.
- Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

### 4.9 Rainbow Deployments
- Gradually shift traffic from old to new agent versions, keeping both running simultaneously.
- Prevents disruptions from updates affecting research quality.
- Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

### 4.10 Poka-Yoke Tool Design (From "Building Effective Agents")
- Structure tools to make mistakes harder (preventive design), rather than relying on error recovery.
- Use **absolute paths** over relative paths -- agents make mistakes with relative paths after changing directories.
- Choose output formats that match what models see in training data (markdown over JSON for prose).
- Source: [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)

### 4.11 Start Simple, Measure, Add Complexity Only When Needed
- "For many applications, optimizing single LLM calls with retrieval and in-context examples is usually enough."
- The most successful implementations use simple, composable patterns rather than complex frameworks.
- Abstraction layers in frameworks "create extra layers that can obscure underlying prompts and responses, making them harder to debug."
- Source: [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)

### 4.12 Environmental Feedback Loops
- Agents must obtain "ground truth from the environment at each step (such as tool call results or code execution) to assess its progress."
- Include stopping conditions (max iterations) to maintain control.
- Source: [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)

### 4.13 Prompt Tweaks Have Outsized Early Impact
- In early development, prompt tweaks can boost success rates from **30% to 80%**.
- Start with ~20 queries representing real usage to get clear visibility into change impacts.
- Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

### 4.14 Performance Metrics
- Multi-agent systems outperformed single-agent Claude Opus 4 by **90.2%** on internal research evaluations.
- Token usage explained **80% of the variance** in performance (per BrowseComp evaluation).
- Extended thinking improved instruction-following, reasoning, and efficiency.
- Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

---

## 5. Summary: Top Actionable Fixes for Deep Research Skills

| Failure Mode | Fix | Source |
|---|---|---|
| Hallucinated facts | Direct quote extraction + citation verification + explicit "I don't know" permission | Anthropic API Docs |
| SEO content farm bias | Source quality heuristics in prompts; prefer primary sources | Anthropic multi-agent system |
| Context window degradation | Proactive compaction at 60%; save to disk incrementally | Community best practices |
| WebFetch returning wrong content | Multi-provider redundancy; structured evidence objects | Community research skills |
| WebFetch 403/hang failures | Parallel redundancy across providers; timeout handling | GitHub Issues |
| Sub-agent information loss | Artifact storage pattern (disk, not memory); lightweight references | Anthropic multi-agent system |
| Anchoring bias | Validation loops (validate -> fix -> retry, max 3 cycles) | Community research skills |
| Skill not activating | Specific descriptions; third-person voice; explicit @-mention invocation | Anthropic skill docs |
| Over-spawning sub-agents | Scaling rules in prompts (1 for simple, 10+ for complex) | Anthropic multi-agent system |
| Compaction loses detail | Memory persistence for plans; JSON intermediate storage | Anthropic + community |

---

## Primary Sources Consulted

### Anthropic Official Documentation
- [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [Reduce hallucinations - API Docs](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
- [Skill authoring best practices - API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Web fetch tool - API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool)

### GitHub Issues (Claude Code Bugs)
- [#21431 - Massive quality regression](https://github.com/anthropics/claude-code/issues/21431)
- [#22846 - WebFetch returns 403 on Wikipedia](https://github.com/anthropics/claude-code/issues/22846)
- [#35544 - Tool permission denial not enforced](https://github.com/anthropics/claude-code/issues/35544)
- [#11650 - WebFetch freezes Claude Code](https://github.com/anthropics/claude-code/issues/11650)
- [#8980 - WebFetch hangs when site not accessible](https://github.com/anthropics/claude-code/issues/8980)
- [#13718 - WebFetch not working in cloud](https://github.com/anthropics/claude-code/issues/13718)
- [#35296 - 1M Context Window does not work as marketed](https://github.com/anthropics/claude-code/issues/35296)

### Community Deep Research Skill Implementations
- [199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill) -- 8-phase pipeline with source credibility scoring
- [Weizhena/Deep-Research-skills](https://github.com/Weizhena/Deep-Research-skills) -- Human-in-the-loop structured research
- [standardhuman/deep-research-skill](https://github.com/standardhuman/deep-research-skill) -- 7-phase with Graph of Thoughts
- [uditgoenka/autoresearch](https://github.com/uditgoenka/autoresearch) -- Self-improving skill framework

### Technical Analysis
- [Inside Claude Code's Web Tools: WebFetch vs WebSearch](https://mikhail.io/2025/10/claude-code-web-tools/)
- [Claude Code Context Buffer: The 33K-45K Token Problem](https://claudefa.st/blog/guide/mechanics/context-buffer-management)
- [Why Claude Code kept saying "The Test Failures Are Unrelated"](https://medium.com/@karishmababu/why-claude-code-kept-saying-the-test-failures-are-unrelated-742cc73bf76f)
- [Can Claude spot a fundamentally flawed paper?](https://medium.com/@janedoe314/can-claude-spot-a-fundamentally-flawed-paper-7e138de7e52b)
- [Claude Code Release Notes - March 2026](https://releasebot.io/updates/anthropic/claude-code)
