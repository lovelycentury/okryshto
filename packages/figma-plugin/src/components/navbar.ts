/**
 * Glass header (organism) — Apple-like frosted sticky navigation.
 * Builder function (not a variant set) because it composes atoms and adapts to
 * breakpoint. Full-bleed at every size: brand on the left, controls on the
 * right; mobile adds a menu button beside the language select.
 */

import { RADII, SITE } from "../tokens";
import { linearGradient } from "../core/color";
import { autoFrame } from "../core/layout";
import { fillToken, iconBurger, makeText, strokeToken } from "../core/nodes";
import { icon } from "../core/icons";
import { logoLockup } from "../core/logo";
import { ThemeContext } from "../core/theme";
import { glassSurface } from "./primitives";

/**
 * Small brand lockup.
 *
 * Prefers the real logo cloned from the "◆ Logo" page — that lockup already
 * carries its own label, so nothing extra is drawn around it. Falls back to a
 * gradient initials chip when the file has no logo page.
 */
export async function brandMark(t: ThemeContext, chip = 30, withName = true): Promise<FrameNode> {
  const row = autoFrame({ name: "Brand", direction: "HORIZONTAL", gap: 10, cross: "CENTER" });

  const real = logoLockup("header", chip);
  if (real) {
    row.appendChild(real);
    return row;
  }

  const mark = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", align: "CENTER" });
  mark.resize(chip, chip);
  mark.primaryAxisSizingMode = "FIXED";
  mark.counterAxisSizingMode = "FIXED";
  mark.cornerRadius = Math.round(chip * 0.28);
  mark.fills = [
    linearGradient(
      [
        { hex: "#5EE6C1", position: 0 },
        { hex: "#818CF8", position: 1 },
      ],
      "diagonal",
    ),
  ];
  const initials = await makeText(t, "label/sm", SITE.brand, "accent/contrast");
  mark.appendChild(initials);
  row.appendChild(mark);
  if (withName) row.appendChild(await makeText(t, "heading/h4", SITE.name, "text/primary"));
  return row;
}

/** Fixed header height — content centres inside it. */
const BAR_H = 60;
/** Control height, shared by the language select and the menu button. */
const CONTROL_H = 40;

/** Language select — current locale, opens the locale list on click. */
async function langSelect(t: ThemeContext): Promise<FrameNode> {
  const c = autoFrame({
    name: "Language select",
    direction: "HORIZONTAL",
    gap: 6,
    cross: "CENTER",
    align: "CENTER",
    padding: [0, 12],
  });
  // Pinned height so it lines up with the menu button beside it.
  c.counterAxisSizingMode = "FIXED";
  c.resize(c.width, CONTROL_H);
  c.cornerRadius = RADII.md;
  fillToken(t, c, "glass/fill");
  strokeToken(t, c, "glass/border", 1);
  c.appendChild(icon(t, "globe", 14, "text/secondary"));
  c.appendChild(await makeText(t, "label/sm", SITE.locales.current, "text/primary"));
  c.appendChild(icon(t, "chevron-down", 12, "text/muted"));
  return c;
}

export async function navbarGlass(
  t: ThemeContext,
  width: number,
  mobile = false,
): Promise<FrameNode> {
  const bar = await glassSurface(t, "glass/header", RADII.md);
  bar.name = mobile ? "Header · Glass (mobile)" : "Header · Glass";
  bar.layoutMode = "HORIZONTAL";
  bar.counterAxisAlignItems = "CENTER";
  bar.counterAxisSizingMode = "FIXED"; // pin the height instead of hugging
  bar.paddingLeft = bar.paddingRight = mobile ? 14 : 20;
  bar.paddingTop = bar.paddingBottom = 10;

  // Full-bleed at every breakpoint: brand pinned left, controls pinned right.
  bar.primaryAxisSizingMode = "FIXED";
  bar.primaryAxisAlignItems = "SPACE_BETWEEN";
  bar.itemSpacing = 12;
  bar.resize(width, BAR_H);

  bar.appendChild(await brandMark(t, mobile ? 28 : 30, !mobile || width > 380));

  // Right-hand controls, grouped so SPACE_BETWEEN pins them to the right edge.
  const right = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  right.appendChild(await langSelect(t));

  if (mobile) {
    const menu = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    menu.resize(CONTROL_H, CONTROL_H);
    menu.primaryAxisSizingMode = "FIXED";
    menu.counterAxisSizingMode = "FIXED";
    menu.cornerRadius = RADII.md;
    fillToken(t, menu, "glass/fill");
    strokeToken(t, menu, "glass/border", 1);
    menu.appendChild(iconBurger(t, 20, "text/primary"));
    right.appendChild(menu);
  }

  bar.appendChild(right);
  return bar;
}
