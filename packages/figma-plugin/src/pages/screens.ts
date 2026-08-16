/**
 * Screens page — the finished vizitka assembled end-to-end at desktop (1440),
 * tablet (834) and mobile (390), plus the mobile burger-menu state.
 */

import { BREAKPOINTS, CONTENT_MAX_WIDTH } from "../tokens";
import { autoFrame } from "../core/layout";
import { fillToken, makeText } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { ComponentLibrary, burgerMenuOverlay, footer, navbarGlass } from "../components";
import {
  beyondCodeSection,
  contactSection,
  credibilitySection,
  heroSection,
  introSection,
  linksSection,
  petProjectsSection,
  skillsSection,
} from "../sections";
import { cosmicAtmosphere, rowBoards } from "./scaffold";

/** Full-width row that horizontally centers a fixed-width child. */
function centerWrap(
  width: number,
  padH: number,
  child: SceneNode,
  padTop = 0,
  padBottom = 0,
): FrameNode {
  const w = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "MIN" });
  w.primaryAxisSizingMode = "FIXED";
  w.counterAxisSizingMode = "AUTO";
  w.resize(width, w.height);
  w.paddingLeft = w.paddingRight = padH;
  w.paddingTop = padTop;
  w.paddingBottom = padBottom;
  w.appendChild(child);
  w.layoutAlign = "STRETCH";
  return w;
}

async function buildScreen(
  t: ThemeContext,
  lib: ComponentLibrary,
  width: number,
  label: string,
): Promise<FrameNode> {
  const mobile = width < 640;
  const pad = mobile ? 20 : width >= 1200 ? 96 : 56;
  const contentW = Math.min(width - pad * 2, CONTENT_MAX_WIDTH);

  const screen = autoFrame({ name: `Screen · ${label}`, direction: "VERTICAL", gap: 0 });
  screen.counterAxisSizingMode = "FIXED";
  screen.primaryAxisSizingMode = "AUTO";
  screen.resize(width, screen.height);
  screen.clipsContent = true;
  fillToken(t, screen, "bg/canvas");

  // Header
  const header = await navbarGlass(t, contentW, mobile);
  screen.appendChild(centerWrap(width, pad, header, 24, 8));

  // Body content column
  const col = autoFrame({ direction: "VERTICAL", gap: 0 });
  col.counterAxisSizingMode = "FIXED";
  col.resize(contentW, col.height);

  const hero = await heroSection(t, contentW);
  hero.layoutAlign = "STRETCH";
  col.appendChild(hero);

  const intro = await introSection(t, contentW);
  intro.layoutAlign = "STRETCH";
  col.appendChild(intro);

  const pet = await petProjectsSection(t, contentW);
  pet.layoutAlign = "STRETCH";
  col.appendChild(pet);

  const skills = await skillsSection(t, contentW);
  skills.layoutAlign = "STRETCH";
  col.appendChild(skills);

  const cred = await credibilitySection(t, contentW, mobile);
  cred.layoutAlign = "STRETCH";
  col.appendChild(cred);

  const beyond = await beyondCodeSection(t, contentW);
  beyond.layoutAlign = "STRETCH";
  col.appendChild(beyond);

  const links = await linksSection(t, contentW, lib);
  links.layoutAlign = "STRETCH";
  col.appendChild(links);

  const contact = await contactSection(t, contentW);
  contact.layoutAlign = "STRETCH";
  col.appendChild(contact);

  const foot = await footer(t, contentW, mobile);
  foot.layoutAlign = "STRETCH";
  foot.paddingBottom = 64;
  col.appendChild(foot);

  screen.appendChild(centerWrap(width, pad, col, 8, 0));
  cosmicAtmosphere(screen); // decorate after content so board height is known
  return screen;
}

/** Mobile frame with the frosted burger menu open over a dimmed screen. */
async function buildMobileMenu(t: ThemeContext, lib: ComponentLibrary): Promise<FrameNode> {
  const width = BREAKPOINTS.mobile;
  const height = 820;
  const frame = autoFrame({ name: "Screen · Mobile — Menu open", direction: "VERTICAL", gap: 0 });
  frame.counterAxisSizingMode = "FIXED";
  frame.primaryAxisSizingMode = "FIXED";
  frame.resize(width, height);
  frame.clipsContent = true;
  fillToken(t, frame, "bg/canvas");

  const overlay = await burgerMenuOverlay(t, width, height);
  frame.appendChild(overlay);
  overlay.layoutPositioning = "ABSOLUTE";
  overlay.x = 0;
  overlay.y = 0;
  cosmicAtmosphere(frame); // decorate after content so board height is known

  // Keep lib referenced for signature symmetry with buildScreen.
  void lib;
  return frame;
}

export async function paintScreens(
  t: ThemeContext,
  page: PageNode,
  lib: ComponentLibrary,
): Promise<void> {
  const label = await makeText(t, "overline", "09 · Templates (Profile)", "accent/primary");
  page.appendChild(label);
  label.x = 0;
  label.y = -80;

  // Profile variants - multiple designs
  const screens = [];

  // Variant 1: Desktop profile (full screen)
  const desktop = await buildScreen(t, lib, BREAKPOINTS.desktop, "Profile · Desktop");
  page.appendChild(desktop);
  screens.push(desktop);

  // Variant 2: Tablet profile
  const tablet = await buildScreen(t, lib, BREAKPOINTS.tablet, "Profile · Tablet");
  page.appendChild(tablet);
  screens.push(tablet);

  // Variant 3: Mobile profile
  const mobile = await buildScreen(t, lib, BREAKPOINTS.mobile, "Profile · Mobile");
  page.appendChild(mobile);
  screens.push(mobile);

  // Variant 4: Mobile menu state
  const mobileMenu = await buildMobileMenu(t, lib);
  page.appendChild(mobileMenu);
  screens.push(mobileMenu);

  rowBoards(screens, 120);
}
