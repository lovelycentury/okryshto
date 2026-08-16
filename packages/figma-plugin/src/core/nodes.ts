/**
 * Low-level node helpers: fills bound to variables, text bound to styles+color,
 * shapes, and a handful of hand-drawn vector icons (Figma has no icon set).
 *
 * Everything here is auto-layout friendly and theme-aware.
 */

import { solid } from "./color";
import { icon } from "./icons";
import { ThemeContext, colorVar, textStyle } from "./theme";

/** A SolidPaint whose color is bound to a Figma variable (mode-aware). */
export function boundSolid(variable: Variable): SolidPaint {
  const paint: SolidPaint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
  return figma.variables.setBoundVariableForPaint(paint, "color", variable) as SolidPaint;
}

/** Fill a node with a color token (bound to its variable → theme-aware). */
export function fillToken(t: ThemeContext, node: GeometryMixin & SceneNode, token: string): void {
  node.fills = [boundSolid(colorVar(t, token))];
}

/** Add a bound-variable stroke of a color token. */
export function strokeToken(
  t: ThemeContext,
  node: SceneNode & MinimalStrokesMixin,
  token: string,
  weight = 1,
): void {
  node.strokes = [boundSolid(colorVar(t, token))];
  node.strokeWeight = weight;
  node.strokeAlign = "INSIDE";
}

/** Create a text node bound to a text style and a color token. */
export async function makeText(
  t: ThemeContext,
  styleName: string,
  characters: string,
  colorToken = "text/primary",
  opts: { align?: "LEFT" | "CENTER" | "RIGHT"; maxWidth?: number } = {},
): Promise<TextNode> {
  const style = textStyle(t, styleName);
  const node = figma.createText();
  node.fontName = style.fontName; // font is preloaded by the resolver
  node.characters = characters;
  await node.setTextStyleIdAsync(style.id);
  node.fills = [boundSolid(colorVar(t, colorToken))];
  if (styleName === "overline") node.textCase = "UPPER";
  if (opts.align) node.textAlignHorizontal = opts.align;
  if (opts.maxWidth) {
    node.textAutoResize = "HEIGHT";
    node.resize(opts.maxWidth, node.height);
  } else {
    node.textAutoResize = "WIDTH_AND_HEIGHT";
  }
  return node;
}

export function rect(width: number, height: number, radius = 0): RectangleNode {
  const r = figma.createRectangle();
  r.resize(width, height);
  if (radius) r.cornerRadius = radius;
  r.fills = [];
  r.strokes = [];
  return r;
}

export function ellipse(size: number): EllipseNode {
  const e = figma.createEllipse();
  e.resize(size, size);
  e.fills = [];
  e.strokes = [];
  return e;
}

/** A soft radial "aurora" light blob for atmospheric backgrounds. */
export function auroraBlob(size: number, hex: string): EllipseNode {
  const e = figma.createEllipse();
  e.resize(size, size);
  e.fills = [
    {
      type: "GRADIENT_RADIAL",
      gradientTransform: [
        [1, 0, 0],
        [0, 1, 0],
      ],
      gradientStops: [
        { color: { ...solidColor(hex), a: 0.9 }, position: 0 },
        { color: { ...solidColor(hex), a: 0 }, position: 1 },
      ],
    },
  ];
  e.effects = [{ type: "LAYER_BLUR", radius: 120, visible: true } as BlurEffect];
  e.name = "Aurora glow";
  return e;
}

function solidColor(hex: string): RGB {
  return solid(hex).color;
}

// ── Hand-drawn icons (stroke-based vectors) ───────────────────

/** Arrow icon (→, or ↗ diagonal) — crisp SVG glyph. */
export function iconArrow(
  t: ThemeContext,
  s = 16,
  token = "text/primary",
  diagonal = false,
): FrameNode {
  return icon(t, diagonal ? "arrow-up-right" : "arrow-right", s, token);
}

/** Burger menu icon — crisp SVG glyph. */
export function iconBurger(t: ThemeContext, s = 22, token = "text/primary"): FrameNode {
  return icon(t, "menu", s, token);
}

/** Close (×) icon — crisp SVG glyph. */
export function iconClose(t: ThemeContext, s = 22, token = "text/primary"): FrameNode {
  return icon(t, "x", s, token);
}

/** A small round "status" dot. */
export function statusDot(t: ThemeContext, token = "accent/primary", size = 8): EllipseNode {
  const e = ellipse(size);
  fillToken(t, e, token);
  e.name = "status-dot";
  return e;
}
