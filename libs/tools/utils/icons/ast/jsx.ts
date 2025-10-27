import type {
  Expression,
  JSXAttribute,
  JSXAttributeItem,
  JSXElement,
  JSXExpressionContainer,
  JSXMemberExpression,
  JSXText,
  Node
} from "@oxc-project/types";

export interface Extracted {
  type: string;
  props: string;
}

/**
 * Type guard to check if a node is a JSX element
 * @param node - AST node to check
 * @returns True if node is a JSX element
 */
export function isJSXElement(node: Node): node is JSXElement {
  return node.type === "JSXElement";
}

/**
 * Type guard to check if a node is a JSX expression container
 * @param node - AST node to check
 * @returns True if node is a JSX expression container
 */
export function isJSXExpressionContainer(node: Node): node is JSXExpressionContainer {
  return node.type === "JSXExpressionContainer";
}

/**
 * Type guard to check if a node is JSX text
 * @param node - AST node to check
 * @returns True if node is JSX text
 */
export function isJSXText(node: Node): node is JSXText {
  return node.type === "JSXText";
}

/**
 * Extracts type and props from various node types in conditional expressions
 * @param node - AST node to extract from
 * @param source - Original source code
 * @returns Object containing extracted type and props
 */
export function extractFromNode(node: Node, source: string): Extracted {
  if (isJSXElement(node)) {
    return extractFromElement(node, source);
  }
  if (node.type === "ParenthesizedExpression") {
    return extractFromNode((node as { expression: Node }).expression, source);
  }
  if (node.type === "ConditionalExpression") {
    const { test, consequent, alternate } = node;

    const testCode = source.slice(test.start, test.end);
    const isTrue = extractFromNode(consequent, source);
    const isFalse = extractFromNode(alternate, source);
    return {
      type: `${testCode} ? ${isTrue.type} : ${isFalse.type}`,
      props: `${testCode} ? ${isTrue.props} : ${isFalse.props}`
    };
  }
  if (node.type === "Identifier") {
    return {
      type: source.slice(node.start, node.end),
      props: "{}"
    };
  }
  throw new Error(`Unsupported node in conditional: ${node.type} at ${node.start}`);
}

/**
 * Extracts type and props from a JSX element
 * @param elem - JSX element to extract from
 * @param source - Original source code
 * @returns Object containing extracted type and props
 */
export function extractFromElement(elem: JSXElement, source: string): Extracted {
  const nameNode = elem.openingElement.name;
  let type: string;

  if (nameNode.type === "JSXIdentifier") {
    const name = nameNode.name;
    const isIntrinsic = name[0] === name[0].toLowerCase();
    type = isIntrinsic ? `"${name}"` : name;
  } else if (nameNode.type === "JSXMemberExpression") {
    type = extractJSXMemberExpressionName(nameNode, source);
  } else {
    throw new Error(`Unsupported JSX name type: ${nameNode.type}`);
  }

  const propsObj = extractProps(elem.openingElement.attributes, source);

  return { type, props: propsObj };
}

/**
 * Extracts the full name from a JSX member expression (e.g., Menu.Item)
 * @param memberExpr - JSX member expression node
 * @param source - Original source code
 * @returns The full member expression as a string
 */
export function extractJSXMemberExpressionName(
  memberExpr: JSXMemberExpression,
  source: string
): string {
  return source.slice(memberExpr.start, memberExpr.end);
}

/**
 * Extracts props from JSX attributes into object literal string
 * @param attributes - Array of JSX attributes
 * @param source - Original source code
 * @returns Object literal string representation of props
 */
export function extractProps(attributes: JSXAttributeItem[], source: string): string {
  const props: string[] = [];

  for (const attr of attributes) {
    if (attr.type !== "JSXAttribute") continue;

    const a = attr;
    if (a.name.type !== "JSXIdentifier") continue;

    const key = a.name.name;
    const value = getAttributeValue(a, source);
    props.push(`"${key}": ${value}`);
  }

  return `{ ${props.join(", ")} }`;
}

/**
 * Extracts the value from a JSX attribute
 * @param attr - JSX attribute to extract value from
 * @param source - Original source code
 * @returns String representation of the attribute value
 */
export function getAttributeValue(attr: JSXAttribute, source: string): string {
  if (!attr.value) return "true";
  if (attr.value.type === "Literal")
    return source.slice(attr.value.start, attr.value.end);
  if (isJSXExpressionContainer(attr.value)) {
    return source.slice(attr.value.expression.start, attr.value.expression.end);
  }
  return "true";
}

