/**
 * Auto-layout helpers. Everything the generators build uses auto-layout so the
 * output is responsive and editable by hand after generation.
 *
 * Sizing uses `layoutGrow` / `layoutAlign` (robust regardless of append order)
 * plus explicit fixed-size setters that respect the frame's axis.
 */

export type Align = "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
export type CrossAlign = "MIN" | "CENTER" | "MAX";
type Padding = number | [number, number] | { t: number; r: number; b: number; l: number };

export interface AutoLayoutOpts {
  name?: string;
  direction?: "VERTICAL" | "HORIZONTAL";
  gap?: number;
  padding?: Padding;
  align?: Align; // primary-axis distribution
  cross?: CrossAlign; // counter-axis alignment
  wrap?: boolean;
  clip?: boolean;
}

function applyPadding(f: FrameNode, p?: Padding): void {
  if (p === undefined) return;
  if (typeof p === "number") {
    f.paddingTop = f.paddingRight = f.paddingBottom = f.paddingLeft = p;
  } else if (Array.isArray(p)) {
    const [v, h] = p;
    f.paddingTop = f.paddingBottom = v;
    f.paddingLeft = f.paddingRight = h;
  } else {
    f.paddingTop = p.t;
    f.paddingRight = p.r;
    f.paddingBottom = p.b;
    f.paddingLeft = p.l;
  }
}

/** Create an auto-layout frame that hugs its contents by default. */
export function autoFrame(opts: AutoLayoutOpts = {}): FrameNode {
  const f = figma.createFrame();
  f.layoutMode = opts.direction ?? "VERTICAL";
  f.itemSpacing = opts.gap ?? 0;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.primaryAxisAlignItems = opts.align ?? "MIN";
  f.counterAxisAlignItems = opts.cross ?? "MIN";
  applyPadding(f, opts.padding);
  if (opts.wrap) f.layoutWrap = "WRAP";
  f.clipsContent = opts.clip ?? false;
  f.fills = [];
  f.strokes = [];
  if (opts.name) f.name = opts.name;
  return f;
}

/** Append children in order and return the parent (fluent). */
export function append<T extends BaseNode & ChildrenMixin>(parent: T, ...children: SceneNode[]): T {
  for (const c of children) parent.appendChild(c);
  return parent;
}

/** Fill the parent's counter axis (stretch). */
export function stretch<T extends SceneNode & LayoutMixin>(node: T): T {
  node.layoutAlign = "STRETCH";
  return node;
}

/** Fill the parent's primary axis (grow). */
export function grow<T extends SceneNode & LayoutMixin>(node: T, factor = 1): T {
  node.layoutGrow = factor;
  return node;
}

/** Set a fixed width, respecting the frame's layout axis. */
export function fixedWidth(f: FrameNode, w: number): FrameNode {
  if (f.layoutMode === "HORIZONTAL") f.primaryAxisSizingMode = "FIXED";
  else f.counterAxisSizingMode = "FIXED";
  f.resize(w, f.height);
  return f;
}

/**
 * Set an explicit width AND height on an auto-layout frame.
 *
 * Order matters: `resize()` on an AUTO-sizing axis is discarded immediately and
 * the frame snaps back to hugging its contents. Both axes must be switched to
 * FIXED *before* resizing, otherwise the frame collapses to its hug size.
 */
export function fixedSize(f: FrameNode, w: number, h: number): FrameNode {
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.resize(w, h);
  return f;
}

/** Set a fixed height, respecting the frame's layout axis. */
export function fixedHeight(f: FrameNode, h: number): FrameNode {
  if (f.layoutMode === "HORIZONTAL") f.counterAxisSizingMode = "FIXED";
  else f.primaryAxisSizingMode = "FIXED";
  f.resize(f.width, h);
  return f;
}

/**
 * A flexible spacer that pushes siblings apart.
 *
 * Both axes are pinned to a hairline before `layoutGrow` takes over the primary
 * axis: an empty auto-layout frame has nothing to hug, so it keeps Figma's
 * default 100×100 and silently inflates any parent that sizes to its content
 * (this is what made the glass header 124px tall).
 */
export function spacer(): FrameNode {
  const f = autoFrame({ name: "spacer", direction: "HORIZONTAL" });
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.resize(0.01, 0.01);
  f.layoutGrow = 1;
  return f;
}
