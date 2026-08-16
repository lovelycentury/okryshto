/**
 * Components page — the built library laid out as uniform full-width specimen
 * cards, grouped Atoms / Molecules / Organisms, with bilingual (EN) captions.
 */

import { RADII } from "../tokens";
import { autoFrame } from "../core/layout";
import { fillToken, makeText, rect, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { ComponentLibrary, burgerMenuOverlay, footer, navbarGlass } from "../components";
import { addAtmosphere, board, boardTitle } from "./scaffold";

const BOARD_W = 1440;
const PAD = 88;
const CONTENT = BOARD_W - PAD * 2; // 1264
const INNER = CONTENT - 64; // card inner width (padding 32)

type Bi = [string, string];

async function bi(
  t: ThemeContext,
  style: string,
  [en]: Bi,
  colorEn: string,
  maxWidth?: number,
): Promise<FrameNode> {
  const wrap = autoFrame({ direction: "VERTICAL", gap: 3 });
  wrap.appendChild(await makeText(t, style, en, colorEn, { maxWidth }));
  return wrap;
}

function hairline(t: ThemeContext, w: number): RectangleNode {
  const line = rect(w, 1);
  fillToken(t, line, "border/subtle");
  line.layoutAlign = "STRETCH";
  return line;
}

/** Section divider (kicker + bilingual note). */
async function sectionHead(t: ThemeContext, kicker: string, note: Bi): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 14 });
  col.layoutAlign = "STRETCH";
  col.appendChild(hairline(t, CONTENT));
  col.appendChild(await makeText(t, "overline", kicker, "accent/primary"));
  col.appendChild(await bi(t, "body/md", note, "text/secondary", CONTENT));
  return col;
}

/** One full-width specimen card: header + one or more component nodes. */
async function specimen(
  t: ThemeContext,
  title: string,
  caption: Bi,
  nodes: SceneNode[],
): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 20, padding: 32 });
  card.layoutAlign = "STRETCH";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);

  const head = autoFrame({ direction: "VERTICAL", gap: 6 });
  head.layoutAlign = "STRETCH";
  head.appendChild(await makeText(t, "heading/h4", title, "text/primary"));
  head.appendChild(await bi(t, "body/sm", caption, "text/secondary", INNER));
  card.appendChild(head);
  card.appendChild(hairline(t, INNER));

  // Stage holding the component(s) — inset surface for contrast.
  const stage = autoFrame({
    direction: "HORIZONTAL",
    gap: 28,
    padding: 24,
    cross: "MIN",
    wrap: true,
  });
  stage.layoutAlign = "STRETCH";
  stage.counterAxisSpacing = 28;
  stage.cornerRadius = RADII.lg;
  fillToken(t, stage, "bg/inset");
  strokeToken(t, stage, "border/subtle", 1);
  for (const n of nodes) stage.appendChild(n);
  card.appendChild(stage);
  return card;
}

export async function paintComponents(
  t: ThemeContext,
  page: PageNode,
  lib: ComponentLibrary,
): Promise<void> {
  const b = board(t, "Components", BOARD_W, { gap: 32, pad: PAD });
  addAtmosphere(b, [
    { x: 1150, y: -80, size: 620, hex: "#818CF8" },
    { x: -200, y: 1600, size: 620, hex: "#5EE6C1" },
  ]);

  b.appendChild(
    await boardTitle(
      t,
      "02 · Components",
      "Component library",
      "Auto-layout components with real Figma variants. Atoms & molecules are variant sets; organisms are composed from them.",
    ),
  );

  // ── Atoms ───────────────────────────────────────────────────
  b.appendChild(
    await sectionHead(t, "Atoms", [
      "The smallest building blocks — real Figma variant sets.",
      "— variant- Figma.",
    ]),
  );
  b.appendChild(
    await specimen(
      t,
      "Button",
      ["Variant (Primary · Secondary · Ghost · Glass) × Size (sm · md · lg)", ""],
      [lib.button],
    ),
  );
  b.appendChild(
    await specimen(t, "Badge", ["Variant (Neutral · Accent · Outline) × Size", ""], [lib.badge]),
  );
  b.appendChild(await specimen(t, "Input", ["State (Default · Focus · Filled)", ""], [lib.input]));
  b.appendChild(await specimen(t, "Avatar", ["Size × Shape — aurora gradient", ""], [lib.avatar]));
  b.appendChild(
    await specimen(t, "IconButton", ["Variant (Ghost · Glass · Solid)", ""], [lib.iconButton]),
  );

  // ── Molecules ───────────────────────────────────────────────
  b.appendChild(await sectionHead(t, "Molecules", ["Atoms composed into reusable pieces.", ""]));
  b.appendChild(await specimen(t, "Card", ["Variant (Glass · Solid · Outline)", ""], [lib.card]));
  b.appendChild(
    await specimen(
      t,
      "LinkCard",
      ["Variant (Default · Featured) — the vizitka's signature row", ""],
      [lib.linkCard],
    ),
  );

  // ── Organisms ───────────────────────────────────────────────
  b.appendChild(
    await sectionHead(t, "Organisms", ["Composed layout regions built from the library.", ""]),
  );
  b.appendChild(
    await specimen(
      t,
      "Header — Glass (desktop)",
      ["Sticky frosted navigation", ""],
      [await navbarGlass(t, INNER - 48, false)],
    ),
  );
  b.appendChild(
    await specimen(
      t,
      "Mobile navigation",
      ["Collapsed header + full-screen frosted menu", ""],
      [await navbarGlass(t, 360, true), await burgerMenuOverlay(t, 390, 720)],
    ),
  );
  b.appendChild(
    await specimen(t, "Footer", ["Minimal editorial footer", ""], [await footer(t, INNER - 48)]),
  );

  page.appendChild(b);
  b.x = 0;
  b.y = 0;
}
