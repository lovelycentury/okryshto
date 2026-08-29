import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TimeField } from "./TimeField";

/**
 * Masked time input with an optional time popover. 24h or 12h depending on locale settings.
 */
const meta: Meta<typeof TimeField> = {
  title: "Control/TimeField",
  component: TimeField,
  args: {
    label: "Time",
    helperText: "Pick a time",
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
  render: (args) => <TimeField {...args} />,
};

export default meta;
type Story = StoryObj<typeof TimeField>;

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
    helperText: "Enter a valid time",
    defaultValue: (() => {
      const d = new Date();
      d.setHours(14, 30, 0, 0);
      return d;
    })(),
  },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: (() => {
      const d = new Date();
      d.setHours(14, 30, 0, 0);
      return d;
    })(),
  },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {(["small", "medium", "large"] as const).map((size) => {
        const value = new Date();
        value.setHours(9, 15, 0, 0);
        return <TimeField key={size} size={size} label={`Time (${size})`} defaultValue={value} />;
      })}
    </div>
  ),
};

/**
 * This example shows controlled usage.
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(() => {
      const d = new Date();
      d.setHours(14, 30, 0, 0);
      return d;
    });
    return (
      <TimeField
        label="Time"
        value={value}
        onChange={setValue}
        helperText={
          value
            ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
            : "No time"
        }
      />
    );
  },
};
