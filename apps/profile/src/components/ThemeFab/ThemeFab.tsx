"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Fab, Icon } from "@okryshto/react";
import { trackThemeSwitch } from "@/lib/analyticsEvents";
import {
  applyProfileTheme,
  readDocumentTheme,
  readStoredTheme,
  readSystemTheme,
  type ProfileTheme,
} from "@/lib/theme";
import styles from "./ThemeFab.module.scss";

/**
 * Corner toggle for the profile-only light/dark palette.
 * Default follows `prefers-color-scheme` until the visitor picks one.
 */
export default function ThemeFab() {
  const t = useTranslations("ThemeFab");
  const [theme, setTheme] = useState<ProfileTheme>("dark");

  useEffect(() => {
    setTheme(readDocumentTheme());

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (readStoredTheme()) return;
      const next = readSystemTheme();
      applyProfileTheme(next, { persist: false });
      setTheme(next);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const isLight = theme === "light";

  return (
    <div className={styles.root}>
      <Fab
        className={styles.trigger}
        color="ice"
        size="large"
        icon={<Icon name={isLight ? "iconMoon" : "iconSun"} fontSize="medium" />}
        aria-label={isLight ? t("switchToDark") : t("switchToLight")}
        aria-pressed={isLight}
        onClick={() => {
          const next: ProfileTheme = isLight ? "dark" : "light";
          applyProfileTheme(next);
          setTheme(next);
          trackThemeSwitch(next);
        }}
      />
    </div>
  );
}
