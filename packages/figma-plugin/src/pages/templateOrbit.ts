/**
 * Template (Orbit) — DESIGN ONLY. Mockups of orbit.okryshto.dev (public map +
 * self-intro access flow) with a "Requirements" card beside each screen.
 * No implementation — these are annotated design frames for review.
 */

import { RADII } from "../tokens";
import { solid } from "../core/color";
import { autoFrame } from "../core/layout";
import { ellipse, fillToken, makeText, rect, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { icon } from "../core/icons";
import { applyEffect } from "../components/primitives";

const FRAME_W = 1200;
const FRAME_H = 760;
const CHROME_H = 46;
const BODY_H = FRAME_H - CHROME_H;
const REQ_W = 400;
const GAP_X = 80;
const GAP_Y = 120;

function aa(hex: string, a: number): SolidPaint {
  return { ...solid(hex), opacity: a } as SolidPaint;
}

function spacer(): RectangleNode {
  const s = rect(1, 1);
  s.fills = [];
  return s;
}

/** Browser shell: traffic lights + URL pill + EN/DE/RU switcher, returns {shell, body}. */
async function browserFrame(
  t: ThemeContext,
  url: string,
  name: string,
): Promise<{ shell: FrameNode; body: FrameNode }> {
  const shell = figma.createFrame();
  shell.name = `orbit/${name}`;
  shell.resize(FRAME_W, FRAME_H);
  shell.cornerRadius = RADII.xl;
  shell.clipsContent = true;
  fillToken(t, shell, "bg/canvas");
  strokeToken(t, shell, "border/subtle", 1);
  await applyEffect(shell, "shadow/lg", t);

  const chrome = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER", padding: [0, 18] });
  chrome.resize(FRAME_W, CHROME_H);
  chrome.primaryAxisSizingMode = "FIXED";
  chrome.counterAxisSizingMode = "FIXED";
  fillToken(t, chrome, "bg/surface");
  strokeToken(t, chrome, "border/subtle", 1);
  chrome.strokeTopWeight = 0;
  chrome.strokeLeftWeight = 0;
  chrome.strokeRightWeight = 0;
  for (const c of ["#FF5F57", "#FEBC2E", "#28C840"]) {
    const dot = ellipse(11);
    dot.fills = [aa(c, 0.9)];
    dot.strokes = [];
    chrome.appendChild(dot);
  }
  const urlPill = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [6, 14] });
  urlPill.cornerRadius = RADII.full;
  fillToken(t, urlPill, "bg/inset");
  urlPill.appendChild(icon(t, "lock", 12, "text/muted"));
  urlPill.appendChild(await makeText(t, "mono/sm", url, "text/secondary"));
  chrome.appendChild(urlPill);
  urlPill.layoutGrow = 1;
  const lang = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
  lang.appendChild(icon(t, "globe", 14, "text/secondary"));
  lang.appendChild(await makeText(t, "label/sm", "EN", "text/primary"));
  lang.appendChild(icon(t, "chevron-down", 12, "text/muted"));
  chrome.appendChild(lang);
  shell.appendChild(chrome);
  chrome.x = 0;
  chrome.y = 0;

  const body = figma.createFrame();
  body.name = "body";
  body.resize(FRAME_W, BODY_H);
  body.clipsContent = true;
  body.fills = [];
  shell.appendChild(body);
  body.x = 0;
  body.y = CHROME_H;
  return { shell, body };
}

/** Requirements annotation card sitting beside a screen. */
async function reqCard(
  t: ThemeContext,
  title: string,
  sub: string,
  rows: Array<[string, string]>,
): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 14, padding: 24, name: "requirements" });
  card.resize(REQ_W, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  const head = autoFrame({ direction: "VERTICAL", gap: 4 });
  head.appendChild(await makeText(t, "overline", "Requirements", "accent/dante"));
  head.appendChild(
    await makeText(t, "heading/h4", title, "text/primary", { maxWidth: REQ_W - 48 }),
  );
  head.appendChild(await makeText(t, "caption", sub, "text/muted", { maxWidth: REQ_W - 48 }));
  card.appendChild(head);
  const line = rect(REQ_W - 48, 1);
  fillToken(t, line, "border/subtle");
  card.appendChild(line);
  for (const [en, ru] of rows) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "MIN" });
    row.layoutAlign = "STRETCH";
    row.primaryAxisSizingMode = "FIXED";
    const dot = ellipse(6);
    dot.fills = [aa("#5EE6C1", 0.9)];
    dot.strokes = [];
    const dotWrap = autoFrame({ direction: "VERTICAL", gap: 0 });
    dotWrap.paddingTop = 6;
    dotWrap.appendChild(dot);
    row.appendChild(dotWrap);
    const txt = autoFrame({ direction: "VERTICAL", gap: 1 });
    txt.appendChild(await makeText(t, "body/sm", en, "text/secondary", { maxWidth: REQ_W - 82 }));
    if (ru)
      txt.appendChild(await makeText(t, "caption", ru, "text/muted", { maxWidth: REQ_W - 82 }));
    row.appendChild(txt);
    txt.layoutGrow = 1;
    card.appendChild(row);
  }
  return card;
}

