# Phase 3 RETRIEVE — Step 1 Parallel Search Results
## Written: 2026-04-01

### Key Frameworks Discovered

1. **Tongyi DeepResearch** — BrowseComp 43.4, BrowseComp-ZH 46.7, HLE 32.9. Open-source. Multi-agent.
   - URL: https://tongyi-agent.github.io/blog/introducing-tongyi-deep-research/

2. **MiroThinker** — Multiple versions: v1.0-72B (47.1% BrowseComp), v1.5-30B, v1.7 (74.0), H1 (88.2 BrowseComp)
   - URL: https://github.com/MiroMindAI/MiroThinker
   - Paper: https://arxiv.org/abs/2511.11793
   - Also: MiroFlow (web UI, top-1 on 5+ benchmarks): https://github.com/MiroMindAI/miroflow

3. **Marco DeepResearch** — 8B-scale, verification-centric design. Outperforms 30B agents on BrowseComp-ZH.
   - Paper: https://arxiv.org/abs/2603.28376
   - Key technique: Verified QA synthesis, verification-driven trajectory construction, verifier-guided test-time scaling

4. **DeepAgent (RUC-NLPIR)** — WWW 2026 paper. Scalable toolsets (16,000+ RapidAPIs). 91.69% on GAIA.
   - URL: https://github.com/RUC-NLPIR/DeepAgent
   - Also topped BrowseComp-Plus via openJiuwen project

5. **Open Deep Research (LangChain)** — Configurable, multi-provider, MCP-compatible. Score 0.4344 on Deep Research Bench.
   - URL: https://github.com/langchain-ai/open_deep_research

6. **DeepResearchAgent (SkyworkAI)** — Hierarchical multi-agent. Top-level planner + specialized lower-level agents.
   - URL: https://github.com/SkyworkAI/DeepResearchAgent

7. **Auto-Deep-Research (HKUDS)** — Cost-efficient alternative based on AutoAgent framework.
   - URL: https://github.com/HKUDS/Auto-Deep-Research

8. **DeepResearcher (GAIR)** — End-to-end training of LLM-based research agents via scaling RL.
   - Likely training-based (OUT OF SCOPE for prompt techniques but relevant for benchmark context)

### Key Papers Discovered

1. **Self-Manager: Parallel Agent Loop for Long-form Deep Research** (arXiv:2601.17879, Jan 2026)
   - Parallel agent loop with async execution, Thread Control Blocks for managing subthreads
   - NOVEL: Parallel context isolation via Thread Control Blocks

2. **Inference-Time Scaling of Verification** (arXiv:2601.15808, Jan 2026)
   - Self-evolving agents via test-time rubric-guided verification
   - Agents self-improve by evaluating generated answers with rubrics
   - NOVEL: Rubric-guided verification scaling at inference time

3. **How to Train Your Deep Research Agent? (Search-R1)** (arXiv:2602.19526, Feb 2026)
   - Systematic study: prompt template, reward function, policy optimization
   - Training-based but prompt template insights may be applicable

4. **O-Researcher** (arXiv:2601.03743, Jan 2026)
   - Multi-agent workflow, collaborative tool-integrated reasoning
   - Two-stage training (SFT + RL). Training-based.

5. **Why Your Deep Research Agent Fails? On Hallucination...** (arXiv:2601.22984, Jan 2026)
   - Failure analysis paper. Three failure dimensions: Reasoning (28.14%), Retrieval (33.10%), Generation (38.76%)
   - CRITICAL for understanding where improvements matter most

6. **How Far Are We from Genuinely Useful Deep Research Agents?** (arXiv:2512.01948)
   - Benchmark/evaluation paper. Assesses gap between benchmarks and real utility.

7. **ReVeal: Generation-Verification Framework** (ICLR 2026)
   - Turn-Aware Policy Optimization (TAPO), treats verification as optimization target
   - Training-based but architecture insights applicable

8. **Agentic Test-Time Scaling for WebAgents** (arXiv:2602.12276, Feb 2026)
   - Arbiter-based voting replacing frequency voting
   - NOVEL: Arbiter model for test-time scaling, consistent improvement over majority voting

9. **Search More, Think Less** (arXiv:2602.22675, Feb 2026)
   - Rethinking long-horizon agentic search — favoring more searches over more reasoning

10. **Deep Research Bench** (GitHub: Ayanami0730/deep_research_bench)
    - NEW BENCHMARK: Comprehensive benchmark specifically for deep research agents
    - URL: https://github.com/Ayanami0730/deep_research_bench

11. **BrowseComp-Plus** (GitHub: texttron/BrowseComp-Plus)
    - NEW BENCHMARK: More fair and transparent evaluation of deep research agents
    - URL: https://github.com/texttron/BrowseComp-Plus

### Benchmark Landscape Summary

| Benchmark | Description | Top Performer |
|-----------|-------------|---------------|
| BrowseComp | 1,266 hard web browsing questions (OpenAI) | MiroThinker-H1: 88.2 |
| BrowseComp-Plus | More fair/transparent version | DeepAgent (openJiuwen) |
| BrowseComp-ZH | Chinese version | MiroThinker-v1.5-30B |
| GAIA | General AI assistant tasks | DeepAgent: 91.69% |
| Deep Research Bench | Comprehensive research agent eval | Multiple |
| HLE (Humanity's Last Exam) | Academic reasoning | Tongyi: 32.9 |

### Failure Analysis (from arXiv:2601.22984)
- Reasoning failures: 28.14%
- Retrieval failures: 33.10%  
- Generation failures: 38.76%
- Key insight: Agents struggle most with evidence synthesis, not instruction understanding

### Reliability Concerns
- 85% per-action accuracy → 20% success on 10-step workflow (compound failure)
- Citation accuracy improving but subtle errors persist
- Non-deterministic behavior makes debugging hard
- English/Western bias in retrieved sources
