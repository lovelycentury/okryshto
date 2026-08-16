/**
 * Hero / identity section — the heart of the vizitka: name, role, one-line
 * proposition, primary/secondary CTAs, and a large portrait slot.
 *
 * Desktop / tablet: two columns (text left, portrait right).
 * Mobile: stacked (text, then portrait).
 *
 * The portrait is an empty image-fillable panel — select the node named
 * "Photo — replace fill with your image" and set its fill to an Image.
 */

import { RADII, SITE } from "../tokens";
import { linearGradient } from "../core/color";
import { autoFrame, fixedSize } from "../core/layout";
import {
  ellipse,
  fillToken,
  iconArrow,
  makeText,
  rect,
  statusDot,
  strokeToken,
} from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { applyEffect } from "../components/primitives";
import { section } from "./helpers";

function titleStyle(width: number): string {
  if (width >= 960) return "display/2xl";
  if (width >= 680) return "display/xl";
  return "display/lg";
}

/** A faint head-and-shoulders glyph to signal a portrait placeholder. */
function personGlyph(t: ThemeContext, size: number): FrameNode {
  const g = autoFrame({
    direction: "VERTICAL",
    align: "CENTER",
    cross: "CENTER",
    gap: Math.round(size * 0.08),
  });
  const head = ellipse(size * 0.4);
  fillToken(t, head, "border/strong");
  const body = rect(size * 0.9, size * 0.5, size * 0.45);
  fillToken(t, body, "border/strong");
  g.appendChild(head);
  g.appendChild(body);
  g.clipsContent = false;
  return g;
}

/** Empty, image-fillable portrait panel with an aurora glow. */
async function portraitSlot(t: ThemeContext, w: number, h: number): Promise<FrameNode> {
  const slot = autoFrame({
    name: "Photo — replace fill with your image",
    direction: "VERTICAL",
    align: "CENTER",
    cross: "CENTER",
    gap: 14,
  });
  fixedSize(slot, w, h);
  slot.cornerRadius = RADII["3xl"];
  slot.clipsContent = true;
  slot.fills = [
    linearGradient(
      [
        { hex: "#16161A", position: 0 },
        { hex: "#0B0B0F", position: 1 },
      ],
      "diagonal",
    ),
  ];
  strokeToken(t, slot, "glass/border", 1.5);
  await applyEffect(slot, "glow/accent", t);

  slot.appendChild(personGlyph(t, Math.min(w, h) * 0.34));
  slot.appendChild(await makeText(t, "label/md", "Drop your photo", "text/secondary"));
  slot.appendChild(await makeText(t, "caption", "Select · Fill · Image", "text/muted"));
  slot.appendChild(
    await makeText(t, "caption", "Idle: tilt −3° · Hover: straightens + glows", "text/muted"),
  );
  return slot;
}

/**
 * Upright slot holding the tilted portrait.
 *
 * A rotated node still occupies its *unrotated* box in auto-layout, so tilting
 * the photo directly made it visually overhang its neighbour. Wrapping it in an
 * upright, fixed-size frame gives layout a stable box to reserve, and the photo
 * is free-positioned (and rotated) inside it.
 */
async function portraitFrame(
  t: ThemeContext,
  slotW: number,
  slotH: number,
  photoW: number,
): Promise<FrameNode> {
  const slot = autoFrame({ name: "Portrait", direction: "VERTICAL" });
  fixedSize(slot, slotW, slotH);
  slot.clipsContent = false;

  const photo = await portraitSlot(t, photoW, slotH - 28);
  slot.appendChild(photo);
  photo.layoutPositioning = "ABSOLUTE";
  photo.x = Math.round((slotW - photoW) / 2);
  photo.y = 14;
  photo.rotation = -3; // idle tilt; hover straightens it (see the caption note)
  return slot;
}

async function availabilityPill(t: ThemeContext): Promise<FrameNode> {
  const pill = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [7, 14] });
  pill.cornerRadius = RADII.full;
  fillToken(t, pill, "glass/fill");
  strokeToken(t, pill, "glass/border", 1);
  pill.appendChild(statusDot(t, "accent/primary", 7));
  pill.appendChild(await makeText(t, "label/sm", SITE.availability, "text/secondary"));
  return pill;
}

