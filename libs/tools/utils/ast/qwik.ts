import type { Node } from "@oxc-project/types";
import { parseSync } from "oxc-parser";
import { walk } from "oxc-walker";
import { isCallExpressionWithName } from "./core.ts";
import { isJSXElementWithName } from "./jsx-helpers.ts";

/**
 * Checks if a node is a Render JSX element
 */
export function isRenderElement(node: Node, code: string): boolean {
  return isJSXElementWithName(node, code, "Render");
}

/**
 * Checks if a callback function returns a Render component
 */
export function returnsRenderComponent(callback: Node, code: string): boolean {
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

/**
 * Detects if the source code uses the Render component pattern within a component$
 */
export function detectsRenderComponentUsage(sourceCode: string): boolean {
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
