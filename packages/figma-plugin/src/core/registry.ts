/**
 * Idempotent teardown so the plugin is safely rerunnable.
 *
 * Everything the plugin creates is namespaced: pages start with `PAGE_MARK`,
 * variable collections and styles start with `NS`. Teardown removes exactly
 * those and nothing the user made by hand.
 */

import { NS, PAGE_MARK } from "../tokens";

export async function teardown(): Promise<void> {
  await figma.loadAllPagesAsync();

  // ── Pages ───────────────────────────────────────────────────
  // Pages to preserve (created by user, not by the plugin)
  const PRESERVE_PAGES = ["◆ Logo"];

  const generatedPages = figma.root.children.filter(
    (p) => p.name.startsWith(PAGE_MARK) && !PRESERVE_PAGES.includes(p.name),
  );
  let survivor = figma.root.children.find((p) => !p.name.startsWith(PAGE_MARK));
  if (!survivor) {
    // Only generated pages exist — create a temporary anchor so we can remove them.
    survivor = figma.createPage();
    survivor.name = "Untitled";
  }
  await figma.setCurrentPageAsync(survivor);
  for (const p of generatedPages) {
    if (figma.root.children.length > 1) p.remove();
  }

  // ── Variable collections ────────────────────────────────────
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  for (const c of collections) {
    if (c.name.startsWith(NS)) c.remove();
  }

  // ── Styles ──────────────────────────────────────────────────
  const paints = await figma.getLocalPaintStylesAsync();
  const texts = await figma.getLocalTextStylesAsync();
  const effects = await figma.getLocalEffectStylesAsync();
  for (const s of [...paints, ...texts, ...effects]) {
    if (s.name.startsWith(NS)) s.remove();
  }
}

/** Create a fresh, marked page and make it current. */
export async function createPage(title: string): Promise<PageNode> {
  const page = figma.createPage();
  page.name = `${PAGE_MARK} ${title}`;
  return page;
}
