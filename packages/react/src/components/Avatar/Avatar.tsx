"use client";

import { forwardRef, useState, type HTMLAttributes } from "react";
import "@okkly/design-system/components/Avatar/Avatar.scss";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "rounded";
export type AvatarStatus = "online" | "offline";
export type AvatarColor = "mint" | "dante" | "indigo";

/**
 * Props follow MUI's Avatar API (https://mui.com/material-ui/api/avatar/) where
 * shapes line up: `src`/`alt` match name-for-name, `shape` covers MUI's
 * `variant="circular"|"rounded"` (no `"square"` — not part of this design).
 * Deliberate gaps/additions: `initials` replaces MUI's `children` (this design
 * always renders letters, never an arbitrary node), `status` adds a presence
 * dot MUI doesn't have, `color` cycles this design's tone palette instead of
 * MUI's single `sx`-driven background.
 */
export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /**
   * Image source; falls back to `initials` when unset or when it fails to load.
   *
   * @default undefined
   * @type {string}
   */
  src?: string;
  /**
   * Accessible name for the image. Also exposes the avatar as `role="img"` when set.
   *
   * @default undefined
   * @type {string}
   */
  alt?: string;
  /**
   * Fallback letters, shown when there's no image. Only the first two characters are used.
   *
   * @default undefined
   * @type {string}
   */
  initials?: string;
  /**
   * Presence dot. Omit for no status.
   *
   * @default undefined
   * @type {AvatarStatus}
   */
  status?: AvatarStatus;
  /**
   * Avatar shape.
   *
   * @default "circle"
   * @type {AvatarShape}
   */
  shape?: AvatarShape;
  /**
   * Avatar diameter.
   *
   * @default "md"
   * @type {AvatarSize}
   */
  size?: AvatarSize;
  /**
   * Gradient tone, used when no image is shown.
   *
   * @default "mint"
   * @type {AvatarColor}
   */
  color?: AvatarColor;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { src, alt, initials, status, shape = "circle", size = "md", color = "mint", className, ...rest },
  ref,
) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!src && !imageFailed;

  const classes = [
    "okkly-component",
    "okkly-avatar",
    shape === "rounded" && "okkly-avatar--rounded",
    size !== "md" && `okkly-avatar--${size}`,
    !showImage && color !== "mint" && `okkly-avatar--color-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} role={alt ? "img" : undefined} aria-label={alt} {...rest}>
      {showImage ? (
        <img
          className="okkly-avatar__image"
          src={src}
          alt=""
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="okkly-avatar__initials" aria-hidden="true">
          {(initials ?? "").slice(0, 2)}
        </span>
      )}
      {status && (
        <span
          className={[
            "okkly-avatar__status",
            status === "offline" && "okkly-avatar__status--offline",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      )}
    </div>
  );
});
