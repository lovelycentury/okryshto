import type { CSSProperties } from "react";
import type { TransitionEasing, TransitionMode, TransitionTimeout } from "../../types";

export interface TransitionPropOptions {
  mode: TransitionMode;
}

export function getTransitionProps(
  props: {
    timeout?: TransitionTimeout | "auto" | null;
    easing?: TransitionEasing;
    style?: CSSProperties;
  },
  options: TransitionPropOptions,
): { duration: number | string; easing?: string; delay?: string | number } {
  const { timeout, easing, style = {} } = props;
  const { mode } = options;

  let duration: number | string = 0;
  if (style.transitionDuration != null) {
    duration = style.transitionDuration;
  } else if (typeof timeout === "number") {
    duration = timeout;
  } else if (timeout && typeof timeout === "object") {
    duration = timeout[mode] ?? timeout.enter ?? 0;
  }

  let resolvedEasing: string | undefined;
  if (style.transitionTimingFunction != null) {
    resolvedEasing = style.transitionTimingFunction;
  } else if (typeof easing === "object") {
    resolvedEasing = easing[mode === "appear" ? "enter" : mode];
  } else {
    resolvedEasing = easing;
  }

  return {
    duration,
    easing: resolvedEasing,
    delay: style.transitionDelay,
  };
}
