import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts({ rollupTypes: true, tsconfigPath: "./tsconfig.build.json" })],
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
