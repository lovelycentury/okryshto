/**
 * Template (Login) — DESIGN ONLY. The login patterns worth stealing, each as an
 * annotated screen: centered card, split screen, magic link, SSO-first,
 * two-step, OTP, the error state, and mobile.
 *
 * Every screen is built from the same field / button / divider helpers, so the
 * variants differ in structure rather than in styling drift.
 */

import { RADII, SITE } from "../tokens";
import { linearGradient, solid } from "../core/color";
import { autoFrame, fixedSize, spacer } from "../core/layout";
import { auroraBlob, ellipse, fillToken, makeText, rect, strokeToken } from "../core/nodes";
import { icon } from "../core/icons";
import { logoLockup } from "../core/logo";
import { ThemeContext } from "../core/theme";
import { applyEffect } from "../components/primitives";

const FRAME_W = 1160;
const FRAME_H = 780;
const CHROME_H = 44;
const BODY_H = FRAME_H - CHROME_H;

const MOBILE_W = 390;
const MOBILE_H = 780;

const CARD_W = 420;
const GAP_X = 90;
const GAP_Y = 130;

function aa(hex: string, a: number): SolidPaint {
  return { ...solid(hex), opacity: a } as SolidPaint;
}

// ── Browser chrome ────────────────────────────────────────────

async function browserShell(
  t: ThemeContext,
  url: string,
  name: string,
  w = FRAME_W,
  h = FRAME_H,
): Promise<{ shell: FrameNode; body: FrameNode }> {
  const shell = figma.createFrame();
  shell.name = `login/${name}`;
  shell.resize(w, h);
  shell.cornerRadius = RADII.xl;
  shell.clipsContent = true;
  shell.layoutMode = "VERTICAL";
  shell.primaryAxisSizingMode = "FIXED";
  shell.counterAxisSizingMode = "FIXED";
  fillToken(t, shell, "bg/canvas");
  strokeToken(t, shell, "border/subtle", 1);

  const chrome = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [0, 16] });
  fixedSize(chrome, w, CHROME_H);
  fillToken(t, chrome, "bg/surface");
  for (const hex of ["#FF5F57", "#FEBC2E", "#28C840"]) {
    const dot = ellipse(10);
    dot.fills = [aa(hex, 0.85)];
    dot.strokes = [];
    chrome.appendChild(dot);
  }
  const bar = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    cross: "CENTER",
    align: "CENTER",
    padding: [5, 14],
  });
  bar.cornerRadius = RADII.full;
  fillToken(t, bar, "bg/inset");
  bar.appendChild(icon(t, "lock", 12, "text/muted"));
  bar.appendChild(await makeText(t, "mono/sm", url, "text/muted"));
  chrome.appendChild(spacer());
  chrome.appendChild(bar);
  chrome.appendChild(spacer());
  shell.appendChild(chrome);

  const body = figma.createFrame();
  body.name = "body";
  body.resize(w, h - CHROME_H);
  body.clipsContent = true;
  fillToken(t, body, "bg/canvas");
  shell.appendChild(body);
  return { shell, body };
}

/** Soft aurora behind a screen so the card reads as glass on something. */
function atmosphere(
  host: FrameNode,
  spots: Array<{ hex: string; size: number; x: number; y: number; op: number }>,
): void {
  for (const s of spots) {
    const blob = auroraBlob(s.size, s.hex);
    blob.opacity = s.op;
    host.appendChild(blob);
    blob.x = s.x - s.size / 2;
    blob.y = s.y - s.size / 2;
  }
}

// ── Form atoms ────────────────────────────────────────────────

type FieldState = "Default" | "Focus" | "Filled" | "Error";

async function field(
  t: ThemeContext,
  w: number,
  label: string,
  placeholder: string,
  o: { state?: FieldState; iconName?: string; trailingIcon?: string; hint?: string } = {},
): Promise<FrameNode> {
  const state = o.state ?? "Default";
  const col = autoFrame({ direction: "VERTICAL", gap: 8, cross: "MIN" });
  col.counterAxisSizingMode = "FIXED";
  col.resize(w, col.height);

  col.appendChild(await makeText(t, "label/sm", label, "text/secondary"));

  const box = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [13, 16] });
  box.counterAxisSizingMode = "AUTO";
  box.primaryAxisSizingMode = "FIXED";
  box.resize(w, box.height);
  box.cornerRadius = RADII.md;
  fillToken(t, box, "bg/inset");

  if (state === "Focus") {
    strokeToken(t, box, "state/focus", 1.5);
    await applyEffect(box, "glow/accent", t);
  } else if (state === "Error") {
    strokeToken(t, box, "feedback/danger", 1.5);
  } else {
    strokeToken(t, box, "border/default", 1);
  }

  if (o.iconName) box.appendChild(icon(t, o.iconName, 16, "text/muted"));
  const filled = state === "Filled" || state === "Error" || state === "Focus";
  box.appendChild(
    await makeText(t, "body/md", placeholder, filled ? "text/primary" : "text/muted"),
  );
  if (o.trailingIcon) {
    box.appendChild(spacer());
    box.appendChild(icon(t, o.trailingIcon, 16, "text/muted"));
  }
  col.appendChild(box);

  if (o.hint) {
    const hint = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
    hint.appendChild(icon(t, "alert-triangle", 13, "feedback/danger"));
    hint.appendChild(await makeText(t, "caption", o.hint, "feedback/danger", { maxWidth: w - 24 }));
    col.appendChild(hint);
  }
  return col;
}

