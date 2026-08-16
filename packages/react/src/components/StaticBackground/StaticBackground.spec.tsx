import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StaticBackground } from "./StaticBackground";

describe("StaticBackground", () => {
  it("renders the scene svg synchronously, with no mount step", () => {
    const { container } = render(<StaticBackground />);
    expect(container.querySelector(".okryshto-static-background__svg")).toBeInTheDocument();
  });

  it("draws every layer", () => {
    const { container } = render(<StaticBackground />);
    expect(container.querySelectorAll(".okryshto-static-background__cloud").length).toBeGreaterThan(
      0,
    );
    expect(container.querySelectorAll(".okryshto-static-background__star").length).toBeGreaterThan(
      0,
    );
    expect(container.querySelector(".okryshto-static-background__grain")).toBeInTheDocument();
    expect(container.querySelector(".okryshto-static-background__bloom")).toBeInTheDocument();
  });

  it("renders to static markup with no client APIs involved", () => {
    const server = renderToStaticMarkup(<StaticBackground preset="neon" quality="high" scrim />);
    expect(server).toContain('class="okryshto-component okryshto-static-background');
    expect(server).toContain("okryshto-static-background__scrim");
  });

  it("defaults to aurora without a preset modifier", () => {
    const { container } = render(<StaticBackground />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("okryshto-static-background");
    expect(root.className).not.toMatch(/okryshto-static-background--(midnight|neon|void)/);
  });

  it("applies the preset modifier", () => {
    const { container } = render(<StaticBackground preset="neon" />);
    expect(container.firstChild).toHaveClass("okryshto-static-background--neon");
  });

  it("scales the star field with quality", () => {
    const { container: low } = render(<StaticBackground quality="low" />);
    const { container: high } = render(<StaticBackground quality="high" />);
    expect(high.querySelectorAll(".okryshto-static-background__star").length).toBeGreaterThan(
      low.querySelectorAll(".okryshto-static-background__star").length,
    );
  });

  it("renders the scrim only when requested", () => {
    const { container, rerender } = render(<StaticBackground />);
    expect(container.querySelector(".okryshto-static-background__scrim")).not.toBeInTheDocument();

    rerender(<StaticBackground scrim />);
    expect(container.querySelector(".okryshto-static-background__scrim")).toBeInTheDocument();
  });

  it("renders children above the scene", () => {
    const { getByText } = render(
      <StaticBackground>
        <h1>Hero copy</h1>
      </StaticBackground>,
    );
    expect(getByText("Hero copy")).toBeInTheDocument();
  });

  it("keeps the star field stable between renders", () => {
    const positions = () =>
      Array.from(
        render(<StaticBackground />).container.querySelectorAll(
          ".okryshto-static-background__star",
        ),
      )
        .map((s) => `${s.getAttribute("cx")},${s.getAttribute("cy")}`)
        .join("|");
    expect(positions()).toBe(positions());
  });

  it("forwards the wrapper ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<StaticBackground ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("okryshto-static-background");
  });
});