async function primaryCta(t: ThemeContext, text: string): Promise<FrameNode> {
  const c = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [14, 22] });
  c.cornerRadius = RADII.full;
  fillToken(t, c, "accent/primary");
  await applyEffect(c, "glow/accent", t);
  c.appendChild(await makeText(t, "label/md", text, "accent/contrast"));
  c.appendChild(iconArrow(t, 16, "accent/contrast"));
  return c;
}

async function secondaryCta(t: ThemeContext, text: string): Promise<FrameNode> {
  const c = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [14, 22] });
  c.cornerRadius = RADII.full;
  fillToken(t, c, "glass/fill");
  strokeToken(t, c, "glass/border", 1);
  c.appendChild(await makeText(t, "label/md", text, "text/primary"));
  return c;
}

/** The text column (eyebrow → headline → lead → meta → CTAs). */
async function heroText(t: ThemeContext, width: number, textWidth: number): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 24, cross: "MIN" });
  // A real fixed width, not just a hug — without this, an unwrapped child (the
  // role/location meta row) can hug wider than its share of the row and spill
  // out from underneath the portrait sitting to its right.
  col.counterAxisSizingMode = "FIXED";
  col.resize(Math.max(1, textWidth), col.height);

  col.appendChild(await availabilityPill(t));
  col.appendChild(
    await makeText(t, titleStyle(width), SITE.hero.headline, "text/primary", {
      maxWidth: textWidth,
    }),
  );
  col.appendChild(
    await makeText(t, "body/lg", SITE.hero.lead, "text/secondary", {
      maxWidth: Math.min(textWidth, 560),
    }),
  );

  const meta = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", wrap: true });
  meta.layoutAlign = "STRETCH"; // bounded by col's fixed width so wrap can engage
  meta.appendChild(await makeText(t, "mono/sm", SITE.role, "text/muted"));
  meta.appendChild(await makeText(t, "mono/sm", "·", "text/muted"));
  meta.appendChild(await makeText(t, "mono/sm", SITE.location, "text/muted"));
  col.appendChild(meta);

  const ctas = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", wrap: true });
  ctas.appendChild(await primaryCta(t, SITE.hero.primaryCta));
  ctas.appendChild(await secondaryCta(t, SITE.hero.secondaryCta));
  col.appendChild(ctas);
  return col;
}

export async function heroSection(t: ThemeContext, width: number): Promise<FrameNode> {
  const s = section(t, "Hero", width, 40, 120);
  const twoCol = width >= 720;

  if (twoCol) {
    const portraitW = width >= 960 ? 280 : 240;
    const gap = width >= 960 ? 64 : 40;
    const portraitH = Math.round(portraitW * 1.2);
    // The tilted photo lives inside an upright slot; reserve room for the extra
    // width the rotation sweeps out, or the corners clip into the text column.
    const slotW = portraitW + 28;
    const textWidth = width - slotW - gap;

    const row = autoFrame({ direction: "HORIZONTAL", gap, cross: "CENTER" });
    // Size the row explicitly. Relying on layoutAlign alone left it at Figma's
    // default 100px, which collapsed the text column to 1px and stacked the
    // photo on top of the headline.
    row.primaryAxisSizingMode = "FIXED";
    row.resize(width, row.height);

    const text = await heroText(t, width, textWidth);
    row.appendChild(text);
    text.layoutGrow = 1; // only takes effect once it's inside the auto-layout row

    row.appendChild(await portraitFrame(t, slotW, portraitH, portraitW));
    s.appendChild(row);
    row.layoutAlign = "STRETCH";
  } else {
    const text = await heroText(t, width, width);
    text.layoutAlign = "STRETCH";
    s.appendChild(text);
    const portrait = await portraitSlot(t, width, Math.round(width * 1.05));
    portrait.layoutAlign = "STRETCH";
    s.appendChild(portrait);
  }

  return s;
}