async function primaryButton(
  t: ThemeContext,
  w: number,
  label: string,
  iconName?: string,
): Promise<FrameNode> {
  const b = autoFrame({
    direction: "HORIZONTAL",
    gap: 10,
    align: "CENTER",
    cross: "CENTER",
    padding: [14, 24],
  });
  b.primaryAxisSizingMode = "FIXED";
  b.counterAxisSizingMode = "AUTO";
  b.resize(w, b.height);
  b.cornerRadius = RADII.md;
  fillToken(t, b, "accent/primary");
  await applyEffect(b, "glow/button", t);
  if (iconName) b.appendChild(icon(t, iconName, 16, "accent/contrast"));
  b.appendChild(await makeText(t, "label/md", label, "accent/contrast"));
  return b;
}

async function socialButton(
  t: ThemeContext,
  w: number,
  label: string,
  iconName: string,
): Promise<FrameNode> {
  const b = autoFrame({
    direction: "HORIZONTAL",
    gap: 10,
    align: "CENTER",
    cross: "CENTER",
    padding: [12, 20],
  });
  b.primaryAxisSizingMode = "FIXED";
  b.counterAxisSizingMode = "AUTO";
  b.resize(w, b.height);
  b.cornerRadius = RADII.md;
  fillToken(t, b, "glass/fill");
  strokeToken(t, b, "glass/border", 1);
  b.appendChild(icon(t, iconName, 16, "text/primary"));
  b.appendChild(await makeText(t, "label/md", label, "text/primary"));
  return b;
}

/** "or" rule between the social block and the email form. */
async function orDivider(t: ThemeContext, w: number): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER" });
  row.primaryAxisSizingMode = "FIXED";
  row.resize(w, row.height);
  const line = (): RectangleNode => {
    const r = rect(1, 1);
    fillToken(t, r, "border/subtle");
    r.layoutGrow = 1;
    return r;
  };
  const l1 = line();
  row.appendChild(l1);
  l1.layoutGrow = 1;
  row.appendChild(await makeText(t, "caption", "or", "text/muted"));
  const l2 = line();
  row.appendChild(l2);
  l2.layoutGrow = 1;
  return row;
}

/**
 * Brand lockup above the form — the real logo from the "◆ Logo" page.
 * Vertical lockup when centred (square composition), horizontal when the form
 * is left-aligned, per the usage guide on that page. Falls back to a gradient
 * initials chip if the file has no logo page.
 */
async function brandLockup(t: ThemeContext, centred = true): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 14, cross: centred ? "CENTER" : "MIN" });

  const real = logoLockup(centred ? "vertical" : "horizontal", 48);
  if (real) {
    col.appendChild(real);
    return col;
  }

  const chip = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  fixedSize(chip, 48, 48);
  chip.cornerRadius = RADII.lg;
  chip.fills = [
    linearGradient(
      [
        { hex: "#5EE6C1", position: 0 },
        { hex: "#818CF8", position: 1 },
      ],
      "diagonal",
    ),
  ];
  chip.appendChild(await makeText(t, "label/md", SITE.brand, "accent/contrast"));
  col.appendChild(chip);
  return col;
}

/** Row of small links under the form (forgot password / sign up). */
async function metaRow(
  t: ThemeContext,
  w: number,
  left: string,
  rightLabel: string,
  rightLink: string,
): Promise<FrameNode> {
  const row = autoFrame({
    direction: "HORIZONTAL",
    gap: 6,
    cross: "CENTER",
    align: "CENTER",
    wrap: true,
  });
  row.primaryAxisSizingMode = "FIXED";
  row.resize(w, row.height);
  row.counterAxisSpacing = 4;
  row.appendChild(await makeText(t, "body/sm", left, "text/muted"));
  row.appendChild(await makeText(t, "label/sm", rightLabel, "accent/primary"));
  void rightLink;
  return row;
}

async function legalNote(t: ThemeContext, w: number): Promise<TextNode> {
  return makeText(
    t,
    "caption",
    "By continuing you agree to the Terms of Service and Privacy Policy.",
    "text/muted",
    { align: "CENTER", maxWidth: w },
  );
}

/** Password strength — four segments, coloured up to the reached level. */
async function strengthMeter(t: ThemeContext, w: number, level: 1 | 2 | 3 | 4): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 8, cross: "MIN" });
  col.counterAxisSizingMode = "FIXED";
  col.resize(w, col.height);

  const tone =
    level <= 1 ? "feedback/danger" : level === 2 ? "feedback/warning" : "feedback/success";
  const wordFor = ["Too weak", "Weak", "Good", "Strong"][level - 1];

  const bars = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
  bars.primaryAxisSizingMode = "FIXED";
  bars.resize(w, bars.height);
  for (let i = 0; i < 4; i++) {
    const seg = rect(1, 4, 2);
    fillToken(t, seg, i < level ? tone : "border/subtle");
    bars.appendChild(seg);
    seg.layoutGrow = 1;
  }
  col.appendChild(bars);

  const row = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER" });
  row.primaryAxisSizingMode = "FIXED";
  row.resize(w, row.height);
  row.appendChild(await makeText(t, "caption", "Password strength", "text/muted"));
  row.appendChild(spacer());
  row.appendChild(await makeText(t, "label/sm", wordFor, tone));
  col.appendChild(row);
  return col;
}

