import { useRef, useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Slide } from "./Slide";

/**
 * Movement from off-screen to in place. `direction` is where the child comes
 * *from*, not where it goes: `direction="up"` means it enters travelling upward,
 * from below the edge.
 *
 * The one thing to know before using it: the offset is measured against the
 * viewport, so by default the child is parked outside the window and travels the
 * whole distance in. That is right for a drawer or a sheet, which are fixed to an
 * edge anyway. For a panel that lives inside a box, pass `container` — the element
 * whose edge it should hide behind — and give that element `overflow: hidden`, or
 * the child will fly across the page and push the document's scrollbars out.
 *
 * Slide moves but does not fade: the child is at full opacity for the entire trip.
 * Combine it with `Fade` when the arrival should be soft as well as directional.
 *
 * Props follow MUI's Slide. The child must be a single element that accepts a
 * `ref`, a `className` and a `style`.
 */
const meta: Meta<typeof Slide> = {
  title: "Helpers/Transitions/Slide",
  component: Slide,
  args: {
    in: true,
    appear: true,
    direction: "down",
    timeout: 400,
    mountOnEnter: false,
    unmountOnExit: false,
  },
  argTypes: {
    in: { control: "boolean" },
    appear: { control: "boolean" },
    direction: { control: "inline-radio", options: ["left", "right", "up", "down"] },
    timeout: { control: "number" },
    mountOnEnter: { control: "boolean" },
    unmountOnExit: { control: "boolean" },
    container: { control: false },
    easing: { control: false },
    children: { control: false },
    style: { control: false },
    addEndListener: { control: false },
  },
  render: (args) => {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
      <div style={surface}>
        <div ref={containerRef} style={{ ...stage, height: "180px" }}>
          <Slide {...args} container={() => containerRef.current}>
            <div style={panel}>Toggle `in` and change `direction` from the controls.</div>
          </Slide>
        </div>
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Slide>;

const surface: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  width: "460px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// `overflow: hidden` is not decoration — it is what turns the stage into an edge
// for the child to come from. Without it the panel is visible for the whole trip
// and drags the page's scrollbars along with it.
const stage: CSSProperties = {
  position: "relative",
  display: "flex",
  overflow: "hidden",
  padding: "16px",
  border: "var(--okkly-1px-in-rem) solid var(--okkly-border-subtle)",
  borderRadius: "16px",
  background: "var(--okkly-bg-inset)",
};

const panel: CSSProperties = {
  padding: "20px",
  border: "var(--okkly-1px-in-rem) solid var(--okkly-border-subtle)",
  borderRadius: "12px",
  background: "var(--okkly-bg-surface-raised)",
  color: "var(--okkly-text-secondary)",
  fontSize: "var(--okkly-font-size-sm)",
  lineHeight: "var(--okkly-font-line-height-sm)",
  boxShadow: "0 0.5rem 1.5rem rgba(0, 0, 0, 0.5)",
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
 * The reason the component exists: a panel anchored to an edge, entering from that
 * edge. This is `Drawer` in miniature — a fixed sheet, a scrim behind it, and the
 * slide carrying it in.
 *
 * The stage below stands in for the viewport, which is what `container` is for.
 */
export const ASheet: Story = {
  name: "A sheet",
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          {open ? "Close" : "Open"} the sheet
        </Button>
        <div ref={containerRef} style={{ ...stage, height: "220px", padding: 0 }}>
          <div
            style={{
              padding: "16px",
              fontSize: "var(--okkly-font-size-sm)",
              color: "var(--okkly-text-muted)",
            }}
          >
            The page underneath.
          </div>
          <Slide in={open} direction="left" container={() => containerRef.current} timeout={300}>
            <div
              style={{
                ...panel,
                position: "absolute",
                inset: "0 0 0 auto",
                width: "220px",
                borderRadius: 0,
              }}
            >
              A sheet on the right edge, entering leftward.
            </div>
          </Slide>
        </div>
      </div>
    );
  },
};

/**
 * All four directions against the same stage. Read each label as the side the panel
 * comes *from*: `direction="right"` starts off the left edge and travels right.
 */
export const Directions: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const directions = ["down", "up", "left", "right"] as const;
    return (
      <div style={{ ...surface, width: "600px" }}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Replay all four
        </Button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {directions.map((direction) => (
            <Stage key={direction} direction={direction} open={open} />
          ))}
        </div>
      </div>
    );
  },
};

