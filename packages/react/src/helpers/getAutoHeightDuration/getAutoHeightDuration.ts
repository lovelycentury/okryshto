/**
 * MUI-compatible duration for height/width-based transitions.
 * @see https://www.wolframalpha.com/input/?i=(4+%2B+15+*+t%5E0.25+%2B+t%2F5)+*+10
 */
export function getAutoHeightDuration(height: number): number {
  if (!height) {
    return 0;
  }
  const constant = height / 36;
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
}
