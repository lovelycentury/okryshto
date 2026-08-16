import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { NumberInput } from "./NumberInput";

/**
 * Numeric text field with steppers. Prefer over TextField when min/max/step matter and values stay numeric.
 */
const meta: Meta<typeof NumberInput> = {
  title: "Control/NumberInput",
  component: NumberInput,
  args: {
    label: "Quantity",
    defaultValue: 12,
    helperText: "Between 1 and 99",
    size: "medium",
    color: "primary",
    controls: "stepper",
    error: false,
    disabled: false,
    hideLabel: false,
    fullWidth: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    controls: { control: "inline-radio", options: ["stepper", "chevrons"] },
  },
  render: (args) => <NumberInput {...args} />,
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows chevrons.
 */
export const Chevrons: Story = {
  args: { controls: "chevrons" },
};

/**
 * This example shows with min max.
 */
export const WithMinMax: Story = {
  args: { min: 1, max: 99, defaultValue: 12, helperText: "Between 1 and 99" },
};

/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: { error: true, helperText: "Must be 1–99", defaultValue: 120, min: 1, max: 99 },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { disabled: true },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <NumberInput
          key={size}
          size={size}
          label="Quantity"
          defaultValue={12}
          helperText="Between 1 and 99"
        />
      ))}
    </div>
  ),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(12);
    return (
      <NumberInput
        label="Quantity"
        value={value}
        onChange={setValue}
        min={1}
        max={99}
        helperText={`Current value: ${value === null ? "empty" : value}`}
      />
    );
  },
};
