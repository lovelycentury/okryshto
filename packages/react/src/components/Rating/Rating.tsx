"use client";

import {
  forwardRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import "@okryshto/design-system/components/Rating/Rating.scss";

export type RatingSize = "small" | "medium" | "large";
export type RatingColor = "warning" | "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type RatingIcon = "star" | "heart";
export type RatingPrecision = 0.5 | 1;

const StarOutline = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
  >
    <path d="M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.54L12 17.77l-5.86 3.08 1.12-6.54-4.75-4.63 6.56-.95L12 2.5z" />
  </svg>
);

const StarFilled = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.54L12 17.77l-5.86 3.08 1.12-6.54-4.75-4.63 6.56-.95L12 2.5z" />
  </svg>
);

const HeartOutline = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
  >
    <path d="M12 21s-6.5-4.35-9-8.35C1.5 10.5 2.5 6.5 6 5.5c2-.6 4 .5 6 2.5 2-2 4-3.1 6-2.5 3.5 1 4.5 5 3 7.15C18.5 16.65 12 21 12 21z" />
  </svg>
);

const HeartFilled = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 21s-6.5-4.35-9-8.35C1.5 10.5 2.5 6.5 6 5.5c2-.6 4 .5 6 2.5 2-2 4-3.1 6-2.5 3.5 1 4.5 5 3 7.15C18.5 16.65 12 21 12 21z" />
  </svg>
);

function defaultGetLabelText(value: number): string {
  return `${value} Star${value !== 1 ? "s" : ""}`;
}

function starKind(displayValue: number, index: number): "full" | "half" | "empty" {
  const position = index + 1;
  if (displayValue >= position) return "full";
  if (displayValue >= position - 0.5) return "half";
  return "empty";
}

function valueFromPointer(
  event: MouseEvent<HTMLButtonElement>,
  index: number,
  precision: RatingPrecision,
): number {
  if (precision === 1) return index + 1;
  const rect = event.currentTarget.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  return ratio <= 0.5 ? index + 0.5 : index + 1;
}

/**
 * Props follow MUI's Rating API (https://mui.com/material-ui/api/rating/)
 * closely: `value`/`defaultValue`/`max`/`precision`/`size`/`readOnly`/
 * `disabled`/`onChange`/`name`/`getLabelText` match name-for-name.
 * Deliberate gaps: no `sx`/`classes`/`IconContainerComponent` (no CSS-in-JS
 * system). `color` uses okryshto tone names with gold (`warning`) as the default
 * instead of MUI's `primary`. `icon` accepts `"star"|"heart"` or a custom
 * `ReactNode` (filled state only — empty uses the same glyph muted). Built-in
 * `label` renders trailing summary text (not in MUI's Rating).
 */
