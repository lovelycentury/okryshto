/**
 * Beyond Code section — music, boxing, books, pattern-matching.
 * The human context that explains how the engineering decisions get made.
 */

import { RADII, SITE } from "../tokens";
import { autoFrame, fixedWidth } from "../core/layout";
import { fillToken, makeText, strokeToken } from "../core/nodes";
import { icon } from "../core/icons";
import { ThemeContext } from "../core/theme";
import { columnWidth, section, sectionHeading, twoColumns } from "./helpers";

export async function beyondCodeSection(t: ThemeContext, width: number): Promise<FrameNode> {
  const s = section(t, "Beyond code", width, 32);

  const head = await sectionHeading(
    t,
    SITE.beyondCode.eyebrow,
    SITE.beyondCode.headline,
    undefined,
    { maxWidth: width },
  );
  head.layoutAlign = "STRETCH";
  s.appendChild(head);

  const gap = 24;
  const single = width < 720;
  const colW = single ? width : columnWidth(width, gap);
  const textW = colW - 48; // card padding on both sides

  const cards: FrameNode[] = [];

  for (const item of SITE.beyondCode.items) {
    const card = autoFrame({ direction: "VERTICAL", gap: 12, padding: 24, cross: "MIN" });
    fixedWidth(card, colW);
    card.cornerRadius = RADII.lg;
    fillToken(t, card, "glass/fill");
    strokeToken(t, card, "glass/border", 1);

    const header = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
    const tile = autoFrame({ direction: "VERTICAL", align: "CENTER", cross: "CENTER", padding: 8 });
    tile.cornerRadius = RADII.md;
    fillToken(t, tile, "bg/surface");
    tile.appendChild(icon(t, item.icon, 18, "accent/primary"));
    header.appendChild(tile);
    header.appendChild(
      await makeText(t, "heading/h4", item.title, "text/primary", { maxWidth: textW - 60 }),
    );
    card.appendChild(header);

    card.appendChild(
      await makeText(t, "body/sm", item.desc, "text/secondary", { maxWidth: textW }),
    );

    cards.push(card);
  }

  if (single) {
    const col = autoFrame({ direction: "VERTICAL", gap, cross: "MIN" });
    col.counterAxisSizingMode = "FIXED";
    col.resize(width, col.height);
    for (const card of cards) col.appendChild(card);
    s.appendChild(col);
    return s;
  }

  s.appendChild(twoColumns(width, gap, cards));
  return s;
}
