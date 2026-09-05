"use client";

import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from "react";
import "@okkly/design-system/components/LinkCard/LinkCard.scss";

export type LinkCardColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type LinkCardSize = "small" | "medium" | "large";

const ArrowUpRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

/**
 * The signature "vizitka" row: a tappable link to a destination (writing,
 * work, socials). No MUI equivalent — closest is ListItemButton, but this
 * design's fixed title/subtitle/meta shape and `featured` glow have no
 * direct API to mirror.
 */
export interface LinkCardProps extends Omit<HTMLAttributes<HTMLElement>, "onClick" | "title"> {
  /**
   * Primary label.
   *
   * @default undefined
   * @type {string}
   */
  title: string;
  /**
   * Supporting line.
   *
   * @default undefined
   * @type {string}
   */
  subtitle?: string;
  /**
   * Right-aligned tag/handle, e.g. "essays" or "@handle".
   *
   * @default undefined
   * @type {ReactNode}
   */
  meta?: ReactNode;
  /**
   * Accent dot, glass surface + glow.
   *
   * @default false
   * @type {boolean}
   */
  featured?: boolean;
  /**
   * Accent tone when featured (dante-ready).
   *
   * @default "primary"
   * @type {LinkCardColor}
   */
  color?: LinkCardColor;
  /**
   * Row density.
   *
   * @default "medium"
   * @type {LinkCardSize}
   */
  size?: LinkCardSize;
  /**
   * Destination URL — renders an `<a>`.
   *
   * @default undefined
   * @type {string}
   */
  href?: string;
  /**
   * Click handler; works with or without `href`.
   *
   * @default undefined
   * @type {(event: MouseEvent<HTMLAnchorElement | HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void}
   */
  onClick?: (
    event: MouseEvent<HTMLAnchorElement | HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
  ) => void;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

/** Portfolio "list of links" row. No MUI equivalent — this design has no reference API to mirror. */
export function LinkCard({
  title,
  subtitle,
  meta,
  featured = false,
  color = "primary",
  size = "medium",
  href,
  onClick,
  className,
  ...rest
}: LinkCardProps) {
  const isDivInteractive = !href && !!onClick;

  const classes = [
    "okkly-component",
    "okkly-link-card",
    color !== "primary" && `okkly-link-card--color-${color}`,
    size !== "medium" && `okkly-link-card--${size}`,
    featured && "okkly-link-card--featured",
    isDivInteractive && "okkly-link-card--interactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <div className="okkly-link-card__main">
        <div className="okkly-link-card__title-row">
          {featured && <span className="okkly-link-card__dot" aria-hidden="true" />}
          <h4 className="okkly-link-card__title okkly-truncation-ellipsis">{title}</h4>
        </div>
        {subtitle && <p className="okkly-link-card__subtitle">{subtitle}</p>}
      </div>
      <div className="okkly-link-card__aside">
        {meta && <span className="okkly-link-card__meta">{meta}</span>}
        <span className="okkly-link-card__arrow" aria-hidden="true">
          <ArrowUpRightIcon />
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick as (event: MouseEvent<HTMLAnchorElement>) => void}
        {...(rest as HTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isDivInteractive) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.(event);
    }
  };

  // `button`, not `link`: without an `href` there is nowhere to go, and this row
  // answers to Space as well as Enter — which is exactly how a button behaves and
  // not how a link does.
  return (
    <div
      className={classes}
      onClick={onClick as (event: MouseEvent<HTMLDivElement>) => void}
      onKeyDown={handleKeyDown}
      role={isDivInteractive ? "button" : undefined}
      tabIndex={isDivInteractive ? 0 : undefined}
      {...(rest as HTMLAttributes<HTMLDivElement>)}
    >
      {content}
    </div>
  );
}
