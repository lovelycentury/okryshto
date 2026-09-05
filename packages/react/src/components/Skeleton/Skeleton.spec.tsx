import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders with default text variant and pulse animation", () => {
    const { container } = render(<Skeleton data-testid="skel" />);
    const skel = container.firstChild as HTMLElement;
    expect(skel).toHaveClass("okkly-skeleton", "okkly-skeleton--pulse");
    expect(skel.className).not.toMatch(/okkly-skeleton--(circular|rectangular|rounded)/);
  });

  it("applies variant modifiers for non-text shapes", () => {
    const { container, rerender } = render(<Skeleton variant="circular" />);
    expect(container.firstChild).toHaveClass("okkly-skeleton--circular");

    rerender(<Skeleton variant="rectangular" />);
    expect(container.firstChild).toHaveClass("okkly-skeleton--rectangular");

    rerender(<Skeleton variant="rounded" />);
    expect(container.firstChild).toHaveClass("okkly-skeleton--rounded");

    rerender(<Skeleton variant="text" />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/okkly-skeleton--circular/);
  });

  it("applies animation modifiers", () => {
    const { container, rerender } = render(<Skeleton animation="wave" />);
    expect(container.firstChild).toHaveClass("okkly-skeleton--wave");
    expect(container.firstChild).not.toHaveClass("okkly-skeleton--pulse");

    rerender(<Skeleton animation={false} />);
    expect(container.firstChild).not.toHaveClass("okkly-skeleton--pulse", "okkly-skeleton--wave");
  });

  it("sets width and height via CSS variables", () => {
    const { container } = render(<Skeleton width={200} height={40} />);
    const skel = container.firstChild as HTMLElement;
    expect(skel.style.getPropertyValue("--okkly-skeleton-width")).toBe("12.5rem");
    expect(skel.style.getPropertyValue("--okkly-skeleton-height")).toBe("2.5rem");
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
