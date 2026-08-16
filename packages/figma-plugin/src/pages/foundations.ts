/**
 * Foundations — three side-by-side boards (English descriptions):
 *   1) Color / Palette  — swatches grouped by family, on a neutral background
 *   2) System           — typography, spacing, radii, elevation, glass
 *   3) Guidelines       — detailed usage: color, type + fonts, radii, elevation,
 *                         glass & blur, and Rive motion (glowing / pulsing bg)
 */

import {
  COLOR_TOKENS,
  ColorToken,
  GLASS_TOKENS,
  GLOW_TOKENS,
  RADII,
  SHADOW_TOKENS,
  SPACING,
  TYPE_TOKENS,
} from "../tokens";
import { linearGradient, solid } from "../core/color";
import { aiMark } from "../core/icons";
import { autoFrame } from "../core/layout";
import { auroraBlob, fillToken, makeText, rect, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { applyEffect, glassSurface } from "../components/primitives";
import { addAtmosphere, board, boardTitle, rowBoards } from "./scaffold";

/** [English, Russian] descriptive pair. */
type Bi = [string, string];

// Per-board geometry (padding-first — generous breathing room).
const PALETTE = { w: 1368, pad: 96, content: 1368 - 192, swatch: 220 };
const SYS = { w: 1440, pad: 88, content: 1440 - 176 };
const GUIDE = { w: 1240, pad: 96, content: 1240 - 192 };

const TERM_W = 200;

// ── Shared blocks ─────────────────────────────────────────────

/** English line + muted Russian line, stacked. */
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

async function subhead(t: ThemeContext, title: string, note: Bi, maxW: number): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 8 });
  col.layoutAlign = "STRETCH";
  col.appendChild(await makeText(t, "heading/h2", title, "text/primary"));
  col.appendChild(await bi(t, "body/md", note, "text/secondary", maxW));
  return col;
}

function grid(gap = 16, w?: number): FrameNode {
  const g = autoFrame({ direction: "HORIZONTAL", gap, wrap: true });
  g.layoutAlign = "STRETCH";
  g.counterAxisSpacing = gap;
  if (w) {
    // WRAP only engages with a fixed primary axis — hug never wraps.
    g.primaryAxisSizingMode = "FIXED";
    g.counterAxisSizingMode = "AUTO";
    g.resize(w, g.height);
  }
  return g;
}

function hairline(t: ThemeContext, w: number): RectangleNode {
  const line = rect(w, 1);
  fillToken(t, line, "border/subtle");
  line.layoutAlign = "STRETCH";
  return line;
}

// ── 1) Color palette ──────────────────────────────────────────

interface ColorGroup {
  prefix: string;
  title: string;
  note: Bi;
}

const COLOR_GROUPS: ColorGroup[] = [
  {
    prefix: "bg/",
    title: "Backgrounds",
    note: [
      "Layering, deepest canvas → raised surfaces. Put dense content on a surface, not straight on canvas.",
      ": canvas . — surface, canvas.",
    ],
  },
  {
    prefix: "text/",
    title: "Text",
    note: [
      "Contrast tiers. Primary for headings & key copy, secondary for body, muted for metadata, inverse on accent.",
      ". Primary — , secondary — , muted — , inverse — .",
    ],
  },
  {
    prefix: "accent/",
    title: "Accent — aurora",
    note: [
      "The signature. Use sparingly: one primary action per view. accent/soft is for glows & washes, never text.",
      ". : . accent/soft — , .",
    ],
  },
  {
    prefix: "border/",
    title: "Borders",
    note: [
      "Translucent by design. Subtle for dividers, default for components, strong for emphasis & focus.",
      ". Subtle — , default — , strong — .",
    ],
  },
  {
    prefix: "glass/",
    title: "Glass",
    note: [
      "Translucent fills & hairline borders for frosted materials. Always pair fill + border + background blur.",
      "",
    ],
  },
  {
    prefix: "feedback/",
    title: "Feedback",
    note: ["Reserve strictly for status: success, warning, danger. Never decorative.", ""],
  },
  {
    prefix: "state/",
    title: "State",
    note: ["Interaction states — focus ring color, driven by the accent.", ""],
  },
];

