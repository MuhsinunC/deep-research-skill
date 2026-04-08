# V2 Deep Research Skill - Improvement Research Findings

## Search 1: LLM Self-Correction Research

Sources:
- [CorrectBench (2025)](https://correctbench.github.io/)
- [When Can LLMs Actually Correct Their Own Mistakes? (MIT Press)](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00713/125177/)
- [CRITIC: Self-Correct with Tool-Interactive Critiquing](https://openreview.net/forum?id=Sx038qxjek)
- [S2R: Self-verify and Self-correct via RL](https://aclanthology.org/2025.acl-long.1104/)

Key findings:
1. Self-correction works best with **external feedback** (tool results, search verification), NOT internal self-review alone
2. Models have a "blind spot" — highly proficient at correcting errors pointed out by users, but poor at catching their own reasoning mistakes
3. CRITIC framework: interleaving tool use (search, code execution) with self-critique significantly improves accuracy vs pure self-reflection
4. Hybrid approaches (mixing strategies) improve accuracy ~5.2% but cost ~40% more time
5. "Wait" token appending reduces blind spots by 89.3% — giving the model time to reconsider

**Implication for our skill:** Phase 7.5 SELF-EVALUATE should use tool-based verification (WebFetch to re-check cited URLs), not just internal reflection. Pure self-scoring without external grounding is unreliable.

## Search 2: Context Compaction Workarounds

Sources:
- [Context Buffer Management (claudefa.st)](https://claudefa.st/blog/guide/mechanics/context-buffer-management)
- [Context Recovery Hook (Medium)](https://medium.com/coding-nexus/context-recovery-hook-for-claude-code-never-lose-work-to-compaction-7ee56261ee8f)
- [Dev Docs Method (chudi.dev)](https://chudi.dev/blog/claude-context-management-dev-docs)
- [Compaction API Docs](https://platform.claude.com/docs/en/build-with-claude/compaction)

Key findings:
1. Context buffer reduced to ~33K tokens (16.5%) as of early 2026
2. Plans and To-Do items persist across compaction — use them for critical state
3. Dev docs method: plan.md + context.md + tasks.md capture everything needed to resume
4. CLAUDE.md compaction instructions can preserve specific context
5. 1M context window now available for Opus 4.6 with no pricing premium

**Implication for our skill:** Our checkpoint protocol is good but should also leverage CLAUDE.md compaction instructions and the task/plan persistence features as backup.
