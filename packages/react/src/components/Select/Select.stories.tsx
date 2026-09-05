import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Select, type SelectOption } from "./Select";
import {
  OptionBody,
  OptionCheck,
  OptionDescription,
  OptionLabel,
  OptionRow,
} from "../Option/Option";

const teamOptions: SelectOption[] = [
  { value: "design", label: "Product design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operations" },
];

interface City extends SelectOption {
  region: string;
}

const cityOptions: City[] = [
  { value: "paris", label: "Paris", region: "Europe" },
  { value: "tokyo", label: "Tokyo", region: "Asia" },
  { value: "kyiv", label: "Kyiv", region: "Europe" },
  { value: "osaka", label: "Osaka", region: "Asia" },
  { value: "lisbon", label: "Lisbon", region: "Europe" },
];

/**
 * Closed list of options in a field. Prefer Autocomplete when the list is long or searchable.
 */
const meta: Meta<typeof Select> = {
  title: "Control/Select",
  component: Select,
  args: {
    label: "Team",
    placeholder: "Choose a team…",
    options: teamOptions,
    size: "medium",
    color: "primary",
    error: false,
    disabled: false,
    fullWidth: false,
    multiple: false,
    loading: false,
    required: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    limitTags: { control: "number" },
  },
  render: (args) => <Select {...args} />,
};

export default meta;
type Story = StoryObj<typeof Select>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows filled.
 */
export const Filled: Story = { args: { defaultValue: "engineering" } };
/**
 * This example shows required.
 */
export const Required: Story = { args: { required: true, helperText: "Team is required" } };
/**
 * This example shows the error state.
 */
export const Error: Story = { args: { error: true, helperText: "Please choose a team" } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true, defaultValue: "engineering" } };
/**
 * This example shows the loading state.
 */
export const Loading: Story = { args: { loading: true } };

/**
 * This example shows multiple.
 */
export const Multiple: Story = {
  args: { multiple: true, defaultValue: ["design", "engineering", "operations"] },
};

/**
 * This example shows limit tags.
 */
export const LimitTags: Story = {
  name: "Multiple — limitTags",
  args: {
    multiple: true,
    limitTags: 2,
    defaultValue: ["design", "engineering", "marketing", "operations"],
  },
};

// `Meta<typeof Select>` erases the component's generic, so stories whose props
// depend on the option type (groupBy, renderValue) are written as `render`
// functions — inside one, `Select` is inferred concretely again.
/**
 * This example shows grouped.
 */
export const Grouped: Story = {
  render: () => (
    <Select
      label="City"
      placeholder="Choose a city…"
      options={cityOptions}
      groupBy={(option) => (option as City).region}
    />
  ),
};

/**
 * This example shows custom value.
 */
export const CustomValue: Story = {
  name: "renderValue",
  render: () => (
    <Select
      label="Team"
      options={teamOptions}
      multiple
      defaultValue={["design", "engineering"]}
      renderValue={(selected) =>
        selected.length === 0 ? "None" : `${selected.length} teams selected`
      }
    />
  ),
};

/**
 * **The customization contract.** Five props hand pieces of the component back
 * to you, and each one has exactly one rule:
 *
 * - `renderOption(props, option, state)` — spread `props` on a single `<li>`.
 *   They carry `role="option"`, the id `aria-activedescendant` points at, the
 *   selected/highlighted/disabled modifiers and the pointer handlers. The key
 *   is applied for you — unlike MUI, `props` carries none, so it can be spread
 *   as-is.
 * - `renderValue(selected)` — the light touch: it changes only the text inside
 *   the trigger. Reach for it before `renderInput`.
 * - `renderInput(params)` — rebuilds the trigger itself. Spread
 *   `params.triggerProps` on **one** element, and do not make that element a
 *   `<button>`: removable chips render buttons inside it. `params.endAdornment`
 *   (clear + chevron) is handed over rather than placed for you.
 * - `renderGroup(params)` — keep `params.children` inside a list container.
 * - `renderNoOptions` / `renderLoading` — return an `<li>`.
 *
 * `state` carries what a custom row can't recompute: `multiple` (the default
 * row draws a checkbox rather than a tick), the field `size` (the popup is
 * portaled and inherits nothing), and the option's own `disabled`.
 *
 * Rather than copying BEM class names, build rows from the exported
 * primitives — `OptionRow`, `OptionLabel`, `OptionDescription`, `OptionBody`,
 * `OptionCheck`. They read the listbox they are in and take its styling.
 */
