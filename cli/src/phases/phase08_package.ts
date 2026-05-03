// Phase 8 PACKAGE — strict ordering rule (per Bug 7 + PLAN.md):
// 1. Write report markdown
// 2. Write provenance sidecar
// 3. Generate HTML/PDF (subprocess)
// 4. Update research-tasks-cli.json → complete
// 5. Update _checkpoint.json → status: complete
// 6. Write _DONE LAST
// Each step uses atomic writes; _DONE has the most-recent mtime by construction.

import { promises as fs } from "node:fs";
import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { writeAtomicText } from "../state/atomic.js";
import { writeCheckpoint } from "../state/checkpoint.js";
import { writeDone } from "../state/done.js";
import { markTaskComplete } from "../state/tasks_registry.js";
import { utcNowIso } from "../util/time.js";
import { PACKAGE_SYSTEM, PACKAGE_USER } from "../prompts/index.js";
import type { PhaseContext, PhaseResult } from "./types.js";
import { slugify } from "../util/slug.js";

export const phase08_package = async (ctx: PhaseContext): Promise<PhaseResult> => {
  ctx.log.info("Generating final report (Phase 8 strict ordering)");

  // Step 1: write report markdown (AI judgment → atomic write).
  // Use the LATEST available pre-PACKAGE artifact as the synthesis input.
  // In `deep` and `ultradeep` modes that's phase07_refine.md. In `standard`
  // mode it's phase05_synthesize.md. In `quick` mode it's the concatenation
  // of phase03_retrieve_*.md (no synthesis phase ran). Per C-4 in M19 review.
  const refined = await readBestSynthesisInput(ctx);
  const verification = await readVerifyArtifacts(ctx.outputDir);
  const response = await ctx.provider.callJudgment({
    systemPrompt: PACKAGE_SYSTEM,
    userPrompt: PACKAGE_USER(refined, verification, ctx.topic),
    model: "opus",
    effort: "max",
  });
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const slug = slugify(ctx.topic);
  const reportPath = `${ctx.outputDir}/research_report_${date}_${slug}.md`;
  await writeAtomicText(reportPath, response.text);
  ctx.log.info(`Wrote report: ${reportPath}`);

  // Step 2: provenance sidecar.
  const provenancePath = reportPath.replace(/\.md$/, ".provenance.md");
  await writeAtomicText(provenancePath, renderProvenance(ctx, response.usage));
  ctx.log.info(`Wrote provenance: ${provenancePath}`);

  // Step 3: HTML/PDF generation (subprocess to existing skill's md_to_html.py).
  // Per I1 in PLAN.md: hard runtime dependency on the existing skill being
  // deployed. If the script is missing, we log a warning and continue —
  // ancillary artifacts (HTML/PDF) are nice-to-have, not blocking.
  const htmlScript = join(homedir(), ".claude/skills/deep-research/scripts/md_to_html.py");
  try {
    await fs.access(htmlScript);
    await runHtmlGenerator(htmlScript, reportPath, ctx);
  } catch {
    ctx.log.warn(
      `HTML/PDF generator not found at ${htmlScript} — skipping ancillary artifacts. ` +
        `Markdown report is complete. Install the deep-research skill for HTML/PDF support.`,
    );
  }

  // Step 4: research-tasks-cli.json → complete.
  await markTaskComplete(ctx.uuid8);
  ctx.log.info("Marked task complete in registry");

  // Step 5: _checkpoint.json → status: complete.
  await writeCheckpoint({
    outputDir: ctx.outputDir,
    phaseCompleted: "PACKAGE",
    nextPhase: null,
    extra: { status: "complete", report_path: reportPath },
  });

  // Step 6: _DONE LAST.
  await writeDone({
    outputDir: ctx.outputDir,
    uuid8: ctx.uuid8,
    cliVersion: ctx.cliVersion,
  });
  ctx.log.info("Wrote _DONE sentinel — dispatch complete");

  return { phase: "PACKAGE" };
};

async function readOrEmpty(path: string): Promise<string> {
  try {
    return await fs.readFile(path, "utf8");
  } catch {
    return "";
  }
}

