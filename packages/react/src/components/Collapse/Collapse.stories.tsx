import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Collapse } from "./Collapse";

/**
 * The only transition in the family that changes layout: it animates the child's
 * height (or width) between zero and its natural size, so everything after it moves
 * out of the way as it opens. That is the point — an accordion panel that faded in
 * would land on top of the section below it.
 *
 * It is also the only one that renders a wrapper of its own instead of cloning your
 * child, because measuring the content requires a box the animation does not touch.
 * Three nested divs go out: the animating root, a wrapper, and an inner. Your
 * children go inside the last one.
 *
 * `timeout="auto"` derives the duration from the measured size, which is what you
 * want whenever the content comes from data — a short panel and a long one then
 * feel like the same gesture instead of the same clock.
 *
 * Props follow MUI's Collapse: `in`, `orientation`, `collapsedSize`, `timeout`,
 * `easing`, `mountOnEnter`, `unmountOnExit` and the lifecycle callbacks.
 */
const meta: Meta<typeof Collapse> = {
  title: "Helpers/Transitions/Collapse",
  component: Collapse,
  args: {
    in: true,
    appear: true,
    orientation: "vertical",
    timeout: 400,
    collapsedSize: "0px",
    mountOnEnter: false,
    unmountOnExit: false,
  },
  argTypes: {
    in: { control: "boolean" },
    appear: { control: "boolean" },
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    timeout: { control: "number" },
    collapsedSize: { control: "text" },
    mountOnEnter: { control: "boolean" },
    unmountOnExit: { control: "boolean" },
    easing: { control: false },
    children: { control: false },
    style: { control: false },
    addEndListener: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <Collapse {...args}>
        <div style={panel}>
          Toggle `in` from the controls panel. The caption below moves with it — that is the
          difference between this and `Fade`.
        </div>
      </Collapse>
      <p style={caption}>Something after the panel.</p>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Collapse>;

const surface: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  width: "460px",
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

const panel: CSSProperties = {
  padding: "18px",
  border: "var(--okryshto-1px-in-rem) solid var(--okryshto-border-subtle)",
  borderRadius: "12px",
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

const row: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 18px",
  border: "var(--okryshto-1px-in-rem) solid var(--okryshto-border-subtle)",
  borderRadius: "12px",
  background: "var(--okryshto-bg-surface)",
  fontSize: "var(--okryshto-font-size-sm)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * What it is for. Three questions, one open at a time, and the rows below each one
 * moving as it opens. Note `timeout="auto"`: the answers are different lengths and
 * all three still feel like the same control.
 *
 * `Accordion` already does this properly, with the heading semantics and the
 * keyboard handling. Build it by hand only when you need a shape that component
 * does not have.
 */
export const AnAccordion: Story = {
  name: "An accordion",
  render: () => {
    const [open, setOpen] = useState<string | null>("tokens");
    const items = [
      {
        id: "tokens",
        q: "What is a token?",
        a: "A named value — a colour, a size, a duration — that the components read instead of hard-coding it.",
      },
      {
        id: "themes",
        q: "How do themes work?",
        a: "Every token is a CSS variable declared on the root. A theme is a different set of values for the same names, which is why nothing has to re-render for the page to change appearance. Swap the variables and the whole library follows.",
      },
      {
        id: "frameworks",
        q: "Which frameworks?",
        a: "React, Vue and Svelte, from one stylesheet.",
      },
    ];
    return (
      <div style={surface}>
        {items.map((item) => (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(open === item.id ? null : item.id)}
              style={{
                ...row,
                width: "100%",
                cursor: "pointer",
                color: "var(--okryshto-text-primary)",
                fontFamily: "inherit",
              }}
            >
              {item.q}
              <span aria-hidden="true" style={{ color: "var(--okryshto-text-muted)" }}>
                {open === item.id ? "−" : "+"}
              </span>
            </button>
            <Collapse in={open === item.id} timeout="auto">
              <div style={{ ...panel, marginTop: "8px" }}>{item.a}</div>
            </Collapse>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * `collapsedSize` leaves a strip of the content visible instead of closing to
 * nothing. It is the "show more" pattern: the reader can see there is more before
 * deciding to ask for it, which a fully closed panel never tells them.
 *
 * Give the peek a fade at its bottom edge, as here — a hard cut mid-sentence reads
 * as a rendering bug.
 */
export const CollapsedSize: Story = {
  name: "Collapsed size",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={surface}>
        <div style={{ position: "relative" }}>
          <Collapse in={open} collapsedSize={72} timeout="auto">
            <div style={panel}>
              Okryshto started as a token pipeline and grew a component library around it. The
              pipeline is still the part that matters: every colour, radius and duration in this
              page is a variable emitted from one source, and the three framework packages are three
              renderers over the same values. That is why a fix to a shadow lands in React, Vue and
              Svelte at once, and why the theme can change without a single component re-rendering.
            </div>
          </Collapse>
          {!open && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                insetInline: 0,
                bottom: 0,
                height: "40px",
                borderRadius: "0 0 12px 12px",
                background: "linear-gradient(transparent, var(--okryshto-bg-base))",
              }}
            />
          )}
        </div>
        <Button size="small" variant="ghost" onClick={() => setOpen((value) => !value)}>
          {open ? "Show less" : "Show more"}
        </Button>
      </div>
    );
  },
};

/**
 * `orientation="horizontal"` animates width instead of height — a sidebar folding
 * away, a filter rail giving its space back to the table.
 *
 * The child needs a fixed width and `white-space: nowrap`, or it will reflow to
 * narrower and narrower lines as the box closes and the text will appear to melt
 * rather than slide out of view.
 */
export const Horizontal: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ ...surface, width: "560px" }}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          {open ? "Collapse" : "Expand"} the sidebar
        </Button>
        <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
          <Collapse in={open} orientation="horizontal" timeout={400}>
            <div style={{ ...panel, width: "180px", whiteSpace: "nowrap" }}>
              <div style={{ marginBottom: "8px" }}>Library</div>
              <div style={{ marginBottom: "8px" }}>Releases</div>
              <div>Settings</div>
            </div>
          </Collapse>
          <div style={{ ...panel, flex: 1 }}>
            The content takes the space back as the rail closes.
          </div>
        </div>
      </div>
    );
  },
};

