import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// `globals: false` in vitest.config.ts means Testing Library can't
// auto-detect `afterEach` off globalThis — register cleanup explicitly so
// the DOM doesn't leak between tests in the same file.
afterEach(() => cleanup());
