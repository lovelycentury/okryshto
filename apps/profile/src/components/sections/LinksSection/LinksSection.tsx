import { getTranslations } from "next-intl/server";
import { LinkCard } from "@okkly/react";
import SectionHeading from "@/components/SectionHeading/SectionHeading";
import { SELECTED_LINKS } from "@/lib/profile";
import styles from "./LinksSection.module.scss";

export default async function LinksSection() {
  const t = await getTranslations("Links");

  return (
    <section className={styles.section}>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} summary={t("summary")} />

      <div className={styles.list}>
        {SELECTED_LINKS.map(({ id, href, meta, featured }) => (
          <LinkCard
            key={id}
            href={href}
            featured={featured}
            title={t(`items.${id}.title`)}
            subtitle={t(`items.${id}.subtitle`)}
            meta={<span className={styles.meta}>{meta}</span>}
          />
        ))}
      </div>
    </section>
  );
}
