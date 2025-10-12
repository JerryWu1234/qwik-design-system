import { readFileSync } from "node:fs";
import { qwikRollup } from "@qwik.dev/core/optimizer";
import { defineConfig } from "rolldown";
import { inlineCssPlugin } from "./plugin-inline-css";
import { qwikExtensionPlugin } from "./plugin-qwik-extension";

type PackageJson = {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const pkg = JSON.parse(readFileSync("./package.json", "utf-8")) as PackageJson;
const { dependencies = {}, peerDependencies = {} } = pkg;
const makeRegex = (dep: string) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj: Record<string, string>) => Object.keys(obj).map(makeRegex);

export default defineConfig({
  input: "./src/index.ts",
  output: {
    format: "esm"
  },
  plugins: [
    // qwikRollup overrides the default output dir to dist, we need to fix this. qwikExtensionPlugin overrides it back to lib.
    qwikRollup({
      target: "lib",
      lint: false,
      srcDir: "./src",
      rootDir: ".",
      buildMode: "production"
    }),
    qwikExtensionPlugin(),
    inlineCssPlugin()
  ],
  external: [/^node:.*/, ...excludeAll(dependencies), ...excludeAll(peerDependencies)],
  platform: "neutral"
});
