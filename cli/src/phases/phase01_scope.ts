// Phase 1 SCOPE — Research Framing.
//
// AI writes structured Markdown directly (no strict JSON schema). Downstream
// phases (especially Phase 3 RETRIEVE which extracts sub-questions) parse
// the Markdown lightly via regex. This is more robust to LLM variability
// than strict JSON parsing — matches how the existing prompt-driven skill
// works.

import { writeAtomicText } from "../state/atomic.js";
import { SCOPE_SYSTEM, SCOPE_USER } from "../prompts/index.js";
import type { PhaseContext, PhaseResult } from "./types.js";

export const phase01_scope = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info("Framing research question and defining boundaries");
  const response = await ctx.provider.callJudgment({
    systemPrompt: SCOPE_SYSTEM,
    userPrompt: SCOPE_USER(ctx.topic),
    model: "opus",
    effort: "max",
  });
  // Save AI's Markdown directly. Phase 3 will regex-extract sub-questions.
  const header = `# Phase 1: SCOPE\n\n**Topic:** ${ctx.topic}\n\n`;
  await writeAtomicText(`${ctx.outputDir}/phase01_scope.md`, header + response.text + "\n");
  return {
    phase: "SCOPE",
    checkpointExtra: {
      response_tokens: response.usage.output,
    },
  };
};
