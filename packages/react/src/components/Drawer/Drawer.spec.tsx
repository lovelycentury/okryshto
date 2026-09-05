import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Drawer } from "./Drawer";

describe("Drawer", () => {
  it("renders when open", () => {
    render(
      <Drawer open anchor="right">
        <div>Drawer content</div>
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toHaveTextContent("Drawer content");
    expect(document.querySelector(".okkly-drawer")).toHaveClass(
      "okkly-drawer--open",
      "okkly-drawer--anchor-right",
    );
  });

  it("does not render when closed", () => {
    render(
      <Drawer open={false}>
        <div>Hidden</div>
      </Drawer>,
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("calls onClose on backdrop click and Escape", () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose}>
        <div>Panel</div>
      </Drawer>,
    );
    // The backdrop belongs to Modal now, and it is a plain div rather than the
    // labelled button this used to reach for. That is the point of the change: a
    // scrim is not a control, and one that was focusable put "Close drawer" first
    // in the tab order of every drawer in the app.
    const backdrop = document.querySelector(".okkly-modal__backdrop")!;
    expect(backdrop.tagName).toBe("DIV");
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("traps focus inside the paper, which it did not do before Modal owned it", () => {
    render(
      <Drawer open onClose={() => {}}>
        <button type="button">Inside</button>
      </Drawer>,
    );
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Inside" }));
  });

  it("supports interactive open/close", () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open</Button>
          <Drawer open={open} onClose={() => setOpen(false)}>
            <div>Drawer</div>
          </Drawer>
        </>
      );
    };
    render(<Demo />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Drawer")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    // Closing keeps the drawer mounted until its slide-out transition ends.
    expect(screen.getByText("Drawer")).toBeInTheDocument();
    fireEvent.transitionEnd(document.querySelector(".okkly-drawer__paper")!);
    expect(screen.queryByText("Drawer")).not.toBeInTheDocument();
  });
});
