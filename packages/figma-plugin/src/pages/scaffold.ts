/**
 * Page scaffolding — boards (canvas-colored containers), atmospheric aurora
 * backgrounds, and vertical board placement on a page.
 */

import { linearGradient, solid } from "../core/color";
import { autoFrame } from "../core/layout";
import { auroraBlob, ellipse, fillToken, makeText, rect } from "../core/nodes";
import { ThemeContext } from "../core/theme";

/** A canvas-colored board that hugs its height and fixes its width. */
export function board(
  t: ThemeContext,
  name: string,
  width: number,
  opts: { pad?: number; gap?: number } = {},
): FrameNode {
  const b = autoFrame({ name, direction: "VERTICAL", gap: opts.gap ?? 64 });
  b.counterAxisSizingMode = "FIXED";
  b.resize(width, b.height);
  b.paddingTop = b.paddingBottom = opts.pad ?? 80;
  b.paddingLeft = b.paddingRight = opts.pad ?? 80;
  b.clipsContent = true;
  fillToken(t, b, "bg/canvas");
  return b;
}

/** Board title block (kicker + big title + optional description). */
export async function boardTitle(
  t: ThemeContext,
  kicker: string,
  title: string,
  description?: string,
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 12 });
  col.layoutAlign = "STRETCH";
  col.appendChild(await makeText(t, "overline", kicker, "accent/primary"));
  col.appendChild(await makeText(t, "display/lg", title, "text/primary"));
  if (description) {
    col.appendChild(await makeText(t, "body/lg", description, "text/secondary", { maxWidth: 680 }));
  }
  return col;
}

/**
 * Add absolutely-positioned aurora glows behind a board's content for atmosphere.
 * Blobs are inserted at the back and clipped by the board.
 */
export function addAtmosphere(
  board: FrameNode,
  spots: Array<{ x: number; y: number; size: number; hex: string }>,
): void {
  for (const spot of spots) {
    const blob = auroraBlob(spot.size, spot.hex);
    board.appendChild(blob);
    blob.layoutPositioning = "ABSOLUTE";
    blob.x = spot.x;
    blob.y = spot.y;
    board.insertChild(0, blob);
  }
}

/** Falling-star streak: a thin gradient tail with a glowing head, rotated. */
export function starStreak(hex: string, len: number, angle: number): FrameNode {
  const f = figma.createFrame();
  f.name = "star-streak";
  f.resize(len, 6);
  f.fills = [];
  f.clipsContent = false;
  f.opacity = 0.7;
  const tail = rect(len, 1, 0.5);
  tail.fills = [
    linearGradient(
      [
        { hex: `${hex}00`, position: 0 },
        { hex: `${hex}CC`, position: 1 },
      ],
      "horizontal",
    ),
  ];
  tail.x = 0;
  tail.y = 2.5;
  f.appendChild(tail);
  const head = ellipse(3.5);
  head.fills = [solid(hex)];
  const c = solid(hex).color;
  head.effects = [
    {
      type: "DROP_SHADOW",
      color: { ...c, a: 0.7 },
      offset: { x: 0, y: 0 },
      radius: 6,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    } as DropShadowEffect,
  ];
  head.x = len - 2;
  head.y = 1.25;
  f.appendChild(head);
  f.rotation = angle;
  return f;
}

/**
 * Cosmic atmosphere — auroras, white/green dust, orange sparkles, falling stars.
 * The signature dark-nebula backdrop used across the design-system boards.
 * Call after a board's content is in place so its height is already known.
 */
