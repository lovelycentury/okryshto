"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { trackSectionView } from "@/lib/analyticsEvents";
import styles from "./RevealOnView.module.scss";

type RevealOnViewProps = {
  children: ReactNode;
  /** Slug reported as `section_id`; omit to reveal without measuring. */
  section?: string;
};

/**
 * Fades a section in once it enters the viewport (opacity 0 → 1) and reports
 * that it was seen. Disconnects after the first reveal.
 *
 * The observer now runs even when motion is reduced — that preference only
 * decides whether the fade is skipped, and the depth funnel should not go blind
 * for those visitors.
 */
export default function RevealOnView({ children, section }: RevealOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        if (section) trackSectionView(section);
        observer.disconnect();
      },
      { threshold: 0.42, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [section]);

  return (
    <div ref={ref} className={styles.root} data-visible={visible ? "" : undefined}>
      {children}
    </div>
  );
}
