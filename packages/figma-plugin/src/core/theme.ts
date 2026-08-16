/**
 * ThemeContext — the shared bag of resolved Figma artifacts handed to every
 * component/section generator. Built once per run by the pipeline.
 */

import { ResolvedFonts } from "./fonts";

export interface ThemeContext {
  fonts: ResolvedFonts;
  /** Color token name → Figma variable. */
  colorVars: Record<string, Variable>;
  /** Number token name → Figma variable (spacing/radii). */
  numberVars: Record<string, Variable>;
  /** Text style token name → Figma text style. */
  textStyles: Record<string, TextStyle>;
  /** Paint style name → Figma paint style (mirrors of color tokens + gradients). */
  paintStyles: Record<string, PaintStyle>;
  /** Effect style name → Figma effect style (shadows, glow, glass). */
  effectStyles: Record<string, EffectStyle>;
}

/** Guarded lookup — fails loudly on a mistyped token name. */
export function colorVar(t: ThemeContext, name: string): Variable {
  const v = t.colorVars[name];
  if (!v) throw new Error(`Unknown color variable: "${name}"`);
  return v;
}

export function textStyle(t: ThemeContext, name: string): TextStyle {
  const s = t.textStyles[name];
  if (!s) throw new Error(`Unknown text style: "${name}"`);
  return s;
}

export function effectStyle(t: ThemeContext, name: string): EffectStyle {
  const s = t.effectStyles[name];
  if (!s) throw new Error(`Unknown effect style: "${name}"`);
  return s;
}
