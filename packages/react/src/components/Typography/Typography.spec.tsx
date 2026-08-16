import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Typography, TYPOGRAPHY_VARIANTS } from "./Typography";

describe("Typography", () => {
  it("renders body-md as a paragraph with no modifier classes", () => {
    const { container } = render(<Typography>Copy</Typography>);
    const node = container.firstChild as HTMLElement;

    expect(node.tagName).toBe("P");
    expect(node).toHaveClass("okryshto-component", "okryshto-typography");
    expect(node.className).not.toMatch(/okryshto-typography--/);
  });

  it("maps every variant to its default element", () => {
    for (const [variant, tag] of Object.entries(TYPOGRAPHY_VARIANTS)) {
      const { container, unmount } = render(
        <Typography variant={variant as keyof typeof TYPOGRAPHY_VARIANTS}>Text</Typography>,
      );
      expect((container.firstChild as HTMLElement).tagName).toBe(tag.toUpperCase());
      unmount();
    }
  });

  it("applies the variant modifier for every step except the default", () => {
    const { container, rerender } = render(<Typography variant="display-2xl">Hero</Typography>);
    expect(container.firstChild).toHaveClass("okryshto-typography--display-2xl");

    rerender(<Typography variant="overline">Eyebrow</Typography>);
    expect(container.firstChild).toHaveClass("okryshto-typography--overline");
    expect((container.firstChild as HTMLElement).className).not.toMatch(/--display-2xl/);

    rerender(<Typography variant="body-md">Copy</Typography>);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/okryshto-typography--/);
  });

  it("renders the element given to `as` instead of the variant default", () => {
    const { container } = render(
      <Typography variant="h1" as="div">
        Heading that is not an h1
      </Typography>,
    );
    const node = container.firstChild as HTMLElement;

    expect(node.tagName).toBe("DIV");
    expect(node).toHaveClass("okryshto-typography--h1");
  });

  it("accepts the props of the element it renders as", () => {
    render(
      <Typography as="a" href="https://okryshto.dev" variant="label-md">
        Link
      </Typography>,
    );
    expect(screen.getByRole("link", { name: "Link" })).toHaveAttribute(
      "href",
      "https://okryshto.dev",
    );
  });

  it("applies colour, alignment and layout modifiers", () => {
    const { container, rerender } = render(
      <Typography color="danger" align="center" gutterBottom noWrap>
        Copy
      </Typography>,
    );
    expect(container.firstChild).toHaveClass(
      "okryshto-typography--color-danger",
      "okryshto-typography--align-center",
      "okryshto-typography--gutter-bottom",
      "okryshto-typography--no-wrap",
    );

    rerender(<Typography>Copy</Typography>);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/okryshto-typography--/);
  });

  it("forwards the ref to the rendered element", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Typography variant="h2" ref={ref}>
        Section
      </Typography>,
    );
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});
