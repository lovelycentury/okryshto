"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
  type SyntheticEvent,
} from "react";
import { useControllableState } from "../ControllableState";
import { groupOptions, type OptionGroup, type SelectionChangeHandler } from "../Selection";

export interface AutocompleteOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface UseAutocompleteOptions<T = AutocompleteOption> {
  options: T[];
  value?: T | T[] | null;
  defaultValue?: T | T[] | null;
  inputValue?: string;
  defaultInputValue?: string;
  onChange?: SelectionChangeHandler<T, T | T[] | null>;
  onInputValueChange?: (value: string) => void;
  getOptionLabel?: (option: T) => string;
  filterOptions?: (
    options: T[],
    state: { inputValue: string; getOptionLabel: (option: T) => string },
  ) => T[];
  /**
   * Decides whether an option is the selected value. Defaults to comparing
   * `option.value` when present, else the rendered label — which silently
   * mis-selects duplicate labels, so pass a real comparator for object options.
   */
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  /** Splits options into labelled groups. Reorders them so groups are contiguous. */
  groupBy?: (option: T) => string;
  multiple?: boolean;
  freeSolo?: boolean;
  disabled?: boolean;
  openOnFocus?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Keeps the popup open after picking. Defaults to `true` for `multiple`. */
  disableCloseOnSelect?: boolean;
  /** Highlights the first row as you type, so Enter commits without arrowing. */
  autoHighlight?: boolean;
  /** Commits the highlighted option on blur. */
  autoSelect?: boolean;
  /** Blurs the input after a selection. */
  blurOnSelect?: boolean;
  /** Escape clears the value when the popup is already closed. */
  clearOnEscape?: boolean;
  /** Resets the input text on blur. Defaults to `true` unless `freeSolo`. */
  clearOnBlur?: boolean;
  /** Hides options that are already selected. Most useful with `multiple`. */
  filterSelectedOptions?: boolean;
  /** Removes the clear affordance; `getClearProps` reports itself disabled. */
  disableClearable?: boolean;
}

export interface UseAutocompleteReturn<T = AutocompleteOption> {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  value: T | T[] | null;
  inputValue: string;
  /**
   * Options surviving the filter, in render order — reordered when `groupBy` is
   * set. Its indices are the ones `getOptionProps` and the keyboard navigation
   * use, so rendering in this order is what keeps arrow keys honest.
   */
  filteredOptions: T[];
  /** `null` unless `groupBy` is set. Carries indices into `filteredOptions`. */
  groupedOptions: OptionGroup<T>[] | null;
  highlightedIndex: number;
  isSelected: (option: T) => boolean;
  getOptionLabel: (option: T) => string;
  getInputProps: (
    props?: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> },
  ) => InputHTMLAttributes<HTMLInputElement> & { ref: (node: HTMLInputElement | null) => void };
  getListboxProps: (props?: HTMLAttributes<HTMLElement>) => HTMLAttributes<HTMLElement>;
  getOptionProps: (
    index: number,
    props?: HTMLAttributes<HTMLElement>,
  ) => HTMLAttributes<HTMLElement> & { "data-index": number };
  getClearProps: (props?: HTMLAttributes<HTMLButtonElement>) => HTMLAttributes<HTMLButtonElement>;
  getTagProps: (
    index: number,
    props?: HTMLAttributes<HTMLElement>,
  ) => HTMLAttributes<HTMLElement> & { "data-index": number };
  removeTag: (index: number, event?: SyntheticEvent | null) => void;
}

function defaultGetOptionLabel<T>(option: T): string {
  if (option == null) return "";
  if (typeof option === "string") return option;
  if (typeof option === "object" && "label" in option) {
    return String((option as { label: unknown }).label);
  }
  return String(option);
}

function defaultFilterOptions<T>(
  options: T[],
  state: { inputValue: string; getOptionLabel: (option: T) => string },
): T[] {
  const query = state.inputValue.trim().toLowerCase();
  if (!query) return options;
  return options.filter((option) => state.getOptionLabel(option).toLowerCase().includes(query));
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
  options: T[],
  start: number,
  direction: 1 | -1,
  isDisabled: (option: T) => boolean,
): number {
  const len = options.length;
  if (len === 0) return -1;
  let index = start;
  for (let i = 0; i < len; i += 1) {
    index = (index + direction + len) % len;
    if (!isDisabled(options[index])) return index;
  }
  return -1;
}

