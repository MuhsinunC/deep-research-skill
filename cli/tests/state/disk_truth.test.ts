import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { scanDiskTruth } from "../../src/state/disk_truth.js";

let workDir: string;

beforeEach(async () => {
  workDir = await fs.mkdtemp(join(tmpdir(), "disktruth-test-"));
});

afterEach(async () => {
  await fs.rm(workDir, { recursive: true, force: true });
});

describe("scanDiskTruth", () => {
  it("reports empty completedPhases for an empty directory", async () => {
    const truth = await scanDiskTruth(workDir);
    expect(truth.completedPhases.size).toBe(0);
    expect(truth.artifacts).toEqual([]);
  });

  it("returns empty result for nonexistent directory without throwing", async () => {
    const truth = await scanDiskTruth(join(workDir, "missing"));
    expect(truth.completedPhases.size).toBe(0);
    expect(truth.artifacts).toEqual([]);
  });

  it("recognizes canonical phase artifact filenames", async () => {
    await fs.writeFile(join(workDir, "phase01_scope.md"), "scope");
    await fs.writeFile(join(workDir, "phase02_plan.md"), "plan");
    await fs.writeFile(join(workDir, "phase03_retrieve_academic.md"), "lens-1");
    await fs.writeFile(join(workDir, "phase03_retrieve_practitioner.md"), "lens-2");
    await fs.writeFile(join(workDir, "phase04_triangulate.md"), "triangulate");
    await fs.writeFile(join(workDir, "research_report_20260503_test-topic.md"), "report");

    const truth = await scanDiskTruth(workDir);
    expect(truth.completedPhases).toContain("SCOPE");
    expect(truth.completedPhases).toContain("PLAN");
    expect(truth.completedPhases).toContain("RETRIEVE");
    expect(truth.completedPhases).toContain("TRIANGULATE");
    expect(truth.completedPhases).toContain("PACKAGE");
  });

  it("ignores _-prefixed and dot-prefixed files (control files)", async () => {
    await fs.writeFile(join(workDir, "_checkpoint.json"), "{}");
    await fs.writeFile(join(workDir, "_DONE"), "");
    await fs.writeFile(join(workDir, "_starting.txt"), "");
    await fs.writeFile(join(workDir, ".hidden"), "");

    const truth = await scanDiskTruth(workDir);
    expect(truth.artifacts).toEqual([]);
    expect(truth.completedPhases.size).toBe(0);
  });

  it("does NOT recognize legacy aliases from the old skill (per C2)", async () => {
    // Old skill used `scope.md`, `research_agent_1.md`, etc. Per C2 we drop
    // legacy alias support — the new CLI uses fresh OUTPUT_DIRs only.
    await fs.writeFile(join(workDir, "scope.md"), "old-skill-scope");
    await fs.writeFile(join(workDir, "research_agent_1.md"), "old-skill-research");
    const truth = await scanDiskTruth(workDir);
    // These are LISTED as artifacts (any non-_-prefix file is) but DON'T mark
    // any phase as complete — the canonical predicates don't match them.
    expect(truth.artifacts.sort()).toEqual(["research_agent_1.md", "scope.md"]);
    expect(truth.completedPhases.size).toBe(0);
  });

  it("reports VERIFY complete when phase07_5_verify_<sublens>.md exists", async () => {
    await fs.writeFile(join(workDir, "phase07_5_verify_citation_1.md"), "v1");
    await fs.writeFile(join(workDir, "phase07_5_verify_adversarial.md"), "adv");
    const truth = await scanDiskTruth(workDir);
    expect(truth.completedPhases).toContain("VERIFY");
  });
});
