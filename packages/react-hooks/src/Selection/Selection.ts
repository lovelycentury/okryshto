import type { SyntheticEvent } from "react";

/**
 * Why a selection changed. Mirrors MUI's Autocomplete `reason` values, and is
 * the argument that makes "user cleared the field" distinguishable from "user
 * deselected the last option" — two events that produce an identical value.
 */
export type SelectionChangeReason =
  | "selectOption"
  | "removeOption"
  | "clear"
  | "blur"
  /**
   * Free text the user committed rather than an option they picked. There is no
   * "Add …" row to click — this is what `freeSolo` reports when Enter commits
   * whatever was typed, and it is the reason a handler needs in order to tell a
   * new value apart from one that came out of the list.
   */
  | "createOption";

export interface SelectionChangeDetails<T> {
  /** The option the interaction acted on. Absent for `clear`. */
  option?: T;
}

/**
 * `(event, value, reason, details)` — MUI's Autocomplete signature, used for
 * Select too. MUI's own Select instead passes `(event, child)` and hides the
 * value on `event.target.value`; we deliberately don't, so that swapping a
 * Select for an Autocomplete doesn't rewrite the handler.
 *
 * `event` is `null` for changes not driven by a DOM event.
 */
export type SelectionChangeHandler<TOption, TValue> = (
  event: SyntheticEvent | null,
  value: TValue,
  reason: SelectionChangeReason,
  details?: SelectionChangeDetails<TOption>,
) => void;

/** One rendered group when `groupBy` is supplied. */
export interface OptionGroup<T> {
  key: string;
  label: string;
  /** Options in this group, each carrying its index into the flat option list. */
  options: { option: T; index: number }[];
}

/**
 * Reorders options so each group's members are contiguous, and returns both the
 * flat list (whose indices drive keyboard navigation and `aria-activedescendant`)
 * and the grouped view used for rendering. Keeping one index space for both is
 * what prevents arrow keys from skipping rows once headers are interleaved.
 *
 * Group order follows first appearance in `options`, so callers control it by
 * sorting their own data — same as MUI.
 */
export function groupOptions<T>(
  options: T[],
  groupBy: (option: T) => string,
): { flat: T[]; groups: OptionGroup<T>[] } {
  const buckets = new Map<string, T[]>();

  for (const option of options) {
    const key = groupBy(option);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(option);
    else buckets.set(key, [option]);
  }

  const flat: T[] = [];
  const groups: OptionGroup<T>[] = [];

  for (const [key, bucketOptions] of buckets) {
    groups.push({
      key,
      label: key,
      options: bucketOptions.map((option) => {
        const index = flat.length;
        flat.push(option);
        return { option, index };
      }),
    });
  }

  return { flat, groups };
}
