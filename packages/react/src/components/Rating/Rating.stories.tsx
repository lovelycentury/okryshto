import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Rating, type RatingColor } from "./Rating";

/**
 * Star (or custom glyph) scale for scores. Support half-steps with `precision` when the data allows it.
 */
const meta: Meta<typeof Rating> = {
  title: "Control/Rating",
  component: Rating,
  args: {
    value: 4,
    max: 5,
    precision: 0.5,
    size: "medium",
    color: "warning",
    icon: "star",
    readOnly: false,
    disabled: false,
  },
  argTypes: {
    color: {
      control: "select",
      options: ["warning", "primary", "dante", "indigo", "violet", "ember", "ice"],
    },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    precision: { control: "inline-radio", options: [0.5, 1] },
    icon: { control: "inline-radio", options: ["star", "heart"] },
    onChange: { control: false },
  },
  render: (args) => <Rating {...args} />,
};

export default meta;
type Story = StoryObj<typeof Rating>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows full.
 */
export const Full: Story = { args: { value: 5 } };

/**
 * This example shows half.
 */
export const Half: Story = { args: { value: 2.5 } };

/**
 * This example shows the empty state.
 */
export const Empty: Story = { args: { value: 0 } };

/**
 * This example shows with label.
 */
export const WithLabel: Story = {
  args: { value: 4.5, label: "4.8 · 128 reviews" },
};

/**
 * This example shows compact.
 */
export const Compact: Story = {
  args: { value: 5, max: 1, size: "small", label: "4.8" },
};

/**
 * This example shows hearts.
 */
export const Hearts: Story = {
  args: { value: 3.5, icon: "heart", color: "dante" },
};

/**
 * This example shows read only.
 */
export const ReadOnly: Story = { args: { value: 4, readOnly: true } };

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { value: 3, disabled: true } };

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}
    >
      <Rating value={4} size="small" />
      <Rating value={4} size="medium" />
      <Rating value={4} size="large" />
    </div>
  ),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}
    >
      {(["warning", "primary", "dante"] as const satisfies readonly RatingColor[]).map((color) => (
        <Rating key={color} value={4} color={color} icon={color === "dante" ? "heart" : "star"} />
      ))}
    </div>
  ),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(3);
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}
      >
        <Rating value={value} onChange={(_, next) => setValue(next)} />
        <p
          style={{
            margin: 0,
            color: "#a9a9b2",
            fontSize: "13px",
            fontFamily: "var(--okryshto-font-family-mono, monospace)",
          }}
        >
          Score: {value ?? "none"}
        </p>
      </div>
    );
  },
};
