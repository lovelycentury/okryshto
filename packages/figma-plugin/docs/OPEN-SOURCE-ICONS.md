# Open-source icon libraries

A curated list of free, open-source icon sets you can safely use in the design
system (all permissively licensed — MIT / Apache-2.0 / ISC / SIL OFL).

> **Fastest way into Figma:** install the **Iconify** Figma plugin — it bundles
> almost every set below and lets you drag icons straight onto the canvas as
> editable vectors.

| Set                     | Count | License                           | Style                                                | Home / GitHub                                    | npm                                 |
| ----------------------- | ----- | --------------------------------- | ---------------------------------------------------- | ------------------------------------------------ | ----------------------------------- |
| **Lucide**              | ~1600 | ISC                               | Clean line, 24px, consistent stroke. Great default.  | lucide.dev · github.com/lucide-icons/lucide      | `lucide` / `lucide-react`           |
| **Material Symbols**    | ~3500 | Apache-2.0                        | Google's system icons, variable (fill/weight/grade). | fonts.google.com/icons                           | `@material-symbols/*`               |
| **Tabler Icons**        | ~5800 | MIT                               | Line, 24px, huge coverage.                           | tabler.io/icons · github.com/tabler/tabler-icons | `@tabler/icons`                     |
| **Phosphor**            | ~9000 | MIT                               | 6 weights (thin→fill), very elegant.                 | phosphoricons.com                                | `@phosphor-icons/react`             |
| **Heroicons**           | ~300  | MIT                               | By Tailwind team, outline + solid, 24/20px.          | heroicons.com                                    | `heroicons`                         |
| **Feather**             | ~290  | MIT                               | Minimal line icons, the classic.                     | feathericons.com                                 | `feather-icons`                     |
| **Radix Icons**         | ~320  | MIT                               | 15px crisp UI icons (by WorkOS/Radix).               | icons.radix-ui.com                               | `@radix-ui/react-icons`             |
| **Remix Icon**          | ~2800 | Apache-2.0                        | Line + fill pairs, neutral.                          | remixicon.com                                    | `remixicon`                         |
| **Bootstrap Icons**     | ~2000 | MIT                               | Solid + outline, well-rounded.                       | icons.getbootstrap.com                           | `bootstrap-icons`                   |
| **Iconoir**             | ~1500 | MIT                               | Thin, modern line set.                               | iconoir.com                                      | `iconoir-react`                     |
| **Font Awesome (Free)** | ~2000 | Free tier: CC-BY-4.0 / MIT (code) | Ubiquitous; check per-icon (Pro is paid).            | fontawesome.com                                  | `@fortawesome/free-solid-svg-icons` |

## Recommendation for this system

- **Primary:** **Lucide** — its clean 24px / consistent stroke matches the
  editorial, restrained aesthetic here.
- **Fallback for breadth:** **Tabler** or **Phosphor** when Lucide is missing a
  glyph.
- Keep **one** set as the default; mix only when unavoidable, and match stroke
  width (1.5–2px) so icons read as one family.

## Using in Figma

1. `Plugins → Iconify` → search → drag onto canvas (editable vector).
2. Or download raw SVG from the set's site and `File → Place image / paste SVG`.
3. Recolor via the design-system color variables (`text/*`, `accent/*`).
4. Keep icons on a 24×24 frame with ~2px padding for optical balance.

## Licenses in short

- **MIT / ISC / Apache-2.0** — free for commercial use, keep the license notice.
- **SIL OFL** (icon fonts) — free; don't sell the font file itself as-is.
- **Font Awesome Free** — fine, but Brand icons and Pro glyphs have their own terms.
