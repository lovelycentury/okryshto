import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { iconChevronRight, iconFolder, iconHome } from "@okryshto/icons";
import { Breadcrumbs } from "./Breadcrumbs";

const icon = (svg: string) => <span dangerouslySetInnerHTML={{ __html: svg }} />;

/**
 * Trail of parent pages ending at the current location. Crumbs come from an
 * `items` array; the last one is always rendered as the current page, never as
 * a link, and carries `aria-current="page"`.
 */
const meta: Meta<typeof Breadcrumbs> = {
  title: "Navigation/Breadcrumbs",
  component: Breadcrumbs,
  args: {
    items: [
      { label: "Home", href: "/", icon: icon(iconHome) },
      { label: "Projects", href: "/projects" },
      { label: "Orbit", href: "/projects/orbit" },
      { label: "Settings" },
    ],
    maxItems: 8,
    itemsBeforeCollapse: 1,
    itemsAfterCollapse: 1,
  },
  argTypes: {
    items: { control: false },
    separator: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <Breadcrumbs {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

const surface: CSSProperties = {
  background: "var(--okryshto-bg-surface-raised)",
  border: "1px solid var(--okryshto-border-subtle)",
  borderRadius: "12px",
  padding: "14px 16px",
  width: "560px",
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The page header of a project section — home icon on the root crumb, current
 * page last.
 */
export const PageHeader: Story = {
  render: () => (
    <div style={{ ...surface, display: "grid", gap: "10px" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/", icon: icon(iconHome) },
          { label: "Projects", href: "/projects" },
          { label: "Orbit", href: "/projects/orbit" },
          { label: "Deployments" },
        ]}
      />
      <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 500 }}>Deployments</h2>
    </div>
  ),
};

/**
 * A file path is the other common use — swap the separator for a slash and put
 * a folder glyph on the crumbs.
 */
export const FilePath: Story = {
  render: () => (
    <div style={surface}>
      <Breadcrumbs
        separator="/"
        items={[
          { label: "packages", href: "#", icon: icon(iconFolder) },
          { label: "design-system", href: "#" },
          { label: "components", href: "#" },
          { label: "Breadcrumbs.scss" },
        ]}
      />
    </div>
  ),
};

/**
 * Deep trees collapse behind a "…" once the crumb count passes `maxItems`.
 * Clicking it expands the full path in place.
 */
export const Collapsed: Story = {
  name: "Collapsed (maxItems)",
  render: () => (
    <div style={surface}>
      <Breadcrumbs
        maxItems={4}
        itemsBeforeCollapse={1}
        itemsAfterCollapse={2}
        items={[
          { label: "Home", href: "/", icon: icon(iconHome) },
          { label: "Workspace", href: "#" },
          { label: "Projects", href: "#" },
          { label: "Orbit", href: "#" },
          { label: "Services", href: "#" },
          { label: "API gateway", href: "#" },
          { label: "Environment variables" },
        ]}
      />
    </div>
  ),
};

/**
 * A custom separator node — anything renderable works, here the chevron from
 * `@okryshto/icons` at a smaller size.
 */
export const CustomSeparator: Story = {
  render: () => (
    <div style={{ ...surface, display: "grid", gap: "14px" }}>
      <Breadcrumbs
        separator="›"
        items={[
          { label: "Docs", href: "#" },
          { label: "Components", href: "#" },
          { label: "Breadcrumbs" },
        ]}
      />
      <Breadcrumbs
        separator={
          <span style={{ width: "14px", display: "inline-flex" }}>{icon(iconChevronRight)}</span>
        }
        items={[
          { label: "Docs", href: "#" },
          { label: "Components", href: "#" },
          { label: "Breadcrumbs" },
        ]}
      />
    </div>
  ),
};

/**
 * A single crumb still renders as the current page — useful for top-level
 * screens where the header is shared.
 */
export const SingleCrumb: Story = {
  render: () => (
    <div style={surface}>
      <Breadcrumbs items={[{ label: "Home", icon: icon(iconHome) }]} />
    </div>
  ),
};
