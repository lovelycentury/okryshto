"use client";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { trackException, trackWebVital } from "@/lib/analyticsEvents";

/**
 * The two page-wide listeners: Core Web Vitals and uncaught errors. Both need a
 * client boundary and neither belongs to any one section, so they get their own
 * component mounted once from the layout.
 *
 * `useReportWebVitals` ships with Next, so there is no `web-vitals` dependency
 * to add.
 */
export default function Analytics() {
  // A stable module-scope callback would be ideal, but `trackWebVital` already
  // is one — passing it directly keeps the reference identical across renders,
  // which is what stops Next from replaying metrics.
  useReportWebVitals(trackWebVital);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      trackException(`${event.message} @ ${event.filename}:${event.lineno}`, true);
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      trackException(`unhandled rejection: ${String(event.reason)}`);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
