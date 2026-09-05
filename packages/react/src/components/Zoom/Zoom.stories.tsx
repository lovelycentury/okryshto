import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { iconCheck, iconHeart, iconPlus, iconShare } from "@okkly/icons";
import { Button } from "../Button/Button";
import { Zoom } from "./Zoom";

/**
 * Scale from nothing to full size. Unlike `Grow` it does not touch opacity and does
 * not start part-way — the child grows out of a point, which makes it the loudest
 * of the five and the wrong choice for anything the user did not just ask for.
 *
 * Use it on small, self-contained things where the arrival is the message: a
 * floating action button appearing, a badge landing on a count, a checkmark
 * replacing a spinner. On a large panel the same scale reads as the page lurching.
 *
 * Because it is pure `transform`, it costs no layout: the child's box is reserved
 * the whole time. Two zooms can therefore share one slot and swap without anything
 * around them moving — which is the `SwappingIcons` story below.
 *
 * Props follow MUI's Zoom. The child must be a single element that accepts a `ref`,
 * a `className` and a `style`.
 */
const meta: Meta<typeof Zoom> = {
  title: "Helpers/Transitions/Zoom",
  component: Zoom,
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
      <Zoom {...args}>
        <div style={fab}>
          <Glyph svg={iconPlus} />
        </div>
      </Zoom>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Zoom>;

const surface: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "16px",
  width: "420px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// A round accent button rather than a flat block of colour: zoom is read from the
// silhouette, and a circle growing out of a point is the shape this transition was
// designed around.
const fab: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: "var(--okkly-accent-primary)",
  color: "var(--okkly-bg-base)",
  boxShadow: "0 0.5rem 1.5rem rgba(0, 0, 0, 0.5)",
};

const panel: CSSProperties = {
  padding: "20px",
  border: "var(--okkly-1px-in-rem) solid var(--okkly-border-subtle)",
  borderRadius: "14px",
  background: "var(--okkly-bg-surface)",
  color: "var(--okkly-text-secondary)",
  fontSize: "var(--okkly-font-size-sm)",
  lineHeight: "var(--okkly-font-line-height-sm)",
};

const caption: CSSProperties = {
  margin: 0,
  fontSize: "var(--okkly-font-size-sm)",
  color: "var(--okkly-text-muted)",
};

const Glyph = ({ svg }: { svg: string }) => (
  <span
    aria-hidden="true"
    style={{ display: "inline-flex" }}
    dangerouslySetInnerHTML={{ __html: svg }}
  />
);

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The archetype: a floating action button that belongs to one tab and leaves with
 * it. `unmountOnExit` is what keeps the hidden button out of the tab order — a
 * scaled-to-zero element is still focusable.
 */
export const AFloatingAction: Story = {
  name: "A floating action",
  render: () => {
    const [tab, setTab] = useState<"library" | "settings">("library");
    return (
      <div style={surface}>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            size="small"
            variant={tab === "library" ? "primary" : "ghost"}
            onClick={() => setTab("library")}
          >
            Library
          </Button>
          <Button
            size="small"
            variant={tab === "settings" ? "primary" : "ghost"}
            onClick={() => setTab("settings")}
          >
            Settings
          </Button>
        </div>
        <div style={{ ...panel, position: "relative", width: "100%", height: "160px" }}>
          {tab === "library" ? "Add a track to the library." : "Nothing to add here."}
          <Zoom in={tab === "library"} unmountOnExit>
            <div style={{ ...fab, position: "absolute", right: "20px", bottom: "20px" }}>
              <Glyph svg={iconPlus} />
            </div>
          </Zoom>
        </div>
        <p style={caption}>Tab into the panel on Settings: there is no button to reach.</p>
      </div>
    );
  },
};

/**
 * Two zooms sharing one grid cell, with the exit timed shorter than the enter so
 * the outgoing icon is gone before the incoming one is at full size. Nothing moves
 * around them because neither icon ever gives up its box.
 */
export const SwappingIcons: Story = {
  name: "Swapping icons",
  render: () => {
    const [saved, setSaved] = useState(false);
    const cell: CSSProperties = {
      display: "grid",
      gridTemplateAreas: '"stack"',
      placeItems: "center",
    };
    return (
      <div style={surface}>
        <div style={cell}>
          <Zoom in={!saved} timeout={{ enter: 300, exit: 150 }}>
            <div style={{ ...fab, gridArea: "stack" }}>
              <Glyph svg={iconHeart} />
            </div>
          </Zoom>
          <Zoom in={saved} timeout={{ enter: 300, exit: 150 }}>
            <div style={{ ...fab, gridArea: "stack", background: "var(--okkly-accent-secondary)" }}>
              <Glyph svg={iconCheck} />
            </div>
          </Zoom>
        </div>
        <Button size="small" variant="secondary" onClick={() => setSaved((value) => !value)}>
          {saved ? "Remove from the library" : "Save to the library"}
        </Button>
      </div>
    );
  },
};

/**
 * Zoom is at its best on something small. The same transition on a full-width panel
 * is the second row here — it is not broken, it is just too much movement for the
 * amount of information that changed. Use `Fade` or `Grow` there instead.
 */
export const SizeMatters: Story = {
  name: "Size matters",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Replay both
        </Button>
        <Zoom in={open} timeout={300}>
          <div style={fab}>
            <Glyph svg={iconShare} />
          </div>
        </Zoom>
        <Zoom in={open} timeout={300}>
          <div style={{ ...panel, width: "100%" }}>
            A whole panel zooming. Compare it with the button above: the same transformation, and
            only one of them reads as intentional.
          </div>
        </Zoom>
      </div>
    );
  },
};

/**
 * Zoom takes the same `timeout` shapes as the rest of the family. A single number
 * for both directions, or `{ enter, exit }` when the swap needs the outgoing element
 * out of the way first.
 */
export const Timeouts: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Toggle all three
        </Button>
        <div style={{ display: "flex", gap: "20px" }}>
          <Zoom in={open} timeout={150}>
            <div style={fab}>
              <Glyph svg={iconPlus} />
            </div>
          </Zoom>
          <Zoom in={open} timeout={400}>
            <div style={fab}>
              <Glyph svg={iconHeart} />
            </div>
          </Zoom>
          <Zoom in={open} timeout={{ enter: 200, exit: 700 }}>
            <div style={fab}>
              <Glyph svg={iconShare} />
            </div>
          </Zoom>
        </div>
        <p style={caption}>150ms, 400ms, and fast-in/slow-out.</p>
      </div>
    );
  },
};

/**
 * A row of actions arriving one after another. Sixty milliseconds between them is
 * enough to read as a sequence; much more and the last one looks like it was
 * forgotten.
 */
export const Staggered: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const actions = [iconPlus, iconHeart, iconShare, iconCheck];
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
          Replay the row
        </Button>
        <div style={{ display: "flex", gap: "16px" }}>
          {actions.map((svg, index) => (
            <Zoom
              key={index}
              in={open}
              timeout={250}
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <div style={{ ...fab, width: "44px", height: "44px" }}>
                <Glyph svg={svg} />
              </div>
            </Zoom>
          ))}
        </div>
      </div>
    );
  },
};
