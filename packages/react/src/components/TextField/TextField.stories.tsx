import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./TextField";

/**
 * Single-line text input with label, helper, and error. Foundation for most form fields.
 */
const meta: Meta<typeof TextField> = {
  title: "Control/TextField",
  component: TextField,
  args: {
    label: "Email",
    placeholder: "you@company.com",
    helperText: "We'll never share it",
    size: "medium",
    color: "primary",
    error: false,
    disabled: false,
    hideLabel: false,
    fullWidth: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
  },
  render: (args) => <TextField {...args} />,
};

export default meta;
type Story = StoryObj<typeof TextField>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows filled.
 */
export const Filled: Story = { args: { defaultValue: "hello@oleksii.dev" } };
/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: { defaultValue: "hello@oleksii.dev", error: true, helperText: "Enter a valid email" },
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };
/**
 * This example shows no label.
 */
export const NoLabel: Story = { args: { hideLabel: true } };
/**
 * This example shows dante focus.
 */
export const DanteFocus: Story = { args: { color: "dante" } };
/**
 * This example shows the full-width layout.
 */
export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <div style={{ width: "320px" }}>
      <TextField {...args} />
    </div>
  ),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <TextField key={size} size={size} label="Email" placeholder="hello@oleksii.dev" />
      ))}
    </div>
  ),
};
