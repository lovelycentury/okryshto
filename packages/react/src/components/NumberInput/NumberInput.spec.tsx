import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { NumberInput } from "./NumberInput";

describe("NumberInput", () => {
  it("renders a labeled input with default stepper controls", () => {
    render(<NumberInput label="Quantity" defaultValue={12} />);
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Increase value" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decrease value" })).toBeInTheDocument();
  });

  it("renders with no modifier classes at defaults", () => {
    const { container } = render(<NumberInput label="Quantity" defaultValue={12} />);
    const root = container.querySelector(".okryshto-number-input");
    expect(root?.className).toBe("okryshto-component okryshto-number-input");
  });

  it("steps up and down via control buttons", () => {
    const onChange = vi.fn();
    render(<NumberInput label="Quantity" defaultValue={5} step={2} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Increase value" }));
    expect(onChange).toHaveBeenLastCalledWith(7);

    fireEvent.click(screen.getByRole("button", { name: "Decrease value" }));
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it("steps with ArrowUp and ArrowDown", () => {
    const onChange = vi.fn();
    render(<NumberInput label="Quantity" defaultValue={10} onChange={onChange} />);
    const input = screen.getByLabelText("Quantity");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(onChange).toHaveBeenLastCalledWith(11);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it("clamps to min and max when stepping", () => {
    const onChangeAtMax = vi.fn();
    render(
      <NumberInput label="Quantity" defaultValue={99} min={1} max={99} onChange={onChangeAtMax} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Increase value" }));
    expect(onChangeAtMax).not.toHaveBeenCalled();

    cleanup();

    const onChangeAtMin = vi.fn();
    render(
      <NumberInput label="Quantity" defaultValue={1} min={1} max={99} onChange={onChangeAtMin} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Decrease value" }));
    expect(onChangeAtMin).not.toHaveBeenCalled();
  });

  it("disables steppers at bounds and when disabled", () => {
    render(<NumberInput label="Quantity" defaultValue={99} min={1} max={99} />);
    expect(screen.getByRole("button", { name: "Increase value" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Decrease value" })).toBeEnabled();

    render(<NumberInput label="Quantity" defaultValue={1} min={1} max={99} />);
    expect(screen.getAllByRole("button", { name: "Decrease value" }).at(-1)).toBeDisabled();

    render(<NumberInput label="Quantity" defaultValue={12} disabled />);
    expect(screen.getAllByLabelText("Quantity").at(-1)).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Increase value" }).at(-1)).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Decrease value" }).at(-1)).toBeDisabled();
  });

  it("applies the error modifier", () => {
    const { container } = render(<NumberInput label="Quantity" error helperText="Must be 1–99" />);
    expect(container.querySelector(".okryshto-number-input")).toHaveClass(
      "okryshto-number-input--error",
    );
    expect(screen.getByLabelText("Quantity")).toHaveAttribute("aria-invalid", "true");
  });

  it("parses empty input as null", () => {
    const onChange = vi.fn();
    render(<NumberInput label="Quantity" defaultValue={12} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("forwards a ref to the <input> element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<NumberInput label="Quantity" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("shows a required asterisk after the label", () => {
    const { container } = render(<NumberInput label="Quantity" required />);
    expect(container.querySelector(".okryshto-number-input__required")).toHaveTextContent("*");
    expect(screen.getByRole("textbox")).toBeRequired();
  });
});
