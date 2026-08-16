import { getTranslations } from "next-intl/server";
import { Icon } from "@okryshto/react";
import SectionHeading from "@/components/SectionHeading/SectionHeading";
import { BEYOND_CODE } from "@/lib/profile";
import styles from "./BeyondCodeSection.module.scss";

export default async function BeyondCodeSection() {
  const t = await getTranslations("BeyondCode");

  return (
    <section className={styles.section}>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

      <div className={styles.grid}>
        {BEYOND_CODE.map((card) => (
          <article className={styles.card} key={card.id}>
            <div className={styles.header}>
              <span className={styles.icon}>
                <Icon name={card.icon} fontSize="small" color="primary" />
              </span>
              <h3 className={styles.title}>{t(`items.${card.id}.title`)}</h3>
            </div>
            <p className={styles.body}>{t(`items.${card.id}.body`)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
