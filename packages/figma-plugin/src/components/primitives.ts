/**
 * Shared component primitives: glass surfaces, effect application, and the
 * variant-set assembler used by every component generator.
 */

import { autoFrame } from "../core/layout";
import { fillToken, strokeToken } from "../core/nodes";
import { ThemeContext, effectStyle, textStyle } from "../core/theme";
import { makeText } from "../core/nodes";
import { NS } from "../tokens";

/** Apply an effect style by name (async in dynamic-page mode). */
export async function applyEffect(node: BlendMixin, name: string, t: ThemeContext): Promise<void> {
  await node.setEffectStyleIdAsync(effectStyle(t, name).id);
}

/**
 * A frosted glass surface: translucent fill + hairline border + background blur.
 * `material` selects the blur strength (header / menu / card).
 */
export async function glassSurface(
  t: ThemeContext,
  material: "glass/header" | "glass/menu" | "glass/card",
  radius: number,
  strong = false,
): Promise<FrameNode> {
  const f = autoFrame({ name: "Glass surface" });
  f.cornerRadius = radius;
  fillToken(t, f, strong ? "glass/fill-strong" : "glass/fill");
  strokeToken(t, f, "glass/border", 1);
  await applyEffect(f, material, t);
  return f;
}

/**
 * Combine components into a tidy, wrapped, labeled variant set with a subtle
 * board background — ready to drop onto the Components page.
 */
export function assembleVariantSet(name: string, components: ComponentNode[]): ComponentSetNode {
  const set = figma.combineAsVariants(components, figma.currentPage);
  set.name = `${NS}/${name}`;
  set.layoutMode = "HORIZONTAL";
  set.layoutWrap = "WRAP";
  set.primaryAxisSizingMode = "FIXED";
  set.counterAxisSizingMode = "AUTO";
  set.itemSpacing = 20;
  set.counterAxisSpacing = 20;
  set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 28;
  set.primaryAxisAlignItems = "MIN";
  set.counterAxisAlignItems = "MIN";
  set.resize(760, set.height);
  return set;
}

/** New empty component with auto-layout, ready to fill. */
export function newComponent(name: string): ComponentNode {
  const c = figma.createComponent();
  c.name = name;
  c.layoutMode = "HORIZONTAL";
  c.primaryAxisSizingMode = "AUTO";
  c.counterAxisSizingMode = "AUTO";
  c.primaryAxisAlignItems = "CENTER";
  c.counterAxisAlignItems = "CENTER";
  c.fills = [];
  c.strokes = [];
  return c;
}

/** A titled column that frames a specimen on the Components page. */
export async function specimenCard(
  t: ThemeContext,
  title: string,
  caption: string,
  content: SceneNode,
): Promise<FrameNode> {
  const card = autoFrame({
    name: `Specimen · ${title}`,
    direction: "VERTICAL",
    gap: 20,
    padding: 28,
    cross: "MIN",
  });
  card.cornerRadius = 16;
  fillToken(t, card, "bg/surface");
  strokeToken(t, card, "border/subtle", 1);

  const header = autoFrame({ direction: "VERTICAL", gap: 4 });
  header.appendChild(await makeText(t, "heading/h4", title, "text/primary"));
  header.appendChild(await makeText(t, "caption", caption, "text/muted"));
  card.appendChild(header);
  card.appendChild(content);
  return card;
}

/** Small helper: a bare label line (used inside specimens). */
export async function label(t: ThemeContext, text: string): Promise<TextNode> {
  return makeText(t, "label/sm", text, "text/secondary");
}

/** Type guard used by generators that need the style map present. */
export function requireStyles(t: ThemeContext): void {
  if (!textStyle(t, "body/md")) throw new Error("Text styles not built");
}