/** Fake dark OSM-ish map: base + roads + park/water patches. */
function mapBase(_t: ThemeContext, w: number, h: number): FrameNode {
  const m = figma.createFrame();
  m.name = "map";
  m.resize(w, h);
  m.clipsContent = true;
  m.fills = [solid("#0C1116")];
  // water + park patches
  const water = rect(w * 0.4, h * 0.5, 20);
  water.fills = [aa("#12303A", 0.7)];
  m.appendChild(water);
  water.x = -40;
  water.y = h * 0.5;
  const park = ellipse(220);
  park.fills = [aa("#16321F", 0.8)];
  park.strokes = [];
  m.appendChild(park);
  park.x = w * 0.62;
  park.y = -60;
  // roads
  for (const [x1, y1, x2, y2, wd] of [
    [0, h * 0.3, w, h * 0.42, 3],
    [w * 0.25, 0, w * 0.4, h, 3],
    [0, h * 0.72, w, h * 0.64, 2],
    [w * 0.7, 0, w * 0.55, h, 2],
  ] as Array<[number, number, number, number, number]>) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const road = rect(len, wd);
    road.fills = [aa("#243038", 0.9)];
    road.rotation = -(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    m.appendChild(road);
    road.x = x1;
    road.y = y1;
  }
  return m;
}

/** A circle point on the map — translucent radius + pin, colored by status. */
function mapCircle(
  _t: ThemeContext,
  x: number,
  y: number,
  r: number,
  status: "active" | "draft" | "expired",
): FrameNode {
  const hex = status === "active" ? "#5EE6C1" : status === "draft" ? "#818CF8" : "#FB7185";
  const g = figma.createFrame();
  g.name = `circle/${status}`;
  g.resize(r * 2, r * 2);
  g.fills = [];
  g.clipsContent = false;
  const disc = ellipse(r * 2);
  disc.fills = [aa(hex, status === "active" ? 0.16 : 0.08)];
  disc.strokes = [aa(hex, 0.7)];
  disc.strokeWeight = 1.5;
  if (status === "draft") disc.dashPattern = [6, 5];
  g.appendChild(disc);
  const pin = ellipse(12);
  pin.fills = [solid(hex)];
  pin.strokes = [aa("#0A0A0B", 0.5)];
  pin.strokeWeight = 2;
  g.appendChild(pin);
  pin.x = r - 6;
  pin.y = r - 6;
  g.x = x - r;
  g.y = y - r;
  return g;
}

async function consentBanner(t: ThemeContext, w: number): Promise<FrameNode> {
  const b = autoFrame({ direction: "HORIZONTAL", gap: 16, cross: "CENTER", padding: [16, 22] });
  b.resize(w - 48, b.height);
  b.primaryAxisSizingMode = "FIXED";
  b.counterAxisSizingMode = "AUTO";
  b.cornerRadius = RADII.lg;
  fillToken(t, b, "bg/surface");
  strokeToken(t, b, "border/default", 1);
  await applyEffect(b, "shadow/lg", t);
  const txt = autoFrame({ direction: "VERTICAL", gap: 2 });
  txt.appendChild(await makeText(t, "label/sm", "We use cookies", "text/primary"));
  txt.appendChild(
    await makeText(
      t,
      "caption",
      "Necessary always on · Analytics only after you allow it (Plausible, cookieless).",
      "text/muted",
      { maxWidth: 560 },
    ),
  );
  b.appendChild(txt);
  txt.layoutGrow = 1;
  const btns = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  for (const [label, kind] of [
    ["Settings", "ghost"],
    ["Decline", "outline"],
    ["Accept all", "primary"],
  ] as Array<[string, string]>) {
    const bt = autoFrame({
      direction: "HORIZONTAL",
      align: "CENTER",
      cross: "CENTER",
      padding: [8, 14],
    });
    bt.cornerRadius = RADII.full;
    if (kind === "primary") {
      fillToken(t, bt, "accent/primary");
      bt.appendChild(await makeText(t, "label/sm", label, "accent/contrast"));
    } else if (kind === "outline") {
      strokeToken(t, bt, "border/strong", 1);
      bt.appendChild(await makeText(t, "label/sm", label, "text/primary"));
    } else bt.appendChild(await makeText(t, "label/sm", label, "text/secondary"));
    btns.appendChild(bt);
  }
  b.appendChild(btns);
  return b;
}

