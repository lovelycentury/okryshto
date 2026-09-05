"use client";

import { forwardRef, useMemo, useRef, type HTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { VirtualElement } from "@popperjs/core";
import { useClickOutside, useEscapeKey } from "@okkly/react-hooks";
import "@okkly/design-system/components/Popover/Popover.scss";
import { mergeClassNames } from "../../helpers";
import type { OverlayCloseHandler, TransitionTimeoutWithAuto } from "../../types";
import { Grow } from "../Grow/Grow";
import { Popper, type PopperAnchorEl, type PopperPlacement } from "../Popper/Popper";

export interface PopoverAnchorPosition {
  top: number;
  left: number;
}

/**
 * Props follow MUI's Popover API (https://mui.com/material-ui/api/popover/) as closely
 * as this design allows: `open`/`onClose`/`anchorEl`/`anchorPosition`/`placement`/
 * `children` match name-for-name, and `onClose` receives `(event, reason)`. Opens with
 * Grow (MUI Menu/Popover transition pattern). Deliberate gaps: no `sx`/`classes`/`slots`,
 * no Modal backdrop/scroll-lock, no `transformOrigin`/`marginThreshold` paper math
 * (Popper.js handles positioning).
 *
 * There is no backdrop to click, so a click anywhere outside the paper reports
 * `backdropClick` — from the caller's side it is the same "clicked away" gesture.
 */
export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onClose"> {
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
   * Anchor El.
   *
   * @default undefined
   * @type {HTMLElement | null}
   */
  anchorEl?: HTMLElement | null;
  /**
   * Anchor Position.
   *
   * @default undefined
   * @type {PopoverAnchorPosition}
   */
  anchorPosition?: PopoverAnchorPosition;
  /**
   * Placement.
   *
   * @default "bottom"
   * @type {PopperPlacement}
   */
  placement?: PopperPlacement;
  /**
   * Grow timeout; defaults to `'auto'` like MUI.
   *
   * @default "auto"
   * @type {TransitionTimeoutWithAuto}
   */
  transitionDuration?: TransitionTimeoutWithAuto;
  /**
   * Disable Portal.
   *
   * @default false
   * @type {boolean}
   */
  disablePortal?: boolean;
  /**
   * MUI's Popover is a Modal: it always lays an invisible backdrop over the page, so a click anywhere dismisses it and never reaches what is beneath. Here that is opt-in, and the default is inverted from MUI's on purpose — this Popover is the surface behind Select, Autocomplete and the date fields, and a modal backdrop would swallow the very interactions those rely on. Pass `false` for the MUI behaviour on a standalone popover.
   *
   * @default true
   * @type {boolean}
   */
  hideBackdrop?: boolean;
  /**
   * Stretch the paper to the anchor's width — what a select-style panel wants.
   *
   * @default false
   * @type {boolean}
   */
  matchAnchorWidth?: boolean;
  /**
   * Floor for the paper's width. Useful with `matchAnchorWidth` on narrow anchors.
   *
   * @default undefined
   * @type {number | string}
   */
  minWidth?: number | string;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Extra class on the paper surface.
   *
   * @default undefined
   * @type {string}
   */
  paperClassName?: string;
}

function createVirtualAnchor(position: PopoverAnchorPosition): VirtualElement {
  return {
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      top: position.top,
      left: position.left,
      bottom: position.top,
      right: position.left,
      x: position.left,
      y: position.top,
      toJSON: () => ({}),
    }),
  };
}

const OFFSET_MODIFIER = {
  name: "offset" as const,
  options: { offset: [0, 8] },
};

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    open,
    onClose,
    anchorEl,
    anchorPosition,
    placement = "bottom",
    transitionDuration = "auto",
    disablePortal = false,
    hideBackdrop = true,
    matchAnchorWidth = false,
    minWidth,
    children,
    className,
    paperClassName,
    ...rest
  },
  forwardedRef,
) {
  const paperRef = useRef<HTMLDivElement | null>(null);

  const resolvedAnchor = useMemo<PopperAnchorEl | undefined>(() => {
    if (anchorEl) return anchorEl;
    if (anchorPosition) return createVirtualAnchor(anchorPosition);
    return undefined;
  }, [anchorEl, anchorPosition]);

  useEscapeKey((event) => onClose?.(event, "escapeKeyDown"), open && Boolean(onClose));

  useClickOutside(
    paperRef,
    (event) => {
      // The anchor is not "outside". Click-outside listens on mousedown, which
      // fires before the anchor's own click, so without this a click on an open
      // popover's trigger closes it and the trigger's onClick immediately
      // toggles it back open — the popover appears frozen open. Letting the
      // anchor own its click makes the trigger a plain toggle again.
      if (anchorEl?.contains(event.target as Node)) return;
      onClose?.(event, "backdropClick");
    },
    open && Boolean(onClose) && hideBackdrop,
  );

  // In backdrop mode nothing under the popover is clickable, so the anchor
  // needs no special-casing: the click lands on the backdrop and dismisses.
  const backdrop =
    !hideBackdrop && open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="okkly-popover__backdrop"
            role="presentation"
            onClick={(event) => onClose?.(event, "backdropClick")}
          />,
          document.body,
        )
      : null;

  return (
    <>
      {backdrop}
      <Popper
        ref={forwardedRef}
        open={open}
        anchorEl={resolvedAnchor}
        placement={placement}
        transition
        disablePortal={disablePortal}
        matchAnchorWidth={matchAnchorWidth}
        minWidth={minWidth}
        modifiers={[OFFSET_MODIFIER]}
        className={mergeClassNames("okkly-popover", open && "okkly-popover--open", className)}
        role="presentation"
        {...rest}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            timeout={transitionDuration}
            style={{ transformOrigin: "center top" }}
          >
            <div ref={paperRef} className={mergeClassNames("okkly-popover__paper", paperClassName)}>
              {children}
            </div>
          </Grow>
        )}
      </Popper>
    </>
  );
});
