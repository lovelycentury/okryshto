"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { iconCalendar, iconClock } from "@okryshto/icons";
import {
  maskitoDateTime,
  maskitoParseDateTime,
  maskitoStringifyDateTime,
  type MaskitoDateTimeParams,
} from "@maskito/kit";
import { useMaskito } from "@maskito/react";
import "@okryshto/design-system/components/DateTimeField/DateTimeField.scss";
import { DateTimePicker } from "../DateTimePicker/DateTimePicker";
import { Field, getFieldIds, type FieldColor, type FieldSize } from "../Field/Field";
import { Popover } from "../Popover/Popover";

export type DateTimeFieldSize = FieldSize;
export type DateTimeFieldColor = FieldColor;

const DATE_TIME_PARAMS: MaskitoDateTimeParams = {
  dateMode: "dd/mm/yyyy",
  timeMode: "HH:MM",
  dateTimeSeparator: ", ",
  dateSeparator: ".",
};

function stringifyDateTime(value: Date | null | undefined): string {
  if (!value) return "";
  return maskitoStringifyDateTime(value, DATE_TIME_PARAMS);
}

/**
 * Closest MUI counterpart is MUI X's `DateTimeField` /
 * `DateTimePicker` (https://mui.com/x/react-date-pickers/date-time-field/):
 * masked text input with a combined date+time popover. Deliberate gaps: no
 * `sx`/`slots`, fixed `dd.mm.yyyy, HH:mm` mask, and the picker closes on
 * Confirm via okryshto `DateTimePicker`.
 */
export interface DateTimeFieldProps {
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
   * Size.
   *
   * @default "medium"
   * @type {DateTimeFieldSize}
   */
  size?: DateTimeFieldSize;
  /**
   * Color.
   *
   * @default "primary"
   * @type {DateTimeFieldColor}
   */
  color?: DateTimeFieldColor;
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
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Value.
   *
   * @default undefined
   * @type {Date | null}
   */
  value?: Date | null;
  /**
   * Default Value.
   *
   * @default null
   * @type {Date | null}
   */
  defaultValue?: Date | null;
  /**
   * On Change.
   *
   * @default undefined
   * @type {(value: Date | null) => void}
   */
  onChange?: (value: Date | null) => void;
  /**
   * Min.
   *
   * @default undefined
   * @type {Date}
   */
  min?: Date;
  /**
   * Max.
   *
   * @default undefined
   * @type {Date}
   */
  max?: Date;
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
   * Placeholder.
   *
   * @default "dd.mm.yyyy, HH:mm"
   * @type {string}
   */
  placeholder?: string;
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
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   * @type {boolean}
   */
  required?: boolean;
}

export const DateTimeField = forwardRef<HTMLInputElement, DateTimeFieldProps>(
  function DateTimeField(
    {
      label,
      hideLabel = false,
      size = "medium",
      color = "primary",
      error = false,
      helperText,
      fullWidth = false,
      disabled = false,
      value: valueProp,
      defaultValue = null,
      onChange,
      min,
      max,
      open: openProp,
      onOpenChange,
      placeholder = "dd.mm.yyyy, HH:mm",
      className,
      id,
      required = false,
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const { helperId } = getFieldIds(inputId, Boolean(label), Boolean(helperText));
    const controlRef = useRef<HTMLDivElement>(null);

    const isControlled = valueProp !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue);
    const resolvedValue = isControlled ? (valueProp ?? null) : uncontrolledValue;

    const [text, setText] = useState(() =>
      stringifyDateTime(valueProp !== undefined ? valueProp : defaultValue),
    );
    const valueKey =
      valueProp === undefined ? "uncontrolled" : valueProp ? valueProp.getTime() : "null";

    useEffect(() => {
      if (valueProp === undefined) return;
      setText(stringifyDateTime(valueProp));
    }, [valueKey, valueProp]);

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isOpen = openProp !== undefined ? openProp : uncontrolledOpen;

    const setOpen = (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    };

    const dateTimeParams = useMemo<MaskitoDateTimeParams>(
      () => ({ ...DATE_TIME_PARAMS, min, max }),
      [min, max],
    );
    const maskOptions = useMemo(() => maskitoDateTime(dateTimeParams), [dateTimeParams]);
    const maskitoRef = useMaskito({ options: maskOptions });

    const setInputRef = (node: HTMLInputElement | null) => {
      maskitoRef(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const commit = (next: Date | null) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    };

    const handleInput = (event: FormEvent<HTMLInputElement>) => {
      const next = event.currentTarget.value;
      setText(next);
      if (next === "") {
        commit(null);
        return;
      }
      const parsed = maskitoParseDateTime(next, dateTimeParams);
      if (parsed) commit(parsed);
    };

    const handlePickerChange = (date: Date) => {
      setText(maskitoStringifyDateTime(date, dateTimeParams));
      commit(date);
    };

    const handleConfirm = (date: Date) => {
      setText(maskitoStringifyDateTime(date, dateTimeParams));
      commit(date);
      setOpen(false);
    };

    // A plain button, not `IconButton`: the field's control box already supplies
    // the padding, so a button with its own hit box inflated the field's height.
    const trigger = (
      <button
        type="button"
        className="okryshto-date-time-field__trigger"
        disabled={disabled}
        aria-label="Open date time picker"
        aria-expanded={isOpen}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => setOpen(!isOpen)}
      >
        <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconCalendar }} />
        <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconClock }} />
      </button>
    );

    return (
      <>
        <Field
          block="okryshto-date-time-field"
          id={inputId}
          label={label}
          hideLabel={hideLabel}
          size={size}
          color={color}
          error={error}
          helperText={helperText}
          disabled={disabled}
          required={required}
          fullWidth={fullWidth}
          className={className}
          controlProps={{ ref: controlRef }}
          endAdornment={trigger}
        >
          <input
            ref={setInputRef}
            id={inputId}
            type="text"
            inputMode="numeric"
            className="okryshto-date-time-field__input"
            value={text}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            aria-invalid={error || undefined}
            aria-describedby={helperId}
            onInput={handleInput}
          />
        </Field>

        <Popover
          open={isOpen}
          anchorEl={controlRef.current}
          onClose={() => setOpen(false)}
          placement="bottom-start"
          className="okryshto-date-time-field-popover"
        >
          <DateTimePicker
            value={resolvedValue}
            onChange={handlePickerChange}
            onConfirm={handleConfirm}
            min={min}
            max={max}
            color={color}
          />
        </Popover>
      </>
    );
  },
);
