import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { LinkCard } from "./LinkCard";

/**
 * The "list of links" row from the vizitka: a title, a supporting line, a tag on
 * the right, and an arrow saying it goes somewhere. Stack a few of them and you
 * have the whole navigation of a personal site.
 *
 * With `href` it renders an `<a>` and behaves like a link. With only `onClick` it
 * renders a focusable row with `role="button"` — button, not link, because there
 * is no destination and it answers to Space. With neither it is inert text, which
 * is a legitimate way to show a row that is not yet live.
 */
const meta: Meta<typeof LinkCard> = {
  title: "Media/LinkCard",
  component: LinkCard,
  args: {
    title: "Writing",
    subtitle: "Essays on design systems and audio",
    meta: "24 posts",
    size: "medium",
    color: "primary",
    featured: false,
    href: "#writing",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    featured: { control: "boolean" },
    meta: { control: "text" },
    onClick: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <LinkCard {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof LinkCard>;

// `minmax(0, 1fr)`, not the default `auto`: an auto grid track sizes to its
// content's minimum, so a long unbreakable title would widen the column past the
// container instead of being truncated by the card.
const surface: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "12px",
  width: "460px",
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

const caption: CSSProperties = {
  margin: 0,
  fontSize: "var(--okryshto-font-size-sm)",
  color: "var(--okryshto-text-muted)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The whole point: a page that is nothing but these. One row is `featured`, which
 * is what draws the eye to the thing you actually want clicked.
 */
export const ALinksPage: Story = {
  name: "A links page",
  render: () => (
    <div style={surface}>
      <LinkCard
        href="#writing"
        featured
        title="Night drive vol. 2"
        subtitle="New record, out now"
        meta="album"
      />
      <LinkCard
        href="#essays"
        title="Writing"
        subtitle="Essays on design systems and audio"
        meta="24 posts"
      />
      <LinkCard href="#work" title="Work" subtitle="Selected projects, 2019—2026" meta="12 cases" />
      <LinkCard
        href="#github"
        title="GitHub"
        subtitle="Open source and half-finished experiments"
        meta="@okryshto"
      />
      <LinkCard title="Newsletter" subtitle="Not open yet — soon" meta="soon" />
    </div>
  ),
};

/**
 * `featured` swaps the surface for glass, adds an accent dot before the title, and
 * tints the arrow and the glow with `color`. One per page.
 */
export const Featured: Story = {
  render: () => (
    <div style={surface}>
      <LinkCard href="#a" title="Regular row" subtitle="Surface, subtle border" meta="default" />
      <LinkCard
        href="#b"
        featured
        title="Featured row"
        subtitle="Glass, accent dot, glow"
        meta="featured"
      />
    </div>
  ),
};

/**
 * `color` only shows up on a `featured` row — it drives the dot, the arrow, and
 * the glow. On a regular row it is stored and unused.
 */
export const Colors: Story = {
  render: () => (
    <div style={surface}>
      {(["primary", "dante", "indigo", "violet", "ember", "ice"] as const).map((color) => (
        <LinkCard
          key={color}
          href={`#${color}`}
          featured
          color={color}
          title={color}
          subtitle="featured"
          meta={color}
        />
      ))}
    </div>
  ),
};

/**
 * Three densities. `small` fits a sidebar; `large` is for a page where three rows
 * are the entire content.
 */
export const Sizes: Story = {
  render: () => (
    <div style={surface}>
      {(["small", "medium", "large"] as const).map((size) => (
        <LinkCard
          key={size}
          href={`#${size}`}
          size={size}
          title={`Writing (${size})`}
          subtitle="Essays"
          meta="24"
        />
      ))}
    </div>
  ),
};

/**
 * Everything but the title is optional. Without `subtitle` the row halves in
 * height; without `meta` the arrow moves to the trailing edge on its own.
 */
export const Slots: Story = {
  render: () => (
    <div style={surface}>
      <LinkCard href="#a" title="Title only" />
      <LinkCard href="#b" title="With a subtitle" subtitle="Essays on design systems and audio" />
      <LinkCard href="#c" title="With meta" meta="24 posts" />
      <LinkCard
        href="#d"
        title="Everything"
        subtitle="Essays on design systems and audio"
        meta="24 posts"
      />
      <LinkCard
        href="#e"
        title="A title long enough that it has nowhere left to go and has to be cut off"
        subtitle="The title truncates; the meta never shrinks"
        meta="@a-long-handle"
      />
    </div>
  ),
};

/**
 * Without `href` but with `onClick` the row is a button: focusable with Tab,
 * activated by Enter *and* Space. Use it for rows that do something on this page
 * rather than navigating away.
 */
export const AsAButton: Story = {
  name: "As a button",
  render: () => {
    const [count, setCount] = useState(0);
    return (
      <div style={surface}>
        <LinkCard
          title="Copy my email address"
          subtitle="Nothing navigates — this one acts"
          meta={count > 0 ? "copied" : "click me"}
          onClick={() => setCount((value) => value + 1)}
        />
        <p style={caption}>Activated {count} times. Tab to it and press Space.</p>
      </div>
    );
  },
};

/**
 * With neither `href` nor `onClick` the row is inert: no cursor, no focus, no
 * role. That is the right way to show something that is coming but not live —
 * better than a link to nowhere.
 */
export const Static: Story = {
  render: () => (
    <div style={surface}>
      <LinkCard href="#live" title="Live" subtitle="Has an href" meta="→" />
      <LinkCard title="Not live yet" subtitle="No href, no onClick — inert" meta="soon" />
    </div>
  ),
};
