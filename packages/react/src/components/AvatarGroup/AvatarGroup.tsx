"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import "@okkly/design-system/components/AvatarGroup/AvatarGroup.scss";
import { type AvatarColor, type AvatarProps, type AvatarSize } from "../Avatar/Avatar";

export type AvatarGroupSize = AvatarSize;
export type AvatarGroupSpacing = "dense" | "default" | "loose";

/**
 * Props follow MUI's AvatarGroup API (https://mui.com/material-ui/api/avatar-group/)
 * for `max`/`total`, and `children` are plain `Avatar` elements, mirroring MUI.
 * Deliberate gaps/renames: `spacing` takes this design's three named steps
 * instead of a raw px number, `size` overrides every member's `Avatar` size
 * instead of relying on MUI's `sx`-based sizing, `hues` cycles this design's
 * tone palette across members instead of MUI's single `variant`, no
 * `renderSurplus` (the surplus chip's look is fixed by the design).
 */
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `Avatar` elements to stack. Their own `size`/`color` are overridden by this component.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Avatars visible before the "+N" chip.
   *
   * @default 5
   * @type {number}
   */
  max?: number;
  /**
   * Real member count backing the "+N" chip, when higher than the number of `children`.
   *
   * @default undefined
   * @type {number}
   */
  total?: number;
  /**
   * Diameter applied to every member.
   *
   * @default "sm"
   * @type {AvatarGroupSize}
   */
  size?: AvatarGroupSize;
  /**
   * Overlap amount.
   *
   * @default "default"
   * @type {AvatarGroupSpacing}
   */
  spacing?: AvatarGroupSpacing;
  /**
   * Canvas-coloured separator ring around each member.
   *
   * @default true
   * @type {boolean}
   */
  ring?: boolean;
  /**
   * Gradient tone cycled across members, in order.
   *
   * @default ["mint"]
   * @type {AvatarColor[]}
   */
  hues?: AvatarColor[];
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

export function AvatarGroup({
  children,
  max = 5,
  total,
  size = "sm",
  spacing = "default",
  ring = true,
  hues = ["mint"],
  className,
  ...rest
}: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
  const effectiveTotal = total ?? items.length;
  const renderedCount = items.length > max ? Math.max(max - 1, 0) : items.length;
  const overflowCount = effectiveTotal - renderedCount;

  const classes = [
    "okkly-component",
    "okkly-avatar-group",
    size !== "sm" && `okkly-avatar-group--${size}`,
    spacing !== "default" && `okkly-avatar-group--${spacing}`,
    !ring && "okkly-avatar-group--no-ring",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {items.slice(0, renderedCount).map((child, index) => (
        <span className="okkly-avatar-group__item" key={child.key ?? index}>
          {cloneElement(child, { size, color: hues[index % hues.length] })}
        </span>
      ))}
      {overflowCount > 0 && (
        <span className="okkly-avatar-group__item">
          <span className="okkly-avatar-group__overflow">+{overflowCount}</span>
        </span>
      )}
    </div>
  );
}
