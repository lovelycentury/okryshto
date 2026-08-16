import type { ReactElement, Ref } from "react";

export function getReactElementRef<T = HTMLElement>(
  element: ReactElement,
): Ref<T> | null | undefined {
  // React 19: ref is a regular prop; older React kept it on the element.
  const propsRef = (element.props as { ref?: Ref<T> }).ref;
  if (propsRef != null) {
    return propsRef;
  }
  return (element as unknown as { ref?: Ref<T> }).ref;
}
