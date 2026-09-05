import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { iconTrash, iconUpload } from "@okkly/icons";
import { SeverityIcon, type SeverityIconSeverity } from "./SeverityIcon";

/**
 * A tinted chip holding a status glyph. `Alert`, `Snackbar`, and `EmptyState`
 * build on it, and it stands on its own wherever a row or a dialog needs one
 * symbol to carry the outcome.
 *
 * Colour is the only thing it says, and colour alone says nothing to a screen
 * reader — so an icon without a `label` is treated as decoration and hidden.
 * Pass `label` only when the surrounding text doesn't already carry the meaning.
 */
const meta: Meta<typeof SeverityIcon> = {
  title: "Feedback/SeverityIcon",
  component: SeverityIcon,
  args: {
    severity: "info",
    size: "medium",
    shape: "circle",
  },
  argTypes: {
    severity: {
      control: "select",
      options: ["success", "info", "warning", "danger", "primary", "neutral"],
    },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    shape: { control: "inline-radio", options: ["circle", "rounded"] },
    icon: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <SeverityIcon {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof SeverityIcon>;

const surface: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const caption: CSSProperties = {
  fontSize: "var(--okkly-font-size-sm)",
  color: "var(--okkly-text-secondary)",
};

const Glyph = ({ svg }: { svg: string }) => <span dangerouslySetInnerHTML={{ __html: svg }} />;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The six tones and the glyph each one defaults to. `info` is the informational
 * indigo used by `Alert`; `primary` is the same shape in the brand mint, for
 * chips that aren't reporting a status at all.
 */
export const Severities: Story = {
  render: () => {
    const severities: SeverityIconSeverity[] = [
      "success",
      "info",
      "warning",
      "danger",
      "primary",
      "neutral",
    ];
    return (
      <div style={{ ...surface, flexWrap: "wrap", gap: "24px" }}>
        {severities.map((severity) => (
          <div key={severity} style={{ display: "grid", justifyItems: "center", gap: "10px" }}>
            <SeverityIcon severity={severity} />
            <span style={caption}>{severity}</span>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * A deploy log: the icon is the whole status column, so it carries a `label` and
 * is announced alongside the row it belongs to.
 */
export const InAList: Story = {
  name: "In a list",
  render: () => (
    <div
      style={{
        width: "460px",
        padding: "8px",
        borderRadius: "14px",
        border: "1px solid var(--okkly-border-subtle)",
        background: "var(--okkly-bg-surface)",
        fontFamily: "var(--okkly-font-family-sans)",
      }}
    >
      {[
        {
          severity: "success" as SeverityIconSeverity,
          label: "Succeeded",
          title: "main → production",
          meta: "2 min ago · 41s",
        },
        {
          severity: "danger" as SeverityIconSeverity,
          label: "Failed",
          title: "feat/animated-background",
          meta: "18 min ago · 12s",
        },
        {
          severity: "warning" as SeverityIconSeverity,
          label: "Succeeded with warnings",
          title: "chore/deps",
          meta: "1 h ago · 1m 04s",
        },
        {
          severity: "neutral" as SeverityIconSeverity,
          label: "Queued",
          title: "docs/storybook",
          meta: "waiting for a runner",
        },
      ].map((row) => (
        <div
          key={row.title}
          style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px" }}
        >
          <SeverityIcon severity={row.severity} size="small" label={row.label} />
          <div style={{ display: "grid", gap: "2px" }}>
            <span style={{ fontSize: "var(--okkly-font-size-sm)" }}>{row.title}</span>
            <span
              style={{
                fontSize: "var(--okkly-font-size-sm)",
                color: "var(--okkly-text-muted)",
              }}
            >
              {row.meta}
            </span>
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * The confirmation dialog pattern: a large chip at the top sets the temperature
 * of the question before the user reads a word of it.
 */
export const InADialog: Story = {
  name: "In a dialog",
  render: () => (
    <div
      style={{
        display: "grid",
        justifyItems: "center",
        gap: "12px",
        width: "360px",
        padding: "26px 24px",
        borderRadius: "16px",
        border: "1px solid var(--okkly-border-subtle)",
        background: "var(--okkly-bg-surface)",
        textAlign: "center",
        fontFamily: "var(--okkly-font-family-sans)",
      }}
    >
      <SeverityIcon severity="danger" size="large" icon={<Glyph svg={iconTrash} />} />
      <strong style={{ fontSize: "var(--okkly-font-size-lg)" }}>Delete this project?</strong>
      <p style={{ margin: 0, ...caption }}>
        Night drive vol. 2 and its 12 tracks will be removed. This can't be undone.
      </p>
    </div>
  ),
};

/**
 * `size` scales the chip and its glyph together, and `shape` switches between the
 * circle used for status and the rounded square used for object icons.
 */
export const SizesAndShapes: Story = {
  name: "Sizes and shapes",
  render: () => (
    <div style={{ ...surface, gap: "32px" }}>
      <div style={{ ...surface, gap: "14px" }}>
        {(["small", "medium", "large"] as const).map((size) => (
          <SeverityIcon key={size} severity="success" size={size} />
        ))}
      </div>
      <div style={{ ...surface, gap: "14px" }}>
        {(["small", "medium", "large"] as const).map((size) => (
          <SeverityIcon key={size} severity="info" size={size} shape="rounded" />
        ))}
      </div>
    </div>
  ),
};

/**
 * `icon` replaces the default glyph while keeping the tint — how the dialog above
 * gets a bin instead of a cross.
 */
export const CustomIcon: Story = {
  name: "Custom icon",
  render: () => (
    <div style={surface}>
      <SeverityIcon severity="primary" icon={<Glyph svg={iconUpload} />} />
      <SeverityIcon severity="danger" icon={<Glyph svg={iconTrash} />} />
      <SeverityIcon severity="neutral" shape="rounded" icon={<Glyph svg={iconUpload} />} />
    </div>
  ),
};
