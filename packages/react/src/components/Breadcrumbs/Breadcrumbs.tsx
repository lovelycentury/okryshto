"use client";

import { useState, type HTMLAttributes, type ReactNode } from "react";
import "@okryshto/design-system/components/Breadcrumbs/Breadcrumbs.scss";

export interface BreadcrumbItem {
  /** Crumb text. */
  label: ReactNode;
  /** Renders this crumb as a link. The last item ignores it — it's always the current page. */
  href?: string;
  /** Leading icon (e.g. a home glyph on the first crumb). */
  icon?: ReactNode;
}

const ChevronRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 6 6 6-6 6" />
  </svg>
);

/**
 * Props follow MUI's Breadcrumbs API (https://mui.com/material-ui/api/breadcrumbs/)
 * as closely as this design allows: `separator`/`maxItems`/`itemsBeforeCollapse`/
 * `itemsAfterCollapse` match name-for-name. Deliberate gaps/renames: crumbs
 * come from a plain `items` array (`{label,href,icon}`) instead of `children`
 * (no `Link`/`Typography` composition here), and there's no
 * `expandText`/custom collapse render prop — the "…" is a fixed built-in button.
 */
export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /**
   * Path segments, in order. The last one renders as the current page, not a link.
   *
   * @default undefined
   * @type {BreadcrumbItem[]}
   */
  items: BreadcrumbItem[];
  /**
   * Rendered between crumbs.
   *
   * @default <ChevronRightIcon />
   * @type {ReactNode}
   */
  separator?: ReactNode;
  /**
   * Collapses the middle crumbs behind a "…" once `items.length` exceeds this.
   *
   * @default 8
   * @type {number}
   */
  maxItems?: number;
  /**
   * Crumbs kept visible before the collapsed "…".
   *
   * @default 1
   * @type {number}
   */
  itemsBeforeCollapse?: number;
  /**
   * Crumbs kept visible after the collapsed "…".
   *
   * @default 1
   * @type {number}
   */
  itemsAfterCollapse?: number;
  /**
   * Accessible name for the "…" expand button.
   *
   * @default "Show all crumbs"
   * @type {string}
   */
  expandAriaLabel?: string;
}

export function Breadcrumbs({
  items,
  separator = <ChevronRightIcon />,
  maxItems = 8,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 1,
  expandAriaLabel = "Show all crumbs",
  className,
  ...rest
}: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);

  const classes = ["okryshto-component", "okryshto-breadcrumbs", className]
    .filter(Boolean)
    .join(" ");

  const renderCrumb = (item: BreadcrumbItem, isLast: boolean) => {
    const inner = (
      <>
        {item.icon && (
          <span className="okryshto-breadcrumbs__icon" aria-hidden="true">
            {item.icon}
          </span>
        )}
        {item.label}
      </>
    );

    if (isLast || !item.href) {
      return (
        <span className="okryshto-breadcrumbs__current" aria-current={isLast ? "page" : undefined}>
          {inner}
        </span>
      );
    }

    return (
      <a className="okryshto-breadcrumbs__link" href={item.href}>
        {inner}
      </a>
    );
  };

  const separatorNode = (key: string) => (
    <li className="okryshto-breadcrumbs__separator" aria-hidden="true" key={key}>
      {separator}
    </li>
  );

  const canCollapse =
    !expanded && items.length > maxItems && itemsBeforeCollapse + itemsAfterCollapse < items.length;

  const visible: ReactNode[] = [];
  if (canCollapse) {
    items.slice(0, itemsBeforeCollapse).forEach((item, index) => {
      visible.push(
        <li className="okryshto-breadcrumbs__item" key={`before-${index}`}>
          {renderCrumb(item, false)}
        </li>,
      );
      visible.push(separatorNode(`sep-before-${index}`));
    });
    visible.push(
      <li key="ellipsis">
        <button
          type="button"
          className="okryshto-breadcrumbs__ellipsis"
          aria-label={expandAriaLabel}
          onClick={() => setExpanded(true)}
        >
          …
        </button>
      </li>,
    );
    visible.push(separatorNode("sep-ellipsis"));
    items.slice(items.length - itemsAfterCollapse).forEach((item, index) => {
      const isLast = index === itemsAfterCollapse - 1;
      visible.push(
        <li className="okryshto-breadcrumbs__item" key={`after-${index}`}>
          {renderCrumb(item, isLast)}
        </li>,
      );
      if (!isLast) visible.push(separatorNode(`sep-after-${index}`));
    });
  } else {
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      visible.push(
        <li className="okryshto-breadcrumbs__item" key={index}>
          {renderCrumb(item, isLast)}
        </li>,
      );
      if (!isLast) visible.push(separatorNode(`sep-${index}`));
    });
  }

  return (
    <nav aria-label="breadcrumb" className={classes} {...rest}>
      <ol className="okryshto-breadcrumbs__list">{visible}</ol>
    </nav>
  );
}
