/** Clamp a number between a minimum and maximum. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

let idCounter = 0;

/** Generate a unique id, optionally prefixed. Useful for `aria-*` associations. */
export function uniqueId(prefix = "lokki"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}
