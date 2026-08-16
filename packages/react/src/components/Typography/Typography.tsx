import { forwardRef, type ComponentPropsWithoutRef, type ElementType, type Ref } from "react";
import "@okryshto/design-system/components/Typography/Typography.scss";

/**
 * The editorial type scale, and the element each step renders as by default.
 * This map is the single source of truth: `TypographyVariant` is inferred from
 * its keys, so adding a step here (and its `&--<key>` block in Typography.scss)
 * is the whole change — no union to keep in sync.
 *
 * Mirrors TYPE_TOKENS in packages/figma-plugin/src/tokens/typography.ts.
 */
export const TYPOGRAPHY_VARIANTS = {
  "display-2xl": "h1",
  "display-xl": "h1",
  "display-lg": "h2",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  "body-lg": "p",
  "body-md": "p",
  "body-sm": "p",
  "label-md": "span",
  "label-sm": "span",
  caption: "span",
  overline: "span",
  "mono-sm": "code",
} as const satisfies Record<string, ElementType>;

/** `"display-2xl" | "h1" | "body-md" | …` — inferred from {@link TYPOGRAPHY_VARIANTS}. */
export type TypographyVariant = keyof typeof TYPOGRAPHY_VARIANTS;

/** The tag a variant falls back to when `as` is omitted. */
export type TypographyVariantElement<V extends TypographyVariant> = (typeof TYPOGRAPHY_VARIANTS)[V];

export type TypographyColor =
  "inherit" | "primary" | "secondary" | "muted" | "accent" | "success" | "warning" | "danger";

export type TypographyAlign = "inherit" | "left" | "center" | "right" | "justify";

const DEFAULT_VARIANT = "body-md" satisfies TypographyVariant;

/**
 * Props follow MUI's Typography API (https://mui.com/material-ui/api/typography/):
 * `variant`/`align`/`color`/`gutterBottom`/`noWrap` match name-for-name. Deliberate gaps:
 * the polymorphic prop is `as`, not MUI's `component`; the scale is this design system's
 * editorial one (`display-*`, `label-*`, `mono-sm`) rather than MUI's `subtitle`/`button`
 * steps; and there is no `variantMapping` prop — the mapping lives in
 * {@link TYPOGRAPHY_VARIANTS} and `as` overrides it per call site.
 */
export type TypographyOwnProps = {
  /**
   * Step in the type scale. Sets size, line height, weight and tracking, and
   * picks the default element.
   *
   * @default "body-md"
   * @type {TypographyVariant}
   */
  variant?: TypographyVariant;
  /**
   * Text colour. `"inherit"` keeps whatever the surface already sets.
   *
   * @default "inherit"
   * @type {TypographyColor}
   */
  color?: TypographyColor;
  /**
   * Horizontal alignment.
   *
   * @default "inherit"
   * @type {TypographyAlign}
   */
  align?: TypographyAlign;
  /**
   * Adds a bottom margin proportional to the step's own font size.
   *
   * @default false
   * @type {boolean}
   */
  gutterBottom?: boolean;
  /**
   * Clips overflowing text to one line with an ellipsis.
   *
   * @default false
   * @type {boolean}
   */
  noWrap?: boolean;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
};

/**
 * `as` swaps the rendered element and re-infers the props with it: `as="a"`
 * accepts `href`, `as="label"` accepts `htmlFor`, and the `ref` narrows to the
 * matching element type. Omit it and the variant's default tag is used.
 */
export type TypographyProps<E extends ElementType = ElementType> = TypographyOwnProps & {
  /**
   * Element to render.
   *
   * @default the variant's default tag — see TYPOGRAPHY_VARIANTS
   * @type {ElementType}
   */
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof TypographyOwnProps | "as">;

function TypographyImpl<E extends ElementType = TypographyVariantElement<typeof DEFAULT_VARIANT>>(
  {
    as,
    variant = DEFAULT_VARIANT,
    color = "inherit",
    align = "inherit",
    gutterBottom = false,
    noWrap = false,
    className,
    ...rest
  }: TypographyProps<E>,
  ref: Ref<Element>,
) {
  const Component = (as ?? TYPOGRAPHY_VARIANTS[variant]) as ElementType;

  const classes = [
    "okryshto-component",
    "okryshto-typography",
    variant !== DEFAULT_VARIANT && `okryshto-typography--${variant}`,
    color !== "inherit" && `okryshto-typography--color-${color}`,
    align !== "inherit" && `okryshto-typography--align-${align}`,
    gutterBottom && "okryshto-typography--gutter-bottom",
    noWrap && "okryshto-typography--no-wrap",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Component {...rest} ref={ref} className={classes} />;
}

/**
 * Text primitive for the whole scale, from `display-2xl` down to `mono-sm`.
 *
 * `forwardRef` erases generics, so the cast restores the polymorphic signature:
 * without it every call site would collapse to the default element's props.
 */
export const Typography = forwardRef(TypographyImpl) as <E extends ElementType = "p">(
  props: TypographyProps<E> & { ref?: Ref<Element> },
) => ReturnType<typeof TypographyImpl>;
