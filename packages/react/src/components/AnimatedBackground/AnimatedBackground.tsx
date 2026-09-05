"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import "@okkly/design-system/components/AnimatedBackground/AnimatedBackground.scss";

/**
 * Layered deep-space background — nebulae, twinkling stars, a falling dante
 * spark, a distant flaring beacon, micro-fireworks and film grain.
 *
 * The look is a straight descendant of the PixiJS scene in
 * packages/figma-plugin/docs/bg-lab, rebuilt as one SVG driven by CSS
 * keyframes: no canvas, no render loop, no runtime dependency. Filamented
 * nebulae come from feTurbulence + feDisplacementMap warping a soft ellipse,
 * which is what the generated noise textures were doing by hand.
 *
 * Fills its nearest positioned ancestor, so size it with a wrapper: a
 * `position: fixed; inset: 0` div for a full-page background, or a
 * `position: relative` hero section for an embedded one.
 *
 * Everything animates `transform` and `opacity` only, so the scene stays on
 * the compositor and never forces layout. `prefers-reduced-motion` settles it
 * on a calm still frame unless `respectReducedMotion` is off.
 */

export type BackgroundPreset = "aurora" | "midnight" | "neon" | "void";
export type BackgroundQuality = "low" | "medium" | "high";

export interface AnimatedBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Which palette to render. Defaults to `"aurora"`.
   *
   * @default "aurora"
   * @type {BackgroundPreset}
   */
  preset?: BackgroundPreset;
  /**
   * How many stars, beacons and bursts to draw. Defaults to `"medium"`.
   *
   * @default "medium"
   * @type {BackgroundQuality}
   */
  quality?: BackgroundQuality;
  /**
   * Drift the scene against pointer movement. Defaults to `true`.
   *
   * @default true
   * @type {boolean}
   */
  parallax?: boolean;
  /**
   * The rare micro-firework bursts. Defaults to `true`.
   *
   * @default true
   * @type {boolean}
   */
  fireworks?: boolean;
  /**
   * Settle on a still frame under `prefers-reduced-motion`. Defaults to `true`.
   *
   * @default true
   * @type {boolean}
   */
  respectReducedMotion?: boolean;
  /**
   * The content-legibility gradient wash over the scene. Defaults to `false`.
   *
   * @default false
   * @type {boolean}
   */
  scrim?: boolean;
  /**
   * Rendered above the scene — e.g. a hero section's headline.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
}

/**
 * Element budget per quality tier: [far stars, near stars, beacons, bursts].
 *
 * The nebulae are deliberately not on this list — the wide soft washes are
 * the whole look, they are eight elements total, and now that their filters
 * are cached they are close to free. What scales is the small stuff.
 */
const BUDGET: Record<BackgroundQuality, [number, number, number, number]> = {
  low: [55, 14, 2, 2],
  medium: [90, 24, 3, 3],
  high: [140, 36, 4, 4],
};

/** Spokes per firework burst. */
const SPOKES = 10;

/**
 * Mulberry32 — a tiny deterministic PRNG.
 *
 * Star fields have to be random-looking but *stable*: the same positions on
 * every render, in every process. A seeded generator gives that for free,
 * which also keeps the markup identical between server and client.
 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

interface Star {
  cx: number;
  cy: number;
  r: number;
  dur: number;
  delay: number;
}

function makeStars(count: number, seed: number, minR: number, maxR: number): Star[] {
  const rng = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    cx: round(rng() * 1000),
    cy: round(rng() * 1000),
    r: round(minR + rng() * (maxR - minR)),
    dur: round(2.4 + rng() * 5.2),
    delay: round(rng() * -8),
  }));
}

// Generated once at the largest budget, then sliced per quality — the field
// only ever gets denser, so lowering quality never reshuffles the sky.
//
// Radii are viewBox units: the scene covers its box from a 1000-unit square,
// so on a typical hero these land at roughly 1.5–3px across for far stars and
// 3–5px for near ones — the same range the Pixi scene used. Stars have to
// read as points of light; much past this they turn into visible grey discs
// and the sky starts to look like confetti.
const FAR_STARS = makeStars(BUDGET.high[0], 0x5eed, 0.5, 1.1);
const NEAR_STARS = makeStars(BUDGET.high[1], 0xd00d, 1.2, 1.36);

interface Nebula {
  /** Centre, as a percentage of the container box. */
  x: number;
  y: number;
  /** Width as a percentage of container width; height follows from `ar`. */
  w: number;
  ar: number;
  hue: 1 | 2 | 3 | 4 | 5;
  /** Iridescent dante veil — rides a second, faster opacity cycle. */
  veil?: boolean;
  dur: number;
  delay: number;
  driftX: number;
  driftY: number;
}

