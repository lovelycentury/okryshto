import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("renders a labeled input", () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("links the label to the input via htmlFor/id", () => {
    render(<TextField label="Email" />);
    const input = screen.getByLabelText("Email");
    const label = screen.getByText("Email");
    expect(label).toHaveAttribute("for", input.id);
  });

  it("visually hides the label when hideLabel is set, but keeps it accessible", () => {
    render(<TextField label="Email" hideLabel />);
    expect(screen.getByText("Email")).toHaveClass("okryshto-text-field__label--hidden");
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("applies a size modifier only for non-medium sizes", () => {
    const { container, rerender } = render(<TextField label="Email" size="small" />);
    expect(container.querySelector(".okryshto-text-field")).toHaveClass(
      "okryshto-text-field--small",
    );

    rerender(<TextField label="Email" size="medium" />);
    expect(container.querySelector(".okryshto-text-field")?.className).not.toMatch(
      /okryshto-text-field--(small|large)/,
    );
  });

  it("applies a color modifier only for non-primary colors", () => {
    const { container, rerender } = render(<TextField label="Email" color="dante" />);
    expect(container.querySelector(".okryshto-text-field")).toHaveClass(
      "okryshto-text-field--color-dante",
    );

    rerender(<TextField label="Email" color="primary" />);
    expect(container.querySelector(".okryshto-text-field")?.className).not.toMatch(
      /okryshto-text-field--color-/,
    );
  });

  it("applies the error modifier and marks aria-invalid", () => {
    const { container } = render(<TextField label="Email" error />);
    expect(container.querySelector(".okryshto-text-field")).toHaveClass(
      "okryshto-text-field--error",
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("applies the full-width modifier", () => {
    const { container } = render(<TextField label="Email" fullWidth />);
    expect(container.querySelector(".okryshto-text-field")).toHaveClass(
      "okryshto-text-field--full-width",
    );
  });

  it("renders helperText and links it via aria-describedby", () => {
    render(<TextField label="Email" helperText="We'll never share it" />);
    const input = screen.getByLabelText("Email");
    const helper = screen.getByText("We'll never share it");
    expect(input.getAttribute("aria-describedby")).toBe(helper.id);
  });

  it("disables the input", () => {
    render(<TextField label="Email" disabled />);
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });

  it("shows a required asterisk after the label", () => {
    const { container } = render(<TextField label="Email" required />);
    expect(container.querySelector(".okryshto-text-field__required")).toHaveTextContent("*");
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  it("fires onChange with the typed value", () => {
    const onChange = vi.fn();
    render(<TextField label="Email" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "hello@oleksii.dev" } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("forwards a ref to the <input> element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField label="Email" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
