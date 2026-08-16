import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSelect } from "./Select";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", disabled: true },
];

const click = { defaultPrevented: false } as never;

describe("useSelect", () => {
  it("selects a single value and closes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useSelect({ options, onChange }));

    act(() => result.current.setOpen(true));
    act(() => result.current.getOptionProps(1).onClick?.(click));

    expect(onChange).toHaveBeenCalledWith(expect.anything(), "b", "selectOption", {
      option: options[1],
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("toggles values in multiple mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useSelect({ options, multiple: true, onChange }));

    act(() => result.current.setOpen(true));
    act(() => result.current.getOptionProps(0).onClick?.(click));
    act(() => result.current.getOptionProps(1).onClick?.(click));

    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), ["a", "b"], "selectOption", {
      option: options[1],
    });
  });

  it("reports deselection as removeOption", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSelect({ options, multiple: true, defaultValue: ["a"], onChange }),
    );

    act(() => result.current.setOpen(true));
    act(() => result.current.getOptionProps(0).onClick?.(click));

    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), [], "removeOption", {
      option: options[0],
    });
  });

  it("distinguishes clear from removeOption", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSelect({ options, multiple: true, defaultValue: ["a", "b"], onChange }),
    );

    act(() => result.current.clear(null));

    expect(onChange).toHaveBeenLastCalledWith(null, [], "clear");
  });

  it("stays open after picking in multiple mode", () => {
    const { result } = renderHook(() => useSelect({ options, multiple: true }));

    act(() => result.current.setOpen(true));
    act(() => result.current.getOptionProps(0).onClick?.(click));

    expect(result.current.isOpen).toBe(true);
  });

  it("honours disableCloseOnSelect for single select", () => {
    const { result } = renderHook(() => useSelect({ options, disableCloseOnSelect: true }));

    act(() => result.current.setOpen(true));
    act(() => result.current.getOptionProps(0).onClick?.(click));

    expect(result.current.isOpen).toBe(true);
  });

  it("moves highlight with arrow keys", () => {
    const { result } = renderHook(() => useSelect({ options }));

    act(() => result.current.setOpen(true));
    act(() =>
      result.current.getTriggerProps().onKeyDown?.({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as never),
    );

    expect(result.current.highlightedIndex).toBe(1);
  });

  it("jumps to a matching option via typeahead", () => {
    const { result } = renderHook(() => useSelect({ options }));

    act(() => result.current.setOpen(true));
    act(() =>
      result.current.getTriggerProps().onKeyDown?.({
        key: "b",
        preventDefault: vi.fn(),
      } as never),
    );

    expect(result.current.highlightedIndex).toBe(1);
  });

  it("uses isOptionEqualToValue for object values", () => {
    // The value is a structurally equal but distinct object, so the `Object.is`
    // default would find no selection at all — this is the case the prop exists for.
    const objectOptions = [
      { value: { id: 1 } as { id: number }, label: "One" },
      { value: { id: 2 } as { id: number }, label: "Two" },
    ];
    const { result } = renderHook(() =>
      useSelect({
        options: objectOptions,
        value: { id: 2 },
        isOptionEqualToValue: (option, candidate) => option.value.id === candidate.id,
      }),
    );

    expect(result.current.selectedOptions).toEqual([objectOptions[1]]);
  });

  it("reorders options so groups are contiguous and indices still line up", () => {
    const cities = [
      { value: "paris", label: "Paris", region: "Europe" },
      { value: "tokyo", label: "Tokyo", region: "Asia" },
      { value: "kyiv", label: "Kyiv", region: "Europe" },
    ];
    const { result } = renderHook(() =>
      useSelect({ options: cities, groupBy: (option) => option.region }),
    );

    expect(result.current.flatOptions.map((option) => option.value)).toEqual([
      "paris",
      "kyiv",
      "tokyo",
    ]);
    expect(result.current.groupedOptions?.map((group) => group.label)).toEqual(["Europe", "Asia"]);
    expect(result.current.groupedOptions?.[1].options[0].index).toBe(2);
  });
});
