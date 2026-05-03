// Phase 1 SCOPE — Research Framing.
// AI judgment call. Code writes the canonical artifact atomically.

import { z } from "zod/v4";
import { writeAtomicText } from "../state/atomic.js";
import { SCOPE_SYSTEM, SCOPE_USER } from "../prompts/index.js";
import type { PhaseContext, PhaseResult } from "./types.js";

const ScopeSchema = z.object({
  sub_questions: z.array(z.string()).min(1),
  acceptance_criteria: z.array(z.string()).min(1),
  scope_summary: z.string(),
  stakeholders: z.array(z.string()),
});

export const phase01_scope = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info("Framing research question and defining boundaries");
  const response = await ctx.provider.callJudgment({
    systemPrompt: SCOPE_SYSTEM,
    userPrompt: SCOPE_USER(ctx.topic),
    model: "opus",
    effort: "max",
    responseSchema: ScopeSchema,
  });
  const parsed = response.parsed as z.infer<typeof ScopeSchema>;
  const md = renderScopeMd(ctx.topic, parsed);
  await writeAtomicText(`${ctx.outputDir}/phase01_scope.md`, md);
  return {
    phase: "SCOPE",
    checkpointExtra: {
      sub_question_count: parsed.sub_questions.length,
      acceptance_criteria_count: parsed.acceptance_criteria.length,
    },
  };
};

function renderScopeMd(topic: string, scope: z.infer<typeof ScopeSchema>): string {
  return [
    `# Phase 1: SCOPE`,
    "",
    `**Topic:** ${topic}`,
    "",
    `## Scope summary`,
    "",
    scope.scope_summary,
    "",
    `## Sub-questions`,
    "",
    ...scope.sub_questions.map((q, i) => `${i + 1}. ${q}`),
    "",
    `## Acceptance criteria`,
    "",
    ...scope.acceptance_criteria.map((c, i) => `- [ ] **AC-${i + 1}**: ${c}`),
    "",
    `## Stakeholders`,
    "",
    ...scope.stakeholders.map((s) => `- ${s}`),
    "",
  ].join("\n");
}
