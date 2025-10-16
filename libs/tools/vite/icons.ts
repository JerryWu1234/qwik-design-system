import type { Program } from "@oxc-project/types";
import { parseSync } from "oxc-parser";
import type { Plugin as VitePlugin } from "vite";
import { CollectionLoader } from "../utils/icons/collections/loader";
import { resolveImportAliases } from "../utils/icons/import-resolver";
import { transformMDXFile } from "../utils/icons/transform/mdx";
import { transformTSXFile } from "../utils/icons/transform/tsx";

export type PacksMap = Record<
  string,
  {
    iconifyPrefix: string;
    sanitizeIcon?: (pascal: string) => string;
  }
>;

export type IconsPluginOptions = {
  debug?: boolean;
  /**
   * The sources to scan for imports. By default this includes QDS, you can also add your own when creating library wrappers.
   */
  importSources?: string[];
  packs?: PacksMap;
};

/**
 * Vite plugin that transforms icon JSX elements to direct <svg /> calls
 * @param options - Plugin configuration options
 * @returns Vite plugin object
 */
export const icons = (options: IconsPluginOptions = {}): VitePlugin => {
  const importSources = options.importSources ?? ["@qds.dev/ui"];
  const isDebugMode = !!options.debug;
  const collectionNames = new Map<string, string>();

  const debug = (message: string, ...data: unknown[]) => {
    if (!isDebugMode) return;
    console.log(`[icons] ${message}`, ...data);
  };

  const collectionLoader = new CollectionLoader(debug);

  /**
   * Parse and validate a file, returning the AST if valid
   * @param code - Source code to parse
   * @param id - File ID for debugging
   * @returns AST program if valid, null if invalid
   */
  function parseAndValidateFile(code: string, id: string): Program | null {
    try {
      const parsed = parseSync(id, code);
      if (parsed.errors.length > 0) {
        debug(
          `Parse errors in ${id}:`,
          parsed.errors.map((e) => e.message)
        );
        return null;
      }
      return parsed.program;
    } catch (error) {
      debug(`Error parsing ${id}:`, error);
      return null;
    }
  }

  return {
    name: "vite-plugin-qds-icons",
    enforce: "pre",

    async configResolved() {
      debug("Icons plugin initialized with lazy loading");

      // Discover all available Iconify collections
      collectionLoader.discoverCollections();

      debug(
        `Plugin ready - ${collectionLoader.getAvailableCollections().size} collections available on-demand`
      );
    },

    transform(code, id) {
      if (!id.endsWith(".tsx") && !id.endsWith(".jsx") && !id.endsWith(".mdx")) {
        return null;
      }

      // Ensure collections are discovered (for testing and first transform)
      if (collectionLoader.getAvailableCollections().size === 0) {
        collectionLoader.discoverCollections();
      }

      // Handle MDX files separately using remark-mdx
      if (id.endsWith(".mdx")) {
        return transformMDXFile(
          code,
          id,
          importSources,
          collectionLoader.getAvailableCollections(),
          collectionNames,
          options.packs,
          debug
        );
      }

      debug(`[TRANSFORM] Starting transformation for ${id}`);

      try {
        const ast = parseAndValidateFile(code, id);
        if (!ast) {
          debug(`[TRANSFORM] Failed to parse ${id}`);
          return null;
        }

        const aliasToPack = resolveImportAliases(
          ast,
          importSources,
          collectionLoader.getAvailableCollections(),
          collectionNames,
          options.packs,
          debug
        );

        if (aliasToPack.size === 0) {
          debug(`[TRANSFORM] No icon imports found in ${id}`);
          return null;
        }

        return transformTSXFile(
          code,
          id,
          ast,
          aliasToPack,
          collectionNames,
          collectionLoader.getAvailableCollections(),
          options.packs,
          debug
        );
      } catch (error) {
        debug(`[TRANSFORM] Error during transformation of ${id}:`, error);
        // Return original code unchanged if transformation fails
        return null;
      }
    },

    resolveId(source) {
      if (source.startsWith("virtual:icons/")) {
        return `\0${source}`;
      }
      return null;
    },

    async load(id) {
      if (!id.startsWith("\0virtual:icons/")) return null;

      const virtualPath = id.slice(1);
      const parts = virtualPath.split("/");
      const prefix = parts[1];
      const name = parts[2];

      if (!prefix || !name) {
        debug(`Invalid virtual icon path: ${virtualPath}`);
        return null;
      }

      try {
        const iconData = await collectionLoader.loadIconDataLazy(prefix, name);
        if (!iconData) {
          debug(`Failed to load icon data for ${prefix}:${name}`);
          // Return a safe fallback that won't break JSX parsing
          return {
            code: `export default '<path d="M12 2L2 7l10 5 10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>';\n`
          };
        }

        // Virtual module only contains the icon path data (children are handled in JSX)
        const code = `export default \`${iconData.body}\`;`;
        debug(`Generated virtual module for ${prefix}:${name}`);
        return { code };
      } catch (error) {
        debug(`Error loading virtual module ${virtualPath}:`, error);
        // Return a safe fallback that won't break JSX parsing
        return {
          code: `export default '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>';\n`
        };
      }
    },

    async handleHotUpdate(ctx) {
      const fileId = ctx.file;
      if (fileId.endsWith(".tsx") || fileId.endsWith(".jsx") || fileId.endsWith(".mdx")) {
        try {
          // Ensure collections are discovered (for testing and first HMR)
          if (collectionLoader.getAvailableCollections().size === 0) {
            collectionLoader.discoverCollections();
          }

          // Read the file content to check if it contains icon usage
          const code = ctx.read?.();
          if (!code) return;

          // Handle both sync and async cases
          const sourceCode = code instanceof Promise ? await code : code;

          // For MDX files, just check if they have imports (we can't parse them with oxc-parser)
          if (fileId.endsWith(".mdx")) {
            // Simple check: if the file contains icon imports, force reload
            const hasIconImports = importSources.some(
              (source) =>
                sourceCode.includes(`from "${source}"`) ||
                sourceCode.includes(`from '${source}'`)
            );

            if (hasIconImports) {
              debug(
                `Hot update detected for MDX ${fileId} - contains icon imports, forcing full reload`
              );
              ctx.server.ws.send({ type: "full-reload" });
              return [];
            }
            return;
          }

          // Parse and check for icon usage (TSX/JSX files)
          const ast = parseAndValidateFile(sourceCode, fileId);
          if (!ast) return;

          const aliasToPack = resolveImportAliases(
            ast,
            importSources,
            collectionLoader.getAvailableCollections(),
            collectionNames,
            options.packs,
            debug
          );

          // If this file contains icon imports, force a full reload to ensure transformations work
          if (aliasToPack.size > 0) {
            debug(
              `Hot update detected for ${fileId} - contains ${aliasToPack.size} icon import(s), forcing full reload for proper transformation`
            );
            ctx.server.ws.send({ type: "full-reload" });
            return [];
          }
        } catch (error) {
          debug(`Error in handleHotUpdate for ${fileId}:`, error);
          // If there's an error, still force a reload to be safe
          ctx.server.ws.send({ type: "full-reload" });
          return [];
        }
      }

      return;
    }
  };
};
