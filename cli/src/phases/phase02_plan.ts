import { z } from "zod/v4";
import { promises as fs } from "node:fs";
import { writeAtomicText } from "../state/atomic.js";
import { PLAN_SYSTEM, PLAN_USER } from "../prompts/index.js";
import type { PhaseContext, PhaseResult } from "./types.js";

const PlanSchema = z.object({
  strategies: z.array(
    z.object({
      sub_question: z.string(),
      search_queries: z.array(z.string()),
      key_entities: z.array(z.string()),
    }),
  ),
  expected_source_types: z.array(z.string()),
});

export const phase02_plan = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info("Building research plan");
  const scopeText = await fs.readFile(`${ctx.outputDir}/phase01_scope.md`, "utf8");
  const response = await ctx.provider.callJudgment({
    systemPrompt: PLAN_SYSTEM,
    userPrompt: PLAN_USER(scopeText),
    model: "opus",
    effort: "max",
    responseSchema: PlanSchema,
  });
  const parsed = response.parsed as z.infer<typeof PlanSchema>;
  const md = renderPlanMd(parsed);
  await writeAtomicText(`${ctx.outputDir}/phase02_plan.md`, md);
  return { phase: "PLAN" };
};

function renderPlanMd(plan: z.infer<typeof PlanSchema>): string {
  const strategies = plan.strategies
    .map(
      (s, i) =>
        `### Strategy ${i + 1}: ${s.sub_question}\n\n` +
        `**Search queries:**\n${s.search_queries.map((q) => `- \`${q}\``).join("\n")}\n\n` +
        `**Key entities:**\n${s.key_entities.map((e) => `- ${e}`).join("\n")}`,
    )
    .join("\n\n");
  return [
    `# Phase 2: PLAN`,
    "",
    `## Strategies`,
    "",
    strategies,
    "",
    `## Expected source types`,
    "",
    ...plan.expected_source_types.map((t) => `- ${t}`),
    "",
  ].join("\n");
}
