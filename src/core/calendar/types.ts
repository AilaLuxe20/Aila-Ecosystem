/**
 * Aila Calendar domain types.
 *
 * Events live in Aila's Postgres database and belong to a single user.
 * External calendar providers (Google Calendar, Outlook, Apple Calendar) are
 * not connected. Two-way sync would require OAuth credentials and provider
 * APIs that are not configured.
 */

export const CALENDAR_TITLE_MAX = 200;
export const CALENDAR_DESCRIPTION_MAX = 5_000;
export const CALENDAR_LOCATION_MAX = 300;
export const CALENDAR_TIMEZONE_MAX = 64;
export const CALENDAR_SEARCH_MAX = 200;
export const CALENDAR_EVENT_ID_MAX = 128;
export const CALENDAR_LIST_LIMIT = 500;
export const CALENDAR_MAX_SPAN_MS = 366 * 24 * 60 * 60 * 1_000;

export type CalendarEventRecord = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
  timezone: string;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CalendarEventDto = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  timezone: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CalendarEventStatusFilter = "active" | "archived" | "all";

export type ListCalendarEventsInput = {
  from?: Date;
  to?: Date;
  q?: string;
  status: CalendarEventStatusFilter;
};

export type CreateCalendarEventInput = {
  title: string;
  description: string | null;
  location: string | null;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
  timezone: string;
};

export type UpdateCalendarEventInput = {
  title?: string;
  description?: string | null;
  location?: string | null;
  startsAt?: Date;
  endsAt?: Date;
  allDay?: boolean;
  timezone?: string;
  archived?: boolean;
};
