import {
  inlineCssPlugin,
  qdsTransformPlugin,
  qwikRolldown
} from "@qds.dev/tools/rolldown";
import { type PackageJson, readPackageJson } from "@qds.dev/tools/utils";
import { qwikRollup } from "@qwik.dev/core/optimizer";
import { defineConfig } from "rolldown";

const pkg: PackageJson = readPackageJson();
const { dependencies = {}, peerDependencies = {} } = pkg;
const makeRegex = (dep: string) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj: Record<string, string>) => Object.keys(obj).map(makeRegex);

export default defineConfig({
  input: "./src/index.ts",
  output: {
    format: "esm"
  },
  plugins: [
    qwikRollup({
      target: "lib",
      lint: false,
      srcDir: "./src",
      rootDir: ".",
      buildMode: "production"
    }),
    // qwikRollup overrides the default output dir to dist, we need to fix this. qwikRolldown overrides it back to lib.
    qwikRolldown(),
    qdsTransformPlugin(),
    inlineCssPlugin()
  ],
  external: [/^node:.*/, ...excludeAll(dependencies), ...excludeAll(peerDependencies)],
  platform: "neutral",
  resolve: {
    mainFields: ["module", "main"]
  }
});
