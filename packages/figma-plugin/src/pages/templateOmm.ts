/**
 * Template (Omm) — DESIGN ONLY. Mockups of omm.okryshto.dev, the internal
 * dashboard (SSO via custom Keycloak): admin CRUD of PayloadCircleDto + the
 * access-request approve queue. Requirements card beside each screen.
 * No implementation — annotated design frames for review.
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
const NAV_W = 208;
const TOP_H = 60;
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

async function browserFrame(
  t: ThemeContext,
  url: string,
  name: string,
): Promise<{ shell: FrameNode; body: FrameNode }> {
  const shell = figma.createFrame();
  shell.name = `omm/${name}`;
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
  const sso = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
  sso.appendChild(icon(t, "shield", 13, "accent/primary"));
  sso.appendChild(await makeText(t, "caption", "SSO", "text/secondary"));
  chrome.appendChild(sso);
  shell.appendChild(chrome);
  chrome.x = 0;
  chrome.y = 0;
  const body = figma.createFrame();
  body.resize(FRAME_W, BODY_H);
  body.clipsContent = true;
  body.fills = [];
  shell.appendChild(body);
  body.x = 0;
  body.y = CHROME_H;
  return { shell, body };
}

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
    const dotWrap = autoFrame({ direction: "VERTICAL", gap: 0 });
    dotWrap.paddingTop = 6;
    const dot = ellipse(6);
    dot.fills = [aa("#5EE6C1", 0.9)];
    dot.strokes = [];
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

async function statusPill(t: ThemeContext, label: string, hex: string): Promise<FrameNode> {
  const p = autoFrame({
    direction: "HORIZONTAL",
    gap: 6,
    align: "CENTER",
    cross: "CENTER",
    padding: [2, 9],
  });
  p.cornerRadius = RADII.full;
  p.fills = [aa(hex, 0.16)];
  const d = ellipse(6);
  d.fills = [solid(hex)];
  d.strokes = [];
  p.appendChild(d);
  p.appendChild(await makeText(t, "caption", label, "text/primary"));
  return p;
}

async function pill(
  t: ThemeContext,
  label: string,
  kind: "primary" | "outline" | "ghost" | "danger",
  iconName?: string,
): Promise<FrameNode> {
  const b = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    align: "CENTER",
    cross: "CENTER",
    padding: [10, 18],
  });
  b.cornerRadius = RADII.lg;
  let tone = "text/primary";
  if (kind === "primary") {
    fillToken(t, b, "accent/primary");
    tone = "accent/contrast";
  } else if (kind === "danger") {
    fillToken(t, b, "feedback/danger");
    tone = "accent/contrast";
  } else if (kind === "outline") strokeToken(t, b, "border/strong", 1);
  if (iconName)
    b.appendChild(
      icon(
        t,
        iconName,
        15,
        kind === "primary" || kind === "danger" ? "accent/contrast" : "text/secondary",
      ),
    );
  b.appendChild(await makeText(t, "label/sm", label, tone));
  return b;
}

/** App shell: left nav + top bar, returns the main content frame (absolute-positioned inside). */
async function appShell(
  t: ThemeContext,
  body: FrameNode,
  title: string,
  active: string,
): Promise<FrameNode> {
  const nav = autoFrame({ direction: "VERTICAL", gap: 4, padding: [18, 14] });
  nav.resize(NAV_W, BODY_H);
  nav.primaryAxisSizingMode = "FIXED";
  nav.counterAxisSizingMode = "FIXED";
  fillToken(t, nav, "bg/surface");
  strokeToken(t, nav, "border/subtle", 1);
  nav.strokeTopWeight = 0;
  nav.strokeLeftWeight = 0;
  nav.strokeBottomWeight = 0;
  const brand = autoFrame({ direction: "HORIZONTAL", gap: 9, cross: "CENTER", padding: [4, 8] });
  const logo = ellipse(22);
  logo.fills = [solid("#5EE6C1")];
  logo.strokes = [];
  brand.appendChild(logo);
  brand.appendChild(await makeText(t, "heading/h4", "omm", "text/primary"));
  nav.appendChild(brand);
  const gap0 = rect(1, 12);
  gap0.fills = [];
  nav.appendChild(gap0);
  for (const [ic, name] of [
    ["grid", "Dashboard"],
    ["map-pin", "Points"],
    ["inbox", "Requests"],
    ["settings", "Settings"],
  ] as Array<[string, string]>) {
    const item = autoFrame({ direction: "HORIZONTAL", gap: 11, cross: "CENTER", padding: [9, 12] });
    item.layoutAlign = "STRETCH";
    item.primaryAxisSizingMode = "FIXED";
    item.cornerRadius = RADII.md;
    const on = name === active;
    if (on) item.fills = [aa("#5EE6C1", 0.12)];
    item.appendChild(icon(t, ic, 17, on ? "accent/primary" : "text/muted"));
    item.appendChild(await makeText(t, "label/md", name, on ? "accent/primary" : "text/secondary"));
    if (name === "Requests") {
      const badge = autoFrame({
        direction: "HORIZONTAL",
        align: "CENTER",
        cross: "CENTER",
        padding: [1, 7],
      });
      badge.cornerRadius = RADII.full;
      badge.fills = [solid("#FB7185")];
      badge.appendChild(await makeText(t, "caption", "3", "accent/contrast"));
      item.appendChild(spacer());
      (item.children[item.children.length - 1] as RectangleNode).layoutGrow = 1;
      item.appendChild(badge);
    }
    nav.appendChild(item);
  }
  const grow = rect(1, 1);
  grow.fills = [];
  nav.appendChild(grow);
  grow.layoutGrow = 1;
  const user = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [8, 8] });
  user.layoutAlign = "STRETCH";
  user.primaryAxisSizingMode = "FIXED";
  const av = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  av.resize(30, 30);
  av.primaryAxisSizingMode = "FIXED";
  av.counterAxisSizingMode = "FIXED";
  av.cornerRadius = RADII.full;
  av.fills = [solid("#818CF8")];
  av.appendChild(await makeText(t, "label/sm", "OK", "accent/contrast"));
  user.appendChild(av);
  const uc = autoFrame({ direction: "VERTICAL", gap: 0 });
  uc.appendChild(await makeText(t, "label/sm", "Oleksii K.", "text/primary"));
  uc.appendChild(await makeText(t, "caption", "admin", "text/muted"));
  user.appendChild(uc);
  uc.layoutGrow = 1;
  user.appendChild(icon(t, "log-out", 15, "text/muted"));
  nav.appendChild(user);
  body.appendChild(nav);
  nav.x = 0;
  nav.y = 0;

  const top = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER", padding: [0, 26] });
  top.resize(FRAME_W - NAV_W, TOP_H);
  top.primaryAxisSizingMode = "FIXED";
  top.counterAxisSizingMode = "FIXED";
  fillToken(t, top, "bg/canvas");
  strokeToken(t, top, "border/subtle", 1);
  top.strokeTopWeight = 0;
  top.strokeLeftWeight = 0;
  top.strokeRightWeight = 0;
  top.appendChild(await makeText(t, "heading/h4", title, "text/primary"));
  top.appendChild(spacer());
  (top.children[top.children.length - 1] as RectangleNode).layoutGrow = 1;
  const searchBox = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    cross: "CENTER",
    padding: [7, 12],
  });
  searchBox.cornerRadius = RADII.full;
  fillToken(t, searchBox, "bg/inset");
  searchBox.appendChild(icon(t, "search", 14, "text/muted"));
  searchBox.appendChild(await makeText(t, "caption", "Search…", "text/muted"));
  top.appendChild(searchBox);
  body.appendChild(top);
  top.x = NAV_W;
  top.y = 0;

  const main = figma.createFrame();
  main.name = "main";
  main.resize(FRAME_W - NAV_W, BODY_H - TOP_H);
  main.clipsContent = true;
  fillToken(t, main, "bg/canvas");
  body.appendChild(main);
  main.x = NAV_W;
  main.y = TOP_H;
  return main;
}

