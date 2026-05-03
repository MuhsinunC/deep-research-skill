import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runOrchestrator } from "../src/orchestrator.js";
import { PhaseRegistry } from "../src/phases/registry.js";
import { phase00_resume } from "../src/phases/phase00_resume.js";
import { MockProvider } from "../src/providers/mock.js";
import { createLogger } from "../src/util/log.js";
import { FatalError, RecoverableError } from "../src/util/errors.js";
import type { PhaseContext, PhaseResult } from "../src/phases/types.js";

let workDir: string;
let registryPath: string;

beforeEach(async () => {
  workDir = await fs.mkdtemp(join(tmpdir(), "orch-test-"));
  registryPath = join(workDir, "tasks-cli.json");
  process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"] = registryPath;
});

afterEach(async () => {
  delete process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"];
  await fs.rm(workDir, { recursive: true, force: true });
});

function quietLogger() {
  return createLogger({ format: "json", write: () => {} });
}

function makeRegistry(overrides: Record<string, (ctx: PhaseContext) => Promise<PhaseResult>>): PhaseRegistry {
  const r = new PhaseRegistry();
  r.register("RESUME_DETECTION", phase00_resume);
  for (const [name, handler] of Object.entries(overrides)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.register(name as any, handler);
  }
  return r;
}

describe("runOrchestrator — happy path", () => {
  it("runs RESUME_DETECTION + a stub SCOPE handler in quick mode", async () => {
    let scopeRan = false;
    const registry = makeRegistry({
      SCOPE: async (ctx) => {
        scopeRan = true;
        // Fake a scope artifact on disk so disk-truth reconciliation works.
        await fs.writeFile(join(ctx.outputDir, "phase01_scope.md"), "scoped");
        return { phase: "SCOPE" };
      },
      RETRIEVE: async (ctx) => {
        await fs.writeFile(join(ctx.outputDir, "phase03_retrieve_x.md"), "lens-x");
        return { phase: "RETRIEVE" };
      },
      PACKAGE: async (ctx) => {
        await fs.writeFile(join(ctx.outputDir, "research_report_20260503_x.md"), "report");
        return { phase: "PACKAGE" };
      },
    });
    const result = await runOrchestrator({
      outputDir: workDir,
      uuid8: "abcdef01",
      topic: "Test",
      mode: "quick",
      provider: new MockProvider(),
      log: quietLogger(),
      cliVersion: "0.1.0",
      registry,
    });
    expect(result.status).toBe("complete");
    expect(result.exitCode).toBe(0);
    expect(scopeRan).toBe(true);
  });

  it("exits gracefully at the first phase with no registered handler", async () => {
    const registry = makeRegistry({}); // Only RESUME_DETECTION registered
    const result = await runOrchestrator({
      outputDir: workDir,
      uuid8: "abcdef01",
      topic: "Test",
      mode: "quick",
      provider: new MockProvider(),
      log: quietLogger(),
      cliVersion: "0.1.0",
      registry,
    });
    // Should reach Phase 1 (SCOPE) and stop there with status "not-implemented"
    expect(result.status).toBe("not-implemented");
    expect(result.exitCode).toBe(0);
    expect(result.lastPhase).toBe("RESUME_DETECTION");
  });
});

describe("runOrchestrator — error handling", () => {
  it("retries once on RecoverableError", async () => {
    let calls = 0;
    const registry = makeRegistry({
      SCOPE: async () => {
        calls++;
        if (calls === 1) throw new RecoverableError("transient");
        return { phase: "SCOPE" };
      },
    });
    const result = await runOrchestrator({
      outputDir: workDir,
      uuid8: "abcdef01",
      topic: "Test",
      mode: "quick",
      provider: new MockProvider(),
      log: quietLogger(),
      cliVersion: "0.1.0",
      registry,
    });
    // Phase succeeds on the retry; orchestrator continues into RETRIEVE which
    // has no handler, so we get "not-implemented" with last phase SCOPE.
    expect(calls).toBe(2);
    expect(result.lastPhase).toBe("SCOPE");
  });

  it("does NOT retry FatalError; returns exit code 1", async () => {
    let calls = 0;
    const registry = makeRegistry({
      SCOPE: async () => {
        calls++;
        throw new FatalError("hard fail");
      },
    });
    const result = await runOrchestrator({
      outputDir: workDir,
      uuid8: "abcdef01",
      topic: "Test",
      mode: "quick",
      provider: new MockProvider(),
      log: quietLogger(),
      cliVersion: "0.1.0",
      registry,
    });
    expect(calls).toBe(1);
    expect(result.status).toBe("error");
    expect(result.exitCode).toBe(1);
    expect(result.errorMessage).toContain("hard fail");
  });

  it("returns paused status (exit code 0) when pause flag is detected", async () => {
    await fs.writeFile(join(workDir, "_STOP_REQUESTED"), "");
    const registry = makeRegistry({});
    const result = await runOrchestrator({
      outputDir: workDir,
      uuid8: "abcdef01",
      topic: "Test",
      mode: "quick",
      provider: new MockProvider(),
      log: quietLogger(),
      cliVersion: "0.1.0",
      registry,
    });
    expect(result.status).toBe("paused");
    expect(result.exitCode).toBe(0);
    // Checkpoint should record the pause.
    const cp = JSON.parse(await fs.readFile(join(workDir, "_checkpoint.json"), "utf8"));
    expect(cp.status).toBe("paused");
    expect(cp.paused_reason).toBe("flag-stop_soft");
  });
});

describe("runOrchestrator — loop-back", () => {
  it("loops back to a prior phase when handler requests it (within budget)", async () => {
    const verifyCalls = { count: 0 };
    const refineCalls = { count: 0 };
    const registry = makeRegistry({
      SCOPE: async () => ({ phase: "SCOPE" }),
      PLAN: async () => ({ phase: "PLAN" }),
      RETRIEVE: async () => ({ phase: "RETRIEVE" }),
      TRIANGULATE: async () => ({ phase: "TRIANGULATE" }),
      OUTLINE_REFINEMENT: async () => ({ phase: "OUTLINE_REFINEMENT" }),
      SYNTHESIZE: async () => ({ phase: "SYNTHESIZE" }),
      CRITIQUE: async () => ({ phase: "CRITIQUE" }),
      REFINE: async () => {
        refineCalls.count++;
        return { phase: "REFINE" };
      },
      VERIFY: async () => {
        verifyCalls.count++;
        // First two times: loop back. Third time: continue.
        if (verifyCalls.count <= 2) {
          return { phase: "VERIFY", loopBackTo: "REFINE" };
        }
        return { phase: "VERIFY" };
      },
      PACKAGE: async () => ({ phase: "PACKAGE" }),
    });
    const result = await runOrchestrator({
      outputDir: workDir,
      uuid8: "abcdef01",
      topic: "Test",
      mode: "deep",
      provider: new MockProvider(),
      log: quietLogger(),
      cliVersion: "0.1.0",
      registry,
    });
    expect(result.status).toBe("complete");
    // VERIFY ran 3 times: original + 2 loop-backs (budget=2 in deep mode).
    expect(verifyCalls.count).toBe(3);
    // REFINE ran 3 times too: original + 2 loop-backs.
    expect(refineCalls.count).toBe(3);
  });
});
