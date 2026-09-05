import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { iconActivity, iconSettings, iconUsers } from "@okkly/icons";
import { Tabs, type TabsColor } from "./Tabs";

const icon = (svg: string) => <span dangerouslySetInnerHTML={{ __html: svg }} />;

/**
 * Switch between peer views inside one panel. Keep labels short, never nest
 * tabs in tabs, and render the panel yourself — `Tabs` owns the tab strip only.
 *
 * Keyboard follows the WAI-ARIA tabs pattern: only the selected tab is
 * tabbable, arrows move (and activate) the selection, Home/End jump to the
 * ends.
 */
const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
  args: {
    items: [
      { label: "Overview", value: "overview" },
      { label: "Activity", value: "activity", icon: icon(iconActivity) },
      { label: "Members", value: "members", icon: icon(iconUsers) },
    ],
    defaultValue: "overview",
    color: "primary",
    variant: "standard",
    orientation: "horizontal",
  },
  argTypes: {
    items: { control: false },
    value: { control: false },
    onChange: { control: false },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    variant: { control: "inline-radio", options: ["standard", "scrollable"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const surface: CSSProperties = {
  background: "var(--okkly-bg-surface-raised)",
  border: "1px solid var(--okkly-border-subtle)",
  borderRadius: "12px",
  padding: "8px 16px 16px",
  width: "520px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const panel: CSSProperties = {
  paddingTop: "16px",
  fontSize: "var(--okkly-font-size-sm)",
  color: "var(--okkly-text-secondary)",
  lineHeight: "var(--okkly-font-line-height-md)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {
  render: (args) => (
    <div style={surface}>
      <Tabs {...args} />
    </div>
  ),
};

/**
 * The real job: a tab strip wired to the panel it switches. `Tabs` keeps its own
 * state when uncontrolled — `onChange` is still called, so the panel can follow.
 */
export const WithPanel: Story = {
  render: () => {
    const [tab, setTab] = useState("overview");
    const panels: Record<string, string> = {
      overview: "Project “Orbit” — 12 open issues, 3 merge requests waiting on review.",
      activity: "Maria pushed 4 commits · Tomas opened !238 · CI passed on main 20 minutes ago.",
      members: "6 people have access: 2 owners, 3 developers, 1 guest.",
    };
    return (
      <div style={surface}>
        <Tabs
          items={[
            { label: "Overview", value: "overview" },
            { label: "Activity", value: "activity", icon: icon(iconActivity) },
            { label: "Members", value: "members", icon: icon(iconUsers) },
          ]}
          value={tab}
          onChange={(_event, value) => setTab(value)}
        />
        <div
          style={panel}
          role="tabpanel"
          id={`okkly-tabpanel-${tab}`}
          aria-labelledby={`okkly-tab-${tab}`}
        >
          {panels[tab]}
        </div>
      </div>
    );
  },
};

/**
 * A settings sidebar: vertical tabs sit next to the panel instead of above it.
 */
export const Vertical: Story = {
  render: () => {
    const [tab, setTab] = useState("profile");
    const panels: Record<string, string> = {
      profile: "Display name, avatar, and the timezone used for every timestamp.",
      notifications: "Choose which events reach you by email and which stay in-app.",
      security: "Two-factor authentication, active sessions, and personal access tokens.",
    };
    return (
      <div style={{ ...surface, display: "flex", gap: "20px", padding: "16px" }}>
        <Tabs
          orientation="vertical"
          items={[
            { label: "Profile", value: "profile" },
            { label: "Notifications", value: "notifications" },
            { label: "Security", value: "security", icon: icon(iconSettings) },
          ]}
          value={tab}
          onChange={(_event, value) => setTab(value)}
        />
        <div style={{ ...panel, paddingTop: 0, flex: 1 }}>{panels[tab]}</div>
      </div>
    );
  },
};

/**
 * `scrollable` keeps a long strip on one line and lets it overflow sideways
 * instead of wrapping.
 */
export const Scrollable: Story = {
  render: () => (
    <div style={{ ...surface, width: "420px" }}>
      <Tabs
        variant="scrollable"
        defaultValue="all"
        items={[
          { label: "All", value: "all" },
          { label: "Open", value: "open" },
          { label: "In review", value: "review" },
          { label: "Merged", value: "merged" },
          { label: "Closed", value: "closed" },
          { label: "Drafts", value: "drafts" },
          { label: "Archived", value: "archived" },
        ]}
      />
    </div>
  ),
};

/**
 * A tab can be disabled — it stays visible but is skipped by both pointer and
 * arrow keys.
 */
export const DisabledTab: Story = {
  render: () => (
    <div style={surface}>
      <Tabs
        defaultValue="overview"
        items={[
          { label: "Overview", value: "overview" },
          { label: "Activity", value: "activity" },
          { label: "Billing", value: "billing", disabled: true },
        ]}
      />
    </div>
  ),
};

/**
 * Every accent tone the indicator supports.
 */
export const Colors: Story = {
  render: () => {
    const colors: TabsColor[] = ["primary", "dante", "indigo", "violet", "ember", "ice"];
    return (
      <div style={{ ...surface, display: "flex", flexDirection: "column", gap: "4px" }}>
        {colors.map((color) => (
          <Tabs
            key={color}
            color={color}
            defaultValue={color}
            items={[
              { label: color, value: color },
              { label: "Second", value: `${color}-2` },
              { label: "Third", value: `${color}-3` },
            ]}
          />
        ))}
      </div>
    );
  },
};
