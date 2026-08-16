import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Alert, type AlertSeverity } from "./Alert";

/**
 * An inline banner that reports the outcome of something the user just did, or a
 * condition they need to know about before they act. It renders as a live region,
 * so screen readers announce it as soon as it appears — mount it in response to an
 * event rather than leaving it on the page as decoration.
 *
 * Keep the `title` to a few words and the body to one sentence. When the user can
 * do something about it, put that in `action`; when the message is transient, give
 * it `onClose`. For a message that floats over the page instead of sitting in the
 * layout, use `Snackbar`.
 */
const meta: Meta<typeof Alert> = {
  title: "Feedback/Alert",
  component: Alert,
  args: {
    severity: "info",
    variant: "standard",
    title: "Heads up",
    children: "A new version of the design system is available.",
  },
  argTypes: {
    severity: { control: "select", options: ["success", "info", "warning", "danger", "dante"] },
    variant: { control: "inline-radio", options: ["standard", "outlined", "filled"] },
    icon: { control: false },
    action: { control: false },
    onClose: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <Alert {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Alert>;

// Alerts stretch to their container, so the wrapper only caps the line length.
const surface: CSSProperties = {
  display: "grid",
  gap: "12px",
  width: "460px",
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The five tones, each with the message it is meant to carry. `dante` is the
 * brand announcement tone — it reports news, not status.
 */
export const Severities: Story = {
  render: () => {
    const items: Array<{ severity: AlertSeverity; title: string; text: string }> = [
      {
        severity: "info",
        title: "Heads up",
        text: "Version 2.4 is available — the upgrade takes a single command.",
      },
      { severity: "success", title: "Published", text: "Your changes are live on production." },
      {
        severity: "warning",
        title: "Approaching your quota",
        text: "You have used 940 of 1,000 monthly builds.",
      },
      {
        severity: "danger",
        title: "Deploy failed",
        text: "Two type errors in packages/react blocked the build.",
      },
      {
        severity: "dante",
        title: "New drop",
        text: "Night drive vol. 2 just landed in the token library.",
      },
    ];
    return (
      <div style={surface}>
        {items.map((item) => (
          <Alert key={item.severity} severity={item.severity} title={item.title}>
            {item.text}
          </Alert>
        ))}
      </div>
    );
  },
};

/**
 * A form banner: the alert reports why the save failed and offers the way out.
 * `action` sits before the close button, so the recovery is the first control the
 * user reaches.
 */
export const WithAction: Story = {
  name: "With an action",
  render: () => (
    <div style={surface}>
      <Alert
        severity="danger"
        title="Couldn't save the draft"
        action={
          <Button variant="ghost" size="small">
            Retry
          </Button>
        }
      >
        Your connection dropped while uploading. Nothing was lost.
      </Alert>
      <Alert
        severity="success"
        title="Moved to archive"
        action={
          <Button variant="ghost" size="small">
            Undo
          </Button>
        }
      >
        3 projects were archived.
      </Alert>
    </div>
  ),
};

/**
 * Passing `onClose` renders the dismiss button. The alert is yours to unmount —
 * the component only tells you the user asked for it to go.
 */
export const Dismissible: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div style={surface}>
        {open ? (
          <Alert severity="info" title="Storage is filling up" onClose={() => setOpen(false)}>
            You are using 82% of your plan's storage.
          </Alert>
        ) : (
          <Button variant="soft" size="small" onClick={() => setOpen(true)}>
            Show the alert again
          </Button>
        )}
      </div>
    );
  },
};

/**
 * `standard` sits on a tinted surface, `outlined` reduces to a border for dense
 * pages, and `filled` carries the tone at full strength for the one message that
 * must not be missed.
 */
export const Variants: Story = {
  render: () => (
    <div style={surface}>
      <Alert severity="warning" variant="standard" title="Standard">
        Default treatment — a tinted surface that reads at a glance.
      </Alert>
      <Alert severity="warning" variant="outlined" title="Outlined">
        Quieter; use it when several alerts share a page.
      </Alert>
      <Alert severity="warning" variant="filled" title="Filled">
        Loudest; reserve it for a blocking condition.
      </Alert>
    </div>
  ),
};

/**
 * The icon follows `severity` by default. Pass your own node to `icon`, or
 * `icon={false}` to drop it — useful for a title-less one-liner.
 */
export const Icons: Story = {
  render: () => (
    <div style={surface}>
      <Alert severity="success" title="Default icon">
        The glyph is chosen from the severity.
      </Alert>
      <Alert severity="success" title="Custom icon" icon={<span aria-hidden="true">🚀</span>}>
        Any node works — an emoji, an SVG, an avatar.
      </Alert>
      <Alert severity="success" icon={false}>
        No icon and no title: a compact confirmation line.
      </Alert>
    </div>
  ),
};

/**
 * A settings page with the alert in place, showing how it reads next to the
 * content it belongs to rather than on its own.
 */
export const InPage: Story = {
  name: "In a page",
  render: () => (
    <div
      style={{
        ...surface,
        width: "520px",
        gap: "16px",
        padding: "20px",
        borderRadius: "12px",
        background: "var(--okryshto-bg-surface)",
        border: "1px solid var(--okryshto-border-subtle)",
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: "var(--okryshto-font-size-lg)" }}>Billing</h3>
        <p
          style={{
            margin: "4px 0 0",
            color: "var(--okryshto-text-secondary)",
            fontSize: "var(--okryshto-font-size-sm)",
          }}
        >
          Manage your plan and payment method.
        </p>
      </div>
      <Alert
        severity="warning"
        title="Your card expires this month"
        action={
          <Button variant="ghost" size="small">
            Update
          </Button>
        }
      >
        Visa •••• 4242 expires 08/26. Renewals will fail after that.
      </Alert>
      <div style={{ display: "flex", gap: "8px" }}>
        <Button size="small">Change plan</Button>
        <Button variant="ghost" size="small">
          Download invoices
        </Button>
      </div>
    </div>
  ),
};
