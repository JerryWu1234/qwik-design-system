import type { CallExpression, ImportDeclaration, Node } from "@oxc-project/types";
import MagicString from "magic-string";
import { parseSync } from "oxc-parser";
import { walk } from "oxc-walker";

/**
 * This plugin transforms hooks and patterns used in our libraries to improve developer experience.
 */
export function qdsTransformPlugin() {
  return {
    name: "qds-transform",
    enforce: "pre" as const,

    transform(code: string, id: string) {
      const isJsxFile = /\.[jt]sx?$/.test(id);
      if (!isJsxFile) return null;

      let ast: ReturnType<typeof parseSync>;
      try {
        ast = parseSync(id, code);
      } catch {
        return null;
      }

      const s = new MagicString(code);
      let hasChanges = false;
      let needsDollarImport = false;

      walk(ast.program, {
        enter(node: Node) {
          if (node.type !== "CallExpression") return;

          const callExpr = node;
          if (!isUseMountTaskCall(callExpr, code)) return;

          const callback = callExpr.arguments[0];
          if (!callback) return;
          if (
            callback.type !== "ArrowFunctionExpression" &&
            callback.type !== "FunctionExpression"
          )
            return;

          processCleanupCalls(callback, code, s, () => {
            hasChanges = true;
            needsDollarImport = true;
          });
        }
      });

      if (!hasChanges) {
        return null;
      }

      if (needsDollarImport) {
        injectDollarImport(ast, code, s);
      }

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      };
    }
  };
}

/**
 * Process cleanup calls within a useMountTask$ callback
 */
function processCleanupCalls(
  callback: Node,
  code: string,
  s: MagicString,
  onTransform: () => void
): void {
  walk(callback, {
    enter(node: Node) {
      if (node.type !== "CallExpression") return;

      const callExpr = node;
      if (!isCleanupCall(callExpr, code)) return;

      const cleanupArg = callExpr.arguments[0];
      if (!cleanupArg) return;
      if (
        cleanupArg.type !== "ArrowFunctionExpression" &&
        cleanupArg.type !== "FunctionExpression"
      )
        return;
      if (isAlreadyWrappedWithQrl(callExpr, code)) return;

      // wrap the callback with $()
      s.prependLeft(cleanupArg.start, "$(");
      s.appendRight(cleanupArg.end, ")");
      onTransform();
    }
  });
}

/**
 * Check if a call expression is useMountTask$
 */
function isUseMountTaskCall(node: CallExpression, code: string): boolean {
  if (node.callee.type === "Identifier") {
    const name = code.slice(node.callee.start, node.callee.end);
    return name === "useMountTask$";
  }
  return false;
}

/**
 * Check if a call expression is cleanup()
 */
function isCleanupCall(node: CallExpression, code: string): boolean {
  if (node.callee.type === "Identifier") {
    const name = code.slice(node.callee.start, node.callee.end);
    return name === "cleanup";
  }
  return false;
}

/**
 * Check if the cleanup callback is already wrapped with $()
 */
function isAlreadyWrappedWithQrl(cleanupCall: CallExpression, code: string): boolean {
  const arg = cleanupCall.arguments[0];
  if (!arg) return false;

  if (arg.type === "CallExpression") {
    const callExpr = arg;
    if (callExpr.callee.type === "Identifier") {
      const name = code.slice(callExpr.callee.start, callExpr.callee.end);
      return name === "$";
    }
  }

  return false;
}

function injectDollarImport(
  ast: ReturnType<typeof parseSync>,
  code: string,
  s: MagicString
): void {
  let qwikCoreImport: ImportDeclaration | null = null;
  let hasDollarImport = false;

  for (const node of ast.program.body) {
    if (node.type !== "ImportDeclaration") continue;

    const importDecl = node as ImportDeclaration;
    const source = code.slice(importDecl.source.start + 1, importDecl.source.end - 1);

    if (source === "@qwik.dev/core") {
      qwikCoreImport = importDecl;

      if (importDecl.specifiers) {
        for (const specifier of importDecl.specifiers) {
          if (specifier.type === "ImportSpecifier" && "imported" in specifier) {
            const imported = specifier.imported as Node & { name?: string };
            const importedName =
              imported.name || code.slice(imported.start, imported.end);
            if (importedName === "$") {
              hasDollarImport = true;
              break;
            }
          }
        }
      }
      break;
    }
  }

  if (hasDollarImport) return;

  if (qwikCoreImport?.specifiers && qwikCoreImport.specifiers.length > 0) {
    const firstSpecifier = qwikCoreImport.specifiers[0];

    if (firstSpecifier.type === "ImportSpecifier") {
      s.prependLeft(firstSpecifier.start, "$, ");
    }
  }
}
