/**
 * Template (Emails) — DESIGN ONLY. The email patterns worth stealing, each as an
 * annotated mock inside a mail-client shell: verify code, magic link, password
 * reset, welcome, receipt, shipping, trial ending, invite, notification, digest,
 * announcement, the plain-text fallback, and the mobile rendering.
 *
 * Email is not the web: one column, a 600px body, no flex, no external CSS, and
 * a client that may strip half of what you wrote. So every screen here is built
 * from the same block helpers at email-safe widths — the variants differ in
 * structure, never in styling drift — and the first board states the rules the
 * rest obey.
 */

import { RADII, SITE } from "../tokens";
import { linearGradient, solid } from "../core/color";
import { autoFrame, fixedSize, spacer, stretch } from "../core/layout";
import { auroraBlob, ellipse, fillToken, makeText, rect, strokeToken } from "../core/nodes";
import { icon } from "../core/icons";
import { logoLockup } from "../core/logo";
import { ThemeContext } from "../core/theme";

/** The one number every email client agrees on. */
const EMAIL_W = 600;
/** Gutter between the email body and the client's viewport. */
const CANVAS_PAD = 32;
const SHELL_W = EMAIL_W + CANVAS_PAD * 2;
const CHROME_H = 44;
/** Inner padding of a content block — the email's own safe area. */
const PAD_X = 40;
const IN = EMAIL_W - PAD_X * 2;

const MOBILE_W = 360;
const MOBILE_PAD = 16;
const MOBILE_SHELL_W = MOBILE_W + MOBILE_PAD * 2;
const MOBILE_IN = MOBILE_W - 24 * 2;

const GAP_X = 90;
const GAP_Y = 130;

/** Placeholder addresses only — no real inboxes end up in the design file. */
const FROM_ADDRESS = "no-reply@okryshto.dev";
const TO_ADDRESS = "you@company.com";

function aa(hex: string, a: number): SolidPaint {
  return { ...solid(hex), opacity: a } as SolidPaint;
}

/**
 * Pin a frame's *width* regardless of its layout axis, and stretch it in the
 * parent. `resize()` alone is silently discarded on an axis still set to AUTO —
 * and for a HORIZONTAL frame width is the primary axis, not the counter one, so
 * touching the wrong axis leaves a band that hugs its contents instead of
 * spanning the email.
 */
function fullWidth(f: FrameNode, w: number): FrameNode {
  if (f.layoutMode === "HORIZONTAL") {
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "AUTO";
  } else {
    f.counterAxisSizingMode = "FIXED";
    f.primaryAxisSizingMode = "AUTO";
  }
  f.resize(w, f.height);
  f.layoutAlign = "STRETCH";
  return f;
}

// ── Client shell ──────────────────────────────────────────────

interface Shell {
  shell: FrameNode;
  /** The email body — append blocks here; each is stretched automatically. */
  body: FrameNode;
  /** Usable width inside a padded block. */
  inner: number;
}

/**
 * A mail-client window: chrome, the sender/subject header the recipient reads
 * before opening anything, and the grey canvas the email body floats on.
 */
async function clientShell(
  t: ThemeContext,
  o: { name: string; subject: string; preheader: string; mobile?: boolean },
): Promise<Shell> {
  const mobile = o.mobile === true;
  const w = mobile ? MOBILE_SHELL_W : SHELL_W;
  const bodyW = mobile ? MOBILE_W : EMAIL_W;
  const pad = mobile ? MOBILE_PAD : CANVAS_PAD;

  const shell = autoFrame({ direction: "VERTICAL", gap: 0, clip: true });
  shell.name = `email/${o.name}`;
  shell.counterAxisSizingMode = "FIXED";
  shell.resize(w, shell.height);
  shell.cornerRadius = RADII.xl;
  fillToken(t, shell, "bg/canvas");
  strokeToken(t, shell, "border/subtle", 1);

  // Chrome — three dots and the app name, enough to read as "a client".
  const chrome = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [0, 16] });
  fixedSize(chrome, w, CHROME_H);
  stretch(chrome);
  fillToken(t, chrome, "bg/surface");
  for (const hex of ["#FF5F57", "#FEBC2E", "#28C840"]) {
    const dot = ellipse(10);
    dot.fills = [aa(hex, 0.85)];
    dot.strokes = [];
    chrome.appendChild(dot);
  }
  chrome.appendChild(spacer());
  const app = autoFrame({ direction: "HORIZONTAL", gap: 7, cross: "CENTER" });
  app.appendChild(icon(t, "mail", 13, "text/muted"));
  app.appendChild(await makeText(t, "mono/sm", "Inbox", "text/muted"));
  chrome.appendChild(app);
  chrome.appendChild(spacer());
  shell.appendChild(chrome);

  // Header — sender, subject, preheader. The three things that decide whether
  // anything below ever gets read.
  const head = autoFrame({ direction: "VERTICAL", gap: 10, padding: [16, mobile ? 16 : 24] });
  head.counterAxisSizingMode = "FIXED";
  head.resize(w, head.height);
  stretch(head);
  fillToken(t, head, "bg/surface");

  const senderRow = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  senderRow.primaryAxisSizingMode = "FIXED";
  senderRow.resize(w - (mobile ? 32 : 48), senderRow.height);
  const av = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  fixedSize(av, 28, 28);
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
  av.appendChild(await makeText(t, "caption", SITE.brand, "accent/contrast"));
  senderRow.appendChild(av);
  senderRow.appendChild(await makeText(t, "label/sm", "Okryshto", "text/primary"));
  senderRow.appendChild(await makeText(t, "caption", `<${FROM_ADDRESS}>`, "text/muted"));
  senderRow.appendChild(spacer());
  senderRow.appendChild(await makeText(t, "caption", "09:41", "text/muted"));
  head.appendChild(senderRow);

  head.appendChild(
    await makeText(t, "label/md", o.subject, "text/primary", { maxWidth: w - (mobile ? 32 : 48) }),
  );

  // Preheader: the preview text clients show next to the subject. Never leave
  // it to chance — an unset one leaks "View this email in your browser".
  const pre = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "MIN" });
  pre.appendChild(icon(t, "eye", 12, "text/muted"));
  pre.appendChild(
    await makeText(t, "caption", o.preheader, "text/muted", { maxWidth: w - (mobile ? 60 : 76) }),
  );
  head.appendChild(pre);
  shell.appendChild(head);

  // Canvas — the client's own background, with the email body centered on it.
  const canvas = autoFrame({ direction: "VERTICAL", gap: 0, cross: "CENTER", padding: pad });
  canvas.counterAxisSizingMode = "FIXED";
  canvas.resize(w, canvas.height);
  stretch(canvas);
  fillToken(t, canvas, "bg/inset");

  const body = autoFrame({ direction: "VERTICAL", gap: 0, clip: true });
  body.name = "email-body · 600px";
  body.counterAxisSizingMode = "FIXED";
  body.resize(bodyW, body.height);
  body.cornerRadius = RADII.lg;
  fillToken(t, body, "bg/surface");
  strokeToken(t, body, "border/subtle", 1);
  canvas.appendChild(body);
  shell.appendChild(canvas);

  return { shell, body, inner: mobile ? MOBILE_IN : IN };
}

// ── Blocks ────────────────────────────────────────────────────

/** A padded, full-width band inside the email body. */
function block(
  t: ThemeContext,
  o: { gap?: number; padX?: number; padY?: number; token?: string; cross?: "MIN" | "CENTER" } = {},
): FrameNode {
  const f = autoFrame({
    direction: "VERTICAL",
    gap: o.gap ?? 16,
    cross: o.cross ?? "MIN",
    padding: { t: o.padY ?? 32, r: o.padX ?? PAD_X, b: o.padY ?? 32, l: o.padX ?? PAD_X },
  });
  stretch(f);
  if (o.token) fillToken(t, f, o.token);
  return f;
}

/** Brand bar at the top of every email — logo left, one quiet link right. */
async function brandBar(
  t: ThemeContext,
  w: number,
  link = "View in browser",
  padX = PAD_X,
): Promise<FrameNode> {
  const bar = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [18, padX] });
  fullWidth(bar, w);
  fillToken(t, bar, "bg/surface-raised");

  const real = logoLockup("horizontal", 24);
  if (real) {
    bar.appendChild(real);
  } else {
    const chip = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    fixedSize(chip, 26, 26);
    chip.cornerRadius = RADII.sm;
    chip.fills = [
      linearGradient(
        [
          { hex: "#5EE6C1", position: 0 },
          { hex: "#818CF8", position: 1 },
        ],
        "diagonal",
      ),
    ];
    chip.appendChild(await makeText(t, "caption", SITE.brand, "accent/contrast"));
    bar.appendChild(chip);
  }
  bar.appendChild(spacer());
  bar.appendChild(await makeText(t, "caption", link, "text/muted"));

  // Hairline under the bar so the masthead reads as its own band.
  const wrap = autoFrame({ direction: "VERTICAL", gap: 0 });
  fullWidth(wrap, w);
  wrap.appendChild(bar);
  wrap.appendChild(divider(t, w));
  return wrap;
}

