# Vizitka — Premium Design System & Site Generator (Figma Plugin)

A production-ready **Figma plugin, written in TypeScript**, that generates — in one click and **idempotently** — two things:

1. **A premium, dark-first design system** (real Figma _variables_, _text styles_, and _effect styles_).
2. **A complete design for a personal business-card website** (a _site-vizitka_, not a case-study portfolio) across desktop, tablet, and mobile.

It produces four pages:

| Page               | What's on it                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| `◆ 01 Foundations` | Color (as variables w/ Dark + Light modes), type scale, spacing, radii, elevation, glass materials |
| `◆ 02 Components`  | Variant-rich component sets + composed organisms (glass header, burger menu, footer)               |
| `◆ 03 Templates`   | Each site section on its own board (Hero, Intro, Selected Links, Credibility, Contact)             |
| `◆ 04 Screens`     | The finished site assembled at 1440 / 834 / 390, plus the mobile burger-menu state                 |

## Design direction

- **Minimal, elegant, structured** — generous whitespace, an editorial modular type scale, hairline borders.
- **Dark-first premium aesthetic** — a cool near-black canvas (`#0A0A0B`) with an **aurora accent** (teal `#5EE6C1` → indigo `#818CF8`) used for atmospheric glows.
- **Simplicity (Aarron Walter)** — restraint over decoration; one idea per section.
- **Atmosphere & motion-awareness (Brittany Chiang)** — ambient aurora glows and depth cues that imply motion.
- **Apple-like glass** — sticky header and burger menu use `BACKGROUND_BLUR` + translucent fill + a hairline border.

---

## Quick start

> **A prebuilt bundle is already included** at `dist/code.js`, so you can import
> the manifest and run the plugin immediately — no build step required. Only
> rebuild if you change the source.

```bash
# (optional) install dev deps to rebuild from source
npm install

# rebuild the bundle (src/ → dist/code.js)
npm run build
#   …or keep it rebuilding while you iterate:
npm run watch

# full type check against the real Figma typings
npm run typecheck
```

Then, in the **Figma desktop app**:

1. `Plugins → Development → Import plugin from manifest…`
2. Choose `manifest.json` in this folder.
3. Run **Plugins → Development → Vizitka — Premium DS & Site Generator**.
4. Click **Generate**.

The plugin builds everything locally — **no network access** is requested or required.

> **Rerunnable:** every run first tears down the artifacts from the previous run
> (pages prefixed `◆`, variables/styles prefixed `Vizitka`) and rebuilds from
> scratch. It never touches anything you made by hand.

### Scripts

| Script              | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `npm run build`     | One-off bundle to `dist/code.js` (esbuild) |
| `npm run watch`     | Rebuild on change                          |
| `npm run typecheck` | `tsc --noEmit` — full type check           |

---

## Architecture overview

The plugin is a strict pipeline from **plain token data → Figma artifacts → composed UI**. Each layer only depends on the layer above it.

```
src/
├─ tokens/        ← single source of truth (plain data, no Figma calls)
│   ├─ colors.ts       semantic color tokens (dark + light values)
│   ├─ typography.ts   type scale + font fallback stacks
│   ├─ scales.ts       spacing, radii, blur, breakpoints
│   ├─ effects.ts      shadows, accent glow, glass blur
│   └─ content.ts      the vizitka's copy (retarget the site by editing this)
│
├─ core/          ← turn tokens into real Figma primitives
│   ├─ color.ts        hex → RGBA, gradients
│   ├─ fonts.ts        robust font resolution w/ fallbacks (never crashes)
│   ├─ variables.ts    Variable collections (Color: Dark+Light, Scale)
│   ├─ styles.ts       Text / Effect / Paint styles
│   ├─ nodes.ts        fills/strokes bound to variables, text, icons
│   ├─ icons.ts        Figma adapter for @okkly/icons (the glyph source of truth)
│   ├─ layout.ts       auto-layout helpers (hug/fill/fixed, padding, gap)
│   ├─ theme.ts        ThemeContext — the bag passed to every generator
│   └─ registry.ts     idempotent teardown + page creation
│
├─ components/    ← reusable component sets + organisms
│   ├─ button, badge, input, avatar, iconButton, card, linkCard   (variant sets)
│   ├─ navbar, menu, footer                                        (organisms)
│   └─ primitives.ts   glass surface, variant-set assembler, specimen card
│
├─ sections/      ← composed page sections (hero, intro, links, credibility, contact)
├─ pages/         ← page painters (foundations, components, templates, screens)
├─ pipeline.ts    ← orchestration (fonts → teardown → vars → styles → pages → paint)
├─ code.ts        ← plugin entry (message handling)
└─ ui.html        ← control panel (dark, self-contained)
```