async function pill(
  t: ThemeContext,
  label: string,
  kind: "primary" | "outline" | "ghost",
  iconName?: string,
): Promise<FrameNode> {
  const b = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    align: "CENTER",
    cross: "CENTER",
    padding: [12, 22],
  });
  b.cornerRadius = RADII.full;
  const tone = kind === "primary" ? "accent/contrast" : "text/primary";
  if (kind === "primary") {
    fillToken(t, b, "accent/primary");
    await applyEffect(b, "glow/button", t);
  } else if (kind === "outline") strokeToken(t, b, "border/strong", 1);
  if (iconName)
    b.appendChild(icon(t, iconName, 16, kind === "primary" ? "accent/contrast" : "text/secondary"));
  b.appendChild(await makeText(t, "label/md", label, tone));
  return b;
}

async function field(
  t: ThemeContext,
  w: number,
  label: string,
  value: string,
  filled = false,
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 7 });
  col.resize(w, col.height);
  col.counterAxisSizingMode = "FIXED";
  col.appendChild(await makeText(t, "label/sm", label, "text/secondary"));
  const box = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", padding: [11, 14] });
  box.layoutAlign = "STRETCH";
  box.primaryAxisSizingMode = "FIXED";
  box.cornerRadius = RADII.md;
  fillToken(t, box, "bg/inset");
  strokeToken(t, box, filled ? "border/default" : "border/subtle", 1);
  box.appendChild(await makeText(t, "body/sm", value, filled ? "text/primary" : "text/muted"));
  col.appendChild(box);
  return col;
}

// ── Screens ───────────────────────────────────────────────────

async function screenMap(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserFrame(t, "orbit.okryshto.dev", "01-public-map");
  const map = mapBase(t, FRAME_W, BODY_H);
  body.appendChild(map);
  map.x = 0;
  map.y = 0;
  body.appendChild(mapCircle(t, 360, 300, 90, "active"));
  body.appendChild(mapCircle(t, 780, 230, 70, "draft"));
  body.appendChild(mapCircle(t, 620, 520, 60, "expired"));

  // selected point popup
  const pop = autoFrame({ direction: "VERTICAL", gap: 10, padding: 18 });
  pop.resize(300, pop.height);
  pop.counterAxisSizingMode = "FIXED";
  pop.cornerRadius = RADII.lg;
  fillToken(t, pop, "bg/surface");
  strokeToken(t, pop, "border/default", 1);
  await applyEffect(pop, "shadow/lg", t);
  const ph = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  const badge = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [2, 9],
  });
  badge.cornerRadius = RADII.full;
  badge.fills = [aa("#5EE6C1", 0.16)];
  badge.appendChild(await makeText(t, "caption", "ACTIVE", "accent/primary"));
  ph.appendChild(badge);
  ph.appendChild(await makeText(t, "caption", "closes in 6 days", "text/muted"));
  pop.appendChild(ph);
  pop.appendChild(await makeText(t, "label/md", "Access point · Berlin Mitte", "text/primary"));
  pop.appendChild(
    await makeText(
      t,
      "caption",
      "A payload is available inside this circle during its window. Request access to unlock.",
      "text/muted",
      { maxWidth: 264 },
    ),
  );
  const reqBtn = await pill(t, "Request access", "primary", "lock");
  reqBtn.layoutAlign = "STRETCH"; // full-width in the popup
  pop.appendChild(reqBtn);
  body.appendChild(pop);
  pop.x = 430;
  pop.y = 250;

  const banner = await consentBanner(t, FRAME_W);
  body.appendChild(banner);
  banner.x = 24;
  banner.y = BODY_H - banner.height - 20;
  return shell;
}

