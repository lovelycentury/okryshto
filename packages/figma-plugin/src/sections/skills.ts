/**
 * Skills section — the technical stack, grouped as it reads on the CV.
 * Each item is an icon + label chip; chips wrap inside their card.
 */

import { RADII, SITE } from "../tokens";
import { autoFrame, fixedWidth } from "../core/layout";
import { fillToken, makeText, strokeToken } from "../core/nodes";
import { icon } from "../core/icons";
import { ThemeContext } from "../core/theme";
import { columnWidth, section, sectionHeading, twoColumns } from "./helpers";

export async function skillsSection(t: ThemeContext, width: number): Promise<FrameNode> {
  const s = section(t, "Skills", width, 32);

  const head = await sectionHeading(t, "Toolkit", "What I build with.", undefined, {
    maxWidth: width,
  });
  head.layoutAlign = "STRETCH";
  s.appendChild(head);

  const gap = 24;
  const pad = 24;
  const single = width < 720;
  const colW = single ? width : columnWidth(width, gap);
  const innerW = colW - pad * 2;

  const cards: FrameNode[] = [];

  for (const group of SITE.skills) {
    const card = autoFrame({ direction: "VERTICAL", gap: 16, padding: pad, cross: "MIN" });
    fixedWidth(card, colW);
    card.cornerRadius = RADII.lg;
    fillToken(t, card, "bg/surface");
    strokeToken(t, card, "border/subtle", 1);

    card.appendChild(await makeText(t, "overline", group.group, "accent/primary"));

    // A wrapping row only knows where to break if its primary axis is a real
    // fixed width — left on AUTO it just keeps extending past the card edge.
    const chips = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", wrap: true });
    chips.primaryAxisSizingMode = "FIXED";
    chips.resize(innerW, chips.height);
    chips.counterAxisSpacing = 8;

    for (const item of group.items) {
      const chip = autoFrame({
        direction: "HORIZONTAL",
        gap: 7,
        cross: "CENTER",
        align: "CENTER",
        padding: [6, 12],
      });
      chip.cornerRadius = RADII.full;
      fillToken(t, chip, "bg/inset");
      strokeToken(t, chip, "border/subtle", 1);
      chip.appendChild(icon(t, item.icon, 14, "accent/primary"));
      chip.appendChild(await makeText(t, "label/sm", item.name, "text/secondary"));
      chips.appendChild(chip);
    }
    card.appendChild(chips);

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
