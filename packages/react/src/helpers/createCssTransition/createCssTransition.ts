import { EASING_EASE_IN_OUT } from "../transitionDefaults";

export function createCssTransition(
  props: string | string[],
  options: { duration?: number | string; easing?: string; delay?: string | number } = {},
): string {
  const { duration = 0, easing = EASING_EASE_IN_OUT, delay = 0 } = options;
  const durationCss = typeof duration === "string" ? duration : `${duration}ms`;
  const delayCss = typeof delay === "string" ? delay : `${delay}ms`;
  const propsList = Array.isArray(props) ? props : [props];

  return propsList
    .map((animatedProp) => `${animatedProp} ${durationCss} ${easing} ${delayCss}`)
    .join(",");
}