/** Compact month calendar — availability window highlighted, one day selected. */
async function miniCalendar(t: ThemeContext, w: number): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 12, padding: 16, name: "calendar" });
  col.resize(w, col.height);
  col.counterAxisSizingMode = "FIXED";
  col.cornerRadius = RADII.lg;
  fillToken(t, col, "bg/inset");
  strokeToken(t, col, "border/subtle", 1);
  const head = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
  head.layoutAlign = "STRETCH";
  head.primaryAxisSizingMode = "FIXED";
  head.appendChild(icon(t, "chevron-left", 16, "text/muted"));
  head.appendChild(spacer());
  (head.children[1] as RectangleNode).layoutGrow = 1;
  head.appendChild(await makeText(t, "label/md", "August 2026", "text/primary"));
  head.appendChild(spacer());
  (head.children[3] as RectangleNode).layoutGrow = 1;
  head.appendChild(icon(t, "chevron-right", 16, "text/muted"));
  col.appendChild(head);
  const g = 5; // breathing room between cells
  const cellW = Math.floor((w - 32 - g * 6) / 7);
  const gridW = cellW * 7 + g * 6;
  const grid = autoFrame({ direction: "HORIZONTAL", gap: g, wrap: true });
  grid.resize(gridW, grid.height);
  grid.primaryAxisSizingMode = "FIXED";
  grid.counterAxisSizingMode = "AUTO";
  grid.counterAxisSpacing = g;
  const wd = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  for (const d of wd) {
    const c = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    c.resize(cellW, 24);
    c.primaryAxisSizingMode = "FIXED";
    c.counterAxisSizingMode = "FIXED";
    c.appendChild(await makeText(t, "caption", d, "text/muted"));
    grid.appendChild(c);
  }
  // 4 leading muted (Jul 28–31), then 1–31, window 1–20 highlighted, 8 selected.
  const cells: Array<{ n: number; muted?: boolean }> = [];
  for (const n of [28, 29, 30, 31]) cells.push({ n, muted: true });
  for (let n = 1; n <= 31; n++) cells.push({ n });
  for (const cell of cells) {
    const c = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    c.resize(cellW, 34);
    c.primaryAxisSizingMode = "FIXED";
    c.counterAxisSizingMode = "FIXED";
    c.cornerRadius = RADII.md;
    const inWindow = !cell.muted && cell.n >= 1 && cell.n <= 20;
    const selected = !cell.muted && cell.n === 8;
    let tone = cell.muted ? "text/muted" : inWindow ? "text/primary" : "text/secondary";
    if (selected) {
      fillToken(t, c, "accent/primary");
      tone = "accent/contrast";
    } else if (inWindow) c.fills = [aa("#5EE6C1", 0.1)];
    c.appendChild(await makeText(t, "label/sm", String(cell.n), tone));
    grid.appendChild(c);
  }
  col.appendChild(grid);
  const legend = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  const sw = ellipse(8);
  sw.fills = [aa("#5EE6C1", 0.4)];
  sw.strokes = [];
  legend.appendChild(sw);
  legend.appendChild(await makeText(t, "caption", "Availability window · Aug 1–20", "text/muted"));
  col.appendChild(legend);
  return col;
}

function toolbarBtn(t: ThemeContext, iconName: string, active = false): FrameNode {
  const b = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  b.resize(32, 32);
  b.primaryAxisSizingMode = "FIXED";
  b.counterAxisSizingMode = "FIXED";
  b.cornerRadius = RADII.sm;
  if (active) b.fills = [aa("#5EE6C1", 0.14)];
  b.appendChild(icon(t, iconName, 16, active ? "accent/primary" : "text/secondary"));
  return b;
}

