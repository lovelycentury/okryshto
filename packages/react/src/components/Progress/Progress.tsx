import { forwardRef, type HTMLAttributes } from "react";
import "@okryshto/design-system/components/Progress/Progress.scss";

export type ProgressVariant = "determinate" | "indeterminate";
export type ProgressType = "linear" | "circular";
export type ProgressSize = "small" | "medium" | "large";
export type ProgressColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

/**
 * Props follow MUI's LinearProgress / CircularProgress APIs
 * (https://mui.com/material-ui/api/linear-progress/) as closely as this design allows:
 * `value` (0–100), `variant` (`determinate`|`indeterminate`), `color`, and `size` match
 * name-for-name. Deliberate gaps: no `sx`/`classes`, `type` selects linear vs circular
 * (MUI splits these into two components), circular shows an optional percentage label.
 */
export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /**
   * Progress value, 0–100. Ignored when `variant="indeterminate"`.
   *
   * @default 0
   * @type {number}
   */
  value?: number;
  /**
   * Known vs unknown duration.
   *
   * @default "determinate"
   * @type {ProgressVariant}
   */
  variant?: ProgressVariant;
  /**
   * Linear bar or circular ring.
   *
   * @default "linear"
   * @type {ProgressType}
   */
  type?: ProgressType;
  /**
   * Accent or feedback tone.
   *
   * @default "primary"
   * @type {ProgressColor}
   */
  color?: ProgressColor;
  /**
   * Track / ring thickness preset.
   *
   * @default "medium"
   * @type {ProgressSize}
   */
  size?: ProgressSize;
  /**
   * Show percentage label inside circular progress.
   *
   * @default false
   * @type {boolean}
   */
  showLabel?: boolean;
}

function clampValue(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value = 0,
    variant = "determinate",
    type = "linear",
    color = "primary",
    size = "medium",
    showLabel = false,
    className,
    ...rest
  },
  forwardedRef,
) {
  const clamped = clampValue(value);
  const isIndeterminate = variant === "indeterminate";

  const classes = [
    "okryshto-component",
    "okryshto-progress",
    `okryshto-progress--${type}`,
    isIndeterminate && "okryshto-progress--indeterminate",
    size !== "medium" && `okryshto-progress--${size}`,
    color !== "primary" && `okryshto-progress--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (type === "circular") {
    const diameter = size === "small" ? 40 : size === "large" ? 72 : 56;
    const stroke = size === "small" ? 4 : size === "large" ? 6 : 5;
    const radius = diameter / 2 - stroke / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = isIndeterminate
      ? circumference * 0.75
      : circumference - (clamped / 100) * circumference;

    return (
      <div
        ref={forwardedRef}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={classes}
        {...rest}
      >
        <div className="okryshto-progress__circular">
          <svg className="okryshto-progress__svg" viewBox={`0 0 ${diameter} ${diameter}`}>
            <circle
              className="okryshto-progress__circle-track"
              cx={diameter / 2}
              cy={diameter / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
            />
            <circle
              className="okryshto-progress__circle-bar"
              cx={diameter / 2}
              cy={diameter / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          {showLabel && !isIndeterminate && (
            <span className="okryshto-progress__label">{Math.round(clamped)}%</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={forwardedRef}
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={classes}
      {...rest}
    >
      <div className="okryshto-progress__track">
        {!isIndeterminate && (
          <div className="okryshto-progress__bar" style={{ width: `${clamped}%` }} />
        )}
        {isIndeterminate && <div className="okryshto-progress__bar" />}
      </div>
    </div>
  );
});