/** Requirement checklist under a new-password field. */
async function requirements(
  t: ThemeContext,
  w: number,
  items: Array<[string, boolean]>,
): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 7, cross: "MIN" });
  col.counterAxisSizingMode = "FIXED";
  col.resize(w, col.height);
  for (const [label, met] of items) {
    const row = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER" });
    row.appendChild(icon(t, met ? "check" : "x", 13, met ? "feedback/success" : "text/muted"));
    row.appendChild(await makeText(t, "caption", label, met ? "text/secondary" : "text/muted"));
    col.appendChild(row);
  }
  return col;
}

/** Terms checkbox — the one control a signup form can't skip. */
async function checkboxRow(
  t: ThemeContext,
  w: number,
  label: string,
  checked = false,
): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "MIN" });
  row.counterAxisSizingMode = "AUTO";
  row.primaryAxisSizingMode = "FIXED";
  row.resize(w, row.height);

  const box = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  fixedSize(box, 18, 18);
  box.cornerRadius = RADII.sm;
  if (checked) {
    fillToken(t, box, "accent/primary");
    box.appendChild(icon(t, "check", 12, "accent/contrast"));
  } else {
    fillToken(t, box, "bg/inset");
    strokeToken(t, box, "border/default", 1);
  }
  row.appendChild(box);

  const text = await makeText(t, "caption", label, "text/secondary", { maxWidth: w - 28 });
  row.appendChild(text);
  return row;
}

/** Big round icon chip used by the confirmation / success screens. */
function statusChip(t: ThemeContext, iconName: string, hex: string, token: string): FrameNode {
  const chip = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  fixedSize(chip, 64, 64);
  chip.cornerRadius = RADII.full;
  chip.fills = [aa(hex, 0.16)];
  chip.appendChild(icon(t, iconName, 30, token));
  return chip;
}

/** Step indicator — where you are in a multi-screen flow. */
async function stepDots(t: ThemeContext, current: number, total: number): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 8, cross: "CENTER", align: "CENTER" });
  for (let i = 1; i <= total; i++) {
    if (i === current) {
      const pill = rect(20, 6, 3);
      fillToken(t, pill, "accent/primary");
      row.appendChild(pill);
    } else {
      const d = ellipse(6);
      fillToken(t, d, i < current ? "accent/primary" : "border/strong");
      d.strokes = [];
      row.appendChild(d);
    }
  }
  return row;
}

/** A muted "← Back to sign in" footer link. */
async function backLink(t: ThemeContext, label = "Back to sign in"): Promise<FrameNode> {
  const back = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER", align: "CENTER" });
  back.appendChild(icon(t, "arrow-left", 14, "text/muted"));
  back.appendChild(await makeText(t, "label/sm", label, "text/muted"));
  return back;
}

/** The card every centred variant sits in. */
async function formCard(t: ThemeContext, w = CARD_W): Promise<FrameNode> {
  const card = autoFrame({ direction: "VERTICAL", gap: 20, cross: "CENTER", padding: 40 });
  card.counterAxisSizingMode = "FIXED";
  card.resize(w, card.height);
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/default", 1);
  await applyEffect(card, "shadow/lg", t);
  return card;
}

/** Centre a card inside a screen body. */
function centre(body: FrameNode, card: FrameNode): void {
  body.appendChild(card);
  card.x = Math.round((body.width - card.width) / 2);
  card.y = Math.round((body.height - card.height) / 2);
}

async function heading(t: ThemeContext, title: string, sub: string, w: number): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 8, cross: "CENTER" });
  col.appendChild(
    await makeText(t, "heading/h2", title, "text/primary", { align: "CENTER", maxWidth: w }),
  );
  col.appendChild(
    await makeText(t, "body/sm", sub, "text/muted", { align: "CENTER", maxWidth: w }),
  );
  return col;
}

// ── 01 · Centered card ────────────────────────────────────────

async function screenCentered(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/login", "01-centered");
  atmosphere(body, [{ hex: "#5EE6C1", size: 720, x: FRAME_W * 0.5, y: 80, op: 0.12 }]);

  const card = await formCard(t);
  const inner = CARD_W - 80;
  card.appendChild(await brandLockup(t));
  card.appendChild(await heading(t, "Welcome back", "Sign in to continue to your account.", inner));
  card.appendChild(
    await field(t, inner, "Email", "you@company.com", { state: "Filled", iconName: "mail" }),
  );
  card.appendChild(
    await field(t, inner, "Password", "••••••••••", { iconName: "lock", trailingIcon: "eye" }),
  );

  const forgot = autoFrame({ direction: "HORIZONTAL", cross: "CENTER" });
  forgot.primaryAxisSizingMode = "FIXED";
  forgot.resize(inner, forgot.height);
  forgot.appendChild(spacer());
  forgot.appendChild(await makeText(t, "label/sm", "Forgot password?", "accent/primary"));
  card.appendChild(forgot);

  card.appendChild(await primaryButton(t, inner, "Sign in", "arrow-right"));
  card.appendChild(await orDivider(t, inner));
  card.appendChild(await socialButton(t, inner, "Continue with GitHub", "github"));
  card.appendChild(await metaRow(t, inner, "New here?", "Create an account", "/signup"));

  centre(body, card);
  return shell;
}

