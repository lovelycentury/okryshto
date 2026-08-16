import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { iconInfo, iconSettings, iconTrash } from "@okryshto/icons";
import { Button } from "../Button/Button";
import { Tooltip, type TooltipPlacement } from "./Tooltip";

/**
 * A short label that appears on hover or focus and says what a control is. Use it
 * where the control cannot say so itself — an icon button, a truncated cell, an
 * abbreviation.
 *
 * Two rules worth stating before the API, because they are what tooltips are
 * usually got wrong on:
 *
 * 1. **It is not a place for content.** It is unreachable on touch, invisible in
 *    print, and gone the moment the pointer moves. Anything the user actually needs
 *    belongs on the page or in a `Popover`.
 * 2. **It decides whether to name or to describe.** If the trigger already has a
 *    name — visible text or its own `aria-label` — the tooltip is attached as a
 *    description, so the button keeps saying what it says. If the trigger has no
 *    name at all, as an icon button does not, the tooltip becomes the name, and
 *    permanently rather than only while it is on screen. `describeChild` forces the
 *    description side when you want it.
 *
 * `interactive` is on by default and keeps the tooltip open while the pointer is
 * inside it, which is what makes a tooltip with a link in it usable at all. Turn it
 * off and moving toward the tooltip closes it.
 *
 * Props follow MUI's Tooltip: `title`, `placement`, `arrow`, `enterDelay`,
 * `leaveDelay`, `open`/`defaultOpen`/`onOpen`/`onClose`, `disableHoverListener`,
 * `disableFocusListener`, `interactive`, `transitionDuration`.
 */
const meta: Meta<typeof Tooltip> = {
  title: "Overlays/Tooltip",
  component: Tooltip,
  args: {
    title: "Saved to your library",
    placement: "top",
    arrow: false,
    enterDelay: 100,
    leaveDelay: 0,
    // The component's own defaults, so the Playground starts where the component
    // does rather than somewhere the docs would then have to explain.
    interactive: true,
    describeChild: false,
    disableHoverListener: false,
    disableFocusListener: false,
  },
  argTypes: {
    title: { control: "text" },
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
      ],
    },
    arrow: { control: "boolean" },
    enterDelay: { control: "number" },
    leaveDelay: { control: "number" },
    interactive: { control: "boolean" },
    describeChild: { control: "boolean" },
    disableHoverListener: { control: "boolean" },
    disableFocusListener: { control: "boolean" },
    open: { control: false },
    defaultOpen: { control: false },
    onOpen: { control: false },
    onClose: { control: false },
    children: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <Tooltip {...args}>
        <Button size="small" variant="secondary">
          Hover me
        </Button>
      </Tooltip>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// Generous padding: a tooltip is positioned against the viewport, and a trigger
// hard against an edge gets flipped to the other side, which makes a placement
// story lie about what it is showing.
const surface: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "12px",
  padding: "48px",
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

const caption: CSSProperties = {
  margin: 0,
  width: "100%",
  fontSize: "var(--okryshto-font-size-sm)",
  color: "var(--okryshto-text-muted)",
};

const iconButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
  border: "var(--okryshto-1px-in-rem) solid var(--okryshto-border-subtle)",
  borderRadius: "10px",
  background: "var(--okryshto-bg-surface)",
  color: "var(--okryshto-text-secondary)",
  cursor: "pointer",
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
 * The case tooltips are for: a row of icon buttons where nothing is written down.
 * Each one is a real `<button>` with no text, so the tooltip is what names it — for
 * the eye and for the accessibility tree both.
 *
 * Inspect one in the accessibility panel: it carries `aria-label`, not
 * `aria-describedby`, and it carries it whether or not the tooltip is showing. A
 * description would leave the button nameless, which is what "button, button,
 * button" sounds like to a screen reader.
 */
