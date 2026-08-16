/**
 * Template (Headers) — DESIGN ONLY. A wall of header variants in the "liquid
 * glass" (frosted, backdrop-blurred) Apple style, plus a slot legend so you can
 * mix-and-match what to keep. Each bar sits over a lit backdrop so the frost reads.
 * No implementation — annotated design frames.
 */

import { RADII } from "../tokens";
import { linearGradient, solid } from "../core/color";
import { autoFrame } from "../core/layout";
import { auroraBlob, ellipse, fillToken, makeText, rect, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { icon, brandMark } from "../core/icons";

const W = 1160;

function aa(hex: string, a: number): SolidPaint {
  return { ...solid(hex), opacity: a } as SolidPaint;
}
function spacer(): RectangleNode {
  const s = rect(1, 1);
  s.fills = [];
  return s;
}

/** Lit backdrop so the glass frost has something to blur. */
function backdrop(t: ThemeContext, w: number, h: number): FrameNode {
  const b = figma.createFrame();
  b.name = "backdrop";
  b.resize(w, h);
  b.clipsContent = true;
  b.cornerRadius = RADII.xl;
  fillToken(t, b, "bg/canvas");
  for (const [hex, size, x, y, op] of [
    ["#5EE6C1", 460, w * 0.2, -80, 0.28],
    ["#FF3D8B", 380, w * 0.7, 40, 0.2],
    ["#818CF8", 340, w * 0.5, h - 60, 0.18],
  ] as Array<[string, number, number, number, number]>) {
    const blob = auroraBlob(size, hex);
    blob.opacity = op;
    b.appendChild(blob);
    blob.x = x - size / 2;
    blob.y = y - size / 2;
  }
  return b;
}

async function logo(t: ThemeContext): Promise<FrameNode> {
  const g = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  g.appendChild(brandMark(t, 28)); // mint→dante gradient brand mark
  g.appendChild(await makeText(t, "heading/h4", "okryshto", "text/primary"));
  return g;
}

async function nav(t: ThemeContext, items: Array<[string, boolean, boolean]>): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 26, cross: "CENTER" });
  for (const [label, active, chev] of items) {
    const it = autoFrame({ direction: "HORIZONTAL", gap: 5, cross: "CENTER" });
    it.appendChild(
      await makeText(t, "label/md", label, active ? "text/primary" : "text/secondary"),
    );
    if (chev) it.appendChild(icon(t, "chevron-down", 13, "text/muted"));
    row.appendChild(it);
  }
  return row;
}

async function searchPill(t: ThemeContext, w: number): Promise<FrameNode> {
  const s = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [8, 14] });
  s.resize(w, s.height);
  s.primaryAxisSizingMode = "FIXED";
  s.counterAxisSizingMode = "AUTO";
  s.cornerRadius = RADII.full;
  s.fills = [aa("#FFFFFF", 0.08)];
  strokeToken(t, s, "glass/border", 1);
  s.appendChild(icon(t, "search", 14, "text/muted"));
  s.appendChild(await makeText(t, "body/sm", "Search…", "text/muted"));
  s.appendChild(spacer());
  (s.children[2] as RectangleNode).layoutGrow = 1;
  const kbd = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [1, 6],
  });
  kbd.cornerRadius = RADII.sm;
  kbd.fills = [aa("#FFFFFF", 0.1)];
  kbd.appendChild(await makeText(t, "mono/sm", "⌘K", "text/muted"));
  s.appendChild(kbd);
  return s;
}

async function cta(t: ThemeContext, label: string, glass = false): Promise<FrameNode> {
  const b = autoFrame({
    direction: "HORIZONTAL",
    gap: 7,
    align: "CENTER",
    cross: "CENTER",
    padding: [9, 18],
  });
  b.cornerRadius = RADII.full;
  if (glass) {
    b.fills = [aa("#FFFFFF", 0.12)];
    strokeToken(t, b, "glass/border", 1);
    b.appendChild(await makeText(t, "label/md", label, "text/primary"));
  } else {
    fillToken(t, b, "accent/primary");
    b.appendChild(await makeText(t, "label/md", label, "accent/contrast"));
  }
  return b;
}

function iconChip(t: ThemeContext, name: string, badge = false): FrameNode {
  const c = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  c.resize(38, 38);
  c.primaryAxisSizingMode = "FIXED";
  c.counterAxisSizingMode = "FIXED";
  c.cornerRadius = RADII.full;
  c.fills = [aa("#FFFFFF", 0.08)];
  strokeToken(t, c, "glass/border", 1);
  c.clipsContent = false;
  c.appendChild(icon(t, name, 17, "text/secondary"));
  if (badge) {
    const b = ellipse(9);
    b.fills = [solid("#FB7185")];
    b.strokes = [aa("#0A0A0B", 0.6)];
    b.strokeWeight = 2;
    c.appendChild(b);
    (b as LayoutMixin).layoutPositioning = "ABSOLUTE";
    b.x = 24;
    b.y = 5;
  }
  return c;
}