/** Headline + supporting paragraph — the two lines that carry the email. */
async function lede(
  t: ThemeContext,
  w: number,
  title: string,
  text: string,
  centred = false,
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 12, cross: centred ? "CENTER" : "MIN" });
  col.counterAxisSizingMode = "FIXED";
  col.resize(w, col.height);
  col.appendChild(
    await makeText(t, "heading/h3", title, "text/primary", {
      maxWidth: w,
      align: centred ? "CENTER" : "LEFT",
    }),
  );
  col.appendChild(
    await makeText(t, "body/sm", text, "text/secondary", {
      maxWidth: w,
      align: centred ? "CENTER" : "LEFT",
    }),
  );
  return col;
}

async function para(
  t: ThemeContext,
  w: number,
  text: string,
  token = "text/secondary",
): Promise<TextNode> {
  return makeText(t, "body/sm", text, token, { maxWidth: w });
}

/**
 * "Bulletproof" CTA — a padded box with a text label, never a background image.
 * 48px tall so it survives a thumb, and it repeats as a plain URL underneath
 * for the clients that eat buttons.
 */
async function cta(
  t: ThemeContext,
  w: number,
  label: string,
  o: { iconName?: string; full?: boolean; fallbackUrl?: string; secondary?: boolean } = {},
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 12, cross: "MIN" });
  col.counterAxisSizingMode = "FIXED";
  col.resize(w, col.height);

  const b = autoFrame({
    direction: "HORIZONTAL",
    gap: 10,
    align: "CENTER",
    cross: "CENTER",
    padding: [14, 28],
  });
  b.counterAxisSizingMode = "AUTO";
  if (o.full) {
    b.primaryAxisSizingMode = "FIXED";
    b.resize(w, b.height);
  }
  b.cornerRadius = RADII.md;
  if (o.secondary) {
    fillToken(t, b, "bg/inset");
    strokeToken(t, b, "border/default", 1);
    if (o.iconName) b.appendChild(icon(t, o.iconName, 16, "text/primary"));
    b.appendChild(await makeText(t, "label/md", label, "text/primary"));
  } else {
    // No glow: clients drop box-shadow, so a button that needs one to look
    // finished won't look finished in an inbox.
    fillToken(t, b, "accent/primary");
    if (o.iconName) b.appendChild(icon(t, o.iconName, 16, "accent/contrast"));
    b.appendChild(await makeText(t, "label/md", label, "accent/contrast"));
  }
  col.appendChild(b);

  if (o.fallbackUrl) {
    col.appendChild(
      await makeText(t, "caption", "Button not working? Paste this link:", "text/muted", {
        maxWidth: w,
      }),
    );
    col.appendChild(await makeText(t, "mono/sm", o.fallbackUrl, "accent/primary", { maxWidth: w }));
  }
  return col;
}

/** The big monospaced code a verification email exists to deliver. */
async function codeBlock(
  t: ThemeContext,
  w: number,
  code: string,
  note: string,
): Promise<FrameNode> {
  const col = autoFrame({
    direction: "VERTICAL",
    gap: 10,
    cross: "CENTER",
    align: "CENTER",
    padding: [24, 16],
  });
  col.counterAxisSizingMode = "FIXED";
  col.resize(w, col.height);
  col.cornerRadius = RADII.md;
  fillToken(t, col, "bg/inset");
  strokeToken(t, col, "border/default", 1);

  const digits = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", align: "CENTER" });
  for (const ch of code.split("")) {
    digits.appendChild(await makeText(t, "display/lg", ch, "text/primary"));
  }
  col.appendChild(digits);
  col.appendChild(
    await makeText(t, "caption", note, "text/muted", { align: "CENTER", maxWidth: w - 32 }),
  );
  return col;
}

/** Hairline rule between blocks. */
function divider(t: ThemeContext, w: number): RectangleNode {
  const r = rect(w, 1);
  fillToken(t, r, "border/subtle");
  return r;
}

/** Label / value row — receipts, invites, order summaries. */
async function dataRow(
  t: ThemeContext,
  w: number,
  label: string,
  value: string,
  strong = false,
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 16, cross: "CENTER" });
  row.primaryAxisSizingMode = "FIXED";
  row.resize(w, row.height);
  row.appendChild(
    await makeText(
      t,
      strong ? "label/md" : "body/sm",
      label,
      strong ? "text/primary" : "text/muted",
    ),
  );
  row.appendChild(spacer());
  row.appendChild(
    await makeText(
      t,
      strong ? "label/md" : "body/sm",
      value,
      strong ? "text/primary" : "text/secondary",
    ),
  );
  return row;
}

/** A purchased line item: thumbnail, name, meta, price. */
async function lineItem(
  t: ThemeContext,
  w: number,
  name: string,
  meta: string,
  price: string,
  iconName: string,
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER" });
  row.primaryAxisSizingMode = "FIXED";
  row.resize(w, row.height);

  const thumb = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  fixedSize(thumb, 48, 48);
  thumb.cornerRadius = RADII.md;
  fillToken(t, thumb, "bg/inset");
  strokeToken(t, thumb, "border/subtle", 1);
  thumb.appendChild(icon(t, iconName, 20, "accent/primary"));
  row.appendChild(thumb);

  const col = autoFrame({ direction: "VERTICAL", gap: 4, cross: "MIN" });
  col.appendChild(await makeText(t, "label/sm", name, "text/primary"));
  col.appendChild(await makeText(t, "caption", meta, "text/muted"));
  row.appendChild(col);
  row.appendChild(spacer());
  row.appendChild(await makeText(t, "label/sm", price, "text/primary"));
  return row;
}

/** Coloured callout — security notes, warnings, "you can ignore this". */
async function callout(
  t: ThemeContext,
  w: number,
  iconName: string,
  text: string,
  tone: "neutral" | "warning" | "danger" | "success" = "neutral",
): Promise<FrameNode> {
  const box = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "MIN", padding: [14, 16] });
  box.primaryAxisSizingMode = "FIXED";
  box.resize(w, box.height);
  box.cornerRadius = RADII.md;

  const map = {
    neutral: { hex: "#818CF8", token: "accent/secondary" },
    warning: { hex: "#FBBF24", token: "feedback/warning" },
    danger: { hex: "#F87171", token: "feedback/danger" },
    success: { hex: "#34D399", token: "feedback/success" },
  } as const;
  const tone_ = map[tone];
  box.fills = [aa(tone_.hex, 0.12)];
  box.strokes = [aa(tone_.hex, 0.34)];
  box.strokeWeight = 1;

  box.appendChild(icon(t, iconName, 16, tone_.token));
  box.appendChild(await makeText(t, "caption", text, "text/secondary", { maxWidth: w - 62 }));
  return box;
}

/** Round icon chip that opens welcome / success / status emails. */
function statusChip(
  t: ThemeContext,
  iconName: string,
  hex: string,
  token: string,
  size = 56,
): FrameNode {
  const chip = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  fixedSize(chip, size, size);
  chip.cornerRadius = RADII.full;
  chip.fills = [aa(hex, 0.16)];
  chip.appendChild(icon(t, iconName, Math.round(size * 0.46), token));
  return chip;
}

/** Numbered "next steps" list — the body of most welcome emails. */
async function steps(
  t: ThemeContext,
  w: number,
  items: Array<[string, string]>,
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 16, cross: "MIN" });
  col.counterAxisSizingMode = "FIXED";
  col.resize(w, col.height);
  let n = 1;
  for (const [title, text] of items) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "MIN" });
    row.primaryAxisSizingMode = "FIXED";
    row.resize(w, row.height);
    const num = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    fixedSize(num, 26, 26);
    num.cornerRadius = RADII.full;
    fillToken(t, num, "bg/inset");
    strokeToken(t, num, "border/default", 1);
    num.appendChild(await makeText(t, "label/sm", String(n), "accent/primary"));
    row.appendChild(num);

    const body = autoFrame({ direction: "VERTICAL", gap: 4, cross: "MIN" });
    body.counterAxisSizingMode = "FIXED";
    body.resize(w - 40, body.height);
    body.appendChild(await makeText(t, "label/sm", title, "text/primary", { maxWidth: w - 40 }));
    body.appendChild(await makeText(t, "caption", text, "text/muted", { maxWidth: w - 40 }));
    row.appendChild(body);
    col.appendChild(row);
    n++;
  }
  return col;
}

/** Article teaser for the digest / newsletter pattern. */
async function articleRow(
  t: ThemeContext,
  w: number,
  kicker: string,
  title: string,
  text: string,
  iconName: string,
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "MIN" });
  row.primaryAxisSizingMode = "FIXED";
  row.resize(w, row.height);

  const thumb = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  fixedSize(thumb, 64, 64);
  thumb.cornerRadius = RADII.md;
  thumb.fills = [
    linearGradient(
      [
        { hex: "#0E4B3C", position: 0 },
        { hex: "#12131C", position: 1 },
      ],
      "diagonal",
    ),
  ];
  thumb.appendChild(icon(t, iconName, 24, "accent/primary"));
  row.appendChild(thumb);

  const col = autoFrame({ direction: "VERTICAL", gap: 5, cross: "MIN" });
  col.counterAxisSizingMode = "FIXED";
  col.resize(w - 78, col.height);
  col.appendChild(await makeText(t, "overline", kicker, "accent/primary"));
  col.appendChild(await makeText(t, "label/md", title, "text/primary", { maxWidth: w - 78 }));
  col.appendChild(await makeText(t, "caption", text, "text/muted", { maxWidth: w - 78 }));
  row.appendChild(col);
  return row;
}

