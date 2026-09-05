import { createRef } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Zoom } from "./Zoom";

describe("Zoom", () => {
  it("renders children when in=true", () => {
    render(
      <Zoom in>
        <div>Zoom content</div>
      </Zoom>,
    );
    expect(screen.getByText("Zoom content")).toBeInTheDocument();
  });

  it("unmounts children when in=false and unmountOnExit", () => {
    const { container } = render(
      <Zoom in={false} unmountOnExit>
        <div>Zoom content</div>
      </Zoom>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("applies okkly-zoom class on the child", () => {
    render(
      <Zoom in>
        <div>Zoom content</div>
      </Zoom>,
    );
    expect(screen.getByText("Zoom content")).toHaveClass("okkly-zoom");
  });

  it("fires enter callbacks when opening", async () => {
    vi.useFakeTimers();
    const onEnter = vi.fn();
    const onEntered = vi.fn();
    const { rerender } = render(
      <Zoom in={false} timeout={100} onEnter={onEnter} onEntered={onEntered}>
        <div>Zoom content</div>
      </Zoom>,
    );

    rerender(
      <Zoom in timeout={100} onEnter={onEnter} onEntered={onEntered}>
        <div>Zoom content</div>
      </Zoom>,
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
      <Zoom ref={ref} in>
        <div>Zoom content</div>
      </Zoom>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