async function avatarChip(t: ThemeContext): Promise<FrameNode> {
  const c = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER", padding: [3, 6] });
  c.cornerRadius = RADII.full;
  c.fills = [aa("#FFFFFF", 0.08)];
  strokeToken(t, c, "glass/border", 1);
  c.appendChild(brandMark(t, 28)); // brand mark doubles as the avatar
  c.appendChild(icon(t, "chevron-down", 13, "text/muted"));
  return c;
}

async function langChip(t: ThemeContext): Promise<FrameNode> {
  const c = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER", padding: [7, 12] });
  c.cornerRadius = RADII.full;
  c.fills = [aa("#FFFFFF", 0.08)];
  strokeToken(t, c, "glass/border", 1);
  c.appendChild(icon(t, "globe", 14, "text/secondary"));
  c.appendChild(await makeText(t, "label/sm", "EN", "text/primary"));
  c.appendChild(icon(t, "chevron-down", 12, "text/muted"));
  return c;
}

async function themeToggle(t: ThemeContext): Promise<FrameNode> {
  const c = autoFrame({ direction: "HORIZONTAL", gap: 2, cross: "CENTER", padding: 3 });
  c.cornerRadius = RADII.full;
  c.fills = [aa("#FFFFFF", 0.08)];
  strokeToken(t, c, "glass/border", 1);
  const on = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  on.resize(26, 26);
  on.primaryAxisSizingMode = "FIXED";
  on.counterAxisSizingMode = "FIXED";
  on.cornerRadius = RADII.full;
  on.fills = [aa("#FFFFFF", 0.14)];
  on.appendChild(icon(t, "moon", 14, "text/primary"));
  const off = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  off.resize(26, 26);
  off.primaryAxisSizingMode = "FIXED";
  off.counterAxisSizingMode = "FIXED";
  off.appendChild(icon(t, "sun", 14, "text/muted"));
  c.appendChild(on);
  c.appendChild(off);
  return c;
}

function hamburger(t: ThemeContext): FrameNode {
  return iconChip(t, "menu");
}

/** The glass header bar itself — frosted fill + real background blur + hairline. */
async function glassBar(
  _t: ThemeContext,
  w: number,
  opts: {
    h?: number;
    strong?: boolean;
    left: SceneNode[];
    center?: SceneNode[] | null;
    right: SceneNode[];
  },
): Promise<FrameNode> {
  const h = opts.h ?? 72;
  const bar = autoFrame({ direction: "HORIZONTAL", gap: 20, cross: "CENTER", padding: [0, 26] });
  bar.resize(w, h);
  bar.name = "header";
  bar.primaryAxisSizingMode = "FIXED";
  bar.counterAxisSizingMode = "FIXED";
  bar.clipsContent = false;
  bar.cornerRadius = RADII.xl; // floating rounded glass bar
  // Liquid glass: translucent fill + white top-edge highlight via border + backdrop blur.
  bar.fills = [aa("#FFFFFF", opts.strong ? 0.14 : 0.07)];
  bar.strokes = [aa("#FFFFFF", 0.22)];
  bar.strokeWeight = 1;
  bar.strokeAlign = "INSIDE";
  bar.effects = [
    { type: "BACKGROUND_BLUR", radius: opts.strong ? 32 : 24, visible: true } as BlurEffect,
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.25 },
      offset: { x: 0, y: 8 },
      radius: 24,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    } as DropShadowEffect,
  ];
  for (const n of opts.left) bar.appendChild(n);
  const sp1 = spacer();
  bar.appendChild(sp1);
  sp1.layoutGrow = 1;
  if (opts.center) {
    for (const n of opts.center) bar.appendChild(n);
    const sp2 = spacer();
    bar.appendChild(sp2);
    sp2.layoutGrow = 1;
  }
  for (const n of opts.right) bar.appendChild(n);
  return bar;
}

interface Desc {
  title: string;
  en: string;
  slots: string[];
  best: string;
}

async function slotChip(t: ThemeContext, label: string): Promise<FrameNode> {
  const c = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [2, 9],
  });
  c.cornerRadius = RADII.full;
  c.fills = [aa("#FFFFFF", 0.06)];
  strokeToken(t, c, "border/subtle", 1);
  c.appendChild(await makeText(t, "caption", label, "text/secondary"));
  return c;
}

