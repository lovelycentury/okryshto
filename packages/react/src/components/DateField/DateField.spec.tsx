import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { DateField } from "./DateField";

describe("DateField", () => {
  it("renders with the default className and no modifiers", () => {
    const { container } = render(<DateField label="Date" />);
    const root = container.querySelector(".okryshto-date-field");
    expect(root).toHaveClass("okryshto-component", "okryshto-date-field");
    expect(root?.className).not.toMatch(
      /okryshto-date-field--(small|large|error|full-width|color-)/,
    );
  });

  it("applies the error modifier", () => {
    const { container } = render(<DateField label="Date" error helperText="Required" />);
    expect(container.querySelector(".okryshto-date-field")).toHaveClass(
      "okryshto-date-field--error",
    );
  });

  it("forwards a ref to the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<DateField label="Date" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("calls onChange with a Date when a full valid date is typed", () => {
    const onChange = vi.fn();
    render(<DateField label="Date" onChange={onChange} />);
    fireEvent.input(screen.getByLabelText("Date"), { target: { value: "12.08.2024" } });
    expect(onChange).toHaveBeenCalledOnce();
    const value = onChange.mock.calls[0][0] as Date;
    expect(value).toBeInstanceOf(Date);
    expect(value.getFullYear()).toBe(2024);
    expect(value.getMonth()).toBe(7);
    expect(value.getDate()).toBe(12);
  });

  it("calls onChange with null when the input is cleared", () => {
    const onChange = vi.fn();
    render(<DateField label="Date" defaultValue={new Date(2024, 7, 12)} onChange={onChange} />);
    fireEvent.input(screen.getByLabelText("Date"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("does not spam null while typing an incomplete date", () => {
    const onChange = vi.fn();
    render(<DateField label="Date" onChange={onChange} />);
    fireEvent.input(screen.getByLabelText("Date"), { target: { value: "12.08." } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("opens the calendar popover when the calendar button is clicked", () => {
    render(<DateField label="Date" />);
    fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(document.querySelector(".okryshto-calendar")).toBeInTheDocument();
  });
});