async function swatchCard(t: ThemeContext, token: ColorToken): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 0 });
  card.resize(PALETTE.swatch, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.md;
  card.clipsContent = true;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/default", 1);

  const chip = rect(PALETTE.swatch, 84);
  fillToken(t, chip, token.name);
  chip.layoutAlign = "STRETCH";

  const info = autoFrame({ direction: "VERTICAL", gap: 3, padding: [16, 16] });
  info.layoutAlign = "STRETCH";
  info.appendChild(await makeText(t, "label/sm", token.name, "text/primary"));
  info.appendChild(await makeText(t, "mono/sm", token.dark.toUpperCase(), "text/muted"));
  if (token.description) {
    info.appendChild(
      await makeText(t, "caption", token.description, "text/secondary", {
        maxWidth: PALETTE.swatch - 32,
      }),
    );
  }

  card.appendChild(chip);
  card.appendChild(info);
  return card;
}

async function colorGroupBlock(t: ThemeContext, group: ColorGroup): Promise<FrameNode> {
  const tokens = COLOR_TOKENS.filter((tk) => tk.name.startsWith(group.prefix));
  const block = autoFrame({ direction: "VERTICAL", gap: 20 });
  block.layoutAlign = "STRETCH";
  block.appendChild(await subhead(t, group.title, group.note, PALETTE.content));
  const g = grid(16, PALETTE.content);
  for (const token of tokens) g.appendChild(await swatchCard(t, token));
  block.appendChild(g);
  return block;
}

async function paintPaletteBoard(t: ThemeContext, page: PageNode): Promise<FrameNode> {
  const b = board(t, "Foundations · Color", PALETTE.w, { gap: 56, pad: PALETTE.pad });

  b.appendChild(
    await boardTitle(
      t,
      "00 · Foundations — Palette",
      "Color",
      "Every color is a Figma variable (Dark default, Light where the plan allows). Grouped by role — read the note under each family before reaching for a value.",
    ),
  );

  const strip = rect(PALETTE.content, 10, RADII.full);
  strip.fills = [
    linearGradient(
      [
        { hex: "#5EE6C1", position: 0 },
        { hex: "#818CF8", position: 1 },
      ],
      "horizontal",
    ),
  ];
  strip.layoutAlign = "STRETCH";
  b.appendChild(strip);

  for (const group of COLOR_GROUPS) {
    b.appendChild(await colorGroupBlock(t, group));
    b.appendChild(hairline(t, PALETTE.content));
  }

  page.appendChild(b);
  return b;
}

// ── 2) System (type / spacing / radii / elevation / glass) ─────

async function typeRow(t: ThemeContext, token: (typeof TYPE_TOKENS)[number]): Promise<FrameNode> {
  const row = autoFrame({ direction: "VERTICAL", gap: 6 });
  row.layoutAlign = "STRETCH";
  row.paddingBottom = 20;
  row.appendChild(
    await makeText(t, token.name, "The quiet details make the whole", "text/primary", {
      maxWidth: SYS.content,
    }),
  );
  row.appendChild(
    await makeText(
      t,
      "mono/sm",
      `${token.name}  ·  ${token.size}/${token.lineHeight}  ·  ${token.weight}`,
      "text/muted",
    ),
  );
  row.appendChild(hairline(t, SYS.content));
  return row;
}

async function spacingBar(t: ThemeContext, name: string, value: number): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 16, cross: "CENTER" });
  const labelWrap = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  labelWrap.resize(120, labelWrap.height);
  labelWrap.counterAxisSizingMode = "FIXED";
  labelWrap.appendChild(await makeText(t, "mono/sm", `space/${name}`, "text/secondary"));
  const bar = rect(Math.max(value, 2), 16, 3);
  fillToken(t, bar, "accent/primary");
  row.appendChild(labelWrap);
  row.appendChild(bar);
  row.appendChild(await makeText(t, "mono/sm", `${value}`, "text/muted"));
  return row;
}

async function radiusChip(t: ThemeContext, name: string, value: number): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 8, cross: "CENTER" });
  const box = rect(96, 96, value);
  fillToken(t, box, "bg/surface-raised");
  strokeToken(t, box, "border/default", 1);
  col.appendChild(box);
  col.appendChild(await makeText(t, "mono/sm", `${name} · ${value}`, "text/muted"));
  return col;
}

async function elevationCard(t: ThemeContext, name: string): Promise<FrameNode> {
  const box = autoFrame({ align: "CENTER", cross: "CENTER" });
  box.resize(180, 120);
  box.primaryAxisSizingMode = "FIXED";
  box.counterAxisSizingMode = "FIXED";
  box.cornerRadius = RADII.lg;
  fillToken(t, box, "bg/surface");
  await applyEffect(box, name, t);
  box.appendChild(await makeText(t, "label/sm", name, "text/secondary"));
  return box;
}

