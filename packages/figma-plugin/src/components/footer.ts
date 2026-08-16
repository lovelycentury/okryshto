/**
 * Footer (organism) — minimal editorial footer: brand, socials, fine print.
 */

import { SITE } from "../tokens";
import { autoFrame, spacer } from "../core/layout";
import { fillToken, makeText } from "../core/nodes";
import { ThemeContext } from "../core/theme";
import { brandMark } from "./navbar";

export async function footer(t: ThemeContext, width: number, stack = false): Promise<FrameNode> {
  const f = autoFrame({ name: "Footer", direction: "VERTICAL", gap: 24 });
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "FIXED";
  f.resize(width, f.height);

  const line = figma.createRectangle();
  line.resize(width, 1);
  line.name = "hairline";
  fillToken(t, line, "border/subtle");
  f.appendChild(line);

  const row = autoFrame({
    direction: stack ? "VERTICAL" : "HORIZONTAL",
    gap: stack ? 24 : 16,
    cross: stack ? "MIN" : "CENTER",
  });
  row.layoutAlign = "STRETCH";
  row.appendChild(await brandMark(t, 28, true));
  if (!stack) row.appendChild(spacer());

  const socials = autoFrame({ direction: "HORIZONTAL", gap: 20, cross: "CENTER" });
  for (const s of SITE.contact.socials) {
    socials.appendChild(await makeText(t, "label/md", s, "text/secondary"));
  }
  row.appendChild(socials);
  f.appendChild(row);

  const meta = autoFrame({
    direction: stack ? "VERTICAL" : "HORIZONTAL",
    gap: stack ? 6 : 16,
    cross: stack ? "MIN" : "CENTER",
  });
  meta.layoutAlign = "STRETCH";
  meta.appendChild(await makeText(t, "caption", SITE.footer.copyright, "text/muted"));
  if (!stack) meta.appendChild(spacer());
  meta.appendChild(await makeText(t, "caption", SITE.footer.note, "text/muted"));
  f.appendChild(meta);

  return f;
}
