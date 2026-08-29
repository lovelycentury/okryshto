"use client";

import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import "@okryshto/design-system/components/Tooltip/Tooltip.scss";
import { useForkRef } from "@okryshto/react-hooks";
import { mergeClassNames } from "../../helpers";
import { Grow } from "../Grow/Grow";
import { Popper, type PopperPlacement } from "../Popper/Popper";
import type { TransitionTimeoutWithAuto } from "../../types";

export type TooltipPlacement = PopperPlacement;

type TooltipTriggerProps = {
  /**
   * Ref.
   *
   * @default undefined
   * @type {Ref<HTMLElement>}
   */
  ref?: Ref<HTMLElement>;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  "aria-describedby"?: string;
  /**
   * On Mouse Enter.
   *
   * @default undefined
   * @type {(event: MouseEvent) => void}
   */
  onMouseEnter?: (event: MouseEvent) => void;
  /**
   * On Mouse Leave.
   *
   * @default undefined
   * @type {(event: MouseEvent) => void}
   */
  onMouseLeave?: (event: MouseEvent) => void;
  /**
   * On Focus.
   *
   * @default undefined
   * @type {(event: FocusEvent) => void}
   */
  onFocus?: (event: FocusEvent) => void;
  /**
   * On Blur.
   *
   * @default undefined
   * @type {(event: FocusEvent) => void}
   */
  onBlur?: (event: FocusEvent) => void;
};

/**
 * Props follow MUI's Tooltip API (https://mui.com/material-ui/api/tooltip/) as closely
 * as this design allows: `title`/`children`/`placement`/`open`/`defaultOpen`/`onOpen`/
 * `onClose`/`enterDelay`/`leaveDelay`/`arrow`/`disableHoverListener`/
 * `disableFocusListener` match name-for-name. `interactive` is MUI's
 * `disableInteractive` with the sense flipped — same default behaviour, and see
 * the prop for why. Deliberate gaps: no `sx`/`classes`/`slots`, no
 * `describeChild`, no `followCursor`, no `enterTouchDelay`.
 *
 * Built on Popper, like MUI's. That is what makes it flip near a viewport edge,
 * escape an `overflow: hidden` ancestor, and put its arrow on the side it
 * actually ended up on rather than the side that was asked for.
 */
export interface TooltipProps {
  /**
   * Tooltip content (MUI `title`). An empty title renders nothing, as in MUI.
   *
   * @default undefined
   * @type {ReactNode}
   */
  title: ReactNode;
  /**
   * Element that triggers the tooltip.
   *
   * @default undefined
   * @type {ReactElement<TooltipTriggerProps>}
   */
  children: ReactElement<TooltipTriggerProps>;
  /**
   * Placement.
   *
   * @default "top"
   * @type {TooltipPlacement}
   */
  placement?: TooltipPlacement;
  /**
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open?: boolean;
  /**
   * Default Open.
   *
   * @default false
   * @type {boolean}
   */
  defaultOpen?: boolean;
  /**
   * On Open.
   *
   * @default undefined
   * @type {() => void}
   */
  onOpen?: () => void;
  /**
   * On Close.
   *
   * @default undefined
   * @type {() => void}
   */
  onClose?: () => void;
  /**
   * Enter Delay.
   *
   * @default 200
   * @type {number}
   */
  enterDelay?: number;
  /**
   * Leave Delay.
   *
   * @default 0
   * @type {number}
   */
  leaveDelay?: number;
  /**
   * Arrow.
   *
   * @default true
   * @type {boolean}
   */
  arrow?: boolean;
  /**
   * Disable Hover Listener.
   *
   * @default false
   * @type {boolean}
   */
  disableHoverListener?: boolean;
  /**
   * Disable Focus Listener.
   *
   * @default false
   * @type {boolean}
   */
  disableFocusListener?: boolean;
  /**
   * Keep the tooltip open while the pointer is inside it, so its content can be read at leisure — or selected, or followed to a link. MUI spells this `disableInteractive` and has been interactive-by-default since v5; the sense is inverted here, but the default behaviour matches.
   *
   * @default true
   * @type {boolean}
   */
  interactive?: boolean;
  /**
   * Force the tooltip to *describe* the trigger rather than name it, even when the
   * trigger has no name of its own. Off by default: see the note on `trigger`
   * below for why the choice is normally made automatically.
   *
   * @default false
   * @type {boolean}
   */
  describeChild?: boolean;
  /**
   * Grow timeout; `'auto'` like MUI.
   *
   * @default "auto"
   * @type {TransitionTimeoutWithAuto}
   */
  transitionDuration?: TransitionTimeoutWithAuto;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

/** Keeps the arrow clear of a rounded corner. */
const ARROW_PADDING = 8;

/**
 * Grace period for reaching an interactive tooltip.
 *
 * The bubble is offset a few pixels off its anchor, and that gap belongs to
 * neither of them — leaving the trigger to walk into the tooltip still fires
 * `mouseleave`. With the default `leaveDelay` of 0 the close timer fires on the
 * next tick, long before a pointer can cross, so an interactive tooltip would
 * be unreachable. This is the floor that makes the trip possible; entering the
 * bubble cancels the timer.
 */
const INTERACTIVE_LEAVE_DELAY = 120;

export function Tooltip({
  title,
  children,
  placement = "top",
  open,
  defaultOpen = false,
  onOpen,
  onClose,
  enterDelay = 200,
  leaveDelay = 0,
  arrow = true,
  disableHoverListener = false,
  disableFocusListener = false,
  interactive = true,
  describeChild = false,
  transitionDuration = "auto",
  className,
}: TooltipProps) {
  const tooltipId = useId();
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [arrowEl, setArrowEl] = useState<HTMLElement | null>(null);

  const isControlled = open !== undefined;
  const isOpen = (isControlled ? open : internalOpen) && Boolean(title);

  const childRef = (children as { ref?: Ref<HTMLElement> }).ref;
  const handleTriggerRef = useForkRef(setAnchorEl, childRef);

  const clearTimers = useCallback(() => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      if (next) onOpen?.();
      else onClose?.();
    },
    [isControlled, onClose, onOpen],
  );

