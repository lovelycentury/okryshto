import { createRef } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Fade } from "./Fade";

describe("Fade", () => {
  it("renders children when in=true", () => {
    render(
      <Fade in>
        <div>Fade content</div>
      </Fade>,
    );
    expect(screen.getByText("Fade content")).toBeInTheDocument();
  });

  it("keeps children mounted when in=false without unmountOnExit", () => {
    render(
      <Fade in={false}>
        <div>Fade content</div>
      </Fade>,
    );
    const node = screen.getByText("Fade content");
    expect(node).toBeInTheDocument();
    expect(node).toHaveStyle({ visibility: "hidden" });
  });

  it("unmounts children when in=false and unmountOnExit", () => {
    const { container } = render(
      <Fade in={false} unmountOnExit>
        <div>Fade content</div>
      </Fade>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("applies okkly-fade class on the child", () => {
    render(
      <Fade in>
        <div>Fade content</div>
      </Fade>,
    );
    expect(screen.getByText("Fade content")).toHaveClass("okkly-fade");
  });

  it("fires enter callbacks when opening", async () => {
    vi.useFakeTimers();
    const onEnter = vi.fn();
    const onEntered = vi.fn();
    const { rerender } = render(
      <Fade in={false} timeout={100} onEnter={onEnter} onEntered={onEntered}>
        <div>Fade content</div>
      </Fade>,
    );

    rerender(
      <Fade in timeout={100} onEnter={onEnter} onEntered={onEntered}>
        <div>Fade content</div>
      </Fade>,
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
      <Fade ref={ref} in>
        <div>Fade content</div>
      </Fade>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveTextContent("Fade content");
  });

  it("merges custom className onto the child", () => {
    render(
      <Fade in className="custom-class">
        <div>Fade content</div>
      </Fade>,
    );
    expect(screen.getByText("Fade content")).toHaveClass("okkly-fade", "custom-class");
  });
});
