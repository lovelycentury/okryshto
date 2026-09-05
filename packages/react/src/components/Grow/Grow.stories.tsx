import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Grow } from "./Grow";

/**
 * Scale and opacity together: the child starts at 75% and slightly squashed, and
 * settles into place as it fades in. It is the transition for things that come
 * *from* somewhere — a menu out of its trigger, a popover off its anchor, a card
 * out of the row it belongs to.
 *
 * The direction is `transform-origin`, which defaults to the centre. Set it to the
 * corner nearest the trigger and the panel appears to unfold from it; leave it in
 * the middle and it simply arrives.
 *
 * `timeout` defaults to `"auto"` here, unlike the rest of the family: the duration
 * is derived from the child's height, so a tall menu takes longer than a short one
 * and both feel like the same speed. The scale runs at two-thirds of that duration
 * and, on the way out, starts a third of the way in — which is why the exit reads
 * as fading first and shrinking after.
 *
 * Props follow MUI's Grow. The child must be a single element that accepts a
 * `ref`, a `className` and a `style`.
 */
const meta: Meta<typeof Grow> = {
  title: "Helpers/Transitions/Grow",
  component: Grow,
  args: {
    in: true,
    appear: true,
    timeout: "auto",
    mountOnEnter: false,
    unmountOnExit: false,
  },
  argTypes: {
    in: { control: "boolean" },
    appear: { control: "boolean" },
    timeout: { control: "select", options: ["auto", 150, 300, 800] },
    mountOnEnter: { control: "boolean" },
    unmountOnExit: { control: "boolean" },
    easing: { control: false },
    children: { control: false },
    style: { control: false },
    addEndListener: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <Grow {...args}>
        <div style={panel}>Toggle `in` from the controls panel.</div>
      </Grow>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Grow>;

const surface: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  width: "420px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// A real surface with a border, not a flat accent block: a scale transition is
// read from the edges, and an edge you cannot see does not move.
const panel: CSSProperties = {
  padding: "20px",
  border: "var(--okkly-1px-in-rem) solid var(--okkly-border-subtle)",
  borderRadius: "14px",
  background: "var(--okkly-bg-surface-raised)",
  color: "var(--okkly-text-secondary)",
  fontSize: "var(--okkly-font-size-sm)",
  lineHeight: "var(--okkly-font-line-height-sm)",
  boxShadow: "0 0.5rem 1.5rem rgba(0, 0, 0, 0.5)",
};

const item: CSSProperties = {
  padding: "10px 14px",
  borderRadius: "8px",
  color: "var(--okkly-text-secondary)",
  fontSize: "var(--okkly-font-size-sm)",
};

const caption: CSSProperties = {
  margin: 0,
  fontSize: "var(--okkly-font-size-sm)",
  color: "var(--okkly-text-muted)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * What it is for: a menu unfolding from the button that opened it. The
 * `transformOrigin` is the top-left corner — the corner touching the trigger —
 * which is what ties the panel to the thing that produced it.
 *
 * `unmountOnExit` matters here rather than being a nicety: a closed menu that is
 * still in the DOM is still in the tab order.
 */
export const AMenu: Story = {
  name: "A menu",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ ...surface, gap: "8px" }}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          {open ? "Close" : "Open"} the menu
        </Button>
        <Grow in={open} style={{ transformOrigin: "top left" }} unmountOnExit>
          <div style={{ ...panel, padding: "6px", width: "220px" }}>
            <div style={item}>Duplicate</div>
            <div style={item}>Move to…</div>
            <div style={item}>Rename</div>
            <div style={item}>Delete</div>
          </div>
        </Grow>
      </div>
    );
  },
};

/**
 * The same panel from four origins. Nothing else differs — the corner alone decides
 * whether it reads as coming from the top of the page or the bottom of it.
 */
export const TransformOrigin: Story = {
  name: "Transform origin",
  render: () => {
    const [open, setOpen] = useState(true);
    const origins = ["center center", "top left", "bottom right", "top center"] as const;
    return (
      <div style={{ ...surface, width: "560px" }}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Replay all four
        </Button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {origins.map((origin) => (
            <Grow key={origin} in={open} timeout={500} style={{ transformOrigin: origin }}>
              <div style={{ ...panel, fontFamily: "var(--okkly-font-family-mono)" }}>{origin}</div>
            </Grow>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * `"auto"` scales the duration with the child's height, so a four-line panel and a
 * one-line one feel like the same gesture. A fixed number gives them the same clock
 * instead, which makes the tall one look slow and the short one look abrupt.
 *
 * Prefer `"auto"` for anything whose size you do not control — a menu whose items
 * come from data, a popover whose body is user content.
 */
export const AutoDuration: Story = {
  name: "Auto duration",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ ...surface, width: "560px" }}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Replay both columns
        </Button>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            alignItems: "start",
          }}
        >
          <Grow in={open} timeout="auto">
            <div style={panel}>Short, auto.</div>
          </Grow>
          <Grow in={open} timeout={300}>
            <div style={panel}>Short, 300ms.</div>
          </Grow>
          <Grow in={open} timeout="auto">
            <div style={panel}>
              Tall, auto. Four lines of copy, which is enough for the derived duration to pull
              noticeably ahead of the short panel next to it — and that is the point: both still
              feel like one speed.
            </div>
          </Grow>
          <Grow in={open} timeout={300}>
            <div style={panel}>
              Tall, 300ms. The same four lines on a fixed clock, which arrives faster than its own
              size suggests it should and reads as clipped.
            </div>
          </Grow>
        </div>
      </div>
    );
  },
};

/**
 * A fixed `timeout` when the gesture matters more than the content: a confirmation
 * chip that must be quick, a panel you want deliberately slow.
 */
export const Timeouts: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Toggle all three
        </Button>
        <Grow in={open} timeout={150}>
          <div style={panel}>150ms</div>
        </Grow>
        <Grow in={open} timeout={400}>
          <div style={panel}>400ms</div>
        </Grow>
        <Grow in={open} timeout={{ enter: 200, exit: 800 }}>
          <div style={panel}>Fast in, slow out</div>
        </Grow>
      </div>
    );
  },
};

/**
 * A grid that grows in row by row. The delay goes in `style` alongside the origin;
 * both are merged into the child rather than overwritten.
 */
export const Staggered: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const tiles = ["Listeners", "Subscribers", "Churn", "Revenue", "Saves", "Comments"];
    return (
      <div style={{ ...surface, width: "560px" }}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Replay the grid
        </Button>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {tiles.map((tile, index) => (
            <Grow key={tile} in={open} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
              <div style={{ ...panel, padding: "14px" }}>{tile}</div>
            </Grow>
          ))}
        </div>
        <p style={caption}>Six tiles, 50ms apart — 250ms of stagger over a 300ms transition.</p>
      </div>
    );
  },
};
