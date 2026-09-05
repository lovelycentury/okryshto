import { useCallback, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Popover } from "./Popover";

/**
 * A panel anchored to something on the page that closes when you click away from
 * it. It is the middle ground between a `Tooltip`, which cannot be interacted with,
 * and a `Dialog`, which takes over the page: use it for menus, filter panels, date
 * pickers, a profile card — anything that belongs *to* a control rather than to the
 * page.
 *
 * It is `Popper` plus dismissal: the positioning is the same engine, and Popover
 * adds Escape, click-outside, a surface to put things on, and a `Grow` transition.
 * If you do not want any of that — a hover card, a dropdown that must not steal
 * focus — you want `Popper`.
 *
 * Note that it is **not** modal and has **no scrim by default**: `hideBackdrop`
 * starts at `true`, and dismissal comes from a click-outside listener rather than
 * from a backdrop catching the click. Pass `hideBackdrop={false}` when you want the
 * page behind sealed off — see `WithABackdrop`.
 *
 * `anchorEl` is what it points at. Two things about it: it must be a real element,
 * so keep it in state rather than a ref (a ref does not re-render the popover when
 * it changes), and `anchorPosition` replaces it entirely when you want to anchor to
 * coordinates instead — a right-click menu, a point on a canvas.
 *
 * Props follow MUI's Popover where the shapes agree, with placement borrowed from
 * Popper's vocabulary rather than MUI's `anchorOrigin`/`transformOrigin` pair.
 */