export function cosmicAtmosphere(b: FrameNode): void {
  const w = b.width;
  const h = b.height;
  const behind = (n: SceneNode, x: number, y: number) => {
    b.appendChild(n);
    (n as LayoutMixin).layoutPositioning = "ABSOLUTE";
    n.x = x;
    n.y = y;
    b.insertChild(0, n);
  };
  const rnd = () => Math.random();
  const soft = (n: EllipseNode, op: number): EllipseNode => {
    n.opacity = op;
    return n;
  };

  // Wide, airy green washes — big, very soft, spread out (walk through, don't drown).
  behind(
    soft(auroraBlob(1200, "#5EE6C1"), 0.2),
    -360 + rnd() * w * 0.3,
    h * 0.25 + rnd() * h * 0.4,
  );
  behind(
    soft(auroraBlob(1050, "#2FA98C"), 0.14),
    w * 0.35 + rnd() * w * 0.3,
    h * 0.35 + rnd() * h * 0.4,
  );
  behind(
    soft(auroraBlob(900, "#5EE6C1"), 0.12),
    w - 520 - rnd() * w * 0.2,
    h * 0.55 + rnd() * h * 0.35,
  );
  // White glow — let it play too.
  behind(
    soft(auroraBlob(820, "#FFFFFF"), 0.09),
    w * 0.3 + rnd() * w * 0.35,
    h * 0.4 + rnd() * h * 0.3,
  );
  behind(
    soft(auroraBlob(560, "#FFFFFF"), 0.07),
    w * 0.1 + rnd() * w * 0.4,
    h * 0.1 + rnd() * h * 0.2,
  );
  // Pink "blood of Dante" — magenta star-wash up top, soft.
  behind(soft(auroraBlob(980, "#FF3D8B"), 0.22), w * 0.28 + rnd() * w * 0.3, -260 - rnd() * 100);
  behind(soft(auroraBlob(640, "#B84BFF"), 0.14), w * 0.62 + rnd() * w * 0.2, -160 - rnd() * 80);
  // White shining through the blood of Dante — bright core inside the pink.
  behind(soft(auroraBlob(520, "#FFFFFF"), 0.16), w * 0.34 + rnd() * w * 0.28, -180 - rnd() * 70);
  behind(soft(auroraBlob(320, "#FFFFFF"), 0.14), w * 0.46 + rnd() * w * 0.16, -90 - rnd() * 40);
  // Indigo accent near the top corner.
  behind(soft(auroraBlob(700, "#818CF8"), 0.14), w - 440, -140 - rnd() * 60);

  // white & green cosmic dust
  const dust = Math.min(70, Math.round(h / 22));
  for (let i = 0; i < dust; i++) {
    const s = 1 + rnd() * 2.4;
    const dot = ellipse(s);
    dot.fills = [solid(rnd() < 0.45 ? "#5EE6C1" : "#FFFFFF")];
    dot.opacity = 0.08 + rnd() * 0.5;
    behind(dot, rnd() * w, rnd() * h);
  }

  // orange sparkles (Miss-Minutes-y) — small & delicate
  for (let i = 0; i < 8; i++) {
    const s = 2 + rnd() * 2.5;
    const sp = ellipse(s);
    sp.fills = [solid("#FFA733")];
    sp.opacity = 0.45 + rnd() * 0.3;
    sp.effects = [
      {
        type: "DROP_SHADOW",
        color: { r: 1, g: 0.65, b: 0.2, a: 0.6 },
        offset: { x: 0, y: 0 },
        radius: 5,
        spread: 0,
        visible: true,
        blendMode: "NORMAL",
      } as DropShadowEffect,
    ];
    behind(sp, rnd() * w, rnd() * h);
  }

  // falling-star streaks
  const streakColors = ["#5EE6C1", "#FFFFFF", "#FF3D8B", "#818CF8"];
  for (let i = 0; i < 3; i++) {
    const len = 70 + rnd() * 90;
    behind(
      starStreak(streakColors[i % streakColors.length], len, -32 - rnd() * 22),
      rnd() * w * 0.85,
      rnd() * h * 0.7,
    );
  }
}

/** Place boards in a vertical stack starting at (originX, originY). */
export function stackBoards(pageNodes: FrameNode[], gap = 120, originX = 0, originY = 0): void {
  let y = originY;
  for (const b of pageNodes) {
    b.x = originX;
    b.y = y;
    y += b.height + gap;
  }
}

/** Place boards in a horizontal row. */
export function rowBoards(pageNodes: FrameNode[], gap = 120, originX = 0, originY = 0): void {
  let x = originX;
  for (const b of pageNodes) {
    b.x = x;
    b.y = originY;
    x += b.width + gap;
  }
}
