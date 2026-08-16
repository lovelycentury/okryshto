import { locale as localeRootParam } from "next/root-params";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";

const loadMessages: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import("../../messages/en.json"),
  uk: () => import("../../messages/uk.json"),
  ru: () => import("../../messages/ru.json"),
  de: () => import("../../messages/de.json"),
};

// `next/root-params` reads the `[locale]` segment above the root layout, so any
// Server Component can resolve it without `setRequestLocale` — that API is
// deprecated in next-intl 4.13. `requestLocale` stays as the fallback for
// requests that never reach a `[locale]` route (e.g. the global not-found).
//
// Messages are `import()`ed so Next traces them into `output: "standalone"`.
// `readFile` from `src/i18n` does not survive the Docker image (no source tree).
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = (await localeRootParam()) ?? (await requestLocale);
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const { default: messages } = await loadMessages[locale]();

  return {
    locale,
    messages,
  };
});
