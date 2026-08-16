import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [fileURLToPath(new URL("./vitest.setup.ts", import.meta.url))],
    // Not every component has a .spec.tsx yet (e.g. Button predates this setup) —
    // don't fail CI just because coverage is still catching up.
    passWithNoTests: true,
  },
});
