"use client";

import type { HTMLAttributes, ReactNode } from "react";
import "@okryshto/design-system/components/ProjectCard/ProjectCard.scss";

export interface ProjectCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /**
   * Background image (transparent OK).
   *
   * @default undefined
   * @type {string}
   */
  image?: string;
  /**
   * Brand mark, top-left.
   *
   * @default undefined
   * @type {ReactNode}
   */
  logo?: ReactNode;
  /**
   * Project name.
   *
   * @default undefined
   * @type {string}
   */
  title: string;
  /**
   * One-two line summary.
   *
   * @default undefined
   * @type {string}
   */
  description?: string;
  /**
   * Category pills.
   *
   * @default []
   * @type {string[]}
   */
  tags?: string[];
  /**
   * Show device mockup.
   *
   * @default false
   * @type {boolean}
   */
  device?: boolean;
  /**
   * Opens the case (↗).
   *
   * @default undefined
   * @type {string}
   */
  href?: string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

/** Portfolio/case-study card. No MUI equivalent — this design has no reference API to mirror. */
export function ProjectCard({
  image,
  logo,
  title,
  description,
  tags = [],
  device = false,
  href,
  className,
  ...rest
}: ProjectCardProps) {
  const classes = ["okryshto-component", "okryshto-project-card", className]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {image && <img className="okryshto-project-card__background" src={image} alt="" />}
      <div className="okryshto-project-card__scrim" aria-hidden="true" />
      {device && (
        <div className="okryshto-project-card__device" aria-hidden="true">
          <div className="okryshto-project-card__device-screen" />
          <div className="okryshto-project-card__device-notch" />
          <div className="okryshto-project-card__device-line okryshto-project-card__device-line--1" />
          <div className="okryshto-project-card__device-line okryshto-project-card__device-line--2" />
          <div className="okryshto-project-card__device-line okryshto-project-card__device-line--3" />
          <div className="okryshto-project-card__device-line okryshto-project-card__device-line--4" />
        </div>
      )}
      <div className="okryshto-project-card__header">
        {logo && <div className="okryshto-project-card__logo">{logo}</div>}
        <div className="okryshto-project-card__action" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </div>
      </div>
      <div className="okryshto-project-card__body">
        {tags.length > 0 && (
          <div className="okryshto-project-card__tags">
            {tags.map((tag) => (
              <span key={tag} className="okryshto-project-card__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="okryshto-project-card__title">{title}</h3>
        {description && <p className="okryshto-project-card__description">{description}</p>}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...(rest as HTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }

  return (
    <div className={classes} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {content}
    </div>
  );
}
