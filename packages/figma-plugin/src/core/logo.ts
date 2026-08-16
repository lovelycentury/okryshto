/**
 * Brand logo — cloned from the hand-drawn "◆ Logo" page, never regenerated.
 *
 * That page is in `PRESERVE_PAGES`, so it survives teardown and stays the single
 * source of truth: redraw the lockup there and the next run picks it up
 * everywhere. Nodes are found by name rather than by id, so the lookup survives
 * the ids changing when the artwork is re-made.
 *
 * The three approved lockups (per the usage guide on that page):
 *   header     — emblem + label to its right, for nav bars. Smallest approved.
 *   horizontal — emblem + label on a shared baseline, for desktop headers.
 *   vertical   — emblem stacked over the label, for square compositions.
 * Never mix formats within one interface.
 */

export type Lockup = "header" | "horizontal" | "vertical";

/** Layer names on the logo page, and each lockup's emblem diameter. */
const LOCKUPS: Record<Lockup, { layer: string; emblem: number }> = {
  header: { layer: "Header Brand Mark", emblem: 45 },
  horizontal: { layer: "Horizontal Lockup", emblem: 77 },
  vertical: { layer: "Vertical Lockup", emblem: 77 },
};

let sources: Partial<Record<Lockup, SceneNode>> = {};

/**
 * Find the lockups once, before any generated page exists.
 *
 * Call right after teardown: at that point the only pages left are the user's,
 * so a name match can't accidentally hit something the plugin drew itself.
 */
export async function primeLogos(): Promise<void> {
  sources = {};
  await figma.loadAllPagesAsync();

  const kinds = Object.keys(LOCKUPS) as Lockup[];
  for (const page of figma.root.children) {
    for (const kind of kinds) {
      if (sources[kind]) continue;
      const hit = page.findOne((n) => n.name === LOCKUPS[kind].layer);
      if (hit) sources[kind] = hit;
    }
  }
}

/** True when the logo page was found — callers fall back to a drawn mark if not. */
export function hasLogo(kind: Lockup = "header"): boolean {
  return Boolean(sources[kind]);
}

/**
 * A copy of a lockup, optionally rescaled so its emblem measures `emblemPx`.
 * Returns null when the logo page is missing, so generation never hard-fails on
 * a file that hasn't got one.
 */
export function logoLockup(kind: Lockup, emblemPx?: number): SceneNode | null {
  const src = sources[kind];
  if (!src) return null;

  const clone = src.clone();
  clone.name = `Logo · ${kind}`;

  if (emblemPx && emblemPx > 0 && "rescale" in clone) {
    const factor = emblemPx / LOCKUPS[kind].emblem;
    // rescale() is a no-op at 1 and throws at 0 — only touch it when it matters.
    if (Math.abs(factor - 1) > 0.001) (clone as LayoutMixin & SceneNode).rescale(factor);
  }
  return clone;
}
