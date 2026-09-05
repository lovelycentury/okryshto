"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import "@okkly/design-system/components/AnimatedLogo/AnimatedLogo.scss";

/**
 * The Celestial Yin-Yang emblem in motion — the brand's loading / hero mark.
 *
 * Geometry is the Figma source verbatim; every moving part is a wrapper group
 * so the artwork itself is untouched. The orb never rotates (brand rule) —
 * only what surrounds it travels.
 *
 * Motion is CSS throughout, driven by custom properties, so retiming costs
 * nothing at runtime. `prefers-reduced-motion` is honoured automatically.
 */

export type AnimatedLogoMode = "loop" | "once" | "cycle";

/** Phase of the `cycle` sequence. `gap` is the dark beat before the replay. */
type CyclePhase = "in" | "out" | "gap";

export interface AnimatedLogoProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Emblem diameter. Numbers are px.
   *
   * @default 240
   * @type {number | string}
   */
  size?: number | string;
  /**
   * `loop` reveals once then breathes forever, `once` reveals and settles, `cycle` reveals → holds → dissolves → pauses → repeats.
   *
   * @default "loop"
   * @type {AnimatedLogoMode}
   */
  mode?: AnimatedLogoMode;

  // --- sequence, in ms ---
  /**
   * Length of the reveal. Scales every beat of it, stagger included.
   *
   * @default 2600
   * @type {number}
   */
  introDuration?: number;
  /**
   * How long the assembled emblem holds before dissolving. `cycle` only.
   *
   * @default 2400
   * @type {number}
   */
  holdDuration?: number;
  /**
   * Length of the dissolve. Defaults to `introDuration`, which makes the exit an exact time-mirror of the reveal — set it only to deliberately break that.
   *
   * @default undefined
   * @type {number}
   */
  outroDuration?: number;
  /**
   * Dark beat between the dissolve and the next reveal. `cycle` only.
   *
   * @default 500
   * @type {number}
   */
  gapDuration?: number;
  /**
   * Wait before the first reveal starts.
   *
   * @default 0
   * @type {number}
   */
  startDelay?: number;

  // --- idle loops, in ms. 0 parks that loop on its resting frame ---
  /**
   * One turn of the dashed ring.
   *
   * @default 40000
   * @type {number}
   */
  spinDuration?: number;
  /**
   * One orbit of the two colour markers.
   *
   * @default 26000
   * @type {number}
   */
  orbitDuration?: number;
  /**
   * Breath cycle of the two solid rings.
   *
   * @default 8000
   * @type {number}
   */
  breatheDuration?: number;
  /**
   * Pulse cycle of the colour markers.
   *
   * @default 3200
   * @type {number}
   */
  pulseDuration?: number;
  /**
   * Shimmer cycle of the wireframe, grid and notation.
   *
   * @default 4500
   * @type {number}
   */
  shimmerDuration?: number;
  /**
   * Beat of the two lobe dots.
   *
   * @default 4000
   * @type {number}
   */
  heartbeatDuration?: number;

  // --- parts ---
  /**
   * Concentric rings around the orb.
   *
   * @default true
   * @type {boolean}
   */
  showRings?: boolean;
  /**
   * The two orbiting colour markers.
   *
   * @default true
   * @type {boolean}
   */
  showMarkers?: boolean;
  /**
   * Engraved musical notation.
   *
   * @default true
   * @type {boolean}
   */
  showGlyphs?: boolean;
  /**
   * Astrolabe arcs inside the yin half.
   *
   * @default true
   * @type {boolean}
   */
  showWireframe?: boolean;
  /**
   * Cyber grid inside the yang half.
   *
   * @default true
   * @type {boolean}
   */
  showGrid?: boolean;
  /**
   * Backdrop disc behind the emblem.
   *
   * @default true
   * @type {boolean}
   */
  showBackdrop?: boolean;

  // --- control ---
  /**
   * Freeze every animation where it stands.
   *
   * @default false
   * @type {boolean}
   */
  paused?: boolean;
  /**
   * Fires each time a `cycle` completes, with the count so far.
   *
   * @default undefined
   * @type {(count: number) => void}
   */
  onCycleComplete?: (count: number) => void;
  /**
   * Accessible name. Omit to expose the emblem as decorative.
   *
   * @default undefined
   * @type {string}
   */
  title?: string;
}

