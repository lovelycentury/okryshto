/**
 * Card — variant set: Variant (Glass · Solid · Outline). A general content
 * surface used across sections.
 */

import { RADII } from "../tokens";
import { fillToken, makeText, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { applyEffect, assembleVariantSet, newComponent } from "./primitives";

type Variant = "Glass" | "Solid" | "Outline";

async function buildCard(t: ThemeContext, variant: Variant): Promise<ComponentNode> {
  const c = newComponent(`Variant=${variant}`);
  c.layoutMode = "VERTICAL";
  c.counterAxisAlignItems = "MIN";
  c.itemSpacing = 12;
  c.paddingTop = c.paddingBottom = 28;
  c.paddingLeft = c.paddingRight = 28;
  c.cornerRadius = RADII.xl;
  c.resize(320, c.height);
  c.counterAxisSizingMode = "FIXED";

  switch (variant) {
    case "Glass":
      fillToken(t, c, "glass/fill");
      strokeToken(t, c, "glass/border", 1);
      await applyEffect(c, "glass/card", t);
      break;
    case "Solid":
      fillToken(t, c, "bg/surface");
      strokeToken(t, c, "border/subtle", 1);
      await applyEffect(c, "shadow/md", t);
      break;
    case "Outline":
      c.fills = [];
      strokeToken(t, c, "border/default", 1);
      break;
  }

  c.appendChild(await makeText(t, "overline", "Principle", "accent/primary"));
  c.appendChild(await makeText(t, "heading/h3", "Clarity over cleverness", "text/primary"));
  const body = await makeText(
    t,
    "body/sm",
    "Interfaces should explain themselves. Motion and depth serve understanding — never decoration.",
    "text/secondary",
    { maxWidth: 264 },
  );
  c.appendChild(body);
  return c;
}

export async function buildCardSet(t: ThemeContext): Promise<ComponentSetNode> {
  const comps: ComponentNode[] = [];
  for (const v of ["Glass", "Solid", "Outline"] as Variant[]) {
    comps.push(await buildCard(t, v));
  }
  const set = assembleVariantSet("Card", comps);
  set.resize(1100, set.height);
  return set;
}
