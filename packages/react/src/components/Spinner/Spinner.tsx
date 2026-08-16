import { forwardRef, type HTMLAttributes } from "react";
import "@okryshto/design-system/components/Spinner/Spinner.scss";

export type SpinnerSize = "small" | "medium" | "large";
export type SpinnerColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

/**
 * Props follow MUI's CircularProgress API (https://mui.com/material-ui/api/circular-progress/)
 * in spirit: `size`/`color`/`thickness` match the loading-indicator role. Deliberate
 * gaps: no `sx`/`classes`, no `disableShrink`/`variant` (always an indeterminate arc),
 * SVG ring with stroke-dash animation instead of MUI's two-circle technique.
 */
export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /**
   * Diameter preset.
   *
   * @default "medium"
   * @type {SpinnerSize}
   */
  size?: SpinnerSize;
  /**
   * Accent or feedback tone.
   *
   * @default "primary"
   * @type {SpinnerColor}
   */
  color?: SpinnerColor;
  /**
   * Ring stroke width in pixels at the preset's own size. Overrides the preset.
   *
   * @default undefined
   * @type {number}
   */
  thickness?: number;
}

const SIZE_RADIUS: Record<SpinnerSize, number> = {
  small: 10,
  medium: 14,
  large: 20,
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "medium", color = "primary", thickness, className, ...rest },
  forwardedRef,
) {
  const radius = SIZE_RADIUS[size];
  const stroke = thickness ?? (size === "small" ? 2.5 : size === "large" ? 4 : 3);
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const dashOffset = circumference * 0.75;

  const classes = [
    "okryshto-component",
    "okryshto-spinner",
    size !== "medium" && `okryshto-spinner--${size}`,
    color !== "primary" && `okryshto-spinner--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span ref={forwardedRef} role="status" aria-label="Loading" className={classes} {...rest}>
      <svg className="okryshto-spinner__svg" viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <circle
          className="okryshto-spinner__track"
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="okryshto-spinner__arc"
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={`${circumference * 0.25} ${circumference}`}
          strokeDashoffset={dashOffset}
        />
      </svg>
    </span>
  );
});
