/**
 * template_vizitka — a scroll-snap one-pager: six full-viewport sections,
 * one focal message per screen. Laid out as a vertical film-strip so the
 * scroll story reads top-to-bottom, with fullpage-style dot navigation.
 *
 * Dev note: html { scroll-snap-type: y mandatory }, section { height: 100vh;
 * scroll-snap-align: start }.
 */

import { RADII, SITE } from "../tokens";
import { linearGradient, solid } from "../core/color";
import { autoFrame } from "../core/layout";
import { auroraBlob, ellipse, fillToken, makeText, rect, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { icon } from "../core/icons";
import { applyEffect } from "../components/primitives";
import { HERO_PHOTO_B64 } from "../assets/heroPhoto";

const VW = 1440;
const VH = 900;
const MX = 120; // content margin

const SECTIONS = ["Hero", "About", "Work", "Links", "Proof", "Contact"];

function alpha(hex: string, a: number): SolidPaint {
  return { ...solid(hex), opacity: a } as SolidPaint;
}

function shell(t: ThemeContext, name: string): FrameNode {
  const s = figma.createFrame();
  s.name = `vizitka/${name}`;
  s.resize(VW, VH);
  s.clipsContent = true;
  fillToken(t, s, "bg/canvas");
  strokeToken(t, s, "border/subtle", 1);
  return s;
}

/** Soft cosmic backdrop — a couple of blobs + dust, appended first (z-below). */
const FIREWORK_HUES = ["#5EE6C1", "#FF3D8B", "#818CF8", "#FFFFFF"];

/** One tiny tadpole-shaped spark: glowing head + thin fading tail, aimed outward. */
function fireworkSpark(hex: string, len: number, angle: number): FrameNode {
  const f = figma.createFrame();
  f.name = "firework/spark";
  f.resize(len, 4);
  f.fills = [];
  f.clipsContent = false;
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
  tail.y = 1.5;
  f.appendChild(tail);
  const head = ellipse(2.6);
  head.fills = [solid(hex)];
  const c = solid(hex).color;
  head.effects = [
    {
      type: "DROP_SHADOW",
      color: { ...c, a: 0.75 },
      offset: { x: 0, y: 0 },
      radius: 5,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    } as DropShadowEffect,
  ];
  head.x = len - 1.3;
  head.y = 0.7;
  f.appendChild(head);
  f.rotation = angle;
  return f;
}

/** A micro firework — 12 sparks bursting from one point, jittered so it reads organic, not mechanical. */
function microFirework(s: FrameNode, cx: number, cy: number): void {
  const n = 12;
  for (let i = 0; i < n; i++) {
    const angle = (360 / n) * i + (Math.random() * 16 - 8);
    const len = 9 + Math.random() * 15;
    const spark = fireworkSpark(FIREWORK_HUES[i % FIREWORK_HUES.length], len, angle);
    s.appendChild(spark);
    spark.x = cx;
    spark.y = cy;
  }
}

function atmosphere(
  s: FrameNode,
  blobs: Array<{ hex: string; size: number; x: number; y: number; op: number }>,
): void {
  for (const b of blobs) {
    const blob = auroraBlob(b.size, b.hex);
    blob.opacity = b.op;
    s.appendChild(blob);
    blob.x = b.x - b.size / 2;
    blob.y = b.y - b.size / 2;
  }
  for (let i = 0; i < 26; i++) {
    const d = ellipse(1.5 + Math.random() * 2.2);
    d.fills = [alpha(Math.random() > 0.5 ? "#FFFFFF" : "#5EE6C1", 0.08 + Math.random() * 0.35)];
    d.strokes = [];
    s.appendChild(d);
    d.x = Math.random() * VW;
    d.y = Math.random() * VH;
  }
  // Occasional micro firework — a rare festive flourish, not on every section.
  if (Math.random() < 0.5) {
    microFirework(s, 140 + Math.random() * (VW - 280), 90 + Math.random() * (VH - 260));
  }
}

/** Fullpage-style dot rail, active index highlighted as a mint pill. */
function dotRail(t: ThemeContext, active: number): FrameNode {
  const col = autoFrame({ direction: "VERTICAL", gap: 10, cross: "CENTER", name: "snap-dots" });
  for (let i = 0; i < SECTIONS.length; i++) {
    if (i === active) {
      const pill = rect(8, 26, 4);
      fillToken(t, pill, "accent/primary");
      pill.effects = [
        {
          type: "DROP_SHADOW",
          color: { ...solid("#5EE6C1").color, a: 0.55 },
          offset: { x: 0, y: 0 },
          radius: 8,
          spread: 0,
          visible: true,
          blendMode: "NORMAL",
        } as DropShadowEffect,
      ];
      col.appendChild(pill);
    } else {
      const d = ellipse(8);
      d.fills = [alpha("#FFFFFF", 0.22)];
      d.strokes = [];
      col.appendChild(d);
    }
  }
  return col;
}

async function kicker(t: ThemeContext, idx: number, title: string): Promise<TextNode> {
  return makeText(t, "overline", `0${idx + 1} — ${title} · vizitka`, "accent/primary");
}

/** Section chrome shared by every screen: kicker top-left + dots right. */
async function chrome(t: ThemeContext, s: FrameNode, idx: number): Promise<void> {
  const k = await kicker(t, idx, SECTIONS[idx]);
  s.appendChild(k);
  k.x = MX;
  k.y = 84;
  const rail = dotRail(t, idx);
  s.appendChild(rail);
  rail.x = VW - 56;
  rail.y = Math.round((VH - rail.height) / 2);
}

async function ctaPill(
  t: ThemeContext,
  label: string,
  kind: "primary" | "ghost",
  tone = "accent/primary",
  shape: "pill" | "rounded" = "pill",
): Promise<FrameNode> {
  const b = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    align: "CENTER",
    cross: "CENTER",
    padding: [13, 24],
  });
  b.cornerRadius = shape === "pill" ? RADII.full : RADII.lg;
  if (kind === "primary") {
    fillToken(t, b, tone);
    b.appendChild(await makeText(t, "label/md", label, "accent/contrast"));
    b.appendChild(icon(t, "arrow-right", 16, "accent/contrast"));
    await applyEffect(b, "glow/button", t);
  } else {
    strokeToken(t, b, "border/strong", 1);
    b.appendChild(await makeText(t, "label/md", label, "text/primary"));
  }
  return b;
}

