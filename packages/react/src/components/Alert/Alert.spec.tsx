import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("renders title and message", () => {
    render(
      <Alert title="Heads up" severity="info">
        A new version is available.
      </Alert>,
    );
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("A new version is available.")).toBeInTheDocument();
  });

  it("has role=alert and default classes", () => {
    render(<Alert title="Info">Message</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("okkly-component", "okkly-alert");
    expect(alert.className).not.toMatch(
      /okkly-alert--(success|warning|danger|dante|outlined|filled)/,
    );
  });

  it("applies severity modifiers only for non-default severities", () => {
    const { rerender } = render(<Alert severity="success">Saved</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("okkly-alert--success");

    rerender(<Alert severity="info">Info</Alert>);
    expect(screen.getByRole("alert").className).not.toMatch(/okkly-alert--success/);
  });

  it("applies variant modifiers for outlined and filled", () => {
    const { rerender } = render(<Alert variant="outlined">Outline</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("okkly-alert--outlined");

    rerender(<Alert variant="filled">Filled</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("okkly-alert--filled");

    rerender(<Alert variant="standard">Standard</Alert>);
    expect(screen.getByRole("alert").className).not.toMatch(/okkly-alert--(outlined|filled)/);
  });

  it("hides the icon when icon={false}", () => {
    const { container } = render(<Alert icon={false}>No icon</Alert>);
    expect(container.querySelector(".okkly-alert__icon")).not.toBeInTheDocument();
  });

  it("renders action and close controls", () => {
    const onClose = vi.fn();
    render(
      <Alert title="Alert" action={<button type="button">Undo</button>} onClose={onClose}>
        Message
      </Alert>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Alert ref={ref}>Message</Alert>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
