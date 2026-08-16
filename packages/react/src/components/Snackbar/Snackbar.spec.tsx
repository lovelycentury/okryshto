import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Snackbar } from "./Snackbar";

describe("Snackbar", () => {
  it("renders message when open", () => {
    render(<Snackbar open message="Saved" severity="success" autoHideDuration={0} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Saved");
  });

  it("does not render when closed", () => {
    render(<Snackbar open={false} message="Hidden" autoHideDuration={0} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(<Snackbar open message="Dismiss me" onClose={onClose} autoHideDuration={0} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("auto hides after duration", async () => {
    const onClose = vi.fn();
    render(<Snackbar open message="Auto hide" onClose={onClose} autoHideDuration={100} />);
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce(), { timeout: 500 });
  });

  it("supports interactive open/close", () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open</Button>
          <Snackbar
            open={open}
            onClose={() => setOpen(false)}
            message="Hello"
            autoHideDuration={0}
          />
        </>
      );
    };
    render(<Demo />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
