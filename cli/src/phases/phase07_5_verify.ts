// Phase 7.5 VERIFY — citation verification + adversarial refutation.
// Steps 1-4 only; Steps 5 (Temporal Supersession) and 6 (Verifier-Guided
// Retry) are deferred to v2 per C3 in PLAN.md.

import { promises as fs } from "node:fs";
import { writeSubAgentProgress } from "../state/subagent_progress.js";
import {
  VERIFY_SYSTEM,
  VERIFY_USER,
  VERIFY_ADVERSARIAL_SYSTEM,
  VERIFY_ADVERSARIAL_USER,
} from "../prompts/index.js";
import type { PhaseContext, PhaseResult } from "./types.js";
import type { SubAgentSpec } from "../providers/types.js";

export const phase07_5_verify = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info(
    `Spawning ${ctx.intensity.verifyVerifierCount} citation verifier(s) + 1 adversarial`,
  );
  const refined = await fs.readFile(`${ctx.outputDir}/phase07_refine.md`, "utf8");
  // Naive claim extraction: split refined report into atomic claims by paragraph
  // boundaries containing citation markers. M19 will refine this.
  const claims = extractAtomicClaims(refined);
  const claimsText = claims.length > 0
    ? claims.map((c, i) => `Claim ${i + 1}: ${c}`).join("\n\n")
    : "No atomic claims extracted from refined report.";

  const verifierAgents: SubAgentSpec[] = [];
  const expectedNames: string[] = [];
  for (let i = 1; i <= ctx.intensity.verifyVerifierCount; i++) {
    const name = `citation_${i}`;
    expectedNames.push(name);
    verifierAgents.push({
      name,
      systemPrompt: VERIFY_SYSTEM(name),
      userPrompt: VERIFY_USER(claimsText),
      model: "sonnet",
      outputFile: `${ctx.outputDir}/phase07_5_verify_${name}.md`,
      tools: ["web_search"],
      effort: "high",
    });
  }
  // Adversarial agent (always one)
  expectedNames.push("adversarial");
  verifierAgents.push({
    name: "adversarial",
    systemPrompt: VERIFY_ADVERSARIAL_SYSTEM,
    userPrompt: VERIFY_ADVERSARIAL_USER(refined),
    model: "sonnet",
    outputFile: `${ctx.outputDir}/phase07_5_verify_adversarial.md`,
    tools: ["web_search"],
    effort: "high",
  });

  const response = await ctx.provider.fanOut({
    agents: verifierAgents,
    timeoutMs: 15 * 60 * 1000,
  });
  const successful = response.results.filter((r) => r.fileWritten).map((r) => r.name);
  await writeSubAgentProgress({
    outputDir: ctx.outputDir,
    phase: "VERIFY",
    expectedSubAgents: expectedNames,
    completedSubAgents: successful,
  });

  // Loop-back decision: M19 will implement DRA aggregation + claim-level
  // contradiction count. For v1 placeholder, never loop back automatically;
  // operators can manually re-run by deleting verify artifacts and resuming.
  return {
    phase: "VERIFY",
    checkpointExtra: {
      verifier_count: ctx.intensity.verifyVerifierCount,
      adversarial_present: true,
      claims_extracted: claims.length,
      temporal_supersession: { skipped: "v2-deferred" },
      verifier_retry: { skipped: "v2-deferred" },
    },
  };
};

function extractAtomicClaims(refined: string): readonly string[] {
  // Placeholder extraction: paragraphs containing citation markers like [N].
  // M19 will replace this with a proper structural pass.
  const paragraphs = refined.split(/\n\n+/);
  return paragraphs.filter((p) => /\[\d+\]/.test(p)).map((p) => p.trim());
}
