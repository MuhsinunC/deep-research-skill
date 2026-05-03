import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { detectPauseFlag } from "../../src/state/pause.js";

let workDir: string;

beforeEach(async () => {
  workDir = await fs.mkdtemp(join(tmpdir(), "pause-test-"));
});

afterEach(async () => {
  await fs.rm(workDir, { recursive: true, force: true });
});

describe("detectPauseFlag", () => {
  it("returns undefined when no flag files exist", async () => {
    const result = await detectPauseFlag(workDir);
    expect(result).toBeUndefined();
  });

  it("detects _STOP_REQUESTED as soft pause", async () => {
    await fs.writeFile(join(workDir, "_STOP_REQUESTED"), "");
    const result = await detectPauseFlag(workDir);
    expect(result).toEqual({ kind: "stop_soft", filename: "_STOP_REQUESTED" });
  });

  it("detects _STOP_NOW as aggressive pause", async () => {
    await fs.writeFile(join(workDir, "_STOP_NOW"), "");
    const result = await detectPauseFlag(workDir);
    expect(result).toEqual({ kind: "stop_now", filename: "_STOP_NOW" });
  });

  it("prefers _STOP_NOW when both flags exist (operator escalation)", async () => {
    await fs.writeFile(join(workDir, "_STOP_REQUESTED"), "");
    await fs.writeFile(join(workDir, "_STOP_NOW"), "");
    const result = await detectPauseFlag(workDir);
    expect(result).toEqual({ kind: "stop_now", filename: "_STOP_NOW" });
  });
});
