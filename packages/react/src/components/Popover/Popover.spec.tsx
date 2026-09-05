import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Popover } from "./Popover";

describe("Popover", () => {
  it("renders when open with anchorPosition", () => {
    render(
      <Popover open anchorPosition={{ top: 100, left: 100 }}>
        Panel content
      </Popover>,
    );
    expect(screen.getByText("Panel content")).toBeInTheDocument();
    expect(document.querySelector(".okkly-popover")).toHaveClass("okkly-popover--open");
    expect(document.querySelector(".okkly-popover__paper")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(
      <Popover open={false} anchorPosition={{ top: 0, left: 0 }}>
        Hidden
      </Popover>,
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("calls onClose on Escape with the escapeKeyDown reason", () => {
    const onClose = vi.fn();
    render(
      <Popover open anchorPosition={{ top: 80, left: 80 }} onClose={onClose}>
        Panel
      </Popover>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose.mock.calls[0][1]).toBe("escapeKeyDown");
  });

  it("closes on a click away, reported as backdropClick", () => {
    const onClose = vi.fn();
    render(
      <Popover open anchorPosition={{ top: 80, left: 80 }} onClose={onClose}>
        Panel
      </Popover>,
    );
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose.mock.calls[0][1]).toBe("backdropClick");
  });

  /**
   * Click-outside listens on mousedown, which lands before the anchor's own
   * click. Treating the anchor as "outside" therefore closed the popover and
   * let the trigger reopen it in the same gesture, so it never appeared to
   * close at all.
   */
  it("ignores mousedown on the anchor so the trigger stays a toggle", () => {
    const onClose = vi.fn();
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);

    render(
      <Popover open anchorEl={anchor} onClose={onClose}>
        Panel
      </Popover>,
    );

    fireEvent.mouseDown(anchor);
    expect(onClose).not.toHaveBeenCalled();

    // anything else still dismisses
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledOnce();

    anchor.remove();
  });

  it("ignores mousedown on a child of the anchor", () => {
    const onClose = vi.fn();
    const anchor = document.createElement("button");
    const label = document.createElement("span");
    anchor.appendChild(label);
    document.body.appendChild(anchor);

    render(
      <Popover open anchorEl={anchor} onClose={onClose}>
        Panel
      </Popover>,
    );

    fireEvent.mouseDown(label);
    expect(onClose).not.toHaveBeenCalled();

    anchor.remove();
  });

  it("renders an opt-in backdrop that closes on click", () => {
    const onClose = vi.fn();
    render(
      <Popover open anchorPosition={{ top: 10, left: 10 }} onClose={onClose} hideBackdrop={false}>
        Panel
      </Popover>,
    );

    const backdrop = document.querySelector(".okkly-popover__backdrop");
    expect(backdrop).toBeTruthy();

    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose.mock.calls[0][1]).toBe("backdropClick");
  });

  it("has no backdrop by default", () => {
    render(
      <Popover open anchorPosition={{ top: 10, left: 10 }} onClose={vi.fn()}>
        Panel
      </Popover>,
    );
    expect(document.querySelector(".okkly-popover__backdrop")).toBeNull();
  });

  it("wraps content in Grow transition root", () => {
    render(
      <Popover open anchorPosition={{ top: 40, left: 40 }}>
        Grown
      </Popover>,
    );
    expect(document.querySelector(".okkly-grow")).toBeTruthy();
  });
});
