"use client";

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import "@okkly/design-system/components/TimePicker/TimePicker.scss";

export interface TimePickerValue {
  h: number;
  m: number;
}

export type TimePickerColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type TimePickerFormat = "24h" | "12h";

// Matches `--okkly-time-picker-row-height`'s default (2.5rem @ 16px root) —
// only used when the real rendered height can't be measured (e.g. jsdom in
// unit tests, which has no layout engine and always reports 0).
const FALLBACK_ROW_HEIGHT = 40;

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MERIDIEM_VALUES = [0, 1];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function minuteValues(step: number): number[] {
  const s = Math.min(59, Math.max(1, Math.round(step)));
  const values: number[] = [];
  for (let m = 0; m < 60; m += s) values.push(m);
  return values;
}

function nearestValue(target: number, values: number[]): number {
  return values.reduce(
    (best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best),
    values[0],
  );
}

function hour12From(h: number): number {
  const twelveHour = h % 12;
  return twelveHour === 0 ? 12 : twelveHour;
}

function meridiemFrom(h: number): number {
  return h < 12 ? 0 : 1;
}

function combineHour12(hour12: number, meridiem: number): number {
  const base = hour12 === 12 ? 0 : hour12;
  return meridiem === 1 ? base + 12 : base;
}

function formatMeridiem(v: number): string {
  return v === 0 ? "AM" : "PM";
}

/** `Element.scrollTo` isn't implemented in jsdom — fall back to a plain jump. */
function scrollElementTo(el: HTMLElement, top: number, behavior: ScrollBehavior) {
  if (typeof el.scrollTo === "function") el.scrollTo({ top, behavior });
  else el.scrollTop = top;
}

interface WheelColumnProps {
  /**
   * Values.
   *
   * @default undefined
   * @type {number[]}
   */
  values: number[];
  /**
   * Value.
   *
   * @default undefined
   * @type {number}
   */
  value: number;
  /**
   * On Value Change.
   *
   * @default undefined
   * @type {(value: number) => void}
   */
  onValueChange: (value: number) => void;
  /**
   * Format Value.
   *
   * @default undefined
   * @type {(value: number) => ReactNode}
   */
  formatValue: (value: number) => ReactNode;
  /**
   * Aria Label.
   *
   * @default undefined
   * @type {string}
   */
  ariaLabel: string;
}

/**
 * A single scrollable value list (hours, minutes, or AM/PM) — a plain,
 * MUI `MultiSectionDigitalClock`-style column: uniform rows, the selected
 * one picked out with a filled pill, no wheel/fisheye effect. Built on
 * native scrolling with CSS `scroll-snap` rather than a drag library, so
 * the browser's own touch/trackpad momentum gives the "coast to a stop on a
 * value" feel for free.
 */
