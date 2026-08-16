/** Color helpers: hex → Figma RGB/RGBA (0..1). */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Parse #RGB, #RRGGBB, or #RRGGBBAA into an RGBA in 0..1 space. */
export function hexToRgba(hex: string): RGBA {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length === 6) h += "ff";
  if (h.length !== 8) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }
  const num = parseInt(h, 16);
  return {
    r: ((num >> 24) & 0xff) / 255,
    g: ((num >> 16) & 0xff) / 255,
    b: ((num >> 8) & 0xff) / 255,
    a: (num & 0xff) / 255,
  };
}

export function rgb(hex: string): RGB {
  const { r, g, b } = hexToRgba(hex);
  return { r, g, b };
}

export function solid(hex: string): SolidPaint {
  const { r, g, b, a } = hexToRgba(hex);
  return { type: "SOLID", color: { r, g, b }, opacity: a };
}

/** Linear gradient paint from a list of hex stops (top-left → bottom-right by default). */
export function linearGradient(
  stops: Array<{ hex: string; position: number }>,
  angle: "vertical" | "horizontal" | "diagonal" = "diagonal",
): GradientPaint {
  const transforms: Record<string, Transform> = {
    vertical: [
      [0, 1, 0],
      [-1, 0, 1],
    ],
    horizontal: [
      [1, 0, 0],
      [0, 1, 0],
    ],
    diagonal: [
      [0.7, 0.7, -0.2],
      [-0.7, 0.7, 0.5],
    ],
  };
  return {
    type: "GRADIENT_LINEAR",
    gradientTransform: transforms[angle],
    gradientStops: stops.map((s) => {
      const { r, g, b, a } = hexToRgba(s.hex);
      return { color: { r, g, b, a }, position: s.position };
    }),
  };
}
