import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders a labeled checkbox", () => {
    render(<Checkbox label="Remember me" />);
    expect(screen.getByRole("checkbox", { name: "Remember me" })).toBeInTheDocument();
  });

  it("reflects the checked prop", () => {
    render(<Checkbox label="Remember me" checked readOnly />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("sets the indeterminate DOM property (not a real HTML attribute)", () => {
    render(<Checkbox label="Select all" indeterminate />);
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });

  it("applies a size modifier only for non-medium sizes", () => {
    const { container, rerender } = render(<Checkbox label="Remember me" size="small" />);
    expect(container.querySelector(".okkly-checkbox")).toHaveClass("okkly-checkbox--small");

    rerender(<Checkbox label="Remember me" size="medium" />);
    expect(container.querySelector(".okkly-checkbox")?.className).not.toMatch(
      /okkly-checkbox--(small|large)/,
    );
  });

  it("applies a color modifier only for non-primary colors", () => {
    const { container, rerender } = render(<Checkbox label="Remember me" color="danger" />);
    expect(container.querySelector(".okkly-checkbox")).toHaveClass("okkly-checkbox--color-danger");

    rerender(<Checkbox label="Remember me" color="primary" />);
    expect(container.querySelector(".okkly-checkbox")?.className).not.toMatch(
      /okkly-checkbox--color-/,
    );
  });

  it("disables the input", () => {
    render(<Checkbox label="Remember me" disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("fires onChange with the event and the new checked value", () => {
    const onChange = vi.fn();
    render(<Checkbox label="Remember me" onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][1]).toBe(true);
  });

  it("toggles when the label text is clicked (native label association)", () => {
    const onChange = vi.fn();
    render(<Checkbox label="Remember me" onChange={onChange} />);
    fireEvent.click(screen.getByText("Remember me"));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("forwards a ref to the <input> element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox label="Remember me" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
