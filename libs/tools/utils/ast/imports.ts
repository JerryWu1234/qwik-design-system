import type { ImportDeclaration, Node } from "@oxc-project/types";
import type MagicString from "magic-string";
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

/**
 * Checks if a type import specifier exists in an import declaration
 */
export function hasImportSpecifier(
  importDecl: ImportDeclaration,
  specifierName: string
): boolean {
  if (!importDecl.specifiers) return false;

  return importDecl.specifiers.some((specifier) => {
    if (specifier.type === "ImportSpecifier" && "imported" in specifier) {
      const imported = specifier.imported;
      if (imported && "name" in imported) {
        return imported.name === specifierName;
      }
    }
    return false;
  });
}

/**
 * Injects a type import specifier into an existing import or creates a new import statement
 */
export function injectTypeImport(options: {
  ast: ReturnType<typeof parseSync>;
  magicString: MagicString;
  importSource: string;
  specifierName: string;
  existingImportNode?: Node | null;
}): void {
  const {
    ast,
    magicString: s,
    importSource,
    specifierName,
    existingImportNode = null
  } = options;

  if (existingImportNode) {
    const importDecl = existingImportNode as ImportDeclaration;

    if (importDecl.specifiers) {
      // Check if the specifier already exists
      if (hasImportSpecifier(importDecl, specifierName)) {
        return;
      }

      const lastSpecifier = importDecl.specifiers[importDecl.specifiers.length - 1];
      s.appendLeft(lastSpecifier.end, `, type ${specifierName}`);
    }
    return;
  }

  const firstImport = ast.program.body.find(
    (node: Node) => node.type === "ImportDeclaration"
  );

  const importStatement = `import type { ${specifierName} } from "${importSource}";\n`;

  if (firstImport) {
    s.appendLeft(firstImport.start, importStatement);
  } else {
    s.prepend(importStatement);
  }
}
