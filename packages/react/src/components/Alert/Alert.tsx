"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { iconX } from "@okryshto/icons";
import "@okryshto/design-system/components/Alert/Alert.scss";
import { SeverityIcon, type SeverityIconSeverity } from "../SeverityIcon/SeverityIcon";

export type AlertSeverity = "success" | "info" | "warning" | "danger" | "dante";
export type AlertVariant = "standard" | "outlined" | "filled";

const SEVERITY_ICON_MAP: Record<AlertSeverity, SeverityIconSeverity> = {
  success: "success",
  info: "primary",
  warning: "warning",
  danger: "danger",
  dante: "primary",
};

/**
 * Props follow MUI's Alert API (https://mui.com/material-ui/api/alert/) as closely as
 * this design allows: `severity`/`variant`/`title`/`children`/`onClose`/`icon`/`action`
 * match name-for-name. Deliberate gaps: no `sx`/`classes`, `variant` uses
 * `"standard"|"outlined"|"filled"` (soft surface / outline / tinted fill — MUI's
 * `"standard"` maps to our raised surface). Adds `"dante"` severity for announcements.
 */
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Semantic tone — drives icon and accent colours.
   *
   * @default "info"
   * @type {AlertSeverity}
   */
  severity?: AlertSeverity;
  /**
   * Surface treatment.
   *
   * @default "standard"
   * @type {AlertVariant}
   */
  variant?: AlertVariant;
  /**
   * Bold headline above the message.
   *
   * @default undefined
   * @type {ReactNode}
   */
  title?: ReactNode;
  /**
   * Body message.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
  /**
   * When set, renders a dismiss control.
   *
   * @default undefined
   * @type {() => void}
   */
  onClose?: () => void;
  /**
   * Override the built-in severity icon.
   *
   * @default undefined
   * @type {ReactNode | false}
   */
  icon?: ReactNode | false;
  /**
   * Trailing action slot (e.g. undo button).
   *
   * @default undefined
   * @type {ReactNode}
   */
  action?: ReactNode;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    severity = "info",
    variant = "standard",
    title,
    children,
    onClose,
    icon,
    action,
    className,
    ...rest
  },
  forwardedRef,
) {
  const showIcon = icon !== false;
  const iconSeverity = SEVERITY_ICON_MAP[severity];

  const classes = [
    "okryshto-component",
    "okryshto-alert",
    severity !== "info" && `okryshto-alert--${severity}`,
    variant === "outlined" && "okryshto-alert--outlined",
    variant === "filled" && "okryshto-alert--filled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={forwardedRef} role="alert" className={classes} {...rest}>
      {showIcon && (
        <span className="okryshto-alert__icon">
          {icon ?? <SeverityIcon severity={iconSeverity} size="small" shape="rounded" />}
        </span>
      )}
      <div className="okryshto-alert__content">
        {title && <p className="okryshto-alert__title">{title}</p>}
        {children && <p className="okryshto-alert__message">{children}</p>}
      </div>
      {action && <span className="okryshto-alert__action">{action}</span>}
      {onClose && (
        <button
          type="button"
          className="okryshto-alert__close"
          aria-label="Close"
          onClick={onClose}
        >
          <span dangerouslySetInnerHTML={{ __html: iconX }} />
        </button>
      )}
    </div>
  );
});
