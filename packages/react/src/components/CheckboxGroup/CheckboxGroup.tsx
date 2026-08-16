import { useId, useState, type ReactNode } from "react";
import "@okryshto/design-system/components/CheckboxGroup/CheckboxGroup.scss";
import type { CheckboxColor, CheckboxSize } from "../Checkbox/Checkbox";
import { CheckboxGroupContext } from "./CheckboxGroupContext";

export interface CheckboxGroupProps {
  /**
   * Groups checkboxes together. Auto-generated if omitted.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Selected values (controlled).
   *
   * @default undefined
   * @type {string[]}
   */
  value?: string[];
  /**
   * Initial values (uncontrolled).
   *
   * @default undefined
   * @type {string[]}
   */
  defaultValue?: string[];
  /**
   * Fires when the selection changes.
   *
   * @default undefined
   * @type {(value: string[]) => void}
   */
  onChange?: (value: string[]) => void;
  /**
   * Disables every nested Checkbox.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Applied to every nested Checkbox unless it sets its own.
   *
   * @default "medium"
   * @type {CheckboxSize}
   */
  size?: CheckboxSize;
  /**
   * Applied to every nested Checkbox unless it sets its own.
   *
   * @default "primary"
   * @type {CheckboxColor}
   */
  color?: CheckboxColor;
  /**
   * Optional group label (renders above the options, also used as aria-label).
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Nested `<Checkbox value="..." label="..." />` elements.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

/**
 * Groups `Checkbox` children via context — nest them directly rather than
 * passing an options array, mirroring RadioGroup's composition pattern
 * (multi-select instead of single). Deliberate gaps vs a hypothetical MUI
 * FormGroup: owns `value`/`onChange` as `string[]`, propagates size/color.
 */
export function CheckboxGroup({
  name,
  value,
  defaultValue,
  onChange,
  disabled = false,
  size = "medium",
  color = "primary",
  label,
  children,
  className,
}: CheckboxGroupProps) {
  const generatedName = useId();
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const currentValue = value ?? internalValue;

  const handleToggle = (option: string, checked: boolean) => {
    const next = checked
      ? currentValue.includes(option)
        ? currentValue
        : [...currentValue, option]
      : currentValue.filter((item) => item !== option);

    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const classes = ["okryshto-component", "okryshto-checkbox-group", className]
    .filter(Boolean)
    .join(" ");

  return (
    <CheckboxGroupContext.Provider
      value={{
        name: name ?? generatedName,
        value: currentValue,
        onToggle: handleToggle,
        disabled,
        size,
        color,
      }}
    >
      <div
        role="group"
        aria-label={typeof label === "string" ? label : undefined}
        className={classes}
      >
        {label && <span className="okryshto-checkbox-group__label">{label}</span>}
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  );
}
