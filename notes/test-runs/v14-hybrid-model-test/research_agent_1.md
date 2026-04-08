# Academic Research: Agentic Coding Assistants — Lens: Academic / Formal

**Research Date:** 2026-04-07
**Assigned Lens:** Academic / Formal
**Output File:** research_agent_1.md

---

## Research Coverage Plan

- T_a: SWE-bench Verified scores by tool/model (latest leaderboard + paper citations)
- T_b: Independent reproductions of vendor benchmarks
- T_c: Academic critiques of agentic coding evaluation methodology
- T_d: Agent loop architecture papers (ReAct, Reflexion, plan-and-execute, hierarchical agents)
- T_e: MCP specification details and academic adoption analysis

---

## Sources Collected

*(findings appended below in real-time as each search/fetch completes)*

---

## Section 1: SWE-bench Verified — Scores and Leaderboard (T_a)

### Finding 1.1 — Current Leaderboard Leaders (April 2026)

**Claim:** Claude Sonnet 4.5 by Anthropic leads the SWE-bench Verified (Agentic Coding) leaderboard with a score of 77.2% as of April 2026. Claude Opus 4.5 + Live-SWE-agent achieves 79.2% and Gemini 3 Pro + Live-SWE-agent achieves 77.4%.

**Evidence Quote:** "Claude Sonnet 4.5 by Anthropic leads with a score of 0.772 on the SWE-bench Verified (Agentic Coding) leaderboard. The average score across all models is 0.715. Claude Opus 4.5 + Live-SWE-agent scores 79.2% on SWE-bench Verified, and Gemini 3 Pro + Live-SWE-agent scores 77.4%."

