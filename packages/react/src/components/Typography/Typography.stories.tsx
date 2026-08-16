import type { Meta, StoryObj } from "@storybook/react";
import { Typography, TYPOGRAPHY_VARIANTS, type TypographyVariant } from "./Typography";

/**
 * Every step of the editorial type scale, from `display-2xl` down to `mono-sm`. Each
 * variant carries its own size, line height, weight and tracking, and renders a sensible
 * element by default — `h1` for headings, `p` for body, `code` for mono.
 *
 * When the semantics and the look need to disagree, `as` overrides the element without
 * touching the styling: `<Typography variant="h1" as="div">` looks like a page title but
 * leaves the document outline alone. The props of whatever you render as are inferred, so
 * `as="a"` accepts `href`.
 */
const meta: Meta<typeof Typography> = {
  title: "Data/Typography",
  component: Typography,
  args: {
    children: "The quick brown fox jumps over the lazy dog",
  },
  argTypes: {
    variant: { control: "select", options: Object.keys(TYPOGRAPHY_VARIANTS) },
    as: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Typography>;

/**
 * This example shows the default state: `body-md`, rendered as a paragraph,
 * inheriting the surrounding colour.
 */
export const Default: Story = {};

/**
 * The whole scale in order, with the element each step renders as by default.
 */
export const Scale: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {(Object.keys(TYPOGRAPHY_VARIANTS) as TypographyVariant[]).map((variant) => (
        <div key={variant}>
          <Typography variant="label-sm" color="muted" as="div">
            {variant} → &lt;{TYPOGRAPHY_VARIANTS[variant]}&gt;
          </Typography>
          <Typography variant={variant}>Aa — the quick brown fox</Typography>
        </div>
      ))}
    </div>
  ),
};

/**
 * `as` decouples the look from the markup. All three of these are styled as an
 * `h1` while rendering different elements.
 */
export const PolymorphicAs: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Typography variant="h1">Default element for the variant (h1)</Typography>
      <Typography variant="h1" as="div">
        Same styling, rendered as a div
      </Typography>
      <Typography variant="h1" as="a" href="https://okryshto.dev">
        Rendered as a link — href is type-checked
      </Typography>
    </div>
  ),
};

/**
 * Semantic colours. `inherit` is the default so text picks up whatever surface
 * it lands on.
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {(
        [
          "inherit",
          "primary",
          "secondary",
          "muted",
          "accent",
          "success",
          "warning",
          "danger",
        ] as const
      ).map((color) => (
        <Typography key={color} color={color}>
          {color}
        </Typography>
      ))}
    </div>
  ),
};

/**
 * Alignment, a size-proportional bottom gutter, and single-line truncation.
 */
export const Modifiers: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "22rem" }}>
      <div>
        <Typography variant="h3" gutterBottom>
          Heading with a gutter
        </Typography>
        <Typography>The gutter scales with the step above it, not a fixed 8px.</Typography>
      </div>

      <Typography align="center">Centred</Typography>
      <Typography align="right">Right aligned</Typography>

      <Typography noWrap>
        A single line that is far too long for its container and therefore ends in an ellipsis
      </Typography>
    </div>
  ),
};

/**
 * A realistic block: eyebrow, title, lead paragraph and metadata, each mapped to
 * the step it is meant for.
 */
export const InContext: Story = {
  render: () => (
    <article style={{ maxWidth: "34rem" }}>
      <Typography variant="overline" gutterBottom as="div">
        Case study
      </Typography>
      <Typography variant="display-lg" gutterBottom>
        Orbit
      </Typography>
      <Typography variant="body-lg" color="secondary" gutterBottom>
        Approve CV downloads by location and radius, on a map that stays readable at every zoom
        level.
      </Typography>
      <Typography variant="mono-sm" color="muted">
        orbit.okryshto.dev
      </Typography>
    </article>
  ),
};
