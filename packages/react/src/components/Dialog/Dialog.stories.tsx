import { useCallback, useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { TextField } from "../TextField/TextField";
import { Dialog, DialogActions, DialogClose, DialogContent, DialogTitle } from "./Dialog";

/**
 * A centred panel that interrupts. Use it when the page cannot usefully continue
 * until the user answers — a destructive action to confirm, a short form to
 * complete, a choice with consequences. Anything the user can ignore belongs in a
 * `Snackbar` or an inline `Alert`; anything anchored to a control belongs in a
 * `Popover`.
 *
 * Built on `Modal`, which owns the portal, backdrop, focus trap, scroll lock and
 * focus restoration. Dialog adds the centring and the sized paper, and ships
 * `DialogTitle` / `DialogContent` / `DialogActions` / `DialogClose` for the parts.
 *
 * `onClose` receives `(event, reason)` — `"backdropClick"`, `"escapeKeyDown"` — so
 * a stray click beside the panel can be told apart from a deliberate dismissal.
 * That distinction matters for a form: losing typed input to a misplaced click is
 * the classic version of this bug.
 *
 * Props follow MUI's Dialog name-for-name (`fullWidth`, `maxWidth`, `fullScreen`,
 * plus the Modal pass-throughs). Deliberate gaps: no `sx`/`classes`, no
 * `TransitionComponent`, and a simple focus trap.
 */
const meta: Meta<typeof Dialog> = {
  title: "Overlays/Dialog",
  component: Dialog,
  args: {
    maxWidth: "sm",
    fullWidth: false,
    fullScreen: false,
  },
  argTypes: {
    maxWidth: { control: "select", options: ["xs", "sm", "md", "lg", "xl", false] },
    fullWidth: { control: "boolean" },
    fullScreen: { control: "boolean" },
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
          Open the dialog
        </Button>
        <Dialog {...args} open={open} onClose={handleClose}>
          <DialogTitle>Publish these changes?</DialogTitle>
          <DialogContent>They become visible to everyone with the link.</DialogContent>
          <DialogActions>
            <Button size="small" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="small" onClick={handleClose}>
              Publish
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

const surface: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "10px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
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
 * The archetype: something irreversible, named plainly, with the destructive action
 * on the right and an escape on the left.
 *
 * Two details worth copying. The title says what will happen rather than "Are you
 * sure?", and the confirming button repeats the verb — a user who reads only the
 * buttons still knows which one deletes.
 */
export const ConfirmingADeletion: Story = {
  name: "Confirming a deletion",
  render: () => {
    const [open, setOpen] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" color="ember" onClick={() => setOpen(true)}>
          Delete the project
        </Button>
        <Dialog open={open} onClose={handleClose} maxWidth="xs">
          <DialogTitle>Delete “Night drive”?</DialogTitle>
          <DialogContent>
            The project, its releases and its analytics go with it. This cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button size="small" variant="ghost" onClick={handleClose}>
              Keep it
            </Button>
            <Button
              size="small"
              color="ember"
              onClick={() => {
                setDeleted(true);
                handleClose();
              }}
            >
              Delete it
            </Button>
          </DialogActions>
        </Dialog>
        {deleted && <p style={caption}>Deleted. (Nothing actually happened.)</p>}
      </div>
    );
  },
};

/**
 * `onClose` tells you *why* it is closing, which is what lets a form protect typed
 * input. Here a backdrop click is ignored once the field has something in it, while
 * Escape and Cancel still work — a misplaced click should not cost the user their
 * work, but it should not lock them in either.
 *
 * Reasons: `"backdropClick"` and `"escapeKeyDown"`. A click on your own close
 * button is your handler, so it arrives however you call it.
 */
export const AForm: Story = {
  name: "A form",
  render: () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [lastReason, setLastReason] = useState<string | null>(null);
    return (
      <div style={surface}>
        <Button size="small" onClick={() => setOpen(true)}>
          New release
        </Button>
        <Dialog
          open={open}
          fullWidth
          maxWidth="sm"
          onClose={(_event, reason) => {
            setLastReason(reason);
            // A stray click beside the panel is not a decision to discard a
            // half-typed form. Escape is — it takes deliberation to press.
            if (reason === "backdropClick" && name.length > 0) return;
            setOpen(false);
          }}
        >
          <DialogTitle>New release</DialogTitle>
          <DialogContent>
            <TextField
              label="Title"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Night drive vol. 2"
            />
          </DialogContent>
          <DialogActions>
            <Button size="small" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="small" onClick={() => setOpen(false)} disabled={name.length === 0}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
        <p style={caption}>
          Type something, then click the backdrop: nothing happens. Last reason: {lastReason ?? "—"}
        </p>
      </div>
    );
  },
};

/**
 * `DialogClose` is the corner ✕. Add it when the dialog is something to read rather
 * than answer — where a pair of buttons would imply a decision that is not being
 * asked for.
 *
 * Do not add it *and* a Cancel button: two controls that do the same thing make the
 * user work out whether they really do.
 */
export const WithACloseButton: Story = {
  name: "With a close button",
  render: () => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          What is a token?
        </Button>
        <Dialog open={open} onClose={handleClose} maxWidth="sm">
          <DialogClose onClick={handleClose} />
          <DialogTitle>What is a token?</DialogTitle>
          <DialogContent>
            A named value — a colour, a radius, a duration — that components read instead of
            hard-coding it. Every one of them is a CSS variable on the root, which is why a theme
            can change the whole library without a single re-render.
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};

/**
 * `maxWidth` caps the paper; the paper is still only as wide as its content unless
 * `fullWidth` makes it take the cap. The two are meant to be used together — on its
 * own, `maxWidth` on a short dialog does nothing visible.
 */
export const Widths: Story = {
  render: () => {
    const [width, setWidth] = useState<"xs" | "sm" | "md" | "lg" | "xl" | false | null>(null);
    const handleClose = useCallback(() => setWidth(null), []);
    const options = ["xs", "sm", "md", "lg", "xl"] as const;
    return (
      <div style={surface}>
        {options.map((option) => (
          <Button key={option} size="small" variant="secondary" onClick={() => setWidth(option)}>
            {option}
          </Button>
        ))}
        <Button size="small" variant="ghost" onClick={() => setWidth(false)}>
          false (uncapped)
        </Button>
        <Dialog open={width !== null} onClose={handleClose} fullWidth maxWidth={width ?? false}>
          <DialogTitle>maxWidth = {String(width)}</DialogTitle>
          <DialogContent>
            With `fullWidth` the paper takes the whole cap. Without it, it would shrink to this
            paragraph.
          </DialogContent>
          <DialogActions>
            <Button size="small" onClick={handleClose}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  },
};

/**
 * `fullScreen` drops the centring and the radius and takes the whole viewport. It is
 * for narrow screens, where a centred panel with margins wastes the space it needs —
 * switch to it on a media query rather than choosing it outright.
 */
export const FullScreen: Story = {
  name: "Full screen",
  render: () => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Open full screen
        </Button>
        <Dialog open={open} onClose={handleClose} fullScreen>
          <DialogClose onClick={handleClose} />
          <DialogTitle>Edit the release</DialogTitle>
          <DialogContent>
            The paper fills the viewport. On a phone this is usually the right shape; on a desktop
            it is almost never.
          </DialogContent>
          <DialogActions>
            <Button size="small" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="small" onClick={handleClose}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  },
};

/**
 * Long content scrolls inside `DialogContent`, so the title and the actions stay
 * put. That is the reason to use the subcomponents rather than one block of
 * children: the buttons must not scroll out of reach.
 */
export const ScrollingContent: Story = {
  name: "Scrolling content",
  render: () => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Open the terms
        </Button>
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Terms</DialogTitle>
          <DialogContent>
            {Array.from({ length: 14 }, (_, index) => (
              <p key={index} style={{ marginTop: 0 }}>
                {index + 1}. A paragraph of terms nobody reads, present so the content is taller
                than the viewport and the actions below have something to stay put against.
              </p>
            ))}
          </DialogContent>
          <DialogActions>
            <Button size="small" variant="ghost" onClick={handleClose}>
              Decline
            </Button>
            <Button size="small" onClick={handleClose}>
              Accept
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  },
};

