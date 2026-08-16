import { forwardRef, type HTMLAttributes } from "react";
import "@okryshto/design-system/components/Icon/Icon.scss";
import * as okryshtoIcons from "@okryshto/icons";

/**
 * Every icon export in `@okryshto/icons`, inferred from the package itself —
 * `"iconStar" | "iconSearch" | …`. Adding an SVG to `@okryshto/icons` and running
 * its `generate` script widens this union with no edit here.
 */
export type IconName = keyof typeof okryshtoIcons;

/** Raw SVG markup, as every `@okryshto/icons` export is. */
export type IconSource = string;

export type IconSize = "small" | "medium" | "large" | "inherit";
export type IconColor =
  | "inherit"
  | "primary"
  | "dante"
  | "indigo"
  | "violet"
  | "ember"
  | "ice"
  | "success"
  | "warning"
  | "danger"
  | "muted";

/** Name → markup, so `name` can be resolved at runtime. */
const ICONS = okryshtoIcons as Record<IconName, IconSource>;

/** Sorted list of every available icon name — handy for pickers and stories. */
export const ICON_NAMES = Object.keys(ICONS).sort() as IconName[];

type IconOwnProps = {
  /**
   * Tint. `"inherit"` (the default) takes the surrounding text colour, which is
   * what you want inside a Button or a Typography block.
   *
   * @default "inherit"
   * @type {IconColor}
   */
  color?: IconColor;
  /**
   * Glyph box. `"inherit"` tracks the surrounding font size (`1em`) instead of
   * the fixed scale.
   *
   * @default "medium"
   * @type {IconSize}
   */
  fontSize?: IconSize;
  /**
   * Text alternative. Provide it when the icon is the only carrier of meaning;
   * omit it and the icon is hidden from assistive tech as decoration.
   *
   * @default undefined
   * @type {string}
   */
  titleAccess?: string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
};

/**
 * Exactly one source is required, and TypeScript enforces the choice:
 * `name` for the autocompleted union, `icon` for markup you already hold.
 */
type IconSourceProps =
  | {
      /**
       * Icon to render, picked by name with full autocomplete.
       *
       * @default undefined
       * @type {IconName}
       */
      name: IconName;
      icon?: never;
    }
  | {
      /**
       * Pre-imported SVG markup — `import { iconStar } from "@okryshto/icons"`.
       * Use this for icons outside the package, or to keep a bundle lean.
       *
       * Injected as HTML, so it must be markup you control at build time.
       * Never pass a string that came from a user, an API, or a URL.
       *
       * @default undefined
       * @type {IconSource}
       */
      icon: IconSource;
      name?: never;
    };

/**
 * Props follow MUI's SvgIcon API (https://mui.com/material-ui/api/svg-icon/) where the
 * shapes line up: `color`/`fontSize`/`titleAccess` match name-for-name. Deliberate gaps:
 * the glyph arrives as SVG markup from `@okryshto/icons` rather than as React children, so
 * there is no `viewBox`/`inheritViewBox`/`htmlColor` — the assets already declare their
 * own viewBox and paint with `currentColor`, which `color` drives.
 *
 * `name` bundles the whole icon set (~150 small strings) because the lookup happens at
 * runtime; `icon` imports exactly one and stays tree-shakeable. Prefer `icon` in app code
 * that ships to users, `name` in tooling and galleries where the set is dynamic anyway.
 */
export type IconProps = IconOwnProps &
  IconSourceProps &
  Omit<HTMLAttributes<HTMLSpanElement>, "color" | "children" | "dangerouslySetInnerHTML">;

export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { name, icon, color = "inherit", fontSize = "medium", titleAccess, className, ...rest },
  ref,
) {
  const markup = icon ?? (name ? ICONS[name] : undefined);

  const classes = [
    "okryshto-component",
    "okryshto-icon",
    fontSize !== "medium" && `okryshto-icon--${fontSize}`,
    color !== "inherit" && `okryshto-icon--color-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // The markup is first-party: it comes from @okryshto/icons at build time, or
  // from an `icon` prop the caller imported the same way. It is never user input.
  return (
    <span
      {...rest}
      ref={ref}
      className={classes}
      role={titleAccess ? "img" : undefined}
      aria-label={titleAccess}
      aria-hidden={titleAccess ? undefined : true}
      dangerouslySetInnerHTML={{ __html: markup ?? "" }}
    />
  );
});
