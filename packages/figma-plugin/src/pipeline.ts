/**
 * Generation pipeline — the deterministic, rerunnable orchestration:
 *
 *   fonts → teardown → variables → styles → pages → components → paint 4 pages.
 *
 * Every step is idempotent; running the plugin again reproduces the same result
 * after wiping the previous run's namespaced artifacts.
 */

import { resolveFonts } from "./core/fonts";
import { buildVariables } from "./core/variables";
import { buildStyles } from "./core/styles";
import { createPage, teardown } from "./core/registry";
import { primeLogos } from "./core/logo";
import { ThemeContext } from "./core/theme";
import { buildComponents } from "./components";
import { paintFoundations } from "./pages/foundations";
import {
  paintBasic,
  paintMusic,
  paintMap,
  paintChat,
  paintAI,
  paintBackgrounds,
} from "./pages/catalog";
import { paintIcons } from "./pages/iconsPage";

export type ProgressFn = (step: string) => void;

export async function generate(onProgress: ProgressFn): Promise<void> {
  onProgress("Resolving fonts…");
  const fonts = await resolveFonts();

  onProgress("Clearing previous run…");
  await teardown();

  // Find the hand-drawn logo before any generated page exists, so a name match
  // can't hit something the plugin drew itself.
  onProgress("Locating brand logo…");
  await primeLogos();

  onProgress("Building color & scale variables…");
  const { colorVars, numberVars } = buildVariables();

  onProgress("Building text, effect & paint styles…");
  const { textStyles, paintStyles, effectStyles } = await buildStyles(fonts);

  const t: ThemeContext = {
    fonts,
    colorVars,
    numberVars,
    textStyles,
    paintStyles,
    effectStyles,
  };

  onProgress("Creating pages…");
  const foundationsPage = await createPage("00 · Foundations");
  const iconsPage = await createPage("01 · Icons");
  const basicPage = await createPage("02 · Basic");
  const musicPage = await createPage("03 · Music");
  const mapPage = await createPage("04 · Map");
  const chatPage = await createPage("05 · Chat");
  const aiPage = await createPage("06 · AI");
  const backgroundsPage = await createPage("07 · Backgrounds");

  // Component sets must be combined on a real page (combineAsVariants parent).
  // The dedicated Components page was removed — park the library off-canvas on
  // Foundations so it stays in the file but nothing shows.
  await figma.setCurrentPageAsync(foundationsPage);
  onProgress("Building component library…");
  const lib = await buildComponents(t);
  for (const raw of Object.values(lib as unknown as Record<string, unknown>)) {
    const n = raw as SceneNode;
    if (n && (n.type === "COMPONENT" || n.type === "COMPONENT_SET")) {
      n.x = -9000;
      n.y = 0;
    }
  }

  onProgress("Painting Foundations…");
  await paintFoundations(t, foundationsPage);

  onProgress("Painting Icons…");
  await paintIcons(t, iconsPage);

  onProgress("Painting Basic…");
  await paintBasic(t, basicPage);
  onProgress("Painting Music…");
  await paintMusic(t, musicPage);
  onProgress("Painting Map…");
  await paintMap(t, mapPage);
  onProgress("Painting Chat…");
  await paintChat(t, chatPage);
  onProgress("Painting AI…");
  await paintAI(t, aiPage);
  onProgress("Painting Backgrounds…");
  await paintBackgrounds(t, backgroundsPage);

  await figma.setCurrentPageAsync(foundationsPage);
  onProgress("Done");
}
