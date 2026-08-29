"use client";

import type { HTMLAttributes, Ref, ReactNode } from "react";

export type FieldSize = "small" | "medium" | "large";
export type FieldColor = "primary" | "dante";

export interface FieldProps {
  /**
   * BEM block the emitted classes are namespaced under, e.g. `"okryshto-select"`. Each consumer keeps its own block so its public class names — the ones apps target in overrides — stay exactly what they were.
   *
   * @default undefined
   * @type {string}
   */
  block: string;
  /**
   * Id of the control this field wraps; the label's `for` and the helper id derive from it.
   *
   * @default undefined
   * @type {string}
   */
  id: string;
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
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   * @type {boolean}
   */
  required?: boolean;
  /**
   * Size.
   *
   * @default "medium"
   * @type {FieldSize}
   */
  size?: FieldSize;
  /**
   * Color.
   *
   * @default "primary"
   * @type {FieldColor}
   */
  color?: FieldColor;
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
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Full Width.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Start Adornment.
   *
   * @default undefined
   * @type {ReactNode}
   */
  startAdornment?: ReactNode;
  /**
   * End Adornment.
   *
   * @default undefined
   * @type {ReactNode}
   */
  endAdornment?: ReactNode;
  /**
   * `<label for>` only works for real form controls, so a wrapper whose control is a `div[role="combobox"]` (Select) passes `false` and points at `${id}-label` with `aria-labelledby` instead.
   *
   * @default undefined
   * @type {string | false}
   */
  htmlFor?: string | false;
  /**
   * Applied to the bordered control box — Autocomplete anchors its popup on it.
   *
   * @default undefined
   * @type {*}
   */
  controlProps?: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> };
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

/**
 * The shared shell behind TextField, Select and Autocomplete: label row,
 * bordered control box with optional adornments, and helper text.
 *
 * Internal on purpose — it is not exported from the package. It exists to stop
 * the three components from re-implementing (and slowly disagreeing about)
 * focus rings, error colours and label spacing, not to become a public
 * layout primitive. Its styling counterpart is the `field.shell` SCSS mixin.
 */
export function Field({
  block,
  id,
  label,
  hideLabel = false,
  required = false,
  size = "medium",
  color = "primary",
  error = false,
  helperText,
  disabled = false,
  fullWidth = false,
  startAdornment,
  endAdornment,
  htmlFor,
  controlProps,
  className,
  children,
}: FieldProps) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const labelId = label ? `${id}-label` : undefined;

  const classes = [
    "okryshto-component",
    block,
    color !== "primary" && `${block}--color-${color}`,
    size !== "medium" && `${block}--${size}`,
    error && `${block}--error`,
    disabled && `${block}--disabled`,
    fullWidth && `${block}--full-width`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const { className: controlClassName, ...restControlProps } = controlProps ?? {};

  return (
    <div className={classes}>
      {label && (
        <label
          id={labelId}
          htmlFor={htmlFor === false ? undefined : (htmlFor ?? id)}
          className={`${block}__label${hideLabel ? ` ${block}__label--hidden` : ""}`}
        >
          {label}
          {required && (
            <span className={`${block}__required`} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div
        className={[`${block}__control`, controlClassName].filter(Boolean).join(" ")}
        {...restControlProps}
      >
        {startAdornment && <span className={`${block}__adornment`}>{startAdornment}</span>}
        {children}
        {endAdornment && <span className={`${block}__adornment`}>{endAdornment}</span>}
      </div>

      {helperText && (
        <span id={helperId} className={`${block}__helper`}>
          {helperText}
        </span>
      )}
    </div>
  );
}

/** Ids `Field` derives from the control id, so callers can wire aria attributes to them. */
export function getFieldIds(id: string, hasLabel: boolean, hasHelperText: boolean) {
  return {
    labelId: hasLabel ? `${id}-label` : undefined,
    helperId: hasHelperText ? `${id}-helper` : undefined,
  };
}