/** Three-up metric strip for digests and reports. */
async function metrics(
  t: ThemeContext,
  w: number,
  items: Array<[string, string]>,
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "MIN" });
  row.primaryAxisSizingMode = "FIXED";
  row.resize(w, row.height);
  const cellW = Math.floor((w - 12 * (items.length - 1)) / items.length);
  for (const [value, label] of items) {
    const cell = autoFrame({
      direction: "VERTICAL",
      gap: 4,
      cross: "CENTER",
      align: "CENTER",
      padding: [16, 10],
    });
    cell.primaryAxisSizingMode = "AUTO";
    cell.counterAxisSizingMode = "FIXED";
    cell.resize(cellW, cell.height);
    cell.cornerRadius = RADII.md;
    fillToken(t, cell, "bg/inset");
    strokeToken(t, cell, "border/subtle", 1);
    cell.appendChild(await makeText(t, "heading/h4", value, "text/primary"));
    cell.appendChild(
      await makeText(t, "caption", label, "text/muted", { align: "CENTER", maxWidth: cellW - 20 }),
    );
    row.appendChild(cell);
  }
  return row;
}

/** Delivery progress — dot track for shipping / order status. */
async function progressTrack(
  t: ThemeContext,
  w: number,
  stages: string[],
  current: number,
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 10, cross: "MIN" });
  col.counterAxisSizingMode = "FIXED";
  col.resize(w, col.height);

  const track = autoFrame({ direction: "HORIZONTAL", gap: 0, cross: "CENTER" });
  track.primaryAxisSizingMode = "FIXED";
  track.resize(w, track.height);
  stages.forEach((_, i) => {
    const done = i <= current;
    const d = ellipse(12);
    fillToken(t, d, done ? "accent/primary" : "border/strong");
    d.strokes = [];
    track.appendChild(d);
    if (i < stages.length - 1) {
      const line = rect(1, 3, 2);
      fillToken(t, line, i < current ? "accent/primary" : "border/subtle");
      track.appendChild(line);
      line.layoutGrow = 1;
    }
  });
  col.appendChild(track);

  const labels = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "MIN" });
  labels.primaryAxisSizingMode = "FIXED";
  labels.resize(w, labels.height);
  for (let i = 0; i < stages.length; i++) {
    const cellW = Math.floor((w - 8 * (stages.length - 1)) / stages.length);
    const cell = autoFrame({
      direction: "VERTICAL",
      cross: i === 0 ? "MIN" : i === stages.length - 1 ? "MAX" : "CENTER",
    });
    cell.counterAxisSizingMode = "FIXED";
    cell.resize(cellW, cell.height);
    cell.appendChild(
      await makeText(t, "caption", stages[i], i <= current ? "text/primary" : "text/muted", {
        maxWidth: cellW,
        align: i === 0 ? "LEFT" : i === stages.length - 1 ? "RIGHT" : "CENTER",
      }),
    );
    labels.appendChild(cell);
  }
  col.appendChild(labels);
  return col;
}

/**
 * Footer — the legally and practically required part: who sent this, why it
 * arrived, a one-click unsubscribe, and a postal address.
 */
async function footer(
  t: ThemeContext,
  w: number,
  reason: string,
  marketing = false,
  padX = PAD_X,
): Promise<FrameNode> {
  const wrap = autoFrame({ direction: "VERTICAL", gap: 0 });
  stretch(wrap);
  wrap.appendChild(divider(t, w + padX * 2));

  const f = block(t, { gap: 12, padY: 28, padX, cross: "CENTER", token: "bg/surface-raised" });

  const socials = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER", align: "CENTER" });
  for (const n of ["github", "globe", "mail"]) socials.appendChild(icon(t, n, 16, "text/muted"));
  f.appendChild(socials);

  f.appendChild(
    await makeText(t, "caption", reason, "text/muted", { align: "CENTER", maxWidth: w }),
  );

  if (marketing) {
    const links = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", align: "CENTER" });
    links.appendChild(await makeText(t, "label/sm", "Unsubscribe", "accent/primary"));
    links.appendChild(await makeText(t, "caption", "·", "text/muted"));
    links.appendChild(await makeText(t, "label/sm", "Email preferences", "accent/primary"));
    f.appendChild(links);
  }

  f.appendChild(
    await makeText(
      t,
      "caption",
      "Okryshto · Rue du Rhône 14, 1204 Geneva, Switzerland",
      "text/muted",
      {
        align: "CENTER",
        maxWidth: w,
      },
    ),
  );
  wrap.appendChild(f);
  return wrap;
}

// ── 01 · Verification code ────────────────────────────────────

async function mailVerifyCode(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "01-verify-code",
    subject: "Your verification code is 481 209",
    preheader: "Code expires in 10 minutes. If you didn't request it, ignore this email.",
  });

  body.appendChild(await brandBar(t, EMAIL_W));
  const main = block(t, { gap: 20 });
  main.appendChild(
    await lede(
      t,
      inner,
      "Confirm your email",
      `Enter this code to finish signing in as ${TO_ADDRESS}.`,
    ),
  );
  main.appendChild(await codeBlock(t, inner, "481209", "This code expires in 10 minutes."));
  main.appendChild(
    await callout(
      t,
      inner,
      "shield",
      "We'll never ask for this code by phone or chat. If you didn't request it, no action is needed.",
      "neutral",
    ),
  );
  body.appendChild(main);
  body.appendChild(
    await footer(t, inner, "You received this because someone signed in with this address."),
  );
  return shell;
}

// ── 02 · Magic link ───────────────────────────────────────────

async function mailMagicLink(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "02-magic-link",
    subject: "Your sign-in link",
    preheader: "One click and you're in — the link works once and expires in 15 minutes.",
  });

  body.appendChild(await brandBar(t, EMAIL_W));
  const main = block(t, { gap: 20 });
  main.appendChild(statusChip(t, "sparkles", "#5EE6C1", "accent/primary"));
  main.appendChild(
    await lede(
      t,
      inner,
      "Sign in without a password",
      "This link signs you in on the device you opened it on. It works once.",
    ),
  );
  main.appendChild(
    await cta(t, inner, "Sign in", {
      iconName: "arrow-right",
      fallbackUrl: "https://okryshto.dev/l/9fZ2…",
    }),
  );
  main.appendChild(
    await callout(
      t,
      inner,
      "clock",
      "The link expires in 15 minutes. Requesting a new one invalidates this one.",
      "neutral",
    ),
  );
  body.appendChild(main);
  body.appendChild(
    await footer(t, inner, "Sent because a sign-in was requested for this address."),
  );
  return shell;
}

// ── 03 · Password reset ───────────────────────────────────────

async function mailPasswordReset(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "03-password-reset",
    subject: "Reset your password",
    preheader: "The link is valid for 30 minutes. Didn't ask for this? Nothing has changed.",
  });

  body.appendChild(await brandBar(t, EMAIL_W));
  const main = block(t, { gap: 20 });
  main.appendChild(statusChip(t, "key", "#818CF8", "accent/secondary"));
  main.appendChild(
    await lede(
      t,
      inner,
      "Reset your password",
      "Pick a new password for your account. The link below works once.",
    ),
  );
  main.appendChild(
    await cta(t, inner, "Choose a new password", {
      iconName: "lock",
      fallbackUrl: "https://okryshto.dev/reset?token=…",
    }),
  );
  main.appendChild(divider(t, inner));
  main.appendChild(
    await para(
      t,
      inner,
      "Request from Chrome on macOS · Geneva, CH · 09:41 CET. If this wasn't you, your password is unchanged and you can ignore this email.",
      "text/muted",
    ),
  );
  body.appendChild(main);
  body.appendChild(
    await footer(t, inner, "You received this because a password reset was requested."),
  );
  return shell;
}

// ── 04 · Welcome ──────────────────────────────────────────────

async function mailWelcome(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "04-welcome",
    subject: "Welcome aboard — here's how to start",
    preheader: "Three short steps and your workspace is ready.",
  });

  body.appendChild(await brandBar(t, EMAIL_W));

  // Hero band: the only decorative moment; everything below is plain blocks.
  const hero = block(t, { gap: 16, padY: 40, cross: "CENTER", token: "bg/surface" });
  hero.clipsContent = true;
  const glow = auroraBlob(520, "#5EE6C1");
  glow.opacity = 0.16;
  hero.appendChild(glow);
  glow.layoutPositioning = "ABSOLUTE";
  glow.x = 40;
  glow.y = -260;
  hero.appendChild(statusChip(t, "rocket", "#5EE6C1", "accent/primary", 64));
  hero.appendChild(
    await lede(
      t,
      inner,
      "Welcome to Okryshto",
      "Your account is live. Here's the shortest path to something useful.",
      true,
    ),
  );
  body.appendChild(hero);

  const main = block(t, { gap: 24, padY: 8 });
  main.appendChild(
    await steps(t, inner, [
      ["Finish your profile", "A name and a photo so people know who they're talking to."],
      ["Connect a repository", "Import what you already ship — nothing to migrate."],
      ["Invite a teammate", "Everything here works better with a second pair of eyes."],
    ]),
  );
  main.appendChild(
    await cta(t, inner, "Open your workspace", { iconName: "arrow-right", full: true }),
  );
  body.appendChild(main);

  const help = block(t, { gap: 8, padY: 24, token: "bg/inset" });
  help.appendChild(await makeText(t, "label/sm", "Stuck on something?", "text/primary"));
  help.appendChild(
    await para(t, inner, "Reply to this email — it goes to a person, not a queue.", "text/muted"),
  );
  body.appendChild(divider(t, EMAIL_W));
  body.appendChild(help);

  body.appendChild(
    await footer(t, inner, "You received this because you created an account.", true),
  );
  return shell;
}

