# Storybook brand assets

Default mark = **Header lockup** from Figma
[Static Logo Lockups](https://www.figma.com/design/3YsJJl5QukJZPkjoOOZahx/-okkly-okkly?node-id=422-168)
(node `422:179` — compact nav / Storybook chrome).

| File         | Use                                                    |
| ------------ | ------------------------------------------------------ |
| `logo.svg`   | Default (`theme.ts` → `brandImage: "/brand/logo.svg"`) |
| `logo.png`   | Raster export of the same lockup (optional)            |
| `emblem.svg` | Yin-yang orb only (from Figma export)                  |

Replace `logo.svg` (or point `brandImage` at `logo.png`) to swap the sidebar logo.
Tips: transparent background, ~140–160px wide, readable on `#0a0a0b`.
