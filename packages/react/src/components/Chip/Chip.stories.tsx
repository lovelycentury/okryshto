import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { iconStar } from "@okkly/icons";
import { Chip } from "./Chip";

const starIcon = <span dangerouslySetInnerHTML={{ __html: iconStar }} />;

/**
 * Compact filter, tag, or choice token. Use ChipGroup for exclusive or multi-select filters.
 */
const meta: Meta<typeof Chip> = {
  title: "Control/Chip",
  component: Chip,
  args: {
    label: "Fintech",
    variant: "glass",
    size: "medium",
    selected: false,
    dot: false,
    removable: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: "select", options: ["glass", "solid", "outline", "accent", "dante"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
  },
  render: (args) => <Chip {...args} />,
};

export default meta;
type Story = StoryObj<typeof Chip>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows solid.
 */
export const Solid: Story = { args: { variant: "solid" } };
/**
 * This example shows outline.
 */
export const Outline: Story = { args: { variant: "outline" } };
/**
 * This example shows accent.
 */
export const Accent: Story = { args: { variant: "accent", dot: true, label: "New" } };
/**
 * This example shows dante.
 */
export const Dante: Story = { args: { variant: "dante", dot: true, label: "Signature" } };
/**
 * This example shows selected.
 */
export const Selected: Story = { args: { selected: true, onClick: () => {} } };
/**
 * This example shows the component with an icon.
 */
export const WithIcon: Story = { args: { icon: starIcon, label: "Starred" } };
/**
 * This example shows removable.
 */
export const Removable: Story = { args: { removable: true, label: "Mobile", onRemove: () => {} } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true, removable: true } };

/**
 * This example shows every available variant.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      {(["glass", "solid", "outline", "accent", "dante"] as const).map((variant) => (
        <Chip key={variant} variant={variant} label={variant} />
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
        <Chip key={size} size={size} label={size} />
      ))}
    </div>
  ),
};

/**
 * This example shows filter toggle.
 */
export const FilterToggle: Story = {
  name: "Interactive (filter toggle)",
  render: () => {
    const [selected, setSelected] = useState(false);
    return (
      <Chip label="Toggle me" selected={selected} onClick={() => setSelected((prev) => !prev)} />
    );
  },
};

/**
 * This example shows removable group.
 */
export const RemovableGroup: Story = {
  name: "Removable group",
  render: () => {
    const [tags, setTags] = useState(["Design", "Engineering", "Operations"]);
    return (
      <div style={{ display: "flex", gap: "8px" }}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            removable
            onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}
          />
        ))}
      </div>
    );
  },
};
