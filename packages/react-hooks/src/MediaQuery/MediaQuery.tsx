import { useCallback, useSyncExternalStore } from "react";

export interface UseMediaQueryOptions {
  /** Value returned before the query can be measured (SSR, or no `matchMedia`). Defaults to `false`. */
  defaultMatches?: boolean;
  /** Override for `window.matchMedia`, mainly for testing. */
  matchMedia?: (query: string) => MediaQueryList;
  /** Read `matchMedia` on the server render instead of falling back to `defaultMatches`. */
  noSsr?: boolean;
}

function resolveMatchMedia(
  options: UseMediaQueryOptions,
): ((query: string) => MediaQueryList) | undefined {
  if (options.matchMedia) return options.matchMedia;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia.bind(window);
  }
  return undefined;
}

/**
 * Subscribes to a CSS media query, following MUI's `useMediaQuery` API
 * (`defaultMatches`, `matchMedia`, `noSsr`) but built on `useSyncExternalStore`
 * so it stays tear-free under concurrent rendering instead of MUI's effect-based
 * double-render.
 */
export function useMediaQuery(query: string, options: UseMediaQueryOptions = {}): boolean {
  const { defaultMatches = false, noSsr = false } = options;
  const matchMedia = resolveMatchMedia(options);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!matchMedia) return () => {};
      const mediaQueryList = matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [matchMedia, query],
  );

  const getSnapshot = useCallback(
    () => (matchMedia ? matchMedia(query).matches : defaultMatches),
    [matchMedia, query, defaultMatches],
  );

  const getServerSnapshot = useCallback(
    () => (noSsr && matchMedia ? matchMedia(query).matches : defaultMatches),
    [noSsr, matchMedia, query, defaultMatches],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
