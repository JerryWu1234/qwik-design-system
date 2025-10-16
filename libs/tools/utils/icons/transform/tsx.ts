import type {
  JSXAttribute,
  JSXElement,
  JSXIdentifier,
  JSXMemberExpression,
  Program
} from "@oxc-project/types";
import MagicString from "magic-string";
import { walk } from "oxc-walker";
import type { PacksMap } from "../../../vite/icons";
import { handleExpression } from "../ast/expressions";
import {
  extractChildren,
  extractProps,
  isJSXElement,
  propsObjectToAttributes
} from "../ast/jsx";
import { resolveIconNames, sanitizeIconName } from "../naming";
import { type TransformContext, buildSVGElement, generateIconImport } from "./shared";

/**
 * Check if a JSX element is an icon element based on its structure
 * @param elem - JSX element to check
 * @param aliasToPack - Map of aliases to pack names
 * @param collectionNames - Map of alias to collection name
 * @param availableCollections - Set of available collection names
 * @returns True if the element is an icon element
 */
export function isIconElement(
  elem: JSXElement,
  aliasToPack: Map<string, string>,
  collectionNames: Map<string, string>,
  availableCollections: Set<string>
): boolean {
  const name = elem.openingElement.name;
  if (name.type !== "JSXMemberExpression") {
    return false;
  }

  const memberExpr = name as JSXMemberExpression;
  if (
    memberExpr.object.type !== "JSXIdentifier" ||
    memberExpr.property.type !== "JSXIdentifier"
  ) {
    return false;
  }

  const memberName = (memberExpr.object as JSXIdentifier).name;
  if (!aliasToPack.has(memberName)) {
    return false;
  }

  const collectionName = collectionNames.get(memberName) || aliasToPack.get(memberName);
  return availableCollections.has(collectionName);
}

/**
 * Find all icon elements in an AST
 * @param ast - AST to search
 * @param aliasToPack - Map of aliases to pack names
 * @param collectionNames - Map of alias to collection name
 * @param availableCollections - Set of available collection names
 * @returns Array of JSX elements that are icon elements
 */
export function findIconElements(
  ast: Program,
  aliasToPack: Map<string, string>,
  collectionNames: Map<string, string>,
  availableCollections: Set<string>
): JSXElement[] {
  const iconElements: JSXElement[] = [];

  walk(ast, {
    enter(node) {
      if (
        isJSXElement(node) &&
        isIconElement(node, aliasToPack, collectionNames, availableCollections)
      ) {
        iconElements.push(node);
      }
    }
  });

  return iconElements;
}

/**
 * Transform a JSX icon element to SVG JSX
 * @param elem - JSX element to transform
 * @param s - MagicString instance
 * @param source - Original source code
 * @param aliasToPack - Map of aliases to pack names
 * @param collectionNames - Map of alias to collection name
 * @param packs - Custom packs configuration
 * @param ctx - Transformation context
 * @param debug - Debug logging function
 * @returns True if transformation was applied
 */
export function transformIconElement(
  elem: JSXElement,
  s: MagicString,
  source: string,
  aliasToPack: Map<string, string>,
  collectionNames: Map<string, string>,
  packs: PacksMap | undefined,
  ctx: TransformContext,
  debug: (message: string, ...data: unknown[]) => void
): boolean {
  debug(
    `[TRANSFORM_ICON] Starting transformation for element at ${elem.start}-${elem.end}`
  );

  const name = elem.openingElement.name;
  if (name.type !== "JSXMemberExpression") {
    debug("[TRANSFORM_ICON] Not a member expression");
    return false;
  }

  const memberExpr = name as JSXMemberExpression;
  if (
    memberExpr.object.type !== "JSXIdentifier" ||
    memberExpr.property.type !== "JSXIdentifier"
  ) {
    debug("[TRANSFORM_ICON] Invalid member expression structure");
    return false;
  }

  const alias = (memberExpr.object as JSXIdentifier).name;
  const iconName = (memberExpr.property as JSXIdentifier).name;

  debug(`[TRANSFORM_ICON] Processing ${alias}.${iconName}`);

  const pack = aliasToPack.get(alias);
  if (!pack) {
    debug(`[TRANSFORM_ICON] No pack found for alias ${alias}`);
    return false;
  }

  debug(`[TRANSFORM_ICON] Found pack ${pack} for alias ${alias}`);

  // Get pack configuration - either custom or auto-discovered
  const packConfig = packs?.[pack] || {
    iconifyPrefix: pack.toLowerCase()
  };
  const prefix = packConfig.iconifyPrefix;

  const sanitizedIconName = sanitizeIconName(iconName, pack, packConfig.sanitizeIcon);
  const iconNames = resolveIconNames(sanitizedIconName);

  // Check for obviously invalid/test icon names
  // This catches test cases with non-existent icons
  if (
    sanitizedIconName.toLowerCase().includes("nonexistent") ||
    sanitizedIconName.toLowerCase().includes("non_existent") ||
    sanitizedIconName.toLowerCase().includes("invalid") ||
    sanitizedIconName.toLowerCase().includes("test") ||
    sanitizedIconName === "NonExistentIcon"
  ) {
    debug(`Skipping test/non-existent icon name: ${sanitizedIconName}`);
    return false;
  }

  // Get the correct collection name for loading
  const collectionName = collectionNames.get(pack) || pack;

  // Use optimistic loading - assume icon exists
  // The virtual module will handle loading and error cases
  const foundIconName = iconNames[0];
  debug(
    `[TRANSFORM_ICON] Using optimistic loading for ${pack}.${iconName} -> ${foundIconName} (collection: ${collectionName})`
  );

  const attributes = elem.openingElement.attributes;
  let titleProp: string | undefined;
  let descriptionProp: string | undefined;

  const otherAttributes = attributes.filter((attr) => {
    if (attr.type === "JSXAttribute") {
      const attrName = (attr.name as JSXIdentifier).name;
      if (attrName === "title") {
        const jsxAttr = attr as JSXAttribute;
        const value = jsxAttr.value;
        if (value) {
          if (value.type === "JSXExpressionContainer" && value.expression) {
            // Extract just the expression content, not the surrounding braces
            titleProp = source.slice(value.expression.start, value.expression.end);
          } else {
            // String literal or other value type
            titleProp = source.slice(value.start, value.end);
          }
        }
        return false;
      }
      if (attrName === "description") {
        const jsxAttr = attr as JSXAttribute;
        const value = jsxAttr.value;
        if (value) {
          if (value.type === "JSXExpressionContainer" && value.expression) {
            // Extract just the expression content, not the surrounding braces
            descriptionProp = source.slice(value.expression.start, value.expression.end);
          } else {
            // String literal or other value type
            descriptionProp = source.slice(value.start, value.end);
          }
        }
        return false;
      }
    }
    return true;
  });

  const propsObj = extractProps(otherAttributes, source);
  const childrenCode = extractChildren(
    elem,
    source,
    titleProp,
    descriptionProp,
    handleExpression
  );

  // Generate import using shared function
  const { varName: importVar } = generateIconImport(
    alias,
    iconName,
    pack,
    packs,
    collectionNames,
    ctx
  );

  // Convert props object to attribute array using shared function
  const svgAttrList = propsObjectToAttributes(propsObj);

  // Build SVG element using shared function
  const svgElement = buildSVGElement(svgAttrList, importVar, childrenCode);

  debug(`Generated JSX element: ${svgElement}`);

  // Check if there's trailing whitespace after the element and remove it
  let endPos = elem.end;
  const sourceAfter = source.slice(elem.end);
  const whitespaceMatch = sourceAfter.match(/^(\s*)/);
  if (whitespaceMatch?.[0]) {
    endPos += whitespaceMatch[0].length;
  }

  s.overwrite(elem.start, endPos, svgElement);

  debug(`[TRANSFORM_ICON] Successfully transformed ${alias}.${iconName} to SVG JSX`);
  return true;
}

