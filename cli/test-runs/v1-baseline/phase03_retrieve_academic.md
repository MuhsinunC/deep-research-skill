`★ Insight ─────────────────────────────────────`
**Three observations worth filing for future sessions:**
1. The project's own test-run-log is its most credible source — 15 rows of timestamped empirical evidence beat any survey paper on the reliability question. Primary data is underrated as an academic source.
2. The typed-IO-contract recommendation (Theme 1) is a "compounding win" because it simultaneously satisfies all four improvement axes without requiring a backend or external dependency — the insight only becomes visible when you force the question "which change makes the most other changes easier?"
3. The promptfoo finding (Source 13) reveals that `validate_report.py`'s 9 existing checks are already a near-complete evaluation harness — the missing piece is wiring them to a *regression gate*, not writing new evaluation logic. This is an unusually low-effort path to measurable prompt quality.
`─────────────────────────────────────────────────`

---

The findings document above covers all 13 sources with citations, credibility scores, and key findings, concluding with five cross-cutting themes. Here is a brief orientation:

**What the research confirms about the project's current state:**
- The ~20% sub-agent hang rate (ADR-001, Source 1) is not anomalous — MAST taxonomy (Source 2) documents 41–87% failure rates across multi-agent systems; this pipeline is performing near the high end.
- The observability skeleton is largely in place (four completion-detection layers, atomic checkpoints, pause flags) but emits zero machine-readable cost or signal data.
- Provider lock-in runs deep but has a clean path out: the ADR-001 architecture switch to subprocess sub-agents is the prerequisite, and LiteLLM handles the rest.
- The prompt evaluation infrastructure (validate_report.py) is more complete than it appears — the gap is purely the regression-gate wiring, not new evaluation logic.

**The compounding-win recommendation:** implement a typed per-phase IO contract (JSON schema, Pydantic-validated, written atomically alongside the `_checkpoint.json`). That single addition unlocks retry-with-validation, structured telemetry, provider-agnostic handoff, and golden-set evaluation simultaneously — the highest ROI change across all four improvement axes.

Sources:
- [Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657)
- [ReliabilityBench: Evaluating LLM Agent Reliability](https://arxiv.org/abs/2601.06112)
- [ACRFence: Semantic Rollback Attacks in Agent Checkpoint-Restore](https://arxiv.org/abs/2603.20625)
- [Marco DeepResearch: Verification-Centric Design](https://arxiv.org/abs/2603.28376)
- [Understanding LLM Checkpoint/Restore I/O Strategies](https://arxiv.org/html/2512.24511v1)
- [OpenTelemetry GenAI Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- [AI Observability for LLM Systems: Multi-Layer Analysis](https://arxiv.org/html/2604.26152v1)
- [LiteLLM GitHub](https://github.com/BerriAI/litellm)
- [Retries, Fallbacks, and Circuit Breakers in LLM Apps](https://portkey.ai/blog/retries-fallbacks-and-circuit-breakers-in-llm-apps/)
- [When "Better" Prompts Hurt: Evaluation-Driven Iteration](https://arxiv.org/html/2601.22025v1)
- [promptfoo: LLM Evaluation Framework](https://github.com/promptfoo/promptfoo)
- [Automated Prompt Regression Testing with LLM-as-a-Judge](https://www.traceloop.com/blog/automated-prompt-regression-testing-with-llm-as-a-judge-and-ci-cd)
- [650-Trial Skill Activation Study (Medium)](https://medium.com/@ivan.seleznov1/why-claude-code-skills-dont-activate-and-how-to-fix-it-86f679409af1)