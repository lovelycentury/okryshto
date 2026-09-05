"use client";

import { useId, useState, type ReactNode } from "react";
import "@okkly/design-system/components/RadioGroup/RadioGroup.scss";
import type { RadioColor, RadioSize } from "../Radio/Radio";
import { RadioGroupContext } from "./RadioGroupContext";

export interface RadioGroupProps {
  /**
   * Groups radios together. Auto-generated if omitted.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Selected value (controlled).
   *
   * @default undefined
   * @type {string}
   */
  value?: string;
  /**
   * Initial value (uncontrolled).
   *
   * @default undefined
   * @type {string}
   */
  defaultValue?: string;
  /**
   * Fires when the selection changes.
   *
   * @default undefined
   * @type {(value: string) => void}
   */
  onChange?: (value: string) => void;
  /**
   * Disables every nested Radio.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Applied to every nested Radio unless it sets its own.
   *
   * @default "medium"
   * @type {RadioSize}
   */
  size?: RadioSize;
  /**
   * Applied to every nested Radio unless it sets its own.
   *
   * @default "primary"
   * @type {RadioColor}
   */
  color?: RadioColor;
  /**
   * Optional group label (renders above the options, also used as aria-label).
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Nested `<Radio value="..." label="..." />` elements.
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
 * Groups `Radio` children via context — nest them directly rather than
 * passing an options array, matching MUI's RadioGroup composition pattern
 * (https://mui.com/material-ui/react-radio-button/#radio-group).
 */
export function RadioGroup({
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
}: RadioGroupProps) {
  const generatedName = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  const handleSelect = (next: string) => {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const classes = ["okkly-component", "okkly-radio-group", className].filter(Boolean).join(" ");

  return (
    <RadioGroupContext.Provider
      value={{
        name: name ?? generatedName,
        value: currentValue,
        onSelect: handleSelect,
        disabled,
        size,
        color,
      }}
    >
      <div
        role="radiogroup"
        aria-label={typeof label === "string" ? label : undefined}
        className={classes}
      >
        {label && <span className="okkly-radio-group__label">{label}</span>}
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
