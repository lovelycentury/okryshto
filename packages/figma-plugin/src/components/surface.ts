/**
 * Surface — variant set: Tone (Mint · Dante · Indigo · Violet · Ember · Ice).
 * The tinted, glowing card used for callouts and closing CTAs (the "If you
 * are shipping something that matters" block, credibility quote, stat cards):
 * a translucent tone-tinted fill, a hairline border in the same tone, and a
 * soft matching glow. One surface, recolorable to any accent in the palette.
 *
 * Effect styles are mint-only, so other tones mix their own drop shadow from
 * the token's hex — paint opacity is ignored on variable-bound fills, hence
 * the raw-hex `tokenAlpha` here rather than `fillToken`.
 */

import { RADII } from "../tokens";
import { solid } from "../core/color";
import { autoFrame } from "../core/layout";
import { makeText } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { assembleVariantSet, newComponent } from "./primitives";

type Tone = "Mint" | "Dante" | "Indigo" | "Violet" | "Ember" | "Ice";

const TONE_TOKEN: Record<Tone, string> = {
  Mint: "accent/primary",
  Dante: "accent/dante",
  Indigo: "accent/secondary",
  Violet: "accent/violet",
  Ember: "accent/ember",
  Ice: "accent/ice",
};

const TOKEN_HEX: Record<string, string> = {
  "accent/primary": "#5EE6C1",
  "accent/dante": "#FF3D8B",
  "accent/secondary": "#818CF8",
  "accent/violet": "#B84BFF",
  "accent/ember": "#FF8A5C",
  "accent/ice": "#22D3EE",
};

function tokenAlpha(token: string, a: number): SolidPaint {
  return { ...solid(TOKEN_HEX[token] ?? "#5EE6C1"), opacity: a } as SolidPaint;
}

function toneGlow(token: string, radius = 32, a = 0.28): DropShadowEffect {
  const c = solid(TOKEN_HEX[token] ?? "#5EE6C1").color;
  return {
    type: "DROP_SHADOW",
    color: { ...c, a },
    offset: { x: 0, y: 0 },
    radius,
    spread: 0,
    visible: true,
    blendMode: "NORMAL",
  } as DropShadowEffect;
}

async function buildSurface(t: ThemeContext, tone: Tone): Promise<ComponentNode> {
  const token = TONE_TOKEN[tone];
  const c = newComponent(`Tone=${tone}`);
  c.layoutMode = "VERTICAL";
  c.counterAxisAlignItems = "MIN";
  c.itemSpacing = 16;
  c.paddingTop = c.paddingBottom = c.paddingLeft = c.paddingRight = 28;
  c.cornerRadius = RADII["2xl"];
  c.resize(360, c.height);
  c.counterAxisSizingMode = "FIXED";

  c.fills = [tokenAlpha(token, 0.14)];
  c.strokes = [tokenAlpha(token, 0.4)];
  c.strokeWeight = 1;
  c.effects = [toneGlow(token)];

  c.appendChild(await makeText(t, "overline", tone, token));
  c.appendChild(
    await makeText(t, "heading/h3", "If you are shipping something that matters.", "text/primary", {
      maxWidth: 304,
    }),
  );

  const cta = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [10, 16] });
  cta.cornerRadius = RADII.full;
  cta.fills = [tokenAlpha(token, 0.9)];
  cta.appendChild(await makeText(t, "label/md", "hello@okryshto.dev", "text/inverse"));
  c.appendChild(cta);

  return c;
}

export async function buildSurfaceSet(t: ThemeContext): Promise<ComponentSetNode> {
  const comps: ComponentNode[] = [];
  for (const tone of ["Mint", "Dante", "Indigo", "Violet", "Ember", "Ice"] as Tone[]) {
    comps.push(await buildSurface(t, tone));
  }
  const set = assembleVariantSet("Surface", comps);
  set.resize(1220, set.height);
  return set;
}
