import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "../Avatar/Avatar";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders a standalone neutral pill by default", () => {
    render(<Badge badgeContent={5} />);
    const badge = screen.getByTestId("badge-content");
    expect(badge).toHaveTextContent("5");
    expect(badge.closest(".okryshto-badge")).toHaveClass(
      "okryshto-component",
      "okryshto-badge",
      "okryshto-badge--standalone",
    );
    expect(badge.closest(".okryshto-badge")?.className).not.toMatch(/okryshto-badge--color-/);
  });

  it("applies a color modifier only when color is set", () => {
    const { container, rerender } = render(<Badge badgeContent={3} color="danger" />);
    expect(container.querySelector(".okryshto-badge")).toHaveClass("okryshto-badge--color-danger");

    rerender(<Badge badgeContent={3} />);
    expect(container.querySelector(".okryshto-badge")?.className).not.toMatch(
      /okryshto-badge--color-/,
    );
  });

  it("caps numeric overflow at max+", () => {
    render(<Badge badgeContent={120} max={99} color="danger" />);
    expect(screen.getByTestId("badge-content")).toHaveTextContent("99+");
  });

  it("hides zero counts", () => {
    render(<Badge badgeContent={0} />);
    expect(screen.getByTestId("badge-content")).toHaveClass("okryshto-badge__content--invisible");
  });

  it("renders a dot variant without text", () => {
    render(<Badge variant="dot" color="success" />);
    const badge = screen.getByTestId("badge-content");
    expect(badge).toHaveClass("okryshto-badge__content--dot");
    expect(badge).toBeEmptyDOMElement();
  });

  it("anchors to children", () => {
    render(
      <Badge badgeContent={2} color="primary">
        <Avatar initials="OK" />
      </Badge>,
    );
    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByTestId("badge-content")).toHaveTextContent("2");
    expect(screen.getByTestId("badge-content").closest(".okryshto-badge")).not.toHaveClass(
      "okryshto-badge--standalone",
    );
  });

  it("applies overlap and anchor origin classes", () => {
    render(
      <Badge
        badgeContent={1}
        overlap="rectangular"
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <span>Anchor</span>
      </Badge>,
    );
    const root = screen.getByTestId("badge-content").closest(".okryshto-badge");
    expect(root).toHaveClass("okryshto-badge--overlap-rectangular");
    expect(screen.getByTestId("badge-content")).toHaveClass(
      "okryshto-badge__content--bottom",
      "okryshto-badge__content--left",
    );
  });

  it("hides the badge when invisible", () => {
    render(<Badge badgeContent={4} invisible />);
    expect(screen.getByTestId("badge-content")).toHaveClass("okryshto-badge__content--invisible");
  });
});
