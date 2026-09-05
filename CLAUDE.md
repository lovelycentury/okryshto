# CLAUDE.md

## Commits

Every commit subject: `<:gitmoji:> <type>(<scope>)?<!>?: <summary>`

- Leading gitmoji as a `:code:` shortcode (official set — https://gitmoji.dev).
- Then a Conventional Commits header: type + optional `(scope)` + optional `!`.
- Types: `feat` `fix` `chore` `docs` `refactor` `test` `perf` `build` `ci` `style` `revert`.
- Subject ≤ 100 chars.

Example: `:sparkles: feat(react): add a size prop to Button`

Enforced by the `commit-msg` hook (`tools/check-commit-msg.mjs`). Do not use
`--no-verify`. Full convention: [CONTRIBUTING.md](CONTRIBUTING.md).

## Releasing

Versioning is changeset-driven. A user-facing change to a published package
(`@okkly/react`, `@okkly/design-system`, `@okkly/icons`, `@okkly/react-hooks`,
`@okkly/helpers`) needs a changeset — `pnpm changeset`. Pre-1.0 rules and
examples: [.changeset/README.md](.changeset/README.md).