/** Full-height WYSIWYG editor panel — the "Describe more" expand. */
async function wysiwyg(t: ThemeContext, w: number, h: number): Promise<FrameNode> {
  const p = autoFrame({ direction: "VERTICAL", gap: 0, name: "wysiwyg" });
  p.resize(w, h);
  p.primaryAxisSizingMode = "FIXED";
  p.counterAxisSizingMode = "FIXED";
  fillToken(t, p, "bg/surface");
  strokeToken(t, p, "border/default", 1);
  await applyEffect(p, "shadow/lg", t);
  // header
  const head = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [18, 22] });
  head.layoutAlign = "STRETCH";
  head.primaryAxisSizingMode = "FIXED";
  const hc = autoFrame({ direction: "VERTICAL", gap: 2 });
  hc.appendChild(await makeText(t, "heading/h4", "Describe yourself", "text/primary"));
  hc.appendChild(
    await makeText(
      t,
      "caption",
      "Rich text — the more context, the faster the approve.",
      "text/muted",
    ),
  );
  head.appendChild(hc);
  hc.layoutGrow = 1;
  head.appendChild(icon(t, "x", 18, "text/muted"));
  p.appendChild(head);
  const l1 = rect(w, 1);
  fillToken(t, l1, "border/subtle");
  p.appendChild(l1);
  // toolbar
  const tb = autoFrame({ direction: "HORIZONTAL", gap: 4, cross: "CENTER", padding: [8, 18] });
  tb.layoutAlign = "STRETCH";
  tb.primaryAxisSizingMode = "FIXED";
  fillToken(t, tb, "bg/surface-raised");
  for (const [ic, on] of [
    ["type", false],
    ["bold", true],
    ["italic", false],
    ["underline", false],
    ["list", true],
    ["link", false],
    ["image", false],
  ] as Array<[string, boolean]>) {
    tb.appendChild(toolbarBtn(t, ic, on));
    if (ic === "type" || ic === "underline" || ic === "link") {
      const sep = rect(1, 18);
      fillToken(t, sep, "border/subtle");
      tb.appendChild(sep);
    }
  }
  p.appendChild(tb);
  const l2 = rect(w, 1);
  fillToken(t, l2, "border/subtle");
  p.appendChild(l2);
  // content
  const content = autoFrame({ direction: "VERTICAL", gap: 12, padding: 22 });
  content.layoutAlign = "STRETCH";
  content.primaryAxisSizingMode = "FIXED";
  content.appendChild(await makeText(t, "heading/h4", "About Nordlicht Studio", "text/primary"));
  content.appendChild(
    await makeText(
      t,
      "body/sm",
      "We're a five-person product studio in Berlin. We ship design systems and interfaces for climate-tech founders, and we're hiring a design engineer to own our component layer.",
      "text/secondary",
      { maxWidth: w - 44 },
    ),
  );
  for (const li of [
    "Why you: your dark-first system + motion work fits our aesthetic.",
    "Scope: 3-month contract, remote-first, starting September.",
    "Next: a short call, then a paid trial task.",
  ]) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "MIN" });
    row.layoutAlign = "STRETCH";
    row.primaryAxisSizingMode = "FIXED";
    const dotWrap = autoFrame({ direction: "VERTICAL", gap: 0 });
    dotWrap.paddingTop = 7;
    const dot = ellipse(5);
    dot.fills = [aa("#5EE6C1", 0.9)];
    dot.strokes = [];
    dotWrap.appendChild(dot);
    row.appendChild(dotWrap);
    row.appendChild(await makeText(t, "body/sm", li, "text/secondary", { maxWidth: w - 66 }));
    content.appendChild(row);
  }
  const caret = rect(2, 18);
  fillToken(t, caret, "accent/primary");
  content.appendChild(caret);
  p.appendChild(content);
  const grow = rect(1, 1);
  grow.fills = [];
  p.appendChild(grow);
  grow.layoutGrow = 1;
  const l3 = rect(w, 1);
  fillToken(t, l3, "border/subtle");
  p.appendChild(l3);
  const foot = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [16, 22] });
  foot.layoutAlign = "STRETCH";
  foot.primaryAxisSizingMode = "FIXED";
  foot.appendChild(await makeText(t, "caption", "148 words · autosaved", "text/muted"));
  foot.appendChild(spacer());
  (foot.children[1] as RectangleNode).layoutGrow = 1;
  foot.appendChild(await pill(t, "Done", "primary", "check"));
  p.appendChild(foot);
  return p;
}

