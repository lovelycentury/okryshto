import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LinkCard } from "./LinkCard";

describe("LinkCard", () => {
  it("renders the title, subtitle and meta", () => {
    render(
      <LinkCard title="Writing" subtitle="Notes on interface craft & systems" meta="essays" />,
    );
    expect(screen.getByText("Writing")).toBeInTheDocument();
    expect(screen.getByText("Notes on interface craft & systems")).toBeInTheDocument();
    expect(screen.getByText("essays")).toBeInTheDocument();
  });

  it("omits the subtitle when not provided", () => {
    render(<LinkCard title="Writing" />);
    expect(screen.queryByText(/Notes on/)).not.toBeInTheDocument();
  });

  it("renders an <a> when href is provided", () => {
    render(<LinkCard title="Writing" href="https://okryshto.dev/writing" />);
    const link = screen.getByRole("link", { name: /Writing/ });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://okryshto.dev/writing");
  });

  it("renders a <div> without href", () => {
    const { container } = render(<LinkCard title="Writing" />);
    expect(container.querySelector(".okryshto-link-card")?.tagName).toBe("DIV");
  });

  it("applies the featured modifier and renders a leading dot", () => {
    const { container } = render(<LinkCard title="Selected Work" featured />);
    expect(container.querySelector(".okryshto-link-card")).toHaveClass(
      "okryshto-link-card--featured",
    );
    expect(container.querySelector(".okryshto-link-card__dot")).toBeInTheDocument();
  });

  it("does not render a dot when not featured", () => {
    const { container } = render(<LinkCard title="Writing" />);
    expect(container.querySelector(".okryshto-link-card__dot")).not.toBeInTheDocument();
  });

  it("applies a color modifier only for non-primary colors", () => {
    const { container, rerender } = render(<LinkCard title="Writing" featured color="dante" />);
    expect(container.querySelector(".okryshto-link-card")).toHaveClass(
      "okryshto-link-card--color-dante",
    );

    rerender(<LinkCard title="Writing" featured color="primary" />);
    expect(container.querySelector(".okryshto-link-card")?.className).not.toMatch(
      /okryshto-link-card--color-/,
    );
  });

  it("applies a size modifier only for non-medium sizes", () => {
    const { container, rerender } = render(<LinkCard title="Writing" size="small" />);
    expect(container.querySelector(".okryshto-link-card")).toHaveClass("okryshto-link-card--small");

    rerender(<LinkCard title="Writing" size="medium" />);
    expect(container.querySelector(".okryshto-link-card")?.className).not.toMatch(
      /okryshto-link-card--(small|large)/,
    );
  });

  it("fires onClick on the anchor when href is set", () => {
    const onClick = vi.fn();
    render(<LinkCard title="Writing" href="https://okryshto.dev/writing" onClick={onClick} />);
    fireEvent.click(screen.getByRole("link", { name: /Writing/ }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  describe("without href, with onClick", () => {
    // Button, not link: there is no destination to go to, and the row answers to
    // Space, which links do not.
    it("gets button semantics and the interactive modifier", () => {
      const onClick = vi.fn();
      render(<LinkCard title="Writing" onClick={onClick} />);
      const card = screen.getByRole("button", { name: /Writing/ });
      expect(card).toHaveClass("okryshto-link-card--interactive");
      expect(card).toHaveAttribute("tabindex", "0");
      fireEvent.click(card);
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("fires onClick on Enter and Space", () => {
      const onClick = vi.fn();
      render(<LinkCard title="Writing" onClick={onClick} />);
      const card = screen.getByRole("button", { name: /Writing/ });
      fireEvent.keyDown(card, { key: "Enter" });
      fireEvent.keyDown(card, { key: " " });
      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });

  it("has no link/button semantics when static (no href, no onClick)", () => {
    render(<LinkCard title="Writing" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies a custom className", () => {
    const { container } = render(<LinkCard title="Writing" className="custom" />);
    expect(container.querySelector(".okryshto-link-card")).toHaveClass("custom");
  });
});
