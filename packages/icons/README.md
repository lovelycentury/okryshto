# @okkly/icons

SVG icon set for the Okryshto design system — 150 stroke glyphs on a 24×24 grid,
drawn with `stroke="currentColor"` so they take their colour from CSS.

Framework-agnostic: every icon is exported as a raw SVG **string**, so it works
the same in Vue, React, Svelte, or plain DOM.

## Install

```sh
pnpm add @okkly/icons
```

## Usage

```ts
import { iconArrowUpRight, iconSearch } from "@okkly/icons";

element.innerHTML = iconSearch;
```

```vue
<template>
  <span class="icon" v-html="iconArrowUpRight" />
</template>

<script setup lang="ts">
import { iconArrowUpRight } from "@okkly/icons";
</script>

<style>
.icon {
  display: inline-flex;
  color: var(--okkly-color-text-primary);
}
.icon svg {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
```

The export name is the file name in PascalCase with an `icon` prefix —
`arrow-up-right.svg` becomes `iconArrowUpRight`.

### Raw files

If you need the `.svg` file itself (for an `<img src>`, a sprite build step, or
a bundler that handles SVG for you), import it through the asset subpath:

```ts
import searchUrl from "@okkly/icons/search.svg";
```

### Metadata

Each icon carries a category and search aliases, useful for building a browsable
icon gallery:

```ts
import { ICON_METADATA, groupIconsByCategory, getIconImportName } from "@okkly/icons/utils";

groupIconsByCategory(ICON_METADATA);
// { Arrows: [{ iconName: "arrow-down", metadata: { category: "Arrows", … } }, …], … }

getIconImportName("arrow-up-right.svg"); // "iconArrowUpRight"
```

## Contributing an icon

1. Add the SVG to [`src/assets`](./src/assets/). Match the house style: a
   24×24 viewBox, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`,
   round caps and joins. Use a kebab-case file name.
2. Add an entry to [`src/metadata.json`](./src/metadata.json) with its category
   and any search aliases.
3. Run `pnpm --filter @okkly/icons generate` and commit the regenerated
   `src/generated.ts`.

The generator fails if an SVG has no metadata entry, or metadata names an SVG
that does not exist — the two stay in sync by construction.

## Attribution

Most glyphs are derived from [Lucide](https://lucide.dev), which is distributed
under the [ISC licence](https://github.com/lucide-icons/lucide/blob/main/LICENSE)
(itself a fork of Feather, MIT). The `brand` mark is original to Okryshto.
