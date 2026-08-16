import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTimePicker, type DateTimePickerColor } from "./DateTimePicker";
import { Chip } from "../Chip/Chip";

// Fixed reference date so the visuals match the source design 1:1.
const demoValue = new Date(2024, 10, 8, 0, 0);

/**
 * Standalone date-and-time picker surface without the field chrome — embed in custom layouts or popovers.
 */
const meta: Meta<typeof DateTimePicker> = {
  title: "Control/DateTimePicker",
  component: DateTimePicker,
  args: {
    weekStart: "mon",
    color: "primary",
    format: "24h",
  },
  argTypes: {
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    weekStart: { control: "inline-radio", options: ["mon", "sun"] },
    format: { control: "inline-radio", options: ["24h", "12h"] },
  },
  render: (args) => <DateTimePicker {...args} />,
};

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

/**
 * This example shows the default state.
 */
export const Default: Story = { args: { defaultValue: demoValue } };

/**
 * This example shows no selection.
 */
export const NoSelection: Story = { name: "Empty (no date picked)", args: {} };

/**
 * This example shows twelve hour format.
 */
export const TwelveHourFormat: Story = {
  args: { defaultValue: new Date(2024, 10, 8, 14, 30), format: "12h" },
};

/**
 * This example shows step fifteen minutes.
 */
export const StepFifteenMinutes: Story = {
  name: "15-minute step",
  args: { defaultValue: demoValue, timeStep: 15 },
};

/**
 * This example shows dante.
 */
export const Dante: Story = {
  args: { color: "dante", defaultValue: demoValue },
};

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
        ] as const satisfies readonly DateTimePickerColor[]
      ).map((color) => (
        <DateTimePicker key={color} color={color} defaultValue={demoValue} />
      ))}
    </div>
  ),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  name: "Interactive (pick a date & time, then Confirm)",
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    const [confirmed, setConfirmed] = useState<Date | null>(null);
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}
      >
        <DateTimePicker
          value={value}
          onChange={setValue}
          onConfirm={setConfirmed}
          timezoneLabel="GMT+2"
        />
        <p
          style={{
            margin: 0,
            color: "#a9a9b2",
            fontSize: "13px",
            fontFamily: "var(--okryshto-font-family-mono, monospace)",
          }}
        >
          {confirmed
            ? `Confirmed: ${confirmed.toLocaleString()}`
            : "Pick a day, dial in a time, then click Confirm — the draft updates live, Confirm locks it in."}
        </p>
      </div>
    );
  },
};

/**
 * There is no shortcut-preset API. A preset is one line against `value`, and a
 * built-in sidebar cost more than it saved.
 */
export const Presets: Story = {
  name: "Shortcut presets, from the outside",
  render: () => {
    const [value, setValue] = useState<Date | null>(demoValue);
    const presets: Array<[string, Date]> = [
      ["Morning", new Date(2024, 10, 8, 9, 0)],
      ["Noon", new Date(2024, 10, 8, 12, 0)],
      ["Evening", new Date(2024, 10, 8, 18, 30)],
    ];
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          {presets.map(([label, date]) => (
            <Chip
              key={label}
              size="small"
              label={label}
              selected={value?.getTime() === date.getTime()}
              onClick={() => setValue(date)}
            />
          ))}
        </div>
        <DateTimePicker value={value} onChange={setValue} timezoneLabel="GMT+2" />
      </div>
    );
  },
};
