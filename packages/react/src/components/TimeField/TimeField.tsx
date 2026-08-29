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
import { iconClock } from "@okryshto/icons";
import {
  maskitoParseTime,
  maskitoStringifyTime,
  maskitoTime,
  type MaskitoTimeParams,
} from "@maskito/kit";
import { useMaskito } from "@maskito/react";
import "@okryshto/design-system/components/TimeField/TimeField.scss";
import { Field, getFieldIds, type FieldColor, type FieldSize } from "../Field/Field";
import { Popover } from "../Popover/Popover";
import { TimePicker, type TimePickerValue } from "../TimePicker/TimePicker";

export type TimeFieldSize = FieldSize;
export type TimeFieldColor = FieldColor;

const TIME_PARAMS: MaskitoTimeParams = { mode: "HH:MM" };

function dateToMs(date: Date): number {
  return (
    ((date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds()) * 1000 +
    date.getMilliseconds()
  );
}

function msToDate(ms: number): Date {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const milliseconds = ms % 1000;
  const date = new Date();
  date.setHours(hours, minutes, seconds, milliseconds);
  return date;
}

function dateToTimeValue(date: Date): TimePickerValue {
  return { h: date.getHours(), m: date.getMinutes() };
}

function timeValueToDate(time: TimePickerValue): Date {
  const date = new Date();
  date.setHours(time.h, time.m, 0, 0);
  return date;
}

function stringifyTime(value: Date | null | undefined): string {
  if (!value) return "";
  return maskitoStringifyTime(dateToMs(value), TIME_PARAMS);
}

function isCompleteTime(text: string): boolean {
  return /^\d{2}:\d{2}$/.test(text);
}

/**
 * Closest MUI counterpart is MUI X's `TimeField` /
 * `TimePicker` (https://mui.com/x/react-date-pickers/time-field/): masked
 * text input with a time popover. Deliberate gaps: no `sx`/`slots`, fixed
 * `HH:mm` mask, and the value API is `Date | null` (time-of-day on a
 * fixed base day) for consistency with `DateField` / `DateTimeField`.
 */
export interface TimeFieldProps {
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
   * @type {TimeFieldSize}
   */
  size?: TimeFieldSize;
  /**
   * Color.
   *
   * @default "primary"
   * @type {TimeFieldColor}
   */
  color?: TimeFieldColor;
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
   * @default "HH:mm"
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

export const TimeField = forwardRef<HTMLInputElement, TimeFieldProps>(function TimeField(
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
    open: openProp,
    onOpenChange,
    placeholder = "HH:mm",
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
    stringifyTime(valueProp !== undefined ? valueProp : defaultValue),
  );
  const valueKey =
    valueProp === undefined ? "uncontrolled" : valueProp ? valueProp.getTime() : "null";

  useEffect(() => {
    if (valueProp === undefined) return;
    setText(stringifyTime(valueProp));
  }, [valueKey, valueProp]);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = openProp !== undefined ? openProp : uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const maskOptions = useMemo(() => maskitoTime(TIME_PARAMS), []);
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
    if (!isCompleteTime(next)) return;
    const ms = maskitoParseTime(next, TIME_PARAMS);
    if (Number.isFinite(ms)) commit(msToDate(ms));
  };

  const handlePickerChange = (time: TimePickerValue) => {
    const next = timeValueToDate(time);
    setText(stringifyTime(next));
    commit(next);
  };

  // A plain button, not `IconButton`: the field's control box already supplies
  // the padding, so a button with its own hit box inflated the field's height.
  const trigger = (
    <button
      type="button"
      className="okryshto-time-field__trigger"
      disabled={disabled}
      aria-label="Open time picker"
      aria-expanded={isOpen}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={() => setOpen(!isOpen)}
      dangerouslySetInnerHTML={{ __html: iconClock }}
    />
  );

  return (
    <>
      <Field
        block="okryshto-time-field"
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
          className="okryshto-time-field__input"
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
        // Aligned to the field's right edge: the picker is much narrower than
        // the field, and the trigger it belongs to sits on that side.
        placement="bottom-end"
        className="okryshto-time-field-popover"
      >
        <TimePicker
          value={resolvedValue ? dateToTimeValue(resolvedValue) : undefined}
          onChange={handlePickerChange}
          color={color}
        />
      </Popover>
    </>
  );
});
