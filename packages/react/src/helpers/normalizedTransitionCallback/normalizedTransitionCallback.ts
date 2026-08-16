export function normalizedTransitionCallback(
  nodeRef: { current: HTMLElement | null },
  callback?: (node: HTMLElement, isAppearing?: boolean) => void,
): (maybeIsAppearing?: boolean) => void {
  return (maybeIsAppearing?: boolean) => {
    if (!callback) {
      return;
    }
    const node = nodeRef.current;
    if (!node) {
      return;
    }
    if (maybeIsAppearing === undefined) {
      callback(node);
    } else {
      callback(node, maybeIsAppearing);
    }
  };
}
