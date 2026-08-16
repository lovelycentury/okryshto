import { createContext } from "react";
import type { CheckboxColor, CheckboxSize } from "../Checkbox/Checkbox";

export interface CheckboxGroupContextValue {
  name: string;
  value: string[];
  onToggle: (value: string, checked: boolean) => void;
  disabled: boolean;
  size: CheckboxSize;
  color: CheckboxColor;
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);
