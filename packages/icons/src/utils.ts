import metadata from "./metadata.json";
import type { IconCategories, IconMetadata } from "./types";

/** Metadata (category + aliases) for every icon in this package. */
export const ICON_METADATA: Record<string, IconMetadata> = metadata;

export type { IconCategories, IconMetadata, GroupedIcon } from "./types";

/**
 * Groups icon metadata by category. Both the categories and the icons inside
 * each one come back sorted alphabetically, so the result renders in a stable
 * order without the caller sorting again.
 */
export function groupIconsByCategory(iconMetadata: Record<string, IconMetadata>): IconCategories {
  const categories: IconCategories = {};

  for (const [iconName, metadata] of Object.entries(iconMetadata)) {
    const icons = categories[metadata.category] ?? [];
    icons.push({ iconName, metadata });
    categories[metadata.category] = icons;
  }

  const sorted: IconCategories = {};
  for (const category of Object.keys(categories).sort()) {
    sorted[category] = categories[category]
      .slice()
      .sort((a, b) => a.iconName.localeCompare(b.iconName));
  }
  return sorted;
}

/**
 * Turns an icon file name into the JavaScript export name it is published under.
 *
 * @example
 * ```ts
 * getIconImportName("arrow-up-right.svg"); // "iconArrowUpRight"
 * // → import { iconArrowUpRight } from "@okkly/icons";
 * ```
 */
export function getIconImportName(iconName: string): string {
  return `icon${iconName
    .replace(/\.svg$/, "")
    .split("-")
    .map(capitalize)
    .join("")}`;
}

/** Uppercases the first character of `value`. */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
