import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("renders a horizontal divider by default", () => {
    const { container } = render(<Divider />);
    const divider = container.firstChild as HTMLElement;
    expect(divider.tagName).toBe("HR");
    expect(divider).toHaveClass("okkly-component", "okkly-divider", "okkly-divider--horizontal");
    expect(divider.className).not.toMatch(/okkly-divider--(vertical|inset|middle)/);
  });

  it("renders a labeled divider as a separator with children", () => {
    render(<Divider>OR</Divider>);
    expect(screen.getByRole("separator")).toHaveTextContent("OR");
    expect(screen.getByRole("separator")).toHaveClass("okkly-divider--with-label");
  });

  it("renders vertical orientation", () => {
    const { container } = render(<Divider orientation="vertical" flexItem />);
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveClass("okkly-divider--vertical", "okkly-divider--flex-item");
  });

  it("applies variant modifiers", () => {
    const { container, rerender } = render(<Divider variant="inset" />);
    expect(container.firstChild).toHaveClass("okkly-divider--inset");

    rerender(<Divider variant="middle" />);
    expect(container.firstChild).toHaveClass("okkly-divider--middle");

    rerender(<Divider variant="fullWidth" />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/okkly-divider--inset/);
  });

  it("applies textAlign modifier for labeled dividers", () => {
    render(<Divider textAlign="left">Left</Divider>);
    expect(screen.getByRole("separator")).toHaveClass("okkly-divider--align-left");
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLElement>();
    render(<Divider ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLHRElement);
  });
});
