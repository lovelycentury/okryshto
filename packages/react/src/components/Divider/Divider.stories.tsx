import { Fragment, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Divider } from "./Divider";

/**
 * Hairline separator for lists, stacks and toolbars. Optional label sits on the
 * rule and can be aligned left, center or right.
 */
const meta: Meta<typeof Divider> = {
  title: "Data/Divider",
  component: Divider,
  args: {
    orientation: "horizontal",
    variant: "fullWidth",
    flexItem: false,
    textAlign: "center",
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    variant: { control: "inline-radio", options: ["fullWidth", "inset", "middle"] },
    textAlign: { control: "inline-radio", options: ["left", "center", "right"] },
    children: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "360px", color: "var(--okkly-text-primary)" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Divider>;

const surface: CSSProperties = {
  background: "var(--okkly-bg-surface-raised)",
  border: "1px solid var(--okkly-border-subtle)",
  borderRadius: "12px",
  padding: "16px",
  fontFamily: "var(--okkly-font-family-sans)",
};

const row: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 0",
  fontSize: "var(--okkly-font-size-sm)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {
  args: { children: "" },
  render: (args) => (
    <div style={{ ...surface, display: "flex", minHeight: "72px" }}>
      <Divider {...args} />
    </div>
  ),
};

/**
 * A settings card: the rule separates rows without adding visual weight.
 */
export const SeparatedRows: Story = {
  render: () => (
    <div style={surface}>
      <div style={row}>
        <span>Email notifications</span>
        <span style={{ color: "var(--okkly-text-secondary)" }}>On</span>
      </div>
      <Divider />
      <div style={row}>
        <span>Weekly digest</span>
        <span style={{ color: "var(--okkly-text-secondary)" }}>Monday</span>
      </div>
      <Divider />
      <div style={row}>
        <span>Product updates</span>
        <span style={{ color: "var(--okkly-text-secondary)" }}>Off</span>
      </div>
    </div>
  ),
};

/**
 * The classic sign-in split: a labelled divider between primary and social auth.
 */
export const WithLabel: Story = {
  render: () => (
    <div style={{ ...surface, display: "flex", flexDirection: "column", gap: "14px" }}>
      <Button fullWidth>Continue with email</Button>
      <Divider>or</Divider>
      <Button fullWidth variant="secondary">
        Continue with GitHub
      </Button>
      <Button fullWidth variant="ghost">
        Continue with Google
      </Button>
    </div>
  ),
};

/**
 * Vertical dividers split a toolbar into groups of related actions.
 */
export const Vertical: Story = {
  render: () => (
    <div
      style={{
        ...surface,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 14px",
        width: "fit-content",
      }}
    >
      <Button size="small" variant="ghost">
        Bold
      </Button>
      <Button size="small" variant="ghost">
        Italic
      </Button>
      <Divider orientation="vertical" flexItem />
      <Button size="small" variant="ghost">
        Link
      </Button>
      <Button size="small" variant="ghost">
        Code
      </Button>
      <Divider orientation="vertical" flexItem />
      <Button size="small" variant="ghost">
        Undo
      </Button>
    </div>
  ),
};

/**
 * A stats strip — `flexItem` stretches each rule to the tallest cell.
 */
export const VerticalStats: Story = {
  name: "Vertical (stats strip)",
  render: () => (
    <div style={{ ...surface, display: "flex", alignItems: "stretch", gap: "20px" }}>
      {[
        ["Deploys", "128"],
        ["Failures", "3"],
        ["Uptime", "99.9%"],
      ].map(([label, value], index, all) => (
        <Fragment key={label}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--okkly-font-size-lg)" }}>{value}</div>
            <div
              style={{
                fontSize: "var(--okkly-font-size-sm)",
                color: "var(--okkly-text-secondary)",
              }}
            >
              {label}
            </div>
          </div>
          {index < all.length - 1 && <Divider orientation="vertical" flexItem />}
        </Fragment>
      ))}
    </div>
  ),
};

/**
 * `inset` skips the leading gutter so the rule starts where the text does —
 * here the 4.5rem default is retuned to the 54px avatar column. `middle`
 * insets both ends instead, and `fullWidth` (default) spans everything.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ ...surface, padding: "8px 16px" }}>
      {[
        ["AK", "Oleksii", "Pushed 3 commits"],
        ["MB", "Maria", "Opened a merge request"],
        ["TS", "Tomas", "Left a review"],
      ].map(([initials, name, detail], index) => (
        <div key={name}>
          {index > 0 && (
            <Divider variant="inset" style={{ "--okkly-divider-inset": "54px" } as CSSProperties} />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0" }}>
            <span
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "var(--okkly-glass-fill)",
                fontSize: "var(--okkly-font-size-sm)",
              }}
            >
              {initials}
            </span>
            <div style={{ fontSize: "var(--okkly-font-size-sm)" }}>
              <div>{name}</div>
              <div style={{ color: "var(--okkly-text-secondary)" }}>{detail}</div>
            </div>
          </div>
        </div>
      ))}
      <Divider variant="middle" />
      <div
        style={{
          padding: "12px 0",
          fontSize: "var(--okkly-font-size-sm)",
          color: "var(--okkly-text-secondary)",
        }}
      >
        The rule above closes the list with variant=&quot;middle&quot;.
      </div>
    </div>
  ),
};

/**
 * Labels double as lightweight section headings inside a long form.
 */
export const TextAlign: Story = {
  render: () => (
    <div style={{ ...surface, display: "flex", flexDirection: "column", gap: "18px" }}>
      <Divider textAlign="left">Account</Divider>
      <span
        style={{
          fontSize: "var(--okkly-font-size-sm)",
          color: "var(--okkly-text-secondary)",
        }}
      >
        Name, email, password
      </span>
      <Divider textAlign="center">Workspace</Divider>
      <span
        style={{
          fontSize: "var(--okkly-font-size-sm)",
          color: "var(--okkly-text-secondary)",
        }}
      >
        Members, roles, billing
      </span>
      <Divider textAlign="right">Danger zone</Divider>
      <span
        style={{
          fontSize: "var(--okkly-font-size-sm)",
          color: "var(--okkly-text-secondary)",
        }}
      >
        Transfer or delete this workspace
      </span>
    </div>
  ),
};

/**
 * The CSS-variable API. The component seeds its own defaults, so set the
 * variables on the divider itself (inline or in your own rule) rather than on
 * a parent.
 */
export const CustomStyling: Story = {
  render: () => (
    <div style={{ ...surface, display: "flex", flexDirection: "column", gap: "22px" }}>
      <Divider
        style={{ "--okkly-divider-color": "var(--okkly-accent-primary)" } as CSSProperties}
      />
      <Divider
        style={
          {
            "--okkly-divider-color": "var(--okkly-accent-ember)",
            "--okkly-divider-thickness": "2px",
          } as CSSProperties
        }
      />
      <Divider
        style={
          {
            "--okkly-divider-color": "var(--okkly-accent-ice)",
            "--okkly-divider-label-color": "var(--okkly-accent-ice)",
            "--okkly-divider-label-gap": "2rem",
          } as CSSProperties
        }
      >
        wide gap
      </Divider>
      <Divider
        style={
          {
            "--okkly-divider-color": "var(--okkly-border-default)",
            "--okkly-divider-label-font-size": "var(--okkly-font-size-lg)",
            "--okkly-divider-label-line-height": "var(--okkly-font-line-height-lg)",
          } as CSSProperties
        }
      >
        Bigger label
      </Divider>
    </div>
  ),
};
