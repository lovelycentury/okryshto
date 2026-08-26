import { getTranslations } from "next-intl/server";
import { Button, Icon, Photo } from "@okryshto/react";
import { SECTION_ID } from "@/lib/profile";
import styles from "./HeroSection.module.scss";

export default async function HeroSection() {
  const t = await getTranslations("Hero");

  return (
    <section className={styles.section}>
      <div className={styles.layout}>
        <div className={styles.content}>
          <p className={styles.availability}>
            <span className={styles.dot} aria-hidden="true" />
            {t("availability")}
          </p>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.summary}>{t("summary")}</p>
          <p className={styles.meta}>
            <span>{t("role")}</span>
            <span aria-hidden="true">·</span>
            <span>{t("location")}</span>
          </p>
          <div className={styles.actions}>
            <Button
              variant="primary"
              shape="pill"
              size="large"
              href={`#${SECTION_ID.work}`}
              endIcon={<Icon name="iconArrowRight" fontSize="small" />}
            >
              {t("primaryCta")}
            </Button>
            <Button variant="glass" shape="pill" size="large" href={`#${SECTION_ID.contact}`}>
              {t("secondaryCta")}
            </Button>
          </div>
        </div>

        <div className={styles.portrait}>
          <div className={styles.plate}>
            <Photo
              className={styles.photoDark}
              alt={t("portraitAlt")}
              variant="scrim"
              size="lg"
              image="/images/me-light.jpg"
              caption="Oleksii Kryshtopa"
            />
            <Photo
              className={styles.photoLight}
              alt={t("portraitAlt")}
              variant="scrim"
              size="lg"
              image="/images/me-light.jpg"
              caption="Oleksii Kryshtopa"
            />
            {/* <Icon name="iconUser" fontSize="large" className={styles.glyph} />
            <p className={styles.caption}>{t("portraitPlaceholder")}</p> */}
          </div>
        </div>
      </div>
    </section>
  );
}
