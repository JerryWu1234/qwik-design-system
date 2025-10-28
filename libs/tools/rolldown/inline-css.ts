import { readFileSync } from "node:fs";

/**
 * Rolldown plugin to handle CSS imports with ?inline query parameter
 * Mimics Vite's ?inline behavior by returning CSS content as a string
 */
interface PluginContext {
  error: (msg: string) => void;
}

export function inlineCssPlugin() {
  return {
    name: "rolldown-plugin-inline-css",

    resolveId(source: string, _importer?: string, _options?: unknown) {
      // Check if this is a CSS file with ?inline query
      if (
        typeof source === "string" &&
        source.includes("?inline") &&
        /\.css(\?|$)/.test(source)
      ) {
        // Let Rolldown resolve the file path normally
        // We'll handle the transformation in the load hook
        return null;
      }
      return null;
    },

    load(this: PluginContext, id: string) {
      // Check if this is a CSS file with ?inline query
      if (typeof id === "string" && id.includes("?inline") && /\.css(\?|$)/.test(id)) {
        // Remove query parameters to get the actual file path
        const parts = id.split("?");
        const filePath = parts[0];

        if (!filePath) {
          return null;
        }

        try {
          // Read the CSS file content
          const cssContent = readFileSync(filePath, "utf-8");

          // Return as a JavaScript module that exports the CSS string
          // This is what Vite does - it returns the raw CSS as a string
          return {
            code: `export default ${JSON.stringify(cssContent)};`,
            map: null
          };
        } catch (error) {
          this.error(`Failed to read CSS file: ${filePath}\n${String(error)}`);
          return null;
        }
      }

      return null;
    }
  };
}
