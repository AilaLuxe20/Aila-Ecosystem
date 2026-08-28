"use client";

import { useMemo, useState } from "react";

import type { CalendarEventDto } from "@/core/calendar/types";
import {
  Button,
  Checkbox,
  DatePicker,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  Textarea,
} from "@/components/ui";
import { endOfDay, formatDate, startOfDay } from "@/lib/utils/date";

type EventFormDialogProps = {
  open: boolean;
  event: CalendarEventDto | null;
  defaultDate: Date;
  submitting: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    title: string;
    description: string | null;
    location: string | null;
    startsAt: string;
    endsAt: string;
    allDay: boolean;
    timezone: string;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onArchive?: (archived: boolean) => Promise<void>;
};

function timeFromDate(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function combineDateAndTime(date: Date, time: string): Date {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  const hours = match ? Number(match[1]) : 9;
  const minutes = match ? Number(match[2]) : 0;
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function createFormState(event: CalendarEventDto | null, defaultDate: Date) {
  if (event) {
    const startsAt = new Date(event.startsAt);
    const endsAt = new Date(event.endsAt);

    return {
      title: event.title,
      description: event.description ?? "",
      location: event.location ?? "",
      allDay: event.allDay,
      startDate: startOfDay(startsAt),
      endDate: startOfDay(endsAt),
      startTime: timeFromDate(startsAt),
      endTime: timeFromDate(endsAt),
    };
  }

  const base = startOfDay(defaultDate);
  const start = combineDateAndTime(base, "09:00");

  return {
    title: "",
    description: "",
    location: "",
    allDay: false,
    startDate: base,
    endDate: base,
    startTime: "09:00",
    endTime: timeFromDate(addHours(start, 1)),
  };
}

export function EventFormDialog({
  open,
  event,
  defaultDate,
  submitting,
  error,
  fieldErrors,
  onOpenChange,
  onSubmit,
  onDelete,
  onArchive,
}: EventFormDialogProps): React.JSX.Element {
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );

  const initial = createFormState(event, defaultDate);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [location, setLocation] = useState(initial.location);
  const [allDay, setAllDay] = useState(initial.allDay);
  const [startDate, setStartDate] = useState<Date | null>(initial.startDate);
  const [endDate, setEndDate] = useState<Date | null>(initial.endDate);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    if (!startDate || !endDate) {
      return;
    }

    const startsAt = allDay ? startOfDay(startDate) : combineDateAndTime(startDate, startTime);
    const endsAt = allDay ? endOfDay(endDate) : combineDateAndTime(endDate, endTime);

    await onSubmit({
      title,
      description: description.trim() ? description.trim() : null,
      location: location.trim() ? location.trim() : null,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      allDay,
      timezone,
    });
  }

  const isArchived = Boolean(event?.archivedAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{event ? "Edit event" : "New event"}</DialogTitle>
            <DialogDescription>
              {event
                ? `Saved ${formatDate(event.updatedAt, "d MMM yyyy, HH:mm")}`
                : "Events are stored in your Aila Calendar. They are not synced to Google, Outlook, or Apple Calendar."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <Field label="Title" required error={fieldErrors.title}>
              <Input
                value={title}
                onChange={(change) => setTitle(change.target.value)}
                placeholder="Event title"
                maxLength={200}
                autoFocus
                required
              />
            </Field>

            <Checkbox
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(checked === true)}
              label="All day"
              description="Uses the full calendar day instead of a start and end time."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date" required error={fieldErrors.startsAt}>
                <DatePicker value={startDate} onValueChange={setStartDate} />
              </Field>
              {allDay ? null : (
                <Field label="Start time" required>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(change) => setStartTime(change.target.value)}
                    required
                  />
                </Field>
              )}
              <Field label="End date" required error={fieldErrors.endsAt}>
                <DatePicker value={endDate} onValueChange={setEndDate} />
              </Field>
              {allDay ? null : (
                <Field label="End time" required>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(change) => setEndTime(change.target.value)}
                    required
                  />
                </Field>
              )}
            </div>

            <Field label="Location" error={fieldErrors.location}>
              <Input
                value={location}
                onChange={(change) => setLocation(change.target.value)}
                placeholder="Optional"
                maxLength={300}
              />
            </Field>

            <Field label="Description" error={fieldErrors.description}>
              <Textarea
                value={description}
                onChange={(change) => setDescription(change.target.value)}
                placeholder="Optional notes"
                maxLength={5000}
                rows={4}
                showCount
              />
            </Field>

            {error ? (
              <p role="alert" className="text-xs text-danger">
                {error}
              </p>
            ) : null}
          </DialogBody>

          <DialogFooter className="gap-3 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {event && onDelete ? (
                confirmDelete ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    loading={submitting}
                    onClick={() => void onDelete()}
                  >
                    Confirm delete
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={submitting}
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete
                  </Button>
                )
              ) : null}

              {event && onArchive ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={submitting}
                  onClick={() => void onArchive(!isArchived)}
                >
                  {isArchived ? "Restore" : "Archive"}
                </Button>
              ) : null}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting} loadingText="Saving">
                Save event
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
