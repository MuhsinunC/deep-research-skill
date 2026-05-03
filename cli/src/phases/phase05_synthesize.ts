import { promises as fs } from "node:fs";
import { writeAtomicText } from "../state/atomic.js";
import { SYNTHESIZE_SYSTEM, SYNTHESIZE_USER } from "../prompts/index.js";
import type { PhaseContext, PhaseResult } from "./types.js";

export const phase05_synthesize = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info("Building synthesized analysis");
  const outline = await fs.readFile(`${ctx.outputDir}/phase04_5_outline.md`, "utf8");
  const triangulated = await fs.readFile(
    `${ctx.outputDir}/phase04_triangulate.md`,
    "utf8",
  );
  const response = await ctx.provider.callJudgment({
    systemPrompt: SYNTHESIZE_SYSTEM,
    userPrompt: SYNTHESIZE_USER(outline, triangulated),
    model: "opus",
    effort: "max",
  });
  await writeAtomicText(`${ctx.outputDir}/phase05_synthesize.md`, response.text);
  return { phase: "SYNTHESIZE" };
};
