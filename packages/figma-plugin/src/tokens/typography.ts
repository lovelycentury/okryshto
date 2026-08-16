/**
 * Typography tokens — an editorial modular scale.
 *
 * `family` is a logical role ("display" | "text" | "mono"); the font resolver
 * maps each role to the first available concrete font (with fallbacks), so the
 * plugin never crashes on a missing font.
 */

export type FontRole = "display" | "text" | "mono";

export interface TypeToken {
  /** Slash-namespaced name → Figma text style path. */
  name: string;
  family: FontRole;
  /** Figma font style, e.g. "Regular", "Medium", "Semi Bold". */
  weight: string;
  size: number;
  lineHeight: number;
  /** Letter spacing in %. */
  tracking: number;
  case?: "upper" | "none";
  description?: string;
}

export const TYPE_TOKENS: TypeToken[] = [
  {
    name: "display/2xl",
    family: "display",
    weight: "Semi Bold",
    size: 72,
    lineHeight: 76,
    tracking: -2.5,
    description: "Hero identity",
  },
  {
    name: "display/xl",
    family: "display",
    weight: "Semi Bold",
    size: 56,
    lineHeight: 60,
    tracking: -2,
    description: "Screen titles",
  },
  {
    name: "display/lg",
    family: "display",
    weight: "Semi Bold",
    size: 44,
    lineHeight: 50,
    tracking: -1.5,
  },
  {
    name: "heading/h1",
    family: "display",
    weight: "Semi Bold",
    size: 34,
    lineHeight: 42,
    tracking: -1,
  },
  {
    name: "heading/h2",
    family: "display",
    weight: "Medium",
    size: 26,
    lineHeight: 34,
    tracking: -0.5,
  },
  {
    name: "heading/h3",
    family: "text",
    weight: "Semi Bold",
    size: 20,
    lineHeight: 28,
    tracking: -0.2,
  },
  {
    name: "heading/h4",
    family: "text",
    weight: "Semi Bold",
    size: 17,
    lineHeight: 24,
    tracking: 0,
  },
  {
    name: "body/lg",
    family: "text",
    weight: "Regular",
    size: 18,
    lineHeight: 30,
    tracking: 0,
    description: "Lead paragraph",
  },
  { name: "body/md", family: "text", weight: "Regular", size: 16, lineHeight: 26, tracking: 0 },
  { name: "body/sm", family: "text", weight: "Regular", size: 14, lineHeight: 22, tracking: 0 },
  { name: "label/md", family: "text", weight: "Medium", size: 15, lineHeight: 20, tracking: 0 },
  { name: "label/sm", family: "text", weight: "Medium", size: 13, lineHeight: 16, tracking: 0 },
  { name: "caption", family: "text", weight: "Regular", size: 13, lineHeight: 18, tracking: 0.1 },
  {
    name: "overline",
    family: "text",
    weight: "Medium",
    size: 12,
    lineHeight: 16,
    tracking: 8,
    case: "upper",
    description: "Eyebrow labels",
  },
  {
    name: "mono/sm",
    family: "mono",
    weight: "Regular",
    size: 13,
    lineHeight: 20,
    tracking: 0,
    description: "Metadata / code",
  },
];

/**
 * Font fallback chains per role. The resolver tries each in order and keeps the
 * first that loads. "Inter" and "Roboto" are effectively always present in Figma,
 * so the tail of each chain guarantees success.
 */
export const FONT_STACKS: Record<FontRole, string[]> = {
  display: ["Inter Tight", "Inter", "Roboto"],
  text: ["Inter", "Roboto"],
  mono: ["JetBrains Mono", "Roboto Mono", "Space Mono", "Roboto"],
};

/** Weights we must preload for each role. */
export const REQUIRED_WEIGHTS = ["Regular", "Medium", "Semi Bold", "Bold"];
