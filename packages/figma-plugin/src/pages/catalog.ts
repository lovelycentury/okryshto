/**
 * Component catalog — matrix-first, minimal-text (Bits-UI preview + Material props).
 *
 * Each component = its own board, laid out in a row, three blocks:
 *   1) Name + ultra-brief ✓ use / ✕ avoid (EN, fixed-width columns)
 *   2) Preview blocks: States matrix/grid + Sizes (sm/md/lg) [+ per-component extras]
 *   3) Compact props table (Prop · Type · Default · short note EN)
 */

import { RADII } from "../tokens";
import { linearGradient, solid } from "../core/color";
import { autoFrame } from "../core/layout";
import {
  auroraBlob,
  boundSolid,
  ellipse,
  fillToken,
  iconArrow,
  makeText,
  rect,
  statusDot,
  strokeToken,
} from "../core/nodes";
import { ThemeContext, colorVar } from "../core/theme";
import { icon, iconFilled } from "../core/icons";
import {
  barChart,
  CHART_PALETTE,
  ganttChart,
  lineChart,
  multiLine,
  pieChart,
  sparkline,
} from "../core/charts";
import { applyEffect } from "../components/primitives";
import { board, rowBoards, cosmicAtmosphere, starStreak } from "./scaffold";

const BOARD_W = 1160;
const PAD = 64;
const CONTENT = BOARD_W - PAD * 2; // 1032

type Bi = [string, string];
type Size = "sm" | "md" | "lg";

interface PropRow {
  prop: string;
  type: string;
  def: string;
  note: Bi;
}

// ── shared ────────────────────────────────────────────────────

function hairline(t: ThemeContext, w: number): RectangleNode {
  const line = rect(w, 1);
  fillToken(t, line, "border/subtle");
  line.layoutAlign = "STRETCH";
  return line;
}

async function overline(t: ThemeContext, text: string): Promise<TextNode> {
  return makeText(t, "overline", text, "accent/primary");
}

function fixedCol(w: number, dir: "VERTICAL" | "HORIZONTAL" = "VERTICAL"): FrameNode {
  const f = autoFrame({ direction: dir, gap: dir === "VERTICAL" ? 2 : 8 });
  f.resize(w, f.height);
  if (dir === "HORIZONTAL") {
    // width fixed, height hugs content (avoids the default ~100px lock)
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "AUTO";
  } else {
    f.counterAxisSizingMode = "FIXED";
  }
  return f;
}

/** Block 1 — name + one-line ✓ use / ✕ avoid (fixed columns → no overflow). */
async function header(
  t: ThemeContext,
  name: string,
  use: Bi,
  avoid: Bi,
  contentW: number = CONTENT,
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 14 });
  col.layoutAlign = "STRETCH";
  col.appendChild(await makeText(t, "heading/h3", name, "text/primary"));

  const guides = autoFrame({ direction: "HORIZONTAL", gap: 28 });
  const colW = (contentW - 28) / 2;
  const textMax = colW - 24;
  const gCol = async (mark: string, color: string, text: Bi) => {
    const c = fixedCol(colW, "HORIZONTAL");
    c.counterAxisAlignItems = "MIN";
    c.appendChild(await makeText(t, "label/sm", mark, color));
    const v = fixedCol(colW - 24);
    v.appendChild(await makeText(t, "body/sm", text[0], "text/secondary", { maxWidth: textMax }));
    c.appendChild(v);
    return c;
  };
  guides.appendChild(await gCol("✓", "accent/primary", use));
  guides.appendChild(await gCol("✕", "feedback/danger", avoid));
  col.appendChild(guides);
  return col;
}

function canvas(t: ThemeContext, contentW: number = CONTENT): FrameNode {
  const c = autoFrame({ direction: "VERTICAL", gap: 0, padding: 28 });
  c.resize(contentW, c.height);
  c.counterAxisSizingMode = "FIXED";
  c.clipsContent = true;
  c.cornerRadius = RADII.lg;
  fillToken(t, c, "bg/inset");
  strokeToken(t, c, "border/subtle", 1);
  return c;
}

const CANVAS_INNER = CONTENT - 56; // canvas padding 28*2

function centerCell(w: number): FrameNode {
  const f = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  f.resize(w, f.height);
  f.counterAxisSizingMode = "FIXED";
  return f;
}

/** A titled preview block (overline + node). */
async function block(t: ThemeContext, title: string, node: FrameNode): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 12 });
  col.layoutAlign = "STRETCH";
  col.appendChild(await overline(t, title));
  col.appendChild(node);
  return col;
}

/** variant × state matrix in a bordered canvas. */
async function matrix(
  t: ThemeContext,
  colHeaders: string[],
  rows: Array<{ header: string; cells: SceneNode[] }>,
  cellW: number,
  rowHeaderW: number,
): Promise<FrameNode> {
  const wrap = canvas(t);
  const grid = autoFrame({ direction: "VERTICAL", gap: 6 });

  const hr = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
  hr.appendChild(centerCell(rowHeaderW));
  for (const h of colHeaders) {
    const c = centerCell(cellW);
    c.appendChild(await makeText(t, "mono/sm", h, "text/muted"));
    hr.appendChild(c);
  }
  grid.appendChild(hr);
  grid.appendChild(hairline(t, rowHeaderW + colHeaders.length * cellW));

  for (const row of rows) {
    const rr = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
    const rh = fixedCol(rowHeaderW, "HORIZONTAL");
    rh.counterAxisAlignItems = "CENTER";
    rh.paddingTop = rh.paddingBottom = 16;
    rh.appendChild(await makeText(t, "label/sm", row.header, "text/secondary"));
    rr.appendChild(rh);
    for (const node of row.cells) {
      const cell = autoFrame({
        direction: "HORIZONTAL",
        align: "CENTER",
        cross: "CENTER",
        padding: [16, 8],
      });
      cell.resize(cellW, cell.height);
      cell.counterAxisSizingMode = "FIXED";
      cell.appendChild(node);
      rr.appendChild(cell);
    }
    grid.appendChild(rr);
  }
  wrap.appendChild(grid);
  return wrap;
}

/** labeled grid of tiles in a bordered canvas. */
async function tileGrid(
  t: ThemeContext,
  tiles: Array<{ label: Bi; node: SceneNode }>,
  tileW: number,
): Promise<FrameNode> {
  const wrap = canvas(t);
  const GAP = 24;
  // Rows are built by hand instead of relying on WRAP: every tile in a row gets
  // a preview cell of the same height, so the captions share one baseline
  // regardless of how tall each preview is.
  const perRow = Math.max(1, Math.floor((CANVAS_INNER + GAP) / (tileW + GAP)));
  const outer = autoFrame({ direction: "VERTICAL", gap: GAP });
  outer.primaryAxisSizingMode = "AUTO";

  for (let i = 0; i < tiles.length; i += perRow) {
    const slice = tiles.slice(i, i + perRow);
    const cellH = Math.max(...slice.map((tile) => tile.node.height));
    const row = autoFrame({ direction: "HORIZONTAL", gap: GAP, cross: "MIN" });
    for (const tile of slice) {
      const col = fixedCol(tileW);
      col.itemSpacing = 12;
      // fixed-height preview cell, content pinned top-left. VERTICAL so a tile
      // with layoutAlign STRETCH still stretches in width, not height.
      const cell = autoFrame({ direction: "VERTICAL", cross: "MIN", name: "tile/preview" });
      cell.resize(tileW, cellH);
      cell.primaryAxisSizingMode = "FIXED";
      cell.counterAxisSizingMode = "FIXED";
      cell.appendChild(tile.node);
      col.appendChild(cell);
      const cap = autoFrame({ direction: "VERTICAL", gap: 1 });
      cap.appendChild(
        await makeText(t, "mono/sm", tile.label[0], "text/secondary", { maxWidth: tileW }),
      );
      col.appendChild(cap);
      row.appendChild(col);
    }
    outer.appendChild(row);
  }

  wrap.appendChild(outer);
  return wrap;
}

async function propsTable(
  t: ThemeContext,
  rows: PropRow[],
  contentW: number = CONTENT,
): Promise<FrameNode> {
  const table = autoFrame({ direction: "VERTICAL", gap: 0 });
  table.layoutAlign = "STRETCH";
  const wProp = 150;
  const wType = 210;
  const wDef = 96;
  const gap = 20;
  const wNote = contentW - wProp - wType - wDef - gap * 3;

  const head = autoFrame({ direction: "HORIZONTAL", gap });
  head.paddingBottom = 8;
  for (const [label, w] of [
    ["Prop", wProp],
    ["Type", wType],
    ["Default", wDef],
    ["Note", wNote],
  ] as Array<[string, number]>) {
    const c = fixedCol(w);
    c.appendChild(await makeText(t, "label/sm", label, "text/primary"));
    head.appendChild(c);
  }
  table.appendChild(head);
  table.appendChild(hairline(t, CONTENT));

  for (const row of rows) {
    const r = autoFrame({ direction: "HORIZONTAL", gap, cross: "MIN" });
    r.paddingTop = 8;
    r.paddingBottom = 10;
    const pc = fixedCol(wProp);
    pc.appendChild(await makeText(t, "mono/sm", row.prop, "accent/primary", { maxWidth: wProp }));
    const tc = fixedCol(wType);
    tc.appendChild(await makeText(t, "mono/sm", row.type, "text/muted", { maxWidth: wType }));
    const dc = fixedCol(wDef);
    dc.appendChild(await makeText(t, "mono/sm", row.def, "text/secondary", { maxWidth: wDef }));
    const nc = fixedCol(wNote);
    nc.appendChild(
      await makeText(t, "body/sm", row.note[0], "text/secondary", { maxWidth: wNote }),
    );
    r.appendChild(pc);
    r.appendChild(tc);
    r.appendChild(dc);
    r.appendChild(nc);
    table.appendChild(r);
    table.appendChild(hairline(t, contentW));
  }
  return table;
}

async function componentBoard(
  t: ThemeContext,
  name: string,
  use: Bi,
  avoid: Bi,
  previewBlocks: FrameNode[],
  props: PropRow[],
  width: number = BOARD_W,
): Promise<FrameNode> {
  const contentW = width - PAD * 2;
  const b = board(t, `Control · ${name}`, width, { gap: 28, pad: PAD });
  b.appendChild(await header(t, name, use, avoid, contentW));
  for (const pb of previewBlocks) b.appendChild(pb);
  b.appendChild(await propsTable(t, props, contentW));
  cosmicAtmosphere(b); // decorate after content so board height is known
  return b;
}

// ── drawers (with sizes) ──────────────────────────────────────

type BtnVariant = "Primary" | "Gradient" | "Secondary" | "Soft" | "Ghost" | "Glass";
type BtnState = "Default" | "Hover" | "Focus" | "Disabled";
type BtnShape = "rounded" | "pill";

const BTN_SIZE: Record<Size, { pad: [number, number]; style: string; icon: number; gap: number }> =
  {
    sm: { pad: [9, 16], style: "label/sm", icon: 14, gap: 7 },
    md: { pad: [12, 20], style: "label/md", icon: 16, gap: 8 },
    lg: { pad: [16, 28], style: "body/md", icon: 18, gap: 10 },
  };

async function drawButton(
  t: ThemeContext,
  variant: BtnVariant,
  state: BtnState,
  size: Size = "md",
  shape: BtnShape = "pill",
  label = "Button",
  tone = "accent/primary",
): Promise<FrameNode> {
  const sp = BTN_SIZE[size];
  const b = autoFrame({ direction: "HORIZONTAL", gap: sp.gap, cross: "CENTER", padding: sp.pad });
  b.cornerRadius = shape === "pill" ? RADII.full : RADII.lg;
  let textToken = "text/primary";
  if (variant === "Primary") {
    fillToken(t, b, tone);
    textToken = "accent/contrast";
  } else if (variant === "Gradient") {
    b.fills = [
      linearGradient(
        [
          { hex: "#5EE6C1", position: 0 },
          { hex: "#818CF8", position: 1 },
        ],
        "diagonal",
      ),
    ];
    textToken = "accent/contrast";
  } else if (variant === "Secondary") {
    // Soft dark pill, barely-there edge — no strict border.
    fillToken(t, b, state === "Hover" ? "bg/surface" : "bg/surface-raised");
    strokeToken(t, b, "border/subtle", 1);
  } else if (variant === "Soft") {
    fillToken(t, b, state === "Hover" ? "bg/surface" : "bg/surface-raised");
    textToken = "text/primary";
  } else if (variant === "Ghost") {
    if (state === "Hover") fillToken(t, b, "bg/surface-raised");
    else b.fills = [];
    textToken = "text/secondary";
  } else {
    fillToken(t, b, "glass/fill");
    strokeToken(t, b, "glass/border", 1);
  }
  const filled = variant === "Primary" || variant === "Gradient";
  const glowName = variant === "Gradient" ? "glow/gradient" : "glow/button";
  // Filled/gradient → colored glow on hover & focus (no border); gradient 2×.
  // Others → cute glow on hover, accent ring on focus.
  if (state === "Hover") {
    if (filled && tone !== "accent/primary") b.effects = [toneGlow(tone, 18, 0.5)];
    else await applyEffect(b, filled ? glowName : "glow/hover", t);
  }
  if (state === "Focus") {
    if (filled) {
      if (tone !== "accent/primary") b.effects = [toneGlow(tone, 18, 0.5)];
      else await applyEffect(b, glowName, t);
    } else strokeToken(t, b, "state/focus", 2);
  }
  if (state === "Disabled") b.opacity = 0.4;
  b.appendChild(await makeText(t, sp.style, label, textToken));
  if (variant === "Primary" || variant === "Gradient" || variant === "Glass")
    b.appendChild(iconArrow(t, sp.icon, textToken));
  return b;
}

const SW_SIZE: Record<Size, { w: number; h: number; thumb: number }> = {
  sm: { w: 40, h: 24, thumb: 18 },
  md: { w: 48, h: 28, thumb: 22 },
  lg: { w: 58, h: 34, thumb: 27 },
};

async function drawSwitch(
  t: ThemeContext,
  on: boolean,
  disabled: boolean,
  size: Size = "md",
  tone = "accent/primary",
): Promise<FrameNode> {
  const sp = SW_SIZE[size];
  const track = autoFrame({
    direction: "HORIZONTAL",
    cross: "CENTER",
    align: on ? "MAX" : "MIN",
    padding: 3,
  });
  track.resize(sp.w, sp.h);
  track.primaryAxisSizingMode = "FIXED";
  track.counterAxisSizingMode = "FIXED";
  track.cornerRadius = RADII.full;
  if (on) fillToken(t, track, tone);
  else {
    fillToken(t, track, "bg/surface-raised");
    strokeToken(t, track, "border/strong", 1);
  }
  const thumb = figma.createEllipse();
  thumb.resize(sp.thumb, sp.thumb);
  thumb.fills = [solid(on ? "#04140F" : "#F5F5F7")];
  track.appendChild(thumb);
  if (disabled) track.opacity = 0.4;
  return track;
}

type TfState = "Default" | "Focus" | "Filled" | "Error" | "Disabled";

const TF_SIZE: Record<Size, { pad: [number, number]; style: string }> = {
  sm: { pad: [9, 12], style: "body/sm" },
  md: { pad: [12, 14], style: "body/md" },
  lg: { pad: [15, 16], style: "body/lg" },
};

interface FieldCopy {
  label?: string;
  value?: string;
  placeholder?: string;
  helper?: string | null;
  errorHelper?: string;
  width?: number;
  focusTone?: string; // rare — alternate focus ring tone (e.g. dante mode)
}

async function drawTextField(
  t: ThemeContext,
  state: TfState,
  size: Size = "md",
  hideLabel = false,
  o: FieldCopy = {},
): Promise<FrameNode> {
  const sp = TF_SIZE[size];
  const W = o.width ?? 300;
  const col = autoFrame({ direction: "VERTICAL", gap: 7 });
  col.resize(W, col.height);
  col.counterAxisSizingMode = "FIXED";
  if (!hideLabel) {
    col.appendChild(await makeText(t, "label/sm", o.label ?? "Email", "text/secondary"));
  } else {
    // Reserve the label's height so fields stay aligned with labelled ones.
    col.appendChild(rect(W, 16));
  }

  const field = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", padding: sp.pad });
  field.layoutAlign = "STRETCH";
  field.cornerRadius = RADII.md;
  fillToken(t, field, "bg/surface");
  if (state === "Focus") {
    if (o.focusTone) {
      strokeToken(t, field, o.focusTone, 1.5);
      field.effects = [toneGlow(o.focusTone, 14, 0.35)];
    } else {
      strokeToken(t, field, "state/focus", 1.5);
      await applyEffect(field, "glow/accent", t);
    }
  } else if (state === "Error") {
    strokeToken(t, field, "feedback/danger", 1.5);
  } else {
    strokeToken(t, field, "border/default", 1);
  }
  const filled = state === "Filled" || state === "Error";
  const shown = filled ? (o.value ?? "hello@oleksii.dev") : (o.placeholder ?? "you@company.com");
  field.appendChild(
    await makeText(t, sp.style, shown, filled ? "text/primary" : "text/muted", {
      maxWidth: W - sp.pad[1] * 2,
    }),
  );
  col.appendChild(field);

  const helper =
    state === "Error"
      ? (o.errorHelper ?? "Enter a valid email")
      : o.helper === undefined
        ? "We'll never share it"
        : o.helper;
  if (helper !== null)
    col.appendChild(
      await makeText(t, "caption", helper, state === "Error" ? "feedback/danger" : "text/muted", {
        maxWidth: W,
      }),
    );
  if (state === "Disabled") col.opacity = 0.4;
  return col;
}

type CbState = "Unchecked" | "Checked" | "Indeterminate";

const CB_SIZE: Record<Size, number> = { sm: 16, md: 20, lg: 24 };

/** Draw a stroke segment inside a box, coords in 0..1 of size `s`. */
function seg(
  parent: FrameNode,
  s: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  paint: SolidPaint,
  w: number,
): void {
  const line = figma.createLine();
  line.strokes = [paint];
  line.strokeWeight = w;
  line.strokeCap = "ROUND";
  const dx = (x2 - x1) * s;
  const dy = (y2 - y1) * s;
  line.resize(Math.hypot(dx, dy), 0);
  line.rotation = (-Math.atan2(dy, dx) * 180) / Math.PI;
  line.x = x1 * s;
  line.y = y1 * s;
  parent.appendChild(line);
}

async function drawCheckbox(
  t: ThemeContext,
  state: CbState,
  disabled: boolean,
  size: Size = "md",
  tone = "accent/primary",
): Promise<FrameNode> {
  const s = CB_SIZE[size];
  const box = figma.createFrame();
  box.name = `Checkbox/${state}`;
  box.resize(s, s);
  box.cornerRadius = Math.max(4, Math.round(s * 0.28));
  box.clipsContent = false;
  const on = state !== "Unchecked";
  if (on) {
    fillToken(t, box, tone);
  } else {
    box.fills = [];
    strokeToken(t, box, "border/strong", 1.5);
  }
  if (on) {
    const mark = boundSolid(colorVar(t, "accent/contrast"));
    const w = Math.max(1.5, s / 9);
    if (state === "Checked") {
      seg(box, s, 0.26, 0.52, 0.43, 0.69, mark, w);
      seg(box, s, 0.43, 0.69, 0.74, 0.33, mark, w);
    } else {
      seg(box, s, 0.28, 0.5, 0.72, 0.5, mark, w);
    }
  }
  if (disabled) box.opacity = 0.4;
  return box;
}

async function drawCheckboxLabel(
  t: ThemeContext,
  state: CbState,
  text: string,
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  row.appendChild(await drawCheckbox(t, state, false, "md"));
  row.appendChild(await makeText(t, "body/sm", text, "text/secondary"));
  return row;
}

type IaState =
  | "Default"
  | "Hover"
  | "Focus"
  | "Filled"
  | "Loading"
  | "Success"
  | "Error"
  | "Readonly"
  | "Disabled";

const IA_SIZE: Record<
  Size,
  {
    valueW: number;
    padL: number;
    padR: number;
    padV: number;
    text: string;
    btnPad: [number, number];
    btnText: string;
    icon: number;
  }
> = {
  sm: {
    valueW: 170,
    padL: 16,
    padR: 5,
    padV: 5,
    text: "body/sm",
    btnPad: [6, 12],
    btnText: "label/sm",
    icon: 13,
  },
  md: {
    valueW: 210,
    padL: 18,
    padR: 6,
    padV: 6,
    text: "body/md",
    btnPad: [8, 14],
    btnText: "label/md",
    icon: 14,
  },
  lg: {
    valueW: 250,
    padL: 22,
    padR: 7,
    padV: 7,
    text: "body/lg",
    btnPad: [10, 18],
    btnText: "body/md",
    icon: 16,
  },
};

/** Ambient glow that matches the tone — teal and indigo have real effect styles. */
const IA_GLOW: Record<string, string> = {
  "accent/primary": "glow/accent",
  "accent/secondary": "glow/indigo",
};

/** How the inline button carries its colour. Multiplies the tone axis. */
type IaFill = "filled" | "soft" | "outline" | "gradient" | "glass";

/** Second hue for gradient fills — keeps pairings inside the aurora language. */
const IA_GRADIENT_PAIR: Record<string, string> = {
  "accent/primary": "accent/secondary",
  "accent/secondary": "accent/dante",
  "accent/dante": "accent/violet",
  "accent/violet": "accent/dante",
  "accent/ember": "accent/dante",
  "accent/ice": "accent/primary",
  "feedback/success": "accent/primary",
  "feedback/warning": "accent/ember",
  "feedback/danger": "accent/dante",
};

/** Paint the inline button for a tone × fill pair; returns the label/icon token. */
function paintIaButton(t: ThemeContext, btn: FrameNode, tone: string, fill: IaFill): string {
  if (fill === "soft") {
    btn.fills = [tokenAlpha(tone, 0.16)];
    btn.strokes = [tokenAlpha(tone, 0.3)];
    btn.strokeWeight = 1;
    return tone; // coloured label on a tinted wash
  }
  if (fill === "outline") {
    btn.fills = [];
    btn.strokes = [tokenAlpha(tone, 0.75)];
    btn.strokeWeight = 1.5;
    return tone;
  }
  if (fill === "glass") {
    fillToken(t, btn, "glass/fill-strong");
    strokeToken(t, btn, "glass/border", 1);
    return tone;
  }
  if (fill === "gradient") {
    const to = IA_GRADIENT_PAIR[tone] ?? "accent/secondary";
    btn.fills = [
      {
        type: "GRADIENT_LINEAR",
        gradientTransform: [
          [1, 0, 0],
          [0, 1, 0],
        ],
        gradientStops: [
          { position: 0, color: { ...tokenAlpha(tone, 1).color, a: 1 } },
          { position: 1, color: { ...tokenAlpha(to, 1).color, a: 1 } },
        ],
      } as GradientPaint,
    ];
    return "accent/contrast";
  }
  fillToken(t, btn, tone);
  return "accent/contrast";
}

async function drawInputAction(
  t: ThemeContext,
  state: IaState,
  size: Size = "md",
  action = "Copy",
  o: {
    value?: string;
    placeholder?: string;
    mono?: boolean;
    valueW?: number;
    tone?: string;
    message?: string;
    fill?: IaFill;
  } = {},
): Promise<FrameNode> {
  const sp = IA_SIZE[size];
  // no explicit tone → inherit the tone of the section being painted
  const tone = o.tone ?? sectionTone();
  const fill: IaFill = o.fill ?? "filled";
  // the button owns the tone; feedback states override the field's border only
  const border: Record<IaState, string> = {
    Default: "border/default",
    Hover: "border/strong",
    Focus: tone,
    Filled: "border/default",
    Loading: "border/default",
    Success: "feedback/success",
    Error: "feedback/danger",
    Readonly: "border/subtle",
    Disabled: "border/default",
  };

  const c = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", align: "MIN" });
  c.itemSpacing = 10;
  c.primaryAxisSizingMode = "AUTO";
  c.counterAxisSizingMode = "AUTO";
  c.paddingLeft = sp.padL;
  c.paddingRight = sp.padR;
  c.paddingTop = c.paddingBottom = sp.padV;
  c.cornerRadius = RADII.full;
  fillToken(t, c, state === "Readonly" ? "bg/surface" : "bg/inset");

  if (state === "Focus") {
    strokeToken(t, c, tone, 1.5);
    await applyEffect(c, IA_GLOW[tone] ?? "glow/hover", t);
  } else if (state === "Hover") {
    strokeToken(t, c, border.Hover, 1);
    await applyEffect(c, "glow/hover", t);
  } else if (state === "Success" || state === "Error") {
    c.strokes = [tokenAlpha(border[state], 0.8)];
    c.strokeWeight = 1.5;
  } else {
    strokeToken(t, c, border[state], 1);
  }

  const filled = state !== "Default" && state !== "Hover" && state !== "Focus";
  const shown = filled ? (o.value ?? "hello@oleksii.dev") : (o.placeholder ?? "you@company.com");
  c.appendChild(
    await makeText(t, o.mono ? "mono/sm" : sp.text, shown, filled ? "text/primary" : "text/muted", {
      maxWidth: o.valueW ?? sp.valueW,
    }),
  );

  // ── the inline button ────────────────────────────────────────
  const btnTone =
    state === "Success" ? "feedback/success" : state === "Error" ? "feedback/danger" : tone;
  const btn = autoFrame({
    direction: "HORIZONTAL",
    gap: 6,
    cross: "CENTER",
    align: "CENTER",
    padding: sp.btnPad,
  });
  btn.cornerRadius = RADII.full;
  if (state === "Readonly") {
    // nothing to submit — the action steps back to a quiet outline
    btn.fills = [];
    strokeToken(t, btn, "border/strong", 1);
    btn.appendChild(await makeText(t, sp.btnText, action, "text/secondary"));
    btn.appendChild(icon(t, "lock", sp.icon, "text/muted"));
  } else {
    // fill decides how the tone is carried; it also decides the ink on top
    const ink = paintIaButton(t, btn, btnTone, fill);
    const label =
      state === "Loading"
        ? "Sending…"
        : state === "Success"
          ? "Copied"
          : state === "Error"
            ? "Retry"
            : action;
    btn.appendChild(await makeText(t, sp.btnText, label, ink));
    if (state === "Loading") btn.appendChild(drawSpinner(t, "ring", "sm", ink));
    else if (state === "Success") btn.appendChild(icon(t, "check", sp.icon, ink));
    else if (state === "Error") btn.appendChild(icon(t, "refresh-cw", sp.icon, ink));
    else btn.appendChild(iconArrow(t, sp.icon, ink));
  }
  c.appendChild(btn);

  if (state === "Disabled") c.opacity = 0.4;

  // ── optional message under the pill (feedback states) ────────
  if (!o.message) return c;
  const col = autoFrame({ direction: "VERTICAL", gap: 7 });
  col.appendChild(c);
  const msgTone =
    state === "Error" ? "feedback/danger" : state === "Success" ? "feedback/success" : "text/muted";
  const msg = autoFrame({
    direction: "HORIZONTAL",
    gap: 6,
    cross: "CENTER",
    padding: { t: 0, r: 0, b: 0, l: sp.padL },
  });
  msg.appendChild(
    icon(
      t,
      state === "Error" ? "alert-triangle" : state === "Success" ? "check" : "clock",
      12,
      msgTone,
    ),
  );
  msg.appendChild(await makeText(t, "caption", o.message, msgTone));
  col.appendChild(msg);
  return col;
}

type PhotoStyle = "Plain" | "Framed" | "Scrim" | "Cutout" | "Noir";

const PHOTO_SIZE: Record<Size, { w: number; h: number }> = {
  sm: { w: 150, h: 200 },
  md: { w: 210, h: 280 },
  lg: { w: 270, h: 360 },
};

/** Faint head-and-shoulders placeholder drawn absolutely inside a plain frame. */
function addSilhouette(t: ThemeContext, box: FrameNode, w: number, h: number): void {
  const hd = w * 0.34;
  const head = ellipse(hd);
  fillToken(t, head, "border/strong");
  head.x = (w - hd) / 2;
  head.y = h * 0.16;
  const bodyW = w * 0.66;
  const bodyH = h * 0.5;
  const body = rect(bodyW, bodyH, bodyW * 0.5);
  fillToken(t, body, "border/strong");
  body.x = (w - bodyW) / 2;
  body.y = h * 0.44;
  box.appendChild(head);
  box.appendChild(body);
}

async function drawPhoto(
  t: ThemeContext,
  style: PhotoStyle,
  size: Size = "md",
  caption = false,
): Promise<FrameNode> {
  const { w, h } = PHOTO_SIZE[size];
  const cutout = style === "Cutout";
  const box = figma.createFrame();
  box.name = "Photo — replace fill with your image";
  box.resize(w, h);
  box.cornerRadius = cutout ? 0 : RADII.xl;
  box.clipsContent = !cutout;
  if (cutout) box.fills = [];
  else fillToken(t, box, "bg/surface-raised");

  if (style === "Framed") {
    strokeToken(t, box, "glass/border", 1);
    await applyEffect(box, "shadow/md", t);
  } else if (style === "Plain" || style === "Scrim" || style === "Noir") {
    strokeToken(t, box, "border/subtle", 1);
  }

  addSilhouette(t, box, w, h);

  // Noir — shadows creep in from all four edges and swallow the subject
  if (style === "Noir") {
    const D = "#05060A";
    const shade = (
      wd: number,
      ht: number,
      x: number,
      y: number,
      stops: Array<{ hex: string; position: number }>,
      dir: "vertical" | "horizontal",
    ): void => {
      const s = rect(wd, ht);
      s.fills = [linearGradient(stops, dir)];
      s.x = x;
      s.y = y;
      box.appendChild(s);
    };
    shade(
      w,
      Math.round(h * 0.44),
      0,
      0,
      [
        { hex: `${D}F2`, position: 0 },
        { hex: `${D}00`, position: 1 },
      ],
      "vertical",
    );
    shade(
      Math.round(w * 0.46),
      h,
      0,
      0,
      [
        { hex: `${D}E6`, position: 0 },
        { hex: `${D}00`, position: 1 },
      ],
      "horizontal",
    );
    shade(
      Math.round(w * 0.46),
      h,
      w - Math.round(w * 0.46),
      0,
      [
        { hex: `${D}00`, position: 0 },
        { hex: `${D}E6`, position: 1 },
      ],
      "horizontal",
    );
    shade(
      w,
      Math.round(h * 0.58),
      0,
      h - Math.round(h * 0.58),
      [
        { hex: `${D}00`, position: 0 },
        { hex: `${D}FA`, position: 1 },
      ],
      "vertical",
    );
  }

  // Bottom scrim — darkens the image toward the bottom.
  if (style === "Scrim" || cutout) {
    const scrimH = Math.round(h * (cutout ? 0.55 : 0.45));
    const scrim = rect(w, scrimH);
    scrim.fills = [
      linearGradient(
        [
          { hex: "#0A0A0B00", position: 0 },
          { hex: cutout ? "#0A0A0BFF" : "#0A0A0BE6", position: 1 },
        ],
        "vertical",
      ),
    ];
    box.appendChild(scrim);
    scrim.x = 0;
    scrim.y = h - scrimH;
  }

  // Caption over the scrim.
  if (caption && (style === "Scrim" || style === "Noir")) {
    const name = await makeText(t, "heading/h4", "Oleksii K.", "text/primary");
    name.x = 16;
    name.y = h - 48;
    box.appendChild(name);
    const role = await makeText(t, "caption", "Product Engineer", "text/secondary");
    role.x = 16;
    role.y = h - 26;
    box.appendChild(role);
  }
  return box;
}

interface LinkOpts {
  tone?: string;
  title: string;
  subtitle: string;
  meta: string;
  featured?: boolean;
  hover?: boolean;
  size?: Size;
}

const LINK_PAD: Record<Size, { padV: number; padH: number; title: string }> = {
  sm: { padV: 16, padH: 22, title: "heading/h4" },
  md: { padV: 22, padH: 26, title: "heading/h4" },
  lg: { padV: 28, padH: 30, title: "heading/h3" },
};

async function drawLinkRow(t: ThemeContext, w: number, o: LinkOpts): Promise<FrameNode> {
  const sp = LINK_PAD[o.size ?? "md"];
  const row = autoFrame({
    direction: "HORIZONTAL",
    cross: "CENTER",
    align: "SPACE_BETWEEN",
    padding: [sp.padV, sp.padH],
  });
  row.resize(w, row.height);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.cornerRadius = RADII.lg;
  const lTone = o.tone ?? "accent/primary";
  if (o.featured) {
    fillToken(t, row, "glass/fill");
    strokeToken(t, row, "glass/border", 1);
    if (lTone === "accent/primary") await applyEffect(row, "glow/accent", t);
    else row.effects = [toneGlow(lTone, 20, 0.3)];
  } else {
    fillToken(t, row, o.hover ? "bg/surface-raised" : "bg/surface");
    strokeToken(t, row, "border/subtle", 1);
  }

  const left = autoFrame({ direction: "VERTICAL", gap: 5 });
  const titleRow = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  if (o.featured) titleRow.appendChild(statusDot(t, lTone, 7));
  titleRow.appendChild(await makeText(t, sp.title, o.title, "text/primary"));
  left.appendChild(titleRow);
  left.appendChild(await makeText(t, "body/sm", o.subtitle, "text/muted"));
  row.appendChild(left);

  const right = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  right.appendChild(await makeText(t, "mono/sm", o.meta, "text/muted"));
  right.appendChild(iconArrow(t, 18, o.featured ? lTone : "text/secondary", true));
  row.appendChild(right);
  return row;
}

async function linkList(t: ThemeContext, rows: LinkOpts[], gap = 14): Promise<FrameNode> {
  const wrap = canvas(t);
  const list = autoFrame({ direction: "VERTICAL", gap });
  list.layoutAlign = "STRETCH";
  for (const r of rows) list.appendChild(await drawLinkRow(t, CANVAS_INNER, r));
  wrap.appendChild(list);
  return wrap;
}

interface StatOpts {
  tone?: string;
  value: string;
  label: string;
  sign?: string;
  accent?: boolean;
  size?: Size;
  trend?: { value: string; up: boolean };
  spark?: number[];
}

const STAT_SIZE: Record<Size, { pad: number; value: string; label: string; gap: number }> = {
  sm: { pad: 24, value: "display/lg", label: "body/sm", gap: 8 },
  md: { pad: 28, value: "display/xl", label: "body/md", gap: 10 },
  lg: { pad: 32, value: "display/2xl", label: "body/md", gap: 12 },
};

async function trendBadge(t: ThemeContext, value: string, up: boolean): Promise<FrameNode> {
  const pill = autoFrame({ direction: "HORIZONTAL", gap: 4, cross: "CENTER", padding: [4, 8] });
  pill.cornerRadius = RADII.full;
  fillToken(t, pill, "bg/surface-raised");
  const token = up ? "feedback/success" : "feedback/danger";
  pill.appendChild(icon(t, up ? "arrow-up" : "arrow-down", 13, token));
  pill.appendChild(await makeText(t, "label/sm", value, token));
  return pill;
}

async function drawStat(t: ThemeContext, w: number, o: StatOpts): Promise<FrameNode> {
  const sp = STAT_SIZE[o.size ?? "md"];
  const card = autoFrame({ direction: "VERTICAL", gap: sp.gap, padding: sp.pad });
  card.resize(w, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  const tone = o.tone ?? "accent/primary";
  if (o.accent) {
    if (tone === "accent/primary") await applyEffect(card, "glow/accent", t);
    else card.effects = [toneGlow(tone, 20, 0.3)];
  }

  const numberRow = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  numberRow.appendChild(
    await makeText(t, sp.value, `${o.value}${o.sign ?? ""}`, o.accent ? tone : "text/primary"),
  );
  if (o.trend) numberRow.appendChild(await trendBadge(t, o.trend.value, o.trend.up));
  card.appendChild(numberRow);

  card.appendChild(
    await makeText(t, sp.label, o.label, "text/muted", { maxWidth: w - sp.pad * 2 }),
  );

  if (o.spark) {
    const sparkNode = sparkline(
      t,
      o.spark,
      w - sp.pad * 2,
      40,
      o.accent ? tone : "accent/secondary",
    );
    card.appendChild(sparkNode);
  }
  return card;
}

// ── boards ────────────────────────────────────────────────────

const SIZE_LABEL: Record<Size, Bi> = {
  sm: ["Small", ""],
  md: ["Medium", ""],
  lg: ["Large", ""],
};

async function buttonBoard(t: ThemeContext): Promise<FrameNode> {
  const variants: BtnVariant[] = ["Primary", "Gradient", "Secondary", "Soft", "Ghost", "Glass"];
  const states: BtnState[] = ["Default", "Hover", "Focus", "Disabled"];
  const rows = [];
  for (const v of variants) {
    const cells: SceneNode[] = [];
    for (const s of states) cells.push(await drawButton(t, v, s));
    rows.push({ header: v, cells });
  }
  const statesM = await matrix(t, states, rows, 150, 108);
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawButton(t, "Primary", "Default", "sm") },
      { label: SIZE_LABEL.md, node: await drawButton(t, "Primary", "Default", "md") },
      { label: SIZE_LABEL.lg, node: await drawButton(t, "Primary", "Default", "lg") },
    ],
    150,
  );
  const shapes = await tileGrid(
    t,
    [
      {
        label: ["Rounded", ""],
        node: await drawButton(t, "Primary", "Default", "md", "rounded", "Get in touch"),
      },
      {
        label: ["Pill", ""],
        node: await drawButton(t, "Primary", "Default", "md", "pill", "Get in touch"),
      },
      {
        label: ["Soft · Pill", ""],
        node: await drawButton(t, "Soft", "Default", "md", "pill", "See selected work"),
      },
    ],
    220,
  );
  const btnTones: Array<{ label: Bi; node: SceneNode }> = [];
  for (const [en, ru, tk] of TONES_ACCENT)
    btnTones.push({
      label: [en, ru],
      node: await drawButton(t, "Primary", "Default", "md", "pill", "Get in touch", tk),
    });
  const btnTonesGrid = await tileGrid(t, btnTones, 220);
  const props: PropRow[] = [
    {
      prop: "variant",
      type: "primary|gradient|secondary|soft|ghost|glass",
      def: "primary",
      note: ["Emphasis level.", ""],
    },
    {
      prop: "tone",
      type: "token",
      def: "accent/primary",
      note: ["Primary fill colour (dante-ready).", "Primary ( dante)."],
    },
    {
      prop: "shape",
      type: "rounded|pill",
      def: "pill",
      note: ["Corner style (pill = soft).", "(pill = )."],
    },
    {
      prop: "size",
      type: "sm|md|lg",
      def: "md",
      note: ["Height, padding, text size.", ""],
    },
    {
      prop: "disabled",
      type: "boolean",
      def: "false",
      note: ["Dims to 40%, blocks clicks.", "40%, off."],
    },
    {
      prop: "startIcon|endIcon",
      type: "ReactNode",
      def: "—",
      note: ["Icon slots.", ""],
    },
    { prop: "onClick", type: "(e)=>void", def: "—", note: ["Click handler.", ""] },
  ];
  return componentBoard(
    t,
    "Button",
    ["Committing action; one primary per view", ""],
    ["Plain navigation → use Link", "→ Link"],
    [
      await block(t, "States", statesM),
      await block(t, "Tones", btnTonesGrid),
      await block(t, "Shapes", shapes),
      await block(t, "Sizes", sizes),
    ],
    props,
  );
}

async function switchBoard(t: ThemeContext): Promise<FrameNode> {
  const rows = [
    {
      header: "Enabled",
      cells: [await drawSwitch(t, false, false), await drawSwitch(t, true, false)] as SceneNode[],
    },
    {
      header: "Disabled",
      cells: [await drawSwitch(t, false, true), await drawSwitch(t, true, true)] as SceneNode[],
    },
  ];
  const statesM = await matrix(t, ["Off", "On"], rows, 120, 108);
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawSwitch(t, true, false, "sm") },
      { label: SIZE_LABEL.md, node: await drawSwitch(t, true, false, "md") },
      { label: SIZE_LABEL.lg, node: await drawSwitch(t, true, false, "lg") },
    ],
    100,
  );
  const swTones: Array<{ label: Bi; node: SceneNode }> = [];
  for (const [en, ru, tk] of TONES_9)
    swTones.push({ label: [en, ru], node: await drawSwitch(t, true, false, "md", tk) });
  const tones = await tileGrid(t, swTones, 110);
  const props: PropRow[] = [
    {
      prop: "checked",
      type: "boolean",
      def: "false",
      note: ["On/off value.", ""],
    },
    {
      prop: "size",
      type: "sm|md|lg",
      def: "md",
      note: ["Track & thumb size.", ""],
    },
    {
      prop: "tone",
      type: "token",
      def: "accent/primary",
      note: ["On-state colour (dante-ready).", "( dante)."],
    },
    { prop: "disabled", type: "boolean", def: "false", note: ["Non-interactive.", ""] },
    {
      prop: "onChange",
      type: "(e,checked)=>void",
      def: "—",
      note: ["Fires on toggle.", ""],
    },
  ];
  return componentBoard(
    t,
    "Switch",
    ["Instant on/off setting", ""],
    ["Pick one of many → use Radio", "→ Radio"],
    [
      await block(t, "States", statesM),
      await block(t, "Tones", tones),
      await block(t, "Sizes", sizes),
    ],
    props,
  );
}

async function textFieldBoard(t: ThemeContext): Promise<FrameNode> {
  const stateList: Array<[TfState, string]> = [
    ["Default", ""],
    ["Focus", ""],
    ["Filled", ""],
    ["Error", ""],
    ["Disabled", ""],
  ];
  const states = await tileGrid(
    t,
    await Promise.all(
      stateList.map(async ([s, ru]) => ({ label: [s, ru] as Bi, node: await drawTextField(t, s) })),
    ),
    320,
  );
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawTextField(t, "Filled", "sm") },
      { label: SIZE_LABEL.md, node: await drawTextField(t, "Filled", "md") },
      { label: SIZE_LABEL.lg, node: await drawTextField(t, "Filled", "lg") },
    ],
    320,
  );
  const labels = await tileGrid(
    t,
    [
      { label: ["With label", ""], node: await drawTextField(t, "Default", "md", false) },
      { label: ["No label", ""], node: await drawTextField(t, "Default", "md", true) },
      {
        label: ["Focus · Dante (rare)", ""],
        node: await drawTextField(t, "Focus", "md", false, { focusTone: "accent/dante" }),
      },
    ],
    320,
  );
  const props: PropRow[] = [
    { prop: "label", type: "string", def: "—", note: ["Field label.", ""] },
    {
      prop: "hideLabel",
      type: "boolean",
      def: "false",
      note: ["Visually hides the label.", ""],
    },
    {
      prop: "size",
      type: "sm|md|lg",
      def: "md",
      note: ["Field height & text.", ""],
    },
    { prop: "value", type: "string", def: "''", note: ["Text value.", ""] },
    {
      prop: "error",
      type: "boolean",
      def: "false",
      note: ["Marks invalid + red border.", ""],
    },
    {
      prop: "helperText",
      type: "string",
      def: "—",
      note: ["Text below field.", ""],
    },
    { prop: "disabled", type: "boolean", def: "false", note: ["Blocks input.", "off."] },
  ];
  return componentBoard(
    t,
    "TextField",
    ["Short free-form text", ""],
    ["Known options → use Select", "→ Select"],
    [
      await block(t, "States", states),
      await block(t, "Sizes", sizes),
      await block(t, "Label", labels),
    ],
    props,
  );
}

async function checkboxBoard(t: ThemeContext): Promise<FrameNode> {
  const cols = ["Unchecked", "Checked", "Indeterminate"];
  const rows = [
    {
      header: "Enabled",
      cells: [
        await drawCheckbox(t, "Unchecked", false),
        await drawCheckbox(t, "Checked", false),
        await drawCheckbox(t, "Indeterminate", false),
      ] as SceneNode[],
    },
    {
      header: "Disabled",
      cells: [
        await drawCheckbox(t, "Unchecked", true),
        await drawCheckbox(t, "Checked", true),
        await drawCheckbox(t, "Indeterminate", true),
      ] as SceneNode[],
    },
  ];
  const statesM = await matrix(t, cols, rows, 160, 108);
  const cbTones: Array<{ label: Bi; node: SceneNode }> = [];
  for (const [en, ru, tk] of TONES_9)
    cbTones.push({ label: [en, ru], node: await drawCheckbox(t, "Checked", false, "md", tk) });
  const cbTonesGrid = await tileGrid(t, cbTones, 110);
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawCheckbox(t, "Checked", false, "sm") },
      { label: SIZE_LABEL.md, node: await drawCheckbox(t, "Checked", false, "md") },
      { label: SIZE_LABEL.lg, node: await drawCheckbox(t, "Checked", false, "lg") },
    ],
    150,
  );
  const labels = await tileGrid(
    t,
    [
      {
        label: ["Checked", ""],
        node: await drawCheckboxLabel(t, "Checked", "Subscribe to updates"),
      },
      {
        label: ["Unchecked", ""],
        node: await drawCheckboxLabel(t, "Unchecked", "Remember me"),
      },
    ],
    260,
  );
  // Group — a labelled set of checkboxes
  const groupCol = autoFrame({ direction: "VERTICAL", gap: 14 });
  groupCol.appendChild(await makeText(t, "label/sm", "Notifications", "text/secondary"));
  groupCol.appendChild(await drawCheckboxLabel(t, "Checked", "Email"));
  groupCol.appendChild(await drawCheckboxLabel(t, "Checked", "SMS"));
  groupCol.appendChild(await drawCheckboxLabel(t, "Unchecked", "Push"));

  // Nested — parent (indeterminate) + indented children
  const nestedCol = autoFrame({ direction: "VERTICAL", gap: 12 });
  nestedCol.appendChild(await drawCheckboxLabel(t, "Indeterminate", "Select all fruits"));
  const kids = autoFrame({ direction: "VERTICAL", gap: 12, padding: { t: 0, r: 0, b: 0, l: 32 } });
  kids.appendChild(await drawCheckboxLabel(t, "Checked", "Apple"));
  kids.appendChild(await drawCheckboxLabel(t, "Checked", "Banana"));
  kids.appendChild(await drawCheckboxLabel(t, "Unchecked", "Cherry"));
  nestedCol.appendChild(kids);

  const groups = await tileGrid(
    t,
    [
      { label: ["Group", ""], node: groupCol },
      { label: ["Nested (select all)", "(select all)"], node: nestedCol },
    ],
    280,
  );

  const props: PropRow[] = [
    {
      prop: "checked",
      type: "boolean",
      def: "false",
      note: ["On/off value.", ""],
    },
    {
      prop: "indeterminate",
      type: "boolean",
      def: "false",
      note: ["Third, mixed state (parent).", ""],
    },
    { prop: "size", type: "sm|md|lg", def: "md", note: ["Box size.", ""] },
    { prop: "disabled", type: "boolean", def: "false", note: ["Non-interactive.", ""] },
    {
      prop: "label",
      type: "string",
      def: "—",
      note: ["Text beside the box.", ""],
    },
    {
      prop: "children",
      type: "Checkbox[]",
      def: "—",
      note: ["Nested options (select all).", "(select all)."],
    },
    {
      prop: "onChange",
      type: "(e,checked)=>void",
      def: "—",
      note: ["Fires on toggle.", ""],
    },
  ];
  return componentBoard(
    t,
    "Checkbox",
    ["Select none, one, or many from a list", ""],
    ["A single instant setting → use Switch", "→ Switch"],
    [
      await block(t, "States", statesM),
      await block(t, "Tones", cbTonesGrid),
      await block(t, "Sizes", sizes),
      await block(t, "Label", labels),
      await block(t, "Group & Nested", groups),
    ],
    props,
  );
}

async function inputActionBoard(t: ThemeContext): Promise<FrameNode> {
  const stateList: Array<[IaState, string, string?]> = [
    ["Default", ""],
    ["Hover", ""],
    ["Focus", ""],
    ["Filled", ""],
    ["Loading", "", "Talking to the server…"],
    ["Success", "", "Copied to clipboard"],
    ["Error", "", "That address doesn’t look right"],
    ["Readonly", ""],
    ["Disabled", ""],
  ];
  const states = await tileGrid(
    t,
    await Promise.all(
      stateList.map(async ([s, ru, message]) => ({
        label: [s, ru] as Bi,
        node: await drawInputAction(t, s, "md", "Copy", { message }),
      })),
    ),
    380,
  );

  // tones — the button carries the colour; feedback tones keep their own semantics
  const toneList: Array<[string, Bi]> = [
    ["accent/primary", ["Primary · teal", ""]],
    ["accent/dante", ["Dante", ""]],
    ["accent/secondary", ["Secondary · indigo", ""]],
    ["accent/violet", ["Violet", ""]],
    ["accent/ember", ["Ember", ""]],
    ["accent/ice", ["Ice", ""]],
    ["feedback/success", ["Success", ""]],
    ["feedback/warning", ["Warning", ""]],
    ["feedback/danger", ["Danger", ""]],
  ];
  const tones = await tileGrid(
    t,
    await Promise.all(
      toneList.map(async ([tk, label]) => ({
        label,
        node: await drawInputAction(t, "Filled", "md", "Copy", { tone: tk }),
      })),
    ),
    380,
  );

  // fills — the second colour axis: 9 tones × 5 fills
  const fillList: Array<[IaFill, Bi]> = [
    ["filled", ["Filled", ""]],
    ["soft", ["Soft · tinted wash", ""]],
    ["outline", ["Outline", ""]],
    ["gradient", ["Gradient", ""]],
    ["glass", ["Glass", ""]],
  ];
  const fills = await tileGrid(
    t,
    await Promise.all(
      fillList.map(async ([f, label]) => ({
        label,
        node: await drawInputAction(t, "Filled", "md", "Copy", { fill: f, tone: "accent/dante" }),
      })),
    ),
    380,
  );

  // the matrix that matters: every tone in every fill
  // three pills per row: six side by side would be ~1208 px against a 976 px canvas
  const matrixTones = toneList.slice(0, 6).map(([tk]) => tk);
  const matrixCol = autoFrame({ direction: "VERTICAL", gap: 18 });
  for (const [f, label] of fillList) {
    const group = autoFrame({ direction: "VERTICAL", gap: 8 });
    group.appendChild(await makeText(t, "label/sm", label[0], "text/secondary"));
    for (let i = 0; i < matrixTones.length; i += 3) {
      const row = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
      for (const tk of matrixTones.slice(i, i + 3)) {
        row.appendChild(
          await drawInputAction(t, "Filled", "sm", "Copy", {
            fill: f,
            tone: tk,
            valueW: 120,
            value: "a@b.dev",
          }),
        );
      }
      group.appendChild(row);
    }
    matrixCol.appendChild(group);
  }
  const matrix = canvas(t);
  matrix.appendChild(matrixCol);

  // section tone — what a component picks up when no tone is passed
  const mapCol = autoFrame({ direction: "VERTICAL", gap: 10 });
  mapCol.appendChild(
    await makeText(
      t,
      "caption",
      "No tone passed → the section’s tone is inherited (web: class / data-tone on the section).",
      "text/muted",
    ),
  );
  for (const [cls, tk] of Object.entries(SECTION_TONE).slice(0, 6)) {
    const line = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
    const dot = ellipse(10);
    dot.fills = [tokenAlpha(tk, 1)];
    line.appendChild(dot);
    line.appendChild(await makeText(t, "mono/sm", `.${cls}`, "text/secondary", { maxWidth: 120 }));
    line.appendChild(await makeText(t, "caption", tk, "text/muted", { maxWidth: 150 }));
    line.appendChild(
      await drawInputAction(t, "Filled", "sm", "Copy", { tone: tk, valueW: 120, value: "a@b.dev" }),
    );
    mapCol.appendChild(line);
  }
  const toneMap = canvas(t);
  toneMap.appendChild(mapCol);

  // the tone also drives the focus ring, not just the button
  const toneFocus = await tileGrid(
    t,
    await Promise.all(
      (["accent/primary", "accent/dante", "accent/secondary"] as const).map(async (tk) => ({
        label: [`Focus · ${tk.split("/")[1]}`, `· ${tk.split("/")[1]}`] as Bi,
        node: await drawInputAction(t, "Focus", "md", "Copy", { tone: tk }),
      })),
    ),
    380,
  );
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawInputAction(t, "Filled", "sm") },
      { label: SIZE_LABEL.md, node: await drawInputAction(t, "Filled", "md") },
      { label: SIZE_LABEL.lg, node: await drawInputAction(t, "Filled", "lg") },
    ],
    420,
  );
  const actions = await tileGrid(
    t,
    [
      { label: ["Copy", ""], node: await drawInputAction(t, "Filled", "md", "Copy") },
      {
        label: ["Subscribe", ""],
        node: await drawInputAction(t, "Default", "md", "Subscribe"),
      },
      { label: ["Send", ""], node: await drawInputAction(t, "Default", "md", "Send") },
    ],
    400,
  );
  const props: PropRow[] = [
    { prop: "value", type: "string", def: "''", note: ["Field value.", ""] },
    {
      prop: "placeholder",
      type: "string",
      def: "—",
      note: ["Empty-state hint.", ""],
    },
    {
      prop: "action",
      type: "string",
      def: "'Copy'",
      note: ["Inline button label.", "inline-."],
    },
    {
      prop: "actionIcon",
      type: "ReactNode",
      def: "arrow",
      note: ["Button trailing icon.", ""],
    },
    { prop: "size", type: "sm|md|lg", def: "md", note: ["Overall scale.", ""] },
    {
      prop: "state",
      type: "default|hover|focus|filled|loading|success|error|readonly|disabled",
      def: "default",
      note: ["Visual state.", ""],
    },
    {
      prop: "tone",
      type: "token",
      def: "section tone",
      note: ["9 tones; inherits the section’s.", ""],
    },
    {
      prop: "fill",
      type: "filled|soft|outline|gradient|glass",
      def: "filled",
      note: ["How the tone is carried.", ""],
    },
    {
      prop: "message",
      type: "string",
      def: "—",
      note: ["Caption under the pill (feedback).", ""],
    },
    {
      prop: "readonly",
      type: "boolean",
      def: "false",
      note: ["Value shown, action locked.", ""],
    },
    {
      prop: "loading",
      type: "boolean",
      def: "false",
      note: ["Spinner in the button.", ""],
    },
    {
      prop: "disabled",
      type: "boolean",
      def: "false",
      note: ["Blocks input & action.", ""],
    },
    {
      prop: "onAction",
      type: "()=>void",
      def: "—",
      note: ["Inline button handler.", ""],
    },
    {
      prop: "onChange",
      type: "(e)=>void",
      def: "—",
      note: ["Value change handler.", ""],
    },
  ];
  return componentBoard(
    t,
    "Input — Inline Action",
    ["Value + one inline action (copy, subscribe, send)", "+ inline- (, , )"],
    ["Several actions or a real form → TextField + Button", "→ TextField + Button"],
    [
      await block(t, "States", states),
      await block(t, "Tones", tones),
      await block(t, "Fills", fills),
      await block(t, "Tone × Fill", matrix),
      await block(t, "Section tone", toneMap),
      await block(t, "Tone focus", toneFocus),
      await block(t, "Sizes", sizes),
      await block(t, "Actions", actions),
    ],
    props,
  );
}

// ── Text Area ─────────────────────────────────────────────────
async function drawTextArea(
  t: ThemeContext,
  state: TfState,
  size: Size = "md",
  o: FieldCopy & { height?: number; hint?: string; count?: string } = {},
): Promise<FrameNode> {
  const sp = TF_SIZE[size];
  const W = o.width ?? 320;
  const H = o.height ?? 132;
  const col = autoFrame({ direction: "VERTICAL", gap: 7 });
  col.resize(W, col.height);
  col.counterAxisSizingMode = "FIXED";
  col.appendChild(await makeText(t, "label/sm", o.label ?? "Message", "text/secondary"));

  const field = autoFrame({ direction: "VERTICAL", gap: 8, padding: [sp.pad[0] + 2, sp.pad[1]] });
  field.layoutAlign = "STRETCH";
  field.primaryAxisSizingMode = "FIXED";
  field.cornerRadius = RADII.md;
  fillToken(t, field, "bg/surface");
  if (state === "Focus") {
    strokeToken(t, field, "state/focus", 1.5);
    await applyEffect(field, "glow/accent", t);
  } else if (state === "Error") {
    strokeToken(t, field, "feedback/danger", 1.5);
  } else {
    strokeToken(t, field, "border/default", 1);
  }
  const filled = state === "Filled" || state === "Error";
  const shown = filled
    ? (o.value ??
      "Hi Oleksii — loved your portfolio, the EQ and map work is gorgeous. Could we book a call next week?")
    : (o.placeholder ?? "Write your message…");
  field.appendChild(
    await makeText(t, sp.style, shown, filled ? "text/primary" : "text/muted", {
      maxWidth: W - sp.pad[1] * 2,
    }),
  );
  col.appendChild(field);
  field.resize(W, H);
  const grip = figma.createVector();
  grip.vectorPaths = [{ windingRule: "NONE", data: "M3 9 L9 3 M6 9 L9 6" }];
  grip.strokes = [boundSolid(colorVar(t, "text/muted"))];
  grip.strokeWeight = 1.5;
  grip.fills = [];
  field.appendChild(grip);
  grip.layoutPositioning = "ABSOLUTE";
  grip.x = W - 14;
  grip.y = H - 14;

  const foot = autoFrame({ direction: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER" });
  foot.resize(W, foot.height);
  foot.primaryAxisSizingMode = "FIXED";
  foot.counterAxisSizingMode = "AUTO";
  const hint =
    state === "Error" ? (o.errorHelper ?? "Message is too long") : (o.hint ?? "Markdown supported");
  foot.appendChild(
    await makeText(t, "caption", hint, state === "Error" ? "feedback/danger" : "text/muted", {
      maxWidth: W - 90,
    }),
  );
  foot.appendChild(
    await makeText(t, "caption", o.count ?? (filled ? "96 / 280" : "0 / 280"), "text/muted"),
  );
  col.appendChild(foot);
  if (state === "Disabled") col.opacity = 0.4;
  return col;
}

// A tokenised text area — values held as removable chips, wrapping across lines.
async function drawTagArea(t: ThemeContext): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 7 });
  col.resize(320, col.height);
  col.counterAxisSizingMode = "FIXED";
  col.appendChild(await makeText(t, "label/sm", "Skills", "text/secondary"));
  const field = autoFrame({ direction: "VERTICAL", gap: 10, padding: [10, 12] });
  field.layoutAlign = "STRETCH";
  field.primaryAxisSizingMode = "FIXED";
  field.cornerRadius = RADII.md;
  fillToken(t, field, "bg/surface");
  strokeToken(t, field, "state/focus", 1.5);
  await applyEffect(field, "glow/accent", t);
  const chips = autoFrame({ direction: "HORIZONTAL", gap: 8, wrap: true, cross: "MIN" });
  chips.resize(320 - 24, chips.height); // field inner width → enables wrapping
  chips.primaryAxisSizingMode = "FIXED";
  chips.counterAxisSizingMode = "AUTO";
  chips.counterAxisSpacing = 8;
  const tag = async (label: string): Promise<FrameNode> => {
    const c = autoFrame({
      direction: "HORIZONTAL",
      gap: 6,
      cross: "CENTER",
      padding: [4, 5],
    });
    c.cornerRadius = RADII.full;
    fillToken(t, c, "bg/inset");
    strokeToken(t, c, "border/subtle", 1);
    c.appendChild(await makeText(t, "caption", label, "text/primary"));
    c.appendChild(icon(t, "x", 12, "text/muted"));
    return c;
  };
  for (const s of ["Figma", "TypeScript", "Design systems", "Motion", "Leaflet"])
    chips.appendChild(await tag(s));
  chips.appendChild(await makeText(t, "body/sm", "Add skill…", "text/muted"));
  field.appendChild(chips);
  col.appendChild(field);
  field.resize(320, 124);
  const grip = figma.createVector();
  grip.vectorPaths = [{ windingRule: "NONE", data: "M3 9 L9 3 M6 9 L9 6" }];
  grip.strokes = [boundSolid(colorVar(t, "text/muted"))];
  grip.strokeWeight = 1.5;
  grip.fills = [];
  field.appendChild(grip);
  grip.layoutPositioning = "ABSOLUTE";
  grip.x = 320 - 14;
  grip.y = 124 - 14;
  const foot = autoFrame({ direction: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER" });
  foot.resize(320, foot.height);
  foot.primaryAxisSizingMode = "FIXED";
  foot.counterAxisSizingMode = "AUTO";
  foot.appendChild(await makeText(t, "caption", "Type & press Enter", "text/muted"));
  foot.appendChild(await makeText(t, "caption", "5 tags", "text/muted"));
  col.appendChild(foot);
  return col;
}

async function textAreaBoard(t: ThemeContext): Promise<FrameNode> {
  const states = await tileGrid(
    t,
    [
      { label: ["Default", ""], node: await drawTextArea(t, "Default") },
      { label: ["Focus", ""], node: await drawTextArea(t, "Focus") },
      { label: ["Filled", ""], node: await drawTextArea(t, "Filled") },
      { label: ["Error", ""], node: await drawTextArea(t, "Error") },
      { label: ["Disabled", ""], node: await drawTextArea(t, "Disabled") },
    ],
    340,
  );
  const props: PropRow[] = [
    { prop: "value", type: "string", def: "—", note: ["Multi-line text.", ""] },
    {
      prop: "rows / autosize",
      type: "number | boolean",
      def: "3",
      note: ["Min rows or grow with content.", ""],
    },
    {
      prop: "maxLength",
      type: "number",
      def: "—",
      note: ["Char limit + counter.", ""],
    },
    {
      prop: "resize",
      type: "none | vertical | both",
      def: "vertical",
      note: ["Manual resize handle.", ""],
    },
    {
      prop: "state",
      type: "default | focus | error | disabled",
      def: "default",
      note: ["Visual state.", ""],
    },
  ];
  const tagCanvas = canvas(t);
  tagCanvas.appendChild(await drawTagArea(t));
  return componentBoard(
    t,
    "Text Area",
    ["Multi-line free text", ""],
    ["A single value → use Text Field", "→ Text Field"],
    [await block(t, "States", states), await block(t, "With chips", tagCanvas)],
    props,
  );
}

// ── Rich text editor (WYSIWYG) ────────────────────────────────
type RteState = "Default" | "Focus" | "Filled" | "Error" | "Disabled" | "Readonly";

interface ToolBtn {
  icon?: string;
  text?: string;
  active?: boolean;
  disabled?: boolean;
  caret?: boolean;
}

/** One toolbar control — icon or short label, optional active pill and caret. */
async function rteTool(t: ThemeContext, o: ToolBtn, tone = sectionTone()): Promise<FrameNode> {
  const b = autoFrame({
    direction: "HORIZONTAL",
    gap: 4,
    align: "CENTER",
    cross: "CENTER",
    padding: o.text ? [6, 9] : 6,
    name: "rte/tool",
  });
  b.cornerRadius = RADII.sm;
  const tk = o.disabled ? "text/muted" : o.active ? tone : "text/secondary";
  if (o.active) {
    b.fills = [tokenAlpha(tone, 0.16)];
    strokeToken(t, b, tone, 1);
  }
  if (o.icon) b.appendChild(icon(t, o.icon, 16, tk));
  if (o.text) b.appendChild(await makeText(t, "label/sm", o.text, tk));
  if (o.caret) b.appendChild(icon(t, "chevron-down", 14, "text/muted"));
  if (o.disabled) b.opacity = 0.4;
  return b;
}

function rteSep(t: ThemeContext): RectangleNode {
  const r = rect(1, 18);
  fillToken(t, r, "border/subtle");
  return r;
}

async function rteGroup(t: ThemeContext, items: ToolBtn[], tone: string): Promise<FrameNode> {
  const g = autoFrame({ direction: "HORIZONTAL", gap: 2, cross: "CENTER", name: "rte/group" });
  for (const it of items) g.appendChild(await rteTool(t, it, tone));
  return g;
}

/** The formatting bar. `compact` drops the block-type select and the insert group. */
async function rteToolbar(
  t: ThemeContext,
  w: number,
  o: { compact?: boolean; tone?: string } = {},
): Promise<FrameNode> {
  const tone = o.tone ?? sectionTone();
  const bar = autoFrame({
    direction: "HORIZONTAL",
    align: "SPACE_BETWEEN",
    cross: "CENTER",
    gap: 8,
    padding: [8, 10],
    name: "rte/toolbar",
  });
  bar.resize(w, bar.height);
  bar.primaryAxisSizingMode = "FIXED";
  bar.counterAxisSizingMode = "AUTO";
  bar.layoutAlign = "STRETCH";
  fillToken(t, bar, "bg/surface-raised");

  const left = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", wrap: !o.compact });
  if (!o.compact) {
    left.appendChild(await rteTool(t, { text: "Paragraph", caret: true }, tone));
    left.appendChild(rteSep(t));
  }
  left.appendChild(
    await rteGroup(
      t,
      [{ icon: "bold", active: true }, { icon: "italic" }, { icon: "underline" }, { icon: "code" }],
      tone,
    ),
  );
  left.appendChild(rteSep(t));
  left.appendChild(
    await rteGroup(
      t,
      [{ icon: "link" }, { icon: "list" }, { icon: "hash" }, { icon: "message-square" }],
      tone,
    ),
  );
  if (!o.compact) {
    left.appendChild(rteSep(t));
    left.appendChild(
      await rteGroup(
        t,
        [{ icon: "image" }, { icon: "grid" }, { icon: "paperclip" }, { icon: "minus" }],
        tone,
      ),
    );
  }
  bar.appendChild(left);

  const right = autoFrame({ direction: "HORIZONTAL", gap: 2, cross: "CENTER" });
  right.appendChild(await rteTool(t, { icon: "rotate-ccw", disabled: true }, tone));
  right.appendChild(await rteTool(t, { icon: "refresh-cw" }, tone));
  if (!o.compact) right.appendChild(await rteTool(t, { icon: "more-horizontal" }, tone));
  bar.appendChild(right);
  return bar;
}

// ── document blocks ───────────────────────────────────────────
async function rteListRow(
  t: ThemeContext,
  marker: string,
  text: string,
  w: number,
  tone?: string,
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "MIN" });
  const m = fixedCol(18, "HORIZONTAL");
  m.appendChild(await makeText(t, "body/sm", marker, tone ?? "text/muted"));
  row.appendChild(m);
  row.appendChild(await makeText(t, "body/sm", text, "text/secondary", { maxWidth: w - 28 }));
  return row;
}

async function rteCheckRow(
  t: ThemeContext,
  text: string,
  done: boolean,
  w: number,
  tone: string,
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "MIN" });
  const box = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  box.resize(16, 16);
  box.primaryAxisSizingMode = "FIXED";
  box.counterAxisSizingMode = "FIXED";
  box.cornerRadius = 4;
  if (done) {
    box.fills = [tokenAlpha(tone, 0.9)];
    box.appendChild(icon(t, "check", 12, "text/inverse"));
  } else {
    strokeToken(t, box, "border/strong", 1);
  }
  row.appendChild(box);
  row.appendChild(
    await makeText(t, "body/sm", text, done ? "text/muted" : "text/secondary", {
      maxWidth: w - 30,
    }),
  );
  return row;
}

async function rteQuote(
  t: ThemeContext,
  text: string,
  w: number,
  tone: string,
): Promise<FrameNode> {
  const q = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "MIN", name: "rte/quote" });
  const bar = rect(2, 1, 1);
  bar.fills = [tokenAlpha(tone, 0.8)];
  bar.layoutAlign = "STRETCH";
  q.appendChild(bar);
  q.appendChild(await makeText(t, "body/sm", text, "text/muted", { maxWidth: w - 24 }));
  return q;
}

async function rteCode(t: ThemeContext, lines: string[], w: number): Promise<FrameNode> {
  const c = autoFrame({ direction: "VERTICAL", gap: 2, padding: [10, 12], name: "rte/code" });
  c.resize(w, c.height);
  c.counterAxisSizingMode = "FIXED";
  c.cornerRadius = RADII.sm;
  fillToken(t, c, "bg/inset");
  strokeToken(t, c, "border/subtle", 1);
  for (const ln of lines)
    c.appendChild(await makeText(t, "mono/sm", ln, "text/secondary", { maxWidth: w - 24 }));
  return c;
}

async function rteCallout(
  t: ThemeContext,
  text: string,
  w: number,
  tone: string,
): Promise<FrameNode> {
  const c = autoFrame({
    direction: "HORIZONTAL",
    gap: 10,
    cross: "MIN",
    padding: [10, 12],
    name: "rte/callout",
  });
  c.resize(w, c.height);
  c.counterAxisSizingMode = "FIXED";
  c.cornerRadius = RADII.sm;
  c.fills = [tokenAlpha(tone, 0.1)];
  c.appendChild(icon(t, "info", 16, tone));
  c.appendChild(await makeText(t, "body/sm", text, "text/secondary", { maxWidth: w - 46 }));
  return c;
}

function rteImage(t: ThemeContext, w: number, h: number): FrameNode {
  const f = autoFrame({
    direction: "VERTICAL",
    gap: 6,
    align: "CENTER",
    cross: "CENTER",
    name: "rte/image",
  });
  f.resize(w, h);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = RADII.sm;
  fillToken(t, f, "bg/inset");
  strokeToken(t, f, "border/subtle", 1);
  f.dashPattern = [5, 4];
  f.appendChild(icon(t, "image", 20, "text/muted"));
  return f;
}

function rteTable(t: ThemeContext, w: number): FrameNode {
  const cols = 3;
  const rows = 3;
  const cellW = Math.floor(w / cols);
  const grid = autoFrame({ direction: "VERTICAL", gap: 0, name: "rte/table" });
  for (let r = 0; r < rows; r++) {
    const line = autoFrame({ direction: "HORIZONTAL", gap: 0 });
    for (let c = 0; c < cols; c++) {
      const cell = autoFrame({ direction: "HORIZONTAL", padding: [8, 10] });
      cell.resize(cellW, 30);
      cell.primaryAxisSizingMode = "FIXED";
      cell.counterAxisSizingMode = "FIXED";
      strokeToken(t, cell, "border/subtle", 1);
      if (r === 0) fillToken(t, cell, "bg/surface-raised");
      else {
        const fill = rect(cellW - 34, 6, 3);
        fillToken(t, fill, "border/default");
        cell.appendChild(fill);
      }
      line.appendChild(cell);
    }
    grid.appendChild(line);
  }
  return grid;
}

/** A short document — the thing the editor actually renders. */
async function rteDoc(
  t: ThemeContext,
  w: number,
  tone: string,
  o: { short?: boolean; placeholder?: boolean } = {},
): Promise<FrameNode> {
  const doc = autoFrame({ direction: "VERTICAL", gap: 12, name: "rte/doc" });
  doc.resize(w, doc.height);
  doc.counterAxisSizingMode = "FIXED";
  if (o.placeholder) {
    doc.appendChild(
      await makeText(t, "body/md", "Write something…  press “/” for blocks", "text/muted", {
        maxWidth: w,
      }),
    );
    return doc;
  }
  doc.appendChild(
    await makeText(t, "heading/h4", "Design review — Q3", "text/primary", { maxWidth: w }),
  );
  doc.appendChild(
    await makeText(
      t,
      "body/sm",
      "The catalog now covers inputs, overlays and data display. Remaining gaps are listed below, with owners.",
      "text/secondary",
      { maxWidth: w },
    ),
  );
  if (o.short) return doc;
  doc.appendChild(await rteListRow(t, "•", "Rich editor — toolbar, blocks, slash menu", w, tone));
  doc.appendChild(await rteListRow(t, "•", "Table cell states — sorting and selection", w, tone));
  doc.appendChild(await rteQuote(t, "Ship the primitives first; the templates follow.", w, tone));
  doc.appendChild(await rteCode(t, ["<Editor value={doc} onChange={setDoc} />"], w));
  return doc;
}

async function drawRichEditor(
  t: ThemeContext,
  o: {
    state?: RteState;
    w?: number;
    h?: number;
    compact?: boolean;
    tone?: string;
    label?: string;
  } = {},
): Promise<FrameNode> {
  const tone = o.tone ?? sectionTone();
  const state = o.state ?? "Filled";
  const W = o.w ?? 600;
  const H = o.h ?? 260;
  const col = autoFrame({ direction: "VERTICAL", gap: 7, name: `rich-editor/${state}` });
  col.resize(W, col.height);
  col.counterAxisSizingMode = "FIXED";
  col.appendChild(await makeText(t, "label/sm", o.label ?? "Description", "text/secondary"));

  const shell = autoFrame({ direction: "VERTICAL", gap: 0, clip: true, name: "rte/shell" });
  shell.layoutAlign = "STRETCH";
  shell.primaryAxisSizingMode = "FIXED";
  shell.cornerRadius = RADII.md;
  fillToken(t, shell, state === "Readonly" ? "bg/inset" : "bg/surface");
  if (state === "Focus") {
    strokeToken(t, shell, "state/focus", 1.5);
    await applyEffect(shell, "glow/accent", t);
  } else if (state === "Error") {
    strokeToken(t, shell, "feedback/danger", 1.5);
  } else {
    strokeToken(t, shell, "border/default", 1);
  }

  if (state !== "Readonly") {
    shell.appendChild(await rteToolbar(t, W, { compact: o.compact, tone }));
    shell.appendChild(hairline(t, W));
  }

  const pad = autoFrame({ direction: "VERTICAL", gap: 0, padding: 16, name: "rte/content" });
  pad.layoutAlign = "STRETCH";
  pad.primaryAxisSizingMode = "FIXED";
  pad.clipsContent = true;
  const innerW = W - 32;
  pad.appendChild(
    await rteDoc(t, innerW, tone, { short: o.compact, placeholder: state === "Default" }),
  );
  shell.appendChild(pad);
  col.appendChild(shell);
  shell.resize(W, H);

  const foot = autoFrame({
    direction: "HORIZONTAL",
    align: "SPACE_BETWEEN",
    cross: "CENTER",
    padding: [8, 12],
    name: "rte/footer",
  });
  foot.resize(W, foot.height);
  foot.primaryAxisSizingMode = "FIXED";
  foot.counterAxisSizingMode = "AUTO";
  foot.layoutAlign = "STRETCH";
  fillToken(t, foot, "bg/inset");
  foot.appendChild(
    await makeText(
      t,
      "caption",
      state === "Readonly" ? "Read-only" : "Markdown & ⌘B ⌘I ⌘K",
      "text/muted",
    ),
  );
  const meta = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  meta.appendChild(await makeText(t, "caption", "248 words", "text/muted"));
  if (state !== "Readonly") {
    const dot = ellipse(6);
    dot.fills = [tokenAlpha(state === "Error" ? "feedback/danger" : "feedback/success", 1)];
    meta.appendChild(dot);
    meta.appendChild(
      await makeText(t, "caption", state === "Error" ? "Not saved" : "Saved", "text/muted"),
    );
  }
  foot.appendChild(meta);
  shell.appendChild(foot);
  foot.layoutPositioning = "ABSOLUTE";
  foot.x = 0;
  foot.y = H - foot.height;

  col.appendChild(
    await makeText(
      t,
      "caption",
      state === "Error" ? "Content exceeds 5 000 characters" : "Rich text · saved as HTML",
      state === "Error" ? "feedback/danger" : "text/muted",
    ),
  );
  if (state === "Disabled") col.opacity = 0.4;
  return col;
}

/** Floating format bar shown over a selection. */
async function rteBubbleMenu(t: ThemeContext, tone: string): Promise<FrameNode> {
  const wrap = autoFrame({ direction: "VERTICAL", gap: 0, cross: "MIN", name: "rte/bubble-wrap" });
  const bar = autoFrame({ direction: "HORIZONTAL", gap: 2, cross: "CENTER", padding: [6, 8] });
  bar.cornerRadius = RADII.full;
  fillToken(t, bar, "bg/surface-raised");
  strokeToken(t, bar, "border/default", 1);
  await applyEffect(bar, "shadow/lg", t);
  for (const it of [
    { icon: "bold", active: true },
    { icon: "italic" },
    { icon: "underline" },
    { icon: "link" },
    { icon: "code" },
  ] as ToolBtn[]) {
    bar.appendChild(await rteTool(t, it, tone));
  }
  bar.appendChild(rteSep(t));
  bar.appendChild(await rteTool(t, { text: "H2", caret: true }, tone));
  wrap.appendChild(bar);

  const tail = figma.createVector();
  tail.vectorPaths = [{ windingRule: "NONZERO", data: "M0 0 L12 0 L6 6 Z" }];
  fillToken(t, tail, "bg/surface-raised");
  wrap.appendChild(tail);
  tail.layoutPositioning = "ABSOLUTE";
  tail.x = 26;
  tail.y = bar.height - 1;

  const line = autoFrame({ direction: "HORIZONTAL", gap: 0, cross: "CENTER" });
  line.paddingTop = 16;
  line.appendChild(await makeText(t, "body/sm", "Ship the ", "text/secondary"));
  const selected = autoFrame({ direction: "HORIZONTAL", padding: [1, 3] });
  selected.cornerRadius = 3;
  selected.fills = [tokenAlpha(tone, 0.28)];
  selected.appendChild(await makeText(t, "body/sm", "primitives first", "text/primary"));
  line.appendChild(selected);
  line.appendChild(await makeText(t, "body/sm", " — templates follow.", "text/secondary"));
  wrap.appendChild(line);
  return wrap;
}

/** "/" insert menu — the block picker. */
async function rteSlashMenu(t: ThemeContext, tone: string): Promise<FrameNode> {
  const W = 300;
  const menu = autoFrame({ direction: "VERTICAL", gap: 2, padding: 8, name: "rte/slash-menu" });
  menu.resize(W, menu.height);
  menu.counterAxisSizingMode = "FIXED";
  menu.cornerRadius = RADII.md;
  fillToken(t, menu, "bg/surface-raised");
  strokeToken(t, menu, "border/default", 1);

  const query = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [6, 8] });
  query.layoutAlign = "STRETCH";
  query.appendChild(await makeText(t, "mono/sm", "/", tone));
  query.appendChild(await makeText(t, "body/sm", "list", "text/primary"));
  menu.appendChild(query);
  menu.appendChild(hairline(t, W - 16));

  const rows: Array<[string, string, string, boolean]> = [
    ["type", "Heading 2", "##", false],
    ["list", "Bulleted list", "-", true],
    ["hash", "Numbered list", "1.", false],
    ["check", "To-do list", "[]", false],
    ["message-square", "Quote", ">", false],
    ["code", "Code block", "```", false],
    ["grid", "Table", "⌘T", false],
    ["image", "Image", "⌘P", false],
  ];
  for (const [ic, label, kbd, active] of rows) {
    const r = autoFrame({
      direction: "HORIZONTAL",
      gap: 10,
      cross: "CENTER",
      align: "SPACE_BETWEEN",
      padding: [7, 8],
    });
    r.layoutAlign = "STRETCH";
    r.primaryAxisSizingMode = "FIXED";
    r.cornerRadius = RADII.sm;
    if (active) r.fills = [tokenAlpha(tone, 0.14)];
    const lhs = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
    lhs.appendChild(icon(t, ic, 16, active ? tone : "text/muted"));
    lhs.appendChild(
      await makeText(t, "body/sm", label, active ? "text/primary" : "text/secondary"),
    );
    r.appendChild(lhs);
    r.appendChild(await makeText(t, "mono/sm", kbd, "text/muted"));
    menu.appendChild(r);
  }
  return menu;
}

async function richEditorBoard(t: ThemeContext): Promise<FrameNode> {
  const tone = sectionTone();

  const full = canvas(t);
  const fullRow = autoFrame({ direction: "HORIZONTAL", gap: 32, cross: "MIN" });
  fullRow.appendChild(await drawRichEditor(t, { state: "Filled", w: 600, h: 280 }));
  const notes = fixedCol(300);
  notes.itemSpacing = 14;
  for (const [head, ru] of [
    ["Toolbar", ""],
    ["Content", ""],
    ["Footer", ""],
  ] as Bi[]) {
    const n = autoFrame({ direction: "VERTICAL", gap: 2 });
    n.appendChild(await makeText(t, "label/sm", head, "text/primary", { maxWidth: 300 }));
    n.appendChild(await makeText(t, "caption", ru, "text/muted", { maxWidth: 300 }));
    notes.appendChild(n);
  }
  fullRow.appendChild(notes);
  full.appendChild(fullRow);

  const states = await tileGrid(
    t,
    [
      {
        label: ["Empty · placeholder", ""],
        node: await drawRichEditor(t, { state: "Default", w: 290, h: 150, compact: true }),
      },
      {
        label: ["Focus", ""],
        node: await drawRichEditor(t, { state: "Focus", w: 290, h: 150, compact: true }),
      },
      {
        label: ["Filled", ""],
        node: await drawRichEditor(t, { state: "Filled", w: 290, h: 150, compact: true }),
      },
      {
        label: ["Error", ""],
        node: await drawRichEditor(t, { state: "Error", w: 290, h: 150, compact: true }),
      },
      {
        label: ["Disabled", ""],
        node: await drawRichEditor(t, { state: "Disabled", w: 290, h: 150, compact: true }),
      },
      {
        label: ["Read-only", ""],
        node: await drawRichEditor(t, { state: "Readonly", w: 290, h: 150, compact: true }),
      },
    ],
    300,
  );

  const blocksW = 210;
  const blocks = await tileGrid(
    t,
    [
      {
        label: ["Heading", ""],
        node: await makeText(t, "heading/h4", "Design review", "text/primary", {
          maxWidth: blocksW,
        }),
      },
      {
        label: ["Paragraph", ""],
        node: await makeText(
          t,
          "body/sm",
          "Plain body copy with a sensible measure.",
          "text/secondary",
          { maxWidth: blocksW },
        ),
      },
      {
        label: ["Bulleted list", ""],
        node: await rteListRow(t, "•", "Toolbar, blocks, slash menu", blocksW, tone),
      },
      {
        label: ["Numbered list", ""],
        node: await rteListRow(t, "1.", "Draft, review, publish", blocksW, tone),
      },
      {
        label: ["To-do", ""],
        node: await rteCheckRow(t, "Ship the primitives", true, blocksW, tone),
      },
      {
        label: ["Quote", ""],
        node: await rteQuote(t, "Primitives first, templates second.", blocksW, tone),
      },
      { label: ["Code", ""], node: await rteCode(t, ["const doc = parse(html)"], blocksW) },
      {
        label: ["Callout", ""],
        node: await rteCallout(t, "Autosaves every 5 s.", blocksW, tone),
      },
      { label: ["Image", ""], node: rteImage(t, blocksW, 84) },
      { label: ["Table", ""], node: rteTable(t, blocksW) },
    ],
    blocksW,
  );

  const menus = canvas(t);
  const menuRow = autoFrame({ direction: "HORIZONTAL", gap: 64, cross: "MIN" });
  const bubbleCol = autoFrame({ direction: "VERTICAL", gap: 12 });
  bubbleCol.appendChild(await overline(t, "Bubble menu"));
  bubbleCol.appendChild(await rteBubbleMenu(t, tone));
  const slashCol = autoFrame({ direction: "VERTICAL", gap: 12 });
  slashCol.appendChild(await overline(t, "Slash menu"));
  slashCol.appendChild(await rteSlashMenu(t, tone));
  menuRow.appendChild(bubbleCol);
  menuRow.appendChild(slashCol);
  menus.appendChild(menuRow);

  const props: PropRow[] = [
    {
      prop: "value",
      type: "string | JSONContent",
      def: "—",
      note: ["Document, HTML or JSON.", ": HTML JSON."],
    },
    {
      prop: "format",
      type: "html | markdown | json",
      def: "html",
      note: ["Serialisation of value.", ""],
    },
    {
      prop: "toolbar",
      type: "full | compact | bubble | none",
      def: "full",
      note: ["Which bar is shown.", ""],
    },
    {
      prop: "blocks",
      type: "BlockType[]",
      def: "all",
      note: ["Allowed block types.", ""],
    },
    {
      prop: "marks",
      type: "bold | italic | underline | code | link",
      def: "all",
      note: ["Allowed inline marks.", ""],
    },
    {
      prop: "slashMenu",
      type: "boolean",
      def: "true",
      note: ["“/” opens the block picker.", ""],
    },
    {
      prop: "placeholder",
      type: "string",
      def: "Write something…",
      note: ["Empty-document hint.", ""],
    },
    {
      prop: "maxLength",
      type: "number",
      def: "—",
      note: ["Limit + word counter.", ""],
    },
    {
      prop: "autosave",
      type: "number (ms) | false",
      def: "5000",
      note: ["Save status in the footer.", ""],
    },
    {
      prop: "readonly",
      type: "boolean",
      def: "false",
      note: ["Renders the document only.", ""],
    },
    {
      prop: "state",
      type: "default | focus | error | disabled",
      def: "default",
      note: ["Visual state.", ""],
    },
  ];

  return componentBoard(
    t,
    "Rich Editor",
    ["Formatted long-form content — posts, briefs, docs", ""],
    ["Plain notes or a single value → Text Area", "→ Text Area"],
    [
      await block(t, "Anatomy", full),
      await block(t, "States", states),
      await block(t, "Blocks", blocks),
      await block(t, "Menus", menus),
    ],
    props,
  );
}

// ── Date / Date-time field ────────────────────────────────────
async function drawDateField(
  t: ThemeContext,
  kind: "date" | "datetime" | "range",
  state: TfState = "Filled",
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 7 });
  col.resize(300, col.height);
  col.counterAxisSizingMode = "FIXED";
  const labels: Record<string, string> = {
    date: "Date",
    datetime: "Date & time",
    range: "Date range",
  };
  col.appendChild(await makeText(t, "label/sm", labels[kind], "text/secondary"));

  const field = autoFrame({
    direction: "HORIZONTAL",
    align: "SPACE_BETWEEN",
    cross: "CENTER",
    padding: [12, 14],
  });
  field.layoutAlign = "STRETCH";
  field.primaryAxisSizingMode = "FIXED";
  field.cornerRadius = RADII.md;
  fillToken(t, field, "bg/surface");
  if (state === "Focus") {
    strokeToken(t, field, "state/focus", 1.5);
    await applyEffect(field, "glow/accent", t);
  } else if (state === "Error") {
    strokeToken(t, field, "feedback/danger", 1.5);
  } else {
    strokeToken(t, field, "border/default", 1);
  }
  const values: Record<string, string> = {
    date: "12 Aug 2024",
    datetime: "12 Aug 2024 · 14:30",
    range: "12 – 20 Aug 2024",
  };
  const filled = state !== "Default";
  field.appendChild(
    await makeText(
      t,
      "body/md",
      filled ? values[kind] : "Select…",
      filled ? "text/primary" : "text/muted",
    ),
  );
  const icons = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  icons.appendChild(icon(t, "calendar", 16, "text/muted"));
  if (kind === "datetime") icons.appendChild(icon(t, "clock", 16, "text/muted"));
  field.appendChild(icons);
  col.appendChild(field);

  col.appendChild(
    await makeText(
      t,
      "caption",
      state === "Error" ? "Pick a valid date" : "MMM D, YYYY",
      state === "Error" ? "feedback/danger" : "text/muted",
    ),
  );
  if (state === "Disabled") col.opacity = 0.4;
  return col;
}

async function dateFieldBoard(t: ThemeContext): Promise<FrameNode> {
  const kinds = await tileGrid(
    t,
    [
      { label: ["Date", ""], node: await drawDateField(t, "date") },
      { label: ["Date & time", ""], node: await drawDateField(t, "datetime") },
      { label: ["Range", ""], node: await drawDateField(t, "range") },
    ],
    330,
  );
  const states = await tileGrid(
    t,
    [
      { label: ["Default", ""], node: await drawDateField(t, "date", "Default") },
      { label: ["Focus", ""], node: await drawDateField(t, "date", "Focus") },
      { label: ["Error", ""], node: await drawDateField(t, "date", "Error") },
      { label: ["Disabled", ""], node: await drawDateField(t, "date", "Disabled") },
    ],
    330,
  );
  const props: PropRow[] = [
    {
      prop: "type",
      type: "date | datetime | range",
      def: "date",
      note: ["What the field captures.", ""],
    },
    {
      prop: "value",
      type: "Date | [Date, Date]",
      def: "—",
      note: ["Selected date(s).", ""],
    },
    {
      prop: "format",
      type: "string",
      def: "MMM D, YYYY",
      note: ["Display mask.", ""],
    },
    { prop: "min / max", type: "Date", def: "—", note: ["Allowed range.", ""] },
    {
      prop: "state",
      type: "default | focus | error | disabled",
      def: "default",
      note: ["Visual state.", ""],
    },
    {
      prop: "picker",
      type: "Calendar | TimePicker",
      def: "—",
      note: ["Popover on focus (see those).", ""],
    },
  ];
  return componentBoard(
    t,
    "Date Field",
    ["Typed / picked dates & times", ""],
    ["Free calendar browsing → use Calendar", "→ Calendar"],
    [await block(t, "Kinds", kinds), await block(t, "States", states)],
    props,
  );
}

// ── Segmented / Toggle group ──────────────────────────────────
interface SegItem {
  label?: string;
  icon?: string;
  active?: boolean;
}
async function drawSegmented(
  t: ThemeContext,
  items: SegItem[],
  tone = "accent/primary",
): Promise<FrameNode> {
  const seg = autoFrame({ direction: "HORIZONTAL", gap: 4, cross: "CENTER", padding: 4 });
  seg.cornerRadius = RADII.full;
  fillToken(t, seg, "bg/inset");
  for (const it of items) {
    const p = autoFrame({
      direction: "HORIZONTAL",
      gap: 7,
      align: "CENTER",
      cross: "CENTER",
      padding: [7, 14],
    });
    p.cornerRadius = RADII.full;
    if (it.active) {
      if (tone === "accent/primary") {
        fillToken(t, p, "bg/surface-raised");
        await applyEffect(p, "shadow/xs", t);
      } else p.fills = [tokenAlpha(tone, 0.16)];
    }
    if (it.icon) p.appendChild(icon(t, it.icon, 15, it.active ? tone : "text/muted"));
    if (it.label)
      p.appendChild(
        await makeText(
          t,
          "label/sm",
          it.label,
          it.active ? (tone === "accent/primary" ? "text/primary" : tone) : "text/muted",
        ),
      );
    seg.appendChild(p);
  }
  return seg;
}

async function segmentedBoard(t: ThemeContext): Promise<FrameNode> {
  const single = await tileGrid(
    t,
    [
      {
        label: ["Range", ""],
        node: await drawSegmented(t, [
          { label: "Day" },
          { label: "Week", active: true },
          { label: "Month" },
        ]),
      },
      {
        label: ["View", ""],
        node: await drawSegmented(t, [
          { icon: "list", label: "List", active: true },
          { icon: "grid", label: "Board" },
          { icon: "calendar", label: "Calendar" },
        ]),
      },
    ],
    320,
  );
  const toggle = await tileGrid(
    t,
    [
      {
        label: ["Text style (multi)", ""],
        node: await drawSegmented(t, [
          { icon: "bold", active: true },
          { icon: "italic", active: true },
          { icon: "underline" },
        ]),
      },
      {
        label: ["Icon single", ""],
        node: await drawSegmented(t, [{ icon: "grid", active: true }, { icon: "list" }]),
      },
    ],
    240,
  );
  const segTones = await tileGrid(
    t,
    [
      {
        label: ["Dante", ""],
        node: await drawSegmented(
          t,
          [{ label: "Day" }, { label: "Week", active: true }, { label: "Month" }],
          "accent/dante",
        ),
      },
      {
        label: ["Indigo", ""],
        node: await drawSegmented(
          t,
          [
            { icon: "list", label: "List", active: true },
            { icon: "grid", label: "Board" },
          ],
          "accent/secondary",
        ),
      },
    ],
    320,
  );
  const props: PropRow[] = [
    {
      prop: "items",
      type: "{ label?, icon?, value }[]",
      def: "—",
      note: ["Segment options.", ""],
    },
    {
      prop: "value",
      type: "string | string[]",
      def: "—",
      note: ["Selected (array if multi).", ""],
    },
    {
      prop: "type",
      type: "single | multiple",
      def: "single",
      note: ["One or many active.", ""],
    },
    { prop: "size", type: "sm | md | lg", def: "md", note: ["Control size.", ""] },
  ];
  return componentBoard(
    t,
    "Segmented / Toggle",
    ["Pick among a few equal options", ""],
    ["Many options → use Select / Tabs", "→ Select / Tabs"],
    [
      await block(t, "Segmented (single)", single),
      await block(t, "Toggle group", toggle),
      await block(t, "Tones", segTones),
    ],
    props,
  );
}

// ── Number input ──────────────────────────────────────────────
async function drawNumber(
  t: ThemeContext,
  variant: "stepper" | "chevrons",
  state: TfState = "Default",
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 7 });
  col.resize(210, col.height);
  col.counterAxisSizingMode = "FIXED";
  col.appendChild(await makeText(t, "label/sm", "Quantity", "text/secondary"));
  const field = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
  field.layoutAlign = "STRETCH";
  field.primaryAxisSizingMode = "FIXED";
  field.cornerRadius = RADII.md;
  field.clipsContent = true;
  fillToken(t, field, "bg/surface");
  if (state === "Focus") {
    strokeToken(t, field, "state/focus", 1.5);
    await applyEffect(field, "glow/accent", t);
  } else if (state === "Error") {
    strokeToken(t, field, "feedback/danger", 1.5);
  } else {
    strokeToken(t, field, "border/default", 1);
  }
  const stepBtn = (ic: string): FrameNode => {
    const b = autoFrame({
      direction: "HORIZONTAL",
      align: "CENTER",
      cross: "CENTER",
      padding: [11, 13],
    });
    b.appendChild(icon(t, ic, 15, "text/secondary"));
    return b;
  };
  if (variant === "stepper") {
    field.appendChild(stepBtn("minus"));
    const vw = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    vw.layoutGrow = 1;
    vw.appendChild(await makeText(t, "body/md", "12", "text/primary"));
    field.appendChild(vw);
    field.appendChild(stepBtn("plus"));
  } else {
    const vw = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", padding: [12, 14] });
    vw.layoutGrow = 1;
    vw.appendChild(await makeText(t, "body/md", "12", "text/primary"));
    field.appendChild(vw);
    const st = autoFrame({ direction: "VERTICAL", gap: 0 });
    const chev = (ic: string): FrameNode => {
      const b = autoFrame({
        direction: "HORIZONTAL",
        align: "CENTER",
        cross: "CENTER",
        padding: [3, 10],
      });
      b.appendChild(icon(t, ic, 12, "text/muted"));
      return b;
    };
    st.appendChild(chev("chevron-up"));
    st.appendChild(chev("chevron-down"));
    field.appendChild(st);
  }
  col.appendChild(field);
  col.appendChild(
    await makeText(
      t,
      "caption",
      state === "Error" ? "Must be 1–99" : "Between 1 and 99",
      state === "Error" ? "feedback/danger" : "text/muted",
    ),
  );
  if (state === "Disabled") col.opacity = 0.4;
  return col;
}

async function numberBoard(t: ThemeContext): Promise<FrameNode> {
  const variants = await tileGrid(
    t,
    [
      { label: ["Stepper", ""], node: await drawNumber(t, "stepper") },
      { label: ["Chevrons", ""], node: await drawNumber(t, "chevrons") },
    ],
    230,
  );
  const states = await tileGrid(
    t,
    [
      { label: ["Default", ""], node: await drawNumber(t, "stepper", "Default") },
      { label: ["Focus", ""], node: await drawNumber(t, "stepper", "Focus") },
      { label: ["Error", ""], node: await drawNumber(t, "stepper", "Error") },
      { label: ["Disabled", ""], node: await drawNumber(t, "stepper", "Disabled") },
    ],
    230,
  );
  const props: PropRow[] = [
    { prop: "value", type: "number", def: "0", note: ["Current value.", ""] },
    {
      prop: "min / max / step",
      type: "number",
      def: "—",
      note: ["Bounds and increment.", ""],
    },
    {
      prop: "controls",
      type: "stepper | chevrons",
      def: "stepper",
      note: ["± buttons or up/down arrows.", ""],
    },
    {
      prop: "state",
      type: "default | focus | error | disabled",
      def: "default",
      note: ["Visual state.", ""],
    },
  ];
  return componentBoard(
    t,
    "Number Input",
    ["Bounded numeric value with steppers", ""],
    ["Free text → use Text Field", "→ Text Field"],
    [await block(t, "Controls", variants), await block(t, "States", states)],
    props,
  );
}

// ── Autocomplete / Combobox ───────────────────────────────────
async function acField(t: ThemeContext, open: boolean, multi: boolean): Promise<FrameNode> {
  const field = autoFrame({
    direction: "HORIZONTAL",
    align: "SPACE_BETWEEN",
    cross: "CENTER",
    padding: [8, 12],
  });
  field.resize(320, field.height);
  field.primaryAxisSizingMode = "FIXED";
  field.counterAxisSizingMode = "AUTO";
  field.cornerRadius = RADII.md;
  fillToken(t, field, "bg/surface");
  if (open) {
    strokeToken(t, field, "state/focus", 1.5);
    await applyEffect(field, "glow/accent", t);
  } else strokeToken(t, field, "border/default", 1);
  const left = autoFrame({ direction: "HORIZONTAL", gap: 7, cross: "CENTER", wrap: true });
  left.layoutGrow = 1;
  if (multi) {
    const chip = async (label: string): Promise<FrameNode> => {
      const c = autoFrame({
        direction: "HORIZONTAL",
        gap: 6,
        cross: "CENTER",
        padding: { t: 4, r: 7, b: 4, l: 11 },
      });
      c.counterAxisAlignItems = "CENTER";
      c.cornerRadius = RADII.full;
      fillToken(t, c, "bg/inset");
      strokeToken(t, c, "border/subtle", 1);
      c.appendChild(await makeText(t, "label/sm", label, "text/primary"));
      c.appendChild(icon(t, "x", 13, "text/muted"));
      return c;
    };
    left.appendChild(await chip("Alex Rivera"));
    left.appendChild(await chip("Mika Chen"));
    left.appendChild(await makeText(t, "body/sm", "Add…", "text/muted"));
  } else {
    left.appendChild(icon(t, "search", 15, "text/muted"));
    left.appendChild(
      await makeText(
        t,
        "body/md",
        open ? "mik" : "Search people…",
        open ? "text/primary" : "text/muted",
      ),
    );
  }
  field.appendChild(left);
  field.appendChild(icon(t, open ? "chevron-up" : "chevron-down", 16, "text/muted"));
  return field;
}

async function acResults(t: ThemeContext): Promise<FrameNode> {
  const menu = autoFrame({ direction: "VERTICAL", gap: 1, padding: 6 });
  menu.resize(320, menu.height);
  menu.counterAxisSizingMode = "FIXED";
  menu.cornerRadius = RADII.lg;
  fillToken(t, menu, "bg/surface-raised");
  strokeToken(t, menu, "border/subtle", 1);
  await applyEffect(menu, "shadow/lg", t);
  const people: Array<[string, string, boolean]> = [
    ["Mika Chen", "mika@studio.dev", true],
    ["Mika Rossi", "m.rossi@studio.dev", false],
    ["Mikael Boe", "mikael@studio.dev", false],
  ];
  for (const [name, email, hi] of people) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [7, 10] });
    row.resize(308, row.height); // menu inner width (320 − padding) so growth distributes
    row.primaryAxisSizingMode = "FIXED";
    row.counterAxisSizingMode = "AUTO";
    row.cornerRadius = RADII.md;
    if (hi) row.fills = [{ ...solid("#FFFFFF"), opacity: 0.06 } as SolidPaint];
    row.appendChild(await initialsAvatar(t, name, 26));
    const col = autoFrame({ direction: "VERTICAL", gap: 1 });
    col.layoutGrow = 1;
    col.appendChild(await makeText(t, "body/sm", name, "text/primary"));
    col.appendChild(await makeText(t, "caption", email, "text/muted"));
    row.appendChild(col);
    if (hi) row.appendChild(icon(t, "check", 15, "accent/primary"));
    menu.appendChild(row);
  }
  return menu;
}

async function autocompleteBoard(t: ThemeContext): Promise<FrameNode> {
  const openCanvas = canvas(t);
  const stage = figma.createFrame();
  stage.name = "ac-open";
  stage.fills = [];
  stage.clipsContent = false;
  stage.resize(320, 230);
  const field = await acField(t, true, false);
  stage.appendChild(field);
  field.x = 0;
  field.y = 0;
  const results = await acResults(t);
  stage.appendChild(results);
  results.x = 0;
  results.y = field.height + 8;
  openCanvas.appendChild(stage);

  const multiCanvas = canvas(t);
  multiCanvas.appendChild(await acField(t, false, true));

  const props: PropRow[] = [
    {
      prop: "options",
      type: "Option[]",
      def: "—",
      note: ["Full list to filter.", ""],
    },
    {
      prop: "value",
      type: "Option | Option[]",
      def: "—",
      note: ["Selected (array if multi).", ""],
    },
    {
      prop: "multiple",
      type: "boolean",
      def: "false",
      note: ["Chips + multi-select.", ""],
    },
    {
      prop: "onInputChange",
      type: "(q)=>void",
      def: "—",
      note: ["Query as you type (async ok).", "( async)."],
    },
    {
      prop: "renderOption",
      type: "(o)=>ReactNode",
      def: "—",
      note: ["Custom row (avatar, meta).", ""],
    },
    {
      prop: "freeSolo",
      type: "boolean",
      def: "false",
      note: ["Allow values not in list.", ""],
    },
  ];
  return componentBoard(
    t,
    "Autocomplete",
    ["Type to filter, then pick", ""],
    ["Short fixed list → use Select", "→ Select"],
    [await block(t, "Combobox (open)", openCanvas), await block(t, "Multi-select", multiCanvas)],
    props,
  );
}

async function photoBoard(t: ThemeContext): Promise<FrameNode> {
  const styles = await tileGrid(
    t,
    [
      { label: ["Plain", ""], node: await drawPhoto(t, "Plain") },
      { label: ["Framed", ""], node: await drawPhoto(t, "Framed") },
      {
        label: ["Scrim + caption", ""],
        node: await drawPhoto(t, "Scrim", "md", true),
      },
      {
        label: ["Noir (shadow) + caption", ""],
        node: await drawPhoto(t, "Noir", "md", true),
      },
      {
        label: ["Cutout (transparent)", ""],
        node: await drawPhoto(t, "Cutout"),
      },
    ],
    240,
  );
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawPhoto(t, "Scrim", "sm") },
      { label: SIZE_LABEL.md, node: await drawPhoto(t, "Scrim", "md") },
      { label: SIZE_LABEL.lg, node: await drawPhoto(t, "Scrim", "lg") },
    ],
    300,
  );
  const props: PropRow[] = [
    {
      prop: "image",
      type: "string",
      def: "—",
      note: ["Source (transparent PNG best).", "( PNG)."],
    },
    {
      prop: "style",
      type: "plain|framed|scrim|noir|cutout",
      def: "plain",
      note: ["Frame & overlay style.", ""],
    },
    {
      prop: "scrim",
      type: "boolean",
      def: "false",
      note: ["Bottom darkening gradient.", ""],
    },
    {
      prop: "transparent",
      type: "boolean",
      def: "false",
      note: ["Cutout: no frame/corners.", ""],
    },
    {
      prop: "size",
      type: "sm|md|lg",
      def: "md",
      note: ["Portrait dimensions.", ""],
    },
    {
      prop: "caption",
      type: "string",
      def: "—",
      note: ["Name/role over the scrim.", ""],
    },
    {
      prop: "radius",
      type: "token",
      def: "xl",
      note: ["Corners (ignored if cutout).", "( cutout)."],
    },
  ];
  return componentBoard(
    t,
    "Media — Photo",
    ["Portraits & hero cutouts on a dark background", "hero-"],
    ["Icons or logos → use an Icon / SVG", "→ Icon / SVG"],
    [await block(t, "Styles", styles), await block(t, "Sizes", sizes)],
    props,
  );
}

async function linkCardBoard(t: ThemeContext): Promise<FrameNode> {
  const list = await linkList(t, [
    {
      title: "Selected Work",
      subtitle: "A short, curated set of shipped products",
      meta: "work",
      featured: true,
    },
    { title: "Writing", subtitle: "Notes on interface craft & systems", meta: "essays" },
    { title: "GitHub", subtitle: "Open-source components & experiments", meta: "@okryshtopa" },
    { title: "Résumé", subtitle: "Experience, in one page", meta: "PDF" },
  ]);
  const states = await tileGrid(
    t,
    [
      {
        label: ["Default", ""],
        node: await drawLinkRow(t, CANVAS_INNER, {
          title: "Writing",
          subtitle: "Notes on interface craft & systems",
          meta: "essays",
        }),
      },
      {
        label: ["Featured", ""],
        node: await drawLinkRow(t, CANVAS_INNER, {
          title: "Selected Work",
          subtitle: "A short, curated set of shipped products",
          meta: "work",
          featured: true,
        }),
      },
      {
        label: ["Featured · Dante", ""],
        node: await drawLinkRow(t, CANVAS_INNER, {
          title: "Night drive vol. 2",
          subtitle: "Signature playlist — fresh weekly",
          meta: "music",
          featured: true,
          tone: "accent/dante",
        }),
      },
      {
        label: ["Hover", ""],
        node: await drawLinkRow(t, CANVAS_INNER, {
          title: "GitHub",
          subtitle: "Open-source components & experiments",
          meta: "@okryshtopa",
          hover: true,
        }),
      },
    ],
    CANVAS_INNER,
  );
  const sizes = await tileGrid(
    t,
    [
      {
        label: SIZE_LABEL.sm,
        node: await drawLinkRow(t, CANVAS_INNER, {
          title: "Writing",
          subtitle: "Notes on interface craft & systems",
          meta: "essays",
          size: "sm",
        }),
      },
      {
        label: SIZE_LABEL.md,
        node: await drawLinkRow(t, CANVAS_INNER, {
          title: "Writing",
          subtitle: "Notes on interface craft & systems",
          meta: "essays",
          size: "md",
        }),
      },
      {
        label: SIZE_LABEL.lg,
        node: await drawLinkRow(t, CANVAS_INNER, {
          title: "Writing",
          subtitle: "Notes on interface craft & systems",
          meta: "essays",
          size: "lg",
        }),
      },
    ],
    CANVAS_INNER,
  );
  const props: PropRow[] = [
    { prop: "title", type: "string", def: "—", note: ["Primary label.", ""] },
    {
      prop: "subtitle",
      type: "string",
      def: "—",
      note: ["Supporting line.", ""],
    },
    {
      prop: "meta",
      type: "string",
      def: "—",
      note: ["Right-aligned tag/handle.", ""],
    },
    {
      prop: "featured",
      type: "boolean",
      def: "false",
      note: ["Accent dot, glass + glow.", ""],
    },
    { prop: "size", type: "sm|md|lg", def: "md", note: ["Row density.", ""] },
    { prop: "href", type: "string", def: "—", note: ["Destination URL.", "URL ."] },
    { prop: "onClick", type: "(e)=>void", def: "—", note: ["Click handler.", ""] },
  ];
  return componentBoard(
    t,
    "LinkCard",
    ["A short, curated set of destinations (links)", ""],
    ["Long, browsable lists → use List / Table", "→ List / Table"],
    [
      await block(t, "List", list),
      await block(t, "States", states),
      await block(t, "Sizes", sizes),
    ],
    props,
  );
}

async function statBoard(t: ThemeContext): Promise<FrameNode> {
  const showcase = canvas(t);
  const row = autoFrame({ direction: "HORIZONTAL", gap: 24 });
  row.layoutAlign = "STRETCH";
  const cw = Math.floor((CANVAS_INNER - 48) / 3);
  row.appendChild(
    await drawStat(t, cw, { value: "10", sign: "+", label: "Years shipping product" }),
  );
  row.appendChild(
    await drawStat(t, cw, { value: "40", sign: "+", label: "Interfaces designed & built" }),
  );
  row.appendChild(await drawStat(t, cw, { value: "6", label: "Design systems from zero" }));
  showcase.appendChild(row);

  const sign = await tileGrid(
    t,
    [
      {
        label: ["With sign", ""],
        node: await drawStat(t, 250, { value: "10", sign: "+", label: "Years shipping product" }),
      },
      {
        label: ["No sign", ""],
        node: await drawStat(t, 250, { value: "6", label: "Design systems from zero" }),
      },
    ],
    280,
  );
  const style = await tileGrid(
    t,
    [
      {
        label: ["Default", ""],
        node: await drawStat(t, 250, {
          value: "40",
          sign: "+",
          label: "Interfaces designed & built",
        }),
      },
      {
        label: ["Accent", ""],
        node: await drawStat(t, 250, {
          value: "40",
          sign: "+",
          label: "Interfaces designed & built",
          accent: true,
        }),
      },
      {
        label: ["Dante", ""],
        node: await drawStat(t, 250, {
          value: "128",
          sign: "k",
          label: "Monthly plays — signature metric",
          accent: true,
          tone: "accent/dante",
        }),
      },
    ],
    280,
  );
  const sizes = await tileGrid(
    t,
    [
      {
        label: SIZE_LABEL.sm,
        node: await drawStat(t, 200, { value: "10", sign: "+", label: "Years", size: "sm" }),
      },
      {
        label: SIZE_LABEL.md,
        node: await drawStat(t, 250, { value: "10", sign: "+", label: "Years", size: "md" }),
      },
      {
        label: SIZE_LABEL.lg,
        node: await drawStat(t, 300, { value: "10", sign: "+", label: "Years", size: "lg" }),
      },
    ],
    320,
  );
  const rich = await tileGrid(
    t,
    [
      {
        label: ["Trend", ""],
        node: await drawStat(t, 250, {
          value: "128",
          sign: "k",
          label: "Monthly views",
          trend: { value: "+12%", up: true },
        }),
      },
      {
        label: ["Trend down", ""],
        node: await drawStat(t, 250, {
          value: "3.4",
          sign: "%",
          label: "Bounce rate",
          trend: { value: "-3%", up: false },
        }),
      },
      {
        label: ["Sparkline", ""],
        node: await drawStat(t, 250, {
          value: "40",
          sign: "+",
          label: "Interfaces shipped",
          spark: [4, 6, 5, 8, 7, 10, 9, 12],
        }),
      },
    ],
    280,
  );
  const props: PropRow[] = [
    { prop: "value", type: "string | number", def: "—", note: ["The metric.", ""] },
    {
      prop: "sign",
      type: "string?",
      def: "—",
      note: ["Optional suffix (+, %, k).", "(+, %, k)."],
    },
    { prop: "label", type: "string", def: "—", note: ["What it measures.", ""] },
    {
      prop: "variant",
      type: "default|accent",
      def: "default",
      note: ["Neutral or highlighted.", ""],
    },
    {
      prop: "trend",
      type: "{value, up}?",
      def: "—",
      note: ["Optional ▲/▼ delta badge.", ""],
    },
    {
      prop: "spark",
      type: "number[]?",
      def: "—",
      note: ["Optional sparkline data.", ""],
    },
    {
      prop: "size",
      type: "sm|md|lg",
      def: "md",
      note: ["Card & number size.", ""],
    },
  ];
  return componentBoard(
    t,
    "StatCard",
    ["One key metric per card; scannable at a glance", ""],
    ["Comparisons or trends over time → use a Chart", "→ Chart"],
    [
      await block(t, "Cards", showcase),
      await block(t, "Sign", sign),
      await block(t, "Style", style),
      await block(t, "Rich", rich),
      await block(t, "Sizes", sizes),
    ],
    props,
  );
}

async function drawChartCard(
  t: ThemeContext,
  title: string,
  chart: FrameNode,
  center = false,
): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 14, padding: 24 });
  card.resize(268, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  const head = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", align: "SPACE_BETWEEN" });
  head.resize(268 - 48, head.height);
  head.primaryAxisSizingMode = "FIXED";
  head.counterAxisSizingMode = "AUTO";
  head.appendChild(await makeText(t, "label/md", title, "text/primary"));
  head.appendChild(await makeText(t, "mono/sm", "30d", "text/muted"));
  card.appendChild(head);
  if (center) {
    const wrap = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    wrap.layoutAlign = "STRETCH";
    wrap.appendChild(chart);
    card.appendChild(wrap);
  } else {
    chart.layoutAlign = "STRETCH";
    card.appendChild(chart);
  }
  return card;
}

async function chartBoard(t: ThemeContext): Promise<FrameNode> {
  const data = [5, 7, 6, 9, 8, 11, 10, 13, 12, 15];
  const bars = [6, 9, 7, 12, 10, 14, 11, 16];
  const cw = 220;
  const types = await tileGrid(
    t,
    [
      {
        label: ["Line", ""],
        node: await drawChartCard(
          t,
          "Sessions",
          lineChart(t, data, cw, 100, { token: "accent/primary", strokeW: 2 }),
        ),
      },
      {
        label: ["Area", ""],
        node: await drawChartCard(
          t,
          "Revenue",
          lineChart(t, data, cw, 100, { token: "accent/primary", area: true, strokeW: 2 }),
        ),
      },
      {
        label: ["Bars", ""],
        node: await drawChartCard(t, "Signups", barChart(t, bars, cw, 100, "accent/secondary")),
      },
      {
        label: ["Line + markers", ""],
        node: await drawChartCard(
          t,
          "Latency",
          lineChart(t, [8, 6, 9, 7, 11, 9, 12], cw, 100, {
            token: "accent/primary",
            markers: true,
            strokeW: 2,
          }),
        ),
      },
    ],
    300,
  );
  const more = await tileGrid(
    t,
    [
      {
        label: ["Pie / Donut", ""],
        node: await drawChartCard(t, "Traffic", pieChart(t, [40, 25, 20, 15], 110), true),
      },
      {
        label: ["Multi-line", ""],
        node: await drawChartCard(
          t,
          "Compare",
          multiLine(
            t,
            [
              [5, 7, 6, 9, 8, 11, 10, 13],
              [3, 4, 5, 4, 6, 7, 6, 9],
            ],
            cw,
            100,
          ),
        ),
      },
      {
        label: ["Gantt", ""],
        node: await drawChartCard(
          t,
          "Roadmap",
          ganttChart(
            t,
            [
              { start: 0, end: 0.4 },
              { start: 0.25, end: 0.7 },
              { start: 0.55, end: 1 },
            ],
            cw,
            100,
          ),
        ),
      },
    ],
    300,
  );
  const fun = await tileGrid(
    t,
    [
      {
        label: ["Waveform", ""],
        node: await drawChartCard(t, "Night drive", waveformChart(t, cw, 72)),
      },
      {
        label: ["Heatmap", ""],
        node: await drawChartCard(t, "Practice", heatmapChart(t, 16, 10, 3)),
      },
      {
        label: ["Radar", ""],
        node: await drawChartCard(
          t,
          "Skills",
          await radarChart(
            t,
            190,
            [0.9, 0.75, 0.8, 0.62, 0.85],
            ["Design", "Code", "Motion", "Audio", "Maps"],
          ),
          true,
        ),
      },
      {
        label: ["Rings", ""],
        node: await drawChartCard(t, "Daily goals", ringsChart(t, 132, [0.82, 0.55, 0.3]), true),
      },
      {
        label: ["Funnel", ""],
        node: await drawChartCard(
          t,
          "Listeners",
          await funnelChart(t, cw, [
            ["Visits", 4200],
            ["Plays", 2700],
            ["Follows", 1300],
            ["Bookings", 500],
          ]),
        ),
      },
      {
        label: ["Gauge", ""],
        node: await drawChartCard(t, "Energy", await gaugeChart(t, 150, 0.72), true),
      },
    ],
    300,
  );
  const props: PropRow[] = [
    {
      prop: "data",
      type: "number[] | series",
      def: "[]",
      note: ["Values / segments / tasks.", ""],
    },
    {
      prop: "type",
      type: "line|area|bar|pie|gantt|multi|waveform|heatmap|radar|rings|funnel|gauge",
      def: "line",
      note: ["Chart shape.", ""],
    },
    {
      prop: "color",
      type: "token | palette",
      def: "accent/primary",
      note: ["Series color(s).", ""],
    },
    {
      prop: "markers",
      type: "boolean",
      def: "false",
      note: ["Dots on the line.", ""],
    },
    {
      prop: "height",
      type: "number",
      def: "100",
      note: ["Chart height (px).", "(px)."],
    },
  ];
  return componentBoard(
    t,
    "Chart",
    ["Trends & series over time on a dashboard", ""],
    ["A single number → use StatCard", "→ StatCard"],
    [await block(t, "Types", types), await block(t, "More", more), await block(t, "Fun", fun)],
    props,
  );
}

type DayKind = "default" | "hover" | "selected" | "today" | "disabled" | "outside" | "range";

async function drawDayCell(
  t: ThemeContext,
  day: number,
  kind: DayKind,
  size = 40,
  tone = "accent/primary",
): Promise<FrameNode> {
  const cell = autoFrame({ direction: "VERTICAL", align: "CENTER", cross: "CENTER", gap: 2 });
  cell.resize(size, size);
  cell.primaryAxisSizingMode = "FIXED";
  cell.counterAxisSizingMode = "FIXED";
  cell.cornerRadius = RADII.md;

  let color = "text/primary";
  if (kind === "selected") {
    fillToken(t, cell, tone);
    color = "accent/contrast";
  } else if (kind === "range") {
    // Availability-window highlight — subtle tinted chip, text stays readable.
    cell.fills = [tokenAlpha(tone, 0.12)];
  } else if (kind === "hover") {
    strokeToken(t, cell, "border/strong", 1.5);
  } else if (kind === "disabled" || kind === "outside") {
    color = "text/muted";
  }

  const num = await makeText(t, "label/md", String(day), color);
  if (kind === "disabled") num.textDecoration = "STRIKETHROUGH";
  cell.appendChild(num);
  if (kind === "today") {
    const dot = ellipse(4);
    fillToken(t, dot, "accent/primary");
    cell.appendChild(dot);
  }
  return cell;
}

function chevBtn(t: ThemeContext, name: string): FrameNode {
  const f = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  f.resize(32, 32);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = RADII.md;
  f.appendChild(icon(t, name, 18, "text/secondary"));
  return f;
}

// Demo month with an availability window (8–20) highlighted, the 12th picked.
const CAL_ROWS: Array<Array<[number, DayKind]>> = [
  [
    [29, "outside"],
    [30, "outside"],
    [31, "outside"],
    [1, "default"],
    [2, "default"],
    [3, "default"],
    [4, "default"],
  ],
  [
    [5, "default"],
    [6, "default"],
    [7, "default"],
    [8, "range"],
    [9, "range"],
    [10, "range"],
    [11, "range"],
  ],
  [
    [12, "selected"],
    [13, "range"],
    [14, "range"],
    [15, "range"],
    [16, "range"],
    [17, "range"],
    [18, "range"],
  ],
  [
    [19, "range"],
    [20, "range"],
    [21, "default"],
    [22, "default"],
    [23, "default"],
    [24, "default"],
    [25, "default"],
  ],
  [
    [26, "default"],
    [27, "default"],
    [28, "default"],
    [29, "today"],
    [30, "default"],
    [1, "outside"],
    [2, "outside"],
  ],
];

async function drawCalendar(t: ThemeContext): Promise<FrameNode> {
  const gridW = 7 * 40 + 6 * 6; // 316
  const card = autoFrame({ direction: "VERTICAL", gap: 16, padding: 24 });
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);

  const header = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", align: "SPACE_BETWEEN" });
  header.resize(gridW, header.height);
  header.primaryAxisSizingMode = "FIXED";
  header.counterAxisSizingMode = "AUTO";
  header.appendChild(chevBtn(t, "chevron-left"));
  header.appendChild(await makeText(t, "label/md", "November 2024", "text/primary"));
  header.appendChild(chevBtn(t, "chevron-right"));
  card.appendChild(header);

  const grid = autoFrame({ direction: "VERTICAL", gap: 6 });
  const wd = autoFrame({ direction: "HORIZONTAL", gap: 6 });
  for (const name of ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]) {
    const c = centerCell(40);
    c.appendChild(await makeText(t, "mono/sm", name, "text/muted"));
    wd.appendChild(c);
  }
  grid.appendChild(wd);
  for (const row of CAL_ROWS) {
    const rr = autoFrame({ direction: "HORIZONTAL", gap: 6 });
    for (const [d, kind] of row) rr.appendChild(await drawDayCell(t, d, kind));
    grid.appendChild(rr);
  }
  card.appendChild(grid);
  const legend = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  const sw = ellipse(8);
  sw.fills = [tokenAlpha("accent/primary", 0.4)];
  sw.strokes = [];
  legend.appendChild(sw);
  legend.appendChild(await makeText(t, "caption", "Availability window · 8–20", "text/muted"));
  card.appendChild(legend);
  return card;
}

async function calendarBoard(t: ThemeContext): Promise<FrameNode> {
  const showcase = canvas(t);
  showcase.counterAxisAlignItems = "CENTER";
  showcase.appendChild(await drawCalendar(t));

  const days = await tileGrid(
    t,
    [
      { label: ["Default", ""], node: await drawDayCell(t, 8, "default") },
      { label: ["Hover", ""], node: await drawDayCell(t, 8, "hover") },
      { label: ["Selected", ""], node: await drawDayCell(t, 8, "selected") },
      {
        label: ["Selected · Dante", ""],
        node: await drawDayCell(t, 8, "selected", 40, "accent/dante"),
      },
      { label: ["Range · window", ""], node: await drawDayCell(t, 14, "range") },
      {
        label: ["Range · Dante", ""],
        node: await drawDayCell(t, 14, "range", 40, "accent/dante"),
      },
      { label: ["Today", ""], node: await drawDayCell(t, 29, "today") },
      { label: ["Disabled", ""], node: await drawDayCell(t, 17, "disabled") },
      { label: ["Outside", ""], node: await drawDayCell(t, 30, "outside") },
    ],
    120,
  );
  const props: PropRow[] = [
    {
      prop: "value",
      type: "Date | null",
      def: "null",
      note: ["Selected date.", ""],
    },
    { prop: "month", type: "Date", def: "today", note: ["Visible month.", ""] },
    {
      prop: "min | max",
      type: "Date",
      def: "—",
      note: ["Disable dates out of range.", ""],
    },
    {
      prop: "highlight",
      type: "[Date, Date]",
      def: "—",
      note: ["Tinted availability window.", ""],
    },
    {
      prop: "weekStart",
      type: "'mon'|'sun'",
      def: "mon",
      note: ["First day of week.", ""],
    },
    {
      prop: "onSelect",
      type: "(d: Date)=>void",
      def: "—",
      note: ["Fires on day click.", ""],
    },
  ];
  return componentBoard(
    t,
    "Calendar",
    ["Pick a single date, simply", ""],
    ["Ranges / time / scheduling → use a DateRange picker", "/ → DateRange"],
    [await block(t, "Calendar", showcase), await block(t, "Day states", days)],
    props,
  );
}

// ── Carousel (Embla-style) ────────────────────────────────────

async function slideTag(t: ThemeContext, text: string): Promise<FrameNode> {
  return drawChip(t, text, { variant: "Glass", size: "sm" });
}

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

async function dots(t: ThemeContext, count: number, active: number): Promise<FrameNode> {
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

async function drawCarousel(t: ThemeContext, w: number): Promise<FrameNode> {
  const wrap = autoFrame({ direction: "VERTICAL", gap: 18 });
  wrap.resize(w, wrap.height);
  wrap.counterAxisSizingMode = "FIXED";

  const viewport = figma.createFrame();
  viewport.name = "viewport";
  viewport.resize(w, 236);
  viewport.fills = [];
  viewport.clipsContent = true;
  const sw = Math.round(w * 0.82);
  const slides = autoFrame({ direction: "HORIZONTAL", gap: 14 });
  // Reuse the ProjectCard as slides — one card style across the system.
  slides.appendChild(
    await drawProjectCard(t, sw, 236, {
      title: "Selected Work",
      desc: "A short, curated set of shipped products.",
      tags: ["Case study", "Work"],
      hex1: "#12332B",
      hex2: "#0E2033",
      device: true,
    }),
  );
  slides.appendChild(
    await drawProjectCard(t, sw, 236, {
      title: "Interface Notes",
      desc: "Notes on interface craft & systems.",
      tags: ["Essay", "Writing"],
      hex1: "#20223A",
      hex2: "#0E1622",
      device: true,
    }),
  );
  slides.appendChild(
    await drawProjectCard(t, sw, 236, {
      title: "Experiments",
      desc: "Open-source components & experiments.",
      tags: ["Lab", "OSS"],
      hex1: "#0E2033",
      hex2: "#12332B",
      device: true,
    }),
  );
  viewport.appendChild(slides);
  slides.x = 0;
  slides.y = 0;

  // Right-edge fade — hints there's more, melts the peeking slide into the bg.
  const fade = rect(80, 236);
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
  controls.appendChild(await dots(t, 3, 0));
  controls.appendChild(carouselArrow(t, "chevron-right"));
  wrap.appendChild(controls);
  return wrap;
}

async function carouselBoard(t: ThemeContext): Promise<FrameNode> {
  const showcase = canvas(t);
  showcase.counterAxisAlignItems = "CENTER";
  showcase.appendChild(await drawCarousel(t, 560));
  const props: PropRow[] = [
    {
      prop: "slides",
      type: "ReactNode[]",
      def: "[]",
      note: ["Slide content.", ""],
    },
    {
      prop: "align",
      type: "start|center",
      def: "start",
      note: ["Slide alignment (Embla).", "(Embla)."],
    },
    {
      prop: "loop",
      type: "boolean",
      def: "false",
      note: ["Infinite loop.", ""],
    },
    {
      prop: "autoplay",
      type: "number?",
      def: "—",
      note: ["Auto-advance interval (ms).", ""],
    },
    {
      prop: "arrows | dots",
      type: "boolean",
      def: "true",
      note: ["Show controls.", ""],
    },
  ];
  return componentBoard(
    t,
    "Carousel",
    ["Swipe through a few visual slides (Embla)", "(Embla)"],
    ["Long scrollable lists → use a List / Grid", "→ List / Grid"],
    [await block(t, "Carousel", showcase)],
    props,
  );
}

// ── iOS-style TimePicker wheel ────────────────────────────────

async function drawWheel(
  t: ThemeContext,
  values: string[],
  unit: string,
  w: number,
): Promise<FrameNode> {
  const rowH = 40;
  const center = 3;
  const rows = values.length;
  const H = rowH * rows;
  const wheel = figma.createFrame();
  wheel.name = `wheel/${unit}`;
  wheel.resize(w, H);
  wheel.fills = [];
  wheel.clipsContent = true;
  const opac = [1, 0.5, 0.28, 0.14];

  for (let i = 0; i < rows; i++) {
    const dist = Math.abs(i - center);
    const row = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER", gap: 8 });
    row.resize(w, rowH);
    row.primaryAxisSizingMode = "FIXED";
    row.counterAxisSizingMode = "FIXED";
    if (i === center) {
      row.appendChild(await makeText(t, "heading/h2", values[i], "text/primary"));
      row.appendChild(await makeText(t, "label/md", unit, "text/secondary"));
    } else {
      row.appendChild(await makeText(t, "heading/h3", values[i], "text/muted"));
      row.opacity = opac[Math.min(dist, opac.length - 1)];
    }
    wheel.appendChild(row);
    row.x = 0;
    row.y = i * rowH;
  }
  const top = rect(w, 1);
  fillToken(t, top, "border/strong");
  wheel.appendChild(top);
  top.x = 0;
  top.y = center * rowH;
  const bot = rect(w, 1);
  fillToken(t, bot, "border/strong");
  wheel.appendChild(bot);
  bot.x = 0;
  bot.y = (center + 1) * rowH;
  return wheel;
}

async function drawTimePicker(t: ThemeContext): Promise<FrameNode> {
  const card = autoFrame({ direction: "HORIZONTAL", gap: 8, padding: 20, cross: "CENTER" });
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  card.appendChild(await drawWheel(t, ["21", "22", "23", "0", "1", "2", "3"], "hours", 150));
  card.appendChild(await drawWheel(t, ["57", "58", "59", "0", "1", "2", "3"], "min", 130));
  return card;
}

async function timePickerBoard(t: ThemeContext): Promise<FrameNode> {
  const showcase = canvas(t);
  showcase.counterAxisAlignItems = "CENTER";
  showcase.appendChild(await drawTimePicker(t));
  const props: PropRow[] = [
    { prop: "value", type: "{h, m}", def: "{0,0}", note: ["Selected time.", ""] },
    { prop: "step", type: "number", def: "1", note: ["Minute step.", ""] },
    { prop: "format", type: "'24h'|'12h'", def: "24h", note: ["Hour format.", ""] },
    { prop: "loop", type: "boolean", def: "true", note: ["Wrap around ends.", ""] },
    {
      prop: "onChange",
      type: "(v)=>void",
      def: "—",
      note: ["Fires on scroll settle.", ""],
    },
  ];
  return componentBoard(
    t,
    "TimePicker",
    ["Pick hours & minutes, iOS wheel style", ", iOS-"],
    ["Precise typed time → use a masked input", ""],
    [await block(t, "Wheel", showcase)],
    props,
  );
}

// ── DateTime (Calendar + TimePicker integration) ──────────────

async function dateTimeBoard(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t);
  wrap.counterAxisAlignItems = "CENTER";

  const container = autoFrame({ direction: "VERTICAL", gap: 18, padding: 24 });
  container.cornerRadius = RADII["2xl"];
  fillToken(t, container, "bg/surface");
  strokeToken(t, container, "border/subtle", 1);

  const cal = await drawCalendar(t);
  const tp = await drawTimePicker(t);
  const top = autoFrame({ direction: "HORIZONTAL", gap: 20, cross: "MIN" });
  cal.layoutAlign = "STRETCH";
  tp.layoutAlign = "STRETCH"; // match calendar height
  top.appendChild(cal);
  top.appendChild(tp);
  container.appendChild(top);

  const footer = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", align: "SPACE_BETWEEN" });
  footer.resize(cal.width + 20 + tp.width, footer.height);
  footer.primaryAxisSizingMode = "FIXED";
  footer.counterAxisSizingMode = "AUTO";
  const sel = autoFrame({ direction: "VERTICAL", gap: 4 });
  sel.appendChild(await makeText(t, "caption", "Selected time", "text/muted"));
  const dateRow = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  dateRow.appendChild(await makeText(t, "label/md", "Nov 8, 2024 · 00:00", "text/primary"));
  dateRow.appendChild(
    await drawChip(t, "GMT+2", { variant: "Glass", size: "sm", iconName: "globe" }),
  );
  sel.appendChild(dateRow);
  footer.appendChild(sel);
  footer.appendChild(await drawButton(t, "Gradient", "Default", "md", "rounded", "Confirm"));
  container.appendChild(footer);

  wrap.appendChild(container);
  const props: PropRow[] = [
    {
      prop: "value",
      type: "Date | null",
      def: "null",
      note: ["Selected date & time.", ""],
    },
    {
      prop: "min | max",
      type: "Date",
      def: "—",
      note: ["Allowed range.", ""],
    },
    {
      prop: "timeStep",
      type: "number",
      def: "1",
      note: ["Minute step of the wheel.", ""],
    },
    {
      prop: "onConfirm",
      type: "(d: Date)=>void",
      def: "—",
      note: ["Fires on Confirm.", "Confirm."],
    },
  ];
  return componentBoard(
    t,
    "DateTime",
    ["Calendar + time wheel in one picker", ""],
    ["Only a date → use Calendar; only time → TimePicker", "→ Calendar; → TimePicker"],
    [await block(t, "Picker", wrap)],
    props,
  );
}

// ── ProjectCard (case-study poster) ───────────────────────────

function logoChip(_t: ThemeContext): EllipseNode {
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

interface ProjectOpts {
  title: string;
  desc: string;
  tags: string[];
  hex1: string;
  hex2: string;
  device?: boolean;
}

async function drawProjectCard(
  t: ThemeContext,
  w: number,
  h: number,
  o: ProjectOpts,
): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", padding: 26, align: "SPACE_BETWEEN" });
  card.resize(w, h);
  card.primaryAxisSizingMode = "FIXED";
  card.counterAxisSizingMode = "FIXED";
  card.primaryAxisAlignItems = "SPACE_BETWEEN";
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

  if (o.device) {
    const dev = drawDevice(t);
    card.appendChild(dev);
    dev.layoutPositioning = "ABSOLUTE";
    dev.x = w - 118;
    dev.y = 52;
  }

  const scrimH = Math.round(h * 0.72);
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
  scrim.y = h - scrimH;

  const top = autoFrame({ direction: "HORIZONTAL", cross: "MIN", align: "SPACE_BETWEEN" });
  top.resize(w - 52, top.height);
  top.primaryAxisSizingMode = "FIXED";
  top.counterAxisSizingMode = "AUTO";
  top.appendChild(logoChip(t));
  top.appendChild(await drawActionSquare(t, "Glass", "Default", "md"));
  card.appendChild(top);

  const bottom = autoFrame({ direction: "VERTICAL", gap: 12 });
  const tagsRow = autoFrame({ direction: "HORIZONTAL", gap: 8, wrap: true });
  tagsRow.counterAxisSpacing = 8;
  for (const tag of o.tags) tagsRow.appendChild(await slideTag(t, tag));
  bottom.appendChild(tagsRow);
  bottom.appendChild(
    await makeText(t, "heading/h2", o.title, "text/primary", { maxWidth: Math.round(w * 0.82) }),
  );
  bottom.appendChild(
    await makeText(t, "body/sm", o.desc, "text/secondary", { maxWidth: Math.round(w * 0.72) }),
  );
  card.appendChild(bottom);
  return card;
}

async function projectCardBoard(t: ThemeContext): Promise<FrameNode> {
  const showcase = canvas(t);
  const grid = autoFrame({ direction: "HORIZONTAL", gap: 24, wrap: true, cross: "MIN" });
  grid.primaryAxisSizingMode = "FIXED";
  grid.counterAxisSizingMode = "AUTO";
  grid.resize(CANVAS_INNER, grid.height);
  grid.counterAxisSpacing = 24;
  const cw = Math.floor((CANVAS_INNER - 24) / 2);
  grid.appendChild(
    await drawProjectCard(t, cw, 290, {
      title: "Finance App",
      desc: "A new-breed digital finance app to buy, earn and grow crypto.",
      tags: ["Fintech", "Mobile", "UK"],
      hex1: "#2E4A57",
      hex2: "#3A2E52",
      device: true,
    }),
  );
  grid.appendChild(
    await drawProjectCard(t, cw, 290, {
      title: "DeFi Wallet",
      desc: "Multi-chain cryptocurrency wallet.",
      tags: ["DeFi", "Blockchain", "Web"],
      hex1: "#3A1F52",
      hex2: "#160E33",
      device: true,
    }),
  );
  grid.appendChild(
    await drawProjectCard(t, cw, 290, {
      title: "Storage Platform",
      desc: "An innovative booking & management platform.",
      tags: ["Self-Storage", "Web", "EU"],
      hex1: "#5A3A1E",
      hex2: "#2A1608",
      device: true,
    }),
  );
  grid.appendChild(
    await drawProjectCard(t, cw, 290, {
      title: "Returns Platform",
      desc: "Platform for returning online purchases.",
      tags: ["Logistics", "Web & Mobile", "USA"],
      hex1: "#243642",
      hex2: "#0E1A22",
      device: true,
    }),
  );
  showcase.appendChild(grid);

  const props: PropRow[] = [
    {
      prop: "image",
      type: "string",
      def: "—",
      note: ["Background image (transparent OK).", "- ( OK)."],
    },
    {
      prop: "logo",
      type: "ReactNode",
      def: "—",
      note: ["Brand mark, top-left.", ""],
    },
    { prop: "title", type: "string", def: "—", note: ["Project name.", ""] },
    {
      prop: "description",
      type: "string",
      def: "—",
      note: ["One-two line summary.", ""],
    },
    { prop: "tags", type: "string[]", def: "[]", note: ["Category pills.", ""] },
    {
      prop: "device",
      type: "boolean",
      def: "false",
      note: ["Show device mockup.", ""],
    },
    {
      prop: "href",
      type: "string",
      def: "—",
      note: ["Opens the case (↗).", ""],
    },
  ];
  return componentBoard(
    t,
    "ProjectCard",
    ["Showcase a project / case study visually", ""],
    ["Plain text links → use LinkCard", "→ LinkCard"],
    [await block(t, "Cards", showcase)],
    props,
  );
}

// ── IconButton (glass action square) ──────────────────────────

type SqVariant = "Glass" | "Soft" | "Accent" | "Ghost";
type SqState = "Default" | "Hover";

const SQ_DIM: Record<Size, { box: number; icon: number }> = {
  sm: { box: 36, icon: 16 },
  md: { box: 44, icon: 20 },
  lg: { box: 56, icon: 24 },
};

async function drawActionSquare(
  t: ThemeContext,
  variant: SqVariant,
  state: SqState = "Default",
  size: Size = "md",
  iconName = "arrow-up-right",
  tone = "accent/primary",
): Promise<FrameNode> {
  const dim = SQ_DIM[size];
  const f = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  f.resize(dim.box, dim.box);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = Math.round(dim.box * 0.3);
  let iconColor = "text/primary";
  if (variant === "Glass") {
    fillToken(t, f, "glass/fill");
    strokeToken(t, f, "glass/border", 1);
  } else if (variant === "Soft") {
    fillToken(t, f, "bg/surface-raised");
    strokeToken(t, f, "border/subtle", 1);
  } else if (variant === "Accent") {
    fillToken(t, f, tone);
    iconColor = "accent/contrast";
  } else {
    f.fills = [];
  }
  if (state === "Hover") await applyEffect(f, "glow/hover", t);
  f.appendChild(icon(t, iconName, dim.icon, iconColor));
  return f;
}

async function iconButtonBoard(t: ThemeContext): Promise<FrameNode> {
  const variants: SqVariant[] = ["Glass", "Soft", "Accent", "Ghost"];
  const states: SqState[] = ["Default", "Hover"];
  const rows = [];
  for (const v of variants) {
    const cells: SceneNode[] = [];
    for (const s of states) cells.push(await drawActionSquare(t, v, s));
    rows.push({ header: v, cells });
  }
  const statesM = await matrix(t, states, rows, 130, 108);
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawActionSquare(t, "Glass", "Default", "sm") },
      { label: SIZE_LABEL.md, node: await drawActionSquare(t, "Glass", "Default", "md") },
      { label: SIZE_LABEL.lg, node: await drawActionSquare(t, "Glass", "Default", "lg") },
    ],
    120,
  );
  const icons = await tileGrid(
    t,
    [
      {
        label: ["Link", ""],
        node: await drawActionSquare(t, "Glass", "Default", "md", "arrow-up-right"),
      },
      {
        label: ["Add", ""],
        node: await drawActionSquare(t, "Glass", "Default", "md", "plus"),
      },
      {
        label: ["External", ""],
        node: await drawActionSquare(t, "Glass", "Default", "md", "external-link"),
      },
      {
        label: ["Next", ""],
        node: await drawActionSquare(t, "Glass", "Default", "md", "chevron-right"),
      },
      {
        label: ["Copy", ""],
        node: await drawActionSquare(t, "Glass", "Default", "md", "copy"),
      },
    ],
    120,
  );
  const sqTones = await tileGrid(
    t,
    [
      {
        label: ["Mint", ""],
        node: await drawActionSquare(t, "Accent", "Default", "md", "arrow-up-right"),
      },
      {
        label: ["Dante", ""],
        node: await drawActionSquare(t, "Accent", "Default", "md", "heart", "accent/dante"),
      },
      {
        label: ["Indigo", ""],
        node: await drawActionSquare(t, "Accent", "Default", "md", "sparkles", "accent/secondary"),
      },
    ],
    120,
  );
  const props: PropRow[] = [
    {
      prop: "variant",
      type: "glass|soft|accent|ghost",
      def: "glass",
      note: ["Surface style.", ""],
    },
    {
      prop: "icon",
      type: "IconName",
      def: "arrow-up-right",
      note: ["Glyph from the icon set.", ""],
    },
    {
      prop: "size",
      type: "sm|md|lg",
      def: "md",
      note: ["Box & icon size.", ""],
    },
    { prop: "disabled", type: "boolean", def: "false", note: ["Non-interactive.", ""] },
    { prop: "onClick", type: "(e)=>void", def: "—", note: ["Click handler.", ""] },
  ];
  return componentBoard(
    t,
    "IconButton",
    ["A single icon action — link, add, open (glass)", ""],
    ["A labelled action → use Button", "→ Button"],
    [
      await block(t, "States", statesM),
      await block(t, "Tones", sqTones),
      await block(t, "Sizes", sizes),
      await block(t, "Icons", icons),
    ],
    props,
  );
}

// ── Chip ──────────────────────────────────────────────────────

type ChipVariant = "Glass" | "Solid" | "Outline" | "Accent" | "Dante";
type ChipState = "Default" | "Hover" | "Selected";

const CHIP_SIZE: Record<Size, { pad: [number, number]; text: string; icon: number; dot: number }> =
  {
    sm: { pad: [4, 10], text: "label/sm", icon: 12, dot: 6 },
    md: { pad: [7, 14], text: "label/md", icon: 14, dot: 7 },
    lg: { pad: [9, 18], text: "body/md", icon: 16, dot: 8 },
  };

interface ChipOpts {
  variant?: ChipVariant;
  size?: Size;
  state?: ChipState;
  dot?: boolean;
  iconName?: string;
  removable?: boolean;
}

async function drawChip(t: ThemeContext, label: string, o: ChipOpts = {}): Promise<FrameNode> {
  const sp = CHIP_SIZE[o.size ?? "md"];
  const c = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER", padding: sp.pad });
  c.cornerRadius = RADII.full;
  let textColor = "text/primary";
  const variant = o.variant ?? "Glass";
  if (variant === "Glass") {
    fillToken(t, c, "glass/fill");
    strokeToken(t, c, "glass/border", 1);
  } else if (variant === "Solid") {
    fillToken(t, c, "bg/surface-raised");
  } else if (variant === "Outline") {
    c.fills = [];
    strokeToken(t, c, "border/default", 1);
  } else if (variant === "Dante") {
    c.fills = [tokenAlpha("accent/dante", 0.16)];
    textColor = "accent/dante";
  } else {
    fillToken(t, c, "accent/soft");
    textColor = "accent/primary";
  }
  if (o.state === "Selected") {
    fillToken(t, c, "accent/soft");
    strokeToken(t, c, "accent/primary", 1.5);
    textColor = "accent/primary";
  }
  if (o.state === "Hover") await applyEffect(c, "glow/hover", t);

  if (o.dot)
    c.appendChild(
      statusDot(
        t,
        variant === "Dante"
          ? "accent/dante"
          : variant === "Accent" || o.state === "Selected"
            ? "accent/primary"
            : "text/muted",
        sp.dot,
      ),
    );
  if (o.iconName) c.appendChild(icon(t, o.iconName, sp.icon, textColor));
  c.appendChild(await makeText(t, sp.text, label, textColor));
  if (o.removable) c.appendChild(icon(t, "x", sp.icon, "text/muted"));
  return c;
}

async function chipBoard(t: ThemeContext): Promise<FrameNode> {
  const variants = await tileGrid(
    t,
    [
      { label: ["Glass", ""], node: await drawChip(t, "Fintech", { variant: "Glass" }) },
      { label: ["Solid", ""], node: await drawChip(t, "Mobile", { variant: "Solid" }) },
      { label: ["Outline", ""], node: await drawChip(t, "Web", { variant: "Outline" }) },
      {
        label: ["Accent", ""],
        node: await drawChip(t, "New", { variant: "Accent", dot: true }),
      },
      {
        label: ["Dante", ""],
        node: await drawChip(t, "Signature", { variant: "Dante", dot: true }),
      },
    ],
    150,
  );
  const states = await tileGrid(
    t,
    [
      { label: ["Default", ""], node: await drawChip(t, "Fintech") },
      { label: ["Hover", ""], node: await drawChip(t, "Fintech", { state: "Hover" }) },
      { label: ["Selected", ""], node: await drawChip(t, "Fintech", { state: "Selected" }) },
    ],
    150,
  );
  const content = await tileGrid(
    t,
    [
      { label: ["Dot", ""], node: await drawChip(t, "Available", { dot: true }) },
      { label: ["Icon", ""], node: await drawChip(t, "Starred", { iconName: "star" }) },
      { label: ["Removable", ""], node: await drawChip(t, "Mobile", { removable: true }) },
    ],
    160,
  );
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawChip(t, "Fintech", { size: "sm" }) },
      { label: SIZE_LABEL.md, node: await drawChip(t, "Fintech", { size: "md" }) },
      { label: SIZE_LABEL.lg, node: await drawChip(t, "Fintech", { size: "lg" }) },
    ],
    150,
  );
  const props: PropRow[] = [
    { prop: "label", type: "string", def: "—", note: ["Chip text.", ""] },
    {
      prop: "variant",
      type: "glass|solid|outline|accent|dante",
      def: "glass",
      note: ["Surface style.", ""],
    },
    {
      prop: "selected",
      type: "boolean",
      def: "false",
      note: ["Active/filter state.", ""],
    },
    {
      prop: "dot | icon",
      type: "boolean | IconName",
      def: "—",
      note: ["Leading dot or icon.", ""],
    },
    {
      prop: "removable",
      type: "boolean",
      def: "false",
      note: ["Trailing × to remove.", ""],
    },
    { prop: "size", type: "sm|md|lg", def: "md", note: ["Chip size.", ""] },
  ];
  return componentBoard(
    t,
    "Chip",
    ["Tags, filters, categories, quick facts", ""],
    ["A committing action → use Button", "→ Button"],
    [
      await block(t, "Variants", variants),
      await block(t, "States", states),
      await block(t, "Content", content),
      await block(t, "Sizes", sizes),
    ],
    props,
  );
}

// ── Radio ─────────────────────────────────────────────────────

const RAD_SIZE: Record<Size, number> = { sm: 16, md: 20, lg: 24 };

async function drawRadio(
  t: ThemeContext,
  selected: boolean,
  disabled: boolean,
  size: Size = "md",
  tone = "accent/primary",
): Promise<FrameNode> {
  const s = RAD_SIZE[size];
  const f = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  f.resize(s, s);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = RADII.full;
  f.fills = [];
  if (selected) {
    strokeToken(t, f, tone, 2);
    const dot = ellipse(Math.round(s * 0.46));
    fillToken(t, dot, tone);
    f.appendChild(dot);
  } else {
    strokeToken(t, f, "border/strong", 1.5);
  }
  if (disabled) f.opacity = 0.4;
  return f;
}

async function drawRadioLabel(
  t: ThemeContext,
  selected: boolean,
  label: string,
): Promise<FrameNode> {
  const r = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  r.appendChild(await drawRadio(t, selected, false));
  r.appendChild(await makeText(t, "body/sm", label, "text/secondary"));
  return r;
}

async function radioBoard(t: ThemeContext): Promise<FrameNode> {
  const rows = [
    {
      header: "Enabled",
      cells: [await drawRadio(t, false, false), await drawRadio(t, true, false)] as SceneNode[],
    },
    {
      header: "Disabled",
      cells: [await drawRadio(t, false, true), await drawRadio(t, true, true)] as SceneNode[],
    },
  ];
  const statesM = await matrix(t, ["Unselected", "Selected"], rows, 140, 108);
  const rdTones: Array<{ label: Bi; node: SceneNode }> = [];
  for (const [en, ru, tk] of TONES_ACCENT)
    rdTones.push({ label: [en, ru], node: await drawRadio(t, true, false, "md", tk) });
  const rdTonesGrid = await tileGrid(t, rdTones, 120);
  const group = canvas(t);
  const col = autoFrame({ direction: "VERTICAL", gap: 14 });
  col.appendChild(await drawRadioLabel(t, true, "Email me updates"));
  col.appendChild(await drawRadioLabel(t, false, "SMS only"));
  col.appendChild(await drawRadioLabel(t, false, "No notifications"));
  group.appendChild(col);
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawRadio(t, true, false, "sm") },
      { label: SIZE_LABEL.md, node: await drawRadio(t, true, false, "md") },
      { label: SIZE_LABEL.lg, node: await drawRadio(t, true, false, "lg") },
    ],
    120,
  );
  const props: PropRow[] = [
    {
      prop: "checked",
      type: "boolean",
      def: "false",
      note: ["Selected in its group.", ""],
    },
    {
      prop: "name",
      type: "string",
      def: "—",
      note: ["Groups radios together.", ""],
    },
    { prop: "disabled", type: "boolean", def: "false", note: ["Non-interactive.", ""] },
    { prop: "size", type: "sm|md|lg", def: "md", note: ["Control size.", ""] },
  ];
  return componentBoard(
    t,
    "Radio",
    ["Pick exactly one from a small set", ""],
    ["Multiple choices → use Checkbox", "→ Checkbox"],
    [
      await block(t, "States", statesM),
      await block(t, "Tones", rdTonesGrid),
      await block(t, "Group", group),
      await block(t, "Sizes", sizes),
    ],
    props,
  );
}

// ── Slider ────────────────────────────────────────────────────

const SLD_SIZE: Record<Size, { rail: number; thumb: number; w: number }> = {
  sm: { rail: 4, thumb: 16, w: 220 },
  md: { rail: 6, thumb: 20, w: 240 },
  lg: { rail: 8, thumb: 24, w: 260 },
};

async function drawSlider(
  t: ThemeContext,
  opts: {
    value?: number;
    values?: number[];
    range?: boolean;
    orientation?: "horizontal" | "vertical";
    size?: Size;
    tooltip?: boolean;
    length?: number;
    tone?: string;
    gradient?: boolean;
  } = {},
): Promise<FrameNode> {
  const c = SLD_SIZE[opts.size ?? "md"];
  const tone = opts.tone ?? "accent/primary";
  const vertical = opts.orientation === "vertical";
  const values = opts.values ?? (opts.range ? [0.25, opts.value ?? 0.7] : [opts.value ?? 0.4]);
  const single = values.length === 1;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const fillStart = single ? 0 : lo;
  const fillEnd = single ? values[0] : hi;
  const L = opts.length ?? (vertical ? 200 : c.w);

  const f = figma.createFrame();
  f.name = "slider";
  f.fills = [];
  f.clipsContent = false;

  const thumb = () => {
    const th = ellipse(c.thumb);
    th.fills = [solid("#F5F5F7")];
    strokeToken(t, th, "border/default", 1);
    return th;
  };

  if (!vertical) {
    const H = c.thumb + (opts.tooltip ? 34 : 0);
    const yc = H - c.thumb / 2;
    f.resize(L, H);
    const rail = rect(L, c.rail, c.rail / 2);
    fillToken(t, rail, "bg/surface-raised");
    rail.x = 0;
    rail.y = yc - c.rail / 2;
    f.appendChild(rail);
    const fillR = rect(Math.max(2, L * (fillEnd - fillStart)), c.rail, c.rail / 2);
    if (opts.gradient)
      fillR.fills = [
        linearGradient(
          [
            { hex: "#5EE6C1", position: 0 },
            { hex: "#FF3D8B", position: 1 },
          ],
          "horizontal",
        ),
      ];
    else fillToken(t, fillR, tone);
    fillR.x = L * fillStart;
    fillR.y = yc - c.rail / 2;
    f.appendChild(fillR);
    for (const v of values) {
      const th = thumb();
      f.appendChild(th);
      th.x = L * v - c.thumb / 2;
      th.y = yc - c.thumb / 2;
    }
    if (opts.tooltip) {
      const tip = autoFrame({
        direction: "HORIZONTAL",
        align: "CENTER",
        cross: "CENTER",
        padding: [3, 8],
      });
      tip.cornerRadius = RADII.full;
      fillToken(t, tip, opts.gradient ? "accent/dante" : tone);
      tip.appendChild(
        await makeText(
          t,
          "label/sm",
          `${Math.round(values[values.length - 1] * 100)}%`,
          "accent/contrast",
        ),
      );
      f.appendChild(tip);
      tip.x = L * values[values.length - 1] - 20;
      tip.y = 0;
    }
  } else {
    const W = c.thumb;
    const xc = W / 2;
    f.resize(W, L);
    const rail = rect(c.rail, L, c.rail / 2);
    fillToken(t, rail, "bg/surface-raised");
    rail.x = xc - c.rail / 2;
    rail.y = 0;
    f.appendChild(rail);
    const fillR = rect(c.rail, Math.max(2, L * (fillEnd - fillStart)), c.rail / 2);
    if (opts.gradient)
      fillR.fills = [
        linearGradient(
          [
            { hex: "#FF3D8B", position: 0 },
            { hex: "#5EE6C1", position: 1 },
          ],
          "vertical",
        ),
      ];
    else fillToken(t, fillR, tone);
    fillR.x = xc - c.rail / 2;
    fillR.y = L * (1 - fillEnd);
    f.appendChild(fillR);
    for (const v of values) {
      const th = thumb();
      f.appendChild(th);
      th.x = xc - c.thumb / 2;
      th.y = L * (1 - v) - c.thumb / 2;
    }
  }
  return f;
}

async function sliderBoard(t: ThemeContext): Promise<FrameNode> {
  const variants = await tileGrid(
    t,
    [
      { label: ["Single", ""], node: await drawSlider(t, { value: 0.4 }) },
      { label: ["Range", ""], node: await drawSlider(t, { value: 0.7, range: true }) },
      {
        label: ["Multi-thumb", ""],
        node: await drawSlider(t, { values: [0.2, 0.5, 0.8] }),
      },
      { label: ["Tooltip", ""], node: await drawSlider(t, { value: 0.4, tooltip: true }) },
    ],
    280,
  );
  const axis = await tileGrid(
    t,
    [
      { label: ["Horizontal", ""], node: await drawSlider(t, { value: 0.6 }) },
      {
        label: ["Vertical", ""],
        node: await drawSlider(t, { value: 0.6, orientation: "vertical" }),
      },
      {
        label: ["Vertical · range", ""],
        node: await drawSlider(t, { values: [0.3, 0.75], orientation: "vertical" }),
      },
    ],
    280,
  );
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawSlider(t, { value: 0.5, size: "sm" }) },
      { label: SIZE_LABEL.md, node: await drawSlider(t, { value: 0.5, size: "md" }) },
      { label: SIZE_LABEL.lg, node: await drawSlider(t, { value: 0.5, size: "lg" }) },
    ],
    290,
  );
  const sldTones = await tileGrid(
    t,
    [
      { label: ["Mint", ""], node: await drawSlider(t, { value: 0.6 }) },
      {
        label: ["Dante", ""],
        node: await drawSlider(t, { value: 0.6, tone: "accent/dante" }),
      },
      {
        label: ["Indigo", ""],
        node: await drawSlider(t, { value: 0.6, tone: "accent/secondary" }),
      },
      {
        label: ["Gradient · mint → dante", ""],
        node: await drawSlider(t, { value: 0.72, gradient: true, tooltip: true }),
      },
    ],
    280,
  );
  const props: PropRow[] = [
    {
      prop: "value",
      type: "number",
      def: "0",
      note: ["Single-thumb position 0–1.", ""],
    },
    {
      prop: "values",
      type: "number[]",
      def: "—",
      note: ["Multi-thumb positions.", ""],
    },
    {
      prop: "orientation",
      type: "horizontal|vertical",
      def: "horizontal",
      note: ["Track axis.", ""],
    },
    {
      prop: "range",
      type: "boolean",
      def: "false",
      note: ["Two thumbs (min/max).", ""],
    },
    {
      prop: "min | max | step",
      type: "number",
      def: "0,100,1",
      note: ["Bounds & step.", ""],
    },
    {
      prop: "tooltip",
      type: "boolean",
      def: "false",
      note: ["Value bubble on thumb.", ""],
    },
    {
      prop: "tone | gradient",
      type: "token | boolean",
      def: "accent/primary",
      note: ["Fill colour or mint→dante gradient.", ""],
    },
    {
      prop: "size",
      type: "sm|md|lg",
      def: "md",
      note: ["Rail & thumb size.", ""],
    },
  ];
  return componentBoard(
    t,
    "Slider",
    ["Pick a value or range along a scale", ""],
    ["Discrete on/off → use Switch", "/ → Switch"],
    [
      await block(t, "Variants", variants),
      await block(t, "Tones", sldTones),
      await block(t, "Axis", axis),
      await block(t, "Sizes", sizes),
    ],
    props,
  );
}

// ── Tabs ──────────────────────────────────────────────────────

async function drawTabs(
  t: ThemeContext,
  variant: "underline" | "pill",
  active: number,
  tone = "accent/primary",
): Promise<FrameNode> {
  const items = ["Overview", "Activity", "Settings"];
  if (variant === "pill") {
    const track = autoFrame({ direction: "HORIZONTAL", gap: 4, padding: 4, cross: "CENTER" });
    track.cornerRadius = RADII.full;
    fillToken(t, track, "bg/surface-raised");
    for (let i = 0; i < items.length; i++) {
      const tab = autoFrame({
        direction: "HORIZONTAL",
        align: "CENTER",
        cross: "CENTER",
        padding: [8, 16],
      });
      tab.cornerRadius = RADII.full;
      if (i === active) {
        if (tone === "accent/primary") fillToken(t, tab, "bg/surface");
        else tab.fills = [tokenAlpha(tone, 0.16)];
      }
      tab.appendChild(
        await makeText(
          t,
          "label/md",
          items[i],
          i === active ? (tone === "accent/primary" ? "text/primary" : tone) : "text/muted",
        ),
      );
      track.appendChild(tab);
    }
    return track;
  }
  const row = autoFrame({ direction: "HORIZONTAL", gap: 28 });
  strokeToken(t, row, "border/subtle", 1);
  row.strokeTopWeight = 0;
  row.strokeLeftWeight = 0;
  row.strokeRightWeight = 0;
  row.strokeBottomWeight = 1;
  for (let i = 0; i < items.length; i++) {
    const it = autoFrame({ direction: "VERTICAL", padding: { t: 0, r: 0, b: 12, l: 0 } });
    it.appendChild(
      await makeText(t, "label/md", items[i], i === active ? "text/primary" : "text/muted"),
    );
    if (i === active) {
      strokeToken(t, it, tone, 2);
      it.strokeTopWeight = 0;
      it.strokeLeftWeight = 0;
      it.strokeRightWeight = 0;
      it.strokeBottomWeight = 2;
    }
    row.appendChild(it);
  }
  return row;
}

async function tabsBoard(t: ThemeContext): Promise<FrameNode> {
  const variants = await tileGrid(
    t,
    [
      { label: ["Underline", ""], node: await drawTabs(t, "underline", 0) },
      { label: ["Pill", ""], node: await drawTabs(t, "pill", 0) },
    ],
    360,
  );
  const tabTones = await tileGrid(
    t,
    [
      {
        label: ["Underline · Dante", ""],
        node: await drawTabs(t, "underline", 0, "accent/dante"),
      },
      {
        label: ["Pill · Dante", ""],
        node: await drawTabs(t, "pill", 0, "accent/dante"),
      },
      {
        label: ["Pill · Indigo", ""],
        node: await drawTabs(t, "pill", 0, "accent/secondary"),
      },
    ],
    360,
  );
  const props: PropRow[] = [
    { prop: "items", type: "string[]", def: "[]", note: ["Tab labels.", ""] },
    {
      prop: "value",
      type: "number",
      def: "0",
      note: ["Active tab index.", ""],
    },
    {
      prop: "variant",
      type: "underline|pill",
      def: "underline",
      note: ["Visual style.", ""],
    },
    {
      prop: "tone",
      type: "token",
      def: "accent/primary",
      note: ["Active tab colour (dante-ready).", "( dante)."],
    },
    {
      prop: "onChange",
      type: "(i)=>void",
      def: "—",
      note: ["Fires on tab click.", ""],
    },
  ];
  return componentBoard(
    t,
    "Tabs",
    ["Switch between peer views in place", ""],
    ["Navigate to a new page → use Links/Nav", "→ Links/Nav"],
    [await block(t, "Variants", variants), await block(t, "Tones", tabTones)],
    props,
  );
}

// ── Alert ─────────────────────────────────────────────────────

const ALERT_TYPE: Record<string, { icon: string; color: string }> = {
  Info: { icon: "info", color: "accent/secondary" },
  Dante: { icon: "sparkles", color: "accent/dante" },
  Success: { icon: "check", color: "feedback/success" },
  Warning: { icon: "alert-triangle", color: "feedback/warning" },
  Danger: { icon: "alert-triangle", color: "feedback/danger" },
};

async function drawAlert(
  t: ThemeContext,
  type: string,
  title: string,
  text: string,
  variant: "soft" | "outline",
  w: number,
): Promise<FrameNode> {
  const a = ALERT_TYPE[type];
  const c = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "MIN", padding: [14, 16] });
  c.resize(w, c.height);
  c.primaryAxisSizingMode = "FIXED";
  c.counterAxisSizingMode = "AUTO";
  c.cornerRadius = RADII.lg;
  if (variant === "soft") {
    fillToken(t, c, "bg/surface");
    strokeToken(t, c, "border/subtle", 1);
  } else {
    c.fills = [];
    strokeToken(t, c, a.color, 1);
  }
  c.appendChild(icon(t, a.icon, 20, a.color));
  const col = autoFrame({ direction: "VERTICAL", gap: 3 });
  col.layoutGrow = 1;
  col.appendChild(await makeText(t, "label/md", title, a.color));
  col.appendChild(await makeText(t, "body/sm", text, "text/secondary", { maxWidth: w - 84 }));
  c.appendChild(col);
  return c;
}

async function alertBoard(t: ThemeContext): Promise<FrameNode> {
  const w = CANVAS_INNER;
  const types = canvas(t);
  const stack = autoFrame({ direction: "VERTICAL", gap: 14 });
  stack.appendChild(
    await drawAlert(
      t,
      "Info",
      "Heads up",
      "A new version of the design system is available.",
      "soft",
      w - 56,
    ),
  );
  stack.appendChild(
    await drawAlert(
      t,
      "Success",
      "Saved",
      "Your changes were published successfully.",
      "soft",
      w - 56,
    ),
  );
  stack.appendChild(
    await drawAlert(
      t,
      "Warning",
      "Careful",
      "This action can affect other components.",
      "soft",
      w - 56,
    ),
  );
  stack.appendChild(
    await drawAlert(
      t,
      "Danger",
      "Something broke",
      "We couldn't save your changes. Try again.",
      "soft",
      w - 56,
    ),
  );
  stack.appendChild(
    await drawAlert(
      t,
      "Dante",
      "New drop",
      "Night drive vol. 2 just landed — the signature announcement style.",
      "soft",
      w - 56,
    ),
  );
  types.appendChild(stack);

  const variants = await tileGrid(
    t,
    [
      {
        label: ["Soft", ""],
        node: await drawAlert(
          t,
          "Info",
          "Soft alert",
          "Tinted surface with a colored icon.",
          "soft",
          360,
        ),
      },
      {
        label: ["Outline", ""],
        node: await drawAlert(
          t,
          "Info",
          "Outline alert",
          "Transparent with a colored border.",
          "outline",
          360,
        ),
      },
    ],
    380,
  );
  const props: PropRow[] = [
    {
      prop: "type",
      type: "info|success|warning|danger|dante",
      def: "info",
      note: ["Severity & color; dante = announcements.", "; dante = ."],
    },
    { prop: "title", type: "string", def: "—", note: ["Bold headline.", ""] },
    { prop: "text", type: "string", def: "—", note: ["Body message.", ""] },
    {
      prop: "variant",
      type: "soft|outline",
      def: "soft",
      note: ["Surface style.", ""],
    },
  ];
  return componentBoard(
    t,
    "Alert",
    ["Inline feedback about a state or result", ""],
    ["Transient toast → use Snackbar", "→ Snackbar"],
    [await block(t, "Types", types), await block(t, "Variants", variants)],
    props,
  );
}

// ── Avatar ────────────────────────────────────────────────────

async function drawAvatar2(
  t: ThemeContext,
  opts: {
    size?: Size;
    status?: "online" | "offline";
    shape?: "circle" | "rounded";
    initials?: string;
    hue?: "mint" | "dante" | "indigo";
    statusTone?: string;
  } = {},
): Promise<FrameNode> {
  const d = { sm: 36, md: 48, lg: 64 }[opts.size ?? "md"];
  const f = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  f.resize(d, d);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = opts.shape === "rounded" ? Math.round(d * 0.28) : RADII.full;
  const AVA_HUE: Record<string, [string, string]> = {
    mint: ["#5EE6C1", "#818CF8"],
    dante: ["#FF3D8B", "#B84BFF"],
    indigo: ["#818CF8", "#B84BFF"],
  };
  const [g1, g2] = AVA_HUE[opts.hue ?? "mint"];
  f.fills = [
    linearGradient(
      [
        { hex: g1, position: 0 },
        { hex: g2, position: 1 },
      ],
      "diagonal",
    ),
  ];
  strokeToken(t, f, "glass/border", 1);
  f.appendChild(
    await makeText(
      t,
      d >= 48 ? "heading/h4" : "label/sm",
      opts.initials ?? "OK",
      "accent/contrast",
    ),
  );
  if (opts.status) {
    const dd = Math.round(d * 0.26);
    const dot = ellipse(dd);
    fillToken(
      t,
      dot,
      opts.status === "online" ? (opts.statusTone ?? "feedback/success") : "text/muted",
    );
    strokeToken(t, dot, "bg/canvas", 2);
    f.appendChild(dot);
    dot.layoutPositioning = "ABSOLUTE";
    dot.x = d - dd;
    dot.y = d - dd;
  }
  return f;
}

async function avatarGroup(t: ThemeContext): Promise<FrameNode> {
  const f = figma.createFrame();
  f.name = "avatar-group";
  const d = 44;
  const off = 30;
  f.resize(off * 3 + d + 8 + d, d);
  f.fills = [];
  f.clipsContent = false;
  const inits = ["OK", "AB", "MK"];
  for (let i = 0; i < 3; i++) {
    const av = await drawAvatar2(t, { size: "md", initials: inits[i] });
    av.resize(d, d);
    strokeToken(t, av, "bg/canvas", 2);
    f.appendChild(av);
    av.x = i * off;
    av.y = 0;
  }
  const more = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  more.resize(d, d);
  more.primaryAxisSizingMode = "FIXED";
  more.counterAxisSizingMode = "FIXED";
  more.cornerRadius = RADII.full;
  fillToken(t, more, "bg/surface-raised");
  strokeToken(t, more, "bg/canvas", 2);
  more.appendChild(await makeText(t, "label/sm", "+3", "text/secondary"));
  f.appendChild(more);
  more.x = 3 * off;
  more.y = 0;
  return f;
}

async function avatarBoard(t: ThemeContext): Promise<FrameNode> {
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawAvatar2(t, { size: "sm" }) },
      { label: SIZE_LABEL.md, node: await drawAvatar2(t, { size: "md" }) },
      { label: SIZE_LABEL.lg, node: await drawAvatar2(t, { size: "lg" }) },
    ],
    120,
  );
  const status = await tileGrid(
    t,
    [
      { label: ["Online", ""], node: await drawAvatar2(t, { status: "online" }) },
      { label: ["Offline", ""], node: await drawAvatar2(t, { status: "offline" }) },
      { label: ["None", ""], node: await drawAvatar2(t, {}) },
    ],
    120,
  );
  const shapes = await tileGrid(
    t,
    [
      { label: ["Circle", ""], node: await drawAvatar2(t, { shape: "circle" }) },
      { label: ["Rounded", ""], node: await drawAvatar2(t, { shape: "rounded" }) },
    ],
    120,
  );
  const grp = await tileGrid(t, [{ label: ["Group", ""], node: await avatarGroup(t) }], 260);
  const avaTones = await tileGrid(
    t,
    [
      { label: ["Mint", ""], node: await drawAvatar2(t, {}) },
      { label: ["Dante", ""], node: await drawAvatar2(t, { hue: "dante" }) },
      { label: ["Indigo", ""], node: await drawAvatar2(t, { hue: "indigo" }) },
      {
        label: ["Dante dot · live", ""],
        node: await drawAvatar2(t, { status: "online", statusTone: "accent/dante" }),
      },
    ],
    130,
  );
  const props: PropRow[] = [
    {
      prop: "src",
      type: "string",
      def: "—",
      note: ["Image; falls back to initials.", ""],
    },
    { prop: "initials", type: "string", def: "—", note: ["Fallback letters.", ""] },
    {
      prop: "status",
      type: "online|offline",
      def: "—",
      note: ["Presence dot.", ""],
    },
    {
      prop: "shape",
      type: "circle|rounded",
      def: "circle",
      note: ["Avatar shape.", ""],
    },
    { prop: "size", type: "sm|md|lg", def: "md", note: ["Avatar size.", ""] },
  ];
  return componentBoard(
    t,
    "Avatar",
    ["Represent a person or entity compactly", ""],
    ["Decorative imagery → use Media / Photo", "→ Media / Photo"],
    [
      await block(t, "Sizes", sizes),
      await block(t, "Tones", avaTones),
      await block(t, "Status", status),
      await block(t, "Shape", shapes),
      await block(t, "Group", grp),
    ],
    props,
  );
}

// ── Select ────────────────────────────────────────────────────

const SEL_SIZE: Record<Size, { pad: [number, number]; w: number; text: string }> = {
  sm: { pad: [9, 12], w: 240, text: "body/sm" },
  md: { pad: [12, 14], w: 280, text: "body/md" },
  lg: { pad: [15, 16], w: 320, text: "body/lg" },
};

type SelState = "default" | "focus" | "filled" | "disabled" | "error";

interface SelOpt {
  group?: string;
  label?: string;
  desc?: string;
  iconName?: string;
  avatar?: string;
  dot?: string;
  selected?: boolean;
  checkbox?: boolean;
}

function miniAvatar(): FrameNode {
  const av = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  av.resize(24, 24);
  av.primaryAxisSizingMode = "FIXED";
  av.counterAxisSizingMode = "FIXED";
  av.cornerRadius = RADII.full;
  av.fills = [
    linearGradient(
      [
        { hex: "#5EE6C1", position: 0 },
        { hex: "#818CF8", position: 1 },
      ],
      "diagonal",
    ),
  ];
  return av;
}

async function selectOptionRow(
  t: ThemeContext,
  o: SelOpt,
  size: Size,
  w: number,
): Promise<FrameNode> {
  const c = SEL_SIZE[size];
  const row = autoFrame({
    direction: "HORIZONTAL",
    cross: "CENTER",
    align: "MIN",
    padding: [10, 12],
  });
  row.resize(w, row.height);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.cornerRadius = RADII.sm;
  if (o.selected && !o.checkbox) fillToken(t, row, "accent/soft");

  const left = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  left.layoutGrow = 1; // fill row → content left-aligned, trailing check pushed right
  if (o.checkbox)
    left.appendChild(await drawCheckbox(t, o.selected ? "Checked" : "Unchecked", false, "sm"));
  else if (o.iconName)
    left.appendChild(icon(t, o.iconName, 18, o.selected ? "accent/primary" : "text/secondary"));
  else if (o.avatar) {
    const av = miniAvatar();
    av.appendChild(await makeText(t, "caption", o.avatar, "accent/contrast"));
    left.appendChild(av);
  } else if (o.dot) left.appendChild(statusDot(t, o.dot, 8));

  const txt = autoFrame({ direction: "VERTICAL", gap: 1 });
  txt.appendChild(
    await makeText(t, c.text, o.label ?? "", o.selected ? "accent/primary" : "text/primary"),
  );
  if (o.desc) txt.appendChild(await makeText(t, "caption", o.desc, "text/muted"));
  left.appendChild(txt);
  row.appendChild(left);

  if (o.selected && !o.checkbox) row.appendChild(icon(t, "check", 16, "accent/primary"));
  return row;
}

async function selectMenu(
  t: ThemeContext,
  opts: {
    size?: Size;
    w: number;
    search?: boolean;
    loading?: boolean;
    empty?: boolean;
    rows?: SelOpt[];
  },
): Promise<FrameNode> {
  const c = SEL_SIZE[opts.size ?? "md"];
  const menu = autoFrame({ direction: "VERTICAL", gap: 2, padding: 6 });
  menu.resize(opts.w, menu.height);
  menu.counterAxisSizingMode = "FIXED";
  menu.cornerRadius = RADII.md;
  fillToken(t, menu, "bg/surface-raised");
  strokeToken(t, menu, "border/default", 1);
  await applyEffect(menu, "shadow/md", t);
  const iw = opts.w - 12;

  if (opts.search) {
    const s = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [9, 10] });
    s.resize(iw, s.height);
    s.primaryAxisSizingMode = "FIXED";
    s.counterAxisSizingMode = "AUTO";
    s.cornerRadius = RADII.sm;
    fillToken(t, s, "bg/inset");
    strokeToken(t, s, "border/subtle", 1);
    s.appendChild(icon(t, "search", 16, "text/muted"));
    s.appendChild(await makeText(t, c.text, "eng", "text/primary"));
    menu.appendChild(s);
    menu.appendChild(rect(iw, 8)); // air between search and options
  }

  if (opts.loading) {
    for (let i = 0; i < 3; i++) {
      const r = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", padding: [12, 12] });
      r.resize(iw, r.height);
      r.primaryAxisSizingMode = "FIXED";
      r.counterAxisSizingMode = "AUTO";
      const bar = rect(iw - 24, 12, 6);
      fillToken(t, bar, "bg/surface");
      r.appendChild(bar);
      menu.appendChild(r);
    }
  } else if (opts.empty) {
    const e = autoFrame({
      direction: "VERTICAL",
      align: "CENTER",
      cross: "CENTER",
      gap: 8,
      padding: [26, 12],
    });
    e.resize(iw, e.height);
    e.counterAxisSizingMode = "FIXED";
    e.appendChild(icon(t, "search", 22, "text/muted"));
    e.appendChild(await makeText(t, c.text, "No results", "text/muted"));
    menu.appendChild(e);
  } else if (opts.rows) {
    for (const o of opts.rows) {
      if (o.group) {
        const h = autoFrame({ direction: "HORIZONTAL", padding: { t: 10, r: 12, b: 4, l: 12 } });
        h.appendChild(await makeText(t, "overline", o.group, "text/muted"));
        menu.appendChild(h);
      } else {
        menu.appendChild(await selectOptionRow(t, o, opts.size ?? "md", iw));
      }
    }
  }
  return menu;
}

async function selectTrigger(
  t: ThemeContext,
  opts: {
    size?: Size;
    state?: SelState;
    value?: string;
    chips?: string[];
    label?: string | null;
    placeholder?: string;
    width?: number;
  },
): Promise<FrameNode> {
  const size = opts.size ?? "md";
  const c = SEL_SIZE[size];
  const W = opts.width ?? c.w;
  const col = autoFrame({ direction: "VERTICAL", gap: 7 });
  col.resize(W, col.height);
  col.counterAxisSizingMode = "FIXED";
  if (opts.label !== null)
    col.appendChild(await makeText(t, "label/sm", opts.label ?? "Team", "text/secondary"));

  const field = autoFrame({
    direction: "HORIZONTAL",
    cross: "CENTER",
    align: "SPACE_BETWEEN",
    padding: c.pad,
  });
  field.resize(W, field.height);
  field.primaryAxisSizingMode = "FIXED";
  field.counterAxisSizingMode = "AUTO";
  field.cornerRadius = RADII.md;
  fillToken(t, field, "bg/surface");
  const st = opts.state ?? "default";
  if (st === "focus") strokeToken(t, field, "state/focus", 1.5);
  else if (st === "error") strokeToken(t, field, "feedback/danger", 1.5);
  else strokeToken(t, field, "border/default", 1);

  if (opts.chips && opts.chips.length) {
    const chipRow = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
    for (const ch of opts.chips.slice(0, 2))
      chipRow.appendChild(await drawChip(t, ch, { variant: "Solid", size: "sm" }));
    if (opts.chips.length > 2)
      chipRow.appendChild(await makeText(t, c.text, `+${opts.chips.length - 2}`, "text/muted"));
    field.appendChild(chipRow);
  } else {
    field.appendChild(
      await makeText(
        t,
        c.text,
        opts.value ?? opts.placeholder ?? "Choose a team…",
        opts.value ? "text/primary" : "text/muted",
      ),
    );
  }
  field.appendChild(icon(t, "chevron-down", 18, "text/secondary"));
  col.appendChild(field);

  if (st === "error")
    col.appendChild(await makeText(t, "caption", "Please choose a team", "feedback/danger"));
  if (st === "disabled") col.opacity = 0.4;
  return col;
}

async function fullSelect(
  t: ThemeContext,
  trig: Parameters<typeof selectTrigger>[1],
  menu: Parameters<typeof selectMenu>[1],
): Promise<FrameNode> {
  const wrap = autoFrame({ direction: "VERTICAL", gap: 8 });
  wrap.appendChild(await selectTrigger(t, { ...trig, state: "focus" }));
  wrap.appendChild(await selectMenu(t, menu));
  return wrap;
}

async function selectBoard(t: ThemeContext): Promise<FrameNode> {
  const states = await tileGrid(
    t,
    [
      { label: ["Default", ""], node: await selectTrigger(t, {}) },
      {
        label: ["Focus", ""],
        node: await selectTrigger(t, { state: "focus", value: "Engineering" }),
      },
      {
        label: ["Filled", ""],
        node: await selectTrigger(t, { state: "filled", value: "Engineering" }),
      },
      {
        label: ["Disabled", ""],
        node: await selectTrigger(t, { state: "disabled", value: "Engineering" }),
      },
      { label: ["Error", ""], node: await selectTrigger(t, { state: "error" }) },
    ],
    300,
  );

  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await selectTrigger(t, { size: "sm", value: "Engineering" }) },
      { label: SIZE_LABEL.md, node: await selectTrigger(t, { size: "md", value: "Engineering" }) },
      { label: SIZE_LABEL.lg, node: await selectTrigger(t, { size: "lg", value: "Engineering" }) },
    ],
    340,
  );

  const single = await fullSelect(
    t,
    { value: "Engineering" },
    {
      w: 280,
      rows: [
        { label: "Product design" },
        { label: "Engineering", selected: true },
        { label: "Marketing" },
        { label: "Operations" },
      ],
    },
  );
  const multi = await fullSelect(
    t,
    { chips: ["Design", "Eng", "Ops"] },
    {
      w: 280,
      rows: [
        { label: "Product design", checkbox: true, selected: true },
        { label: "Engineering", checkbox: true, selected: true },
        { label: "Marketing", checkbox: true },
        { label: "Operations", checkbox: true, selected: true },
      ],
    },
  );
  const searchable = await fullSelect(
    t,
    { value: "Engineering" },
    {
      w: 280,
      search: true,
      rows: [
        { label: "Engineering", selected: true },
        { label: "Engineering — Platform" },
        { label: "Engineering — Mobile" },
      ],
    },
  );
  const grouped = await fullSelect(
    t,
    { value: "Berlin" },
    {
      w: 280,
      rows: [
        { group: "Americas" },
        { label: "New York" },
        { label: "São Paulo" },
        { group: "Europe" },
        { label: "Berlin", selected: true },
        { label: "London" },
      ],
    },
  );
  const variants = await tileGrid(
    t,
    [
      { label: ["Single", ""], node: single },
      { label: ["Multi", ""], node: multi },
      { label: ["Searchable", ""], node: searchable },
      { label: ["Grouped", ""], node: grouped },
    ],
    320,
  );

  const richMenu = await selectMenu(t, {
    w: 300,
    rows: [
      { label: "Plain option", selected: true },
      { label: "With icon", iconName: "star" },
      { label: "Kristján Óli", desc: "kristjan@studio.is" },
      { label: "Ada Byron", avatar: "AB" },
      { label: "Online now", dot: "feedback/success" },
    ],
  });
  const rich = await tileGrid(t, [{ label: ["Option content", ""], node: richMenu }], 320);

  const loadingMenu = await selectMenu(t, { w: 280, loading: true });
  const emptyMenu = await selectMenu(t, { w: 280, empty: true });
  const asyncBlock = await tileGrid(
    t,
    [
      { label: ["Loading", ""], node: loadingMenu },
      { label: ["Empty", ""], node: emptyMenu },
    ],
    300,
  );

  const props: PropRow[] = [
    {
      prop: "value",
      type: "T | T[]",
      def: "—",
      note: ["Selected value(s).", ""],
    },
    {
      prop: "multiple",
      type: "boolean",
      def: "false",
      note: ["Multi-select with checkboxes.", ""],
    },
    {
      prop: "options",
      type: "Option[]",
      def: "[]",
      note: ["Items (label, icon, desc…).", ""],
    },
    {
      prop: "searchable",
      type: "boolean",
      def: "false",
      note: ["Type to filter options.", ""],
    },
    {
      prop: "loading",
      type: "boolean",
      def: "false",
      note: ["Async options loading.", ""],
    },
    {
      prop: "label | placeholder",
      type: "string",
      def: "—",
      note: ["Top label / empty hint.", ""],
    },
    {
      prop: "error | helperText",
      type: "boolean | string",
      def: "—",
      note: ["Invalid state + message.", ""],
    },
    { prop: "disabled", type: "boolean", def: "false", note: ["Non-interactive.", ""] },
    { prop: "size", type: "sm|md|lg", def: "md", note: ["Trigger size.", ""] },
    { prop: "onChange", type: "(v)=>void", def: "—", note: ["Fires on select.", ""] },
  ];
  return componentBoard(
    t,
    "Select",
    ["Choose one or many from a known list", ""],
    ["Free text → use TextField / Autocomplete", "→ TextField / Autocomplete"],
    [
      await block(t, "States", states),
      await block(t, "Sizes", sizes),
      await block(t, "Variants", variants),
      await block(t, "Option content", rich),
      await block(t, "Async", asyncBlock),
    ],
    props,
  );
}

// ── Accordion ─────────────────────────────────────────────────

interface AccItem {
  q: string;
  a?: string;
  open?: boolean;
  iconName?: string;
  badge?: string;
  desc?: string;
  disabled?: boolean;
}

async function accHeader(t: ThemeContext, it: AccItem, w: number): Promise<FrameNode> {
  const h = autoFrame({
    direction: "HORIZONTAL",
    cross: "CENTER",
    align: "SPACE_BETWEEN",
    padding: [20, 26],
  });
  h.resize(w, h.height);
  h.primaryAxisSizingMode = "FIXED";
  h.counterAxisSizingMode = "AUTO";
  const left = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  if (it.iconName)
    left.appendChild(icon(t, it.iconName, 20, it.open ? "accent/primary" : "text/secondary"));
  const titleCol = autoFrame({ direction: "VERTICAL", gap: 2 });
  titleCol.appendChild(await makeText(t, "heading/h4", it.q, "text/primary"));
  if (it.desc) titleCol.appendChild(await makeText(t, "caption", it.desc, "text/muted"));
  left.appendChild(titleCol);
  h.appendChild(left);
  const right = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  if (it.badge) right.appendChild(await drawChip(t, it.badge, { variant: "Accent", size: "sm" }));
  right.appendChild(
    icon(
      t,
      it.open ? "chevron-up" : "chevron-down",
      18,
      it.open ? "accent/primary" : "text/secondary",
    ),
  );
  h.appendChild(right);
  if (it.disabled) h.opacity = 0.4;
  return h;
}

async function accBody(t: ThemeContext, it: AccItem, w: number): Promise<FrameNode> {
  const indent = it.iconName ? 58 : 26;
  const body = autoFrame({ direction: "VERTICAL", padding: { t: 2, r: 26, b: 22, l: indent } });
  body.appendChild(
    await makeText(t, "body/md", it.a ?? "", "text/muted", { maxWidth: w - indent - 26 }),
  );
  return body;
}

async function drawAccordion(
  t: ThemeContext,
  variant: "bordered" | "separated" | "flush",
  items: AccItem[],
  w: number,
): Promise<FrameNode> {
  if (variant === "separated") {
    const stack = autoFrame({ direction: "VERTICAL", gap: 14 });
    for (const it of items) {
      const c = autoFrame({ direction: "VERTICAL", gap: 0 });
      c.resize(w, c.height);
      c.counterAxisSizingMode = "FIXED";
      c.cornerRadius = RADII.lg;
      c.clipsContent = true;
      fillToken(t, c, "bg/surface");
      strokeToken(t, c, it.open ? "border/default" : "border/subtle", 1);
      c.appendChild(await accHeader(t, it, w));
      if (it.open) c.appendChild(await accBody(t, it, w));
      stack.appendChild(c);
    }
    return stack;
  }

  const card = autoFrame({ direction: "VERTICAL", gap: 0 });
  card.resize(w, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.clipsContent = true;
  if (variant === "bordered") {
    card.cornerRadius = RADII.lg;
    fillToken(t, card, "bg/surface");
    strokeToken(t, card, "border/subtle", 1);
  }
  for (let i = 0; i < items.length; i++) {
    card.appendChild(await accHeader(t, items[i], w));
    if (items[i].open) card.appendChild(await accBody(t, items[i], w));
    if (i < items.length - 1) card.appendChild(hairline(t, w));
  }
  return card;
}

async function accordionBoard(t: ThemeContext): Promise<FrameNode> {
  const base: AccItem[] = [
    { q: "What's included?" },
    {
      q: "Can I customize it?",
      open: true,
      a: "Yes — every token, component and page is generated from editable TypeScript definitions.",
    },
    { q: "Is it responsive?" },
  ];
  const variants = await tileGrid(
    t,
    [
      { label: ["Bordered", ""], node: await drawAccordion(t, "bordered", base, 640) },
      { label: ["Separated", ""], node: await drawAccordion(t, "separated", base, 640) },
      { label: ["Flush", ""], node: await drawAccordion(t, "flush", base, 640) },
    ],
    660,
  );

  const rich: AccItem[] = [
    {
      q: "Billing",
      iconName: "file",
      badge: "New",
      open: true,
      a: "Manage your plan, invoices and payment methods.",
    },
    { q: "Security", iconName: "info", desc: "2FA, active sessions" },
    { q: "Danger zone", iconName: "alert-triangle", disabled: true },
  ];
  const features = canvas(t);
  features.appendChild(await drawAccordion(t, "bordered", rich, 748));

  const props: PropRow[] = [
    { prop: "items", type: "{title,content,icon?…}[]", def: "[]", note: ["Sections.", ""] },
    {
      prop: "variant",
      type: "bordered|separated|flush",
      def: "bordered",
      note: ["Container style.", ""],
    },
    {
      prop: "icon | badge | desc",
      type: "ReactNode | string",
      def: "—",
      note: ["Header extras.", ""],
    },
    {
      prop: "multiple",
      type: "boolean",
      def: "false",
      note: ["Allow many open at once.", ""],
    },
    {
      prop: "defaultOpen",
      type: "number[]",
      def: "[]",
      note: ["Initially expanded.", ""],
    },
    {
      prop: "disabled",
      type: "boolean",
      def: "false",
      note: ["Lock a section.", ""],
    },
  ];
  return componentBoard(
    t,
    "Accordion",
    ["Collapse long content into expandable sections", ""],
    ["A few always-visible facts → plain list", ""],
    [await block(t, "Variants", variants), await block(t, "Item features", features)],
    props,
  );
}

// ── Tooltip ───────────────────────────────────────────────────

type TipPlace = "top" | "bottom" | "left" | "right";

type TipTone = "default" | "accent" | "dante" | "indigo" | "success" | "warning" | "danger";

interface TipOpts {
  text: string;
  title?: string;
  iconName?: string;
  shortcut?: string[];
  tone?: TipTone;
}

const TIP_TONE: Record<TipTone, { bg: string; text: string }> = {
  default: { bg: "bg/surface-raised", text: "text/primary" },
  accent: { bg: "accent/primary", text: "accent/contrast" },
  dante: { bg: "accent/dante", text: "accent/contrast" },
  indigo: { bg: "accent/secondary", text: "accent/contrast" },
  success: { bg: "feedback/success", text: "accent/contrast" },
  warning: { bg: "feedback/warning", text: "accent/contrast" },
  danger: { bg: "feedback/danger", text: "accent/contrast" },
};

async function tooltipBubble(t: ThemeContext, o: TipOpts): Promise<FrameNode> {
  const tone = o.tone ?? "default";
  const tn = TIP_TONE[tone];
  const bubble = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [9, 12] });
  bubble.cornerRadius = RADII.md;
  fillToken(t, bubble, tn.bg);
  if (tone === "default") strokeToken(t, bubble, "border/default", 1);
  await applyEffect(bubble, "shadow/md", t);
  if (o.iconName) bubble.appendChild(icon(t, o.iconName, 16, tn.text));
  const txt = autoFrame({ direction: "VERTICAL", gap: 1 });
  if (o.title) {
    txt.appendChild(await makeText(t, "label/sm", o.title, tn.text));
    txt.appendChild(
      await makeText(t, "caption", o.text, tone === "default" ? "text/muted" : tn.text, {
        maxWidth: 220,
      }),
    );
  } else {
    txt.appendChild(await makeText(t, "label/sm", o.text, tn.text));
  }
  bubble.appendChild(txt);
  if (o.shortcut) bubble.appendChild(await drawShortcut(t, o.shortcut, "sm"));
  return bubble;
}

const TRI: Record<TipPlace, string> = {
  top: "M0 0 L12 0 L6 7 Z",
  bottom: "M6 0 L12 7 L0 7 Z",
  left: "M0 0 L7 6 L0 12 Z",
  right: "M7 0 L0 6 L7 12 Z",
};

async function drawTooltip(t: ThemeContext, o: TipOpts, placement: TipPlace): Promise<FrameNode> {
  const bubble = await tooltipBubble(t, o);
  const tri = figma.createVector();
  tri.vectorPaths = [{ windingRule: "NONZERO", data: TRI[placement] }];
  fillToken(t, tri, TIP_TONE[o.tone ?? "default"].bg);
  tri.strokes = [];
  const anchor = await drawButton(t, "Soft", "Default", "sm", "pill", "Hover me");

  const horizontal = placement === "left" || placement === "right";
  const wrap = autoFrame({
    direction: horizontal ? "HORIZONTAL" : "VERTICAL",
    gap: 6,
    align: "CENTER",
    cross: "CENTER",
  });
  const order =
    placement === "top" || placement === "left" ? [bubble, tri, anchor] : [anchor, tri, bubble];
  for (const n of order) wrap.appendChild(n);
  return wrap;
}

async function tooltipBoard(t: ThemeContext): Promise<FrameNode> {
  const placements = await tileGrid(
    t,
    [
      {
        label: ["Top", ""],
        node: await drawTooltip(t, { text: "Opens in a new tab" }, "top"),
      },
      {
        label: ["Bottom", ""],
        node: await drawTooltip(t, { text: "Copied to clipboard" }, "bottom"),
      },
      { label: ["Left", ""], node: await drawTooltip(t, { text: "Previous" }, "left") },
      { label: ["Right", ""], node: await drawTooltip(t, { text: "Next" }, "right") },
    ],
    260,
  );
  const content = await tileGrid(
    t,
    [
      { label: ["Plain", ""], node: await drawTooltip(t, { text: "Copy link" }, "top") },
      {
        label: ["Title + text", ""],
        node: await drawTooltip(
          t,
          { title: "Keyboard shortcut", text: "Press to run the last command." },
          "top",
        ),
      },
      {
        label: ["With icon", ""],
        node: await drawTooltip(t, { text: "External link", iconName: "external-link" }, "top"),
      },
      {
        label: ["With shortcut", ""],
        node: await drawTooltip(t, { text: "Command palette", shortcut: ["⌘", "K"] }, "top"),
      },
    ],
    300,
  );
  const tones = await tileGrid(
    t,
    [
      { label: ["Default", ""], node: await drawTooltip(t, { text: "Neutral" }, "top") },
      {
        label: ["Accent", ""],
        node: await drawTooltip(t, { text: "Highlighted", tone: "accent" }, "top"),
      },
      {
        label: ["Dante", ""],
        node: await drawTooltip(t, { text: "Signature", tone: "dante" }, "top"),
      },
      {
        label: ["Indigo", ""],
        node: await drawTooltip(t, { text: "Info", tone: "indigo" }, "top"),
      },
      {
        label: ["Success", ""],
        node: await drawTooltip(t, { text: "Saved", tone: "success" }, "top"),
      },
      {
        label: ["Warning", ""],
        node: await drawTooltip(t, { text: "Careful", tone: "warning" }, "top"),
      },
      {
        label: ["Danger", ""],
        node: await drawTooltip(t, { text: "Failed", tone: "danger" }, "top"),
      },
    ],
    240,
  );
  const props: PropRow[] = [
    {
      prop: "title",
      type: "string",
      def: "—",
      note: ["Bold first line.", ""],
    },
    { prop: "text", type: "string", def: "—", note: ["Tooltip body.", ""] },
    {
      prop: "placement",
      type: "top|bottom|left|right",
      def: "top",
      note: ["Which side + arrow.", ""],
    },
    {
      prop: "tone",
      type: "default|accent|dante|indigo|success|warning|danger",
      def: "default",
      note: ["Color of the bubble.", ""],
    },
    {
      prop: "icon | shortcut",
      type: "IconName | string[]",
      def: "—",
      note: ["Leading icon / kbd hint.", ""],
    },
    {
      prop: "arrow | delay",
      type: "boolean | number",
      def: "true, 200",
      note: ["Pointer & show delay.", ""],
    },
  ];
  return componentBoard(
    t,
    "Tooltip",
    ["Explain an element on hover, briefly", ""],
    ["Essential info → don't hide it in a tooltip", ""],
    [
      await block(t, "Placement", placements),
      await block(t, "Content", content),
      await block(t, "Tones", tones),
    ],
    props,
  );
}

// ── Progress ──────────────────────────────────────────────────

function drawProgressLinear(
  t: ThemeContext,
  value: number,
  indeterminate: boolean,
  w: number,
  tone = "accent/primary",
): FrameNode {
  const f = figma.createFrame();
  f.name = "progress/linear";
  f.resize(w, 6);
  f.fills = [];
  const rail = rect(w, 6, 3);
  fillToken(t, rail, "bg/surface-raised");
  f.appendChild(rail);
  if (indeterminate) {
    const seg = rect(Math.round(w * 0.35), 6, 3);
    fillToken(t, seg, tone);
    seg.x = Math.round(w * 0.3);
    f.appendChild(seg);
  } else {
    const fill = rect(Math.max(6, w * value), 6, 3);
    fillToken(t, fill, tone);
    f.appendChild(fill);
  }
  return f;
}

async function drawProgressCircular(
  t: ThemeContext,
  value: number,
  d: number,
  tone = "accent/primary",
): Promise<FrameNode> {
  const f = figma.createFrame();
  f.name = "progress/circular";
  f.resize(d, d);
  f.fills = [];
  const track = ellipse(d);
  track.arcData = { startingAngle: 0, endingAngle: Math.PI * 2, innerRadius: 0.82 };
  fillToken(t, track, "bg/surface-raised");
  f.appendChild(track);
  const arc = ellipse(d);
  arc.arcData = {
    startingAngle: -Math.PI / 2,
    endingAngle: -Math.PI / 2 + value * Math.PI * 2,
    innerRadius: 0.82,
  };
  fillToken(t, arc, tone);
  f.appendChild(arc);
  const lbl = await makeText(t, "label/sm", `${Math.round(value * 100)}%`, "text/secondary");
  f.appendChild(lbl);
  lbl.x = d / 2 - lbl.width / 2;
  lbl.y = d / 2 - lbl.height / 2;
  return f;
}

async function progressBoard(t: ThemeContext): Promise<FrameNode> {
  const linear = await tileGrid(
    t,
    [
      { label: ["Determinate", ""], node: drawProgressLinear(t, 0.6, false, 240) },
      { label: ["Indeterminate", ""], node: drawProgressLinear(t, 0, true, 240) },
    ],
    280,
  );
  const circular = await tileGrid(
    t,
    [
      { label: ["70%", "70%"], node: await drawProgressCircular(t, 0.7, 56) },
      { label: ["40%", "40%"], node: await drawProgressCircular(t, 0.4, 56) },
    ],
    120,
  );
  const pgLin: Array<{ label: Bi; node: SceneNode }> = [];
  for (const [en, ru, tk] of TONES_9)
    pgLin.push({ label: [en, ru], node: drawProgressLinear(t, 0.6, false, 240, tk) });
  const pgCirc: Array<{ label: Bi; node: SceneNode }> = [];
  for (const [en, ru, tk] of TONES_9)
    pgCirc.push({ label: [en, ru], node: await drawProgressCircular(t, 0.7, 56, tk) });
  const tonesCol = autoFrame({ direction: "VERTICAL", gap: 16 });
  tonesCol.layoutAlign = "STRETCH";
  tonesCol.appendChild(await tileGrid(t, pgLin, 280));
  tonesCol.appendChild(await tileGrid(t, pgCirc, 120));
  const props: PropRow[] = [
    { prop: "value", type: "number", def: "0", note: ["0–1 progress.", ""] },
    { prop: "variant", type: "linear|circular", def: "linear", note: ["Shape.", ""] },
    {
      prop: "indeterminate",
      type: "boolean",
      def: "false",
      note: ["Unknown duration.", ""],
    },
    { prop: "size", type: "number", def: "—", note: ["Circular diameter.", ""] },
    {
      prop: "tone",
      type: "token",
      def: "accent/primary",
      note: ["Fill colour (dante-ready).", "( dante)."],
    },
  ];
  return componentBoard(
    t,
    "Progress",
    ["Show ongoing or completed work", ""],
    ["Placeholder while loading → use Skeleton", "→ Skeleton"],
    [
      await block(t, "Linear", linear),
      await block(t, "Circular", circular),
      await block(t, "Tones", tonesCol),
    ],
    props,
  );
}

// ── Breadcrumbs ───────────────────────────────────────────────

async function drawBreadcrumbs(t: ThemeContext): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  const items = [
    { label: "Home", iconName: "home" },
    { label: "Components", iconName: "" },
    { label: "Button", iconName: "" },
  ];
  for (let i = 0; i < items.length; i++) {
    const last = i === items.length - 1;
    const it = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
    if (items[i].iconName)
      it.appendChild(icon(t, items[i].iconName, 15, last ? "text/primary" : "text/muted"));
    it.appendChild(
      await makeText(t, "label/md", items[i].label, last ? "text/primary" : "text/muted"),
    );
    row.appendChild(it);
    if (!last) row.appendChild(icon(t, "chevron-right", 14, "text/muted"));
  }
  return row;
}

async function breadcrumbsBoard(t: ThemeContext): Promise<FrameNode> {
  const showcase = canvas(t);
  showcase.appendChild(await drawBreadcrumbs(t));
  const props: PropRow[] = [
    {
      prop: "items",
      type: "{label,href}[]",
      def: "[]",
      note: ["Path segments.", ""],
    },
    {
      prop: "separator",
      type: "ReactNode",
      def: "chevron",
      note: ["Between items.", ""],
    },
    {
      prop: "maxItems",
      type: "number",
      def: "—",
      note: ["Collapse long paths.", ""],
    },
  ];
  return componentBoard(
    t,
    "Breadcrumbs",
    ["Show where the user is in a hierarchy", ""],
    ["Peer views → use Tabs", "→ Tabs"],
    [await block(t, "Breadcrumbs", showcase)],
    props,
  );
}

// ── Pagination ────────────────────────────────────────────────

async function pageBtn(
  t: ThemeContext,
  label: string,
  active: boolean,
  disabled = false,
  tone = "accent/primary",
): Promise<FrameNode> {
  const b = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  b.resize(36, 36);
  b.primaryAxisSizingMode = "FIXED";
  b.counterAxisSizingMode = "FIXED";
  b.cornerRadius = RADII.md;
  if (active) {
    fillToken(t, b, tone);
    b.appendChild(await makeText(t, "label/md", label, "accent/contrast"));
  } else {
    fillToken(t, b, "bg/surface");
    strokeToken(t, b, "border/subtle", 1);
    b.appendChild(await makeText(t, "label/md", label, "text/secondary"));
  }
  if (disabled) b.opacity = 0.4;
  return b;
}

function chevPageBtn(t: ThemeContext, name: string, disabled = false): FrameNode {
  const b = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  b.resize(36, 36);
  b.primaryAxisSizingMode = "FIXED";
  b.counterAxisSizingMode = "FIXED";
  b.cornerRadius = RADII.md;
  fillToken(t, b, "bg/surface");
  strokeToken(t, b, "border/subtle", 1);
  b.appendChild(icon(t, name, 16, disabled ? "text/muted" : "text/secondary"));
  if (disabled) b.opacity = 0.4;
  return b;
}

function ellipsisCell(t: ThemeContext): Promise<TextNode> {
  return makeText(t, "label/md", "…", "text/muted");
}

/** MUI-style page range with boundaries + sibling window + ellipses. */
function pageItems(page: number, count: number, sib = 1): Array<number | "…"> {
  const boundary = 1;
  const range = (s: number, e: number) => {
    const a: number[] = [];
    for (let i = s; i <= e; i++) a.push(i);
    return a;
  };
  const totalShown = boundary * 2 + sib * 2 + 3;
  if (count <= totalShown) return range(1, count);
  const left = Math.max(page - sib, boundary + 2);
  const right = Math.min(page + sib, count - boundary - 1);
  const items: Array<number | "…"> = [];
  items.push(...range(1, boundary));
  if (left > boundary + 2) items.push("…");
  else items.push(...range(boundary + 1, left - 1));
  items.push(...range(left, right));
  if (right < count - boundary - 1) items.push("…");
  else items.push(...range(right + 1, count - boundary));
  items.push(...range(count - boundary + 1, count));
  return items;
}

async function drawPagination(
  t: ThemeContext,
  opts: { page: number; count: number; sib?: number; disabled?: boolean; tone?: string },
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
  const d = !!opts.disabled;
  row.appendChild(chevPageBtn(t, "chevron-left", d || opts.page <= 1));
  for (const item of pageItems(opts.page, opts.count, opts.sib ?? 1)) {
    if (item === "…") {
      const cell = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
      cell.resize(28, 36);
      cell.primaryAxisSizingMode = "FIXED";
      cell.counterAxisSizingMode = "FIXED";
      cell.appendChild(await ellipsisCell(t));
      row.appendChild(cell);
    } else {
      row.appendChild(
        await pageBtn(t, String(item), item === opts.page, false, opts.tone ?? "accent/primary"),
      );
    }
  }
  row.appendChild(chevPageBtn(t, "chevron-right", d || opts.page >= opts.count));
  if (d) row.opacity = 0.4;
  return row;
}

async function drawPaginationCompact(
  t: ThemeContext,
  opts: { page: number; count: number; minimal?: boolean; disabled?: boolean },
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  const d = !!opts.disabled;
  row.appendChild(chevPageBtn(t, "chevron-left", d || opts.page <= 1));
  const center = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [9, 16],
  });
  center.cornerRadius = RADII.full;
  fillToken(t, center, "bg/surface");
  strokeToken(t, center, "border/subtle", 1);
  if (opts.minimal) {
    center.appendChild(
      await makeText(t, "mono/sm", `${opts.page} / ${opts.count}`, "text/secondary"),
    );
  } else {
    center.appendChild(
      await makeText(t, "body/sm", `Page ${opts.page} of ${opts.count}`, "text/secondary"),
    );
  }
  row.appendChild(center);
  row.appendChild(chevPageBtn(t, "chevron-right", d || opts.page >= opts.count));
  if (d) row.opacity = 0.4;
  return row;
}

async function paginationBoard(t: ThemeContext): Promise<FrameNode> {
  const cases = await tileGrid(
    t,
    [
      { label: ["First page", ""], node: await drawPagination(t, { page: 1, count: 10 }) },
      { label: ["Middle", ""], node: await drawPagination(t, { page: 5, count: 20 }) },
      { label: ["Last page", ""], node: await drawPagination(t, { page: 10, count: 10 }) },
      {
        label: ["Few pages", ""],
        node: await drawPagination(t, { page: 2, count: 4 }),
      },
      {
        label: ["Wide window", ""],
        node: await drawPagination(t, { page: 8, count: 20, sib: 2 }),
      },
      {
        label: ["Disabled", ""],
        node: await drawPagination(t, { page: 2, count: 10, disabled: true }),
      },
    ],
    500,
  );
  const compact = await tileGrid(
    t,
    [
      {
        label: ["Labeled (mobile)", ""],
        node: await drawPaginationCompact(t, { page: 2, count: 10 }),
      },
      {
        label: ["Minimal", ""],
        node: await drawPaginationCompact(t, { page: 2, count: 10, minimal: true }),
      },
      {
        label: ["First (prev off)", "(prev off)"],
        node: await drawPaginationCompact(t, { page: 1, count: 10 }),
      },
      {
        label: ["Disabled", ""],
        node: await drawPaginationCompact(t, { page: 2, count: 10, disabled: true }),
      },
    ],
    280,
  );
  const tones = await tileGrid(
    t,
    [
      {
        label: ["Accent", ""],
        node: await drawPagination(t, { page: 3, count: 6, tone: "accent/primary" }),
      },
      {
        label: ["Dante", ""],
        node: await drawPagination(t, { page: 3, count: 6, tone: "accent/dante" }),
      },
      {
        label: ["Indigo", ""],
        node: await drawPagination(t, { page: 3, count: 6, tone: "accent/secondary" }),
      },
      {
        label: ["Success", ""],
        node: await drawPagination(t, { page: 3, count: 6, tone: "feedback/success" }),
      },
      {
        label: ["Warning", ""],
        node: await drawPagination(t, { page: 3, count: 6, tone: "feedback/warning" }),
      },
      {
        label: ["Danger", ""],
        node: await drawPagination(t, { page: 3, count: 6, tone: "feedback/danger" }),
      },
    ],
    440,
  );
  const props: PropRow[] = [
    { prop: "page", type: "number", def: "1", note: ["Current page.", ""] },
    { prop: "count", type: "number", def: "1", note: ["Total pages.", ""] },
    {
      prop: "siblingCount",
      type: "number",
      def: "1",
      note: ["Pages around current.", ""],
    },
    {
      prop: "boundaryCount",
      type: "number",
      def: "1",
      note: ["Pages at the ends.", ""],
    },
    {
      prop: "tone",
      type: "token",
      def: "accent/primary",
      note: ["Active page color.", ""],
    },
    {
      prop: "compact",
      type: "boolean",
      def: "false",
      note: ["Mobile prev/next + label.", ".: prev/next + ."],
    },
    {
      prop: "disabled",
      type: "boolean",
      def: "false",
      note: ["Whole control off.", ""],
    },
    {
      prop: "onChange",
      type: "(p)=>void",
      def: "—",
      note: ["Fires on page click.", ""],
    },
  ];
  return componentBoard(
    t,
    "Pagination",
    ["Move through many pages of results", ""],
    ["Infinite feed → use a Load-more / scroll", "→ Load-more /"],
    [
      await block(t, "Cases", cases),
      await block(t, "Compact (mobile)", compact),
      await block(t, "Tones", tones),
    ],
    props,
  );
}

// ── ChipGroup (token set — tags, files, filters, multi-values) ──

interface ChipItem {
  label: string;
  iconName?: string;
  removable?: boolean;
  variant?: ChipVariant;
}

async function chipRow(
  t: ThemeContext,
  items: ChipItem[],
  w?: number,
  size: Size = "sm",
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", wrap: !!w });
  if (w) {
    row.primaryAxisSizingMode = "FIXED";
    row.counterAxisSizingMode = "AUTO";
    row.resize(w, row.height);
    row.counterAxisSpacing = 8;
  }
  for (const it of items) {
    row.appendChild(
      await drawChip(t, it.label, {
        variant: it.variant ?? "Solid",
        size,
        iconName: it.iconName,
        removable: it.removable,
      }),
    );
  }
  return row;
}

async function chipField(
  t: ThemeContext,
  label: string,
  items: ChipItem[],
  add: string,
  w = 340,
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 7 });
  col.resize(w, col.height);
  col.counterAxisSizingMode = "FIXED";
  col.appendChild(await makeText(t, "label/sm", label, "text/secondary"));
  const field = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    cross: "CENTER",
    wrap: true,
    padding: [8, 10],
  });
  field.resize(w, field.height);
  field.primaryAxisSizingMode = "FIXED";
  field.counterAxisSizingMode = "AUTO";
  field.counterAxisSpacing = 8;
  field.cornerRadius = RADII.md;
  fillToken(t, field, "bg/surface");
  strokeToken(t, field, "border/default", 1);
  for (const it of items)
    field.appendChild(
      await drawChip(t, it.label, {
        variant: "Solid",
        size: "sm",
        iconName: it.iconName,
        removable: true,
      }),
    );
  field.appendChild(await makeText(t, "body/sm", add, "text/muted"));
  col.appendChild(field);
  return col;
}

async function chipGroupBoard(t: ThemeContext): Promise<FrameNode> {
  const tags = await chipRow(
    t,
    [
      { label: "Design", removable: true },
      { label: "Engineering", removable: true },
      { label: "Operations", removable: true },
      { label: "Add", variant: "Outline", iconName: "plus" },
    ],
    340,
  );
  const overflow = await chipRow(t, [
    { label: "Design" },
    { label: "Engineering" },
    { label: "+2", variant: "Outline" },
  ]);
  const files = await chipRow(
    t,
    [
      { label: "report.pdf", iconName: "file", removable: true },
      { label: "data.csv", iconName: "file", removable: true },
      { label: "cover.png", iconName: "file", removable: true },
    ],
    340,
  );
  const field = await chipField(
    t,
    "Recipients",
    [{ label: "ada@studio.is" }, { label: "grace@studio.is" }],
    "Add people…",
  );

  const showcase = await tileGrid(
    t,
    [
      { label: ["Removable tags", ""], node: tags },
      { label: ["Overflow +N", "+N"], node: overflow },
      { label: ["Files", ""], node: files },
      { label: ["In a field (TokenField)", "(TokenField)"], node: field },
    ],
    360,
  );
  const props: PropRow[] = [
    {
      prop: "items",
      type: "ChipItem[]",
      def: "[]",
      note: ["Tokens (label, icon…).", ""],
    },
    {
      prop: "removable",
      type: "boolean",
      def: "false",
      note: ["Show × on each chip.", ""],
    },
    {
      prop: "max",
      type: "number",
      def: "—",
      note: ["Collapse extra into +N.", "+N."],
    },
    {
      prop: "addable",
      type: "boolean",
      def: "false",
      note: ["Trailing add affordance.", ""],
    },
    {
      prop: "field",
      type: "boolean",
      def: "false",
      note: ["Wrap in an input (TokenField).", "(TokenField)."],
    },
    { prop: "size", type: "sm|md|lg", def: "sm", note: ["Chip size.", ""] },
  ];
  return componentBoard(
    t,
    "ChipGroup",
    ["A set of tokens: tags, files, filters, recipients, multi-values", ""],
    ["A single token → use Chip", "→ Chip"],
    [await block(t, "Uses", showcase)],
    props,
  );
}

// ── MediaPlayer ───────────────────────────────────────────────

function playTriangle(t: ThemeContext, size: number, token = "text/primary"): FrameNode {
  const f = figma.createFrame();
  f.name = "icon/play";
  f.resize(size, size);
  f.fills = [];
  const v = figma.createVector();
  v.vectorPaths = [
    {
      windingRule: "NONZERO",
      data: `M ${size * 0.26} ${size * 0.18} L ${size * 0.84} ${size * 0.5} L ${size * 0.26} ${size * 0.82} Z`,
    },
  ];
  fillToken(t, v, token);
  v.strokes = [];
  f.appendChild(v);
  return f;
}

async function drawPlayer(
  t: ThemeContext,
  variant: "card" | "mini",
  playing: boolean,
): Promise<FrameNode> {
  if (variant === "mini") {
    const card = autoFrame({
      direction: "HORIZONTAL",
      gap: 14,
      cross: "CENTER",
      padding: [12, 14],
    });
    card.resize(340, card.height);
    card.primaryAxisSizingMode = "FIXED";
    card.counterAxisSizingMode = "AUTO";
    card.cornerRadius = RADII.lg;
    fillToken(t, card, "bg/surface");
    strokeToken(t, card, "border/subtle", 1);

    const art = rect(56, 56, RADII.md);
    art.name = "Album art — replace fill with image";
    art.fills = [
      linearGradient(
        [
          { hex: "#3A2E52", position: 0 },
          { hex: "#12332B", position: 1 },
        ],
        "diagonal",
      ),
    ];
    card.appendChild(art);

    const meta = autoFrame({ direction: "VERTICAL", gap: 2 });
    meta.layoutGrow = 1;
    meta.appendChild(await makeText(t, "label/md", "Aurora Sessions", "text/primary"));
    meta.appendChild(await makeText(t, "caption", "Nightform", "text/muted"));
    card.appendChild(meta);
    card.appendChild(playing ? icon(t, "pause", 22, "text/primary") : playTriangle(t, 22));
    return card;
  }

  const W = 520;
  const H = 224;
  const card = autoFrame({ direction: "HORIZONTAL" });
  card.resize(W, H);
  card.primaryAxisSizingMode = "FIXED";
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  card.clipsContent = true;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);

  const left = autoFrame({ direction: "VERTICAL", align: "SPACE_BETWEEN", padding: 28 });
  left.layoutGrow = 1;
  left.layoutAlign = "STRETCH";
  left.primaryAxisAlignItems = "SPACE_BETWEEN";
  const seekW = W - H - 56; // left inner width

  const meta = autoFrame({ direction: "VERTICAL", gap: 6 });
  meta.appendChild(await makeText(t, "heading/h2", "Aurora Sessions", "text/primary"));
  meta.appendChild(await makeText(t, "body/md", "Nightform", "text/muted"));
  left.appendChild(meta);

  const bottom = autoFrame({ direction: "VERTICAL", gap: 16 });
  const seekWrap = autoFrame({ direction: "VERTICAL", gap: 6 });
  seekWrap.appendChild(await drawSlider(t, { value: 0.35, size: "sm", length: seekW }));
  const times = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", align: "SPACE_BETWEEN" });
  times.resize(seekW, times.height);
  times.primaryAxisSizingMode = "FIXED";
  times.counterAxisSizingMode = "AUTO";
  times.appendChild(await makeText(t, "mono/sm", "0:42", "text/muted"));
  times.appendChild(await makeText(t, "mono/sm", "3:18", "text/muted"));
  seekWrap.appendChild(times);
  bottom.appendChild(seekWrap);

  const controls = autoFrame({ direction: "HORIZONTAL", gap: 26, cross: "CENTER" });
  controls.appendChild(icon(t, "skip-back", 24, "text/primary"));
  controls.appendChild(playing ? icon(t, "pause", 32, "text/primary") : playTriangle(t, 32));
  controls.appendChild(icon(t, "skip-forward", 24, "text/primary"));
  bottom.appendChild(controls);
  left.appendChild(bottom);
  card.appendChild(left);

  const art = rect(H, H);
  art.name = "Album art — replace fill with image";
  art.fills = [
    linearGradient(
      [
        { hex: "#3A2E52", position: 0 },
        { hex: "#12332B", position: 1 },
      ],
      "diagonal",
    ),
  ];
  card.appendChild(art);
  return card;
}

interface TrackOpts {
  index: number;
  title: string;
  duration: string;
  explicit?: boolean;
  favorited?: boolean;
  playing?: boolean;
  active?: boolean;
}

function equalizer(t: ThemeContext, h = 14): FrameNode {
  const f = autoFrame({ direction: "HORIZONTAL", gap: 2, cross: "MAX" });
  for (const frac of [0.45, 1, 0.65, 0.85]) {
    const bar = rect(2.5, Math.max(3, Math.round(frac * h)), 1);
    fillToken(t, bar, "accent/primary");
    f.appendChild(bar);
  }
  return f;
}

function explicitBadge(t: ThemeContext): FrameNode {
  const e = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  e.resize(18, 18);
  e.primaryAxisSizingMode = "FIXED";
  e.counterAxisSizingMode = "FIXED";
  e.cornerRadius = 4;
  fillToken(t, e, "bg/surface-raised");
  return e;
}

async function drawTrackRow(t: ThemeContext, o: TrackOpts, w: number): Promise<FrameNode> {
  const row = autoFrame({
    direction: "HORIZONTAL",
    cross: "CENTER",
    align: "SPACE_BETWEEN",
    padding: [12, 16],
  });
  row.resize(w, row.height);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.cornerRadius = RADII.md;
  if (o.active) fillToken(t, row, "bg/surface-raised");

  const left = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER" });
  left.appendChild(
    o.favorited ? iconFilled(t, "star", 16, "feedback/danger") : icon(t, "star", 16, "text/muted"),
  );
  const num = autoFrame({
    direction: "HORIZONTAL",
    align: o.playing ? "CENTER" : "MAX",
    cross: "CENTER",
  });
  num.resize(20, num.height);
  num.primaryAxisSizingMode = "FIXED";
  num.counterAxisSizingMode = "AUTO";
  if (o.playing) num.appendChild(equalizer(t));
  else num.appendChild(await makeText(t, "mono/sm", String(o.index), "text/muted"));
  left.appendChild(num);
  const titleRow = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  titleRow.appendChild(
    await makeText(t, "label/md", o.title, o.playing ? "accent/primary" : "text/primary"),
  );
  if (o.explicit) {
    const badge = explicitBadge(t);
    badge.appendChild(await makeText(t, "caption", "E", "text/muted"));
    titleRow.appendChild(badge);
  }
  left.appendChild(titleRow);
  row.appendChild(left);

  const right = autoFrame({ direction: "HORIZONTAL", gap: 16, cross: "CENTER" });
  right.appendChild(await makeText(t, "mono/sm", o.duration, "text/muted"));
  right.appendChild(icon(t, "more-horizontal", 18, "text/muted"));
  row.appendChild(right);
  return row;
}

async function trackListBoard(t: ThemeContext): Promise<FrameNode> {
  const W = 720;
  const list = autoFrame({ direction: "VERTICAL", gap: 2, padding: 8 });
  list.resize(W, list.height);
  list.counterAxisSizingMode = "FIXED";
  list.cornerRadius = RADII.lg;
  fillToken(t, list, "bg/surface");
  strokeToken(t, list, "border/subtle", 1);
  const tracks: TrackOpts[] = [
    { index: 1, title: "Nightform", duration: "3:18" },
    {
      index: 6,
      title: "Aurora (feat. Nova)",
      explicit: true,
      duration: "2:33",
      favorited: true,
      playing: true,
      active: true,
    },
    { index: 13, title: "Crosslight", explicit: true, duration: "1:59" },
    { index: 14, title: "Afterglow", duration: "2:47" },
  ];
  for (const tr of tracks) list.appendChild(await drawTrackRow(t, tr, W - 16));
  const showcase = canvas(t);
  showcase.appendChild(list);

  const states = await tileGrid(
    t,
    [
      {
        label: ["Default", ""],
        node: await drawTrackRow(t, { index: 3, title: "Nightform", duration: "3:18" }, W - 16),
      },
      {
        label: ["Active / hover", "/ hover"],
        node: await drawTrackRow(
          t,
          { index: 3, title: "Nightform", duration: "3:18", active: true },
          W - 16,
        ),
      },
      {
        label: ["Playing", ""],
        node: await drawTrackRow(
          t,
          { index: 3, title: "Nightform", duration: "3:18", playing: true, active: true },
          W - 16,
        ),
      },
      {
        label: ["Favorited + explicit", "+ explicit"],
        node: await drawTrackRow(
          t,
          { index: 3, title: "Nightform", duration: "3:18", favorited: true, explicit: true },
          W - 16,
        ),
      },
    ],
    W,
  );

  const props: PropRow[] = [
    { prop: "index", type: "number", def: "—", note: ["Track number.", ""] },
    { prop: "title", type: "string", def: "—", note: ["Track title.", ""] },
    {
      prop: "duration",
      type: "string",
      def: "—",
      note: ["Length (2:33).", ""],
    },
    {
      prop: "explicit",
      type: "boolean",
      def: "false",
      note: ["Explicit “E” badge.", "explicit «E»."],
    },
    { prop: "favorited", type: "boolean", def: "false", note: ["Filled star.", ""] },
    {
      prop: "playing | active",
      type: "boolean",
      def: "false",
      note: ["Accent title / highlight.", ""],
    },
    {
      prop: "onPlay | onMore",
      type: "()=>void",
      def: "—",
      note: ["Row actions.", ""],
    },
  ];
  return componentBoard(
    t,
    "TrackRow",
    ["A row in a playlist / tracklist", ""],
    ["A single now-playing card → use MediaPlayer", "« » → MediaPlayer"],
    [await block(t, "Track list", showcase), await block(t, "States", states)],
    props,
  );
}

async function playerBoard(t: ThemeContext): Promise<FrameNode> {
  const card = canvas(t);
  card.counterAxisAlignItems = "CENTER";
  card.appendChild(await drawPlayer(t, "card", false));
  const mini = await tileGrid(
    t,
    [
      { label: ["Paused", ""], node: await drawPlayer(t, "mini", false) },
      { label: ["Playing", ""], node: await drawPlayer(t, "mini", true) },
    ],
    360,
  );
  const props: PropRow[] = [
    { prop: "title", type: "string", def: "—", note: ["Track title.", ""] },
    {
      prop: "artist",
      type: "string",
      def: "—",
      note: ["Artist / subtitle.", ""],
    },
    {
      prop: "artwork",
      type: "string",
      def: "—",
      note: ["Cover image (fillable).", ""],
    },
    {
      prop: "playing",
      type: "boolean",
      def: "false",
      note: ["Play ↔ pause icon.", "play ↔ pause."],
    },
    {
      prop: "progress",
      type: "number",
      def: "0",
      note: ["Seek position 0–1.", ""],
    },
    {
      prop: "elapsed | duration",
      type: "string",
      def: "—",
      note: ["Time labels (0:42 / 3:18).", ""],
    },
    {
      prop: "variant",
      type: "card|mini",
      def: "card",
      note: ["Full card or compact bar.", ""],
    },
    {
      prop: "onPlay|onPrev|onNext",
      type: "()=>void",
      def: "—",
      note: ["Playback handlers.", ""],
    },
  ];
  return componentBoard(
    t,
    "MediaPlayer",
    ["A now-playing card with artwork & controls", ""],
    ["Just a play button → use IconButton", "play → IconButton"],
    [await block(t, "Card", card), await block(t, "Mini", mini)],
    props,
  );
}

// ── Knob + Reverb (audio effect rack) ─────────────────────────

const deg = (x: number) => (x * Math.PI) / 180;

async function drawKnob(t: ThemeContext, value: number, label: string, d = 52): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 8, cross: "CENTER" });
  const k = figma.createFrame();
  k.name = `knob/${label}`;
  k.resize(d, d);
  k.fills = [];
  k.clipsContent = false;

  const base = ellipse(d);
  fillToken(t, base, "bg/surface-raised");
  strokeToken(t, base, "border/default", 1);
  k.appendChild(base);

  const track = ellipse(d);
  track.arcData = { startingAngle: deg(135), endingAngle: deg(405), innerRadius: 0.72 };
  fillToken(t, track, "border/strong");
  k.appendChild(track);

  const val = ellipse(d);
  val.arcData = { startingAngle: deg(135), endingAngle: deg(135 + value * 270), innerRadius: 0.72 };
  fillToken(t, val, "accent/primary");
  k.appendChild(val);

  const a = deg(135 + value * 270);
  const r = d * 0.28;
  const dot = ellipse(d * 0.14);
  fillToken(t, dot, "text/primary");
  dot.x = d / 2 + r * Math.cos(a) - d * 0.07;
  dot.y = d / 2 + r * Math.sin(a) - d * 0.07;
  k.appendChild(dot);

  col.appendChild(k);
  col.appendChild(await makeText(t, "mono/sm", label, "text/muted"));
  return col;
}

function vizPanel(t: ThemeContext, w: number): FrameNode {
  const v = autoFrame({ direction: "VERTICAL", align: "CENTER", cross: "CENTER" });
  v.resize(w, 200);
  v.counterAxisSizingMode = "FIXED";
  v.cornerRadius = RADII.lg;
  v.clipsContent = true;
  const acc = solid("#5EE6C1").color;
  v.fills = [
    { type: "SOLID", color: solid("#0C1512").color, opacity: 1 },
    {
      type: "GRADIENT_RADIAL",
      gradientTransform: [
        [0.72, 0, 0.14],
        [0, 0.72, 0.14],
      ],
      gradientStops: [
        { color: { ...acc, a: 0.4 }, position: 0 },
        { color: { ...acc, a: 0 }, position: 1 },
      ],
    },
  ];
  strokeToken(t, v, "border/subtle", 1);

  const rs = 150;
  const rings = figma.createFrame();
  rings.name = "rings";
  rings.resize(rs, rs);
  rings.fills = [];
  rings.clipsContent = false;
  for (const rr of [1, 0.66, 0.36]) {
    const e = ellipse(rs * rr);
    e.fills = [];
    strokeToken(t, e, "border/strong", 1);
    e.x = (rs - rs * rr) / 2;
    e.y = (rs - rs * rr) / 2;
    rings.appendChild(e);
  }
  v.appendChild(rings);
  return v;
}

async function drawReverb(t: ThemeContext): Promise<FrameNode> {
  const W = 900;
  const panel = autoFrame({ direction: "VERTICAL", gap: 0 });
  panel.resize(W, panel.height);
  panel.counterAxisSizingMode = "FIXED";
  panel.cornerRadius = RADII.xl;
  panel.clipsContent = true;
  fillToken(t, panel, "bg/surface");
  strokeToken(t, panel, "border/subtle", 1);

  const title = autoFrame({
    direction: "HORIZONTAL",
    cross: "CENTER",
    align: "SPACE_BETWEEN",
    padding: [14, 20],
  });
  title.resize(W, title.height);
  title.primaryAxisSizingMode = "FIXED";
  title.counterAxisSizingMode = "AUTO";
  title.appendChild(await makeText(t, "label/md", "Reverb 2", "text/primary"));
  title.appendChild(await drawActionSquare(t, "Ghost", "Default", "sm", "x"));
  panel.appendChild(title);
  panel.appendChild(hairline(t, W));

  const body = autoFrame({
    direction: "HORIZONTAL",
    cross: "MIN",
    align: "SPACE_BETWEEN",
    padding: 32,
  });
  body.resize(W, body.height);
  body.primaryAxisSizingMode = "FIXED";
  body.counterAxisSizingMode = "AUTO";

  const viz = vizPanel(t, 250);
  viz.layoutAlign = "STRETCH"; // full height
  body.appendChild(viz);

  const knobsCol = autoFrame({ direction: "VERTICAL", gap: 24 });
  const sw = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  sw.appendChild(await drawSwitch(t, true, false, "sm"));
  sw.appendChild(await makeText(t, "mono/sm", "MID / SIDE", "text/secondary"));
  knobsCol.appendChild(sw);
  const grid = autoFrame({ direction: "VERTICAL", gap: 26 });
  const rows: Array<Array<[string, number]>> = [
    [
      ["DEL", 0.3],
      ["SIZE", 0.7],
      ["DEC", 0.65],
      ["DAMP", 0.6],
    ],
    [
      ["H.CUT", 0.55],
      ["L.CUT", 0.2],
      ["DIFF", 0.5],
      ["CROSS", 0.4],
    ],
  ];
  for (const r of rows) {
    const gr = autoFrame({ direction: "HORIZONTAL", gap: 28 });
    for (const [lab, v] of r) gr.appendChild(await drawKnob(t, v, lab, 52));
    grid.appendChild(gr);
  }
  knobsCol.appendChild(grid);
  body.appendChild(knobsCol);

  const outCol = autoFrame({ direction: "VERTICAL", gap: 18, cross: "CENTER" });
  const sliders = autoFrame({ direction: "HORIZONTAL", gap: 22, cross: "MIN" });
  for (const [lab, v] of [
    ["DRY", 0.3],
    ["ER", 0.6],
    ["WET", 0.8],
  ] as Array<[string, number]>) {
    const sc = autoFrame({ direction: "VERTICAL", gap: 8, cross: "CENTER" });
    sc.appendChild(
      await drawSlider(t, { value: v, orientation: "vertical", size: "sm", length: 120 }),
    );
    sc.appendChild(await makeText(t, "mono/sm", lab, "text/muted"));
    sliders.appendChild(sc);
  }
  outCol.appendChild(sliders);
  outCol.appendChild(await drawKnob(t, 0.5, "MIX", 48));
  body.appendChild(outCol);

  panel.appendChild(body);
  return panel;
}

// ── Parametric EQ ─────────────────────────────────────────────

interface EqBand {
  fx: number; // 0..1 across width (log-freq)
  g: number; // gain in dB (for N: cut depth)
  type: string; // PK | LS | HS | HP | LP | N
  bw?: number; // bell half-width (PK/N)
}

interface EqConfig {
  tag?: string; // title-bar suffix
  active?: string; // highlighted filter type in the segment
  bands: EqBand[];
  drag?: number; // index of a band shown mid-drag (white Y guideline + readout)
}

// Reference preset: low-shelf lift, gentle mid ripple, air shelf.
const DEFAULT_EQ_BANDS: EqBand[] = [
  { fx: 0.07, g: 6, type: "LS" },
  { fx: 0.2, g: -3, type: "PK" },
  { fx: 0.34, g: 5, type: "PK" },
  { fx: 0.5, g: -5, type: "PK" },
  { fx: 0.65, g: 3, type: "PK" },
  { fx: 0.8, g: -2, type: "PK" },
  { fx: 0.93, g: 7, type: "HS" },
];

// Typed filter response so the curve reflects the real filter shape.
function eqBandGain(b: EqBand, x: number): number {
  const d = x - b.fx;
  const bw = b.bw ?? 0.09;
  switch (b.type) {
    case "LS":
      return b.g / (1 + Math.exp(d / 0.05));
    case "HS":
      return b.g / (1 + Math.exp(-d / 0.05));
    case "HP":
      return -15 / (1 + Math.exp(d / 0.03));
    case "LP":
      return -15 / (1 + Math.exp(-d / 0.03));
    case "N":
      return -b.g * Math.exp(-Math.pow(d / (b.bw ?? 0.02), 2));
    default:
      return b.g * Math.exp(-Math.pow(d / bw, 2));
  }
}
function eqGainAt(bands: EqBand[], x: number): number {
  return bands.reduce((s, b) => s + eqBandGain(b, x), 0);
}

// Spectrum analyzer drawn as a continuous filled silhouette ("mountains"),
// not discrete bars: gentle downward tilt + a few harmonic peaks + fine ripple.
function eqSpectrumNodes(W: number, H: number): SceneNode[] {
  const N = 76;
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    let v = 0.42 * (1 - 0.42 * x);
    v += 0.2 * Math.abs(Math.sin(i * 0.72 + 1.3));
    v += 0.13 * Math.abs(Math.sin(i * 1.83 + 0.4));
    v += 0.1 * Math.sin(i * 0.29) * Math.sin(i * 0.11);
    v += 0.28 * Math.exp(-Math.pow((x - 0.17) / 0.05, 2));
    v += 0.18 * Math.exp(-Math.pow((x - 0.44) / 0.06, 2));
    v += 0.13 * Math.exp(-Math.pow((x - 0.7) / 0.05, 2));
    v += 0.06 * Math.random();
    v = Math.max(0.03, Math.min(0.9, v));
    pts.push({ x: x * W, y: H - v * H * 0.62 });
  }
  const line = "M " + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");
  const area = figma.createVector();
  area.vectorPaths = [{ windingRule: "NONZERO", data: `${line} L ${W} ${H} L 0 ${H} Z` }];
  area.strokes = [];
  area.fills = [
    linearGradient(
      [
        { hex: "#5EE6C124", position: 0 },
        { hex: "#5EE6C108", position: 1 },
      ],
      "vertical",
    ),
  ];
  const top = figma.createVector();
  top.vectorPaths = [{ windingRule: "NONE", data: line }];
  top.strokes = [{ ...solid("#5EE6C1"), opacity: 0.28 } as SolidPaint];
  top.strokeWeight = 1;
  top.fills = [];
  return [area, top];
}

// Vertical output level meter: green→amber→red, stereo L/R, with a draggable
// ceiling (limiter) line — pull it down so peaks don't hit your ears.
async function drawLevelMeter(
  t: ThemeContext,
  height: number,
  o: { l: number; r: number; peak: number; ceil: number },
): Promise<FrameNode> {
  const bw = 15;
  const gap = 7;
  const scaleW = 26;
  const barsW = bw * 2 + gap;
  const bx0 = scaleW + 8;
  const wrap = figma.createFrame();
  wrap.name = "level-meter";
  wrap.fills = [];
  wrap.clipsContent = false;
  wrap.resize(bx0 + barsW + 34, height);

  // dB scale — linear 0…-30 dB (0 at top); numbers right-aligned into a tidy
  // column, each on the exact y of its tick
  const marks: Array<[string, number]> = [
    ["0", 0],
    ["-6", 0.2],
    ["-12", 0.4],
    ["-24", 0.8],
  ];
  for (const [txt, frac] of marks) {
    const y = frac * height;
    const tick = rect(5, 1);
    fillToken(t, tick, "border/strong");
    tick.x = scaleW - 3;
    tick.y = Math.min(height - 1, Math.max(0, Math.round(y)));
    wrap.appendChild(tick);
    const l = await makeText(t, "mono/sm", txt, "text/muted");
    wrap.appendChild(l);
    l.x = Math.max(0, scaleW - 9 - l.width);
    l.y = Math.min(height - l.height, Math.max(0, Math.round(y) - l.height / 2));
  }

  const mkBar = (level: number, peak: number, x: number): void => {
    const track = rect(bw, height);
    track.cornerRadius = 5;
    fillToken(t, track, "bg/inset");
    track.x = x;
    wrap.appendChild(track);
    const grad = rect(bw, height);
    grad.cornerRadius = 5;
    grad.fills = [
      linearGradient(
        [
          { hex: "#F87171", position: 0 },
          { hex: "#FBBF24", position: 0.42 },
          { hex: "#34D399", position: 1 },
        ],
        "vertical",
      ),
    ];
    grad.x = x;
    wrap.appendChild(grad);
    // dark mask hides the unlit portion above the current level
    const mask = rect(bw, height * (1 - level));
    mask.cornerRadius = 5;
    fillToken(t, mask, "bg/inset");
    mask.x = x;
    wrap.appendChild(mask);
    // peak-hold tick
    const pk = rect(bw, 2);
    pk.fills = [{ ...solid("#FFFFFF"), opacity: 0.85 } as SolidPaint];
    pk.x = x;
    pk.y = Math.max(0, height * (1 - peak));
    wrap.appendChild(pk);
  };
  mkBar(o.l, o.peak, bx0);
  mkBar(o.r, o.peak - 0.05, bx0 + bw + gap);

  // ceiling (limiter) — teal line + handle + label, distinct from white peaks
  const ceilY = height * (1 - o.ceil);
  const cPaint = boundSolid(colorVar(t, "accent/primary"));
  const line = rect(barsW + 8, 2);
  line.fills = [cPaint];
  line.x = bx0 - 4;
  line.y = ceilY - 1;
  wrap.appendChild(line);
  const grab = rect(9, 9);
  grab.cornerRadius = 2;
  grab.fills = [cPaint];
  grab.x = bx0 + barsW + 2;
  grab.y = ceilY - 4.5;
  wrap.appendChild(grab);
  const lbl = await makeText(t, "mono/sm", "-0.3", "accent/primary");
  wrap.appendChild(lbl);
  lbl.x = bx0 + barsW + 2;
  lbl.y = ceilY + 7;
  return wrap;
}

// EQ use-case panels are 1.6× the base width; the board grows to fit them.
const EQ_PANEL_W = Math.round(900 * 1.6); // 1440
const EQ_CONTENT = EQ_PANEL_W + 56; // canvas inner (28px padding each side)
const EQ_BOARD_W = EQ_CONTENT + PAD * 2;

async function drawEQ(
  t: ThemeContext,
  cfg: EqConfig = { bands: DEFAULT_EQ_BANDS },
  W: number = 900,
): Promise<FrameNode> {
  const bands = cfg.bands;
  const active = cfg.active ?? "PK";
  const panel = autoFrame({ direction: "VERTICAL", gap: 0 });
  panel.resize(W, panel.height);
  panel.counterAxisSizingMode = "FIXED";
  panel.cornerRadius = RADII.xl;
  panel.clipsContent = true;
  fillToken(t, panel, "bg/surface");
  strokeToken(t, panel, "border/subtle", 1);

  const title = autoFrame({
    direction: "HORIZONTAL",
    cross: "CENTER",
    align: "SPACE_BETWEEN",
    padding: [14, 20],
  });
  title.resize(W, title.height);
  title.primaryAxisSizingMode = "FIXED";
  title.counterAxisSizingMode = "AUTO";
  title.appendChild(
    await makeText(
      t,
      "label/md",
      `Parametric EQ${cfg.tag ? `  ·  ${cfg.tag}` : ""}`,
      "text/primary",
    ),
  );
  title.appendChild(await drawActionSquare(t, "Ghost", "Default", "sm", "x"));
  panel.appendChild(title);
  panel.appendChild(hairline(t, W));

  const gwrap = autoFrame({ direction: "VERTICAL", gap: 18, padding: 20 });
  gwrap.layoutAlign = "STRETCH";

  const MET_W = 108;
  const GW = W - 40 - MET_W - 18;
  const GH = 260;
  const graph = figma.createFrame();
  graph.name = "eq-graph";
  graph.resize(GW, GH);
  graph.cornerRadius = RADII.lg;
  graph.clipsContent = true;
  fillToken(t, graph, "bg/inset");
  strokeToken(t, graph, "border/subtle", 1);
  const yc = GH / 2;
  const scale = (GH * 0.35) / 12; // dB → px
  const gainAt = (x: number) => eqGainAt(bands, x);
  const cy = (v: number) => Math.max(8, Math.min(GH - 8, v)); // clamp to graph
  const dragIdx = cfg.drag ?? null;
  const hzOf = (fx: number): string => {
    const f = 20 * Math.pow(10, 3 * fx);
    return f >= 1000
      ? `${(f / 1000).toFixed(f >= 10000 ? 0 : 1).replace(/\.0$/, "")} kHz`
      : `${Math.round(f / 5) * 5} Hz`;
  };
  const gOf = (g: number): string => `${g >= 0 ? "+" : ""}${g.toFixed(1)} dB`;
  const qOf = (b: EqBand): string => (0.13 / (b.bw ?? 0.09)).toFixed(1); // bandwidth → Q

  // frequency grid (X) — vertical lines at real log positions  fx = log10(f/20)/3
  const freqMarks: Array<[string, number]> = [
    ["50", 0.133],
    ["100", 0.233],
    ["500", 0.466],
    ["1k", 0.566],
    ["5k", 0.799],
    ["10k", 0.9],
  ];
  for (const [, fx] of freqMarks) {
    const v = rect(1, GH);
    fillToken(t, v, "border/subtle");
    v.x = fx * GW;
    v.y = 0;
    graph.appendChild(v);
  }
  // dB grid (Y) — horizontal lines exactly at +12 / 0 / -12, where labels sit
  const dbMarks = [12, 0, -12];
  for (const db of dbMarks) {
    const hl = rect(GW, 1);
    fillToken(t, hl, "border/subtle");
    hl.x = 0;
    hl.y = yc - db * scale;
    graph.appendChild(hl);
  }

  // spectrum analyzer — continuous "mountains" silhouette
  for (const n of eqSpectrumNodes(GW, GH)) graph.appendChild(n);

  // response curve + area
  const N = 90;
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    pts.push({ x: x * GW, y: cy(yc - gainAt(x) * scale) });
  }
  const line = "M " + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");
  const area = figma.createVector();
  area.vectorPaths = [{ windingRule: "NONZERO", data: `${line} L ${GW} ${yc} L 0 ${yc} Z` }];
  area.strokes = [];
  area.fills = [
    linearGradient(
      [
        { hex: "#5EE6C133", position: 0 },
        { hex: "#5EE6C100", position: 1 },
      ],
      "vertical",
    ),
  ];
  graph.appendChild(area);
  const curve = figma.createVector();
  curve.vectorPaths = [{ windingRule: "NONE", data: line }];
  curve.strokes = [boundSolid(colorVar(t, "accent/primary"))];
  curve.strokeWeight = 2;
  curve.strokeCap = "ROUND";
  curve.strokeJoin = "ROUND";
  curve.fills = [];
  graph.appendChild(curve);

  // dragging a band: show ITS isolated response filled in the band's colour,
  // plus a crosshair guideline tinted to that colour (so the colour changes per band)
  if (dragIdx != null) {
    const bd = bands[dragIdx];
    const col = CHART_PALETTE[dragIdx % CHART_PALETTE.length];
    const dx = bd.fx * GW;
    const dyv = cy(yc - gainAt(bd.fx) * scale);
    const tint = (op: number): SolidPaint => ({ ...boundSolid(colorVar(t, col)), opacity: op });

    // isolated response of just this band (its own bell / shelf / cut), filled
    const solo: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= N; i++) {
      const x = i / N;
      solo.push({ x: x * GW, y: cy(yc - eqBandGain(bd, x) * scale) });
    }
    const sLine = "M " + solo.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");
    const sArea = figma.createVector();
    sArea.vectorPaths = [{ windingRule: "NONZERO", data: `${sLine} L ${GW} ${yc} L 0 ${yc} Z` }];
    sArea.strokes = [];
    sArea.fills = [tint(0.13)];
    graph.appendChild(sArea);
    const sCurve = figma.createVector();
    sCurve.vectorPaths = [{ windingRule: "NONE", data: sLine }];
    sCurve.strokes = [tint(0.85)];
    sCurve.strokeWeight = 1.5;
    sCurve.strokeCap = "ROUND";
    sCurve.strokeJoin = "ROUND";
    sCurve.fills = [];
    graph.appendChild(sCurve);
    // mirror lobe (ghost) — the band's full symmetric reach, the "other direction"
    const mir: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= N; i++) {
      const x = i / N;
      mir.push({ x: x * GW, y: cy(yc + eqBandGain(bd, x) * scale) });
    }
    const sMir = figma.createVector();
    sMir.vectorPaths = [
      {
        windingRule: "NONE",
        data: "M " + mir.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L "),
      },
    ];
    sMir.strokes = [tint(0.3)];
    sMir.strokeWeight = 1;
    sMir.dashPattern = [4, 4];
    sMir.fills = [];
    graph.appendChild(sMir);

    // very thin, translucent crosshair guideline in the band's colour
    const hline = rect(GW, 1);
    hline.fills = [tint(0.1)];
    hline.x = 0;
    hline.y = dyv;
    graph.appendChild(hline);
    const vline = rect(1, GH);
    vline.fills = [tint(0.28)];
    vline.x = dx - 0.5;
    vline.y = 0;
    graph.appendChild(vline);
  }

  // band nodes (numbered, palette-colored, glowing)
  for (let i = 0; i < bands.length; i++) {
    const b = bands[i];
    const dragging = i === dragIdx;
    const nd = dragging ? 27 : 22;
    const node = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    node.resize(nd, nd);
    node.primaryAxisSizingMode = "FIXED";
    node.counterAxisSizingMode = "FIXED";
    node.cornerRadius = RADII.full;
    fillToken(t, node, CHART_PALETTE[i % CHART_PALETTE.length]);
    if (dragging) {
      node.strokes = [solid("#FFFFFF")];
      node.strokeWeight = 2.5;
    } else {
      strokeToken(t, node, "bg/inset", 2);
    }
    const cc = solid("#5EE6C1").color;
    node.effects = [
      {
        type: "DROP_SHADOW",
        color: { ...cc, a: dragging ? 0.6 : 0.35 },
        offset: { x: 0, y: 0 },
        radius: dragging ? 16 : 10,
        spread: 0,
        visible: true,
        blendMode: "NORMAL",
      } as DropShadowEffect,
    ];
    node.appendChild(await makeText(t, "label/sm", String(i + 1), "accent/contrast"));
    graph.appendChild(node);
    node.x = b.fx * GW - nd / 2;
    node.y = cy(yc - gainAt(b.fx) * scale) - nd / 2;
  }

  // live readout chip that follows the dragged node
  if (dragIdx != null) {
    const b = bands[dragIdx];
    const dx = b.fx * GW;
    const dyv = cy(yc - gainAt(b.fx) * scale);
    const chip = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [7, 11] });
    chip.cornerRadius = RADII.md;
    fillToken(t, chip, "bg/surface-raised");
    strokeToken(t, chip, "border/strong", 1);
    const sc = solid("#000000").color;
    chip.effects = [
      {
        type: "DROP_SHADOW",
        color: { ...sc, a: 0.5 },
        offset: { x: 0, y: 6 },
        radius: 16,
        spread: -4,
        visible: true,
        blendMode: "NORMAL",
      } as DropShadowEffect,
    ];
    chip.appendChild(
      await makeText(
        t,
        "mono/sm",
        `${hzOf(b.fx)}  ·  ${gOf(gainAt(b.fx))}  ·  Q ${qOf(b)}`,
        "text/primary",
      ),
    );
    graph.appendChild(chip);
    chip.x = Math.max(4, Math.min(GW - chip.width - 4, dx - chip.width / 2));
    chip.y = Math.max(4, dyv - 16 - chip.height - 8);
  }

  // axis labels — dB centered on its gridline, freq centered under its gridline
  for (const db of dbMarks) {
    const l = await makeText(t, "mono/sm", db > 0 ? `+${db}` : `${db}`, "text/muted");
    graph.appendChild(l);
    l.x = 10;
    l.y = yc - db * scale - l.height / 2;
  }
  for (const [txt, fx] of freqMarks) {
    const l = await makeText(t, "mono/sm", txt, "text/muted");
    graph.appendChild(l);
    l.x = Math.min(GW - l.width - 4, Math.max(4, fx * GW - l.width / 2));
    l.y = GH - l.height - 6;
  }

  // graph toolbar (range / monitor / pivot) — per the manual
  const toolbar = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", align: "SPACE_BETWEEN" });
  toolbar.layoutAlign = "STRETCH";
  toolbar.appendChild(await makeText(t, "mono/sm", "20 Hz – 20 kHz", "text/muted"));
  const tchips = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  tchips.appendChild(await drawChip(t, "-90 dB", { variant: "Solid", size: "sm" }));
  tchips.appendChild(await drawChip(t, "Mid/Side", { variant: "Solid", size: "sm" }));
  tchips.appendChild(await drawChip(t, "Pivot", { variant: "Outline", size: "sm" }));
  toolbar.appendChild(tchips);
  gwrap.appendChild(toolbar);

  // main row: [graph + lower controls]  |  [meter + OUT], so OUT sits under the meter
  const mainRow = autoFrame({ direction: "HORIZONTAL", gap: 18, cross: "MIN" });
  mainRow.layoutAlign = "STRETCH";

  const leftCol = autoFrame({ direction: "VERTICAL", gap: 18 });
  leftCol.resize(GW, leftCol.height);
  leftCol.counterAxisSizingMode = "FIXED";
  leftCol.appendChild(graph);

  // bottom controls: filter types · FREQ/GAIN/BW · Mute/Solo
  const bottom = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", align: "SPACE_BETWEEN" });
  bottom.resize(GW, bottom.height);
  bottom.primaryAxisSizingMode = "FIXED";
  bottom.counterAxisSizingMode = "AUTO";

  const seg = autoFrame({ direction: "HORIZONTAL", gap: 4, cross: "CENTER", padding: 4 });
  seg.cornerRadius = RADII.full;
  fillToken(t, seg, "bg/surface-raised");
  const types = ["LP", "BP", "HP", "Notch", "LS", "PK", "HS", "Off"];
  for (const ty of types) {
    const p = autoFrame({
      direction: "HORIZONTAL",
      align: "CENTER",
      cross: "CENTER",
      padding: [7, 11],
    });
    p.cornerRadius = RADII.full;
    const on = ty === active;
    if (on) fillToken(t, p, "accent/primary");
    p.appendChild(await makeText(t, "label/sm", ty, on ? "accent/contrast" : "text/muted"));
    seg.appendChild(p);
  }
  bottom.appendChild(seg);

  const knobs = autoFrame({ direction: "HORIZONTAL", gap: 24, cross: "CENTER" });
  knobs.appendChild(await drawKnob(t, 0.5, "FREQ", 48));
  knobs.appendChild(await drawKnob(t, 0.7, "GAIN", 48));
  knobs.appendChild(await drawKnob(t, 0.35, "BW", 48));
  bottom.appendChild(knobs);

  const muteSolo = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  muteSolo.appendChild(await drawChip(t, "Mute", { variant: "Outline", size: "sm" }));
  muteSolo.appendChild(await drawChip(t, "Solo", { variant: "Outline", size: "sm" }));
  bottom.appendChild(muteSolo);
  leftCol.appendChild(bottom);

  // right column: level meter with OUT knob directly beneath it
  const rightCol = autoFrame({ direction: "VERTICAL", gap: 16, cross: "CENTER" });
  rightCol.resize(MET_W, rightCol.height);
  rightCol.counterAxisSizingMode = "FIXED";
  rightCol.appendChild(await drawLevelMeter(t, GH, { l: 0.72, r: 0.66, peak: 0.82, ceil: 0.9 }));
  rightCol.appendChild(await drawKnob(t, 0.5, "OUT", 44));

  mainRow.appendChild(leftCol);
  mainRow.appendChild(rightCol);
  gwrap.appendChild(mainRow);
  panel.appendChild(gwrap);
  return panel;
}

// EQ band-node readout tooltip (Pro-Q-style stacked: type + FREQ/GAIN/Q)
interface EqTip {
  band: number;
  color: string;
  type: string;
  freq: string;
  gain: string;
  q: string;
  mode: "hover" | "drag" | "fine";
}

async function eqReadout(t: ThemeContext, o: EqTip): Promise<FrameNode> {
  const W = 188;
  const wrap = autoFrame({ direction: "VERTICAL", gap: -1, cross: "CENTER" });

  const chip = async (d: number): Promise<FrameNode> => {
    const c = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    c.resize(d, d);
    c.primaryAxisSizingMode = "FIXED";
    c.counterAxisSizingMode = "FIXED";
    c.cornerRadius = RADII.full;
    fillToken(t, c, o.color);
    strokeToken(t, c, "bg/inset", 1.5);
    c.appendChild(await makeText(t, "label/sm", String(o.band), "accent/contrast"));
    return c;
  };

  const bubble = autoFrame({
    direction: "VERTICAL",
    gap: o.mode === "hover" ? 0 : 9,
    padding: o.mode === "hover" ? [9, 12] : [13, 15],
    cross: "MIN",
  });
  bubble.cornerRadius = RADII.lg;
  fillToken(t, bubble, "bg/surface-raised");
  strokeToken(t, bubble, "border/strong", 1);
  const sh = solid("#000000").color;
  bubble.effects = [
    {
      type: "DROP_SHADOW",
      color: { ...sh, a: 0.45 },
      offset: { x: 0, y: 8 },
      radius: 22,
      spread: -6,
      visible: true,
      blendMode: "NORMAL",
    } as DropShadowEffect,
  ];

  if (o.mode === "hover") {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 9, cross: "CENTER" });
    row.appendChild(await chip(18));
    row.appendChild(await makeText(t, "mono/sm", `${o.freq} · ${o.gain}`, "text/primary"));
    bubble.appendChild(row);
  } else {
    bubble.resize(W, bubble.height);
    bubble.counterAxisSizingMode = "FIXED";
    const head = autoFrame({ direction: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER" });
    head.layoutAlign = "STRETCH";
    const left = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
    left.appendChild(await chip(18));
    left.appendChild(await makeText(t, "label/sm", o.type, o.color));
    head.appendChild(left);
    if (o.mode === "fine") {
      const badge = autoFrame({
        direction: "HORIZONTAL",
        align: "CENTER",
        cross: "CENTER",
        padding: [2, 7],
      });
      badge.cornerRadius = RADII.full;
      strokeToken(t, badge, "border/strong", 1);
      badge.appendChild(await makeText(t, "label/sm", "⌃ FINE", "text/muted"));
      head.appendChild(badge);
    }
    bubble.appendChild(head);

    const valRow = async (label: string, value: string): Promise<FrameNode> => {
      const r = autoFrame({ direction: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER" });
      r.layoutAlign = "STRETCH";
      r.appendChild(await makeText(t, "mono/sm", label, "text/muted"));
      r.appendChild(await makeText(t, "mono/sm", value, "text/primary"));
      return r;
    };
    bubble.appendChild(await valRow("FREQ", o.freq));
    bubble.appendChild(await valRow("GAIN", o.gain));
    bubble.appendChild(await valRow("Q", o.q));
  }
  wrap.appendChild(bubble);

  const tail = figma.createVector();
  tail.vectorPaths = [{ windingRule: "NONZERO", data: "M0 0 L14 0 L7 8 Z" }];
  tail.strokes = [];
  tail.fills = [boundSolid(colorVar(t, "bg/surface-raised"))];
  wrap.appendChild(tail);
  return wrap;
}

async function eqStatesColumn(t: ThemeContext): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 36 });
  const states: Array<{ title: string; desc: string; tip: EqTip }> = [
    {
      title: "Hover",
      desc: ["Quick peek — freq + gain only.", ""].join("\n"),
      tip: {
        band: 3,
        color: "feedback/warning",
        type: "PEAKING",
        freq: "440 Hz",
        gain: "+3.2 dB",
        q: "1.40",
        mode: "hover",
      },
    },
    {
      title: "Drag",
      desc: ["Full stack — type, freq, gain, Q.", "— , , , Q."].join("\n"),
      tip: {
        band: 3,
        color: "feedback/warning",
        type: "PEAKING",
        freq: "440 Hz",
        gain: "+3.2 dB",
        q: "1.40",
        mode: "drag",
      },
    },
    {
      title: "Fine · Ctrl",
      desc: "Precise — 0.1-step decimals.",
      tip: {
        band: 3,
        color: "feedback/warning",
        type: "PEAKING",
        freq: "442.3 Hz",
        gain: "+3.18 dB",
        q: "1.42",
        mode: "fine",
      },
    },
  ];
  for (const s of states) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 40, cross: "MIN" });
    const cap = autoFrame({ direction: "VERTICAL", gap: 5 });
    cap.resize(230, cap.height);
    cap.counterAxisSizingMode = "FIXED";
    cap.appendChild(await makeText(t, "label/md", s.title, "text/primary"));
    cap.appendChild(await makeText(t, "body/sm", s.desc, "text/muted"));
    row.appendChild(cap);
    row.appendChild(await eqReadout(t, s.tip));
    col.appendChild(row);
  }
  return col;
}

// Real-world EQ moves — each is a full copy of the panel, tuned for a task.
// fx = log10(freq / 20) / 3  (20 Hz → 0, 20 kHz → 1)
async function eqUseCases(t: ThemeContext): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 48 });
  const items: Array<{ title: string; desc: string; cfg: EqConfig }> = [
    {
      title: "Reference",
      desc: ["Low-shelf lift · mid ripple · air shelf — the plugin at rest.", ""].join("\n"),
      cfg: { tag: "Reference", active: "PK", bands: DEFAULT_EQ_BANDS, drag: 2 },
    },
    {
      title: "Vocal",
      desc: ["HPF @80 · de-mud @250 · presence @3k · air shelf @12k.", ""].join("\n"),
      cfg: {
        tag: "Vocal",
        active: "PK",
        drag: 4,
        bands: [
          { fx: 0.167, g: 0, type: "HP" },
          { fx: 0.366, g: 4, type: "N", bw: 0.05 },
          { fx: 0.466, g: -2, type: "PK", bw: 0.06 },
          { fx: 0.566, g: 1, type: "PK" },
          { fx: 0.725, g: 4, type: "PK", bw: 0.07 },
          { fx: 0.827, g: 2, type: "PK" },
          { fx: 0.926, g: 3, type: "HS" },
        ],
      },
    },
    {
      title: "Kick / 808",
      desc: ["Sub boom @55 · cut mud @400 · beater click @3.5k · tame top.", ""].join("\n"),
      cfg: {
        tag: "Kick",
        active: "PK",
        drag: 0,
        bands: [
          { fx: 0.146, g: 5, type: "PK", bw: 0.05 },
          { fx: 0.259, g: -2, type: "PK" },
          { fx: 0.434, g: 5, type: "N", bw: 0.05 },
          { fx: 0.534, g: -2, type: "PK" },
          { fx: 0.747, g: 4, type: "PK" },
          { fx: 0.827, g: 0, type: "PK" },
          { fx: 0.883, g: 0, type: "LP" },
        ],
      },
    },
    {
      title: "De-mud",
      desc: ["One surgical narrow cut @300 Hz — kill the boxiness.", ""].join("\n"),
      cfg: {
        tag: "De-mud",
        active: "N",
        drag: 1,
        bands: [
          { fx: 0.1, g: 0, type: "HP" },
          { fx: 0.392, g: 9, type: "N", bw: 0.018 },
          { fx: 0.534, g: -2, type: "PK" },
          { fx: 0.667, g: 0, type: "PK" },
          { fx: 0.799, g: 0, type: "PK" },
          { fx: 0.867, g: 0, type: "PK" },
          { fx: 0.94, g: 1.5, type: "HS" },
        ],
      },
    },
    {
      title: "Lo-fi",
      desc: ["Bandpass 300 Hz–3 kHz — vintage phone / radio effect.", ""].join("\n"),
      cfg: {
        tag: "Lo-fi",
        active: "BP",
        drag: 2,
        bands: [
          { fx: 0.392, g: 0, type: "HP" },
          { fx: 0.5, g: 2, type: "PK" },
          { fx: 0.566, g: 3, type: "PK" },
          { fx: 0.667, g: 2, type: "PK" },
          { fx: 0.725, g: 1, type: "PK" },
          { fx: 0.747, g: 0, type: "LP" },
          { fx: 0.9, g: 0, type: "PK" },
        ],
      },
    },
    {
      title: "Smiley",
      desc: ["Loudness curve — bass & treble up, mids scooped.", ""].join("\n"),
      cfg: {
        tag: "Smiley",
        active: "LS",
        drag: 0,
        bands: [
          { fx: 0.05, g: 9, type: "LS" },
          { fx: 0.3, g: -5, type: "PK", bw: 0.09 },
          { fx: 0.5, g: -8, type: "PK", bw: 0.11 },
          { fx: 0.68, g: -5, type: "PK", bw: 0.09 },
          { fx: 0.85, g: 3, type: "PK" },
          { fx: 0.93, g: 10, type: "HS" },
          { fx: 0.99, g: 6, type: "HS" },
        ],
      },
    },
    {
      title: "Resonant",
      desc: ["Bands pulled opposite ways — a jagged zig-zag curve.", ""].join("\n"),
      cfg: {
        tag: "Resonant",
        active: "PK",
        drag: 3,
        bands: [
          { fx: 0.15, g: 7, type: "PK", bw: 0.04 },
          { fx: 0.28, g: -6, type: "PK", bw: 0.04 },
          { fx: 0.41, g: 9, type: "PK", bw: 0.035 },
          { fx: 0.54, g: -8, type: "PK", bw: 0.04 },
          { fx: 0.67, g: 9, type: "PK", bw: 0.035 },
          { fx: 0.8, g: -6, type: "PK", bw: 0.04 },
          { fx: 0.92, g: 7, type: "PK", bw: 0.04 },
        ],
      },
    },
  ];
  for (const it of items) {
    const entry = autoFrame({ direction: "VERTICAL", gap: 16 });
    const head = autoFrame({ direction: "VERTICAL", gap: 5 });
    head.appendChild(await makeText(t, "heading/h4", it.title, "text/primary"));
    head.appendChild(await makeText(t, "body/sm", it.desc, "text/muted"));
    entry.appendChild(head);
    entry.appendChild(await drawEQ(t, it.cfg, EQ_PANEL_W));
    col.appendChild(entry);
  }
  return col;
}

// FL-style frequency cheat-sheet: every band as a full colored bell (boost lobe
// up, mirror cut lobe down) with the sonic descriptor above / below the 0 line.
async function eqFreqGuide(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t, EQ_CONTENT);
  const w = EQ_CONTENT - 56;
  const h = 470;
  const graph = figma.createFrame();
  graph.name = "eq-freq-guide";
  graph.resize(w, h);
  graph.cornerRadius = RADII.lg;
  graph.clipsContent = true;
  fillToken(t, graph, "bg/inset");
  strokeToken(t, graph, "border/subtle", 1);

  const yc = h / 2;
  const peakPx = h * 0.28;

  // 0 dB centre line
  const mid = rect(w, 1);
  fillToken(t, mid, "border/strong");
  mid.y = yc;
  graph.appendChild(mid);

  // frequency grid + bottom labels
  const freqMarks: Array<[string, number]> = [
    ["50", 0.133],
    ["100", 0.233],
    ["500", 0.466],
    ["1k", 0.566],
    ["5k", 0.799],
    ["10k", 0.9],
  ];
  for (const [txt, fx] of freqMarks) {
    const v = rect(1, h);
    fillToken(t, v, "border/subtle");
    v.x = fx * w;
    graph.appendChild(v);
    const l = await makeText(t, "mono/sm", txt, "text/muted");
    graph.appendChild(l);
    l.x = Math.min(w - l.width - 4, Math.max(4, fx * w - l.width / 2));
    l.y = h - l.height - 6;
  }

  const addLbl = async (
    text: string,
    hex: string,
    cx: number,
    y: number,
    op = 0.92,
  ): Promise<void> => {
    const l = await makeText(t, "label/sm", text, "text/primary");
    l.fills = [{ ...solid(hex), opacity: op } as SolidPaint];
    graph.appendChild(l);
    l.x = Math.min(w - l.width - 4, Math.max(4, cx - l.width / 2));
    l.y = y;
  };

  interface GuideBand {
    fx: number;
    bw: number;
    hex: string;
    region: string;
    up: string;
    down: string;
  }
  const bands: GuideBand[] = [
    {
      fx: 0.11,
      bw: 0.05,
      hex: "#F472B6",
      region: "SUB",
      up: "Fat / Boosted",
      down: "Thin / Tight",
    },
    { fx: 0.24, bw: 0.055, hex: "#FBBF24", region: "BASS", up: "Boomy / Warm", down: "Hollow" },
    {
      fx: 0.37,
      bw: 0.05,
      hex: "#FB923C",
      region: "LOW-MID",
      up: "Muddy / Slam",
      down: "Disattached",
    },
    { fx: 0.5, bw: 0.05, hex: "#34D399", region: "MID", up: "Boxy / Cuppy", down: "Plastic" },
    { fx: 0.63, bw: 0.05, hex: "#5EE6C1", region: "MID", up: "Honky / Nasal", down: "Laid back" },
    {
      fx: 0.75,
      bw: 0.05,
      hex: "#F87171",
      region: "HI-MID",
      up: "Harsh / Bright",
      down: "No clarity",
    },
    {
      fx: 0.86,
      bw: 0.048,
      hex: "#38BDF8",
      region: "PRESENCE",
      up: "Sibilant / Edgy",
      down: "Dull",
    },
    { fx: 0.96, bw: 0.05, hex: "#818CF8", region: "AIR", up: "Air / Sparkle", down: "No air" },
  ];

  const N = 96;
  for (let bi = 0; bi < bands.length; bi++) {
    const b = bands[bi];
    const up: Array<{ x: number; y: number }> = [];
    const dn: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= N; i++) {
      const x = i / N;
      const bell = Math.exp(-Math.pow((x - b.fx) / b.bw, 2));
      up.push({ x: x * w, y: yc - bell * peakPx });
      dn.push({ x: x * w, y: yc + bell * peakPx });
    }
    const upStr = "M " + up.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");
    const dnStr = "M " + dn.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");
    // faint fill under the boost lobe
    const area = figma.createVector();
    area.vectorPaths = [{ windingRule: "NONZERO", data: `${upStr} L ${w} ${yc} L 0 ${yc} Z` }];
    area.strokes = [];
    area.fills = [{ ...solid(b.hex), opacity: 0.08 } as SolidPaint];
    graph.appendChild(area);
    // boost lobe (solid) + cut lobe (dashed, dimmer)
    const upv = figma.createVector();
    upv.vectorPaths = [{ windingRule: "NONE", data: upStr }];
    upv.strokes = [{ ...solid(b.hex), opacity: 0.95 } as SolidPaint];
    upv.strokeWeight = 1.5;
    upv.strokeCap = "ROUND";
    upv.strokeJoin = "ROUND";
    upv.fills = [];
    graph.appendChild(upv);
    const dnv = figma.createVector();
    dnv.vectorPaths = [{ windingRule: "NONE", data: dnStr }];
    dnv.strokes = [{ ...solid(b.hex), opacity: 0.4 } as SolidPaint];
    dnv.strokeWeight = 1;
    dnv.dashPattern = [4, 4];
    dnv.fills = [];
    graph.appendChild(dnv);
    // labels (staggered so neighbours don't collide) + region name at top
    const cx = b.fx * w;
    const stag = bi % 2 === 0 ? 0 : 22;
    await addLbl(b.region, b.hex, cx, 10, 0.6);
    await addLbl(b.up, b.hex, cx, yc - peakPx - 40 + stag);
    await addLbl(b.down, b.hex, cx, yc + peakPx + 12 + stag, 0.55);
  }

  wrap.appendChild(graph);
  return wrap;
}

// Presets chosen via a right-click context menu over the graph.
async function eqPresetMenu(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t, EQ_CONTENT);
  const w = EQ_CONTENT - 56;
  const gH = 300;
  const stage = figma.createFrame();
  stage.name = "eq-preset-scene";
  stage.fills = [];
  stage.clipsContent = false;
  stage.resize(w, 380);

  const gr = figma.createFrame();
  gr.resize(w, gH);
  gr.cornerRadius = RADII.lg;
  gr.clipsContent = true;
  fillToken(t, gr, "bg/inset");
  strokeToken(t, gr, "border/subtle", 1);
  for (const n of eqSpectrumNodes(w, gH)) gr.appendChild(n);
  const yc = gH / 2;
  const scale = (gH * 0.3) / 12;
  const cyf = (v: number) => Math.max(8, Math.min(gH - 8, v));
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= 80; i++) {
    const x = i / 80;
    pts.push({ x: x * w, y: cyf(yc - eqGainAt(DEFAULT_EQ_BANDS, x) * scale) });
  }
  const curve = figma.createVector();
  curve.vectorPaths = [
    {
      windingRule: "NONE",
      data: "M " + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L "),
    },
  ];
  curve.strokes = [boundSolid(colorVar(t, "accent/primary"))];
  curve.strokeWeight = 2;
  curve.strokeCap = "ROUND";
  curve.strokeJoin = "ROUND";
  curve.fills = [];
  gr.appendChild(curve);
  stage.appendChild(gr);
  gr.x = 0;
  gr.y = 0;

  const menu = await ctxMenu(
    t,
    [
      { group: "Load preset" },
      { label: "Flat / Reset" },
      { label: "Smiley — Loudness", hi: true },
      { label: "Vocal — Clarity" },
      { label: "Kick — Punch" },
      { label: "Telephone" },
      { label: "De-mud" },
      { sep: true },
      { icon: "download", label: "Save current…" },
      { icon: "trash", label: "Delete preset", danger: true },
    ],
    270,
  );
  stage.appendChild(menu);
  menu.x = Math.round(w * 0.34);
  menu.y = 40;

  wrap.appendChild(stage);
  return wrap;
}

// Normalised filter shape (-1..1, + = boost) for the mini type icons.
function eqShapeY(type: string, x: number): number {
  const bell = (c: number, k: number) => Math.exp(-Math.pow((x - c) / k, 2));
  const sigR = (c: number, k: number) => 1 / (1 + Math.exp(-(x - c) / k)); // 0 left → 1 right
  switch (type) {
    case "LP":
      return 0.75 - 1.6 * sigR(0.6, 0.06);
    case "HP":
      return -0.85 + 1.6 * sigR(0.4, 0.06);
    case "BP":
      return 1.2 * bell(0.5, 0.13) - 0.45;
    case "Notch":
      return -0.95 * bell(0.5, 0.05);
    case "LS":
      return 0.8 * (1 - sigR(0.45, 0.06));
    case "HS":
      return 0.8 * sigR(0.55, 0.06);
    case "PK":
      return 0.85 * bell(0.5, 0.13);
    default:
      return 0; // Off
  }
}

function filterShape(t: ThemeContext, type: string, w: number, h: number): FrameNode {
  const box = figma.createFrame();
  box.resize(w, h);
  box.cornerRadius = RADII.md;
  box.clipsContent = true;
  fillToken(t, box, "bg/inset");
  strokeToken(t, box, "border/subtle", 1);
  const cyv = h * 0.52;
  const amp = h * 0.32;
  const base = rect(w, 1);
  fillToken(t, base, "border/subtle");
  base.y = cyv;
  box.appendChild(base);
  const N = 56;
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    pts.push({ x: x * w, y: cyv - eqShapeY(type, x) * amp });
  }
  const v = figma.createVector();
  v.vectorPaths = [
    {
      windingRule: "NONE",
      data: "M " + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L "),
    },
  ];
  if (type === "Off") {
    v.strokes = [{ ...boundSolid(colorVar(t, "text/muted")) }];
    v.dashPattern = [3, 3];
  } else {
    v.strokes = [boundSolid(colorVar(t, "accent/primary"))];
  }
  v.strokeWeight = 1.75;
  v.strokeCap = "ROUND";
  v.strokeJoin = "ROUND";
  v.fills = [];
  box.appendChild(v);
  return box;
}

async function filterTile(
  t: ThemeContext,
  type: string,
  name: string,
  desc: string,
  w: number,
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 10 });
  col.resize(w, col.height);
  col.counterAxisSizingMode = "FIXED";
  const shape = filterShape(t, type, w, 52);
  shape.layoutAlign = "STRETCH";
  col.appendChild(shape);
  const lab = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  lab.appendChild(await makeText(t, "label/md", type, "text/primary"));
  lab.appendChild(await makeText(t, "caption", name, "text/muted"));
  col.appendChild(lab);
  col.appendChild(await makeText(t, "body/sm", desc, "text/secondary", { maxWidth: w }));
  return col;
}

async function eqFilterTypes(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t, EQ_CONTENT);
  const inner = EQ_CONTENT - 56;
  const gap = 20;
  const tileW = Math.floor((inner - gap * 3) / 4);
  const g = autoFrame({ direction: "HORIZONTAL", gap, wrap: true, cross: "MIN" });
  g.resize(inner, g.height);
  g.primaryAxisSizingMode = "FIXED";
  g.counterAxisSizingMode = "AUTO";
  g.itemSpacing = gap;
  g.counterAxisSpacing = 24;
  const types: Array<[string, string, string]> = [
    ["LP", "Low Pass", ["Keeps lows, rolls off highs above the point.", ""].join("\n")],
    ["BP", "Band Pass", ["Keeps a narrow band, cuts everything else.", ""].join("\n")],
    ["HP", "High Pass", ["Keeps highs, rolls off lows below the point.", ""].join("\n")],
    ["Notch", "Notch", "Deep, narrow surgical cut at the point."],
    ["LS", "Low Shelf", "Lifts or dips everything below the point."],
    ["PK", "Peaking", ["Bell boost or cut around the point (default).", ""].join("\n")],
    ["HS", "High Shelf", "Lifts or dips everything above the point."],
    ["Off", "Bypass", ["Band disabled — no effect on the sound.", ""].join("\n")],
  ];
  for (const [ty, name, desc] of types) g.appendChild(await filterTile(t, ty, name, desc, tileW));
  wrap.appendChild(g);
  return wrap;
}

async function eqMuteSolo(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t, EQ_CONTENT);
  const col = autoFrame({ direction: "VERTICAL", gap: 18 });
  const rows: Array<[string, string]> = [
    [
      "Mute",
      [
        "Temporarily bypass the selected band — its curve is ignored while the rest keep working.",
        "",
      ].join("\n"),
    ],
    [
      "Solo",
      ["Isolate the selected band to hear only its effect — everything else is muted.", ""].join(
        "\n",
      ),
    ],
  ];
  for (const [label, desc] of rows) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 20, cross: "MIN" });
    const chipCol = autoFrame({ direction: "HORIZONTAL", cross: "MIN" });
    chipCol.resize(110, chipCol.height);
    chipCol.counterAxisSizingMode = "FIXED";
    chipCol.appendChild(await drawChip(t, label, { variant: "Outline", size: "md" }));
    row.appendChild(chipCol);
    row.appendChild(
      await makeText(t, "body/md", desc, "text/secondary", { maxWidth: EQ_CONTENT - 56 - 130 }),
    );
    col.appendChild(row);
  }
  wrap.appendChild(col);
  return wrap;
}

async function eqBoard(t: ThemeContext): Promise<FrameNode> {
  const showcase = canvas(t, EQ_CONTENT);
  showcase.appendChild(await eqUseCases(t));
  const statesCanvas = canvas(t, EQ_CONTENT);
  statesCanvas.appendChild(await eqStatesColumn(t));
  const props: PropRow[] = [
    {
      prop: "bands",
      type: "Band[7]",
      def: "—",
      note: ["7 bands: freq, gain, Q, type.", "7 : freq, gain, Q, ."],
    },
    {
      prop: "type",
      type: "LP|BP|HP|Notch|LS|PK|HS|Off",
      def: "PK",
      note: ["Filter shape per band.", ""],
    },
    {
      prop: "slope",
      type: "-12|-24|-36|-48 dB/oct",
      def: "-12",
      note: ["Filter steepness.", ""],
    },
    {
      prop: "spectrum",
      type: "boolean",
      def: "true",
      note: ["Analyzer behind the curve.", ""],
    },
    {
      prop: "gain",
      type: "number",
      def: "0",
      note: ["Global output gain.", ""],
    },
    {
      prop: "onChange",
      type: "(bands)=>void",
      def: "—",
      note: ["Fires on node drag.", ""],
    },
  ];
  return componentBoard(
    t,
    "Parametric EQ",
    ["7-band EQ with draggable nodes & spectrum", "7- EQ"],
    ["A single gain knob → use Knob", "→ Knob"],
    [
      await block(t, "Use cases", showcase),
      await block(t, "Frequency guide", await eqFreqGuide(t)),
      await block(t, "Filter types", await eqFilterTypes(t)),
      await block(t, "Mute / Solo", await eqMuteSolo(t)),
      await block(t, "Presets", await eqPresetMenu(t)),
      await block(t, "Node readout", statesCanvas),
    ],
    props,
    EQ_BOARD_W,
  );
}

async function reverbBoard(t: ThemeContext): Promise<FrameNode> {
  const panel = canvas(t);
  panel.appendChild(await drawReverb(t));

  const knobs = await tileGrid(
    t,
    [
      { label: ["0%", "0%"], node: await drawKnob(t, 0, "GAIN") },
      { label: ["30%", "30%"], node: await drawKnob(t, 0.3, "GAIN") },
      { label: ["60%", "60%"], node: await drawKnob(t, 0.6, "GAIN") },
      { label: ["100%", "100%"], node: await drawKnob(t, 1, "GAIN") },
    ],
    120,
  );
  const props: PropRow[] = [
    { prop: "value", type: "number", def: "0", note: ["Knob value 0–1.", ""] },
    {
      prop: "min | max",
      type: "number",
      def: "0,1",
      note: ["Range bounds.", ""],
    },
    {
      prop: "label",
      type: "string",
      def: "—",
      note: ["Caption under the knob.", ""],
    },
    { prop: "size", type: "number", def: "52", note: ["Knob diameter.", ""] },
    {
      prop: "bipolar",
      type: "boolean",
      def: "false",
      note: ["Center-zero (pan/balance).", "(pan)."],
    },
    { prop: "onChange", type: "(v)=>void", def: "—", note: ["Fires on drag.", ""] },
  ];
  return componentBoard(
    t,
    "Knob & Reverb",
    ["Rotary knobs composed into an audio effect rack", ""],
    ["A linear value → use Slider", "→ Slider"],
    [await block(t, "Reverb panel", panel), await block(t, "Knob", knobs)],
    props,
  );
}

// ── Kbd / Shortcut ────────────────────────────────────────────

const KEY_SIZE: Record<Size, { pad: [number, number]; text: string; min: number }> = {
  sm: { pad: [3, 7], text: "mono/sm", min: 22 },
  md: { pad: [5, 9], text: "mono/sm", min: 28 },
  lg: { pad: [7, 12], text: "body/sm", min: 34 },
};

async function drawKey(t: ThemeContext, label: string, size: Size = "md"): Promise<FrameNode> {
  const sp = KEY_SIZE[size];
  const key = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: sp.pad,
  });
  key.cornerRadius = RADII.sm;
  fillToken(t, key, "bg/surface-raised");
  strokeToken(t, key, "border/default", 1);
  await applyEffect(key, "shadow/xs", t);
  if (label.length <= 2) {
    key.primaryAxisSizingMode = "FIXED";
    key.counterAxisSizingMode = "AUTO";
    key.resize(sp.min, key.height);
  }
  key.appendChild(await makeText(t, sp.text, label, "text/secondary"));
  return key;
}

async function drawShortcut(
  t: ThemeContext,
  keys: string[],
  size: Size = "md",
  sep?: string,
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: sep ? 4 : 5, cross: "CENTER" });
  for (let i = 0; i < keys.length; i++) {
    row.appendChild(await drawKey(t, keys[i], size));
    if (sep && i < keys.length - 1)
      row.appendChild(await makeText(t, "caption", sep, "text/muted"));
  }
  return row;
}

// ── Location Map (Leaflet) ────────────────────────────────────
// A Leaflet map that pins the physical spots where you must stand to unlock
// the CV download (geofenced). Rendered here in the DS dark map style.
interface MapPalette {
  base: string;
  water: string;
  park: string;
  road: string;
  roadHi: string;
  river: string;
}
const MAP_DARK: MapPalette = {
  base: "#0E1117",
  water: "#15243B",
  park: "#1C3326",
  road: "#262B36",
  roadHi: "#39414F",
  river: "#2E5E8C",
};

function mapPin(
  t: ThemeContext,
  colorToken: string,
  opts: { icon?: string; selected?: boolean } = {},
): FrameNode {
  const pin = figma.createFrame();
  pin.name = "map-pin";
  pin.fills = [];
  pin.clipsContent = false;
  pin.resize(26, 34);
  const v = figma.createVector();
  v.vectorPaths = [
    {
      windingRule: "NONZERO",
      data: "M13 34 C6 24 2 18 2 12 C2 6 7 2 13 2 C19 2 24 6 24 12 C24 18 20 24 13 34 Z",
    },
  ];
  v.fills = [boundSolid(colorVar(t, colorToken))];
  v.strokes = [{ ...solid("#FFFFFF"), opacity: opts.selected ? 1 : 0.9 } as SolidPaint];
  v.strokeWeight = opts.selected ? 2.5 : 1.5;
  v.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.4 },
      offset: { x: 0, y: 2 },
      radius: opts.selected ? 9 : 5,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    } as DropShadowEffect,
  ];
  pin.appendChild(v);
  if (opts.icon) {
    const ic = icon(t, opts.icon, 12, "accent/contrast");
    pin.appendChild(ic);
    ic.x = 7;
    ic.y = 5;
  } else {
    const dot = ellipse(8);
    dot.fills = [solid("#FFFFFF")];
    dot.strokes = [];
    dot.x = 9;
    dot.y = 8;
    pin.appendChild(dot);
  }
  return pin;
}

async function mapBackdrop(
  t: ThemeContext,
  w: number,
  h: number,
  opts: { labels?: boolean; chrome?: boolean; palette?: MapPalette } = {},
): Promise<FrameNode> {
  const p = opts.palette ?? MAP_DARK;
  const m = figma.createFrame();
  m.name = "map";
  m.resize(w, h);
  m.clipsContent = true;
  m.fills = [solid(p.base)];
  if (opts.chrome !== false) {
    m.cornerRadius = RADII.lg;
    strokeToken(t, m, "border/subtle", 1);
  }

  const park = (cx: number, cy: number, ow: number, oh: number, op: number): void => {
    const e = figma.createEllipse();
    e.resize(ow, oh);
    e.fills = [{ ...solid(p.park), opacity: op } as SolidPaint];
    e.strokes = [];
    e.x = cx - ow / 2;
    e.y = cy - oh / 2;
    m.appendChild(e);
  };
  park(w * 0.62, h * 0.3, w * 0.5, h * 0.6, 0.85);
  park(w * 0.9, h * 0.78, w * 0.42, h * 0.7, 0.7);
  park(w * 0.44, h * 0.72, w * 0.32, h * 0.45, 0.6);

  const water = figma.createVector();
  water.vectorPaths = [
    {
      windingRule: "NONZERO",
      data: `M0 0 L${(w * 0.26).toFixed(0)} 0 C${(w * 0.18).toFixed(0)} ${(h * 0.4).toFixed(0)} ${(w * 0.3).toFixed(0)} ${(h * 0.66).toFixed(0)} ${(w * 0.16).toFixed(0)} ${h.toFixed(0)} L0 ${h.toFixed(0)} Z`,
    },
  ];
  water.fills = [solid(p.water)];
  water.strokes = [];
  m.appendChild(water);

  const road = (x1: number, y1: number, x2: number, y2: number, hex: string, wt: number): void => {
    const v = figma.createVector();
    v.vectorPaths = [
      {
        windingRule: "NONE",
        data: `M${x1.toFixed(0)} ${y1.toFixed(0)} L${x2.toFixed(0)} ${y2.toFixed(0)}`,
      },
    ];
    v.strokes = [solid(hex)];
    v.strokeWeight = wt;
    v.strokeCap = "ROUND";
    v.fills = [];
    m.appendChild(v);
  };
  const R = p.road;
  const A = p.roadHi;
  road(w * 0.3, 0, w * 0.5, h, A, 3);
  road(0, h * 0.82, w, h * 0.9, A, 3);
  road(w * 0.5, h * 0.1, w, h * 0.4, R, 2);
  road(w * 0.55, 0, w * 0.75, h, R, 2);
  road(w * 0.2, h * 0.5, w, h * 0.55, R, 2);
  road(w * 0.7, h * 0.2, w * 0.95, h * 0.9, R, 2);

  const river = figma.createVector();
  river.vectorPaths = [
    {
      windingRule: "NONE",
      data: `M${(w * 0.34).toFixed(0)} 0 C${(w * 0.3).toFixed(0)} ${(h * 0.3).toFixed(0)} ${(w * 0.42).toFixed(0)} ${(h * 0.5).toFixed(0)} ${(w * 0.36).toFixed(0)} ${h.toFixed(0)}`,
    },
  ];
  river.strokes = [{ ...solid(p.river), opacity: 0.7 } as SolidPaint];
  river.strokeWeight = 3;
  river.fills = [];
  m.appendChild(river);

  if (opts.labels !== false) {
    const lab = async (txt: string, x: number, y: number): Promise<void> => {
      const l = await makeText(t, "caption", txt, "text/muted");
      l.opacity = 0.55;
      m.appendChild(l);
      l.x = x;
      l.y = y;
    };
    await lab("The Dell", w * 0.34, h * 0.28);
    await lab("Serpentine", w * 0.07, h * 0.5);
    await lab("Rotten Row", w * 0.4, h * 0.86);
    await lab("Kensington Gdns", w * 0.62, h * 0.18);
  }
  return m;
}

interface ZoomItem {
  icon?: string;
  sym?: string;
  disabled?: boolean;
  active?: boolean;
}

async function zoomStack(t: ThemeContext, items: ZoomItem[]): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 0 });
  col.cornerRadius = RADII.md;
  col.clipsContent = true;
  strokeToken(t, col, "border/strong", 1);
  await applyEffect(col, "shadow/md", t);
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const b = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    b.resize(34, 34);
    b.primaryAxisSizingMode = "FIXED";
    b.counterAxisSizingMode = "FIXED";
    fillToken(t, b, it.active ? "bg/surface-raised" : "bg/surface");
    if (it.icon) b.appendChild(icon(t, it.icon, 16, it.active ? "accent/primary" : "text/primary"));
    else b.appendChild(await makeText(t, "body/md", it.sym ?? "", "text/primary"));
    if (it.disabled) b.opacity = 0.35;
    col.appendChild(b);
    if (i < items.length - 1) {
      const div = rect(34, 1);
      fillToken(t, div, "border/strong");
      col.appendChild(div);
    }
  }
  return col;
}

// The default map zoom control (+ / −).
async function zoomControl(t: ThemeContext): Promise<FrameNode> {
  return zoomStack(t, [{ sym: "+" }, { sym: "−" }]);
}

// A vertical zoom-slider variant (+ · track+handle · −).
async function zoomSlider(t: ThemeContext): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 0 });
  col.cornerRadius = RADII.md;
  col.clipsContent = true;
  strokeToken(t, col, "border/strong", 1);
  await applyEffect(col, "shadow/md", t);
  const btn = async (sym: string): Promise<FrameNode> => {
    const b = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    b.resize(34, 32);
    b.primaryAxisSizingMode = "FIXED";
    b.counterAxisSizingMode = "FIXED";
    fillToken(t, b, "bg/surface");
    b.appendChild(await makeText(t, "body/md", sym, "text/primary"));
    return b;
  };
  const div = (): RectangleNode => {
    const d = rect(34, 1);
    fillToken(t, d, "border/strong");
    return d;
  };
  col.appendChild(await btn("+"));
  col.appendChild(div());
  const track = figma.createFrame();
  track.resize(34, 96);
  fillToken(t, track, "bg/surface");
  const rail = rect(4, 76, 2);
  fillToken(t, rail, "border/strong");
  rail.x = 15;
  rail.y = 10;
  track.appendChild(rail);
  const filled = rect(4, 34, 2);
  fillToken(t, filled, "accent/primary");
  filled.x = 15;
  filled.y = 52;
  track.appendChild(filled);
  const handle = ellipse(14);
  fillToken(t, handle, "bg/surface-raised");
  strokeToken(t, handle, "accent/primary", 2);
  handle.x = 10;
  handle.y = 45;
  track.appendChild(handle);
  col.appendChild(track);
  col.appendChild(div());
  col.appendChild(await btn("−"));
  return col;
}

async function mapZoomVariants(t: ThemeContext): Promise<FrameNode> {
  return tileGrid(
    t,
    [
      { label: ["Default", ""], node: await zoomStack(t, [{ sym: "+" }, { sym: "−" }]) },
      {
        label: ["Locate me", ""],
        node: await zoomStack(t, [{ sym: "+" }, { sym: "−" }, { icon: "crosshair", active: true }]),
      },
      {
        label: ["Reset view", ""],
        node: await zoomStack(t, [{ sym: "+" }, { sym: "−" }, { icon: "home" }]),
      },
      {
        label: ["Fullscreen", ""],
        node: await zoomStack(t, [{ sym: "+" }, { sym: "−" }, { icon: "maximize" }]),
      },
      {
        label: ["Layers", ""],
        node: await zoomStack(t, [{ sym: "+" }, { sym: "−" }, { icon: "layers" }]),
      },
      {
        label: ["At max zoom", ""],
        node: await zoomStack(t, [{ sym: "+", disabled: true }, { sym: "−" }]),
      },
      {
        label: ["Full toolbar", ""],
        node: await zoomStack(t, [
          { sym: "+" },
          { sym: "−" },
          { icon: "crosshair" },
          { icon: "home" },
          { icon: "maximize" },
        ]),
      },
      { label: ["Slider", ""], node: await zoomSlider(t) },
    ],
    150,
  );
}

async function mapAttribution(t: ThemeContext): Promise<FrameNode> {
  const a = autoFrame({ direction: "HORIZONTAL", gap: 5, cross: "CENTER", padding: [3, 8] });
  a.cornerRadius = RADII.sm;
  a.fills = [{ ...solid("#0E1117"), opacity: 0.8 } as SolidPaint];
  a.appendChild(await makeText(t, "caption", "© OpenStreetMap", "text/muted"));
  return a;
}

async function mapPopup(t: ThemeContext, title: string, sub: string): Promise<FrameNode> {
  const wrap = autoFrame({ direction: "VERTICAL", gap: -1, cross: "CENTER" });
  const card = autoFrame({ direction: "VERTICAL", gap: 10, padding: [14, 16] });
  card.resize(244, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.lg;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  await applyEffect(card, "shadow/lg", t);
  card.appendChild(await makeText(t, "label/md", title, "text/primary"));
  card.appendChild(await makeText(t, "body/sm", sub, "text/muted", { maxWidth: 212 }));
  const btn = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    cross: "CENTER",
    align: "CENTER",
    padding: [9, 14],
  });
  btn.cornerRadius = RADII.full;
  btn.layoutAlign = "STRETCH";
  fillToken(t, btn, "accent/primary");
  btn.appendChild(icon(t, "download", 15, "accent/contrast"));
  btn.appendChild(await makeText(t, "label/sm", "Download CV", "accent/contrast"));
  card.appendChild(btn);
  wrap.appendChild(card);
  const tail = figma.createVector();
  tail.vectorPaths = [{ windingRule: "NONZERO", data: "M0 0 L16 0 L8 9 Z" }];
  tail.strokes = [];
  tail.fills = [boundSolid(colorVar(t, "bg/surface"))];
  wrap.appendChild(tail);
  return wrap;
}

async function leafletMap(t: ThemeContext, w: number, h: number): Promise<FrameNode> {
  const m = await mapBackdrop(t, w, h);
  // geofence ring around the active pin — the area you must stand in
  const acx = 0.5 * w;
  const acy = 0.46 * h;
  const rd = 156;
  const ring = figma.createEllipse();
  ring.resize(rd, rd);
  ring.fills = [{ ...solid("#5EE6C1"), opacity: 0.1 } as SolidPaint];
  ring.strokes = [{ ...solid("#5EE6C1"), opacity: 0.7 } as SolidPaint];
  ring.strokeWeight = 1.5;
  ring.dashPattern = [5, 5];
  ring.x = acx - rd / 2;
  ring.y = acy - rd / 2;
  m.appendChild(ring);

  const pinAt = (colorToken: string, fx: number, fy: number): FrameNode => {
    const p = mapPin(t, colorToken);
    m.appendChild(p);
    p.x = fx * w - 13;
    p.y = fy * h - 34;
    return p;
  };
  pinAt("accent/secondary", 0.2, 0.72);
  pinAt("feedback/warning", 0.8, 0.6);
  pinAt("accent/primary", 0.5, 0.46);

  const pop = await mapPopup(t, "Download my CV", "You're in range — grab it now.");
  m.appendChild(pop);
  pop.x = acx - 122;
  pop.y = acy - 34 - pop.height - 4;

  const zoom = await zoomControl(t);
  m.appendChild(zoom);
  zoom.x = 14;
  zoom.y = 14;

  const attr = await mapAttribution(t);
  m.appendChild(attr);
  attr.x = w - attr.width - 8;
  attr.y = h - attr.height - 8;
  return m;
}

interface LocSpec {
  name: string;
  city: string;
  note: string;
  colorToken: string;
  unlocked: boolean;
}

async function locationCard(t: ThemeContext, o: LocSpec): Promise<FrameNode> {
  const c = autoFrame({ direction: "HORIZONTAL", gap: 14, padding: 16, cross: "MIN" });
  c.resize(CANVAS_INNER, c.height);
  c.primaryAxisSizingMode = "FIXED";
  c.counterAxisSizingMode = "AUTO";
  c.cornerRadius = RADII.lg;
  fillToken(t, c, "bg/surface");
  strokeToken(t, c, "border/subtle", 1);
  c.appendChild(iconFilled(t, "map-pin", 24, o.colorToken));

  const mid = autoFrame({ direction: "VERTICAL", gap: 3 });
  mid.layoutGrow = 1;
  mid.appendChild(await makeText(t, "label/md", o.name, "text/primary"));
  mid.appendChild(await makeText(t, "caption", o.city, "text/muted"));
  mid.appendChild(await makeText(t, "body/sm", o.note, "text/secondary", { maxWidth: 520 }));
  c.appendChild(mid);

  const right = autoFrame({ direction: "VERTICAL", gap: 10, cross: "MAX" });
  const chip = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER", padding: [4, 10] });
  chip.cornerRadius = RADII.full;
  strokeToken(t, chip, o.unlocked ? "feedback/success" : "border/strong", 1);
  chip.appendChild(
    icon(t, o.unlocked ? "check" : "lock", 13, o.unlocked ? "feedback/success" : "text/muted"),
  );
  chip.appendChild(
    await makeText(
      t,
      "caption",
      o.unlocked ? "In range" : "Out of range",
      o.unlocked ? "feedback/success" : "text/muted",
    ),
  );
  right.appendChild(chip);
  const btn = await drawButton(
    t,
    o.unlocked ? "Primary" : "Secondary",
    "Default",
    "sm",
    "pill",
    o.unlocked ? "Download CV" : "Locked",
  );
  if (!o.unlocked) btn.opacity = 0.5;
  right.appendChild(btn);
  c.appendChild(right);
  return c;
}

// ── Marker variants ───────────────────────────────────────────
const TOKEN_HEX: Record<string, string> = {
  "accent/primary": "#5EE6C1",
  "accent/secondary": "#818CF8",
  "feedback/warning": "#FBBF24",
  "feedback/success": "#34D399",
  "feedback/danger": "#F87171",
  "accent/dante": "#FF3D8B",
  // keep in sync with COLOR_TOKENS — an unknown token silently falls back to mint
  "accent/violet": "#B84BFF",
  "accent/ember": "#FF8A5C",
  "accent/ice": "#22D3EE",
  "glass/fill-strong": "#FFFFFF1F",
  "glass/border": "#FFFFFF24",
  "text/muted": "#6E6E78",
};
// A translucent paint from a token — via hex, since paint opacity is ignored on
// variable-bound fills.
function tokenAlpha(token: string, a: number): SolidPaint {
  return { ...solid(TOKEN_HEX[token] ?? "#5EE6C1"), opacity: a } as SolidPaint;
}

/** Soft colored glow from a token — effect styles are mint-only, other tones need their own. */
function toneGlow(token: string, radius = 16, a = 0.35): DropShadowEffect {
  const c = solid(TOKEN_HEX[token] ?? "#5EE6C1").color;
  return {
    type: "DROP_SHADOW",
    color: { ...c, a },
    offset: { x: 0, y: 0 },
    radius,
    spread: 0,
    visible: true,
    blendMode: "NORMAL",
  } as DropShadowEffect;
}

// Shared tone rows for the "Tones" showcase blocks (dante-mode ready).
const TONES_3: Array<[string, string, string]> = [
  ["Mint", "", "accent/primary"],
  ["Dante", "", "accent/dante"],
  ["Indigo", "", "accent/secondary"],
];
/** All six accents — the palette a section can be tinted with. */
const TONES_ACCENT: Array<[string, string, string]> = [
  ...TONES_3,
  ["Violet", "", "accent/violet"],
  ["Ember", "", "accent/ember"],
  ["Ice", "", "accent/ice"],
];
const TONES_FEEDBACK: Array<[string, string, string]> = [
  ["Success", "", "feedback/success"],
  ["Warning", "", "feedback/warning"],
  ["Danger", "", "feedback/danger"],
];
/** Accents + feedback — the full row, used wherever tone is a real axis. */
const TONES_9: Array<[string, string, string]> = [...TONES_ACCENT, ...TONES_FEEDBACK];

// ── Section tone ──────────────────────────────────────────────
// A section carries its own accent: components inside inherit it instead of
// hardcoding mint. Keyed by a short class name so the web side can do the same
// with a `data-tone` / class on the section wrapper.
const SECTION_TONE: Record<string, string> = {
  inputs: "accent/primary",
  selection: "accent/ice",
  actions: "accent/dante",
  navigation: "accent/secondary",
  feedback: "feedback/success",
  overlays: "accent/violet",
  data: "accent/ice",
  datetime: "accent/secondary",
  media: "accent/ember",
  music: "accent/dante",
  map: "accent/primary",
  chat: "accent/secondary",
  ai: "accent/violet",
};

let activeSectionTone = "accent/primary";

/** Switch the ambient tone; unknown names fall back to mint. */
function setSectionTone(cls: string): void {
  activeSectionTone = SECTION_TONE[cls] ?? "accent/primary";
}

/** The tone components should default to when nothing is passed explicitly. */
function sectionTone(): string {
  return activeSectionTone;
}

/** Build one section with its tone applied to every board inside it. */
async function tonedSection(
  title: string,
  cls: string,
  make: () => Array<Promise<FrameNode>>,
): Promise<{ title: string; boards: FrameNode[] }> {
  setSectionTone(cls);
  const boards = await Promise.all(make());
  setSectionTone("inputs"); // back to the default so nothing leaks out
  return { title, boards };
}

function markerDot(t: ThemeContext, colorToken: string): FrameNode {
  const f = figma.createFrame();
  f.name = "marker-dot";
  f.fills = [];
  f.clipsContent = false;
  f.resize(22, 22);
  const ring = ellipse(22);
  ring.fills = [solid("#FFFFFF")];
  ring.strokes = [];
  ring.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.35 },
      offset: { x: 0, y: 2 },
      radius: 4,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    } as DropShadowEffect,
  ];
  f.appendChild(ring);
  const inner = ellipse(13);
  fillToken(t, inner, colorToken);
  inner.strokes = [];
  inner.x = 4.5;
  inner.y = 4.5;
  f.appendChild(inner);
  return f;
}

async function markerCluster(
  t: ThemeContext,
  colorToken: string,
  count: string,
): Promise<FrameNode> {
  const f = figma.createFrame();
  f.name = "marker-cluster";
  f.fills = [];
  f.clipsContent = false;
  f.resize(42, 42);
  const outer = ellipse(42);
  outer.fills = [tokenAlpha(colorToken, 0.25)];
  outer.strokes = [];
  f.appendChild(outer);
  const inner = ellipse(32);
  fillToken(t, inner, colorToken);
  inner.strokes = [];
  inner.x = 5;
  inner.y = 5;
  f.appendChild(inner);
  const label = await makeText(t, "label/sm", count, "accent/contrast");
  f.appendChild(label);
  label.x = (42 - label.width) / 2;
  label.y = (42 - label.height) / 2;
  return f;
}

function markerSelected(t: ThemeContext, colorToken: string): FrameNode {
  const f = figma.createFrame();
  f.name = "marker-selected";
  f.fills = [];
  f.clipsContent = false;
  f.resize(40, 44);
  const glow = ellipse(40);
  glow.fills = [tokenAlpha(colorToken, 0.18)];
  glow.strokes = [];
  glow.x = 0;
  glow.y = 6;
  f.appendChild(glow);
  const pin = mapPin(t, colorToken, { selected: true });
  f.appendChild(pin);
  pin.x = 7;
  pin.y = 0;
  return f;
}

async function markerAvatar(t: ThemeContext, colorToken: string): Promise<FrameNode> {
  const f = figma.createFrame();
  f.name = "marker-avatar";
  f.fills = [];
  f.clipsContent = false;
  f.resize(40, 48);
  const tri = figma.createVector();
  tri.vectorPaths = [{ windingRule: "NONZERO", data: "M0 0 L12 0 L6 9 Z" }];
  tri.fills = [boundSolid(colorVar(t, colorToken))];
  tri.strokes = [];
  f.appendChild(tri);
  tri.x = 14;
  tri.y = 32;
  const av = ellipse(38);
  fillToken(t, av, "bg/surface-raised");
  strokeToken(t, av, colorToken, 3);
  av.x = 1;
  av.y = 0;
  f.appendChild(av);
  const usr = iconFilled(t, "user", 20, "text/muted");
  f.appendChild(usr);
  usr.x = 10;
  usr.y = 9;
  return f;
}

async function markerLabel(t: ThemeContext, colorToken: string, text: string): Promise<FrameNode> {
  const f = autoFrame({ direction: "HORIZONTAL", gap: 7, cross: "CENTER" });
  f.appendChild(mapPin(t, colorToken));
  const pill = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [5, 10],
  });
  pill.cornerRadius = RADII.full;
  fillToken(t, pill, "bg/surface");
  strokeToken(t, pill, "border/subtle", 1);
  await applyEffect(pill, "shadow/sm", t);
  pill.appendChild(await makeText(t, "caption", text, "text/primary"));
  f.appendChild(pill);
  return f;
}

function markerPulse(t: ThemeContext, colorToken: string): FrameNode {
  const f = figma.createFrame();
  f.name = "marker-pulse";
  f.fills = [];
  f.clipsContent = false;
  f.resize(44, 44);
  const r1 = ellipse(44);
  r1.fills = [tokenAlpha(colorToken, 0.12)];
  r1.strokes = [];
  f.appendChild(r1);
  const r2 = ellipse(30);
  r2.fills = [tokenAlpha(colorToken, 0.22)];
  r2.strokes = [];
  r2.x = 7;
  r2.y = 7;
  f.appendChild(r2);
  const dot = ellipse(14);
  fillToken(t, dot, colorToken);
  dot.strokes = [solid("#FFFFFF")];
  dot.strokeWeight = 2;
  dot.x = 15;
  dot.y = 15;
  f.appendChild(dot);
  return f;
}

async function mapMarkerVariants(t: ThemeContext): Promise<FrameNode> {
  return tileGrid(
    t,
    [
      { label: ["Default", ""], node: mapPin(t, "accent/primary") },
      { label: ["Selected", ""], node: markerSelected(t, "accent/primary") },
      { label: ["Dot", ""], node: markerDot(t, "accent/secondary") },
      { label: ["Cluster", ""], node: await markerCluster(t, "feedback/warning", "24") },
      { label: ["Category", ""], node: mapPin(t, "feedback/warning", { icon: "coffee" }) },
      { label: ["Avatar", ""], node: await markerAvatar(t, "accent/primary") },
      { label: ["Label", ""], node: await markerLabel(t, "accent/secondary", "The Dell") },
      { label: ["Pulse", ""], node: markerPulse(t, "accent/primary") },
    ],
    160,
  );
}

// ── Popup variants ────────────────────────────────────────────
async function popBtn(
  t: ThemeContext,
  label: string,
  iconName: string | null,
  variant: "Primary" | "Outline" | "Disabled",
): Promise<FrameNode> {
  const btn = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    cross: "CENTER",
    align: "CENTER",
    padding: [9, 14],
  });
  btn.cornerRadius = RADII.full;
  btn.layoutAlign = "STRETCH";
  const primary = variant === "Primary";
  if (primary) fillToken(t, btn, "accent/primary");
  else {
    fillToken(t, btn, "bg/surface-raised");
    strokeToken(t, btn, "border/subtle", 1);
  }
  const tone = primary ? "accent/contrast" : "text/primary";
  if (iconName) btn.appendChild(icon(t, iconName, 15, tone));
  btn.appendChild(await makeText(t, "label/sm", label, tone));
  if (variant === "Disabled") btn.opacity = 0.45;
  return btn;
}

async function popupWrap(
  t: ThemeContext,
  children: SceneNode[],
  width: number,
  dark = false,
): Promise<FrameNode> {
  const wrap = autoFrame({ direction: "VERTICAL", gap: -1, cross: "CENTER" });
  const card = autoFrame({ direction: "VERTICAL", gap: 9, padding: dark ? [9, 12] : [14, 16] });
  card.resize(width, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.lg;
  fillToken(t, card, dark ? "bg/inset" : "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  await applyEffect(card, "shadow/lg", t);
  for (const c of children) card.appendChild(c);
  wrap.appendChild(card);
  const tail = figma.createVector();
  tail.vectorPaths = [{ windingRule: "NONZERO", data: "M0 0 L16 0 L8 9 Z" }];
  tail.strokes = [];
  tail.fills = [boundSolid(colorVar(t, dark ? "bg/inset" : "bg/surface"))];
  wrap.appendChild(tail);
  return wrap;
}

async function popRow(
  t: ThemeContext,
  iconName: string,
  text: string,
  tone = "text/secondary",
): Promise<FrameNode> {
  const r = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  r.appendChild(icon(t, iconName, 15, "text/muted"));
  r.appendChild(await makeText(t, "body/sm", text, tone));
  return r;
}

function photoPlaceholder(t: ThemeContext, w: number, h: number): FrameNode {
  const p = figma.createFrame();
  p.resize(w, h);
  p.cornerRadius = RADII.md;
  p.clipsContent = true;
  fillToken(t, p, "bg/surface-raised");
  const im = icon(t, "image", 26, "text/muted");
  p.appendChild(im);
  im.x = (w - 26) / 2;
  im.y = (h - 26) / 2;
  return p;
}

async function statusPill(t: ThemeContext, text: string, tone: string): Promise<FrameNode> {
  const chip = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER", padding: [3, 9] });
  chip.cornerRadius = RADII.full;
  strokeToken(t, chip, tone, 1);
  chip.appendChild(statusDot(t, tone, 6));
  chip.appendChild(await makeText(t, "caption", text, tone));
  return chip;
}

async function mapPopupVariants(t: ThemeContext): Promise<FrameNode> {
  const W = 232;
  const tiles: Array<{ label: Bi; node: SceneNode }> = [];

  tiles.push({
    label: ["Download CV", "CV"],
    node: await popupWrap(
      t,
      [
        await makeText(t, "label/md", "Download my CV", "text/primary"),
        await makeText(t, "body/sm", "You're in range — grab it now.", "text/muted", {
          maxWidth: W - 32,
        }),
        await popBtn(t, "Download CV", "download", "Primary"),
      ],
      W,
    ),
  });

  tiles.push({
    label: ["Photo", ""],
    node: await popupWrap(
      t,
      [
        photoPlaceholder(t, W - 32, 96),
        await makeText(t, "label/md", "The Dell", "text/primary"),
        await makeText(t, "body/sm", "A quiet corner by the Serpentine.", "text/muted", {
          maxWidth: W - 32,
        }),
      ],
      W,
    ),
  });

  tiles.push({
    label: ["Address", ""],
    node: await popupWrap(
      t,
      [
        await makeText(t, "label/md", "Caffè Trieste", "text/primary"),
        await popRow(t, "map-pin", "601 Vallejo St, San Francisco"),
        await popBtn(t, "Copy address", "copy", "Outline"),
      ],
      W,
    ),
  });

  tiles.push({
    label: ["Hours", ""],
    node: await popupWrap(
      t,
      [
        await makeText(t, "label/md", "Opening hours", "text/primary"),
        await statusPill(t, "Open now", "feedback/success"),
        await popRow(t, "clock", "Mon–Fri · 8:00–20:00"),
        await popRow(t, "clock", "Sat–Sun · 9:00–18:00"),
      ],
      W,
    ),
  });

  tiles.push({
    label: ["Directions", ""],
    node: await popupWrap(
      t,
      [
        await makeText(t, "label/md", "The Dell", "text/primary"),
        await popRow(t, "navigation", "1.2 km · 15 min walk"),
        await popBtn(t, "Get directions", "navigation", "Primary"),
      ],
      W,
    ),
  });

  const miniRow = autoFrame({
    direction: "HORIZONTAL",
    gap: 10,
    cross: "CENTER",
    align: "SPACE_BETWEEN",
  });
  miniRow.layoutAlign = "STRETCH";
  const miniLeft = autoFrame({ direction: "VERTICAL", gap: 1 });
  miniLeft.layoutGrow = 1;
  miniLeft.appendChild(await makeText(t, "label/sm", "Maidan", "text/primary"));
  miniLeft.appendChild(await makeText(t, "caption", "Kyiv, UA", "text/muted"));
  miniRow.appendChild(miniLeft);
  miniRow.appendChild(icon(t, "chevron-right", 16, "text/muted"));
  tiles.push({ label: ["Mini card", ""], node: await popupWrap(t, [miniRow], W - 24) });

  tiles.push({
    label: ["Tooltip", ""],
    node: await popupWrap(
      t,
      [
        await makeText(t, "body/sm", "You must stand here to unlock", "text/primary", {
          maxWidth: W - 24,
        }),
      ],
      W - 40,
      true,
    ),
  });

  tiles.push({
    label: ["Locked", ""],
    node: await popupWrap(
      t,
      [
        await popRow(t, "lock", "Locked", "text/primary"),
        await makeText(t, "body/sm", "Come within 50 m to unlock.", "text/muted", {
          maxWidth: W - 32,
        }),
        await popBtn(t, "Download CV", "download", "Disabled"),
      ],
      W,
    ),
  });

  return tileGrid(t, tiles, W + 28);
}

// ── Cities & zoom use-cases ───────────────────────────────────
interface CitySpec {
  city: string;
  address: string;
  zoom: string;
  colorToken: string;
}

async function cityMapCard(t: ThemeContext, c: CitySpec, w: number): Promise<FrameNode> {
  const mapH = 148;
  const card = figma.createFrame();
  card.name = `city-${c.city}`;
  card.resize(w, mapH + 66);
  card.cornerRadius = RADII.lg;
  card.clipsContent = true;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);

  const map = await mapBackdrop(t, w, mapH, { labels: false, chrome: false });
  card.appendChild(map);
  map.x = 0;
  map.y = 0;

  // subtle geofence + pin at centre
  const rd = 74;
  const ring = figma.createEllipse();
  ring.resize(rd, rd);
  ring.fills = [tokenAlpha(c.colorToken, 0.1)];
  ring.strokes = [tokenAlpha(c.colorToken, 0.6)];
  ring.strokeWeight = 1;
  ring.dashPattern = [4, 4];
  ring.x = w / 2 - rd / 2;
  ring.y = mapH * 0.52 - rd / 2;
  card.appendChild(ring);
  const pin = mapPin(t, c.colorToken);
  card.appendChild(pin);
  pin.x = w / 2 - 13;
  pin.y = mapH * 0.52 - 34;

  // zoom badge (top-right)
  const badge = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [3, 8],
  });
  badge.cornerRadius = RADII.full;
  badge.fills = [{ ...solid("#0E1117"), opacity: 0.82 } as SolidPaint];
  strokeToken(t, badge, "border/subtle", 1);
  badge.appendChild(await makeText(t, "caption", c.zoom, "text/secondary"));
  card.appendChild(badge);
  badge.x = w - badge.width - 10;
  badge.y = 10;

  // caption
  const cap = autoFrame({ direction: "VERTICAL", gap: 4, padding: [12, 14] });
  cap.resize(w, cap.height);
  cap.counterAxisSizingMode = "FIXED";
  cap.appendChild(await makeText(t, "label/md", c.city, "text/primary"));
  const addr = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
  addr.appendChild(icon(t, "map-pin", 13, "text/muted"));
  addr.appendChild(await makeText(t, "caption", c.address, "text/muted", { maxWidth: w - 44 }));
  cap.appendChild(addr);
  card.appendChild(cap);
  cap.x = 0;
  cap.y = mapH;
  return card;
}

async function mapCities(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t);
  const gap = 20;
  const cardW = Math.floor((CANVAS_INNER - gap * 2) / 3);
  const g = autoFrame({ direction: "HORIZONTAL", gap, wrap: true, cross: "MIN" });
  g.resize(CANVAS_INNER, g.height);
  g.primaryAxisSizingMode = "FIXED";
  g.counterAxisSizingMode = "AUTO";
  g.counterAxisSpacing = 20;
  const cities: CitySpec[] = [
    {
      city: "Berlin",
      address: "Alexanderplatz 1, 10178",
      zoom: "z13",
      colorToken: "accent/primary",
    },
    { city: "Frankfurt", address: "Zeil 106, 60313", zoom: "z14", colorToken: "accent/secondary" },
    {
      city: "Heilbronn",
      address: "Kaiserstraße 24, 74072",
      zoom: "z15",
      colorToken: "feedback/warning",
    },
    {
      city: "Hamburg",
      address: "Jungfernstieg 7, 20354",
      zoom: "z13",
      colorToken: "feedback/success",
    },
    {
      city: "München",
      address: "Marienplatz 8, 80331",
      zoom: "z14",
      colorToken: "feedback/danger",
    },
    { city: "Köln", address: "Domkloster 4, 50667", zoom: "z15", colorToken: "accent/primary" },
  ];
  for (const c of cities) g.appendChild(await cityMapCard(t, c, cardW));
  wrap.appendChild(g);
  return wrap;
}

// ── Map themes (recolor) ──────────────────────────────────────
async function mapThemes(t: ThemeContext): Promise<FrameNode> {
  const themes: Array<{ label: Bi; pal: MapPalette }> = [
    { label: ["Dark", ""], pal: MAP_DARK },
    {
      label: ["Midnight", ""],
      pal: {
        base: "#0B1020",
        water: "#131A3A",
        park: "#17203A",
        road: "#232A45",
        roadHi: "#3A4570",
        river: "#4457A0",
      },
    },
    {
      label: ["Forest", ""],
      pal: {
        base: "#0C130E",
        water: "#12291F",
        park: "#1B3A24",
        road: "#1F2D22",
        roadHi: "#35563E",
        river: "#2E6E4E",
      },
    },
    {
      label: ["Ocean", ""],
      pal: {
        base: "#071019",
        water: "#0E2A44",
        park: "#0F2A2E",
        road: "#16303C",
        roadHi: "#2A5566",
        river: "#2E7E9C",
      },
    },
    {
      label: ["Sepia", ""],
      pal: {
        base: "#17120C",
        water: "#2A2418",
        park: "#2E2A16",
        road: "#2E2A22",
        roadHi: "#4A4230",
        river: "#6E5A2E",
      },
    },
    {
      label: ["Mono", ""],
      pal: {
        base: "#101012",
        water: "#1C1C20",
        park: "#202024",
        road: "#26262A",
        roadHi: "#3A3A40",
        river: "#4A4A52",
      },
    },
    {
      label: ["Neon", ""],
      pal: {
        base: "#0A0A14",
        water: "#14183A",
        park: "#1A0F2E",
        road: "#241A3A",
        roadHi: "#4A2E7A",
        river: "#B84BFF",
      },
    },
    {
      label: ["Sand", ""],
      pal: {
        base: "#EDE7DC",
        water: "#BFD4E4",
        park: "#D3E2C4",
        road: "#FBF8F2",
        roadHi: "#DCD3C4",
        river: "#9CC0DA",
      },
    },
  ];
  const tiles: Array<{ label: Bi; node: SceneNode }> = [];
  for (const th of themes)
    tiles.push({
      label: th.label,
      node: await mapBackdrop(t, 214, 116, { labels: false, palette: th.pal }),
    });
  return tileGrid(t, tiles, 230);
}

// ── Route use-case ────────────────────────────────────────────
async function mapRoute(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t);
  const w = CANVAS_INNER;
  const h = 300;
  const map = await mapBackdrop(t, w, h, { labels: false });

  const p0 = { x: w * 0.14, y: h * 0.74 };
  const p1 = { x: w * 0.86, y: h * 0.26 };
  const route = figma.createVector();
  route.vectorPaths = [
    {
      windingRule: "NONE",
      data: `M${p0.x.toFixed(0)} ${p0.y.toFixed(0)} C${(w * 0.34).toFixed(0)} ${(h * 0.9).toFixed(0)} ${(w * 0.5).toFixed(0)} ${(h * 0.28).toFixed(0)} ${(w * 0.62).toFixed(0)} ${(h * 0.42).toFixed(0)} C${(w * 0.72).toFixed(0)} ${(h * 0.53).toFixed(0)} ${(w * 0.78).toFixed(0)} ${(h * 0.3).toFixed(0)} ${p1.x.toFixed(0)} ${p1.y.toFixed(0)}`,
    },
  ];
  route.strokes = [boundSolid(colorVar(t, "accent/primary"))];
  route.strokeWeight = 3;
  route.strokeCap = "ROUND";
  route.dashPattern = [2, 8];
  route.fills = [];
  map.appendChild(route);

  const start = mapPin(t, "feedback/success", { icon: "navigation" });
  map.appendChild(start);
  start.x = p0.x - 13;
  start.y = p0.y - 34;
  const end = mapPin(t, "feedback/danger", { icon: "map-pin" });
  map.appendChild(end);
  end.x = p1.x - 13;
  end.y = p1.y - 34;

  const chip = autoFrame({ direction: "HORIZONTAL", gap: 7, cross: "CENTER", padding: [6, 12] });
  chip.cornerRadius = RADII.full;
  fillToken(t, chip, "bg/surface");
  strokeToken(t, chip, "border/subtle", 1);
  await applyEffect(chip, "shadow/md", t);
  chip.appendChild(icon(t, "navigation", 14, "accent/primary"));
  chip.appendChild(await makeText(t, "label/sm", "2.4 km · 30 min walk", "text/primary"));
  map.appendChild(chip);
  chip.x = 14;
  chip.y = 14;

  wrap.appendChild(map);
  return wrap;
}

// ── Split view: directions panel + map ────────────────────────
async function directionsPanel(t: ThemeContext, w: number, h: number): Promise<FrameNode> {
  const p = autoFrame({ direction: "VERTICAL", gap: 16, padding: 18 });
  p.resize(w, h);
  p.primaryAxisSizingMode = "FIXED";
  p.counterAxisSizingMode = "FIXED";
  fillToken(t, p, "bg/surface");

  // transport-mode segmented
  const seg = autoFrame({ direction: "HORIZONTAL", gap: 4, padding: 4 });
  seg.cornerRadius = RADII.full;
  seg.layoutAlign = "STRETCH";
  fillToken(t, seg, "bg/inset");
  const modes: Array<[string, boolean]> = [
    ["footprints", true],
    ["bike", false],
    ["car", false],
    ["bus", false],
  ];
  for (const [ic, on] of modes) {
    const b = autoFrame({
      direction: "HORIZONTAL",
      align: "CENTER",
      cross: "CENTER",
      padding: [8, 0],
    });
    b.layoutGrow = 1;
    b.cornerRadius = RADII.full;
    if (on) fillToken(t, b, "bg/surface-raised");
    b.appendChild(icon(t, ic, 17, on ? "accent/primary" : "text/muted"));
    seg.appendChild(b);
  }
  p.appendChild(seg);

  // from / to
  const stopRow = async (colorToken: string, text: string): Promise<FrameNode> => {
    const r = autoFrame({ direction: "HORIZONTAL", gap: 11, cross: "CENTER" });
    const dot = ellipse(11);
    fillToken(t, dot, colorToken);
    dot.strokes = [];
    r.appendChild(dot);
    r.appendChild(await makeText(t, "body/md", text, "text/primary"));
    return r;
  };
  const stops = autoFrame({ direction: "VERTICAL", gap: 12 });
  stops.appendChild(await stopRow("feedback/success", "The Dell"));
  stops.appendChild(await stopRow("feedback/danger", "Caffè Trieste"));
  p.appendChild(stops);

  p.appendChild(hairline(t, w - 36));

  // ETA
  const eta = autoFrame({ direction: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER" });
  eta.layoutAlign = "STRETCH";
  const etaL = autoFrame({ direction: "VERTICAL", gap: 1 });
  etaL.appendChild(await makeText(t, "heading/h3", "30 min", "text/primary"));
  etaL.appendChild(await makeText(t, "caption", "2.4 km · fastest", "text/muted"));
  eta.appendChild(etaL);
  const modeChip = autoFrame({
    direction: "HORIZONTAL",
    gap: 6,
    cross: "CENTER",
    padding: [5, 11],
  });
  modeChip.cornerRadius = RADII.full;
  strokeToken(t, modeChip, "accent/primary", 1);
  modeChip.appendChild(icon(t, "footprints", 13, "accent/primary"));
  modeChip.appendChild(await makeText(t, "caption", "Walk", "accent/primary"));
  eta.appendChild(modeChip);
  p.appendChild(eta);

  p.appendChild(hairline(t, w - 36));

  // steps
  const steps: Array<[string, string, string]> = [
    ["arrow-up", "Head north across The Dell", "400 m"],
    ["arrow-right", "Turn right onto Rotten Row", "1.1 km"],
    ["arrow-up", "Continue past the Serpentine", "700 m"],
    ["map-pin", "Arrive at Caffè Trieste", "—"],
  ];
  const stepsCol = autoFrame({ direction: "VERTICAL", gap: 13 });
  for (const [ic, txt, dist] of steps) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 11, cross: "MIN" });
    row.appendChild(icon(t, ic, 16, "text/muted"));
    const col = autoFrame({ direction: "VERTICAL", gap: 1 });
    col.layoutGrow = 1;
    col.appendChild(await makeText(t, "body/sm", txt, "text/secondary", { maxWidth: w - 90 }));
    col.appendChild(await makeText(t, "caption", dist, "text/muted"));
    row.appendChild(col);
    stepsCol.appendChild(row);
  }
  p.appendChild(stepsCol);
  return p;
}

async function mapSplitView(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t);
  const W = CANVAS_INNER;
  const H = 440;
  const container = autoFrame({ direction: "HORIZONTAL", gap: 0 });
  container.resize(W, H);
  container.primaryAxisSizingMode = "FIXED";
  container.counterAxisSizingMode = "FIXED";
  container.cornerRadius = RADII.lg;
  container.clipsContent = true;
  strokeToken(t, container, "border/subtle", 1);

  const panelW = 340;
  container.appendChild(await directionsPanel(t, panelW, H));
  const sep = rect(1, H);
  fillToken(t, sep, "border/subtle");
  container.appendChild(sep);

  const mapW = W - panelW - 1;
  const map = await mapBackdrop(t, mapW, H, { labels: false, chrome: false });
  const p0 = { x: mapW * 0.16, y: H * 0.72 };
  const p1 = { x: mapW * 0.82, y: H * 0.24 };
  const route = figma.createVector();
  route.vectorPaths = [
    {
      windingRule: "NONE",
      data: `M${p0.x.toFixed(0)} ${p0.y.toFixed(0)} C${(mapW * 0.36).toFixed(0)} ${(H * 0.86).toFixed(0)} ${(mapW * 0.48).toFixed(0)} ${(H * 0.34).toFixed(0)} ${(mapW * 0.6).toFixed(0)} ${(H * 0.42).toFixed(0)} C${(mapW * 0.72).toFixed(0)} ${(H * 0.5).toFixed(0)} ${(mapW * 0.74).toFixed(0)} ${(H * 0.28).toFixed(0)} ${p1.x.toFixed(0)} ${p1.y.toFixed(0)}`,
    },
  ];
  route.strokes = [boundSolid(colorVar(t, "accent/primary"))];
  route.strokeWeight = 3;
  route.strokeCap = "ROUND";
  route.dashPattern = [2, 8];
  route.fills = [];
  map.appendChild(route);
  const start = mapPin(t, "feedback/success", { icon: "navigation" });
  map.appendChild(start);
  start.x = p0.x - 13;
  start.y = p0.y - 34;
  const end = mapPin(t, "feedback/danger", { icon: "map-pin" });
  map.appendChild(end);
  end.x = p1.x - 13;
  end.y = p1.y - 34;
  container.appendChild(map);

  wrap.appendChild(container);
  return wrap;
}

async function mapBoard(t: ThemeContext): Promise<FrameNode> {
  const mapCanvas = canvas(t);
  mapCanvas.appendChild(await leafletMap(t, CANVAS_INNER, 430));

  const locWrap = canvas(t);
  const list = autoFrame({ direction: "VERTICAL", gap: 14 });
  list.resize(CANVAS_INNER, list.height);
  list.counterAxisSizingMode = "FIXED";
  const locs: LocSpec[] = [
    {
      name: "Hyde Park — The Dell",
      city: "London, UK",
      note: ["Bench by the Serpentine. You must be within 50 m.", ""].join("\n"),
      colorToken: "accent/primary",
      unlocked: true,
    },
    {
      name: "Maidan Nezalezhnosti",
      city: "Kyiv, UA",
      note: "Center of Independence Square.",
      colorToken: "accent/secondary",
      unlocked: false,
    },
    {
      name: "Caffè Trieste",
      city: "San Francisco, US",
      note: "The corner table by the window.",
      colorToken: "feedback/warning",
      unlocked: false,
    },
  ];
  for (const l of locs) list.appendChild(await locationCard(t, l));
  locWrap.appendChild(list);

  const props: PropRow[] = [
    {
      prop: "center / zoom",
      type: "[lat,lng] · number",
      def: "—",
      note: ["Initial map view.", ""],
    },
    {
      prop: "tileLayer",
      type: "'dark' | 'osm'",
      def: "dark",
      note: ["OpenStreetMap tile theme.", "OpenStreetMap."],
    },
    {
      prop: "markers",
      type: "Marker[]",
      def: "[]",
      note: ["Pinned locations with color + popup.", ""],
    },
    {
      prop: "geofence",
      type: "{ radius:number }",
      def: "50 m",
      note: ["Area you must stand in to unlock.", ""],
    },
    {
      prop: "Marker.popup",
      type: "ReactNode",
      def: "—",
      note: ["Card shown on click — the download CTA.", ""],
    },
    {
      prop: "onDownload",
      type: "(loc)=>void",
      def: "—",
      note: ["Fires when in range and clicked.", ""],
    },
  ];
  return componentBoard(
    t,
    "Location Map",
    ["Interactive map — stand at a pin to unlock the CV", "— , CV"],
    ["A plain address list → use a List", "→ List"],
    [
      await block(t, "Map", mapCanvas),
      await block(t, "Cities & zoom", await mapCities(t)),
      await block(t, "Themes", await mapThemes(t)),
      await block(t, "Route", await mapRoute(t)),
      await block(t, "Directions (split view)", await mapSplitView(t)),
      await block(t, "Markers", await mapMarkerVariants(t)),
      await block(t, "Popups", await mapPopupVariants(t)),
      await block(t, "Zoom controls", await mapZoomVariants(t)),
      await block(t, "Locations", locWrap),
    ],
    props,
  );
}

// ── CV download flow (process) ────────────────────────────────
// The end-to-end process a visitor walks through to get my CV. Two tracks share
// the same flow and differ only in step 3:
//   A · Story    — fill in a form about yourself, your idea and your project.
//   B · In range — just tap while standing inside a download zone; I get a
//                  request and approve or decline it.
// Either way the consent + the hand-off are anchored on a cheap L2 chain, so
// the visitor can verify exactly which data was attached to the CV they got.
// Every element below is composed from existing catalog components.

// The spine of the flow — the Stepper component, nothing bespoke.
const CV_STEPS: StepSpec[] = [
  { label: "Find a zone", desc: "", state: "done" },
  { label: "Pick a track", desc: "", state: "done" },
  { label: "Story or tap", desc: "", state: "current" },
  { label: "Approve", desc: "", state: "upcoming" },
  { label: "Accept terms", desc: "", state: "upcoming" },
  { label: "Anchor", desc: "", state: "upcoming" },
  { label: "Download CV", desc: "CV", state: "upcoming" },
];

async function cvStepperCanvas(t: ThemeContext): Promise<FrameNode> {
  const c = canvas(t);
  c.counterAxisAlignItems = "CENTER";
  c.itemSpacing = 20;
  c.appendChild(await drawStepperH(t, CV_STEPS, 96));
  return c;
}

/** The same seven steps spelled out — the vertical Stepper variant. */
async function cvStepperDetail(t: ThemeContext): Promise<FrameNode> {
  const c = canvas(t);
  const steps: StepSpec[] = [
    {
      label: "1 · Find a download zone",
      desc: "Great Britain · Berlin · Frankfurt · München · Kyiv — circles on the map.",
      state: "done",
    },
    {
      label: "2 · Pick a track",
      desc: "Tell your story, or just tap while you're standing in range.",
      state: "done",
    },
    {
      label: "3A · Tell your story",
      desc: "Who you are, your idea, your project — this is what the CV is issued against.",
      state: "current",
    },
    {
      label: "3B · Tap in range",
      desc: "One tap sends location + timestamp only. Nothing else leaves your phone.",
      state: "current",
    },
    {
      label: "4 · I approve or decline",
      desc: "A request lands in my inbox; declining deletes everything you sent.",
      state: "upcoming",
    },
    {
      label: "5 · Accept the terms",
      desc: "Approved + Terms & Conditions checked = the gate opens. Privacy Policy: TBD.",
      state: "upcoming",
    },
    {
      label: "6 · Consent anchored on-chain",
      desc: "A hash of your consent goes to a cheap L2 (Base) — the hand-off is verifiable.",
      state: "upcoming",
    },
    {
      label: "7 · Download the CV",
      desc: "PDF + a receipt you can check on the explorer.",
      state: "upcoming",
    },
  ];
  c.appendChild(await drawStepperV(t, steps, CANVAS_INNER));
  return c;
}

// ── Step 1 · download zones on the map ────────────────────────
interface ZoneSpec {
  name: string;
  sub: Bi;
  fx: number;
  fy: number;
  r: number;
  colorToken: string;
  count: string;
  live?: boolean;
}

const CV_ZONES: ZoneSpec[] = [
  {
    name: "Great Britain",
    sub: ["London · Hyde Park", ""],
    fx: 0.14,
    fy: 0.28,
    r: 138,
    colorToken: "accent/primary",
    count: "3",
    live: true,
  },
  {
    name: "Berlin",
    sub: ["Mitte · Museumsinsel", ""],
    fx: 0.52,
    fy: 0.22,
    r: 96,
    colorToken: "accent/secondary",
    count: "2",
  },
  {
    name: "Frankfurt",
    sub: ["Bankenviertel", ""],
    fx: 0.42,
    fy: 0.56,
    r: 88,
    colorToken: "feedback/warning",
    count: "1",
  },
  {
    name: "München",
    sub: ["Isarvorstadt", ""],
    fx: 0.6,
    fy: 0.8,
    r: 84,
    colorToken: "accent/dante",
    count: "1",
  },
  {
    name: "Kyiv",
    sub: ["Maidan Nezalezhnosti", ""],
    fx: 0.85,
    fy: 0.42,
    r: 108,
    colorToken: "feedback/success",
    count: "2",
  },
];

/** A dashed geofence circle — the area you must stand in to unlock. */
function zoneRing(colorToken: string, d: number): EllipseNode {
  const ring = figma.createEllipse();
  ring.resize(d, d);
  ring.fills = [tokenAlpha(colorToken, 0.1)];
  ring.strokes = [tokenAlpha(colorToken, 0.65)];
  ring.strokeWeight = 1.5;
  ring.dashPattern = [5, 5];
  return ring;
}

async function zonesMap(t: ThemeContext, w: number, h: number): Promise<FrameNode> {
  const m = await mapBackdrop(t, w, h, { labels: false });
  for (const z of CV_ZONES) {
    const cx = z.fx * w;
    const cy = z.fy * h;
    const ring = zoneRing(z.colorToken, z.r);
    m.appendChild(ring);
    ring.x = cx - z.r / 2;
    ring.y = cy - z.r / 2;

    if (z.live) {
      const pulse = markerPulse(t, z.colorToken);
      m.appendChild(pulse);
      pulse.x = cx - 22;
      pulse.y = cy - 22;
    } else {
      const cluster = await markerCluster(t, z.colorToken, z.count);
      m.appendChild(cluster);
      cluster.x = cx - 21;
      cluster.y = cy - 21;
    }
    const lbl = await markerLabel(t, z.colorToken, z.name);
    m.appendChild(lbl);
    lbl.x = cx + 16;
    lbl.y = cy - lbl.height - 6;
  }
  const zoom = await zoomControl(t);
  m.appendChild(zoom);
  zoom.x = 14;
  zoom.y = 14;
  const attr = await mapAttribution(t);
  m.appendChild(attr);
  attr.x = w - attr.width - 8;
  attr.y = h - attr.height - 8;
  return m;
}

async function zonesCanvas(t: ThemeContext): Promise<FrameNode> {
  const c = canvas(t);
  const col = autoFrame({ direction: "VERTICAL", gap: 16 });
  col.appendChild(await zonesMap(t, CANVAS_INNER, 420));
  col.appendChild(
    await chipRow(
      t,
      CV_ZONES.map((z) => ({ label: `${z.name} · ${z.count}`, variant: "Solid" as ChipVariant })),
      CANVAS_INNER,
    ),
  );
  col.appendChild(
    await makeText(
      t,
      "caption",
      "Circles = geofences. Stand inside one and the download unlocks.",
      "text/muted",
      { maxWidth: CANVAS_INNER },
    ),
  );
  c.appendChild(col);
  return c;
}

/** The same zones as a list — reuses the Location card from the map board. */
async function zonesList(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t);
  const list = autoFrame({ direction: "VERTICAL", gap: 14 });
  list.resize(CANVAS_INNER, list.height);
  list.counterAxisSizingMode = "FIXED";
  for (const z of CV_ZONES) {
    list.appendChild(
      await locationCard(t, {
        name: `${z.name} — ${z.sub[0]}`,
        city: z.sub[1],
        note: [
          `${z.count} pin(s) · radius 50 m · ${z.live ? "you are here" : "walk over to unlock"}`,
          `${z.count} ()`,
        ].join("\n"),
        colorToken: z.colorToken,
        unlocked: !!z.live,
      }),
    );
  }
  wrap.appendChild(list);
  return wrap;
}

// ── Step 2 · pick a track ─────────────────────────────────────
async function trackPopups(t: ThemeContext): Promise<FrameNode> {
  const W = 268;
  const tiles: Array<{ label: Bi; node: SceneNode }> = [];

  tiles.push({
    label: ["Entry popup", ""],
    node: await popupWrap(
      t,
      [
        await makeText(t, "label/md", "Download my CV", "text/primary"),
        await makeText(t, "body/sm", "Two ways to get it — pick one.", "text/muted", {
          maxWidth: W - 32,
        }),
        await popBtn(t, "Tell your story", "sparkles", "Primary"),
        await popBtn(t, "I'm here — ask Oleksii", "crosshair", "Outline"),
      ],
      W,
    ),
  });

  tiles.push({
    label: ["Track A · Story", "A"],
    node: await popupWrap(
      t,
      [
        await makeText(t, "label/md", "Tell your story", "text/primary"),
        await popRow(t, "user", "Who you are"),
        await popRow(t, "sparkles", "Your idea"),
        await popRow(t, "layers", "The project"),
        await popBtn(t, "Open the form", "arrow-right", "Primary"),
      ],
      W,
    ),
  });

  tiles.push({
    label: ["Track B · In range", "B"],
    node: await popupWrap(
      t,
      [
        await makeText(t, "label/md", "You're in range", "text/primary"),
        await statusPill(t, "12 m from the pin", "feedback/success"),
        await makeText(
          t,
          "body/sm",
          "One tap sends a request. I approve or decline.",
          "text/muted",
          { maxWidth: W - 32 },
        ),
        await popBtn(t, "Request CV", "navigation", "Primary"),
      ],
      W,
    ),
  });

  tiles.push({
    label: ["Out of range", ""],
    node: await popupWrap(
      t,
      [
        await popRow(t, "lock", "Out of range", "text/primary"),
        await makeText(
          t,
          "body/sm",
          "Come within 50 m, or use the story form instead.",
          "text/muted",
          { maxWidth: W - 32 },
        ),
        await popBtn(t, "Request CV", "navigation", "Disabled"),
        await popBtn(t, "Tell your story", "sparkles", "Outline"),
      ],
      W,
    ),
  });

  return tileGrid(t, tiles, W + 28);
}

async function trackSwitch(t: ThemeContext): Promise<FrameNode> {
  const c = canvas(t);
  const col = autoFrame({ direction: "VERTICAL", gap: 14 });
  col.appendChild(
    await drawSegmented(t, [
      { icon: "sparkles", label: "Story form", active: true },
      { icon: "crosshair", label: "In-range tap" },
    ]),
  );
  col.appendChild(
    await makeText(
      t,
      "caption",
      "Both tracks end at the same gate: terms accepted → consent anchored → CV released.",
      "text/muted",
      { maxWidth: CANVAS_INNER },
    ),
  );
  c.appendChild(col);
  return c;
}

// ── Step 3A · the story form ──────────────────────────────────
async function cvForm(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t);
  const cardW = CANVAS_INNER;
  const inner = cardW - 48;
  const half = Math.floor((inner - 16) / 2);
  const third = Math.floor((inner - 32) / 3);

  const card = autoFrame({ direction: "VERTICAL", gap: 20, padding: 24 });
  card.resize(cardW, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);

  // header — icon + title + step badge
  const head = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "MIN" });
  head.layoutAlign = "STRETCH";
  head.appendChild(
    severityIcon(t, { icon: "file", tone: "accent/primary", shape: "rounded", size: "md" }),
  );
  const hcol = autoFrame({ direction: "VERTICAL", gap: 3 });
  hcol.layoutGrow = 1;
  hcol.appendChild(
    await makeText(
      t,
      "heading/h4",
      "Tell me about you, your idea and the project",
      "text/primary",
      { maxWidth: inner - 190 },
    ),
  );
  hcol.appendChild(
    await makeText(
      t,
      "body/sm",
      "The CV is issued to you personally — this is what gets attached to it.",
      "text/secondary",
      { maxWidth: inner - 190 },
    ),
  );
  head.appendChild(hcol);
  head.appendChild(await drawBadge(t, { label: "Step 3A", neutral: true }));
  card.appendChild(head);

  // progress
  const prog = autoFrame({ direction: "VERTICAL", gap: 7 });
  prog.layoutAlign = "STRETCH";
  prog.appendChild(drawProgressLinear(t, 0.6, false, inner));
  const pRow = autoFrame({ direction: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER" });
  pRow.resize(inner, pRow.height);
  pRow.primaryAxisSizingMode = "FIXED";
  pRow.counterAxisSizingMode = "AUTO";
  pRow.appendChild(await makeText(t, "caption", "3 of 5 sections", "text/muted"));
  pRow.appendChild(await makeText(t, "caption", "~2 min", "text/muted"));
  prog.appendChild(pRow);
  card.appendChild(prog);

  const row = (gap = 16): FrameNode => {
    const r = autoFrame({ direction: "HORIZONTAL", gap, cross: "MIN" });
    r.resize(inner, r.height);
    r.primaryAxisSizingMode = "FIXED";
    r.counterAxisSizingMode = "AUTO";
    return r;
  };

  // who you are
  card.appendChild(await overline(t, "About you"));
  const r1 = row();
  r1.appendChild(
    await drawTextField(t, "Filled", "md", false, {
      label: "Full name",
      value: "Anna Weber",
      placeholder: "Jane Doe",
      helper: null,
      width: third,
    }),
  );
  r1.appendChild(
    await drawTextField(t, "Filled", "md", false, {
      label: "Email",
      value: "anna@studio.de",
      helper: "The CV link goes here",
      width: third,
    }),
  );
  r1.appendChild(await selectTrigger(t, { label: "Role", value: "Founder / CTO", width: third }));
  card.appendChild(r1);

  const r2 = row();
  r2.appendChild(
    await drawTextField(t, "Filled", "md", false, {
      label: "Company",
      value: "Nordlicht Studio",
      helper: null,
      width: third,
    }),
  );
  r2.appendChild(
    await drawTextField(t, "Filled", "md", false, {
      label: "Website / LinkedIn",
      value: "nordlicht.studio",
      helper: null,
      width: third,
    }),
  );
  r2.appendChild(
    await selectTrigger(t, {
      label: "Zone you're in",
      value: "Berlin · Museumsinsel",
      width: third,
    }),
  );
  card.appendChild(r2);

  // the idea & the project
  card.appendChild(await overline(t, "Your idea & project"));
  const r3 = row();
  r3.appendChild(
    await drawTextArea(t, "Filled", "md", {
      label: "Your idea",
      value:
        "A geofenced hiring layer: candidates unlock a CV only at a real place, so first contact always starts offline.",
      hint: "What are you trying to build?",
      count: "138 / 600",
      width: half,
      height: 118,
    }),
  );
  r3.appendChild(
    await drawTextArea(t, "Default", "md", {
      label: "The project",
      placeholder: "Stage, team, timeline, what you'd need me for…",
      hint: "Stage · team · timeline",
      count: "0 / 600",
      width: half,
      height: 118,
    }),
  );
  card.appendChild(r3);

  const r4 = row();
  r4.appendChild(
    await chipField(
      t,
      "Stack / tags",
      [{ label: "Design systems" }, { label: "Svelte" }, { label: "Motion" }],
      "Add a tag…",
      half,
    ),
  );
  r4.appendChild(
    await drawTextField(t, "Filled", "md", false, {
      label: "Where we'd meet",
      value: "Museumsinsel — 18:30",
      helper: "Optional",
      width: half,
    }),
  );
  card.appendChild(r4);

  // consent + actions
  card.appendChild(hairline(t, inner));
  const consent = autoFrame({ direction: "VERTICAL", gap: 10 });
  consent.layoutAlign = "STRETCH";
  consent.appendChild(await drawCheckboxLabel(t, "Checked", "I accept the Terms & Conditions"));
  consent.appendChild(
    await drawCheckboxLabel(
      t,
      "Checked",
      "Anchor my consent on-chain so the hand-off is verifiable",
    ),
  );
  consent.appendChild(
    await drawCheckboxLabel(t, "Unchecked", "Keep me posted about new projects (optional)"),
  );
  card.appendChild(consent);

  const actions = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  actions.resize(inner, actions.height);
  actions.primaryAxisSizingMode = "FIXED";
  actions.counterAxisSizingMode = "AUTO";
  const grow = rect(1, 1);
  grow.fills = [];
  grow.layoutGrow = 1;
  actions.appendChild(
    await drawChip(t, "Draft saved", { variant: "Solid", size: "sm", iconName: "check" }),
  );
  actions.appendChild(grow);
  actions.appendChild(await drawButton(t, "Ghost", "Default", "md", "pill", "Cancel"));
  actions.appendChild(await drawButton(t, "Primary", "Default", "md", "pill", "Send & get CV"));
  card.appendChild(actions);

  wrap.appendChild(card);
  return wrap;
}

/** Two stacked grids — narrow field tiles, then wider feedback tiles. */
async function stackedGrids(
  t: ThemeContext,
  groups: Array<{ tiles: Array<{ label: Bi; node: SceneNode }>; tileW: number }>,
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 16 });
  col.resize(CONTENT, col.height);
  col.counterAxisSizingMode = "FIXED";
  for (const g of groups) col.appendChild(await tileGrid(t, g.tiles, g.tileW));
  return col;
}

async function cvFormStates(t: ThemeContext): Promise<FrameNode> {
  const W = 320;
  return stackedGrids(t, [
    {
      tileW: W + 28,
      tiles: [
        {
          label: ["Empty", ""],
          node: await drawTextArea(t, "Default", "md", {
            label: "Your idea",
            placeholder: "What are you building?",
            hint: "Min 40 characters",
            count: "0 / 600",
            width: W,
            height: 88,
          }),
        },
        {
          label: ["Filled", ""],
          node: await drawTextArea(t, "Filled", "md", {
            label: "Your idea",
            value: "A geofenced hiring layer — CV unlocks only at a real place.",
            hint: "Looks good",
            count: "63 / 600",
            width: W,
            height: 88,
          }),
        },
        {
          label: ["Too short", ""],
          node: await drawTextArea(t, "Error", "md", {
            label: "Your idea",
            value: "Hi",
            errorHelper: "Tell me a bit more — min 40 characters",
            count: "2 / 600",
            width: W,
            height: 88,
          }),
        },
        {
          label: ["Email error", "e-mail"],
          node: await drawTextField(t, "Error", "md", false, {
            label: "Email",
            value: "anna@studio",
            errorHelper: "The CV link needs a valid email",
            width: W,
          }),
        },
      ],
    },
    {
      tileW: 468,
      tiles: [
        {
          label: ["Sending", ""],
          node: await drawButton(t, "Primary", "Focus", "md", "pill", "Sending…"),
        },
        {
          label: ["Sent", ""],
          node: await drawToast(t, "success", "Your story is on its way.", {
            desc: "I'll approve or decline within a day.",
            closable: true,
          }),
        },
      ],
    },
  ]);
}

async function cvFlowBoard(t: ThemeContext): Promise<FrameNode> {
  const props: PropRow[] = [
    {
      prop: "zones",
      type: "Zone[]",
      def: "[]",
      note: ["Geofenced spots where the CV unlocks.", ", CV ."],
    },
    {
      prop: "Zone.radius",
      type: "number (m)",
      def: "50",
      note: ["How close you must stand.", ""],
    },
    {
      prop: "track",
      type: "'story' | 'inRange'",
      def: "story",
      note: ["Which path the visitor takes.", ""],
    },
    {
      prop: "step",
      type: "1…7",
      def: "1",
      note: ["Position in the flow (Stepper).", "(Stepper)."],
    },
    {
      prop: "form",
      type: "{ about, idea, project }",
      def: "—",
      note: ["Story payload attached to the CV.", ", CV."],
    },
    {
      prop: "onSubmit",
      type: "(form)=>Promise<Request>",
      def: "—",
      note: ["Creates an approval request.", ""],
    },
    {
      prop: "onLocate",
      type: "()=>Coords",
      def: "—",
      note: ["Browser geolocation for the tap track.", ""],
    },
  ];
  return componentBoard(
    t,
    "CV Request Flow",
    ["The process: find a zone → tell your story or tap in range", ""],
    ["A plain download button → just link the file", ""],
    [
      await block(t, "Process", await cvStepperCanvas(t)),
      await block(t, "Process detail", await cvStepperDetail(t)),
      await block(t, "Step 1", await zonesCanvas(t)),
      await block(t, "Step 1", await zonesList(t)),
      await block(t, "Step 2", await trackSwitch(t)),
      await block(t, "Step 2", await trackPopups(t)),
      await block(t, "Step 3A", await cvForm(t)),
      await block(t, "Form states", await cvFormStates(t)),
    ],
    props,
  );
}

// ── Steps 3B–5 · in-range tap, approval, terms ────────────────
async function inRangeCard(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t);
  const H = 260;
  const container = autoFrame({ direction: "HORIZONTAL", gap: 0, cross: "MIN" });
  container.resize(CANVAS_INNER, H);
  container.primaryAxisSizingMode = "FIXED";
  container.counterAxisSizingMode = "FIXED";
  container.cornerRadius = RADII.lg;
  container.clipsContent = true;
  strokeToken(t, container, "border/subtle", 1);

  const mapW = CANVAS_INNER - 360;
  const m = await mapBackdrop(t, mapW, H, { labels: false, chrome: false });
  const rd = 168;
  const ring = zoneRing("accent/primary", rd);
  m.appendChild(ring);
  ring.x = mapW * 0.5 - rd / 2;
  ring.y = H * 0.5 - rd / 2;
  const pin = mapPin(t, "accent/primary", { selected: true });
  m.appendChild(pin);
  pin.x = mapW * 0.5 - 13;
  pin.y = H * 0.5 - 34;
  const me = markerPulse(t, "accent/secondary");
  m.appendChild(me);
  me.x = mapW * 0.5 + 26;
  me.y = H * 0.5 + 8;
  container.appendChild(m);

  const panel = autoFrame({ direction: "VERTICAL", gap: 14, padding: 20 });
  panel.resize(360, H);
  panel.primaryAxisSizingMode = "FIXED";
  panel.counterAxisSizingMode = "FIXED";
  fillToken(t, panel, "bg/surface");
  panel.appendChild(await statusPill(t, "In range · 12 m", "feedback/success"));
  panel.appendChild(
    await makeText(t, "heading/h4", "Hyde Park — The Dell", "text/primary", { maxWidth: 320 }),
  );
  panel.appendChild(
    await makeText(
      t,
      "body/sm",
      "One tap sends a request with your location and timestamp only — nothing else.",
      "text/secondary",
      { maxWidth: 320 },
    ),
  );
  panel.appendChild(await popRow(t, "clock", "Zone open until 21:00"));
  panel.appendChild(await popRow(t, "users", "2 requests approved today"));
  const spacer = rect(1, 1);
  spacer.fills = [];
  spacer.layoutGrow = 1;
  panel.appendChild(spacer);
  panel.appendChild(await drawButton(t, "Primary", "Default", "md", "pill", "Request CV"));
  container.appendChild(panel);

  wrap.appendChild(container);
  return wrap;
}

/** Owner-side notification: who is asking, from where, with approve / decline. */
async function requestCard(
  t: ThemeContext,
  o: {
    name: string;
    zone: string;
    idea: string;
    ago: string;
    state: "pending" | "approved" | "declined";
  },
): Promise<FrameNode> {
  const c = autoFrame({ direction: "HORIZONTAL", gap: 14, padding: 16, cross: "MIN" });
  c.resize(CANVAS_INNER, c.height);
  c.primaryAxisSizingMode = "FIXED";
  c.counterAxisSizingMode = "AUTO";
  c.cornerRadius = RADII.lg;
  fillToken(t, c, "bg/surface");
  strokeToken(t, c, "border/subtle", 1);
  c.appendChild(await initialsAvatar(t, o.name, 36));

  const mid = autoFrame({ direction: "VERTICAL", gap: 5 });
  mid.layoutGrow = 1;
  const nameRow = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  nameRow.appendChild(await makeText(t, "label/md", o.name, "text/primary"));
  nameRow.appendChild(await drawBadge(t, { label: o.ago, neutral: true }));
  mid.appendChild(nameRow);
  mid.appendChild(await popRow(t, "map-pin", o.zone, "text/muted"));
  mid.appendChild(await makeText(t, "body/sm", o.idea, "text/secondary", { maxWidth: 520 }));
  c.appendChild(mid);

  const right = autoFrame({ direction: "VERTICAL", gap: 10, cross: "MAX" });
  if (o.state === "pending") {
    right.appendChild(await statusPill(t, "Waiting for you", "feedback/warning"));
    const btns = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
    btns.appendChild(await drawButton(t, "Secondary", "Default", "sm", "pill", "Decline"));
    btns.appendChild(await drawButton(t, "Primary", "Default", "sm", "pill", "Approve"));
    right.appendChild(btns);
  } else if (o.state === "approved") {
    right.appendChild(await statusPill(t, "Approved", "feedback/success"));
    right.appendChild(
      await drawChip(t, "CV v3.2 released", { variant: "Accent", size: "sm", iconName: "check" }),
    );
  } else {
    right.appendChild(await statusPill(t, "Declined", "feedback/danger"));
    right.appendChild(
      await drawChip(t, "No data stored", { variant: "Outline", size: "sm", iconName: "trash" }),
    );
  }
  c.appendChild(right);
  return c;
}

async function inbox(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t);
  const list = autoFrame({ direction: "VERTICAL", gap: 14 });
  list.resize(CANVAS_INNER, list.height);
  list.counterAxisSizingMode = "FIXED";
  list.appendChild(
    await requestCard(t, {
      name: "Anna Weber",
      zone: "Berlin · Museumsinsel",
      idea: "Geofenced hiring layer — wants a design-system lead for a 6-month build.",
      ago: "2 min",
      state: "pending",
    }),
  );
  list.appendChild(
    await requestCard(t, {
      name: "Tom Fischer",
      zone: "Frankfurt · Bankenviertel",
      idea: "Tapped in range at 18:12 — no story attached.",
      ago: "1 h",
      state: "approved",
    }),
  );
  list.appendChild(
    await requestCard(t, {
      name: "Unknown visitor",
      zone: "München · Isarvorstadt",
      idea: "Empty form, no idea described, VPN location mismatch.",
      ago: "yesterday",
      state: "declined",
    }),
  );
  wrap.appendChild(list);
  return wrap;
}

/** Nothing waiting — the Empty state component, in the inbox's shoes. */
async function inboxEmpty(t: ThemeContext): Promise<FrameNode> {
  const c = canvas(t);
  c.counterAxisAlignItems = "CENTER";
  c.appendChild(
    await drawEmptyState(t, {
      icon: "map-pin",
      tone: "accent/primary",
      title: "No one is in a zone right now",
      body: "Requests show up here the moment someone taps inside a download zone.",
      secondary: "Zone settings",
      primary: "Share a zone",
      w: 420,
      cosmic: true,
    }),
  );
  return c;
}

async function visitorStates(t: ThemeContext): Promise<FrameNode> {
  const W = 268;
  const popups: Array<{ label: Bi; node: SceneNode }> = [
    {
      label: ["Pending", ""],
      node: await popupWrap(
        t,
        [
          await makeText(t, "label/md", "Request sent", "text/primary"),
          await statusPill(t, "Waiting for approval", "feedback/warning"),
          await makeText(t, "body/sm", "Oleksii gets a ping. Usually within a day.", "text/muted", {
            maxWidth: W - 32,
          }),
          drawProgressLinear(t, 0.4, true, W - 32),
        ],
        W,
      ),
    },
    {
      label: ["Approved", ""],
      node: await popupWrap(
        t,
        [
          await makeText(t, "label/md", "Approved 🎉", "text/primary"),
          await statusPill(t, "Approved · 14:02", "feedback/success"),
          await makeText(t, "body/sm", "Accept the terms and the CV is yours.", "text/muted", {
            maxWidth: W - 32,
          }),
          await popBtn(t, "Accept terms", "arrow-right", "Primary"),
        ],
        W,
      ),
    },
    {
      label: ["Declined", ""],
      node: await popupWrap(
        t,
        [
          await makeText(t, "label/md", "Not this time", "text/primary"),
          await statusPill(t, "Declined", "feedback/danger"),
          await makeText(
            t,
            "body/sm",
            "Your data was deleted. You can try again with more context.",
            "text/muted",
            { maxWidth: W - 32 },
          ),
          await popBtn(t, "Tell your story", "sparkles", "Outline"),
        ],
        W,
      ),
    },
  ];
  const toasts: Array<{ label: Bi; node: SceneNode }> = [
    {
      label: ["Toast · approved", ""],
      node: await drawToast(t, "success", "Oleksii approved your request.", {
        action: "Open",
        closable: true,
      }),
    },
    {
      label: ["Toast · declined", ""],
      node: await drawToast(t, "danger", "Request declined — data deleted.", { closable: true }),
    },
  ];
  return stackedGrids(t, [
    { tiles: popups, tileW: W + 28 },
    { tiles: toasts, tileW: 468 },
  ]);
}

/** Step 5 — the terms gate: no accepted terms, no CV. */
async function termsGate(t: ThemeContext, accepted: boolean): Promise<FrameNode> {
  const cardW = 456;
  const card = autoFrame({ direction: "VERTICAL", gap: 14, padding: 20 });
  card.resize(cardW, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.lg;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, accepted ? "accent/primary" : "border/subtle", 1);
  const head = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  head.layoutAlign = "STRETCH";
  head.appendChild(
    severityIcon(t, {
      icon: accepted ? "check" : "lock",
      tone: accepted ? "feedback/success" : "text/muted",
      shape: "rounded",
      size: "sm",
    }),
  );
  head.appendChild(
    await makeText(
      t,
      "label/md",
      accepted ? "Terms accepted" : "Terms & Conditions",
      "text/primary",
    ),
  );
  card.appendChild(head);
  card.appendChild(
    await drawCheckboxLabel(
      t,
      accepted ? "Checked" : "Unchecked",
      "I accept the Terms & Conditions",
    ),
  );
  card.appendChild(
    await drawCheckboxLabel(
      t,
      accepted ? "Checked" : "Unchecked",
      "I agree my consent is anchored on-chain",
    ),
  );
  card.appendChild(
    await makeText(
      t,
      "caption",
      "The CV is for your own review. No reposting, no scraping, no feeding it to a model.",
      "text/muted",
      { maxWidth: cardW - 40 },
    ),
  );
  const btn = await drawButton(
    t,
    accepted ? "Primary" : "Secondary",
    "Default",
    "md",
    "pill",
    accepted ? "Download CV" : "Accept to unlock",
  );
  if (!accepted) btn.opacity = 0.5;
  card.appendChild(btn);
  return card;
}

async function termsCanvas(t: ThemeContext): Promise<FrameNode> {
  const c = canvas(t);
  const row = autoFrame({ direction: "HORIZONTAL", gap: 24, cross: "MIN" });
  row.appendChild(await termsGate(t, false));
  row.appendChild(await termsGate(t, true));
  c.appendChild(row);
  return c;
}

async function privacyPlaceholder(t: ThemeContext): Promise<FrameNode> {
  const c = canvas(t);
  const col = autoFrame({ direction: "VERTICAL", gap: 14 });
  col.appendChild(
    await drawAlert(
      t,
      "Info",
      "Privacy Policy — to be written",
      "Placeholder for now: what is collected (name, email, story, coordinates, timestamp), why, how long it is kept, and how to have it deleted.",
      "soft",
      CANVAS_INNER,
    ),
  );
  const links = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  links.appendChild(
    await drawChip(t, "Terms & Conditions", { variant: "Outline", size: "sm", iconName: "file" }),
  );
  links.appendChild(
    await drawChip(t, "Privacy Policy · TBD", {
      variant: "Solid",
      size: "sm",
      iconName: "alert-triangle",
    }),
  );
  links.appendChild(
    await drawChip(t, "Delete my data", { variant: "Outline", size: "sm", iconName: "trash" }),
  );
  col.appendChild(links);
  c.appendChild(col);
  return c;
}

async function cvApprovalBoard(t: ThemeContext): Promise<FrameNode> {
  const approveDialog = canvas(t);
  approveDialog.appendChild(
    await drawDialog(t, {
      icon: "check",
      tone: "feedback/success",
      title: "Approve Anna's request?",
      body: "She's standing at Museumsinsel and described a 6-month design-system build. Approving releases CV v3.2 and writes the consent record on-chain.",
      cancel: "Decline",
      confirm: "Approve",
    }),
  );

  const props: PropRow[] = [
    {
      prop: "request",
      type: "{ who, zone, story?, coords }",
      def: "—",
      note: ["What lands in my inbox.", ""],
    },
    {
      prop: "status",
      type: "pending | approved | declined",
      def: "pending",
      note: ["Owner's decision.", ""],
    },
    {
      prop: "onApprove / onDecline",
      type: "(id)=>void",
      def: "—",
      note: ["Releases or deletes the request.", "CV ."],
    },
    {
      prop: "termsAccepted",
      type: "boolean",
      def: "false",
      note: ["Hard gate before download.", ""],
    },
    {
      prop: "termsVersion",
      type: "string",
      def: "'2026-07'",
      note: ["Version stored with the consent.", ""],
    },
    {
      prop: "privacyPolicy",
      type: "ReactNode",
      def: "TBD",
      note: ["Placeholder — copy comes later.", ""],
    },
    {
      prop: "expiresIn",
      type: "hours",
      def: "48",
      note: ["Approval window before it lapses.", ""],
    },
  ];
  return componentBoard(
    t,
    "CV Approval & Terms",
    ["Tap in range → I approve → terms accepted → unlock", ""],
    ["Instant public download → skip the whole gate", ""],
    [
      await block(t, "Step 3B", await inRangeCard(t)),
      await block(t, "Step 4", await inbox(t)),
      await block(t, "Step 4", await inboxEmpty(t)),
      await block(t, "Step 4", approveDialog),
      await block(t, "Step 4", await visitorStates(t)),
      await block(t, "Step 5", await termsCanvas(t)),
      await block(t, "Privacy Policy (TBD)", await privacyPlaceholder(t)),
    ],
    props,
  );
}

// ── Steps 6–7 · consent anchored on a cheap L2, then download ──
interface LedgerRow {
  time: string;
  event: Bi;
  actor: string;
  tx: string;
  state: Bi;
  tone: string;
}

async function ledgerTable(t: ThemeContext, rows: LedgerRow[]): Promise<FrameNode> {
  const wrap = canvas(t);
  const table = autoFrame({ direction: "VERTICAL", gap: 0 });
  table.resize(CANVAS_INNER, table.height);
  table.counterAxisSizingMode = "FIXED";
  const wTime = 96;
  const wEvent = 300;
  const wActor = 170;
  const wTx = 180;
  const gap = 16;
  const wState = CANVAS_INNER - wTime - wEvent - wActor - wTx - gap * 4;

  const head = autoFrame({ direction: "HORIZONTAL", gap });
  head.paddingBottom = 8;
  for (const [label, w] of [
    ["Time", wTime],
    ["Event", wEvent],
    ["Actor", wActor],
    ["Tx", wTx],
    ["State", wState],
  ] as Array<[string, number]>) {
    const c = fixedCol(w);
    c.appendChild(await makeText(t, "label/sm", label, "text/primary"));
    head.appendChild(c);
  }
  table.appendChild(head);
  table.appendChild(hairline(t, CANVAS_INNER));

  for (const r of rows) {
    const line = autoFrame({ direction: "HORIZONTAL", gap, cross: "MIN" });
    line.paddingTop = 10;
    line.paddingBottom = 10;
    const tc = fixedCol(wTime);
    tc.appendChild(await makeText(t, "mono/sm", r.time, "text/muted"));
    const ec = fixedCol(wEvent);
    ec.appendChild(await makeText(t, "body/sm", r.event[0], "text/primary", { maxWidth: wEvent }));
    ec.appendChild(await makeText(t, "caption", r.event[1], "text/muted", { maxWidth: wEvent }));
    const ac = fixedCol(wActor);
    ac.appendChild(await makeText(t, "body/sm", r.actor, "text/secondary", { maxWidth: wActor }));
    const xc = fixedCol(wTx);
    xc.appendChild(await makeText(t, "mono/sm", r.tx, "accent/primary", { maxWidth: wTx }));
    const sc = fixedCol(wState);
    sc.appendChild(await statusPill(t, r.state[0], r.tone));
    line.appendChild(tc);
    line.appendChild(ec);
    line.appendChild(ac);
    line.appendChild(xc);
    line.appendChild(sc);
    table.appendChild(line);
    table.appendChild(hairline(t, CANVAS_INNER));
  }
  wrap.appendChild(table);
  return wrap;
}

async function chainPicker(t: ThemeContext): Promise<FrameNode> {
  const c = canvas(t);
  const col = autoFrame({ direction: "VERTICAL", gap: 14 });
  col.appendChild(
    await drawSegmented(t, [
      { icon: "layers", label: "Base", active: true },
      { icon: "layers", label: "Polygon PoS" },
      { icon: "layers", label: "Solana" },
    ]),
  );
  col.appendChild(
    await chipRow(
      t,
      [
        { label: "~$0.001 per write", iconName: "check", variant: "Solid" },
        { label: "Consent hash only", iconName: "lock", variant: "Solid" },
        { label: "No personal data on-chain", iconName: "lock", variant: "Outline" },
      ],
      CANVAS_INNER,
    ),
  );
  col.appendChild(
    await makeText(
      t,
      "caption",
      "Only a hash of the consent + CV version goes on-chain; the story itself stays in my inbox.",
      "text/muted",
      { maxWidth: CANVAS_INNER },
    ),
  );
  c.appendChild(col);
  return c;
}

async function receiptCard(t: ThemeContext): Promise<FrameNode> {
  const wrap = canvas(t);
  const cardW = 520;
  const card = autoFrame({ direction: "VERTICAL", gap: 14, padding: 20 });
  card.resize(cardW, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.lg;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  await applyEffect(card, "shadow/lg", t);

  const head = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  head.layoutAlign = "STRETCH";
  head.appendChild(
    severityIcon(t, { icon: "layers", tone: "accent/secondary", shape: "rounded", size: "sm" }),
  );
  const hc = autoFrame({ direction: "VERTICAL", gap: 2 });
  hc.layoutGrow = 1;
  hc.appendChild(await makeText(t, "label/md", "Consent receipt", "text/primary"));
  hc.appendChild(await makeText(t, "caption", "Base · block 21 480 913", "text/muted"));
  head.appendChild(hc);
  head.appendChild(await statusPill(t, "Confirmed", "feedback/success"));
  card.appendChild(head);

  card.appendChild(
    await drawInputAction(t, "Filled", "sm", "Copy", {
      value: "0x7f3a…c91e",
      mono: true,
      valueW: 300,
    }),
  );
  card.appendChild(hairline(t, cardW - 40));
  card.appendChild(await popRow(t, "lock", "Consent hash · sha256(form + terms v2026-07)"));
  card.appendChild(await popRow(t, "file", "CV v3.2 · issued to anna@studio.de"));
  card.appendChild(await popRow(t, "map-pin", "Zone: Berlin · Museumsinsel"));
  card.appendChild(await popRow(t, "clock", "26 Jul 2026 · 14:02 UTC"));
  const acts = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  acts.appendChild(await drawButton(t, "Secondary", "Default", "sm", "pill", "View on explorer"));
  acts.appendChild(await drawButton(t, "Ghost", "Default", "sm", "pill", "Revoke consent"));
  card.appendChild(acts);
  wrap.appendChild(card);
  return wrap;
}

async function anchorStates(t: ThemeContext): Promise<FrameNode> {
  const W = 268;
  const pending = autoFrame({ direction: "VERTICAL", gap: 10 });
  const pendHead = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  pendHead.appendChild(drawSpinner(t, "comet", "sm", "feedback/warning"));
  pendHead.appendChild(await statusPill(t, "Confirming 2 / 12", "feedback/warning"));
  pending.appendChild(pendHead);
  pending.appendChild(drawProgressLinear(t, 0.17, false, W));
  pending.appendChild(await makeText(t, "caption", "~8 s on Base", "text/muted"));

  const confirmed = autoFrame({ direction: "VERTICAL", gap: 10 });
  confirmed.appendChild(await statusPill(t, "Confirmed · 12 / 12", "feedback/success"));
  confirmed.appendChild(drawProgressLinear(t, 1, false, W));
  confirmed.appendChild(await makeText(t, "mono/sm", "0x7f3a…c91e", "accent/primary"));

  const failed = autoFrame({ direction: "VERTICAL", gap: 10 });
  failed.appendChild(await statusPill(t, "Failed — retried off-chain", "feedback/danger"));
  failed.appendChild(
    await makeText(t, "caption", "The CV still ships; the receipt is queued.", "text/muted", {
      maxWidth: W,
    }),
  );
  failed.appendChild(await drawButton(t, "Secondary", "Default", "sm", "pill", "Retry anchor"));

  return tileGrid(
    t,
    [
      { label: ["Anchoring", ""], node: pending },
      { label: ["Confirmed", ""], node: confirmed },
      { label: ["Failed", ""], node: failed },
      {
        label: ["Skipped (opt-out)", ""],
        node: await drawAlert(
          t,
          "Info",
          "Anchoring off",
          "The visitor opted out — the hand-off is logged locally only.",
          "outline",
          W,
        ),
      },
    ],
    W + 28,
  );
}

async function unlockedCanvas(t: ThemeContext): Promise<FrameNode> {
  const W = 300;
  return stackedGrids(t, [
    {
      tileW: W + 28,
      tiles: [
        {
          label: ["Unlocked popup", ""],
          node: await popupWrap(
            t,
            [
              await makeText(t, "label/md", "CV unlocked", "text/primary"),
              await statusPill(t, "Verified hand-off", "feedback/success"),
              await popRow(t, "file", "CV_v3.2.pdf · 1.8 MB"),
              await popRow(t, "layers", "Receipt 0x7f3a…c91e"),
              await popBtn(t, "Download CV", "download", "Primary"),
              await popBtn(t, "Verify receipt", "external-link", "Outline"),
            ],
            W,
          ),
        },
        {
          label: ["Version badge", ""],
          node: await drawChip(t, "CV v3.2 · 26 Jul 2026", {
            variant: "Accent",
            size: "sm",
            iconName: "check",
          }),
        },
        {
          label: ["Expired link", ""],
          node: await drawAlert(
            t,
            "Warning",
            "Link expired",
            "Download links live for 48 h. Ask again — approval is remembered.",
            "soft",
            W,
          ),
        },
      ],
    },
    {
      tileW: 468,
      tiles: [
        {
          label: ["Success toast", ""],
          node: await drawToast(t, "success", "CV downloaded — receipt anchored.", {
            action: "Verify",
            closable: true,
          }),
        },
      ],
    },
  ]);
}

async function cvChainBoard(t: ThemeContext): Promise<FrameNode> {
  const rows: LedgerRow[] = [
    {
      time: "14:02:11",
      event: ["Consent anchored", ""],
      actor: "anna@studio.de",
      tx: "0x7f3a…c91e",
      state: ["Confirmed", ""],
      tone: "feedback/success",
    },
    {
      time: "14:02:04",
      event: ["Terms accepted · v2026-07", ""],
      actor: "anna@studio.de",
      tx: "off-chain",
      state: ["Stored", ""],
      tone: "accent/primary",
    },
    {
      time: "14:01:47",
      event: ["Request approved", ""],
      actor: "oleksii (owner)",
      tx: "0x91b2…40af",
      state: ["Confirmed", ""],
      tone: "feedback/success",
    },
    {
      time: "13:58:02",
      event: ["Request created in zone Berlin", ""],
      actor: "anna@studio.de",
      tx: "queued",
      state: ["Pending", ""],
      tone: "feedback/warning",
    },
    {
      time: "yesterday",
      event: ["Request declined · data deleted", ""],
      actor: "oleksii (owner)",
      tx: "—",
      state: ["Deleted", ""],
      tone: "feedback/danger",
    },
  ];
  const props: PropRow[] = [
    {
      prop: "chain",
      type: "'base' | 'polygon' | 'solana'",
      def: "base",
      note: ["Cheap L2 — cents per write.", "L2 — ."],
    },
    {
      prop: "anchor",
      type: "(consentHash)=>Promise<Tx>",
      def: "—",
      note: ["Writes the hash, returns the tx.", ""],
    },
    {
      prop: "consentHash",
      type: "sha256",
      def: "—",
      note: ["Form + terms version, hashed.", ""],
    },
    {
      prop: "onChainData",
      type: "hash | version | timestamp",
      def: "—",
      note: ["No personal data ever on-chain.", ""],
    },
    {
      prop: "confirmations",
      type: "number",
      def: "12",
      note: ["Before the receipt reads Confirmed.", ""],
    },
    {
      prop: "receiptUrl",
      type: "string",
      def: "—",
      note: ["Explorer link the visitor can verify.", ""],
    },
    {
      prop: "onRevoke",
      type: "(txId)=>void",
      def: "—",
      note: ["Revokes consent, deletes the story.", ""],
    },
    {
      prop: "fallback",
      type: "'local' | 'retry'",
      def: "retry",
      note: ["If the chain is down the CV still ships.", "— CV ."],
    },
  ];
  return componentBoard(
    t,
    "Consent Ledger (on-chain)",
    ["Verifiable hand-off: hash the consent, anchor it, release the CV", ": → → CV"],
    ["Storing the story itself on-chain — never", ""],
    [
      await block(t, "Step 6", await chainPicker(t)),
      await block(t, "Step 6", await receiptCard(t)),
      await block(t, "Step 6", await anchorStates(t)),
      await block(t, "Ledger", await ledgerTable(t, rows)),
      await block(t, "Step 7", await unlockedCanvas(t)),
    ],
    props,
  );
}

// ── Context Menu (bits-ui style) ──────────────────────────────
interface MItem {
  icon?: string;
  label?: string;
  keys?: string[];
  hi?: boolean; // highlighted / active
  danger?: boolean; // destructive
  tone?: string; // custom accent (e.g. dante)
  sub?: boolean; // submenu trigger (chevron)
  check?: boolean; // checkbox item
  checked?: boolean;
  disabled?: boolean;
  sep?: boolean; // separator
  group?: string; // group label
}

async function ctxItem(t: ThemeContext, it: MItem, itemW: number): Promise<FrameNode> {
  if (it.sep) {
    const wrap = autoFrame({ direction: "VERTICAL", gap: 0, padding: [5, 4] });
    wrap.resize(itemW, wrap.height);
    wrap.counterAxisSizingMode = "FIXED";
    wrap.appendChild(hairline(t, itemW - 8));
    return wrap;
  }
  if (it.group) {
    const g = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", padding: [7, 10] });
    g.appendChild(await makeText(t, "overline", it.group, "text/muted"));
    return g;
  }
  const row = autoFrame({
    direction: "HORIZONTAL",
    cross: "CENTER",
    align: "MIN",
    padding: [8, 10],
  });
  row.resize(itemW, row.height);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.cornerRadius = RADII.md;
  if (it.hi) row.fills = [{ ...solid("#FFFFFF"), opacity: 0.06 } as SolidPaint];
  const tone = it.tone ?? (it.danger ? "feedback/danger" : "text/primary");
  const iconTone = it.tone ?? (it.danger ? "feedback/danger" : "text/secondary");

  // left group grows to fill, pushing the shortcut/chevron to the far right
  const left = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  left.layoutGrow = 1;
  left.counterAxisAlignItems = "CENTER";
  if (it.check) {
    if (it.checked) left.appendChild(icon(t, "check", 16, "accent/primary"));
    else {
      const sp = rect(16, 16);
      sp.fills = [];
      left.appendChild(sp);
    }
  } else if (it.icon) {
    left.appendChild(icon(t, it.icon, 16, iconTone));
  }
  left.appendChild(await makeText(t, "body/sm", it.label ?? "", tone));
  row.appendChild(left);

  if (it.keys) row.appendChild(await makeText(t, "mono/sm", it.keys.join(""), "text/muted"));
  else if (it.sub) row.appendChild(icon(t, "chevron-right", 16, "text/muted"));

  if (it.disabled) row.opacity = 0.4;
  return row;
}

async function ctxMenu(t: ThemeContext, items: MItem[], width: number): Promise<FrameNode> {
  const menu = autoFrame({ direction: "VERTICAL", gap: 1, padding: 6 });
  menu.resize(width, menu.height);
  menu.counterAxisSizingMode = "FIXED";
  menu.cornerRadius = RADII.lg;
  fillToken(t, menu, "bg/surface-raised");
  strokeToken(t, menu, "border/subtle", 1);
  await applyEffect(menu, "shadow/lg", t);
  for (const it of items) menu.appendChild(await ctxItem(t, it, width - 12));
  return menu;
}

async function ctxScene(t: ThemeContext): Promise<FrameNode> {
  const stage = figma.createFrame();
  stage.name = "context-menu-scene";
  stage.fills = [];
  stage.resize(CANVAS_INNER, 600);
  stage.clipsContent = false;

  // dashed "right click me" trigger
  const trig = figma.createFrame();
  trig.name = "trigger";
  trig.resize(430, 250);
  trig.fills = [];
  trig.cornerRadius = RADII.lg;
  strokeToken(t, trig, "border/strong", 1.5);
  trig.dashPattern = [6, 7];
  const tc = autoFrame({ direction: "VERTICAL", gap: 14, align: "CENTER", cross: "CENTER" });
  tc.resize(430, 250);
  tc.primaryAxisSizingMode = "FIXED";
  tc.counterAxisSizingMode = "FIXED";
  tc.appendChild(icon(t, "mouse", 30, "text/muted"));
  tc.appendChild(await makeText(t, "body/md", "Right click me", "text/muted"));
  trig.appendChild(tc);
  stage.appendChild(trig);
  trig.x = 30;
  trig.y = 40;

  const menu = await ctxMenu(
    t,
    [
      { icon: "pencil", label: "Edit" },
      { icon: "plus-circle", label: "Add" },
      { icon: "copy", label: "Duplicate" },
      { icon: "file", label: "Insert", sub: true, hi: true }, // submenu trigger — highlighted while open
      { sep: true },
      { icon: "trash", label: "Delete", danger: true },
    ],
    300,
  );
  stage.appendChild(menu);
  menu.x = 300;
  menu.y = 250;

  const sub = await ctxMenu(
    t,
    [
      { group: "Insert block" },
      { label: "Header" },
      { label: "Paragraph" },
      { label: "Codeblock" },
      { label: "List" },
      { label: "Task" },
    ],
    240,
  );
  stage.appendChild(sub);
  // submenu opens from the Insert (chevron) row — align its top to that row
  const insertRow = menu.children[3] as FrameNode;
  sub.x = menu.x + 306;
  sub.y = menu.y + insertRow.y - 6;

  return stage;
}

async function contextMenuBoard(t: ThemeContext): Promise<FrameNode> {
  const sceneCanvas = canvas(t);
  sceneCanvas.appendChild(await ctxScene(t));

  const spec = await ctxMenu(
    t,
    [
      { group: "Actions" },
      { icon: "pencil", label: "Edit" },
      { icon: "plus-circle", label: "Add", hi: true },
      { check: true, checked: true, label: "Show grid" },
      { icon: "copy", label: "Duplicate", disabled: true },
      { icon: "file", label: "Insert…", sub: true },
      { icon: "sparkles", label: "Boost", tone: "accent/dante", keys: ["⌘", "B"] },
      { sep: true },
      { icon: "trash", label: "Delete", danger: true },
    ],
    320,
  );
  const itemsCanvas = canvas(t);
  const center = autoFrame({ direction: "HORIZONTAL", align: "CENTER" });
  center.resize(CANVAS_INNER, center.height);
  center.primaryAxisSizingMode = "FIXED";
  center.counterAxisSizingMode = "AUTO";
  center.appendChild(spec);
  itemsCanvas.appendChild(center);

  const props: PropRow[] = [
    {
      prop: "trigger",
      type: "ReactNode",
      def: "—",
      note: ["Element that opens the menu on right-click.", ""],
    },
    {
      prop: "items",
      type: "Item[]",
      def: "—",
      note: ["Actions, checkboxes, submenus, separators.", ""],
    },
    {
      prop: "Item.shortcut",
      type: "string[]",
      def: "—",
      note: ["Keyboard combo shown on the right.", ""],
    },
    {
      prop: "CheckboxItem",
      type: "{ checked }",
      def: "false",
      note: ["Toggleable item with a check mark.", ""],
    },
    {
      prop: "SubMenu",
      type: "Item[]",
      def: "—",
      note: ["Nested menu opened by a chevron item.", ""],
    },
    {
      prop: "destructive",
      type: "boolean",
      def: "false",
      note: ["Danger styling (e.g. Delete).", "(. Delete)."],
    },
    {
      prop: "align / side",
      type: "start | center | end",
      def: "start",
      note: ["Placement around the cursor.", ""],
    },
  ];
  return componentBoard(
    t,
    "Context Menu",
    ["Contextual actions triggered by right-click", ""],
    ["A primary page action → use Button/Menu", "→ Button/Menu"],
    [await block(t, "In context", sceneCanvas), await block(t, "Items", itemsCanvas)],
    props,
  );
}

// ── Divider ───────────────────────────────────────────────────
async function dividerBoard(t: ThemeContext): Promise<FrameNode> {
  const hCanvas = canvas(t);
  const hcol = autoFrame({ direction: "VERTICAL", gap: 18 });
  hcol.resize(CANVAS_INNER, hcol.height);
  hcol.counterAxisSizingMode = "FIXED";
  hcol.appendChild(await makeText(t, "body/md", "Account", "text/secondary"));
  hcol.appendChild(hairline(t, CANVAS_INNER));
  hcol.appendChild(await makeText(t, "body/md", "Billing", "text/secondary"));
  // flat 1px lines (not hairline — its STRETCH would fatten it in a row)
  const hline = (): RectangleNode => {
    const r = rect(10, 1);
    fillToken(t, r, "border/subtle");
    r.layoutGrow = 1;
    return r;
  };
  const lab = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER" });
  lab.resize(CANVAS_INNER, lab.height);
  lab.primaryAxisSizingMode = "FIXED";
  lab.counterAxisSizingMode = "AUTO";
  lab.appendChild(hline());
  lab.appendChild(await makeText(t, "caption", "OR", "text/muted"));
  lab.appendChild(hline());
  hcol.appendChild(lab);
  hCanvas.appendChild(hcol);

  const vdiv = (h: number): RectangleNode => {
    const r = rect(1, h);
    fillToken(t, r, "border/subtle");
    return r;
  };
  const vCanvas = canvas(t);
  const vcol = autoFrame({ direction: "VERTICAL", gap: 26 });
  // inline nav separators
  const vrow = autoFrame({ direction: "HORIZONTAL", gap: 16, cross: "CENTER" });
  const items = ["Overview", "Activity", "Settings"];
  for (let i = 0; i < items.length; i++) {
    vrow.appendChild(await makeText(t, "body/md", items[i], "text/secondary"));
    if (i < items.length - 1) vrow.appendChild(vdiv(16));
  }
  vcol.appendChild(vrow);
  // taller vertical dividers between stat blocks
  const stats = autoFrame({ direction: "HORIZONTAL", gap: 26, cross: "CENTER" });
  const stat = async (val: string, lbl: string): Promise<FrameNode> => {
    const s = autoFrame({ direction: "VERTICAL", gap: 3 });
    s.appendChild(await makeText(t, "heading/h4", val, "text/primary"));
    s.appendChild(await makeText(t, "caption", lbl, "text/muted"));
    return s;
  };
  stats.appendChild(await stat("1,204", "Downloads"));
  stats.appendChild(vdiv(42));
  stats.appendChild(await stat("87", "Stars"));
  stats.appendChild(vdiv(42));
  stats.appendChild(await stat("12", "Forks"));
  vcol.appendChild(stats);
  vCanvas.appendChild(vcol);

  const props: PropRow[] = [
    {
      prop: "orientation",
      type: "horizontal | vertical",
      def: "horizontal",
      note: ["Line direction.", ""],
    },
    {
      prop: "inset",
      type: "boolean",
      def: "false",
      note: ["Indent to align with content.", ""],
    },
    {
      prop: "children",
      type: "ReactNode",
      def: "—",
      note: ["Optional centered label (e.g. OR).", "(. OR)."],
    },
    {
      prop: "flexItem",
      type: "boolean",
      def: "false",
      note: ["Stretch inside a flex row.", "flex-."],
    },
  ];
  return componentBoard(
    t,
    "Divider",
    ["Separate content groups & list items", ""],
    ["Faking spacing → use gap / margin", "→ gap"],
    [await block(t, "Horizontal", hCanvas), await block(t, "Vertical & labeled", vCanvas)],
    props,
  );
}

// ── Badge ─────────────────────────────────────────────────────
async function drawBadge(
  t: ThemeContext,
  o: { label?: string; dot?: boolean; tone?: string; neutral?: boolean },
): Promise<FrameNode> {
  const tone = o.tone ?? "accent/primary";
  if (o.dot) {
    const d = ellipse(8);
    fillToken(t, d, o.neutral ? "text/muted" : tone);
    d.strokes = [];
    return d as unknown as FrameNode;
  }
  const b = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [1, 5],
  });
  b.cornerRadius = RADII.full;
  if (o.neutral) {
    fillToken(t, b, "bg/surface-raised");
    strokeToken(t, b, "border/subtle", 1);
  } else fillToken(t, b, tone);
  b.appendChild(
    await makeText(t, "caption", o.label ?? "", o.neutral ? "text/secondary" : "accent/contrast"),
  );
  return b;
}

async function badgeOnIcon(
  t: ThemeContext,
  iconName: string,
  badge: FrameNode,
): Promise<FrameNode> {
  const f = figma.createFrame();
  f.resize(28, 28);
  f.fills = [];
  f.clipsContent = false;
  const ic = icon(t, iconName, 24, "text/secondary");
  f.appendChild(ic);
  ic.x = 2;
  ic.y = 2;
  // ring in the surface colour so the badge reads as floating above the icon
  badge.strokes = [boundSolid(colorVar(t, "bg/inset"))];
  badge.strokeWeight = 2;
  badge.strokeAlign = "OUTSIDE";
  f.appendChild(badge);
  badge.x = 28 - badge.width;
  badge.y = -2;
  return f;
}

async function badgeBoard(t: ThemeContext): Promise<FrameNode> {
  const tones: Array<[string, string, string]> = [
    ["Default", "", "neutral"],
    ["Accent", "", "accent/primary"],
    ["Dante", "", "accent/dante"],
    ["Success", "", "feedback/success"],
    ["Warning", "", "feedback/warning"],
    ["Danger", "", "feedback/danger"],
  ];
  const toneTiles: Array<{ label: Bi; node: SceneNode }> = [];
  for (const [en, ru, tk] of tones)
    toneTiles.push({
      label: [en, ru],
      node: await drawBadge(
        t,
        tk === "neutral" ? { label: "5", neutral: true } : { label: "5", tone: tk },
      ),
    });
  const el: Array<{ label: Bi; node: SceneNode }> = [
    {
      label: ["Count", ""],
      node: await badgeOnIcon(
        t,
        "bell",
        await drawBadge(t, { label: "3", tone: "feedback/danger" }),
      ),
    },
    {
      label: ["Overflow", ""],
      node: await badgeOnIcon(
        t,
        "bell",
        await drawBadge(t, { label: "99+", tone: "feedback/danger" }),
      ),
    },
    {
      label: ["Dot", ""],
      node: await badgeOnIcon(
        t,
        "mail",
        await drawBadge(t, { dot: true, tone: "feedback/success" }),
      ),
    },
    {
      label: ["Standalone", ""],
      node: await drawBadge(t, { label: "New", tone: "accent/primary" }),
    },
  ];
  const props: PropRow[] = [
    {
      prop: "content",
      type: "string | number",
      def: "—",
      note: ["Count or short text.", ""],
    },
    {
      prop: "variant",
      type: "standard | dot",
      def: "standard",
      note: ["Number pill or a status dot.", ""],
    },
    {
      prop: "color",
      type: "accent | dante | success | warning | danger",
      def: "accent",
      note: ["Semantic tone.", ""],
    },
    { prop: "max", type: "number", def: "99", note: ["Overflow → 99+.", ""] },
    {
      prop: "showZero",
      type: "boolean",
      def: "false",
      note: ["Render when count is 0.", ""],
    },
  ];
  return componentBoard(
    t,
    "Badge",
    ["Counts & status on icons / avatars", ""],
    ["Long text → use a Chip / Tag", "→ Chip / Tag"],
    [
      await block(t, "Tones", await tileGrid(t, toneTiles, 130)),
      await block(t, "On elements", await tileGrid(t, el, 150)),
    ],
    props,
  );
}

// ── Skeleton ──────────────────────────────────────────────────
function skelRect(t: ThemeContext, w: number, h: number, r = 6): RectangleNode {
  const s = rect(w, h, r);
  fillToken(t, s, "bg/surface-raised");
  return s;
}
function skelCircle(t: ThemeContext, d: number): EllipseNode {
  const e = ellipse(d);
  fillToken(t, e, "bg/surface-raised");
  e.strokes = [];
  return e;
}
// MUI text skeleton — height ≈ font, small radius
function skelText(t: ThemeContext, w: number, h = 13): RectangleNode {
  const s = rect(w, h, 4);
  fillToken(t, s, "bg/surface-raised");
  return s;
}
// MUI rectangular — sharp corners
function skelSharp(t: ThemeContext, w: number, h: number): RectangleNode {
  const s = rect(w, h, 0);
  fillToken(t, s, "bg/surface-raised");
  return s;
}
// MUI "wave" animation — a light gradient band sweeping across (shown frozen)
function skelWave(t: ThemeContext, w: number, h: number): FrameNode {
  const f = figma.createFrame();
  f.resize(w, h);
  f.cornerRadius = RADII.md;
  f.clipsContent = true;
  fillToken(t, f, "bg/surface-raised");
  const band = rect(Math.round(w * 0.55), h);
  band.fills = [
    linearGradient(
      [
        { hex: "#FFFFFF00", position: 0 },
        { hex: "#FFFFFF24", position: 0.5 },
        { hex: "#FFFFFF00", position: 1 },
      ],
      "horizontal",
    ),
  ];
  band.strokes = [];
  band.x = Math.round(w * 0.16);
  band.y = 0;
  f.appendChild(band);
  return f;
}

async function skeletonBoard(t: ThemeContext): Promise<FrameNode> {
  const variants: Array<{ label: Bi; node: SceneNode }> = [
    { label: ["Text", ""], node: skelText(t, 130) },
    { label: ["Circular", ""], node: skelCircle(t, 48) },
    { label: ["Rectangular", ""], node: skelSharp(t, 130, 80) },
    { label: ["Rounded", ""], node: skelRect(t, 130, 80, RADII.md) },
  ];
  // paragraph — the `lines` prop, last line shorter (MUI)
  const paraCanvas = canvas(t);
  const para = autoFrame({ direction: "VERTICAL", gap: 10 });
  para.resize(CANVAS_INNER, para.height);
  para.counterAxisSizingMode = "FIXED";
  const full = CANVAS_INNER - 8;
  for (const lw of [full, full, Math.round(full * 0.82), Math.round(full * 0.45)])
    para.appendChild(skelText(t, lw));
  paraCanvas.appendChild(para);
  // animation — pulse vs wave
  const anim: Array<{ label: Bi; node: SceneNode }> = [
    { label: ["Pulse", ""], node: skelRect(t, 170, 68, RADII.md) },
    { label: ["Wave", ""], node: skelWave(t, 170, 68) },
  ];
  const cardCanvas = canvas(t);
  const card = autoFrame({ direction: "VERTICAL", gap: 14, padding: 18 });
  card.resize(360, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.lg;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  const top = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  top.appendChild(skelCircle(t, 44));
  const lines = autoFrame({ direction: "VERTICAL", gap: 8 });
  lines.appendChild(skelRect(t, 150, 12));
  lines.appendChild(skelRect(t, 96, 10));
  top.appendChild(lines);
  card.appendChild(top);
  card.appendChild(skelRect(t, 324, 120, RADII.md));
  card.appendChild(skelRect(t, 300, 10));
  card.appendChild(skelRect(t, 256, 10));
  card.appendChild(skelRect(t, 180, 10));
  cardCanvas.appendChild(card);

  const props: PropRow[] = [
    {
      prop: "variant",
      type: "text | circular | rectangular | rounded",
      def: "text",
      note: ["Shape of the placeholder.", ""],
    },
    {
      prop: "width / height",
      type: "number | string",
      def: "—",
      note: ["Explicit size.", ""],
    },
    {
      prop: "animation",
      type: "pulse | wave | false",
      def: "pulse",
      note: ["Shimmer effect.", ""],
    },
    {
      prop: "lines",
      type: "number",
      def: "1",
      note: ["Text rows for a paragraph.", ""],
    },
  ];
  return componentBoard(
    t,
    "Skeleton",
    ["Placeholder while content loads", ""],
    ["Long waits → show progress instead", ""],
    [
      await block(t, "Variants", await tileGrid(t, variants, 160)),
      await block(t, "Paragraph", paraCanvas),
      await block(t, "Animation", await tileGrid(t, anim, 200)),
      await block(t, "Card", cardCanvas),
    ],
    props,
  );
}

// ── Snackbar / Toast ──────────────────────────────────────────
async function drawToast(
  t: ThemeContext,
  tone: "info" | "success" | "warning" | "danger" | "dante",
  message: string,
  o: { action?: string; closable?: boolean; desc?: string } = {},
): Promise<FrameNode> {
  const iconMap: Record<string, string> = {
    info: "info",
    success: "check",
    warning: "alert-triangle",
    danger: "alert-triangle",
    dante: "sparkles",
  };
  const toneMap: Record<string, string> = {
    info: "accent/primary",
    success: "feedback/success",
    warning: "feedback/warning",
    danger: "feedback/danger",
    dante: "accent/dante",
  };
  const c = autoFrame({
    direction: "HORIZONTAL",
    gap: 12,
    cross: o.desc ? "MIN" : "CENTER",
    padding: o.desc ? [14, 16] : [12, 16],
  });
  c.resize(440, c.height);
  c.primaryAxisSizingMode = "FIXED";
  c.counterAxisSizingMode = "AUTO";
  c.cornerRadius = RADII.lg;
  fillToken(t, c, "bg/surface-raised");
  strokeToken(t, c, "border/subtle", 1);
  await applyEffect(c, "shadow/lg", t);
  c.appendChild(icon(t, iconMap[tone], 18, toneMap[tone]));
  const msgWrap = autoFrame({ direction: "VERTICAL", gap: 3 });
  msgWrap.layoutGrow = 1;
  msgWrap.appendChild(
    await makeText(t, o.desc ? "label/sm" : "body/sm", message, "text/primary", { maxWidth: 300 }),
  );
  if (o.desc)
    msgWrap.appendChild(await makeText(t, "body/sm", o.desc, "text/muted", { maxWidth: 300 }));
  c.appendChild(msgWrap);
  if (o.action || o.closable) {
    const right = autoFrame({ direction: "HORIZONTAL", gap: 2, cross: "CENTER" });
    if (o.action) {
      const a = autoFrame({
        direction: "HORIZONTAL",
        align: "CENTER",
        cross: "CENTER",
        padding: [5, 10],
      });
      a.cornerRadius = RADII.full;
      a.appendChild(await makeText(t, "label/sm", o.action, "accent/primary"));
      right.appendChild(a);
    }
    if (o.closable) {
      const x = autoFrame({
        direction: "HORIZONTAL",
        align: "CENTER",
        cross: "CENTER",
        padding: 5,
      });
      x.cornerRadius = RADII.full;
      x.appendChild(icon(t, "x", 15, "text/muted"));
      right.appendChild(x);
    }
    c.appendChild(right);
  }
  return c;
}

async function snackbarBoard(t: ThemeContext): Promise<FrameNode> {
  const canv = canvas(t);
  const col = autoFrame({ direction: "VERTICAL", gap: 12 });
  col.appendChild(await drawToast(t, "info", "Changes saved to your draft.", { closable: true }));
  col.appendChild(
    await drawToast(t, "success", "Profile updated successfully.", { action: "View" }),
  );
  col.appendChild(
    await drawToast(t, "warning", "Your session expires in 5 minutes.", { action: "Extend" }),
  );
  col.appendChild(
    await drawToast(t, "danger", "Upload failed — please try again.", {
      action: "Retry",
      closable: true,
    }),
  );
  col.appendChild(
    await drawToast(t, "dante", "New drop: Night drive vol. 2 is live.", { action: "Listen" }),
  );
  canv.appendChild(col);

  const descCanvas = canvas(t);
  const dcol = autoFrame({ direction: "VERTICAL", gap: 12 });
  dcol.appendChild(
    await drawToast(t, "success", "Export complete", {
      desc: "members.csv is ready in your downloads folder.",
      action: "Open",
      closable: true,
    }),
  );
  dcol.appendChild(
    await drawToast(t, "info", "New device sign-in", {
      desc: "A login from Chrome on macOS was just detected.",
      action: "Review",
    }),
  );
  dcol.appendChild(
    await drawToast(t, "danger", "Sync failed", {
      desc: "We couldn't reach the server. Check your connection, then retry.",
      action: "Retry",
      closable: true,
    }),
  );
  descCanvas.appendChild(dcol);

  const props: PropRow[] = [
    {
      prop: "severity",
      type: "info | success | warning | danger | dante",
      def: "info",
      note: ["Tone + leading icon.", ""],
    },
    {
      prop: "message",
      type: "string",
      def: "—",
      note: ["Short, one-line title text.", ""],
    },
    {
      prop: "description",
      type: "string",
      def: "—",
      note: ["Optional second line of detail.", ""],
    },
    {
      prop: "action",
      type: "{ label, onClick }",
      def: "—",
      note: ["Optional inline action.", ""],
    },
    {
      prop: "autoHideDuration",
      type: "number (ms)",
      def: "5000",
      note: ["Auto-dismiss delay.", ""],
    },
    {
      prop: "anchorOrigin",
      type: "{ vertical, horizontal }",
      def: "bottom-left",
      note: ["Screen position.", ""],
    },
  ];
  return componentBoard(
    t,
    "Snackbar",
    ["Brief, auto-dismissing feedback", ""],
    ["Critical/blocking info → use a Dialog", "/ → Dialog"],
    [await block(t, "Tones & actions", canv), await block(t, "With description", descCanvas)],
    props,
  );
}

// ── Table ─────────────────────────────────────────────────────
async function initialsAvatar(t: ThemeContext, name: string, d = 30): Promise<FrameNode> {
  const f = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  f.resize(d, d);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = RADII.full;
  fillToken(t, f, "bg/inset");
  strokeToken(t, f, "border/subtle", 1);
  const init = name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
  f.appendChild(await makeText(t, "caption", init, "accent/primary"));
  return f;
}

function tableCheck(t: ThemeContext, checked: boolean): FrameNode {
  const b = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  b.resize(18, 18);
  b.primaryAxisSizingMode = "FIXED";
  b.counterAxisSizingMode = "FIXED";
  b.cornerRadius = RADII.sm;
  if (checked) {
    fillToken(t, b, "accent/primary");
    b.appendChild(icon(t, "check", 12, "accent/contrast"));
  } else strokeToken(t, b, "border/strong", 1.5);
  return b;
}

// Rows-per-page select pill (closed / open state)
async function perPagePill(t: ThemeContext, open = false): Promise<FrameNode> {
  const p = autoFrame({ direction: "HORIZONTAL", gap: 7, cross: "CENTER", padding: [5, 13] });
  p.cornerRadius = RADII.full;
  fillToken(t, p, "bg/surface-raised");
  strokeToken(t, p, open ? "accent/primary" : "border/subtle", open ? 1.5 : 1);
  if (open) await applyEffect(p, "glow/hover", t);
  p.appendChild(await makeText(t, "label/sm", "10", "text/primary"));
  p.appendChild(
    icon(t, open ? "chevron-up" : "chevron-down", 13, open ? "accent/primary" : "text/muted"),
  );
  return p;
}

async function perPageOpen(t: ThemeContext): Promise<FrameNode> {
  const stage = figma.createFrame();
  stage.name = "per-page-open";
  stage.fills = [];
  stage.clipsContent = false;
  stage.resize(150, 210);
  const pill = await perPagePill(t, true);
  stage.appendChild(pill);
  pill.x = 0;
  pill.y = 0;
  const menu = await ctxMenu(
    t,
    [
      { check: true, checked: true, label: "10" },
      { check: true, label: "20" },
      { check: true, label: "50" },
      { check: true, label: "100" },
    ],
    120,
  );
  stage.appendChild(menu);
  menu.x = 0;
  menu.y = pill.height + 8;
  return stage;
}

async function drawTable(
  t: ThemeContext,
  opts: { toolbar?: boolean; footer?: boolean; editable?: boolean } = {},
): Promise<FrameNode> {
  const w = CANVAS_INNER;
  const gap = 16;
  const avail = w - 36 - 18 - gap * 4; // padding + checkbox + 4 gaps
  const c1 = Math.round(avail * 0.36);
  const c2 = Math.round(avail * 0.2);
  const c3 = Math.round(avail * 0.2);
  const c4 = avail - c1 - c2 - c3;
  const table = autoFrame({ direction: "VERTICAL", gap: 0 });
  table.resize(w, table.height);
  table.counterAxisSizingMode = "FIXED";
  table.cornerRadius = RADII.lg;
  table.clipsContent = true;
  strokeToken(t, table, "border/subtle", 1);
  fillToken(t, table, "bg/surface");

  if (opts.toolbar) {
    const tb = autoFrame({
      direction: "HORIZONTAL",
      align: "SPACE_BETWEEN",
      cross: "CENTER",
      padding: [12, 18],
    });
    tb.resize(w, tb.height);
    tb.primaryAxisSizingMode = "FIXED";
    tb.counterAxisSizingMode = "AUTO";
    const search = autoFrame({
      direction: "HORIZONTAL",
      gap: 8,
      cross: "CENTER",
      padding: [8, 12],
    });
    search.resize(280, search.height);
    search.primaryAxisSizingMode = "FIXED";
    search.counterAxisSizingMode = "AUTO";
    search.cornerRadius = RADII.full;
    fillToken(t, search, "bg/inset");
    strokeToken(t, search, "border/subtle", 1);
    search.appendChild(icon(t, "search", 15, "text/muted"));
    search.appendChild(await makeText(t, "body/sm", "Search members…", "text/muted"));
    tb.appendChild(search);
    const tbtn = async (ic: string, label: string): Promise<FrameNode> => {
      const b = autoFrame({ direction: "HORIZONTAL", gap: 7, cross: "CENTER", padding: [7, 12] });
      b.cornerRadius = RADII.full;
      fillToken(t, b, "bg/surface-raised");
      strokeToken(t, b, "border/subtle", 1);
      b.appendChild(icon(t, ic, 14, "text/secondary"));
      b.appendChild(await makeText(t, "label/sm", label, "text/primary"));
      return b;
    };
    const tbRight = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
    tbRight.appendChild(await tbtn("upload", "Import .xlsx"));
    tbRight.appendChild(await tbtn("download", "Export .xlsx"));
    tb.appendChild(tbRight);
    table.appendChild(tb);
    table.appendChild(hairline(t, w));
  }

  const headCell = async (cw: number, txt: string): Promise<FrameNode> => {
    const c = fixedCol(cw, "HORIZONTAL");
    c.counterAxisAlignItems = "CENTER";
    c.appendChild(await makeText(t, "label/sm", txt, "text/muted"));
    return c;
  };
  const head = autoFrame({ direction: "HORIZONTAL", gap, cross: "CENTER", padding: [5, 18] });
  head.resize(w, head.height);
  head.primaryAxisSizingMode = "FIXED";
  head.counterAxisSizingMode = "AUTO";
  fillToken(t, head, "bg/surface-raised");
  head.appendChild(tableCheck(t, false));
  head.appendChild(await headCell(c1, "Name"));
  head.appendChild(await headCell(c2, "Role"));
  head.appendChild(await headCell(c3, "Status"));
  head.appendChild(await headCell(c4, "Joined"));
  table.appendChild(head);
  table.appendChild(hairline(t, w));

  interface TRow {
    n: string;
    e: string;
    role: string;
    st: string;
    tone: string;
    date: string;
    sel?: boolean;
    hover?: boolean;
  }
  const rows: TRow[] = [
    {
      n: "Alex Rivera",
      e: "alex@studio.dev",
      role: "Design Lead",
      st: "Active",
      tone: "feedback/success",
      date: "Jan 2024",
      sel: true,
    },
    {
      n: "Mika Chen",
      e: "mika@studio.dev",
      role: "Engineer",
      st: "Active",
      tone: "feedback/success",
      date: "Mar 2024",
    },
    {
      n: "Sam Okoro",
      e: "sam@studio.dev",
      role: "Product",
      st: "Away",
      tone: "feedback/warning",
      date: "Aug 2023",
      hover: true,
    },
    {
      n: "Lea Novak",
      e: "lea@studio.dev",
      role: "Research",
      st: "Invited",
      tone: "accent/primary",
      date: "—",
    },
    {
      n: "Tom Bauer",
      e: "tom@studio.dev",
      role: "Marketing",
      st: "Inactive",
      tone: "text/muted",
      date: "Dec 2022",
    },
  ];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const r = autoFrame({ direction: "HORIZONTAL", gap, cross: "CENTER", padding: [3, 18] });
    r.resize(w, r.height);
    r.primaryAxisSizingMode = "FIXED";
    r.counterAxisSizingMode = "AUTO";
    if (row.sel) r.fills = [tokenAlpha("accent/primary", 0.08)];
    else if (row.hover) fillToken(t, r, "bg/surface-raised");
    r.appendChild(tableCheck(t, !!row.sel));
    const name = fixedCol(c1, "HORIZONTAL");
    name.counterAxisAlignItems = "CENTER";
    name.itemSpacing = 10;
    name.appendChild(await initialsAvatar(t, row.n, 20));
    const nc = autoFrame({ direction: "VERTICAL", gap: 1 });
    nc.appendChild(await makeText(t, "body/sm", row.n, "text/primary"));
    nc.appendChild(await makeText(t, "caption", row.e, "text/muted"));
    name.appendChild(nc);
    r.appendChild(name);
    if (opts.editable && i === 1) {
      // active edit — the WHOLE cell lights up (xlsx-style), input appears on double-click
      const rc = fixedCol(c2, "HORIZONTAL");
      rc.primaryAxisSizingMode = "FIXED";
      rc.counterAxisSizingMode = "AUTO";
      rc.counterAxisAlignItems = "CENTER";
      rc.itemSpacing = 6;
      rc.paddingTop = rc.paddingBottom = 4;
      rc.paddingLeft = rc.paddingRight = 10;
      rc.cornerRadius = RADII.sm;
      fillToken(t, rc, "bg/inset");
      strokeToken(t, rc, "accent/primary", 1.5);
      await applyEffect(rc, "glow/hover", t);
      rc.appendChild(await makeText(t, "body/sm", row.role, "text/primary"));
      const caret = rect(1.5, 14);
      fillToken(t, caret, "accent/primary");
      rc.appendChild(caret);
      r.appendChild(rc);
    } else if (opts.editable && i === 2) {
      // hover affordance — whole cell tints + pencil hints it's editable
      const rc = fixedCol(c2, "HORIZONTAL");
      rc.primaryAxisSizingMode = "FIXED";
      rc.counterAxisSizingMode = "AUTO";
      rc.primaryAxisAlignItems = "SPACE_BETWEEN";
      rc.counterAxisAlignItems = "CENTER";
      rc.paddingTop = rc.paddingBottom = 4;
      rc.paddingLeft = rc.paddingRight = 10;
      rc.cornerRadius = RADII.sm;
      // hover state — faint accent fill + inner glow contained to this cell
      rc.fills = [tokenAlpha("accent/primary", 0.05)];
      strokeToken(t, rc, "border/subtle", 1);
      rc.effects = [
        {
          type: "INNER_SHADOW",
          color: { ...solid("#5EE6C1").color, a: 0.22 },
          offset: { x: 0, y: 0 },
          radius: 10,
          spread: 0,
          visible: true,
          blendMode: "NORMAL",
        } as InnerShadowEffect,
      ];
      rc.appendChild(await makeText(t, "body/sm", row.role, "text/secondary"));
      rc.appendChild(icon(t, "pencil", 13, "text/secondary"));
      r.appendChild(rc);
    } else {
      const rc = fixedCol(c2, "HORIZONTAL");
      rc.counterAxisAlignItems = "CENTER";
      rc.appendChild(await makeText(t, "body/sm", row.role, "text/secondary"));
      r.appendChild(rc);
    }
    const sc = fixedCol(c3, "HORIZONTAL");
    sc.counterAxisAlignItems = "CENTER";
    sc.appendChild(await statusPill(t, row.st, row.tone));
    r.appendChild(sc);
    const dc = fixedCol(c4, "HORIZONTAL");
    dc.counterAxisAlignItems = "CENTER";
    dc.appendChild(await makeText(t, "body/sm", row.date, "text/muted"));
    r.appendChild(dc);
    table.appendChild(r);
    if (i < rows.length - 1) table.appendChild(hairline(t, w));
  }
  if (opts.footer) {
    table.appendChild(hairline(t, w));
    const ft = autoFrame({
      direction: "HORIZONTAL",
      align: "SPACE_BETWEEN",
      cross: "CENTER",
      padding: [12, 18],
    });
    ft.resize(w, ft.height);
    ft.primaryAxisSizingMode = "FIXED";
    ft.counterAxisSizingMode = "AUTO";
    const ftLeft = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
    ftLeft.appendChild(await makeText(t, "caption", "Rows per page", "text/muted"));
    ftLeft.appendChild(await perPagePill(t));
    ftLeft.appendChild(await makeText(t, "caption", "5 of 42", "text/muted"));
    ft.appendChild(ftLeft);
    ft.appendChild(await drawPagination(t, { page: 2, count: 5, sib: 1 }));
    table.appendChild(ft);
  }
  return table;
}

async function tableBoard(t: ThemeContext): Promise<FrameNode> {
  const c1 = canvas(t);
  c1.appendChild(await drawTable(t));
  const c2 = canvas(t);
  c2.appendChild(await drawTable(t, { toolbar: true, footer: true }));
  const c3 = canvas(t);
  c3.appendChild(await drawTable(t, { editable: true }));
  const props: PropRow[] = [
    {
      prop: "columns",
      type: "Column[]",
      def: "—",
      note: ["Header title, key, width, align.", ""],
    },
    { prop: "rows", type: "Row[]", def: "[]", note: ["Data records.", ""] },
    {
      prop: "selectable",
      type: "boolean",
      def: "false",
      note: ["Row checkboxes.", ""],
    },
    {
      prop: "searchable",
      type: "boolean",
      def: "false",
      note: ["Toolbar search filter.", ""],
    },
    {
      prop: "pagination",
      type: "{ page, pageSize }",
      def: "—",
      note: ["Footer paging controls.", ""],
    },
    {
      prop: "editableCells",
      type: "boolean",
      def: "false",
      note: ["Double-click a cell to edit inline.", ""],
    },
    {
      prop: "onRowClick",
      type: "(row)=>void",
      def: "—",
      note: ["Row click handler.", ""],
    },
  ];
  const pp = await tileGrid(
    t,
    [
      { label: ["Closed", ""], node: await perPagePill(t) },
      { label: ["Open", ""], node: await perPageOpen(t) },
    ],
    200,
  );
  return componentBoard(
    t,
    "Table",
    ["Structured rows of comparable data", ""],
    ["A few key-values → use a description List", "«-» → List"],
    [
      await block(t, "Data table", c1),
      await block(t, "Search & pagination", c2),
      await block(t, "Rows per page", pp),
      await block(t, "Editable cells", c3),
    ],
    props,
  );
}

// ── Dialog / Modal ────────────────────────────────────────────
// Reusable tinted severity / status icon badge — circle or rounded, 3 sizes.
function severityIcon(
  t: ThemeContext,
  o: { icon: string; tone: string; shape?: "circle" | "rounded"; size?: Size },
): FrameNode {
  const S = { sm: { box: 32, ic: 16 }, md: { box: 44, ic: 22 }, lg: { box: 56, ic: 28 } }[
    o.size ?? "md"
  ];
  const f = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  f.resize(S.box, S.box);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = o.shape === "rounded" ? RADII.lg : RADII.full;
  f.fills = [tokenAlpha(o.tone, 0.15)];
  f.appendChild(icon(t, o.icon, S.ic, o.tone));
  return f;
}

async function severityIconBoard(t: ThemeContext): Promise<FrameNode> {
  const tones = await tileGrid(
    t,
    [
      { label: ["Info", ""], node: severityIcon(t, { icon: "info", tone: "accent/primary" }) },
      {
        label: ["Success", ""],
        node: severityIcon(t, { icon: "check", tone: "feedback/success" }),
      },
      {
        label: ["Warning", ""],
        node: severityIcon(t, { icon: "alert-triangle", tone: "feedback/warning" }),
      },
      {
        label: ["Danger", ""],
        node: severityIcon(t, { icon: "trash", tone: "feedback/danger" }),
      },
      {
        label: ["Accent", ""],
        node: severityIcon(t, { icon: "star", tone: "accent/secondary" }),
      },
      {
        label: ["Dante", ""],
        node: severityIcon(t, { icon: "heart", tone: "accent/dante" }),
      },
    ],
    130,
  );
  const shapes = await tileGrid(
    t,
    [
      {
        label: ["Circle", ""],
        node: severityIcon(t, { icon: "check", tone: "feedback/success", shape: "circle" }),
      },
      {
        label: ["Rounded", ""],
        node: severityIcon(t, { icon: "check", tone: "feedback/success", shape: "rounded" }),
      },
      {
        label: ["sm", "sm"],
        node: severityIcon(t, {
          icon: "info",
          tone: "accent/primary",
          shape: "rounded",
          size: "sm",
        }),
      },
      {
        label: ["md", "md"],
        node: severityIcon(t, {
          icon: "info",
          tone: "accent/primary",
          shape: "rounded",
          size: "md",
        }),
      },
      {
        label: ["lg", "lg"],
        node: severityIcon(t, {
          icon: "info",
          tone: "accent/primary",
          shape: "rounded",
          size: "lg",
        }),
      },
    ],
    130,
  );
  const props: PropRow[] = [
    { prop: "icon", type: "string", def: "—", note: ["Lucide icon name.", ""] },
    {
      prop: "tone",
      type: "accent | dante | success | warning | danger",
      def: "accent",
      note: ["Semantic colour.", ""],
    },
    {
      prop: "shape",
      type: "circle | rounded",
      def: "circle",
      note: ["Badge shape.", ""],
    },
    { prop: "size", type: "sm | md | lg", def: "md", note: ["Badge size.", ""] },
  ];
  return componentBoard(
    t,
    "Severity Icon",
    ["Tinted status / severity badge", ""],
    ["Plain glyph → use an Icon", "→ Icon"],
    [await block(t, "Tones", tones), await block(t, "Shape & size", shapes)],
    props,
  );
}

// tone = a colour token for the filled confirm button, or "secondary" for the neutral one
async function dialogBtn(t: ThemeContext, label: string, tone: string): Promise<FrameNode> {
  const b = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [10, 18],
  });
  b.cornerRadius = RADII.lg;
  if (tone === "secondary") {
    fillToken(t, b, "bg/surface-raised");
    strokeToken(t, b, "border/subtle", 1);
    b.appendChild(await makeText(t, "label/md", label, "text/primary"));
  } else {
    fillToken(t, b, tone);
    b.appendChild(await makeText(t, "label/md", label, "accent/contrast"));
  }
  return b;
}

async function drawDialog(
  t: ThemeContext,
  o: { icon?: string; tone?: string; title: string; body: string; cancel: string; confirm: string },
): Promise<FrameNode> {
  const tone = o.tone ?? "accent/primary";
  const scrim = figma.createFrame();
  scrim.resize(CANVAS_INNER, 360);
  scrim.cornerRadius = RADII.lg;
  scrim.clipsContent = true;
  scrim.fills = [{ ...solid("#05060A"), opacity: 0.55 } as SolidPaint];
  const dialog = autoFrame({ direction: "VERTICAL", gap: 14, padding: 24 });
  dialog.resize(460, dialog.height);
  dialog.counterAxisSizingMode = "FIXED";
  dialog.cornerRadius = RADII.xl;
  fillToken(t, dialog, "bg/surface");
  strokeToken(t, dialog, "border/subtle", 1);
  await applyEffect(dialog, "shadow/lg", t);
  if (o.icon)
    dialog.appendChild(severityIcon(t, { icon: o.icon, tone, shape: "rounded", size: "md" }));
  // title · icon · description all left-aligned
  dialog.appendChild(await makeText(t, "heading/h4", o.title, "text/primary"));
  dialog.appendChild(await makeText(t, "body/md", o.body, "text/secondary", { maxWidth: 412 }));
  // actions — rounded, pushed to the right via a growing spacer
  const actions = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  actions.layoutAlign = "STRETCH";
  actions.primaryAxisSizingMode = "FIXED";
  const spacer = rect(1, 1);
  spacer.fills = [];
  spacer.layoutGrow = 1;
  actions.appendChild(spacer);
  actions.appendChild(await dialogBtn(t, o.cancel, "secondary"));
  actions.appendChild(await dialogBtn(t, o.confirm, tone));
  dialog.appendChild(actions);
  scrim.appendChild(dialog);
  dialog.x = (CANVAS_INNER - 460) / 2;
  dialog.y = Math.max(20, (360 - dialog.height) / 2);
  // close × — top-right corner of the dialog
  const close = await drawActionSquare(t, "Ghost", "Default", "sm", "x");
  scrim.appendChild(close);
  close.x = dialog.x + 460 - 46;
  close.y = dialog.y + 16;
  return scrim;
}

async function dialogBoard(t: ThemeContext): Promise<FrameNode> {
  const mk = async (o: Parameters<typeof drawDialog>[1]): Promise<FrameNode> => {
    const c = canvas(t);
    c.appendChild(await drawDialog(t, o));
    return c;
  };
  const c1 = await mk({
    title: "Save changes?",
    body: "You have unsaved edits. Save them before you leave this page?",
    cancel: "Discard",
    confirm: "Save changes",
    tone: "accent/primary",
  });
  const c2 = await mk({
    icon: "trash",
    tone: "feedback/danger",
    title: "Delete project?",
    body: "This permanently deletes “Vizitka” and all of its files. This action can't be undone.",
    cancel: "Cancel",
    confirm: "Delete",
  });
  const c3 = await mk({
    icon: "check",
    tone: "feedback/success",
    title: "Payment successful",
    body: "Your plan is now active. A receipt was sent to your email.",
    cancel: "Close",
    confirm: "View receipt",
  });
  const c4 = await mk({
    icon: "alert-triangle",
    tone: "feedback/warning",
    title: "Leave without saving?",
    body: "Your draft will be kept for 24 hours, then discarded for good.",
    cancel: "Keep editing",
    confirm: "Leave",
  });
  const c5 = await mk({
    icon: "info",
    tone: "accent/secondary",
    title: "What's new",
    body: "Dark maps, editable tables and a batch of base components just landed.",
    cancel: "Later",
    confirm: "See changelog",
  });
  const props: PropRow[] = [
    {
      prop: "open",
      type: "boolean",
      def: "false",
      note: ["Controls visibility.", ""],
    },
    {
      prop: "title / description",
      type: "string",
      def: "—",
      note: ["Heading and body copy.", ""],
    },
    {
      prop: "icon / tone",
      type: "string · accent|success|warning|danger",
      def: "—",
      note: ["Leading icon + confirm colour.", ""],
    },
    {
      prop: "actions",
      type: "ReactNode",
      def: "—",
      note: ["Footer buttons.", ""],
    },
    { prop: "size", type: "sm | md | lg", def: "md", note: ["Dialog width.", ""] },
    {
      prop: "dismissible",
      type: "boolean",
      def: "true",
      note: ["Close on backdrop / Esc.", "/ Esc."],
    },
    { prop: "onClose", type: "()=>void", def: "—", note: ["Fires on dismiss.", ""] },
  ];
  return componentBoard(
    t,
    "Dialog",
    ["Focused task or confirmation over the page", ""],
    ["Non-blocking feedback → use a Snackbar", "→ Snackbar"],
    [
      await block(t, "Confirm", c1),
      await block(t, "Destructive", c2),
      await block(t, "Success", c3),
      await block(t, "Warning", c4),
      await block(t, "Info", c5),
    ],
    props,
  );
}

async function kbdBoard(t: ThemeContext): Promise<FrameNode> {
  const keys = await tileGrid(
    t,
    [
      { label: ["Cmd", "Cmd"], node: await drawShortcut(t, ["⌘"]) },
      { label: ["Shift", "Shift"], node: await drawShortcut(t, ["⇧"]) },
      { label: ["Ctrl", "Ctrl"], node: await drawShortcut(t, ["⌃"]) },
      { label: ["Option", "Option"], node: await drawShortcut(t, ["⌥"]) },
      { label: ["Esc", "Esc"], node: await drawShortcut(t, ["Esc"]) },
      { label: ["Enter", "Enter"], node: await drawShortcut(t, ["↵"]) },
      { label: ["Arrow", ""], node: await drawShortcut(t, ["↑"]) },
    ],
    120,
  );
  const combos = await tileGrid(
    t,
    [
      { label: ["Command palette", ""], node: await drawShortcut(t, ["⌘", "K"]) },
      { label: ["Screenshot", ""], node: await drawShortcut(t, ["⌘", "⇧", "4"]) },
      {
        label: ["Force quit", "Ctrl+Alt+Del"],
        node: await drawShortcut(t, ["Ctrl", "Alt", "Del"], "md", "+"),
      },
      { label: ["Save", ""], node: await drawShortcut(t, ["⌘", "S"]) },
    ],
    260,
  );
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawShortcut(t, ["⌘", "K"], "sm") },
      { label: SIZE_LABEL.md, node: await drawShortcut(t, ["⌘", "K"], "md") },
      { label: SIZE_LABEL.lg, node: await drawShortcut(t, ["⌘", "K"], "lg") },
    ],
    150,
  );
  const props: PropRow[] = [
    {
      prop: "keys",
      type: "string[]",
      def: "[]",
      note: ["Key caps (⌘, K, Esc…).", "(⌘, K, Esc…)."],
    },
    {
      prop: "separator",
      type: "string",
      def: "—",
      note: ["Between keys (e.g. +).", ""],
    },
    { prop: "size", type: "sm|md|lg", def: "md", note: ["Cap size.", ""] },
  ];
  return componentBoard(
    t,
    "Kbd / Shortcut",
    ["Show a keyboard key or combo", ""],
    ["Prose text → don't style as a key", ""],
    [
      await block(t, "Keys", keys),
      await block(t, "Combos", combos),
      await block(t, "Sizes", sizes),
    ],
    props,
  );
}

// ══ Chat components ═══════════════════════════════════════════
async function chatBubble(
  t: ThemeContext,
  side: "in" | "out",
  text: string,
  time: string,
): Promise<FrameNode> {
  const wrap = autoFrame({ direction: "VERTICAL", gap: 4 });
  wrap.layoutAlign = side === "out" ? "MAX" : "MIN";
  wrap.counterAxisAlignItems = side === "out" ? "MAX" : "MIN";
  const b = autoFrame({ direction: "VERTICAL", gap: 4, padding: [10, 14] });
  b.cornerRadius = RADII.lg;
  if (side === "out") {
    fillToken(t, b, "accent/primary");
    b.bottomRightRadius = 4;
  } else {
    fillToken(t, b, "bg/surface-raised");
    strokeToken(t, b, "border/subtle", 1);
    b.bottomLeftRadius = 4;
  }
  b.appendChild(
    await makeText(t, "body/sm", text, side === "out" ? "accent/contrast" : "text/primary", {
      maxWidth: 380,
    }),
  );
  wrap.appendChild(b);
  wrap.appendChild(await makeText(t, "caption", time, "text/muted"));
  return wrap;
}

async function typingBubble(t: ThemeContext): Promise<FrameNode> {
  const wrap = autoFrame({ direction: "VERTICAL" });
  wrap.layoutAlign = "MIN";
  const b = autoFrame({ direction: "HORIZONTAL", gap: 5, cross: "CENTER", padding: [13, 15] });
  b.cornerRadius = RADII.lg;
  b.bottomLeftRadius = 4;
  fillToken(t, b, "bg/surface-raised");
  strokeToken(t, b, "border/subtle", 1);
  for (let i = 0; i < 3; i++) {
    const d = ellipse(7);
    fillToken(t, d, "text/muted");
    d.strokes = [];
    d.opacity = 0.4 + i * 0.25;
    b.appendChild(d);
  }
  wrap.appendChild(b);
  return wrap;
}

async function sysPill(
  t: ThemeContext,
  text: string,
  bg: string,
  tone: string,
  iconName?: string,
  maxWidth?: number,
): Promise<FrameNode> {
  const p = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    align: "CENTER",
    cross: "CENTER",
    padding: [8, 16],
  });
  p.cornerRadius = RADII.md;
  if (bg.startsWith("#")) p.fills = [{ ...solid(bg), opacity: 0.12 } as SolidPaint];
  else fillToken(t, p, bg);
  if (iconName) p.appendChild(icon(t, iconName, 14, tone));
  p.appendChild(await makeText(t, "caption", text, tone, maxWidth ? { maxWidth } : undefined));
  return p;
}

async function systemMessagesBoard(t: ThemeContext): Promise<FrameNode> {
  const canv = canvas(t);
  const col = autoFrame({ direction: "VERTICAL", gap: 14, cross: "CENTER" });
  col.resize(CANVAS_INNER, col.height);
  col.counterAxisSizingMode = "FIXED";
  col.appendChild(
    await sysPill(
      t,
      "Use the app on your phone to see older messages.",
      "bg/surface-raised",
      "feedback/success",
    ),
  );
  col.appendChild(await sysPill(t, "Today", "bg/surface-raised", "text/primary"));
  col.appendChild(
    await sysPill(
      t,
      "Messages and calls are end-to-end encrypted. Only people in this chat can read them.",
      "#FBBF24",
      "feedback/warning",
      "lock",
      520,
    ),
  );
  canv.appendChild(col);
  const props: PropRow[] = [
    {
      prop: "kind",
      type: "date | notice | encryption",
      def: "notice",
      note: ["Type of system line.", ""],
    },
    { prop: "text", type: "string", def: "—", note: ["Centered message.", ""] },
    {
      prop: "tone",
      type: "muted | success | warning",
      def: "muted",
      note: ["Colour of the pill.", ""],
    },
  ];
  return componentBoard(
    t,
    "System Messages",
    ["Centered date / notice / encryption lines", ""],
    ["A user message → use Message Bubble", "→ Message Bubble"],
    [await block(t, "System", canv)],
    props,
  );
}

function mediaTile(t: ThemeContext, w: number, _label: string): FrameNode {
  const f = figma.createFrame();
  f.resize(w, w);
  f.cornerRadius = RADII.md;
  f.clipsContent = true;
  fillToken(t, f, "bg/inset");
  const im = icon(t, "image", 24, "text/muted");
  f.appendChild(im);
  im.x = (w - 24) / 2;
  im.y = (w - 24) / 2 - 8;
  const scrim = rect(w, 34);
  scrim.fills = [
    linearGradient(
      [
        { hex: "#00000000", position: 0 },
        { hex: "#000000B0", position: 1 },
      ],
      "vertical",
    ),
  ];
  scrim.strokes = [];
  f.appendChild(scrim);
  scrim.x = 0;
  scrim.y = w - 34;
  return f;
}

async function sharedMediaBoard(t: ThemeContext): Promise<FrameNode> {
  const canv = canvas(t);
  const w = autoFrame({ direction: "VERTICAL", gap: 16, padding: 18 });
  w.resize(CANVAS_INNER, w.height);
  w.counterAxisSizingMode = "FIXED";
  w.cornerRadius = RADII.lg;
  fillToken(t, w, "bg/surface");
  strokeToken(t, w, "border/subtle", 1);
  const head = autoFrame({ direction: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER" });
  head.resize(CANVAS_INNER - 36, head.height);
  head.primaryAxisSizingMode = "FIXED";
  head.counterAxisSizingMode = "AUTO";
  const title = autoFrame({ direction: "VERTICAL", gap: 1 });
  title.appendChild(await makeText(t, "heading/h3", "Media", "text/primary"));
  title.appendChild(await makeText(t, "caption", "Media from all chats", "text/muted"));
  head.appendChild(title);
  head.appendChild(
    await drawSegmented(t, [
      { label: "Media", active: true },
      { label: "Links" },
      { label: "Docs" },
    ]),
  );
  const hr = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER" });
  hr.appendChild(icon(t, "list", 18, "text/secondary"));
  hr.appendChild(icon(t, "search", 18, "text/secondary"));
  head.appendChild(hr);
  w.appendChild(head);
  w.appendChild(await makeText(t, "overline", "Last week · 14–19 Jul 2026", "text/muted"));
  const inner = CANVAS_INNER - 36;
  const gap = 12;
  const tileW = Math.floor((inner - gap * 4) / 5);
  const grid = autoFrame({ direction: "HORIZONTAL", gap, wrap: true, cross: "MIN" });
  grid.resize(inner, grid.height);
  grid.primaryAxisSizingMode = "FIXED";
  grid.counterAxisSizingMode = "AUTO";
  grid.counterAxisSpacing = gap;
  for (const lab of ["You", "You", "You", "Grey Wolf", "~Hoda", "You", "You", "You", "You", "You"])
    grid.appendChild(mediaTile(t, tileW, lab));
  w.appendChild(grid);
  const foot = autoFrame({ direction: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER" });
  foot.resize(inner, foot.height);
  foot.primaryAxisSizingMode = "FIXED";
  foot.counterAxisSizingMode = "AUTO";
  foot.appendChild(await makeText(t, "caption", "31 Photos · 1 Video", "text/muted"));
  const done = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [7, 16],
  });
  done.cornerRadius = RADII.full;
  fillToken(t, done, "accent/primary");
  done.appendChild(await makeText(t, "label/sm", "Done", "accent/contrast"));
  foot.appendChild(done);
  w.appendChild(foot);
  canv.appendChild(w);

  const filterCanvas = canvas(t);
  const fcenter = autoFrame({ direction: "HORIZONTAL", align: "CENTER" });
  fcenter.resize(CANVAS_INNER, fcenter.height);
  fcenter.primaryAxisSizingMode = "FIXED";
  fcenter.counterAxisSizingMode = "AUTO";
  fcenter.appendChild(
    await ctxMenu(
      t,
      [
        { group: "Sent by" },
        { check: true, checked: true, label: "All" },
        { check: true, label: "You" },
        { check: true, label: "Others" },
        { sep: true },
        { group: "Sort by" },
        { check: true, checked: true, label: "Newest" },
        { check: true, label: "Oldest" },
        { check: true, label: "Largest" },
      ],
      220,
    ),
  );
  filterCanvas.appendChild(fcenter);

  const props: PropRow[] = [
    {
      prop: "tab",
      type: "media | links | docs",
      def: "media",
      note: ["What's shown.", ""],
    },
    {
      prop: "groupBy",
      type: "date",
      def: "date",
      note: ["Sections per period.", ""],
    },
    {
      prop: "sender",
      type: "all | you | others",
      def: "all",
      note: ["Filter by author.", ""],
    },
    {
      prop: "sort",
      type: "newest | oldest | largest",
      def: "newest",
      note: ["Ordering.", ""],
    },
  ];
  return componentBoard(
    t,
    "Shared Media",
    ["Media / links / docs from all chats", ""],
    ["A single image → use Photo", "→ Photo"],
    [await block(t, "Gallery", canv), await block(t, "Filter", filterCanvas)],
    props,
  );
}

// Shared chat/call list row: avatar + name + subline (+ direction) + time.
async function chatRow(
  t: ThemeContext,
  o: {
    name: string;
    sub: string;
    time: string;
    w: number;
    missed?: boolean;
    dir?: boolean;
    active?: boolean;
  },
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [8, 10] });
  row.resize(o.w, row.height);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.cornerRadius = RADII.lg;
  if (o.active) fillToken(t, row, "bg/surface-raised");
  row.appendChild(await initialsAvatar(t, o.name, 42));
  const mid = autoFrame({ direction: "VERTICAL", gap: 2 });
  mid.layoutGrow = 1;
  mid.appendChild(
    await makeText(t, "label/md", o.name, o.missed ? "feedback/danger" : "text/primary"),
  );
  const subRow = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
  if (o.dir) subRow.appendChild(icon(t, "phone", 13, o.missed ? "feedback/danger" : "text/muted"));
  subRow.appendChild(await makeText(t, "body/sm", o.sub, "text/muted", { maxWidth: o.w - 170 }));
  mid.appendChild(subRow);
  row.appendChild(mid);
  row.appendChild(
    await makeText(t, "caption", o.time, o.missed ? "feedback/danger" : "text/muted"),
  );
  return row;
}

async function chatHeaderBoard(t: ThemeContext): Promise<FrameNode> {
  const canv = canvas(t);
  const bar = autoFrame({
    direction: "HORIZONTAL",
    align: "SPACE_BETWEEN",
    cross: "CENTER",
    padding: [10, 16],
  });
  bar.resize(560, bar.height);
  bar.primaryAxisSizingMode = "FIXED";
  bar.counterAxisSizingMode = "AUTO";
  bar.cornerRadius = RADII.lg;
  fillToken(t, bar, "bg/surface");
  strokeToken(t, bar, "border/subtle", 1);
  const left = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  left.appendChild(await initialsAvatar(t, "Spike", 40));
  left.appendChild(await makeText(t, "heading/h4", "Spike", "text/primary"));
  bar.appendChild(left);
  const right = autoFrame({ direction: "HORIZONTAL", gap: 18, cross: "CENTER" });
  right.appendChild(icon(t, "video", 20, "text/secondary"));
  right.appendChild(icon(t, "phone", 20, "text/secondary"));
  bar.appendChild(right);
  canv.appendChild(bar);
  const props: PropRow[] = [
    {
      prop: "peer",
      type: "{ name, avatar }",
      def: "—",
      note: ["Who you're chatting with.", ""],
    },
    {
      prop: "actions",
      type: "video | call",
      def: "—",
      note: ["Call buttons on the right.", ""],
    },
  ];
  return componentBoard(
    t,
    "Chat Header",
    ["Active conversation top bar", ""],
    ["Global nav → use a Nav bar", "→ Nav bar"],
    [await block(t, "Header", canv)],
    props,
  );
}

async function chatsWidgetBoard(t: ThemeContext): Promise<FrameNode> {
  const canv = canvas(t);
  const w = autoFrame({ direction: "VERTICAL", gap: 14, padding: 16 });
  w.resize(380, w.height);
  w.counterAxisSizingMode = "FIXED";
  w.cornerRadius = RADII.lg;
  fillToken(t, w, "bg/surface");
  strokeToken(t, w, "border/subtle", 1);
  w.appendChild(await makeText(t, "heading/h3", "Chats", "text/primary"));
  const search = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [9, 12] });
  search.resize(348, search.height);
  search.primaryAxisSizingMode = "FIXED";
  search.counterAxisSizingMode = "AUTO";
  search.cornerRadius = RADII.md;
  fillToken(t, search, "bg/inset");
  strokeToken(t, search, "border/subtle", 1);
  search.appendChild(icon(t, "search", 15, "text/muted"));
  search.appendChild(await makeText(t, "body/md", "Search", "text/muted"));
  w.appendChild(search);
  const chips = autoFrame({ direction: "HORIZONTAL", gap: 8, wrap: true, cross: "CENTER" });
  chips.resize(348, chips.height);
  chips.primaryAxisSizingMode = "FIXED";
  chips.counterAxisSizingMode = "AUTO";
  chips.counterAxisSpacing = 8;
  const segChip = async (label: string, active: boolean): Promise<FrameNode> => {
    const c = autoFrame({
      direction: "HORIZONTAL",
      align: "CENTER",
      cross: "CENTER",
      padding: [6, 14],
    });
    c.cornerRadius = RADII.full;
    if (active) {
      fillToken(t, c, "accent/primary");
      c.appendChild(await makeText(t, "label/sm", label, "accent/contrast"));
    } else {
      strokeToken(t, c, "border/subtle", 1);
      c.appendChild(await makeText(t, "label/sm", label, "text/secondary"));
    }
    return c;
  };
  chips.appendChild(await segChip("All", true));
  chips.appendChild(await segChip("Unread", false));
  chips.appendChild(await segChip("Favorites", false));
  chips.appendChild(await segChip("Groups", false));
  w.appendChild(chips);
  const list = autoFrame({ direction: "VERTICAL", gap: 4 });
  list.layoutAlign = "STRETCH";
  list.appendChild(
    await chatRow(t, {
      name: "Spike",
      sub: 'You reacted ❤️ to "❤️"',
      time: "19:36",
      w: 348,
      active: true,
    }),
  );
  list.appendChild(
    await chatRow(t, {
      name: "Björn",
      sub: "The message timer was updated…",
      time: "04:36",
      w: 348,
    }),
  );
  list.appendChild(
    await chatRow(t, {
      name: "Egor",
      sub: "I found a cigarette and it looks like…",
      time: "02:15",
      w: 348,
    }),
  );
  list.appendChild(
    await chatRow(t, {
      name: "I live urban",
      sub: "~Sadık joined using a group link",
      time: "Sat",
      w: 348,
    }),
  );
  w.appendChild(list);
  canv.appendChild(w);
  const props: PropRow[] = [
    {
      prop: "filter",
      type: "all | unread | favorites | groups",
      def: "all",
      note: ["Chip filter tabs.", ""],
    },
    { prop: "query", type: "string", def: "—", note: ["Search text.", ""] },
    {
      prop: "chats",
      type: "Chat[]",
      def: "[]",
      note: ["Rows: avatar, preview, time.", ""],
    },
  ];
  return componentBoard(
    t,
    "Chats (widget)",
    ["Searchable, filterable chat list", ""],
    ["Single thread → use Chat Header", "→ Chat Header"],
    [await block(t, "Widget", canv)],
    props,
  );
}

async function callScreenBoard(t: ThemeContext): Promise<FrameNode> {
  const canv = canvas(t);
  const scr = autoFrame({ direction: "VERTICAL", gap: 0, padding: 24 });
  scr.resize(560, 440);
  scr.primaryAxisSizingMode = "FIXED";
  scr.counterAxisSizingMode = "FIXED";
  scr.cornerRadius = RADII.xl;
  scr.clipsContent = true;
  scr.fills = [solid("#07080C")];
  const center = autoFrame({ direction: "VERTICAL", gap: 18, align: "CENTER", cross: "CENTER" });
  center.layoutGrow = 1;
  center.layoutAlign = "STRETCH";
  center.appendChild(await initialsAvatar(t, "Spike", 104));
  center.appendChild(await makeText(t, "display/lg", "Spike", "text/primary"));
  center.appendChild(await makeText(t, "body/lg", "ringing +999 99 999 9999…", "text/muted"));
  scr.appendChild(center);
  const controls = autoFrame({
    direction: "HORIZONTAL",
    gap: 16,
    align: "CENTER",
    cross: "CENTER",
  });
  controls.resize(512, controls.height);
  controls.primaryAxisSizingMode = "FIXED";
  controls.counterAxisSizingMode = "AUTO";
  const cbtn = (name: string, danger = false): FrameNode => {
    const b = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    const d = danger ? 54 : 46;
    b.resize(d, d);
    b.primaryAxisSizingMode = "FIXED";
    b.counterAxisSizingMode = "FIXED";
    b.cornerRadius = RADII.full;
    fillToken(t, b, danger ? "feedback/danger" : "bg/surface-raised");
    b.appendChild(icon(t, name, danger ? 22 : 20, danger ? "accent/contrast" : "text/primary"));
    return b;
  };
  controls.appendChild(cbtn("mic"));
  controls.appendChild(cbtn("video"));
  controls.appendChild(cbtn("users"));
  controls.appendChild(cbtn("message-circle"));
  controls.appendChild(cbtn("phone", true));
  scr.appendChild(controls);
  canv.appendChild(scr);
  const props: PropRow[] = [
    {
      prop: "peer",
      type: "{ name, avatar }",
      def: "—",
      note: ["Callee identity.", ""],
    },
    {
      prop: "status",
      type: "ringing | active | ended",
      def: "ringing",
      note: ["Call state text.", ""],
    },
    {
      prop: "controls",
      type: "mic | video | add | chat | end",
      def: "—",
      note: ["Bottom control bar.", ""],
    },
  ];
  return componentBoard(
    t,
    "Call Screen",
    ["Full-screen voice / video call", ""],
    ["Just a heads-up → use a Snackbar", "→ Snackbar"],
    [await block(t, "Call", canv)],
    props,
  );
}

async function callsListBoard(t: ThemeContext): Promise<FrameNode> {
  const canv = canvas(t);
  const w = autoFrame({ direction: "VERTICAL", gap: 14, padding: 16 });
  w.resize(420, w.height);
  w.counterAxisSizingMode = "FIXED";
  w.cornerRadius = RADII.lg;
  fillToken(t, w, "bg/surface");
  strokeToken(t, w, "border/subtle", 1);
  const head = autoFrame({ direction: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER" });
  head.resize(388, head.height);
  head.primaryAxisSizingMode = "FIXED";
  head.counterAxisSizingMode = "AUTO";
  head.appendChild(await makeText(t, "heading/h3", "Calls", "text/primary"));
  head.appendChild(icon(t, "phone", 18, "accent/primary"));
  w.appendChild(head);
  const search = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [9, 12] });
  search.resize(388, search.height);
  search.primaryAxisSizingMode = "FIXED";
  search.counterAxisSizingMode = "AUTO";
  search.cornerRadius = RADII.md;
  fillToken(t, search, "bg/inset");
  strokeToken(t, search, "border/subtle", 1);
  search.appendChild(icon(t, "search", 15, "text/muted"));
  search.appendChild(await makeText(t, "body/md", "Name, number, @username", "text/muted"));
  w.appendChild(search);
  w.appendChild(await makeText(t, "overline", "Favorites", "text/muted"));
  const fav = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  fav.appendChild(circleIcon(t, 42, "plus", "bg/inset", "text/secondary"));
  fav.appendChild(await makeText(t, "label/md", "Add favourite", "accent/primary"));
  w.appendChild(fav);
  w.appendChild(hairline(t, 388));
  w.appendChild(await makeText(t, "overline", "Recent", "text/muted"));
  const list = autoFrame({ direction: "VERTICAL", gap: 4 });
  list.layoutAlign = "STRETCH";
  list.appendChild(
    await chatRow(t, { name: "Spike", sub: "Outgoing", time: "23:08", w: 388, dir: true }),
  );
  list.appendChild(
    await chatRow(t, { name: "Spike", sub: "Incoming", time: "Yesterday", w: 388, dir: true }),
  );
  list.appendChild(
    await chatRow(t, {
      name: "Egor",
      sub: "Missed",
      time: "Saturday",
      w: 388,
      dir: true,
      missed: true,
    }),
  );
  list.appendChild(
    await chatRow(t, {
      name: "Grey Wolf",
      sub: "Missed",
      time: "Friday",
      w: 388,
      dir: true,
      missed: true,
    }),
  );
  w.appendChild(list);
  canv.appendChild(w);
  const props: PropRow[] = [
    {
      prop: "favorites",
      type: "Contact[]",
      def: "[]",
      note: ["Pinned quick-dial.", ""],
    },
    {
      prop: "recent",
      type: "Call[]",
      def: "[]",
      note: ["Outgoing / incoming / missed.", ""],
    },
    {
      prop: "missed",
      type: "boolean",
      def: "false",
      note: ["Red name + status.", ""],
    },
  ];
  return componentBoard(
    t,
    "Calls",
    ["Recent calls with favourites", ""],
    ["Live call → use Call Screen", "→ Call Screen"],
    [await block(t, "Calls", canv)],
    props,
  );
}

async function railBoard(t: ThemeContext): Promise<FrameNode> {
  const canv = canvas(t);
  const rail = autoFrame({ direction: "VERTICAL", gap: 10, cross: "CENTER", padding: [16, 12] });
  rail.resize(64, 520);
  rail.primaryAxisSizingMode = "FIXED";
  rail.counterAxisSizingMode = "FIXED";
  rail.cornerRadius = RADII.lg;
  fillToken(t, rail, "bg/surface");
  strokeToken(t, rail, "border/subtle", 1);
  const rbtn = (name: string, active = false, dot = false): FrameNode => {
    const b = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    b.resize(40, 40);
    b.primaryAxisSizingMode = "FIXED";
    b.counterAxisSizingMode = "FIXED";
    b.cornerRadius = RADII.md;
    b.clipsContent = false;
    if (active) fillToken(t, b, "bg/surface-raised");
    b.appendChild(icon(t, name, 20, active ? "text/primary" : "text/muted"));
    if (dot) {
      const d = ellipse(9);
      fillToken(t, d, "feedback/success");
      d.strokes = [];
      b.appendChild(d);
      d.layoutPositioning = "ABSOLUTE";
      d.x = 26;
      d.y = 3;
    }
    return b;
  };
  rail.appendChild(rbtn("message-circle", true));
  rail.appendChild(rbtn("phone"));
  rail.appendChild(rbtn("radio", false, true));
  const div = rect(26, 1);
  fillToken(t, div, "border/subtle");
  rail.appendChild(div);
  rail.appendChild(rbtn("archive"));
  rail.appendChild(rbtn("star"));
  const sp = rect(1, 1);
  sp.fills = [];
  sp.layoutGrow = 1;
  rail.appendChild(sp);
  rail.appendChild(rbtn("image"));
  rail.appendChild(rbtn("settings"));
  canv.appendChild(rail);
  const props: PropRow[] = [
    {
      prop: "items",
      type: "{ icon, badge? }[]",
      def: "—",
      note: ["Top nav destinations.", ""],
    },
    {
      prop: "active",
      type: "string",
      def: "—",
      note: ["Selected item (raised).", ""],
    },
    {
      prop: "footer",
      type: "{ icon }[]",
      def: "—",
      note: ["Bottom-pinned (media, settings).", ""],
    },
  ];
  return componentBoard(
    t,
    "Nav Rail",
    ["Thin icon rail for app sections", ""],
    ["Labeled nav → use Tabs / Sidebar", "→ Tabs / Sidebar"],
    [await block(t, "Rail", canv)],
    props,
  );
}

async function voiceMsg(
  t: ThemeContext,
  side: "in" | "out",
  dur: string,
  time: string,
): Promise<FrameNode> {
  const wrap = autoFrame({ direction: "VERTICAL", gap: 4 });
  wrap.layoutAlign = side === "out" ? "MAX" : "MIN";
  wrap.counterAxisAlignItems = side === "out" ? "MAX" : "MIN";
  const out = side === "out";
  const b = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [10, 14] });
  b.cornerRadius = RADII.lg;
  if (out) {
    fillToken(t, b, "accent/primary");
    b.bottomRightRadius = 4;
  } else {
    fillToken(t, b, "bg/surface-raised");
    strokeToken(t, b, "border/subtle", 1);
    b.bottomLeftRadius = 4;
  }
  b.appendChild(
    circleIcon(
      t,
      30,
      "play",
      out ? "accent/contrast" : "accent/primary",
      out ? "accent/primary" : "accent/contrast",
    ),
  );
  const wave = autoFrame({ direction: "HORIZONTAL", gap: 2, cross: "CENTER" });
  for (const h of [8, 14, 20, 10, 24, 16, 28, 12, 20, 8, 18, 26, 14, 22, 10, 16, 24, 12, 18, 8]) {
    const barr = rect(2.5, h, 1.25);
    barr.fills = [
      out
        ? ({ ...solid("#0A0A0B"), opacity: 0.5 } as SolidPaint)
        : ({ ...solid("#5EE6C1"), opacity: 0.85 } as SolidPaint),
    ];
    wave.appendChild(barr);
  }
  b.appendChild(wave);
  b.appendChild(await makeText(t, "caption", dur, out ? "accent/contrast" : "text/muted"));
  wrap.appendChild(b);
  wrap.appendChild(await makeText(t, "caption", time, "text/muted"));
  return wrap;
}

async function chatBubbleBoard(t: ThemeContext): Promise<FrameNode> {
  const canv = canvas(t);
  const thread = autoFrame({ direction: "VERTICAL", gap: 14 });
  thread.resize(CANVAS_INNER, thread.height);
  thread.counterAxisSizingMode = "FIXED";
  thread.appendChild(
    await chatBubble(t, "in", "Hey! Just saw the Parametric EQ — the drag glow is 🔥", "14:02"),
  );
  thread.appendChild(
    await chatBubble(
      t,
      "out",
      "Thanks! The isolated band curve took a while to get right.",
      "14:03",
    ),
  );
  thread.appendChild(await chatBubble(t, "in", "Can I reuse it in my project?", "14:04"));
  thread.appendChild(await voiceMsg(t, "out", "0:14", "14:04"));
  thread.appendChild(await typingBubble(t));
  canv.appendChild(thread);

  const vCanvas = canvas(t);
  const vthread = autoFrame({ direction: "VERTICAL", gap: 14 });
  vthread.resize(CANVAS_INNER, vthread.height);
  vthread.counterAxisSizingMode = "FIXED";
  vthread.appendChild(await voiceMsg(t, "in", "0:22", "14:05"));
  vthread.appendChild(await voiceMsg(t, "out", "0:14", "14:06"));
  vCanvas.appendChild(vthread);

  const props: PropRow[] = [
    {
      prop: "side",
      type: "in | out",
      def: "in",
      note: ["Incoming or your message.", ""],
    },
    {
      prop: "kind",
      type: "text | voice",
      def: "text",
      note: ["Text bubble or voice note.", ""],
    },
    {
      prop: "audio",
      type: "{ url, duration }",
      def: "—",
      note: ["Waveform + play button.", "play."],
    },
    {
      prop: "status",
      type: "sent | delivered | read",
      def: "sent",
      note: ["Delivery receipt.", ""],
    },
    {
      prop: "typing",
      type: "boolean",
      def: "false",
      note: ["Animated 3-dot bubble.", ""],
    },
  ];
  return componentBoard(
    t,
    "Message Bubble",
    ["Chat messages — text & voice notes", ""],
    ["Long-form content → use a Card", "→ Card"],
    [await block(t, "Conversation", canv), await block(t, "Voice message", vCanvas)],
    props,
  );
}

async function conversationItem(
  t: ThemeContext,
  name: string,
  preview: string,
  time: string,
  unread: number,
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [10, 12] });
  row.resize(560, row.height);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.cornerRadius = RADII.lg;
  if (unread) fillToken(t, row, "bg/surface-raised");
  row.appendChild(await initialsAvatar(t, name, 40));
  const mid = autoFrame({ direction: "VERTICAL", gap: 2 });
  mid.layoutGrow = 1;
  mid.appendChild(await makeText(t, "label/md", name, "text/primary"));
  mid.appendChild(
    await makeText(t, "body/sm", preview, unread ? "text/secondary" : "text/muted", {
      maxWidth: 380,
    }),
  );
  row.appendChild(mid);
  const right = autoFrame({ direction: "VERTICAL", gap: 6, cross: "MAX" });
  right.appendChild(await makeText(t, "caption", time, "text/muted"));
  if (unread)
    right.appendChild(await drawBadge(t, { label: String(unread), tone: "accent/primary" }));
  row.appendChild(right);
  return row;
}

async function chatComposerBoard(t: ThemeContext): Promise<FrameNode> {
  const compCanvas = canvas(t);
  const bar = autoFrame({
    direction: "HORIZONTAL",
    gap: 10,
    cross: "CENTER",
    padding: [8, 10],
  });
  bar.resize(560, bar.height);
  bar.primaryAxisSizingMode = "FIXED";
  bar.counterAxisSizingMode = "AUTO";
  bar.cornerRadius = RADII.full;
  fillToken(t, bar, "bg/surface");
  strokeToken(t, bar, "border/default", 1);
  bar.appendChild(icon(t, "paperclip", 18, "text/muted"));
  const inp = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
  inp.layoutGrow = 1;
  inp.appendChild(await makeText(t, "body/md", "Message…", "text/muted"));
  bar.appendChild(inp);
  bar.appendChild(icon(t, "smile", 18, "text/muted"));
  const send = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  send.resize(36, 36);
  send.primaryAxisSizingMode = "FIXED";
  send.counterAxisSizingMode = "FIXED";
  send.cornerRadius = RADII.full;
  fillToken(t, send, "accent/primary");
  send.appendChild(icon(t, "arrow-up", 18, "accent/contrast"));
  bar.appendChild(send);
  compCanvas.appendChild(bar);

  const listCanvas = canvas(t);
  const list = autoFrame({ direction: "VERTICAL", gap: 6 });
  list.appendChild(
    await conversationItem(t, "Alex Rivera", "Sounds great, ping me tomorrow 👋", "14:20", 2),
  );
  list.appendChild(await conversationItem(t, "Mika Chen", "You: pushed the fix", "13:05", 0));
  list.appendChild(await conversationItem(t, "Sam Okoro", "Typing…", "Mon", 0));
  listCanvas.appendChild(list);

  // recording an audio message
  const recCanvas = canvas(t);
  const rec = autoFrame({
    direction: "HORIZONTAL",
    gap: 12,
    cross: "CENTER",
    padding: [8, 12],
  });
  rec.resize(560, rec.height);
  rec.primaryAxisSizingMode = "FIXED";
  rec.counterAxisSizingMode = "AUTO";
  rec.cornerRadius = RADII.full;
  fillToken(t, rec, "bg/surface");
  strokeToken(t, rec, "accent/primary", 1.5);
  await applyEffect(rec, "glow/hover", t);
  const cancel = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: 4,
  });
  cancel.appendChild(icon(t, "trash", 18, "feedback/danger"));
  rec.appendChild(cancel);
  const dg = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  const dot = ellipse(9);
  fillToken(t, dot, "feedback/danger");
  dot.strokes = [];
  dg.appendChild(dot);
  dg.appendChild(await makeText(t, "body/sm", "0:07", "text/primary"));
  rec.appendChild(dg);
  const rwave = autoFrame({ direction: "HORIZONTAL", gap: 2, cross: "CENTER" });
  for (const h of [10, 18, 26, 14, 22, 8, 20, 28, 12, 18, 24, 10, 16, 22, 12, 20]) {
    const barr = rect(2.5, h, 1.25);
    fillToken(t, barr, "accent/primary");
    barr.opacity = 0.85;
    rwave.appendChild(barr);
  }
  rec.appendChild(rwave);
  const rspacer = rect(1, 1);
  rspacer.fills = [];
  rspacer.layoutGrow = 1;
  rec.appendChild(rspacer);
  rec.appendChild(circleIcon(t, 34, "arrow-up", "accent/primary", "accent/contrast"));
  recCanvas.appendChild(rec);

  const props: PropRow[] = [
    { prop: "onSend", type: "(text)=>void", def: "—", note: ["Fires on send.", ""] },
    {
      prop: "attachments",
      type: "boolean",
      def: "true",
      note: ["Paperclip + emoji.", ""],
    },
    {
      prop: "voice",
      type: "boolean",
      def: "true",
      note: ["Hold to record an audio note.", ""],
    },
    {
      prop: "conversations",
      type: "Chat[]",
      def: "[]",
      note: ["List: avatar, preview, unread.", ""],
    },
  ];
  return componentBoard(
    t,
    "Chat Composer",
    ["Message input, voice notes & chat list", ""],
    ["A one-off note → use Text Field", "→ Text Field"],
    [
      await block(t, "Composer", compCanvas),
      await block(t, "Recording", recCanvas),
      await block(t, "Conversations", listCanvas),
    ],
    props,
  );
}

// ══ AI components ═════════════════════════════════════════════
function circleIcon(
  t: ThemeContext,
  d: number,
  iconName: string,
  bgToken: string,
  iconTone: string,
): FrameNode {
  const f = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  f.resize(d, d);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = RADII.full;
  fillToken(t, f, bgToken);
  f.appendChild(icon(t, iconName, Math.round(d * 0.55), iconTone));
  return f;
}

function aiIconBtn(t: ThemeContext, name: string): FrameNode {
  const b = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER", padding: 8 });
  b.cornerRadius = RADII.full;
  b.appendChild(icon(t, name, 18, "text/secondary"));
  return b;
}

async function aiComposerBox(
  t: ThemeContext,
  opts: { focus?: boolean; firstLine?: FrameNode } = {},
): Promise<FrameNode> {
  const box = autoFrame({ direction: "VERTICAL", gap: 22, padding: 16 });
  box.resize(680, box.height);
  box.counterAxisSizingMode = "FIXED";
  box.cornerRadius = RADII.xl;
  fillToken(t, box, "bg/surface");
  if (opts.focus) {
    strokeToken(t, box, "state/focus", 1.5);
    await applyEffect(box, "glow/accent", t);
  } else strokeToken(t, box, "border/default", 1);
  box.appendChild(
    opts.firstLine ??
      (await makeText(t, "body/md", "Ask anything…", "text/muted", { maxWidth: 648 })),
  );
  const bar = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", align: "SPACE_BETWEEN" });
  bar.resize(648, bar.height);
  bar.primaryAxisSizingMode = "FIXED";
  bar.counterAxisSizingMode = "AUTO";
  const lg = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  lg.appendChild(aiIconBtn(t, "plus"));
  const sPill = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER", padding: [6, 12] });
  sPill.cornerRadius = RADII.full;
  fillToken(t, sPill, "bg/surface-raised");
  strokeToken(t, sPill, "border/subtle", 1);
  sPill.appendChild(icon(t, "search", 15, "text/secondary"));
  sPill.appendChild(await makeText(t, "label/sm", "Search", "text/primary"));
  sPill.appendChild(icon(t, "chevron-down", 13, "text/muted"));
  lg.appendChild(sPill);
  lg.appendChild(aiIconBtn(t, "book-open"));
  bar.appendChild(lg);
  const rg = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  const model = autoFrame({ direction: "HORIZONTAL", gap: 5, cross: "CENTER", padding: [6, 8] });
  model.appendChild(await makeText(t, "body/md", "Model", "text/secondary"));
  model.appendChild(icon(t, "chevron-down", 15, "text/muted"));
  rg.appendChild(model);
  rg.appendChild(aiIconBtn(t, "mic"));
  rg.appendChild(circleIcon(t, 36, "arrow-up", "accent/primary", "accent/contrast"));
  bar.appendChild(rg);
  box.appendChild(bar);
  return box;
}

async function aiPromptBoard(t: ThemeContext): Promise<FrameNode> {
  const canv = canvas(t);
  canv.appendChild(await aiComposerBox(t));

  // Search / Knowledge mode toggle
  const modeCanvas = canvas(t);
  const modeWrap = autoFrame({ direction: "HORIZONTAL", align: "CENTER" });
  modeWrap.resize(CANVAS_INNER, modeWrap.height);
  modeWrap.primaryAxisSizingMode = "FIXED";
  modeWrap.counterAxisSizingMode = "AUTO";
  modeWrap.appendChild(
    await drawSegmented(t, [
      { icon: "search", label: "Search", active: true },
      { icon: "book-open", label: "Knowledge" },
    ]),
  );
  modeCanvas.appendChild(modeWrap);

  // Slash / MCP menu
  const slashCanvas = canvas(t);
  const stage = figma.createFrame();
  stage.name = "slash";
  stage.fills = [];
  stage.clipsContent = false;
  stage.resize(680, 360);
  const line = autoFrame({ direction: "HORIZONTAL", gap: 2, cross: "CENTER" });
  line.appendChild(await makeText(t, "body/md", "/apple-music", "accent/primary"));
  const caret = rect(1.5, 18);
  fillToken(t, caret, "accent/primary");
  line.appendChild(caret);
  const sbox = await aiComposerBox(t, { focus: true, firstLine: line });
  stage.appendChild(sbox);
  sbox.x = 0;
  sbox.y = 0;
  const smenu = autoFrame({ direction: "VERTICAL", gap: 1, padding: 6 });
  smenu.resize(320, smenu.height);
  smenu.counterAxisSizingMode = "FIXED";
  smenu.cornerRadius = RADII.lg;
  fillToken(t, smenu, "bg/surface-raised");
  strokeToken(t, smenu, "border/subtle", 1);
  await applyEffect(smenu, "shadow/lg", t);
  const gl = autoFrame({ direction: "HORIZONTAL", padding: [6, 10] });
  gl.appendChild(await makeText(t, "overline", "MCP servers", "text/muted"));
  smenu.appendChild(gl);
  const mcp: Array<[string, string, string, boolean]> = [
    ["audio-lines", "/apple-music", "Generate & save playlists", true],
    ["github", "/github", "Repos, issues, PRs", false],
    ["mail", "/gmail", "Search & draft mail", false],
    ["file", "/notion", "Pages & databases", false],
    ["layers", "/figma", "Files & frames", false],
  ];
  for (const [ic, cmd, desc, hi] of mcp) {
    const r = autoFrame({ direction: "HORIZONTAL", gap: 11, cross: "CENTER", padding: [8, 10] });
    r.resize(308, r.height);
    r.primaryAxisSizingMode = "FIXED";
    r.counterAxisSizingMode = "AUTO";
    r.cornerRadius = RADII.md;
    if (hi) r.fills = [{ ...solid("#FFFFFF"), opacity: 0.06 } as SolidPaint];
    r.appendChild(icon(t, ic, 17, hi ? "accent/primary" : "text/secondary"));
    const mid = autoFrame({ direction: "VERTICAL", gap: 1 });
    mid.layoutGrow = 1;
    mid.appendChild(await makeText(t, "label/md", cmd, "text/primary"));
    mid.appendChild(await makeText(t, "caption", desc, "text/muted"));
    r.appendChild(mid);
    smenu.appendChild(r);
  }
  stage.appendChild(smenu);
  smenu.x = 0;
  smenu.y = sbox.height + 8;
  slashCanvas.appendChild(stage);

  // MCP result: generated playlist
  const plCanvas = canvas(t);
  const card = autoFrame({ direction: "VERTICAL", gap: 14, padding: 18 });
  card.resize(560, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.lg;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  const chead = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  chead.resize(560 - 36, chead.height);
  chead.primaryAxisSizingMode = "FIXED";
  chead.counterAxisSizingMode = "AUTO";
  chead.appendChild(circleIcon(t, 36, "audio-lines", "accent/primary", "accent/contrast"));
  const ct = autoFrame({ direction: "VERTICAL", gap: 1 });
  ct.layoutGrow = 1;
  ct.appendChild(await makeText(t, "label/md", "Late-night coding", "text/primary"));
  ct.appendChild(await makeText(t, "caption", "Apple Music · 12 tracks · 48 min", "text/muted"));
  chead.appendChild(ct);
  const save = autoFrame({ direction: "HORIZONTAL", gap: 7, cross: "CENTER", padding: [8, 14] });
  save.cornerRadius = RADII.full;
  fillToken(t, save, "accent/primary");
  save.appendChild(icon(t, "plus", 15, "accent/contrast"));
  save.appendChild(await makeText(t, "label/sm", "Save", "accent/contrast"));
  chead.appendChild(save);
  card.appendChild(chead);
  card.appendChild(hairline(t, 560 - 36));
  const tracks: Array<[string, string, string]> = [
    ["Nightcall", "Kavinsky", "4:18"],
    ["Resonance", "Home", "3:32"],
    ["Midnight City", "M83", "4:03"],
    ["Instant Crush", "Daft Punk", "5:37"],
  ];
  let ti = 1;
  for (const [title, artist, dur] of tracks) {
    const tr = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
    tr.resize(560 - 36, tr.height);
    tr.primaryAxisSizingMode = "FIXED";
    tr.counterAxisSizingMode = "AUTO";
    tr.appendChild(await makeText(t, "caption", String(ti), "text/muted"));
    const tc = autoFrame({ direction: "VERTICAL", gap: 0 });
    tc.layoutGrow = 1;
    tc.appendChild(await makeText(t, "body/sm", title, "text/primary"));
    tc.appendChild(await makeText(t, "caption", artist, "text/muted"));
    tr.appendChild(tc);
    tr.appendChild(await makeText(t, "caption", dur, "text/muted"));
    card.appendChild(tr);
    ti++;
  }
  plCanvas.appendChild(card);

  // Voice input
  const voiceCanvas = canvas(t);
  const voiceRow = autoFrame({ direction: "HORIZONTAL", gap: 40, cross: "CENTER" });
  const micIdle = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: 11,
  });
  micIdle.cornerRadius = RADII.full;
  strokeToken(t, micIdle, "border/default", 1);
  micIdle.appendChild(icon(t, "mic", 20, "text/secondary"));
  voiceRow.appendChild(micIdle);
  const listen = autoFrame({
    direction: "HORIZONTAL",
    gap: 12,
    cross: "CENTER",
    padding: [8, 10],
  });
  listen.cornerRadius = RADII.full;
  fillToken(t, listen, "bg/surface-raised");
  strokeToken(t, listen, "accent/primary", 1.5);
  await applyEffect(listen, "glow/hover", t);
  listen.appendChild(icon(t, "mic", 18, "accent/primary"));
  const wave = autoFrame({ direction: "HORIZONTAL", gap: 3, cross: "CENTER" });
  for (const hh of [10, 18, 26, 14, 22, 8, 20, 28, 12, 18, 24, 10, 16, 22]) {
    const barr = rect(3, hh, 1.5);
    fillToken(t, barr, "accent/primary");
    barr.opacity = 0.85;
    wave.appendChild(barr);
  }
  listen.appendChild(wave);
  listen.appendChild(await makeText(t, "label/sm", "Listening…", "text/secondary"));
  const stopBtn = circleIcon(t, 28, "x", "accent/primary", "accent/contrast");
  listen.appendChild(stopBtn);
  voiceRow.appendChild(listen);
  voiceCanvas.appendChild(voiceRow);

  // Model selector menu
  const modelCanvas = canvas(t);
  const menu = autoFrame({ direction: "VERTICAL", gap: 1, padding: 6 });
  menu.resize(320, menu.height);
  menu.counterAxisSizingMode = "FIXED";
  menu.cornerRadius = RADII.lg;
  fillToken(t, menu, "bg/surface-raised");
  strokeToken(t, menu, "border/subtle", 1);
  await applyEffect(menu, "shadow/lg", t);
  const badgePill = async (label: string, kind: "new" | "max"): Promise<FrameNode> => {
    const b = autoFrame({
      direction: "HORIZONTAL",
      align: "CENTER",
      cross: "CENTER",
      padding: [1, 7],
    });
    b.cornerRadius = RADII.full;
    if (kind === "new") b.fills = [tokenAlpha("accent/primary", 0.18)];
    else {
      fillToken(t, b, "bg/inset");
      strokeToken(t, b, "border/subtle", 1);
    }
    b.appendChild(
      await makeText(t, "caption", label, kind === "new" ? "accent/primary" : "text/muted"),
    );
    return b;
  };
  const mrow = async (
    ic: string,
    name: string,
    o: { desc?: string; badge?: [string, "new" | "max"]; locked?: boolean; active?: boolean },
  ): Promise<FrameNode> => {
    const r = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [9, 12] });
    r.resize(308, r.height);
    r.primaryAxisSizingMode = "FIXED";
    r.counterAxisSizingMode = "AUTO";
    r.cornerRadius = RADII.md;
    if (o.active) r.fills = [{ ...solid("#FFFFFF"), opacity: 0.06 } as SolidPaint];
    r.appendChild(icon(t, ic, 18, o.locked ? "text/muted" : "text/secondary"));
    const mid = autoFrame({ direction: "VERTICAL", gap: 1 });
    mid.layoutGrow = 1;
    const nameRow = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
    nameRow.appendChild(
      await makeText(t, "body/md", name, o.locked ? "text/muted" : "text/primary"),
    );
    if (o.badge) nameRow.appendChild(await badgePill(o.badge[0], o.badge[1]));
    mid.appendChild(nameRow);
    if (o.desc) mid.appendChild(await makeText(t, "caption", o.desc, "text/muted"));
    r.appendChild(mid);
    if (o.active) r.appendChild(icon(t, "check", 16, "accent/primary"));
    else if (o.locked) r.appendChild(icon(t, "lock", 15, "text/muted"));
    return r;
  };
  menu.appendChild(
    await mrow("sparkles", "Best", { desc: "Selects the best available model", active: true }),
  );
  const msep = rect(308 - 8, 1);
  fillToken(t, msep, "border/subtle");
  const msw = autoFrame({ direction: "VERTICAL", padding: [5, 4] });
  msw.appendChild(msep);
  menu.appendChild(msw);
  menu.appendChild(await mrow("star", "Claude Sonnet 5", {}));
  menu.appendChild(await mrow("star", "Claude Opus 4.8", { badge: ["Max", "max"], locked: true }));
  menu.appendChild(await mrow("layers", "Fable 5", { badge: ["New", "new"] }));
  menu.appendChild(await mrow("grid", "GPT-5.6", { badge: ["New", "new"] }));
  menu.appendChild(await mrow("star", "Claude Haiku 4.5", {}));
  modelCanvas.appendChild(menu);

  const sugCanvas = canvas(t);
  const sug = autoFrame({ direction: "HORIZONTAL", gap: 10, wrap: true, cross: "MIN" });
  sug.resize(CANVAS_INNER, sug.height);
  sug.primaryAxisSizingMode = "FIXED";
  sug.counterAxisSizingMode = "AUTO";
  sug.counterAxisSpacing = 10;
  const chips: Array<[string, string]> = [
    ["sparkles", "Summarize this page"],
    ["pencil", "Draft a reply"],
    ["file", "Explain this code"],
    ["star", "Brainstorm names"],
  ];
  for (const [ic, label] of chips) {
    const c = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [8, 13] });
    c.cornerRadius = RADII.full;
    fillToken(t, c, "bg/surface");
    strokeToken(t, c, "border/subtle", 1);
    c.appendChild(icon(t, ic, 14, "accent/primary"));
    c.appendChild(await makeText(t, "label/sm", label, "text/secondary"));
    sug.appendChild(c);
  }
  sugCanvas.appendChild(sug);

  const props: PropRow[] = [
    {
      prop: "value",
      type: "string",
      def: "—",
      note: ["Prompt text (multi-line).", ""],
    },
    {
      prop: "model",
      type: "Model",
      def: "—",
      note: ["Selectable model + lock/badges.", ""],
    },
    {
      prop: "mode",
      type: "search | knowledge",
      def: "search",
      note: ["Retrieval source toggle.", ""],
    },
    {
      prop: "commands",
      type: "SlashCommand[]",
      def: "[]",
      note: ["Type / to run an MCP server.", "/ — MCP-."],
    },
    {
      prop: "voice",
      type: "boolean",
      def: "true",
      note: ["Dictate by voice (mic).", ""],
    },
    {
      prop: "attachments",
      type: "File[]",
      def: "[]",
      note: ["Files / images.", ""],
    },
    {
      prop: "onSubmit",
      type: "(prompt)=>void",
      def: "—",
      note: ["Send to the model.", ""],
    },
  ];
  return componentBoard(
    t,
    "AI Prompt",
    ["Perplexity-style prompt with tools & MCP", "Perplexity: MCP"],
    ["Plain field → use Text Area", "→ Text Area"],
    [
      await block(t, "Composer", canv),
      await block(t, "Search / Knowledge", modeCanvas),
      await block(t, "Slash", slashCanvas),
      await block(t, "MCP result", plCanvas),
      await block(t, "Voice input", voiceCanvas),
      await block(t, "Model selector", modelCanvas),
      await block(t, "Suggestions", sugCanvas),
    ],
    props,
  );
}

async function aiAnswerBoard(t: ThemeContext): Promise<FrameNode> {
  const canv = canvas(t);
  const row = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "MIN" });
  row.resize(CANVAS_INNER, row.height);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.appendChild(circleIcon(t, 32, "sparkles", "accent/primary", "accent/contrast"));
  const content = autoFrame({ direction: "VERTICAL", gap: 12 });
  content.layoutGrow = 1;
  content.appendChild(
    await makeText(
      t,
      "body/md",
      "The Parametric EQ boosts presence around 3 kHz and rolls off sub-bass below 40 Hz. Drag any node to reshape the response curve in real time. ▍",
      "text/primary",
      { maxWidth: 660 },
    ),
  );
  const cites = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  const cite = async (n: string, src: string): Promise<FrameNode> => {
    const c = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER", padding: [4, 9] });
    c.cornerRadius = RADII.full;
    fillToken(t, c, "bg/inset");
    strokeToken(t, c, "border/subtle", 1);
    c.appendChild(await makeText(t, "caption", n, "accent/primary"));
    c.appendChild(await makeText(t, "caption", src, "text/muted"));
    return c;
  };
  cites.appendChild(await cite("1", "eq-manual.pdf"));
  cites.appendChild(await cite("2", "fabfilter.com"));
  content.appendChild(cites);
  const acts = autoFrame({ direction: "HORIZONTAL", gap: 4, cross: "CENTER" });
  for (const ic of ["copy", "refresh-cw", "thumbs-up", "thumbs-down"]) {
    const b = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER", padding: 6 });
    b.cornerRadius = RADII.md;
    b.appendChild(icon(t, ic, 16, "text/muted"));
    acts.appendChild(b);
  }
  content.appendChild(acts);
  row.appendChild(content);
  canv.appendChild(row);
  const props: PropRow[] = [
    {
      prop: "content",
      type: "Markdown",
      def: "—",
      note: ["Streamed answer (caret while typing).", ""],
    },
    {
      prop: "citations",
      type: "Source[]",
      def: "[]",
      note: ["Numbered source chips.", ""],
    },
    {
      prop: "actions",
      type: "copy | retry | rate",
      def: "—",
      note: ["Copy · regenerate · 👍👎.", ""],
    },
    {
      prop: "streaming",
      type: "boolean",
      def: "false",
      note: ["Show typing caret.", ""],
    },
  ];
  return componentBoard(
    t,
    "AI Answer",
    ["Streamed assistant reply with sources", ""],
    ["Static text → use a Card", "→ Card"],
    [await block(t, "Assistant message", canv)],
    props,
  );
}

// ── Category painting ─────────────────────────────────────────
// ── Spinner ───────────────────────────────────────────────────

type SpinKind = "ring" | "comet" | "dots";

const SPIN_D: Record<Size, number> = { sm: 20, md: 28, lg: 40 };

function spinnerRing(
  t: ThemeContext,
  d: number,
  token: string,
  opts: { track?: boolean; trail?: boolean } = {},
): FrameNode {
  const f = figma.createFrame();
  f.name = "spinner/ring";
  f.resize(d, d);
  f.fills = [];
  f.clipsContent = false;
  const inner = 1 - Math.max(2.5, d * 0.12) / (d / 2);
  if (opts.track !== false) {
    const track = ellipse(d);
    track.arcData = { startingAngle: 0, endingAngle: Math.PI * 2, innerRadius: inner };
    track.fills = [tokenAlpha(token, 0.14)];
    f.appendChild(track);
  }
  if (opts.trail) {
    const trail = ellipse(d);
    trail.arcData = {
      startingAngle: -Math.PI / 2 + Math.PI * 0.55,
      endingAngle: -Math.PI / 2 + Math.PI * 1.15,
      innerRadius: inner,
    };
    trail.fills = [tokenAlpha(token, 0.35)];
    f.appendChild(trail);
  }
  const arc = ellipse(d);
  arc.arcData = {
    startingAngle: -Math.PI / 2,
    endingAngle: -Math.PI / 2 + Math.PI * 0.55,
    innerRadius: inner,
  };
  fillToken(t, arc, token);
  if (opts.trail) {
    const c = solid(TOKEN_HEX[token] ?? "#5EE6C1").color;
    arc.effects = [
      {
        type: "DROP_SHADOW",
        color: { ...c, a: 0.5 },
        offset: { x: 0, y: 0 },
        radius: 8,
        spread: 0,
        visible: true,
        blendMode: "NORMAL",
      } as DropShadowEffect,
    ];
  }
  f.appendChild(arc);
  return f;
}

function spinnerDots(t: ThemeContext, d: number, token: string): FrameNode {
  const dot = Math.max(5, Math.round(d * 0.28));
  const f = autoFrame({
    direction: "HORIZONTAL",
    gap: Math.round(dot * 0.6),
    cross: "CENTER",
    name: "spinner/dots",
  });
  for (const op of [1, 0.55, 0.25]) {
    const e = ellipse(dot);
    fillToken(t, e, token);
    e.opacity = op;
    f.appendChild(e);
  }
  return f;
}

function drawSpinner(
  t: ThemeContext,
  kind: SpinKind,
  size: Size,
  token = "accent/primary",
): FrameNode {
  const d = SPIN_D[size];
  if (kind === "dots") return spinnerDots(t, d, token);
  if (kind === "comet") return spinnerRing(t, d, token, { track: false, trail: true });
  return spinnerRing(t, d, token);
}

async function spinnerBoard(t: ThemeContext): Promise<FrameNode> {
  const rows: Array<{ header: string; cells: SceneNode[] }> = [];
  for (const k of ["Ring", "Comet", "Dots"] as const) {
    const cells: SceneNode[] = [];
    for (const s of ["sm", "md", "lg"] as Size[])
      cells.push(drawSpinner(t, k.toLowerCase() as SpinKind, s));
    rows.push({ header: k, cells });
  }
  const kinds = await matrix(t, ["sm · 20", "md · 28", "lg · 40"], rows, 150, 130);

  const tones = await tileGrid(
    t,
    [
      { label: ["Mint", ""], node: drawSpinner(t, "ring", "md", "accent/primary") },
      { label: ["Dante", ""], node: drawSpinner(t, "comet", "md", "accent/dante") },
      { label: ["Indigo", ""], node: drawSpinner(t, "ring", "md", "accent/secondary") },
      { label: ["Danger", ""], node: drawSpinner(t, "comet", "md", "feedback/danger") },
    ],
    150,
  );

  const btn = autoFrame({
    direction: "HORIZONTAL",
    gap: 10,
    align: "CENTER",
    cross: "CENTER",
    padding: [10, 20],
  });
  btn.cornerRadius = RADII.full;
  fillToken(t, btn, "bg/surface-raised");
  strokeToken(t, btn, "border/subtle", 1);
  btn.appendChild(drawSpinner(t, "ring", "sm"));
  btn.appendChild(await makeText(t, "label/md", "Saving…", "text/secondary"));

  const inline = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  inline.appendChild(drawSpinner(t, "comet", "sm", "accent/dante"));
  inline.appendChild(await makeText(t, "body/sm", "Loading tracks…", "text/secondary"));

  const panel = autoFrame({ direction: "VERTICAL", gap: 12, align: "CENTER", cross: "CENTER" });
  panel.resize(280, 150);
  panel.primaryAxisSizingMode = "FIXED";
  panel.counterAxisSizingMode = "FIXED";
  panel.cornerRadius = RADII.lg;
  fillToken(t, panel, "bg/surface");
  strokeToken(t, panel, "border/subtle", 1);
  panel.appendChild(drawSpinner(t, "ring", "md"));
  panel.appendChild(await makeText(t, "caption", "Loading library…", "text/muted"));

  const context = await tileGrid(
    t,
    [
      { label: ["In button", ""], node: btn },
      { label: ["Inline", ""], node: inline },
      { label: ["Panel", ""], node: panel },
    ],
    300,
  );

  const props: PropRow[] = [
    {
      prop: "variant",
      type: "ring | comet | dots",
      def: "ring",
      note: ["Comet adds a glowing tail.", "Comet — ."],
    },
    {
      prop: "size",
      type: "sm | md | lg",
      def: "md",
      note: ["20 / 28 / 40 px.", "20 / 28 / 40 px."],
    },
    {
      prop: "tone",
      type: "token",
      def: "accent/primary",
      note: ["Any accent or feedback token.", "accent/feedback ."],
    },
    {
      prop: "track",
      type: "boolean",
      def: "true",
      note: ["Faint full circle under the arc.", ""],
    },
    {
      prop: "label",
      type: "string",
      def: "—",
      note: ["Accessible text next to it.", "(a11y)."],
    },
  ];
  return componentBoard(
    t,
    "Spinner",
    ["Short indeterminate waits", ""],
    ["Known progress → use Progress", "→ Progress"],
    [
      await block(t, "Variants × sizes", kinds),
      await block(t, "Tones", tones),
      await block(t, "In context", context),
    ],
    props,
  );
}

// ── Empty state ───────────────────────────────────────────────

interface EmptyOpts {
  icon: string;
  tone?: string;
  title: string;
  body: string;
  primary?: string;
  secondary?: string;
  cosmic?: boolean;
  w?: number;
}

function emptyHalo(t: ThemeContext, iconName: string, tone: string, cosmic: boolean): FrameNode {
  const f = figma.createFrame();
  f.name = "empty/halo";
  f.resize(96, 84);
  f.fills = [];
  f.clipsContent = false;
  const glow = ellipse(84);
  glow.fills = [tokenAlpha(tone, 0.08)];
  f.appendChild(glow);
  glow.x = 6;
  glow.y = 0;
  const core = severityIcon(t, { icon: iconName, tone, shape: "circle", size: "lg" });
  f.appendChild(core);
  core.x = 20;
  core.y = 14;
  if (cosmic) {
    const s1 = starStreak(TOKEN_HEX[tone] ?? "#5EE6C1", 52, -28);
    f.appendChild(s1);
    s1.x = 54;
    s1.y = 0;
    const d1 = ellipse(3);
    d1.fills = [solid("#FFFFFF")];
    d1.opacity = 0.7;
    f.appendChild(d1);
    d1.x = 10;
    d1.y = 18;
    const d2 = ellipse(2);
    d2.fills = [solid("#5EE6C1")];
    d2.opacity = 0.6;
    f.appendChild(d2);
    d2.x = 86;
    d2.y = 60;
  }
  return f;
}

async function drawEmptyState(t: ThemeContext, o: EmptyOpts): Promise<FrameNode> {
  const w = o.w ?? 300;
  const tone = o.tone ?? "accent/primary";
  const f = autoFrame({ direction: "VERTICAL", gap: 8, cross: "CENTER", padding: [28, 20] });
  f.resize(w, f.height);
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = RADII.xl;
  fillToken(t, f, "bg/surface");
  strokeToken(t, f, "border/subtle", 1);
  f.appendChild(emptyHalo(t, o.icon, tone, o.cosmic ?? false));
  f.appendChild(
    await makeText(t, "heading/h4", o.title, "text/primary", { align: "CENTER", maxWidth: w - 40 }),
  );
  f.appendChild(
    await makeText(t, "body/sm", o.body, "text/secondary", { align: "CENTER", maxWidth: w - 48 }),
  );
  if (o.primary || o.secondary) {
    const actions = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
    actions.paddingTop = 10;
    if (o.secondary)
      actions.appendChild(await drawButton(t, "Ghost", "Default", "sm", "pill", o.secondary));
    if (o.primary)
      actions.appendChild(await drawButton(t, "Primary", "Default", "sm", "pill", o.primary));
    f.appendChild(actions);
  }
  return f;
}

async function drawEmptyCompact(t: ThemeContext, w: number): Promise<FrameNode> {
  const row = fixedCol(w, "HORIZONTAL");
  row.itemSpacing = 14;
  row.counterAxisAlignItems = "CENTER";
  row.paddingTop = row.paddingBottom = 14;
  row.paddingLeft = row.paddingRight = 16;
  row.cornerRadius = RADII.lg;
  fillToken(t, row, "bg/surface");
  strokeToken(t, row, "border/subtle", 1);
  row.appendChild(
    severityIcon(t, { icon: "search", tone: "accent/secondary", shape: "rounded", size: "sm" }),
  );
  const col = autoFrame({ direction: "VERTICAL", gap: 2 });
  col.appendChild(await makeText(t, "label/md", "Nothing matches your filters", "text/primary"));
  col.appendChild(
    await makeText(t, "caption", "Try fewer filters or a different query", "text/muted"),
  );
  row.appendChild(col);
  col.layoutGrow = 1;
  row.appendChild(await drawButton(t, "Soft", "Default", "sm", "pill", "Clear filters"));
  return row;
}

async function emptyStateBoard(t: ThemeContext): Promise<FrameNode> {
  const cases = await tileGrid(
    t,
    [
      {
        label: ["No results", ""],
        node: await drawEmptyState(t, {
          icon: "search",
          tone: "accent/secondary",
          title: "No results found",
          body: "Nothing matches your search. Try a different query or clear the filters.",
          secondary: "Clear filters",
        }),
      },
      {
        label: ["First use", ""],
        node: await drawEmptyState(t, {
          icon: "sparkles",
          tone: "accent/dante",
          cosmic: true,
          title: "Create your first project",
          body: "Projects keep your tracks, maps and chats in one place.",
          primary: "New project",
          secondary: "Import",
        }),
      },
      {
        label: ["Error", ""],
        node: await drawEmptyState(t, {
          icon: "alert-triangle",
          tone: "feedback/danger",
          title: "Something went wrong",
          body: "We couldn't load your library. Check the connection and try again.",
          primary: "Try again",
        }),
      },
    ],
    300,
  );
  const c = canvas(t);
  c.appendChild(await drawEmptyCompact(t, CANVAS_INNER));
  const props: PropRow[] = [
    {
      prop: "icon",
      type: "string",
      def: "—",
      note: ["Name from the icon set.", ""],
    },
    {
      prop: "title / description",
      type: "string",
      def: "—",
      note: ["Explain the state briefly.", ""],
    },
    {
      prop: "tone",
      type: "token",
      def: "accent/primary",
      note: ["Halo and icon colour.", ""],
    },
    {
      prop: "actions",
      type: "ReactNode",
      def: "—",
      note: ["Primary + secondary next step.", ""],
    },
    {
      prop: "compact",
      type: "boolean",
      def: "false",
      note: ["One-row variant for panels.", ""],
    },
    {
      prop: "cosmic",
      type: "boolean",
      def: "false",
      note: ["Falling-star decoration.", ""],
    },
  ];
  return componentBoard(
    t,
    "Empty state",
    ["No data, first use or errors — explain and offer a next step", ""],
    ["Loading placeholder → use Skeleton", "→ Skeleton"],
    [await block(t, "Use cases", cases), await block(t, "Compact", c)],
    props,
  );
}

// ── Popover ───────────────────────────────────────────────────

async function popPanel(t: ThemeContext, w: number): Promise<FrameNode> {
  const p = autoFrame({ direction: "VERTICAL", gap: 12, padding: 16 });
  p.resize(w, p.height);
  p.counterAxisSizingMode = "FIXED";
  p.cornerRadius = RADII.xl;
  fillToken(t, p, "bg/surface");
  strokeToken(t, p, "border/default", 1);
  await applyEffect(p, "shadow/lg", t);
  return p;
}

async function popHeaderRow(t: ThemeContext, title: string): Promise<FrameNode> {
  const h = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
  h.layoutAlign = "STRETCH";
  h.primaryAxisSizingMode = "FIXED";
  h.appendChild(await makeText(t, "label/md", title, "text/primary"));
  const sp = rect(1, 1);
  sp.fills = [];
  h.appendChild(sp);
  sp.layoutGrow = 1;
  h.appendChild(icon(t, "x", 14, "text/muted"));
  return h;
}

function popFooterRow(): FrameNode {
  const f = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  f.layoutAlign = "STRETCH";
  f.primaryAxisSizingMode = "FIXED";
  const sp = rect(1, 1);
  sp.fills = [];
  f.appendChild(sp);
  sp.layoutGrow = 1;
  return f;
}

/** Anchored composition — trigger + arrow + panel (same technique as Tooltip). */
async function popAnchored(
  t: ThemeContext,
  place: TipPlace,
  panel: FrameNode,
  anchorLabel = "Anchor",
): Promise<FrameNode> {
  const tri = figma.createVector();
  tri.vectorPaths = [{ windingRule: "NONZERO", data: TRI[place] }];
  fillToken(t, tri, "bg/surface");
  tri.strokes = [];
  const anchor = await drawButton(t, "Soft", "Default", "sm", "pill", anchorLabel);
  const horizontal = place === "left" || place === "right";
  const wrap = autoFrame({
    direction: horizontal ? "HORIZONTAL" : "VERTICAL",
    gap: 6,
    align: "CENTER",
    cross: "CENTER",
  });
  const order = place === "top" || place === "left" ? [panel, tri, anchor] : [anchor, tri, panel];
  for (const n of order) wrap.appendChild(n);
  return wrap;
}

async function popFilters(t: ThemeContext): Promise<FrameNode> {
  const p = await popPanel(t, 320);
  p.appendChild(await popHeaderRow(t, "Filters"));
  p.appendChild(hairline(t, 288));
  const switchRow = async (label: string, on: boolean) => {
    const r = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
    r.layoutAlign = "STRETCH";
    r.primaryAxisSizingMode = "FIXED";
    r.appendChild(await makeText(t, "body/sm", label, "text/primary"));
    const sp = rect(1, 1);
    sp.fills = [];
    r.appendChild(sp);
    sp.layoutGrow = 1;
    r.appendChild(await drawSwitch(t, on, false, "sm"));
    return r;
  };
  p.appendChild(await switchRow("Only downloaded", true));
  p.appendChild(await switchRow("Explicit content", false));
  p.appendChild(hairline(t, 288));
  const foot = popFooterRow();
  foot.appendChild(await dialogBtn(t, "Reset", "secondary"));
  foot.appendChild(await dialogBtn(t, "Apply", "accent/primary"));
  p.appendChild(foot);
  return p;
}

async function popMini(t: ThemeContext): Promise<FrameNode> {
  const p = await popPanel(t, 170);
  p.itemSpacing = 3;
  p.paddingTop = p.paddingBottom = 12;
  p.paddingLeft = p.paddingRight = 14;
  p.appendChild(await makeText(t, "label/sm", "Popover", "text/primary"));
  p.appendChild(await makeText(t, "caption", "Anchored panel", "text/muted"));
  return p;
}

async function popConfirm(t: ThemeContext): Promise<FrameNode> {
  const p = await popPanel(t, 260);
  p.itemSpacing = 8;
  p.appendChild(await makeText(t, "label/md", "Delete 3 tracks?", "text/primary"));
  p.appendChild(
    await makeText(
      t,
      "caption",
      "They disappear from every playlist. This can't be undone.",
      "text/muted",
      { maxWidth: 228 },
    ),
  );
  const foot = popFooterRow();
  foot.paddingTop = 6;
  foot.appendChild(await dialogBtn(t, "Cancel", "secondary"));
  foot.appendChild(await dialogBtn(t, "Delete", "feedback/danger"));
  p.appendChild(foot);
  return p;
}

async function popForm(t: ThemeContext): Promise<FrameNode> {
  const p = await popPanel(t, 280);
  p.appendChild(await makeText(t, "label/md", "Rename playlist", "text/primary"));
  const field = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", padding: [9, 12] });
  field.layoutAlign = "STRETCH";
  field.primaryAxisSizingMode = "FIXED";
  field.cornerRadius = RADII.md;
  fillToken(t, field, "bg/inset");
  strokeToken(t, field, "border/default", 1);
  field.appendChild(await makeText(t, "body/sm", "Night drive vol. 2", "text/primary"));
  p.appendChild(field);
  const foot = popFooterRow();
  foot.appendChild(await dialogBtn(t, "Cancel", "secondary"));
  foot.appendChild(await dialogBtn(t, "Save", "accent/primary"));
  p.appendChild(foot);
  return p;
}

async function popShare(t: ThemeContext): Promise<FrameNode> {
  const p = await popPanel(t, 240);
  p.itemSpacing = 2;
  p.paddingTop = p.paddingBottom = 8;
  p.paddingLeft = p.paddingRight = 8;
  const row = async (iconName: string, label: string, hover = false) => {
    const r = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [8, 10] });
    r.layoutAlign = "STRETCH";
    r.primaryAxisSizingMode = "FIXED";
    r.cornerRadius = RADII.md;
    if (hover) fillToken(t, r, "bg/surface-raised");
    r.appendChild(icon(t, iconName, 16, "text/secondary"));
    r.appendChild(await makeText(t, "body/sm", label, "text/primary"));
    return r;
  };
  p.appendChild(await row("copy", "Copy link", true));
  p.appendChild(await row("mail", "Email"));
  p.appendChild(await row("share", "Share to…"));
  return p;
}

async function popoverBoard(t: ThemeContext): Promise<FrameNode> {
  const anatomy = canvas(t);
  anatomy.counterAxisAlignItems = "CENTER";
  anatomy.appendChild(await popAnchored(t, "bottom", await popFilters(t), "Open filters"));

  const placements = await tileGrid(
    t,
    [
      { label: ["Top", ""], node: await popAnchored(t, "top", await popMini(t)) },
      { label: ["Bottom", ""], node: await popAnchored(t, "bottom", await popMini(t)) },
      { label: ["Left", ""], node: await popAnchored(t, "left", await popMini(t)) },
      { label: ["Right", ""], node: await popAnchored(t, "right", await popMini(t)) },
    ],
    226,
  );

  const cases = await tileGrid(
    t,
    [
      { label: ["Confirm", ""], node: await popConfirm(t) },
      { label: ["Form", ""], node: await popForm(t) },
      { label: ["Menu", ""], node: await popShare(t) },
    ],
    300,
  );

  const props: PropRow[] = [
    {
      prop: "open",
      type: "boolean",
      def: "false",
      note: ["Controlled visibility.", ""],
    },
    {
      prop: "placement",
      type: "top|bottom|left|right",
      def: "bottom",
      note: ["Side of the anchor.", ""],
    },
    {
      prop: "trigger",
      type: "click | hover",
      def: "click",
      note: ["How it opens.", ""],
    },
    {
      prop: "arrow",
      type: "boolean",
      def: "true",
      note: ["Pointer to the anchor.", ""],
    },
    { prop: "width", type: "number", def: "280", note: ["Panel width.", ""] },
    {
      prop: "dismissible",
      type: "boolean",
      def: "true",
      note: ["Close on outside / Esc.", "/ Esc."],
    },
  ];
  return componentBoard(
    t,
    "Popover",
    ["Rich anchored content: filters, forms, menus", ""],
    ["Plain hint → Tooltip; blocking flow → Dialog", "→ Tooltip; → Dialog"],
    [
      await block(t, "Anatomy", anatomy),
      await block(t, "Placements", placements),
      await block(t, "Use cases", cases),
    ],
    props,
  );
}

// ── List / ListItem ───────────────────────────────────────────

interface LiOpts {
  title: string;
  sub?: string;
  lead?: SceneNode;
  trail?: SceneNode;
  state?: "default" | "hover" | "selected" | "disabled";
  w: number;
}

async function drawListItem(t: ThemeContext, o: LiOpts): Promise<FrameNode> {
  const row = fixedCol(o.w, "HORIZONTAL");
  row.name = "list/item";
  row.itemSpacing = 12;
  row.counterAxisAlignItems = "CENTER";
  row.paddingTop = row.paddingBottom = 10;
  row.paddingLeft = row.paddingRight = 12;
  row.cornerRadius = RADII.md;
  const st = o.state ?? "default";
  if (st === "hover") fillToken(t, row, "bg/surface-raised");
  if (st === "selected") row.fills = [tokenAlpha("accent/primary", 0.1)];
  if (o.lead) row.appendChild(o.lead);
  const col = autoFrame({ direction: "VERTICAL", gap: 2 });
  col.appendChild(
    await makeText(t, "label/md", o.title, st === "selected" ? "accent/primary" : "text/primary"),
  );
  if (o.sub)
    col.appendChild(await makeText(t, "caption", o.sub, "text/muted", { maxWidth: o.w - 150 }));
  row.appendChild(col);
  col.layoutGrow = 1;
  if (o.trail) row.appendChild(o.trail);
  if (st === "disabled") row.opacity = 0.45;
  return row;
}

function listPanel(t: ThemeContext, w: number): FrameNode {
  const p = autoFrame({ direction: "VERTICAL", gap: 2, padding: 6, name: "list" });
  p.resize(w, p.height);
  p.counterAxisSizingMode = "FIXED";
  p.cornerRadius = RADII.xl;
  fillToken(t, p, "bg/surface");
  strokeToken(t, p, "border/subtle", 1);
  return p;
}

async function kvRow(t: ThemeContext, k: string, v: string, w: number): Promise<FrameNode> {
  const r = fixedCol(w, "HORIZONTAL");
  r.itemSpacing = 16;
  r.counterAxisAlignItems = "CENTER";
  r.paddingTop = r.paddingBottom = 9;
  r.paddingLeft = r.paddingRight = 12;
  const kc = fixedCol(170, "HORIZONTAL");
  kc.appendChild(await makeText(t, "body/sm", k, "text/muted"));
  r.appendChild(kc);
  r.appendChild(await makeText(t, "body/sm", v, "text/primary"));
  return r;
}

async function listBoard(t: ThemeContext): Promise<FrameNode> {
  const W = 560;
  const IW = W - 12;

  const anatomyPanel = listPanel(t, W);
  anatomyPanel.appendChild(
    await drawListItem(t, {
      w: IW,
      lead: severityIcon(t, { icon: "bell", tone: "accent/primary", shape: "rounded", size: "sm" }),
      title: "Notifications",
      sub: "Mentions and replies",
      trail: await drawSwitch(t, true, false, "sm"),
    }),
  );
  anatomyPanel.appendChild(
    await drawListItem(t, {
      w: IW,
      lead: await initialsAvatar(t, "Oleksii Kryshtopa"),
      title: "Oleksii Kryshtopa",
      sub: "hello@okryshto.dev",
      trail: await drawBadge(t, { label: "PRO" }),
    }),
  );
  anatomyPanel.appendChild(
    await drawListItem(t, {
      w: IW,
      lead: severityIcon(t, {
        icon: "search",
        tone: "accent/secondary",
        shape: "rounded",
        size: "sm",
      }),
      title: "Quick search",
      sub: "Jump to anything",
      trail: await drawShortcut(t, ["⌘", "K"], "sm"),
    }),
  );
  anatomyPanel.appendChild(
    await drawListItem(t, {
      w: IW,
      lead: severityIcon(t, {
        icon: "download",
        tone: "feedback/success",
        shape: "rounded",
        size: "sm",
      }),
      title: "Downloads",
      sub: "12 files · 340 MB",
      trail: icon(t, "chevron-right", 16, "text/muted"),
    }),
  );
  const anatomy = canvas(t);
  anatomy.counterAxisAlignItems = "CENTER";
  anatomy.appendChild(anatomyPanel);

  const stateTile = async (state: LiOpts["state"]) => {
    const p = listPanel(t, 440);
    p.appendChild(
      await drawListItem(t, {
        w: 428,
        state,
        lead: severityIcon(t, {
          icon: "settings",
          tone: "accent/secondary",
          shape: "rounded",
          size: "sm",
        }),
        title: "Playback settings",
        sub: "Crossfade, gapless",
        trail: icon(t, "chevron-right", 16, "text/muted"),
      }),
    );
    return p;
  };
  const states = await tileGrid(
    t,
    [
      { label: ["Default", ""], node: await stateTile("default") },
      { label: ["Hover", ""], node: await stateTile("hover") },
      { label: ["Selected", ""], node: await stateTile("selected") },
      { label: ["Disabled", ""], node: await stateTile("disabled") },
    ],
    460,
  );

  const dl = listPanel(t, W);
  dl.itemSpacing = 0;
  const kvs: Array<[string, string]> = [
    ["Version", "2.4.1"],
    ["Storage", "340 MB of 2 GB"],
    ["Region", "eu-central-1"],
    ["Plan", "Pro · annual"],
  ];
  for (let i = 0; i < kvs.length; i++) {
    dl.appendChild(await kvRow(t, kvs[i][0], kvs[i][1], IW));
    if (i < kvs.length - 1) dl.appendChild(hairline(t, IW));
  }
  const desc = canvas(t);
  desc.counterAxisAlignItems = "CENTER";
  desc.appendChild(dl);

  const props: PropRow[] = [
    {
      prop: "leading",
      type: "icon | avatar | none",
      def: "none",
      note: ["Left slot.", ""],
    },
    {
      prop: "trailing",
      type: "chevron|switch|badge|kbd",
      def: "—",
      note: ["Right slot.", ""],
    },
    { prop: "description", type: "string", def: "—", note: ["Second line.", ""] },
    {
      prop: "selected / disabled",
      type: "boolean",
      def: "false",
      note: ["Row states.", ""],
    },
    {
      prop: "dividers",
      type: "boolean",
      def: "false",
      note: ["Hairlines between rows.", ""],
    },
    {
      prop: "interactive",
      type: "boolean",
      def: "true",
      note: ["Hover + press feedback.", ""],
    },
  ];
  return componentBoard(
    t,
    "List / ListItem",
    ["Rows of settings, options and files", ""],
    ["Columnar data → use Table", "→ Table"],
    [
      await block(t, "Anatomy", anatomy),
      await block(t, "States", states),
      await block(t, "Description list", desc),
    ],
    props,
  );
}

// ── Card (base) ───────────────────────────────────────────────

type CardVariant = "Solid" | "Glass" | "Outline" | "Elevated" | "Aura";

async function drawCardBase(
  t: ThemeContext,
  variant: CardVariant,
  w: number,
  hover = false,
  tone = "accent/primary",
): Promise<FrameNode> {
  const c = autoFrame({
    direction: "VERTICAL",
    gap: 0,
    clip: true,
    name: `card/${variant.toLowerCase()}`,
  });
  c.resize(w, c.height);
  c.counterAxisSizingMode = "FIXED";
  c.cornerRadius = RADII.xl;
  if (variant === "Solid") {
    fillToken(t, c, "bg/surface");
    strokeToken(t, c, hover ? "border/strong" : "border/subtle", 1);
  } else if (variant === "Glass") {
    fillToken(t, c, "glass/fill");
    strokeToken(t, c, "glass/border", 1);
  } else if (variant === "Outline") {
    strokeToken(t, c, hover ? "border/strong" : "border/default", 1);
  } else if (variant === "Aura") {
    fillToken(t, c, "bg/surface");
    c.strokes = [tokenAlpha(tone, hover ? 0.6 : 0.4)];
    c.strokeWeight = 1;
    c.effects = [toneGlow(tone, hover ? 30 : 22, 0.3)];
  } else {
    fillToken(t, c, "bg/surface-raised");
    strokeToken(t, c, hover ? "border/strong" : "border/subtle", 1);
    await applyEffect(c, hover ? "shadow/lg" : "shadow/md", t);
  }
  return c;
}

async function drawCard(
  t: ThemeContext,
  o: {
    variant?: CardVariant;
    w?: number;
    media?: boolean;
    title: string;
    sub?: string;
    body?: string;
    footer?: "actions" | "meta";
    hover?: boolean;
    tone?: string;
  },
): Promise<FrameNode> {
  const w = o.w ?? 300;
  const c = await drawCardBase(
    t,
    o.variant ?? "Solid",
    w,
    o.hover ?? false,
    o.tone ?? "accent/primary",
  );
  if (o.media) c.appendChild(photoPlaceholder(t, w, 150));
  const sec = autoFrame({ direction: "VERTICAL", gap: 8, padding: 16 });
  sec.layoutAlign = "STRETCH";
  const head = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "MIN" });
  head.layoutAlign = "STRETCH";
  head.primaryAxisSizingMode = "FIXED";
  const hcol = autoFrame({ direction: "VERTICAL", gap: 2 });
  hcol.appendChild(await makeText(t, "label/md", o.title, "text/primary"));
  if (o.sub) hcol.appendChild(await makeText(t, "caption", o.sub, "text/muted"));
  head.appendChild(hcol);
  hcol.layoutGrow = 1;
  head.appendChild(icon(t, "more-horizontal", 16, "text/muted"));
  sec.appendChild(head);
  if (o.body)
    sec.appendChild(await makeText(t, "body/sm", o.body, "text/secondary", { maxWidth: w - 32 }));
  c.appendChild(sec);
  if (o.footer) {
    c.appendChild(hairline(t, w));
    const f = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [12, 16] });
    f.layoutAlign = "STRETCH";
    f.primaryAxisSizingMode = "FIXED";
    if (o.footer === "meta") {
      f.appendChild(icon(t, "heart", 14, "text/muted"));
      f.appendChild(await makeText(t, "caption", "128", "text/muted"));
      f.appendChild(icon(t, "message-circle", 14, "text/muted"));
      f.appendChild(await makeText(t, "caption", "24", "text/muted"));
      const sp = rect(1, 1);
      sp.fills = [];
      f.appendChild(sp);
      sp.layoutGrow = 1;
      f.appendChild(await makeText(t, "caption", "2h ago", "text/muted"));
    } else {
      const sp = rect(1, 1);
      sp.fills = [];
      f.appendChild(sp);
      sp.layoutGrow = 1;
      f.appendChild(await dialogBtn(t, "Details", "secondary"));
      f.appendChild(await dialogBtn(t, "Open", "accent/primary"));
    }
    c.appendChild(f);
  }
  return c;
}

async function cardBoard(t: ThemeContext): Promise<FrameNode> {
  const bodyCopy = "A quiet surface that groups related content and actions.";
  const variants = await tileGrid(
    t,
    [
      {
        label: ["Solid", ""],
        node: await drawCard(t, {
          variant: "Solid",
          w: 440,
          title: "Solid",
          sub: "bg/surface + border",
          body: bodyCopy,
        }),
      },
      {
        label: ["Glass", ""],
        node: await drawCard(t, {
          variant: "Glass",
          w: 440,
          title: "Glass",
          sub: "glass/fill + glass/border",
          body: bodyCopy,
        }),
      },
      {
        label: ["Outline", ""],
        node: await drawCard(t, {
          variant: "Outline",
          w: 440,
          title: "Outline",
          sub: "border only",
          body: bodyCopy,
        }),
      },
      {
        label: ["Elevated", ""],
        node: await drawCard(t, {
          variant: "Elevated",
          w: 440,
          title: "Elevated",
          sub: "raised + shadow",
          body: bodyCopy,
        }),
      },
      {
        label: ["Aura · Mint", ""],
        node: await drawCard(t, {
          variant: "Aura",
          w: 440,
          title: "Aura",
          sub: "toned ring + glow",
          body: bodyCopy,
        }),
      },
      {
        label: ["Aura · Dante", ""],
        node: await drawCard(t, {
          variant: "Aura",
          tone: "accent/dante",
          w: 440,
          title: "Aura",
          sub: "blood of Dante edition",
          body: bodyCopy,
        }),
      },
    ],
    460,
  );

  const anatomy = canvas(t);
  anatomy.counterAxisAlignItems = "CENTER";
  anatomy.appendChild(
    await drawCard(t, {
      variant: "Solid",
      w: 420,
      media: true,
      title: "Night drive vol. 2",
      sub: "Playlist · 18 tracks · 1 h 12 m",
      body: "Synthwave for empty highways — mixed and reordered weekly.",
      footer: "actions",
    }),
  );

  const hover = await tileGrid(
    t,
    [
      {
        label: ["Default", ""],
        node: await drawCard(t, {
          variant: "Elevated",
          w: 440,
          title: "Elevated card",
          sub: "shadow/md",
          body: bodyCopy,
          footer: "meta",
        }),
      },
      {
        label: ["Hover", ""],
        node: await drawCard(t, {
          variant: "Elevated",
          w: 440,
          hover: true,
          title: "Elevated card",
          sub: "shadow/lg + border/strong",
          body: bodyCopy,
          footer: "meta",
        }),
      },
    ],
    460,
  );

  const props: PropRow[] = [
    {
      prop: "variant",
      type: "solid|glass|outline|elevated|aura",
      def: "solid",
      note: ["Surface treatment; aura = toned glow.", "; aura = ."],
    },
    {
      prop: "media",
      type: "ReactNode",
      def: "—",
      note: ["Full-bleed top slot.", ""],
    },
    {
      prop: "header / footer",
      type: "ReactNode",
      def: "—",
      note: ["Title row and bottom bar.", ""],
    },
    {
      prop: "interactive",
      type: "boolean",
      def: "false",
      note: ["Hover lift + border.", ""],
    },
    { prop: "padding", type: "number", def: "16", note: ["Inner spacing.", ""] },
    { prop: "radius", type: "token", def: "xl", note: ["Corner radius.", ""] },
  ];
  return componentBoard(
    t,
    "Card",
    ["Universal surface for grouped content", ""],
    ["Row-like items → List; metrics → Stat card", "→ List; → Stat card"],
    [
      await block(t, "Variants", variants),
      await block(t, "Anatomy", anatomy),
      await block(t, "Interactive", hover),
    ],
    props,
  );
}

// ── Stepper ───────────────────────────────────────────────────

type StepDotState = "done" | "current" | "upcoming" | "error";

interface StepSpec {
  label: string;
  desc?: string;
  state: StepDotState;
}

const STEP_D = 28;

const STEP_LABEL_TONE: Record<StepDotState, string> = {
  done: "text/secondary",
  current: "text/primary",
  upcoming: "text/muted",
  error: "feedback/danger",
};

async function stepDot(
  t: ThemeContext,
  n: number,
  state: StepDotState,
  d = STEP_D,
  tone = "accent/primary",
): Promise<FrameNode> {
  const f = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    name: `step/${state}`,
  });
  f.resize(d, d);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = RADII.full;
  if (state === "done") {
    fillToken(t, f, tone);
    f.appendChild(icon(t, "check", Math.round(d * 0.5), "accent/contrast"));
  } else if (state === "current") {
    f.fills = [tokenAlpha(tone, 0.15)];
    strokeToken(t, f, tone, 2);
    if (tone === "accent/primary") await applyEffect(f, "glow/accent", t);
    else f.effects = [toneGlow(tone, 12, 0.45)];
    f.appendChild(await makeText(t, "label/sm", String(n), tone));
  } else if (state === "error") {
    f.fills = [tokenAlpha("feedback/danger", 0.15)];
    strokeToken(t, f, "feedback/danger", 2);
    f.appendChild(icon(t, "x", Math.round(d * 0.45), "feedback/danger"));
  } else {
    strokeToken(t, f, "border/default", 1.5);
    f.appendChild(await makeText(t, "label/sm", String(n), "text/muted"));
  }
  return f;
}

/** Horizontal stepper — dots joined by lines, labels centered underneath. */
async function drawStepperH(
  t: ThemeContext,
  steps: StepSpec[],
  lineW = 110,
  tone = "accent/primary",
): Promise<FrameNode> {
  const g = 8;
  const margin = 44;
  const total = steps.length * STEP_D + (steps.length - 1) * (lineW + g * 2);
  const hasDesc = steps.some((s) => !!s.desc);
  const f = figma.createFrame();
  f.name = "stepper/horizontal";
  f.fills = [];
  f.clipsContent = false;
  f.resize(total + margin * 2, hasDesc ? 88 : 66);
  let x = margin;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const dot = await stepDot(t, i + 1, s.state, STEP_D, tone);
    f.appendChild(dot);
    dot.x = x;
    dot.y = 0;
    const cx = x + STEP_D / 2;
    const lbl = await makeText(t, "label/sm", s.label, STEP_LABEL_TONE[s.state]);
    f.appendChild(lbl);
    lbl.x = Math.round(cx - lbl.width / 2);
    lbl.y = STEP_D + 12;
    if (s.desc) {
      const d = await makeText(t, "caption", s.desc, "text/muted");
      f.appendChild(d);
      d.x = Math.round(cx - d.width / 2);
      d.y = STEP_D + 34;
    }
    x += STEP_D;
    if (i < steps.length - 1) {
      const line = rect(lineW, 2, 1);
      fillToken(t, line, s.state === "done" ? tone : "border/subtle");
      f.appendChild(line);
      line.x = x + g;
      line.y = STEP_D / 2 - 1;
      x += lineW + g * 2;
    }
  }
  return f;
}

async function drawStepperV(t: ThemeContext, steps: StepSpec[], w: number): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 0, name: "stepper/vertical" });
  col.resize(w, col.height);
  col.counterAxisSizingMode = "FIXED";
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const last = i === steps.length - 1;
    const row = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "MIN" });
    row.layoutAlign = "STRETCH";
    const left = autoFrame({ direction: "VERTICAL", gap: 6, cross: "CENTER" });
    left.appendChild(await stepDot(t, i + 1, s.state));
    if (!last) {
      const line = rect(2, 46, 1);
      fillToken(t, line, s.state === "done" ? "accent/primary" : "border/subtle");
      left.appendChild(line);
    }
    row.appendChild(left);
    const right = autoFrame({ direction: "VERTICAL", gap: 3 });
    right.paddingTop = 4;
    right.paddingBottom = last ? 0 : 18;
    right.appendChild(await makeText(t, "label/md", s.label, STEP_LABEL_TONE[s.state]));
    if (s.desc)
      right.appendChild(await makeText(t, "caption", s.desc, "text/muted", { maxWidth: w - 60 }));
    row.appendChild(right);
    right.layoutGrow = 1;
    col.appendChild(row);
  }
  return col;
}

async function stepperBoard(t: ThemeContext): Promise<FrameNode> {
  const hCanvas = canvas(t);
  hCanvas.counterAxisAlignItems = "CENTER";
  hCanvas.itemSpacing = 26;
  hCanvas.appendChild(
    await drawStepperH(t, [
      { label: "Account", desc: "", state: "done" },
      { label: "Shipping", desc: "", state: "done" },
      { label: "Payment", desc: "", state: "current" },
      { label: "Review", desc: "", state: "upcoming" },
    ]),
  );
  hCanvas.appendChild(await makeText(t, "mono/sm", "tone: dante", "text/muted"));
  hCanvas.appendChild(
    await drawStepperH(
      t,
      [
        { label: "Upload", desc: "", state: "done" },
        { label: "Master", desc: "", state: "done" },
        { label: "Artwork", desc: "", state: "current" },
        { label: "Release", desc: "", state: "upcoming" },
      ],
      110,
      "accent/dante",
    ),
  );

  const stateTile = async (state: StepDotState, n: number) => {
    const c = autoFrame({ direction: "VERTICAL", gap: 8, cross: "CENTER" });
    c.appendChild(await stepDot(t, n, state));
    return c;
  };
  const states = await tileGrid(
    t,
    [
      { label: ["Done", ""], node: await stateTile("done", 1) },
      { label: ["Current", ""], node: await stateTile("current", 2) },
      { label: ["Upcoming", ""], node: await stateTile("upcoming", 3) },
      { label: ["Error", ""], node: await stateTile("error", 4) },
    ],
    150,
  );

  const vCanvas = canvas(t);
  vCanvas.counterAxisAlignItems = "CENTER";
  vCanvas.appendChild(
    await drawStepperV(
      t,
      [
        { label: "Upload tracks", desc: "Drag your mixes or import from a folder.", state: "done" },
        { label: "Add artwork", desc: "Square cover, 3000 × 3000 preferred.", state: "current" },
        { label: "Publish", desc: "Release to all connected platforms.", state: "upcoming" },
      ],
      440,
    ),
  );

  const cDots = autoFrame({ direction: "VERTICAL", gap: 10, cross: "CENTER" });
  cDots.appendChild(await makeText(t, "caption", "Step 2 of 4 · Payment", "text/secondary"));
  cDots.appendChild(await dots(t, 4, 1));
  const cBar = autoFrame({ direction: "VERTICAL", gap: 10 });
  cBar.appendChild(await makeText(t, "caption", "Step 2 of 4 · Payment", "text/secondary"));
  cBar.appendChild(drawProgressLinear(t, 0.5, false, 220));
  const compact = await tileGrid(
    t,
    [
      { label: ["Dots", ""], node: cDots },
      { label: ["Progress", ""], node: cBar },
    ],
    300,
  );

  const props: PropRow[] = [
    {
      prop: "steps",
      type: "StepSpec[]",
      def: "—",
      note: ["Label, description, state.", ""],
    },
    {
      prop: "active",
      type: "number",
      def: "0",
      note: ["Current step index.", ""],
    },
    {
      prop: "orientation",
      type: "horizontal | vertical",
      def: "horizontal",
      note: ["Layout direction.", ""],
    },
    {
      prop: "tone",
      type: "token",
      def: "accent/primary",
      note: ["Dots & connectors colour (dante-ready).", "( dante)."],
    },
    {
      prop: "error",
      type: "number",
      def: "—",
      note: ["Index of a failed step.", ""],
    },
    {
      prop: "clickable",
      type: "boolean",
      def: "false",
      note: ["Allow jumping to done steps.", ""],
    },
    {
      prop: "compact",
      type: "dots | progress",
      def: "—",
      note: ["Mobile one-liner.", ""],
    },
  ];
  return componentBoard(
    t,
    "Stepper",
    ["Multi-step flows: checkout, onboarding, wizards", ""],
    ["Page navigation → Tabs; single task progress → Progress", "→ Tabs; → Progress"],
    [
      await block(t, "Horizontal", hCanvas),
      await block(t, "States", states),
      await block(t, "Vertical", vCanvas),
      await block(t, "Compact", compact),
    ],
    props,
  );
}

// ── ButtonGroup / Split button ────────────────────────────────

interface BgItem {
  label?: string;
  iconName?: string;
  active?: boolean;
}

async function drawButtonGroup(
  t: ThemeContext,
  items: BgItem[],
  tone = "accent/primary",
): Promise<FrameNode> {
  const g = autoFrame({ direction: "HORIZONTAL", gap: 0, clip: true, name: "button-group" });
  g.cornerRadius = RADII.lg;
  fillToken(t, g, "bg/surface-raised");
  strokeToken(t, g, "border/subtle", 1);
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (i > 0) {
      const sep = rect(1, 36);
      fillToken(t, sep, "border/subtle");
      sep.layoutAlign = "STRETCH";
      g.appendChild(sep);
    }
    const seg = autoFrame({
      direction: "HORIZONTAL",
      gap: 7,
      align: "CENTER",
      cross: "CENTER",
      padding: [9, 16],
    });
    if (it.active) seg.fills = [tokenAlpha(tone, 0.16)];
    if (it.iconName) seg.appendChild(icon(t, it.iconName, 15, it.active ? tone : "text/secondary"));
    if (it.label)
      seg.appendChild(await makeText(t, "label/md", it.label, it.active ? tone : "text/primary"));
    g.appendChild(seg);
  }
  return g;
}

async function drawSplitButton(
  t: ThemeContext,
  opts: { label: string; secondary?: boolean; tone?: string },
): Promise<FrameNode> {
  const tone = opts.tone ?? "accent/primary";
  const primary = !opts.secondary;
  const g = autoFrame({ direction: "HORIZONTAL", gap: 0, clip: true, name: "split-button" });
  g.cornerRadius = RADII.full;
  if (primary) fillToken(t, g, tone);
  else {
    fillToken(t, g, "bg/surface-raised");
    strokeToken(t, g, "border/subtle", 1);
  }
  const main = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    align: "CENTER",
    cross: "CENTER",
    padding: [10, 18],
  });
  main.appendChild(
    await makeText(t, "label/md", opts.label, primary ? "accent/contrast" : "text/primary"),
  );
  g.appendChild(main);
  const sep = rect(1, 40);
  sep.fills = [
    primary
      ? ({ ...solid("#04140F"), opacity: 0.3 } as SolidPaint)
      : tokenAlpha("feedback/warning", 0),
  ];
  if (!primary) fillToken(t, sep, "border/subtle");
  sep.layoutAlign = "STRETCH";
  g.appendChild(sep);
  const chev = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [10, 12],
  });
  chev.appendChild(icon(t, "chevron-down", 16, primary ? "accent/contrast" : "text/secondary"));
  g.appendChild(chev);
  return g;
}

async function splitMenuScene(t: ThemeContext): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 6, cross: "MIN" });
  col.appendChild(await drawSplitButton(t, { label: "Save" }));
  const menu = await popPanel(t, 210);
  menu.itemSpacing = 2;
  menu.paddingTop = menu.paddingBottom = 8;
  menu.paddingLeft = menu.paddingRight = 8;
  const row = async (label: string, hover = false) => {
    const r = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [8, 10] });
    r.layoutAlign = "STRETCH";
    r.primaryAxisSizingMode = "FIXED";
    r.cornerRadius = RADII.md;
    if (hover) fillToken(t, r, "bg/surface-raised");
    r.appendChild(await makeText(t, "body/sm", label, "text/primary"));
    return r;
  };
  menu.appendChild(await row("Save", true));
  menu.appendChild(await row("Save as…"));
  menu.appendChild(await row("Save & publish"));
  col.appendChild(menu);
  return col;
}

async function buttonGroupBoard(t: ThemeContext): Promise<FrameNode> {
  const groups = await tileGrid(
    t,
    [
      {
        label: ["Text actions", ""],
        node: await drawButtonGroup(t, [
          { label: "Merge" },
          { label: "Squash" },
          { label: "Rebase" },
        ]),
      },
      {
        label: ["Icons", ""],
        node: await drawButtonGroup(t, [
          { iconName: "copy" },
          { iconName: "download" },
          { iconName: "share" },
        ]),
      },
      {
        label: ["With active", ""],
        node: await drawButtonGroup(t, [
          { iconName: "skip-back" },
          { iconName: "play", active: true },
          { iconName: "skip-forward" },
        ]),
      },
      {
        label: ["Active · Dante", ""],
        node: await drawButtonGroup(
          t,
          [{ label: "Day" }, { label: "Week", active: true }, { label: "Month" }],
          "accent/dante",
        ),
      },
    ],
    300,
  );
  const splits = await tileGrid(
    t,
    [
      { label: ["Primary", ""], node: await drawSplitButton(t, { label: "Save" }) },
      {
        label: ["Dante", ""],
        node: await drawSplitButton(t, { label: "Boost", tone: "accent/dante" }),
      },
      {
        label: ["Secondary", ""],
        node: await drawSplitButton(t, { label: "Export", secondary: true }),
      },
    ],
    240,
  );
  const anatomy = canvas(t);
  anatomy.counterAxisAlignItems = "CENTER";
  anatomy.appendChild(await splitMenuScene(t));
  const props: PropRow[] = [
    {
      prop: "items",
      type: "{label?, icon?, active?}[]",
      def: "[]",
      note: ["Group segments.", ""],
    },
    {
      prop: "split",
      type: "boolean",
      def: "false",
      note: ["Main action + menu chevron.", ""],
    },
    {
      prop: "menu",
      type: "Item[]",
      def: "—",
      note: ["Dropdown for the chevron.", ""],
    },
    {
      prop: "tone",
      type: "token",
      def: "accent/primary",
      note: ["Fill / active colour (dante-ready).", "/ ( dante)."],
    },
    {
      prop: "disabled",
      type: "boolean",
      def: "false",
      note: ["Whole group off.", ""],
    },
  ];
  return componentBoard(
    t,
    "ButtonGroup / Split",
    ["Related actions side by side; split = default + menu", "; split = +"],
    ["Unrelated actions → separate Buttons", ""],
    [
      await block(t, "Button group", groups),
      await block(t, "Split button", splits),
      await block(t, "Anatomy", anatomy),
    ],
    props,
  );
}

// ── Rating ────────────────────────────────────────────────────

function ratingStar(
  t: ThemeContext,
  kind: "full" | "half" | "empty",
  d: number,
  tone: string,
  glyph = "star",
): FrameNode {
  if (kind !== "half") {
    const w = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    w.resize(d, d);
    w.primaryAxisSizingMode = "FIXED";
    w.counterAxisSizingMode = "FIXED";
    w.appendChild(
      kind === "full" ? iconFilled(t, glyph, d, tone) : icon(t, glyph, d, "text/muted"),
    );
    return w;
  }
  const f = figma.createFrame();
  f.name = "rating/half";
  f.resize(d, d);
  f.fills = [];
  f.clipsContent = false;
  const base = icon(t, glyph, d, "text/muted");
  f.appendChild(base);
  base.x = 0;
  base.y = 0;
  const clipF = figma.createFrame();
  clipF.resize(d / 2, d);
  clipF.fills = [];
  clipF.clipsContent = true;
  const fill = iconFilled(t, glyph, d, tone);
  clipF.appendChild(fill);
  fill.x = 0;
  fill.y = 0;
  f.appendChild(clipF);
  clipF.x = 0;
  clipF.y = 0;
  return f;
}

async function drawRating(
  t: ThemeContext,
  opts: {
    value?: number;
    max?: number;
    d?: number;
    tone?: string;
    glyph?: string;
    label?: string;
  } = {},
): Promise<FrameNode> {
  const max = opts.max ?? 5;
  const value = opts.value ?? 4;
  const d = opts.d ?? 20;
  const tone = opts.tone ?? "feedback/warning";
  const row = autoFrame({
    direction: "HORIZONTAL",
    gap: Math.max(3, Math.round(d * 0.18)),
    cross: "CENTER",
    name: "rating",
  });
  for (let i = 1; i <= max; i++) {
    const kind: "full" | "half" | "empty" =
      value >= i ? "full" : value >= i - 0.5 ? "half" : "empty";
    row.appendChild(ratingStar(t, kind, d, tone, opts.glyph ?? "star"));
  }
  if (opts.label) row.appendChild(await makeText(t, "body/sm", opts.label, "text/secondary"));
  return row;
}

async function ratingBoard(t: ThemeContext): Promise<FrameNode> {
  const values = await tileGrid(
    t,
    [
      { label: ["Full · 5.0", ""], node: await drawRating(t, { value: 5 }) },
      { label: ["4.0", "4.0"], node: await drawRating(t, { value: 4 }) },
      { label: ["Half · 2.5", ""], node: await drawRating(t, { value: 2.5 }) },
      { label: ["Empty", ""], node: await drawRating(t, { value: 0 }) },
    ],
    220,
  );
  const tones = await tileGrid(
    t,
    [
      { label: ["Gold", ""], node: await drawRating(t, { value: 4 }) },
      { label: ["Mint", ""], node: await drawRating(t, { value: 4, tone: "accent/primary" }) },
      {
        label: ["Dante · hearts", ""],
        node: await drawRating(t, { value: 3.5, tone: "accent/dante", glyph: "heart" }),
      },
    ],
    220,
  );
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawRating(t, { value: 4, d: 16 }) },
      { label: SIZE_LABEL.md, node: await drawRating(t, { value: 4, d: 20 }) },
      { label: SIZE_LABEL.lg, node: await drawRating(t, { value: 4, d: 28 }) },
    ],
    240,
  );
  const labeled = await tileGrid(
    t,
    [
      {
        label: ["With count", ""],
        node: await drawRating(t, { value: 4.5, label: "4.8 · 128 reviews" }),
      },
      {
        label: ["Compact", ""],
        node: await drawRating(t, { value: 5, max: 1, d: 16, label: "4.8" }),
      },
    ],
    300,
  );
  const props: PropRow[] = [
    { prop: "value", type: "number", def: "0", note: ["Current score.", ""] },
    { prop: "max", type: "number", def: "5", note: ["Number of glyphs.", ""] },
    {
      prop: "precision",
      type: "1 | 0.5",
      def: "1",
      note: ["Half-star support.", ""],
    },
    { prop: "readOnly", type: "boolean", def: "false", note: ["Display-only.", ""] },
    {
      prop: "tone | icon",
      type: "token | IconName",
      def: "gold · star",
      note: ["Colour & glyph (dante hearts ✓).", ""],
    },
    { prop: "size", type: "sm|md|lg", def: "md", note: ["Glyph size.", ""] },
  ];
  return componentBoard(
    t,
    "Rating",
    ["Collect or display a score", ""],
    ["Binary feedback → thumbs up/down", ""],
    [
      await block(t, "Values", values),
      await block(t, "Tones", tones),
      await block(t, "Sizes", sizes),
      await block(t, "With label", labeled),
    ],
    props,
  );
}

// ── FAB ───────────────────────────────────────────────────────

async function drawFab(
  t: ThemeContext,
  opts: { iconName?: string; tone?: string; d?: number; label?: string; soft?: boolean } = {},
): Promise<FrameNode> {
  const tone = opts.tone ?? "accent/primary";
  const d = opts.d ?? 56;
  const f = autoFrame({
    direction: "HORIZONTAL",
    gap: 10,
    align: "CENTER",
    cross: "CENTER",
    name: "fab",
    padding: opts.label ? [16, 22] : 0,
  });
  if (!opts.label) {
    f.resize(d, d);
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "FIXED";
  }
  f.cornerRadius = RADII.full;
  if (opts.soft) {
    fillToken(t, f, "bg/surface-raised");
    strokeToken(t, f, "border/subtle", 1);
    await applyEffect(f, "shadow/md", t);
    f.appendChild(
      icon(t, opts.iconName ?? "plus", opts.label ? 20 : Math.round(d * 0.42), "text/primary"),
    );
    if (opts.label) f.appendChild(await makeText(t, "label/md", opts.label, "text/primary"));
    return f;
  }
  fillToken(t, f, tone);
  f.effects = [toneGlow(tone, 22, 0.45)];
  f.appendChild(
    icon(t, opts.iconName ?? "plus", opts.label ? 20 : Math.round(d * 0.42), "accent/contrast"),
  );
  if (opts.label) f.appendChild(await makeText(t, "label/md", opts.label, "accent/contrast"));
  return f;
}

async function fabSpeedDial(t: ThemeContext): Promise<FrameNode> {
  const MAIN_D = 56;
  const MINI_D = 44;
  const W = 236;
  const H = 288;
  const f = figma.createFrame();
  f.name = "fab/speed-dial";
  f.resize(W, H);
  f.fills = [];
  f.clipsContent = false;
  // The single vertical axis every circle (mini + main) is centred on.
  const cx = W - MAIN_D / 2 - 6;
  // Main FAB — in the OPEN state the plus is rotated to a ✕ (close).
  const main = await drawFab(t, { iconName: "x", d: MAIN_D });
  f.appendChild(main);
  main.x = cx - MAIN_D / 2;
  main.y = H - MAIN_D;
  const minis: Array<[string, string, string | undefined, boolean]> = [
    ["music", "New track", undefined, true],
    ["mic", "Record", "accent/dante", false],
    ["upload", "Import", undefined, true],
  ];
  let iy = H - MAIN_D - 14 - MINI_D;
  for (const [ic, label, tone, soft] of minis) {
    const mini = await drawFab(t, { iconName: ic, d: MINI_D, tone, soft });
    f.appendChild(mini);
    mini.x = cx - MINI_D / 2; // centred on the shared axis
    mini.y = iy;
    const chip = autoFrame({
      direction: "HORIZONTAL",
      align: "CENTER",
      cross: "CENTER",
      padding: [5, 10],
    });
    chip.cornerRadius = RADII.md;
    fillToken(t, chip, "bg/surface-raised");
    strokeToken(t, chip, "border/subtle", 1);
    chip.appendChild(await makeText(t, "caption", label, "text/secondary"));
    f.appendChild(chip);
    chip.x = cx - MINI_D / 2 - 12 - (chip.width as number);
    chip.y = iy + (MINI_D - (chip.height as number)) / 2; // Y-centre the chip on its icon
    iy -= MINI_D + 14;
  }
  return f;
}

async function fabBoard(t: ThemeContext): Promise<FrameNode> {
  const variants = await tileGrid(
    t,
    [
      { label: ["Standard", ""], node: await drawFab(t, {}) },
      {
        label: ["Dante", ""],
        node: await drawFab(t, { iconName: "heart", tone: "accent/dante" }),
      },
      {
        label: ["Extended", ""],
        node: await drawFab(t, { iconName: "music", label: "New track" }),
      },
      { label: ["Soft", ""], node: await drawFab(t, { iconName: "pencil", soft: true }) },
    ],
    220,
  );
  const sizes = await tileGrid(
    t,
    [
      { label: ["Mini · 44", ""], node: await drawFab(t, { d: 44 }) },
      { label: ["Default · 56", ""], node: await drawFab(t, { d: 56 }) },
      { label: ["Large · 64", ""], node: await drawFab(t, { d: 64 }) },
    ],
    150,
  );
  const dial = canvas(t);
  dial.counterAxisAlignItems = "CENTER";
  dial.appendChild(await fabSpeedDial(t));
  const props: PropRow[] = [
    { prop: "icon", type: "IconName", def: "plus", note: ["Glyph inside.", ""] },
    {
      prop: "label",
      type: "string",
      def: "—",
      note: ["Extended pill with text.", ""],
    },
    {
      prop: "tone",
      type: "token",
      def: "accent/primary",
      note: ["Fill + glow (dante-ready).", "+ ( dante)."],
    },
    { prop: "size", type: "44 | 56 | 64", def: "56", note: ["Diameter.", ""] },
    {
      prop: "speedDial",
      type: "Action[]",
      def: "—",
      note: ["Mini-actions fan-out.", ""],
    },
    {
      prop: "position",
      type: "bottom-right | …",
      def: "bottom-right",
      note: ["Screen corner.", ""],
    },
  ];
  return componentBoard(
    t,
    "FAB",
    ["The one screen-level primary action, floating", ""],
    ["Several equal actions → toolbar / buttons", ""],
    [
      await block(t, "Variants", variants),
      await block(t, "Sizes", sizes),
      await block(t, "Speed dial", dial),
    ],
    props,
  );
}

// ── File upload / Dropzone ────────────────────────────────────

type DzState = "default" | "focus" | "active" | "reject" | "error" | "disabled" | "readonly";

// copy per state — kept in one table so the zone never invents its own wording
const DZ_COPY: Record<DzState, { icon: string; title: string; sub: string; btn: string | null }> = {
  default: {
    icon: "upload",
    title: "Drag & drop files here",
    sub: "WAV, MP3 or PNG · up to 50 MB",
    btn: "Browse files",
  },
  focus: {
    icon: "upload",
    title: "Drag & drop files here",
    sub: "Press Enter to browse · Space to open",
    btn: "Browse files",
  },
  active: {
    icon: "upload",
    title: "Release to upload",
    sub: "3 files · WAV, MP3 or PNG",
    btn: null,
  },
  reject: {
    icon: "x",
    title: "PDF is not allowed",
    sub: "Only WAV, MP3 or PNG · up to 50 MB",
    btn: null,
  },
  error: {
    icon: "upload",
    title: "File is too large",
    sub: "Max size is 50 MB — try a smaller file",
    btn: "Try again",
  },
  disabled: {
    icon: "lock",
    title: "Upload unavailable",
    sub: "Ask an admin to enable uploads",
    btn: "Browse files",
  },
  readonly: {
    icon: "lock",
    title: "3 files attached",
    sub: "Read-only — files can’t be changed",
    btn: null,
  },
};

async function drawDropzone(
  t: ThemeContext,
  opts: { state?: DzState; w?: number; tone?: string } = {},
): Promise<FrameNode> {
  const w = opts.w ?? 440;
  const accent = opts.tone ?? "accent/primary";
  const st = opts.state ?? "default";
  const danger = st === "error" || st === "reject";
  const quiet = st === "disabled" || st === "readonly";
  const tone = danger ? "feedback/danger" : quiet ? "text/muted" : accent;
  const c = DZ_COPY[st];
  const z = autoFrame({
    direction: "VERTICAL",
    gap: 10,
    align: "CENTER",
    cross: "CENTER",
    padding: [30, 24],
    name: `dropzone/${st}`,
  });
  z.resize(w, z.height);
  z.counterAxisSizingMode = "FIXED";
  z.cornerRadius = RADII.xl;
  if (st === "active") {
    z.fills = [tokenAlpha(accent, 0.07)];
    z.strokes = [tokenAlpha(accent, 0.8)];
  } else if (danger) {
    z.fills = [tokenAlpha("feedback/danger", 0.06)];
    z.strokes = [tokenAlpha("feedback/danger", 0.8)];
  } else if (st === "focus") {
    fillToken(t, z, "bg/inset");
    strokeToken(t, z, "state/focus", 2);
    await applyEffect(z, "glow/accent", t);
  } else {
    fillToken(t, z, "bg/inset");
    strokeToken(t, z, st === "readonly" ? "border/subtle" : "border/default", 1);
  }
  z.strokeWeight = st === "focus" ? 2 : 1.5;
  // read-only has nothing to drop into, so the dashes go away
  z.dashPattern = st === "readonly" ? [] : [8, 8];
  if (st === "disabled") z.opacity = 0.42;
  z.appendChild(severityIcon(t, { icon: c.icon, tone, shape: "circle", size: "md" }));
  z.appendChild(await makeText(t, "label/md", c.title, quiet ? "text/secondary" : "text/primary"));
  z.appendChild(await makeText(t, "caption", c.sub, "text/muted"));
  if (c.btn) {
    const bState: BtnState = st === "focus" ? "Focus" : st === "disabled" ? "Disabled" : "Default";
    z.appendChild(await drawButton(t, "Soft", bState, "sm", "pill", c.btn));
  }
  return z;
}

/** One-line zone for forms and sidebars — same affordance, ~56 px tall. */
async function drawDropzoneInline(
  t: ThemeContext,
  opts: { state?: "default" | "active" | "error" | "disabled"; w?: number; tone?: string } = {},
): Promise<FrameNode> {
  const w = opts.w ?? 420;
  const st = opts.state ?? "default";
  const accent = opts.tone ?? "accent/primary";
  const row = fixedCol(w, "HORIZONTAL");
  row.name = `dropzone/inline/${st}`;
  row.itemSpacing = 10;
  row.counterAxisAlignItems = "CENTER";
  row.paddingTop = row.paddingBottom = 12;
  row.paddingLeft = row.paddingRight = 14;
  row.cornerRadius = RADII.lg;
  if (st === "active") {
    row.fills = [tokenAlpha(accent, 0.07)];
    row.strokes = [tokenAlpha(accent, 0.8)];
  } else if (st === "error") {
    row.fills = [tokenAlpha("feedback/danger", 0.06)];
    row.strokes = [tokenAlpha("feedback/danger", 0.8)];
  } else {
    fillToken(t, row, "bg/inset");
    strokeToken(t, row, "border/default", 1);
  }
  row.strokeWeight = 1.5;
  row.dashPattern = [7, 7];
  if (st === "disabled") row.opacity = 0.42;
  row.appendChild(
    icon(
      t,
      st === "error" ? "alert-triangle" : "upload",
      16,
      st === "error" ? "feedback/danger" : st === "active" ? accent : "text/secondary",
    ),
  );
  const label =
    st === "error" ? "File is too large" : st === "active" ? "Release to upload" : "Drop files or";
  row.appendChild(
    await makeText(t, "label/sm", label, st === "error" ? "feedback/danger" : "text/primary"),
  );
  const spacer = rect(1, 1);
  spacer.fills = [];
  spacer.layoutGrow = 1;
  row.appendChild(spacer);
  row.appendChild(await makeText(t, "caption", "up to 50 MB", "text/muted"));
  row.appendChild(
    await drawButton(
      t,
      "Ghost",
      st === "disabled" ? "Disabled" : "Default",
      "sm",
      "rounded",
      st === "error" ? "Try again" : "Browse",
    ),
  );
  return row;
}

/** Table-cell zone: ~32 px, fits a data row without breaking its rhythm. */
type CellState = "empty" | "active" | "filled" | "multi" | "uploading" | "disabled";

/**
 * Overlapping thumbnail stack for the multi-file cell. Negative itemSpacing tucks
 * each preview under the previous one; a cell-coloured ring keeps them readable.
 */
function thumbStack(t: ThemeContext, files: Array<[string, string]>, max = 3): FrameNode {
  const stack = autoFrame({
    direction: "HORIZONTAL",
    gap: -7,
    cross: "CENTER",
    name: "thumb-stack",
  });
  for (const [from, to] of files.slice(0, max)) {
    const th = thumbSwatch(t, from, to, 18);
    strokeToken(t, th, "bg/surface", 1.5); // ring separates the overlap
    stack.appendChild(th);
  }
  return stack;
}

async function drawDropzoneCell(
  t: ThemeContext,
  opts: {
    state?: CellState;
    w?: number;
    tone?: string;
    files?: Array<[string, string]>;
    count?: number;
    progress?: number;
  } = {},
): Promise<FrameNode> {
  const w = opts.w ?? 190;
  const st = opts.state ?? "empty";
  const accent = opts.tone ?? "accent/primary";
  const solidBg = st === "filled" || st === "multi" || st === "uploading";
  const cell = fixedCol(w, "HORIZONTAL");
  cell.name = `dropzone/cell/${st}`;
  cell.itemSpacing = 7;
  cell.counterAxisAlignItems = "CENTER";
  cell.paddingTop = cell.paddingBottom = 6;
  cell.paddingLeft = cell.paddingRight = 10;
  cell.cornerRadius = RADII.md;
  if (st === "active") {
    cell.fills = [tokenAlpha(accent, 0.08)];
    cell.strokes = [tokenAlpha(accent, 0.85)];
    cell.dashPattern = [6, 6];
  } else if (solidBg) {
    fillToken(t, cell, "bg/surface");
    strokeToken(t, cell, "border/subtle", 1);
    cell.dashPattern = [];
  } else {
    fillToken(t, cell, "bg/inset");
    strokeToken(t, cell, "border/default", 1);
    cell.dashPattern = [6, 6];
  }
  cell.strokeWeight = 1;
  if (st === "disabled") cell.opacity = 0.42;

  const files = opts.files ?? [
    ["#2A6F62", "#5EE6C1"],
    ["#3B2A6F", "#818CF8"],
    ["#6F2A45", "#FF3D8B"],
  ];
  const count = opts.count ?? files.length;

  if (st === "filled") {
    cell.appendChild(thumbSwatch(t, files[0][0], files[0][1], 18));
    cell.appendChild(await makeText(t, "caption", "cover-3000.png", "text/primary"));
    const sp = rect(1, 1);
    sp.fills = [];
    sp.layoutGrow = 1;
    cell.appendChild(sp);
    cell.appendChild(icon(t, "x", 12, "text/muted"));
  } else if (st === "multi") {
    // 2+ files: stack the previews, count instead of names — a name never fits here
    cell.appendChild(thumbStack(t, files));
    cell.appendChild(await makeText(t, "caption", `${count} files`, "text/primary"));
    const sp = rect(1, 1);
    sp.fills = [];
    sp.layoutGrow = 1;
    cell.appendChild(sp);
    cell.appendChild(icon(t, "plus", 12, "text/muted")); // add more, in place
    cell.appendChild(icon(t, "x", 12, "text/muted")); // clear the cell
  } else if (st === "uploading") {
    cell.appendChild(thumbStack(t, files, 2));
    const col = autoFrame({ direction: "VERTICAL", gap: 3 });
    col.appendChild(
      await makeText(
        t,
        "caption",
        `${Math.max(1, count - 1)} of ${count} · ${Math.round((opts.progress ?? 0.64) * 100)}%`,
        "text/primary",
      ),
    );
    col.appendChild(drawProgressLinear(t, opts.progress ?? 0.64, false, 78, accent));
    cell.appendChild(col);
    col.layoutGrow = 1;
    cell.appendChild(icon(t, "x", 12, "text/muted"));
  } else {
    cell.appendChild(icon(t, "plus", 12, st === "active" ? accent : "text/muted"));
    cell.appendChild(
      await makeText(
        t,
        "caption",
        st === "active" ? "Release" : "Upload",
        st === "active" ? "text/primary" : "text/muted",
      ),
    );
  }
  return cell;
}

/** Image/video preview stand-in — a real thumbnail beats a generic type icon. */
function thumbSwatch(t: ThemeContext, from: string, to: string, size = 28): FrameNode {
  const f = autoFrame({ name: "thumb" });
  f.resize(size, size);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = size > 20 ? RADII.md : RADII.sm;
  f.clipsContent = true;
  f.fills = [
    {
      type: "GRADIENT_LINEAR",
      gradientTransform: [
        [0.7, 0.7, 0],
        [-0.7, 0.7, 0.6],
      ],
      gradientStops: [
        { position: 0, color: { ...solid(from).color, a: 1 } },
        { position: 1, color: { ...solid(to).color, a: 1 } },
      ],
    } as GradientPaint,
  ];
  strokeToken(t, f, "border/subtle", 1);
  return f;
}

// ── File type → accent mapping ────────────────────────────────
// One accent per family, so a glance at the badge tells you what kind of file
// it is. Kept to the accent ramp only — feedback colours stay for states.
type FileKind = { key: string; label: Bi; icon: string; tone: string; ext: string };

const FILE_TYPES: FileKind[] = [
  {
    key: "audio",
    label: ["Audio", ""],
    icon: "music",
    tone: "accent/primary",
    ext: "wav · mp3 · flac · aiff · ogg",
  },
  {
    key: "image",
    label: ["Image", ""],
    icon: "image",
    tone: "accent/ice",
    ext: "png · jpg · webp · heic · svg",
  },
  {
    key: "video",
    label: ["Video", ""],
    icon: "film",
    tone: "accent/dante",
    ext: "mov · mp4 · webm · avi",
  },
  {
    key: "doc",
    label: ["Document", ""],
    icon: "file",
    tone: "accent/secondary",
    ext: "pdf · doc · docx · txt · md",
  },
  {
    key: "archive",
    label: ["Archive", ""],
    icon: "archive",
    tone: "accent/violet",
    ext: "zip · rar · 7z · tar",
  },
  {
    key: "project",
    label: ["Project", ""],
    icon: "layers",
    tone: "accent/ember",
    ext: "psd · ai · als · flp · logicx",
  },
  {
    key: "other",
    label: ["Other", ""],
    icon: "file",
    tone: "text/muted",
    ext: "anything else",
  },
];

const EXT_TO_KIND: Record<string, string> = {
  wav: "audio",
  mp3: "audio",
  flac: "audio",
  aiff: "audio",
  aif: "audio",
  ogg: "audio",
  m4a: "audio",
  png: "image",
  jpg: "image",
  jpeg: "image",
  webp: "image",
  heic: "image",
  svg: "image",
  gif: "image",
  mov: "video",
  mp4: "video",
  webm: "video",
  avi: "video",
  mkv: "video",
  pdf: "doc",
  doc: "doc",
  docx: "doc",
  txt: "doc",
  md: "doc",
  rtf: "doc",
  csv: "doc",
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  tar: "archive",
  gz: "archive",
  psd: "project",
  ai: "project",
  als: "project",
  flp: "project",
  logicx: "project",
  sketch: "project",
  fig: "project",
};

/** Resolve a file name to its kind — falls back to `other`. */
function fileKindOf(name: string): FileKind {
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  const key = EXT_TO_KIND[ext] ?? "other";
  return FILE_TYPES.find((k) => k.key === key) ?? FILE_TYPES[FILE_TYPES.length - 1];
}

/** Legend board: extension family → icon + accent token. */
async function drawFileTypeLegend(t: ThemeContext, w: number): Promise<FrameNode> {
  const wrap = fixedCol(w, "VERTICAL");
  wrap.name = "file-type/legend";
  wrap.itemSpacing = 8;
  for (const k of FILE_TYPES) {
    const row = fixedCol(w, "HORIZONTAL");
    row.name = `file-type/${k.key}`;
    row.itemSpacing = 12;
    row.counterAxisAlignItems = "CENTER";
    row.paddingTop = row.paddingBottom = 8;
    row.paddingLeft = row.paddingRight = 12;
    row.cornerRadius = RADII.lg;
    fillToken(t, row, "bg/surface");
    strokeToken(t, row, "border/subtle", 1);
    row.appendChild(severityIcon(t, { icon: k.icon, tone: k.tone, shape: "rounded", size: "sm" }));
    const col = autoFrame({ direction: "VERTICAL", gap: 3 });
    col.appendChild(await makeText(t, "label/sm", `${k.label[0]}`, "text/primary"));
    col.appendChild(await makeText(t, "caption", k.ext, "text/muted"));
    row.appendChild(col);
    col.layoutGrow = 1;
    row.appendChild(await makeText(t, "mono/sm", k.tone, k.tone));
    wrap.appendChild(row);
  }
  return wrap;
}

type FileRowState = "queued" | "uploading" | "indeterminate" | "paused" | "done" | "error";

async function drawFileRow(
  t: ThemeContext,
  opts: {
    name: string;
    meta: string;
    state: FileRowState;
    progress?: number;
    iconName?: string;
    w: number;
    thumb?: [string, string]; // image/video preview instead of a type icon
    sub?: string; // second line under the bar: size · speed · ETA
    disabled?: boolean;
  },
): Promise<FrameNode> {
  const st = opts.state;
  const row = fixedCol(opts.w, "HORIZONTAL");
  row.name = `file-row/${st}`;
  row.itemSpacing = 12;
  row.counterAxisAlignItems = "CENTER";
  row.paddingTop = row.paddingBottom = 10;
  row.paddingLeft = row.paddingRight = 12;
  row.cornerRadius = RADII.lg;
  fillToken(t, row, "bg/surface");
  strokeToken(t, row, "border/subtle", 1);
  if (opts.disabled) row.opacity = 0.42;

  const tone =
    st === "error"
      ? "feedback/danger"
      : st === "done"
        ? "feedback/success"
        : st === "paused" || st === "queued"
          ? "text/muted"
          : "accent/primary";
  // The type badge is coloured by file kind (FILE_TYPES), not by state — state
  // lives in the bar, the meta line and the trailing action.
  const kind = fileKindOf(opts.name);
  const badgeTone = st === "error" ? "feedback/danger" : kind.tone;
  row.appendChild(
    opts.thumb
      ? thumbSwatch(t, opts.thumb[0], opts.thumb[1])
      : severityIcon(t, {
          icon: opts.iconName ?? kind.icon,
          tone: badgeTone,
          shape: "rounded",
          size: "sm",
        }),
  );

  const col = autoFrame({ direction: "VERTICAL", gap: 4 });
  col.appendChild(await makeText(t, "label/sm", opts.name, "text/primary"));
  const barW = 240;
  if (st === "uploading" || st === "paused") {
    col.appendChild(
      drawProgressLinear(
        t,
        opts.progress ?? 0.5,
        false,
        barW,
        st === "paused" ? "text/muted" : tone,
      ),
    );
  } else if (st === "indeterminate") {
    col.appendChild(drawProgressLinear(t, 0, true, barW, tone));
  } else if (st === "queued") {
    // empty track: it has a place in the queue but no progress yet
    col.appendChild(drawProgressLinear(t, 0, false, barW, tone));
  }
  if (st === "done" || st === "error") {
    col.appendChild(
      await makeText(t, "caption", opts.meta, st === "error" ? "feedback/danger" : "text/muted"),
    );
  } else if (opts.sub) {
    col.appendChild(await makeText(t, "caption", opts.sub, "text/muted"));
  }
  row.appendChild(col);
  col.layoutGrow = 1;

  if (st === "uploading")
    row.appendChild(
      await makeText(
        t,
        "caption",
        `${Math.round((opts.progress ?? 0.5) * 100)}%`,
        "text/secondary",
      ),
    );
  if (st === "queued") row.appendChild(icon(t, "clock", 14, "text/muted"));
  if (st === "indeterminate") row.appendChild(drawSpinner(t, "ring", "sm", "accent/primary"));
  if (st === "paused") {
    row.appendChild(icon(t, "play", 14, "accent/primary"));
    row.appendChild(await makeText(t, "label/sm", "Resume", "accent/primary"));
  }
  if (st === "done") row.appendChild(icon(t, "check", 16, "feedback/success"));
  if (st === "error") row.appendChild(await makeText(t, "label/sm", "Retry", "accent/primary"));
  row.appendChild(icon(t, "x", 14, "text/muted"));
  return row;
}

/** List header: how the batch as a whole is doing, plus the bulk actions. */
async function drawUploadSummary(
  t: ThemeContext,
  o: {
    done: number;
    total: number;
    pct: number;
    size: string;
    w: number;
    actions: Array<[string, string]>;
  },
): Promise<FrameNode> {
  const wrap = fixedCol(o.w, "VERTICAL");
  wrap.name = "upload-summary";
  wrap.itemSpacing = 10;
  wrap.paddingTop = wrap.paddingBottom = 12;
  wrap.paddingLeft = wrap.paddingRight = 12;
  wrap.cornerRadius = RADII.lg;
  fillToken(t, wrap, "bg/inset");
  strokeToken(t, wrap, "border/subtle", 1);

  const head = fixedCol(o.w - 24, "HORIZONTAL");
  head.itemSpacing = 8;
  head.counterAxisAlignItems = "CENTER";
  head.appendChild(
    await makeText(t, "label/sm", `${o.done} of ${o.total} uploaded`, "text/primary"),
  );
  head.appendChild(
    await makeText(t, "caption", `· ${Math.round(o.pct * 100)}% · ${o.size}`, "text/muted"),
  );
  const sp = rect(1, 1);
  sp.fills = [];
  sp.layoutGrow = 1;
  head.appendChild(sp);
  for (const [label, tone] of o.actions) {
    const b = await makeText(t, "label/sm", label, tone);
    head.appendChild(b);
  }
  wrap.appendChild(head);
  wrap.appendChild(drawProgressLinear(t, o.pct, false, o.w - 24, "accent/primary"));
  return wrap;
}

/** Errors that belong to the batch, not to any single file. */
async function drawUploadAlert(
  t: ThemeContext,
  o: { kind: "max-files" | "max-total" | "duplicate"; w: number },
): Promise<FrameNode> {
  const copy: Record<
    typeof o.kind,
    { text: string; action: string | null; tone: string; ico: string }
  > = {
    "max-files": {
      text: "Too many files — 12 picked, max is 10",
      action: "Trim list",
      tone: "feedback/danger",
      ico: "alert-triangle",
    },
    "max-total": {
      text: "Total size 264 MB exceeds the 200 MB limit",
      action: "Review",
      tone: "feedback/danger",
      ico: "alert-triangle",
    },
    duplicate: {
      text: "cover-3000.png is already in the list",
      action: "Keep both",
      tone: "feedback/warning",
      ico: "copy",
    },
  };
  const c = copy[o.kind];
  const row = fixedCol(o.w, "HORIZONTAL");
  row.name = `upload-alert/${o.kind}`;
  row.itemSpacing = 10;
  row.counterAxisAlignItems = "CENTER";
  row.paddingTop = row.paddingBottom = 10;
  row.paddingLeft = row.paddingRight = 12;
  row.cornerRadius = RADII.lg;
  row.fills = [tokenAlpha(c.tone, 0.08)];
  row.strokes = [tokenAlpha(c.tone, 0.35)];
  row.strokeWeight = 1;
  row.appendChild(icon(t, c.ico, 16, c.tone));
  row.appendChild(await makeText(t, "label/sm", c.text, "text/primary"));
  const sp = rect(1, 1);
  sp.fills = [];
  sp.layoutGrow = 1;
  row.appendChild(sp);
  if (c.action) row.appendChild(await makeText(t, "label/sm", c.action, "accent/primary"));
  row.appendChild(icon(t, "x", 14, "text/muted"));
  return row;
}

/** Nothing picked yet — the list collapses to a single quiet line. */
async function drawFilesEmpty(t: ThemeContext, w: number): Promise<FrameNode> {
  const row = fixedCol(w, "HORIZONTAL");
  row.name = "file-list/empty";
  row.itemSpacing = 10;
  row.counterAxisAlignItems = "CENTER";
  row.paddingTop = row.paddingBottom = 14;
  row.paddingLeft = row.paddingRight = 12;
  row.cornerRadius = RADII.lg;
  fillToken(t, row, "bg/inset");
  strokeToken(t, row, "border/subtle", 1);
  row.dashPattern = [7, 7];
  row.appendChild(icon(t, "file", 16, "text/muted"));
  row.appendChild(await makeText(t, "label/sm", "No files yet", "text/secondary"));
  const sp = rect(1, 1);
  sp.fills = [];
  sp.layoutGrow = 1;
  row.appendChild(sp);
  row.appendChild(await makeText(t, "caption", "Picked files appear here", "text/muted"));
  return row;
}

/** multiple: false — a single slot, replace instead of append. */
async function drawSingleFile(
  t: ThemeContext,
  o: { filled: boolean; w: number },
): Promise<FrameNode> {
  const row = fixedCol(o.w, "HORIZONTAL");
  row.name = `file-single/${o.filled ? "filled" : "empty"}`;
  row.itemSpacing = 12;
  row.counterAxisAlignItems = "CENTER";
  row.paddingTop = row.paddingBottom = 10;
  row.paddingLeft = row.paddingRight = 12;
  row.cornerRadius = RADII.lg;
  if (o.filled) {
    fillToken(t, row, "bg/surface");
    strokeToken(t, row, "border/subtle", 1);
    row.appendChild(thumbSwatch(t, "#2A6F62", "#5EE6C1"));
  } else {
    fillToken(t, row, "bg/inset");
    strokeToken(t, row, "border/default", 1);
    row.dashPattern = [7, 7];
    row.appendChild(icon(t, "upload", 16, "text/secondary"));
  }
  row.strokeWeight = 1;
  const col = autoFrame({ direction: "VERTICAL", gap: 3 });
  col.appendChild(
    await makeText(
      t,
      "label/sm",
      o.filled ? "cover-3000.png" : "No file chosen",
      o.filled ? "text/primary" : "text/secondary",
    ),
  );
  col.appendChild(
    await makeText(
      t,
      "caption",
      o.filled ? "8.4 MB · uploaded" : "PNG or JPG · up to 50 MB",
      "text/muted",
    ),
  );
  row.appendChild(col);
  col.layoutGrow = 1;
  if (o.filled) {
    row.appendChild(await makeText(t, "label/sm", "Replace", "accent/primary"));
    row.appendChild(icon(t, "trash", 14, "text/muted"));
  } else {
    row.appendChild(await drawButton(t, "Ghost", "Default", "sm", "rounded", "Choose file"));
  }
  return row;
}

/** No zone at all — a button plus a count that opens the list in a modal. */
async function drawUploadButtonOnly(t: ThemeContext, w: number): Promise<FrameNode> {
  const row = fixedCol(w, "HORIZONTAL");
  row.name = "file-upload/button-only";
  row.itemSpacing = 12;
  row.counterAxisAlignItems = "CENTER";
  row.appendChild(await drawButton(t, "Soft", "Default", "sm", "pill", "Browse files"));
  row.appendChild(await makeText(t, "caption", "3 files · 26.4 MB", "text/muted"));
  const sp = rect(1, 1);
  sp.fills = [];
  sp.layoutGrow = 1;
  row.appendChild(sp);
  row.appendChild(await makeText(t, "label/sm", "View all", "accent/primary"));
  row.appendChild(iconArrow(t, 14, "accent/primary", true));
  return row;
}

/** The list the button-only variant opens: summary + rows in a modal. */
async function drawUploadModal(t: ThemeContext): Promise<FrameNode> {
  const H = 420;
  const DW = 520;
  const scrim = figma.createFrame();
  scrim.name = "file-upload/modal";
  scrim.resize(CANVAS_INNER, H);
  scrim.cornerRadius = RADII.lg;
  scrim.clipsContent = true;
  scrim.fills = [{ ...solid("#05060A"), opacity: 0.55 } as SolidPaint];

  const dialog = autoFrame({ direction: "VERTICAL", gap: 14, padding: 20 });
  dialog.resize(DW, dialog.height);
  dialog.counterAxisSizingMode = "FIXED";
  dialog.cornerRadius = RADII.xl;
  fillToken(t, dialog, "bg/surface");
  strokeToken(t, dialog, "border/subtle", 1);
  await applyEffect(dialog, "shadow/lg", t);

  const head = fixedCol(DW - 40, "HORIZONTAL");
  head.itemSpacing = 8;
  head.counterAxisAlignItems = "CENTER";
  head.appendChild(await makeText(t, "heading/h4", "Uploads", "text/primary"));
  const hsp = rect(1, 1);
  hsp.fills = [];
  hsp.layoutGrow = 1;
  head.appendChild(hsp);
  head.appendChild(icon(t, "x", 16, "text/muted"));
  dialog.appendChild(head);

  const inner = DW - 40;
  dialog.appendChild(
    await drawUploadSummary(t, {
      done: 2,
      total: 3,
      pct: 0.72,
      size: "26.4 MB / 41 MB",
      w: inner,
      actions: [["Cancel all", "text/muted"]],
    }),
  );
  const list = autoFrame({ direction: "VERTICAL", gap: 8 });
  list.appendChild(
    await drawFileRow(t, {
      w: inner,
      name: "night-drive-master.wav",
      meta: "",
      state: "uploading",
      progress: 0.64,
      iconName: "music",
      sub: "5.4 MB / 8.4 MB · 1.2 MB/s · 3 s left",
    }),
  );
  list.appendChild(
    await drawFileRow(t, {
      w: inner,
      name: "cover-3000.png",
      meta: "8.4 MB · uploaded",
      state: "done",
      thumb: ["#2A6F62", "#5EE6C1"],
    }),
  );
  list.appendChild(
    await drawFileRow(t, {
      w: inner,
      name: "sleeve-back.png",
      meta: "9.6 MB · uploaded",
      state: "done",
      thumb: ["#3B2A6F", "#818CF8"],
    }),
  );
  dialog.appendChild(list);
  dialog.appendChild(await drawUploadButtonOnly(t, inner));

  scrim.appendChild(dialog);
  dialog.x = (CANVAS_INNER - DW) / 2;
  dialog.y = Math.max(16, (H - dialog.height) / 2);
  return scrim;
}

async function fileUploadBoard(t: ThemeContext): Promise<FrameNode> {
  const zones = await tileGrid(
    t,
    [
      { label: ["Default", ""], node: await drawDropzone(t, {}) },
      {
        label: ["Focus · keyboard", ""],
        node: await drawDropzone(t, { state: "focus" }),
      },
      {
        label: ["Drag over · Dante", ""],
        node: await drawDropzone(t, { state: "active", tone: "accent/dante" }),
      },
      {
        label: ["Drag over · reject", ""],
        node: await drawDropzone(t, { state: "reject" }),
      },
      { label: ["Error", ""], node: await drawDropzone(t, { state: "error" }) },
      { label: ["Disabled", ""], node: await drawDropzone(t, { state: "disabled" }) },
      { label: ["Read-only", ""], node: await drawDropzone(t, { state: "readonly" }) },
    ],
    460,
  );

  // compact forms — inline for sidebars/forms, cell for tables
  const compact = await tileGrid(
    t,
    [
      { label: ["Inline · default", ""], node: await drawDropzoneInline(t, {}) },
      {
        label: ["Inline · drag over", ""],
        node: await drawDropzoneInline(t, { state: "active", tone: "accent/dante" }),
      },
      {
        label: ["Inline · error", ""],
        node: await drawDropzoneInline(t, { state: "error" }),
      },
      {
        label: ["Inline · disabled", ""],
        node: await drawDropzoneInline(t, { state: "disabled" }),
      },
    ],
    460,
  );

  const cells = canvas(t);
  cells.counterAxisAlignItems = "CENTER";
  const cellSpecs: Array<{ st: CellState; label: string; w: number }> = [
    { st: "empty", label: "empty", w: 150 },
    { st: "active", label: "drag over", w: 150 },
    { st: "filled", label: "1 file", w: 190 },
    { st: "multi", label: "2+ files", w: 170 },
    { st: "uploading", label: "uploading 2 of 3", w: 210 },
    { st: "disabled", label: "disabled", w: 150 },
  ];
  // two rows of three — six cells side by side would overflow the canvas
  const cellWrap = autoFrame({ direction: "VERTICAL", gap: 18, cross: "CENTER" });
  for (let i = 0; i < cellSpecs.length; i += 3) {
    const cellRow = autoFrame({ direction: "HORIZONTAL", gap: 18, cross: "CENTER" });
    for (const c of cellSpecs.slice(i, i + 3)) {
      const cellCol = autoFrame({ direction: "VERTICAL", gap: 8, cross: "CENTER" });
      cellCol.appendChild(
        await drawDropzoneCell(t, { state: c.st, w: c.w, tone: "accent/dante", count: 3 }),
      );
      cellCol.appendChild(await makeText(t, "caption", c.label, "text/muted"));
      cellRow.appendChild(cellCol);
    }
    cellWrap.appendChild(cellRow);
  }
  cells.appendChild(cellWrap);

  const W = 560;
  const files = canvas(t);
  files.counterAxisAlignItems = "CENTER";
  const fCol = autoFrame({ direction: "VERTICAL", gap: 8 });
  fCol.appendChild(
    await drawFileRow(t, {
      w: W,
      name: "stems-pack.zip",
      meta: "",
      state: "queued",
      sub: "Queued · 3rd in line",
    }),
  );
  fCol.appendChild(
    await drawFileRow(t, {
      w: W,
      name: "night-drive-master.wav",
      meta: "",
      state: "uploading",
      progress: 0.64,
      sub: "5.4 MB / 8.4 MB · 1.2 MB/s · 3 s left",
    }),
  );
  fCol.appendChild(
    await drawFileRow(t, {
      w: W,
      name: "live-set-stream.wav",
      meta: "",
      state: "indeterminate",
      sub: "Uploading… · size unknown · 1.4 MB/s",
    }),
  );
  fCol.appendChild(
    await drawFileRow(t, {
      w: W,
      name: "artwork-layers.psd",
      meta: "",
      state: "paused",
      progress: 0.38,
      sub: "Paused · 12.1 MB / 32 MB",
    }),
  );
  fCol.appendChild(
    await drawFileRow(t, {
      w: W,
      name: "release-notes.pdf",
      meta: "1.2 MB · uploaded",
      state: "done",
    }),
  );
  fCol.appendChild(
    await drawFileRow(t, {
      w: W,
      name: "cover-3000.png",
      meta: "8.4 MB · uploaded",
      state: "done",
      thumb: ["#2A6F62", "#5EE6C1"],
    }),
  );
  fCol.appendChild(
    await drawFileRow(t, {
      w: W,
      name: "video-4k.mov",
      meta: "212 MB — over the 50 MB limit",
      state: "error",
      thumb: ["#6F2A45", "#FF3D8B"],
    }),
  );
  fCol.appendChild(
    await drawFileRow(t, {
      w: W,
      name: "old-master.wav",
      meta: "8.4 MB · locked",
      state: "done",
      disabled: true,
    }),
  );
  files.appendChild(fCol);

  // file type → accent mapping, read alongside the rows above
  const types = canvas(t);
  types.counterAxisAlignItems = "CENTER";
  types.appendChild(await drawFileTypeLegend(t, W));

  // batch level: summary, bulk actions, batch errors, empty
  const list = canvas(t);
  list.counterAxisAlignItems = "CENTER";
  const lCol = autoFrame({ direction: "VERTICAL", gap: 10 });
  lCol.appendChild(
    await drawUploadSummary(t, {
      done: 2,
      total: 5,
      pct: 0.64,
      size: "26.4 MB / 41 MB",
      w: W,
      actions: [["Cancel all", "text/muted"]],
    }),
  );
  lCol.appendChild(
    await drawUploadSummary(t, {
      done: 5,
      total: 5,
      pct: 1,
      size: "41 MB",
      w: W,
      actions: [
        ["Retry all", "accent/primary"],
        ["Clear completed", "text/muted"],
      ],
    }),
  );
  lCol.appendChild(await drawUploadAlert(t, { kind: "max-files", w: W }));
  lCol.appendChild(await drawUploadAlert(t, { kind: "max-total", w: W }));
  lCol.appendChild(await drawUploadAlert(t, { kind: "duplicate", w: W }));
  lCol.appendChild(await drawFilesEmpty(t, W));
  list.appendChild(lCol);

  // variants: single slot, button-only, and the modal it opens
  const variants = canvas(t);
  variants.counterAxisAlignItems = "CENTER";
  const vCol = autoFrame({ direction: "VERTICAL", gap: 10 });
  vCol.appendChild(await drawSingleFile(t, { filled: false, w: W }));
  vCol.appendChild(await drawSingleFile(t, { filled: true, w: W }));
  vCol.appendChild(hairline(t, W));
  vCol.appendChild(await drawUploadButtonOnly(t, W));
  variants.appendChild(vCol);

  const props: PropRow[] = [
    { prop: "accept", type: "string[]", def: "*", note: ["Allowed types.", ""] },
    { prop: "maxSize", type: "number", def: "—", note: ["Per-file limit.", ""] },
    {
      prop: "maxFiles",
      type: "number",
      def: "—",
      note: ["Count limit → list-level error.", ""],
    },
    {
      prop: "maxTotal",
      type: "number",
      def: "—",
      note: ["Total size limit.", ""],
    },
    {
      prop: "multiple",
      type: "boolean",
      def: "true",
      note: ["false → single-file variant.", "false → ."],
    },
    {
      prop: "variant",
      type: "zone|inline|cell|button",
      def: "zone",
      note: ["Form factor; cell fits tables.", "; cell — ."],
    },
    {
      prop: "cellState",
      type: "empty|active|filled|multi|uploading|disabled",
      def: "empty",
      note: ["Cell state; multi = 2+ files (rare).", "; multi = 2+ ()."],
    },
    {
      prop: "stackMax",
      type: "number",
      def: "3",
      note: ["Previews before the count in a cell.", ""],
    },
    {
      prop: "state",
      type: "default|focus|active|reject|error|disabled|readonly",
      def: "default",
      note: ["Zone visual state.", ""],
    },
    {
      prop: "fileState",
      type: "queued|uploading|indeterminate|paused|done|error",
      def: "queued",
      note: ["Per-row state.", ""],
    },
    {
      prop: "thumbnails",
      type: "boolean",
      def: "true",
      note: ["Preview for images/video.", ""],
    },
    {
      prop: "fileKind",
      type: "audio|image|video|doc|archive|project|other",
      def: "auto",
      note: ["From the extension → badge icon + accent.", ""],
    },
    {
      prop: "showSpeed",
      type: "boolean",
      def: "true",
      note: ["Speed and ETA under the bar.", "ETA ."],
    },
    {
      prop: "tone",
      type: "token",
      def: "accent/primary",
      note: ["Drag-over colour (dante-ready).", "( dante)."],
    },
    {
      prop: "onDrop",
      type: "(files)=>void",
      def: "—",
      note: ["Fires on drop / pick.", ""],
    },
    {
      prop: "onPause",
      type: "(id)=>void",
      def: "—",
      note: ["Pause / resume a transfer.", ""],
    },
    {
      prop: "onCancelAll",
      type: "()=>void",
      def: "—",
      note: ["Bulk actions in the summary.", ""],
    },
  ];
  return componentBoard(
    t,
    "File upload",
    ["Bring files in: drag & drop + progress", ": drag & drop +"],
    ["No progress to show at all → simple Button", "→ Button"],
    [
      await block(t, "Dropzone", zones),
      await block(t, "Compact", compact),
      await block(t, "Table cell", cells),
      await block(t, "Files", files),
      await block(t, "File types", types),
      await block(t, "List", list),
      await block(t, "Variants", variants),
      await block(t, "Modal", await drawUploadModal(t)),
    ],
    props,
  );
}

// ── Drawer / Sheet ────────────────────────────────────────────

async function drawDrawer(t: ThemeContext, side: "right" | "bottom"): Promise<FrameNode> {
  const W = CANVAS_INNER;
  const H = 380;
  const scrim = figma.createFrame();
  scrim.name = `drawer/${side}`;
  scrim.resize(W, H);
  scrim.cornerRadius = RADII.lg;
  scrim.clipsContent = true;
  scrim.fills = [{ ...solid("#05060A"), opacity: 0.55 } as SolidPaint];
  if (side === "right") {
    const p = autoFrame({ direction: "VERTICAL", gap: 0, name: "panel" });
    p.resize(320, H);
    p.primaryAxisSizingMode = "FIXED";
    p.counterAxisSizingMode = "FIXED";
    fillToken(t, p, "bg/surface");
    strokeToken(t, p, "border/subtle", 1);
    const head = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", padding: [16, 18] });
    head.layoutAlign = "STRETCH";
    head.primaryAxisSizingMode = "FIXED";
    head.appendChild(await makeText(t, "heading/h4", "Track details", "text/primary"));
    const sp = rect(1, 1);
    sp.fills = [];
    head.appendChild(sp);
    sp.layoutGrow = 1;
    head.appendChild(icon(t, "x", 16, "text/muted"));
    p.appendChild(head);
    p.appendChild(hairline(t, 320));
    const body = autoFrame({ direction: "VERTICAL", gap: 0, padding: [8, 6] });
    body.layoutAlign = "STRETCH";
    body.appendChild(await kvRow(t, "Title", "Night drive vol. 2", 308));
    body.appendChild(await kvRow(t, "BPM", "104", 308));
    body.appendChild(await kvRow(t, "Key", "F minor", 308));
    body.appendChild(await kvRow(t, "Mood", "signature · dante", 308));
    p.appendChild(body);
    const grow = rect(1, 1);
    grow.fills = [];
    p.appendChild(grow);
    grow.layoutGrow = 1;
    p.appendChild(hairline(t, 320));
    const foot = autoFrame({
      direction: "HORIZONTAL",
      gap: 10,
      cross: "CENTER",
      padding: [14, 18],
    });
    foot.layoutAlign = "STRETCH";
    foot.primaryAxisSizingMode = "FIXED";
    const fsp = rect(1, 1);
    fsp.fills = [];
    foot.appendChild(fsp);
    fsp.layoutGrow = 1;
    foot.appendChild(await dialogBtn(t, "Cancel", "secondary"));
    foot.appendChild(await dialogBtn(t, "Save", "accent/primary"));
    p.appendChild(foot);
    scrim.appendChild(p);
    p.x = W - 320;
    p.y = 0;
  } else {
    const p = autoFrame({ direction: "VERTICAL", gap: 12, padding: [10, 18], cross: "CENTER" });
    p.resize(W, p.height);
    p.counterAxisSizingMode = "FIXED";
    fillToken(t, p, "bg/surface");
    strokeToken(t, p, "border/subtle", 1);
    p.topLeftRadius = RADII.xl;
    p.topRightRadius = RADII.xl;
    const handle = rect(36, 4, 2);
    fillToken(t, handle, "border/strong");
    p.appendChild(handle);
    const title = await makeText(t, "heading/h4", "Add to playlist", "text/primary");
    p.appendChild(title);
    title.layoutAlign = "MIN";
    p.appendChild(
      await drawListItem(t, {
        w: W - 36,
        lead: severityIcon(t, {
          icon: "music",
          tone: "accent/primary",
          shape: "rounded",
          size: "sm",
        }),
        title: "Night drive vol. 2",
        sub: "18 tracks",
        trail: icon(t, "plus", 16, "text/muted"),
      }),
    );
    p.appendChild(
      await drawListItem(t, {
        w: W - 36,
        lead: severityIcon(t, {
          icon: "heart",
          tone: "accent/dante",
          shape: "rounded",
          size: "sm",
        }),
        title: "Signature — dante",
        sub: "12 tracks",
        trail: icon(t, "plus", 16, "text/muted"),
      }),
    );
    p.paddingBottom = 16;
    scrim.appendChild(p);
    p.x = 0;
    p.y = H - p.height;
  }
  return scrim;
}

async function drawerBoard(t: ThemeContext): Promise<FrameNode> {
  const right = canvas(t);
  right.appendChild(await drawDrawer(t, "right"));
  const bottom = canvas(t);
  bottom.appendChild(await drawDrawer(t, "bottom"));
  const props: PropRow[] = [
    {
      prop: "side",
      type: "right|left|bottom",
      def: "right",
      note: ["Edge it slides from.", ""],
    },
    {
      prop: "size",
      type: "number | %",
      def: "320",
      note: ["Panel width / height.", ""],
    },
    {
      prop: "modal",
      type: "boolean",
      def: "true",
      note: ["Scrim + focus trap.", ""],
    },
    {
      prop: "dismissible",
      type: "boolean",
      def: "true",
      note: ["Close on scrim / Esc / swipe.", "/ Esc / ."],
    },
    {
      prop: "handle",
      type: "boolean",
      def: "true (bottom)",
      note: ["Grab bar on sheets.", ""],
    },
  ];
  return componentBoard(
    t,
    "Drawer / Sheet",
    ["Side or bottom panel for details & quick edits", ""],
    ["A blocking decision → use Dialog", "→ Dialog"],
    [await block(t, "Right drawer", right), await block(t, "Bottom sheet", bottom)],
    props,
  );
}

// ── Avatar group (stack) ──────────────────────────────────────

async function drawAvatarStack(
  t: ThemeContext,
  opts: {
    count?: number;
    size?: Size;
    overflow?: number;
    hues?: Array<"mint" | "dante" | "indigo">;
    overlap?: number;
  } = {},
): Promise<FrameNode> {
  const n = opts.count ?? 4;
  const size = opts.size ?? "sm";
  const d = { sm: 36, md: 48, lg: 64 }[size];
  const step = Math.round(d * (opts.overlap ?? 0.68));
  const hues = opts.hues ?? ["mint"];
  const initialsPool = ["OK", "AB", "MK", "LN", "TS", "JD"];
  const f = figma.createFrame();
  f.name = "avatar-stack";
  f.fills = [];
  f.clipsContent = false;
  let x = 0;
  for (let i = 0; i < n; i++) {
    const av = await drawAvatar2(t, {
      size,
      hue: hues[i % hues.length],
      initials: initialsPool[i % initialsPool.length],
    });
    strokeToken(t, av, "bg/canvas", 3);
    f.appendChild(av);
    av.x = x;
    av.y = 0;
    x += step;
  }
  if (opts.overflow) {
    const more = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    more.resize(d, d);
    more.primaryAxisSizingMode = "FIXED";
    more.counterAxisSizingMode = "FIXED";
    more.cornerRadius = RADII.full;
    fillToken(t, more, "bg/surface-raised");
    strokeToken(t, more, "bg/canvas", 3);
    more.appendChild(
      await makeText(
        t,
        size === "lg" ? "label/md" : "label/sm",
        `+${opts.overflow}`,
        "text/secondary",
      ),
    );
    f.appendChild(more);
    more.x = x;
    more.y = 0;
    x += step;
  }
  f.resize(x - step + d, d);
  return f;
}

async function avatarGroupBoard(t: ThemeContext): Promise<FrameNode> {
  const sizes = await tileGrid(
    t,
    [
      { label: SIZE_LABEL.sm, node: await drawAvatarStack(t, { size: "sm", overflow: 3 }) },
      { label: SIZE_LABEL.md, node: await drawAvatarStack(t, { size: "md", overflow: 3 }) },
      {
        label: SIZE_LABEL.lg,
        node: await drawAvatarStack(t, { size: "lg", count: 3, overflow: 2 }),
      },
    ],
    300,
  );
  const hues = await tileGrid(
    t,
    [
      { label: ["Mint team", ""], node: await drawAvatarStack(t, { count: 5 }) },
      {
        label: ["Cosmic mix", ""],
        node: await drawAvatarStack(t, { count: 5, hues: ["mint", "dante", "indigo"] }),
      },
      {
        label: ["Dante crew", ""],
        node: await drawAvatarStack(t, { count: 4, hues: ["dante"], overflow: 9 }),
      },
    ],
    300,
  );
  const density = await tileGrid(
    t,
    [
      { label: ["Dense", ""], node: await drawAvatarStack(t, { count: 5, overlap: 0.55 }) },
      { label: ["Default", ""], node: await drawAvatarStack(t, { count: 5, overlap: 0.68 }) },
      { label: ["Loose", ""], node: await drawAvatarStack(t, { count: 5, overlap: 0.85 }) },
    ],
    300,
  );
  const labeledRow = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  labeledRow.appendChild(await drawAvatarStack(t, { count: 3, overflow: 9 }));
  labeledRow.appendChild(
    await makeText(t, "body/sm", "12 collaborators · 3 online", "text/secondary"),
  );
  const labeled = await tileGrid(t, [{ label: ["With count", ""], node: labeledRow }], 420);
  const props: PropRow[] = [
    { prop: "max", type: "number", def: "5", note: ["Visible before +N.", "+N."] },
    {
      prop: "total",
      type: "number",
      def: "—",
      note: ["Real count for the +N chip.", "+N."],
    },
    { prop: "size", type: "sm|md|lg", def: "sm", note: ["Avatar diameter.", ""] },
    {
      prop: "spacing",
      type: "dense|default|loose",
      def: "default",
      note: ["Overlap amount.", ""],
    },
    {
      prop: "ring",
      type: "boolean",
      def: "true",
      note: ["Canvas-coloured ring.", ""],
    },
    {
      prop: "hues",
      type: "(mint|dante|indigo)[]",
      def: "mint",
      note: ["Gradient mix per member.", ""],
    },
  ];
  return componentBoard(
    t,
    "Avatar group",
    ["Show a team compactly; extras collapse to +N", "; — +N"],
    ["One person → use Avatar", "→ Avatar"],
    [
      await block(t, "Sizes", sizes),
      await block(t, "Hues", hues),
      await block(t, "Density", density),
      await block(t, "With count", labeled),
    ],
    props,
  );
}

// ── Fun charts — waveform, heatmap, radar, rings, funnel, gauge ──

function waveformChart(
  t: ThemeContext,
  w: number,
  h: number,
  played = 0.42,
  tone = "accent/dante",
): FrameNode {
  const f = figma.createFrame();
  f.name = "chart/waveform";
  f.resize(w, h);
  f.fills = [];
  f.clipsContent = false;
  const barW = 3;
  const gap = 2;
  const n = Math.floor((w + gap) / (barW + gap));
  const mid = h / 2;
  for (let i = 0; i < n; i++) {
    const wob = Math.sin(i * 0.55) * 0.25 + Math.sin(i * 0.21 + 1.3) * 0.35;
    const noise = ((i * 37) % 13) / 13;
    const amp = Math.max(0.12, Math.min(1, 0.35 + wob + noise * 0.45));
    const bh = Math.max(3, Math.round(amp * h));
    const bar = rect(barW, bh, barW / 2);
    if (i / n <= played) fillToken(t, bar, tone);
    else fillToken(t, bar, "border/strong");
    f.appendChild(bar);
    bar.x = i * (barW + gap);
    bar.y = mid - bh / 2;
  }
  const px = Math.round(played * w);
  const head = rect(2, h + 6, 1);
  fillToken(t, head, "text/primary");
  f.appendChild(head);
  head.x = px;
  head.y = -3;
  const dot = ellipse(6);
  fillToken(t, dot, tone);
  dot.effects = [toneGlow(tone, 6, 0.6)];
  f.appendChild(dot);
  dot.x = px - 2;
  dot.y = -9;
  return f;
}

function heatmapChart(
  t: ThemeContext,
  weeks: number,
  cell: number,
  gap: number,
  tone = "accent/primary",
): FrameNode {
  const rows = 7;
  const f = figma.createFrame();
  f.name = "chart/heatmap";
  f.fills = [];
  f.clipsContent = false;
  f.resize(weeks * (cell + gap) - gap, rows * (cell + gap) - gap);
  for (let wk = 0; wk < weeks; wk++) {
    for (let r = 0; r < rows; r++) {
      const v = (((wk * 7 + r) * 31) % 17) / 17;
      const lvl = v < 0.28 ? 0 : v < 0.52 ? 1 : v < 0.74 ? 2 : v < 0.9 ? 3 : 4;
      const sq = rect(cell, cell, 3);
      if (lvl === 0) fillToken(t, sq, "bg/surface-raised");
      else sq.fills = [tokenAlpha(tone, [0.22, 0.42, 0.68, 1][lvl - 1])];
      f.appendChild(sq);
      sq.x = wk * (cell + gap);
      sq.y = r * (cell + gap);
    }
  }
  return f;
}

async function radarChart(
  t: ThemeContext,
  size: number,
  values: number[],
  labels: string[],
  tone = "accent/primary",
): Promise<FrameNode> {
  const f = figma.createFrame();
  f.name = "chart/radar";
  f.resize(size, size);
  f.fills = [];
  f.clipsContent = false;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 26;
  const N = values.length;
  const pt = (i: number, k: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
    return [cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k];
  };
  // A polygon vector translated so path coords start at (0,0) — then placed back.
  const polyNode = (ks: number[] | null, k: number): VectorNode => {
    const pts = Array.from({ length: N }, (_, i) => pt(i, ks ? ks[i] : k));
    const minX = Math.min(...pts.map((p) => p[0]));
    const minY = Math.min(...pts.map((p) => p[1]));
    const data =
      "M " +
      pts.map((p) => `${(p[0] - minX).toFixed(1)} ${(p[1] - minY).toFixed(1)}`).join(" L ") +
      " Z";
    const v = figma.createVector();
    v.vectorPaths = [{ windingRule: "NONZERO", data }];
    f.appendChild(v);
    v.x = minX;
    v.y = minY;
    return v;
  };
  for (const k of [0.33, 0.66, 1]) {
    const ring = polyNode(null, k);
    ring.fills = [];
    strokeToken(t, ring, "border/subtle", 1);
  }
  for (let i = 0; i < N; i++) {
    const [px, py] = pt(i, 1);
    const minX = Math.min(cx, px);
    const minY = Math.min(cy, py);
    const spoke = figma.createVector();
    spoke.vectorPaths = [
      {
        windingRule: "NONZERO",
        data: `M ${(cx - minX).toFixed(1)} ${(cy - minY).toFixed(1)} L ${(px - minX).toFixed(1)} ${(py - minY).toFixed(1)}`,
      },
    ];
    spoke.fills = [];
    strokeToken(t, spoke, "border/subtle", 1);
    f.appendChild(spoke);
    spoke.x = minX;
    spoke.y = minY;
  }
  const dataPoly = polyNode(values, 1);
  dataPoly.fills = [tokenAlpha(tone, 0.22)];
  strokeToken(t, dataPoly, tone, 2);
  for (let i = 0; i < N; i++) {
    const [px, py] = pt(i, values[i]);
    const d = ellipse(6);
    fillToken(t, d, tone);
    f.appendChild(d);
    d.x = px - 3;
    d.y = py - 3;
  }
  for (let i = 0; i < N; i++) {
    const [px, py] = pt(i, 1.24);
    const lb = await makeText(t, "caption", labels[i] ?? "", "text/muted");
    f.appendChild(lb);
    lb.x = Math.round(px - lb.width / 2);
    lb.y = Math.round(py - lb.height / 2);
  }
  return f;
}

function ringsChart(t: ThemeContext, size: number, vals: [number, number, number]): FrameNode {
  const f = figma.createFrame();
  f.name = "chart/rings";
  f.resize(size, size);
  f.fills = [];
  const tones = ["accent/primary", "accent/dante", "accent/secondary"];
  for (let i = 0; i < 3; i++) {
    const d = size - i * 28;
    const off = (size - d) / 2;
    const inner = 1 - 10 / (d / 2);
    const track = ellipse(d);
    track.arcData = { startingAngle: 0, endingAngle: Math.PI * 2, innerRadius: inner };
    track.fills = [tokenAlpha(tones[i], 0.14)];
    f.appendChild(track);
    track.x = off;
    track.y = off;
    const arc = ellipse(d);
    arc.arcData = {
      startingAngle: -Math.PI / 2,
      endingAngle: -Math.PI / 2 + vals[i] * Math.PI * 2,
      innerRadius: inner,
    };
    fillToken(t, arc, tones[i]);
    f.appendChild(arc);
    arc.x = off;
    arc.y = off;
  }
  return f;
}

async function funnelChart(
  t: ThemeContext,
  w: number,
  stages: Array<[string, number]>,
  tone = "accent/primary",
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 8, name: "chart/funnel" });
  col.resize(w, col.height);
  col.counterAxisSizingMode = "FIXED";
  const alphas = [1, 0.7, 0.45, 0.25];
  const max = stages[0][1];
  const barMax = w - 64 - 10 - 44;
  for (let i = 0; i < stages.length; i++) {
    const [label, v] = stages[i];
    const row = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
    row.layoutAlign = "STRETCH";
    row.primaryAxisSizingMode = "FIXED";
    const lb = fixedCol(64, "HORIZONTAL");
    lb.appendChild(await makeText(t, "caption", label, "text/secondary"));
    row.appendChild(lb);
    const bar = rect(Math.max(8, Math.round(barMax * (v / max))), 16, 8);
    bar.fills = [tokenAlpha(tone, alphas[Math.min(i, 3)])];
    row.appendChild(bar);
    row.appendChild(await makeText(t, "mono/sm", `${Math.round((v / max) * 100)}%`, "text/muted"));
    col.appendChild(row);
  }
  return col;
}

async function gaugeChart(
  t: ThemeContext,
  size: number,
  value: number,
  tone = "accent/dante",
): Promise<FrameNode> {
  const f = figma.createFrame();
  f.name = "chart/gauge";
  f.fills = [];
  f.clipsContent = false;
  f.resize(size, size / 2 + 36);
  const inner = 1 - 14 / (size / 2);
  const track = ellipse(size);
  track.arcData = { startingAngle: -Math.PI, endingAngle: 0, innerRadius: inner };
  track.fills = [tokenAlpha(tone, 0.14)];
  f.appendChild(track);
  track.x = 0;
  track.y = 0;
  const arc = ellipse(size);
  arc.arcData = {
    startingAngle: -Math.PI,
    endingAngle: -Math.PI + value * Math.PI,
    innerRadius: inner,
  };
  fillToken(t, arc, tone);
  arc.effects = [toneGlow(tone, 14, 0.4)];
  f.appendChild(arc);
  arc.x = 0;
  arc.y = 0;
  const big = await makeText(t, "heading/h2", `${Math.round(value * 100)}%`, "text/primary");
  f.appendChild(big);
  big.x = Math.round(size / 2 - big.width / 2);
  big.y = Math.round(size / 2 - big.height + 4);
  const cap = await makeText(t, "caption", "of weekly goal", "text/muted");
  f.appendChild(cap);
  cap.x = Math.round(size / 2 - cap.width / 2);
  cap.y = Math.round(size / 2 + 10);
  return f;
}

async function layoutBoards(
  t: ThemeContext,
  page: PageNode,
  boards: FrameNode[],
  labelText: string,
): Promise<void> {
  for (const b of boards) page.appendChild(b);
  rowBoards(boards, 96);
  const label = await makeText(t, "overline", labelText, "accent/primary");
  page.appendChild(label);
  label.x = 0;
  label.y = -72;
}

// Lay named sections vertically; within a section boards sit in a horizontal row.
async function paintSections(
  t: ThemeContext,
  page: PageNode,
  sections: Array<{ title: string; boards: FrameNode[] }>,
  labelText: string,
): Promise<void> {
  const colGap = 96;
  const headerGap = 56;
  const sectionGap = 220;
  let y = 0;
  for (const s of sections) {
    const h = await makeText(t, "heading/h2", s.title, "text/primary");
    page.appendChild(h);
    h.x = 0;
    h.y = y;
    const rowY = y + h.height + headerGap;
    let x = 0;
    let maxH = 0;
    for (const b of s.boards) {
      page.appendChild(b);
      b.x = x;
      b.y = rowY;
      x += b.width + colGap;
      maxH = Math.max(maxH, b.height);
    }
    y = rowY + maxH + sectionGap;
  }
  const label = await makeText(t, "overline", labelText, "accent/primary");
  page.appendChild(label);
  label.x = 0;
  label.y = -72;
}

export async function paintBasic(t: ThemeContext, page: PageNode): Promise<void> {
  // Each section is painted under its own tone (see SECTION_TONE) — components
  // that read sectionTone() inherit it instead of defaulting to mint.
  const sections = [
    await tonedSection("Inputs", "inputs", () => [
      textFieldBoard(t),
      textAreaBoard(t),
      richEditorBoard(t),
      inputActionBoard(t),
      numberBoard(t),
      dateFieldBoard(t),
      selectBoard(t),
      autocompleteBoard(t),
      fileUploadBoard(t),
    ]),
    await tonedSection("Selection & toggles", "selection", () => [
      checkboxBoard(t),
      radioBoard(t),
      switchBoard(t),
      sliderBoard(t),
      segmentedBoard(t),
      ratingBoard(t),
      chipBoard(t),
      chipGroupBoard(t),
    ]),
    await tonedSection("Actions", "actions", () => [
      buttonBoard(t),
      buttonGroupBoard(t),
      iconButtonBoard(t),
      fabBoard(t),
      kbdBoard(t),
    ]),
    await tonedSection("Navigation", "navigation", () => [
      tabsBoard(t),
      breadcrumbsBoard(t),
      paginationBoard(t),
      stepperBoard(t),
      accordionBoard(t),
      contextMenuBoard(t),
    ]),
    await tonedSection("Feedback & status", "feedback", () => [
      alertBoard(t),
      snackbarBoard(t),
      progressBoard(t),
      spinnerBoard(t),
      badgeBoard(t),
      severityIconBoard(t),
      skeletonBoard(t),
      tooltipBoard(t),
      emptyStateBoard(t),
    ]),
    await tonedSection("Overlays", "overlays", () => [
      dialogBoard(t),
      popoverBoard(t),
      drawerBoard(t),
    ]),
    await tonedSection("Data display", "data", () => [
      tableBoard(t),
      listBoard(t),
      statBoard(t),
      chartBoard(t),
      avatarBoard(t),
      avatarGroupBoard(t),
      dividerBoard(t),
    ]),
    await tonedSection("Date & time", "datetime", () => [
      calendarBoard(t),
      timePickerBoard(t),
      dateTimeBoard(t),
    ]),
    await tonedSection("Media & cards", "media", () => [
      cardBoard(t),
      carouselBoard(t),
      linkCardBoard(t),
      projectCardBoard(t),
      photoBoard(t),
    ]),
  ];
  await paintSections(t, page, sections, "02 · Basic components");
}

export async function paintMusic(t: ThemeContext, page: PageNode): Promise<void> {
  const boards = [
    await playerBoard(t),
    await trackListBoard(t),
    await reverbBoard(t),
    await eqBoard(t),
  ];
  await layoutBoards(t, page, boards, "03 · Music components");
}

export async function paintMap(t: ThemeContext, page: PageNode): Promise<void> {
  const sections = [
    { title: "Map", boards: [await mapBoard(t)] },
    {
      title: "CV download flow",
      boards: [await cvFlowBoard(t), await cvApprovalBoard(t), await cvChainBoard(t)],
    },
  ];
  await paintSections(t, page, sections, "04 · Map components");
}

export async function paintChat(t: ThemeContext, page: PageNode): Promise<void> {
  const boards = [
    await chatHeaderBoard(t),
    await chatsWidgetBoard(t),
    await chatBubbleBoard(t),
    await systemMessagesBoard(t),
    await chatComposerBoard(t),
    await sharedMediaBoard(t),
    await callsListBoard(t),
    await callScreenBoard(t),
    await railBoard(t),
  ];
  await layoutBoards(t, page, boards, "05 · Chat components");
}

export async function paintAI(t: ThemeContext, page: PageNode): Promise<void> {
  const boards = [await aiPromptBoard(t), await aiAnswerBoard(t)];
  await layoutBoards(t, page, boards, "06 · AI components");
}

// ── Backgrounds: exportable social covers ─────────────────────
interface CoverPalette {
  base: string;
  blobs: Array<{ hex: string; size: number; fx: number; fy: number; op: number }>;
}

async function socialCover(
  t: ThemeContext,
  w: number,
  h: number,
  pal: CoverPalette,
  text?: { name: string; tag: string },
): Promise<FrameNode> {
  const f = figma.createFrame();
  f.name = `cover ${w}×${h}`;
  f.resize(w, h);
  f.cornerRadius = 0;
  f.clipsContent = true;
  f.fills = [solid(pal.base)];
  for (const b of pal.blobs) {
    const blob = auroraBlob(b.size, b.hex);
    blob.opacity = b.op;
    f.appendChild(blob);
    blob.x = b.fx * w - b.size / 2;
    blob.y = b.fy * h - b.size / 2;
  }
  for (let i = 0; i < 60; i++) {
    const d = ellipse(1.5 + Math.random() * 2.5);
    d.fills = [
      {
        ...solid(Math.random() > 0.5 ? "#FFFFFF" : "#5EE6C1"),
        opacity: 0.08 + Math.random() * 0.4,
      } as SolidPaint,
    ];
    d.strokes = [];
    f.appendChild(d);
    d.x = Math.random() * w;
    d.y = Math.random() * h;
  }
  if (text) {
    const g = autoFrame({ direction: "VERTICAL", gap: 10 });
    g.fills = [];
    g.appendChild(await makeText(t, "display/lg", text.name, "text/primary"));
    g.appendChild(await makeText(t, "body/lg", text.tag, "text/secondary", { maxWidth: w - 700 }));
    f.appendChild(g);
    g.x = 340;
    g.y = Math.round((h - g.height) / 2);
  }
  return f;
}

const COVER_AURORA: CoverPalette = {
  base: "#0A0A0B",
  blobs: [
    { hex: "#5EE6C1", size: 920, fx: 0.72, fy: 0.3, op: 0.24 },
    { hex: "#FF3D8B", size: 820, fx: 0.9, fy: 0.75, op: 0.16 },
    { hex: "#818CF8", size: 720, fx: 0.52, fy: 0.95, op: 0.15 },
    { hex: "#FFFFFF", size: 420, fx: 0.62, fy: 0.18, op: 0.07 },
  ],
};
const COVER_MIDNIGHT: CoverPalette = {
  base: "#0B1020",
  blobs: [
    { hex: "#4457A0", size: 940, fx: 0.62, fy: 0.4, op: 0.3 },
    { hex: "#2E5E8C", size: 720, fx: 0.88, fy: 0.7, op: 0.22 },
    { hex: "#5EE6C1", size: 520, fx: 0.3, fy: 0.85, op: 0.1 },
  ],
};
const COVER_NEON: CoverPalette = {
  base: "#0A0A14",
  blobs: [
    { hex: "#B84BFF", size: 920, fx: 0.7, fy: 0.35, op: 0.26 },
    { hex: "#FF3D8B", size: 700, fx: 0.4, fy: 0.75, op: 0.18 },
    { hex: "#5EE6C1", size: 520, fx: 0.9, fy: 0.55, op: 0.12 },
  ],
};

export async function paintBackgrounds(t: ThemeContext, page: PageNode): Promise<void> {
  const W = 1584;
  const H = 396;
  const covers: Array<{ label: string; node: FrameNode }> = [
    {
      label: "LinkedIn · Aurora + name (1584 × 396)",
      node: await socialCover(t, W, H, COVER_AURORA, {
        name: "Oleksii Kryshtopa",
        tag: "Product Engineer · Design Systems · Motion",
      }),
    },
    { label: "LinkedIn · Aurora (clean)", node: await socialCover(t, W, H, COVER_AURORA) },
    { label: "LinkedIn · Midnight", node: await socialCover(t, W, H, COVER_MIDNIGHT) },
    { label: "LinkedIn · Neon", node: await socialCover(t, W, H, COVER_NEON) },
    {
      label: "X / Twitter · Aurora (1500 × 500)",
      node: await socialCover(t, 1500, 500, COVER_AURORA, {
        name: "Oleksii Kryshtopa",
        tag: "Design Systems · Interfaces · Motion",
      }),
    },
  ];
  let y = 0;
  for (const c of covers) {
    const lbl = await makeText(t, "overline", c.label, "accent/primary");
    page.appendChild(lbl);
    lbl.x = 0;
    lbl.y = y;
    page.appendChild(c.node);
    c.node.x = 0;
    c.node.y = y + 40;
    y += 40 + c.node.height + 100;
  }
  const label = await makeText(
    t,
    "overline",
    "07 · Backgrounds — export as PNG (2×)",
    "accent/primary",
  );
  page.appendChild(label);
  label.x = 0;
  label.y = -72;
}
