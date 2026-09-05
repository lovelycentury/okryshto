import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "./Tabs";

const items = [
  { label: "Overview", value: "overview" },
  { label: "Activity", value: "activity" },
  { label: "Settings", value: "settings", disabled: true },
];

describe("Tabs", () => {
  it("renders a tablist with one tab per item", () => {
    render(<Tabs items={items} value="overview" />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Activity" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Settings" })).toBeInTheDocument();
  });

  it("renders with zero modifier classes by default", () => {
    const { container } = render(<Tabs items={items} />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("okkly-component", "okkly-tabs");
    expect(root.className).not.toMatch(/okkly-tabs--color-/);
    expect(root.className).not.toMatch(/okkly-tabs--scrollable/);
    expect(root.className).not.toMatch(/okkly-tabs--vertical/);
  });

  it("marks the active tab with aria-selected and modifier class", () => {
    render(<Tabs items={items} value="activity" />);
    const active = screen.getByRole("tab", { name: "Activity" });
    expect(active).toHaveClass("okkly-tabs__tab--active");
    expect(active).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "false");
  });

  it("applies variant, orientation, and color modifiers", () => {
    const { rerender, container } = render(<Tabs items={items} variant="scrollable" />);
    expect(container.firstChild).toHaveClass("okkly-tabs--scrollable");
    expect(container.querySelector(".okkly-tabs__scroller")).toBeInTheDocument();

    rerender(<Tabs items={items} orientation="vertical" />);
    expect(container.firstChild).toHaveClass("okkly-tabs--vertical");

    rerender(<Tabs items={items} color="dante" />);
    expect(container.firstChild).toHaveClass("okkly-tabs--color-dante");

    rerender(<Tabs items={items} color="primary" />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/okkly-tabs--color-/);
  });

  it("fires onChange with the selected tab value", () => {
    const onChange = vi.fn();
    render(<Tabs items={items} value="overview" onChange={onChange} />);
    fireEvent.click(screen.getByRole("tab", { name: "Activity" }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Object), "activity");
  });

  it("updates selection in uncontrolled mode", () => {
    render(<Tabs items={items} defaultValue="overview" />);
    fireEvent.click(screen.getByRole("tab", { name: "Activity" }));
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
  });

  it("disables individual tabs", () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole("tab", { name: "Settings" })).toBeDisabled();
  });

  it("renders a leading icon when provided", () => {
    render(
      <Tabs items={[{ label: "Home", value: "home", icon: <span data-testid="tab-icon" /> }]} />,
    );
    expect(screen.getByTestId("tab-icon")).toBeInTheDocument();
  });
});
