"use client";

import type { CSSProperties } from "react";
import { Logo, ProjectCard } from "@okkly/react";
import { trackProjectOpen } from "@/lib/analyticsEvents";
import styles from "./ProjectsSection.module.scss";

export type ProjectCardData = {
  id: string;
  href: string;
  gradient: string;
  gradientLight: string;
  title: string;
  description: string;
  tags: string[];
};

type ProjectsGridProps = {
  projects: readonly ProjectCardData[];
};

/**
 * Client island for the project cards. The section itself stays a server
 * component and does the translating; this only adds the click report, which
 * carries a readable `project_id` the built-in outbound `click` cannot.
 */
export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  return (
    <div className={styles.grid}>
      {projects.map(({ id, href, gradient, gradientLight, title, description, tags }) => (
        <div className={styles.cell} key={id}>
          <ProjectCard
            className={styles.card}
            href={href}
            // @ts-ignore
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackProjectOpen(id)}
            style={
              {
                "--okkly-project-card-fill": gradient,
                "--okkly-project-card-fill-light": gradientLight,
              } as CSSProperties
            }
            logo={<Logo layout="compact" size={32} showLabel={false} />}
            title={title}
            description={description}
            tags={tags}
            device
          />
        </div>
      ))}
    </div>
  );
}
