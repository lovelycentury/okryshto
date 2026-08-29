"use client";

import { cloneElement, forwardRef, useRef, type CSSProperties } from "react";
import { Transition } from "react-transition-group";
import "@okryshto/design-system/components/Fade/Fade.scss";
import type { SharedTransitionProps, TransitionChildren, TransitionTimeout } from "../../types";
import { useForkRef } from "@okryshto/react-hooks";
import {
  createCssTransition,
  DEFAULT_TIMEOUT,
  getReactElementRef,
  getTransitionProps,
  mergeClassNames,
  normalizedTransitionCallback,
  reflow,
} from "../../helpers";

export type FadeTimeout = TransitionTimeout;

export interface FadeProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default DEFAULT_TIMEOUT
   * @type {FadeTimeout}
   */
  timeout?: FadeTimeout;
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
  entering: { opacity: 1 },
  entered: { opacity: 1 },
};

export const Fade = forwardRef<HTMLElement, FadeProps>(function Fade(
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
    node.style.transition = createCssTransition("opacity", transitionProps);
    onEnter?.(node, isAppearing ?? false);
  });

  const handleEntered = normalizedTransitionCallback(nodeRef, onEntered);

  const handleExiting = normalizedTransitionCallback(nodeRef, onExiting);

  const handleExit = normalizedTransitionCallback(nodeRef, (node) => {
    const transitionProps = getTransitionProps({ style, timeout, easing }, { mode: "exit" });
    node.style.transition = createCssTransition("opacity", transitionProps);
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
          className: mergeClassNames("okryshto-fade", className, children.props.className),
          style: {
            opacity: 0,
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