async function glassChip(t: ThemeContext, label: string, dotToken?: string): Promise<FrameNode> {
  const c = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [6, 12] });
  c.cornerRadius = RADII.full;
  fillToken(t, c, "glass/fill");
  strokeToken(t, c, "glass/border", 1);
  if (dotToken) {
    const d = ellipse(7);
    fillToken(t, d, dotToken);
    d.strokes = [];
    c.appendChild(d);
  }
  c.appendChild(await makeText(t, "label/sm", label, "text/secondary"));
  return c;
}

/** Dashed drop-your-photo spot, 3:4. */
async function photoSpot(t: ThemeContext, w: number, h: number): Promise<FrameNode> {
  const f = autoFrame({
    direction: "VERTICAL",
    gap: 10,
    align: "CENTER",
    cross: "CENTER",
    name: "photo-spot",
  });
  f.resize(w, h);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.cornerRadius = RADII["2xl"];
  fillToken(t, f, "bg/surface");
  strokeToken(t, f, "border/strong", 1.5);
  f.dashPattern = [8, 8];
  const head = ellipse(56);
  head.fills = [alpha("#FFFFFF", 0.14)];
  head.strokes = [];
  const body = rect(110, 64, 32);
  body.fills = [alpha("#FFFFFF", 0.1)];
  f.appendChild(head);
  f.appendChild(body);
  f.appendChild(await makeText(t, "label/sm", "Drop your photo", "text/secondary"));
  f.appendChild(await makeText(t, "caption", "3:4 · noir or cutout", "text/muted"));
  return f;
}

/**
 * The real hero photo — noir grade + dissolve into the page darkness by
 * default; on hover it wakes up: full color, straightens to 0°, scales up
 * a touch and gets a soft accent glow. Dev note: transition ~320ms ease-out
 * on filter/transform/box-shadow.
 */
async function noirPhoto(
  t: ThemeContext,
  w: number,
  h: number,
  opts: { hovered?: boolean; caption?: boolean } = {},
): Promise<FrameNode> {
  const hovered = opts.hovered ?? false;
  try {
    const img = figma.createImage(figma.base64Decode(HERO_PHOTO_B64));
    const f = figma.createFrame();
    f.name = hovered ? "photo/noir-paris-hover" : "photo/noir-paris";
    f.resize(w, h);
    f.cornerRadius = RADII["2xl"];
    f.clipsContent = true;
    f.fills = [
      {
        type: "IMAGE",
        scaleMode: "FILL",
        imageHash: img.hash,
        filters: hovered
          ? {
              exposure: 0.02,
              contrast: 0.04,
              saturation: 0.1,
              temperature: 0,
              tint: 0,
              highlights: 0,
              shadows: 0,
            }
          : // Noir (idle): fully desaturated, punchier contrast, crushed shadows.
            {
              exposure: -0.04,
              contrast: 0.2,
              saturation: -1,
              temperature: 0,
              tint: 0,
              highlights: -0.08,
              shadows: -0.28,
            },
      } as ImagePaint,
    ];
    if (hovered) {
      strokeToken(t, f, "accent/primary", 1.5);
      f.effects = [
        {
          type: "DROP_SHADOW",
          color: { ...solid("#5EE6C1").color, a: 0.42 },
          offset: { x: 0, y: 0 },
          radius: 32,
          spread: 0,
          visible: true,
          blendMode: "NORMAL",
        } as DropShadowEffect,
      ];
    } else {
      strokeToken(t, f, "border/subtle", 1);
      // Dissolve the figure into the canvas darkness (bottom → black) — idle only.
      const fade = rect(w, h);
      fade.fills = [
        linearGradient(
          [
            { hex: "#0A0A0B00", position: 0.38 },
            { hex: "#0A0A0B", position: 1 },
          ],
          "vertical",
        ),
      ];
      f.appendChild(fade);
      fade.x = 0;
      fade.y = 0;
      // Soft top rim so the card melts into the section, not floats on it.
      const rim = rect(w, h);
      rim.fills = [
        linearGradient(
          [
            { hex: "#0A0A0B8C", position: 0 },
            { hex: "#0A0A0B00", position: 0.2 },
          ],
          "vertical",
        ),
      ];
      f.appendChild(rim);
      rim.x = 0;
      rim.y = 0;
    }
    // Caption only on the large hero; too long for small demo thumbnails.
    if (opts.caption !== false) {
      const cap = await makeText(
        t,
        "caption",
        "Paris · Champ-de-Mars · noir",
        hovered ? "text/secondary" : "text/muted",
        { maxWidth: w - 36 },
      );
      f.appendChild(cap);
      cap.x = 18;
      cap.y = h - 30;
    }
    return f;
  } catch {
    // Image decode unavailable → keep the dashed drop-spot.
    return photoSpot(t, w, h);
  }
}