/** Rich description card below a header — what it is, when to use, which slots. */
async function descCard(t: ThemeContext, w: number, d: Desc): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 10, padding: 20, name: "desc" });
  card.resize(w, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.lg;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  const head = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  head.layoutAlign = "STRETCH";
  head.primaryAxisSizingMode = "FIXED";
  head.appendChild(await makeText(t, "label/md", d.title, "text/primary"));
  head.appendChild(spacer());
  (head.children[1] as RectangleNode).layoutGrow = 1;
  const best = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [2, 10],
  });
  best.cornerRadius = RADII.full;
  best.fills = [aa("#5EE6C1", 0.12)];
  best.appendChild(await makeText(t, "caption", `Best for: ${d.best}`, "accent/primary"));
  head.appendChild(best);
  card.appendChild(head);
  card.appendChild(await makeText(t, "body/sm", d.en, "text/secondary", { maxWidth: w - 40 }));
  const inc = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", wrap: true });
  inc.layoutAlign = "STRETCH";
  inc.primaryAxisSizingMode = "FIXED";
  inc.counterAxisSpacing = 8;
  inc.appendChild(await makeText(t, "caption", "Includes", "text/muted"));
  for (const s of d.slots) inc.appendChild(await slotChip(t, s));
  card.appendChild(inc);
  return card;
}

/** Wrapper for one variant — stacks its pieces so only ONE Figma label shows. */
function wrap(name: string): FrameNode {
  const w = autoFrame({ direction: "VERTICAL", gap: 16, name });
  w.fills = [];
  w.clipsContent = false;
  return w;
}

/** A variant block: overline + lit backdrop (header floating inside) + rich desc card. */
async function variant(
  t: ThemeContext,
  cap: string,
  desc: Desc,
  bar: FrameNode,
  bw: number,
  bh = 178,
): Promise<FrameNode> {
  const M = 16; // padding of the container that holds the header — bar floats inside
  const w = wrap(cap.slice(0, 2));
  w.appendChild(await makeText(t, "overline", cap, "accent/primary"));
  const bd = backdrop(t, bw, bh);
  const content = autoFrame({ direction: "VERTICAL", gap: 8 });
  content.appendChild(await makeText(t, "heading/h2", "Frosted over content", "text/primary"));
  content.appendChild(
    await makeText(
      t,
      "body/sm",
      "The bar blurs whatever scrolls beneath it — aurora, imagery, text.",
      "text/secondary",
    ),
  );
  bd.appendChild(content);
  content.x = M + 12;
  content.y = 14 + (bar.height as number) + 26;
  bd.appendChild(bar); // header floats inside the backdrop with padding
  bar.x = M;
  bar.y = 14;
  w.appendChild(bd);
  w.appendChild(await descCard(t, bw, desc));
  return w;
}

async function slotLegend(t: ThemeContext): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 12, padding: 24 });
  card.resize(520, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  card.appendChild(await makeText(t, "overline", "Slots you can mix", "accent/dante"));
  card.appendChild(
    await makeText(
      t,
      "caption",
      "Pick what you need, drop the rest. Every variant below is a mix of these slots.",
      "text/muted",
      { maxWidth: 472 },
    ),
  );
  const rows: Array<[string, string, string]> = [
    ["Logo / wordmark", "always", ""],
    ["Nav links (+ dropdown/mega)", "marketing, app", ""],
    ["Search (⌘K)", "content, app, shop", ""],
    ["Primary CTA", "marketing", ""],
    ["Icon buttons (bell, help)", "app", ""],
    ["Avatar / account menu", "logged-in", ""],
    ["Cart", "e-commerce", ""],
    ["Language switch", "i18n sites", ""],
    ["Theme toggle", "optional", ""],
    ["Hamburger", "mobile", ""],
    ["Announcement bar", "promo", ""],
  ];
  for (const [en, when, ru] of rows) {
    const r = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
    r.layoutAlign = "STRETCH";
    r.primaryAxisSizingMode = "FIXED";
    const dot = ellipse(6);
    dot.fills = [aa("#5EE6C1", 0.9)];
    dot.strokes = [];
    r.appendChild(dot);
    const txt = autoFrame({ direction: "VERTICAL", gap: 0 });
    txt.appendChild(await makeText(t, "body/sm", en, "text/primary"));
    if (ru) txt.appendChild(await makeText(t, "caption", ru, "text/muted"));
    r.appendChild(txt);
    r.appendChild(spacer());
    (r.children[2] as RectangleNode).layoutGrow = 1;
    const tag = autoFrame({
      direction: "HORIZONTAL",
      align: "CENTER",
      cross: "CENTER",
      padding: [1, 8],
    });
    tag.cornerRadius = RADII.full;
    tag.fills = [aa("#FFFFFF", 0.06)];
    tag.appendChild(await makeText(t, "caption", when, "text/muted"));
    r.appendChild(tag);
    card.appendChild(r);
  }
  return card;
}

