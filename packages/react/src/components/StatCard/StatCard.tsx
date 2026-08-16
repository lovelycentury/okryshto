import type { HTMLAttributes, ReactNode } from "react";
import "@okryshto/design-system/components/StatCard/StatCard.scss";

export type StatCardSize = "sm" | "md" | "lg";
export type StatCardColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

export interface StatCardTrend {
  value: string;
  up: boolean;
}

/**
 * One key metric per card. No MUI equivalent — closest is a custom dashboard tile;
 * props mirror the figma StatCard spec (`value`, `label`, `trend`, accent tone).
 */
export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * What the metric measures.
   *
   * @default undefined
   * @type {string}
   */
  label: string;
  /**
   * The headline number or string.
   *
   * @default undefined
   * @type {ReactNode}
   */
  value: ReactNode;
  /**
   * Optional delta badge (green up / red down).
   *
   * @default undefined
   * @type {StatCardTrend}
   */
  trend?: StatCardTrend;
  /**
   * Optional glyph shown top-right.
   *
   * @default undefined
   * @type {ReactNode}
   */
  icon?: ReactNode;
  /**
   * Accent tone for highlighted cards.
   *
   * @default "primary"
   * @type {StatCardColor}
   */
  color?: StatCardColor;
  /**
   * When true, value picks up the accent tone and the card glows.
   *
   * @default false
   * @type {boolean}
   */
  accent?: boolean;
  /**
   * Supporting copy below the label.
   *
   * @default undefined
   * @type {string}
   */
  description?: string;
  /**
   * Card density.
   *
   * @default "md"
   * @type {StatCardSize}
   */
  size?: StatCardSize;
}

const TrendUpIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </svg>
);

const TrendDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
);

export function StatCard({
  label,
  value,
  trend,
  icon,
  color = "primary",
  accent = false,
  description,
  size = "md",
  className,
  ...rest
}: StatCardProps) {
  const classes = [
    "okryshto-component",
    "okryshto-stat-card",
    size !== "md" && `okryshto-stat-card--${size}`,
    accent && "okryshto-stat-card--accent",
    color !== "primary" && `okryshto-stat-card--color-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {icon && (
        <div className="okryshto-stat-card__header">
          <span className="okryshto-stat-card__icon">{icon}</span>
        </div>
      )}
      <div className="okryshto-stat-card__value-row">
        <p className="okryshto-stat-card__value">{value}</p>
        {trend && (
          // The direction lives in an arrow and a colour, and neither survives
          // being read aloud — so the badge carries the word itself. `role="img"`
          // is what makes the label replace the contents rather than sit beside
          // them.
          <span
            role="img"
            aria-label={`${trend.up ? "Up" : "Down"} ${trend.value}`}
            className={[
              "okryshto-stat-card__trend",
              trend.up ? "okryshto-stat-card__trend--up" : "okryshto-stat-card__trend--down",
            ].join(" ")}
          >
            {trend.up ? <TrendUpIcon /> : <TrendDownIcon />}
            {trend.value}
          </span>
        )}
      </div>
      <p className="okryshto-stat-card__label">{label}</p>
      {description && <p className="okryshto-stat-card__description">{description}</p>}
    </div>
  );
}
