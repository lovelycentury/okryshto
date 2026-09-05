import { createRef } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Grow } from "./Grow";

describe("Grow", () => {
  it("renders children when in=true", () => {
    render(
      <Grow in>
        <div>Grow content</div>
      </Grow>,
    );
    expect(screen.getByText("Grow content")).toBeInTheDocument();
  });

  it("unmounts children when in=false and unmountOnExit", () => {
    const { container } = render(
      <Grow in={false} unmountOnExit>
        <div>Grow content</div>
      </Grow>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("applies okkly-grow class on the child", () => {
    render(
      <Grow in>
        <div>Grow content</div>
      </Grow>,
    );
    expect(screen.getByText("Grow content")).toHaveClass("okkly-grow");
  });

  it("supports numeric timeout", async () => {
    vi.useFakeTimers();
    const onEntered = vi.fn();
    const { rerender } = render(
      <Grow in={false} timeout={80} onEntered={onEntered}>
        <div>Grow content</div>
      </Grow>,
    );

    rerender(
      <Grow in timeout={80} onEntered={onEntered}>
        <div>Grow content</div>
      </Grow>,
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(onEntered).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("forwards ref to the child element", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Grow ref={ref} in timeout={100}>
        <div>Grow content</div>
      </Grow>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
