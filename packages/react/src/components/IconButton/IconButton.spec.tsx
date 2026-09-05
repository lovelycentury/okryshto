import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("renders as a square icon button by default with no variant modifier", () => {
    render(<IconButton icon={<span data-testid="icon" />} aria-label="Add" />);
    const button = screen.getByRole("button", { name: "Add" });
    expect(button).toHaveClass("okkly-component", "okkly-icon-button");
    expect(button.className).not.toMatch(/okkly-icon-button--(ghost|glass|solid)/);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("accepts children when icon is omitted", () => {
    render(<IconButton aria-label="Add">{<span data-testid="child-icon" />}</IconButton>);
    expect(screen.getByTestId("child-icon")).toBeInTheDocument();
  });

  it("applies variant modifiers only for non-ghost variants", () => {
    const { rerender } = render(<IconButton icon={<span />} aria-label="Add" variant="glass" />);
    expect(screen.getByRole("button")).toHaveClass("okkly-icon-button--glass");

    rerender(<IconButton icon={<span />} aria-label="Add" variant="solid" />);
    expect(screen.getByRole("button")).toHaveClass("okkly-icon-button--solid");

    rerender(<IconButton icon={<span />} aria-label="Add" variant="ghost" />);
    expect(screen.getByRole("button").className).not.toMatch(
      /okkly-icon-button--(ghost|glass|solid)/,
    );
  });

  it("applies a color modifier only for non-default colors", () => {
    const { rerender } = render(<IconButton icon={<span />} aria-label="Add" color="dante" />);
    expect(screen.getByRole("button")).toHaveClass("okkly-icon-button--color-dante");

    rerender(<IconButton icon={<span />} aria-label="Add" color="primary" />);
    expect(screen.getByRole("button").className).not.toMatch(/okkly-icon-button--color-/);
  });

  it("applies a size modifier only for non-medium sizes", () => {
    const { rerender } = render(<IconButton icon={<span />} aria-label="Add" size="small" />);
    expect(screen.getByRole("button")).toHaveClass("okkly-icon-button--small");

    rerender(<IconButton icon={<span />} aria-label="Add" size="large" />);
    expect(screen.getByRole("button")).toHaveClass("okkly-icon-button--large");

    rerender(<IconButton icon={<span />} aria-label="Add" size="medium" />);
    expect(screen.getByRole("button").className).not.toMatch(/okkly-icon-button--(small|large)/);
  });

  it("fires onClick", () => {
    const onClick = vi.fn();
    render(<IconButton icon={<span />} aria-label="Add" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("forwards a ref to the <button> element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} icon={<span />} aria-label="Add" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  describe("disabled", () => {
    it("disables the button and skips the ripple overlay", () => {
      const { container } = render(<IconButton icon={<span />} aria-label="Add" disabled />);
      expect(screen.getByRole("button")).toBeDisabled();
      expect(container.querySelector(".okkly-ripple")).not.toBeInTheDocument();
    });
  });

  describe("href", () => {
    it("renders an <a> instead of a <button>", () => {
      render(<IconButton icon={<span />} aria-label="Add" href="https://okryshto.dev" />);
      const link = screen.getByRole("link", { name: "Add" });
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "https://okryshto.dev");
    });

    it("drops href and marks aria-disabled when disabled", () => {
      const { container } = render(
        <IconButton icon={<span />} aria-label="Add" href="https://okryshto.dev" disabled />,
      );
      const link = container.querySelector(".okkly-icon-button");
      expect(link).not.toHaveAttribute("href");
      expect(link).toHaveAttribute("aria-disabled", "true");
    });

    it("forwards a ref to the <a> element", () => {
      const ref = createRef<HTMLAnchorElement>();
      render(<IconButton ref={ref} icon={<span />} aria-label="Add" href="https://okryshto.dev" />);
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });
  });
});
