"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
  type SyntheticEvent,
} from "react";
import { useControllableState } from "../ControllableState";
import { groupOptions, type OptionGroup, type SelectionChangeHandler } from "../Selection";

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface UseSelectOptions<T = string> {
  options: SelectOption<T>[];
  value?: T | T[] | null;
  defaultValue?: T | T[] | null;
  multiple?: boolean;
  onChange?: SelectionChangeHandler<SelectOption<T>, T | T[] | null>;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Decides whether an option corresponds to a selected value. The default
   * compares with `Object.is`, which is wrong the moment values are objects
   * rebuilt on each render — pass a comparator keyed on an id in that case.
   */
  isOptionEqualToValue?: (option: SelectOption<T>, value: T) => boolean;
  /** Splits options into labelled groups. Reorders them so groups are contiguous. */
  groupBy?: (option: SelectOption<T>) => string;
  /** Keeps the popup open after picking. Defaults to `true` for `multiple`. */
  disableCloseOnSelect?: boolean;
  /** Removes the clear affordance; `getClearProps` reports itself disabled. */
  disableClearable?: boolean;
}

export interface UseSelectReturn<T = string> {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  value: T | T[] | null;
  setValue: (value: T | T[]) => void;
  /** Options in render order — reordered when `groupBy` is set. */
  flatOptions: SelectOption<T>[];
  /** `null` unless `groupBy` is set. */
  groupedOptions: OptionGroup<SelectOption<T>>[] | null;
  /** Currently selected options, in the order they appear in `options`. */
  selectedOptions: SelectOption<T>[];
  highlightedIndex: number;
  isSelected: (option: SelectOption<T>) => boolean;
  removeValue: (event: SyntheticEvent | null, option: SelectOption<T>) => void;
  clear: (event: SyntheticEvent | null) => void;
  getTriggerProps: (
    props?: HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> },
  ) => HTMLAttributes<HTMLElement> & { ref: (node: HTMLElement | null) => void };
  getListboxProps: (props?: HTMLAttributes<HTMLElement>) => HTMLAttributes<HTMLElement>;
  getOptionProps: (
    index: number,
    props?: HTMLAttributes<HTMLElement>,
  ) => HTMLAttributes<HTMLElement> & { "data-index": number };
  getClearProps: (props?: HTMLAttributes<HTMLButtonElement>) => HTMLAttributes<HTMLButtonElement>;
  options: SelectOption<T>[];
}

function normalizeMultipleValue<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeSingleValue<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function findNextEnabledIndex<T>(
  options: SelectOption<T>[],
  start: number,
  direction: 1 | -1,
): number {
  const len = options.length;
  if (len === 0) return -1;
  let index = start;
  for (let i = 0; i < len; i += 1) {
    index = (index + direction + len) % len;
    if (!options[index]?.disabled) return index;
  }
  return -1;
}

/**
 * Headless select/combobox state — keyboard navigation, typeahead, grouping,
 * single & multi value.
 */
