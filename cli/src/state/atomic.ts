// Atomic file write primitive used by every state helper in this module.
//
// The pattern: write to a sibling .tmp file, fsync, then rename. The rename is
// atomic on POSIX (and on Windows for `os.rename`-equivalent operations via
// Node's fs.promises.rename which uses MoveFileEx with MOVEFILE_REPLACE_EXISTING).
// Result: even if the process is SIGKILLed mid-write, the destination file is
// either the prior valid state or the new valid state — never half-written.
//
// fsync is the belt-and-suspenders here. It guards against power loss between
// the write returning and the data hitting disk — SIGKILL alone doesn't need
// it, but the cost is negligible (single fsync per write, typically <5ms on
// SSD) and the predictability gain is real.
//
// Cross-filesystem renames are NOT atomic on Linux (EXDEV). Therefore the .tmp
// file MUST live in the same directory as the target. Callers passing absolute
// paths to writeAtomicJson / writeAtomicText automatically satisfy this — the
// helper places the .tmp next to the target by deriving its path from the
// target's directory.

import { promises as fs } from "node:fs";
import { dirname } from "node:path";

/** Write JSON atomically. Pretty-printed with 2-space indent, insertion-order keys. */
export async function writeAtomicJson<T>(targetPath: string, data: T): Promise<void> {
  const text = JSON.stringify(data, null, 2);
  await writeAtomicText(targetPath, text + "\n");
}

/** Write arbitrary text atomically. Caller chooses the trailing newline. */
export async function writeAtomicText(targetPath: string, content: string): Promise<void> {
  await fs.mkdir(dirname(targetPath), { recursive: true });
  const tmpPath = `${targetPath}.tmp`;
  // Open with 'w' (truncate). flag 'w' is fine — the .tmp is owned by us.
  const handle = await fs.open(tmpPath, "w");
  try {
    await handle.writeFile(content, "utf8");
    // Force the bytes to disk before the rename. Without fsync, a power loss
    // between the write returning and the rename completing could leave a
    // dirty rename pointing at unwritten data on some filesystems. fsync is
    // the documented way to prevent this.
    await handle.sync();
  } finally {
    await handle.close();
  }
  await fs.rename(tmpPath, targetPath);
}

/** Read JSON file. Returns undefined if file is absent. Throws on parse error. */
export async function readJsonOrUndefined<T>(targetPath: string): Promise<T | undefined> {
  try {
    const text = await fs.readFile(targetPath, "utf8");
    return JSON.parse(text) as T;
  } catch (err: unknown) {
    if (isNotFoundError(err)) return undefined;
    throw err;
  }
}

/** Read text file. Returns undefined if file is absent. */
export async function readTextOrUndefined(targetPath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(targetPath, "utf8");
  } catch (err: unknown) {
    if (isNotFoundError(err)) return undefined;
    throw err;
  }
}

/** Delete leftover *.tmp files in the directory. Used by Phase 0 RESUME
 *  DETECTION before reading checkpoints. Never throws on missing dir. */
export async function cleanupTmpFiles(outputDir: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(outputDir);
  } catch (err: unknown) {
    if (isNotFoundError(err)) return [];
    throw err;
  }
  const deleted: string[] = [];
  for (const name of entries) {
    if (name.endsWith(".tmp")) {
      const fullPath = `${outputDir}/${name}`;
      try {
        await fs.unlink(fullPath);
        deleted.push(fullPath);
      } catch {
        // Best effort. Subsequent atomic-writes will overwrite the .tmp anyway.
      }
    }
  }
  return deleted;
}

function isNotFoundError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "ENOENT"
  );
}
