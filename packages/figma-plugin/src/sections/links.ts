/**
 * Selected Links section — the core of a vizitka. Reuses the LinkCard component
 * (instances with per-item text overrides), stacked full-width.
 */

import { SITE } from "../tokens";
import { autoFrame } from "../core/layout";
import { ThemeContext } from "../core/theme";
import { ComponentLibrary, instance, setInstanceText } from "../components";
import { section, sectionHeading } from "./helpers";

export async function linksSection(
  t: ThemeContext,
  width: number,
  lib: ComponentLibrary,
): Promise<FrameNode> {
  const s = section(t, "Links", width, 40);

  const head = await sectionHeading(
    t,
    "Selected links",
    "A few doors worth opening.",
    "The short list — work, words, and where to find me. Everything else can wait.",
    { titleStyle: "heading/h1", maxWidth: Math.min(width, 620) },
  );
  head.layoutAlign = "STRETCH";
  s.appendChild(head);

  const list = autoFrame({ direction: "VERTICAL", gap: 14 });
  list.layoutAlign = "STRETCH";
  for (const item of SITE.links) {
    const inst = instance(lib.linkCard, { Variant: item.featured ? "Featured" : "Default" });
    inst.layoutAlign = "STRETCH";
    await setInstanceText(inst, "title", item.title);
    await setInstanceText(inst, "subtitle", item.subtitle);
    await setInstanceText(inst, "meta", item.meta);
    list.appendChild(inst);
  }
  s.appendChild(list);
  return s;
}
