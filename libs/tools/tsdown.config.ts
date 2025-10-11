import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "vite/index.ts", "utils/index.ts"],
  tsconfig: "tsconfig.json",
  dts: true
});
