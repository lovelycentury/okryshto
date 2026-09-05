"use client";

import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import "@okkly/design-system/components/Skeleton/Skeleton.scss";

export type SkeletonVariant = "text" | "circular" | "rectangular" | "rounded";
export type SkeletonAnimation = "pulse" | "wave" | false;

/**
 * Props follow MUI's Skeleton API (https://mui.com/material-ui/api/skeleton/) as closely
 * as this design allows: `variant`/`width`/`height`/`animation` match name-for-name.
 * Deliberate gaps: no `sx`/`classes`, no `component` polymorphism (always a `span`).
 */
export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Placeholder shape.
   *
   * @default "text"
   * @type {SkeletonVariant}
   */
  variant?: SkeletonVariant;
  /**
   * Explicit width (number = px, string = any CSS length).
   *
   * @default undefined
   * @type {number | string}
   */
  width?: number | string;
  /**
   * Explicit height (number = px, string = any CSS length).
   *
   * @default undefined
   * @type {number | string}
   */
  height?: number | string;
  /**
   * Shimmer effect — pulse (default), wave, or none.
   *
   * @default "pulse"
   * @type {SkeletonAnimation}
   */
  animation?: SkeletonAnimation;
}

function toCssLength(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value / 16}rem` : value;
}

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = "text", width, height, animation = "pulse", className, style, ...rest },
  forwardedRef,
) {
  const classes = [
    "okkly-component",
    "okkly-skeleton",
    variant !== "text" && `okkly-skeleton--${variant}`,
    animation === "pulse" && "okkly-skeleton--pulse",
    animation === "wave" && "okkly-skeleton--wave",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const cssVars: CSSProperties = {
    ...(width !== undefined && { "--okkly-skeleton-width": toCssLength(width) }),
    ...(height !== undefined && { "--okkly-skeleton-height": toCssLength(height) }),
    ...style,
  };

  return (
    <span
      ref={forwardedRef}
      aria-hidden="true"
      className={classes}
      style={Object.keys(cssVars).length > 0 ? cssVars : style}
      {...rest}
    />
  );
});