async function scrollHint(t: ThemeContext): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 6, cross: "CENTER" });
  col.appendChild(icon(t, "mouse", 20, "text/muted"));
  col.appendChild(await makeText(t, "caption", "scroll", "text/muted"));
  col.appendChild(icon(t, "chevron-down", 14, "text/muted"));
  return col;
}

// ── 01 · Hero ─────────────────────────────────────────────────

async function heroSection(t: ThemeContext): Promise<FrameNode> {
  const s = shell(t, "01-hero");
  atmosphere(s, [
    { hex: "#5EE6C1", size: 900, x: VW - 220, y: 140, op: 0.2 },
    { hex: "#FF3D8B", size: 640, x: VW - 420, y: VH - 80, op: 0.12 },
    { hex: "#818CF8", size: 520, x: 160, y: VH - 60, op: 0.1 },
  ]);
  const col = autoFrame({ direction: "VERTICAL", gap: 22 });
  col.appendChild(await glassChip(t, SITE.availability, "accent/primary"));
  const [firstName, ...restName] = SITE.name.split(" ");
  const name = autoFrame({ direction: "VERTICAL", gap: 4 });
  name.appendChild(await makeText(t, "display/xl", firstName, "text/primary"));
  name.appendChild(await makeText(t, "display/xl", restName.join(" "), "text/primary"));
  col.appendChild(name);
  col.appendChild(await makeText(t, "heading/h3", SITE.role, "text/secondary", { maxWidth: 640 }));
  col.appendChild(await makeText(t, "body/lg", SITE.hero.lead, "text/muted", { maxWidth: 560 }));
  const ctas = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  ctas.paddingTop = 10;
  ctas.appendChild(await ctaPill(t, SITE.hero.primaryCta, "primary"));
  ctas.appendChild(await ctaPill(t, SITE.hero.secondaryCta, "ghost"));
  col.appendChild(ctas);
  s.appendChild(col);
  col.x = MX;
  col.y = Math.round((VH - col.height) / 2) + 10;

  const photo = await noirPhoto(t, 320, 420);
  s.appendChild(photo);
  photo.x = VW - MX - 320;
  photo.y = Math.round((VH - 420) / 2);
  photo.rotation = -3; // idle tilt — hover state straightens this to 0°, see photoHoverDemo

  const hint = await scrollHint(t);
  s.appendChild(hint);
  hint.x = Math.round((VW - hint.width) / 2);
  hint.y = VH - 96;

  await chrome(t, s, 0);
  return s;
}

// ── 02 · About ────────────────────────────────────────────────

async function aboutSection(t: ThemeContext): Promise<FrameNode> {
  const s = shell(t, "02-about");
  atmosphere(s, [
    { hex: "#5EE6C1", size: 760, x: 180, y: 160, op: 0.14 },
    { hex: "#FFFFFF", size: 520, x: VW - 320, y: VH - 180, op: 0.06 },
  ]);
  const col = autoFrame({ direction: "VERTICAL", gap: 26 });
  col.appendChild(
    await makeText(t, "display/lg", SITE.intro.headline, "text/primary", { maxWidth: 980 }),
  );
  col.appendChild(
    await makeText(t, "body/lg", SITE.intro.whoAmI.text, "text/secondary", { maxWidth: 760 }),
  );
  const chips = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  chips.paddingTop = 6;
  for (const c of SITE.intro.tech.favorites.languages.slice(0, 5))
    chips.appendChild(await glassChip(t, c));
  col.appendChild(chips);
  s.appendChild(col);
  col.x = MX;
  col.y = Math.round((VH - col.height) / 2);
  await chrome(t, s, 1);
  return s;
}