export interface RatingProps {
  /**
   * Current score. `null` clears every star.
   *
   * @default undefined
   * @type {number | null}
   */
  value?: number | null;
  /**
   * Initial score (uncontrolled).
   *
   * @default null
   * @type {number | null}
   */
  defaultValue?: number | null;
  /**
   * Fires when the user picks a score. Pass `null` to clear (click active star).
   *
   * @default undefined
   * @type {(event: SyntheticEvent, value: number | null) => void}
   */
  onChange?: (event: SyntheticEvent, value: number | null) => void;
  /**
   * Number of glyphs (default 5).
   *
   * @default 5
   * @type {number}
   */
  max?: number;
  /**
   * Half-step increments (default 0.5).
   *
   * @default 0.5
   * @type {RatingPrecision}
   */
  precision?: RatingPrecision;
  /**
   * Glyph size.
   *
   * @default "medium"
   * @type {RatingSize}
   */
  size?: RatingSize;
  /**
   * Fill colour — default gold uses `--okryshto-feedback-warning`.
   *
   * @default "warning"
   * @type {RatingColor}
   */
  color?: RatingColor;
  /**
   * Built-in `"star"` / `"heart"` or a custom filled glyph.
   *
   * @default "star"
   * @type {RatingIcon | ReactNode}
   */
  icon?: RatingIcon | ReactNode;
  /**
   * Display-only — no hover or click.
   *
   * @default false
   * @type {boolean}
   */
  readOnly?: boolean;
  /**
   * Non-interactive.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Trailing summary (e.g. "4.8 · 128 reviews").
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Passed to each interactive star input for form grouping.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Accessible label per star button.
   *
   * @default defaultGetLabelText
   * @type {(value: number) => string}
   */
  getLabelText?: (value: number) => string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

export const Rating = forwardRef<HTMLSpanElement, RatingProps>(function Rating(
  {
    value,
    defaultValue = null,
    onChange,
    max = 5,
    precision = 0.5,
    size = "medium",
    color = "warning",
    icon = "star",
    readOnly = false,
    disabled = false,
    label,
    name,
    getLabelText = defaultGetLabelText,
    className,
  },
  forwardedRef,
) {
  const [internalValue, setInternalValue] = useState<number | null>(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const displayValue = hoverValue ?? currentValue ?? 0;

  const commit = (event: SyntheticEvent, next: number | null) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(event, next);
  };

  const handleItemClick = (event: MouseEvent<HTMLButtonElement>, index: number) => {
    if (readOnly || disabled) return;
    const next = valueFromPointer(event, index, precision);
    if (next === currentValue) commit(event, null);
    else commit(event, next);
  };

  const handleItemMove = (event: MouseEvent<HTMLButtonElement>, index: number) => {
    if (readOnly || disabled) return;
    setHoverValue(valueFromPointer(event, index, precision));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (readOnly || disabled) return;
    const step = precision;
    const base = currentValue ?? 0;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      commit(event, Math.min(max, base + step));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      commit(event, Math.max(0, base - step) || null);
    }
  };

  const renderBuiltInIcon = (kind: "full" | "half" | "empty", glyph: RatingIcon) => {
    const Outline = glyph === "heart" ? HeartOutline : StarOutline;
    const Filled = glyph === "heart" ? HeartFilled : StarFilled;

    if (kind === "full") {
      return (
        <span className="okryshto-rating__icon okryshto-rating__icon--full" aria-hidden="true">
          <Filled />
        </span>
      );
    }

    if (kind === "half") {
      return (
        <span className="okryshto-rating__icon okryshto-rating__icon--half" aria-hidden="true">
          <Outline />
          <span className="okryshto-rating__icon-fill">
            <Filled />
          </span>
        </span>
      );
    }

    return (
      <span className="okryshto-rating__icon" aria-hidden="true">
        <Outline />
      </span>
    );
  };

  const renderCustomIcon = (kind: "full" | "half" | "empty", customIcon: ReactNode) => {
    if (kind === "full") {
      return (
        <span className="okryshto-rating__icon okryshto-rating__icon--full" aria-hidden="true">
          {customIcon}
        </span>
      );
    }

    if (kind === "half") {
      return (
        <span className="okryshto-rating__icon okryshto-rating__icon--half" aria-hidden="true">
          {customIcon}
          <span className="okryshto-rating__icon-fill">{customIcon}</span>
        </span>
      );
    }

    return (
      <span className="okryshto-rating__icon" aria-hidden="true">
        {customIcon}
      </span>
    );
  };

  const isBuiltInGlyph = (glyph: RatingIcon | ReactNode): glyph is RatingIcon =>
    glyph === "star" || glyph === "heart";

  const renderIcon = (kind: "full" | "half" | "empty") => {
    if (isBuiltInGlyph(icon)) return renderBuiltInIcon(kind, icon);
    return renderCustomIcon(kind, icon);
  };

  const classes = [
    "okryshto-component",
    "okryshto-rating",
    color !== "warning" && `okryshto-rating--color-${color}`,
    size !== "medium" && `okryshto-rating--${size}`,
    readOnly && "okryshto-rating--read-only",
    disabled && "okryshto-rating--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const interactive = !readOnly && !disabled;

  return (
    <span
      ref={forwardedRef}
      className={classes}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? undefined : `${displayValue} of ${max}`}
      onMouseLeave={() => setHoverValue(null)}
    >
      <span className="okryshto-rating__stars">
        {Array.from({ length: max }, (_, index) => {
          const kind = starKind(displayValue, index);
          const itemValue = index + 1;

          if (!interactive) {
            return (
              <span key={index} className="okryshto-rating__item" aria-hidden="true">
                {renderIcon(kind)}
              </span>
            );
          }

          return (
            <button
              key={index}
              type="button"
              className="okryshto-rating__item"
              name={name}
              aria-label={getLabelText(itemValue)}
              onClick={(event) => handleItemClick(event, index)}
              onMouseMove={(event) => handleItemMove(event, index)}
              onKeyDown={(event) => handleKeyDown(event)}
            >
              {renderIcon(kind)}
            </button>
          );
        })}
      </span>
      {label && <span className="okryshto-rating__label">{label}</span>}
    </span>
  );
});
