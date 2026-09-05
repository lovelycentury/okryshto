import { createRef } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Collapse } from "./Collapse";

describe("Collapse", () => {
  it("renders children when in=true", () => {
    render(
      <Collapse in>
        <div>Collapse content</div>
      </Collapse>,
    );
    expect(screen.getByText("Collapse content")).toBeInTheDocument();
  });

  it("renders with vertical orientation by default", () => {
    const { container } = render(
      <Collapse in>
        <div>Collapse content</div>
      </Collapse>,
    );
    expect(container.querySelector(".okkly-collapse")).toHaveClass("okkly-collapse--vertical");
  });

  it("renders with horizontal orientation when specified", () => {
    const { container } = render(
      <Collapse in orientation="horizontal">
        <div>Collapse content</div>
      </Collapse>,
    );
    expect(container.querySelector(".okkly-collapse")).toHaveClass("okkly-collapse--horizontal");
  });

  it("uses collapsedSize for min dimension", () => {
    const { container } = render(
      <Collapse in={false} collapsedSize={40}>
        <div>Collapse content</div>
      </Collapse>,
    );
    const root = container.querySelector(".okkly-collapse");
    expect(root).toHaveStyle({ minHeight: "40px" });
  });

  it("renders wrapper structure", () => {
    const { container } = render(
      <Collapse in>
        <div>Collapse content</div>
      </Collapse>,
    );
    expect(container.querySelector(".okkly-collapse__wrapper")).toBeTruthy();
    expect(container.querySelector(".okkly-collapse__wrapper-inner")).toBeTruthy();
  });

  it("unmounts when in=false and unmountOnExit", () => {
    const { container } = render(
      <Collapse in={false} unmountOnExit>
        <div>Collapse content</div>
      </Collapse>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("fires enter callbacks when opening", async () => {
    vi.useFakeTimers();
    const onEnter = vi.fn();
    const onEntered = vi.fn();
    const { rerender } = render(
      <Collapse in={false} timeout={100} onEnter={onEnter} onEntered={onEntered}>
        <div style={{ height: 80 }}>Collapse content</div>
      </Collapse>,
    );

    rerender(
      <Collapse in timeout={100} onEnter={onEnter} onEntered={onEntered}>
        <div style={{ height: 80 }}>Collapse content</div>
      </Collapse>,
    );

    expect(onEnter).toHaveBeenCalled();
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(onEntered).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Collapse ref={ref} in>
        <div>Collapse content</div>
      </Collapse>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("okkly-collapse");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Collapse in className="custom-class">
        <div>Collapse content</div>
      </Collapse>,
    );
    expect(container.querySelector(".okkly-collapse")).toHaveClass("custom-class");
  });
});
