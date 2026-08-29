"use client";

import { type HTMLAttributes, type ReactNode } from "react";
import "@okryshto/design-system/components/EmptyState/EmptyState.scss";
import { SeverityIcon, type SeverityIconSeverity } from "../SeverityIcon/SeverityIcon";

export type EmptyStateSize = "small" | "medium" | "large";
export type EmptyStateColor = "primary" | "dante" | "indigo" | "danger";

/**
 * No direct MUI equivalent — closest is a custom empty-list pattern. Provides a
 * centered column layout with optional icon halo, title, description, and action slot.
 */
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Headline explaining the empty state.
   *
   * @default undefined
   * @type {ReactNode}
   */
  title: ReactNode;
  /**
   * Supporting copy.
   *
   * @default undefined
   * @type {ReactNode}
   */
  description?: ReactNode;
  /**
   * Custom illustration or icon node — overrides the default SeverityIcon.
   *
   * @default undefined
   * @type {ReactNode}
   */
  icon?: ReactNode;
  /**
   * Which glyph the default icon draws. The colour comes from `color`, not from
   * here — so `severity="danger"` on a `primary` panel is a cross in mint.
   *
   * @default undefined
   * @type {SeverityIconSeverity}
   */
  severity?: SeverityIconSeverity;
  /**
   * Accent tone for the halo and the icon.
   *
   * @default "primary"
   * @type {EmptyStateColor}
   */
  color?: EmptyStateColor;
  /**
   * Primary action slot (e.g. a Button).
   *
   * @default undefined
   * @type {ReactNode}
   */
  action?: ReactNode;
  /**
   * Layout scale.
   *
   * @default "medium"
   * @type {EmptyStateSize}
   */
  size?: EmptyStateSize;
}

const COLOR_SEVERITY: Record<EmptyStateColor, SeverityIconSeverity> = {
  primary: "primary",
  dante: "primary",
  indigo: "primary",
  danger: "danger",
};

const ICON_SIZE: Record<EmptyStateSize, "small" | "medium" | "large"> = {
  small: "small",
  medium: "large",
  large: "large",
};

export function EmptyState({
  title,
  description,
  icon,
  severity,
  color = "primary",
  action,
  size = "medium",
  className,
  ...rest
}: EmptyStateProps) {
  const iconSeverity = severity ?? COLOR_SEVERITY[color];

  const classes = [
    "okryshto-component",
    "okryshto-empty-state",
    size !== "medium" && `okryshto-empty-state--${size}`,
    color !== "primary" && `okryshto-empty-state--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {(icon || iconSeverity) && (
        <div className="okryshto-empty-state__visual">
          <span className="okryshto-empty-state__halo" aria-hidden="true" />
          <span className="okryshto-empty-state__icon">
            {icon ?? <SeverityIcon severity={iconSeverity} size={ICON_SIZE[size]} shape="circle" />}
          </span>
        </div>
      )}
      <h4 className="okryshto-empty-state__title">{title}</h4>
      {description && <p className="okryshto-empty-state__description">{description}</p>}
      {action && <div className="okryshto-empty-state__action">{action}</div>}
    </div>
  );
}
