import { useCallback, useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Alert } from "../Alert/Alert";
import { Snackbar, type SnackbarAnchorOrigin } from "./Snackbar";

/**
 * A brief message that floats over the page and takes itself away. Use it to
 * confirm something that already happened — saved, archived, copied. Anything the
 * user must read before continuing belongs in a `Dialog`; anything that stays
 * relevant belongs in an inline `Alert`.
 *
 * The component is controlled: `open` is yours, and `onClose` fires on the timer,
 * on Escape, and on the dismiss button — not on a click elsewhere, since the user
 * is meant to keep working while it is up. Give it a `useCallback` handler: an
 * inline arrow is a new function every render, which restarts the auto-hide timer.
 *
 * One snackbar at a time. This build has no queue, so opening a second while the
 * first is up stacks them on top of each other; drive them from a single piece of
 * state as these stories do.
 */
const meta: Meta<typeof Snackbar> = {
  title: "Feedback/Snackbar",
  component: Snackbar,
  args: {
    message: "Changes saved",
    severity: "success",
    autoHideDuration: 4000,
  },
  argTypes: {
    severity: { control: "select", options: ["success", "info", "warning", "danger", "dante"] },
    open: { control: false },
    onClose: { control: false },
    action: { control: false },
    children: { control: false },
    anchorOrigin: { control: false },
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" onClick={() => setOpen(true)}>
          Show the snackbar
        </Button>
        <Snackbar {...args} open={open} onClose={handleClose} />
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Snackbar>;

const surface: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "10px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The archetype: a destructive action confirmed, with the way back attached.
 * Keep `autoHideDuration` generous when there is an `action` — the offer is
 * worthless if it disappears before it is read.
 */
export const UndoAnAction: Story = {
  name: "Undo an action",
  render: () => {
    const [open, setOpen] = useState(false);
    const [archived, setArchived] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button
          size="small"
          variant="soft"
          onClick={() => {
            setArchived(true);
            setOpen(true);
          }}
        >
          Archive project
        </Button>
        <span
          style={{
            fontSize: "var(--okkly-font-size-sm)",
            color: "var(--okkly-text-secondary)",
          }}
        >
          {archived ? "Project archived." : "Project is active."}
        </span>
        <Snackbar
          open={open}
          onClose={handleClose}
          severity="info"
          message="Project archived"
          autoHideDuration={8000}
          action={
            <Button
              size="small"
              variant="ghost"
              onClick={() => {
                setArchived(false);
                setOpen(false);
              }}
            >
              Undo
            </Button>
          }
        />
      </div>
    );
  },
};

/**
 * Each `severity` maps onto the matching `Alert`, so a snackbar and an inline
 * banner reporting the same thing look like the same thing.
 */
export const Severities: Story = {
  render: () => {
    const [severity, setSeverity] = useState<
      "success" | "info" | "warning" | "danger" | "dante" | null
    >(null);
    const handleClose = useCallback(() => setSeverity(null), []);
    return (
      <div style={surface}>
        {(["success", "info", "warning", "danger", "dante"] as const).map((tone) => (
          <Button key={tone} size="small" variant="soft" onClick={() => setSeverity(tone)}>
            {tone}
          </Button>
        ))}
        <Snackbar
          open={severity !== null}
          onClose={handleClose}
          severity={severity ?? "info"}
          message={`This is a ${severity ?? "info"} message`}
        />
      </div>
    );
  },
};

/**
 * `anchorOrigin` puts the snackbar in any of the six edge positions. Bottom-centre
 * is the default and the safest — top positions collide with app bars, and
 * bottom-right collides with chat launchers.
 */
export const Placement: Story = {
  render: () => {
    const [anchor, setAnchor] = useState<SnackbarAnchorOrigin | null>(null);
    const handleClose = useCallback(() => setAnchor(null), []);
    const positions: SnackbarAnchorOrigin[] = [
      { vertical: "top", horizontal: "left" },
      { vertical: "top", horizontal: "center" },
      { vertical: "top", horizontal: "right" },
      { vertical: "bottom", horizontal: "left" },
      { vertical: "bottom", horizontal: "center" },
      { vertical: "bottom", horizontal: "right" },
    ];
    return (
      <div style={{ ...surface, maxWidth: "420px" }}>
        {positions.map((position) => (
          <Button
            key={`${position.vertical}-${position.horizontal}`}
            size="small"
            variant="soft"
            onClick={() => setAnchor(position)}
          >
            {position.vertical}/{position.horizontal}
          </Button>
        ))}
        <Snackbar
          open={anchor !== null}
          onClose={handleClose}
          anchorOrigin={anchor ?? { vertical: "bottom", horizontal: "center" }}
          message={anchor ? `${anchor.vertical} / ${anchor.horizontal}` : ""}
        />
      </div>
    );
  },
};

/**
 * `autoHideDuration={0}` parks the snackbar until something dismisses it — for a
 * message the user has to acknowledge, like a failed background job.
 */
export const Persistent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" variant="soft" onClick={() => setOpen(true)}>
          Trigger a failure
        </Button>
        <Snackbar
          open={open}
          onClose={handleClose}
          autoHideDuration={0}
          severity="danger"
          message="Sync failed — we'll retry when you're back online"
        />
      </div>
    );
  },
};

/**
 * Pass a node instead of a string to take over the surface completely. Here a
 * full `Alert` with a title and its own action replaces the default one-liner.
 */
export const CustomContent: Story = {
  name: "Custom content",
  render: () => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" variant="soft" onClick={() => setOpen(true)}>
          Show the release note
        </Button>
        <Snackbar open={open} onClose={handleClose} autoHideDuration={0}>
          <Alert
            severity="dante"
            variant="filled"
            title="Version 2.4 is live"
            onClose={handleClose}
            action={
              <Button size="small" variant="ghost">
                Read the notes
              </Button>
            }
          >
            Cascade layers, a new Snackbar, and 40 fixes.
          </Alert>
        </Snackbar>
      </div>
    );
  },
};