async function tile(
  t: ThemeContext,
  w: number,
  big: string,
  label: string,
  tone: string,
): Promise<FrameNode> {
  const c = autoFrame({ direction: "VERTICAL", gap: 6, padding: 20 });
  c.resize(w, c.height);
  c.counterAxisSizingMode = "FIXED";
  c.cornerRadius = RADII.lg;
  fillToken(t, c, "bg/surface");
  strokeToken(t, c, "border/subtle", 1);
  c.appendChild(await makeText(t, "display/lg", big, tone));
  c.appendChild(await makeText(t, "caption", label, "text/muted"));
  return c;
}

/** Simple table: header + rows of cells (SceneNodes). */
async function table(
  t: ThemeContext,
  w: number,
  cols: Array<[string, number]>,
  rows: SceneNode[][],
): Promise<FrameNode> {
  const wrap = autoFrame({ direction: "VERTICAL", gap: 0 });
  wrap.resize(w, wrap.height);
  wrap.counterAxisSizingMode = "FIXED";
  wrap.cornerRadius = RADII.lg;
  wrap.clipsContent = true;
  fillToken(t, wrap, "bg/surface");
  strokeToken(t, wrap, "border/subtle", 1);
  const head = autoFrame({ direction: "HORIZONTAL", gap: 16, cross: "CENTER", padding: [12, 18] });
  head.layoutAlign = "STRETCH";
  head.primaryAxisSizingMode = "FIXED";
  fillToken(t, head, "bg/surface-raised");
  for (const [label, cw] of cols) {
    const c = autoFrame({ direction: "VERTICAL", gap: 0 });
    c.resize(cw, c.height);
    c.counterAxisSizingMode = "FIXED";
    c.appendChild(await makeText(t, "label/sm", label, "text/secondary"));
    head.appendChild(c);
  }
  wrap.appendChild(head);
  for (const r of rows) {
    const line = rect(w, 1);
    fillToken(t, line, "border/subtle");
    wrap.appendChild(line);
    const row = autoFrame({ direction: "HORIZONTAL", gap: 16, cross: "CENTER", padding: [12, 18] });
    row.layoutAlign = "STRETCH";
    row.primaryAxisSizingMode = "FIXED";
    for (let i = 0; i < r.length; i++) {
      const c = autoFrame({ direction: "HORIZONTAL", gap: 0, cross: "CENTER" });
      c.resize(cols[i][1], c.height);
      c.counterAxisSizingMode = "FIXED";
      c.appendChild(r[i]);
      row.appendChild(c);
    }
    wrap.appendChild(row);
  }
  return wrap;
}

