"use client";

import {
  forwardRef,
  Fragment,
  useCallback,
  useId,
  useRef,
  useState,
  type ForwardedRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { iconCheck, iconChevronDown, iconChevronUp, iconX } from "@okkly/icons";
import {
  useAutocomplete,
  type AutocompleteOption,
  type OptionGroup,
  type SelectionChangeHandler,
} from "@okkly/react-hooks";
import "@okkly/design-system/components/Autocomplete/Autocomplete.scss";
import { Popper } from "../Popper/Popper";
import { Chip } from "../Chip/Chip";
import { Spinner } from "../Spinner/Spinner";
import { Field, getFieldIds, type FieldColor, type FieldSize } from "../Field/Field";
import { useOutsideDismiss } from "../Field/useOutsideDismiss";
import { OptionScope } from "../Option/Option";

export type AutocompleteSize = FieldSize;
export type AutocompleteColor = FieldColor;

export type { AutocompleteOption };

export interface AutocompleteTagProps extends HTMLAttributes<HTMLElement> {
  /**
   * Key for the tag. Must be unique.
   *
   * @default undefined
   * @type {string}
   */
  key: string;
  /**
   * On Remove. Handler for when the tag is removed.
   *
   * @default undefined
   * @type {() => void}
   */
  onRemove: () => void;
}

/** What a row's `renderOption` is told about the row it is drawing. */
export interface AutocompleteOptionState {
  /**
   * Whether this option is part of the current value.
   *
   * @default undefined
   * @type {boolean}
   */
  selected: boolean;
  /**
   * Whether this is the row the keyboard is on. Pointer hover sets it too, so
   * exactly one row is ever emphasised.
   *
   * @default undefined
   * @type {boolean}
   */
  highlighted: boolean;
  /**
   * Index into the filtered option list — the same index space the keyboard
   * navigation uses.
   *
   * @default undefined
   * @type {number}
   */
  index: number;
  /**
   * What is typed in the field right now. Pass it to `HighlightMatch` to
   * emphasise the matching run.
   *
   * @default undefined
   * @type {string}
   */
  inputValue: string;
  /**
   * Whether the field is in multiple mode.
   *
   * @default undefined
   * @type {boolean}
   */
  multiple: boolean;
  /**
   * The field's size, so a custom row can scale with it. The popup is portaled
   * and inherits nothing, which is why this is handed over explicitly.
   *
   * @default undefined
   * @type {AutocompleteSize}
   */
  size: AutocompleteSize;
}

/** Everything needed to rebuild the inside of the control. */
export interface AutocompleteRenderInputParams<T = AutocompleteOption> {
  /**
   * Props for the `<input>`, `ref` included. Spread them or the field stops
   * typing, filtering and reporting itself to assistive tech.
   *
   * @default undefined
   * @type {*}
   */
  inputProps: InputHTMLAttributes<HTMLInputElement> & { ref: Ref<HTMLInputElement> };
  /**
   * The tag row for `multiple` — already `renderTags`-aware, `null` when there
   * is nothing selected.
   *
   * @default undefined
   * @type {ReactNode}
   */
  tags: ReactNode;
  /**
   * The clear and open/close buttons. They are handed over rather than kept
   * outside, so a custom control decides where — or whether — they sit.
   *
   * @default undefined
   * @type {ReactNode}
   */
  endAdornment: ReactNode;
  /**
   * State a custom control usually needs to reflect.
   *
   * @default undefined
   * @type {*}
   */
  state: {
    open: boolean;
    disabled: boolean;
    error: boolean;
    multiple: boolean;
    size: AutocompleteSize;
    color: AutocompleteColor;
    inputValue: string;
    value: T | T[] | null;
  };
}

/** A group header plus the rows underneath it. */
export interface AutocompleteRenderGroupParams<T = AutocompleteOption> {
  /**
   * Stable key for the group — put it on the returned element.
   *
   * @default undefined
   * @type {string}
   */
  key: string;
  /**
   * The group's label, as returned by `groupBy`.
   *
   * @default undefined
   * @type {string}
   */
  label: string;
  /**
   * The group as the hook computed it, each option carrying its index into the
   * flat list.
   *
   * @default undefined
   * @type {OptionGroup<T>}
   */
  group: OptionGroup<T>;
  /**
   * The already-rendered rows of this group.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

/**
 * Props follow MUI's Autocomplete API (https://mui.com/material-ui/api/autocomplete/)
 * as closely as this design allows: `options`/`value`/`inputValue`/`onChange`/
 * `onInputChange`/`getOptionLabel`/`isOptionEqualToValue`/`filterOptions`/
 * `groupBy`/`renderOption`/`renderTags`/`multiple`/`freeSolo`/`disabled`/
 * `openOnFocus`/`loading`/`loadingText`/`noOptionsText`/`clearText`/`limitTags`/
 * `autoHighlight`/`autoSelect`/`blurOnSelect`/`clearOnEscape`/`clearOnBlur`/
 * `filterSelectedOptions`/`disableCloseOnSelect`/`disableClearable` all match
 * name-for-name, and `onChange` carries MUI's `(event, value, reason, details)`.
 *
 * `renderInput` exists but is deliberately narrower than MUI's: it replaces the
 * inside of the control — input, tags, adornments — while the field shell
 * (label, helper text, error and size/colour modifiers) stays with the
 * component. There is exactly one field design here, and handing the shell out
 * would mostly be a way to lose the focus ring, the label association and the
 * popup's anchor.
 *
 * Deliberate gaps: no `sx`/`classes`/`slots`/`slotProps`, no
 * virtualization. There is no built-in "Add «text»" row either -- MUI leaves
 * that to a `filterOptions` recipe, and so do we; `freeSolo` alone commits typed
 * text on Enter, reporting reason `"createOption"`.
 */
export interface AutocompleteProps<T = AutocompleteOption> {
  /**
   * Options. List of options to display in the autocomplete.
   *
   * @default undefined
   * @type {T[]}
   */
  options: T[];
  /**
   * The value of the autocomplete. Can be a single option or an array of options.
   *
   * @default undefined
   * @type {T | T[] | null}
   */
  value?: T | T[] | null;
  /**
   * The default value of the autocomplete. Can be a single option or an array of options.
   *
   * @default undefined
   * @type {T | T[] | null}
   */
  defaultValue?: T | T[] | null;
  /**
   * The input value of the autocomplete.
   * Use it when you want to set the input value programmatically.
   * If defaultInputValue is set, it will be used instead of inputValue.
   *
   * @default undefined
   * @type {string}
   */
  inputValue?: string;
  /**
   * The default input value of the autocomplete.
   * Use it when you want to set the default input value when the component is mounted.
   * If defaultInputValue is set, it will be used instead of inputValue.
   *
   * @default undefined
   * @type {string}
   */
  defaultInputValue?: string;
  /**
   * On Change. Handler for when the value changes.
   *
   * @default undefined
   * @type {SelectionChangeHandler<T, T | T[] | null>}
   */
  onChange?: SelectionChangeHandler<T, T | T[] | null>;
  /**
   * On Input Change. Handler for when the input value changes.
   * Use it when you want to react to the input value changes.
   *
   * @default undefined
   * @type {(value: string) => void}
   */
  onInputChange?: (value: string) => void;
  /**
   * Get Option Label. Function to get the label of an option.
   * Use it when you want to get the label of an option.
   * E.g. 100 -> `$ 100`.
   *
   * @default undefined
   * @type {(option: T) => string}
   */
  getOptionLabel?: (option: T) => string;
  /**
   * Get Option Description. Function to get the description of an option.
   * Use it when you want to get the description of an option.
   * E.g. Apple -> Apple is a fruit.
   *
   * @default undefined
   * @type {(option: T) => ReactNode}
   */
  getOptionDescription?: (option: T) => ReactNode;
  /**
   * Is Option Equal To Value. Function to check if an option is equal to a value.
   *
   * @default undefined
   * @type {(option: T, value: T) => boolean}
   */
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  /**
   * Filter Options. Function to filter the options.
   *
   * @default undefined
   * @type {*}
   */
  filterOptions?: (
    options: T[],
    state: { inputValue: string; getOptionLabel: (option: T) => string },
  ) => T[];
  /**
   * Group By. Function to group the options.
   *
   * @default undefined
   * @type {(option: T) => string}
   */
  groupBy?: (option: T) => string;
  /**
   * Multiple. Whether the autocomplete allows multiple selections.
   *
   * @default false
   * @type {boolean}
   */
  multiple?: boolean;
  /**
   * Free Solo. Whether the autocomplete allows free solo input.
   *
   * @default false
   * @type {boolean}
   */
  freeSolo?: boolean;
  /**
   * Disabled. Whether the autocomplete is disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   * @type {boolean}
   */
  required?: boolean;
  /**
   * Open On Focus. Whether the autocomplete opens on focus.
   *
   * @default false
   * @type {boolean}
   */
  openOnFocus?: boolean;
  /**
   * Open. Whether the autocomplete is open.
   *
   * @default undefined
   * @type {boolean}
   */
  open?: boolean;
  /**
   * On Open Change. Handler for when the open state changes.
   *
   * @default undefined
   * @type {(open: boolean) => void}
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Auto Highlight. Whether the autocomplete automatically highlights the first option.
   *
   * @default false
   * @type {boolean}
   */
  autoHighlight?: boolean;
  /**
   * Auto Select. Whether the autocomplete automatically selects the first option.
   *
   * @default false
   * @type {boolean}
   */
  autoSelect?: boolean;
  /**
   * Blur On Select. Whether the autocomplete blurs the input when an option is selected.
   *
   * @default false
   * @type {boolean}
   */
  blurOnSelect?: boolean;
  /**
   * Clear On Escape. Whether the autocomplete clears the input when the escape key is pressed.
   *
   * @default false
   * @type {boolean}
   */
  clearOnEscape?: boolean;
  /**
   * Clear On Blur. Whether the autocomplete clears the input when the blur event is triggered.
   *
   * @default undefined
   * @type {boolean}
   */
  clearOnBlur?: boolean;
  /**
   * Filter Selected Options. Whether the autocomplete filters selected options.
   *
   * @default false
   * @type {boolean}
   */
  filterSelectedOptions?: boolean;
  /**
   * Disable Close On Select. Whether the autocomplete closes the dropdown when an option is selected.
   *
   * @default undefined
   * @type {boolean}
   */
  disableCloseOnSelect?: boolean;
  /**
   * Disable Clearable. Whether the autocomplete is clearable.
   *
   * @default false
   * @type {boolean}
   */
  disableClearable?: boolean;
  /**
   * Limit Tags. The maximum number of tags to show before collapsing to "+N". `-1` shows all.
   *
   * @default -1
   * @type {number}
   */
  limitTags?: number;
  /**
   * Label. The label of the autocomplete.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Hide Label. Whether the label is hidden.
   *
   * @default false
   * @type {boolean}
   */
  hideLabel?: boolean;
  /**
   * Placeholder. The placeholder of the autocomplete.
   *
   * @default "Search…"
   * @type {string}
   */
  placeholder?: string;
  /**
   * Size. The size of the autocomplete.
   *
   * @default "medium"
   * @type {AutocompleteSize}
   */
  size?: AutocompleteSize;
  /**
   * Color. The color of the autocomplete.
   *
   * @default "primary"
   * @type {AutocompleteColor}
   */
  color?: AutocompleteColor;
  /**
   * Error. Whether the autocomplete has an error.
   *
   * @default false
   * @type {boolean}
   */
  error?: boolean;
  /**
   * Helper Text. The helper text of the autocomplete.
   *
   * @default undefined
   * @type {ReactNode}
   */
  helperText?: ReactNode;
  /**
   * Full Width. Whether the autocomplete is full width.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Loading. Whether the autocomplete is loading.
   *
   * @default false
   * @type {boolean}
   */
  loading?: boolean;
  /**
   * Name. The name of the autocomplete.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Render Option. Function to render an option. `props` must be spread on a
   * single `<li>` — they carry the option role, the id
   * `aria-activedescendant` points at, the state modifiers and the pointer
   * handlers. The row's key is applied for you, so the object can be spread
   * as-is.
   *
   * @default undefined
   * @type {(props: HTMLAttributes<HTMLLIElement>, option: T, state: AutocompleteOptionState) => ReactNode}
   */
  renderOption?: (
    props: HTMLAttributes<HTMLLIElement>,
    option: T,
    state: AutocompleteOptionState,
  ) => ReactNode;
  /**
   * Render Input. Rebuilds the inside of the control — input, tags and
   * adornments. The field shell around it (label, helper text, error, size)
   * stays with the component. `params.inputProps` must be spread on an
   * `<input>`; nothing else is required.
   *
   * @default undefined
   * @type {(params: AutocompleteRenderInputParams<T>) => ReactNode}
   */
  renderInput?: (params: AutocompleteRenderInputParams<T>) => ReactNode;
  /**
   * Render Group. Replaces a `groupBy` header and the list wrapping its rows.
   * The returned element must keep `children` inside a list container, since
   * they are `<li>`s.
   *
   * @default undefined
   * @type {(params: AutocompleteRenderGroupParams<T>) => ReactNode}
   */
  renderGroup?: (params: AutocompleteRenderGroupParams<T>) => ReactNode;
  /**
   * Render No Options. Replaces the empty-state row. Return an `<li>` — it is
   * rendered inside the listbox.
   *
   * @default undefined
   * @type {(params: { inputValue: string }) => ReactNode}
   */
  renderNoOptions?: (params: { inputValue: string }) => ReactNode;
  /**
   * Render Loading. Replaces the loading row. Return an `<li>`.
   *
   * @default undefined
   * @type {(params: { inputValue: string }) => ReactNode}
   */
  renderLoading?: (params: { inputValue: string }) => ReactNode;
  /**
   * Render Tags. Function to render the tags.
   *
   * @default undefined
   * @type {(value: T[], getTagProps: (index: number) => AutocompleteTagProps) => ReactNode}
   */
  renderTags?: (value: T[], getTagProps: (index: number) => AutocompleteTagProps) => ReactNode;
  /**
   * No Options Text. The text to display when there are no options.
   *
   * @default "No results"
   * @type {ReactNode}
   */
  noOptionsText?: ReactNode;
  /**
   * Loading Text. The text to display when the autocomplete is loading.
   *
   * @default "Loading…"
   * @type {ReactNode}
   */
  loadingText?: ReactNode;
  /**
   * Clear Text. The text to display when the autocomplete is cleared.
   *
   * @default "Clear"
   * @type {string}
   */
  clearText?: string;
  /**
   * Open Text. The text to display when the autocomplete is opened.
   *
   * @default "Open options"
   * @type {string}
   */
  openText?: string;
  /**
   * Close Text. The text to display when the autocomplete is closed.
   *
   * @default "Close options"
   * @type {string}
   */
  closeText?: string;
  /**
   * Width of the dropdown panel. It is never narrower than the field; this is for the case where the options need more room than the input has.
   *
   * @default undefined
   * @type {number | string}
   */
  popupWidth?: number | string;
  /**
   * Class Name. The class name of the autocomplete.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  /**
   * Id. The id of the autocomplete.
   *
   * @default undefined
   * @type {string}
   */
  id?: string;
}

function AutocompleteInner<T = AutocompleteOption>(
  {
    options,
    value,
    defaultValue,
    inputValue,
    defaultInputValue,
    onChange,
    onInputChange,
    getOptionLabel,
    getOptionDescription,
    isOptionEqualToValue,
    filterOptions,
    groupBy,
    multiple = false,
    freeSolo = false,
    disabled = false,
    required = false,
    openOnFocus = false,
    open,
    onOpenChange,
    autoHighlight = false,
    autoSelect = false,
    blurOnSelect = false,
    clearOnEscape = false,
    clearOnBlur,
    filterSelectedOptions = false,
    disableCloseOnSelect,
    disableClearable = false,
    limitTags = -1,
    label,
    hideLabel = false,
    placeholder = "Search…",
    size = "medium",
    color = "primary",
    error = false,
    helperText,
    fullWidth = false,
    loading = false,
    name,
    renderOption,
    renderInput,
    renderGroup,
    renderNoOptions,
    renderLoading,
    renderTags,
    noOptionsText = "No results",
    loadingText = "Loading…",
    clearText = "Clear",
    openText = "Open options",
    closeText = "Close options",
    popupWidth,
    className,
    id,
  }: AutocompleteProps<T>,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const { helperId } = getFieldIds(fieldId, Boolean(label), Boolean(helperText));
  const controlRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputElementRef = useRef<HTMLInputElement | null>(null);
  /**
   * The anchor has to be state, not just the ref: `anchorEl` is read during
   * render, and attaching a ref does not schedule one. With a plain ref, a
   * popup that is already open on the first render — a controlled `open` — sees
   * `null` and never gets positioned at all, so it lands at the viewport
   * origin. The ref is kept alongside for the click/dismiss containment checks,
   * which run in handlers where a re-render would be wasted.
   */
  const [controlNode, setControlNode] = useState<HTMLDivElement | null>(null);
  const setControlRef = useCallback((node: HTMLDivElement | null) => {
    controlRef.current = node;
    setControlNode(node);
  }, []);

  const autocomplete = useAutocomplete({
    options,
    value,
    defaultValue,
    inputValue,
    defaultInputValue,
    onChange,
    onInputValueChange: onInputChange,
    getOptionLabel,
    isOptionEqualToValue,
    filterOptions,
    groupBy,
    multiple,
    freeSolo,
    disabled,
    openOnFocus,
    open,
    onOpenChange,
    autoHighlight,
    autoSelect,
    blurOnSelect,
    clearOnEscape,
    clearOnBlur,
    filterSelectedOptions,
    disableCloseOnSelect,
    disableClearable,
  });

  // Popper, unlike Popover, has no backdrop and no dismissal of its own.
  useOutsideDismiss([controlRef, panelRef], autocomplete.isOpen, () => autocomplete.setOpen(false));

  /**
   * The chevron, the clear button and the field's own padding all sit outside
   * the input, so without this the only live target in the control is the input
   * itself. A click anywhere in the box puts the caret in the input and opens
   * the list, as MUI's Autocomplete does.
   *
   * Two exclusions: the popup is portaled but still a React child, and React
   * routes synthetic events along its own tree, so option clicks would arrive
   * here and reopen what they just closed; and the toggle/clear buttons and tag
   * × buttons run their own handlers.
   */
  function handleControlClick(event: React.MouseEvent<HTMLDivElement>) {
    if (disabled) return;
    if (!controlRef.current?.contains(event.target as Node)) return;
    if ((event.target as HTMLElement).closest("button, input")) return;
    inputElementRef.current?.focus();
    autocomplete.setOpen(true);
  }

  const labelFor = autocomplete.getOptionLabel;
  const tags = multiple && Array.isArray(autocomplete.value) ? autocomplete.value : [];
  const shownTags = limitTags < 0 ? tags : tags.slice(0, limitTags);
  const tagOverflow = tags.length - shownTags.length;

  const { ref: inputRef, ...inputProps } = autocomplete.getInputProps({
    id: fieldId,
    className: "okkly-autocomplete__input",
    placeholder: tags.length > 0 ? "Add…" : placeholder,
    required,
    "aria-invalid": error || undefined,
    "aria-describedby": helperId,
  });

  const mergedInputRef = (node: HTMLInputElement | null) => {
    inputRef(node);
    inputElementRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const clearProps = autocomplete.getClearProps({
    className: "okkly-autocomplete__clear",
    "aria-label": clearText,
  });

  const getTagProps = (index: number): AutocompleteTagProps => ({
    ...autocomplete.getTagProps(index),
    key: `${labelFor(tags[index])}-${index}`,
    onRemove: () => autocomplete.removeTag(index),
  });

  function renderTagRow() {
    if (tags.length === 0) return null;
    if (renderTags) return renderTags(tags, getTagProps);

    return (
      <div className="okkly-autocomplete__tags">
        {shownTags.map((tag, index) => {
          const { key, onRemove, ...tagProps } = getTagProps(index);
          return (
            <span key={key} {...tagProps}>
              <Chip
                label={labelFor(tag)}
                size="small"
                variant="solid"
                removable={!disabled}
                onRemove={onRemove}
              />
            </span>
          );
        })}
        {tagOverflow > 0 && <span className="okkly-autocomplete__overflow">+{tagOverflow}</span>}
      </div>
    );
  }

  function renderRow(index: number) {
    const option = autocomplete.filteredOptions[index];
    const highlighted = autocomplete.highlightedIndex === index;
    const selected = autocomplete.isSelected(option);
    const optionProps = autocomplete.getOptionProps(index, {
      className: [
        "okkly-autocomplete__option",
        highlighted && "okkly-autocomplete__option--highlighted",
        selected && "okkly-autocomplete__option--selected",
      ]
        .filter(Boolean)
        .join(" "),
    });
    const key = `${labelFor(option)}-${index}`;

    if (renderOption) {
      // The row is keyed here rather than through `props`: React 19 warns when
      // a spread object carries `key`, and `<li {...props}>` is the whole point
      // of the prop. Callers get a props object they can spread as-is.
      return (
        <Fragment key={key}>
          {renderOption(optionProps as HTMLAttributes<HTMLLIElement>, option, {
            selected,
            highlighted,
            index,
            inputValue: autocomplete.inputValue,
            multiple,
            size,
          })}
        </Fragment>
      );
    }

    const description = getOptionDescription?.(option);

    return (
      <li key={key} {...optionProps}>
        <span className="okkly-autocomplete__option-label">{labelFor(option)}</span>
        {description && <span className="okkly-autocomplete__option-meta">{description}</span>}
        {selected && (
          <span
            className="okkly-autocomplete__option-check"
            dangerouslySetInnerHTML={{ __html: iconCheck }}
            aria-hidden="true"
          />
        )}
      </li>
    );
  }

  function renderListContent() {
    if (loading) {
      if (renderLoading) return renderLoading({ inputValue: autocomplete.inputValue });
      return (
        <li className="okkly-autocomplete__loading">
          <Spinner size="small" />
          {loadingText}
        </li>
      );
    }
    if (autocomplete.filteredOptions.length === 0) {
      if (renderNoOptions) return renderNoOptions({ inputValue: autocomplete.inputValue });
      return <li className="okkly-autocomplete__empty">{noOptionsText}</li>;
    }
    if (autocomplete.groupedOptions) {
      return autocomplete.groupedOptions.map((group) => {
        const children = group.options.map(({ index }) => renderRow(index));
        if (renderGroup)
          return renderGroup({ key: group.key, label: group.label, group, children });
        return (
          <li key={group.key} role="presentation">
            <span className="okkly-autocomplete__group-label" role="presentation">
              {group.label}
            </span>
            <ul className="okkly-autocomplete__group-options" role="group" aria-label={group.label}>
              {children}
            </ul>
          </li>
        );
      });
    }
    return autocomplete.filteredOptions.map((_, index) => renderRow(index));
  }

  const endAdornment = (
    <>
      {!disableClearable && (
        <button {...clearProps}>
          <span dangerouslySetInnerHTML={{ __html: iconX }} aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        className="okkly-autocomplete__toggle"
        tabIndex={-1}
        aria-label={autocomplete.isOpen ? closeText : openText}
        onClick={() => autocomplete.setOpen(!autocomplete.isOpen)}
        disabled={disabled}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: autocomplete.isOpen ? iconChevronUp : iconChevronDown,
          }}
          aria-hidden="true"
        />
      </button>
    </>
  );

  const selectedForForm = multiple
    ? tags
    : autocomplete.value != null
      ? [autocomplete.value as T]
      : [];

  /**
   * A custom control decides where the clear and toggle buttons go, so they are
   * handed to `renderInput` instead of being placed by the Field. Leaving them
   * in both places would draw two chevrons.
   */
  const controlContent = renderInput ? (
    renderInput({
      inputProps: { ...inputProps, ref: mergedInputRef },
      tags: renderTagRow(),
      endAdornment,
      state: {
        open: autocomplete.isOpen,
        disabled,
        error,
        multiple,
        size,
        color,
        inputValue: autocomplete.inputValue,
        value: autocomplete.value,
      },
    })
  ) : (
    <>
      {renderTagRow()}
      <input {...inputProps} ref={mergedInputRef} />
    </>
  );

  return (
    <Field
      block="okkly-autocomplete"
      id={fieldId}
      label={label}
      hideLabel={hideLabel}
      required={required}
      size={size}
      color={color}
      error={error}
      helperText={helperText}
      disabled={disabled}
      fullWidth={fullWidth}
      endAdornment={renderInput ? undefined : endAdornment}
      controlProps={{ ref: setControlRef, onClick: handleControlClick }}
      className={className}
    >
      {controlContent}

      {name &&
        selectedForForm.map((item, index) => (
          <input
            key={`${labelFor(item)}-${index}`}
            type="hidden"
            name={name}
            value={labelFor(item)}
          />
        ))}

      <Popper
        open={autocomplete.isOpen}
        anchorEl={controlNode}
        placement="bottom-start"
        className="okkly-autocomplete-popper"
        modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
        matchAnchorWidth="min"
        style={popupWidth === undefined ? undefined : { width: popupWidth }}
        role="presentation"
      >
        {/* The panel is portaled to <body>, so the field's size modifier does
            not reach it by inheritance — it is copied on explicitly. */}
        <div
          ref={panelRef}
          className={
            size === "medium"
              ? "okkly-autocomplete-popover"
              : `okkly-autocomplete-popover okkly-autocomplete-popover--${size}`
          }
        >
          {/* Names the BEM block for the option primitives, so a `renderOption`
              built from them picks up this listbox's styling. */}
          <OptionScope block="okkly-autocomplete">
            <ul {...autocomplete.getListboxProps({ className: "okkly-autocomplete__listbox" })}>
              {renderListContent()}
            </ul>
          </OptionScope>
        </div>
      </Popper>
    </Field>
  );
}

export const Autocomplete = forwardRef(AutocompleteInner) as <T = AutocompleteOption>(
  props: AutocompleteProps<T> & { ref?: ForwardedRef<HTMLInputElement> },
) => ReactElement;
