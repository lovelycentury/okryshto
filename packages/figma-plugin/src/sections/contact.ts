/**
 * Contact section — the close. A big invitation, the email as a glass pill, and
 * a compact social row. This is where a vizitka earns its keep.
 */

import { RADII, SITE } from "../tokens";
import { autoFrame } from "../core/layout";
import { fillToken, iconArrow, makeText, statusDot, strokeToken } from "../core/nodes";
import { icon } from "../core/icons";
import { ThemeContext } from "../core/theme";
import { applyEffect } from "../components/primitives";
import { section, sectionHeading } from "./helpers";

export async function contactSection(t: ThemeContext, width: number): Promise<FrameNode> {
  const s = section(t, "Contact", width, 36, 120);

  const pad = width < 640 ? 24 : 56;
  const innerW = width - pad * 2;

  const card = autoFrame({ direction: "VERTICAL", gap: 28, padding: pad, cross: "MIN" });
  card.layoutAlign = "STRETCH";
  card.cornerRadius = RADII["3xl"];
  fillToken(t, card, "glass/fill");
  strokeToken(t, card, "glass/border", 1);
  await applyEffect(card, "glow/accent", t);

  // Step the headline down on narrow screens — display/lg at 44px turns this
  // sentence into a six-line block on mobile.
  const titleStyle = width >= 680 ? "display/xl" : width >= 480 ? "display/lg" : "heading/h1";
  const head = await sectionHeading(t, SITE.contact.eyebrow, SITE.contact.headline, undefined, {
    titleStyle,
    maxWidth: Math.min(innerW, 720),
  });
  head.layoutAlign = "STRETCH";
  card.appendChild(head);

  // Email + reply-time — two glass pills that wrap onto a second line when they
  // don't both fit. Wrapping needs a real fixed width; on AUTO the row just
  // keeps extending past the card edge.
  const emailRow = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", wrap: true });
  emailRow.primaryAxisSizingMode = "FIXED";
  emailRow.resize(innerW, emailRow.height);
  emailRow.counterAxisSpacing = 12;

  const email = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [12, 18] });
  email.cornerRadius = RADII.full;
  fillToken(t, email, "glass/fill-strong");
  strokeToken(t, email, "glass/border", 1);
  email.appendChild(icon(t, "mail", 16, "text/secondary"));
  email.appendChild(await makeText(t, "label/md", SITE.contact.email, "text/primary"));
  email.appendChild(icon(t, "copy", 15, "text/muted"));
  emailRow.appendChild(email);

  const reply = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [10, 16] });
  reply.cornerRadius = RADII.full;
  fillToken(t, reply, "glass/fill");
  strokeToken(t, reply, "glass/border", 1);
  reply.appendChild(statusDot(t, "accent/primary", 7));
  reply.appendChild(await makeText(t, "label/sm", SITE.contact.replyTime, "text/secondary"));
  emailRow.appendChild(reply);

  card.appendChild(emailRow);

  // Socials
  const socials = autoFrame({ direction: "HORIZONTAL", gap: 24, cross: "CENTER", wrap: true });
  socials.primaryAxisSizingMode = "FIXED";
  socials.resize(innerW, socials.height);
  socials.counterAxisSpacing = 12;
  for (const soc of SITE.contact.socials) {
    const link = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
    link.appendChild(await makeText(t, "label/md", soc, "text/secondary"));
    link.appendChild(iconArrow(t, 13, "text/muted", true));
    socials.appendChild(link);
  }
  card.appendChild(socials);

  s.appendChild(card);
  return s;
}
