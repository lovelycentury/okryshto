import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Autocomplete, type AutocompleteOption } from "./Autocomplete";
import {
  HighlightMatch,
  OptionBody,
  OptionCheck,
  OptionDescription,
  OptionLabel,
  OptionRow,
} from "../Option/Option";

const people: AutocompleteOption[] = [
  { value: "mika", label: "Mika Chen", disabled: false },
  { value: "mika-r", label: "Mika Rossi" },
  { value: "mikael", label: "Mikael Boe" },
  { value: "alex", label: "Alex Rivera" },
];

interface City extends AutocompleteOption {
  region: string;
}

const cities: City[] = [
  { value: "paris", label: "Paris", region: "Europe" },
  { value: "tokyo", label: "Tokyo", region: "Asia" },
  { value: "kyiv", label: "Kyiv", region: "Europe" },
  { value: "osaka", label: "Osaka", region: "Asia" },
  { value: "lisbon", label: "Lisbon", region: "Europe" },
];

/**
 * Text field with a filtered suggestions list. Prefer when options are many or searchable; use Select when the full list should stay visible.
 */
const meta: Meta<typeof Autocomplete> = {
  title: "Control/Autocomplete",
  component: Autocomplete,
  args: {
    label: "People",
    placeholder: "Search people…",
    options: people,
    size: "medium",
    color: "primary",
    error: false,
    disabled: false,
    fullWidth: false,
    multiple: false,
    freeSolo: false,
    openOnFocus: true,
    loading: false,
    required: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    limitTags: { control: "number" },
  },
  render: (args) => <Autocomplete {...args} />,
};

export default meta;
type Story = StoryObj<typeof Autocomplete>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows filled.
 */
export const Filled: Story = {
  args: { defaultValue: people[0], defaultInputValue: people[0].label },
};
/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true, helperText: "Pick at least one person" } };
/**
 * This example shows multiple.
 */
export const Multiple: Story = {
  args: { multiple: true, defaultValue: [people[0], people[3]] },
};
/**
 * This example shows limit tags.
 */
export const LimitTags: Story = {
  name: "Multiple — limitTags",
  args: { multiple: true, limitTags: 2, defaultValue: people },
};
/**
 * This example shows free solo.
 */
export const FreeSolo: Story = {
  name: "freeSolo — Enter commits typed text",
  args: { freeSolo: true, helperText: "Type anything and press Enter" },
};
/**
 * This example shows the loading state.
 */
export const Loading: Story = { args: { loading: true, open: true, inputValue: "mik" } };
/**
 * This example shows the error state.
 */
export const Error: Story = { args: { error: true, helperText: "Pick someone from the list" } };
/**
 * This example shows auto highlight.
 */
export const AutoHighlight: Story = {
  name: "autoHighlight — Enter commits without arrowing",
  args: { autoHighlight: true, defaultInputValue: "mik", open: true },
};
/**
 * This example shows filter selected.
 */
export const FilterSelected: Story = {
  name: "filterSelectedOptions",
  args: { multiple: true, filterSelectedOptions: true, defaultValue: [people[0]], open: true },
};

// `Meta<typeof Autocomplete>` erases the component's generic, so stories whose
// props depend on the option type (groupBy, renderOption) are written as
// `render` functions — inside one, `Autocomplete` is inferred concretely again.
/**
 * This example shows grouped.
 */
export const Grouped: Story = {
  render: () => (
    <Autocomplete
      label="City"
      placeholder="Search cities…"
      options={cities}
      groupBy={(option) => option.region}
      open
    />
  ),
};

/**
 * This example shows with descriptions.
 */
export const WithDescriptions: Story = {
  render: () => (
    <Autocomplete
      label="People"
      options={people}
      getOptionDescription={(option) =>
        `${option.label.toLowerCase().replace(" ", ".")}@studio.dev`
      }
    />
  ),
};

/**
 * **The customization contract.** Four props hand pieces of the component back
 * to you, and each one has exactly one rule:
 *
 * - `renderOption(props, option, state)` — spread `props` on a single `<li>`.
 *   They carry `role="option"`, the id `aria-activedescendant` points at, the
 *   selected/highlighted modifiers and the pointer handlers. Drop them and the
 *   row stops being selectable by keyboard or mouse. The key is applied for
 *   you — unlike MUI, `props` carries none, so it can be spread as-is.
 * - `renderInput(params)` — spread `params.inputProps` on an `<input>`. The
 *   field shell (label, helper text, error, sizes) stays with the component;
 *   only the inside of the bordered box is yours. `params.endAdornment` is
 *   handed over rather than placed for you, so put it somewhere.
 * - `renderGroup(params)` — keep `params.children` inside a list container;
 *   they are `<li>` elements.
 * - `renderNoOptions` / `renderLoading` — return an `<li>`, they sit in the
 *   listbox.
 *
 * `state` and `params.state` carry what a custom row can't recompute: the
 * typed `inputValue`, the field `size` (the popup is portaled and inherits
 * nothing), `multiple`, `open`, `disabled`, `error`.
 *
 * Rather than copying BEM class names, build rows from the exported
 * primitives — `OptionRow`, `OptionLabel`, `OptionDescription`, `OptionBody`,
 * `OptionCheck`, `HighlightMatch`. They read the listbox they are in and take
 * its styling, so a custom row still scales with `size` and follows the theme.
 */
export const CustomOption: Story = {
  name: "renderOption",
  render: () => (
    <Autocomplete
      label="City"
      options={cities}
      open
      renderOption={(props, option, state) => (
        <OptionRow {...props}>
          <OptionLabel>{option.label}</OptionLabel>
          <OptionDescription>{option.region}</OptionDescription>
          <OptionCheck checked={state.selected} />
        </OptionRow>
      )}
    />
  ),
};