const meta: Meta<typeof Popover> = {
  title: "Overlays/Popover",
  component: Popover,
  args: {
    placement: "bottom-start",
    matchAnchorWidth: false,
    // The component's own default. Set to `false` here it would look as though a
    // scrim were standard, which is the opposite of what this component does.
    hideBackdrop: true,
    disablePortal: false,
    transitionDuration: "auto",
  },
  argTypes: {
    placement: {
      control: "select",
      options: [
        "top",
        "bottom",
        "left",
        "right",
        "bottom-start",
        "bottom-end",
        "top-start",
        "top-end",
      ],
    },
    matchAnchorWidth: { control: "boolean" },
    hideBackdrop: { control: "boolean" },
    disablePortal: { control: "boolean" },
    minWidth: { control: "text" },
    open: { control: false },
    onClose: { control: false },
    anchorEl: { control: false },
    anchorPosition: { control: false },
    children: { control: false },
    paperClassName: { control: false },
  },
  render: (args) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const handleClose = useCallback(() => setAnchorEl(null), []);
    return (
      <div style={surface}>
        <Button size="small" onClick={(event) => setAnchorEl(event.currentTarget)}>
          Open the popover
        </Button>
        <Popover {...args} open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose}>
          <div style={body}>
            <p style={{ margin: 0 }}>Anchored to the button. Click outside or press Escape.</p>
          </div>
        </Popover>
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

const surface: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "12px",
  padding: "32px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// The paper brings its own background and border; this is only the padding and the
// text rhythm, which belong to the content rather than to the component.
const body: CSSProperties = {
  padding: "16px",
  fontSize: "var(--okkly-font-size-sm)",
  lineHeight: "var(--okkly-font-line-height-sm)",
  color: "var(--okkly-text-secondary)",
};

const menuItem: CSSProperties = {
  display: "block",
  width: "100%",
  padding: "9px 14px",
  border: "none",
  background: "none",
  color: "var(--okkly-text-secondary)",
  fontFamily: "var(--okkly-font-family-sans)",
  fontSize: "var(--okkly-font-size-sm)",
  textAlign: "left",
  cursor: "pointer",
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
 * The commonest use: a menu hanging off a button. `bottom-end` aligns its right
 * edge with the trigger's, which is what keeps a right-aligned toolbar menu from
 * running off the page.
 *
 * The toolbar is pushed to the right here for a reason. `bottom-end` is a
 * preference, and the `flip` modifier changes the variation as readily as the side:
 * put this trigger near the left edge and a 200px menu aligned to its right edge
 * would start off-screen, so Popper quietly serves you `bottom-start` instead. That
 * is correct behaviour, and it is why a story about `-end` has to leave room for it.
 *
 * Each item closes the popover. A menu that stays open after a choice makes the
 * user dismiss it themselves, which is one interaction too many.
 */
export const AMenu: Story = {
  name: "A menu",
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [last, setLast] = useState<string | null>(null);
    const handleClose = useCallback(() => setAnchorEl(null), []);
    const items = ["Duplicate", "Move to…", "Rename", "Delete"];
    return (
      <div style={surface}>
        <div style={{ display: "flex", justifyContent: "flex-end", width: "420px" }}>
          <Button
            size="small"
            variant="secondary"
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            Actions
          </Button>
        </div>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          placement="bottom-end"
          minWidth={200}
        >
          <div style={{ padding: "6px 0" }}>
            {items.map((item) => (
              <button
                key={item}
                type="button"
                style={{
                  ...menuItem,
                  color: item === "Delete" ? "var(--okkly-accent-ember)" : menuItem.color,
                }}
                onClick={() => {
                  setLast(item);
                  handleClose();
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </Popover>
        <p style={caption}>Chose: {last ?? "—"}</p>
      </div>
    );
  },
};

/**
 * `matchAnchorWidth` locks the paper to the trigger's width, which is what makes a
 * popover read as a dropdown belonging to the field above it rather than a panel
 * that happens to be nearby. It is what `Select` and `Autocomplete` use.
 *
 * `minWidth` is the other half: a floor for the case where the anchor is tiny.
 */
export const MatchingTheAnchor: Story = {
  name: "Matching the anchor",
  render: () => {
    const [which, setWhich] = useState<"matched" | "free" | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const handleClose = useCallback(() => {
      setWhich(null);
      setAnchorEl(null);
    }, []);
    // `MouseEvent<HTMLElement>`, not `<HTMLButtonElement>`: `Button` renders either a
    // button or an anchor, so its `onClick` demands a handler that accepts both.
    const open = (kind: "matched" | "free") => (event: MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
      setWhich(kind);
    };
    return (
      <div style={{ ...surface, flexDirection: "column", alignItems: "stretch", width: "420px" }}>
        <Button size="small" variant="secondary" onClick={open("matched")}>
          A wide trigger — matched width
        </Button>
        <Button size="small" variant="ghost" onClick={open("free")}>
          A wide trigger — natural width
        </Button>
        <Popover
          open={which !== null}
          anchorEl={anchorEl}
          onClose={handleClose}
          matchAnchorWidth={which === "matched"}
        >
          <div style={body}>
            {which === "matched"
              ? "As wide as the trigger, however wide that is."
              : "As wide as this text needs to be."}
          </div>
        </Popover>
      </div>
    );
  },
};

/**
 * `anchorPosition` anchors to a point instead of an element — the context-menu case.
 * Right-click the panel below: the popover opens where the pointer was, not where
 * any button is.
 *
 * `anchorEl` is ignored when this is set, so there is nothing to keep in state
 * except the coordinates.
 */
export const AtAPoint: Story = {
  name: "At a point",
  render: () => {
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const handleClose = useCallback(() => setPosition(null), []);
    return (
      <div style={surface}>
        <div
          onContextMenu={(event) => {
            event.preventDefault();
            setPosition({ top: event.clientY, left: event.clientX });
          }}
          style={{
            display: "grid",
            placeItems: "center",
            width: "420px",
            height: "200px",
            border: "var(--okkly-1px-in-rem) dashed var(--okkly-border-default)",
            borderRadius: "14px",
            color: "var(--okkly-text-muted)",
            fontSize: "var(--okkly-font-size-sm)",
          }}
        >
          Right-click anywhere in here
        </div>
        <Popover
          open={position !== null}
          anchorPosition={position ?? undefined}
          onClose={handleClose}
        >
          <div style={{ padding: "6px 0", minWidth: "170px" }}>
            {["Cut", "Copy", "Paste"].map((item) => (
              <button key={item} type="button" style={menuItem} onClick={handleClose}>
                {item}
              </button>
            ))}
          </div>
        </Popover>
      </div>
    );
  },
};

/**
 * Placement is a preference. The engine flips and shifts the paper to keep it on
 * screen, so a popover asked for `top` near the top edge comes out at the bottom —
 * which is the correct answer, and the reason not to hard-code a position.
 */
export const Placements: Story = {
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [placement, setPlacement] = useState<"top" | "bottom" | "left" | "right">("bottom");
    const handleClose = useCallback(() => setAnchorEl(null), []);
    return (
      <div style={{ ...surface, padding: "80px" }}>
        {(["top", "bottom", "left", "right"] as const).map((option) => (
          <Button
            key={option}
            size="small"
            variant="ghost"
            onClick={(event) => {
              setPlacement(option);
              setAnchorEl(event.currentTarget);
            }}
          >
            {option}
          </Button>
        ))}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          placement={placement}
        >
          <div style={body}>placement = {placement}</div>
        </Popover>
      </div>
    );
  },
};

/**
 * Something worth putting in a popover: a small form. It is the shape a `Dialog`
 * would be too heavy for and a `Tooltip` could not hold at all.
 *
 * Note that focus is not trapped — a popover is not modal. Escape and a click
 * outside close it, and Tab walks out of it into the page, which is the behaviour a
 * dropdown wants.
 */
export const AFilterPanel: Story = {
  name: "A filter panel",
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [active, setActive] = useState<string[]>(["Albums"]);
    const handleClose = useCallback(() => setAnchorEl(null), []);
    const filters = ["Albums", "Singles", "Remixes", "Unreleased"];
    const toggle = (filter: string) =>
      setActive((current) =>
        current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
      );
    return (
      <div style={surface}>
        <Button
          size="small"
          variant="secondary"
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          Filters ({active.length})
        </Button>
        <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose} minWidth={260}>
          <div style={{ ...body, display: "grid", gap: "12px" }}>
            <strong style={{ color: "var(--okkly-text-primary)" }}>Show</strong>
            {filters.map((filter) => (
              <label key={filter} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={active.includes(filter)}
                  onChange={() => toggle(filter)}
                />
                {filter}
              </label>
            ))}
            <Button size="small" onClick={handleClose}>
              Apply
            </Button>
          </div>
        </Popover>
        <p style={caption}>Active: {active.join(", ") || "none"}</p>
      </div>
    );
  },
};

/**
 * `hideBackdrop={false}` adds a real scrim. Both modes dismiss on a click outside;
 * what changes is what that click *also* does.
 *
 * Without a scrim — the default — the page behind stays live, so the click that
 * closes the popover lands on whatever was under it. For a menu that is usually
 * welcome. For a form it means a stray click can close and act in one go, and the
 * scrim is worth the weight.
 *
 * Try both buttons below and watch the counter.
 */
export const WithABackdrop: Story = {
  name: "With a backdrop",
  render: () => {
    const [which, setWhich] = useState<"bare" | "scrim" | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [clicks, setClicks] = useState(0);
    const handleClose = useCallback(() => {
      setWhich(null);
      setAnchorEl(null);
    }, []);
    const open = (kind: "bare" | "scrim") => (event: MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
      setWhich(kind);
    };
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={open("bare")}>
          Open without a scrim
        </Button>
        <Button size="small" variant="secondary" onClick={open("scrim")}>
          Open with a scrim
        </Button>
        <Button size="small" variant="ghost" onClick={() => setClicks((value) => value + 1)}>
          A button behind it ({clicks})
        </Button>
        <Popover
          open={which !== null}
          anchorEl={anchorEl}
          onClose={handleClose}
          hideBackdrop={which !== "scrim"}
        >
          <div style={body}>
            Now click “A button behind it”. Without a scrim the counter goes up as this closes; with
            one, it does not.
          </div>
        </Popover>
      </div>
    );
  },
};

/**
 * `transitionDuration` takes `"auto"`, a number, or `{ enter, exit }`. `"auto"`
 * derives it from the paper's height, which keeps a long menu and a short one
 * feeling like the same control.
 */
export const TransitionDuration: Story = {
  name: "Transition duration",
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [duration, setDuration] = useState<"auto" | number>("auto");
    const handleClose = useCallback(() => setAnchorEl(null), []);
    const options: Array<"auto" | number> = ["auto", 0, 150, 600];
    return (
      <div style={surface}>
        {options.map((option) => (
          <Button
            key={String(option)}
            size="small"
            variant="ghost"
            onClick={(event) => {
              setDuration(option);
              setAnchorEl(event.currentTarget);
            }}
          >
            {String(option)}
          </Button>
        ))}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          transitionDuration={duration}
        >
          <div style={body}>
            transitionDuration = {String(duration)}
            <br />
            Close it to see the exit at the same speed.
          </div>
        </Popover>
      </div>
    );
  },
};

/**
 * The anchor has to be a state value, not a ref. A ref does not re-render, so the
 * popover would open against `null` on the first click and be positioned in the
 * corner — the classic version of this bug is shown on the right.
 */
export const AnchorMustBeState: Story = {
  name: "Anchor must be state",
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const brokenRef = useRef<HTMLButtonElement>(null);
    const [brokenOpen, setBrokenOpen] = useState(false);
    return (
      <div style={surface}>
        <Button
          size="small"
          variant="secondary"
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          Correct — anchor in state
        </Button>
        <Button ref={brokenRef} size="small" variant="ghost" onClick={() => setBrokenOpen(true)}>
          Also fine here — but only because opening re-renders
        </Button>
        <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
          <div style={body}>Anchored where it should be.</div>
        </Popover>
        <Popover
          open={brokenOpen}
          anchorEl={brokenRef.current}
          onClose={() => setBrokenOpen(false)}
        >
          <div style={body}>
            This one works by luck: `setBrokenOpen` happens to re-render, so `brokenRef.current` is
            populated by the time it is read. Change anything about when it opens and it breaks.
          </div>
        </Popover>
      </div>
    );
  },
};
