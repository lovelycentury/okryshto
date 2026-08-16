import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import "@okryshto/design-system/components/Chip/Chip.scss";

export type ChipVariant = "glass" | "solid" | "outline" | "accent" | "dante";
export type ChipSize = "small" | "medium" | "large";

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

/**
 * Props follow MUI's Chip API (https://mui.com/material-ui/api/chip/) as
 * closely as this design allows: `label`/`icon`/`size`/`disabled`/`onClick`
 * match name-for-name. Deliberate gaps/renames: `onDelete` → `onRemove`
 * (clearer intent, same trailing-× behaviour), no `avatar` (no avatar
 * concept in this design; use `icon`), no `variant="filled"|"outlined"`
 * (this design's five surface `variant`s replace MUI's two), `clickable` is
 * inferred from `onClick` being set rather than a separate boolean.
 */
export interface ChipProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  /**
   * Chip text.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label: ReactNode;
  /**
   * Surface style.
   *
   * @default "glass"
   * @type {ChipVariant}
   */
  variant?: ChipVariant;
  /**
   * Chip size.
   *
   * @default "medium"
   * @type {ChipSize}
   */
  size?: ChipSize;
  /**
   * Active/filter state.
   *
   * @default false
   * @type {boolean}
   */
  selected?: boolean;
  /**
   * Leading status dot. Ignored when `icon` is set.
   *
   * @default false
   * @type {boolean}
   */
  dot?: boolean;
  /**
   * Leading icon — overrides `dot`.
   *
   * @default undefined
   * @type {ReactNode}
   */
  icon?: ReactNode;
  /**
   * Shows a trailing × to remove the chip.
   *
   * @default false
   * @type {boolean}
   */
  removable?: boolean;
  /**
   * Non-interactive; blocks `onClick` and `onRemove`.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Makes the chip clickable (e.g. a filter toggle). Adds button semantics.
   *
   * @default undefined
   * @type {(event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void}
   */
  onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
  /**
   * Fires when the trailing × is activated.
   *
   * @default undefined
   * @type {(event: MouseEvent<HTMLButtonElement>) => void}
   */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * Accessible name for the trailing × button.
   *
   * @default "Remove"
   * @type {string}
   */
  removeLabel?: string;
}

export const Chip = forwardRef<HTMLDivElement, ChipProps>(function Chip(
  {
    label,
    variant = "glass",
    size = "medium",
    selected = false,
    dot = false,
    icon,
    removable = false,
    disabled = false,
    onClick,
    onRemove,
    removeLabel = "Remove",
    className,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const isInteractive = !!onClick && !disabled;

  const classes = [
    "okryshto-component",
    "okryshto-chip",
    variant !== "glass" && `okryshto-chip--${variant}`,
    size !== "medium" && `okryshto-chip--${size}`,
    selected && "okryshto-chip--selected",
    isInteractive && "okryshto-chip--interactive",
    disabled && "okryshto-chip--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    onClick?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!isInteractive) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.(event);
    }
  };

  const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (disabled) return;
    onRemove?.(event);
  };

  return (
    <div
      ref={ref}
      className={classes}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick || onKeyDown ? handleKeyDown : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {!icon && dot && <span className="okryshto-chip__dot" aria-hidden="true" />}
      {icon && (
        <span className="okryshto-chip__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="okryshto-chip__label okryshto-truncation-ellipsis">{label}</span>
      {removable && (
        <button
          type="button"
          className="okryshto-chip__remove"
          onClick={handleRemove}
          disabled={disabled}
          aria-label={removeLabel}
        >
          <XIcon />
        </button>
      )}
    </div>
  );
});
