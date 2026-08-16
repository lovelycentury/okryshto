import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { List, ListItem, ListItemText } from "./List";

describe("List", () => {
  it("renders without modifier classes by default", () => {
    const { container } = render(
      <List>
        <ListItem>
          <ListItemText primary="Item" />
        </ListItem>
      </List>,
    );
    const list = container.querySelector(".okryshto-list") as HTMLElement;
    expect(list).toHaveClass("okryshto-component", "okryshto-list");
    expect(list.className).not.toMatch(/okryshto-list--(dense|disable-padding)/);
  });

  it("applies dense and disablePadding modifiers", () => {
    const { container } = render(
      <List dense disablePadding subheader="Section">
        <ListItem>Child</ListItem>
      </List>,
    );
    expect(container.querySelector(".okryshto-list")).toHaveClass(
      "okryshto-list--dense",
      "okryshto-list--disable-padding",
    );
    expect(screen.getByText("Section")).toHaveClass("okryshto-list__subheader");
  });

  it("forwards ref on List", () => {
    const ref = createRef<HTMLUListElement>();
    render(
      <List ref={ref}>
        <ListItem>Item</ListItem>
      </List>,
    );
    expect(ref.current).toBeInstanceOf(HTMLUListElement);
  });
});

describe("ListItem", () => {
  it("renders a static row without button modifier", () => {
    const { container } = render(
      <List>
        <ListItem selected startIcon={<span data-testid="icon">★</span>}>
          <ListItemText primary="Title" secondary="Subtitle" />
        </ListItem>
      </List>,
    );
    const item = container.querySelector(".okryshto-list-item") as HTMLElement;
    expect(item).toHaveClass("okryshto-list-item--selected");
    expect(item.className).not.toMatch(/okryshto-list-item--button/);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Title")).toHaveClass("okryshto-list-item__primary");
  });

  // Keyboard activation is not asserted here because it is not this component's
  // code: the row is a real `<button>`, so Enter and Space reach `onClick`
  // through the browser's own activation behaviour. What is worth pinning down
  // is that it really is a button, and that it fires exactly once per click.
  it("handles button click", () => {
    const onClick = vi.fn();
    render(
      <List>
        <ListItem button onClick={onClick}>
          <ListItemText primary="Click me" />
        </ListItem>
      </List>,
    );
    const row = screen.getByRole("button", { name: "Click me" });
    expect(row.tagName).toBe("BUTTON");
    expect(row).toHaveAttribute("type", "button");
    fireEvent.click(row);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders secondaryAction outside the button", () => {
    render(
      <List>
        <ListItem button secondaryAction={<button type="button">Action</button>}>
          <ListItemText primary="Row" />
        </ListItem>
      </List>,
    );
    expect(screen.getByRole("button", { name: "Row" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});
