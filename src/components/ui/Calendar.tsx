"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import {
  addDays,
  buildCalendarGrid,
  formatDate,
  isSameDay,
  startOfDay,
  startOfMonth,
  type DateRange,
} from "@/lib/utils/date";
import { useControllableState } from "@/hooks/use-controllable-state";

import { IconButton } from "./Button";
import { focusRing } from "./variants";

/**
 * A month-grid date picker.
 *
 * Implemented as a `grid` with `gridcell` children rather than a table, and
 * driven by a roving `tabIndex`: the grid is one tab stop and arrow keys move
 * between days, matching the WAI-ARIA date-picker pattern.
 */

/** Selection behaviour of a {@link Calendar}. */
export type CalendarMode = "single" | "range";

/** Props shared by all calendar modes. */
interface CalendarBaseProps {
  /** Month initially displayed. Defaults to today's month. */
  readonly defaultMonth?: Date;
  /** Earliest selectable date. */
  readonly minDate?: Date;
  /** Latest selectable date. */
  readonly maxDate?: Date;
  /** Additional predicate marking specific dates unselectable. */
  readonly isDateDisabled?: (date: Date) => boolean;
  /** Day the week starts on, where 0 is Sunday. Defaults to Monday. */
  readonly weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  readonly className?: string;
}

/** Props for a single-date {@link Calendar}. */
export interface CalendarSingleProps extends CalendarBaseProps {
  readonly mode?: "single";
  readonly value?: Date | null;
  readonly defaultValue?: Date | null;
  readonly onValueChange?: (date: Date | null) => void;
}

/** Props for a range {@link Calendar}. */
export interface CalendarRangeProps extends CalendarBaseProps {
  readonly mode: "range";
  readonly value?: DateRange | null;
  readonly defaultValue?: DateRange | null;
  readonly onValueChange?: (range: DateRange | null) => void;
}

/** Props for {@link Calendar}. */
export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/**
 * Rotates weekday labels so they begin on the configured first day.
 *
 * @param weekStartsOn - Day the week starts on, where 0 is Sunday.
 * @returns Seven short weekday labels in display order.
 */
function weekdayLabels(weekStartsOn: number): readonly string[] {
  // WEEKDAY_LABELS starts on Monday, which is index 1 in JS day numbering.
  const offset = (weekStartsOn + 6) % 7;
  return [...WEEKDAY_LABELS.slice(offset), ...WEEKDAY_LABELS.slice(0, offset)];
}

/**
 * A calendar supporting single-date and range selection.
 *
 * @param props - Mode, value, bounds, and presentation settings.
 * @returns The calendar element.
 *
 * @example
 * <Calendar value={date} onValueChange={setDate} minDate={new Date()} />
 * <Calendar mode="range" value={range} onValueChange={setRange} />
 */
