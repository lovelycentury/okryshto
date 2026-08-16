import { describe, expect, it } from "vitest";
import { mergeClassNames } from "./mergeClassNames";

describe("mergeClassNames", () => {
  it("joins truthy class names with spaces", () => {
    expect(mergeClassNames("a", "b", "c")).toBe("a b c");
  });

  it("skips falsy values", () => {
    expect(mergeClassNames("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns empty string when nothing is provided", () => {
    expect(mergeClassNames()).toBe("");
    expect(mergeClassNames(false, null)).toBe("");
  });
});
