import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { InlineAction } from "./InlineAction";

describe("InlineAction", () => {
  it("renders the input and the action button", () => {
    render(<InlineAction placeholder="you@company.com" />);
    expect(screen.getByPlaceholderText("you@company.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });

  it("fires onChange when typing", () => {
    const onChange = vi.fn();
    render(<InlineAction value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a@b.dev" } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("fires onAction when the button is clicked", () => {
    const onAction = vi.fn();
    render(<InlineAction defaultValue="a@b.dev" onAction={onAction} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  describe("effective state priority (disabled > loading > readonly > state)", () => {
    it("disabled wins over an explicit state prop", () => {
      render(<InlineAction defaultValue="a@b.dev" state="success" disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
      expect(screen.getByRole("button", { name: "Copy" })).toBeDisabled();
    });

    it("loading shows a spinner instead of the action icon", () => {
      const { container } = render(
        <InlineAction defaultValue="a@b.dev" loading action="Sending…" />,
      );
      expect(container.querySelector(".okryshto-inline-action__spinner")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sending…" })).toBeInTheDocument();
    });

    it("readonly locks the button and marks the input read-only", () => {
      render(<InlineAction defaultValue="a@b.dev" readonly />);
      expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("readonly does not fire onAction", () => {
      const onAction = vi.fn();
      render(<InlineAction defaultValue="a@b.dev" readonly onAction={onAction} />);
      fireEvent.click(screen.getByRole("button"));
      expect(onAction).not.toHaveBeenCalled();
    });
  });

  it("shows the message caption only when provided, with state-based color", () => {
    const { container, rerender } = render(<InlineAction defaultValue="a@b.dev" />);
    expect(container.querySelector(".okryshto-inline-action__message")).not.toBeInTheDocument();

    rerender(
      <InlineAction
        defaultValue="a@b.dev"
        state="error"
        message="That address doesn't look right"
      />,
    );
    const msg = container.querySelector(".okryshto-inline-action__message");
    expect(msg).toHaveTextContent("That address doesn't look right");
    expect(msg).toHaveClass("okryshto-inline-action__message--error");
  });

  it("applies a color modifier only when color is explicitly set (default = inherit section tone)", () => {
    const { container, rerender } = render(<InlineAction defaultValue="a@b.dev" />);
    expect(container.querySelector(".okryshto-inline-action")?.className).not.toMatch(
      /okryshto-inline-action--color-/,
    );

    rerender(<InlineAction defaultValue="a@b.dev" color="dante" />);
    expect(container.querySelector(".okryshto-inline-action")).toHaveClass(
      "okryshto-inline-action--color-dante",
    );
  });

  it("applies a fill modifier only for non-filled fills", () => {
    const { container, rerender } = render(<InlineAction defaultValue="a@b.dev" fill="glass" />);
    expect(container.querySelector(".okryshto-inline-action")).toHaveClass(
      "okryshto-inline-action--fill-glass",
    );

    rerender(<InlineAction defaultValue="a@b.dev" fill="filled" />);
    expect(container.querySelector(".okryshto-inline-action")?.className).not.toMatch(
      /okryshto-inline-action--fill-/,
    );
  });

  it("applies a size modifier only for non-medium sizes", () => {
    const { container, rerender } = render(<InlineAction defaultValue="a@b.dev" size="small" />);
    expect(container.querySelector(".okryshto-inline-action")).toHaveClass(
      "okryshto-inline-action--small",
    );

    rerender(<InlineAction defaultValue="a@b.dev" size="medium" />);
    expect(container.querySelector(".okryshto-inline-action")?.className).not.toMatch(
      /okryshto-inline-action--(small|large)/,
    );
  });

  it("forwards a ref to the <input> element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<InlineAction ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