// ── 03 · Selected work ────────────────────────────────────────

async function projectCard(
  t: ThemeContext,
  o: { hex1: string; hex2: string; tags: string[]; title: string; desc: string },
): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 0, clip: true, name: `project/${o.title}` });
  card.resize(376, 424);
  card.primaryAxisSizingMode = "FIXED";
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII["2xl"];
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  const cover = figma.createFrame();
  cover.resize(376, 210);
  cover.fills = [
    linearGradient(
      [
        { hex: o.hex1, position: 0 },
        { hex: o.hex2, position: 1 },
      ],
      "diagonal",
    ),
  ];
  cover.clipsContent = true;
  const glow = auroraBlob(300, "#FFFFFF");
  glow.opacity = 0.16;
  cover.appendChild(glow);
  glow.x = 200;
  glow.y = -120;
  const arrow = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  arrow.resize(38, 38);
  arrow.primaryAxisSizingMode = "FIXED";
  arrow.counterAxisSizingMode = "FIXED";
  arrow.cornerRadius = RADII.full;
  arrow.fills = [alpha("#0A0A0B", 0.4)];
  arrow.appendChild(icon(t, "arrow-up-right", 18, "text/primary"));
  cover.appendChild(arrow);
  arrow.x = 376 - 38 - 16;
  arrow.y = 16;
  card.appendChild(cover);
  const body = autoFrame({ direction: "VERTICAL", gap: 10, padding: 22 });
  body.layoutAlign = "STRETCH";
  const tags = autoFrame({ direction: "HORIZONTAL", gap: 8 });
  for (const tg of o.tags) {
    const chip = autoFrame({
      direction: "HORIZONTAL",
      align: "CENTER",
      cross: "CENTER",
      padding: [3, 10],
    });
    chip.cornerRadius = RADII.full;
    fillToken(t, chip, "glass/fill");
    strokeToken(t, chip, "glass/border", 1);
    chip.appendChild(await makeText(t, "caption", tg, "text/secondary"));
    tags.appendChild(chip);
  }
  body.appendChild(tags);
  body.appendChild(await makeText(t, "heading/h3", o.title, "text/primary"));
  body.appendChild(await makeText(t, "body/sm", o.desc, "text/secondary", { maxWidth: 330 }));
  // Opens the left "More info" drawer (see the 03b state frame).
  const more = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
  more.paddingTop = 4;
  more.appendChild(await makeText(t, "label/sm", "More info", "accent/primary"));
  more.appendChild(icon(t, "chevron-right", 14, "accent/primary"));
  body.appendChild(more);
  card.appendChild(body);
  return card;
}

async function workSection(t: ThemeContext): Promise<FrameNode> {
  const s = shell(t, "03-work");
  atmosphere(s, [
    { hex: "#818CF8", size: 720, x: VW - 200, y: 120, op: 0.12 },
    { hex: "#FF3D8B", size: 560, x: 120, y: VH - 100, op: 0.1 },
  ]);
  const head = autoFrame({ direction: "VERTICAL", gap: 10 });
  head.appendChild(await makeText(t, "heading/h1", "Things I shipped.", "text/primary"));
  head.appendChild(
    await makeText(
      t,
      "body/lg",
      "Three doors into the work — the rest lives behind them.",
      "text/muted",
      { maxWidth: 620 },
    ),
  );
  s.appendChild(head);
  head.x = MX;
  head.y = 170;
  const row = autoFrame({ direction: "HORIZONTAL", gap: 36 });
  row.appendChild(
    await projectCard(t, {
      hex1: "#0E4B3C",
      hex2: "#5EE6C1",
      tags: ["React", "Payments"],
      title: "Swiss Sports SaaS",
      desc: "Registration platform for 500K+ participants — dynamic forms, SEPA/PayPal, embeddable widget.",
    }),
  );
  row.appendChild(
    await projectCard(t, {
      hex1: "#4A1030",
      hex2: "#FF3D8B",
      tags: ["Next.js", "React Query"],
      title: "AI Coach",
      desc: "Mobile-first PWA: streaming AI chat and training plans against a stateless Python API.",
    }),
  );
  row.appendChild(
    await projectCard(t, {
      hex1: "#1D2150",
      hex2: "#818CF8",
      tags: ["React", "Virtualization"],
      title: "Mint Platform",
      desc: "Media-planning SaaS with a virtualized reference grid and drag-and-drop workflows.",
    }),
  );
  s.appendChild(row);
  row.x = MX;
  row.y = 320;
  await chrome(t, s, 2);
  return s;
}

// ── 03b · Work — "More info" drawer open (state) ──────────────

