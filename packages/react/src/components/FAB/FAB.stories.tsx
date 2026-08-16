import type { Meta, StoryObj } from "@storybook/react";
import { iconMic, iconMusic, iconPencil, iconPlus, iconUpload, iconX } from "@okryshto/icons";
import { Fab, type FabColor } from "./FAB";

const plusIcon = <span dangerouslySetInnerHTML={{ __html: iconPlus }} />;
const musicIcon = <span dangerouslySetInnerHTML={{ __html: iconMusic }} />;
const pencilIcon = <span dangerouslySetInnerHTML={{ __html: iconPencil }} />;

/**
 * Floating action button for the screen’s primary create/navigate action. Keep one FAB per view.
 */
const meta: Meta<typeof Fab> = {
  title: "Control/FAB",
  component: Fab,
  args: {
    icon: plusIcon,
    "aria-label": "Add",
    variant: "standard",
    color: "primary",
    size: "medium",
    disabled: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["standard", "soft"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    icon: { control: false },
    label: { control: "text" },
  },
  render: (args) => <Fab {...args} />,
};

export default meta;
type Story = StoryObj<typeof Fab>;

/**
 * This example shows standard.
 */
export const Standard: Story = {};
/**
 * This example shows dante.
 */
export const Dante: Story = {
  args: {
    color: "dante",
    icon: <span dangerouslySetInnerHTML={{ __html: iconMic }} />,
    "aria-label": "Record",
  },
};
/**
 * This example shows extended.
 */
export const Extended: Story = { args: { icon: musicIcon, label: "New track" } };
/**
 * This example shows the soft variant.
 */
export const Soft: Story = { args: { variant: "soft", icon: pencilIcon, "aria-label": "Edit" } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

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
        ] as const satisfies readonly FabColor[]
      ).map((color) => (
        <Fab key={color} color={color} icon={plusIcon} aria-label={`Add (${color})`} />
      ))}
    </div>
  ),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <Fab key={size} size={size} icon={plusIcon} aria-label={`Add (${size})`} />
      ))}
    </div>
  ),
};

/** MUI ships `SpeedDial` as its own component on top of `Fab`; this design has no built-in prop for it — compose plain `Fab`s absolutely-positioned instead. */
export const SpeedDial: Story = {
  name: "Speed dial (composed from plain Fabs)",
  render: () => (
    <div style={{ position: "relative", width: "220px", height: "260px" }}>
      {[
        { top: 0, label: "Import", icon: iconUpload },
        { top: 58, label: "Record", icon: iconMic },
        { top: 116, label: "New track", icon: iconMusic },
      ].map(({ top, label, icon }) => (
        <div
          key={label}
          style={{
            position: "absolute",
            top,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <span
            style={{
              alignSelf: "center",
              padding: "5px 10px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#16161a",
              color: "#a9a9b2",
              fontSize: "13px",
              fontFamily: "var(--okryshto-font-family-sans, sans-serif)",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
          <Fab
            size="small"
            variant={label === "Record" ? "standard" : "soft"}
            color={label === "Record" ? "dante" : "primary"}
            icon={<span dangerouslySetInnerHTML={{ __html: icon }} />}
            aria-label={label}
          />
        </div>
      ))}
      <div style={{ position: "absolute", top: 174, right: 0 }}>
        <Fab icon={<span dangerouslySetInnerHTML={{ __html: iconX }} />} aria-label="Close" />
      </div>
    </div>
  ),
};

/**
 * This example shows the component used as a link.
 */
export const AsLink: Story = {
  args: { href: "https://okryshto.dev", icon: plusIcon, "aria-label": "Create" },
};
