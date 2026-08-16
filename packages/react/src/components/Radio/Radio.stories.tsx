import type { Meta, StoryObj } from "@storybook/react";
import { Radio } from "./Radio";

/**
 * Single option inside a RadioGroup. Bare control — pair with your own label markup or group labels.
 */
const meta: Meta<typeof Radio> = {
  title: "Control/Radio",
  component: Radio,
  args: {
    label: "Option",
    size: "medium",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
  },
  render: (args) => <Radio {...args} />,
};

export default meta;
type Story = StoryObj<typeof Radio>;

/**
 * This example shows unselected.
 */
export const Unselected: Story = {};
/**
 * This example shows selected.
 */
export const Selected: Story = { args: { checked: true } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };
/**
 * This example shows disabled selected.
 */
export const DisabledSelected: Story = { args: { disabled: true, checked: true } };

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <Radio key={size} size={size} checked label={size} />
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
        <Radio key={color} color={color} checked label={color} />
      ))}
    </div>
  ),
};
