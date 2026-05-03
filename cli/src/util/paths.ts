// Output directory + UUID8 generation helpers.

import { homedir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { slugify } from "./slug.js";

export function generateUuid8(): string {
  return randomUUID().replace(/-/g, "").slice(0, 8);
}

export function defaultOutputDir(topic: string, uuid8: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return join(homedir(), "Documents", "Research", `${slugify(topic)}_${date}_${uuid8}`);
}
