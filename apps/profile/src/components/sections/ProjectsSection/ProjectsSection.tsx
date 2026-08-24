import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { Logo, ProjectCard } from "@okryshto/react";
import SectionHeading from "@/components/SectionHeading/SectionHeading";
import { PROJECTS, SECTION_ID } from "@/lib/profile";
import styles from "./ProjectsSection.module.scss";

export default async function ProjectsSection() {
  const t = await getTranslations("Projects");

  return (
    <section className={styles.section} id={SECTION_ID.work}>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

      <div className={styles.grid}>
        {PROJECTS.map(({ id, href, gradient, gradientLight }) => (
          <div className={styles.cell} key={id}>
            <ProjectCard
              className={styles.card}
              href={href}
              // @ts-ignore
              target="_blank"
              rel="noopener noreferrer"
              style={
                {
                  "--okryshto-project-card-fill": gradient,
                  "--okryshto-project-card-fill-light": gradientLight,
                } as CSSProperties
              }
              logo={<Logo layout="compact" size={32} showLabel={false} />}
              title={t(`items.${id}.title`)}
              description={t(`items.${id}.description`)}
              tags={t.raw(`items.${id}.tags`) as string[]}
              device
            />
          </div>
        ))}
      </div>
    </section>
  );
}