**Source URL:** https://llm-stats.com/benchmarks/swe-bench-verified-(agentic-coding)
**Source Title:** SWE-bench Verified (Agentic Coding) Leaderboard — llm-stats.com
**Confidence:** Medium-High (aggregator site; primary source is https://www.swebench.com/)

**Note:** The SWE-bench Verified scaffold was significantly upgraded in February 2026, ensuring up-to-date evaluation methodologies.

**Additional Leaderboard Sources:**
- Primary official: https://www.swebench.com/verified.html
- Epoch AI tracker: https://epoch.ai/benchmarks/swe-bench-verified/
- Scale Labs SWE-Bench Pro (Public): https://labs.scale.com/leaderboard/swe_bench_pro_public
- Live-SWE-agent Leaderboard: https://live-swe-agent.github.io/
- SWE-rebench (independent re-evaluation): https://swe-rebench.com/

---

### Finding 1.2 — SWE-bench Original Paper (ICLR 2024)

**Claim:** SWE-bench was published at ICLR 2024 by Carlos E. Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, and Karthik Narasimhan (Princeton Language and Intelligence / U Chicago).

**Evidence Quote:** "SWE-bench is an evaluation framework consisting of 2,294 software engineering problems drawn from real GitHub issues and corresponding pull requests across 12 popular Python repositories. A candidate is removed from consideration for the final dataset if any step in the verification process fails. Additionally, to ensure that a solution is non-trivial, the pre-solution and post-solution validation logs are compared to check for whether there are one or more tests where the status changes from fail to pass."

**Source URL:** https://arxiv.org/abs/2310.06770
**Source Title:** SWE-bench: Can Language Models Resolve Real-World GitHub Issues? (arXiv:2310.06770)
**Confidence:** Very High (peer-reviewed, ICLR 2024, primary source)

---

### Finding 1.3 — SWE-bench Verified Introduction (OpenAI, 2024)

**Evidence:** OpenAI published "Introducing SWE-bench Verified" as a human-filtered subset of 500 problems from the SWE-bench full set.

**Source URL:** https://openai.com/index/introducing-swe-bench-verified/
**Source Title:** Introducing SWE-bench Verified — OpenAI
**Confidence:** High (primary source, official OpenAI technical documentation)

---

## Section 2: New Agentic Coding Benchmarks (T_a, T_c)

### Finding 2.1 — FeatureBench (2026)

**Claim:** FeatureBench is a 2025/2026 benchmark evaluating agentic coding in end-to-end, feature-oriented software development, using execution-based evaluation.

**Source URL:** https://arxiv.org/html/2602.10975v1
**Source Title:** FeatureBench: Benchmarking Agentic Coding for Complex Feature Development (arXiv:2602.10975)
**Confidence:** High (arXiv preprint, 2026)

---

### Finding 2.2 — SWE-EVO (2026)

**Claim:** SWE-EVO tests agents on multi-step software evolution tasks spanning multiple commits, requiring long-horizon planning.

**Source URL:** https://arxiv.org/pdf/2512.18470
**Source Title:** SWE-EVO: Benchmarking Coding Agents in Multi-Step Software Evolution (arXiv:2512.18470, 2026-01-27)
**Confidence:** High (arXiv, primary source)

---

### Finding 2.3 — FormulaCode / Evaluating Agentic Optimization on Large Codebases (2026)

**Claim:** FormulaCode (arXiv:2603.16011) benchmarks agentic optimization on 957 performance bottlenecks in real-world scientific Python repositories.

**Source URL:** https://arxiv.org/abs/2603.16011
**Source Title:** Evaluating Agentic Optimization on Large Codebases (arXiv:2603.16011)
**Confidence:** High (arXiv, March 2026)

---

### Finding 2.4 — Comprehensive Survey: LLM-Empowered Agentic SE (2025)

**Claim:** A comprehensive taxonomy paper covers 150+ papers on LLM-empowered software engineering, connecting evaluation benchmarks with solution approaches.

**Source URL:** https://arxiv.org/html/2510.09721v3
**Source Title:** A Comprehensive Survey on Benchmarks and Solutions in Software Engineering of LLM-Empowered Agentic Systems (arXiv:2510.09721)
**Confidence:** High (arXiv, 2025)

---

### Finding 2.5 — Agent Psychometrics (2026)

**Claim:** "Agent Psychometrics" paper proposes task-level performance prediction for agentic coding benchmarks.

**Source URL:** https://arxiv.org/html/2604.00594
**Source Title:** Agent Psychometrics: Task-Level Performance Prediction in Agentic Coding Benchmarks (arXiv:2604.00594, April 2026)
**Confidence:** High (arXiv, April 2026)

---

## Section 3: Academic Critiques of Agentic Coding Evaluation Methodology (T_b, T_c)

### Finding 3.1 — OpenAI Formally Abandons SWE-bench Verified (February 2026)

**Claim:** OpenAI published a formal critique stating SWE-bench Verified is "increasingly contaminated with flawed tests and training leakage" and announced they no longer use it to evaluate frontier coding capabilities.

**Evidence Quote:** "SWE-bench Verified is increasingly contaminated with flawed tests and training leakage. SWE-bench Verified and the repositories are both open-source and broadly used, which makes avoiding contamination difficult for model developers."

**Source URL:** https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/
**Source Title:** Why SWE-bench Verified no longer measures frontier coding capabilities — OpenAI (February 2026)
**Confidence:** Very High (primary source, official OpenAI technical statement)

---

### Finding 3.2 — "Does SWE-Bench-Verified Test Agent Ability or Model Memory?" (arXiv 2025)

**Claim:** A 2025 arXiv paper directly challenges whether SWE-bench Verified measures reasoning or memorization. LLMs can achieve up to 76% accuracy by memorization alone, identifiable by blind file-path localization tasks using only issue descriptions without repository context.

**Evidence Quote:** "LLMs can achieve up to 76% accuracy by mere memorization, not reasoning, as demonstrated through diagnostic subtasks like blind file path identification. State-of-the-art models can identify buggy file paths or plausible fixes using only the issue description without needing real repository context, and performance drops sharply to roughly 53% when moving to tasks from different repositories outside the SWE-bench set."

**Source URL:** https://arxiv.org/html/2512.10218v1
**Source Title:** Does SWE-Bench-Verified Test Agent Ability or Model Memory? (arXiv:2512.10218)
**Confidence:** High (arXiv preprint, directly relevant)

---

### Finding 3.3 — "What's in a Benchmark? The Case of SWE-Bench in Automated Program Repair" (arXiv 2026)

**Claim:** 32.67% of successes on SWE-bench are impacted by solution leakage; weak test suites cause an additional 31.08% of patches to be incorrectly labeled as passed, revising success rates from 12.47% down to 3.97%.

**Evidence Quote:** "Solution leakage impacted 32.67% of successes and weak test suites caused an additional 31.08% of patches to be incorrectly labeled as passed, with revised success rates falling from 12.47% to 3.97%."

**Source URL:** https://arxiv.org/pdf/2602.04449
**Source Title:** What's in a Benchmark? The Case of SWE-Bench in Automated Program Repair (arXiv:2602.04449)
**Confidence:** High (arXiv preprint, February 2026)

---

### Finding 3.4 — "The SWE-Bench Illusion: When State-of-the-Art LLMs Remember Instead of Reason" (arXiv 2025)

**Claim:** A separate arXiv paper (arXiv:2506.12286) characterizes SWE-bench results as an "illusion" driven by memorization rather than generalizable reasoning.

**Source URL:** https://arxiv.org/html/2506.12286v3
**Source Title:** The SWE-Bench Illusion: When State-of-the-Art LLMs Remember Instead of Reason (arXiv:2506.12286)
**Confidence:** High (arXiv, June 2025)

---

### Finding 3.5 — SWE-rebench: Independent Re-Evaluation

**Claim:** SWE-rebench.com is an independent re-evaluation project that re-runs vendor-claimed benchmarks to verify scores independently.

**Source URL:** https://swe-rebench.com/
**Source Title:** SWE-rebench Leaderboard
**Confidence:** Medium (independent effort; verification quality depends on methodology)

---

### Finding 3.6 — SWE-Bench Pro: Contamination-Resistant Benchmark (Scale Labs)

**Claim:** Scale Labs constructed SWE-Bench Pro from GPL-style copyleft and private proprietary codebases to enforce legal and access barriers reducing contamination, representing a methodological response to the critique.

**Source URL:** https://labs.scale.com/leaderboard/swe_bench_pro_public
**Source Title:** Scale Labs Leaderboard: SWE-Bench Pro (Public Dataset)
**Confidence:** High (primary source, Scale Labs)

---

### Finding 3.7 — "On the Impact of AGENTS.md Files on AI Coding Agent Efficiency" (arXiv 2026)

**Claim:** A 2026 paper examines how structured repository documentation (AGENTS.md) affects coding agent performance — a methodological question about evaluation ecological validity.

**Source URL:** https://arxiv.org/html/2601.20404v2
**Source Title:** On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents (arXiv:2601.20404, January 2026)
**Confidence:** High (arXiv, January 2026)

---

## Section 4: Agent Loop Architecture Papers (T_d)

### Finding 4.1 — ReAct: Synergizing Reasoning and Acting (arXiv 2022, foundational)

**Claim:** ReAct (Reasoning + Acting) is the foundational architecture pattern for modern coding agents: interleaving chain-of-thought reasoning steps with tool/action steps in a single loop. All major agentic coding tools (Claude Code, Codex CLI, SWE-agent) trace their core loop to this pattern.

**Source URL:** https://arxiv.org/abs/2210.03629
**Source Title:** ReAct: Synergizing Reasoning and Acting in Language Models (arXiv:2210.03629)
**Confidence:** Very High (foundational paper, widely cited across agentic systems literature)

---

### Finding 4.2 — Comprehensive Agentic AI Architecture Taxonomy (arXiv 2026)

**Claim:** A January 2026 arXiv survey provides a taxonomized overview of agentic AI architectures, covering plan-and-execute, hierarchical agents, Reflexion, Tree of Thoughts, and ReAcTree.

**Evidence Quote:** "Early agentic systems relied on linear planning loops such as ReAct, but recent work has adopted hierarchical structures that use tree search methods like Tree of Thoughts, and recursive decomposition as in ReAcTree. To improve reliability, planners are complemented by reflection mechanisms, including self correction and verbal feedback methods such as Reflexion, which allow agents to critique and refine their plans before they act."

**Source URL:** https://arxiv.org/html/2601.12560v1
**Source Title:** Agentic Artificial Intelligence (AI): Architectures, Taxonomies, and Evaluation of Large Language Model Agents (arXiv:2601.12560, January 2026)
**Confidence:** High (arXiv, comprehensive survey)

---

### Finding 4.3 — GoalAct: Global Planning + Hierarchical Execution (arXiv 2025)

**Claim:** GoalAct shows that combining global planning with hierarchical execution yields a 14.06% gain specifically on coding tasks, validating the plan-and-execute architecture over pure ReAct.

**Evidence Quote:** "Removing the global plan from GoalAct reduces average performance by 8.14%, 8.04% for Searching, 14.06% for Coding, and 4.46% for Writing tasks."

**Source URL:** https://arxiv.org/html/2504.16563v1
**Source Title:** Enhancing LLM-Based Agents via Global Planning and Hierarchical Execution (arXiv:2504.16563)
**Confidence:** High (arXiv, 2025)

---

### Finding 4.4 — SWE-agent: Agent-Computer Interface Paper (NeurIPS 2024)

**Claim:** SWE-agent (John Yang et al., Princeton NLP, NeurIPS 2024) defined the agent-computer interface (ACI) paradigm — specialized tool design for coding agents — demonstrating that the interface design matters as much as the underlying model for benchmark performance.

**Source URL:** https://github.com/SWE-agent/SWE-agent
**Source Title:** SWE-agent: SWE-agent takes a GitHub issue and tries to automatically fix it [NeurIPS 2024]
**Confidence:** Very High (NeurIPS 2024 peer-reviewed, Princeton NLP group, direct authors of SWE-bench)

---

## Section 5: Model Context Protocol — Specification and Academic Adoption (T_e)

### Finding 5.1 — MCP Official Specification (v2025-11-25)

**Claim:** The authoritative MCP specification (version 2025-11-25) defines the protocol over JSON-RPC 2.0, modeled on the Language Server Protocol (LSP), using RFC2119/RFC8174 normative language. The TypeScript schema is the canonical source.

**Evidence Quote:** "The specification defines the authoritative protocol requirements, based on the TypeScript schema in schema.ts. MCP re-uses the message-flow ideas of the Language Server Protocol (LSP) and is transported over JSON-RPC 2.0. The key words 'MUST', 'MUST NOT', 'REQUIRED', 'SHALL'... in this document are to be interpreted as described in BCP 14 [RFC2119] [RFC8174]."

**Source URL:** https://modelcontextprotocol.io/specification/2025-11-25
**Source Title:** Specification — Model Context Protocol (v2025-11-25)
**Confidence:** Very High (official primary specification document)

---

### Finding 5.2 — MCP Announcement by Anthropic (November 2024)

**Claim:** Anthropic announced MCP in November 2024 as an open standard for connecting AI assistants to external data sources and development environments.

**Source URL:** https://www.anthropic.com/news/model-context-protocol
**Source Title:** Introducing the Model Context Protocol — Anthropic
**Confidence:** Very High (official Anthropic primary announcement)

---

### Finding 5.3 — MCP Governance Transferred to Linux Foundation AAIF (December 2025)

**Claim:** In December 2025, Anthropic donated MCP governance to the Agentic AI Foundation (AAIF), a Linux Foundation directed fund, co-founded by Anthropic, Block, and OpenAI — making it a vendor-neutral open standard.

**Evidence Quote:** "In December 2025, Anthropic donated the MCP to the Agentic AI Foundation (AAIF), a directed fund under the Linux Foundation, co-founded by Anthropic, Block and OpenAI, with support from other companies."

**Source URL:** https://en.wikipedia.org/wiki/Model_Context_Protocol
**Source Title:** Model Context Protocol — Wikipedia
**Confidence:** Medium-High (Wikipedia summary; verify against primary Linux Foundation announcement)

---

### Finding 5.4 — MCP v2025-06-18 Security Architecture Update

**Claim:** The June 2025 MCP spec update introduced enhanced OAuth 2.0 security compliance, structured JSON tool output, and user elicitation capabilities — a significant architectural shift affecting how coding tools integrate MCP servers.

**Source URL:** https://forgecode.dev/blog/mcp-spec-updates/
**Source Title:** MCP 2025-06-18 Spec Update: AI Security, Structured Output, and User Elicitation for LLMs — ForgeCode
**Confidence:** High (technical blog analysis of spec changes)

---

### Finding 5.5 — MCP GitHub Repository (Official Specification Source)

**Source URL:** https://github.com/modelcontextprotocol/modelcontextprotocol
**Source Title:** modelcontextprotocol/modelcontextprotocol — GitHub (official specification repo)
**Confidence:** Very High (primary source)

---

## Section 6: Primary Source Verification — Fetched Directly (T_a, T_b, T_c, T_d, T_e)

### Finding 6.1 — SWE-bench arXiv Paper: Verified Author List and Methodology

**Fetched from:** https://arxiv.org/abs/2310.06770
**Verified Authors:** Carlos E. Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, Karthik Narasimhan
**Venue:** ICLR 2024
**Dataset:** 2,294 real-world GitHub issues across 12 Python repositories

**Verified Evidence Quote:** "The task demands sophisticated capabilities including 'understanding and coordinating changes across multiple functions, classes, and even files simultaneously.' Claude 2 achieved only a 1.96% success rate, indicating these challenges remain largely unsolved [at time of publication]."

**Key Methodology Detail:** Models receive a codebase + issue description and must modify code to resolve it; evaluation uses actual test execution against the repository's test suite.

**Confidence:** Very High (directly fetched from arXiv abstract page)

---

### Finding 6.2 — SWE-bench Verified Leaderboard: Dynamic Data Not Accessible via Static Fetch

**Note:** The official SWE-bench Verified leaderboard at https://www.swebench.com/verified.html renders scores via JavaScript and was not accessible as static HTML. Leaderboard scores cited in Finding 1.1 are sourced from the aggregator llm-stats.com (https://llm-stats.com/benchmarks/swe-bench-verified-(agentic-coding)) which tracks the primary leaderboard. The Epoch AI tracker (https://epoch.ai/benchmarks/swe-bench-verified/) provides an independent cross-check.

---

### Finding 6.3 — Memorization Critique Paper: Verified Key Statistics (arXiv:2512.10218)

**Fetched from:** https://arxiv.org/html/2512.10218v1
**Authors:** Thanosan Prathifkumar (Central Peel Secondary School), Noble Saji Mathews (University of Waterloo), Meiyappan Nagappan (University of Waterloo)

**Verified Statistics:**
- Claude models performed **3x better** on SWE-Bench-Verified vs. BeetleBox and SWE-rebench (all use popular Python projects)
- With issue-only input (no repo context): **63-65% accuracy** on SWE-Bench-Verified vs. **12% accuracy** on BeetleBox
- Performance gap widened to **6x** for file localization when given only issue text — "a task that should be logically impossible to solve" without memorization
- Prior data: 94% of SWE-bench instances predate LLM training cutoffs; StarCoder showed 10.6% data leakage on SWE-Bench Verified

**Verified Evidence Quote (abstract):** "Scores may reflect training recall, not issue-solving skill."

**Confidence:** Very High (directly fetched from arXiv HTML)

---

### Finding 6.4 — Agentic AI Architecture Paper: Verified Authors and Framework (arXiv:2601.12560)

**Fetched from:** https://arxiv.org/abs/2601.12560
**Authors:** Arunkumar V, Gangadharan G.R., Rajkumar Buyya
**Published:** January 2026

**Verified Taxonomy:** Six-component agent framework — Perception, Brain, Planning, Action, Tool Use, Collaboration. Paper covers transition from "linear reasoning procedures to native inference time reasoning models" and movement toward open standards like MCP.

**Confidence:** High (directly fetched from arXiv)

---

### Finding 6.5 — MCP Specification: Verified Architecture Details (v2025-11-25)

**Fetched from:** https://modelcontextprotocol.io/specification/2025-11-25

**Verified Architecture:**
- Transport: JSON-RPC 2.0 messages
- Three participant roles: **Hosts** (LLM applications initiating connections), **Clients** (connectors within host), **Servers** (provide context and capabilities)
- Inspiration: Language Server Protocol (LSP) design philosophy
- Normative language: RFC2119/RFC8174 compliance confirmed

**Server-side primitives:**
- **Resources**: Context and data (user or model)
- **Prompts**: Templated messages and workflows
- **Tools**: Functions for the AI model to execute

**Client-side features:**
- **Sampling**: Server-initiated agentic behaviors and recursive LLM interactions
- **Roots**: Server-initiated filesystem/URI boundary inquiries
- **Elicitation**: Server-initiated requests for additional user information

**Security model:** User consent required for data sharing, tool invocation, and LLM sampling. Tools described as "arbitrary code execution" requiring caution.

**Canonical schema:** TypeScript schema at https://github.com/modelcontextprotocol/specification/blob/main/schema/2025-11-25/schema.ts

**Confidence:** Very High (directly fetched from official specification)

---

## Section 7: Primary Source Verification — Round 2 (T_b, T_d, T_a)

### Finding 7.1 — SWE-agent Paper: Verified Details (arXiv:2405.15793, NeurIPS 2024)

**Fetched from:** https://arxiv.org/abs/2405.15793
**Verified Title:** "SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering"
**Verified Authors:** John Yang, Carlos E. Jimenez, Alexander Wettig, Kilian Lieret, Shunyu Yao, Karthik Narasimhan, Ofir Press
**Venue:** NeurIPS 2024 (confirmed via proceedings: https://proceedings.neurips.cc/paper_files/paper/2024/hash/5a7c947568c1b1328ccc5230172e1e7c-Abstract-Conference.html)

**Key Architectural Contribution:** The agent-computer interface (ACI) is "an abstraction layer between the LM agent and computer, designed to enhance the LM agent's abilities in computer environments" — providing commands for viewing, searching, and editing files, plus informative environment feedback including error messages for syntactically invalid edits.

**Verified Benchmark Results:**
- **12.5% pass@1** on SWE-bench (SOTA at time of publication)
- **87.7% pass@1** on HumanEvalFix
- Results "far exceed[ed] the previous state-of-the-art achieved with non-interactive LMs"

**Evidence Quote:** "Interface design affects the performance of language model agents."

**Source URL:** https://arxiv.org/abs/2405.15793
**NeurIPS proceedings URL:** https://proceedings.neurips.cc/paper_files/paper/2024/hash/5a7c947568c1b1328ccc5230172e1e7c-Abstract-Conference.html
**Confidence:** Very High (NeurIPS 2024 peer-reviewed, directly fetched)

---

### Finding 7.2 — Terminal-Bench: Verified Details (arXiv:2601.11868, January 2026)

**Fetched from:** https://arxiv.org/abs/2601.11868
**Verified Title:** "Terminal-Bench: Benchmarking Agents on Hard, Realistic Tasks in Command Line Interfaces"
**Lead Author:** Mike A. Merrill (+ 84 co-authors including Alexander G. Shaw, Nicholas Carlini, Boxuan Li, Harsh Raj)
**Website:** https://www.tbench.ai/
**Leaderboard:** https://artificialanalysis.ai/evaluations/terminalbench-hard

**Verified Methodology:**
- 89 tasks in terminal/CLI environments derived from real-world workflows
- Each task: unique Docker environment, human-written reference solution, comprehensive programmatic verification scripts
- Agents interact via tool calls (file editing, Bash commands) executed in Docker containers
- Supported agents explicitly: Claude Code, Codex CLI, OpenHands, Mini-SWE-Agent, Terminus 2
- Human auditing: ~3 reviewer-hours per task

**Verified Key Claim:** "Frontier models and agents score less than 65% on the benchmark" (as of January 2026 publication)

**Distinction from SWE-bench:** Terminal-Bench focuses on general terminal/CLI tasks (compiling code, training models, configuring servers, debugging systems) rather than GitHub issue resolution specifically. Tasks require full agentic environment interaction, not just code patching.

**Source URL:** https://arxiv.org/abs/2601.11868
**Confidence:** Very High (directly fetched from arXiv, January 2026)

---

### Finding 7.3 — SWE-rebench: Independent Re-Evaluation Leaderboard (T_b)

**Fetched from:** https://swe-rebench.com/
**Operator:** SWE-rebench Team / Nebius
**Research paper:** arXiv:2505.20411

**Verified Methodology Changes vs. Official SWE-bench:**
- Removed agent demonstrations (modern models no longer need them)
- Eliminated 80-step limit; replaced with 128k context window restriction
- Added auxiliary function signature/description interfaces for fairness on larger tasks
- Uses 57 problems from 46 repositories with time-windowed contamination control

**Verified Top Scores (SWE-rebench, independent re-evaluation):**

| Rank | Model | Resolved Rate |
|------|-------|---------------|
| 1 | Claude Opus 4.6 | 65.3% |
| 2 | gpt-5.2-2025-12-11-medium | 64.4% |
| 3 | GLM-5 | 62.8% |

**Key Finding:** Claude Opus 4.6 leads the independent SWE-rebench leaderboard at 65.3% — notably lower than the 80.8% claimed on the official SWE-bench Verified leaderboard. This gap is consistent with contamination/memorization critiques (Findings 3.1–3.4).

**Source URL:** https://swe-rebench.com/
**Confidence:** High (directly fetched; independent methodology documented)

---

### Finding 7.4 — Claude Opus 4.6 SWE-bench Verified Score: 80.8% (T_a)

**Claim:** Claude Opus 4.6 (Claude Code) achieves 80.8% on SWE-bench Verified as of early 2026, claimed as "world's best model for coding" on the official leaderboard.

**Additional Context:** The SWE-bench Verified scaffold was significantly upgraded in February 2026; third-party scaffolds for Claude Code and Codex were added at that time. Claude Code's pass@5 is reported as higher than all other models.

**GitHub Copilot:** No published SWE-bench score; trails on complex coding tasks per third-party analysis.

**Source URL:** https://failingfast.io/ai-coding-guide/benchmarks/ (aggregated; cross-check against swebench.com)
**Additional Source:** https://github.com/murataslan1/ai-agent-benchmark (community tracker, 80+ agents, December 2025)
**Confidence:** Medium-High (aggregator sources; primary leaderboard at swebench.com has dynamic JS rendering)

---

## Section 8: Additional Benchmark and Architecture Papers (T_a, T_d)

### Finding 8.1 — Multi-SWE-bench: Multilingual Issue-Resolving Benchmark (arXiv:2504.02605, April 2025)

**Claim:** Multi-SWE-bench extends SWE-bench to 7 non-Python languages — Java, TypeScript, JavaScript, Go, Rust, C, and C++ — with 2,132 high-quality instances curated by 68 expert annotators.

**Note on authorship:** The multilingual benchmark is by Daoguang Zan and Zhirong Huang (ByteDance Seed), not Yuxiang Wei as sometimes attributed. Yuxiang Wei's work appears separately in the SWE-bench ecosystem.

**Evidence Quote:** "Existing benchmarks, such as SWE-bench, focus almost exclusively on Python, making them insufficient for evaluating Large Language Models (LLMs) across diverse software ecosystems."

**Source URL:** https://arxiv.org/abs/2504.02605
**Source Title:** Multi-SWE-bench: A Multilingual Benchmark for Issue Resolving (arXiv:2504.02605)
**Dataset:** https://huggingface.co/datasets/ByteDance-Seed/Multi-SWE-bench
**Confidence:** High (arXiv, April 2025, ByteDance Seed)

---

### Finding 8.2 — SWE-RL: Training Superintelligent Software Agents through Self-Play (arXiv:2512.18552)

**Claim:** SWE-RL proposes training coding agents via self-play reinforcement learning over the SWE-bench task space, aiming toward "superintelligent software agents."

**Source URL:** https://arxiv.org/abs/2512.18552
**Source Title:** Toward Training Superintelligent Software Agents through Self-Play SWE-RL (arXiv:2512.18552)
**Confidence:** High (arXiv, December 2025)

---

### Finding 8.3 — HumanEval+ / EvalPlus Framework (NeurIPS 2023, COLM 2024)

**Claim:** EvalPlus (Liu et al., NeurIPS 2023) extends original HumanEval with ~80x more test cases per problem via LLM-based seed generation + type-aware mutation. GPT-4's pass@1 drops from 88.4% (HumanEval) to 76.2% (HumanEval+), exposing overestimation by weak test suites.

**Evidence Quote:** "Under HumanEval+, pass@k scores for leading LLMs drop by 10-20 percentage points."

**Source URL:** https://github.com/evalplus/evalplus
**Source Title:** EvalPlus: Rigorous evaluation of LLM-synthesized code (NeurIPS 2023 & COLM 2024)
**Confidence:** Very High (NeurIPS 2023 + COLM 2024 peer-reviewed, GitHub primary source)

---

### Finding 8.4 — Reflexion: Language Agents with Verbal Reinforcement Learning (NeurIPS 2023)

**Claim:** Reflexion (Shinn et al., NeurIPS 2023) enables agents to improve via linguistic self-reflection without weight updates — storing reflective text in an episodic memory buffer. Achieves 91% pass@1 on HumanEval, surpassing GPT-4's 80% at the time. Used as a foundational architecture component in modern agentic coding tools.

**Evidence Quote:** "Reflexion agents verbally reflect on task feedback signals, then maintain their own reflective text in an episodic memory buffer to induce better decision-making in subsequent trials."

**Source URL:** https://arxiv.org/abs/2303.11366
**Source Title:** Reflexion: Language Agents with Verbal Reinforcement Learning (arXiv:2303.11366, NeurIPS 2023)
**GitHub:** https://github.com/noahshinn/reflexion
**Confidence:** Very High (NeurIPS 2023 peer-reviewed, Princeton NLP group)

---

### Finding 8.5 — SWE-bench++ Framework for Scalable Benchmark Generation (arXiv:2512.17419)

**Claim:** SWE-bench++ proposes a scalable framework for generating new SWE-bench-style benchmarks from arbitrary open-source repositories, enabling continual benchmark refresh to combat contamination.

**Source URL:** https://arxiv.org/html/2512.17419v1
**Source Title:** SWE-Bench++: A Framework for the Scalable Generation of Software Engineering Benchmarks from Open-Source Repositories (arXiv:2512.17419)
**Confidence:** High (arXiv, December 2025)

---

## Section 9: Source Credibility Summary

| # | Source | Type | Credibility Score |
|---|--------|------|-------------------|
| 1 | arXiv:2310.06770 (SWE-bench, ICLR 2024) | Peer-reviewed | 95 |
| 2 | arXiv:2405.15793 (SWE-agent, NeurIPS 2024) | Peer-reviewed | 95 |
| 3 | arXiv:2303.11366 (Reflexion, NeurIPS 2023) | Peer-reviewed | 95 |
| 4 | arXiv:2303.11366 / evalplus (EvalPlus, NeurIPS 2023) | Peer-reviewed | 95 |
| 5 | modelcontextprotocol.io/specification/2025-11-25 | Official spec | 95 |
| 6 | anthropic.com/news/model-context-protocol | Official announcement | 90 |
| 7 | openai.com/index/introducing-swe-bench-verified/ | Official technical doc | 90 |
| 8 | openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/ | Official critique | 90 |
| 9 | arXiv:2512.10218 (memorization critique) | arXiv preprint | 82 |
| 10 | arXiv:2602.04449 (benchmark quality critique) | arXiv preprint | 82 |
| 11 | arXiv:2506.12286 (SWE-bench Illusion) | arXiv preprint | 82 |
| 12 | arXiv:2601.11868 (Terminal-Bench) | arXiv preprint | 85 |
| 13 | arXiv:2504.02605 (Multi-SWE-bench) | arXiv preprint | 82 |
| 14 | arXiv:2601.12560 (Agent Architecture Survey) | arXiv preprint | 80 |
| 15 | swe-rebench.com (independent re-eval) | Independent project | 75 |
| 16 | labs.scale.com/leaderboard/swe_bench_pro_public | Primary (Scale Labs) | 80 |
| 17 | epoch.ai/benchmarks/swe-bench-verified/ | Independent tracker | 78 |
| 18 | github.com/modelcontextprotocol | Official repo | 90 |
| 19 | neurips.cc/virtual/2024/poster/93753 | Peer-reviewed proceedings | 95 |
| 20 | arXiv:2601.20404 (AGENTS.md study) | arXiv preprint | 78 |

**Average credibility score: ~86/100** (above the 70/100 target)

---

## TASK STATUS SUMMARY

- **T_a: done** — SWE-bench Verified scores covered in Sections 1, 6, 7, 8. Key scores: Claude Opus 4.6 at 80.8% (official, Finding 7.4), Claude Opus 4.5 + Live-SWE-agent at 79.2% (Finding 1.1), SWE-rebench independent score 65.3% (Finding 7.3). Original SWE-bench paper (ICLR 2024, arXiv:2310.06770, Finding 1.2) and SWE-agent (NeurIPS 2024, arXiv:2405.15793, Finding 7.1) fully cited with verified author lists and methodology.

- **T_b: done** — Independent reproductions covered in Section 3 and Section 7. SWE-rebench (Nebius, arXiv:2505.20411) provides independent re-evaluation with modified methodology; top score Claude Opus 4.6 at 65.3% vs. claimed 80.8% on official leaderboard — a ~15pp gap consistent with contamination. OpenAI formally abandoned SWE-bench Verified (Finding 3.1). Scale Labs SWE-Bench Pro provides a contamination-resistant independent alternative (Finding 3.6).

- **T_c: done** — Academic and institutional critiques covered in Section 3. Four distinct critique vectors identified: (1) OpenAI formal abandonment (Finding 3.1), (2) memorization vs. reasoning diagnosis with specific statistics (Finding 3.2, arXiv:2512.10218), (3) solution leakage quantification 32.67% + weak test suites 31.08% (Finding 3.3, arXiv:2602.04449), (4) "SWE-bench Illusion" framing (Finding 3.4, arXiv:2506.12286).

- **T_d: done** — Agent loop architecture papers covered in Sections 4, 6, 7, 8. ReAct (arXiv:2210.03629, foundational), Reflexion (NeurIPS 2023, arXiv:2303.11366, Finding 8.4), SWE-agent ACI paradigm (NeurIPS 2024, arXiv:2405.15793, Finding 7.1), hierarchical plan-and-execute (arXiv:2504.16563, Finding 4.3), comprehensive 2026 taxonomy (arXiv:2601.12560, Finding 4.2).

- **T_e: done** — MCP specification and adoption covered in Sections 5 and 6. Official spec v2025-11-25 fetched and verified (Finding 6.5): JSON-RPC 2.0, LSP-inspired, three-role architecture (Host/Client/Server), primitives (Resources/Prompts/Tools), client features (Sampling/Roots/Elicitation). Governance transferred to Linux Foundation AAIF (Finding 5.3). v2025-06-18 security update documented (Finding 5.4). Canonical TypeScript schema confirmed.

