/**
 * ProjectCard — a case-study poster: gradient cover, a device mock, a bottom
 * scrim so type stays legible over any gradient, tags, title and description.
 *
 * Extracted from the Basic catalog board so sections can compose real project
 * cards instead of re-implementing the look. Self-contained: it builds its own
 * tag chips and action square rather than reaching into catalog internals.
 */

import { RADII } from "../tokens";
import { linearGradient } from "../core/color";
import { autoFrame } from "../core/layout";
import { ellipse, fillToken, makeText, rect, strokeToken } from "../core/nodes";
import { icon } from "../core/icons";
import { ThemeContext } from "../core/theme";

export interface ProjectCardOpts {
  title: string;
  desc: string;
  tags: string[];
  /** Gradient cover stops. */
  hex1: string;
  hex2: string;
  device?: boolean;
  /**
   * Hug the content vertically instead of using the passed height — lets cards
   * in a grid end up at different heights. The scrim and device mock need a
   * known height, so they are added after the card has measured itself.
   */
  autoHeight?: boolean;
}

function logoChip(): EllipseNode {
  const c = ellipse(32);
  c.fills = [
    linearGradient(
      [
        { hex: "#5EE6C1", position: 0 },
        { hex: "#818CF8", position: 1 },
      ],
      "diagonal",
    ),
  ];
  return c;
}

/** Glass square with an outward arrow — the "open case" affordance. */
function actionSquare(t: ThemeContext): FrameNode {
  const f = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  f.resize(36, 36);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = RADII.md;
  fillToken(t, f, "glass/fill");
  strokeToken(t, f, "glass/border", 1);
  f.appendChild(icon(t, "arrow-up-right", 16, "text/primary"));
  return f;
}

async function tagChip(t: ThemeContext, text: string): Promise<FrameNode> {
  const chip = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [4, 10],
  });
  chip.cornerRadius = RADII.full;
  fillToken(t, chip, "glass/fill");
  strokeToken(t, chip, "glass/border", 1);
  chip.appendChild(await makeText(t, "caption", text, "text/secondary"));
  return chip;
}

function drawDevice(t: ThemeContext): FrameNode {
  const d = figma.createFrame();
  d.name = "device";
  d.resize(150, 300);
  d.fills = [];
  d.clipsContent = false;
  const outer = rect(150, 300, 30);
  fillToken(t, outer, "bg/surface-raised");
  strokeToken(t, outer, "border/default", 1);
  d.appendChild(outer);
  const screen = rect(134, 284, 22);
  fillToken(t, screen, "bg/inset");
  screen.x = 8;
  screen.y = 8;
  d.appendChild(screen);
  const notch = rect(46, 8, 4);
  fillToken(t, notch, "bg/canvas");
  notch.x = (150 - 46) / 2;
  notch.y = 16;
  d.appendChild(notch);
  for (let i = 0; i < 4; i++) {
    const bar = rect(90 - i * 8, 8, 4);
    fillToken(t, bar, "border/strong");
    bar.x = 20;
    bar.y = 44 + i * 20;
    d.appendChild(bar);
  }
  return d;
}

export async function projectCard(
  t: ThemeContext,
  w: number,
  h: number,
  o: ProjectCardOpts,
): Promise<FrameNode> {
  const auto = !!o.autoHeight;

  const card = autoFrame({
    direction: "VERTICAL",
    padding: 26,
    gap: auto ? 24 : 0,
    align: auto ? "MIN" : "SPACE_BETWEEN",
  });
  card.name = `ProjectCard · ${o.title}`;
  card.counterAxisSizingMode = "FIXED";
  card.primaryAxisSizingMode = auto ? "AUTO" : "FIXED";
  card.resize(w, auto ? 1 : h);
  card.cornerRadius = RADII["2xl"];
  card.clipsContent = true;
  card.fills = [
    linearGradient(
      [
        { hex: o.hex1, position: 0 },
        { hex: o.hex2, position: 1 },
      ],
      "diagonal",
    ),
  ];

  /** Bottom scrim — keeps the title readable whatever the gradient does. */
  const addScrim = (height: number): void => {
    const scrimH = Math.round(height * 0.72);
    const scrim = rect(w, scrimH);
    scrim.fills = [
      linearGradient(
        [
          { hex: "#0A0A0B00", position: 0 },
          { hex: "#0A0A0BF0", position: 1 },
        ],
        "vertical",
      ),
    ];
    card.appendChild(scrim);
    scrim.layoutPositioning = "ABSOLUTE";
    scrim.x = 0;
    scrim.y = height - scrimH;
    card.insertChild(0, scrim); // behind the copy, above the gradient
  };

  const addDevice = (): void => {
    const dev = drawDevice(t);
    card.appendChild(dev);
    dev.layoutPositioning = "ABSOLUTE";
    dev.x = w - 118;
    dev.y = 52;
    card.insertChild(0, dev); // behind the scrim
  };

  if (!auto) {
    if (o.device) addDevice();
    addScrim(h);
  }

  const top = autoFrame({ direction: "HORIZONTAL", cross: "MIN", align: "SPACE_BETWEEN" });
  top.resize(w - 52, top.height);
  top.primaryAxisSizingMode = "FIXED";
  top.counterAxisSizingMode = "AUTO";
  top.appendChild(logoChip());
  top.appendChild(actionSquare(t));
  card.appendChild(top);

  const bottom = autoFrame({ direction: "VERTICAL", gap: 12 });
  const tagsRow = autoFrame({ direction: "HORIZONTAL", gap: 8, wrap: true });
  tagsRow.counterAxisSpacing = 8;
  for (const tag of o.tags) tagsRow.appendChild(await tagChip(t, tag));
  bottom.appendChild(tagsRow);
  bottom.appendChild(
    await makeText(t, "heading/h2", o.title, "text/primary", { maxWidth: Math.round(w * 0.82) }),
  );
  bottom.appendChild(
    await makeText(t, "body/sm", o.desc, "text/secondary", { maxWidth: Math.round(w * 0.72) }),
  );
  card.appendChild(bottom);

  // Auto-height cards only know their size once the copy is in place.
  if (auto) {
    addScrim(card.height);
    if (o.device) addDevice();
  }

  return card;
}
