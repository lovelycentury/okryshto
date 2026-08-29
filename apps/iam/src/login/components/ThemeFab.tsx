import { useLayoutEffect, useState } from "react";
import { iconMoon, iconSun } from "@okryshto/icons";
import { Fab, Icon } from "@okryshto/react";
import { applyIamTheme, readDocumentTheme, type IamTheme } from "../theme";
import type { I18n } from "../i18n";

type ThemeFabProps = {
  i18n: I18n;
};

export function ThemeFab({ i18n }: ThemeFabProps) {
  const { msgStr } = i18n;
  const [theme, setTheme] = useState<IamTheme>("dark");

  useLayoutEffect(() => {
    setTheme(readDocumentTheme());
  }, []);

  const isLight = theme === "light";

  return (
    <Fab
      color="ice"
      icon={<Icon icon={isLight ? iconMoon : iconSun} />}
      aria-label={isLight ? msgStr("switchToDark") : msgStr("switchToLight")}
      aria-pressed={isLight}
      onClick={() => {
        const next: IamTheme = isLight ? "dark" : "light";
        applyIamTheme(next);
        setTheme(next);
      }}
    />
  );
}
