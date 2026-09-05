# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).

## Cutting a release

1. On your feature branch, add a changeset:

   ```bash
   pnpm changeset
   ```

   Select the affected packages, pick a bump type (see semver below), and
   describe the change. Commit the generated `.changeset/*.md` with your code.

2. Merge the PR into `main`.

3. A bot opens a **"chore: version packages"** PR that bumps versions in
   `package.json` and moves the changesets into each `CHANGELOG.md`.

4. Merging that PR publishes the packages to npm (workflow
   `.github/workflows/release.yml`).

## Semver before 1.0.0

All published packages (`@okkly/react`, `@okkly/design-system`, `@okkly/icons`,
`@okkly/react-hooks`, `@okkly/helpers`) start at `0.0.0`. The first release makes
them `0.1.0`: there has been no `1.0.0`, so the public API is treated as
unstable (semver clause 4). While a package is on `0.x`:

| Changeset type | Use for                                | `0.3.1` → |
| -------------- | -------------------------------------- | --------- |
| `patch`        | fixes, refactors, type-only changes    | `0.3.2`   |
| `minor`        | new features **and** breaking changes  | `0.4.0`   |
| `major`        | do not use — blocked in CI (see below) | `1.0.0`   |

changesets has no notion of pre-1.0: a `major` bump on a `0.x` package would
jump it straight to `1.0.0`. So `pnpm changeset:check` (a step in `ci.yml`)
fails the build when a `.changeset/*.md` requests `major` for a package that has
not reached `1.0.0` yet.

To graduate a package to `1.0.0` on purpose, keep the `major` changeset and run
the check once with `ALLOW_MAJOR_BUMP=1` (locally, or as a step `env` in the
workflow).

## Examples

### Anatomy of a changeset

`pnpm changeset` writes a file such as `.changeset/curly-lions-jump.md`:

```markdown
---
"@okkly/react": minor
---

Add a `size` prop to `Button`.
```

The frontmatter has one line per affected **published** package and its bump
type. The body is the `CHANGELOG.md` entry (Markdown, may span several lines).

### A bug fix in one package

```markdown
---
"@okkly/icons": patch
---

Fix the `arrow-left` viewBox so it no longer clips at 16px.
```

`@okkly/icons` `0.3.1` → `0.3.2`.

### A new feature in one package

```markdown
---
"@okkly/react-hooks": minor
---

Add a `useClipboard` hook.
```

`@okkly/react-hooks` `0.3.1` → `0.4.0`.

### A breaking change (still on 0.x)

Use `minor`, not `major` — see [Semver before 1.0.0](#semver-before-100).

```markdown
---
"@okkly/react": minor
---

**Breaking:** `Dialog` no longer renders its own backdrop; wrap it in `Overlay`.
```

`@okkly/react` `0.3.1` → `0.4.0`.

### One change touching several packages

One file, one line per package, each with its own bump:

```markdown
---
"@okkly/design-system": minor
"@okkly/react": minor
"@okkly/helpers": patch
---

Add the `density` token scale and wire `Table` / `List` to it.
```

### You changed a package that others depend on

`@okkly/react` depends on `@okkly/design-system`, `@okkly/helpers`,
`@okkly/icons`, and `@okkly/react-hooks`. When one of those is released,
`updateInternalDependencies: "patch"` bumps `@okkly/react` too (at least
`patch`) — you do **not** list it:

```markdown
---
"@okkly/helpers": patch
---

Fix `clamp` rounding at negative bounds.
```

Result: `@okkly/helpers` `0.3.1` → `0.3.2`, and `@okkly/react` `0.3.1` → `0.3.2`.

List `@okkly/react` yourself (as `minor`) only when the same change also alters
what `@okkly/react` exports or how it behaves.

### Nothing to release

Docs, tests, CI, tooling, or a refactor with no observable change — add **no
changeset**. CI does not require one.

To record that "no release" was a deliberate choice, add an empty changeset:

```bash
pnpm changeset --empty
```

```markdown
---
---
```

### A change only in a private package

`@okkly/profile`, `@okkly/iam`, `@okkly/resume-fe`, `@okkly/resume-be`, and
`@okkly/playground` are `private: true`; `@okkly/oxlint-config` is in the
config's `ignore` list. None of them are versioned or published, so app- and
config-only changes need no changeset. Adding one for such a package makes
`pnpm changeset:check` fail (unknown / non-publishable package).

### Graduating a package to 1.0.0

```markdown
---
"@okkly/react": major
---

`@okkly/react` is now stable; no API change from `0.9.x`.
```

Run the version step once with the override so the guard lets it through:

```bash
ALLOW_MAJOR_BUMP=1 pnpm changeset:check
ALLOW_MAJOR_BUMP=1 pnpm version-packages
```

In `release.yml`, set `ALLOW_MAJOR_BUMP: "1"` as `env` on the `changesets/action`
step for that one release, then remove it.

### A throwaway version from a branch

For a one-off build to install elsewhere without going through `main`
(`preview.yml` already does this per PR — this is for local or ad-hoc use):

```bash
pnpm version-packages:beta   # e.g. 0.0.0-beta-20260905123045
pnpm release:beta            # publishes under the `beta` dist-tag, no git tag
```

Install it with `pnpm add @okkly/react@beta`. Do not commit or merge the bump.

## Preview releases

For every PR, the `preview.yml` workflow publishes an installable build via
[pkg-pr-new](https://github.com/stackblitz-labs/pkg-pr-new); the install link is
posted as a PR comment.
