import { createRef } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnimatedBackground } from "./AnimatedBackground";

describe("AnimatedBackground", () => {
  it("renders the scene svg once mounted on the client", () => {
    const { container } = render(<AnimatedBackground />);
    expect(container.querySelector(".okkly-animated-background__svg")).toBeInTheDocument();
  });

  it("draws every layer", () => {
    const { container } = render(<AnimatedBackground />);
    expect(container.querySelectorAll(".okkly-animated-background__cloud").length).toBeGreaterThan(
      0,
    );
    expect(container.querySelectorAll(".okkly-animated-background__star").length).toBeGreaterThan(
      0,
    );
    expect(container.querySelectorAll(".okkly-animated-background__beacon").length).toBeGreaterThan(
      0,
    );
    expect(container.querySelectorAll(".okkly-animated-background__spark").length).toBeGreaterThan(
      0,
    );
    expect(container.querySelector(".okkly-animated-background__grain")).toBeInTheDocument();
  });

  it("defaults to aurora without a preset modifier", () => {
    const { container } = render(<AnimatedBackground />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("okkly-animated-background");
    expect(root.className).not.toMatch(/okkly-animated-background--(midnight|neon|void)/);
  });

  it("applies the preset modifier", () => {
    const { container } = render(<AnimatedBackground preset="neon" />);
    expect(container.firstChild).toHaveClass("okkly-animated-background--neon");
  });

  it("scales the star field with quality", () => {
    const { container: low } = render(<AnimatedBackground quality="low" />);
    const { container: high } = render(<AnimatedBackground quality="high" />);
    expect(high.querySelectorAll(".okkly-animated-background__star").length).toBeGreaterThan(
      low.querySelectorAll(".okkly-animated-background__star").length,
    );
  });

  it("drops the firework layer when disabled", () => {
    const { container: on } = render(<AnimatedBackground fireworks />);
    const { container: off } = render(<AnimatedBackground fireworks={false} />);
    expect(on.querySelectorAll(".okkly-animated-background__spoke").length).toBeGreaterThan(0);
    expect(off.querySelectorAll(".okkly-animated-background__spoke")).toHaveLength(0);
  });

  it("renders the scrim only when requested", () => {
    const { container, rerender } = render(<AnimatedBackground />);
    expect(container.querySelector(".okkly-animated-background__scrim")).not.toBeInTheDocument();

    rerender(<AnimatedBackground scrim />);
    expect(container.querySelector(".okkly-animated-background__scrim")).toBeInTheDocument();
  });

  it("opts out of reduced motion with a modifier", () => {
    const { container } = render(<AnimatedBackground respectReducedMotion={false} />);
    expect(container.firstChild).toHaveClass("okkly-animated-background--force-motion");
  });

  it("renders children above the scene", () => {
    const { getByText } = render(
      <AnimatedBackground>
        <h1>Hero copy</h1>
      </AnimatedBackground>,
    );
    expect(getByText("Hero copy")).toBeInTheDocument();
  });

  it("keeps the star field stable between renders", () => {
    const positions = () =>
      Array.from(
        render(<AnimatedBackground />).container.querySelectorAll(
          ".okkly-animated-background__star",
        ),
      )
        .map((s) => `${s.getAttribute("cx")},${s.getAttribute("cy")}`)
        .join("|");
    expect(positions()).toBe(positions());
  });

  it("forwards the wrapper ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<AnimatedBackground ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("okkly-animated-background");
  });
});
