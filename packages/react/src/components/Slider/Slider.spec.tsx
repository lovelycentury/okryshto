import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Slider } from "./Slider";

function mockSliderRect(element: HTMLElement, width = 200, height = 40) {
  element.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: height,
      right: width,
      width,
      height,
      toJSON: () => ({}),
    }) as DOMRect;
}

describe("Slider", () => {
  it("renders a slider with default classes and no size/color modifiers", () => {
    const { container } = render(<Slider defaultValue={30} aria-label="Volume" />);
    const root = container.querySelector(".okkly-slider");
    expect(root).toBeInTheDocument();
    expect(root).not.toHaveClass("okkly-slider--small");
    expect(root).not.toHaveClass("okkly-slider--large");
    expect(root?.className).not.toMatch(/okkly-slider--color-/);
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  });

  it("steps with keyboard navigation", () => {
    render(<Slider defaultValue={30} aria-label="Volume" />);
    const input = screen.getByRole("slider");
    input.focus();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(input).toHaveAttribute("aria-valuenow", "31");
    fireEvent.keyDown(input, { key: "ArrowLeft" });
    expect(input).toHaveAttribute("aria-valuenow", "30");
  });

  it("jumps when clicking the track", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider defaultValue={10} onChange={onChange} aria-label="Volume" />,
    );
    const root = container.querySelector(".okkly-slider") as HTMLElement;
    mockSliderRect(root);

    fireEvent.mouseDown(root, { clientX: 150, clientY: 20, button: 0 });
    expect(onChange).toHaveBeenCalled();
    const lastValue = onChange.mock.calls.at(-1)?.[1] as number;
    expect(lastValue).toBeGreaterThanOrEqual(70);
    expect(lastValue).toBeLessThanOrEqual(76);
  });

  it("snaps to step marks when discrete", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider defaultValue={20} discrete step={10} onChange={onChange} aria-label="Volume" />,
    );
    const root = container.querySelector(".okkly-slider") as HTMLElement;
    mockSliderRect(root);

    expect(container.querySelectorAll(".okkly-slider__mark").length).toBe(11);

    fireEvent.mouseDown(root, { clientX: 145, clientY: 20, button: 0 });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[1]).toBe(70);
  });

  it("navigates mark-to-mark with keyboard when discrete", () => {
    render(<Slider defaultValue={30} discrete step={10} aria-label="Volume" />);
    const input = screen.getByRole("slider");
    input.focus();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(input).toHaveAttribute("aria-valuenow", "40");
    fireEvent.keyDown(input, { key: "ArrowLeft" });
    expect(input).toHaveAttribute("aria-valuenow", "30");
  });

  it("restricts values to custom marks when discrete", () => {
    const onChange = vi.fn();
    const marks = [
      { value: 0, label: "0" },
      { value: 20, label: "20" },
      { value: 37, label: "37" },
      { value: 100, label: "100" },
    ];
    const { container } = render(
      <Slider defaultValue={20} discrete marks={marks} onChange={onChange} aria-label="Temp" />,
    );
    const root = container.querySelector(".okkly-slider") as HTMLElement;
    mockSliderRect(root);

    fireEvent.mouseDown(root, { clientX: 80, clientY: 20, button: 0 });
    expect(onChange.mock.calls.at(-1)?.[1]).toBe(37);
  });

  it("renders a range slider with two thumbs", () => {
    render(<Slider defaultValue={[25, 75]} getAriaLabel={(index) => `Thumb ${index + 1}`} />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveAttribute("aria-valuenow", "25");
    expect(sliders[1]).toHaveAttribute("aria-valuenow", "75");
  });

  it("disables interaction when disabled", () => {
    const onChange = vi.fn();
    render(<Slider defaultValue={20} disabled onChange={onChange} aria-label="Volume" />);
    const input = screen.getByRole("slider");
    expect(input).toBeDisabled();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(input).toHaveAttribute("aria-valuenow", "20");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("applies size and color modifiers only for non-default values", () => {
    const { container, rerender } = render(
      <Slider defaultValue={30} size="small" color="dante" aria-label="Volume" />,
    );
    expect(container.querySelector(".okkly-slider")).toHaveClass("okkly-slider--small");
    expect(container.querySelector(".okkly-slider")).toHaveClass("okkly-slider--color-dante");

    rerender(<Slider defaultValue={30} size="medium" color="primary" aria-label="Volume" />);
    const root = container.querySelector(".okkly-slider");
    expect(root?.className).not.toMatch(/okkly-slider--small|okkly-slider--large/);
    expect(root?.className).not.toMatch(/okkly-slider--color-/);
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Slider ref={ref} defaultValue={30} aria-label="Volume" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("okkly-slider");
  });
});