/**
 * Headless autocomplete/combobox — filter-as-you-type, multi-select tags,
 * grouping and free solo.
 */
export function useAutocomplete<T = AutocompleteOption>({
  options,
  value: valueProp,
  defaultValue,
  inputValue: inputValueProp,
  defaultInputValue = "",
  onChange,
  onInputValueChange,
  getOptionLabel = defaultGetOptionLabel,
  filterOptions = defaultFilterOptions,
  isOptionEqualToValue,
  groupBy,
  multiple = false,
  freeSolo = false,
  disabled = false,
  openOnFocus = false,
  open: openProp,
  onOpenChange,
  disableCloseOnSelect,
  autoHighlight = false,
  autoSelect = false,
  blurOnSelect = false,
  clearOnEscape = false,
  clearOnBlur,
  filterSelectedOptions = false,
  disableClearable = false,
}: UseAutocompleteOptions<T>): UseAutocompleteReturn<T> {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const keepOpenOnSelect = disableCloseOnSelect ?? multiple;
  const shouldClearOnBlur = clearOnBlur ?? !freeSolo;

  const [isOpen, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const [inputValue, setInputValue] = useControllableState({
    value: inputValueProp,
    defaultValue: defaultInputValue,
    onChange: onInputValueChange,
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
    (option: T, candidate: T) => {
      if (isOptionEqualToValue) return isOptionEqualToValue(option, candidate);
      if (
        typeof option === "object" &&
        option != null &&
        typeof candidate === "object" &&
        candidate != null &&
        "value" in option &&
        "value" in candidate
      ) {
        return Object.is(
          (option as { value: unknown }).value,
          (candidate as { value: unknown }).value,
        );
      }
      return getOptionLabel(option) === getOptionLabel(candidate);
    },
    [getOptionLabel, isOptionEqualToValue],
  );

  const isOptionDisabled = useCallback((option: T) => {
    if (option == null) return true;
    if (typeof option === "object" && "disabled" in option) {
      return Boolean((option as { disabled?: boolean }).disabled);
    }
    return false;
  }, []);

  const isSelected = useCallback(
    (option: T) => {
      if (multiple) return normalizeMultipleValue(value).some((item) => matches(option, item));
      return singleValue != null && matches(option, singleValue);
    },
    [matches, multiple, singleValue, value],
  );

  const { filteredOptions, groupedOptions } = useMemo(() => {
    let result = filterOptions(options, { inputValue, getOptionLabel });
    if (filterSelectedOptions) result = result.filter((option) => !isSelected(option));

    let groups: OptionGroup<T>[] | null = null;
    if (groupBy) {
      const grouped = groupOptions(result, groupBy);
      result = grouped.flat;
      groups = grouped.groups;
    }

    return { filteredOptions: result, groupedOptions: groups };
  }, [
    filterOptions,
    filterSelectedOptions,
    getOptionLabel,
    groupBy,
    inputValue,
    isSelected,
    options,
  ]);

  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
      return;
    }
    setHighlightedIndex(
      autoHighlight ? findNextEnabledIndex(filteredOptions, -1, 1, isOptionDisabled) : -1,
    );
  }, [autoHighlight, filteredOptions, isOpen, isOptionDisabled]);

  const setOpen = useCallback(
    (open: boolean) => {
      if (disabled) return;
      setOpenState(open);
    },
    [disabled, setOpenState],
  );

  const applyInputValue = useCallback(
    (next: string) => {
      setInputValue(next);
    },
    [setInputValue],
  );

  const selectOption = useCallback(
    (event: SyntheticEvent | null, index: number) => {
      const option = filteredOptions[index];
      if (option == null || isOptionDisabled(option)) return;

      if (multiple) {
        const current = normalizeMultipleValue(value);
        const exists = current.some((item) => matches(option, item));
        const next = exists
          ? current.filter((item) => !matches(option, item))
          : [...current, option];
        setMultiValue(next);
        onChange?.(event, next, exists ? "removeOption" : "selectOption", { option });
        applyInputValue("");
        if (!keepOpenOnSelect) setOpen(false);
      } else {
        setSingleValue(option);
        onChange?.(event, option, "selectOption", { option });
        applyInputValue(getOptionLabel(option));
        if (!keepOpenOnSelect) setOpen(false);
      }

      if (blurOnSelect) inputRef.current?.blur();
      else inputRef.current?.focus();
    },
    [
      applyInputValue,
      blurOnSelect,
      filteredOptions,
      getOptionLabel,
      isOptionDisabled,
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

  const clearValue = useCallback(
    (event: SyntheticEvent | null) => {
      if (disableClearable || disabled) return;
      if (multiple) {
        setMultiValue([]);
        onChange?.(event, [], "clear");
      } else {
        setSingleValue(null);
        onChange?.(event, null, "clear");
      }
      applyInputValue("");
      inputRef.current?.focus();
    },
    [
      applyInputValue,
      disableClearable,
      disabled,
      multiple,
      onChange,
      setMultiValue,
      setSingleValue,
    ],
  );

  const removeTag = useCallback(
    (index: number, event: SyntheticEvent | null = null) => {
      if (!multiple) return;
      const current = normalizeMultipleValue(value);
      const option = current[index];
      const next = current.filter((_, i) => i !== index);
      setMultiValue(next);
      onChange?.(event, next, "removeOption", { option });
    },
    [multiple, onChange, setMultiValue, value],
  );

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!isOpen) setOpen(true);
        else
          setHighlightedIndex((current) =>
            findNextEnabledIndex(filteredOptions, current, 1, isOptionDisabled),
          );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!isOpen) setOpen(true);
        else
          setHighlightedIndex((current) =>
            findNextEnabledIndex(filteredOptions, current, -1, isOptionDisabled),
          );
        return;
      }

      if (event.key === "Enter") {
        if (isOpen && highlightedIndex >= 0) {
          event.preventDefault();
          selectOption(event, highlightedIndex);
          return;
        }
        if (freeSolo && inputValue.trim()) {
          event.preventDefault();
          const solo = inputValue.trim() as unknown as T;
          if (multiple) {
            const next = [...normalizeMultipleValue(value), solo];
            setMultiValue(next);
            onChange?.(event, next, "createOption", { option: solo });
            applyInputValue("");
          } else {
            setSingleValue(solo);
            onChange?.(event, solo, "createOption", { option: solo });
            setOpen(false);
          }
        }
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        if (isOpen) {
          setOpen(false);
          return;
        }
        if (clearOnEscape) clearValue(event);
        return;
      }

      if (event.key === "Backspace" && multiple && !inputValue) {
        const current = normalizeMultipleValue(value);
        if (current.length > 0) removeTag(current.length - 1, event);
      }
    },
    [
      applyInputValue,
      clearOnEscape,
      clearValue,
      disabled,
      filteredOptions,
      freeSolo,
      highlightedIndex,
      inputValue,
      isOpen,
      isOptionDisabled,
      multiple,
      onChange,
      removeTag,
      selectOption,
      setMultiValue,
      setOpen,
      setSingleValue,
      value,
    ],
  );

  const handleInputBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      if (autoSelect && isOpen && highlightedIndex >= 0) {
        selectOption(event, highlightedIndex);
        return;
      }
      if (freeSolo && !multiple && inputValue.trim() && singleValue == null) {
        const solo = inputValue.trim() as unknown as T;
        setSingleValue(solo);
        onChange?.(event, solo, "blur", { option: solo });
        return;
      }
      if (shouldClearOnBlur) {
        // Text that matched nothing would otherwise linger beside a value it
        // does not describe. A committed single value re-asserts its own label.
        if (!multiple && singleValue != null) applyInputValue(getOptionLabel(singleValue));
        else if (inputValue) applyInputValue("");
      }
    },
    [
      applyInputValue,
      autoSelect,
      freeSolo,
      getOptionLabel,
      highlightedIndex,
      inputValue,
      isOpen,
      multiple,
      onChange,
      selectOption,
      setSingleValue,
      shouldClearOnBlur,
      singleValue,
    ],
  );

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> } = {}) => {
      const {
        onChange: onInputChange,
        onFocus,
        onKeyDown,
        onBlur,
        ref: externalRef,
        ...rest
      } = props;
      return {
        ...rest,
        role: "combobox",
        "aria-expanded": isOpen,
        "aria-autocomplete": "list" as const,
        "aria-controls": listboxId,
        "aria-disabled": disabled || undefined,
        "aria-activedescendant":
          isOpen && highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined,
        disabled,
        value: inputValue,
        ref: (node: HTMLInputElement | null) => {
          inputRef.current = node;
          if (typeof externalRef === "function") externalRef(node);
          else if (externalRef && "current" in externalRef) {
            (externalRef as { current: HTMLInputElement | null }).current = node;
          }
        },
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
          onInputChange?.(event);
          if (event.defaultPrevented || disabled) return;
          applyInputValue(event.currentTarget.value);
          if (!isOpen) setOpen(true);
        },
        onFocus: (event: FocusEvent<HTMLInputElement>) => {
          onFocus?.(event);
          if (event.defaultPrevented || disabled) return;
          if (openOnFocus) setOpen(true);
        },
        onBlur: (event: FocusEvent<HTMLInputElement>) => {
          onBlur?.(event);
          if (event.defaultPrevented) return;
          handleInputBlur(event);
        },
        onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          handleInputKeyDown(event);
        },
      };
    },
    [
      applyInputValue,
      disabled,
      handleInputBlur,
      handleInputKeyDown,
      highlightedIndex,
      inputValue,
      isOpen,
      listboxId,
      openOnFocus,
      setOpen,
    ],
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
      const option = filteredOptions[index];
      const selected = option != null && isSelected(option);
      const optionDisabled = option != null && isOptionDisabled(option);
      const { onClick, onMouseEnter, ...rest } = props;

      return {
        ...rest,
        "data-index": index,
        role: "option",
        id: `${listboxId}-option-${index}`,
        "aria-selected": selected,
        "aria-disabled": optionDisabled || undefined,
        tabIndex: -1,
        onMouseEnter: (event: MouseEvent<HTMLElement>) => {
          onMouseEnter?.(event);
          if (!optionDisabled) setHighlightedIndex(index);
        },
        onClick: (event: MouseEvent<HTMLElement>) => {
          onClick?.(event);
          if (event.defaultPrevented || optionDisabled) return;
          selectOption(event, index);
        },
      };
    },
    [filteredOptions, isOptionDisabled, isSelected, listboxId, selectOption],
  );

  const getClearProps = useCallback(
    (props: HTMLAttributes<HTMLButtonElement> = {}) => {
      const { onClick, ...rest } = props;
      const hasValue = multiple
        ? normalizeMultipleValue(value).length > 0
        : singleValue != null || inputValue.length > 0;
      return {
        ...rest,
        type: "button" as const,
        tabIndex: -1,
        "aria-label": "Clear",
        disabled: disabled || disableClearable || !hasValue,
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          clearValue(event);
        },
      };
    },
    [clearValue, disableClearable, disabled, inputValue.length, multiple, singleValue, value],
  );

  const getTagProps = useCallback(
    (index: number, props: HTMLAttributes<HTMLElement> = {}) => {
      const { onKeyDown, ...rest } = props;
      const tags = normalizeMultipleValue(value);
      const tag = tags[index];
      return {
        ...rest,
        "data-index": index,
        "aria-label": tag ? getOptionLabel(tag) : undefined,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          onKeyDown?.(event);
          if (event.key === "Backspace" || event.key === "Delete") {
            event.preventDefault();
            removeTag(index, event);
          }
        },
      };
    },
    [getOptionLabel, removeTag, value],
  );

  return {
    isOpen,
    setOpen,
    value,
    inputValue,
    filteredOptions,
    groupedOptions,
    highlightedIndex,
    isSelected,
    getOptionLabel,
    getInputProps,
    getListboxProps,
    getOptionProps,
    getClearProps,
    getTagProps,
    removeTag,
  };
}