function WheelColumn({ values, value, onValueChange, formatValue, ariaLabel }: WheelColumnProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const rowHeightRef = useRef(FALLBACK_ROW_HEIGHT);
  // Always holds "the value we last told the outside world about", updated
  // the instant we call `onValueChange` (scroll/click/keyboard) *and* by the
  // sync effect below. Comparing against it there is what tells a render
  // apart as self-inflicted vs. genuinely external — see that effect.
  const lastReportedRef = useRef(value);

  const valuesRef = useRef(values);
  valuesRef.current = values;
  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;
  const valueRef = useRef(value);
  valueRef.current = value;

  const indexOf = (v: number) => Math.max(values.indexOf(v), 0);
  // The list carries half a viewport of padding at each end (see
  // `__column-container` in the SCSS), so centring row `i` is exactly
  // `i * rowHeight` — every value can reach the middle, ends included.
  const targetScrollTop = (index: number) => index * rowHeightRef.current;

  // Land on the initial value with no animation, and measure the real rendered
  // row height before the first paint (CSS sizes it in `rem`, so a hardcoded
  // pixel constant would drift with the root font size). `offsetHeight`, not
  // `getBoundingClientRect()`: the picker often mounts inside a Grow transition,
  // whose `transform: scale()` would otherwise be measured as a smaller row.
  // Re-measures on resize too — `DateTimePicker` pushes a taller viewport in via
  // CSS var once it has measured the Calendar — and re-centres the value.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const row = el.querySelector<HTMLElement>(".okkly-time-picker__slide");
      if (row?.offsetHeight) rowHeightRef.current = row.offsetHeight;
    };
    measure();
    el.scrollTop = targetScrollTop(indexOf(value));
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      measure();
      el.scrollTop = targetScrollTop(indexOf(valueRef.current));
    });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The list's native drag/momentum/snap does all the "inertia" work by
  // itself — this only turns the settled scroll position back into a value
  // (as soon as a new row crosses center, not just once scrolling fully stops).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => {
      const vals = valuesRef.current;
      const centered = el.scrollTop / rowHeightRef.current;
      const nearestIndex = Math.min(Math.max(Math.round(centered), 0), vals.length - 1);
      const nearest = vals[nearestIndex];
      if (nearest !== lastReportedRef.current) {
        lastReportedRef.current = nearest;
        onValueChangeRef.current(nearest);
      }
    };
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, []);

  // Reacts to *externally*-driven value changes only. A render whose `value`
  // already matches `lastReportedRef` was caused by us (the scroll listener
  // above, or `commitIndex` below, both update that ref right before calling
  // `onValueChange`) — the scroll position is already correct, or the user's
  // gesture is still in progress and must not be interrupted. Force-scrolling
  // on every one of those self-inflicted renders is what made scrolling feel
  // robotic: it fought the browser's own momentum on every row crossed mid-drag.
  useEffect(() => {
    const isSelfInflicted = value === lastReportedRef.current;
    lastReportedRef.current = value;
    if (isSelfInflicted) return;
    const el = viewportRef.current;
    if (!el) return;
    const target = targetScrollTop(indexOf(value));
    if (Math.abs(el.scrollTop - target) > 1) scrollElementTo(el, target, "smooth");
  }, [value, values]);

  // Click/keyboard commit the value directly instead of only nudging the
  // scroll position and waiting for the "scroll" listener above to notice —
  // that listener depends on real layout (row/viewport height, scroll events
  // firing on assignment) that headless test environments don't provide.
  const commitIndex = (index: number) => {
    const next = valuesRef.current[index];
    lastReportedRef.current = next;
    onValueChangeRef.current(next);
    const el = viewportRef.current;
    if (el) scrollElementTo(el, targetScrollTop(index), "smooth");
  };

  const step = (delta: number) =>
    commitIndex(Math.min(Math.max(indexOf(value) + delta, 0), values.length - 1));

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // ARIA authoring practice for role="spinbutton": Up increases, Down decreases.
    if (event.key === "ArrowUp") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      commitIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      commitIndex(values.length - 1);
    }
  };

  return (
    <div
      className="okkly-time-picker__column"
      role="spinbutton"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={values[0]}
      aria-valuemax={values[values.length - 1]}
      aria-valuetext={String(formatValue(value))}
      onKeyDown={handleKeyDown}
    >
      <div className="okkly-time-picker__column-viewport" ref={viewportRef}>
        <div className="okkly-time-picker__column-container">
          {values.map((v, index) => (
            <div
              key={v}
              data-value={v}
              className={[
                "okkly-time-picker__slide",
                v === value && "okkly-time-picker__slide--selected",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => commitIndex(index)}
            >
              {formatValue(v)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * No MUI equivalent — MUI X's `TimePicker`/`DesktopTimePicker` is a masked text
 * input with a popover, not an always-visible inline picker; the source spec
 * deliberately calls that gap out ("Precise typed time → use a masked input").
 * The picker itself mirrors MUI's `MultiSectionDigitalClock`: up to three
 * plain scrollable columns (hours, minutes, and — only for `format="12h"` —
 * a third AM/PM column), each a simple list with the selected row picked out
 * by a filled pill, not a centered/enlarged carousel row. `value.h` is always
 * canonical 24-hour (0–23); the AM/PM column is purely a 12-hour selection
 * helper layered on top of it and is absent by default (`format` defaults to
 * `"24h"`, which has no AM/PM concept).
 */
export interface TimePickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  /**
   * Selected time. Controlled if provided; otherwise driven by `defaultValue`.
   *
   * @default undefined
   * @type {TimePickerValue}
   */
  value?: TimePickerValue;
  /**
   * Initial time when uncontrolled.
   *
   * @default { h: 0, m: 0 }
   * @type {TimePickerValue}
   */
  defaultValue?: TimePickerValue;
  /**
   * Minute column step.
   *
   * @default 1
   * @type {number}
   */
  step?: number;
  /**
   * `"12h"` splits the hour column into 1–12 plus a third AM/PM column; the underlying value stays 24-hour either way.
   *
   * @default "24h"
   * @type {TimePickerFormat}
   */
  format?: TimePickerFormat;
  /**
   * Accent tone for the focus outline and selected-row pill.
   *
   * @default "primary"
   * @type {TimePickerColor}
   */
  color?: TimePickerColor;
  /**
   * Fires whenever any column settles on a new value.
   *
   * @default undefined
   * @type {(value: TimePickerValue) => void}
   */
  onChange?: (value: TimePickerValue) => void;
  /**
   * Accessible name for the hour column.
   *
   * @default "Hours"
   * @type {string}
   */
  hoursAriaLabel?: string;
  /**
   * Accessible name for the minute column.
   *
   * @default "Minutes"
   * @type {string}
   */
  minutesAriaLabel?: string;
  /**
   * Accessible name for the AM/PM column (only rendered for `format="12h"`).
   *
   * @default "AM/PM"
   * @type {string}
   */
  meridiemAriaLabel?: string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(function TimePicker(
  {
    value,
    defaultValue = { h: 0, m: 0 },
    step = 1,
    format = "24h",
    color = "primary",
    onChange,
    hoursAriaLabel = "Hours",
    minutesAriaLabel = "Minutes",
    meridiemAriaLabel = "AM/PM",
    className,
    ...rest
  },
  ref,
) {
  const minuteVals = minuteValues(step);
  const clamp = (v: TimePickerValue): TimePickerValue => ({
    h: ((v.h % 24) + 24) % 24,
    m: nearestValue(((v.m % 60) + 60) % 60, minuteVals),
  });

  const [internalValue, setInternalValue] = useState<TimePickerValue>(() =>
    clamp(value ?? defaultValue),
  );
  const currentValue = value !== undefined ? clamp(value) : internalValue;

  const commit = (next: TimePickerValue) => {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const isTwelveHour = format === "12h";
  const hourValues = isTwelveHour ? HOURS_12 : HOURS_24;
  const hourValue = isTwelveHour ? hour12From(currentValue.h) : currentValue.h;

  const handleHourChange = (h: number) => {
    commit({
      h: isTwelveHour ? combineHour12(h, meridiemFrom(currentValue.h)) : h,
      m: currentValue.m,
    });
  };

  const handleMeridiemChange = (meridiem: number) => {
    commit({ h: combineHour12(hour12From(currentValue.h), meridiem), m: currentValue.m });
  };

  const classes = [
    "okkly-component",
    "okkly-time-picker",
    color !== "primary" && `okkly-time-picker--color-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} {...rest}>
      <WheelColumn
        values={hourValues}
        value={hourValue}
        onValueChange={handleHourChange}
        formatValue={pad2}
        ariaLabel={hoursAriaLabel}
      />
      <WheelColumn
        values={minuteVals}
        value={currentValue.m}
        onValueChange={(m) => commit({ h: currentValue.h, m })}
        formatValue={pad2}
        ariaLabel={minutesAriaLabel}
      />
      {isTwelveHour && (
        <WheelColumn
          values={MERIDIEM_VALUES}
          value={meridiemFrom(currentValue.h)}
          onValueChange={handleMeridiemChange}
          formatValue={formatMeridiem}
          ariaLabel={meridiemAriaLabel}
        />
      )}
    </div>
  );
});
