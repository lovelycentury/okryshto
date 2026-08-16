import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Select, type SelectOption, type SelectOptionState } from "./Select";
import {
  OptionBody,
  OptionCheck,
  OptionDescription,
  OptionLabel,
  OptionRow,
} from "../Option/Option";

const options: SelectOption[] = [
  { value: "design", label: "Product design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
];

interface City extends SelectOption {
  region: string;
}

const cities: City[] = [
  { value: "paris", label: "Paris", region: "Europe" },
  { value: "tokyo", label: "Tokyo", region: "Asia" },
  { value: "kyiv", label: "Kyiv", region: "Europe" },
];

describe("Select", () => {
  it("renders with a combobox trigger and label", () => {
    render(<Select label="Team" options={options} placeholder="Choose…" />);
    expect(screen.getByRole("combobox", { name: /team/i })).toBeInTheDocument();
    expect(screen.getByText("Choose…")).toBeInTheDocument();
  });

  it("renders default size without a size modifier", () => {
    const { container } = render(<Select label="Team" options={options} />);
    expect(container.querySelector(".okryshto-select")?.className).not.toMatch(
      /okryshto-select--(small|large)/,
    );
  });

  it("applies size and error modifiers", () => {
    const { container } = render(
      <Select label="Team" options={options} size="small" error helperText="Required" />,
    );
    expect(container.querySelector(".okryshto-select")).toHaveClass("okryshto-select--small");
    expect(container.querySelector(".okryshto-select")).toHaveClass("okryshto-select--error");
  });

  it("opens the listbox and selects an option", () => {
    const onChange = vi.fn();
    render(<Select label="Team" options={options} onChange={onChange} />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Engineering" }));

    expect(onChange).toHaveBeenCalledWith(expect.anything(), "engineering", "selectOption", {
      option: options[1],
    });
    expect(screen.getByRole("combobox")).toHaveTextContent("Engineering");
  });

  it("supports multi-select toggling", () => {
    const onChange = vi.fn();
    render(<Select label="Team" options={options} multiple onChange={onChange} />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Product design" }));
    fireEvent.click(screen.getByRole("option", { name: "Engineering" }));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.anything(),
      ["design", "engineering"],
      "selectOption",
      {
        option: options[1],
      },
    );
  });

  it("stays open while picking multiple options", () => {
    render(<Select label="Team" options={options} multiple />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Product design" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("opens from the chevron and the field's own padding", () => {
    // Both sit outside the trigger div — the chevron is a Field adornment —
    // so they only work because the whole control box is the click target.
    const { container } = render(<Select label="Team" options={options} />);

    fireEvent.click(container.querySelector(".okryshto-select__chevron")!);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.click(container.querySelector(".okryshto-select__control")!);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("keeps the popup open when an option inside the portal is clicked", () => {
    // React propagates portal events up its own tree, so an option click also
    // reaches the control's open-on-click handler unless it is filtered by DOM
    // containment.
    render(<Select label="Team" options={options} multiple />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Product design" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("anchors a popup that is already open on the first render", () => {
    // `anchorEl` is read during render and a ref attach schedules none, so a
    // controlled-open popup used to see a null anchor and never get positioned.
    render(<Select label="Team" options={options} open />);

    const popper = document.querySelector<HTMLElement>(".okryshto-select-popper");
    expect(popper).not.toBeNull();
    expect(popper).toHaveAttribute("data-popper-placement");
  });

  it("carries the field size onto the portaled panel", () => {
    // The panel is not a DOM descendant of the field, so it cannot inherit the
    // size modifier — it has to be copied across.
    render(<Select label="Team" options={options} size="small" />);
    fireEvent.click(screen.getByRole("combobox"));

    expect(document.querySelector(".okryshto-select-popover")).toHaveClass(
      "okryshto-select-popover--small",
    );
  });

  it("renders the trigger as a div so chip remove buttons are valid children", () => {
    // A <button> may not contain interactive descendants; the chips' × buttons
    // are exactly that, which is why the trigger is a div[role=combobox].
    render(<Select label="Team" options={options} multiple defaultValue={["design"]} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.tagName).toBe("DIV");
    expect(trigger.querySelector("button")).not.toBeNull();
  });

  it("removes a value from its chip without opening the popup", () => {
    const onChange = vi.fn();
    render(
      <Select
        label="Team"
        options={options}
        multiple
        defaultValue={["design", "engineering"]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /remove/i })[0]);

    expect(onChange).toHaveBeenCalledWith(expect.anything(), ["engineering"], "removeOption", {
      option: options[0],
    });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("collapses chips past limitTags", () => {
    render(
      <Select
        label="Team"
        options={options}
        multiple
        limitTags={1}
        defaultValue={["design", "engineering", "marketing"]}
      />,
    );
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("reports clearing separately from deselecting", () => {
    const onChange = vi.fn();
    render(<Select label="Team" options={options} defaultValue="design" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(onChange).toHaveBeenCalledWith(expect.anything(), null, "clear");
  });

  it("renders grouped options under sticky headers", () => {
    render(<Select label="City" options={cities} groupBy={(option) => (option as City).region} />);
    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByRole("group", { name: "Europe" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Asia" })).toBeInTheDocument();
  });

  it("keeps keyboard order aligned with grouped render order", () => {
    // Grouping reorders options (Kyiv moves up beside Paris); the first arrow
    // press must land on the second *rendered* row, not the second input row.
    render(<Select label="City" options={cities} groupBy={(option) => (option as City).region} />);
    const trigger = screen.getByRole("combobox");

    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(screen.getByRole("option", { name: "Kyiv" })).toHaveClass(
      "okryshto-select__option--highlighted",
    );
  });

  it("emits hidden inputs for form submission", () => {
    const { container } = render(
      <Select
        label="Team"
        name="team"
        options={options}
        multiple
        defaultValue={["design", "marketing"]}
      />,
    );
    const hidden = container.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="team"]',
    );
    expect([...hidden].map((input) => input.value)).toEqual(["design", "marketing"]);
  });

  it("marks the field required", () => {
    render(<Select label="Team" options={options} required />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-required", "true");
  });

  it("supports renderValue", () => {
    render(
      <Select
        label="Team"
        options={options}
        defaultValue="design"
        renderValue={(selected) => <b>{selected.map((option) => option.label).join(" / ")}</b>}
      />,
    );
    expect(screen.getByText("Product design")).toBeInTheDocument();
  });

  it("forwards a ref to the trigger", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Select ref={ref} label="Team" options={options} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  // These pin the contract the customization stories document: what a caller
  // gets, and what still has to work once they take a piece over.
  describe("customization", () => {
    it("hands renderOption the state a custom row cannot recompute", () => {
      const seen: SelectOptionState[] = [];
      render(
        <Select
          label="Team"
          options={[{ value: "design", label: "Product design", disabled: true }]}
          size="small"
          multiple
          open
          renderOption={(props, option, state) => {
            seen.push(state);
            return <OptionRow {...props}>{option.label}</OptionRow>;
          }}
        />,
      );

      expect(seen[0]).toMatchObject({ disabled: true, multiple: true, size: "small", index: 0 });
    });

    it("keeps a custom row selectable by pointer and keyboard", () => {
      const onChange = vi.fn();
      render(
        <Select
          label="Team"
          options={options}
          onChange={onChange}
          renderOption={(props, option, state) => (
            <OptionRow {...props}>
              <OptionLabel>{option.label}</OptionLabel>
              <OptionCheck checked={state.selected} />
            </OptionRow>
          )}
        />,
      );
      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      const second = screen.getByRole("option", { name: "Engineering" });
      expect(trigger).toHaveAttribute("aria-activedescendant", second.id);

      fireEvent.click(second);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), "engineering", "selectOption", {
        option: options[1],
      });
    });

    it("gives option primitives the listbox's own block classes", () => {
      render(
        <Select
          label="City"
          options={cities}
          open
          renderOption={(props, option) => (
            <OptionRow {...props}>
              <OptionBody>
                <OptionLabel>{option.label}</OptionLabel>
                <OptionDescription>{(option as City).region}</OptionDescription>
              </OptionBody>
            </OptionRow>
          )}
        />,
      );

      const row = screen.getByRole("option", { name: "Paris Europe" });
      expect(row.querySelector(".okryshto-select__option-body")).toBeInTheDocument();
      expect(row.querySelector(".okryshto-select__option-label")).toBeInTheDocument();
      expect(row.querySelector(".okryshto-select__option-meta")).toBeInTheDocument();
    });

    it("keeps the combobox working when renderInput takes the trigger over", () => {
      render(
        <Select
          label="Team"
          options={options}
          defaultValue="design"
          renderInput={({ triggerProps, selected, endAdornment }) => (
            <div {...triggerProps}>
              <span data-testid="badge">{selected[0]?.label.charAt(0)}</span>
              <span>{selected[0]?.label ?? "Pick a team"}</span>
              {endAdornment}
            </div>
          )}
        />,
      );

      // The label association, the role and the keyboard handling all ride on
      // `triggerProps` — losing any of them would fail this lookup or the open.
      const trigger = screen.getByRole("combobox", { name: /team/i });
      expect(screen.getByTestId("badge")).toHaveTextContent("P");

      fireEvent.click(trigger);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("moves the adornments into renderInput rather than drawing them twice", () => {
      render(
        <Select
          label="Team"
          options={options}
          defaultValue="design"
          renderInput={({ triggerProps, value, endAdornment }) => (
            <div data-testid="trigger-wrapper">
              <div {...triggerProps}>{value}</div>
              {endAdornment}
            </div>
          )}
        />,
      );

      const clears = screen.getAllByRole("button", { name: "Clear" });
      expect(clears).toHaveLength(1);
      expect(screen.getByTestId("trigger-wrapper")).toContainElement(clears[0]);
      // `value` is the default trigger content, so opting into renderInput does
      // not mean rebuilding the placeholder/chip logic by hand.
      expect(screen.getByRole("combobox")).toHaveTextContent("Product design");
    });

    it("replaces group headers, the empty state and the loading state", () => {
      const { rerender } = render(
        <Select
          label="City"
          options={cities}
          groupBy={(option) => (option as City).region}
          open
          renderGroup={({ key, label, group, children }) => (
            <li key={key} role="presentation">
              <span role="presentation">{`${label} (${group.options.length})`}</span>
              <ul role="group" aria-label={label}>
                {children}
              </ul>
            </li>
          )}
        />,
      );
      expect(screen.getByText("Europe (2)")).toBeInTheDocument();
      expect(screen.getByRole("group", { name: "Asia" })).toBeInTheDocument();

      rerender(
        <Select
          label="City"
          options={[]}
          open
          renderNoOptions={() => <li>Nothing archived yet</li>}
        />,
      );
      expect(screen.getByText("Nothing archived yet")).toBeInTheDocument();

      rerender(
        <Select
          label="City"
          options={cities}
          loading
          open
          renderLoading={() => <li>Fetching…</li>}
        />,
      );
      expect(screen.getByText("Fetching…")).toBeInTheDocument();
    });
  });
});
