import "@okkly/design-system/components/Ripple/Ripple.scss";
import type { UseRippleReturn } from "@okkly/react-hooks";

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
    <span className="okkly-component okkly-ripple" aria-hidden="true">
      {[...ripples].map(([id, ripple]) => (
        <span
          key={id}
          className="okkly-ripple__element"
          data-rippleid={id}
          style={
            {
              "--okkly-ripple-left": ripple.left,
              "--okkly-ripple-top": ripple.top,
            } as React.CSSProperties
          }
          onAnimationEnd={(e) => onRippleEnd((e.currentTarget as HTMLElement).dataset.rippleid)}
        />
      ))}
    </span>
  );
}
