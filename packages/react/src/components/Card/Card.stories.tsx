import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { iconMoreHorizontal } from "@okryshto/icons";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";
import { Card, CardActions, CardContent, CardHeader, CardMedia } from "./Card";
import { IconButton } from "../IconButton/IconButton";
import oleksiiInParis from "../Photo/assets/oleksii-paris.jpg";

/**
 * A surface that groups one thing: a release, a member, a setting. It is composed,
 * not configured — `CardHeader`, `CardMedia`, `CardContent`, and `CardActions`
 * each own their padding, and you use the ones you need in the order you need
 * them.
 *
 * `interactive` is for cards where the whole surface is the target: it adds the
 * cursor, the hover lift, and the shadow. It does not make the card focusable or
 * clickable — put a real link or button inside, or wrap the card in one. A div
 * that only *looks* tappable is worse than one that doesn't.
 */
const meta: Meta<typeof Card> = {
  title: "Media/Card",
  component: Card,
  args: {
    variant: "solid",
    padding: "md",
    color: "primary",
    interactive: false,
    raised: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["solid", "raised", "glass", "outline", "aura"] },
    padding: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
    color: { control: "inline-radio", options: ["primary", "dante", "indigo"] },
    interactive: { control: "boolean" },
    raised: { control: "boolean" },
    children: { control: false },
  },
  render: (args) => (
    <div style={{ width: "340px", ...surface }}>
      <Card {...args}>
        <CardHeader
          avatar={<Avatar initials="OK" size="sm" />}
          title="Night drive vol. 2"
          subheader="Released 14 March"
          action={
            <IconButton variant="ghost" aria-label="More options">
              <Glyph svg={iconMoreHorizontal} />
            </IconButton>
          }
        />
        <CardContent>Eleven tracks recorded between Kyiv and Lisbon over the winter.</CardContent>
        <CardActions>
          <Button size="small">Play</Button>
          <Button size="small" variant="ghost">
            Share
          </Button>
        </CardActions>
      </Card>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Card>;

const surface: CSSProperties = {
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

const row: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  gap: "18px",
  ...surface,
};

const caption: CSSProperties = {
  margin: 0,
  fontSize: "var(--okryshto-font-size-sm)",
  color: "var(--okryshto-text-muted)",
};

const Glyph = ({ svg }: { svg: string }) => <span dangerouslySetInnerHTML={{ __html: svg }} />;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The full stack, in the order the slots are meant to appear: media, header,
 * content, actions. `CardMedia` bleeds to the card's edges because the card clips
 * its own corners — it takes no padding of its own.
 */
export const ReleaseCard: Story = {
  name: "Release card",
  render: () => (
    <div style={{ width: "340px", ...surface }}>
      <Card>
        <CardMedia src={oleksiiInParis} alt="" height={180} />
        <CardHeader
          avatar={<Avatar initials="OK" size="sm" />}
          title="Night drive vol. 2"
          subheader="Released 14 March · 11 tracks"
        />
        <CardContent>
          Recorded between Kyiv and Lisbon over the winter, mixed on a pair of speakers that have
          seen better decades.
        </CardContent>
        <CardActions>
          <Button size="small">Play</Button>
          <Button size="small" variant="ghost">
            Add to library
          </Button>
        </CardActions>
      </Card>
    </div>
  ),
};

/**
 * Five surfaces. `solid` is the default page card; `raised` lifts it with a
 * shadow; `glass` is for cards over imagery; `outline` gives a border and no fill;
 * `aura` adds an accent glow, and is the only variant `color` applies to.
 */
export const Variants: Story = {
  render: () => (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(3, 240px)", gap: "18px", ...surface }}
    >
      {(["solid", "raised", "glass", "outline", "aura"] as const).map((variant) => (
        <Card key={variant} variant={variant}>
          <CardHeader title={variant} subheader="Surface treatment" />
          <CardContent>
            The same content on every surface, so the difference is the surface.
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

/**
 * `color` tints the `aura` glow and its border, and does nothing anywhere else —
 * it is a property of that one treatment, not a card-wide accent.
 */
export const AuraColors: Story = {
  name: "Aura colors",
  render: () => (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(3, 240px)", gap: "18px", ...surface }}
    >
      {(["primary", "dante", "indigo"] as const).map((color) => (
        <Card key={color} variant="aura" color={color}>
          <CardHeader title={color} subheader="aura" />
          <CardContent>The glow and the border pick up the tone.</CardContent>
        </Card>
      ))}
    </div>
  ),
};

/**
 * Hover the cards below. `interactive` lifts the card, deepens the border, and
 * adds a shadow — and the whole surface is wrapped in a link, which is what makes
 * it actually reachable by keyboard.
 */
export const Interactive: Story = {
  render: () => (
    <div style={row}>
      {[
        { title: "Static card", interactive: false },
        { title: "Interactive card", interactive: true },
      ].map((item) => (
        <a
          key={item.title}
          href="#release"
          style={{
            width: "240px",
            textDecoration: "none",
            borderRadius: "1.25rem",
            display: "block",
          }}
        >
          <Card interactive={item.interactive}>
            <CardHeader title={item.title} subheader="Hover me" />
            <CardContent>{item.interactive ? "Lifts on hover." : "Stays put."}</CardContent>
          </Card>
        </a>
      ))}
    </div>
  ),
};

/**
 * `padding` scales the inset used by the header, the content, and the actions
 * together. `none` is for cards that are entirely media, or that hold a component
 * bringing its own padding — a `List`, say.
 */
export const Padding: Story = {
  render: () => (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(4, 200px)", gap: "18px", ...surface }}
    >
      {(["none", "sm", "md", "lg"] as const).map((padding) => (
        <div key={padding} style={{ display: "grid", gap: "8px" }}>
          <Card padding={padding}>
            <CardHeader title="Night drive" subheader="vol. 2" />
            <CardContent>Padding: {padding}.</CardContent>
          </Card>
          <p style={caption}>{padding}</p>
        </div>
      ))}
    </div>
  ),
};

/**
 * `CardHeader` has four slots and any of them can be left out. `action` is pinned
 * to the trailing edge, so a header without a subheader still lines up.
 */
export const HeaderSlots: Story = {
  name: "Header slots",
  render: () => (
    <div style={{ display: "grid", gap: "18px", width: "340px", ...surface }}>
      <Card>
        <CardHeader title="Title only" />
      </Card>
      <Card>
        <CardHeader title="Title and subheader" subheader="Released 14 March" />
      </Card>
      <Card>
        <CardHeader
          avatar={<Avatar initials="OK" size="sm" />}
          title="With an avatar"
          subheader="Oleksii Kryshtopa"
        />
      </Card>
      <Card>
        <CardHeader
          title="With an action"
          subheader="The action is pinned right"
          action={
            <IconButton variant="ghost" aria-label="More options">
              <Glyph svg={iconMoreHorizontal} />
            </IconButton>
          }
        />
      </Card>
    </div>
  ),
};

/**
 * `CardMedia` takes a pixel number or any CSS length for `height`, and always
 * crops to `cover`. Its `alt` defaults to empty — the image is decoration next to
 * the title. Give it a real `alt` only when it carries information the text does
 * not.
 */
export const Media: Story = {
  render: () => (
    <div style={row}>
      {[120, 180, 240].map((height) => (
        <Card key={height} padding="sm" style={{ width: "220px" }}>
          <CardMedia src={oleksiiInParis} alt="" height={height} />
          <CardContent>height={height}</CardContent>
        </Card>
      ))}
    </div>
  ),
};
