# Research Agent 4: Historical / Evolutionary Lens
## Topic: Agentic Coding Assistants — Development Timeline and Pivots (2021–2026)

**Research started:** 2026-04-07
**Lens:** Historical / Evolutionary

---

## SECTION 1: Founding Dates & Early Releases (T_a)

### GitHub Copilot
- **June 29, 2021**: Technical preview announced, VS Code only. Built on OpenAI Codex (code-specialized GPT-3). Developed in collaboration with OpenAI.
- **October 27–29, 2021**: Neovim plugin and JetBrains marketplace plugins released.
- **March 29, 2022**: Visual Studio 2022 support.
- **June 21, 2022**: General availability as a paid product ($10/month individual, $19/seat enterprise).
- Sources: [GitHub Blog - Introducing Copilot](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/), [TechCrunch preview coverage](https://techcrunch.com/2021/06/29/github-previews-new-ai-tool-that-makes-coding-suggestions/), [Wikipedia](https://en.wikipedia.org/wiki/GitHub_Copilot)

### OpenAI Codex (2021 model)
- **August 10, 2021**: OpenAI unveiled Codex as a code-specialized GPT-3 descendant. Trained on 159 GB of Python code from 54 million GitHub repositories.
- Powered GitHub Copilot from launch through early 2023.
- **March 2023**: OpenAI deprecated the original Codex API models. GitHub Copilot transitioned to GPT-4 (Copilot X announcement).
- Sources: [OpenAI Deprecations page](https://platform.openai.com/docs/deprecations), [Medium: Codex 2021 to 2025](https://medium.com/@aliazimidarmian/openai-codex-from-2021-code-model-to-a-2025-autonomous-coding-agent-85ef0c48730a)

### Cursor
- **Founded early 2022**: by four MIT friends — Michael Truell, Sualeh Asif, Arvid Lunnemark, and Aman Sanger. Founded months before ChatGPT's November 2022 debut.
- **Original positioning**: AI-powered code editor (VS Code fork) with the thesis that AI-powered coding tools shouldn't feel like autocomplete with extra steps.
- **2024**: Launched agentic capabilities — multi-file editing, repo-wide code understanding, agent mode.
- **October 2025**: Cursor 2.0 launched with first proprietary AI model ("Composer"), described as 4x faster than comparable models, designed for low-latency multi-step agentic coding.
- **April 2, 2026**: Cursor 3 launched with an "Agents Window" — interface rebuilt from scratch around orchestrating multiple AI agents.
- **Market milestone**: Fastest software product ever to reach $100M ARR (within 12 months); $2B ARR reported in early 2026; $29–30B valuation.
- Sources: [Contrary Research on Cursor](https://research.contrary.com/company/cursor), [Fortune - Cursor's crossroads](https://fortune.com/2026/03/21/cursor-ceo-michael-truell-ai-coding-claude-anthropic-venture-capital/), [We Are Founders](https://www.wearefounders.uk/cursor-founders-the-mit-team-behind-the-400-million-ai-code-editor-revolution/)

### Aider
- **2023 launch**: Created by Paul Gauthier (former CTO at Groupon, VP Engineering at Geomagical Labs / IKEA acquisition). Open-source CLI tool described as "GPT powered coding in your terminal."
- **Original positioning**: AI pair programming directly in the terminal, editing code within local Git repositories. Initially supported all OpenAI chat models; recommended GPT-4.
- The tool is notable for having AI write a large portion of its own codebase (~80%+ by some accounts).
- Sources: [Aider HISTORY.md on GitHub](https://github.com/paul-gauthier/aider/blob/main/HISTORY.md), [Grokipedia entry on Aider](https://grokipedia.com/page/Aider)

### Devin (Cognition AI)
- **March 2024**: Cognition AI launched Devin — billed as "the world's first AI software engineer."
- **SWE-bench claim**: 13.86% on SWE-bench Lite (300-issue curated subset) — the highest score at the time of launch.
- **Immediate controversy**: Independent developers published debunking videos (notably "Internet of Bugs" YouTube channel) showing Devin's demos were simpler than portrayed; methodology and task selection drew heavy criticism on Hacker News and Reddit.
- Sources: [Cognition official blog](https://cognition.ai/blog/introducing-devin), [Codemotion: Is Devin Fake?](https://www.codemotion.com/magazine/ai-ml/is-devin-fake/), [SitePoint: Devin in production](https://www.sitepoint.com/devin-ai-engineers-production-realities/)

### Claude Code (Anthropic)
- **Origin**: September 2024 — Boris Cherny (TypeScript book author, former engineering lead) joined Anthropic and began prototyping developer tools as a side project in an experimental division.
- **February 24, 2025**: Launched as a research preview alongside Claude 3.7 Sonnet. CLI-first agentic coding tool.
- **May 2025**: General availability, including free user access.
- **October 2025**: Web version and iOS app released.
- **Revenue milestone**: Hit $1B annualized run-rate revenue within ~6 months of GA — faster than ChatGPT's revenue ramp.
- Sources: [Built In article](https://builtin.com/articles/anthropic-claude-code-tool), [Medium: Evolution of Claude Code](https://medium.com/@lmpo/the-evolution-of-claude-code-in-2025-a7355dcb7f70), [VentureBeat: Claude Code 2.1.0](https://venturebeat.com/orchestration/claude-code-2-1-0-arrives-with-smoother-workflows-and-smarter-agents)

### Cline (originally "Claude Dev")
- **2024 launch**: Emerged as a VS Code extension named "Claude Dev" created by Saoud Rizwan (marketplace ID: `saoudrizwan.claude-dev`). Third-party, not an Anthropic product.
- **Renamed to Cline in 2024**: "Cline" stands for "CLI aNd Editor." The rebranding reflected maturation from experimental tool to established platform.
- **Key feature**: Unlike Copilot (suggestions) or Aider (terminal), Cline operates entirely within the VS Code UI — creating files, editing code, executing terminal commands, and browsing the web — all with explicit user permission at each step.
- **Multi-model pivot**: Despite its Claude Dev origins, Cline now supports Claude, Gemini, DeepSeek, and local models via LM Studio.
- Sources: [VS Marketplace listing](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev), [History Tools: Cline review](https://www.historytools.org/ai/cline-ai-coding-assistant-review-2025)

### OpenHands (originally OpenDevin)
- **March 12, 2024**: Launched as "OpenDevin" — an explicit open-source response to Cognition's Devin announcement. Created by Binyuan Hui and Junyang Lin (Qwen LLM team).
- **Early contributors**: Robert Brennan, Xingyao Wang, and Graham Neubig joined early and established All Hands AI to steward the project.
- **Late 2024**: Rebranded from OpenDevin to OpenHands under the All-Hands-AI GitHub organization.
- **Rapid growth**: 65K+ GitHub stars, 2,100+ contributors, 3,500+ commits as of early 2026.
- **MIT license**: Model-agnostic, community-driven alternative to closed-source Devin.
- Sources: [OpenHands one-year blog post](https://openhands.dev/blog/one-year-of-openhands-a-journey-of-open-source-ai-development), [arxiv paper](https://arxiv.org/abs/2407.16741), [GitHub repo](https://github.com/OpenHands/OpenHands)

---

## SECTION 2: Major Version / Capability Milestones (T_b)

### GitHub Copilot — Full Timeline
| Date | Milestone |
|------|-----------|
| June 29, 2021 | Technical preview (VS Code, OpenAI Codex) |
| June 21, 2022 | General availability ($10/mo individual) |
| Feb 2023 | Copilot Chat announced (GPT-4 powered conversational AI in IDE) |
| March 2023 | GitHub transitions off Codex to GPT-4; Copilot X announced |
| April 2024 | Copilot Workspace technical preview — issue-to-code automation |
| Oct 2024 | GitHub Universe: multi-model support (Claude, Gemini, GPT), Copilot Enterprise |
| Feb 6, 2025 | Agent mode announced for autonomous multi-file editing |
| May 30, 2025 | Copilot Workspace sunset; rebuilt as Copilot Coding Agent (GA for paid subscribers Sep 2025) |
| 2026 | Autonomous PR creation, agentic code review, GitHub Spark (natural language app building) |

Sources: [GitHub newsroom: Agent Mode](https://github.com/newsroom/press-releases/agent-mode), [GitHub Universe 2024 press release](https://github.com/newsroom/press-releases/github-universe-2024), [GitHub Next: Copilot Workspace](https://githubnext.com/projects/copilot-workspace)

---

## SECTION 3: Vendor Pivots (T_c)

### GitHub Copilot: Autocomplete → Chat → Agent
- **2021–2022**: Pure autocomplete/tab-completion positioned as "AI pair programmer." Passive: waits for cursor context and suggests completions.
- **2023 pivot (Copilot X)**: Added Copilot Chat — conversational AI in the IDE via GPT-4. This shifted from passive suggestion to interactive Q&A and code generation on demand.
- **2024 pivot (Copilot Workspace)**: Introduced issue-to-code automation — a planning layer before code generation. First attempt to make Copilot "agentic." Positioned as a whole task workflow tool, not just a code completer.
- **2025 pivot (Agent Mode / Coding Agent)**: Copilot Workspace sunset (May 2025); replaced by Copilot Coding Agent (GA Sep 2025). Full agent loop: Copilot now opens PRs autonomously, runs tests, iterates on failures. Multi-model selection (Claude, Gemini, GPT) added — GitHub became a model-agnostic platform. This represented a fundamental pivot from "tool within IDE" to "autonomous software development agent."
- Sources: [GitHub newsroom: Agent Mode](https://github.com/newsroom/press-releases/agent-mode), [DevOps.com: Copilot evolves](https://devops.com/github-copilot-evolves-agent-mode-and-multi-model-support-transform-devops-workflows-2/)

### OpenAI Codex: API Model → Deprecated → CLI Agent
- **2021**: Codex released as a base model API. Positioned as "AI that translates natural language to code." Primary use: powering Copilot.
- **March 2023**: Deprecated from OpenAI API. OpenAI pivoted to Chat Completions API with GPT-4 as the new coding backbone.
- **May 2025**: OpenAI relaunched "Codex" branding as a completely different product — a cloud-based agentic coding tool (CLI agent) that could run in sandboxed containers. The Codex name was recycled to signal a new agentic era distinct from the original model API.
- Sources: [Visual Studio Magazine: Return of Codex](https://visualstudiomagazine.com/articles/2025/05/16/the-return-of-codex-ai-as-an-agent.aspx), [OpenAI Deprecations](https://platform.openai.com/docs/deprecations)

### Cursor: Editor → Agentic Orchestration Platform
- **2022–2023**: Positioned as a VS Code fork with better AI integration — primarily tab completion and inline code generation.
- **2024 pivot**: Added true agent mode — autonomous multi-file edits, terminal access, repo-wide understanding. Shifted from "AI suggestions" to "AI does the work."
- **Oct 2025 pivot (Cursor 2.0)**: Launched proprietary model ("Composer") — moved from pure model integrator to having its own model for low-latency agentic coding. This was a significant strategic shift from API consumer to model developer.
- **Apr 2026 pivot (Cursor 3)**: Rebuilt UI around an "Agents Window" — multiple AI agents working in parallel, orchestrated by developer. Positioned as an "AI orchestration IDE" not just a code editor.
- Sources: [Fortune: Cursor's crossroads](https://fortune.com/2026/03/21/cursor-ceo-michael-truell-ai-coding-claude-anthropic-venture-capital/), [Artezio: Cursor 2.0](https://www.artezio.com/pressroom/blog/revolutionizes-architecture-proprietary/), [DEV Community: Cursor 3](https://dev.to/devtoolpicks/cursor-3-just-launched-with-an-ai-agents-window-what-changed-and-is-it-still-worth-it-496f)

### Cognition (Devin): Autonomous Agent → Enterprise Platform + Acquirer
- **March 2024**: Launched as a solo autonomous AI engineer. Positioned as "the first AI software engineer" — a fully autonomous agent that replaced human developers for tasks.
- **2024–2025**: Quietly pivoted messaging from "replaces engineers" to "AI collaborator for engineering teams" after controversy over demo accuracy.
- **April 2025**: Devin 2.0 released with a new integrated development environment designed for AI-human collaboration — a softer positioning than the original solo-agent pitch.
- **August 2025**: Acquired Windsurf (formerly Codeium) — pivoting from pure agent play to full developer tooling platform with IDE + agent capabilities combined.
- Sources: [TechCrunch: Cognition raises $400M](https://techcrunch.com/2025/09/08/cognition-ai-defies-turbulence-with-a-400m-raise-at-10-2b-valuation/), [CNBC: Cognition valued at $10.2B](https://www.cnbc.com/2025/09/08/cognition-valued-at-10point2-billion-two-months-after-windsurf-.html)

---

## SECTION 4: MCP Adoption Timeline (T_d)

### Origin
- **November 25, 2024**: Anthropic published "Introducing the Model Context Protocol" — released as an open standard for connecting AI assistants to data systems (content repositories, business tools, dev environments).
- MCP was designed to fix AI integration fragmentation: instead of every tool needing bespoke integrations, MCP provided a universal protocol (analogous to USB-C for AI context).

### Adoption Wave
| Date | Event |
|------|-------|
| Nov 25, 2024 | Anthropic releases MCP publicly (open source, MIT license) |
| Late 2024 | Early adoption: Cursor, Cline, Continue, Windsurf add MCP support |
| March 2025 | OpenAI announces MCP support — ChatGPT and Agents SDK become MCP-compatible |
| March 2025 | Cursor, Cline, Goose officially support MCP (confirmed per adoption tracker) |
| March 2025 | Google DeepMind announces MCP support |
| VS Code / GitHub Copilot | Adopted MCP in 2025 (exact date TBD — see Copilot agent mode launch) |
| December 2025 | Anthropic donates MCP to Agentic AI Foundation (AAIF) under the Linux Foundation, co-founded with Block and OpenAI |
| 2026 | MCP effectively becomes the industry standard for tool use / context injection across all major coding agents |

### Significance for Coding Tools
- MCP enabled any coding agent to connect to external tools (databases, APIs, file systems, browsers) via a standard protocol rather than custom integrations.
- For IDE tools like Cursor and Cline, MCP allowed users to define their own tool servers — making these tools extensible without waiting for vendor updates.
- The Linux Foundation stewardship in Dec 2025 signaled MCP's transition from "Anthropic project" to "industry standard."

Sources: [Anthropic: Introducing MCP](https://www.anthropic.com/news/model-context-protocol), [Anthropic: Donating MCP](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation), [Wikipedia: MCP](https://en.wikipedia.org/wiki/Model_Context_Protocol), [Pento: A Year of MCP](https://www.pento.ai/blog/a-year-of-mcp-2025-review), [Pragmatic Engineer: MCP](https://newsletter.pragmaticengineer.com/p/mcp)

---

## SECTION 5: Devin Trajectory + The "Agentic Coding = New IDE" Market Thesis (T_e)

### Devin Funding & Valuation Trajectory
| Date | Event |
|------|-------|
| Early 2024 | $21M from Founders Fund; $350M valuation |
| April 2024 | $175M round (Founders Fund lead); $2B valuation — unicorn |
| Sep 2024 | ARR: ~$1M |
| March 2025 | $4B valuation (8VC-led round) |
| June 2025 | ARR climbs to $73M |
| August 2025 | $500M round; $9.8B valuation; acquires Windsurf (formerly Codeium) |
| September 2025 | $400M more from Founders Fund; $10.2B valuation |

Sources: [TechCrunch: $400M raise](https://techcrunch.com/2025/09/08/cognition-ai-defies-turbulence-with-a-400m-raise-at-10-2b-valuation/), [Cognition blog: Funding growth](https://cognition.ai/blog/funding-growth-and-the-next-frontier-of-ai-coding-agents)

### Devin Post-Controversy Trajectory
- Despite the March 2024 demo controversy (Internet of Bugs debunking, Hacker News skepticism), Cognition survived and thrived commercially.
- Key pivot: shifted from consumer/solo-dev messaging to enterprise B2B. By 2025, customers included Goldman Sachs, Citi, Dell, Cisco, Ramp, Palantir, Nubank, Mercado Libre.
- **Devin 2.0 (April 2025)**: Reframed from "autonomous engineer" to "AI for engineering teams" — added collaborative IDE for AI-human pairing.
- The Windsurf acquisition (Aug 2025) doubled Cognition ARR overnight and gave them an IDE product — moving from pure agent to full developer platform.
- Net burn remained under $20M since founding despite rapid growth — unusually capital-efficient for the scale.
- Sources: [Built In: Cognition $400M](https://builtin.com/articles/cognition-raises-400m-10b-valuation-20250908), [CNBC: post-Windsurf valuation](https://www.cnbc.com/2025/09/08/cognition-valued-at-10point2-billion-two-months-after-windsurf-.html)

### The "Agentic Coding = New IDE" Market Thesis

**Who said it first, when:**
- **March 2024**: Cognition AI's Devin launch was the first high-profile product bet on the thesis that AI could do entire software engineering tasks end-to-end — implicitly positioning the AI agent as the primary developer, not a tool within a developer's IDE.
- **April 2024**: GitHub Copilot Workspace (technical preview) was GitHub's public articulation of the thesis from an incumbent: the IDE becomes a task orchestration layer, not a code editor.
- **Mid-2024**: Cursor began articulating their agentic vision — "the developer's job is to orchestrate AI, not write every line." This was formalized in Cursor 3 (April 2026) but the philosophy was stated publicly by founders in 2024.
- **2025**: The thesis reached mainstream VC consensus. Multiple VCs, including a16z and Sequoia, published pieces arguing "the IDE is the new battleground for AI" — framing coding agents as platforms, not features.
- **2026**: Cursor 3 (April 2, 2026) made the thesis explicit in product design: "most code will be written by AI agents, and the developer's job is to orchestrate them, not write every line."

Sources: [Fortune: Cursor's crossroads](https://fortune.com/2026/03/21/cursor-ceo-michael-truell-ai-coding-claude-anthropic-venture-capital/), [DEV Community: Cursor 3](https://dev.to/devtoolpicks/cursor-3-just-launched-with-an-ai-agents-window-what-changed-and-is-it-still-worth-it-496f)

---

## SECTION 6: SWE-bench Benchmark Evolution

### Origin (2023)
- **2023**: SWE-bench introduced in paper "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?" — 2,294 problems from real GitHub issues across 12 popular Python repositories.
- **Baseline (2023)**: Best model at time of paper (Claude 2) solved only **1.96%** of issues.
- **Devin's claim (March 2024)**: 13.86% on SWE-bench Lite (300-problem curated subset) — this was the claimed state-of-the-art at launch, disputed for methodology.

### SWE-bench Verified (August 2024)
- OpenAI created SWE-bench Verified — 500-problem human-validated subset reviewed by 3 expert software engineers per problem.
- Goal: filter out ambiguous/broken test cases that inflated or deflated scores on the original.
- Became the new industry-standard measure for autonomous coding capability.

### Score Progression
| Date | System | SWE-bench Verified Score |
|------|--------|--------------------------|
| March 2024 | Devin (Cognition) | ~13.86% (SWE-bench Lite; methodology disputed) |
| Aug 2024 | Various (Verified introduced) | ~20–30% range for leading systems |
| Early 2025 | Claude 3.7 Sonnet | ~49% |
| 2026 | Claude (latest) | ~77.2% |
| 2026 | GPT-5 | ~74.9% |
| 2026 | State of art | ~80.9% |

- **Note**: OpenAI itself wrote in 2025/2026 that "SWE-bench Verified no longer measures frontier coding capabilities" — scores have improved so fast that the benchmark is near-saturated and the industry needs harder evaluation sets.

Sources: [SWE-bench Verified (Epoch AI)](https://epoch.ai/benchmarks/swe-bench-verified/), [OpenAI: Why we no longer evaluate SWE-bench Verified](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/), [OpenAI: Introducing SWE-bench Verified](https://openai.com/index/introducing-swe-bench-verified/), [Local AI Master: SWE-Bench 2026](https://localaimaster.com/models/swe-bench-explained-ai-benchmarks)

---

## SECTION 7: Additional Tool Notes

### Windsurf (formerly Codeium)
- Codeium launched ~2022 as a free alternative to GitHub Copilot.
- Rebranded to Windsurf in late 2024, repositioning as an agentic IDE.
- **August 2025**: Acquired by Cognition AI (Devin's maker) — combined ARR immediately doubled Cognition's revenue.
- Sources: [CNBC: Cognition + Windsurf](https://www.cnbc.com/2025/09/08/cognition-valued-at-10point2-billion-two-months-after-windsurf-.html)

### OpenAI Codex CLI (2025 relaunch)
- **May 2025**: OpenAI relaunched the "Codex" brand as a CLI-based agentic coding agent — a terminal tool (similar in philosophy to Aider and Claude Code) that runs in sandboxed containers.
- Positioned as OpenAI's answer to Claude Code and Aider — a CLI-first, agent-loop tool distinct from Copilot's IDE integration.
- Sources: [Visual Studio Magazine: The Return of Codex as Agent](https://visualstudiomagazine.com/articles/2025/05/16/the-return-of-codex-ai-as-an-agent.aspx)

---

## KEY HISTORICAL NARRATIVE: The "Agent vs. Autocomplete" Market Shift

The shift from autocomplete to agentic coding happened in distinct waves:

**Wave 1 — Autocomplete Era (2021–2022)**
- GitHub Copilot defined the category: inline tab-completion, passive, single-file aware.
- All tools in this era were "suggestions" — the human still wrote the code, AI just completed lines.

**Wave 2 — Chat + Multi-file Era (2022–2023)**
- ChatGPT (Nov 2022) changed user expectations — developers started using chat to generate whole functions.
- Copilot Chat (2023) added conversational layer to the IDE.
- Cursor emerged as the "what if the whole editor was designed for this?" answer.
- Aider showed the terminal-native path: AI edits files directly in your git repo.

**Wave 3 — Agent Launch Era (2024)**
- Devin (March 2024) made the boldest bet: full autonomy, end-to-end task completion.
- OpenDevin/OpenHands (March 2024): open-source version immediately followed.
- Cursor added agent mode in 2024 — multi-file, multi-step, terminal access.
- Copilot Workspace (April 2024): GitHub's attempt at a planning-first agent UI.
- Cline (formerly Claude Dev) extended agent capabilities into VS Code natively.
- Claude Code (prototype Sep 2024): Anthropic began internal development.

**Wave 4 — Agentic Mainstream + Platform Wars (2025–2026)**
- Claude Code GA (May 2025): Anthropic enters the race directly.
- OpenAI Codex CLI relaunch (May 2025): OpenAI enters CLI agent space.
- Copilot Coding Agent GA (Sep 2025): GitHub makes agents standard for all paid users.
- Cursor 2.0 (Oct 2025): First proprietary model for agentic coding.
- MCP donated to Linux Foundation (Dec 2025): Protocol standardization.
- Cursor 3 (April 2026): IDE rebuilt as agent orchestration platform — full market shift complete.

By 2026, the question is no longer "agent vs. autocomplete" — agents have won. The new competition is: which platform orchestrates agents best, and which models power them.

---

## SOURCES CONSULTED (Master List)

1. [GitHub Blog: Introducing GitHub Copilot](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/)
2. [TechCrunch: GitHub Copilot preview June 2021](https://techcrunch.com/2021/06/29/github-previews-new-ai-tool-that-makes-coding-suggestions/)
3. [Wikipedia: GitHub Copilot](https://en.wikipedia.org/wiki/GitHub_Copilot)
4. [OpenAI Deprecations](https://platform.openai.com/docs/deprecations)
5. [Medium: OpenAI Codex 2021 to 2025 Agent](https://medium.com/@aliazimidarmian/openai-codex-from-2021-code-model-to-a-2025-autonomous-coding-agent-85ef0c48730a)
6. [Visual Studio Magazine: Return of Codex as Agent](https://visualstudiomagazine.com/articles/2025/05/16/the-return-of-codex-ai-as-an-agent.aspx)
7. [Contrary Research: Cursor business breakdown](https://research.contrary.com/company/cursor)
8. [Fortune: Cursor's crossroads (Mar 2026)](https://fortune.com/2026/03/21/cursor-ceo-michael-truell-ai-coding-claude-anthropic-venture-capital/)
9. [We Are Founders: Cursor MIT team story](https://www.wearefounders.uk/cursor-founders-the-mit-team-behind-the-400-million-ai-code-editor-revolution/)
10. [Aider HISTORY.md (GitHub)](https://github.com/paul-gauthier/aider/blob/main/HISTORY.md)
11. [Grokipedia: Aider](https://grokipedia.com/page/Aider)
12. [Cognition AI blog: Introducing Devin](https://cognition.ai/blog/introducing-devin)
13. [Codemotion: Is Devin Fake?](https://www.codemotion.com/magazine/ai-ml/is-devin-fake/)
14. [SitePoint: Devin in production](https://www.sitepoint.com/devin-ai-engineers-production-realities/)
15. [Built In: Anthropic Claude Code](https://builtin.com/articles/anthropic-claude-code-tool)
16. [Medium: Evolution of Claude Code in 2025](https://medium.com/@lmpo/the-evolution-of-claude-code-in-2025-a7355dcb7f70)
17. [VentureBeat: Claude Code 2.1.0](https://venturebeat.com/orchestration/claude-code-2-1-0-arrives-with-smoother-workflows-and-smarter-agents)
18. [VS Marketplace: Cline (saoudrizwan.claude-dev)](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev)
19. [History Tools: Cline review 2025](https://www.historytools.org/ai/cline-ai-coding-assistant-review-2025)
20. [OpenHands: One-year blog post](https://openhands.dev/blog/one-year-of-openhands-a-journey-of-open-source-ai-development)
21. [arxiv: OpenHands paper](https://arxiv.org/abs/2407.16741)
22. [GitHub: OpenHands repo](https://github.com/OpenHands/OpenHands)
23. [GitHub newsroom: Agent Mode launch](https://github.com/newsroom/press-releases/agent-mode)
24. [GitHub Universe 2024 press release](https://github.com/newsroom/press-releases/github-universe-2024)
25. [GitHub Next: Copilot Workspace](https://githubnext.com/projects/copilot-workspace)
26. [Anthropic: Introducing MCP](https://www.anthropic.com/news/model-context-protocol)
27. [Anthropic: Donating MCP to Linux Foundation](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)
28. [Wikipedia: Model Context Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol)
29. [Pento: A Year of MCP 2025 review](https://www.pento.ai/blog/a-year-of-mcp-2025-review)
30. [Pragmatic Engineer: MCP protocol](https://newsletter.pragmaticengineer.com/p/mcp)
31. [TechCrunch: Cognition $400M raise](https://techcrunch.com/2025/09/08/cognition-ai-defies-turbulence-with-a-400m-raise-at-10-2b-valuation/)
32. [Cognition blog: Funding, growth, next frontier](https://cognition.ai/blog/funding-growth-and-the-next-frontier-of-ai-coding-agents)
33. [CNBC: Cognition $10.2B post-Windsurf](https://www.cnbc.com/2025/09/08/cognition-valued-at-10point2-billion-two-months-after-windsurf-.html)
34. [Built In: Cognition $400M](https://builtin.com/articles/cognition-raises-400m-10b-valuation-20250908)
35. [Epoch AI: SWE-bench Verified](https://epoch.ai/benchmarks/swe-bench-verified/)
36. [OpenAI: Why we no longer evaluate SWE-bench Verified](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/)
37. [OpenAI: Introducing SWE-bench Verified](https://openai.com/index/introducing-swe-bench-verified/)
38. [Local AI Master: SWE-bench 2026 leaderboard](https://localaimaster.com/models/swe-bench-explained-ai-benchmarks)
39. [DevOps.com: Copilot evolves 2025](https://devops.com/github-copilot-evolves-agent-mode-and-multi-model-support-transform-devops-workflows-2/)
40. [Artezio: Cursor 2.0](https://www.artezio.com/pressroom/blog/revolutionizes-architecture-proprietary/)
41. [DEV Community: Cursor 3 launch](https://dev.to/devtoolpicks/cursor-3-just-launched-with-an-ai-agents-window-what-changed-and-is-it-still-worth-it-496f)

---

## TASK STATUS SUMMARY
- T_a (founding/launch dates per tool): **done** — GitHub Copilot (Jun 2021), OpenAI Codex (Aug 2021, deprecated Mar 2023), Cursor (early 2022), Aider (2023), Cline/Claude Dev (2024), Devin (Mar 2024), OpenDevin/OpenHands (Mar 12 2024), Claude Code (Feb 24 2025) all covered with sources.
- T_b (major version milestones): **done** — GitHub Copilot full timeline table; Cursor eras (2022→2024→Oct 2025→Apr 2026); Devin 2.0 (Apr 2025); Claude Code GA (May 2025); OpenAI Codex CLI relaunch (May 2025); SWE-bench score progression table.
- T_c (vendor pivots): **done** — GitHub Copilot (autocomplete→chat→agent), OpenAI Codex (API model→deprecated→CLI agent), Cursor (editor→agentic platform→multi-agent orchestrator), Cognition/Devin (autonomous agent→enterprise platform+acquirer), all with dates and citations.
- T_d (MCP adoption timeline): **done** — Origin Nov 25 2024, adoption table through Dec 2025 Linux Foundation donation; Cursor/Cline/OpenAI/Google adoption all dated.
- T_e (Devin trajectory + market shift): **done** — Full Devin funding table ($350M→$2B→$4B→$9.8B→$10.2B); ARR trajectory ($1M Sep 2024 → $73M Jun 2025); "agentic coding = new IDE" thesis origin traced to Mar 2024 (Devin launch) with subsequent articulations by Copilot Workspace (Apr 2024), Cursor founders (mid-2024), and market consensus (2025–2026).

