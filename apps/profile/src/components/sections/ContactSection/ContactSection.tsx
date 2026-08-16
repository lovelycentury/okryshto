"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@okryshto/react";
import { CONTACT, CONTACT_LINKS, SECTION_ID } from "@/lib/profile";
import styles from "./ContactSection.module.scss";

export default function ContactSection() {
  const t = useTranslations("Contact");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
    } catch {
      // Clipboard access can be denied (insecure context, permissions); the
      // address stays visible on the chip, so there is nothing to recover from.
    }
  };

  return (
    <section className={styles.section} id={SECTION_ID.contact}>
      <div className={styles.card}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h2 className={styles.title}>{t("title")}</h2>
        </div>

        <div className={styles.row}>
          <button
            type="button"
            className={styles.emailChip}
            onClick={copyEmail}
            aria-label={t("copyEmail")}
          >
            <Icon name="iconMail" fontSize="small" />
            {CONTACT.email}
            <Icon
              name={copied ? "iconCheck" : "iconCopy"}
              fontSize="small"
              className={copied ? styles.copied : undefined}
            />
          </button>
          <span aria-live="polite" className={styles.copied}>
            {copied ? t("copied") : ""}
          </span>

          <p className={styles.availability}>
            <span className={styles.dot} aria-hidden="true" />
            {t("availability")}
          </p>
        </div>

        <nav className={styles.links}>
          {CONTACT_LINKS.map(({ id, href }) => (
            <a key={id} className={styles.link} href={href}>
              {t(`links.${id}`)}
              <Icon name="iconArrowUpRight" fontSize="small" />
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
