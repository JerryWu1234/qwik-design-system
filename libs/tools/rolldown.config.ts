import { qwikRollup } from "@qwik.dev/core/optimizer";
import { defineConfig } from "rolldown";
import { qwikRolldown } from "./rolldown/qwik-rolldown";
import { readPackageJson } from "./utils/package-json";

const pkg = readPackageJson();
const { dependencies = {}, peerDependencies = {}, devDependencies = {} } = pkg;
const makeRegex = (dep: string) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj: Record<string, string>) => Object.keys(obj).map(makeRegex);

export default defineConfig({
  input: ["./src/index.ts", "./vite/index.ts", "./utils/index.ts", "./rolldown/index.ts"],
  output: {
    format: "esm",
    dir: "./lib",
    preserveModules: true,
    entryFileNames: "[name].qwik.mjs",
    chunkFileNames: "[name]-[hash].qwik.mjs"
  },
  plugins: [
    qwikRollup({
      target: "lib",
      lint: false,
      buildMode: "production"
    }),
    // qwikRollup overrides the default output dir to dist, we need to fix this. qwikRolldown overrides it back to lib.
    qwikRolldown()
  ],
  external: [
    /^node:.*/,
    ...excludeAll(dependencies),
    ...excludeAll(peerDependencies),
    ...excludeAll(devDependencies)
  ],
  platform: "neutral",
  resolve: {
    mainFields: ["module", "main"]
  }
});
