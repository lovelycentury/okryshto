import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateTimePicker } from "./DateTimePicker";

describe("DateTimePicker", () => {
  it("renders a Calendar and a TimePicker with no date selected by default", () => {
    const { container } = render(<DateTimePicker defaultValue={null} />);
    expect(container.querySelector(".okkly-calendar")).toBeInTheDocument();
    expect(container.querySelector(".okkly-time-picker")).toBeInTheDocument();
    expect(screen.getByText("No date selected")).toBeInTheDocument();
  });

  it("applies zero color modifier classes by default", () => {
    const { container } = render(<DateTimePicker />);
    const root = container.querySelector(".okkly-date-time-picker");
    expect(root).toHaveClass("okkly-component", "okkly-date-time-picker");
    expect(container.querySelector(".okkly-calendar")?.className).not.toMatch(/--color-/);
    expect(container.querySelector(".okkly-time-picker")?.className).not.toMatch(/--color-/);
  });

  it("shares the color prop with the calendar, the wheels, and the Confirm button", () => {
    const { container } = render(<DateTimePicker color="dante" />);
    // The wheels and the button take a modifier class; the calendar has no
    // colour prop, so its share arrives as a tone variable instead.
    const calendar = container.querySelector<HTMLElement>(".okkly-calendar");
    expect(calendar?.style.getPropertyValue("--okkly-calendar-tone")).toBe(
      "var(--okkly-accent-dante)",
    );
    expect(container.querySelector(".okkly-time-picker")).toHaveClass(
      "okkly-time-picker--color-dante",
    );
    expect(container.querySelector(".okkly-button")).toHaveClass("okkly-button--color-dante");
  });

  it("shows the formatted summary once a day is selected, combined with the wheel's time", () => {
    render(<DateTimePicker defaultValue={new Date(2024, 10, 8, 0, 0)} />);
    expect(screen.getByText("Nov 8, 2024 · 00:00")).toBeInTheDocument();
  });

  it("selecting a calendar day combines it with the current wheel time and fires onChange", () => {
    const onChange = vi.fn();
    render(<DateTimePicker defaultValue={null} onChange={onChange} />);
    // month defaults to "now", so pin it via the Calendar's own nav isn't needed here —
    // just assert the shape of the combined value using whatever day gets clicked.
    const days = screen.getAllByRole("button", { name: "15" });
    fireEvent.click(days[0]);
    expect(onChange).toHaveBeenCalledOnce();
    const value: Date = onChange.mock.calls[0][0];
    expect(value.getDate()).toBe(15);
    expect(value.getHours()).toBe(0);
    expect(value.getMinutes()).toBe(0);
  });

  it("moving a time wheel before any day is picked only updates the draft, without firing onChange", () => {
    const onChange = vi.fn();
    render(<DateTimePicker defaultValue={null} onChange={onChange} />);
    const hours = screen.getByRole("spinbutton", { name: "Hours" });
    fireEvent.keyDown(hours, { key: "ArrowUp" });
    expect(hours).toHaveAttribute("aria-valuenow", "1");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("carries the dialed-in draft time over once a day is finally picked", () => {
    const onChange = vi.fn();
    render(<DateTimePicker defaultValue={null} onChange={onChange} />);
    const hours = screen.getByRole("spinbutton", { name: "Hours" });
    fireEvent.keyDown(hours, { key: "ArrowUp" });
    fireEvent.keyDown(hours, { key: "ArrowUp" });

    const days = screen.getAllByRole("button", { name: "20" });
    fireEvent.click(days[0]);
    const value: Date = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(value.getDate()).toBe(20);
    expect(value.getHours()).toBe(2);
  });

  it("moving a time wheel after a day is picked commits a new combined value", () => {
    const onChange = vi.fn();
    render(<DateTimePicker defaultValue={new Date(2024, 10, 8, 9, 0)} onChange={onChange} />);
    const hours = screen.getByRole("spinbutton", { name: "Hours" });
    fireEvent.keyDown(hours, { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalled();
    const value: Date = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(value.getFullYear()).toBe(2024);
    expect(value.getMonth()).toBe(10);
    expect(value.getDate()).toBe(8);
    expect(value.getHours()).toBe(10);
  });

  it("disables the Confirm button until a day is selected, then fires onConfirm with the current value", () => {
    const onConfirm = vi.fn();
    render(<DateTimePicker defaultValue={null} onConfirm={onConfirm} />);
    expect(screen.getByRole("button", { name: /Confirm/ })).toBeDisabled();

    const days = screen.getAllByRole("button", { name: "15" });
    fireEvent.click(days[0]);
    const confirmButton = screen.getByRole("button", { name: /Confirm/ });
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onConfirm.mock.calls[0][0].getDate()).toBe(15);
  });

  it("renders the timezone chip only when timezoneLabel is set", () => {
    const { rerender } = render(<DateTimePicker />);
    expect(screen.queryByText("GMT+2")).not.toBeInTheDocument();

    rerender(<DateTimePicker timezoneLabel="GMT+2" />);
    expect(screen.getByText("GMT+2")).toBeInTheDocument();
  });

  it("is fully controlled when value is supplied", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <DateTimePicker value={new Date(2024, 10, 8, 0, 0)} onChange={onChange} />,
    );
    expect(screen.getByText("Nov 8, 2024 · 00:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "15" }));
    expect(onChange).toHaveBeenCalledOnce();
    // A controlled DateTimePicker doesn't move on its own — the parent decides via `value`.
    expect(screen.getByText("Nov 8, 2024 · 00:00")).toBeInTheDocument();

    rerender(<DateTimePicker value={new Date(2024, 10, 15, 0, 0)} onChange={onChange} />);
    expect(screen.getByText("Nov 15, 2024 · 00:00")).toBeInTheDocument();
  });

  it("formats the summary in 12h or 24h to match the format prop", () => {
    const { rerender } = render(
      <DateTimePicker defaultValue={new Date(2024, 10, 8, 13, 0)} format="24h" />,
    );
    expect(screen.getByText("Nov 8, 2024 · 13:00")).toBeInTheDocument();

    rerender(<DateTimePicker defaultValue={new Date(2024, 10, 8, 13, 0)} format="12h" />);
    expect(screen.getByText("Nov 8, 2024 · 01:00 PM")).toBeInTheDocument();
    const hours = screen.getByRole("spinbutton", { name: "Hours" });
    expect(hours).toHaveAttribute("aria-valuenow", "1");
    const meridiem = screen.getByRole("spinbutton", { name: "AM/PM" });
    expect(meridiem).toHaveAttribute("aria-valuenow", "1");
  });

  it("uses custom labels for the summary, empty state, and confirm button", () => {
    render(
      <DateTimePicker
        defaultValue={null}
        summaryLabel="Time slot"
        emptyLabel="Pick a day"
        confirmLabel="Book it"
      />,
    );
    expect(screen.getByText("Time slot")).toBeInTheDocument();
    expect(screen.getByText("Pick a day")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Book it/ })).toBeInTheDocument();
  });

  it("renders no shortcut chips column", () => {
    const { container } = render(<DateTimePicker defaultValue={new Date(2024, 10, 8, 9, 0)} />);
    expect(container.querySelector(".okkly-date-time-picker__chips")).not.toBeInTheDocument();
    expect(container.querySelector(".okkly-calendar__chips")).not.toBeInTheDocument();
  });

  it("hands its tone to the calendar as a CSS variable", () => {
    // Calendar has no color prop; the picker's own tone reaches it this way.
    const { container } = render(<DateTimePicker defaultValue={null} color="dante" />);
    const calendar = container.querySelector<HTMLElement>(".okkly-calendar");
    expect(calendar?.style.getPropertyValue("--okkly-calendar-tone")).toBe(
      "var(--okkly-accent-dante)",
    );
  });
});
