import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateField } from "./DateField";

/**
 * Masked date input with an optional calendar popover. Format is fixed to the design’s day.month.year pattern.
 */
const meta: Meta<typeof DateField> = {
  title: "Control/DateField",
  component: DateField,
  args: {
    label: "Date",
    helperText: "Pick a date",
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
  render: (args) => <DateField {...args} />,
};

export default meta;
type Story = StoryObj<typeof DateField>;

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
  args: { error: true, helperText: "Enter a valid date", defaultValue: new Date(2024, 7, 12) },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: new Date(2024, 7, 12) },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <DateField
          key={size}
          size={size}
          label={`Date (${size})`}
          defaultValue={new Date(2024, 7, 12)}
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
    const [value, setValue] = useState<Date | null>(new Date(2024, 7, 12));
    return (
      <DateField
        label="Date"
        value={value}
        onChange={setValue}
        helperText={value ? value.toDateString() : "No date"}
      />
    );
  },
};
