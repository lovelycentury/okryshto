/**
 * Component registry — builds every atomic/molecular component set and returns
 * them for (a) the Components page painter and (b) section composition (instances).
 */

import { ThemeContext } from "../core/theme";
import { buildButtonSet } from "./button";
import { buildBadgeSet } from "./badge";
import { buildInputSet } from "./input";
import { buildAvatarSet } from "./avatar";
import { buildLinkCardSet } from "./linkCard";
import { buildCardSet } from "./card";
import { buildIconButtonSet } from "./iconButton";
import { buildSurfaceSet } from "./surface";

export * from "./navbar";
export * from "./menu";
export * from "./footer";
export * from "./primitives";
export * from "./carousel";

export interface ComponentLibrary {
  button: ComponentSetNode;
  badge: ComponentSetNode;
  input: ComponentSetNode;
  avatar: ComponentSetNode;
  linkCard: ComponentSetNode;
  card: ComponentSetNode;
  iconButton: ComponentSetNode;
  surface: ComponentSetNode;
}

/**
 * Build all component sets. They are created on the current page (combineAsVariants
 * requires a parent); the Components page painter re-parents them into a layout.
 */
export async function buildComponents(t: ThemeContext): Promise<ComponentLibrary> {
  return {
    button: await buildButtonSet(t),
    badge: await buildBadgeSet(t),
    input: await buildInputSet(t),
    avatar: await buildAvatarSet(t),
    linkCard: await buildLinkCardSet(t),
    card: await buildCardSet(t),
    iconButton: await buildIconButtonSet(t),
    surface: await buildSurfaceSet(t),
  };
}

/** Instance of a component set's specific variant, ready to place. */
export function instance(set: ComponentSetNode, props: Record<string, string>): InstanceNode {
  const inst = set.defaultVariant.createInstance();
  inst.setProperties(props);
  return inst;
}

/** Override a named text layer inside an instance (font is reloaded defensively). */
export async function setInstanceText(
  inst: InstanceNode,
  layerName: string,
  text: string,
): Promise<void> {
  const node = inst.findOne((n) => n.type === "TEXT" && n.name === layerName) as TextNode | null;
  if (!node) return;
  if (node.fontName !== figma.mixed) {
    await figma.loadFontAsync(node.fontName);
  }
  node.characters = text;
}