// ── 02 · Split screen ─────────────────────────────────────────

async function screenSplit(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/login", "02-split");
  const half = Math.round(FRAME_W / 2);

  // Brand panel — the half that sells; the form half stays quiet.
  const panel = figma.createFrame();
  panel.name = "brand-panel";
  panel.resize(half, BODY_H);
  panel.clipsContent = true;
  panel.fills = [
    linearGradient(
      [
        { hex: "#0E4B3C", position: 0 },
        { hex: "#12131C", position: 1 },
      ],
      "diagonal",
    ),
  ];
  body.appendChild(panel);
  panel.x = 0;
  panel.y = 0;
  atmosphere(panel, [
    { hex: "#5EE6C1", size: 640, x: half * 0.3, y: 120, op: 0.22 },
    { hex: "#818CF8", size: 520, x: half * 0.8, y: BODY_H - 60, op: 0.16 },
  ]);

  const pitch = autoFrame({ direction: "VERTICAL", gap: 20, cross: "MIN" });
  pitch.counterAxisSizingMode = "FIXED";
  pitch.resize(half - 128, pitch.height);
  pitch.appendChild(await brandLockup(t, false));
  pitch.appendChild(
    await makeText(t, "display/lg", "Everything you shipped, in one place.", "text/primary", {
      maxWidth: half - 128,
    }),
  );
  pitch.appendChild(
    await makeText(
      t,
      "body/md",
      "Sign in to manage your profile, links and access requests.",
      "text/secondary",
      { maxWidth: half - 160 },
    ),
  );
  panel.appendChild(pitch);
  pitch.x = 64;
  pitch.y = Math.round((BODY_H - pitch.height) / 2);

  // Form half — no card; the panel already frames it.
  const form = autoFrame({ direction: "VERTICAL", gap: 20, cross: "MIN" });
  const inner = 360;
  form.counterAxisSizingMode = "FIXED";
  form.resize(inner, form.height);
  form.appendChild(await makeText(t, "heading/h2", "Sign in", "text/primary"));
  form.appendChild(await makeText(t, "body/sm", "Use your work email.", "text/muted"));
  form.appendChild(
    await field(t, inner, "Email", "you@company.com", { state: "Focus", iconName: "mail" }),
  );
  form.appendChild(
    await field(t, inner, "Password", "••••••••••", { iconName: "lock", trailingIcon: "eye" }),
  );
  form.appendChild(await primaryButton(t, inner, "Sign in", "arrow-right"));
  form.appendChild(await orDivider(t, inner));
  form.appendChild(await socialButton(t, inner, "Continue with GitHub", "github"));
  body.appendChild(form);
  form.x = half + Math.round((half - inner) / 2);
  form.y = Math.round((BODY_H - form.height) / 2);

  return shell;
}

// ── 03 · Magic link (passwordless) ────────────────────────────

async function screenMagicLink(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/login", "03-magic-link");
  atmosphere(body, [{ hex: "#818CF8", size: 680, x: FRAME_W * 0.5, y: BODY_H, op: 0.14 }]);

  const card = await formCard(t);
  const inner = CARD_W - 80;
  card.appendChild(await brandLockup(t));
  card.appendChild(
    await heading(
      t,
      "Sign in without a password",
      "We'll email you a link that signs you in.",
      inner,
    ),
  );
  card.appendChild(
    await field(t, inner, "Email", "you@company.com", { state: "Focus", iconName: "mail" }),
  );
  card.appendChild(await primaryButton(t, inner, "Email me a link", "sparkles"));
  card.appendChild(await legalNote(t, inner));

  centre(body, card);
  return shell;
}

// ── 04 · SSO-first ────────────────────────────────────────────

async function screenSsoFirst(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/login", "04-sso-first");
  atmosphere(body, [{ hex: "#5EE6C1", size: 620, x: FRAME_W * 0.24, y: 100, op: 0.1 }]);

  const card = await formCard(t);
  const inner = CARD_W - 80;
  card.appendChild(await brandLockup(t));
  card.appendChild(await heading(t, "Sign in", "Use a provider you already trust.", inner));
  card.appendChild(await socialButton(t, inner, "Continue with GitHub", "github"));
  card.appendChild(await socialButton(t, inner, "Continue with Google", "globe"));
  card.appendChild(await socialButton(t, inner, "Single sign-on (SAML)", "shield"));
  card.appendChild(await orDivider(t, inner));
  card.appendChild(await field(t, inner, "Email", "you@company.com", { iconName: "mail" }));
  card.appendChild(await primaryButton(t, inner, "Continue", "arrow-right"));

  centre(body, card);
  return shell;
}

