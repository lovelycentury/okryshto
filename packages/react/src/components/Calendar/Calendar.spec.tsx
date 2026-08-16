import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Calendar, calendarToneStyle } from "./Calendar";

// January 2024: Jan 1 is a Monday, so a Monday-start week has zero leading
// days and January's 31 days spill 4 trailing days into February — a
// deterministic 5-row grid to assert against.
const january2024 = new Date(2024, 0, 1);

describe("Calendar", () => {
  it("renders the visible month's title", () => {
    render(<Calendar month={january2024} />);
    expect(screen.getByText("January 2024")).toBeInTheDocument();
  });

  it("applies the default classes", () => {
    const { container } = render(<Calendar month={january2024} />);
    expect(container.querySelector(".okryshto-calendar")).toHaveClass(
      "okryshto-component",
      "okryshto-calendar",
    );
  });

  it("retints from the style prop rather than a color modifier", () => {
    const { container } = render(
      <Calendar month={january2024} style={calendarToneStyle("dante")} />,
    );
    const root = container.querySelector<HTMLElement>(".okryshto-calendar");
    expect(root?.style.getPropertyValue("--okryshto-calendar-tone")).toBe(
      "var(--okryshto-accent-dante)",
    );
    expect(calendarToneStyle("primary")).toBeUndefined();
  });

  it("renders Monday-start weekday labels by default", () => {
    render(<Calendar month={january2024} />);
    const labels = screen.getAllByText(/^(Mo|Tu|We|Th|Fr|Sa|Su)$/).map((el) => el.textContent);
    expect(labels).toEqual(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]);
  });

  it("reorders weekday labels for a Sunday start", () => {
    render(<Calendar month={january2024} weekStart="sun" />);
    const labels = screen.getAllByText(/^(Mo|Tu|We|Th|Fr|Sa|Su)$/).map((el) => el.textContent);
    expect(labels).toEqual(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]);
  });

  it("renders a full 5-week grid with no leading days and trailing outside days", () => {
    const { container } = render(<Calendar month={january2024} />);
    const days = container.querySelectorAll(".okryshto-calendar__day");
    expect(days).toHaveLength(35);
    expect(days[0]).toHaveTextContent("1");
    expect(days[0]).not.toHaveClass("okryshto-calendar__day--outside");
    expect(days[34]).toHaveTextContent("4");
    expect(days[34]).toHaveClass("okryshto-calendar__day--outside");
  });

  it("marks the selected date and fires onSelect with the clicked date", () => {
    const onSelect = vi.fn();
    render(<Calendar month={january2024} value={new Date(2024, 0, 10)} onSelect={onSelect} />);
    const selected = screen.getByRole("button", { name: "10" });
    expect(selected).toHaveClass("okryshto-calendar__day--selected");
    expect(selected).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "15" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect.mock.calls[0][0]).toEqual(new Date(2024, 0, 15));
  });

  it("disables and strikes through dates outside min/max", () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        month={january2024}
        min={new Date(2024, 0, 5)}
        max={new Date(2024, 0, 20)}
        onSelect={onSelect}
      />,
    );
    const tooEarly = screen.getAllByRole("button", { name: "3" })[0]; // Jan 3 (Feb 3 also renders as a trailing outside day)
    expect(tooEarly).toBeDisabled();
    expect(tooEarly).toHaveClass("okryshto-calendar__day--disabled");
    fireEvent.click(tooEarly);
    expect(onSelect).not.toHaveBeenCalled();

    expect(screen.getByRole("button", { name: "10" })).not.toBeDisabled();
  });

  it("renders no availability-window tint or legend", () => {
    // Removed outright: it was a 12% wash indistinguishable from a selected
    // range, so the two states could not be told apart.
    const { container } = render(<Calendar month={january2024} value={new Date(2024, 0, 10)} />);
    expect(container.querySelector(".okryshto-calendar__legend")).not.toBeInTheDocument();
    expect(container.querySelector(".okryshto-calendar__day--highlight")).not.toBeInTheDocument();
  });

  describe("today", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 0, 17));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("marks today's cell and renders its dot", () => {
      const { container } = render(<Calendar month={january2024} />);
      const today = screen.getByRole("button", { name: "17" });
      expect(today).toHaveAttribute("aria-current", "date");
      expect(today).toHaveClass("okryshto-calendar__day--today");
      expect(today.querySelector(".okryshto-calendar__day-dot")).toBeInTheDocument();
      expect(container.querySelectorAll(".okryshto-calendar__day-dot")).toHaveLength(1);
    });

    it("keeps the today modifier on a day that is also selected", () => {
      // The two are styled by declaration order, not by one replacing the other,
      // so both classes have to survive for that ordering to mean anything.
      render(<Calendar month={january2024} value={new Date(2024, 0, 17)} />);
      const today = screen.getByRole("button", { name: "17" });
      expect(today).toHaveClass(
        "okryshto-calendar__day--today",
        "okryshto-calendar__day--selected",
      );
    });
  });

  describe("month navigation", () => {
    it("moves to the next/previous month and reports it via onMonthChange", () => {
      const onMonthChange = vi.fn();
      render(<Calendar month={january2024} onMonthChange={onMonthChange} />);

      fireEvent.click(screen.getByRole("button", { name: "Next month" }));
      expect(onMonthChange).toHaveBeenCalledWith(new Date(2024, 1, 1));

      fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
      expect(onMonthChange).toHaveBeenCalledWith(new Date(2023, 11, 1));
    });

    it("navigates internally when uncontrolled (no month prop)", () => {
      render(<Calendar />);
      const initialTitle = screen.getByText(/\d{4}/).textContent;
      fireEvent.click(screen.getByRole("button", { name: "Next month" }));
      expect(screen.getByText(/\d{4}/).textContent).not.toBe(initialTitle);
    });

    it("uses custom accessible names for the nav buttons", () => {
      render(<Calendar month={january2024} previousMonthLabel="Prev" nextMonthLabel="Next" />);
      expect(screen.getByRole("button", { name: "Prev" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });
  });

  describe("year / month views", () => {
    it("opens the year grid when the header label is clicked", () => {
      render(<Calendar month={january2024} />);
      fireEvent.click(screen.getByRole("button", { name: /Choose year, currently January 2024/ }));
      expect(screen.getByText("2016–2027")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "2024" })).toHaveAttribute("aria-pressed", "true");
      expect(screen.queryByText("Mo")).not.toBeInTheDocument();
    });

    it("drills year → month → day and reports the picked month via onMonthChange", () => {
      const onMonthChange = vi.fn();
      render(<Calendar month={january2024} onMonthChange={onMonthChange} />);

      fireEvent.click(screen.getByRole("button", { name: /Choose year/ }));
      fireEvent.click(screen.getByRole("button", { name: "2025" }));
      expect(
        screen.getByRole("button", { name: /Choose year, currently 2025/ }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Jan" })).toBeInTheDocument();
      // Picking a year alone must not commit a month yet.
      expect(onMonthChange).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Mar" }));
      expect(onMonthChange).toHaveBeenCalledOnce();
      expect(onMonthChange.mock.calls[0][0]).toEqual(new Date(2025, 2, 1));
      // Back on the day grid (weekday row visible, month cells gone). The
      // controlled `month` prop still shows January until the parent re-supplies
      // March — that hand-off is the caller's job, same as the arrow nav.
      expect(screen.getByText("Mo")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Jan" })).not.toBeInTheDocument();
    });

    it("lands on the picked month when uncontrolled", () => {
      render(<Calendar />);
      fireEvent.click(screen.getByRole("button", { name: /Choose year/ }));
      // "today" (test run) may sit on a different 12-year page — page until 2025 shows.
      if (!screen.queryByRole("button", { name: "2025" })) {
        fireEvent.click(screen.getByRole("button", { name: "Next years" }));
      }
      if (!screen.queryByRole("button", { name: "2025" })) {
        fireEvent.click(screen.getByRole("button", { name: "Previous years" }));
      }
      fireEvent.click(screen.getByRole("button", { name: "2025" }));
      fireEvent.click(screen.getByRole("button", { name: "Mar" }));
      expect(screen.getByText("March 2025")).toBeInTheDocument();
    });

    it("pages years twelve at a time and years one at a time in month view", () => {
      render(<Calendar month={january2024} />);

      fireEvent.click(screen.getByRole("button", { name: /Choose year/ }));
      fireEvent.click(screen.getByRole("button", { name: "Next years" }));
      expect(screen.getByText("2028–2039")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Previous years" }));
      expect(screen.getByText("2016–2027")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "2024" }));
      fireEvent.click(screen.getByRole("button", { name: "Next year" }));
      expect(
        screen.getByRole("button", { name: /Choose year, currently 2025/ }),
      ).toBeInTheDocument();
    });

    it("disables years and months outside min/max", () => {
      render(
        <Calendar month={january2024} min={new Date(2024, 2, 1)} max={new Date(2025, 5, 30)} />,
      );

      fireEvent.click(screen.getByRole("button", { name: /Choose year/ }));
      expect(screen.getByRole("button", { name: "2023" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "2026" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "2024" })).not.toBeDisabled();

      fireEvent.click(screen.getByRole("button", { name: "2024" }));
      expect(screen.getByRole("button", { name: "Jan" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Feb" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Mar" })).not.toBeDisabled();
    });

    it("swaps the day grid out entirely while browsing year/month views", () => {
      const { container } = render(
        <Calendar
          mode="range"
          month={january2024}
          value={[new Date(2024, 0, 10), new Date(2024, 0, 14)]}
        />,
      );
      expect(container.querySelector(".okryshto-calendar__grid")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /Choose year/ }));
      expect(container.querySelector(".okryshto-calendar__grid")).not.toBeInTheDocument();
      expect(container.querySelector(".okryshto-calendar__day--in-range")).not.toBeInTheDocument();
    });
  });

  it("renders no shortcut chips column", () => {
    const { container } = render(<Calendar month={january2024} value={new Date(2024, 0, 10)} />);
    expect(container.querySelector(".okryshto-calendar__chips")).not.toBeInTheDocument();
    expect(container.querySelector(".okryshto-chip")).not.toBeInTheDocument();
  });

  describe("range mode", () => {
    it("marks both ends and the days between them", () => {
      render(
        <Calendar
          mode="range"
          month={january2024}
          value={[new Date(2024, 0, 10), new Date(2024, 0, 14)]}
        />,
      );

      expect(screen.getByRole("button", { name: "10" })).toHaveClass(
        "okryshto-calendar__day--range-start",
      );
      expect(screen.getByRole("button", { name: "14" })).toHaveClass(
        "okryshto-calendar__day--range-end",
      );
      expect(screen.getByRole("button", { name: "12" })).toHaveClass(
        "okryshto-calendar__day--in-range",
      );
      // The ends carry their own modifier and must not also be tinted as interior.
      expect(screen.getByRole("button", { name: "10" })).not.toHaveClass(
        "okryshto-calendar__day--in-range",
      );
      expect(screen.getByRole("button", { name: "9" })).not.toHaveClass(
        "okryshto-calendar__day--in-range",
      );
    });

    it("paints adjacent-month days inside the range without making them an end", () => {
      // The bug this replaces: the end marker was the *last highlighted cell in
      // the DOM*, so a trailing day of the next month became a third solid date.
      // January 2024 (Monday start) trails Feb 1–4 as outside days.
      const { container } = render(
        <Calendar
          mode="range"
          month={january2024}
          value={[new Date(2024, 0, 29), new Date(2024, 1, 8)]}
        />,
      );

      const trailing = [...container.querySelectorAll(".okryshto-calendar__day--outside")];
      expect(trailing).toHaveLength(4);
      for (const cell of trailing) {
        expect(cell).toHaveClass("okryshto-calendar__day--in-range");
        expect(cell).not.toHaveClass("okryshto-calendar__day--range-end");
      }
      // Exactly one start and no end at all: Feb 8 is not in this month's grid.
      expect(container.querySelectorAll(".okryshto-calendar__day--range-start")).toHaveLength(1);
      expect(container.querySelectorAll(".okryshto-calendar__day--range-end")).toHaveLength(0);
    });

    it("commits on the second click and orders the pair", () => {
      const onSelect = vi.fn();
      render(<Calendar mode="range" month={january2024} onSelect={onSelect} />);

      fireEvent.click(screen.getByRole("button", { name: "20" }));
      expect(onSelect).not.toHaveBeenCalled();
      // The armed start shows immediately, so the click is not silently swallowed.
      expect(screen.getByRole("button", { name: "20" })).toHaveClass(
        "okryshto-calendar__day--range-start",
      );

      fireEvent.click(screen.getByRole("button", { name: "12" }));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect.mock.calls[0][0]).toEqual([new Date(2024, 0, 12), new Date(2024, 0, 20)]);
    });

    it("starts a fresh range on the click after a committed one", () => {
      const onSelect = vi.fn();
      const { rerender } = render(
        <Calendar
          mode="range"
          month={january2024}
          value={[new Date(2024, 0, 10), new Date(2024, 0, 14)]}
          onSelect={onSelect}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "20" }));
      expect(onSelect).not.toHaveBeenCalled();
      // The old pair stops rendering the moment a new start is armed.
      expect(screen.getByRole("button", { name: "12" })).not.toHaveClass(
        "okryshto-calendar__day--in-range",
      );

      fireEvent.click(screen.getByRole("button", { name: "25" }));
      expect(onSelect.mock.calls[0][0]).toEqual([new Date(2024, 0, 20), new Date(2024, 0, 25)]);

      rerender(
        <Calendar
          mode="range"
          month={january2024}
          value={[new Date(2024, 0, 20), new Date(2024, 0, 25)]}
          onSelect={onSelect}
        />,
      );
      expect(screen.getByRole("button", { name: "22" })).toHaveClass(
        "okryshto-calendar__day--in-range",
      );
    });

    it("uses the single-date modifier only in single mode", () => {
      const { container, rerender } = render(
        <Calendar month={january2024} value={new Date(2024, 0, 10)} />,
      );
      expect(container.querySelectorAll(".okryshto-calendar__day--selected")).toHaveLength(1);

      rerender(
        <Calendar
          mode="range"
          month={january2024}
          value={[new Date(2024, 0, 10), new Date(2024, 0, 14)]}
        />,
      );
      expect(container.querySelectorAll(".okryshto-calendar__day--selected")).toHaveLength(0);
    });
  });
});