/**
 * `state.inputValue` is what the user has typed; `HighlightMatch` emphasises
 * the first matching run inside the label. Only the first — a second run would
 * compete with the row's own highlight state for the reader's eye.
 *
 * The match is wrapped in `<mark>` — an inline element that adds emphasis
 * semantics and no text of its own, so the row still reads as the option
 * label. Type "mik" in the field to see it.
 */
export const RecipeHighlightMatch: Story = {
  name: "Recipe — highlight the typed run",
  render: () => (
    <Autocomplete
      label="People"
      placeholder="Type “mik”…"
      options={people}
      defaultInputValue="mik"
      openOnFocus
      renderOption={(props, option, state) => (
        <OptionRow {...props}>
          <OptionLabel>
            <HighlightMatch text={option.label} query={state.inputValue} />
          </OptionLabel>
          <OptionCheck checked={state.selected} />
        </OptionRow>
      )}
    />
  ),
};

/**
 * Two-line rows: `OptionBody` stacks a label over its description. Without it
 * the row is a single centred flex line and the description sits beside the
 * label instead of under it.
 *
 * The avatar is plain markup — anything can go in a row. What must not change
 * is the `<li>` the `props` land on.
 */
export const RecipeTwoLineOption: Story = {
  name: "Recipe — avatar and two-line row",
  render: () => (
    <Autocomplete
      label="People"
      options={people}
      open
      renderOption={(props, option, state) => (
        <OptionRow {...props}>
          <span
            aria-hidden="true"
            style={{
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "var(--okryshto-bg-surface)",
              fontSize: "0.75rem",
            }}
          >
            {option.label.charAt(0)}
          </span>
          <OptionBody>
            <OptionLabel>{option.label}</OptionLabel>
            <OptionDescription>
              {option.label.toLowerCase().replace(" ", ".")}@studio.dev
            </OptionDescription>
          </OptionBody>
          <OptionCheck checked={state.selected} />
        </OptionRow>
      )}
    />
  ),
};

/**
 * `renderInput` rebuilds the inside of the control. Here a search glyph is
 * placed before the input and the clear/toggle buttons are moved after it.
 *
 * Note what is *not* rebuilt: the label, the helper text, the focus ring and
 * the error colours all still come from the field shell — and the popup still
 * anchors on the bordered box, which is why the shell is not handed out.
 */
export const RecipeRenderInput: Story = {
  name: "Recipe — renderInput with a leading glyph",
  render: () => (
    <Autocomplete
      label="People"
      placeholder="Search people…"
      options={people}
      helperText="The label, helper text and focus ring are still the field's"
      renderInput={({ inputProps, tags, endAdornment, state }) => (
        <>
          <span aria-hidden="true" style={{ opacity: state.open ? 1 : 0.5, flexShrink: 0 }}>
            ⌕
          </span>
          {tags}
          <input {...inputProps} />
          {endAdornment}
        </>
      )}
    />
  ),
};

/**
 * The rest of the popup is replaceable too: `renderGroup` for a `groupBy`
 * header, `renderNoOptions` for the empty state, `renderLoading` for the
 * pending one.
 *
 * A group's `children` are `<li>` rows, so whatever wraps them has to be a
 * list; keep `role="group"` and a label on it or the grouping is invisible to
 * screen readers. Clear the field and type nonsense to see the empty state.
 */
export const RecipeGroupsAndEmpty: Story = {
  name: "Recipe — renderGroup / renderNoOptions",
  render: () => (
    <Autocomplete
      label="City"
      placeholder="Search cities…"
      options={cities}
      groupBy={(option) => option.region}
      open
      renderGroup={({ key, label, group, children }) => (
        <li key={key} role="presentation">
          <span
            role="presentation"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 10px 2px",
              color: "var(--okryshto-text-muted)",
              fontSize: "var(--okryshto-font-size-sm)",
            }}
          >
            {label}
            <span>{group.options.length}</span>
          </span>
          <ul role="group" aria-label={label} style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {children}
          </ul>
        </li>
      )}
      renderNoOptions={({ inputValue }) => (
        <li style={{ padding: "10px 13px", color: "var(--okryshto-text-muted)" }}>
          No city matches “{inputValue}”
        </li>
      )}
    />
  ),
};

/**
 * This example shows wider popup.
 */
export const WiderPopup: Story = {
  name: "popupWidth",
  args: { popupWidth: 420, open: true, helperText: "Panel is wider than the field" },
};

/**
 * This example shows near page bottom.
 */
export const NearPageBottom: Story = {
  name: "Flips up near the bottom",
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "150vh",
        justifyContent: "flex-end",
      }}
    >
      <Autocomplete label="People" placeholder="Search people…" options={people} />
    </div>
  ),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "320px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <Autocomplete
          key={size}
          size={size}
          label="People"
          options={people}
          placeholder="Search…"
        />
      ))}
    </div>
  ),
};

/**
 * This example shows controlled usage.
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<AutocompleteOption | null>(people[0]);
    const [reason, setReason] = useState<string>("—");
    return (
      <Autocomplete
        label="People"
        options={people}
        value={value}
        onChange={(_event, next, changeReason) => {
          setValue(next as AutocompleteOption | null);
          setReason(changeReason);
        }}
        helperText={`${value ? `Selected: ${value.label}` : "None selected"} · reason: ${reason}`}
      />
    );
  },
};