// ── 05 · Two-step (email → password) ──────────────────────────

async function screenTwoStep(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/login", "05-two-step");
  atmosphere(body, [{ hex: "#5EE6C1", size: 600, x: FRAME_W * 0.72, y: 120, op: 0.1 }]);

  const card = await formCard(t);
  const inner = CARD_W - 80;
  card.appendChild(await brandLockup(t));
  card.appendChild(await heading(t, "Enter your password", "Step 2 of 2", inner));

  // The identity you're signing in as, with a way back to step 1.
  const who = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", padding: [8, 12] });
  who.primaryAxisSizingMode = "FIXED";
  who.resize(inner, who.height);
  who.cornerRadius = RADII.full;
  fillToken(t, who, "bg/inset");
  strokeToken(t, who, "border/subtle", 1);
  const av = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  fixedSize(av, 24, 24);
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
  who.appendChild(av);
  who.appendChild(await makeText(t, "body/sm", SITE.contact.email, "text/primary"));
  who.appendChild(spacer());
  who.appendChild(await makeText(t, "label/sm", "Change", "accent/primary"));
  card.appendChild(who);

  card.appendChild(
    await field(t, inner, "Password", "••••••••••", {
      state: "Focus",
      iconName: "lock",
      trailingIcon: "eye",
    }),
  );
  card.appendChild(await primaryButton(t, inner, "Sign in", "arrow-right"));

  const back = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER", align: "CENTER" });
  back.appendChild(icon(t, "arrow-left", 14, "text/muted"));
  back.appendChild(await makeText(t, "label/sm", "Back", "text/muted"));
  card.appendChild(back);

  centre(body, card);
  return shell;
}

// ── 06 · OTP / two-factor ─────────────────────────────────────

async function otpBoxes(t: ThemeContext, w: number, filled: number, total = 6): Promise<FrameNode> {
  const row = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "CENTER", align: "CENTER" });
  row.primaryAxisSizingMode = "FIXED";
  row.resize(w, row.height);
  const boxW = Math.floor((w - 10 * (total - 1)) / total);
  for (let i = 0; i < total; i++) {
    const b = autoFrame({ direction: "VERTICAL", align: "CENTER", cross: "CENTER" });
    fixedSize(b, boxW, 56);
    b.cornerRadius = RADII.md;
    fillToken(t, b, "bg/inset");
    if (i === filled) {
      // The caret sits on the next empty box.
      strokeToken(t, b, "state/focus", 1.5);
      await applyEffect(b, "glow/accent", t);
    } else {
      strokeToken(t, b, "border/default", 1);
    }
    if (i < filled)
      b.appendChild(await makeText(t, "heading/h3", String((i * 3 + 7) % 10), "text/primary"));
    row.appendChild(b);
  }
  return row;
}

async function screenOtp(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/login/2fa", "06-otp");
  atmosphere(body, [{ hex: "#818CF8", size: 640, x: FRAME_W * 0.5, y: 60, op: 0.12 }]);

  const card = await formCard(t, 460);
  const inner = 460 - 80;
  const chip = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  fixedSize(chip, 48, 48);
  chip.cornerRadius = RADII.lg;
  chip.fills = [aa("#818CF8", 0.16)];
  chip.appendChild(icon(t, "smartphone", 24, "accent/secondary"));
  card.appendChild(chip);

  card.appendChild(
    await heading(
      t,
      "Two-factor authentication",
      "Enter the 6-digit code from your authenticator app.",
      inner,
    ),
  );
  card.appendChild(await otpBoxes(t, inner, 3));
  card.appendChild(await primaryButton(t, inner, "Verify", "check"));

  const resend = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER", align: "CENTER" });
  resend.appendChild(icon(t, "refresh-cw", 13, "text/muted"));
  resend.appendChild(await makeText(t, "caption", "Resend code in 0:28", "text/muted"));
  card.appendChild(resend);

  centre(body, card);
  return shell;
}

// ── 07 · Error state ──────────────────────────────────────────

async function screenError(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/login", "07-error");
  atmosphere(body, [{ hex: "#FF3D8B", size: 600, x: FRAME_W * 0.5, y: 90, op: 0.1 }]);

  const card = await formCard(t);
  const inner = CARD_W - 80;
  card.appendChild(await brandLockup(t));
  card.appendChild(await heading(t, "Welcome back", "Sign in to continue to your account.", inner));

  // Banner first: the failure explains itself before the fields do.
  const banner = autoFrame({ direction: "HORIZONTAL", gap: 10, cross: "MIN", padding: [12, 14] });
  banner.primaryAxisSizingMode = "FIXED";
  banner.resize(inner, banner.height);
  banner.cornerRadius = RADII.md;
  banner.fills = [aa("#F87171", 0.12)];
  banner.strokes = [aa("#F87171", 0.4)];
  banner.strokeWeight = 1;
  banner.appendChild(icon(t, "alert-triangle", 16, "feedback/danger"));
  banner.appendChild(
    await makeText(t, "body/sm", "Incorrect email or password. 2 attempts left.", "text/primary", {
      maxWidth: inner - 60,
    }),
  );
  card.appendChild(banner);

  card.appendChild(
    await field(t, inner, "Email", "you@company.com", { state: "Filled", iconName: "mail" }),
  );
  card.appendChild(
    await field(t, inner, "Password", "••••••••", {
      state: "Error",
      iconName: "lock",
      trailingIcon: "eye-off",
      hint: "Password doesn't match this account.",
    }),
  );
  card.appendChild(await primaryButton(t, inner, "Try again", "arrow-right"));
  card.appendChild(await metaRow(t, inner, "Locked out?", "Reset your password", "/reset"));

  centre(body, card);
  return shell;
}

