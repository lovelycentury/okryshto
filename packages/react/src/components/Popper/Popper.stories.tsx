import { useRef, useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Fade } from "../Fade/Fade";
import { Popper, type PopperPlacement } from "./Popper";

/**
 * Positioning and nothing else. Popper puts an element next to another element and
 * keeps it there — through scrolling, resizing, and the edges of the viewport — and
 * makes no decision about how it opens, closes, or looks.
 *
 * That is the difference from `Popover`, which is this plus a backdrop, a
 * click-outside, Escape and a surface. Choose Popper when you want to own the
 * dismissal: a hover card, an autocomplete list that must not steal focus, a toolbar
 * that follows a selection. Choose `Popover` for a menu or a panel — you will
 * otherwise rebuild it.
 *
 * It draws no surface, exactly as `Modal` draws none. The children bring their own
 * background, or they sit transparent on the page.
 *
 * Two behaviours worth knowing. It flips and shifts to stay on screen, so
 * `placement` is a preference rather than an instruction. And `anchorEl` accepts a
 * virtual element — an object with `getBoundingClientRect` — which is how you anchor
 * to a text selection or a point on a canvas that has no DOM node of its own.
 *
 * Props follow MUI's Popper: `anchorEl`, `placement`, `keepMounted`,
 * `disablePortal`, `container`, `modifiers`, `popperOptions`, `popperRef`,
 * `transition`.
 */
