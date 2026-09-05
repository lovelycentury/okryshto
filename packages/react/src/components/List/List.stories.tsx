import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  iconBell,
  iconFolder,
  iconGlobe,
  iconLock,
  iconPalette,
  iconTrash,
  iconUser,
} from "@okkly/icons";
import { Avatar } from "../Avatar/Avatar";
import { Badge } from "../Badge/Badge";
import { Switch } from "../Switch/Switch";
import { List, ListItem, ListItemIcon, ListItemText } from "./List";

/**
 * A vertical run of rows on one surface — settings, menus, anything where the
 * items are siblings rather than a grid of records. For tabular data with columns
 * that line up, reach for `Table` instead.
 *
 * `ListItem` renders one of two things. Plain, it is an `li` you can put anything
 * in. Given `button` or an `onClick`, the row's content becomes a real `<button>`
 * inside the `li`, which is what makes Enter, Space, and focus work without this
 * component reimplementing any of it. A `secondaryAction` deliberately stays
 * *outside* that button — a switch nested inside a button is unreachable.
 */
const meta: Meta<typeof List> = {
  title: "Data/List",
  component: List,
  args: {
    dense: false,
    disablePadding: false,
  },
  argTypes: {
    subheader: { control: "text" },
    children: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <List {...args}>
        <ListItem button startIcon={<Glyph svg={iconUser} />}>
          <ListItemText primary="Profile" secondary="Name, photo, and handle" />
        </ListItem>
        <ListItem button selected startIcon={<Glyph svg={iconBell} />}>
          <ListItemText primary="Notifications" secondary="Email and push" />
        </ListItem>
        <ListItem button startIcon={<Glyph svg={iconLock} />}>
          <ListItemText primary="Security" secondary="Password and sessions" />
        </ListItem>
      </List>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof List>;

const surface: CSSProperties = {
  width: "380px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const Glyph = ({ svg }: { svg: string }) => (
  <ListItemIcon>
    <span dangerouslySetInnerHTML={{ __html: svg }} />
  </ListItemIcon>
);

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The settings pane this component is shaped for. `selected` marks where the user
 * currently is — one row at a time, kept in the parent's state.
 */
export const SettingsMenu: Story = {
  name: "Settings menu",
  render: () => {
    const [active, setActive] = useState("appearance");
    const sections = [
      { id: "profile", icon: iconUser, primary: "Profile", secondary: "Name, photo, and handle" },
      {
        id: "appearance",
        icon: iconPalette,
        primary: "Appearance",
        secondary: "Theme and density",
      },
      {
        id: "notifications",
        icon: iconBell,
        primary: "Notifications",
        secondary: "Email and push",
      },
      { id: "language", icon: iconGlobe, primary: "Language", secondary: "English (UK)" },
    ];
    return (
      <div style={surface}>
        <List subheader="Settings">
          {sections.map((section) => (
            <ListItem
              key={section.id}
              button
              selected={active === section.id}
              startIcon={<Glyph svg={section.icon} />}
              onClick={() => setActive(section.id)}
            >
              <ListItemText primary={section.primary} secondary={section.secondary} />
            </ListItem>
          ))}
        </List>
      </div>
    );
  },
};

/**
 * `secondaryAction` holds a control of its own. It sits outside the row's button
 * so it stays focusable and clickable — nesting a switch inside a button would
 * make it neither.
 */
export const WithSecondaryActions: Story = {
  name: "With secondary actions",
  render: () => {
    const [email, setEmail] = useState(true);
    const [push, setPush] = useState(false);
    return (
      <div style={surface}>
        <List subheader="Notifications">
          <ListItem
            secondaryAction={
              <Switch
                checked={email}
                onChange={() => setEmail((on) => !on)}
                aria-label="Email digest"
              />
            }
          >
            <ListItemText primary="Email digest" secondary="Once a week, on Mondays" />
          </ListItem>
          <ListItem
            secondaryAction={
              <Switch
                checked={push}
                onChange={() => setPush((on) => !on)}
                aria-label="Push alerts"
              />
            }
          >
            <ListItemText primary="Push alerts" secondary="Mentions and direct messages" />
          </ListItem>
          <ListItem
            button
            startIcon={<Glyph svg={iconFolder} />}
            secondaryAction={<Badge badgeContent={12} />}
          >
            <ListItemText primary="Archived threads" />
          </ListItem>
        </List>
      </div>
    );
  },
};

/**
 * Rows can hold whatever you put in them — `ListItemText` is a convenience for
 * the common two-line shape, not a requirement. Here the leading slot takes an
 * `Avatar` rather than an icon.
 */
export const WithAvatars: Story = {
  name: "With avatars",
  render: () => (
    <div style={surface}>
      <List subheader="Recent conversations">
        {[
          { initials: "AB", name: "Anna Berg", line: "Pushed the token rename", unread: 3 },
          {
            initials: "MK",
            name: "Marek Kovac",
            line: "Can you look at the Table specs?",
            unread: 0,
          },
          { initials: "LF", name: "Lena Ford", line: "Shipped 🎉", unread: 0 },
        ].map((row, index) => (
          <ListItem
            key={row.name}
            button
            startIcon={
              <Avatar
                initials={row.initials}
                size="sm"
                color={(["mint", "dante", "indigo"] as const)[index]}
              />
            }
            secondaryAction={row.unread > 0 ? <Badge badgeContent={row.unread} /> : undefined}
          >
            <ListItemText primary={row.name} secondary={row.line} />
          </ListItem>
        ))}
      </List>
    </div>
  ),
};

/**
 * `dense` tightens the row padding and drops the list's own gutter — for a long
 * list in a sidebar, where the outer padding is wasted space.
 */
export const Dense: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "18px", ...surface }}>
      {[false, true].map((dense) => (
        <List key={String(dense)} dense={dense} subheader={dense ? "dense" : "default"}>
          {["Overview", "Tracks", "Artwork", "Release dates"].map((label) => (
            <ListItem key={label} button dense={dense} startIcon={<Glyph svg={iconFolder} />}>
              <ListItemText primary={label} />
            </ListItem>
          ))}
        </List>
      ))}
    </div>
  ),
};