// ── Mega-menu (the expanded-nav panel with cards/links) ───────

function thumbImage(t: ThemeContext, w: number, h: number, h1: string, h2: string): FrameNode {
  const f = figma.createFrame();
  f.name = "thumb";
  f.resize(w, h);
  f.cornerRadius = RADII.md;
  f.clipsContent = true;
  f.fills = [
    linearGradient(
      [
        { hex: h1, position: 0 },
        { hex: h2, position: 1 },
      ],
      "diagonal",
    ),
  ];
  const ic = icon(t, "image", 16, "accent/contrast");
  ic.opacity = 0.5;
  f.appendChild(ic);
  ic.x = w - 24;
  ic.y = h - 24;
  return f;
}

async function menuCard(
  t: ThemeContext,
  w: number,
  opts: { title: string; desc: string; brand?: boolean; hue?: [string, string] },
): Promise<FrameNode> {
  const card = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER", padding: 14 });
  card.resize(w, card.height);
  card.primaryAxisSizingMode = "FIXED";
  card.counterAxisSizingMode = "AUTO";
  card.cornerRadius = RADII.lg;
  fillToken(t, card, "bg/surface-raised");
  strokeToken(t, card, "border/subtle", 1);
  if (opts.brand) card.appendChild(brandMark(t, 56));
  else
    card.appendChild(
      thumbImage(
        t,
        72,
        56,
        (opts.hue ?? ["#4A1030", "#FF3D8B"])[0],
        (opts.hue ?? ["#4A1030", "#FF3D8B"])[1],
      ),
    );
  const col = autoFrame({ direction: "VERTICAL", gap: 3 });
  col.appendChild(await makeText(t, "label/md", opts.title, "text/primary"));
  col.appendChild(await makeText(t, "caption", opts.desc, "text/muted", { maxWidth: w - 72 - 42 }));
  card.appendChild(col);
  col.layoutGrow = 1;
  return card;
}

/** The dropdown panel that expands under the nav — holds cards (or link columns). */
async function megaMenu(t: ThemeContext, w: number): Promise<FrameNode> {
  const panel = autoFrame({ direction: "VERTICAL", gap: 12, padding: 16, name: "mega-menu" });
  panel.resize(w, panel.height);
  panel.counterAxisSizingMode = "FIXED";
  panel.cornerRadius = RADII.xl;
  fillToken(t, panel, "bg/surface");
  strokeToken(t, panel, "border/default", 1);
  const cards = autoFrame({ direction: "HORIZONTAL", gap: 14 });
  cards.layoutAlign = "STRETCH";
  cards.primaryAxisSizingMode = "FIXED";
  const cardW = Math.floor((w - 32 - 28) / 3);
  cards.appendChild(
    await menuCard(t, cardW, {
      brand: true,
      title: "myOkryshto",
      desc: "Your account, projects & saved",
    }),
  );
  cards.appendChild(
    await menuCard(t, cardW, {
      title: "Components",
      desc: "The dark-first design system",
      hue: ["#1D2150", "#818CF8"],
    }),
  );
  cards.appendChild(
    await menuCard(t, cardW, {
      title: "Journal",
      desc: "Notes on interface craft",
      hue: ["#0E4B3C", "#5EE6C1"],
    }),
  );
  panel.appendChild(cards);
  const foot = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
  foot.appendChild(await makeText(t, "label/sm", "View everything", "accent/primary"));
  foot.appendChild(icon(t, "arrow-right", 13, "accent/primary"));
  panel.appendChild(foot);
  return panel;
}

/** Nav row where one item is expanded (accent + up-chevron). */
async function navExpanded(
  t: ThemeContext,
  items: string[],
  activeIdx: number,
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 26, cross: "CENTER" });
  for (let i = 0; i < items.length; i++) {
    const on = i === activeIdx;
    const it = autoFrame({ direction: "HORIZONTAL", gap: 5, cross: "CENTER" });
    it.appendChild(
      await makeText(t, "label/md", items[i], on ? "accent/primary" : "text/secondary"),
    );
    if (on) it.appendChild(icon(t, "chevron-up", 13, "accent/primary"));
    row.appendChild(it);
  }
  return row;
}

// ── Mobile phone mockups ──────────────────────────────────────

const PW = 264;
const PH = 440;
const PAD = 14; // phone side padding — bars & content align to this

