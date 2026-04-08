# Hallucination in Multi-Agent LLM Systems: Academic Paper Survey (2025-2026)

**Research date:** 2026-03-29
**Focus:** Techniques beyond source independence, anchoring bias countermeasures, atomic claim screening, tool-grounded verification, temporal credibility decay.

---

## Category 1: Hallucination Amplification in Multi-Agent Systems

### Paper 1: MARCH: Multi-Agent Reinforced Self-Check for LLM Hallucination
- **Authors:** Zhuo Li, Yupeng Zhang, Pengyu Cheng, Jiajun Song, Mengyu Zhou, Hao Li, Shujie Hu, Yu Qin, Erchao Zhao, Xiaoxi Jiang, Guanjun Jiang
- **Year:** 2026 (March 25, 2026)
- **Venue:** arXiv (cs.CL)
- **URL:** https://arxiv.org/abs/2603.24579
- **Multi-agent specific:** YES — core contribution
- **Key technique:** Three specialized agents (Solver, Proposer, Checker) with **deliberate information asymmetry**. The Checker validates claims WITHOUT access to the original output, breaking confirmation bias. Trained via multi-agent reinforcement learning for co-evolution.
- **Novel beyond our system:** Information asymmetry as a design principle — the verifier is intentionally denied context to prevent anchoring. Our system doesn't enforce asymmetry between verification agents.
- **Empirical results:** 8B-parameter model with MARCH achieves competitive performance against closed-source models on hallucination benchmarks with substantially reduced hallucination rates.

### Paper 2: LLM-based Agents Suffer from Hallucinations: A Survey
- **Authors:** Xixun Lin, Yucheng Ning, Jingwen Zhang, + 20 co-authors
- **Year:** 2025 (September 23, 2025; revised November 2025)
- **Venue:** arXiv (cs.AI)
- **URL:** https://arxiv.org/abs/2509.18970
- **Multi-agent specific:** YES — defines "Communication Hallucinations" as a distinct category
- **Key contributions:**
  - **Taxonomy of agent hallucinations** across workflow stages
  - **Communication hallucinations** in MAS: agents exchange inaccurate, misleading, or fabricated information
  - **Three triggering causes:** (1) Erroneous message propagation — errors cascade and amplify; (2) Uncoordinated communication protocols — async scheduling causes info loss; (3) Ineffective network updates — outdated connections distort info flow
  - **Compound propagation effects:** Errors in one agent's messages cascade to other agents, amplifying system dysfunction rather than remaining localized
  - 18 underlying causes identified, with mitigation and detection approaches reviewed
- **Novel beyond our system:** Structured communication protocols (JSON vs natural language), fault-tolerant message design, network topology management for preventing cascade amplification.

### Paper 3: HaluMem: Evaluating Hallucinations in Memory Systems of Agents
- **Authors:** Ding Chen, Simin Niu, Kehang Li, Peng Liu, Xiangping Zheng, Bo Tang, Xinchi Li, Feiyu Xiong, Zhiyu Li
- **Year:** 2025 (November 2025; revised January 2026)
- **Venue:** arXiv (cs.CL)
- **URL:** https://arxiv.org/abs/2511.03506
- **Multi-agent specific:** Partially — focuses on agent memory systems
- **Key technique:** Operation-level evaluation framework isolating hallucination at three stages: memory extraction, memory updating, memory QA. Benchmarks HaluMem-Medium (~1.5k turns) and HaluMem-Long (~2.6k turns, >1M tokens).
- **Key finding:** Memory systems generate and **accumulate** hallucinations during extraction and updating, which propagate to QA. ~15,000 memory points and 3,500 questions per dataset.
- **Novel beyond our system:** Hallucination accumulation through memory operations — our system doesn't explicitly track how stored intermediate findings degrade across extraction/update cycles.

### Paper 4: The Reasoning Trap: How Enhancing LLM Reasoning Amplifies Tool Hallucination
- **Authors:** Chenlong Yin, Zeyang Sha, Shiwen Cui, Changhua Meng
- **Year:** 2025 (October 27, 2025)
- **Venue:** arXiv (cs.LG)
- **URL:** https://arxiv.org/abs/2510.22977
- **Multi-agent specific:** Indirect — relevant because multi-agent systems use reasoning-enhanced models
- **Key finding:** Strengthening reasoning through RL **directly amplifies tool hallucination** proportionally with task performance gains. Effect is method-agnostic (SFT, prompting) and domain-agnostic (math training triggers tool hallucination).
- **Empirical results:** Fundamental "reliability-capability trade-off" — mitigation strategies consistently degrade model utility while reducing hallucination.
- **Novel beyond our system:** Identifies that the very reasoning improvements we rely on for verification may increase hallucination in tool use. Suggests need for hallucination-aware reasoning calibration.

