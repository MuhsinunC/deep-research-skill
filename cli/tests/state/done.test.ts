import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { writeDone, readDoneStrict, doneFileExists } from "../../src/state/done.js";

let workDir: string;

beforeEach(async () => {
  workDir = await fs.mkdtemp(join(tmpdir(), "done-test-"));
});

afterEach(async () => {
  await fs.rm(workDir, { recursive: true, force: true });
});

describe("writeDone", () => {
  it("writes _DONE with all locked-schema fields in key=value format", async () => {
    const target = await writeDone({
      outputDir: workDir,
      uuid8: "a1b2c3d4",
      cliVersion: "0.1.0",
    });
    expect(target).toBe(join(workDir, "_DONE"));
    const text = await fs.readFile(target, "utf8");
    expect(text).toContain("uuid8=a1b2c3d4\n");
    expect(text).toContain("phase_completed=PACKAGE\n");
    expect(text).toContain("cli_version=0.1.0\n");
    expect(text).toMatch(/finished_at=\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/);
  });

  it("rejects malformed uuid8 (not 8 hex chars)", async () => {
    await expect(
      writeDone({ outputDir: workDir, uuid8: "not-hex", cliVersion: "0.1.0" }),
    ).rejects.toThrow();
  });

  it("leaves no .tmp file behind", async () => {
    await writeDone({ outputDir: workDir, uuid8: "a1b2c3d4", cliVersion: "0.1.0" });
    const entries = await fs.readdir(workDir);
    expect(entries.filter((n) => n.endsWith(".tmp"))).toEqual([]);
    expect(entries).toEqual(["_DONE"]);
  });

  it("is idempotent — second call overwrites cleanly", async () => {
    await writeDone({ outputDir: workDir, uuid8: "a1b2c3d4", cliVersion: "0.1.0" });
    await writeDone({ outputDir: workDir, uuid8: "a1b2c3d4", cliVersion: "0.2.0" });
    const back = await readDoneStrict(workDir);
    expect(back!.cli_version).toBe("0.2.0");
  });
});

describe("readDoneStrict", () => {
  it("returns undefined when _DONE is absent", async () => {
    const result = await readDoneStrict(workDir);
    expect(result).toBeUndefined();
  });

  it("returns parsed sentinel for our schema", async () => {
    await writeDone({ outputDir: workDir, uuid8: "deadbeef", cliVersion: "1.2.3" });
    const result = await readDoneStrict(workDir);
    expect(result).toEqual(
      expect.objectContaining({
        uuid8: "deadbeef",
        phase_completed: "PACKAGE",
        cli_version: "1.2.3",
      }),
    );
  });

  it("rejects foreign _DONE files (e.g., the old skill's Python schema)", async () => {
    // The old skill's atomic_checkpoint.py emits keys like `completed_at`,
    // `phase`, `status`, `uuid` (not `uuid8`/`finished_at`/`phase_completed`/`cli_version`).
    // Our reader must reject this so Phase 0 can take the "foreign tool" exit path.
    await fs.writeFile(
      join(workDir, "_DONE"),
      [
        "completed_at=2026-04-26T10:00:00Z",
        "phase=PACKAGE",
        "status=complete",
        "uuid=a1b2c3d4",
      ].join("\n"),
    );
    await expect(readDoneStrict(workDir)).rejects.toThrow();
  });

  it("rejects malformed timestamps", async () => {
    await fs.writeFile(
      join(workDir, "_DONE"),
      [
        "uuid8=a1b2c3d4",
        "finished_at=not-an-iso-timestamp",
        "phase_completed=PACKAGE",
        "cli_version=0.1.0",
      ].join("\n"),
    );
    await expect(readDoneStrict(workDir)).rejects.toThrow();
  });
});

describe("doneFileExists", () => {
  it("returns false when _DONE is absent", async () => {
    expect(await doneFileExists(workDir)).toBe(false);
  });

  it("returns true when ANY _DONE file exists (regardless of schema)", async () => {
    await fs.writeFile(join(workDir, "_DONE"), "anything");
    expect(await doneFileExists(workDir)).toBe(true);
  });
});
