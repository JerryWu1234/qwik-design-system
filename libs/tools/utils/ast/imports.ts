import type { ImportDeclaration, Node } from "@oxc-project/types";
import type { parseSync } from "oxc-parser";

export function getImportSource(importNode: ImportDeclaration, source: string): string {
  return source.slice(importNode.source.start + 1, importNode.source.end - 1);
}

export function findImportBySource(
  ast: ReturnType<typeof parseSync>,
  source: string,
  importSource: string
): Node | null {
  for (const node of ast.program.body) {
    if (node.type !== "ImportDeclaration") continue;
    if (!("source" in node)) continue;

    const nodeSource = getImportSource(node as ImportDeclaration, source);
    if (nodeSource === importSource) {
      return node;
    }
  }
  return null;
}
