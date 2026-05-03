// Phase 3 RETRIEVE — parallel sub-agent fan-out across heterogeneous lenses.
// Per C4: each sub-agent writes its artifact via the provider's per-sub-agent
// disk-write contract BEFORE fanOut resolves. Granularity 2 resume on kill
// mid-batch is supported via Disk-Truth Reconciliation.

import { promises as fs } from "node:fs";
import { writeSubAgentProgress } from "../state/subagent_progress.js";
import {
  RETRIEVE_LENS_SYSTEM,
  RETRIEVE_LENS_USER,
} from "../prompts/index.js";
import type { PhaseContext, PhaseResult } from "./types.js";
import type { SubAgentSpec } from "../providers/types.js";

const ALL_LENSES: readonly string[] = [
  "academic",
  "practitioner",
  "critical",
  "historical",
  "scientific",  // ultradeep adds this
  "regulatory",  // ultradeep adds this
];

export const phase03_retrieve = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info(
    `Spawning ${ctx.intensity.retrieveLensCount} parallel retrieval sub-agents`,
  );

  // Read scope to extract sub-questions for the user-prompt context.
  const scopeText = await fs.readFile(`${ctx.outputDir}/phase01_scope.md`, "utf8");
  const subQuestions = extractSubQuestions(scopeText);

  const lenses = ALL_LENSES.slice(0, ctx.intensity.retrieveLensCount);
  const agents: SubAgentSpec[] = lenses.map((lens) => ({
    name: lens,
    systemPrompt: RETRIEVE_LENS_SYSTEM(lens),
    userPrompt: RETRIEVE_LENS_USER(lens, ctx.topic, subQuestions),
    model: "sonnet",
    outputFile: `${ctx.outputDir}/phase03_retrieve_${lens}.md`,
    tools: ["web_search"],
    effort: "high",
  }));

  // Skip already-complete sub-agents (Granularity 2 resume support).
  const remaining: SubAgentSpec[] = [];
  const alreadyComplete: string[] = [];
  for (const agent of agents) {
    try {
      const stat = await fs.stat(agent.outputFile);
      if (stat.size > 0) {
        alreadyComplete.push(agent.name);
        continue;
      }
    } catch {
      // File doesn't exist — agent needs to run.
    }
    remaining.push(agent);
  }

  if (alreadyComplete.length > 0) {
    ctx.log.info(
      `Skipping ${alreadyComplete.length} already-complete lens(es): ${alreadyComplete.join(", ")}`,
    );
  }

  if (remaining.length > 0) {
    const response = await ctx.provider.fanOut({
      agents: remaining,
      timeoutMs: 15 * 60 * 1000, // 15 min per sub-agent
    });
    const successful = response.results.filter((r) => r.fileWritten).map((r) => r.name);
    const failed = response.results.filter((r) => !r.fileWritten);
    if (failed.length > 0) {
      ctx.log.warn(
        `${failed.length} sub-agent(s) failed: ${failed.map((f) => `${f.name} (${f.status})`).join(", ")}`,
      );
    }
    await writeSubAgentProgress({
      outputDir: ctx.outputDir,
      phase: "RETRIEVE",
      expectedSubAgents: lenses,
      completedSubAgents: [...alreadyComplete, ...successful],
    });
  } else {
    await writeSubAgentProgress({
      outputDir: ctx.outputDir,
      phase: "RETRIEVE",
      expectedSubAgents: lenses,
      completedSubAgents: alreadyComplete,
    });
  }

  return {
    phase: "RETRIEVE",
    checkpointExtra: {
      lens_count: lenses.length,
      lenses,
    },
  };
};

function extractSubQuestions(scopeText: string): readonly string[] {
  // Naive parser: grab bullet lines under "## Sub-questions". If not found,
  // return empty array — the lens prompt still works without sub-questions.
  const match = scopeText.match(/## Sub-questions\n\n([\s\S]+?)\n\n##/);
  if (match === null) return [];
  const body = match[1];
  if (body === undefined) return [];
  const lines = body.split("\n").filter((l) => /^\d+\.\s/.test(l));
  return lines.map((l) => l.replace(/^\d+\.\s+/, "").trim());
}
