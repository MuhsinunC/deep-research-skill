import { promises as fs } from "node:fs";
import { writeAtomicText } from "../state/atomic.js";
import { OUTLINE_SYSTEM, OUTLINE_USER } from "../prompts/index.js";
import type { PhaseContext, PhaseResult } from "./types.js";

export const phase04_5_outline = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info("Refining outline based on triangulated evidence");
  const triangulated = await fs.readFile(
    `${ctx.outputDir}/phase04_triangulate.md`,
    "utf8",
  );
  const response = await ctx.provider.callJudgment({
    systemPrompt: OUTLINE_SYSTEM,
    userPrompt: OUTLINE_USER(triangulated),
    model: "opus",
    effort: "max",
  });
  await writeAtomicText(`${ctx.outputDir}/phase04_5_outline.md`, response.text);
  return { phase: "OUTLINE_REFINEMENT" };
};
