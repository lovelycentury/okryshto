import { useTranslations } from "use-intl";
import { Spinner, Typography } from "@okryshto/react";

import styles from "./SearchingRow.module.scss";

export function SearchingRow() {
  const t = useTranslations("Chat");

  return (
    <div className={styles.root} role="status">
      <Spinner size="small" color="primary" />
      <Typography variant="body-sm" color="secondary">
        {t("searching")}
      </Typography>
    </div>
  );
}
