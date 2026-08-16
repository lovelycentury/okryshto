/**
 * Avatar — variant set: Size (sm · md · lg) × Shape (Circle · Rounded).
 * Aurora gradient fill with centered initials — no external image needed.
 */

import { RADII, SITE } from "../tokens";
import { linearGradient } from "../core/color";
import { makeText, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { assembleVariantSet, newComponent } from "./primitives";

type Size = "sm" | "md" | "lg";
type Shape = "Circle" | "Rounded";

const DIM: Record<Size, { d: number; style: string }> = {
  sm: { d: 40, style: "label/md" },
  md: { d: 64, style: "heading/h3" },
  lg: { d: 96, style: "heading/h1" },
};

async function buildAvatar(t: ThemeContext, size: Size, shape: Shape): Promise<ComponentNode> {
  const { d, style } = DIM[size];
  const c = newComponent(`Size=${size}, Shape=${shape}`);
  c.resize(d, d);
  c.primaryAxisSizingMode = "FIXED";
  c.counterAxisSizingMode = "FIXED";
  c.primaryAxisAlignItems = "CENTER";
  c.counterAxisAlignItems = "CENTER";
  c.cornerRadius = shape === "Circle" ? RADII.full : Math.round(d * 0.22);
  c.fills = [
    linearGradient(
      [
        { hex: "#5EE6C1", position: 0 },
        { hex: "#818CF8", position: 1 },
      ],
      "diagonal",
    ),
  ];
  strokeToken(t, c, "glass/border", 1);

  const initials = await makeText(t, style, SITE.brand, "accent/contrast");
  c.appendChild(initials);
  return c;
}

export async function buildAvatarSet(t: ThemeContext): Promise<ComponentSetNode> {
  const comps: ComponentNode[] = [];
  for (const s of ["sm", "md", "lg"] as Size[]) {
    for (const shape of ["Circle", "Rounded"] as Shape[]) {
      comps.push(await buildAvatar(t, s, shape));
    }
  }
  return assembleVariantSet("Avatar", comps);
}
