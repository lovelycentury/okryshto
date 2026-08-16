/**
 * Credibility section — quiet proof: wordmarks, a few numbers, one testimonial.
 * Establishes trust without a case-study wall.
 */

import { RADII, SITE } from "../tokens";
import { autoFrame } from "../core/layout";
import { fillToken, makeText, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { applyEffect } from "../components/primitives";
import { section } from "./helpers";

export async function credibilitySection(
  t: ThemeContext,
  width: number,
  compact = false,
): Promise<FrameNode> {
  const s = section(t, "Credibility", width, 48);

  // No "Trusted by" logo strip — the companies now have their own cards in the
  // Projects section, so repeating them here was redundant.

  // Stats. Note: no wrap on the horizontal row — `layoutGrow` is ignored inside a
  // wrapping container, which collapses every card onto the same spot.
  const stats = autoFrame({
    direction: compact ? "VERTICAL" : "HORIZONTAL",
    gap: compact ? 20 : 48,
  });
  stats.layoutAlign = "STRETCH";
  if (!compact) {
    // `layoutGrow` needs a genuinely fixed primary axis to divide — inheriting
    // width from layoutAlign:STRETCH alone left this frame hugging (AUTO), so
    // every growing card collapsed to a sliver. Force it fixed explicitly.
    stats.primaryAxisSizingMode = "FIXED";
    stats.resize(width, stats.height);
  }
  for (const stat of SITE.credibility.stats) {
    const card = autoFrame({ direction: "VERTICAL", gap: 6, padding: 28, cross: "MIN" });
    card.cornerRadius = RADII.xl;
    fillToken(t, card, "bg/surface");
    strokeToken(t, card, "border/subtle", 1);
    card.appendChild(await makeText(t, "display/lg", stat.value, "text/primary"));
    card.appendChild(await makeText(t, "body/sm", stat.label, "text/muted"));
    stats.appendChild(card);
    // layoutGrow only takes effect once the node is already a child of an
    // auto-layout frame — must set it after appendChild, not before.
    if (!compact) {
      card.layoutGrow = 1;
    } else {
      card.layoutAlign = "STRETCH";
    }
  }
  s.appendChild(stats);

  // Quote
  const quote = autoFrame({
    direction: "VERTICAL",
    gap: 16,
    padding: compact ? 28 : 40,
    cross: "MIN",
  });
  quote.layoutAlign = "STRETCH";
  quote.cornerRadius = RADII["2xl"];
  fillToken(t, quote, "glass/fill");
  strokeToken(t, quote, "glass/border", 1);
  await applyEffect(quote, "glow/indigo", t);
  quote.appendChild(
    await makeText(
      t,
      compact ? "heading/h3" : "heading/h2",
      SITE.credibility.quote,
      "text/primary",
      {
        maxWidth: Math.min(width - 80, 760),
      },
    ),
  );
  quote.appendChild(await makeText(t, "label/md", SITE.credibility.quoteAuthor, "accent/primary"));
  s.appendChild(quote);

  // Hackathon win — same glass-card treatment as the quote above, but a
  // sourced fact rather than a testimonial (the announcement has no direct
  // quote about the winning project, so this cites the result, not a line).
  const win = autoFrame({
    direction: "VERTICAL",
    gap: 16,
    padding: compact ? 28 : 40,
    cross: "MIN",
  });
  win.layoutAlign = "STRETCH";
  win.cornerRadius = RADII["2xl"];
  fillToken(t, win, "glass/fill");
  strokeToken(t, win, "glass/border", 1);
  await applyEffect(win, "glow/accent", t);
  win.appendChild(
    await makeText(
      t,
      compact ? "heading/h3" : "heading/h2",
      SITE.credibility.hackathon.headline,
      "text/primary",
      {
        maxWidth: Math.min(width - 80, 760),
      },
    ),
  );
  win.appendChild(
    await makeText(t, "body/sm", SITE.credibility.hackathon.meta, "text/secondary", {
      maxWidth: Math.min(width - 80, 700),
    }),
  );
  win.appendChild(
    await makeText(t, "label/md", SITE.credibility.hackathon.source, "accent/primary"),
  );
  s.appendChild(win);

  return s;
}
