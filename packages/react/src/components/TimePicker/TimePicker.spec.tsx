import { createRef } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimePicker } from "./TimePicker";

describe("TimePicker", () => {
  it("renders an hours and a minutes wheel defaulting to 0:00", () => {
    render(<TimePicker />);
    const hours = screen.getByRole("spinbutton", { name: "Hours" });
    const minutes = screen.getByRole("spinbutton", { name: "Minutes" });
    expect(hours).toHaveAttribute("aria-valuenow", "0");
    expect(minutes).toHaveAttribute("aria-valuenow", "0");
    expect(within(hours).getAllByText("00")).not.toHaveLength(0);
    expect(within(minutes).getAllByText("00")).not.toHaveLength(0);
  });

  it("applies the color modifier only for non-primary colors", () => {
    const { container, rerender } = render(<TimePicker color="dante" />);
    expect(container.querySelector(".okryshto-time-picker")).toHaveClass(
      "okryshto-time-picker--color-dante",
    );

    rerender(<TimePicker color="primary" />);
    expect(container.querySelector(".okryshto-time-picker")?.className).not.toMatch(
      /okryshto-time-picker--color-/,
    );
  });

  it("clamps the initial minute value to the nearest step", () => {
    render(<TimePicker step={15} defaultValue={{ h: 1, m: 37 }} />);
    expect(screen.getByRole("spinbutton", { name: "Minutes" })).toHaveAttribute(
      "aria-valuenow",
      "30",
    );
  });

  describe("uncontrolled keyboard interaction", () => {
    it("ArrowUp increases the hour and fires onChange", () => {
      const onChange = vi.fn();
      render(<TimePicker defaultValue={{ h: 5, m: 0 }} onChange={onChange} />);
      const hours = screen.getByRole("spinbutton", { name: "Hours" });
      fireEvent.keyDown(hours, { key: "ArrowUp" });
      expect(hours).toHaveAttribute("aria-valuenow", "6");
      expect(onChange).toHaveBeenCalledWith({ h: 6, m: 0 });
    });

    it("ArrowDown decreases the minute by one step", () => {
      const onChange = vi.fn();
      render(<TimePicker step={5} defaultValue={{ h: 0, m: 10 }} onChange={onChange} />);
      const minutes = screen.getByRole("spinbutton", { name: "Minutes" });
      fireEvent.keyDown(minutes, { key: "ArrowDown" });
      expect(minutes).toHaveAttribute("aria-valuenow", "5");
      expect(onChange).toHaveBeenCalledWith({ h: 0, m: 5 });
    });

    it("clamps at the ends instead of wrapping", () => {
      render(<TimePicker defaultValue={{ h: 23, m: 0 }} />);
      const hours = screen.getByRole("spinbutton", { name: "Hours" });
      fireEvent.keyDown(hours, { key: "ArrowUp" });
      expect(hours).toHaveAttribute("aria-valuenow", "23");
    });

    it("Home/End jump to the first/last value", () => {
      render(<TimePicker defaultValue={{ h: 5, m: 0 }} />);
      const hours = screen.getByRole("spinbutton", { name: "Hours" });
      fireEvent.keyDown(hours, { key: "End" });
      expect(hours).toHaveAttribute("aria-valuenow", "23");
      fireEvent.keyDown(hours, { key: "Home" });
      expect(hours).toHaveAttribute("aria-valuenow", "0");
    });
  });

  it("clicking a slide selects that value", () => {
    render(<TimePicker defaultValue={{ h: 0, m: 0 }} />);
    const hours = screen.getByRole("spinbutton", { name: "Hours" });
    fireEvent.click(within(hours).getByText("05"));
    expect(hours).toHaveAttribute("aria-valuenow", "5");
  });

  it("is fully controlled when value is supplied", () => {
    const onChange = vi.fn();
    const { rerender } = render(<TimePicker value={{ h: 1, m: 0 }} onChange={onChange} />);
    const hours = screen.getByRole("spinbutton", { name: "Hours" });
    expect(hours).toHaveAttribute("aria-valuenow", "1");

    fireEvent.keyDown(hours, { key: "ArrowUp" });
    // A controlled TimePicker doesn't move on its own — the parent decides via `value`.
    expect(onChange).toHaveBeenCalledWith({ h: 2, m: 0 });
    expect(hours).toHaveAttribute("aria-valuenow", "1");

    rerender(<TimePicker value={{ h: 2, m: 0 }} onChange={onChange} />);
    expect(hours).toHaveAttribute("aria-valuenow", "2");
  });

  it("hides the AM/PM wheel by default (24h format)", () => {
    render(<TimePicker />);
    expect(screen.queryByRole("spinbutton", { name: "AM/PM" })).not.toBeInTheDocument();
  });

  it("format=12h splits the hour wheel into 1–12 plus a separate AM/PM wheel", () => {
    render(<TimePicker format="12h" defaultValue={{ h: 13, m: 0 }} />);
    const hours = screen.getByRole("spinbutton", { name: "Hours" });
    const meridiem = screen.getByRole("spinbutton", { name: "AM/PM" });
    expect(hours).toHaveAttribute("aria-valuenow", "1");
    expect(hours).toHaveAttribute("aria-valuemax", "12");
    expect(meridiem).toHaveAttribute("aria-valuenow", "1");
    expect(within(meridiem).getByText("PM")).toBeInTheDocument();
  });

  it("changing the AM/PM wheel flips the underlying hour by 12, not the minute", () => {
    const onChange = vi.fn();
    render(<TimePicker format="12h" defaultValue={{ h: 9, m: 15 }} onChange={onChange} />);
    const meridiem = screen.getByRole("spinbutton", { name: "AM/PM" });
    fireEvent.click(within(meridiem).getByText("PM"));
    expect(onChange).toHaveBeenCalledWith({ h: 21, m: 15 });
  });

  it("changing the 1–12 hour wheel keeps the current AM/PM", () => {
    const onChange = vi.fn();
    render(<TimePicker format="12h" defaultValue={{ h: 21, m: 0 }} onChange={onChange} />);
    const hours = screen.getByRole("spinbutton", { name: "Hours" });
    fireEvent.click(within(hours).getByText("05"));
    // 5 PM, not 5 AM.
    expect(onChange).toHaveBeenCalledWith({ h: 17, m: 0 });
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<TimePicker ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("okryshto-time-picker");
  });
});
