import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

const backdrop = () => document.querySelector(".okryshto-modal__backdrop")!;

describe("Modal", () => {
  it("portals its children to document.body when open", () => {
    const { container } = render(
      <Modal open>
        <div>Body</div>
      </Modal>,
    );
    expect(screen.getByText("Body")).toBeInTheDocument();
    // Portalled, so it lives outside the mount point React was handed.
    expect(container).toBeEmptyDOMElement();
    expect(document.body.querySelector(".okryshto-modal")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(
      <Modal open={false}>
        <div>Hidden</div>
      </Modal>,
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("keeps children mounted but hidden with keepMounted", () => {
    render(
      <Modal open={false} keepMounted>
        <div>Kept</div>
      </Modal>,
    );
    expect(screen.getByText("Kept")).toBeInTheDocument();
    expect(document.querySelector(".okryshto-modal")).toHaveClass("okryshto-modal--hidden");
  });

  it("calls onClose on backdrop click and Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        <div>Panel</div>
      </Modal>,
    );
    fireEvent.click(backdrop());
    expect(onClose).toHaveBeenLastCalledWith(expect.anything(), "backdropClick");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenLastCalledWith(expect.anything(), "escapeKeyDown");
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("honours disableEscapeKeyDown and hideBackdrop", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} disableEscapeKeyDown hideBackdrop>
        <div>Panel</div>
      </Modal>,
    );
    expect(document.querySelector(".okryshto-modal__backdrop")).not.toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders inline when disablePortal is set", () => {
    const { container } = render(
      <Modal open disablePortal>
        <div>Inline</div>
      </Modal>,
    );
    expect(container.querySelector(".okryshto-modal")).toBeInTheDocument();
  });

  it("mounts into a custom container", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    render(
      <Modal open container={host}>
        <div>Hosted</div>
      </Modal>,
    );
    expect(host.querySelector(".okryshto-modal")).toBeInTheDocument();
    host.remove();
  });

  it("moves focus in on open and restores it on close", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { rerender } = render(
      <Modal open>
        <button type="button">Inside</button>
      </Modal>,
    );
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Inside" }));

    rerender(
      <Modal open={false}>
        <button type="button">Inside</button>
      </Modal>,
    );
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("leaves initial focus alone with disableAutoFocus", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    render(
      <Modal open disableAutoFocus>
        <button type="button">Inside</button>
      </Modal>,
    );
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("applies backdrop slotProps", () => {
    const onClick = vi.fn();
    render(
      <Modal open slotProps={{ backdrop: { className: "custom", onClick } }}>
        <div>Panel</div>
      </Modal>,
    );
    expect(backdrop()).toHaveClass("custom");
    fireEvent.click(backdrop());
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("locks body scroll only while open and not disabled", () => {
    const { rerender, unmount } = render(
      <Modal open>
        <div>Panel</div>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Modal open disableScrollLock>
        <div>Panel</div>
      </Modal>,
    );
    expect(document.body.style.overflow).not.toBe("hidden");
    unmount();
  });
});
