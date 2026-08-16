import { useCallback, useRef, useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Fade } from "../Fade/Fade";
import { Modal } from "./Modal";

/**
 * The plumbing behind every modal overlay, and nothing else: a portal, a backdrop,
 * a focus trap, a scroll lock, Escape handling, and focus put back where it came
 * from when you close.
 *
 * **It draws no surface of its own.** That is deliberate and it is the whole point
 * of the component — `Modal` is what `Dialog` and `Drawer` are built on, and each
 * brings its own chrome. If you render `<Modal>` with some text in it, you get that
 * text floating on the backdrop with no panel behind it. To get a panel, put your
 * own element inside with your own background, padding and radius: that is the
 * `YourOwnDialog` story below, and it is the intended way to use this directly.
 *
 * Reach for `Modal` when you need a shape `Dialog` and `Drawer` do not have — a
 * lightbox, a command palette, a full-bleed media viewer. If you are about to
 * rebuild a centred panel with a title and two buttons, use `Dialog`.
 *
 * Props follow MUI's Modal name-for-name. Deliberate gaps: no `sx`/`classes`, no
 * `slots` component substitution (only `slotProps`), and no `closeAfterTransition`
 * — with no built-in transition to wait on, a consumer that animates keeps itself
 * mounted, which is what `Drawer` does.
 */
const meta: Meta<typeof Modal> = {
  title: "Overlays/Modal",
  component: Modal,
  args: {
    hideBackdrop: false,
    keepMounted: false,
    disablePortal: false,
    disableEscapeKeyDown: false,
    disableAutoFocus: false,
    disableEnforceFocus: false,
    disableRestoreFocus: false,
    disableScrollLock: false,
  },
  argTypes: {
    open: { control: false },
    onClose: { control: false },
    children: { control: false },
    container: { control: false },
    slotProps: { control: false },
    hideBackdrop: { control: "boolean" },
    keepMounted: { control: "boolean" },
    disablePortal: { control: "boolean" },
    disableEscapeKeyDown: { control: "boolean" },
    disableAutoFocus: { control: "boolean" },
    disableEnforceFocus: { control: "boolean" },
    disableRestoreFocus: { control: "boolean" },
    disableScrollLock: { control: "boolean" },
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" onClick={() => setOpen(true)}>
          Open the modal
        </Button>
        <Modal {...args} open={open} onClose={handleClose}>
          <div style={centred}>
            <div style={paper}>
              <p style={{ margin: 0 }}>
                This panel is a plain div in the story, not something Modal drew. Escape, the
                backdrop and the focus trap are Modal's.
              </p>
              <Button size="small" variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const surface: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "10px",
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

// Modal fills the viewport and stacks its children on the backdrop; it does not
// place them. Anything that should sit in the middle needs its own centring layer,
// which is exactly what `Dialog` adds on top of this.
const centred: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  padding: "24px",
};

const paper: CSSProperties = {
  display: "grid",
  gap: "16px",
  justifyItems: "start",
  width: "min(420px, 100%)",
  padding: "24px",
  border: "var(--okryshto-1px-in-rem) solid var(--okryshto-border-subtle)",
  borderRadius: "18px",
  background: "var(--okryshto-bg-surface-raised)",
  color: "var(--okryshto-text-secondary)",
  fontSize: "var(--okryshto-font-size-sm)",
  lineHeight: "var(--okryshto-font-line-height-sm)",
  boxShadow: "0 1.5rem 3rem rgba(0, 0, 0, 0.6)",
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
 * The recipe. `Modal` gives you the behaviour; the surface is yours.
 *
 * Three things the panel has to bring itself, because the component deliberately
 * does not:
 *
 * 1. **Position.** Modal covers the viewport and stacks children over the backdrop
 *    — it does not centre them. The wrapper below is what does.
 * 2. **A surface.** Background, border, radius, shadow, padding. Without them the
 *    content sits directly on the scrim.
 * 3. **The dialog semantics.** `role="dialog"`, `aria-modal="true"` and a label —
 *    `aria-labelledby` pointing at your heading, or `aria-label` if there is none.
 *    Modal's own root is `role="presentation"`, so nothing announces this as a
 *    dialog until you say so.
 *
 * If all three of those are just "a centred panel", you have rebuilt `Dialog` —
 * use it instead.
 */
export const YourOwnDialog: Story = {
  name: "Your own dialog",
  render: () => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" onClick={() => setOpen(true)}>
          Open a hand-built dialog
        </Button>
        <Modal open={open} onClose={handleClose}>
          <div style={centred}>
            <div style={paper} role="dialog" aria-modal="true" aria-labelledby="own-dialog-title">
              <h2
                id="own-dialog-title"
                style={{
                  margin: 0,
                  fontSize: "var(--okryshto-font-size-lg)",
                  color: "var(--okryshto-text-primary)",
                }}
              >
                Built by hand
              </h2>
              <p style={{ margin: 0 }}>
                Everything visible here — the panel, the centring, the heading — is in the story.
                Modal contributed the portal, the scrim, the focus trap, the scroll lock and Escape.
              </p>
              <Button size="small" variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
};

/**
 * What "no chrome" actually looks like. The same content with no wrapper of its own
 * lands in the top-left corner, unstyled, on the scrim.
 *
 * This is not a bug to work around — it is the contract. A component that painted a
 * panel could not be the base of `Drawer`, which is anchored to an edge, or of a
 * lightbox, which has no panel at all.
 */
export const NoSurfaceOfItsOwn: Story = {
  name: "No surface of its own",
  render: () => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Open with no panel
        </Button>
        <Modal open={open} onClose={handleClose}>
          <p
            style={{
              color: "var(--okryshto-text-primary)",
              fontFamily: "var(--okryshto-font-family-sans)",
            }}
          >
            Bare children. Press Escape to close.
          </p>
        </Modal>
      </div>
    );
  },
};

