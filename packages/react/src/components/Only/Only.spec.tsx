import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Only } from "./Only";

function fakeMatchMedia(matchesQuery: (query: string) => boolean) {
  return vi.fn((query: string) => ({
    matches: matchesQuery(query),
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe("Only", () => {
  it("renders children when both bounds match", () => {
    window.matchMedia = fakeMatchMedia(() => true);
    render(
      <Only from="sm" to="md">
        Between sm and md
      </Only>,
    );
    expect(screen.getByText("Between sm and md")).toBeInTheDocument();
  });

  it("renders nothing when the viewport is below `from`", () => {
    window.matchMedia = fakeMatchMedia((query) => !query.includes("min-width"));
    const { container } = render(
      <Only from="sm" to="md">
        Between sm and md
      </Only>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the viewport is at or above `to`", () => {
    window.matchMedia = fakeMatchMedia((query) => !query.includes("max-width"));
    const { container } = render(
      <Only from="sm" to="md">
        Between sm and md
      </Only>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("only enforces the lower bound when `to` is omitted", () => {
    window.matchMedia = fakeMatchMedia((query) => query.includes("min-width"));
    render(<Only from="lg">lg and up</Only>);
    expect(screen.getByText("lg and up")).toBeInTheDocument();
  });

  it("always renders when neither bound is given", () => {
    window.matchMedia = fakeMatchMedia(() => true);
    render(<Only>Always visible</Only>);
    expect(screen.getByText("Always visible")).toBeInTheDocument();
  });
});
