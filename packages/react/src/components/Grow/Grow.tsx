import { cloneElement, forwardRef, useRef, type CSSProperties } from "react";
import { Transition } from "react-transition-group";
import "@okryshto/design-system/components/Grow/Grow.scss";
import type {
  SharedTransitionProps,
  TransitionChildren,
  TransitionTimeoutWithAuto,
} from "../../types";
import { useForkRef } from "@okryshto/react-hooks";
import {
  createCssTransition,
  getAutoHeightDuration,
  getReactElementRef,
  getTransitionProps,
  mergeClassNames,
  normalizedTransitionCallback,
  reflow,
} from "../../helpers";

export type GrowTimeout = TransitionTimeoutWithAuto;

export interface GrowProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default "auto"
   * @type {GrowTimeout}
   */
  timeout?: GrowTimeout;
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

function getScale(value: number): string {
  return `scale(${value}, ${value ** 2})`;
}

const styles: Record<string, CSSProperties> = {
  entering: {
    opacity: 1,
    transform: getScale(1),
  },
  entered: {
    opacity: 1,
    transform: "none",
  },
};

export const Grow = forwardRef<HTMLElement, GrowProps>(function Grow(
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
    timeout = "auto",
    mountOnEnter,
    unmountOnExit,
    ...other
  },
  ref,
) {
  const autoTimeout = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodeRef = useRef<HTMLElement | null>(null);
  const handleRef = useForkRef(nodeRef, getReactElementRef(children), ref);

  const handleEntering = normalizedTransitionCallback(nodeRef, onEntering);

  const handleEnter = normalizedTransitionCallback(nodeRef, (node, isAppearing) => {
    reflow(node);

    const {
      duration: transitionDuration,
      delay,
      easing: transitionTimingFunction,
    } = getTransitionProps({ style, timeout, easing }, { mode: "enter" });

    let duration: number | string;
    if (timeout === "auto") {
      duration = getAutoHeightDuration(node.clientHeight);
      autoTimeout.current = duration;
    } else {
      duration = transitionDuration;
    }

    node.style.transition = [
      createCssTransition("opacity", { duration, delay }),
      createCssTransition("transform", {
        duration: typeof duration === "number" ? duration * 0.666 : duration,
        delay,
        easing: transitionTimingFunction,
      }),
    ].join(",");

    onEnter?.(node, isAppearing ?? false);
  });

  const handleEntered = normalizedTransitionCallback(nodeRef, onEntered);
  const handleExiting = normalizedTransitionCallback(nodeRef, onExiting);

  const handleExit = normalizedTransitionCallback(nodeRef, (node) => {
    const {
      duration: transitionDuration,
      delay,
      easing: transitionTimingFunction,
    } = getTransitionProps({ style, timeout, easing }, { mode: "exit" });

    let duration: number | string;
    if (timeout === "auto") {
      duration = getAutoHeightDuration(node.clientHeight);
      autoTimeout.current = duration;
    } else {
      duration = transitionDuration;
    }

    const numericDuration = typeof duration === "number" ? duration : 0;

    node.style.transition = [
      createCssTransition("opacity", { duration, delay }),
      createCssTransition("transform", {
        duration: typeof duration === "number" ? duration * 0.666 : duration,
        delay: delay || (typeof duration === "number" ? numericDuration * 0.333 : delay),
        easing: transitionTimingFunction,
      }),
    ].join(",");

    node.style.opacity = "0";
    node.style.transform = getScale(0.75);

    onExit?.(node);
  });

  const handleExited = normalizedTransitionCallback(nodeRef, onExited);

  const handleAddEndListener = (done: () => void) => {
    if (timeout === "auto") {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(done, autoTimeout.current || 0);
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
      nodeRef={nodeRef}
      onEnter={handleEnter}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      onExiting={handleExiting}
      mountOnEnter={mountOnEnter}
      unmountOnExit={unmountOnExit}
      {...timeoutProps}
      {...other}
    >
      {(state) =>
        cloneElement(children, {
          className: mergeClassNames("okryshto-grow", className, children.props.className),
          style: {
            opacity: 0,
            transform: getScale(0.75),
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
