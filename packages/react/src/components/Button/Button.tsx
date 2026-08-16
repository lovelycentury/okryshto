import {
  forwardRef,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import "@okryshto/design-system/components/Button/Button.scss";
import { useRipple } from "@okryshto/react-hooks";
import { Ripple } from "../Ripple/Ripple";

export type ButtonVariant = "primary" | "gradient" | "secondary" | "soft" | "ghost" | "glass";
export type ButtonColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type ButtonShape = "pill" | "rounded";
export type ButtonSize = "small" | "medium" | "large";
export type ButtonLoadingPosition = "start" | "center" | "end";

/**
 * Props follow MUI's Button API (https://mui.com/material-ui/api/button/) as
 * closely as this design allows: `variant`/`color`/`size`/`disabled`/
 * `startIcon`/`endIcon`/`fullWidth`/`href`/`loading*`/`disableRipple` all
 * match name-for-name. Deliberate gaps: no `sx` (no CSS-in-JS system here),
 * no `classes` (use `className`), no generic `component` polymorphism (use
 * `href` instead — covers the "plain navigation" case), no
 * `disableElevation`/`disableFocusRipple` (this design has no elevation
 * concept and doesn't distinguish focus-ripple from click-ripple).
 */
type SharedProps = {
  /**
   * Variant of the button. Can be `primary`, `gradient`, `secondary`, `soft`, `ghost`, or `glass`.
   *
   * @default "primary"
   * @type {ButtonVariant}
   */
  variant?: ButtonVariant;
  /**
   * Color of the button. Can be `primary`, `dante`, `indigo`, `violet`, `ember`, or `ice`.
   *
   * @default "primary"
   * @type {ButtonColor}
   */
  color?: ButtonColor;
  /**
   * Shape of the button. Can be `pill` or `rounded`.
   *
   * @default "pill"
   * @type {ButtonShape}
   */
  shape?: ButtonShape;
  /**
   * Size of the button. Can be `small`, `medium`, or `large`.
   *
   * @default "medium"
   * @type {ButtonSize}
   */
  size?: ButtonSize;
  /**
   * Whether the button takes the full width of its container.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Whether the ripple effect is disabled.
   *
   * @default false
   * @type {boolean}
   */
  disableRipple?: boolean;
  /**
   * Whether the loading indicator is visible and the button is disabled.
   *
   * @default false
   * @type {boolean}
   */
  loading?: boolean;
  /**
   * Position of the loading indicator relative to the label. Can be `start`, `center`, or `end`.
   *
   * @default "center"
   * @type {ButtonLoadingPosition}
   */
  loadingPosition?: ButtonLoadingPosition;
  /**
   * Icon before the label.
   *
   * @default undefined
   * @type {ReactNode}
   */
  startIcon?: ReactNode;
  /**
   * Icon after the label.
   *
   * @default undefined
   * @type {ReactNode}
   */
  endIcon?: ReactNode;
  /**
   * Label of the button.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
};

export type ButtonProps = SharedProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof SharedProps
  >;

const Spinner = () => (
  <span className="okryshto-button__spinner" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="42 100"
      />
    </svg>
  </span>
);

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      color = "primary",
      shape = "pill",
      size = "medium",
      fullWidth = false,
      disableRipple = false,
      loading = false,
      loadingPosition = "center",
      disabled = false,
      startIcon,
      endIcon,
      children,
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

    const isDisabled = disabled || loading;
    const showRipple = !disableRipple && !isDisabled;
    const { ripples, events, hideRipple } = useRipple(localRef);

    const classes = [
      "okryshto-component",
      "okryshto-button",
      `okryshto-button--${variant}`,
      color !== "primary" && `okryshto-button--color-${color}`,
      shape === "rounded" && "okryshto-button--rounded",
      size !== "medium" && `okryshto-button--${size}`,
      fullWidth && "okryshto-button--full-width",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const spinner = loading ? <Spinner /> : null;

    const content = (
      <>
        {showRipple && <Ripple ripples={ripples} onRippleEnd={hideRipple} />}
        {loadingPosition === "start" && spinner}
        {loadingPosition !== "start" && startIcon && (
          <span className="okryshto-button__icon">{startIcon}</span>
        )}
        <span
          className={`okryshto-button__label okryshto-truncation-ellipsis${loading && loadingPosition === "center" ? " okryshto-button__label--hidden" : ""}`}
        >
          {children}
        </span>
        {loadingPosition !== "end" && endIcon && (
          <span className="okryshto-button__icon">{endIcon}</span>
        )}
        {loadingPosition === "end" && spinner}
        {loading && loadingPosition === "center" && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {spinner}
          </span>
        )}
      </>
    );

    if (href) {
      return (
        <a
          ref={setRef as (node: HTMLAnchorElement | null) => void}
          href={isDisabled ? undefined : href}
          aria-disabled={isDisabled || undefined}
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
        disabled={isDisabled}
        className={classes}
        {...(showRipple ? events : {})}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
);
