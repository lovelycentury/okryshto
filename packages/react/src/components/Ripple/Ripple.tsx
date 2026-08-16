import "@okryshto/design-system/components/Ripple/Ripple.scss";
import type { UseRippleReturn } from "@okryshto/react-hooks";

export interface RippleProps {
  /**
   * Ripples.
   *
   * @default undefined
   * @type {UseRippleReturn["ripples"]}
   */
  ripples: UseRippleReturn["ripples"];
  /**
   * On Ripple End.
   *
   * @default undefined
   * @type {UseRippleReturn["hideRipple"]}
   */
  onRippleEnd: UseRippleReturn["hideRipple"];
}

/** Presentational overlay for `useRipple` — the trigger element owns `position: relative; overflow: hidden`. */
export function Ripple({ ripples, onRippleEnd }: RippleProps) {
  return (
    <span className="okryshto-component okryshto-ripple" aria-hidden="true">
      {[...ripples].map(([id, ripple]) => (
        <span
          key={id}
          className="okryshto-ripple__element"
          data-rippleid={id}
          style={
            {
              "--okryshto-ripple-left": ripple.left,
              "--okryshto-ripple-top": ripple.top,
            } as React.CSSProperties
          }
          onAnimationEnd={(e) => onRippleEnd((e.currentTarget as HTMLElement).dataset.rippleid)}
        />
      ))}
    </span>
  );
}
