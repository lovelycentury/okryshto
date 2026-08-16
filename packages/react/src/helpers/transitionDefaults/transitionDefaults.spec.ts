import { describe, expect, it } from "vitest";
import {
  DEFAULT_TIMEOUT,
  DURATION_ENTERING_SCREEN,
  DURATION_LEAVING_SCREEN,
  DURATION_STANDARD,
  EASING_EASE_IN_OUT,
  EASING_EASE_OUT,
  EASING_SHARP,
} from "./transitionDefaults";

describe("transitionDefaults", () => {
  it("exposes MUI entering/leaving/standard durations", () => {
    expect(DURATION_ENTERING_SCREEN).toBe(225);
    expect(DURATION_LEAVING_SCREEN).toBe(195);
    expect(DURATION_STANDARD).toBe(300);
  });

  it("builds DEFAULT_TIMEOUT from entering/leaving screen", () => {
    expect(DEFAULT_TIMEOUT).toEqual({
      enter: DURATION_ENTERING_SCREEN,
      exit: DURATION_LEAVING_SCREEN,
    });
  });

  it("exposes MUI easing curves", () => {
    expect(EASING_EASE_IN_OUT).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
    expect(EASING_EASE_OUT).toBe("cubic-bezier(0.0, 0, 0.2, 1)");
    expect(EASING_SHARP).toBe("cubic-bezier(0.4, 0, 0.6, 1)");
  });
});
