"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import "@okryshto/design-system/components/ButtonGroup/ButtonGroup.scss";

export type ButtonGroupColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type ButtonGroupVariant = "primary" | "secondary";

export interface ButtonGroupItem {
  /** Segment text. */
  label?: ReactNode;
  /** Segment icon — combine with `label`, or use alone for an icon-only segment. */
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export interface ButtonGroupMenuItem {
  label: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

const ChevronDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/**
 * MUI's own "split button" recipe (https://mui.com/material-ui/react-button-group/#split-button)
 * — `ButtonGroup` + `Button` + `Menu` composed by the consumer — is folded
 * into this single component via `action`/`menu` instead. For a plain row of
 * independent toggle buttons, use `SegmentedToggle` — that's the dedicated
 * selection control (this component only ever renders one action).
 */
export interface ButtonGroupProps {
  /**
   * The main action: a one-click default, always visible.
   *
   * @default undefined
   * @type {ButtonGroupItem}
   */
  action: ButtonGroupItem;
  /**
   * Fill treatment.
   *
   * @default "primary"
   * @type {ButtonGroupVariant}
   */
  variant?: ButtonGroupVariant;
  /**
   * Dropdown opened by the chevron — variants of `action`, not unrelated commands.
   *
   * @default []
   * @type {ButtonGroupMenuItem[]}
   */
  menu?: ButtonGroupMenuItem[];
  /**
   * Tone colour (dante-ready).
   *
   * @default "primary"
   * @type {ButtonGroupColor}
   */
  color?: ButtonGroupColor;
  /**
   * Disables the whole split button.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Accessible name for the chevron toggle.
   *
   * @default "Open menu"
   * @type {string}
   */
  menuAriaLabel?: string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

export function ButtonGroup({
  action,
  variant = "primary",
  menu = [],
  color = "primary",
  disabled = false,
  menuAriaLabel = "Open menu",
  className,
}: ButtonGroupProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleChevronKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  const closeAndFocusChevron = () => {
    setOpen(false);
    chevronRef.current?.focus();
  };

  const classes = [
    "okryshto-component",
    "okryshto-button-group",
    variant === "secondary" && "okryshto-button-group--secondary",
    color !== "primary" && `okryshto-button-group--color-${color}`,
    disabled && "okryshto-button-group--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={rootRef} className={classes}>
      <button
        type="button"
        className="okryshto-button-group__segment"
        disabled={disabled || action.disabled}
        onClick={action.onClick}
      >
        {action.icon && (
          <span className="okryshto-button-group__icon" aria-hidden="true">
            {action.icon}
          </span>
        )}
        {action.label}
      </button>
      {menu.length > 0 && (
        <button
          ref={chevronRef}
          type="button"
          className="okryshto-button-group__segment okryshto-button-group__chevron"
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={menuAriaLabel}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={handleChevronKeyDown}
        >
          <span className="okryshto-button-group__chevron-icon" aria-hidden="true">
            <ChevronDownIcon />
          </span>
        </button>
      )}
      {open && (
        <div className="okryshto-button-group__menu" role="menu">
          {menu.map((item, index) => (
            <button
              key={index}
              type="button"
              role="menuitem"
              className="okryshto-button-group__menu-item"
              disabled={item.disabled}
              onClick={() => {
                item.onClick?.();
                closeAndFocusChevron();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
