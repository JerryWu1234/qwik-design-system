import { resolve } from "node:path";
import { qdsTransformPlugin } from "@qds.dev/tools/rolldown";
import { asChild, icons } from "@qds.dev/tools/vite";
import { qwikVite } from "@qwik.dev/core/optimizer";
import { qwikRouter } from "@qwik.dev/router/vite";
import tailwindcss from "@tailwindcss/vite";
/**
 * This is the base config for vite.
 * When building, the adapter config is used which loads this file and extends it.
 */
import { defineConfig, type UserConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "./package.json";
import { qwikDevtools } from '@qwik.dev/devtools';

type PkgDep = Record<string, string>;

interface PackageJson {
  dependencies?: PkgDep;
  devDependencies?: PkgDep;
  [key: string]: unknown;
}

const { dependencies = {}, devDependencies = {} } = pkg as unknown as PackageJson;
errorOnDuplicatesPkgDeps(devDependencies, dependencies);

/**
 * Note that Vite normally starts from `index.html` but the qwikCity plugin makes start at `src/entry.ssr.tsx` instead.
 */
export default defineConfig((): UserConfig => {
  const mainQuality = {
    quality: 80
  };

  return {
    plugins: [
      asChild(),
      icons(),
      // This plugin handles transforms for our lib author DX. We add it here so it runs in the docs dev mode as well.
      qdsTransformPlugin(),
      tailwindcss(),
      qwikRouter({
        mdx: {
          providerImportSource: "~/mdx/provider"
        }
      }),
      qwikVite({ lint: false }),
      ViteImageOptimizer({
        includePublic: true,
        png: mainQuality,
        jpeg: mainQuality,
        jpg: mainQuality,
        webp: mainQuality,
        avif: mainQuality
      }),
      tsconfigPaths(),
      qwikDevtools()
    ],
    // This tells Vite which dependencies to pre-build in dev mode.
    optimizeDeps: {
      // Put problematic deps that break bundling here, mostly those with binaries.
      // For example ['better-sqlite3'] if you use that in server functions.
      exclude: []
    },
    ssr: {
      noExternal: Object.keys(devDependencies),
      external: Object.keys(dependencies)
    },

    server: {
      headers: {
        // Don't cache the server response in dev mode
        "Cache-Control": "public, max-age=0"
      },
      fs: {
        allow: ["../.."]
      }
    },
    preview: {
      headers: {
        // Do cache the server response in preview (non-adapter production build)
        "Cache-Control": "public, max-age=600"
      }
    },
    resolve: {
      alias: {
        "@qds.dev/ui/tailwind": resolve(
          __dirname,
          "../libs/components/styles/tailwind/qds-tailwind.css"
        ),
        "@qds.dev/ui": resolve(__dirname, "../libs/components/src"),
        "@qds.dev/utils": resolve(__dirname, "../libs/utils/src"),
        "@qds.dev/tools": resolve(__dirname, "../libs/tools/src"),
        "~": resolve(__dirname, "src")
      },
      dedupe: ["@qwik.dev/core", "@qwik.dev/router"]
    }
  };
});

// *** utils ***

/**
 * Function to identify duplicate dependencies and throw an error
 * @param {Object} devDependencies - List of development dependencies
 * @param {Object} dependencies - List of production dependencies
 */
function errorOnDuplicatesPkgDeps(devDependencies: PkgDep, dependencies: PkgDep) {
  let msg = "";
  // Create an array 'duplicateDeps' by filtering devDependencies.
  // If a dependency also exists in dependencies, it is considered a duplicate.
  const duplicateDeps = Object.keys(devDependencies).filter((dep) => dependencies[dep]);

  // include any known qwik packages
  const qwikPkg = Object.keys(dependencies).filter((value) => /qwik/i.test(value));

  // any errors for missing "qwik-city-plan"
  // [PLUGIN_ERROR]: Invalid module "@qwik-router-config" is not a valid package
  msg = `Move qwik packages ${qwikPkg.join(", ")} to devDependencies`;

  if (qwikPkg.length > 0) {
    throw new Error(msg);
  }

  // Format the error message with the duplicates list.
  // The `join` function is used to represent the elements of the 'duplicateDeps' array as a comma-separated string.
  msg = `
    Warning: The dependency "${duplicateDeps.join(", ")}" is listed in both "devDependencies" and "dependencies".
    Please move the duplicated dependencies to "devDependencies" only and remove it from "dependencies"
  `;

  // Throw an error with the constructed message.
  if (duplicateDeps.length > 0) {
    throw new Error(msg);
  }
}
