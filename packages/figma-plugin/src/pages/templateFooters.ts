/**
 * Template (Footers) — DESIGN ONLY. A wall of footer variants (minimal → mega),
 * incl. a frosted-glass one matching the header, with a slot legend so you can
 * mix-and-match. No implementation — annotated design frames.
 */

import { RADII } from "../tokens";
import { solid } from "../core/color";
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

async function link(t: ThemeContext, label: string, muted = true): Promise<TextNode> {
  return makeText(t, "body/sm", label, muted ? "text/secondary" : "text/primary");
}

async function linkCol(t: ThemeContext, title: string, items: string[]): Promise<FrameNode> {
  const c = autoFrame({ direction: "VERTICAL", gap: 12 });
  c.appendChild(await makeText(t, "label/sm", title, "text/primary"));
  const g = rect(1, 4);
  g.fills = [];
  c.appendChild(g);
  for (const it of items) c.appendChild(await link(t, it));
  return c;
}

async function wordmark(t: ThemeContext): Promise<FrameNode> {
  const g = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  g.appendChild(brandMark(t, 28)); // mint→dante gradient brand mark
  g.appendChild(await makeText(t, "heading/h4", "okryshto", "text/primary"));
  return g;
}

function socialRow(t: ThemeContext, size = 36): FrameNode {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  for (const name of ["github", "mail", "send", "external-link"]) {
    const c = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    c.resize(size, size);
    c.primaryAxisSizingMode = "FIXED";
    c.counterAxisSizingMode = "FIXED";
    c.cornerRadius = RADII.full;
    c.fills = [aa("#FFFFFF", 0.06)];
    strokeToken(t, c, "border/subtle", 1);
    c.appendChild(icon(t, name, Math.round(size * 0.44), "text/secondary"));
    row.appendChild(c);
  }
  return row;
}

async function newsletter(t: ThemeContext, w: number): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 10 });
  col.resize(w, col.height);
  col.counterAxisSizingMode = "FIXED";
  col.appendChild(await makeText(t, "label/md", "Stay in the loop", "text/primary"));
  col.appendChild(
    await makeText(t, "caption", "One email a month. No spam, unsubscribe anytime.", "text/muted", {
      maxWidth: w,
    }),
  );
  const rowf = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  rowf.layoutAlign = "STRETCH";
  rowf.primaryAxisSizingMode = "FIXED";
  const inp = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", padding: [10, 14] });
  inp.cornerRadius = RADII.full;
  fillToken(t, inp, "bg/inset");
  strokeToken(t, inp, "border/default", 1);
  inp.appendChild(await makeText(t, "body/sm", "you@email.com", "text/muted"));
  rowf.appendChild(inp);
  inp.layoutGrow = 1;
  const btn = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [10, 18],
  });
  btn.cornerRadius = RADII.full;
  fillToken(t, btn, "accent/primary");
  btn.appendChild(await makeText(t, "label/md", "Subscribe", "accent/contrast"));
  rowf.appendChild(btn);
  col.appendChild(rowf);
  return col;
}

async function copyrightRow(t: ThemeContext, w: number, withLang = false): Promise<FrameNode> {
  const r = autoFrame({ direction: "HORIZONTAL", gap: 16, cross: "CENTER" });
  r.resize(w, r.height);
  r.primaryAxisSizingMode = "FIXED";
  r.counterAxisSizingMode = "AUTO";
  r.appendChild(await makeText(t, "caption", "© 2026 Oleksii Kryshtopa", "text/muted"));
  r.appendChild(spacer());
  (r.children[1] as RectangleNode).layoutGrow = 1;
  for (const l of ["Privacy", "Terms", "Cookies"])
    r.appendChild(await makeText(t, "caption", l, "text/muted"));
  if (withLang) {
    const lang = autoFrame({ direction: "HORIZONTAL", gap: 5, cross: "CENTER" });
    lang.appendChild(icon(t, "globe", 13, "text/muted"));
    lang.appendChild(await makeText(t, "caption", "EN", "text/secondary"));
    lang.appendChild(icon(t, "chevron-down", 11, "text/muted"));
    r.appendChild(lang);
  }
  return r;
}

/** Base footer surface. */
function footerShell(t: ThemeContext, w: number, h: number, token = "bg/surface"): FrameNode {
  const f = figma.createFrame();
  f.name = "footer";
  f.resize(w, h);
  f.clipsContent = true;
  f.cornerRadius = RADII.lg;
  fillToken(t, f, token);
  strokeToken(t, f, "border/subtle", 1);
  return f;
}

/**
 * One labelled footer variant.
 *
 * Heights are measured from the node, never guessed: a hand-written height that
 * undershoots puts the caption inside the footer and the next label on top of it.
 * The label also needs ~52 px of air, because Figma draws the frame's own name
 * right above the frame and it would collide with the overline.
 */
