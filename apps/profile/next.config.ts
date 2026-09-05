import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appRoot, "../..");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Emits .next/standalone — a self-contained server with its own node_modules.
  // That is what ops/Dockerfile.profile copies: ~180 MB runtime image instead
  // of ~1.5 GB, with no pnpm and no monorepo sources.
  output: "standalone",
  // File tracing starts at apps/profile by default, so pnpm symlinks to
  // workspace packages (@okkly/react etc.) would fall outside the trace.
  // The monorepo root makes the standalone layout predictable:
  //   .next/standalone/apps/profile/server.js + .next/standalone/node_modules
  outputFileTracingRoot: monorepoRoot,
  // Workspace packages ship untranspiled-for-Next ESM; let Next compile them.
  transpilePackages: ["@okkly/react", "@okkly/design-system"],
  sassOptions: {
    implementation: "sass-embedded",
    // sass-embedded uses the modern Sass API, which reads `loadPaths`
    // (legacy `includePaths` is ignored). Both roots are on the load path so
    // `@use "styles/mixins"` and
    // `@use "@okkly/design-system/styles/breakpoints.scss"` resolve the same
    // way from any *.module.scss, however deep it is nested.
    loadPaths: [
      path.join(appRoot, "src"),
      path.join(appRoot, "node_modules"),
      path.join(monorepoRoot, "node_modules"),
    ],
  },
};

export default withNextIntl(nextConfig);
