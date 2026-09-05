"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import "@okkly/design-system/components/List/List.scss";

/**
 * Props follow MUI's List API (https://mui.com/material-ui/api/list/) where they
 * overlap: `dense`, `disablePadding`, `subheader`, `children`. Deliberate gaps: no
 * `component` polymorphism (always `ul`), no `disableListWrap`.
 */
export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  /**
   * Reduces vertical padding between items.
   *
   * @default false
   * @type {boolean}
   */
  dense?: boolean;
  /**
   * Removes outer list padding.
   *
   * @default false
   * @type {boolean}
   */
  disablePadding?: boolean;
  /**
   * Section label above the items.
   *
   * @default undefined
   * @type {ReactNode}
   */
  subheader?: ReactNode;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export const List = forwardRef<HTMLUListElement, ListProps>(function List(
  { dense = false, disablePadding = false, subheader, children, className, ...rest },
  ref,
) {
  const classes = [
    "okkly-component",
    "okkly-list",
    dense && "okkly-list--dense",
    disablePadding && "okkly-list--disable-padding",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ul ref={ref} className={classes} {...rest}>
      {subheader && <li className="okkly-list__subheader">{subheader}</li>}
      {children}
    </ul>
  );
});

/**
 * Props follow MUI's ListItem API (https://mui.com/material-ui/api/list-item/) for
 * `selected`, `disabled`, `button`, `secondaryAction`, and the click surface.
 * Deliberate gaps: `alignItems`/`divider`/`disableGutters` are omitted; use
 * `startIcon` instead of a separate `ListItemAvatar` in v1.
 */
export interface ListItemProps extends Omit<HTMLAttributes<HTMLLIElement>, "onClick"> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Highlights the row as active.
   *
   * @default false
   * @type {boolean}
   */
  selected?: boolean;
  /**
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Makes the row keyboard-focusable with hover feedback.
   *
   * @default false
   * @type {boolean}
   */
  button?: boolean;
  /**
   * Leading icon or avatar slot.
   *
   * @default undefined
   * @type {ReactNode}
   */
  startIcon?: ReactNode;
  /**
   * Trailing control (switch, badge, chevron, etc.).
   *
   * @default undefined
   * @type {ReactNode}
   */
  secondaryAction?: ReactNode;
  /**
   * Dense row padding.
   *
   * @default false
   * @type {boolean}
   */
  dense?: boolean;
  /**
   * On Click.
   *
   * @default undefined
   * @type {(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void}
   */
  onClick?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
}

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  {
    children,
    selected = false,
    disabled = false,
    button = false,
    startIcon,
    secondaryAction,
    dense = false,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  const isInteractive = button || !!onClick;

  const denseClass = dense ? "okkly-list-item--dense" : "";
  const selectedClass = selected ? "okkly-list-item--selected" : "";
  const disabledClass = disabled ? "okkly-list-item--disabled" : "";

  if (isInteractive) {
    const containerClasses = [
      "okkly-list-item",
      "okkly-list-item--container",
      denseClass,
      disabledClass,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const buttonClasses = ["okkly-list-item", "okkly-list-item--button", denseClass, selectedClass]
      .filter(Boolean)
      .join(" ");

    return (
      <li ref={ref} className={containerClasses} {...rest}>
        {/* A real button already fires `click` on Enter and Space — a keydown
            handler on top of it is either dead code or a double invocation. */}
        <button
          type="button"
          className={buttonClasses}
          disabled={disabled}
          onClick={onClick as (event: MouseEvent<HTMLButtonElement>) => void}
        >
          {startIcon && <span className="okkly-list-item__leading">{startIcon}</span>}
          <span className="okkly-list-item__content">{children}</span>
        </button>
        {secondaryAction && <span className="okkly-list-item__trailing">{secondaryAction}</span>}
      </li>
    );
  }

  const itemClasses = ["okkly-list-item", denseClass, selectedClass, disabledClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <li ref={ref} className={itemClasses} {...rest}>
      {startIcon && <span className="okkly-list-item__leading">{startIcon}</span>}
      <span className="okkly-list-item__content">{children}</span>
      {secondaryAction && <span className="okkly-list-item__trailing">{secondaryAction}</span>}
    </li>
  );
});

/**
 * Props follow MUI's ListItemText (primary/secondary slots).
 *
 * Every element here is a `span`, not the `div`/`p` you would reach for: an
 * interactive `ListItem` puts this inside a `<button>`, which only accepts
 * phrasing content, so block elements would be invalid markup the browser is
 * free to reparent.
 */
export interface ListItemTextProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Primary.
   *
   * @default undefined
   * @type {ReactNode}
   */
  primary?: ReactNode;
  /**
   * Secondary.
   *
   * @default undefined
   * @type {ReactNode}
   */
  secondary?: ReactNode;
}

export function ListItemText({ primary, secondary, className, ...rest }: ListItemTextProps) {
  const classes = ["okkly-list-item__text", className].filter(Boolean).join(" ");

  return (
    <span className={classes} {...rest}>
      {primary !== undefined && <span className="okkly-list-item__primary">{primary}</span>}
      {secondary !== undefined && <span className="okkly-list-item__secondary">{secondary}</span>}
    </span>
  );
}

/** Leading icon slot sized for list rows. */
export interface ListItemIconProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export function ListItemIcon({ children, className, ...rest }: ListItemIconProps) {
  const classes = ["okkly-list-item__icon", className].filter(Boolean).join(" ");

  return (
    <span className={classes} aria-hidden="true" {...rest}>
      {children}
    </span>
  );
}
