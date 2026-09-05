import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { iconSearch, iconUpload } from "@okkly/icons";
import { Button } from "../Button/Button";
import { EmptyState } from "./EmptyState";

/**
 * The panel that stands in for a list with nothing in it. Say *why* it's empty
 * and give the user the one thing to do next — "No results" alone leaves them
 * stuck, "No results for *rain* — try a shorter query" doesn't.
 *
 * There are three distinct empties and they want different copy: nothing created
 * yet (offer the create action), nothing matching a filter (offer to clear it),
 * and nothing loaded because something broke (offer a retry, with
 * `color="danger"`).
 */
const meta: Meta<typeof EmptyState> = {
  title: "Feedback/EmptyState",
  component: EmptyState,
  args: {
    title: "No projects yet",
    description: "Projects you create or get invited to will show up here.",
    color: "primary",
    size: "medium",
  },
  argTypes: {
    color: { control: "inline-radio", options: ["primary", "dante", "indigo", "danger"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    severity: {
      control: "select",
      options: ["success", "info", "warning", "danger", "primary", "neutral"],
    },
    icon: { control: false },
    action: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <EmptyState {...args} action={<Button size="small">New project</Button>} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

const surface: CSSProperties = {
  width: "480px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const Glyph = ({ svg }: { svg: string }) => <span dangerouslySetInnerHTML={{ __html: svg }} />;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * Nothing created yet. The action is the whole point of the panel, so it is a
 * primary button and it says exactly what it will make.
 */
export const FirstRun: Story = {
  name: "Nothing created yet",
  render: () => (
    <div style={surface}>
      <EmptyState
        title="Create your first project"
        description="A project holds your tracks, artwork, and release dates in one place."
        icon={<Glyph svg={iconUpload} />}
        action={
          <>
            <Button size="small">New project</Button>
            <Button size="small" variant="ghost">
              Import from Drive
            </Button>
          </>
        }
      />
    </div>
  ),
};

/**
 * Nothing matched the filter. The query is echoed back so the user can see what
 * was actually searched for, and the action clears it rather than repeating it.
 */
export const NoResults: Story = {
  name: "No results",
  render: () => (
    <div style={surface}>
      <EmptyState
        color="indigo"
        title="No tracks match “rain”"
        description="Try a shorter query, or clear the genre filter to search everything."
        icon={<Glyph svg={iconSearch} />}
        action={
          <Button size="small" variant="soft">
            Clear filters
          </Button>
        }
      />
    </div>
  ),
};

/**
 * The load failed. `color="danger"` and a `danger` severity mark it as a fault
 * rather than an absence — the data may well exist.
 */
export const LoadFailed: Story = {
  name: "Load failed",
  render: () => (
    <div style={surface}>
      <EmptyState
        color="danger"
        severity="danger"
        title="Couldn't load your projects"
        description="The request timed out after 30 seconds. Your work is safe."
        action={
          <Button size="small" variant="soft">
            Try again
          </Button>
        }
      />
    </div>
  ),
};

/**
 * `size` scales the padding, the title, and the halo together. `small` fits
 * inside a sidebar or a card; `large` owns a full page.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "18px", ...surface }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <EmptyState
          key={size}
          size={size}
          title={`No projects yet (${size})`}
          description="Projects you create or get invited to will show up here."
          action={<Button size="small">New project</Button>}
        />
      ))}
    </div>
  ),
};

/**
 * `color` tints the halo and the default icon. Pick it to match what the empty
 * means, not to decorate: mint for a fresh start, indigo for a filtered view,
 * danger for a failure.
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "18px", ...surface }}>
      {(["primary", "dante", "indigo", "danger"] as const).map((color) => (
        <EmptyState
          key={color}
          color={color}
          size="small"
          title={color}
          description={`Halo and icon in the ${color} tone.`}
        />
      ))}
    </div>
  ),
};

/**
 * Without an `action` the panel is purely informational — right for a read-only
 * view where the user has nothing to do about the emptiness.
 */
export const WithoutAction: Story = {
  name: "Without an action",
  render: () => (
    <div style={surface}>
      <EmptyState
        title="No activity this week"
        description="Plays, saves, and comments from the last seven days appear here."
      />
    </div>
  ),
};

/**
 * `severity` picks the glyph and `color` picks the tone — they are separate
 * knobs, so a cross in mint is a legal (if odd) combination. Match them unless
 * you mean not to.
 */
export const GlyphAndTone: Story = {
  name: "Glyph and tone",
  render: () => (
    <div style={{ display: "grid", gap: "18px", ...surface }}>
      <EmptyState size="small" severity="warning" color="dante" title="warning glyph, dante tone" />
      <EmptyState size="small" severity="danger" color="danger" title="danger glyph, danger tone" />
    </div>
  ),
};
