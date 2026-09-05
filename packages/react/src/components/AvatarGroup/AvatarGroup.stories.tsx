import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../Avatar/Avatar";
import { AvatarGroup } from "./AvatarGroup";
import oleksiiInParis from "../Photo/assets/oleksii-paris.jpg";

/**
 * A stack of overlapping avatars for "who is on this". It takes plain `Avatar`
 * children and overrides their `size` and `color` so a row of them can never
 * come out ragged — pass the people, not the styling.
 *
 * Past `max` it collapses into a "+N" chip. `total` is there for the usual case
 * where the API hands you the first few members and a count: pass four children
 * and `total={31}` and the chip says +28, without inventing 27 avatars nobody
 * will look at.
 */
const meta: Meta<typeof AvatarGroup> = {
  title: "Data/AvatarGroup",
  component: AvatarGroup,
  args: {
    max: 5,
    size: "sm",
    spacing: "default",
    ring: true,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    spacing: { control: "inline-radio", options: ["dense", "default", "loose"] },
    ring: { control: "boolean" },
    max: { control: { type: "number", min: 1, max: 8 } },
    total: { control: { type: "number", min: 0, max: 99 } },
    hues: { control: false },
    children: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <AvatarGroup {...args} hues={["mint", "dante", "indigo"]}>
        {TEAM.map((member) => (
          <Avatar key={member.name} initials={member.initials} src={member.src} />
        ))}
      </AvatarGroup>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

const surface: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "16px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const caption: CSSProperties = {
  margin: 0,
  fontSize: "var(--okkly-font-size-sm)",
  color: "var(--okkly-text-muted)",
};

const TEAM = [
  { name: "Oleksii Kryshtopa", initials: "OK", src: oleksiiInParis },
  { name: "Anna Berg", initials: "AB" },
  { name: "Marek Kovac", initials: "MK" },
  { name: "Lena Ford", initials: "LF" },
  { name: "Ravi Shah", initials: "RS" },
  { name: "Tom Iversen", initials: "TI" },
];

const members = (count: number) =>
  TEAM.slice(0, count).map((member) => (
    <Avatar key={member.name} initials={member.initials} src={member.src} />
  ));

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The stack as it appears on a project row: the faces, then how many more there
 * are, then the label that says what the faces mean.
 */
export const OnAProjectRow: Story = {
  name: "On a project row",
  render: () => (
    <div style={{ display: "grid", gap: "18px", width: "360px", ...surface }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <AvatarGroup max={4} total={31} hues={["mint", "dante", "indigo"]}>
          {members(6)}
        </AvatarGroup>
        <span style={caption}>31 collaborators</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <AvatarGroup max={4} hues={["mint", "dante", "indigo"]}>
          {members(3)}
        </AvatarGroup>
        <span style={caption}>3 collaborators</span>
      </div>
    </div>
  ),
};

/**
 * Under `max` everything is shown. At or over it, one slot is given up to the
 * chip — `max={4}` with six children means three faces and "+3", never four
 * faces and "+2".
 */
export const Overflow: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "18px", ...surface }}>
      {[6, 5, 4, 3].map((max) => (
        <div key={max} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <AvatarGroup max={max} hues={["mint", "dante", "indigo"]}>
            {members(6)}
          </AvatarGroup>
          <span style={caption}>max={max} of 6</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * `total` overrides what the chip counts, for the common case where the API
 * returns a handful of members plus a number. The children are still the ones
 * you get faces for.
 */
export const TotalCount: Story = {
  name: "Total count",
  render: () => (
    <div style={{ display: "grid", gap: "18px", ...surface }}>
      {[8, 31, 240].map((total) => (
        <div key={total} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <AvatarGroup max={4} total={total} hues={["mint", "dante", "indigo"]}>
            {members(4)}
          </AvatarGroup>
          <span style={caption}>total={total}, 4 children</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * `spacing` sets how far the faces climb onto each other. `dense` fits a long
 * stack into a table cell; `loose` keeps every face legible.
 */
export const Spacing: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "18px", ...surface }}>
      {(["dense", "default", "loose"] as const).map((spacing) => (
        <div key={spacing} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <AvatarGroup spacing={spacing} hues={["mint", "dante", "indigo"]}>
            {members(5)}
          </AvatarGroup>
          <span style={caption}>{spacing}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * `size` is applied to every member, overriding whatever the child `Avatar` asked
 * for. That is the point: a stack with one odd-sized face in it looks broken.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "18px", ...surface }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <AvatarGroup size={size} max={4} total={12} hues={["mint", "dante", "indigo"]}>
            {members(4)}
          </AvatarGroup>
          <span style={caption}>{size}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * The separator ring is painted in `--okkly-bg-canvas` to look punched out of the
 * page — which only works while the stack *is* on the canvas. On a raised card,
 * retint `--okkly-avatar-group-ring-color`, or turn the ring off.
 */
export const RingOnAnotherSurface: Story = {
  name: "Ring on another surface",
  render: () => (
    <div style={{ display: "grid", gap: "16px", width: "360px", ...surface }}>
      {[
        { label: "default ring — wrong colour here", style: undefined },
        {
          label: "ring retinted to the card",
          style: {
            ["--okkly-avatar-group-ring-color" as string]: "var(--okkly-bg-surface-raised)",
          },
        },
      ].map((row) => (
        <div
          key={row.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px",
            borderRadius: "14px",
            background: "var(--okkly-bg-surface-raised)",
          }}
        >
          <AvatarGroup hues={["mint", "dante", "indigo"]} style={row.style as CSSProperties}>
            {members(4)}
          </AvatarGroup>
          <span style={caption}>{row.label}</span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <AvatarGroup ring={false} hues={["mint", "dante", "indigo"]}>
          {members(4)}
        </AvatarGroup>
        <span style={caption}>ring={"{false}"} — works on any surface</span>
      </div>
    </div>
  ),
};

/**
 * `hues` cycles tones across the members in order, so a stack of initials does not
 * come out as one flat block of mint. Members with a photo ignore it.
 */
export const Hues: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "18px", ...surface }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <AvatarGroup size="md">{members(5)}</AvatarGroup>
        <span style={caption}>default — one tone</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <AvatarGroup size="md" hues={["mint", "dante", "indigo"]}>
          {members(5)}
        </AvatarGroup>
        <span style={caption}>cycled</span>
      </div>
    </div>
  ),
};

/**
 * `shape="rounded"` members keep their corners, and the ring follows them rather
 * than drawing a circle around a squircle.
 */
export const RoundedMembers: Story = {
  name: "Rounded members",
  render: () => (
    <div style={surface}>
      <AvatarGroup size="md" spacing="loose" hues={["mint", "dante", "indigo"]}>
        <Avatar initials="LK" shape="rounded" />
        <Avatar initials="AC" shape="rounded" />
        <Avatar initials="ZY" shape="rounded" />
      </AvatarGroup>
    </div>
  ),
};