function phoneShell(t: ThemeContext): FrameNode {
  const f = figma.createFrame();
  f.name = "phone";
  f.resize(PW, PH);
  f.cornerRadius = 36;
  f.clipsContent = true;
  fillToken(t, f, "bg/canvas");
  f.strokes = [aa("#FFFFFF", 0.14)];
  f.strokeWeight = 1.5;
  for (const [hex, size, x, yy, op] of [
    ["#5EE6C1", 300, PW * 0.28, 60, 0.2],
    ["#FF3D8B", 240, PW * 0.85, PH * 0.55, 0.12],
    ["#818CF8", 220, PW * 0.4, PH - 30, 0.1],
  ] as Array<[string, number, number, number, number]>) {
    const blob = auroraBlob(size, hex);
    blob.opacity = op;
    f.appendChild(blob);
    blob.x = x - size / 2;
    blob.y = yy - size / 2;
  }
  const notch = rect(90, 20, 10);
  notch.fills = [solid("#050506")];
  notch.strokes = [];
  f.appendChild(notch);
  notch.x = (PW - 90) / 2;
  notch.y = 9;
  return f;
}

function phoneGlass(w: number, h: number): FrameNode {
  const g = figma.createFrame();
  g.name = "glass";
  g.resize(w, h);
  g.cornerRadius = RADII.xl;
  g.clipsContent = false;
  g.fills = [aa("#FFFFFF", 0.07)];
  g.strokes = [aa("#FFFFFF", 0.22)];
  g.strokeWeight = 1;
  g.strokeAlign = "INSIDE";
  g.effects = [{ type: "BACKGROUND_BLUR", radius: 20, visible: true } as BlurEffect];
  return g;
}

function listThumb(t: ThemeContext, name: string, h1: string, h2: string): FrameNode {
  const f = figma.createFrame();
  f.resize(38, 38);
  f.cornerRadius = RADII.md;
  f.clipsContent = true;
  f.fills = [
    linearGradient(
      [
        { hex: h1, position: 0 },
        { hex: h2, position: 1 },
      ],
      "diagonal",
    ),
  ];
  const ic = icon(t, name, 17, "accent/contrast");
  f.appendChild(ic);
  ic.x = 10;
  ic.y = 10;
  return f;
}

/** Faux screen content so the phone reads like a real screen, not an empty slab. */
async function fillPhone(t: ThemeContext, f: FrameNode, topY: number, rows = 2): Promise<void> {
  const hero = await makeText(t, "heading/h3", "Discover", "text/primary");
  f.appendChild(hero);
  hero.x = PAD + 2;
  hero.y = topY;
  const sub = await makeText(t, "caption", "Events & guides near you", "text/muted");
  f.appendChild(sub);
  sub.x = PAD + 2;
  sub.y = topY + 28;
  let cy = topY + 54;
  const items: Array<[string, string, string, [string, string]]> = [
    ["music", "Night drive vol. 2", "Playlist · 18 tracks", ["#4A1030", "#FF3D8B"]],
    ["map-pin", "Berlin Mitte", "Access point · active", ["#0E4B3C", "#5EE6C1"]],
    ["book-open", "Journal", "Notes on craft", ["#1D2150", "#818CF8"]],
  ];
  for (let i = 0; i < rows; i++) {
    const [ic, title, subt, hue] = items[i];
    const row = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [10, 12] });
    row.resize(PW - 2 * PAD, 58);
    row.primaryAxisSizingMode = "FIXED";
    row.counterAxisSizingMode = "FIXED";
    row.cornerRadius = RADII.lg;
    fillToken(t, row, "bg/surface-raised");
    strokeToken(t, row, "border/subtle", 1);
    row.appendChild(listThumb(t, ic, hue[0], hue[1]));
    const col = autoFrame({ direction: "VERTICAL", gap: 2 });
    col.appendChild(await makeText(t, "label/sm", title, "text/primary"));
    col.appendChild(await makeText(t, "caption", subt, "text/muted"));
    row.appendChild(col);
    f.appendChild(row);
    row.x = PAD;
    row.y = cy;
    cy += 68;
  }
}

async function mobTop(t: ThemeContext): Promise<FrameNode> {
  const f = phoneShell(t);
  await fillPhone(t, f, 110);
  const bar = await glassBar(t, PW - 2 * PAD, {
    h: 50,
    left: [brandMark(t, 24)],
    right: [iconChip(t, "search"), hamburger(t)],
  });
  f.appendChild(bar);
  bar.x = PAD;
  bar.y = 44;
  return f;
}

async function mobCentered(t: ThemeContext): Promise<FrameNode> {
  const f = phoneShell(t);
  await fillPhone(t, f, 110);
  const bar = await glassBar(t, PW - 2 * PAD, {
    h: 50,
    left: [hamburger(t)],
    center: [brandMark(t, 26)],
    right: [iconChip(t, "user")],
  });
  f.appendChild(bar);
  bar.x = PAD;
  bar.y = 44;
  return f;
}

