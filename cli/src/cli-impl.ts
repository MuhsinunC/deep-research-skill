// Testable CLI implementation. The thin entry shim (src/cli.ts) just calls
// runCli(process.argv). Per C5: this module is fully covered by tests; the
// shim is the only file excluded from coverage.

import { promises as fs } from "node:fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { runOrchestrator } from "./orchestrator.js";
import { selectProvider } from "./providers/factory.js";
import { createLogger } from "./util/log.js";
import { generateUuid8, defaultOutputDir } from "./util/paths.js";
import type { Mode } from "./types/mode.js";
import type { ProviderName } from "./providers/factory.js";

export interface CliOptions {
  topic?: string;
  mode?: Mode;
  provider?: ProviderName;
  outputDir?: string;
  briefFile?: string;
  resume?: boolean;
}

const CLI_VERSION = "0.1.0";

export async function runCli(argv: readonly string[]): Promise<number> {
  const parser = yargs(hideBin(argv as string[]))
    .scriptName("deep-research")
    .usage("$0 <topic> [options]")
    .command("$0 [topic]", "Run a deep research dispatch", (y) =>
      y.positional("topic", {
        type: "string",
        describe: "The research topic (use --brief-file for richer input)",
      }),
    )
    .option("mode", {
      type: "string",
      choices: ["quick", "standard", "deep", "ultradeep"] as const,
      default: "deep" as const,
      describe: "Research depth (quick/standard/deep/ultradeep)",
    })
    .option("provider", {
      type: "string",
      choices: ["claude", "opencode"] as const,
      default: "claude" as const,
      describe: "AI provider (claude=Claude Code SDK, opencode=OpenRouter via opencode CLI)",
    })
    .option("output-dir", {
      type: "string",
      describe: "Output directory (default: ~/Documents/Research/<slug>_<date>_<uuid8>)",
    })
    .option("brief-file", {
      type: "string",
      describe: "Path to a research brief markdown file (overrides topic)",
    })
    .option("resume", {
      type: "boolean",
      default: false,
      describe: "Resume an existing dispatch (use with --output-dir)",
    })
    .strict()
    .help()
    .version(CLI_VERSION);

  const args = await parser.parseAsync();

  // Resolve topic.
  let topic: string;
  if (args.briefFile !== undefined) {
    try {
      topic = await fs.readFile(args.briefFile, "utf8");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`Error: failed to read brief file: ${msg}\n`);
      return 2;
    }
  } else if (typeof args.topic === "string" && args.topic.length > 0) {
    topic = args.topic;
  } else {
    process.stderr.write(
      "Error: must provide a topic argument OR --brief-file PATH\n",
    );
    parser.showHelp();
    return 2;
  }

  // Generate UUID8 + output dir.
  const uuid8 = generateUuid8();
  const outputDir = args.outputDir ?? defaultOutputDir(topic.slice(0, 60), uuid8);

  const log = createLogger({ uuid8 });

  log.info("Starting dispatch", {
    topic: topic.slice(0, 80),
    mode: args.mode,
    provider: args.provider,
    outputDir,
    uuid8,
  });

  // Print cost forecast (per CC-D in PLAN.md).
  printCostForecast(args.mode as Mode);

  // Construct provider.
  let provider;
  try {
    provider = await selectProvider({ provider: args.provider as ProviderName });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: failed to construct provider: ${msg}\n`);
    return 2;
  }

  // Run the orchestrator.
  try {
    const result = await runOrchestrator({
      outputDir,
      uuid8,
      topic,
      mode: args.mode as Mode,
      provider,
      log,
      cliVersion: CLI_VERSION,
    });
    if (result.errorMessage !== undefined) {
      process.stderr.write(`${result.errorMessage}\n`);
    }
    log.info("Dispatch finished", {
      status: result.status,
      exitCode: result.exitCode,
      lastPhase: result.lastPhase,
    });
    return result.exitCode;
  } finally {
    await provider.close();
  }
}

function printCostForecast(mode: Mode): void {
  const estimates: Record<Mode, string> = {
    quick: "~50K tokens (<$1)",
    standard: "~250K tokens ($1-3)",
    deep: "~400-700K tokens ($3-7)",
    ultradeep: "~800K-1.4M tokens ($7-14)",
  };
  process.stderr.write(
    `\nEstimated cost for ${mode} mode: ${estimates[mode]} (upper bound; actual usually lower)\n` +
      `Press Ctrl-C within 5 seconds to abort, or wait for dispatch to start...\n\n`,
  );
}
