import type { Node } from "@oxc-project/types";
import MagicString from "magic-string";
import { walk } from "oxc-walker";
import { remark } from "remark";
import remarkMdx from "remark-mdx";
import type { PacksMap } from "../../../vite/icons";
import { extractMDXImportAliases } from "../import-resolver";
import type { MDXJSXElement, MDXNode } from "../types/mdx-ast";
import { buildSVGElement, generateIconImport, type TransformContext } from "./shared";

/**
 * Extract attributes from MDX JSX node, handling title and description specially
 * @param jsxNode - MDX JSX node
 * @returns Object with attributes array and special props
 */
export function extractMDXAttributes(jsxNode: MDXJSXElement): {
  attrs: string[];
  titleProp?: string;
  descriptionProp?: string;
} {
  const attrs: string[] = [];
  let titleProp: string | undefined;
  let descriptionProp: string | undefined;

  if (!jsxNode.attributes || !Array.isArray(jsxNode.attributes)) {
    return { attrs };
  }

  for (const attr of jsxNode.attributes) {
    if (
      typeof attr === "object" &&
      attr !== null &&
      attr.type === "mdxJsxAttribute" &&
      typeof attr.name === "string"
    ) {
      const attrName = attr.name;

      // Handle title prop specially
      if (attrName === "title") {
        if (typeof attr.value === "string") {
          titleProp = `"${attr.value}"`;
        } else if (
          typeof attr.value === "object" &&
          attr.value.type === "mdxJsxAttributeValueExpression" &&
          "value" in attr.value &&
          attr.value.value
        ) {
          // Extract just the expression content (no braces needed, already stripped)
          titleProp = attr.value.value;
        }
        continue;
      }

      // Handle description prop specially
      if (attrName === "description") {
        if (typeof attr.value === "string") {
          descriptionProp = `"${attr.value}"`;
        } else if (
          typeof attr.value === "object" &&
          attr.value.type === "mdxJsxAttributeValueExpression" &&
          "value" in attr.value &&
          attr.value.value
        ) {
          // Extract just the expression content (no braces needed, already stripped)
          descriptionProp = attr.value.value;
        }
        continue;
      }

      // Handle other attributes normally
      if (!attr.value) {
        // Boolean attribute
        attrs.push(attrName);
      } else if (typeof attr.value === "string") {
        // String literal
        attrs.push(`${attrName}="${attr.value}"`);
      } else if (
        typeof attr.value === "object" &&
        attr.value.type === "mdxJsxAttributeValueExpression" &&
        "value" in attr.value
      ) {
        const exprValue = attr.value.value;
        if (exprValue) {
          attrs.push(`${attrName}={${exprValue}}`);
        }
      }
    }
  }

  return { attrs, titleProp, descriptionProp };
}

/**
 * Transform MDX file using remark-mdx for semantic analysis
 * @param code - Original MDX source code
 * @param id - File ID
 * @param importSources - Sources to scan for imports
 * @param availableCollections - Set of available collection names
 * @param collectionNames - Map of alias to collection name
 * @param packs - Custom packs configuration
 * @param debug - Debug logging function
 * @returns Transformation result or null
 */
