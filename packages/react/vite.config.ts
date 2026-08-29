import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  // `entryRoot` is explicit: the build also type-checks the workspace sources
  // reached through the `@okryshto/*` path aliases, so the inferred root would
  // climb to `packages/` and emit `dist/react/src/index.d.ts` instead.
  plugins: [react(), dts({ tsconfigPath: "./tsconfig.build.json", entryRoot: "src" })],
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        // Next App Router treats the whole package as a Client Component boundary
        // when the built entry starts with this directive.
        banner: '"use client";',
        assetFileNames: "okryshto-react.[ext]",
      },
    },
  },
});
