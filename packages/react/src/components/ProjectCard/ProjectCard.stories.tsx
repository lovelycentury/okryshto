import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../Avatar/Avatar";
import { ProjectCard } from "./ProjectCard";
import oleksiiInParis from "../Photo/assets/oleksii-paris.jpg";

/**
 * The case-study tile for a portfolio: a wide card at a fixed 476:290 ratio, with
 * the artwork behind and the copy sitting on a scrim over it. It sizes to its
 * container's width — give it a grid cell and it fills it.
 *
 * With `href` it becomes a single `<a>` wrapping the whole tile, which is why the
 * arrow in the corner is decorative: it is a picture of the link, not a second
 * one. Without `href` it is a plain div, for a case that is not published yet.
 */
const meta: Meta<typeof ProjectCard> = {
  title: "Media/ProjectCard",
  component: ProjectCard,
  args: {
    title: "Night drive",
    description: "A record, a site, and a token library that outlived both.",
    tags: ["Design system", "Audio"],
    device: false,
    href: "#case",
  },
  argTypes: {
    device: { control: "boolean" },
    tags: { control: "object" },
    image: { control: false },
    logo: { control: false },
  },
  render: (args) => (
    <div style={{ width: "476px", ...surface }}>
      <ProjectCard {...args} image={oleksiiInParis} logo={<Avatar initials="OK" size="sm" />} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof ProjectCard>;

const surface: CSSProperties = {
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
  gap: "20px",
  width: "820px",
  ...surface,
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
 * The portfolio grid this component is for. The tiles keep their ratio as the
 * column width changes, so the row stays even however many of them there are.
 */
export const APortfolioGrid: Story = {
  name: "A portfolio grid",
  render: () => (
    <div style={grid}>
      <ProjectCard
        href="#okryshto"
        image={oleksiiInParis}
        logo={<Avatar initials="OK" size="sm" />}
        title="Okryshto"
        description="A design system in three frameworks, one token pipeline."
        tags={["Design system", "Tokens"]}
      />
      <ProjectCard
        href="#orbit"
        device
        logo={<Avatar initials="OR" size="sm" color="indigo" />}
        title="Orbit"
        description="A messenger built on Fastify and Vue, shipped in six weeks."
        tags={["Product", "Vue"]}
      />
      <ProjectCard
        href="#vizitka"
        logo={<Avatar initials="VZ" size="sm" color="dante" />}
        title="Vizitka"
        description="One page, five links, no framework."
        tags={["Web"]}
      />
      <ProjectCard
        href="#night-drive"
        image={oleksiiInParis}
        logo={<Avatar initials="ND" size="sm" />}
        title="Night drive"
        description="A record and the site that carries it."
        tags={["Audio", "Web"]}
      />
    </div>
  ),
};

/**
 * Without an `image` the card falls back to its built-in gradient. That is a
 * finished state, not a broken one — a case study with no artwork yet still looks
 * like the others.
 */
export const WithoutAnImage: Story = {
  name: "Without an image",
  render: () => (
    <div style={grid}>
      <ProjectCard
        href="#a"
        logo={<Avatar initials="OK" size="sm" />}
        title="Okryshto"
        description="A design system in three frameworks, one token pipeline."
        tags={["Design system", "Tokens"]}
      />
      <ProjectCard
        href="#b"
        image={oleksiiInParis}
        logo={<Avatar initials="NR" size="sm" color="dante" />}
        title="Night drive"
        description="A record and the site that carries it."
        tags={["Audio", "Web"]}
      />
    </div>
  ),
};

/**
 * `device` drops a phone mockup into the corner, bleeding off the card edge. It is
 * decoration for app cases — it shows no real content and is hidden from assistive
 * tech.
 */
export const WithADevice: Story = {
  name: "With a device",
  render: () => (
    <div style={grid}>
      <ProjectCard
        href="#app"
        device
        logo={<Avatar initials="OR" size="sm" color="indigo" />}
        title="Orbit"
        description="A messenger built on Fastify and Vue, shipped in six weeks."
        tags={["Product", "Vue"]}
      />
      <ProjectCard
        href="#app2"
        device
        image={oleksiiInParis}
        logo={<Avatar initials="NR" size="sm" color="dante" />}
        title="Night drive"
        description="The mockup sits over the artwork."
        tags={["Audio"]}
      />
    </div>
  ),
};

/**
 * Everything except `title` can be dropped. Tags wrap onto a second line when
 * there are enough of them; the description is capped so it never runs the width
 * of a wide card.
 *
 * Keep the description to a line or two. The tile holds its 476:290 ratio and
 * clips what does not fit, so a long one eats the bottom padding first and then
 * gets cut — two or three lines is the working budget, less if the card also
 * carries tags.
 */
export const Slots: Story = {
  render: () => (
    <div style={grid}>
      <ProjectCard href="#a" title="Title only" />
      <ProjectCard
        href="#b"
        title="Title and description"
        description="One line of supporting copy."
      />
      <ProjectCard
        href="#c"
        title="Tags that wrap"
        tags={["Design system", "Tokens", "Audio", "Vue", "React", "Svelte"]}
      />
      <ProjectCard
        href="#d"
        logo={<Avatar initials="OK" size="sm" />}
        title="Everything"
        description="A design system in three frameworks, one token pipeline, and about as much copy as this tile will take."
        tags={["Design system", "Tokens"]}
      />
    </div>
  ),
};

/**
 * With `href` the whole tile is one link — tab to it and the focus ring goes round
 * the card. Without it the tile is inert, for a case that is not published.
 */
export const LinkedAndStatic: Story = {
  name: "Linked and static",
  render: () => (
    <div style={{ display: "grid", gap: "12px", ...surface }}>
      <div style={grid}>
        <ProjectCard
          href="#linked"
          image={oleksiiInParis}
          logo={<Avatar initials="OK" size="sm" />}
          title="Linked"
          description="One anchor around the whole tile."
          tags={["Case study"]}
        />
        <ProjectCard
          logo={<Avatar initials="OK" size="sm" color="indigo" />}
          title="Not published"
          description="No href — nothing to tab to."
          tags={["Draft"]}
        />
      </div>
      <p style={caption}>Tab through this story: only the first tile takes focus.</p>
    </div>
  ),
};
