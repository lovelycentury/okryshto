"use client";

import { type ReactNode } from "react";
import "@okryshto/design-system/components/Badge/Badge.scss";

export type BadgeColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

export type BadgeVariant = "standard" | "dot";
export type BadgeOverlap = "circular" | "rectangular";

export interface BadgeAnchorOrigin {
  vertical: "top" | "bottom";
  horizontal: "left" | "right";
}

/**
 * Props follow MUI's Badge API (https://mui.com/material-ui/api/badge/) as
 * closely as this design allows: `badgeContent`/`children`/`color`/`variant`/
 * `max`/`invisible`/`overlap`/`anchorOrigin` match name-for-name.
 * Deliberate gaps: no `showZero` (zero counts stay hidden like MUI's default),
 * no `anchorOrigin` presets beyond top/bottom × left/right, and the default
 * uncoloured pill uses this design's neutral raised surface instead of MUI's
 * grey `default`.
 */
export interface BadgeProps {
  /**
   * Count or short label. Hidden when `0`, unless you pass a non-numeric node.
   *
   * @default undefined
   * @type {ReactNode}
   */
  badgeContent?: ReactNode;
  /**
   * Element the badge anchors to. Omit for a standalone pill/dot.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
  /**
   * Semantic fill tone. Omit for a neutral raised count.
   *
   * @default undefined
   * @type {BadgeColor}
   */
  color?: BadgeColor;
  /**
   * Number pill or status dot.
   *
   * @default "standard"
   * @type {BadgeVariant}
   */
  variant?: BadgeVariant;
  /**
   * Overflow cap — numbers above this render as `{max}+`.
   *
   * @default 99
   * @type {number}
   */
  max?: number;
  /**
   * Hides the badge without unmounting the anchor it sits on.
   *
   * @default false
   * @type {boolean}
   */
  invisible?: boolean;
  /**
   * Adjusts corner offset for circular vs rectangular anchors.
   *
   * @default "circular"
   * @type {BadgeOverlap}
   */
  overlap?: BadgeOverlap;
  /**
   * Corner placement relative to `children`.
   *
   * @default { vertical: "top", horizontal: "right" }
   * @type {BadgeAnchorOrigin}
   */
  anchorOrigin?: BadgeAnchorOrigin;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

function formatContent(content: ReactNode, max: number): ReactNode {
  if (content == null || content === false) return null;
  if (typeof content === "number") {
    if (content === 0) return null;
    if (content > max) return `${max}+`;
  }
  return content;
}

function shouldHide(content: ReactNode, invisible: boolean, variant: BadgeVariant) {
  if (invisible) return true;
  if (variant === "dot") return false;
  return content == null || content === false || content === 0;
}

export function Badge({
  badgeContent,
  children,
  color,
  variant = "standard",
  max = 99,
  invisible = false,
  overlap = "circular",
  anchorOrigin = { vertical: "top", horizontal: "right" },
  className,
}: BadgeProps) {
  const formatted = variant === "dot" ? null : formatContent(badgeContent, max);
  const hidden = shouldHide(formatted, invisible, variant);
  const standalone = children == null;

  const rootClasses = [
    "okryshto-component",
    "okryshto-badge",
    standalone && "okryshto-badge--standalone",
    overlap === "rectangular" && "okryshto-badge--overlap-rectangular",
    color && `okryshto-badge--color-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const contentClasses = [
    "okryshto-badge__content",
    variant === "dot" && "okryshto-badge__content--dot",
    hidden && "okryshto-badge__content--invisible",
    !standalone && `okryshto-badge__content--${anchorOrigin.vertical}`,
    !standalone && `okryshto-badge__content--${anchorOrigin.horizontal}`,
  ]
    .filter(Boolean)
    .join(" ");

  const badgeNode = (
    <span
      className={contentClasses}
      data-testid="badge-content"
      aria-hidden={variant === "dot" || hidden ? true : undefined}
    >
      {variant === "standard" ? formatted : null}
    </span>
  );

  if (standalone) {
    return <span className={rootClasses}>{badgeNode}</span>;
  }

  return (
    <span className={rootClasses}>
      <span className="okryshto-badge__anchor">{children}</span>
      {badgeNode}
    </span>
  );
}
