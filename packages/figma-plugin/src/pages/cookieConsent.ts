/**
 * Cookie consent — a reusable CookieScript-style blank, dark-first.
 *
 * Four frames: compact banner, expanded modal (declaration), modal with the
 * per-cookie table opened, and the "About cookies" tab. Copy is neutral
 * placeholder text — swap per project.
 */

import { RADII } from "../tokens";
import { solid } from "../core/color";
import { autoFrame } from "../core/layout";
import { fillToken, makeText, rect, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { icon } from "../core/icons";
import { applyEffect } from "../components/primitives";

const BANNER_W = 380;
const MODAL_W = 960;
const PAD_X = 44;

async function upperText(
  t: ThemeContext,
  style: string,
  chars: string,
  token: string,
  maxWidth?: number,
): Promise<TextNode> {
  const n = await makeText(t, style, chars, token, maxWidth ? { maxWidth } : {});
  n.textCase = "UPPER";
  return n;
}

function spacer(): RectangleNode {
  const s = rect(1, 1);
  s.fills = [];
  return s;
}

/** Pill button — ACCEPT ALL / DECLINE ALL / SAVE & CLOSE. */
async function ckBtn(
  t: ThemeContext,
  label: string,
  kind: "primary" | "outline",
): Promise<FrameNode> {
  const b = autoFrame({
    direction: "HORIZONTAL",
    align: "CENTER",
    cross: "CENTER",
    padding: [12, 22],
  });
  b.cornerRadius = RADII.full;
  if (kind === "primary") {
    fillToken(t, b, "accent/primary");
    b.appendChild(await upperText(t, "label/md", label, "accent/contrast"));
  } else {
    strokeToken(t, b, "border/strong", 1);
    b.appendChild(await upperText(t, "label/md", label, "text/primary"));
  }
  return b;
}

/** Compact-banner checkbox — locked (checked, muted) or off. */
function ckBox(t: ThemeContext, state: "locked" | "off"): FrameNode {
  const box = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  box.resize(24, 24);
  box.primaryAxisSizingMode = "FIXED";
  box.counterAxisSizingMode = "FIXED";
  box.cornerRadius = 7;
  if (state === "locked") {
    fillToken(t, box, "bg/surface-raised");
    box.appendChild(icon(t, "check", 14, "text/muted"));
  } else {
    box.fills = [];
    strokeToken(t, box, "border/strong", 1.5);
  }
  return box;
}

/** Modal toggle — locked (always-on category), off, or on. */
function ckToggle(t: ThemeContext, state: "locked" | "off" | "on"): FrameNode {
  const on = state !== "off";
  const track = autoFrame({
    direction: "HORIZONTAL",
    cross: "CENTER",
    align: on ? "MAX" : "MIN",
    padding: 3,
  });
  track.resize(46, 26);
  track.primaryAxisSizingMode = "FIXED";
  track.counterAxisSizingMode = "FIXED";
  track.cornerRadius = RADII.full;
  const thumb = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  thumb.resize(20, 20);
  thumb.primaryAxisSizingMode = "FIXED";
  thumb.counterAxisSizingMode = "FIXED";
  thumb.cornerRadius = RADII.full;
  if (state === "on") {
    fillToken(t, track, "accent/primary");
    thumb.fills = [solid("#04140F")];
    thumb.appendChild(icon(t, "check", 12, "accent/primary"));
  } else if (state === "locked") {
    fillToken(t, track, "bg/surface-raised");
    strokeToken(t, track, "border/subtle", 1);
    fillToken(t, thumb, "bg/inset");
    thumb.appendChild(icon(t, "check", 12, "text/muted"));
    track.opacity = 0.6;
  } else {
    fillToken(t, track, "bg/surface-raised");
    strokeToken(t, track, "border/subtle", 1);
    fillToken(t, thumb, "bg/inset");
    thumb.appendChild(icon(t, "minus", 12, "text/secondary"));
  }
  track.appendChild(thumb);
  return track;
}

/** "SHOW COOKIES ⌄" / "HIDE COOKIES ⌃" accent link. */
async function cookiesLink(t: ThemeContext, hide = false): Promise<FrameNode> {
  const r = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
  r.appendChild(
    await upperText(t, "label/sm", hide ? "Hide cookies" : "Show cookies", "accent/primary"),
  );
  r.appendChild(icon(t, hide ? "chevron-up" : "chevron-down", 14, "accent/primary"));
  return r;
}

/** Header row — language selector + close. */
async function ckHeader(t: ThemeContext, w: number, compact = false): Promise<FrameNode> {
  const h = autoFrame({
    direction: "HORIZONTAL",
    gap: 24,
    cross: "CENTER",
    padding: compact ? 0 : [22, PAD_X],
  });
  h.resize(w, h.height);
  h.primaryAxisSizingMode = "FIXED";
  h.counterAxisSizingMode = "AUTO";
  const sp = spacer();
  h.appendChild(sp);
  sp.layoutGrow = 1;
  const lang = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  lang.appendChild(icon(t, "globe", 16, "text/primary"));
  if (!compact) {
    lang.appendChild(await upperText(t, "label/sm", "English", "text/primary"));
    lang.appendChild(icon(t, "chevron-down", 14, "text/secondary"));
  }
  h.appendChild(lang);
  h.appendChild(icon(t, "x", 18, "text/primary"));
  return h;
}

/** Title + intro copy + Read more. */
async function ckIntro(t: ThemeContext, w: number, compact = false): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 12, padding: compact ? 0 : [10, PAD_X] });
  col.layoutAlign = "STRETCH";
  col.appendChild(
    await makeText(
      t,
      compact ? "heading/h3" : "heading/h2",
      "This website uses cookies",
      "text/primary",
      { maxWidth: w },
    ),
  );
  const bodyStyle = compact ? "body/sm" : "body/md";
  col.appendChild(
    await makeText(
      t,
      bodyStyle,
      "This website uses cookies to improve user experience. By using our website you consent to all cookies in accordance with our Cookie Policy.",
      "text/secondary",
      { maxWidth: w },
    ),
  );
  col.appendChild(await makeText(t, bodyStyle, "Read more", "accent/primary"));
  return col;
}

