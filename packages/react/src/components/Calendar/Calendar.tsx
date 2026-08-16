import { forwardRef, useMemo, useState, type CSSProperties } from "react";
import { iconChevronDown, iconChevronLeft, iconChevronRight } from "@okryshto/icons";
import "@okryshto/design-system/components/Calendar/Calendar.scss";

export type CalendarWeekStart = "mon" | "sun";
/** `"single"` commits on every click; `"range"` takes two clicks to commit a pair. */
export type CalendarMode = "single" | "range";
/** `Date` in single mode, `[start, end]` in range mode. */
export type CalendarValue = Date | [Date, Date];

/**
 * Accent names the surrounding date components already speak. `Calendar` itself
 * has no `color` prop — its accent is the CSS variable `--okryshto-calendar-tone`,
 * and this is the one place that maps a name onto it.
 */
export type CalendarTone = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/** `style` for a calendar tinted with `tone`, or `undefined` for the default. */
export function calendarToneStyle(tone: CalendarTone): CSSProperties | undefined {
  if (tone === "primary") return undefined;
  // The palette calls indigo "secondary"; every other tone is its own token.
  const token = tone === "indigo" ? "secondary" : tone;
  return { "--okryshto-calendar-tone": `var(--okryshto-accent-${token})` } as CSSProperties;
}

/** Which grid is currently showing — drills up on the header label click (`day` → `year`),
 * back down once a year/month is actually picked (`year` → `month` → `day`), matching MUI's
 * `DateCalendar` with `views={["year", "month", "day"]}`. */
type CalendarView = "day" | "month" | "year";

const YEAR_PAGE_SIZE = 12;

interface CalendarDay {
  date: Date;
  outside: boolean;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

/** A year is unreachable once its last day is before `min`, or its first day is after `max`. */
function isYearDisabled(year: number, min?: Date, max?: Date): boolean {
  if (min && year < min.getFullYear()) return true;
  if (max && year > max.getFullYear()) return true;
  return false;
}

/** A month is unreachable once its last day is before `min`, or its first day is after `max`. */
function isMonthDisabled(year: number, monthIndex: number, min?: Date, max?: Date): boolean {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0);
  if (min && end < startOfDay(min)) return true;
  if (max && start > startOfDay(max)) return true;
  return false;
}

/** Short month labels ("Jan", "Feb", ...) for the given locale, Jan → Dec. */
function getMonthLabels(locale: string): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2023, i, 1).toLocaleDateString(locale, { month: "short" }),
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  const day = startOfDay(date).getTime();
  const [from, to] = start.getTime() <= end.getTime() ? [start, end] : [end, start];
  return day >= startOfDay(from).getTime() && day <= startOfDay(to).getTime();
}

/** Weeks of `CalendarDay`s covering the full grid, including the leading/trailing days from adjacent months. */
function getMonthGrid(month: Date, weekStart: CalendarWeekStart): CalendarDay[][] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + (weekStart === "mon" ? 6 : 0)) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const days: CalendarDay[] = [];
  for (let i = 0; i < totalCells; i++) {
    const date = new Date(year, monthIndex, i - firstWeekday + 1);
    days.push({ date, outside: date.getMonth() !== monthIndex });
  }

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

/** Two-letter weekday labels ("Mo", "Tu", ...) for the given locale, ordered from `weekStart`. */
function getWeekdayLabels(weekStart: CalendarWeekStart, locale: string): string[] {
  // 2023-01-01 is a Sunday — a stable reference week to read labels off.
  return Array.from({ length: 7 }, (_, i) => {
    const offset = weekStart === "mon" ? i + 1 : i;
    const date = new Date(2023, 0, 1 + offset);
    return date
      .toLocaleDateString(locale, { weekday: "short" })
      .slice(0, 2)
      .replace(/^./, (c) => c.toUpperCase());
  });
}

