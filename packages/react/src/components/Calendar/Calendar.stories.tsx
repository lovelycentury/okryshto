import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Calendar,
  calendarToneStyle,
  type CalendarBaseProps,
  type CalendarMode,
  type CalendarProps,
  type CalendarTone,
  type CalendarValue,
} from "./Calendar";

// A fixed month keeps every story's grid identical between runs, which is what
// makes them comparable at all. The one exception is `Today`, which has to open
// on the real current month — see its comment.
const demoMonth = new Date(2024, 10, 1); // November 2024
const demoSelected = new Date(2024, 10, 12);
const demoRange: [Date, Date] = [new Date(2024, 10, 12), new Date(2024, 10, 21)];

/**
 * Month grid. Two modes, and the story names say which one they are in:
 *
 * - **Single** — `mode="single"` (the default). One date; `onSelect` fires on
 *   every click.
 * - **Range** — `mode="range"`. A start/end pair; the first click arms the
 *   start, `onSelect` fires on the second with the pair already ordered.
 *
 * Note that `Bounds (min / max)` is *not* a mode — `min`/`max` limit what is
 * selectable in either of them.
 *
 * The accent is the CSS variable `--okkly-calendar-tone`, not a prop;
 * `calendarToneStyle(name)` maps a palette name onto it. Today's date stays
 * dante regardless of the tone, because it marks "you are here" rather than a
 * selection.
 */
const meta: Meta<typeof Calendar> = {
  title: "Control/Calendar",
  component: Calendar,
  args: {
    month: demoMonth,
    weekStart: "mon",
  },
  argTypes: {
    weekStart: { control: "inline-radio", options: ["mon", "sun"] },
    mode: { control: "inline-radio", options: ["single", "range"] },
  },
  render: (args) => <Calendar {...args} />,
};

export default meta;
type Story = StoryObj<typeof Calendar>;

/**
 * Every prop as a control, including the tone. Start here when you want to see
 * what a combination looks like; the stories below are the states worth naming.
 */
// `tone` is not a Calendar prop — it is a control that writes the CSS variable,
// so the override idiom is discoverable from the panel. `mode` is widened back
// to the union because a control can flip it either way, which the discriminated
// props type (rightly) forbids at a normal call site.
type PlaygroundArgs = CalendarBaseProps & {
  mode?: CalendarMode;
  value?: CalendarValue | null;
  tone?: CalendarTone;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  args: { month: demoMonth, weekStart: "mon", value: demoSelected, tone: "primary" },
  argTypes: {
    mode: { control: "inline-radio", options: ["single", "range"] },
    weekStart: { control: "inline-radio", options: ["mon", "sun"] },
    tone: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
  },
  render: ({ tone, ...args }) => (
    <Calendar {...(args as CalendarProps)} style={calendarToneStyle(tone ?? "primary")} />
  ),
};

/* ---------------------------------------------------------------- Single */

/** Nothing selected. */
export const SingleDefault: Story = {
  name: "Single — Default",
};

/** One date committed. */
export const SingleSelected: Story = {
  name: "Single — Selected",
  args: { value: demoSelected },
};

/** `onSelect` fires on every click. */
export const SingleInteractive: Story = {
  name: "Single — Interactive",
  render: () => {
    const [month, setMonth] = useState(demoMonth);
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}
      >
        <Calendar month={month} onMonthChange={setMonth} value={value} onSelect={setValue} />
        <p
          style={{
            margin: 0,
            color: "#a9a9b2",
            fontSize: "13px",
            fontFamily: "var(--okkly-font-family-mono, monospace)",
          }}
        >
          {value
            ? value.toDateString()
            : "Click a day, the header to pick year/month, or the arrows."}
        </p>
      </div>
    );
  },
};

/* ----------------------------------------------------------------- Range */

/** Both ends solid, the days between them tinted. */
export const RangeCommitted: Story = {
  name: "Range — Committed",
  args: { mode: "range", value: demoRange },
};

/**
 * A range running off both edges of the visible month. The leading and trailing
 * days of the adjacent months are real dates in the range and paint as such,
 * without either being mistaken for an end of it — the ends are matched by date,
 * never by position in the grid.
 */
export const RangeAcrossMonths: Story = {
  name: "Range — Across months",
  args: { mode: "range", value: [new Date(2024, 9, 29), new Date(2024, 11, 3)] },
};

/** Two clicks. Clicking backwards works — the pair arrives ordered. */
export const RangeInteractive: Story = {
  name: "Range — Interactive",
  render: () => {
    const [month, setMonth] = useState(demoMonth);
    const [range, setRange] = useState<[Date, Date] | null>(null);
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}
      >
        <Calendar
          mode="range"
          month={month}
          onMonthChange={setMonth}
          value={range}
          onSelect={setRange}
        />
        <p
          style={{
            margin: 0,
            color: "#a9a9b2",
            fontSize: "13px",
            fontFamily: "var(--okkly-font-family-mono, monospace)",
          }}
        >
          {range
            ? `${range[0].toDateString()} → ${range[1].toDateString()}`
            : "Click a start date, then an end date."}
        </p>
      </div>
    );
  },
};

/* ----------------------------------------------------------------- State */

/**
 * The only story without a fixed month: today's marker can only be seen on the
 * month that contains today. Its dante colouring is deliberately off the accent
 * tone — "you are here" is not "this is picked" — so it reads the same whatever
 * the calendar is tinted with.
 */
export const Today: Story = {
  name: "Today",
  args: { month: undefined },
  render: (args) => (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <Calendar {...args} />
      <Calendar {...args} style={calendarToneStyle("violet")} />
    </div>
  ),
};

/**
 * `min`/`max` bound what is selectable — unreachable days are struck through,
 * and the year and month grids disable what they cannot lead to. This is not a
 * mode: it applies to single and range alike.
 */
export const Bounds: Story = {
  name: "Bounds (min / max)",
  args: { min: new Date(2024, 10, 5), max: new Date(2024, 10, 22), value: demoSelected },
};

/** Sunday-first weekday order. */
export const WeekStartSunday: Story = {
  name: "Week starts Sunday",
  args: { weekStart: "sun", value: demoSelected },
};
