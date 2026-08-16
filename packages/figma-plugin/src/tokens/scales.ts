/**
 * Non-color scalar scales: spacing, radii, blur.
 *
 * These are the geometry source of truth in code (used directly for auto-layout
 * padding/gap and corner radii). The variable builder also mirrors spacing and
 * radii into Figma number variables so they are documented and reusable in-file.
 */

export interface ScaleToken {
  name: string;
  value: number;
  description?: string;
}

/** 4px base spacing scale. */
export const SPACING: Record<string, number> = {
  "0": 0,
  px: 1,
  "0.5": 2,
  "1": 4,
  "1.5": 6,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "8": 32,
  "10": 40,
  "12": 48,
  "16": 64,
  "20": 80,
  "24": 96,
  "32": 128,
  "40": 160,
};

export const RADII: Record<string, number> = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  "2xl": 28,
  "3xl": 36,
  full: 9999,
};

export const BLUR: Record<string, number> = {
  sm: 8,
  md: 20,
  lg: 32,
  xl: 48,
};

/** Max content width used by section/screen layout. */
export const CONTENT_MAX_WIDTH = 1120;

/** Canonical breakpoint frame widths for the Screens page. */
export const BREAKPOINTS = {
  desktop: 1440,
  tablet: 834,
  mobile: 390,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

export function spacingTokens(): ScaleToken[] {
  return Object.entries(SPACING).map(([k, v]) => ({ name: `space/${k}`, value: v }));
}

export function radiiTokens(): ScaleToken[] {
  return Object.entries(RADII)
    .filter(([k]) => k !== "full")
    .map(([k, v]) => ({ name: `radius/${k}`, value: v }));
}
