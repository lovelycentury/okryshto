/**
 * LinkCard — the signature vizitka element: a tappable row linking to a
 * destination. Variant set on Variant (Default · Featured).
 *
 * Featured reads as glass with an accent glow; Default is a quiet surface row.
 */

import { RADII } from "../tokens";
import { autoFrame } from "../core/layout";
import { fillToken, iconArrow, makeText, statusDot, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { applyEffect, assembleVariantSet, newComponent } from "./primitives";

type Variant = "Default" | "Featured";

async function buildLinkCard(t: ThemeContext, variant: Variant): Promise<ComponentNode> {
  const featured = variant === "Featured";
  const c = newComponent(`Variant=${variant}`);
  c.layoutMode = "HORIZONTAL";
  c.counterAxisAlignItems = "CENTER";
  c.itemSpacing = 16;
  c.paddingTop = c.paddingBottom = 22;
  c.paddingLeft = c.paddingRight = 26;
  c.cornerRadius = RADII.lg;
  c.resize(520, c.height);
  c.counterAxisSizingMode = "FIXED";

  if (featured) {
    fillToken(t, c, "glass/fill");
    strokeToken(t, c, "glass/border", 1);
    await applyEffect(c, "glow/accent", t);
  } else {
    fillToken(t, c, "bg/surface");
    strokeToken(t, c, "border/subtle", 1);
  }

  const left = autoFrame({ direction: "VERTICAL", gap: 5, cross: "MIN" });
  const titleRow = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  if (featured) titleRow.appendChild(statusDot(t, "accent/primary", 7));
  const title = await makeText(t, "heading/h4", "Selected Work", "text/primary");
  title.name = "title";
  titleRow.appendChild(title);
  left.appendChild(titleRow);
  titleRow.layoutAlign = "STRETCH";

  const subtitle = await makeText(
    t,
    "body/sm",
    "A short, curated set of shipped products",
    "text/muted",
  );
  subtitle.name = "subtitle";
  left.appendChild(subtitle);
  // Reflow instead of hugging, so a narrow instance wraps the copy rather than
  // pushing it out past the card's edge.
  subtitle.layoutAlign = "STRETCH";
  subtitle.textAutoResize = "HEIGHT";

  const right = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  const meta = await makeText(t, "mono/sm", featured ? "work" : "essays", "text/muted");
  meta.name = "meta";
  right.appendChild(meta);
  right.appendChild(iconArrow(t, 18, featured ? "accent/primary" : "text/secondary", true));

  c.appendChild(left);
  c.appendChild(right);
  // The text column absorbs the slack and gives it back when the card narrows —
  // a fixed-size spacer here would just force an overflow instead.
  left.layoutGrow = 1;
  return c;
}

export async function buildLinkCardSet(t: ThemeContext): Promise<ComponentSetNode> {
  const comps: ComponentNode[] = [];
  for (const v of ["Default", "Featured"] as Variant[]) {
    comps.push(await buildLinkCard(t, v));
  }
  const set = assembleVariantSet("LinkCard", comps);
  set.resize(640, set.height);
  return set;
}
