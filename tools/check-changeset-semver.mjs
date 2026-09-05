#!/usr/bin/env node
// oxlint-disable no-console
/**
 * Pre-1.0 semver guard for changesets.
 *
 * While a package is still `0.x` its public API is unstable (semver clause 4),
 * so breaking changes go in a `minor` bump — `0.2.0` → `0.3.0` — and everything
 * else in a `patch`. changesets itself has no notion of this: a `major` entry on
 * a `0.x` package would jump it straight to `1.0.0`.
 *
 * This script fails CI when a changeset asks for a `major` bump on a package
 * that has not reached `1.0.0` yet. Graduating a package to `1.0.0` is a
 * deliberate act: run with `ALLOW_MAJOR_BUMP=1` to allow it through.
 *
 * Usage: node tools/check-changeset-semver.mjs   (wired into `pnpm changeset:check`)
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const changesetDir = path.join(rootDir, ".changeset");
const allowMajor = process.env.ALLOW_MAJOR_BUMP === "1";

const BUMP_TYPES = new Set(["major", "minor", "patch"]);

/** Every workspace package.json, keyed by its `name`. */
async function loadWorkspacePackages() {
  const globs = ["packages/*", "apps/*", "apps/*/*"];
  const dirs = new Set();
  for (const glob of globs) {
    const [base, ...rest] = glob.split("/");
    const depth = rest.length;
    const walk = async (dir, left) => {
      let entries;
      try {
        entries = await readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const full = path.join(dir, entry.name);
        if (left === 0) dirs.add(full);
        else await walk(full, left - 1);
      }
    };
    await walk(path.join(rootDir, base), depth - 1);
  }

  const byName = new Map();
  for (const dir of dirs) {
    const pkgPath = path.join(dir, "package.json");
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
    if (pkg.name) byName.set(pkg.name, pkg);
  }
  return byName;
}

/** Parse the `"name": bump` frontmatter of a changeset markdown file. */
function parseChangeset(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return [];
  const entries = [];
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const kv = trimmed.match(/^["']?(.+?)["']?\s*:\s*["']?(\w+)["']?$/);
    if (kv) entries.push({ name: kv[1], bump: kv[2] });
  }
  return entries;
}

function isPreRelease(version) {
  return String(version ?? "").startsWith("0.");
}

const packages = await loadWorkspacePackages();
let files;
try {
  files = (await readdir(changesetDir)).filter(
    (f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md",
  );
} catch {
  console.log("No .changeset directory — nothing to check.");
  process.exit(0);
}

const errors = [];
for (const file of files) {
  const entries = parseChangeset(await readFile(path.join(changesetDir, file), "utf8"));
  for (const { name, bump } of entries) {
    const where = `.changeset/${file} → "${name}"`;
    if (!BUMP_TYPES.has(bump)) {
      errors.push(`${where}: unknown bump type "${bump}" (expected major | minor | patch).`);
      continue;
    }
    const pkg = packages.get(name);
    if (!pkg) {
      errors.push(`${where}: no workspace package named "${name}".`);
      continue;
    }
    if (bump === "major" && isPreRelease(pkg.version) && !allowMajor) {
      errors.push(
        `${where}: "major" bump on ${name}@${pkg.version} would release 1.0.0.\n` +
          `    While ${name} is 0.x, put breaking changes in a "minor" bump.\n` +
          `    To graduate ${name} to 1.0.0 on purpose, re-run with ALLOW_MAJOR_BUMP=1.`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error("✗ changeset semver check failed:\n");
  for (const error of errors) console.error(`  ${error}\n`);
  process.exit(1);
}

console.log("✓ changeset semver check passed.");