async function glassCard(t: ThemeContext, spec: (typeof GLASS_TOKENS)[number]): Promise<FrameNode> {
  const surface = await glassSurface(
    t,
    spec.name as "glass/header" | "glass/menu" | "glass/card",
    RADII.lg,
    true,
  );
  surface.layoutMode = "HORIZONTAL";
  surface.primaryAxisAlignItems = "CENTER";
  surface.counterAxisAlignItems = "CENTER";
  surface.resize(200, 120);
  surface.primaryAxisSizingMode = "FIXED";
  surface.counterAxisSizingMode = "FIXED";
  surface.appendChild(await makeText(t, "label/md", `${spec.name} · ${spec.blur}`, "text/primary"));
  return surface;
}

async function glowCard(t: ThemeContext, name: string): Promise<FrameNode> {
  const box = autoFrame({ align: "CENTER", cross: "CENTER" });
  box.resize(180, 120);
  box.primaryAxisSizingMode = "FIXED";
  box.counterAxisSizingMode = "FIXED";
  box.cornerRadius = RADII.lg;
  fillToken(t, box, "bg/surface-raised");
  strokeToken(t, box, "border/subtle", 1);
  await applyEffect(box, name, t);
  box.appendChild(await makeText(t, "label/sm", name, "text/secondary"));
  return box;
}

/** Featured AI mark + its sizes and variants. */
async function aiMarkCard(t: ThemeContext, w: number): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 24, padding: 28 });
  card.name = "ai-mark";
  card.resize(w, card.height);
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);

  const head = autoFrame({ direction: "HORIZONTAL", gap: 24, cross: "CENTER" });
  head.appendChild(aiMark(t, 104));
  const txt = autoFrame({ direction: "VERTICAL", gap: 8 });
  txt.appendChild(await makeText(t, "heading/h3", "AI mark", "text/primary"));
  txt.appendChild(
    await bi(
      t,
      "body/md",
      [
        "Key + spark in a squircle on indigo — the functional icon for anything model-driven: AI entry points, assistant avatars, generated-content badges.",
        "— , AI: , , .",
      ],
      "text/secondary",
      460,
    ),
  );
  txt.appendChild(
    await makeText(
      t,
      "mono/sm",
      "aiMark() · accent/secondary · r = 0.3d · glyph 0.5d",
      "text/muted",
    ),
  );
  head.appendChild(txt);
  card.appendChild(head);

  card.appendChild(hairline(t, w - 56));

  const sizes = autoFrame({ direction: "VERTICAL", gap: 12 });
  sizes.appendChild(await makeText(t, "overline", "SIZES", "text/muted"));
  const sizeRow = autoFrame({ direction: "HORIZONTAL", gap: 20, cross: "CENTER" });
  for (const d of [20, 24, 32, 40, 56]) {
    const col = autoFrame({ direction: "VERTICAL", gap: 8, cross: "CENTER" });
    col.appendChild(aiMark(t, d));
    col.appendChild(await makeText(t, "mono/sm", `${d}`, "text/muted"));
    sizeRow.appendChild(col);
  }
  sizes.appendChild(sizeRow);
  card.appendChild(sizes);

  const variants = autoFrame({ direction: "VERTICAL", gap: 12 });
  variants.appendChild(await makeText(t, "overline", "VARIANTS", "text/muted"));
  const varRow = autoFrame({ direction: "HORIZONTAL", gap: 24, cross: "CENTER" });
  const specs: Array<[FrameNode, Bi]> = [
    [aiMark(t, 56), ["Solid · default", ""]],
    [aiMark(t, 56, { soft: true }), ["Soft · inline with text", ""]],
    [aiMark(t, 56, { gradient: true }), ["Gradient · hero / app icon", ""]],
    [aiMark(t, 56, { tone: "accent/dante" }), ["Dante · alt accent", ""]],
  ];
  for (const [node, label] of specs) {
    const col = autoFrame({ direction: "VERTICAL", gap: 8, cross: "CENTER" });
    col.appendChild(node);
    col.appendChild(await bi(t, "caption", label, "text/secondary", 150));
    varRow.appendChild(col);
  }
  variants.appendChild(varRow);
  card.appendChild(variants);
  return card;
}

