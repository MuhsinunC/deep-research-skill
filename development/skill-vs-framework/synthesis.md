# Skill vs Framework for Deep Research: Which Is Better?

**Date:** 2026-03-23
**Mode:** Standard (7 phases)
**Status:** Complete — both sub-agents finished before synthesis. Devil's advocate search performed.

---

## Executive Summary

After comparing SKILL.md prompt-based approaches against external deep research frameworks (GPT Researcher, LangChain ODR, etc.) across 8 dimensions, the verdict is: **stick with the skill, but augment with targeted MCP servers for specific weaknesses.** The core finding is that frameworks and skills produce **identical research quality** because quality depends on the underlying LLM, which is the same in both cases. Frameworks excel at infrastructure concerns (error handling, state management, rate limiting) but add dependency complexity, token overhead, and maintenance burden. For your use case (accuracy-first research on diverse topics), the skill approach with selective MCP augmentation is the stronger choice.

---

## The Head-to-Head Comparison

| Dimension | SKILL.md | External Framework | Winner |
|-----------|----------|-------------------|--------|
| **Research quality** | Depends on Claude's capability | Depends on LLM's capability | **Tie** — same LLM, same quality ceiling |
| **Accuracy** | Tool-grounded verification via native tools | Tool-grounded verification via framework tools | **Tie** — both use the same verification approach |
| **Consistency** | ~50% auto-activation rate; ~30% output inconsistency | Deterministic code execution; typed state | **Framework** — code is more consistent than prompts |
| **Cost** | 100 tokens idle; native prompt caching (92-97% prefix reuse, 81% cost reduction) | 7-50K+ tokens per MCP server; external API costs | **Skill** — dramatically cheaper |
| **Context usage** | Progressive disclosure, loaded on demand | Persistent tool definitions consume context | **Skill** — much more context-efficient |
| **Error handling** | Advisory instructions (LLM may skip) | Typed exceptions, retry/backoff, circuit breakers | **Framework** — code-level reliability |
| **Maintenance** | Edit a markdown file | Manage dependencies, versions, Docker, API keys | **Skill** — zero dependencies |
| **Flexibility** | Works with any Claude Code tools natively | Locked to framework's supported tools/providers | **Skill** — more flexible |

**Score: Skill 4, Framework 2, Tie 2**

---

## The Critical Insight: Research Quality Is LLM-Bounded

The most important finding from both research agents:

> "Frameworks do NOT improve research quality, source credibility assessment, report writing quality, or hallucination prevention. These all depend on LLM capability, which is identical in both approaches." [1]

LangChain's Open Deep Research is itself prompt-based — no fine-tuned model. Its "framework" is a structured multi-agent architecture with prompts, which is exactly what our skill does. GPT Researcher uses the same underlying approach: prompts orchestrate tool calls.

**The value of a framework is in infrastructure, not intelligence.** A framework handles retries, rate limits, state persistence, and typed errors better than prompt instructions can. But it doesn't make the LLM smarter or more accurate.

