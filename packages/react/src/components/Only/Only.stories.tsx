import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Only, type OnlyBreakpoint } from "./Only";

/**
 * Mounts its children only while the viewport falls within `[from, to)` —
 * `from` is inclusive, `to` is exclusive, and both are optional. Breakpoint
 * names (`2xs`, `xs`, `sm`, `md`, `lg`, `xl`) match `$breakpoints` in the
 * design system's `breakpoints.scss`.
 *
 * Unlike hiding with CSS, content outside the range is never rendered — no
 * layout cost, no hidden interactive elements sitting in the tab order.
 * Resize the preview panel (or your browser) to see it mount and unmount.
 */
const meta: Meta<typeof Only> = {
  title: "Helpers/Only",
  component: Only,
  args: {
    from: "sm",
    to: "md",
  },
  argTypes: {
    from: { control: "select", options: [undefined, "2xs", "xs", "sm", "md", "lg", "xl"] },
    to: { control: "select", options: [undefined, "2xs", "xs", "sm", "md", "lg", "xl"] },
    children: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <Only {...args}>
        <div style={panel}>
          Visible from {args.from ?? "the start"} up to {args.to ?? "infinity"}.
        </div>
      </Only>
      <p style={caption}>Resize the window to see this mount and unmount.</p>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Only>;

const surface: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  width: "420px",
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

const panel: CSSProperties = {
  padding: "20px",
  border: "var(--okryshto-1px-in-rem) solid var(--okryshto-border-subtle)",
  borderRadius: "14px",
  background: "var(--okryshto-bg-surface)",
  color: "var(--okryshto-text-secondary)",
  fontSize: "var(--okryshto-font-size-sm)",
  lineHeight: "var(--okryshto-font-line-height-sm)",
};

const caption: CSSProperties = {
  margin: 0,
  fontSize: "var(--okryshto-font-size-sm)",
  color: "var(--okryshto-text-muted)",
};

/**
 * Play with `from` and `to` from the controls panel, then resize the preview.
 */
export const Playground: Story = {};

/**
 * Every range at once, so resizing the window shows exactly one panel at a
 * time — the same partition a `switch` on breakpoint name would produce.
 */
export const AllRanges: Story = {
  name: "All ranges",
  render: () => {
    const ranges: Array<{ from?: OnlyBreakpoint; to?: OnlyBreakpoint; label: string }> = [
      { to: "xs", label: "Below xs (2xs phones)" },
      { from: "xs", to: "sm", label: "xs — small phones" },
      { from: "sm", to: "md", label: "sm — tablets" },
      { from: "md", to: "lg", label: "md — small desktops" },
      { from: "lg", to: "xl", label: "lg — desktops" },
      { from: "xl", label: "xl and up — wide desktops" },
    ];
    return (
      <div style={surface}>
        {ranges.map((range) => (
          <Only key={range.label} from={range.from} to={range.to}>
            <div style={panel}>{range.label}</div>
          </Only>
        ))}
        <p style={caption}>Resize the window — exactly one panel is mounted at a time.</p>
      </div>
    );
  },
};

/**
 * `from` alone means "this breakpoint and up"; `to` alone means "up to this
 * breakpoint". Neither given means "always" — useful as an escape hatch when
 * a range is computed and can end up empty.
 */
export const OpenEnded: Story = {
  name: "Open-ended ranges",
  render: () => (
    <div style={surface}>
      <Only to="sm">
        <div style={panel}>Only from=undefined — shown up to sm.</div>
      </Only>
      <Only from="lg">
        <div style={panel}>Only to=undefined — shown from lg up.</div>
      </Only>
      <Only>
        <div style={panel}>Neither bound — always rendered.</div>
      </Only>
    </div>
  ),
};