// ── 05 · Receipt ──────────────────────────────────────────────

async function mailReceipt(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "05-receipt",
    subject: "Receipt for your payment · €24.00",
    preheader: "Invoice #2026-0481 · paid 3 Aug 2026 · Visa ···· 4242",
  });

  body.appendChild(await brandBar(t, EMAIL_W, "View invoice"));
  const head = block(t, { gap: 12, padY: 28 });
  head.appendChild(
    await lede(
      t,
      inner,
      "Thanks — you're paid up",
      "This is the receipt for your Pro subscription. No action needed.",
    ),
  );
  head.appendChild(await dataRow(t, inner, "Invoice", "#2026-0481"));
  head.appendChild(await dataRow(t, inner, "Paid on", "3 August 2026"));
  head.appendChild(await dataRow(t, inner, "Method", "Visa ···· 4242"));
  body.appendChild(head);

  body.appendChild(divider(t, EMAIL_W));

  const items = block(t, { gap: 16, padY: 24 });
  items.appendChild(await makeText(t, "overline", "Summary", "text/muted"));
  items.appendChild(
    await lineItem(t, inner, "Pro plan · monthly", "3 Aug — 3 Sep 2026", "€20.00", "sparkles"),
  );
  items.appendChild(await lineItem(t, inner, "Extra seat", "1 × €4.00", "€4.00", "user"));
  items.appendChild(divider(t, inner));
  items.appendChild(await dataRow(t, inner, "Subtotal", "€24.00"));
  items.appendChild(await dataRow(t, inner, "VAT (0%)", "€0.00"));
  items.appendChild(await dataRow(t, inner, "Total paid", "€24.00", true));
  items.appendChild(await cta(t, inner, "Download PDF", { iconName: "download", secondary: true }));
  body.appendChild(items);

  body.appendChild(
    await footer(t, inner, "Receipts are sent for every payment and can't be turned off."),
  );
  return shell;
}

// ── 06 · Order shipped ────────────────────────────────────────

async function mailShipped(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "06-shipped",
    subject: "Your order is on its way",
    preheader: "Arriving Wednesday, 5 Aug · tracking DHL 4Z8812…",
  });

  body.appendChild(await brandBar(t, EMAIL_W, "Track order"));
  const main = block(t, { gap: 22 });
  main.appendChild(statusChip(t, "package", "#5EE6C1", "accent/primary"));
  main.appendChild(
    await lede(
      t,
      inner,
      "Your order shipped",
      "Order #4812 left the warehouse. Expected Wednesday, 5 August.",
    ),
  );
  main.appendChild(await progressTrack(t, inner, ["Ordered", "Packed", "Shipped", "Delivered"], 2));
  main.appendChild(await cta(t, inner, "Track your parcel", { iconName: "map-pin", full: true }));
  body.appendChild(main);

  body.appendChild(divider(t, EMAIL_W));

  const items = block(t, { gap: 14, padY: 24 });
  items.appendChild(await makeText(t, "overline", "In this shipment", "text/muted"));
  items.appendChild(
    await lineItem(t, inner, "Mechanical keyboard", "Qty 1 · black", "€129.00", "grid"),
  );
  items.appendChild(await lineItem(t, inner, "USB-C cable, 2m", "Qty 2", "€18.00", "zap"));
  items.appendChild(await dataRow(t, inner, "Shipping to", "Geneva, CH"));
  body.appendChild(items);

  body.appendChild(await footer(t, inner, "You received this because you placed an order."));
  return shell;
}

// ── 07 · Trial ending ─────────────────────────────────────────

async function mailTrialEnding(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "07-trial-ending",
    subject: "Your trial ends in 3 days",
    preheader: "Keep your workspace by adding a card — nothing is deleted before then.",
  });

  body.appendChild(await brandBar(t, EMAIL_W));
  const main = block(t, { gap: 20 });
  main.appendChild(statusChip(t, "clock", "#FBBF24", "feedback/warning"));
  main.appendChild(
    await lede(
      t,
      inner,
      "Your trial ends on 6 August",
      "After that your workspace switches to read-only. Add a card to keep everything as it is.",
    ),
  );
  main.appendChild(
    await metrics(t, inner, [
      ["12", "projects"],
      ["4", "teammates"],
      ["1.2k", "builds"],
    ]),
  );
  main.appendChild(
    await cta(t, inner, "Add a payment method", { iconName: "credit-card", full: true }),
  );
  main.appendChild(
    await callout(
      t,
      inner,
      "info",
      "Nothing is deleted. If you don't upgrade, your data stays for 30 days.",
      "warning",
    ),
  );
  body.appendChild(main);
  body.appendChild(
    await footer(t, inner, "Sent because your trial is ending — not a marketing email.", true),
  );
  return shell;
}

// ── 08 · Team invite ──────────────────────────────────────────

async function mailInvite(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "08-invite",
    subject: "Oleksii invited you to Design Systems",
    preheader: "Join the workspace — the invite expires in 7 days.",
  });

  body.appendChild(await brandBar(t, EMAIL_W));
  const main = block(t, { gap: 20 });

  // Who invited you, above everything — that's what makes the invite credible.
  const who = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER", padding: [12, 14] });
  who.primaryAxisSizingMode = "FIXED";
  who.resize(inner, who.height);
  who.cornerRadius = RADII.md;
  fillToken(t, who, "bg/inset");
  strokeToken(t, who, "border/subtle", 1);
  const av = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  fixedSize(av, 36, 36);
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
  av.appendChild(await makeText(t, "label/sm", SITE.brand, "accent/contrast"));
  who.appendChild(av);
  const whoCol = autoFrame({ direction: "VERTICAL", gap: 3, cross: "MIN" });
  whoCol.appendChild(await makeText(t, "label/sm", SITE.name, "text/primary"));
  whoCol.appendChild(await makeText(t, "caption", "Admin · Design Systems", "text/muted"));
  who.appendChild(whoCol);
  main.appendChild(who);

  main.appendChild(
    await lede(
      t,
      inner,
      "You've been invited to Design Systems",
      "Join as an Editor to review components, comment, and publish releases.",
    ),
  );
  main.appendChild(await dataRow(t, inner, "Workspace", "Design Systems"));
  main.appendChild(await dataRow(t, inner, "Your role", "Editor"));
  main.appendChild(await dataRow(t, inner, "Members", "12"));
  main.appendChild(
    await cta(t, inner, "Accept invitation", {
      iconName: "users",
      full: true,
      fallbackUrl: "https://okryshto.dev/invite/9fZ2…",
    }),
  );
  main.appendChild(
    await para(
      t,
      inner,
      "This invite expires in 7 days and is only valid for this address.",
      "text/muted",
    ),
  );
  body.appendChild(main);
  body.appendChild(
    await footer(
      t,
      inner,
      "You received this because someone invited this address to a workspace.",
    ),
  );
  return shell;
}

// ── 09 · Notification ─────────────────────────────────────────

async function mailNotification(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "09-notification",
    subject: "Maria mentioned you in Button / states",
    preheader: '"@oleksii can you confirm the focus ring here?" — reply from your inbox.',
  });

  body.appendChild(await brandBar(t, EMAIL_W));
  const main = block(t, { gap: 18 });
  main.appendChild(
    await lede(t, inner, "Maria mentioned you", "In the thread “Button / states” · Design Systems"),
  );

  // The quoted comment — the whole reason this email exists.
  const quote = autoFrame({ direction: "VERTICAL", gap: 8, cross: "MIN", padding: [16, 18] });
  quote.counterAxisSizingMode = "FIXED";
  quote.resize(inner, quote.height);
  quote.cornerRadius = RADII.md;
  fillToken(t, quote, "bg/inset");
  strokeToken(t, quote, "border/subtle", 1);
  const qHead = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
  qHead.primaryAxisSizingMode = "FIXED";
  qHead.resize(inner - 36, qHead.height);
  const qAv = ellipse(24);
  qAv.fills = [
    linearGradient(
      [
        { hex: "#818CF8", position: 0 },
        { hex: "#FF3D8B", position: 1 },
      ],
      "diagonal",
    ),
  ];
  qAv.strokes = [];
  qHead.appendChild(qAv);
  qHead.appendChild(await makeText(t, "label/sm", "Maria Novak", "text/primary"));
  qHead.appendChild(spacer());
  qHead.appendChild(await makeText(t, "caption", "2 min ago", "text/muted"));
  quote.appendChild(qHead);
  quote.appendChild(
    await makeText(
      t,
      "body/sm",
      "@oleksii can you confirm the focus ring here? I'd rather bind it to state/focus than hardcode the teal.",
      "text/secondary",
      {
        maxWidth: inner - 36,
      },
    ),
  );
  main.appendChild(quote);

  const actions = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "CENTER" });
  actions.primaryAxisSizingMode = "FIXED";
  actions.resize(inner, actions.height);
  // Explicit widths: a hugging button inside a fixed column overflows it.
  actions.appendChild(
    await cta(t, 212, "Reply in thread", { iconName: "message-square", full: true }),
  );
  actions.appendChild(
    await cta(t, 176, "Mark as read", { iconName: "check", secondary: true, full: true }),
  );
  main.appendChild(actions);
  body.appendChild(main);

  body.appendChild(
    await footer(
      t,
      inner,
      "You get these because you're watching this thread. Change what you're notified about in settings.",
      true,
    ),
  );
  return shell;
}

