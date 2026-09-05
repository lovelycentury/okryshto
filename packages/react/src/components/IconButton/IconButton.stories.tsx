import type { Meta, StoryObj } from "@storybook/react";
import { iconPlus, iconX } from "@okkly/icons";
import { IconButton, type IconButtonColor } from "./IconButton";

const plusIcon = <span dangerouslySetInnerHTML={{ __html: iconPlus }} />;
const closeIcon = <span dangerouslySetInnerHTML={{ __html: iconX }} />;

/**
 * Icon-only control for toolbars and dense UIs. Always provide an accessible name via `aria-label` or a Tooltip.
 */
const meta: Meta<typeof IconButton> = {
  title: "Control/IconButton",
  component: IconButton,
  args: {
    icon: plusIcon,
    "aria-label": "Add",
    variant: "ghost",
    color: "primary",
    size: "medium",
    disabled: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["ghost", "glass", "solid"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    icon: { control: false },
    children: { control: false },
  },
  render: (args) => <IconButton {...args} />,
};

export default meta;
type Story = StoryObj<typeof IconButton>;

/**
 * This example shows the ghost variant.
 */
export const Ghost: Story = {};
/**
 * This example shows the glass variant.
 */
export const Glass: Story = { args: { variant: "glass" } };
/**
 * This example shows solid.
 */
export const Solid: Story = { args: { variant: "solid", icon: closeIcon, "aria-label": "Close" } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <IconButton key={size} size={size} icon={plusIcon} aria-label={`Add (${size})`} />
      ))}
    </div>
  ),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px" }}>
      {(
        [
          "primary",
          "dante",
          "indigo",
          "violet",
          "ember",
          "ice",
        ] as const satisfies readonly IconButtonColor[]
      ).map((color) => (
        <IconButton
          key={color}
          color={color}
          variant="glass"
          icon={plusIcon}
          aria-label={`Add (${color})`}
        />
      ))}
    </div>
  ),
};

/**
 * This example shows the component used as a link.
 */
export const AsLink: Story = {
  args: { href: "https://okryshto.dev", icon: plusIcon, "aria-label": "Create" },
};