async function mobSearch(t: ThemeContext): Promise<FrameNode> {
  const f = phoneShell(t);
  await fillPhone(t, f, 152);
  const bar = phoneGlass(PW - 2 * PAD, 90);
  const r1 = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
  r1.resize(PW - 2 * PAD - 28, r1.height);
  r1.primaryAxisSizingMode = "FIXED";
  r1.appendChild(brandMark(t, 24));
  r1.appendChild(spacer());
  (r1.children[1] as RectangleNode).layoutGrow = 1;
  r1.appendChild(hamburger(t));
  bar.appendChild(r1);
  r1.x = 14;
  r1.y = 12;
  const sr = await searchPill(t, PW - 2 * PAD - 28);
  bar.appendChild(sr);
  sr.x = 14;
  sr.y = 50;
  f.appendChild(bar);
  bar.x = PAD;
  bar.y = 44;
  return f;
}

async function mobTabs(t: ThemeContext): Promise<FrameNode> {
  const f = phoneShell(t);
  await fillPhone(t, f, 110, 2);
  const top = await glassBar(t, PW - 2 * PAD, {
    h: 50,
    left: [brandMark(t, 24)],
    right: [iconChip(t, "search"), hamburger(t)],
  });
  f.appendChild(top);
  top.x = PAD;
  top.y = 44;
  const tabs = phoneGlass(PW - 2 * PAD, 60);
  const row = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", padding: [0, 10] });
  row.resize(PW - 2 * PAD, 60);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "FIXED";
  for (const [ic, label, active] of [
    ["grid", "Home", true],
    ["search", "Search", false],
    ["bookmark", "Saved", false],
    ["user", "You", false],
  ] as Array<[string, string, boolean]>) {
    const item = autoFrame({ direction: "VERTICAL", gap: 4, align: "CENTER", cross: "CENTER" });
    item.appendChild(icon(t, ic, 19, active ? "accent/primary" : "text/muted"));
    item.appendChild(await makeText(t, "caption", label, active ? "accent/primary" : "text/muted"));
    row.appendChild(item);
    item.layoutGrow = 1;
  }
  tabs.appendChild(row);
  row.x = 0;
  row.y = 0;
  f.appendChild(tabs);
  tabs.x = PAD;
  tabs.y = PH - 60 - 12;
  return f;
}

async function mobMenu(t: ThemeContext): Promise<FrameNode> {
  const f = phoneShell(t);
  await fillPhone(t, f, 110);
  const bar = await glassBar(t, PW - 2 * PAD, {
    h: 50,
    left: [brandMark(t, 24)],
    right: [iconChip(t, "x")],
  });
  f.appendChild(bar);
  bar.x = PAD;
  bar.y = 44;
  const ovTop = 44 + 50 + 10;
  const ovH = PH - ovTop - 12;
  const ov = phoneGlass(PW - 2 * PAD, ovH);
  const col = autoFrame({ direction: "VERTICAL", gap: 8, padding: 22 });
  col.resize(PW - 2 * PAD, col.height);
  col.counterAxisSizingMode = "FIXED";
  col.fills = [];
  for (const [label, active] of [
    ["Work", true],
    ["About", false],
    ["Journal", false],
    ["Contact", false],
  ] as Array<[string, boolean]>) {
    col.appendChild(
      await makeText(t, "heading/h3", label, active ? "text/primary" : "text/secondary"),
    );
  }
  const gp = rect(1, 8);
  gp.fills = [];
  col.appendChild(gp);
  col.appendChild(await cta(t, "Get in touch"));
  ov.appendChild(col);
  col.x = 0;
  col.y = 0;
  f.appendChild(ov);
  ov.x = PAD;
  ov.y = ovTop;
  return f;
}

async function announceWrap(t: ThemeContext): Promise<FrameNode> {
  const M = 16;
  const w = wrap("08");
  w.appendChild(
    await makeText(t, "overline", "08 · Announcement bar — promo above header", "accent/primary"),
  );
  const bd = backdrop(t, W, 210);
  const promo = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    align: "CENTER",
    cross: "CENTER",
    padding: [8, 20],
  });
  promo.resize(W - 2 * M, 34);
  promo.primaryAxisSizingMode = "FIXED";
  promo.counterAxisSizingMode = "FIXED";
  promo.cornerRadius = RADII.lg;
  promo.fills = [aa("#FF3D8B", 0.16)];
  promo.appendChild(icon(t, "sparkles", 14, "accent/dante"));
  promo.appendChild(await makeText(t, "label/sm", "New: dante mode is live", "text/primary"));
  promo.appendChild(await makeText(t, "caption", "· read more →", "text/secondary"));
  bd.appendChild(promo);
  promo.x = M;
  promo.y = 14;
  const barA = await glassBar(t, W - 2 * M, {
    left: [
      await logo(t),
      await nav(t, [
        ["Work", true, false],
        ["About", false, false],
      ]),
    ],
    right: [await cta(t, "Get in touch")],
  });
  bd.appendChild(barA);
  barA.x = M;
  barA.y = 56;
  const contentA = autoFrame({ direction: "VERTICAL", gap: 8 });
  contentA.appendChild(await makeText(t, "heading/h2", "Frosted over content", "text/primary"));
  bd.appendChild(contentA);
  contentA.x = M + 12;
  contentA.y = 150;
  w.appendChild(bd);
  w.appendChild(
    await descCard(t, W, {
      title: "Announcement bar",
      best: "launches & notices",
      en: "A thin, dismissible promo strip pinned above the glass bar for launches or notices. Both stick together on scroll.",
      slots: ["Promo strip", "Logo", "Nav", "CTA"],
    }),
  );
  return w;
}

