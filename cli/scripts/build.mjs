#!/usr/bin/env node
// Build script for deep-research-cli.
//
// 1. Type-check via `tsc --noEmit`
// 2. Bundle src/cli.ts to dist/cli.js using esbuild (single file, ESM, Node 22+)
// 3. Copy dist/cli.js into launcher-skill/scripts/cli.js for skill distribution
//
// The launcher-skill/scripts/cli.js path is what `~/.claude/skills/deep-research-cli/scripts/cli.js`
// resolves to after deploy — that's what the launcher skill invokes.
//
// Per skill-creator conventions: skills bundle executable code under `scripts/`,
// not `dist/`. The CLI's source repo uses `dist/` (TypeScript convention) but
// the deployed skill artifact lives at `launcher-skill/scripts/cli.js`.

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC_ENTRY = resolve(ROOT, "src", "cli.ts");
const DIST_ENTRY = resolve(ROOT, "dist", "cli.js");
const SKILL_SCRIPTS_DIR = resolve(ROOT, "launcher-skill", "scripts");
const SKILL_BUNDLE = resolve(SKILL_SCRIPTS_DIR, "cli.js");

function run(cmd, args, opts = {}) {
  console.log(`> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: false,
    ...opts,
  });
  if (result.status !== 0) {
    console.error(`Command failed (${result.status}): ${cmd} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
}

console.log("=== Type check (tsc --noEmit) ===");
run("npx", ["tsc", "--noEmit", "-p", "tsconfig.test.json"]);

console.log("\n=== Bundle src/cli.ts -> dist/cli.js (esbuild) ===");
run("npx", [
  "esbuild",
  SRC_ENTRY,
  "--bundle",
  "--platform=node",
  "--target=node22",
  "--format=esm",
  "--outfile=" + DIST_ENTRY,
  "--banner:js=#!/usr/bin/env node\n",
  // Keep node built-ins external so esbuild doesn't try to resolve them.
  "--external:node:*",
  // Mark large native deps external if needed; defaults are fine for now.
]);

if (!existsSync(DIST_ENTRY)) {
  console.error(`ERROR: Bundle did not produce ${DIST_ENTRY}`);
  process.exit(1);
}

const distSize = statSync(DIST_ENTRY).size;
console.log(`Bundle size: ${(distSize / 1024).toFixed(1)} KB`);

console.log("\n=== Copy bundle to launcher-skill/scripts/ ===");
mkdirSync(SKILL_SCRIPTS_DIR, { recursive: true });
copyFileSync(DIST_ENTRY, SKILL_BUNDLE);
// Make the bundled file executable so `node scripts/cli.js` is not required;
// users can also invoke `./scripts/cli.js` directly.
const fs = await import("node:fs");
fs.chmodSync(SKILL_BUNDLE, 0o755);
console.log(`Wrote: ${SKILL_BUNDLE}`);

console.log("\n=== Build complete ===");