async function atmosphereSample(t: ThemeContext, w: number): Promise<FrameNode> {
  const h = 220;
  const f = figma.createFrame();
  f.name = "atmosphere";
  f.resize(w, h);
  f.cornerRadius = RADII.xl;
  f.clipsContent = true;
  f.fills = [solid("#0A0A0B")];
  strokeToken(t, f, "border/subtle", 1);
  const blobs: Array<[string, number, number, number, number]> = [
    ["#5EE6C1", 540, 0.72, 0.3, 0.22],
    ["#FF3D8B", 480, 0.9, 0.8, 0.16],
    ["#818CF8", 440, 0.5, 1.0, 0.15],
    ["#FFFFFF", 260, 0.6, 0.2, 0.06],
  ];
  for (const [hex, size, fx, fy, op] of blobs) {
    const bl = auroraBlob(size, hex);
    bl.opacity = op;
    f.appendChild(bl);
    bl.x = fx * w - size / 2;
    bl.y = fy * h - size / 2;
  }
  for (let i = 0; i < 34; i++) {
    const d = rect(1.5 + Math.random() * 2, 1.5 + Math.random() * 2, 1);
    d.fills = [
      {
        ...solid(Math.random() > 0.5 ? "#FFFFFF" : "#5EE6C1"),
        opacity: 0.08 + Math.random() * 0.4,
      } as SolidPaint,
    ];
    f.appendChild(d);
    d.x = Math.random() * w;
    d.y = Math.random() * h;
  }
  const lab = await makeText(
    t,
    "label/md",
    "Cosmic aurora — the signature backdrop",
    "text/secondary",
  );
  f.appendChild(lab);
  lab.x = 28;
  lab.y = 26;
  return f;
}

async function paintSystemBoard(t: ThemeContext, page: PageNode): Promise<FrameNode> {
  const b = board(t, "Foundations · System", SYS.w, { gap: 64, pad: SYS.pad });
  addAtmosphere(b, [{ x: 1150, y: -120, size: 560, hex: "#818CF8" }]);

  b.appendChild(
    await boardTitle(
      t,
      "00 · Foundations — System",
      "Type, space, elevation",
      "The structural tokens. Type as text styles; spacing & radii as constants (and variables); elevation & glass as effect styles.",
    ),
  );

  const type = autoFrame({ direction: "VERTICAL", gap: 20 });
  type.layoutAlign = "STRETCH";
  type.appendChild(
    await subhead(
      t,
      "Typography",
      ["Editorial modular scale — display for identity, text for reading.", "— display , text ."],
      SYS.content,
    ),
  );
  for (const token of TYPE_TOKENS) type.appendChild(await typeRow(t, token));
  b.appendChild(type);

  const spacing = autoFrame({ direction: "VERTICAL", gap: 12 });
  spacing.layoutAlign = "STRETCH";
  spacing.appendChild(
    await subhead(
      t,
      "Spacing",
      ["4px base grid — use these steps, avoid arbitrary values.", "4px — , ."],
      SYS.content,
    ),
  );
  for (const [name, value] of Object.entries(SPACING)) {
    if (value === 0 || value === 1) continue;
    spacing.appendChild(await spacingBar(t, name, value));
  }
  b.appendChild(spacing);

  const radii = autoFrame({ direction: "VERTICAL", gap: 20 });
  radii.layoutAlign = "STRETCH";
  radii.appendChild(await subhead(t, "Radii", ["Soft, consistent corners.", ""], SYS.content));
  const radiiGrid = grid(20);
  for (const [name, value] of Object.entries(RADII)) {
    if (name === "full") continue;
    radiiGrid.appendChild(await radiusChip(t, name, value));
  }
  radii.appendChild(radiiGrid);
  b.appendChild(radii);

  const elevation = autoFrame({ direction: "VERTICAL", gap: 20 });
  elevation.layoutAlign = "STRETCH";
  elevation.appendChild(
    await subhead(
      t,
      "Elevation",
      ["Shadows tuned for a dark canvas — prefer subtle.", ""],
      SYS.content,
    ),
  );
  const elevationGrid = grid(20);
  for (const s of SHADOW_TOKENS) elevationGrid.appendChild(await elevationCard(t, s.name));
  elevation.appendChild(elevationGrid);
  b.appendChild(elevation);

  const glass = autoFrame({ direction: "VERTICAL", gap: 20 });
  glass.layoutAlign = "STRETCH";
  glass.appendChild(
    await subhead(
      t,
      "Glass & blur",
      ["Apple-like frosted materials for headers, menus and cards.", "Apple , ."],
      SYS.content,
    ),
  );
  const glassBg = autoFrame({ direction: "HORIZONTAL", gap: 20, padding: 24, wrap: true });
  glassBg.layoutAlign = "STRETCH";
  glassBg.cornerRadius = RADII.xl;
  glassBg.fills = [
    linearGradient(
      [
        { hex: "#5EE6C1", position: 0 },
        { hex: "#818CF8", position: 1 },
      ],
      "diagonal",
    ),
  ];
  for (const spec of GLASS_TOKENS) glassBg.appendChild(await glassCard(t, spec));
  glass.appendChild(glassBg);
  b.appendChild(glass);

  const glow = autoFrame({ direction: "VERTICAL", gap: 20 });
  glow.layoutAlign = "STRETCH";
  glow.appendChild(
    await subhead(
      t,
      "Glow — aurora",
      [
        "Ambient accent light: focus rings, hover, filled-button & gradient auras, EQ node drag.",
        "-: , hover, /, EQ.",
      ],
      SYS.content,
    ),
  );
  const glowGrid = grid(20);
  for (const g of GLOW_TOKENS) glowGrid.appendChild(await glowCard(t, g.name));
  glow.appendChild(glowGrid);
  b.appendChild(glow);

  const atmo = autoFrame({ direction: "VERTICAL", gap: 20 });
  atmo.layoutAlign = "STRETCH";
  atmo.appendChild(
    await subhead(
      t,
      "Atmosphere",
      ["The cosmic aurora backdrop behind boards, social covers and the call screen.", ""],
      SYS.content,
    ),
  );
  atmo.appendChild(await atmosphereSample(t, SYS.content));
  b.appendChild(atmo);

  const ai = autoFrame({ direction: "VERTICAL", gap: 20 });
  ai.layoutAlign = "STRETCH";
  ai.appendChild(
    await subhead(
      t,
      "AI mark",
      ["The icon for AI-driven surfaces — squircle tile, indigo, key + spark.", "AI- — , , ."],
      SYS.content,
    ),
  );
  ai.appendChild(await aiMarkCard(t, SYS.content));
  b.appendChild(ai);

  page.appendChild(b);
  return b;
}