async function megaWrap(t: ThemeContext): Promise<FrameNode> {
  const M = 16;
  const w = wrap("09");
  w.appendChild(
    await makeText(
      t,
      "overline",
      "09 · Mega-menu — expanded nav (cards or links)",
      "accent/primary",
    ),
  );
  const bd = backdrop(t, W, 330);
  const barX = await glassBar(t, W - 2 * M, {
    left: [
      await logo(t),
      await navExpanded(t, ["Events", "Results", "Services", "Blog", "About"], 2),
    ],
    right: [await langChip(t), await cta(t, "Login", true), await cta(t, "For partners")],
  });
  bd.appendChild(barX);
  barX.x = M;
  barX.y = 14;
  const mega = await megaMenu(t, W - 2 * M);
  bd.appendChild(mega);
  mega.x = M;
  mega.y = 96;
  w.appendChild(bd);
  w.appendChild(
    await descCard(t, W, {
      title: "Mega-menu",
      best: "many products/sections",
      en: "On expand, the nav drops a glass panel of cards — products or sections with icon, title and blurb. Swap the cards for plain link columns when you have lots of links. Click-away / Esc closes.",
      slots: ["Logo", "Expanding nav", "Cards", "Link columns", "CTAs"],
    }),
  );
  return w;
}

async function mobileWrap(t: ThemeContext): Promise<FrameNode> {
  const w = wrap("10");
  w.appendChild(
    await makeText(
      t,
      "overline",
      "10 · Mobile — variants (collapse patterns, ≥44px targets)",
      "accent/primary",
    ),
  );
  const row = autoFrame({ direction: "HORIZONTAL", gap: 40, cross: "MIN" });
  const phones: Array<[FrameNode, string]> = [
    [await mobTop(t), "Logo + hamburger"],
    [await mobCentered(t), "Centered logo"],
    [await mobSearch(t), "Search row"],
    [await mobTabs(t), "Bottom tab bar"],
    [await mobMenu(t), "Menu open"],
  ];
  for (const [ph, lbl] of phones) {
    const col = autoFrame({ direction: "VERTICAL", gap: 10, cross: "CENTER" });
    col.appendChild(ph);
    col.appendChild(await makeText(t, "caption", lbl, "text/secondary"));
    row.appendChild(col);
  }
  w.appendChild(row);
  w.appendChild(
    await descCard(t, W, {
      title: "Mobile headers",
      best: "small screens",
      en: "Collapse to essentials: logo + hamburger, a centered logo, a two-row search header, a bottom tab bar, or a full-screen menu overlay. Keep tap targets ≥44px.",
      slots: ["Logo", "Hamburger", "Search row", "Bottom tabs", "Menu overlay"],
    }),
  );
  return w;
}

