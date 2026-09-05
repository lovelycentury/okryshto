import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  iconBold,
  iconCalendar,
  iconGrid,
  iconItalic,
  iconList,
  iconUnderline,
} from "@okkly/icons";
import {
  SegmentedToggle,
  type SegmentedToggleColor,
  type SegmentedToggleItem,
} from "./SegmentedToggle";

const icon = (svg: string) => <span dangerouslySetInnerHTML={{ __html: svg }} />;

/**
 * Exclusive segments in one control — view modes, filters, or short option sets.
 */
const meta: Meta<typeof SegmentedToggle> = {
  title: "Control/SegmentedToggle",
  component: SegmentedToggle,
  args: {
    items: [
      { label: "Day", value: "day" },
      { label: "Week", value: "week" },
      { label: "Month", value: "month" },
    ],
    value: "week",
    exclusive: true,
    color: "primary",
    disabled: false,
  },
  argTypes: {
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    items: { control: false },
    onChange: { control: false },
  },
  render: (args) => <SegmentedToggle {...args} />,
};

export default meta;
type Story = StoryObj<typeof SegmentedToggle>;

/**
 * This example shows range.
 */
export const Range: Story = {};

/**
 * This example shows view picker.
 */
export const ViewPicker: Story = {
  args: {
    value: "list",
    items: [
      { label: "List", value: "list", icon: icon(iconList) },
      { label: "Board", value: "board", icon: icon(iconGrid) },
      { label: "Calendar", value: "calendar", icon: icon(iconCalendar) },
    ],
  },
};

/**
 * This example shows icon only.
 */
export const IconOnly: Story = {
  args: {
    value: "grid",
    items: [
      { value: "grid", icon: icon(iconGrid) },
      { value: "list", icon: icon(iconList) },
    ],
  },
};

/**
 * This example shows multi select.
 */
export const MultiSelect: Story = {
  name: "Toggle group (multi)",
  args: {
    exclusive: false,
    value: ["bold", "italic"],
    items: [
      { value: "bold", icon: icon(iconBold) },
      { value: "italic", icon: icon(iconItalic) },
      { value: "underline", icon: icon(iconUnderline) },
    ],
  },
};

/**
 * This example shows dante.
 */
export const Dante: Story = {
  args: {
    color: "dante",
    value: "week",
    items: [
      { label: "Day", value: "day" },
      { label: "Week", value: "week" },
      { label: "Month", value: "month" },
    ],
  },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}
    >
      {(
        [
          "primary",
          "dante",
          "indigo",
          "violet",
          "ember",
          "ice",
        ] as const satisfies readonly SegmentedToggleColor[]
      ).map((color) => (
        <SegmentedToggle
          key={color}
          color={color}
          value="week"
          items={[
            { label: "Day", value: "day" },
            { label: "Week", value: "week" },
            { label: "Month", value: "month" },
          ]}
        />
      ))}
    </div>
  ),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState("week");
    const items: SegmentedToggleItem[] = [
      { label: "Day", value: "day" },
      { label: "Week", value: "week" },
      { label: "Month", value: "month" },
    ];
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}
      >
        <SegmentedToggle
          color="dante"
          items={items}
          value={value}
          onChange={(next) => setValue(next as string)}
        />
        <p
          style={{
            margin: 0,
            color: "#a9a9b2",
            fontSize: "13px",
            fontFamily: "var(--okkly-font-family-mono, monospace)",
          }}
        >
          Selected: {value}
        </p>
      </div>
    );
  },
};

/**
 * This example shows interactive multi.
 */
export const InteractiveMulti: Story = {
  name: "Interactive (multi)",
  render: () => {
    const [value, setValue] = useState<string[]>(["bold"]);
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}
      >
        <SegmentedToggle
          exclusive={false}
          value={value}
          onChange={(next) => setValue(next as string[])}
          items={[
            { value: "bold", icon: icon(iconBold) },
            { value: "italic", icon: icon(iconItalic) },
            { value: "underline", icon: icon(iconUnderline) },
          ]}
        />
        <p
          style={{
            margin: 0,
            color: "#a9a9b2",
            fontSize: "13px",
            fontFamily: "var(--okkly-font-family-mono, monospace)",
          }}
        >
          Active: {value.join(", ") || "none"}
        </p>
      </div>
    );
  },
};