// ── 3) Guidelines ─────────────────────────────────────────────

/** term (fixed width) + bilingual description (fills the rest). */
async function usageRow(
  t: ThemeContext,
  term: string,
  desc: Bi,
  descMax: number,
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 20, cross: "MIN" });
  const termWrap = autoFrame({ direction: "HORIZONTAL" });
  termWrap.resize(TERM_W, termWrap.height);
  termWrap.counterAxisSizingMode = "FIXED";
  termWrap.appendChild(await makeText(t, "mono/sm", term, "accent/primary"));
  row.appendChild(termWrap);
  row.appendChild(await bi(t, "body/sm", desc, "text/secondary", descMax));
  return row;
}

interface UsageSection {
  title: string;
  note: Bi;
  rows: Array<[string, Bi]>;
}

async function usageCard(t: ThemeContext, s: UsageSection, w: number): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 18, padding: 32 });
  card.resize(w, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);

  const head = autoFrame({ direction: "VERTICAL", gap: 8 });
  head.layoutAlign = "STRETCH";
  head.appendChild(await makeText(t, "heading/h3", s.title, "text/primary"));
  head.appendChild(await bi(t, "body/sm", s.note, "text/muted", w - 64));
  card.appendChild(head);
  card.appendChild(hairline(t, w - 64));

  const descMax = w - 64 - TERM_W - 20;
  for (const [term, desc] of s.rows) card.appendChild(await usageRow(t, term, desc, descMax));
  return card;
}

// Do / Don't card (fixed-width columns — deterministic, no overflow)
interface DoDont {
  title: string;
  note: Bi;
  dos: Bi[];
  donts: Bi[];
}