/**
 * A shape `Dialog` does not have: a full-bleed viewer with no panel, closing on any
 * click. This is the case `Modal` exists for.
 */
export const ALightbox: Story = {
  name: "A lightbox",
  render: () => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" onClick={() => setOpen(true)}>
          Open the viewer
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          slotProps={{ backdrop: { style: { background: "rgba(0, 0, 0, 0.88)" } } }}
        >
          <div style={{ ...centred, cursor: "zoom-out" }} onClick={handleClose}>
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: "min(560px, 90vw)",
                aspectRatio: "16 / 10",
                borderRadius: "12px",
                background: "linear-gradient(140deg, #1b2f3a, #3a1b2f)",
                color: "var(--okryshto-text-muted)",
                fontFamily: "var(--okryshto-font-family-mono)",
                fontSize: "var(--okryshto-font-size-sm)",
              }}
            >
              the artwork
            </div>
          </div>
        </Modal>
        <p style={caption}>Click anywhere, or press Escape.</p>
      </div>
    );
  },
};

/**
 * `slotProps.backdrop` reaches the scrim without a wrapper component: restyle it,
 * hang a handler off it, or give it a `data-` attribute for a test.
 *
 * `hideBackdrop` removes it altogether. The modal is still modal — focus is still
 * trapped and the page is still locked — but nothing tells the user that, and a
 * click beside the panel lands on the page behind. Use it only when your own
 * children paint something that reads as a scrim.
 */
export const TheBackdrop: Story = {
  name: "The backdrop",
  render: () => {
    const [which, setWhich] = useState<"tinted" | "hidden" | null>(null);
    const handleClose = useCallback(() => setWhich(null), []);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setWhich("tinted")}>
          Tinted backdrop
        </Button>
        <Button size="small" variant="secondary" onClick={() => setWhich("hidden")}>
          No backdrop
        </Button>
        <Modal
          open={which === "tinted"}
          onClose={handleClose}
          slotProps={{
            backdrop: {
              style: {
                background:
                  "color-mix(in srgb, var(--okryshto-accent-secondary) 30%, rgba(0,0,0,0.7))",
              },
            },
          }}
        >
          <div style={centred}>
            <div style={paper}>
              <p style={{ margin: 0 }}>The scrim is restyled through `slotProps.backdrop`.</p>
              <Button size="small" variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
        <Modal open={which === "hidden"} onClose={handleClose} hideBackdrop>
          <div style={centred}>
            <div style={paper}>
              <p style={{ margin: 0 }}>
                No scrim at all. The page behind is fully visible, and there is nothing to click to
                dismiss — Escape and the button are the only ways out.
              </p>
              <Button size="small" variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
};

/**
 * `Modal` has no transition of its own — it is present or it is not. Wrap the
 * children in one and pass `keepMounted` so the subtree survives long enough to
 * animate out.
 *
 * Without `keepMounted` the modal is gone from the DOM on the same tick `open`
 * flips, and the exit never plays. This is what `Drawer` does internally, and why
 * `closeAfterTransition` is absent from the API: the decision belongs to whoever
 * owns the animation.
 */