// ── Screens ───────────────────────────────────────────────────

async function screenLogin(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserFrame(t, "omm.okryshto.dev", "01-sso-login");
  fillToken(t, body, "bg/canvas");
  const card = autoFrame({
    direction: "VERTICAL",
    gap: 18,
    align: "CENTER",
    cross: "CENTER",
    padding: 44,
  });
  card.resize(460, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/default", 1);
  await applyEffect(card, "shadow/lg", t);
  const logo = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  logo.resize(56, 56);
  logo.primaryAxisSizingMode = "FIXED";
  logo.counterAxisSizingMode = "FIXED";
  logo.cornerRadius = RADII.lg;
  logo.fills = [aa("#5EE6C1", 0.15)];
  logo.appendChild(icon(t, "shield", 28, "accent/primary"));
  card.appendChild(logo);
  card.appendChild(
    await makeText(t, "heading/h2", "Sign in to omm", "text/primary", { align: "CENTER" }),
  );
  card.appendChild(
    await makeText(
      t,
      "body/sm",
      "Internal dashboard — staff only. Access is via single sign-on.",
      "text/muted",
      { align: "CENTER", maxWidth: 340 },
    ),
  );
  const btn = autoFrame({
    direction: "HORIZONTAL",
    gap: 10,
    align: "CENTER",
    cross: "CENTER",
    padding: [13, 24],
  });
  btn.resize(360, btn.height);
  btn.primaryAxisSizingMode = "FIXED";
  btn.counterAxisSizingMode = "AUTO";
  btn.cornerRadius = RADII.full;
  fillToken(t, btn, "accent/primary");
  await applyEffect(btn, "glow/button", t);
  btn.appendChild(icon(t, "key", 16, "accent/contrast"));
  btn.appendChild(await makeText(t, "label/md", "Continue with Keycloak", "accent/contrast"));
  card.appendChild(btn);
  card.appendChild(
    await makeText(
      t,
      "caption",
      "OIDC · custom Keycloak realm · you'll be redirected",
      "text/muted",
      { align: "CENTER" },
    ),
  );
  body.appendChild(card);
  card.x = (FRAME_W - 460) / 2;
  card.y = Math.round((BODY_H - card.height) / 2);
  return shell;
}

async function screenDashboard(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserFrame(t, "omm.okryshto.dev/dashboard", "02-dashboard");
  const main = await appShell(t, body, "Dashboard", "Dashboard");
  const pad = autoFrame({ direction: "VERTICAL", gap: 18, padding: 26 });
  pad.resize(FRAME_W - NAV_W, pad.height);
  pad.counterAxisSizingMode = "FIXED";
  pad.fills = [];
  const tiles = autoFrame({ direction: "HORIZONTAL", gap: 16 });
  const tw = (FRAME_W - NAV_W - 52 - 32) / 3;
  tiles.appendChild(await tile(t, tw, "4", "Active points", "accent/primary"));
  tiles.appendChild(await tile(t, tw, "3", "Pending requests", "feedback/warning"));
  tiles.appendChild(await tile(t, tw, "27", "Approved · all time", "text/primary"));
  pad.appendChild(tiles);
  const recent = autoFrame({ direction: "VERTICAL", gap: 12, padding: 20 });
  recent.layoutAlign = "STRETCH";
  recent.primaryAxisSizingMode = "FIXED";
  recent.cornerRadius = RADII.lg;
  fillToken(t, recent, "bg/surface");
  strokeToken(t, recent, "border/subtle", 1);
  const rh = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
  rh.layoutAlign = "STRETCH";
  rh.primaryAxisSizingMode = "FIXED";
  rh.appendChild(await makeText(t, "label/md", "Recent access requests", "text/primary"));
  rh.appendChild(spacer());
  (rh.children[1] as RectangleNode).layoutGrow = 1;
  rh.appendChild(await makeText(t, "caption", "View all →", "accent/primary"));
  recent.appendChild(rh);
  for (const [name, who, when, st] of [
    ["Anna Weber", "Founder · Nordlicht Studio", "2m ago", "pending"],
    ["Marc Ellis", "Recruiter · Basalt", "1h ago", "pending"],
    ["Dana Ko", "Eng lead · Lumen", "yesterday", "approved"],
  ] as Array<[string, string, string, string]>) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [8, 0] });
    row.layoutAlign = "STRETCH";
    row.primaryAxisSizingMode = "FIXED";
    const av = ellipse(28);
    av.fills = [solid(st === "approved" ? "#5EE6C1" : "#818CF8")];
    av.strokes = [];
    row.appendChild(av);
    const col = autoFrame({ direction: "VERTICAL", gap: 1 });
    col.appendChild(await makeText(t, "label/sm", name, "text/primary"));
    col.appendChild(await makeText(t, "caption", who, "text/muted"));
    row.appendChild(col);
    col.layoutGrow = 1;
    row.appendChild(await makeText(t, "caption", when, "text/muted"));
    row.appendChild(
      await statusPill(
        t,
        st === "approved" ? "Approved" : "Pending",
        st === "approved" ? "#4ADE80" : "#FBBF24",
      ),
    );
    recent.appendChild(row);
  }
  pad.appendChild(recent);
  main.appendChild(pad);
  pad.x = 0;
  pad.y = 0;
  return shell;
}

