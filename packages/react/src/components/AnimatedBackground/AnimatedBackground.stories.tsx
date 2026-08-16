import type { Meta, StoryObj } from "@storybook/react";
import { AnimatedBackground } from "./AnimatedBackground";

/**
 * Full-bleed atmospheric scene for dark canvases — nebulae, stars, and subtle motion. Intended as a page backdrop, not a content card.
 */
const meta: Meta<typeof AnimatedBackground> = {
  title: "Media/AnimatedBackground",
  component: AnimatedBackground,
  args: {
    preset: "aurora",
    quality: "medium",
    parallax: true,
    fireworks: true,
    respectReducedMotion: true,
    scrim: true,
  },
  argTypes: {
    preset: { control: "inline-radio", options: ["aurora", "midnight", "neon", "void"] },
    quality: { control: "inline-radio", options: ["low", "medium", "high"] },
  },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AnimatedBackground>;

/**
 * This example shows the default state.
 */
export const Default: Story = {
  name: "Legibility — content over scrim",
  render: (args) => (
    <AnimatedBackground {...args}>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          maxWidth: "620px",
          padding: "0 48px",
          color: "#ecedef",
          fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Inter, sans-serif",
        }}
      >
        <p
          style={{
            font: "500 11px/1 ui-monospace, monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#5ee6c1",
            margin: "0 0 22px",
          }}
        >
          07 · Backgrounds — live
        </p>
        <h1
          style={{
            fontSize: "clamp(38px, 6.5vw, 76px)",
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            fontWeight: 700,
            margin: "0 0 24px",
            color: "#fff",
          }}
        >
          Content stays legible over motion
        </h1>
        <p style={{ fontSize: "20px", lineHeight: 1.6, color: "#c9cbd1", margin: "0 0 32px" }}>
          Nebulae, stars, a falling spark, a distant beacon, micro-fireworks and grain — one SVG
          driven by CSS keyframes. No canvas, no render loop, no runtime dependency.
        </p>
        <p
          style={{
            font: "500 11px/1 ui-monospace, monospace",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#6e7075",
          }}
        >
          Switch preset and quality in the controls panel
        </p>
      </div>
    </AnimatedBackground>
  ),
};
