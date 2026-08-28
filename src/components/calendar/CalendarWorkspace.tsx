"use client";

import { SignInButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { eventsForDay } from "@/core/calendar/range";
import type { CalendarEventDto, CalendarEventStatusFilter } from "@/core/calendar/types";
import { cn } from "@/lib/utils/cn";
import {
  addDays,
  buildCalendarGrid,
  endOfDay,
  formatDate,
  formatTime,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "@/lib/utils/date";
import {
  Button,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  SearchInput,
  Tabs,
  TabsList,
  TabsTrigger,
  ToastProvider,
  useToast,
} from "@/components/ui";

import { EventFormDialog } from "./EventFormDialog";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type CalendarApiError = {
  message: string;
  fieldErrors: Record<string, string>;
};

function readApiError(body: unknown, fallback: string): CalendarApiError {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as { error: unknown }).error === "object" &&
    (body as { error: unknown }).error !== null
  ) {
    const error = (body as { error: { message?: string; fieldErrors?: Record<string, string> } }).error;
    return {
      message: error.message ?? fallback,
      fieldErrors: error.fieldErrors ?? {},
    };
  }

  return { message: fallback, fieldErrors: {} };
}

async function calendarFetch(
  path: string,
  init: RequestInit | undefined,
  signal?: AbortSignal,
): Promise<unknown> {
  const response = await fetch(path, {
    ...init,
    signal,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = readApiError(body, "Aila Calendar could not complete that request.");
    const error = new Error(parsed.message) as Error & { fieldErrors?: Record<string, string> };
    error.fieldErrors = parsed.fieldErrors;
    throw error;
  }

  return body;
}

function CalendarWorkspaceInner(): React.JSX.Element {
  const { isLoaded, isSignedIn } = useAuth();
  const toast = useToast();

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [status, setStatus] = useState<CalendarEventStatusFilter>("active");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [events, setEvents] = useState<CalendarEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventDto | null>(null);
  const [dialogDefaultDate, setDialogDefaultDate] = useState(() => startOfDay(new Date()));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const days = useMemo(() => buildCalendarGrid(viewMonth, 1), [viewMonth]);
  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const loadEvents = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) {
      return;
    }

    const params = new URLSearchParams();
    params.set("status", status);

    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      const rangeStart = days[0];
      const rangeEnd = days[days.length - 1];
      if (rangeStart && rangeEnd) {
        params.set("from", rangeStart.toISOString());
        params.set("to", endOfDay(rangeEnd).toISOString());
      }
    }

    const body = (await calendarFetch(
      `/api/calendar/events?${params.toString()}`,
      { method: "GET" },
      signal,
    )) as { data?: { events?: CalendarEventDto[] } };

    if (signal?.aborted) {
      return;
    }

    setEvents(body?.data?.events ?? []);
    setLoadError(null);
    setLoading(false);
  }, [days, debouncedSearch, isSignedIn, status]);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void loadEvents(controller.signal).catch((error: unknown) => {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }

        setLoadError(error);
        setLoading(false);
      });
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isSignedIn, loadEvents]);

  const selectedEvents = useMemo(
    () => eventsForDay(events, selectedDay),
    [events, selectedDay],
  );

  function openCreate(date: Date) {
    setEditingEvent(null);
    setDialogDefaultDate(startOfDay(date));
    setFormError(null);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEdit(event: CalendarEventDto) {
    setEditingEvent(event);
    setDialogDefaultDate(startOfDay(new Date(event.startsAt)));
    setFormError(null);
    setFieldErrors({});
    setDialogOpen(true);
  }

  async function handleSubmit(payload: {
    title: string;
    description: string | null;
    location: string | null;
    startsAt: string;
    endsAt: string;
    allDay: boolean;
    timezone: string;
  }) {
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      if (editingEvent) {
        await calendarFetch(`/api/calendar/events/${editingEvent.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Event updated");
      } else {
        await calendarFetch("/api/calendar/events", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Event created");
      }

      setDialogOpen(false);
      await loadEvents();
    } catch (error) {
      const fieldMap =
        error instanceof Error && "fieldErrors" in error
          ? ((error as Error & { fieldErrors?: Record<string, string> }).fieldErrors ?? {})
          : {};
      setFieldErrors(fieldMap);
      setFormError(error instanceof Error ? error.message : "Unable to save the event.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editingEvent) return;
    setSubmitting(true);
    setFormError(null);

    try {
      await calendarFetch(`/api/calendar/events/${editingEvent.id}`, {
        method: "DELETE",
      });
      toast.success("Event deleted");
      setDialogOpen(false);
      await loadEvents();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to delete the event.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchive(archived: boolean) {
    if (!editingEvent) return;
    setSubmitting(true);
    setFormError(null);

    try {
      await calendarFetch(`/api/calendar/events/${editingEvent.id}`, {
        method: "PATCH",
        body: JSON.stringify({ archived }),
      });
      toast.success(archived ? "Event archived" : "Event restored");
      setDialogOpen(false);
      await loadEvents();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to update the event.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="pointer-events-none absolute left-1/2 top-[-280px] h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-rose-500/[0.1] blur-[180px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-rose-200/70">
              Aila Ecosystem / Calendar
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              {formatDate(viewMonth, "MMMM yyyy")}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
              Create, search, edit, archive, and delete your events. Data is saved to your Aila account.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <IconButton
              label="Previous month"
              icon={<ChevronLeft />}
              variant="secondary"
              onClick={() => setViewMonth((month) => startOfMonth(addDays(month, -1)))}
            />
            <Button
              variant="secondary"
              onClick={() => {
                const now = startOfDay(new Date());
                setViewMonth(startOfMonth(now));
                setSelectedDay(now);
              }}
            >
              Today
            </Button>
            <IconButton
              label="Next month"
              icon={<ChevronRight />}
              variant="secondary"
              onClick={() => setViewMonth((month) => startOfMonth(addDays(month, 32)))}
            />
            <Button
              leadingIcon={<Plus />}
              disabled={!isSignedIn}
              onClick={() => openCreate(selectedDay)}
            >
              New event
            </Button>
          </div>
        </header>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            value={status}
            onValueChange={(value) => setStatus(value as CalendarEventStatusFilter)}
          >
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="w-full max-w-sm">
            <SearchInput
              value={search}
              onChange={(change) => setSearch(change.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search events"
              disabled={!isSignedIn}
            />
          </div>
        </div>

        {!isLoaded ? (
          <LoadingState label="Loading calendar" className="mt-16" />
        ) : !isSignedIn ? (
          <EmptyState
            className="mt-16"
            title="Sign in to use Aila Calendar"
            description="Your events are private and stored against your account. Sign in to create, edit, and search them."
            action={
              <SignInButton mode="modal" forceRedirectUrl="/products/calendar">
                <Button>Sign in</Button>
              </SignInButton>
            }
          />
        ) : loadError ? (
          <ErrorState
            className="mt-16"
            error={loadError}
            onRetry={() => void loadEvents()}
          />
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 sm:p-4">
              {loading ? (
                <p className="mb-3 text-xs text-white/40" aria-live="polite">
                  Updating events…
                </p>
              ) : null}

              {debouncedSearch ? (
                <div>
                  <p className="mb-3 text-xs text-white/45">
                    {events.length} search result{events.length === 1 ? "" : "s"} for “
                    {debouncedSearch}”.
                  </p>
                  {events.length === 0 ? (
                    <EmptyState
                      compact
                      title="No matching events"
                      description="Try a different search, or create a new event."
                      action={
                        <Button size="sm" onClick={() => openCreate(selectedDay)}>
                          Create event
                        </Button>
                      }
                    />
                  ) : (
                    <ul className="space-y-2">
                      {events.map((event) => (
                        <li key={event.id}>
                          <button
                            type="button"
                            onClick={() => openEdit(event)}
                            className="w-full rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-left transition hover:border-rose-300/20 hover:bg-rose-400/[0.06]"
                          >
                            <p className="text-sm font-medium text-white">{event.title}</p>
                            <p className="mt-1 text-xs text-white/50">
                              {formatDate(event.startsAt, "EEE d MMM yyyy")}
                              {event.allDay
                                ? " · All day"
                                : ` · ${formatTime(event.startsAt)} – ${formatTime(event.endsAt)}`}
                              {event.location ? ` · ${event.location}` : ""}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7">
                    {WEEKDAY_LABELS.map((label) => (
                      <div
                        key={label}
                        className="grid h-9 place-items-center text-[11px] font-medium uppercase tracking-wide text-white/35"
                      >
                        {label}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-white/8">
                    {days.map((date) => {
                      const dayEvents = eventsForDay(events, date);
                      const outsideMonth = date.getMonth() !== viewMonth.getMonth();
                      const selected = isSameDay(date, selectedDay);
                      const isToday = isSameDay(date, today);
                      const visible = dayEvents.slice(0, 3);
                      const extra = dayEvents.length - visible.length;

                      return (
                        <div
                          key={date.toISOString()}
                          className={cn(
                            "flex min-h-[7.5rem] flex-col gap-1 bg-[#0a0a0a] p-2 text-left transition-colors",
                            selected && "bg-rose-500/[0.08] ring-1 ring-inset ring-rose-300/30",
                            outsideMonth && "opacity-45",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedDay(startOfDay(date))}
                            onDoubleClick={() => openCreate(date)}
                            className="flex items-center justify-between gap-1 rounded-md text-left hover:bg-white/[0.04]"
                            aria-label={formatDate(date, "EEEE d MMMM yyyy")}
                            aria-pressed={selected}
                          >
                            <span
                              className={cn(
                                "grid size-6 place-items-center rounded-full text-xs tabular-nums",
                                isToday && "bg-rose-400 font-semibold text-black",
                                !isToday && "text-white/70",
                              )}
                            >
                              {date.getDate()}
                            </span>
                          </button>

                          {visible.map((event) => (
                            <button
                              key={event.id}
                              type="button"
                              className="truncate rounded-md bg-rose-400/15 px-1.5 py-0.5 text-left text-[11px] text-rose-100 hover:bg-rose-400/25"
                              onClick={() => openEdit(event)}
                            >
                              {event.allDay
                                ? event.title
                                : `${formatTime(event.startsAt)} ${event.title}`}
                            </button>
                          ))}

                          {extra > 0 ? (
                            <button
                              type="button"
                              className="text-left text-[11px] text-white/40 hover:text-white/70"
                              onClick={() => setSelectedDay(startOfDay(date))}
                            >
                              +{extra} more
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>

            <aside className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/35">Selected day</p>
                  <h2 className="mt-1 text-lg font-medium tracking-tight">
                    {formatDate(selectedDay, "EEEE d MMMM")}
                  </h2>
                </div>
                <Button size="sm" variant="secondary" onClick={() => openCreate(selectedDay)}>
                  Add
                </Button>
              </div>

              {selectedEvents.length === 0 ? (
                <EmptyState
                  compact
                  className="mt-6"
                  title={debouncedSearch ? "No matching events" : "No events this day"}
                  description={
                    debouncedSearch
                      ? "Try a different search, or create a new event."
                      : "Double-click a day or use New event to add one."
                  }
                  icon={<Search />}
                  action={
                    <Button size="sm" onClick={() => openCreate(selectedDay)}>
                      Create event
                    </Button>
                  }
                />
              ) : (
                <ul className="mt-5 space-y-2">
                  {selectedEvents.map((event) => (
                    <li key={event.id}>
                      <button
                        type="button"
                        onClick={() => openEdit(event)}
                        className="w-full rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-left transition hover:border-rose-300/20 hover:bg-rose-400/[0.06]"
                      >
                        <p className="text-sm font-medium text-white">{event.title}</p>
                        <p className="mt-1 text-xs text-white/50">
                          {event.allDay
                            ? "All day"
                            : `${formatTime(event.startsAt)} – ${formatTime(event.endsAt)}`}
                          {event.location ? ` · ${event.location}` : ""}
                        </p>
                        {event.archivedAt ? (
                          <p className="mt-1 text-[11px] uppercase tracking-wide text-white/35">
                            Archived
                          </p>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        )}
      </div>

      <EventFormDialog
        key={
          dialogOpen
            ? `${editingEvent?.id ?? "new"}-${dialogDefaultDate.toISOString()}`
            : "closed"
        }
        open={dialogOpen}
        event={editingEvent}
        defaultDate={dialogDefaultDate}
        submitting={submitting}
        error={formError}
        fieldErrors={fieldErrors}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        onDelete={editingEvent ? handleDelete : undefined}
        onArchive={editingEvent ? handleArchive : undefined}
      />
    </main>
  );
}

export function CalendarWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <CalendarWorkspaceInner />
    </ToastProvider>
  );
}
