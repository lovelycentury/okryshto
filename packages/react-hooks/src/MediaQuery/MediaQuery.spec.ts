import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./MediaQuery";

function fakeMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  let listener: (() => void) | undefined;

  const matchMedia = vi.fn((_query: string) => ({
    get matches() {
      return matches;
    },
    addEventListener: (_type: "change", handler: () => void) => {
      listener = handler;
    },
    removeEventListener: () => {
      listener = undefined;
    },
  })) as unknown as (query: string) => MediaQueryList;

  return {
    matchMedia,
    set: (next: boolean) => {
      matches = next;
      listener?.();
    },
  };
}

describe("useMediaQuery", () => {
  it("reads the current match from matchMedia", () => {
    const { matchMedia } = fakeMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(min-width: 769px)", { matchMedia }));

    expect(result.current).toBe(true);
  });

  it("updates when the media query change event fires", () => {
    const { matchMedia, set } = fakeMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 769px)", { matchMedia }));

    expect(result.current).toBe(false);
    act(() => set(true));
    expect(result.current).toBe(true);
  });

  it("falls back to defaultMatches when matchMedia is unavailable", () => {
    const { result } = renderHook(() =>
      useMediaQuery("(min-width: 769px)", { matchMedia: undefined, defaultMatches: true }),
    );

    expect(result.current).toBe(true);
  });
});
