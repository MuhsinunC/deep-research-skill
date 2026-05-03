import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { z } from "zod/v4";
import { MockProvider } from "../../src/providers/mock.js";
import { ProviderParseError } from "../../src/providers/types.js";

let workDir: string;

beforeEach(async () => {
  workDir = await fs.mkdtemp(join(tmpdir(), "mock-provider-"));
});

afterEach(async () => {
  await fs.rm(workDir, { recursive: true, force: true });
});

describe("MockProvider.callJudgment", () => {
  it("returns canned response and tracks the call", async () => {
    const provider = new MockProvider([{ text: "scoped output" }]);
    const result = await provider.callJudgment({
      systemPrompt: "You are a researcher",
      userPrompt: "Scope: AI agents in 2026",
      model: "opus",
    });
    expect(result.text).toBe("scoped output");
    expect(result.usage).toEqual({ input: 100, output: 200 }); // defaults
    expect(result.retries).toBe(0);
    expect(provider.judgmentCalls).toHaveLength(1);
    expect(provider.judgmentCalls[0]?.model).toBe("opus");
  });

  it("throws when judgmentQueue is exhausted", async () => {
    const provider = new MockProvider([]);
    await expect(
      provider.callJudgment({
        systemPrompt: "x",
        userPrompt: "y",
        model: "opus",
      }),
    ).rejects.toThrow(/judgmentQueue exhausted/);
  });

  it("validates against responseSchema and returns parsed payload", async () => {
    const schema = z.object({ topic: z.string(), priority: z.number() });
    const provider = new MockProvider([
      { text: JSON.stringify({ topic: "AI", priority: 1 }) },
    ]);
    const result = await provider.callJudgment({
      systemPrompt: "",
      userPrompt: "",
      model: "opus",
      responseSchema: schema,
    });
    expect(result.parsed).toEqual({ topic: "AI", priority: 1 });
  });

  it("throws ProviderParseError when responseSchema rejects (no retry case)", async () => {
    const schema = z.object({ topic: z.string() });
    const provider = new MockProvider([{ text: "not json or even a string-shape" }]);
    await expect(
      provider.callJudgment({
        systemPrompt: "",
        userPrompt: "",
        model: "opus",
        responseSchema: schema,
      }),
    ).rejects.toThrow(ProviderParseError);
  });

  it("simulates retry-on-parse-failure when failOnFirstParse is set", async () => {
    const schema = z.object({ topic: z.string() });
    const provider = new MockProvider([
      { text: JSON.stringify({ topic: "AI" }), failOnFirstParse: true },
    ]);
    const result = await provider.callJudgment({
      systemPrompt: "",
      userPrompt: "",
      model: "opus",
      responseSchema: schema,
    });
    // With failOnFirstParse + a text that DOES parse, the mock retry succeeds.
    expect(result.retries).toBe(1);
    expect(result.parsed).toEqual({ topic: "AI" });
  });
});

describe("MockProvider.fanOut — per-sub-agent disk-write contract (C4)", () => {
  it("writes each sub-agent's text to its outputFile BEFORE resolving", async () => {
    const provider = new MockProvider([], [
      {
        byName: {
          academic: { text: "academic-findings" },
          practitioner: { text: "practitioner-findings" },
        },
      },
    ]);
    const fileA = join(workDir, "phase03_retrieve_academic.md");
    const fileP = join(workDir, "phase03_retrieve_practitioner.md");
    const response = await provider.fanOut({
      agents: [
        {
          name: "academic",
          systemPrompt: "academic-system",
          userPrompt: "academic-user",
          model: "sonnet",
          outputFile: fileA,
        },
        {
          name: "practitioner",
          systemPrompt: "p-system",
          userPrompt: "p-user",
          model: "sonnet",
          outputFile: fileP,
        },
      ],
      timeoutMs: 5000,
    });
    expect(response.results).toHaveLength(2);
    // Both files MUST exist on disk after fanOut resolves (C4 contract).
    expect(await fs.readFile(fileA, "utf8")).toBe("academic-findings");
    expect(await fs.readFile(fileP, "utf8")).toBe("practitioner-findings");
    // Both results MUST report fileWritten: true.
    expect(response.results[0]?.fileWritten).toBe(true);
    expect(response.results[1]?.fileWritten).toBe(true);
    expect(response.results[0]?.status).toBe("ok");
    expect(response.results[1]?.status).toBe("ok");
  });

  it("returns error status (and DOES NOT write the file) when canned status is error", async () => {
    const provider = new MockProvider([], [
      {
        byName: {
          academic: { text: "", status: "error", error: "API rate limited" },
        },
      },
    ]);
    const fileA = join(workDir, "phase03_retrieve_academic.md");
    const response = await provider.fanOut({
      agents: [
        {
          name: "academic",
          systemPrompt: "x",
          userPrompt: "y",
          model: "sonnet",
          outputFile: fileA,
        },
      ],
      timeoutMs: 5000,
    });
    expect(response.results[0]?.status).toBe("error");
    expect(response.results[0]?.fileWritten).toBe(false);
    expect(response.results[0]?.error).toBe("API rate limited");
    // File is NOT on disk — the orchestrator's reconciliation correctly
    // sees this sub-agent as still-needing-to-run on resume.
    await expect(fs.readFile(fileA, "utf8")).rejects.toThrow();
  });

  it("returns error when a sub-agent name has no canned response", async () => {
    const provider = new MockProvider([], [{ byName: {} }]);
    const fileA = join(workDir, "phase03_retrieve_academic.md");
    const response = await provider.fanOut({
      agents: [
        {
          name: "academic",
          systemPrompt: "x",
          userPrompt: "y",
          model: "sonnet",
          outputFile: fileA,
        },
      ],
      timeoutMs: 5000,
    });
    expect(response.results[0]?.status).toBe("error");
    expect(response.results[0]?.fileWritten).toBe(false);
  });

  it("throws when fanOutQueue is exhausted", async () => {
    const provider = new MockProvider();
    await expect(
      provider.fanOut({
        agents: [
          {
            name: "x",
            systemPrompt: "",
            userPrompt: "",
            model: "sonnet",
            outputFile: join(workDir, "x.md"),
          },
        ],
        timeoutMs: 5000,
      }),
    ).rejects.toThrow(/fanOutQueue exhausted/);
  });
});

describe("MockProvider.close", () => {
  it("increments closeCount.calls each invocation", async () => {
    const provider = new MockProvider();
    await provider.close();
    await provider.close();
    expect(provider.closeCount.calls).toBe(2);
  });
});