/**
 * Closest MUI counterpart is MUI X's `DateCalendar`
 * (https://mui.com/x/api/date-pickers/date-calendar/): `value`/`onChange`
 * naming is mirrored as `value`/`onSelect`, and the header drills through
 * the same year → month → day hierarchy MUI exposes via
 * `views={["year","month","day"]}`. `mode="range"` covers what MUI splits into
 * a separate `DateRangeCalendar`. Deliberate gaps: no controlled
 * `view`/`onViewChange` and no shortcut-preset sidebar.
 *
 * There is also no decorative "availability window" tint. It used to exist as a
 * `highlight` prop and was indistinguishable from a selected range — same 12%
 * wash, different meaning. A caller who needs it can paint it with a class.
 */
export interface CalendarBaseProps {
  /**
   * Any date within the visible month. Uncontrolled unless re-supplied on `onMonthChange`.
   *
   * @default undefined
   * @type {Date}
   */
  month?: Date;
  /**
   * Fires when the prev/next arrows change the visible month (day view), or when a month is picked from the month grid.
   *
   * @default undefined
   * @type {(month: Date) => void}
   */
  onMonthChange?: (month: Date) => void;
  /**
   * Earliest selectable date (inclusive). Also disables unreachable years/months in those views.
   *
   * @default undefined
   * @type {Date}
   */
  min?: Date;
  /**
   * Latest selectable date (inclusive). Also disables unreachable years/months in those views.
   *
   * @default undefined
   * @type {Date}
   */
  max?: Date;
  /**
   * First day of the week.
   *
   * @default "mon"
   * @type {CalendarWeekStart}
   */
  weekStart?: CalendarWeekStart;
  /**
   * Locale for the month title, weekday labels, and month-grid labels.
   *
   * @default "en-US"
   * @type {string}
   */
  locale?: string;
  /**
   * Accessible name for the "previous month" button (day view).
   *
   * @default "Previous month"
   * @type {string}
   */
  previousMonthLabel?: string;
  /**
   * Accessible name for the "next month" button (day view).
   *
   * @default "Next month"
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
  /**
   * Inline styles. The accent tone is a CSS variable rather than a prop, so this is how a caller retints the calendar: `style={{ "--okryshto-calendar-tone": "var(--okryshto-accent-dante)" }}`.
   *
   * @default undefined
   * @type {CSSProperties}
   */
  style?: CSSProperties;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  /**
   * One date at a time.
   *
   * @default "single"
   * @type {"single"}
   */
  mode?: "single";
  /**
   * Selected date.
   *
   * @default null
   * @type {Date | null}
   */
  value?: Date | null;
  /**
   * Fires with the clicked date.
   *
   * @default undefined
   * @type {(date: Date) => void}
   */
  onSelect?: (date: Date) => void;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  /**
   * A start/end pair, picked in two clicks.
   *
   * @default "single"
   * @type {"range"}
   */
  mode: "range";
  /**
   * Selected `[start, end]` pair.
   *
   * @default null
   * @type {[Date, Date] | null}
   */
  value?: [Date, Date] | null;
  /**
   * Fires on the *second* click, with the pair already ordered — the first click only arms the start, which the calendar holds internally.
   *
   * @default undefined
   * @type {(range: [Date, Date]) => void}
   */
  onSelect?: (range: [Date, Date]) => void;
}

/**
 * Discriminated on `mode`, so `onSelect` is typed `(date: Date)` in single mode
 * and `(range: [Date, Date])` in range mode — no narrowing at the call site.
 */
export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

