import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TextArea } from "./TextArea";

describe("TextArea", () => {
  it("renders with default classes and no modifier classes", () => {
    const { container } = render(<TextArea label="Message" />);
    const root = container.querySelector(".okkly-text-area");
    expect(root).toHaveClass("okkly-component", "okkly-text-area");
    expect(root?.className).not.toMatch(
      /okkly-text-area--(small|large|color-|error|full-width|resize-|autosize)/,
    );
  });

  it("applies size modifiers only for non-medium sizes", () => {
    const { container, rerender } = render(<TextArea label="Message" size="small" />);
    expect(container.querySelector(".okkly-text-area")).toHaveClass("okkly-text-area--small");

    rerender(<TextArea label="Message" size="large" />);
    expect(container.querySelector(".okkly-text-area")).toHaveClass("okkly-text-area--large");

    rerender(<TextArea label="Message" size="medium" />);
    expect(container.querySelector(".okkly-text-area")?.className).not.toMatch(
      /okkly-text-area--(small|large)/,
    );
  });

  it("applies a color modifier only for non-primary colors", () => {
    const { container, rerender } = render(<TextArea label="Message" color="dante" />);
    expect(container.querySelector(".okkly-text-area")).toHaveClass("okkly-text-area--color-dante");

    rerender(<TextArea label="Message" color="primary" />);
    expect(container.querySelector(".okkly-text-area")?.className).not.toMatch(
      /okkly-text-area--color-/,
    );
  });

  it("applies the error modifier and marks aria-invalid", () => {
    const { container } = render(<TextArea label="Message" error />);
    expect(container.querySelector(".okkly-text-area")).toHaveClass("okkly-text-area--error");
    expect(screen.getByLabelText("Message")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows a character counter when maxLength is set", () => {
    render(<TextArea label="Message" maxLength={280} defaultValue="Hello" />);
    expect(screen.getByText("5 / 280")).toBeInTheDocument();
  });

  it("links helper text and counter via aria-describedby", () => {
    render(<TextArea label="Message" helperText="Markdown supported" maxLength={280} />);
    const textarea = screen.getByLabelText("Message");
    const helper = screen.getByText("Markdown supported");
    const counter = screen.getByText("0 / 280");
    expect(textarea.getAttribute("aria-describedby")).toBe(`${helper.id} ${counter.id}`);
  });

  it("fires onChange with the typed value", () => {
    const onChange = vi.fn();
    render(<TextArea label="Message" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Hello world" } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Message")).toHaveValue("Hello world");
  });

  it("forwards a ref to the <textarea> element", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<TextArea label="Message" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("disables the textarea", () => {
    render(<TextArea label="Message" disabled />);
    expect(screen.getByLabelText("Message")).toBeDisabled();
  });

  it("shows a required asterisk after the label", () => {
    const { container } = render(<TextArea label="Message" required />);
    expect(container.querySelector(".okkly-text-area__required")).toHaveTextContent("*");
    expect(screen.getByRole("textbox")).toBeRequired();
  });
});