### Why atoms are component sets but organisms are functions

- **Atoms / molecules** (`Button`, `Badge`, `Input`, `Avatar`, `IconButton`, `Card`, `LinkCard`) are true **Figma component sets with variants** — the reusable, swappable pieces. The Selected-Links section instantiates the `LinkCard` component and overrides its named text layers (`title`, `subtitle`, `meta`).
- **Organisms** (`Header`, `Burger Menu`, `Footer`) are **builder functions**. They adapt to breakpoint (the header collapses to a menu button on mobile) and are composed fresh per screen at the correct width — which is cleaner and more robust than resizing a fixed-width component instance across breakpoints. They're built by the same code everywhere, so reuse is preserved at the source level.

### Idempotency / rerunnability

`core/registry.ts#teardown()` runs first on every generation:

- Removes pages whose name starts with `◆`.
- Removes variable collections and styles whose name starts with `Vizitka`.
- Guarantees at least one page survives (Figma requires it).

Because all geometry comes from token constants and all color from variables, a
re-run is deterministic — same input, same output.

---

## Token → Figma mapping

| Token group           | Source (`src/tokens`) | Becomes in Figma                                                                                         | Bound to nodes via                                                     |
| --------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Color**             | `colors.ts`           | **Variables** — collection `Vizitka · Color` with **Dark (default)** + **Light** modes                   | `fillToken` / `strokeToken` → `setBoundVariableForPaint` (theme-aware) |
| **Type scale**        | `typography.ts`       | **Text styles** `Vizitka/display/2xl` …                                                                  | `makeText` → `setTextStyleIdAsync`                                     |
| **Spacing / Radii**   | `scales.ts`           | **Variables** — collection `Vizitka · Scale` (docs + reuse); geometry applied directly from TS constants | auto-layout padding/gap & `cornerRadius`                               |
| **Shadows**           | `effects.ts`          | **Effect styles** `Vizitka/shadow/*`                                                                     | `setEffectStyleIdAsync`                                                |
| **Glow (atmosphere)** | `effects.ts`          | **Effect styles** `Vizitka/glow/*`                                                                       | applied to CTAs, glass, hero                                           |
| **Glass / blur**      | `effects.ts`          | **Effect styles** `Vizitka/glass/*` (`BACKGROUND_BLUR` + lift)                                           | `glassSurface()`                                                       |
| **Gradients**         | `styles.ts`           | **Paint styles** `Vizitka/gradient/*`                                                                    | avatar, brand mark, glass showcase                                     |

**Design decision — color as variables, geometry as constants.** Color is bound
to Figma variables so the entire design themes with one mode switch (try it:
select the `Vizitka · Color` collection and flip the mode to _Light_). Spacing and
radii are _also_ published as variables for documentation/reuse, but the layout
geometry itself is applied from the TypeScript constants so the code stays the
single source of truth and generation never depends on variable read-back.

---

## Component & content mapping

| Site element       | Component / builder                  | Notes                                                                        |
| ------------------ | ------------------------------------ | ---------------------------------------------------------------------------- |
| Sticky header      | `components/navbar.ts`               | Frosted glass, brand lockup, nav, CTA pill; collapses to menu button < 640px |
| Mobile menu        | `components/menu.ts`                 | Full-screen frosted overlay, large editorial links                           |
| Selected link row  | `components/linkCard.ts`             | `Variant = Default / Featured`; the vizitka's signature element              |
| Buttons / CTAs     | `components/button.ts`               | `Variant × Size` set; hero/contact use inline pills of the same spec         |
| Availability chip  | `components/badge.ts`                | Accent variant with status dot                                               |
| Identity mark      | `components/avatar.ts` + `brandMark` | Aurora gradient with initials — no image asset needed                        |
| Contact form field | `components/input.ts`                | `State = Default / Focus / Filled`                                           |

**Retargeting the site.** All copy (name, role, links, quote, email, socials)
lives in `src/tokens/content.ts`. Edit that one file and re-run to generate the
same site for a different person.

---

## Requirements & notes

- **Figma desktop app** for development plugins.
- **Fonts:** the resolver prefers `Inter Tight` / `Inter` / `JetBrains Mono` and
  falls back through to `Roboto`, which is always available — so generation never
  fails on a missing font. Install Inter for the intended look.
- **Manifest:** `documentAccess: "dynamic-page"`, so the plugin uses the async
  Figma APIs (`loadAllPagesAsync`, `getLocal*StylesAsync`, `setCurrentPageAsync`).
- **No network access** is declared or used.

## License

MIT.