// Hand-placed so the composition reads deliberately rather than scattered.
//
// The blobs are anchored out toward the edges and corners on purpose: eight
// wide fields stacked over the middle of the frame screen together into a
// flat grey-violet murk, and each hue stops being legible as itself. Pushed
// outward they overlap only at their skirts, which is where screen blending
// actually looks like light mixing.
//
// These are HTML elements rather than SVG shapes, and that is a performance
// decision, not a stylistic one. An SVG shape does not get its own compositor
// layer, so animating the transform of a half-viewport-wide gradient forces a
// software repaint of it on every single frame. The same gradient on a div
// with `will-change: transform` is uploaded to the GPU once and then merely
// moved — which is what makes the drift affordable at this size.
// Sizes are large on purpose — most are around the full width of the frame.
// These have to read as broad washes of light with no locatable edge; at
// half this size the same gradient reads as a row of distinct round blobs,
// which is a completely different and much cheaper-looking effect.
const NEBULAE: Nebula[] = [
  { x: 95, y: -12, w: 104, ar: 1.3, hue: 1, dur: 34, delay: -2, driftX: -40, driftY: 26 },
  { x: 4, y: 82, w: 90, ar: 1.05, hue: 2, dur: 41, delay: -11, driftX: 34, driftY: -30 },
  { x: 76, y: -10, w: 48, ar: 1.1, hue: 1, dur: 29, delay: -6, driftX: 30, driftY: 34 },
  {
    x: 30,
    y: 47,
    w: 76,
    ar: 1.2,
    hue: 3,
    veil: true,
    dur: 37,
    delay: -15,
    driftX: -30,
    driftY: -22,
  },
  {
    x: 100,
    y: 108,
    w: 80,
    ar: 1.05,
    hue: 4,
    veil: true,
    dur: 45,
    delay: -4,
    driftX: -26,
    driftY: 30,
  },
  { x: 18, y: 126, w: 88, ar: 1.35, hue: 5, dur: 39, delay: -19, driftX: 38, driftY: -18 },
  { x: 48, y: -34, w: 60, ar: 1.2, hue: 2, dur: 31, delay: -9, driftX: 24, driftY: 28 },
  { x: -2, y: -2, w: 64, ar: 1.1, hue: 3, veil: true, dur: 43, delay: -24, driftX: 30, driftY: 24 },
];

interface Beacon {
  cx: number;
  cy: number;
  dur: number;
  delay: number;
}

// Long cycles with staggered negative delays: each flare occupies ~18% of its
// own period, so with four of them the sky lights up every few seconds
// without any two ever igniting together.
const BEACONS: Beacon[] = [
  { cx: 220, cy: 240, dur: 26, delay: -1 },
  { cx: 780, cy: 420, dur: 31, delay: -9 },
  { cx: 480, cy: 760, dur: 28, delay: -17 },
  { cx: 900, cy: 140, dur: 34, delay: -24 },
  { cx: 140, cy: 820, dur: 29, delay: -6 },
  { cx: 640, cy: 60, dur: 36, delay: -30 },
];

