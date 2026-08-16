import {
  forwardRef,
  useEffect,
  useRef,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import "@okryshto/design-system/components/Modal/Modal.scss";
import { useBodyScrollLock, useEscapeKey, useFocusTrap, useForkRef } from "@okryshto/react-hooks";
import type { OverlayCloseHandler } from "../../types";

export interface ModalSlotProps {
  /**
   * Backdrop.
   *
   * @default undefined
   * @type {HTMLAttributes<HTMLDivElement>}
   */
  backdrop?: HTMLAttributes<HTMLDivElement>;
}

/**
 * The low-level primitive the modal overlays are built from — Dialog today,
 * and anything else that needs "portal + backdrop + trapped focus" tomorrow.
 * Modal owns only that plumbing; it renders no surface of its own, so the
 * child supplies all visual chrome (see `Dialog` for the canonical consumer).
 *
 * Props follow MUI's Modal API (https://mui.com/material-ui/api/modal/) as
 * closely as this design allows: `open`/`onClose`/`container`/`keepMounted`/
 * `hideBackdrop`/`disablePortal`/`disableEscapeKeyDown`/`disableAutoFocus`/
 * `disableEnforceFocus`/`disableRestoreFocus`/`disableScrollLock`/`slotProps`
 * match name-for-name, and `onClose` receives `(event, reason)`. Deliberate
 * gaps: no `sx`/`classes`, no `slots` component-substitution (only
 * `slotProps`), no `closeAfterTransition` — with no built-in transition to
 * wait on, a consumer that animates keeps itself mounted (as `Drawer` does).
 */
export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
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
   * @type {OverlayCloseHandler}
   */
  onClose?: OverlayCloseHandler;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Node the portal mounts into. Defaults to `document.body`.
   *
   * @default undefined
   * @type {Element | null}
   */
  container?: Element | null;
  /**
   * Disable Portal.
   *
   * @default false
   * @type {boolean}
   */
  disablePortal?: boolean;
  /**
   * Disable Escape Key Down.
   *
   * @default false
   * @type {boolean}
   */
  disableEscapeKeyDown?: boolean;
  /**
   * Disable Auto Focus.
   *
   * @default false
   * @type {boolean}
   */
  disableAutoFocus?: boolean;
  /**
   * Disable Enforce Focus.
   *
   * @default false
   * @type {boolean}
   */
  disableEnforceFocus?: boolean;
  /**
   * Disable Restore Focus.
   *
   * @default false
   * @type {boolean}
   */
  disableRestoreFocus?: boolean;
  /**
   * Disable Scroll Lock.
   *
   * @default false
   * @type {boolean}
   */
  disableScrollLock?: boolean;
  /**
   * Hide Backdrop.
   *
   * @default false
   * @type {boolean}
   */
  hideBackdrop?: boolean;
  /**
   * Keep Mounted.
   *
   * @default false
   * @type {boolean}
   */
  keepMounted?: boolean;
  /**
   * Slot Props.
   *
   * @default undefined
   * @type {ModalSlotProps}
   */
  slotProps?: ModalSlotProps;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    children,
    container,
    disablePortal = false,
    disableEscapeKeyDown = false,
    disableAutoFocus = false,
    disableEnforceFocus = false,
    disableRestoreFocus = false,
    disableScrollLock = false,
    hideBackdrop = false,
    keepMounted = false,
    slotProps,
    className,
    ...rest
  },
  forwardedRef,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(rootRef, forwardedRef);
  // Captured on the way in rather than read on the way out: by the time the
  // modal closes, focus lives inside the subtree that is about to disappear.
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Declared ahead of `useFocusTrap` on purpose: effects run in declaration
  // order, so capturing any later would record the element the trap just
  // focused *inside* the modal instead of the trigger that opened it.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    return () => {
      if (disableRestoreFocus) return;
      restoreFocusRef.current?.focus?.();
    };
  }, [open, disableRestoreFocus]);

  useEscapeKey(
    (event) => onClose?.(event, "escapeKeyDown"),
    open && !disableEscapeKeyDown && Boolean(onClose),
  );
  useFocusTrap(rootRef, open && !disableEnforceFocus, { autoFocus: !disableAutoFocus });
  useBodyScrollLock(open && !disableScrollLock);

  const classes = [
    "okryshto-component",
    "okryshto-modal",
    !open && "okryshto-modal--hidden",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const {
    className: backdropClassName,
    onClick: backdropOnClick,
    ...backdropRest
  } = slotProps?.backdrop ?? {};

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    backdropOnClick?.(event);
    // A press that began inside the surface and merely *ended* on the backdrop
    // (drag-selecting text, releasing a slider) is not a dismissal gesture.
    if (event.target !== event.currentTarget) return;
    onClose?.(event, "backdropClick");
  };

  if (typeof document === "undefined") return null;
  if (!open && !keepMounted) return null;

  const content = (
    <div
      ref={handleRef}
      className={classes}
      role="presentation"
      aria-hidden={!open || undefined}
      {...rest}
    >
      {!hideBackdrop && (
        <div
          className={["okryshto-modal__backdrop", backdropClassName].filter(Boolean).join(" ")}
          aria-hidden="true"
          onClick={handleBackdropClick}
          {...backdropRest}
        />
      )}
      {children}
    </div>
  );

  if (disablePortal) return content;
  return createPortal(content, container ?? document.body);
});