/**
 * One stage from the `Directions` grid. Split out because `container` needs a ref
 * that belongs to a single stage, and a ref cannot be created inside a `map`.
 */
function Stage({
  direction,
  open,
}: {
  direction: "left" | "right" | "up" | "down";
  open: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={containerRef}
      style={{ ...stage, height: "130px", alignItems: "center", justifyContent: "center" }}
    >
      <Slide in={open} direction={direction} container={() => containerRef.current} timeout={400}>
        <div style={{ ...panel, fontFamily: "var(--okkly-font-family-mono)" }}>{direction}</div>
      </Slide>
    </div>
  );
}

/**
 * Without `container` the child is parked outside the *window*, so it travels the
 * full width of the viewport and is visible the whole way. On a page that scrolls,
 * that also means a horizontal scrollbar for the duration of the animation.
 *
 * The two stages below differ in nothing but that prop. Give it the box you want the
 * panel to hide behind — and give that box `overflow: hidden`.
 */
export const TheContainerProp: Story = {
  name: "The container prop",
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(true);
    return (
      // Pushed to the right edge on purpose. Against the left of the page the two
      // stages are indistinguishable — the container's edge and the window's are
      // within a few dozen pixels of each other, so both panels park in almost the
      // same place. The gap only opens up once the container is far from the edge.
      <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        <div style={{ ...surface, width: "380px" }}>
          <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
            Replay both
          </Button>
          <div ref={containerRef} style={{ ...stage, height: "120px", alignItems: "center" }}>
            <Slide in={open} direction="right" container={() => containerRef.current} timeout={500}>
              <div style={panel}>With container — hides behind this edge.</div>
            </Slide>
          </div>
          <div style={{ ...stage, height: "120px", alignItems: "center" }}>
            <Slide in={open} direction="right" timeout={500}>
              <div style={panel}>Without — travels from the window edge.</div>
            </Slide>
          </div>
          <p style={caption}>
            The second panel starts further out and arrives late, having crossed the page.
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Slide keeps the child at full opacity, which is what makes it feel physical. Wrap
 * it in a `Fade` when you want the arrival softened — the two compose, since one
 * writes `transform` and the other `opacity`.
 */
export const Timeouts: Story = {
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(true);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Toggle all three
        </Button>
        <div ref={containerRef} style={{ ...stage, flexDirection: "column", gap: "12px" }}>
          <Slide in={open} direction="right" container={() => containerRef.current} timeout={200}>
            <div style={panel}>200ms</div>
          </Slide>
          <Slide in={open} direction="right" container={() => containerRef.current} timeout={500}>
            <div style={panel}>500ms</div>
          </Slide>
          <Slide
            in={open}
            direction="right"
            container={() => containerRef.current}
            timeout={{ enter: 250, exit: 800 }}
          >
            <div style={panel}>Fast in, slow out</div>
          </Slide>
        </div>
      </div>
    );
  },
};

/**
 * A list dealing itself in. The delay lives in `style` and is merged into the
 * child's own transition rather than replacing it.
 */
export const Staggered: Story = {
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(true);
    const rows = ["Night drive", "Long exposure", "Signal", "Harbour lights"];
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Replay the list
        </Button>
        <div ref={containerRef} style={{ ...stage, flexDirection: "column", gap: "10px" }}>
          {rows.map((row, index) => (
            <Slide
              key={row}
              in={open}
              direction="right"
              container={() => containerRef.current}
              timeout={300}
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <div style={{ ...panel, padding: "12px 16px" }}>{row}</div>
            </Slide>
          ))}
        </div>
      </div>
    );
  },
};
