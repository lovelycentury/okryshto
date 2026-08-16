/**
 * Carousel shell — Embla-style: a clipped viewport with a right-edge fade
 * (hints there's more, melts the peeking slide into the background) plus
 * arrow/dot controls. Generic over slide content — the same shell used by
 * the Carousel shown in Basic components, reused wherever a horizontal
 * slide-through fits (e.g. the credibility company-logo strip).
 */

import { RADII } from "../tokens";
import { linearGradient } from "../core/color";
import { autoFrame } from "../core/layout";
import { ellipse, fillToken, rect, strokeToken } from "../core/nodes";
import { icon } from "../core/icons";
import { ThemeContext } from "../core/theme";

function carouselArrow(t: ThemeContext, name: string): FrameNode {
  const f = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  f.resize(40, 40);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = RADII.full;
  fillToken(t, f, "glass/fill");
  strokeToken(t, f, "glass/border", 1);
  f.appendChild(icon(t, name, 18, "text/primary"));
  return f;
}

function dots(t: ThemeContext, count: number, active: number): FrameNode {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
  for (let i = 0; i < count; i++) {
    if (i === active) {
      const pill = rect(16, 6, 3);
      fillToken(t, pill, "accent/primary");
      row.appendChild(pill);
    } else {
      const d = ellipse(6);
      fillToken(t, d, "border/strong");
      row.appendChild(d);
    }
  }
  return row;
}

/** Build a clipped, controlled carousel from pre-built slide nodes. */
export async function buildCarousel(
  t: ThemeContext,
  w: number,
  slideH: number,
  slides: FrameNode[],
): Promise<FrameNode> {
  const wrap = autoFrame({ direction: "VERTICAL", gap: 18 });
  wrap.resize(w, wrap.height);
  wrap.counterAxisSizingMode = "FIXED";

  const viewport = figma.createFrame();
  viewport.name = "viewport";
  viewport.resize(w, slideH);
  viewport.fills = [];
  viewport.clipsContent = true;

  const track = autoFrame({ direction: "HORIZONTAL", gap: 14 });
  for (const slide of slides) track.appendChild(slide);
  viewport.appendChild(track);
  track.x = 0;
  track.y = 0;

  const fade = rect(80, slideH);
  fade.name = "edge-fade";
  fade.fills = [
    linearGradient(
      [
        { hex: "#08080900", position: 0 },
        { hex: "#080809FF", position: 1 },
      ],
      "horizontal",
    ),
  ];
  viewport.appendChild(fade);
  fade.x = w - 80;
  fade.y = 0;
  wrap.appendChild(viewport);

  const controls = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", align: "SPACE_BETWEEN" });
  controls.resize(w, controls.height);
  controls.primaryAxisSizingMode = "FIXED";
  controls.counterAxisSizingMode = "AUTO";
  controls.appendChild(carouselArrow(t, "chevron-left"));
  controls.appendChild(dots(t, slides.length, 0));
  controls.appendChild(carouselArrow(t, "chevron-right"));
  wrap.appendChild(controls);

  return wrap;
}