---

## Category 2: Cross-Agent Verification / Debate-Based Hallucination Reduction

### Paper 5: Tool-MAD: A Multi-Agent Debate Framework for Fact Verification with Diverse Tool Augmentation
- **Authors:** Seyeon Jeong, Yeonjun Choi, JongWook Kim, Beakcheol Jang
- **Year:** 2026 (January 8, 2026)
- **Venue:** arXiv (cs.CL)
- **URL:** https://arxiv.org/abs/2601.04742
- **Multi-agent specific:** YES — core contribution
- **Key technique:** Each debating agent is assigned a **distinct external tool** (search API, RAG module, etc.). Agents iteratively retrieve evidence and challenge each other's conclusions. A Judge agent uses faithfulness and answer relevance scores. Adaptive query formulation refines retrieval during debate rounds.
- **Empirical results:** Up to **5.5% accuracy improvement** over existing multi-agent debate frameworks. Strong robustness across medical domain benchmarks. Tested on 4 fact verification benchmarks.
- **Novel beyond our system:** Heterogeneous tool assignment per agent (not all agents use same tools) + adaptive evidence retrieval that changes based on debate state. Our agents share the same tool set.

### Paper 6: Multi-agent Undercover Gaming: Hallucination Removal via Counterfactual Test
- **Authors:** Dayong Liang, Xiao-Yong Wei, Changmeng Zheng
- **Year:** 2025 (November 14, 2025)
- **Venue:** AAAI 2026
- **URL:** https://arxiv.org/abs/2511.11182
- **Multi-agent specific:** YES — core contribution
- **Key technique:** Reframes multi-agent debate (MAD) as a **social deduction game** — identifying "undercover" agents (those suffering from hallucinations) via counterfactual testing. Modified reference images introduce counterfactual evidence; agents that fail to detect changes are flagged as hallucinating.
- **Novel beyond our system:** Counterfactual probing — actively injecting modified evidence to test agent reliability rather than passively checking consistency. Goes beyond statistical consensus to active adversarial testing of each agent. Our system doesn't probe agents with known-false inputs to identify unreliable ones.

### Paper 7: Towards Detecting LLMs Hallucination via Markov Chain-based Multi-agent Debate Framework
- **Authors:** Xiaoxi Sun, Jinpeng Li, Yan Zhong, Dongyan Zhao, Rui Yan
- **Year:** 2024 (June 2024; relevant as foundation for 2025 work)
- **Venue:** arXiv (cs.CL)
- **URL:** https://arxiv.org/abs/2406.03075
- **Multi-agent specific:** YES
- **Key technique:** Markov Chain-based transitions between debate states. Multiple agents validate individual claims through flexible state transitions rather than fixed-round debates. Pipeline: claim detection → evidence retrieval → verification.
- **Empirical results:** Significant improvements over baselines across three generative tasks.
- **Novel beyond our system:** Probabilistic state transitions for debate — allows variable debate depth per claim based on convergence. Our system uses fixed verification passes.

### Paper 8: Guided and Knowledgeable Multi-Agent Debate for Fact Verification
- **Year:** 2025
- **URL:** https://www.researchgate.net/publication/396798589
- **Multi-agent specific:** YES
- **Key technique:** Guided debate with knowledge injection for fact verification. (Full details unavailable due to access restrictions.)

---

## Category 3: Consensus Mechanisms for Multi-Agent Fact Verification

### Paper 9: Minimizing Hallucinations and Communication Costs: Adversarial Debate and Voting Mechanisms in LLM-Based Multi-Agents
- **Authors:** (Published in Applied Sciences journal)
- **Year:** 2025
- **Venue:** Applied Sciences 15(7), 3676
- **URL:** https://www.mdpi.com/2076-3417/15/7/3676
- **Multi-agent specific:** YES — core contribution
- **Key technique:** Adversarial debate combined with voting mechanisms. Repetitive inquiries + error logs mitigate single-LLM hallucinations; adversarial debates + voting enable cross-verification among multiple agents. Also focuses on minimizing communication costs.
- **Novel beyond our system:** Formal voting mechanisms with communication cost optimization. Our system doesn't have explicit voting protocols or communication cost awareness.

### Paper 10: Mitigating LLM Hallucinations Using a Multi-Agent Framework
- **Authors:** Darwish, Ahmed M., Essam A. Rashed, Ghada Khoriba
- **Year:** 2025
- **Venue:** Information 16(7), 517
- **URL:** https://www.mdpi.com/2078-2489/16/7/517
- **Multi-agent specific:** YES
- **Key technique:** Rule-based logic constraints integrated with LLM reasoning in a multi-agent framework. Enforces deterministic response boundaries. Consultant-evaluator interaction pattern.
- **Empirical results:** **85.5% improvement in response consistency**. Most hallucinations resolved within first 2 cycles. Consultant-evaluator interaction constrained to 1-2 iterations (additional iterations offer minimal benefit).
- **Novel beyond our system:** Deterministic response boundaries via rule-based constraints layered on top of LLM agents. Our system uses probabilistic verification, not rule-based hard constraints.