export async function paintTemplateHeaders(t: ThemeContext, page: PageNode): Promise<void> {
  const label = await makeText(
    t,
    "overline",
    "14 · Template (Headers) — DESIGN ONLY · liquid-glass, all variants · pick your slots",
    "accent/primary",
  );
  page.appendChild(label);
  label.x = 0;
  label.y = -84;
  const note = await makeText(
    t,
    "caption",
    "Frosted glass = translucent fill + white edge + real background-blur. Blur only reads over content.",
    "text/muted",
  );
  page.appendChild(note);
  note.x = 0;
  note.y = -56;

  const legend = await slotLegend(t);
  page.appendChild(legend);
  legend.x = W + 40;
  legend.y = 0;

  const M = 16;
  const wraps: FrameNode[] = [];
  wraps.push(
    await variant(
      t,
      "01 · Minimal — marketing landing",
      {
        title: "Minimal",
        best: "landing & brochure",
        en: "The safe default — brand, a few links, one clear call-to-action. Nothing competes for attention, so the CTA wins.",
        slots: ["Logo", "Nav", "CTA"],
      },
      await glassBar(t, W - 2 * M, {
        left: [
          await logo(t),
          await nav(t, [
            ["Work", true, false],
            ["About", false, false],
            ["Journal", false, false],
          ]),
        ],
        right: [await cta(t, "Get in touch")],
      }),
      W,
    ),
  );
  wraps.push(
    await variant(
      t,
      "02 · Centered nav — editorial",
      {
        title: "Centered nav",
        best: "studios & editorial",
        en: "Logo left, nav optically centered, a soft-glass action on the right. Reads premium; works best with 3–5 links.",
        slots: ["Logo", "Centered nav", "Dropdown", "Glass CTA"],
      },
      await glassBar(t, W - 2 * M, {
        left: [await logo(t)],
        center: [
          await nav(t, [
            ["Home", true, false],
            ["Work", false, false],
            ["Services", false, true],
            ["Contact", false, false],
          ]),
        ],
        right: [await cta(t, "Book a call", true)],
      }),
      W,
    ),
  );
  wraps.push(
    await variant(
      t,
      "03 · With search — content site",
      {
        title: "With search",
        best: "docs & content",
        en: "Adds a ⌘K search field for anything findable — docs, blogs, large content sites. Keep nav short so search stays the hero.",
        slots: ["Logo", "Nav", "Search ⌘K", "CTA"],
      },
      await glassBar(t, W - 2 * M, {
        left: [
          await logo(t),
          await nav(t, [
            ["Docs", true, false],
            ["Guides", false, false],
            ["API", false, false],
          ]),
        ],
        right: [await searchPill(t, 240), await cta(t, "Sign up")],
      }),
      W,
    ),
  );
  wraps.push(
    await variant(
      t,
      "04 · App bar — logged-in product",
      {
        title: "App bar",
        best: "dashboards & SaaS",
        en: "The in-product top bar for logged-in users: workspace nav, search, a notifications bell with an unread dot, and the account menu.",
        slots: ["Logo", "Nav", "Search", "Bell", "Avatar"],
      },
      await glassBar(t, W - 2 * M, {
        left: [
          await logo(t),
          await nav(t, [
            ["Overview", true, false],
            ["Projects", false, false],
            ["Team", false, false],
          ]),
        ],
        right: [await searchPill(t, 220), iconChip(t, "bell", true), await avatarChip(t)],
      }),
      W,
    ),
  );
  wraps.push(
    await variant(
      t,
      "05 · E-commerce — shop",
      {
        title: "E-commerce",
        best: "shops & marketplaces",
        en: "Retail header: category nav with a mega-menu trigger, search, language, a cart with an item badge, and account — everything a shopper reaches for.",
        slots: ["Logo", "Mega-nav", "Search", "Language", "Cart", "Account"],
      },
      await glassBar(t, W - 2 * M, {
        left: [
          await logo(t),
          await nav(t, [
            ["Shop", true, true],
            ["New", false, false],
            ["Sale", false, false],
          ]),
        ],
        right: [
          await searchPill(t, 200),
          await langChip(t),
          iconChip(t, "shopping-cart", true),
          iconChip(t, "user"),
        ],
      }),
      W,
    ),
  );
  wraps.push(
    await variant(
      t,
      "06 · Localized — i18n + theme",
      {
        title: "Localized + theme",
        best: "i18n products",
        en: "For multilingual products: a language switch and a light/dark theme toggle beside the primary CTA. Pairs with the en/de/ru setup.",
        slots: ["Logo", "Nav", "Language", "Theme", "CTA"],
      },
      await glassBar(t, W - 2 * M, {
        left: [
          await logo(t),
          await nav(t, [
            ["Product", true, false],
            ["Pricing", false, false],
            ["Docs", false, false],
          ]),
        ],
        right: [await langChip(t), await themeToggle(t), await cta(t, "Start free")],
      }),
      W,
    ),
  );
  wraps.push(
    await variant(
      t,
      "07 · Scrolled — condensed state",
      {
        title: "Scrolled state",
        best: "on-scroll of any header",
        en: "Not a separate header — the condensed scrolled state. Glass turns denser and more opaque, height drops to 56px, and it hugs the top.",
        slots: ["Same slots", "Condensed 56px", "Opaque glass"],
      },
      await glassBar(t, W - 2 * M, {
        h: 56,
        strong: true,
        left: [
          await logo(t),
          await nav(t, [
            ["Work", true, false],
            ["About", false, false],
            ["Journal", false, false],
          ]),
        ],
        right: [await cta(t, "Get in touch")],
      }),
      W,
      166,
    ),
  );
  wraps.push(await announceWrap(t));
  wraps.push(await megaWrap(t));
  wraps.push(await mobileWrap(t));

  // Stack every variant wrapper with generous breathing room. One label per block.
  let y = 0;
  for (const w of wraps) {
    page.appendChild(w);
    w.x = 0;
    w.y = y;
    y += (w.height as number) + 72;
  }
}
