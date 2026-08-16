"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./RevealOnView.module.scss";

type RevealOnViewProps = {
  children: ReactNode;
};

/**
 * Fades a section in once it enters the viewport (opacity 0 → 1).
 * Disconnects after the first reveal; respects prefers-reduced-motion.
 */
export default function RevealOnView({ children }: RevealOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.42, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.root} data-visible={visible ? "" : undefined}>
      {children}
    </div>
  );
}
