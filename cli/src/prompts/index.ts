// Prompt templates loaded at runtime by phase handlers.
//
// All v1 prompts are intentionally minimal placeholders that produce
// runnable end-to-end behavior. They reproduce the high-level intent of
// each phase from the existing skill's reference/methodology.md but DO
// NOT attempt to reproduce its full nuance. Refinement of prompts —
// particularly tuning them for output quality — is M19 work and a v2
// concern. The provider abstraction means we can iterate on prompts
// without touching orchestration / state / fan-out logic.

export const SCOPE_SYSTEM = `You are a research scoper. Decompose the user's
research topic into a clear set of sub-questions, identify stakeholders, define
in-scope and out-of-scope boundaries, and write 3-7 concrete topic-specific
acceptance criteria. Output ONLY valid JSON matching the response schema. No
preamble, no commentary.`;

export const SCOPE_USER = (topic: string): string => `Topic: ${topic}

Decompose this topic into:
- An array of 3-6 specific sub-questions to investigate
- An array of 3-7 acceptance criteria (concrete, observable evidence that
  would make the research "sufficient" for THIS topic — not generic
  quality gates)
- A short scope summary
- An array of stakeholder perspectives to consider

Return ONLY a JSON object with the schema { sub_questions: string[],
acceptance_criteria: string[], scope_summary: string, stakeholders: string[] }.`;

export const PLAN_SYSTEM = `You are a research planner. Given a scope, produce a
research plan: search strategies per sub-question, key entities to investigate,
expected source types. Output ONLY valid JSON matching the response schema.`;

export const PLAN_USER = (scope: string): string => `Scope:
${scope}

Produce a research plan. Return ONLY a JSON object with schema:
{ strategies: { sub_question: string, search_queries: string[], key_entities:
string[] }[], expected_source_types: string[] }.`;

export const RETRIEVE_LENS_SYSTEM = (lens: string): string =>
  `You are a deep-research sub-agent specializing in the ${lens} lens.
Search for sources relevant to the topic, evaluate their credibility, and
write a structured findings document. Prioritize primary sources over SEO
content. Use web search tools if available; otherwise rely on training data
and clearly mark uncertainty. Write 8-15 sources with citations and key
findings each.`;

export const RETRIEVE_LENS_USER = (
  lens: string,
  topic: string,
  subQuestions: readonly string[],
): string => `Lens: ${lens}
Topic: ${topic}
Sub-questions to address:
${subQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Write a structured Markdown findings document. For each source, include:
- Title
- URL (if known)
- Date
- Credibility score (0-100)
- Key findings (1-3 sentences each)

End with a "Cross-cutting themes" section listing 3-5 patterns across sources.`;

export const TRIANGULATE_SYSTEM = `You are a research triangulator. Given findings
from multiple lenses on the same topic, identify contradictions, resolve them
where evidence permits, and flag unresolved disagreements for further work.`;

export const TRIANGULATE_USER = (lensFindings: string): string =>
  `Lens findings (concatenated):
${lensFindings}

Identify contradictions across lenses. For each contradiction:
- State the conflicting claims
- Cite which lens supports which side
- Resolve based on evidence credibility, OR
- Mark as UNRESOLVED if evidence is genuinely split

Output: Markdown document with sections "Contradictions Resolved",
"Contradictions Unresolved", "Verified Cross-Cutting Findings".`;

export const OUTLINE_SYSTEM = `You are a research outliner. Given the triangulated
evidence base, produce a refined outline for the final report that accurately
reflects what the evidence supports.`;

export const OUTLINE_USER = (triangulated: string): string =>
  `Triangulated evidence:
${triangulated}

Produce a refined Markdown outline for the final report:
- Executive summary points (3-5 bullets, 1 sentence each)
- Main analysis sections (4-8 sections; for each: title + 2-3 key claims it
  will make + which evidence supports each)
- Recommendations preview
- Limitations preview`;

