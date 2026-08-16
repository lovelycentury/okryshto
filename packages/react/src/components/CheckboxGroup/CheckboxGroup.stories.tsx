import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "../Checkbox/Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

/**
 * Labeled set of checkboxes with shared name and optional helper or error text.
 */
const meta: Meta<typeof CheckboxGroup> = {
  title: "Control/CheckboxGroup",
  component: CheckboxGroup,
  render: (args) => (
    <CheckboxGroup {...args}>
      <Checkbox value="email" label="Email me updates" />
      <Checkbox value="sms" label="SMS only" />
      <Checkbox value="push" label="Push notifications" />
    </CheckboxGroup>
  ),
};

export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

/**
 * This example shows the default state.
 */
export const Default: Story = { args: { defaultValue: ["email"] } };
/**
 * This example shows with label.
 */
export const WithLabel: Story = {
  args: { label: "Notification channels", defaultValue: ["email", "push"] },
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { defaultValue: ["email"], disabled: true } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  args: { defaultValue: ["sms"], color: "dante" },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  args: { defaultValue: ["sms"], size: "large" },
};

/**
 * This example shows mixed sizes.
 */
export const MixedSizes: Story = {
  name: "Per-option override",
  render: () => (
    <CheckboxGroup defaultValue={["sms"]}>
      <Checkbox value="email" label="Email me updates" size="small" />
      <Checkbox value="sms" label="SMS only" />
      <Checkbox value="push" label="Push notifications" color="dante" />
    </CheckboxGroup>
  ),
};
