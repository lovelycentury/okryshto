import { describe, expect, it } from "vitest";
import { getTransitionProps } from "./getTransitionProps";

describe("getTransitionProps", () => {
  it("uses numeric timeout for both modes", () => {
    expect(getTransitionProps({ timeout: 200 }, { mode: "enter" }).duration).toBe(200);
    expect(getTransitionProps({ timeout: 200 }, { mode: "exit" }).duration).toBe(200);
  });

  it("picks mode-specific timeout from object", () => {
    expect(
      getTransitionProps({ timeout: { enter: 225, exit: 195 } }, { mode: "enter" }).duration,
    ).toBe(225);
    expect(
      getTransitionProps({ timeout: { enter: 225, exit: 195 } }, { mode: "exit" }).duration,
    ).toBe(195);
  });

  it("falls back to enter timeout for appear mode", () => {
    expect(
      getTransitionProps({ timeout: { enter: 225, exit: 195 } }, { mode: "appear" }).duration,
    ).toBe(225);
  });

  it("prefers style.transitionDuration over timeout", () => {
    expect(
      getTransitionProps(
        { timeout: 200, style: { transitionDuration: "150ms" } },
        { mode: "enter" },
      ).duration,
    ).toBe("150ms");
  });

  it("resolves string and object easing", () => {
    expect(getTransitionProps({ easing: "linear" }, { mode: "enter" }).easing).toBe("linear");
    expect(
      getTransitionProps({ easing: { enter: "ease-in", exit: "ease-out" } }, { mode: "exit" })
        .easing,
    ).toBe("ease-out");
  });

  it("maps appear mode easing to enter", () => {
    expect(
      getTransitionProps({ easing: { enter: "ease-in", exit: "ease-out" } }, { mode: "appear" })
        .easing,
    ).toBe("ease-in");
  });

  it("passes through transitionDelay from style", () => {
    expect(
      getTransitionProps({ style: { transitionDelay: "50ms" } }, { mode: "enter" }).delay,
    ).toBe("50ms");
  });

  it("returns 0 duration for auto timeout without style override", () => {
    expect(getTransitionProps({ timeout: "auto" }, { mode: "enter" }).duration).toBe(0);
  });
});
