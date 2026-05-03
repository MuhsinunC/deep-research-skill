import { promises as fs } from "node:fs";
import { writeAtomicText } from "../state/atomic.js";
import { REFINE_SYSTEM, REFINE_USER } from "../prompts/index.js";
import type { PhaseContext, PhaseResult } from "./types.js";

export const phase07_refine = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info("Applying critique findings to synthesis");
  const synthesis = await fs.readFile(`${ctx.outputDir}/phase05_synthesize.md`, "utf8");
  const critique = await fs.readFile(`${ctx.outputDir}/phase06_critique.md`, "utf8");
  const response = await ctx.provider.callJudgment({
    systemPrompt: REFINE_SYSTEM,
    userPrompt: REFINE_USER(synthesis, critique),
    model: "opus",
    effort: "max",
  });
  await writeAtomicText(`${ctx.outputDir}/phase07_refine.md`, response.text);
  return { phase: "REFINE" };
};
