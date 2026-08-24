export const THEME_STORAGE_KEY = "okryshto-profile-theme";
export const THEME_TRANSITION_MS = 220;

export type ProfileTheme = "light" | "dark";

export function isProfileTheme(value: unknown): value is ProfileTheme {
  return value === "light" || value === "dark";
}

export function readDocumentTheme(): ProfileTheme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function readStoredTheme(): ProfileTheme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return isProfileTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function readSystemTheme(): ProfileTheme {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/** Stored override, otherwise the OS/browser preference. */
export function resolveProfileTheme(): ProfileTheme {
  return readStoredTheme() ?? readSystemTheme();
}

export function applyProfileTheme(theme: ProfileTheme, options?: { persist?: boolean }) {
  const root = document.documentElement;
  const persist = options?.persist !== false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion) {
    root.classList.add("okryshto-transition-active");
    window.setTimeout(() => {
      root.classList.remove("okryshto-transition-active");
    }, THEME_TRANSITION_MS);
  }

  root.setAttribute("data-theme", theme);

  if (!persist) return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode / blocked storage — the session still switches.
  }
}

/** Blocking head script: stored theme, else prefers-color-scheme, before first paint. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.setAttribute("data-theme",t);}catch(e){try{document.documentElement.setAttribute("data-theme",window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");}catch(e2){}}})();`;
