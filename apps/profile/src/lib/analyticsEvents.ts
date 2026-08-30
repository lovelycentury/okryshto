/**
 * GA4 custom events for the profile site.
 *
 * Only what Enhanced Measurement misses lives here. Outbound clicks on the
 * project and link cards already arrive as the built-in `click` event with
 * `link_url`, so they are not re-sent — the events below cover in-page anchors,
 * buttons, preference switches and field performance, none of which GA sees on
 * its own.
 *
 * Every param has to be registered as a custom dimension (or metric, for the
 * numeric ones) in GA4 Admin before it shows up outside Realtime and BigQuery.
 */

type EventParams = Record<string, string | number | boolean>;

/**
 * `window.gtag` is defined by CONSENT_BOOTSTRAP_SCRIPT, which only ships in
 * production builds — in `next dev` every call below is a silent no-op rather
 * than a crash. Consent is handled upstream by Consent Mode: while analytics is
 * denied these still send, but cookielessly.
 */
function track(name: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}

/** How a visitor reached out. `copy_email` is the button; the rest are links. */
export type ContactMethod = "copy_email" | "linkedin" | "github" | "onyx" | "email";

export function trackContactIntent(method: ContactMethod): void {
  track("contact_intent", { method });
}

/** The two hero buttons. They are same-page anchors, so GA never sees them. */
export function trackCtaClick(ctaId: "see_work" | "get_in_touch"): void {
  track("cta_click", { cta_id: ctaId });
}

/**
 * Duplicates the built-in outbound `click` on purpose: this one carries a
 * readable `project_id` instead of a URL that has to be parsed in reports.
 */
export function trackProjectOpen(projectId: string): void {
  track("project_open", { project_id: projectId });
}

let contactReached = false;

/**
 * Fired once per section, the first time it scrolls into view. On a one-page
 * site this is the real depth funnel — the built-in `scroll` event only fires
 * once, at 90%.
 */
export function trackSectionView(sectionId: string): void {
  track("section_view", { section_id: sectionId });

  // Reaching the contact block is the end of the funnel, so its timestamp is
  // worth its own metric: it separates a ten-second skim from a real read.
  if (sectionId === "contact" && !contactReached) {
    contactReached = true;
    track("time_to_contact", { seconds: Math.round(performance.now() / 1000) });
  }
}

export function trackLocaleSwitch(from: string, to: string): void {
  track("locale_switch", { from_locale: from, to_locale: to });
}

export function trackThemeSwitch(theme: "light" | "dark"): void {
  track("theme_switch", { theme });
}

/**
 * What share of visitors is measurable at all. Every other number here should
 * be read against this one.
 */
export function trackConsentChoice(action: string, analyticsGranted: boolean): void {
  track("consent_choice", { action, analytics_granted: analyticsGranted });
}

export function trackWebVital(metric: {
  name: string;
  value: number;
  rating: string;
  id: string;
  navigationType: string;
}): void {
  track("web_vitals", {
    // CLS is an unitless fraction (0.05); GA4 metrics are integers, so it is
    // scaled by 1000 the way web.dev's own GA recipe does. The rest are ms.
    metric_name: metric.name,
    metric_value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    metric_rating: metric.rating,
    metric_id: metric.id,
    navigation_type: metric.navigationType,
  });
}

/** GA4's recommended event name for errors, with its documented params. */
export function trackException(description: string, fatal = false): void {
  track("exception", { description: description.slice(0, 100), fatal });
}