/**
 * A dialog the user has to answer. `disableEscapeKeyDown` plus an `onClose` that
 * ignores the backdrop leaves the two buttons as the only way out.
 *
 * Use this sparingly and never without an exit: "Cancel" is an answer. A dialog with
 * one button and no dismissal is a dead end, and the user's only remaining move is
 * to reload the page.
 */
export const MustBeAnswered: Story = {
  name: "Must be answered",
  render: () => {
    const [open, setOpen] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Leave with unsaved changes
        </Button>
        <Dialog
          open={open}
          disableEscapeKeyDown
          onClose={(_event, reason) => {
            if (reason === "backdropClick") return;
            setOpen(false);
          }}
          maxWidth="xs"
        >
          <DialogTitle>You have unsaved changes</DialogTitle>
          <DialogContent>Leaving now discards them.</DialogContent>
          <DialogActions>
            <Button
              size="small"
              variant="ghost"
              onClick={() => {
                setAnswer("stayed");
                setOpen(false);
              }}
            >
              Stay
            </Button>
            <Button
              size="small"
              color="ember"
              onClick={() => {
                setAnswer("discarded");
                setOpen(false);
              }}
            >
              Discard
            </Button>
          </DialogActions>
        </Dialog>
        <p style={caption}>Escape and the backdrop do nothing. Answer: {answer ?? "—"}</p>
      </div>
    );
  },
};
