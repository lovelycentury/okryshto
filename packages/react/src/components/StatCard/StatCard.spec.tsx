import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders value and label without modifiers by default", () => {
    const { container } = render(<StatCard value="42" label="Active users" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("okryshto-component", "okryshto-stat-card");
    expect(root.className).not.toMatch(/okryshto-stat-card--(sm|lg|accent|color-)/);
    expect(screen.getByText("42")).toHaveClass("okryshto-stat-card__value");
    expect(screen.getByText("Active users")).toHaveClass("okryshto-stat-card__label");
  });

  it("applies size, accent, and color modifiers", () => {
    const { container, rerender } = render(
      <StatCard value="1" label="Metric" size="sm" accent color="dante" />,
    );
    expect(container.firstChild).toHaveClass(
      "okryshto-stat-card--sm",
      "okryshto-stat-card--accent",
      "okryshto-stat-card--color-dante",
    );

    rerender(<StatCard value="1" label="Metric" size="lg" />);
    expect(container.firstChild).toHaveClass("okryshto-stat-card--lg");
    expect((container.firstChild as HTMLElement).className).not.toMatch(
      /okryshto-stat-card--accent/,
    );
  });

  it("renders trend badge direction", () => {
    const { rerender } = render(
      <StatCard value="100" label="Views" trend={{ value: "+5%", up: true }} />,
    );
    expect(screen.getByText("+5%").closest(".okryshto-stat-card__trend")).toHaveClass(
      "okryshto-stat-card__trend--up",
    );

    rerender(<StatCard value="100" label="Views" trend={{ value: "-2%", up: false }} />);
    expect(screen.getByText("-2%").closest(".okryshto-stat-card__trend")).toHaveClass(
      "okryshto-stat-card__trend--down",
    );
  });

  it("renders icon and description slots", () => {
    render(
      <StatCard
        value="9"
        label="Score"
        description="Last 30 days"
        icon={<span data-testid="icon">★</span>}
      />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toHaveClass("okryshto-stat-card__description");
  });
});
