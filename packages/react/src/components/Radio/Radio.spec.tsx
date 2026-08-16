import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Radio } from "./Radio";

describe("Radio (standalone)", () => {
  it("renders a labeled radio", () => {
    render(<Radio label="Remember me" />);
    expect(screen.getByRole("radio", { name: "Remember me" })).toBeInTheDocument();
  });

  it("reflects the checked prop", () => {
    render(<Radio label="Remember me" checked readOnly />);
    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("applies a size modifier only for non-medium sizes", () => {
    const { container, rerender } = render(<Radio label="A" size="small" />);
    expect(container.querySelector(".okryshto-radio")).toHaveClass("okryshto-radio--small");

    rerender(<Radio label="A" size="medium" />);
    expect(container.querySelector(".okryshto-radio")?.className).not.toMatch(
      /okryshto-radio--(small|large)/,
    );
  });

  it("applies a color modifier only for non-primary colors", () => {
    const { container, rerender } = render(<Radio label="A" color="dante" />);
    expect(container.querySelector(".okryshto-radio")).toHaveClass("okryshto-radio--color-dante");

    rerender(<Radio label="A" color="primary" />);
    expect(container.querySelector(".okryshto-radio")?.className).not.toMatch(
      /okryshto-radio--color-/,
    );
  });

  it("disables the input", () => {
    render(<Radio label="A" disabled />);
    expect(screen.getByRole("radio")).toBeDisabled();
  });

  it("fires onChange with the event and checked=true", () => {
    const onChange = vi.fn();
    render(<Radio label="A" onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][1]).toBe(true);
  });

  it("forwards a ref to the <input> element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Radio label="A" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
