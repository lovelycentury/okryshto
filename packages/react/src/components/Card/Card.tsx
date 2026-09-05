"use client";

import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import "@okkly/design-system/components/Card/Card.scss";

export type CardVariant = "solid" | "raised" | "glass" | "outline" | "aura";
export type CardColor = "primary" | "dante" | "indigo";
export type CardPadding = "none" | "sm" | "md" | "lg";

/**
 * Props follow MUI's Card API (https://mui.com/material-ui/api/card/) where they
 * overlap: `raised` maps to the elevated surface, `children` is the slot tree.
 * Deliberate gaps: composition uses `CardHeader` / `CardContent` / `CardActions` /
 * `CardMedia` subcomponents instead of flat props; `variant` adds glass/outline/aura
 * treatments from this design system.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Elevated surface with shadow.
   *
   * @default false
   * @type {boolean}
   */
  raised?: boolean;
  /**
   * Inner padding preset for content slots.
   *
   * @default "md"
   * @type {CardPadding}
   */
  padding?: CardPadding;
  /**
   * Surface treatment — `solid` is default (no modifier).
   *
   * @default "solid"
   * @type {CardVariant}
   */
  variant?: CardVariant;
  /**
   * Accent tone for `aura` variant.
   *
   * @default "primary"
   * @type {CardColor}
   */
  color?: CardColor;
  /**
   * Hover lift on interactive cards.
   *
   * @default false
   * @type {boolean}
   */
  interactive?: boolean;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export function Card({
  raised = false,
  padding = "md",
  variant = "solid",
  color = "primary",
  interactive = false,
  children,
  className,
  ...rest
}: CardProps) {
  const effectiveVariant = raised && variant === "solid" ? "raised" : variant;

  const classes = [
    "okkly-component",
    "okkly-card",
    effectiveVariant !== "solid" && `okkly-card--${effectiveVariant}`,
    padding !== "md" && `okkly-card--padding-${padding}`,
    color !== "primary" && effectiveVariant === "aura" && `okkly-card--color-${color}`,
    interactive && "okkly-card--interactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Title.
   *
   * @default undefined
   * @type {ReactNode}
   */
  title?: ReactNode;
  /**
   * Subheader.
   *
   * @default undefined
   * @type {ReactNode}
   */
  subheader?: ReactNode;
  /**
   * Action.
   *
   * @default undefined
   * @type {ReactNode}
   */
  action?: ReactNode;
  /**
   * Avatar.
   *
   * @default undefined
   * @type {ReactNode}
   */
  avatar?: ReactNode;
}

export function CardHeader({
  title,
  subheader,
  action,
  avatar,
  className,
  children,
  ...rest
}: CardHeaderProps) {
  const classes = ["okkly-card__header", className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      {avatar && <div className="okkly-card__avatar">{avatar}</div>}
      <div className="okkly-card__heading">
        {title !== undefined && <h3 className="okkly-card__title">{title}</h3>}
        {subheader !== undefined && <p className="okkly-card__subheader">{subheader}</p>}
        {children}
      </div>
      {action && <div className="okkly-card__action">{action}</div>}
    </div>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export function CardContent({ children, className, ...rest }: CardContentProps) {
  const classes = ["okkly-card__content", className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export interface CardActionsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export function CardActions({ children, className, ...rest }: CardActionsProps) {
  const classes = ["okkly-card__actions", className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export interface CardMediaProps extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Image height — number is px, string is any CSS length.
   *
   * @default 150
   * @type {number | string}
   */
  height?: number | string;
}

export function CardMedia({ height = 150, className, style, alt = "", ...rest }: CardMediaProps) {
  const cssHeight = typeof height === "number" ? `${height / 16}rem` : height;

  const classes = ["okkly-card__media", className].filter(Boolean).join(" ");

  return <img className={classes} alt={alt} style={{ height: cssHeight, ...style }} {...rest} />;
}
