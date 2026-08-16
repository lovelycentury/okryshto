import type { Meta, StoryObj } from "@storybook/react";
import { Radio } from "../Radio/Radio";
import { RadioGroup } from "./RadioGroup";

/**
 * Exclusive choice among radios. Provide a group label and shared `name` for form submission.
 */
const meta: Meta<typeof RadioGroup> = {
  title: "Control/RadioGroup",
  component: RadioGroup,
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="email" label="Email me updates" />
      <Radio value="sms" label="SMS only" />
      <Radio value="none" label="No notifications" />
    </RadioGroup>
  ),
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

/**
 * This example shows the default state.
 */
export const Default: Story = { args: { defaultValue: "email" } };
/**
 * This example shows with label.
 */
export const WithLabel: Story = {
  args: { label: "Notification preference", defaultValue: "email" },
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { defaultValue: "email", disabled: true } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  args: { defaultValue: "sms", color: "dante" },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  args: { defaultValue: "sms", size: "large" },
};

/**
 * This example shows mixed sizes.
 */
export const MixedSizes: Story = {
  name: "Per-option override",
  render: () => (
    <RadioGroup defaultValue="sms">
      <Radio value="email" label="Email me updates" size="small" />
      <Radio value="sms" label="SMS only" />
      <Radio value="none" label="No notifications" color="dante" />
    </RadioGroup>
  ),
};
