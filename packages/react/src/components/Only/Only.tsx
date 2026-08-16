import type { ReactNode } from "react";
import { useMediaQuery } from "@okryshto/react-hooks";

export type OnlyBreakpoint = "2xs" | "xs" | "sm" | "md" | "lg" | "xl";

// Mirrors $breakpoints in packages/design-system/src/styles/breakpoints.scss —
// keep the two in sync when a breakpoint value changes.
const BREAKPOINT_PX: Record<OnlyBreakpoint, number> = {
  "2xs": 320,
  xs: 577,
  sm: 769,
  md: 993,
  lg: 1441,
  xl: 1921,
};

export interface OnlyProps {
  /** Render children from this breakpoint upward (inclusive). */
  from?: OnlyBreakpoint;
  /** Render children up to this breakpoint (exclusive). */
  to?: OnlyBreakpoint;
  children?: ReactNode;
}

function buildQuery(from: OnlyBreakpoint | undefined, to: OnlyBreakpoint | undefined): string {
  const conditions: string[] = [];
  if (from) conditions.push(`(min-width: ${BREAKPOINT_PX[from]}px)`);
  if (to) conditions.push(`(max-width: ${BREAKPOINT_PX[to] - 1}px)`);
  return conditions.length > 0 ? conditions.join(" and ") : "all";
}

/**
 * Renders its children only while the viewport is within `[from, to)`. Omit
 * `from` for "up to `to`", omit `to` for "`from` and up", omit both to always
 * render. Unlike CSS-based hiding, children outside the range are never mounted.
 */
export function Only({ from, to, children }: OnlyProps) {
  const matches = useMediaQuery(buildQuery(from, to));
  return matches ? children : null;
}