// ── 08 · Mobile ───────────────────────────────────────────────

async function screenMobile(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(
    t,
    "okryshto.dev/login",
    "08-mobile",
    MOBILE_W,
    MOBILE_H,
  );
  atmosphere(body, [{ hex: "#5EE6C1", size: 460, x: MOBILE_W * 0.6, y: 60, op: 0.14 }]);

  // Full-bleed on mobile: a card inside a phone-width viewport wastes the edges.
  const pad = 24;
  const inner = MOBILE_W - pad * 2;
  const form = autoFrame({ direction: "VERTICAL", gap: 18, cross: "CENTER" });
  form.counterAxisSizingMode = "FIXED";
  form.resize(inner, form.height);

  form.appendChild(await brandLockup(t));
  form.appendChild(await heading(t, "Welcome back", "Sign in to continue.", inner));
  form.appendChild(
    await field(t, inner, "Email", "you@company.com", { state: "Filled", iconName: "mail" }),
  );
  form.appendChild(
    await field(t, inner, "Password", "••••••••••", { iconName: "lock", trailingIcon: "eye" }),
  );
  form.appendChild(await primaryButton(t, inner, "Sign in", "arrow-right"));
  form.appendChild(await orDivider(t, inner));
  form.appendChild(await socialButton(t, inner, "Continue with GitHub", "github"));
  form.appendChild(await metaRow(t, inner, "New here?", "Create an account", "/signup"));

  body.appendChild(form);
  form.x = pad;
  form.y = Math.round((MOBILE_H - CHROME_H - form.height) / 2);
  return shell;
}

// ── Password reset flow ───────────────────────────────────────

/** R1 — ask for the email the reset link goes to. */
async function screenForgot(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/forgot", "r1-forgot");
  atmosphere(body, [{ hex: "#818CF8", size: 620, x: FRAME_W * 0.5, y: 80, op: 0.12 }]);

  const card = await formCard(t);
  const inner = CARD_W - 80;
  card.appendChild(statusChip(t, "key", "#818CF8", "accent/secondary"));
  card.appendChild(
    await heading(
      t,
      "Forgot your password?",
      "Enter your email and we'll send you a reset link.",
      inner,
    ),
  );
  card.appendChild(
    await field(t, inner, "Email", "you@company.com", { state: "Focus", iconName: "mail" }),
  );
  card.appendChild(await primaryButton(t, inner, "Send reset link", "send"));
  card.appendChild(await backLink(t));
  card.appendChild(await stepDots(t, 1, 3));

  centre(body, card);
  return shell;
}

/** R2 — confirmation. Never says whether the address exists. */
async function screenCheckInbox(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/forgot/sent", "r2-check-inbox");
  atmosphere(body, [{ hex: "#5EE6C1", size: 620, x: FRAME_W * 0.5, y: 80, op: 0.12 }]);

  const card = await formCard(t);
  const inner = CARD_W - 80;
  card.appendChild(statusChip(t, "inbox", "#5EE6C1", "accent/primary"));
  card.appendChild(
    await heading(
      t,
      "Check your inbox",
      "If an account exists for that address, a reset link is on its way. The link expires in 30 minutes.",
      inner,
    ),
  );

  // Echo the address so a typo is obvious without going back.
  const who = autoFrame({
    direction: "HORIZONTAL",
    gap: 8,
    cross: "CENTER",
    align: "CENTER",
    padding: [10, 14],
  });
  who.primaryAxisSizingMode = "FIXED";
  who.resize(inner, who.height);
  who.cornerRadius = RADII.md;
  fillToken(t, who, "bg/inset");
  who.appendChild(icon(t, "mail", 15, "text/muted"));
  who.appendChild(await makeText(t, "body/sm", SITE.contact.email, "text/primary"));
  card.appendChild(who);

  card.appendChild(await primaryButton(t, inner, "Open email app", "arrow-up-right"));

  const resend = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER", align: "CENTER" });
  resend.appendChild(await makeText(t, "caption", "Didn't get it?", "text/muted"));
  resend.appendChild(await makeText(t, "label/sm", "Resend in 0:42", "accent/primary"));
  card.appendChild(resend);

  card.appendChild(await backLink(t));
  card.appendChild(await stepDots(t, 2, 3));

  centre(body, card);
  return shell;
}

