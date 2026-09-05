import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TimePicker, type TimePickerColor, type TimePickerValue } from "./TimePicker";

function formatTime(value: TimePickerValue): string {
  return `${String(value.h).padStart(2, "0")}:${String(value.m).padStart(2, "0")}`;
}

/**
 * Scrollable time wheels for hours and minutes. Embed in popovers or custom picker layouts.
 */
const meta: Meta<typeof TimePicker> = {
  title: "Control/TimePicker",
  component: TimePicker,
  args: {
    defaultValue: { h: 0, m: 0 },
    color: "primary",
    format: "24h",
  },
  argTypes: {
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    format: { control: "inline-radio", options: ["24h", "12h"] },
  },
  render: (args) => <TimePicker {...args} />,
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows twelve hour format.
 */
export const TwelveHourFormat: Story = {
  name: "12h format (adds an AM/PM wheel)",
  args: { format: "12h", defaultValue: { h: 14, m: 30 } },
};

/**
 * This example shows step fifteen minutes.
 */
export const StepFifteenMinutes: Story = {
  name: "15-minute step",
  args: { step: 15, defaultValue: { h: 9, m: 30 } },
};

/**
 * This example shows dante.
 */
export const Dante: Story = { args: { color: "dante", defaultValue: { h: 18, m: 5 } } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {(
        [
          "primary",
          "dante",
          "indigo",
          "violet",
          "ember",
          "ice",
        ] as const satisfies readonly TimePickerColor[]
      ).map((color) => (
        <TimePicker key={color} color={color} defaultValue={{ h: 8, m: 0 }} />
      ))}
    </div>
  ),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  name: "Interactive (drag or use arrow keys)",
  render: () => {
    const [value, setValue] = useState<TimePickerValue>({ h: 9, m: 30 });
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}
      >
        <TimePicker value={value} onChange={setValue} format="12h" />
        <p
          style={{
            margin: 0,
            color: "#a9a9b2",
            fontSize: "13px",
            fontFamily: "var(--okkly-font-family-mono, monospace)",
          }}
        >
          Selected: {formatTime(value)} — drag a wheel, or focus it and use ↑/↓/Home/End.
        </p>
      </div>
    );
  },
};