async function bulletList(
  t: ThemeContext,
  label: string,
  items: Bi[],
  colorToken: string,
  colW: number,
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 10 });
  col.resize(colW, col.height);
  col.counterAxisSizingMode = "FIXED";
  col.appendChild(await makeText(t, "overline", label, colorToken));
  const textMax = colW - 13 - 8;
  for (const item of items) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "MIN" });
    row.resize(colW, row.height);
    row.counterAxisSizingMode = "FIXED";
    row.appendChild(await makeText(t, "body/sm", label === "Do" ? "✓" : "✕", colorToken));
    row.appendChild(await bi(t, "body/sm", item, "text/secondary", textMax));
    col.appendChild(row);
  }
  return col;
}

async function doDontCard(t: ThemeContext, g: DoDont, w: number): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 20, padding: 32 });
  card.resize(w, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);

  const head = autoFrame({ direction: "VERTICAL", gap: 8 });
  head.layoutAlign = "STRETCH";
  head.appendChild(await makeText(t, "heading/h3", g.title, "text/primary"));
  head.appendChild(await bi(t, "body/sm", g.note, "text/muted", w - 64));
  card.appendChild(head);
  card.appendChild(hairline(t, w - 64));

  const cols = autoFrame({ direction: "HORIZONTAL", gap: 28 });
  const colW = (w - 64 - 28) / 2;
  cols.appendChild(await bulletList(t, "Do", g.dos, "accent/primary", colW));
  cols.appendChild(await bulletList(t, "Don't", g.donts, "feedback/danger", colW));
  card.appendChild(cols);
  return card;
}

// Font card
interface FontSpec {
  name: string;
  role: Bi;
  weights: string;
  download: string;
}

const FONTS: FontSpec[] = [
  {
    name: "Inter Tight",
    role: ["Display & headings", ""],
    weights: "Medium · Semi Bold",
    download: "fonts.google.com/specimen/Inter+Tight",
  },
  {
    name: "Inter",
    role: ["Body, labels & UI", ", UI"],
    weights: "Regular · Medium · Semi Bold",
    download: "fonts.google.com/specimen/Inter",
  },
  {
    name: "JetBrains Mono",
    role: ["Metadata & code", ""],
    weights: "Regular",
    download: "fonts.google.com/specimen/JetBrains+Mono",
  },
];

async function fontCard(t: ThemeContext, f: FontSpec, w: number): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 8, padding: 24 });
  card.resize(w, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.lg;
  fillToken(t, card, "bg/inset");
  strokeToken(t, card, "border/subtle", 1);
  card.appendChild(await makeText(t, "heading/h3", f.name, "text/primary"));
  card.appendChild(
    await makeText(t, "label/sm", `${f.role[0]} · ${f.role[1]}`, "accent/primary", {
      maxWidth: w - 48,
    }),
  );
  card.appendChild(await makeText(t, "caption", `Weights: ${f.weights}`, "text/secondary"));
  card.appendChild(await makeText(t, "mono/sm", f.download, "text/muted", { maxWidth: w - 48 }));
  return card;
}

const TYPE_USAGE: UsageSection = {
  title: "Typography — when to use each style",
  note: [
    "Hierarchy comes from scale, not weight. Pick the smallest style that still reads as its level.",
    "",
  ],
  rows: [
    ["display/2xl", ["Hero identity — your name. Once per site, largest moment on the page.", ""]],
    ["display/xl", ["Screen titles & the contact headline. One per screen.", ""]],
    ["display/lg", ["Big section openers; the hero headline on mobile.", ""]],
    ["heading/h1", ["Section titles (Links, Credibility, About).", "(Links, Credibility, About)."]],
    ["heading/h2", ["Sub-sections and large pull-quotes.", ""]],
    ["heading/h3", ["Card titles, link-row titles, guideline headers.", ""]],
    ["heading/h4", ["Small card titles, nav brand name, list headers.", ""]],
    ["body/lg", ["Lead paragraph directly under a headline.", ""]],
    ["body/md", ["Default reading text — the 16px baseline.", "— 16px."]],
    ["body/sm", ["Supporting copy, secondary lines, dense lists.", ""]],
    ["label/md", ["Buttons, nav links, form field labels.", ""]],
    ["label/sm", ["Small buttons, tags/badges, dense labels.", ""]],
    ["caption", ["Metadata, helper text, timestamps.", ""]],
    ["overline", ["Eyebrows/kickers above titles (UPPERCASE, tracked).", ""]],
    ["mono/sm", ["Technical meta, code, values, handles.", ""]],
  ],
};