const CATEGORIES: Array<{ name: string; desc: string; state: "locked" | "off" }> = [
  {
    name: "Strictly necessary",
    desc: "Strictly necessary cookies allow core website functionality such as user login and account management. The website cannot be used properly without strictly necessary cookies.",
    state: "locked",
  },
  {
    name: "Performance",
    desc: "Performance cookies are used to see how visitors use the website, eg. analytics cookies. Those cookies cannot be used to directly identify a certain visitor.",
    state: "off",
  },
  {
    name: "Targeting",
    desc: "Targeting cookies are used to identify visitors between different websites, eg. content partners, banner networks. Those cookies may be used by companies to build a profile of visitor interests or show relevant ads on other websites.",
    state: "off",
  },
  {
    name: "Functionality",
    desc: "Functionality cookies are used to remember visitor information on the website, eg. language, timezone, enhanced content.",
    state: "off",
  },
];

const COOKIE_ROWS: Array<{
  name: string;
  provider: string;
  domain: string;
  exp: string;
  desc: string;
}> = [
  {
    name: "YSC",
    provider: "Google LLC",
    domain: ".youtube.com",
    exp: "Session",
    desc: "This cookie is set by YouTube to track views of embedded videos.",
  },
  {
    name: "VISITOR_INFO1_LIVE",
    provider: "Google LLC",
    domain: ".youtube.com",
    exp: "5 months 4 weeks",
    desc: "Set by YouTube to keep track of user preferences for embedded videos; also detects the interface version.",
  },
  {
    name: "_ga_XXXXXXXXXX",
    provider: "Google LLC",
    domain: "stats.example.dev",
    exp: "1 year",
    desc: "This cookie is used by Google Analytics to persist session state.",
  },
];

/** Two full-width tabs — declaration / about. */
async function ckTabs(t: ThemeContext, w: number, active: 0 | 1): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 0 });
  row.resize(w, row.height);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  const labels = ["Cookie declaration", "About cookies"];
  for (let i = 0; i < 2; i++) {
    const cell = autoFrame({
      direction: "HORIZONTAL",
      align: "CENTER",
      cross: "CENTER",
      padding: [18, 0],
    });
    cell.resize(w / 2, cell.height);
    cell.primaryAxisSizingMode = "FIXED";
    cell.counterAxisSizingMode = "AUTO";
    if (i === active) {
      fillToken(t, cell, "bg/surface");
      strokeToken(t, cell, "accent/primary", 3);
      cell.strokeBottomWeight = 0;
      cell.strokeLeftWeight = 0;
      cell.strokeRightWeight = 0;
      cell.strokeTopWeight = 3;
      cell.appendChild(await upperText(t, "label/md", labels[i], "accent/primary"));
    } else {
      fillToken(t, cell, "bg/inset");
      cell.appendChild(await upperText(t, "label/md", labels[i], "text/primary"));
    }
    row.appendChild(cell);
  }
  return row;
}

