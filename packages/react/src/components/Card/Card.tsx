"use client";

import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import "@okryshto/design-system/components/Card/Card.scss";

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
    "okryshto-component",
    "okryshto-card",
    effectiveVariant !== "solid" && `okryshto-card--${effectiveVariant}`,
    padding !== "md" && `okryshto-card--padding-${padding}`,
    color !== "primary" && effectiveVariant === "aura" && `okryshto-card--color-${color}`,
    interactive && "okryshto-card--interactive",
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
  const classes = ["okryshto-card__header", className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      {avatar && <div className="okryshto-card__avatar">{avatar}</div>}
      <div className="okryshto-card__heading">
        {title !== undefined && <h3 className="okryshto-card__title">{title}</h3>}
        {subheader !== undefined && <p className="okryshto-card__subheader">{subheader}</p>}
        {children}
      </div>
      {action && <div className="okryshto-card__action">{action}</div>}
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
  const classes = ["okryshto-card__content", className].filter(Boolean).join(" ");

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
  const classes = ["okryshto-card__actions", className].filter(Boolean).join(" ");

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

  const classes = ["okryshto-card__media", className].filter(Boolean).join(" ");

  return <img className={classes} alt={alt} style={{ height: cssHeight, ...style }} {...rest} />;
}
