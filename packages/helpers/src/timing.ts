/** Return a debounced version of `fn` that delays invocation by `wait` ms. */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}
