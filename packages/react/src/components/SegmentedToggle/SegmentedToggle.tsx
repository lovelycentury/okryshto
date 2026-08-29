"use client";

import { useState, type ReactNode } from "react";
import "@okryshto/design-system/components/SegmentedToggle/SegmentedToggle.scss";

export type SegmentedToggleColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

export interface SegmentedToggleItem {
  /** Segment text. */
  label?: ReactNode;
  /** Segment icon — combine with `label`, or use alone for an icon-only segment. */
  icon?: ReactNode;
  /** Stable segment identifier passed to `value` / `onChange`. */
  value: string;
  disabled?: boolean;
}

/**
 * Props follow MUI's ToggleButtonGroup API
 * (https://mui.com/material-ui/api/toggle-button-group/) loosely:
 * `exclusive`/`disabled` match name-for-name (`exclusive` maps to MUI's
 * `exclusive` prop). Deliberate gaps/renames: segments come from an `items`
 * array with explicit `value` keys (not `children` composition), `color`
 * replaces MUI's `color` with okryshto tone names, and there is no `orientation`
 * / `size` / `fullWidth` in this design.
 */
export interface SegmentedToggleProps {
  /**
   * Segment options.
   *
   * @default undefined
   * @type {SegmentedToggleItem[]}
   */
  items: SegmentedToggleItem[];
  /**
   * Selected value(s). `string` when `exclusive`, `string[]` when multi-select.
   *
   * @default undefined
   * @type {string | string[]}
   */
  value?: string | string[];
  /**
   * Initial selection (uncontrolled).
   *
   * @default undefined
   * @type {string | string[]}
   */
  defaultValue?: string | string[];
  /**
   * Fires when the selection changes.
   *
   * @default undefined
   * @type {(value: string | string[]) => void}
   */
  onChange?: (value: string | string[]) => void;
  /**
   * When true (default), only one segment is active at a time.
   *
   * @default true
   * @type {boolean}
   */
  exclusive?: boolean;
  /**
   * Tone colour for the active segment (dante-ready).
   *
   * @default "primary"
   * @type {SegmentedToggleColor}
   */
  color?: SegmentedToggleColor;
  /**
   * Disables every segment.
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

function normalizeDefault(exclusive: boolean, defaultValue?: string | string[]): string | string[] {
  if (defaultValue !== undefined) return defaultValue;
  return exclusive ? "" : [];
}

function isSegmentActive(
  current: string | string[],
  segmentValue: string,
  exclusive: boolean,
): boolean {
  if (exclusive) return current === segmentValue;
  return Array.isArray(current) && current.includes(segmentValue);
}

export function SegmentedToggle({
  items,
  value,
  defaultValue,
  onChange,
  exclusive = true,
  color = "primary",
  disabled = false,
  className,
}: SegmentedToggleProps) {
  const [internalValue, setInternalValue] = useState<string | string[]>(() =>
    normalizeDefault(exclusive, defaultValue),
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const commit = (next: string | string[]) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const handleSegmentClick = (segmentValue: string) => {
    if (exclusive) {
      commit(segmentValue);
      return;
    }

    const selected = Array.isArray(currentValue) ? [...currentValue] : [];
    const index = selected.indexOf(segmentValue);
    if (index >= 0) selected.splice(index, 1);
    else selected.push(segmentValue);
    commit(selected);
  };

  const classes = [
    "okryshto-component",
    "okryshto-segmented-toggle",
    color !== "primary" && `okryshto-segmented-toggle--color-${color}`,
    disabled && "okryshto-segmented-toggle--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="group">
      {items.map((item) => {
        const active = isSegmentActive(currentValue, item.value, exclusive);
        return (
          <button
            key={item.value}
            type="button"
            className={[
              "okryshto-segmented-toggle__segment",
              active && "okryshto-segmented-toggle__segment--active",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={disabled || item.disabled}
            aria-pressed={active}
            onClick={() => handleSegmentClick(item.value)}
          >
            {item.icon && (
              <span className="okryshto-segmented-toggle__icon" aria-hidden="true">
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
