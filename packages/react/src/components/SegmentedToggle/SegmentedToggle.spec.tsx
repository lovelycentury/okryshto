import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedToggle } from "./SegmentedToggle";

describe("SegmentedToggle", () => {
  const rangeItems = [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];

  it("renders one button per item with role=group", () => {
    render(<SegmentedToggle items={rangeItems} />);
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Day" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Week" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Month" })).toBeInTheDocument();
  });

  it("renders with zero modifier classes by default", () => {
    const { container } = render(<SegmentedToggle items={rangeItems} />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("okryshto-component", "okryshto-segmented-toggle");
    expect(root.className).not.toMatch(/okryshto-segmented-toggle--color-/);
    expect(root.className).not.toMatch(/okryshto-segmented-toggle--disabled/);
  });

  it("marks the active segment from value", () => {
    render(<SegmentedToggle items={rangeItems} value="week" />);
    const week = screen.getByRole("button", { name: "Week" });
    expect(week).toHaveClass("okryshto-segmented-toggle__segment--active");
    expect(week).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "false");
  });

  it("applies the color modifier only for non-default colors", () => {
    const { rerender, container } = render(<SegmentedToggle items={rangeItems} color="dante" />);
    expect(container.firstChild).toHaveClass("okryshto-segmented-toggle--color-dante");

    rerender(<SegmentedToggle items={rangeItems} color="primary" />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(
      /okryshto-segmented-toggle--color-/,
    );
  });

  it("fires onChange with the selected value in exclusive mode", () => {
    const onChange = vi.fn();
    render(<SegmentedToggle items={rangeItems} value="day" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    expect(onChange).toHaveBeenCalledWith("month");
  });

  it("toggles values in multi-select mode", () => {
    const onChange = vi.fn();
    render(
      <SegmentedToggle
        exclusive={false}
        value={["bold"]}
        onChange={onChange}
        items={[
          { label: "Bold", value: "bold" },
          { label: "Italic", value: "italic" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Italic" }));
    expect(onChange).toHaveBeenCalledWith(["bold", "italic"]);

    onChange.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("updates selection in uncontrolled exclusive mode", () => {
    render(<SegmentedToggle items={rangeItems} defaultValue="day" />);
    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(screen.getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "true");
  });

  it("disables every segment when disabled is set", () => {
    render(<SegmentedToggle items={rangeItems} disabled />);
    expect(screen.getByRole("button", { name: "Day" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Week" })).toBeDisabled();
  });

  it("respects per-item disabled", () => {
    render(
      <SegmentedToggle
        items={[
          { label: "Day", value: "day" },
          { label: "Week", value: "week", disabled: true },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "Week" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Day" })).not.toBeDisabled();
  });
});
