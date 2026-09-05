"use client";

import { forwardRef, useId, type HTMLAttributes, type CSSProperties } from "react";
import "@okkly/design-system/components/Logo/Logo.scss";

export type LogoLayout = "compact" | "horizontal" | "stacked";
export type LogoTone =
  "multi" | "mint" | "indigo" | "dante" | "violet" | "ember" | "mono-dark" | "mono-light";

/**
 * Brand logo with multi-color emblem design from Figma.
 * `layout` controls arrangement: `compact` (nav bars), `horizontal` (headers),
 * `stacked` (mobile, centered emblem with text below).
 * Default is `horizontal` with `multi` tone (combines all brand colors).
 */
export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Lockup arrangement. Default: "horizontal"
   *
   * @default "horizontal"
   * @type {LogoLayout}
   */
  layout?: LogoLayout;
  /**
   * Emblem colorway. Default: "multi" (all brand colors)
   *
   * @default "multi"
   * @type {LogoTone}
   */
  tone?: LogoTone;
  /**
   * Wordmark text. Default: "okryshto.dev"
   *
   * @default "okryshto.dev"
   * @type {string}
   */
  label?: string;
  /**
   * Hide the wordmark. Default: true
   *
   * @default true
   * @type {boolean}
   */
  showLabel?: boolean;
  /**
   * Overrides emblem size. Defaults: compact 24px, others 48px
   *
   * @default undefined
   * @type {number | string}
   */
  size?: number | string;
}

export const Logo = forwardRef<HTMLDivElement, LogoProps>(function Logo(
  {
    layout = "horizontal",
    tone = "multi",
    label = "okryshto.dev",
    showLabel = true,
    size,
    className,
    style,
    ...rest
  },
  ref,
) {
  const rawId = useId().replace(/:/g, "");
  const clipId = `okkly-logo-clip-${rawId}`;
  const isMulti = tone === "multi";

  const classes = [
    "okkly-component",
    "okkly-logo",
    layout !== "horizontal" && `okkly-logo--${layout}`,
    !isMulti && `okkly-logo--tone-${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle: CSSProperties | undefined = size
    ? ({
        "--okkly-logo-emblem-size": typeof size === "number" ? `${size}px` : size,
        ...style,
      } as CSSProperties)
    : style;

  // Multi-color emblem — the Figma "Celestial Yin-Yang" orb, static variant.
  // Same geometry the AnimatedLogo builds on, cropped to the orb alone.
  const renderMultiLogo = () => {
    const yinId = `okkly-logo-yin-${rawId}`;
    const yangId = `okkly-logo-yang-${rawId}`;
    const topLobeId = `okkly-logo-lobe-top-${rawId}`;
    const bottomLobeId = `okkly-logo-lobe-bottom-${rawId}`;

    return (
      <svg
        className="okkly-logo__emblem"
        viewBox="54 54 132 132"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={yinId}
            x1="6.6"
            y1="-2.95043e-06"
            x2="91.3706"
            y2="25.4312"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#5EE6C1" />
            <stop offset="1" stopColor="#FF3D8B" />
          </linearGradient>
          <linearGradient id={yangId} x1="0" y1="0" x2="66" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F46E5" />
            <stop offset="1" stopColor="#9063FF" />
          </linearGradient>
          <linearGradient
            id={topLobeId}
            x1="100.2"
            y1="54"
            x2="157.097"
            y2="76.7586"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#5EE6C1" />
            <stop offset="1" stopColor="#FF3D8B" />
          </linearGradient>
          <linearGradient
            id={bottomLobeId}
            x1="87"
            y1="120"
            x2="153"
            y2="120"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4F46E5" />
            <stop offset="1" stopColor="#9063FF" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x="54" y="54" width="132" height="132" rx="66" fill="white" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <circle cx="120" cy="120" r="66" fill="#080809" />
          <rect width="66" height="132" transform="translate(54 54)" fill={`url(#${yinId})`} />
          <g opacity="0.2">
            <circle cx="97" cy="97" r="30.5" stroke="black" />
            <circle cx="89" cy="125" r="46.5" stroke="black" />
          </g>
          <rect width="66" height="132" transform="translate(120 54)" fill={`url(#${yangId})`} />
          <g opacity="0.25">
            <line x1="84.25" y1="71.567" x2="198.565" y2="137.567" stroke="white" />
            <line x1="84.25" y1="107.567" x2="198.565" y2="173.567" stroke="white" />
            <line x1="84.25" y1="143.567" x2="198.565" y2="209.567" stroke="white" />
          </g>
          <rect x="87" y="54" width="66" height="66" rx="33" fill={`url(#${topLobeId})`} />
          <circle cx="119.5" cy="86.5" r="6.5" fill="#04140F" />
          <rect x="87" y="120" width="66" height="66" rx="33" fill={`url(#${bottomLobeId})`} />
          <circle cx="119.5" cy="152.5" r="6.5" fill="#5EE6C1" />
        </g>
      </svg>
    );
  };

  // Single-tone yin-yang logo
  const renderSingleToneLogo = () => {
    const lightGradientId = `okkly-logo-light-${rawId}`;
    const darkGradientId = `okkly-logo-dark-${rawId}`;

    return (
      <svg
        className="okkly-logo__emblem"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx="26" cy="26" r="26" />
          </clipPath>
          <linearGradient
            id={lightGradientId}
            x1="0"
            y1="0"
            x2="35"
            y2="12"
            gradientUnits="userSpaceOnUse"
          >
            <stop style={{ stopColor: "var(--okkly-logo-light-start)" }} />
            <stop offset="1" style={{ stopColor: "var(--okkly-logo-light-end)" }} />
          </linearGradient>
          <linearGradient
            id={darkGradientId}
            x1="26"
            y1="0"
            x2="52"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop style={{ stopColor: "var(--okkly-logo-dark-start)" }} />
            <stop offset="1" style={{ stopColor: "var(--okkly-logo-dark-end)" }} />
          </linearGradient>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect width="26" height="52" fill={`url(#${lightGradientId})`} />
          <rect x="26" width="26" height="52" fill={`url(#${darkGradientId})`} />
          <rect x="13" width="26" height="26" rx="13" fill={`url(#${lightGradientId})`} />
          <circle cx="26" cy="13" r="3.12" fill="var(--okkly-logo-dot-on-light)" />
          <rect x="13" y="26" width="26" height="26" rx="13" fill={`url(#${darkGradientId})`} />
          <circle cx="26" cy="39" r="3.12" fill="var(--okkly-logo-dot-on-dark)" />
        </g>
        <rect
          x="0.5"
          y="0.5"
          width="51"
          height="51"
          rx="25.5"
          stroke="var(--okkly-logo-ring-color)"
        />
      </svg>
    );
  };

  return (
    <div ref={ref} className={classes} style={mergedStyle} {...rest}>
      {isMulti ? renderMultiLogo() : renderSingleToneLogo()}
      {showLabel && <span className="okkly-logo__label">{label}</span>}
    </div>
  );
});