// ── 10 · Weekly digest ────────────────────────────────────────

async function mailDigest(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "10-digest",
    subject: "Your week: 18 merges, 3 releases",
    preheader: "Everything that moved between 27 July and 3 August.",
  });

  body.appendChild(await brandBar(t, EMAIL_W, "View online"));
  const head = block(t, { gap: 16, padY: 28 });
  head.appendChild(
    await makeText(t, "overline", "Weekly digest · 27 Jul — 3 Aug", "accent/primary"),
  );
  head.appendChild(
    await lede(t, inner, "Your week in review", "A quiet week on issues, a busy one on releases."),
  );
  head.appendChild(
    await metrics(t, inner, [
      ["18", "merged PRs"],
      ["3", "releases"],
      ["-42%", "open issues"],
    ]),
  );
  body.appendChild(head);

  body.appendChild(divider(t, EMAIL_W));

  const list = block(t, { gap: 20, padY: 26 });
  list.appendChild(await makeText(t, "overline", "Worth your attention", "text/muted"));
  list.appendChild(
    await articleRow(
      t,
      inner,
      "Release",
      "v2.4 — density modes everywhere",
      "Compact and comfortable now cascade from a single data attribute.",
      "package",
    ),
  );
  list.appendChild(
    await articleRow(
      t,
      inner,
      "Discussion",
      "Should tokens ship as CSS or JSON?",
      "14 replies, and a decision is close. Your vote is missing.",
      "message-circle",
    ),
  );
  list.appendChild(
    await articleRow(
      t,
      inner,
      "Guide",
      "Writing accessible focus states",
      "Six rules, one page, no libraries required.",
      "book-open",
    ),
  );
  list.appendChild(
    await cta(t, inner, "Open the dashboard", {
      iconName: "arrow-right",
      full: true,
      secondary: true,
    }),
  );
  body.appendChild(list);

  body.appendChild(
    await footer(t, inner, "You get this digest every Monday. One click below stops it.", true),
  );
  return shell;
}

// ── 11 · Product announcement ─────────────────────────────────

async function mailAnnouncement(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "11-announcement",
    subject: "New: density modes, in every component",
    preheader: "One attribute switches the whole system between compact and comfortable.",
  });

  body.appendChild(await brandBar(t, EMAIL_W, "View online"));

  // A single hero image slot — the one place a marketing email earns art.
  const hero = autoFrame({
    direction: "VERTICAL",
    align: "CENTER",
    cross: "CENTER",
    gap: 10,
    clip: true,
  });
  stretch(hero);
  fixedSize(hero, EMAIL_W, 220);
  hero.fills = [
    linearGradient(
      [
        { hex: "#0E4B3C", position: 0 },
        { hex: "#12131C", position: 1 },
      ],
      "diagonal",
    ),
  ];
  const blob = auroraBlob(420, "#5EE6C1");
  blob.opacity = 0.3;
  hero.appendChild(blob);
  blob.layoutPositioning = "ABSOLUTE";
  blob.x = 90;
  blob.y = -120;
  hero.appendChild(icon(t, "layers", 40, "accent/primary"));
  hero.appendChild(
    await makeText(t, "overline", "hero image · always ship alt text", "text/muted"),
  );
  body.appendChild(hero);

  const main = block(t, { gap: 20 });
  main.appendChild(await makeText(t, "overline", "What's new · v2.4", "accent/primary"));
  main.appendChild(
    await lede(
      t,
      inner,
      "Density, everywhere",
      "Compact for dense tables, comfortable for reading. One attribute, every component, no forked styles.",
    ),
  );
  main.appendChild(
    await steps(t, inner, [
      ["Two modes, one switch", "data-density on any container cascades to everything under it."],
      ["Nothing to migrate", "Existing components keep their current spacing by default."],
    ]),
  );
  main.appendChild(await cta(t, inner, "Read the release notes", { iconName: "external-link" }));
  body.appendChild(main);

  body.appendChild(
    await footer(t, inner, "You're on the product updates list because you asked to be.", true),
  );
  return shell;
}

// ── 12 · Plain text fallback ──────────────────────────────────

async function mailPlainText(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "12-plain-text",
    subject: "Your verification code is 481 209",
    preheader: "text/plain part — what a client shows when it refuses HTML.",
  });

  const main = block(t, { gap: 14, padY: 28 });
  main.appendChild(await makeText(t, "overline", "text/plain alternative", "accent/primary"));
  const lines = [
    "Confirm your email",
    "",
    "Your verification code is: 481209",
    "It expires in 10 minutes.",
    "",
    "If you didn't request this, you can ignore this email.",
    "",
    "--",
    "Okryshto",
    "Rue du Rhone 14, 1204 Geneva, Switzerland",
    "Unsubscribe: https://okryshto.dev/u/9fZ2",
  ];
  for (const line of lines) {
    main.appendChild(
      await makeText(t, "mono/sm", line === "" ? " " : line, "text/secondary", { maxWidth: inner }),
    );
  }
  body.appendChild(main);

  const note = block(t, { gap: 0, padY: 24, token: "bg/surface-raised" });
  note.appendChild(
    await callout(
      t,
      inner,
      "info",
      "Every HTML email ships this part too. It's what accessibility tools, watches and spam filters read.",
      "neutral",
    ),
  );
  body.appendChild(divider(t, EMAIL_W));
  body.appendChild(note);
  return shell;
}

// ── 13 · Mobile rendering ─────────────────────────────────────

async function mailMobile(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "13-mobile",
    subject: "Welcome aboard — here's how to start",
    preheader: "Three short steps and your workspace is ready.",
    mobile: true,
  });

  body.appendChild(await brandBar(t, MOBILE_W, "View in browser", 24));

  const hero = block(t, { gap: 14, padX: 24, padY: 28, cross: "CENTER" });
  hero.appendChild(statusChip(t, "rocket", "#5EE6C1", "accent/primary", 56));
  hero.appendChild(
    await lede(
      t,
      inner,
      "Welcome to Okryshto",
      "Your account is live. Here's the shortest path to something useful.",
      true,
    ),
  );
  body.appendChild(hero);

  const main = block(t, { gap: 20, padX: 24, padY: 8 });
  main.appendChild(
    await steps(t, inner, [
      ["Finish your profile", "A name and a photo so people know who they're talking to."],
      ["Connect a repository", "Import what you already ship."],
    ]),
  );
  // Full-width CTA on mobile: a hugging button is a missed tap.
  main.appendChild(
    await cta(t, inner, "Open your workspace", { iconName: "arrow-right", full: true }),
  );
  body.appendChild(main);

  body.appendChild(
    await footer(t, inner, "You received this because you created an account.", true, 24),
  );
  return shell;
}

// ── Termin watcher (ntfy) ─────────────────────────────────────

/**
 * The one alert that has to work at a glance: a slot opened at the
 * Ausländerbehörde. Date and time are the message — everything else is
 * supporting detail, so they get the size, the weight and the accent colour,
 * and every other element is deliberately de-emphasised around them.
 *
 * Single source of truth for the sample slot, so the email, the digest and the
 * push mocks can never drift apart.
 */
const TERMIN = {
  office: "Ausländerbehörde München",
  service: "Aufenthaltstitel · Verlängerung",
  address: "Ruppertstraße 19, 80337 München",
  room: "Halle A · Schalter 12",
  weekday: "Mittwoch",
  dateLong: "Mittwoch, 12. August 2026",
  dateShort: "Mi, 12.08.2026",
  month: "AUG",
  day: "12",
  time: "09:20",
  timeRange: "09:20 – 09:40 Uhr",
  duration: "20 Min",
  foundAt: "gefunden um 07:14 · vor 2 Minuten",
  topic: "abh-termin-muc",
} as const;

/** Date-as-object: a calendar tile beats a sentence for a date you must act on. */
async function calendarChip(
  t: ThemeContext,
  month: string,
  day: string,
  weekday: string,
  size = 88,
): Promise<FrameNode> {
  const chip = autoFrame({ direction: "VERTICAL", gap: 0, cross: "CENTER", clip: true });
  fixedSize(chip, size, size);
  chip.cornerRadius = RADII.md;
  fillToken(t, chip, "bg/inset");
  strokeToken(t, chip, "border/default", 1);

  const band = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  fixedSize(band, size, 22);
  fillToken(t, band, "accent/primary");
  band.appendChild(await makeText(t, "overline", month, "accent/contrast"));
  chip.appendChild(band);

  const rest = autoFrame({ direction: "VERTICAL", gap: 0, cross: "CENTER", align: "CENTER" });
  fixedSize(rest, size, size - 22);
  rest.appendChild(await makeText(t, "display/lg", day, "text/primary"));
  rest.appendChild(await makeText(t, "caption", weekday, "text/muted"));
  chip.appendChild(rest);
  return chip;
}

