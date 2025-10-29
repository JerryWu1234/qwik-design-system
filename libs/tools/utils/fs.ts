import { readdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Recursively walks a directory and yields all files with the specified extension
 */
export async function* walkFiles(dir: string, extension: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(path, extension);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(extension)) {
      yield path;
    }
  }
}
