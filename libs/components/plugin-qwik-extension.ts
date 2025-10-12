import type { OutputOptions } from "rolldown";

/**
 * Plugin to ensure .qwik.mjs extension and correct output dir
 * Runs after qwikRollup to override its settings
 */
export function qwikExtensionPlugin() {
  return {
    name: "qwik-extension-plugin",

    outputOptions(outputOpts: OutputOptions) {
      outputOpts.dir = "./lib";
      outputOpts.entryFileNames = "[name].qwik.mjs";
      outputOpts.chunkFileNames = "[name]-[hash].qwik.mjs";
      return outputOpts;
    }
  };
}
