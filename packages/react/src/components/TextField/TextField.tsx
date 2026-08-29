import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import "@okryshto/design-system/components/TextField/TextField.scss";
import { Field, getFieldIds, type FieldColor, type FieldSize } from "../Field/Field";

export type TextFieldSize = FieldSize;
export type TextFieldColor = FieldColor;

/**
 * Props follow MUI's TextField API (https://mui.com/material-ui/api/text-field/)
 * as closely as this design allows: `label`/`size`/`error`/`helperText`/
 * `disabled`/`fullWidth`/`color`/`value`/`onChange`/`required` all match
 * name-for-name, and `startAdornment`/`endAdornment` are lifted to the top
 * level rather than living under `InputProps`.
 * Deliberate gaps: no `sx`/`classes`/`slots`/`slotProps` (no CSS-in-JS system
 * here), no `variant` (the design has one visual treatment, not
 * filled/outlined/standard), no `multiline`/`rows`/`select`/`margin` (not in
 * this component's Figma spec — would be new, undesigned surface).
 */
export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "color"
> {
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
   * @type {TextFieldSize}
   */
  size?: TextFieldSize;
  /**
   * Tints the focus ring/glow. `dante` is a rare, deliberate accent moment.
   *
   * @default "primary"
   * @type {TextFieldColor}
   */
  color?: TextFieldColor;
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
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   * @type {boolean}
   */
  required?: boolean;
  /**
   * Content rendered inside the border, before the input.
   *
   * @default undefined
   * @type {ReactNode}
   */
  startAdornment?: ReactNode;
  /**
   * Content rendered inside the border, after the input.
   *
   * @default undefined
   * @type {ReactNode}
   */
  endAdornment?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hideLabel = false,
    size = "medium",
    color = "primary",
    error = false,
    helperText,
    fullWidth = false,
    disabled = false,
    required = false,
    startAdornment,
    endAdornment,
    className,
    id,
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const { helperId } = getFieldIds(inputId, Boolean(label), Boolean(helperText));

  return (
    <Field
      block="okryshto-text-field"
      id={inputId}
      label={label}
      hideLabel={hideLabel}
      required={required}
      size={size}
      color={color}
      error={error}
      helperText={helperText}
      disabled={disabled}
      fullWidth={fullWidth}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      className={className}
    >
      <input
        ref={ref}
        id={inputId}
        className="okryshto-text-field__input"
        disabled={disabled}
        required={required}
        aria-invalid={error || undefined}
        aria-describedby={[helperId, ariaDescribedBy].filter(Boolean).join(" ") || undefined}
        {...rest}
      />
    </Field>
  );
});
