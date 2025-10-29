#!/usr/bin/env node
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { ImportDeclaration, Node } from "@oxc-project/types";
import MagicString from "magic-string";
import { parseSync } from "oxc-parser";
import { walk } from "oxc-walker";
import { isCallExpressionWithName } from "./ast/core.ts";
import { findImportBySource } from "./ast/imports.ts";
import { isJSXElementWithName } from "./ast/jsx-helpers.ts";

async function* walkFiles(dir: string, extension: string): AsyncGenerator<string> {
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

function isRenderElement(node: Node, code: string): boolean {
  return isJSXElementWithName(node, code, "Render");
}

function returnsRenderComponent(callback: Node, code: string): boolean {
  let hasRenderReturn = false;

  walk(callback, {
    enter(node: Node) {
      if (node.type === "ReturnStatement" && "argument" in node && node.argument) {
        if (isRenderElement(node.argument, code)) {
          hasRenderReturn = true;
          return;
        }
      }

      if (isRenderElement(node, code)) {
        hasRenderReturn = true;
      }
    }
  });

  return hasRenderReturn;
}

function detectsRenderComponentUsage(sourceCode: string): boolean {
  try {
    const ast = parseSync("temp.tsx", sourceCode);
    let hasRenderComponent = false;

    walk(ast.program, {
      enter(node: Node) {
        if (!isCallExpressionWithName(node, sourceCode, "component$")) return;
        if (!("arguments" in node)) return;

        const callback = node.arguments[0];
        if (!callback) return;
        if (
          callback.type !== "ArrowFunctionExpression" &&
          callback.type !== "FunctionExpression"
        ) {
          return;
        }

        if (returnsRenderComponent(callback, sourceCode)) {
          hasRenderComponent = true;
        }
      }
    });

    return hasRenderComponent;
  } catch {
    return false;
  }
}

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

function findToolsImport(
  ast: ReturnType<typeof parseSync>,
  content: string
): Node | null {
  return findImportBySource(ast, content, "@qds.dev/tools");
}

function injectAsChildTypesImport(
  ast: ReturnType<typeof parseSync>,
  content: string,
  s: MagicString,
  toolsImportNode: Node | null
): void {
  if (toolsImportNode) {
    const importDecl = toolsImportNode as ImportDeclaration;
    if (importDecl.specifiers && importDecl.specifiers.length > 0) {
      const lastSpecifier = importDecl.specifiers[importDecl.specifiers.length - 1];
      s.appendLeft(lastSpecifier.end, ", type AsChildTypes");
    }
    return;
  }

  const firstImport = ast.program.body.find(
    (node: Node) => node.type === "ImportDeclaration"
  );
  if (firstImport) {
    s.appendLeft(
      firstImport.start,
      'import type { AsChildTypes } from "@qds.dev/tools";\n'
    );
  }
}

async function transformTypeFile(dtsPath: string, sourcePath: string): Promise<boolean> {
  const content = await readFile(dtsPath, "utf-8");
  if (content.includes("AsChildTypes")) return false;

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

    if (!hasChanges) return false;

    const toolsImportNode = findToolsImport(ast, content);
    injectAsChildTypesImport(ast, content, s, toolsImportNode);

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

export {
  detectsRenderComponentUsage,
  findToolsImport,
  injectAsChildTypesImport,
  injectAsChildTypesIntoComponent,
  isRenderElement,
  returnsRenderComponent,
  transformTypeFile,
  walkFiles
};
