#!/usr/bin/env node
// oxlint-disable no-console
/**
 * Usage: pnpm storybook <package>   (e.g. `pnpm storybook react` for packages/react)
 *
 * Fails if <package> has no "storybook" script. Otherwise, before starting
 * Storybook, it launches `dev` (vite build --watch) in every workspace
 * package <package> depends on, so edits there rebuild dist/ and Storybook's
 * dev server picks the change up live — no separate terminal per dependency.
 */
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const pkgArg = process.argv[2];
if (!pkgArg) {
  console.error("Usage: pnpm storybook <package>  (e.g. pnpm storybook react)");
  process.exit(1);
}

const pkgJsonPath = path.join(rootDir, "packages", pkgArg, "package.json");
if (!existsSync(pkgJsonPath)) {
  console.error(`error: no package at packages/${pkgArg}`);
  process.exit(1);
}

const pkg = JSON.parse(await readFile(pkgJsonPath, "utf8"));
if (!pkg.scripts?.storybook) {
  console.error(`error: ${pkg.name} has no "storybook" script`);
  process.exit(1);
}

const children = [
  spawn(
    "pnpm",
    ["--dir", rootDir, "--filter", `${pkg.name}^...`, "--if-present", "--parallel", "run", "dev"],
    { stdio: "inherit" },
  ),
  spawn("pnpm", ["--dir", rootDir, "--filter", pkg.name, "run", "storybook"], {
    stdio: "inherit",
  }),
];
const [, storybook] = children;

let shuttingDown = false;
function shutdown(exitCode) {
  if (shuttingDown) return;
  shuttingDown = true;
  // pid 0 is POSIX shorthand for "every process in the sender's own group" —
  // reaches pnpm's grandchildren (vite watchers, esbuild services, the
  // Storybook dev server) without having to track each one individually.
  try {
    process.kill(0, "SIGTERM");
  } catch {
    /* group already gone */
  }
  process.exitCode = exitCode ?? 0;
}

storybook.on("exit", (code) => shutdown(code ?? 0));
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