async function fvariant(
  t: ThemeContext,
  page: PageNode,
  y: number,
  cap: string,
  note: string,
  node: FrameNode,
): Promise<number> {
  const LABEL_GAP = 52; // clears Figma's on-canvas frame name
  const NOTE_GAP = 16;
  const BLOCK_GAP = 84;

  const c = await makeText(t, "overline", cap, "accent/primary");
  page.appendChild(c);
  c.x = 0;
  c.y = y - LABEL_GAP;

  page.appendChild(node);
  node.x = 0;
  node.y = y;

  const n = await makeText(t, "caption", note, "text/muted", { maxWidth: W });
  page.appendChild(n);
  n.x = 0;
  n.y = y + node.height + NOTE_GAP;

  return y + node.height + NOTE_GAP + n.height + BLOCK_GAP;
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
      "Mix to fit the job — from a © line to a mega-footer.",
      "text/muted",
      { maxWidth: 472 },
    ),
  );
  const rows: Array<[string, string, string]> = [
    ["Logo + tagline", "brand", ""],
    ["Link columns", "big sites", ""],
    ["Newsletter signup", "marketing", ""],
    ["Big CTA", "portfolio", ""],
    ["Social icons", "always-ish", ""],
    ["Copyright line", "always", ""],
    ["Legal links", "GDPR", ""],
    ["Language switch", "i18n", ""],
    ["Status / version", "app / SaaS", ""],
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

// ── Variants ──────────────────────────────────────────────────

async function fMinimal(t: ThemeContext): Promise<FrameNode> {
  const f = footerShell(t, W, 72);
  const row = autoFrame({ direction: "HORIZONTAL", gap: 20, cross: "CENTER", padding: [0, 28] });
  row.resize(W, 72);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "FIXED";
  row.appendChild(await makeText(t, "caption", "© 2026 Oleksii Kryshtopa", "text/muted"));
  row.appendChild(spacer());
  (row.children[1] as RectangleNode).layoutGrow = 1;
  const links = autoFrame({ direction: "HORIZONTAL", gap: 22, cross: "CENTER" });
  for (const l of ["About", "Work", "Contact", "Privacy"]) links.appendChild(await link(t, l));
  row.appendChild(links);
  row.appendChild(socialRow(t, 30));
  f.appendChild(row);
  row.x = 0;
  row.y = 0;
  return f;
}

async function fColumns(t: ThemeContext): Promise<FrameNode> {
  const f = footerShell(t, W, 300);
  const pad = autoFrame({ direction: "VERTICAL", gap: 28, padding: 40 });
  pad.resize(W, pad.height);
  pad.counterAxisSizingMode = "FIXED";
  pad.fills = [];
  const top = autoFrame({ direction: "HORIZONTAL", gap: 40, cross: "MIN" });
  top.layoutAlign = "STRETCH";
  top.primaryAxisSizingMode = "FIXED";
  const brand = autoFrame({ direction: "VERTICAL", gap: 12 });
  brand.resize(300, brand.height);
  brand.counterAxisSizingMode = "FIXED";
  brand.appendChild(await wordmark(t));
  brand.appendChild(
    await makeText(
      t,
      "body/sm",
      "Product engineer building dark-first design systems, interfaces and motion.",
      "text/muted",
      { maxWidth: 280 },
    ),
  );
  brand.appendChild(socialRow(t, 34));
  top.appendChild(brand);
  top.appendChild(spacer());
  (top.children[1] as RectangleNode).layoutGrow = 1;
  top.appendChild(await linkCol(t, "Product", ["Overview", "Components", "Pricing", "Changelog"]));
  top.appendChild(await linkCol(t, "Company", ["About", "Journal", "Careers", "Contact"]));
  top.appendChild(await linkCol(t, "Resources", ["Docs", "Guides", "API", "Status"]));
  top.appendChild(await linkCol(t, "Legal", ["Privacy", "Terms", "Cookies", "GDPR"]));
  pad.appendChild(top);
  const hair = rect(W - 80, 1);
  fillToken(t, hair, "border/subtle");
  pad.appendChild(hair);
  pad.appendChild(await copyrightRow(t, W - 80, true));
  f.appendChild(pad);
  pad.x = 0;
  pad.y = 0;
  return f;
}

async function fNewsletter(t: ThemeContext): Promise<FrameNode> {
  const f = footerShell(t, W, 220);
  const pad = autoFrame({ direction: "VERTICAL", gap: 24, padding: 40 });
  pad.resize(W, pad.height);
  pad.counterAxisSizingMode = "FIXED";
  pad.fills = [];
  const top = autoFrame({ direction: "HORIZONTAL", gap: 40, cross: "MIN" });
  top.layoutAlign = "STRETCH";
  top.primaryAxisSizingMode = "FIXED";
  const brand = autoFrame({ direction: "VERTICAL", gap: 12 });
  brand.appendChild(await wordmark(t));
  const linksRow = autoFrame({ direction: "HORIZONTAL", gap: 22 });
  for (const l of ["Work", "About", "Journal", "Contact"]) linksRow.appendChild(await link(t, l));
  brand.appendChild(linksRow);
  top.appendChild(brand);
  top.appendChild(spacer());
  (top.children[1] as RectangleNode).layoutGrow = 1;
  top.appendChild(await newsletter(t, 380));
  pad.appendChild(top);
  const hair = rect(W - 80, 1);
  fillToken(t, hair, "border/subtle");
  pad.appendChild(hair);
  pad.appendChild(await copyrightRow(t, W - 80));
  f.appendChild(pad);
  pad.x = 0;
  pad.y = 0;
  return f;
}

async function fBigCta(t: ThemeContext): Promise<FrameNode> {
  const f = footerShell(t, W, 280, "bg/inset");
  // aurora wash
  const blob = auroraBlob(560, "#5EE6C1");
  blob.opacity = 0.16;
  f.appendChild(blob);
  blob.x = W - 360;
  blob.y = -180;
  const blob2 = auroraBlob(420, "#FF3D8B");
  blob2.opacity = 0.12;
  f.appendChild(blob2);
  blob2.x = -160;
  blob2.y = 60;
  const pad = autoFrame({ direction: "VERTICAL", gap: 22, padding: 44 });
  pad.resize(W, pad.height);
  pad.counterAxisSizingMode = "FIXED";
  pad.fills = [];
  pad.appendChild(
    await makeText(t, "display/lg", "Let's build something quietly excellent.", "text/primary", {
      maxWidth: 760,
    }),
  );
  const btns = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  const b1 = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    align: "CENTER",
    cross: "CENTER",
    padding: [13, 24],
  });
  b1.cornerRadius = RADII.full;
  fillToken(t, b1, "accent/primary");
  b1.appendChild(await makeText(t, "label/md", "Get in touch", "accent/contrast"));
  b1.appendChild(icon(t, "arrow-right", 16, "accent/contrast"));
  btns.appendChild(b1);
  const b2 = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [13, 24],
  });
  b2.cornerRadius = RADII.full;
  strokeToken(t, b2, "border/strong", 1);
  b2.appendChild(await makeText(t, "label/md", "See work", "text/primary"));
  btns.appendChild(b2);
  pad.appendChild(btns);
  const hair = rect(W - 88, 1);
  fillToken(t, hair, "border/subtle");
  pad.appendChild(hair);
  pad.appendChild(await copyrightRow(t, W - 88, true));
  f.appendChild(pad);
  pad.x = 0;
  pad.y = 0;
  return f;
}

