import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The triggering event is handed to the callback so overlays can forward it to
 * an `onClose(event, reason)` handler. Callbacks that ignore it still typecheck,
 * since a zero-argument function is assignable to one that takes arguments.
 */
export function useEscapeKey(handler: (event: KeyboardEvent) => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handler(event);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handler, enabled]);
}

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent) => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [ref, handler, enabled]);
}

export interface UseFocusTrapOptions {
  /**
   * Move focus to the first focusable child on mount. Separated from `enabled`
   * because MUI's Modal splits the two: `disableAutoFocus` keeps the Tab loop
   * while leaving the caller's own initial focus alone.
   */
  autoFocus?: boolean;
}

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  enabled = true,
  { autoFocus = true }: UseFocusTrapOptions = {},
): void {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    const container = containerRef.current;
    if (autoFocus) {
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
      focusable[0]?.focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [containerRef, enabled, autoFocus]);
}

export function useBodyScrollLock(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [enabled]);
}
