import { describe, expect, it } from "vitest";
import { getAutoHeightDuration } from "./getAutoHeightDuration";

describe("getAutoHeightDuration", () => {
  it("returns 0 for zero or falsy height", () => {
    expect(getAutoHeightDuration(0)).toBe(0);
  });

  it("scales with height", () => {
    const small = getAutoHeightDuration(36);
    const large = getAutoHeightDuration(360);
    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
  });

  it("matches the MUI formula for a known height", () => {
    const height = 100;
    const constant = height / 36;
    const expected = Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
    expect(getAutoHeightDuration(height)).toBe(expected);
  });
});