---

## Category 4: Benchmarks and Empirical Studies

### Paper 11: HalluLens: LLM Hallucination Benchmark
- **Year:** 2025
- **Venue:** ACL 2025
- **URL:** https://arxiv.org/abs/2504.17550
- **Key contribution:** Unified taxonomy distinguishing intrinsic vs extrinsic hallucinations with standardized benchmark. Addresses lack of consensus on hallucination definitions.

### Paper 12: Mitigating LLM Hallucination via Behaviorally Calibrated Reinforcement Learning
- **Authors:** Jiayun Wu, Jiashuo Liu, Zhiyuan Zeng, Tianyang Zhan, Tianle Cai, Wenhao Huang
- **Year:** 2025 (December 2025; revised January 2026)
- **Venue:** arXiv (cs.LG)
- **URL:** https://arxiv.org/abs/2512.19920
- **Multi-agent specific:** NO — single-model technique
- **Key technique:** Behavioral calibration via RL with strictly proper scoring rules. Models learn to abstain when uncertain rather than hallucinate.
- **Empirical results:** Qwen3-4B with this method: Accuracy-to-Hallucination Ratio gain of **0.806** on BeyondAIME (vs GPT-5's 0.207). Zero-shot calibration error on par with Grok-4 and Gemini-2.5-Pro on SimpleQA.
- **Relevance:** Could be applied per-agent in multi-agent systems — each agent calibrated to express uncertainty rather than confabulate.

### Paper 13: Mitigating Hallucination in LLMs: Survey on RAG, Reasoning, and Agentic Systems
- **Authors:** Yihan Li, Xiyuan Fu, Ghanshyam Verma, Paul Buitelaar, Mingming Liu
- **Year:** 2025 (October 28, 2025)
- **Venue:** arXiv
- **URL:** https://arxiv.org/abs/2510.24476
- **Key contribution:** Taxonomy of knowledge-based vs logic-based hallucinations. Analyzes synergy between RAG + reasoning + agentic approaches.

---

## Summary: Techniques BEYOND Our Current System

| Technique | Paper | Status in Our System |
|-----------|-------|---------------------|
| **Information asymmetry** — verifier denied original context | MARCH (#1) | NOT implemented |
| **Structured communication protocols** (JSON, fault-tolerant) | Survey (#2) | NOT implemented |
| **Memory hallucination tracking** across extraction/update cycles | HaluMem (#3) | NOT implemented |
| **Reasoning-hallucination trade-off awareness** | Reasoning Trap (#4) | NOT implemented |
| **Heterogeneous tool assignment** per debating agent | Tool-MAD (#5) | NOT implemented |
| **Counterfactual probing** — inject known-false inputs to test agents | MUG (#6) | NOT implemented |
| **Probabilistic debate state transitions** (Markov chain) | MC-Debate (#7) | NOT implemented |
| **Formal voting + communication cost optimization** | Adversarial Debate (#9) | NOT implemented |
| **Deterministic rule-based response boundaries** | Multi-Agent Framework (#10) | NOT implemented |
| **Per-agent behavioral calibration** (abstain when uncertain) | Calibrated RL (#12) | NOT implemented |

---

## Top 5 Recommendations for Implementation Priority

1. **Information asymmetry verification** (MARCH) — Highest impact. Deliberately deny the verifier access to original output to prevent confirmation bias. Simple to implement, high theoretical grounding.

2. **Counterfactual probing** (MUG/AAAI 2026) — Actively test agent reliability by injecting known-modified evidence. Identifies which agents are hallucinating rather than just checking consistency.

3. **Heterogeneous tool assignment** (Tool-MAD) — Assign different tools/sources to different agents so they can't all make the same retrieval error. 5.5% accuracy gain demonstrated.

4. **Per-agent uncertainty calibration** (Behavioral RL) — Train or prompt agents to abstain when uncertain. Prevents confident hallucinations from entering the verification pipeline.

5. **Probabilistic debate depth** (MC-Debate) — Variable verification depth per claim based on convergence. Saves compute on easy claims, spends more on contested ones.

---

## Platforms Checked
- arxiv.org (primary)
- semanticscholar.org (via search, limited direct access)
- mdpi.com (Applied Sciences, Information journals)
- researchgate.net
- aclanthology.org (ACL proceedings)
- nature.com (Communications Medicine)
- sciencedirect.com (Expert Systems with Applications)
- frontiersin.org (Frontiers in AI)
