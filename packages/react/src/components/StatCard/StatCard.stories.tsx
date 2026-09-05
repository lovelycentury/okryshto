import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { iconActivity, iconCreditCard, iconHeadphones, iconUsers } from "@okkly/icons";
import { StatCard } from "./StatCard";

/**
 * One number, one label, and — when it helps — how that number moved. A dashboard
 * tile, not a chart: if the reader needs the shape of the trend rather than its
 * sign, this is the wrong component.
 *
 * `trend` is a string, not a number, on purpose: "12.5%", "+3 this week", and
 * "2× " are all things a delta badge has to be able to say. `up` picks the colour
 * and the arrow, and is also what the badge announces — a screen reader hears
 * "Up 12.5%", since a green arrow says nothing out loud.
 */
const meta: Meta<typeof StatCard> = {
  title: "Data/StatCard",
  component: StatCard,
  args: {
    label: "Monthly listeners",
    value: "48,120",
    size: "md",
    color: "primary",
    accent: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    accent: { control: "boolean" },
    description: { control: "text" },
    trend: { control: false },
    icon: { control: false },
  },
  render: (args) => (
    <div style={{ width: "300px", ...surface }}>
      <StatCard
        {...args}
        trend={{ value: "12.5%", up: true }}
        icon={<Glyph svg={iconHeadphones} />}
      />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof StatCard>;

const surface: CSSProperties = {
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// 270px, not less: below that a `md` value plus its trend badge stops fitting on
// one line, the badge wraps underneath, and the tile grows — which knocks the
// labels out of line with the rest of the row. See the `Dashboard` note.
const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
  gap: "16px",
  width: "860px",
  ...surface,
};

const Glyph = ({ svg }: { svg: string }) => <span dangerouslySetInnerHTML={{ __html: svg }} />;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The row of tiles this component exists for. Note that "down" is not always bad:
 * churn falling is good news, and the badge is red anyway — the colour tracks the
 * direction of the number, not whether you should be happy about it. Say which it
 * is in the `description`.
 *
 * Give the tiles room. The value and its trend badge share a line and wrap when
 * they run out of it — which beats overflowing, but a wrapped tile is taller than
 * its neighbours and the labels stop lining up across the row. Around 270px is
 * where a `md` tile stops wrapping; below that, drop to `size="sm"`.
 */
export const Dashboard: Story = {
  render: () => (
    <div style={grid}>
      <StatCard
        label="Monthly listeners"
        value="48,120"
        trend={{ value: "12.5%", up: true }}
        icon={<Glyph svg={iconHeadphones} />}
      />
      <StatCard
        label="Active subscribers"
        value="3,204"
        trend={{ value: "2.1%", up: true }}
        color="indigo"
        icon={<Glyph svg={iconUsers} />}
      />
      <StatCard
        label="Churn"
        value="1.8%"
        trend={{ value: "0.4pp", up: false }}
        description="Down is good here."
        color="ice"
        icon={<Glyph svg={iconActivity} />}
      />
      <StatCard
        label="Revenue"
        value="€12,480"
        trend={{ value: "8.0%", up: true }}
        accent
        icon={<Glyph svg={iconCreditCard} />}
      />
    </div>
  ),
};

/**
 * `accent` recolours the value in the card's tone and adds a glow. It is for the
 * one tile that matters most on the board — use it more than once and it stops
 * meaning anything.
 */
export const Accent: Story = {
  render: () => (
    <div style={{ ...grid, width: "500px" }}>
      <StatCard label="Revenue" value="€12,480" trend={{ value: "8.0%", up: true }} />
      <StatCard label="Revenue" value="€12,480" trend={{ value: "8.0%", up: true }} accent />
    </div>
  ),
};

/**
 * The delta badge in both directions, with the arrow and the colour that go with
 * them. Both are also spoken: "Up 12.5%" and "Down 0.4pp".
 */
export const Trends: Story = {
  render: () => (
    <div style={{ ...grid, width: "760px" }}>
      <StatCard label="Plays this week" value="9,840" trend={{ value: "12.5%", up: true }} />
      <StatCard label="Saves this week" value="1,207" trend={{ value: "3.2%", up: false }} />
      <StatCard label="Comments" value="86" trend={{ value: "+14 today", up: true }} />
    </div>
  ),
};

/**
 * Without a `trend` the tile is a plain readout — right for a figure that has no
 * meaningful "before", like a total or a current balance.
 */
export const WithoutATrend: Story = {
  name: "Without a trend",
  render: () => (
    <div style={{ ...grid, width: "500px" }}>
      <StatCard label="Tracks in the library" value="312" />
      <StatCard label="Storage used" value="41.8 GB" description="of 100 GB on the Studio plan" />
    </div>
  ),
};

/**
 * `size` scales the value, the padding, and the gaps together. `sm` fits three
 * across a sidebar; `lg` is for a single headline figure.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "16px", width: "360px", ...surface }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <StatCard
          key={size}
          size={size}
          label={`Monthly listeners (${size})`}
          value="48,120"
          trend={{ value: "12.5%", up: true }}
        />
      ))}
    </div>
  ),
};

/**
 * `color` sets the tone used by the icon chip, the accent glow, and the accented
 * value. It does not touch the trend badge — green up and red down are fixed,
 * because they mean something.
 */
export const Colors: Story = {
  render: () => (
    <div style={grid}>
      {(["primary", "dante", "indigo", "violet", "ember", "ice"] as const).map((color) => (
        <StatCard
          key={color}
          size="sm"
          color={color}
          accent
          label={color}
          value="48,120"
          icon={<Glyph svg={iconActivity} />}
        />
      ))}
    </div>
  ),
};

/**
 * `value` takes a node, not just a string — enough to hang a unit or a currency
 * off the number at a smaller size without it fighting the headline.
 */
export const RichValue: Story = {
  name: "Rich value",
  render: () => (
    <div style={{ ...grid, width: "500px" }}>
      <StatCard
        label="Revenue"
        value={
          <>
            €12,480
            <span
              style={{
                fontSize: "var(--okkly-font-size-md)",
                color: "var(--okkly-text-muted)",
              }}
            >
              {" "}
              /mo
            </span>
          </>
        }
        trend={{ value: "8.0%", up: true }}
      />
      <StatCard
        label="Average session"
        value={
          <>
            4<span style={{ fontSize: "var(--okkly-font-size-lg)" }}>m</span> 12
            <span style={{ fontSize: "var(--okkly-font-size-lg)" }}>s</span>
          </>
        }
        color="violet"
      />
    </div>
  ),
};
