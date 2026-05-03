import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { phase00_resume } from "../../src/phases/phase00_resume.js";
import { MockProvider } from "../../src/providers/mock.js";
import { createLogger } from "../../src/util/log.js";
import { writeDone } from "../../src/state/done.js";
import { writeCheckpoint } from "../../src/state/checkpoint.js";
import {
  PauseRequestedError,
  DispatchAlreadyCompleteError,
  ForeignOutputDirError,
} from "../../src/util/errors.js";
import { INTENSITY_BY_MODE } from "../../src/types/mode.js";
import type { PhaseContext } from "../../src/phases/types.js";

let workDir: string;
let registryPath: string;

beforeEach(async () => {
  workDir = await fs.mkdtemp(join(tmpdir(), "phase0-test-"));
  registryPath = join(workDir, "tasks-cli.json");
  process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"] = registryPath;
});

afterEach(async () => {
  delete process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"];
  await fs.rm(workDir, { recursive: true, force: true });
});

function makeContext(overrides: Partial<PhaseContext> = {}): PhaseContext {
  const provider = new MockProvider();
  const log = createLogger({ format: "json", write: () => {} });
  return {
    outputDir: workDir,
    uuid8: "abcdef01",
    topic: "Test topic",
    mode: "deep",
    intensity: INTENSITY_BY_MODE.deep,
    provider,
    log,
    cliVersion: "0.1.0",
    ...overrides,
  };
}

describe("phase00_resume — fresh dispatch path", () => {
  it("succeeds and registers a fresh task when OUTPUT_DIR is empty", async () => {
    const ctx = makeContext();
    const result = await phase00_resume(ctx);
    expect(result.phase).toBe("RESUME_DETECTION");
    // Registry should now have an in_progress entry for our uuid8.
    const reg = JSON.parse(await fs.readFile(registryPath, "utf8"));
    expect(reg.tasks).toHaveLength(1);
    expect(reg.tasks[0].status).toBe("in_progress");
    expect(reg.tasks[0].uuid).toBe("abcdef01");
  });

  it("writes a checkpoint with phase_completed=RESUME_DETECTION", async () => {
    const ctx = makeContext();
    await phase00_resume(ctx);
    const cp = JSON.parse(await fs.readFile(join(workDir, "_checkpoint.json"), "utf8"));
    expect(cp.phase_completed).toBe("RESUME_DETECTION");
    expect(cp.next_phase).toBe("SCOPE");
    expect(cp.is_resume).toBe(false);
  });
});

describe("phase00_resume — pause flag detection", () => {
  it("throws PauseRequestedError when _STOP_REQUESTED is present", async () => {
    await fs.writeFile(join(workDir, "_STOP_REQUESTED"), "");
    const ctx = makeContext();
    await expect(phase00_resume(ctx)).rejects.toBeInstanceOf(PauseRequestedError);
  });

  it("throws PauseRequestedError with kind=stop_now for _STOP_NOW", async () => {
    await fs.writeFile(join(workDir, "_STOP_NOW"), "");
    const ctx = makeContext();
    try {
      await phase00_resume(ctx);
      throw new Error("Expected PauseRequestedError to be thrown");
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(PauseRequestedError);
      expect((err as PauseRequestedError).flagKind).toBe("stop_now");
    }
  });
});

describe("phase00_resume — _DONE detection", () => {
  it("throws DispatchAlreadyCompleteError when matching _DONE exists", async () => {
    await writeDone({ outputDir: workDir, uuid8: "abcdef01", cliVersion: "0.1.0" });
    const ctx = makeContext();
    await expect(phase00_resume(ctx)).rejects.toBeInstanceOf(DispatchAlreadyCompleteError);
  });

  it("throws ForeignOutputDirError when _DONE has unknown schema", async () => {
    // Old Python skill's _DONE schema (different keys).
    await fs.writeFile(
      join(workDir, "_DONE"),
      "completed_at=2026-01-01T00:00:00Z\nphase=PACKAGE\nstatus=complete\nuuid=oldformat\n",
    );
    const ctx = makeContext();
    await expect(phase00_resume(ctx)).rejects.toBeInstanceOf(ForeignOutputDirError);
  });
});

describe("phase00_resume — completion-but-missing-sentinel reconciliation", () => {
  it("writes missing _DONE when checkpoint is complete but _DONE absent", async () => {
    // Simulate: report.md present, checkpoint says complete, _DONE missing
    // (this is the kill-between-9.8-and-10 case from the Phase 8 strict
    // ordering rule).
    await fs.writeFile(
      join(workDir, "research_report_20260503_test.md"),
      "# Test report\n",
    );
    await writeCheckpoint({
      outputDir: workDir,
      phaseCompleted: "PACKAGE",
      nextPhase: null,
      extra: { status: "complete" },
    });
    const ctx = makeContext();
    await expect(phase00_resume(ctx)).rejects.toBeInstanceOf(DispatchAlreadyCompleteError);
    // _DONE should now exist with our schema.
    const doneText = await fs.readFile(join(workDir, "_DONE"), "utf8");
    expect(doneText).toContain("uuid8=abcdef01");
    expect(doneText).toContain("phase_completed=PACKAGE");
  });
});

describe("phase00_resume — resume path with prior artifacts", () => {
  it("recognizes prior phase artifacts and marks is_resume=true", async () => {
    await fs.writeFile(join(workDir, "phase01_scope.md"), "scope");
    await fs.writeFile(join(workDir, "phase02_plan.md"), "plan");
    const ctx = makeContext();
    const result = await phase00_resume(ctx);
    expect(result.phase).toBe("RESUME_DETECTION");
    const cp = JSON.parse(await fs.readFile(join(workDir, "_checkpoint.json"), "utf8"));
    expect(cp.is_resume).toBe(true);
    expect(cp.completed_phases).toContain("SCOPE");
    expect(cp.completed_phases).toContain("PLAN");
    expect(cp.next_phase).toBe("RETRIEVE"); // First incomplete after SCOPE+PLAN
  });

  it("cleans up *.tmp files (kill-mid-rename recovery)", async () => {
    await fs.writeFile(join(workDir, "_checkpoint.json.tmp"), "{}");
    await fs.writeFile(join(workDir, "scope.md.tmp"), "partial");
    const ctx = makeContext();
    await phase00_resume(ctx);
    const remaining = await fs.readdir(workDir);
    expect(remaining.filter((n) => n.endsWith(".tmp"))).toEqual([]);
  });
});
