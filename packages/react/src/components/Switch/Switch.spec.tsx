import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("renders a switch control", () => {
    render(<Switch aria-label="Enable notifications" />);
    expect(screen.getByRole("switch", { name: "Enable notifications" })).toBeInTheDocument();
  });

  it("renders with a label", () => {
    render(<Switch label="Enable notifications" />);
    expect(screen.getByRole("switch", { name: "Enable notifications" })).toBeInTheDocument();
  });

  it("reflects the checked prop", () => {
    render(<Switch label="Enable notifications" checked readOnly />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("applies a size modifier only for non-medium sizes", () => {
    const { container, rerender } = render(<Switch label="Enable notifications" size="small" />);
    expect(container.querySelector(".okryshto-switch")).toHaveClass("okryshto-switch--small");

    rerender(<Switch label="Enable notifications" size="medium" />);
    expect(container.querySelector(".okryshto-switch")?.className).not.toMatch(
      /okryshto-switch--(small|large)/,
    );
  });

  it("applies a color modifier only for non-primary colors", () => {
    const { container, rerender } = render(<Switch label="Enable notifications" color="dante" />);
    expect(container.querySelector(".okryshto-switch")).toHaveClass("okryshto-switch--color-dante");

    rerender(<Switch label="Enable notifications" color="primary" />);
    expect(container.querySelector(".okryshto-switch")?.className).not.toMatch(
      /okryshto-switch--color-/,
    );
  });

  it("disables the input", () => {
    render(<Switch label="Enable notifications" disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("fires onChange with the event and the new checked value", () => {
    const onChange = vi.fn();
    render(<Switch label="Enable notifications" onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][1]).toBe(true);
  });

  it("toggles when the label text is clicked (native label association)", () => {
    const onChange = vi.fn();
    render(<Switch label="Enable notifications" onChange={onChange} />);
    fireEvent.click(screen.getByText("Enable notifications"));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("forwards a ref to the <input> element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch label="Enable notifications" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("checkbox");
    expect(ref.current?.getAttribute("role")).toBe("switch");
  });
});
