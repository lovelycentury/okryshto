"use client";

import { forwardRef, useRef, type CSSProperties, type ReactNode } from "react";
import { Transition } from "react-transition-group";
import "@okryshto/design-system/components/Collapse/Collapse.scss";
import type { SharedTransitionProps, TransitionTimeoutWithAuto } from "../../types";
import { useForkRef } from "@okryshto/react-hooks";
import {
  DURATION_STANDARD,
  getAutoHeightDuration,
  getTransitionProps,
  mergeClassNames,
  normalizedTransitionCallback,
  reflow,
} from "../../helpers";

export type CollapseTimeout = TransitionTimeoutWithAuto;
export type CollapseOrientation = "vertical" | "horizontal";

export interface CollapseProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default DURATION_STANDARD
   * @type {CollapseTimeout}
   */
  timeout?: CollapseTimeout;
  /**
   * Orientation.
   *
   * @default "vertical"
   * @type {CollapseOrientation}
   */
  orientation?: CollapseOrientation;
  /**
   * Width (horizontal) or height (vertical) when collapsed.
   *
   * @default "0px"
   * @type {number | string}
   */
  collapsedSize?: number | string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
}

export const Collapse = forwardRef<HTMLDivElement, CollapseProps>(function Collapse(
  {
    addEndListener,
    appear = true,
    children,
    className,
    collapsedSize: collapsedSizeProp = "0px",
    easing,
    in: inProp = false,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    orientation = "vertical",
    style,
    timeout = DURATION_STANDARD,
    mountOnEnter,
    unmountOnExit,
    ...other
  },
  ref,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const autoTransitionDuration = useRef(0);
  const collapsedSize =
    typeof collapsedSizeProp === "number" ? `${collapsedSizeProp}px` : collapsedSizeProp;
  const isHorizontal = orientation === "horizontal";
  const size = isHorizontal ? "width" : "height";

  const nodeRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useForkRef(ref, nodeRef);

  const getWrapperSize = () =>
    wrapperRef.current ? wrapperRef.current[isHorizontal ? "clientWidth" : "clientHeight"] : 0;

  const handleEnter = normalizedTransitionCallback(nodeRef, (node, isAppearing) => {
    if (wrapperRef.current && isHorizontal) {
      wrapperRef.current.style.position = "absolute";
    }
    node.style[size] = collapsedSize;
    onEnter?.(node, isAppearing ?? false);
  });

  const handleEntering = normalizedTransitionCallback(nodeRef, (node, isAppearing) => {
    const wrapperSize = getWrapperSize();

    if (wrapperRef.current && isHorizontal) {
      wrapperRef.current.style.position = "";
    }

    const { duration: transitionDuration, easing: transitionTimingFunction } = getTransitionProps(
      { style, timeout, easing },
      { mode: "enter" },
    );

    if (timeout === "auto") {
      const duration = getAutoHeightDuration(wrapperSize);
      node.style.transitionDuration = `${duration}ms`;
      autoTransitionDuration.current = duration;
    } else {
      node.style.transitionDuration =
        typeof transitionDuration === "string" ? transitionDuration : `${transitionDuration}ms`;
    }

    node.style[size] = `${wrapperSize}px`;
    if (transitionTimingFunction) {
      node.style.transitionTimingFunction = transitionTimingFunction;
    }

    onEntering?.(node, isAppearing ?? false);
  });

  const handleEntered = normalizedTransitionCallback(nodeRef, (node, isAppearing) => {
    node.style[size] = "auto";
    onEntered?.(node, isAppearing ?? false);
  });

  const handleExit = normalizedTransitionCallback(nodeRef, (node) => {
    // Lock current size in px before leaving `height/width: auto` (via --entered).
    node.style[size] = `${getWrapperSize()}px`;
    onExit?.(node);
  });

  const handleExited = normalizedTransitionCallback(nodeRef, onExited);

  const handleExiting = normalizedTransitionCallback(nodeRef, (node) => {
    // Ensure the browser commits the px size from onExit before animating down.
    reflow(node);

    const wrapperSize = getWrapperSize();
    const { duration: transitionDuration, easing: transitionTimingFunction } = getTransitionProps(
      { style, timeout, easing },
      { mode: "exit" },
    );

    if (timeout === "auto") {
      const duration = getAutoHeightDuration(wrapperSize);
      node.style.transitionDuration = `${duration}ms`;
      autoTransitionDuration.current = duration;
    } else {
      node.style.transitionDuration =
        typeof transitionDuration === "string" ? transitionDuration : `${transitionDuration}ms`;
    }

    node.style[size] = collapsedSize;
    if (transitionTimingFunction) {
      node.style.transitionTimingFunction = transitionTimingFunction;
    }

    onExiting?.(node);
  });

  const handleAddEndListener = (done: () => void) => {
    if (timeout === "auto") {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(done, autoTransitionDuration.current || 0);
    }
    if (addEndListener && nodeRef.current) {
      addEndListener(nodeRef.current, done);
    }
  };

  const timeoutProps =
    timeout === "auto"
      ? { addEndListener: handleAddEndListener }
      : { timeout, addEndListener: handleAddEndListener };

  return (
    <Transition
      appear={appear}
      in={inProp}
      onEnter={handleEnter}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      onExiting={handleExiting}
      nodeRef={nodeRef}
      mountOnEnter={mountOnEnter}
      unmountOnExit={unmountOnExit}
      {...timeoutProps}
      {...other}
    >
      {(state) => {
        const hidden = state === "exited" && !inProp && collapsedSize === "0px";
        const entered = state === "entered";

        // Size is driven by CSS (0 / auto) + imperative node.style during enter/exit.
        // Do not put height/width on the React style prop — that overwrites the px
        // lock from onExit and collapses instantly.
        const rootStyle: CSSProperties = {
          ...(isHorizontal ? { minWidth: collapsedSize } : { minHeight: collapsedSize }),
          ...style,
        };

        return (
          <div
            ref={handleRef}
            className={mergeClassNames(
              "okryshto-collapse",
              `okryshto-collapse--${orientation}`,
              entered && "okryshto-collapse--entered",
              hidden && "okryshto-collapse--hidden",
              className,
            )}
            style={rootStyle}
          >
            <div ref={wrapperRef} className="okryshto-collapse__wrapper">
              <div className="okryshto-collapse__wrapper-inner">{children}</div>
            </div>
          </div>
        );
      }}
    </Transition>
  );
});
