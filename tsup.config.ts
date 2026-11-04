import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "engine/index": "src/engine/index.ts",
    "kernel/index": "src/kernel/index.ts",
    "three/index": "src/three/index.ts",
    "scanner/index": "src/scanner/index.ts",
    "renderers/index": "src/renderers/index.ts",
    "tools/index": "src/tools/index.ts",
    "react/index": "src/react/index.ts",
  },
  tsconfig: "tsconfig.lib.json",
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
});
