import type { GoogleConsentModeConfig } from "@/components/CookieConsent";

/**
 * Google Analytics 4 (gtag.js) for the profile site.
 *
 * The measurement ID is not a secret — it ships in the page source of every
 * GA-instrumented site — so it lives here rather than in an env var. That also
 * keeps ops/Dockerfile.profile argument-free: NEXT_PUBLIC_* values are inlined
 * at `next build` time, so an env var would need build args plumbed through the
 * image and CI before it could change anything.
 */
export const GA_MEASUREMENT_ID = "G-7SXXQMCTTC";

/**
 * `next dev` sets NODE_ENV=development, so local development never reports.
 * The flag is inlined at build time: a production build reports wherever it
 * runs, including a local `next start`.
 */
export const isAnalyticsEnabled = process.env.NODE_ENV === "production";

/** Must match `STORAGE_KEY` in `components/CookieConsent/utils.ts`. */
export const CONSENT_STORAGE_KEY = "cookie-consent";

/**
 * Bump when the categories or their wording change materially: the provider
 * discards stored consent recorded under a different version and asks again.
 */
export const CONSENT_VERSION = "1.0.0";

export const CONSENT_EXPIRATION_DAYS = 180;

/**
 * How consent categories map onto Google's consent signals. Passed to the
 * provider so it emits the full set on every `consent update` — `marketing`
 * and `preferences` are not offered as categories, which pins the ad and
 * personalization signals to "denied" for good.
 */
export const GOOGLE_CONSENT_MODE: GoogleConsentModeConfig = {
  enabled: true,
  mapping: {
    analytics_storage: "analytics",
    ad_storage: "marketing",
    ad_user_data: "marketing",
    ad_personalization: "marketing",
    functionality_storage: "preferences",
    personalization_storage: "preferences",
    security_storage: "necessary",
  },
};

/**
 * Blocking head script, run before gtag.js: Google only honours a
 * `consent default` that is already in `dataLayer` when the tag fires, and
 * anything in a React effect is too late (see components/CookieConsent/README).
 *
 * Everything starts denied. A returning visitor's stored decision is replayed
 * here instead, so their accepted state survives a reload and repeat visits
 * skip the `wait_for_update` hold.
 */
export const CONSENT_BOOTSTRAP_SCRIPT = `(function(){window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};var a="denied";try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  CONSENT_STORAGE_KEY,
)})||"null");if(s&&s.hasConsented&&s.consentVersion===${JSON.stringify(
  CONSENT_VERSION,
)}&&(!s.expiresAt||new Date(s.expiresAt)>new Date())&&s.categories&&s.categories.analytics){a="granted"}}catch(e){}window.gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",personalization_storage:"denied",functionality_storage:"denied",security_storage:"granted",analytics_storage:a,wait_for_update:500});})();`;
