import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAutocomplete } from "./Autocomplete";

const options = [
  { value: "mika", label: "Mika Chen" },
  { value: "alex", label: "Alex Rivera" },
];

const click = { defaultPrevented: false } as never;
const enter = { key: "Enter", defaultPrevented: false, preventDefault: () => {} } as never;

describe("useAutocomplete", () => {
  it("filters options by input value", () => {
    const { result } = renderHook(() => useAutocomplete({ options, defaultInputValue: "mik" }));
    expect(result.current.filteredOptions).toHaveLength(1);
    expect(result.current.filteredOptions[0].label).toBe("Mika Chen");
  });

  it("clears value and input", () => {
    const onChange = vi.fn();
    const onInputChange = vi.fn();
    const { result } = renderHook(() =>
      useAutocomplete({
        options,
        defaultValue: options[0],
        defaultInputValue: options[0].label,
        onChange,
        onInputValueChange: onInputChange,
      }),
    );

    act(() => result.current.getClearProps().onClick?.(click));

    expect(onChange).toHaveBeenCalledWith(expect.anything(), null, "clear");
    expect(onInputChange).toHaveBeenCalledWith("");
  });

  it("removes tags in multiple mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useAutocomplete({ options, multiple: true, defaultValue: options, onChange }),
    );

    act(() => result.current.removeTag(0));

    expect(onChange).toHaveBeenCalledWith(null, [options[1]], "removeOption", {
      option: options[0],
    });
  });

  it("does not highlight anything until asked", () => {
    const { result } = renderHook(() => useAutocomplete({ options }));
    act(() => result.current.setOpen(true));
    expect(result.current.highlightedIndex).toBe(-1);
  });

  it("highlights the first row when autoHighlight is set", () => {
    const { result } = renderHook(() => useAutocomplete({ options, autoHighlight: true }));
    act(() => result.current.setOpen(true));
    expect(result.current.highlightedIndex).toBe(0);
  });

  it("hides selected options when filterSelectedOptions is set", () => {
    const { result } = renderHook(() =>
      useAutocomplete({
        options,
        multiple: true,
        defaultValue: [options[0]],
        filterSelectedOptions: true,
      }),
    );

    expect(result.current.filteredOptions).toEqual([options[1]]);
  });

  it("commits unmatched freeSolo text on Enter with reason createOption", () => {
    // There is no "Add …" row to click; free text commits from the input, and
    // the reason is what tells a handler this value is not one of its options.
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useAutocomplete({ options, freeSolo: true, defaultInputValue: "Berlin", onChange }),
    );

    act(() => result.current.getInputProps().onKeyDown?.(enter));

    expect(onChange).toHaveBeenCalledWith(expect.anything(), "Berlin", "createOption", {
      option: "Berlin",
    });
  });

  it("ignores Enter on empty freeSolo text", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useAutocomplete({ options, freeSolo: true, onChange }));

    act(() => result.current.getInputProps().onKeyDown?.(enter));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("distinguishes options that share a label via isOptionEqualToValue", () => {
    // Two people named the same: the default label comparison would mark both
    // rows selected when only one is.
    const duplicates = [
      { value: "a", label: "Alex Rivera" },
      { value: "b", label: "Alex Rivera" },
    ];
    const { result } = renderHook(() =>
      useAutocomplete({
        options: duplicates,
        defaultValue: duplicates[1],
        isOptionEqualToValue: (option, candidate) => option.value === candidate.value,
      }),
    );

    expect(result.current.isSelected(duplicates[0])).toBe(false);
    expect(result.current.isSelected(duplicates[1])).toBe(true);
  });

  it("keeps group indices pointing into filteredOptions", () => {
    // Grouping reorders options, and the indices it hands back are the ones
    // `getOptionProps` and the arrow keys use — they have to agree.
    const cities = [
      { value: "paris", label: "Paris", region: "Europe" },
      { value: "tokyo", label: "Tokyo", region: "Asia" },
      { value: "kyiv", label: "Kyiv", region: "Europe" },
    ];
    const { result } = renderHook(() =>
      useAutocomplete({ options: cities, groupBy: (option) => option.region }),
    );

    const { filteredOptions, groupedOptions } = result.current;
    expect(groupedOptions?.map((group) => group.label)).toEqual(["Europe", "Asia"]);
    for (const group of groupedOptions ?? []) {
      for (const { option, index } of group.options) {
        expect(filteredOptions[index]).toBe(option);
      }
    }
  });
});
