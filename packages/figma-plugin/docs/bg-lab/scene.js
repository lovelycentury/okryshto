/* Full-page layered background on PixiJS v8.
 *
 * One fixed, viewport-sized scene behind the content. Every element is a real display
 * layer: nebulae are sprites with blend modes and a displacement filter, stars are
 * individual sprites with their own twinkle phase and parallax depth, the dante spark is
 * a single rotated streak sprite. Themes crossfade. All tuning lives in LAYERS / PRESETS.
 */
"use strict";

const DANTE = "#FF3D8B";

// ---------------------------------------------------------------------------
// presets — hues mirror COVER_* / accent tokens in src/pages/catalog.ts
//
//   fx    — horizontal position, fraction of viewport width
//   fy    — vertical position in VIEWPORT HEIGHTS down the document (0 = first screen,
//           2.5 = two and a half screens down). This is why glows keep arriving as you scroll.
//   size  — diameter as a fraction of viewport width
//   ratio — width/height stretch (>1 = wide wash)
//   kind  — 'glow' = smooth radial wash (the big ones), 'neb' = filamented cloud
//   depth — parallax depth: bigger = moves more, scrolls faster
//   shimmer — iridescence: the sprite is drawn white and tinted, drifting between
//             two hues while its opacity breathes. Used for the dante veils.
// ---------------------------------------------------------------------------
const SHIMMER_DANTE = { a: "#FF3D8B", b: "#B84BFF", speed: 0.11, amount: 0.38 };
const SHIMMER_DANTE_WARM = { a: "#FF3D8B", b: "#FF8A5C", speed: 0.085, amount: 0.32 };
const PRESETS = {
  aurora: {
    base: "#0A0A0B",
    glow: "#141821",
    starAlpha: 1.0,
    fireworkHues: ["#5EE6C1", "#FF3D8B", "#818CF8", "#FFFFFF"],
    nebulae: [
      {
        hex: "#5EE6C1",
        fx: 0.88,
        fy: 0.3,
        size: 1.15,
        ratio: 1.15,
        alpha: 0.3,
        kind: "glow",
        seed: 1,
        blend: "add",
        depth: 0.08,
      },
      {
        hex: "#5EE6C1",
        fx: 0.72,
        fy: 0.22,
        size: 0.55,
        ratio: 1.0,
        alpha: 0.16,
        kind: "neb",
        seed: 2,
        blend: "add",
        depth: 0.16,
      },
      {
        hex: "#818CF8",
        fx: 0.06,
        fy: 1.05,
        size: 0.95,
        ratio: 0.95,
        alpha: 0.26,
        kind: "glow",
        seed: 3,
        blend: "screen",
        depth: 0.12,
      },
      {
        hex: "#FF3D8B",
        fx: 0.94,
        fy: 1.55,
        size: 0.85,
        ratio: 1.1,
        alpha: 0.16,
        kind: "glow",
        seed: 4,
        blend: "add",
        depth: 0.18,
      },
      {
        hex: "#5EE6C1",
        fx: 0.3,
        fy: 2.1,
        size: 1.0,
        ratio: 1.3,
        alpha: 0.18,
        kind: "glow",
        seed: 5,
        blend: "screen",
        depth: 0.1,
      },
      {
        hex: "#818CF8",
        fx: 0.8,
        fy: 2.75,
        size: 0.8,
        ratio: 1.0,
        alpha: 0.2,
        kind: "neb",
        seed: 6,
        blend: "screen",
        depth: 0.2,
      },
      {
        hex: "#FF3D8B",
        fx: 0.18,
        fy: 3.35,
        size: 0.9,
        ratio: 1.2,
        alpha: 0.14,
        kind: "glow",
        seed: 7,
        blend: "add",
        depth: 0.14,
      },
      {
        hex: "#5EE6C1",
        fx: 0.85,
        fy: 4.0,
        size: 1.05,
        ratio: 1.1,
        alpha: 0.22,
        kind: "glow",
        seed: 8,
        blend: "add",
        depth: 0.1,
      },
      {
        hex: "#FFFFFF",
        fx: 0.62,
        fy: 0.12,
        size: 0.34,
        ratio: 1.0,
        alpha: 0.07,
        kind: "glow",
        seed: 9,
        blend: "add",
        depth: 0.26,
      },
      // dante veils — iridescent, drifting between blood-pink and violet
      {
        hex: "#FFFFFF",
        fx: 0.55,
        fy: 0.75,
        size: 0.95,
        ratio: 1.25,
        alpha: 0.15,
        kind: "glow",
        seed: 10,
        blend: "add",
        depth: 0.15,
        shimmer: SHIMMER_DANTE,
      },
      {
        hex: "#FFFFFF",
        fx: 0.1,
        fy: 2.45,
        size: 0.85,
        ratio: 1.0,
        alpha: 0.13,
        kind: "neb",
        seed: 11,
        blend: "add",
        depth: 0.19,
        shimmer: SHIMMER_DANTE,
      },
      {
        hex: "#FFFFFF",
        fx: 0.92,
        fy: 3.6,
        size: 1.0,
        ratio: 1.15,
        alpha: 0.14,
        kind: "glow",
        seed: 12,
        blend: "add",
        depth: 0.13,
        shimmer: SHIMMER_DANTE_WARM,
      },
      {
        hex: "#818CF8",
        fx: 0.45,
        fy: 4.6,
        size: 0.9,
        ratio: 1.1,
        alpha: 0.18,
        kind: "glow",
        seed: 13,
        blend: "screen",
        depth: 0.12,
      },
    ],
  },
  midnight: {
    base: "#0B1020",
    glow: "#141b33",
    starAlpha: 0.85,
    fireworkHues: ["#818CF8", "#5EE6C1", "#FFFFFF", "#FF3D8B"],
    nebulae: [
      {
        hex: "#4457A0",
        fx: 0.68,
        fy: 0.28,
        size: 1.2,
        ratio: 1.2,
        alpha: 0.34,
        kind: "glow",
        seed: 11,
        blend: "add",
        depth: 0.08,
      },
      {
        hex: "#2E5E8C",
        fx: 0.1,
        fy: 0.85,
        size: 0.95,
        ratio: 1.0,
        alpha: 0.28,
        kind: "glow",
        seed: 12,
        blend: "add",
        depth: 0.14,
      },
      {
        hex: "#5EE6C1",
        fx: 0.82,
        fy: 1.5,
        size: 0.7,
        ratio: 1.0,
        alpha: 0.14,
        kind: "neb",
        seed: 13,
        blend: "screen",
        depth: 0.2,
      },
      {
        hex: "#4457A0",
        fx: 0.32,
        fy: 2.15,
        size: 1.1,
        ratio: 1.3,
        alpha: 0.26,
        kind: "glow",
        seed: 14,
        blend: "screen",
        depth: 0.1,
      },
      {
        hex: "#818CF8",
        fx: 0.9,
        fy: 2.8,
        size: 0.85,
        ratio: 1.0,
        alpha: 0.18,
        kind: "glow",
        seed: 15,
        blend: "add",
        depth: 0.16,
      },
      {
        hex: "#2E5E8C",
        fx: 0.15,
        fy: 3.6,
        size: 1.0,
        ratio: 1.15,
        alpha: 0.24,
        kind: "glow",
        seed: 16,
        blend: "add",
        depth: 0.12,
      },
      {
        hex: "#5EE6C1",
        fx: 0.7,
        fy: 4.2,
        size: 0.75,
        ratio: 1.0,
        alpha: 0.12,
        kind: "neb",
        seed: 17,
        blend: "add",
        depth: 0.22,
      },
      {
        hex: "#FFFFFF",
        fx: 0.48,
        fy: 1.1,
        size: 0.9,
        ratio: 1.2,
        alpha: 0.12,
        kind: "glow",
        seed: 18,
        blend: "add",
        depth: 0.16,
        shimmer: SHIMMER_DANTE,
      },
      {
        hex: "#FFFFFF",
        fx: 0.88,
        fy: 3.2,
        size: 0.95,
        ratio: 1.0,
        alpha: 0.11,
        kind: "neb",
        seed: 19,
        blend: "add",
        depth: 0.18,
        shimmer: SHIMMER_DANTE,
      },
      {
        hex: "#4457A0",
        fx: 0.35,
        fy: 4.7,
        size: 1.0,
        ratio: 1.15,
        alpha: 0.22,
        kind: "glow",
        seed: 20,
        blend: "screen",
        depth: 0.1,
      },
    ],
  },
  neon: {
    base: "#0A0A14",
    glow: "#161028",
    starAlpha: 0.75,
    fireworkHues: ["#FF3D8B", "#B84BFF", "#5EE6C1", "#FFFFFF"],
    nebulae: [
      {
        hex: "#B84BFF",
        fx: 0.82,
        fy: 0.25,
        size: 1.2,
        ratio: 1.2,
        alpha: 0.3,
        kind: "glow",
        seed: 21,
        blend: "add",
        depth: 0.08,
      },
      {
        hex: "#FF3D8B",
        fx: 0.12,
        fy: 0.9,
        size: 0.9,
        ratio: 1.0,
        alpha: 0.22,
        kind: "glow",
        seed: 22,
        blend: "add",
        depth: 0.16,
      },
      {
        hex: "#B84BFF",
        fx: 0.55,
        fy: 1.6,
        size: 0.8,
        ratio: 1.0,
        alpha: 0.2,
        kind: "neb",
        seed: 23,
        blend: "screen",
        depth: 0.18,
      },
      {
        hex: "#5EE6C1",
        fx: 0.95,
        fy: 2.2,
        size: 0.7,
        ratio: 1.0,
        alpha: 0.14,
        kind: "glow",
        seed: 24,
        blend: "add",
        depth: 0.2,
      },
      {
        hex: "#FF3D8B",
        fx: 0.25,
        fy: 2.9,
        size: 1.05,
        ratio: 1.25,
        alpha: 0.2,
        kind: "glow",
        seed: 25,
        blend: "screen",
        depth: 0.1,
      },
      {
        hex: "#B84BFF",
        fx: 0.88,
        fy: 3.7,
        size: 1.0,
        ratio: 1.1,
        alpha: 0.26,
        kind: "glow",
        seed: 26,
        blend: "add",
        depth: 0.12,
      },
      {
        hex: "#FF3D8B",
        fx: 0.4,
        fy: 4.35,
        size: 0.75,
        ratio: 1.0,
        alpha: 0.16,
        kind: "neb",
        seed: 27,
        blend: "add",
        depth: 0.22,
      },
      {
        hex: "#FFFFFF",
        fx: 0.62,
        fy: 0.7,
        size: 1.0,
        ratio: 1.2,
        alpha: 0.18,
        kind: "glow",
        seed: 28,
        blend: "add",
        depth: 0.14,
        shimmer: SHIMMER_DANTE,
      },
      {
        hex: "#FFFFFF",
        fx: 0.2,
        fy: 1.95,
        size: 0.85,
        ratio: 1.0,
        alpha: 0.15,
        kind: "neb",
        seed: 29,
        blend: "add",
        depth: 0.2,
        shimmer: SHIMMER_DANTE_WARM,
      },
      {
        hex: "#FFFFFF",
        fx: 0.75,
        fy: 4.9,
        size: 0.95,
        ratio: 1.1,
        alpha: 0.16,
        kind: "glow",
        seed: 30,
        blend: "add",
        depth: 0.15,
        shimmer: SHIMMER_DANTE,
      },
    ],
  },
  // deep space: dust, a couple of cold washes, the occasional spark — legibility baseline
  void: {
    base: "#08080A",
    glow: "#101014",
    starAlpha: 0.9,
    // void stays cold: white sparks, one dante accent, and rarer bursts
    fireworkHues: ["#FFFFFF", "#C9D2E4", "#FF3D8B"],
    nebulae: [
      {
        hex: "#2A2F3A",
        fx: 0.8,
        fy: 0.4,
        size: 1.1,
        ratio: 1.2,
        alpha: 0.24,
        kind: "glow",
        seed: 31,
        blend: "add",
        depth: 0.08,
      },
      {
        hex: "#232833",
        fx: 0.15,
        fy: 1.8,
        size: 1.0,
        ratio: 1.0,
        alpha: 0.22,
        kind: "glow",
        seed: 32,
        blend: "screen",
        depth: 0.12,
      },
      {
        hex: "#2A2F3A",
        fx: 0.75,
        fy: 3.4,
        size: 1.05,
        ratio: 1.1,
        alpha: 0.2,
        kind: "glow",
        seed: 33,
        blend: "screen",
        depth: 0.1,
      },
      // one faint dante breath, so even the empty theme is not entirely cold
      {
        hex: "#FFFFFF",
        fx: 0.5,
        fy: 2.6,
        size: 0.9,
        ratio: 1.2,
        alpha: 0.07,
        kind: "glow",
        seed: 34,
        blend: "add",
        depth: 0.16,
        shimmer: SHIMMER_DANTE,
      },
      {
        hex: "#232833",
        fx: 0.85,
        fy: 4.6,
        size: 1.0,
        ratio: 1.0,
        alpha: 0.18,
        kind: "glow",
        seed: 35,
        blend: "screen",
        depth: 0.12,
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// LAYERS — the whole look lives here
// ---------------------------------------------------------------------------
const LAYERS = {
  nebula: {
    scale: 1.6, // global size multiplier for every nebula
    spread: 1.14, // stretches fy spacing so bigger blobs don't crowd each other
    alphaScale: 0.72, // global dimmer — more nebulae meant more light
    driftSpeed: 0.012,
    rotSpeed: 0.0055,
    breathe: 0.09,
    breatheSpeed: 0.07,
    displaceScale: 26,
    displaceSpin: 0.05,
  },
  // sizes are px of the visible core; the dot texture is mostly transparent skirt
  starsFar: {
    count: 220,
    minSize: 1.6,
    maxSize: 3.0,
    depth: 0.15,
    twinkleMin: 0.22,
    twinkleMax: 0.8,
    speed: 0.55,
    squash: 0.3,
  },
  starsNear: {
    count: 70,
    minSize: 3.0,
    maxSize: 5.2,
    depth: 0.45,
    twinkleMin: 0.1,
    twinkleMax: 1.0,
    speed: 0.85,
    squash: 0.42,
  },
  // one clean falling line — a single streak sprite, not a chain of dots
  spark: {
    pool: 3, // independent streaks, staggered — several can fall at once
    len: 0.3, // streak length, fraction of viewport height
    thickness: 13, // sprite height in px; the lit core is ~1.5 px of it
    angle: [60, 78], // degrees below horizontal — steep, falling
    entryX: [0.05, 0.85], // where it crosses the top edge
    dur: [17, 26], // a full crossing takes ~21 s — slow enough to watch
    gap: [2.0, 6.0],
    accel: 1.05, // ~linear drift, no whip
    fadeIn: 0.16,
    fadeOut: 2.2, // was 1.15 — burns out much faster on the way down
    stretch: 0.35, // how much the streak lengthens as it gathers speed
  },
  // a distant sun: swells in slowly, flickers for ~4 s, dies back out
  //
  // A single flare now lasts ~5.8 s, so "4 starts per 15 s" only works with overlap:
  // POOL beacons run independently, each on its own long cycle.
  //   starts per 15 s = POOL * 15 / (avg(dur) + avg(gap)) = 6 * 15 / 11.3 ≈ 8
  beacon: {
    pool: 6, // doubled: ~8 flares per 15 s
    gap: [3.5, 7.5],
    dur: [5.0, 6.6],
    rise: 0.3, // fraction of the flare spent swelling in
    fall: 0.3, // …and guttering out; the middle ~4 s is the flicker
    coreSize: 6,
    haloSize: 96, // was 190 — far less spilled light
    coreAlpha: 0.8,
    haloAlpha: 0.13,
    flickerHz: 5.0,
    flickerAmount: 0.2,
    tint: "#FFF0D2", // warm sunlight, deliberately unlike dante
    margin: 0.1,
  },
  // micro-fireworks — see fireworks.js for the full knob list; anything set here
  // overrides Fireworks.DEFAULTS. Per-theme hues live in PRESETS[*].fireworkHues.
  fireworks: {
    pool: 2,
    gap: [4.0, 11.0],
    radius: [0.07, 0.125],
    region: { x: [0.08, 0.92], y: [0.1, 0.88] },
    alpha: 0.9,
  },
  grain: { alpha: 0.05, speed: 26 },
  parallax: { strength: 30, ease: 0.06, scroll: 0.06 },
  crossfade: 0.7, // seconds
};

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const rand = (a, b) => a + Math.random() * (b - a);
const rgb255 = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Blend two hex colours into a Pixi tint int. */
function lerpTint(hexA, hexB, k) {
  const a = rgb255(hexA),
    b = rgb255(hexB);
  const r = Math.round(a[0] + (b[0] - a[0]) * k);
  const g = Math.round(a[1] + (b[1] - a[1]) * k);
  const bl = Math.round(a[2] + (b[2] - a[2]) * k);
  return (r << 16) | (g << 8) | bl;
}

function hash2(x, y, seed) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}
function vnoise(x, y, seed) {
  const xi = Math.floor(x),
    yi = Math.floor(y);
  const xf = x - xi,
    yf = y - yi;
  const u = xf * xf * (3 - 2 * xf),
    v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed),
    b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed),
    d = hash2(xi + 1, yi + 1, seed);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}
function fbm(x, y, seed, octaves) {
  let amp = 0.5,
    sum = 0,
    norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * vnoise(x, y, seed + i * 13);
    norm += amp;
    x *= 2.02;
    y *= 2.02;
    amp *= 0.5;
  }
  return sum / norm;
}

