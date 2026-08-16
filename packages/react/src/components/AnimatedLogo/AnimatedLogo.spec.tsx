import { createRef } from "react";
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnimatedLogo } from "./AnimatedLogo";

afterEach(() => {
  vi.useRealTimers();
});

describe("AnimatedLogo", () => {
  it("renders the emblem svg", () => {
    const { container } = render(<AnimatedLogo />);
    expect(container.querySelector(".okryshto-animated-logo__svg")).toBeInTheDocument();
  });

  it("renders the orb, rings and orbit markers", () => {
    const { container } = render(<AnimatedLogo />);
    expect(container.querySelectorAll(".okryshto-animated-logo__ring")).toHaveLength(3);
    expect(container.querySelectorAll(".okryshto-animated-logo__marker")).toHaveLength(2);
    expect(container.querySelector(".okryshto-animated-logo__orb")).toBeInTheDocument();
  });

  it("drives its diameter from the size prop", () => {
    const { container } = render(<AnimatedLogo size={96} />);
    expect(container.firstChild).toHaveStyle("--okryshto-animated-logo-size: 96px");
  });

  it("accepts a css length for size", () => {
    const { container } = render(<AnimatedLogo size="12rem" />);
    expect(container.firstChild).toHaveStyle("--okryshto-animated-logo-size: 12rem");
  });

  it("publishes every timing as a custom property", () => {
    const { container } = render(
      <AnimatedLogo
        introDuration={1000}
        outroDuration={500}
        spinDuration={9000}
        orbitDuration={8000}
        breatheDuration={7000}
        pulseDuration={600}
        shimmerDuration={1500}
        heartbeatDuration={2000}
      />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveStyle("--okryshto-animated-logo-intro: 1000ms");
    expect(root).toHaveStyle("--okryshto-animated-logo-outro: 500ms");
    expect(root).toHaveStyle("--okryshto-animated-logo-spin: 9000ms");
    expect(root).toHaveStyle("--okryshto-animated-logo-orbit: 8000ms");
    expect(root).toHaveStyle("--okryshto-animated-logo-breathe: 7000ms");
    expect(root).toHaveStyle("--okryshto-animated-logo-pulse: 600ms");
    expect(root).toHaveStyle("--okryshto-animated-logo-shimmer: 1500ms");
    expect(root).toHaveStyle("--okryshto-animated-logo-heartbeat: 2000ms");
  });

  it("mirrors the reveal for the dissolve unless retimed", () => {
    const { container, rerender } = render(<AnimatedLogo introDuration={1800} />);
    expect(container.firstChild).toHaveStyle("--okryshto-animated-logo-outro: 1800ms");

    rerender(<AnimatedLogo introDuration={1800} outroDuration={600} />);
    expect(container.firstChild).toHaveStyle("--okryshto-animated-logo-outro: 600ms");
  });

  it("settles instead of looping in once mode", () => {
    const { container } = render(<AnimatedLogo mode="once" />);
    expect(container.firstChild).toHaveClass("okryshto-animated-logo--once");
  });

  it("loops by default", () => {
    const { container } = render(<AnimatedLogo />);
    expect(container.firstChild).not.toHaveClass("okryshto-animated-logo--once");
  });

  it("walks reveal → dissolve → gap → reveal in cycle mode", () => {
    vi.useFakeTimers();
    const onCycleComplete = vi.fn();
    const { container } = render(
      <AnimatedLogo
        mode="cycle"
        introDuration={1000}
        holdDuration={500}
        outroDuration={400}
        gapDuration={200}
        onCycleComplete={onCycleComplete}
      />,
    );
    const root = container.firstChild as HTMLElement;

    // revealing and holding
    expect(root).not.toHaveClass("okryshto-animated-logo--out");
    act(() => void vi.advanceTimersByTime(1500));
    expect(root).toHaveClass("okryshto-animated-logo--out");

    // dissolved, waiting out the dark beat
    act(() => void vi.advanceTimersByTime(400));
    expect(root).toHaveClass("okryshto-animated-logo--gap");

    // back to the reveal, one cycle counted
    act(() => void vi.advanceTimersByTime(200));
    expect(root).not.toHaveClass("okryshto-animated-logo--gap");
    expect(root).not.toHaveClass("okryshto-animated-logo--out");
    expect(onCycleComplete).toHaveBeenCalledWith(1);
  });

  it("never leaves the reveal in loop mode", () => {
    vi.useFakeTimers();
    const { container } = render(<AnimatedLogo introDuration={100} />);
    act(() => void vi.advanceTimersByTime(60000));
    expect(container.firstChild).not.toHaveClass("okryshto-animated-logo--out");
  });

  it("holds the cycle while paused", () => {
    vi.useFakeTimers();
    const { container } = render(
      <AnimatedLogo mode="cycle" paused introDuration={100} holdDuration={100} />,
    );
    act(() => void vi.advanceTimersByTime(10000));
    expect(container.firstChild).toHaveClass("okryshto-animated-logo--paused");
    expect(container.firstChild).not.toHaveClass("okryshto-animated-logo--out");
  });

  it("waits out startDelay before showing anything", () => {
    vi.useFakeTimers();
    const { container } = render(<AnimatedLogo startDelay={800} />);
    expect(container.querySelector("svg")).toBeNull();
    act(() => void vi.advanceTimersByTime(800));
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("quiets micro-motion below 64px", () => {
    const { container } = render(<AnimatedLogo size={40} />);
    expect(container.firstChild).toHaveClass("okryshto-animated-logo--quiet");
  });

  it("drops parts that are switched off", () => {
    const { container } = render(
      <AnimatedLogo
        showRings={false}
        showMarkers={false}
        showGlyphs={false}
        showWireframe={false}
        showGrid={false}
        showBackdrop={false}
      />,
    );
    expect(container.querySelector(".okryshto-animated-logo__ring")).toBeNull();
    expect(container.querySelector(".okryshto-animated-logo__marker")).toBeNull();
    expect(container.querySelector(".okryshto-animated-logo__glyphs")).toBeNull();
    expect(container.querySelector(".okryshto-animated-logo__wire")).toBeNull();
    expect(container.querySelector(".okryshto-animated-logo__grid")).toBeNull();
    expect(container.querySelector(".okryshto-animated-logo__backdrop")).toBeNull();
    // the orb itself always stays
    expect(container.querySelector(".okryshto-animated-logo__orb")).toBeInTheDocument();
  });

  it("is decorative without a title", () => {
    const { container } = render(<AnimatedLogo />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes an accessible name when titled", () => {
    const { getByRole } = render(<AnimatedLogo title="Loading okryshto.dev" />);
    expect(getByRole("img", { name: "Loading okryshto.dev" })).toBeInTheDocument();
  });

  it("gives each instance its own gradient ids", () => {
    const { container } = render(
      <>
        <AnimatedLogo />
        <AnimatedLogo />
      </>,
    );
    const ids = Array.from(container.querySelectorAll("linearGradient")).map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("forwards ref to the wrapper", () => {
    const ref = createRef<HTMLDivElement>();
    render(<AnimatedLogo ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies a custom className", () => {
    const { container } = render(<AnimatedLogo className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});
