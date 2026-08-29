import type { Meta, StoryObj } from "@storybook/react";
import { TextArea } from "./TextArea";

/**
 * Multi-line text field for notes and descriptions. Prefer RichEditor when formatting is required.
 */
const meta: Meta<typeof TextArea> = {
  title: "Control/TextArea",
  component: TextArea,
  args: {
    label: "Message",
    placeholder: "Write your message…",
    helperText: "Markdown supported",
    size: "medium",
    color: "primary",
    error: false,
    disabled: false,
    hideLabel: false,
    fullWidth: false,
    rows: 3,
    autosize: false,
    resize: "vertical",
    required: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    resize: { control: "inline-radio", options: ["none", "vertical", "both"] },
  },
  render: (args) => <TextArea {...args} />,
};

export default meta;
type Story = StoryObj<typeof TextArea>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true } };

/**
 * This example shows filled.
 */
export const Filled: Story = {
  args: {
    defaultValue:
      "Hi Oleksii — loved your portfolio, the EQ and map work is gorgeous. Could we book a call next week?",
  },
};

/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: {
    defaultValue: "Hi",
    error: true,
    helperText: "Message is too long",
    maxLength: 280,
  },
};

/**
 * This example shows with counter.
 */
export const WithCounter: Story = {
  args: {
    maxLength: 280,
    helperText: "Markdown supported",
    defaultValue: "",
  },
};

/**
 * This example shows autosize.
 */
export const Autosize: Story = {
  args: {
    autosize: true,
    maxRows: 8,
    placeholder: "Start typing — the field grows with your content…",
  },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <TextArea key={size} size={size} label="Message" placeholder="Write your message…" />
      ))}
    </div>
  ),
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };
