import { createContext } from "react";
import type { RadioColor, RadioSize } from "../Radio/Radio";

export interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onSelect: (value: string) => void;
  disabled: boolean;
  size: RadioSize;
  color: RadioColor;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);
