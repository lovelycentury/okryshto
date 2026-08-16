import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("renders a horizontal divider by default", () => {
    const { container } = render(<Divider />);
    const divider = container.firstChild as HTMLElement;
    expect(divider.tagName).toBe("HR");
    expect(divider).toHaveClass(
      "okryshto-component",
      "okryshto-divider",
      "okryshto-divider--horizontal",
    );
    expect(divider.className).not.toMatch(/okryshto-divider--(vertical|inset|middle)/);
  });

  it("renders a labeled divider as a separator with children", () => {
    render(<Divider>OR</Divider>);
    expect(screen.getByRole("separator")).toHaveTextContent("OR");
    expect(screen.getByRole("separator")).toHaveClass("okryshto-divider--with-label");
  });

  it("renders vertical orientation", () => {
    const { container } = render(<Divider orientation="vertical" flexItem />);
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveClass("okryshto-divider--vertical", "okryshto-divider--flex-item");
  });

  it("applies variant modifiers", () => {
    const { container, rerender } = render(<Divider variant="inset" />);
    expect(container.firstChild).toHaveClass("okryshto-divider--inset");

    rerender(<Divider variant="middle" />);
    expect(container.firstChild).toHaveClass("okryshto-divider--middle");

    rerender(<Divider variant="fullWidth" />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/okryshto-divider--inset/);
  });

  it("applies textAlign modifier for labeled dividers", () => {
    render(<Divider textAlign="left">Left</Divider>);
    expect(screen.getByRole("separator")).toHaveClass("okryshto-divider--align-left");
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLElement>();
    render(<Divider ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLHRElement);
  });
});
