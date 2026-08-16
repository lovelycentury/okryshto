import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Spinner, type SpinnerColor } from "./Spinner";

/**
 * An indeterminate loading ring for waits too short or too unpredictable to
 * measure. When you can compute a percentage, reach for `Progress` instead — and
 * when the shape of the incoming content is known, `Skeleton` beats both, because
 * it doesn't move the layout when the data lands.
 *
 * The ring is a `role="status"` region labelled “Loading”. Override `aria-label`
 * to say what is loading; if the spinner sits inside a button that already says
 * so, hide it with `aria-hidden` rather than announcing twice.
 */
const meta: Meta<typeof Spinner> = {
  title: "Feedback/Spinner",
  component: Spinner,
  args: {
    size: "medium",
    color: "primary",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: {
      control: "select",
      options: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ],
    },
    thickness: { control: { type: "range", min: 1, max: 8, step: 0.5 } },
  },
  render: (args) => (
    <div style={surface}>
      <Spinner {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Spinner>;

const surface: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

const caption: CSSProperties = {
  fontSize: "var(--okryshto-font-size-sm)",
  color: "var(--okryshto-text-secondary)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The three presets. `small` is sized to sit inside a button or a table cell,
 * `large` to hold the centre of an empty panel.
 */
export const Sizes: Story = {
  render: () => (
    <div style={surface}>
      {(["small", "medium", "large"] as const).map((size) => (
        <div key={size} style={{ display: "grid", justifyItems: "center", gap: "10px" }}>
          <Spinner size={size} />
          <span style={caption}>{size}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * A panel waiting on its first response: the spinner is centred, labelled, and
 * paired with a line of copy so the wait has an explanation.
 */
export const LoadingPanel: Story = {
  name: "Loading a panel",
  render: () => (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        gap: "14px",
        width: "420px",
        height: "220px",
        borderRadius: "14px",
        border: "1px solid var(--okryshto-border-subtle)",
        background: "var(--okryshto-bg-surface)",
        fontFamily: "var(--okryshto-font-family-sans)",
      }}
    >
      <Spinner size="large" aria-label="Loading your projects" />
      <span style={caption}>Loading your projects…</span>
    </div>
  ),
};

/**
 * Inside a control, the surrounding text is already the label — so the ring is
 * marked `aria-hidden` to keep it from being announced a second time.
 */
export const InlineWithText: Story = {
  name: "Inline with text",
  render: () => (
    <div style={{ ...surface, flexDirection: "column", alignItems: "flex-start", gap: "16px" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "10px", ...caption }}>
        <Spinner size="small" aria-hidden="true" />
        Checking availability…
      </span>
      <Button variant="soft" aria-busy="true">
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <Spinner size="small" color="primary" aria-hidden="true" />
          Publishing
        </span>
      </Button>
    </div>
  ),
};

/**
 * `thickness` overrides the preset stroke — thinner for a delicate inline ring,
 * heavier when the spinner has to carry a whole empty panel.
 */
export const Thickness: Story = {
  render: () => (
    <div style={surface}>
      {[1.5, 3, 5].map((thickness) => (
        <div key={thickness} style={{ display: "grid", justifyItems: "center", gap: "10px" }}>
          <Spinner size="large" thickness={thickness} />
          <span style={caption}>{thickness}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * Every tone. The track is a tint of the same colour, so a spinner reads on any
 * background you put it on.
 */
export const Colors: Story = {
  render: () => {
    const colors: SpinnerColor[] = [
      "primary",
      "dante",
      "indigo",
      "violet",
      "ember",
      "ice",
      "success",
      "warning",
      "danger",
    ];
    return (
      <div style={{ ...surface, flexWrap: "wrap", gap: "20px" }}>
        {colors.map((color) => (
          <div key={color} style={{ display: "grid", justifyItems: "center", gap: "8px" }}>
            <Spinner color={color} />
            <span style={caption}>{color}</span>
          </div>
        ))}
      </div>
    );
  },
};
