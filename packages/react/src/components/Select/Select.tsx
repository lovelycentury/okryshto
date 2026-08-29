import {
  forwardRef,
  Fragment,
  useCallback,
  useId,
  useRef,
  useState,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { iconCheck, iconChevronDown, iconX } from "@okryshto/icons";
import {
  useSelect,
  type OptionGroup,
  type SelectOption,
  type SelectionChangeHandler,
} from "@okryshto/react-hooks";
import "@okryshto/design-system/components/Select/Select.scss";
import { Popper } from "../Popper/Popper";
import { Checkbox } from "../Checkbox/Checkbox";
import { Chip } from "../Chip/Chip";
import { Spinner } from "../Spinner/Spinner";
import { Field, getFieldIds, type FieldColor, type FieldSize } from "../Field/Field";
import { useOutsideDismiss } from "../Field/useOutsideDismiss";
import { OptionScope } from "../Option/Option";

export type SelectSize = FieldSize;
export type SelectColor = FieldColor;

export type { SelectOption };

/** What a row's `renderOption` is told about the row it is drawing. */
export interface SelectOptionState {
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
   * Index into the flat option list — the same index space the keyboard
   * navigation uses.
   *
   * @default undefined
   * @type {number}
   */
  index: number;
  /**
   * Whether the option itself is disabled.
   *
   * @default undefined
   * @type {boolean}
   */
  disabled: boolean;
  /**
   * Whether the field is in multiple mode — the default row draws a checkbox
   * instead of a tick when it is.
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
   * @type {SelectSize}
   */
  size: SelectSize;
}

/** Everything needed to rebuild the trigger. */
export interface SelectRenderInputParams<T = string> {
  /**
   * Props for the element that acts as the combobox, `ref` included. Spread
   * them on a single element or the field loses its role, its keyboard
   * handling and its label association. It must not be a `<button>`: removable
   * chips render buttons inside it.
   *
   * @default undefined
   * @type {*}
   */
  triggerProps: React.HTMLAttributes<HTMLDivElement> & {
    ref: React.Ref<HTMLDivElement>;
    id: string;
    role?: string;
  };
  /**
   * The default trigger content — placeholder, label or chips, already
   * `renderValue`-aware. Use it as a starting point, or ignore it.
   *
   * @default undefined
   * @type {ReactNode}
   */
  value: ReactNode;
  /**
   * The currently selected options.
   *
   * @default undefined
   * @type {SelectOption<T>[]}
   */
  selected: SelectOption<T>[];
  /**
   * The clear button and the chevron. They are handed over rather than kept
   * outside, so a custom trigger decides where — or whether — they sit.
   *
   * @default undefined
   * @type {ReactNode}
   */
  endAdornment: ReactNode;
  /**
   * State a custom trigger usually needs to reflect.
   *
   * @default undefined
   * @type {*}
   */
  state: {
    open: boolean;
    disabled: boolean;
    error: boolean;
    multiple: boolean;
    size: SelectSize;
    color: SelectColor;
  };
}

/** A group header plus the rows underneath it. */
export interface SelectRenderGroupParams<T = string> {
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
   * @type {OptionGroup<SelectOption<T>>}
   */
  group: OptionGroup<SelectOption<T>>;
  /**
   * The already-rendered rows of this group.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

/**
 * Props follow MUI's Select API (https://mui.com/material-ui/api/select/) as
 * closely as this design allows: `value`/`onChange`/`multiple`/`disabled`/
 * `label`/`error`/`helperText`/`fullWidth`/`size`/`required`/`name`/
 * `renderValue` match name-for-name, and the Autocomplete-family additions
 * `groupBy`/`isOptionEqualToValue`/`limitTags`/`disableCloseOnSelect`/
 * `disableClearable`/`noOptionsText`/`loadingText` behave as they do there.
 *
 * Deliberate gaps: no `sx`/`classes`/`slots`/`slotProps`, no `native`/
 * `MenuProps`, and options are passed via `options` rather than `<MenuItem>`
 * children — `renderValue`, `renderOption` and `groupBy` cover what children
 * would otherwise be needed for.
 *
 * One intentional divergence: `onChange` is `(event, value, reason, details)`,
 * matching Autocomplete, instead of MUI Select's `(event, child)` with the
 * value hidden on `event.target.value`.
 */
export interface SelectProps<T = string> {
  /**
   * Options.
   *
   * @default undefined
   * @type {SelectOption<T>[]}
   */
  options: SelectOption<T>[];
  /**
   * Value.
   *
   * @default undefined
   * @type {T | T[] | null}
   */
  value?: T | T[] | null;
  /**
   * Default Value.
   *
   * @default undefined
   * @type {T | T[] | null}
   */
  defaultValue?: T | T[] | null;
  /**
   * Multiple.
   *
   * @default false
   * @type {boolean}
   */
  multiple?: boolean;
  /**
   * On Change.
   *
   * @default undefined
   * @type {SelectionChangeHandler<SelectOption<T>, T | T[] | null>}
   */
  onChange?: SelectionChangeHandler<SelectOption<T>, T | T[] | null>;
  /**
   * Disabled.
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
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open?: boolean;
  /**
   * On Open Change.
   *
   * @default undefined
   * @type {(open: boolean) => void}
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Label.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Hide Label.
   *
   * @default false
   * @type {boolean}
   */
  hideLabel?: boolean;
  /**
   * Placeholder.
   *
   * @default "Select…"
   * @type {string}
   */
  placeholder?: string;
  /**
   * Size.
   *
   * @default "medium"
   * @type {SelectSize}
   */
  size?: SelectSize;
  /**
   * Color.
   *
   * @default "primary"
   * @type {SelectColor}
   */
  color?: SelectColor;
  /**
   * Error.
   *
   * @default false
   * @type {boolean}
   */
  error?: boolean;
  /**
   * Helper Text.
   *
   * @default undefined
   * @type {ReactNode}
   */
  helperText?: ReactNode;
  /**
   * Full Width.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Loading.
   *
   * @default false
   * @type {boolean}
   */
  loading?: boolean;
  /**
   * Emits hidden inputs so the value reaches a plain `<form>` submit.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Groups options under sticky headers; also reorders them so groups are contiguous.
   *
   * @default undefined
   * @type {(option: SelectOption<T>) => string}
   */
  groupBy?: (option: SelectOption<T>) => string;
  /**
   * Required when values are objects — the default compares with `Object.is`.
   *
   * @default undefined
   * @type {(option: SelectOption<T>, value: T) => boolean}
   */
  isOptionEqualToValue?: (option: SelectOption<T>, value: T) => boolean;
  /**
   * Chips shown before collapsing to "+N". `-1` shows all. Multi-select only.
   *
   * @default 2
   * @type {number}
   */
  limitTags?: number;
  /**
   * Disable Close On Select.
   *
   * @default undefined
   * @type {boolean}
   */
  disableCloseOnSelect?: boolean;
  /**
   * Disable Clearable.
   *
   * @default false
   * @type {boolean}
   */
  disableClearable?: boolean;
  /**
   * Replaces the whole trigger content. Receives the selected options.
   *
   * @default undefined
   * @type {(selected: SelectOption<T>[]) => ReactNode}
   */
  renderValue?: (selected: SelectOption<T>[]) => ReactNode;
  /**
   * Replaces one option row. `props` must be spread on a single `<li>` — they
   * carry the option role, the id `aria-activedescendant` points at, the state
   * modifiers and the pointer handlers. The row's key is applied for you, so
   * the object can be spread as-is.
   *
   * @default undefined
   * @type {(props: React.HTMLAttributes<HTMLLIElement>, option: SelectOption<T>, state: SelectOptionState) => ReactNode}
   */
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: SelectOption<T>,
    state: SelectOptionState,
  ) => ReactNode;
  /**
   * Render Input. Rebuilds the trigger — its content and the adornments beside
   * it. The field shell around it (label, helper text, error, size) stays with
   * the component. `params.triggerProps` must be spread on one element.
   *
   * Prefer `renderValue` when only the text inside the trigger changes.
   *
   * @default undefined
   * @type {(params: SelectRenderInputParams<T>) => ReactNode}
   */
  renderInput?: (params: SelectRenderInputParams<T>) => ReactNode;
  /**
   * Render Group. Replaces a `groupBy` header and the list wrapping its rows.
   * The returned element must keep `children` inside a list container, since
   * they are `<li>`s.
   *
   * @default undefined
   * @type {(params: SelectRenderGroupParams<T>) => ReactNode}
   */
  renderGroup?: (params: SelectRenderGroupParams<T>) => ReactNode;
  /**
   * Render No Options. Replaces the empty-state row. Return an `<li>` — it is
   * rendered inside the listbox.
   *
   * @default undefined
   * @type {() => ReactNode}
   */
  renderNoOptions?: () => ReactNode;
  /**
   * Render Loading. Replaces the loading row. Return an `<li>`.
   *
   * @default undefined
   * @type {() => ReactNode}
   */
  renderLoading?: () => ReactNode;
  /**
   * No Options Text.
   *
   * @default "No options"
   * @type {ReactNode}
   */
  noOptionsText?: ReactNode;
  /**
   * Loading Text.
   *
   * @default "Loading…"
   * @type {ReactNode}
   */
  loadingText?: ReactNode;
  /**
   * Clear Text.
   *
   * @default "Clear"
   * @type {string}
   */
  clearText?: string;
  /**
   * Width of the dropdown panel. It is never narrower than the field; this is for the case where the options need more room than the trigger has.
   *
   * @default undefined
   * @type {number | string}
   */
  popupWidth?: number | string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  /**
   * Id.
   *
   * @default undefined
   * @type {string}
   */
  id?: string;
}

function SelectInner<T = string>(
  {
    options,
    value,
    defaultValue,
    multiple = false,
    onChange,
    disabled = false,
    required = false,
    open,
    onOpenChange,
    label,
    hideLabel = false,
    placeholder = "Select…",
    size = "medium",
    color = "primary",
    error = false,
    helperText,
    fullWidth = false,
    loading = false,
    name,
    groupBy,
    isOptionEqualToValue,
    limitTags = 2,
    disableCloseOnSelect,
    disableClearable = false,
    renderValue,
    renderOption,
    renderInput,
    renderGroup,
    renderNoOptions,
    renderLoading,
    noOptionsText = "No options",
    loadingText = "Loading…",
    clearText = "Clear",
    popupWidth,
    className,
    id,
  }: SelectProps<T>,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const { labelId, helperId } = getFieldIds(fieldId, Boolean(label), Boolean(helperText));
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const controlRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
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

  const select = useSelect({
    options,
    value,
    defaultValue,
    multiple,
    onChange,
    disabled,
    open,
    onOpenChange,
    isOptionEqualToValue,
    groupBy,
    disableCloseOnSelect,
    disableClearable,
  });

  // Popper, unlike Popover, has no backdrop and no dismissal of its own. The
  // whole control counts as "inside" — clicking its padding opens the popup, so
  // it must not close it on the way down.
  useOutsideDismiss([controlRef, panelRef], select.isOpen, () => select.setOpen(false));

  /**
   * The chevron and the field's own padding live outside the trigger div (they
   * are Field adornments), so without this they would be dead space. Clicks
   * that started on the trigger, a chip's × or the clear button are left to
   * their own handlers — otherwise every one of them would toggle twice.
   */
  function handleControlClick(event: React.MouseEvent<HTMLDivElement>) {
    if (disabled) return;
    // The popup is portaled out of the control but still React's child, and
    // React propagates synthetic events along its own tree — so without this a
    // click on an option would arrive here and toggle the popup shut again.
    if (!controlRef.current?.contains(event.target as Node)) return;
    if ((event.target as HTMLElement).closest("button, [role='combobox']")) return;
    select.setOpen(!select.isOpen);
    triggerRef.current?.focus();
  }

  const { selectedOptions } = select;
  const hasValue = selectedOptions.length > 0;

  const triggerProps = select.getTriggerProps({
    id: fieldId,
    className: "okryshto-select__trigger okryshto-select__input",
    "aria-invalid": error || undefined,
    "aria-required": required || undefined,
    "aria-labelledby": labelId,
    "aria-describedby": helperId,
    ref: (node) => {
      triggerRef.current = node as HTMLDivElement | null;
      if (typeof forwardedRef === "function") forwardedRef(node as HTMLDivElement | null);
      else if (forwardedRef) forwardedRef.current = node as HTMLDivElement | null;
    },
  });

  const clearProps = select.getClearProps({
    className: "okryshto-select__clear",
    "aria-label": clearText,
  });

  function renderTriggerContent() {
    if (renderValue) return renderValue(selectedOptions);

    if (!hasValue) {
      return (
        <span className="okryshto-select__value okryshto-select__value--placeholder">
          {placeholder}
        </span>
      );
    }

    if (!multiple) {
      return <span className="okryshto-select__value">{selectedOptions[0]?.label}</span>;
    }

    const shown = limitTags < 0 ? selectedOptions : selectedOptions.slice(0, limitTags);
    const overflow = selectedOptions.length - shown.length;

    return (
      <span className="okryshto-select__chips">
        {shown.map((option) => (
          <Chip
            key={String(option.value)}
            label={option.label}
            size="small"
            variant="solid"
            removable={!disabled}
            // The trigger is a div rather than a button precisely so these
            // remove buttons are legal here; stopping propagation keeps the
            // click from also toggling the popup.
            onRemove={(event) => {
              event?.stopPropagation?.();
              select.removeValue(event ?? null, option);
            }}
          />
        ))}
        {overflow > 0 && <span className="okryshto-select__overflow">+{overflow}</span>}
      </span>
    );
  }

  function renderRow(option: SelectOption<T>, index: number) {
    const selected = select.isSelected(option);
    const highlighted = select.highlightedIndex === index;
    const optionProps = select.getOptionProps(index, {
      className: [
        "okryshto-select__option",
        highlighted && "okryshto-select__option--highlighted",
        selected && "okryshto-select__option--selected",
        option.disabled && "okryshto-select__option--disabled",
      ]
        .filter(Boolean)
        .join(" "),
    });
    const key = `${String(option.value)}-${index}`;

    if (renderOption) {
      // The row is keyed here rather than through `props`: React 19 warns when
      // a spread object carries `key`, and `<li {...props}>` is the whole point
      // of the prop. Callers get a props object they can spread as-is.
      return (
        <Fragment key={key}>
          {renderOption(optionProps as React.HTMLAttributes<HTMLLIElement>, option, {
            selected,
            highlighted,
            index,
            disabled: option.disabled === true,
            multiple,
            size,
          })}
        </Fragment>
      );
    }

    return (
      <li key={key} {...optionProps}>
        {multiple && (
          <Checkbox
            checked={selected}
            disabled={option.disabled}
            size="small"
            readOnly
            tabIndex={-1}
          />
        )}
        <span className="okryshto-select__option-label">{option.label}</span>
        {!multiple && selected && (
          <span
            className="okryshto-select__option-check"
            dangerouslySetInnerHTML={{ __html: iconCheck }}
            aria-hidden="true"
          />
        )}
      </li>
    );
  }

  function renderListContent() {
    if (loading) {
      if (renderLoading) return renderLoading();
      return (
        <li className="okryshto-select__loading">
          <Spinner size="small" />
          {loadingText}
        </li>
      );
    }
    if (select.flatOptions.length === 0) {
      if (renderNoOptions) return renderNoOptions();
      return <li className="okryshto-select__empty">{noOptionsText}</li>;
    }
    if (select.groupedOptions) {
      return select.groupedOptions.map((group) => {
        const children = group.options.map(({ option, index }) => renderRow(option, index));
        if (renderGroup)
          return renderGroup({ key: group.key, label: group.label, group, children });
        return (
          <li key={group.key} role="presentation">
            <span className="okryshto-select__group-label" role="presentation">
              {group.label}
            </span>
            <ul className="okryshto-select__group-options" role="group" aria-label={group.label}>
              {children}
            </ul>
          </li>
        );
      });
    }
    return select.flatOptions.map((option, index) => renderRow(option, index));
  }

  const endAdornment = (
    <>
      {!disableClearable && hasValue && !disabled && (
        <button {...clearProps}>
          <span dangerouslySetInnerHTML={{ __html: iconX }} aria-hidden="true" />
        </button>
      )}
      <span
        className="okryshto-select__chevron"
        dangerouslySetInnerHTML={{ __html: iconChevronDown }}
        aria-hidden="true"
      />
    </>
  );

  return (
    <Field
      block="okryshto-select"
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
      // A `<label for>` can only target a real form control, and the trigger is
      // a div[role="combobox"]; the trigger points back with aria-labelledby.
      htmlFor={false}
      controlProps={{ ref: setControlRef, onClick: handleControlClick }}
      className={className}
    >
      {/* A custom trigger decides where the clear button and chevron go, so
          they are handed to `renderInput` instead of being placed by the
          Field — leaving them in both places would draw two chevrons. */}
      {renderInput ? (
        renderInput({
          triggerProps: triggerProps as SelectRenderInputParams<T>["triggerProps"],
          value: renderTriggerContent(),
          selected: selectedOptions,
          endAdornment,
          state: { open: select.isOpen, disabled, error, multiple, size, color },
        })
      ) : (
        <div {...triggerProps}>{renderTriggerContent()}</div>
      )}

      {name &&
        (multiple ? selectedOptions : selectedOptions.slice(0, 1)).map((option) => (
          <input
            key={String(option.value)}
            type="hidden"
            name={name}
            value={String(option.value)}
          />
        ))}

      <Popper
        open={select.isOpen}
        // The bordered control box, not the trigger div inside it: the trigger
        // sits within the control's padding, so anchoring there made the panel
        // narrower than the field and started it 12px too high — swallowing the
        // gap and confusing `flip` about how much room is left below.
        anchorEl={controlNode}
        placement="bottom-start"
        className="okryshto-select-popper"
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
              ? "okryshto-select-popover"
              : `okryshto-select-popover okryshto-select-popover--${size}`
          }
        >
          {/* Names the BEM block for the option primitives, so a `renderOption`
              built from them picks up this listbox's styling. */}
          <OptionScope block="okryshto-select">
            <ul {...select.getListboxProps({ className: "okryshto-select__listbox" })}>
              {renderListContent()}
            </ul>
          </OptionScope>
        </div>
      </Popper>
    </Field>
  );
}

export const Select = forwardRef(SelectInner) as <T = string>(
  props: SelectProps<T> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;