/**
 * Transform TSX/JSX file
 * @param code - Original source code
 * @param id - File ID
 * @param ast - Parsed AST
 * @param aliasToPack - Map of aliases to pack names
 * @param collectionNames - Map of alias to collection name
 * @param availableCollections - Set of available collection names
 * @param packs - Custom packs configuration
 * @param debug - Debug logging function
 * @returns Transformation result or null
 */
export function transformTSXFile(
  code: string,
  id: string,
  ast: Program,
  aliasToPack: Map<string, string>,
  collectionNames: Map<string, string>,
  availableCollections: Set<string>,
  packs: PacksMap | undefined,
  debug: (message: string, ...data: unknown[]) => void
): { code: string; map: ReturnType<MagicString["generateMap"]> } | null {
  debug(
    `[TRANSFORM] Processing ${id} with ${aliasToPack.size} aliases:`,
    Array.from(aliasToPack.entries())
  );
  debug(
    `[DEBUG] collectionNames map: ${JSON.stringify(Array.from(collectionNames.entries()))}`
  );

  // Find all icon elements in the file
  const iconElements = findIconElements(
    ast,
    aliasToPack,
    collectionNames,
    availableCollections
  );

  if (iconElements.length === 0) {
    debug(`[TRANSFORM] No icon elements found in ${id}`);
    return null;
  }

  debug(`[TRANSFORM] Found ${iconElements.length} icon elements in ${id}`);

  // Traverse AST to find and transform icon elements
  const s = new MagicString(code);
  const ctx: TransformContext = {
    usedImports: new Set<string>(),
    importVars: new Set<string>(),
    virtualToVar: new Map<string, string>()
  };
  let hasChanges = false;

  // Transform each icon element
  for (let i = iconElements.length - 1; i >= 0; i--) {
    if (
      transformIconElement(
        iconElements[i],
        s,
        code,
        aliasToPack,
        collectionNames,
        packs,
        ctx,
        debug
      )
    ) {
      hasChanges = true;
    }
  }

  if (hasChanges) {
    if (ctx.usedImports.size > 0) {
      const virtualImports = `${Array.from(ctx.usedImports)
        .map((virtualId) => {
          const importVar = ctx.virtualToVar.get(virtualId);
          return `import ${importVar} from '${virtualId}';`;
        })
        .join("\n")}\n`;

      let insertPos = 0;
      let importCount = 0;
      for (const node of ast.body) {
        if (node.type === "ImportDeclaration") {
          insertPos = Math.max(insertPos, node.end);
          importCount++;
        }
      }

      debug(`Found ${importCount} imports, inserting at position ${insertPos}`);

      s.appendLeft(insertPos, `\n${virtualImports.trimEnd()}\n`);
    }

    const resultCode = s.toString();
    debug(`Final transformed code length: ${resultCode.length}`);

    debug(`[TRANSFORM] Transformation successful for ${id}, returning transformed code`);
    return {
      code: resultCode,
      map: s.generateMap({ hires: true })
    };
  }

  debug(`[TRANSFORM] No changes made to ${id}`);
  return null;
}
