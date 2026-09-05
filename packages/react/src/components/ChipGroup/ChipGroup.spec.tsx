import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "../Chip/Chip";
import { ChipGroup } from "./ChipGroup";

describe("ChipGroup", () => {
  it("renders items as chips", () => {
    render(
      <ChipGroup
        items={[
          { label: "Design", value: "design" },
          { label: "Engineering", value: "engineering" },
        ]}
      />,
    );
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });

  it("applies the default classes (primary color, not disabled)", () => {
    const { container } = render(<ChipGroup items={[{ label: "Design" }]} />);
    const group = container.querySelector(".okkly-chip-group");
    expect(group).toHaveClass("okkly-component", "okkly-chip-group");
    expect(group?.className).not.toMatch(/okkly-chip-group--color-/);
    expect(group).not.toHaveClass("okkly-chip-group--disabled");
  });

  it("applies a color modifier only for non-primary tones", () => {
    const { container, rerender } = render(
      <ChipGroup color="dante" items={[{ label: "Design" }]} />,
    );
    expect(container.querySelector(".okkly-chip-group")).toHaveClass(
      "okkly-chip-group--color-dante",
    );

    rerender(<ChipGroup color="primary" items={[{ label: "Design" }]} />);
    expect(container.querySelector(".okkly-chip-group")?.className).not.toMatch(
      /okkly-chip-group--color-/,
    );
  });

  it("renders children as an escape hatch", () => {
    render(
      <ChipGroup>
        <Chip label="Custom" />
      </ChipGroup>,
    );
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  describe("selection", () => {
    it("reflects controlled multi value", () => {
      render(
        <ChipGroup
          value={["design"]}
          onChange={() => {}}
          items={[
            { label: "Design", value: "design" },
            { label: "Engineering", value: "engineering" },
          ]}
        />,
      );
      expect(screen.getByText("Design").closest(".okkly-chip")).toHaveClass("okkly-chip--selected");
      expect(screen.getByText("Engineering").closest(".okkly-chip")).not.toHaveClass(
        "okkly-chip--selected",
      );
    });

    it("toggles multi selection via onChange", () => {
      const onChange = vi.fn();
      render(
        <ChipGroup
          value={[]}
          onChange={onChange}
          items={[
            { label: "Design", value: "design" },
            { label: "Engineering", value: "engineering" },
          ]}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Design" }));
      expect(onChange).toHaveBeenCalledWith(["design"]);
    });

    it("switches exclusive selection via onChange", () => {
      const onChange = vi.fn();
      render(
        <ChipGroup
          exclusive
          value="design"
          onChange={onChange}
          items={[
            { label: "Design", value: "design" },
            { label: "Engineering", value: "engineering" },
          ]}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Engineering" }));
      expect(onChange).toHaveBeenCalledWith("engineering");
    });

    it("uses item.selected when value is omitted", () => {
      render(
        <ChipGroup
          items={[
            { label: "Design", value: "design", selected: true },
            { label: "Engineering", value: "engineering" },
          ]}
        />,
      );
      expect(screen.getByText("Design").closest(".okkly-chip")).toHaveClass("okkly-chip--selected");
    });
  });

  describe("disabled", () => {
    it("marks the group disabled and blocks chip clicks", () => {
      const onChange = vi.fn();
      const { container } = render(
        <ChipGroup
          disabled
          value={[]}
          onChange={onChange}
          items={[{ label: "Design", value: "design" }]}
        />,
      );
      expect(container.querySelector(".okkly-chip-group")).toHaveClass(
        "okkly-chip-group--disabled",
      );
      fireEvent.click(screen.getByText("Design"));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it("wires removable chips", () => {
    const onRemove = vi.fn();
    const item = { label: "Design", onRemove };
    render(<ChipGroup items={[item]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onRemove).toHaveBeenCalledOnce();
    // React hands the handler a SyntheticEvent, never the DOM event itself —
    // the native click is reachable through `nativeEvent`.
    expect(onRemove.mock.calls[0][0].nativeEvent).toBeInstanceOf(MouseEvent);
    expect(onRemove.mock.calls[0][1]).toBe(item);
  });
});