/** Below this the fine detail stops reading, so micro-motion is dropped. */
const QUIET_BELOW_PX = 64;

const ms = (value: number) => `${value}ms`;

export const AnimatedLogo = forwardRef<HTMLDivElement, AnimatedLogoProps>(function AnimatedLogo(
  {
    size = 240,
    mode = "loop",
    introDuration = 2600,
    holdDuration = 2400,
    outroDuration,
    gapDuration = 500,
    startDelay = 0,
    spinDuration = 40000,
    orbitDuration = 26000,
    breatheDuration = 8000,
    pulseDuration = 3200,
    shimmerDuration = 4500,
    heartbeatDuration = 4000,
    showRings = true,
    showMarkers = true,
    showGlyphs = true,
    showWireframe = true,
    showGrid = true,
    showBackdrop = true,
    paused = false,
    onCycleComplete,
    title,
    className,
    style,
    ...rest
  },
  ref,
) {
  const rawId = useId().replace(/:/g, "");
  const yinId = `okkly-emblem-yin-${rawId}`;
  const yangId = `okkly-emblem-yang-${rawId}`;
  const topLobeId = `okkly-emblem-lobe-top-${rawId}`;
  const bottomLobeId = `okkly-emblem-lobe-bottom-${rawId}`;
  const clipId = `okkly-emblem-clip-${rawId}`;
  const titleId = `okkly-emblem-title-${rawId}`;

  const [started, setStarted] = useState(startDelay <= 0);
  const [phase, setPhase] = useState<CyclePhase>("in");
  // bumping this remounts the svg, which replays the CSS reveal from zero
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (startDelay <= 0) {
      setStarted(true);
      return undefined;
    }
    setStarted(false);
    const timer = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  // `cycle` walks in → out → gap → in …, each phase timed by its own prop
  useEffect(() => {
    if (mode !== "cycle" || paused || !started) return undefined;

    const next: Record<CyclePhase, { after: number; go: () => void }> = {
      in: { after: introDuration + holdDuration, go: () => setPhase("out") },
      out: { after: outroDuration ?? introDuration, go: () => setPhase("gap") },
      gap: {
        after: gapDuration,
        go: () => {
          setRun((count) => {
            onCycleComplete?.(count + 1);
            return count + 1;
          });
          setPhase("in");
        },
      },
    };

    const step = next[phase];
    const timer = setTimeout(step.go, Math.max(0, step.after));
    return () => clearTimeout(timer);
  }, [
    mode,
    paused,
    started,
    phase,
    introDuration,
    holdDuration,
    outroDuration,
    gapDuration,
    onCycleComplete,
  ]);

  const cycling = mode === "cycle";
  const classes = [
    "okkly-component",
    "okkly-animated-logo",
    mode === "once" && "okkly-animated-logo--once",
    cycling && phase === "out" && "okkly-animated-logo--out",
    cycling && phase === "gap" && "okkly-animated-logo--gap",
    paused && "okkly-animated-logo--paused",
    typeof size === "number" && size < QUIET_BELOW_PX && "okkly-animated-logo--quiet",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle = {
    "--okkly-animated-logo-size": typeof size === "number" ? `${size}px` : size,
    "--okkly-animated-logo-intro": ms(introDuration),
    "--okkly-animated-logo-outro": ms(outroDuration ?? introDuration),
    "--okkly-animated-logo-spin": ms(spinDuration),
    "--okkly-animated-logo-orbit": ms(orbitDuration),
    "--okkly-animated-logo-breathe": ms(breatheDuration),
    "--okkly-animated-logo-pulse": ms(pulseDuration),
    "--okkly-animated-logo-shimmer": ms(shimmerDuration),
    "--okkly-animated-logo-heartbeat": ms(heartbeatDuration),
    ...style,
  } as CSSProperties;

  return (
    <div ref={ref} className={classes} style={mergedStyle} {...rest}>
      {started && (
        <svg
          key={run}
          className="okkly-animated-logo__svg"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role={title ? "img" : undefined}
          aria-labelledby={title ? titleId : undefined}
          aria-hidden={title ? undefined : true}
        >
          {title && <title id={titleId}>{title}</title>}

          <defs>
            <linearGradient
              id={yinId}
              x1="6.6"
              y1="-2.95043e-06"
              x2="91.3706"
              y2="25.4312"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--okkly-animated-logo-mint)" />
              <stop offset="1" stopColor="var(--okkly-animated-logo-rose)" />
            </linearGradient>
            <linearGradient id={yangId} x1="0" y1="0" x2="66" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--okkly-animated-logo-indigo)" />
              <stop offset="1" stopColor="var(--okkly-animated-logo-violet)" />
            </linearGradient>
            <linearGradient
              id={topLobeId}
              x1="100.2"
              y1="54"
              x2="157.097"
              y2="76.7586"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--okkly-animated-logo-mint)" />
              <stop offset="1" stopColor="var(--okkly-animated-logo-rose)" />
            </linearGradient>
            <linearGradient
              id={bottomLobeId}
              x1="87"
              y1="120"
              x2="153"
              y2="120"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--okkly-animated-logo-indigo)" />
              <stop offset="1" stopColor="var(--okkly-animated-logo-violet)" />
            </linearGradient>
            <clipPath id={clipId}>
              <rect x="54" y="54" width="132" height="132" rx="66" fill="white" />
            </clipPath>
          </defs>

          {showBackdrop && (
            <g className="okkly-animated-logo__backdrop">
              <rect width="240" height="240" rx="120" fill="black" fillOpacity="0.188235" />
              <rect
                x="0.5"
                y="0.5"
                width="239"
                height="239"
                rx="119.5"
                stroke="white"
                strokeOpacity="0.0784314"
              />
            </g>
          )}

          {showRings && (
            <>
              <g className="okkly-animated-logo__breathe okkly-animated-logo__breathe--outer">
                <circle
                  className="okkly-animated-logo__ring okkly-animated-logo__ring--outer"
                  cx="120.5"
                  cy="120.5"
                  r="93"
                  stroke="white"
                  strokeOpacity="0.0784314"
                />
              </g>
              <g className="okkly-animated-logo__ring-spin">
                <circle
                  className="okkly-animated-logo__ring okkly-animated-logo__ring--dashed"
                  cx="120"
                  cy="120"
                  r="85.5"
                  stroke="white"
                  strokeOpacity="0.14902"
                  strokeDasharray="4 6"
                />
              </g>
              <g className="okkly-animated-logo__breathe okkly-animated-logo__breathe--inner">
                <circle
                  className="okkly-animated-logo__ring okkly-animated-logo__ring--inner"
                  cx="120.5"
                  cy="120.5"
                  r="72"
                  stroke="white"
                  strokeOpacity="0.0784314"
                />
              </g>
            </>
          )}

          {showMarkers && (
            <g className="okkly-animated-logo__orbit">
              <g className="okkly-animated-logo__pulse okkly-animated-logo__pulse--mint">
                <circle
                  className="okkly-animated-logo__marker okkly-animated-logo__marker--mint"
                  cx="121"
                  cy="31"
                  r="2"
                  fill="var(--okkly-animated-logo-mint)"
                />
              </g>
              <g className="okkly-animated-logo__pulse okkly-animated-logo__pulse--rose">
                <circle
                  className="okkly-animated-logo__marker okkly-animated-logo__marker--rose"
                  cx="121"
                  cy="210"
                  r="2"
                  fill="var(--okkly-animated-logo-rose)"
                />
              </g>
            </g>
          )}

          {showGlyphs && (
            <g className="okkly-animated-logo__twinkle">
              <g className="okkly-animated-logo__glyphs" fill="#6E6E78">
                <path d="M92.612 47.532L92.972 46.74C93.332 46.836 93.656 46.896 93.944 46.896C94.628 46.896 95.132 46.56 95.516 45.54C95.744 44.928 95.936 44.124 96.104 43.224C95.156 42.96 94.352 42.24 94.352 41.064C94.352 39.576 95.648 38.82 96.896 38.772C97.088 37.848 97.292 36.984 97.556 36.3C98.084 34.908 98.996 34.284 100.04 34.284C100.484 34.284 100.952 34.404 101.42 34.608L101.06 35.4C100.7 35.304 100.376 35.244 100.088 35.244C99.404 35.244 98.9 35.58 98.516 36.612C98.276 37.224 98.084 38.016 97.916 38.892C98.864 39.168 99.668 39.888 99.668 41.064C99.668 42.564 98.384 43.32 97.112 43.356C96.932 44.28 96.728 45.144 96.476 45.828C95.948 47.22 95.036 47.856 93.992 47.856C93.548 47.856 93.08 47.736 92.612 47.532ZM95.204 41.064C95.204 41.784 95.66 42.24 96.248 42.444C96.332 42 96.404 41.532 96.488 41.064C96.572 40.56 96.656 40.056 96.752 39.564C95.936 39.66 95.204 40.152 95.204 41.064ZM97.496 41.208C97.424 41.664 97.34 42.12 97.268 42.564C98.072 42.48 98.816 41.976 98.816 41.064C98.816 40.344 98.36 39.876 97.76 39.672C97.676 40.176 97.58 40.692 97.496 41.208Z" />
                <path d="M173.917 128.3V120.992H174.361V128.18L174.265 127.94C174.401 127.964 174.569 127.94 174.769 127.868C174.969 127.796 175.169 127.684 175.369 127.532C175.577 127.38 175.749 127.204 175.885 127.004C175.981 126.868 176.053 126.72 176.101 126.56C176.149 126.392 176.173 126.212 176.173 126.02C176.173 125.804 176.137 125.636 176.065 125.516C176.001 125.396 175.881 125.336 175.705 125.336C175.457 125.336 175.201 125.444 174.937 125.66C174.681 125.876 174.465 126.128 174.289 126.416L174.277 125.972C174.517 125.604 174.773 125.316 175.045 125.108C175.317 124.9 175.601 124.796 175.897 124.796C176.185 124.796 176.417 124.896 176.593 125.096C176.769 125.296 176.857 125.584 176.857 125.96C176.857 126.408 176.725 126.812 176.461 127.172C176.197 127.532 175.833 127.816 175.369 128.024C175.161 128.12 174.953 128.188 174.745 128.228C174.537 128.276 174.333 128.3 174.133 128.3H173.917Z" />
              </g>
            </g>
          )}

          <g className="okkly-animated-logo__orb" clipPath={`url(#${clipId})`}>
            <circle cx="120" cy="120" r="66" fill="var(--okkly-animated-logo-core)" />

            <g className="okkly-animated-logo__half okkly-animated-logo__half--yin">
              <rect width="66" height="132" transform="translate(54 54)" fill={`url(#${yinId})`} />
            </g>

            {showWireframe && (
              <g className="okkly-animated-logo__shimmer okkly-animated-logo__shimmer--wire">
                <g className="okkly-animated-logo__wire">
                  <circle cx="97" cy="97" r="30.5" stroke="black" />
                  <circle cx="89" cy="125" r="46.5" stroke="black" />
                </g>
              </g>
            )}

            <g className="okkly-animated-logo__half okkly-animated-logo__half--yang">
              <rect
                width="66"
                height="132"
                transform="translate(120 54)"
                fill={`url(#${yangId})`}
              />
            </g>

            {showGrid && (
              <g className="okkly-animated-logo__shimmer okkly-animated-logo__shimmer--grid">
                <g className="okkly-animated-logo__grid">
                  <line x1="84.25" y1="71.567" x2="198.565" y2="137.567" stroke="white" />
                  <line x1="84.25" y1="107.567" x2="198.565" y2="173.567" stroke="white" />
                  <line x1="84.25" y1="143.567" x2="198.565" y2="209.567" stroke="white" />
                </g>
              </g>
            )}

            <g className="okkly-animated-logo__lobe okkly-animated-logo__lobe--top">
              <rect x="87" y="54" width="66" height="66" rx="33" fill={`url(#${topLobeId})`} />
            </g>
            <g className="okkly-animated-logo__beat okkly-animated-logo__beat--top">
              <circle
                className="okkly-animated-logo__lobe-dot okkly-animated-logo__lobe-dot--top"
                cx="119.5"
                cy="86.5"
                r="6.5"
                fill="var(--okkly-animated-logo-ink)"
              />
            </g>

            <g className="okkly-animated-logo__lobe okkly-animated-logo__lobe--bottom">
              <rect x="87" y="120" width="66" height="66" rx="33" fill={`url(#${bottomLobeId})`} />
            </g>
            <g className="okkly-animated-logo__beat okkly-animated-logo__beat--bottom">
              <circle
                className="okkly-animated-logo__lobe-dot okkly-animated-logo__lobe-dot--bottom"
                cx="119.5"
                cy="152.5"
                r="6.5"
                fill="var(--okkly-animated-logo-mint)"
              />
            </g>
          </g>
        </svg>
      )}
    </div>
  );
});
