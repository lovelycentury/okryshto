import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTimeField } from "./DateTimeField";

/**
 * Masked date-and-time input with a combined picker. Use when both halves of the value matter equally.
 */
const meta: Meta<typeof DateTimeField> = {
  title: "Control/DateTimeField",
  component: DateTimeField,
  args: {
    label: "Date & time",
    helperText: "Pick a date and time",
    size: "medium",
    color: "primary",
    error: false,
    disabled: false,
    hideLabel: false,
    fullWidth: false,
    required: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
  },
  render: (args) => <DateTimeField {...args} />,
};

export default meta;
type Story = StoryObj<typeof DateTimeField>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true } };

/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: {
    error: true,
    helperText: "Enter a valid date and time",
    defaultValue: new Date(2024, 7, 12, 14, 30),
  },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: new Date(2024, 7, 12, 14, 30) },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <DateTimeField
          key={size}
          size={size}
          label={`Date & time (${size})`}
          defaultValue={new Date(2024, 7, 12, 14, 30)}
        />
      ))}
    </div>
  ),
};

/**
 * This example shows controlled usage.
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(new Date(2024, 7, 12, 14, 30));
    return (
      <DateTimeField
        label="Date & time"
        value={value}
        onChange={setValue}
        helperText={value ? value.toLocaleString() : "No date"}
      />
    );
  },
};
