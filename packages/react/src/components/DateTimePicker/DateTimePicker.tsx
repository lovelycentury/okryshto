"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { iconArrowRight, iconGlobe } from "@okryshto/icons";
import "@okryshto/design-system/components/DateTimePicker/DateTimePicker.scss";
import {
  Calendar,
  calendarToneStyle,
  type CalendarTone,
  type CalendarWeekStart,
} from "../Calendar/Calendar";
import { TimePicker, type TimePickerFormat, type TimePickerValue } from "../TimePicker/TimePicker";
import { Chip } from "../Chip/Chip";
import { Button } from "../Button/Button";

/** Tints the calendar, the time wheels, and the Confirm button's glow. */
export type DateTimePickerColor = CalendarTone;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function timeOf(date: Date): TimePickerValue {
  return { h: date.getHours(), m: date.getMinutes() };
}

function combine(day: Date, time: TimePickerValue): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.h, time.m);
}

function formatSummary(date: Date, locale: string, format: TimePickerFormat): string {
  const datePart = date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === "12h",
  });
  return `${datePart} · ${timePart}`;
}

const globeIcon = <span dangerouslySetInnerHTML={{ __html: iconGlobe }} />;
const arrowRightIcon = <span dangerouslySetInnerHTML={{ __html: iconArrowRight }} />;

/**
 * No MUI equivalent as a fixed inline card — MUI X's `DateTimePicker` is a
 * masked text input with a popover. Composed from `Calendar` + `TimePicker`.
 * Deliberate gaps: only a date → use `Calendar`; only a time → use
 * `TimePicker`; and there is no shortcut-preset sidebar (MUI's
 * `slotProps.shortcuts`) — a preset is one line of caller code against `value`.
 */
