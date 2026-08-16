/**
 * Color tokens — dark-first premium palette.
 *
 * Every semantic token carries a value for both themes so the generated Figma
 * variables get a real Dark (default) + Light mode. Dark is the primary design
 * intent; Light is a faithful inversion for completeness / design-system rigor.
 *
 * Values are 8-digit or 6-digit hex. Alpha in hex is honored by the variable
 * builder (translucent tokens power the Apple-style glass surfaces).
 */

export type ThemeName = "Dark" | "Light";

export interface ColorToken {
  /** Slash-namespaced name → becomes the Figma variable path. */
  name: string;
  dark: string;
  light: string;
  description?: string;
}

export const COLOR_TOKENS: ColorToken[] = [
  // ── Backgrounds ─────────────────────────────────────────────
  {
    name: "bg/canvas",
    dark: "#0A0A0B",
    light: "#FBFBFC",
    description: "App background — deepest layer",
  },
  { name: "bg/surface", dark: "#0F0F12", light: "#FFFFFF", description: "Cards / raised surfaces" },
  {
    name: "bg/surface-raised",
    dark: "#16161A",
    light: "#F4F4F6",
    description: "Elevated / hover surfaces",
  },
  { name: "bg/inset", dark: "#080809", light: "#F0F0F3", description: "Wells, inputs, code" },

  // ── Glass (translucent — used with background blur) ─────────
  {
    name: "glass/fill",
    dark: "#FFFFFF14",
    light: "#0B0B0F14",
    description: "Glass surface fill (~8% white)",
  },
  {
    name: "glass/fill-strong",
    dark: "#FFFFFF1F",
    light: "#0B0B0F1A",
    description: "Stronger glass fill (~12%)",
  },
  {
    name: "glass/border",
    dark: "#FFFFFF24",
    light: "#12121814",
    description: "Hairline glass border",
  },

  // ── Borders ─────────────────────────────────────────────────
  {
    name: "border/subtle",
    dark: "#FFFFFF14",
    light: "#1212180F",
    description: "Hairline dividers",
  },
  {
    name: "border/default",
    dark: "#FFFFFF1F",
    light: "#1212181A",
    description: "Default component border",
  },
  {
    name: "border/strong",
    dark: "#FFFFFF33",
    light: "#12121833",
    description: "Emphasis border / focus ring base",
  },

  // ── Text ────────────────────────────────────────────────────
  {
    name: "text/primary",
    dark: "#F5F5F7",
    light: "#0B0B0F",
    description: "Headlines & primary copy",
  },
  {
    name: "text/secondary",
    dark: "#A9A9B2",
    light: "#3F3F46",
    description: "Body / supporting copy",
  },
  { name: "text/muted", dark: "#6E6E78", light: "#71717A", description: "Captions, metadata" },
  { name: "text/inverse", dark: "#0A0A0B", light: "#FFFFFF", description: "Text on accent fills" },

  // ── Accent (aurora: teal → indigo) ──────────────────────────
  {
    name: "accent/primary",
    dark: "#5EE6C1",
    light: "#0F9E82",
    description: "Primary accent — aurora teal",
  },
  {
    name: "accent/secondary",
    dark: "#818CF8",
    light: "#5B63E6",
    description: "Secondary accent — indigo (gradients)",
  },
  {
    name: "accent/dante",
    dark: "#FF3D8B",
    light: "#E01E6E",
    description: "Aurora pink — 'blood of Dante' highlight",
  },
  // Extra accents — already present in the cosmic backgrounds (neon violet,
  // warm ember, ice cyan); promoted to tokens so components can be tinted.
  {
    name: "accent/violet",
    dark: "#B84BFF",
    light: "#7C3AED",
    description: "Neon violet — nebula accent",
  },
  {
    name: "accent/ember",
    dark: "#FF8A5C",
    light: "#EA580C",
    description: "Warm ember — sunset accent",
  },
  { name: "accent/ice", dark: "#22D3EE", light: "#0891B2", description: "Ice cyan — cold accent" },
  {
    name: "accent/soft",
    dark: "#5EE6C129",
    light: "#0F9E8214",
    description: "Low-opacity accent wash / glow",
  },
  {
    name: "accent/contrast",
    dark: "#04140F",
    light: "#FFFFFF",
    description: "Text/icon on accent surface",
  },

  // ── Feedback ────────────────────────────────────────────────
  { name: "feedback/success", dark: "#4ADE80", light: "#16A34A", description: "Success" },
  { name: "feedback/warning", dark: "#FBBF24", light: "#D97706", description: "Warning" },
  {
    name: "feedback/danger",
    dark: "#FB7185",
    light: "#E11D48",
    description: "Error / destructive",
  },

  // ── State ───────────────────────────────────────────────────
  { name: "state/focus", dark: "#5EE6C1", light: "#0F9E82", description: "Focus ring color" },
];

/** Convenience accessor keyed by token name (throws on typo). */
export function colorTokenNames(): string[] {
  return COLOR_TOKENS.map((t) => t.name);
}
