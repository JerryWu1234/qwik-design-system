import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";

/**
 * Convert PascalCase to kebab-case
 * @param str - Input string
 * @returns kebab-case string
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Convert kebab-case or snake_case to PascalCase
 * @param str - Input string
 * @returns PascalCase string
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Sanitize icon name to ensure valid identifier
 * @param name - Icon name
 * @param packName - Pack name (for custom sanitization)
 * @param customSanitizer - Optional custom sanitization function
 * @returns Sanitized icon name
 */
export function sanitizeIconName(
  name: string,
  packName: string,
  customSanitizer?: (pascal: string) => string
): string {
  if (customSanitizer) {
    return customSanitizer(name);
  }
  return /^\d/.test(name) ? `Icon${name}` : name;
}

/**
 * Resolve icon names to possible variants (kebab-case and lowercase)
 * @param pascalName - Icon name in PascalCase
 * @returns Array of possible icon name variants
 */
export function resolveIconNames(pascalName: string): string[] {
  const kebab = toKebabCase(pascalName);
  return [kebab, pascalName.toLowerCase()];
}

/**
 * Generate stable import variable name for an icon
 * @param prefix - Iconify prefix
 * @param name - Icon name (kebab-case)
 * @param existingVars - Set of existing variable names in the file
 * @returns Unique variable name
 */
export function generateImportVar(
  prefix: string,
  name: string,
  existingVars: Set<string>
): string {
  const baseName = `__qds_i_${prefix.replace(/-/g, "_")}_${name.replace(/-/g, "_")}`;
  let varName = baseName;
  let counter = 1;

  while (existingVars.has(varName)) {
    varName = `${baseName}_${counter}`;
    counter++;
  }

  existingVars.add(varName);
  return varName;
}

/**
 * Get available Iconify collections from @iconify/json
 * @returns Array of collection prefixes
 */
export function getAvailableCollections(): string[] {
  try {
    const require = createRequire(import.meta.url);
    const iconifyJsonPath = require.resolve("@iconify/json/package.json");
    const collectionsDir = `${dirname(iconifyJsonPath)}/json`;

    return readdirSync(collectionsDir)
      .filter((file: string) => file.endsWith(".json"))
      .map((file: string) => file.replace(".json", ""));
  } catch (error) {
    return [];
  }
}

/**
 * Discover all available iconify collections from node_modules
 * @returns Record of collection names to their configurations
 */
export function discoverAllIconifyCollections(): Record<
  string,
  { iconifyPrefix: string }
> {
  try {
    const require = createRequire(import.meta.url);
    const iconifyPath = `${dirname(require.resolve("@iconify/json/package.json"))}/json`;
    console.log("[icons] Looking for iconify collections at:", iconifyPath);

    const collections: Record<string, { iconifyPrefix: string }> = {};

    // Read all .json files in the iconify collections directory
    const files = readdirSync(iconifyPath).filter((file) => file.endsWith(".json"));
    console.log(`[icons] Found ${files.length} .json files in iconify directory`);

    for (const file of files) {
      const prefix = file.replace(".json", "");
      const collectionName = toPascalCase(prefix);

      // Skip if collection name is not valid (contains special chars, etc.)
      if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(collectionName)) {
        console.log(
          `[icons] Skipping invalid collection name: ${collectionName} (from ${prefix})`
        );
        continue;
      }

      collections[collectionName] = { iconifyPrefix: prefix };
      console.log(`[icons] Added collection: ${collectionName} -> ${prefix}`);
    }

    console.log(
      `[icons] Discovered ${Object.keys(collections).length} iconify collections`
    );
    return collections;
  } catch (error) {
    console.error("[icons] Error discovering iconify collections:", error);
    throw error;
  }
}
