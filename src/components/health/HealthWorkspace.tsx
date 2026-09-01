"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type { HealthHabitDto, HealthLogDto } from "@/core/health/service";
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

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function HealthWorkspaceInner(): React.JSX.Element {
  const { isSignedIn, getToken } = useAuth();
  const toast = useToast();
  const [habits, setHabits] = useState<HealthHabitDto[]>([]);
  const [logs, setLogs] = useState<HealthLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  const [habitName, setHabitName] = useState("");
  const [habitCadence, setHabitCadence] = useState<"daily" | "weekly">("daily");
  const [habitNotes, setHabitNotes] = useState("");

  const [logKind, setLogKind] = useState<"note" | "mood" | "sleep" | "activity" | "reminder">("note");
  const [logTitle, setLogTitle] = useState("");
  const [logBody, setLogBody] = useState("");
  const [logRemindAt, setLogRemindAt] = useState("");

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!isSignedIn) return;
      const [habitBody, logBody] = (await Promise.all([
        workspaceFetch("/api/health/habits", { method: "GET" }, signal, getToken),
        workspaceFetch("/api/health/logs", { method: "GET" }, signal, getToken),
      ])) as [{ data?: { habits?: HealthHabitDto[] } }, { data?: { logs?: HealthLogDto[] } }];
      setHabits(habitBody.data?.habits ?? []);
      setLogs(logBody.data?.logs ?? []);
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

  async function addHabit() {
    setSaving(true);
    try {
      await workspaceFetch(
        "/api/health/habits",
        {
          method: "POST",
          body: JSON.stringify({
            name: habitName,
            cadence: habitCadence,
            notes: habitNotes || null,
          }),
        },
        undefined,
        getToken,
      );
      setHabitName("");
      setHabitNotes("");
      toast.success("Habit saved");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the habit.");
    } finally {
      setSaving(false);
    }
  }

  async function addLog() {
    setSaving(true);
    try {
      await workspaceFetch(
        "/api/health/logs",
        {
          method: "POST",
          body: JSON.stringify({
            kind: logKind,
            title: logTitle,
            body: logBody,
            remindAt: logRemindAt ? new Date(logRemindAt).toISOString() : null,
          }),
        },
        undefined,
        getToken,
      );
      setLogTitle("");
      setLogBody("");
      setLogRemindAt("");
      toast.success("Log saved");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the log.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleLog(log: HealthLogDto) {
    try {
      await workspaceFetch(
        `/api/health/logs/${log.id}`,
        { method: "PATCH", body: JSON.stringify({ done: !log.done }) },
        undefined,
        getToken,
      );
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to update the log.");
    }
  }

  async function removeHabit(id: string) {
    try {
      await workspaceFetch(`/api/health/habits/${id}`, { method: "DELETE" }, undefined, getToken);
      toast.success("Habit deleted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete the habit.");
    }
  }

  async function removeLog(id: string) {
    try {
      await workspaceFetch(`/api/health/logs/${id}`, { method: "DELETE" }, undefined, getToken);
      toast.success("Log deleted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete the log.");
    }
  }

  return (
    <WorkspaceShell
      product="Health"
      href="/products/health"
      accent="rose"
      title="Wellness notes"
      description="Habits, notes, and reminders you enter. Aila Health is not medical care."
      loading={loading}
      error={error}
      onRetry={() => void load()}
    >
      <div className="mb-6 rounded-2xl border border-rose-300/20 bg-rose-300/[0.06] px-4 py-3 text-sm text-rose-50/85">
        Aila Health organises wellness notes. It does not diagnose, treat, or replace a clinician.
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="text-lg font-medium">Habits</h2>
          <div className="grid gap-3">
            <Field label="Name">
              <Input value={habitName} onChange={(event) => setHabitName(event.target.value)} />
            </Field>
            <Field label="Cadence">
              <select
                className={selectClass}
                value={habitCadence}
                onChange={(event) =>
                  setHabitCadence(event.target.value === "weekly" ? "weekly" : "daily")
                }
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </Field>
            <Field label="Notes">
              <Textarea
                value={habitNotes}
                onChange={(event) => setHabitNotes(event.target.value)}
                rows={3}
              />
            </Field>
            <Button leadingIcon={<Plus />} onClick={() => void addHabit()} loading={saving}>
              Add habit
            </Button>
          </div>
          {habits.length === 0 ? (
            <EmptyState
              compact
              className="mt-4"
              title="No habits"
              description="Add a habit you want to keep on this account."
            />
          ) : (
            <ul className="space-y-2">
              {habits.map((habit) => (
                <li key={habit.id} className="rounded-2xl border border-white/8 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">{habit.cadence}</p>
                  <p className="mt-1 font-medium">{habit.name}</p>
                  {habit.notes ? <p className="mt-1 text-sm text-white/55">{habit.notes}</p> : null}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3"
                    onClick={() => void removeHabit(habit.id)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="text-lg font-medium">Logs</h2>
          <div className="grid gap-3">
            <Field label="Kind">
              <select
                className={selectClass}
                value={logKind}
                onChange={(event) =>
                  setLogKind(
                    event.target.value as "note" | "mood" | "sleep" | "activity" | "reminder",
                  )
                }
              >
                <option value="note">Note</option>
                <option value="mood">Mood</option>
                <option value="sleep">Sleep</option>
                <option value="activity">Activity</option>
                <option value="reminder">Reminder</option>
              </select>
            </Field>
            <Field label="Title">
              <Input value={logTitle} onChange={(event) => setLogTitle(event.target.value)} />
            </Field>
            <Field label="Body">
              <Textarea value={logBody} onChange={(event) => setLogBody(event.target.value)} rows={3} />
            </Field>
            <Field label="Remind at">
              <Input
                type="datetime-local"
                value={logRemindAt}
                onChange={(event) => setLogRemindAt(event.target.value)}
              />
            </Field>
            <Button leadingIcon={<Plus />} onClick={() => void addLog()} loading={saving}>
              Add log
            </Button>
          </div>
          {logs.length === 0 ? (
            <EmptyState
              compact
              className="mt-4"
              title="No logs"
              description="Write a wellness note, mood, sleep, activity, or reminder."
            />
          ) : (
            <ul className="space-y-2">
              {logs.map((log) => (
                <li key={log.id} className="rounded-2xl border border-white/8 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                    {log.kind}
                    {log.done ? " · done" : ""}
                    {log.remindAt ? ` · ${toLocalInput(log.remindAt).replace("T", " ")}` : ""}
                  </p>
                  <p className={`mt-1 font-medium ${log.done ? "text-white/45 line-through" : ""}`}>
                    {log.title}
                  </p>
                  {log.body ? <p className="mt-1 whitespace-pre-wrap text-sm text-white/55">{log.body}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => void toggleLog(log)}>
                      {log.done ? "Reopen" : "Mark done"}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => void removeLog(log.id)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-10">
        <ChatInterface
          mode="health"
          showConversationHistory
          placeholder="Log a habit or reminder — not medical advice..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function HealthWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <HealthWorkspaceInner />
    </ToastProvider>
  );
}