async function fSocial(t: ThemeContext): Promise<FrameNode> {
  const f = footerShell(t, W, 200);
  const pad = autoFrame({
    direction: "VERTICAL",
    gap: 18,
    align: "CENTER",
    cross: "CENTER",
    padding: 36,
  });
  pad.resize(W, pad.height);
  pad.counterAxisSizingMode = "FIXED";
  pad.fills = [];
  pad.appendChild(await wordmark(t));
  pad.appendChild(
    await makeText(t, "body/sm", "Berlin · GMT+2 · open to select collaborations", "text/muted"),
  );
  pad.appendChild(socialRow(t, 44));
  pad.appendChild(
    await makeText(
      t,
      "caption",
      "© 2026 Oleksii Kryshtopa · built with the vizitka generator",
      "text/muted",
    ),
  );
  f.appendChild(pad);
  pad.x = 0;
  pad.y = 0;
  return f;
}

async function fStatusBar(t: ThemeContext): Promise<FrameNode> {
  const f = footerShell(t, W, 52, "bg/surface");
  const row = autoFrame({ direction: "HORIZONTAL", gap: 18, cross: "CENTER", padding: [0, 24] });
  row.resize(W, 52);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "FIXED";
  const status = autoFrame({ direction: "HORIZONTAL", gap: 7, cross: "CENTER" });
  const dot = ellipse(8);
  dot.fills = [solid("#4ADE80")];
  dot.strokes = [];
  status.appendChild(dot);
  status.appendChild(await makeText(t, "caption", "All systems operational", "text/secondary"));
  row.appendChild(status);
  row.appendChild(await makeText(t, "mono/sm", "v2.4.1", "text/muted"));
  row.appendChild(spacer());
  (row.children[2] as RectangleNode).layoutGrow = 1;
  for (const l of ["Docs", "Status", "Support", "Keyboard ⌘/"])
    row.appendChild(await makeText(t, "caption", l, "text/muted"));
  f.appendChild(row);
  row.x = 0;
  row.y = 0;
  return f;
}

