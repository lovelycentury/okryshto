import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { iconChevronDown, iconChevronUp, iconMinus, iconPlus } from "@okryshto/icons";
import "@okryshto/design-system/components/NumberInput/NumberInput.scss";

export type NumberInputSize = "small" | "medium" | "large";
export type NumberInputColor = "primary" | "dante";
export type NumberInputControls = "stepper" | "chevrons";

/**
 * Props follow MUI's TextField API (https://mui.com/material-ui/api/text-field/)
 * where applicable: `label`/`size`/`error`/`helperText`/`disabled`/`fullWidth`/
 * `color`/`min`/`max`/`step` all match name-for-name.
 * Deliberate gaps: no `sx`/`classes`/`slots`/`slotProps`, no `variant`, and
 * `onChange` is value-focused — `(value: number | null) => void` instead of
 * MUI's `(event) => void` (native `type="number"` fields still emit events;
 * this component parses the numeric value for you).
 */
export interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "color" | "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step"
> {
  /**
   * Current numeric value. `null` renders an empty field.
   *
   * @default undefined
   * @type {number | null}
   */
  value?: number | null;
  /**
   * Uncontrolled initial value.
   *
   * @default null
   * @type {number | null}
   */
  defaultValue?: number | null;
  /**
   * Called with the parsed numeric value (`null` when empty).
   *
   * @default undefined
   * @type {(value: number | null) => void}
   */
  onChange?: (value: number | null) => void;
  /**
   * Field label.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Visually hides the label (still present for assistive tech).
   *
   * @default false
   * @type {boolean}
   */
  hideLabel?: boolean;
  /**
   * Field height & text.
   *
   * @default "medium"
   * @type {NumberInputSize}
   */
  size?: NumberInputSize;
  /**
   * Tints the focus ring/glow.
   *
   * @default "primary"
   * @type {NumberInputColor}
   */
  color?: NumberInputColor;
  /**
   * Marks invalid + red border.
   *
   * @default false
   * @type {boolean}
   */
  error?: boolean;
  /**
   * Text below field.
   *
   * @default undefined
   * @type {ReactNode}
   */
  helperText?: ReactNode;
  /**
   * If `true`, the field takes the full width of its container.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Trailing +/- layout (`stepper`) or up/down chevrons (`chevrons`).
   *
   * @default "stepper"
   * @type {NumberInputControls}
   */
  controls?: NumberInputControls;
  /**
   * Lower bound for stepping and clamping.
   *
   * @default undefined
   * @type {number}
   */
  min?: number;
  /**
   * Upper bound for stepping and clamping.
   *
   * @default undefined
   * @type {number}
   */
  max?: number;
  /**
   * Increment amount for steppers and arrow keys.
   *
   * @default 1
   * @type {number}
   */
  step?: number;
}

function formatDisplayValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function parseInputValue(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

function clampValue(value: number, min?: number, max?: number): number {
  let next = value;
  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);
  return next;
}

function stepBase(current: number | null, min?: number): number {
  if (current !== null) return current;
  return min ?? 0;
}

function applyStep(
  current: number | null,
  direction: 1 | -1,
  step: number,
  min?: number,
  max?: number,
): number {
  const next = stepBase(current, min) + direction * step;
  return clampValue(next, min, max);
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    label,
    hideLabel = false,
    size = "medium",
    color = "primary",
    error = false,
    helperText,
    fullWidth = false,
    disabled = false,
    controls = "stepper",
    value: valueProp,
    defaultValue = null,
    onChange,
    min,
    max,
    step = 1,
    className,
    id,
    onBlur,
    onKeyDown,
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  const isControlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(defaultValue);
  const [draftText, setDraftText] = useState<string | null>(null);

  const resolvedValue = isControlled ? (valueProp ?? null) : uncontrolledValue;
  const numericValue = resolvedValue;
  const displayValue = draftText ?? formatDisplayValue(numericValue);
  const base = stepBase(resolvedValue, min);
  const canIncrement = max === undefined || base < max;
  const canDecrement = min === undefined || base > min;

  const setValue = useCallback(
    (next: number | null, options?: { clearDraft?: boolean }) => {
      const clamped = next === null ? null : clampValue(next, min, max);
      if (!isControlled) setUncontrolledValue(clamped);
      if (options?.clearDraft !== false) setDraftText(null);
      onChange?.(clamped);
    },
    [isControlled, max, min, onChange],
  );

  const handleStep = useCallback(
    (direction: 1 | -1) => {
      if (isControlled) {
        setValue(applyStep(valueProp ?? null, direction, step, min, max));
        return;
      }

      setUncontrolledValue((previous) => {
        const next = applyStep(previous, direction, step, min, max);
        onChange?.(next);
        setDraftText(null);
        return next;
      });
    },
    [isControlled, max, min, onChange, setValue, step, valueProp],
  );

  const classes = [
    "okryshto-component",
    "okryshto-number-input",
    color !== "primary" && `okryshto-number-input--color-${color}`,
    size !== "medium" && `okryshto-number-input--${size}`,
    error && "okryshto-number-input--error",
    fullWidth && "okryshto-number-input--full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const controlsClasses = [
    "okryshto-number-input__controls",
    controls !== "stepper" && "okryshto-number-input__controls--chevrons",
  ]
    .filter(Boolean)
    .join(" ");

  const incrementIcon = controls === "stepper" ? iconPlus : iconChevronUp;
  const decrementIcon = controls === "stepper" ? iconMinus : iconChevronDown;

  const handleInputChange: InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const text = event.target.value;
    setDraftText(text);
    setValue(parseInputValue(text), { clearDraft: false });
  };

  const handleBlur: InputHTMLAttributes<HTMLInputElement>["onBlur"] = (event) => {
    if (numericValue !== null) {
      setValue(clampValue(numericValue, min, max));
    } else {
      setDraftText(null);
    }
    onBlur?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!disabled && canIncrement) handleStep(1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!disabled && canDecrement) handleStep(-1);
    }
    onKeyDown?.(event);
  };

  return (
    <div className={classes}>
      {label && (
        <label
          htmlFor={inputId}
          className={`okryshto-number-input__label${hideLabel ? " okryshto-number-input__label--hidden" : ""}`}
        >
          {label}
        </label>
      )}
      <div className="okryshto-number-input__control">
        <input
          ref={ref}
          id={inputId}
          type="text"
          inputMode="decimal"
          className="okryshto-number-input__input"
          value={displayValue}
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-describedby={[helperId, ariaDescribedBy].filter(Boolean).join(" ") || undefined}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...rest}
        />
        <div className={controlsClasses}>
          <button
            type="button"
            className="okryshto-number-input__step okryshto-number-input__step--increment"
            aria-label="Increase value"
            disabled={disabled || !canIncrement}
            tabIndex={-1}
            onClick={() => handleStep(1)}
          >
            <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: incrementIcon }} />
          </button>
          <button
            type="button"
            className="okryshto-number-input__step okryshto-number-input__step--decrement"
            aria-label="Decrease value"
            disabled={disabled || !canDecrement}
            tabIndex={-1}
            onClick={() => handleStep(-1)}
          >
            <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: decrementIcon }} />
          </button>
        </div>
      </div>
      {helperText && (
        <span id={helperId} className="okryshto-number-input__helper">
          {helperText}
        </span>
      )}
    </div>
  );
});