/** The union collapsed to what the body actually reads. Narrowed once, below. */
interface CalendarInternalProps extends CalendarBaseProps {
  mode?: CalendarMode;
  value?: CalendarValue | null;
  onSelect?: (value: CalendarValue) => void;
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    mode = "single",
    value = null,
    month,
    onMonthChange,
    min,
    max,
    weekStart = "mon",
    onSelect,
    locale = "en-US",
    previousMonthLabel = "Previous month",
    nextMonthLabel = "Next month",
    className,
    style,
  } = props as CalendarInternalProps;

  const [internalMonth, setInternalMonth] = useState<Date>(() => startOfMonth(month ?? new Date()));
  const visibleMonth = month ? startOfMonth(month) : internalMonth;
  const today = useMemo(() => startOfDay(new Date()), []);
  const weeks = useMemo(() => getMonthGrid(visibleMonth, weekStart), [visibleMonth, weekStart]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(weekStart, locale), [weekStart, locale]);
  const monthLabels = useMemo(() => getMonthLabels(locale), [locale]);
  const title = visibleMonth.toLocaleDateString(locale, { month: "long", year: "numeric" });

  // `view` walks up the hierarchy on a header click (day → year, month → year)
  // and back down once a year/month is actually picked. `viewYear` is the year
  // being browsed in the month/year grids — kept separate from `visibleMonth`
  // so paging through years while picking a month has no side effects (no
  // `onMonthChange`) until a month is actually chosen.
  const [view, setView] = useState<CalendarView>("day");
  const [viewYear, setViewYear] = useState<number>(() => visibleMonth.getFullYear());
  const yearPageStart = Math.floor(viewYear / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE;

  // Range mode is two clicks, and the half-finished state between them belongs
  // to the calendar, not the caller: `onSelect` only fires once there is a real
  // pair to hand over. `pendingStart` is that in-between.
  const [pendingStart, setPendingStart] = useState<Date | null>(null);

  const singleValue = mode === "single" && value instanceof Date ? value : null;
  const committedRange = mode === "range" && Array.isArray(value) ? value : null;
  // While a start is armed the committed pair is ignored — the user is drawing a
  // new range, and showing the old one underneath would read as two selections.
  const rangeStart = pendingStart ?? committedRange?.[0] ?? null;
  const rangeEnd = pendingStart ? null : (committedRange?.[1] ?? null);

  const goToMonth = (next: Date) => {
    setInternalMonth(next);
    onMonthChange?.(next);
  };

  const openYearView = () => {
    setViewYear(visibleMonth.getFullYear());
    setView("year");
  };

  const selectYear = (year: number) => {
    setViewYear(year);
    setView("month");
  };

  const selectMonth = (monthIndex: number) => {
    setView("day");
    goToMonth(new Date(viewYear, monthIndex, 1));
  };

  const handleDayClick = (date: Date) => {
    const day = startOfDay(date);
    if (mode === "single") {
      onSelect?.(day);
      return;
    }
    if (!pendingStart) {
      setPendingStart(day);
      return;
    }
    // Clicking backwards is a legitimate way to draw a range, so order the pair
    // here rather than making every caller re-sort it.
    const pair: [Date, Date] = day < pendingStart ? [day, pendingStart] : [pendingStart, day];
    setPendingStart(null);
    onSelect?.(pair);
  };

  const handlePrev = () => {
    if (view === "day") goToMonth(addMonths(visibleMonth, -1));
    else if (view === "month") setViewYear((y) => y - 1);
    else setViewYear((y) => y - YEAR_PAGE_SIZE);
  };

  const handleNext = () => {
    if (view === "day") goToMonth(addMonths(visibleMonth, 1));
    else if (view === "month") setViewYear((y) => y + 1);
    else setViewYear((y) => y + YEAR_PAGE_SIZE);
  };

  const prevLabel =
    view === "day" ? previousMonthLabel : view === "month" ? "Previous year" : "Previous years";
  const nextLabel = view === "day" ? nextMonthLabel : view === "month" ? "Next year" : "Next years";
  const headerLabel =
    view === "year"
      ? `${yearPageStart}–${yearPageStart + YEAR_PAGE_SIZE - 1}`
      : view === "month"
        ? String(viewYear)
        : title;
  // Mirrors MUI's "switch view" button naming so screen readers announce what
  // clicking the header will do, not just the visible label text.
  const headerAriaLabel =
    view === "day"
      ? `Choose year, currently ${title}`
      : view === "month"
        ? `Choose year, currently ${viewYear}`
        : undefined;

  const classes = ["okryshto-component", "okryshto-calendar", className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={classes} style={style}>
      <div className="okryshto-calendar__panel">
        <div className="okryshto-calendar__header">
          <button
            type="button"
            className="okryshto-calendar__nav-button"
            onClick={handlePrev}
            aria-label={prevLabel}
          >
            <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconChevronLeft }} />
          </button>
          {view === "year" ? (
            <p className="okryshto-calendar__title">{headerLabel}</p>
          ) : (
            <button
              type="button"
              className="okryshto-calendar__title okryshto-calendar__title--button"
              aria-label={headerAriaLabel}
              onClick={openYearView}
            >
              {headerLabel}
              <span
                className={[
                  "okryshto-calendar__title-chevron",
                  view === "month" && "okryshto-calendar__title-chevron--open",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: iconChevronDown }}
              />
            </button>
          )}
          <button
            type="button"
            className="okryshto-calendar__nav-button"
            onClick={handleNext}
            aria-label={nextLabel}
          >
            <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconChevronRight }} />
          </button>
        </div>
        {view === "day" && (
          <div className="okryshto-calendar__grid">
            <div className="okryshto-calendar__week">
              {weekdayLabels.map((label, index) => (
                <span key={index} className="okryshto-calendar__weekday">
                  {label}
                </span>
              ))}
            </div>
            {weeks.map((week, weekIndex) => (
              <div className="okryshto-calendar__week" key={weekIndex}>
                {week.map(({ date, outside }) => {
                  const disabled = Boolean(
                    (min && date < startOfDay(min)) || (max && date > startOfDay(max)),
                  );
                  const isToday = isSameDay(date, today);

                  // Every edge is decided by comparing dates, never by a cell's
                  // position in the grid — the leading and trailing days of the
                  // adjacent months are real dates in the range and have to
                  // paint like it, without ever being mistaken for its ends.
                  const isRangeStart = !!rangeStart && isSameDay(date, rangeStart);
                  const isRangeEnd = !!rangeEnd && isSameDay(date, rangeEnd);
                  const inRange =
                    !!rangeStart &&
                    !!rangeEnd &&
                    !isRangeStart &&
                    !isRangeEnd &&
                    isBetween(date, rangeStart, rangeEnd);
                  const selected =
                    mode === "single"
                      ? !!singleValue && isSameDay(date, singleValue)
                      : isRangeStart || isRangeEnd;

                  const dayClasses = [
                    "okryshto-calendar__day",
                    outside && "okryshto-calendar__day--outside",
                    isToday && "okryshto-calendar__day--today",
                    inRange && "okryshto-calendar__day--in-range",
                    isRangeStart && "okryshto-calendar__day--range-start",
                    isRangeEnd && "okryshto-calendar__day--range-end",
                    mode === "single" && selected && "okryshto-calendar__day--selected",
                    disabled && "okryshto-calendar__day--disabled",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      className={dayClasses}
                      disabled={disabled}
                      aria-pressed={selected}
                      aria-current={isToday ? "date" : undefined}
                      onClick={() => handleDayClick(date)}
                    >
                      {date.getDate()}
                      {isToday && (
                        <span className="okryshto-calendar__day-dot" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        {view === "month" && (
          <div className="okryshto-calendar__period-grid">
            {monthLabels.map((label, index) => {
              const disabled = isMonthDisabled(viewYear, index, min, max);
              const selected =
                viewYear === visibleMonth.getFullYear() && index === visibleMonth.getMonth();
              const periodClasses = [
                "okryshto-calendar__period-cell",
                selected && "okryshto-calendar__period-cell--selected",
                disabled && "okryshto-calendar__period-cell--disabled",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={index}
                  type="button"
                  className={periodClasses}
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => selectMonth(index)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
        {view === "year" && (
          <div className="okryshto-calendar__period-grid">
            {Array.from({ length: YEAR_PAGE_SIZE }, (_, i) => yearPageStart + i).map((year) => {
              const disabled = isYearDisabled(year, min, max);
              const selected = year === visibleMonth.getFullYear();
              const periodClasses = [
                "okryshto-calendar__period-cell",
                selected && "okryshto-calendar__period-cell--selected",
                disabled && "okryshto-calendar__period-cell--disabled",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={year}
                  type="button"
                  className={periodClasses}
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => selectYear(year)}
                >
                  {year}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
