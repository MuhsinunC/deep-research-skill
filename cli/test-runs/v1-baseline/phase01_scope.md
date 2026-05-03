# Phase 1: SCOPE

**Topic:** How can the deep-research-cli project be improved? Focus on reliability, observability, provider portability, and prompt quality.

## Scope summary

Investigation into concrete improvements for the `deep-research-cli` project across four axes: reliability (failure handling, recovery, idempotent phases), observability (artifacts, telemetry, debuggability), provider portability (Claude Agent SDK vs OpenCode/OpenRouter parity, extension to new providers), and prompt quality (per-phase prompts, cross-provider consistency, evaluability). Excludes the sibling `deep-research` skill except where patterns transfer directly, and excludes positioning, marketing, or competitive analysis.

## Sub-questions

1. What are the actual failure modes of `deep-research-cli` today (provider timeouts, rate limits, malformed JSON, partial phase outputs, hung subprocesses) — sourced from existing test-run logs, code paths, and issue history — and which reliability primitives (retry-with-validation, checkpoint/resume, idempotent phase contracts, circuit breakers, dead-letter artifacts) yield the biggest run-success-rate uplift per unit of engineering effort?
2. What phase-level artifacts, structured logs, token/cost telemetry, and trace correlation does the CLI emit now, and what is the minimum addition that would let an operator fully diagnose a failed run from artifacts alone without re-running it?
3. Where does the provider abstraction leak Claude-Agent-SDK-specific or OpenCode/OpenRouter-specific assumptions into shared code, what would a clean provider interface look like (capability negotiation, tool-use shims, prompt-format translation), and what is the realistic effort to add a third provider such as Gemini or a local Ollama backend?
4. How are per-phase prompts currently authored, versioned, parameterized, and evaluated — what observable prompt-quality defects (instruction-following gaps, schema violations, fabricated citations, cross-provider drift) show up in test runs, and what evaluation harness would make prompt changes measurable rather than vibes-based?
5. Which proposed changes are compounding wins across all four axes (e.g., a typed per-phase IO contract that simultaneously enables retry-with-validation, structured artifacts, provider-agnostic prompts, and golden-set prompt evals) versus single-axis point fixes, and how should they be sequenced?
6. Which recommendations are backwards-compatible drop-ins vs. require a major version bump of the CLI/SDK contract, and what is a sensible release sequence that doesn't strand existing users mid-pipeline?

## Acceptance criteria

- [ ] **AC-1**: Concrete failure-mode inventory for `deep-research-cli` with frequency and severity grounded in existing test-run logs, source code, or issue tracker — not speculation or generic LLM-app failure lists.
- [ ] **AC-2**: Code-level findings (file paths, line ranges, function or class names) identifying at least three weak points each in reliability, observability, provider abstraction, and prompt-construction code paths.
- [ ] **AC-3**: Side-by-side capability matrix of Claude Agent SDK vs OpenCode/OpenRouter as used in the project, naming every concrete site where provider-specific behavior leaks into shared modules.
- [ ] **AC-4**: At least one worked example of an existing per-phase prompt diffed against a proposed improved version, with the rationale tied to a documented prompt-quality defect (not generic prompt-engineering advice).
- [ ] **AC-5**: Prioritized recommendations list where each item is tagged by axis (reliability / observability / portability / prompts), sized (S/M/L), scored on expected impact, and annotated with dependencies on other recommendations.
- [ ] **AC-6**: At least two prior-art systems referenced with concrete patterns to adopt or reject (e.g., Langfuse / OpenLLMetry for observability, LiteLLM / OpenRouter SDK / aisuite for portability, Promptfoo / DeepEval / inspect-ai for prompt evaluation), plus a one-line argument for fit.
- [ ] **AC-7**: Backwards-compatibility analysis classifying every recommendation as drop-in, additive-with-flag, or breaking change, with a suggested minor/major release sequence and migration notes for existing pipelines.

## Stakeholders

- Skill maintainer — wants a prioritized, effort-estimated backlog with no scope creep.
- End users running long-form research jobs — want fewer failed runs, predictable cost, recoverable mid-run failure.
- Power users on non-Claude providers (OpenCode / OpenRouter) — want feature and quality parity with the Claude path.
- Future contributors adding a new provider (Gemini, Ollama, Bedrock) — want a documented extension point rather than a refactor surface.
- Operators / SREs debugging failed runs post-hoc — need artifacts and structured logs sufficient to diagnose without re-execution.
- Prompt reviewers and evaluators — need an objective harness so prompt changes can be merged on evidence, not on taste.
- The sibling `deep-research` skill and broader GSD workflow integrators — benefit from reusable abstractions but should not be tightly coupled to the CLI's internal contracts.
