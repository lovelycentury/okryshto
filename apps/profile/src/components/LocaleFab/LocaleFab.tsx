"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Fab, Icon, type FabColor } from "@okkly/react";
import { trackLocaleSwitch } from "@/lib/analyticsEvents";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import styles from "./LocaleFab.module.scss";

const LANGUAGE_OPTIONS: readonly {
  id: Locale;
  short: string;
  color: FabColor;
}[] = [
  { id: "ru", short: "RU", color: "dante" },
  { id: "uk", short: "UK", color: "indigo" },
  { id: "en", short: "EN", color: "primary" },
  { id: "de", short: "DE", color: "violet" },
];

/**
 * Speed-dial FAB (composed like the Storybook Fab SpeedDial story) for locale switching.
 */
export default function LocaleFab() {
  const t = useTranslations("LocaleFab");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const current = LANGUAGE_OPTIONS.find((option) => option.id === locale) ?? LANGUAGE_OPTIONS[2];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectLocale = (next: Locale) => {
    setOpen(false);
    if (next === locale || !routing.locales.includes(next)) return;
    trackLocaleSwitch(locale, next);
    router.replace(pathname, { locale: next });
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.dial} data-open={open ? "" : undefined} id={menuId} role="menu">
        {LANGUAGE_OPTIONS.map(({ id, short, color }) => {
          const active = id === locale;
          return (
            <div className={styles.option} key={id} role="none">
              <Fab
                size="small"
                variant={active ? "standard" : "soft"}
                color={color}
                icon={<span className={styles.optionCode}>{short}</span>}
                aria-label={t(`languages.${id}`)}
                aria-current={active ? "true" : undefined}
                role="menuitem"
                onClick={() => selectLocale(id)}
              />
            </div>
          );
        })}
      </div>

      <Fab
        className={styles.trigger}
        color={current.color}
        size="large"
        icon={<Icon name={open ? "iconX" : "iconLanguages"} fontSize="medium" />}
        aria-label={open ? t("close") : t("open")}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      />
    </div>
  );
}