async function screenPoints(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserFrame(t, "omm.okryshto.dev/points", "03-points-crud");
  const main = await appShell(t, body, "Points", "Points");
  const pad = autoFrame({ direction: "VERTICAL", gap: 16, padding: 26 });
  pad.resize(FRAME_W - NAV_W, pad.height);
  pad.counterAxisSizingMode = "FIXED";
  pad.fills = [];
  const bar = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
  bar.layoutAlign = "STRETCH";
  bar.primaryAxisSizingMode = "FIXED";
  bar.appendChild(
    await makeText(
      t,
      "body/sm",
      "PayloadCircleDto — where & when a payload is reachable.",
      "text/muted",
    ),
  );
  bar.appendChild(spacer());
  (bar.children[1] as RectangleNode).layoutGrow = 1;
  bar.appendChild(await pill(t, "New point", "primary", "plus"));
  pad.appendChild(bar);
  const w = FRAME_W - NAV_W - 52;
  const cell = async (s: string, tone = "text/primary") => await makeText(t, "body/sm", s, tone);
  const mono = async (s: string) => await makeText(t, "mono/sm", s, "text/secondary");
  const rows: SceneNode[][] = [
    [
      await cell("Berlin Mitte"),
      await mono("52.520, 13.405"),
      await cell("120 m"),
      await cell("Aug 1 – Aug 20"),
      await statusPill(t, "active", "#4ADE80"),
    ],
    [
      await cell("Frankfurt HB"),
      await mono("50.107, 8.664"),
      await cell("80 m"),
      await cell("Aug 5 – Aug 12"),
      await statusPill(t, "draft", "#818CF8"),
    ],
    [
      await cell("München Ost"),
      await mono("48.127, 11.600"),
      await cell("150 m"),
      await cell("Jul 1 – Jul 15"),
      await statusPill(t, "expired", "#FB7185"),
    ],
    [
      await cell("Kyiv Center"),
      await mono("50.450, 30.523"),
      await cell("100 m"),
      await cell("Sep 1 – Sep 30"),
      await statusPill(t, "draft", "#818CF8"),
    ],
  ];
  pad.appendChild(
    await table(
      t,
      w,
      [
        ["Name", 200],
        ["Center (lat/lng)", 190],
        ["Radius", 90],
        ["Window", 200],
        ["Status", 120],
      ],
      rows,
    ),
  );
  main.appendChild(pad);
  pad.x = 0;
  pad.y = 0;
  return shell;
}