const RADII_USAGE: UsageSection = {
  title: "Radii — when to use each",
  note: ["Match radius to element size: the bigger the surface, the softer the corner.", ""],
  rows: [
    ["radius/sm · 6", ["Tiny elements — checkboxes, small inline tags, code chips.", ""]],
    ["radius/md · 10", ["Buttons, inputs, icon buttons — the everyday control radius.", ""]],
    ["radius/lg · 14", ["Link rows, small cards, list tiles.", ""]],
    ["radius/xl · 20", ["Content cards, stat cards, guideline cards.", ""]],
    ["radius/2xl · 28", ["Large panels, quote blocks, feature surfaces.", ""]],
    ["radius/3xl · 36", ["Hero panels, the portrait slot, marketing surfaces.", ""]],
    [
      "radius/full",
      ["Pills & circles — CTAs, badges, avatars, availability chip.", "— CTA, , , ."],
    ],
  ],
};

const ELEVATION_USAGE: UsageSection = {
  title: "Elevation — when to use each",
  note: [
    "On a dark canvas, shadow reads as a soft halo. Use one level per element; never stack.",
    "",
  ],
  rows: [
    ["shadow/xs", ["Hairline lift — hover on an otherwise flat row or chip.", "— hover ."]],
    ["shadow/sm", ["Chips, badges, small floating controls.", ""]],
    ["shadow/md", ["Cards and popovers resting above the surface.", ""]],
    ["shadow/lg", ["Menus, modals, the burger overlay — top layer only.", ""]],
    ["glow/accent", ["Lift primary actions & focus — the aurora halo on CTAs.", "— - CTA."]],
    ["glow/indigo", ["Ambient section accent behind quotes / feature blocks.", ""]],
  ],
};

const COLOR_DODONT: DoDont = {
  title: "Color",
  note: ["A restrained dark palette. Let the accent do the pointing.", ""],
  dos: [
    ["One primary accent action per view", ""],
    ["text/secondary for body, muted for meta", "text/secondary , muted"],
    ["accent/soft for glows & washes", "accent/soft"],
    ["Keep AA contrast for essential text", "AA"],
  ],
  donts: [
    ["Accent for body text", ""],
    ["Muted text for essential copy", "Muted"],
    ["Hex values outside the tokens", "Hex-"],
  ],
};

const SPACING_DODONT: DoDont = {
  title: "Spacing & layout",
  note: ["Rhythm comes from the 4px scale.", "4px."],
  dos: [
    ["96–120 vertical rhythm between sections", ""],
    ["12–28 padding inside components", ""],
    ["Auto-layout everywhere", "Auto-layout"],
    ["Whitespace over density", ""],
  ],
  donts: [
    ["Off-scale values (7, 15, 33…)", ""],
    ["Cramped sections", ""],
    ["Manual absolute positioning", ""],
  ],
};

const GLASS_DODONT: DoDont = {
  title: "Glass & blur — where & how",
  note: ["Depth is a cue, not decoration. Glass only earns its keep over something.", ""],
  dos: [
    ["glass/header (blur 24) on the sticky nav", "glass/header (blur 24)"],
    ["glass/menu (blur 40) on the mobile overlay", "glass/menu (blur 40)"],
    ["glass/card (blur 16) over imagery or gradients", "glass/card (blur 16)"],
    ["Always fill 8–12% + hairline border + blur", ""],
    ["Layer one soft glow behind for depth", "glow —"],
  ],
  donts: [
    ["Glass over a flat solid background", ""],
    ["Blur without a border (edges vanish)", ""],
    ["Stacking multiple heavy blurs", ""],
    ["Opaque fills — it stops being glass", ""],
  ],
};

const MOTION_STEPS: Array<[string, Bi]> = [
  [
    "Artboard",
    [
      "Two soft blurred ellipses — teal (accent/primary) + indigo (accent/secondary), 60–120px blur, 60–90% opacity, blend Screen.",
      "— teal (accent/primary) + indigo (accent/secondary), 60–120px, 60–90%, Screen.",
    ],
  ],
  [
    "Breathe",
    ["Scale each blob 1.0 → 1.08 → 1.0 on a loop; offset the two so they never peak together.", ""],
  ],
  [
    "Drift",
    [
      "Translate ±4–6% on X/Y, slow ping-pong — barely perceptible wandering light.",
      "±4–6% X/Y, - — .",
    ],
  ],
  [
    "Pulse",
    [
      "Opacity 0.6 → 1.0 driven by a State-Machine input; trigger on primary-CTA hover or page load.",
      "0.6 → 1.0 State Machine; hover CTA .",
    ],
  ],
  [
    "Embed",
    [
      "Export .riv, render with @rive-app/canvas behind the hero at ~40% opacity, position fixed, pointer-events none, z-index below content.",
      ".riv, @rive-app/canvas ~40%, position fixed, pointer-events none, z-index .",
    ],
  ],
  [
    "Respect users",
    ["Freeze to a static frame when prefers-reduced-motion is set.", "prefers-reduced-motion."],
  ],
];

