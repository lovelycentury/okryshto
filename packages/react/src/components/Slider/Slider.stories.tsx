import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./Slider";

/**
 * Continuous or discrete value along a track. Enable `discrete` with `step` for snapped marks.
 */
const meta: Meta<typeof Slider> = {
  title: "Control/Slider",
  component: Slider,
  args: {
    min: 0,
    max: 100,
    step: 1,
    size: "medium",
    color: "primary",
    disabled: false,
    orientation: "horizontal",
    valueLabelDisplay: "off",
    track: "normal",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: {
      control: "select",
      options: ["primary", "dante", "indigo", "violet", "ember", "ice"],
    },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    valueLabelDisplay: { control: "inline-radio", options: ["auto", "on", "off"] },
    track: { control: "inline-radio", options: ["normal", "inverted", "none"] },
  },
  render: (args) => <Slider {...args} aria-label="Volume" />,
};

export default meta;
type Story = StoryObj<typeof Slider>;

/**
 * This example shows the default state.
 */
export const Default: Story = {
  args: { defaultValue: 40 },
};

/**
 * This example shows range.
 */
export const Range: Story = {
  args: { defaultValue: [25, 75], valueLabelDisplay: "auto" },
};

/**
 * This example shows marks.
 */
export const Marks: Story = {
  args: {
    defaultValue: 50,
    marks: [
      { value: 0, label: "0°C" },
      { value: 25, label: "25°C" },
      { value: 50, label: "50°C" },
      { value: 75, label: "75°C" },
      { value: 100, label: "100°C" },
    ],
    valueLabelDisplay: "auto",
  },
};

/**
 * This example shows discrete steps with marks.
 */
export const Discrete: Story = {
  args: {
    defaultValue: 30,
    discrete: true,
    step: 10,
    shiftStep: 30,
    valueLabelDisplay: "auto",
  },
};

/**
 * This example shows restricted values.
 */
export const RestrictedValues: Story = {
  name: "Restricted values",
  args: {
    defaultValue: 20,
    discrete: true,
    marks: [
      { value: 0, label: "0°C" },
      { value: 20, label: "20°C" },
      { value: 37, label: "37°C" },
      { value: 100, label: "100°C" },
    ],
    valueLabelDisplay: "auto",
  },
};

/**
 * This example shows vertical.
 */
export const Vertical: Story = {
  args: {
    defaultValue: 60,
    orientation: "vertical",
    valueLabelDisplay: "on",
    style: { height: "12.5rem" },
  },
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {(["primary", "dante", "indigo", "violet", "ember", "ice"] as const).map((color) => (
        <Slider key={color} color={color} defaultValue={55} aria-label={`${color} slider`} />
      ))}
    </div>
  ),
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { defaultValue: 35, disabled: true },
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  name: "Interactive (controlled)",
  render: () => {
    const [value, setValue] = useState(30);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        <Slider
          value={value}
          onChange={(_event, next) => setValue(next as number)}
          valueLabelDisplay="auto"
          aria-label="Brightness"
        />
        <span style={{ color: "var(--okryshto-text-secondary)", fontSize: "0.875rem" }}>
          Value: {value}
        </span>
      </div>
    );
  },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <Slider key={size} size={size} defaultValue={50} aria-label={`${size} slider`} />
      ))}
    </div>
  ),
};
