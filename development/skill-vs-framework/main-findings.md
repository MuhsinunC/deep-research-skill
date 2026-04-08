# Skill vs Framework: Main Search Findings

## Search 1: External Framework Accuracy

Sources:
- [How Accurate Is ChatGPT? (Chatbase)](https://www.chatbase.co/blog/is-chatgpt-accurate)
- [FrontierScience evaluation (OpenAI)](https://openai.com/index/frontierscience/)

Key findings:
- GPT-5 scores 87% on MMLU Pro, but only 25% on open-ended Research tasks
- Only ~14% of AI-generated citations link to real, verifiable sources
- 45% fewer factual mistakes than GPT-4o, but still significant error rate
- Specialized topics have higher error rates than general knowledge

**Implication:** External frameworks using GPT as backbone don't magically solve accuracy — they're constrained by the underlying model's limitations. A SKILL.md using Claude Opus 4.6 may have comparable or better base accuracy.

## Search 2: SKILL.md as an Open Standard

Sources:
- [Agent Skills Overview (Anthropic)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [The SKILL.md Pattern (Medium)](https://bibek-poudel.medium.com/the-skill-md-pattern-how-to-write-ai-agent-skills-that-actually-work-72a3169dd7ee)
- [skill.md: An open standard (Mintlify)](https://www.mintlify.com/blog/skill-md)

Key findings:
- Skills are loaded on-demand, unloaded when done — efficient context usage
- Skills orchestrate multiple tool calls as part of a workflow — higher abstraction than raw tool use
- Portable artifacts that live outside code — shareable, versionable, reviewable
- Adopted by both Anthropic (Claude Code) and OpenAI (Codex CLI)
- 1,234+ skills cataloged by March 2026

**Implication:** SKILL.md is a mature, well-adopted standard with native platform support.

## Search 3: MCP Token Cost / Context Consumption

Sources:
- [MCP Server Token Costs (jdhodges.com)](https://www.jdhodges.com/blog/claude-code-mcp-server-token-costs/)
- [Hidden Cost of MCP Servers (mariogiancini.com)](https://mariogiancini.com/the-hidden-cost-of-mcp-servers-and-when-theyre-worth-it)
- [Optimising MCP Context Usage (scottspence.com)](https://scottspence.com/posts/optimising-mcp-server-context-usage-in-claude-code)

Key findings:
- Every MCP server costs tokens on every message, even when idle (~7K tokens for 4-server setup)
- Heavy setups (5+ servers) can burn 50K+ tokens before first prompt
- MCP Tool Search (Jan 2026) reduces startup cost by up to 95% via on-demand loading
- CLI tools are more context-efficient than MCP servers (no persistent tool definitions)

**Implication:** An external framework via MCP has ongoing token overhead. A SKILL.md has zero token overhead when not active (loaded on demand). But MCP Tool Search mitigates this significantly.

## Search 4: LangChain ODR Architecture & Reliability

Sources:
- [Open Deep Research (LangChain blog)](https://blog.langchain.com/open-deep-research/)
- [Open Deep Research Internals (bolshchikov.com)](https://www.bolshchikov.com/p/open-deep-research-internals-a-step)
- [Deep Agents (LangChain blog)](https://blog.langchain.com/deep-agents/)

Key findings:
- LangChain ODR is ALSO prompt-based (no fine-tuned model) — just with a structured multi-agent architecture
- Context isolation of sub-topics avoids long-context failure modes
- Ranked #6 on Deep Research Bench (score 0.4344)
- Key insight: "Most of the best coding or deep research agents have pretty complex system prompts" — the value is in the architecture, not the framework itself
- LangChain's advantage: planning tool + sub-agents + filesystem + detailed prompt

**Implication:** LangChain ODR's "framework" is essentially what our skill already does — prompt-based orchestration with sub-agents and file persistence. The framework adds infrastructure (LangGraph, state machines) but the core research logic is prompts.
