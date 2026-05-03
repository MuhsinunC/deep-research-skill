import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { writeCheckpoint, readCheckpoint } from "../../src/state/checkpoint.js";

let workDir: string;

beforeEach(async () => {
  workDir = await fs.mkdtemp(join(tmpdir(), "checkpoint-test-"));
});

afterEach(async () => {
  await fs.rm(workDir, { recursive: true, force: true });
});

describe("writeCheckpoint", () => {
  it("writes _checkpoint.json with required fields", async () => {
    await writeCheckpoint({
      outputDir: workDir,
      phaseCompleted: "RETRIEVE",
      nextPhase: "TRIANGULATE",
    });
    const cp = await readCheckpoint(workDir);
    expect(cp).toBeDefined();
    expect(cp!.phase_completed).toBe("RETRIEVE");
    expect(cp!.next_phase).toBe("TRIANGULATE");
    expect(cp!.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it("merges extra fields into the payload", async () => {
    await writeCheckpoint({
      outputDir: workDir,
      phaseCompleted: "RETRIEVE",
      nextPhase: "TRIANGULATE",
      extra: { sources_gathered: 24, completed_subagents: ["academic", "practitioner"] },
    });
    const raw = JSON.parse(await fs.readFile(join(workDir, "_checkpoint.json"), "utf8"));
    expect(raw.sources_gathered).toBe(24);
    expect(raw.completed_subagents).toEqual(["academic", "practitioner"]);
  });

  it("supports null next_phase for terminal state", async () => {
    await writeCheckpoint({
      outputDir: workDir,
      phaseCompleted: "PACKAGE",
      nextPhase: null,
      extra: { status: "complete" },
    });
    const cp = await readCheckpoint(workDir);
    expect(cp!.phase_completed).toBe("PACKAGE");
    expect(cp!.next_phase).toBeNull();
    expect(cp!.status).toBe("complete");
  });
});

describe("readCheckpoint", () => {
  it("returns undefined when file is absent", async () => {
    const cp = await readCheckpoint(workDir);
    expect(cp).toBeUndefined();
  });

  it("throws on schema violation (corrupted file)", async () => {
    await fs.writeFile(
      join(workDir, "_checkpoint.json"),
      JSON.stringify({ wrong_field: "value" }),
    );
    await expect(readCheckpoint(workDir)).rejects.toThrow();
  });
});
