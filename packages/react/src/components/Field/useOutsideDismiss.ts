import { useEffect, type RefObject } from "react";

/**
 * Closes a dropdown when a pointer press lands outside every element in `refs`.
 *
 * `useClickOutside` from `@okryshto/react-hooks` takes a single ref, which is not
 * enough here: the field and its popup are in different DOM trees (the popup is
 * portaled), so "outside" means outside *both*. Select and Autocomplete share
 * this instead of each growing its own copy.
 *
 * Listens on `mousedown` rather than `click` so the popup closes on press —
 * matching how native menus feel, and avoiding a click that started inside the
 * popup but ended outside being read as a dismissal.
 */
export function useOutsideDismiss(
  refs: RefObject<HTMLElement | null>[],
  enabled: boolean,
  onDismiss: () => void,
): void {
  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onDismiss();
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
    // `refs` is a fresh array literal each render at the call sites, so spreading
    // its contents keeps this from re-subscribing on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, onDismiss, ...refs]);
}