export const NamingIconButtons: Story = {
  name: "Naming icon buttons",
  render: () => (
    <div style={surface}>
      <Tooltip title="Settings">
        <button type="button" style={iconButton}>
          <Glyph svg={iconSettings} />
        </button>
      </Tooltip>
      <Tooltip title="About this release">
        <button type="button" style={iconButton}>
          <Glyph svg={iconInfo} />
        </button>
      </Tooltip>
      <Tooltip title="Delete — this cannot be undone">
        <button type="button" style={iconButton}>
          <Glyph svg={iconTrash} />
        </button>
      </Tooltip>
      <p style={caption}>Tab through them: each one is announced by its tooltip.</p>
    </div>
  ),
};

/**
 * Twelve placements. The one you ask for is a preference, not a guarantee — a
 * tooltip that would leave the viewport flips to the opposite side. That is why the
 * stories here sit well inside the frame.
 */
export const Placements: Story = {
  render: () => {
    const placements: TooltipPlacement[] = [
      "top-start",
      "top",
      "top-end",
      "left-start",
      "left",
      "left-end",
      "right-start",
      "right",
      "right-end",
      "bottom-start",
      "bottom",
      "bottom-end",
    ];
    return (
      <div
        style={{
          ...surface,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          width: "560px",
        }}
      >
        {placements.map((placement) => (
          <Tooltip key={placement} title={placement} placement={placement}>
            <Button size="small" variant="ghost">
              {placement}
            </Button>
          </Tooltip>
        ))}
      </div>
    );
  },
};

/**
 * Naming versus describing, side by side. The choice is made from the trigger, not
 * from a prop:
 *
 * - **No name of its own** (an icon button) → the tooltip becomes the name,
 *   `aria-label`, present whether or not the tooltip is open.
 * - **Has a name** (a button with text, or its own `aria-label`) → the tooltip is a
 *   description, `aria-describedby`, added while it is open. The button goes on
 *   saying what is written on it, which is what voice control needs.
 * - **`describeChild`** → forces the description side even for a nameless trigger.
 *   For when something else on the page already labels it.
 *
 * The alternative — labelling every trigger with its title, as MUI does — renames
 * “Publish” to whatever the tooltip says, and then the user who says “click
 * Publish” is talking about a control that is no longer called that.
 */
export const NamingVersusDescribing: Story = {
  name: "Naming versus describing",
  render: () => (
    <div style={surface}>
      <Tooltip title="Settings">
        <button type="button" style={iconButton}>
          <Glyph svg={iconSettings} />
        </button>
      </Tooltip>
      <Tooltip title="Makes your edits visible to everyone">
        <Button size="small" variant="secondary">
          Publish
        </Button>
      </Tooltip>
      <Tooltip title="Described, not named" describeChild>
        <button type="button" style={iconButton}>
          <Glyph svg={iconInfo} />
        </button>
      </Tooltip>
      <p style={caption}>
        Left: named by the tooltip. Middle: still called “Publish”, with the tooltip as its
        description. Right: `describeChild`, so it has no name at all — deliberately.
      </p>
    </div>
  ),
};

/**
 * `arrow` points at the trigger. It earns its keep when several targets sit close
 * together and the tooltip could plausibly belong to any of them; on a lone button
 * it is decoration.
 */
export const WithAnArrow: Story = {
  name: "With an arrow",
  render: () => (
    <div style={surface}>
      <Tooltip title="No arrow">
        <Button size="small" variant="secondary">
          Plain
        </Button>
      </Tooltip>
      <Tooltip title="With an arrow" arrow>
        <Button size="small" variant="secondary">
          Arrow
        </Button>
      </Tooltip>
    </div>
  ),
};

/**
 * `enterDelay` is what stops a row of controls from flashing tooltips as the pointer
 * crosses it. `leaveDelay` holds it open a moment after leaving, which matters when
 * the pointer has to cross a gap to reach the tooltip itself.
 *
 * Around 100ms in and 0 out is the working default. Zero in means every pass over
 * the control fires; a long delay means the user has stopped and wondered before it
 * answers.
 */
