/**
 * Lightweight vector charts — sparklines, line/area, and bars. Reusable in
 * stat cards and standalone chart components. All recolor via a color token.
 */

import { linearGradient } from "./color";
import { autoFrame } from "./layout";
import { ThemeContext, colorVar } from "./theme";

function bound(v: Variable): SolidPaint {
  const p: SolidPaint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
  return figma.variables.setBoundVariableForPaint(p, "color", v) as SolidPaint;
}

const ACCENT_HEX = "#5EE6C1";

interface LineOpts {
  token?: string;
  area?: boolean;
  strokeW?: number;
  areaHex?: string;
  markers?: boolean;
}

/** A line / area chart (or sparkline when small) through `values`. */
export function lineChart(
  t: ThemeContext,
  values: number[],
  w: number,
  h: number,
  opts: LineOpts = {},
): FrameNode {
  const f = figma.createFrame();
  f.name = "chart/line";
  f.resize(w, h);
  f.fills = [];
  f.clipsContent = true;
  const pad = Math.max(2, opts.strokeW ?? 2);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const n = values.length;
  const pts = values.map((v, i) => ({
    x: (i / (n - 1)) * (w - pad * 2) + pad,
    y: h - pad - ((v - min) / range) * (h - pad * 2),
  }));
  const line = "M " + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");

  if (opts.area) {
    const area = figma.createVector();
    area.name = "area";
    area.vectorPaths = [
      { windingRule: "NONZERO", data: `${line} L ${(w - pad).toFixed(1)} ${h} L ${pad} ${h} Z` },
    ];
    area.strokes = [];
    area.fills = [
      linearGradient(
        [
          { hex: `${opts.areaHex ?? ACCENT_HEX}52`, position: 0 },
          { hex: `${opts.areaHex ?? ACCENT_HEX}00`, position: 1 },
        ],
        "vertical",
      ),
    ];
    f.appendChild(area);
  }

  const lv = figma.createVector();
  lv.name = "line";
  lv.vectorPaths = [{ windingRule: "NONE", data: line }];
  lv.strokes = [bound(colorVar(t, opts.token ?? "accent/primary"))];
  lv.strokeWeight = opts.strokeW ?? 2;
  lv.strokeCap = "ROUND";
  lv.strokeJoin = "ROUND";
  lv.fills = [];
  f.appendChild(lv);

  if (opts.markers) {
    const dotPaint = bound(colorVar(t, opts.token ?? "accent/primary"));
    for (const p of pts) {
      const dot = figma.createEllipse();
      dot.resize(5, 5);
      dot.fills = [dotPaint];
      dot.strokes = [];
      dot.x = p.x - 2.5;
      dot.y = p.y - 2.5;
      f.appendChild(dot);
    }
  }
  return f;
}

/** Convenience: a compact sparkline with area fill. */
export function sparkline(
  t: ThemeContext,
  values: number[],
  w: number,
  h: number,
  token = "accent/primary",
): FrameNode {
  return lineChart(t, values, w, h, { token, area: true, strokeW: 2 });
}

/** A bar chart aligned to the bottom. */
export function barChart(
  t: ThemeContext,
  values: number[],
  w: number,
  h: number,
  token = "accent/primary",
): FrameNode {
  const f = autoFrame({ direction: "HORIZONTAL", cross: "MAX" });
  f.resize(w, h);
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  const n = values.length;
  const gap = Math.max(3, Math.round(w * 0.02));
  f.itemSpacing = gap;
  const barW = (w - gap * (n - 1)) / n;
  const max = Math.max(...values) || 1;
  const paint = bound(colorVar(t, token));
  for (const v of values) {
    const bh = Math.max(4, (v / max) * h);
    const r = figma.createRectangle();
    r.resize(barW, bh);
    r.cornerRadius = Math.min(4, barW / 2);
    r.fills = [paint];
    r.strokes = [];
    f.appendChild(r);
  }
  return f;
}

/** Categorical palette for pie / gantt / multi-series. */
export const CHART_PALETTE = [
  "accent/primary",
  "accent/secondary",
  "feedback/warning",
  "feedback/success",
  "feedback/danger",
];

/** A donut / pie chart from `values`, colored by the palette. */
export function pieChart(
  t: ThemeContext,
  values: number[],
  size: number,
  innerRadius = 0.6,
): FrameNode {
  const f = figma.createFrame();
  f.name = "chart/pie";
  f.resize(size, size);
  f.fills = [];
  const total = values.reduce((a, b) => a + b, 0) || 1;
  let angle = -Math.PI / 2;
  values.forEach((v, i) => {
    const sweep = (v / total) * Math.PI * 2;
    const seg = figma.createEllipse();
    seg.resize(size, size);
    seg.arcData = { startingAngle: angle, endingAngle: angle + sweep, innerRadius };
    seg.fills = [bound(colorVar(t, CHART_PALETTE[i % CHART_PALETTE.length]))];
    seg.strokes = [];
    f.appendChild(seg);
    angle += sweep;
  });
  return f;
}

/** A Gantt chart: each task is a bar placed by [start, end] fractions (0–1). */
export function ganttChart(
  t: ThemeContext,
  tasks: Array<{ start: number; end: number }>,
  w: number,
  h: number,
): FrameNode {
  const f = figma.createFrame();
  f.name = "chart/gantt";
  f.resize(w, h);
  f.fills = [];
  const rowH = h / tasks.length;
  const bh = Math.max(6, rowH * 0.55);
  tasks.forEach((task, i) => {
    const rail = figma.createRectangle();
    rail.resize(w, 1);
    rail.fills = [bound(colorVar(t, "border/subtle"))];
    rail.strokes = [];
    rail.x = 0;
    rail.y = i * rowH + rowH / 2;
    f.appendChild(rail);
    const bar = figma.createRectangle();
    bar.resize(Math.max(6, (task.end - task.start) * w), bh);
    bar.cornerRadius = bh / 2;
    bar.fills = [bound(colorVar(t, CHART_PALETTE[i % CHART_PALETTE.length]))];
    bar.strokes = [];
    bar.x = task.start * w;
    bar.y = i * rowH + (rowH - bh) / 2;
    f.appendChild(bar);
  });
  return f;
}

/** Overlay several line series (different palette colors) in one frame. */
export function multiLine(t: ThemeContext, series: number[][], w: number, h: number): FrameNode {
  const f = figma.createFrame();
  f.name = "chart/multi-line";
  f.resize(w, h);
  f.fills = [];
  f.clipsContent = true;
  series.forEach((values, i) => {
    const line = lineChart(t, values, w, h, {
      token: CHART_PALETTE[i % CHART_PALETTE.length],
      strokeW: 2,
    });
    line.x = 0;
    line.y = 0;
    f.appendChild(line);
  });
  return f;
}