interface Sparkle {
  cx: number;
  cy: number;
  size: number;
  dur: number;
  delay: number;
}

// A handful of little suns — the four-point diffraction sparkle you get off
// a bright point through a lens. Placed away from the copy column so they
// catch the eye without competing with the headline.
const SPARKLES: Sparkle[] = [
  { cx: 815, cy: 235, size: 7, dur: 9, delay: -1 },
  { cx: 415, cy: 745, size: 5, dur: 11, delay: -5 },
  { cx: 655, cy: 505, size: 4, dur: 13, delay: -8 },
];

/**
 * A four-point sparkle centred on the origin.
 *
 * Each arm is a quadratic curve that passes through the centre, so the waist
 * pinches to nothing and the points stay needle-sharp — a plain polygon
 * gives flat, blunt arms that read as a diamond instead of a glint.
 */
const sparklePath = (r: number) =>
  `M 0 ${-r} Q 0 0 ${r} 0 Q 0 0 0 ${r} Q 0 0 ${-r} 0 Q 0 0 0 ${-r} Z`;

interface Spark {
  x: number;
  y: number;
  angle: number;
  len: number;
  dur: number;
  delay: number;
}

// Steep and slow: a full crossing takes ~22% of a ~90s cycle, so a streak is
// something you catch rather than something you watch on a timer.
const SPARKS: Spark[] = [
  { x: 120, y: -80, angle: 68, len: 300, dur: 88, delay: -4 },
  { x: 620, y: -120, angle: 74, len: 260, dur: 96, delay: -38 },
  { x: 380, y: -60, angle: 62, len: 330, dur: 104, delay: -71 },
];

interface Burst {
  cx: number;
  cy: number;
  radius: number;
  dur: number;
  delay: number;
  seed: number;
}

// Deliberately tiny: these are meant to read as a distant sparkle catching
// your eye, not as a display going off in the foreground.
// Kept clear of the left column: at this size a burst laid over body copy
// just reads as dirt on the screen rather than as a firework.
//
// How often you see one is a function of how many are in flight, not of how
// fast each cycle runs — shortening the period would just make every burst
// pop twice as quickly. Sightings scale with the length of this list; the
// staggered delays and mismatched periods keep any two from syncing up.
const BURSTS: Burst[] = [
  { cx: 740, cy: 300, radius: 31, dur: 23, delay: -3, seed: 0xb00 },
  { cx: 860, cy: 640, radius: 26, dur: 29, delay: -14, seed: 0xcafe },
  { cx: 620, cy: 150, radius: 29, dur: 26, delay: -21, seed: 0xf00d },
  { cx: 955, cy: 430, radius: 28, dur: 25, delay: -9, seed: 0x1dea },
  { cx: 700, cy: 810, radius: 24, dur: 31, delay: -18, seed: 0xbeef },
  { cx: 545, cy: 385, radius: 27, dur: 27, delay: -25, seed: 0xace },
];

/** Even spacing, jittered — the difference between organic and mechanical. */
function makeSpokes(seed: number, radius: number) {
  const rng = mulberry32(seed);
  return Array.from({ length: SPOKES }, (_, i) => ({
    angle: round((360 / SPOKES) * i + (rng() - 0.5) * 22),
    len: round(radius * (0.55 + rng() * 0.45)),
    delay: round(rng() * 0.12),
  }));
}

const cssVars = (vars: Record<string, string>) => vars as CSSProperties;

