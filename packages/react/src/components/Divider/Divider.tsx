"use client";

import { forwardRef, type HTMLAttributes, type ReactNode, type Ref } from "react";
import "@okryshto/design-system/components/Divider/Divider.scss";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "fullWidth" | "inset" | "middle";
export type DividerTextAlign = "left" | "center" | "right";

/**
 * Props follow MUI's Divider API (https://mui.com/material-ui/api/divider/) as closely
 * as this design allows: `orientation`/`flexItem`/`children`/`textAlign`/`variant`
 * match name-for-name. Deliberate gaps: no `sx`/`classes`, no `absolute` positioning
 * (always in-flow), `variant` maps to inset spacing on the line segments.
 */
export interface DividerProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /**
   * Line direction.
   *
   * @default "horizontal"
   * @type {DividerOrientation}
   */
  orientation?: DividerOrientation;
  /**
   * Stretch to fill a flex container's cross axis.
   *
   * @default false
   * @type {boolean}
   */
  flexItem?: boolean;
  /**
   * Optional centered label (e.g. "OR").
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
  /**
   * Label alignment when `children` is set.
   *
   * @default "center"
   * @type {DividerTextAlign}
   */
  textAlign?: DividerTextAlign;
  /**
   * Inset spacing variant.
   *
   * @default "fullWidth"
   * @type {DividerVariant}
   */
  variant?: DividerVariant;
}

export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  {
    orientation = "horizontal",
    flexItem = false,
    children,
    textAlign = "center",
    variant = "fullWidth",
    className,
    ...rest
  },
  forwardedRef,
) {
  const hasLabel = Boolean(children) && orientation === "horizontal";

  const classes = [
    "okryshto-component",
    "okryshto-divider",
    orientation === "vertical" ? "okryshto-divider--vertical" : "okryshto-divider--horizontal",
    variant === "inset" && "okryshto-divider--inset",
    variant === "middle" && "okryshto-divider--middle",
    hasLabel && "okryshto-divider--with-label",
    flexItem && "okryshto-divider--flex-item",
    textAlign !== "center" && `okryshto-divider--align-${textAlign}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (orientation === "vertical") {
    return <hr ref={forwardedRef as Ref<HTMLHRElement>} className={classes} {...rest} />;
  }

  if (hasLabel) {
    return (
      <div ref={forwardedRef as Ref<HTMLDivElement>} className={classes} role="separator" {...rest}>
        <span className="okryshto-divider__label">{children}</span>
      </div>
    );
  }

  return <hr ref={forwardedRef as Ref<HTMLHRElement>} className={classes} {...rest} />;
});
