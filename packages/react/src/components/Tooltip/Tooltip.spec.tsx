import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("renders only the trigger while closed", () => {
    render(
      <Tooltip title="Hint">
        <Button>Hover</Button>
      </Tooltip>,
    );
    expect(screen.getByRole("button", { name: "Hover" })).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows the tooltip on hover and hides it on leave", async () => {
    render(
      <Tooltip title="Copied" enterDelay={0} leaveDelay={0}>
        <Button>Hover</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Hover" });

    fireEvent.mouseEnter(trigger);
    await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("Copied"));

    fireEvent.mouseLeave(trigger);
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("opens on focus and closes on blur", async () => {
    render(
      <Tooltip title="Keyboard reachable">
        <Button>Focus me</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Focus me" });

    fireEvent.focus(trigger);
    await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

    fireEvent.blur(trigger);
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("describes its trigger while open", async () => {
    render(
      <Tooltip title="Saved" enterDelay={0}>
        <Button>Hover</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Hover" });
    expect(trigger).not.toHaveAttribute("aria-describedby");

    fireEvent.mouseEnter(trigger);
    await waitFor(() => {
      const id = trigger.getAttribute("aria-describedby");
      expect(id).toBeTruthy();
      expect(screen.getByRole("tooltip")).toHaveAttribute("id", id!);
    });
  });

  it("names a trigger that has no name of its own", () => {
    render(
      <Tooltip title="Settings">
        <button type="button" />
      </Tooltip>,
    );
    // An icon button used to be announced as a bare "button": all the tooltip
    // contributed was `aria-describedby`, and only while it was open. The name has
    // to be there before anyone hovers.
    const trigger = screen.getByRole("button", { name: "Settings" });
    expect(trigger).toHaveAttribute("aria-label", "Settings");
    expect(trigger).not.toHaveAttribute("aria-describedby");
  });

  it("leaves a trigger that already has a name alone", () => {
    render(
      <Tooltip title="Makes your edits public">
        <Button>Publish</Button>
      </Tooltip>,
    );
    // Renaming it to the tooltip's words would break "label in name": the user says
    // "click Publish" and the control is no longer called that.
    expect(screen.getByRole("button", { name: "Publish" })).not.toHaveAttribute("aria-label");
  });

  it("describes rather than names when asked to", () => {
    render(
      <Tooltip title="Settings" describeChild>
        <button type="button" aria-label="Open settings" />
      </Tooltip>,
    );
    expect(screen.getByRole("button", { name: "Open settings" })).not.toHaveAttribute(
      "aria-label",
      "Settings",
    );
  });

  it("supports controlled open state", () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <Tooltip title="Controlled" open={open} disableHoverListener>
          <Button onClick={() => setOpen(true)}>Open</Button>
        </Tooltip>
      );
    };
    render(<Demo />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("renders an arrow by default and drops it on request", async () => {
    const { rerender } = render(
      <Tooltip title="With" enterDelay={0}>
        <Button>Hover</Button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Hover" }));
    await waitFor(() => expect(document.querySelector(".okkly-tooltip__arrow")).toBeTruthy());

    rerender(
      <Tooltip title="Without" enterDelay={0} arrow={false}>
        <Button>Hover</Button>
      </Tooltip>,
    );
    await waitFor(() => expect(document.querySelector(".okkly-tooltip__arrow")).toBeNull());
  });

  /** An empty title renders nothing at all, as in MUI. */
  it("stays closed when the title is empty", () => {
    render(
      <Tooltip title="" open>
        <Button>Hover</Button>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("honours disableHoverListener and disableFocusListener", () => {
    render(
      <Tooltip title="Never" enterDelay={0} disableHoverListener disableFocusListener>
        <Button>Hover</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Hover" });
    fireEvent.mouseEnter(trigger);
    fireEvent.focus(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("fires onOpen and onClose", async () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    render(
      <Tooltip title="Events" enterDelay={0} leaveDelay={0} onOpen={onOpen} onClose={onClose}>
        <Button>Hover</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Hover" });

    fireEvent.mouseEnter(trigger);
    await waitFor(() => expect(onOpen).toHaveBeenCalled());

    fireEvent.mouseLeave(trigger);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  /**
   * The trip from trigger to bubble crosses a gap that belongs to neither, so
   * leaving the trigger always schedules a close. Arriving in the bubble has to
   * cancel it, or an interactive tooltip can never actually be reached.
   */
  it("stays open when the pointer moves into it", async () => {
    render(
      <Tooltip title="Reach me" enterDelay={0}>
        <Button>Hover</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Hover" });

    fireEvent.mouseEnter(trigger);
    await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

    // leave the trigger, then land in the bubble before the timer fires
    fireEvent.mouseLeave(trigger);
    fireEvent.mouseEnter(document.querySelector(".okkly-tooltip")!);

    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("closes once the pointer leaves the tooltip too", async () => {
    render(
      <Tooltip title="Reach me" enterDelay={0} leaveDelay={0}>
        <Button>Hover</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Hover" });

    fireEvent.mouseEnter(trigger);
    await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

    const popper = document.querySelector(".okkly-tooltip")!;
    fireEvent.mouseLeave(trigger);
    fireEvent.mouseEnter(popper);
    fireEvent.mouseLeave(popper);

    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("takes pointer events only when interactive", async () => {
    const { rerender } = render(
      <Tooltip title="Interactive" enterDelay={0}>
        <Button>Hover</Button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Hover" }));
    await waitFor(() =>
      expect(document.querySelector(".okkly-tooltip")).toHaveClass("okkly-tooltip--interactive"),
    );

    rerender(
      <Tooltip title="Plain" enterDelay={0} interactive={false}>
        <Button>Hover</Button>
      </Tooltip>,
    );
    await waitFor(() =>
      expect(document.querySelector(".okkly-tooltip")).not.toHaveClass(
        "okkly-tooltip--interactive",
      ),
    );
  });

  it("does not cling when interactive is off", async () => {
    render(
      <Tooltip title="Plain" enterDelay={0} leaveDelay={0} interactive={false}>
        <Button>Hover</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Hover" });

    fireEvent.mouseEnter(trigger);
    await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

    fireEvent.mouseLeave(trigger);
    fireEvent.mouseEnter(document.querySelector(".okkly-tooltip")!);

    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("keeps the trigger's own handlers working", () => {
    const onMouseEnter = vi.fn();
    render(
      <Tooltip title="Wrapped" enterDelay={0}>
        <Button onMouseEnter={onMouseEnter}>Hover</Button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Hover" }));
    expect(onMouseEnter).toHaveBeenCalledOnce();
  });
});
