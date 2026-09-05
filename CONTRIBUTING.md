# Contributing

## Commit messages

Format:

```
<:gitmoji:> <type>(<scope>)?<!>?: <summary>
```

Examples:

```
:sparkles: feat: add a size prop to Button
:bug: fix(react): stop Dialog leaking the scroll lock
:memo: docs: document the pre-1.0 semver policy
:recycle: refactor(icons): drop the unused viewBox normaliser
:white_check_mark: test(react-hooks): cover useClipboard error path
```

Rules, enforced by the `commit-msg` hook (`tools/check-commit-msg.mjs`):

- The summary **starts with a gitmoji shortcode** from the official set —
  <https://gitmoji.dev>. Use the `:code:` form, not the raw emoji.
- After it, a **Conventional Commits** header: a type, an optional `(scope)`,
  an optional `!` for a breaking change, then `: ` and the summary.
- Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`,
  `build`, `ci`, `style`, `revert`.
- Keep the whole subject line ≤ 100 characters.

Not checked: merge commits, `git revert` messages, `fixup!` / `squash!` /
`amend!` autosquash commits, and the changesets bot's `chore: version packages`.

### `pnpm commit`

Runs `gitmoji --commit` — an interactive prompt configured (`.gitmojirc.json`)
to insert the `:code:` gitmoji for you. In the **title** field, type the
Conventional Commits part only:

```
title:  feat: add a size prop to Button
```

→ commits `:sparkles: feat: add a size prop to Button`.

Plain `git commit` works too; the hook validates either way. `--no-verify`
skips the hook — avoid it.

## Releases and versioning

Handled by [changesets](https://github.com/changesets/changesets). See
[`.changeset/README.md`](.changeset/README.md) for the release flow, the
pre-1.0 semver policy, and per-scenario examples.