async function fGlass(t: ThemeContext): Promise<FrameNode> {
  // backdrop so the frost reads
  const bd = figma.createFrame();
  bd.name = "glass-footer";
  bd.resize(W, 150);
  bd.clipsContent = true;
  bd.cornerRadius = RADII.lg;
  fillToken(t, bd, "bg/canvas");
  for (const [hex, size, x, y, op] of [
    ["#5EE6C1", 420, W * 0.3, 160, 0.26],
    ["#818CF8", 360, W * 0.75, 200, 0.2],
  ] as Array<[string, number, number, number, number]>) {
    const blob = auroraBlob(size, hex);
    blob.opacity = op;
    bd.appendChild(blob);
    blob.x = x - size / 2;
    blob.y = y - size / 2;
  }
  const bar = autoFrame({ direction: "HORIZONTAL", gap: 20, cross: "CENTER", padding: [0, 28] });
  bar.resize(W, 72);
  bar.primaryAxisSizingMode = "FIXED";
  bar.counterAxisSizingMode = "FIXED";
  bar.fills = [aa("#FFFFFF", 0.07)];
  bar.strokes = [aa("#FFFFFF", 0.22)];
  bar.strokeWeight = 1;
  bar.strokeAlign = "INSIDE";
  bar.effects = [{ type: "BACKGROUND_BLUR", radius: 24, visible: true } as BlurEffect];
  bar.appendChild(await wordmark(t));
  bar.appendChild(spacer());
  (bar.children[1] as RectangleNode).layoutGrow = 1;
  const links = autoFrame({ direction: "HORIZONTAL", gap: 22, cross: "CENTER" });
  for (const l of ["Work", "About", "Contact"]) links.appendChild(await link(t, l));
  bar.appendChild(links);
  bar.appendChild(socialRow(t, 30));
  bd.appendChild(bar);
  bar.x = 0;
  bar.y = 78;
  return bd;
}

async function fLegal(t: ThemeContext): Promise<FrameNode> {
  const f = footerShell(t, W, 52);
  const row = await copyrightRow(t, W - 48, true);
  const wrap = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", padding: [0, 24] });
  wrap.resize(W, 52);
  wrap.primaryAxisSizingMode = "FIXED";
  wrap.counterAxisSizingMode = "FIXED";
  wrap.appendChild(row);
  row.layoutGrow = 1;
  f.appendChild(wrap);
  wrap.x = 0;
  wrap.y = 0;
  return f;
}

export async function paintTemplateFooters(t: ThemeContext, page: PageNode): Promise<void> {
  const label = await makeText(
    t,
    "overline",
    "15 · Template (Footers) — DESIGN ONLY · minimal → mega · pick your slots",
    "accent/primary",
  );
  page.appendChild(label);
  label.x = 0;
  label.y = -84;
  const note = await makeText(
    t,
    "caption",
    "From a thin © line to a mega-footer with columns and a newsletter. There’s also a glass variant that matches the header.",
    "text/muted",
  );
  page.appendChild(note);
  note.x = 0;
  note.y = -56;

  const legend = await slotLegend(t);
  page.appendChild(legend);
  legend.x = W + 40;
  legend.y = 0;

  // start below the page header: its note sits at y = -56, and the first
  // variant label reaches 52 px above its frame
  let y = 60;
  y = await fvariant(
    t,
    page,
    y,
    "01 · Minimal — one row",
    "© + a few links + socials. For simple sites.\n© + + .",
    await fMinimal(t),
  );
  y = await fvariant(
    t,
    page,
    y,
    "02 · Mega columns — big sites",
    "Brand + 4 link columns + legal row. SaaS / marketing.\n + 4 + .",
    await fColumns(t),
  );
  y = await fvariant(
    t,
    page,
    y,
    "03 · Newsletter — capture emails",
    "Email signup beside nav. Blogs, launches.\n .",
    await fNewsletter(t),
  );
  y = await fvariant(
    t,
    page,
    y,
    "04 · Big CTA — portfolio close",
    "Large invite + buttons over aurora. Personal sites.\n + .",
    await fBigCta(t),
  );
  y = await fvariant(
    t,
    page,
    y,
    "05 · Social — centered",
    "Logo + big social row, centered. Link-in-bio vibe.\n + .",
    await fSocial(t),
  );
  y = await fvariant(
    t,
    page,
    y,
    "06 · Status bar — app / SaaS",
    "Thin: status dot + version + utility links.\n: + + .",
    await fStatusBar(t),
  );
  y = await fvariant(
    t,
    page,
    y,
    "07 · Glass — matches the header",
    "Frosted glass footer over content. Pairs with header 08.\n .",
    await fGlass(t),
  );
  y = await fvariant(
    t,
    page,
    y,
    "08 · Legal strip — compact bottom",
    "Links + language + © only. Sits under any layout.\n + + © — .",
    await fLegal(t),
  );
}
