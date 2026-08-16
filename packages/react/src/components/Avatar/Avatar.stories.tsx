import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";
import oleksiiInParis from "../Photo/assets/oleksii-paris.jpg";

/**
 * The person, compressed to one glyph. An avatar carries an image when there is
 * one and the person's initials when there isn't — and it flips to the initials
 * on its own if the image 404s, so a dead CDN never leaves a hole in a member
 * list.
 *
 * It says nothing to a screen reader unless you give it `alt`. That is usually
 * right: an avatar next to a name is decoration, and announcing "Oleksii
 * Kryshtopa" twice helps nobody. Set `alt` only when the avatar stands alone.
 */
const meta: Meta<typeof Avatar> = {
  title: "Data/Avatar",
  component: Avatar,
  args: {
    initials: "OK",
    size: "md",
    shape: "circle",
    color: "mint",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["circle", "rounded"] },
    color: { control: "inline-radio", options: ["mint", "dante", "indigo"] },
    status: { control: "inline-radio", options: [undefined, "online", "offline"] },
  },
  render: (args) => (
    <div style={surface}>
      <Avatar {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Avatar>;

const surface: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "16px",
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
 * With `src` the image fills the frame, cropped to `cover` — so a portrait and a
 * landscape both come out as the same circle.
 */
export const WithAPhoto: Story = {
  name: "With a photo",
  render: () => (
    <div style={surface}>
      <Avatar src={oleksiiInParis} alt="Oleksii Kryshtopa" size="sm" />
      <Avatar src={oleksiiInParis} alt="Oleksii Kryshtopa" />
      <Avatar src={oleksiiInParis} alt="Oleksii Kryshtopa" size="lg" />
      <Avatar src={oleksiiInParis} alt="Oleksii Kryshtopa" size="lg" shape="rounded" />
    </div>
  ),
};

/**
 * No image, so the initials carry it. Only the first two characters are used —
 * pass the whole name if you like, `"Oleksii Kryshtopa"` still renders as "OL".
 * Feed it the initials you actually want.
 */
export const Initials: Story = {
  render: () => (
    <div style={surface}>
      <Avatar initials="OK" />
      <Avatar initials="AB" color="dante" />
      <Avatar initials="MK" color="indigo" />
      <Avatar initials="R" />
      <Avatar initials="" />
    </div>
  ),
};

/**
 * A broken `src` falls back to the initials rather than to a broken-image icon.
 * The image below points nowhere on purpose — this is what your users get when
 * the avatar host is down.
 */
export const BrokenImage: Story = {
  name: "Broken image",
  render: () => (
    <div style={{ ...surface, gap: "24px" }}>
      <div style={{ display: "grid", gap: "8px", justifyItems: "center" }}>
        <Avatar src={oleksiiInParis} initials="OK" alt="Oleksii Kryshtopa" />
        <p style={caption}>loads</p>
      </div>
      <div style={{ display: "grid", gap: "8px", justifyItems: "center" }}>
        <Avatar src="/does-not-exist.jpg" initials="OK" alt="Oleksii Kryshtopa" />
        <p style={caption}>404 → initials</p>
      </div>
    </div>
  ),
};

/**
 * `status` adds a presence dot. Its ring is painted in `--okryshto-bg-canvas` so the
 * dot reads as punched out of the page — on a lighter surface, override
 * `--okryshto-avatar-status-border-color` to match whatever is actually behind it.
 */
export const Presence: Story = {
  render: () => (
    <div style={{ ...surface, gap: "24px" }}>
      <div style={{ display: "grid", gap: "8px", justifyItems: "center" }}>
        <Avatar src={oleksiiInParis} alt="Oleksii Kryshtopa" status="online" />
        <p style={caption}>online</p>
      </div>
      <div style={{ display: "grid", gap: "8px", justifyItems: "center" }}>
        <Avatar initials="AB" color="dante" status="offline" />
        <p style={caption}>offline</p>
      </div>
      <div
        style={{
          display: "grid",
          gap: "8px",
          justifyItems: "center",
          padding: "12px",
          borderRadius: "12px",
          background: "var(--okryshto-bg-surface-raised)",
        }}
      >
        <Avatar
          initials="MK"
          color="indigo"
          status="online"
          style={{
            ["--okryshto-avatar-status-border-color" as string]:
              "var(--okryshto-bg-surface-raised)",
          }}
        />
        <p style={caption}>ring retinted</p>
      </div>
    </div>
  ),
};

/**
 * The member row this component exists for: avatar, name, role. The avatar has no
 * `alt` here — the name is right next to it, and a second announcement is noise.
 */
export const InAMemberList: Story = {
  name: "In a member list",
  render: () => (
    <div style={{ display: "grid", gap: "14px", width: "320px", ...surface }}>
      {[
        {
          initials: "OK",
          name: "Oleksii Kryshtopa",
          role: "Design systems",
          src: oleksiiInParis,
          status: "online",
        },
        {
          initials: "AB",
          name: "Anna Berg",
          role: "Front-end",
          color: "dante" as const,
          status: "online",
        },
        {
          initials: "MK",
          name: "Marek Kovac",
          role: "Product",
          color: "indigo" as const,
          status: "offline",
        },
      ].map((member) => (
        <div key={member.name} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            initials={member.initials}
            src={member.src}
            color={member.color}
            status={member.status as "online" | "offline"}
          />
          <div style={{ display: "grid", gap: "2px" }}>
            <span style={{ fontSize: "var(--okryshto-font-size-md)" }}>{member.name}</span>
            <span style={caption}>{member.role}</span>
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * Three diameters, 36/48/64px. The status dot and the `rounded` corner radius
 * scale with them, so a small avatar does not end up with an oversized dot.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ ...surface, alignItems: "flex-end" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ display: "grid", gap: "8px", justifyItems: "center" }}>
          <Avatar initials="OK" size={size} status="online" />
          <p style={caption}>{size}</p>
        </div>
      ))}
    </div>
  ),
};

/**
 * `circle` for people, `rounded` for anything that is not a person — a workspace,
 * a bot, an integration.
 */
export const Shapes: Story = {
  render: () => (
    <div style={surface}>
      <Avatar initials="OK" />
      <Avatar initials="LK" shape="rounded" />
      <Avatar src={oleksiiInParis} alt="Oleksii Kryshtopa" shape="rounded" size="lg" />
    </div>
  ),
};

/**
 * `color` only shows through when there is no image — it tints the gradient
 * behind the initials. Deriving it from the name (hash the string, pick a tone)
 * keeps the same person the same colour everywhere.
 */
export const Colors: Story = {
  render: () => (
    <div style={surface}>
      {(["mint", "dante", "indigo"] as const).map((color) => (
        <div key={color} style={{ display: "grid", gap: "8px", justifyItems: "center" }}>
          <Avatar initials="OK" color={color} />
          <p style={caption}>{color}</p>
        </div>
      ))}
    </div>
  ),
};

/**
 * Standing on its own, an avatar needs `alt` — without it the whole thing is
 * hidden from assistive tech and the row it sits in reads as empty.
 */
export const AccessibleName: Story = {
  name: "Accessible name",
  render: () => (
    <div style={{ display: "grid", gap: "16px", ...surface }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Avatar initials="OK" alt="Oleksii Kryshtopa" />
        <p style={caption}>alt set — exposed as an image named “Oleksii Kryshtopa”</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Avatar initials="OK" />
        <p style={caption}>no alt — silent, correct only when a name sits beside it</p>
      </div>
    </div>
  ),
};
