/**
 * Section helpers shared by every section builder.
 */

import { autoFrame } from "../core/layout";
import { makeText } from "../core/nodes";
import { ThemeContext } from "../core/theme";

/** A vertical section container of fixed content width, hugging its height. */
export function section(
  _t: ThemeContext,
  id: string,
  width: number,
  gap = 32,
  padY = 96,
): FrameNode {
  const s = autoFrame({ name: `Section · ${id}`, direction: "VERTICAL", gap, cross: "MIN" });
  s.counterAxisSizingMode = "FIXED";
  s.resize(width, s.height);
  s.paddingTop = s.paddingBottom = padY;
  return s;
}

/**
 * Two real side-by-side columns.
 *
 * `layoutWrap` is row-based: a row is as tall as its tallest card, so a short
 * card leaves a larger vertical gap beneath it than its neighbour does. Real
 * columns each own their vertical rhythm, so the Y gap is identical in both —
 * cards simply flow down their own column and the columns end at different
 * heights.
 *
 * Cards are dealt alternately, so reading order stays left → right.
 */
export function twoColumns(width: number, gap: number, cards: SceneNode[]): FrameNode {
  const colW = Math.floor((width - gap) / 2);

  const row = autoFrame({ name: "Columns", direction: "HORIZONTAL", gap, cross: "MIN" });
  row.primaryAxisSizingMode = "FIXED";
  row.resize(width, row.height);

  const columns = [0, 1].map(() => {
    const col = autoFrame({ direction: "VERTICAL", gap, cross: "MIN" });
    col.counterAxisSizingMode = "FIXED";
    col.resize(colW, col.height);
    row.appendChild(col);
    return col;
  });

  cards.forEach((card, i) => columns[i % 2].appendChild(card));
  return row;
}

/** The width one card gets inside `twoColumns`. */
export function columnWidth(width: number, gap: number): number {
  return Math.floor((width - gap) / 2);
}

/** Eyebrow + title (+ optional description) block. */
export async function sectionHeading(
  t: ThemeContext,
  eyebrow: string,
  title: string,
  description?: string,
  opts: { align?: "LEFT" | "CENTER"; titleStyle?: string; maxWidth?: number } = {},
): Promise<FrameNode> {
  const align = opts.align ?? "LEFT";
  const col = autoFrame({
    direction: "VERTICAL",
    gap: 16,
    cross: align === "CENTER" ? "CENTER" : "MIN",
  });
  col.appendChild(
    await makeText(t, "overline", eyebrow, "accent/primary", { align: align as "LEFT" | "CENTER" }),
  );
  col.appendChild(
    await makeText(t, opts.titleStyle ?? "heading/h1", title, "text/primary", {
      align: align as "LEFT" | "CENTER",
      maxWidth: opts.maxWidth,
    }),
  );
  if (description) {
    col.appendChild(
      await makeText(t, "body/lg", description, "text/secondary", {
        align: align as "LEFT" | "CENTER",
        maxWidth: opts.maxWidth ?? 560,
      }),
    );
  }
  return col;
}
