import type { Meta, StoryObj } from "@storybook/react";
import { iconHeart, iconSearch, iconStar } from "@okryshto/icons";
import { useState } from "react";
import { Icon, ICON_NAMES, type IconName } from "./Icon";

/**
 * Renders any glyph from `@okryshto/icons`. Pick one by `name` for autocomplete over the
 * whole set, or hand it markup you already imported via `icon` — the two are mutually
 * exclusive and TypeScript will say so.
 *
 * The icon paints with `currentColor`, so inside a Button, a link, or a Typography block
 * it simply inherits the text colour; reach for `color` only when it should stand apart.
 */
const meta: Meta<typeof Icon> = {
  title: "Data/Icon",
  component: Icon,
  args: {
    name: "iconStar",
  },
  argTypes: {
    name: { control: "select", options: ICON_NAMES },
    icon: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Icon>;

/**
 * This example shows the default state: medium size, inheriting the text colour,
 * and hidden from assistive tech as decoration.
 */
export const Default: Story = {};

/**
 * Passing markup directly keeps the bundle to the one icon you imported — the
 * preferred form in application code.
 */
export const FromImportedMarkup: Story = {
  args: { name: undefined, icon: iconHeart },
};

/**
 * `fontSize` matches IconButton's glyph scale, so the two line up side by side.
 * `"inherit"` tracks the surrounding font size instead.
 */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <Icon {...args} fontSize="small" />
      <Icon {...args} fontSize="medium" />
      <Icon {...args} fontSize="large" />
      <span style={{ fontSize: "2.5rem" }}>
        <Icon {...args} fontSize="inherit" />
      </span>
    </div>
  ),
};

/**
 * Accent and feedback tones. The default, `"inherit"`, is the one to reach for
 * most of the time.
 */
export const Colors: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
      {(["inherit", "primary", "dante", "indigo", "violet", "ember", "ice"] as const).map(
        (color) => (
          <Icon key={color} {...args} color={color} titleAccess={color} />
        ),
      )}
      {(["success", "warning", "danger", "muted"] as const).map((color) => (
        <Icon key={color} {...args} color={color} titleAccess={color} />
      ))}
    </div>
  ),
};

/**
 * With `titleAccess` the icon is exposed as an image with a name. Use it whenever
 * the glyph is the only thing carrying the meaning.
 */
export const WithLabel: Story = {
  args: { name: "iconSearch", titleAccess: "Search" },
};

/**
 * A live picker over the full set — the same union TypeScript autocompletes at
 * the call site.
 */
export const Picker: Story = {
  render: () => {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<IconName>("iconSearch");
    const matches = ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(query.toLowerCase()),
    ).slice(0, 48);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "34rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Icon icon={iconSearch} fontSize="small" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter icons…"
            style={{ flex: 1, padding: "0.5rem 0.75rem" }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {matches.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSelected(name)}
              title={name}
              style={{
                display: "grid",
                placeItems: "center",
                width: "2.5rem",
                height: "2.5rem",
                cursor: "pointer",
              }}
            >
              <Icon name={name} color={name === selected ? "primary" : "inherit"} />
            </button>
          ))}
        </div>

        <code>{`<Icon name="${selected}" />`}</code>
      </div>
    );
  },
};

/**
 * Inline with text the icon inherits both colour and — with `fontSize="inherit"` —
 * the surrounding size.
 */
export const InlineWithText: Story = {
  render: () => (
    <p style={{ maxWidth: "30rem" }}>
      Starred items <Icon icon={iconStar} fontSize="inherit" /> stay pinned to the top of the list.
    </p>
  ),
};
