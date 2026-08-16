import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "../Chip/Chip";
import { ChipGroup, type ChipGroupColor } from "./ChipGroup";

/**
 * Row of chips that manage single or multi selection together.
 */
const meta: Meta<typeof ChipGroup> = {
  title: "Control/ChipGroup",
  component: ChipGroup,
  args: {
    disabled: false,
    exclusive: false,
    color: "primary",
  },
  argTypes: {
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
  },
};

export default meta;
type Story = StoryObj<typeof ChipGroup>;

/**
 * This example shows removable tags.
 */
export const RemovableTags: Story = {
  render: () => {
    const [tags, setTags] = useState(["Design", "Engineering", "Operations"]);
    return (
      <ChipGroup
        items={tags.map((label) => ({
          label,
          onRemove: () => setTags((prev) => prev.filter((entry) => entry !== label)),
        }))}
      />
    );
  },
};

/**
 * This example shows filter multi.
 */
export const FilterMulti: Story = {
  name: "Interactive (multi filter)",
  render: () => {
    const [value, setValue] = useState<string[]>(["design"]);
    return (
      <ChipGroup
        value={value}
        onChange={(next) => setValue(next as string[])}
        items={[
          { label: "Design", value: "design" },
          { label: "Engineering", value: "engineering" },
          { label: "Operations", value: "operations" },
        ]}
      />
    );
  },
};

/**
 * This example shows filter exclusive.
 */
export const FilterExclusive: Story = {
  name: "Interactive (exclusive)",
  render: () => {
    const [value, setValue] = useState("design");
    return (
      <ChipGroup
        exclusive
        value={value}
        onChange={(next) => setValue(next as string)}
        items={[
          { label: "Design", value: "design" },
          { label: "Engineering", value: "engineering" },
          { label: "Operations", value: "operations" },
        ]}
      />
    );
  },
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => {
    const colors: ChipGroupColor[] = ["primary", "dante", "indigo", "violet", "ember", "ice"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {colors.map((color) => (
          <ChipGroup
            key={color}
            color={color}
            value={[color]}
            onChange={() => {}}
            items={[
              { label: color, value: color },
              { label: "Other", value: `${color}-other` },
            ]}
          />
        ))}
      </div>
    );
  },
};

/**
 * This example shows children escape hatch.
 */
export const ChildrenEscapeHatch: Story = {
  name: "Children (escape hatch)",
  render: () => (
    <ChipGroup>
      <Chip label="Custom A" />
      <Chip label="Custom B" removable onRemove={() => {}} />
      <Chip label="Custom C" selected onClick={() => {}} />
    </ChipGroup>
  ),
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    items: [
      { label: "Design", value: "design", selected: true },
      { label: "Engineering", value: "engineering" },
    ],
  },
};
