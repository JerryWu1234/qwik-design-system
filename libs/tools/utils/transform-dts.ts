#!/usr/bin/env node
import { readFile, stat, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { ImportDeclaration, Node } from "@oxc-project/types";
import MagicString from "magic-string";
import { parseSync } from "oxc-parser";
import { walk } from "oxc-walker";
import {
  findImportBySource,
  hasImportSpecifier,
  injectTypeImport
} from "./ast/imports.ts";
import { detectsRenderComponentUsage } from "./ast/qwik.ts";
import { walkFiles } from "./fs.ts";

function injectAsChildTypesIntoComponent(
  node: Node,
  content: string,
  s: MagicString
): boolean {
  if (node.type !== "ExportNamedDeclaration") return false;
  if (!("declaration" in node) || !node.declaration) return false;

  const declaration = node.declaration;
  if (declaration.type !== "VariableDeclaration") return false;
  if (!("declarations" in declaration)) return false;

  let hasChanges = false;

  for (const declarator of declaration.declarations) {
    if (declarator.type !== "VariableDeclarator") continue;
    if (!("id" in declarator) || !declarator.id || declarator.id.type !== "Identifier")
      continue;

    const id = declarator.id as Node & {
      typeAnnotation?: { typeAnnotation: Node };
    };
    if (!("typeAnnotation" in id) || !id.typeAnnotation) continue;

    const typeAnnotation = id.typeAnnotation;
    if (!("typeAnnotation" in typeAnnotation)) continue;

    const typeNode = typeAnnotation.typeAnnotation;
    if (!typeNode) continue;

    const typeStr = content.slice(typeNode.start, typeNode.end);
    if (!typeStr.includes("Component<")) continue;

    const match = typeStr.match(/Component<([^>]+)>/);
    if (!match) continue;

    const propsType = match[1];
    if (propsType.includes("AsChildTypes")) continue;

    const componentTypeEnd = typeNode.start + typeStr.lastIndexOf(">");
    s.appendLeft(componentTypeEnd, " & AsChildTypes");
    hasChanges = true;
  }

  return hasChanges;
}

/**
 * Injects AsChildTypes import into the declaration file
 */
function injectAsChildTypesImport(options: {
  ast: ReturnType<typeof parseSync>;
  magicString: MagicString;
  toolsImportNode: Node | null;
}): void {
  injectTypeImport({
    ast: options.ast,
    magicString: options.magicString,
    importSource: "@qds.dev/tools",
    specifierName: "AsChildTypes",
    existingImportNode: options.toolsImportNode
  });
}

async function transformTypeFile(dtsPath: string, sourcePath: string): Promise<boolean> {
  const content = await readFile(dtsPath, "utf-8");
  const hasAsChildTypesUsage = content.includes("AsChildTypes");

  // Quick check if AsChildTypes is already used in the file
  if (hasAsChildTypesUsage) {
    try {
      const ast = parseSync(dtsPath, content);
      const toolsImportNode = findImportBySource(ast, content, "@qds.dev/tools");

      if (toolsImportNode) {
        const importDecl = toolsImportNode as ImportDeclaration;
        // If both import and usage exist, nothing to do
        if (hasImportSpecifier(importDecl, "AsChildTypes")) return false;
      }
    } catch {
      return false;
    }
  }

  try {
    const sourceCode = await readFile(sourcePath, "utf-8");
    if (!detectsRenderComponentUsage(sourceCode)) return false;
  } catch {
    return false;
  }

  try {
    const ast = parseSync(dtsPath, content);
    const s = new MagicString(content);
    let hasChanges = false;

    walk(ast.program, {
      enter(node: Node) {
        if (injectAsChildTypesIntoComponent(node, content, s)) {
          hasChanges = true;
        }
      }
    });

    if (!hasChanges && !hasAsChildTypesUsage) return false;

    const toolsImportNode = findImportBySource(ast, content, "@qds.dev/tools");
    injectAsChildTypesImport({
      ast,
      magicString: s,
      toolsImportNode
    });

    await writeFile(dtsPath, s.toString(), "utf-8");
    return true;
  } catch (error) {
    console.error(`Error processing ${dtsPath}:`, error);
    return false;
  }
}

async function main() {
  const sourceDir = process.argv[2] || "./src";
  const declDir = process.argv[3] || "./lib-types";

  console.log(`🔍 Scanning ${sourceDir} for source files...`);

  let processedCount = 0;
  let changedCount = 0;

  for await (const sourcePath of walkFiles(sourceDir, ".tsx")) {
    const relativePath = relative(sourceDir, sourcePath);
    const dtsPath = join(declDir, relativePath.replace(/\.tsx$/, ".d.ts"));

    try {
      await stat(dtsPath);
    } catch {
      continue;
    }

    processedCount++;
    const changed = await transformTypeFile(dtsPath, sourcePath);
    if (changed) {
      changedCount++;
      console.log(`✓ Transformed ${dtsPath}`);
    }
  }

  console.log(
    `\n✨ Processed ${processedCount} files, transformed ${changedCount} files`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}

export { injectAsChildTypesImport, injectAsChildTypesIntoComponent, transformTypeFile };
