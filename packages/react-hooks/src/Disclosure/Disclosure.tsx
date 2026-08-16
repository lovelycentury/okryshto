import { useCallback, useState } from "react";

export interface UseDisclosureOptions {
  /** Initial open state. Defaults to `false`. */
  defaultOpen?: boolean;
}

export interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Headless open/close state for disclosure-like UI (modals, drawers, menus).
 */
export function useDisclosure(options: UseDisclosureOptions = {}): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(options.defaultOpen ?? false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  return { isOpen, open, close, toggle };
}
