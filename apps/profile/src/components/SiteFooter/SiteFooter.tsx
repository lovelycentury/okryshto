import { getTranslations } from "next-intl/server";
import { Logo } from "@okkly/react";
import { CookieTrigger } from "@/components/CookieConsent";
import { CONTACT_LINKS } from "@/lib/profile";
import styles from "./SiteFooter.module.scss";

export default async function SiteFooter() {
  const t = await getTranslations("Footer");
  const tContact = await getTranslations("Contact");

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.hairline} />
        <div className={styles.row}>
          <Logo layout="horizontal" size={28} />
          <nav className={styles.links}>
            {CONTACT_LINKS.map(({ id, href }) => (
              <a key={id} className={styles.link} href={href}>
                {tContact(`links.${id}`)}
              </a>
            ))}
          </nav>
        </div>
        <div className={`${styles.row} ${styles.meta}`}>
          {/* Passed as a string so ICU renders "2026", not the grouped "2,026". */}
          <p>{t("copyright", { year: String(new Date().getFullYear()) })}</p>
          <p>{t("credit")}</p>
          {/* Withdrawing consent has to be as easy as giving it, so the
              settings modal keeps a permanent entry point here. */}
          <CookieTrigger />
        </div>
      </div>
    </footer>
  );
}
