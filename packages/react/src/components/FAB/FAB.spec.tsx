import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Fab } from "./FAB";

describe("Fab", () => {
  it("renders as a circular icon button by default", () => {
    render(<Fab icon={<span data-testid="icon" />} aria-label="Add" />);
    const button = screen.getByRole("button", { name: "Add" });
    expect(button).toHaveClass("okkly-component", "okkly-fab");
    expect(button.className).not.toContain("okkly-fab--extended");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies the color modifier only for non-default colors", () => {
    const { rerender } = render(<Fab icon={<span />} aria-label="Add" color="dante" />);
    expect(screen.getByRole("button")).toHaveClass("okkly-fab--color-dante");

    rerender(<Fab icon={<span />} aria-label="Add" color="primary" />);
    expect(screen.getByRole("button").className).not.toMatch(/okkly-fab--color-/);
  });

  it("applies the soft variant modifier", () => {
    render(<Fab icon={<span />} aria-label="Edit" variant="soft" />);
    expect(screen.getByRole("button")).toHaveClass("okkly-fab--soft");
  });

  it("applies a size modifier only for non-medium sizes", () => {
    const { rerender } = render(<Fab icon={<span />} aria-label="Add" size="small" />);
    expect(screen.getByRole("button")).toHaveClass("okkly-fab--small");

    rerender(<Fab icon={<span />} aria-label="Add" size="medium" />);
    expect(screen.getByRole("button").className).not.toMatch(/okkly-fab--(small|large)/);
  });

  it("becomes an extended pill and shows the label once one is set", () => {
    render(<Fab icon={<span />} label="New track" />);
    const button = screen.getByRole("button", { name: "New track" });
    expect(button).toHaveClass("okkly-fab--extended");
    expect(screen.getByText("New track")).toBeInTheDocument();
  });

  it("fires onClick", () => {
    const onClick = vi.fn();
    render(<Fab icon={<span />} aria-label="Add" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("forwards a ref to the <button> element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Fab ref={ref} icon={<span />} aria-label="Add" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  describe("disabled", () => {
    it("disables the button and skips the ripple overlay", () => {
      const { container } = render(<Fab icon={<span />} aria-label="Add" disabled />);
      expect(screen.getByRole("button")).toBeDisabled();
      expect(container.querySelector(".okkly-ripple")).not.toBeInTheDocument();
    });
  });

  describe("href", () => {
    it("renders an <a> instead of a <button>", () => {
      render(<Fab icon={<span />} aria-label="Add" href="https://okryshto.dev" />);
      const link = screen.getByRole("link", { name: "Add" });
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "https://okryshto.dev");
    });

    it("drops href and marks aria-disabled when disabled", () => {
      // An <a> without href has no accessible "link" role — query the DOM directly instead.
      const { container } = render(
        <Fab icon={<span />} aria-label="Add" href="https://okryshto.dev" disabled />,
      );
      const link = container.querySelector(".okkly-fab");
      expect(link).not.toHaveAttribute("href");
      expect(link).toHaveAttribute("aria-disabled", "true");
    });

    it("forwards a ref to the <a> element", () => {
      const ref = createRef<HTMLAnchorElement>();
      render(<Fab ref={ref} icon={<span />} aria-label="Add" href="https://okryshto.dev" />);
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });
  });
});
