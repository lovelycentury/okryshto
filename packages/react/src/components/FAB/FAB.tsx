"use client";

import {
  forwardRef,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import "@okkly/design-system/components/FAB/FAB.scss";
import { useRipple } from "@okkly/react-hooks";
import { Ripple } from "../Ripple/Ripple";

export type FabVariant = "standard" | "soft";
export type FabColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type FabSize = "small" | "medium" | "large";

/**
 * Props follow MUI's Fab API (https://mui.com/material-ui/api/fab/) as
 * closely as this design allows: `color`/`size`/`disabled`/`href` match
 * name-for-name. Deliberate gaps/renames: `variant` is `"standard"|"soft"`
 * instead of MUI's `"circular"|"extended"` — shape here is inferred from
 * whether `label` is set (the "extended" pill) rather than a separate enum
 * value, and `"soft"` is this design's de-emphasized surface treatment (no
 * MUI equivalent). No `disableRipple`/`disableFocusRipple` split — one
 * `disableRipple` covers both, matching `Button`. No built-in `SpeedDial` —
 * MUI ships that as its own component; compose plain `Fab`s instead (see the
 * "SpeedDial" story).
 */
type SharedProps = {
  /**
   * Fill treatment.
   *
   * @default "standard"
   * @type {FabVariant}
   */
  variant?: FabVariant;
  /**
   * Fill colour (dante-ready). Only affects the "standard" variant.
   *
   * @default "primary"
   * @type {FabColor}
   */
  color?: FabColor;
  /**
   * Diameter.
   *
   * @default "medium"
   * @type {FabSize}
   */
  size?: FabSize;
  /**
   * Glyph slot — always present.
   *
   * @default undefined
   * @type {ReactNode}
   */
  icon: ReactNode;
  /**
   * Label slot. Setting it grows the FAB into an extended pill (icon + text) instead of a plain circle.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * If `true`, the ripple effect is disabled.
   *
   * @default false
   * @type {boolean}
   */
  disableRipple?: boolean;
  /** Accessible name. Required when there's no visible `label` (a plain icon FAB needs one). */
  "aria-label"?: string;
};

export type FabProps = SharedProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof SharedProps
  >;

export const Fab = forwardRef<HTMLButtonElement | HTMLAnchorElement, FabProps>(function Fab(
  {
    variant = "standard",
    color = "primary",
    size = "medium",
    icon,
    label,
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
    "okkly-component",
    "okkly-fab",
    variant !== "standard" && `okkly-fab--${variant}`,
    color !== "primary" && `okkly-fab--color-${color}`,
    label != null && "okkly-fab--extended",
    size !== "medium" && `okkly-fab--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {showRipple && <Ripple ripples={ripples} onRippleEnd={hideRipple} />}
      <span className="okkly-fab__icon" aria-hidden="true">
        {icon}
      </span>
      {label != null && <span className="okkly-fab__label okkly-truncation-ellipsis">{label}</span>}
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
});