async function screenRequest(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserFrame(t, "orbit.okryshto.dev", "02-request-access");
  const map = mapBase(t, FRAME_W, BODY_H);
  map.opacity = 0.5;
  body.appendChild(map);
  map.x = 0;
  map.y = 0;
  const scrim = rect(FRAME_W, BODY_H);
  scrim.fills = [aa("#05060A", 0.5)];
  body.appendChild(scrim);
  scrim.x = 0;
  scrim.y = 0;

  const MW = 820;
  const modal = autoFrame({ direction: "VERTICAL", gap: 18, padding: 28 });
  modal.resize(MW, modal.height);
  modal.counterAxisSizingMode = "FIXED";
  modal.cornerRadius = RADII.xl;
  fillToken(t, modal, "bg/surface");
  strokeToken(t, modal, "border/default", 1);
  await applyEffect(modal, "shadow/lg", t);
  const mh = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
  mh.layoutAlign = "STRETCH";
  mh.primaryAxisSizingMode = "FIXED";
  const mhc = autoFrame({ direction: "VERTICAL", gap: 3 });
  mhc.appendChild(await makeText(t, "heading/h3", "Introduce yourself", "text/primary"));
  mhc.appendChild(
    await makeText(
      t,
      "caption",
      "Tell me who you are, pick a pickup day — that's the whole gate. I approve manually.",
      "text/muted",
      { maxWidth: 560 },
    ),
  );
  mh.appendChild(mhc);
  mhc.layoutGrow = 1;
  mh.appendChild(icon(t, "x", 18, "text/muted"));
  modal.appendChild(mh);

  // two columns: fields (left) + calendar (right)
  const cols = autoFrame({ direction: "HORIZONTAL", gap: 24, cross: "MIN" });
  cols.layoutAlign = "STRETCH";
  cols.primaryAxisSizingMode = "FIXED";
  const leftW = 400;
  const rightW = MW - 56 - 24 - leftW; // 340 — wider so the calendar breathes
  const left = autoFrame({ direction: "VERTICAL", gap: 14 });
  left.resize(leftW, left.height);
  left.counterAxisSizingMode = "FIXED";
  const row1 = autoFrame({ direction: "HORIZONTAL", gap: 16 });
  row1.layoutAlign = "STRETCH";
  row1.primaryAxisSizingMode = "FIXED";
  row1.appendChild(await field(t, 192, "Name", "Anna Weber", true));
  row1.appendChild(await field(t, 192, "Email", "anna@studio.de", true));
  left.appendChild(row1);
  left.appendChild(await field(t, leftW, "Who are you?", "Founder at Nordlicht Studio", true));
  left.appendChild(
    await field(t, leftW, "Why the payload?", "Considering you for a design role.", false),
  );
  // "Describe more" — opens the full-height WYSIWYG (see screen 02b)
  const describe = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    cross: "CENTER",
    padding: [10, 14],
  });
  describe.layoutAlign = "STRETCH";
  describe.primaryAxisSizingMode = "FIXED";
  describe.cornerRadius = RADII.md;
  strokeToken(t, describe, "border/default", 1);
  describe.dashPattern = [6, 5];
  describe.appendChild(icon(t, "type", 15, "accent/primary"));
  describe.appendChild(await makeText(t, "label/sm", "Describe more", "accent/primary"));
  describe.appendChild(spacer());
  (describe.children[2] as RectangleNode).layoutGrow = 1;
  describe.appendChild(await makeText(t, "caption", "rich editor →", "text/muted"));
  describe.appendChild(icon(t, "chevron-right", 14, "text/muted"));
  left.appendChild(describe);
  cols.appendChild(left);

  const right = autoFrame({ direction: "VERTICAL", gap: 8 });
  right.resize(rightW, right.height);
  right.counterAxisSizingMode = "FIXED";
  right.appendChild(await makeText(t, "label/sm", "Preferred pickup day", "text/secondary"));
  right.appendChild(await miniCalendar(t, rightW));
  cols.appendChild(right);
  modal.appendChild(cols);

  const consent = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "MIN" });
  const cb = rect(18, 18, 5);
  fillToken(t, cb, "accent/primary");
  consent.appendChild(cb);
  consent.appendChild(
    await makeText(
      t,
      "caption",
      "I agree my details are stored to process this request (GDPR). Delete on request.",
      "text/muted",
      { maxWidth: 560 },
    ),
  );
  modal.appendChild(consent);
  const foot = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  foot.layoutAlign = "STRETCH";
  foot.primaryAxisSizingMode = "FIXED";
  foot.appendChild(spacer());
  (foot.children[0] as RectangleNode).layoutGrow = 1;
  foot.appendChild(await pill(t, "Cancel", "outline"));
  foot.appendChild(await pill(t, "Send request", "primary", "send"));
  modal.appendChild(foot);
  body.appendChild(modal);
  modal.x = (FRAME_W - MW) / 2;
  modal.y = Math.round((BODY_H - modal.height) / 2);
  return shell;
}