export function useSelect<T = string>({
  options,
  value: valueProp,
  defaultValue,
  multiple = false,
  onChange,
  disabled = false,
  open: openProp,
  onOpenChange,
  isOptionEqualToValue,
  groupBy,
  disableCloseOnSelect,
  disableClearable = false,
}: UseSelectOptions<T>): UseSelectReturn<T> {
  const listboxId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const typeaheadRef = useRef({ query: "", at: 0 });

  const keepOpenOnSelect = disableCloseOnSelect ?? multiple;

  const [isOpen, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const [singleValue, setSingleValue] = useControllableState<T | null>({
    value: multiple
      ? undefined
      : valueProp === undefined
        ? undefined
        : normalizeSingleValue(valueProp),
    defaultValue: multiple ? undefined : normalizeSingleValue(defaultValue ?? null),
  });

  const [multiValue, setMultiValue] = useControllableState<T[]>({
    value: multiple
      ? valueProp === undefined
        ? undefined
        : normalizeMultipleValue(valueProp)
      : undefined,
    defaultValue: multiple ? normalizeMultipleValue(defaultValue) : undefined,
  });

  const value = multiple ? multiValue : singleValue;

  const matches = useCallback(
    (option: SelectOption<T>, candidate: T) =>
      isOptionEqualToValue
        ? isOptionEqualToValue(option, candidate)
        : Object.is(option.value, candidate),
    [isOptionEqualToValue],
  );

  const { flatOptions, groupedOptions } = useMemo(() => {
    if (!groupBy) return { flatOptions: options, groupedOptions: null };
    const { flat, groups } = groupOptions(options, groupBy);
    return { flatOptions: flat, groupedOptions: groups };
  }, [groupBy, options]);

  const isSelected = useCallback(
    (option: SelectOption<T>) => {
      if (multiple) return normalizeMultipleValue(value).some((item) => matches(option, item));
      return singleValue != null && matches(option, singleValue);
    },
    [matches, multiple, singleValue, value],
  );

  const selectedOptions = useMemo(
    () => flatOptions.filter((option) => isSelected(option)),
    [flatOptions, isSelected],
  );

  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
      return;
    }
    const firstSelected = flatOptions.findIndex((option) => isSelected(option));
    setHighlightedIndex(
      firstSelected >= 0 ? firstSelected : findNextEnabledIndex(flatOptions, -1, 1),
    );
    // `isSelected` is intentionally excluded: it changes identity on every value
    // change, and re-running this would yank the highlight back to the selected
    // row while a multi-select popup is still open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, flatOptions]);

  const setOpen = useCallback(
    (open: boolean) => {
      if (disabled) return;
      setOpenState(open);
    },
    [disabled, setOpenState],
  );

  const setValue = useCallback(
    (next: T | T[]) => {
      if (multiple) setMultiValue(normalizeMultipleValue(next));
      else setSingleValue(normalizeSingleValue(next));
    },
    [multiple, setMultiValue, setSingleValue],
  );

  const selectOption = useCallback(
    (event: SyntheticEvent | null, index: number) => {
      const option = flatOptions[index];
      if (!option || option.disabled) return;

      if (multiple) {
        const current = normalizeMultipleValue(value);
        const exists = current.some((item) => matches(option, item));
        const next = exists
          ? current.filter((item) => !matches(option, item))
          : [...current, option.value];
        setMultiValue(next);
        onChange?.(event, next, exists ? "removeOption" : "selectOption", { option });
        if (!keepOpenOnSelect) setOpen(false);
        return;
      }

      setSingleValue(option.value);
      onChange?.(event, option.value, "selectOption", { option });
      if (!keepOpenOnSelect) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    },
    [
      flatOptions,
      keepOpenOnSelect,
      matches,
      multiple,
      onChange,
      setMultiValue,
      setOpen,
      setSingleValue,
      value,
    ],
  );

  const removeValue = useCallback(
    (event: SyntheticEvent | null, option: SelectOption<T>) => {
      if (!multiple) {
        setSingleValue(null);
        onChange?.(event, null, "removeOption", { option });
        return;
      }
      const next = normalizeMultipleValue(value).filter((item) => !matches(option, item));
      setMultiValue(next);
      onChange?.(event, next, "removeOption", { option });
    },
    [matches, multiple, onChange, setMultiValue, setSingleValue, value],
  );

  const clear = useCallback(
    (event: SyntheticEvent | null) => {
      if (disableClearable || disabled) return;
      if (multiple) {
        setMultiValue([]);
        onChange?.(event, [], "clear");
        return;
      }
      setSingleValue(null);
      onChange?.(event, null, "clear");
    },
    [disableClearable, disabled, multiple, onChange, setMultiValue, setSingleValue],
  );

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (disabled) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!isOpen) {
          setOpen(true);
          return;
        }
        setHighlightedIndex((current) => findNextEnabledIndex(flatOptions, current, 1));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!isOpen) {
          setOpen(true);
          return;
        }
        setHighlightedIndex((current) => findNextEnabledIndex(flatOptions, current, -1));
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!isOpen) {
          setOpen(true);
          return;
        }
        if (highlightedIndex >= 0) selectOption(event, highlightedIndex);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        setHighlightedIndex(findNextEnabledIndex(flatOptions, -1, 1));
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        setHighlightedIndex(findNextEnabledIndex(flatOptions, 0, -1));
        return;
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Native-select typeahead: keystrokes within 500ms accumulate into one
        // query ("pa" → Paris), and a pause starts a new one. Unlike the old
        // implementation this buffers the whole string, not just two characters.
        const now = Date.now();
        const typeahead = typeaheadRef.current;
        const query = now - typeahead.at < 500 ? typeahead.query + event.key : event.key;
        typeaheadRef.current = { query, at: now };

        if (!isOpen) setOpen(true);

        const needle = query.toLowerCase();
        const isMatch = (option: SelectOption<T>) =>
          !option.disabled && option.label.toLowerCase().startsWith(needle);

        // Search after the cursor first so repeating one letter cycles through
        // every option starting with it, then wrap to the top.
        const after = flatOptions.findIndex(
          (option, index) => index > highlightedIndex && isMatch(option),
        );
        const nextIndex = after >= 0 ? after : flatOptions.findIndex(isMatch);
        if (nextIndex >= 0) setHighlightedIndex(nextIndex);
      }
    },
    [disabled, flatOptions, highlightedIndex, isOpen, selectOption, setOpen],
  );

  const getTriggerProps = useCallback(
    (props: HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> } = {}) => {
      const { onClick, onKeyDown, ref: externalRef, ...rest } = props;
      return {
        ...rest,
        role: "combobox",
        "aria-expanded": isOpen,
        "aria-haspopup": "listbox" as const,
        "aria-controls": listboxId,
        "aria-disabled": disabled || undefined,
        "aria-activedescendant":
          isOpen && highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined,
        tabIndex: disabled ? -1 : 0,
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
          if (typeof externalRef === "function") externalRef(node);
          else if (externalRef && "current" in externalRef) {
            (externalRef as { current: HTMLElement | null }).current = node;
          }
        },
        onClick: (event: MouseEvent<HTMLElement>) => {
          onClick?.(event);
          if (disabled || event.defaultPrevented) return;
          setOpen(!isOpen);
        },
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          handleTriggerKeyDown(event);
        },
      };
    },
    [disabled, handleTriggerKeyDown, highlightedIndex, isOpen, listboxId, setOpen],
  );

  const getListboxProps = useCallback(
    (props: HTMLAttributes<HTMLElement> = {}) => ({
      ...props,
      id: listboxId,
      role: "listbox",
      "aria-multiselectable": multiple || undefined,
    }),
    [listboxId, multiple],
  );

  const getOptionProps = useCallback(
    (index: number, props: HTMLAttributes<HTMLElement> = {}) => {
      const option = flatOptions[index];
      const selected = option ? isSelected(option) : false;
      const { onClick, onMouseEnter, ...rest } = props;

      return {
        ...rest,
        "data-index": index,
        role: "option",
        id: `${listboxId}-option-${index}`,
        "aria-selected": selected,
        "aria-disabled": option?.disabled || undefined,
        tabIndex: -1,
        onMouseEnter: (event: MouseEvent<HTMLElement>) => {
          onMouseEnter?.(event);
          if (!option?.disabled) setHighlightedIndex(index);
        },
        onClick: (event: MouseEvent<HTMLElement>) => {
          onClick?.(event);
          if (event.defaultPrevented || option?.disabled) return;
          selectOption(event, index);
        },
      };
    },
    [flatOptions, isSelected, listboxId, selectOption],
  );

  const getClearProps = useCallback(
    (props: HTMLAttributes<HTMLButtonElement> = {}) => {
      const { onClick, onMouseDown, ...rest } = props;
      const hasValue = multiple ? normalizeMultipleValue(value).length > 0 : singleValue != null;
      return {
        ...rest,
        type: "button" as const,
        tabIndex: -1,
        disabled: disabled || disableClearable || !hasValue,
        onMouseDown: (event: MouseEvent<HTMLButtonElement>) => {
          onMouseDown?.(event);
          // Without this the trigger's click handler also fires and reopens the
          // popup the clear button just closed over.
          event.preventDefault();
          event.stopPropagation();
        },
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          event.stopPropagation();
          clear(event);
        },
      };
    },
    [clear, disableClearable, disabled, multiple, singleValue, value],
  );

  return {
    isOpen,
    setOpen,
    value,
    setValue,
    flatOptions,
    groupedOptions,
    selectedOptions,
    highlightedIndex,
    isSelected,
    removeValue,
    clear,
    getTriggerProps,
    getListboxProps,
    getOptionProps,
    getClearProps,
    options,
  };
}
