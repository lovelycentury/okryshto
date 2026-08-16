/**
 * Intro section — the opening statement: eyebrow, about copy, dual CTAs
 * (Orbit | okryshto.dev), and a small avatar badge tucked into the top-right
 * corner (absolutely positioned so it doesn't compete with the copy for width).
 *
 * Uses the shared `section()` helper (zero horizontal padding) so its content
 * lines up flush-left with every other section — Hero, Links, Credibility,
 * Contact — instead of carrying its own extra inset.
 */

import { RADII, SITE } from "../tokens";
import { autoFrame, fixedSize, fixedWidth } from "../core/layout";
import { fillToken, iconArrow, makeText } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { section, sectionHeading } from "./helpers";

const CTAS = [
  { label: "Orbit", url: "orbit.okryshto.dev" },
  { label: "okryshto.dev", url: "okryshto.dev" },
];

async function ctaRow(t: ThemeContext): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 16, cross: "CENTER", wrap: true });
  row.counterAxisSpacing = 12;

  const buttons: FrameNode[] = [];
  for (const cta of CTAS) {
    const btn = autoFrame({
      direction: "HORIZONTAL",
      gap: 8,
      cross: "CENTER",
      align: "CENTER",
      padding: [12, 16],
    });
    btn.cornerRadius = RADII.md;
    fillToken(t, btn, "accent/primary");
    btn.name = cta.url;
    btn.appendChild(await makeText(t, "label/md", cta.label, "accent/contrast"));
    btn.appendChild(iconArrow(t, 14, "accent/contrast"));
    row.appendChild(btn);
    buttons.push(btn);
  }

  // Match both buttons to the widest label's hug width, so "Orbit" and
  // "okryshto.dev" render as the same size instead of hugging their own text.
  const maxW = Math.max(...buttons.map((b) => b.width));
  for (const btn of buttons) fixedWidth(btn, maxW);

  return row;
}

function avatarBadge(t: ThemeContext, size: number): FrameNode {
  const a = autoFrame({ direction: "VERTICAL", gap: 0, align: "CENTER", cross: "CENTER" });
  fixedSize(a, size, size);
  a.cornerRadius = RADII.full;
  fillToken(t, a, "accent/primary");
  a.opacity = 0.25;
  a.name = "avatar-placeholder";
  return a;
}

export async function introSection(t: ThemeContext, width: number): Promise<FrameNode> {
  const twoCol = width >= 720;
  const avatar = width >= 960 ? 88 : width >= 600 ? 72 : 56;
  const margin = 8; // small breathing room so the badge isn't flush to the pixel edge

  const s = section(t, "Intro", width, twoCol ? 32 : 40);

  const head = await sectionHeading(t, SITE.intro.eyebrow, "About", undefined, { maxWidth: width });
  head.layoutAlign = "STRETCH";
  s.appendChild(head);

  const body = await makeText(
    t,
    twoCol ? "heading/h2" : "heading/h3",
    SITE.intro.body,
    "text/secondary",
    {
      maxWidth: Math.max(240, Math.min(width, 520)),
    },
  );
  body.name = "intro-body";
  s.appendChild(body);

  s.appendChild(await ctaRow(t));

  // Corner badge — positioned by absolute x/y, so it sits outside normal flow
  // and doesn't steal width from the copy column.
  const badge = avatarBadge(t, avatar);
  s.appendChild(badge);
  badge.layoutPositioning = "ABSOLUTE";
  badge.x = width - avatar - margin;
  badge.y = margin;

  return s;
}
