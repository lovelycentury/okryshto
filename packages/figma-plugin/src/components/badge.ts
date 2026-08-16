/**
 * Badge / Tag — variant set: Variant (Neutral · Accent · Outline) × Size (sm · md).
 */

import { RADII } from "../tokens";
import { fillToken, makeText, statusDot, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { assembleVariantSet, newComponent } from "./primitives";

type Variant = "Neutral" | "Accent" | "Outline";
type Size = "sm" | "md";

async function buildBadge(t: ThemeContext, variant: Variant, size: Size): Promise<ComponentNode> {
  const c = newComponent(`Variant=${variant}, Size=${size}`);
  const padV = size === "sm" ? 4 : 6;
  const padH = size === "sm" ? 10 : 12;
  c.paddingTop = c.paddingBottom = padV;
  c.paddingLeft = c.paddingRight = padH;
  c.itemSpacing = 6;
  c.cornerRadius = RADII.full;

  let textToken = "text/secondary";
  switch (variant) {
    case "Neutral":
      fillToken(t, c, "bg/surface-raised");
      textToken = "text/secondary";
      break;
    case "Accent":
      fillToken(t, c, "accent/soft");
      textToken = "accent/primary";
      c.appendChild(statusDot(t, "accent/primary", size === "sm" ? 6 : 7));
      break;
    case "Outline":
      c.fills = [];
      strokeToken(t, c, "border/default", 1);
      textToken = "text/secondary";
      break;
  }

  c.appendChild(await makeText(t, size === "sm" ? "label/sm" : "label/md", "Available", textToken));
  return c;
}

export async function buildBadgeSet(t: ThemeContext): Promise<ComponentSetNode> {
  const comps: ComponentNode[] = [];
  for (const v of ["Neutral", "Accent", "Outline"] as Variant[]) {
    for (const s of ["sm", "md"] as Size[]) {
      comps.push(await buildBadge(t, v, s));
    }
  }
  return assembleVariantSet("Badge", comps);
}