export const Delays: Story = {
  render: () => (
    <div style={surface}>
      <Tooltip title="No delay at all" enterDelay={0}>
        <Button size="small" variant="ghost">
          0ms
        </Button>
      </Tooltip>
      <Tooltip title="The default" enterDelay={100}>
        <Button size="small" variant="ghost">
          100ms
        </Button>
      </Tooltip>
      <Tooltip title="Deliberate" enterDelay={600}>
        <Button size="small" variant="ghost">
          600ms
        </Button>
      </Tooltip>
      <Tooltip title="Lingers after you leave" enterDelay={0} leaveDelay={800}>
        <Button size="small" variant="ghost">
          leaveDelay 800ms
        </Button>
      </Tooltip>
      <p style={caption}>Sweep the pointer across all four to feel the difference.</p>
    </div>
  ),
};

/**
 * `interactive` keeps the tooltip open while the pointer is over it, so a link or a
 * shortcut inside it can actually be reached. Without it, the tooltip closes as
 * soon as the pointer leaves the trigger — including on its way to the tooltip.
 *
 * If you find yourself needing this, check whether the content should be in a
 * `Popover` instead: a tooltip with things to click in it is usually a small popover
 * that has not admitted it yet.
 */
export const Interactive: Story = {
  render: () => (
    <div style={surface}>
      <Tooltip
        title={
          <span>
            Not reachable — try to move onto this{" "}
            <a href="#nope" style={{ color: "var(--okryshto-accent-primary)" }}>
              link
            </a>
          </span>
        }
      >
        <Button size="small" variant="ghost">
          Plain
        </Button>
      </Tooltip>
      <Tooltip
        interactive
        leaveDelay={150}
        title={
          <span>
            Reachable — this{" "}
            <a href="#yes" style={{ color: "var(--okryshto-accent-primary)" }}>
              link
            </a>{" "}
            can be clicked
          </span>
        }
      >
        <Button size="small" variant="ghost">
          Interactive
        </Button>
      </Tooltip>
    </div>
  ),
};

/**
 * Pass `open` and the tooltip is yours to drive — for an onboarding hint, a
 * validation message, or anything that should appear without the pointer. Use
 * `onOpen`/`onClose` to keep your state in step with the hover and focus the
 * component still detects.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div style={surface}>
        <Tooltip title="Held open from the outside" open={open} arrow>
          <Button size="small" variant="secondary">
            The target
          </Button>
        </Tooltip>
        <Button size="small" variant="ghost" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide it" : "Show it"}
        </Button>
        <p style={caption}>Hover does nothing here — `open` is the only thing deciding.</p>
      </div>
    );
  },
};

/**
 * The listeners can be switched off one at a time. `disableFocusListener` is the
 * one to think twice about: it is what removes the tooltip for anyone navigating by
 * keyboard, so unless the trigger carries its own accessible name, that user is left
 * with an unlabelled control.
 */
export const DisablingListeners: Story = {
  name: "Disabling listeners",
  render: () => (
    <div style={surface}>
      <Tooltip title="Hover and focus both">
        <Button size="small" variant="ghost">
          Both
        </Button>
      </Tooltip>
      <Tooltip title="Focus only" disableHoverListener>
        <Button size="small" variant="ghost">
          Focus only — Tab to it
        </Button>
      </Tooltip>
      <Tooltip title="Hover only" disableFocusListener>
        <Button size="small" variant="ghost">
          Hover only
        </Button>
      </Tooltip>
    </div>
  ),
};

/**
 * A tooltip on a disabled control needs a wrapper: a disabled button fires no
 * pointer events, so the listeners never hear anything. Put the trigger on a span
 * around it — and say *why* it is disabled, which is the one thing a disabled
 * control cannot tell anyone by itself.
 */
export const OnADisabledControl: Story = {
  name: "On a disabled control",
  render: () => (
    <div style={surface}>
      <Tooltip title="Add a title before you can publish">
        <span style={{ display: "inline-flex" }} tabIndex={0}>
          <Button size="small" disabled>
            Publish
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="This one hears nothing — the button swallows the events">
        <Button size="small" disabled>
          Publish (no wrapper)
        </Button>
      </Tooltip>
      <p style={caption}>Only the first one responds.</p>
    </div>
  ),
};
