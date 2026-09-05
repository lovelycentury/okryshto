import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders its label", () => {
    render(<Chip label="Fintech" />);
    expect(screen.getByText("Fintech")).toBeInTheDocument();
  });

  it("applies the default classes (glass variant, medium size)", () => {
    render(<Chip label="Fintech" />);
    const chip = screen.getByText("Fintech").closest(".okkly-chip");
    expect(chip).toHaveClass("okkly-component", "okkly-chip");
    expect(chip?.className).not.toMatch(/okkly-chip--(solid|outline|accent|dante)/);
    expect(chip?.className).not.toMatch(/okkly-chip--(small|large)/);
  });

  it("applies the variant modifier only for non-default variants", () => {
    const { rerender } = render(<Chip label="Fintech" variant="dante" />);
    expect(screen.getByText("Fintech").closest(".okkly-chip")).toHaveClass("okkly-chip--dante");

    rerender(<Chip label="Fintech" variant="glass" />);
    expect(screen.getByText("Fintech").closest(".okkly-chip")?.className).not.toMatch(
      /okkly-chip--(solid|outline|accent|dante)/,
    );
  });

  it("applies a size modifier only for non-medium sizes", () => {
    const { rerender } = render(<Chip label="Fintech" size="small" />);
    expect(screen.getByText("Fintech").closest(".okkly-chip")).toHaveClass("okkly-chip--small");

    rerender(<Chip label="Fintech" size="medium" />);
    expect(screen.getByText("Fintech").closest(".okkly-chip")?.className).not.toMatch(
      /okkly-chip--(small|large)/,
    );
  });

  it("applies the selected modifier", () => {
    render(<Chip label="Fintech" selected />);
    expect(screen.getByText("Fintech").closest(".okkly-chip")).toHaveClass("okkly-chip--selected");
  });

  it("renders a leading dot", () => {
    const { container } = render(<Chip label="Available" dot />);
    expect(container.querySelector(".okkly-chip__dot")).toBeInTheDocument();
  });

  it("renders a leading icon and suppresses the dot", () => {
    const { container } = render(<Chip label="Starred" dot icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(container.querySelector(".okkly-chip__dot")).not.toBeInTheDocument();
  });

  describe("interactive", () => {
    it("is not a button without onClick", () => {
      render(<Chip label="Fintech" />);
      expect(screen.queryByRole("button", { name: "Fintech" })).not.toBeInTheDocument();
    });

    it("gets button semantics and fires onClick when clickable", () => {
      const onClick = vi.fn();
      render(<Chip label="Fintech" onClick={onClick} />);
      const chip = screen.getByRole("button", { name: "Fintech" });
      expect(chip).toHaveClass("okkly-chip--interactive");
      fireEvent.click(chip);
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("fires onClick on Enter and Space", () => {
      const onClick = vi.fn();
      render(<Chip label="Fintech" onClick={onClick} />);
      const chip = screen.getByRole("button", { name: "Fintech" });
      fireEvent.keyDown(chip, { key: "Enter" });
      fireEvent.keyDown(chip, { key: " " });
      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });

  describe("removable", () => {
    it("renders a trailing remove button and fires onRemove", () => {
      const onRemove = vi.fn();
      render(<Chip label="Mobile" removable onRemove={onRemove} />);
      fireEvent.click(screen.getByRole("button", { name: "Remove" }));
      expect(onRemove).toHaveBeenCalledOnce();
    });

    it("does not fire the chip's onClick when removing", () => {
      const onClick = vi.fn();
      const onRemove = vi.fn();
      render(<Chip label="Mobile" removable onClick={onClick} onRemove={onRemove} />);
      fireEvent.click(screen.getByRole("button", { name: "Remove" }));
      expect(onRemove).toHaveBeenCalledOnce();
      expect(onClick).not.toHaveBeenCalled();
    });

    it("uses a custom removeLabel", () => {
      render(<Chip label="Mobile" removable removeLabel="Remove Mobile" onRemove={() => {}} />);
      expect(screen.getByRole("button", { name: "Remove Mobile" })).toBeInTheDocument();
    });
  });

  describe("disabled", () => {
    it("marks the chip aria-disabled and drops button semantics", () => {
      const onClick = vi.fn();
      render(<Chip label="Fintech" onClick={onClick} disabled />);
      const chip = screen.getByText("Fintech").closest(".okkly-chip");
      expect(chip).toHaveAttribute("aria-disabled", "true");
      expect(chip).not.toHaveClass("okkly-chip--interactive");
      fireEvent.click(chip as Element);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("disables the remove button", () => {
      render(<Chip label="Mobile" removable disabled onRemove={() => {}} />);
      expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled();
    });
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Chip label="Fintech" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
