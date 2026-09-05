"use client";

import { Button, Icon } from "@okkly/react";
import { trackCtaClick } from "@/lib/analyticsEvents";
import { SECTION_ID } from "@/lib/profile";

type HeroActionsProps = {
  className?: string;
  primaryLabel: string;
  secondaryLabel: string;
};

/**
 * Client island for the hero's two buttons. Both are same-page anchors, which
 * Enhanced Measurement ignores, so the only way to know whether the first
 * screen sends anyone anywhere is to report the clicks ourselves.
 */
export default function HeroActions({ className, primaryLabel, secondaryLabel }: HeroActionsProps) {
  return (
    <div className={className}>
      <Button
        variant="primary"
        shape="pill"
        size="large"
        href={`#${SECTION_ID.work}`}
        endIcon={<Icon name="iconArrowRight" fontSize="small" />}
        onClick={() => trackCtaClick("see_work")}
      >
        {primaryLabel}
      </Button>
      <Button
        variant="glass"
        shape="pill"
        size="large"
        href={`#${SECTION_ID.contact}`}
        onClick={() => trackCtaClick("get_in_touch")}
      >
        {secondaryLabel}
      </Button>
    </div>
  );
}
