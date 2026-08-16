import { type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import "@okryshto/design-system/components/ChipGroup/ChipGroup.scss";
import { Chip } from "../Chip/Chip";

export type ChipGroupColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

export interface ChipGroupItem {
  /** Chip label. */
  label: ReactNode;
  /** Selection value — defaults to the item index as a string. */
  value?: string;
  /** Selected state when the group is not controlled via `value`. */
  selected?: boolean;
  disabled?: boolean;
  onClick?: (
    event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
    item: ChipGroupItem,
  ) => void;
  onRemove?: (event: MouseEvent<HTMLButtonElement>, item: ChipGroupItem) => void;
}

/**
 * Composes `Chip` children into a wrapping row for tags, filters, and
 * multi-value fields. Deliberate gaps vs MUI: no single MUI equivalent —
 * closest is a hand-built `ToggleButtonGroup` or free-form `Chip` list;
 * selection is driven by an `items` array + `value`/`onChange` (MUI uses
 * composition), `exclusive` maps to single-select filter mode, and
 * `children` is an escape hatch for fully custom chip trees.
 */
export interface ChipGroupProps {
  /**
   * Custom chip nodes — no built-in selection wiring.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
  /**
   * Structured chips — preferred for controlled selection.
   *
   * @default undefined
   * @type {ChipGroupItem[]}
   */
  items?: ChipGroupItem[];
  /**
   * Selected value(s). String when `exclusive`, string[] otherwise.
   *
   * @default undefined
   * @type {string | string[]}
   */
  value?: string | string[];
  /**
   * Fires when a chip is toggled.
   *
   * @default undefined
   * @type {(value: string | string[]) => void}
   */
  onChange?: (value: string | string[]) => void;
  /**
   * Single-select mode. Default `false` for multi-filter usage.
   *
   * @default false
   * @type {boolean}
   */
  exclusive?: boolean;
  /**
   * Tone applied to selected chips.
   *
   * @default "primary"
   * @type {ChipGroupColor}
   */
  color?: ChipGroupColor;
  /**
   * Disables every chip in the group.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

function itemKey(item: ChipGroupItem, index: number) {
  return item.value ?? String(index);
}

function isItemSelected(
  itemValue: string,
  value: string | string[] | undefined,
  item: ChipGroupItem,
  exclusive: boolean,
) {
  if (value !== undefined) {
    return exclusive ? value === itemValue : Array.isArray(value) && value.includes(itemValue);
  }
  return item.selected ?? false;
}

export function ChipGroup({
  children,
  items,
  value,
  onChange,
  exclusive = false,
  color = "primary",
  disabled = false,
  className,
}: ChipGroupProps) {
  const classes = [
    "okryshto-component",
    "okryshto-chip-group",
    color !== "primary" && `okryshto-chip-group--color-${color}`,
    disabled && "okryshto-chip-group--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleToggle = (
    event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
    item: ChipGroupItem,
    itemValue: string,
  ) => {
    if (disabled || item.disabled) return;

    if (onChange) {
      if (exclusive) {
        onChange(itemValue);
      } else {
        const current = Array.isArray(value) ? value : [];
        const next = current.includes(itemValue)
          ? current.filter((entry) => entry !== itemValue)
          : [...current, itemValue];
        onChange(next);
      }
    }

    item.onClick?.(event, item);
  };

  return (
    <div className={classes} role={items && (onChange || exclusive) ? "group" : undefined}>
      {items
        ? items.map((item, index) => {
            const itemValue = itemKey(item, index);
            const selected = isItemSelected(itemValue, value, item, exclusive);
            const interactive = !!onChange || !!item.onClick;
            const chipDisabled = disabled || item.disabled;

            return (
              <Chip
                key={itemValue}
                label={item.label}
                selected={selected}
                disabled={chipDisabled}
                removable={!!item.onRemove}
                onRemove={item.onRemove ? (event) => item.onRemove?.(event, item) : undefined}
                onClick={interactive ? (event) => handleToggle(event, item, itemValue) : undefined}
              />
            );
          })
        : children}
    </div>
  );
}