/** The slot itself — calendar tile left, date + time right. */
async function slotCard(t: ThemeContext, w: number): Promise<FrameNode> {
  const card = autoFrame({ direction: "HORIZONTAL", gap: 18, cross: "CENTER", padding: [20, 20] });
  card.primaryAxisSizingMode = "FIXED";
  card.counterAxisSizingMode = "AUTO";
  card.resize(w, card.height);
  card.cornerRadius = RADII.lg;
  fillToken(t, card, "bg/surface-raised");
  strokeToken(t, card, "accent/primary", 1);

  card.appendChild(await calendarChip(t, TERMIN.month, TERMIN.day, TERMIN.weekday.slice(0, 2)));

  const col = autoFrame({ direction: "VERTICAL", gap: 6, cross: "MIN" });
  col.counterAxisSizingMode = "FIXED";
  col.resize(w - 40 - 88 - 18, col.height);
  col.appendChild(await makeText(t, "label/md", TERMIN.dateLong, "text/secondary"));
  // The time is the payload of the whole email — nothing else gets this size.
  col.appendChild(await makeText(t, "display/lg", TERMIN.timeRange, "accent/primary"));
  const meta = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  meta.appendChild(icon(t, "clock", 13, "text/muted"));
  meta.appendChild(
    await makeText(t, "caption", `${TERMIN.duration} · ${TERMIN.foundAt}`, "text/muted"),
  );
  col.appendChild(meta);
  card.appendChild(col);
  return card;
}

/** 14 · The alert itself. */
async function mailTerminAlert(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "14-termin-alert",
    subject: `Termin frei: ${TERMIN.dateShort} · ${TERMIN.time} Uhr`,
    preheader: `${TERMIN.office} · ${TERMIN.service} — jetzt buchen, Termine sind meist in Minuten weg.`,
  });

  // Accent stripe: the cheapest way to say "this one is different" before a
  // single word is read.
  const stripe = rect(EMAIL_W, 4);
  fillToken(t, stripe, "accent/primary");
  body.appendChild(stripe);
  body.appendChild(await brandBar(t, EMAIL_W, "Im Browser öffnen"));

  const main = block(t, { gap: 20 });
  const kicker = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  kicker.appendChild(icon(t, "bell", 14, "accent/primary"));
  kicker.appendChild(await makeText(t, "overline", "Freier Termin gefunden", "accent/primary"));
  main.appendChild(kicker);

  main.appendChild(
    await makeText(t, "heading/h3", TERMIN.office, "text/primary", { maxWidth: inner }),
  );
  main.appendChild(await slotCard(t, inner));
  main.appendChild(
    await cta(t, inner, "Termin jetzt buchen", {
      iconName: "arrow-right",
      full: true,
      fallbackUrl: "https://stadt.muenchen.de/buergerservice/terminvereinbarung",
    }),
  );
  main.appendChild(
    await callout(
      t,
      inner,
      "alert-triangle",
      "Freie Termine sind meist innerhalb weniger Minuten wieder weg. Der Link führt direkt in die Buchung.",
      "warning",
    ),
  );
  body.appendChild(main);

  body.appendChild(divider(t, EMAIL_W));

  const details = block(t, { gap: 12, padY: 24 });
  details.appendChild(await makeText(t, "overline", "Details", "text/muted"));
  details.appendChild(await dataRow(t, inner, "Dienstleistung", TERMIN.service));
  details.appendChild(await dataRow(t, inner, "Standort", TERMIN.address));
  details.appendChild(await dataRow(t, inner, "Wo", TERMIN.room));
  details.appendChild(await dataRow(t, inner, "Datum", TERMIN.dateLong, true));
  details.appendChild(await dataRow(t, inner, "Uhrzeit", TERMIN.timeRange, true));
  details.appendChild(
    await cta(t, inner, "Alle freien Termine ansehen", { iconName: "calendar", secondary: true }),
  );
  body.appendChild(details);

  body.appendChild(
    await footer(
      t,
      inner,
      `Automatische Benachrichtigung vom Termin-Watcher · ntfy-Topic ${TERMIN.topic} · Prüfung alle 60 Sekunden.`,
    ),
  );
  return shell;
}

/** 15 · Several slots at once — the same data, as a scannable list. */
async function mailTerminDigest(t: ThemeContext): Promise<FrameNode> {
  const { shell, body, inner } = await clientShell(t, {
    name: "15-termin-digest",
    subject: "4 freie Termine: 12.08. – 19.08.",
    preheader: "Frühester Termin: Mi, 12.08. um 09:20 Uhr.",
  });

  const stripe = rect(EMAIL_W, 4);
  fillToken(t, stripe, "accent/primary");
  body.appendChild(stripe);
  body.appendChild(await brandBar(t, EMAIL_W, "Im Browser öffnen"));

  const head = block(t, { gap: 14 });
  head.appendChild(await makeText(t, "overline", "4 freie Termine", "accent/primary"));
  head.appendChild(
    await lede(t, inner, "Ausländerbehörde München", `${TERMIN.service} · Stand 07:14 Uhr`),
  );
  body.appendChild(head);

  // Rows, not paragraphs: the eye compares times down a column.
  const slots: Array<[string, string, string, boolean]> = [
    ["AUG", "12", "Mi · 09:20 – 09:40 Uhr", true],
    ["AUG", "12", "Mi · 14:00 – 14:20 Uhr", false],
    ["AUG", "15", "Sa · 08:40 – 09:00 Uhr", false],
    ["AUG", "19", "Mi · 11:20 – 11:40 Uhr", false],
  ];
  const list = block(t, { gap: 10, padY: 8 });
  for (const [month, day, when, first] of slots) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER", padding: [12, 14] });
    row.primaryAxisSizingMode = "FIXED";
    row.counterAxisSizingMode = "AUTO";
    row.resize(inner, row.height);
    row.cornerRadius = RADII.md;
    fillToken(t, row, first ? "bg/surface-raised" : "bg/inset");
    strokeToken(t, row, first ? "accent/primary" : "border/subtle", 1);

    row.appendChild(await calendarChip(t, month, day, "", 44));
    const col = autoFrame({ direction: "VERTICAL", gap: 3, cross: "MIN" });
    col.appendChild(await makeText(t, "label/md", when, "text/primary"));
    col.appendChild(
      await makeText(
        t,
        "caption",
        first ? "frühester Termin" : "verfügbar",
        first ? "accent/primary" : "text/muted",
      ),
    );
    row.appendChild(col);
    row.appendChild(spacer());
    row.appendChild(await makeText(t, "label/sm", "Buchen", "accent/primary"));
    row.appendChild(icon(t, "arrow-right", 14, "accent/primary"));
    list.appendChild(row);
  }
  body.appendChild(list);

  const foot = block(t, { gap: 14, padY: 24 });
  foot.appendChild(
    await cta(t, inner, "Zur Terminbuchung", { iconName: "external-link", full: true }),
  );
  foot.appendChild(
    await para(
      t,
      inner,
      "Termine werden nicht reserviert. Wer zuerst bucht, bekommt ihn.",
      "text/muted",
    ),
  );
  body.appendChild(foot);

  body.appendChild(
    await footer(
      t,
      inner,
      `Termin-Watcher · ntfy-Topic ${TERMIN.topic} · Zusammenfassung statt Einzelmeldungen.`,
    ),
  );
  return shell;
}

// ── ntfy push mocks ───────────────────────────────────────────

interface Phone {
  shell: FrameNode;
  screen: FrameNode;
}

/** A phone with a dark wallpaper — the surface a push actually lands on. */
async function phoneShell(t: ThemeContext, name: string, label: string): Promise<Phone> {
  const shell = autoFrame({ direction: "VERTICAL", gap: 0, clip: true });
  shell.name = `push/${name}`;
  fixedSize(shell, 390, 780);
  shell.cornerRadius = RADII["3xl"];
  fillToken(t, shell, "bg/canvas");
  strokeToken(t, shell, "border/strong", 1);

  const screen = autoFrame({ direction: "VERTICAL", gap: 0, clip: true });
  fixedSize(screen, 390, 780);
  screen.fills = [
    linearGradient(
      [
        { hex: "#101A22", position: 0 },
        { hex: "#0A0A0B", position: 1 },
      ],
      "vertical",
    ),
  ];
  const blob = auroraBlob(520, "#5EE6C1");
  blob.opacity = 0.14;
  screen.appendChild(blob);
  blob.layoutPositioning = "ABSOLUTE";
  blob.x = -60;
  blob.y = -220;
  shell.appendChild(screen);

  // Status bar.
  const status = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", padding: [14, 22] });
  fixedSize(status, 390, 44);
  status.appendChild(await makeText(t, "label/sm", "07:16", "text/primary"));
  status.appendChild(spacer());
  for (const n of ["wifi", "battery"]) status.appendChild(icon(t, n, 14, "text/primary"));
  screen.appendChild(status);

  const cap = autoFrame({
    direction: "HORIZONTAL",
    gap: 0,
    align: "CENTER",
    cross: "CENTER",
    padding: [6, 20],
  });
  fixedSize(cap, 390, 28);
  cap.appendChild(await makeText(t, "overline", label, "text/muted"));
  screen.appendChild(cap);

  return { shell, screen };
}

