import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import {
  registerTask,
  markTaskResumed,
  markTaskComplete,
  markTaskPaused,
  getRegistryPath,
} from "../../src/state/tasks_registry.js";

// Inject the registry path via env var (per the production override hook).
// Each test gets its own scratch path so parallel test runs don't collide.
let registryPath: string;
let scratchDir: string;

beforeEach(async () => {
  scratchDir = await fs.mkdtemp(join(tmpdir(), "tasks-registry-"));
  registryPath = join(scratchDir, "research-tasks-cli.json");
  process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"] = registryPath;
});

afterEach(async () => {
  delete process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"];
  await fs.rm(scratchDir, { recursive: true, force: true });
});

describe("getRegistryPath", () => {
  it("honors DEEP_RESEARCH_CLI_REGISTRY_PATH override (test injection seam)", () => {
    expect(getRegistryPath()).toBe(registryPath);
  });

  it("falls back to ~/.claude/research-tasks-cli.json when env var is unset", () => {
    delete process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"];
    const path = getRegistryPath();
    expect(path).toMatch(/[/\\]\.claude[/\\]research-tasks-cli\.json$/);
    // Reinstate for the rest of the test suite (afterEach also clears it).
    process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"] = registryPath;
  });

  it("never resolves to the old skill's research-tasks.json (per I5)", () => {
    delete process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"];
    const path = getRegistryPath();
    expect(path).not.toMatch(/research-tasks\.json$/);
    process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"] = registryPath;
  });
});

