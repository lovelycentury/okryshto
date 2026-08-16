import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";

/**
 * Binary or indeterminate choice. Nest in CheckboxGroup when several options share one question.
 */
const meta: Meta<typeof Checkbox> = {
  title: "Control/Checkbox",
  component: Checkbox,
  args: {
    label: "Subscribe to updates",
    size: "medium",
    color: "primary",
    indeterminate: false,
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: {
      control: "select",
      options: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ],
    },
  },
  render: (args) => <Checkbox {...args} />,
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

/**
 * This example shows unchecked.
 */
export const Unchecked: Story = {};
/**
 * This example shows checked.
 */
export const Checked: Story = { args: { checked: true } };
/**
 * This example shows indeterminate.
 */
export const Indeterminate: Story = { args: { indeterminate: true } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };
/**
 * This example shows disabled checked.
 */
export const DisabledChecked: Story = { args: { disabled: true, checked: true } };
/**
 * This example shows no label.
 */
export const NoLabel: Story = {
  args: { checked: true, label: undefined, "aria-label": "Subscribe to updates" },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <Checkbox key={size} size={size} checked label={size} />
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
      {(
        [
          "primary",
          "dante",
          "indigo",
          "violet",
          "ember",
          "ice",
          "success",
          "warning",
          "danger",
        ] as const
      ).map((color) => (
        <Checkbox key={color} color={color} checked label={color} />
      ))}
    </div>
  ),
};
