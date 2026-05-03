// Phase handler registry.
//
// The registry maps phase names to handlers. The orchestrator looks up
// the handler at execution time so phases can be added/swapped without
// changing the orchestrator's loop.
//
// Handlers for individual phases live in src/phases/phase*.ts. Each
// handler is registered here so the orchestrator can dispatch by name.

import type { PhaseHandler } from "./types.js";
import type { PhaseName } from "../state/disk_truth.js";
import { phase00_resume } from "./phase00_resume.js";

/** A registry of phase handlers. Tests construct their own registries to
 *  inject mocks; production uses the default `registry` export below. */
export class PhaseRegistry {
  private readonly handlers = new Map<PhaseName, PhaseHandler>();

  register(phase: PhaseName, handler: PhaseHandler): void {
    this.handlers.set(phase, handler);
  }

  get(phase: PhaseName): PhaseHandler | undefined {
    return this.handlers.get(phase);
  }

  has(phase: PhaseName): boolean {
    return this.handlers.has(phase);
  }

  /** Names of phases that have a registered handler. Useful for assertions. */
  registeredPhases(): readonly PhaseName[] {
    return Array.from(this.handlers.keys());
  }
}

/** Default registry populated with all production phase handlers. */
export const defaultRegistry = new PhaseRegistry();
defaultRegistry.register("RESUME_DETECTION", phase00_resume);
// TODO M8-M14: register phase01-phase08 handlers as they're implemented.
// The orchestrator throws "no handler for phase X" if asked to run a
// phase whose handler isn't registered yet — useful for incremental
// development.
