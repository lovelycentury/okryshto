"use client";

import { useEffect, useRef, useState } from "react";
import NumberFlow, { NumberFlowGroup, continuous } from "@number-flow/react";
import styles from "./CredibilitySection.module.scss";

export type CredibilityStat = {
  id: string;
  value: number;
  suffix: string;
  label: string;
};

type CredibilityStatsProps = {
  stats: readonly CredibilityStat[];
};

/**
 * Animates the credibility counters with NumberFlow once the row enters view.
 * Starts at 0 and counts up; respects prefers-reduced-motion via NumberFlow.
 */
export default function CredibilityStats({ stats }: CredibilityStatsProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  return (
    <NumberFlowGroup>
      <div className={styles.statRow} ref={rowRef}>
        {stats.map(({ id, value, suffix, label }) => (
          <div className={styles.stat} key={id}>
            <p className={styles.statValue}>
              <NumberFlow
                className={styles.statNumber}
                value={inView ? value : 0}
                suffix={suffix}
                plugins={[continuous]}
                spinTiming={{ duration: 900, easing: "ease-out" }}
                transformTiming={{ duration: 900, easing: "ease-out" }}
                opacityTiming={{ duration: 400, easing: "ease-out" }}
              />
            </p>
            <p className={styles.statLabel}>{label}</p>
          </div>
        ))}
      </div>
    </NumberFlowGroup>
  );
}
