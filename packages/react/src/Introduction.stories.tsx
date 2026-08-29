import { useMemo, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import * as Icons from "@okryshto/icons";
import { getIconImportName, ICON_METADATA } from "@okryshto/icons/utils";
import { iconPlus, iconSearch, iconStar } from "@okryshto/icons";
import {
  BrandDocsHeader,
  BrandDocsPage,
  BrandDocsSection,
  Card,
  CardRack,
  Code,
  CodeBlock,
  ColorSwatch,
  Contents,
  DoDontCard,
  PillRow,
  Prose,
  TokenGuide,
  TypeRow,
} from "./brand/BrandDocs";

import { Logo } from "./components/Logo/Logo";
import { AnimatedLogo } from "./components/AnimatedLogo/AnimatedLogo";

import { Button } from "./components/Button/Button";
import { ButtonGroup } from "./components/ButtonGroup/ButtonGroup";
import { IconButton } from "./components/IconButton/IconButton";
import { Fab } from "./components/FAB/FAB";
import { TextField } from "./components/TextField/TextField";
import { TextArea } from "./components/TextArea/TextArea";
import { NumberInput } from "./components/NumberInput/NumberInput";
import { Checkbox } from "./components/Checkbox/Checkbox";
import { CheckboxGroup } from "./components/CheckboxGroup/CheckboxGroup";
import { Radio } from "./components/Radio/Radio";
import { RadioGroup } from "./components/RadioGroup/RadioGroup";
import { Switch } from "./components/Switch/Switch";
import { Chip } from "./components/Chip/Chip";
import { ChipGroup } from "./components/ChipGroup/ChipGroup";
import { Slider } from "./components/Slider/Slider";
import { Rating } from "./components/Rating/Rating";
import { SegmentedToggle } from "./components/SegmentedToggle/SegmentedToggle";
import { Select } from "./components/Select/Select";
import { Autocomplete } from "./components/Autocomplete/Autocomplete";
import { InlineAction } from "./components/InlineAction/InlineAction";
import { DateField } from "./components/DateField/DateField";
import { TimeField } from "./components/TimeField/TimeField";
import { DateTimeField } from "./components/DateTimeField/DateTimeField";
import { FileUpload } from "./components/FileUpload/FileUpload";
import { RichEditor } from "./components/RichEditor/RichEditor";

import { Tabs } from "./components/Tabs/Tabs";
import { Breadcrumbs } from "./components/Breadcrumbs/Breadcrumbs";
import { Pagination } from "./components/Pagination/Pagination";
import { Stepper } from "./components/Stepper/Stepper";
import { Accordion, AccordionDetails, AccordionSummary } from "./components/Accordion/Accordion";

import { Alert } from "./components/Alert/Alert";
import { Badge } from "./components/Badge/Badge";
import { Spinner } from "./components/Spinner/Spinner";
import { Progress } from "./components/Progress/Progress";
import { Skeleton } from "./components/Skeleton/Skeleton";
import { SeverityIcon } from "./components/SeverityIcon/SeverityIcon";
import { EmptyState } from "./components/EmptyState/EmptyState";

import { Tooltip } from "./components/Tooltip/Tooltip";
import {
  Dialog,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "./components/Dialog/Dialog";
import { Drawer } from "./components/Drawer/Drawer";
import { Modal } from "./components/Modal/Modal";

import { Avatar } from "./components/Avatar/Avatar";
import { AvatarGroup } from "./components/AvatarGroup/AvatarGroup";
import { Divider } from "./components/Divider/Divider";
import { List, ListItem, ListItemText } from "./components/List/List";
import { StatCard } from "./components/StatCard/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "./components/Table/Table";

import { Card as SurfaceCard, CardContent, CardHeader } from "./components/Card/Card";
import { LinkCard } from "./components/LinkCard/LinkCard";
import { ProjectCard } from "./components/ProjectCard/ProjectCard";
import { Photo } from "./components/Photo/Photo";

import { Fade } from "./components/Fade/Fade";
import { Grow } from "./components/Grow/Grow";
import { Zoom } from "./components/Zoom/Zoom";

/**
 * The whole brand book, in one file: overview, colour, type/space/elevation,
 * usage guidelines, the icon catalogue, and a live index of every component.
 *
 * They are separate exports rather than one enormous page because the icon
 * catalogue alone renders 160-odd tiles and the showcase mounts every component
 * in the library — putting them in a single story would make the first section
 * wait on all of them. One file, several entries in the sidebar.
 */
const meta: Meta = {
  tags: ["!autodocs"],
  title: "Introduction",
  parameters: {
    layout: "fullscreen",
    brandDocs: true,
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

const icon = (svg: string) => <span dangerouslySetInnerHTML={{ __html: svg }} />;

/* ------------------------------------------------------------------ Overview */

const contents = [
  {
    name: "Overview",
    desc: "What Okryshto is, the packages, install, and the conventions every component follows.",
  },
  {
    name: "Color",
    desc: "Background, text, accent, border, glass and feedback tokens with their intended roles.",
  },
  {
    name: "Type, space, elevation",
    desc: "The structural scales — type ramp, spacing, radii, shadow.",
  },
  { name: "Guidelines", desc: "Do and don't for colour, type, spacing, radii and motion." },
  {
    name: "Icon set",
    desc: "Searchable catalogue of the stroke icons shipped in @okryshto/icons.",
  },
  {
    name: "Component showcase",
    desc: "Every public component rendered live, grouped by category.",
  },
];

const packages = [
  {
    name: "@okryshto/react",
    desc: "The React component library — everything in the showcase below",
  },
  {
    name: "@okryshto/design-system",
    desc: "SCSS: tokens, reset, and one stylesheet per component",
  },
  {
    name: "@okryshto/react-hooks",
    desc: "Headless behaviour — the logic components are built on, usable alone",
  },
  {
    name: "@okryshto/icons",
    desc: "Stroke icons as SVG string constants, plus metadata for search",
  },
];

const componentIndex = [
  {
    category: "Control",
    items: [
      "Autocomplete",
      "Button",
      "ButtonGroup",
      "Calendar",
      "Checkbox",
      "CheckboxGroup",
      "Chip",
      "ChipGroup",
      "DateField",
      "DateTimeField",
      "DateTimePicker",
      "FAB",
      "Field",
      "FileUpload",
      "IconButton",
      "InlineAction",
      "NumberInput",
      "Radio",
      "RadioGroup",
      "Rating",
      "RichEditor",
      "SegmentedToggle",
      "Select",
      "Slider",
      "Switch",
      "TextArea",
      "TextField",
      "TimeField",
      "TimePicker",
    ],
  },
  {
    category: "Navigation",
    items: ["Accordion", "Breadcrumbs", "Pagination", "Stepper", "Tabs"],
  },
  {
    category: "Feedback",
    items: [
      "Alert",
      "Badge",
      "EmptyState",
      "Progress",
      "SeverityIcon",
      "Skeleton",
      "Snackbar",
      "Spinner",
    ],
  },
  { category: "Overlays", items: ["Dialog", "Drawer", "Modal", "Popover", "Popper", "Tooltip"] },
  { category: "Data", items: ["Avatar", "AvatarGroup", "Divider", "List", "StatCard", "Table"] },
  { category: "Media", items: ["AnimatedBackground", "Card", "LinkCard", "Photo", "ProjectCard"] },
  { category: "Transitions", items: ["Collapse", "Fade", "Grow", "Ripple", "Slide", "Zoom"] },
  { category: "Brand", items: ["Logo", "AnimatedLogo"] },
];

const hooks = [
  { name: "useSelect", desc: "Listbox state — open, highlight, selection, keyboard" },
  { name: "useAutocomplete", desc: "Filtering, tags, freeSolo, grouping on top of the same model" },
  { name: "useSlider", desc: "Range maths — clamp, step, multi-thumb, orientation" },
  { name: "useFileUpload", desc: "Drag-and-drop, size and type validation" },
  { name: "useDisclosure", desc: "Controlled/uncontrolled open state" },
  { name: "useControllableState", desc: "The prop-or-state resolver behind every component" },
  { name: "useRipple", desc: "Pointer ripple for pressable surfaces" },
  {
    name: "useEscapeKey / useClickOutside / useFocusTrap / useBodyScrollLock",
    desc: "Overlay dismissal and focus containment",
  },
  { name: "useForkRef", desc: "Merges a forwarded ref with an internal one" },
];

export const Overview: Story = {
  name: "Overview",
  render: () => (
    <BrandDocsPage>
      <BrandDocsHeader
        eyebrow="Okryshto · Design system"
        title="Introduction"
        lede="A dark-first React design system: token-driven SCSS, headless hooks, and components that behave like the platform expects."
        showRule
      />

      <BrandDocsSection title="What's in here">
        <Contents items={contents} />
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection title="The idea">
        <Prose>
          Nothing in the library hard-codes a colour, a size, or a shadow. Components read design
          tokens as CSS custom properties, so a theme is a set of variable overrides rather than a
          fork. Behaviour lives in headless hooks that ship separately, so a product with its own
          markup can take the logic without the styling — and the styling without the logic.
        </Prose>
      </BrandDocsSection>

      <BrandDocsSection title="Packages">
        <Card>
          <TokenGuide rows={packages} />
        </Card>
      </BrandDocsSection>

      <BrandDocsSection
        title="Install"
        note="The style entry is imported once, at the app's own entry point — not per component."
      >
        <CodeBlock>{`pnpm add @okryshto/react @okryshto/design-system @okryshto/icons`}</CodeBlock>
        <CodeBlock>{`// app entry
import "@okryshto/design-system/styles/index.scss";

// anywhere
import { Button, TextField } from "@okryshto/react";

export function SignIn() {
  return (
    <form>
      <TextField label="Email" placeholder="you@okryshto.dev" />
      <Button variant="primary">Continue</Button>
    </form>
  );
}`}</CodeBlock>
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection title="Conventions" note="Four rules that hold across every component.">
        <CardRack>
          <Card title="Names" subtitle="Prefixed in CSS, plain in JavaScript.">
            <Prose>
              Class names carry the <Code>okryshto-</Code> prefix so they never collide in a host
              app. Exports do not: you import <Code>Button</Code>, not <Code>OkryshtoButton</Code>.
            </Prose>
          </Card>
          <Card title="BEM" subtitle="Block, element, modifier — and nothing deeper.">
            <Prose>
              <Code>.okryshto-select__control--disabled</Code>. Default variants get no modifier at
              all, so a class list stays short and a diff shows only what was asked for.
            </Prose>
          </Card>
          <Card title="Cascade layers" subtitle="Override without a specificity fight.">
            <Prose>
              Component rules sit in <Code>@layer okryshto.component</Code>. Any unlayered rule in
              your app outranks them regardless of specificity — a single class is enough.
            </Prose>
          </Card>
          <Card title="Custom-property API" subtitle="Every component exposes its own knobs.">
            <Prose>
              Each block declares <Code>--okryshto-&lt;block&gt;-*</Code> variables for the values
              worth changing. Set one on the element, or on an ancestor to reach a whole region.
            </Prose>
          </Card>
        </CardRack>
      </BrandDocsSection>

      <BrandDocsSection
        title="Cascade layer order"
        note="Later layers win, whatever the selector specificity."
      >
        <CodeBlock>{`@layer okryshto.reset, okryshto.utility, okryshto.component, okryshto.density, okryshto.override;`}</CodeBlock>
        <Card>
          <TokenGuide
            rows={[
              {
                name: "okryshto.reset",
                desc: "Scoped normalisation — never touches the host app's body or links",
              },
              { name: "okryshto.utility", desc: "Global custom properties, durations, shadows" },
              { name: "okryshto.component", desc: "The components themselves" },
              {
                name: "okryshto.density",
                desc: "Size and density modifiers, which must beat component defaults",
              },
              { name: "okryshto.override", desc: "Reserved for the consuming app's escape hatch" },
            ]}
          />
        </Card>
      </BrandDocsSection>

      <BrandDocsSection
        title="Theming"
        note="Two levels: retune the palette globally, or adjust a single component in place."
      >
        <CodeBlock>{`/* global — retune the whole system */
:root {
  --okryshto-accent-primary: #5EE6C1;
  --okryshto-bg-canvas: #0A0A0B;
}

/* local — one component, one instance */
.checkout .okryshto-button {
  --okryshto-button-radius: 9999px;
}`}</CodeBlock>
        <Prose>
          A custom property declared on the element always beats the same property inherited from an
          ancestor. That is what lets a size modifier on one field win over a page-wide default
          without any specificity work.
        </Prose>
      </BrandDocsSection>

      <BrandDocsSection
        title="Sizing"
        note="Where a component has a scale it is the same three steps everywhere."
      >
        <PillRow items={['size="small"', 'size="medium" (default)', 'size="large"', "fullWidth"]} />
        <Prose>
          Text controls size themselves to their content with a 200px floor, so a row of fields does
          not collapse to its placeholders. Pass <Code>fullWidth</Code> when the container should
          decide instead.
        </Prose>
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection
        title="Headless hooks"
        note="@okryshto/react-hooks — the behaviour, without any markup."
      >
        <Card>
          <TokenGuide rows={hooks} />
        </Card>
      </BrandDocsSection>

      <BrandDocsSection
        title="Accessibility"
        note="What the components take care of, so you do not have to re-derive it."
      >
        <Card>
          <TokenGuide
            rows={[
              {
                name: "Roles",
                desc: "Comboboxes, listboxes and dialogs follow the WAI-ARIA patterns, including aria-activedescendant",
              },
              {
                name: "Keyboard",
                desc: "Arrows, Home/End, type-ahead, Escape to dismiss, Enter/Space to commit",
              },
              {
                name: "Focus",
                desc: "Overlays trap focus while open and return it to the trigger on close",
              },
              {
                name: "Labels",
                desc: "Every field wires label, helper text and error message through generated ids",
              },
              {
                name: "Motion",
                desc: "Transitions collapse to near-zero under prefers-reduced-motion",
              },
            ]}
          />
        </Card>
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection
        title="Component index"
        note="The full surface, by category. Open a group in the sidebar for props and variants."
      >
        {componentIndex.map((group) => (
          <div key={group.category}>
            <p className="okryshto-brand-docs__category-title">
              {group.category}{" "}
              <span className="okryshto-brand-docs__count">{group.items.length}</span>
            </p>
            <PillRow items={group.items} />
          </div>
        ))}
      </BrandDocsSection>
    </BrandDocsPage>
  ),
};

/* --------------------------------------------------------------------- Color */

const backgrounds = [
  {
    name: "bg/canvas",
    token: "--okryshto-bg-canvas",
    value: "#0A0A0B",
    note: "App background — deepest layer",
  },
  {
    name: "bg/surface",
    token: "--okryshto-bg-surface",
    value: "#0F0F12",
    note: "Cards / raised surfaces",
  },
  {
    name: "bg/surface-raised",
    token: "--okryshto-bg-surface-raised",
    value: "#16161A",
    note: "Elevated / hover surfaces",
  },
  { name: "bg/inset", token: "--okryshto-bg-inset", value: "#080809", note: "Wells, inputs, code" },
];

const textColors = [
  {
    name: "text/primary",
    token: "--okryshto-text-primary",
    value: "#F5F5F7",
    note: "Headlines & primary copy",
  },
  {
    name: "text/secondary",
    token: "--okryshto-text-secondary",
    value: "#A9A9B2",
    note: "Body / supporting copy",
  },
  {
    name: "text/muted",
    token: "--okryshto-text-muted",
    value: "#6E6E78",
    note: "Captions, metadata",
  },
  {
    name: "text/inverse",
    token: "--okryshto-bg-canvas",
    value: "#0A0A0B",
    note: "On bright accent fills",
  },
];

const accents = [
  {
    name: "accent/primary",
    token: "--okryshto-accent-primary",
    value: "#5EE6C1",
    note: "Mint — primary accent",
  },
  {
    name: "accent/secondary",
    token: "--okryshto-accent-secondary",
    value: "#818CF8",
    note: "Indigo — gradients / secondary",
  },
  {
    name: "accent/dante",
    token: "--okryshto-accent-dante",
    value: "#FF3D8B",
    note: "Dante — digital disco",
  },
  {
    name: "accent/violet",
    token: "--okryshto-accent-violet",
    value: "#B84BFF",
    note: "Violet — nebula",
  },
  {
    name: "accent/ember",
    token: "--okryshto-accent-ember",
    value: "#FF8A5C",
    note: "Ember — sunset",
  },
  { name: "accent/ice", token: "--okryshto-accent-ice", value: "#22D3EE", note: "Ice — cold cyan" },
  {
    name: "accent/contrast",
    token: "--okryshto-accent-contrast",
    value: "#04140F",
    note: "On accent fills",
  },
];

const borders = [
  {
    name: "border/subtle",
    token: "--okryshto-border-subtle",
    value: "rgba(255,255,255,0.08)",
    note: "Hairline dividers",
  },
  {
    name: "border/default",
    token: "--okryshto-border-default",
    value: "rgba(255,255,255,0.12)",
    note: "Default UI borders",
  },
  {
    name: "border/strong",
    token: "--okryshto-border-strong",
    value: "rgba(255,255,255,0.2)",
    note: "Emphatic / focus base",
  },
];

const glass = [
  {
    name: "glass/fill",
    token: "--okryshto-glass-fill",
    value: "rgba(255,255,255,0.08)",
    note: "Frosted surface fill",
  },
  {
    name: "glass/fill-strong",
    token: "--okryshto-glass-fill-strong",
    value: "rgba(255,255,255,0.12)",
    note: "Stronger glass fill",
  },
  {
    name: "glass/border",
    token: "--okryshto-glass-border",
    value: "rgba(255,255,255,0.14)",
    note: "Glass hairline border",
  },
];

const feedback = [
  {
    name: "feedback/success",
    token: "--okryshto-feedback-success",
    value: "#4ADE80",
    note: "Success states",
  },
  {
    name: "feedback/warning",
    token: "--okryshto-feedback-warning",
    value: "#FBBF24",
    note: "Warnings",
  },
  {
    name: "feedback/danger",
    token: "--okryshto-feedback-danger",
    value: "#FB7185",
    note: "Errors / destructive",
  },
];

function SwatchGrid({
  items,
}: {
  items: Array<{ name: string; token: string; value: string; note: string }>;
}) {
  return (
    <div className="okryshto-brand-docs__grid">
      {items.map((item) => (
        <ColorSwatch key={item.name} {...item} />
      ))}
    </div>
  );
}

export const Color: Story = {
  name: "Color",
  render: () => (
    <BrandDocsPage>
      <BrandDocsHeader
        eyebrow="Foundations — Palette"
        title="Color"
        lede="Every color is a design token. Grouped by role — read the note under each family before reaching for a value."
        showRule
      />

      <BrandDocsSection
        title="Backgrounds"
        note="Layering, deepest canvas → raised surfaces. Put dense content on a surface, not straight on canvas."
      >
        <SwatchGrid items={backgrounds} />
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection
        title="Text"
        note="Contrast tiers. Primary for headings & key copy, secondary for body, muted for metadata, inverse on accent."
      >
        <SwatchGrid items={textColors} />
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection
        title="Accent — Aurora"
        note="Signature brand colors. Prefer accent/primary for interactive chrome; reach for dante/violet/ember sparingly."
      >
        <SwatchGrid items={accents} />
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection title="Borders" note="Translucent separators for dark UI.">
        <SwatchGrid items={borders} />
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection title="Glass" note="Frosted material fills and borders.">
        <SwatchGrid items={glass} />
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection title="Feedback" note="Strictly for status — success, warning, danger.">
        <SwatchGrid items={feedback} />
      </BrandDocsSection>
    </BrandDocsPage>
  ),
};

/* ------------------------------------------------- Type, space and elevation */

const typeScale = [
  { label: "display/2xl", size: "72px", lineHeight: "76px", weight: "Semi Bold" },
  { label: "display/xl", size: "56px", lineHeight: "60px", weight: "Semi Bold" },
  { label: "display/lg", size: "44px", lineHeight: "50px", weight: "Semi Bold" },
  { label: "heading/h1", size: "34px", lineHeight: "42px", weight: "Semi Bold" },
  { label: "heading/h2", size: "26px", lineHeight: "34px", weight: "Medium" },
  { label: "heading/h3", size: "22px", lineHeight: "30px", weight: "Medium" },
  { label: "title/lg", size: "20px", lineHeight: "28px", weight: "Medium" },
  { label: "title/md", size: "18px", lineHeight: "26px", weight: "Medium" },
  { label: "body/lg", size: "16px", lineHeight: "26px", weight: "Regular" },
  { label: "body/md", size: "15px", lineHeight: "24px", weight: "Regular" },
  { label: "body/sm", size: "13px", lineHeight: "20px", weight: "Regular" },
  { label: "label/md", size: "12px", lineHeight: "16px", weight: "Medium" },
  { label: "label/sm", size: "11px", lineHeight: "14px", weight: "Medium" },
];

const spaces = [
  { label: "space/4", px: 4 },
  { label: "space/8", px: 8 },
  { label: "space/12", px: 12 },
  { label: "space/16", px: 16 },
  { label: "space/20", px: 20 },
  { label: "space/24", px: 24 },
  { label: "space/32", px: 32 },
  { label: "space/40", px: 40 },
  { label: "space/48", px: 48 },
  { label: "space/64", px: 64 },
  { label: "space/80", px: 80 },
  { label: "space/120", px: 120 },
];

const radii = [
  { label: "r/0", value: "0" },
  { label: "r/2", value: "2px" },
  { label: "r/4", value: "4px" },
  { label: "r/8", value: "8px" },
  { label: "r/12", value: "12px" },
  { label: "r/16", value: "16px" },
  { label: "r/20", value: "20px" },
  { label: "r/24", value: "24px" },
  { label: "r/32", value: "32px" },
  { label: "r/max", value: "9999px" },
];

const elevations = [
  { label: "elevation/xs", shadow: "var(--okryshto-shadow-medium-bottom)" },
  { label: "elevation/sm", shadow: "var(--okryshto-shadow-soft-bottom)" },
  { label: "elevation/md", shadow: "0 0.5rem 1.5rem rgba(0,0,0,0.28)" },
  { label: "elevation/lg", shadow: "0 1rem 2.5rem rgba(0,0,0,0.36)" },
];

const durations = [
  { name: "--okryshto-duration-sm", desc: "400ms — hover, focus, chips, small state flips" },
  { name: "--okryshto-duration-md", desc: "700ms — overlays entering, panels expanding" },
  { name: "--okryshto-duration-lg", desc: "1s — ambient and decorative motion only" },
];

export const TypeSpaceElevation: Story = {
  name: "Type, space, elevation",
  render: () => (
    <BrandDocsPage>
      <BrandDocsHeader
        eyebrow="Foundations — System"
        title="Type, space, elevation"
        lede="The structural tokens. Type as text styles; spacing & radii as constants; elevation & glass as effect styles."
        showRule
      />

      <BrandDocsSection
        title="Typography"
        note="Editorial modular scale — display for identity, text for reading. Families: Inter (sans), JetBrains Mono (mono)."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {typeScale.map((row) => (
            <TypeRow key={row.label} {...row} />
          ))}
        </div>
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection title="Font families" note="Three faces, three jobs.">
        <CardRack>
          <Card title="Inter" subtitle="--okryshto-font-family-sans">
            <p
              className="okryshto-brand-docs__token-desc"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Primary UI sans — body, labels, most chrome.
            </p>
          </Card>
          <Card title="Inter Tight" subtitle="display fallback → Inter">
            <p
              className="okryshto-brand-docs__token-desc"
              style={{ fontFamily: "Inter Tight, Inter, sans-serif" }}
            >
              Tighter display moments when available.
            </p>
          </Card>
          <Card title="JetBrains Mono" subtitle="--okryshto-font-family-mono">
            <p
              className="okryshto-brand-docs__token-desc"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              Code, tokens, hex, tabular metadata.
            </p>
          </Card>
        </CardRack>
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection
        title="Spacing"
        note="Linear scale used for padding, gaps, and layout rhythm."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {spaces.map((space) => (
            <div key={space.label} className="okryshto-brand-docs__space-row">
              <span className="okryshto-brand-docs__space-label">{space.label}</span>
              <div className="okryshto-brand-docs__space-bar" style={{ width: `${space.px}px` }} />
              <span className="okryshto-brand-docs__space-label">{space.px}px</span>
            </div>
          ))}
        </div>
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection title="Radii" note="Corner radii from sharp to pill.">
        <div className="okryshto-brand-docs__radius-grid">
          {radii.map((radius) => (
            <div key={radius.label} className="okryshto-brand-docs__radius-item">
              <div
                className="okryshto-brand-docs__radius-box"
                style={{ borderRadius: radius.value }}
              />
              <span className="okryshto-brand-docs__radius-label">{radius.label}</span>
            </div>
          ))}
        </div>
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection title="Elevation" note="Depth via soft shadows on raised surfaces.">
        <div className="okryshto-brand-docs__elevation-grid">
          {elevations.map((item) => (
            <div
              key={item.label}
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
              <div
                className="okryshto-brand-docs__elevation-card"
                style={{ boxShadow: item.shadow }}
              />
              <span className="okryshto-brand-docs__radius-label">{item.label}</span>
            </div>
          ))}
        </div>
      </BrandDocsSection>

      <hr className="okryshto-brand-docs__divider" />

      <BrandDocsSection title="Motion" note="Three durations, and a rule about turning them off.">
        <Card>
          <TokenGuide rows={durations} />
        </Card>
        <Prose>
          Under <Code>prefers-reduced-motion</Code> these collapse to near zero — the animation goes
          away, the end state does not.
        </Prose>
      </BrandDocsSection>
    </BrandDocsPage>
  ),
};

/* ---------------------------------------------------------------- Guidelines */

export const Guidelines: Story = {
  name: "Guidelines",
  render: () => (
    <BrandDocsPage>
      <BrandDocsHeader
        eyebrow="Foundations — Guidelines"
        title="How to use it"
        lede="Practical rules for color, type, space, and motion — so the system stays coherent as it grows."
        showRule
      />

      <BrandDocsSection title="Color">
        <DoDontCard
          title="Color — roles first"
          subtitle="Pick by role, not by hex. Accents are for emphasis, not wallpaper."
          dos={[
            "Use bg/canvas → surface → surface-raised for layering",
            "Reserve accent/primary for interactive chrome and focus",
            "Keep feedback colors for status only",
          ]}
          donts={[
            "Don't put dense content straight on canvas",
            "Don't invent one-off hex values beside tokens",
            "Don't use dante/violet/ember for every hover",
          ]}
        />
      </BrandDocsSection>

      <BrandDocsSection title="Typography — when to use each style">
        <Card>
          <TokenGuide
            rows={[
              {
                name: "display/*",
                desc: "Brand moments, hero identity, empty states with presence",
              },
              { name: "heading/*", desc: "Page and section titles" },
              { name: "title/*", desc: "Card titles, dialog headers, dense UI labels with weight" },
              { name: "body/*", desc: "Readable paragraphs and supporting copy" },
              { name: "label/*", desc: "Meta, captions, overlines, chip text" },
              { name: "mono", desc: "Code, tokens, hex values, technical metadata" },
            ]}
          />
        </Card>
      </BrandDocsSection>

      <BrandDocsSection title="Spacing & layout">
        <DoDontCard
          title="Spacing — keep the rhythm"
          subtitle="Stick to the space scale. Odd values break alignment across surfaces."
          dos={[
            "Stack with space/16–24 between related blocks",
            "Use space/8–12 inside compact controls",
            "Align to an 8px mental grid when unsure",
          ]}
          donts={[
            "Don't mix arbitrary px gaps beside the scale",
            "Don't crush interactive hit areas under 32px",
            "Don't let cards float without consistent padding",
          ]}
        />
      </BrandDocsSection>

      <BrandDocsSection title="Radii">
        <Card>
          <TokenGuide
            rows={[
              { name: "r/4–8", desc: "Inputs, chips, compact controls" },
              { name: "r/12–16", desc: "Cards, menus, popovers" },
              { name: "r/20–24", desc: "Large panels, feature tiles" },
              { name: "r/max", desc: "Pills, avatars, FAB — fully rounded" },
            ]}
          />
        </Card>
      </BrandDocsSection>

      <BrandDocsSection title="Overriding a component">
        <DoDontCard
          title="Customisation — reach for the variable first"
          subtitle="Every block exposes --okryshto-<block>-* properties. Redeclaring rules is the last resort, not the first."
          dos={[
            "Set --okryshto-<block>-* on the element or a wrapper",
            "Scope overrides to a region rather than :root when only that region changes",
            "Use the size and variant props before writing any CSS",
          ]}
          donts={[
            "Don't target __element classes from outside the design system",
            "Don't fight the cascade with !important — unlayered CSS already wins",
            "Don't copy a component's SCSS to change one value",
          ]}
        />
      </BrandDocsSection>

      <BrandDocsSection title="Shadows & motion">
        <Card>
          <TokenGuide
            rows={[
              { name: "elevation/*", desc: "Raise surfaces; prefer soft shadows on dark canvas" },
              {
                name: "duration-sm",
                desc: "Micro interactions — hover, focus, chips (~400ms token)",
              },
              {
                name: "Grow / Fade",
                desc: "Overlay enter/exit — Popover uses Grow, Popper stays instant",
              },
              {
                name: "reduced-motion",
                desc: "Collapse transition duration near 0 when prefers-reduced-motion",
              },
            ]}
          />
        </Card>
      </BrandDocsSection>

      <BrandDocsSection title="Accessibility">
        <DoDontCard
          title="Accessibility — keep what the components give you"
          subtitle="The patterns are already wired. Most breakage comes from working around them."
          dos={[
            "Give every field a label, even when the design shows only a placeholder",
            "Let overlays manage their own focus trap and restore",
            "Keep hit areas at 32px or more",
          ]}
          donts={[
            "Don't nest interactive elements inside a button or an option",
            "Don't remove focus rings — retune --okryshto-outline-width instead",
            "Don't convey status by color alone; pair it with an icon or text",
          ]}
        />
      </BrandDocsSection>
    </BrandDocsPage>
  ),
};

/* ------------------------------------------------------------------ Icon set */

type IconEntry = {
  name: string;
  importName: string;
  category: string;
  aliases: string[];
  svg: string;
};

function buildCatalog(): IconEntry[] {
  return Object.entries(ICON_METADATA)
    .map(([name, iconMeta]) => {
      const importName = getIconImportName(name);
      const svg = (Icons as Record<string, string>)[importName];
      if (!svg) return null;
      return {
        name,
        importName,
        category: iconMeta.category,
        aliases: iconMeta.aliases ?? [],
        svg,
      };
    })
    .filter((entry): entry is IconEntry => entry != null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

const CATALOG = buildCatalog();

function IconsExplorer() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.filter((entry) => {
      const haystack = [entry.name, entry.importName, entry.category, ...entry.aliases]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  const grouped = useMemo(() => {
    const map: Record<string, IconEntry[]> = {};
    for (const entry of filtered) {
      (map[entry.category] ??= []).push(entry);
    }
    return Object.keys(map)
      .sort()
      .map((category) => ({ category, icons: map[category]! }));
  }, [filtered]);

  return (
    <BrandDocsPage>
      <BrandDocsHeader
        eyebrow="Foundations — Icons"
        title="Icon set"
        lede="Crisp 24px stroke icons — open-source Lucide (ISC) & Feather (MIT). Recolor with any color token."
        showRule
      />

      <BrandDocsSection
        title="Usage"
        note="Icons ship as SVG strings, so they inline without a component boundary and inherit currentColor."
      >
        <CodeBlock>{`import { iconSearch } from "@okryshto/icons";

<IconButton aria-label="Search">
  <span dangerouslySetInnerHTML={{ __html: iconSearch }} />
</IconButton>`}</CodeBlock>
      </BrandDocsSection>

      <BrandDocsSection title="Search">
        <div className="okryshto-brand-docs__search">
          <input
            className="okryshto-brand-docs__search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, alias, or category…"
            aria-label="Search icons"
          />
          <p className="okryshto-brand-docs__search-meta">
            {filtered.length} of {CATALOG.length} icons
            {query.trim() ? ` matching “${query.trim()}”` : ""}
          </p>
        </div>
      </BrandDocsSection>

      {grouped.length === 0 ? (
        <p className="okryshto-brand-docs__section-note">No icons match that query.</p>
      ) : (
        grouped.map(({ category, icons }) => (
          <BrandDocsSection key={category} title={category}>
            <div className="okryshto-brand-docs__icon-grid">
              {icons.map((entry) => (
                <article
                  key={entry.name}
                  className="okryshto-brand-docs__icon-tile"
                  title={entry.importName}
                >
                  <div
                    className="okryshto-brand-docs__icon-glyph"
                    dangerouslySetInnerHTML={{ __html: entry.svg }}
                  />
                  <p className="okryshto-brand-docs__icon-name">{entry.name}</p>
                </article>
              ))}
            </div>
          </BrandDocsSection>
        ))
      )}
    </BrandDocsPage>
  );
}

export const IconSet: Story = {
  name: "Icon set",
  render: () => <IconsExplorer />,
};

/* -------------------------------------------------------- Component showcase */

function Tile({
  label,
  wide,
  grow,
  stack,
  children,
}: {
  label: string;
  wide?: boolean;
  grow?: boolean;
  stack?: boolean;
  children: ReactNode;
}) {
  return (
    <article
      className={[
        "okryshto-brand-docs__showcase-tile",
        wide && "okryshto-brand-docs__showcase-tile--wide",
        grow && "okryshto-brand-docs__showcase-tile--grow",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="okryshto-brand-docs__showcase-label">{label}</p>
      <div
        className={[
          "okryshto-brand-docs__showcase-body",
          stack && "okryshto-brand-docs__showcase-body--stack",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </article>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="okryshto-brand-docs__showcase-grid">{children}</div>;
}

function Showcase() {
  const [tab, setTab] = useState("overview");
  const [page, setPage] = useState(2);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [segment, setSegment] = useState("week");
  const [chips, setChips] = useState(["mint", "indigo"]);

  return (
    <BrandDocsPage>
      <BrandDocsHeader
        eyebrow="Okryshto · React"
        title="Component showcase"
        lede="Every public component in one place, live. Open a group in the sidebar for props, variants, and docs."
        showRule
      />

      <BrandDocsSection title="Brand" note="Identity marks used across surfaces.">
        <Grid>
          <Tile label="Logo" grow>
            <Logo layout="horizontal" tone="multi" label="okryshto" />
          </Tile>
          <Tile label="AnimatedLogo" grow>
            <AnimatedLogo size={72} mode="loop" />
          </Tile>
        </Grid>
      </BrandDocsSection>

      <BrandDocsSection title="Control" note="Inputs, toggles, and actions.">
        <Grid>
          <Tile label="Button">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </Tile>
          <Tile label="IconButton / FAB">
            <IconButton aria-label="Search">{icon(iconSearch)}</IconButton>
            <Fab aria-label="Add" icon={icon(iconPlus)} />
          </Tile>
          <Tile label="ButtonGroup" grow>
            <ButtonGroup
              action={{ label: "Save" }}
              menu={[{ label: "Save as…" }, { label: "Save & publish" }]}
            />
          </Tile>
          <Tile label="TextField / NumberInput" grow stack>
            <TextField label="Email" placeholder="you@okryshto.dev" defaultValue="" fullWidth />
            <NumberInput label="Quantity" defaultValue={3} fullWidth />
          </Tile>
          <Tile label="TextArea" grow>
            <TextArea label="Notes" placeholder="Ship notes…" rows={3} fullWidth />
          </Tile>
          <Tile label="Select / Autocomplete" grow stack>
            <Select
              label="Team"
              options={[
                { value: "design", label: "Design" },
                { value: "eng", label: "Engineering" },
              ]}
              defaultValue="design"
              fullWidth
            />
            <Autocomplete
              label="City"
              options={[
                { value: "kyiv", label: "Kyiv" },
                { value: "lisbon", label: "Lisbon" },
                { value: "tokyo", label: "Tokyo" },
              ]}
              defaultValue={{ value: "kyiv", label: "Kyiv" }}
              fullWidth
            />
          </Tile>
          <Tile label="Checkbox / Radio / Switch" stack>
            <CheckboxGroup defaultValue={["a"]}>
              <Checkbox value="a" label="Checkbox A" />
              <Checkbox value="b" label="Checkbox B" />
            </CheckboxGroup>
            <RadioGroup defaultValue="one" name="intro-radio">
              <Radio value="one" label="Radio one" />
              <Radio value="two" label="Radio two" />
            </RadioGroup>
            <Switch label="Notifications" defaultChecked />
          </Tile>
          <Tile label="Chip / ChipGroup" grow>
            <Chip label="Accent" variant="accent" selected />
            <Chip label="Outline" variant="outline" />
            <ChipGroup
              items={[
                { label: "Mint", value: "mint" },
                { label: "Indigo", value: "indigo" },
                { label: "Dante", value: "dante" },
              ]}
              value={chips}
              onChange={(next) => {
                if (Array.isArray(next)) setChips(next);
              }}
            />
          </Tile>
          <Tile label="Slider / Rating" grow stack>
            <Slider defaultValue={42} aria-label="Volume" valueLabelDisplay="auto" />
            <Rating defaultValue={4} />
          </Tile>
          <Tile label="SegmentedToggle" grow>
            <SegmentedToggle
              items={[
                { label: "Day", value: "day" },
                { label: "Week", value: "week" },
                { label: "Month", value: "month" },
              ]}
              value={segment}
              exclusive
              onChange={(next) => {
                if (typeof next === "string") setSegment(next);
              }}
            />
          </Tile>
          <Tile label="InlineAction" grow>
            <InlineAction placeholder="email@team.dev" action="Send" />
          </Tile>
          <Tile label="Date / Time fields" grow stack>
            <DateField label="Date" fullWidth />
            <TimeField label="Time" fullWidth />
            <DateTimeField label="Date & time" fullWidth />
          </Tile>
          <Tile label="FileUpload" grow>
            <FileUpload accept={[".png", ".jpg"]} maxSize="10MiB" fullWidth />
          </Tile>
          <Tile label="RichEditor" wide>
            <RichEditor placeholder="Write something…" fullWidth />
          </Tile>
        </Grid>
      </BrandDocsSection>

      <BrandDocsSection title="Navigation">
        <Grid>
          <Tile label="Tabs" wide>
            <Tabs
              items={[
                { label: "Overview", value: "overview" },
                { label: "Activity", value: "activity" },
                { label: "Settings", value: "settings" },
              ]}
              value={tab}
              onChange={(_event, value) => setTab(value)}
            />
          </Tile>
          <Tile label="Breadcrumbs" grow>
            <Breadcrumbs
              items={[
                { label: "Home", href: "#" },
                { label: "Library", href: "#" },
                { label: "Introduction" },
              ]}
            />
          </Tile>
          <Tile label="Pagination" grow>
            <Pagination page={page} count={8} onChange={(_event, next) => setPage(next)} />
          </Tile>
          <Tile label="Stepper" wide>
            <Stepper
              activeStep={1}
              steps={[{ label: "Details" }, { label: "Design" }, { label: "Ship" }]}
            />
          </Tile>
          <Tile label="Accordion" grow>
            <Accordion defaultExpanded>
              <AccordionSummary>What is Okryshto?</AccordionSummary>
              <AccordionDetails>A React design system with token-driven SCSS.</AccordionDetails>
            </Accordion>
          </Tile>
        </Grid>
      </BrandDocsSection>

      <BrandDocsSection title="Feedback">
        <Grid>
          <Tile label="Alert" grow>
            <Alert severity="info" title="Heads up">
              Brand docs and controls share the same tokens.
            </Alert>
          </Tile>
          <Tile label="Badge / SeverityIcon">
            <Badge badgeContent={3}>
              <Avatar initials="OK" alt="Oleksii" />
            </Badge>
            <SeverityIcon severity="success" />
            <SeverityIcon severity="warning" />
            <SeverityIcon severity="danger" />
          </Tile>
          <Tile label="Spinner / Progress / Skeleton" grow stack>
            <Spinner />
            <Progress value={64} />
            <Skeleton width="100%" height={12} />
          </Tile>
          <Tile label="EmptyState" grow>
            <EmptyState
              title="Nothing here yet"
              description="Create your first project to begin."
            />
          </Tile>
        </Grid>
      </BrandDocsSection>

      <BrandDocsSection title="Overlays" note="Interactive — open a surface from the tile.">
        <Grid>
          <Tile label="Tooltip">
            <Tooltip title="Copied to clipboard">
              <Button variant="soft">Hover me</Button>
            </Tooltip>
          </Tile>
          <Tile label="Dialog">
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              Open dialog
            </Button>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
              <DialogTitle>Welcome</DialogTitle>
              <DialogContent>Dialog content over the static canvas.</DialogContent>
              <DialogActions>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Continue</Button>
              </DialogActions>
              <DialogClose onClick={() => setDialogOpen(false)} />
            </Dialog>
          </Tile>
          <Tile label="Drawer">
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Open drawer
            </Button>
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <div style={{ padding: "1.5rem" }}>
                <p style={{ margin: 0 }}>Drawer panel</p>
                <Button style={{ marginTop: "1rem" }} onClick={() => setDrawerOpen(false)}>
                  Close
                </Button>
              </div>
            </Drawer>
          </Tile>
          <Tile label="Modal">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Open modal
            </Button>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
              <div style={{ padding: "1.5rem", maxWidth: "20rem" }}>
                <p style={{ margin: "0 0 1rem" }}>Lightweight modal shell.</p>
                <Button onClick={() => setModalOpen(false)}>Close</Button>
              </div>
            </Modal>
          </Tile>
        </Grid>
      </BrandDocsSection>

      <BrandDocsSection title="Data">
        <Grid>
          <Tile label="Avatar / AvatarGroup">
            <Avatar initials="OK" alt="Oleksii" />
            <AvatarGroup max={3}>
              <Avatar initials="A" />
              <Avatar initials="B" />
              <Avatar initials="C" />
              <Avatar initials="D" />
            </AvatarGroup>
          </Tile>
          <Tile label="StatCard" grow>
            <StatCard label="Sessions" value="12.4k" trend={{ value: "+8%", up: true }} accent />
          </Tile>
          <Tile label="List" grow>
            <List>
              <ListItem>
                <ListItemText primary="Design tokens" secondary="Color, type, motion" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Components" secondary="Control → Media" />
              </ListItem>
            </List>
          </Tile>
          <Tile label="Divider" grow stack>
            <span>Above</span>
            <Divider />
            <span>Below</span>
          </Tile>
          <Tile label="Table" wide>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Role</TableHeaderCell>
                    <TableHeaderCell numeric>Sessions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell>Oleksii</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell numeric>128</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Alex</TableCell>
                    <TableCell>Editor</TableCell>
                    <TableCell numeric>84</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Tile>
        </Grid>
      </BrandDocsSection>

      <BrandDocsSection title="Media">
        <Grid>
          <Tile label="Card" grow>
            <SurfaceCard>
              <CardHeader title="Card" subheader="Surface primitive" />
              <CardContent>Use for grouped content and actions.</CardContent>
            </SurfaceCard>
          </Tile>
          <Tile label="LinkCard" grow>
            <LinkCard title="Writing" subtitle="Notes on interface craft" href="#" />
          </Tile>
          <Tile label="ProjectCard" grow>
            <ProjectCard
              title="Finance App"
              description="Case-study card for portfolio grids."
              tags={["Product", "Mobile"]}
            />
          </Tile>
          <Tile label="Photo" grow>
            <Photo alt="Portrait placeholder" size="sm" />
          </Tile>
        </Grid>
      </BrandDocsSection>

      <BrandDocsSection
        title="Transitions"
        note="CSS transition wrappers — Fade, Grow, Zoom shown in."
      >
        <Grid>
          <Tile label="Fade">
            <Fade in>
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  background: "var(--okryshto-bg-surface-raised)",
                }}
              >
                Fade in
              </div>
            </Fade>
          </Tile>
          <Tile label="Grow">
            <Grow in>
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  background: "var(--okryshto-bg-surface-raised)",
                }}
              >
                Grow in
              </div>
            </Grow>
          </Tile>
          <Tile label="Zoom">
            <Zoom in>
              <span style={{ display: "inline-flex" }}>{icon(iconStar)}</span>
            </Zoom>
          </Tile>
        </Grid>
      </BrandDocsSection>
    </BrandDocsPage>
  );
}

export const ShowcaseAll: Story = {
  name: "Component showcase",
  render: () => <Showcase />,
};