/**
 * One ntfy notification. Android collapses to two lines and Apple truncates the
 * title, so the date and time live in the *title* — never only in the body.
 */
async function ntfyCard(
  t: ThemeContext,
  w: number,
  o: { title: string; text: string; when: string; expanded?: boolean; priority?: string },
): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 10, cross: "MIN", padding: [14, 16] });
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "FIXED";
  card.resize(w, card.height);
  card.cornerRadius = RADII.lg;
  fillToken(t, card, "glass/fill-strong");
  strokeToken(t, card, "glass/border", 1);

  const head = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  head.primaryAxisSizingMode = "FIXED";
  head.resize(w - 32, head.height);
  const app = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  fixedSize(app, 20, 20);
  app.cornerRadius = RADII.sm;
  fillToken(t, app, "accent/primary");
  app.appendChild(icon(t, "bell", 12, "accent/contrast"));
  head.appendChild(app);
  head.appendChild(await makeText(t, "caption", `ntfy · ${TERMIN.topic}`, "text/secondary"));
  if (o.priority) {
    const pill = autoFrame({ direction: "HORIZONTAL", gap: 4, cross: "CENTER", padding: [2, 8] });
    pill.cornerRadius = RADII.full;
    pill.fills = [aa("#F87171", 0.16)];
    pill.appendChild(await makeText(t, "caption", o.priority, "feedback/danger"));
    head.appendChild(pill);
  }
  head.appendChild(spacer());
  head.appendChild(await makeText(t, "caption", o.when, "text/muted"));
  card.appendChild(head);

  card.appendChild(await makeText(t, "label/md", o.title, "text/primary", { maxWidth: w - 32 }));
  card.appendChild(await makeText(t, "body/sm", o.text, "text/secondary", { maxWidth: w - 32 }));

  if (o.expanded) {
    card.appendChild(divider(t, w - 32));
    const actions = autoFrame({
      direction: "HORIZONTAL",
      gap: 22,
      cross: "CENTER",
      padding: [4, 0],
    });
    actions.primaryAxisSizingMode = "FIXED";
    actions.resize(w - 32, actions.height);
    actions.appendChild(await makeText(t, "label/sm", "TERMIN BUCHEN", "accent/primary"));
    actions.appendChild(await makeText(t, "label/sm", "SPÄTER", "text/muted"));
    card.appendChild(actions);
  }
  return card;
}

/** 16 · Lock screen — the state that matters, since the alert arrives at 07:14. */
async function pushLockScreen(t: ThemeContext): Promise<FrameNode> {
  const { shell, screen } = await phoneShell(t, "16-lockscreen", "Lock screen");

  const clock = autoFrame({
    direction: "VERTICAL",
    gap: 2,
    cross: "CENTER",
    align: "CENTER",
    padding: [40, 0],
  });
  fullWidth(clock, 390);
  clock.appendChild(await makeText(t, "display/2xl", "07:16", "text/primary"));
  clock.appendChild(await makeText(t, "body/sm", "Dienstag, 4. August", "text/secondary"));
  screen.appendChild(clock);

  const stack = autoFrame({ direction: "VERTICAL", gap: 10, padding: [16, 16] });
  fullWidth(stack, 390);
  stack.appendChild(
    await ntfyCard(t, 358, {
      title: `Termin frei: ${TERMIN.dateShort}, ${TERMIN.time} Uhr`,
      text: `${TERMIN.office} · ${TERMIN.service}. Tippen zum Buchen.`,
      when: "jetzt",
      priority: "urgent",
    }),
  );
  stack.appendChild(
    await ntfyCard(t, 358, {
      title: "Termin frei: Sa, 15.08.2026, 08:40 Uhr",
      text: `${TERMIN.office} · zweiter freier Slot.`,
      when: "vor 1 Min",
    }),
  );
  screen.appendChild(stack);
  return shell;
}

/** 17 · Expanded notification, with the one action that matters. */
async function pushExpanded(t: ThemeContext): Promise<FrameNode> {
  const { shell, screen } = await phoneShell(t, "17-expanded", "Notification shade · expanded");

  const stack = autoFrame({ direction: "VERTICAL", gap: 12, padding: [16, 16] });
  fullWidth(stack, 390);
  stack.appendChild(
    await ntfyCard(t, 358, {
      title: `Termin frei: ${TERMIN.dateShort}, ${TERMIN.time} Uhr`,
      text: `${TERMIN.office}, ${TERMIN.room}. ${TERMIN.timeRange} · ${TERMIN.duration}. Termine sind meist in Minuten weg.`,
      when: "vor 2 Min",
      priority: "urgent",
      expanded: true,
    }),
  );

  // In-app view: the same slot, with room to breathe.
  const app = autoFrame({ direction: "VERTICAL", gap: 14, cross: "MIN", padding: 16 });
  app.counterAxisSizingMode = "FIXED";
  app.resize(358, app.height);
  app.cornerRadius = RADII.lg;
  fillToken(t, app, "bg/surface");
  strokeToken(t, app, "border/default", 1);
  const appHead = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
  appHead.primaryAxisSizingMode = "FIXED";
  appHead.resize(326, appHead.height);
  appHead.appendChild(icon(t, "bell", 14, "accent/primary"));
  appHead.appendChild(await makeText(t, "overline", `ntfy · ${TERMIN.topic}`, "text/muted"));
  app.appendChild(appHead);
  app.appendChild(await slotCard(t, 326));
  app.appendChild(await cta(t, 326, "Termin buchen", { iconName: "external-link", full: true }));
  stack.appendChild(app);

  screen.appendChild(stack);
  return shell;
}

/** 18 · The payload that produces the two mocks above. */
async function ntfyPayloadBoard(t: ThemeContext): Promise<FrameNode> {
  const W = SHELL_W;
  const board = autoFrame({ direction: "VERTICAL", gap: 18, padding: 32 });
  board.name = "push/18-payload";
  board.counterAxisSizingMode = "FIXED";
  board.resize(W, board.height);
  board.cornerRadius = RADII.xl;
  fillToken(t, board, "bg/surface");
  strokeToken(t, board, "border/subtle", 1);
  const inner = W - 64;

  board.appendChild(await makeText(t, "overline", "ntfy payload", "accent/primary"));
  board.appendChild(await makeText(t, "heading/h3", "Was der Watcher sendet", "text/primary"));
  board.appendChild(
    await makeText(
      t,
      "body/sm",
      "Datum und Uhrzeit gehören in den Titel: Android kürzt den Body auf zwei Zeilen, iOS die Vorschau. Der Body trägt nur Kontext.",
      "text/secondary",
      { maxWidth: inner },
    ),
  );

  const code = autoFrame({ direction: "VERTICAL", gap: 3, cross: "MIN", padding: 18 });
  code.counterAxisSizingMode = "FIXED";
  code.resize(inner, code.height);
  code.cornerRadius = RADII.md;
  fillToken(t, code, "bg/inset");
  strokeToken(t, code, "border/default", 1);
  const lines = [
    "POST https://ntfy.sh/" + TERMIN.topic,
    "{",
    `  "title":    "Termin frei: ${TERMIN.dateShort}, ${TERMIN.time} Uhr",`,
    `  "message":  "${TERMIN.office}\\n${TERMIN.service}\\n${TERMIN.timeRange} (${TERMIN.duration})",`,
    '  "priority": 5,',
    '  "tags":     ["calendar", "de"],',
    '  "click":    "https://stadt.muenchen.de/…/termin",',
    '  "actions":  [{ "action": "view", "label": "Termin buchen",',
    '                 "url": "https://stadt.muenchen.de/…/termin" }]',
    "}",
  ];
  for (const line of lines) {
    code.appendChild(
      await makeText(t, "mono/sm", line === "" ? " " : line, "text/secondary", {
        maxWidth: inner - 36,
      }),
    );
  }
  board.appendChild(code);

  const notes: Array<[string, string, string]> = [
    [
      "clock",
      "Zeit zuerst",
      "Datum + Uhrzeit im Titel, damit die gesperrte Anzeige schon alles sagt.",
    ],
    ["zap", "priority 5", "Umgeht Do-not-disturb — nur für echte Treffer, sonst stumpft es ab."],
    ["link", "click + action", "Ein Tap führt direkt in die Buchung, nicht auf die Startseite."],
  ];
  for (const [iconName, title, text] of notes) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 12, cross: "MIN" });
    row.primaryAxisSizingMode = "FIXED";
    row.resize(inner, row.height);
    const chip = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    fixedSize(chip, 28, 28);
    chip.cornerRadius = RADII.sm;
    chip.fills = [aa("#5EE6C1", 0.14)];
    chip.appendChild(icon(t, iconName, 15, "accent/primary"));
    row.appendChild(chip);
    const col = autoFrame({ direction: "VERTICAL", gap: 3, cross: "MIN" });
    col.counterAxisSizingMode = "FIXED";
    col.resize(inner - 40, col.height);
    col.appendChild(await makeText(t, "label/sm", title, "text/primary"));
    col.appendChild(await makeText(t, "caption", text, "text/muted", { maxWidth: inner - 40 }));
    row.appendChild(col);
    board.appendChild(row);
  }
  return board;
}

