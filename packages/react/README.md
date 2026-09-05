# @okkly/react

React component library for the Okryshto design system.

```bash
pnpm add @okkly/react react react-dom
```

```tsx
import { OkryshtoButton } from "@okkly/react";
import "@okkly/react/style.css";

export function App() {
  return <OkryshtoButton variant="primary">Click me</OkryshtoButton>;
}
```

## Workbench

Storybook lives in this package. Stories sit next to their component as
`*.stories.tsx` and render from `src`, so a change shows up without rebuilding.

```bash
pnpm --filter @okkly/react storybook         # dev server on :6006
pnpm --filter @okkly/react storybook:build   # static build → storybook-static/
```

Stories never ship: `files` publishes only `dist`, and `tsconfig.build.json`
excludes `*.stories.*`.