  const scheduleOpen = useCallback(() => {
    clearTimers();
    enterTimer.current = setTimeout(() => setOpen(true), enterDelay);
  }, [clearTimers, enterDelay, setOpen]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    const delay = interactive ? Math.max(leaveDelay, INTERACTIVE_LEAVE_DELAY) : leaveDelay;
    leaveTimer.current = setTimeout(() => setOpen(false), delay);
  }, [clearTimers, interactive, leaveDelay, setOpen]);

  useEffect(() => clearTimers, [clearTimers]);

  const childAriaLabel = (children.props as { "aria-label"?: string })["aria-label"];
  // A description is not a name. An icon button whose only label is its tooltip was
  // announced as a bare "button", because `aria-describedby` is all this used to
  // contribute — and only while open at that. So: when the trigger has a name of its
  // own, the tooltip stays a description; when it has none, the tooltip becomes the
  // name, permanently rather than on hover.
  //
  // MUI takes the blunter route and labels the child whenever `title` is a string,
  // overwriting whatever the button already said. That breaks "label in name" for
  // anyone driving the page by voice — they read the visible word and say it, and it
  // is not the accessible name. Hence the check rather than the blanket rule.
  //
  // `anchorEl` is null on the first render, so a text trigger is briefly treated as
  // nameless; the ref lands in the same commit and the tree is correct before
  // anything can read it.
  const triggerHasOwnName = Boolean(childAriaLabel) || Boolean(anchorEl?.textContent?.trim());
  const namingProps: Record<string, string | undefined> =
    describeChild || triggerHasOwnName
      ? { "aria-describedby": isOpen ? tooltipId : undefined }
      : typeof title === "string"
        ? { "aria-label": title }
        : { "aria-labelledby": isOpen ? tooltipId : undefined };

  const trigger = cloneElement(children, {
    ref: handleTriggerRef,
    className: mergeClassNames("okryshto-tooltip__trigger", children.props.className),
    ...namingProps,
    onMouseEnter: (event: MouseEvent) => {
      if (!disableHoverListener) scheduleOpen();
      children.props.onMouseEnter?.(event);
    },
    onMouseLeave: (event: MouseEvent) => {
      if (!disableHoverListener) scheduleClose();
      children.props.onMouseLeave?.(event);
    },
    onFocus: (event: FocusEvent) => {
      if (!disableFocusListener) setOpen(true);
      children.props.onFocus?.(event);
    },
    onBlur: (event: FocusEvent) => {
      if (!disableFocusListener) setOpen(false);
      children.props.onBlur?.(event);
    },
  });

  return (
    <>
      {trigger}
      <Popper
        open={isOpen}
        anchorEl={anchorEl}
        placement={placement}
        transition
        role="presentation"
        className={mergeClassNames(
          "okryshto-tooltip",
          interactive && "okryshto-tooltip--interactive",
          className,
        )}
        modifiers={[
          { name: "offset", options: { offset: [0, arrow ? 10 : 6] } },
          ...(arrow && arrowEl
            ? [{ name: "arrow", options: { element: arrowEl, padding: ARROW_PADDING } }]
            : []),
        ]}
        // Arriving in the tooltip cancels the pending close; leaving it starts
        // a new one. Without the first of these, a tooltip you reach for
        // vanishes exactly as you get there.
        onMouseEnter={interactive ? clearTimers : undefined}
        onMouseLeave={interactive ? scheduleClose : undefined}
      >
        {({ TransitionProps, placement: resolvedPlacement }) => (
          <Grow {...TransitionProps} timeout={transitionDuration}>
            <div
              className={mergeClassNames(
                "okryshto-tooltip__popup",
                `okryshto-tooltip__popup--${resolvedPlacement.split("-")[0]}`,
                !arrow && "okryshto-tooltip__popup--no-arrow",
              )}
              // `data-popper-placement` is what the arrow's CSS keys off, so it
              // follows the side the tooltip actually landed on after a flip,
              // not the side originally requested.
              data-popper-placement={resolvedPlacement}
            >
              <span className="okryshto-tooltip__bubble" role="tooltip" id={tooltipId}>
                {title}
              </span>
              {arrow && (
                <span
                  className="okryshto-tooltip__arrow"
                  ref={setArrowEl}
                  data-popper-arrow=""
                  aria-hidden="true"
                />
              )}
            </div>
          </Grow>
        )}
      </Popper>
    </>
  );
}