export function transformMDXFile(
  code: string,
  id: string,
  importSources: string[],
  availableCollections: Set<string>,
  collectionNames: Map<string, string>,
  packs: PacksMap | undefined,
  debug: (message: string, ...data: unknown[]) => void
): { code: string; map: ReturnType<MagicString["generateMap"]> } | null {
  try {
    debug(`[MDX] Parsing ${id}`);

    // Parse MDX to MDAST
    const mdast = remark().use(remarkMdx).parse(code);

    // Extract import information from MDAST's ESTree data
    const aliasToPack = extractMDXImportAliases(
      mdast,
      importSources,
      availableCollections,
      collectionNames,
      packs,
      debug
    );
    if (aliasToPack.size === 0) {
      debug(`[MDX] No icon imports found in ${id}`);
      return null;
    }

    debug("[MDX] Found icon imports:", Array.from(aliasToPack.entries()));

    const s = new MagicString(code);
    const ctx: TransformContext = {
      usedImports: new Set<string>(),
      importVars: new Set<string>(),
      virtualToVar: new Map<string, string>()
    };
    let hasChanges = false;

    // Use oxc-walker to traverse MDAST (it's ESTree-compatible at runtime!)
    walk(mdast as unknown as Node, {
      enter(node) {
        // Type guard for MDX JSX nodes
        const mdxNode = node as unknown as MDXNode;

        if (
          mdxNode.type !== "mdxJsxFlowElement" &&
          mdxNode.type !== "mdxJsxTextElement"
        ) {
          return;
        }

        const jsxNode = mdxNode as MDXJSXElement;

        if (!jsxNode.name || typeof jsxNode.name !== "string") {
          return;
        }

        // Check if this is a JSX member expression (e.g., Lucide.Check)
        const parts = jsxNode.name.split(".");
        if (parts.length !== 2) {
          return;
        }

        const alias = parts[0];
        const iconName = parts[1];
        if (!alias || !iconName) {
          return;
        }

        const packName = aliasToPack.get(alias);
        if (!packName) {
          return;
        }

        debug(`[MDX] Transforming ${alias}.${iconName}`);

        // Generate import using shared function
        const { varName } = generateIconImport(
          alias,
          iconName,
          packName,
          packs,
          collectionNames,
          ctx
        );

        // Extract attributes using shared function
        const { attrs, titleProp, descriptionProp } = extractMDXAttributes(jsxNode);

        // Build children from title and description props
        const childrenParts: string[] = [];
        if (titleProp) {
          if (titleProp.startsWith('"') || titleProp.startsWith("'")) {
            const titleValue = titleProp.slice(1, -1);
            childrenParts.push(`<title>${titleValue}</title>`);
          } else {
            childrenParts.push(`<title>{${titleProp}}</title>`);
          }
        }
        if (descriptionProp) {
          if (descriptionProp.startsWith('"') || descriptionProp.startsWith("'")) {
            const descValue = descriptionProp.slice(1, -1);
            childrenParts.push(`<desc>${descValue}</desc>`);
          } else {
            childrenParts.push(`<desc>{${descriptionProp}}</desc>`);
          }
        }

        const children = childrenParts.length > 0 ? childrenParts.join("") : undefined;

        // Build SVG element using shared function
        const svgReplacement = buildSVGElement(attrs, varName, children);

        // Replace in original source using position data from MDX
        if (
          jsxNode.position?.start?.offset !== undefined &&
          jsxNode.position?.end?.offset !== undefined
        ) {
          const start: number = jsxNode.position.start.offset;
          const end: number = jsxNode.position.end.offset;
          s.overwrite(start, end, svgReplacement);
          hasChanges = true;

          debug(`[MDX] Replaced ${alias}.${iconName} at position ${start}-${end}`);
        }
      }
    });

    if (!hasChanges) {
      debug(`[MDX] No icon elements found in ${id}`);
      return null;
    }

    // Generate import statements using shared logic
    const importStatements = Array.from(ctx.usedImports)
      .map((virtualId) => {
        const importVar = ctx.virtualToVar.get(virtualId);
        return `import ${importVar} from '${virtualId}';`;
      })
      .join("\n");

    // Find where to insert imports (after frontmatter if it exists)
    let insertPos = 0;
    if (code.startsWith("---")) {
      const secondDelimiter = code.indexOf("---", 3);
      if (secondDelimiter !== -1) {
        insertPos = secondDelimiter + 3;
        // Skip any newlines after frontmatter
        while (
          insertPos < code.length &&
          (code[insertPos] === "\n" || code[insertPos] === "\r")
        ) {
          insertPos++;
        }
      }
    }

    s.appendLeft(insertPos, `${importStatements}\n`);

    debug(`[MDX] Transformation complete for ${id}`);
    return {
      code: s.toString(),
      map: s.generateMap({ hires: true })
    };
  } catch (error) {
    debug("[MDX] Error transforming:", error);
    return null;
  }
}
