import type { Node, Program } from "@oxc-project/types";
import { walk } from "oxc-walker";
import type { PacksMap } from "../../vite/icons";
import { toKebabCase } from "./naming";
import type {
  ESTreeImportDeclaration,
  ESTreeImportSpecifier,
  ESTreeProgram,
  MDXjsEsmNode
} from "./types/mdx-ast";

/**
 * Type guard for MDX ESM nodes
 */
function isMdxjsEsmNode(node: unknown): node is MDXjsEsmNode {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    node.type === "mdxjsEsm"
  );
}

/**
 * Type guard for ESTree ImportDeclaration nodes
 */
function isImportDeclaration(node: unknown): node is ESTreeImportDeclaration {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    node.type === "ImportDeclaration"
  );
}

/**
 * Extract the name from a ModuleExportName (IdentifierName | IdentifierReference | StringLiteral)
 */
function getModuleExportName(node: {
  type: string;
  name?: string;
  value?: string;
}): string {
  // IdentifierName and IdentifierReference have .name
  if ("name" in node && typeof node.name === "string") {
    return node.name;
  }
  // StringLiteral has .value
  if ("value" in node && typeof node.value === "string") {
    return node.value;
  }
  throw new Error(`Unexpected module export name node: ${JSON.stringify(node)}`);
}

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

        const importedName = getModuleExportName(specifier.imported);
        const localAlias = specifier.local.name;

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
  mdast: unknown,
  importSources: string[],
  availableCollections: Set<string>,
  collectionNames: Map<string, string>,
  packs: PacksMap | undefined,
  debug: (message: string, ...data: unknown[]) => void
): Map<string, string> {
  const aliasToPack = new Map<string, string>();

  // Use oxc-walker to traverse MDAST (it's ESTree-compatible at runtime!)
  // MDAST and ESTree are structurally compatible - both are tree structures with 'type' properties
  // Cast to the union type that walk expects
  walk(mdast as Program | Node, {
    enter(node) {
      // Check if this is an MDX ESM node with ESTree data
      const nodeAny = node as unknown;
      if (!isMdxjsEsmNode(nodeAny)) return;

      const mdxNode: MDXjsEsmNode = nodeAny;
      if (!mdxNode.data?.estree) return;

      const program: ESTreeProgram = mdxNode.data.estree;
      if (!program.body) return;

      for (const stmt of program.body) {
        if (!isImportDeclaration(stmt)) continue;

        const source = stmt.source.value;
        if (typeof source !== "string" || !importSources.includes(source)) {
          continue;
        }

        debug(`[MDX] Found import from ${source}`);

        // Extract imported names and map to their local aliases
        for (const specifier of stmt.specifiers) {
          if (specifier.type === "ImportSpecifier") {
            const importSpec: ESTreeImportSpecifier = specifier;
            const importedName =
              importSpec.imported?.name || importSpec.imported?.value || "";
            const localAlias = importSpec.local.name;

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
          } else if (specifier.type === "ImportNamespaceSpecifier") {
            // Handle namespace imports (import * as Icons from "...")
            aliasToPack.set(specifier.local.name, "namespace");
            debug(`[MDX] Mapped namespace import ${specifier.local.name}`);
          }
        }
      }
    }
  });

  return aliasToPack;
}
