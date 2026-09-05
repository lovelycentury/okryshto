import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Photo } from "./Photo";
import oleksiiInParis from "./assets/oleksii-paris.jpg";

/**
 * A portrait or a hero cutout on a dark surface — a framed photo, not a generic
 * `<img>`. For icons and logos use SVG; for a photo inside a card, `CardMedia`.
 *
 * `alt` is required, and it is required even when there is no image: with `image`
 * omitted or broken the frame falls back to a silhouette that is exposed as an
 * image named by that same `alt`, so the slot never becomes an unlabelled blank.
 *
 * The treatment prop is `variant`, not `style` — `style` is the DOM's, and this
 * component passes it through like every other one here.
 */
const meta: Meta<typeof Photo> = {
  title: "Media/Photo",
  component: Photo,
  args: {
    alt: "Oleksii in Paris",
    image: oleksiiInParis,
    variant: "plain",
    size: "md",
    radius: "xl",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["plain", "framed", "scrim", "noir", "cutout"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    radius: { control: "inline-radio", options: ["none", "sm", "md", "lg", "xl"] },
    scrim: { control: "boolean" },
    transparent: { control: "boolean" },
    loading: { control: "boolean" },
    caption: { control: "text" },
    fallback: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <Photo {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Photo>;

const surface: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-end",
  gap: "24px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const caption: CSSProperties = {
  margin: 0,
  fontSize: "var(--okkly-font-size-sm)",
  color: "var(--okkly-text-muted)",
};

const Labelled = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: "grid", gap: "10px", justifyItems: "center" }}>
    {children}
    <p style={caption}>{label}</p>
  </div>
);

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The five treatments. `plain` is the frame alone; `framed` insets a hard border;
 * `scrim` darkens the bottom for text; `noir` closes in from three sides for a
 * dramatic crop; `cutout` throws the frame away entirely, for a transparent PNG
 * that should sit directly on the page.
 */
export const Variants: Story = {
  render: () => (
    <div style={surface}>
      {(["plain", "framed", "scrim", "noir", "cutout"] as const).map((variant) => (
        <Labelled key={variant} label={variant}>
          <Photo image={oleksiiInParis} alt="Oleksii in Paris" variant={variant} size="sm" />
        </Labelled>
      ))}
    </div>
  ),
};

/**
 * A `caption` sits over the bottom of the frame, and brings the scrim with it —
 * light text laid straight onto an unknown photo is a coin toss, so the gradient
 * is not optional here even on `plain`.
 */
export const WithACaption: Story = {
  name: "With a caption",
  render: () => (
    <div style={surface}>
      <Labelled label="plain + caption">
        <Photo
          image={oleksiiInParis}
          alt="Oleksii Kryshtopa"
          caption="Oleksii Kryshtopa"
          size="sm"
        />
      </Labelled>
      <Labelled label="scrim + caption">
        <Photo
          image={oleksiiInParis}
          alt="Oleksii Kryshtopa"
          variant="scrim"
          caption="Oleksii Kryshtopa"
          size="sm"
        />
      </Labelled>
      <Labelled label="noir + caption">
        <Photo
          image={oleksiiInParis}
          alt="Oleksii Kryshtopa"
          variant="noir"
          caption="Oleksii Kryshtopa"
          size="sm"
        />
      </Labelled>
    </div>
  ),
};

/**
 * A row of team portraits — the shape this component was cut for. One size, one
 * treatment, captions carrying the names.
 */
export const AProfileRow: Story = {
  name: "A profile row",
  render: () => (
    <div style={surface}>
      {[
        { name: "Oleksii Kryshtopa", image: oleksiiInParis },
        { name: "Anna Berg", image: undefined },
        { name: "Marek Kovac", image: undefined },
      ].map((person) => (
        <Photo
          key={person.name}
          image={person.image}
          alt={person.name}
          variant="scrim"
          caption={person.name}
          size="sm"
        />
      ))}
    </div>
  ),
};

/**
 * No `image`, or an image that fails to load, leaves the silhouette. It is
 * exposed as an image named by `alt`, so the layout keeps its shape and the slot
 * keeps its name.
 */
export const Placeholders: Story = {
  render: () => (
    <div style={surface}>
      <Labelled label="no image">
        <Photo alt="Portrait not provided" size="sm" />
      </Labelled>
      <Labelled label="broken src → silhouette">
        <Photo image="/does-not-exist.jpg" alt="Anna Berg" size="sm" />
      </Labelled>
      <Labelled label="custom fallback">
        <Photo
          alt="Anna Berg"
          size="sm"
          fallback={
            <span
              style={{ fontSize: "40px", fontWeight: 600, color: "var(--okkly-accent-primary)" }}
            >
              AB
            </span>
          }
        />
      </Labelled>
    </div>
  ),
};

/**
 * `loading` opts into a pulsing skeleton until the image reports back. Leave it
 * off and the image simply draws when it arrives — the frame already reserves the
 * space either way, so nothing reflows.
 */
export const Loading: Story = {
  render: () => (
    <div style={surface}>
      <Labelled label="loading">
        <Photo
          image={`${oleksiiInParis}?cache-bust=${Date.now()}`}
          alt="Oleksii in Paris"
          loading
          size="sm"
        />
      </Labelled>
      <Labelled label="no skeleton">
        <Photo image={oleksiiInParis} alt="Oleksii in Paris" size="sm" />
      </Labelled>
    </div>
  ),
};

/**
 * Three fixed portrait sizes, all at the same 3:4 ratio. The frame crops to
 * `cover`, so a landscape source is centre-cropped rather than letterboxed.
 */
export const Sizes: Story = {
  render: () => (
    <div style={surface}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Labelled key={size} label={size}>
          <Photo image={oleksiiInParis} alt="Oleksii in Paris" size={size} />
        </Labelled>
      ))}
    </div>
  ),
};

/**
 * `radius` runs from square to the default `xl`. It is ignored on `cutout`, which
 * has no frame to round.
 */
export const Radius: Story = {
  render: () => (
    <div style={surface}>
      {(["none", "sm", "md", "lg", "xl"] as const).map((radius) => (
        <Labelled key={radius} label={radius}>
          <Photo image={oleksiiInParis} alt="Oleksii in Paris" radius={radius} size="sm" />
        </Labelled>
      ))}
    </div>
  ),
};
