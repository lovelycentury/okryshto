import { useTranslations } from "use-intl";
import { Avatar, Chip, Typography } from "@okryshto/react";

import { AgentMark } from "../AgentMark.js";
import { CookieTrigger } from "../CookieConsent/index.js";
import { PROFILE, SIDEBAR_FOOTER, STARTER_KEYS } from "../../config/content.js";
import { useChatController } from "../../hooks/chat-context.js";
import styles from "./Sidebar.module.scss";

/**
 * There is no "new conversation" control by design: a visitor gets exactly one
 * conversation, it lives in `sessionStorage`, and a fresh tab is a fresh one.
 */
export function Sidebar({ className }: { className?: string }) {
  const { send, isStreaming } = useChatController();
  const t = useTranslations("Sidebar");
  const tStarter = useTranslations("Starters");

  return (
    <aside className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.profile}>
        <Avatar
          size="md"
          src={PROFILE.photo}
          initials="OK"
          alt={PROFILE.name}
          className={styles.avatar}
        />
        <div className={styles.identity}>
          <Typography variant="label-md">{PROFILE.name}</Typography>
          <Typography variant="caption" color="secondary">
            {PROFILE.role}
          </Typography>
        </div>
      </div>

      <Typography variant="body-sm" color="secondary" className={styles.blurb}>
        {t("blurb")}
      </Typography>

      <div className={styles.starters}>
        <Typography variant="overline" color="muted" as="p" className={styles.startersLabel}>
          {t("startWith")}
        </Typography>
        <ul className={styles.starterList}>
          {STARTER_KEYS.map((key) => {
            const prompt = tStarter(key);
            return (
              <li key={key}>
                <button
                  type="button"
                  className={styles.starter}
                  disabled={isStreaming}
                  onClick={() => send(prompt)}
                >
                  {prompt}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.footer}>
        <div className={styles.brand}>
          <AgentMark />
          <Typography variant="label-sm">{SIDEBAR_FOOTER.product}</Typography>
          <Chip
            variant="outline"
            size="small"
            label={SIDEBAR_FOOTER.badge}
            className={styles.badge}
          />
        </div>

        <a className={styles.email} href={`mailto:${PROFILE.email}`}>
          {PROFILE.email}
        </a>

        <Typography variant="caption" color="muted" as="p" className={styles.disclaimer}>
          {t("disclaimer")}
        </Typography>

        {/* Withdrawing consent has to be as easy as giving it, so this stays reachable
            once the banner is gone. It renders nothing until a first decision exists. */}
        <CookieTrigger className={styles.cookieTrigger} />
      </div>
    </aside>
  );
}
