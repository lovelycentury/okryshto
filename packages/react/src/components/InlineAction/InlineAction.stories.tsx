import type { Meta, StoryObj } from "@storybook/react";
import { InlineAction } from "./InlineAction";

/**
 * Compact text/icon control for table rows and cards — loading, success, and error states without a full Button.
 */
const meta: Meta<typeof InlineAction> = {
  title: "Control/InlineAction",
  component: InlineAction,
  args: {
    placeholder: "you@company.com",
    action: "Copy",
    size: "medium",
    fill: "filled",
    state: "default",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    fill: { control: "select", options: ["filled", "soft", "outline", "gradient", "glass"] },
    color: {
      control: "select",
      options: [
        undefined,
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
    state: {
      control: "select",
      options: [
        "default",
        "hover",
        "focus",
        "filled",
        "loading",
        "success",
        "error",
        "readonly",
        "disabled",
      ],
    },
  },
  render: (args) => <InlineAction {...args} />,
};

export default meta;
type Story = StoryObj<typeof InlineAction>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows hover.
 */
export const Hover: Story = { args: { state: "hover", value: "you@company.com" } };
/**
 * This example shows focus.
 */
export const Focus: Story = { args: { state: "focus", value: "you@company.com" } };
/**
 * This example shows filled.
 */
export const Filled: Story = { args: { value: "hello@oleksii.dev" } };
/**
 * This example shows the loading state.
 */
export const Loading: Story = {
  args: {
    state: "loading",
    value: "hello@oleksii.dev",
    action: "Sending…",
    message: "Talking to the server…",
  },
};
/**
 * This example shows success.
 */
export const Success: Story = {
  args: {
    state: "success",
    value: "hello@oleksii.dev",
    action: "Copied",
    message: "Copied to clipboard",
  },
};
/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: {
    state: "error",
    value: "hello@oleksii.dev",
    action: "Retry",
    message: "That address doesn't look right",
  },
};
/**
 * This example shows readonly.
 */
export const Readonly: Story = { args: { readonly: true, value: "hello@oleksii.dev" } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true, value: "hello@oleksii.dev" } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
        <InlineAction key={color} color={color} value="hello@oleksii.dev" />
      ))}
    </div>
  ),
};

/**
 * This example shows fills.
 */
export const Fills: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {(["filled", "soft", "outline", "gradient", "glass"] as const).map((fill) => (
        <InlineAction key={fill} fill={fill} color="dante" value="hello@oleksii.dev" />
      ))}
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
        <InlineAction key={size} size={size} value="hello@oleksii.dev" />
      ))}
    </div>
  ),
};

// Demonstrates the CSS-only "section tone" inheritance — no color prop set,
// each InlineAction picks up --okkly-section-tone from its wrapper.
/**
 * This example shows section tone.
 */
export const SectionTone: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ ["--okkly-section-tone" as string]: "var(--okkly-accent-ice)" }}>
        <InlineAction value="hello@oleksii.dev" />
      </div>
      <div style={{ ["--okkly-section-tone" as string]: "var(--okkly-accent-dante)" }}>
        <InlineAction value="hello@oleksii.dev" />
      </div>
    </div>
  ),
};