/** R3 — the new password, with live strength and requirements. */
async function screenSetPassword(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/reset?token=…", "r3-set-password");
  atmosphere(body, [{ hex: "#5EE6C1", size: 600, x: FRAME_W * 0.3, y: 110, op: 0.1 }]);

  const card = await formCard(t, 460);
  const inner = 460 - 80;
  card.appendChild(statusChip(t, "lock", "#5EE6C1", "accent/primary"));
  card.appendChild(
    await heading(t, "Set a new password", "Pick something you haven't used here before.", inner),
  );
  card.appendChild(
    await field(t, inner, "New password", "••••••••••••", {
      state: "Focus",
      iconName: "lock",
      trailingIcon: "eye",
    }),
  );
  card.appendChild(await strengthMeter(t, inner, 3));
  card.appendChild(
    await requirements(t, inner, [
      ["At least 12 characters", true],
      ["One number or symbol", true],
      ["Not a password you've used before", false],
    ]),
  );
  card.appendChild(
    await field(t, inner, "Confirm password", "••••••••••••", {
      state: "Filled",
      iconName: "lock",
      trailingIcon: "eye-off",
    }),
  );
  card.appendChild(await primaryButton(t, inner, "Update password", "check"));
  card.appendChild(await stepDots(t, 3, 3));

  centre(body, card);
  return shell;
}

/** R4 — the link died. Offer a new one, don't dead-end. */
async function screenLinkExpired(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/reset?token=…", "r4-link-expired");
  atmosphere(body, [{ hex: "#FF3D8B", size: 580, x: FRAME_W * 0.5, y: 90, op: 0.1 }]);

  const card = await formCard(t);
  const inner = CARD_W - 80;
  card.appendChild(statusChip(t, "clock", "#F87171", "feedback/danger"));
  card.appendChild(
    await heading(
      t,
      "This link has expired",
      "Reset links are valid for 30 minutes. Request a fresh one and we'll send it right away.",
      inner,
    ),
  );
  card.appendChild(await primaryButton(t, inner, "Send a new link", "refresh-cw"));
  card.appendChild(await backLink(t));

  centre(body, card);
  return shell;
}

/** R5 — done. One obvious way forward. */
async function screenPasswordUpdated(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/reset/done", "r5-password-updated");
  atmosphere(body, [{ hex: "#5EE6C1", size: 660, x: FRAME_W * 0.5, y: 70, op: 0.16 }]);

  const card = await formCard(t);
  const inner = CARD_W - 80;
  card.appendChild(statusChip(t, "check", "#34D399", "feedback/success"));
  card.appendChild(
    await heading(
      t,
      "Password updated",
      "You've been signed out everywhere else. Sign in with your new password.",
      inner,
    ),
  );
  card.appendChild(await primaryButton(t, inner, "Sign in", "arrow-right"));

  centre(body, card);
  return shell;
}

// ── Create account flow ───────────────────────────────────────

/** S1 — the form. Name + email + password, terms in view. */
async function screenSignUp(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/signup", "s1-create-account");
  atmosphere(body, [{ hex: "#5EE6C1", size: 640, x: FRAME_W * 0.5, y: 70, op: 0.12 }]);

  const card = await formCard(t, 460);
  const inner = 460 - 80;
  card.appendChild(await brandLockup(t));
  card.appendChild(
    await heading(t, "Create your account", "Free to start. No card required.", inner),
  );
  card.appendChild(
    await field(t, inner, "Full name", "Oleksii Kryshtopa", { state: "Filled", iconName: "user" }),
  );
  card.appendChild(
    await field(t, inner, "Email", "you@company.com", { state: "Filled", iconName: "mail" }),
  );
  card.appendChild(
    await field(t, inner, "Password", "••••••••••••", {
      state: "Focus",
      iconName: "lock",
      trailingIcon: "eye",
    }),
  );
  card.appendChild(await strengthMeter(t, inner, 4));
  card.appendChild(
    await checkboxRow(t, inner, "I agree to the Terms of Service and Privacy Policy.", true),
  );
  card.appendChild(await primaryButton(t, inner, "Create account", "arrow-right"));
  card.appendChild(await metaRow(t, inner, "Already have an account?", "Sign in", "/login"));

  centre(body, card);
  return shell;
}

/** S2 — providers first; the shortest path to an account. */
async function screenSignUpSso(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/signup", "s2-signup-sso");
  atmosphere(body, [{ hex: "#818CF8", size: 620, x: FRAME_W * 0.7, y: 110, op: 0.12 }]);

  const card = await formCard(t);
  const inner = CARD_W - 80;
  card.appendChild(await brandLockup(t));
  card.appendChild(
    await heading(t, "Create your account", "One click with a provider, or use your email.", inner),
  );
  card.appendChild(await socialButton(t, inner, "Sign up with GitHub", "github"));
  card.appendChild(await socialButton(t, inner, "Sign up with Google", "globe"));
  card.appendChild(await orDivider(t, inner));
  card.appendChild(await field(t, inner, "Email", "you@company.com", { iconName: "mail" }));
  card.appendChild(await primaryButton(t, inner, "Continue with email", "arrow-right"));
  card.appendChild(await legalNote(t, inner));

  centre(body, card);
  return shell;
}

