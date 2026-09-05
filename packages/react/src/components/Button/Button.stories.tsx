import type { Meta, StoryObj } from "@storybook/react";
import { iconArrowRight } from "@okkly/icons";
import { Button } from "./Button";

const icon = <span dangerouslySetInnerHTML={{ __html: iconArrowRight }} />;

/**
 * Primary action control for forms, dialogs, and toolbars. Pick variant and color for emphasis — one primary action per view.
 */
const meta: Meta<typeof Button> = {
  title: "Control/Button",
  component: Button,
  args: {
    children: "Button",
    variant: "primary",
    color: "primary",
    shape: "pill",
    size: "medium",
    disabled: false,
    loading: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "gradient", "secondary", "soft", "ghost", "glass"],
    },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    shape: { control: "inline-radio", options: ["pill", "rounded"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    loadingPosition: { control: "inline-radio", options: ["start", "center", "end"] },
  },
  render: (args) => <Button {...args} />,
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * This example shows the primary appearance.
 */
export const Primary: Story = { args: { endIcon: icon } };
/**
 * This example shows the gradient variant.
 */
export const Gradient: Story = { args: { variant: "gradient", endIcon: icon } };
/**
 * This example shows the secondary appearance.
 */
export const Secondary: Story = { args: { variant: "secondary" } };
/**
 * This example shows the soft variant.
 */
export const Soft: Story = { args: { variant: "soft" } };
/**
 * This example shows the ghost variant.
 */
export const Ghost: Story = { args: { variant: "ghost" } };
/**
 * This example shows the glass variant.
 */
export const Glass: Story = { args: { variant: "glass", endIcon: icon } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true, endIcon: icon } };
/**
 * This example shows the loading state.
 */
export const Loading: Story = { args: { loading: true } };
/**
 * This example shows the full-width layout.
 */
export const FullWidth: Story = {
  args: { fullWidth: true, endIcon: icon },
  render: (args) => (
    <div style={{ width: "320px" }}>
      <Button {...args} />
    </div>
  ),
};
/**
 * This example shows the component used as a link.
 */
export const AsLink: Story = {
  args: { href: "https://okryshto.dev", endIcon: icon, children: "Get in touch" },
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "12px" }}>
      {(["primary", "dante", "indigo", "violet", "ember", "ice"] as const).map((color) => (
        <Button key={color} color={color} endIcon={icon}>
          {color}
        </Button>
      ))}
    </div>
  ),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <Button key={size} size={size} endIcon={icon}>
          Button
        </Button>
      ))}
    </div>
  ),
};
