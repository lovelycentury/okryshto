import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch";

/**
 * Immediate on/off toggle. Prefer Checkbox for form “agree” statements that submit later.
 */
const meta: Meta<typeof Switch> = {
  title: "Control/Switch",
  component: Switch,
  args: {
    size: "medium",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: {
      control: "select",
      options: ["primary", "dante", "indigo", "violet", "ember", "ice"],
    },
  },
  render: (args) => <Switch {...args} />,
};

export default meta;
type Story = StoryObj<typeof Switch>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows checked.
 */
export const Checked: Story = { args: { checked: true } };
/**
 * This example shows with label.
 */
export const WithLabel: Story = { args: { label: "Enable notifications", checked: true } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <Switch key={size} size={size} checked label={size} />
      ))}
    </div>
  ),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {(["primary", "dante", "indigo", "violet", "ember", "ice"] as const).map((color) => (
        <Switch key={color} color={color} checked label={color} />
      ))}
    </div>
  ),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  name: "Interactive (toggle)",
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Switch label="Dark mode" checked={checked} onChange={(_event, value) => setChecked(value)} />
    );
  },
};
