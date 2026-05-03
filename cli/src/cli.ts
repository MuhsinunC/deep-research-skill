// Thin shim — calls into the testable runCli(argv) impl. Covered out of
// vitest coverage per C5 in PLAN.md. The shim's only job is to wire up
// process.argv → runCli → process.exit. Everything else is in cli-impl.ts.

import { runCli } from "./cli-impl.js";

runCli(process.argv).then(
  (exitCode) => process.exit(exitCode),
  (err: unknown) => {
    process.stderr.write(`Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  },
);
