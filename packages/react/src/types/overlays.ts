import type { SyntheticEvent } from "react";

/**
 * Shared shapes for the dismissible overlays (Dialog, Drawer, Popover).
 *
 * These mirror MUI's close contract: a handler is told *what* dismissed the
 * overlay, so a caller can treat an accidental backdrop click differently from
 * a deliberate Escape — or refuse to close on one of them. See
 * https://mui.com/material-ui/api/dialog/#dialog-prop-onClose.
 */

/**
 * The event that dismissed the overlay.
 *
 * MUI types this as `{}` because it varies by source. Ours are concrete: a
 * backdrop click arrives as a React synthetic event, while Escape and
 * click-outside come from native document listeners.
 */
export type OverlayCloseEvent = SyntheticEvent | Event;

/**
 * Why the overlay closed.
 *
 * `backdropClick` covers both a click on a rendered backdrop and a click
 * outside a backdrop-less surface such as a Popover — from the caller's side
 * they are the same gesture, "the user clicked away".
 */
export type OverlayCloseReason = "backdropClick" | "escapeKeyDown";

export type OverlayCloseHandler<Reason extends string = OverlayCloseReason> = (
  event: OverlayCloseEvent,
  reason: Reason,
) => void;