async function motionCard(t: ThemeContext, w: number): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 18, padding: 32 });
  card.resize(w, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "glass/fill");
  strokeToken(t, card, "glass/border", 1);
  await applyEffect(card, "glow/indigo", t);

  const head = autoFrame({ direction: "VERTICAL", gap: 8 });
  head.layoutAlign = "STRETCH";
  head.appendChild(
    await makeText(t, "heading/h3", "Motion & glow — Rive (for the future)", "text/primary"),
  );
  head.appendChild(
    await bi(
      t,
      "body/sm",
      [
        "The aurora background is built to breathe. Here's how to bring it alive later with Rive so it glows and gently pulses — subtle, never distracting.",
        "- «». Rive, — , .",
      ],
      "text/muted",
      w - 64,
    ),
  );
  card.appendChild(head);
  card.appendChild(hairline(t, w - 64));

  const descMax = w - 64 - TERM_W - 20;
  for (const [term, desc] of MOTION_STEPS) card.appendChild(await usageRow(t, term, desc, descMax));

  const timings = autoFrame({ direction: "VERTICAL", gap: 6 });
  timings.layoutAlign = "STRETCH";
  timings.appendChild(await makeText(t, "overline", "Recommended timings", "accent/primary"));
  timings.appendChild(
    await makeText(
      t,
      "mono/sm",
      "breathe 8–12s   ·   drift 16–24s   ·   pulse 400–800ms   ·   easing sineInOut",
      "text/secondary",
    ),
  );
  card.appendChild(timings);
  return card;
}

async function paintGuidelinesBoard(t: ThemeContext, page: PageNode): Promise<FrameNode> {
  const b = board(t, "Foundations · Guidelines", GUIDE.w, { gap: 32, pad: GUIDE.pad });
  addAtmosphere(b, [{ x: -160, y: 1200, size: 620, hex: "#5EE6C1" }]);

  b.appendChild(
    await boardTitle(
      t,
      "00 · Foundations — Guidelines",
      "How to use it",
      "Where and when to reach for each token. When in doubt, choose restraint.",
    ),
  );

  const full = GUIDE.content;
  const half = (full - 24) / 2;

  const pair = grid(24);
  pair.appendChild(await doDontCard(t, COLOR_DODONT, half));
  pair.appendChild(await doDontCard(t, SPACING_DODONT, half));
  b.appendChild(pair);

  b.appendChild(await usageCard(t, TYPE_USAGE, full));

  const fontsBlock = autoFrame({ direction: "VERTICAL", gap: 16 });
  fontsBlock.layoutAlign = "STRETCH";
  fontsBlock.appendChild(
    await subhead(
      t,
      "Fonts — what & where",
      [
        "All three are free (SIL Open Font License) and available in the Figma font picker. Missing one? Install it, then restart Figma. The fallback chain degrades to Roboto so nothing breaks.",
        "( SIL OFL) Figma. -? Figma. Roboto — .",
      ],
      full,
    ),
  );
  const fontGrid = grid(16);
  const fw = (full - 32) / 3;
  for (const f of FONTS) fontGrid.appendChild(await fontCard(t, f, fw));
  fontsBlock.appendChild(fontGrid);
  b.appendChild(fontsBlock);

  b.appendChild(await usageCard(t, RADII_USAGE, full));
  b.appendChild(await usageCard(t, ELEVATION_USAGE, full));
  b.appendChild(await doDontCard(t, GLASS_DODONT, full));
  b.appendChild(await motionCard(t, full));

  page.appendChild(b);
  return b;
}

// ── Entry ─────────────────────────────────────────────────────

export async function paintFoundations(t: ThemeContext, page: PageNode): Promise<void> {
  const palette = await paintPaletteBoard(t, page);
  const system = await paintSystemBoard(t, page);
  const guidelines = await paintGuidelinesBoard(t, page);
  rowBoards([palette, system, guidelines], 120);
}
