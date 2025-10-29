import type { Node } from "@oxc-project/types";
import { getNodeText } from "./core.ts";

export function getJSXElementName(node: Node, source: string): string | null {
  if (node.type !== "JSXElement") return null;
  if (!("openingElement" in node)) return null;
  if (node.openingElement.name.type !== "JSXIdentifier") return null;

  return getNodeText(node.openingElement.name, source);
}

export function isJSXElementWithName(node: Node, source: string, name: string): boolean {
  return getJSXElementName(node, source) === name;
}