// ── 00 · The rules board ──────────────────────────────────────

/** Why every email above looks the way it does — the constraints, in one place. */
async function rulesBoard(t: ThemeContext): Promise<FrameNode> {
  const W = SHELL_W * 2 + GAP_X;
  const board = autoFrame({ direction: "VERTICAL", gap: 24, padding: 40 });
  board.name = "email/00-rules";
  board.counterAxisSizingMode = "FIXED";
  board.resize(W, board.height);
  board.cornerRadius = RADII.xl;
  fillToken(t, board, "bg/surface");
  strokeToken(t, board, "border/subtle", 1);

  const inner = W - 80;
  board.appendChild(await makeText(t, "overline", "Anatomy & rules", "accent/primary"));
  board.appendChild(await makeText(t, "display/lg", "Email is not the web", "text/primary"));
  board.appendChild(
    await makeText(
      t,
      "body/md",
      "No flex, no grid, no external stylesheets, and a renderer that may be twenty years old. These are the constraints every template on this page obeys.",
      "text/secondary",
      { maxWidth: 720 },
    ),
  );

  const rules: Array<[string, string, string]> = [
    [
      "maximize",
      "600px body, one column",
      "The only width every client agrees on. One column survives every viewport — two columns collapse unpredictably.",
    ],
    [
      "type",
      "Web-safe fonts with a stack",
      "Custom fonts silently fall back. Declare the fallback you actually want; never let a client pick.",
    ],
    [
      "eye",
      "Write the preheader",
      "The 40–90 characters shown next to the subject. Unset, clients leak whatever text comes first.",
    ],
    [
      "target",
      "Bulletproof CTAs, 48px tall",
      "A padded box with real text — never a background image, never an image-only button. Repeat the URL below it.",
    ],
    [
      "image",
      "Images are optional",
      "Half of inboxes block them by default. Every image needs alt text, and the email must make sense with none loaded.",
    ],
    [
      "moon",
      "Design for dark mode",
      "Clients invert colors on their own. Avoid pure white boxes and transparent PNG logos with dark artwork.",
    ],
    [
      "file",
      "Ship a text/plain part",
      "Read by watches, screen readers and spam filters. An HTML-only email scores worse and reads worse.",
    ],
    [
      "log-out",
      "One-click unsubscribe",
      "Required for anything not strictly transactional, plus a postal address and the reason this email arrived.",
    ],
    [
      "smartphone",
      "Single tap target per row",
      "Stacked, full-width buttons at 360px. Side-by-side links land on the wrong one.",
    ],
    [
      "mail",
      "Subject ≤ 45 characters",
      "It's truncated on mobile. Front-load the noun that matters — the code, the amount, the name.",
    ],
  ];

  const grid = autoFrame({ direction: "HORIZONTAL", gap: 20, cross: "MIN", wrap: true });
  fullWidth(grid, inner);
  grid.counterAxisSpacing = 20;
  const cellW = Math.floor((inner - 40) / 3);
  for (const [iconName, title, text] of rules) {
    const cell = autoFrame({ direction: "VERTICAL", gap: 10, cross: "MIN", padding: 20 });
    // Uniform cells so the wrap reads as a grid rather than a ragged stack.
    fixedSize(cell, cellW, 148);
    cell.cornerRadius = RADII.md;
    fillToken(t, cell, "bg/inset");
    strokeToken(t, cell, "border/subtle", 1);

    const head = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER" });
    const chip = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
    fixedSize(chip, 28, 28);
    chip.cornerRadius = RADII.sm;
    chip.fills = [aa("#5EE6C1", 0.14)];
    chip.appendChild(icon(t, iconName, 15, "accent/primary"));
    head.appendChild(chip);
    head.appendChild(
      await makeText(t, "label/sm", title, "text/primary", { maxWidth: cellW - 80 }),
    );
    cell.appendChild(head);
    cell.appendChild(await makeText(t, "caption", text, "text/muted", { maxWidth: cellW - 40 }));
    grid.appendChild(cell);
  }
  board.appendChild(grid);
  return board;
}

// ── Page ──────────────────────────────────────────────────────

interface Screen {
  node: FrameNode;
  cap: string;
}

interface Group {
  title: string;
  note: string;
  screens: Screen[];
  perRow?: number;
}

export async function paintTemplateEmails(t: ThemeContext, page: PageNode): Promise<void> {
  const label = await makeText(
    t,
    "overline",
    "17 · Template (Emails) — DESIGN ONLY · transactional & lifecycle email patterns",
    "accent/primary",
  );
  page.appendChild(label);
  label.x = 0;
  label.y = -84;

  const groups: Group[] = [
    {
      title: "Rules",
      note: "The constraints email imposes, and what the templates below do about them.",
      perRow: 1,
      screens: [
        {
          node: await rulesBoard(t),
          cap: "00 · Anatomy — 600px, one column, and the nine rules that follow from it.",
        },
      ],
    },
    {
      title: "Termin watcher (ntfy)",
      note: "A slot opened at the Ausländerbehörde. Date and time are the whole message — they get the size, the accent and the title of the push; everything else is context.",
      screens: [
        {
          node: await mailTerminAlert(t),
          cap: "14 · Termin alert — calendar tile + time, one booking CTA.",
        },
        {
          node: await mailTerminDigest(t),
          cap: "15 · Several slots — one row per slot, earliest highlighted.",
        },
        {
          node: await pushLockScreen(t),
          cap: "16 · ntfy lock screen — date & time live in the title.",
        },
        {
          node: await pushExpanded(t),
          cap: "17 · Expanded + in-app — the action, one tap from booking.",
        },
        {
          node: await ntfyPayloadBoard(t),
          cap: "18 · Payload — the JSON that produces both mocks.",
        },
      ],
    },
    {
      title: "Account",
      note: "The four emails every product sends. Short, single-purpose, and no marketing anywhere near them.",
      screens: [
        {
          node: await mailVerifyCode(t),
          cap: "01 · Verification code — the code is in the subject line too.",
        },
        {
          node: await mailMagicLink(t),
          cap: "02 · Magic link — one CTA, plus the URL for clients that eat buttons.",
        },
        {
          node: await mailPasswordReset(t),
          cap: "03 · Password reset — states where the request came from.",
        },
        {
          node: await mailWelcome(t),
          cap: "04 · Welcome — three steps, one action, a human reply address.",
        },
      ],
    },
    {
      title: "Billing & orders",
      note: "Money emails get opened. They earn detail — but the number still comes first.",
      screens: [
        {
          node: await mailReceipt(t),
          cap: "05 · Receipt — amount in the subject, itemised below, PDF at the end.",
        },
        {
          node: await mailShipped(t),
          cap: "06 · Shipped — status track, then tracking, then contents.",
        },
        {
          node: await mailTrialEnding(t),
          cap: "07 · Trial ending — what you'd lose, then how to keep it.",
        },
      ],
    },
    {
      title: "Collaboration & lifecycle",
      note: "Emails that pull someone back into the product. Everything here needs a working unsubscribe.",
      screens: [
        {
          node: await mailInvite(t),
          cap: "08 · Invite — the inviter first; that's what makes it credible.",
        },
        {
          node: await mailNotification(t),
          cap: "09 · Notification — quotes the comment so the email is enough.",
        },
        {
          node: await mailDigest(t),
          cap: "10 · Weekly digest — numbers, then three things worth a click.",
        },
        {
          node: await mailAnnouncement(t),
          cap: "11 · Announcement — one hero, one feature, one link.",
        },
      ],
    },
    {
      title: "Fallbacks",
      note: "How the same email renders when the client refuses HTML, or is 360px wide.",
      screens: [
        {
          node: await mailPlainText(t),
          cap: "12 · Plain text — the text/plain part every HTML email ships with.",
        },
        { node: await mailMobile(t), cap: "13 · Mobile — 360px, 24px gutters, full-width CTA." },
      ],
    },
  ];

  let y = 0;
  for (const group of groups) {
    const title = await makeText(t, "display/lg", group.title, "text/primary");
    page.appendChild(title);
    title.x = 0;
    title.y = y;
    const note = await makeText(t, "body/md", group.note, "text/muted", { maxWidth: 720 });
    page.appendChild(note);
    note.x = 0;
    note.y = y + 58;
    y += 130;

    // Rows are as tall as their tallest frame; emails vary a lot in length.
    const perRow = group.perRow ?? 2;
    let x = 0;
    let rowH = 0;
    for (let i = 0; i < group.screens.length; i++) {
      const s = group.screens[i];
      const cap = await makeText(t, "overline", s.cap, "text/muted");
      page.appendChild(cap);
      cap.x = x;
      cap.y = y - 30;
      page.appendChild(s.node);
      s.node.x = x;
      s.node.y = y;
      rowH = Math.max(rowH, s.node.height);

      const lastInRow = i % perRow === perRow - 1 || i === group.screens.length - 1;
      if (lastInRow) {
        x = 0;
        y += rowH + GAP_Y;
        rowH = 0;
      } else {
        x += s.node.width + GAP_X;
      }
    }

    y += 80; // breathing room before the next group
  }
}