async function screenRequests(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserFrame(t, "omm.okryshto.dev/requests", "04-requests-approve");
  const main = await appShell(t, body, "Requests", "Requests");
  const pad = autoFrame({ direction: "VERTICAL", gap: 16, padding: 26 });
  pad.resize(FRAME_W - NAV_W, pad.height);
  pad.counterAxisSizingMode = "FIXED";
  pad.fills = [];
  pad.appendChild(
    await makeText(
      t,
      "body/sm",
      "Self-intro requests waiting for a decision. Approve → single-use / 24h link is emailed.",
      "text/muted",
      { maxWidth: 640 },
    ),
  );
  const w = FRAME_W - NAV_W - 52;
  // Expanded request card (the "intro")
  const card = autoFrame({ direction: "VERTICAL", gap: 14, padding: 20 });
  card.resize(w, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.lg;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/default", 1);
  const ch = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  ch.layoutAlign = "STRETCH";
  ch.primaryAxisSizingMode = "FIXED";
  const av = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  av.resize(40, 40);
  av.primaryAxisSizingMode = "FIXED";
  av.counterAxisSizingMode = "FIXED";
  av.cornerRadius = RADII.full;
  av.fills = [solid("#818CF8")];
  av.appendChild(await makeText(t, "label/md", "AW", "accent/contrast"));
  ch.appendChild(av);
  const cc = autoFrame({ direction: "VERTICAL", gap: 1 });
  cc.appendChild(await makeText(t, "heading/h4", "Anna Weber", "text/primary"));
  cc.appendChild(
    await makeText(t, "caption", "anna@studio.de · Berlin Mitte point · 2m ago", "text/muted"),
  );
  ch.appendChild(cc);
  cc.layoutGrow = 1;
  ch.appendChild(await statusPill(t, "pending", "#FBBF24"));
  card.appendChild(ch);
  const intro = autoFrame({ direction: "VERTICAL", gap: 8, padding: 14 });
  intro.layoutAlign = "STRETCH";
  intro.primaryAxisSizingMode = "FIXED";
  intro.cornerRadius = RADII.md;
  fillToken(t, intro, "bg/inset");
  const q1 = autoFrame({ direction: "VERTICAL", gap: 2 });
  q1.appendChild(await makeText(t, "caption", "WHO ARE YOU?", "text/muted"));
  q1.appendChild(
    await makeText(
      t,
      "body/sm",
      "Founder at Nordlicht Studio, met you at Bits&Pretzels.",
      "text/primary",
      { maxWidth: w - 68 },
    ),
  );
  intro.appendChild(q1);
  const q2 = autoFrame({ direction: "VERTICAL", gap: 2 });
  q2.appendChild(await makeText(t, "caption", "WHY THE PAYLOAD?", "text/muted"));
  q2.appendChild(
    await makeText(
      t,
      "body/sm",
      "Considering you for a design-systems role; want the full portfolio.",
      "text/primary",
      { maxWidth: w - 68 },
    ),
  );
  intro.appendChild(q2);
  card.appendChild(intro);
  const actions = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  actions.layoutAlign = "STRETCH";
  actions.primaryAxisSizingMode = "FIXED";
  actions.appendChild(
    await makeText(
      t,
      "caption",
      "On approve: presigned link (single-use · 24h) emailed to anna@studio.de",
      "text/muted",
      { maxWidth: 460 },
    ),
  );
  actions.appendChild(spacer());
  (actions.children[1] as RectangleNode).layoutGrow = 1;
  actions.appendChild(await pill(t, "Decline", "outline", "x"));
  actions.appendChild(await pill(t, "Approve & send", "primary", "check"));
  card.appendChild(actions);
  pad.appendChild(card);
  // collapsed queue rows
  for (const [, name, meta] of [
    ["ME", "Marc Ellis", "Recruiter · Basalt · Frankfurt HB · 1h ago"],
    ["DK", "Dana Ko", "Eng lead · Lumen · Berlin Mitte · yesterday"],
  ] as Array<[string, string, string]>) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [12, 18] });
    row.resize(w, row.height);
    row.primaryAxisSizingMode = "FIXED";
    row.counterAxisSizingMode = "AUTO";
    row.cornerRadius = RADII.lg;
    fillToken(t, row, "bg/surface");
    strokeToken(t, row, "border/subtle", 1);
    const a2 = ellipse(30);
    a2.fills = [solid("#818CF8")];
    a2.strokes = [];
    row.appendChild(a2);
    const c2 = autoFrame({ direction: "VERTICAL", gap: 1 });
    c2.appendChild(await makeText(t, "label/sm", name, "text/primary"));
    c2.appendChild(await makeText(t, "caption", meta, "text/muted"));
    row.appendChild(c2);
    c2.layoutGrow = 1;
    row.appendChild(icon(t, "chevron-down", 16, "text/muted"));
    pad.appendChild(row);
  }
  main.appendChild(pad);
  pad.x = 0;
  pad.y = 0;
  return shell;
}

