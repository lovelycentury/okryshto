import { cloneElement, forwardRef, useCallback, useEffect, useRef } from "react";
import { Transition } from "react-transition-group";
import "@okryshto/design-system/components/Slide/Slide.scss";
import type {
  SharedTransitionProps,
  TransitionChildren,
  TransitionEasing,
  TransitionTimeout,
} from "../../types";
import { useForkRef } from "@okryshto/react-hooks";
import {
  createCssTransition,
  DEFAULT_TIMEOUT,
  EASING_EASE_OUT,
  EASING_SHARP,
  getReactElementRef,
  getTransitionProps,
  mergeClassNames,
  reflow,
} from "../../helpers";

export type SlideTimeout = TransitionTimeout;
export type SlideDirection = "left" | "right" | "up" | "down";

export interface SlideProps extends SharedTransitionProps {
  /**
   * Timeout.
   *
   * @default DEFAULT_TIMEOUT
   * @type {SlideTimeout}
   */
  timeout?: SlideTimeout;
  /**
   * Direction.
   *
   * @default "down"
   * @type {SlideDirection}
   */
  direction?: SlideDirection;
  /**
   * Element (or factory) that bounds the slide offset. Defaults to the viewport.
   *
   * @default undefined
   * @type {HTMLElement | (() => HTMLElement | null) | null}
   */
  container?: HTMLElement | (() => HTMLElement | null) | null;
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

const DEFAULT_EASING: TransitionEasing = {
  enter: EASING_EASE_OUT,
  exit: EASING_SHARP,
};

function resolveContainer(containerProp: SlideProps["container"]): HTMLElement | null | undefined {
  return typeof containerProp === "function" ? containerProp() : containerProp;
}

function getTranslateValue(
  direction: SlideDirection,
  node: HTMLElement,
  resolvedContainer: HTMLElement | null | undefined,
): string {
  const rect = node.getBoundingClientRect();
  const containerRect = resolvedContainer?.getBoundingClientRect();
  const containerWindow = node.ownerDocument.defaultView ?? window;

  const computedStyle = containerWindow.getComputedStyle(node);
  const transform =
    computedStyle.getPropertyValue("-webkit-transform") ||
    computedStyle.getPropertyValue("transform");

  let offsetX = 0;
  let offsetY = 0;

  if (transform && transform !== "none") {
    const transformValues = transform.split("(")[1]?.split(")")[0]?.split(",");
    if (transformValues && transformValues.length >= 6) {
      offsetX = Number.parseInt(transformValues[4]!, 10);
      offsetY = Number.parseInt(transformValues[5]!, 10);
    }
  }

  if (direction === "left") {
    if (containerRect) {
      return `translateX(${containerRect.right + offsetX - rect.left}px)`;
    }
    return `translateX(${containerWindow.innerWidth + offsetX - rect.left}px)`;
  }

  if (direction === "right") {
    if (containerRect) {
      return `translateX(-${rect.right - containerRect.left - offsetX}px)`;
    }
    return `translateX(-${rect.left + rect.width - offsetX}px)`;
  }

  if (direction === "up") {
    if (containerRect) {
      return `translateY(${containerRect.bottom + offsetY - rect.top}px)`;
    }
    return `translateY(${containerWindow.innerHeight + offsetY - rect.top}px)`;
  }

  // direction === "down"
  if (containerRect) {
    return `translateY(-${rect.top - containerRect.top + rect.height - offsetY}px)`;
  }
  return `translateY(-${rect.top + rect.height - offsetY}px)`;
}

function setTranslateValue(
  direction: SlideDirection,
  node: HTMLElement,
  containerProp: SlideProps["container"],
): void {
  const transform = getTranslateValue(direction, node, resolveContainer(containerProp));
  node.style.transform = transform;
}

export const Slide = forwardRef<HTMLElement, SlideProps>(function Slide(
  {
    addEndListener,
    appear = true,
    children,
    className,
    container: containerProp,
    direction = "down",
    easing: easingProp = DEFAULT_EASING,
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
  const childrenRef = useRef<HTMLElement | null>(null);
  const handleRef = useForkRef(getReactElementRef(children), childrenRef, ref);

  const normalized = (callback?: (node: HTMLElement, isAppearing?: boolean) => void) => {
    return (isAppearing?: boolean) => {
      if (!callback || !childrenRef.current) {
        return;
      }
      if (isAppearing === undefined) {
        callback(childrenRef.current);
      } else {
        callback(childrenRef.current, isAppearing);
      }
    };
  };

  const handleEnter = normalized((node, isAppearing) => {
    setTranslateValue(direction, node, containerProp);
    reflow(node);
    onEnter?.(node, isAppearing ?? false);
  });

  const handleEntering = normalized((node, isAppearing) => {
    const transitionProps = getTransitionProps(
      { timeout, style, easing: easingProp },
      { mode: "enter" },
    );
    node.style.transition = createCssTransition("transform", transitionProps);
    node.style.transform = "none";
    onEntering?.(node, isAppearing ?? false);
  });

  const handleEntered = normalized(onEntered);
  const handleExiting = normalized(onExiting);

  const handleExit = normalized((node) => {
    const transitionProps = getTransitionProps(
      { timeout, style, easing: easingProp },
      { mode: "exit" },
    );
    node.style.transition = createCssTransition("transform", transitionProps);
    setTranslateValue(direction, node, containerProp);
    onExit?.(node);
  });

  const handleExited = normalized((node) => {
    node.style.transition = "";
    onExited?.(node);
  });

  const handleAddEndListener = (done: () => void) => {
    if (addEndListener && childrenRef.current) {
      addEndListener(childrenRef.current, done);
    }
  };

  const updatePosition = useCallback(() => {
    if (childrenRef.current) {
      setTranslateValue(direction, childrenRef.current, containerProp);
    }
  }, [direction, containerProp]);

  useEffect(() => {
    if (inProp || direction === "down" || direction === "right") {
      return undefined;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        if (childrenRef.current) {
          setTranslateValue(direction, childrenRef.current, containerProp);
        }
      }, 166);
    };

    const containerWindow = childrenRef.current?.ownerDocument.defaultView ?? window;
    containerWindow.addEventListener("resize", handleResize);
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      containerWindow.removeEventListener("resize", handleResize);
    };
  }, [direction, inProp, containerProp]);

  useEffect(() => {
    if (!inProp) {
      updatePosition();
    }
  }, [inProp, updatePosition]);

  return (
    <Transition
      nodeRef={childrenRef}
      onEnter={handleEnter}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      onExiting={handleExiting}
      addEndListener={handleAddEndListener}
      appear={appear}
      in={inProp}
      timeout={timeout}
      mountOnEnter={mountOnEnter}
      unmountOnExit={unmountOnExit}
      {...other}
    >
      {(state) =>
        cloneElement(children, {
          ref: handleRef,
          className: mergeClassNames(
            "okryshto-slide",
            `okryshto-slide--${direction}`,
            className,
            children.props.className,
          ),
          style: {
            visibility: state === "exited" && !inProp ? "hidden" : undefined,
            ...style,
            ...children.props.style,
          },
        })
      }
    </Transition>
  );
});