describe("registerTask", () => {
  it("creates registry file with single in_progress entry", async () => {
    await registerTask({
      uuid: "abcdef01",
      topic: "Test topic",
      outputDir: "/tmp/out",
      mode: "deep",
      provider: "claude",
      cliVersion: "0.1.0",
    });
    const raw = JSON.parse(await fs.readFile(registryPath, "utf8"));
    expect(raw.tasks).toHaveLength(1);
    expect(raw.tasks[0]).toMatchObject({
      uuid: "abcdef01",
      topic: "Test topic",
      status: "in_progress",
      output_dir: "/tmp/out",
      mode: "deep",
      provider: "claude",
      cli_version: "0.1.0",
    });
    expect(raw.tasks[0].start_time).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it("appends new tasks without disturbing existing ones", async () => {
    await registerTask({ uuid: "11111111", topic: "First", outputDir: "/a", mode: "deep" });
    await registerTask({
      uuid: "22222222",
      topic: "Second",
      outputDir: "/b",
      mode: "standard",
    });
    const raw = JSON.parse(await fs.readFile(registryPath, "utf8"));
    expect(raw.tasks).toHaveLength(2);
    expect(raw.tasks[0].uuid).toBe("11111111");
    expect(raw.tasks[1].uuid).toBe("22222222");
  });

  it("replaces an existing entry on uuid collision (resume scenario)", async () => {
    await registerTask({ uuid: "abcdef01", topic: "v1", outputDir: "/a", mode: "deep" });
    await registerTask({
      uuid: "abcdef01",
      topic: "v2",
      outputDir: "/a",
      mode: "deep",
      provider: "opencode",
    });
    const raw = JSON.parse(await fs.readFile(registryPath, "utf8"));
    expect(raw.tasks).toHaveLength(1);
    expect(raw.tasks[0].topic).toBe("v2");
    expect(raw.tasks[0].provider).toBe("opencode");
  });

  it("creates parent directories on demand", async () => {
    // Reroute the registry to a deeper non-existent path to verify mkdir.
    const deepPath = join(scratchDir, "deep", "nested", "registry.json");
    process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"] = deepPath;
    await registerTask({ uuid: "abcdef01", topic: "T", outputDir: "/o", mode: "deep" });
    const stat = await fs.stat(deepPath);
    expect(stat.isFile()).toBe(true);
    // Restore for afterEach.
    process.env["DEEP_RESEARCH_CLI_REGISTRY_PATH"] = registryPath;
    await fs.rm(dirname(dirname(deepPath)), { recursive: true, force: true });
  });
});

describe("markTaskResumed / markTaskComplete / markTaskPaused", () => {
  it("markTaskComplete sets status and complete_time", async () => {
    await registerTask({ uuid: "abcdef01", topic: "T", outputDir: "/o", mode: "deep" });
    await markTaskComplete("abcdef01");
    const raw = JSON.parse(await fs.readFile(registryPath, "utf8"));
    expect(raw.tasks[0].status).toBe("complete");
    expect(raw.tasks[0].complete_time).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it("markTaskResumed adds last_resumed_at", async () => {
    await registerTask({ uuid: "abcdef01", topic: "T", outputDir: "/o", mode: "deep" });
    await markTaskResumed("abcdef01");
    const raw = JSON.parse(await fs.readFile(registryPath, "utf8"));
    expect(raw.tasks[0].last_resumed_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it("markTaskPaused sets status=paused and notes", async () => {
    await registerTask({ uuid: "abcdef01", topic: "T", outputDir: "/o", mode: "deep" });
    await markTaskPaused("abcdef01", "quota window");
    const raw = JSON.parse(await fs.readFile(registryPath, "utf8"));
    expect(raw.tasks[0].status).toBe("paused");
    expect(raw.tasks[0].notes).toBe("quota window");
  });

  // Regression tests for IMP-1 (review-1 finding): registry must NOT crash on
  // a corrupted file. Phase 8 step 4 (markTaskComplete) is on the critical
  // path; a SyntaxError here would block step 5 (checkpoint write) and step 6
  // (_DONE), losing the run-completion signal.

  it("treats an empty registry file as empty registry (IMP-1 regression)", async () => {
    await fs.writeFile(registryPath, "", "utf8");
    // Should NOT throw despite the empty file.
    await registerTask({ uuid: "abcdef01", topic: "T", outputDir: "/o", mode: "deep" });
    const raw = JSON.parse(await fs.readFile(registryPath, "utf8"));
    expect(raw.tasks).toHaveLength(1);
    expect(raw.tasks[0].uuid).toBe("abcdef01");
  });

  it("treats a malformed JSON registry file as empty (IMP-1 regression)", async () => {
    await fs.writeFile(registryPath, "{not valid json", "utf8");
    // Should NOT throw — the malformed file is silently overwritten.
    await registerTask({ uuid: "abcdef01", topic: "T", outputDir: "/o", mode: "deep" });
    const raw = JSON.parse(await fs.readFile(registryPath, "utf8"));
    expect(raw.tasks).toHaveLength(1);
    expect(raw.tasks[0].uuid).toBe("abcdef01");
  });

  it("treats a wrong-shape JSON registry as empty (IMP-1 regression)", async () => {
    // Schema-violating but parseable JSON (missing the `tasks` array).
    await fs.writeFile(registryPath, JSON.stringify({ unrelated: "data" }), "utf8");
    await registerTask({ uuid: "abcdef01", topic: "T", outputDir: "/o", mode: "deep" });
    const raw = JSON.parse(await fs.readFile(registryPath, "utf8"));
    expect(raw.tasks).toHaveLength(1);
  });

  it("markTaskComplete on Phase-8-critical path tolerates corrupt registry (IMP-1 regression)", async () => {
    // Worst case: a prior run was killed mid-rename, leaving an empty file.
    // Phase 8 step 4 must still mark the task complete, otherwise step 5/6
    // (the run-completion signal) never fire.
    await registerTask({ uuid: "abcdef01", topic: "T", outputDir: "/o", mode: "deep" });
    await fs.writeFile(registryPath, "", "utf8"); // Corrupt registry mid-pipeline
    // markTaskComplete: the registry no longer has our entry → no-op (correct).
    await markTaskComplete("abcdef01");
    // The next registerTask of any UUID should also still work.
    await registerTask({ uuid: "11111111", topic: "T2", outputDir: "/o2", mode: "deep" });
    const raw = JSON.parse(await fs.readFile(registryPath, "utf8"));
    expect(raw.tasks).toHaveLength(1);
    expect(raw.tasks[0].uuid).toBe("11111111");
  });

  it("is a no-op when uuid is not registered (no throw)", async () => {
    await markTaskComplete("99999999");
    await markTaskResumed("99999999");
    await markTaskPaused("99999999", "reason");
    // Registry file may or may not exist; mainly we just want no throw.
    const exists = await fs
      .access(registryPath)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      const raw = JSON.parse(await fs.readFile(registryPath, "utf8"));
      expect(raw.tasks).toHaveLength(0);
    }
  });
});
