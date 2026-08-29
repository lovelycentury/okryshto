"use client";

import { forwardRef, useId, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import "@okryshto/design-system/components/StaticBackground/StaticBackground.scss";

/**
 * SSR-safe sibling of `AnimatedBackground` — the same nebulae, stars, grain
 * and bloom, frozen on their resting frame instead of animated.
 *
 * There is no client mount gate, no pointer listener and no `useEffect`:
 * every prop is resolved during render, so the server-rendered markup is
 * already the finished picture with no motion pass or hydration flash.
 * Reach for this over `AnimatedBackground` whenever the scene has to be
 * correct in the very first HTML response — an above-the-fold hero on a
 * content page, an email-rendered preview, a `prefers-reduced-motion`
 * fallback rendered server-side, or anywhere the animation budget isn't
 * worth spending.
 *
 * Fills its nearest positioned ancestor, so size it with a wrapper: a
 * `position: fixed; inset: 0` div for a full-page background, or a
 * `position: relative` hero section for an embedded one.
 */

export type StaticBackgroundPreset = "aurora" | "midnight" | "neon" | "void";
export type StaticBackgroundQuality = "low" | "medium" | "high";

export interface StaticBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Which palette to render. Defaults to `"aurora"`.
   *
   * @default "aurora"
   * @type {StaticBackgroundPreset}
   */
  preset?: StaticBackgroundPreset;
  /**
   * How many stars to draw. Defaults to `"medium"`.
   *
   * @default "medium"
   * @type {StaticBackgroundQuality}
   */
  quality?: StaticBackgroundQuality;
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

/** Element budget per quality tier: [far stars, near stars]. */
const BUDGET: Record<StaticBackgroundQuality, [number, number]> = {
  low: [55, 14],
  medium: [90, 24],
  high: [140, 36],
};

/** Mulberry32 — a tiny deterministic PRNG; identical star fields on server and client. */
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
}

function makeStars(count: number, seed: number, minR: number, maxR: number): Star[] {
  const rng = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    cx: round(rng() * 1000),
    cy: round(rng() * 1000),
    r: round(minR + rng() * (maxR - minR)),
  }));
}

// Same seeds and radii as AnimatedBackground, so the two backgrounds' star
// fields line up if a page swaps one for the other.
const FAR_STARS = makeStars(BUDGET.high[0], 0x5eed, 0.5, 1.1);
const NEAR_STARS = makeStars(BUDGET.high[1], 0xd00d, 1.2, 1.36);

interface Nebula {
  x: number;
  y: number;
  w: number;
  ar: number;
  hue: 1 | 2 | 3 | 4 | 5;
}

// Same placement as AnimatedBackground's NEBULAE, minus the drift/veil fields
// that only matter once the scene is animated.
const NEBULAE: Nebula[] = [
  { x: 95, y: -12, w: 104, ar: 1.3, hue: 1 },
  { x: 4, y: 82, w: 90, ar: 1.05, hue: 2 },
  { x: 76, y: -10, w: 48, ar: 1.1, hue: 1 },
  { x: 30, y: 47, w: 76, ar: 1.2, hue: 3 },
  { x: 100, y: 108, w: 80, ar: 1.05, hue: 4 },
  { x: 18, y: 126, w: 88, ar: 1.35, hue: 5 },
  { x: 48, y: -34, w: 60, ar: 1.2, hue: 2 },
  { x: -2, y: -2, w: 64, ar: 1.1, hue: 3 },
];

const cssVars = (vars: Record<string, string>) => vars as CSSProperties;

export const StaticBackground = forwardRef<HTMLDivElement, StaticBackgroundProps>(
  function StaticBackground(
    { preset = "aurora", quality = "medium", scrim = false, className, children, ...rest },
    ref,
  ) {
    const rawId = useId().replace(/:/g, "");
    const grainId = `okryshto-static-bg-grain-${rawId}`;
    const starGlowId = `okryshto-static-bg-star-${rawId}`;

    const [farCount, nearCount] = BUDGET[quality];

    const classes = [
      "okryshto-component",
      "okryshto-static-background",
      preset !== "aurora" && `okryshto-static-background--${preset}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classes} {...rest}>
        <div className="okryshto-static-background__clouds" aria-hidden="true">
          {NEBULAE.map((n, i) => (
            <div
              key={i}
              className="okryshto-static-background__cloud"
              style={cssVars({
                "--okryshto-static-background-hue": `var(--okryshto-static-background-n${n.hue})`,
                "--okryshto-static-background-x": `${n.x}%`,
                "--okryshto-static-background-y": `${n.y}%`,
                "--okryshto-static-background-w": `${n.w}%`,
                "--okryshto-static-background-ar": `${n.ar}`,
              })}
            />
          ))}
        </div>

        <svg
          className="okryshto-static-background__svg"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <filter id={grainId} x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" />
            </filter>

            <radialGradient id={starGlowId}>
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="12%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop
                offset="30%"
                stopColor="var(--okryshto-static-background-star)"
                stopOpacity="0.28"
              />
              <stop
                offset="100%"
                stopColor="var(--okryshto-static-background-star)"
                stopOpacity="0"
              />
            </radialGradient>
          </defs>

          <g className="okryshto-static-background__stars">
            {FAR_STARS.slice(0, farCount).map((s, i) => (
              <circle
                key={`f${i}`}
                className="okryshto-static-background__star"
                cx={s.cx}
                cy={s.cy}
                r={s.r}
              />
            ))}
            {NEAR_STARS.slice(0, nearCount).map((s, i) => (
              <circle
                key={`n${i}`}
                className="okryshto-static-background__star okryshto-static-background__star--near"
                cx={s.cx}
                cy={s.cy}
                r={s.r}
                fill={`url(#${starGlowId})`}
              />
            ))}
          </g>

          <g className="okryshto-static-background__grain">
            <rect x="-5%" y="-5%" width="110%" height="110%" filter={`url(#${grainId})`} />
          </g>
        </svg>

        {scrim && <div className="okryshto-static-background__scrim" aria-hidden="true" />}
        <div className="okryshto-static-background__bloom" aria-hidden="true" />
        {children}
      </div>
    );
  },
);
