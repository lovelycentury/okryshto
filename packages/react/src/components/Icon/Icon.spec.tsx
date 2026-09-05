import { render, screen } from "@testing-library/react";
import { iconStar } from "@okkly/icons";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Icon, ICON_NAMES } from "./Icon";

/**
 * The DOM rewrites the source markup as it parses it (`<path />` becomes
 * `<path></path>`), so comparing against the raw string would always fail —
 * parse both sides and compare what the browser actually produced.
 */
function asParsed(markup: string) {
  const host = document.createElement("div");
  host.innerHTML = markup;
  return host.innerHTML;
}

describe("Icon", () => {
  it("renders a decorative icon with no modifier classes by default", () => {
    const { container } = render(<Icon name="iconStar" />);
    const icon = container.firstChild as HTMLElement;

    expect(icon.tagName).toBe("SPAN");
    expect(icon).toHaveClass("okkly-component", "okkly-icon");
    expect(icon.className).not.toMatch(/okkly-icon--/);
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon.querySelector("svg")).toBeInTheDocument();
  });

  it("resolves `name` to the markup published by @okkly/icons", () => {
    const { container } = render(<Icon name="iconStar" />);
    expect((container.firstChild as HTMLElement).innerHTML).toBe(asParsed(iconStar));
  });

  it("renders markup handed to `icon` directly", () => {
    const { container } = render(<Icon icon={iconStar} />);
    expect((container.firstChild as HTMLElement).innerHTML).toBe(asParsed(iconStar));
  });

  it("renders the same output whether the icon arrives by name or by value", () => {
    const { container: byName } = render(<Icon name="iconStar" />);
    const { container: byValue } = render(<Icon icon={iconStar} />);
    expect(byName.innerHTML).toBe(byValue.innerHTML);
  });

  it("exposes every icon in the package through ICON_NAMES", () => {
    expect(ICON_NAMES).toContain("iconStar");
    expect(ICON_NAMES.length).toBeGreaterThan(100);
    expect(ICON_NAMES.every((name) => name.startsWith("icon"))).toBe(true);
  });

  it("applies size modifiers and clears them back to the default", () => {
    const { container, rerender } = render(<Icon name="iconStar" fontSize="small" />);
    expect(container.firstChild).toHaveClass("okkly-icon--small");

    rerender(<Icon name="iconStar" fontSize="large" />);
    expect(container.firstChild).toHaveClass("okkly-icon--large");

    rerender(<Icon name="iconStar" fontSize="inherit" />);
    expect(container.firstChild).toHaveClass("okkly-icon--inherit");

    rerender(<Icon name="iconStar" fontSize="medium" />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/okkly-icon--/);
  });

  it("applies colour modifiers and clears them back to inherit", () => {
    const { container, rerender } = render(<Icon name="iconStar" color="danger" />);
    expect(container.firstChild).toHaveClass("okkly-icon--color-danger");

    rerender(<Icon name="iconStar" color="inherit" />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/okkly-icon--color-/);
  });

  it("becomes an image with a name once titleAccess is given", () => {
    render(<Icon name="iconStar" titleAccess="Favourite" />);
    const icon = screen.getByRole("img", { name: "Favourite" });

    expect(icon).toBeInTheDocument();
    expect(icon).not.toHaveAttribute("aria-hidden");
  });

  it("forwards the ref and passes unknown props through", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Icon name="iconStar" ref={ref} data-testid="glyph" className="custom" />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(screen.getByTestId("glyph")).toHaveClass("custom");
  });
});
