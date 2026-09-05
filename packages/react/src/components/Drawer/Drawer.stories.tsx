import { useCallback, useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Drawer, type DrawerAnchor } from "./Drawer";

/**
 * A panel that slides in from an edge and takes the page with it. Use it for
 * navigation on narrow screens, for a filter rail beside a table, or for a bottom
 * sheet of actions — anything that is a *place* rather than a question. A question
 * is a `Dialog`.
 *
 * Built on `Modal`, which owns the portal, backdrop, focus trap, scroll lock and
 * focus restoration. The drawer adds the anchored, sliding paper — and keeps itself
 * mounted for the length of the slide-out, since unmounting on the tick `open`
 * flips would cut the animation short.
 *
 * Size comes from CSS variables rather than props: `--okkly-drawer-width` for the
 * left and right anchors, `--okkly-drawer-height` for top and bottom. Set them on
 * the drawer itself through `style` — they are declared on the component element,
 * so an override on an ancestor will not reach them.
 *
 * Props follow MUI's Drawer (`anchor`, `variant`, plus the Modal pass-throughs).
 * Deliberate gaps: only the `temporary` variant — `persistent` and `permanent` are
 * absent from the type rather than accepted and ignored — and no `SwipeableDrawer`.
 */
const meta: Meta<typeof Drawer> = {
  title: "Overlays/Drawer",
  component: Drawer,
  args: {
    anchor: "right",
    variant: "temporary",
    keepMounted: false,
    hideBackdrop: false,
    disableEscapeKeyDown: false,
    disableScrollLock: false,
  },
  argTypes: {
    anchor: { control: "inline-radio", options: ["left", "right", "top", "bottom"] },
    variant: { control: false },
    keepMounted: { control: "boolean" },
    hideBackdrop: { control: "boolean" },
    disableEscapeKeyDown: { control: "boolean" },
    disableScrollLock: { control: "boolean" },
    open: { control: false },
    onClose: { control: false },
    children: { control: false },
    container: { control: false },
    slotProps: { control: false },
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" onClick={() => setOpen(true)}>
          Open the drawer
        </Button>
        <Drawer {...args} open={open} onClose={handleClose}>
          <div style={panel}>
            <h2 style={heading}>Panel</h2>
            <p style={{ margin: 0 }}>Change `anchor` from the controls and reopen.</p>
            <Button size="small" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Drawer>
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const surface: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "10px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// The paper is a bare flex column — it brings a background and a border and nothing
// else. Padding and rhythm are the caller's, the same bargain `Modal` makes.
const panel: CSSProperties = {
  display: "grid",
  gap: "16px",
  alignContent: "start",
  justifyItems: "start",
  padding: "24px",
  fontFamily: "var(--okkly-font-family-sans)",
  fontSize: "var(--okkly-font-size-sm)",
  lineHeight: "var(--okkly-font-line-height-sm)",
  color: "var(--okkly-text-secondary)",
};

const heading: CSSProperties = {
  margin: 0,
  fontSize: "var(--okkly-font-size-lg)",
  color: "var(--okkly-text-primary)",
};

const navItem: CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  color: "var(--okkly-text-secondary)",
  textDecoration: "none",
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
 * The common case: the navigation of a site that does not have room for it. Anchored
 * left, because that is where a menu button is, and closing on every item — a
 * drawer that stays open after you have chosen makes you close it twice.
 */
export const ANavigationPanel: Story = {
  name: "A navigation panel",
  render: () => {
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState("Library");
    const handleClose = useCallback(() => setOpen(false), []);
    const pages = ["Library", "Releases", "Analytics", "Settings"];
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Menu
        </Button>
        <Drawer open={open} onClose={handleClose} anchor="left">
          <nav style={{ ...panel, gap: "4px", width: "100%" }} aria-label="Main">
            <h2 style={{ ...heading, marginBottom: "12px" }}>Okryshto</h2>
            {pages.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  ...navItem,
                  background: page === item ? "var(--okkly-bg-surface-raised)" : "transparent",
                  color:
                    page === item ? "var(--okkly-text-primary)" : "var(--okkly-text-secondary)",
                }}
                onClick={() => {
                  setPage(item);
                  handleClose();
                }}
              >
                {item}
              </a>
            ))}
          </nav>
        </Drawer>
        <p style={caption}>Current page: {page}</p>
      </div>
    );
  },
};

/**
 * All four edges. `left` and `right` take `--okkly-drawer-width`, `top` and
 * `bottom` take `--okkly-drawer-height`; the bottom anchor also rounds its top
 * corners, which is what makes it read as a sheet rather than a bar.
 */