const meta: Meta<typeof Popper> = {
  title: "Overlays/Popper",
  component: Popper,
  args: {
    placement: "bottom",
    keepMounted: false,
    disablePortal: false,
    transition: false,
  },
  argTypes: {
    placement: {
      control: "select",
      options: [
        "top",
        "bottom",
        "left",
        "right",
        "top-start",
        "top-end",
        "bottom-start",
        "bottom-end",
        "left-start",
        "right-start",
      ],
    },
    keepMounted: { control: "boolean" },
    disablePortal: { control: "boolean" },
    transition: { control: "boolean" },
    matchAnchorWidth: { control: false },
    minWidth: { control: "text" },
    open: { control: false },
    anchorEl: { control: false },
    children: { control: false },
    modifiers: { control: false },
    popperOptions: { control: false },
    popperRef: { control: false },
    container: { control: false },
  },
  render: (args) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    return (
      <div style={surface}>
        <Button
          size="small"
          onClick={(event) => setAnchorEl(anchorEl ? null : (event.currentTarget as HTMLElement))}
        >
          {anchorEl ? "Hide" : "Show"} the popper
        </Button>
        <Popper {...args} open={Boolean(anchorEl)} anchorEl={anchorEl}>
          <div style={paper}>
            Positioned, and nothing else. Nothing here closes it but the button.
          </div>
        </Popper>
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Popper>;

const surface: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "12px",
  padding: "48px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// Popper paints nothing, so every story has to bring a surface — the same bargain
// `Modal` makes, for the same reason: a component that drew a panel could not be the
// base of a tooltip, an autocomplete list and a selection toolbar at once.
const paper: CSSProperties = {
  maxWidth: "280px",
  padding: "14px 16px",
  border: "var(--okkly-1px-in-rem) solid var(--okkly-border-subtle)",
  borderRadius: "12px",
  background: "var(--okkly-bg-surface-raised)",
  color: "var(--okkly-text-secondary)",
  fontSize: "var(--okkly-font-size-sm)",
  lineHeight: "var(--okkly-font-line-height-sm)",
  boxShadow: "0 0.75rem 2rem rgba(0, 0, 0, 0.55)",
};

const caption: CSSProperties = {
  margin: 0,
  width: "100%",
  fontSize: "var(--okkly-font-size-sm)",
  color: "var(--okkly-text-muted)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * A hover card — the case `Popover` cannot do, because its backdrop would swallow
 * the hover and its click-outside would fight the pointer. Popper positions; the
 * story owns when it appears.
 */
export const AHoverCard: Story = {
  name: "A hover card",
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    return (
      <div style={surface}>
        <p style={{ margin: 0, maxWidth: "460px", lineHeight: 1.7 }}>
          The record was mixed by{" "}
          <a
            href="#ok"
            onMouseEnter={(event) => setAnchorEl(event.currentTarget)}
            onMouseLeave={() => setAnchorEl(null)}
            onFocus={(event) => setAnchorEl(event.currentTarget)}
            onBlur={() => setAnchorEl(null)}
            style={{ color: "var(--okkly-accent-primary)" }}
          >
            Oleksii Kryshtopa
          </a>{" "}
          over two weeks in a room with no windows.
        </p>
        <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="top-start">
          <div style={{ ...paper, display: "grid", gap: "6px" }}>
            <strong style={{ color: "var(--okkly-text-primary)" }}>Oleksii Kryshtopa</strong>
            <span>Design systems, and records nobody asked for.</span>
          </div>
        </Popper>
      </div>
    );
  },
};

/**
 * Placement is a preference. The engine flips to the opposite side and shifts along
 * the axis to keep the element on screen, so what you ask for is what you get only
 * when there is room for it.
 *
 * The render-prop form gives you the placement that was actually used — which is how
 * a tooltip knows which way to point its arrow.
 */
export const Placements: Story = {
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [placement, setPlacement] = useState<PopperPlacement>("bottom");
    const placements: PopperPlacement[] = [
      "top",
      "bottom",
      "left",
      "right",
      "top-start",
      "bottom-end",
    ];
    return (
      <div style={{ ...surface, padding: "90px" }}>
        {placements.map((option) => (
          <Button
            key={option}
            size="small"
            variant="ghost"
            onClick={(event) => {
              setPlacement(option);
              setAnchorEl(event.currentTarget as HTMLElement);
            }}
          >
            {option}
          </Button>
        ))}
        <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement={placement}>
          {({ placement: resolved }) => (
            <div style={paper}>
              asked for <code>{placement}</code>
              <br />
              resolved to <code>{resolved}</code>
            </div>
          )}
        </Popper>
        <p style={caption}>
          Scroll the frame so a button nears an edge, then reopen: the two differ.
        </p>
      </div>
    );
  },
};

/**
 * `anchorEl` accepts a *virtual element* — anything with a `getBoundingClientRect`.
 * That is how you anchor to something with no node of its own: a text selection, a
 * cell in a canvas, a point on a map.
 *
 * Select some of the text below and a toolbar appears over it.
 */
export const AVirtualAnchor: Story = {
  name: "A virtual anchor",
  render: () => {
    const [rect, setRect] = useState<DOMRect | null>(null);
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setRect(null);
        return;
      }
      setRect(selection.getRangeAt(0).getBoundingClientRect());
    };
    return (
      <div style={surface}>
        <p
          onMouseUp={handleSelection}
          onKeyUp={handleSelection}
          style={{ margin: 0, maxWidth: "460px", lineHeight: 1.8, userSelect: "text" }}
        >
          Select any part of this sentence and a small toolbar will appear above the selection,
          anchored to a rectangle rather than to an element.
        </p>
        <Popper
          open={rect !== null}
          anchorEl={rect ? { getBoundingClientRect: () => rect } : null}
          placement="top"
        >
          <div style={{ ...paper, display: "flex", gap: "8px", padding: "8px" }}>
            <Button size="small" variant="ghost">
              Bold
            </Button>
            <Button size="small" variant="ghost">
              Link
            </Button>
            <Button size="small" variant="ghost">
              Quote
            </Button>
          </div>
        </Popper>
      </div>
    );
  },
};

/**
 * `transition` hands the children a render prop with `TransitionProps` to spread
 * onto a transition component, and holds the element mounted until the exit
 * finishes. Without it, Popper is present or absent with nothing in between.
 */
export const WithATransition: Story = {
  name: "With a transition",
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    return (
      <div style={surface}>
        <Button
          size="small"
          variant="secondary"
          onClick={(event) => setAnchorEl(open ? null : (event.currentTarget as HTMLElement))}
        >
          {open ? "Hide" : "Show"}
        </Button>
        <Popper open={open} anchorEl={anchorEl} transition placement="bottom-start">
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={{ enter: 150, exit: 300 }}>
              <div style={paper}>Fades in, and takes its time leaving.</div>
            </Fade>
          )}
        </Popper>
      </div>
    );
  },
};

/**
 * `matchAnchorWidth` locks the element to the anchor's width — `true` for exactly,
 * `"min"` for at least. This is what makes an autocomplete list line up with its
 * field instead of floating beside it.
 */
