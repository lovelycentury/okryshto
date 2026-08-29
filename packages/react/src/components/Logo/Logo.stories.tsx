import type { Meta, StoryObj } from "@storybook/react";
import { StaticBackground } from "../StaticBackground/StaticBackground";
import { Logo } from "./Logo";

/**
 * Static brand lockup. Choose layout for nav (`compact`), headers (`horizontal`), or stacked mobile placements.
 */
const meta: Meta<typeof Logo> = {
  title: "Brand/Logo",
  component: Logo,
  args: {
    layout: "horizontal",
    tone: "multi",
    label: "okryshto.dev",
    showLabel: true,
  },
  argTypes: {
    layout: { control: "inline-radio", options: ["compact", "horizontal", "stacked"] },
    tone: {
      control: "select",
      options: ["multi", "mint", "indigo", "dante", "violet", "ember", "mono-dark", "mono-light"],
    },
  },
  render: (args) => (
    <StaticBackground preset="void" style={{ width: "100%", height: "600px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <Logo {...args} />
      </div>
    </StaticBackground>
  ),
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows compact.
 */
export const Compact: Story = { args: { layout: "compact" } };
/**
 * This example shows stacked.
 */
export const Stacked: Story = { args: { layout: "stacked" } };
/**
 * This example shows mono dark.
 */
export const MonoDark: Story = { name: "Mono — White on Black", args: { tone: "mono-dark" } };
/**
 * This example shows mono light.
 */
export const MonoLight: Story = {
  name: "Mono — Black on White",
  args: { tone: "mono-light" },
  render: (args) => (
    <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px" }}>
      <Logo {...args} />
    </div>
  ),
};
/**
 * This example shows emblem only.
 */
export const EmblemOnly: Story = { name: "Emblem only", args: { showLabel: false } };

/**
 * This example shows layouts.
 */
export const Layouts: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
      <Logo layout="compact" />
      <Logo layout="horizontal" />
      <Logo layout="stacked" />
    </div>
  ),
};

/**
 * This example shows tones.
 */
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px" }}>
      <Logo tone="multi" layout="stacked" />
      {(["mint", "indigo", "dante", "violet", "ember"] as const).map((tone) => (
        <Logo key={tone} tone={tone} layout="stacked" />
      ))}
    </div>
  ),
};

/**
 * This example shows header context.
 */
export const HeaderContext: Story = {
  name: "In a header (compact)",
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        borderRadius: "12px",
        background: "var(--okryshto-bg-inset)",
        border: "1px solid var(--okryshto-border-subtle)",
        width: "480px",
      }}
    >
      <Logo layout="compact" />
      <div
        style={{
          display: "flex",
          gap: "20px",
          fontSize: "13px",
          color: "var(--okryshto-text-secondary)",
        }}
      >
        <span>Showcase</span>
        <span style={{ color: "var(--okryshto-text-muted)" }}>Specs</span>
        <span style={{ color: "var(--okryshto-text-muted)" }}>Guidelines</span>
      </div>
    </div>
  ),
};
