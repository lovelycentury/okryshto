"use client";

import { useState, type HTMLAttributes, type ReactNode } from "react";
import "@okryshto/design-system/components/Photo/Photo.scss";
import { Skeleton } from "../Skeleton/Skeleton";

export type PhotoVariant = "plain" | "framed" | "scrim" | "noir" | "cutout";
export type PhotoSize = "sm" | "md" | "lg";
export type PhotoRadius = "none" | "sm" | "md" | "lg" | "xl";

const PhotoSilhouette = () => (
  <svg viewBox="0 0 210 280" className="okryshto-photo__silhouette" aria-hidden="true">
    <circle cx="105" cy="80.5" r="35.7" fill="currentColor" />
    <rect x="34.7" y="122.2" width="138.6" height="140" rx="69.3" fill="currentColor" />
  </svg>
);

/**
 * Portraits & hero cutouts on a dark background. Not for icons or logos — use Icon / SVG for those.
 */
export interface PhotoProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Source image (transparent PNG best for `cutout`). Falls back to a silhouette placeholder when omitted.
   *
   * @default undefined
   * @type {string}
   */
  image?: string;
  /**
   * Alt.
   *
   * @default undefined
   * @type {string}
   */
  alt: string;
  /**
   * Frame & overlay treatment.
   *
   * @default "plain"
   * @type {PhotoVariant}
   */
  variant?: PhotoVariant;
  /**
   * Adds the bottom darkening gradient on top of any `variant`. Implied by
   * `scrim`/`noir` and by `caption`, which is unreadable without it.
   *
   * @default false
   * @type {boolean}
   */
  scrim?: boolean;
  /**
   * Alias for `variant="cutout"` — drops the frame and the corners.
   *
   * @default false
   * @type {boolean}
   */
  transparent?: boolean;
  /**
   * Portrait dimensions.
   *
   * @default "md"
   * @type {PhotoSize}
   */
  size?: PhotoSize;
  /**
   * Name/role over the scrim.
   *
   * @default undefined
   * @type {string}
   */
  caption?: string;
  /**
   * Corners (ignored if cutout).
   *
   * @default "xl"
   * @type {PhotoRadius}
   */
  radius?: PhotoRadius;
  /**
   * Show a skeleton until the image loads.
   *
   * @default false
   * @type {boolean}
   */
  loading?: boolean;
  /**
   * Custom placeholder when no image is provided or it fails to load.
   *
   * @default undefined
   * @type {ReactNode}
   */
  fallback?: ReactNode;
}

export function Photo({
  image,
  alt,
  variant = "plain",
  scrim = false,
  transparent = false,
  size = "md",
  caption,
  radius = "xl",
  loading = false,
  fallback,
  className,
  ...rest
}: PhotoProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const isCutout = variant === "cutout" || transparent;
  // A caption is white text sitting on an unknown photo, so it brings its own
  // scrim — otherwise it is simply dropped, which is how it used to behave.
  const showScrim = (scrim || variant === "scrim" || variant === "noir" || !!caption) && !isCutout;
  const showNoir = variant === "noir" && !isCutout;
  // Gated on `loading`: without it the image was held at `opacity: 0` even when
  // the caller had opted out of the placeholder, so nothing at all was drawn
  // until `onLoad` fired.
  const showSkeleton = loading && !!image && !loaded && !failed;
  const showImage = !!image && !failed;
  const showPlaceholder = !image || failed;

  const classes = [
    "okryshto-component",
    "okryshto-photo",
    `okryshto-photo--${variant}`,
    `okryshto-photo--size-${size}`,
    !isCutout && radius !== "xl" && `okryshto-photo--radius-${radius}`,
    isCutout && "okryshto-photo--transparent",
    showScrim && "okryshto-photo--scrim",
    showNoir && "okryshto-photo--noir",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      <div className="okryshto-photo__frame">
        {showSkeleton && (
          <Skeleton variant="rectangular" animation="pulse" className="okryshto-photo__skeleton" />
        )}
        {showImage && (
          <img
            className="okryshto-photo__image"
            src={image}
            alt={alt}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            style={showSkeleton ? { opacity: 0, position: "absolute" } : undefined}
          />
        )}
        {showPlaceholder && (
          <div className="okryshto-photo__placeholder" role="img" aria-label={alt}>
            {fallback ?? <PhotoSilhouette />}
          </div>
        )}
        {showScrim && <div className="okryshto-photo__scrim-layer" />}
        {showNoir && (
          <>
            <div className="okryshto-photo__noir-top" />
            <div className="okryshto-photo__noir-left" />
            <div className="okryshto-photo__noir-right" />
          </>
        )}
        {caption && showScrim && <p className="okryshto-photo__caption">{caption}</p>}
      </div>
    </div>
  );
}
