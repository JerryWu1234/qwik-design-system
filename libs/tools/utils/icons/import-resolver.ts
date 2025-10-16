import type { Program } from "@oxc-project/types";
import { walk } from "oxc-walker";
import type { remark } from "remark";
import type { PacksMap } from "../../vite/icons";
import { toKebabCase } from "./naming";

/**
 * Map an imported name to a pack and collection name
 * @param importedName - The imported name from the import specifier
 * @param localAlias - The local alias for the import
 * @param aliasToPack - Map to store the alias to pack mapping
 * @param availableCollections - Set of available collection names
 * @param collectionNames - Map of alias to collection name
 * @param packs - Custom packs configuration
 * @param debug - Debug logging function
 * @param prefix - Debug prefix (e.g., "[MDX]")
 */
export function mapImportToPack(
  importedName: string,
  localAlias: string,
  aliasToPack: Map<string, string>,
  availableCollections: Set<string>,
  collectionNames: Map<string, string>,
  packs: PacksMap | undefined,
  debug: (message: string, ...data: unknown[]) => void,
  prefix = ""
): void {
  const kebabName = toKebabCase(importedName);

  if (availableCollections.has(kebabName)) {
    aliasToPack.set(localAlias, importedName);
    collectionNames.set(localAlias, kebabName);
    debug(
      `${prefix}Mapped alias ${localAlias} -> ${importedName} (collection: ${kebabName})`
    );
  } else if (packs?.[importedName]) {
    aliasToPack.set(localAlias, importedName);
    debug(`${prefix}Mapped alias ${localAlias} -> ${importedName} (custom pack)`);
  }
}

/**
 * Resolve import aliases from AST (for TSX/JSX files)
 * @param ast - AST program
 * @param importSources - Sources to scan for imports
 * @param availableCollections - Set of available collection names
 * @param collectionNames - Map of alias to collection name
 * @param packs - Custom packs configuration
 * @param debug - Debug logging function
 * @returns Map of local alias to pack name
 */
export function resolveImportAliases(
  ast: Program,
  importSources: string[],
  availableCollections: Set<string>,
  collectionNames: Map<string, string>,
  packs: PacksMap | undefined,
  debug: (message: string, ...data: unknown[]) => void
): Map<string, string> {
  const aliasToPack = new Map<string, string>();

  walk(ast, {
    enter(node) {
      if (node.type !== "ImportDeclaration") {
        return;
      }

      const importDeclaration = node;
      const importSource = importDeclaration.source.value;

      if (!importSources.includes(importSource)) {
        return;
      }

      debug(`Found import from ${importSource}`);

      for (const specifier of importDeclaration.specifiers) {
        if (specifier.type !== "ImportSpecifier") {
          continue;
        }
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const spec = specifier as any;
        const importedName =
          spec.imported?.name || spec.imported?.value || spec.local.name;
        const localAlias = spec.local.name;

        mapImportToPack(
          importedName,
          localAlias,
          aliasToPack,
          availableCollections,
          collectionNames,
          packs,
          debug
        );
      }
    }
  });

  return aliasToPack;
}

/**
 * Extract import aliases from MDX MDAST using its built-in ESTree data
 * Uses oxc-walker for fast traversal
 * @param mdast - The MDAST from remark-mdx
 * @param importSources - Sources to scan for imports
 * @param availableCollections - Set of available collection names
 * @param collectionNames - Map of alias to collection name
 * @param packs - Custom packs configuration
 * @param debug - Debug logging function
 * @returns Map of local alias to pack name
 */
export function extractMDXImportAliases(
  mdast: ReturnType<ReturnType<typeof remark>["parse"]>,
  importSources: string[],
  availableCollections: Set<string>,
  collectionNames: Map<string, string>,
  packs: PacksMap | undefined,
  debug: (message: string, ...data: unknown[]) => void
): Map<string, string> {
  const aliasToPack = new Map<string, string>();

  // Use oxc-walker to traverse MDAST (it's ESTree-compatible at runtime!)
  // biome-ignore lint/suspicious/noExplicitAny: MDAST is ESTree-compatible but types don't match
  walk(mdast as any, {
    enter(node) {
      // @ts-expect-error - MDAST node types are not in oxc-walker's type definitions
      if (node.type !== "mdxjsEsm") return;
      // biome-ignore lint/suspicious/noExplicitAny: MDX AST node types
      if (!(node as any).data?.estree) return;

      // biome-ignore lint/suspicious/noExplicitAny: ESTree types from remark-mdx
      const program = (node as any).data.estree;
      if (!program.body) return;

      for (const stmt of program.body) {
        if (stmt.type !== "ImportDeclaration") continue;

        const source = stmt.source?.value;
        if (typeof source !== "string" || !importSources.includes(source)) {
          continue;
        }

        debug(`[MDX] Found import from ${source}`);

        // Extract imported names and map to their local aliases
        for (const spec of stmt.specifiers || []) {
          if (spec.type === "ImportSpecifier" && spec.local?.name) {
            const importedName = spec.imported?.name || spec.local.name;
            const localAlias = spec.local.name;

            mapImportToPack(
              importedName,
              localAlias,
              aliasToPack,
              availableCollections,
              collectionNames,
              packs,
              debug,
              "[MDX] "
            );
          } else if (spec.type === "ImportNamespaceSpecifier" && spec.local?.name) {
            // Handle namespace imports (import * as Icons from "...")
            aliasToPack.set(spec.local.name, "namespace");
            debug(`[MDX] Mapped namespace import ${spec.local.name}`);
          }
        }
      }
    }
  });

  return aliasToPack;
}
