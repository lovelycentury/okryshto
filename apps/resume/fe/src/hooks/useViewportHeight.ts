import { useEffect } from "react";

/**
 * Publishes the *visual* viewport height as `--app-viewport-height`.
 *
 * `100dvh` tracks the browser's own collapsing chrome but not a software keyboard: on
 * iOS the keyboard slides over the page without resizing it, so a shell sized in `dvh`
 * keeps its full height and the composer ends up underneath the keyboard. `visualViewport`
 * is the one API that reports what the visitor can actually see, so the shell is sized
 * from it and shrinks as the keyboard opens.
 *
 * The variable is only *read* under the phone breakpoint (see App.module.scss); wider
 * layouts stay on `100dvh`, which is already correct there.
 */
export function useViewportHeight(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;

    const sync = () => {
      // `offsetTop` is how far the visual viewport has been pushed down inside the layout
      // viewport — non-zero on iOS once the keyboard scrolls the page. Subtracting it
      // keeps the bottom edge of the shell level with the top of the keyboard.
      root.style.setProperty(
        "--app-viewport-height",
        `${Math.round(viewport.height - viewport.offsetTop)}px`,
      );
    };

    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);

    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      root.style.removeProperty("--app-viewport-height");
    };
  }, []);
}