export const MatchingTheAnchor: Story = {
  name: "Matching the anchor",
  render: () => {
    const [mode, setMode] = useState<true | "min" | false | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const options: Array<{ label: string; value: true | "min" | false }> = [
      { label: "true", value: true },
      { label: '"min"', value: "min" },
      { label: "false", value: false },
    ];
    return (
      <div style={{ ...surface, flexDirection: "column", alignItems: "stretch", width: "460px" }}>
        {options.map((option) => (
          <Button
            key={option.label}
            size="small"
            variant="ghost"
            onClick={(event) => {
              setMode(option.value);
              setAnchorEl(event.currentTarget as HTMLElement);
            }}
          >
            matchAnchorWidth = {option.label}
          </Button>
        ))}
        <Popper
          open={mode !== null}
          anchorEl={anchorEl}
          matchAnchorWidth={mode === null ? false : mode}
          placement="bottom-start"
        >
          <div style={paper}>Short.</div>
        </Popper>
      </div>
    );
  },
};

/**
 * `keepMounted` leaves the element in the DOM while closed, hidden rather than
 * removed. Worth it when the children are expensive to build or hold state you do
 * not want to lose; otherwise it is a subtree that keeps running for nothing.
 *
 * `disablePortal` leaves it where it is written instead of moving it to the body.
 * The positioning still works, but the element now inherits any ancestor's
 * `overflow: hidden` — which is the usual reason a dropdown appears clipped.
 */
export const MountingAndPortals: Story = {
  name: "Mounting and portals",
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [clipped, setClipped] = useState<HTMLElement | null>(null);
    return (
      <div style={{ ...surface, flexDirection: "column", alignItems: "flex-start" }}>
        <Button
          size="small"
          variant="secondary"
          onClick={(event) => setAnchorEl(anchorEl ? null : (event.currentTarget as HTMLElement))}
        >
          Toggle a kept-mounted popper
        </Button>
        <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} keepMounted>
          <div style={paper}>Still in the DOM when hidden — inspect it.</div>
        </Popper>

        <div
          style={{
            overflow: "hidden",
            width: "320px",
            height: "90px",
            padding: "16px",
            border: "var(--okkly-1px-in-rem) dashed var(--okkly-border-default)",
            borderRadius: "12px",
          }}
        >
          <Button
            size="small"
            variant="ghost"
            onClick={(event) => setClipped(clipped ? null : (event.currentTarget as HTMLElement))}
          >
            Open inside an overflow:hidden box
          </Button>
          <Popper open={Boolean(clipped)} anchorEl={clipped} disablePortal placement="bottom-start">
            <div style={paper}>Cut off by the box, because `disablePortal` kept it inside.</div>
          </Popper>
        </div>
        <p style={caption}>The second popper is clipped. Remove `disablePortal` and it is not.</p>
      </div>
    );
  },
};

/**
 * `modifiers` reaches Popper.js directly. The commonest one by far is `offset` —
 * the gap between the anchor and the element, which is otherwise zero and makes the
 * two look glued together.
 */
export const Offset: Story = {
  render: () => {
    const [distance, setDistance] = useState<number | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    return (
      <div style={surface}>
        {[0, 8, 24].map((value) => (
          <Button
            key={value}
            size="small"
            variant="ghost"
            onClick={(event) => {
              setDistance(value);
              setAnchorEl(event.currentTarget as HTMLElement);
            }}
          >
            offset {value}px
          </Button>
        ))}
        <Popper
          open={distance !== null}
          anchorEl={anchorEl}
          placement="bottom"
          modifiers={[{ name: "offset", options: { offset: [0, distance ?? 0] } }]}
        >
          <div style={paper}>{distance}px from the anchor.</div>
        </Popper>
      </div>
    );
  },
};

/**
 * Popper has no dismissal of its own — that is the contract, not an omission. A
 * click outside, Escape, and closing on scroll are all yours to add.
 *
 * If your list of things to add is "backdrop, click-outside, Escape", stop and use
 * `Popover`.
 */
export const YouOwnTheDismissal: Story = {
  name: "You own the dismissal",
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const paperRef = useRef<HTMLDivElement>(null);
    return (
      <div
        style={surface}
        onKeyDown={(event) => {
          if (event.key === "Escape") setAnchorEl(null);
        }}
      >
        <Button
          size="small"
          variant="secondary"
          onClick={(event) => setAnchorEl(anchorEl ? null : (event.currentTarget as HTMLElement))}
        >
          Open
        </Button>
        <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="bottom-start">
          <div ref={paperRef} style={paper}>
            Escape closes this because the story added a handler. Clicking elsewhere does not,
            because nobody wrote that either.
          </div>
        </Popper>
        <p style={caption}>Focus this frame first, then press Escape.</p>
      </div>
    );
  },
};
