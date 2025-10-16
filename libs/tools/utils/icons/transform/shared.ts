import type { PacksMap } from "../../../vite/icons";
import { generateImportVar, sanitizeIconName, toKebabCase } from "../naming";

/**
 * Shared transformation context for both TSX/JSX and MDX files
 */
export interface TransformContext {
  usedImports: Set<string>;
  importVars: Set<string>;
  virtualToVar: Map<string, string>;
}

/**
 * Generate virtual module ID and import variable for an icon
 * @param alias - The import alias used in the code
 * @param iconName - The icon name (PascalCase)
 * @param packName - The pack name
 * @param packs - Custom packs configuration
 * @param collectionNames - Map of alias to collection name
 * @param ctx - Transformation context
 * @returns Object with virtualId and varName
 */
export function generateIconImport(
  alias: string,
  iconName: string,
  packName: string,
  packs: PacksMap | undefined,
  collectionNames: Map<string, string>,
  ctx: TransformContext
): { virtualId: string; varName: string } {
  // Get pack configuration
  const packConfig = packs?.[packName] || {
    iconifyPrefix: packName.toLowerCase()
  };
  const prefix = packConfig.iconifyPrefix;

  // Generate icon import
  const sanitizedIconName = sanitizeIconName(iconName, packName, packConfig.sanitizeIcon);
  const kebab = toKebabCase(sanitizedIconName);

  // Get the correct collection name
  const collectionName = collectionNames.get(alias) || prefix;
  const virtualId = `virtual:icons/${collectionName}/${kebab}`;

  // Reuse or create new import variable
  let varName = ctx.virtualToVar.get(virtualId);
  if (!varName) {
    varName = generateImportVar(prefix, kebab, ctx.importVars);
    ctx.virtualToVar.set(virtualId, varName);
    ctx.usedImports.add(virtualId);
  }

  return { virtualId, varName };
}

/**
 * Build SVG element string from attributes and import variable
 * @param attrs - Array of attribute strings
 * @param varName - Import variable name for dangerouslySetInnerHTML
 * @param children - Optional children JSX code
 * @returns Complete SVG element string
 */
export function buildSVGElement(
  attrs: string[],
  varName: string,
  children?: string
): string {
  attrs.push('viewBox="0 0 24 24"');
  attrs.push(`dangerouslySetInnerHTML={${varName}}`);

  const attrsStr = attrs.join(" ");

  if (children) {
    return `<svg ${attrsStr}>${children}</svg>`;
  }

  return `<svg ${attrsStr} />`;
}
