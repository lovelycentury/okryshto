import { createElement, createRef } from "react";
import { describe, expect, it } from "vitest";
import { getReactElementRef } from "./getReactElementRef";

describe("getReactElementRef", () => {
  it("reads ref from element props (React 19)", () => {
    const ref = createRef<HTMLDivElement>();
    const element = createElement("div", { ref });
    expect(getReactElementRef(element)).toBe(ref);
  });

  it("returns nullish when no ref is present", () => {
    const element = createElement("div", null);
    expect(getReactElementRef(element) ?? undefined).toBeUndefined();
  });
});
