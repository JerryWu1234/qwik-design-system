import type { Node } from "@oxc-project/types";

export function getNodeText(node: Node, source: string): string {
  return source.slice(node.start, node.end);
}

export function isCallExpressionWithName(
  node: Node,
  source: string,
  name: string
): boolean {
  if (node.type !== "CallExpression") return false;
  if (!("callee" in node)) return false;
  if (node.callee?.type !== "Identifier") return false;

  const calleeName = getNodeText(node.callee, source);
  return calleeName === name;
}

export function isIdentifierWithName(node: Node, source: string, name: string): boolean {
  if (node.type !== "Identifier") return false;

  const identifierName = getNodeText(node, source);
  return identifierName === name;
}
