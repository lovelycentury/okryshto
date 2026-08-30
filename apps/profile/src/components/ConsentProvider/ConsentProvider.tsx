"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  CookieBanner,
  CookieConsentProvider,
  CookieSettings,
  type CategoryConfig,
  type CookieConsentConfig,
} from "@/components/CookieConsent";
import { CONSENT_EXPIRATION_DAYS, CONSENT_VERSION, GOOGLE_CONSENT_MODE } from "@/lib/analytics";

/**
 * App-side wiring for the vendored Open Cookie Consent kit: the config the kit
 * cannot know (version, categories, Google mapping) plus the banner and the
 * settings modal, so every consumer of `useCookieConsent` sits under one
 * provider.
 *
 * `children` is rendered inside it, which is what lets the footer's
 * `CookieTrigger` reach the context.
 */
export default function ConsentProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("CookieConsent");

  const config = useMemo<CookieConsentConfig>(() => {
    // Only the two categories this site actually has. Leaving `marketing` and
    // `preferences` out is what keeps their Google signals denied for good.
    const categories: CategoryConfig[] = [
      {
        key: "necessary",
        title: t("categories.necessary.title"),
        description: t("categories.necessary.description"),
        required: true,
      },
      {
        key: "analytics",
        title: t("categories.analytics.title"),
        description: t("categories.analytics.description"),
      },
    ];

    return {
      consentVersion: CONSENT_VERSION,
      expirationDays: CONSENT_EXPIRATION_DAYS,
      position: "bottom",
      googleConsentMode: GOOGLE_CONSENT_MODE,
      categories,
    };
  }, [t]);

  return (
    <CookieConsentProvider config={config}>
      {children}
      <CookieBanner />
      <CookieSettings />
    </CookieConsentProvider>
  );
}
