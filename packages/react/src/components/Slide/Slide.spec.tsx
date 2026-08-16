import { createRef } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Slide } from "./Slide";

describe("Slide", () => {
  it("renders children when in=true", () => {
    render(
      <Slide in>
        <div>Slide content</div>
      </Slide>,
    );
    expect(screen.getByText("Slide content")).toBeInTheDocument();
  });

  it("applies direction class", () => {
    render(
      <Slide in direction="left">
        <div>Slide content</div>
      </Slide>,
    );
    expect(screen.getByText("Slide content")).toHaveClass("okryshto-slide--left");
  });

  it("unmounts children when in=false and unmountOnExit", () => {
    const { container } = render(
      <Slide in={false} unmountOnExit>
        <div>Slide content</div>
      </Slide>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("fires enter callbacks when opening", async () => {
    vi.useFakeTimers();
    const onEnter = vi.fn();
    const onEntered = vi.fn();
    const { rerender } = render(
      <Slide in={false} timeout={100} onEnter={onEnter} onEntered={onEntered}>
        <div>Slide content</div>
      </Slide>,
    );

    rerender(
      <Slide in timeout={100} onEnter={onEnter} onEntered={onEntered}>
        <div>Slide content</div>
      </Slide>,
    );

    expect(onEnter).toHaveBeenCalled();
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(onEntered).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("forwards ref to the child element", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Slide ref={ref} in>
        <div>Slide content</div>
      </Slide>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