export const AnimatedBackground = forwardRef<HTMLDivElement, AnimatedBackgroundProps>(
  function AnimatedBackground(
    {
      preset = "aurora",
      quality = "medium",
      parallax = true,
      fireworks = true,
      respectReducedMotion = true,
      scrim = false,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const rawId = useId().replace(/:/g, "");
    const grainId = `okkly-bg-grain-${rawId}`;
    const starGlowId = `okkly-bg-star-${rawId}`;
    const beaconCoreId = `okkly-bg-beacon-core-${rawId}`;
    const beaconHaloId = `okkly-bg-beacon-halo-${rawId}`;
    const sparkleCoreId = `okkly-bg-sparkle-core-${rawId}`;
    const sparkleGlowId = `okkly-bg-sparkle-glow-${rawId}`;
    const sparkGradId = `okkly-bg-spark-${rawId}`;
    const fwId = (slot: number) => `okkly-bg-fw${slot}-${rawId}`;

    // Nothing PixiJS-ish is left, but the scene is still decorative chrome
    // that has no business in server output — and the pointer listener needs
    // a client anyway. Rendering on mount keeps both simple.
    const [mounted, setMounted] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Parallax writes custom properties straight onto the node. Going through
    // state here would re-render the entire star field on every mouse move.
    useEffect(() => {
      if (!mounted || !parallax) return undefined;

      const onPointerMove = (event: PointerEvent) => {
        const svg = svgRef.current;
        if (!svg) return;
        svg.style.setProperty(
          "--okkly-animated-background-px",
          String(round((event.clientX / window.innerWidth - 0.5) * -2)),
        );
        svg.style.setProperty(
          "--okkly-animated-background-py",
          String(round((event.clientY / window.innerHeight - 0.5) * -2)),
        );
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      return () => window.removeEventListener("pointermove", onPointerMove);
    }, [mounted, parallax]);

    const [farCount, nearCount, beaconCount, burstCount] = BUDGET[quality];

    const classes = [
      "okkly-component",
      "okkly-animated-background",
      preset !== "aurora" && `okkly-animated-background--${preset}`,
      !respectReducedMotion && "okkly-animated-background--force-motion",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classes} {...rest}>
        {/* L1 — the wide soft washes. GPU-composited; see NEBULAE. */}
        {mounted && (
          <div className="okkly-animated-background__clouds" aria-hidden="true">
            {NEBULAE.map((n, i) => (
              <div
                key={i}
                className={`okkly-animated-background__cloud${
                  n.veil ? " okkly-animated-background__cloud--veil" : ""
                }`}
                style={cssVars({
                  "--okkly-animated-background-hue": `var(--okkly-animated-background-n${n.hue})`,
                  "--okkly-animated-background-x": `${n.x}%`,
                  "--okkly-animated-background-y": `${n.y}%`,
                  "--okkly-animated-background-w": `${n.w}%`,
                  "--okkly-animated-background-ar": `${n.ar}`,
                  "--okkly-animated-background-dur": `${n.dur}s`,
                  "--okkly-animated-background-delay": `${n.delay}s`,
                  "--okkly-animated-background-drift-x": `${n.driftX}px`,
                  "--okkly-animated-background-drift-y": `${n.driftY}px`,
                })}
              />
            ))}
          </div>
        )}

        {mounted && (
          <svg
            ref={svgRef}
            className="okkly-animated-background__svg"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              {/* Warp a soft ellipse into filaments — the SVG stand-in for the
                  domain-warped noise texture the Pixi scene generated. */}
              <filter id={grainId} x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" />
              </filter>

              {/* Tight bright core, minimal halo — reads crisp, not fuzzy.
                  The core has to stay a small fraction of the radius or the
                  star paints as a flat disc instead of a point of light. */}
              <radialGradient id={starGlowId}>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="12%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop
                  offset="30%"
                  stopColor="var(--okkly-animated-background-star)"
                  stopOpacity="0.28"
                />
                <stop
                  offset="100%"
                  stopColor="var(--okkly-animated-background-star)"
                  stopOpacity="0"
                />
              </radialGradient>

              {/* A far-off sun is a *tiny* hot core inside a wide, very faint
                  halo. Merging the two into one mid-sized gradient is what
                  turns it into a grey smudge, so they stay separate shapes. */}
              <radialGradient id={beaconCoreId}>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop
                  offset="35%"
                  stopColor="var(--okkly-animated-background-beacon)"
                  stopOpacity="0.9"
                />
                <stop
                  offset="100%"
                  stopColor="var(--okkly-animated-background-beacon)"
                  stopOpacity="0"
                />
              </radialGradient>

              {/* The sparkle's arms stay near-white so it reads as a glint;
                  the tint only shows up in the halo behind it. */}
              <radialGradient id={sparkleCoreId}>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop
                  offset="100%"
                  stopColor="var(--okkly-animated-background-star)"
                  stopOpacity="0.35"
                />
              </radialGradient>

              <radialGradient id={sparkleGlowId}>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                <stop
                  offset="30%"
                  stopColor="var(--okkly-animated-background-star)"
                  stopOpacity="0.16"
                />
                <stop
                  offset="100%"
                  stopColor="var(--okkly-animated-background-star)"
                  stopOpacity="0"
                />
              </radialGradient>

              <radialGradient id={beaconHaloId}>
                <stop
                  offset="0%"
                  stopColor="var(--okkly-animated-background-beacon)"
                  stopOpacity="0.22"
                />
                <stop
                  offset="40%"
                  stopColor="var(--okkly-animated-background-beacon)"
                  stopOpacity="0.07"
                />
                <stop
                  offset="100%"
                  stopColor="var(--okkly-animated-background-beacon)"
                  stopOpacity="0"
                />
              </radialGradient>

              {/* Tail at x=0 fading to nothing, head at x=1 — the streak is one
                  continuous line, never a row of dots. */}
              <linearGradient id={sparkGradId} x1="0" y1="0" x2="1" y2="0">
                <stop
                  offset="0%"
                  stopColor="var(--okkly-animated-background-spark)"
                  stopOpacity="0"
                />
                <stop
                  offset="70%"
                  stopColor="var(--okkly-animated-background-spark)"
                  stopOpacity="0.5"
                />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
              </linearGradient>

              {/* These sparks are only a pixel or two across, so the lit core
                  has to be most of the shape: a gradient that starts falling
                  off at a third of the radius leaves a sub-pixel highlight and
                  the whole burst renders as a faint smudge. */}
              {[1, 2, 3].map((slot) => (
                <radialGradient key={slot} id={fwId(slot)}>
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop
                    offset="55%"
                    stopColor={`var(--okkly-animated-background-fw${slot})`}
                    stopOpacity="0.95"
                  />
                  <stop
                    offset="100%"
                    stopColor={`var(--okkly-animated-background-fw${slot})`}
                    stopOpacity="0"
                  />
                </radialGradient>
              ))}
            </defs>

            {/* L2 — stars, two depths */}
            <g className="okkly-animated-background__stars">
              {FAR_STARS.slice(0, farCount).map((s, i) => (
                <circle
                  key={`f${i}`}
                  className="okkly-animated-background__star"
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r}
                  style={cssVars({
                    "--okkly-animated-background-dur": `${s.dur}s`,
                    "--okkly-animated-background-delay": `${s.delay}s`,
                  })}
                />
              ))}
              {NEAR_STARS.slice(0, nearCount).map((s, i) => (
                <circle
                  key={`n${i}`}
                  className="okkly-animated-background__star okkly-animated-background__star--near"
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r}
                  fill={`url(#${starGlowId})`}
                  style={cssVars({
                    "--okkly-animated-background-dur": `${s.dur}s`,
                    "--okkly-animated-background-delay": `${s.delay}s`,
                  })}
                />
              ))}
            </g>

            {/* L3 — beacons */}
            <g>
              {BEACONS.slice(0, beaconCount).map((b, i) => (
                <g
                  key={i}
                  className="okkly-animated-background__beacon"
                  style={cssVars({
                    "--okkly-animated-background-dur": `${b.dur}s`,
                    "--okkly-animated-background-delay": `${b.delay}s`,
                  })}
                >
                  <circle cx={b.cx} cy={b.cy} r="46" fill={`url(#${beaconHaloId})`} />
                  <circle cx={b.cx} cy={b.cy} r="4.5" fill={`url(#${beaconCoreId})`} />
                </g>
              ))}
            </g>

            {/* L3b — little suns */}
            <g>
              {SPARKLES.map((s, i) => (
                // The placement has to live on its own wrapper: a CSS
                // `transform` from the animation replaces the `transform`
                // attribute outright rather than composing with it, so
                // putting both on one node drops the translate and stacks
                // every sparkle at the viewBox origin.
                <g key={i} transform={`translate(${s.cx} ${s.cy})`}>
                  <g
                    className="okkly-animated-background__sparkle"
                    style={cssVars({
                      "--okkly-animated-background-dur": `${s.dur}s`,
                      "--okkly-animated-background-delay": `${s.delay}s`,
                    })}
                  >
                    <circle cx="0" cy="0" r={s.size * 1.1} fill={`url(#${sparkleGlowId})`} />
                    <path d={sparklePath(s.size)} fill={`url(#${sparkleCoreId})`} />
                  </g>
                </g>
              ))}
            </g>

            {/* L4 — dante sparks */}
            <g>
              {SPARKS.map((s, i) => (
                <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.angle})`}>
                  <rect
                    className="okkly-animated-background__spark"
                    x="0"
                    y="-0.56"
                    width={s.len}
                    height="1.12"
                    rx="0.56"
                    fill={`url(#${sparkGradId})`}
                    style={cssVars({
                      "--okkly-animated-background-dur": `${s.dur}s`,
                      "--okkly-animated-background-delay": `${s.delay}s`,
                      // Travel far enough past the frame that the streak always
                      // exits rather than fading out mid-flight.
                      "--okkly-animated-background-spark-x": "1500px",
                      "--okkly-animated-background-spark-y": "0px",
                    })}
                  />
                </g>
              ))}
            </g>

            {/* L5 — micro-fireworks */}
            {fireworks && (
              <g>
                {BURSTS.slice(0, burstCount).map((b, i) => (
                  <g key={i} transform={`translate(${b.cx} ${b.cy})`}>
                    {makeSpokes(b.seed, b.radius).map((sp, j) => (
                      <g
                        key={j}
                        className="okkly-animated-background__spoke"
                        transform={`rotate(${sp.angle})`}
                      >
                        <g
                          className="okkly-animated-background__spoke-body"
                          style={cssVars({
                            "--okkly-animated-background-dur": `${b.dur}s`,
                            "--okkly-animated-background-delay": `${b.delay + sp.delay}s`,
                            "--okkly-animated-background-spoke-r": `${sp.len}px`,
                          })}
                        >
                          {/* tail behind the head, pointing back at the core */}
                          <rect
                            x={-sp.len * 0.8}
                            y="-0.3"
                            width={sp.len * 0.8}
                            height="0.6"
                            rx="0.3"
                            fill={`url(#${fwId(((j % 3) + 1) as 1 | 2 | 3)})`}
                            opacity="0.7"
                          />
                          <circle
                            cx="0"
                            cy="0"
                            r="1.3"
                            fill={`url(#${fwId(((j % 3) + 1) as 1 | 2 | 3)})`}
                          />
                        </g>
                      </g>
                    ))}
                  </g>
                ))}
              </g>
            )}

            {/* L6 — grain. Same split as the nebulae: the noise is generated
                once on the static rect, the wrapper does the drifting. */}
            <g className="okkly-animated-background__grain">
              <rect x="-5%" y="-5%" width="110%" height="110%" filter={`url(#${grainId})`} />
            </g>
          </svg>
        )}

        {scrim && <div className="okkly-animated-background__scrim" aria-hidden="true" />}
        {mounted && <div className="okkly-animated-background__bloom" aria-hidden="true" />}
        {children}
      </div>
    );
  },
);