/**
 * A `disabled` row is dimmed and taken out of the tab order — the underlying
 * `<button>` carries the real `disabled` attribute, so it is not merely
 * pointer-events-none.
 */
export const DisabledRows: Story = {
  name: "Disabled rows",
  render: () => (
    <div style={surface}>
      <List subheader="Danger zone">
        <ListItem button startIcon={<Glyph svg={iconFolder} />}>
          <ListItemText primary="Duplicate project" />
        </ListItem>
        <ListItem button disabled startIcon={<Glyph svg={iconTrash} />}>
          <ListItemText primary="Delete project" secondary="Only the owner can do this" />
        </ListItem>
      </List>
    </div>
  ),
};

/**
 * `subheader` labels the group. It renders as an `li`, so the `ul` stays valid —
 * a heading dropped straight into a list would not be.
 */
export const Grouped: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "18px", ...surface }}>
      <List subheader="Workspace">
        <ListItem button startIcon={<Glyph svg={iconUser} />}>
          <ListItemText primary="Members" secondary="8 people" />
        </ListItem>
        <ListItem button startIcon={<Glyph svg={iconLock} />}>
          <ListItemText primary="Permissions" />
        </ListItem>
      </List>
      <List subheader="Account">
        <ListItem button startIcon={<Glyph svg={iconGlobe} />}>
          <ListItemText primary="Language" secondary="English (UK)" />
        </ListItem>
      </List>
    </div>
  ),
};

/**
 * `disablePadding` strips the list's gutter while keeping the row padding — use it
 * when the list is flush inside a card that already has padding of its own.
 */
export const DisablePadding: Story = {
  name: "Disable padding",
  render: () => (
    <div style={surface}>
      <List disablePadding>
        {["Overview", "Tracks", "Artwork"].map((label) => (
          <ListItem key={label} button>
            <ListItemText primary={label} />
          </ListItem>
        ))}
      </List>
    </div>
  ),
};
