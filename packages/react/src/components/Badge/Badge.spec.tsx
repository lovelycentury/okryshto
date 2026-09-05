import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "../Avatar/Avatar";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders a standalone neutral pill by default", () => {
    render(<Badge badgeContent={5} />);
    const badge = screen.getByTestId("badge-content");
    expect(badge).toHaveTextContent("5");
    expect(badge.closest(".okkly-badge")).toHaveClass(
      "okkly-component",
      "okkly-badge",
      "okkly-badge--standalone",
    );
    expect(badge.closest(".okkly-badge")?.className).not.toMatch(/okkly-badge--color-/);
  });

  it("applies a color modifier only when color is set", () => {
    const { container, rerender } = render(<Badge badgeContent={3} color="danger" />);
    expect(container.querySelector(".okkly-badge")).toHaveClass("okkly-badge--color-danger");

    rerender(<Badge badgeContent={3} />);
    expect(container.querySelector(".okkly-badge")?.className).not.toMatch(/okkly-badge--color-/);
  });

  it("caps numeric overflow at max+", () => {
    render(<Badge badgeContent={120} max={99} color="danger" />);
    expect(screen.getByTestId("badge-content")).toHaveTextContent("99+");
  });

  it("hides zero counts", () => {
    render(<Badge badgeContent={0} />);
    expect(screen.getByTestId("badge-content")).toHaveClass("okkly-badge__content--invisible");
  });

  it("renders a dot variant without text", () => {
    render(<Badge variant="dot" color="success" />);
    const badge = screen.getByTestId("badge-content");
    expect(badge).toHaveClass("okkly-badge__content--dot");
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
    expect(screen.getByTestId("badge-content").closest(".okkly-badge")).not.toHaveClass(
      "okkly-badge--standalone",
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
    const root = screen.getByTestId("badge-content").closest(".okkly-badge");
    expect(root).toHaveClass("okkly-badge--overlap-rectangular");
    expect(screen.getByTestId("badge-content")).toHaveClass(
      "okkly-badge__content--bottom",
      "okkly-badge__content--left",
    );
  });

  it("hides the badge when invisible", () => {
    render(<Badge badgeContent={4} invisible />);
    expect(screen.getByTestId("badge-content")).toHaveClass("okkly-badge__content--invisible");
  });
});
