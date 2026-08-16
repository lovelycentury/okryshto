import { describe, expect, it, vi } from "vitest";
import { normalizedTransitionCallback } from "./normalizedTransitionCallback";

describe("normalizedTransitionCallback", () => {
  it("no-ops when callback is missing", () => {
    const nodeRef = { current: document.createElement("div") };
    expect(() => normalizedTransitionCallback(nodeRef)(true)).not.toThrow();
  });

  it("no-ops when nodeRef.current is null", () => {
    const callback = vi.fn();
    normalizedTransitionCallback({ current: null }, callback)(true);
    expect(callback).not.toHaveBeenCalled();
  });

  it("calls callback with node only when isAppearing is undefined", () => {
    const node = document.createElement("div");
    const callback = vi.fn();
    normalizedTransitionCallback({ current: node }, callback)();
    expect(callback).toHaveBeenCalledWith(node);
    expect(callback.mock.calls[0]).toHaveLength(1);
  });

  it("calls callback with node and isAppearing when provided", () => {
    const node = document.createElement("div");
    const callback = vi.fn();
    normalizedTransitionCallback({ current: node }, callback)(true);
    expect(callback).toHaveBeenCalledWith(node, true);
  });
});