async function drawerKv(t: ThemeContext, k: string, v: string): Promise<FrameNode> {
  const r = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  r.layoutAlign = "STRETCH";
  r.primaryAxisSizingMode = "FIXED";
  const kc = autoFrame({ direction: "VERTICAL", gap: 0 });
  kc.resize(120, kc.height);
  kc.counterAxisSizingMode = "FIXED";
  kc.appendChild(await makeText(t, "caption", k, "text/muted"));
  r.appendChild(kc);
  r.appendChild(await makeText(t, "body/sm", v, "text/primary"));
  return r;
}

async function workDrawerState(t: ThemeContext): Promise<FrameNode> {
  const s = await workSection(t);
  s.name = "vizitka/03b-work-drawer-open";

  const scrim = rect(VW, VH);
  scrim.fills = [alpha("#05060A", 0.6)];
  s.appendChild(scrim);
  scrim.x = 0;
  scrim.y = 0;

  const d = autoFrame({ direction: "VERTICAL", gap: 0, name: "drawer/more-info" });
  d.resize(460, VH);
  d.primaryAxisSizingMode = "FIXED";
  d.counterAxisSizingMode = "FIXED";
  fillToken(t, d, "bg/surface");
  strokeToken(t, d, "border/subtle", 1);
  await applyEffect(d, "shadow/lg", t);

  const head = autoFrame({ direction: "HORIZONTAL", cross: "MIN", padding: [24, 28] });
  head.layoutAlign = "STRETCH";
  head.primaryAxisSizingMode = "FIXED";
  const hcol = autoFrame({ direction: "VERTICAL", gap: 6 });
  hcol.appendChild(await makeText(t, "overline", "More info", "accent/primary"));
  hcol.appendChild(await makeText(t, "heading/h3", "Parametric EQ", "text/primary"));
  head.appendChild(hcol);
  hcol.layoutGrow = 1;
  head.appendChild(icon(t, "x", 18, "text/muted"));
  d.appendChild(head);

  const coverWrap = autoFrame({ direction: "VERTICAL", gap: 10, padding: [0, 28] });
  coverWrap.layoutAlign = "STRETCH";
  const cover = figma.createFrame();
  cover.resize(404, 150);
  cover.cornerRadius = RADII.lg;
  cover.clipsContent = true;
  cover.fills = [
    linearGradient(
      [
        { hex: "#4A1030", position: 0 },
        { hex: "#FF3D8B", position: 1 },
      ],
      "diagonal",
    ),
  ];
  const glow = auroraBlob(260, "#FFFFFF");
  glow.opacity = 0.16;
  cover.appendChild(glow);
  glow.x = 230;
  glow.y = -110;
  coverWrap.appendChild(cover);
  const tagRow = autoFrame({ direction: "HORIZONTAL", gap: 8 });
  for (const tg of ["Audio", "FL-inspired", "Exploration"])
    tagRow.appendChild(await glassChip(t, tg));
  coverWrap.appendChild(tagRow);
  d.appendChild(coverWrap);

  const body = autoFrame({ direction: "VERTICAL", gap: 12, padding: [18, 28] });
  body.layoutAlign = "STRETCH";
  body.appendChild(
    await makeText(
      t,
      "body/sm",
      "A band-per-chart take on the classic parametric EQ: every band is its own little chart with a draggable point, live dB readout and a green-to-red clip strip. Built as a generated Figma exploration first, headed for an interactive web build.",
      "text/secondary",
      { maxWidth: 404 },
    ),
  );
  body.appendChild(await drawerKv(t, "Role", "Design engineer · solo"));
  body.appendChild(await drawerKv(t, "Stack", "TypeScript · Figma Plugin API"));
  body.appendChild(await drawerKv(t, "Year", "2026"));
  body.appendChild(await drawerKv(t, "Status", "Exploration → shipping"));
  const shots = autoFrame({ direction: "HORIZONTAL", gap: 12 });
  shots.paddingTop = 6;
  for (let i = 0; i < 2; i++) {
    const tile = autoFrame({ direction: "VERTICAL", gap: 6, align: "CENTER", cross: "CENTER" });
    tile.resize(196, 120);
    tile.primaryAxisSizingMode = "FIXED";
    tile.counterAxisSizingMode = "FIXED";
    tile.cornerRadius = RADII.md;
    fillToken(t, tile, "bg/inset");
    strokeToken(t, tile, "border/subtle", 1);
    tile.appendChild(icon(t, "image", 18, "text/muted"));
    tile.appendChild(
      await makeText(t, "caption", i === 0 ? "band detail" : "clip strip", "text/muted"),
    );
    shots.appendChild(tile);
  }
  body.appendChild(shots);
  d.appendChild(body);

  const grow = rect(1, 1);
  grow.fills = [];
  d.appendChild(grow);
  grow.layoutGrow = 1;
  const foot = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [18, 28] });
  foot.layoutAlign = "STRETCH";
  foot.primaryAxisSizingMode = "FIXED";
  const fsp = rect(1, 1);
  fsp.fills = [];
  foot.appendChild(fsp);
  fsp.layoutGrow = 1;
  foot.appendChild(await ctaPill(t, "Close", "ghost", "accent/primary", "rounded"));
  foot.appendChild(await ctaPill(t, "Open case", "primary", "accent/dante", "rounded"));
  d.appendChild(foot);

  s.appendChild(d);
  d.x = 0;
  d.y = 0;

  const note = await makeText(
    t,
    "caption",
    "drawer · slides in from the left · 460px · Esc / scrim closes",
    "text/muted",
  );
  s.appendChild(note);
  note.x = 484;
  note.y = 24;
  return s;
}

