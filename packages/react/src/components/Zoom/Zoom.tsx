"use client";

import { cloneElement, forwardRef, useRef, type CSSProperties } from "react";
import { Transition } from "react-transition-group";
import "@okkly/design-system/components/Zoom/Zoom.scss";
import type { SharedTransitionProps, TransitionChildren, TransitionTimeout } from "../../types";
import { useForkRef } from "@okkly/react-hooks";
import {
  createCssTransition,
  DEFAULT_TIMEOUT,
  getReactElementRef,
  getTransitionProps,
  mergeClassNames,
  normalizedTransitionCallback,
  reflow,
} from "../../helpers";

export type ZoomTimeout = TransitionTimeout;

export interface ZoomProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default DEFAULT_TIMEOUT
   * @type {ZoomTimeout}
   */
  timeout?: ZoomTimeout;
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
   * @type {TransitionChildren}
   */
  children: TransitionChildren;
}

const styles: Record<string, CSSProperties> = {
  entering: { transform: "none" },
  entered: { transform: "none" },
};

export const Zoom = forwardRef<HTMLElement, ZoomProps>(function Zoom(
  {
    addEndListener,
    appear = true,
    children,
    className,
    easing,
    in: inProp = false,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    style,
    timeout = DEFAULT_TIMEOUT,
    mountOnEnter,
    unmountOnExit,
    ...other
  },
  ref,
) {
  const nodeRef = useRef<HTMLElement | null>(null);
  const handleRef = useForkRef(nodeRef, getReactElementRef(children), ref);

  const handleEntering = normalizedTransitionCallback(nodeRef, onEntering);

  const handleEnter = normalizedTransitionCallback(nodeRef, (node, isAppearing) => {
    reflow(node);
    const transitionProps = getTransitionProps({ style, timeout, easing }, { mode: "enter" });
    node.style.transition = createCssTransition("transform", transitionProps);
    onEnter?.(node, isAppearing ?? false);
  });

  const handleEntered = normalizedTransitionCallback(nodeRef, onEntered);

  const handleExiting = normalizedTransitionCallback(nodeRef, onExiting);

  const handleExit = normalizedTransitionCallback(nodeRef, (node) => {
    const transitionProps = getTransitionProps({ style, timeout, easing }, { mode: "exit" });
    node.style.transition = createCssTransition("transform", transitionProps);
    onExit?.(node);
  });

  const handleExited = normalizedTransitionCallback(nodeRef, onExited);

  const handleAddEndListener = (done: () => void) => {
    if (addEndListener && nodeRef.current) {
      addEndListener(nodeRef.current, done);
    }
  };

  return (
    <Transition
      appear={appear}
      in={inProp}
      nodeRef={nodeRef}
      onEnter={handleEnter}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      onExiting={handleExiting}
      addEndListener={handleAddEndListener}
      timeout={timeout}
      mountOnEnter={mountOnEnter}
      unmountOnExit={unmountOnExit}
      {...other}
    >
      {(state) =>
        cloneElement(children, {
          className: mergeClassNames("okkly-zoom", className, children.props.className),
          style: {
            transform: "scale(0)",
            visibility: state === "exited" && !inProp ? "hidden" : undefined,
            ...styles[state],
            ...style,
            ...children.props.style,
          },
          ref: handleRef,
        })
      }
    </Transition>
  );
});