/**
 * `"auto"` scales the duration with the measured size; a fixed number does not. The
 * difference is invisible on one panel and obvious on two of different lengths —
 * with a fixed timeout the long one appears to accelerate to keep up.
 */
export const AutoDuration: Story = {
  name: "Auto duration",
  render: () => {
    const [open, setOpen] = useState(true);
    const short = "One line.";
    const long =
      'Six or seven lines of copy, which is enough for the difference to show. With timeout="auto" this panel takes longer than the short one and the two still read as the same control. With a fixed 300ms it covers several times the distance in the same time, which looks like it was dropped rather than opened. The rule of thumb: fix the timeout when you control the content, derive it when the content comes from data.';
    return (
      <div style={{ ...surface, width: "600px" }}>
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
          <div style={{ display: "grid", gap: "8px" }}>
            <p style={caption}>timeout="auto"</p>
            <Collapse in={open} timeout="auto">
              <div style={panel}>{short}</div>
            </Collapse>
            <Collapse in={open} timeout="auto">
              <div style={panel}>{long}</div>
            </Collapse>
          </div>
          <div style={{ display: "grid", gap: "8px" }}>
            <p style={caption}>timeout={"{300}"}</p>
            <Collapse in={open} timeout={300}>
              <div style={panel}>{short}</div>
            </Collapse>
            <Collapse in={open} timeout={300}>
              <div style={panel}>{long}</div>
            </Collapse>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * A closed panel is still in the DOM at zero height, which means its links are still
 * in the tab order and its content is still read by a screen reader. `unmountOnExit`
 * is the fix, and it is not optional for anything focusable.
 *
 * The cost is that the content is rebuilt on every open — fine for markup, worth
 * thinking about for a panel that fetches.
 */
export const Unmounting: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Toggle both panels
        </Button>
        <Collapse in={open} timeout={300}>
          <div style={panel}>
            Kept mounted —{" "}
            <a href="#kept" style={{ color: "var(--okryshto-accent-primary)" }}>
              this link
            </a>{" "}
            is tabbable even when the panel is closed.
          </div>
        </Collapse>
        <Collapse in={open} timeout={300} mountOnEnter unmountOnExit>
          <div style={panel}>
            Unmounted on exit —{" "}
            <a href="#removed" style={{ color: "var(--okryshto-accent-primary)" }}>
              this link
            </a>{" "}
            does not exist while closed.
          </div>
        </Collapse>
        <p style={caption}>
          Close both, then press Tab from the button: only one link is reachable.
        </p>
      </div>
    );
  },
};
