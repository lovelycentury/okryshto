"use client";

import {
  forwardRef,
  useId,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import "@okkly/design-system/components/Switch/Switch.scss";

export type SwitchSize = "small" | "medium" | "large";
export type SwitchColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/**
 * Props follow MUI's Switch API (https://mui.com/material-ui/api/switch/)
 * as closely as this design allows: `checked`/`defaultChecked`/`size`/
 * `disabled`/`onChange` match name-for-name. Deliberate gaps: no `sx`/
 * `classes`/`icon`/`checkedIcon` (no CSS-in-JS system). `label` is built
 * into this component (unlike MUI, which pairs Switch with a separate
 * FormControlLabel) — same decision as Checkbox's built-in label.
 */
export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "color" | "type" | "onChange"
> {
  /**
   * On/off value.
   *
   * @default undefined
   * @type {boolean}
   */
  checked?: boolean;
  /**
   * Initial on/off value (uncontrolled).
   *
   * @default undefined
   * @type {boolean}
   */
  defaultChecked?: boolean;
  /**
   * Track + thumb size.
   *
   * @default "medium"
   * @type {SwitchSize}
   */
  size?: SwitchSize;
  /**
   * Track fill when on (dante-ready).
   *
   * @default "primary"
   * @type {SwitchColor}
   */
  color?: SwitchColor;
  /**
   * Non-interactive.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Text beside the control.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Fires on toggle.
   *
   * @default undefined
   * @type {(event: ChangeEvent<HTMLInputElement>, checked: boolean) => void}
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked,
    size = "medium",
    color = "primary",
    disabled = false,
    label,
    className,
    id,
    onChange,
    ...rest
  },
  forwardedRef,
) {
  const localRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const setRef = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const classes = [
    "okkly-component",
    "okkly-switch",
    color !== "primary" && `okkly-switch--color-${color}`,
    size !== "medium" && `okkly-switch--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label htmlFor={inputId} className={classes}>
      <span className="okkly-switch__control">
        <input
          ref={setRef}
          id={inputId}
          type="checkbox"
          role="switch"
          className="okkly-switch__input"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={(event) => onChange?.(event, event.target.checked)}
          {...rest}
        />
        <span className="okkly-switch__track" aria-hidden="true">
          <span className="okkly-switch__thumb" />
        </span>
      </span>
      {label && <span className="okkly-switch__label">{label}</span>}
    </label>
  );
});
