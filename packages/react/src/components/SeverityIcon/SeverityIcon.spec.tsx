import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SeverityIcon } from "./SeverityIcon";

describe("SeverityIcon", () => {
  it("renders with default classes (info severity, medium size, circle shape)", () => {
    const { container } = render(<SeverityIcon />);
    const root = container.querySelector(".okkly-severity-icon");
    expect(root).toHaveClass("okkly-component", "okkly-severity-icon");
    expect(root?.className).not.toMatch(
      /okkly-severity-icon--(success|warning|danger|primary|neutral|small|large|rounded)/,
    );
    expect(container.querySelector(".okkly-severity-icon__icon svg")).toBeInTheDocument();
  });

  it("applies a severity modifier only for non-info severities", () => {
    const { container, rerender } = render(<SeverityIcon severity="success" />);
    expect(container.querySelector(".okkly-severity-icon")).toHaveClass(
      "okkly-severity-icon--success",
    );

    rerender(<SeverityIcon severity="info" />);
    expect(container.querySelector(".okkly-severity-icon")?.className).not.toMatch(
      /okkly-severity-icon--(success|warning|danger|primary|neutral)/,
    );
  });

  it("applies size modifiers only for non-medium sizes", () => {
    const { container, rerender } = render(<SeverityIcon size="small" />);
    expect(container.querySelector(".okkly-severity-icon")).toHaveClass(
      "okkly-severity-icon--small",
    );

    rerender(<SeverityIcon size="medium" />);
    expect(container.querySelector(".okkly-severity-icon")?.className).not.toMatch(
      /okkly-severity-icon--(small|large)/,
    );
  });

  it("applies the rounded shape modifier", () => {
    const { container } = render(<SeverityIcon shape="rounded" />);
    expect(container.querySelector(".okkly-severity-icon")).toHaveClass(
      "okkly-severity-icon--rounded",
    );
  });

  it("renders a custom icon override", () => {
    const { container } = render(<SeverityIcon icon={<span data-testid="custom">★</span>} />);
    expect(container.querySelector("[data-testid='custom']")).toBeInTheDocument();
    expect(container.querySelector(".okkly-severity-icon__icon svg")).not.toBeInTheDocument();
  });

  it("picks distinct default icons per severity", () => {
    const { container, rerender } = render(<SeverityIcon severity="success" />);
    expect(
      container.querySelector(".okkly-severity-icon__icon svg path")?.getAttribute("d"),
    ).toContain("9 17");

    rerender(<SeverityIcon severity="danger" />);
    expect(
      container.querySelector(".okkly-severity-icon__icon svg path")?.getAttribute("d"),
    ).toContain("6 18");
  });
});