export const CustomOption: Story = {
  name: "renderOption",
  render: () => (
    <Select
      label="City"
      options={cityOptions}
      renderOption={(props, option, state) => (
        <OptionRow {...props}>
          <span
            aria-hidden="true"
            style={{
              flexShrink: 0,
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: state.selected
                ? "var(--okkly-accent-primary)"
                : "var(--okkly-border-subtle)",
            }}
          />
          <OptionBody>
            <OptionLabel>{option.label}</OptionLabel>
            <OptionDescription>{(option as City).region}</OptionDescription>
          </OptionBody>
          <OptionCheck checked={state.selected} />
        </OptionRow>
      )}
    />
  ),
};

/**
 * `renderInput` rebuilds the trigger. Here the selected team is shown with an
 * initial badge, and the chevron is kept where the default puts it.
 *
 * The one hard rule: `triggerProps` goes on a single non-button element. It
 * carries `role="combobox"`, `aria-expanded`, the tabindex, the keyboard
 * handling and the `aria-labelledby` that ties the trigger to the field's
 * label — none of which survives being split across two elements.
 */
export const RecipeRenderInput: Story = {
  name: "Recipe — renderInput trigger",
  render: () => (
    <Select
      label="Team"
      options={teamOptions}
      defaultValue="engineering"
      helperText="The label, helper text and focus ring are still the field's"
      renderInput={({ triggerProps, selected, endAdornment, state }) => (
        <div
          {...triggerProps}
          style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}
        >
          <span
            aria-hidden="true"
            style={{
              display: "grid",
              placeItems: "center",
              width: "22px",
              height: "22px",
              borderRadius: "6px",
              background: "var(--okkly-bg-surface)",
              fontSize: "0.75rem",
            }}
          >
            {selected[0]?.label.charAt(0) ?? "?"}
          </span>
          <span style={{ flex: 1 }}>{selected[0]?.label ?? "Pick a team"}</span>
          <span aria-hidden="true" style={{ opacity: state.open ? 1 : 0.5 }}>
            {endAdornment}
          </span>
        </div>
      )}
    />
  ),
};

/**
 * When only the trigger's *text* changes, `renderValue` is the smaller tool —
 * it leaves the trigger element, its role and its adornments alone. Compare
 * with the `renderInput` recipe above before reaching for the bigger prop.
 *
 * The listbox's own furniture is replaceable in the same way: `renderGroup`
 * for a `groupBy` header, `renderNoOptions` for an empty list.
 */
export const RecipeGroupsAndEmpty: Story = {
  name: "Recipe — renderGroup / renderNoOptions",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Select
        label="City"
        options={cityOptions}
        groupBy={(option) => (option as City).region}
        renderGroup={({ key, label, group, children }) => (
          <li key={key} role="presentation">
            <span
              role="presentation"
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 10px 2px",
                color: "var(--okkly-text-muted)",
                fontSize: "var(--okkly-font-size-sm)",
              }}
            >
              {label}
              <span>{group.options.length}</span>
            </span>
            <ul
              role="group"
              aria-label={label}
              style={{ margin: 0, padding: 0, listStyle: "none" }}
            >
              {children}
            </ul>
          </li>
        )}
      />
      <Select
        label="Archived teams"
        options={[]}
        renderNoOptions={() => (
          <li style={{ padding: "10px 13px", color: "var(--okkly-text-muted)" }}>
            Nothing archived yet
          </li>
        )}
      />
    </div>
  ),
};

/**
 * This example shows wider popup.
 */
export const WiderPopup: Story = {
  name: "popupWidth",
  args: { popupWidth: 420, helperText: "Panel is wider than the field" },
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
      <Select label="Team" placeholder="Choose a team…" options={teamOptions} />
    </div>
  ),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <Select
          key={size}
          size={size}
          label="Team"
          options={teamOptions}
          defaultValue="engineering"
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
    const [value, setValue] = useState<string>("engineering");
    const [reason, setReason] = useState<string>("—");
    return (
      <Select
        label="Team"
        options={teamOptions}
        value={value}
        onChange={(_event, next, changeReason) => {
          setValue((next as string) ?? "");
          setReason(changeReason);
        }}
        helperText={`Selected: ${value || "none"} · reason: ${reason}`}
      />
    );
  },
};

/**
 * This example shows in aform.
 */
export const InAForm: Story = {
  name: "Native form submit",
  render: () => {
    const [submitted, setSubmitted] = useState<string>("—");
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmitted(data.getAll("team").join(", ") || "nothing");
        }}
        style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}
      >
        <Select label="Team" name="team" options={teamOptions} multiple defaultValue={["design"]} />
        <button type="submit">Submit</button>
        <span>FormData: {submitted}</span>
      </form>
    );
  },
};