export const Anchors: Story = {
  render: () => {
    const [anchor, setAnchor] = useState<DrawerAnchor | null>(null);
    const handleClose = useCallback(() => setAnchor(null), []);
    const anchors: DrawerAnchor[] = ["left", "right", "top", "bottom"];
    return (
      <div style={surface}>
        {anchors.map((item) => (
          <Button key={item} size="small" variant="secondary" onClick={() => setAnchor(item)}>
            {item}
          </Button>
        ))}
        <Drawer open={anchor !== null} onClose={handleClose} anchor={anchor ?? "right"}>
          <div style={panel}>
            <h2 style={heading}>anchor = {anchor}</h2>
            <Button size="small" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Drawer>
      </div>
    );
  },
};

/**
 * A bottom sheet of filters, sized with `--okkly-drawer-height` rather than a prop.
 * The variable is declared on the drawer element, so it has to be set there —
 * putting it on a wrapper will not reach it.
 */
export const ABottomSheet: Story = {
  name: "A bottom sheet",
  render: () => {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<string[]>(["Albums"]);
    const handleClose = useCallback(() => setOpen(false), []);
    const filters = ["Albums", "Singles", "Remixes", "Unreleased"];
    const toggle = (filter: string) =>
      setActive((current) =>
        current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
      );
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Filters
        </Button>
        <Drawer
          open={open}
          onClose={handleClose}
          anchor="bottom"
          style={{ "--okkly-drawer-height": "18rem" } as CSSProperties}
        >
          <div style={{ ...panel, width: "100%" }}>
            <h2 style={heading}>Filters</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {filters.map((filter) => (
                <Button
                  key={filter}
                  size="small"
                  variant={active.includes(filter) ? "primary" : "ghost"}
                  onClick={() => toggle(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
            <Button size="small" variant="secondary" onClick={handleClose}>
              Show results
            </Button>
          </div>
        </Drawer>
        <p style={caption}>Active: {active.join(", ") || "none"}</p>
      </div>
    );
  },
};

/**
 * `--okkly-drawer-width` for the side anchors. There is no `width` prop on purpose:
 * the value belongs to the design, not to the call site, so a theme can set it once
 * for every drawer in the app.
 */
export const Widths: Story = {
  render: () => {
    const [width, setWidth] = useState<string | null>(null);
    const handleClose = useCallback(() => setWidth(null), []);
    return (
      <div style={surface}>
        {["16rem", "20rem", "32rem"].map((value) => (
          <Button key={value} size="small" variant="secondary" onClick={() => setWidth(value)}>
            {value}
          </Button>
        ))}
        <Drawer
          open={width !== null}
          onClose={handleClose}
          anchor="right"
          style={{ "--okkly-drawer-width": width ?? "20rem" } as CSSProperties}
        >
          <div style={panel}>
            <h2 style={heading}>{width}</h2>
            <p style={{ margin: 0 }}>Set through `--okkly-drawer-width` on the drawer itself.</p>
            <Button size="small" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Drawer>
      </div>
    );
  },
};

/**
 * `onClose` receives `(event, reason)` — `"backdropClick"` or `"escapeKeyDown"` —
 * so a drawer holding a half-finished form can refuse the stray click and still
 * honour Escape. The reason of the last close is shown below.
 */
export const ClosingReasons: Story = {
  name: "Closing reasons",
  render: () => {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string | null>(null);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Open
        </Button>
        <Drawer
          open={open}
          onClose={(_event, closeReason) => {
            setReason(closeReason);
            setOpen(false);
          }}
        >
          <div style={panel}>
            <h2 style={heading}>Close me</h2>
            <p style={{ margin: 0 }}>Click the scrim, or press Escape, and compare the reason.</p>
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                setReason("your own handler");
                setOpen(false);
              }}
            >
              Close from a button
            </Button>
          </div>
        </Drawer>
        <p style={caption}>Last reason: {reason ?? "—"}</p>
      </div>
    );
  },
};

/**
 * The drawer traps focus while it is open and puts focus back on the trigger when
 * it closes — both inherited from `Modal`, and neither true of this component
 * before it was built on one.
 *
 * Tab from inside the panel: focus cycles within it and never reaches the buttons on
 * the page behind. Close it, and the caret returns to the button you opened it with.
 */
export const FocusHandling: Story = {
  name: "Focus handling",
  render: () => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Open, then Tab around
        </Button>
        <Button size="small" variant="ghost">
          A button on the page
        </Button>
        <Drawer open={open} onClose={handleClose}>
          <div style={panel}>
            <h2 style={heading}>Trapped</h2>
            <Button size="small" variant="ghost">
              First
            </Button>
            <Button size="small" variant="ghost">
              Second
            </Button>
            <Button size="small" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Drawer>
        <p style={caption}>Tab never reaches “A button on the page” while the drawer is open.</p>
      </div>
    );
  },
};
