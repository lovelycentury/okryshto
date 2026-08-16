/**
 * Burger menu overlay (organism) — full-screen frosted glass menu for mobile.
 * Large editorial nav links, close affordance, and a footer CTA.
 */

import { RADII, SITE } from "../tokens";
import { autoFrame, spacer } from "../core/layout";
import { fillToken, iconArrow, iconClose, makeText, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { applyEffect, glassSurface } from "./primitives";
import { brandMark } from "./navbar";

export async function burgerMenuOverlay(
  t: ThemeContext,
  width: number,
  height: number,
): Promise<FrameNode> {
  const overlay = await glassSurface(t, "glass/menu", RADII.none, true);
  overlay.name = "Burger Menu · Overlay";
  overlay.layoutMode = "VERTICAL";
  overlay.primaryAxisSizingMode = "FIXED";
  overlay.counterAxisSizingMode = "FIXED";
  overlay.resize(width, height);
  overlay.paddingLeft = overlay.paddingRight = 24;
  overlay.paddingTop = 20;
  overlay.paddingBottom = 32;
  overlay.itemSpacing = 40;
  await applyEffect(overlay, "glass/menu", t);

  const contentW = width - 48; // overlay's horizontal padding

  // Top bar: brand + close, pinned to opposite edges.
  // The row needs a real fixed width — hugging leaves the spacer at 1px, which
  // parks the close button next to the brand instead of at the right edge.
  const top = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
  top.primaryAxisSizingMode = "FIXED";
  top.resize(contentW, top.height);
  top.appendChild(await brandMark(t, 28, true));
  top.appendChild(spacer());
  const close = autoFrame({ align: "CENTER", cross: "CENTER" });
  close.resize(40, 40);
  close.primaryAxisSizingMode = "FIXED";
  close.counterAxisSizingMode = "FIXED";
  close.cornerRadius = RADII.md;
  fillToken(t, close, "glass/fill");
  strokeToken(t, close, "glass/border", 1);
  close.appendChild(iconClose(t, 20, "text/primary"));
  top.appendChild(close);
  overlay.appendChild(top);
  top.layoutAlign = "STRETCH";

  // Big nav links
  const nav = autoFrame({ direction: "VERTICAL", gap: 8 });
  for (const item of SITE.nav) {
    const row = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", padding: [10, 0] });
    row.primaryAxisSizingMode = "FIXED";
    row.resize(contentW, row.height);
    row.appendChild(await makeText(t, "display/lg", item, "text/primary"));
    row.appendChild(spacer());
    row.appendChild(iconArrow(t, 24, "accent/primary", true));
    const divider = figma.createRectangle();
    divider.resize(contentW, 1);
    fillToken(t, divider, "border/subtle");
    const wrap = autoFrame({ direction: "VERTICAL", gap: 0 });
    wrap.appendChild(row);
    wrap.appendChild(divider);
    nav.appendChild(wrap);
    wrap.layoutAlign = "STRETCH";
  }
  overlay.appendChild(nav);
  nav.layoutAlign = "STRETCH";

  return overlay;
}
