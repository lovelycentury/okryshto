import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Autocomplete,
  type AutocompleteOption,
  type AutocompleteOptionState,
} from "./Autocomplete";
import {
  HighlightMatch,
  OptionCheck,
  OptionDescription,
  OptionLabel,
  OptionRow,
} from "../Option/Option";

const options: AutocompleteOption[] = [
  { value: "mika", label: "Mika Chen" },
  { value: "alex", label: "Alex Rivera" },
];

const cities = [
  { value: "paris", label: "Paris", region: "Europe" },
  { value: "tokyo", label: "Tokyo", region: "Asia" },
];

describe("Autocomplete", () => {
  it("renders an input combobox with placeholder", () => {
    render(<Autocomplete label="People" options={options} placeholder="Search…" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("placeholder", "Search…");
  });

  it("applies non-default modifiers only when set", () => {
    const { container, rerender } = render(
      <Autocomplete label="People" options={options} size="large" color="dante" error />,
    );
    expect(container.querySelector(".okryshto-autocomplete")).toHaveClass(
      "okryshto-autocomplete--large",
    );
    expect(container.querySelector(".okryshto-autocomplete")).toHaveClass(
      "okryshto-autocomplete--color-dante",
    );
    expect(container.querySelector(".okryshto-autocomplete")).toHaveClass(
      "okryshto-autocomplete--error",
    );

    rerender(<Autocomplete label="People" options={options} />);
    expect(container.querySelector(".okryshto-autocomplete")?.className).not.toMatch(
      /okryshto-autocomplete--(small|large|color-|error)/,
    );
  });

  it("filters options as the user types", () => {
    render(<Autocomplete label="People" options={options} openOnFocus />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "mik" } });
    expect(screen.getByRole("option", { name: "Mika Chen" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Alex Rivera" })).not.toBeInTheDocument();
  });

  it("selects an option and calls onChange", () => {
    const onChange = vi.fn();
    render(<Autocomplete label="People" options={options} onChange={onChange} openOnFocus />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "mik" } });
    fireEvent.click(screen.getByRole("option", { name: "Mika Chen" }));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), options[0], "selectOption", {
      option: options[0],
    });
  });

  it("clears the value via the clear button", () => {
    const onChange = vi.fn();
    render(
      <Autocomplete
        label="People"
        options={options}
        defaultValue={options[0]}
        defaultInputValue={options[0].label}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), null, "clear");
  });

  it("commits unmatched freeSolo text on Enter", () => {
    const onChange = vi.fn();
    render(
      <Autocomplete label="People" options={options} freeSolo openOnFocus onChange={onChange} />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Berlin" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith(expect.anything(), "Berlin", "createOption", {
      option: "Berlin",
    });
  });

  it("renders no rows for freeSolo text that matches nothing", () => {
    // The list has no "Add …" affordance; unmatched text simply empties it.
    render(<Autocomplete label="People" options={options} freeSolo openOnFocus />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Berlin" } });

    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("renders grouped options", () => {
    render(
      <Autocomplete
        label="City"
        options={cities}
        groupBy={(option) => option.region}
        openOnFocus
      />,
    );
    fireEvent.focus(screen.getByRole("combobox"));

    expect(screen.getByRole("group", { name: "Europe" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Asia" })).toBeInTheDocument();
  });

  it("hides already-selected options when asked", () => {
    render(
      <Autocomplete
        label="People"
        options={options}
        multiple
        defaultValue={[options[0]]}
        filterSelectedOptions
        openOnFocus
      />,
    );
    fireEvent.focus(screen.getByRole("combobox"));

    expect(screen.queryByRole("option", { name: "Mika Chen" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Alex Rivera" })).toBeInTheDocument();
  });

  it("focuses the input and opens when the field's chrome is clicked", () => {
    // The chevron and the box's padding are outside the input; they are live
    // only because the whole control is the click target.
    const { container } = render(<Autocomplete label="People" options={options} />);

    fireEvent.click(container.querySelector(".okryshto-autocomplete__control")!);

    expect(screen.getByRole("combobox")).toHaveFocus();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("keeps the popup open when an option inside the portal is clicked", () => {
    // React routes portal events up its own tree, so an option click also
    // reaches the control's open-on-click handler unless filtered by DOM
    // containment.
    render(
      <Autocomplete label="People" options={options} multiple disableCloseOnSelect openOnFocus />,
    );

    fireEvent.focus(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Mika Chen" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("anchors a popup that is already open on the first render", () => {
    // `anchorEl` is read during render and a ref attach schedules none, so a
    // controlled-open popup used to see a null anchor and never get positioned.
    render(<Autocomplete label="People" options={options} open />);

    const popper = document.querySelector<HTMLElement>(".okryshto-autocomplete-popper");
    expect(popper).not.toBeNull();
    expect(popper).toHaveAttribute("data-popper-placement");
  });

  it("carries the field size onto the portaled panel", () => {
    // The panel is not a DOM descendant of the field, so it cannot inherit the
    // size modifier — it has to be copied across.
    render(<Autocomplete label="People" options={options} size="large" openOnFocus />);
    fireEvent.focus(screen.getByRole("combobox"));

    expect(document.querySelector(".okryshto-autocomplete-popover")).toHaveClass(
      "okryshto-autocomplete-popover--large",
    );
  });

  it("collapses tags past limitTags", () => {
    render(
      <Autocomplete
        label="People"
        options={options}
        multiple
        defaultValue={options}
        limitTags={1}
      />,
    );
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("supports renderTags", () => {
    render(
      <Autocomplete
        label="People"
        options={options}
        multiple
        defaultValue={options}
        renderTags={(value) => <span>{value.length} selected</span>}
      />,
    );
    expect(screen.getByText("2 selected")).toBeInTheDocument();
  });

  it("emits hidden inputs for form submission", () => {
    const { container } = render(
      <Autocomplete
        label="People"
        name="people"
        options={options}
        multiple
        defaultValue={options}
      />,
    );
    const hidden = container.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="people"]',
    );
    expect([...hidden].map((input) => input.value)).toEqual(["Mika Chen", "Alex Rivera"]);
  });

  it("shows the custom empty text", () => {
    render(<Autocomplete label="People" options={[]} noOptionsText="Nobody here" openOnFocus />);
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByText("Nobody here")).toBeInTheDocument();
  });

  it("forwards a ref to the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Autocomplete ref={ref} label="People" options={options} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  // These pin the contract the customization stories document: what a caller
  // gets, and what still has to work once they take a piece over.
  describe("customization", () => {
    it("hands renderOption the state a custom row cannot recompute", () => {
      const seen: AutocompleteOptionState[] = [];
      render(
        <Autocomplete
          label="People"
          options={options}
          size="large"
          multiple
          defaultInputValue="mik"
          open
          renderOption={(props, option, state) => {
            seen.push(state);
            return <OptionRow {...props}>{option.label}</OptionRow>;
          }}
        />,
      );

      expect(seen[0]).toMatchObject({ inputValue: "mik", multiple: true, size: "large", index: 0 });
    });

    it("keeps a custom row selectable by pointer and keyboard", () => {
      const onChange = vi.fn();
      render(
        <Autocomplete
          label="People"
          options={options}
          openOnFocus
          onChange={onChange}
          renderOption={(props, option, state) => (
            <OptionRow {...props}>
              <OptionLabel>{option.label}</OptionLabel>
              <OptionCheck checked={state.selected} />
            </OptionRow>
          )}
        />,
      );
      const input = screen.getByRole("combobox");
      fireEvent.focus(input);

      // Spreading `props` is what keeps the row a real option: the role, the
      // id `aria-activedescendant` points at, and the click handler.
      fireEvent.keyDown(input, { key: "ArrowDown" });
      const first = screen.getByRole("option", { name: "Mika Chen" });
      expect(input).toHaveAttribute("aria-activedescendant", first.id);

      fireEvent.click(first);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), options[0], "selectOption", {
        option: options[0],
      });
    });

    it("gives option primitives the listbox's own block classes", () => {
      render(
        <Autocomplete
          label="People"
          options={options}
          open
          renderOption={(props, option) => (
            <OptionRow {...props}>
              <OptionLabel>
                <HighlightMatch text={option.label} query="mik" />
              </OptionLabel>
              <OptionDescription>Design</OptionDescription>
            </OptionRow>
          )}
        />,
      );

      const row = screen.getAllByRole("option")[0];
      expect(row.querySelector(".okryshto-autocomplete__option-label")).toBeInTheDocument();
      expect(row.querySelector(".okryshto-autocomplete__option-meta")).toBeInTheDocument();
      // Only the matching run is wrapped, and the wrapper adds no text of its
      // own — the row still reads as the option label plus its description.
      expect(row).toHaveTextContent("Mika ChenDesign");
      expect(row.querySelector("mark")).toHaveTextContent("Mik");
      expect(row.querySelector("mark")).toHaveClass("okryshto-autocomplete__option-mark");
    });

    it("keeps typing, filtering and the label when renderInput takes the control over", () => {
      const ref = createRef<HTMLInputElement>();
      render(
        <Autocomplete
          ref={ref}
          label="People"
          options={options}
          openOnFocus
          renderInput={({ inputProps, tags, endAdornment }) => (
            <>
              <span data-testid="glyph">⌕</span>
              {tags}
              <input {...inputProps} />
              {endAdornment}
            </>
          )}
        />,
      );

      const input = screen.getByRole("combobox", { name: "People" });
      expect(screen.getByTestId("glyph")).toBeInTheDocument();
      // `inputProps` carries the ref, so a forwarded ref still reaches the
      // input the caller rendered.
      expect(ref.current).toBe(input);

      fireEvent.change(input, { target: { value: "alex" } });
      expect(screen.getByRole("option", { name: "Alex Rivera" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "Mika Chen" })).not.toBeInTheDocument();
    });

    it("moves the adornments into renderInput rather than drawing them twice", () => {
      render(
        <Autocomplete
          label="People"
          options={options}
          renderInput={({ inputProps, endAdornment }) => (
            <div data-testid="control">
              <input {...inputProps} />
              {endAdornment}
            </div>
          )}
        />,
      );

      const toggles = screen.getAllByRole("button", { name: "Open options" });
      expect(toggles).toHaveLength(1);
      expect(screen.getByTestId("control")).toContainElement(toggles[0]);
    });

    it("replaces group headers, the empty state and the loading state", () => {
      const { rerender } = render(
        <Autocomplete
          label="City"
          options={cities}
          groupBy={(option) => option.region}
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
      expect(screen.getByText("Europe (1)")).toBeInTheDocument();
      expect(screen.getByRole("group", { name: "Asia" })).toBeInTheDocument();

      // `inputValue` rather than `defaultInputValue`: the default is only read
      // on mount, and a rerender keeps the same instance.
      rerender(
        <Autocomplete
          label="City"
          options={[]}
          inputValue="atlantis"
          open
          renderNoOptions={({ inputValue }) => <li>{`No match for ${inputValue}`}</li>}
        />,
      );
      expect(screen.getByText("No match for atlantis")).toBeInTheDocument();

      rerender(
        <Autocomplete
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
