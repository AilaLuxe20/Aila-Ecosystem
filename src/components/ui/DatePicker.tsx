"use client";

import { CalendarDays, Clock, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { formatDate, type DateRange } from "@/lib/utils/date";
import { clamp } from "@/lib/utils/number";
import { useControllableState } from "@/hooks/use-controllable-state";

import { Calendar } from "./Calendar";
import { useFieldControl } from "./Field";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { fieldBase, focusRing, type ControlSize } from "./variants";

/** Props shared by the date and time pickers. */
interface PickerBaseProps {
  /** Control height. Defaults to `"md"`. */
  readonly size?: ControlSize;
  /** Marks the control invalid. */
  readonly invalid?: boolean;
  /** Prevents interaction. */
  readonly disabled?: boolean;
  /** Text shown when nothing is selected. */
  readonly placeholder?: string;
  /** Renders a clear control once a value is set. */
  readonly clearable?: boolean;
  readonly className?: string;
}

/** Props for {@link DatePicker}. */
export interface DatePickerProps extends PickerBaseProps {
  /** Controlled value. */
  readonly value?: Date | null;
  /** Initial value when uncontrolled. */
  readonly defaultValue?: Date | null;
  /** Called when the selection changes. */
  readonly onValueChange?: (date: Date | null) => void;
  /** Display format, as a `date-fns` pattern. */
  readonly displayFormat?: string;
  /** Earliest selectable date. */
  readonly minDate?: Date;
  /** Latest selectable date. */
  readonly maxDate?: Date;
}

/**
 * A single-date picker backed by {@link Calendar}.
 *
 * The popover closes on selection, since choosing a date is a complete action.
 *
 * @param props - Value, bounds, formatting, and presentation settings.
 * @returns The date picker control.
 *
 * @example
 * <DatePicker value={dueDate} onValueChange={setDueDate} minDate={new Date()} />
 */
export function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  displayFormat = "d MMM yyyy",
  minDate,
  maxDate,
  size = "md",
  invalid,
  disabled,
  placeholder = "Select a date",
  clearable = false,
  className,
}: DatePickerProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useControllableState<Date | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const field = useFieldControl({ invalid, disabled });
  const isInvalid = field["aria-invalid"] ?? false;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={field.id}
        disabled={field.disabled}
        aria-describedby={field["aria-describedby"]}
        className={cn(
          fieldBase({ size, invalid: isInvalid }),
          "flex items-center justify-between gap-2 text-start",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <CalendarDays aria-hidden className="size-4 shrink-0 text-white/35" />
          <span className={cn(!selected && "text-white/30")}>
            {selected ? formatDate(selected, displayFormat) : placeholder}
          </span>
        </span>

        {clearable && selected ? (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear date"
            onClick={(event) => {
              event.stopPropagation();
              setSelected(null);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              event.stopPropagation();
              setSelected(null);
            }}
            className={cn("rounded p-0.5 text-white/35 hover:text-white", focusRing)}
          >
            <X aria-hidden className="size-3.5" />
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          value={selected}
          onValueChange={(date) => {
            setSelected(date);
            setOpen(false);
          }}
          minDate={minDate}
          maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Props for {@link DateRangePicker}. */
export interface DateRangePickerProps extends PickerBaseProps {
  /** Controlled value. */
  readonly value?: DateRange | null;
  /** Initial value when uncontrolled. */
  readonly defaultValue?: DateRange | null;
  /** Called when the selection changes. */
  readonly onValueChange?: (range: DateRange | null) => void;
  /** Display format, as a `date-fns` pattern. */
  readonly displayFormat?: string;
  /** Earliest selectable date. */
  readonly minDate?: Date;
  /** Latest selectable date. */
  readonly maxDate?: Date;
}

/**
 * A date-range picker backed by {@link Calendar}.
 *
 * The popover stays open between the two clicks that define a range, closing
 * only once both ends are set.
 *
 * @param props - Value, bounds, formatting, and presentation settings.
 * @returns The range picker control.
 */
export function DateRangePicker({
  value,
  defaultValue = null,
  onValueChange,
  displayFormat = "d MMM",
  minDate,
  maxDate,
  size = "md",
  invalid,
  disabled,
  placeholder = "Select a date range",
  className,
}: DateRangePickerProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useControllableState<DateRange | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const field = useFieldControl({ invalid, disabled });
  const isInvalid = field["aria-invalid"] ?? false;

  const label = useMemo(() => {
    if (!selected) return placeholder;
    return `${formatDate(selected.from, displayFormat)} – ${formatDate(selected.to, displayFormat)}`;
  }, [selected, displayFormat, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={field.id}
        disabled={field.disabled}
        aria-describedby={field["aria-describedby"]}
        className={cn(
          fieldBase({ size, invalid: isInvalid }),
          "flex items-center gap-2 text-start",
          className,
        )}
      >
        <CalendarDays aria-hidden className="size-4 shrink-0 text-white/35" />
        <span className={cn("truncate", !selected && "text-white/30")}>{label}</span>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          value={selected}
          onValueChange={setSelected}
          minDate={minDate}
          maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Props for {@link TimePicker}. */
export interface TimePickerProps extends PickerBaseProps {
  /** Controlled value as `"HH:mm"` in 24-hour form. */
  readonly value?: string | null;
  /** Initial value when uncontrolled. */
  readonly defaultValue?: string | null;
  /** Called when the selection changes. */
  readonly onValueChange?: (time: string | null) => void;
  /** Minute increment between options. Defaults to 15. */
  readonly minuteStep?: number;
  /** Earliest selectable time as `"HH:mm"`. */
  readonly minTime?: string;
  /** Latest selectable time as `"HH:mm"`. */
  readonly maxTime?: string;
}

/**
 * Converts `"HH:mm"` into minutes since midnight.
 *
 * @param time - A 24-hour time string.
 * @returns Minutes since midnight, or `null` when unparseable.
 */
function toMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
}

/**
 * Formats minutes since midnight as `"HH:mm"`.
 *
 * @param totalMinutes - Minutes since midnight.
 * @returns The formatted time.
 */
function fromMinutes(totalMinutes: number): string {
  const clamped = clamp(totalMinutes, 0, 24 * 60 - 1);
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * A time picker offering discrete options at a fixed interval.
 *
 * A fixed-step list is used rather than free text because most scheduling flows
 * want quarter-hour granularity, and a list removes an entire class of parsing
 * and validation errors.
 *
 * @param props - Value, step, bounds, and presentation settings.
 * @returns The time picker control.
 *
 * @example
 * <TimePicker value={start} onValueChange={setStart} minuteStep={30} />
 */
export function TimePicker({
  value,
  defaultValue = null,
  onValueChange,
  minuteStep = 15,
  minTime,
  maxTime,
  size = "md",
  invalid,
  disabled,
  placeholder = "Select a time",
  className,
}: TimePickerProps): React.JSX.Element {
  const [selected, setSelected] = useControllableState<string | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const options = useMemo(() => {
    const step = Math.max(1, Math.trunc(minuteStep));
    const lowerBound = minTime ? (toMinutes(minTime) ?? 0) : 0;
    const upperBound = maxTime ? (toMinutes(maxTime) ?? 24 * 60 - 1) : 24 * 60 - 1;

    const values: string[] = [];
    for (let minutes = lowerBound; minutes <= upperBound; minutes += step) {
      values.push(fromMinutes(minutes));
    }

    return values;
  }, [minuteStep, minTime, maxTime]);

  const handleChange = useCallback(
    (next: string) => setSelected(next),
    [setSelected],
  );

  return (
    <Select
      value={selected ?? undefined}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger size={size} invalid={invalid} icon={<Clock />} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
