/**
 * Button — variant set: Variant (Primary · Secondary · Ghost · Glass) × Size (sm · md · lg).
 */

import { RADII } from "../tokens";
import { fillToken, makeText, strokeToken, iconArrow } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { applyEffect, assembleVariantSet, newComponent } from "./primitives";

type Variant = "Primary" | "Secondary" | "Ghost" | "Glass";
type Size = "sm" | "md" | "lg";

const VARIANTS: Variant[] = ["Primary", "Secondary", "Ghost", "Glass"];
const SIZES: Size[] = ["sm", "md", "lg"];

const SIZE_SPEC: Record<
  Size,
  { padV: number; padH: number; gap: number; style: string; icon: number }
> = {
  sm: { padV: 8, padH: 14, gap: 6, style: "label/sm", icon: 14 },
  md: { padV: 12, padH: 18, gap: 8, style: "label/md", icon: 16 },
  lg: { padV: 15, padH: 24, gap: 10, style: "body/md", icon: 18 },
};

async function buildButton(t: ThemeContext, variant: Variant, size: Size): Promise<ComponentNode> {
  const spec = SIZE_SPEC[size];
  const c = newComponent(`Variant=${variant}, Size=${size}`);
  c.itemSpacing = spec.gap;
  c.paddingTop = c.paddingBottom = spec.padV;
  c.paddingLeft = c.paddingRight = spec.padH;
  c.cornerRadius = RADII.md;

  let textToken = "text/primary";
  switch (variant) {
    case "Primary":
      fillToken(t, c, "accent/primary");
      textToken = "accent/contrast";
      await applyEffect(c, "glow/accent", t);
      break;
    case "Secondary":
      fillToken(t, c, "bg/surface-raised");
      strokeToken(t, c, "border/default", 1);
      textToken = "text/primary";
      break;
    case "Ghost":
      c.fills = [];
      textToken = "text/secondary";
      break;
    case "Glass":
      fillToken(t, c, "glass/fill");
      strokeToken(t, c, "glass/border", 1);
      await applyEffect(c, "glass/card", t);
      textToken = "text/primary";
      break;
  }

  const label = await makeText(
    t,
    spec.style,
    variant === "Primary" ? "Get in touch" : "Learn more",
    textToken,
  );
  c.appendChild(label);

  // Primary & Glass carry a trailing arrow for affordance.
  if (variant === "Primary" || variant === "Glass") {
    c.appendChild(iconArrow(t, spec.icon, textToken));
  }
  return c;
}

export async function buildButtonSet(t: ThemeContext): Promise<ComponentSetNode> {
  const comps: ComponentNode[] = [];
  for (const v of VARIANTS) {
    for (const s of SIZES) {
      comps.push(await buildButton(t, v, s));
    }
  }
  return assembleVariantSet("Button", comps);
}
