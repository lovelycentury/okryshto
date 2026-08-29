"use client";

import {
  forwardRef,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import "@okryshto/design-system/components/IconButton/IconButton.scss";
import { useRipple } from "@okryshto/react-hooks";
import { Ripple } from "../Ripple/Ripple";

export type IconButtonVariant = "ghost" | "glass" | "solid";
export type IconButtonColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type IconButtonSize = "small" | "medium" | "large";

/**
 * Props follow MUI's IconButton API (https://mui.com/material-ui/api/icon-button/) as
 * closely as this design allows: `color`/`size`/`disabled`/`disableRipple`/`href` match
 * name-for-name. Deliberate gaps: `variant` is `"ghost"|"glass"|"solid"` (surface
 * treatment — MUI encodes fill via `color` instead), no `edge` padding tweak, no generic
 * `component` polymorphism (use `href` for links). Accepts `icon` or `children` for the
 * glyph slot; provide `aria-label` when the control has no visible text.
 */
type SharedProps = {
  /**
   * Surface treatment.
   *
   * @default "ghost"
   * @type {IconButtonVariant}
   */
  variant?: IconButtonVariant;
  /**
   * Accent tone for focus glow (and rare tint).
   *
   * @default "primary"
   * @type {IconButtonColor}
   */
  color?: IconButtonColor;
  /**
   * Square tap target size.
   *
   * @default "medium"
   * @type {IconButtonSize}
   */
  size?: IconButtonSize;
  /**
   * Glyph slot — prefer `icon`, fall back to `children`.
   *
   * @default undefined
   * @type {ReactNode}
   */
  icon?: ReactNode;
  /**
   * Alternative glyph slot when `icon` is omitted.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
  /**
   * If `true`, the ripple effect is disabled.
   *
   * @default false
   * @type {boolean}
   */
  disableRipple?: boolean;
  /** Accessible name. Required when there is no visible text label. */
  "aria-label"?: string;
};

export type IconButtonProps = SharedProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof SharedProps
  >;

export const IconButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, IconButtonProps>(
  function IconButton(
    {
      variant = "ghost",
      color = "primary",
      size = "medium",
      icon,
      children,
      disableRipple = false,
      disabled = false,
      className,
      href,
      ...rest
    },
    forwardedRef,
  ) {
    const localRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
    const setRef = (node: HTMLButtonElement | HTMLAnchorElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const showRipple = !disableRipple && !disabled;
    const { ripples, events, hideRipple } = useRipple(localRef);

    const classes = [
      "okryshto-component",
      "okryshto-icon-button",
      variant !== "ghost" && `okryshto-icon-button--${variant}`,
      color !== "primary" && `okryshto-icon-button--color-${color}`,
      size !== "medium" && `okryshto-icon-button--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const visual = icon ?? children;

    const content = (
      <>
        {showRipple && <Ripple ripples={ripples} onRippleEnd={hideRipple} />}
        <span className="okryshto-icon-button__icon" aria-hidden="true">
          {visual}
        </span>
      </>
    );

    if (href) {
      return (
        <a
          ref={setRef as (node: HTMLAnchorElement | null) => void}
          href={disabled ? undefined : href}
          aria-disabled={disabled || undefined}
          className={classes}
          {...(showRipple ? events : {})}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={setRef as (node: HTMLButtonElement | null) => void}
        type="button"
        disabled={disabled}
        className={classes}
        {...(showRipple ? events : {})}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
);
