import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AnimatedBackground } from "../AnimatedBackground/AnimatedBackground";
import { AnimatedLogo } from "./AnimatedLogo";

/**
 * The brand emblem in motion. Use for loading states, splash screens, and hero moments where a static Logo would feel idle.
 */
const meta: Meta<typeof AnimatedLogo> = {
  title: "Brand/AnimatedLogo",
  component: AnimatedLogo,
  args: {
    size: 240,
    mode: "loop",
  },
  argTypes: {
    size: { control: { type: "range", min: 32, max: 480, step: 8 } },
    mode: { control: "inline-radio", options: ["loop", "once", "cycle"] },
    introDuration: { control: { type: "range", min: 400, max: 6000, step: 100 } },
    holdDuration: { control: { type: "range", min: 0, max: 8000, step: 100 } },
    outroDuration: { control: { type: "range", min: 200, max: 4000, step: 100 } },
    gapDuration: { control: { type: "range", min: 0, max: 3000, step: 100 } },
    startDelay: { control: { type: "range", min: 0, max: 3000, step: 100 } },
    spinDuration: { control: { type: "range", min: 0, max: 90000, step: 1000 } },
    orbitDuration: { control: { type: "range", min: 0, max: 60000, step: 1000 } },
    breatheDuration: { control: { type: "range", min: 0, max: 20000, step: 500 } },
    pulseDuration: { control: { type: "range", min: 0, max: 10000, step: 100 } },
    shimmerDuration: { control: { type: "range", min: 0, max: 12000, step: 100 } },
    heartbeatDuration: { control: { type: "range", min: 0, max: 12000, step: 100 } },
    onCycleComplete: { action: "cycle" },
  },
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <AnimatedBackground
      preset="void"
      style={{
        width: "100%",
        height: "800px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          width: "100%",
          position: "relative",
          top: "100px",
        }}
      >
        <AnimatedLogo {...args} />
      </div>
    </AnimatedBackground>
  ),
};

export default meta;
type Story = StoryObj<typeof AnimatedLogo>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows cycle.
 */
export const Cycle: Story = {
  name: "Cycle — appears, holds, dissolves, repeats",
  args: {
    mode: "cycle",
    introDuration: 2600,
    holdDuration: 2400,
    gapDuration: 500,
  },
};

/**
 * This example shows cycle brisk.
 */
export const CycleBrisk: Story = {
  name: "Cycle — brisk",
  args: {
    mode: "cycle",
    introDuration: 1200,
    holdDuration: 700,
    gapDuration: 200,
  },
};

/**
 * This example shows cycle slow.
 */
export const CycleSlow: Story = {
  name: "Cycle — meditative",
  args: {
    mode: "cycle",
    introDuration: 4500,
    holdDuration: 5000,
    gapDuration: 1200,
    orbitDuration: 45000,
  },
};

/**
 * This example shows intro only.
 */
export const IntroOnly: Story = {
  name: "Once — reveal and settle",
  args: { mode: "once" },
};

/**
 * This example shows replay.
 */
export const Replay: Story = {
  name: "Replay on demand",
  render: (args) => {
    const [run, setRun] = useState(0);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
        <AnimatedLogo key={run} {...args} />
        <button type="button" onClick={() => setRun((n) => n + 1)}>
          Replay
        </button>
      </div>
    );
  },
};

/**
 * This example shows paused.
 */
export const Paused: Story = {
  name: "Paused mid-flight",
  args: { paused: true },
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
      {[48, 96, 160, 240].map((size) => (
        <AnimatedLogo key={size} size={size} />
      ))}
    </div>
  ),
};

/**
 * This example shows stripped.
 */
export const Stripped: Story = {
  name: "Parts toggled off",
  args: {
    showRings: false,
    showMarkers: false,
    showGlyphs: false,
    showBackdrop: false,
  },
};

/**
 * This example shows recoloured.
 */
export const Recoloured: Story = {
  name: "Recoloured via custom properties",
  render: (args) => (
    <div style={{ display: "flex", gap: "32px" }}>
      <AnimatedLogo {...args} size={160} />
      <AnimatedLogo
        {...args}
        size={160}
        style={
          {
            "--okryshto-animated-logo-mint": "#ffd76e",
            "--okryshto-animated-logo-rose": "#ff6b35",
            "--okryshto-animated-logo-indigo": "#0ea5e9",
            "--okryshto-animated-logo-violet": "#22d3ee",
          } as React.CSSProperties
        }
      />
    </div>
  ),
};

/**
 * This example shows as page loader.
 */
export const AsPageLoader: Story = {
  name: "As a page loader",
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "28px",
        width: "560px",
        height: "420px",
        borderRadius: "16px",
        background: "var(--okryshto-bg-canvas)",
        border: "1px solid var(--okryshto-border-subtle)",
      }}
    >
      <AnimatedLogo size={180} mode="cycle" holdDuration={1200} title="Loading okryshto.dev" />
      <span
        style={{ fontSize: "13px", letterSpacing: "0.08em", color: "var(--okryshto-text-muted)" }}
      >
        LOADING
      </span>
    </div>
  ),
};
