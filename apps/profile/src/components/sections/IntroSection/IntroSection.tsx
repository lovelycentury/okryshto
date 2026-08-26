import { getTranslations } from "next-intl/server";
import SectionHeading from "@/components/SectionHeading/SectionHeading";
import { SECTION_ID } from "@/lib/profile";
import styles from "./IntroSection.module.scss";

const BODY_KEYS = ["drive", "scale", "mentoring", "communication"] as const;

export default async function IntroSection() {
  const t = await getTranslations("Intro");

  return (
    <section className={styles.section} id={SECTION_ID.about}>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <div className={styles.copy}>
        <p className={styles.lead}>{t("lead")}</p>
        {BODY_KEYS.map((key) => (
          <p className={styles.body} key={key}>
            {t(key)}
          </p>
        ))}
      </div>
      <span className={styles.orb} aria-hidden="true" />
    </section>
  );
}