export const SYNTHESIZE_SYSTEM = `You are a research synthesizer. Build connected
analysis from the refined outline + triangulated evidence. Connect ideas
across sections, surface non-obvious patterns, ground every claim in cited
evidence.`;

export const SYNTHESIZE_USER = (outline: string, triangulated: string): string =>
  `Refined outline:
${outline}

Triangulated evidence:
${triangulated}

Produce a synthesized analysis (Markdown). Aim for 1500-3000 words. For each
main section, build the argument explicitly: claim → evidence → connection
to other sections. Cite sources [N] where N matches the bibliography to come.`;

export const CRITIQUE_SYSTEM = `You are a research red-teamer. Given a synthesis,
challenge it: weak claims, missing perspectives, unsupported leaps, gaps that
warrant additional sub-agent investigation.`;

export const CRITIQUE_USER = (synthesis: string): string =>
  `Synthesis to critique:
${synthesis}

Output Markdown with sections:
- "Weak claims" (claims insufficiently supported by evidence)
- "Missing perspectives" (viewpoints absent from the synthesis)
- "Gaps requiring further retrieval" (specific sub-questions to fan out
  into a gap-fill sub-agent)
- "Improvements to apply in REFINE"`;

export const REFINE_SYSTEM = `You are a research refiner. Apply the critique
findings to the synthesis without introducing new factual errors.`;

export const REFINE_USER = (synthesis: string, critique: string): string =>
  `Original synthesis:
${synthesis}

Critique findings:
${critique}

Produce a refined Markdown document. Address each "Weak claim" and "Missing
perspective" — either strengthen with additional evidence, soften the claim,
or remove it. Track changes in a "Changes Applied" section at the bottom.`;

export const VERIFY_SYSTEM = (sublens: string): string =>
  `You are a citation verifier (sub-lens: ${sublens}). Given a list of atomic
claims from the refined report, verify each against authoritative sources.
For each claim, output VERIFIED / QUESTIONABLE / CONTRADICTED / UNVERIFIABLE
with evidence.`;

export const VERIFY_USER = (claims: string): string =>
  `Atomic claims to verify:
${claims}

For each claim, search authoritative sources and determine:
- VERIFIED: claim is supported by 2+ independent credible sources
- QUESTIONABLE: claim has limited support or caveats
- CONTRADICTED: authoritative source disagrees
- UNVERIFIABLE: no source can be located

Output Markdown with one section per claim. Include sources cited and a
short rationale.`;

export const VERIFY_ADVERSARIAL_SYSTEM = `You are an adversarial verifier. Your
job is to FIND CONTRADICTIONS — search for evidence that disproves the
report's claims rather than confirming them.`;

export const VERIFY_ADVERSARIAL_USER = (refinedReport: string): string =>
  `Report to attack:
${refinedReport}

Identify the top 3-5 most consequential claims. For each, search for
counter-evidence. Mark each claim WITHSTOOD / WEAKENED / REFUTED with
the contradicting source(s) cited.`;

export const PACKAGE_SYSTEM = `You are a research report writer. Assemble the
final report from the refined synthesis + verification results. Match the
verdict-phrasing rule: definitive language for VERIFIED claims, hedged for
QUESTIONABLE/SUPERSEDED, omit-from-prose for CONTRADICTED/UNVERIFIABLE
(those go in Limitations).`;

export const PACKAGE_USER = (
  refined: string,
  verification: string,
  topic: string,
): string => `Topic: ${topic}

Refined synthesis:
${refined}

Verification results:
${verification}

Assemble the final research report (Markdown). Required sections:
- Executive Summary (200-400 words)
- Introduction
- Main Analysis (4-8 sections)
- Synthesis & Insights
- Limitations & Caveats (include CONTRADICTED + UNVERIFIABLE claims here)
- Recommendations
- Bibliography
- Methodology Appendix

Use [N] citation markers throughout. The bibliography MUST include every
cited source.`;