/** Per-cookie table (Performance section, expanded). */
async function cookieTable(t: ThemeContext, w: number): Promise<FrameNode> {
  const panel = autoFrame({ direction: "VERTICAL", gap: 0 });
  panel.resize(w, panel.height);
  panel.counterAxisSizingMode = "FIXED";
  panel.cornerRadius = RADII.md;
  panel.clipsContent = true;
  fillToken(t, panel, "bg/surface");
  strokeToken(t, panel, "border/subtle", 1);
  const cols = [170, 200, 130, w - 170 - 200 - 130 - 32 - 48];
  const gap = 16;
  const row = async (cells: SceneNode[], head = false): Promise<FrameNode> => {
    const r = autoFrame({ direction: "HORIZONTAL", gap, cross: "MIN", padding: [12, 16] });
    r.layoutAlign = "STRETCH";
    r.primaryAxisSizingMode = "FIXED";
    for (let i = 0; i < cells.length; i++) {
      const c = autoFrame({ direction: "VERTICAL", gap: 3 });
      c.resize(cols[i], c.height);
      c.counterAxisSizingMode = "FIXED";
      c.appendChild(cells[i]);
      r.appendChild(c);
    }
    if (head) fillToken(t, r, "bg/surface-raised");
    return r;
  };
  panel.appendChild(
    await row(
      [
        await makeText(t, "label/sm", "Name", "text/primary"),
        await makeText(t, "label/sm", "Provider / Domain", "text/primary"),
        await makeText(t, "label/sm", "Expiration", "text/primary"),
        await makeText(t, "label/sm", "Description", "text/primary"),
      ],
      true,
    ),
  );
  for (const ck of COOKIE_ROWS) {
    const line = rect(w, 1);
    fillToken(t, line, "border/subtle");
    panel.appendChild(line);
    const provider = autoFrame({ direction: "VERTICAL", gap: 2 });
    provider.appendChild(await makeText(t, "body/sm", ck.provider, "accent/primary"));
    provider.appendChild(await makeText(t, "caption", ck.domain, "text/muted"));
    panel.appendChild(
      await row([
        await makeText(t, "mono/sm", ck.name, "text/primary", { maxWidth: cols[0] }),
        provider,
        await makeText(t, "body/sm", ck.exp, "text/secondary", { maxWidth: cols[2] }),
        await makeText(t, "caption", ck.desc, "text/secondary", { maxWidth: cols[3] }),
      ]),
    );
  }
  return panel;
}

/** One category block — title + copy + toggle (+ expanded table). */
async function ckCategory(
  t: ThemeContext,
  w: number,
  cat: (typeof CATEGORIES)[number],
  expanded = false,
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 12 });
  col.layoutAlign = "STRETCH";
  const top = autoFrame({ direction: "HORIZONTAL", gap: 24, cross: "MIN" });
  top.layoutAlign = "STRETCH";
  top.primaryAxisSizingMode = "FIXED";
  const text = autoFrame({ direction: "VERTICAL", gap: 8 });
  text.appendChild(await makeText(t, "heading/h4", cat.name, "text/primary"));
  text.appendChild(await makeText(t, "body/sm", cat.desc, "text/secondary", { maxWidth: w - 110 }));
  top.appendChild(text);
  text.layoutGrow = 1;
  top.appendChild(ckToggle(t, cat.state));
  col.appendChild(top);
  if (expanded) col.appendChild(await cookieTable(t, w));
  col.appendChild(await cookiesLink(t, expanded));
  return col;
}

/** Footer — accept / decline left, save & close right. */
async function ckFooter(t: ThemeContext, w: number): Promise<FrameNode> {
  const f = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [20, PAD_X] });
  f.resize(w, f.height);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "AUTO";
  f.appendChild(await ckBtn(t, "Accept all", "outline"));
  f.appendChild(await ckBtn(t, "Decline all", "outline"));
  const sp = spacer();
  f.appendChild(sp);
  sp.layoutGrow = 1;
  f.appendChild(await ckBtn(t, "Save & close", "primary"));
  return f;
}

/** Compact banner (mobile). */
async function cookieBanner(t: ThemeContext): Promise<FrameNode> {
  const b = autoFrame({ direction: "VERTICAL", gap: 18, padding: 24, name: "cookie/banner" });
  b.resize(BANNER_W, b.height);
  b.counterAxisSizingMode = "FIXED";
  b.cornerRadius = RADII["2xl"];
  fillToken(t, b, "bg/surface");
  strokeToken(t, b, "border/subtle", 1);
  await applyEffect(b, "shadow/lg", t);
  b.appendChild(await ckHeader(t, BANNER_W - 48, true));
  b.appendChild(await ckIntro(t, BANNER_W - 48, true));
  const list = autoFrame({ direction: "VERTICAL", gap: 14 });
  for (const cat of CATEGORIES) {
    const r = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER" });
    r.appendChild(ckBox(t, cat.state));
    r.appendChild(await upperText(t, "label/sm", cat.name, "text/primary"));
    list.appendChild(r);
  }
  b.appendChild(list);
  const btns = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  btns.layoutAlign = "STRETCH";
  btns.primaryAxisSizingMode = "FIXED";
  const accept = await ckBtn(t, "Accept all", "primary");
  const decline = await ckBtn(t, "Decline all", "outline");
  btns.appendChild(accept);
  btns.appendChild(decline);
  // Split the row 50/50 like the original — a hugging pair leaves a dead gap.
  accept.layoutGrow = 1;
  decline.layoutGrow = 1;
  b.appendChild(btns);
  const details = autoFrame({ direction: "HORIZONTAL", gap: 8, align: "CENTER", cross: "CENTER" });
  details.layoutAlign = "STRETCH";
  details.primaryAxisSizingMode = "FIXED";
  details.appendChild(icon(t, "settings", 14, "text/muted"));
  details.appendChild(await upperText(t, "label/sm", "Show details", "text/muted"));
  b.appendChild(details);
  return b;
}

