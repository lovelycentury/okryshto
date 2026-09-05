import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./Dialog";

describe("Dialog", () => {
  it("renders when open", () => {
    render(
      <Dialog open>
        <DialogTitle>Title</DialogTitle>
        <DialogContent>Body</DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <Dialog open={false}>
        <DialogTitle>Hidden</DialogTitle>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose on backdrop click and Escape", () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        <DialogTitle>Close me</DialogTitle>
      </Dialog>,
    );
    // Clicking beside the paper lands on the container, which sits above the
    // backdrop — the same element MUI dismisses from.
    fireEvent.click(document.querySelector(".okkly-dialog__container")!);
    expect(onClose).toHaveBeenCalledOnce();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("applies maxWidth modifier", () => {
    render(
      <Dialog open maxWidth="lg">
        <DialogTitle>Wide</DialogTitle>
      </Dialog>,
    );
    expect(document.querySelector(".okkly-dialog")).toHaveClass("okkly-dialog--max-width-lg");
  });

  it("does not close when the click starts inside the paper", () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        <DialogTitle>Stay open</DialogTitle>
      </Dialog>,
    );
    fireEvent.click(screen.getByText("Stay open"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("forwards Modal props such as keepMounted", () => {
    render(
      <Dialog open={false} keepMounted>
        <DialogTitle>Kept</DialogTitle>
      </Dialog>,
    );
    expect(screen.getByText("Kept")).toBeInTheDocument();
    expect(document.querySelector(".okkly-modal")).toHaveClass("okkly-modal--hidden");
  });

  it("applies the fullScreen modifier", () => {
    render(
      <Dialog open fullScreen>
        <DialogTitle>Full</DialogTitle>
      </Dialog>,
    );
    expect(document.querySelector(".okkly-dialog")).toHaveClass("okkly-dialog--full-screen");
  });

  it("supports interactive open/close", () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open</Button>
          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogClose onClick={() => setOpen(false)} />
            <DialogTitle>Dialog</DialogTitle>
          </Dialog>
        </>
      );
    };
    render(<Demo />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Close"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