// ---------------------------------------------------------------------------
// textures (generated once, cached)
// ---------------------------------------------------------------------------
const texCache = new Map();
const cached = (key, make) => {
  if (!texCache.has(key)) texCache.set(key, PIXI.Texture.from(make()));
  return texCache.get(key);
};

/** Soft, domain-warped nebula — filaments, not cotton wool. */
function nebulaCanvas(hex, seed) {
  const S = 320;
  const src = document.createElement("canvas");
  src.width = src.height = S;
  const ctx = src.getContext("2d");
  const img = ctx.createImageData(S, S);
  const [r, g, b] = rgb255(hex);
  const d = img.data;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S,
        v = y / S;
      const wx = fbm(u * 3.0, v * 3.0, seed, 4);
      const wy = fbm(u * 3.0 + 5.2, v * 3.0 + 1.3, seed, 4);
      const n = fbm(u * 4.2 + wx * 2.2, v * 4.2 + wy * 2.2, seed + 31, 5);
      const dx = (u - 0.5) * 2,
        dy = (v - 0.5) * 2;
      const fall = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
      let a = Math.pow(Math.max(0, n - 0.3) * 2.05, 1.28) * Math.pow(fall, 1.7);
      a = Math.min(1, a * 1.3);
      // S-curve: dense filaments firm up, the flat haze between them thins out.
      // Endpoints stay at 0 and 1, so this buys definition without extra glow.
      a = a * a * (3 - 2 * a) * 0.55 + a * 0.45;
      const i = (y * S + x) * 4;
      const hot = Math.pow(a, 1.75) * 0.58; // cores burn closer to white
      d[i] = Math.min(255, r + (255 - r) * hot);
      d[i + 1] = Math.min(255, g + (255 - g) * hot);
      d[i + 2] = Math.min(255, b + (255 - b) * hot);
      d[i + 3] = a * 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // pre-blur in the texture: softer and far cheaper than a runtime BlurFilter
  const out = document.createElement("canvas");
  out.width = out.height = S;
  const octx = out.getContext("2d");
  octx.filter = "blur(7px)";
  octx.drawImage(src, 0, 0);
  return out;
}