/** Expanded modal — declaration / cookies table / about. */
async function cookieModal(
  t: ThemeContext,
  mode: "declaration" | "table" | "about",
): Promise<FrameNode> {
  const m = autoFrame({ direction: "VERTICAL", gap: 0, name: `cookie/modal-${mode}`, clip: true });
  m.resize(MODAL_W, m.height);
  m.counterAxisSizingMode = "FIXED";
  m.cornerRadius = RADII["2xl"];
  fillToken(t, m, "bg/surface");
  strokeToken(t, m, "border/subtle", 1);
  await applyEffect(m, "shadow/lg", t);
  m.appendChild(await ckHeader(t, MODAL_W));
  m.appendChild(await ckIntro(t, MODAL_W - PAD_X * 2));
  const gapAfterIntro = rect(MODAL_W, 22);
  gapAfterIntro.fills = [];
  m.appendChild(gapAfterIntro);
  m.appendChild(await ckTabs(t, MODAL_W, mode === "about" ? 1 : 0));
  const content = autoFrame({ direction: "VERTICAL", gap: 0, padding: [26, PAD_X] });
  content.layoutAlign = "STRETCH";
  fillToken(t, content, "bg/inset");
  const innerW = MODAL_W - PAD_X * 2;
  if (mode === "about") {
    const col = autoFrame({ direction: "VERTICAL", gap: 16 });
    col.appendChild(
      await makeText(
        t,
        "body/md",
        "Cookies are small text files that are placed on your computer by websites that you visit. Websites use cookies to help users navigate efficiently and perform certain functions. Cookies that are required for the website to operate properly are allowed to be set without your permission. All other cookies need to be approved before they can be set in the browser.",
        "text/secondary",
        { maxWidth: innerW },
      ),
    );
    col.appendChild(
      await makeText(
        t,
        "body/md",
        "You can change your consent to cookie usage at any time on our Privacy Policy page.",
        "text/secondary",
        { maxWidth: innerW },
      ),
    );
    content.appendChild(col);
  } else {
    for (let i = 0; i < CATEGORIES.length; i++) {
      const expanded = mode === "table" && CATEGORIES[i].name === "Performance";
      content.appendChild(await ckCategory(t, innerW, CATEGORIES[i], expanded));
      if (i < CATEGORIES.length - 1) {
        const sepWrap = autoFrame({ direction: "VERTICAL", gap: 0, padding: [20, 0] });
        sepWrap.layoutAlign = "STRETCH";
        const line = rect(innerW, 1);
        fillToken(t, line, "border/subtle");
        sepWrap.appendChild(line);
        content.appendChild(sepWrap);
      }
    }
  }
  m.appendChild(content);
  m.appendChild(await ckFooter(t, MODAL_W));
  return m;
}

export async function paintCookieConsent(t: ThemeContext, page: PageNode): Promise<void> {
  const frames: Array<{ cap: string; node: FrameNode }> = [
    { cap: "Banner · Compact", node: await cookieBanner(t) },
    { cap: "Modal · Cookie declaration", node: await cookieModal(t, "declaration") },
    { cap: "Modal · Cookies table", node: await cookieModal(t, "table") },
    { cap: "Modal · About cookies", node: await cookieModal(t, "about") },
  ];
  let x = 0;
  for (const f of frames) {
    const cap = await makeText(t, "overline", f.cap, "text/muted");
    page.appendChild(cap);
    cap.x = x;
    cap.y = -36;
    page.appendChild(f.node);
    f.node.x = x;
    f.node.y = 0;
    x += f.node.width + 120;
  }
  const label = await makeText(
    t,
    "overline",
    "10 · Templates (Cookie consent) — reusable blank",
    "accent/primary",
  );
  page.appendChild(label);
  label.x = 0;
  label.y = -84;
}