/** 02b — "Describe more" opened: WYSIWYG editor docked full-height on the right. */
async function screenDescribeMore(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserFrame(t, "orbit.okryshto.dev", "02b-describe-more");
  const map = mapBase(t, FRAME_W, BODY_H);
  map.opacity = 0.4;
  body.appendChild(map);
  map.x = 0;
  map.y = 0;
  const scrim = rect(FRAME_W, BODY_H);
  scrim.fills = [aa("#05060A", 0.55)];
  body.appendChild(scrim);
  scrim.x = 0;
  scrim.y = 0;

  // the request modal, dimmed and pushed left (context)
  const ghost = autoFrame({ direction: "VERTICAL", gap: 12, padding: 24 });
  ghost.resize(420, 300);
  ghost.primaryAxisSizingMode = "FIXED";
  ghost.counterAxisSizingMode = "FIXED";
  ghost.cornerRadius = RADII.xl;
  fillToken(t, ghost, "bg/surface");
  strokeToken(t, ghost, "border/subtle", 1);
  ghost.opacity = 0.5;
  ghost.appendChild(await makeText(t, "heading/h3", "Introduce yourself", "text/primary"));
  ghost.appendChild(await makeText(t, "caption", "…form behind the editor", "text/muted"));
  body.appendChild(ghost);
  ghost.x = 70;
  ghost.y = 90;

  // WYSIWYG docked right, full body height
  const W = 560;
  const panel = await wysiwyg(t, W, BODY_H);
  body.appendChild(panel);
  panel.x = FRAME_W - W;
  panel.y = 0;
  return shell;
}