**Sources:**
- [1] Agent1 research: `agent1-framework-advantages.md`
- [2] [Open Deep Research (LangChain blog)](https://blog.langchain.com/open-deep-research/)

---

## Where Frameworks Genuinely Win

### 1. Deterministic Error Handling
Frameworks use typed exceptions with Tenacity retry/backoff and circuit breakers. A SKILL.md can say "if WebFetch returns 403, try an alternative URL" but the LLM may not correctly identify all failure modes, especially silent errors (timeouts that return empty results, rate limit responses disguised as valid data). [3]

### 2. State Management
LangGraph's Pydantic schemas with reducer functions and subgraph output isolation provide type-safe state. Our skill uses JSON checkpoints and markdown files — functional but not validated. [3]

### 3. Rate Limiting
Code can track request counts and enforce token bucket algorithms. The LLM has no rate counter, no timer, and cannot throttle its own tool calls. This matters for high-volume research that hits API limits. [3]

**Source:** [3] Agent1 research: `agent1-framework-advantages.md`

---

## Where Skills Genuinely Win

### 1. Cost Efficiency
A skill costs ~100 tokens when idle (just the description loaded for matching). An MCP server costs 1,500-3,500 tokens per message even when not being used. Claude Code's native prompt caching provides 92-97% prefix reuse with 81% cost reduction — something external frameworks can't leverage as effectively. [4]

### 2. Zero Dependencies
A skill is a markdown file. No Python, no Node.js, no Docker, no API keys, no version conflicts. GPT Researcher requires Python 3.11+, OpenAI API key, Tavily API key, and optionally Docker. LangChain ODR requires LangGraph, multiple provider SDKs, and environment configuration. [4]

### 3. Native Tool Access
Skills have direct access to all 18+ Claude Code tools (WebSearch, WebFetch, Agent, Read, Write, Bash, etc.) without integration layers. Frameworks must re-implement tool access through their own abstractions. [4]

### 4. Sub-Agent Orchestration
Claude Code's native Agent tool provides parallel sub-agent spawning that frameworks like LangChain have to build through LangGraph's task decomposition. Our skill already uses this for parallel retrieval and gap-filling. [4]

**Source:** [4] Agent2 research: `agent2-skill-advantages.md`

---

## The Consistency Problem (Devil's Advocate)

The devil's advocate search revealed a real weakness of skills:

- Skills have ~50% auto-activation rate in testing (650 trials) [5]
- Claude Code exhibits ~30% output inconsistency [6]
- Claude "actively resists doing thorough work, presents shallow analysis as complete" (documented bug) [7]

These are **real problems** that frameworks partially solve through deterministic code execution. However:
- Auto-activation is a platform bug, not a skill design problem — it affects ALL skills equally
- Output inconsistency is an LLM behavior problem — it affects framework-based approaches too (the LLM generates the same quality output regardless of who calls it)
- The "shallow work" bug is a Claude Code regression, not a skill vs framework issue

**Sources:**
- [5] [How to Make Claude Code Skills Actually Activate (Medium)](https://medium.com/@ivan.seleznov1/why-claude-code-skills-dont-activate-and-how-to-fix-it-86f679409af1)
- [6] [Quality degradation (GitHub #17900)](https://github.com/anthropics/claude-code/issues/17900)
- [7] [Claude resists re-analysis (GitHub #36241)](https://github.com/anthropics/claude-code/issues/36241)

---

## The Hybrid Approach: Best of Both Worlds

The practitioner consensus from our research:

> "Start with skills, add MCP incrementally, and graduate to production frameworks only when serving specific domains at scale." [4]

**What this looks like for us:**

1. **Keep the SKILL.md** as the orchestration brain — it defines the research methodology, phases, verification protocols, and quality standards
2. **Add targeted MCP servers** for the specific things skills can't do well:
   - **Brave Search MCP** or **Exa MCP** — better search than built-in WebSearch (if budget allows)
   - **Semantic Scholar MCP** — citation chain following for academic research
   - **Context7 MCP** — up-to-date library documentation for technical research
3. **Don't add a full framework** — the overhead, dependency management, and token cost aren't justified for the marginal improvement in error handling
4. **If we ever need framework-level reliability** (serving research at scale, production API), THEN consider wrapping the skill's methodology in a LangGraph pipeline

---

## Recommendation

**For your use case:** Keep the skill. Here's why:

1. **You prioritize accuracy over speed** — accuracy is LLM-bounded, and the skill uses the same LLM as any framework would
2. **You use diverse research topics** — the skill's flexibility (any Claude Code tool, any sub-agent configuration) beats frameworks locked to specific providers
3. **You already have strong verification** — our Phase 7.5 VERIFY with tool-grounded Decompose-Retrieve-Verify is more rigorous than what most frameworks offer
4. **Cost matters** — skills are dramatically cheaper per session than framework+MCP stacks
5. **Maintenance matters** — you can edit a markdown file; you don't want to maintain a Python/Node.js dependency tree

**What to add incrementally (optional, when budget allows):**
- Brave Search MCP ($3-5/1K requests) for better search quality than built-in WebSearch
- Context7 MCP (free) for up-to-date library documentation

**When to reconsider:** If you start running research at production scale (automated pipelines, API-served research), the framework's error handling, rate limiting, and typed state management become worth the overhead. That's a different use case than interactive research in Claude Code.

---

## Limitations

- Both sub-agents completed before synthesis (completion gate honored)
- Devil's advocate search performed on skill consistency (found real weaknesses)
- Framework benchmarks are limited — most frameworks don't publish accuracy scores
- The "same LLM, same quality" argument assumes the skill's methodology is as good as the framework's methodology, which is an assumption we've been improving but haven't externally benchmarked
- Cost comparisons are approximate and depend on usage patterns

## Sources

- [Open Deep Research (LangChain blog)](https://blog.langchain.com/open-deep-research/)
- [Open Deep Research Internals (bolshchikov.com)](https://www.bolshchikov.com/p/open-deep-research-internals-a-step)
- [MCP Server Token Costs (jdhodges.com)](https://www.jdhodges.com/blog/claude-code-mcp-server-token-costs/)
- [Hidden Cost of MCP Servers (mariogiancini.com)](https://mariogiancini.com/the-hidden-cost-of-mcp-servers-and-when-theyre-worth-it)
- [The SKILL.md Pattern (Medium)](https://bibek-poudel.medium.com/the-skill-md-pattern-how-to-write-ai-agent-skills-that-actually-work-72a3169dd7ee)
- [skill.md: An open standard (Mintlify)](https://www.mintlify.com/blog/skill-md)
- [How to Make Skills Activate (Medium)](https://medium.com/@ivan.seleznov1/why-claude-code-skills-dont-activate-and-how-to-fix-it-86f679409af1)
- [How to Make Skills Activate Reliably (scottspence.com)](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably)
- [Claude Code quality degradation (GitHub #17900)](https://github.com/anthropics/claude-code/issues/17900)
- [Claude resists re-analysis (GitHub #36241)](https://github.com/anthropics/claude-code/issues/36241)
- [Agent Skills Overview (Anthropic)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [GPT Researcher (GitHub)](https://github.com/assafelovic/gpt-researcher)
- [LangChain Open Deep Research (GitHub)](https://github.com/langchain-ai/open_deep_research)