/** Big smooth wash — the wide colour fields from the reference screens. */
function glowCanvas(hex) {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(S, S);
  const [r, g, b] = rgb255(hex);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (x / S - 0.5) * 2,
        dy = (y / S - 0.5) * 2;
      const d = Math.sqrt(dx * dx + dy * dy);
      // gaussian core with a long soft skirt — no visible edge anywhere
      let a = Math.exp(-3.1 * d * d) * Math.max(0, 1 - Math.pow(d, 1.6));
      a = a * (0.82 + 0.18 * a); // firmer heart, same soft outer skirt
      const i = (y * S + x) * 4;
      const hot = Math.pow(a, 2.2) * 0.46;
      img.data[i] = Math.min(255, r + (255 - r) * hot);
      img.data[i + 1] = Math.min(255, g + (255 - g) * hot);
      img.data[i + 2] = Math.min(255, b + (255 - b) * hot);
      img.data[i + 3] = Math.min(1, a * 1.1) * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/**
 * A falling-star streak: hairline core along the length, gaussian across it,
 * fading to nothing at the tail. Drawn once, rotated and stretched per flight —
 * a single continuous line, never a row of dots.
 */
function streakCanvas(hex) {
  const W = 512,
    H = 32;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(W, H);
  const [r, g, b] = rgb255(hex);

  for (let x = 0; x < W; x++) {
    const u = x / (W - 1); // 0 = tail tip, 1 = head
    const along = Math.pow(u, 2.0); // long elegant taper toward the tail
    const coreW = 0.9 + 0.7 * u; // hairline, barely thicker at the head
    const glowW = 1.5 + 5.5 * u;
    for (let y = 0; y < H; y++) {
      const dy = y - (H - 1) / 2;
      const core = Math.exp(-(dy * dy) / (2 * coreW * coreW));
      const glow = Math.exp(-(dy * dy) / (2 * glowW * glowW)) * 0.22;
      // small bloom right at the head, so the line has a point of origin
      const hd = (u - 1) * W * 0.06;
      const bloom = Math.exp(-(hd * hd + dy * dy) / 18) * 0.55;
      const a = Math.min(1, (core + glow) * along + bloom);
      const i = (y * W + x) * 4;
      const hot = Math.pow(a, 2.0) * 0.85; // core burns toward white
      img.data[i] = Math.min(255, r + (255 - r) * hot);
      img.data[i + 1] = Math.min(255, g + (255 - g) * hot);
      img.data[i + 2] = Math.min(255, b + (255 - b) * hot);
      img.data[i + 3] = a * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Star / spark dot: tight bright core, minimal halo — reads crisp, not fuzzy. */
function dotCanvas(hex) {
  const S = 64;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0.0, "#ffffff");
  g.addColorStop(0.1, hex);
  g.addColorStop(0.22, hex + "aa");
  g.addColorStop(0.42, hex + "33");
  g.addColorStop(0.7, hex + "0d");
  g.addColorStop(1.0, hex + "00");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return c;
}

function displaceCanvas() {
  const S = 128;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      img.data[i] = fbm((x / S) * 3, (y / S) * 3, 91, 3) * 255;
      img.data[i + 1] = fbm((x / S) * 3 + 7.7, (y / S) * 3 - 3.1, 92, 3) * 255;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function grainCanvas() {
  const S = 128;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(S, S);
  for (let i = 0; i < S * S; i++) {
    const v = 90 + Math.random() * 90;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function gradientCanvas(base, glow) {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, glow);
  g.addColorStop(0.55, base);
  g.addColorStop(1, base);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 256);
  return c;
}

// ---------------------------------------------------------------------------
// scene
// ---------------------------------------------------------------------------
window.initBackground = async function initBackground() {
  const host = document.getElementById("bg");
  const canvas = host.querySelector("canvas");

  let W = window.innerWidth,
    H = window.innerHeight;

  const app = new PIXI.Application();
  await app.init({
    canvas,
    width: W,
    height: H,
    background: PRESETS.aurora.base,
    antialias: false,
    resolution: Math.min(window.devicePixelRatio || 1, 2) * 0.85,
    autoDensity: true,
    powerPreference: "low-power",
  });

  const root = new PIXI.Container();
  app.stage.addChild(root);

  const baseLayer = new PIXI.Container(); // L0 gradient
  const nebulaLayer = new PIXI.Container(); // L1/L2 nebulae (crossfading groups)
  const starLayer = new PIXI.Container(); // L3/L4 stars
  const sparkLayer = new PIXI.Container(); // L5 dante spark
  const fwLayer = new PIXI.Container(); // L6 micro-fireworks (fireworks.js)
  const grainLayer = new PIXI.Container(); // L7 grain
  root.addChild(baseLayer, nebulaLayer, starLayer, sparkLayer, fwLayer, grainLayer);

  // --- tiny tween engine ---------------------------------------------------
  const tweens = [];
  const tween = (obj, prop, to, dur, onDone) =>
    tweens.push({ obj, prop, from: obj[prop], to, dur, t: 0, onDone });
  function stepTweens(dt) {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      tw.t += dt;
      const k = Math.min(1, tw.t / tw.dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // easeInOutQuad
      tw.obj[tw.prop] = tw.from + (tw.to - tw.from) * e;
      if (k >= 1) {
        tweens.splice(i, 1);
        tw.onDone?.();
      }
    }
  }

  // --- displacement source (shared) ---------------------------------------
  const dispSprite = new PIXI.Sprite(cached("disp", displaceCanvas));
  dispSprite.anchor.set(0.5);
  dispSprite.renderable = false;
  root.addChild(dispSprite);

  function makeDisplacementFilter() {
    try {
      const DF = PIXI.DisplacementFilter;
      try {
        return new DF({ sprite: dispSprite, scale: LAYERS.nebula.displaceScale });
      } catch {
        return new DF(dispSprite, LAYERS.nebula.displaceScale);
      } // v7 signature
    } catch (e) {
      console.warn("displacement filter unavailable — nebulae will drift without churn", e);
      return null;
    }
  }

  // --- nebula groups -------------------------------------------------------
  let groups = []; // { container, items[], alphaTarget }

  function buildNebulaGroup(preset) {
    const container = new PIXI.Container();
    const far = new PIXI.Container();
    const near = new PIXI.Container();
    container.addChild(far, near);

    const df = makeDisplacementFilter();
    if (df) near.filters = [df];

    const items = preset.nebulae.map((n, i) => {
      const tex =
        n.kind === "glow"
          ? cached(`glow:${n.hex}`, () => glowCanvas(n.hex))
          : cached(`neb:${n.hex}:${n.seed}`, () => nebulaCanvas(n.hex, n.seed));
      const s = new PIXI.Sprite(tex);
      s.anchor.set(0.5);
      s.alpha = n.alpha * LAYERS.nebula.alphaScale;
      s.blendMode = n.blend;
      (i % 2 === 0 ? far : near).addChild(s);
      return { s, cfg: n, phase: i * 2.1 + 0.7, dir: i % 2 ? 1 : -1, base: 0 };
    });

    nebulaLayer.addChild(container);
    return { container, items };
  }

  function layoutNebulae() {
    for (const g of groups) {
      for (const it of g.items) {
        it.base = it.cfg.size * W * 1.6 * LAYERS.nebula.scale;
        it.ratio = it.cfg.ratio || 1;
        it.s.width = it.base * it.ratio;
        it.s.height = it.base;
        it.x0 = it.cfg.fx * W;
        it.y0 = it.cfg.fy * H * LAYERS.nebula.spread; // fy counts in viewport heights
      }
    }
  }

  // --- stars ---------------------------------------------------------------
  const starTex = cached("dot:#dfe6ff", () => dotCanvas("#dfe6ff"));
  function makeStarLayer(cfg) {
    const container = new PIXI.Container();
    const items = [];
    for (let i = 0; i < cfg.count; i++) {
      const s = new PIXI.Sprite(starTex);
      s.anchor.set(0.5);
      s.blendMode = "add";
      container.addChild(s);
      items.push({
        s,
        cfg,
        nx: Math.random(),
        ny: Math.random(),
        size: rand(cfg.minSize, cfg.maxSize),
        phase: Math.random() * Math.PI * 2,
        rate: rand(0.6, 1.5) * cfg.speed,
      });
    }
    starLayer.addChild(container);
    return { container, items, depth: cfg.depth };
  }
  const starsFar = makeStarLayer(LAYERS.starsFar);
  const starsNear = makeStarLayer(LAYERS.starsNear);

  function layoutStars() {
    for (const layer of [starsFar, starsNear]) {
      for (const it of layer.items) {
        it.s.x = it.nx * W;
        it.s.y = it.ny * H;
        it.s.width = it.s.height = it.size;
      }
    }
  }

  // --- beacon: a far-off sun flaring up and guttering out ------------------
  const beaconLayer = new PIXI.Container();
  starLayer.addChild(beaconLayer);
  const beaconTint = parseInt(LAYERS.beacon.tint.slice(1), 16);
  const smoothstep = (a, b, x) => {
    const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return k * k * (3 - 2 * k);
  };

  const beacons = [];
  for (let i = 0; i < LAYERS.beacon.pool; i++) {
    const halo = new PIXI.Sprite(cached("glow:#FFFFFF", () => glowCanvas("#FFFFFF")));
    const core = new PIXI.Sprite(cached("dot:#FFFFFF", () => dotCanvas("#FFFFFF")));
    for (const s of [halo, core]) {
      s.anchor.set(0.5);
      s.blendMode = "add";
      s.visible = false;
      s.tint = beaconTint;
      beaconLayer.addChild(s);
    }
    // stagger the pool so they never all ignite together
    beacons.push({
      halo,
      core,
      live: false,
      t0: 0,
      dur: 5,
      next: 1.2 + i * 1.85,
      x: 0,
      y: 0,
      phase: 0,
    });
  }

  function updateBeacon(t) {
    const c = LAYERS.beacon;
    for (const b of beacons) {
      if (!b.live) {
        if (t < b.next) continue;
        b.live = true;
        b.t0 = t;
        b.dur = rand(c.dur[0], c.dur[1]);
        b.x = rand(c.margin, 1 - c.margin) * W;
        b.y = rand(c.margin, 1 - c.margin) * H;
        b.phase = Math.random() * 10;
        b.next = t + b.dur + rand(c.gap[0], c.gap[1]);
      }
      const k = (t - b.t0) / b.dur;
      if (k >= 1) {
        b.live = false;
        b.halo.visible = b.core.visible = false;
        continue;
      }

      // slow swell → flicker plateau → slow fade
      const env = smoothstep(0, c.rise, k) * (1 - smoothstep(1 - c.fall, 1, k));
      // flicker only once it is up, so the entrance stays clean
      const plateau = smoothstep(0, c.rise * 0.9, k) * (1 - smoothstep(1 - c.fall * 0.9, 1, k));
      const flicker =
        1 -
        c.flickerAmount *
          plateau *
          Math.abs(Math.sin(t * c.flickerHz + b.phase)) *
          (0.6 + 0.4 * Math.sin(t * c.flickerHz * 0.37 + b.phase));

      b.core.visible = b.halo.visible = true;
      b.core.x = b.halo.x = b.x;
      b.core.y = b.halo.y = b.y;
      b.core.width = b.core.height = c.coreSize * (0.6 + 0.55 * env);
      b.core.alpha = c.coreAlpha * env * flicker;
      b.halo.width = b.halo.height = c.haloSize * (0.75 + 0.4 * env);
      b.halo.alpha = c.haloAlpha * env * flicker;
    }
  }

  // --- dante spark ---------------------------------------------------------
  const streakTex = cached("streak:" + DANTE, () => streakCanvas(DANTE));
  const sparks = [];
  for (let i = 0; i < LAYERS.spark.pool; i++) {
    const s = new PIXI.Sprite(streakTex);
    s.anchor.set(1, 0.5); // pivot at the head: the tail trails behind it
    s.blendMode = "add";
    s.visible = false;
    sparkLayer.addChild(s);
    // stagger the pool so they never enter in lockstep
    sparks.push({ s, live: false, t0: 0, dur: 6, next: 2 + i * 3.7, x0: 0, angle: 1.2 });
  }

  function updateSpark(t) {
    const c = LAYERS.spark;
    for (const p of sparks) {
      if (!p.live) {
        if (t < p.next) continue;
        p.live = true;
        p.t0 = t;
        p.dur = rand(c.dur[0], c.dur[1]);
        p.x0 = rand(c.entryX[0], c.entryX[1]) * W;
        p.angle = (rand(c.angle[0], c.angle[1]) * Math.PI) / 180;
        p.next = t + p.dur + rand(c.gap[0], c.gap[1]);
      }
      const k = (t - p.t0) / p.dur;
      if (k >= 1) {
        p.live = false;
        p.s.visible = false;
        continue;
      }

      const e = Math.pow(k, c.accel); // near-linear descent
      const inK = Math.min(1, k / c.fadeIn);
      const life = inK * inK * (3 - 2 * inK) * Math.pow(1 - k, c.fadeOut);

      const dirX = Math.cos(p.angle),
        dirY = Math.sin(p.angle);
      const travel = (H * 1.5) / dirY; // enough to clear the frame
      p.s.visible = true;
      p.s.x = p.x0 - dirX * H * 0.25 + dirX * e * travel;
      p.s.y = -H * 0.25 + dirY * e * travel;
      p.s.rotation = p.angle; // the line points where it flies
      p.s.width = c.len * H * (1 - c.stretch + c.stretch * (0.4 + 1.2 * k));
      p.s.height = c.thickness;
      p.s.alpha = life;
    }
  }

  // --- micro-fireworks -----------------------------------------------------
  // A self-contained layer: it owns its own textures, pool and timing. Drop
  // fireworks.js into any Pixi scene and the three calls below are all it needs.
  const fireworks = window.Fireworks
    ? window.Fireworks.create(Object.assign({ PIXI }, LAYERS.fireworks))
    : null;
  if (fireworks) fwLayer.addChild(fireworks.container);
  else console.warn("fireworks.js not loaded — the firework layer is skipped");

  // --- grain ---------------------------------------------------------------
  const grain = new PIXI.TilingSprite({
    texture: cached("grain", grainCanvas),
    width: W,
    height: H,
  });
  grain.alpha = LAYERS.grain.alpha;
  grain.blendMode = "overlay";
  grainLayer.addChild(grain);

  // --- theme switching (crossfade) ----------------------------------------
  let current = null;

  function setPreset(name) {
    const preset = PRESETS[name];
    if (!preset || preset === current) return;
    const first = current === null;
    current = preset;
    const dur = first || REDUCED ? 0.001 : LAYERS.crossfade;

    // base gradient
    const grad = new PIXI.Sprite(
      cached("grad:" + preset.base + preset.glow, () => gradientCanvas(preset.base, preset.glow)),
    );
    grad.width = W;
    grad.height = H;
    grad.alpha = first ? 1 : 0;
    const oldGrads = baseLayer.children.slice();
    baseLayer.addChild(grad);
    if (!first) {
      tween(grad, "alpha", 1, dur, () => {
        oldGrads.forEach((g) => {
          g.destroy({ children: true, texture: false });
        });
      });
    }

    // nebulae
    const oldGroups = groups.slice();
    const g = buildNebulaGroup(preset);
    g.container.alpha = first ? 1 : 0;
    groups.push(g);
    layoutNebulae();
    if (!first) {
      tween(g.container, "alpha", 1, dur);
      for (const og of oldGroups) {
        tween(og.container, "alpha", 0, dur, () => {
          groups = groups.filter((x) => x !== og);
          og.container.destroy({ children: true, texture: false });
        });
      }
    }

    // fireworks follow the theme palette
    if (fireworks) fireworks.setHues(preset.fireworkHues);

    // stars
    if (first) starLayer.alpha = preset.starAlpha;
    else tween(starLayer, "alpha", preset.starAlpha, dur);

    if (REDUCED) app.render();
  }

  // --- resize --------------------------------------------------------------
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    app.renderer.resize(W, H);
    baseLayer.children.forEach((g) => {
      g.width = W;
      g.height = H;
    });
    dispSprite.x = W / 2;
    dispSprite.y = H / 2;
    dispSprite.width = W * 1.6;
    dispSprite.height = H * 1.6;
    grain.width = W;
    grain.height = H;
    if (fireworks) fireworks.resize(W, H);
    layoutNebulae();
    layoutStars();
    if (REDUCED) app.render();
  }
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  // --- parallax (pointer + scroll) ----------------------------------------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // --- frame ---------------------------------------------------------------
  const L = LAYERS;
  function frameUpdate(t) {
    pointer.x += (pointer.tx - pointer.x) * L.parallax.ease;
    pointer.y += (pointer.ty - pointer.y) * L.parallax.ease;
    const px = -pointer.x * L.parallax.strength;
    const py = -pointer.y * L.parallax.strength * 0.5;
    const sy = -window.scrollY * L.parallax.scroll;

    const scrollY = window.scrollY;
    for (const g of groups) {
      for (const n of g.items) {
        const ph = n.phase;
        // far layers lag behind the scroll, near layers keep up — parallax in depth
        const lag = 1 - Math.min(0.5, n.cfg.depth * 1.6);
        const y =
          n.y0 -
          scrollY * lag +
          Math.cos(t * L.nebula.driftSpeed * 0.78 + ph * 1.7) * H * 0.06 +
          py * n.cfg.depth * 4;

        // cull what is far off-screen — with ~9 huge sprites this matters
        const halfH = n.base * 0.6;
        if (y + halfH < -H * 0.3 || y - halfH > H * 1.3) {
          n.s.renderable = false;
          continue;
        }
        n.s.renderable = true;

        n.s.x = n.x0 + Math.sin(t * L.nebula.driftSpeed + ph) * W * 0.05 + px * n.cfg.depth * 4;
        n.s.y = y;
        n.s.rotation = Math.sin(t * L.nebula.rotSpeed + ph) * 0.35 * n.dir;
        const b = 1 + Math.sin(t * L.nebula.breatheSpeed + ph * 2.3) * L.nebula.breathe;
        n.s.width = n.base * n.ratio * b;
        n.s.height = n.base * b;

        // iridescence: hue drifts between the two shimmer colours, opacity breathes
        const sh = n.cfg.shimmer;
        if (sh) {
          const k = 0.5 + 0.5 * Math.sin(t * sh.speed + ph * 1.3);
          n.s.tint = lerpTint(sh.a, sh.b, k);
          const pulse = 1 + Math.sin(t * sh.speed * 2.7 + ph) * sh.amount;
          n.s.alpha = n.cfg.alpha * pulse * L.nebula.alphaScale;
        }
      }
    }
    dispSprite.rotation = t * L.nebula.displaceSpin;

    for (const layer of [starsFar, starsNear]) {
      layer.container.x = px * layer.depth * 4;
      layer.container.y = py * layer.depth * 4 + sy * layer.depth * 6;
      for (const it of layer.items) {
        // springy twinkle: snaps open, contracts back — scale pulses with the light
        const w = 0.5 + 0.5 * Math.sin(t * it.rate + it.phase);
        const pop = Math.pow(w, 4.5);
        it.s.alpha = it.cfg.twinkleMin + (it.cfg.twinkleMax - it.cfg.twinkleMin) * pop;
        const s = it.size * (1 - it.cfg.squash * 0.5 + it.cfg.squash * pop);
        it.s.width = it.s.height = s;
      }
    }

    updateBeacon(t);
    updateSpark(t);
    if (fireworks) {
      // sits at star depth, so bursts drift with pointer and scroll like the sky
      fireworks.container.x = px * 0.35 * 4;
      fireworks.container.y = py * 0.35 * 4 + sy * 0.35 * 6;
      fireworks.update(t);
    }

    grain.tilePosition.x = (t * L.grain.speed) % 128;
    grain.tilePosition.y = (t * L.grain.speed * 0.7) % 128;
  }

  // --- boot ----------------------------------------------------------------
  resize();
  setPreset("aurora");
  layoutStars();

  if (REDUCED) {
    app.ticker.stop();
    frameUpdate(9.5);
    if (fireworks) fireworks.still(W * 0.72, H * 0.3); // one frozen burst
    app.render();
  } else {
    let elapsed = 0;
    app.ticker.add((ticker) => {
      const dt = ticker.deltaMS / 1000;
      elapsed += dt;
      stepTweens(dt);
      frameUpdate(elapsed);
    });
    document.addEventListener("visibilitychange", () =>
      document.hidden ? app.ticker.stop() : app.ticker.start(),
    );
  }

  // --- switcher wiring -----------------------------------------------------
  const switcher = document.getElementById("switcher");
  const buttons = Array.from(switcher.querySelectorAll("button"));
  function select(name) {
    setPreset(name);
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.preset === name)));
  }
  switcher.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) select(b.dataset.preset);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "f" && fireworks) {
      fireworks.burst();
      return;
    } // fire one on demand
    const i = Number(e.key) - 1;
    if (i >= 0 && i < buttons.length) select(buttons[i].dataset.preset);
  });

  window.bgScene = { setPreset: select, LAYERS, app, fireworks }; // console tuning handle
};