/**
 * Gets line number from source position for better error messages
 * @param source - Original source code
 * @param position - Character position in source
 * @returns Line number (1-based)
 */
export function getLineNumber(source: string, position: number): number {
  return source.slice(0, position).split("\n").length;
}

/**
 * Convert extractProps result (object string) to attribute array
 * @param propsObj - Props object string from extractProps (e.g., '{ "class": "text-red" }')
 * @returns Array of attribute strings (e.g., ['class="text-red"'])
 */
export function propsObjectToAttributes(propsObj: string): string[] {
  const attrs: string[] = [];

  if (!propsObj.trim() || propsObj === "{}") {
    return attrs;
  }

  const innerProps = propsObj.slice(1, -1).trim();
  if (!innerProps) {
    return attrs;
  }

  const propPairs = innerProps
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p);

  for (const prop of propPairs) {
    const colonIndex = prop.indexOf(":");
    if (colonIndex === -1) continue;

    const key = prop.substring(0, colonIndex).replace(/"/g, "").trim();
    const value = prop.substring(colonIndex + 1).trim();

    if (value === "true") {
      attrs.push(`${key}={true}`);
    } else if (value === "false") {
      attrs.push(`${key}={false}`);
    } else if (value.startsWith('"') && value.endsWith('"')) {
      attrs.push(`${key}=${value}`);
    } else {
      attrs.push(`${key}={${value}}`);
    }
  }

  return attrs;
}

/**
 * Extract children from JSX element, converting title and description props to SVG elements
 * @param elem - JSX element
 * @param source - Original source code
 * @param titleProp - Title prop value if present
 * @param descriptionProp - Description prop value if present
 * @param handleExpression - Expression handler function
 * @returns Children JSX code or null
 */
export function extractChildren(
  elem: JSXElement,
  source: string,
  titleProp: string | undefined,
  descriptionProp: string | undefined,
  handleExpression: (expr: Expression, source: string) => unknown
): string | null {
  const existingChildren = elem.children.filter(
    (child) => !isJSXText(child) || child.value.trim() !== ""
  );

  const childrenParts: string[] = [];

  // Add title element if title prop exists
  if (titleProp) {
    if (titleProp.startsWith('"') || titleProp.startsWith("'")) {
      // String literal
      const titleValue = titleProp.slice(1, -1);
      childrenParts.push(`<title>${titleValue}</title>`);
    } else {
      // Expression
      childrenParts.push(`<title>{${titleProp}}</title>`);
    }
  }

  // Add desc element if description prop exists
  if (descriptionProp) {
    if (descriptionProp.startsWith('"') || descriptionProp.startsWith("'")) {
      // String literal
      const descValue = descriptionProp.slice(1, -1);
      childrenParts.push(`<desc>${descValue}</desc>`);
    } else {
      // Expression
      childrenParts.push(`<desc>{${descriptionProp}}</desc>`);
    }
  }

  // Add existing children - any valid SVG element can be included
  for (const child of existingChildren) {
    if (isJSXElement(child)) {
      // Extract tag name to validate it's a valid SVG element
      let tagName = "";
      const nameNode = child.openingElement.name;
      if (nameNode.type === "JSXIdentifier") {
        tagName = nameNode.name;
      } else if (
        nameNode.type === "JSXMemberExpression" &&
        nameNode.property.type === "JSXIdentifier"
      ) {
        tagName = nameNode.property.name;
      }

      // Include valid SVG elements (title, desc, and any other SVG element)
      // We'll let the SVG spec and browser handle validation
      if (tagName) {
        childrenParts.push(source.slice(child.start, child.end));
      }
    } else if (isJSXExpressionContainer(child)) {
      // Handle expressions using the existing handleExpression utility
      // Skip empty JSX expressions
      if (child.expression.type !== "JSXEmptyExpression") {
        const result = handleExpression(child.expression, source);
        if (result) {
          childrenParts.push(source.slice(child.start, child.end));
        } else {
          // Fallback to raw source
          childrenParts.push(source.slice(child.start, child.end));
        }
      }
    } else {
      // Text or other content
      childrenParts.push(source.slice(child.start, child.end));
    }
  }

  if (childrenParts.length === 0) {
    return null;
  }

  if (childrenParts.length === 1) {
    return childrenParts[0];
  }

  return childrenParts.join("");
}