async function screenState(t: ThemeContext, kind: "pending" | "approved"): Promise<FrameNode> {
  const { shell, body } = await browserFrame(
    t,
    "orbit.okryshto.dev",
    kind === "pending" ? "03-pending" : "04-approved",
  );
  const map = mapBase(t, FRAME_W, BODY_H);
  map.opacity = 0.35;
  body.appendChild(map);
  map.x = 0;
  map.y = 0;

  const card = autoFrame({
    direction: "VERTICAL",
    gap: 16,
    align: "CENTER",
    cross: "CENTER",
    padding: 40,
  });
  card.resize(560, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/default", 1);
  await applyEffect(card, "shadow/lg", t);

  const halo = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  halo.resize(64, 64);
  halo.primaryAxisSizingMode = "FIXED";
  halo.counterAxisSizingMode = "FIXED";
  halo.cornerRadius = RADII.full;
  const tone = kind === "pending" ? "feedback/warning" : "accent/primary";
  halo.fills = [aa(kind === "pending" ? "#FBBF24" : "#5EE6C1", 0.15)];
  halo.appendChild(icon(t, kind === "pending" ? "clock" : "unlock", 30, tone));
  card.appendChild(halo);

  if (kind === "pending") {
    card.appendChild(
      await makeText(t, "heading/h2", "Request sent", "text/primary", { align: "CENTER" }),
    );
    card.appendChild(
      await makeText(
        t,
        "body/md",
        "Thanks, Anna. I'll review your intro and email you at anna@studio.de when access is approved.",
        "text/secondary",
        { align: "CENTER", maxWidth: 440 },
      ),
    );
    card.appendChild(await pill(t, "Back to map", "outline"));
  } else {
    card.appendChild(
      await makeText(t, "heading/h2", "Access approved", "text/primary", { align: "CENTER" }),
    );
    card.appendChild(
      await makeText(
        t,
        "body/md",
        "Your payload is ready. This link works once and expires in 24 hours.",
        "text/secondary",
        { align: "CENTER", maxWidth: 440 },
      ),
    );
    const file = autoFrame({
      direction: "HORIZONTAL",
      gap: 12,
      cross: "CENTER",
      padding: [14, 16],
    });
    file.resize(400, file.height);
    file.primaryAxisSizingMode = "FIXED";
    file.counterAxisSizingMode = "AUTO";
    file.cornerRadius = RADII.lg;
    fillToken(t, file, "bg/inset");
    strokeToken(t, file, "border/subtle", 1);
    const fic = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    fic.resize(36, 36);
    fic.primaryAxisSizingMode = "FIXED";
    fic.counterAxisSizingMode = "FIXED";
    fic.cornerRadius = RADII.md;
    fic.fills = [aa("#5EE6C1", 0.15)];
    fic.appendChild(icon(t, "download", 18, "accent/primary"));
    file.appendChild(fic);
    const fcol = autoFrame({ direction: "VERTICAL", gap: 2 });
    fcol.appendChild(await makeText(t, "label/sm", "payload.zip", "text/primary"));
    fcol.appendChild(await makeText(t, "caption", "single-use · expires 24h", "text/muted"));
    file.appendChild(fcol);
    fcol.layoutGrow = 1;
    file.appendChild(await makeText(t, "mono/sm", "4.2 MB", "text/muted"));
    card.appendChild(file);
    card.appendChild(await pill(t, "Download payload", "primary", "download"));
  }
  body.appendChild(card);
  card.x = (FRAME_W - 560) / 2;
  card.y = Math.round((BODY_H - card.height) / 2);
  return shell;
}

export async function paintTemplateOrbit(t: ThemeContext, page: PageNode): Promise<void> {
  const label = await makeText(
    t,
    "overline",
    "12 · Template (Orbit) — DESIGN ONLY · public map + self-intro access · orbit.okryshto.dev",
    "accent/primary",
  );
  page.appendChild(label);
  label.x = 0;
  label.y = -84;
  const note = await makeText(
    t,
    "caption",
    "Layouts for review. Don’t start implementation — requirements are in the cards on the right.",
    "text/muted",
  );
  page.appendChild(note);
  note.x = 0;
  note.y = -56;

  const screens: Array<{ node: FrameNode; cap: string; req: FrameNode }> = [
    {
      node: await screenMap(t),
      cap: "01 · Public map — anyone, no login",
      req: await reqCard(t, "Public map", "Anyone can view; no login.", [
        ["OpenStreetMap + Leaflet, dark tiles", "OSM + Leaflet,"],
        ["Points created by admin only (in omm)", "( omm)"],
        ["Public sees WHERE, not the payload", ", payload"],
        ["Statuses: draft / active / expired", ": draft / active / expired"],
        ["Circle = center + radius + time window", ""],
        ["i18n en / de / ru, lang switch top-right", "i18n en / de / ru,"],
      ]),
    },
    {
      node: await screenRequest(t),
      cap: "02 · Request access — self-intro form + calendar",
      req: await reqCard(
        t,
        "Access gate = introduce yourself",
        "No usage policy; a proper intro is the gate.",
        [
          ["Explicit «Request access» action", "«Request access»"],
          ["Fields: name, email, who, why", ": , email, ,"],
          [
            "Calendar: pick a pickup day in the window",
            "Calendar: pick-up day within the availability window",
          ],
          ["«Describe more» → full-height rich editor", "«Describe more» →"],
          ["Manual admin approve (auto-approve later)", "approve ( — )"],
          ["Collecting intro = GDPR basis + delete", "= GDPR +"],
          [
            "No payload access until approved (backend)",
            "No payload access until approve (backend)",
          ],
        ],
      ),
    },
    {
      node: await screenDescribeMore(t),
      cap: "02b · Describe more — WYSIWYG editor open",
      req: await reqCard(
        t,
        "Rich «Describe more» editor",
        "Slides in full-height from the right.",
        [
          ["Opens from «Describe more» in the form", "«Describe more»"],
          ["WYSIWYG: bold/italic/lists/links/images", "WYSIWYG: bold/italic/lists/links/images"],
          ["Full body height, right-docked panel", ""],
          ["Autosave + word count", ""],
          ["Sanitize HTML on submit (XSS)", "HTML (XSS)"],
          ["Feeds the same request → approve queue", "→ approve"],
        ],
      ),
    },
    {
      node: await screenState(t, "pending"),
      cap: "03 · Pending — waiting for approval",
      req: await reqCard(t, "Pending state", "Between request and approval.", [
        ["Confirmation + email will be sent", "+ email"],
        ["Nothing downloadable yet", ""],
        ["Admin decides in omm requests queue", "omm"],
      ]),
    },
    {
      node: await screenState(t, "approved"),
      cap: "04 · Approved — download payload",
      req: await reqCard(t, "Approved & download", "Payload unlocked for this user.", [
        ["Presigned link: single-use OR 24h", "Presigned: 24"],
        ["No public/static URL, ever", "/ URL"],
        ["One file (versions idea dropped)", ""],
        ["Storage: Hetzner Object Storage (S3)", ": Hetzner Object Storage (S3)"],
      ]),
    },
  ];

  let y = 0;
  for (const s of screens) {
    const cap = await makeText(t, "overline", s.cap, "text/muted");
    page.appendChild(cap);
    cap.x = 0;
    cap.y = y - 30;
    page.appendChild(s.node);
    s.node.x = 0;
    s.node.y = y;
    page.appendChild(s.req);
    s.req.x = FRAME_W + GAP_X;
    s.req.y = y;
    y += FRAME_H + GAP_Y;
  }
}
