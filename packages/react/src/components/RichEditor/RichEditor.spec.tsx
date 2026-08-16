import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RichEditor } from "./RichEditor";

describe("RichEditor", () => {
  it("renders the label", () => {
    render(<RichEditor label="Description" />);
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders with default classes and no modifier classes", () => {
    const { container } = render(<RichEditor label="Description" />);
    const root = container.querySelector(".okryshto-rich-editor");
    expect(root).toHaveClass("okryshto-component", "okryshto-rich-editor");
    expect(root?.className).not.toMatch(
      /okryshto-rich-editor--(error|disabled|readonly|color-|not-full-width)/,
    );
  });

  it("applies the error modifier", () => {
    const { container } = render(<RichEditor label="Description" error />);
    expect(container.querySelector(".okryshto-rich-editor")).toHaveClass(
      "okryshto-rich-editor--error",
    );
  });

  it("disables editing and marks aria-disabled", async () => {
    const { container } = render(
      <RichEditor label="Description" disabled defaultValue="<p>Hi</p>" />,
    );
    expect(container.querySelector(".okryshto-rich-editor")).toHaveClass(
      "okryshto-rich-editor--disabled",
    );

    await waitFor(() => {
      const prose = container.querySelector(".ProseMirror");
      expect(prose).toHaveAttribute("contenteditable", "false");
      expect(prose).toHaveAttribute("aria-disabled", "true");
    });
  });

  it("shows toolbar buttons when not readonly", async () => {
    render(<RichEditor label="Description" />);
    await waitFor(() => {
      expect(screen.getByRole("toolbar", { name: "Formatting" })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Italic" })).toBeInTheDocument();
  });

  it("hides the toolbar when readonly", () => {
    render(<RichEditor label="Description" readonly defaultValue="<p>Locked</p>" />);
    expect(screen.queryByRole("toolbar", { name: "Formatting" })).not.toBeInTheDocument();
    expect(screen.getByText("Read-only")).toBeInTheDocument();
  });

  it("fires onChange when content changes", async () => {
    const onChange = vi.fn();
    render(<RichEditor label="Description" onChange={onChange} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Horizontal rule" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Horizontal rule" }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      const html = onChange.mock.calls.at(-1)?.[0];
      expect(typeof html).toBe("string");
      expect(String(html)).toMatch(/hr/i);
    });
  });
});
