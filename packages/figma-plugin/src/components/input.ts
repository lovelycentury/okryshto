/**
 * Input — variant set on State (Default · Focus · Filled). Fixed 320px width,
 * label + field, focus ring driven by the accent token.
 */

import { RADII } from "../tokens";
import { fillToken, makeText, strokeToken } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { applyEffect, newComponent } from "./primitives";

type State = "Default" | "Focus" | "Filled";

async function buildInput(t: ThemeContext, state: State): Promise<ComponentNode> {
  const c = newComponent(`State=${state}`);
  c.layoutMode = "VERTICAL";
  c.counterAxisAlignItems = "MIN";
  c.primaryAxisAlignItems = "MIN";
  c.itemSpacing = 8;
  c.resize(320, c.height);
  c.counterAxisSizingMode = "FIXED";

  c.appendChild(await makeText(t, "label/sm", "Email", "text/secondary"));

  const field = figma.createFrame();
  field.name = "field";
  field.layoutMode = "HORIZONTAL";
  field.primaryAxisSizingMode = "FIXED";
  field.counterAxisSizingMode = "AUTO";
  field.counterAxisAlignItems = "CENTER";
  field.paddingLeft = field.paddingRight = 16;
  field.paddingTop = field.paddingBottom = 13;
  field.cornerRadius = RADII.md;
  field.layoutAlign = "STRETCH";
  fillToken(t, field, "bg/inset");

  if (state === "Focus") {
    strokeToken(t, field, "state/focus", 1.5);
    await applyEffect(field, "glow/accent", t);
  } else {
    strokeToken(t, field, "border/default", 1);
  }

  const value = await makeText(
    t,
    "body/md",
    state === "Filled" ? "hello@oleksii.dev" : "you@company.com",
    state === "Filled" ? "text/primary" : "text/muted",
  );
  field.appendChild(value);
  c.appendChild(field);
  return c;
}

export async function buildInputSet(t: ThemeContext): Promise<ComponentSetNode> {
  const comps: ComponentNode[] = [];
  for (const s of ["Default", "Focus", "Filled"] as State[]) {
    comps.push(await buildInput(t, s));
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Vizitka/Input";
  set.layoutMode = "HORIZONTAL";
  set.itemSpacing = 24;
  set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 28;
  set.primaryAxisSizingMode = "AUTO";
  set.counterAxisSizingMode = "AUTO";
  set.counterAxisAlignItems = "MIN";
  return set;
}
