/**
 * Achievements Showcase section — wins, hackathons, milestones.
 * Grid of achievement cards, real design-system icons (not emoji).
 */

import { RADII, SITE } from "../tokens";
import { autoFrame, fixedWidth } from "../core/layout";
import { fillToken, makeText, strokeToken } from "../core/nodes";
import { icon } from "../core/icons";
import { ThemeContext } from "../core/theme";
import { section, sectionHeading } from "./helpers";

export async function achievementsShowcaseSection(
  t: ThemeContext,
  width: number,
): Promise<FrameNode> {
  const s = section(t, "Achievements", width, 32);

  const head = await sectionHeading(t, "Milestones", "Wins & achievements", undefined, {
    maxWidth: width,
  });
  head.layoutAlign = "STRETCH";
  s.appendChild(head);

  // One column on narrow boards — two side-by-side cards don't leave enough
  // room for the value text and cause it to overflow into the neighbour.
  const columns = width < 560 ? 1 : 2;
  const gap = 24;
  const colW = Math.floor((width - gap * (columns - 1)) / columns);
  const textW = colW - 48; // card padding on both sides

  const grid = autoFrame({ direction: "HORIZONTAL", gap, wrap: true, cross: "MIN" });
  grid.layoutAlign = "STRETCH";
  grid.primaryAxisSizingMode = "FIXED";
  grid.counterAxisSpacing = gap;

  for (const achievement of SITE.intro.achievements.items) {
    const card = autoFrame({ direction: "VERTICAL", gap: 10, padding: 24, cross: "MIN" });
    fixedWidth(card, colW);
    card.clipsContent = true; // safety net if content ever runs long
    card.cornerRadius = RADII.lg;
    fillToken(t, card, "glass/fill");
    strokeToken(t, card, "glass/border", 1);

    // Icon + the headline number, wraps to two lines rather than overflow.
    const header = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", wrap: true });
    header.layoutAlign = "STRETCH";
    const iconTile = autoFrame({
      direction: "VERTICAL",
      align: "CENTER",
      cross: "CENTER",
      padding: 8,
    });
    iconTile.cornerRadius = RADII.md;
    fillToken(t, iconTile, "bg/surface");
    iconTile.appendChild(icon(t, achievement.icon, 18, "accent/primary"));
    header.appendChild(iconTile);
    header.appendChild(
      await makeText(t, "heading/h1", achievement.value, "accent/primary", { maxWidth: textW }),
    );
    card.appendChild(header);

    card.appendChild(
      await makeText(t, "heading/h4", achievement.label, "text/primary", { maxWidth: textW }),
    );
    card.appendChild(
      await makeText(t, "body/sm", achievement.desc, "text/secondary", { maxWidth: textW }),
    );

    grid.appendChild(card);
  }

  s.appendChild(grid);
  return s;
}