export interface DateTimePickerProps {
  /**
   * Selected date & time. Controlled if provided; otherwise driven by `defaultValue`.
   *
   * @default undefined
   * @type {Date | null}
   */
  value?: Date | null;
  /**
   * Initial date & time when uncontrolled.
   *
   * @default null
   * @type {Date | null}
   */
  defaultValue?: Date | null;
  /**
   * Earliest selectable date (inclusive).
   *
   * @default undefined
   * @type {Date}
   */
  min?: Date;
  /**
   * Latest selectable date (inclusive).
   *
   * @default undefined
   * @type {Date}
   */
  max?: Date;
  /**
   * Minute wheel step.
   *
   * @default 1
   * @type {number}
   */
  timeStep?: number;
  /**
   * Hour wheel label format — the underlying value stays 24-hour either way.
   *
   * @default "24h"
   * @type {TimePickerFormat}
   */
  format?: TimePickerFormat;
  /**
   * First day of the week.
   *
   * @default "mon"
   * @type {CalendarWeekStart}
   */
  weekStart?: CalendarWeekStart;
  /**
   * Accent tone shared by the calendar, the time wheels, and the Confirm button's glow.
   *
   * @default "primary"
   * @type {DateTimePickerColor}
   */
  color?: DateTimePickerColor;
  /**
   * Locale for the month title, weekday labels, and the summary text.
   *
   * @default "en-US"
   * @type {string}
   */
  locale?: string;
  /**
   * Trailing chip next to the summary text (e.g. a timezone, "GMT+2"). Omitted when not set.
   *
   * @default undefined
   * @type {ReactNode}
   */
  timezoneLabel?: ReactNode;
  /**
   * Label shown above the summary text.
   *
   * @default "Selected time"
   * @type {ReactNode}
   */
  summaryLabel?: ReactNode;
  /**
   * Summary text shown before any date has been picked.
   *
   * @default "No date selected"
   * @type {ReactNode}
   */
  emptyLabel?: ReactNode;
  /**
   * Confirm button label.
   *
   * @default "Confirm"
   * @type {ReactNode}
   */
  confirmLabel?: ReactNode;
  /**
   * Fires whenever the calendar day or either time wheel changes.
   *
   * @default undefined
   * @type {(value: Date) => void}
   */
  onChange?: (value: Date) => void;
  /**
   * Fires when the Confirm button is clicked.
   *
   * @default undefined
   * @type {(value: Date) => void}
   */
  onConfirm?: (value: Date) => void;
  /**
   * Accessible name for the calendar's "previous month" button.
   *
   * @default undefined
   * @type {string}
   */
  previousMonthLabel?: string;
  /**
   * Accessible name for the calendar's "next month" button.
   *
   * @default undefined
   * @type {string}
   */
  nextMonthLabel?: string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

export function DateTimePicker({
  value,
  defaultValue = null,
  min,
  max,
  timeStep = 1,
  format = "24h",
  weekStart = "mon",
  color = "primary",
  locale = "en-US",
  timezoneLabel,
  summaryLabel = "Selected time",
  emptyLabel = "No date selected",
  confirmLabel = "Confirm",
  onChange,
  onConfirm,
  previousMonthLabel,
  nextMonthLabel,
  className,
}: DateTimePickerProps) {
  const [internalValue, setInternalValue] = useState<Date | null>(
    value !== undefined ? value : defaultValue,
  );
  const currentValue = value !== undefined ? value : internalValue;

  // The time wheels stay interactive even before a day is picked — this remembers
  // the dialed-in hour/minute so it carries over once a day finally lands, instead
  // of the wheels resetting to 0:00 or silently committing a bogus "today" value.
  const [draftTime, setDraftTime] = useState<TimePickerValue>(() =>
    currentValue ? timeOf(currentValue) : { h: 0, m: 0 },
  );
  const [month, setMonth] = useState<Date>(() => currentValue ?? new Date());

  const day = currentValue ? startOfDay(currentValue) : null;
  const time = currentValue ? timeOf(currentValue) : draftTime;

  // Measure the calendar *panel* rather than its root: the root is a plain
  // wrapper, and the bordered card inside it is what the time wheels line up to.
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarHeight, setCalendarHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const root = calendarRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const panel = root.querySelector<HTMLElement>(".okryshto-calendar__panel") ?? root;
    // `offsetHeight`, not `getBoundingClientRect()`: inside a field's popover
    // this mounts during a Grow transition, and a rect measured mid-`scale()`
    // reports a fraction of the real height — which then stuck, because
    // ResizeObserver never fires for a transform.
    const update = () => setCalendarHeight(panel.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const timePickerStyle: CSSProperties | undefined =
    calendarHeight != null
      ? ({
          "--okryshto-time-picker-viewport-height": `calc(${calendarHeight}px - 1.125rem)`,
        } as CSSProperties)
      : undefined;

  const commit = (next: Date) => {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const handleSelectDay = (date: Date) => commit(combine(date, time));

  const handleTimeChange = (next: TimePickerValue) => {
    setDraftTime(next);
    if (day) commit(combine(day, next));
  };

  const handleConfirm = () => {
    if (currentValue) onConfirm?.(currentValue);
  };

  const classes = ["okryshto-component", "okryshto-date-time-picker", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="okryshto-date-time-picker__panels">
        <Calendar
          ref={calendarRef}
          style={calendarToneStyle(color)}
          month={month}
          onMonthChange={setMonth}
          value={day}
          onSelect={handleSelectDay}
          min={min}
          max={max}
          weekStart={weekStart}
          locale={locale}
          previousMonthLabel={previousMonthLabel}
          nextMonthLabel={nextMonthLabel}
        />
        <TimePicker
          value={time}
          onChange={handleTimeChange}
          step={timeStep}
          format={format}
          color={color}
          style={timePickerStyle}
        />
      </div>
      <div className="okryshto-date-time-picker__footer">
        <div className="okryshto-date-time-picker__summary">
          <p className="okryshto-date-time-picker__summary-label">{summaryLabel}</p>
          <div className="okryshto-date-time-picker__summary-value">
            <span
              className={[
                "okryshto-date-time-picker__summary-text",
                !currentValue && "okryshto-date-time-picker__summary-text--empty",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {currentValue ? formatSummary(currentValue, locale, format) : emptyLabel}
            </span>
            {timezoneLabel && <Chip size="small" icon={globeIcon} label={timezoneLabel} />}
          </div>
        </div>
        <Button
          variant="gradient"
          shape="rounded"
          color={color}
          disabled={!currentValue}
          endIcon={arrowRightIcon}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
