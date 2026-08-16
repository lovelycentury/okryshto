import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { DateTimeField } from "./DateTimeField";

describe("DateTimeField", () => {
  it("renders with the default className and no modifiers", () => {
    const { container } = render(<DateTimeField label="Date & time" />);
    const root = container.querySelector(".okryshto-date-time-field");
    expect(root).toHaveClass("okryshto-component", "okryshto-date-time-field");
    expect(root?.className).not.toMatch(
      /okryshto-date-time-field--(small|large|error|full-width|color-)/,
    );
  });

  it("applies the error modifier", () => {
    const { container } = render(<DateTimeField label="Date & time" error helperText="Required" />);
    expect(container.querySelector(".okryshto-date-time-field")).toHaveClass(
      "okryshto-date-time-field--error",
    );
  });

  it("forwards a ref to the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<DateTimeField label="Date & time" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("calls onChange with a Date when a full valid date-time is typed", () => {
    const onChange = vi.fn();
    render(<DateTimeField label="Date & time" onChange={onChange} />);
    fireEvent.input(screen.getByLabelText("Date & time"), {
      target: { value: "12.08.2024, 14:30" },
    });
    expect(onChange).toHaveBeenCalledOnce();
    const value = onChange.mock.calls[0][0] as Date;
    expect(value).toBeInstanceOf(Date);
    expect(value.getFullYear()).toBe(2024);
    expect(value.getMonth()).toBe(7);
    expect(value.getDate()).toBe(12);
    expect(value.getHours()).toBe(14);
    expect(value.getMinutes()).toBe(30);
  });

  it("calls onChange with null when the input is cleared", () => {
    const onChange = vi.fn();
    render(
      <DateTimeField
        label="Date & time"
        defaultValue={new Date(2024, 7, 12, 14, 30)}
        onChange={onChange}
      />,
    );
    fireEvent.input(screen.getByLabelText("Date & time"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("does not spam null while typing an incomplete date-time", () => {
    const onChange = vi.fn();
    render(<DateTimeField label="Date & time" onChange={onChange} />);
    fireEvent.input(screen.getByLabelText("Date & time"), { target: { value: "12.08.2024, 14" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("opens the date-time picker popover when the picker button is clicked", () => {
    render(<DateTimeField label="Date & time" />);
    fireEvent.click(screen.getByRole("button", { name: "Open date time picker" }));
    expect(document.querySelector(".okryshto-date-time-picker")).toBeInTheDocument();
  });
});
