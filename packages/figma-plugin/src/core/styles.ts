/**
 * Style builder — Text styles, Effect styles (shadows / glow / glass), and a
 * couple of signature gradient Paint styles.
 */

import { GLASS_TOKENS, GLOW_TOKENS, NS, SHADOW_TOKENS, TYPE_TOKENS } from "../tokens";
import { hexToRgba, linearGradient } from "./color";
import { ResolvedFonts } from "./fonts";
import { safeFontName } from "./fonts";

export interface BuiltStyles {
  textStyles: Record<string, TextStyle>;
  effectStyles: Record<string, EffectStyle>;
  paintStyles: Record<string, PaintStyle>;
}

export async function buildStyles(fonts: ResolvedFonts): Promise<BuiltStyles> {
  const textStyles = await buildTextStyles(fonts);
  const effectStyles = buildEffectStyles();
  const paintStyles = buildPaintStyles();
  return { textStyles, effectStyles, paintStyles };
}

async function buildTextStyles(fonts: ResolvedFonts): Promise<Record<string, TextStyle>> {
  const out: Record<string, TextStyle> = {};
  for (const token of TYPE_TOKENS) {
    const style = figma.createTextStyle();
    style.name = `${NS}/${token.name}`;
    style.fontName = await safeFontName(fonts[token.family], token.weight);
    style.fontSize = token.size;
    style.lineHeight = { unit: "PIXELS", value: token.lineHeight };
    style.letterSpacing = { unit: "PERCENT", value: token.tracking };
    if (token.description) style.description = token.description;
    // Keyed by the bare token name (what generators reference).
    out[token.name] = style;
  }
  return out;
}

function buildEffectStyles(): Record<string, EffectStyle> {
  const out: Record<string, EffectStyle> = {};

  for (const s of SHADOW_TOKENS) {
    const style = figma.createEffectStyle();
    style.name = `${NS}/${s.name}`;
    style.effects = [
      {
        type: "DROP_SHADOW",
        color: hexToRgba(s.color),
        offset: { x: s.x, y: s.y },
        radius: s.blur,
        spread: s.spread,
        visible: true,
        blendMode: "NORMAL",
      } as DropShadowEffect,
    ];
    if (s.description) style.description = s.description;
    out[s.name] = style;
  }

  for (const g of GLOW_TOKENS) {
    const style = figma.createEffectStyle();
    style.name = `${NS}/${g.name}`;
    style.effects = [
      {
        type: "DROP_SHADOW",
        color: hexToRgba(g.color),
        offset: { x: 0, y: 0 },
        radius: g.blur,
        spread: g.spread,
        visible: true,
        blendMode: "NORMAL",
      } as DropShadowEffect,
    ];
    if (g.description) style.description = g.description;
    out[g.name] = style;
  }

  // Glass = background blur + a soft lift shadow.
  for (const g of GLASS_TOKENS) {
    const style = figma.createEffectStyle();
    style.name = `${NS}/${g.name}`;
    style.effects = [
      { type: "BACKGROUND_BLUR", radius: g.blur, visible: true } as BlurEffect,
      {
        type: "DROP_SHADOW",
        color: hexToRgba("#0000004D"),
        offset: { x: 0, y: 8 },
        radius: 24,
        spread: -8,
        visible: true,
        blendMode: "NORMAL",
      } as DropShadowEffect,
    ];
    if (g.description) style.description = g.description;
    out[g.name] = style;
  }

  return out;
}

function buildPaintStyles(): Record<string, PaintStyle> {
  const out: Record<string, PaintStyle> = {};

  const aurora = figma.createPaintStyle();
  aurora.name = `${NS}/gradient/aurora`;
  aurora.paints = [
    linearGradient(
      [
        { hex: "#5EE6C1", position: 0 },
        { hex: "#818CF8", position: 1 },
      ],
      "diagonal",
    ),
  ];
  out["gradient/aurora"] = aurora;

  const sheen = figma.createPaintStyle();
  sheen.name = `${NS}/gradient/glass-sheen`;
  sheen.paints = [
    linearGradient(
      [
        { hex: "#FFFFFF24", position: 0 },
        { hex: "#FFFFFF00", position: 0.6 },
      ],
      "vertical",
    ),
  ];
  out["gradient/glass-sheen"] = sheen;

  return out;
}