// ── 04 · Links ────────────────────────────────────────────────

async function linkRow(
  t: ThemeContext,
  w: number,
  o: { title: string; sub: string; meta: string; featured?: boolean },
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", cross: "CENTER", padding: [18, 22] });
  row.resize(w, row.height);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.cornerRadius = RADII.lg;
  if (o.featured) {
    fillToken(t, row, "glass/fill");
    strokeToken(t, row, "glass/border", 1);
    await applyEffect(row, "glow/accent", t);
  } else {
    fillToken(t, row, "bg/surface");
    strokeToken(t, row, "border/subtle", 1);
  }
  const left = autoFrame({ direction: "VERTICAL", gap: 4 });
  const titleRow = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  if (o.featured) {
    const d = ellipse(7);
    fillToken(t, d, "accent/primary");
    d.strokes = [];
    titleRow.appendChild(d);
  }
  titleRow.appendChild(await makeText(t, "heading/h4", o.title, "text/primary"));
  left.appendChild(titleRow);
  left.appendChild(await makeText(t, "body/sm", o.sub, "text/muted"));
  row.appendChild(left);
  left.layoutGrow = 1;
  const right = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  right.appendChild(await makeText(t, "mono/sm", o.meta, "text/muted"));
  right.appendChild(
    icon(t, "arrow-up-right", 18, o.featured ? "accent/primary" : "text/secondary"),
  );
  row.appendChild(right);
  return row;
}

async function linksSection(t: ThemeContext): Promise<FrameNode> {
  const s = shell(t, "04-links");
  atmosphere(s, [
    { hex: "#5EE6C1", size: 820, x: VW - 260, y: VH - 160, op: 0.14 },
    { hex: "#FFFFFF", size: 420, x: 240, y: 120, op: 0.05 },
  ]);
  const head = autoFrame({ direction: "VERTICAL", gap: 10 });
  head.appendChild(await makeText(t, "heading/h1", "A few doors worth opening.", "text/primary"));
  head.appendChild(
    await makeText(
      t,
      "body/lg",
      "The short list — work, words, and where to find me.",
      "text/muted",
    ),
  );
  s.appendChild(head);
  head.x = MX;
  head.y = 150;
  const listW = 900;
  const list = autoFrame({ direction: "VERTICAL", gap: 14 });
  list.appendChild(
    await linkRow(t, listW, {
      title: "Selected Work",
      sub: "A short, curated set of shipped products",
      meta: "work",
      featured: true,
    }),
  );
  list.appendChild(
    await linkRow(t, listW, {
      title: "Writing",
      sub: "Notes on interface craft & systems",
      meta: "essays",
    }),
  );
  list.appendChild(
    await linkRow(t, listW, {
      title: "GitHub",
      sub: "Open-source components & experiments",
      meta: "@lovelycentury",
    }),
  );
  list.appendChild(
    await linkRow(t, listW, { title: "LinkedIn", sub: "The professional trail", meta: "profile" }),
  );
  list.appendChild(
    await linkRow(t, listW, { title: "Résumé", sub: "Experience, in one page", meta: "pdf" }),
  );
  s.appendChild(list);
  list.x = MX;
  list.y = 292;
  await chrome(t, s, 3);
  return s;
}

// ── 05 · Proof ────────────────────────────────────────────────

async function statBlock(t: ThemeContext, big: string, label: string): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 6 });
  col.appendChild(await makeText(t, "display/lg", big, "text/primary"));
  col.appendChild(await makeText(t, "body/sm", label, "text/muted", { maxWidth: 220 }));
  return col;
}

