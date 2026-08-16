# @okryshto/react

React component library for the Okryshto design system.

```bash
pnpm add @okryshto/react react react-dom
```

```tsx
import { OkryshtoButton } from "@okryshto/react";
import "@okryshto/react/style.css";

export function App() {
  return <OkryshtoButton variant="primary">Click me</OkryshtoButton>;
}
```

## Workbench

Storybook lives in this package. Stories sit next to their component as
`*.stories.tsx` and render from `src`, so a change shows up without rebuilding.

```bash
pnpm --filter @okryshto/react storybook         # dev server on :6006
pnpm --filter @okryshto/react storybook:build   # static build → storybook-static/
```

Stories never ship: `files` publishes only `dist`, and `tsconfig.build.json`
excludes `*.stories.*`.
