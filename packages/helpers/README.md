# @lokki/helpers

Framework-agnostic utility helpers shared across the Lokki design system.

```bash
pnpm add @lokki/helpers
```

```ts
import { bem, clamp, debounce, uniqueId } from "@lokki/helpers";

const button = bem("lokki-button");
button("label"); // "lokki-button__label"
button(null, "primary"); // "lokki-button lokki-button--primary"

clamp(12, 0, 10); // 10
const id = uniqueId("field"); // "field-1"
const onScroll = debounce(() => {}, 100);
```
