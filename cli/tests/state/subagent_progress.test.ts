import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  writeSubAgentProgress,
  readSubAgentProgress,
} from "../../src/state/subagent_progress.js";

let workDir: string;

beforeEach(async () => {
  workDir = await fs.mkdtemp(join(tmpdir(), "subagent-test-"));
});

afterEach(async () => {
  await fs.rm(workDir, { recursive: true, force: true });
});

describe("writeSubAgentProgress / readSubAgentProgress", () => {
  it("round-trips with all fields preserved", async () => {
    await writeSubAgentProgress({
      outputDir: workDir,
      phase: "RETRIEVE",
      expectedSubAgents: ["academic", "practitioner", "critical", "historical"],
      completedSubAgents: ["academic", "practitioner"],
    });
    const progress = await readSubAgentProgress(workDir);
    expect(progress).toBeDefined();
    expect(progress!.phase).toBe("RETRIEVE");
    expect(progress!.expected_subagents).toEqual([
      "academic",
      "practitioner",
      "critical",
      "historical",
    ]);
    expect(progress!.completed_subagents).toEqual(["academic", "practitioner"]);
    expect(progress!.last_updated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it("returns undefined when file is absent", async () => {
    const progress = await readSubAgentProgress(workDir);
    expect(progress).toBeUndefined();
  });

  it("overwrites prior progress on subsequent writes", async () => {
    await writeSubAgentProgress({
      outputDir: workDir,
      phase: "RETRIEVE",
      expectedSubAgents: ["a", "b"],
      completedSubAgents: ["a"],
    });
    await writeSubAgentProgress({
      outputDir: workDir,
      phase: "RETRIEVE",
      expectedSubAgents: ["a", "b"],
      completedSubAgents: ["a", "b"],
    });
    const progress = await readSubAgentProgress(workDir);
    expect(progress!.completed_subagents).toEqual(["a", "b"]);
  });

  it("rejects malformed schema on read", async () => {
    await fs.writeFile(join(workDir, "_subagent_progress.json"), JSON.stringify({ phase: 1 }));
    await expect(readSubAgentProgress(workDir)).rejects.toThrow();
  });
});
