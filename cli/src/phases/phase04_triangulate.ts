import { promises as fs } from "node:fs";
import { writeAtomicText } from "../state/atomic.js";
import { TRIANGULATE_SYSTEM, TRIANGULATE_USER } from "../prompts/index.js";
import type { PhaseContext, PhaseResult } from "./types.js";

export const phase04_triangulate = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info("Cross-referencing lens findings to identify contradictions");
  const lensFindings = await readAllLensFindings(ctx.outputDir);
  const response = await ctx.provider.callJudgment({
    systemPrompt: TRIANGULATE_SYSTEM,
    userPrompt: TRIANGULATE_USER(lensFindings),
    model: "opus",
    effort: "max",
  });
  await writeAtomicText(`${ctx.outputDir}/phase04_triangulate.md`, response.text);
  return { phase: "TRIANGULATE" };
};

async function readAllLensFindings(outputDir: string): Promise<string> {
  const entries = await fs.readdir(outputDir);
  const lensFiles = entries
    .filter((n) => n.startsWith("phase03_retrieve_") && n.endsWith(".md"))
    .sort();
  const sections: string[] = [];
  for (const f of lensFiles) {
    const content = await fs.readFile(`${outputDir}/${f}`, "utf8");
    sections.push(`--- ${f} ---\n\n${content}`);
  }
  return sections.join("\n\n");
}
