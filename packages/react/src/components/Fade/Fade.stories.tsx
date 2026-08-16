import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Fade } from "./Fade";

/**
 * The plainest of the five: opacity from 0 to 1 and back. Reach for it when the
 * thing appearing is already in the right place and does not need to be pointed
 * at — swapping one panel for another, revealing a detail, dropping in a backdrop.
 *
 * It animates opacity and nothing else, so the child keeps its box the whole time
 * and the page never reflows. That is the reason to choose it over `Grow` or
 * `Zoom`: no movement means nothing next to it moves either. The flip side is that
 * a faded-out child still occupies its space and still takes clicks unless you also
 * pass `unmountOnExit`.
 *
 * Props follow MUI's Fade — `in`, `appear`, `timeout`, `easing`, `mountOnEnter`,
 * `unmountOnExit` and the six lifecycle callbacks all mean what they do there. The
 * child must be a single element that accepts a `ref`, a `className` and a `style`:
 * the transition is written onto that element, not onto a wrapper.
 */
const meta: Meta<typeof Fade> = {
  title: "Helpers/Transitions/Fade",
  component: Fade,
  args: {
    in: true,
    appear: true,
    timeout: 300,
    mountOnEnter: false,
    unmountOnExit: false,
  },
  argTypes: {
    in: { control: "boolean" },
    appear: { control: "boolean" },
    timeout: { control: "number" },
    mountOnEnter: { control: "boolean" },
    unmountOnExit: { control: "boolean" },
    easing: { control: false },
    children: { control: false },
    style: { control: false },
    addEndListener: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <Fade {...args}>
        <div style={panel}>Toggle `in` from the controls panel.</div>
      </Fade>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Fade>;

const surface: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  width: "420px",
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

// A real surface, not a flat accent block: a transition is only legible against
// something that reads as part of the page, and white-on-mint — what these stories
// used to be — is unreadable at any opacity.
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
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The everyday use: a detail panel that is not worth a page of its own. The row
 * above it does not move, because opacity costs no layout.
 */
export const RevealingADetail: Story = {
  name: "Revealing a detail",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide the details" : "Show the details"}
        </Button>
        <Fade in={open} timeout={200}>
          <div style={panel}>
            Built from a single token pipeline. Every colour here is a variable, which is why the
            panel keeps working when the theme changes underneath it.
          </div>
        </Fade>
      </div>
    );
  },
};

/**
 * Two panels in the same slot, one fading out as the other fades in. Stack them in
 * a grid cell rather than sequencing them: overlapping is what makes it read as one
 * thing changing rather than two things flickering.
 */
export const CrossFade: Story = {
  name: "Cross-fade",
  render: () => {
    const [showing, setShowing] = useState<"summary" | "raw">("summary");
    const cell: CSSProperties = { display: "grid", gridTemplateAreas: '"stack"' };
    const stacked: CSSProperties = { ...panel, gridArea: "stack" };
    return (
      <div style={surface}>
        <Button
          size="small"
          variant="secondary"
          onClick={() => setShowing(showing === "summary" ? "raw" : "summary")}
        >
          Show the {showing === "summary" ? "raw payload" : "summary"}
        </Button>
        <div style={cell}>
          <Fade in={showing === "summary"} timeout={250}>
            <div style={stacked}>48,120 listeners this month, up 12.5% on the last.</div>
          </Fade>
          <Fade in={showing === "raw"} timeout={250}>
            <div style={{ ...stacked, fontFamily: "var(--okryshto-font-family-mono)" }}>
              {`{ "listeners": 48120, "delta": 0.125 }`}
            </div>
          </Fade>
        </div>
      </div>
    );
  },
};

/**
 * A faded-out child is still in the document: it holds its space and still answers
 * to the mouse. `unmountOnExit` removes it once the animation finishes, and
 * `mountOnEnter` keeps it out of the tree until it is first needed.
 *
 * Use both for anything expensive or focusable. Leave both off when the child is
 * cheap and you want its box reserved — a placeholder that must not move the layout
 * when it arrives.
 */
export const Unmounting: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Toggle both panels
        </Button>
        <Fade in={open} timeout={300}>
          <div style={panel}>Kept mounted — inspect the DOM while it is hidden.</div>
        </Fade>
        <Fade in={open} timeout={300} mountOnEnter unmountOnExit>
          <div style={panel}>Mounted on enter, removed on exit.</div>
        </Fade>
        <p style={caption}>Only the first panel exists in the DOM when both are hidden.</p>
      </div>
    );
  },
};

/**
 * `timeout` takes one number for both directions or `{ enter, exit }` for each.
 * Asymmetric is usually right: arriving should be quick enough not to be waited
 * for, leaving slow enough to be noticed.
 */
export const Timeouts: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Toggle all three
        </Button>
        <Fade in={open} timeout={120}>
          <div style={panel}>120ms — barely a transition, just not a jump.</div>
        </Fade>
        <Fade in={open} timeout={300}>
          <div style={panel}>300ms — the default weight.</div>
        </Fade>
        <Fade in={open} timeout={{ enter: 150, exit: 600 }}>
          <div style={panel}>Fast in, slow out.</div>
        </Fade>
      </div>
    );
  },
};

/**
 * A `transitionDelay` in `style` is read by the transition rather than fought with,
 * so a stagger is just an index times a step. Keep the step small and cap the
 * total: past about half a second the last row feels broken rather than choreographed.
 */
export const Staggered: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const rows = ["Night drive", "Long exposure", "Signal", "Harbour lights"];
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Replay the list
        </Button>
        {rows.map((row, index) => (
          <Fade key={row} in={open} timeout={250} style={{ transitionDelay: `${index * 60}ms` }}>
            <div style={{ ...panel, padding: "12px 20px" }}>{row}</div>
          </Fade>
        ))}
      </div>
    );
  },
};

/**
 * `appear` decides whether a child that starts with `in` already true animates on
 * its first render. Leave it on for something the user just navigated to; turn it
 * off for content that was always there, so the page does not fade in around them.
 */
export const Appear: Story = {
  render: () => (
    <div style={surface}>
      <Fade in appear timeout={600}>
        <div style={panel}>appear — fades in when this story mounts.</div>
      </Fade>
      <Fade in appear={false} timeout={600}>
        <div style={panel}>appear={"{false}"} — simply there.</div>
      </Fade>
      <p style={caption}>Reload the story to see the difference; both end in the same place.</p>
    </div>
  ),
};
