import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TimeField } from "./TimeField";

describe("TimeField", () => {
  it("renders with the default className and no modifiers", () => {
    const { container } = render(<TimeField label="Time" />);
    const root = container.querySelector(".okryshto-time-field");
    expect(root).toHaveClass("okryshto-component", "okryshto-time-field");
    expect(root?.className).not.toMatch(
      /okryshto-time-field--(small|large|error|full-width|color-)/,
    );
  });

  it("applies the error modifier", () => {
    const { container } = render(<TimeField label="Time" error helperText="Required" />);
    expect(container.querySelector(".okryshto-time-field")).toHaveClass(
      "okryshto-time-field--error",
    );
  });

  it("forwards a ref to the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TimeField label="Time" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("calls onChange with a Date when a full valid time is typed", () => {
    const onChange = vi.fn();
    render(<TimeField label="Time" onChange={onChange} />);
    fireEvent.input(screen.getByLabelText("Time"), { target: { value: "14:30" } });
    expect(onChange).toHaveBeenCalledOnce();
    const value = onChange.mock.calls[0][0] as Date;
    expect(value).toBeInstanceOf(Date);
    expect(value.getHours()).toBe(14);
    expect(value.getMinutes()).toBe(30);
  });

  it("calls onChange with null when the input is cleared", () => {
    const onChange = vi.fn();
    const defaultValue = new Date();
    defaultValue.setHours(14, 30, 0, 0);
    render(<TimeField label="Time" defaultValue={defaultValue} onChange={onChange} />);
    fireEvent.input(screen.getByLabelText("Time"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("does not spam null while typing an incomplete time", () => {
    const onChange = vi.fn();
    render(<TimeField label="Time" onChange={onChange} />);
    fireEvent.input(screen.getByLabelText("Time"), { target: { value: "14:" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("opens the time picker popover when the clock button is clicked", () => {
    render(<TimeField label="Time" />);
    fireEvent.click(screen.getByRole("button", { name: "Open time picker" }));
    expect(document.querySelector(".okryshto-time-picker")).toBeInTheDocument();
  });

  it("shows a required asterisk after the label", () => {
    const { container } = render(<TimeField label="Time" required />);
    expect(container.querySelector(".okryshto-time-field__required")).toHaveTextContent("*");
    expect(screen.getByRole("textbox")).toBeRequired();
  });
});
