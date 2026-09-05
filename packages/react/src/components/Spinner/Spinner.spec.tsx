import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders with accessible loading label", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("applies default classes without modifiers", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("okkly-component", "okkly-spinner");
    expect(spinner.className).not.toMatch(/okkly-spinner--(small|large|dante|indigo)/);
  });

  it("applies size modifiers only for non-medium sizes", () => {
    const { rerender } = render(<Spinner size="small" />);
    expect(screen.getByRole("status")).toHaveClass("okkly-spinner--small");

    rerender(<Spinner size="large" />);
    expect(screen.getByRole("status")).toHaveClass("okkly-spinner--large");

    rerender(<Spinner size="medium" />);
    expect(screen.getByRole("status").className).not.toMatch(/okkly-spinner--(small|large)/);
  });

  it("applies color modifiers for non-primary colors", () => {
    const { rerender } = render(<Spinner color="dante" />);
    expect(screen.getByRole("status")).toHaveClass("okkly-spinner--dante");

    rerender(<Spinner color="primary" />);
    expect(screen.getByRole("status").className).not.toMatch(/okkly-spinner--dante/);
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