export const WithATransition: Story = {
  name: "With a transition",
  render: () => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" onClick={() => setOpen(true)}>
          Open, and watch it leave
        </Button>
        <Modal open={open} onClose={handleClose} keepMounted>
          <Fade in={open} timeout={{ enter: 200, exit: 350 }}>
            <div style={centred}>
              <div style={paper}>
                <p style={{ margin: 0 }}>Fades both ways, because the subtree outlives `open`.</p>
                <Button size="small" variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          </Fade>
        </Modal>
      </div>
    );
  },
};

/**
 * Every guard can be switched off, and each one is off for a reason rather than for
 * convenience:
 *
 * - `disableEscapeKeyDown` — for a step the user must answer rather than dismiss.
 *   Leave them another way out; a modal with no exit is a trap.
 * - `disableScrollLock` — when the page behind is meant to stay usable.
 * - `disableAutoFocus` — when moving focus would interrupt something, e.g. an
 *   overlay that appears while the user is typing.
 * - `disableEnforceFocus` — when a third-party widget outside the portal needs
 *   focus. It also stops Tab from being confined, so screen-reader users can walk
 *   straight out into the page behind.
 * - `disableRestoreFocus` — when you are moving focus somewhere specific yourself
 *   on close.
 */
export const DisablingTheGuards: Story = {
  name: "Disabling the guards",
  render: () => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Open an unguarded modal
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          disableEscapeKeyDown
          disableScrollLock
          disableAutoFocus
          disableRestoreFocus
        >
          <div style={centred}>
            <div style={paper}>
              <p style={{ margin: 0 }}>
                Escape does nothing, the page still scrolls, focus was not moved in and will not be
                moved back. The button below is the only way out — which is the bargain you make
                when you turn these off.
              </p>
              <Button size="small" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
};

/**
 * By default the modal is portalled to `document.body`, which is what keeps it out
 * of any ancestor's `overflow: hidden` or transform. `container` sends it somewhere
 * else instead; `disablePortal` leaves it where it is written.
 *
 * `disablePortal` is a smaller change than it looks: the modal is still
 * `position: fixed`, so it still covers the viewport — but it now inherits the
 * stacking context and the clipping of whatever it sits inside, which is usually
 * how a modal ends up trapped behind a header.
 */
export const PortalAndContainer: Story = {
  name: "Portal and container",
  render: () => {
    const hostRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={{ ...surface, flexDirection: "column", alignItems: "flex-start" }}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Open into the box below
        </Button>
        <div
          ref={hostRef}
          style={{
            position: "relative",
            width: "420px",
            height: "220px",
            border: "var(--okryshto-1px-in-rem) dashed var(--okryshto-border-default)",
            borderRadius: "12px",
          }}
        >
          <p style={{ ...caption, padding: "12px" }}>The modal is mounted inside this box.</p>
        </div>
        <Modal open={open} onClose={handleClose} container={hostRef.current}>
          <div style={centred}>
            <div style={paper}>
              <p style={{ margin: 0 }}>Inspect the DOM: this is a child of the dashed box.</p>
              <Button size="small" variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
};

/**
 * `keepMounted` leaves the subtree in the DOM while closed, hidden with
 * `visibility` rather than removed. Two reasons to want it: the children keep their
 * state between openings, and their content is there for crawlers and in-page find.
 *
 * The cost is that everything inside stays mounted and keeps running. The counter
 * below survives closing; on the plain modal next to it, it starts again at zero.
 */
export const KeepMounted: Story = {
  name: "Keep mounted",
  render: () => {
    const [which, setWhich] = useState<"kept" | "fresh" | null>(null);
    const handleClose = useCallback(() => setWhich(null), []);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setWhich("kept")}>
          Kept mounted
        </Button>
        <Button size="small" variant="secondary" onClick={() => setWhich("fresh")}>
          Remounted
        </Button>
        <Modal open={which === "kept"} onClose={handleClose} keepMounted>
          <div style={centred}>
            <div style={paper}>
              <Counter label="Kept mounted" />
              <Button size="small" variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
        <Modal open={which === "fresh"} onClose={handleClose}>
          <div style={centred}>
            <div style={paper}>
              <Counter label="Remounted" />
              <Button size="small" variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
        <p style={caption}>Count up, close, reopen: only the kept one remembers.</p>
      </div>
    );
  },
};

function Counter({ label }: { label: string }) {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: "grid", gap: "10px", justifyItems: "start" }}>
      <p style={{ margin: 0 }}>
        {label}: {count}
      </p>
      <Button size="small" variant="ghost" onClick={() => setCount((value) => value + 1)}>
        Count up
      </Button>
    </div>
  );
}
