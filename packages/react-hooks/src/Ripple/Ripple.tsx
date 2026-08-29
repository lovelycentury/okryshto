"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

interface RippleInstance {
  left: string;
  top: string;
  animationEnded: boolean;
}

type PointerLikeEvent = { clientX: number; clientY: number };

type TouchRippleEvents = {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
};

type MouseRippleEvents = {
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onMouseUp: () => void;
};

export interface UseRippleReturn {
  ripples: Map<string, RippleInstance>;
  events: TouchRippleEvents | MouseRippleEvents;
  hideRipple: (id: string | undefined) => void;
}

/**
 * Tracks ripple circles for a clickable element. `containerRef` is measured
 * for click-relative coordinates — usually the element the ripple overlay
 * paints into. Spread `events` onto whichever element receives the
 * mouse/touch input (often the same element).
 */
export function useRipple(containerRef: RefObject<HTMLElement | null>): UseRippleReturn {
  const isPointerDown = useRef(false);
  const [ripples, setRipples] = useState<Map<string, RippleInstance>>(new Map());

  const startRipple = useCallback(
    (point: PointerLikeEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      isPointerDown.current = true;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setRipples((prev) => {
        const next = new Map(prev);
        next.set(id, {
          left: `${point.clientX - rect.left}px`,
          top: `${point.clientY - rect.top}px`,
          animationEnded: false,
        });
        return next;
      });
    },
    [containerRef],
  );

  const hideRipple = useCallback((id: string | undefined) => {
    if (!id) return;
    setRipples((prev) => {
      const ripple = prev.get(id);
      if (!ripple) return prev;
      const next = new Map(prev);
      if (isPointerDown.current) {
        next.set(id, { ...ripple, animationEnded: true });
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const hideRipples = useCallback(() => {
    isPointerDown.current = false;
    setRipples((prev) => {
      const next = new Map([...prev].filter(([, r]) => !r.animationEnded));
      return next.size === prev.size ? prev : next;
    });
  }, []);

  const [usesTouch, setUsesTouch] = useState(false);
  useEffect(() => {
    setUsesTouch(!!window.matchMedia?.("(pointer: none)").matches);
  }, []);

  const events = usesTouch
    ? {
        onTouchStart: (e: React.TouchEvent) => e.touches[0] && startRipple(e.touches[0]),
        onTouchEnd: hideRipples,
        onTouchCancel: hideRipples,
      }
    : {
        onMouseDown: (e: React.MouseEvent) => startRipple(e),
        onMouseLeave: hideRipples,
        onMouseUp: hideRipples,
      };

  return { ripples, events, hideRipple };
}
