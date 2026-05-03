// Provider factory — selects the AgentProvider implementation from config.
//
// The CLI's --provider flag (claude | opencode) maps to a constructor here.
// Tests select MockProvider directly without going through the factory.

import type { AgentProvider } from "./types.js";
import { ProviderConfigError } from "./types.js";

export type ProviderName = "claude" | "opencode";

export interface ProviderFactoryConfig {
  provider: ProviderName;
  /** Optional override path to the opencode binary (defaults to whatever's
   *  in PATH). Used by tests and by users with non-standard installs. */
  opencodeBinary?: string;
  /** Optional override of the OpenCode model ID for cases where the
   *  per-phase model is omitted by callers (defaults to a sane OpenRouter
   *  model). Production callers should always pass `model` per request. */
  defaultOpenCodeModel?: string;
}

/** Resolve a provider name + config to a concrete AgentProvider instance.
 *  Throws ProviderConfigError if the requested provider can't be constructed
 *  (e.g., opencode binary missing, OPENROUTER_API_KEY not set). */
export async function selectProvider(config: ProviderFactoryConfig): Promise<AgentProvider> {
  switch (config.provider) {
    case "claude": {
      // Lazy import: only loads the SDK when the claude provider is selected.
      // Lets the opencode-only deployment skip the SDK entirely.
      const { ClaudeAgentSdkProvider } = await import("./claude.js");
      return new ClaudeAgentSdkProvider();
    }
    case "opencode": {
      const { OpenCodeCliProvider } = await import("./opencode.js");
      const constructorConfig: {
        binary?: string;
        defaultModel?: string;
      } = {};
      if (config.opencodeBinary !== undefined) {
        constructorConfig.binary = config.opencodeBinary;
      }
      if (config.defaultOpenCodeModel !== undefined) {
        constructorConfig.defaultModel = config.defaultOpenCodeModel;
      }
      return new OpenCodeCliProvider(constructorConfig);
    }
    default: {
      // Exhaustiveness check — TypeScript catches unknown ProviderName values.
      const exhaustive: never = config.provider;
      throw new ProviderConfigError(`Unknown provider: ${String(exhaustive)}`);
    }
  }
}