async function proofSection(t: ThemeContext): Promise<FrameNode> {
  const s = shell(t, "05-proof");
  atmosphere(s, [
    { hex: "#818CF8", size: 760, x: VW - 300, y: 200, op: 0.14 },
    { hex: "#FF3D8B", size: 460, x: 200, y: VH - 140, op: 0.1 },
  ]);
  const head = autoFrame({ direction: "VERTICAL", gap: 8 });
  head.appendChild(await makeText(t, "heading/h1", "Quiet numbers.", "text/primary"));
  head.appendChild(
    await makeText(
      t,
      "body/lg",
      `Trusted by teams at ${SITE.credibility.logos.join(" · ")}.`,
      "text/muted",
      { maxWidth: 720 },
    ),
  );
  s.appendChild(head);
  head.x = MX;
  head.y = 160;
  const stats = autoFrame({ direction: "HORIZONTAL", gap: 96 });
  for (const stat of SITE.credibility.stats)
    stats.appendChild(await statBlock(t, stat.value, stat.label));
  s.appendChild(stats);
  stats.x = MX;
  stats.y = 320;
  const quote = autoFrame({ direction: "VERTICAL", gap: 14, padding: 28 });
  quote.resize(760, quote.height);
  quote.counterAxisSizingMode = "FIXED";
  quote.cornerRadius = RADII.xl;
  quote.fills = [
    linearGradient(
      [
        { hex: "#1D2150", position: 0 },
        { hex: "#12131C", position: 1 },
      ],
      "diagonal",
    ),
  ];
  strokeToken(t, quote, "border/subtle", 1);
  quote.appendChild(
    await makeText(t, "heading/h3", SITE.credibility.quote, "text/primary", { maxWidth: 704 }),
  );
  quote.appendChild(await makeText(t, "label/sm", SITE.credibility.quoteAuthor, "accent/primary"));
  s.appendChild(quote);
  quote.x = MX;
  quote.y = 520;
  await chrome(t, s, 4);
  return s;
}

// ── 06 · Contact ──────────────────────────────────────────────

async function contactSection(t: ThemeContext): Promise<FrameNode> {
  const s = shell(t, "06-contact");
  atmosphere(s, [
    { hex: "#5EE6C1", size: 1000, x: VW - 240, y: 200, op: 0.22 },
    { hex: "#FF3D8B", size: 620, x: 260, y: VH - 120, op: 0.12 },
    { hex: "#FFFFFF", size: 420, x: VW - 480, y: 120, op: 0.07 },
  ]);
  const col = autoFrame({ direction: "VERTICAL", gap: 24 });
  col.appendChild(await makeText(t, "overline", SITE.intro.closing.eyebrow, "accent/primary"));
  col.appendChild(
    await makeText(t, "display/lg", SITE.intro.closing.headline, "text/primary", { maxWidth: 860 }),
  );
  const mailRow = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  const pill = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [12, 18] });
  pill.cornerRadius = RADII.full;
  fillToken(t, pill, "glass/fill-strong");
  strokeToken(t, pill, "glass/border", 1);
  pill.appendChild(icon(t, "mail", 16, "text/secondary"));
  pill.appendChild(await makeText(t, "label/md", SITE.contact.email, "text/primary"));
  pill.appendChild(icon(t, "copy", 15, "text/muted"));
  mailRow.appendChild(pill);
  mailRow.appendChild(await glassChip(t, "GMT+2 · replies in a day", "accent/primary"));
  col.appendChild(mailRow);
  const socials = autoFrame({ direction: "HORIZONTAL", gap: 26, cross: "CENTER" });
  socials.paddingTop = 4;
  for (const [label] of [["LinkedIn"], ["GitHub"], ["Writing"], ["Résumé"]] as Array<[string]>) {
    const l = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
    l.appendChild(await makeText(t, "label/md", label, "text/secondary"));
    l.appendChild(icon(t, "arrow-up-right", 14, "text/muted"));
    socials.appendChild(l);
  }
  col.appendChild(socials);
  s.appendChild(col);
  col.x = MX;
  col.y = Math.round((VH - col.height) / 2);
  const foot = await makeText(
    t,
    "caption",
    `${SITE.footer.copyright} · built with the vizitka generator`,
    "text/muted",
  );
  s.appendChild(foot);
  foot.x = MX;
  foot.y = VH - 64;
  await chrome(t, s, 5);
  return s;
}

// ── Snap spec card ────────────────────────────────────────────

async function snapSpecCard(t: ThemeContext): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 12, padding: 24, name: "snap-spec" });
  card.resize(360, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  card.appendChild(await makeText(t, "overline", "Scroll-snap spec", "accent/primary"));
  card.appendChild(
    await makeText(
      t,
      "body/sm",
      "Each section is one viewport; the scroll snaps so only one thought is on screen at a time.",
      "text/secondary",
      { maxWidth: 312 },
    ),
  );
  card.appendChild(
    await makeText(
      t,
      "caption",
      "Each section = one viewport; scroll snaps so only one idea is visible.",
      "text/muted",
      { maxWidth: 312 },
    ),
  );
  const code = autoFrame({ direction: "VERTICAL", gap: 4, padding: 14 });
  code.layoutAlign = "STRETCH";
  code.cornerRadius = RADII.md;
  fillToken(t, code, "bg/inset");
  for (const line of [
    "html { scroll-snap-type: y mandatory; }",
    "section {",
    "  height: 100vh;",
    "  scroll-snap-align: start;",
    "}",
    "/* dots: IntersectionObserver */",
  ]) {
    code.appendChild(
      await makeText(t, "mono/sm", line, line.startsWith("/*") ? "text/muted" : "accent/primary"),
    );
  }
  card.appendChild(code);
  return card;
}

