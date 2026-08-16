import {
  forwardRef,
  useContext,
  useId,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import "@okryshto/design-system/components/Radio/Radio.scss";
import { RadioGroupContext } from "../RadioGroup/RadioGroupContext";

export type RadioSize = "small" | "medium" | "large";
export type RadioColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/**
 * Bare radio control — no built-in label prop, matching this design's own
 * spec (unlike Checkbox/TextField, whose prop tables do list `label`).
 * Nested inside a `RadioGroup`, it auto-wires `name`/`checked`/selection via
 * context (the "MUI RadioGroup" composition pattern from the design brief) —
 * `value` picks the option, `RadioGroup`'s `value`/`onChange` own the
 * selection. Standalone (no group), it's a normal controlled/uncontrolled
 * checkbox-shaped input via `checked`/`onChange`.
 */
export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "color" | "type" | "onChange"
> {
  /**
   * Selected in its group.
   *
   * @default undefined
   * @type {boolean}
   */
  checked?: boolean;
  /**
   * This option's value — required when nested inside a RadioGroup.
   *
   * @default undefined
   * @type {string}
   */
  value?: string;
  /**
   * Groups radios together. Auto-filled by a parent RadioGroup.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Control size.
   *
   * @default undefined
   * @type {RadioSize}
   */
  size?: RadioSize;
  /**
   * Fill colour (dante-ready).
   *
   * @default undefined
   * @type {RadioColor}
   */
  color?: RadioColor;
  /**
   * Non-interactive.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Optional label rendered beside the circle.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * On Change.
   *
   * @default undefined
   * @type {(event: ChangeEvent<HTMLInputElement>, checked: boolean) => void}
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { checked, value, name, size, color, disabled = false, label, className, id, onChange, ...rest },
  ref,
) {
  const group = useContext(RadioGroupContext);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const isGrouped = group !== null;
  const finalName = name ?? group?.name;
  const finalChecked = isGrouped ? group.value === value : checked;
  const finalDisabled = disabled || (group?.disabled ?? false);
  const finalSize = size ?? group?.size ?? "medium";
  const finalColor = color ?? group?.color ?? "primary";

  const classes = [
    "okryshto-component",
    "okryshto-radio",
    finalColor !== "primary" && `okryshto-radio--color-${finalColor}`,
    finalSize !== "medium" && `okryshto-radio--${finalSize}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label htmlFor={inputId} className={classes}>
      <span className="okryshto-radio__control">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="okryshto-radio__input"
          name={finalName}
          value={value}
          checked={finalChecked}
          disabled={finalDisabled}
          onChange={(event) => {
            if (isGrouped && value !== undefined) group.onSelect(value);
            onChange?.(event, event.target.checked);
          }}
          {...rest}
        />
        <span className="okryshto-radio__circle" aria-hidden="true" />
      </span>
      {label && <span className="okryshto-radio__label">{label}</span>}
    </label>
  );
});
