import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies the default classes (primary variant, pill shape, medium size)", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("okkly-component", "okkly-button", "okkly-button--primary");
    expect(button.className).not.toMatch(/okkly-button--color-/);
    expect(button.className).not.toMatch(/okkly-button--(small|large)/);
    expect(button.className).not.toContain("okkly-button--rounded");
  });

  it("applies the variant modifier", () => {
    render(<Button variant="ghost">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("okkly-button--ghost");
  });

  it("applies a color modifier only for non-default colors", () => {
    const { rerender } = render(<Button color="dante">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("okkly-button--color-dante");

    rerender(<Button color="primary">Click me</Button>);
    expect(screen.getByRole("button").className).not.toMatch(/okkly-button--color-/);
  });

  it("applies a size modifier only for non-medium sizes", () => {
    const { rerender } = render(<Button size="small">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("okkly-button--small");

    rerender(<Button size="medium">Click me</Button>);
    expect(screen.getByRole("button").className).not.toMatch(/okkly-button--(small|large)/);
  });

  it("applies the rounded shape modifier", () => {
    render(<Button shape="rounded">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("okkly-button--rounded");
  });

  it("applies the full-width modifier", () => {
    render(<Button fullWidth>Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("okkly-button--full-width");
  });

  it("renders start and end icons", () => {
    render(
      <Button
        startIcon={<span data-testid="start-icon" />}
        endIcon={<span data-testid="end-icon" />}
      >
        Click me
      </Button>,
    );
    expect(screen.getByTestId("start-icon")).toBeInTheDocument();
    expect(screen.getByTestId("end-icon")).toBeInTheDocument();
  });

  it("fires onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("forwards a ref to the <button> element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click me</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  describe("disabled", () => {
    it("disables the button and skips the ripple overlay", () => {
      const { container } = render(<Button disabled>Click me</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
      expect(container.querySelector(".okkly-ripple")).not.toBeInTheDocument();
    });
  });

  describe("loading", () => {
    it("disables the button and shows the spinner", () => {
      render(<Button loading>Click me</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
      expect(document.querySelector(".okkly-button__spinner")).toBeInTheDocument();
    });

    it("visually hides the label at the default (center) loading position", () => {
      render(<Button loading>Click me</Button>);
      expect(screen.getByText("Click me")).toHaveClass("okkly-button__label--hidden");
    });

    it("keeps the label visible for start/end loading positions", () => {
      render(
        <Button loading loadingPosition="start">
          Click me
        </Button>,
      );
      expect(screen.getByText("Click me")).not.toHaveClass("okkly-button__label--hidden");
    });
  });

  describe("disableRipple", () => {
    it("skips the ripple overlay even when enabled", () => {
      const { container } = render(<Button disableRipple>Click me</Button>);
      expect(container.querySelector(".okkly-ripple")).not.toBeInTheDocument();
    });

    it("renders the ripple overlay by default when enabled", () => {
      const { container } = render(<Button>Click me</Button>);
      expect(container.querySelector(".okkly-ripple")).toBeInTheDocument();
    });
  });

  describe("href", () => {
    it("renders an <a> instead of a <button>", () => {
      render(<Button href="https://okryshto.dev">Click me</Button>);
      const link = screen.getByRole("link", { name: "Click me" });
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "https://okryshto.dev");
    });

    it("drops href and marks aria-disabled when disabled", () => {
      // An <a> without href has no accessible "link" role — query by text instead.
      render(
        <Button href="https://okryshto.dev" disabled>
          Click me
        </Button>,
      );
      const link = screen.getByText("Click me").closest("a");
      expect(link).not.toHaveAttribute("href");
      expect(link).toHaveAttribute("aria-disabled", "true");
    });

    it("forwards a ref to the <a> element", () => {
      const ref = createRef<HTMLAnchorElement>();
      render(
        <Button href="https://okryshto.dev" ref={ref}>
          Click me
        </Button>,
      );
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });
  });
});
