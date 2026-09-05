import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No results" description="Try a different query." />);
    expect(screen.getByRole("heading", { level: 4, name: "No results" })).toBeInTheDocument();
    expect(screen.getByText("Try a different query.")).toBeInTheDocument();
  });

  it("applies default classes without modifiers", () => {
    const { container } = render(<EmptyState title="Empty" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("okkly-component", "okkly-empty-state");
    expect(root.className).not.toMatch(/okkly-empty-state--(small|large|dante|indigo|danger)/);
  });

  it("applies size modifiers for non-medium sizes", () => {
    const { container, rerender } = render(<EmptyState title="Empty" size="small" />);
    expect(container.firstChild).toHaveClass("okkly-empty-state--small");

    rerender(<EmptyState title="Empty" size="large" />);
    expect(container.firstChild).toHaveClass("okkly-empty-state--large");

    rerender(<EmptyState title="Empty" size="medium" />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/okkly-empty-state--small/);
  });

  it("applies color modifiers and renders action slot", () => {
    render(
      <EmptyState title="Empty" color="dante" action={<button type="button">Create</button>} />,
    );
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
    expect(screen.getByText("Empty").closest(".okkly-empty-state")).toHaveClass(
      "okkly-empty-state--dante",
    );
  });

  it("renders a custom icon", () => {
    render(<EmptyState title="Empty" icon={<span data-testid="custom-icon">★</span>} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
