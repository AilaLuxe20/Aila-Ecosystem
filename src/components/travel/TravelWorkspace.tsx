"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type { TravelItemDto, TravelTripDto } from "@/core/travel/service";
import { workspaceFetch } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import {
  Button,
  EmptyState,
  Field,
  Input,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

const selectClass = "w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm";

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function TravelWorkspaceInner(): React.JSX.Element {
  const { isSignedIn, getToken } = useAuth();
  const toast = useToast();
  const [trips, setTrips] = useState<TravelTripDto[]>([]);
  const [selected, setSelected] = useState<TravelTripDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("planning");

  const [itemKind, setItemKind] = useState<TravelItemDto["kind"]>("note");
  const [itemTitle, setItemTitle] = useState("");
  const [itemDetails, setItemDetails] = useState("");
  const [itemStartsAt, setItemStartsAt] = useState("");
  const selectedRef = useRef<TravelTripDto | null>(null);

  function applyTrip(trip: TravelTripDto | null) {
    selectedRef.current = trip;
    setSelected(trip);
    setTitle(trip?.title ?? "");
    setDestination(trip?.destination ?? "");
    setStartsOn(toDateInput(trip?.startsOn ?? null));
    setEndsOn(toDateInput(trip?.endsOn ?? null));
    setNotes(trip?.notes ?? "");
    setStatus(trip?.status ?? "planning");
  }

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!isSignedIn) return;
      const response = (await workspaceFetch("/api/travel", { method: "GET" }, signal, getToken)) as {
        data?: { trips?: TravelTripDto[] };
      };
      const next = response.data?.trips ?? [];
      const current = selectedRef.current;
      setTrips(next);
      applyTrip(
        !current ? next[0] ?? null : next.find((trip) => trip.id === current.id) ?? next[0] ?? null,
      );
      setError(null);
      setLoading(false);
    },
    [getToken, isSignedIn],
  );

  useEffect(() => {
    if (!isSignedIn) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void load(controller.signal).catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        setError(caught);
        setLoading(false);
      });
    }, 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isSignedIn, load]);

  async function createTrip() {
    setSaving(true);
    try {
      const response = (await workspaceFetch(
        "/api/travel",
        {
          method: "POST",
          body: JSON.stringify({ title: "Untitled trip", destination: "TBD" }),
        },
        undefined,
        getToken,
      )) as { data?: { trip?: TravelTripDto } };
      toast.success("Trip created");
      await load();
      if (response.data?.trip) applyTrip(response.data.trip);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to create the trip.");
    } finally {
      setSaving(false);
    }
  }

  async function saveTrip(items?: TravelItemDto[]) {
    if (!selected) return;
    setSaving(true);
    try {
      await workspaceFetch(
        `/api/travel/${selected.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title,
            destination,
            startsOn: startsOn || null,
            endsOn: endsOn || null,
            notes: notes || null,
            status,
            items: items ?? selected.items,
          }),
        },
        undefined,
        getToken,
      );
      toast.success("Trip saved");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the trip.");
    } finally {
      setSaving(false);
    }
  }

  async function addItem() {
    if (!selected) return;
    const nextItems = [
      ...selected.items,
      {
        id: crypto.randomUUID(),
        kind: itemKind,
        title: itemTitle,
        details: itemDetails,
        startsAt: itemStartsAt ? new Date(itemStartsAt).toISOString() : null,
      },
    ];
    await saveTrip(nextItems);
    setItemTitle("");
    setItemDetails("");
    setItemStartsAt("");
  }

  async function removeItem(id: string) {
    if (!selected) return;
    await saveTrip(selected.items.filter((item) => item.id !== id));
  }

  async function removeTrip() {
    if (!selected) return;
    setSaving(true);
    try {
      await workspaceFetch(`/api/travel/${selected.id}`, { method: "DELETE" }, undefined, getToken);
      applyTrip(null);
      toast.success("Trip deleted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete the trip.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspaceShell
      product="Travel"
      href="/products/travel"
      accent="orange"
      title="Trip planner"
      description="Plan itineraries and reservation notes. Aila does not book or confirm travel."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <Button leadingIcon={<Plus />} onClick={() => void createTrip()} loading={saving}>
          New trip
        </Button>
      }
    >
      <div className="mb-6 rounded-2xl border border-orange-300/20 bg-orange-300/[0.06] px-4 py-3 text-sm text-orange-50/85">
        Aila does not book or confirm reservations. Confirmation numbers you type are notes only.
      </div>

      {trips.length === 0 ? (
        <EmptyState
          title="No trips"
          description="Create a trip, then add flights, stays, activities, and notes you already have."
          action={<Button onClick={() => void createTrip()}>Create trip</Button>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <ul className="space-y-2">
            {trips.map((trip) => (
              <li key={trip.id}>
                <button
                  type="button"
                  onClick={() => applyTrip(trip)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left ${
                    selected?.id === trip.id
                      ? "border-orange-300/30 bg-orange-300/[0.08]"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">{trip.status}</p>
                  <p className="mt-1 truncate text-sm font-medium">{trip.title}</p>
                  <p className="mt-1 truncate text-xs text-white/45">{trip.destination}</p>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title">
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} />
                </Field>
                <Field label="Destination">
                  <Input value={destination} onChange={(event) => setDestination(event.target.value)} />
                </Field>
                <Field label="Starts">
                  <Input type="date" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} />
                </Field>
                <Field label="Ends">
                  <Input type="date" value={endsOn} onChange={(event) => setEndsOn(event.target.value)} />
                </Field>
              </div>
              <Field label="Status">
                <select
                  className={selectClass}
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="planning">Planning</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="done">Done</option>
                </select>
              </Field>
              <Field label="Notes">
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void saveTrip()} loading={saving}>
                  Save trip
                </Button>
                <Button variant="secondary" onClick={() => void removeTrip()} loading={saving}>
                  Delete
                </Button>
              </div>

              <div className="border-t border-white/8 pt-4">
                <h3 className="text-sm font-medium">Itinerary</h3>
                <p className="mt-1 text-sm text-white/45">
                  These are notes. A reservation here is not a booking.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field label="Kind">
                    <select
                      className={selectClass}
                      value={itemKind}
                      onChange={(event) => setItemKind(event.target.value as TravelItemDto["kind"])}
                    >
                      <option value="flight">Flight</option>
                      <option value="stay">Stay</option>
                      <option value="activity">Activity</option>
                      <option value="note">Note</option>
                      <option value="reservation">Reservation note</option>
                    </select>
                  </Field>
                  <Field label="Title">
                    <Input value={itemTitle} onChange={(event) => setItemTitle(event.target.value)} />
                  </Field>
                  <Field label="Details">
                    <Input value={itemDetails} onChange={(event) => setItemDetails(event.target.value)} />
                  </Field>
                  <Field label="When">
                    <Input
                      type="datetime-local"
                      value={itemStartsAt}
                      onChange={(event) => setItemStartsAt(event.target.value)}
                    />
                  </Field>
                </div>
                <Button className="mt-3" leadingIcon={<Plus />} onClick={() => void addItem()} loading={saving}>
                  Add item
                </Button>
                {selected.items.length === 0 ? (
                  <p className="mt-4 text-sm text-white/45">No itinerary items yet.</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {selected.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 px-4 py-3"
                      >
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-white/40">{item.kind}</p>
                          <p className="mt-1 font-medium">{item.title}</p>
                          {item.details ? <p className="mt-1 text-sm text-white/50">{item.details}</p> : null}
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => void removeItem(item.id)}>
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-10">
        <ChatInterface
          mode="travel"
          showConversationHistory
          placeholder="Plan a trip from your notes..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function TravelWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <TravelWorkspaceInner />
    </ToastProvider>
  );
}