/** Pick the best available pre-PACKAGE artifact to use as synthesis input.
 *  Falls back through the canonical phase order: refine → synthesize →
 *  outline → triangulate → concatenated retrieve lenses. This means quick
 *  mode (which only runs SCOPE + RETRIEVE + PACKAGE) gets the retrieve
 *  lenses concatenated as the synthesis input — the LLM still has the raw
 *  findings to build the report from. Per C-4 in M19 review. */
async function readBestSynthesisInput(ctx: PhaseContext): Promise<string> {
  const candidates = [
    "phase07_refine.md",
    "phase05_synthesize.md",
    "phase04_5_outline.md",
    "phase04_triangulate.md",
  ];
  for (const candidate of candidates) {
    const text = await readOrEmpty(`${ctx.outputDir}/${candidate}`);
    if (text.trim().length > 0) {
      ctx.log.info(`Using ${candidate} as synthesis input for PACKAGE`);
      return text;
    }
  }
  // Fall back: concatenate retrieve lens outputs.
  try {
    const entries = await fs.readdir(ctx.outputDir);
    const retrieveFiles = entries
      .filter((n) => n.startsWith("phase03_retrieve_") && n.endsWith(".md"))
      .sort();
    if (retrieveFiles.length > 0) {
      ctx.log.info(
        `Using ${retrieveFiles.length} retrieve lens(es) as synthesis input for PACKAGE`,
      );
      const sections: string[] = [];
      for (const f of retrieveFiles) {
        const content = await fs.readFile(`${ctx.outputDir}/${f}`, "utf8");
        sections.push(`--- ${f} ---\n\n${content}`);
      }
      return sections.join("\n\n");
    }
  } catch {
    // OUTPUT_DIR doesn't exist yet — fall through to empty result below.
  }
  ctx.log.warn(
    "No pre-PACKAGE artifacts found in OUTPUT_DIR. PACKAGE will produce a thin report from topic alone.",
  );
  return "";
}

async function readVerifyArtifacts(outputDir: string): Promise<string> {
  try {
    const entries = await fs.readdir(outputDir);
    const verifyFiles = entries
      .filter((n) => n.startsWith("phase07_5_verify_") && n.endsWith(".md"))
      .sort();
    const sections: string[] = [];
    for (const f of verifyFiles) {
      const content = await fs.readFile(`${outputDir}/${f}`, "utf8");
      sections.push(`--- ${f} ---\n\n${content}`);
    }
    return sections.join("\n\n");
  } catch {
    return "(VERIFY phase did not run in this mode)";
  }
}

function renderProvenance(
  ctx: PhaseContext,
  packageUsage: { input: number; output: number },
): string {
  return [
    `# Provenance: ${ctx.topic}`,
    "",
    `- **Date:** ${utcNowIso().slice(0, 10)}`,
    `- **Mode:** ${ctx.mode}`,
    `- **Task UUID:** ${ctx.uuid8}`,
    `- **CLI version:** ${ctx.cliVersion}`,
    `- **Package phase tokens:** input=${packageUsage.input}, output=${packageUsage.output}`,
    "",
    `## Verification`,
    "",
    `- **Step 5 (Temporal Supersession):** N/A — v2-deferred (per PLAN.md C3)`,
    `- **Step 6 (Verifier-Guided Retry):** N/A — v2-deferred (per PLAN.md C3)`,
    "",
    `## Notes`,
    "",
    `Generated by deep-research-cli v${ctx.cliVersion}. The deterministic CLI ` +
      `engine reproduces the deep-research methodology with code as the ` +
      `orchestrator and AI calls only for genuinely open-ended judgment.`,
    "",
  ].join("\n");
}

async function runHtmlGenerator(
  htmlScript: string,
  reportPath: string,
  ctx: PhaseContext,
): Promise<void> {
  return new Promise((resolve) => {
    const proc = spawn("python3", [htmlScript, reportPath], {
      stdio: "ignore",
    });
    proc.on("error", (err) => {
      ctx.log.warn(`HTML generation failed: ${err.message}`);
      resolve();
    });
    proc.on("close", (code) => {
      if (code === 0) {
        ctx.log.info("HTML/PDF generated successfully");
      } else {
        ctx.log.warn(`HTML generator exited with code ${code}`);
      }
      resolve();
    });
  });
}
