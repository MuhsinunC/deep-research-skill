// Phase 2 PLAN — Strategy Formulation.
// AI writes structured Markdown directly. No strict JSON validation.

import { promises as fs } from "node:fs";
import { writeAtomicText } from "../state/atomic.js";
import { PLAN_SYSTEM, PLAN_USER } from "../prompts/index.js";
import type { PhaseContext, PhaseResult } from "./types.js";

export const phase02_plan = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info("Building research plan");
  const scopeText = await fs.readFile(`${ctx.outputDir}/phase01_scope.md`, "utf8");
  const response = await ctx.provider.callJudgment({
    systemPrompt: PLAN_SYSTEM,
    userPrompt: PLAN_USER(scopeText),
    model: "opus",
    effort: "max",
  });
  const header = `# Phase 2: PLAN\n\n`;
  await writeAtomicText(`${ctx.outputDir}/phase02_plan.md`, header + response.text + "\n");
  return { phase: "PLAN" };
};
