import { getTranslations } from "next-intl/server";
import SectionHeading from "@/components/SectionHeading/SectionHeading";
import { PROJECTS, SECTION_ID } from "@/lib/profile";
import ProjectsGrid, { type ProjectCardData } from "./ProjectsGrid";
import styles from "./ProjectsSection.module.scss";

export default async function ProjectsSection() {
  const t = await getTranslations("Projects");

  const projects: ProjectCardData[] = PROJECTS.map(({ id, href, gradient, gradientLight }) => ({
    id,
    href,
    gradient,
    gradientLight,
    title: t(`items.${id}.title`),
    description: t(`items.${id}.description`),
    tags: t.raw(`items.${id}.tags`) as string[],
  }));

  return (
    <section className={styles.section} id={SECTION_ID.work}>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <ProjectsGrid projects={projects} />
    </section>
  );
}