export async function paintTemplateOmm(t: ThemeContext, page: PageNode): Promise<void> {
  const label = await makeText(
    t,
    "overline",
    "13 · Template (Omm) — DESIGN ONLY · internal dashboard, SSO · omm.okryshto.dev",
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
      node: await screenLogin(t),
      cap: "01 · SSO login — custom Keycloak",
      req: await reqCard(t, "Sign-in (SSO)", "Staff-only internal tool.", [
        ["Custom Keycloak (own realm/deployment)", "Keycloak ( realm)"],
        ["Standard OIDC, no token hacks", "OIDC,"],
        ["BFF: refresh-token in httpOnly cookie", "BFF: refresh- httpOnly-cookie"],
        ["Roles: admin / viewer / operator", ": admin / viewer / operator"],
        ["Secrets (client-id/secret) via Vault", "(client-id/secret) Vault"],
      ]),
    },
    {
      node: await screenDashboard(t),
      cap: "02 · Dashboard — overview",
      req: await reqCard(t, "Dashboard", "At-a-glance state of the system.", [
        ["Counts: active points, pending, approved", ""],
        ["Recent requests feed → queue", ""],
        ["Admin part of orbit lives HERE (not orbit)", "orbit — ( orbit)"],
        ["i18n en / de / ru", "i18n en / de / ru"],
      ]),
    },
    {
      node: await screenPoints(t),
      cap: "03 · Points — CRUD PayloadCircleDto",
      req: await reqCard(t, "Points (CRUD)", "Admin creates the map circles.", [
        ["Fields: center, radius, window, status", ""],
        ["PostGIS radius query (user-in-circle)", "PostGIS- ( )"],
        ["Payload upload → Hetzner S3 (Vault keys)", "Upload payload → Hetzner S3 (keys in Vault)"],
        ["Status drives public visibility", ""],
        ["One backend + DB shared with orbit", "+ , orbit"],
      ]),
    },
    {
      node: await screenRequests(t),
      cap: "04 · Requests — review the intro & approve",
      req: await reqCard(t, "Approve queue", "The self-intro is what you judge.", [
        ["Shows name, email, who, why", ", email, ,"],
        ["Manual approve/decline (MVP)", "approve/decline (MVP)"],
        ["Approve → presigned single-use/24h link", "Approve → presigned /24"],
        ["Link emailed to requester", "email"],
        ["GDPR: delete request data on demand", "GDPR:"],
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
