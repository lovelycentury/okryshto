import { describe, expect, it } from "vitest";
import { EASING_EASE_IN_OUT } from "../transitionDefaults";
import { createCssTransition } from "./createCssTransition";

describe("createCssTransition", () => {
  it("builds a single-property transition with defaults", () => {
    expect(createCssTransition("opacity")).toBe(`opacity 0ms ${EASING_EASE_IN_OUT} 0ms`);
  });

  it("accepts numeric duration and delay", () => {
    expect(createCssTransition("opacity", { duration: 225, delay: 50, easing: "linear" })).toBe(
      "opacity 225ms linear 50ms",
    );
  });

  it("accepts string duration and delay", () => {
    expect(
      createCssTransition("transform", { duration: "200ms", delay: "10ms", easing: "ease" }),
    ).toBe("transform 200ms ease 10ms");
  });

  it("joins multiple properties", () => {
    expect(createCssTransition(["opacity", "transform"], { duration: 100, easing: "linear" })).toBe(
      "opacity 100ms linear 0ms,transform 100ms linear 0ms",
    );
  });
});
