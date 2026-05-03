import { promises as fs } from "node:fs";
import { writeAtomicText } from "../state/atomic.js";
import { CRITIQUE_SYSTEM, CRITIQUE_USER } from "../prompts/index.js";
import type { PhaseContext, PhaseResult } from "./types.js";

export const phase06_critique = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info("Red-team analysis of synthesis");
  const synthesis = await fs.readFile(`${ctx.outputDir}/phase05_synthesize.md`, "utf8");
  const response = await ctx.provider.callJudgment({
    systemPrompt: CRITIQUE_SYSTEM,
    userPrompt: CRITIQUE_USER(synthesis),
    model: "opus",
    effort: "max",
  });
  await writeAtomicText(`${ctx.outputDir}/phase06_critique.md`, response.text);
  return { phase: "CRITIQUE" };
};
