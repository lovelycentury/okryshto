import { cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import dts from "vite-plugin-dts";

const entry = (path: string) => fileURLToPath(new URL(path, import.meta.url));

/**
 * Copies the raw assets next to the bundle so the `"./*"` and
 * `"./metadata.json"` subpath exports resolve for consumers who want the plain
 * SVG file (an `<img src>`, a build-time sprite) rather than the JS string.
 */
function copyAssets(): Plugin {
  return {
    name: "okkly-copy-icon-assets",
    closeBundle() {
      cpSync(entry("./src/assets"), entry("./dist/assets"), { recursive: true });
      cpSync(entry("./src/metadata.json"), entry("./dist/metadata.json"));
    },
  };
}

export default defineConfig({
  plugins: [
    // `rollupTypes` is deliberately off: it flattens everything into one
    // declaration file, which cannot serve two entry points.
    dts({ tsconfigPath: "./tsconfig.build.json", entryRoot: "src" }),
    copyAssets(),
  ],
  build: {
    lib: {
      entry: [entry("./src/index.ts"), entry("./src/utils.ts")],
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
  },
});
