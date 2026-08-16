import { useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "@okryshto/design-system/components/Snackbar/Snackbar.scss";
import { Alert, type AlertSeverity } from "../Alert/Alert";
import { useEscapeKey } from "@okryshto/react-hooks";

export type SnackbarAnchorVertical = "top" | "bottom";
export type SnackbarAnchorHorizontal = "left" | "center" | "right";

export interface SnackbarAnchorOrigin {
  vertical: SnackbarAnchorVertical;
  horizontal: SnackbarAnchorHorizontal;
}

/**
 * Props follow MUI's Snackbar API (https://mui.com/material-ui/api/snackbar/) as closely
 * as this design allows: `open`/`onClose`/`autoHideDuration`/`message`/`action`/
 * `anchorOrigin`/`children` match name-for-name. Deliberate gaps: no `sx`/`classes`,
 * adds `severity` to compose `Alert` styling, `onClose` takes no `reason` argument,
 * and there is no click-away dismissal — the timer, Escape, and the dismiss button
 * are the ways out. No queue: one snackbar at a time.
 */
export interface SnackbarProps {
  /**
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open: boolean;
  /**
   * On Close.
   *
   * @default undefined
   * @type {() => void}
   */
  onClose?: () => void;
  /**
   * Auto Hide Duration.
   *
   * @default 4000
   * @type {number}
   */
  autoHideDuration?: number;
  /**
   * Message.
   *
   * @default undefined
   * @type {ReactNode}
   */
  message?: ReactNode;
  /**
   * Action.
   *
   * @default undefined
   * @type {ReactNode}
   */
  action?: ReactNode;
  /**
   * Anchor Origin.
   *
   * @default DEFAULT_ANCHOR
   * @type {SnackbarAnchorOrigin}
   */
  anchorOrigin?: SnackbarAnchorOrigin;
  /**
   * Severity.
   *
   * @default "info"
   * @type {AlertSeverity}
   */
  severity?: AlertSeverity;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

const DEFAULT_ANCHOR: SnackbarAnchorOrigin = { vertical: "bottom", horizontal: "center" };

export function Snackbar({
  open,
  onClose,
  autoHideDuration = 4000,
  message,
  action,
  anchorOrigin = DEFAULT_ANCHOR,
  severity = "info",
  children,
  className,
}: SnackbarProps) {
  // Escape, the timer, and the dismiss button close it — but not a click
  // elsewhere on the page. A snackbar is non-modal: the user is meant to carry on
  // working, and tearing the message away on their next click takes the `action`
  // with it.
  useEscapeKey(() => onClose?.(), open && Boolean(onClose));

  useEffect(() => {
    if (!open || !onClose || autoHideDuration <= 0) return;
    const timer = setTimeout(onClose, autoHideDuration);
    return () => clearTimeout(timer);
  }, [autoHideDuration, onClose, open]);

  const handleClose = useCallback(() => onClose?.(), [onClose]);

  const classes = [
    "okryshto-component",
    "okryshto-snackbar",
    open && "okryshto-snackbar--open",
    `okryshto-snackbar--anchor-${anchorOrigin.vertical}-${anchorOrigin.horizontal}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = children ?? message;

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={classes} role="presentation">
      <div className="okryshto-snackbar__surface">
        {content ? (
          typeof content === "string" || typeof content === "number" ? (
            <Alert severity={severity} action={action} onClose={onClose ? handleClose : undefined}>
              {content}
            </Alert>
          ) : (
            content
          )
        ) : (
          action && <span className="okryshto-snackbar__message">{action}</span>
        )}
      </div>
    </div>,
    document.body,
  );
}
