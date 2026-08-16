/**
 * Variable builder.
 *
 * Colors → a two-mode collection (Dark default + Light), so the whole design
 * themes with a single mode switch. Spacing & radii → a single-mode number
 * collection for documentation and reuse in-file.
 */

import { COLOR_TOKENS, NS, radiiTokens, spacingTokens } from "../tokens";
import { hexToRgba } from "./color";

export interface BuiltVariables {
  colorVars: Record<string, Variable>;
  numberVars: Record<string, Variable>;
  colorCollection: VariableCollection;
  scaleCollection: VariableCollection;
}

export function buildVariables(): BuiltVariables {
  // ── Color collection with Dark (default) + Light modes ──────
  // Multiple modes require a paid Figma plan. On Starter/free the collection is
  // capped at one mode, so we add Light opportunistically and fall back to a
  // single Dark mode if addMode() is rejected.
  const colorCollection = figma.variables.createVariableCollection(`${NS} · Color`);
  const darkMode = colorCollection.modes[0].modeId;
  colorCollection.renameMode(darkMode, "Dark");

  let lightMode: string | null = null;
  try {
    lightMode = colorCollection.addMode("Light");
  } catch {
    lightMode = null; // free plan — Dark-only
  }

  const colorVars: Record<string, Variable> = {};
  for (const token of COLOR_TOKENS) {
    const v = figma.variables.createVariable(safeVarName(token.name), colorCollection, "COLOR");
    v.setValueForMode(darkMode, hexToRgba(token.dark));
    if (lightMode) v.setValueForMode(lightMode, hexToRgba(token.light));
    if (token.description) v.description = token.description;
    v.scopes = scopeFor(token.name);
    colorVars[token.name] = v;
  }

  // ── Scale collection (spacing + radii), single mode ─────────
  const scaleCollection = figma.variables.createVariableCollection(`${NS} · Scale`);
  const scaleMode = scaleCollection.modes[0].modeId;
  scaleCollection.renameMode(scaleMode, "Value");

  const numberVars: Record<string, Variable> = {};
  for (const tok of [...spacingTokens(), ...radiiTokens()]) {
    const v = figma.variables.createVariable(safeVarName(tok.name), scaleCollection, "FLOAT");
    v.setValueForMode(scaleMode, tok.value);
    v.scopes = tok.name.startsWith("radius") ? ["CORNER_RADIUS"] : ["GAP", "WIDTH_HEIGHT"];
    numberVars[tok.name] = v;
  }

  return { colorVars, numberVars, colorCollection, scaleCollection };
}

/**
 * Figma rejects some characters in variable names (notably "."). Slashes are
 * kept (they create groups) but collapsed/trimmed to stay valid.
 */
function safeVarName(name: string): string {
  return name
    .replace(/\./g, "_")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

/** Constrain where a color variable can be applied, for a tidy picker. */
function scopeFor(name: string): VariableScope[] {
  if (name.startsWith("text/")) return ["TEXT_FILL"];
  if (name.startsWith("border/") || name.startsWith("glass/border")) return ["STROKE_COLOR"];
  return ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"];
}
