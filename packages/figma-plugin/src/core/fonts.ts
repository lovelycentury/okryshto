/**
 * Robust font resolution.
 *
 * For each logical role we try its fallback chain and keep the first family that
 * actually loads in this Figma instance. Every required weight is preloaded so
 * later text-style / text-node creation never throws on an unloaded font.
 */

import { FONT_STACKS, FontRole, REQUIRED_WEIGHTS } from "../tokens";

export type ResolvedFonts = Record<FontRole, string>;

async function tryLoad(family: string, style: string): Promise<boolean> {
  try {
    await figma.loadFontAsync({ family, style });
    return true;
  } catch {
    return false;
  }
}

/** Resolve one role: first family whose Regular loads, then preload all weights. */
async function resolveRole(chain: string[]): Promise<string> {
  for (const family of chain) {
    if (await tryLoad(family, "Regular")) {
      // Preload the weights we use; ignore any individual weight that is missing.
      await Promise.all(
        REQUIRED_WEIGHTS.map(async (w) => {
          await tryLoad(family, w);
        }),
      );
      return family;
    }
  }
  // "Roboto" is the guaranteed final fallback in every chain, but stay safe:
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
  return "Roboto";
}

export async function resolveFonts(): Promise<ResolvedFonts> {
  const roles = Object.keys(FONT_STACKS) as FontRole[];
  const resolved = {} as ResolvedFonts;
  for (const role of roles) {
    resolved[role] = await resolveRole(FONT_STACKS[role]);
  }
  return resolved;
}

/**
 * Pick a concrete style that exists for a family, degrading gracefully:
 * "Semi Bold" → "SemiBold" → "Bold" → "Medium" → "Regular".
 */
export async function safeFontName(family: string, weight: string): Promise<FontName> {
  const candidates = [weight];
  if (weight === "Semi Bold") candidates.push("SemiBold", "Bold", "Medium");
  if (weight === "Medium") candidates.push("Regular");
  if (weight === "Bold") candidates.push("Semi Bold", "SemiBold", "Medium");
  candidates.push("Regular");
  for (const style of candidates) {
    if (await tryLoad(family, style)) return { family, style };
  }
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
  return { family: "Roboto", style: "Regular" };
}
