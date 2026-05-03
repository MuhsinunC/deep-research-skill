import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  writeAtomicJson,
  writeAtomicText,
  readJsonOrUndefined,
  readTextOrUndefined,
  cleanupTmpFiles,
} from "../../src/state/atomic.js";

let workDir: string;

beforeEach(async () => {
  workDir = await fs.mkdtemp(join(tmpdir(), "atomic-test-"));
});

afterEach(async () => {
  await fs.rm(workDir, { recursive: true, force: true });
});

describe("writeAtomicJson", () => {
  it("writes JSON content and ends with a newline", async () => {
    const target = join(workDir, "data.json");
    await writeAtomicJson(target, { a: 1, b: "two" });
    const text = await fs.readFile(target, "utf8");
    expect(text.endsWith("\n")).toBe(true);
    expect(JSON.parse(text)).toEqual({ a: 1, b: "two" });
  });

  it("creates parent directories on demand", async () => {
    const target = join(workDir, "deep", "nested", "data.json");
    await writeAtomicJson(target, { ok: true });
    const stat = await fs.stat(target);
    expect(stat.isFile()).toBe(true);
  });

  it("overwrites prior valid content atomically", async () => {
    const target = join(workDir, "data.json");
    await writeAtomicJson(target, { v: 1 });
    await writeAtomicJson(target, { v: 2 });
    const after = await readJsonOrUndefined<{ v: number }>(target);
    expect(after).toEqual({ v: 2 });
  });

  it("leaves no .tmp file behind after success", async () => {
    const target = join(workDir, "data.json");
    await writeAtomicJson(target, { x: 1 });
    const entries = await fs.readdir(workDir);
    expect(entries.filter((n) => n.endsWith(".tmp"))).toEqual([]);
  });
});

describe("writeAtomicText", () => {
  it("writes raw text without modification", async () => {
    const target = join(workDir, "note.txt");
    await writeAtomicText(target, "hello\nworld\n");
    const back = await readTextOrUndefined(target);
    expect(back).toBe("hello\nworld\n");
  });

  it("does not append a newline if caller didn't include one", async () => {
    const target = join(workDir, "raw.txt");
    await writeAtomicText(target, "no-newline");
    const back = await readTextOrUndefined(target);
    expect(back).toBe("no-newline");
  });
});

describe("readJsonOrUndefined", () => {
  it("returns undefined for missing files", async () => {
    const result = await readJsonOrUndefined<unknown>(join(workDir, "missing.json"));
    expect(result).toBeUndefined();
  });

  it("throws on malformed JSON", async () => {
    const target = join(workDir, "bad.json");
    await fs.writeFile(target, "{broken", "utf8");
    await expect(readJsonOrUndefined<unknown>(target)).rejects.toThrow();
  });
});

describe("cleanupTmpFiles", () => {
  it("removes only files ending in .tmp", async () => {
    await fs.writeFile(join(workDir, "_checkpoint.json.tmp"), "{}");
    await fs.writeFile(join(workDir, "_DONE.tmp"), "incomplete");
    await fs.writeFile(join(workDir, "scope.md.tmp"), "partial");
    await fs.writeFile(join(workDir, "REPORT.md"), "# real report");

    const deleted = await cleanupTmpFiles(workDir);
    expect(deleted).toHaveLength(3);

    const remaining = await fs.readdir(workDir);
    expect(remaining).toEqual(["REPORT.md"]);
  });

  it("returns [] for nonexistent directory without throwing", async () => {
    const result = await cleanupTmpFiles(join(workDir, "does-not-exist"));
    expect(result).toEqual([]);
  });

  it("returns [] for empty directory", async () => {
    const result = await cleanupTmpFiles(workDir);
    expect(result).toEqual([]);
  });
});
