import { getTranslations } from "next-intl/server";
import { CONTACT, STATS } from "@/lib/profile";
import CredibilityStats from "./CredibilityStats";
import styles from "./CredibilitySection.module.scss";

export default async function CredibilitySection() {
  const t = await getTranslations("Credibility");

  const stats = STATS.map(({ id, value, suffix }) => ({
    id,
    value,
    // `+` / `K+` are locale-invariant; only the place suffix is translated.
    suffix: suffix ?? t(`stats.${id}.suffix`),
    label: t(`stats.${id}.label`),
  }));

  return (
    <section className={styles.section}>
      <CredibilityStats stats={stats} />

      <figure className={styles.quote}>
        <blockquote className={styles.quoteText}>{t("quote")}</blockquote>
        <figcaption className={styles.quoteAuthor}>
          <a className={styles.quoteAuthorLink} href={CONTACT.onyxPrs}>
            {t("quoteAuthor")}
          </a>
        </figcaption>
      </figure>

      <div className={styles.award}>
        <h3 className={styles.awardTitle}>{t("awardTitle")}</h3>
        <p className={styles.awardMeta}>{t("awardMeta")}</p>
        <a className={styles.awardLink} href={CONTACT.award}>
          {t("awardLink")}
        </a>
      </div>
    </section>
  );
}