/** S3 — prove the address is real before letting the account in. */
async function screenVerifyEmail(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/signup/verify", "s3-verify-email");
  atmosphere(body, [{ hex: "#5EE6C1", size: 620, x: FRAME_W * 0.5, y: 80, op: 0.12 }]);

  const card = await formCard(t, 460);
  const inner = 460 - 80;
  card.appendChild(statusChip(t, "mail", "#5EE6C1", "accent/primary"));
  card.appendChild(
    await heading(
      t,
      "Verify your email",
      `We sent a 6-digit code to ${SITE.contact.email}.`,
      inner,
    ),
  );
  card.appendChild(await otpBoxes(t, inner, 4));
  card.appendChild(await primaryButton(t, inner, "Verify email", "check"));

  const resend = autoFrame({ direction: "HORIZONTAL", gap: 6, cross: "CENTER", align: "CENTER" });
  resend.appendChild(icon(t, "refresh-cw", 13, "text/muted"));
  resend.appendChild(await makeText(t, "caption", "Resend code", "text/muted"));
  card.appendChild(resend);

  card.appendChild(await stepDots(t, 2, 3));

  centre(body, card);
  return shell;
}

/** S4 — welcome, with the first useful action rather than a dead end. */
async function screenWelcome(t: ThemeContext): Promise<FrameNode> {
  const { shell, body } = await browserShell(t, "okryshto.dev/welcome", "s4-welcome");
  atmosphere(body, [
    { hex: "#5EE6C1", size: 700, x: FRAME_W * 0.4, y: 60, op: 0.16 },
    { hex: "#818CF8", size: 520, x: FRAME_W * 0.72, y: BODY_H - 40, op: 0.12 },
  ]);

  const card = await formCard(t, 460);
  const inner = 460 - 80;
  card.appendChild(statusChip(t, "sparkles", "#34D399", "feedback/success"));
  card.appendChild(
    await heading(
      t,
      "You're all set",
      "Your account is ready. Set up your profile so people know who they're talking to.",
      inner,
    ),
  );
  card.appendChild(await primaryButton(t, inner, "Set up your profile", "arrow-right"));

  const skip = await makeText(t, "label/sm", "Skip for now", "text/muted", {
    align: "CENTER",
    maxWidth: inner,
  });
  card.appendChild(skip);
  card.appendChild(await stepDots(t, 3, 3));

  centre(body, card);
  return shell;
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
}

export async function paintTemplateLogin(t: ThemeContext, page: PageNode): Promise<void> {
  const label = await makeText(
    t,
    "overline",
    "16 · Template (Login) — DESIGN ONLY · sign-in, reset & sign-up patterns",
    "accent/primary",
  );
  page.appendChild(label);
  label.x = 0;
  label.y = -84;

  const groups: Group[] = [
    {
      title: "Sign in",
      note: "The entry patterns, and the two states that decide whether people get in.",
      screens: [
        {
          node: await screenCentered(t),
          cap: "01 · Centered card — the default. Email + password, social below.",
        },
        {
          node: await screenSplit(t),
          cap: "02 · Split screen — brand panel sells, form stays quiet.",
        },
        {
          node: await screenMagicLink(t),
          cap: "03 · Magic link — passwordless; nothing to forget or leak.",
        },
        {
          node: await screenSsoFirst(t),
          cap: "04 · SSO-first — providers on top, email as the fallback.",
        },
        {
          node: await screenTwoStep(t),
          cap: "05 · Two-step — email first, then password (Google-style).",
        },
        {
          node: await screenOtp(t),
          cap: "06 · OTP — two-factor, 6 boxes, caret on the next empty one.",
        },
        {
          node: await screenError(t),
          cap: "07 · Error — banner explains before the fields turn red.",
        },
        { node: await screenMobile(t), cap: "08 · Mobile — full-bleed, no card at 390." },
      ],
    },
    {
      title: "Password reset",
      note: "Request → confirm → set → done, plus the expired-link dead end that shouldn't be one.",
      screens: [
        { node: await screenForgot(t), cap: "R1 · Forgot password — one field, one job." },
        {
          node: await screenCheckInbox(t),
          cap: "R2 · Check inbox — never reveals whether the account exists.",
        },
        {
          node: await screenSetPassword(t),
          cap: "R3 · Set new password — live strength + requirements.",
        },
        {
          node: await screenLinkExpired(t),
          cap: "R4 · Link expired — offers a fresh link, not an apology.",
        },
        {
          node: await screenPasswordUpdated(t),
          cap: "R5 · Updated — signed out elsewhere, one way forward.",
        },
      ],
    },
    {
      title: "Create account",
      note: "Form or provider, then prove the address is real before anything else.",
      screens: [
        {
          node: await screenSignUp(t),
          cap: "S1 · Sign up — name, email, password, terms in view.",
        },
        {
          node: await screenSignUpSso(t),
          cap: "S2 · Provider-first — shortest path to an account.",
        },
        { node: await screenVerifyEmail(t), cap: "S3 · Verify email — 6-digit code before entry." },
        {
          node: await screenWelcome(t),
          cap: "S4 · Welcome — hands over to the first useful action.",
        },
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

    // Two screens per row; each row is as tall as the tallest frame in it.
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

      const lastInRow = i % 2 === 1 || i === group.screens.length - 1;
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
