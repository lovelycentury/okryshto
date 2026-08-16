import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ButtonGroup } from "./ButtonGroup";

describe("ButtonGroup", () => {
  it("renders the main action and a chevron toggle", () => {
    render(<ButtonGroup action={{ label: "Save" }} menu={[{ label: "Save as…" }]} />);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    const chevron = screen.getByRole("button", { name: "Open menu" });
    expect(chevron).toHaveAttribute("aria-haspopup", "menu");
    expect(chevron).toHaveAttribute("aria-expanded", "false");
  });

  it("applies the color modifier only for non-default colors", () => {
    const { rerender, container } = render(<ButtonGroup action={{ label: "A" }} color="dante" />);
    expect(container.firstChild).toHaveClass("okryshto-button-group--color-dante");

    rerender(<ButtonGroup action={{ label: "A" }} color="primary" />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(
      /okryshto-button-group--color-/,
    );
  });

  it("fires onClick for the main action", () => {
    const onClick = vi.fn();
    render(<ButtonGroup action={{ label: "Save", onClick }} />);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disables the whole button when disabled is set", () => {
    render(<ButtonGroup action={{ label: "Save" }} menu={[{ label: "Save as…" }]} disabled />);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Open menu" })).toBeDisabled();
  });

  it("opens the dropdown when the chevron is clicked", () => {
    render(
      <ButtonGroup
        action={{ label: "Save" }}
        menu={[{ label: "Save as…" }, { label: "Save & publish" }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Save as…" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Save & publish" })).toBeInTheDocument();
  });

  it("fires onClick and closes the dropdown when a menu item is selected", () => {
    const onClick = vi.fn();
    render(<ButtonGroup action={{ label: "Save" }} menu={[{ label: "Save as…", onClick }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Save as…" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes the dropdown on outside click", () => {
    render(
      <div>
        <button>Outside</button>
        <ButtonGroup action={{ label: "Save" }} menu={[{ label: "Save as…" }]} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes the dropdown on Escape", () => {
    render(<ButtonGroup action={{ label: "Save" }} menu={[{ label: "Save as…" }]} />);
    const chevron = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(chevron);
    fireEvent.keyDown(chevron, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("applies the secondary variant modifier", () => {
    const { container } = render(
      <ButtonGroup variant="secondary" action={{ label: "Export" }} menu={[{ label: "CSV" }]} />,
    );
    expect(container.firstChild).toHaveClass("okryshto-button-group--secondary");
  });

  it("omits the chevron when there is no menu", () => {
    render(<ButtonGroup action={{ label: "Save" }} />);
    expect(screen.queryByRole("button", { name: "Open menu" })).not.toBeInTheDocument();
  });
});
