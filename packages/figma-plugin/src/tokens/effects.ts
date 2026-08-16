/**
 * Effect tokens — shadows, atmospheric accent glow, and glass (background blur).
 *
 * Each token compiles to a Figma effect style. Glass tokens combine a background
 * blur with a subtle drop shadow to read as Apple-like frosted material.
 */

export interface ShadowSpec {
  name: string;
  color: string; // hex w/ alpha
  x: number;
  y: number;
  blur: number;
  spread: number;
  description?: string;
}

export const SHADOW_TOKENS: ShadowSpec[] = [
  {
    name: "shadow/xs",
    color: "#00000040",
    x: 0,
    y: 1,
    blur: 2,
    spread: 0,
    description: "Hairline lift",
  },
  {
    name: "shadow/sm",
    color: "#00000047",
    x: 0,
    y: 4,
    blur: 12,
    spread: -2,
    description: "Chips, small cards",
  },
  {
    name: "shadow/md",
    color: "#00000059",
    x: 0,
    y: 12,
    blur: 32,
    spread: -6,
    description: "Cards, popovers",
  },
  {
    name: "shadow/lg",
    color: "#00000073",
    x: 0,
    y: 28,
    blur: 64,
    spread: -12,
    description: "Menus, modals",
  },
];

/** Atmospheric accent glow (Brittany-Chiang-style ambient light). */
export interface GlowSpec {
  name: string;
  color: string; // hex w/ alpha
  blur: number;
  spread: number;
  description?: string;
}

export const GLOW_TOKENS: GlowSpec[] = [
  {
    name: "glow/accent",
    color: "#5EE6C13D",
    blur: 80,
    spread: 0,
    description: "Aurora teal ambient glow",
  },
  {
    name: "glow/indigo",
    color: "#818CF833",
    blur: 96,
    spread: 0,
    description: "Indigo ambient glow",
  },
  {
    name: "glow/hover",
    color: "#5EE6C140",
    blur: 16,
    spread: 1,
    description: "Small, cute hover glow",
  },
  {
    name: "glow/button",
    color: "#5EE6C199",
    blur: 26,
    spread: 3,
    description: "Strong glow for filled buttons (hover & focus)",
  },
  {
    name: "glow/gradient",
    color: "#5EE6C1CC",
    blur: 52,
    spread: 6,
    description: "2× glow for gradient buttons (hover & focus)",
  },
];

/** Glass = background blur (+ optional inner shadow lift). */
export interface GlassSpec {
  name: string;
  blur: number;
  description?: string;
}

export const GLASS_TOKENS: GlassSpec[] = [
  { name: "glass/header", blur: 24, description: "Sticky header frosted material" },
  { name: "glass/menu", blur: 40, description: "Burger menu / overlay frosted material" },
  { name: "glass/card", blur: 16, description: "Glass card material" },
];
