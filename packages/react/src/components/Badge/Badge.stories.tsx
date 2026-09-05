import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { iconBell, iconMail, iconShoppingCart } from "@okkly/icons";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Badge, type BadgeColor } from "./Badge";

/**
 * A count or status dot pinned to the corner of another element. Wrap the thing
 * being annotated in `children`; without `children` the badge renders standalone,
 * which is what you want inside a list row or a tab label.
 *
 * A bare number is meaningless to a screen reader, so give the anchor an
 * accessible name that includes the count — see the *Accessible counts* story.
 * Zero is hidden on purpose, matching MUI: an empty inbox shouldn't wear a `0`.
 */
const meta: Meta<typeof Badge> = {
  title: "Feedback/Badge",
  component: Badge,
  args: {
    badgeContent: 4,
    color: "dante",
    variant: "standard",
    max: 99,
    invisible: false,
    overlap: "circular",
  },
  argTypes: {
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
    variant: { control: "inline-radio", options: ["standard", "dot"] },
    overlap: { control: "inline-radio", options: ["circular", "rectangular"] },
    children: { control: false },
    anchorOrigin: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <Badge {...args}>
        <IconButton variant="glass" aria-label="Notifications" icon={<Glyph svg={iconBell} />} />
      </Badge>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Badge>;

const surface: CSSProperties = {
  display: "flex",
  alignItems: "center",
  // The badge's ring is drawn in the inset colour, so it only disappears against
  // a matching background — hence the explicit card rather than the bare canvas.
  width: "fit-content",
  gap: "28px",
  padding: "20px 24px",
  borderRadius: "14px",
  background: "var(--okkly-bg-inset)",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// The icon package ships raw SVG strings, so anything using them needs a host node.
const Glyph = ({ svg }: { svg: string }) => <span dangerouslySetInnerHTML={{ __html: svg }} />;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The everyday case: counts on the icons in an app bar.
 */
export const OnIcons: Story = {
  name: "On icons",
  render: () => (
    <div style={surface}>
      <Badge badgeContent={4} color="dante">
        <IconButton
          variant="glass"
          aria-label="Notifications, 4 unread"
          icon={<Glyph svg={iconBell} />}
        />
      </Badge>
      <Badge badgeContent={12} color="indigo">
        <IconButton
          variant="glass"
          aria-label="Messages, 12 unread"
          icon={<Glyph svg={iconMail} />}
        />
      </Badge>
      <Badge badgeContent={128} max={99} color="primary">
        <IconButton
          variant="glass"
          aria-label="Cart, 128 items"
          icon={<Glyph svg={iconShoppingCart} />}
        />
      </Badge>
    </div>
  ),
};

/**
 * `variant="dot"` drops the number and just says "something changed" — the right
 * choice when the exact count doesn't help the user decide anything.
 */
export const StatusDot: Story = {
  name: "Status dot",
  render: () => (
    <div style={surface}>
      <Badge variant="dot" color="success">
        <Avatar initials="OK" />
      </Badge>
      <Badge variant="dot" color="warning">
        <Avatar initials="LM" color="indigo" />
      </Badge>
      <Badge
        variant="dot"
        color="danger"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Avatar initials="AS" color="dante" />
      </Badge>
    </div>
  ),
};

/**
 * `max` caps the number: anything above it renders as `{max}+`, so a runaway
 * count can't stretch the layout. `0` is hidden entirely.
 */
export const Overflow: Story = {
  render: () => (
    <div style={surface}>
      {[0, 9, 99, 100, 1240].map((count) => (
        <div key={count} style={{ display: "grid", justifyItems: "center", gap: "10px" }}>
          <Badge badgeContent={count} color="dante">
            <IconButton
              variant="glass"
              aria-label={`${count} notifications`}
              icon={<Glyph svg={iconBell} />}
            />
          </Badge>
          <span
            style={{
              fontSize: "var(--okkly-font-size-sm)",
              color: "var(--okkly-text-muted)",
            }}
          >
            {count}
          </span>
        </div>
      ))}
    </div>
  ),
};

/**
 * Without `children` the badge is a standalone pill — use it in table cells,
 * list rows, and tab labels, where it lines up with text instead of hanging off
 * a corner.
 */
export const Standalone: Story = {
  render: () => (
    <div
      style={{
        ...surface,
        flexDirection: "column",
        alignItems: "stretch",
        gap: "0",
        width: "360px",
        padding: "8px",
      }}
    >
      {[
        { label: "Inbox", count: 12, color: "indigo" as BadgeColor },
        { label: "Flagged", count: 3, color: "warning" as BadgeColor },
        { label: "Failed deliveries", count: 128, color: "danger" as BadgeColor },
        { label: "Archive", count: 0, color: "indigo" as BadgeColor },
      ].map((row) => (
        <div
          key={row.label}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "10px 12px",
            borderRadius: "8px",
            fontSize: "var(--okkly-font-size-sm)",
          }}
        >
          <span>{row.label}</span>
          <Badge badgeContent={row.count} color={row.color} />
        </div>
      ))}
    </div>
  ),
};

/**
 * `anchorOrigin` picks the corner and `overlap` tunes how far out the badge sits
 * — `circular` for avatars and round buttons, `rectangular` for cards and
 * thumbnails whose corners are square.
 */
export const Placement: Story = {
  render: () => {
    const corners = [
      { vertical: "top", horizontal: "right" },
      { vertical: "top", horizontal: "left" },
      { vertical: "bottom", horizontal: "right" },
      { vertical: "bottom", horizontal: "left" },
    ] as const;
    return (
      <div style={{ ...surface, flexWrap: "wrap", gap: "36px" }}>
        {corners.map((anchorOrigin) => (
          <div
            key={`${anchorOrigin.vertical}-${anchorOrigin.horizontal}`}
            style={{ display: "grid", justifyItems: "center", gap: "12px" }}
          >
            <Badge badgeContent={7} color="dante" anchorOrigin={anchorOrigin}>
              <Avatar initials="OK" />
            </Badge>
            <span
              style={{
                fontSize: "var(--okkly-font-size-sm)",
                color: "var(--okkly-text-muted)",
              }}
            >
              {anchorOrigin.vertical}/{anchorOrigin.horizontal}
            </span>
          </div>
        ))}
        <div style={{ display: "grid", justifyItems: "center", gap: "12px" }}>
          <Badge badgeContent={7} color="dante" overlap="rectangular">
            <Avatar initials="OK" shape="rounded" />
          </Badge>
          <span
            style={{
              fontSize: "var(--okkly-font-size-sm)",
              color: "var(--okkly-text-muted)",
            }}
          >
            rectangular
          </span>
        </div>
      </div>
    );
  },
};

/**
 * Every tone. Omit `color` for the neutral raised pill, which is the quiet option
 * for counts that carry no urgency.
 */
export const Colors: Story = {
  render: () => {
    const colors: Array<BadgeColor | undefined> = [
      undefined,
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
      <div style={{ ...surface, flexWrap: "wrap", gap: "18px" }}>
        {colors.map((color) => (
          <div
            key={color ?? "neutral"}
            style={{ display: "grid", justifyItems: "center", gap: "8px" }}
          >
            <Badge badgeContent={8} color={color} />
            <span
              style={{
                fontSize: "var(--okkly-font-size-sm)",
                color: "var(--okkly-text-muted)",
              }}
            >
              {color ?? "neutral"}
            </span>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * `invisible` hides the badge without unmounting the anchor — handy when a count
 * drops to nothing but you don't want the icon to jump.
 */
export const Invisible: Story = {
  render: () => {
    const [unread, setUnread] = useState(6);
    return (
      <div style={surface}>
        <Badge badgeContent={unread} color="dante" invisible={unread === 0}>
          <IconButton
            variant="glass"
            aria-label={`Notifications, ${unread} unread`}
            icon={<Glyph svg={iconBell} />}
          />
        </Badge>
        <Button size="small" variant="soft" onClick={() => setUnread((count) => count + 1)}>
          New notification
        </Button>
        <Button size="small" variant="ghost" onClick={() => setUnread(0)}>
          Mark all read
        </Button>
      </div>
    );
  },
};

/**
 * The number is decorative markup — assistive tech reads the anchor, not the
 * pill. Put the count in the anchor's accessible name so both audiences get the
 * same information.
 */
export const AccessibleCounts: Story = {
  name: "Accessible counts",
  render: () => (
    <div style={{ ...surface, flexDirection: "column", alignItems: "flex-start", gap: "14px" }}>
      <Badge badgeContent={4} color="dante">
        <IconButton
          variant="glass"
          aria-label="Notifications, 4 unread"
          icon={<Glyph svg={iconBell} />}
        />
      </Badge>
      <p
        style={{
          margin: 0,
          maxWidth: "420px",
          fontSize: "var(--okkly-font-size-sm)",
          color: "var(--okkly-text-secondary)",
        }}
      >
        The button above announces “Notifications, 4 unread”. Keep that label in sync with{" "}
        <code>badgeContent</code> — a badge on its own announces nothing.
      </p>
    </div>
  ),
};
