import { getTranslations } from "next-intl/server";
import SectionHeading from "@/components/SectionHeading/SectionHeading";
import { SECTION_ID } from "@/lib/profile";
import styles from "./IntroSection.module.scss";

export default async function IntroSection() {
  const t = await getTranslations("Intro");

  return (
    <section className={styles.section} id={SECTION_ID.about}>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <p className={styles.body}>{t("body")}</p>
      <span className={styles.orb} aria-hidden="true" />
    </section>
  );
}