// ── Hero photo — hover-state demo ──────────────────────────────

async function photoHoverDemo(t: ThemeContext): Promise<FrameNode> {
  const CW = 460;
  const card = autoFrame({
    direction: "VERTICAL",
    gap: 14,
    padding: 28,
    name: "hero-photo-hover-demo",
  });
  card.resize(CW, card.height);
  card.counterAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);
  card.appendChild(await makeText(t, "overline", "Hero photo — hover state", "accent/primary"));
  card.appendChild(
    await makeText(
      t,
      "body/sm",
      "Idle: noir, tilted −3°, dissolves into the dark. Hover: color returns, straightens to 0°, scales up ~5% and glows.",
      "text/secondary",
      { maxWidth: CW - 56 },
    ),
  );
  card.appendChild(
    await makeText(
      t,
      "caption",
      "Default: noir, −3° tilt, fades into the dark. Hover: colour returns, tilt to 0°, light scale and glow.",
      "text/muted",
      { maxWidth: CW - 56 },
    ),
  );

  // Centered row; hover thumb is a touch bigger + glows, so leave right breathing room.
  const pair = autoFrame({ direction: "HORIZONTAL", gap: 18, align: "CENTER", cross: "CENTER" });
  pair.layoutAlign = "STRETCH";
  pair.primaryAxisSizingMode = "FIXED";
  pair.paddingTop = 6;
  const state = async (node: FrameNode, en: string, tone: string): Promise<FrameNode> => {
    const c = autoFrame({ direction: "VERTICAL", gap: 8, align: "CENTER", cross: "CENTER" });
    c.appendChild(node);
    c.appendChild(await makeText(t, "label/sm", en, tone));
    return c;
  };

  const idlePhoto = await noirPhoto(t, 150, 198, { caption: false });
  idlePhoto.rotation = -3;
  pair.appendChild(await state(idlePhoto, "Idle", "text/muted"));
  pair.appendChild(icon(t, "arrow-right", 18, "text/muted"));
  pair.appendChild(
    await state(
      await noirPhoto(t, 158, 208, { hovered: true, caption: false }),
      "Hover",
      "accent/primary",
    ),
  );
  card.appendChild(pair);

  const code = autoFrame({ direction: "VERTICAL", gap: 4, padding: 14 });
  code.layoutAlign = "STRETCH";
  code.cornerRadius = RADII.md;
  fillToken(t, code, "bg/inset");
  for (const line of [
    "figure img { filter: grayscale(1) contrast(1.2); }",
    "figure:hover img {",
    "  filter: saturate(1) contrast(1.04);",
    "  transform: rotate(0deg) scale(1.05);",
    "  box-shadow: 0 0 32px accent/40;",
    "  transition: 320ms ease-out;",
    "}",
  ]) {
    code.appendChild(await makeText(t, "mono/sm", line, "accent/primary"));
  }
  card.appendChild(code);
  return card;
}

export async function paintTemplateVizitka(t: ThemeContext, page: PageNode): Promise<void> {
  const label = await makeText(t, "overline", "11", "accent/primary");
  page.appendChild(label);
  label.x = 0;
  label.y = -84;

  const sections = [
    await heroSection(t),
    await aboutSection(t),
    await workSection(t),
    await linksSection(t),
    await proofSection(t),
    await contactSection(t),
  ];
  let y = 0;
  for (let i = 0; i < sections.length; i++) {
    const cap = await makeText(
      t,
      "overline",
      `0${i + 1} · ${SECTIONS[i]} — 100vh · snap-align: start`,
      "text/muted",
    );
    page.appendChild(cap);
    cap.x = 0;
    cap.y = y - 32;
    page.appendChild(sections[i]);
    sections[i].x = 0;
    sections[i].y = y;
    y += VH + 72;
  }

  const spec = await snapSpecCard(t);
  page.appendChild(spec);
  spec.x = VW + 96;
  spec.y = 0;

  // Hero photo idle → hover demo — parked under the snap spec, beside section 01.
  const hoverDemo = await photoHoverDemo(t);
  page.appendChild(hoverDemo);
  hoverDemo.x = VW + 96;
  hoverDemo.y = spec.height + 56;

  // Work section with the "More info" drawer open — parked beside section 03.
  const stateY = 2 * (VH + 72);
  const stateCap = await makeText(t, "overline", "03b", "text/muted");
  page.appendChild(stateCap);
  stateCap.x = VW + 96;
  stateCap.y = stateY - 32;
  const drawerState = await workDrawerState(t);
  page.appendChild(drawerState);
  drawerState.x = VW + 96;
  drawerState.y = stateY;
}
