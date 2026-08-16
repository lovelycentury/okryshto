/**
 * IconButton — variant set: Variant (Ghost · Glass · Solid). Square 44×44 tap
 * target used for the mobile menu trigger and inline actions.
 */

import { RADII } from "../tokens";
import { fillToken, iconBurger, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { applyEffect, assembleVariantSet, newComponent } from "./primitives";

type Variant = "Ghost" | "Glass" | "Solid";

async function buildIconButton(t: ThemeContext, variant: Variant): Promise<ComponentNode> {
  const c = newComponent(`Variant=${variant}`);
  c.resize(44, 44);
  c.primaryAxisSizingMode = "FIXED";
  c.counterAxisSizingMode = "FIXED";
  c.primaryAxisAlignItems = "CENTER";
  c.counterAxisAlignItems = "CENTER";
  c.cornerRadius = RADII.md;

  switch (variant) {
    case "Ghost":
      c.fills = [];
      break;
    case "Glass":
      fillToken(t, c, "glass/fill");
      strokeToken(t, c, "glass/border", 1);
      await applyEffect(c, "glass/card", t);
      break;
    case "Solid":
      fillToken(t, c, "bg/surface-raised");
      strokeToken(t, c, "border/default", 1);
      break;
  }

  c.appendChild(iconBurger(t, 22, "text/primary"));
  return c;
}

export async function buildIconButtonSet(t: ThemeContext): Promise<ComponentSetNode> {
  const comps: ComponentNode[] = [];
  for (const v of ["Ghost", "Glass", "Solid"] as Variant[]) {
    comps.push(await buildIconButton(t, v));
  }
  return assembleVariantSet("IconButton", comps);
}
