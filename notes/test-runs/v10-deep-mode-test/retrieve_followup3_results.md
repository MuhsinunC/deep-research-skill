# Phase 3 RETRIEVE — Follow-up Batch 3 Results
## Written: 2026-04-01

### Dr. Zero: Self-Evolving Search Agents without Training Data (arXiv:2601.07055, Jan 2026)
- **Key Innovation:** Self-evolution feedback loop (proposer + solver) — no training data needed
- **HRPO:** Hop-grouped Relative Policy Optimization — clusters structurally similar questions for efficient training
- **Results:** Matches or surpasses fully supervised agents. Up to 14.1% improvement over supervised baseline.
- **Meta Research (Facebook)** — open source on GitHub (non-commercial license)
- **Training-based:** YES (the self-evolution requires RL training). But the insight that complex search capabilities can emerge through self-evolution without curated data is theoretically interesting.
- **NOVEL for skill:** Limited direct applicability (training-based), but the "automated curriculum" concept (progressively harder tasks) could inspire a skill improvement: adaptive difficulty assessment during research.
- **Credibility:** 85/100 (Meta Research, Jan 2026, open source, strong results)

### Enterprise Deep Research (EDR) — Steerable MultiAgent (arXiv:2510.17797, Oct 2025)
- **Key Innovation:** Steerable multi-agent system with human-in-the-loop guidance
- **Architecture:** Master Planning Agent + 4 specialized search agents (General, Academic, GitHub, LinkedIn) + Visualization Agent + reflection mechanism
- **Reflection mechanism:** Detects knowledge gaps → updates research direction → optional human steering
- **MCP-based tool ecosystem:** NL2SQL, file analysis, enterprise workflows
- **Results:** 71.57% win rate vs OpenAI Deep Research, 6.82 avg score, only 9% lose rate
- **Prompting-based:** YES (Salesforce, prompting approach with Various models)
- **NOVEL for skill:** 
  1. Specialized search agents by source type (General, Academic, GitHub, LinkedIn) — the skill has heterogeneous LENSES but not specialized agents per search ENGINE/SOURCE
  2. Reflection mechanism that detects knowledge gaps mid-research and updates direction
  3. Human-in-the-loop steering (optional)
- **Credibility:** 80/100 (Salesforce Research, Oct 2025, open source, real enterprise deployment)

## Summary of ALL Novel Techniques Found (Not Already in Skill)

### Tier 1: Directly Applicable via Prompting (No Training Required)

1. **Rubric-Guided Verification with DRA Failure Taxonomy** (arXiv:2601.15808)
   - Structured failure taxonomy (5 categories, 13 sub-categories) as verification rubrics
   - 8-11% accuracy gains, 12-48% F1 improvement over vanilla judge
   
2. **CATTS: Confidence-Aware Test-Time Scaling** (arXiv:2602.12276)
   - Dynamic compute allocation based on decision uncertainty (entropy + margin)
   - 9.1% improvement, 2.3x token efficiency
   
3. **BATS: Budget-Aware Test-Time Scaling** (arXiv:2511.17006)
   - Budget Tracker plug-in + dynamic planning/verification adaptation
   - Pushes cost-performance Pareto frontier
   
4. **Multi-Agent Debate for Fact Verification** (arXiv:2601.04742)
   - Adversarial debate between agents for claim verification
   - Up to 35.5% improvement over standard approaches
   
5. **PIES Taxonomy / Process-Aware Trajectory Auditing** (arXiv:2601.22984)
   - Classify hallucinations by functional component x error property
   - Trajectory-level evaluation vs outcome-only
   
6. **WebWeaver Evidence-Linked Memory Bank** (arXiv:2509.13312)
   - Each outline section explicitly linked to evidence in structured memory
   - Hierarchical section-by-section writing with evidence retrieval

7. **ReSum Context Summarization** (arXiv:2509.13313)
   - Periodic context summarization for unbounded exploration
   - 4.5% training-free improvement

8. **Thread Control Blocks for Parallel Execution** (arXiv:2601.17879)
   - Iterative management of subthreads with isolated contexts
   - Outperforms sequential baselines on DeepResearch Bench

9. **Source-Specialized Search Agents** (arXiv:2510.17797)
   - Dedicated agents per source type (academic, code, general)
   - 71.57% win rate vs OpenAI Deep Research

10. **Search vs. Reasoning Balance** (arXiv:2602.22675)
    - Favor breadth of search over depth of reasoning
    - 70.7% reduction in reasoning steps with accuracy improvement

### Tier 2: Insights from Training-Based Work (Architecture Applicable)

11. **Over-search/Under-search Detection** (arXiv:2510.07794)
    - Metacognitive checks for search necessity
    - Reduced over-search from 27% to 2.3%

12. **Self-as-Verifier at Test Time** (arXiv:2603.28376)
    - Agent verifies its own outputs at inference (no separate verifier)
    - 8B model approaches 30B performance

13. **Automated Difficulty Curriculum** (arXiv:2601.07055)
    - Progressive task difficulty assessment
    - Self-evolving without training data
