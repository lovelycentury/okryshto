import { getTranslations } from "next-intl/server";
import { Icon } from "@okryshto/react";
import SectionHeading from "@/components/SectionHeading/SectionHeading";
import { SECTION_ID, SKILL_GROUPS } from "@/lib/profile";
import styles from "./SkillsSection.module.scss";

export default async function SkillsSection() {
  const t = await getTranslations("Skills");

  const columns = ([1, 2] as const).map((column) =>
    SKILL_GROUPS.filter((group) => group.column === column),
  );

  return (
    <section className={styles.section} id={SECTION_ID.stack}>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

      <div className={styles.columns}>
        {columns.map((groups, index) => (
          <div className={styles.column} key={index}>
            {groups.map((group) => (
              <div className={styles.group} key={group.id}>
                <h3 className={styles.groupTitle}>{t(`groups.${group.id}`)}</h3>
                <ul className={styles.items}>
                  {group.items.map((item) => (
                    <li className={styles.pill} key={`${group.id}-${item.key}`}>
                      <Icon name={item.icon} fontSize="small" color="primary" />
                      {t(`items.${item.key}`)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
