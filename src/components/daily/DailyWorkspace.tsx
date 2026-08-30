"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type {
  DailyGoalDto,
  DailyNoteDto,
  DailyTaskDto,
  DailyWorkspaceDto,
} from "@/core/daily/service";
import { fieldErrorsFromUnknown, workspaceFetch } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Field,
  Input,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

type EditorKind = "note" | "goal" | "task";

type NoteForm = { title: string; body: string };
type GoalForm = { title: string; dueAt: string; status: "open" | "done" };
type TaskForm = { title: string; notes: string; dueAt: string; status: "open" | "done" };

const emptyNote: NoteForm = { title: "", body: "" };
const emptyGoal: GoalForm = { title: "", dueAt: "", status: "open" };
const emptyTask: TaskForm = { title: "", notes: "", dueAt: "", status: "open" };

function resolveTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatInZone(iso: string, timeZone: string) {
  return new Date(iso).toLocaleString(undefined, {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function DailyWorkspaceInner(): React.JSX.Element {
  const { isSignedIn } = useAuth();
  const toast = useToast();
  const timezone = useMemo(() => resolveTimezone(), []);
  const [workspace, setWorkspace] = useState<DailyWorkspaceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [editor, setEditor] = useState<EditorKind | null>(null);
  const [editingNote, setEditingNote] = useState<DailyNoteDto | null>(null);
  const [editingGoal, setEditingGoal] = useState<DailyGoalDto | null>(null);
  const [editingTask, setEditingTask] = useState<DailyTaskDto | null>(null);
  const [noteForm, setNoteForm] = useState(emptyNote);
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!isSignedIn) return;
      const response = (await workspaceFetch(
        `/api/daily/workspace?timezone=${encodeURIComponent(timezone)}`,
        { method: "GET" },
        signal,
      )) as { data?: { workspace?: DailyWorkspaceDto } };
      setWorkspace(response.data?.workspace ?? null);
      setError(null);
      setLoading(false);
    },
    [isSignedIn, timezone],
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

  function closeEditor() {
    setEditor(null);
    setEditingNote(null);
    setEditingGoal(null);
    setEditingTask(null);
    setNoteForm(emptyNote);
    setGoalForm(emptyGoal);
    setTaskForm(emptyTask);
    setFormError(null);
  }

  function openNote(note?: DailyNoteDto) {
    setEditingNote(note ?? null);
    setNoteForm(note ? { title: note.title, body: note.body } : emptyNote);
    setEditor("note");
  }

  function openGoal(goal?: DailyGoalDto) {
    setEditingGoal(goal ?? null);
    setGoalForm(
      goal
        ? { title: goal.title, dueAt: toLocalInput(goal.dueAt), status: goal.status === "done" ? "done" : "open" }
        : emptyGoal,
    );
    setEditor("goal");
  }

  function openTask(task?: DailyTaskDto) {
    setEditingTask(task ?? null);
    setTaskForm(
      task
        ? {
            title: task.title,
            notes: task.notes ?? "",
            dueAt: toLocalInput(task.dueAt),
            status: task.status === "done" ? "done" : "open",
          }
        : emptyTask,
    );
    setEditor("task");
  }

  async function submitEditor() {
    setSubmitting(true);
    setFormError(null);
    try {
      if (editor === "note") {
        if (editingNote) {
          await workspaceFetch(`/api/daily/notes/${editingNote.id}`, {
            method: "PATCH",
            body: JSON.stringify(noteForm),
          });
        } else {
          await workspaceFetch("/api/daily/notes", {
            method: "POST",
            body: JSON.stringify(noteForm),
          });
        }
      } else if (editor === "goal") {
        const payload = {
          title: goalForm.title,
          status: goalForm.status,
          dueAt: goalForm.dueAt ? new Date(goalForm.dueAt).toISOString() : null,
        };
        if (editingGoal) {
          await workspaceFetch(`/api/daily/goals/${editingGoal.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          await workspaceFetch("/api/daily/goals", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
      } else if (editor === "task") {
        const payload = {
          title: taskForm.title,
          notes: taskForm.notes,
          status: taskForm.status,
          dueAt: taskForm.dueAt ? new Date(taskForm.dueAt).toISOString() : null,
        };
        if (editingTask) {
          await workspaceFetch(`/api/daily/tasks/${editingTask.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          await workspaceFetch("/api/daily/tasks", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
      }
      closeEditor();
      await load();
    } catch (caught) {
      const fields = fieldErrorsFromUnknown(caught);
      setFormError(caught instanceof Error ? caught.message : "Unable to save.");
      if (Object.keys(fields).length > 0) {
        setFormError(Object.values(fields)[0] ?? "Unable to save.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(kind: EditorKind, id: string) {
    try {
      await workspaceFetch(`/api/daily/${kind === "note" ? "notes" : kind === "goal" ? "goals" : "tasks"}/${id}`, {
        method: "DELETE",
      });
      await load();
    } catch (caught) {
      toast.error("Could not delete", {
        description: caught instanceof Error ? caught.message : "The item was not removed.",
      });
    }
  }

  async function toggleGoal(goal: DailyGoalDto) {
    await workspaceFetch(`/api/daily/goals/${goal.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: goal.status === "done" ? "open" : "done" }),
    });
    await load();
  }

  async function toggleTask(task: DailyTaskDto) {
    await workspaceFetch(`/api/daily/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: task.status === "done" ? "open" : "done" }),
    });
    await load();
  }

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: timezone,
      }),
    [timezone],
  );

  return (
    <WorkspaceShell
      product="Daily"
      href="/products/daily"
      accent="cyan"
      title="Aila Daily"
      description="Your everyday workspace from stored notes, goals, tasks, calendar, conversations, and campaigns."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <>
          <Button type="button" variant="secondary" onClick={() => openTask()}>
            <Plus className="mr-2 h-4 w-4" />
            Task
          </Button>
          <Button type="button" variant="secondary" onClick={() => openGoal()}>
            <Plus className="mr-2 h-4 w-4" />
            Goal
          </Button>
          <Button type="button" onClick={() => openNote()}>
            <Plus className="mr-2 h-4 w-4" />
            Note
          </Button>
        </>
      }
    >
      {workspace ? (
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/8 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">{todayLabel}</p>
            <p className="mt-3 text-lg text-white/80">{workspace.briefing}</p>
            <p className="mt-2 text-sm text-white/45">Timezone: {workspace.timezone}</p>
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm text-white/55">
                <span>Goal progress</span>
                <span>
                  {workspace.goalProgress.done}/{workspace.goalProgress.total} done
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-cyan-300"
                  style={{ width: `${workspace.goalProgress.percent}%` }}
                />
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Today&apos;s agenda</h2>
                <Link href="/products/calendar" className="text-xs uppercase tracking-[0.16em] text-white/40">
                  Calendar
                </Link>
              </div>
              {workspace.todayEvents.length === 0 ? (
                <EmptyState
                  className="mt-6"
                  title="No events today"
                  description="Nothing on your calendar overlaps this civil day."
                />
              ) : (
                <ul className="mt-4 space-y-3">
                  {workspace.todayEvents.map((event) => (
                    <li key={event.id} className="rounded-2xl border border-white/8 p-4">
                      <p className="font-medium">{event.title}</p>
                      <p className="mt-1 text-sm text-white/50">
                        {formatInZone(event.startsAt, timezone)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {workspace.upcomingEvents.length > 0 ? (
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">Upcoming</p>
                  <ul className="mt-3 space-y-2">
                    {workspace.upcomingEvents.map((event) => (
                      <li key={event.id} className="text-sm text-white/70">
                        {event.title} · {formatInZone(event.startsAt, timezone)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <h2 className="text-lg font-medium">Tasks</h2>
              {workspace.tasks.length === 0 ? (
                <EmptyState
                  className="mt-6"
                  title="No tasks yet"
                  description="Create a task to keep Daily planning on your account."
                  action={<Button onClick={() => openTask()}>Add task</Button>}
                />
              ) : (
                <ul className="mt-4 space-y-3">
                  {workspace.tasks.map((task) => (
                    <li key={task.id} className="rounded-2xl border border-white/8 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={task.status === "done" ? "text-white/45 line-through" : "font-medium"}>
                            {task.title}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">
                            {workspace.overdueTaskIds.includes(task.id) ? "Overdue" : task.status}
                            {task.dueAt ? ` · ${formatInZone(task.dueAt, timezone)}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="secondary" onClick={() => void toggleTask(task)}>
                            {task.status === "done" ? "Reopen" : "Done"}
                          </Button>
                          <Button type="button" variant="secondary" onClick={() => openTask(task)}>
                            Edit
                          </Button>
                          <Button type="button" variant="secondary" onClick={() => void remove("task", task.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <h2 className="text-lg font-medium">Goals</h2>
              {workspace.goals.length === 0 ? (
                <EmptyState
                  className="mt-6"
                  title="No goals yet"
                  description="Save a goal so Daily can track progress on your account."
                  action={<Button onClick={() => openGoal()}>Add goal</Button>}
                />
              ) : (
                <ul className="mt-4 space-y-3">
                  {workspace.goals.map((goal) => (
                    <li key={goal.id} className="rounded-2xl border border-white/8 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={goal.status === "done" ? "text-white/45 line-through" : "font-medium"}>
                            {goal.title}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">
                            {goal.status}
                            {goal.dueAt ? ` · ${formatInZone(goal.dueAt, timezone)}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="secondary" onClick={() => void toggleGoal(goal)}>
                            {goal.status === "done" ? "Reopen" : "Done"}
                          </Button>
                          <Button type="button" variant="secondary" onClick={() => openGoal(goal)}>
                            Edit
                          </Button>
                          <Button type="button" variant="secondary" onClick={() => void remove("goal", goal.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <h2 className="text-lg font-medium">Notes</h2>
              {workspace.notes.length === 0 ? (
                <EmptyState
                  className="mt-6"
                  title="No notes yet"
                  description="Write a note. It is stored on your account and used in Daily planning."
                  action={<Button onClick={() => openNote()}>Add note</Button>}
                />
              ) : (
                <ul className="mt-4 space-y-3">
                  {workspace.notes.map((note) => (
                    <li key={note.id} className="rounded-2xl border border-white/8 p-4">
                      <p className="font-medium">{note.title}</p>
                      {note.body ? <p className="mt-2 whitespace-pre-wrap text-sm text-white/60">{note.body}</p> : null}
                      <div className="mt-3 flex gap-2">
                        <Button type="button" variant="secondary" onClick={() => openNote(note)}>
                          Edit
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => void remove("note", note.id)}>
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="text-lg font-medium">Recent activity</h2>
            {workspace.activity.length === 0 ? (
              <EmptyState
                className="mt-6"
                title="No recent activity"
                description="Notes, goals, tasks, conversations, documents, and campaigns appear here after you use them."
              />
            ) : (
              <ul className="mt-4 divide-y divide-white/8">
                {workspace.activity.map((item) => (
                  <li key={`${item.kind}-${item.id}`} className="py-3">
                    <Link href={item.href} className="flex items-center justify-between gap-3 text-sm">
                      <span>
                        <span className="uppercase tracking-[0.16em] text-white/35">{item.kind}</span>
                        <span className="ml-3 text-white/80">{item.title}</span>
                      </span>
                      <span className="text-white/40">{formatInZone(item.at, timezone)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            <LinkList title="Conversations" empty="No stored conversations." items={workspace.conversations} />
            <LinkList title="Documents" empty="No stored documents." items={workspace.documents} />
            <LinkList title="Campaigns" empty="No stored ad campaigns." items={workspace.campaigns} />
          </div>

          <section className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="text-lg font-medium">Daily planning</h2>
            <p className="mt-2 text-sm text-white/50">
              Aila uses your stored Daily data. It can help plan the day, but it does not invent events or mark work done unless you save it.
            </p>
            <div className="mt-5">
              <ChatInterface
                mode="daily"
                containerClassName="h-[560px]"
                messagesHeight="h-[360px]"
                headerSubtitle="Planning assistant for your stored Daily workspace"
              />
            </div>
          </section>
        </div>
      ) : null}

      <Dialog open={editor !== null} onOpenChange={(open) => (!open ? closeEditor() : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editor === "note" ? (editingNote ? "Edit note" : "New note") : null}
              {editor === "goal" ? (editingGoal ? "Edit goal" : "New goal") : null}
              {editor === "task" ? (editingTask ? "Edit task" : "New task") : null}
            </DialogTitle>
            <DialogDescription>
              Saved on your account. Other users cannot see this.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            {editor === "note" ? (
              <>
                <Field label="Title">
                  <Input value={noteForm.title} onChange={(event) => setNoteForm({ ...noteForm, title: event.target.value })} />
                </Field>
                <Field label="Body">
                  <Textarea value={noteForm.body} onChange={(event) => setNoteForm({ ...noteForm, body: event.target.value })} />
                </Field>
              </>
            ) : null}
            {editor === "goal" ? (
              <>
                <Field label="Title">
                  <Input value={goalForm.title} onChange={(event) => setGoalForm({ ...goalForm, title: event.target.value })} />
                </Field>
                <Field label="Due">
                  <Input type="datetime-local" value={goalForm.dueAt} onChange={(event) => setGoalForm({ ...goalForm, dueAt: event.target.value })} />
                </Field>
                <Field label="Status">
                  <select
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm"
                    value={goalForm.status}
                    onChange={(event) => setGoalForm({ ...goalForm, status: event.target.value === "done" ? "done" : "open" })}
                  >
                    <option value="open">Open</option>
                    <option value="done">Done</option>
                  </select>
                </Field>
              </>
            ) : null}
            {editor === "task" ? (
              <>
                <Field label="Title">
                  <Input value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} />
                </Field>
                <Field label="Notes">
                  <Textarea value={taskForm.notes} onChange={(event) => setTaskForm({ ...taskForm, notes: event.target.value })} />
                </Field>
                <Field label="Due">
                  <Input type="datetime-local" value={taskForm.dueAt} onChange={(event) => setTaskForm({ ...taskForm, dueAt: event.target.value })} />
                </Field>
                <Field label="Status">
                  <select
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm"
                    value={taskForm.status}
                    onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value === "done" ? "done" : "open" })}
                  >
                    <option value="open">Open</option>
                    <option value="done">Done</option>
                  </select>
                </Field>
              </>
            ) : null}
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={closeEditor}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void submitEditor()} disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}

function LinkList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: Array<{ id: string; title: string; href: string }>;
}) {
  return (
    <section className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
      <h2 className="text-lg font-medium">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-white/45">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="text-sm text-white/75 hover:text-white">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function DailyWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <DailyWorkspaceInner />
    </ToastProvider>
  );
}
