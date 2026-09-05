import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ButtonGroup, type ButtonGroupColor } from "./ButtonGroup";

/**
 * A split button: one main action plus a chevron menu of variants of that
 * same action. For a row of independent toggle buttons (view filters,
 * Day/Week/Month, and the like), use `SegmentedToggle` instead — that's the
 * dedicated selection control.
 */
const meta: Meta<typeof ButtonGroup> = {
  title: "Control/ButtonGroup",
  component: ButtonGroup,
  args: {
    action: { label: "Save" },
    menu: [{ label: "Save as…" }, { label: "Save & publish" }],
    variant: "primary",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    action: { control: false },
    menu: { control: false },
  },
  render: (args) => <ButtonGroup {...args} />,
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

/**
 * A split button is one action, not two. The left segment fires the default
 * variant immediately on click; the chevron only reveals *other variants of
 * that same action* — never unrelated commands. If the menu repeated the
 * main label verbatim, that would be a smell: it'd mean the menu item is
 * redundant, not an alternative. Here `Save` stays the one-click default and
 * the menu holds only the two things you'd otherwise need a second control for.
 */
export const Primary: Story = {};

/**
 * This example shows dante.
 */
export const Dante: Story = {
  args: {
    color: "dante",
    action: { label: "Boost" },
    menu: [{ label: "Boost now" }, { label: "Schedule boost" }],
  },
};

/**
 * This example shows secondary (outlined).
 */
export const Secondary: Story = {
  args: {
    variant: "secondary",
    action: { label: "Export" },
    menu: [{ label: "Export as CSV" }, { label: "Export as PDF" }],
  },
};

/**
 * Git client pattern: the left segment commits with your last-used option;
 * the chevron swaps in `Commit & push` or `Amend last commit` without
 * touching the default for next time. Clicking the main segment vs. picking
 * a menu item both funnel into the same handler so the log below shows
 * exactly one action fired, whichever way you triggered it.
 */
export const CommitAndPush: Story = {
  render: () => {
    const [log, setLog] = useState<string[]>([]);
    const run = (action: string) => () =>
      setLog((entries) =>
        [`${new Date().toLocaleTimeString()} — ${action}`, ...entries].slice(0, 4),
      );
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}
      >
        <ButtonGroup
          action={{ label: "Commit", onClick: run("Commit") }}
          menu={[
            { label: "Commit & push", onClick: run("Commit & push") },
            { label: "Amend last commit", onClick: run("Amend last commit") },
          ]}
        />
        <ul
          style={{
            margin: 0,
            paddingLeft: "16px",
            color: "#a9a9b2",
            fontSize: "13px",
            fontFamily: "var(--okkly-font-family-mono, monospace)",
          }}
        >
          {log.length === 0 && <li>No action yet — click the button or open the menu.</li>}
          {log.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </div>
    );
  },
};

/**
 * Email-client pattern: `Send` is the one-click default, the chevron offers
 * `Send later` and `Save as draft` as variants of the same compose action —
 * not a shortcut to unrelated screens. Each option is wired to its own
 * handler so you can see the main segment and the menu both resolve to a
 * single, real outcome.
 */
export const SendEmail: Story = {
  render: () => {
    const [status, setStatus] = useState<string | null>(null);
    const send = (outcome: string) => () => setStatus(outcome);
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}
      >
        <ButtonGroup
          color="indigo"
          action={{ label: "Send", onClick: send("Sent now") }}
          menu={[
            { label: "Send later…", onClick: send("Scheduled to send later") },
            { label: "Save as draft", onClick: send("Saved as draft") },
          ]}
        />
        <p
          style={{
            margin: 0,
            color: "#a9a9b2",
            fontSize: "13px",
            fontFamily: "var(--okkly-font-family-mono, monospace)",
          }}
        >
          {status ?? "Nothing sent yet."}
        </p>
      </div>
    );
  },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}
    >
      {(
        [
          "primary",
          "dante",
          "indigo",
          "violet",
          "ember",
          "ice",
        ] as const satisfies readonly ButtonGroupColor[]
      ).map((color) => (
        <ButtonGroup
          key={color}
          color={color}
          action={{ label: color[0].toUpperCase() + color.slice(1) }}
          menu={[{ label: "Option A" }, { label: "Option B" }]}
        />
      ))}
    </div>
  ),
};
