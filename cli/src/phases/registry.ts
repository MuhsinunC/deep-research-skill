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
import { phase01_scope } from "./phase01_scope.js";
import { phase02_plan } from "./phase02_plan.js";
import { phase03_retrieve } from "./phase03_retrieve.js";
import { phase04_triangulate } from "./phase04_triangulate.js";
import { phase04_5_outline } from "./phase04_5_outline.js";
import { phase05_synthesize } from "./phase05_synthesize.js";
import { phase06_critique } from "./phase06_critique.js";
import { phase07_refine } from "./phase07_refine.js";
import { phase07_5_verify } from "./phase07_5_verify.js";
import { phase08_package } from "./phase08_package.js";

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
defaultRegistry.register("SCOPE", phase01_scope);
defaultRegistry.register("PLAN", phase02_plan);
defaultRegistry.register("RETRIEVE", phase03_retrieve);
defaultRegistry.register("TRIANGULATE", phase04_triangulate);
defaultRegistry.register("OUTLINE_REFINEMENT", phase04_5_outline);
defaultRegistry.register("SYNTHESIZE", phase05_synthesize);
defaultRegistry.register("CRITIQUE", phase06_critique);
defaultRegistry.register("REFINE", phase07_refine);
defaultRegistry.register("VERIFY", phase07_5_verify);
defaultRegistry.register("PACKAGE", phase08_package);
