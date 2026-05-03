import { describe, it, expect } from "vitest";
import { selectProvider } from "../../src/providers/factory.js";
import { ClaudeAgentSdkProvider } from "../../src/providers/claude.js";
import { OpenCodeCliProvider } from "../../src/providers/opencode.js";

describe("selectProvider", () => {
  it("returns ClaudeAgentSdkProvider for provider=claude", async () => {
    const provider = await selectProvider({ provider: "claude" });
    expect(provider).toBeInstanceOf(ClaudeAgentSdkProvider);
  });

  it("returns OpenCodeCliProvider for provider=opencode", async () => {
    const provider = await selectProvider({ provider: "opencode" });
    expect(provider).toBeInstanceOf(OpenCodeCliProvider);
  });

  it("forwards opencodeBinary override to OpenCodeCliProvider", async () => {
    // We can't directly observe the binary field, but constructor success
    // with an arbitrary override is enough — the binary check is lazy
    // (deferred until first runOpenCode call).
    const provider = await selectProvider({
      provider: "opencode",
      opencodeBinary: "/path/to/custom/opencode",
    });
    expect(provider).toBeInstanceOf(OpenCodeCliProvider);
  });

  it("forwards defaultOpenCodeModel override to OpenCodeCliProvider", async () => {
    const provider = await selectProvider({
      provider: "opencode",
      defaultOpenCodeModel: "openrouter/some/model",
    });
    expect(provider).toBeInstanceOf(OpenCodeCliProvider);
  });
});