export function Calendar(props: CalendarProps): React.JSX.Element {
  const {
    defaultMonth,
    minDate,
    maxDate,
    isDateDisabled,
    weekStartsOn = 1,
    className,
  } = props;

  const isRange = props.mode === "range";

  const [singleValue, setSingleValue] = useControllableState<Date | null>({
    value: isRange ? undefined : props.value,
    defaultValue: isRange ? null : (props.defaultValue ?? null),
    onChange: isRange ? undefined : props.onValueChange,
  });

  const [rangeValue, setRangeValue] = useControllableState<DateRange | null>({
    value: isRange ? props.value : undefined,
    defaultValue: isRange ? (props.defaultValue ?? null) : null,
    onChange: isRange ? props.onValueChange : undefined,
  });

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(defaultMonth ?? (isRange ? rangeValue?.from : singleValue) ?? new Date()),
  );

  // Tracks the first click of a range so the second click can complete it.
  const [rangeAnchor, setRangeAnchor] = useState<Date | null>(null);
  const [focusedDate, setFocusedDate] = useState<Date>(() => viewMonth);

  const days = useMemo(
    () => buildCalendarGrid(viewMonth, weekStartsOn),
    [viewMonth, weekStartsOn],
  );

  const today = useMemo(() => startOfDay(new Date()), []);

  const isDisabled = useCallback(
    (date: Date): boolean => {
      if (minDate && date < startOfDay(minDate)) return true;
      if (maxDate && date > startOfDay(maxDate)) return true;
      return isDateDisabled?.(date) ?? false;
    },
    [minDate, maxDate, isDateDisabled],
  );

  const handleSelect = useCallback(
    (date: Date) => {
      if (isDisabled(date)) return;

      if (!isRange) {
        setSingleValue(date);
        return;
      }

      if (!rangeAnchor) {
        setRangeAnchor(date);
        setRangeValue({ from: date, to: date });
        return;
      }

      const from = date < rangeAnchor ? date : rangeAnchor;
      const to = date < rangeAnchor ? rangeAnchor : date;

      setRangeValue({ from, to });
      setRangeAnchor(null);
    },
    [isDisabled, isRange, rangeAnchor, setSingleValue, setRangeValue],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const offsets: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
      };

      const offset = offsets[event.key];

      if (offset !== undefined) {
        event.preventDefault();
        const next = addDays(focusedDate, offset);
        setFocusedDate(next);

        // Follow the focus into the adjacent month when it leaves the grid.
        if (next.getMonth() !== viewMonth.getMonth()) setViewMonth(startOfMonth(next));
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSelect(focusedDate);
      }
    },
    [focusedDate, viewMonth, handleSelect],
  );

  const inSelectedRange = useCallback(
    (date: Date): boolean => {
      if (!isRange || !rangeValue) return false;
      return date >= startOfDay(rangeValue.from) && date <= startOfDay(rangeValue.to);
    },
    [isRange, rangeValue],
  );

  const isSelected = useCallback(
    (date: Date): boolean => {
      if (isRange) {
        if (!rangeValue) return false;
        return isSameDay(date, rangeValue.from) || isSameDay(date, rangeValue.to);
      }
      return singleValue ? isSameDay(date, singleValue) : false;
    },
    [isRange, rangeValue, singleValue],
  );

  return (
    <div className={cn("w-fit select-none p-3", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <IconButton
          label="Previous month"
          icon={<ChevronLeft />}
          variant="ghost"
          size="sm"
          onClick={() => setViewMonth((month) => startOfMonth(addDays(month, -1)))}
        />

        <p aria-live="polite" className="text-sm font-medium text-white">
          {formatDate(viewMonth, "MMMM yyyy")}
        </p>

        <IconButton
          label="Next month"
          icon={<ChevronRight />}
          variant="ghost"
          size="sm"
          onClick={() => setViewMonth((month) => startOfMonth(addDays(month, 32)))}
        />
      </div>

      <div
        role="grid"
        aria-label={formatDate(viewMonth, "MMMM yyyy")}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn("rounded-control", focusRing)}
      >
        <div role="row" className="grid grid-cols-7">
          {weekdayLabels(weekStartsOn).map((day) => (
            <div
              key={day}
              role="columnheader"
              aria-label={day}
              className="grid h-8 place-items-center text-2xs font-medium text-white/35"
            >
              {day.charAt(0)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {days.map((date) => {
            const outsideMonth = date.getMonth() !== viewMonth.getMonth();
            const disabled = isDisabled(date);
            const selected = isSelected(date);
            const inRange = inSelectedRange(date) && !selected;
            const isToday = isSameDay(date, today);
            const isFocused = isSameDay(date, focusedDate);

            return (
              <button
                key={date.toISOString()}
                type="button"
                role="gridcell"
                tabIndex={-1}
                disabled={disabled}
                aria-selected={selected}
                aria-current={isToday ? "date" : undefined}
                aria-label={formatDate(date, "EEEE d MMMM yyyy")}
                onClick={() => {
                  setFocusedDate(date);
                  handleSelect(date);
                }}
                className={cn(
                  "grid size-8 place-items-center rounded-control text-xs tabular-nums",
                  "transition-colors duration-instant",
                  outsideMonth && "text-white/20",
                  !outsideMonth && !selected && "text-white/75 hover:bg-surface-raised",
                  inRange && "bg-brand-500/12 text-brand-200",
                  selected && "bg-brand-500 font-medium text-brand-950",
                  isToday && !selected && "ring-1 ring-inset ring-brand-500/40",
                  isFocused && !selected && "bg-surface-raised",
                  disabled && "cursor-not-allowed opacity-25 hover:bg-transparent",
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
