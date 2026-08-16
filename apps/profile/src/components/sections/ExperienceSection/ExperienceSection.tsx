import { getTranslations } from "next-intl/server";
import SectionHeading from "@/components/SectionHeading/SectionHeading";
import { EXPERIENCE } from "@/lib/profile";
import styles from "./ExperienceSection.module.scss";

type ExperienceItemMessages = {
  company: string;
  role: string;
  period: string;
  place: string;
  summary: string;
  bullets: string[];
  tags: string[];
};

export default async function ExperienceSection() {
  const t = await getTranslations("Experience");

  return (
    <section className={styles.section}>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

      <div className={styles.grid}>
        {EXPERIENCE.map(({ id }) => {
          const item = t.raw(`items.${id}`) as ExperienceItemMessages;

          return (
            <article className={styles.card} key={id}>
              <header className={styles.header}>
                <div className={styles.heading}>
                  <h3 className={styles.company}>{item.company}</h3>
                  <p className={styles.role}>{item.role}</p>
                </div>
                <p className={styles.meta}>
                  <span>{item.period}</span>
                  <span className={styles.metaSep} aria-hidden="true">
                    ·
                  </span>
                  <span>{item.place}</span>
                </p>
              </header>

              <p className={styles.summary}>{item.summary}</p>

              <ul className={styles.bullets}>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>

              <ul className={styles.tags}>
                {item.tags.map((tag) => (
                  <li className={styles.tag} key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
