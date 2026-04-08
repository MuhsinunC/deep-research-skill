# Research Plan: LLM-Based Claim Verification Systems

## Investigation Paths (Priority Order)

### Path 1: Architectures (Sub-Q1)
- Decompose-retrieve-verify pipelines (CRITIC, FactScore, FacTool)
- Multi-agent debate/deliberation frameworks
- Tool-grounded verification (web search, code execution, API calls)
- Hybrid approaches combining multiple patterns

### Path 2: Rubric-Guided Verification (Sub-Q2)
- Structured rubrics vs. free-form verification prompts
- DRA (Deep Research Assessment) rubric taxonomy
- Benchmark comparisons with quantitative results
- Overhead vs. accuracy tradeoff analysis

### Path 3: Adversarial vs. Confirmation (Sub-Q3)
- Refutation-based approaches (actively try to disprove)
- Confirmation-based approaches (try to verify)
- Head-to-head comparisons
- False positive/negative rate analysis

### Path 4: Temporal Decay (Sub-Q4)
- Evidence freshness impact on verification accuracy
- Real-time vs. cached knowledge bases
- Domain-specific temporal sensitivity
- Strategies for handling stale evidence

### Path 5: Failure Modes (Sub-Q5)
- Self-correction accuracy inversion (models change correct answers to wrong)
- Hallucination amplification through synthesis
- Confirmation bias in LLM verification
- Calibration problems (confident errors)

## Search Angles (Phase 3 Decomposition)

### Angle 1 — Semantic (core concept)
- "LLM-based claim verification fact-checking systems 2025 2026"
- "automated fact checking deep learning architecture"

### Angle 2 — Technical (specific terms)
- "decompose retrieve verify pipeline"
- "CRITIC framework tool-grounded verification"
- "FactScore claim decomposition"

### Angle 3 — Recent developments (date-filtered)
- "claim verification LLM 2026" 
- "fact checking AI system 2025 2026 benchmark"

### Angle 4 — Academic sources
- arXiv: "fact verification language model"
- Conference: "claim verification EMNLP ACL 2025 2026"

### Angle 5 — Alternative perspectives
- "multi-agent debate fact checking"
- "adversarial verification vs retrieval augmented"

### Angle 6 — Statistical/benchmark data
- "FEVER benchmark state of the art 2025 2026"
- "AVeriTeC benchmark results"
- "CorrectBench LLM self-correction"

### Angle 7 — Industry analysis
- "enterprise fact checking AI deployment"
- "automated claim verification production system"

### Angle 8 — Critical analysis/limitations
- "LLM self-correction failure"
- "fact checking AI limitations worse accuracy"
- "automated verification false confidence"

## Pro/Con Query Pairs (3-5 central sub-questions)

### SQ1: Tool-grounded verification effectiveness
- PRO: "tool-grounded verification improves LLM accuracy evidence"
- CON: "tool-grounded verification limitations overhead problems"

### SQ3: Adversarial vs confirmation approaches
- PRO: "adversarial refutation catches more errors fact checking"
- CON: "adversarial verification false positive rate problems"

### SQ5: LLM verification makes things worse
- PRO: "LLM self-correction improves accuracy evidence"  
- CON: "LLM self-correction decreases accuracy changes correct answers wrong"

## Sub-Agent Lens Assignments (Phase 3 Step 2)

| Agent | Lens | Focus |
|-------|------|-------|
| A | Academic/Formal | arXiv papers, conference proceedings, formal benchmarks |
| B | Practitioner/Applied | Open-source implementations, tutorials, real-world deployments |
| C | Critical/Adversarial | Failure modes, limitations, negative results, criticism |
| D | Historical/Foundational | Seminal works (FEVER, CRITIC, FactScore), evolution of approaches |

## Quality Gates
- 25+ sources, avg credibility >70/100
- 3+ source types
- Pro/con evidence for all 5 sub-questions
- Maximum 10 minutes on Phase 3 retrieval
