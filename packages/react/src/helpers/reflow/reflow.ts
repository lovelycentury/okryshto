/**
 * Force layout so the next style change always starts a fresh CSS transition.
 */
export function reflow(node: HTMLElement): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  node.scrollTop;
}
